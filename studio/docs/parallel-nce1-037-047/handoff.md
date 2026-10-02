# NCE1 第37–48课：六组内容冻结交接

基底：`9310cb98a5d345f29bc345c6960aae0450effcc4`。独立分支：`codex/nce1-037-047-content-20261003`，worktree：`/Users/finnlyu/Documents/Codex/2026-10-03/task-10/nce1-037-047`。开始时只读核远端 `codex/english-studio-online-20260926` 与 `codex/ielts-map-20260930`，两者均为 `424efc1869e98cd7b19afd2c1ab7cab0e8380b4b`。未 push、merge 或 deploy。

六组 ID 为 `nce1-37/39/41/43/45/47`，教材组分别为 37–38、39–40、41–42、43–44、45–46、47–48。每组18个原创限定题，三个教学目标，六个阶段各三题；共108题。逐组提供目标、先修、中文词义、教学、独立新情境、近错反馈、修补、新题A/B、开放表达及人工复核要求。原答与订正、帮助与曝光语义由既有生产 factory 负责；没有第二状态模型。

|组|能力范围|真实教材核对|
|---|---|---|
|37|当前动作、已决定未开始的打算、计划信息询问|原课文及第38课练习；数字页79，印刷页75|
|39|物品处置询问、计划中的位置/接收者、否定祈使|原课文及第40课练习；数字页83，印刷页79|
|41|单位数量、单个可数物存在、不可数物存在|原课文及第42课练习；数字页87，印刷页83|
|43|复数/不可数存量询问、some肯定、not any/no零存量|原课文及第44课练习；数字页91，印刷页87|
|45|can能力询问、已确认能、已确认不能|原课文及第46课练习；数字页95，印刷页91|
|47|通常喜好、这次需求、个人喜好肯否定|原课文及第48课练习；数字页99，印刷页95|

实际查看了以上六张练习页，核对对应本组课文LRC/语言JSON、教材目录、漫画元数据。41组原声为物品量词背景，存在疑问教学依据第42课练习，音频标签明确区分。43组零存量是新教学转换，没有声称原录音含否定范句。

## 精确最小生产注册接口（交 root / publisher 实施）

1. 在 `studio/course-loop/registry.mjs` 导入六个 `./parallel-nce1-037-047/lesson-nce1-037.mjs`、`039.mjs`、`041.mjs`、`043.mjs`、`045.mjs`、`047.mjs` 模块，将六个模块按课序加入现有内容数组。仍通过现有 `createCourseLoopModel(content)` 绑定；保留各模块 `.matches`。每个模块导出 `lesson, questions, byId, questionsFor, matches`，lesson.version为1。
2. 在 `host-contract.d.ts` 的 `CourseId` 加六个 ID；`showSource.lesson` union 加 `37|39|41|43|45|47`；`showSource.comicKey` 加对应 `NCE1-37` 等六项。无需新字段或新Action。
3. 按原 registry 自动生成的键保存：`nce-course-loop-v1:NCE1-37` 和 `nce-course-loop-inputs-v1:NCE1-37`，其他五组同理。不要另建存储/进度/FSRS模型。
4. `next` / Today / map / UI 不由本线修改。由统一发布者验证现有注册顺序、续课（35→37→…→47→49）、Today去重和共享宿主集成。未注册课程继续保留经典教材路径。
5. 如统一宿主验收仍使用 `batch-01/production-test-binding.mjs` 的显式fixture路径表，请由宿主所有者添加上述六个路径。它是测试入口，不是产品注册来源。

本线没有改以上任何共享文件。本线测试用 `test-binding.mjs` 的 esbuild插件在内存中注入注册，仅用于真实生产组件/解析器验证；不会写 registry 或成为第二生产注册表。

## 已验收证据

运行：`node --test studio/course-loop/parallel-nce1-037-047/test-content.mjs studio/course-loop/parallel-nce1-037-047/test-blind-review.mjs`，27/27通过。

- 对六组逐题验证 `.matches` 的参考、缩写、大小写/空格/撇号、限定标点及语义近错；108个ID与108个场景唯一，六阶段完整。
- 真实 `createCourseLoopModel` 与生产 parser 验证帮助不能算独立、错答不能覆盖、错/受助独立题须分别订正、订正须匹配且有原因、原答不丢失、跨课与未知原文拒绝；两套复习题耗尽后要求新材料。
- 逐课执行未经改写的 SourcePanel `valid` 表达式；语言hash取 **JSON内部 `sourceSha256`，即LRC源hash**。校验实际LRC分块字节hash、JSON文件index hash、漫画hash/行数与图片字节hash；拒绝JSON字节hash替代及串课来源。
- 实际生产Workspace、宿主writer、SourcePanel、AudioSpace在新的本地Chrome QA profile执行。37/41/47真实原文/漫画/音频metadata与seek、刷新恢复首答均通过；47全流程含错误首答、订正、修补、开放表达待人工、等待到期均通过，无Runtime异常。`production-preview.json`及四张截图保存了证据。未声称音频可听性或发音得分。
- 首轮独立盲解108/108；发现的What's缩写、one单位、pump up分离词序边界全部修复。修订的8题由另一独立reviewer先写答案再查看模块；最终108题参考盲解（修订答案覆盖旧题）及所列合理变体全部通过。初轮原始报告保留历史问题，不伪装它是最终未修复清单。

## 当前边界与剩余工作

所有这些限定题测受控句型回忆和新场景语义选择，**不据此宣称开放对话迁移或长期掌握**。37组新计划题分别缺物品、颜色、目的位置，已避免重复泛问句冒充新信息任务。开放表达始终 `awaiting-human-review`；尚无实际伙伴/老师复核、真实听力/发音评估。24h与7d测试只为合成时序单测，未改变浏览器真实时间，未跑自然延迟，生产等待页没有未到期复习按钮。

自然用户档案、录音、13自然档案未读取、上传或改动。只访问全新QA profile里的合成记录；没有把其数据作为学习成果。没有重复全站构建：复用候选基底的既有生产证据与已打包教材，只为本diff构建实际组件测试bundle。

复跑预览：启动 `node studio/course-loop/parallel-nce1-037-047/preview-production.mjs`，再运行 `node studio/course-loop/parallel-nce1-037-047/test-preview.mjs`。需要已有依赖、打包教材及基底生成的 `map/curriculum.json`；`NCE_REFERENCE_STUDIO`可显式指定此基底目录。当前worktree的node_modules/dist-online只读链接未提交。预览内存注入的注册不能当成已发布生产注册。统一生产注册与完整宿主续课验收仍由root/publisher协调。
