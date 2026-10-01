# 从句、条件与篇章焦点：本地交接

本包以 `75b1cd7dbc384d56378e2d2795294410620dbd76` 的 B1 交付为基线，新增 5 个单元、19 个原台账中未深化知识点、30 道练习、60 级提示、44 条形式、41 组同情境对比、41 条错例。原 13 单元 / 45 知识点 / 78 题的内容与生产注册保持不变；独立预览追加后为 18 / 64 / 108。仅本地完成，没有 push、merge 或 deploy。

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
- `node scripts/test-grammar-clauses.mjs --integrated` 当前按预期失败 `13 != 18`：此开关不追加注册、不做内存适配，专门阻止把独立预览通过误报成主线接入成功。
- 真实 Chrome 154.0.8037.59 / Node 22.23.2，任务独立空白 profile、localhost-only：30 道题逐题提交，两变体、先修、语义检索、AND 空结果/清除、两级提示/重载、重做、无提前参考、删去必要逗号失败且重载保持失败、自由表达待核对与旧样例保留全部通过；无未捕获运行时错误。
- 实测 NCE2 跳转为 `#/grammar/NCE2/7?tab=practice&goal=past-continuous&practice=transfer&unit=past-background`，实际 guide 标题/迁移任务与重载一致。关系从句没有本包 NCE2 来源，不伪造关联。
- 已查看 320 / 390 像素截图，检索/练习/提示/结果/迁移内容无横向溢出；截图与机器报告在 `work/clauses-browser-check/`（忽略构建目录，另做恢复备份）。

复跑（`studio/` 内）：

```sh
node scripts/test-grammar-clauses.mjs
node scripts/test-grammar-clauses.mjs --integrated
node node_modules/vite/bin/vite.js build --config previews/vite.clauses.config.ts --configLoader runner
node node_modules/vite/bin/vite.js --config previews/vite.clauses.config.ts --configLoader runner --port 4201 --strictPort
```

真实浏览器脚本 `scripts/test-grammar-clauses-browser.mjs` 要求独立 Chrome debugging 127.0.0.1:4202，不连接个人浏览器；启动后执行 `node scripts/test-grammar-clauses-browser.mjs`。本预览进度键为 `english-studio-grammar-clauses-review-v1`，原站用户保存不受影响。

## 教学校准与来源边界

课次关联从当前 repo 的 grammarEntries/grammarGuidesFor 真实解析，包含 NCE2 次级 guide 位置。NCE 仅作关联；以下资料校准形式与用法，讲解/例句/任务为原创，不复制教材章节，不声称官方 IELTS 考纲或成绩预测。

- [British Council：过去进行与一般过去](https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2/past-continuous-past-simple)、[过去完成](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/past-perfect)：过去观察点、背景/事件、此前完成和连接词的作用。
- [当前推断](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/modals-deductions-about-present)、[过去推断](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/modals-deductions-about-past)：依据与时间，不为情态动词设固定百分比。
- [非限定关系从句](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/relative-clauses-non-defining-relative-clauses)、[现实与第二条件](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/conditionals-zero-first-second)、[过去与混合条件](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/conditionals-third-mixed)：限定/补充、宾语省略、现在假设与过去反事实。
- [否定副词后的倒装](https://learnenglish.britishcouncil.org/free-resources/grammar/c1/inversion-after-negative-adverbials)、[高级被动复习](https://learnenglish.britishcouncil.org/free-resources/grammar/c1/advanced-passives-review)：外层倒装、事件先后和转述来源。
- Cambridge 官方 it/that/could/no-sooner 页面部分直读 403，只采用已检索到的官方缓存正文；不把失败页面记为成功读取。不将 No sooner did… 一概判错，本造句题明确指定第一件事过去完成、第二件事一般过去。

## 后续范围与恢复

本轮剩余 33 项由同一 grammar-depth 实施线负责，已经并行编写为独立 `depth-remaining/` 的 10 单元（19–28），不要求逐批确认，不编辑本包或共享入口。详单在本包 manifest 的 `remainingOwnership`。继续补完所有当前 guide 的有限教学覆盖，仍保留逐子范围待训练说明。

B1 的恢复来源已保存于 `/tmp/english-grammar-recovery-20261001/`，本包 source/patch/checklist 和浏览器证据另保存至 `/tmp/english-grammar-clauses-recovery-20261001/`。发生整合冲突时以各独立数据模块与明确接口为准，不覆盖用户进度或其他实施线工作树。
