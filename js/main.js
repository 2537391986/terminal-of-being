// js/main.js
// 存在终端 Terminal of Being — 入口文件 (v9.0 系统重构)
// v9.0 — SystemManager 生命周期 + 固定步长累加器 + visualViewport + 按钮语义化
// 职责: 组装各模块 + 主循环调度 + UI 绑定

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
import { initThemeSwitcher } from './ui/theme.js';
import { initDebugUI } from './ui/debug.js';
import { initStatPointsUI, hasUnspentPoints } from './ui/statPoints.js';
import {
  on, setInterval as sysSetInterval, cleanup, init as sysInit,
} from './core/systemManager.js';

// ============================================================
// 固定步长常量 — 60Hz 物理确定性
// ============================================================
const FIXED_DT = 1000 / 60;       // ~16.67ms，固定物理步长
const MAX_FIXED_STEPS = 4;        // 最多追赶 4 帧，防止螺旋死亡
let _accumulator = 0;
let _frameCount = 0;
let _frameSerial = 0;    // 帧序列号，用于 getFrameStats 缓存失效

// ══ 帧级缓存：getFinalStats() 代价高（getAllEquippedEffects 创建新对象），
// 同一帧内多次调用（stepPhysics × N + updateHUD × 1）共享结果。
// 使用 _frameSerial 而非 world._frameId 避免在 getFrameStats 内部自增破坏缓存。
let _cachedFrameStats = null;
let _cachedFrameStatsId = -1;

function getFrameStats() {
  if (_cachedFrameStatsId !== _frameSerial || !_cachedFrameStats) {
    _cachedFrameStats = getFinalStats();
    _cachedFrameStatsId = _frameSerial;
  }
  return _cachedFrameStats;
}

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
      resolve(confirm(message));
      return;
    }
    msgEl.textContent = message;
    modal.style.display = 'flex';

    const cleanupFn = () => {
      modal.style.display = 'none';
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
    };
    const onOk = () => { cleanupFn(); resolve(true); };
    const onCancel = () => { cleanupFn(); resolve(false); };
    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
  });
}

// ============================================================
// Canvas 尺寸同步
// ============================================================
function updateCanvasSize() {
  const container = document.querySelector('.eye-container');
  const cvs = world.canvas;
  if (!container || !cvs) return;
  const rect = container.getBoundingClientRect();
  const style = getComputedStyle(container);
  const bw = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
  const bh = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
  const w = Math.floor(rect.width - bw);
  const h = Math.floor(rect.height - bh);
  if (cvs.width !== w || cvs.height !== h) {
    cvs.width = w;
    cvs.height = h;
    cvs.style.width = w + 'px';
    cvs.style.height = h + 'px';
    updateWorldSize();
    initBg();
  }
}

// ============================================================
// 动态布局 — visualViewport 消除手机地址栏抖动
// ============================================================
function fitLayout() {
  const h = window.visualViewport
    ? window.visualViewport.height
    : window.innerHeight;
  const logEl = document.getElementById('log');
  if (!logEl) return;
  if (h < 700) {
    logEl.style.height = '110px';
  } else if (h < 850) {
    logEl.style.height = '140px';
  } else {
    logEl.style.height = '170px';
  }
}

