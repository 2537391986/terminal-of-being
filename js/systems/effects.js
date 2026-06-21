// js/systems/effects.js
// 装备效果统一解析模块（v7.0）

import { state } from '../core/state.js';

// ╍══════════════════════════════════════════════════════════
// 模块级状态（不需要存档的运行时计时器）
// ╍══════════════════════════════════════════════════════════

// 绝对命令之律：追踪上次闪避时间
let lastDodgeTime = 0;

// ╍══════════════════════════════════════════════════════════
// 工具：收集已装备物品的所有效果
// ╍══════════════════════════════════════════════════════════

export function getAllEquippedEffects() {
  const result = [];
  const eq = state.equipment;
  for (const [slot, val] of Object.entries(eq)) {
    const items = Array.isArray(val) ? val : [val];
    for (const item of items) {
      if (!item || !item.effects || item.effects.length === 0) continue;
      for (const eff of item.effects) {
        result.push({ slot, item, effect: eff });
      }
    }
  }
  return result;
}

// ╍══════════════════════════════════════════════════════════
// 事件钩子
// ╍══════════════════════════════════════════════════════════

/**
 * 击杀事件 —— encounter.js 的 onEnemyDeath 调用
 * 处理：on_kill（强力意志之冠）
 */
export function onKill() {
  const all = getAllEquippedEffects();
  for (const { effect } of all) {
    if (effect.type === 'on_kill' && effect.effect === 'atk_stack') {
      state.player.killAtkStack += (effect.value || 2);
    }
  }
}

/**
 * 闪避事件 —— combat.js 的 damagePlayer 在闪避成功时调用
 */
export function onDodge() {
  lastDodgeTime = Date.now();
}

/**
 * 每通过 10 层调用一次 —— encounter.js 的 endWave 调用
 * 处理：conditional(stage_clear) → 明希豪森困境之钥
 */
export function incrementStageClearStack() {
  const all = getAllEquippedEffects();
  for (const { effect } of all) {
    if (effect.type === 'conditional' && effect.trigger === 'stage_clear') {
      state.player.munchhausenStack = (state.player.munchhausenStack || 0) + 1;
    }
  }
}

export function getStageClearStack() {
  return state.player.munchhausenStack || 0;
}

/**
 * 玩家死亡 → 重置局内效果状态
 * 由 main.js 的 onPlayerDeath 调用
 * 注意：munchhausenStack 不重置（永久叠加，卸装后才清零）
 */
export function resetInRunEffects() {
  state.player.killAtkStack = 0;
  lastDodgeTime = 0;
  // munchhausenStack 不重置 —— 死不掉认知的债务
}

// ╍══════════════════════════════════════════════════════════
// 最终属性计算（替代 combat.js 的 getFinalStats）
// ╍══════════════════════════════════════════════════════════

/**
 * @param {Object} [baseFinal] - stats.js 计算的 finalStats（不含动态效果）
 * @returns {Object} 含动态修正的最终属性快照
 */
export function getFinalStats(baseFinal) {
  const s = baseFinal || state.player.finalStats || state.player;
  const hp = state.player.hp || 0;
  const maxHp = s.maxHp || 100;
  const hpPct = hp / Math.max(1, maxHp);

  let bonusAtk = state.player.killAtkStack || 0;
  let bonusAspd = 0;

  const all = getAllEquippedEffects();

  // on_low_hp：低血量效果（向死存在之靴）
  for (const { effect } of all) {
    if (effect.type === 'on_low_hp' && hpPct < effect.threshold) {
      if (effect.stat === 'aspd') bonusAspd += effect.value;
    }
  }

  // conditional(no_dodge_30s)：绝对命令之律
  const noDodgeMs = Date.now() - lastDodgeTime;
  for (const { effect } of all) {
    if (effect.type === 'conditional' && effect.trigger === 'no_dodge_30s') {
      if (noDodgeMs >= 30000) {
        if (effect.effect === 'atk_buff') {
          bonusAtk += Math.round(s.atk * effect.value);
        }
      }
    }
  }

  return {
    ...s,
    atk:  s.atk  + bonusAtk,
    aspd: parseFloat((s.aspd + bonusAspd).toFixed(3)),
  };
}

// ╍══════════════════════════════════════════════════════════
// 敌人属性修改（enemy_debuff 效果）
// ╍══════════════════════════════════════════════════════════

/**
 * 计算敌人攻击时的暴击率（应用物自体之盾 debuff）
 * @param {Object} enemy
 * @returns {number} 0~1
 */
export function getEnemyCritRate(enemy) {
  const baseCrit = enemy.crit || 0;
  let debuff = 0;
  const all = getAllEquippedEffects();
  for (const { effect } of all) {
    if (effect.type === 'enemy_debuff' && effect.stat === 'crit') {
      debuff += (effect.value || 0);
    }
  }
  return Math.max(0, baseCrit + debuff);
}

// ╍══════════════════════════════════════════════════════════
// 玩家暴击判定修改（guaranteed_crit_low_hp 效果）
// ╍══════════════════════════════════════════════════════════

/**
 * 检查玩家攻击是否必暴击（统觉之眼效果）
 * @param {number} enemyHpPct 0~1
 * @returns {boolean}
 */
export function shouldGuaranteeCrit(enemyHpPct) {
  const all = getAllEquippedEffects();
  for (const { effect } of all) {
    if (effect.type === 'guaranteed_crit_low_hp') {
      if (enemyHpPct < effect.threshold) return true;
    }
  }
  return false;
}

// ╍══════════════════════════════════════════════════════════
// 明希豪森困境之钥：词缀效果叠加乘数
// 由 stats.js 的 recalcStats 调用
// ╍══════════════════════════════════════════════════════════

/**
 * @returns {number} 基础 1.0，装备了明希豪森且每10层 +0.05
 */
export function getAffixMultiplier() {
  const all = getAllEquippedEffects();
  for (const { effect } of all) {
    if (effect.type === 'conditional' && effect.trigger === 'stage_clear') {
      const stack = state.player.munchhausenStack || 0;
      return parseFloat((1.0 + stack * 0.05).toFixed(4));
    }
  }
  return 1.0;
}
