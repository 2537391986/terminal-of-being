// js/systems/combat.js
// 击中反馈系统 + 伤害计算 + 装备效果桥接 (v7.0)
//
// 效果逻辑已迁移到 effects.js，本文件仅保留伤害计算和反馈。

import { world, PLAYER_X, PLAYER_Y } from '../core/world.js';
import { state } from '../core/state.js';
import {
  onKill as effectsOnKill,
  getFinalStats as effectsGetFinalStats,
  shouldGuaranteeCrit,
  getEnemyCritRate,
  onDodge as effectsOnDodge,
} from './effects.js';
import {
  HIT_STUN_MS, CRIT_FLASH_MS, HIT_FLASH_MS,
  CRIT_KNOCKBACK, KNOCKBACK,
  CRIT_GORE_COUNT, HIT_GORE_COUNT, KILL_GORE_COUNT,
  CRIT_SHAKE_INTENSITY, CRIT_SHAKE_DURATION, CRIT_SLOWMO_FACTOR, CRIT_SLOWMO_DURATION,
  KILL_SHAKE_INTENSITY, KILL_SHAKE_DURATION, KILL_SLOWMO_FACTOR, KILL_SLOWMO_DURATION,
  PHASE_SHAKE_INTENSITY, PHASE_SHAKE_DURATION, PHASE_SLOWMO_FACTOR, PHASE_SLOWMO_DURATION,
  KILL_PARTICLE_COUNT, DYING_TIMER_MS,
} from '../data/constants.js';

// 屏幕震动状态
let shakeIntensity = 0;
let shakeDuration = 0;

// 慢动作状态
let slowMoFactor = 1.0;
let slowMoEnd = 0;

// 击中反馈:顿帧 + 血渣(更多) + 击退
export function hitEnemy(enemy, dmg, isCrit) {
  // 0. 记录受击时间（供 shield_regen Mechanics 行为使用）
  enemy._lastHitTime = performance.now();

  // 1. 顿帧
  enemy.hitStun = HIT_STUN_MS;
  enemy.flashUntil = Date.now() + (isCrit ? CRIT_FLASH_MS : HIT_FLASH_MS);

  // 2. 击退(纯 x 方向)
  const dirX = enemy.x >= PLAYER_X ? 1 : -1;
  const force = isCrit ? CRIT_KNOCKBACK : KNOCKBACK;
  enemy.vx = dirX * force;

  // 3. ★ 血渣粒子翻倍:普通10,暴击20
  spawnBloodGore(enemy.x, enemy.y, isCrit ? CRIT_GORE_COUNT : HIT_GORE_COUNT);

  // 4. 暴击时屏幕震动 + 慢动作
  if (isCrit) {
    shake(CRIT_SHAKE_INTENSITY, CRIT_SHAKE_DURATION);
    triggerSlowMo(CRIT_SLOWMO_FACTOR, CRIT_SLOWMO_DURATION);
  }
}

// ★ 击杀反馈:击退 + 渐暗消失(无圆圈特效)
export function killEnemy(enemy) {
  // 1. 开始渐暗(不立即删除,主循环会推进 dyingTimer)
  enemy.dying = true;
  enemy.dyingTimer = DYING_TIMER_MS;    // 渐暗时长
  enemy.dyingAlpha = 1.0;

  // 2. 强击退 + 向上弹(物理感)
  enemy.vx = (enemy.x >= PLAYER_X ? 1 : -1) * 350;
  enemy.vy = -180;

  // 3. ★ 粒子密度加倍
  for (let i = 0; i < KILL_PARTICLE_COUNT; i++) {
    const angle = (Math.PI * 2 * i) / KILL_PARTICLE_COUNT;
    world.particles.push({
      x: enemy.x, y: enemy.y,
      vx: Math.cos(angle) * (60 + Math.random() * 80),
      vy: Math.sin(angle) * (60 + Math.random() * 80) - 40,
      symbol: ['x', '+', '|', '✦', '※', '·'][Math.floor(Math.random() * 6)],
      life: 500 + Math.random() * 200,
    });
  }

  // 4. 血渣加倍
  spawnBloodGore(enemy.x, enemy.y, KILL_GORE_COUNT);

  // 5. 慢动作 + 震动
  triggerSlowMo(KILL_SLOWMO_FACTOR, KILL_SLOWMO_DURATION);
  shake(KILL_SHAKE_INTENSITY, KILL_SHAKE_DURATION);
}

// 血渣(更多 + 更大)
function spawnBloodGore(x, y, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 120;
    world.gore.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 60,
      symbol: ['x', '+', '|', '·', '⁄', '\\'][Math.floor(Math.random() * 6)],
      life: 1200 + Math.random() * 600,
      landed: false,
    });
  }
}

