// js/data/constants.js
// 所有数值常量(单一真相源)
// 
// ═══════════════════════════════════════════════════════════════
// 设计注记：术语体系
// ═══════════════════════════════════════════════════════════════
// 本文件所有术语均映射自西方哲学核心概念，设计意图是让每一次数值
// 增减都在语义层面与世界观共振：
//
//   - 稀有度标签按「认知层」递进：从"现象"(可感的)到"终极命题"
//     (不可言说但被追问的)，对应康德现象/物自体二分与怀疑论传统。
//   - 属性标签以"存在论/认识论/伦理学"三层组织：战斗属性(断言力、
//     自我边界等)来自主体哲学；掉落属性(现象捕获、超验发现等)来自
//     认识论；经济属性(资本积聚、意义回收等)来自批判理论。
//   - 所有术语设计都要回答一个问题："这个数字变化时，玩家在哲学层面
//     上正在发生什么？"
// ═══════════════════════════════════════════════════════════════

// === 玩家初始值 ===
export const PLAYER_BASE_STATS = {
  maxHp: 100,
  maxMp: 30,
  atk: 10,
  def: 2,
  aspd: 1.0,
  crit: 0.05,
  critDmg: 1.5,
  dodge: 0,
  block: 0,
  luck: 0,
  itemFind: 0,
  rarityFind: 0,
  expGain: 0,
  goldGain: 0,
  lifesteal: 0,
  cooldownRed: 0,
};

// === 稀有度 ===
// 稀有度按「认知层级」递进设计——从最朴素的感官经验到最抽象的终极追问：
//
// common:   "现象的" — 康德区分"现象"(Phaenomena,可被感官经验把握者)与
//           "物自体"(Noumena,超越经验不可知者)。最低稀有度的装备只是进入
//           现象界的门槛。注：原名"经验的"与EXP(经验值)在中文里同形同音，
//           极易混淆，故改。
// magic:    "概念的" — 进入知性(Verstand)层面，概念是知性的基本单元。装备
//           开始获得"词缀"——概念开始能"言说"自身。
// rare:     "超验的" — Transzendental,康德的"先验"：超越经验但构成经验的
//           条件。装备属性显著增强，暗示其运作在"经验如何可能"的层面。
// epic:     "存在的" — Sein/Being,海德格尔的核心追问。装备获得"特殊效果"
//           (hasEffect=true)，因为"存在"自身就是一种效果。
// legendary:"不可言说的" — 维特根斯坦《逻辑哲学论》结尾："凡不可言说者,必须
//           保持沉默。"传奇装备的属性突破数值上限，如同那些"显示自身"而
//           无法被命题捕获之物。
// mythic:   "终极命题的" — 承接"明希豪森三重困境"：一切证明的终点都是终极
//           命题。神话装备是整个认知体系的尽头——它既是最强，也是终结。
export const RARITIES = {
  common:    { label: '现象的',     color: '#888888', weight: 650,  affixCount: 0, statMul: 1.0, hasEffect: false },
  magic:     { label: '概念的',     color: '#44aaff', weight: 250,  affixCount: 1, statMul: 1.3, hasEffect: false },
  rare:      { label: '超验的',     color: '#ffcc44', weight: 80,   affixCount: 2, statMul: 1.6, hasEffect: false },
  epic:      { label: '存在的',     color: '#cc44ff', weight: 18,   affixCount: 2, statMul: 2.0, hasEffect: true  },
  legendary: { label: '不可言说的', color: '#ff8844', weight: 2,    affixCount: 3, statMul: 2.5, hasEffect: true  },
  mythic:    { label: '终极命题的', color: '#ff4444', weight: 0.2,  affixCount: 4, statMul: 3.2, hasEffect: true  },
};

// === 装备部位 ===
export const SLOTS = {
  weapon:  { label: '武器',     icon: '⚔' },
  head:    { label: '头部',     icon: '⛑' },
  chest:   { label: '胸甲',     icon: '🛡' },
  gloves:  { label: '护手',     icon: '🧤' },
  boots:   { label: '鞋子',     icon: '👢' },
  ring:    { label: '戒指',     icon: '💍' },
  amulet:  { label: '项链',     icon: '📿' },
  charm:   { label: '护符',     icon: '🔮' },
  core:    { label: '终端核心', icon: '◈' },
};

