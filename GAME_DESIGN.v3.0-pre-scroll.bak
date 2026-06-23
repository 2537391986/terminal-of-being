# 《存在终端 Terminal of Being》AI 开发主文档 v3.0

> **副标题**:`I idle, therefore I am. / 我挂机,故我在。`
> **目标**:**纯 HTML + CSS + 原生 JS + Canvas(只画战斗动画)+ localStorage**
> **部署**:GitHub Pages 静态托管
> **文档定位**:AI 开发本游戏的唯一真相源(Single Source of Truth)
> **使用方式**:AI 每次开发前必须读完整份文档。所有章节编号为最终版本,不要自己重组。所有"必须 / 必须不"用全大写标注(MUST / MUST NOT)。

---

## 0. 致 AI 的一段话

这份文档不是用来读的,是用来**约束**你的。

它不是"参考",是**契约**。你写的每一行代码、生成的每一件装备、命名的每一个怪物,都必须能从这份文档里找到对应规则。

如果你发现文档自相矛盾——**停下来,在输出里告诉用户,不要自己拍板**。
如果你想做文档禁止的事——**停下来,在输出里告诉用户,不要悄悄做**。
如果你发现某个机制 800 行内做不出来——**停下来,在输出里告诉用户,不要用 hack 绕过**。

用户的偏好是"一次性把规则定清楚,然后让你一口气做完"。所以这份文档**写得长,改得少**。请认真读完,再开始写代码。

---

## 1. 核心定位(1 句话)

```
玩家扮演被抛入终端世界的"主体",在 ASCII 横版世界中自动战斗、
刷概念装备、收集哲学/心理学/社会学/逻辑学/思想实验术语,
不断推进层数、转生变强。
```

### 1.1 体验目标(优先级排序)

```
P0 必达(MVP 必须):
1. 打开网页 5 秒内进入战斗
2. 自动战斗流畅,不掉帧
3. 装备能影响数值,数值差异肉眼可见
4. 击杀有反馈(闪红、伤害数字、掉落日志)
5. 刷新页面进度不丢

P1 重要(MVP 阶段后期补):
6. 装备名让人想点开看概念说明
7. 概念说明真的和装备效果能对上
8. Boss 有阶段变化

P2 锦上添花(本期不做):
9. 离线收益
10. 转生
11. 图鉴
12. 套装
```

---

## 2. 技术栈(固定,不讨论)

### 2.1 必须使用

```
- 纯 HTML + CSS + 原生 JS(ES2020+)
- Canvas 2D 用于战斗动画(只用一小块,其它全 DOM)
- localStorage 用于存档
- 单一 index.html,所有 CSS 一个 style.css
- JS 拆为多文件,使用 <script type="module"> 加载
```

### 2.2 必须不

```
- 任何框架(React/Vue/Svelte/...全部禁止)
- 任何构建工具(不用 Vite/Webpack/Parcel)
- 任何 npm 依赖
- 任何外部 CDN
- TypeScript(本期)
- 任何后端/网络请求
```

### 2.3 文件结构(MUST)

```
terminal-of-being/
├── index.html              # 入口,所有 UI 容器
├── style.css               # 终端风格样式
├── README.md               # 玩家向说明
├── GAME_DESIGN.md          # 本文档
├── js/
│   ├── main.js             # 启动 + 主循环
│   ├── constants.js        # 所有数值常量(单一真相源)
│   ├── data/
│   │   ├── concepts.js     # 概念库(术语+派系+科普)
│   │   ├── items.js        # 装备模板(12 件 MVP)
│   │   ├── enemies.js      # 怪物模板(12 个 MVP)
│   │   ├── bosses.js       # Boss 模板(本期从 enemies 引用)
│   │   ├── skills.js       # 技能模板(本期占位,不实现)
│   │   └── affixes.js      # 词缀池(20+ MVP)
│   ├── core/
│   │   ├── state.js        # 全局 state(单一对象)
│   │   ├── rng.js          # 种子化随机数(可选,本期可用 Math.random)
│   │   └── save.js         # 存档读写 + 版本迁移
│   ├── systems/
│   │   ├── combat.js       # 战斗循环
│   │   ├── loot.js         # 掉落判定
│   │   ├── equipment.js    # 装备穿戴/卸下
│   │   ├── stats.js        # 属性聚合计算
│   │   └── progression.js  # 升级/层数推进
│   └── ui/
│       ├── render.js       # 战斗画面渲染(Canvas)
│       ├── hud.js          # 顶部状态栏
│       ├── inventory.js    # 背包面板
│       └── log.js          # 日志面板
└── assets/                 # 本期为空
```

---

## 3. 命名规则(本文档最重要的一节)

### 3.1 命名原则:MUST

```
1. 装备名 = 具体概念术语,不是"主义"+ 装备部位
2. 同一概念只能对应一个核心装备模板
3. 装备效果必须能映射到概念含义(概念即机制)
4. "主义"只用作 concept.school 字段,绝不作装备名主体
5. 怪物名 = 概念术语 + 类别后缀(虫/幽灵/残偶/协议 等)
6. 命名必须有"画面感"——读出来脑子里能出现图像
```

### 3.2 命名反模式:MUST NOT

```
MUST NOT 出现以下命名:
- 存在主义之剑 / 虚无主义长枪 / 解构主义戒指 / 理性主义头盔
- 任何"[形容词]+[部位名]"且无具体概念的装备
  (例: 暴击之剑、吸血匕首、防御护甲)
- 直接用哲学家名字作装备名(萨特之剑、海德格尔之盾、福柯之眼)
- 用纯数值描述的装备(十倍攻击之锤、三倍暴击戒指)
- 任何以"主义"两字结尾的装备名
```

### 3.3 装备命名 5 套模板(AI 必须任选其一)

```
【模板 A】[概念术语] + [冷兵器]
  适用于: 武器
  兵器词库: 刃 / 锋 / 匕 / 剑 / 枪 / 戟 / 锤 / 杖 / 鞭 / 钩 / 镰 / 锏
  示例:
    - 偶因论之钥       (马勒伯朗士)
    - 物自体之盾       (康德)
    - 强力意志之冠     (尼采)
    - 向死存在之靴     (海德格尔)
    - 意向性指环       (胡塞尔)
    - 绝对命令之律     (康德伦理学)
    - 统觉之眼         (康德,L3 真冷门)

【模板 B】[概念术语] + [身体隐喻部位]
  适用于: 防具 / 饰品
  部位词库: 面具 / 披风 / 长靴 / 手套 / 指环 / 项链 / 护符 / 护手 / 胸甲 / 头盔
  示例:
    - 偶因论之钥   (L1 中等冷门)
    - 意向性指环   (L2 较冷门)
    - 统觉之眼     (L3 真冷门)

【模板 C】[概念术语] + [抽象容器]
  适用于: 特殊装备(终端核心 / 法器)
  容器词库: 终端 / 棱镜 / 透镜 / 矩阵 / 阵列 / 协议 / 索引 / 档案 / 契约
  示例:
    中文房间终端   (心灵哲学)
    巴别图书馆索引 (语言哲学)
    罗素悖论矩阵   (逻辑学)

【模板 D】[概念术语] + [身体+动作复合]
  适用于: 概念词本身已是动作/状态时
  示例:
    凝视护手       (萨特/福柯)
    默读之唇       (语言哲学)
    失神之瞳       (现象学)

【模板 E】[概念术语] + [自然物 / 锁链]
  适用于: 概念本身是抽象关系时
  示例:
    - 此在之靴     (海德格尔 L2)
    - 意志薄弱之环 (亚里士多德 L2)
    - 明希豪森困境之钥 (认识论 L3)
```

### 3.4 怪物命名规则

```
[概念术语] + [类别后缀]

类别后缀词库:
  普通怪: 虫 / 残影 / 漂浮物 / 兽 / 壳 / 幽灵 / 体 / 阴影
  精英怪: 干扰体 / 拟人 / 残偶 / 寄生体 / 执行体
  Boss:   协议 / 母体 / 残骸 / 守门人 / 引擎 / 索引 / 观测者

示例:
  我思故我在    (普通, 笛卡尔)
  帕斯卡赌局    (普通, 帕斯卡)
  哥德尔裂隙    (Boss,  数理逻辑)
```

### 3.5 难度配比(MUST)

```
装备词缀池中:
- 10% 大众词(我思 / 帕斯卡 / 普罗泰戈拉)        → 普通装备
- 45% 中等专业词(意向性 / 生活世界 / 无知之幕)   → 魔法/超验装备
- 30% 冷门术语(物自体 / 此在 / 强力意志)         → 超验/史诗装备
- 15% 真冷门(统觉 / 明希豪森)                    → 传说/神话装备
```

### 3.6 概念即机制(MUST)

```
每件装备的 effects 字段必须能用人话解释:
"这件装备的效果 X 是因为概念 Y 的含义 Z"
不能讲清的装备 = 不允许出现在数据中
```

---

## 4. 核心数据契约(所有系统都按此对接)

### 4.1 Stats(属性)

```js
/**
 * @typedef {Object} Stats
 * @property {number} maxHp          最大生命(存在强度)
 * @property {number} maxMp          最大法力(意志)
 * @property {number} atk            攻击(断言力)
 * @property {number} def            防御(自我边界)
 * @property {number} aspd           攻击速度,次/秒(思维频率)
 * @property {number} crit           暴击率 0~1(洞见率)
 * @property {number} critDmg        暴击倍率(启示倍率)
 * @property {number} dodge          闪避率 0~1(否认机制)
 * @property {number} block          格挡率 0~1(防御机制)
 * @property {number} luck           幸运(偶然性)
 * @property {number} itemFind       装备掉率加成 0~1(现象捕获)
 * @property {number} rarityFind     高品质掉率加成 0~1(超验发现)
 * @property {number} expGain        经验加成 0~1(经验吸收)
 * @property {number} goldGain       金币加成 0~1(资本积聚)
 * @property {number} lifesteal      吸血 0~1(意义回收)
 * @property {number} cooldownRed    冷却缩减 0~1(流程精简)
 */
```

### 4.2 Concept(概念元数据)

```js
/**
 * @typedef {Object} Concept
 * @property {string} id          概念唯一 id,如 "zeigarnik"
 * @property {string} term        术语中文名,如 "我思故我在"
 * @property {string} termEn      术语英文,如 "Zeigarnik Effect"
 * @property {string} school      派系,如 "认知心理学 / Gestalt"
 * @property {string} field       领域大类,如 "心理学"
 * @property {string} summary     一句话科普(50 字内)
 * @property {string} designNote  机制映射说明,为什么这个效果对应这个概念
 */
```

### 4.3 Item(装备)

```js
/**
 * @typedef {Object} Item
 * @property {string} id              运行时生成的唯一 uid
 * @property {string} templateId      模板 id,如 "zeigarnik_ring"
 * @property {string} name            显示名,如 "偶因论之钥"
 * @property {Rarity} rarity          稀有度
 * @property {ItemSlot} slot          部位
 * @property {number} level           装备等级(影响属性缩放)
 * @property {number} enhance         强化等级 0~10
 * @property {[number, number]} stageRange  允许掉落的层数区间
 * @property {Partial<Stats>} baseStats   基础属性
 * @property {Affix[]} affixes        词缀列表
 * @property {Effect[]} effects       特殊效果(本期仅实现 5 种 type)
 * @property {Concept} concept        概念元数据
 * @property {string} flavorText      一句话描述
 * @property {number} dropWeight      掉落权重(数值越大越易掉)
 */
```

### 4.4 Enemy(怪物)

```js
/**
 * @typedef {Object} Enemy
 * @property {string} id
 * @property {string} name
 * @property {string} symbol          ASCII 符号
 * @property {"normal"|"elite"|"boss"} type
 * @property {Concept} concept
 * @property {[number, number]} stageRange  出现层数区间
 * @property {{hp:number, maxHp:number, atk:number, def:number, aspd:number}} stats
 * @property {Effect[]} mechanics     机制列表(本期 Boss 才用)
 * @property {{exp:number, gold:number}} rewards
 * @property {number} dropChance      装备掉率 0~1
 * @property {Rarity[]} dropPool      限定稀有度池(空数组 = 用全局表)
 */
```