// 屏幕震动
export function shake(intensity, durationMs) {
  shakeIntensity = Math.max(shakeIntensity, intensity);
  shakeDuration = Math.max(shakeDuration, durationMs);
}

// 慢动作
export function triggerSlowMo(factor, durationMs) {
  slowMoFactor = factor;
  slowMoEnd = Date.now() + durationMs;
}

// 获取当前 delta 倍率
export function getTimeScale() {
  if (Date.now() > slowMoEnd) slowMoFactor = 1.0;
  return slowMoFactor;
}

// 更新屏幕震动衰减(主循环每帧调用)
export function updateShake(deltaMs) {
  if (shakeDuration > 0) {
    shakeDuration -= deltaMs;
    if (shakeDuration <= 0) { shakeIntensity = 0; shakeDuration = 0; }
  }
}

// 获取屏幕震动偏移
// 修复7：接受可选的 out 对象直接写入，避免每帧 new {x,y}（调用方传入复用对象即可）
export function getShakeOffset(out) {
  const target = out || { x: 0, y: 0 };
  if (shakeDuration <= 0) {
    target.x = 0;
    target.y = 0;
  } else {
    target.x = (Math.random() - 0.5) * shakeIntensity * 2;
    target.y = (Math.random() - 0.5) * shakeIntensity * 2;
  }
  return target;
}

// 重置
export function resetCombatFeedback() {
  shakeIntensity = 0;
  shakeDuration = 0;
  slowMoFactor = 1.0;
  slowMoEnd = 0;
}

// ============================================================
// 日志回调(由 main.js 注入，避免循环依赖)
// ============================================================
let _combatLog = null;
export function registerCombatLog(logFn) {
  _combatLog = logFn;
}

// ============================================================
// 伤害计算 (v6.2 从 main.js 迁移)
// ============================================================

/**
 * 对敌人造成伤害 — 计算护甲减伤、暴击倍率、生命偷取、生成飘字
 * 新增：统觉之眼必暴击判定 + Boss 阶段转换 + 物自体伤害盾
 * @param {Object} enemy
 * @param {number} rawDmg - 原始伤害
 * @param {boolean} isCrit
 * @param {number} critDmg - 暴击倍率
 * @param {number} lifesteal - 生命偷取比例
 * @param {number} [enemyHpPct] - 敌人血量百分比（用于必暴击判定）
 * @returns {number} 实际伤害值
 */
export function damageEnemy(enemy, rawDmg, isCrit, critDmg = 1.5, lifesteal = 0, enemyHpPct = null) {
  // 统觉之眼：敌人低血量时必暴击
  if (!isCrit && enemyHpPct !== null && shouldGuaranteeCrit(enemyHpPct)) {
    isCrit = true;
  }

  // ★ 物自体防壁：伤害盾吸收部分伤害
  let dmg = rawDmg;
  if (enemy.damageShieldPct && enemy.damageShieldPct > 0) {
    dmg = applyDamageShield(rawDmg, enemy);
  }

  const effectiveDmg = isCrit ? dmg * critDmg : dmg;
  // 修复5：改用 defPct 百分比减伤，消灭"敌人防御 > 攻击 → 固定 1 伤"软锁
  // defPct 在 encounter.js 生成时已按 min(0.85, def/(def+50)) 计算
  const reduction = enemy.defPct != null ? enemy.defPct : 0;
  let finalDmg = Math.max(1, Math.floor(effectiveDmg * (1 - reduction)));

  // ★ 统觉统一场：伤害合并窗口（debounce 式）
  // 所有在 mergeWindow 内的伤害合并为一次结算
  if (enemy.type === 'boss' && enemy.mergeTimer != null) {
    // 仍在合并窗口内：累加到缓冲区，重置计时器
    enemy.damageBuffer = (enemy.damageBuffer || 0) + finalDmg;
    enemy.mergeTimer = performance.now() + enemy.mergeWindow;
    // 追踪窗口内最大单次伤害（用于绝对统觉阶段）
    if (!enemy.largestHitInWindow || finalDmg > enemy.largestHitInWindow) {
      enemy.largestHitInWindow = finalDmg;
    }
    // 飘字显示"统觉吸收"
    world.damageTexts.push({
      x: enemy.x, y: enemy.y - 8,
      value: '⊕' + Math.floor(enemy.damageBuffer),
      isCrit: false, life: 500,
    });
    return 0; // 不立即扣血
  }

  // ★ 统觉：ignoreChipDamage（忽略小于 maxHp 10% 的伤害）
  if (enemy.type === 'boss' && enemy.ignoreChipDamage && finalDmg < enemy.maxHp * 0.10) {
    world.damageTexts.push({
      x: enemy.x, y: enemy.y - 8,
      value: '⊖忽略', isCrit: false, life: 400,
    });
    return 0;
  }

  // ★ 统觉：onlyLargestHit（只取窗口内最大单次伤害）
  if (enemy.type === 'boss' && enemy.onlyLargestHit && enemy.largestHitInWindow) {
    // 每个窗口只结算最大那次
    finalDmg = enemy.largestHitInWindow;
    enemy.largestHitInWindow = 0;
  }

  enemy.hp -= finalDmg;

  world.damageTexts.push({
    x: enemy.x, y: enemy.y - 18,
    value: Math.floor(finalDmg),
    isCrit, life: 800,
  });

  // ★ Boss 受击：强力意志叠层
  if (enemy.type === 'boss') {
    onBossHit(enemy);
  }

  // ★ Boss 阶段转换检查
  if (enemy.type === 'boss' && enemy.phaseData) {
    checkBossPhase(enemy, _combatLog || ((msg) => {}));
  }

  if (lifesteal > 0) {
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + finalDmg * lifesteal);
  }
  return finalDmg;
}

