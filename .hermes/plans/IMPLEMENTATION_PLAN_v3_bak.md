# 《存在终端 Terminal of Being》完整实施计划

> **For Hermes:** 此计划与 `GAME_DESIGN.md` (v3.0) 配套,按阶段推进,每个阶段独立可验证。
> **设计文档:** `~/Desktop/game/存在终端/GAME_DESIGN.md`
> **本计划:** `~/Desktop/game/存在终端/.hermes/plans/IMPLEMENTATION_PLAN.md`

**Goal:** 用纯 HTML + CSS + 原生 JS 实现一个挂机刷宝 RPG,玩家在 ASCII 横版终端世界中自动战斗、刷概念装备、推进层数。

**Architecture:** 单一 SPA,无构建工具。所有状态在内存 + localStorage。Canvas 2D 渲染战斗动画,DOM 渲染 HUD/日志/背包。主循环用 requestAnimationFrame。

**Tech Stack:** HTML5 + ES2020+ JavaScript (modules) + Canvas 2D + localStorage。无 npm 依赖、无构建工具。

---

## 总体节奏(6 个阶段,每个独立可运行)

| 阶段 | 目标 | 代码量估计 | 关键交付 |
|------|------|----------|----------|
| **0 脚手架** | 能跑,玩家和敌人互打 | ~300 行 | 5 个文件 + index.html |
| **1 数值系统** | 升级、属性聚合、推进层数 | ~400 行 | constants.js + stats.js + progression.js |
| **2 战斗完整化** | 暴击、闪避、5/10 层精英/Boss | ~300 行 | combat.js 完整 + enemies 数据 |
| **3 装备系统** | 掉落、背包、穿戴、聚合 | ~600 行 | items.js + affixes.js + loot.js + equipment.js + inventory UI |
| **4 UI 打磨** | Canvas 战斗动画、伤害飘字、详情弹窗、导入导出 | ~400 行 | render.js + 详情弹窗 + 设置页 |
| **5 测试部署** | 玩通 50 层、README、GitHub Pages | ~200 行 | 测试 + README |

**总代码量:** ~2200 行 JS + ~200 行 CSS + 1 个 HTML

---

# 阶段 0:脚手架(必须先做完)

**Objective:** 让 `index.html` 能在浏览器打开,显示玩家 `@` 和敌人 `?` 互打,死一个 spawn 新的,刷新存档不丢。

## Task 0.1:创建项目目录结构

**Files:**
- Create: 项目根目录 + 子目录

**Step 1:** 在 `~/Desktop/game/存在终端/` 下创建子目录

```bash
mkdir -p js/core js/data js/systems js/ui assets
```

**Step 2:** 验证目录存在

```bash
ls -la ~/Desktop/game/存在终端/js/
```

Expected: 显示 `core/ data/ systems/ ui/ assets/` 4 个子目录。

## Task 0.2:写 `js/core/state.js`

**Files:**
- Create: `js/core/state.js`

**Step 1:** 创建文件,内容如下:

```js
// js/core/state.js
// 全局游戏状态(单一对象)。所有系统共享此状态。

export const initialState = () => ({
  // 玩家基础属性
  player: {
    level: 1,
    exp: 0,
    expToNext: 20,
    gold: 0,

    // 当前生命/法力
    hp: 100,
    mp: 30,

    // 基础属性(MVP 阶段固定)
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
  },

  // 进度
  stage: 1,
  bestStage: 1,

  // 当前敌人
  currentEnemy: null,

  // 背包与装备(MVP 阶段空)
  inventory: [],
  equipment: {
    weapon: null, head: null, chest: null,
    gloves: null, boots: null,
    ring: [null, null],
    amulet: null, charm: null, core: null,
  },

  // 已解锁概念(MVP 仅记录,不展示)
  unlockedCodex: [],

  // 日志(最多 50 条)
  logs: [],

  // 设置
  settings: { soundOn: false, animationOn: true },

  // 上次保存时间戳
  savedAt: Date.now(),
});

// 全局 state 引用(由 main.js 赋值)
export let state = initialState();
export const setState = (newState) => { state = newState; };
```

**Step 2:** 验证文件可被 Node 加载

```bash
cd ~/Desktop/game/存在终端 && node -e "import('./js/core/state.js').then(m => console.log('OK:', Object.keys(m.initialState()).length, 'top-level keys'))"
```

Expected: `OK: 10 top-level keys`

## Task 0.3:写 `js/core/save.js`

**Files:**
- Create: `js/core/save.js`

