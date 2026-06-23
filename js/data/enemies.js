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
  { id:'e_language_game',    name:'语言游戏残响',    symbol:'L',  type:'normal', conceptId:'language_game',             stageRange:[8,80]  },
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
  // ═══════════════════════════════════════════════════════════════
  // 新怪物：道家哲学（v7.2 扩充）
  // ═══════════════════════════════════════════════════════════════
  // 道："道可道，非常道"——无法被完全言说的终极实在。
  { id:'e_dao_echo',        name:'道之残响',      symbol:'道', type:'normal', conceptId:'dao',                  stageRange:[1,999] },
  // 无为："为无为，事无事"——不妄为，顺应自然。
  { id:'e_wuwei_echo',      name:'无为残响',        symbol:'无', type:'normal', conceptId:'wu_wei',               stageRange:[10,200] },
  // 阴阳："一阴一阳之谓道"——互补对立的动态平衡。
  { id:'e_yinyang_cycle',    name:'阴阳循环体',      symbol:'☯', type:'normal', conceptId:'yin_yang',             stageRange:[20,250] },
  // ═══════════════════════════════════════════════════════════════
  // 新怪物：佛教哲学（v7.2 扩充）
  // ═══════════════════════════════════════════════════════════════
  // 四圣谛：苦、集、灭、道——佛陀初转法轮的核心教义。
  { id:'e_four_truths',     name:'四圣谛显现',      symbol:'䌀', type:'normal', conceptId:'four_noble_truths',    stageRange:[30,300] },
  // 缘起："此有故彼有"——一切现象依缘而起，无独立实体。
  { id:'e_dependent_arise', name:'缘起之网',        symbol:'⟲', type:'normal', conceptId:'pratityasamutpada', stageRange:[40,300] },
  // 空："诸法无自性"——一切法都是空的，没有固有本质。
  { id:'e_sunyata_echo',    name:'空性残响',        symbol:'∅', type:'normal', conceptId:'sunyata',            stageRange:[50,300] },
  // ═══════════════════════════════════════════════════════════════
  // 新怪物：实用主义 + 科学哲学（v7.2 扩充）
  // ═══════════════════════════════════════════════════════════════
  // 实用主义："真理是有用的信念"——詹姆斯。
  { id:'e_pragmatism',      name:'实用主义残响',    symbol:'⌬', type:'normal', conceptId:'pragmatism',         stageRange:[45,300] },
  // 证伪主义："科学理论只能被证伪"——波普尔。
  { id:'e_falsification',   name:'证伪者',          symbol:'⚡', type:'normal', conceptId:'falsificationism',   stageRange:[55,300] },
  // 范式转换："科学革命的结构"——库恩（待v8.0）。
  { id:'e_paradigm_shift',   name:'范式转换裂隙',    symbol:'⇆', type:'normal', conceptId:'paradigm_shift',     stageRange:[65,300] },
  // 反对方法："怎么都行"——费耶阿本德（待v8.0）。
  { id:'e_against_method',  name:'方法抵抗体',      symbol:'⚎', type:'normal', conceptId:'against_method',     stageRange:[75,300] },
  // ═════════════════════════════════════════════════════════════
  // 新怪物：v7.2 第二批（女性主义 + 政治哲学 + 古希腊）
  // ═════════════════════════════════════════════════════════════
  // 波伏娃："一个人不是生来就是女人"——他者化。
  { id:'e_second_sex',     name:'他者化残响',      symbol:'♀', type:'normal', conceptId:'second_sex',        stageRange:[60,300] },
  // 阿伦特："恶之平庸性"——不思比邪恶更可怕。
  { id:'e_banality_evil',  name:'平庸之恶',        symbol:'◎', type:'normal', conceptId:'banality_of_evil', stageRange:[70,300] },
  // 苏格拉底："未经省察的人生不值得过"——诘问法。
  { id:'e_socratic',       name:'诘问者',          symbol:'?', type:'normal', conceptId:'socratic_method',   stageRange:[5,150] },
  // ═══════════════════════════════════════════════════════════════
  // v0.7.3 第三批扩充：存在主义、解构、古希腊、现象学
  // ═══════════════════════════════════════════════════════════════
  // 亚里士多德："美德是两恶之间的中道"——中庸之道。
  { id:'e_aristotle_mean',  name:'中庸守护者',      symbol:'≡', type:'normal', conceptId:'aristotle_mean',       stageRange:[9,180] },
  // 庄子："不知周之梦为蝴蝶与？"——蝴蝶梦。
  { id:'e_zhuangzi_butter', name:'蝴蝶残响',        symbol:'蝶', type:'normal', conceptId:'zhuangzi_butterfly',  stageRange:[18,220] },
  // 柏拉图："囚徒只看到墙上的影子"——洞穴寓言。
  { id:'e_plato_cave',      name:'洞窟投影',        symbol:'△', type:'normal', conceptId:'plato_cave',           stageRange:[26,250] },
  // 萨特："人假装自己是物来逃避自由"——自欺。
  { id:'e_bad_faith',       name:'自欺残影',        symbol:'ψ', type:'normal', conceptId:'sartre_bad_faith',     stageRange:[34,280] },
  // 加缪："必须想象西西弗是幸福的"——荒谬的反抗。
  { id:'e_absurd_loop',     name:'荒谬循环者',      symbol:'∞', type:'normal', conceptId:'camus_absurd',         stageRange:[42,300] },
  // 德里达："意义永远被延迟"——延异。
  { id:'e_différance',      name:'延异碎片',        symbol:'δ', type:'normal', conceptId:'derrida_deconstruction', stageRange:[52,300] },
  // 康德（扩展）："只按照你同时愿意它成为普遍法则的准则行动"——绝对命令。
  { id:'e_categorical_imper', name:'绝对命令回响',   symbol:'!', type:'normal', conceptId:'categorical_imperative', stageRange:[58,300] },
  // 罗尔斯（扩展）："在原初状态中、无知之幕后面选择正义原则"。
  { id:'e_veil_ignorance',  name:'无知之幕投影',    symbol:'◈', type:'normal', conceptId:'veil_of_ignorance',   stageRange:[64,300] },
  // 黑格尔："主人依赖奴隶的承认"——主奴辩证法。
  { id:'e_hegel_dialectic', name:'主奴辩证体',      symbol:'⇌', type:'normal', conceptId:'hegel_dialectic',      stageRange:[72,300] },
  // 福柯："囚犯自己监管自己"——全景监狱。
  { id:'e_foucault_panoptic',name:'全景监视线',     symbol:'⌂', type:'normal', conceptId:'foucault_panopticon',  stageRange:[84,300] },
];