### 4.5 Affix(词缀)

```js
/**
 * @typedef {Object} Affix
 * @property {keyof Stats} stat       影响的属性 key
 * @property {number} value           数值,百分比属性用 0.05 表示 5%
 * @property {boolean} isPercent      是否百分比加成
 */
```

### 4.6 Effect(效果,本期只支持以下 7 种 type)

```js
/**
 * Effect 是统一的"机制描述",所有系统按 type 分发。
 * 本期只实现以下 type,后续阶段才会扩展:
 *
 * 1. "stat_flat"        { stat: keyof Stats, value: number }
 *    立即获得固定属性,加入聚合计算
 *
 * 2. "stat_percent"     { stat: keyof Stats, value: number }  // 0.1 = +10%
 *    百分比加成,聚合时乘算
 *
 * 3. "on_kill"          { effect: "drop_bonus"|"aspd_buff"|... }
 *    击杀时触发,effect 是预定义 id
 *
 * 4. "on_low_hp"        { threshold: 0.3, stat, value }
 *    血量低于阈值时属性变化
 *
 * 5. "delayed_damage"   { percent: 0.4, delay: 2000 }
 *    伤害延迟结算,本期简化:造成伤害的 40% 在 2 秒后再次结算
 *
 * 6. "drop_bonus"       { rarityBonus: number, duration: number }
 *    击杀后一段时间提高掉率(配合 on_kill 使用)
 *
 * 7. "enemy_debuff"     { stat: "atk"|"def"|"dodge", value: number, duration: number }
 *    战斗开始时给敌人上减益,持续整场战斗
 *
 * 后续阶段才会实现:
 *   "auto_battle_bonus" / "manual_action_bonus" / "conditional_chain" / ...
 */
```

### 4.7 Rarity(稀有度)

```js
/** @typedef {"common"|"magic"|"rare"|"epic"|"legendary"|"mythic"} Rarity */
```

### 4.8 ItemSlot(部位)

```js
/** @typedef {"weapon"|"head"|"chest"|"gloves"|"boots"|"ring"|"amulet"|"charm"|"core"} ItemSlot */
```

---

## 5. 数值公式(单一真相源,所有公式集中在本节)

### 5.1 玩家初始值

```js
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
```

### 5.2 升级

```
每升 1 级:
  maxHp += 10
  atk   += 2
  def   += 1
  maxMp += 2

升级所需经验:
  expToNext(level) = floor(20 * level^1.45)
```

### 5.3 敌人缩放(stage = 当前层数)

```
普通怪:
  hp    = 30 * stage^1.35
  atk   = 4  * stage^1.18
  def   = 1  + stage^1.05
  aspd  = 0.8
  exp   = 5  * stage^1.15
  gold  = 3  * stage^1.10

精英怪(每 5 层第 5 只):
  hp    = 90 * stage^1.35   (= 普通 × 3)
  atk   = 7.2 * stage^1.18  (= 普通 × 1.8)
  def   = (1 + stage^1.05) * 1.5
  aspd  = 1.0
  exp   = 15 * stage^1.15
  gold  = 9  * stage^1.10
  dropChance = 0.35

Boss(每 10 层):
  hp    = 300 * stage^1.35
  atk   = 10  * stage^1.18
  def   = (1 + stage^1.05) * 2
  aspd  = 0.6
  exp   = 50  * stage^1.15
  gold  = 30  * stage^1.10
  dropChance = 1.0
```

### 5.4 伤害公式

```
基础伤害:
  raw = max(1, attacker.atk - defender.def * 0.5)

暴击判定:
  if random() < attacker.crit:
    raw *= attacker.critDmg
    isCrit = true

闪避判定(在暴击之后):
  if random() < defender.dodge:
    raw = 0
    log("[闪避]")

吸血:
  heal = raw * attacker.lifesteal

最终扣血:
  defender.hp -= raw
  attacker.hp  = min(attacker.maxHp, attacker.hp + heal)
```

### 5.5 攻击速度 → 间隔

```
attackInterval = 1000 / aspd   // 单位:毫秒
```

### 5.6 掉落稀有度权重

```
权重(无幸运时):
  common    : 650
  magic     : 250
  rare      : 80
  epic      : 18
  legendary : 2
  mythic    : 0.2

幸运调整:
  effectiveLuck = luck + rarityFind * 100
  // 越稀有的稀有度,权重乘 (1 + effectiveLuck/300)

roll 实现:
  1. 算出每个稀有度的调整后权重
  2. total = sum
  3. r = random() * total
  4. 累加返回第一个 r < 累加值的稀有度
```

### 5.7 装备掉率

```
普通怪:  8%
精英怪:  35%
Boss:   100%(且保证至少 rare)

最终: effectiveChance = dropChance * (1 + itemFind)
```

### 5.8 死亡与失败

```
玩家死亡:
  stage = max(1, stage - 5)
  player.hp = player.maxHp
  player.mp = player.maxMp
  log("[死亡] 回到第 {stage} 层")
  // 保留所有装备、经验、金币、词缀、概念解锁
```

### 5.9 存档字段

```js
const SAVE_KEY = "terminal_of_being_save_v1";
const SAVE_VERSION = 1;

// 必须保存的结构:
{
  version: SAVE_VERSION,
  player: {
    level, exp, expToNext, gold,
    hp, mp,
    // 加上所有 Stats 字段的当前最终值(不是 base,是 final)
  },
  stage, bestStage,
  inventory: Item[],          // 背包装备
  equipment: {                // 穿戴中装备
    weapon: Item|null,
    head:   Item|null,
    chest:  Item|null,
    gloves: Item|null,
    boots:  Item|null,
    ring:   [Item|null, Item|null],   // 戒指可戴 2 个
    amulet: Item|null,
    charm:  Item|null,
    core:   Item|null,
  },
  unlockedCodex: string[],    // 概念 id 列表,本期可为空数组
  settings: { soundOn: bool, animationOn: bool },
  savedAt: timestamp,
}
```

---

## 6. 装备系统

### 6.1 部位(MUST 9 个)

```
weapon  武器
head    头部
chest   胸甲
gloves  护手
boots   鞋子
ring    戒指(可戴 2 个,装备栏为数组)
amulet  项链
charm   护符
core    终端核心
```

### 6.2 稀有度(本期实现前 5 个,mythic 数据留空)

| key | 显示 | 颜色 | 词缀数 | 机制数 |
|-----|------|------|--------|--------|
| common | 经验的 | #888 | 0 | 0 |
| magic | 概念的 | #4af | 1 | 0 |
| rare | 超验的 | #fc4 | 2 | 0 |
| epic | 存在的 | #c4f | 2 | 1 |
| legendary | 不可言说的 | #f84 | 3 | 2 |
| mythic | 终极命题的 | #f44 | 4 | 3 |

### 6.3 MVP 装备池(本期必须实现这 12 个,exactly,顺序固定,按"小众度"分层 L1/L2/L3)

| # | templateId | 名称 | 部位 | 稀有度 | 概念 | 派系 | 冷门度 | 阶段 |
|---|------------|------|------|--------|------|------|--------|------|
| 1 | occasionalism_key | 偶因论之钥 | weapon | rare | 偶因论 | 哲学(马勒伯朗士) | L1 | [5, 40] |
| 2 | thing_shield | 物自体之盾 | chest | epic | 物自体 | 康德哲学 | L1 | [10, 60] |
| 3 | will_to_power_crown | 强力意志之冠 | head | epic | 强力意志 | 尼采哲学 | L1 | [15, 80] |
| 4 | sein_zum_tode_boots | 向死存在之靴 | boots | epic | 向死存在 | 海德格尔哲学 | L1 | [20, 100] |
| 5 | intentionality_ring | 意向性指环 | ring | epic | 意向性 | 现象学(胡塞尔) | L2 | [10, 80] |
| 6 | lebenswelt_cape | 生活世界披风 | chest | epic | 生活世界 | 现象学(胡塞尔) | L2 | [15, 100] |
| 7 | categorical_law | 绝对命令之律 | amulet | legendary | 绝对命令 | 康德伦理学 | L2 | [30, 200] |
| 8 | dasein_boots | 此在之靴 | boots | rare | 此在 | 海德格尔哲学 | L2 | [8, 50] |
| 9 | veil_of_ignorance | 无知之幕面纱 | charm | epic | 无知之幕 | 罗尔斯政治哲学 | L2 | [25, 150] |
| 10 | akrasia_ring | 意志薄弱之环 | ring | rare | 意志薄弱 | 亚里士多德伦理学 | L2 | [5, 50] |
| 11 | apperception_eye | 统觉之眼 | charm | legendary | 统觉(先验统觉) | 康德哲学 | L3 | [50, 500] |
| 12 | munchhausen_key | 明希豪森困境之钥 | weapon | legendary | 明希豪森三重困境 | 认识论 | L3 | [60, 999] |

> **小众度配比**:L1 × 4 + L2 × 6 + L3 × 2 = 12 件。
> 玩家群体画像:70% 普通玩家看到名字想点开;20% 哲学爱好者会兴奋;10% 哲学专业学生会心一笑。
> 没有任何一件是"烂大街"概念,也**没有任何一件是网络梗**。

### 6.4 装备生成流程

```
1. 根据怪物 type 决定候选模板:
   normal  → 从 stageRange 包含当前 stage 的 common/magic/rare 中随机
   elite   → 从包含当前 stage 的 magic/rare/epic 中随机
   boss    → 从包含当前 stage 的 rare/epic/legendary 中随机

2. 选中模板后:
   - 按 5.6 roll 稀有度(模板的稀有度是"目标稀有度",实际可上调/下调)
   - 按稀有度生成对应数量词缀(从 affixes.js 池中随机抽)
   - 应用模板 baseStats × (1 + level * 0.05) 缩放
   - 应用词缀数值 × (1 + level * 0.03)
   - 加上模板自身的 effects
   - 加上 concept 元数据
   - 生成 uid(时间戳 + Math.random)
   - push 到 inventory,log 掉落
```

### 6.5 装备强度分级(避免 5 层掉传说)

```
所有装备模板 MUST 带 stageRange: [min, max]
roll 装备时若怪物 stage 不在范围内:
  - common 装备: 直接 reroll 直到出范围内的
  - magic 及以上: 不出,本次不掉落(回退到不掉)

具体分级见 6.3 表的 [min, max] 列。
```

---

### 6.6 命名词汇分离(易混名词清单,MUST)

文档里有几组词容易在不同语境被混用,导致玩家困惑。本节明确每个词的**唯一指代**:

```
[游戏资源类]        — 只指代游戏内资源或数值
  符号资本            = 金币(资源名)
  认知经验            = 经验值(资源名)
  概念残渣            = 分解材料(资源名)
  论证碎片            = 强化材料(资源名)
  存在碎片            = 转生货币(资源名)

[游戏属性类]        — 只指代玩家属性字段
  经验吸收            = expGain 属性中文名
  资本积聚            = goldGain 属性中文名
  意义回收            = lifesteal 属性中文名
  流程精简            = cooldownRed 属性中文名
  现象捕获            = itemFind 属性中文名
  超验发现            = rarityFind 属性中文名

[游戏系统类]        — 只指代游戏系统或玩法
  方法论              = 主动技能系统总称(本期占位,不实现)
  重新抛入            = 转生操作
  记忆库              = 背包系统
  概念图鉴            = codex 系统(本期只存数据)

[哲学派系类]        — 只在 concept.school 字段出现
  存在主义 / 荒诞主义 / 解构主义 / 精神分析 / ...
  MUST NOT 出现在装备名 / 怪物名 / 属性中文别名 / 系统名 里

[具体术语类]        — 装备名 / 怪物名的唯一来源
  偶因论 / 物自体 / 强力意志 / 意向性 / 统觉 / ...
  出现在 concept.term / 装备 name / 怪物 name
```

MUST NOT:
- "符号资本"作为派系出现
- "方法论"作为属性名出现
- "主义"作为装备名 / 怪物名出现
- "经验主义"作为属性名出现(虽然它是派系,但容易和"经验值"混淆)

