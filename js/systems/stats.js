// js/systems/stats.js
// 属性聚合计算:baseStats + 装备(flat) + 词缀(flat/percent) → finalStats

import { state } from '../core/state.js';
import { STAT_LABELS } from '../data/constants.js';
import { getAffixMultiplier } from './effects.js';

// 比例类属性(存 0~1, 词缀 isPercent 直接加绝对值)
const RATIO_STATS = new Set([
  'crit', 'critDmg', 'dodge', 'block',
  'itemFind', 'rarityFind', 'expGain', 'goldGain',
  'lifesteal', 'cooldownRed',
]);

export function recalcStats() {
  const p = state.player;
  // 等级基础(从 state.player 读取)
  const levelBase = {
    maxHp: p.baseMaxHp || 100,
    maxMp: p.baseMaxMp || 30,
    atk:   p.baseAtk   || 10,
    def:   p.baseDef   || 2,
    aspd:  p.baseAspd  || 1.0,
    crit:  p.baseCrit  || 0.05,
    critDmg: p.baseCritDmg || 1.5,
    dodge: 0, block: 0, luck: 0,
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

  // 聚合: ratio stats = base + flat (percent 对 ratio 也是绝对值)
  //       integer stats = (base + flat) * (1 + percent)
  const final = {};
  for (const key of Object.keys(levelBase)) {
    const b = levelBase[key] || 0;
    const f = flat[key] || 0;
    const pct = percent[key] || 0;
    if (RATIO_STATS.has(key)) {
      // crit/dodge 等: percent 值直接加上去(如 +0.03 = +3%)
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
