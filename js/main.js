// js/main.js
// 存在终端 Terminal of Being — 入口文件 (v6.2 架构拆分)
// 职责: 组装各模块 + 主循环调度 + UI 绑定
// 渲染 → core/renderer.js    HUD → ui/hud.js
// 遭遇 → systems/encounter.js  伤害 → systems/combat.js

import { state, initialState, setState } from './core/state.js';
import { loadGame, saveGame } from './core/save.js';
import {
  world, PLAYER_X, PLAYER_Y, CANVAS_W, CANVAS_H, SCROLL_SPEED,
} from './core/world.js';
import {
  hitEnemy, getTimeScale,
  damageEnemy, damagePlayer,
} from './systems/combat.js';
import { generateItem, dropMessage } from './systems/loot.js';
import { recalcStats } from './systems/stats.js';
import { initInventoryUI, renderPanel } from './ui/inventory.js';
import { initCodexUI } from './ui/codex.js';
import {
  registerCallbacks as registerEncounterCallbacks,
  startWave, onEnemyDeath, updateDrops, onPlayerDeath, spawnHitParticle, endWave,
} from './systems/encounter.js';
import { render } from './core/renderer.js';
import {
  registerGetStats, updateHUD, refreshHUDLabels, log,
} from './ui/hud.js';
import { DROP_LIFETIME } from './data/constants.js';
import {
  getFinalStats,
} from './systems/effects.js';
import { getWeaponType } from './data/weaponTypes.js';

// ============================================================
// 初始化
// ============================================================
function init() {
  // 存档
  if (!loadGame()) setState(initialState());
  recalcStats();
  syncPlayerStats();

  // Canvas
  world.canvas = document.getElementById('combat-canvas');
  world.ctx = world.canvas.getContext('2d');
  world.canvas.width = CANVAS_W;
  world.canvas.height = CANVAS_H;
  world.lastTime = performance.now();
  world.scrollDistance = 0;

  // 注入回调(避免循环依赖)
  registerGetStats(getFinalStats);
  registerEncounterCallbacks(log, syncPlayerStats);

  // 启动
  startWave();
  bindUI();
  refreshHUDLabels();
  initInventoryUI();
  initCodexUI();
  requestAnimationFrame(loop);
}

function syncPlayerStats() {
  const s = getFinalStats();
  const p = state.player;
  p.maxHp = Math.floor(s.maxHp);
  p.maxMp = Math.floor(s.maxMp);
  p.atk = s.atk;
  p.def = s.def;
  p.aspd = s.aspd;
  p.crit = s.crit;
  p.critDmg = s.critDmg;
  p.dodge = s.dodge;
  p.block = s.block;
  p.luck = s.luck;
  p.itemFind = s.itemFind;
  p.rarityFind = s.rarityFind;
  p.expGain = s.expGain;
  p.goldGain = s.goldGain;
  p.lifesteal = s.lifesteal;
  p.cooldownRed = s.cooldownRed;
  if (p.hp > p.maxHp) p.hp = p.maxHp;
}

