# Yiya 内容审计报告

> 审计日期: 2026-03-06
> 审计范围: 课程结构、内容覆盖、扩展机会

---

## 1. 现有内容概览

### 1.1 语言覆盖

| 语言 | 代码 | 状态 | Unit 数 | Lesson 数 | 词汇量 |
|------|------|------|---------|-----------|--------|
| Spanish | es | ✅ 完整 | 10 | 50 | ~400 |
| Italian | it | ✅ 完整 | 10 | 50 | ~400 |
| French | fr | ✅ 完整 | 10 | 50 | ~400 |
| Japanese | jp | ✅ 完整 | 10 | 50 | ~400 |
| English | en | ✅ 完整 | 10 | 50 | ~400 |
| Chinese | cn | ✅ 完整 | 10 | 50 | ~400 |

**总计**: 6 种语言 × 10 Unit × 5 Lesson = **300 节课**，约 **2400 个词汇**

### 1.2 课程结构

每种语言遵循统一的单元模板：

| Unit | 主题 | 描述 | Lessons |
|------|------|------|---------|
| Unit 1 | Basics | 基础词汇 | 5 |
| Unit 2 | Daily Life | 日常生活 | 5 |
| Unit 3 | Food & Drink | 饮食 | 5 |
| Unit 4 | Travel | 旅行 | 5 |
| Unit 5 | Conversation | 对话 | 5 |
| Unit 6 | Work & Study | 工作学习 | 5 |
| Unit 7 | Shopping & Money | 购物金钱 | 5 |
| Unit 8 | Entertainment | 娱乐 | 5 |
| Unit 9 | Social Life | 社交 | 5 |
| Unit 10 | Advanced Phrases | 高级短语 | 5 |

### 1.3 挑战类型分布

每个 Lesson 包含 3 种挑战类型：

- **SELECT**: 选择题（词汇识别）
- **ASSIST**: 辅助题（句子构建）
- **TYPE**: 打字题（拼写练习）

---

## 2. 内容创建流程

### 2.1 当前流程

```
scripts/seed.ts
    ↓
定义 LanguageConfig (每种语言一个构建函数)
    ↓
UNIT_TEMPLATES (10个单元模板)
    ↓
词汇数据 (每单元 ~40 词)
    ↓
npm run db:seed → 写入 PostgreSQL
```

### 2.2 管理后台

- **位置**: `/admin`
- **技术**: React Admin + simple-rest
- **功能**: CRUD 课程/单元/课程/挑战
- **限制**: 需要手动添加内容，无批量导入

### 2.3 内容更新机制

| 方式 | 适用场景 | 复杂度 |
|------|----------|--------|
| 修改 seed.ts | 大规模内容更新 | 中 |
| Admin Dashboard | 小修小补 | 低 |
| 数据库直连 | 紧急修复 | 高 |

---

## 3. 内容质量评估

### 3.1 优势

- ✅ **结构统一**: 所有语言遵循相同单元结构，用户切换语言无认知负担
- ✅ **主题全面**: 覆盖日常生活、旅行、工作等实用场景
- ✅ **词汇密度**: 每课 7-8 词，符合 "5分钟学习" 产品定位

### 3.2 局限

- ⚠️ **静态内容**: 所有内容硬编码在 seed.ts，更新需重新部署
- ⚠️ **无难度分级**: 从 Unit 1 到 Unit 10 难度递进不明显
- ⚠️ **缺乏语境**: 多为孤立词汇，缺少真实对话场景
- ⚠️ **无语音**: 仅有词汇，无例句发音

---

## 4. 扩展建议

### 4.1 短期（本月）

| 优先级 | 建议 | 预期收益 |
|--------|------|----------|
| P0 | 为每课添加例句 | 提升学习效果 |
| P1 | 添加发音音频 | 听力训练 |
| P1 | Unit 1-3 增加 "生存短语" 专项 | 新手友好 |

### 4.2 中期（本季度）

| 优先级 | 建议 | 技术方案 |
|--------|------|----------|
| P1 | AI 生成多样化挑战 | OpenAI API 生成 TYPE 题 |
| P2 | 动态难度调整 | 基于用户答题准确率 |
| P2 | 内容 CMS 化 | 将 seed.ts 数据迁移到 Strapi/Sanity |

### 4.3 长期（本年）

| 优先级 | 建议 | 战略价值 |
|--------|------|----------|
| P2 | 添加第 7+ 语言 | Korean, Portuguese, Russian |
| P3 | 用户生成内容 (UGC) | 社区贡献课程 |
| P3 | AI 个性化学习路径 | 基于用户兴趣和进度 |

---

## 5. AI 内容生成可行性

### 5.1 可行场景

1. **例句生成**: 为现有词汇生成 3-5 个语境例句
2. **同义词扩展**: 基于核心词汇生成变体挑战
3. **对话脚本**: 生成 Unit 5/9 的对话场景

### 5.2 实施建议

```typescript
// 新增 lib/ai/content-generator.ts
export async function generateExampleSentences(
  word: string,
  meaning: string,
  language: string
): Promise<string[]> {
  // 使用 OpenAI API 生成例句
}

export async function generateVariantChallenges(
  baseChallenge: Challenge,
  count: number
): Promise<Challenge[]> {
  // 基于现有挑战生成变体
}
```

### 5.3 成本控制

- OpenAI GPT-4o-mini: ~$0.15 / 1M tokens
- 生成 6 语言 × 400 词 × 3 例句 ≈ 7200 例句
- 估算成本: ~$5-10

---

## 6. 行动计划

### Phase 1: 内容增强（本周）

- [ ] 为 Unit 1-2 所有词汇添加例句（Spanish 试点）
- [ ] 评估用户反馈和留存影响
- [ ] 决定是否推广到其他语言

### Phase 2: 技术升级（下周）

- [ ] 设计内容 CMS 架构
- [ ] 将 seed.ts 数据导出为 JSON
- [ ] 实现 Admin Dashboard 批量导入

### Phase 3: AI 生成（本月）

- [ ] 开发内容生成脚本
- [ ] 生成所有语言 Unit 1-5 的例句
- [ ] A/B 测试：有例句 vs 无例句的完课率

---

## 附录: 数据统计

### 按语言代码行数 (scripts/seed.ts)

| 语言 | 起始行 | 结束行 | 代码行数 |
|------|--------|--------|----------|
| Spanish | 102 | 702 | ~600 |
| Italian | 703 | 1278 | ~575 |
| French | 1279 | 1854 | ~575 |
| Japanese | 1855 | 2430 | ~575 |
| English | 2431 | 3006 | ~575 |
| Chinese | 3007 | 3586 | ~579 |

**总内容代码**: ~3500 行 TypeScript

### 挑战类型分布估算

每课约 5-7 个挑战：
- SELECT: ~3-4 个
- ASSIST: ~1-2 个
- TYPE: ~1 个

总挑战数: 300 课 × 6 挑战 = **~1800 个挑战**

---

*报告生成: CEO / 2026-03-06*