/**
 * 敌人攻击玩家 — 计算闪避(否认)、护甲减伤、敌人暴击、生成飘字
 * 新增：物自体之盾 debuff 降低敌人暴击率
 * @param {Object} attacker - 敌人对象
 * @param {number} dodgePct - 玩家闪避率
 * @param {number} def - 玩家防御
 * @returns {number} 实际伤害(0 表示被否认)
 */
export function damagePlayer(attacker, dodgePct = 0, def = 0) {
  // 闪避判定
  if (Math.random() < dodgePct) {
    world.damageTexts.push({
      x: PLAYER_X, y: PLAYER_Y - 24,
      value: '否认', isCrit: false, life: 600,
    });
    // 效果追踪：成功闪避 → 绝对命令之律
    effectsOnDodge();
    return 0;
  }

  // 敌人暴击判定（受物自体之盾 debuff 影响）
  const enemyCritRate = getEnemyCritRate(attacker);
  const enemyIsCrit = Math.random() < enemyCritRate;
  const enemyCritDmg = attacker.critDmg || 1.5;
  const baseDmg = Math.max(1, attacker.atk - def * 0.5);
  const dmg = enemyIsCrit ? Math.round(baseDmg * enemyCritDmg) : baseDmg;

  state.player.hp -= dmg;
  world.damageTexts.push({
    x: PLAYER_X, y: PLAYER_Y - 18,
    value: Math.floor(dmg),
    isCrit: enemyIsCrit,
    life: 600,
  });

  if (enemyIsCrit) {
    shake(7, 120);
  } else {
    shake(4, 80);
  }
  return dmg;
}

// ============================================================
// Boss 阶段系统 (v7.1)
// ============================================================

/**
 * 对 Boss 造成伤害后，检查是否触发阶段转换
 * @param {Object} enemy
 * @param {Function} logFn - 日志函数
 */
export function checkBossPhase(enemy, logFn) {
  if (!enemy.phaseData || enemy.dead) return;

  const hpPct = enemy.hp / enemy.maxHp;
  const phases = enemy.phaseData.phases;

  // 从后往前检查（高阶段优先）
  for (let i = phases.length - 1; i >= 0; i--) {
    if (hpPct <= phases[i].hpPct && !enemy.triggeredPhases.has(i) && i > 0) {
      enemy.triggeredPhases.add(i);
      enemy.currentPhase = i;
      applyPhaseEffects(enemy, phases[i]);
      showPhaseTransition(enemy, phases[i]);
      if (logFn) logFn(`[${enemy.phaseData.name}] ${phases[i].flavor}`);
      break;
    }
  }
}

/**
 * 应用阶段效果到 Boss
 */
export function applyPhaseEffects(enemy, phase) {
  const fx = phase.effects;
  if (fx.aspd) enemy.aspd = (enemy.baseAspd || enemy.aspd) * fx.aspd;
  if (fx.crit) enemy.crit = Math.min(0.5, enemy.crit + fx.crit);
  if (fx.atkMul) enemy.atk = Math.round(enemy.atk * fx.atkMul);
  if (fx.defMul) enemy.def = Math.round(enemy.def * fx.defMul);
  if (fx.damageShield !== undefined) enemy.damageShieldPct = fx.damageShield;
  if (fx.onHitAtkGain) enemy.onHitAtkGain = fx.onHitAtkGain;
  // ★ 统觉伤害合并窗口
  if (fx.mergeDamageWindow) {
    enemy.mergeWindow = fx.mergeDamageWindow;
    enemy.mergeTimer = null;     // null = 不在合并窗口中
    enemy.damageBuffer = 0;
    enemy.largestHitInWindow = 0;
  }
  if (fx.ignoreChipDamage) enemy.ignoreChipDamage = true;
  if (fx.onlyLargestHit) enemy.onlyLargestHit = true;
}

