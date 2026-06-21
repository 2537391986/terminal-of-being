// js/data/items.js
// 装备模板：10 件非武器 + 50 把武器（完整哲学概念介绍 + 科普档案）
//
// ═══════════════════════════════════════════════════════════════
// 设计注记：装备概念映射体系
// ═══════════════════════════════════════════════════════════════
// 每件装备对应一个西方哲学核心概念。设计遵循三重映射：
//   (1) 语义映射：装备名 → 哲学概念本体
//   (2) 功能映射：装备效果 → 概念逻辑的"游戏化翻译"
//   (3) 文本映射：风味文字 → 概念的一句话"现象学还原"
//
// 命名规则(§3.3)：严格遵循模板 A — [概念术语] + 之 + [兵器词库]
//   兵器词库: 刃/锋/匕/剑/枪/戟/锤/杖/鞭/钩/镰/锏/钥/盾
//   概念术语取自具体哲学概念，不使用"主义"后缀
//
// v2.0: 新增 origin(历史背景)、influence(思想影响)、misconception(常见误解)
//       科普档案可在装备详情面板中折叠展开
// ═══════════════════════════════════════════════════════════════

import { findConcept } from './concepts.js';

export const ITEM_TEMPLATES = [

  // ═══════════════════════════════════════════════════════════
  // 非武器装备 (10件)
  // ═══════════════════════════════════════════════════════════

  // ═══ 1. 偶因论之钥 (weapon/rare) ═══
  {
    templateId: "occasionalism_key",
    name: "偶因论之钥",
    rarity: "rare",
    slot: "weapon",
    attackType: "symbolic_slash",
    stageRange: [1, 40],
    baseStats: { atk: 15, critDmg: 0.5 },
    effects: [],
    concept: findConcept_provide('occasionalism_key', {
      id: "occasionalism", term: "偶因论", termEn: "Occasionalism",
      school: "理性主义哲学 / 马勒伯朗士", field: "哲学",
      summary: "心灵和身体不能直接相互作用——每一次所谓的'原因'都只是上帝行动的'机缘'(occasion)。你推门,门开了,但推动门的力量并非来自你的手臂,而是上帝借你推门这个'机缘'在那一刻使门移动。火灼伤手也是如此:火不是造成疼痛的原因,只是上帝让你感到疼痛的'偶因'。",
      origin: "法国哲学家马勒伯朗士(Nicolas Malebranche, 1638-1715)在《真理的探求》(1674)中系统提出。他将笛卡尔的心物二元论推向极端:既然心灵和身体是完全不同的实体,它们之间就不可能存在真正的因果关系。偶因论是17世纪理性主义解决'心身问题'的最激进方案之一。",
      influence: "偶因论影响了莱布尼茨的'预定和谐'理论(莱布尼茨用上帝在创世时的预先设定取代了偶因论的'每次介入'),间接促成了休谟对因果关系的经验论批判。在现代心灵哲学中,偶因论的思路在'平行论'和'副现象论'中仍有回响。",
      misconception: "不是'上帝控制一切'——偶因论说的是因果关系需要实体同质性,既然心灵和身体不同质,因果关系就必须有第三方中介。",
      designNote: "攻击由'上帝中介'完成——基础攻击稳定,但暴击时伤害是普通攻击的两倍(中介延后生效)。",
    }),
    flavorText: "你不直接挥剑,你只是发起了一次挥剑的请求。",
    dropWeight: 25,
  },

  // ═══ 2. 物自体之盾 (chest/epic) ═══
  {
    templateId: "thing_shield",
    name: "物自体之盾",
    rarity: "epic",
    slot: "chest",
    stageRange: [10, 60],
    baseStats: { def: 15, maxHp: 30 },
    effects: [{ type: "enemy_debuff", stat: "crit", value: -0.15, description: "敌人洞见率 -15%" }],
    concept: findConcept_provide('thing_shield', {
      id: "thing_in_itself", term: "物自体(Ding an sich)", termEn: "Thing-in-itself",
      school: "德国观念论 / 康德", field: "哲学",
      summary: "在康德的认识论中,人类只能认识事物呈现给我们的'现象'(Erscheinung),而永远无法认识事物独立于我们的感知之外的样子——那就是'物自体'。空间、时间、因果性都是我们认识的形式,不是世界本身的性质。物自体是我们认识的绝对边界,超出这个边界的任何断言都是理性的'越界'。",
      origin: "伊曼努尔·康德(Immanuel Kant, 1724-1804)在《纯粹理性批判》(1781/1787)中提出现象/物自体的区分。这一区分是他'哥白尼式革命'的核心:不是认识必须符合对象,而是对象必须符合我们的认识形式。物自体概念引发了德国观念论的整个传统。",
      influence: "物自体概念直接触发了费希特、谢林和黑格尔的批评——他们认为康德留下了一个'不可知的X'是哲学的半途而废。黑格尔的回应是:物自体不是不可知,而是'不完整'——在绝对精神的辩证运动中,物自体最终会被完全认识。叔本华则把物自体等同于'意志'。",
      misconception: "不是'有一个神秘世界我们进不去'——康德说的不是两个世界,而是同一事物的两个面向:作为现象的它(我们认识到的)和作为物自体的它(独立于我们认识的)。",
      designNote: "防御+降低敌人暴击——你只能看到现象,看不到物自体,自然打不出'原本'的暴击。",
    }),
    flavorText: "你看到的从来不是它本身,只是它愿意被你看到的部分。",
    dropWeight: 15,
  },

  // ═══ 3. 强力意志之冠 (head/epic) ═══
  {
    templateId: "will_to_power_crown",
    name: "强力意志之冠",
    rarity: "epic",
    slot: "head",
    stageRange: [15, 80],
    baseStats: { atk: 12, crit: 0.05 },
    effects: [{ type: "on_kill", effect: "atk_stack", value: 2, description: "每次击杀永久 +2 断言力(本局有效)" }],
    concept: findConcept_provide('will_to_power_crown', {
      id: "will_to_power", term: "强力意志(Wille zur Macht)", termEn: "Will to Power",
      school: "尼采哲学", field: "哲学",
      summary: "尼采认为生命的根本驱力不是叔本华式的'求生存的意志',也不是达尔文式的'适应环境',而是一种不断超越自身、扩张力量的内在冲动——'强力意志'。一棵树向上生长不是为了'存活',而是为了更多地成为自己。一切价值都是强力意志的投射:不是先有价值再被追求,而是追求本身在创造价值。弱者以'道德'为名否定强者,恰恰也是强力意志的扭曲表达。",
      origin: "弗里德里希·尼采(Friedrich Nietzsche, 1844-1900)在他晚期的笔记(由其妹妹整理为《强力意志》一书,1901)和《查拉图斯特拉如是说》(1883-1885)中反复阐述这一概念。不过学界对《强力意志》一书作为尼采'遗著'的可靠性有争议——其中很多材料是尼采妹妹伊丽莎白选择性编辑的。",
      influence: "强力意志概念深刻影响了海德格尔(将尼采解读为'形而上学的完成')、德勒兹(将其重新解读为肯定性的差异力量)、福柯(权力不是压制性的而是生产性的)。在存在主义中,'自我超越'成为萨特自由概念的重要来源。",
      misconception: "不是'强者可以随便欺负弱者'——尼采的'强力'不是对他人的支配,而是对自身的超越。他鄙视的不是弱者,而是以'道德'为武器不许别人变强的'末人'。",
      designNote: "每次击杀永久 +2 攻击(死亡重置)——强力意志在每次胜利中扩张,但死亡是'末人'的回归。",
    }),
    flavorText: "每一次胜利,都让意志更强一分。",
    dropWeight: 12,
  },

  // ═══ 4. 向死存在之靴 (boots/epic) ═══
  {
    templateId: "sein_zum_tode_boots",
    name: "向死存在之靴",
    rarity: "epic",
    slot: "boots",
    stageRange: [20, 100],
    baseStats: { maxHp: 50, dodge: 0.08 },
    effects: [{ type: "on_low_hp", threshold: 0.3, stat: "aspd", value: 0.3, description: "生命 < 30% 时思维频率 +30%" }],
    concept: findConcept_provide('sein_zum_tode_boots', {
      id: "sein_zum_tode", term: "向死存在(Sein-zum-Tode)", termEn: "Being-toward-death",
      school: "存在主义 / 海德格尔", field: "哲学",
      summary: "海德格尔认为,'死亡'不是生命的终点事件,而是贯穿整个生命的一种'可能性'——此在从出生起就'向死存在'。直面这种可能性,人才从日常生活的'常人'(das Man)中抽身,回到'本真的'(eigentlich)生存。死亡是个体最本己、最不可替代的可能性:没有人能替你死,所以在死亡面前,你再也不能做'别人都在做的事'。",
      origin: "马丁·海德格尔(Martin Heidegger, 1889-1976)在《存在与时间》(Sein und Zeit, 1927)第二篇第一章中详细分析'向死存在'。这是他'此在分析论'的核心环节——不理解死亡,就无法完整理解此在(人)的存在结构。",
      influence: "向死存在的概念影响了萨特(将死亡视为'荒谬的终点'而非'本真的可能性')、列维纳斯(强调他者之死先于我之死的伦理意义)以及欧陆存在主义心理治疗传统。",
      misconception: "不是'反正会死所以随便活'——海德格尔恰恰反对这种'无所谓'的态度。只有意识到死亡的不可替代性,人才会从'随便活'变成'认真地活'。",
      designNote: "血越低攻速越快——'意识到死亡'不是恐惧,而是'终于可以本真地行动了'。",
    }),
    flavorText: "唯有直面终点,步伐才真正轻盈。",
    dropWeight: 10,
  },

  // ═══ 5. 意向性指环 (ring/epic) ═══
  {
    templateId: "intentionality_ring",
    name: "意向性指环",
    rarity: "epic",
    slot: "ring",
    stageRange: [10, 80],
    baseStats: { atk: 8, crit: 0.04, rarityFind: 0.05, itemFind: 0.05 },
    effects: [],
    concept: findConcept_provide('intentionality_ring', {
      id: "intentionality", term: "意向性(Intentionalität)", termEn: "Intentionality",
      school: "现象学 / 胡塞尔", field: "哲学",
      summary: "胡塞尔从他的老师布伦塔诺那里继承了一个核心洞见:意识永远不是'空的'——意识总是'关于某物'的意识。没有无对象的看,没有无对象的恨,没有无对象的判断。但这不意味着对象必须在物理世界中存在:你可以思考'独角兽',这时你的思考指向了一个不存在的对象——但这恰恰说明意向性是一种指向关系,而不是实物联系。",
      origin: "弗朗茨·布伦塔诺(Franz Brentano, 1838-1917)在《从经验立场看的心理学》(1874)中重新发掘了中世纪经院哲学的'intentio'概念。他的学生埃德蒙德·胡塞尔(Edmund Husserl, 1859-1938)将其发展为现象学的核心方法——通过分析意识的意向结构,揭示世界如何在意识中'被给予'。",
      influence: "意向性概念成为整个现象学运动的基石:海德格尔将其从'意识的指向'改为'此在在世'的操劳结构;梅洛-庞蒂将其延伸到身体层面(身体的意向性);萨特用意向性论证意识的'虚无化'能力。在当代心灵哲学中,意向性仍是'意识如何指向世界'这一核心问题的关键术语。",
      misconception: "不是'心想事成'——意向性不是说意识创造了对象,而是说意识的结构就是'向外指向'。你无法拥有一个'什么都没在思考'的意识。",
      designNote: "提高暴击率和掉率——你的意识'指向'敌人时,伤害和发现都更精准。",
    }),
    flavorText: "没有无方向的注视。",
    dropWeight: 12,
  },

  // ═══ 6. 生活世界披风 (chest/epic) ═══
  {
    templateId: "lebenswelt_cape",
    name: "生活世界披风",
    rarity: "epic",
    slot: "chest",
    stageRange: [15, 100],
    baseStats: { def: 12, maxHp: 25, lifesteal: 0.03 },
    effects: [],
    concept: findConcept_provide('lebenswelt_cape', {
      id: "lebenswelt", term: "生活世界(Lebenswelt)", termEn: "Lifeworld",
      school: "现象学 / 胡塞尔", field: "哲学",
      summary: "胡塞尔晚期发现了一个严重的问题:现代科学虽然精确,却'遗忘了'它自己从何而来——科学的世界是从'生活世界'(我们日常经验的前科学的、具体的、在历史和文化中展开的世界)中抽象出来的,但科学后来却把它自己的抽象当作唯一的实在,反过来贬低生活世界为'主观的幻觉'。'回到事物本身'的最终归宿就是回到生活世界。",
      origin: "胡塞尔在《欧洲科学的危机与先验现象学》(Die Krisis der europäischen Wissenschaften, 1936)中提出这一概念,作为对科学主义的批判。这部未完成的遗著写于纳粹时期——胡塞尔是犹太人,被剥夺了教授职位——在极端处境中反思欧洲文明的根本危机。",
      influence: "生活世界的概念深刻影响了舒茨(将其发展为'社会世界的现象学'基础)、哈贝马斯(将生活世界与系统对立,批判生活世界的'殖民化')以及当代'具身认知'和生态现象学的讨论。",
      misconception: "不是'日常生活比科学重要'——胡塞尔并不反科学,他反的是'忘了生活世界是科学的基础'。科学仍然是有效的,但需要一个哲学上的'地基检查'。",
      designNote: "提高最大生命和吸血——'日常'反而是真实力量的来源,不是平庸,是根基。",
    }),
    flavorText: "科学构造的世界,只是生活世界的影子。",
    dropWeight: 12,
  },

  // ═══ 7. 绝对命令之律 (amulet/legendary) ═══
  {
    templateId: "categorical_law",
    name: "绝对命令之律",
    rarity: "legendary",
    slot: "amulet",
    stageRange: [30, 200],
    baseStats: { atk: 20, def: 10 },
    effects: [{ type: "conditional", trigger: "no_dodge_30s", effect: "atk_buff", value: 0.3, description: "持续 30 秒不闪避,断言力 +30%" }],
    concept: findConcept_provide('categorical_law', {
      id: "categorical_imperative", term: "绝对命令(Kategorischer Imperativ)", termEn: "Categorical Imperative",
      school: "义务论伦理学 / 康德", field: "哲学",
      summary: "康德的道德哲学建立在一个核心原则上:只按你同时愿意它成为普遍法则的准则去行动。这不是一个'建议'(假言命令:'如果你想健康,就锻炼'),而是一个无条件的'命令'(绝对命令)。你不能说'我可以撒谎因为这次情况特殊'——你必须问自己:'如果所有人都撒谎,撒谎这个词还有意义吗？'如果答案是否定的,那么你就没有道德权利去撒谎。道德律令的威严来自于:它不是别人强加给你的,而是理性自己给自己的立法。",
      origin: "康德在《道德形而上学奠基》(Grundlegung zur Metaphysik der Sitten, 1785)中首次提出绝对命令,并在《实践理性批判》(1788)中进一步完善。这一概念是启蒙运动的道德高峰——人不需要上帝或传统来告诉他对错,理性本身就提供了道德法则。",
      influence: "绝对命令影响了罗尔斯的'无知之幕'(将其从个体道德扩展到社会制度设计)、哈贝马斯的'商谈伦理学'(将普遍化原则从独白改为对话)。批评者如黑格尔认为它'空洞',不能提供具体的道德内容;尼采则认为它是奴隶道德的'理性化'伪装。",
      misconception: "不是'永远不能说谎所以对杀人犯也要说实话'——康德在《论出自人类之爱的说谎权利》中的确说了极端的话,但这篇文章写于特殊背景下(回应法国大革命时期的问题)。康德伦理学的要义在于:准则是否能被普遍化而不自相矛盾。",
      designNote: "持续 30 秒不闪避,断言力 +30%——你的行动不偏离'准则',反而更强大。",
    }),
    flavorText: "愿你的准则,成为星空的法则。",
    dropWeight: 5,
  },

  // ═══ 8. 在世之履 (boots/rare) ═══
  {
    templateId: "dasein_boots",
    name: "在世之履",
    rarity: "rare",
    slot: "boots",
    stageRange: [1, 50],
    baseStats: { maxHp: 20, dodge: 0.05 },
    effects: [],
    concept: findConcept_provide('dasein_boots', {
      id: "dasein", term: "此在(Dasein)", termEn: "Dasein / Being-in-the-world",
      school: "存在主义 / 海德格尔", field: "哲学",
      summary: "海德格尔用'此在'(Dasein)来指称人这种特殊的存在者——它的存在方式是'在世界中存在'(In-der-Welt-sein)。关键在'在':人不是像一个物体放在一个盒子里那样'在'世界之中,而是通过操劳(Besorgen)、使用工具、与他人共在(Mitsein)等方式'展开'着世界。世界不是此在的容器,而是此在的构成性要素——没有独立于世界之外的先验自我。",
      origin: "海德格尔在《存在与时间》(1927)中以避免传统哲学术语(如'主体''意识''人')的方式重新描述了人的存在。'此在'这个词在德语日常用法中就是'存在'的意思,海德格尔用它来强调'存在'本身成了一个问题。",
      influence: "此在分析深刻影响了萨特的他者理论('他人即地狱'的来源之一)、梅洛-庞蒂的身体现象学、列维纳斯的伦理形而上学以及整个存在主义传统。在建筑学、护理学、人工智能等远离哲学的领域,'此在'概念也被用来理解'人在具体的、情境化中的存在方式'。",
      misconception: "不是'活在当下'——海德格尔的'此在'不是在时间中占据某个时刻,而是它的存在本身就具有时间性(时间不是外在于此在的)。",
      designNote: "提高生命和闪避——此在'在世'的方式本身就是柔软而灵活的。不是'躲',是'本来就在那里'。",
    }),
    flavorText: "人,总是已经在世界之中。",
    dropWeight: 25,
  },

  // ═══ 9. 无知之幕面纱 (charm/epic) ═══
  {
    templateId: "veil_of_ignorance",
    name: "无知之幕面纱",
    rarity: "epic",
    slot: "charm",
    stageRange: [25, 150],
    baseStats: { luck: 10, rarityFind: 0.10, itemFind: 0.10 },
    effects: [],
    concept: findConcept_provide('veil_of_ignorance', {
      id: "veil_of_ignorance", term: "无知之幕(Veil of Ignorance)", termEn: "Veil of Ignorance",
      school: "政治哲学 / 罗尔斯", field: "哲学",
      summary: "约翰·罗尔斯在《正义论》中提出了一个思想实验:假设你被要求设计一个社会的规则,但你被一道'无知之幕'遮住了——你不知道自己在这个社会中是富是穷、是聪明是愚钝、是健康是病弱。在这种'无知'状态下你会选择什么样的规则？罗尔斯的答案是:你会选择最有利于最不利者的规则(差别原则),因为你不知道自己会不会成为那个最不利者——这就是'作为公平的正义'。",
      origin: "约翰·罗尔斯(John Rawls, 1921-2002)在《正义论》(A Theory of Justice, 1971)中提出无知之幕作为他的'原初状态'思想实验的核心装置。这本书是20世纪政治哲学最重要的著作之一,重新激活了被逻辑实证主义边缘化的规范性政治哲学。",
      influence: "无知之幕激发了大量批评和修正:诺齐克从自由至上主义立场反对再分配;社群主义者(桑德尔等)批评'原初状态'中的人是抽象的非历史个体。无知之幕也被应用于生物伦理学、环境正义和全球正义等新兴领域。",
      misconception: "不是'大家都一样就行'——罗尔斯的差异原则允许不平等,条件是不平等必须有利于最不利者(例如给高技能者更高报酬以激励他们创造更多财富,从而使穷人受益)。",
      designNote: "不知道敌人会掉什么时,掉落率才'公平'地最大化。",
    }),
    flavorText: "不知道将身处何处,才能为所有人立法。",
    dropWeight: 8,
  },

  // ═══ 10. 意志薄弱之环 (ring/rare) ═══
  {
    templateId: "akrasia_ring",
    name: "意志薄弱之环",
    rarity: "rare",
    slot: "ring",
    stageRange: [1, 50],
    baseStats: { atk: 5, aspd: 0.1, crit: -0.03 },
    effects: [],
    concept: findConcept_provide('akrasia_ring', {
      id: "akrasia", term: "意志薄弱(Akrasia)", termEn: "Akrasia / Weakness of Will",
      school: "德性伦理学 / 亚里士多德", field: "哲学",
      summary: "亚里士多德在《尼各马可伦理学》第七卷中分析了一个令人困惑的现象:人知道什么是好的,却不去做——'明知故犯'。这不同于道德上的恶(不知何为善)和动物的冲动(没有理性),而是一个有理性的人在清醒状态下'被欲望压倒'。为什么理性知道却不能主导？亚里士多德给出的答案是:理性知道普遍原则,但不知道具体情况——当欲望抓住了具体事物,理性被'暂时遮蔽'了。",
      origin: "亚里士多德(Aristotle, 公元前384-322)在《尼各马可伦理学》第七卷(约公元前340年)中详细讨论了akrasia。这一分析成为西方道德心理学的基础文本,两千年来持续被讨论。苏格拉底认为'无人有意作恶',而亚里士多德用akrasia论证了苏格拉底错了——人可以知道却做不到。",
      influence: "akrasia问题在基督教神学中与'原罪'和'意志软弱'联系起来(奥古斯丁/保罗:'我所愿意的善我不去做,我不愿意的恶我偏去做');在当代行动哲学和决策理论中,akrasia仍是讨论'理性行动何以失败'的核心案例。",
      misconception: "不是'意志不够强'——亚里士多德的要点是:这不是意志力的问题,而是知识在具体情境中被'遮蔽'了。你理性上知道熬夜不好,但深夜时'熬夜的感觉'比'熬夜的后果'更生动,知识就被遮蔽了。",
      designNote: "攻击和攻速同时提高,但暴击率低——想做就做,但做不到'精准'。",
    }),
    flavorText: "知道该停下,却停不下来。",
    dropWeight: 25,
  },

  // ═══ 11. 统觉之眼 (charm/legendary) ═══
  {
    templateId: "apperception_eye",
    name: "统觉之眼",
    rarity: "legendary",
    slot: "charm",
    stageRange: [50, 500],
    baseStats: { crit: 0.1, critDmg: 0.5 },
    effects: [{ type: 'guaranteed_crit_low_hp', threshold: 0.3, description: '敌人 HP<30% 时必暴击' }],
    concept: findConcept_provide('apperception_eye', {
      id: "apperception", term: "统觉(Apperzeption)", termEn: "Transcendental Apperception",
      school: "先验哲学 / 康德", field: "哲学",
      summary: "康德在《纯粹理性批判》中论证:'我思'(das Ich denke)必须能够伴随我的一切表象——否则表象就不可能'属于我'。这个伴随一切表象的纯粹的自我意识就是'先验统觉'。它不是心理学上的'我觉得',而是逻辑上所有经验可能的前提:如果每一个经验都不属于同一个'我',那它们就只是碎片,不能构成一个统一的世界。先验统觉是康德哲学中最深的概念之一——它是认识主体的最高统一条件。",
      origin: "康德在《纯粹理性批判》'范畴的先验演绎'(B版, 1787)中详细阐述了先验统觉。B版演绎比A版(1781)更成熟,强调'统觉的综合统一'是知性一切运用的最高原则。康德自己说这是全书最困难的部分。",
      influence: "先验统觉的概念直接影响了费希特的'自我设定自我'、胡塞尔的'先验自我'、萨特的'前反思的我思'(cogito préréflexif),并且在当代关于自我意识和意识统一性的讨论中仍然是一个参照点。",
      misconception: "不是'我有灵魂'——先验统觉不是一个实体(灵魂),而是一个功能:它不是什么'东西',而是经验必须被统一到这个'我'上的那个逻辑条件。",
      designNote: "极端暴击+暴击伤害——'我思'贯穿一切表象,所有攻击都是统觉场的必然结果。",
    }),
    flavorText: "我思,故每一下都是确定的击中。",
    dropWeight: 3,
  },

  // ═══ 12. 明希豪森困境之钥 (weapon/legendary) ═══
  {
    templateId: "munchhausen_key",
    name: "明希豪森困境之钥",
    rarity: "legendary",
    slot: "weapon",
    attackType: "trilemma",
    stageRange: [60, 999],
    baseStats: { atk: 50 },
    effects: [{ type: "conditional", trigger: "stage_clear", effect: "stat_stack", value: 0.05, description: "每通过 10 层,所有词缀效果 +5%(无上限)" }],
    concept: findConcept_provide('munchhausen_key', {
      id: "munchhausen_trilemma", term: "明希豪森三重困境", termEn: "Münchhausen Trilemma",
      school: "认识论 / 怀疑论", field: "哲学",
      summary: "德国哲学家汉斯·阿尔伯特在1968年提出了认识论的'三重困境':任何试图为陈述提供最终证明的努力,都只能陷入三种死胡同。一是无穷后退——每个理由都需要另一个理由来支撑,无限追下去永远到不了终点。二是循环论证——用结论来证明前提,转了一圈等于什么都没证明。三是武断停止——在某处说'这就是最终的',但没有提供理由。三重困境和明希豪森男爵试图揪着自己的头发把自己从沼泽中拉出来的寓言一样荒诞——人类理性的'原罪'。",
      origin: "汉斯·阿尔伯特(Hans Albert, 1921-2023)在《论批判理性》(Traktat über kritische Vernunft, 1968)中提出。他将这一困境与波普尔的批判理性主义结合起来:既然最终证明不可能,那么科学和哲学的目标就不应是'证明',而是'批判检验'。",
      influence: "三重困境在德语哲学界引发了广泛的'终极证明之辩'(与阿佩尔、哈贝马斯等人的先验语用学争论),并在批判理性主义和建构主义之间形成了持久的张力。",
      misconception: "不是说'所有知识都是假的'——阿尔伯特并不否认知识,他否认的是'可以为知识提供终极不可动摇的证明',这是两个完全不同的问题。",
      designNote: "每通过 10 层,所有词缀效果 +5%(无上限)——你跳出了'三难',但代价是越走越重。",
    }),
    flavorText: "要么无穷后退,要么循环论证,要么在某处武断地停下。",
    dropWeight: 2,
  },

  // ═══════════════════════════════════════════════════════════
  // 武器池 (28把新武器 + 2把现有 = 30把)
  // 每把含完整的 origin / influence / misconception 科普档案
  // ═══════════════════════════════════════════════════════════

  // ────── COMMON 武器 (6把, stage 1-30) ──────

  // 13. 怀疑论之匕
  {
    templateId: "skepticism_dagger",
    name: "怀疑论之匕",
    rarity: "common",
    slot: "weapon",
    attackType: "thought",
    stageRange: [1, 30],
    baseStats: { atk: 5 },
    effects: [],
    concept: findConcept_provide('skepticism_dagger', {
      id: "pyrrhonian_skepticism", term: "怀疑论(Skepticism)", termEn: "Pyrrhonian Skepticism",
      school: "古希腊哲学 / 皮浪", field: "哲学",
      summary: "皮浪(Pyrrho, 约公元前360-270)创立了西方第一个系统性的怀疑论学派。他认为,对任何命题都可以找到等强度的反对论证——感觉不可靠、理性自相矛盾、不同文化的习俗彼此否定——所以最明智的态度是'悬置判断'(epoché)。但怀疑不是目的:皮浪主张悬置判断会带来心灵的平静(ataraxia)——当你不拼命断定什么是对什么是错,反而获得了安宁。据说皮浪的生活完全践行了这一点:他照常吃饭喝水、躲避危险,只是不对'饭是好的''危险是坏的'做终极判断。",
      origin: "皮浪随亚历山大大帝远征印度,接触到东方哲学(可能是耆那教或佛教)的'悬置'传统,返回希腊后创立怀疑论学派。他的学生蒂蒙记录了师说,但皮浪怀疑论最完整的形式保存在塞克斯都·恩披里柯(Sextus Empiricus, 约公元160-210)的《皮浪学说纲要》中。",
      influence: "皮浪怀疑论在文艺复兴时期被重新发现,深刻影响了蒙田(他的名言'我知道什么?')、笛卡尔的'普遍怀疑'方法以及休谟的经验论怀疑。但与皮浪不同,笛卡尔用怀疑来寻找确定性,而皮浪的怀疑以安宁为终点。",
      misconception: "不是'什么都不信'——怀疑论者也照样吃饭喝水。他不对'这饭能吃'做绝对断言,但他照常行动——行动的准则不是真理,而是'现象'(appearances):饭看起来能吃,危险看起来要躲。",
      designNote: "穿透弹——怀疑像一道光穿过所有确定性的盔甲,不打碎,但什么也挡不住它。",
    }),
    flavorText: "你确定吗？不确定也没关系。",
    dropWeight: 30,
  },

  // 14. 我思之剑
  {
    templateId: "cogito_sword",
    name: "我思之剑",
    rarity: "common",
    slot: "weapon",
    attackType: "symbolic_slash",
    stageRange: [1, 25],
    baseStats: { atk: 6 },
    effects: [],
    concept: findConcept_provide('cogito_sword', {
      id: "cogito", term: "我思故我在(Cogito)", termEn: "Cogito, ergo sum",
      school: "近代哲学 / 笛卡尔", field: "哲学",
      summary: "笛卡尔在《第一哲学沉思集》中做了一个彻底的思想实验:假设有一个全能的恶魔,它用尽全力欺骗我——我的感官、记忆、甚至数学直觉都可能是假的。那还有什么不能被怀疑？笛卡尔的回答是:'我思故我在'(Cogito, ergo sum)。即使我被欺骗,那个'正在被欺骗的我'也必须在思——而思考需要一个执行者,所以'我在思'这件事本身不可怀疑,因此'我存在'也不可怀疑。这是笛卡尔为知识重建找到的'阿基米德点'——撬动整个确定性体系的支点。",
      origin: "勒内·笛卡尔(René Descartes, 1596-1650)在《第一哲学沉思集》(Meditationes de Prima Philosophia, 1641)第二个沉思中论证Cogito。有趣的是,笛卡尔并非第一个提出类似论证的人——奥古斯丁在《上帝之城》中已有'我错故我在'(si fallor, sum)的表述,但笛卡尔将其从一个神学注脚发展为整个近代认识论的基石。",
      influence: "Cogito开启了近代主体性哲学传统:康德的'先验统觉'、胡塞尔的'先验自我'、萨特的'前反思的我思'都可以视为Cogito的批判性继承。同时,海德格尔批评Cogito把人的存在还原为'思维实体',遗忘了'在世存在'。",
      misconception: "不是'我存在因为我思考'——笛卡尔的论证更精妙:不是思考导致存在,而是'我正在思考'这个行为本身就是存在的直接证据。怀疑本身证明了怀疑者的存在。",
      designNote: "快速单体斩——像'我思'一样直接、不绕弯子。没有花哨,它就是确定了的那一剑。",
    }),
    flavorText: "这一剑之前,一切都可以怀疑。这一剑之后,至少你在挥。",
    dropWeight: 30,
  },

  // 15. 二元论之刃
  {
    templateId: "dualism_blade",
    name: "二元论之刃",
    rarity: "common",
    slot: "weapon",
    attackType: "symbolic_slash",
    stageRange: [1, 25],
    baseStats: { atk: 4, crit: 0.03 },
    effects: [],
    concept: findConcept_provide('dualism_blade', {
      id: "cartesian_dualism", term: "心物二元论", termEn: "Cartesian Dualism",
      school: "近代哲学 / 笛卡尔", field: "哲学",
      summary: "笛卡尔在Cogito之后面临一个难题:既然'我是一个在思维的东西'(res cogitans)和'我的身体是一个在空间中延展的东西'(res extensa)是两种属性完全不同的实体,它们如何相互作用？当我决定举手,一个非物质的心灵如何让一个物质的手臂动起来？笛卡尔的回答是:通过大脑中的松果腺——但这个答案让后来的哲学家们笑了三百年。心身二元论引发的'心身问题'至今是心灵哲学的核心难题。",
      origin: "笛卡尔在《第一哲学沉思集》第六沉思中区分了思维实体和广延实体,并在《灵魂的激情》(1649)中提出松果腺假说。虽然他的'解决方案'早已被抛弃,但他准确地识别出了一个真正的哲学难题——后来的哲学家称之为'笛卡尔的剧场'。",
      influence: "心身二元论引发了英国经验论(洛克、休谟)的批评、斯宾诺莎的心物平行论(同一实体的两个属性)、莱布尼茨的预定和谐,以及20世纪赖尔在《心的概念》中的著名批判——他称之为'机器中的幽灵'教条。当代心灵哲学中的物理主义和功能主义也都是对笛卡尔二元论的回应。",
      misconception: "不是'灵魂比身体高贵'——笛卡尔的二元是实体层面的形上学划分,不是价值判断。他并没有贬低身体,只是认为身体和心灵在本质上不同。",
      designNote: "快速单体+微量暴击——二元分裂让每一击都有两个维度:物理的切割和心灵的瞄准。",
    }),
    flavorText: "挥刀的是身体,决定挥刀的是心灵——它们从来不是同一个东西。",
    dropWeight: 28,
  },

  // 16. 白板之刃
  {
    templateId: "tabula_rasa_blade",
    name: "白板之刃",
    rarity: "common",
    slot: "weapon",
    attackType: "symbolic_slash",
    stageRange: [1, 20],
    baseStats: { atk: 5, aspd: 0.05 },
    effects: [],
    concept: findConcept_provide('tabula_rasa_blade', {
      id: "tabula_rasa", term: "白板(Tabula Rasa)", termEn: "Tabula Rasa / Blank Slate",
      school: "经验论 / 洛克", field: "哲学",
      summary: "约翰·洛克在《人类理解论》中反驳了'天赋观念'论(笛卡尔认为某些观念如上帝、几何公理是人生来就有的)。洛克说:心灵是一块'白板'(tabula rasa)——刚出生时上面什么都没有,所有知识都来自经验。经验有两个来源:感觉(sensation,对外部世界的感知)和反省(reflection,对心灵自身活动的感知)。简单观念像原子一样被感觉写入白板,复杂观念则是心灵对这些简单观念的'组合、比较和抽象'。",
      origin: "约翰·洛克(John Locke, 1632-1704)在《人类理解论》(An Essay Concerning Human Understanding, 1689)中系统阐述了经验主义认识论。'白板'这个比喻本身可以追溯到亚里士多德(在《论灵魂》中把心灵比作一块还没有被刻写的蜡板),洛克将其发展为完整的经验论纲领。",
      influence: "洛克的经验论影响了贝克莱的主观观念论和休谟的彻底经验论,并通过休谟唤醒了康德的'独断论迷梦'。同时,洛克的'白板'说也为启蒙运动的教育乐观主义(爱尔维修:教育可以塑造一切)和现代心理学中的行为主义提供了哲学基础。",
      misconception: "不是'人完全没有先天差异'——洛克承认人的天赋能力有差异(有人记忆力好,有人想象力强),他否定的是'天赋观念',不是'天赋能力'。",
      designNote: "攻击+微量攻速——每一次击中都是'经验的刻写',累积越多,速度越快。",
    }),
    flavorText: "没有先天的锋利,每一次击中都是一次新学的经验。",
    dropWeight: 28,
  },

  // 17. 唯物论之镰
  {
    templateId: "materialism_sickle",
    name: "唯物论之镰",
    rarity: "common",
    slot: "weapon",
    attackType: "trilemma",
    stageRange: [1, 20],
    baseStats: { atk: 4 },
    effects: [],
    concept: findConcept_provide('materialism_sickle', {
      id: "atomism", term: "原子唯物论", termEn: "Atomism",
      school: "古希腊哲学 / 德谟克利特", field: "哲学",
      summary: "德谟克利特和留基伯在公元前五世纪提出了一个惊人的假说:万物由不可分割的微小粒子——原子(atomos,希腊语'不可切割')构成。原子在虚空中运动、碰撞、组合,形成我们看到的一切。没有神灵设计、没有目的因、没有灵魂(灵魂也是更精细的原子)——只有原子和虚空。这个假说在两千多年后被现代物理学以完全不同的方式证实了,虽然'原子'现在是可以分割的。",
      origin: "留基伯(Leucippus, 约公元前5世纪)通常被认为是原子论的创始人,但他的学生德谟克利特(Democritus, 约公元前460-370)将其系统化。原子论是对巴门尼德'存在是一、变化是幻觉'的直接反驳——原子论者说:存在是多(无数原子),变化是真的(原子重组)。",
      influence: "伊壁鸠鲁继承并修改了原子论(加入'原子偏斜'来解释自由意志),卢克莱修在《物性论》中用长诗传播了原子论。近代科学革命中,伽桑狄、波义耳和牛顿重新激活了原子论,虽然他们都加上了上帝作为原子运动的终极原因。",
      misconception: "不是'唯物主义就是没有灵魂'——德谟克利特认为灵魂本身也是由更精细的'灵魂原子'构成,所以死亡只是灵魂原子的离散,不是什么神秘事件。",
      designNote: "三向散射——像原子碰撞后的散射轨迹。每一发都是'不可分割'的最小攻击单元。",
    }),
    flavorText: "没有目的,没有设计——只是无穷的原子,在一次又一次地碰撞。",
    dropWeight: 26,
  },

  // 18. 辩证法之剑
  {
    templateId: "dialectic_sword",
    name: "辩证法之剑",
    rarity: "common",
    slot: "weapon",
    attackType: "symbolic_slash",
    stageRange: [1, 30],
    baseStats: { atk: 5 },
    effects: [],
    concept: findConcept_provide('dialectic_sword', {
      id: "socratic_dialectic", term: "辩证法(Dialectic)", termEn: "Socratic Dialectic",
      school: "古希腊哲学 / 苏格拉底-柏拉图", field: "哲学",
      summary: "苏格拉底的方法不是发表长篇大论,而是——提问。他假装自己一无所知(苏格拉底式的反讽:eironeia),然后不断地问:'你说的正义是什么意思？''这个定义能涵盖所有情况吗？''那这个反例呢？'——一步一步剥去对方错误的意见(doxa),逼近知识(episteme)。多数对话没有给出最终答案,但消除了错误的确定性——苏格拉底说他的工作像助产婆:不生产真理,只是帮助真理从对话者的心灵中'生出'。这就是西方哲学的源起形态:不是信条的宣示,而是追问的技艺。",
      origin: "苏格拉底(Socrates, 公元前469-399)本人没有留下著作,他的方法和思想通过学生柏拉图(Plato)的对话录流传下来——主要是早期对话如《游叙弗伦》《拉凯斯》《卡尔米德》。柏拉图后期对话中辩证法从'盘问'演变为更系统的'理念论'方法。",
      influence: "辩证法概念经历了剧烈变迁:中世纪成为神学论证的技艺;康德的'先验辩证法'指理性越界时产生的幻相;费希特和黑格尔将其提升为哲学的根本方法(正反合);马克思将其'颠倒'为唯物辩证法。",
      misconception: "不是'辩论技巧'——苏格拉底的辩证法和诡辩家的修辞术完全不同。前者追求真理,后者追求说服。苏格拉底宁愿输掉辩论也不接受错误的论证。",
      designNote: "快速单体——像苏格拉底的一连串质问:不重,但每一击都在剥去一层伪装。",
    }),
    flavorText: "这不是攻击,这是追问。回答不了的人,自然倒下。",
    dropWeight: 26,
  },

  // ────── RARE 武器 (9把, stage 5-70) ──────

  // 19. 逻各斯之剑
  {
    templateId: "logos_sword",
    name: "逻各斯之剑",
    rarity: "rare",
    slot: "weapon",
    attackType: "symbolic_slash",
    stageRange: [5, 50],
    baseStats: { atk: 12, crit: 0.05 },
    effects: [],
    concept: findConcept_provide('logos_sword', {
      id: "logos", term: "逻各斯(Logos)", termEn: "Logos",
      school: "古希腊哲学 / 赫拉克利特", field: "哲学",
      summary: "赫拉克利特以'万物皆流'(panta rhei)闻名——'人不能两次踏入同一条河流'——但他的哲学中还有一个更深刻的概念:逻各斯(Logos)。逻各斯是宇宙内在的理性秩序,是那个让流动的万物保持某种和谐比例的原则。对立面(冷/热、生/死、战争/和平)在表面上冲突,但逻各斯使它们处于一种动态的平衡中——'不明显的和谐比明显的和谐更强大'。赫拉克利特的逻各斯是西方哲学中'理性''逻辑''规律'等概念的远古源头。",
      origin: "赫拉克利特(Heraclitus, 约公元前535-475)以晦涩箴言著称,现存残篇约130条。'万物皆流'这一表述可能不是他的原话(而是柏拉图在《克拉底鲁篇》中的概括),但符合他的思想。他在以弗所的阿耳忒弥斯神庙中存放了他的著作——故意写得晦涩,声称'自然喜欢隐藏自己'。",
      influence: "逻各斯概念在斯多亚学派中被等同于宇宙理性(神);在《约翰福音》开篇被等同于基督('太初有Logos');在黑格尔的哲学中,逻各斯演变为'理性'在历史中的自我展开。直到今天,'逻辑'(logic)这个词的词源仍指向赫拉克利特的逻各斯。",
      misconception: "不是'万物都有一个解释'——赫拉克利特的逻各斯更像是音乐的和谐比例,而不是科学的因果规律。它不是解释'为什么',而是描述'怎么和谐'。",
      designNote: "攻击+暴击——不是力量,是秩序。'逻各斯'让每一次挥击都恰好命中敌人最脆弱的位置。",
    }),
    flavorText: "河流在变,河床在变——但河流为什么往下流,这个道理不变。",
    dropWeight: 20,
  },

  // 20. 隐德莱希之钥
  {
    templateId: "entelechy_key",
    name: "隐德莱希之钥",
    rarity: "rare",
    slot: "weapon",
    attackType: "thought",
    stageRange: [10, 60],
    baseStats: { atk: 13 },
    effects: [],
    concept: findConcept_provide('entelechy_key', {
      id: "entelechy", term: "隐德莱希(Entelechy)", termEn: "Entelechy",
      school: "古希腊哲学 / 亚里士多德", field: "哲学",
      summary: "亚里士多德用它来描述事物从'潜能'(dynamis)向'现实'(energeia)的实现过程。一颗橡子是'潜在地'的橡树——它内部已经包含了成为橡树的一切条件,只是还没有展开。当它长成橡树时,它就实现了它的'隐德莱希'——这是一种内在的目的性:橡子不是被外界'推'成橡树的,而是出于它自己的本性'趋向'成为橡树。亚里士多德用这个概念解释自然界的秩序:万物都在朝着自己的'完满实现'运动,这种运动不需要外部的设计者。",
      origin: "亚里士多德在《物理学》和《形而上学》中发展了潜能/现实的区分以及隐德莱希概念。entelecheia是亚里士多德自己造的词:en(在)+ telos(目的)+ echein(拥有)——'在自身中拥有目的'。",
      influence: "潜能/现实的区分在中世纪经院哲学中被广泛运用(阿奎那用其论证上帝的存在),在德国观念论中被重新激活(黑格尔的'精神'概念),并且在当代生物学哲学中(如生命现象的自组织理论)仍有回响。",
      misconception: "不是'一切都有预定命运'——隐德莱希是内在的目的性,不是外在的命运安排。橡子'想要'成为橡树,但如果被松鼠吃了,它的隐德莱希就不实现。",
      designNote: "穿透弹——像潜能穿过现实的重重阻碍,最终在终点'实现'自己。慢,但一定会到。",
    }),
    flavorText: "你还没命中敌人,但你'已经在命中'——这就是潜能,它不需要到达才存在。",
    dropWeight: 18,
  },

  // 21. 四因论之杖
  {
    templateId: "four_causes_staff",
    name: "四因论之杖",
    rarity: "rare",
    slot: "weapon",
    attackType: "trilemma",
    stageRange: [10, 50],
    baseStats: { atk: 11 },
    effects: [],
    concept: findConcept_provide('four_causes_staff', {
      id: "four_causes", term: "四因论", termEn: "Four Causes",
      school: "古希腊哲学 / 亚里士多德", field: "哲学",
      summary: "亚里士多德提出,要完整地解释一件事物,需要回答四个问题——这就是'四因说':质料因(它由什么材料构成？如雕像的大理石)、形式因(它的本质形态是什么？如阿波罗的形象)、动力因(是什么让它开始存在？如雕刻家的手)、目的因(它是为了什么？如为了供奉在神庙中)。四因不是四个选项供你挑选,而是四个不可分割的维度——任何一个缺失,你对事物的理解都是残缺的。用四因论看任何事物,你会发现现代科学只回答了其中的质料因和动力因,而形式因和目的因被排除在'科学解释'之外了。",
      origin: "亚里士多德在《物理学》第二卷和《形而上学》中系统阐述了四因说。虽然这个框架在后来的哲学史中不断被修正,但它塑造了西方人理解世界的根本方式——直到培根和笛卡尔在近代科学革命中才被逐步放弃(只保留动力因)。",
      influence: "阿奎那用目的因论证上帝的存在(第五路证明);培根批评目的因阻碍了科学进步;康德将目的因重新引入(作为'判断力'的调节性原则而非构成性原则);达尔文进化论用自然选择从根本上解释了目的性,从而'消除了'目的因在自然界的必要性。",
      misconception: "不是'四个原因导致一个结果'——亚里士多德的'因'(aitia)更接近'解释维度'而非'因果原因'。英文翻译成'four causes'本身就造成了误解——更准确的翻译可能是'four becauses'。",
      designNote: "三向散射——每一发都携带多重'原因',敌人无法只防御其中一种。混在一起,攻击就是无法完全解释的。",
    }),
    flavorText: "敌人问你为什么打他——你不需要回答。你打他有四重原因,他自己去数。",
    dropWeight: 16,
  },

  // 22. 唯我论之钥
  {
    templateId: "solipsism_key",
    name: "唯我论之钥",
    rarity: "rare",
    slot: "weapon",
    attackType: "thought",
    stageRange: [5, 40],
    baseStats: { atk: 10, crit: 0.04 },
    effects: [],
    concept: findConcept_provide('solipsism_key', {
      id: "solipsism", term: "唯我论(Solipsism)", termEn: "Solipsism",
      school: "经验论 / 贝克莱", field: "哲学",
      summary: "唯我论是从经验论内部产生的最极端结论:既然我的一切知识都只能来自于我自己的感觉经验,那么我怎么知道在我之外存在着其他心灵？我看到了你的身体、听到了你的声音、观察到了你的行为——但这些都只是我的感官经验。经验论要求从经验出发推导一切,但'其他心灵存在'恰恰是无法从经验中推导的。贝克莱试图用上帝来避免唯我论(上帝保证了经验来源的客观性),但休谟把上帝也归入'无法经验到的东西',彻底堵死了退路。唯我论一直是认识论的一个'幽灵'——你可以用各种论证反对它,但无法完全驳倒。",
      origin: "唯我论的古典表述出现在贝克莱的'存在即被感知'(esse est percipi)中,但贝克莱本人不是唯我论者(他引入上帝来保证经验的一致性)。真正把唯我论逼到墙角的是休谟——他论证了'自我'本身也只是一束知觉,连'唯我论'的那个'我'都站不住脚。",
      influence: "唯我论问题间接促成了胡塞尔对笛卡尔式独我论主体的超越(通过'交互主体性'概念)、维特根斯坦的'私人语言论证'(私人语言在逻辑上是不可能的),以及当代社会认知理论(如何从第三人称数据推断他人的心理状态)。",
      misconception: "不是'别人都不存在'——唯我论者并不真的认为别人不存在。他只是在认识论上承认:别人存在的证据无法达到绝对确定性。这是一种哲学立场,不是一种生活信念。",
      designNote: "穿透弹+暴击——'我'的思想穿过一切外在,敌人不过是'我'感知中的一个对象,暴击就是'我看穿你了'。",
    }),
    flavorText: "我怎么知道敌人存在？我打它——它掉血了——它'被我感知'为存在的。这还不够吗。",
    dropWeight: 18,
  },

  // 23. 悬置之锏
  {
    templateId: "epoche_mace",
    name: "悬置之锏",
    rarity: "rare",
    slot: "weapon",
    attackType: "symbolic_slash",
    stageRange: [10, 50],
    baseStats: { atk: 11, dodge: 0.03 },
    effects: [],
    concept: findConcept_provide('epoche_mace', {
      id: "epoche", term: "悬置(Epoché)", termEn: "Phenomenological Epoché",
      school: "现象学 / 胡塞尔", field: "哲学",
      summary: "胡塞尔的现象学方法的第一步是'悬置'(epoché)——将我们对世界的'自然态度'(认为世界独立于我们而存在)搁置起来,不加判断。注意:不是否定世界存在(那就成了怀疑论),而是'暂时不加判断',以便我们可以纯粹地观看意识的结构——意识是如何让一个世界'被给予'的。就像你去美术馆看一幅画,你把它'当作画'来欣赏,而不是'当作一扇窗户'来往外看——悬置让你从'透过意识看世界'切换到'看意识本身'。这是现象学方法的核心操作。",
      origin: "胡塞尔从古希腊怀疑论中借用了epoché这个词(皮浪主义者也主张悬置判断),但赋予了它完全不同的意义。胡塞尔的悬置不是怀疑论者的结论,而是现象学方法的起点——搁置世界的存在设定,以便揭示意识的意向结构。",
      influence: "悬置方法影响了海德格尔的'形式显示'、梅洛-庞蒂的'现象学还原'、德里达的'括号化'操作,并且在人类学的'陌生化'方法中也有应用(把熟悉的日常现象当作陌生的来观察)。",
      misconception: "不是'什么都不确定'——悬置不是怀疑,而是方法论的搁置。做完现象学分析之后,你完全可以回到自然态度中继续生活。你只是多了一种观看方式,没有失去任何东西。",
      designNote: "攻击+闪避——悬置不是逃避,是'暂时不加判断',这让你的身位更灵活。",
    }),
    flavorText: "不判断敌人是否存在,不判断攻击是否有效——先搁置,先挥。",
    dropWeight: 16,
  },

  // 24. 充足理由之锤
  {
    templateId: "sufficient_reason_hammer",
    name: "充足理由之锤",
    rarity: "rare",
    slot: "weapon",
    attackType: "trilemma",
    stageRange: [10, 60],
    baseStats: { atk: 14 },
    effects: [],
    concept: findConcept_provide('sufficient_reason_hammer', {
      id: "sufficient_reason", term: "充足理由律", termEn: "Principle of Sufficient Reason",
      school: "理性主义 / 莱布尼茨", field: "哲学",
      summary: "莱布尼茨提出了一条他认为和矛盾律一样基本的逻辑原则:没有任何事实在没有'充足理由'的情况下为真。每一个命题、每一个事件、每一个存在的事物,都必须有一个'为什么是这样而不是那样'的充分解释。如果你在森林中发现了一块孤立的巨石,你不能说'它本来就在那里'——你必须能说出它为什么在那里。莱布尼茨用这个原则论证上帝的存在:整个宇宙需要有一个它存在的充足理由,而这个理由只能是上帝。充足理由律让宇宙从一个'事实集合'变成了一个'解释体系'。",
      origin: "戈特弗里德·威廉·莱布尼茨(Gottfried Wilhelm Leibniz, 1646-1716)在《单子论》(Monadology, 1714)和《神正论》(Theodicy, 1710)中反复运用充足理由律。他在给克拉克的信(莱布尼茨-克拉克通信集)中详尽阐述了这一原则,用来反对牛顿的绝对空间概念。",
      influence: "充足理由律影响了沃尔夫的理性主义体系,被休谟质疑(因果关系不能从经验中获得充足理由),被康德重新限定(只在现象世界有效,不能用于物自体)。叔本华在他的博士论文《论充足理由律的四重根》中将其系统化。",
      misconception: "不是'一切都有原因'——莱布尼茨的充足理由律比因果律更广:它要求一切真理都有理由,包括逻辑真理和数学真理,而不仅仅是因果事件。",
      designNote: "三向散射锤——每一发都有'充足的理由'。不是随机散射,是每一个方向都有被命中的必要性。",
    }),
    flavorText: "不是你想打它——是它'有充足的理由'被打。",
    dropWeight: 15,
  },

  // 25. 此在之剑
  {
    templateId: "dasein_sword",
    name: "此在之剑",
    rarity: "rare",
    slot: "weapon",
    attackType: "thought",
    stageRange: [10, 60],
    baseStats: { atk: 13 },
    effects: [],
    concept: findConcept_provide('dasein_sword', {
      id: "dasein_weapon", term: "此在(Dasein)", termEn: "Dasein",
      school: "存在主义 / 海德格尔", field: "哲学",
      summary: "海德格尔用'此在'(Dasein)来指称人,但这个词不是'人'的同义词——此在是那种以'存在本身为问题'的存在者。一棵树存在,但树不追问'存在是什么意思'。此在不问,此在追问。此在的存在方式是'在世界中存在'(In-der-Welt-sein)——注意这是一个词,不是三个词:此在不是在某个物理学空间中,而是通过操劳(同工具打交道)、操持(同他人打交道)和展开(理解)的方式'让'一个世界'出现'。世界不是此在的容器——世界是此在的构成要素,是此在的'生存论环节'。",
      origin: "海德格尔在《存在与时间》(1927)中以'此在分析论'(第一篇)作为追问'存在的意义'的入口。他刻意避免使用'人''主体''意识'等传统哲学术语,以摆脱笛卡尔以来主体性哲学的重负。",
      influence: "此在分析影响了萨特的'自为存在'(L'être-pour-soi)、梅洛-庞蒂的身体现象学、列维纳斯的他者伦理学,以及当代的'具身认知'理论和人工智能中的'涉身性'讨论。",
      misconception: "不是'活在当下'——海德格尔的'此在'的核心特性是其'时间性'(Zeitlichkeit),时间不是从过去流到现在再流到未来,而是此在的'曾在''当前''将来'三个维度同时展开的结构。",
      designNote: "穿透弹——此在的每一击都'在世界中'发生,敌人无法独善其身。你挥的不仅是剑,是你的整个'在世存在'。",
    }),
    flavorText: "你挥剑的那一刻,世界——整个概念战场——都参与了这一击。",
    dropWeight: 16,
  },

  // 26. 唯名论之刃
  {
    templateId: "nominalism_blade",
    name: "唯名论之刃",
    rarity: "rare",
    slot: "weapon",
    attackType: "symbolic_slash",
    stageRange: [5, 45],
    baseStats: { atk: 10, itemFind: 0.05 },
    effects: [],
    concept: findConcept_provide('nominalism_blade', {
      id: "nominalism", term: "唯名论(Nominalism)", termEn: "Nominalism",
      school: "中世纪哲学 / 奥卡姆", field: "哲学",
      summary: "中世纪哲学围绕一个根本问题争论了几个世纪:共相(universals)——如'红色''人性''马性'——是否真实存在？'实在论'者(以柏拉图和阿奎那为代表)认为共相比个体事物更真实;而'唯名论'者——尤其是奥卡姆的威廉——认为共相只是'名字'(nomina):这个世界上只有个体事物存在,'红色'不是一个独立的存在,只是你用来称呼那一堆红色的东西的共同名称。奥卡姆的这一立场让他提出了著名的'奥卡姆剃刀':'如无必要,勿增实体'——不要把共相当作实体来增加你的本体论账单。",
      origin: "奥卡姆的威廉(William of Ockham, c.1287-1347)是14世纪方济各会修士,在牛津和巴黎任教。他的唯名论立场导致他被控异端(因为唯名论削弱了经院哲学的神学论证),他被传唤到阿维尼翁教皇宫廷受审,后逃往巴伐利亚避难。",
      influence: "唯名论深刻影响了近代科学的诞生——如果共相不是实体,那科学就不应该研究'为什么物体会下落',而应该研究'这个具体的物体下落了多少、有多快'。伽利略和牛顿的实验方法在哲学上预设了唯名论立场。布卢门伯格将现代性的起源追溯到唯名论对经院实在论的瓦解。",
      misconception: "不是'名字不重要'——奥卡姆说的是共相作为本体论实体不存在,他没有说语言不重要。名字作为认知工具当然有用,只是不要把它和现实混淆。",
      designNote: "攻击+物品发现——'名字越少,实体越少,越容易发现真正重要的东西'。",
    }),
    flavorText: "这把剑叫'唯名论之刃'——但'刃'只是一个名字。你握在手里的才是唯一的实体。",
    dropWeight: 16,
  },

  // 27. 休谟之叉
  {
    templateId: "hume_fork",
    name: "休谟之叉",
    rarity: "rare",
    slot: "weapon",
    attackType: "trilemma",
    stageRange: [10, 55],
    baseStats: { atk: 12, critDmg: 0.3 },
    effects: [],
    concept: findConcept_provide('hume_fork', {
      id: "hume_fork", term: "休谟之叉(Hume's Fork)", termEn: "Hume's Fork",
      school: "经验论 / 休谟", field: "哲学",
      summary: "大卫·休谟在他的《人类理解研究》末尾提出了一个著名的论断——后来被称为'休谟之叉':如果我们拿起任何一本书,问它是否包含关于数量和数目的抽象推理？否。是否包含关于事实和存在的实验推理？否。那么把它烧掉,因为它包含的只有诡辩和幻想。休谟的'叉子'把一切知识分为两类:'观念的关系'(relations of ideas,如数学和逻辑,其反面是矛盾的)和'事实'(matters of fact,如经验科学,其反面总是可能的)。这个二分法是经验主义的最高表达:任何既不来自逻辑推演、也不来自感官经验的命题都是无意义的。",
      origin: "大卫·休谟(David Hume, 1711-1776)在《人类理解研究》(An Enquiry Concerning Human Understanding, 1748)末尾写下这段著名论断。这本小书是休谟对他的大部头《人性论》(1739写作时他只有28岁)的重写和简化版。",
      influence: "休谟之叉直接影响了康德('独断论的迷梦')、维也纳学派的逻辑实证主义(意义可证实性原则)、卡尔·波普尔的证伪主义。维特根斯坦《逻辑哲学论》的结尾也表达了类似的立场——'对于不可说的东西,必须保持沉默'。",
      misconception: "不是'只有科学才有意义'——休谟自己并不把道德、美学和日常生活的判断归入'应该烧掉'的范畴。他的叉子针对的是经院形而上学和神学,不是所有非科学话语。",
      designNote: "三向散射+暴击伤害——休谟之叉把一切切成两块,但投射物的第三枚提醒你:因果关系不是'必然',只是习惯。",
    }),
    flavorText: "你看见A然后看见B,你就以为A引起了B——休谟说你只是'习惯了'。",
    dropWeight: 14,
  },

  // ────── EPIC 武器 (10把, stage 15-200) ──────

  // 28. 单子论之镰
  {
    templateId: "monadology_sickle",
    name: "单子论之镰",
    rarity: "epic",
    slot: "weapon",
    attackType: "trilemma",
    stageRange: [20, 120],
    baseStats: { atk: 22 },
    effects: [],
    concept: findConcept_provide('monadology_sickle', {
      id: "monadology", term: "单子论(Monadology)", termEn: "Monadology",
      school: "理性主义 / 莱布尼茨", field: "哲学",
      summary: "莱布尼茨在晚年提出了一个极其精美的形而上学体系:世界由无限多的'单子'(monads)构成。每一个单子都是一个不可分的、没有窗户的、独一无二的实体——它不接收任何外部输入,不与其他单子发生任何因果作用。但每一个单子都'反映'着整个宇宙,像一个活的镜子。单子之间为什么看起来协调一致？因为上帝在创世时预先设定好了每一个单子的'内在程序'(预定和谐),所以它们各自独立运作,却永远同步——像两支完美的表,各自走自己的,却显示同一时间。这就是理性主义形而上学最精致的版本。",
      origin: "莱布尼茨在《单子论》(1714)中提出了这一体系。这篇短文写于莱布尼茨的晚年,是他和萨瓦亲王欧根的通信中未经发表的手稿。莱布尼茨1716年去世后,这篇手稿在1840年才被完整出版。",
      influence: "单子论影响了沃尔夫的理性主义体系、康德的'物自体'概念(作为对单子论的回应)、德勒兹的'褶子'概念(将单子重新解读为差异和折叠),并在当代关于意识、量子纠缠和个体性的讨论中偶尔被引用。",
      misconception: "不是'独居的小世界'——单子没有窗户并不意味着它们是孤立的;正相反,每一个单子都包含着整个宇宙的'视角',所以每一个单子都和其他所有单子有着先天的关联。",
      designNote: "三向散射——三枚弹幕像三个没有窗户的单子,各自独立飞行,但每一个都'包含'着同一把武器的力量。",
    }),
    flavorText: "每一枚弹幕都是独立的,但如果你看到它们在同一刻发光——那不是巧合,是预定和谐。",
    dropWeight: 10,
  },

  // 29. 预定和谐之枪
  {
    templateId: "preestablished_harmony_spear",
    name: "预定和谐之枪",
    rarity: "epic",
    slot: "weapon",
    attackType: "thought",
    stageRange: [20, 80],
    baseStats: { atk: 20, crit: 0.06 },
    effects: [],
    concept: findConcept_provide('preestablished_harmony_spear', {
      id: "preestablished_harmony", term: "预定和谐", termEn: "Pre-established Harmony",
      school: "理性主义 / 莱布尼茨", field: "哲学",
      summary: "莱布尼茨面临一个笛卡尔没能解决的问题:如果心灵和身体是完全不同的实体,它们如何同步？莱布尼茨优雅地绕开了'相互作用'这个死胡同:它们不需要相互作用！上帝在创造世界时已经把每一个单子(包括你的心灵单子和你的身体单子群)的'程序'写好了——所以当你决定举手时,你的心灵单子和身体单子各自按照预定的轨迹运行,一个'意愿'和一次'动作'在时间上完美重合,不是因果关系,而是'预定和谐'。这像两支完美校准的钟表——各自独立走,但永远同调。",
      origin: "莱布尼茨在《新体系》(1695)和《单子论》(1714)中阐述预定和谐,作为对笛卡尔心身互动论和马勒伯朗士偶因论的替代方案。莱布尼茨认为他的方案最完美地兼顾了实体独立性和现象一致性。",
      influence: "预定和谐是理性主义的重要解决方案,但也成为经验主义者嘲笑的对象(伏尔泰在《老实人》中通过潘格洛斯博士讽刺了'最好的可能世界'假说)。预定和谐在当代心灵哲学中偶尔被援引为'平行论'的一个版本。",
      misconception: "不是'宿命论'——预定和谐不预设'我注定要挥这一剑'——你仍然在自由地选择挥剑,只是你的选择和剑的运动之间的'同步'是预定的。自由和预定在莱布尼茨那里并不矛盾。",
      designNote: "穿透弹+暴击——弹幕不需要'追踪'敌人,它和敌人'本来就注定会相遇'。",
    }),
    flavorText: "你瞄准的方向和敌人移动的方向在创世之前就已经被校准了。",
    dropWeight: 8,
  },

  // 30. 先天范畴之剑
  {
    templateId: "categories_sword",
    name: "先天范畴之剑",
    rarity: "epic",
    slot: "weapon",
    attackType: "symbolic_slash",
    stageRange: [20, 100],
    baseStats: { atk: 24, critDmg: 0.4 },
    effects: [],
    concept: findConcept_provide('categories_sword', {
      id: "kant_categories", term: "先天范畴(Categories)", termEn: "A Priori Categories",
      school: "先验哲学 / 康德", field: "哲学",
      summary: "康德在《纯粹理性批判》中论证:人类知性有十二个'先天范畴'(如统一性/多数性、实在性/否定性、实体性/因果性)——这些不是我们从经验中'学来的',而是我们'带着它们'去看经验。我们不是'发现'了因果关系,而是'以因果性的范畴'去组织感官材料——就像一个戴着蓝色眼镜的人看到的世界全是蓝色的,不是世界本身是蓝色的,而是眼镜'先天地'决定了经验的形式。范畴是经验的先天条件:没有它们,经验就不可能。这就是康德的'哥白尼革命'——不是认识必须符合对象,而是对象必须符合认识形式。",
      origin: "康德在《纯粹理性批判》'范畴表'和'范畴的先验演绎'中系统阐述了这一理论。十二范畴分为四组(量/质/关系/模态),康德声称其源自亚里士多德的范畴论,但经过了严格的先验改造。",
      influence: "范畴学说影响了费希特和黑格尔(将范畴历史化)、胡塞尔(将其改造为现象学的'形式本体论')、皮亚杰的认知发展心理学,以及当代认知科学中关于'核心知识'的争论。",
      misconception: "不是'我们给事物强加概念'——康德说的不是任意的概念强加。范畴是经验的'可能性条件',不是可以随意替换的'视角'。你不能选择不用因果范畴来看世界——那是知性的'硬件',不是'软件'。",
      designNote: "高攻+暴击伤害——范畴是先天的框架,每一击都在框架内被'必然'地增强。",
    }),
    flavorText: "你没有'击中'敌人——你只是用'因果性'这个范畴组织了你的感知:挥剑(因)→ 敌掉血(果)。",
    dropWeight: 8,
  },

  // 31. 统觉之锤
  {
    templateId: "apperception_hammer",
    name: "统觉之锤",
    rarity: "epic",
    slot: "weapon",
    attackType: "trilemma",
    stageRange: [25, 120],
    baseStats: { atk: 25, crit: 0.08 },
    effects: [],
    concept: findConcept_provide('apperception_hammer', {
      id: "transcendental_apperception", term: "先验统觉", termEn: "Transcendental Apperception",
      school: "先验哲学 / 康德", field: "哲学",
      summary: "康德在'范畴的先验演绎'中论证:所有经验之所以能够构成一个统一的'我的经验',是因为存在一个伴随一切表象的'我思'(先验统觉)。如果我听到一声雷声、看到一道闪电、同时感到脚底的地面在震动——这三个经验碎片如何能归属于'同一个我'？如果没有一个统一的自我意识将它们编织在一起,它们就只是三个互不关联的感官刺激,不能构成'雷暴'这个经验。先验统觉不是心理学上的'我觉得',而是经验的逻辑前提:它不加入任何内容,但使一切内容成为'我的'内容成为可能。",
      origin: "康德在《纯粹理性批判》(B版, 1787)的'范畴之先验演绎'中重点阐述了这个概念。他自己承认这是全书最困难的部分,并建议读者如果不理解也不要急于放弃——先看完后面的部分再回头读。",
      influence: "先验统觉成为德国观念论的出发点:费希特将其改造为'绝对自我'的自我设定;黑格尔将其辩证化为精神的自我认识运动;胡塞尔将其发展为'先验自我'的现象学概念;萨特则将其改为'前反思的我思'。",
      misconception: "不是'我有灵魂'——先验统觉不是实体,而是一个逻辑功能:它不是什么神秘的东西,而是那个使经验能够被归为'我的经验'的纯粹形式条件。",
      designNote: "三向散射+暴击——三枚弹幕从不同方向来,但它们最后都'属于同一个我',所以敌人无法分辨哪一枚是本体。",
    }),
    flavorText: "三枚弹幕,三个方向,一个'我'——康德说这就是经验可能的最终条件。",
    dropWeight: 7,
  },

  // 32. 存在之锤
  {
    templateId: "being_hammer",
    name: "存在之锤",
    rarity: "epic",
    slot: "weapon",
    attackType: "trilemma",
    stageRange: [20, 100],
    baseStats: { atk: 23 },
    effects: [],
    concept: findConcept_provide('being_hammer', {
      id: "being", term: "存在(Sein)", termEn: "Being / Sein",
      school: "存在主义 / 海德格尔", field: "哲学",
      summary: "海德格尔认为,西方哲学两千年来犯了一个根本性的错误:它一直在问'存在者是什么'(ontic question),却忘了问'存在本身是什么意思'(ontological question)。当你指着任何东西说'它存在'时,你已经在使用'存在'这个词——但'存在'本身是什么？它不是最大的存在者(不是上帝),也不是一切存在者的总称(不是宇宙)。存在是那个让一切存在者'在'的东西——但它本身不是一个存在者。海德格尔的整个哲学生涯都在追问这个问题,而他最终的答案可能令人失望:存在不是可以被'说清楚'的东西,它是那个'在说'之前就已经在的背景——你必须'在'之后,才能'说'。",
      origin: "海德格尔在《存在与时间》(1927)开篇引用柏拉图的《智者篇》:'当你们用到'存在者'这个说法时,你们显然早就理解它的意思了——但我们曾经自以为懂得的,现在却困惑了。'整本书就是对这个困惑的回应。",
      influence: "海德格尔的存在之问影响了萨特的存在主义(虽然萨特对'存在'的理解和海德格尔差异巨大)、德里达的'延异'(作为'存在'的另一个名字)、列维纳斯的'他者'作为超越存在的伦理。",
      misconception: "不是'思考存在是最重要的事'——海德格尔恰恰认为,把存在当作一个'东西'来思考就会再次把它变成一个存在者。存在不是一个'问题'要解决,而是一个'谜'要栖居。",
      designNote: "三向散射锤——不是锋利,是重量。'存在'不是细节,是砸下来的整个世界的分量。",
    }),
    flavorText: "不是'打中了',是'让敌人意识到自己'在'——并且'在'意味着不在了。'",
    dropWeight: 8,
  },

  // 33. 烦之鞭
  {
    templateId: "sorge_whip",
    name: "烦之鞭",
    rarity: "epic",
    slot: "weapon",
    attackType: "symbolic_slash",
    stageRange: [15, 80],
    baseStats: { atk: 18, lifesteal: 0.03 },
    effects: [],
    concept: findConcept_provide('sorge_whip', {
      id: "sorge", term: "烦(Sorge)", termEn: "Care / Sorge",
      school: "存在主义 / 海德格尔", field: "哲学",
      summary: "海德格尔用'Sorge'(中文常译作'烦''操心''关涉')来概括此在(人)的整个存在结构。这不是心理学上的'烦恼'(虽然也有这个意思),而是一个生存论概念:此在总是'先行于自身'——它总是在筹划自己的可能性,总是在为还没到来的事情操心;同时此在'已经在世界之中'——它被抛入了一个已经给定的处境,不能选择自己的出生和时代;而此在又'寓于世内存在者'——它总是和工具、事物、他人打交道。这三个维度——先行、被抛、打交——构成了Sorge的结构。人的存在本身就是一个'操心'。",
      origin: "海德格尔在《存在与时间》第一篇第六章中分析此在的整体结构时提出Sorge概念,并用一个古老的寓言——'烦'(Cura女神)创造了人——作为例证。",
      influence: "萨特将海德格尔的操心重新解读为'焦虑'和'自由'的关系(人被判定为自由,所以焦虑);护理学哲学家将Sorge发展为一个伦理概念;芒福德在技术哲学中区分了'工具性的操心'和'本真的操心'。",
      misconception: "不是'总是很焦虑'——海德格尔说的操心包括了愉快地做一件事。你在创作一件艺术品时也在'操心',但这种操心不是负面的——它是你存在的方式本身。",
      designNote: "快速+微量吸血——'烦'驱使你不断攻击,每一次击中都是'操心',而'操心'本身维持着此在的存在。",
    }),
    flavorText: "你挥鞭不是因为愤怒,是因为'烦'——你在操心的不是敌人,是你自己的存在。",
    dropWeight: 10,
  },

  // 34. 解构之锤
  {
    templateId: "deconstruction_hammer",
    name: "解构之锤",
    rarity: "epic",
    slot: "weapon",
    attackType: "trilemma",
    stageRange: [25, 150],
    baseStats: { atk: 26 },
    effects: [],
    concept: findConcept_provide('deconstruction_hammer', {
      id: "deconstruction", term: "解构(Déconstruction)", termEn: "Deconstruction",
      school: "后结构主义 / 德里达", field: "哲学",
      summary: "德里达发明了'解构'(déconstruction)这个词,但它不是一种'方法'(德里达坚持说解构不是方法),也不是'拆毁'(解构不是破坏)。解构是揭示一个文本、概念或制度内部一直存在的张力——每个二元对立(言语/文字、在场/缺席、男性/女性)都暗中在推翻自己。你会发现文本中那些被压抑的、边缘化的、被当作次要的元素,其实对于整个体系的成立是不可或缺的——于是整个等级制就从内部坍塌了。解构不创造新体系——它只是让你看到:旧体系从来就没有真正'立'起来过。",
      origin: "雅克·德里达(Jacques Derrida, 1930-2004)在1967年同时出版了三本书——《论文字学》《书写与差异》《声音与现象》——奠定了后结构主义的基石。他自创的'différance'、'药'(pharmakon——同时是毒药和解药)、'补充'(supplément)等概念成为解构的标志。",
      influence: "解构波及了文学批评(耶鲁学派)、法学(批判法学)、建筑学(解构主义建筑)、性别研究(朱迪斯·巴特勒的性别操演理论——某种程度上是对德里达的运用),并且在'后现代主义'的标签下成为一个文化现象。",
      misconception: "不是'一切都是相对的所以什么都行'——解构不是相对主义,它恰恰在揭示:那些声称'绝对'的体系自己就站不住。解构要求的不是'随便',而是更严格的自我反思。",
      designNote: "三向散射锤——每一击都从内部瓦解敌人的'意义',不是从外面打碎,是让它自己倒塌。",
    }),
    flavorText: "它不是碎了——它从来就没有'完整'过。你只是加速了它对自己的瓦解。",
    dropWeight: 7,
  },

  // 35. 延异之镰
  {
    templateId: "differance_sickle",
    name: "延异之镰",
    rarity: "epic",
    slot: "weapon",
    attackType: "trilemma",
    stageRange: [30, 180],
    baseStats: { atk: 28 },
    effects: [],
    concept: findConcept_provide('differance_sickle', {
      id: "differance", term: "延异(Différance)", termEn: "Différance",
      school: "后结构主义 / 德里达", field: "哲学",
      summary: "德里达生造了'différance'这个词——把法语的'différence'(差异)中的e改成a。在法语口语中听不出区别(发音完全相同),所以你怎么知道德里达说的是哪个词？你需要语境——而这正是差异在起作用。这个改变同时注入了两层意思:一是'差异'——意义从来不来自符号和所指之间的固定对应,而来自符号之间的差别系统(猫'和'狗'不同,所以各自有意义);二是'延宕'——意义永远在'被推迟',一个词的完整意义永远不能'在场',它总是在指向下一个词、下一个语境。意义被'差异'和'延宕'永远地推向了未来——'延异'就是这个双重运动。",
      origin: "德里达在1968年的演讲《论延异》中系统阐述了这个概念。这个演讲后来收录在《哲学的边缘》(1972)中。有趣的是,德里达后来自己说:延异既不是词,也不是概念——它只是用来'指示'那个让一切词和概念可能但又不断瓦解它们的底层运动。",
      influence: "延异概念影响了文学理论(哈罗德·布鲁姆的'误读'理论)、文化研究(霍尔的文化身份理论)、后殖民理论(斯皮瓦克的'下属不能说话'),以及广义上的后现代主义——尽管德里达本人对'后现代'这个标签保持距离。",
      misconception: "不是'语言根本没有意义'——延异不是说意义不存在,而是说意义永远是'过程中的'、'差异中的'、'被延宕的',不是也不可能是最终确定的。我们仍然在交流——只是交流永远不是'透明'的。",
      designNote: "三向散射——弹幕之间'差异'且'延宕',每一枚都指向前一枚但永远不重合。意义在散射的过程中消散。",
    }),
    flavorText: "第一枚弹幕说'我是攻击',第二枚说'我不是第一枚',第三枚说'什么是是'——敌人死于意义的无限延宕。",
    dropWeight: 6,
  },

  // 36. 知识考古之剑
  {
    templateId: "archaeology_sword",
    name: "知识考古之剑",
    rarity: "epic",
    slot: "weapon",
    attackType: "symbolic_slash",
    stageRange: [20, 120],
    baseStats: { atk: 23, itemFind: 0.08 },
    effects: [],
    concept: findConcept_provide('archaeology_sword', {
      id: "archaeology_knowledge", term: "知识考古学", termEn: "Archaeology of Knowledge",
      school: "后结构主义 / 福柯", field: "哲学",
      summary: "福柯的'知识考古学'是一场静悄悄的革命——他不研究思想史(一个思想家如何影响了另一个),而是挖掘'话语'(discourse)在特定时代是如何形成的。话语不只是'说话的方式',而是一整套规则系统,它决定了什么可以被说、什么被禁止,什么是'真理'、什么是'疯癫'。福柯的考古学不是研究深层埋藏的真理,而是'挖掘'那些制定规则的匿名规则——谁在说话？以什么身份？在什么制度下？是什么让一句'疯人院应该用人道的方式对待病人'在18世纪是革命性的、在13世纪则是不可理解的？话语的规则——不是思想家——在'考古层'中决定了知识的可能性。",
      origin: "米歇尔·福柯(Michel Foucault, 1926-1984)在《词与物》(1966)和《知识考古学》(1969)中阐述了考古学方法。他后来宣告了'考古学'的结束,将其转为'谱系学'方法(受尼采影响),但在他的众多追随者中,考古学仍然是一种独立的方法。",
      influence: "知识考古学影响了科学社会学(拉图尔)、后殖民研究(萨义德《东方学》)、文化史(新文化史学派),并且为'话语分析'提供了一个具体的方法论框架,远远超出了哲学的范围。",
      misconception: "不是'挖掘真理的考古'——福柯的考古学恰恰不是要找到'真相',而是要揭示'真相本身是如何被话语生产出来的'。它是关于知识如何被'建构'的——而不是关于'真实的知识'是什么。",
      designNote: "高攻+物品发现——剑挖的不是敌人,是敌人'背后'的话语形成条件。挖得越深,掉的东西越稀有。",
    }),
    flavorText: "每一剑不是攻击,是考古发掘——敌人倒下后,你捡起的是它所属的'话语层'的遗物。",
    dropWeight: 7,
  },

  // 37. 规训权力之鞭
  {
    templateId: "discipline_whip",
    name: "规训权力之鞭",
    rarity: "epic",
    slot: "weapon",
    attackType: "symbolic_slash",
    stageRange: [20, 100],
    baseStats: { atk: 21 },
    effects: [],
    concept: findConcept_provide('discipline_whip', {
      id: "disciplinary_power", term: "规训权力(Pouvoir Disciplinaire)", termEn: "Disciplinary Power",
      school: "后结构主义 / 福柯", field: "哲学",
      summary: "福柯在《规训与惩罚》中论证:现代权力与古代权力有根本区别。古代权力是'杀或赦'的暴力表演——国王砍头展示他的绝对权力。而现代权力是'规训'(discipline)——它不需要砍头,它只需要时间表、等级制、考试、监视和正常化判断。军队用队列训练让人成为可互换的零件;学校用考试把每个学生放到一条标准线上比较;监狱用'全景敞视'(panopticon)让囚犯不知道自己是否正在被注视,从而'自己约束自己'。规训权力的核心不是暴力——是制造'驯顺的身体'(docile bodies):不需要有人命令你,你自己就会按照规则去做。",
      origin: "福柯在《规训与惩罚》(Surveiller et punir, 1975)中通过对18-19世纪监狱改革的考古学分析,发现'规训'是一种远比监狱更广泛的社会逻辑——学校、军队、工厂、医院都在运行同样的规训机制。",
      influence: "福柯的规训概念影响了社会学(吉登斯的监控理论)、教育学(标准化考试的批判)、监狱改革运动,以及当代关于'大数据监控''算法规训''社交媒体上的自我规训'的讨论。",
      misconception: "不是'上面的人在控制下面的人'——规训权力的关键恰恰是它不是自上而下的。教师也被考试制度规训,监狱长也被监狱制度规训——规训是一种弥散的权力技术,没有'总部'。",
      designNote: "快速单体——不是暴力,是'标准化的击打'。每一鞭都精准地落在'应该落的位置'。",
    }),
    flavorText: "不是痛,是'你应该在这里被击中'——敌人不需要反抗,规训不需要对抗。",
    dropWeight: 8,
  },

  // 38. 荒诞之刃
  {
    templateId: "absurd_blade",
    name: "荒诞之刃",
    rarity: "epic",
    slot: "weapon",
    attackType: "symbolic_slash",
    stageRange: [15, 80],
    baseStats: { atk: 20, dodge: 0.04 },
    effects: [],
    concept: findConcept_provide('absurd_blade', {
      id: "absurd", term: "荒诞(L'Absurde)", termEn: "The Absurd",
      school: "荒诞主义 / 加缪", field: "哲学",
      summary: "阿尔贝·加缪在《西西弗神话》开篇提出了全书最著名的一句话:'只有一个真正严肃的哲学问题,那就是自杀。'他的意思是:如果你认识到世界没有意义,而人又无法停止追问意义——这两者之间的碰撞就是'荒诞'(l'absurde)。荒诞不是世界的属性,也不是人的属性,而是两者相遇时产生的'关系'。面对荒诞,加缪拒绝了三个解决方案:不自杀(不消灭发问的人),不哲学飞跃(不虚构一个意义来自我安慰,如宗教),而是'反抗'——清醒地活着,明知没有意义却仍然投入生活,像西西弗推石上山,'应当想象西西弗是幸福的'。不是因为推石有意义——而是因为承受荒诞本身就是一种自由。",
      origin: "加缪(Albert Camus, 1913-1960)在《西西弗神话》(Le Mythe de Sisyphe, 1942)中阐述了荒诞哲学。这部小书写于二战期间的沦陷区,加缪既是作家也是抵抗运动成员。他后来在领取诺贝尔文学奖的演讲中说,每一代人都以为自己是改造世界的,但他的任务是阻止世界被毁灭。",
      influence: "荒诞概念影响了存在主义(虽然加缪否认自己是存在主义者)、荒诞派戏剧(贝克特、尤内斯库)、以及20世纪的'反英雄'文学传统。在哲学上,加缪的'反抗'概念启发了后来的非暴力抵抗运动和激进人文主义。",
      misconception: "不是'生活毫无意义所以我躺平'——加缪的反抗恰恰是:因为生活可能毫无意义,所以更要活得淋漓尽致。不是虚无主义的消沉,而是虚无主义中的清醒与激情。",
      designNote: "攻击+闪避——不是胜利主义,是'明知没意义还继续挥'的从容。荒诞让你轻盈,因为你已经不在乎结局。",
    }),
    flavorText: "你知道这一击可能没用——然后你挥了。这就是荒诞英雄的姿势:没有希望,但没有绝望。",
    dropWeight: 8,
  },

  // 39. 互文性之链
  {
    templateId: "intertextuality_chain",
    name: "互文性之链",
    rarity: "epic",
    slot: "weapon",
    attackType: "trilemma",
    stageRange: [25, 120],
    baseStats: { atk: 22, crit: 0.05 },
    effects: [],
    concept: findConcept_provide('intertextuality_chain', {
      id: "intertextuality", term: "互文性(Intertextualité)", termEn: "Intertextuality",
      school: "后结构主义 / 克里斯蒂娃", field: "哲学",
      summary: "茱莉亚·克里斯蒂娃在1966年的一篇论文中提出了'互文性'(intertextualité)这个概念,用来重新定义'文本'是什么。一个文本不是孤立的、封闭的意义单元——它是'对另一个文本的吸收和转化'。你写的每一个句子都引用了无数你读过、听过、吸收过的文本(从童年童谣到哲学经典),所以你写的不是'原创',而是'重组'。每一个文本都是一个'文本的马赛克',每一个作者都只是最后的编辑者——在他之前,有无数个文本已经说了相似的话,他的话的意义不是由他决定的,而是由那些他引用的、他未被意识到的引用所决定的。'互文'不是抄袭——是语言本身的存在方式。",
      origin: "茱莉亚·克里斯蒂娃(Julia Kristeva, 1941年出生)在1966年的论文《词、对话、小说》中整合巴赫金的'对话理论'和索绪尔的语言学,提出了互文性概念。当时她24岁,刚从保加利亚来到巴黎。这篇文章发表于泰凯尔(Tel Quel)学派的重要刊物上。",
      influence: "互文性概念迅速从文学理论扩散到文化研究、电影研究、广告研究和法学(法律文本的'引用链')。罗兰·巴特后来以更通俗的方式表达了类似的思想——'作者已死',文本的意义由读者在无尽的文本网络中重新生成。",
      misconception: "不是'所有东西都抄来抄去'——互文性不是关于抄袭的道德判断,而是关于意义如何产生的本体论判断。'原创'这个概念本身——在互文性的视角下——就是一个神话:你在一个语言共同体中使用语言,语言本身就是'引用'的。",
      designNote: "三向散射+暴击——三枚弹幕互相'引用'彼此,每一枚的意义都'来自'另一枚,所以你无法预判哪一枚是'真的'。",
    }),
    flavorText: "这一击不是你的——它引用了苏格拉底、尼采、德里达和两千年的哲学史。你只是最后的作者。",
    dropWeight: 7,
  },

  // ────── LEGENDARY 武器 (6把, stage 35+) ──────

  // 40. 绝对精神之戟
  {
    templateId: "absolute_spirit_halberd",
    name: "绝对精神之戟",
    rarity: "legendary",
    slot: "weapon",
    attackType: "trilemma",
    stageRange: [40, 300],
    baseStats: { atk: 45, critDmg: 0.6 },
    effects: [],
    concept: findConcept_provide('absolute_spirit_halberd', {
      id: "absolute_spirit", term: "绝对精神(Absoluter Geist)", termEn: "Absolute Spirit",
      school: "德国观念论 / 黑格尔", field: "哲学",
      summary: "黑格尔的绝对精神不是某个神秘的、遥远的'神'——而是理性在人类历史中自我认识的全过程。精神先从'主观精神'(个体意识)开始,在'客观精神'(法律、道德、国家制度)中外化自己,最后在'绝对精神'(艺术→宗教→哲学)中达到对自身的完整认识。这个过程通过'辩证运动'(正题→反题→合题→新的正题...)不断推进——而最关键的操作是'扬弃'(Aufhebung):否定一个东西不是把它扔掉,而是'既保存它又超越它'。当你在哲学中理解了整个世界,你就和绝对精神合一了——哲学是'密涅瓦的猫头鹰',总是在黄昏时才起飞——在事情已经发生之后才来理解。",
      origin: "格奥尔格·威廉·弗里德里希·黑格尔(G.W.F. Hegel, 1770-1831)在《精神现象学》(1807)和《哲学科学全书纲要》(1817/1827/1830)中阐述了绝对精神的概念。他的体系之庞大——从逻辑学到自然哲学到精神哲学——是哲学史上最后的'大全'体系。",
      influence: "绝对精神概念被左翼黑格尔派(费尔巴哈、青年马克思)和右翼黑格尔派从完全相反的方向继承和发展;克尔凯郭尔对黑格尔体系的讽刺性批判开启了存在主义;当代新黑格尔主义(罗伯特·布兰顿等)仍在发掘其思想资源。",
      misconception: "不是'历史有一个预定的结局'——黑格尔不是说历史'应该'走向绝对精神,而是说如果你从终点回头看,你会'理解'历史为什么是这个样子。这是'理性的狡狯'——不是预定,是后见之明的理解。",
      designNote: "三向散射戟+暴击伤害——三枚代表'正/反/合'。正题建立,反题否定,合题超越——每一轮攻击都是一次微型辩证法。",
    }),
    flavorText: "第一枚是正题,第二枚是反题,第三枚不是妥协——是扬弃(Aufhebung):既保存又超越。",
    dropWeight: 3,
  },

  // 41. 语言游戏之钥
  {
    templateId: "language_game_key",
    name: "语言游戏之钥",
    rarity: "legendary",
    slot: "weapon",
    attackType: "trilemma",
    stageRange: [35, 250],
    baseStats: { atk: 40, aspd: 0.1 },
    effects: [],
    concept: findConcept_provide('language_game_key', {
      id: "language_game", term: "语言游戏(Sprachspiel)", termEn: "Language Game",
      school: "语言哲学 / 维特根斯坦(后期)", field: "哲学",
      summary: "后期维特根斯坦彻底推翻了自己早期在《逻辑哲学论》中的立场。在《哲学研究》中,他提出:语言的意义不在于'指称'(word→object),而在于'使用'——就像一枚棋子,它的意义不来自它指称外面的什么东西,而来自它在棋盘上的移动规则。语言不是一个统一的'体系',而是无数个相互交叠的'语言游戏'——下棋、讲笑话、做实验、祈祷——每一个都有自身的内在规则,不能互相通约。追问'意义的意义'是'语言休假'时的哲学病——当语言不工作时,我们不是发现了它的深层本质,而是忘记了它的日常使用。治疗哲学的方法不是构建新理论,而是'把语词从形而上学的使用带回到日常的使用'。",
      origin: "路德维希·维特根斯坦(Ludwig Wittgenstein, 1889-1951)在《哲学研究》(Philosophische Untersuchungen, 1953, 遗著)中提出语言游戏概念。这是他彻底否定自己早期名著《逻辑哲学论》的结果——这是哲学史上最引人注目的自我颠覆之一。剑桥大学在1940年代授予他教授席位,他却在课堂上说:'你可以走了,我不知道——我这人不可救药。'",
      influence: "语言游戏概念影响了奥斯汀的言语行为理论、赖尔的日常语言哲学、库恩的'范式'理论(科学共同体作为一种语言游戏),以及人类学的'深描'方法(格尔茨:文化是一种语言游戏)。在AI研究中,'语言游戏'也启发了分布式语义和语境相关的意义理论。",
      misconception: "不是'说什么都可以'——每个语言游戏确实有自己的规则,但规则是公共的、可教可学的。你不能自己发明一个'私人游戏'然后说它有规则——维特根斯坦的'私人语言论证'恰恰证明:完全私人的规则是不可能的,因为'以为遵守了规则'和'真的遵守了规则'在私人情况下无法区分。",
      designNote: "三向散射+攻速——不是威力,是'玩的次数'。每一次攻击都在玩一种不同的'游戏',敌人永远猜不到下一发的规则。",
    }),
    flavorText: "'攻击'这个词是什么意思？在你挥剑的语境里,它意味着掉血——仅此而已。追问'攻击的本质'是哲学病。",
    dropWeight: 2,
  },

  // 42. 中文房间之锤
  {
    templateId: "chinese_room_hammer",
    name: "中文房间之锤",
    rarity: "legendary",
    slot: "weapon",
    attackType: "trilemma",
    stageRange: [50, 400],
    baseStats: { atk: 48 },
    effects: [],
    concept: findConcept_provide('chinese_room_hammer', {
      id: "chinese_room", term: "中文房间论证", termEn: "Chinese Room Argument",
      school: "心灵哲学 / 塞尔", field: "哲学",
      summary: "约翰·塞尔在1980年提出了一个著名的思想实验来反驳'强人工智能'主张。想象一个不懂中文的人被关在一个房间里,手边有一本规则手册(用英文写)。外面有人从门缝塞进中文纸条,这个人按照规则手册的指示——根据符号的形状,找到对应的中文符号,写出放回门缝外。外面的人看到流利的中文回复,以为房间里的人懂中文。但这个人在进行的是'语法操作'(syntax),而不是'语义理解'(semantics)。塞尔的论证是:计算机和这个人一模一样——它处理符号,但不理解符号的意义。因此,不管计算机多复杂,运行正确的程序不等于拥有理解——它只是'模拟理解',而不是'真的理解'。",
      origin: "约翰·塞尔(John Searle, 1932年出生)在1980年的论文《心灵、大脑与程序》(Minds, Brains, and Programs)中提出中文房间论证。此后四十年,这一论证引发了心灵哲学和AI领域最激烈的争论之一——所谓的'意识房间辩论'持续至今。",
      influence: "中文房间论证催生了大量反驳(系统回应:整个房间系统理解中文;机器人回应:需要身体和感知;他心回应:你怎么知道别人理解？)。它深刻影响了AI哲学中的'弱AI vs 强AI'讨论,并且在神经科学中关于意识是否需要生物基础的研究中被反复引用。",
      misconception: "不是'AI永远不可能有意识'——塞尔的论断更精确:运行一个程序不等于有理解,不管程序多复杂。但塞尔并不否认生物大脑可以产生意识——他否认的是计算本身足以产生理解。",
      designNote: "三向散射锤——敌人以为它在防御一个有'意图'的攻击者,但你只是在执行规则。意图是敌人自己'投射'的。",
    }),
    flavorText: "你并不'想'杀它——你只是在执行一系列攻击规则。是敌人在被杀的过程中'理解'出了意图。",
    dropWeight: 2,
  },

  // 43. 忒修斯之镰
  {
    templateId: "theseus_sickle",
    name: "忒修斯之镰",
    rarity: "legendary",
    slot: "weapon",
    attackType: "trilemma",
    stageRange: [45, 350],
    baseStats: { atk: 42, crit: 0.08 },
    effects: [],
    concept: findConcept_provide('theseus_sickle', {
      id: "theseus_ship", term: "忒修斯之船", termEn: "Ship of Theseus",
      school: "形而上学 / 同一性悖论", field: "哲学",
      summary: "普鲁塔克记载了一个著名的思想实验:雅典人保存了英雄忒修斯的船,在几百年间逐渐替换了每一块腐烂的木板。当所有原来的木板都被换掉了,它还是同一艘船吗？如果真的还是一艘船,那如果把所有换下来的旧木板重新拼成一艘船——现在哪一艘才是'忒修斯之船'？这一悖论逼迫我们追问'同一性'(identity)究竟由什么构成:是物质连续性？是形式恒常？是功能不变？是社会共识——'我们都管它叫忒修斯之船'——所以它就是？每一种回答都会遇到反例。你在读这句话时,你体内的细胞已经在持续替换——七年前的你和现在的你几乎没有相同的原子——那么你'还是'同一个人吗？",
      origin: "忒修斯之船的典故最早可追溯到普鲁塔克(Plutarch, 约公元46-120年)的《忒修斯传》——但普鲁塔克只是提了一句,真正将其发展为经典的同一性悖论的是17-18世纪的哲学家们,尤其是托马斯·霍布斯和约翰·洛克。霍布斯将它和个体的持续自我认同联系起来——这是'忒修斯之船'首次进入个人同一性的讨论。",
      influence: "忒修斯之船在当代关于'个人同一性'的哲学讨论中(帕菲特《理与人》)以及在关于公司法人同一性(公司被收购后还是同一家公司吗？)、AI伦理(如果我的意识被上传到计算机,'我'还在吗？)的辩论中持续出现。",
      misconception: "不是'哲学家又在意淫无聊问题'——忒修斯之船涉及的同一性问题是极其实际的:在法律上,什么时候一个公司'还是'同一个公司？在医学上,脑移植后的'我'还是'我'吗？在伦理上,修改了多少基因之后人类还'是'人类？",
      designNote: "三向散射+暴击——三枚弹幕是同一把镰发射的吗？如果发射器和弹幕都是'流动的',那'同一把镰'这个概念还成立吗？",
    }),
    flavorText: "每一发弹幕都在问同一个问题:我替换了上一发,但我还是'同一把镰刀的攻击'吗？",
    dropWeight: 2,
  },

  // 44. 罗素悖论之锤
  {
    templateId: "russell_paradox_hammer",
    name: "罗素悖论之锤",
    rarity: "legendary",
    slot: "weapon",
    attackType: "trilemma",
    stageRange: [55, 450],
    baseStats: { atk: 46, critDmg: 0.5 },
    effects: [],
    concept: findConcept_provide('russell_paradox_hammer', {
      id: "russell_paradox", term: "罗素悖论", termEn: "Russell's Paradox",
      school: "数理逻辑 / 罗素", field: "数学",
      summary: "1901年,年轻的伯特兰·罗素在阅读弗雷格的《算术基本法则》时发现了一个致命的悖论。考虑'所有不包含自身的集合的集合'——设这个集合为R。现在问:R包含自身吗？如果R包含自身,那么根据R的定义,R不应该包含自身;如果R不包含自身,那么根据R的定义,R应该包含自身。这个悖论摧毁了弗雷格试图将算术建立在集合论基础上的毕生事业(弗雷格在收到罗素的信后,在自己即将出版的著作末尾加上:'一个科学家最不愿见到的——他的著作的根基在即将出版时动摇了')。罗素悖论触发了数学基础的第三次危机。",
      origin: "伯特兰·罗素(Bertrand Russell, 1872-1970)在1901年发现这个悖论,1902年写信告诉弗雷格,1903年在《数学原则》中公开发表。他后来提出了类型论作为解决方案——禁止集合包含自身(从而避免了悖论)。罗素和怀特海的《数学原理》(1910-1913)用类型论重建了数学家基础。",
      influence: "罗素悖论催生了ZFC公理集合论(策梅洛-弗兰克尔)、哥德尔不完备定理(哥德尔证明:没有形式系统能同时一致且完备——这是对罗素计划的数学回绝)、图灵的停机问题,以及整个20世纪数学基础的大讨论。",
      misconception: "不是'数学有漏洞所以不可靠'——悖论被发现后数学没有被摧毁,而是被重建在更稳固的基础上。悖论不是灾难,是数学进步的催化剂。",
      designNote: "三向散射锤+暴击伤害——攻击的逻辑本身就是悖论:你打它,它就该受伤;但'受伤'这个集合包不包含'攻击'本身？",
    }),
    flavorText: "你定义的'攻击'是否包含'定义攻击的你自己'？如果不包含,那你的攻击伤害了一个不包含你的集合——这在数学上不合规。",
    dropWeight: 1,
  },

  // 45. 哥德尔之钥
  {
    templateId: "godel_key",
    name: "哥德尔之钥",
    rarity: "legendary",
    slot: "weapon",
    attackType: "thought",
    stageRange: [60, 500],
    baseStats: { atk: 50, crit: 0.1 },
    effects: [],
    concept: findConcept_provide('godel_key', {
      id: "godel_incompleteness", term: "哥德尔不完备定理", termEn: "Gödel's Incompleteness Theorems",
      school: "数理逻辑 / 哥德尔", field: "数学",
      summary: "1931年,年仅25岁的库尔特·哥德尔发表了一篇论文,彻底改变了数学和逻辑的基础。他证明了两条定理。第一不完备定理:任何一致且足够强(能表达基本算术)的形式系统中,都存在一个命题,它在该系统中既不能被证明也不能被否证——这个命题是真的,但它的'真'不能在系统内部得到证明。哥德尔构造了这样一个命题:'此命题不可证'——如果它可证,那它说自己不可证就是假的,系统证明了假命题(不一致);如果它不可证,那它说的就是真的,但系统不能证明它(不完备)。第二不完备定理:任何一致的系统无法在自身内部证明自身的一致性。希尔伯特的梦想——用形式系统给数学提供绝对确定的基础——被哥德尔证明为不可能。",
      origin: "库尔特·哥德尔(Kurt Gödel, 1906-1978)在1931年的论文《论<数学原理>及其相关系统的形式不可判定命题》(Über formal unentscheidbare Sätze)中发表了他的不完备定理。这篇论文最初是他的博士论文,答辩时评审们几乎没有提问——因为没有人敢说完全看懂了。",
      influence: "不完备定理的影响远远超出了数学基础:图灵用其导出了停机问题的不可判定性;在人工智能领域,彭罗斯在《皇帝新脑》中用它论证人类心智超越任何形式系统;在哲学上,它引发了关于'理性是否有其不可逾越的边界'的长久讨论。",
      misconception: "不是'一切知识都是不可靠的'——哥德尔定理精确地适用于特定类型的形式系统:足够强、一致、可递归公理化。日常推理、经验科学、大部分实用数学都不受不完备定理的直接影响。它是关于形式化的'极限',不是关于'一切'知识的极限。",
      designNote: "穿透弹+暴击——'不完备'不是弱点,是数学定理。无论防御多严密,总有一枚能穿过——因为任何系统都有'不可证的角落'。",
    }),
    flavorText: "敌人可以建立最完美的防御系统——哥德尔证明了:完美防御本身会制造出它挡不住的漏洞。",
    dropWeight: 1,
  },

  // ═══════════════════════════════════════════════════════════════
  // v7.0 武器扩容：35 → 50 把 —— 补充存在主义、实用主义、科学哲学、东方哲学
  // ═══════════════════════════════════════════════════════════════

  // 46. 存在先于本质之剑
  {
    templateId: "existence_precedes_essence_sword",
    name: "存在先于本质之剑",
    rarity: "rare",
    slot: "weapon",
    attackType: "symbolic_slash",
    stageRange: [10, 30],
    baseStats: { atk: 18, crit: 0.05 },
    effects: [],
    concept: findConcept_provide('existence_precedes_essence_sword', {
      id: "existence_precedes_essence", term: "存在先于本质", termEn: "Existence Precedes Essence",
      school: "存在主义 / 萨特", field: "哲学",
      summary: "萨特在《存在主义是一种人道主义》中提出了存在主义的第一原理：存在先于本质。对于一张桌子，工匠先有桌子的概念(本质)，然后制造出桌子(存在)——本质先于存在。但人不同：人首先'被抛'到世上、活着、选择、行动(存在)，然后通过这些选择和行动定义了自己是谁(本质)。没有预先给定的'人性'，没有上帝的设计蓝图——你是什么人，只取决于你做了什么。这个命题把自由推到了绝对化的位置：人是绝对自由的，也因此承担绝对的责任。",
      origin: "让-保罗·萨特(Jean-Paul Sartre, 1905-1980)在1945年的演讲《存在主义是一种人道主义》(L'existentialisme est un humanisme)中明确提出这一命题，作为对存在主义遭受的批评(虚无主义、悲观主义)的辩护。更早的表述出现在《存在与虚无》(1943)中。",
      influence: "这一命题深刻影响了战后欧洲的自由主义思潮、女权运动(波伏娃《第二性》)、反殖民运动(法农)和精神分析(存在主义心理治疗)，并成为整个存在主义哲学的标语式口号。",
      misconception: "不是'想怎样就怎样'——萨特强调，选择自己是'人'的同时也为全人类选择了'人应该是怎样的'，所以自由伴随着沉重的责任，不是轻浮的任性。",
      designNote: "符号斩+暴击——每一击都是选择，没有预先写好的命中率。暴击代表那些定义了你'是谁'的关键选择。",
    }),
    flavorText: "挥出这一剑之前，你还不是剑士。挥出之后，你是。",
    dropWeight: 20,
  },

  // 47. 自欺之镜
  {
    templateId: "bad_faith_mirror",
    name: "自欺之镜",
    rarity: "rare",
    slot: "weapon",
    attackType: "trilemma",
    stageRange: [10, 30],
    baseStats: { atk: 12, def: 3 },
    effects: [],
    concept: findConcept_provide('bad_faith_mirror', {
      id: "bad_faith", term: "自欺(Mauvaise Foi)", termEn: "Bad Faith",
      school: "存在主义 / 萨特", field: "哲学",
      summary: "萨特在《存在与虚无》中分析了'自欺'(mauvaise foi)：对自己撒谎，但不同于普通的谎言——'说谎者完全知道他在隐瞒的事实'是骗别人，而自欺是把真相藏得连自己都看不见。萨特的经典例子是咖啡馆侍者：他的动作过于精确、过于'像'一个侍者，仿佛在表演——他在用'我只是在做我的工作'来逃避'我其实可以不做侍者，我可以成为任何人的自由'。自欺的核心机制是混淆'事实性'(我不能改变身高)和'超越性'(我可以选择如何看待和行动)，用一个来逃避另一个。",
      origin: "让-保罗·萨特在《存在与虚无》(L'Être et le Néant, 1943)第一卷第二章专门分析了自欺，包括咖啡馆侍者、调情中的女人等经典例子。",
      influence: "自欺概念影响了欧文·戈夫曼的社会学戏剧理论(日常生活中的自我呈现)、RD·莱恩的存在主义精神分析，以及当代关于'真实性'(authenticity)的讨论。",
      misconception: "不是'所有社会角色都是自欺'——萨特区分了'扮演角色'(做侍者是谋生)和'自欺'(用'我是侍者'来逃避'我能不做侍者'的自由和焦虑)。问题不是扮演，是用扮演来否定自己的自由。",
      designNote: "三向散射+防御——'自欺'是一种分裂：你同时知道又不知道，所以攻击是分散的；但防御来自'躲在自己构建的角色背后'的安全感。",
    }),
    flavorText: "这面镜子照出的不是你的脸，是你告诉自己'这不怪我'时的那张脸。",
    dropWeight: 18,
  },

  // 48. 中庸之刃
  {
    templateId: "golden_mean_blade",
    name: "中庸之刃",
    rarity: "rare",
    slot: "weapon",
    attackType: "symbolic_slash",
    stageRange: [5, 25],
    baseStats: { atk: 15, hp: 10 },
    effects: [],
    concept: findConcept_provide('golden_mean_blade', {
      id: "golden_mean", term: "中庸之道(Golden Mean)", termEn: "Golden Mean / Mesotes",
      school: "伦理学 / 亚里士多德", field: "哲学",
      summary: "亚里士多德在《尼各马可伦理学》中提出：美德是两种恶之间的中道(mesotēs)。勇敢是怯懦(过少)和鲁莽(过多)之间的中点；慷慨是吝啬和挥霍之间的中点。但这个中点不是算术平均——对一个人来说'勇敢'的行为，对另一个人可能是鲁莽。亚里士多德说这就像射箭：射中靶心是一种实践智慧(phronesis)，不能简化为公式。美德是一种'习性'(hexis)，需要通过反复练习来培养——你通过做勇敢的事成为勇敢的人，而不是反过来。",
      origin: "亚里士多德(Aristotle, 384-322 BCE)在《尼各马可伦理学》(Ethica Nicomachea)第二卷中系统阐述了中道学说。",
      influence: "中道学说影响了中世纪托马斯·阿奎那的德性伦理学、儒家的中庸思想(独立发展但结构惊人相似)，以及当代德性伦理学的复兴(安斯康姆、麦金泰尔)。",
      misconception: "不是'凡事取中间值就是美德'——亚里士多德的中道不是平庸。有些行为没有中道，比如谋杀和通奸，本身就是错的，不存在'杀得恰到好处'。中道只适用于那些有程度差异的德性领域。",
      designNote: "攻击+生命——中庸之道带来的坚韧：不过度追求攻击(如鲁莽)，也非防御过度(如怯懦)，而是适中的战斗力+生存力。",
    }),
    flavorText: "在最激进和最保守之间，有一条谁都不走的锋刃——那就是美德所在。",
    dropWeight: 22,
  },

  // 49. 实用主义之锤
  {
    templateId: "pragmatism_hammer",
    name: "实用主义之锤",
    rarity: "rare",
    slot: "weapon",
    attackType: "symbolic_slash",
    stageRange: [10, 30],
    baseStats: { atk: 17, aspd: 0.03 },
    effects: [],
    concept: findConcept_provide('pragmatism_hammer', {
      id: "pragmatism", term: "实用主义真理观", termEn: "Pragmatic Theory of Truth",
      school: "实用主义 / 威廉·詹姆斯", field: "哲学",
      summary: "威廉·詹姆斯在《实用主义》中提出了一个挑衅性的命题：一个观念是否为真，取决于它的'实际后果'——如果它有用、有'兑现价值'(cash value)，那它就是真的。这不是'有用的就是真的所以骗子也是真理'的庸俗解读。詹姆斯的意思是：当两个理论在所有可观察的方面都做出相同预测时，它们之间的选择就没有事实依据——此时你只能问'相信哪个会让你的生活更好？'。实用主义把真理从'与事实的静态对应'变成了'在经验中的动态验证过程'：真理不是被发现的东西，而是'发生在观念身上'的事情。",
      origin: "威廉·詹姆斯(William James, 1842-1910)在《实用主义：一些旧思想方法的新名称》(Pragmatism: A New Name for Some Old Ways of Thinking, 1907)中系统论述。皮尔士更早提出实用主义原则(1878)，但詹姆斯的版本更具影响力。",
      influence: "实用主义深刻影响了杜威的教育哲学、罗蒂的后现代主义、法律现实主义(霍姆斯：法律的生命不是逻辑而是经验)，以及当代科学哲学中的工具主义。",
      misconception: "不是'只要有用就是真理'——詹姆斯严格限定了'有用'的条件：它必须在长期的、广泛的经验范围内被验证，不能与已有的事实冲突。一个'有用的谎言'如果最终在实践中穿帮，就不是真的。",
      designNote: "攻击+攻速——实用主义是'行动导向'的哲学：不是等完美答案才出手，而是在出手过程中积累经验。速度代表了那种'边做边学'的节奏。",
    }),
    flavorText: "这把锤不判断真伪，只管砸下去——砸完之后，你自然就知道了。",
    dropWeight: 20,
  },

  // 50. 证伪之刃
  {
    templateId: "falsification_blade",
    name: "证伪之刃",
    rarity: "rare",
    slot: "weapon",
    attackType: "trilemma",
    stageRange: [10, 30],
    baseStats: { atk: 16, crit: 0.04 },
    effects: [],
    concept: findConcept_provide('falsification_blade', {
      id: "falsificationism", term: "证伪主义(Falsificationism)", termEn: "Falsificationism",
      school: "科学哲学 / 波普尔", field: "哲学",
      summary: "卡尔·波普尔在《科学发现的逻辑》中提出了一个彻底改写科学哲学的问题：科学与伪科学的界线在哪里？前人的答案(归纳法、可验证性)都有漏洞——比如弗洛伊德的精神分析和马克思主义的历史理论，它们能解释一切现象，反而成了问题：一个能解释一切的理论，什么也没解释。波普尔的答案是'可证伪性'(falsifiability)：一个理论是科学的，当且仅当它做出了可以被检验、可能被证明为错的预测。爱因斯坦的广义相对论预测了光线在引力场中的偏折——如果1919年日食观测没发现偏折，理论就被否证了。幸运的是它通过了检验。而弗洛伊德的理论没有做出任何可以被证伪的预测。科学的标志不是'可被证明为真'，而是'愿意冒被证明为假的风险'。",
      origin: "卡尔·波普尔(Karl Popper, 1902-1994)在《科学发现的逻辑》(Logik der Forschung, 1934; 英译本1959)中提出证伪主义。他年轻时在维也纳目睹了爱因斯坦、弗洛伊德和阿德勒的演讲——爱因斯坦说'如果观测不符，我的理论就错了'，这句话启发了他的证伪标准。",
      influence: "证伪主义深刻影响了托马斯·库恩(以范式论批评它)、拉卡托斯(精致证伪主义)、费耶阿本德(反对它)以及科学实践中的方法论——'设计一个能证伪你的假设的实验'成为现代科学的基本规范。",
      misconception: "不是'不可证伪的东西都是无意义的'——波普尔用证伪性作为'科学与非科学的分界标准'，不是'有意义与无意义的标准'。形而上学、伦理学、美学即使不可证伪，仍然可以有深刻的意义。科学不是唯一有意义的语言。",
      designNote: "三向散射+暴击——证伪不是'一刀致命'，而是'一个关键的反例就能让整个理论体系动摇'。暴击代表那个关键的否证时刻。",
    }),
    flavorText: "这把刀在攻击前就告诉敌人：告诉我，在什么情况下，这一击会落空。",
    dropWeight: 18,
  },

  // 51. 无为之钥
  {
    templateId: "wu_wei_key",
    name: "无为之钥",
    rarity: "rare",
    slot: "weapon",
    attackType: "thought",
    stageRange: [10, 30],
    baseStats: { atk: 10, hp: 15 },
    effects: [],
    concept: findConcept_provide('wu_wei_key', {
      id: "wu_wei", term: "无为(Wu Wei)", termEn: "Non-action / Effortless Action",
      school: "道家 / 老子", field: "哲学",
      summary: "老子在《道德经》中反复提到'无为'，但这不是'什么都不做'的消极态度。'无为'的本意是'不妄为'——不违背事物的自然本性去强行干预。老子用'治大国若烹小鲜'做比喻：煎小鱼不能频繁翻动，否则鱼就碎了。同样，治理国家(或处理任何复杂系统)时，过多的干预往往比不干预造成更多伤害。'无为'是一种对'自然'(ziran，万物自身的运行法则)的深刻信任：事物有自己的节奏和逻辑，有时最好的行动就是不去干扰那个节奏。'为无为，则无不治'——当你以'无为'的方式去'为'，就没有什么治理不好的。",
      origin: "老子(约公元前6-前5世纪)在《道德经》(约前4世纪成书)中多次阐述'无为'，典型章节包括第2、3、37、48、57、63、64章。",
      influence: "无为思想深刻影响了中国政治哲学(黄老之学、开明君主论)、禅宗、中医、太极拳、日本茶道和花道，以及现代管理学中的'最小干预原则'和系统思维。",
      misconception: "不是'躺平什么都不干'——无为的核心是'为无为'(do non-doing)，这是一种积极的顺应，需要高度的觉察和判断力来分辨什么时候该'为'、什么时候该'不为'。'无为'比'有为'更需要智慧。",
      designNote: "穿透弹+生命——'无为'不是在正面硬抗，而是'以柔克刚'：穿透力来自不正面冲突(思想攻击)，高生命值来自不消耗于无效对抗的'保全'。",
    }),
    flavorText: "最锋利的钥匙不是金属的，是知道哪扇门不需要打开。",
    dropWeight: 18,
  },

  // 52. 第二性之鞭
  {
    templateId: "second_sex_whip",
    name: "第二性之鞭",
    rarity: "rare",
    slot: "weapon",
    attackType: "trilemma",
    stageRange: [10, 30],
    baseStats: { atk: 14, crit: 0.06 },
    effects: [],
    concept: findConcept_provide('second_sex_whip', {
      id: "second_sex", term: "第二性", termEn: "The Second Sex",
      school: "女性主义 / 波伏娃", field: "哲学",
      summary: "西蒙娜·德·波伏娃在《第二性》中开篇就提出了一个基础性的哲学问题：什么是女人？生物学的答案是'雌性'，但波伏娃指出'女人'不是一个自然事实，而是一个文化建构。她那句名言——'女人不是天生的，而是后天变成的'(On ne naît pas femme, on le devient)——不是说生理差异不存在，而是说'女性气质'不是一个生物学命运，它是社会、历史和文化长期塑造的结果。在父权社会中，男性被定义为'标准人'，而女性被定义为相对于男性的'他者'(the Other)——'女人是相对于男人而被定义的'。这个结构让女性的经验、视角和存在本身被系统地边缘化了。",
      origin: "西蒙娜·德·波伏娃(Simone de Beauvoir, 1908-1986)在《第二性》(Le Deuxième Sexe, 1949)中运用存在主义哲学框架，结合历史学、生物学、心理学和文学分析，对女性的处境做了系统考察。此书出版后在法国引起巨大争议，被梵蒂冈列入禁书目录。",
      influence: "《第二性》是第二波女性主义运动的奠基文本，影响了贝蒂·弗里丹(《女性的奥秘》)、凯特·米利特(《性别政治》)和朱迪斯·巴特勒(《性别麻烦》中的'性别操演'概念)。",
      misconception: "不是'否认男女之间存在任何生物差异'——波伏娃承认身体和生理差异是存在的，但她论证的是：这些生物学事实本身没有固定的社会意义，是社会和文化赋予了它们特定的含义和等级。",
      designNote: "三向散射+暴击——'第二性'的分析是多方位的(历史、生物、心理)，所以攻击是散射的；暴击来自揭露了那个被忽视的'他者'视角的认知冲击。",
    }),
    flavorText: "这一鞭抽打的不是你，是你体内那个把一半人类定义为'他者'的语法。",
    dropWeight: 18,
  },

  // 53. 文化工业之剑
  {
    templateId: "culture_industry_sword",
    name: "文化工业之剑",
    rarity: "epic",
    slot: "weapon",
    attackType: "symbolic_slash",
    stageRange: [20, 45],
    baseStats: { atk: 28, crit: 0.07 },
    effects: [],
    concept: findConcept_provide('culture_industry_sword', {
      id: "culture_industry", term: "文化工业(Kulturindustrie)", termEn: "Culture Industry",
      school: "批判理论 / 阿多诺 & 霍克海默", field: "哲学",
      summary: "阿多诺和霍克海默在《启蒙辩证法》中提出了'文化工业'概念：在资本主义晚期，文化不再是从大众中自发产生的表达，而是像工厂流水线一样被标准化的商品——电影、音乐、电视节目都在遵循同一种公式，其目的不是表达或启蒙，而是利润最大化和维持现有秩序。文化工业把'风格'变成了一套可预测的模板：好莱坞的'happy ending'、流行音乐的和弦进程、综艺节目的冲突-煽情-和解三幕剧。观众以为自己在'娱乐'，实际上在被塑造——文化工业消解了'独立思考'的能力，因为它让你相信：世界就是它呈现的那个样子，没有别的可能。",
      origin: "西奥多·阿多诺(Theodor Adorno, 1903-1969)和马克斯·霍克海默(Max Horkheimer, 1895-1973)在《启蒙辩证法》(Dialektik der Aufklärung, 1947)中'文化工业：作为大众欺骗的启蒙'一章中阐述了这一概念。阿多诺本人流亡美国期间(1938-1949)亲历了好莱坞和广播系统的运作，这篇文章在很大程度上是对那个经验的反思。",
      influence: "文化工业概念深刻影响了文化研究(伯明翰学派、斯图亚特·霍尔)、媒介理论(麦克卢汉的'媒介即信息'有平行洞见)以及当代关于算法推荐、信息茧房和注意力经济的批判。",
      misconception: "不是'所有大众文化都是坏的'——阿多诺确实对大众文化持严厉批判态度，但他的核心论点不是精英主义的好恶判断，而是对文化生产方式的系统性批判：当文化生产服从于商品逻辑时，它就被'同质化'和'标准化'了，失去了'否定既有现实'的批判潜力。",
      designNote: "符号斩+暴击——文化工业的'同质化暴力'是压倒性的，所以高攻击力；暴击来自认识到'你以为在消费文化，其实是文化在消费你'的启蒙瞬间。",
    }),
    flavorText: "你以为是你在看电影。其实是电影在看你——并且已经看了十年了。",
    dropWeight: 12,
  },

  // 54. 感质之钥
  {
    templateId: "qualia_key",
    name: "感质之钥",
    rarity: "epic",
    slot: "weapon",
    attackType: "thought",
    stageRange: [15, 40],
    baseStats: { atk: 20, mp: 10 },
    effects: [],
    concept: findConcept_provide('qualia_key', {
      id: "qualia", term: "感质(Qualia)", termEn: "Qualia",
      school: "心灵哲学 / 杰克逊 & 查尔默斯", field: "哲学",
      summary: "弗兰克·杰克逊设计了一个著名的思想实验：玛丽是一位顶尖的神经科学家，她知道关于颜色视觉的一切物理知识——光的波长、视网膜的锥体细胞、视觉皮层的处理过程……但她从小生活在一个只有黑白的房间里，从未见过颜色。有一天，玛丽走出了黑白房间，第一次看到了红色。问题是：玛丽学到了新东西吗？直觉上，是的——她知道'红色看起来是什么感觉'了，而这是所有物理知识都无法提供的。这种'第一人称经验的主观感受'就是感质(qualia)：疼痛的'疼感'、红色的'红感'、咖啡的'苦味'——它们似乎无法被还原为物理描述。如果玛丽学到了新东西，那物理主义(认为一切都是物理的)就有麻烦了。",
      origin: "弗兰克·杰克逊(Frank Jackson, 1943-)在文章《副现象感质》(Epiphenomenal Qualia, 1982)中提出了'黑白玛丽'论证。后来杰克逊自己放弃了这个立场，但大卫·查尔默斯(David Chalmers)在《有意识的心灵》(1996)中将其发展为'意识的困难问题'的核心案例。",
      influence: "感质问题影响了大卫·查尔默斯的'意识的困难问题'(hard problem of consciousness)的提出、托马斯·内格尔的'做一只蝙蝠是什么感觉'(1974)，以及当代神经科学和人工智能研究中对'主观经验'的重新重视。",
      misconception: "不是'物理主义已经被驳倒了'——'黑白玛丽'是一个活跃的哲学争论，物理主义者提出了多种回应：能力假说(玛丽只是获得了一种新能力，不是新知识)、现象概念策略(玛丽获得了用现象概念描述旧知识的新方式)等。这个问题远未解决。",
      designNote: "穿透弹+MP——感质是'第一人称的'、不可被第三人称描述取代的，所以用的是穿透弹(不正面冲突)；MP加成代表那种'不可言说的内在经验'的累积。",
    }),
    flavorText: "你能用数学描述红色，但第一次看到红色的那一刻——那些公式不知道自己在说什么。",
    dropWeight: 10,
  },

  // 55. 哲学僵尸之镰
  {
    templateId: "pzombie_sickle",
    name: "哲学僵尸之镰",
    rarity: "epic",
    slot: "weapon",
    attackType: "trilemma",
    stageRange: [20, 45],
    baseStats: { atk: 24, crit: 0.08 },
    effects: [],
    concept: findConcept_provide('pzombie_sickle', {
      id: "pzombie", term: "哲学僵尸(Philosophical Zombie)", termEn: "Philosophical Zombie / P-Zombie",
      school: "心灵哲学 / 查尔默斯", field: "哲学",
      summary: "大卫·查尔默斯在《有意识的心灵》中提出了'哲学僵尸'的思想实验：设想一个在物理层面上和你在每个原子都完全相同的存在——它说话、走路、写诗、讨论哲学、在受伤时退缩和喊叫……但它没有任何内在的主观体验。它内部是'黑暗'的——没有疼痛的感觉、没有红色的视觉体验、没有喜悦的情感，只是一套完美模拟意识行为的物理机制。关键是：如果这样一个存在在物理上是可能的，那意识就不能被还原为物理过程——因为物理上完全相同的东西，一个有意识一个没有，那意识一定是在物理之上'额外'的东西。",
      origin: "大卫·查尔默斯(David Chalmers, 1966-)在《有意识的心灵》(The Conscious Mind, 1996)中将哲学僵尸论证系统化。这个概念的最早版本可以追溯到20世纪70年代的心灵哲学讨论。",
      influence: "哲学僵尸论证是当代心灵哲学中物理主义与反物理主义之争的核心战场。丹尼尔·丹尼特在《意识的解释》中强烈反驳了哲学僵尸的可设想性，认为它依赖于对意识的错误直觉。",
      misconception: "不是'哲学僵尸真的存在或可能存在'——这是一个用于论证的思想实验。物理主义者反驳说，哲学僵尸概念本身就是矛盾的：一个在物理上完全相同的存在不可能没有意识，因为意识就是物理过程的产物。争论的核心是：意识是否可以完全由物理事实'蕴含'(entailed by physical facts)。",
      designNote: "三向散射+暴击——哲学僵尸的攻击是'空洞的'模仿，三重散射代表它同时模拟多个行为但没有一个是真的。高暴击代表'认识到它是僵尸而非人的恐怖瞬间'。",
    }),
    flavorText: "被这把镰刀扫过的东西不会死。它们继续活着——只是不再'活着'了。",
    dropWeight: 10,
  },

  // 56. 平庸之恶之剑
  {
    templateId: "banality_of_evil_sword",
    name: "平庸之恶之剑",
    rarity: "epic",
    slot: "weapon",
    attackType: "symbolic_slash",
    stageRange: [20, 45],
    baseStats: { atk: 26, hp: 8 },
    effects: [],
    concept: findConcept_provide('banality_of_evil_sword', {
      id: "banality_of_evil", term: "平庸之恶(Banality of Evil)", termEn: "Banality of Evil",
      school: "政治哲学 / 汉娜·阿伦特", field: "哲学",
      summary: "1961年，哲学家汉娜·阿伦特作为《纽约客》记者前往耶路撒冷旁听纳粹战犯阿道夫·艾希曼的审判。在审判前，她(和全世界)预期看到的会是一个恶魔般的人物——邪恶、狂热、充满仇恨。但她看到的艾希曼是一个平庸、毫无思想、用官僚套话说话的'普通人'。他的罪行不是出于深刻而坚定的仇恨，而是出于'不思'(thoughtlessness)——他只是在'执行命令'、'做好本职工作'、'遵循规则'。阿伦特由此提出了'平庸之恶'：最可怕的恶不是恶魔式的极端邪恶，而是普通人在官僚体系中放弃了独立思考和道德判断的能力。'平庸'不是指恶本身平庸(纳粹的罪行是极端的)，而是指作恶者的心智状态：他'不想事'。",
      origin: "汉娜·阿伦特(Hannah Arendt, 1906-1975)在《艾希曼在耶路撒冷：一份关于平庸之恶的报告》(Eichmann in Jerusalem: A Report on the Banality of Evil, 1963)中提出了这一概念。这本书引发了巨大的争议，特别是阿伦特在其中批评了部分犹太领袖的配合行为。",
      influence: "平庸之恶概念影响了米尔格拉姆的服从实验、津巴多的斯坦福监狱实验、后大屠杀伦理反思、官僚伦理和组织行为学中对'顺从文化'的批判。",
      misconception: "不是'艾希曼只是一个无辜的官僚,不应该被追责'——阿伦特明确同意艾希曼应该被处死。'平庸之恶'不是在减轻艾希曼的罪责，而是在指出一种更可怕的恶的类型：它不需要恶魔般的意图，只需要一个人停止独立思考。",
      designNote: "符号斩+生命——'平庸之恶'的杀伤力来自它的系统性(高攻击)，而附加生命值是因为认识到这种恶的人获得了一种道德警觉性。",
    }),
    flavorText: "最锋利的恶不是咬牙切齿的恨，是一个人对着自己的良心说'这只是我的工作'。",
    dropWeight: 10,
  },

  // 57. 范式转换之锤
  {
    templateId: "paradigm_shift_hammer",
    name: "范式转换之锤",
    rarity: "epic",
    slot: "weapon",
    attackType: "symbolic_slash",
    stageRange: [20, 45],
    baseStats: { atk: 27, aspd: 0.05 },
    effects: [],
    concept: findConcept_provide('paradigm_shift_hammer', {
      id: "paradigm_shift", term: "范式转换(Paradigm Shift)", termEn: "Paradigm Shift",
      school: "科学哲学 / 托马斯·库恩", field: "哲学",
      summary: "托马斯·库恩在《科学革命的结构》中提出了一个颠覆性的科学史观：科学发展不是一条平稳累积的直线，而是'常规科学'(在一个范式——如牛顿力学——之下解谜)和'科学革命'(旧范式被新范式——如相对论——取代)的交替。一个范式不只是理论，而是一整套世界观看法的'成套装备'：包括哪些问题是重要的、用什么方法来研究、甚至什么是'好的科学'。当旧范式积累的'异常'(无法解释的现象)越来越多，最终会触发一场危机，新范式取而代之。关键的是：范式之间的转换不是纯粹理性的——它像一场改宗(conversion)，拥护旧范式的科学家往往到死都不接受新的。",
      origin: "托马斯·库恩(Thomas Kuhn, 1922-1996)在《科学革命的结构》(The Structure of Scientific Revolutions, 1962)中提出范式转换理论。他是物理学博士出身，后来转向科学史和科学哲学，这本书最初是作为《国际统一科学百科全书》的一卷出版的。",
      influence: "范式概念远远超出了科学哲学领域，被借用到社会学、管理学、教育学、文学批评等几乎所有学科中。'范式'成了日常语言的一部分。在科学哲学内部，库恩的工作引发了与波普尔之间的著名辩论(1965年伦敦会议)。",
      misconception: "不是'科学完全是主观的、不比巫术更客观'——库恩后来澄清：他不是相对主义者。范式转换确实有非理性因素，但新旧范式之间仍然可以理性比较(新范式通常能解决旧范式无法解决的问题)。库恩反对的是'累积进步'的神话，不是科学的理性。",
      designNote: "符号斩+攻速——范式转换不是一点一点的'改进'，而是一次性的、颠覆性的突破(高攻击)；攻速代表新范式打开了全新的效率空间。",
    }),
    flavorText: "旧锤子在旧世界里是最锋利的——直到这一锤证明旧世界不存在。",
    dropWeight: 10,
  },

  // 58. 道之剑
  {
    templateId: "dao_sword",
    name: "道之剑",
    rarity: "epic",
    slot: "weapon",
    attackType: "symbolic_slash",
    stageRange: [15, 40],
    baseStats: { atk: 25, crit: 0.06 },
    effects: [],
    concept: findConcept_provide('dao_sword', {
      id: "dao", term: "道(Dao/Tao)", termEn: "The Way / Dao",
      school: "道家 / 老子", field: "哲学",
      summary: "《道德经》开篇即说：'道可道，非常道。'——可以被语言表述的'道'，不是那恒常的、真的'道'。这句话本身就是一种哲学宣言：最根本的东西是不可被语言穷尽的。'道'在老子的使用中有多重含义：它是宇宙的本源和运行法则('道生一，一生二，二生三，三生万物')；它是对立面的统一('有无相生，难易相成')；它是一种行动方式('上善若水，水善利万物而不争')。'道'不是一个你可以站在外面观察的对象，而是你必须投入其中的'流'——理解'道'不是通过分析，而是通过'顺其自然'地活在其中。",
      origin: "老子(约公元前6-前5世纪)在《道德经》(或称《老子》)中阐述'道'的概念。关于老子是否真实存在以及《道德经》的成书年代，学界有长期争论——可能是一个学派在战国时期(前475-前221)多次编订的成果。",
      influence: "道的概念是中国哲学最核心的范畴之一，影响了儒家(孔子问礼于老子)、法家(韩非有《解老》《喻老》)、兵家、中医理论、中国艺术美学，以及海德格尔晚年对老子的兴趣——海德格尔甚至尝试与萧师毅合作翻译《道德经》。",
      misconception: "不是'道就是西方意义上的上帝或造物主'——道的一个核心特征是其'无为'：它不'命令'、不'计划'、不'干预'，而是一种自然而然的生成和运行方式。'道法自然'——道的法则就是它自己本然的样子。",
      designNote: "符号斩+暴击——'道'的剑法看似简单(单体斩)，但它的力量来源于'顺势而为'的洞察(暴击)，不是蛮力。",
    }),
    flavorText: "这把剑没有招式。它只是恰好每次都落在该落的位置上。",
    dropWeight: 12,
  },

  // 59. 缘起之镰
  {
    templateId: "pratityasamutpada_sickle",
    name: "缘起之镰",
    rarity: "legendary",
    slot: "weapon",
    attackType: "trilemma",
    stageRange: [30, 50],
    baseStats: { atk: 38, crit: 0.08, aspd: 0.05 },
    effects: [],
    concept: findConcept_provide('pratityasamutpada_sickle', {
      id: "pratityasamutpada", term: "缘起(Pratītyasamutpāda)", termEn: "Dependent Origination",
      school: "佛教哲学 / 释迦牟尼", field: "哲学",
      summary: "缘起是佛教最核心的哲学命题：一切事物都不是孤立存在的，而是依赖于无数条件(因缘)的聚合而产生和消亡的。'此有故彼有，此生故彼生；此无故彼无，此灭故彼灭。'——这朵花的存在依赖于阳光、雨水、土壤、种子、园丁的照料……没有一样东西是'自性'的(拥有独立的、不变的本质)。缘起链在佛教中有十二支(无明→行→识→名色→六入→触→受→爱→取→有→生→老死)，描述了'苦'如何从'无明'(对缘起的无知)中产生。理解缘起就是理解'一切都不是你紧握不放的东西'——不是虚无主义的否定，而是让你从执着中解脱出来的洞见。",
      origin: "释迦牟尼(约公元前5世纪)在菩提树下悟道时证悟的核心内容就是缘起。缘起法贯穿整个佛教经典，尤其是在《阿含经》和《中论》(龙树著)中得到了系统的哲学阐述。龙树用缘起来论证'空'(śūnyatā)——因为一切事物都是缘起的，所以没有独立自性，即'空'。",
      influence: "缘起论影响了龙树的中观学派、瑜伽行派的唯识学、华严宗的法界缘起说(事事无碍)，以及当代的'过程哲学'(怀特海)、系统论、量子纠缠的哲学解释和生态伦理学中的'万物相互依存'思想。",
      misconception: "不是'命运注定或前定论'——缘起说的是条件的相互依存，不是说一切都被预先注定。每一个当下都是新的因缘聚合，每一个当下都是改变的机会。'因'不是机械的推动力，而是一个条件在一个动态网络中的相互塑造。",
      designNote: "三向散射+暴击+攻速——没有一个东西是单一原因的(散射)，在条件聚合的瞬间暴击(缘聚)，而理解缘起让你行动得更流畅(攻速)因为不再与'不可改变的实体'对抗。",
    }),
    flavorText: "这一镰切开的不是血肉，是'这个东西只是这个东西'的错觉。",
    dropWeight: 4,
  },

  // 60. 还原论之锤
  {
    templateId: "reductionism_hammer",
    name: "还原论之锤",
    rarity: "legendary",
    slot: "weapon",
    attackType: "symbolic_slash",
    stageRange: [30, 50],
    baseStats: { atk: 40, crit: 0.06 },
    effects: [],
    concept: findConcept_provide('reductionism_hammer', {
      id: "reductionism", term: "还原论(Reductionism)", termEn: "Reductionism",
      school: "科学哲学 / 形而上学", field: "哲学",
      summary: "还原论是一种深刻而富有争议的思维策略：要理解一个复杂事物，就把它还原为更简单的组成部分。物理学还原论认为一切现象最终都可以被还原为基本粒子的相互作用——你的爱情、莫扎特的音乐、冬天的第一片雪，在底层都是夸克和电子的舞蹈。在哲学上，这个立场引发了一个危机：如果一切都可以还原为物理，那意识、价值、意义是什么？它们是'真实的'还是只是幻觉？反对者提出了'涌现'(emergence)的概念：当一个系统达到一定的复杂度时，新的属性会'涌现'出来，这些属性不能从组成部分的性质中推导——水是湿的，但单个H₂O分子不是'湿'的。",
      origin: "还原论的思想根源可以追溯到古希腊的原子论(德谟克利特)、笛卡尔的'分析方法'和牛顿的机械论世界观。在20世纪，逻辑经验主义的'统一科学'运动(卡尔纳普、纽拉特)是最雄心勃勃的还原论纲领，试图把所有科学还原为物理学。",
      influence: "还原论在科学方法论上取得了巨大成功——分子生物学、神经科学的进步很大程度上归功于还原论策略。但它也引发了整体论(holism)、系统论、复杂科学和'具身认知'等范式的反驳。安德森的'More is Different'(1972)一文是反还原论的经典宣言。",
      misconception: "不是'还原论一定是错的或对的'——还原论作为一种'研究策略'(方法论还原论)在科学上极其有效，但作为一种'形而上学主张'(本体论还原论——'存在的最底层就是一切')则有待商榷。关键区分是：说'X可以用Y来解释'和说'X不过是Y'。",
      designNote: "高攻击+暴击——还原论的力量在于'拆解一切'的威力(高攻击)，但有时它会错失'涌现'层面的东西——暴击代表那种'把它拆到底部之后发现更多'的意外收获。",
    }),
    flavorText: "锤子在拥抱你之前先拆解你——这就是它的爱。",
    dropWeight: 4,
  },

];

// 辅助:用行内数据构造 concept(避免依赖文件外的搜索)
function findConcept_provide(templateId, data) {
  return { ...data, id: templateId };
}

// 按 slot 查询可用模板
export function getTemplatesBySlot(slot) {
  return ITEM_TEMPLATES.filter(t => t.slot === slot);
}

// 根据 stage 过滤可掉落的模板(只返回 stage 在范围内且 rarity 匹配池)
export function getTemplatesForStage(stage, rarityCap = 'legendary') {
  const capOrder = ['common', 'magic', 'rare', 'epic', 'legendary', 'mythic'];
  const capIdx = capOrder.indexOf(rarityCap);
  return ITEM_TEMPLATES.filter(t => {
    const tIdx = capOrder.indexOf(t.rarity);
    return stage >= t.stageRange[0] && stage <= t.stageRange[1] && tIdx <= capIdx;
  });
}

// 随机选一个模板
export function randomTemplate(stage = 1) {
  const pool = getTemplatesForStage(stage);
  if (pool.length === 0) return ITEM_TEMPLATES[0];
  return pool[Math.floor(Math.random() * pool.length)];
}