**Step 1:** 创建文件:

```js
// js/core/save.js
// localStorage 存档读写 + 版本迁移
import { initialState, state, setState } from './state.js';

export const SAVE_KEY = 'terminal_of_being_save_v1';
export const SAVE_VERSION = 1;

export function saveGame() {
  try {
    const data = { version: SAVE_VERSION, ...state, savedAt: Date.now() };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('存档失败:', e);
    return false;
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (data.version !== SAVE_VERSION) {
      console.warn('存档版本不匹配,清空');
      localStorage.removeItem(SAVE_KEY);
      return false;
    }
    setState(data);
    return true;
  } catch (e) {
    console.error('读档失败:', e);
    return false;
  }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
  setState(initialState());
}
```

**Step 2:** 验证(在浏览器测试,或临时 Node 模拟)

```bash
cd ~/Desktop/game/存在终端 && node -e "
import('./js/core/save.js').then(m => {
  console.log('SAVE_KEY:', m.SAVE_KEY);
  console.log('SAVE_VERSION:', m.SAVE_VERSION);
  console.log('saveGame type:', typeof m.saveGame);
});
"
```

Expected: 输出 3 行,类型为 function。

## Task 0.4:写 `js/main.js`(最简战斗循环)

**Files:**
- Create: `js/main.js`

**Step 1:** 创建文件:

```js
// js/main.js
// 入口 + 主循环 + 最简战斗循环(MVP 阶段 0)

import { state, initialState, setState } from './core/state.js';
import { loadGame, saveGame } from './core/save.js';

// ---------- 初始化 ----------
function init() {
  if (!loadGame()) {
    setState(initialState());
  }
  spawnEnemy();
  bindUI();
  requestAnimationFrame(loop);
}

// ---------- 敌人 ----------
function spawnEnemy() {
  state.currentEnemy = {
    name: '我思故我在',
    symbol: '?',
    stats: {
      hp: 30 * Math.pow(state.stage, 1.35),
      maxHp: 30 * Math.pow(state.stage, 1.35),
      atk: 4 * Math.pow(state.stage, 1.18),
      def: 1 + Math.pow(state.stage, 1.05),
      aspd: 0.8,
    },
  };
  log(`遭遇:${state.currentEnemy.name}`);
}

function onEnemyDeath() {
  state.stage += 1;
  if (state.stage > state.bestStage) state.bestStage = state.stage;
  log(`击杀 ${state.currentEnemy.name},进入第 ${state.stage} 层`);
  spawnEnemy();
}

function onPlayerDeath() {
  state.stage = Math.max(1, state.stage - 5);
  state.player.hp = state.player.maxHp;
  state.player.mp = state.player.maxMp;
  log(`[死亡] 回到第 ${state.stage} 层`);
  spawnEnemy();
}

// ---------- 战斗 ----------
function playerAttack() {
  const e = state.currentEnemy.stats;
  const p = state.player;
  const dmg = Math.max(1, p.atk - e.def * 0.5);
  e.hp -= dmg;
  log(`@ 攻击 ${state.currentEnemy.name},造成 ${dmg.toFixed(1)} 伤害`);
}

function enemyAttack() {
  const e = state.currentEnemy.stats;
  const p = state.player;
  const dmg = Math.max(1, e.atk - p.def * 0.5);
  p.hp -= dmg;
  log(`${state.currentEnemy.name} 攻击 @,造成 ${dmg.toFixed(1)} 伤害`);
}

// ---------- 主循环 ----------
let lastTime = performance.now();
let playerTimer = 0, enemyTimer = 0;

function loop(now) {
  const delta = Math.min(now - lastTime, 100);
  lastTime = now;

  playerTimer += delta;
  enemyTimer += delta;

  // 玩家攻击间隔 = 1000 / aspd 毫秒
  if (playerTimer >= 1000 / state.player.aspd) {
    playerAttack();
    playerTimer = 0;
  }

  // 敌人攻击间隔
  if (enemyTimer >= 1000 / state.currentEnemy.stats.aspd) {
    enemyAttack();
    enemyTimer = 0;
  }

  // 死亡判定
  if (state.currentEnemy.stats.hp <= 0) onEnemyDeath();
  if (state.player.hp <= 0) onPlayerDeath();

  render();
  requestAnimationFrame(loop);
}

// ---------- 渲染 ----------
function render() {
  const e = state.currentEnemy.stats;
  const p = state.player;

  document.getElementById('enemy-name').textContent = state.currentEnemy.name;
  document.getElementById('enemy-symbol').textContent = state.currentEnemy.symbol;
  document.getElementById('enemy-hp').textContent = `${e.hp.toFixed(0)} / ${e.maxHp.toFixed(0)}`;

  document.getElementById('player-hp').textContent = `${p.hp.toFixed(0)} / ${p.maxHp}`;
  document.getElementById('player-mp').textContent = `${p.mp.toFixed(0)} / ${p.maxMp}`;

  document.getElementById('stage').textContent = state.stage;
  document.getElementById('level').textContent = p.level;
  document.getElementById('gold').textContent = p.gold;
  document.getElementById('exp').textContent = p.exp;

  const logBox = document.getElementById('log');
  logBox.innerHTML = state.logs.slice(-50).map(l => `<div>[${new Date(l.t).toLocaleTimeString()}] ${l.msg}</div>`).join('');
  logBox.scrollTop = logBox.scrollHeight;
}

// ---------- 日志 ----------
function log(msg) {
  state.logs.push({ t: Date.now(), msg });
  if (state.logs.length > 50) state.logs.shift();
}

// ---------- UI 绑定 ----------
function bindUI() {
  document.getElementById('btn-save').onclick = () => {
    saveGame();
    log('[系统] 已保存');
  };
  document.getElementById('btn-clear').onclick = () => {
    if (confirm('清空存档?')) {
      localStorage.removeItem('terminal_of_being_save_v1');
      location.reload();
    }
  };

  // 自动保存每 10 秒
  setInterval(saveGame, 10000);
}

// ---------- 启动 ----------
init();
```

