// js/systems/encounter.js
// 波次管理 + 敌人生成 + 掉落生成 + 玩家死亡 — 从 main.js 提取 (v6.2 架构拆分)
// 依赖 combat.js 的视觉反馈函数, 通过回调使用 log/HUD

import { state } from '../core/state.js';
import { world, PLAYER_X, PLAYER_Y, GROUND_Y } from '../core/world.js';
import {
  pickEnemyTemplate, pickEliteTemplate, pickBossTemplate,
  BOSS_PHASE_DATA, ENEMY_TEMPLATES, ELITE_TEMPLATES, BOSS_TEMPLATES,
} from '../data/enemies.js';
import { findConcept } from '../data/concepts.js';
import {
  enemyStats, LEVEL_UP, POINTS_PER_LEVEL, expToNext,
  ELITE_MUL, BOSS_MUL, DROP_LIFETIME, ENEMY_SPEED_MAX,
} from '../data/constants.js';
import { generateItem, shouldDropLoot, dropMessage } from './loot.js';
import { isInventoryFull } from './equipment.js';
import { recalcStats } from './stats.js';
import { killEnemy, resetCombatFeedback, applyPhaseEffects, shake } from './combat.js';
import {
  onKill as effectsOnKill,
  incrementStageClearStack as effectsIncrementStack,
  resetInRunEffects as effectsReset,
} from './effects.js';

// ============================================================
// 日志/HUD 回调(由 main.js 注入，避免循环依赖)
// ============================================================
let _log = null;
let _syncPlayerStats = null;

export function registerCallbacks(logFn, syncPlayerStatsFn) {
  _log = logFn;
  _syncPlayerStats = syncPlayerStatsFn;
}

// ============================================================
// 波次管理
// ============================================================

export function startWave() {
  world.waveState = 'combat';
  const count = Math.min(8, 3 + Math.floor(state.stage / 3));
  world.waveEnemiesLeft = count;
  world.waveTimer = 0;
  _log(`[涌现] 第${state.stage}次涌现 · ${count}命题实体化`);
  for (let i = 0; i < count; i++) {
    world.enemies.push(makeEnemy(i * 60));
  }
}

// ============================================================
// makeEnemyById — 调试用：按模板ID生成敌人
// ============================================================
export function makeEnemyById(templateId) {
  const stage = state.stage;
  const allTmpls = [...ENEMY_TEMPLATES, ...ELITE_TEMPLATES, ...BOSS_TEMPLATES];
  const tmpl = allTmpls.find(t => t.id === templateId);
  if (!tmpl) return null;

  const es = enemyStats(stage);
  let hpMul = 1, atkMul = 1, defMul = 1;
  const enemyType = tmpl.type;
  if (enemyType === 'boss')   { hpMul = BOSS_MUL.hp; atkMul = BOSS_MUL.atk; defMul = BOSS_MUL.def; }
  if (enemyType === 'elite')  { hpMul = ELITE_MUL.hp; atkMul = ELITE_MUL.atk; defMul = ELITE_MUL.def; }

  // 修复2：经验/金币加成从 finalStats 读取（而非 state.player 裸值）
  const fs = state.player.finalStats || state.player;
  const expMul  = enemyType === 'boss' ? 5 : enemyType === 'elite' ? 2 : 1;
  const goldMul = expMul;

  // 修复5：移速使用对数曲线 + 硬上限
  const baseSpeed = Math.min(ENEMY_SPEED_MAX, 55 + 45 * Math.log10(1 + stage * 0.3));

  const enemy = {
    id: Date.now() + Math.random(),
    name: tmpl.name,
    symbol: tmpl.symbol,
    type: enemyType,
    conceptId: tmpl.conceptId,
    conceptTerm: findConcept(tmpl.conceptId)?.term || tmpl.name,
    x: (world.canvas?.width || 800) + 30 + Math.random() * 40,
    y: PLAYER_Y,
    vx: 0, vy: 0,
    baseSpeed,
    hp: es.hp * hpMul, maxHp: es.hp * hpMul,
    atk: es.atk * atkMul,
    // 修复5：防御转换为减伤系数（0~0.85），而非与 atk 直接比大小
    defPct: Math.min(0.85, es.def * defMul / (es.def * defMul + 50)),
    aspd: 1.5,
    expReward: Math.floor(es.exp * expMul * (1 + (fs.expGain || 0))),
    goldReward: Math.floor(es.gold * goldMul * (1 + (fs.goldGain || 0))),
    attackCooldown: 0, hitStun: 0, flashUntil: 0,
    dying: false, dyingTimer: 0, dyingAlpha: 1, dead: false,
    crit:  enemyType === 'boss' ? 0.08 : enemyType === 'elite' ? 0.05 : 0.03,
    critDmg: enemyType === 'boss' ? 2.0 : enemyType === 'elite' ? 1.8 : 1.5,
    // 行为标签（从模板读取）
    mechanics: tmpl.mechanics || [],
  };

  if (enemyType === 'boss') {
    const phaseData = BOSS_PHASE_DATA[tmpl.id];
    if (phaseData) {
      enemy.phaseData = phaseData;
      enemy.currentPhase = 0;
      enemy.triggeredPhases = new Set();
      enemy.passive = phaseData.passive || null;
      enemy.onHitAtkStacks = 0;
      if (phaseData.fakeDeath) enemy.fakeDeathTriggered = false;
    }
  }
  return enemy;
}

