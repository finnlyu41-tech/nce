# 学习地图状态与保存修复交接

四项最小修复已完成，待主发布者当前批次之后集成；本分支未部署。独立分支 `codex/map-reliability-recovered-20261001`，工作树 `/tmp/english-reliability-recovered-20261001`，实际 origin 为 `finnlyu41-tech/nce`。

审计基线 `97c85c5eb8ce785f7e837c85b6a064a437bd732a` 与 `076906e` 之间仅 README 改动。恢复后的补丁已合并远端在线主线 `c383a5d`，保留主发布者的今日练习与词汇例句。生产改动仅 `map/model.ts`、`map/main.tsx`、`map/learning.tsx`、`map/course.tsx`；不增加课程，不重构导航。相对最新主线的差异不含主线已有功能。

## 修复行为

| 问题 | 修复后的可观察行为 |
| --- | --- |
| 旧通过 → 今天失败／求助 → 1 秒后改对复用旧证据 | 失败／求助重置巩固依据。重新独立通过只算重新学会，从该次通过起至少 24 小时后，用不同的实际题目来源独立通过，才能巩固。 |
| 同日多次通过把 raw pass 数推到 21 天 | 仅到期且换实际题目来源的独立复习计入有效场次。初次通过后 1 天，第二／三场后 7 天，第四场后 21 天；提前重复不提升级别，也不推迟原来的到期时间。 |
| 两份 6.5 模考填“自评”也就绪 | 章节作品、写作／口语专项、模考共用外评来源校验，拦截明确的自评和 AI 来源。提示说明信息由用户登记、本站不独立核验，不生成 AI 分数。原有分数、单项、不同试卷、不同日期等门槛不降低。 |
| 最近失败 A，却优先推未学 B | `continueNode` 先恢复仍可进入、未完成或到期的最近节点。用户主动开始 B 会更新位置并可继续 B；A 的修补需求仍保留。 |
| save 返回 false，作品／评阅仍显示成功、短暂点亮 | 只有实际提交成功且记录符合门槛才显示成功回执。主 App 存储错误不发布未提交的完成状态。表单在当前页面保留输入，可显式重试。 |
| 同一记录收到其他标签页更新、或重新锁定 | 加载远端已保存进度；保留本地输入并暂停该表单自动覆盖，显式重试合并最新设置及其他记录。锁定时隐藏表单而不卸载，重新解锁可继续编辑。 |

失败后尚未重新通过时立即需要修补；重新通过后的 24 小时冷却期内 `stable=false`、`due=false`，冷却到期后可做真正的延迟检验。题库编号变化但实际题目、答案、音频来源不变，不算新证据。

## 原始记录与备份边界

- 保持 `version:2` 和 storage key 不变。旧 v2 备份导入、再导出保留原始 attempts、评阅、作品、草稿和位置；新的派生状态会更严格，不删除或改写原记录。v1 仍明确提示旧备份不可换算，并保留原文件。
- 增加可选 `quizHelpAt`，记录查看答案／提示或返回讲解的最新时间，包含尚未提交的求助。新字段进入导出／导入；未来／无效时间拒绝导入。
- 旧版未提交的 assisted round 没有求助时间，读取时不会偷偷补时间。仅用户明确重新开始检验时记录新的边界；旧的通过不能跨过它恢复巩固。
- `submitQuiz` 保留全部原始 attempts，避免 12 条截断把失败边界删掉而复活旧巩固。导入仍受原有 6 MB 文件限制及结构／时间检查；单节点防滥用上限为 100,000 场。
- 新备份超过 12 场时，旧 v11 parser 会拒绝。因此回滚不能靠裁剪历史；保留完整备份，继续使用新 parser，或将新版导入能力随回滚一并保留。旧代码忽略新求助字段时也不能准确重建新规则。
- `nextReviewAt`、`continueNode`、`changeStudyStep`、`restartQuiz` 新增可选测试时间参数，原调用保持兼容；`noteQuizHelp` 为新增公共方法。`Save` 仍同步返回 boolean。

## 验收证据

[汇总及四个生产文件 SHA-256](verification/map-reliability/test-results.json)，[模型基线复现](verification/map-reliability/model-before.json)，[修复后 23 场景](verification/map-reliability/model-after.json)，[192 项外评／导航](verification/map-reliability/reviewer-navigation-after.json)，[真实 React 浏览器 38 项](verification/map-reliability/browser-after.json)。

| 验收 | 结果 |
| --- | --- |
| 审计基线模型 | 复现旧通过→失败／帮助→即时改对、重复升间隔、自评模考就绪、继续节点错误，共 5 个观察。 |
| 原有地图检查 | 12,881 项通过，168 组真实教材数据；历史截断断言改为保留全部原始记录。 |
| 真实课程场景 | 23／23，通过失败→重学→跨日真巩固、同日与提前重复、实际题目相同、未来／倒序时间、旧记录与备份。 |
| 外评与继续节点 | 192／192，包含自评／全角／标点变体、明确 AI 来源、正常姓名、标准保持、手动跳过与备份保留。 |
| 真实 TSX 源码组件 | 74 项通过；基线模式 12 项断言实际复现虚假成功、瞬态解锁及冲突丢输入。使用持久 hooks/effects harness、合成依赖和内存存储。 |
| 真实 React 19.2.6 + Chrome DOM | 38 项通过，390 px，独立临时 profile。内存存储注入失败与恢复、模拟多标签原始字节冲突、StorageEvent、锁定后输入保留、单项门槛改变后的回执撤销。 |
| 今日练习 | 48／48；旧四天 raw pass 的 21 天用例改为有效 1／7／7 天场次，新增提前重复仍按 7 天到期。未修改今日练习生产代码。 |
| TypeScript、导航、经典进度备份、learning plan | 全通过。 |
| 地图及经典在线构建、离线构建与打包 | 全通过。Vite 既有大 chunk 提示不影响构建。 |
| Map worker 路由／源文件隔离与在线校验 | 全通过；1,944 文件、706,959,756 字节，包含教材与最小 demo。 |

截图仅使用合成记录：

| 表单 | 写入拒绝 | 同一输入重试成功 |
| --- | --- | --- |
| 模考 | [截图](verification/map-reliability/mock-write-rejected.png) | [截图](verification/map-reliability/mock-retry-saved.png) |
| 章节作品 | [截图](verification/map-reliability/project-write-rejected.png) | [截图](verification/map-reliability/project-retry-saved.png) |

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

也可打开 `http://127.0.0.1:43327/fixtures/save.html`，或 `?kind=project`；黄色控制栏只操作页面的内存存储。

## 集成协调与恢复记录

已在会话前段通知主发布对话 `01a0f10c-ff5c-7aa1-8a42-8ee650bbb2f5` 四个共享文件范围。此后原 `Documents/Codex` 目录消失，未提交工作树不可用；从同一审计基线在 `/tmp` 重建，完整恢复并重新验收，先保存 Git 检查点，再合并最新远端。未操作其他任务的脏树，也没有执行发布。

Codex app 的通知／附件连接随后返回 `Transport closed`，恢复后的追加通知未送达；交付以分支、PR 和本记录为准，父对话会收到任务完成通知。浏览器连接中断已通过独立 headless Chrome 真实组件验收补足。

现有 Obsidian 路径及指定 Dropbox 根 AGENTS.md 不可读，未创建替代 vault 或重复状态库。本文件保留本批集成、兼容与验收决定。主发布者集成时仅接收本分支相对在线主线的补丁，当前批次完成后串行上线。