## Task 0.5:写 `index.html`

**Files:**
- Create: `index.html`

**Step 1:** 创建文件:

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>存在终端 Terminal of Being</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<div id="app">
  <!-- 顶部 HUD -->
  <header id="hud">
    <div class="hud-row">
      <span>LV <b id="level">1</b></span>
      <span>EXP <b id="exp">0</b></span>
      <span>STAGE <b id="stage">1</b></span>
      <span>金币 <b id="gold">0</b></span>
    </div>
    <div class="hud-row">
      <span>HP <b id="player-hp">100/100</b></span>
      <span>MP <b id="player-mp">30/30</b></span>
    </div>
  </header>

  <!-- 战斗区 -->
  <main id="combat">
    <div class="combat-stage">
      <div class="player-side">
        <div class="ascii">@</div>
        <div class="bar hp-bar"><span id="player-hp-bar"></span></div>
      </div>
      <div class="vs">VS</div>
      <div class="enemy-side">
        <div class="ascii" id="enemy-symbol">?</div>
        <div class="enemy-info">
          <div id="enemy-name">我思故我在</div>
          <div class="bar hp-bar"><span id="enemy-hp-bar"></span></div>
          <div class="hp-text" id="enemy-hp">30 / 30</div>
        </div>
      </div>
    </div>
  </main>

  <!-- 日志 -->
  <section id="log"></section>

  <!-- 底部按钮 -->
  <footer id="footer">
    <button id="btn-save">[保存]</button>
    <button id="btn-clear">[清空]</button>
  </footer>
</div>

<script type="module" src="js/main.js"></script>
</body>
</html>
```

## Task 0.6:写 `style.css`

**Files:**
- Create: `style.css`

**Step 1:** 创建文件:

```css
/* style.css - 终端风格 */

:root {
  --bg: #0a0a0a;
  --fg: #00ff88;
  --white: #ffffff;
  --yellow: #ffaa00;
  --red: #ff4444;
  --gray: #888;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  background: var(--bg);
  color: var(--fg);
  font-family: 'Consolas', 'Monaco', monospace;
  height: 100%;
  overflow: hidden;
}

#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 900px;
  margin: 0 auto;
  padding: 8px;
}

/* HUD */
#hud {
  border: 1px solid var(--fg);
  padding: 8px 12px;
  font-size: 14px;
  background: rgba(0, 255, 136, 0.05);
}
.hud-row {
  display: flex;
  gap: 24px;
  margin-bottom: 4px;
}
.hud-row:last-child { margin-bottom: 0; }
#hud b { color: var(--yellow); }