// === 属性显示 ===
// ※ 每个属性名都在哲学层面有一个"语义锚点"。设计原则：
//    - 战斗属性 → 主体哲学(笛卡尔/尼采/海德格尔)
//    - 防御属性 → 精神分析/认识论边界
//    - 掉落属性 → 现象学/认识论
//    - 经济属性 → 批判理论/法兰克福学派
// 
// ── 战斗属性(存在论) ──
// maxHp:    "最大存在强度" — 来自海德格尔"此在的存在"：生命值不是血条，
//           而是"在世存在的强度"。Dasein越本真(authentic),存在强度越高。
// maxMp:    "最大意志" — 来自叔本华/尼采的"意志"(Wille)：法力不是魔力,
//           而是"去做X的意志存量"。耗尽意志=颓废(decadence)。
// atk:      "断言力" — 来自分析哲学"命题态度"+尼采"肯定"：每一次攻击是一
//           次对"我存在"的断言(Affirmation)。断言力越强，对你存在的肯定越
//           不容反驳。
// def:      "自我边界" — 来自精神分析"自我边界"(Ego Boundary)：防御力不是
//           盔甲厚度，而是"我与非我之间的分界线"的清晰程度。边界模糊则伤害
//           穿透；边界坚固则"他者"难以侵入。
// aspd:     "思维频率" — 来自笛卡尔/现象学"思"(cogito/cogitatio)：攻速不是
//           武器挥舞速度，而是"每秒钟能进行的思的单元数"。我思越快，则存在
//           越密集。
// crit:     "洞见率" — 来自柏拉图"洞见"(noesis)/康德"直观"：暴击不是偶然的
//           要害打击，而是一次穿透表象直抵"事物本身"的洞见闪现。
// critDmg:  "启示倍率" — 来自海德格尔"解蔽"(aletheia)/神学"启示"：暴击伤害
//           不是"技能加成"，而是真理(Aletheia)被解蔽时的能量释放倍数。
// 
// ── 防御机制(主体边界论) ──
// dodge:    "否认" — 来自弗洛伊德"否认"(Verleugnung)防御机制：闪避不是物理
//           位移，而是主体对"攻击发生了"这一命题的否认。你否认了那记伤害的
//           存在性，它便无从击中你。
// block:    "防御" — 来自安娜·弗洛伊德"自我与防御机制"：格挡不是举盾，而是
//           自我(Ego)在面对威胁时启动的防护机制——将冲击从"我"转移出去。
// 
// ── 掉落/发现(认识论) ──
// luck:     "偶然性" — 来自亚里士多德"偶然"(symbebekos)/海德格尔"被抛"
//           (Geworfenheit)：运气不是幸运值，而是"世界固有的偶然性密度"。
//           你无法控制偶然，但你可以增加自己在偶然之流中的表面积。
// itemFind: "现象捕获" — 来自胡塞尔现象学"现象"(Phänomen)：掉落率不是"怪物
//           身上掉东西的概率"，而是你的意识"捕捉到现象的概率"。现象一直在,
//           你只是有时注意到。
// rarityFind:"超验发现" — 来自康德"超验"(transzendental)：高稀有度的发现
//           不是运气，而是"使经验成为可能的先天条件"在起作用。
// expGain:  "经验吸收" — 来自洛克"经验主义"(Empiricism)："一切观念来自经验"
//           ——你打倒一个存在体，它的存在经验被你吸收进你自己的认知结构。
// goldGain: "资本积聚" — 来自马克思《资本论》"资本积累"(Akkumulation)：
//           金币不是金钱，而是"抽象劳动时间的凝结"。打倒越多，积累的抽象
//           价值越多。
// 
// ── 持续/恢复 ──
// lifesteal:"意义回收" — 来自弗兰克尔"意义疗法"/尼采"价值的重估"：吸血不是
//           物理吸血，而是每一次攻击都在"回收"被他者消解的意义——你从对方的
//           存在中夺回你的存在。
// cooldownRed:"方法论压缩" — 来自笛卡尔《方法论》(Discours de la méthode)：
//           冷却缩减不是"魔法更快了"，而是你的思维方法在优化——同一套操作,
//           更高效的执行路径。
export const STAT_LABELS = {
  maxHp:      '最大存在强度',
  maxMp:      '最大意志',
  atk:        '断言力',
  def:        '自我边界',
  aspd:       '思维频率',
  crit:       '洞见率',
  critDmg:    '启示倍率',
  dodge:      '否认',
  block:      '防御',
  luck:       '偶然性',
  itemFind:   '现象捕获',
  rarityFind: '超验发现',
  expGain:    '经验吸收',
  goldGain:   '资本积聚',
  lifesteal:  '意义回收',
  cooldownRed:'方法论压缩',
};

// === 通俗术语映射（供术语切换按钮使用）===
// 当玩家切换为"游戏术语"模式时，所有属性显示使用此套标签。
// 设计原则：每一个通俗术语都一一对应的哲学术语，语义锚点相同，
// 只是改用玩家更熟悉的 ARPG 通用语。
export const STAT_PLAIN_LABELS = {
  maxHp:      '最大生命值',
  maxMp:      '最大法力值',
  atk:        '攻击力',
  def:        '防御力',
  aspd:       '攻击速度',
  crit:       '暴击率',
  critDmg:    '暴击伤害',
  dodge:      '闪避率',
  block:      '格挡率',
  luck:       '运气',
  itemFind:   '掉落率',
  rarityFind: '稀有度加成',
  expGain:    '经验加成',
  goldGain:   '金币加成',
  lifesteal:  '生命偷取',
  cooldownRed:'冷却缩减',
};

