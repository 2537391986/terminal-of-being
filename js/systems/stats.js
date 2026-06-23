// js/systems/stats.js
// 属性聚合计算:baseStats + 装备(flat) + 词缀(flat/percent) → finalStats
// v0.8.1: 概率属性改为乘法收益递减，防止 crit/dodge 溢出

import { state } from '../core/state.js';
import { STAT_LABELS } from '../data/constants.js';
import { getAffixMultiplier } from './effects.js';

// 比例类属性(存 0~1)
const RATIO_STATS = new Set([
  'crit', 'critDmg', 'dodge', 'block',
  'itemFind', 'rarityFind', 'expGain', 'goldGain',
  'lifesteal', 'cooldownRed',
]);

// 需要乘法递减合并的真实概率属性（上限 < 1，堆多了收益递减）
// 公式：actual = 1 - ∏(1 - bonusᵢ)
// 例：基础 5% + 词缀 10% → 1 - (0.95 × 0.90) = 14.5%（而非 15%）
// 上限 CAP：crit 0.80 / dodge 0.75 / block 0.60 / 其余 0.95
const DIMINISHING_PROB_STATS = new Set(['crit', 'dodge', 'block', 'itemFind', 'lifesteal']);
const PROB_CAPS = { crit: 0.80, dodge: 0.75, block: 0.60, itemFind: 0.95, lifesteal: 0.60 };

/**
 * 乘法递减合并：将多个 isPercent 词缀加成合并为实际概率
 * @param {number} base - 基础概率（0~1）
 * @param {number} percentBonus - 所有百分比词缀加成之和
 * @param {string} key - 属性 key，用于读取上限
 */
function applyDiminishing(base, percentBonus, key) {
  // 将 percentBonus 拆分为多段乘法（此处整体处理等价）
  // actual = 1 - (1 - base) × (1 - percentBonus)
  const result = 1 - (1 - base) * (1 - percentBonus);
  const cap = PROB_CAPS[key] ?? 0.95;
  return Math.min(cap, parseFloat(result.toFixed(4)));
}

export function recalcStats() {
  const p = state.player;
  // 等级基础 + 天赋点（从 state.player 读取）
  const cs = p.customStats || {};
  const levelBase = {
    maxHp: (p.baseMaxHp || 100) + (cs.maxHp || 0),
    maxMp: (p.baseMaxMp || 30)  + (cs.maxMp || 0),
    atk:   (p.baseAtk   || 10)  + (cs.atk   || 0),
    def:   (p.baseDef   || 2)   + (cs.def   || 0),
    aspd:  (p.baseAspd  || 1.0) + (cs.aspd  || 0),
    crit:  (p.baseCrit  || 0.05) + (cs.crit  || 0),
    critDmg: p.baseCritDmg || 1.5,
    dodge: (cs.dodge || 0), block: 0, luck: (cs.luck || 0),
    itemFind: 0, rarityFind: 0, expGain: 0, goldGain: 0,
    lifesteal: 0, cooldownRed: 0,
  };

  // 收集装备基础属性(flat) + 词缀(flat / percent)
  const flat = {};
  const percent = {};
  const equipped = state.equipment;
  for (const slot of Object.keys(equipped)) {
    const items = Array.isArray(equipped[slot]) ? equipped[slot] : [equipped[slot]];
    for (const item of items) {
      if (!item) continue;
      addFlat(flat, item.stats || {});
      if (item.affixes) {
        const mult = getAffixMultiplier();
        for (const affix of item.affixes) {
          const val = affix.value * mult;
          if (affix.isPercent) {
            percent[affix.stat] = (percent[affix.stat] || 0) + val;
          } else {
            flat[affix.stat] = (flat[affix.stat] || 0) + val;
          }
        }
      }
    }
  }

  // 聚合：
  //   - 概率递减属性(crit/dodge/block/itemFind/lifesteal)：乘法递减 + 硬上限
  //   - 其余 ratio 属性(expGain/goldGain/cooldownRed 等)：直接加法（倍率类，可以超过 100%）
  //   - 整数属性(atk/def/maxHp 等)：(base + flat) * (1 + percent)
  //   - aspd：(base + flat) * (1 + percent)
  const final = {};
  for (const key of Object.keys(levelBase)) {
    const b = levelBase[key] || 0;
    const f = flat[key] || 0;
    const pct = percent[key] || 0;
    if (DIMINISHING_PROB_STATS.has(key)) {
      // 乘法收益递减：base 先加上 flat（天赋/装备基础值），再用 percent 做乘法叠加
      final[key] = applyDiminishing(b + f, pct, key);
    } else if (RATIO_STATS.has(key)) {
      // 倍率类（expGain/goldGain/critDmg 等）：直接加法，不做递减
      final[key] = parseFloat((b + f + pct).toFixed(4));
    } else if (key === 'aspd') {
      final[key] = parseFloat(((b + f) * (1 + pct)).toFixed(3));
    } else {
      final[key] = Math.round((b + f) * (1 + pct));
    }
  }

  p.finalStats = final;
}

function addFlat(target, source) {
  for (const [key, val] of Object.entries(source)) {
    if (val === undefined || val === null) continue;
    target[key] = (target[key] || 0) + val;
  }
}

export function formatStat(key, value) {
  const label = STAT_LABELS[key] || key;
  const pctKeys = ['crit', 'critDmg', 'dodge', 'block', 'itemFind', 'rarityFind', 'expGain', 'goldGain', 'lifesteal', 'cooldownRed'];
  if (pctKeys.includes(key)) {
    return `${label} ${(value * 100).toFixed(1)}%`;
  }
  if (key === 'aspd') {
    return `${label} ${value.toFixed(2)}`;
  }
  return `${label} ${Math.floor(value)}`;
}

export function compareItems(itemA, itemB) {
  const diff = {};
  const allKeys = new Set([
    ...Object.keys(itemA?.stats || {}),
    ...Object.keys(itemB?.stats || {}),
  ]);
  for (const key of allKeys) {
    const a = (itemA?.stats || {})[key] || 0;
    const b = (itemB?.stats || {})[key] || 0;
    diff[key] = b - a;
  }
  return diff;
}
