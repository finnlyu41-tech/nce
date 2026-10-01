# 学习地图状态与保存修复交接

原四项与后续独立换题兼容修复已合入主发布线，发布验收进行中。来源分支 `codex/map-reliability-recovered-20261001`，实际 origin 为 `finnlyu41-tech/nce`；来源分支未独立部署。

审计基线 `97c85c5eb8ce785f7e837c85b6a064a437bd732a` 与 `076906e` 之间仅 README 改动。补丁固定合并远端 v17 主线 `0bec6cf`（合并提交 `5be5973`），保留主发布者的 Today、samplePracticeTasks、自动复习、语法与最小 demo。后续最小修复提交 `5cf9a61` 在原检查点 `12a045c` 之后；它修改六个生产文件与两份测试。整个分支生产范围为 `map/model.ts`、`main.tsx`、`learning.tsx`、`course.tsx`、`content.ts`、`curriculum.ts`、`review-route.ts`；仅给两个起步节点追加独立材料，不扩课程体系或重构导航。

## 修复行为

| 问题 | 修复后的可观察行为 |
| --- | --- |
| 旧通过 → 今天失败／求助 → 1 秒后改对复用旧证据 | 失败／求助重置巩固依据。重新独立通过只算重新学会，从该次通过起至少 24 小时后，用不同的实际题目来源独立通过，才能巩固。 |
| 同日多次通过把 raw pass 数推到 21 天 | 仅到期且换实际题目来源的独立复习计入有效场次。初次通过后 1 天，第二／三场后 7 天，第四场后 21 天；提前重复不提升级别，也不推迟原来的到期时间。 |
| 两份 6.5 模考填“自评”也就绪 | 章节作品、写作／口语专项、模考共用外评来源校验，拦截明确的自评和 AI 来源。提示说明信息由用户登记、本站不独立核验，不生成 AI 分数。原有分数、单项、不同试卷、不同日期等门槛不降低。 |
| 最近失败 A，却优先推未学 B | `continueNode` 先恢复仍可进入、未完成或到期的最近节点。用户主动开始 B 会更新位置并可继续 B；A 的修补需求仍保留。 |
| save 返回 false，作品／评阅仍显示成功、短暂点亮 | 只有实际提交成功且记录符合门槛才显示成功回执。主 App 存储错误不发布未提交的完成状态。表单在当前页面保留输入，可显式重试。 |
| 同一记录收到其他标签页更新、或重新锁定 | 加载远端已保存进度；保留本地输入并暂停该表单自动覆盖，显式重试合并最新设置及其他记录。锁定时隐藏表单而不卸载，重新解锁可继续编辑。 |

失败后尚未重新通过时立即需要修补；重新通过后的 24 小时冷却期内 `stable=false`、`due=false`，冷却到期后可做真正的延迟检验。题库编号变化或同题重排但实际题目、答案、音频来源与起止不变，不算新证据。身份比较排序题干／答案／book／lesson／start／end，保留重复项数量，忽略题目和选项顺序。

## 原始记录与备份边界

- 保持 `version:2` 和 storage key 不变。旧 v2 备份导入、再导出保留原始 attempts、评阅、作品、草稿和位置；新的派生状态会更严格，不删除或改写原记录。v1 仍明确提示旧备份不可换算，并保留原文件。
- 增加可选 `quizHelpAt`，记录查看答案／提示或返回讲解的最新时间，包含尚未提交的求助。新字段进入导出／导入；未来／无效时间拒绝导入。
- 旧版未提交的 assisted round 没有求助时间，读取时不会偷偷补时间。仅用户明确重新开始检验时记录新的边界；旧的通过不能跨过它恢复巩固。
- `submitQuiz` 保留全部原始 attempts，避免 12 条截断把失败边界删掉而复活旧巩固。导入仍受原有 6 MB 文件限制及结构／时间检查；单节点防滥用上限为 100,000 场。
- 无 `bank` 的旧记录按原始 round 解释，旧题、原答、听音频索引和评分解释均不重定义。`first`／`small-exchange` 的旧三题重排仍可练习并保留通过记录，但旧 `stable=true` 会按更严证据降为待复验；不伪造或删除历史。
- 只有显式开启新轮才设置可选 `bank: "starter-v2"`；proof 同时保留该标识。两个节点各有原三句组 A 与追加三句组 B，全部三题与听音频要求保持；讲解可读到六句。新增六段来自 NCE1 第 3 课原稿，英文、中文与音频起止均有独立证据。混合备份逐字段保留；未知标识或标识用于其他节点会拒绝导入。
- **回退旧版前必须保留新版导出的完整备份。** 超过 12 场的备份旧 v15 parser 无法读取；旧代码也不能正确解释新的 bank 或求助边界。额外只读核对已证明 v17 旧 parser 拒绝第 13 场，新 bank 原答在旧 model 会被错误评分。不得裁剪历史来适配旧 parser，不承诺旧版直接读新长历史；忠实恢复必须保留新 parser 与题组解释。
- `nextReviewAt`、`continueNode`、`changeStudyStep`、`restartQuiz` 新增可选测试时间参数，原调用保持兼容；`noteQuizHelp` 为新增公共方法。`Save` 仍同步返回 boolean。

## 验收证据

[原四项分项验收与七个生产文件 SHA-256](verification/map-reliability/test-results.json)，[模型基线复现](verification/map-reliability/model-before.json)，[修复后 41 场景](verification/map-reliability/model-after.json)，[252 项外评／导航](verification/map-reliability/reviewer-navigation-after.json)，[真实 React 浏览器 96 项](verification/map-reliability/browser-after.json)。

