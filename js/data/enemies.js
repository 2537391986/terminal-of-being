// js/data/enemies.js
// 怪物模板:10 普通 + 2 精英 + 5 Boss = 17(MVP 必须实现)
//
// ═══════════════════════════════════════════════════════════════
// 设计注记：怪物命名体系
// ═══════════════════════════════════════════════════════════════
// 普通怪命名遵循「投影/残存」隐喻——它们不是原初哲学概念本身，而是在
// "存在终端"这个虚拟空间中被投射出的残影、回声、裂隙、遗迹、空壳或
// 循环体。命名策略分两类：
//   A. 直接使用概念名(适合短且辨识度高的概念，如"人是万物的尺度")
//   B. 概念名 + 存在论隐喻后缀
//      - "残响"：拉康"镜像阶段"——不是原物，是它在象征界的回声
//      - "回声"：哈贝马斯"公共领域"——话语的返回与变形
//      - "遗迹"：福柯"知识考古学"——被挖掘的、非连续的历史层
//      - "裂隙"：哥德尔不完备——系统内部"不可证的裂缝"
//      - "循环"：阿多诺"文化工业"——标准化再生产
//      - "空壳"：维也纳学派"证实原则"——被驳倒后留下的空壳
//   注意：v4 中"知识考古虫"的"虫"后缀打破了体系一致性(生物隐喻vs.
//   存在论隐喻)，已改为"知识考古遗迹"。
//
// 精英命名：概念失败/瓦解后的"强化版本"——如"我思残骸"是笛卡尔
//   cogito 被过度推演后的废墟状态。
//
// Boss 命名：Boss 是概念的"完整具象化"——如"此在残响"是海德格尔此在
//   概念的战斗态投射。每个 Boss 对应一个特定关卡(关卡尾数0)，有独特
//   机制(但 v6.0 尚未实装 Boss 专属机制)。
// ═══════════════════════════════════════════════════════════════

export const ENEMY_TEMPLATES = [
  // 普罗泰戈拉："人是万物的尺度"(Homo mensura)——真理依赖于感知者。
  // 作为首个解锁的普通怪，它代表了一切"视角主义"的起点。
  { id:'e_protag_measure',   name:'人是万物的尺度',  symbol:'π',  type:'normal', conceptId:'protagoras',              stageRange:[1,999] },
  // 笛卡尔：cogito——"我思故我在"，近代哲学的起点。早期出现，退出较早(30层后不再
  // 出现)，因为笛卡尔的确定性在更深层开始瓦解。
  { id:'e_cogito_ghost',     name:'我思故我在',      symbol:'©',  type:'normal', conceptId:'cogito',                   stageRange:[1,30]  },
  // 帕斯卡：用概率论论证信仰。"赌注"(wager)而非"赌局"(game)——这关于决定论的
  // 主体抉择，不是随机游戏。统一为概念库中的"帕斯卡赌注"。
  { id:'e_pascal_wager',     name:'帕斯卡赌注',      symbol:'P',  type:'normal', conceptId:'pascal_wager',              stageRange:[5,60]  },
  // 维特根斯坦后期：语言的意义 = 它的使用方式。"残响"——这已经不是原初的
  // 语言游戏，只是在"存在终端"里回荡的、脱离了具体生活形式的语言碎片。
  { id:'e_language_game',    name:'语言游戏残响',    symbol:'W',  type:'normal', conceptId:'language_game',             stageRange:[8,80]  },
  // 哈贝马斯："公共领域"——公民理性讨论的场所。"回声"——在数字空间里，公共
  // 领域的回声比原始发声更嘈杂。
  { id:'e_public_sphere',    name:'公共领域回声',    symbol:'h',  type:'normal', conceptId:'public_sphere',             stageRange:[10,100] },
  // 列维-施特劳斯：文化由二元对立(生/死、男/女、昼/夜)组织。"体"——它自身
  // 就是一个二元对立的具象化存在。
  { id:'e_binary_oppose',    name:'二元对立体',      symbol:'±',  type:'normal', conceptId:'structuralism',             stageRange:[15,120] },
  // 福柯：不研究"思想史"，研究"话语"的断裂与重组。"遗迹"——不是福柯本人的
  // 著作，而是他的方法论在挖掘时留下的考古坑。
  { id:'e_knowledge_arch',   name:'知识考古遗迹',    symbol:'K',  type:'normal', conceptId:'knowledge_archaeology',     stageRange:[20,150] },
  // 阿多诺 & 霍克海默：大众文化被标准化生产。"循环"——它像一个永不停歇的
  // 流水线，生产标准化的攻击模式。
  { id:'e_culture_industry', name:'文化工业循环',    symbol:'a',  type:'normal', conceptId:'culture_industry',          stageRange:[25,200] },
  // 维也纳学派："有意义的命题必须可被经验证实"。"空壳"——这个原则本身无法
  // 被经验证实，所以它只是一个空壳——但它仍然在攻击你。
  { id:'e_vienna_verify',    name:'证实原则空壳',    symbol:'V',  type:'normal', conceptId:'verificationism',           stageRange:[30,250] },
  // 哥德尔：任何足够强的系统都存在不可证的命题。"裂隙"——系统的裂缝本身
  // 是一种存在。你在攻击一个形式系统的漏洞。
  { id:'e_godel_incompl',    name:'哥德尔裂隙',      symbol:'G',  type:'normal', conceptId:'godel_incompleteness',      stageRange:[40,300] },
];

