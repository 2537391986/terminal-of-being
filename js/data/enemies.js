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

// ============================================================
// Mechanics 行为标签说明（v0.8 实装）
// ============================================================
// 每个怪物可携带 mechanics 数组，encounter 系统在每帧 AI 更新中解析这些标签。
// 支持的标签类型：
//
//  { type: 'ranged', range: 350, projectileSymbol: '·', damageMul: 0.8, cooldown: 2.0 }
//    — 远程攻击：在 range 距离内停下，每 cooldown 秒发射一枚投射物
//
//  { type: 'charger', chargeRange: 500, chargeSpeedMul: 3.5, chargeCooldown: 5.0 }
//    — 冲锋：每 chargeCooldown 秒，若玩家在 chargeRange 内，以 chargeSpeedMul 倍移速冲刺
//
//  { type: 'splitter', splitCount: 2, splitHpPct: 0.4 }
//    — 分裂：HP 降至 splitHpPct 时死亡并生成 splitCount 个缩小版自身
//
//  { type: 'shield_regen', regenPct: 0.15, regenCooldown: 8.0 }
//    — 护盾恢复：每 regenCooldown 秒，若没被攻击，恢复最大 HP 的 regenPct
//
// mechanics: [] 表示普通近战木桩（默认行为，无特殊逻辑）
// ============================================================