如果未来需要新增易混词,统一加在本节末尾,不要散落在其他章节。
```

---

## 7. 怪物系统

### 7.1 MVP 怪物池(本期实现 10 普通 + 2 精英 + 5 Boss = 17 个,exactly,按"小众度"分层 L1/L2/L3)

| # | id | 名称 | 符号 | type | 概念 | 冷门度 | 出现层数 |
|---|----|------|------|------|------|--------|----------|
| 1 | protag_measure | 人是万物的尺度 | π | normal | 普罗泰戈拉(Protagoras) | L1 | [1, 999] |
| 2 | cogito_ghost | 我思故我在 | © | normal | 笛卡尔我思(Cogito) | L1 | [1, 30] |
| 3 | pascal_wager | 帕斯卡赌局 | P | normal | 帕斯卡赌注(Pascal's Wager) | L1 | [5, 60] |
| 4 | language_game | 语言游戏残响 | W | normal | 维特根斯坦语言游戏 | L2 | [8, 80] |
| 5 | public_sphere | 公共领域回声 | h | normal | 哈贝马斯公共领域 | L2 | [10, 100] |
| 6 | binary_oppose | 二元对立体 | ± | normal | 列维-施特劳斯结构主义 | L2 | [15, 120] |
| 7 | knowledge_arch | 知识考古虫 | K | normal | 福柯知识考古学 | L2 | [20, 150] |
| 8 | culture_industry | 文化工业循环 | a | normal | 阿多诺文化工业 | L2 | [25, 200] |
| 9 | vienna_verify | 证实原则空壳 | V | normal | 维也纳学派证实原则 | L3 | [30, 250] |
| 10 | godel_incompl | 哥德尔裂隙 | G | normal | 哥德尔不完备 | L3 | [40, 300] |
| 11 | cogito_remain | 我思残骸 | C | elite | 笛卡尔我思(精英变体) | L1 | [15, 200] |
| 12 | pascal_demon | 帕斯卡之魔 | D | elite | 帕斯卡赌注(反讽变体) | L1 | [20, 250] |
| 13 | dasein_remainder | 此在残响 | M | boss | 此在(Dasein)/向死存在 | L2 | [20] |
| 14 | will_to_power | 强力意志化身 | W | boss | 强力意志(Wille zur Macht) | L2 | [50] |
| 15 | thing_in_itself | 物自体防壁 | N | boss | 物自体(Ding an sich) | L2 | [80] |
| 16 | munchhausen_knot | 明希豪森之结 | X | boss | 明希豪森三重困境 | L3 | [120] |
| 17 | apperception_field | 统觉统一场 | A | boss | 先验统觉(Transzendentale Apperzeption) | L3 | [200] |

> 备注:精英怪选用"我思"和"帕斯卡"作为 L1 简单精英,与普通怪形成"同概念不同强度"的对照。

### 7.2 怪物生成流程

```
1. 普通怪:
   if stage % 5 === 0:
     type = "elite"
   else:
     type = "normal"

2. Boss:
   if stage % 10 === 0:
     type = "boss"
     从 bosses 池中按 stage 精确匹配,若无匹配则按普通怪生成

3. 选定 type 后:
   从对应 type 池中按 stageRange 过滤
   加权随机选一个(用各模板的 dropWeight 字段)
   用 5.3 公式生成该 stage 的实际数值
```

### 7.3 怪物死亡反馈(MUST)

```
- 屏幕中央飘出伤害数字(白色 12px,暴击黄色 18px 加粗)
- 敌人 ASCII 闪红 100ms(切换 canvas 颜色或 DOM class)
- 死亡时随机散落 3-5 个 ASCII 粒子: * ! # / \
- log 添加击杀信息(怪物名 + exp + gold)
- 经验/金币飞入顶部 HUD(用 CSS transition 实现 +N 动画即可)
- 若掉装备,日志单独一行: [掉落] 概念装备: {rarity} {name}
```

---

## 8. 战斗循环(MUST 按此顺序实现)

```js
function gameTick(deltaMs) {
  // 1. 累加计时器
  playerTimer += deltaMs;
  enemyTimer  += deltaMs;

  // 2. 玩家攻击(用聚合后的最终属性)
  const ps = aggregateStats(player, equipment);
  if (playerTimer >= 1000 / ps.aspd) {
    playerAttackEnemy(ps);
    playerTimer = 0;
  }

  // 3. 敌人攻击
  if (enemyTimer >= 1000 / currentEnemy.stats.aspd) {
    enemyAttackPlayer(currentEnemy.stats);
    enemyTimer = 0;
  }

  // 4. 死亡判定
  if (currentEnemy.stats.hp <= 0) onEnemyDeath();
  if (player.hp <= 0) onPlayerDeath();

  // 5. 渲染
  renderCombat();   // Canvas 重绘战斗画面
  updateHUD();      // DOM 更新顶部状态
  appendLog();      // 批量刷新日志
}
```

### 8.1 主循环实现

```
使用 requestAnimationFrame,固定 60fps。
deltaMs 通过 performance.now() 差值计算,封顶 100ms 防止卡顿后跳跃。
```

### 8.2 onEnemyDeath 流程

```
1. 给玩家加 exp 和 gold(应用 expGain / goldGain 加成)
2. 检查升级,可能多次升级
3. 判定掉装备(5.7 公式)
4. 若掉,roll 装备(6.4 流程)
5. 解锁 codex(本期只是 push 到 unlockedCodex,UI 不展示)
6. stage += 1
7. spawnEnemy(stage)(7.2 流程)
8. bestStage = max(bestStage, stage - 1)   // 因为已经 +1 了
```

### 8.3 onPlayerDeath 流程

```
1. log "[死亡] ..."
2. stage = max(1, stage - 5)
3. player.hp = player.maxHp
4. player.mp = player.maxMp
5. spawnEnemy(stage)
```

---

## 9. UI 规范

### 9.1 视觉

```
背景:    #0a0a0a
主色:    #00ff88(终端绿)
强调:    #ffffff(白) / #ffaa00(黄) / #ff4444(红)
字体:    系统等宽字体(monospace)
字号:    战斗 16px,HUD 14px,日志 12px
行高:    1.4
```

### 9.2 主页面布局(MUST,顶部到底部)

```
┌─────────────────────────────────────────────┐
│ 顶部 HUD (固定,高度约 80px)                 │
│  LV 12  EXP ████░░░░  STAGE 48  金币 3201    │
│  HP ████████░░  MP ████░░░░  ATK 24 DEF 8    │
├─────────────────────────────────────────────┤
│                                             │
│   Canvas 战斗区(高度 240px,固定)            │
│                                             │
│       @====>             S                   │
│                     帕斯卡之魔                   │
│         CRIT 128!        * ! #               │
│                                             │
├─────────────────────────────────────────────┤
│ 日志滚动区(高度 120px,最多保留 50 条)       │
│  [LOG] 击败 我思故我在 +12 exp +5 金币         │
│  [DROP] 经验 概念装备:偶因论之钥                │
├─────────────────────────────────────────────┤
│ 底部按钮栏(固定,高度约 50px)                │
│  [装备] [背包] [图鉴] [设置]                 │
└─────────────────────────────────────────────┘
```

### 9.3 装备详情弹窗(MUST)

```
点击装备时弹出,显示(顺序固定):
1. 名称(按稀有度上色)
2. 部位 + 稀有度
3. 基础属性(数字,百分比标注 %)
4. 词缀列表
5. 特殊效果(★ 标注,人话描述)
6. ─────── 概念 ───────
7. 概念术语 / 派系
8. 一句话科普(直接来自 concept.summary)
9. 机制映射(直接来自 concept.designNote)
10. ──────────────────
11. [装备] [分解] [关闭] 按钮

装备按钮根据当前状态显示不同文案:
  - 未穿戴: "装备"
  - 已穿戴: "已装备"
  - 同部位已装备: "替换 {当前装备名}"
```

### 9.4 背包面板布局

```
左侧: 分类切换 [武器][头部][胸甲][护手][鞋子][戒指][项链][护符][核心] [全部]
中部: 装备列表(可滚动)
右侧: 选中装备的详情(9.3 弹窗内容常驻显示)
底部: 当前穿戴的 9 个部位缩略图
```

---

## 10. 反模式清单(AI MUST NOT)

### 10.1 命名反模式(已在第 3 节详述,这里给代码对比)

```js
// ❌ 反模式 1: 用"主义"作装备名
{ name: "存在主义之剑" }
// ✅ 正解
{ name: "向死存在之枪" }    // 用具体概念"向死存在",不用"存在主义"

// ❌ 反模式 2: 装备效果和概念无关
{
  name: "蔡格尼克指环",
  effects: [{ type: "stat_flat", stat: "atk", value: 5 }]
}
// ✅ 正解:效果必须呼应"未完成任务的记忆"
{
  name: "蔡格尼克指环",
  effects: [{ type: "on_kill", effect: "drop_bonus" }]
}

// ❌ 反模式 3: 把概念说明写成空洞鸡汤
{ summary: "蔡格尼克效应是一个心理学概念,很有意思" }
// ✅ 正解
{ summary: "未完成的任务更容易被记住,已完成的任务容易遗忘。" }

// ❌ 反模式 4: 怪物只是一个名字 + 血量
{ name: "怪物", stats: { hp: 100 } }
// ✅ 正解:必须有 concept / symbol / type / stageRange
{
  id: "anchor_worm",
  name: "锚定虫",
  symbol: "a",
  type: "normal",
  stageRange: [1, 30],
  concept: { term: "锚定效应", ... },
  stats: { hp: 30, maxHp: 30, atk: 4, def: 2, aspd: 0.8 },
  rewards: { exp: 5, gold: 3 },
  dropChance: 0.08,
}
```

### 10.2 代码反模式

```js
// ❌ 反模式 5: 数值写在 UI 渲染里
// HTML 里直接 <span>100</span>
// ✅ 正确:所有数值从 state 读取,通过 stats 模块格式化
element.textContent = formatNumber(player.hp);

// ❌ 反模式 6: 用 alert() / confirm() / prompt()
alert("你获得了装备!");
// ✅ 正确:用自定义 log 系统写入日志面板
log.add("[掉落] " + item.name);

// ❌ 反模式 7: 直接修改 player 对象的属性
player.hp -= damage;
// ✅ 正确:通过 systems/combat.js 的函数,便于加日志和动画
applyDamage(player, damage, "physical");

// ❌ 反模式 8: 把魔法数字散落在代码里
if (stage % 5 === 0) { ... }   // 5 是什么?
if (dropChance < 0.35) { ... } // 0.35 是什么?
// ✅ 正确:从 constants.js 读取
import { ELITE_INTERVAL, ELITE_DROP_CHANCE } from '../constants.js';
if (stage % ELITE_INTERVAL === 0) { ... }

// ❌ 反模式 9: 用 setInterval 做主循环
setInterval(gameTick, 16);
// ✅ 正确:用 requestAnimationFrame + deltaMs
function loop(now) {
  const delta = now - lastTime;
  gameTick(Math.min(delta, 100));
  lastTime = now;
  requestAnimationFrame(loop);
}

// ❌ 反模式 10: 存档不写版本号
localStorage.setItem("save", JSON.stringify(data));
// ✅ 正确:写版本号,迁移时按版本处理
localStorage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, ...data }));
```

---

## 11. AI 开发阶段(严格执行,跳级 = 失败)

### 阶段 0:脚手架(必须先做完)

```
交付物:
1. index.html(含所有 UI 容器 + 引入 main.js)
2. style.css(终端风格 + 9.2 布局)
3. js/main.js(import 所有模块,启动 game loop)
4. js/core/state.js(空 state 对象)
5. js/core/save.js(load/save 函数)
6. 一个最简战斗循环:
   玩家 @ 和敌人 ? 互打,死一个 spawn 新的