| 验收 | 结果 |
| --- | --- |
| 审计基线模型 | 复现旧通过→失败／帮助→即时改对、重复升间隔、自评模考就绪、继续节点错误，共 5 个观察。 |
| 原有地图检查 | 12,881 项通过，168 组真实教材数据；历史截断断言改为保留全部原始记录。 |
| 真实课程场景 | 41／41，通过失败→重学→跨日真巩固、同日与提前重复、实际题目相同、未来／倒序时间、旧记录与备份。 |
| 外评与继续节点 | 252／252，包含自评／全角／标点变体、明确 AI 来源、正常姓名、标准保持、手动跳过与备份保留。 |
| 真实 TSX 源码组件 | 102 项通过（原保存 74 ＋ bank／素材兼容 28）；基线模式 12 项断言实际复现虚假成功、瞬态解锁及冲突丢输入。使用持久 hooks/effects harness、合成依赖和内存存储。 |
| 真实 React 19.2.6 + Chrome DOM | 96 项通过（原保存 38 ＋真实 starter 轨迹 58），390 px，独立临时 profile。内存存储注入失败与恢复、模拟多标签原始字节冲突、StorageEvent、锁定后输入保留、单项门槛改变后的回执撤销；两 starter day0/1/8/15/36 按真实页面选题提交与混合备份恢复。浏览器音频完成事件合成注入，不作为真实播放证明。 |
| 今日练习 | 48／48；capability consumer 18／18；旧四天 raw pass 的 21 天用例改为有效 1／7／7 天场次，新增提前重复仍按 7 天到期。未修改今日练习生产代码。 |
| TypeScript、导航、经典进度备份、learning plan | 全通过。 |
| 地图及经典在线构建、离线构建与打包 | 全通过。Vite 既有大 chunk 提示不影响构建。 |
| Map worker 路由／源文件隔离与在线校验 | 全通过；1,950 文件、706,959,756 字节，包含教材与最小 demo。 |

截图仅使用合成记录：

| 表单 | 写入拒绝 | 同一输入重试成功 |
| --- | --- | --- |
| 模考 | [截图](verification/map-reliability/mock-write-rejected.png) | [截图](verification/map-reliability/mock-retry-saved.png) |
| 章节作品 | [截图](verification/map-reliability/project-write-rejected.png) | [截图](verification/map-reliability/project-retry-saved.png) |

补充证据：[起步节点错误基线](verification/map-reliability/starter-gap-before.json)、[4,071 组合候选界限](verification/map-reliability/review-banks-bound.json)、[六段真实原文及音频边界](verification/map-reliability/starter-source-evidence.json)、[旧版回退边界](verification/map-reliability/rollback-boundary.json)。nce1-1 真复习轮次仍为 0→1→2→4，day15 后到 day36；两个 starter 真复习轮次 0→1→2→3→4，下次日期 1／8／15／36／57。

复习的跨日时间通过注入时钟检验规则，没有把程序测试写成真实用户已经隔日巩固。所有故障、模拟并发和浏览器记录均为合成数据；未读取、注入或修改真实用户进度。外评来源检查不独立核验身份或成绩。

## 复跑

在已有教材包、课程 JSON 和锁定依赖的 `studio` 目录运行：

```sh
node map/prepare-curriculum.mjs
node map/test-model.mjs
node map/test-reliability.mjs --baseline 97c85c5
node map/test-reliability.mjs
node map/test-reviewer-navigation.mjs
node map/test-save.mjs --baseline
node map/test-save.mjs
node scripts/test-today-practice.mjs
node node_modules/typescript/bin/tsc --noEmit
```

浏览器 fixture 只在 Vite 开发服务器使用，不进入生产 map 构建；先启动：

```sh
node node_modules/vite/bin/vite.js --config map/vite.config.ts --host 127.0.0.1 --port 43327
```

另一个终端执行（默认 macOS Chrome；其他 Chromium 可用 `--browser` 指定）：

```sh
node map/test-save-browser.mjs
```

也可打开 `http://127.0.0.1:43327/fixtures/save.html`，或 `?kind=project`；新起步 fixture 为 `/fixtures/starter.html?kind=first` 或 `?kind=small-exchange`。黄色控制栏只操作页面的内存存储。

## 集成协调与恢复记录

已在会话前段通知主发布对话 `01a0f10c-ff5c-7aa1-8a42-8ee650bbb2f5` 四个共享文件范围。此后原 `Documents/Codex` 目录消失，未提交工作树不可用；从同一审计基线在 `/tmp` 重建，完整恢复并重新验收，先保存 Git 检查点，再合并最新远端。未操作其他任务的脏树，也没有执行发布。

Codex app 的通知／附件连接一度返回 `Transport closed`；连接恢复后已实际告知发布 owner `5cf9a61` 范围与全部兼容边界。owner 回执确认等待证据后串行接入，并报告独立只读复核：36 组旧题／备份、112 个 marker 限制、240 轮换题与真实 due 流通过。

**主线集成结果：** `271112b` 已补齐 `app/today-practice.ts` 的 resume 同时比较 round 与 bank，保留 `samplePracticeTasks` 接线。新增真实同轮不同题组、半途答案导出／恢复及提交后的回归；主线 49 项今日推荐、18 项自动复习接线、12,881 项地图模型、41 个可靠性场景、252 项外评／导航和 102 项真实 TSX 检查通过。发布版本的浏览器交互仍须单独验收，不能以来源截图替代。

现有 Obsidian 路径及指定 Dropbox 根 AGENTS.md 不可读，未创建替代 vault 或重复状态库。本文件保留本批集成、兼容与验收决定。主发布者集成时仅接收本分支相对在线主线的补丁，当前批次完成后串行上线。
