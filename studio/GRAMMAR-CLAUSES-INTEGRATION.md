# 从句、条件与篇章焦点：整合交接

以下是原独立包的内容与验证快照；当前主线状态见文末。本包以 `75b1cd7dbc384d56378e2d2795294410620dbd76` 的 B1 交付为基线，新增 5 个单元、19 个原台账中未深化知识点、30 道练习、60 级提示、44 条形式、41 组同情境对比、41 条错例。原 13 单元 / 45 知识点 / 78 题的内容与生产注册保持不变；独立预览追加后为 18 / 64 / 108。仅本地完成，没有 push、merge 或 deploy。

| 顺序 | 单元 | 实际深化知识点 | 先修 |
|---|---|---|---|
|14|过去状态、背景与先后|past-be、past-continuous、past-perfect|past-present-perfect、present-time、plan-timeline|
|15|依据、可能性与过去能力|may、deduction-now、deduction-past、past-ability、could-have|modal-choice、past-background|
|16|限定对象与补充信息|relative、relative-omission、non-defining|noun-reference、negative-precision|
|17|假设的时间与距离|condition-unreal、condition-past、as-if|linking-ideas、past-background、modal-evidence|
|18|信息组织与焦点|formal-it、that-clauses、likely、inversion、reporting-passive|reported-perspective、relative-reference、passive-focus、modal-evidence|

每单元有易懂解释、形式/意义/使用条件、原创双语对比、单错误例和两组「识别 → 改错 → 新情境造句」。每题有两级提示，提交整轮后才显示参考。自主迁移保留待核对状态，浏览讲解不算掌握。各 `.coverage.json` 逐知识点列出实际形式、对比、错例、练习 ID 与仍未独立训练的子范围；不能把 64 / 97 解释成语法全部完善或使用能力已掌握。

## 文件与准确接口

本包只新增 `depth-clauses/` 数据、独立导出/答案助手、独立预览/测试与本交接。没有编辑闪卡 schema、录音、路由、导航、旧内容、旧 coverage-plan 或生产进度文件。

发布主线负责人完成以下两个受控共享接口后才可注册：

1. `app/grammar-curriculum.ts`：从 `./grammar-curriculum-clauses` 导入 `grammarClauseUnits`，追加至真实 `grammarUnits`。本模块自身仅导出，不自动注册。
2. `app/grammar-curriculum-progress.ts`：导入 `grammarClauseAnswerMatches`，使现有 `grammarAnswerMatches(practice,value)` 委托该函数；如 `answerMatches` 不再使用，移除其导入。保存键、State/GrammarProgress schemaVersion、版本 1 的旧记录保持原义。

答案助手仅对 relative-reference 的 6 个新题检查逗号边界，对 `relative-reference-v1-produce` 另检查题目明确要求的两句之间的句号。NFKC 支持全角逗号，支持中文句号，句末句号仍可省略。既有 matcher 会忽略标点；没有此接口时，限定/补充意义改变或两句粘成一句可能错误通过。所有旧题维持原匹配行为。新题 read/check/finish 均用同一助手，不信任保存文件里的 forged matched。

同时合并 `depth-clauses/batch-manifest.json` 的覆盖 overlay 与逐知识点 scope/remaining，更新当前主线已有的硬编码 13 / 45 / 78 或 planned 数量断言。旧台账尚有 52 项 planned 是未注册快照，本包其中 19 项为本地 implemented / pending-mainline-integration，不能只把数字改成 33 而漏掉证据。

## 已验证

- TypeScript、本包 ESLint、Vite 独立预览构建均通过；构建只出现既有大包尺寸警告。
- 原 curriculum、depth、learning-plan、progress-save、textbook-grammar 回归通过，276 教材入口、348 课次关联、97 guide 保留。
- `node scripts/test-grammar-clauses.mjs`：旧 13 单元与台账语义指纹、精确新增 19 项/5 组、原来源位置、先修 DAG、答案/提示、33 次真实 TSX 事件（30 正确与 3 错误）、8 个 NCE2 精确 guide/迁移任务回调、严格逗号/句号、重做/读档、9128-byte 保存再导入与旧笔记/表达草稿兼容均通过。
- 原独立包注册前运行 `node scripts/test-grammar-clauses.mjs --integrated`，按预期失败 `13 != 18`：此开关不追加注册、不做内存适配，专门阻止把独立预览通过误报成主线接入成功。
- 真实 Chrome 154.0.8037.59 / Node 22.23.2，任务独立空白 profile、localhost-only：30 道题逐题提交，两变体、先修、语义检索、AND 空结果/清除、两级提示/重载、重做、无提前参考、删去必要逗号失败且重载保持失败、自由表达待核对与旧样例保留全部通过；无未捕获运行时错误。
- 实测 NCE2 跳转为 `#/grammar/NCE2/7?tab=practice&goal=past-continuous&practice=transfer&unit=past-background`，实际 guide 标题/迁移任务与重载一致。关系从句没有本包 NCE2 来源，不伪造关联。
- 已查看 320 / 390 像素截图，检索/练习/提示/结果/迁移内容无横向溢出；截图与机器报告在 `work/clauses-browser-check/`（忽略构建目录，另做恢复备份）。