/* 战斗区 */
#combat {
  flex: 0 0 auto;
  height: 240px;
  border: 1px solid var(--fg);
  border-top: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 255, 136, 0.02);
}
.combat-stage {
  display: flex;
  align-items: center;
  gap: 32px;
  font-size: 32px;
}
.ascii {
  font-size: 48px;
  text-shadow: 0 0 8px var(--fg);
  min-width: 60px;
  text-align: center;
}
.vs { color: var(--gray); font-size: 16px; }
.enemy-info { font-size: 14px; }
.enemy-info div:first-child { color: var(--white); margin-bottom: 4px; }
.bar {
  display: inline-block;
  width: 120px;
  height: 8px;
  background: var(--gray);
  margin-top: 4px;
}
.bar span {
  display: block;
  height: 100%;
  background: var(--fg);
  transition: width 0.1s;
}
.hp-text { font-size: 11px; color: var(--gray); }

/* 日志 */
#log {
  flex: 1;
  border: 1px solid var(--fg);
  border-top: none;
  padding: 8px 12px;
  font-size: 12px;
  overflow-y: auto;
  color: var(--white);
  min-height: 100px;
  max-height: 200px;
}
#log div { line-height: 1.6; }

/* 底部 */
#footer {
  border: 1px solid var(--fg);
  border-top: none;
  padding: 8px;
  display: flex;
  gap: 8px;
  background: rgba(0, 255, 136, 0.05);
}
button {
  background: transparent;
  color: var(--fg);
  border: 1px solid var(--fg);
  padding: 4px 12px;
  font-family: inherit;
  cursor: pointer;
  font-size: 13px;
}
button:hover { background: var(--fg); color: var(--bg); }
```

## Task 0.7:浏览器验证阶段 0

**Files:** (none, verification)

**Step 1:** 用浏览器打开 `index.html`

```bash
# Windows
start ~/Desktop/game/存在终端/index.html
# 或 Mac
open ~/Desktop/game/存在终端/index.html
```

**Step 2:** 视觉验收
- [ ] 页面无白屏、无报错
- [ ] 看到顶部 HUD 显示 LV 1 / EXP 0 / STAGE 1 / HP 100
- [ ] 看到中间 `@` vs `?` 战斗画面
- [ ] 看到敌人血量随攻击减少
- [ ] 看到日志滚动

**Step 3:** 控制台验收
- 打开 DevTools (F12),Console 标签
- [ ] 无任何 error / warning
- [ ] 输入 `JSON.parse(localStorage.getItem('terminal_of_being_save_v1'))` 返回存档对象

**Step 4:** 刷新测试
- [ ] 刷新页面后,玩家和敌人继续从原状态战斗
- [ ] 点 `[清空]` → 确认 → 刷新后状态归零

**Step 5:** Commit(可选)

```bash
cd ~/Desktop/game/存在终端 && git init && git add . && git commit -m "feat: 阶段 0 脚手架,最简战斗循环 + 存档"
```

---

# 阶段 1:数值系统(400 行)

**Objective:** 实现完整属性聚合、升级、层数推进。

## Task 1.1:创建 `js/constants.js`

**Files:**
- Create: `js/constants.js`

```js
// js/constants.js - 所有数值常量,单一真相源

export const PLAYER_BASE_STATS = {
  maxHp: 100, maxMp: 30, atk: 10, def: 2,
  aspd: 1.0, crit: 0.05, critDmg: 1.5,
  dodge: 0, block: 0, luck: 0,
  itemFind: 0, rarityFind: 0,
  expGain: 0, goldGain: 0,
  lifesteal: 0, cooldownRed: 0,
};

export const ELITE_INTERVAL = 5;
export const BOSS_INTERVAL = 10;
export const DEATH_RETREAT = 5;

// 升级公式
export const expToNext = (level) => Math.floor(20 * Math.pow(level, 1.45));

// 升级成长
export const levelUpGain = {
  maxHp: 10, atk: 2, def: 1, maxMp: 2,
};

// 敌人缩放
export const scaleEnemy = (stage, type = 'normal') => {
  const factor = type === 'boss' ? 10 : type === 'elite' ? 3 : 1;
  const atkFactor = type === 'boss' ? 2.5 : type === 'elite' ? 1.8 : 1;
  const defFactor = type === 'boss' ? 2 : type === 'elite' ? 1.5 : 1;
  return {
    hp: 30 * Math.pow(stage, 1.35) * factor,
    atk: 4 * Math.pow(stage, 1.18) * atkFactor,
    def: (1 + Math.pow(stage, 1.05)) * defFactor,
    aspd: type === 'boss' ? 0.6 : type === 'elite' ? 1.0 : 0.8,
    exp: 5 * Math.pow(stage, 1.15) * (type === 'boss' ? 10 : type === 'elite' ? 3 : 1),
    gold: 3 * Math.pow(stage, 1.10) * (type === 'boss' ? 10 : type === 'elite' ? 3 : 1),
  };
};

