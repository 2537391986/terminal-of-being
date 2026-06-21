// js/data/affixes.js
// 词缀池:20 条(MVP 必须实现)
// 每条 = { stat, value, isPercent, weight }

export const AFFIXES = [
  // 普通数值词缀(适用于 magic/rare)
  { stat: 'atk',    value: 3,   isPercent: false, weight: 10 },
  { stat: 'atk',    value: 5,   isPercent: false, weight: 6  },
  { stat: 'def',    value: 2,   isPercent: false, weight: 10 },
  { stat: 'def',    value: 4,   isPercent: false, weight: 6  },
  { stat: 'maxHp',  value: 10,  isPercent: false, weight: 10 },
  { stat: 'maxHp',  value: 20,  isPercent: false, weight: 6  },
  { stat: 'aspd',   value: 0.1, isPercent: false, weight: 8  },

  // 百分比词缀(适用于 rare/epic)
  { stat: 'atk',       value: 0.05, isPercent: true, weight: 8 },
  { stat: 'atk',       value: 0.1,  isPercent: true, weight: 4 },
  { stat: 'def',       value: 0.05, isPercent: true, weight: 8 },
  { stat: 'maxHp',     value: 0.1,  isPercent: true, weight: 8 },
  { stat: 'crit',      value: 0.03, isPercent: true, weight: 6 },
  { stat: 'critDmg',   value: 0.15, isPercent: true, weight: 5 },
  { stat: 'dodge',     value: 0.03, isPercent: true, weight: 5 },
  { stat: 'lifesteal', value: 0.03, isPercent: true, weight: 4 },

  // 高阶词缀(适用于 epic/legendary)
  { stat: 'atk',        value: 0.2,  isPercent: true,  weight: 2 },
  { stat: 'critDmg',    value: 0.3,  isPercent: true,  weight: 2 },
  { stat: 'itemFind',   value: 0.05, isPercent: true,  weight: 3 },
  { stat: 'rarityFind', value: 0.03, isPercent: true,  weight: 3 },
  { stat: 'luck',       value: 10,   isPercent: false, weight: 3 },
  { stat: 'aspd',       value: 0.2,  isPercent: false, weight: 2 },
];

// 按稀有度筛选可用词缀(防止 common 出百分比词缀)
export function getAffixPoolForRarity(rarity) {
  switch (rarity) {
    case 'common':
      return AFFIXES.filter(a => !a.isPercent && a.value <= 5);
    case 'magic':
      return AFFIXES.filter(a => !a.isPercent);
    case 'rare':
    case 'epic':
      return AFFIXES;
    case 'legendary':
    case 'mythic':
      return AFFIXES.filter(a => a.weight <= 5 || a.isPercent);
    default:
      return AFFIXES;
  }
}

// 加权随机选一条
export function rollAffix(pool, level = 1) {
  const totalWeight = pool.reduce((s, a) => s + a.weight, 0);
  let roll = Math.random() * totalWeight;
  const affix = pool.find(a => { roll -= a.weight; return roll <= 0; }) || pool[0];

  const scale = 1 + (level - 1) * 0.03; // 每级 +3%
  return {
    stat: affix.stat,
    value: affix.isPercent
      ? parseFloat((affix.value * scale).toFixed(4))
      : parseFloat((affix.value * scale).toFixed(3)),
    isPercent: affix.isPercent,
    name: affixName(affix),
  };
}

function affixName(affix) {
  const pct = affix.isPercent ? `+${Math.round(affix.value * 100)}%` : `+${affix.value}`;
  return `${STAT_LABELS[affix.stat] || affix.stat}${pct}`;
}

import { STAT_LABELS } from './constants.js';