// HUD 属性速览行用的短标签（哲学/通俗各一套）
export const STAT_SHORT_LABELS = {
  atk:   '断言',
  def:   '边界',
  aspd:  '频率',
  crit:  '洞见',
};
export const STAT_SHORT_PLAIN = {
  atk:   '攻击',
  def:   '防御',
  aspd:  '攻速',
  crit:  '暴击',
};

// 属性悬停注释 — 无论当前用哪套术语，hover 时都显示完整解释
// 格式: [哲学术语 | 通俗术语] — 哲学出处 + 一句话解释
export const STAT_TOOLTIPS = {
  maxHp:      '最大存在强度 | 最大生命值 — 来自海德格尔"此在的存在"(Dasein)：生命值不是血条，而是"在世存在的强度"。',
  maxMp:      '最大意志 | 最大法力值 — 来自叔本华/尼采"意志"(Wille)：法力是"去做X的意志存量"，耗尽=颓废。',
  atk:        '断言力 | 攻击力 — 来自分析哲学"命题态度"+尼采"肯定"：每一次攻击是对"我存在"的一次断言。',
  def:        '自我边界 | 防御力 — 来自精神分析"自我边界"(Ego Boundary)：防御是"我与非我之间分界线"的清晰程度。',
  aspd:       '思维频率 | 攻击速度 — 来自笛卡尔"思"(cogito)：攻速是"每秒钟能进行的思的单元数"，我思越快存在越密集。',
  crit:       '洞见率 | 暴击率 — 来自柏拉图"洞见"(noesis)：暴击是一次穿透表象直抵"事物本身"的洞见闪现。',
  critDmg:    '启示倍率 | 暴击伤害 — 来自海德格尔"解蔽"(aletheia)：暴击伤害是真理被解蔽时的能量释放倍数。',
  dodge:      '否认 | 闪避率 — 来自弗洛伊德"否认"(Verleugnung)防御机制：不是物理闪避，而是主体对"攻击发生了"这一命题的否认。',
  block:      '防御 | 格挡率 — 来自安娜·弗洛伊德"自我与防御机制"：自我在面对威胁时启动的防护机制。',
  luck:       '偶然性 | 运气 — 来自亚里士多德"偶然"(symbebekos)：运气是"世界固有的偶然性密度"，你可以增加自己在偶然之流中的表面积。',
  itemFind:   '现象捕获 | 掉落率 — 来自胡塞尔现象学：掉落率不是"怪物身上掉东西"，而是意识"捕捉到现象的概率"——现象一直在，你只是有时注意到。',
  rarityFind: '超验发现 | 稀有度加成 — 来自康德"超验"(transzendental)：高稀有度的发现不是运气，而是"使经验成为可能的先天条件"。',
  expGain:    '经验吸收 | 经验加成 — 来自洛克经验主义：打倒一个存在体，它的存在经验被你吸收进自己的认知结构。',
  goldGain:   '资本积聚 | 金币加成 — 来自马克思《资本论》"资本积累"：金币是"抽象劳动时间的凝结"。',
  lifesteal:  '意义回收 | 生命偷取 — 来自弗兰克尔"意义疗法"：每一次攻击都在回收被他者消解的意义，从对方的存在中夺回你的存在。',
  cooldownRed:'方法论压缩 | 冷却缩减 — 来自笛卡尔《方法论》：冷却缩减不是"魔法更快了"，而是思维方法在优化执行路径。',
};

// === 掉落概率 ===
export const DROP_CHANCE = {
  normal: 0.08,
  elite:  0.35,
  boss:   1.0,
};

// === 升级成长(每级) ===
export const LEVEL_UP = {
  maxHp: 10,
  maxMp: 2,
  atk:   2,
  def:   1,
};

// === 经验公式 ===
export function expToNext(level) {
  return Math.floor(20 * Math.pow(level, 1.45));
}

// === 敌人属性公式(stage = 当前层数) ===
export function enemyStats(stage) {
  return {
    hp:   30 * Math.pow(stage, 1.35),
    atk:  4  * Math.pow(stage, 1.18),
    def:  1  + Math.pow(stage, 1.05),
    exp:  5  * Math.pow(stage, 1.15),
    gold: 3  * Math.pow(stage, 1.10),
  };
}

// === 精英/Boss 倍率 ===
export const ELITE_MUL = { hp: 3, atk: 1.8, def: 1.5 };
export const BOSS_MUL  = { hp: 10, atk: 2.5, def: 2 };

// === 背包上限 ===
// 背包容量 — 40 格 = 4 行 x 10 列的视觉布局，同时确保挂机约 2-3 波不掉满
// (每波最多 8 敌, 掉落率 ~25%, 平均每波 2 件, 40 格 = ~20 波容量)
export const INVENTORY_MAX = 40;

// === 自动保存间隔(ms) ===
export const AUTO_SAVE_INTERVAL = 10000;

// === 装备掉落过期时间(ms) ===
export const DROP_LIFETIME = 30000;
