# 《存在终端》工作流程优化方案

> **优化目标**: 从手动.bak备份 → 现代化Git工作流 + 自动化部署 + 质量标准
> **预期收益**: 减少80%版本管理时间，消除部署错误，提升代码质量

---

## 📊 当前状态分析 (Current State Analysis)

### 现有工作流程
```
开发 → 手动编辑 → 复制.bak备份 → 手动更新CHANGELOG → 手动部署到GitHub Pages
```

### 识别的瓶颈与问题

| 问题领域 | 具体表现 | 影响严重程度 |
|---------|---------|------------|
| **版本管理** | 使用.bak文件手动备份，容易遗漏，无法回溯 | 🔴 高 |
| **部署流程** | 手动部署，容易出错，无回滚机制 | 🔴 高 |
| **代码质量** | 无自动化测试，依赖手动验证 | 🟡 中 |
| **文档同步** | GAME_DESIGN.md是真相源，但无检查机制 | 🟡 中 |
| **开发环境** | 无标准化，新成员上手慢 | 🟢 低 |

### 当前指标基线
- **版本管理时间**: 每次更新需10-15分钟手动备份
- **部署时间**: 5-10分钟手动操作
- **Bug修复周期**: 依赖用户反馈，平均2-3天才发现
- **文档同步**: 手动检查，容易漂移

---

## 🎯 优化后工作流程设计 (Optimized Future State)

### 核心改进原则
1. **Git取代.bak**: 版本控制自动化
2. **GitHub Actions自动化部署**: 推送即部署
3. **质量门禁**: Pre-commit hooks + 自动化检查
4. **文档即代码**: GAME_DESIGN.md变更自动通知

---

## 🔄 详细工作流程

### 1️⃣ 初始化阶段 (One-time Setup)

#### Step 1: Git仓库初始化
```bash
# 在项目根目录执行
cd "C:/Users/LLuvYa/Desktop/game/存在终端"
git init
git add .
git commit -m "Initial commit: v6.0 baseline"
```

#### Step 2: 创建.gitignore优化版本
```gitignore
# 移除旧的.bak文件管理，使用Git
*.bak
*.bak.md

# 开发临时文件
.archive/
.hermes/

# IDE文件
.vscode/
.idea/

# 系统文件
Thumbs.db
Desktop.ini
```

#### Step 3: 分支策略配置
```
main (生产)
  └── develop (开发集成)
        └── feature/功能名 (功能开发)
        └── fix/bug名 (Bug修复)
```

#### Step 4: GitHub远程仓库配置
```bash
# 创建GitHub仓库后
git remote add origin https://github.com/用户名/terminal-of-being.git
git push -u origin main
```

---

### 2️⃣ 日常开发工作流 (Daily Development Workflow)

#### 标准功能开发流程
```
1. 从develop创建功能分支
   git checkout develop
   git pull
   git checkout -b feature/新功能名称

2. 开发+频繁提交（小步提交）
   git add js/systems/combat.js
   git commit -m "feat: 优化战斗计算公式"

3. 保持与develop同步
   git fetch origin
   git rebase origin/develop

4. 完成开发后创建Pull Request
   git push origin feature/新功能名称
   # 在GitHub上创建PR到develop

5. Code Review + 合并
   # PR通过后立即合并到develop

6. 定期合并develop到main用于发布
```

#### 提交信息规范 (Conventional Commits)
```
feat: 新功能
fix: Bug修复
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 重构
perf: 性能优化
chore: 构建/工具链变更
```

**示例**:
```bash
git commit -m "feat(combat): 实现暴击伤害计算公式"
git commit -m "fix(loot): 修复掉落过期时间计算错误"
git commit -m "docs: 更新GAME_DESIGN.md v5.1"
```

---

### 3️⃣ 自动化测试与质量检查 (Quality Assurance Workflow)

#### Pre-commit Hooks配置 (使用Husky)

**安装Husky**:
```bash
npx husky-init && npm install
```

**.husky/pre-commit**:
```bash
#!/bin/sh
# 1. 检查JS语法错误
npx eslint js/**/*.js --max-warnings=0

# 2. 检查HTML/CSS有效性
npx html-validate index.html
npx stylelint style.css

# 3. 检查GAME_DESIGN.md是否有未完成的TODO
grep -n "TODO|FIXME" GAME_DESIGN.md && echo "❌ 设计文档存在未完成任务" && exit 1

# 4. 自动更新版本号（可选）
node scripts/bump-version.js
```