7. 浏览器打开能看到东西
```

验收:
- [ ] 浏览器 console 无任何 error / warning
- [ ] 玩家和敌人都显示
- [ ] 自动攻击能跑
- [ ] 死亡后刷新存档还在

### 阶段 1:数值系统

```
交付物:
1. js/constants.js(5.1, 5.2, 5.3 公式 + 所有常量)
2. js/systems/stats.js(aggregateStats 函数,基础 + 装备加成)
3. js/systems/progression.js(升级、stage 推进)
4. HUD 显示:等级、经验条、HP、MP、ATK、DEF、Stage、金币
```

### 阶段 2:战斗完整化

```
交付物:
1. 完整伤害公式(5.4)
2. 暴击数字、闪避 log
3. 玩家死亡回退 5 层
4. 5/10 层切换为精英/Boss
5. 数据填入 enemies.js 全部 15 个怪物
6. 数据填入 concepts.js 全部 15 个概念
```

### 阶段 3:装备系统

```
交付物:
1. js/data/items.js(12 个装备模板,完整数据)
2. js/data/affixes.js(20+ 词缀)
3. js/systems/loot.js(掉落判定,6.4 流程)
4. js/systems/equipment.js(穿戴/卸下/聚合)
5. js/ui/inventory.js(背包面板 + 详情弹窗,9.3 布局)
6. 顶部按钮接上
```

### 阶段 4:UI 与打磨

```
交付物:
1. Canvas 战斗动画(攻击挥动、伤害飘字、粒子,7.3 反馈)
2. 设置页(音量占位、自动保存开关)
3. 存档导入导出(复制 JSON 到剪贴板 + 文本框)
4. 数值格式化(1.2K / 3.5M / 7.8B,工具函数即可)
5. README.md 写完(玩家向)
```

### 阶段 5:测试与平衡

```
交付物:
1. 玩通 50 层不报错
2. 数值没有爆炸或负数
3. 每件装备点击都能看到概念说明
4. 普通/精英/Boss 三类怪物都至少遇到一次
5. Boss 死亡能稳定通关到下一层
6. 玩家死亡后会回退
7. GitHub Pages 部署成功
```

> 阶段 5 完成后,才算 MVP 完成。才能开阶段 6(图鉴/转生/离线)。

---

## 12. 验收清单(每阶段交付时 AI 必须自检)

### 12.1 通用自检

```
[ ] 浏览器 console 无任何 error / warning
[ ] 刷新页面后存档能完整恢复
[ ] 所有 12 件装备都能在合适层数掉到
[ ] 每件装备详情都能看到 concept.summary
[ ] 普通/精英/Boss 三类怪物都至少遇到一次
[ ] Boss 死亡能稳定通关到下一层
[ ] 玩家死亡后会回退
[ ] 数值无负数、无 Infinity、无 NaN
[ ] 装备穿戴后属性立即变化
[ ] 日志不会无限增长(最多保留 50 条)
[ ] 不存在"主义"作装备名
[ ] 不存在纯数值描述的装备(吸血匕首、暴击之剑)
[ ] 不存在 alert/confirm/prompt
[ ] 不存在 setInterval 作主循环
```

### 12.2 命名专项自检

```
[ ] 每个装备名能用 5 套模板之一套上(见 3.3)
[ ] 每个怪物名有"概念 + 类别后缀"
[ ] 每件装备 effect 字段能用 "X 因为 Y" 讲清
[ ] 每个 concept.summary 不超过 50 字
[ ] 没有重复的 templateId
```

### 12.3 数值专项自检

```
[ ] 1 级玩家打 1 层普通怪不能秒(至少 3~5 回合)
[ ] 50 层 Boss 不能秒 50 级玩家(至少 10 回合)
[ ] 传说装备掉率在 50 层大约是 1/100 量级
[ ] 玩家死亡 10 次后能稳定在 5~10 层推图
```

---

## 13. 风格一致性(MUST)

```
- 所有面向用户的文字用中文
- 所有代码注释用中文
- 所有术语中文为主,英文括注(仅首次出现时)
- 所有按钮文案 2~4 字
- 所有 log 一行不超过 50 字
- 所有弹窗标题一行不超过 8 字
- 概念术语首次出现时格式:"中文名(English)"
- 日志条目统一前缀:
  [击杀]   [掉落]   [升级]   [死亡]   [闪避]   [暴击]
```

---

## 14. 部署(MUST)

```
1. 仓库名:terminal-of-being
2. main 分支根目录部署
3. GitHub Pages 启用:
   Settings → Pages → Source 选 "Deploy from a branch"
   Branch 选 main / (root)
4. 无需 CI,纯静态文件
5. README.md 必须含:
   - 一句话游戏介绍
   - 玩法说明(自动战斗、刷宝、概念科普)
   - 概念致谢列表(本游戏所有引用的哲学/心理学/社会学概念来源)
   - 开源协议(MIT)
   - 本地运行方法(直接打开 index.html)
```

---

## 15. 本期不做(明确禁止越界)

```
❌ 离线收益
❌ 转生系统
❌ 图鉴完整功能(只留 data 层,UI 不做,代码里有 unlockedCodex 字段即可)
❌ 手动技能(UI 占位,不实现 effect)
❌ 套装系统
❌ 成就系统
❌ 音效
❌ 多语言
❌ 移动端适配(只保证 PC Chrome / Firefox / Edge 不崩)
❌ 任何后端 / 网络请求
❌ TypeScript 迁移(本期纯 JS)
❌ 任何 npm 依赖
```

---

## 16. 紧急问题反馈通道

AI 在开发过程中遇到以下情况,MUST 停下来,在输出里明确告知用户,而非自行决定:

```
1. 文档自相矛盾(本版本已尽量消除,但仍可能)
2. 某个机制在 800 行内无法实现
3. 数值平衡崩坏(玩家 1 级就 1 击秒 Boss)
4. 需要添加新的 Effect type
5. 需要增加新的怪物/装备但不在 MVP 列表
6. 浏览器兼容性问题
```

---

# 附录 A:MVP 装备完整数据(12 件,AI 直接抄)

```js
// 这些是 v3.0 的完整模板,可以直接复制到 items.js
// AI 实现时 MUST 按此结构,只允许加 stageRange 等数值,不允许改 concept 字段
// 命名遵循第 3.3 节 5 套模板,严格按"小众度 L1/L2/L3"分层