function makeEnemy(offsetX) {
  const stage = state.stage;
  const isBoss = stage % 10 === 0;
  const isElite = stage % 5 === 0 && !isBoss;

  let tmpl;
  if (isBoss) {
    tmpl = pickBossTemplate(stage);
    if (!tmpl) tmpl = pickEliteTemplate(stage) || pickEnemyTemplate(stage);
  } else if (isElite) {
    tmpl = pickEliteTemplate(stage) || pickEnemyTemplate(stage);
  } else {
    tmpl = pickEnemyTemplate(stage);
  }

  const es = enemyStats(stage);
  let hpMul = 1, atkMul = 1, defMul = 1;
  let enemyType = tmpl.type;
  if (enemyType === 'boss') { hpMul = BOSS_MUL.hp; atkMul = BOSS_MUL.atk; defMul = BOSS_MUL.def; }
  else if (enemyType === 'elite') { hpMul = ELITE_MUL.hp; atkMul = ELITE_MUL.atk; defMul = ELITE_MUL.def; }

  // 修复2：经验/金币加成从 finalStats 读取
  const fs = state.player.finalStats || state.player;
  const expMul  = isBoss ? 5 : isElite ? 2 : 1;
  const goldMul = expMul;

  // 修复5：移速使用对数曲线 + 硬上限，防 100 层后瞬间贴脸
  const baseSpeed = Math.min(ENEMY_SPEED_MAX, 55 + 45 * Math.log10(1 + stage * 0.3));

  const enemy = {
    id: Date.now() + Math.random(),
    name: tmpl.name,
    symbol: tmpl.symbol,
    type: enemyType,
    conceptId: tmpl.conceptId,
    conceptTerm: findConcept(tmpl.conceptId)?.term || tmpl.name,
    x: (world.canvas?.width || 800) + 30 + offsetX + Math.random() * 40,
    y: PLAYER_Y,
    vx: 0, vy: 0,
    baseSpeed,
    hp: es.hp * hpMul, maxHp: es.hp * hpMul,
    atk: es.atk * atkMul,
    // 修复5：防御转换为减伤系数（上限 0.85），彻底消灭"def > atk → 固定 1 伤"
    defPct: Math.min(0.85, (es.def * defMul) / (es.def * defMul + 50)),
    aspd: 1.5,
    expReward: Math.floor(es.exp * expMul * (1 + (fs.expGain || 0))),
    goldReward: Math.floor(es.gold * goldMul * (1 + (fs.goldGain || 0))),
    attackCooldown: 0,
    hitStun: 0, flashUntil: 0,
    dying: false, dyingTimer: 0, dyingAlpha: 1,
    dead: false,
    // 敌人洞见率
    crit:  enemyType === 'boss' ? 0.08 : enemyType === 'elite' ? 0.05 : 0.03,
    critDmg: enemyType === 'boss' ? 2.0 : enemyType === 'elite' ? 1.8 : 1.5,
    // 行为标签（v0.8 Mechanics 系统）
    mechanics: tmpl.mechanics || [],
  };

  // ★ Boss 阶段初始化
  if (enemyType === 'boss') {
    const phaseData = BOSS_PHASE_DATA[tmpl.id];
    if (phaseData) {
      enemy.phaseData = phaseData;
      enemy.currentPhase = 0;           // 当前阶段索引
      enemy.triggeredPhases = new Set();  // 已触发的阶段索引
      enemy.passive = phaseData.passive || null;
      enemy.onHitAtkStacks = 0;          // 强力意志叠加层数
      enemy.fakeDeathCount = 0;          // 明希豪森之结假死次数
      enemy.isActuallyDead = false;     // 是否真正死亡（明希豪森）
      // 物自体伤害盾：吸收百分比伤害
      enemy.damageShieldPct = phaseData.phases[0].effects?.damageShield || 0;
    }
  }

  return enemy;
}