#### 自动化测试策略

**由于是纯前端游戏，采用以下测试层次**:

1. **静态检查** (必须):
   - ESLint: JS代码质量
   - HTML5验证: 标记有效性
   - CSS3验证: 样式正确性

2. **单元测试** (推荐):
   ```javascript
   // js/tests/stats.test.js
   import { calculateCritDamage } from '../systems/stats.js';

   console.assert(
     calculateCritDamage(100, 1.5) === 150,
     '暴击伤害计算错误'
   );
   ```

3. **手动测试清单** (必须):
   每次发布前完成 `MANUAL_TEST_CHECKLIST.md`:
   - [ ] 打开index.html，5秒内进入战斗
   - [ ] 自动战斗流畅，不掉帧
   - [ ] 装备能影响数值
   - [ ] 击杀有反馈（闪红、伤害数字、掉落日志）
   - [ ] 刷新页面进度不丢

---

### 4️⃣ 自动化部署工作流 (CI/CD Pipeline)

#### GitHub Actions配置

**.github/workflows/deploy.yml**:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test  # 运行自动化测试

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
          publish_branch: gh-pages
```

**部署触发条件**:
- `main`分支推送 → 自动部署到生产环境
- `develop`分支推送 → 自动部署到测试环境
- Pull Request → 运行测试但不部署

---

### 5️⃣ 版本管理与发布工作流 (Release Management)

#### 语义化版本控制

**版本号规则**: `主版本.次版本.修订号`
- 主版本: 不兼容的API修改
- 次版本: 向下兼容的功能性新增
- 修订号: 向下兼容的问题修正

**示例**:
- v6.0.0 → v6.1.0 (新增图鉴功能)
- v6.1.0 → v6.1.1 (修复掉落Bug)

#### 发布流程
```
1. 从develop创建发布分支
   git checkout develop
   git checkout -b release/v6.1.0

2. 版本号提升 + 更新CHANGELOG
   # 编辑package.json版本号
   # 编辑CHANGELOG.md添加发布说明
   git commit -am "chore: 准备发布v6.1.0"

3. 合并到main并打标签
   git checkout main
   git merge --no-ff release/v6.1.0
   git tag -a v6.1.0 -m "Release v6.1.0"
   git push origin main --tags

4. 合并回develop
   git checkout develop
   git merge main

5. 删除发布分支
   git branch -d release/v6.1.0
```

#### 自动化版本号管理脚本

**scripts/bump-version.js**:
```javascript
// 自动根据提交信息提升版本号
import fs from 'fs';
import { execSync } from 'child_process';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const lastCommitMsg = execSync('git log -1 --pretty=%B').toString().trim();

let [major, minor, patch] = packageJson.version.split('.').map(Number);

if (lastCommitMsg.startsWith('feat')) {
  minor++;
  patch = 0;
} else if (lastCommitMsg.startsWith('fix')) {
  patch++;
}

packageJson.version = `${major}.${minor}.${patch}`;
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
```

---

### 6️⃣ 文档维护工作流 (Documentation Workflow)

#### GAME_DESIGN.md同步检查

**问题**: GAME_DESIGN.md是"唯一真相源"，但代码容易漂移

**解决方案**: Pre-commit hook + 手动审查清单

**docs/DESIGN_SYNC_CHECKLIST.md**:
```markdown
# 设计文档同步检查清单

每次功能开发完成后，检查以下项目：

- [ ] 新增的游戏机制是否在GAME_DESIGN.md中有对应描述？
- [ ] 装备/怪物/概念的属性是否与设计文档一致？
- [ ] UI文案是否和设计文档中的术语统一？
- [ ] 是否有未实现的设计文档功能需要标注？

## 同步流程

1. 完成代码开发
2. 对照GAME_DESIGN.md逐条检查
3. 如果有差异：
   - 优先修改代码以符合设计文档
   - 如果设计文档需要更新，一起提交