export const ITEMS = [
  {
    templateId: "occasionalism_key",
    name: "偶因论之钥",
    rarity: "rare",
    slot: "weapon",
    stageRange: [5, 40],
    baseStats: { atk: 15 },
    affixes: [
      { stat: "atk", value: 0.05, isPercent: true },
    ],
    effects: [],
    concept: {
      id: "occasionalism",
      term: "偶因论",
      termEn: "Occasionalism",
      school: "理性主义哲学 / 马勒伯朗士",
      field: "哲学",
      summary: "心灵和身体不直接作用,上帝是每次相互作用的中介。",
      designNote: "攻击由"上帝中介"完成——基础攻击稳定,但暴击时伤害是普通攻击的两倍(中介延后生效)。",
    },
    flavorText: "每一下挥击,都经由中介之手。",
    dropWeight: 25,
  },

  {
    templateId: "thing_shield",
    name: "物自体之盾",
    rarity: "epic",
    slot: "chest",
    stageRange: [10, 60],
    baseStats: { def: 15, maxHp: 30 },
    affixes: [
      { stat: "def", value: 0.1, isPercent: true },
      { stat: "dodge", value: 0.05, isPercent: true },
    ],
    effects: [
      {
        type: "enemy_debuff",
        stat: "crit",
        value: 0.15,
        isPercent: true,
      },
    ],
    concept: {
      id: "thing_in_itself",
      term: "物自体(Ding an sich)",
      termEn: "Thing-in-itself",
      school: "德国观念论 / 康德",
      field: "哲学",
      summary: "事物本身不可被认识,我们只能认识它呈现给我们的"现象"。",
      designNote: "防御+降低敌人暴击——你只能看到现象,看不到物自体,自然打不出"原本"的暴击。",
    },
    flavorText: "你看到的从来不是它本身,只是它愿意被你看到的部分。",
    dropWeight: 15,
  },

  {
    templateId: "will_to_power_crown",
    name: "强力意志之冠",
    rarity: "epic",
    slot: "head",
    stageRange: [15, 80],
    baseStats: { atk: 12, crit: 0.05 },
    affixes: [
      { stat: "atk", value: 0.1, isPercent: true },
      { stat: "critDmg", value: 0.2, isPercent: true },
    ],
    effects: [
      {
        type: "on_kill",
        effect: "atk_stack",
      },
    ],
    concept: {
      id: "will_to_power",
      term: "强力意志(Wille zur Macht)",
      termEn: "Will to Power",
      school: "尼采哲学",
      field: "哲学",
      summary: "生命的本质不是求生,而是不断扩张力量、超越自身。",
      designNote: "每次击杀永久 +1 攻击(无上限)——强力意志在每次胜利中扩张。",
    },
    flavorText: "每一次胜利,都让意志更强一分。",
    dropWeight: 12,
  },

  {
    templateId: "sein_zum_tode_boots",
    name: "向死存在之靴",
    rarity: "epic",
    slot: "boots",
    stageRange: [20, 100],
    baseStats: { maxHp: 50, dodge: 0.08 },
    affixes: [
      { stat: "maxHp", value: 0.2, isPercent: true },
      { stat: "dodge", value: 0.1, isPercent: true },
    ],
    effects: [
      {
        type: "on_low_hp",
        threshold: 0.3,
        stat: "aspd",
        value: 0.3,
        isPercent: true,
      },
    ],
    concept: {
      id: "sein_zum_tode",
      term: "向死存在(Sein-zum-Tode)",
      termEn: "Being-toward-death",
      school: "存在主义 / 海德格尔",
      field: "哲学",
      summary: "人最本真的存在是面向死亡的存在——直面死亡让生命完整。",
      designNote: "血越低攻速越快——意识到死亡,反而行动更果决。",
    },
    flavorText: "唯有直面终点,步伐才真正轻盈。",
    dropWeight: 10,
  },

  {
    templateId: "intentionality_ring",
    name: "意向性指环",
    rarity: "epic",
    slot: "ring",
    stageRange: [10, 80],
    baseStats: { atk: 8, crit: 0.04 },
    affixes: [
      { stat: "crit", value: 0.08, isPercent: true },
      { stat: "itemFind", value: 0.05, isPercent: true },
    ],
    effects: [],
    concept: {
      id: "intentionality",
      term: "意向性(Intentionalität)",
      termEn: "Intentionality",
      school: "现象学 / 胡塞尔",
      field: "哲学",
      summary: "意识总是"关于某物"的意识——没有无对象的意识。",
      designNote: "提高暴击率和掉率——你的意识"指向"敌人时,伤害和发现都更精准。",
    },
    flavorText: "没有无方向的注视。",
    dropWeight: 12,
  },

  {
    templateId: "lebenswelt_cape",
    name: "生活世界披风",
    rarity: "epic",
    slot: "chest",
    stageRange: [15, 100],
    baseStats: { def: 12, maxHp: 25 },
    affixes: [
      { stat: "maxHp", value: 0.15, isPercent: true },
      { stat: "lifesteal", value: 0.05, isPercent: true },
    ],
    effects: [],
    concept: {
      id: "lebenswelt",
      term: "生活世界(Lebenswelt)",
      termEn: "Lifeworld",
      school: "现象学 / 胡塞尔",
      field: "哲学",
      summary: "日常经验的世界,反而是科学抽象的基础。",
      designNote: "提高最大生命和吸血——"日常"反而是真实力量的来源。",
    },
    flavorText: "科学构造的世界,只是生活世界的影子。",
    dropWeight: 12,
  },

  {
    templateId: "categorical_law",
    name: "绝对命令之律",
    rarity: "legendary",
    slot: "amulet",
    stageRange: [30, 200],
    baseStats: { atk: 20, def: 10 },
    affixes: [
      { stat: "atk", value: 0.15, isPercent: true },
      { stat: "def", value: 0.15, isPercent: true },
      { stat: "critDmg", value: 0.25, isPercent: true },
    ],
    effects: [
      {
        type: "conditional",
        trigger: "no_dodge_30s",
        effect: "atk_buff",
        value: 0.3,
        isPercent: true,
      },
    ],
    concept: {
      id: "categorical_imperative",
      term: "绝对命令(Kategorischer Imperativ)",
      termEn: "Categorical Imperative",
      school: "义务论伦理学 / 康德",
      field: "哲学",
      summary: "只按你愿其成为普遍法则的准则去行动。",
      designNote: "持续 30 秒不闪避,触发 +30% 攻击——你的行动不偏离"准则",反而更强大。",
    },
    flavorText: "愿你的准则,成为星空的法则。",
    dropWeight: 5,
  },

  {
    templateId: "dasein_boots",
    name: "此在之靴",
    rarity: "rare",
    slot: "boots",
    stageRange: [8, 50],
    baseStats: { maxHp: 20, dodge: 0.05 },
    affixes: [
      { stat: "maxHp", value: 0.1, isPercent: true },
      { stat: "dodge", value: 0.08, isPercent: true },
    ],
    effects: [],
    concept: {
      id: "dasein",
      term: "此在(Dasein)",
      termEn: "Dasein",
      school: "存在主义 / 海德格尔",
      field: "哲学",
      summary: "此在指人这种存在者,它的存在方式是"在世界中存在"。",
      designNote: "提高生命和闪避——此在"在世"的方式,本身就是柔软而灵活的。",
    },
    flavorText: "人,总是已经在世界之中。",
    dropWeight: 25,
  },

  {
    templateId: "veil_of_ignorance",
    name: "无知之幕面纱",
    rarity: "epic",
    slot: "charm",
    stageRange: [25, 150],
    baseStats: { luck: 10, rarityFind: 0.05 },
    affixes: [
      { stat: "itemFind", value: 0.15, isPercent: true },
      { stat: "rarityFind", value: 0.1, isPercent: true },
      { stat: "luck", value: 15, isPercent: false },
    ],
    effects: [],
    concept: {
      id: "veil_of_ignorance",
      term: "无知之幕(Veil of Ignorance)",
      termEn: "Veil of Ignorance",
      school: "政治哲学 / 罗尔斯",
      field: "哲学",
      summary: "不知道自己将处在什么位置时,才能设计出真正公平的规则。",
      designNote: "不知道敌人会掉什么时,掉落率才"公平"地最大化。",
    },
    flavorText: "不知道将身处何处,才能为所有人立法。",
    dropWeight: 8,
  },

  {
    templateId: "akrasia_ring",
    name: "意志薄弱之环",
    rarity: "rare",
    slot: "ring",
    stageRange: [5, 50],
    baseStats: { atk: 5, aspd: 0.1 },
    affixes: [
      { stat: "atk", value: 0.08, isPercent: true },
      { stat: "aspd", value: 0.15, isPercent: true },
    ],
    effects: [],
    concept: {
      id: "akrasia",
      term: "意志薄弱(Akrasia)",
      termEn: "Akrasia / Weakness of Will",
      school: "德性伦理学 / 亚里士多德",
      field: "哲学",
      summary: "知道该做什么,却不去做——"明知故犯"的哲学分析。",
      designNote: "攻击和攻速同时提高,但暴击率低——想做就做,但做不到"精准"。",
    },
    flavorText: "知道该停下,却停不下来。",
    dropWeight: 25,
  },

  {
    templateId: "apperception_eye",
    name: "统觉之眼",
    rarity: "legendary",
    slot: "charm",
    stageRange: [50, 500],
    baseStats: { crit: 0.1, critDmg: 0.5 },
    affixes: [
      { stat: "crit", value: 0.15, isPercent: true },
      { stat: "critDmg", value: 0.6, isPercent: true },
      { stat: "aspd", value: 0.2, isPercent: true },
    ],
    effects: [],
    concept: {
      id: "apperception",
      term: "统觉(Apperzeption)",
      termEn: "Transcendental Apperception",
      school: "先验哲学 / 康德",
      field: "哲学",
      summary: ""我思"伴随着我的一切表象——自我意识的先天统一。",
      designNote: "极端暴击+暴击伤害+攻速——"我思"贯穿一切表象,所有攻击都是精准暴击。",
    },
    flavorText: "我思,故每一下都是确定的击中。",
    dropWeight: 3,
  },

  {
    templateId: "munchhausen_key",
    name: "明希豪森困境之钥",
    rarity: "legendary",
    slot: "weapon",
    stageRange: [60, 999],
    baseStats: { atk: 50 },
    affixes: [
      { stat: "atk", value: 0.3, isPercent: true },
      { stat: "critDmg", value: 0.4, isPercent: true },
      { stat: "aspd", value: 0.15, isPercent: true },
    ],
    effects: [
      {
        type: "conditional",
        trigger: "stage_clear",
        effect: "stat_stack",
        value: 0.05,
        isPercent: true,
      },
    ],
    concept: {
      id: "munchhausen_trilemma",
      term: "明希豪森三重困境(Münchhausen-Trilemma)",
      termEn: "Münchhausen Trilemma",
      school: "认识论 / 怀疑论",
      field: "哲学",
      summary: "任何证明都面临三难:无穷后退、循环论证、武断停止。",
      designNote: "每通过 10 层,所有词缀效果 +5%(无上限)——你跳出了"三难",但代价是越走越重。",
    },
    flavorText: "要么无穷后退,要么循环论证,要么在某处武断地停下。",
    dropWeight: 2,
  },
];
```

---

# 附录 B:MVP 概念库(17 条,与怪物一一对应)

```js
export const CONCEPTS = [
  {
    id: "protagoras",
    term: "普罗泰戈拉 — 人是万物的尺度",
    termEn: "Man is the Measure (Protagoras)",
    school: "古希腊哲学 / 智者派",
    field: "哲学",
    summary: ""人是万物的尺度,存在者存在,不存在者不存在"——知识依赖感知者。",
    designNote: "它是普通怪,但很"自我"——每场战斗它都觉得你只是它的投影。",
  },
  {
    id: "cogito",
    term: "我思故我在(Cogito, ergo sum)",
    termEn: "Cogito, ergo sum",
    school: "近代哲学 / 笛卡尔",
    field: "哲学",
    summary: "唯一不可怀疑的是"正在思考的我"——怀疑本身的执行者。",
    designNote: "我思残骸——你怎么攻击它,它都"在想"自己,所以不会真正消失。",
  },
  {
    id: "pascal_wager",
    term: "帕斯卡赌注",
    termEn: "Pascal's Wager",
    school: "概率论 / 宗教哲学 / 帕斯卡",
    field: "哲学",
    summary: "信仰上帝的预期收益大于不信——用概率论证明信仰。",
    designNote: "帕斯卡之魔——它赌你不会用最低成本解掉它。",
  },
  {
    id: "language_game",
    term: "语言游戏",
    termEn: "Language Game",
    school: "语言哲学 / 维特根斯坦(后期)",
    field: "哲学",
    summary: "语言的意义在于它的使用——没有脱离语境的"独立意义"。",
    designNote: "语言游戏残响——它说的每句话都"对",但你不知道它在哪个游戏里。",
  },
  {
    id: "public_sphere",
    term: "公共领域",
    termEn: "Public Sphere",
    school: "批判理论 / 哈贝马斯",
    field: "哲学",
    summary: "公民可以理性讨论公共事务的领域——现代民主的基础。",
    designNote: "公共领域回声——它的攻击被你"听见",但你不确定是不是你自己在发声。",
  },
  {
    id: "structuralism",
    term: "结构主义 / 二元对立",
    termEn: "Structuralism / Binary Opposition",
    school: "人类学 / 列维-施特劳斯",
    field: "哲学",
    summary: "文化现象由底层的二元对立结构(男/女、生/死、昼/夜)组织。",
    designNote: "二元对立体——它用"对立"来理解一切,包括它和你的关系。",
  },
  {
    id: "knowledge_archaeology",
    term: "知识考古学",
    termEn: "Archaeology of Knowledge",
    school: "后结构主义 / 福柯",
    field: "哲学",
    summary: "不研究思想史,而研究"话语"如何形成、断裂、重组——挖掘知识的深层结构。",
    designNote: "知识考古虫——它在挖你,挖出你也不知道你有的"知识"。",
  },
  {
    id: "culture_industry",
    term: "文化工业",
    termEn: "Culture Industry",
    school: "批判理论 / 阿多诺 & 霍克海默",
    field: "哲学",
    summary: "大众文化被标准化、批量化生产,以维持既有秩序——批判的视角。",
    designNote: "文化工业循环——它的攻击套路高度模式化,你能预判,但挡不住。",
  },
  {
    id: "verificationism",
    term: "证实原则",
    termEn: "Verification Principle",
    school: "逻辑实证主义 / 维也纳学派",
    field: "哲学",
    summary: "一个命题只有可被经验证实时才有意义——形而上学命题无意义。",
    designNote: "证实原则空壳——它攻击你,但你无法用"经验"证实它存在。",
  },
  {
    id: "godel_incompleteness",
    term: "哥德尔不完备定理",
    termEn: "Gödel's Incompleteness Theorems",
    school: "数理逻辑 / 哥德尔",
    field: "数学",
    summary: "任何足够强的形式系统,都存在真但不可证的命题——数学有不可消除的边界。",
    designNote: "哥德尔裂隙——它永远不能被"完全"击败,会留下不可证的残余。",
  },
  {
    id: "dasein",
    term: "此在(Dasein)与向死存在",
    termEn: "Dasein & Being-toward-death",
    school: "存在主义 / 海德格尔",
    field: "哲学",
    summary: "此在(人)的存在方式是"在世界中存在",最本真的状态是面向死亡。",
    designNote: "此在残响(Boss)——它死前会获得极大增强,因为它终于"向死存在"了。",
  },
  {
    id: "will_to_power",
    term: "强力意志(Wille zur Macht)",
    termEn: "Will to Power",
    school: "尼采哲学",
    field: "哲学",
    summary: "生命的本质不是求生,而是不断扩张力量、超越自身——价值由强者创造。",
    designNote: "强力意志化身——它越被打越强,如果你不能在某一击消灭它,你会输。",
  },
  {
    id: "thing_in_itself",
    term: "物自体(Ding an sich)",
    termEn: "Thing-in-itself",
    school: "德国观念论 / 康德",
    field: "哲学",
    summary: "事物本身不可被认识,我们只能认识它呈现给我们的"现象"。",
    designNote: "物自体防壁——你只能打到它的"现象",无法造成完整伤害。",
  },
  {
    id: "munchhausen_trilemma",
    term: "明希豪森三重困境",
    termEn: "Münchhausen Trilemma",
    school: "认识论 / 怀疑论",
    field: "哲学",
    summary: "任何证明都面临:无穷后退、循环论证、武断停止。",
    designNote: "明希豪森之结(Boss)——打掉它会召唤它之前召唤过的怪(循环论证)。",
  },
  {
    id: "apperception",
    term: "先验统觉(Transzendentale Apperzeption)",
    termEn: "Transcendental Apperception",
    school: "先验哲学 / 康德",
    field: "哲学",
    summary: ""我思"伴随着我的一切表象——自我意识的先天统一。",
    designNote: "统觉统一场(Boss)——它的所有攻击被视为"同一"次攻击,免疫分次伤害。",
  },
  {
    id: "categorical_imperative",
    term: "绝对命令(Kategorischer Imperativ)",
    termEn: "Categorical Imperative",
    school: "义务论伦理学 / 康德",
    field: "哲学",
    summary: "只按你愿其成为普遍法则的准则去行动——道德的绝对律令。",
    designNote: "(见装备 -7 绝对命令之律)",
  },
  {
    id: "veil_of_ignorance",
    term: "无知之幕(Veil of Ignorance)",
    termEn: "Veil of Ignorance",
    school: "政治哲学 / 罗尔斯",
    field: "哲学",
    summary: "不知道自己将处在什么位置时,才能设计出真正公平的规则。",
    designNote: "(见装备 -9 无知之幕面纱)",
  },
];
```

# 附录 C:词缀池(20 条,MVP 必须实现)

```js
export const AFFIXES = [
  // 普通数值词缀(适用于 magic/rare)
  { stat: "atk", value: 3, isPercent: false, weight: 10 },
  { stat: "atk", value: 5, isPercent: false, weight: 6 },
  { stat: "def", value: 2, isPercent: false, weight: 10 },
  { stat: "def", value: 4, isPercent: false, weight: 6 },
  { stat: "maxHp", value: 10, isPercent: false, weight: 10 },
  { stat: "maxHp", value: 20, isPercent: false, weight: 6 },
  { stat: "aspd", value: 0.1, isPercent: false, weight: 8 },

  // 百分比词缀(适用于 rare/epic)
  { stat: "atk", value: 0.05, isPercent: true, weight: 8 },
  { stat: "atk", value: 0.1, isPercent: true, weight: 4 },
  { stat: "def", value: 0.05, isPercent: true, weight: 8 },
  { stat: "maxHp", value: 0.1, isPercent: true, weight: 8 },
  { stat: "crit", value: 0.03, isPercent: true, weight: 6 },
  { stat: "critDmg", value: 0.15, isPercent: true, weight: 5 },
  { stat: "dodge", value: 0.03, isPercent: true, weight: 5 },
  { stat: "lifesteal", value: 0.03, isPercent: true, weight: 4 },

  // 高阶词缀(适用于 epic/legendary)
  { stat: "atk", value: 0.2, isPercent: true, weight: 2 },
  { stat: "critDmg", value: 0.3, isPercent: true, weight: 2 },
  { stat: "itemFind", value: 0.05, isPercent: true, weight: 3 },
  { stat: "rarityFind", value: 0.03, isPercent: true, weight: 3 },
  { stat: "luck", value: 10, isPercent: false, weight: 3 },
  { stat: "aspd", value: 0.2, isPercent: false, weight: 2 },
];
```

---

# 附录 D:开发完成后,后续扩展清单(本期不做)

```
阶段 6:
- 图鉴完整 UI(分类展示概念条目、相关装备、相关怪物)
- 离线收益(8 小时上限,30% 效率)
- 转生(第 50 层后解锁)
- 存在碎片永久升级树

