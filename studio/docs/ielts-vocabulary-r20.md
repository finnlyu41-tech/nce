# R20 IELTS 原创情境词义首批交付

## 可整合范围

从已刷新并核对一致的两个发布分支 `origin/codex/english-studio-online-20260926`、`origin/codex/ielts-map-20260930` 的 `c6b9b0182317fba09d1957b9844d6edc63f51ac4` 创建隔离分支 `codex/ielts-vocabulary-r20-20261003`。唯一 publisher `01a0fa39-c2a2-7239-87b4-b0a9c091f0ba` 负责整合与发布；本支线没有 merge/deploy。

新增 `app/data/ielts-vocabulary-r20.ts` 提供 48 个原创词义，44 个词/短语根；每项有稳定内容 ID、实际使用情境、准确释义、英中例句、英中搭配、辨义提示和 listening/speaking/reading/writing 来源用途。原 12 张种子 payload 原样保留，导出为 `ieltsFlashcardSeeds`；既有 `ieltsFlashcardExamples` 在原 12 后追加 48，合计 60。现有加入、来源筛选、检索、翻面与双向卡功能直接消费此集合，不需要另加状态或改 UI。

最小接线只有 `app/ielts-flashcard-examples.ts` 的 import、合并数组和说明文字；两个既有闪卡测试只调整种子/合计数量断言。没有修改 `flashcards.ts`、`flashcard-types.ts`、`model.ts`、排程算法、迁移、NCE 数据、词典、教材 UI 或任何用户记录。内容测试验证已有真实 FSRS 卡片、日志、undo、旧字段在加入新批次后原样保留。

## 实际覆盖

| 用途 | 新增义项 | 真实使用任务 |
| --- | ---: | --- |
| 听力 | 12 | 住宿预订与押金、费用与充电、报名/延期/改期、会场、交通票价/站台/换乘 |
| 口语 | 12 | 通勤、住房价格与便利、服务可靠性、拥挤、选择利弊、优先事项、适应与责任、课程预订与参考书 |
| 阅读 | 12 | 证据与假定、抽样偏差、相关与因果、结果关系、指标/估算、数据与人物、资源持续性、市场需求、服务可及性 |
| 写作 | 12 | 总量份额、对比、顺序对应、利弊权重、资源分配/补贴、人均与总量、增长后趋稳、下降与拒绝、非绝对趋势 |

四组各自分离的易混义项为 charge（收费/充电）、book（预订/书籍）、figure（数值/人物）、decline（下降/拒绝）。多义词与词性容易混淆的词使用短语题面，例如 `charge a phone`、`a sales figure`、`sampling bias`、`visitor numbers plateau`，先提示需要回想的语境，不显示中文答案。`headword` 留在内容层，FSRS 使用现有 Word.word（短语题面）+ meaning 身份规则；不把不同义项合并为一个裸词排程。

这是有限首批，R20 的原创内容缺口得到扩充；不宣称 IELTS 全词汇/所有义项已覆盖，或其余 60 项需求已完成。没有新增音频听辨题、完整考试牌组、自由输出评分、跨设备同步或官方分数换算。来源用途代表练习语境，不是官方词频或必考承诺。没有下载共享/收费卡组、复制教材或考试题，也没有利用用户学习记录生成内容。

## 审校与修订

独立审校者 `/root/ielts_blind_review` 第一轮只收到 id/headword/prompt/英文例句，逐项独立推断中文义项与完整译文，再收到作者答案进行逐项释义、译文、搭配、辨义与用途对照。这是独立模型语义复核，不是 IELTS 官方或人类专家认证。

第一轮 39 项通过、9 项提出题面消歧建议；全部采用，并把抽样调查目标明确为全体居民。第二轮 45 项通过、3 项修订后由同一审校者回读，最终 48/48 通过：waiting area 译为“等候区”；until Monday 保留“报名开放至周一”的含义；统计 bias 定义为系统性偏离真实情况的倾向，而非导致偏离的因素。审校核验参考 [Cambridge until](https://dictionary.cambridge.org/us/grammar/british-grammar/until) 与 [NIST statistical bias](https://www.nist.gov/glossary-term/19181)。

原英文盲包、48 项独立推断、修订前第二轮结果、48 项最终结果、修订记录、作者内容 SHA-256 与原种子 payload SHA-256 均保存在 `docs/verification/ielts-vocabulary-r20-review.json`。内容测试核对审校 hash，后续改内容时必须重新审校，不允许沿用过期通过结论。

## 已完成验收

- `node scripts/test-ielts-vocabulary-r20.mjs`：48 张真实组件翻面回调、翻面前不展示答案/例句、翻面后英中例句与独立搭配、英文/中文检索、四组多义词分离、60 项反复加入不重复、JSON 重载、原种子内容及已有 due/revision/FSRS/日志/undo/旧字段保留。
- `node scripts/test-flashcards.mjs`：15 个真实 FSRS 行为场景通过。
- `node scripts/test-flashcard-sources.mjs`：275 个来源词头组合的真实词表/异步查词回调及既有变形、withdraw 来源回归通过。
- 全项目 TypeScript、新增内容/适配/测试定向 ESLint 与 `git diff --check` 通过。
- 在线客户端 Vite 构建通过（2131 模块，既有大 chunk 提醒）。命令：`node map/prepare-curriculum.mjs` 后 `node node_modules/vite/bin/vite.js build --config vite.static.config.ts --configLoader runner --mode online --outDir work/ielts-r20/build`。使用本机现有锁定依赖与只读配套教材生成摘录，没有提交生成资源。
- 真实本地 IAB：清洁本地来源初始 0 张；60 项批量加入；charge 短语题面、翻面答案、英中例句及搭配；“公众人物”检索；刷新仍保持已翻面。最终修订版 390×844 视口内容正常换行，document clientWidth 与 scrollWidth 均为 390。截图在忽略的 `work/ielts-r20/desktop-flipped.jpg`、`mobile-flipped.jpg`。预览浏览器已关闭、视口已恢复；未读取或写入生产学习记录。

## Publisher 接手

Cherry-pick 本分支交付 commit 后，在最新集成版本运行上述三个脚本和类型检查，按现有发布流程完成在线/离线全包、白名单与版本 hash 验证；部署后从 `/#/words?tab=review` 验收原创数量 60、中文检索、翻面和已有词卡排程保留。此次完成在线客户端构建，没有运行全 release package、Worker 发布检查或生产部署；真机、真断网与跨设备未验。

检查了仓库/祖先的 AGENTS 与相关隐藏技能目录，当前基线未提供规则文件；两已知本机 Obsidian 路径及 Dropbox `/Obsidian on Dropbox/AGENTS.md` 均不可用，未创建替代库。本仓库此交付与证据足以接手，publisher 继续维护统一发布记录。
