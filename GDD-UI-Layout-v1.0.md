# GDD — UI 布局优化方案 v1.0
## 存在终端 Terminal of Being

| 字段 | 值 |
|------|-----|
| 文档版本 | v1.0 |
| 日期 | 2026-06-24 |
| 作者 | GameDesigner |
| 状态 | 待审核 |
| 涉及文件 | `index.html`, `style.css` |

---

## 1. 设计支柱（Design Pillars）

本次布局优化必须服务于以下非协商性体验目标：

| 支柱 | 描述 |
|------|------|
| **游戏画面优先** | 画布是核心反馈区，信息面板不得挤压画面 |
| **信息密度最大化** | 终端风格天生适合高密度信息，浪费像素 = 浪费认知效率 |
| **功能优先级可视化** | 常用功能（F1-F3）与工具功能（F4-F7）必须有视觉权重差异 |
| **零干扰阅读** | 日志是 Idle RPG 的核心反馈通道，必须保证 8+ 行可见 |
| **CT 终端美学一致性** | 所有改动不得引入分割线、边框、或非字符型视觉分隔 |

---

## 2. 当前布局问题诊断

### 2.1 空间分配问题

```
当前三栏比例（1920px 屏幕为例）：
┌──────────┬────────────────────────┬──────────┐
│ 240px    │     ~1440px 画布       │ 240px    │
│ (左信息) │     (实际被侧栏挤压)    │ (右信息) │
└──────────┴────────────────────────┴──────────┘

问题：侧栏过宽，信息密度低，玩家眼球需要跨越大片空白。
```

### 2.2 信息密度问题

| 元素 | 当前值 | 问题 |
|------|--------|------|
| `.col-left/right` line-height | 1.7 |  terminal 风格应为 1.3-1.4 |
| `.col-left/right` padding | 10px 16px | 垂直留白过多，浪费 |
| `.prop` padding | 2px 0 | 实际还行，但整体密度被 line-height 拖低 |
| 日志区高度 | 130px | 约 6 行，Idle RPG 不够 |

### 2.3 按钮栏功能优先级问题

```
当前：所有按钮均分，视觉权重相同

[F1 DEVICE] [F2 CODEX] [F3 TALENT] [F4 SAVE] [F5 TERMS] [F6 TEST] [F7 WIPE]
  核心功能 ×3                              工具功能 ×4

问题：SAVE 是 Idle 游戏应自动执行的功能，不应占用主按钮栏；
      TEST/WIPE 是开发者工具，不应与玩家功能并列。
```

### 2.4 面板内部布局问题

```
面板内部 grid: 340px | 1fr
列表区 340px / 面板总宽 860px = 39%

问题：物品名（中文）12-16字时，340px 会截断；
     详情区过宽，内容被拉伸，阅读体验差。
```

---

## 3. 优化方案详述

### 3.1 侧栏收窄 + 信息高密度化

**目的**：释放更多空间给画布，同时提升信息阅读效率。

```css
/* 修改前 */
#top-row { grid-template-columns: 240px 1fr 240px; }
.col-left, .col-right { padding: 10px 16px; font-size:13px; line-height:1.7; }

/* 修改后 */
#top-row { grid-template-columns: 200px 1fr 200px; }
.col-left, .col-right { padding: 6px 12px; font-size:13px; line-height:1.4; }
```

**玩家体验目标**：玩家一眼能扫完所有状态信息，不需要滚动左侧栏。

**`.ct` 分组标题优化**：
```css
.ct { padding: 4px 0 2px; margin-top: 6px; font-size:11px; }
```

---

### 3.2 日志区高度提升

**目的**：Idle RPG 的日志是主要反馈通道，玩家靠日志确认掉落、升级、战斗结果。

```css
/* 修改前 */
#log { height: 130px; padding: 6px 18px; font-size:13px; line-height:1.6; }

/* 修改后 */
#log { height: 170px; padding: 6px 16px; font-size:12.5px; line-height:1.5; }
```

**计算依据**：170px ÷ (12.5px × 1.5) ≈ 9 行可见日志，满足 Idle RPG 反馈需求。

**边缘情况**：小屏幕（<768px）下日志区不应超过屏幕高度 25%，需要在媒体查询中限制：
```css
@media (max-height: 700px) {
  #log { height: 130px; }
}
```