/**
 * 阶段转换视觉特效
 */
function showPhaseTransition(enemy, phase) {
  // 屏幕震动 + 慢动作
  shake(PHASE_SHAKE_INTENSITY, PHASE_SHAKE_DURATION);
  triggerSlowMo(PHASE_SLOWMO_FACTOR, PHASE_SLOWMO_DURATION);

  // 粒子爆发
  for (let i = 0; i < 20; i++) {
    const angle = (Math.PI * 2 * i) / 20;
    world.particles.push({
      x: enemy.x, y: enemy.y - 20,
      vx: Math.cos(angle) * (80 + Math.random() * 60),
      vy: Math.sin(angle) * (80 + Math.random() * 60) - 30,
      symbol: '◆',
      life: 800 + Math.random() * 400,
      color: '#ff4444',
    });
  }

  // 阶段名称飘字
  world.damageTexts.push({
    x: enemy.x, y: enemy.y - 40,
    value: `【${phase.name}】`,
    isCrit: true,
    life: 1500,
    isPhaseText: true,
  });
}

/**
 * Boss 受击后回调（处理强力意志等被动）
 * @param {Object} enemy - Boss 对象
 */
export function onBossHit(enemy) {
  if (!enemy.phaseData) return;

  const phaseData = enemy.phaseData;
  const currentPhase = phaseData.phases[enemy.currentPhase];

  // 强力意志：每次受击后攻击力永久上升
  if (phaseData.passive === 'onHitAtkGain' && currentPhase.effects?.onHitAtkGain) {
    enemy.onHitAtkStacks = (enemy.onHitAtkStacks || 0) + 1;
    const gain = currentPhase.effects.onHitAtkGain;
    const baseAtk = enemy.baseAtk || enemy.atk;
    if (!enemy.baseAtk) enemy.baseAtk = enemy.atk;
    enemy.atk = Math.round(baseAtk * (1 + gain * enemy.onHitAtkStacks));
    world.damageTexts.push({
      x: enemy.x, y: enemy.y - 30,
      value: `意志+${Math.round(gain * 100)}%`,
      isCrit: false,
      life: 600,
    });
  }
}

/**
 * 物自体防壁：计算实际伤害（部分被物自体吸收）
 * @param {number} rawDmg - 原始伤害
 * @param {Object} enemy - 敌人对象
 * @returns {number} 实际伤害
 */
export function applyDamageShield(rawDmg, enemy) {
  if (!enemy.damageShieldPct || enemy.damageShieldPct <= 0) return rawDmg;
  const shielded = Math.round(rawDmg * enemy.damageShieldPct);
  const actual = rawDmg - shielded;
  // 显示吸收效果
  world.damageTexts.push({
    x: enemy.x + 20, y: enemy.y - 10,
    value: `物自体吸收${shielded}`,
    isCrit: false,
    life: 500,
    isShieldText: true,
  });
  return Math.max(1, actual);
}

// ============================================================
// 统觉伤害合并刷新（在主循环每帧调用）
// ============================================================

/**
 * 刷新所有 Boss 的伤害合并缓冲
 * 当合并窗口到期时，结算缓冲的伤害
 * @param {number} now - performance.now() 时间戳
 */
export function flushBossDamageBuffer(now) {
  for (const enemy of world.enemies) {
    if (enemy.dead || enemy.type !== 'boss') continue;
    if (enemy.mergeTimer && now > enemy.mergeTimer) {
      // 合并窗口到期，结算缓冲伤害
      if (enemy.damageBuffer > 0) {
        enemy.hp -= enemy.damageBuffer;
        // ★ BUG-02 修复：扣血后检查死亡
        if (enemy.hp <= 0 && !enemy.dying) {
          enemy.dying = true;
          enemy.dyingTimer = DYING_TIMER_MS;
        }
        world.damageTexts.push({
          x: enemy.x, y: enemy.y - 18,
          value: Math.floor(enemy.damageBuffer),
          isCrit: false, life: 800,
        });
        enemy.damageBuffer = 0;
      }
      enemy.mergeTimer = null; // 重置合并窗口
      enemy.largestHitInWindow = 0;
    }
  }
}
