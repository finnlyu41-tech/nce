# 语法既有索引有限深化：整合交接

原独立交付快照：本包基线为从句/条件批次 `fc8c4ba4f8368705037907ec396e2a1bc4b72418`。新增 10 单元 / 33 个此前未深化 guide / 60 题 / 120 级提示 / 95 形式 / 80 同情境对比 / 91 错例。原 18 单元及既有课程、进度、路由和台账文件保持不变。仅本地实现并验证，没有 push、merge 或 deploy。

当前主线已在 v20 回执 `69bbe33` 之后取入精确来源提交 `9883720b0d55f26ab37cedf3ebcbbfd3ab8f1e64`，注册 10 个单元，唯一答案入口委托新助手并保留原关系从句规则；只更新原 33 行覆盖台账的 status/scope/remaining。已以 `2026-10-01-grammar-coverage-v21` 发布：运行源码 `a39bf70625dec4262889b9bfc25e6f0db53de4f4`，独立部署 [f488402d](https://f488402d.finn-english-studio.pages.dev/)，两条共享分支同步；上海时间 2026-10-02 00:02 完成正式／独立域名 114 项 HTTP、哈希与 MIME 回读，零传输重试。下文原作者的未注册结果和本地浏览器证据保留为来源快照，不能代替本次主线验收。

## 真实覆盖矩阵

|阶段|新增单元|新增唯一guide|新增分层题|本地累计单元/guide/题|
|---|---:|---:|---:|---|
|最初结构与代表内容|8|25|48|8 / 25 / 48|
|已交付B1（75b1cd7）|5|20|30|13 / 45 / 78|
|从句/条件（fc8c4ba）|5|19|30|18 / 64 / 108|
|本包剩余索引深化|10|33|60|28 / 97 / 168|

原教材数据实际为276入口、348课次关联、97唯一guide。`present-simple` / `past-simple` 在先前教学标签中可重复出现，不能按标签数虚报99个唯一guide。原台账52项planned减fc8c4ba的19项，精确得到本包33项，没有新增伪造教学来源或借用已有深化项凑数。

97/97是所有**既有guide都建立有限教学覆盖**，不代表英语语法全部完整、每个分支已独立练习或学习者已掌握。每条 `.coverage.json` 指向实际形式/对比/错例/练习ID，逐项保留scope与remaining，尤其仅识别、仅改错和未独立造句的分支。读讲解不算掌握，自由表达仍待核对，不声称官方IELTS考纲或预测成绩。

|顺序|单元|知识点|真实先修|
|---|---|---|---|
|19|指代、归属与拥有|pronouns / possession / have|sentence-core、noun-reference|
|20|性质、来源与距离|adjectives / origin / distance|reference-ownership、comparisons|
|21|指示、地点与时间定位|double-object / place / imperative / time-prepositions|questions-negation、reference-ownership、plan-timeline|
|22|时间标记与观察基点|already-yet / ago-before|past-present-perfect、past-background|
|23|旧习惯、习惯于与说话者评价|used-to / be-used-to / always-continuous|past-background、verb-complements|
|24|搭配、例外与程度变化|phrasal-verbs / except / same-different / so-such / double-comparison|noun-reference、comparisons、linking-ideas、verb-complements|
|25|将来过程、截止点与安排|future-continuous / future-perfect / future-be|past-background、plan-timeline|
|26|持续过程与不同参照点|perfect-continuous / past-perfect-continuous / future-perfect-continuous|past-background、past-present-perfect、extended-timeline|
|27|非谓语的参与者与时间：谁做、谁承受、先发生什么|object-to / nonfinite / nonfinite-passive / participle / absolute|verb-complements、passive-focus、relative-reference|
|28|守住原意的综合改写：先核对事实，再换结构|verb-review / rewrite|requests-nonfinite、information-focus、hypothetical-condition、extended-timeline、duration-perspective|

单元分组阶段按原group保持；be-used-to与verb-review的guide自身阶段继续按原索引，不把单元阶段错误强加到每个guide。

## 唯一主线负责人接入接口

本包只新增独立数据、模块、预览、测试及交接，未编辑共享入口。两个本地提交应在已发布B1之上依次审阅/整合，不重复cherry-pick B1，不覆盖发布owner的双区备份、错句复习或闪卡并发内容。

1. `app/grammar-curriculum.ts`：导入 `grammarClauseUnits` 和 `grammarRemainingUnits`，追加两包到真实 `grammarUnits`。新导出模块不会自动注册；避免在入口与别处重复push。
2. `app/grammar-curriculum-progress.ts`：导入 `grammarRemainingAnswerMatches`，将现有 `grammarAnswerMatches(practice,value)` 唯一函数委托给它，移除不再使用的直接 `answerMatches` 导入。read/check/finish必须使用同一实现。

新助手在4个 `requests-nonfinite-v0/v1-repair/produce` 上保留逗号边界，在 `structure-rewrite-v1-produce` 上保留题面要求的内部句号；其余全部委托前包 `grammarClauseAnswerMatches`。前包的6个relative逗号题和其中一个两句题继续严格核对，旧13题保留原matcher行为。支持NFKC全角逗号、中文句号与可省的最后句号；缺失/移动边界、把逗号换分号或将两句粘合不能静默通过。导入记录即使伪造matched=true也会按真实文本重新核对。

State/GrammarProgress、原保存键和version 1保持兼容，无进度版本迁移或闪卡schema改动。新增单元通过新的稳定unit/practice IDs保存，不修改旧记录。合并两个manifest的concept覆盖overlay至**主线**coverage-plan，保留原来源位置、group关系、scope/remaining；旧shared台账本包未写。更新原硬编码13/45/78及52planned的断言，用真实28/97/168与零个未深化既有guide验证。两个manifest为作者交付快照，registration仍为pending-mainline-integration，实际注册状态由主线台账/代码与门禁确认。

原独立包注册前运行 `node scripts/test-grammar-remaining.mjs --integrated`，按预期真实失败 **13 != 28**，不做内存追加或答案适配。主线接入后的真实 gate 必须通过才可称已整合；独立预览通过不代表已发布。本脚本还要求合并后的planned为0、旧18数据保持原语义、全部来源/答案/进度有效。

## 已完成验证

- 三条独立审查线逐题与全文交审60题。修正了重复梯子/围栏场景、按顺序给完形式的伪造句、明显绝对口令、自然put in与except for变体、有限谓语答案边界和比较对象类别；修改后回读确认。
- TypeScript `--noEmit --incremental false`、新模块/预览/脚本ESLint均退出0。
- 完整 `test-grammar-remaining.mjs` 最终scope同步后再次退出0：10/33/60精确差集、28/97/168实际统计、旧18语义指纹、原台账不变、33sidecar、先修存在/顺序/无环、独立新情境、348精确课次检索、18个NCE2非首位置关联通过。
- 真实TSX：60个正确作答 + 18个标点失败事件、54个精确guide/册次迁移回调；不提前显示参考、两变体重做、两级提示/重载、伪matched读档和旧18 matcher兼容通过。
- 真实makeProgressFile/readProgressFile往返15159 bytes，旧笔记/表达草稿、版本/损坏/未来日期处理通过。原13基线curriculum/depth/learning-plan/progress-save四套回归亦通过，textbook276/348/97校验前批通过。
- Vite独立预览构建1982模块退出0；1.25 MB入口包有>500 KB尺寸告警，本预览载入全部静态教学。没有把告警当部署通过，主线后续可按真实资源拆包；本线不扩展共享打包配置。
- Chrome154 / Node22，独立空白profile、localhost 4203：60次真实浏览器提交（58个正答、2个故意缺必要边界），10单元两组、先修链接、语义检索/AND空结果/清除、提示1保存再重载/提示2上限、无提前参考、失败结果重载保持、自由表达待核对、旧样例保留均通过，未捕获运行时错误为0。
- 实际教材跳转 `#/grammar/NCE2/33?tab=practice&goal=place&practice=transfer&unit=giving-directions`，guide标题与该单元迁移任务准确，重载地址/草稿一致。
- 已查看320/390 px截图，目录、提示、结果和迁移内容无水平溢出。证据 `work/remaining-browser-check/browser-verification.json` 与PNG另保存至恢复包，不提交浏览器profile、缓存、生成教材或学习者实际数据。

本轮曾遇exec服务断开；已保存恢复检查点，恢复后实际重跑并读到退出0和浏览器passed。旧的启动/空日志没有补记为通过，最终以以上已完成证据为准。

以上兼容证据针对本线保留的B1基线及其旧18内容。本线只读确认发布owner已包含v18与后续双区备份修改；未在本线复制或覆写那些共享实现。唯一owner接入后仍须在最新主线跑完整类型/构建、真实`--integrated`以及它自己的双区备份/错句/闪卡相关回归，不能用本地预览结果替代最新全站发布验证。

## 来源与内容边界

所有NCE关联由当前repo实际guide/entry解析，包含真实book/lesson/lastLesson/position；讲解、例句、对比和任务均为原创，没有复制教材整章。主要规则校核使用实际可读的官方资料：

- [主宾代词](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/personal-pronouns)、[反身](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/reflexive-pronouns)、[独立所有代词](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/possessives-pronouns)、[have got](https://learnenglishteens.britishcouncil.org/grammar/a1-a2-grammar/have-got)：角色、归属、拥有问法。
- [形容词位置](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/where-adjectives-go-sentence)、[双宾语](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/double-object-verbs)、[地点介词](https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2/prepositions-place)、[时间介词](https://learnenglishteens.britishcouncil.org/grammar/a1-a2-grammar/prepositions-time)、[短语动词](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/phrasal-verbs)、[成对比较](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/comparative-superlative-adjectives)。
- [完成简单/进行](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/present-perfect-simple-continuous)、[used to的不同用途](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/different-uses-of-used-to)、[未来过程与完成](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/future-continuous-future-perfect)：观察点、状态/活动、习惯/适应等边界。
- [不定式搭配](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/verbs-followed-infinitive)、[分词小句](https://learnenglish.britishcouncil.org/free-resources/grammar/c1/participle-clauses)、[Purdue悬垂修饰语](https://owl.purdue.edu/owl/general_writing/mechanics/dangling_modifiers_and_how_to_correct_them.html)：补足、逻辑主体、独立主格与被动/先后。
- Cambridge部分直页403，作者只采用已读取的官方搜索缓存/同站正文作为完成功能、in/into与except for等校核；失败链接未冒称成功打开，原创例句不标为该站或教材原句。

有限范围举例：have使役/义务、which one/ones、from…to…、国家身份叙事、same/different独立造句、so副词/数量结果造句、be-used-to独立造句、future-perfect-continuous从头造句、复杂非谓语/改写全分支仍未穷尽。详细边界以33条coverage为准，覆盖标签不能代替独立使用证据。

## 复跑与恢复

当前主线在 `studio/` 用 Node 22 以上运行；不带 `--integrated` 的旧命令只适用于原未注册包：

```sh
node scripts/test-grammar-remaining.mjs --integrated
node node_modules/typescript/bin/tsc --noEmit --incremental false
node node_modules/vite/bin/vite.js build --config previews/vite.remaining.config.ts --configLoader runner
node node_modules/vite/bin/vite.js --config previews/vite.remaining.config.ts --configLoader runner --port 4203 --strictPort
node scripts/test-grammar-remaining-browser.mjs
```

浏览器脚本要求任务专用空白Chrome profile与127.0.0.1:4202调试，不查看个人浏览器；独立进度键 `english-studio-grammar-remaining-review-v1`。本次测试端口在验收后可关闭，源码/静态预览构建/截图保留。

本包完整源码、Git补丁、计数、退出日志及浏览器证据保留在来源工作区的本地恢复资料中，不公开上传；中断检查点属于本地历史，公共接手以本文件为准。当前本线无内容或验证阻塞；主线注册、全站整合验证和发布由唯一负责人串行完成。

主线接入保留上述 23 个应用数据与模块文件的原始字节，未接入重复的临时恢复检查点。既有 B1、clauses 和全课程断言同步到真实 28/97/168 注册，仍保留前 18 个单元的语义指纹、原教材定位和逐批覆盖证据。两套独立预览识别已经接入的答案助手，不在主线替换它。主线验证日志保存在忽略的 `work/map-verification/v21-*`；旧进度格式、保存键、双区备份、地图与闪卡数据结构均未修改。

主线实测：实际注册门禁 28/97/168、原 18 内容指纹、新批 60 次正确及 18 次标点失败、54 个精确 guide/教材迁移回调、15,159 字节新批备份往返通过；全课程 672 项证据链、87 项实际 TSX 状态/交互、30,820 字节备份往返通过。v19 双区备份 20、恢复界面/宿主 14、Today 49、自动复习 consumer 19、FSRS 15、地图模型 12,881、类型、导航和变更代码 lint 均通过。在线、离线与两套独立预览构建通过，1,950 文件检查通过，全部 168 个题目 ID 进入在线、离线与地图包；教材索引及演示资源哈希保持 v20。既有大包告警仍保留。

发布者读回来源浏览器报告并抽看 320 目录、390 句号失败两张截图，副本只存于忽略的 `work/map-verification/v21-source-browser/`；这仍是来源旧基线上的本地浏览器证据。主线正式 v21 浏览器、实际文件导出到恢复、真实到期、真机和真实音频未验收。后补 clauses 浏览器脚本的目录计数由 18 对齐 28，语法检查通过，未重新运行该浏览器脚本；运行包未变。回退候选为 [v20](https://f5b34d85.finn-english-studio.pages.dev/)：保留完整进度，新 10 单元的草稿在旧版不展示，不可清除；不存在数据格式降级迁移。