// 稀有度权重
export const RARITY_WEIGHTS = {
  common: 650, magic: 250, rare: 80,
  epic: 18, legendary: 2, mythic: 0.2,
};
```

## Task 1.2:创建 `js/systems/stats.js`

**Files:**
- Create: `js/systems/stats.js`

```js
// js/systems/stats.js - 属性聚合(基础 + 装备词缀)

import { PLAYER_BASE_STATS } from '../constants.js';
import { state } from '../core/state.js';

export function aggregateStats(player, equipment) {
  // MVP 阶段:装备还没实现,直接返回基础属性
  const stats = { ...PLAYER_BASE_STATS };
  // 加上玩家升级加成
  stats.maxHp = player.maxHp;
  stats.maxMp = player.maxMp;
  stats.atk = player.atk;
  stats.def = player.def;
  stats.aspd = player.aspd;
  // 其他属性直接拷贝
  stats.crit = player.crit;
  stats.critDmg = player.critDmg;
  stats.dodge = player.dodge;
  stats.block = player.block;
  stats.luck = player.luck;
  stats.itemFind = player.itemFind;
  stats.rarityFind = player.rarityFind;
  stats.expGain = player.expGain;
  stats.goldGain = player.goldGain;
  stats.lifesteal = player.lifesteal;
  stats.cooldownRed = player.cooldownRed;
  return stats;
}
```

## Task 1.3:创建 `js/systems/progression.js`

**Files:**
- Create: `js/systems/progression.js`

```js
// js/systems/progression.js - 升级与层数推进

import { state } from '../core/state.js';
import { expToNext, levelUpGain, ELITE_INTERVAL, BOSS_INTERVAL, scaleEnemy } from '../constants.js';

export function gainExp(amount) {
  const effective = amount * (1 + state.player.expGain);
  state.player.exp += effective;
  while (state.player.exp >= state.player.expToNext) {
    levelUp();
  }
}

function levelUp() {
  state.player.exp -= state.player.expToNext;
  state.player.level += 1;
  state.player.maxHp += levelUpGain.maxHp;
  state.player.maxMp += levelUpGain.maxMp;
  state.player.atk += levelUpGain.atk;
  state.player.def += levelUpGain.def;
  state.player.expToNext = expToNext(state.player.level);
  state.player.hp = state.player.maxHp; // 升级回满
  state.logs.push({ t: Date.now(), msg: `[升级] Lv ${state.player.level}` });
}

export function gainGold(amount) {
  const effective = amount * (1 + state.player.goldGain);
  state.player.gold += Math.floor(effective);
}

export function determineEnemyType(stage) {
  if (stage % BOSS_INTERVAL === 0) return 'boss';
  if (stage % ELITE_INTERVAL === 0) return 'elite';
  return 'normal';
}

export function nextStage() {
  state.stage += 1;
  if (state.stage > state.bestStage) state.bestStage = state.stage;
}
```

## Task 1.4:在 `main.js` 中接入新系统

**Files:**
- Modify: `js/main.js`

修改 `playerAttack`、`enemyAttack`、`onEnemyDeath`、`spawnEnemy`,使用 progression/stats 模块。

(完整代码见阶段 1 提交时的 main.js 更新)

## Task 1.5:浏览器验证阶段 1

**Verification:**
- [ ] 击败敌人获得 exp / gold
- [ ] exp 满后升级,HP/MP/ATK 提升
- [ ] 5 层出精英(敌人血量 ×3)
- [ ] 10 层出 Boss(敌人血量 ×10)
- [ ] 控制台无 error

---

# 阶段 2:战斗完整化(300 行)

**Objective:** 暴击、闪避、敌人数据。

## Task 2.1:创建 `js/data/enemies.js`

**Files:**
- Create: `js/data/enemies.js`

包含 17 个敌人(10 普通 + 2 精英 + 5 Boss)的数据。完整内容参考 `GAME_DESIGN.md` 附录 B 的 17 个概念 + 7.1 怪物表。

```js
// js/data/enemies.js - 敌人模板
export const ENEMIES = [
  { id: 'protag_measure', name: '人是万物的尺度', symbol: 'π', type: 'normal', stageRange: [1, 999], dropChance: 0.08, conceptId: 'protagoras' },
  { id: 'cogito_ghost', name: '我思故我在', symbol: '©', type: 'normal', stageRange: [1, 30], dropChance: 0.08, conceptId: 'cogito' },
  // ... 15 more, 详见设计文档
  { id: 'apperception_field', name: '统觉统一场', symbol: 'A', type: 'boss', stageRange: [200], dropChance: 1.0, conceptId: 'apperception' },
];