export const ENEMY_TEMPLATES = [
  // 普罗泰戈拉："人是万物的尺度"(Homo mensura)——真理依赖于感知者。
  // 近战木桩，作为首个遭遇的怪物，设计上越简单越好。
  { id:'e_protag_measure',   name:'人是万物的尺度',  symbol:'π',  type:'normal', conceptId:'protagoras',              stageRange:[1,999],  mechanics:[] },
  // 笛卡尔：cogito——反复怀疑、后退再怀疑。设计为"退后型远程"：
  // 保持距离并发射投射物，体现"cogito"作为一种反复退回的反思行为。
  { id:'e_cogito_ghost',     name:'我思故我在',      symbol:'©',  type:'normal', conceptId:'cogito',                   stageRange:[1,30],   mechanics:[
    { type: 'ranged', range: 320, projectileSymbol: '?', damageMul: 0.75, cooldown: 2.5 },
  ]},
  // 帕斯卡赌注：押注与冲锋——它在赌你的位置，然后全力冲过来。
  { id:'e_pascal_wager',     name:'帕斯卡赌注',      symbol:'P',  type:'normal', conceptId:'pascal_wager',              stageRange:[5,60],   mechanics:[
    { type: 'charger', chargeRange: 480, chargeSpeedMul: 3.0, chargeCooldown: 6.0 },
  ]},
  // 语言游戏：分裂为更小的"语言碎片"——越打越多，但每个都更弱。
  { id:'e_language_game',    name:'语言游戏残响',    symbol:'L',  type:'normal', conceptId:'language_game',             stageRange:[8,80],   mechanics:[
    { type: 'splitter', splitCount: 2, splitHpPct: 0.35 },
  ]},
  // 公共领域回声：保持距离、持续远程骚扰——"回声"从不贴近，只是不断回响。
  { id:'e_public_sphere',    name:'公共领域回声',    symbol:'h',  type:'normal', conceptId:'public_sphere',             stageRange:[10,100], mechanics:[
    { type: 'ranged', range: 380, projectileSymbol: 'h', damageMul: 0.65, cooldown: 1.8 },
  ]},
  // 二元对立体：护盾恢复——每当你停下来，它就在恢复平衡。
  { id:'e_binary_oppose',    name:'二元对立体',      symbol:'±',  type:'normal', conceptId:'structuralism',             stageRange:[15,120], mechanics:[
    { type: 'shield_regen', regenPct: 0.12, regenCooldown: 7.0 },
  ]},
  // 知识考古遗迹：近战木桩（挖掘时的静止状态）
  { id:'e_knowledge_arch',   name:'知识考古遗迹',    symbol:'K',  type:'normal', conceptId:'knowledge_archaeology',     stageRange:[20,150], mechanics:[] },
  // 文化工业循环：分裂——标准化再生产，击破一个生出另外两个。
  { id:'e_culture_industry', name:'文化工业循环',    symbol:'a',  type:'normal', conceptId:'culture_industry',          stageRange:[25,200], mechanics:[
    { type: 'splitter', splitCount: 2, splitHpPct: 0.50 },
  ]},
  // 证实原则空壳：护盾恢复——空壳能够自我修补，因为它已不受证伪约束。
  { id:'e_vienna_verify',    name:'证实原则空壳',    symbol:'V',  type:'normal', conceptId:'verificationism',           stageRange:[30,250], mechanics:[
    { type: 'shield_regen', regenPct: 0.18, regenCooldown: 6.0 },
  ]},
  // 哥德尔裂隙：冲锋——系统缺口一旦出现就会扩张，以加速的方式向你袭来。
  { id:'e_godel_incompl',    name:'哥德尔裂隙',      symbol:'G',  type:'normal', conceptId:'godel_incompleteness',      stageRange:[40,300], mechanics:[
    { type: 'charger', chargeRange: 520, chargeSpeedMul: 3.5, chargeCooldown: 5.5 },
  ]},
  // ═══════════════════════════════════════════════════════════════
  // 新怪物：道家哲学（v7.2 扩充）
  // ═══════════════════════════════════════════════════════════════
  // 道："道可道，非常道"——无法被完全言说的终极实在。
  // 护盾恢复：道不可被彻底理解，打完了它又缓缓恢复。
  { id:'e_dao_echo',        name:'道之残响',      symbol:'道', type:'normal', conceptId:'dao',                  stageRange:[1,999],  mechanics:[
    { type: 'shield_regen', regenPct: 0.10, regenCooldown: 9.0 },
  ]},
  // 无为：保持距离，不主动进攻——顺应自然，等你靠近才反应。
  // 远程低伤骚扰，体现"不为而为"
  { id:'e_wuwei_echo',      name:'无为残响',        symbol:'无', type:'normal', conceptId:'wu_wei',               stageRange:[10,200], mechanics:[
    { type: 'ranged', range: 400, projectileSymbol: '·', damageMul: 0.55, cooldown: 3.5 },
  ]},
  // 阴阳：分裂为"阴体"和"阳体"——动态平衡在破碎时一分为二。
  { id:'e_yinyang_cycle',    name:'阴阳循环体',      symbol:'☯', type:'normal', conceptId:'yin_yang',             stageRange:[20,250], mechanics:[
    { type: 'splitter', splitCount: 2, splitHpPct: 0.45 },
  ]},
  // ═══════════════════════════════════════════════════════════════
  // 新怪物：佛教哲学（v7.2 扩充）
  // ═══════════════════════════════════════════════════════════════
  // 四圣谛：护盾恢复——苦的本质是循环，受伤后自我修复。
  { id:'e_four_truths',     name:'四圣谛显现',      symbol:'䌀', type:'normal', conceptId:'four_noble_truths',    stageRange:[30,300], mechanics:[
    { type: 'shield_regen', regenPct: 0.15, regenCooldown: 7.0 },
  ]},
  // 缘起：分裂（缘生缘灭）——一体破碎，各部分依旧相互生成。
  { id:'e_dependent_arise', name:'缘起之网',        symbol:'⟲', type:'normal', conceptId:'pratityasamutpada',    stageRange:[40,300], mechanics:[
    { type: 'splitter', splitCount: 3, splitHpPct: 0.30 },
  ]},
  // 空：近战木桩（空性本无特质，无行为是最真实的空）
  { id:'e_sunyata_echo',    name:'空性残响',        symbol:'∅', type:'normal', conceptId:'sunyata',               stageRange:[50,300], mechanics:[] },
  // ═══════════════════════════════════════════════════════════════
  // 新怪物：实用主义 + 科学哲学（v7.2 扩充）
  // ═══════════════════════════════════════════════════════════════
  // 实用主义："有用的就是真的"——冲过来，用实际结果证明自己。
  { id:'e_pragmatism',      name:'实用主义残响',    symbol:'⌬', type:'normal', conceptId:'pragmatism',            stageRange:[45,300], mechanics:[
    { type: 'charger', chargeRange: 450, chargeSpeedMul: 2.8, chargeCooldown: 6.5 },
  ]},
  // 证伪者：远程攻击——它用你的攻击来"证伪"你的存在。
  { id:'e_falsification',   name:'证伪者',          symbol:'⚡', type:'normal', conceptId:'falsificationism',      stageRange:[55,300], mechanics:[
    { type: 'ranged', range: 360, projectileSymbol: '⚡', damageMul: 0.90, cooldown: 2.0 },
  ]},
  // 范式转换：冲锋——科学革命不是渐进的，是突然爆发的。
  { id:'e_paradigm_shift',   name:'范式转换裂隙',    symbol:'⇆', type:'normal', conceptId:'paradigm_shift',        stageRange:[65,300], mechanics:[
    { type: 'charger', chargeRange: 500, chargeSpeedMul: 4.0, chargeCooldown: 5.0 },
  ]},
  // 反对方法："怎么都行"——分裂为混乱的多个方向。
  { id:'e_against_method',  name:'方法抵抗体',      symbol:'⚎', type:'normal', conceptId:'against_method',        stageRange:[75,300], mechanics:[
    { type: 'splitter', splitCount: 2, splitHpPct: 0.55 },
  ]},
  // ═════════════════════════════════════════════════════════════
  // 新怪物：v7.2 第二批（女性主义 + 政治哲学 + 古希腊）
  // ═════════════════════════════════════════════════════════════
  // 波伏娃：远程骚扰——他者永远保持距离，从外部凝视和定义你。
  { id:'e_second_sex',     name:'他者化残响',      symbol:'♀', type:'normal', conceptId:'second_sex',             stageRange:[60,300], mechanics:[
    { type: 'ranged', range: 350, projectileSymbol: '♀', damageMul: 0.70, cooldown: 2.2 },
  ]},
  // 阿伦特：近战木桩——"恶之平庸性"就是机械、无思的服从，无特殊行为。
  { id:'e_banality_evil',  name:'平庸之恶',        symbol:'◎', type:'normal', conceptId:'banality_of_evil',       stageRange:[70,300], mechanics:[] },
  // 苏格拉底：近战 + 每次被攻击后短暂加速（反驳反而激发更多追问）
  { id:'e_socratic',       name:'诘问者',          symbol:'?', type:'normal', conceptId:'socratic_method',        stageRange:[5,150],  mechanics:[] },
  // ═══════════════════════════════════════════════════════════════
  // v0.7.3 第三批扩充：存在主义、解构、古希腊、现象学
  // ═══════════════════════════════════════════════════════════════
  // 亚里士多德：护盾恢复——中庸者总在极端之间找到平衡点。
  { id:'e_aristotle_mean',  name:'中庸守护者',      symbol:'≡', type:'normal', conceptId:'aristotle_mean',         stageRange:[9,180],  mechanics:[
    { type: 'shield_regen', regenPct: 0.14, regenCooldown: 8.0 },
  ]},
  // 庄子：分裂——"周"与"蝶"两种状态，无法确定哪个是真实的。
  { id:'e_zhuangzi_butter', name:'蝴蝶残响',        symbol:'蝶', type:'normal', conceptId:'zhuangzi_butterfly',    stageRange:[18,220], mechanics:[
    { type: 'splitter', splitCount: 2, splitHpPct: 0.40 },
  ]},
  // 柏拉图洞窟：远程投射"影子"——洞穴中的人只能看到墙上的投影。
  { id:'e_plato_cave',      name:'洞窟投影',        symbol:'△', type:'normal', conceptId:'plato_cave',             stageRange:[26,250], mechanics:[
    { type: 'ranged', range: 340, projectileSymbol: '△', damageMul: 0.72, cooldown: 2.8 },
  ]},
  // 萨特自欺：近战木桩——自欺者假装自己是物，停在原地不行动。
  { id:'e_bad_faith',       name:'自欺残影',        symbol:'ψ', type:'normal', conceptId:'sartre_bad_faith',       stageRange:[34,280], mechanics:[] },
  // 加缪荒谬：冲锋——西西弗不断地推石上山，周而复始地冲向你。
  { id:'e_absurd_loop',     name:'荒谬循环者',      symbol:'∞', type:'normal', conceptId:'camus_absurd',           stageRange:[42,300], mechanics:[
    { type: 'charger', chargeRange: 460, chargeSpeedMul: 3.2, chargeCooldown: 5.0 },
  ]},
  // 延异碎片：分裂——意义被延迟，本体破碎为更多碎片。
  { id:'e_différance',      name:'延异碎片',        symbol:'δ', type:'normal', conceptId:'derrida_deconstruction', stageRange:[52,300], mechanics:[
    { type: 'splitter', splitCount: 3, splitHpPct: 0.45 },
  ]},
  // 绝对命令：近战 + 护盾恢复——道德律令不容破坏，损毁后自我修复。
  { id:'e_categorical_imper', name:'绝对命令回响',  symbol:'!', type:'normal', conceptId:'categorical_imperative', stageRange:[58,300], mechanics:[
    { type: 'shield_regen', regenPct: 0.20, regenCooldown: 6.5 },
  ]},
  // 无知之幕：远程攻击——不知道自己的位置，从幕后投射偏见。
  { id:'e_veil_ignorance',  name:'无知之幕投影',    symbol:'◈', type:'normal', conceptId:'veil_of_ignorance',     stageRange:[64,300], mechanics:[
    { type: 'ranged', range: 370, projectileSymbol: '◈', damageMul: 0.80, cooldown: 2.4 },
  ]},
  // 主奴辩证体：冲锋——主人对奴隶需要承认，以强力姿态冲向你寻求确认。
  { id:'e_hegel_dialectic', name:'主奴辩证体',      symbol:'⇌', type:'normal', conceptId:'hegel_dialectic',        stageRange:[72,300], mechanics:[
    { type: 'charger', chargeRange: 490, chargeSpeedMul: 3.8, chargeCooldown: 4.5 },
  ]},
  // 全景监视线：远程监控——全景监狱从远处监视，从不靠近。
  { id:'e_foucault_panoptic',name:'全景监视线',     symbol:'⌂', type:'normal', conceptId:'foucault_panopticon',   stageRange:[84,300], mechanics:[
    { type: 'ranged', range: 420, projectileSymbol: '⌂', damageMul: 0.85, cooldown: 1.6 },
  ]},
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
