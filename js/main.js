// js/main.js
// 存在终端 Terminal of Being — 入口文件 (v6.2 架构拆分)
// v8.2 — 合并 import + 魔法数字抽常量 + filter→splice + init 错误边界 + confirm→自定义弹窗
// 职责: 组装各模块 + 主循环调度 + UI 绑定
// 渲染 → core/renderer.js    HUD → ui/hud.js
// 遭遇 → systems/encounter.js  伤害 → systems/combat.js

import { state, initialState, mergeState } from './core/state.js';
import { loadGame, saveGame } from './core/save.js';
import {
  world, PLAYER_X, PLAYER_Y, GROUND_Y, updateWorldSize, SCROLL_SPEED,
} from './core/world.js';
import {
  hitEnemy, getTimeScale, damageEnemy, damagePlayer,
  registerCombatLog, flushBossDamageBuffer, updateShake,
} from './systems/combat.js';
import { generateItem, dropMessage } from './systems/loot.js';
import { recalcStats } from './systems/stats.js';
import { initInventoryUI, renderPanel } from './ui/inventory.js';
import { initCodexUI } from './ui/codex.js';
import {
  registerCallbacks as registerEncounterCallbacks,
  startWave, onEnemyDeath, updateDrops, onPlayerDeath, spawnHitParticle, endWave,
  updateEnemyAI,
} from './systems/encounter.js';
import { render, initBg } from './core/renderer.js';
import {
  registerGetStats, updateHUD, refreshHUDLabels, log,
} from './ui/hud.js';
import {
  DROP_LIFETIME, AUTO_SAVE_INTERVAL,
  MELEE_RANGE, MELEE_INTERVAL, RANGED_RANGE, WAVE_REST_MIN_MS,
  ENEMY_CULL_X, PROJECTILE_HIT_RADIUS, PROJECTILE_CULL_X, DROP_CULL_X,
  PARTICLE_GRAVITY, GORE_GRAVITY, DAMAGE_TEXT_RISE_SPEED,
  DYING_TIMER_MS,
} from './data/constants.js';
import {
  getFinalStats,
} from './systems/effects.js';
import { getWeaponType } from './data/weaponTypes.js';
import { initDebugUI } from './ui/debug.js';
import { initStatPointsUI, hasUnspentPoints } from './ui/statPoints.js';

// ============================================================
// 自定义确认弹窗（替代 confirm()）
// ============================================================
function customConfirm(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirm-modal');
    const msgEl = document.getElementById('confirm-message');
    const okBtn = document.getElementById('confirm-ok');
    const cancelBtn = document.getElementById('confirm-cancel');
    if (!modal || !msgEl || !okBtn || !cancelBtn) {
      // 降级：如果 DOM 不存在，用 confirm
      resolve(confirm(message));
      return;
    }
    msgEl.textContent = message;
    modal.style.display = 'flex';

    const cleanup = () => {
      modal.style.display = 'none';
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
    };
    const onOk = () => { cleanup(); resolve(true); };
    const onCancel = () => { cleanup(); resolve(false); };
    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
  });
}

// ============================================================
// 自动保存 interval（可清理）
// ============================================================
let _saveIntervalId = null;

// ============================================================
// Canvas 尺寸同步 — 战斗区填满可用空间
// ============================================================
function updateCanvasSize() {
  const combat = document.getElementById('combat');
  const cvs = world.canvas;
  if (!combat || !cvs) return;
  const rect = combat.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  // 使用整数尺寸，避免子像素模糊
  const w = Math.floor(rect.width * dpr);
  const h = Math.floor(rect.height * dpr);
  if (cvs.width !== w || cvs.height !== h) {
    cvs.width = w;
    cvs.height = h;
    cvs.style.width = '100%';
    cvs.style.height = '100%';
    updateWorldSize();
    initBg();
  }
}

// ============================================================
// 动态布局 — 根据屏幕高度调整日志区高度
// ============================================================
function fitLayout() {
  const h = window.innerHeight;
  const log = document.getElementById('log');
  if (!log) return;
  if (h < 700) {
    log.style.height = '110px';
  } else if (h < 850) {
    log.style.height = '140px';
  } else {
    log.style.height = '170px';
  }
}

