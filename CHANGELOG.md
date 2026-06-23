# CHANGELOG — 存在终端 Terminal of Being

## v0.7.5 (2026-06-22) — 天赋系统 + 调试面板 + 数据层达标

### ✨ 新增
- **天赋点系统**（`js/ui/statPoints.js`）：每升一级获得 3 点自由属性点，可分配至 maxHp/atk/def/crit/aspd/dodge/maxMp/luck 共 8 项，支持随时回收重分配；HUD `[alloc] 天赋` 按钮带未分配角标提醒
- **术语切换**（底部 `[terms]` 按钮）：一键切换哲学术语 ↔ 游戏术语显示；`state.settings.usePlainTerms` 控制；`STAT_LABELS` / `STAT_PLAIN_LABELS` / `STAT_SHORT_LABELS` / `STAT_SHORT_PLAIN` 全套支持
- **自定义确认弹窗**（替代原生 `confirm()`）：`index.html` 新增 `#confirm-modal`，`main.js` 新增 `customConfirm()` Promise 接口，目前用于「清空存档」操作
- **调试面板**（按 `~` 键）：支持指定刷怪 / 跳层 / 解锁全图鉴 / 加装备 / 回满 HP 等快捷操作；`encounter.js` 导出 `makeEnemyById()` 供面板调用

### 🐛 修复
- **怪物字体污染**：`renderer.js` 敌人绘制循环中 `ctx.font` 被名称绘制（10px）污染，后续怪物符号全部缩小；修复：每次绘制符号前重置 `ctx.font = 'bold 22px monospace'`
- **图鉴登记缺失**：被卷轴推出屏幕的怪物现在正确触发 `onEnemyDeath()`，图鉴 / 金钱 / 掉落全部正常登记
- **日志缓冲区溢出**：满 80 条后 `_prevLogLen` 误判导致新日志不渲染，改用独立版本号追踪
- **明希豪森 Boss 崩溃**：`encounter.js` 补上 `shake` 导入
- **语言游戏残响**符号 `W` → `L`（与强力意志 Boss 去重）
- **全景监视线**符号 `◎` → `⌂`（与平庸之恶去重）
- **物自体 Boss 第三阶段** — `effects` 拼写修正为 `effects`，`damageShield` 正常生效

### 🔧 优化
- **数组原地清理**：`filter()` → `inPlaceCleanup()` 原地 splice，避免每帧创建新数组（减少 GC 压力）
- **魔法数字抽离**：`MELEE_RANGE` / `MELEE_INTERVAL` / `RANGED_RANGE` / `WAVE_REST_MIN_MS` / `ENEMY_CULL_X` / `PROJECTILE_HIT_RADIUS` / `PROJECTILE_CULL_X` / `DROP_CULL_X` / `GROUND_LINE_Y` / `PARTICLE_GRAVITY` / `GORE_GRAVITY` / `DAMAGE_TEXT_RISE_SPEED` / `DYING_TIMER_MS` / `DROP_LIFETIME` / `AUTO_SAVE_INTERVAL` 全部迁入 `constants.js`
- **初始化错误边界**：`main.js` `init()` 包 try-catch，页面显示友好错误信息而非白屏

### 📊 数据层（P0 全部完成）
- **concepts.js** — 17 → **50 条**（道家 / 佛教 / 实用主义 / 科学哲学 / 女性主义 / 政治哲学 / 存在主义 / 解构 / 后结构 / 法兰克福学派 / 古希腊 / 中国哲学 / 现象学 / 经验主义 / 理性主义 / 德国唯心主义 / 分析哲学）
- **enemies.js** — 17 → **40 个**（33 普通 + 2 精英 + 5 Boss）
- **affixes.js** — 20 → **45 条**；补全 dodge / block / cooldownRed / goldGain / expGain / luck / maxMp 共 7 种缺失属性；每条词缀带哲学风味前缀

### 📝 文档
- `VERSION_PLAN.md` 更新至 v0.7.5 状态
- `ROADMAP.md` 更新 P0 项状态

---

## v6.0 (2026-06-21)

### 数据层：对齐 GAME_DESIGN.md v4.0 正式 MVP

- **constants.js** — 稀有度颜色/权重与设计文档完全对齐；新增 `PLAYER_BASE_STATS`、`DROP_LIFETIME`；`LEVEL_UP`/`expToNext`/`enemyStats`/`ELITE_MUL`/`BOSS_MUL` 全部生效
- **concepts.js** — 替换为设计文档附录 B 的 17 条 MVP 概念（含 `id/term/termEn/school/field/summary/designNote`）
- **enemies.js** — 替换为 10 普通 + 2 精英 + 5 Boss（含 `conceptId`/`stageRange`，提供过滤函数）
- **items.js** — 替换为设计文档附录 A 的 12 件 MVP 装备（含 `stageRange`/`dropWeight`/`effects`/`concept`）
- **affixes.js** — 替换为设计文档附录 C 的 20 条词缀（含 `isPercent`/`weight`，按稀有度过滤）

### 系统层：公式/效果/掉落全部重接

- **stats.js** — 区分 `isPercent`：整数属性（atk/def/hp）乘算，比例属性（crit/dodge 等）绝对值累加
- **loot.js** — `stageRange` 过滤模板（无匹配则不掉落）；加权选模板；`rarityFind`/`luck` 影响稀有度；`itemFind` 影响掉率；Boss 保底 rare
- **combat.js** — 无改动（v5.2 已正确）
- **equipment.js** — 无改动

### 战斗层：Bug 修复 + 效果实装

- **近战暴击伤害修复** — `damageEnemy()` 现在接收 `critDmg` 参数，近战暴击不再只闪白不增伤
- **怪物全面接入 enemies.js** — `makeEnemy()` 用 `pickEnemyTemplate/pickEliteTemplate/pickBossTemplate` + `enemyStats()` 公式，精英/Boss 倍率从 `constants.js` 读取
- **装备效果实装** — `on_kill`（强力意志之冠）和 `on_low_hp`（向死存在之靴）已生效
- **升级公式统一** — 从 `constants.js` 读取 `LEVEL_UP` 和 `expToNext`，不再写死数字
- **图鉴存储改 conceptId** — `unlockedCodex` 存 `conceptId` 而非展示名

### UI：射击逻辑 + 图鉴面板

- **射击只在有敌时触发** — 敌人进入前方 400px 范围才发射投射物
- **概念图鉴** — 新增 `[图鉴]` 按钮和全屏面板，左侧按领域分组，右侧展示详情
- **掉落过期机制** — 掉落装备 30 秒后消失，最后 5 秒急促闪烁提示
- **画布背景帧率修正** — `drawBackground()` 用真实 delta 而非硬编码 `1/60`

### 细节
- `index.html` 版本号改为 v6.0
- 新增 `js/ui/codex.js` 图鉴模块
- 新增 `style.css` 图鉴样式块
- 存档 `initialState` 新增 `killAtkStack: 0` 字段

---

## v5.2 及更早

参见 `GAME_DESIGN.md` 和各 `.bak` 备份文件。
