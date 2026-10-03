# 第二册1–3课：作者来源阅读与边界

以下为作者盲审前/指定复修快照；模块hash/答案数/当时pending状态是历史记录。root最终验收见author-review-001-003.md及delivery.json，不以此快照冒充最终hash。

## 指定复修交接（题面待重新导出盲审）

2026-10-03，按root指定修订，未打开blind题面/答案/报告：Ivo的收据明确实际三张；Tessa习惯证据改为完整二十次通勤记录；第一课末轮参与者角色题明确一位女学生。第二课independent/repair/review-a/review-b的question-negative四情境分别使用未知媒体调查缺项、已有确证的游泳项目栏、本人确认的在家午餐栏、经理待核实的通勤全量规律；prompt提供动作/对象、habit/current、询问/报告和肯定/否定竞争字段，由情境选择，不预指定正确时态动作。

有限自然变体按root指定逐句编列，详见下文。复修后内联Node再次逐一调用真实匹配和production模型：三课所有accepted通过、216条原near-miss全部拒绝；用末个有限变体走完首答/订正/修补/own pending/两模拟到期复习/restore/耗尽拒绝。专项验证apologized、turned the light off、当前分句is now、Are you now reading、无逗号but+didn’t、同主语he/she、第一动作后日期与第二次the box；姓名起头题拒绝句首日期，整复合句前置Now仍拒绝。未以blind答案扩充key，未改变原正确事实或near-miss。

复修后当前模块SHA-256：

- `lesson-nce2-001.mjs`：`32072f5b48bed299157a7e649ce26ab032030913edcc305d0c0c5aa63673f6df`
- `lesson-nce2-002.mjs`：`d11791ea687349bd4fe7aa60cd60b60ac3b1301d27cd0b3b9247bd713babe3a1`
- `lesson-nce2-003.mjs`：`bec8ba1d5a4e0af26253326498186ddc982c18a95ee80f2f198935b4398b8f73`

此处是作者指定复修与自查交接，不表示独立盲审已通过；请root重新导出题面并独立比对。

作者范围：仅三份 lesson-nce2-001/002/003.mjs 与本记录。读取的是真实 production model.mjs、既有 parallel-nce1-025-035/content-contract.mjs、被复用 author API 与本批 authoring.mjs。使用真实 content→author→bindContent.matches 和 production createCourseLoopModel；没有第二套匹配或状态引擎。

## 实际读取来源

工作树 `studio/dist-online/{language,lesson-pages,grammar,materials}` 是 root 建立的只读源链接，指向同任务 nce1-133-143/studio/dist-online 的真实打包；未改源。最初误查工作树顶层 dist-online 后已按 root 给出的 studio/dist-online 重新完整读取三份 JSON。另读到 task-2 static-export 同课正文；正式契约与本记录全部使用本树 studio/dist-online 重新核实结果。

完整解析 materials manifest、lesson-pages/index、grammar/index、app/data/nce-pages、app/data/nce-illustrations、app/data/textbook-grammar；逐课完整阅读 language JSON 的所有英/中/时间行，并通过 view_image 实际查看每课四张扫描（共12张，无下一课配对）。

| 文件 | 实际字节 SHA-256 |
|---|---|
| `studio/dist-online/materials/manifest.json` | `a9661a1a000654ffebb1eac3612ea6503b538d91332cde3c5cba159f43fa3730` |
| `studio/dist-online/lesson-pages/index.json` | `cdc8c2bfe160866267b5b6f1ee032d6e8d9f746895d4b3fed05baab0649e4596` |
| `studio/dist-online/grammar/index.json` | `743c6993a7c624604aa8b7a78982f84f4344754485e0b5e4bec08444419ec6c2` |
| `studio/app/data/nce-pages.json` | `a376eeb88cbf8a22b1810f5b95ff7b0f9c061c62b7426b73776a53637c3d7e96` |
| `studio/app/data/nce-illustrations.json` | `9481fd016c92ec6d785cb76cf847e719ea7cce77cf6d103ef1df8c596a634083` |
| `studio/app/data/textbook-grammar.json` | `7522d9c78e29e9becc17c4bbf786b442a65fbb0fa9875b985d117d90a41c54ad` |

