# 《存在终端》前端代码审查报告

> 审查标准：企业级前端开发规范（12 大类）
> 审查日期：2026-06-22
> 审查范围：全部 20 个 JS 文件 + index.html + style.css
> 修复日期：2026-06-22 v8.2

---

## 审查结果总览

| 规范类别 | 通过 | 违规 | 跳过 |
|---------|------|------|------|
| 1. 项目目录 | ✅ | — | — |
| 2. 命名规范 | ✅ | ~~3 处~~ ✅ 已修 | — |
| 3. HTML 规范 | — | ~~4 处~~ ✅ 已修 | — |
| 4. CSS 规范 | ✅ | ~~2 处~~ ✅ 已修 | — |
| 5. JS 规范 | ✅ | ~~8 处~~ ✅ 已修 | — |
| 6. TS 规范 | — | — | 跳过（纯 JS 项目） |
| 7. Vue/React | — | — | 跳过（无框架） |
| 8. Git 规范 | — | 1 处（流程改进） | — |
| 9. ESLint/Prettier | ✅ 已添加 | — | — |
| 10. 性能 | ✅ | ~~3 处~~ ✅ 已修 | — |
| 11. 安全 | ✅ | ~~3 处~~ ✅ 已修 | — |
| 12. 其他 | ✅ | ~~2 处~~ ✅ 已修 | — |

**严重程度分布**：🔴 P0（必须修）5 项 ✅ 全部修复 / 🟡 P1（应该修）10 项 ✅ 已修复 8 项 / 🟢 P2（建议修）7 项 ✅ 已修复 5 项

---

## 🔴 P0 — 必须修复（影响功能/安全）

### 1. ✅ XSS 漏洞：innerHTML 注入未过滤

**修复**：创建 `js/utils/html.js` 导出 `escapeHtml()` 函数。在 inventory.js、hud.js、codex.js 所有 innerHTML 拼接处使用 `escapeHtml()` 转义动态文本。

### 2. ✅ inline onclick + window 全局函数绑定

**修复**：inventory.js 和 codex.js 全部改为 `addEventListener` 事件委托 + `data-*` 属性 + `data-action` 分发。删除所有 `window._inv*` 和 `window._codex*` 全局函数。

### 3. ✅ confirm() 阻塞 UI

**修复**：main.js 新增 `customConfirm()` 函数，返回 Promise。index.html 添加自定义模态框 HTML，style.css 添加模态框样式。`btn-clear` 按钮改用 `async/await` 调用 `customConfirm()`。

### 4. ✅ 无存档数据校验

**修复**：save.js 新增 `validateSaveData()` 函数，加载存档后校验结构：player 对象必须存在、数值字段用 Number() 强制转换、数组字段用 Array.isArray() 校验、对象字段用展开运算符补全缺省值。校验失败自动清空存档。

### 5. ✅ 无 ESLint / Prettier 配置

**修复**：添加 `.eslintrc.json`（ES2022 module 环境，禁止 confirm()、no-undef、no-dupe-imports 等）和 `.prettierrc`（单引号、100 宽度、ES5 尾逗号）。

---

## 🟡 P1 — 应该修复（代码质量/可维护性）

### 6. ✅ 重复 import（已修但根因未除）

**修复**：main.js 将两条从 combat.js 的 import 合并为一条：
```js
import { hitEnemy, getTimeScale, damageEnemy, damagePlayer, registerCombatLog, flushBossDamageBuffer } from './systems/combat.js';
```

### 7. ⏳ 循环依赖通过回调注入解决——脆弱模式

**状态**：暂保留现有回调注入模式。后续迭代可引入事件总线。当前 3 处回调注入（registerGetStats / registerCallbacks / registerCombatLog）在 init() 中有明确调用顺序，且有 init() try/catch 错误边界保护。

### 8. ✅ 魔法数字泛滥

**修复**：constants.js 新增 30+ 个命名常量（MELEE_RANGE、HIT_STUN_MS、CRIT_KNOCKBACK、DYING_TIMER_MS、KILL_PARTICLE_COUNT、BOSS_BAR_WIDTH 等）。main.js 和 combat.js 中所有裸数字已替换为常量引用。