export const ELITE_TEMPLATES = [
  // "我思残骸"：笛卡尔 cogito 被过度解构后的废墟。普通版"我思故我在"退出后,
  // 它的残骸作为精英继续存在——"我思"无法被完全消灭。
  { id:'el_cogito_remain',   name:'我思残骸',        symbol:'C',  type:'elite',  conceptId:'dubito',          stageRange:[15,200] },
  // "帕斯卡之魔"：帕斯卡赌注的恶魔版本。笛卡尔有"恶魔"(malin génie),帕斯卡
  // 有赌注——两者的合体：它与你博弈，而且它在作弊。
  { id:'el_pascal_demon',    name:'帕斯卡之魔',      symbol:'D',  type:'elite',  conceptId:'cartesian_demon',     stageRange:[20,250] },
];

// ============================================================
// Boss 阶段数据：每个 Boss 拥有 3~4 个阶段，HP 降至阈值时触发转场
// phase.effects 直接修改 boss 的战斗属性；passive 为持续生效的特殊规则
// ============================================================
export const BOSS_PHASE_DATA = {
  boss_dasein: {
    name: '此在残响',
    concept: '海德格尔「向死存在」：此在只有面对死亡时，才真正领会自身的整体存在。',
    phases: [
      { hpPct: 1.0,  name: '此在显现',  effects: {},                         flavor: '此在于此驻留，世界的意义尚未展开…' },
      { hpPct: 0.70, name: '忧惧觉醒',  effects: { aspd: 1.35 },           flavor: '『忧惧』袭来——此在从沉沦中振荡！' },
      { hpPct: 0.40, name: '向死存在',  effects: { aspd: 1.7, crit: 0.12 }, flavor: '向死存在——此在逼近生存论边界！' },
      { hpPct: 0.15, name: '终极忧惧',  effects: { aspd: 2.2, crit: 0.25, atkMul: 1.35 }, flavor: '终极忧惧——此在直面虚无！' },
    ],
  },
  boss_will_to_power: {
    name: '强力意志化身',
    concept: '尼采「强力意志」：生命本质是自我超越、自我扩张的意志，受压反而更强。',
    phases: [
      { hpPct: 1.0,  name: '意志初显',  effects: {},                         flavor: '意志微微震颤，尚未觉醒…' },
      { hpPct: 0.65, name: '意志扩张',  effects: { onHitAtkGain: 0.05 },    flavor: '每次受击，意志便扩张一分！' },
      { hpPct: 0.35, name: '强力意志',  effects: { onHitAtkGain: 0.09 },    flavor: '强力意志——你越打击，它越强！' },
    ],
    passive: 'onHitAtkGain', // 受击时永久提升攻击力
  },
  boss_thing_in_itself: {
    name: '物自体防壁',
    concept: '康德「物自体」：事物本身不可被认识，我们能认识的只是事物向我们显现的"现象"。',
    phases: [
      { hpPct: 1.0,  name: '现象显现',  effects: { damageShield: 0.20 },  flavor: '你能看到的，只是现象…' },
      { hpPct: 0.60, name: '物自体裂隙', effects: { damageShield: 0.45 },  flavor: '物自体开始拒斥你的认知——伤害被吸收 45%！' },
      { hpPct: 0.30, name: '绝对物自体', effects: { damageShield: 0.65, defMul: 1.4 }, flavor: '物自体本身不可触达——仅 35% 伤害能抵达！' },
    ],
  },
  boss_munchhausen: {
    name: '明希豪森之结',
    concept: '认识论三重困境：无穷后退（论证永不终止）、循环论证（A证B，B证A）、武断停止（随意定起点）。',
    phases: [
      { hpPct: 1.0,  name: '命题初立',     effects: {},                          flavor: '论证开始，却不知从何处起始…' },
      { hpPct: 0.55, name: '无穷后退',     effects: { summonOnDeath: 2 },       flavor: '击杀后它从后退中归来，并带来 2 个历史残影！' },
      { hpPct: 0.25, name: '循环论证',     effects: { summonOnDeath: 4, healPct: 0.40 }, flavor: '循环论证——此结不可解，Boss 复活并召唤 4 个残影！' },
    ],
    // 第一次"死亡"时不真正死亡，而是触发阶段转换并召唤怪物
    fakeDeath: true,
  },
  boss_apperception: {
    name: '统觉统一场',
    concept: '康德「先验统觉」："我思"必须能够伴随我的一切表象，自我意识的先天统一性。',
    phases: [
      { hpPct: 1.0,  name: '统觉初成',  effects: { mergeDamageWindow: 2000 },  flavor: '你的每一次攻击，都被统觉统一为一次…' },
      { hpPct: 0.70, name: '先验统觉',  effects: { ignoreChipDamage: true },    flavor: '先验统觉——小于最大HP 10% 的攻击被忽略！' },
      { hpPct: 0.35, name: '绝对统觉',  effects: { onlyLargestHit: true },     flavor: '绝对统觉——只有最猛烈的一击才能触及本质！' },
    ],
  },
};

export const BOSS_TEMPLATES = [
  // 关卡20：此在残响 — 海德格尔"向死存在"：濒死时攻速激增
  { id:'boss_dasein',       name:'此在残响',     symbol:'M', type:'boss', conceptId:'dasein',                stage:20  },
  // 关卡50：强力意志化身 — 尼采"强力意志"：每次受击后攻击力永久上升
  { id:'boss_will_to_power',  name:'强力意志化身', symbol:'W', type:'boss', conceptId:'will_to_power',          stage:50  },
  // 关卡80：物自体防壁 — 康德"物自体"：只能造成部分伤害
  { id:'boss_thing_in_itself',name:'物自体防壁',   symbol:'N', type:'boss', conceptId:'thing_in_itself',        stage:80  },
  // 关卡120：明希豪森之结 — 认识论三重困境：击杀后复活并召唤怪物
  { id:'boss_munchhausen',    name:'明希豪森之结', symbol:'X', type:'boss', conceptId:'munchhausen_trilemma',   stage:120 },
  // 关卡200：统觉统一场 — 康德"先验统觉"：免疫分次伤害
  { id:'boss_apperception',   name:'统觉统一场',   symbol:'A', type:'boss', conceptId:'apperception',           stage:200 },
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