materials manifest 的 NCE2 原书 PDF：480扫描页，extractedCharacters=0；SHA-256 `8e19ce05144e35257f551bb8e2c8a26920bb7790affb7105441a0b011731e201`。PDF页号为扫描/索引页号；每课四页的印刷页号分别12–15、16–19、20–23。

### 完整字幕 JSON 与来源 LRC

`sourceSha256`、模块 metadata 的 languageSha256/sourceSha256 均使用 JSON 内部的原始 LRC 哈希，不能用下面另一列 JSON 字节哈希替代。

| 课 | 全JSON字节SHA-256 | 内部LRC sourceSha256 | 全部行数/时间范围 | 实际LRC字节核验 | MP3 SHA-256（manifest） |
|---|---|---|---|---|---|
| 1 | `d781ee1348bec6bc42dfefcd5fd9e6f4ae18b9b83286420a498fbdc273c8cd85` | `49cee60b2fc13bf58afeece005626a32c94a187cfba2cbceb90db3b3d5235a08` | 18行；9.77–69.0 | `49cee60b2fc13bf58afeece005626a32c94a187cfba2cbceb90db3b3d5235a08`，与内部和manifest一致 | `fb0902661214356e6f7cafc390333cff2afbd1e88cb72f9cb7e50cb2d8deacb8` |
| 2 | `d4edf4a0110bb9e49d2c0dac2b920c7f093ea9a3c4c9ec505428df1b3182429e` | `4a8888bf4cc68102e12072e9e4cd7e67ada68f4086c27e007216b779761f8b33` | 19行；10.47–73.39 | `4a8888bf4cc68102e12072e9e4cd7e67ada68f4086c27e007216b779761f8b33`，与内部和manifest一致 | `920522372c2c40906251c76b0d66df56b506156a98707fdfcbcaf677746be6ea` |
| 3 | `ba31528c57f1da363ef6296a947b5e52537da26215f7b8766858e5414d0a6c55` | `1f1ead0cde31d51f2f982c7435450269f5994ce424a16bb5f99e5ae2f7018198` | 14行；11.05–66.55 | `1f1ead0cde31d51f2f982c7435450269f5994ce424a16bb5f99e5ae2f7018198`，与内部和manifest一致 | `406799968279017f40017e0de7e4b3c8e3692954b80bd79180512630b2f54136` |

LRC最后时间仅为末行起点：1课69.00、2课73.39、3课66.55，不是音频终点。作者没有聆听MP3，不声称真实听感或发音完成。所有引用clip是完整实际字幕行起点到下一实际行起点；未猜末行audio endpoint。

### 十二张实际扫描

lesson-pages/index对应前两页；grammar/index的pages对应后两页。每张实际文件SHA-256与索引吻合。