// ============================================================
// 初始化
// ============================================================
function init() {
  // 生命周期：先清再绑
  cleanup();
  sysInit();

  // 存档
  if (!loadGame()) mergeState(initialState());
  recalcStats();
  syncPlayerStats();

  // Canvas
  world.canvas = document.getElementById('combat-canvas');
  if (!world.canvas) { console.error('[FATAL] combat-canvas not found in DOM'); return; }
  world.ctx = world.canvas.getContext('2d');
  updateCanvasSize();
  fitLayout();
  on(window, 'resize', () => { updateCanvasSize(); fitLayout(); });
  world.lastTime = performance.now();
  world.scrollDistance = 0;

  // 注入回调
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
  initThemeSwitcher();
  initStatPointsUI(syncPlayerStats, log);
  requestAnimationFrame(loop);

  // 开机动画结束后释放 GPU 合成层
  setTimeout(() => {
    const container = document.querySelector('.crt-container');
    if (container) container.classList.add('powered-on');
  }, 1200);
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
// 固定步长物理更新 (dt = FIXED_DT = 16.67ms)
// ============================================================
function stepPhysics(fixedMs) {
  const dt = fixedMs / 1000;  // 秒
  const timeScale = getTimeScale();
  const effectiveDt = dt * timeScale;
  const stats = getFrameStats();  // 帧级缓存，避免每步重复调用 getAllEquippedEffects

  flushBossDamageBuffer(performance.now());

  const inCombat = world.waveState === 'combat' || world.enemies.length > 0;
  const scrollDelta = inCombat ? 0 : SCROLL_SPEED * effectiveDt;
  world.scrollDistance += scrollDelta;

  // ── 玩家射击 ──
  world.playerShootTimer += fixedMs;
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
      if (wt.intervalShots > 1 && world.playerShotCount % wt.intervalShots === 0) {
        count = wt.intervalCount;
        spread = wt.intervalSpread;
      }
      for (let i = 0; i < count; i++) {
        const angle = count > 1 ? (i - (count - 1) / 2) * spread : 0;
        world.projectiles.push({
          x: PLAYER_X + 14, y: PLAYER_Y,
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
  world.playerMeleeTimer += fixedMs;
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
    world.waveTimer += fixedMs;
    if (world.drops.length === 0 && world.waveTimer > WAVE_REST_MIN_MS) startWave();
  }

  // ── 敌人推进 + AI ──
  for (const enemy of world.enemies) {
    if (enemy.dead) continue;
    if (enemy.dying) {
      enemy.dyingTimer -= fixedMs;
      enemy.dyingAlpha = Math.max(0, enemy.dyingTimer / DYING_TIMER_MS);
      enemy.x += enemy.vx * effectiveDt;
      enemy.y += enemy.vy * effectiveDt;
      enemy.vx *= 0.85; enemy.vy *= 0.85;
      if (enemy.dyingTimer <= 0) enemy.dead = true;
      continue;
    }
    updateEnemyAI(enemy, fixedMs, stats);
    if (enemy.hitStun > 0) {
      enemy.hitStun -= fixedMs;
    } else if (!enemy._stopForRanged) {
      enemy.x -= enemy.baseSpeed * effectiveDt;
    }
    enemy.x += enemy.vx * effectiveDt;
    enemy.vx *= 0.85;
    enemy.x -= scrollDelta;

    if (enemy.x < ENEMY_CULL_X) {
      enemy.dying = true;
      enemy.dyingTimer = DYING_TIMER_MS;
      enemy.scrollCulled = true;
      log(`[存在卷轴] ${enemy.name} 被抛入不可追溯的过去`);
      onEnemyDeath(enemy);
      continue;
    }

    if (Math.abs(enemy.x - PLAYER_X) < MELEE_RANGE) {
      if (enemy.hitStun <= 0) enemy.x += enemy.baseSpeed * effectiveDt;
      enemy.attackCooldown -= dt;
      if (enemy.attackCooldown <= 0) {
        damagePlayer(enemy, stats.dodge, stats.def);
        enemy.attackCooldown = 1 / enemy.aspd;
        enemy.vx = 100;
      }
    }
  }

  // ── 投射物 ──
  for (const proj of world.projectiles) {
    if (proj.dead) continue;
    proj.x += proj.vx * effectiveDt;
    proj.x -= scrollDelta;
    proj.y += (proj.vy || 0) * effectiveDt;
    if (proj.isEnemyProjectile) {
      if (proj.x > (world.canvas?.width || 800) + PROJECTILE_CULL_X || proj.x < -PROJECTILE_CULL_X) proj.dead = true;
      continue;
    }
    for (const enemy of world.enemies) {
      if (enemy.dead) continue;
      if (Math.hypot(proj.x - enemy.x, proj.y - enemy.y) < PROJECTILE_HIT_RADIUS) {
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

  // ── 掉落物 ──
  updateDrops(fixedMs);
  for (const drop of world.drops) {
    if (drop.dead) continue;
    drop.x -= scrollDelta;
    if (drop.x < DROP_CULL_X) drop.dead = true;
  }

  // ── 血渣 + 粒子 + 飘字物理 ──
  for (const g of world.gore) {
    if (!g.landed) {
      g.vy += GORE_GRAVITY * effectiveDt;
      g.x += g.vx * effectiveDt;
      g.y += g.vy * effectiveDt;
      if (g.y >= GROUND_Y - 4) { g.y = GROUND_Y - 4; g.vy = 0; g.vx = 0; g.landed = true; }
    }
    g.x -= scrollDelta;
    g.life -= fixedMs;
  }
  for (const p of world.particles) {
    p.x += p.vx * effectiveDt;
    p.y += p.vy * effectiveDt;
    p.vy += PARTICLE_GRAVITY * effectiveDt;
    p.x -= scrollDelta;
    p.life -= fixedMs;
  }
  for (const t of world.damageTexts) {
    t.y -= DAMAGE_TEXT_RISE_SPEED * effectiveDt;
    t.x -= scrollDelta;
    t.life -= fixedMs;
  }

  // ── 清理 ──
  inPlaceCleanup(world.enemies, e => !e.dead);
  inPlaceCleanup(world.projectiles, p => !p.dead);
  inPlaceCleanup(world.particles, p => p.life > 0);
  inPlaceCleanup(world.damageTexts, t => t.life > 0);
  inPlaceCleanup(world.drops, d => !d.dead);
  inPlaceCleanup(world.gore, g => g.life > 0);

  // ── 玩家死亡 ──
  if (state.player.hp <= 0) onPlayerDeath();
}

// ============================================================
// 主循环（变帧率渲染 + 固定步长物理）
// ============================================================
function loop(now) {
  try {
    const rawDelta = Math.min(now - world.lastTime, 100);
    world.lastTime = now;
    _accumulator += rawDelta;
    _frameCount++;
    _frameSerial++;   // 帧边界，使 getFrameStats 缓存在本帧内有效

    // 防止螺旋死亡：如果落后超过 4 帧，直接跳帧而非疯狂追赶
    if (_accumulator > FIXED_DT * (MAX_FIXED_STEPS + 1)) {
      _accumulator = FIXED_DT * MAX_FIXED_STEPS;
    }

    // 消耗固定步长
    let steps = 0;
    while (_accumulator >= FIXED_DT && steps < MAX_FIXED_STEPS) {
      stepPhysics(FIXED_DT);
      _accumulator -= FIXED_DT;
      steps++;
    }

    // ── 震动衰减 + 渲染 + HUD（每帧 60fps）──
    updateShake(rawDelta);
    render(now);
    updateHUD(getFrameStats());

    // 天赋点数角标
    const badge = document.getElementById('sp-badge');
    if (badge) {
      const pts = state.player.statPoints || 0;
      if (pts > 0) { badge.textContent = pts; badge.style.display = 'inline-block'; }
      else { badge.style.display = 'none'; }
    }
  } catch (e) {
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
 * 原地清理数组
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
// UI 绑定（全部通过 SystemManager）
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

  // 全局 ESC — 关闭浮层面板
  on(document, 'keydown', (e) => {
    if (e.key === 'Escape') {
      for (const panel of document.querySelectorAll('.overlay-panel.show')) {
        panel.classList.remove('show');
      }
    }
  });

  // 自动保存（通过 SystemManager 管理生命周期）
  sysSetInterval(() => {
    saveGame();
    const header = document.getElementById('terminal-header');
    if (header) {
      header.style.textShadow = '0 0 8px rgba(255,255,255,0.6)';
      setTimeout(() => { header.style.textShadow = ''; }, 500);
    }
  }, AUTO_SAVE_INTERVAL);

  // 页面卸载时清理（SystemManager 不自动处理 beforeunload，
  // 但 interval 已在 sys 内部注册，这里只需确保 save）
  on(window, 'beforeunload', () => {
    saveGame();
  });
}

// ============================================================
// 启动
// ============================================================
try {
  init();
} catch (e) {
  console.error('[系统初始化失败]', e.message, '\n', e.stack);
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = '<div style="color:#f44;padding:20px;font-family:monospace;">系统初始化失败: ' + e.message + '<br>请刷新或清除存档后重试。</div>';
  }
}
