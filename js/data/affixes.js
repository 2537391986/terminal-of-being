// js/data/affixes.js
// 词缀池：45 条（v7.2 从 20 条扩展至 45 条）
// 每条 = { stat, value, isPercent, weight, flavor(可选哲学风味前缀) }
//
// 设计原则：
//   - 覆盖 constants.js 中全部 16 种属性（之前只覆盖 7 种）
//   - 每个词缀可选携带 flavor 字段，渲染时显示「弗洛伊德式的 否认+3%」
//     而非裸「否认+3%」——让词缀本身就是一次哲学引用
//   - 按稀有度分层：低权重=更强/更稀有，高权重=更常见
//   - 所有数值依然标注 [PLACEHOLDER]，直到跑完 Monte Carlo 模拟

import { STAT_LABELS } from './constants.js';

export const AFFIXES = [
  // ═══════════════════════════════════════════════════════════
  // 一、攻击系（断言力）—— 尼采/维特根斯坦
  // ═══════════════════════════════════════════════════════════
  { stat: 'atk', value: 3,   isPercent: false, weight: 10, flavor: null },
  { stat: 'atk', value: 5,   isPercent: false, weight: 6,  flavor: '尼采式的' },
  { stat: 'atk', value: 8,   isPercent: false, weight: 3,  flavor: '权力意志的' },
  { stat: 'atk', value: 0.05, isPercent: true,  weight: 8,  flavor: null },
  { stat: 'atk', value: 0.10, isPercent: true,  weight: 4,  flavor: '维特根斯坦式的' },
  { stat: 'atk', value: 0.20, isPercent: true,  weight: 2,  flavor: '超人意志的' },

  // ═══════════════════════════════════════════════════════════
  // 二、防御系（自我边界）—— 斯多葛/康德
  // ═══════════════════════════════════════════════════════════
  { stat: 'def', value: 2,   isPercent: false, weight: 10, flavor: null },
  { stat: 'def', value: 4,   isPercent: false, weight: 6,  flavor: '斯多葛式的' },
  { stat: 'def', value: 7,   isPercent: false, weight: 3,  flavor: '不动心的' },
  { stat: 'def', value: 0.05, isPercent: true,  weight: 8,  flavor: null },
  { stat: 'def', value: 0.10, isPercent: true,  weight: 4,  flavor: '康德的' },
  { stat: 'def', value: 0.18, isPercent: true,  weight: 2,  flavor: '先验统觉的' },

  // ═══════════════════════════════════════════════════════════
  // 三、生命系（最大存在强度）—— 海德格尔
  // ═══════════════════════════════════════════════════════════
  { stat: 'maxHp', value: 10,  isPercent: false, weight: 10, flavor: null },
  { stat: 'maxHp', value: 20,  isPercent: false, weight: 6,  flavor: '此在式的' },
  { stat: 'maxHp', value: 35,  isPercent: false, weight: 3,  flavor: '在世存在的' },
  { stat: 'maxHp', value: 0.10, isPercent: true,  weight: 8,  flavor: null },
  { stat: 'maxHp', value: 0.18, isPercent: true,  weight: 4,  flavor: '本真的' },
  { stat: 'maxHp', value: 0.30, isPercent: true,  weight: 2,  flavor: '向死存在的' },

  // ═══════════════════════════════════════════════════════════
  // 四、攻速系（思维频率）—— 笛卡尔/德勒兹
  // ═══════════════════════════════════════════════════════════
  { stat: 'aspd', value: 0.08, isPercent: false, weight: 8,  flavor: null },
  { stat: 'aspd', value: 0.15, isPercent: false, weight: 5,  flavor: '笛卡尔式的' },
  { stat: 'aspd', value: 0.25, isPercent: false, weight: 2,  flavor: '我思故我在的' },

  // ═══════════════════════════════════════════════════════════
  // 五、暴击系（洞见率 / 启示倍率）—— 柏拉图/海德格尔
  // ═══════════════════════════════════════════════════════════
  { stat: 'crit',    value: 0.03, isPercent: true, weight: 6,  flavor: '柏拉图式的' },
  { stat: 'crit',    value: 0.06, isPercent: true, weight: 3,  flavor: '洞见的' },
  { stat: 'crit',    value: 0.10, isPercent: true, weight: 2,  flavor: '直视理念的' },
  { stat: 'critDmg', value: 0.15, isPercent: true, weight: 5,  flavor: null },
  { stat: 'critDmg', value: 0.25, isPercent: true, weight: 3,  flavor: '解蔽的' },
  { stat: 'critDmg', value: 0.40, isPercent: true, weight: 2,  flavor: '真理显现的' },

  // ═══════════════════════════════════════════════════════════
  // 六、否认（闪避率）—— 弗洛伊德/拉康（v7.2 新增属性）
  // ═══════════════════════════════════════════════════════════
  { stat: 'dodge', value: 0.03, isPercent: true, weight: 6,  flavor: '弗洛伊德式的' },
  { stat: 'dodge', value: 0.06, isPercent: true, weight: 3,  flavor: '拉康的' },
  { stat: 'dodge', value: 0.10, isPercent: true, weight: 2,  flavor: '否认创伤的' },

  // ═══════════════════════════════════════════════════════════
  // 七、防御（格挡率）—— 安娜·弗洛伊德/荣格（v7.2 新增属性）
  // ═══════════════════════════════════════════════════════════
  { stat: 'block', value: 0.04, isPercent: true, weight: 6,  flavor: '安娜·弗洛伊德的' },
  { stat: 'block', value: 0.08, isPercent: true, weight: 3,  flavor: '荣格式的' },
  { stat: 'block', value: 0.12, isPercent: true, weight: 2,  flavor: '自我防护的' },

  // ═══════════════════════════════════════════════════════════
  // 八、意义回收（生命偷取）—— 弗兰克尔
  // ═══════════════════════════════════════════════════════════
  { stat: 'lifesteal', value: 0.02, isPercent: true, weight: 5,  flavor: null },
  { stat: 'lifesteal', value: 0.04, isPercent: true, weight: 3,  flavor: '弗兰克尔式的' },
  { stat: 'lifesteal', value: 0.07, isPercent: true, weight: 2,  flavor: '意义回收的' },

  // ═══════════════════════════════════════════════════════════
  // 九、方法论压缩（冷却缩减）—— 培根/笛卡尔（v7.2 新增属性）
  // ═══════════════════════════════════════════════════════════
  // 注：当前版本无主动技能系统，此词缀预留给 v0.8+ 的技能系统
  { stat: 'cooldownRed', value: 0.05, isPercent: true, weight: 4,  flavor: '培根式的' },
  { stat: 'cooldownRed', value: 0.10, isPercent: true, weight: 2,  flavor: '方法论的' },

  // ═══════════════════════════════════════════════════════════
  // 十、资本积聚（金币加成）—— 马克思（v7.2 新增属性）
  // ═══════════════════════════════════════════════════════════
  { stat: 'goldGain', value: 0.10, isPercent: true, weight: 4,  flavor: '马克思式的' },
  { stat: 'goldGain', value: 0.20, isPercent: true, weight: 2,  flavor: '资本积聚的' },

  // ═══════════════════════════════════════════════════════════
  // 十一、经验吸收（经验加成）—— 洛克（v7.2 新增属性）
  // ═══════════════════════════════════════════════════════════
  { stat: 'expGain', value: 0.08, isPercent: true, weight: 4,  flavor: '洛克式的' },
  { stat: 'expGain', value: 0.16, isPercent: true, weight: 2,  flavor: '经验主义的' },

  // ═══════════════════════════════════════════════════════════
  // 十二、偶然性（运气）—— 赫拉克利特/亚里士多德（v7.2 新增）
  // ═══════════════════════════════════════════════════════════
  { stat: 'luck', value: 8,   isPercent: false, weight: 4,  flavor: '赫拉克利特的' },
  { stat: 'luck', value: 15,  isPercent: false, weight: 2,  flavor: '偶然的' },

  // ═══════════════════════════════════════════════════════════
  // 十三、最大意志（法力上限）—— 叔本华（v7.2 新增属性）
  // ═══════════════════════════════════════════════════════════
  // 注：当前版本无主动技能消耗，此词缀预留给 v0.8+ 的技能系统
  { stat: 'maxMp', value: 5,   isPercent: false, weight: 5,  flavor: '叔本华式的' },
  { stat: 'maxMp', value: 12,  isPercent: false, weight: 3,  flavor: '意志充盈的' },

  // ═══════════════════════════════════════════════════════════
  // 十四、现象捕获（掉落率）—— 梅洛-庞蒂/胡塞尔
  // ═══════════════════════════════════════════════════════════
  { stat: 'itemFind',   value: 0.05, isPercent: true, weight: 3, flavor: '梅洛-庞蒂的' },

  // ═══════════════════════════════════════════════════════════
  // 十五、超验发现（稀有度加成）—— 康德
  // ═══════════════════════════════════════════════════════════
  { stat: 'rarityFind', value: 0.03, isPercent: true, weight: 3, flavor: '先天的' },
  { stat: 'rarityFind', value: 0.06, isPercent: true, weight: 2, flavor: '超验的' },
];

// 按稀有度筛选可用词缀（防止 common 出百分比词缀）
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
  const statLabel = STAT_LABELS[affix.stat] || affix.stat;
  const pct = affix.isPercent
    ? `+${Math.round(affix.value * 100)}%`
    : `+${affix.value}`;
  // 有哲学风味前缀时，显示「尼采式的 断言力+5」
  if (affix.flavor) {
    return `${affix.flavor} ${statLabel}${pct}`;
  }
  return `${statLabel}${pct}`;
}