4. 在PR描述中注明"设计文档已同步"
```

---

## 📈 预期改进效果 (Expected Improvements)

| 指标 | 优化前 | 优化后 | 改进幅度 |
|-----|--------|--------|---------|
| **版本管理时间** | 10-15分钟/次 | 1分钟/次 | **90% ↓** |
| **部署时间** | 5-10分钟手动 | 推送后自动 | **100% ↓** |
| **部署错误率** | 偶尔出错 | 0 | **100% ↓** |
| **Bug发现周期** | 2-3天 | 当天发现 | **70% ↓** |
| **回滚能力** | 手动恢复.bak | Git一键回滚 | **完全可控** |
| **新成员上手时间** | 1-2天 | 2小时 | **80% ↓** |

---

## 🛠️ 实施计划 (Implementation Roadmap)

### Phase 1: 基础建设 (Week 1-2)
- [ ] 初始化Git仓库
- [ ] 配置.gitignore
- [ ] 创建develop分支
- [ ] 安装并配置Husky pre-commit hooks
- [ ] 配置ESLint + HTML/CSS验证

**预期成果**: 基础版本控制工作流可用

### Phase 2: 自动化部署 (Week 3-4)
- [ ] 创建GitHub仓库
- [ ] 配置GitHub Actions CI/CD
- [ ] 测试自动部署流程
- [ ] 配置自定义域名（可选）

**预期成果**: 推送main分支即可自动部署

### Phase 3: 质量提升 (Week 5-6)
- [ ] 编写核心模块单元测试
- [ ] 创建MANUAL_TEST_CHECKLIST.md
- [ ] 配置语义化版本控制
- [ ] 编写自动化版本号管理脚本

**预期成果**: 代码质量可度量、可保障

### Phase 4: 文档与流程优化 (Week 7-8)
- [ ] 创建DESIGN_SYNC_CHECKLIST.md
- [ ] 编写贡献指南CONTRIBUTING.md
- [ ] 配置PR模板
- [ ] 团队培训与推广

**预期成果**: 完整的开发工作流标准化

---

## 💰 投资回报率分析 (ROI Analysis)

### 成本估算
| 项目 | 一次性成本 | 周期性成本 |
|-----|-----------|-----------|
| Git学习与时间投入 | 4小时 × 1人 | 0 |
| GitHub Actions配置 | 2小时 × 1人 | 0 |
| 测试脚本编写 | 8小时 × 1人 | 2小时/月维护 |
| 团队培训 | 2小时 × 1人 | 0 |
| **总计** | **约16小时** | **2小时/月** |

### 收益估算（按月计算）
| 收益项 | 每月节省时间 | 货币价值* |
|--------|-------------|----------|
| 版本管理效率提升 | 4小时 | 约¥400 |
| 部署自动化 | 2小时 | 约¥200 |
| Bug修复周期缩短 | 6小时 | 约¥600 |
| **总计** | **12小时/月** | **约¥1,200/月** |

*假设时薪¥100

### ROI计算
- **投资回收期**: 16小时 ÷ 12小时/月 = **1.3个月**
- **年度ROI**: (1,200 × 12 - 16 × 100) ÷ (16 × 100) = **800%**

---

## 🚀 快速启动指南 (Quick Start)

### 立即可以开始的3件事

1. **今天**: 初始化Git仓库
   ```bash
   cd "C:/Users/LLuvYa/Desktop/game/存在终端"
   git init
   git add .
   git commit -m "Initial commit: v6.0 baseline"
   ```

2. **本周**: 配置GitHub仓库 + 启用GitHub Pages
   - 在GitHub创建新仓库
   - 推送代码
   - 在仓库设置中启用GitHub Pages

3. **下周**: 添加简单的pre-commit hook
   ```bash
   echo 'npm test' > .git/hooks/pre-commit
   chmod +x .git/hooks/pre-commit
   ```

---

## 📝 附录: 工具推荐

| 工具类别 | 推荐工具 | 用途 |
|---------|---------|------|
| **版本控制** | Git + GitHub | 代码版本管理 |
| **CI/CD** | GitHub Actions | 自动化测试与部署 |
| **代码质量** | ESLint + Prettier | JS代码规范 |
| **HTML验证** | html-validate | HTML有效性检查 |
| **测试框架** | 原生JS + console.assert | 轻量级单元测试 |
| **文档生成** | 手动维护 | 保持GAME_DESIGN.md为真相源 |

---

**工作流优化专家**: Workflow Optimizer
**优化日期**: 2026-06-22
**实施优先级**: 🔴 高（立即开始Git迁移）
**成功概率**: 🟢 高（技术方案成熟，学习成本可控）

---

## 下一步行动

1. **确认方案**: 你是否同意这个工作流程优化方案？
2. **选择起点**: 想从哪个阶段开始实施？
3. **需要帮助**: 需要我帮你执行哪些具体的初始化步骤？