/**
 * 为明希豪森之结召唤历史怪物
 */
function makeSummonedEnemy(tmpl, offsetX) {
  const stage = state.stage;
  const es = enemyStats(stage);
  const baseSpeed = Math.min(ENEMY_SPEED_MAX, 55 + 45 * Math.log10(1 + stage * 0.3));
  return {
    id: Date.now() + Math.random(),
    name: tmpl.name + '（残影）',
    symbol: tmpl.symbol,
    type: 'normal',
    conceptId: tmpl.conceptId,
    conceptTerm: findConcept(tmpl.conceptId)?.term || tmpl.name,
    x: (world.canvas?.width || 800) + 30 + offsetX,
    y: PLAYER_Y,
    vx: 0, vy: 0,
    baseSpeed,
    hp: Math.round(es.hp * 0.5), maxHp: Math.round(es.hp * 0.5),
    atk: Math.round(es.atk * 0.7),
    defPct: Math.min(0.85, (es.def * 0.7) / (es.def * 0.7 + 50)),
    aspd: 1.5,
    expReward: Math.floor(es.exp * 0.5),
    goldReward: Math.floor(es.gold * 0.5),
    attackCooldown: 0,
    hitStun: 0, flashUntil: 0,
    dying: false, dyingTimer: 0, dyingAlpha: 1,
    dead: false,
    crit: 0.03, critDmg: 1.5,
    isSummoned: true,
    mechanics: [],
  };
}

export function endWave() {
  world.waveState = 'calm';
  world.waveTimer = 0;
  _log('[涌现] 命题消散,存在继续展开…');
  state.stage += 1;
  if (state.stage > state.bestStage) state.bestStage = state.stage;
  // 每10层触发明希豪森困境之钥叠加
  if (state.stage % 10 === 0) effectsIncrementStack();
}

// ============================================================
// 击杀处理
// ============================================================