// ============================================================
// 主循环
// ============================================================
function loop(now) {
  try {
  const rawDelta = Math.min(now - world.lastTime, 100);
  world.lastTime = now;
  const timeScale = getTimeScale();
  const delta = rawDelta * timeScale;
  const stats = getFinalStats();

  // 卷轴推进(仅无怪时)
  const inCombat = world.waveState === 'combat' || world.enemies.length > 0;
  const scrollDelta = inCombat ? 0 : SCROLL_SPEED * (delta / 1000);
  world.scrollDistance += scrollDelta;

  // ── 玩家射击 (v7.1 武器特有攻击类型) ──
  world.playerShootTimer += delta;
  const weapon = state.equipment && state.equipment.weapon;
  const wt = getWeaponType((weapon && weapon.attackType) || 'thought');
  const shootInterval = (1000 / stats.aspd);

  if (world.playerShootTimer >= shootInterval) {
    const inRange = world.enemies.some(e => !e.dead && e.x - PLAYER_X > -10 && e.x - PLAYER_X < 400);
    if (inRange) {
      world.playerShotCount = (world.playerShotCount || 0) + 1;
      let count = wt.projCount;
      let spread = wt.projSpread;
      let dmgMul = wt.projDamageMul;

      // 间隔发射：每 N 次射击触发多枚（"思"的 3-way 思考波）
      if (wt.intervalShots > 1 && world.playerShotCount % wt.intervalShots === 0) {
        count = wt.intervalCount;
        spread = wt.intervalSpread;
      }

      for (let i = 0; i < count; i++) {
        const angle = count > 1 ? (i - (count - 1) / 2) * spread : 0;
        world.projectiles.push({
          x: PLAYER_X + 14,
          y: PLAYER_Y,
          vx: wt.projSpeed * Math.cos(angle),
          vy: wt.projSpeed * Math.sin(angle),
          dmg: stats.atk * dmgMul,
          dead: false,
          symbol: wt.projSymbol,
          color: wt.projColor,
          pierce: wt.projPierce || false,
          pierced: new Set(),
        });
      }
    }
    world.playerShootTimer = 0;
  }

  // ── 玩家近战 ──
  world.playerMeleeTimer += delta;
  if (world.playerMeleeTimer >= 400) {
    for (const enemy of world.enemies) {
      if (enemy.dead) continue;
      if (Math.abs(enemy.x - PLAYER_X) < 60) {
        const enemyHpPct = enemy.hp / Math.max(1, enemy.maxHp || 100);
        const isCrit = Math.random() < stats.crit;
        const dmg = damageEnemy(enemy, stats.atk * 0.7, isCrit, stats.critDmg, stats.lifesteal, enemyHpPct);
        hitEnemy(enemy, dmg, isCrit);
        if (enemy.hp <= 0 && !enemy.dying) {
          enemy.dying = true;
          onEnemyDeath(enemy);
        }
      }
    }
    world.playerMeleeTimer = 0;
  }

  // ── 波间休息 ──
  if (world.waveState !== 'combat') {
    world.waveTimer += delta;
    if (world.drops.length === 0 && world.waveTimer > 2000) startWave();
  }

  // ── 敌人推进 + AI ──
  for (const enemy of world.enemies) {
    if (enemy.dead) continue;
    if (enemy.dying) {
      enemy.dyingTimer -= delta;
      enemy.dyingAlpha = Math.max(0, enemy.dyingTimer / 400);
      enemy.x += enemy.vx * (delta / 1000);
      enemy.y += enemy.vy * (delta / 1000);
      enemy.vx *= 0.85; enemy.vy *= 0.85;
      if (enemy.dyingTimer <= 0) enemy.dead = true;
      continue;
    }
    if (enemy.hitStun > 0) {
      enemy.hitStun -= rawDelta;
    } else {
      enemy.x -= enemy.baseSpeed * (delta / 1000);
    }
    enemy.x += enemy.vx * (delta / 1000);
    enemy.vx *= 0.85;
    enemy.x -= scrollDelta;

    // 被卷轴抛出
    if (enemy.x < -30) {
      enemy.dead = true;
      const exp = 2 * Math.pow(state.stage, 1.15);
      state.player.exp += exp;
      log(`[存在卷轴] ${enemy.name} 被抛入不可追溯的过去`);
      world.waveEnemiesLeft -= 1;
      if (world.waveEnemiesLeft <= 0 && world.waveState === 'combat') endWave();
      continue;
    }

    // 攻击玩家
    if (Math.abs(enemy.x - PLAYER_X) < 60) {
      if (enemy.hitStun <= 0) enemy.x += enemy.baseSpeed * (delta / 1000);
      enemy.attackCooldown -= delta / 1000;
      if (enemy.attackCooldown <= 0) {
        damagePlayer(enemy, stats.dodge, stats.def);
        enemy.attackCooldown = 1 / enemy.aspd;
        enemy.vx = 100;
      }
    }
  }

  // ── 投射物 (v7.1 穿透弹支持) ──
  for (const proj of world.projectiles) {
    if (proj.dead) continue;
    proj.x += proj.vx * (delta / 1000);
    proj.x -= scrollDelta;
    proj.y += (proj.vy || 0) * (delta / 1000);
    for (const enemy of world.enemies) {
      if (enemy.dead) continue;
      if (Math.hypot(proj.x - enemy.x, proj.y - enemy.y) < 20) {
        // 穿透弹：跳过已命中的敌人
        if (proj.pierce && proj.pierced.has(enemy)) continue;

        const enemyHpPct = enemy.hp / Math.max(1, enemy.maxHp || 100);
        const isCrit = Math.random() < stats.crit;
        const dmg = damageEnemy(enemy, proj.dmg, isCrit, stats.critDmg, stats.lifesteal, enemyHpPct);
        hitEnemy(enemy, dmg, isCrit);
        spawnHitParticle(proj.x, proj.y);
        if (proj.pierce) {
          proj.pierced.add(enemy);
        } else {
          proj.dead = true;
        }
        if (enemy.hp <= 0 && !enemy.dying) {
          enemy.dying = true;
          onEnemyDeath(enemy);
        }
        if (!proj.pierce) break;
      }
    }
    if (proj.x > CANVAS_W + 30 || proj.x < -30) proj.dead = true;
  }

  // ── 掉落物更新 ──
  updateDrops(delta);
  for (const drop of world.drops) {
    if (drop.dead) continue;
    drop.x -= scrollDelta;
    if (drop.x < -50) drop.dead = true;
  }

  // ── 血渣 + 粒子 + 飘字物理 ──
  for (const g of world.gore) {
    if (!g.landed) {
      g.vy += 800 * (delta / 1000);
      g.x += g.vx * (delta / 1000);
      g.y += g.vy * (delta / 1000);
      if (g.y >= 280 - 4) { g.y = 280 - 4; g.vy = 0; g.vx = 0; g.landed = true; }
    }
    g.x -= scrollDelta;
    g.life -= delta;
  }
  for (const p of world.particles) {
    p.x += p.vx * (delta / 1000);
    p.y += p.vy * (delta / 1000);
    p.vy += 200 * (delta / 1000);
    p.x -= scrollDelta;
    p.life -= delta;
  }
  for (const t of world.damageTexts) {
    t.y -= 40 * (delta / 1000);
    t.x -= scrollDelta;
    t.life -= delta;
  }

  // ── 清理 ──
  world.enemies = world.enemies.filter(e => !e.dead);
  world.projectiles = world.projectiles.filter(p => !p.dead);
  world.particles = world.particles.filter(p => p.life > 0);
  world.damageTexts = world.damageTexts.filter(t => t.life > 0);
  world.drops = world.drops.filter(d => !d.dead);
  world.gore = world.gore.filter(g => g.life > 0);

  // ── 玩家死亡 ──
  if (state.player.hp <= 0) onPlayerDeath();

  // ── 渲染 + HUD ──
  render(now);
  updateHUD();

  requestAnimationFrame(loop);
  } catch (e) {
    console.error('[崩溃]', e.message, '行:', e.lineNumber, '\n', e.stack);
  }
}