export function pickEnemy(stage) {
  const type = stage % 10 === 0 ? 'boss' : stage % 5 === 0 ? 'elite' : 'normal';
  const candidates = ENEMIES.filter(e => e.type === type && e.stageRange[0] <= stage && (e.stageRange[1] === 999 || e.stageRange[1] >= stage));
  if (candidates.length === 0) return ENEMIES[0];
  return candidates[Math.floor(Math.random() * candidates.length)];
}
```

## Task 2.2:在 `combat.js` 中实现暴击/闪避

暴击和闪避公式已在 `GAME_DESIGN.md` 5.4 节定义。

## Task 2.3:验证

- [ ] 玩家暴击数字变黄、闪避时 log 显示
- [ ] 5/10 层正确切换精英/Boss
- [ ] Boss 战死获得 10x 经验

---

# 阶段 3:装备系统(600 行,最大阶段)

**Objective:** 掉落、背包、穿戴、属性聚合。

## Task 3.1:创建 `js/data/affixes.js`(20 个词缀)
## Task 3.2:创建 `js/data/items.js`(12 件装备模板,完整数据)
## Task 3.3:创建 `js/systems/loot.js`(掉落判定)
## Task 3.4:创建 `js/systems/equipment.js`(穿戴/卸下)
## Task 3.5:创建 `js/ui/inventory.js`(背包面板 + 详情弹窗)
## Task 3.6:在 main.js 接入

完整代码参考设计文档附录 A(12 件装备数据)+ 6.4 装备生成流程。

---

# 阶段 4:UI 打磨(400 行)

## Task 4.1:Canvas 战斗动画(攻击挥动、伤害飘字)
## Task 4.2:装备详情弹窗(完整 9.3 节布局)
## Task 4.3:设置页(导入导出 JSON)
## Task 4.4:数值格式化(1.2K / 3.5M)

---

# 阶段 5:测试与部署(200 行)

## Task 5.1:玩通 50 层不报错
## Task 5.2:写 README.md
## Task 5.3:GitHub Pages 部署

```bash
cd ~/Desktop/game/存在终端
git init
git add .
git commit -m "feat: Terminal of Being MVP"
gh repo create terminal-of-being --public --source=. --push
# 启用 Pages: Settings > Pages > Source: main / (root)
```

---

# 关键里程碑

| 里程碑 | 完成标准 | 预计总代码 |
|--------|----------|-----------|
| M0 脚手架 | 浏览器看到战斗 | ~300 行 |
| M1 数值 | 升级、5/10 层精英 Boss | ~700 行 |
| M2 战斗 | 暴击闪避、17 个敌人 | ~1000 行 |
| M3 装备 | 12 件装备可穿戴、掉率生效 | ~1600 行 |
| M4 UI 打磨 | Canvas 动画、详情弹窗、导入导出 | ~2000 行 |
| M5 部署 | GitHub Pages 上线、README 写完 | ~2200 行 |

---

# 不做的事(YAGNI)

- ❌ 单元测试框架(纯 JS 太重,改为手动浏览器验证)
- ❌ TypeScript(设计文档 JS JSDoc 已足够)
- ❌ 构建工具(无 Vite/Webpack,直接打开 index.html)
- ❌ 任何外部依赖(无 npm、无 CDN)
- ❌ 后端 / 网络请求(纯静态)
- ❌ 图鉴 UI(只存 unlockedCodex 数据)
- ❌ 手动技能(UI 占位,不实现)
- ❌ 转生 / 离线(本期不做)

---

# 风险与备选

| 风险 | 备选方案 |
|------|----------|
| 数值崩坏(玩家 1 级秒 Boss) | 5.3 公式保证 stage=10 的 Boss 需要 ~10 回合击杀 |
| Canvas 性能差 | 退化为 DOM 改 className(第 9.1 节已说明) |
| localStorage 容量爆 | 装备 uid 改用短 hash,只保存必要字段 |
| AI 输出格式错乱 | 严格按本计划的代码块,字符级复制 |

---

# 文档结束

按本计划执行,预计 6 个阶段、每阶段 30 分钟到 2 小时,总共 1-2 天可以完成 MVP。