export function onEnemyDeath(enemy) {
  // ★ 明希豪森之结：假死复活机制
  if (enemy.type === 'boss' && enemy.phaseData?.fakeDeath && !enemy.isActuallyDead) {
    const maxFake = enemy.phaseData.phases.length - 1; // 最后一阶段真死
    if (enemy.fakeDeathCount < maxFake) {
      // 假死：复活并召唤
      enemy.fakeDeathCount++;
      const phaseIdx = enemy.fakeDeathCount;
      const phase = enemy.phaseData.phases[phaseIdx];
      const healPct = phase.effects?.healPct || 0.5;

      enemy.hp = Math.round(enemy.maxHp * healPct);
      enemy.dying = false;
      enemy.dead = false;
      enemy.currentPhase = phaseIdx;
      applyPhaseEffects(enemy, phase);

      _log(`[${enemy.phaseData.name}] ${phase.flavor}`);
      shake(10, 180);

      // 召唤历史怪物
      const summonCount = phase.effects?.summonOnDeath || 2;
      for (let i = 0; i < summonCount; i++) {
        const tmpl = pickEnemyTemplate(state.stage);
        if (tmpl) {
          world.enemies.push(makeSummonedEnemy(tmpl, i * 40));
        }
      }
      return; // 不真正死亡
    }
  }

  killEnemy(enemy);
  state.player.exp += enemy.expReward;
  state.player.gold += enemy.goldReward;

  // 升级检查
  while (state.player.exp >= state.player.expToNext) {
    state.player.exp -= state.player.expToNext;
    state.player.level += 1;
    state.player.baseMaxHp += LEVEL_UP.maxHp;
    state.player.baseMaxMp += LEVEL_UP.maxMp;
    state.player.baseAtk += LEVEL_UP.atk;
    state.player.baseDef += LEVEL_UP.def;
    state.player.statPoints = (state.player.statPoints || 0) + POINTS_PER_LEVEL;
    state.player.expToNext = expToNext(state.player.level);
    recalcStats();
    if (_syncPlayerStats) _syncPlayerStats();
    state.player.hp = state.player.maxHp;
    _log(`[意志升阶] Lv${state.player.level} — 断言力${Math.floor(state.player.atk)} 边界${Math.floor(state.player.def)} | +${POINTS_PER_LEVEL}属性点`);
  }

  _log(`[命题被否证] ${enemy.name} +${enemy.expReward.toFixed(0)}经验 +${enemy.goldReward.toFixed(0)}货币`);

  // on_kill 效果（强力意志之冠）
  effectsOnKill();

  // 掉落判定（从 finalStats 读取 itemFind）
  const itemFind = (state.player.finalStats && state.player.finalStats.itemFind) || 0;
  if (shouldDropLoot(enemy.type, itemFind)) {
    spawnEquipmentDrop(enemy);
  }

  // 图鉴
  const cid = enemy.conceptId;
  console.log(`[图鉴注册] ${enemy.name} conceptId=${cid}, alreadyUnlocked=${cid ? state.unlockedCodex.includes(cid) : 'N/A'}`);
  if (cid && !state.unlockedCodex.includes(cid)) {
    state.unlockedCodex.push(cid);
    const ct = findConcept(cid);
    _log(`[概念收录] "${ct?.term || cid}" 已被纳入认知范畴`);
    console.log(`[图鉴注册] ✅ 成功收录 ${cid}`);
  } else if (!cid) {
    console.warn(`[图鉴调试] ${enemy.name} 缺少 conceptId, enemy=`, enemy);
  } else {
    console.log(`[图鉴注册] ⚠️ 已收录过 ${cid}，跳过`);
  }

  world.waveEnemiesLeft -= 1;
  if (world.waveEnemiesLeft <= 0 && world.waveState === 'combat') {
    endWave();
  }
}

// ============================================================
// 装备掉落
// ============================================================

function spawnEquipmentDrop(enemy) {
  if (enemy.scrollCulled) return;
  if (isInventoryFull()) { _log('[范畴溢出] 承载已达上限,装备消散'); return; }
  const item = generateItem(state.stage, enemy.type);
  if (!item) return;
  const msg = dropMessage(item);
  world.drops.push({
    x: enemy.x, y: enemy.y,
    vx: (Math.random() - 0.5) * 100,
    vy: -200,
    item,
    landed: false,
    dead: false,
    life: DROP_LIFETIME,
  });
  _log(`[现象凝结] ${msg}`);
}