// ============================================================
// 初始化
// ============================================================
function init() {
  // 存档
  if (!loadGame()) mergeState(initialState());
  recalcStats();
  syncPlayerStats();

  // Canvas — 填满战斗区，像素尺寸 = CSS 尺寸
  world.canvas = document.getElementById('combat-canvas');
  world.ctx = world.canvas.getContext('2d');
  updateCanvasSize();
  fitLayout();
  window.addEventListener('resize', () => { updateCanvasSize(); fitLayout(); });
  world.lastTime = performance.now();
  world.scrollDistance = 0;

  // 注入回调(避免循环依赖)
  registerGetStats(getFinalStats);
  registerEncounterCallbacks(log, syncPlayerStats);
  registerCombatLog(log);

  // 启动
  startWave();
  bindUI();
  refreshHUDLabels();
  initInventoryUI();
  initCodexUI();
  initDebugUI();
  initStatPointsUI(syncPlayerStats, log);
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

  // 统觉伤害合并刷新
  flushBossDamageBuffer(now);

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
    const inRange = world.enemies.some(e => !e.dead && e.x - PLAYER_X > -10 && e.x - PLAYER_X < RANGED_RANGE);
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
  if (world.playerMeleeTimer >= MELEE_INTERVAL) {
    for (const enemy of world.enemies) {
      if (enemy.dead) continue;
      if (Math.abs(enemy.x - PLAYER_X) < MELEE_RANGE) {
        const enemyHpPct = enemy.hp / Math.max(1, enemy.maxHp || 100);
        const isCrit = Math.random() < stats.crit;
        const dmg = damageEnemy(enemy, stats.atk * 0.7, isCrit, stats.critDmg, stats.lifesteal, enemyHpPct);
        hitEnemy(enemy, dmg, isCrit);
        if (enemy.hp <= 0 && !enemy.dying) {
          enemy.dying = true;
          enemy.dyingTimer = DYING_TIMER_MS;
          onEnemyDeath(enemy);
        }
      }
    }
    world.playerMeleeTimer = 0;
  }

  // ── 波间休息 ──
  if (world.waveState !== 'combat') {
    world.waveTimer += delta;
    if (world.drops.length === 0 && world.waveTimer > WAVE_REST_MIN_MS) startWave();
  }

  // ── 敌人推进 + AI ──
  for (const enemy of world.enemies) {
    if (enemy.dead) continue;
    if (enemy.dying) {
      enemy.dyingTimer -= delta;
      enemy.dyingAlpha = Math.max(0, enemy.dyingTimer / DYING_TIMER_MS);
      enemy.x += enemy.vx * (delta / 1000);
      enemy.y += enemy.vy * (delta / 1000);
      enemy.vx *= 0.85; enemy.vy *= 0.85;
      if (enemy.dyingTimer <= 0) enemy.dead = true;
      continue;
    }
    // Mechanics AI 解析（ranged/charger/splitter/shield_regen）
    updateEnemyAI(enemy, delta, stats);
    if (enemy.hitStun > 0) {
      enemy.hitStun -= delta;
    } else if (!enemy._stopForRanged) {
      enemy.x -= enemy.baseSpeed * (delta / 1000);
    }
    enemy.x += enemy.vx * (delta / 1000);
    enemy.vx *= 0.85;
    enemy.x -= scrollDelta;

    // 被卷轴抛出 — 等同于击杀，走完整的 onEnemyDeath 流程
    if (enemy.x < ENEMY_CULL_X) {
      enemy.dying = true;
      enemy.dyingTimer = DYING_TIMER_MS;
      enemy.scrollCulled = true;
      log(`[存在卷轴] ${enemy.name} 被抛入不可追溯的过去`);
      onEnemyDeath(enemy);
      continue;
    }

    // 攻击玩家
    if (Math.abs(enemy.x - PLAYER_X) < MELEE_RANGE) {
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
    // 敌方弹丸不碰撞敌人（由 ranged AI 发射，将来做玩家碰撞检测）
    if (proj.isEnemyProjectile) {
      if (proj.x > (world.canvas?.width || 800) + PROJECTILE_CULL_X || proj.x < -PROJECTILE_CULL_X) proj.dead = true;
      continue;
    }
    for (const enemy of world.enemies) {
      if (enemy.dead) continue;
      if (Math.hypot(proj.x - enemy.x, proj.y - enemy.y) < PROJECTILE_HIT_RADIUS) {
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
          enemy.dyingTimer = DYING_TIMER_MS;
          onEnemyDeath(enemy);
        }
        if (!proj.pierce) break;
      }
    }
    if (proj.x > (world.canvas?.width || 800) + PROJECTILE_CULL_X || proj.x < -PROJECTILE_CULL_X) proj.dead = true;
  }

  // ── 掉落物更新 ──
  updateDrops(delta);
  for (const drop of world.drops) {
    if (drop.dead) continue;
    drop.x -= scrollDelta;
    if (drop.x < DROP_CULL_X) drop.dead = true;
  }

  // ── 血渣 + 粒子 + 飘字物理 ──
  for (const g of world.gore) {
    if (!g.landed) {
      g.vy += GORE_GRAVITY * (delta / 1000);
      g.x += g.vx * (delta / 1000);
      g.y += g.vy * (delta / 1000);
      if (g.y >= GROUND_Y - 4) { g.y = GROUND_Y - 4; g.vy = 0; g.vx = 0; g.landed = true; }
    }
    g.x -= scrollDelta;
    g.life -= delta;
  }
  for (const p of world.particles) {
    p.x += p.vx * (delta / 1000);
    p.y += p.vy * (delta / 1000);
    p.vy += PARTICLE_GRAVITY * (delta / 1000);
    p.x -= scrollDelta;
    p.life -= delta;
  }
  for (const t of world.damageTexts) {
    t.y -= DAMAGE_TEXT_RISE_SPEED * (delta / 1000);
    t.x -= scrollDelta;
    t.life -= delta;
  }

  // ── 清理（原地 splice 替代 filter，避免每帧创建新数组） ──
  inPlaceCleanup(world.enemies, e => !e.dead);
  inPlaceCleanup(world.projectiles, p => !p.dead);
  inPlaceCleanup(world.particles, p => p.life > 0);
  inPlaceCleanup(world.damageTexts, t => t.life > 0);
  inPlaceCleanup(world.drops, d => !d.dead);
  inPlaceCleanup(world.gore, g => g.life > 0);

  // ── 玩家死亡 ──
  if (state.player.hp <= 0) onPlayerDeath();

  // ── 震动衰减 + 渲染 + HUD ──
  updateShake(delta);
  render(now);
  updateHUD();
  // 更新天赋点数角标
  const badge = document.getElementById('sp-badge');
  if (badge) {
    const pts = state.player.statPoints || 0;
    if (pts > 0) { badge.textContent = pts; badge.style.display = 'inline-block'; }
    else { badge.style.display = 'none'; }
  }
  } catch (e) {
    // 每 5 秒最多报一次错，避免刷屏
    const now2 = Date.now();
    if (!world._lastErrorTime || now2 - world._lastErrorTime > 5000) {
      world._lastErrorTime = now2;
      console.error('[游戏异常]', e.message, '\n', e.stack);
      log(`[系统] 异常: ${e.message}`);
    }
  }
  requestAnimationFrame(loop);
}

