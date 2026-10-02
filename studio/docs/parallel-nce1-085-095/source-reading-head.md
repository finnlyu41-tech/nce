# NCE1 85–90 source reading: head author

Author scope: lesson-nce1-085.mjs, lesson-nce1-087.mjs, lesson-nce1-089.mjs only. Baseline: `6b1faad2840bee06f9b824e72d5c551bb9acd273`. Status: `authored-pending-independent-blind-review`. No registration, model/UI/host changes, commit, push, merge or deployment.

实际读取本clone三个language JSON全体rows与内部sourceSha256。app/data/textbook-grammar.json entries → dist-online/grammar/index.json定位教材练习；漫画由dist-online/lesson-pages/index.json定位。下列12张图全部实际view_image核读。索引pageKey与图片印刷页码不同，来源使用项目索引key。

## 内部LRC散列

|模块|languageSha256 = JSON内部sourceSha256|
|---|---|
|85|`edabae1f55fa46acf295c911985d3e40cdb9d57394724be79cf49c02fa8ba8f2`|
|87|`9d83db03032cfdeb43e97b4543e6a91c14ce056c72749b1e5d41a34713e8bed1`|
|89|`bf1fcde99a481086014859c09b4173eb6f7ea65eb3f279b744b5fc503d156f1a`|

不是language JSON文件本身的SHA256。

## 实际核读教材图

|组|索引key|实际内容|图片SHA256|
|---|---|---|---|
|85–86|NCE1-177|85漫画及完整对话：just been、seen/saw、never/ever、April|`3c9177a55c5c2650c00bacec224ba3c9bddb96c461963b7eae0b415412fe485a`|
|85–86|NCE1-178|85注释：been to与been there、just近期含义|`b9f09288c5c7f59f51eba16ed6757251a7d32b96185cab09e6b11bee0906be3c`|
|85–86|NCE1-179|86配套图示：aired/cleaned/opened/sharpened/turned on等|`2f42fe110c4e59d2d837570b18829624e691831e46790a3ace3c7a7dadd1ae74`|
|85–86|NCE1-180|86书面A完成/过去对照，B已完成及具体过去记录|`19d4e3c5086e8f132bd609a8379716d947a7c06a2eb8b2760da92116ccdcffd9`|
|87–88|NCE1-181|87两格漫画及对话：送修时间、完成未知、仍在处理|`6b9d43b3b48efb42309f85077a72be59b26108f8c64296557e970b4d2550b172`|
|87–88|NCE1-182|87注释：否定疑问、was、drive into、try to+原形|`fbd06022e14dc40c5be6cb5d2671cb560819e3c71defcf2a0c59d2bb5cfbc96d`|
|87–88|NCE1-183|88完成核实接When did及不规则表|`5c6991e47385be06b1aad5fd2c5ee4bf1e4f3cf6ec96b0deb356765c5b246e4e`|
|87–88|NCE1-184|88书面A过去疑问否定，B完成状态及过去时间问答|`32e419038e230d3021010a2725cc5f1aaf5ba9c37eaa800eaa6bea6911b90d87`|
|89–90|NCE1-185|89两格漫画及对话：持续时长/起点及未决购买|`fb2c4607ba171d2fa321004d11c4c3b383f59d069bde5378ad4d9d7bc3e531a9`|
|89–90|NCE1-186|89注释：since、May I、yet、must|`975f4b612fdfb5fe78005f032d3e43ed74d490543708b8836481af2dbaecb257`|
|89–90|NCE1-187|90配套read/done/gone/spoken及不规则分词表|`115ba7eb14f6895dc36167daca7280cb0c05dcbc5f6f3dcd76db7169bc996731`|
|89–90|NCE1-188|90书面A过去疑问否定，B另一人尚未完成yet|`87acbc5fd93b85c5efa10207b9499cb93e23765cd726502f0179203a88f5d712`|

85索引180书面A第3行出现never been与was…1992并列的矛盾材料；本模块不依赖该行出题，没有静默修原页。89原文1976和twenty years属于教材情境，不按当前日期重算。

## 原声边界与扩展

- 85 completed-now：31.66 → 38.84；visit-experience：22.2 → 53.95（just been及46.81起never/ever）；definite-past：34.87 → 38.84。规则动作词和具体过去对照来自86索引179–180。review-b改为刚去电影院并已返回的未知核实，与diagnostic的一生ever经历不同。
- 87 completion-check：42.95 → 49.56；past-followup：32.18 → 39.11；unfinished-state：46.27 → 49.56。met/left/bought/found/sent等来自88索引183–184；not…yet是已注明的教学否定迁移，不冒称87逐字原声。
- 89 ongoing-duration-question：31.65 → 38.28；duration-or-start：34.87 → 48.13；not-completed-yet：73.9 → 80.43（cannot decide yet仅是未决状态线索）。完成否定及read/done/gone/spoken/seen/taken来自90索引187–188，不把89此clip当分词录音；worked持续任职是89结构迁移。

各clip start/end都验证属于实际LRC rows.time且start<end，未估算词级端点。

## 作者自检（非独立盲审）

- 每模块三目标、18题，六bank各三题，共54题；每题至少四条带reason近错。各模块首选完整输出无重复。
- 87区分未知完成、已知事件但时间未知、仅未完成证据、仍在工作的直接证据。89延迟bank加入已结束/仍持续的双记录判断，以及包含提问者自己的we信息角色。
- 使用author仅装配数据，接受集扩展后再次调用现有bindContent；未另建matcher或模型。补完完成助动词缩写、not yet位置、already句末、时间前置、spoken to/with、take shoes off语序以及five/5等有限自然变体。缩写扩展检查词边界，避免组合成错误缩写。
- 实际createCourseLoopModel绑定和initialState/inspect smoke通过；内部hash、clip端点、所有accepted和counterexample、大小写/弯撇号归一化均通过。该自检不冒充独立key-free盲审、完整UI操作或自然等待。
- own保持awaiting-human-review，保留初答/订正，使用真实或明确虚构事实；开放表达、实际听感、发音、24小时/7天自然复习仍需真人证据。

交父线独立盲审、factory/UI/source验证与freeze；当前不声称发布。
