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

// 屏幕震动状态
let shakeIntensity = 0;
let shakeDuration = 0;

// 慢动作状态
let slowMoFactor = 1.0;
let slowMoEnd = 0;

// 击中反馈:顿帧 + 血渣(更多) + 击退
export function hitEnemy(enemy, dmg, isCrit) {
  // 1. 顿帧
  enemy.hitStun = 50;
  enemy.flashUntil = Date.now() + (isCrit ? 120 : 60);

  // 2. 击退(纯 x 方向)
  const dirX = enemy.x >= PLAYER_X ? 1 : -1;
  const force = isCrit ? 600 : 400;
  enemy.vx = dirX * force;

  // 3. ★ 血渣粒子翻倍:普通10,暴击20
  spawnBloodGore(enemy.x, enemy.y, isCrit ? 20 : 10);

  // 4. 暴击时屏幕震动 + 慢动作
  if (isCrit) {
    shake(6, 100);
    triggerSlowMo(0.5, 80);
  }
}

// ★ 击杀反馈:击退 + 渐暗消失(无圆圈特效)
export function killEnemy(enemy) {
  // 1. 开始渐暗(不立即删除,主循环会推进 dyingTimer)
  enemy.dying = true;
  enemy.dyingTimer = 400;    // 400ms 渐暗
  enemy.dyingAlpha = 1.0;

  // 2. 强击退 + 向上弹(物理感)
  enemy.vx = (enemy.x >= PLAYER_X ? 1 : -1) * 350;
  enemy.vy = -180;

  // 3. ★ 粒子密度加倍:32 个
  for (let i = 0; i < 32; i++) {
    const angle = (Math.PI * 2 * i) / 32;
    world.particles.push({
      x: enemy.x, y: enemy.y,
      vx: Math.cos(angle) * (60 + Math.random() * 80),
      vy: Math.sin(angle) * (60 + Math.random() * 80) - 40,
      symbol: ['x', '+', '|', '✦', '※', '·'][Math.floor(Math.random() * 6)],
      life: 500 + Math.random() * 200,
    });
  }

  // 4. 血渣加倍
  spawnBloodGore(enemy.x, enemy.y, 14);

  // 5. 慢动作 + 震动
  triggerSlowMo(0.3, 120);
  shake(8, 140);
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

// 获取屏幕震动偏移
export function getShakeOffset() {
  if (shakeDuration <= 0) return { x: 0, y: 0 };
  shakeDuration -= 16;
  if (shakeDuration <= 0) { shakeIntensity = 0; return { x: 0, y: 0 }; }
  return {
    x: (Math.random() - 0.5) * shakeIntensity * 2,
    y: (Math.random() - 0.5) * shakeIntensity * 2,
  };
}

// 重置
export function resetCombatFeedback() {
  shakeIntensity = 0;
  shakeDuration = 0;
  slowMoFactor = 1.0;
  slowMoEnd = 0;
}

// ============================================================
// 伤害计算 (v6.2 从 main.js 迁移)
// ============================================================

/**
 * 对敌人造成伤害 — 计算护甲减伤、暴击倍率、生命偷取、生成飘字
 * 新增：统觉之眼必暴击判定
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

  const effectiveDmg = isCrit ? rawDmg * critDmg : rawDmg;
  const dmg = Math.max(1, effectiveDmg - enemy.def * 0.5);
  enemy.hp -= dmg;
  world.damageTexts.push({
    x: enemy.x, y: enemy.y - 18,
    value: Math.floor(dmg),
    isCrit, life: 800,
  });
  if (lifesteal > 0) {
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + dmg * lifesteal);
  }
  return dmg;
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