| 课 | 扫描页 | 来源 | 实际图片SHA-256 | 实际阅读内容 |
|---|---|---|---|---|
| 1 | 52 | lesson-pages/index | `2b85c293e3eea80575c316aa1d48ce0ed043e5e7c92224e175ce5e5dd287ce31` | 课文、词义、注释、原插图：人物谈话导致听不见演员；不能据此验证独立听力。 |
| 1 | 53 | lesson-pages/index | `a8a15a87e383911bd062519a641717255c7e2429ac8af297de671d735bbd8106` | 摘要；简单陈述语序；同词主宾互换改变意思；六成分说明。 |
| 1 | 54 | grammar/index | `76da29a9ae4503dace8e016362d48be80202447c7a76ef46b26b70d1b56392ca` | 七列表格：When可句首；主语/动作/对象/方式/地点/时间；排序练习。 |
| 1 | 55 | grammar/index | `8e43d4c257027dcf5873955c1fefccf37082a97f344dea03ef8cb05c99cc98af` | 理解与句型选择；them/they、位置关系；句子结构排序。 |
| 2 | 56 | lesson-pages/index | `c50a1f133a0970a8147fee5fe2c1059ff3847bd79da157c887e89374ef4bb212` | 课文、注释；on Sundays与此刻早餐；安排将来进行时只阅读未纳入评分。 |
| 2 | 57 | lesson-pages/index | `3884603cc2a3d965e315e87d7259f2e90f3f390f6f018b16527dc090f0f98d76` | Now vs Often and Always；普通习惯与进行动词、习惯问句及练习。 |
| 2 | 58 | grammar/index | `aefd1815b9cb498f5ad8e2e7e681f1a463a16c0545cdcf29de1737c95f5497cd` | 频率副词位置；What感叹句阅读但未作为本组三目标。 |
| 2 | 59 | grammar/index | `9c1bd7341defe7d253e60514ea124263811f3e8bd28f9c7d35c1fb9212638aff` | 理解、时态/位置词选择；I’ve just arrived句式阅读但不作本课评分。 |
| 3 | 60 | lesson-pages/index | `ab12885bc676a3967c433c933a2f7b66de878bae133bac194074bc837a33c4dd` | 课文与词义；lend/borrow方向；决定、购买与写寄实际不同。 |
| 3 | 61 | lesson-pages/index | `4694690fe9a7139b0273345121ab62a1d840ad58af0c7d72a19d06b158223855` | What happened一般过去叙事；时间先后；原文变位练习。 |
| 3 | 62 | grammar/index | `e58d3e077a2b62a2c1d6e0fe8150bbd68e9c9e918bd29b27b2b4bd42c5ffa42e` | 过去叙事延伸；双宾语与物+to/for+人；lend/send/pass与buy/make例。 |
| 3 | 63 | grammar/index | `f714275a7b364ca4d86ef3c10dc85e9c258fe4411d3ae3900793903f452c53d3` | 理解、数量not a single；句子结构转换与收件人连接。 |

## 目标与来源绑定

| 课/target | 完整clip区间 | 正文支持 | 扫描页支持与文字扩展 |
|---|---|---|---|
| 1 statement-order | 19.39–22.07 | 以I为主语的拥有座位陈述 | 53–54页陈述主干，原创简单陈述不是原文替换题 |
| 1 actor-object | 42.80–47.27 | 作者看一男一女：动作方向和对象 | 53页主宾互换原理，55页them；原创祝贺/道歉/呼叫等方向扩展 |
| 1 manner-place-time | 31.96–34.59 | 完整talking loudly行支持动作后方式 | 54页方式/地点/时间表与时间可前置；三项排列是扫描支持的text-only扩展，非该clip中全部出现 |
| 2 habit-now | 39.60–42.61 | 完整It’s raining again行支持当前动作 | 57页两时态对照；通常/当前/旧照片竞争的情境原创 |
| 2 frequency | 17.99–22.03 | never…on Sundays行支持零频率及范围 | 57–58页频率与位置；指定全/部分/零记录中的always/sometimes/never，无模糊阈值推导 |
| 2 question-negative | 60.54–63.84 | 完整What are you doing? she asked行 | 70.40–73.39另有习惯Do问行，57页对照；第三人称does和否定是先修+扫描原理的文字扩展，不宣称该clip全覆盖 |
| 3 dated-sequence | 21.01–24.26 | Last summer…went的已结束日期 | 61页一般过去及先后叙事；乱序记录重排原创，不复制原练习 |
| 3 actual-intended | 48.84–52.98 | 完整未寄卡的but行 | 60/63页计划、完成和零数量；did not和not a single联系实际结果 |
| 3 recipient-links | 28.95–33.45 | 完整waiter taught me…行支持人和物；下一行才是lend | 60页lend/borrow，62页双宾语to/for；介词换位是扫描text-only扩展，未伪称clip包含 |

textbook-grammar.json对应NCE2-1/2/3的lesson/lastLesson均为单课；catalog pages分别53/54/55、57/58/59、61/62/63，title分别简单陈述句语序、一般现在时与现在进行时、一般过去时。nce-pages starts=52/56/60。读取条目与图片确认后采用单课lessons:[1]、[2]、[3]，没有奇偶配对。