阶段 7:
- 手动技能(5 个 MVP 技能: 断言 / 怀疑 / 洞见 / 意义恢复 / 解构)
- 套装系统
- Boss 多阶段机制

阶段 8:
- 60+ 装备模板
- 50+ 怪物
- 15+ Boss
- 移动端适配

阶段 9:
- 音效与背景 ASCII 动画
- 成就系统
- 多语言
- 数据分析埋点
```

---

# 附录 E:第一阶段 AI 提示词(可直接复制)

```
请根据 GAME_DESIGN.md 的"阶段 0:脚手架"一节,开发《存在终端 Terminal of Being》的最小可运行版本。

技术要求:
- 严格按文档第 2 节技术栈:纯 HTML + CSS + 原生 JS + Canvas
- 不使用任何外部依赖、不使用任何 npm 包
- 直接打开 index.html 即可运行
- 代码按 2.3 节文件结构组织
- 注释用中文

本阶段只交付:
1. index.html (含所有 UI 容器)
2. style.css (终端风格 + 9.2 节布局)
3. js/main.js (启动 + 主循环)
4. js/core/state.js (空 state 对象)
5. js/core/save.js (load/save 函数,基于 SAVE_KEY="terminal_of_being_save_v1")
6. 一个最简战斗循环:玩家 @ 和敌人 ? 互打,死一个 spawn 新的

验收标准(对照 12.1 节):
- 浏览器 console 无任何 error / warning
- 玩家和敌人都显示
- 自动攻击能跑
- 死亡后刷新存档还在

完成后请输出:
- 每个文件的完整代码
- 一段 100 字以内的运行说明
```

---

# 附录 F:可扩展名词池(L1/L2/L3 三层分类)

## F.0 使用说明

```
本池用于扩展游戏内容(装备、怪物、Boss、区域、套装、技能名等)。
每条记录包含:术语 / 流派 / 简介 / 状态 / 建议用途

状态字段取值:
  [已用]  = 已加入 MVP 装备或怪物池(详见 6.3 / 7.1)
  [备选]  = 适合未来扩展使用,已通过筛选
  [未定]  = 待评估,需要再过一遍选词标准
  [弃用]  = 因重复、撞名、装学术等原因不用

冷门度分级标准:
  L1 中等冷门 = 大众听过名字但不清楚细节(如康德、尼采、海德格尔)
  L2 较冷门   = 哲学/社会学专业外多数人没听过,但词条清晰(如意向性、统觉)
  L3 真冷门   = 哲学专业研究生才常接触(如先验统觉、明希豪森困境)

使用规则:
  - [已用] 词不可重复用于新装备/怪物
  - [备选] 词可任意使用,优先级高于 [未定]
  - 新词入选 [备选] 时,需写入对应小节并标注流派
  - 不允许出现 [弃用] 词的变体(例如 "小明希豪森")
  - 单个概念只允许出现一次:如果既作装备又作怪物,在两个表中都标 [已用]
