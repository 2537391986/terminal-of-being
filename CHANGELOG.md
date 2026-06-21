# CHANGELOG — 存在终端 Terminal of Being

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
- **装备效果实装** — `on_kill`（强力意志之冠：击杀永久 +2 断言力，死亡重置）和 `on_low_hp`（向死存在之靴：HP<30% +30% 思维频率）已生效
- **升级公式统一** — 从 `constants.js` 读取 `LEVEL_UP` 和 `expToNext`，不再写死数字
- **图鉴存储改 conceptId** — `unlockedCodex` 存 `conceptId` 而非展示名，便于查询

### UI：射击逻辑 + 图鉴面板

- **射击只在有敌时触发** — 敌人进入前方 400px 范围才发射投射物，无怪不空射
- **概念图鉴** — 新增 `[图鉴]` 按钮和全屏面板，左侧按领域分组显示已解锁概念，右侧展示完整详情（术语/英文/派系/科普/机制映射）
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