/**
 * 原地清理数组 — 替代 filter() 避免每帧创建新数组
 * @param {Array} arr - 要清理的数组
 * @param {(item) => boolean} keepFn - 返回 true 的元素保留
 */
function inPlaceCleanup(arr, keepFn) {
  let writeIdx = 0;
  for (let i = 0; i < arr.length; i++) {
    if (keepFn(arr[i])) {
      arr[writeIdx++] = arr[i];
    }
  }
  arr.length = writeIdx;
}

// ============================================================
// UI 绑定
// ============================================================
function bindUI() {
  document.getElementById('btn-save').onclick = () => { saveGame(); log('[系统] 存在状态已锚定'); };

  // 术语切换按钮
  const btnTerms = document.getElementById('btn-terms');
  if (btnTerms) {
    btnTerms.onclick = () => {
      state.settings.usePlainTerms = !state.settings.usePlainTerms;
      const cmdSpan = btnTerms.querySelector('.cmd');
      if (cmdSpan) cmdSpan.textContent = state.settings.usePlainTerms ? 'PLAIN' : 'TERMS';
      refreshHUDLabels();
    };
  }

  // 全局 ESC — 关闭任何打开的浮层面板
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      for (const panel of document.querySelectorAll('.overlay-panel.show')) {
        panel.classList.remove('show');
      }
    }
  });

  _saveIntervalId = setInterval(() => {
    saveGame();
    // 自动保存视觉反馈：标题栏短暂闪烁
    const header = document.getElementById('terminal-header');
    if (header) {
      header.style.textShadow = '0 0 8px rgba(255,255,255,0.6)';
      setTimeout(() => { header.style.textShadow = ''; }, 500);
    }
  }, AUTO_SAVE_INTERVAL);

  // 页面卸载时清理 interval
  window.addEventListener('beforeunload', () => {
    if (_saveIntervalId) clearInterval(_saveIntervalId);
  });
}

// ============================================================
// 启动
// ============================================================
try {
  init();
} catch (e) {
  console.error('[系统初始化失败]', e.message, '\n', e.stack);
  // 显示错误提示
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = '<div style="color:#f44;padding:20px;font-family:monospace;">系统初始化失败: ' + e.message + '<br>请刷新或清除存档后重试。</div>';
  }
}