```

## F.1 L1 中等冷门(35 条,5 个流派)

### 哲学(15 条)

| 术语 | 流派 | 简介 | 状态 | 建议用途 |
|------|------|------|------|----------|
| 偶因论 | 马勒伯朗士 | 心灵身体不直接作用,上帝每次中介 | [已用] | 装备 1 |
| 物自体 | 康德 | 事物本身不可认识,只能认识现象 | [已用] | 装备 2 / Boss 3 |
| 强力意志 | 尼采 | 生命本质是扩张力量、超越自身 | [已用] | 装备 3 / Boss 2 |
| 向死存在 | 海德格尔 | 最本真的存在是面向死亡 | [已用] | 装备 4 |
| 普罗泰戈拉 | 古希腊 | 人是万物的尺度 | [已用] | 怪物 1 |
| 我思故我在 | 笛卡尔 | 唯一不可怀疑的是正在思考的我 | [已用] | 怪物 2 / 11 |
| 帕斯卡赌注 | 帕斯卡 | 用概率论证明信仰上帝 | [已用] | 怪物 3 / 12 |
| 唯我论 | 唯心主义 | 只有自我意识的存在才是确定的 | [备选] | 装备/怪物 |
| 决定论 | 斯宾诺莎 | 一切事件由因果链预先决定 | [备选] | 区域名/Boss |
| 怀疑论 | 皮浪 / 蒙田 | 一切知识都不可靠,应保持不判断 | [备选] | 装备 |
| 二元论 | 笛卡尔 | 心灵与身体是两种不同实体 | [备选] | 装备 |
| 一元论 | 斯宾诺莎 | 世界只有一种实体(神/自然) | [备选] | 区域名 |
| 现象学还原 | 胡塞尔 | 暂存判断,只看现象本身 | [备选] | 装备/技能 |
| 阐释学 | 伽达默尔 | 理解是文本与读者的对话 | [备选] | 装备 |
| 解构 | 德里达 | 拆解文本的二元对立和在场 | [备选] | 装备 |

### 社会学(8 条)

| 术语 | 流派 | 简介 | 状态 | 建议用途 |
|------|------|------|------|----------|
| 公共领域 | 哈贝马斯 | 公民理性讨论公共事务的领域 | [已用] | 怪物 5 |
| 文化工业 | 阿多诺 | 大众文化被标准化批量化生产 | [已用] | 怪物 8 |
| 知识考古 | 福柯 | 研究话语如何形成、断裂、重组 | [已用] | 怪物 7 |
| 规训社会 | 福柯 | 现代权力通过规训渗透社会 | [备选] | 装备/区域 |
| 景观社会 | 居伊·德波 | 真实生活被景观(图像)取代 | [备选] | Boss |
| 异化劳动 | 马克思 | 劳动产品反过来控制劳动者 | [备选] | 装备 |
| 意识形态 | 马克思 / 阿尔都塞 | 统治阶级利益的观念表达 | [备选] | 装备 |
| 消费主义 | 鲍德里亚 | 消费成为身份建构的核心 | [备选] | 装备 |

### 心理学(7 条)

| 术语 | 流派 | 简介 | 状态 | 建议用途 |
|------|------|------|------|----------|
| 沉没成本 | 行为经济学 | 已损失的成本影响未来决策 | [已用] | 装备(原版保留) |
| 锚定效应 | 行为经济学 | 第一个信息锚定所有后续判断 | [已用] | 装备(原版保留) |
| 晕轮效应 | 社会心理 | 单一特质印象扩散到整体 | [已用] | 装备(原版保留) |
| 蔡格尼克效应 | 认知心理 | 未完成任务比已完成更被记住 | [已用] | 装备(原版保留) |
| 禀赋效应 | 行为经济学 | 拥有者对物品估值更高 | [备选] | 怪物/装备 |
| 巴纳姆效应 | 社会心理 | 笼统描述被认为精准描述自己 | [备选] | 怪物 |
| 确认偏误 | 认知心理 | 倾向找支持自己观点的信息 | [备选] | 怪物 |

### 数学 / 物理(5 条)

| 术语 | 流派 | 简介 | 状态 | 建议用途 |
|------|------|------|------|----------|
| 哥德尔不完备 | 数理逻辑 | 任何强形式系统都存在真但不可证命题 | [已用] | 怪物 10 / Boss 备选 |
| 薛定谔的猫 | 量子力学 | 盒子未开猫既活又死 | [备选] | Boss |
| 拉普拉斯妖 | 科学哲学 | 知道一切就能预知一切 | [备选] | Boss |
| 麦克斯韦妖 | 热力学 | 假想能分开快慢分子的小妖 | [备选] | Boss |
| 忒修斯之船 | 思想实验 | 每块板都换掉,还是原船吗 | [备选] | 装备/Boss |

## F.2 L2 较冷门(40 条,5 个流派)

### 哲学(15 条)

| 术语 | 流派 | 简介 | 状态 | 建议用途 |
|------|------|------|------|----------|
| 意向性 | 胡塞尔 | 意识总是关于某物的意识 | [已用] | 装备 5 |
| 生活世界 | 胡塞尔 | 日常经验的世界,科学反是抽象 | [已用] | 装备 6 |
| 绝对命令 | 康德 | 只按你愿其成为普遍法则的准则去行动 | [已用] | 装备 7 |
| 此在 | 海德格尔 | 人这种存在者,存在方式是"在世" | [已用] | 装备 8 / Boss 1 |
| 无知之幕 | 罗尔斯 | 不知道自己位置时才能设计公平规则 | [已用] | 装备 9 |
| 意志薄弱 | 亚里士多德 | 知道该做却不去做 | [已用] | 装备 10 |
| 语言游戏 | 维特根斯坦 | 意义在于使用,无独立意义 | [已用] | 怪物 4 |
| 二元对立 | 列维-施特劳斯 | 文化由底层二元对立结构组织 | [已用] | 怪物 6 |
| 被抛性 | 海德格尔 | 人被抛入世界,没选择 | [备选] | 装备(原版保留) |
| 恶信 | 萨特 | 逃避自由,伪装成无选择的存在 | [备选] | 装备(原版保留) |
| 对象小 a | 拉康 | 欲望运转的原因,不是欲望对象 | [备选] | 装备(原版保留) |
| 全景敞视 | 福柯 | 被观看者内化监视,自我规训 | [备选] | 装备(原版保留) |
| 差延 | 德里达 | 意义在差异和推迟中生成 | [备选] | 装备(原版保留) |
| 镜像阶段 | 拉康 | 婴儿镜中误认自己为完整主体 | [备选] | Boss(原版保留) |
| 西西弗斯 | 加缪 | 永远推石上山,荒诞与反抗的隐喻 | [备选] | Boss(原版保留) |

### 现象学 / 解释学(6 条)

| 术语 | 流派 | 简介 | 状态 | 建议用途 |
|------|------|------|------|----------|
| 悬置 | 现象学 | 暂不判断某事是否为真 | [备选] | 装备/技能名 |
| 充实 / 空乏 | 胡塞尔 | 意向被满足 / 未满足 | [备选] | 装备(可成对) |
| 滞留 | 胡塞尔 | 过去的"现在化",当下感的时间结构 | [备选] | 装备 |
| 互文性 | 克里斯蒂娃 | 文本意义来自与其他文本的关系 | [备选] | 装备 |
| 视域融合 | 伽达默尔 | 理解者与文本视野的交融 | [备选] | 装备 |
| 效果历史 | 伽达默尔 | 理解总受历史效果影响 | [备选] | 装备 |

### 社会学 / 政治哲学(8 条)

| 术语 | 流派 | 简介 | 状态 | 建议用途 |
|------|------|------|------|----------|
| 生命政治 | 福柯 | 权力对人口生命的管理 | [备选] | 区域名 |
| 规训权力 | 福柯 | 通过规训渗透社会的权力形式 | [备选] | 装备 |
| 内爆 | 鲍德里亚 | 真实与虚拟的边界内爆消失 | [备选] | Boss |
| 拟像 | 鲍德里亚 | 现实的仿真,比真实更真实 | [备选] | 装备 |
| 惯习 | 布尔迪厄 | 社会化的身体倾向 | [备选] | 装备 |
| 符号资本 | 布尔迪厄 | 声望、荣誉等非经济资本 | [备选] | 装备(注意:已作资源名) |
| 共识真理 | 哈贝马斯 | 通过理想言语达成的真理 | [备选] | 装备 |
| 沟通理性 | 哈贝马斯 | 理性体现在沟通行为中 | [备选] | 装备 |

### 伦理学 / 美学(6 条)

| 术语 | 流派 | 简介 | 状态 | 建议用途 |
|------|------|------|------|----------|
| 目的王国 | 康德 | 所有理性存在者的共同体 | [备选] | 装备 |
| 定命令 | 康德 | 有条件、追求幸福的命令 | [备选] | 装备 |
| 崇高 | 康德 | 超越感官把握的压倒性感受 | [备选] | 区域名 |
| 媚俗 | 昆德拉 / 格林伯格 | 讨好大众的虚假情感 | [备选] | 怪物 |
| 荒诞 | 加缪 | 意义缺失与反抗的张力 | [备选] | Boss 技能 |
| 恶心 | 萨特 | 面对存在过剩时的生理反应 | [备选] | 装备 |

### 数学 / 逻辑(5 条)

| 术语 | 流派 | 简介 | 状态 | 建议用途 |
|------|------|------|------|----------|
| 证实原则 | 维也纳学派 | 命题只有可验证才有意义 | [已用] | 怪物 9 |
| 希尔伯特旅馆 | 数学 | 无限旅馆满员也能接纳新客 | [备选] | Boss |
| 无限猴子 | 概率论 | 无限猴子无限时间可打出莎士比亚 | [备选] | 装备 |
| 罗素悖论 | 集合论 | "不包含自己的集合"包含自己吗 | [备选] | Boss |
| 玛丽的房间 | 心灵哲学 | 黑白世界的人看红色能"学到"吗 | [备选] | 装备 |

## F.3 L3 真冷门(25 条,5 个流派)

### 德国古典哲学(8 条)

| 术语 | 流派 | 简介 | 状态 | 建议用途 |
|------|------|------|------|----------|
| 统觉 | 康德 | "我思"伴随一切表象,自我意识统一 | [已用] | 装备 11 / Boss 5 |
| 物自身 | 康德 | = 物自体,德文 Ding an sich 另一译名 | [未定] | 与物自体重复,弃用 |
| 先验统觉 | 康德 | 统觉的学术全名 | [备选] | Boss |
| 自因 | 斯宾诺莎 | 自己就是自己存在的原因 | [备选] | 装备 |
| 实体属性样式 | 斯宾诺莎 | 实体=神/自然,属性=本质,样式=具体物 | [备选] | 装备 |
| 先天综合判断 | 康德 | 既扩认识又必真的判断,如数学 | [备选] | 装备 |
| 图式 | 康德 | 范畴与感性之间的中介结构 | [备选] | 装备 |
| 智性直观 | 康德 | 理智直接把握物自体的能力(人没有) | [备选] | Boss |

### 现象学 / 存在主义(5 条)

| 术语 | 流派 | 简介 | 状态 | 建议用途 |
|------|------|------|------|----------|
| 此在共在 | 海德格尔 | 此在总是在世界中与他人共在 | [备选] | 装备 |
| 良知的呼唤 | 海德格尔 | 此在对自己的本真召唤 | [备选] | 装备 |
| 烦 | 海德格尔 | 此在的基本存在状态(Sorge) | [备选] | 装备 |
| 畏 | 海德格尔 | 与"怕"不同,畏是面对虚无本身 | [备选] | 装备 |
| 沉沦 | 海德格尔 | 此在迷失在本真状态 | [备选] | 装备 |

### 认识论 / 语言哲学(5 条)

| 术语 | 流派 | 简介 | 状态 | 建议用途 |
|------|------|------|------|----------|
| 明希豪森三重困境 | 怀疑论 | 任何证明都面临三难 | [已用] | 装备 12 / Boss 4 |
| 语言图像论 | 早期维特根斯坦 | 命题是世界的逻辑图像 | [备选] | 装备 |
| 私人语言论证 | 后期维特根斯坦 | 私人语言不可能存在 | [备选] | 装备 |
| 言语行为 | 奥斯汀 / 塞尔 | 说话本身就是一种行为 | [备选] | 装备 |
| 执行性矛盾 | 哈贝马斯 | 说话行为与内容自相矛盾 | [备选] | 装备 |

### 数学 / 逻辑(4 条)

| 术语 | 流派 | 简介 | 状态 | 建议用途 |
|------|------|------|------|----------|
| 单子 | 莱布尼茨 | 宇宙最小单位,无窗无门 | [备选] | 装备 |
| 预定和谐 | 莱布尼茨 | 身心像两个同步运行的钟 | [备选] | 装备 |
| 充足理由律 | 莱布尼茨 | 任何事都有充分理由 | [备选] | 装备 |
| 自指 | 数理逻辑 | 句子指称自己(说谎者悖论) | [备选] | Boss |

### 思想实验(3 条)

| 术语 | 流派 | 简介 | 状态 | 建议用途 |
|------|------|------|------|----------|
| 缸中之脑 | 怀疑论 | 你怎么确定不是缸中之脑 | [备选] | Boss |
| 玛丽的房间 | 心灵哲学 | (见 F.2) | [备选] | 装备 |
| 中文房间 | 心灵哲学 | 仅仅处理符号是否等于理解 | [备选] | Boss |


### F.3.5 补充流派池(54 条,6 个流派,2026-06 扩充)

#### 古希腊哲学(8 条)

| 术语 | 流派 | 简介 | 状态 | 建议用途 |
|------|------|------|------|----------|
| 洞穴寓言 | 柏拉图 | 囚犯只见墙上影子,误以为真 | [备选] | 怪物/区域 |
| 灵魂三分 | 柏拉图 | 灵魂由理性/意志/欲望三部分组成 | [备选] | 装备 |
| 形式论 | 柏拉图 | 现象背后有永恒不变的"形式" | [备选] | Boss |
| 四因说 | 亚里士多德 | 质料因/形式因/动力因/目的因 | [备选] | 套装 |
| 黄金中道 | 亚里士多德 | 美德是过度与不足之间的中道 | [备选] | 装备 |
| 友爱 | 亚里士多德 | 共同追求善的人之间的友爱 | [备选] | 装备 |
| 流动说 | 赫拉克利特 | 万物皆流,人不能两次踏入同一条河 | [备选] | Boss/装备 |
| 飞矢不动 | 芝诺悖论 | 飞行的箭在每一瞬间都不动 | [备选] | 装备 |

#### 东亚哲学(12 条)

| 术语 | 流派 | 简介 | 状态 | 建议用途 |
|------|------|------|------|----------|
| 缘起 | 佛教 / 龙树 | 万物因缘而生,无独立自性 | [备选] | Boss/区域 |
| 无我 | 佛教 | 五蕴皆空,无永恒自我 | [备选] | 装备 |
| 顿悟 | 禅宗 | 不经渐修,刹那觉悟 | [备选] | 装备 |
| 渐修 | 禅宗 | 长期修行以至觉悟 | [备选] | 装备 |
| 机锋 | 禅宗 | 用突兀语句激发悟性 | [备选] | 装备 |
| 公案 | 禅宗 | 用以参究的经典问题 | [备选] | 装备/技能 |
| 物哀 | 日本美学 | 对无常事物的哀感 | [备选] | 装备 |
| 侘寂 | 日本美学 | 接受不完美与无常的美学 | [备选] | 装备 |
| 天命 | 儒学 | 人应承的天赋使命 | [备选] | 装备 |
| 良知 | 儒学 / 王阳明 | 先天道德判断力 | [备选] | 装备 |
| 无为 | 道家 | 不刻意干预,顺其自然 | [备选] | 装备 |
| 齐物 | 道家 / 庄子 | 取消万物是非对立的分别 | [备选] | Boss |

#### 神秘学 / 神学 / 炼金术(8 条)

| 术语 | 流派 | 简介 | 状态 | 建议用途 |
|------|------|------|------|----------|
| 隐德来希 | 新柏拉图主义 / 亚里士多德 | 推动事物实现其目的的内在力量 | [备选] | 装备 |
| 太一 | 新柏拉图主义 / 普罗提诺 | 万物的终极本原,超越一切 | [备选] | Boss |
| 流溢 | 新柏拉图主义 | 太一依次流溢出现实 | [备选] | Boss |
| 诺斯替 | 早期基督教异端 | 通过知识(gnosis)得救 | [备选] | 区域 |
| 鲁利 | 鲁利之书 | 神收回光为宇宙腾出空间 | [备选] | Boss |
| 赫尔墨斯主义 | 炼金术 | 如上如,如下也如(对应律) | [备选] | 装备 |
| 哲人石 | 炼金术 | 能转化金属的虚构物质 | [备选] | 装备/套装核心 |
| 维吉尔之杖 | 赫尔墨斯 / 金枝 | 分辨真假事物的金质工具 | [备选] | 装备 |

#### 数学基础 / 拓扑 / 范畴论(10 条)

| 术语 | 流派 | 简介 | 状态 | 建议用途 |
|------|------|------|------|----------|
| 流形 | 微分几何 | 局部看起来像欧氏空间的空间 | [备选] | 装备 |
| 同伦 | 拓扑学 | 一个空间被连续变形为另一个的能力 | [备选] | 装备 |
| 范畴 | 范畴论 | 对象和态射的集合 | [备选] | 区域 |
| 函子 | 范畴论 | 范畴之间的结构保持映射 | [备选] | 装备 |
| 自然变换 | 范畴论 | 函子之间保持结构的方式 | [备选] | 装备 |
| 哥德尔数 | 数理逻辑 | 用数编码符号,建立自指 | [备选] | Boss |
| 对角线论证 | 康托尔 / 图灵 | 证明某些集合大于其他集合 | [备选] | Boss |
| 巴别图书馆 | 博尔赫斯 | 包含所有可能书籍的图书馆 | [备选] | Boss/区域 |
| 巴拿赫-塔斯基 | 集合论 | 球可被分割重组成两个等大球 | [备选] | 装备 |
| 测度 | 实分析 | 衡量集合"大小"的方式 | [备选] | 装备 |

#### 现象学 / 解释学扩展(8 条)

| 术语 | 流派 | 简介 | 状态 | 建议用途 |
|------|------|------|------|----------|
| 几何学起源 | 胡塞尔 | 几何学的理想性起源问题 | [备选] | 装备 |
| 被动综合 | 胡塞尔 | 意识被动接受综合的能力 | [备选] | 装备 |
| 联想 | 胡塞尔 / 心理学 | 意识通过相似性/邻近性联结 | [备选] | 装备 |
| 时间意识 | 胡塞尔 | 滞留-当下-前摄的三段结构 | [备选] | 装备 |
| 边缘域 | 胡塞尔 | 意识当前关注之外的背景 | [备选] | 装备 |
| 解释学循环 | 解释学 | 部分与整体相互理解 | [备选] | Boss |
| 前理解 | 伽达默尔 | 解释前已有的视域 | [备选] | 装备 |
| 间距化 | 伽达默尔 | 通过时间距离获得新理解 | [备选] | 装备 |

#### 当代哲学(罗蒂 / 齐泽克 / 阿甘本 / 朗西埃)(8 条)

| 术语 | 流派 | 简介 | 状态 | 建议用途 |
|------|------|------|------|----------|
| 语言学转向 | 罗蒂 / 分析哲学 | 哲学问题归结为语言问题 | [备选] | Boss |
| 偶然性 | 罗蒂 | 真理是社会的偶然产物 | [备选] | 装备 |
| 崇高客体 | 齐泽克 | 拉康式对象,既吸引又无法接近 | [备选] | Boss |
| 意识形态幻象 | 齐泽克 | 主体明知虚假却仍相信 | [备选] | 装备 |
| 神圣人 | 阿甘本 | 法律排除在外、可被杀的人 | [备选] | 怪物 |
| 牲礼 | 阿甘本 / 巴塔耶 | 政治权力的原始机制 | [备选] | Boss |
| 政治美学 | 朗西埃 | 政治是可见性的分配 | [备选] | 装备 |
| 感性分配 | 朗西埃 | 谁的话语被听见、谁被排除 | [备选] | 装备 |


## F.4 弃用词清单(18 条,记入黑名单)

```
以下词因各种原因不纳入游戏,记录在此作为提醒,避免后续再选:
```

### 因"太大众"弃用(8 条)

```
- 薛定谔的猫:虽然冷门度适合 L2,但网络烂梗化严重,弃用
- 中文房间:同上,且更适合作 Boss 而非装备,降级备选
- 缸中之脑:电影《黑客帝国》讲烂,降级备选
- 西西弗斯:加缪入门词,降级备选作 Boss
- 忒修斯之船:思想实验入门词,降级备选
- 帕斯卡赌注:作为 L1 简单怪保留(非弃用)
- 麦克斯韦妖:同忒修斯,降级备选
- 拉普拉斯妖:同上
```

### 因"自创词"弃用(4 条)

```
- 锚定寄生:自创,改用禀赋效应
- 框架效应:与确认偏误撞概念,改用赌徒谬误→ 改为"二元对立"
- 极简主义武器:主义作修饰词,改"极简原则"
- 经验主义增幅:派系名用作属性名,改"经验吸收"
```

### 因"撞概念"弃用(3 条)

```
- 启动残影:与"启动效应"重复,改用"普罗泰戈拉"
- 认知闭合壳:与认知失调撞概念,改用"帕斯卡赌局"
- 沉没成本兽:保留作概念教学,装备池改用新词
```

### 因"装学术"弃用(3 条)

```
- Hyperobject(超级对象):Timothy Morton 当代哲学,网络化术语
- Pharmakon(药毒):德里达经典,但装备效果难设计,延后
- Tulpa(杜尔帕):藏传神秘学,与游戏调性不符
```

## F.5 命名池(可直接抄)

```
此节是 AI 写代码时可直接复制的命名素材库,按"5 套模板"组织。

