# Yiya CEO 执行计划 · 2026-03-06

> **目标**: 提升 DAL (Daily Active Learners) - 每日完成至少一课的用户数

---

## 📊 摸底结果摘要

### 当前状态
- ✅ 功能完整：6种语言、游戏化、FSRS间隔重复、支付、PWA、社交分享
- ✅ 代码质量高：近期合并8个PR，架构清晰
- ⚠️ E2E测试失败：测试期望5种语言，实际有6种（Japanese已添加）
- 💡 机会：AI对话练习尚未实现，内容扩展空间大

### 负资产识别
| 负资产 | 影响 | 行动 |
|-------|------|------|
| E2E测试固件过时 | CI信心下降 | **P0: T0轨道** |
| CI workflow scope阻塞 | 自动化受限 | 暂不处理，手动workaround |
| 有限课程内容 | 用户留存受限 | **P0: T0审计** |

---

## 🎯 P0 增长计划（Top 5）

按 **影响力 × 用户价值** 排序：

| 优先级 | 任务 | 增长杠杆 | 用户价值 | 技术难度 |
|-------|------|---------|---------|---------|
| **P0-1** | 修复E2E测试 | CI信心 | 部署安全 | ⭐ |
| **P0-2** | 内容审计与扩展计划 | 留存 | 更多学习内容 | ⭐⭐ |
| **P0-3** | Push通知优化 | 留存/DAL | 习惯养成 | ⭐⭐ |
| **P0-4** | Streak分享打磨 | 拉新/病毒 | 社交激励 | ⭐⭐ |
| **P0-5** | AI对话练习设计 | 差异化 | 真实输出 | ⭐⭐⭐ |

---

## 🏗️ Worktree 架构

```
.worktrees/
├── T0-fix-e2e-tests/          ← Phase 0 (进行中)
├── T0-content-audit/          ← Phase 0 (进行中)
├── T1-push-optimization/      ← Phase 1 (阻塞于 T0)
└── T1-streak-sharing/         ← Phase 1 (阻塞于 T0)
```

### 依赖关系
```
T0-fix-e2e-tests ──┬──> T1-push-optimization
                   └──> T1-streak-sharing

T0-content-audit ────> T2-ai-conversation (设计阶段)
```

---

## 🚀 启动命令

### Phase 0 - 立即执行（并行）

```bash
# Terminal 1: E2E测试修复
cd /Users/szj/Downloads/tmp/yiya/.worktrees/T0-fix-e2e-tests
cc -p "Read TODO.md and execute all tasks"

# Terminal 2: 内容审计
cd /Users/szj/Downloads/tmp/yiya/.worktrees/T0-content-audit
cc -p "Read TODO.md and execute all tasks"
```

### Phase 1 - T0完成后执行

```bash
# Terminal 3: Push通知优化
cd /Users/szj/Downloads/tmp/yiya/.worktrees/T1-push-optimization
git stash -u && git fetch origin && git rebase origin/main && git stash pop
npm install
cc -p "Read TODO.md and execute all tasks"

# Terminal 4: Streak分享打磨
cd /Users/szj/Downloads/tmp/yiya/.worktrees/T1-streak-sharing
git stash -u && git fetch origin && git rebase origin/main && git stash pop
npm install
cc -p "Read TODO.md and execute all tasks"
```

---

## 🗑️ Kill List（明确不做）

- ❌ 重构UI组件库 - 当前够用
- ❌ 添加第7+种语言 - 先做好现有6种
- ❌ 复杂数据分析仪表板 - 等用户量上来
- ❌ 实时多人对战 - 偏离核心使命
- ❌ 迁移Next.js 15 - 风险>收益
- ❌ 修复CI workflow scope - 非用户可见

---

## 📈 成功指标

| 指标 | 当前 | 目标 | 测量方式 |
|-----|------|------|---------|
| E2E测试通过率 | ~85% | 100% | `npm run test:e2e` |
| 课程覆盖率 | 待审计 | +50%内容 | 内容审计报告 |
| Push打开率 | 待测量 | +20% | PostHog事件 |
| Streak分享率 | 待测量 | +15% | PostHog事件 |

---

## ⏰ 时间线

- **今天**: Phase 0 完成（E2E修复 + 内容审计）
- **明天**: Phase 1 完成（Push优化 + Streak分享）
- **本周**: Phase 2 设计完成（AI对话练习PRD）

---

*计划制定: CEO @ 2026-03-06*
*决策原则: 影响力 > 难度，用户价值 > 技术完美*