export function updateDrops(delta) {
  for (const drop of world.drops) {
    if (drop.dead) continue;
    drop.life -= delta;
    if (drop.life <= 0) { drop.dead = true; continue; }

    if (!drop.landed) {
      drop.vy += 600 * (delta / 1000);
      drop.x += drop.vx * (delta / 1000);
      drop.y += drop.vy * (delta / 1000);
      if (drop.y >= GROUND_Y - 8) {
        drop.y = GROUND_Y - 8; drop.vy = 0; drop.vx = 0; drop.landed = true;
        for (let i = 0; i < 4; i++) {
          world.particles.push({
            x: drop.x + (Math.random() - 0.5) * 10,
            y: GROUND_Y - 4,
            vx: (Math.random() - 0.5) * 60,
            vy: -Math.random() * 60,
            symbol: '*', life: 300,
          });
        }
      }
      continue;
    }
    const dx = drop.x - PLAYER_X;
    const dy = drop.y - PLAYER_Y;
    if (Math.sqrt(dx * dx + dy * dy) < 28) pickupDrop(drop);
  }
}

function pickupDrop(drop) {
  if (isInventoryFull()) { _log('[范畴溢出] 承载已达上限'); drop.dead = true; return; }
  state.inventory.push(drop.item);
  _log(`[纳入存在] ${drop.item.name}`);
  drop.dead = true;
  spawnHitParticle(drop.x, drop.y);
}

// ============================================================
// 玩家死亡
// ============================================================

export function onPlayerDeath() {
  _log('[此在消散] 一切范畴瓦解,主体重新建构…');
  state.stage = Math.max(1, state.stage - 5);
  state.player.hp = state.player.maxHp;
  state.player.mp = state.player.maxMp;
  effectsReset();
  world.enemies = [];
  world.projectiles = [];
  world.particles = [];
  world.damageTexts = [];
  world.drops = [];
  world.gore = [];
  world.scrollDistance = 0;
  resetCombatFeedback();
  setTimeout(startWave, 500);
}

// ============================================================
// Mechanics 行为系统（v0.8）
// ============================================================
// 由 main.js 游戏循环在"敌人 AI 推进"阶段每帧调用。
// 根据 enemy.mechanics 数组中的标签执行对应行为逻辑。
// 所有定时器存储在 enemy._mechTimers 上（惰性初始化）。

/**
 * 更新单个敌人的 Mechanics 行为
 * @param {Object} enemy  - 敌人对象（含 mechanics 数组）
 * @param {number} delta  - 帧时间 (ms)
 * @param {Object} stats  - 玩家 finalStats（用于计算投射物伤害）
 */