【模板 A 武器用,概念 + 冷兵器】
  偶因论之钥         物自体之盾       强力意志之冠
  向死存在之靴       意向性指环       生活世界披风
  绝对命令之律       此在之靴         无知之幕面纱
  意志薄弱之环       统觉之眼         明希豪森困境之钥
  现象学还原之镜     阐释学之刃       怀疑论之匕
  唯我论之镜         决定论之锤       二元论双刃
  阐释学之匕         解构之刃         互文性之链
  悬置之契           滞留之环         视域融合之镜
  生命政治长鞭       规训权力之剑     内爆裂隙
  拟像之镜           惯习长靴         共识真理之锤
  目的王国之盾       定命令护符       媚俗之面
  荒诞之灯           恶心护符         自因之心
  实体属性之镜       先天综合之符     图式之环
  智性直观之眼       此在共在之链     良知呼唤之铃
  烦之手             畏之靴           沉沦之锚
  语言图像之刃       私人语言之锁     言语行为之戒
  执行性矛盾之契     单子棱镜         预定和谐钟
  充足理由之钥       自指回环         中文房间终端

【模板 B 防具用,概念 + 身体部位】
  偶因论之钥(已)    恶信面具(备)    全景敞视弩(备)
  此在之靴(已)      向死存在之靴(已) 意志薄弱之环(已)
  物自体之盾(已)    强力意志之冠(已) 意向性指环(已)
  生活世界披风(已)  绝对命令之律(已) 统觉之眼(已)
  悬置护符          滞留之戒        视域融合披风
  阐释学手套        媚俗面具        沉沦长靴
  此在共在之链      良知呼唤铃铛    畏之手套

【模板 C 特殊用,概念 + 抽象容器】
  中文房间终端      巴别图书馆索引   罗素悖论矩阵
  哥德尔裂隙        希尔伯特旅馆前台 玛丽的房间终端
  拉普拉斯妖观测器  麦克斯韦筛网     忒修斯船坞
  单子棱镜          预定和谐终端     自指回环阵
  维也纳证交所      证实原则法庭     阐释学档案

【模板 D 概念本身是动作,概念 + 动作复合】
  凝视护手          默读之唇         失神之瞳
  倾听耳环          注视之眼         沉思之冠
  呼唤之铃          叩问之锤         回响之喉

【模板 E 概念本身是关系,概念 + 自然物】
  沉没成本锁链(原版)
  此在之靴(已)
  意志薄弱之环(已)
  沉沦之锚          畏之深谷        烦之锁链
  视域融合之河      效果历史之流    阐释学之圆
  语用学之网        互文性之网      互文之链
```

## F.6 Boss 池(按"重量级"排序,适合未来扩展)

| 序号 | 概念 | 中文名候选 | 出现层 | 流派 | 备注 |
|------|------|----------|--------|------|------|
| B1 | 此在残响 | 此在残响 | 20 | 海德格尔 | [已用] |
| B2 | 强力意志化身 | 强力意志化身 | 50 | 尼采 | [已用] |
| B3 | 物自体防壁 | 物自体防壁 | 80 | 康德 | [已用] |
| B4 | 明希豪森之结 | 明希豪森之结 | 120 | 认识论 | [已用] |
| B5 | 统觉统一场 | 统觉统一场 | 200 | 康德 | [已用] |
| B6 | 玛丽的房间 | 玛丽的房间 | 60 | 心灵哲学 | [备选] |
| B7 | 中文房间管理员 | 中文房间管理员 | 150 | 心灵哲学 | [备选] |
| B8 | 缸中之脑标本 | 缸中之脑标本 | 180 | 怀疑论 | [备选] |
| B9 | 拉普拉斯妖观测者 | 拉普拉斯妖观测者 | 100 | 科学哲学 | [备选] |
| B10 | 麦克斯韦筛网 | 麦克斯韦筛网 | 130 | 热力学 | [备选] |
| B11 | 罗素悖论矩阵 | 罗素悖论矩阵 | 160 | 集合论 | [备选] |
| B12 | 希尔伯特旅馆前台 | 希尔伯特旅馆前台 | 220 | 数学 | [备选] |
| B13 | 忒修斯船坞 | 忒修斯船坞 | 250 | 思想实验 | [备选] |
| B14 | 哥德尔裂隙(独立) | 哥德尔裂隙 | 280 | 数理逻辑 | [备选] |
| B15 | 维也纳证交所 | 维也纳证交所 | 300 | 逻辑实证主义 | [备选] |
| B16 | 阐释学档案馆 | 阐释学档案馆 | 350 | 解释学 | [备选] |
| B17 | 自指回环阵 | 自指回环阵 | 400 | 数理逻辑 | [备选] |

## F.7 区域 / 系统 / 套装池(待用)

### 区域名(每 50 层 1 个)

| 层数 | 区域名候选 | 流派 | 状态 |
|------|----------|------|------|
| 1-50 | 新手终端 | 系统 | [已用] |
| 51-100 | 现象学回廊 | 现象学 | [备选] |
| 101-150 | 语言废墟 | 语言哲学 | [备选] |
| 151-200 | 规训高塔 | 福柯 | [备选] |
| 201-250 | 悖论裂谷 | 逻辑 | [备选] |
| 251-300 | 解释学密室 | 解释学 | [备选] |
| 301-350 | 心灵盲井 | 心灵哲学 | [备选] |
| 351-400 | 无限旅馆 | 数学 | [备选] |
| 401-450 | 永恒回归环 | 尼采 | [备选] |
| 451-500 | 不可言说之域 | 神秘学 | [备选] |

### 套装名(2 件套以上)

| 套装名 | 包含装备 | 流派 | 状态 |
|--------|---------|------|------|
| 康德批判套装 | 物自体之盾 + 绝对命令之律 + 统觉之眼 | 康德 | [备选] |
| 海德格尔存在套装 | 此在之靴 + 向死存在之靴 + 良知呼唤之铃 | 海德格尔 | [备选] |
| 现象学三件套 | 意向性指环 + 生活世界披风 + 现象学还原之镜 | 胡塞尔 | [备选] |
| 解构套装 | 差延之刃 + 踪迹之匕 + 增补物锚链(均备选) | 德里达 | [备选] |
| 怀疑论套装 | 怀疑论之匕 + 唯我论之镜 + 明希豪森困境之钥 | 怀疑论 | [备选] |

### 系统名(本期实现)

| 系统 | 候选名 | 流派来源 | 状态 |
|------|--------|---------|------|
| 转生 | 重新抛入 / 永恒回归 / 反者道动 | 海德格尔 / 尼采 / 荣格 | [已用] 重新抛入 |
| 离线收益 | 现象学还原 / 悬置 | 胡塞尔 | [备选] |
| 难度选择 | 灾难性回返 / 灾变点 | 突变论 / 海德格尔 | [备选] |
| 大版本 | 纪元更替 / 目的论转折 | 时间哲学 / 亚里士多德 | [备选] |

## F.8 选词 5 条黄金原则

```
1. 第一眼能勾起好奇,但百度第一条能讲清楚
   ❌ Hyperobject(看了不知从哪搜)
   ✅ 明希豪森困境(搜出来就是理发师悖论的升级版)

2. 词必须有机制映射,不能只"听起来酷"
   ❌ Tulpa(机制难设计)
   ✅ 统觉(暴击 = "我思"贯穿一切表象)

3. 优先选"流派代表性词",不选"流派下属词"
   ❌ 沉没成本(行为经济学下属)
   ✅ 偶因论(马勒伯朗士哲学的代表作)

4. 跨学科词优先于单一学科词
   ❌ 唯我论(纯哲学)
   ✅ 证实原则(逻辑 + 哲学 + 语言三重)

5. 词必须有"画面意象"
   ❌ 共识真理(抽象)
   ✅ 巴别图书馆索引(具体到可以画插画)
```

---

# 文档结束语(更新版)

这份文档已经覆盖:

```
- 0 节:致 AI 的一段话(契约性质)
- 1 节:核心定位
- 2 节:技术栈
- 3 节:命名规则(含 5 套模板)
- 4 节:核心数据契约
- 5 节:数值公式(单一真相源)
- 6 节:装备系统(含 12 件 MVP + 命名词汇分离)
- 7 节:怪物系统(含 17 个 MVP)
- 8 节:战斗循环
- 9 节:UI 规范
- 10 节:反模式清单
- 11 节:AI 开发阶段
- 12 节:验收清单
- 13-16 节:风格/部署/越界/反馈
- 附录 A:12 件装备完整数据
- 附录 B:17 条概念库
- 附录 C:词缀池
- 附录 D:扩展阶段清单
- 附录 E:第一阶段 AI 提示词
- 附录 F:可扩展名词池(L1/L2/L3 + Boss + 区域 + 套装 + 系统)
```

AI 看完后,应该已经知道:

```
- 不能写"存在主义之剑" ✅
- 写"偶因论之钥"且 effect 体现"中介延后" ✅
- 数值公式在 constants.js,不要在 ui 渲染里写死 ✅
- 5 层出精英、10 层出 Boss,不要自己改节奏 ✅
- 装备/怪物命名灵感见附录 F,按 L1/L2/L3 选用 ✅
- [已用] 词不可重复;[备选] 词可直接使用;[弃用] 词禁止使用 ✅
```

如果你还有疑问,在文档里搜"MUST"或"MUST NOT",你会找到所有硬约束。
如果需要新装备/怪物命名灵感,见附录 F「可扩展名词池」。

祝你开发顺利,愿你在终端中反抗虚无。

— 文档维护者