// ============================================================
// UI 绑定
// ============================================================
function bindUI() {
  document.getElementById('btn-save').onclick = () => { saveGame(); log('[系统] 存在状态已锚定'); };
  document.getElementById('btn-clear').onclick = () => {
    if (confirm('清空存档?')) { localStorage.removeItem('terminal_of_being_save_v1'); location.reload(); }
  };
  // 术语切换按钮
  const btnTerms = document.getElementById('btn-terms');
  btnTerms.onclick = () => {
    state.settings.usePlainTerms = !state.settings.usePlainTerms;
    btnTerms.innerHTML = `<kbd>T</kbd> ${state.settings.usePlainTerms ? '[terms] 术语' : '[terms] 哲学'}`;
    btnTerms.title = state.settings.usePlainTerms
      ? '当前: 游戏术语模式 — 点击切换为哲学术语'
      : '当前: 哲学术语模式 — 点击切换为游戏术语';
    refreshHUDLabels();
  };
  document.getElementById('btn-test-drop').onclick = () => {
    const item = generateItem(state.stage, state.stage % 10 === 0 ? 'boss' : state.stage % 5 === 0 ? 'elite' : 'normal');
    if (!item) { log('[系统] 当前层数无可用装备模板'); return; }
    world.drops.push({
      x: PLAYER_X + 200, y: PLAYER_Y - 60,
      vx: 0, vy: 0,
      item, landed: false, dead: false, life: DROP_LIFETIME,
    });
    log(`[现象凝结] ${dropMessage(item)}`);
  };
  setInterval(saveGame, 10000);
}

// ============================================================
// 启动
// ============================================================
init();