### 9. ✅ export let state — 可变导出绑定

**修复**：state.js 改为 `export const state = initialState()`，`setState` 改为 `mergeState(partial)` 使用 `Object.assign()` 合并属性而非替换整个对象。main.js 和 save.js 中的 `setState` 调用全部改为 `mergeState`。

### 10. ✅ Canvas 硬编码颜色，不与 CSS 变量联动

**修复**：renderer.js 新增 CSS 变量缓存系统（`getColor()` / `getColorAlpha()` / `refreshColorCache()`），通过 `getComputedStyle` 读取 `--bg-panel`、`--dim`、`--red`、`--amber`、`--green-bright` 等变量。所有结构性颜色（清屏背景、地面线、敌人类型颜色、血条颜色）已改用 CSS 变量。

### 11. ✅ 每帧 filter 创建新数组

**修复**：main.js 新增 `inPlaceCleanup(arr, keepFn)` 函数，用双指针原地清理替代 6 次 `filter()` 调用。每帧不再创建新数组。

### 12. ✅ 日志全量重渲染

**修复**：hud.js `updateLog()` 改为增量渲染：只追加新日志的 DOM 节点，超过 50 条时移除最旧的。仅在日志被 shift（超过 80 条）或首次渲染时全量重建。

### 13. ✅ 无错误边界

**修复**：main.js `init()` 外层加 try/catch，失败时在 #app 中显示「系统初始化失败」错误提示，不再静默黑屏。

### 14. ⏳ Git 提交信息不规范

**状态**：流程改进项。后续提交将使用 `type(scope): content` 格式。

### 15. ✅ setInterval 无清理

**修复**：main.js 保存 `_saveIntervalId`，在 `beforeunload` 事件中 `clearInterval`。

---

## 🟢 P2 — 建议修复（锦上添花）

### 16. ✅ CSS user-select: none 全局禁用

**修复**：从 `html, body` 移除 `user-select: none`。改为仅在交互元素（#hud、#terminal-titlebar、#footer、#combat-canvas、.overlay-panel）上禁用。日志区域和详情面板允许文本选中。

### 17. ✅ renderer.js 中 textAlign 重复设置

**修复**：删除 Boss 阶段名称渲染后的重复 `ctx.textAlign = 'left'`。

### 18. ✅ 函数命名过于宽泛

**修复**：hud.js 中 `label` → `getStatLabel`、`shortLabel` → `getStatShortLabel`、`tooltip` → `getStatTooltip`。

### 19. ✅ 无 favicon

**修复**：index.html 添加内联 SVG favicon（`<link rel="icon" href="data:image/svg+xml,...">`），避免 404。

### 20. ✅ 无 viewport meta 的 maximum-scale

**修复**：`user-scalable=no` 改为 `maximum-scale=1.0` 软限制。

### 21. ⏳ 无单元测试

**状态**：后续迭代添加。建议优先测试 loot.js 的 `rollRarity()`、equipment.js 的 `equipItem()`、save.js 的 `validateSaveData()`。

### 22. ⏳ 缺少 JSDoc 类型标注

**状态**：部分核心函数（damageEnemy、customConfirm、mergeState、validateSaveData）已添加 JSDoc。后续迭代补充全部 export 函数。

---

## 修复统计

| 优先级 | 总计 | 已修复 | 待办 |
|--------|------|--------|------|
| P0     | 5    | 5 ✅   | 0    |
| P1     | 10   | 8 ✅   | 2 ⏳ |
| P2     | 7    | 5 ✅   | 2 ⏳ |
| **合计** | **22** | **18 ✅** | **4 ⏳** |

### 待办 4 项说明
- #7 回调注入改事件总线 — 架构级重构，当前可用，后续迭代
- #14 Git 提交规范 — 流程改进，非代码修复
- #21 单元测试 — 需引入测试框架，后续迭代
- #22 JSDoc 全量标注 — 核心函数已标注，其余后续补充

---

*本报告基于 v0.7 代码库审查，v8.2 完成修复。*