export function updateEnemyAI(enemy, delta, stats) {
  if (!enemy.mechanics || enemy.mechanics.length === 0) return;
  if (!enemy._mechTimers) enemy._mechTimers = {};

  const dt = delta / 1000; // 转秒

  for (const mech of enemy.mechanics) {
    switch (mech.type) {

      // ── 远程攻击：在 range 外停下，每 cooldown 秒发射投射物 ──
      case 'ranged': {
        const dist = enemy.x - PLAYER_X;
        // 如果玩家在射程内：停止移动（通过 hitStun 借用）并计时发射
        if (dist > 0 && dist <= mech.range) {
          // 阻止常规推进（通过给 hitStun 一个很小值保持停止效果）
          enemy._stopForRanged = true;
          const key = `ranged_${mech.range}`;
          enemy._mechTimers[key] = (enemy._mechTimers[key] || 0) + dt;
          if (enemy._mechTimers[key] >= mech.cooldown) {
            enemy._mechTimers[key] = 0;
            // 发射投射物
            world.projectiles.push({
              x: enemy.x - 10,
              y: enemy.y,
              vx: -200,
              vy: (Math.random() - 0.5) * 40,
              dmg: enemy.atk * (mech.damageMul || 0.8),
              dead: false,
              symbol: mech.projectileSymbol || '·',
              color: '#ff6666',
              pierce: false,
              pierced: new Set(),
              isEnemyProjectile: true, // 标记为敌方弹
            });
          }
        } else {
          enemy._stopForRanged = false;
        }
        break;
      }

      // ── 冲锋攻击：每 chargeCooldown 秒，若玩家在范围内，高速冲刺 ──
      case 'charger': {
        const key = 'charger';
        enemy._mechTimers[key] = (enemy._mechTimers[key] || 0) + dt;
        // 充能计时
        if (!enemy._charging && enemy._mechTimers[key] >= mech.chargeCooldown) {
          const dist = enemy.x - PLAYER_X;
          if (dist > 0 && dist <= mech.chargeRange) {
            // 触发冲锋
            enemy._charging = true;
            enemy._mechTimers[key] = 0;
            enemy.vx = -enemy.baseSpeed * (mech.chargeSpeedMul - 1); // 叠加额外速度
            // 0.6 秒后结束冲锋
            enemy._chargeDuration = 0.6;
          }
        }
        if (enemy._charging) {
          enemy._chargeDuration -= dt;
          if (enemy._chargeDuration <= 0) {
            enemy._charging = false;
            enemy.vx = 0;
          }
        }
        break;
      }

      // ── 分裂：HP 降至 splitHpPct 时死亡并生成多个缩小版自身 ──
      case 'splitter': {
        if (!enemy._splitDone && enemy.hp / enemy.maxHp <= mech.splitHpPct) {
          enemy._splitDone = true;
          const count = mech.splitCount || 2;
          for (let i = 0; i < count; i++) {
            const splitEnemy = {
              ...enemy,
              id: Date.now() + Math.random() + i,
              hp: enemy.maxHp * 0.25,
              maxHp: enemy.maxHp * 0.25,
              atk: enemy.atk * 0.6,
              defPct: enemy.defPct * 0.7,
              baseSpeed: enemy.baseSpeed * 1.2,
              x: enemy.x + (i - (count - 1) / 2) * 30,
              dying: false, dead: false,
              dyingTimer: 0, dyingAlpha: 1,
              vx: (Math.random() - 0.5) * 150,
              mechanics: [], // 分裂体不再分裂
              _splitDone: true,
              _mechTimers: {},
              expReward: Math.floor(enemy.expReward * 0.3),
              goldReward: Math.floor(enemy.goldReward * 0.3),
              // Boss 阶段数据清除，避免继承
              phaseData: null, type: 'normal',
              name: enemy.name + '碎片',
            };
            world.enemies.push(splitEnemy);
            world.waveEnemiesLeft += 1;
          }
          // 触发分裂后立即死亡（不给经验，已通过分裂体给）
          enemy.hp = 0;
          enemy.expReward = 0;
          enemy.goldReward = 0;
        }
        break;
      }

      // ── 护盾恢复：若最近 regenCooldown 秒未受击，恢复 regenPct 最大HP ──
      case 'shield_regen': {
        const key = 'shield_regen';
        // 追踪最后受击时间（被攻击时由 combat.js hitEnemy 设置 enemy._lastHitTime）
        const lastHit = enemy._lastHitTime || 0;
        const timeSinceHit = (performance.now() - lastHit) / 1000;
        if (timeSinceHit >= mech.regenCooldown && enemy.hp < enemy.maxHp) {
          const regen = enemy.maxHp * mech.regenPct;
          enemy.hp = Math.min(enemy.maxHp, enemy.hp + regen * dt);
        }
        break;
      }
    }
  }
}

// ============================================================
// 粒子辅助
// ============================================================

export function spawnHitParticle(x, y) {
  for (let i = 0; i < 4; i++) {
    world.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 80,
      vy: -Math.random() * 80,
      symbol: '*', life: 300,
    });
  }
}