---

### 3.3 按钮栏重构 — 功能优先级分层

**设计决策**：将按钮栏分为两个区域：
- **主区**（左对齐）：F1-F3 核心功能，视觉强调
- **工具区**（右对齐）：SAVE / SETTINGS / DEV TOOLS，收缩显示

**实现方案**：

```html
<!-- 修改前 -->
<div id="button-bar">
  <button id="btn-inventory">...</button>
  <button id="btn-codex">...</button>
  ...
</div>

<!-- 修改后 -->
<div id="button-bar">
  <div class="btn-group-main">
    <button id="btn-inventory" class="btn-core">...</button>
    <button id="btn-codex" class="btn-core">...</button>
    <button id="btn-statpoints" class="btn-core">...</button>
  </div>
  <div class="btn-group-tools">
    <button id="btn-save" class="btn-tool">F4 SAVE</button>
    <button id="btn-terms" class="btn-tool">F5 TERMS</button>
    <button id="btn-dev" class="btn-tool btn-dev-toggle">···</button>
  </div>
</div>
```

```css
#button-bar {
  display: flex;
  justify-content: space-between; /* 主按钮左，工具按钮右 */
  background: var(--bg-soft);
  flex-shrink: 0;
  border-top: 1px solid #111;
  padding: 0 8px;
}
.btn-group-main { display: flex; }
.btn-group-tools { display: flex; gap: 2px; }

/* 核心按钮强调样式 */
.btn-core {
  padding: 10px 18px;
  color: var(--white);          /* 高亮 */
  font-weight: 700;
}
.btn-core .key { color: var(--dim); }

/* 工具按钮弱化 */
.btn-tool {
  padding: 10px 10px;
  color: var(--slate);          /* 低对比度 */
  font-size: 11px;
}
.btn-tool:hover { color: var(--dim); }
```

**SAVE 自动化说明**：Idle RPG 应每 30-60 秒自动保存，`F4 SAVE` 改为手动强制保存，并增加自动保存状态指示（如 `AUTO:ON` 标签）。

---

### 3.4 面板内部布局调整

**目的**：列表区加宽，避免物品名截断；详情区收窄，集中阅读。

```css
/* 修改前 */
.panel-body { grid-template-columns: 340px 1fr; gap: 24px; }

/* 修改后 */
.panel-body { grid-template-columns: 420px 1fr; gap: 16px; }
```

**详情区内容约束**（防止拉伸）：
```css
#item-detail, #codex-detail {
  max-width: 380px;           /* 限制详情区最大宽度 */
  padding-left: 16px;
}
```

---

### 3.5 Canvas 黑边处理

**当前问题**：`object-fit: contain` 会在画布左右或上下产生黑边（取决于屏幕比例）。

**方案**：改为 `object-fit: cover` 并允许画布轻微裁剪，或者更好的是：**让画布比例动态匹配容器**，即移除 `object-fit`，改用 JS 动态设置 canvas 的 CSS 尺寸。

```css
/* 修改后 */
#combat-canvas {
  display: block;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;   /* 像素风格游戏必备 */
}
```

**注意**：`image-rendering: pixelated` 对 HDPI 缩放后的画布有改善效果，但根本解决方案还是在 `main.js` 的 `updateCanvasSize()` 里正确计算 `canvas.width/height`。

---

### 3.6 小屏幕响应式优化（补充）

当前媒体查询在 900px 时隐藏右栏，但左栏信息仍然过多。补充优化：

```css
@media (max-width: 900px) {
  #top-row { grid-template-columns: 180px 1fr; }
  .col-right { display: none; }
  /* 将右栏关键信息合并到日志区上方，或改为点击展开 */
  #log::before { content: '> LOG — HP:' attr(data-hp) ' MP:' attr(data-mp); }
}
```

> **注意**：上述 `attr()` 用法仅作示意，实际实现需要用 JS 动态更新 `#log` 的 `data-hp` / `data-mp` 属性。

---

## 4. 实现规格汇总

### 4.1 CSS 变量变更

```css
:root {
  /* 新增 */
  --sidebar-w: 200px;
  --log-h: 170px;
  --panel-list-w: 420px;

  /* 覆盖 */
  --font-mono-size: 13px;     /* 基础字号保持不变 */
}
```