export const ELITE_TEMPLATES = [
  // "我思残骸"：笛卡尔 cogito 被过度解构后的废墟。普通版"我思故我在"退出后,
  // 它的残骸作为精英继续存在——"我思"无法被完全消灭。
  { id:'el_cogito_remain',   name:'我思残骸',        symbol:'C',  type:'elite',  conceptId:'cogito',          stageRange:[15,200] },
  // "帕斯卡之魔"：帕斯卡赌注的恶魔版本。笛卡尔有"恶魔"(malin génie),帕斯卡
  // 有赌注——两者的合体：它与你博弈，而且它在作弊。
  { id:'el_pascal_demon',    name:'帕斯卡之魔',      symbol:'D',  type:'elite',  conceptId:'pascal_wager',     stageRange:[20,250] },
];

export const BOSS_TEMPLATES = [
  // 关卡20："此在残响"——海德格尔"此在"(Dasein)：人的在世存在。Boss 是
  // 此在概念的完整战斗态。机制：濒死时获得增强(向死存在)——v6.0待实装。
  { id:'boss_dasein',          name:'此在残响',        symbol:'M', type:'boss', conceptId:'dasein',                 stage:20  },
  // 关卡50："强力意志化身"——尼采"强力意志"(Wille zur Macht)：生命的扩张性。
  // 机制：每次受击后攻击力上升——你越打，它越强——v6.0待实装。
  { id:'boss_will_to_power',   name:'强力意志化身',    symbol:'W', type:'boss', conceptId:'will_to_power',           stage:50  },
  // 关卡80："物自体防壁"——康德"物自体"(Ding an sich)：不可认识的"事物本身"。
  // 机制：只能造成部分伤害(打到的是"现象",不是"物自体")——v6.0待实装。
  { id:'boss_thing_in_itself', name:'物自体防壁',      symbol:'N', type:'boss', conceptId:'thing_in_itself',         stage:80  },
  // 关卡120："明希豪森之结"——认识论的"三重困境"：无穷后退、循环论证、武断停止。
  // 机制：击杀后召唤之前出现过的怪物(循环论证)——v6.0待实装。
  { id:'boss_munchhausen',     name:'明希豪森之结',    symbol:'X', type:'boss', conceptId:'munchhausen_trilemma',    stage:120 },
  // 关卡200："统觉统一场"——康德"先验统觉"：自我意识的先天统一。"我思"贯穿
  // 一切表象。机制：免疫分次伤害(所有攻击视为"同一"次攻击)——v6.0待实装。
  { id:'boss_apperception',    name:'统觉统一场',      symbol:'A', type:'boss', conceptId:'apperception',            stage:200 },
];

// 根据 stage 过滤可用模板(普通怪)
export function pickEnemyTemplate(stage) {
  const pool = ENEMY_TEMPLATES.filter(t => stage >= t.stageRange[0] && stage <= t.stageRange[1]);
  if (pool.length === 0) {
    // fallback: 用最宽的那个(人是万物的尺度)——普罗泰戈拉永不退场
    return ENEMY_TEMPLATES[0];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

// 根据 stage 过滤可用精英
export function pickEliteTemplate(stage) {
  const pool = ELITE_TEMPLATES.filter(t => stage >= t.stageRange[0] && stage <= t.stageRange[1]);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

// 根据 stage 精确匹配 Boss
export function pickBossTemplate(stage) {
  const match = BOSS_TEMPLATES.find(t => t.stage === stage);
  if (!match) return null;
  return match;
}