当前主线复跑（`studio/` 内；未加 `--integrated` 的旧命令只适用于原未注册包）：

```sh
node scripts/test-grammar-clauses.mjs --integrated
node node_modules/vite/bin/vite.js build --config previews/vite.clauses.config.ts --configLoader runner
node node_modules/vite/bin/vite.js --config previews/vite.clauses.config.ts --configLoader runner --port 4201 --strictPort
```

真实浏览器脚本 `scripts/test-grammar-clauses-browser.mjs` 要求独立 Chrome debugging 127.0.0.1:4202，不连接个人浏览器；启动后执行 `node scripts/test-grammar-clauses-browser.mjs --integrated`。本预览进度键为 `english-studio-grammar-clauses-review-v1`，原站用户保存不受影响。

## 教学校准与来源边界

课次关联从当前 repo 的 grammarEntries/grammarGuidesFor 真实解析，包含 NCE2 次级 guide 位置。NCE 仅作关联；以下资料校准形式与用法，讲解/例句/任务为原创，不复制教材章节，不声称官方 IELTS 考纲或成绩预测。

- [British Council：过去进行与一般过去](https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2/past-continuous-past-simple)、[过去完成](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/past-perfect)：过去观察点、背景/事件、此前完成和连接词的作用。
- [当前推断](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/modals-deductions-about-present)、[过去推断](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/modals-deductions-about-past)：依据与时间，不为情态动词设固定百分比。
- [非限定关系从句](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/relative-clauses-non-defining-relative-clauses)、[现实与第二条件](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/conditionals-zero-first-second)、[过去与混合条件](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/conditionals-third-mixed)：限定/补充、宾语省略、现在假设与过去反事实。
- [否定副词后的倒装](https://learnenglish.britishcouncil.org/free-resources/grammar/c1/inversion-after-negative-adverbials)、[高级被动复习](https://learnenglish.britishcouncil.org/free-resources/grammar/c1/advanced-passives-review)：外层倒装、事件先后和转述来源。
- Cambridge 官方 it/that/could/no-sooner 页面部分直读 403，只采用已检索到的官方缓存正文；不把失败页面记为成功读取。不将 No sooner did… 一概判错，本造句题明确指定第一件事过去完成、第二件事一般过去。

## 后续范围与恢复

本批当时剩余的 33 项已由 `9883720` 交付为 `depth-remaining/` 的 10 单元，并在 v20 之后随 v21 串行接入发布，详见[剩余批次交接](GRAMMAR-REMAINING-INTEGRATION.md)。本包 manifest 的 `remainingOwnership` 保留原交付快照；当前覆盖以真实注册与主线台账为准，每项继续保留未独立训练的子范围。

B1 与本包原始恢复资料、补丁及浏览器证据保存在来源工作区的本地忽略目录，不作为公共发布资产。发生整合冲突时以各独立数据模块与明确接口为准，不覆盖用户进度或其他实施线工作树。

## v19 隔离恢复与受控接线回执（2026-10-01）

前文是原作者 `fc8c4ba4f8368705037907ec396e2a1bc4b72418` 的独立包交接快照；本节记录其后的恢复接线，不将原本未注册的预览证据当作生产验收。

- 固定发布基线：`bce3d3342bde7ea5e657e892495dc787798d5e04`（v19）。隔离分支 `codex/grammar-clauses-integration-20261001`。
- 精确恢复源提交为 `52f2d993474c61cb6f56b54bdaa45f1b4de927f9`；其 19 文件差异与原 `fc8c4ba` 完全相同。恢复补丁 236864 bytes，SHA-256 `c14d719eb614da3171848e87aaa253cdcbb4f99e611894f237e6635e1ac4c172`，与 Git 原提交导出逐字节一致。
- 原 5 单元数据、5 个逐项 coverage、manifest、导出、答案助手、纯模型/TSX 测试共 14 文件逐字节保留。未采纳原树任何 `depth-remaining` 或其他未提交文件，也没有中断其编写者。
- 发布 owner 明确授权后，仅接线两个共享接口及覆盖台账：真实课程注册 5 单元；答案委托严格助手；19 行只更新 `status/scope/remaining`，来源、先修、分组等字段保持原样。v19 进度模块除 import 与委托两行之外逐字节不变，版本 1 与保存键保持原义。
- 合并后为 **18 单元 / 64 个不重复 guide / 108 题**；新增 **19 个无重叠 guide**。原 72 项深化台账中 39 implemented、33 planned。原 25 项基础覆盖不在这 72 项中。64/97 表示有限教学覆盖，仍不表示独立掌握。
- 必要断言同步登记新批；旧基础/B1 语义指纹、20 项 B1 逐项证据和 NCE2 原覆盖断言继续保留。NCE2 次级 guide 的完整总数仍为 77 出现 / 45 概念 / 53 入口，已注册覆盖去重为 59 / 34 / 42，未注册为 18 / 11 / 16；入口集合有交叉，不能简单相减入口数。

实际复跑结果（日志位于 `studio/work/clauses-integration/`，截图/Chrome 报告位于 `studio/work/clauses-browser-check/`）：

- 注册前 standalone 包在 v19 通过；`--integrated` 正确失败 `13 != 18`。受控接线后 `node scripts/test-grammar-clauses.mjs --integrated` 通过，直接读取真实注册与真实进度模块，不追加内存注册、不替换 matcher。
- 新批 5/19/30、348 次精确教材检索、9 个 NCE2 次级关联、30 正确 + 3 错误真实 TSX 作答、8 个精确迁移回调、6 个标点敏感题、两级提示/重做/重载及真实 9128-byte 备份往返通过。
- 全课程 18/64/108、432 条延迟证据链、57 个真实 TSX 交互/状态检查、真实 19648-byte 备份往返与旧记录兼容通过。原 depth、learning-plan、progress-save、276 教材组 / 348 课次 / 97 guide、导航回归通过。
- v19 双区备份 20/20、真实 TSX 恢复界面 14/14、Today 49/49、capability Today 19/19、map 12881 检查通过；这些 Node/TSX 检查不声明为生产浏览器验证。
- TypeScript、本批及两接口 ESLint、独立预览、在线 classic、离线 classic、在线 map 构建通过。构建保留既有大包尺寸警告。地图资料从 v19 已打包的静态教材重建，与发布树的 `map/curriculum.json` 逐字节一致；未执行发布打包、上传或部署。
- 使用新的任务空白 Chrome profile、localhost `43411/43412`，真实 30 道题逐题作答，两变体、提示保存/重载、重做、必要逗号遗漏失败、旧样例保留、自由表达待核对、精确教材跳转/重载全部通过。320/390 无横向溢出，已查看截图；未捕获运行时错误为 0。该报告明确 `localSourceRegistered=true`、`productionRegistered=false`、`productionPublished=false`。

主线已在 `76dc98e` 之后串行合入本分支完整提交链，保留 v19 验收记录，复验实际注册、语法证据链、旧进度、备份、Today、地图模型、类型和变更代码 lint 均通过。已以 `2026-10-01-grammar-clauses-v20` 发布，运行源码 `9e721b2b3d502b3bfc1b2e20bb2590ddf4ba062f`，独立部署 [f5b34d85](https://f5b34d85.finn-english-studio.pages.dev/)；两条共享分支已同步。主线在线／离线构建、1,950 文件检查及正式／独立域名 114 项 HTTP、哈希与 MIME 回读通过，无传输重试。教材索引与演示资源保持 v19，三个生产包均包含这 30 道新题 ID。正式新版浏览器与真实音频仍未验收；来源的本地 320/390 浏览器证据已读回并抽看两张截图，副本只留在忽略的 `work/map-verification/v20-source-browser/`。其余主线证据在 `work/map-verification/v20-*`。回退可使用 [v19](https://4813d8d1.finn-english-studio.pages.dev/)，应保留完整进度；旧版不展示这 5 个单元及其草稿，不能清除记录。其他设备/独立树的未推送状态未知，不由该基线的干净状态推断。其后 33 guide 已随 v21 发布；当前全量注册为 28/97/168，范围见上述剩余批次交接。

接线后复跑使用 `--integrated`；无此开关的命令用于原始未注册包，会严格要求原台账未变。真实 Chrome 复跑可覆盖端口：

```sh
node scripts/test-grammar-clauses.mjs --integrated
node scripts/test-grammar-curriculum.mjs
node scripts/test-grammar-depth.mjs
GRAMMAR_CLAUSES_PREVIEW_ORIGIN=http://127.0.0.1:43411 GRAMMAR_CLAUSES_DEBUG_ORIGIN=http://127.0.0.1:43412 node scripts/test-grammar-clauses-browser.mjs --integrated
```