### 4.2 具体数值变更表

| 选择器 | 属性 | 旧值 | 新值 | 理由 |
|--------|------|------|------|------|
| `#top-row` | `grid-template-columns` | `240px 1fr 240px` | `200px 1fr 200px` | 释放画布空间 |
| `.col-left, .col-right` | `padding` | `10px 16px` | `6px 12px` | 提升密度 |
| `.col-left, .col-right` | `line-height` | `1.7` | `1.45` | 终端风格 |
| `.ct` | `padding` | `6px 0 3px` | `4px 0 2px` | 紧凑分组 |
| `.ct` | `margin-top` | `8px` | `6px` | 紧凑分组 |
| `#log` | `height` | `130px` | `170px` | 8+ 行日志 |
| `#log` | `font-size` | `13px` | `12.5px` | 小字多行 |
| `.panel-body` | `grid-template-columns` | `340px 1fr` | `420px 1fr` | 防截断 |
| `.panel-body` | `gap` | `24px` | `16px` | 紧凑 |
| `#button-bar` | `justify-content` | — | `space-between` | 功能分层 |

---

## 5. 玩家体验验证标准

| 指标 | 当前 | 目标 | 验证方法 |
|------|------|------|----------|
| 侧栏信息完整可见（无滚动） | ❌ 需要滚动 | ✅ 一次扫完 | 1920×1080 下打开，检查左/右栏是否出现滚动条 |
| 日志同时可见行数 | ~6 行 | ~9 行 | 实际运行，数日志区行数 |
| 物品名截断率 | ~30% | <5% | 随机生成 20 个物品，检查 `.inv-item-name` 是否截断 |
| 核心功能按钮首眼识别 | 不明确 | 明确 |  usability testing：5 秒内指出"装备界面"按钮 |
| 画布占比（1920px 宽） | ~75% | >80% | 截图测量 |

---

## 6. 风险与边缘情况

### 6.1 风险：侧栏收窄后小屏幕不可用

**场景**：屏幕宽度 < 1200px 时，200px 侧栏 + 画布 + 200px 侧栏 = 最小 400px 画布，可接受。

**兜底方案**：在 `1080px` 断点处将侧栏改为 `160px`，`900px` 处隐藏右栏（已有）。

### 6.2 风险：日志区过高挤压画布

**场景**：屏幕高度 < 800px 时，header + 日志 + CLI + 按钮栏 可能超过 50% 屏幕高度。

**兜底方案**：JS 在初始化时检测屏幕高度，动态设置 `#log { height: Npx }`，保证画布最小高度为屏幕的 45%。

```js
// 在 main.js init() 中添加
function fitLayout() {
  const h = window.innerHeight;
  const log = document.getElementById('log');
  if (h < 750) {
    log.style.height = '110px';
  } else if (h < 900) {
    log.style.height = '140px';
  } else {
    log.style.height = '170px';
  }
}
window.addEventListener('resize', fitLayout);
```

### 6.3 风险：`image-rendering: pixelated` 在某些浏览器反转画布

**影响范围**：Firefox 对 Canvas 的 `image-rendering` 支持不完整。

**验证方法**：在 Firefox 126+ 测试，如无问题则保留；如有问题则用 `@supports` 做降级：

```css
@supports not (image-rendering: pixelated) {
  #combat-canvas { image-rendering: auto; }
}
```

---

## 7. 实施优先级

| 优先级 | 改动 | 工作量 | 影响范围 |
|--------|------|--------|----------|
| P0 | 3.1 侧栏收窄 + 高密度化 | 低（纯 CSS） | 全局 |
| P0 | 3.2 日志区提升 | 低（纯 CSS） | 全局 |
| P1 | 3.3 按钮栏重构 | 中（HTML + CSS） | 按钮栏交互 |
| P1 | 3.4 面板布局调整 | 低（纯 CSS） | 浮层面板 |
| P2 | 3.5 Canvas 黑边 | 中（JS + CSS） | 画布渲染 |
| P2 | 3.6 响应式补充 | 中（CSS + 少量 JS） | 小屏体验 |

---

## 8. 变更记录

| 版本 | 日期 | 变更摘要 | 作者 |
|------|------|----------|------|
| v1.0 | 2026-06-24 | 初版，覆盖布局六大问题 | GameDesigner |