nce-illustrations.json当前sources只有NCE1，lessons中NCE2-1/2/3均缺项。已读原书页上的单幅插图，但没有可核实的NCE2漫画panel映射，不能宣称漫画源已实现或已通过漫画渲染；metadata comicKey仅按既有源接口提供键，root另验真实UI fallback。

## 原创题与评估边界

三模块各18题：diagnostic/guided/independent/repair/review-a/review-b每bank三目标各一题，共54题、216条逐题有理由near-miss。所有评估情境、问题和答案原创；正文只支持教学，没有把原书排序题当陌生迁移。

第一课后四bank使用含竞争候选的有限词库，让context决定实际动作、执行者/对象及方式/地点/时间，不在prompt预筛唯一正确字段。第二课后bank区分长期记录、当前视频和旧物/照片，频率需要从always/sometimes/never选择；review-b frequency一题是真实四选一完整句识别，唯一key选项，why明确选择识别不等于自主构句。其他53题是限定文字构句。第三课后bank有乱序时间戳、错误时间参照、计划与实际数量/结果、采购不等于制作/寄出、接收确认不等于反向给予；有限双宾语两形式显式枚举。

第二课复合习惯/当前句有限row[5]接受原句和当前分句的自然she’s/he’s变体；but前可有一个逗号或无逗号。诊断/跟练当前分句的now可在is后或尾部，其他对照遵从题内now收尾。明确排除整个复合句前置Now，避免把习惯改成当前范围。Are you reading now?另接受Are you now reading?。第三课but前逗号可省略、did not/didn’t有限等义变体；dated-sequence枚举明确he/she补出与日期位置，姓名起头题只允许第一动作后或句末日期，诊断/跟练不限制姓名起头时另允许句首日期；箱子修补第二动作可用the box/it。recipient枚举人+物或物+to+人。第一课另接受apologised/apologized拼写与turned off the light/turned the light off粒子位置。全部是有限完整句枚举，无regex语义放行；没有将接受名单视为所有自然英语的全集。

own始终awaiting-human-review；三份contentStatus仍authored-pending-independent-blind-review。作者自查只证明18题契约、键与near-miss边界和源hash/时间点一致。首答、订正、求助、修补与延迟状态都复用production model。程序模拟24小时/7天到期不能冒称自然等待已测。作者不声称已完成真实听力、口语、发音、广泛自主自由transfer、自然24h/7d保持或mastery；这些需要真实学习者、真实时间与人工审阅。

尚需root独立盲解、真实UI接入/源fallback和生产事件流验证；作者没有读取后续blind答案，没有通知publisher，没有commit/push/deploy，也没有读取个人学习记录、录音或凭据。

## 实际作者自检结果

2026-10-03：内联Node脚本逐一动态import三模块，调用真实production createCourseLoopModel。每课18题和三目标/六bank完整；全部accepted自身通过、全部72条near-miss拒绝；metadata内部LRC hash、单课分组及三个clip的实际相邻行端点一致。每课模拟一次完整事件流：diagnostic正确→learn→guided正确→independent三题错误首答→三题正确订正与原因→repair→own草稿→finish pending→review-a→review-b→题库耗尽拒绝；JSON restore后18条首答仍在。receipt保持listening:not-tested与mastery:not-assessed。模拟时间推进只证明调度状态，不是自然24h/7d效果证据。

供root冻结核验的作者文件字节SHA-256：

- `lesson-nce2-001.mjs`：`32072f5b48bed299157a7e649ce26ab032030913edcc305d0c0c5aa63673f6df`
- `lesson-nce2-002.mjs`：`d11791ea687349bd4fe7aa60cd60b60ac3b1301d27cd0b3b9247bd713babe3a1`
- `lesson-nce2-003.mjs`：`bec8ba1d5a4e0af26253326498186ddc982c18a95ee80f2f198935b4398b8f73`
