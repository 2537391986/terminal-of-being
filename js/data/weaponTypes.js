// js/data/weaponTypes.js
// 武器攻击类型定义 — 决定投射物样式、速度、数量、特效
//
// 每种武器引用其中一个 attackType，main.js 的射击循环根据类型生成投射物。

export const WEAPON_TYPES = {

  // ── "思" — 默认武器，思考波 ──
  // 笛卡尔式悬置：思想作为初始武器。慢速、穿透、多枚。
  // 玩家体验：不是"砍"而是"渗透"——思想穿过敌人，触碰后面的敌人。
  thought: {
    symbol: '思',
    glowColor: '#00d4ff',       // 青蓝 — 冷静的思辨
    glowRadius: 16,
    // 投射物参数
    projSymbol: '\u00B7',       // · 中点 — 思想的轻盈
    projColor: '#00d4ff',
    projSpeed: 280,             // 慢速穿透
    projCount: 1,               // 基础 1 枚
    projDamageMul: 0.8,        // 单发伤害 80%
    projPierce: true,           // ★ 穿透：穿过敌人继续飞行
    projSpread: 0,             // 不散射
    // 间隔发射：每 3 次射击中有 1 次是 3 枚思考波
    intervalShots: 3,
    intervalCount: 3,
    intervalSpread: 0.08,      // 3-way 角度偏移
    description: '思考波：慢速穿透弹，每 3 次射击释放 3 枚',
  },

  // ── 偶因论之钥 — 符号斩 ──
  // 马勒伯朗士的偶因论：你的"挥剑"只是机缘(occasion)，真正的伤害由上帝中介。
  // 快、直接、高暴击潜力的单体打击。
  symbolic_slash: {
    symbol: '\u2020',           // † — 匕首/十字
    glowColor: '#ffd700',       // 金色 — rare 品质
    glowRadius: 12,
    projSymbol: '\u2020',       // †
    projColor: '#ffd700',
    projSpeed: 550,             // 快速弹
    projCount: 1,
    projDamageMul: 1.1,        // 110% 伤害
    projPierce: false,
    projSpread: 0,
    intervalShots: 1,           // 每发都一样
    intervalCount: 1,
    intervalSpread: 0,
    description: '符号斩：快速单体弹，伤害 110%',
  },

  // ── 明希豪森困境之钥 — 三重困境 ──
  // 认识论三难：无穷后退、循环论证、武断停止。
  // 每一次攻击同时提出三重驳斥——散射、高伤害、不可回避。
  trilemma: {
    symbol: '\u2234',           // ∴ — therefore，这就是困境
    glowColor: '#ff4444',       // 传说红
    glowRadius: 20,
    projSymbol: '\u2234',       // ∴
    projColor: '#ff4444',
    projSpeed: 220,             // 慢速 — 三重困境逼近而非突袭
    projCount: 3,               // ★ 3 枚散射
    projDamageMul: 0.5,        // 单发 50%（3 发合计 150%）
    projPierce: false,
    projSpread: 0.12,          // 3-way 散射角度
    intervalShots: 1,           // 每发都一样
    intervalCount: 3,
    intervalSpread: 0.12,
    description: '三重困境：3 枚慢速散射弹，合计伤害 150%',
  },
};

/**
 * 获取武器类型的投射物配置
 * @param {string} attackType — "thought" | "symbolic_slash" | "trilemma"
 * @returns {Object|null} WEAPON_TYPES 条目
 */
export function getWeaponType(attackType) {
  return WEAPON_TYPES[attackType] || WEAPON_TYPES.thought;
}

// ── 默认武器 "思" 的物品模板 ──
// 玩家初始装备，不掉落，不占用 stage range。
// 当 weapon 槽位为空时，系统自动回退到 thought 类型。
export const DEFAULT_WEAPON = {
  templateId: 'default_thought',
  name: '思考',
  rarity: 'common',
  slot: 'weapon',
  attackType: 'thought',
  baseStats: { atk: 0 },
  effects: [],
  concept: {
    id: 'default_thought',
    term: '思考(Pensée)',
    termEn: 'Thinking / Cogito',
    school: '笛卡尔 / 理性主义',
    field: '哲学',
    summary: '我思故我在(Cogito, ergo sum)——思想是此在的第一件也是最后一件武器。',
    designNote: '默认武器。慢速穿透弹——思想不像刀刃锋利，但它穿过一切。',
  },
  flavorText: '笛卡尔: 我思故我在。思想，是此在在概念战场上的初始武器。',
  dropWeight: 0,
};
