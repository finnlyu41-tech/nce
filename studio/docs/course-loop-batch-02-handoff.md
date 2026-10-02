# CL02：教材7–8、9–10、11–12候选交接

已完成三组原创内容、最终独立AI盲审及真实v32 factory测试；仅交由唯一发布负责人 cloud task `01a0fa39-c2a2-7239-87b4-b0a9c091f0ba` 串行整合。没有注册、推送、合并或部署新课。原13条真实时间验收档案及其他工作树未改动。IELTS04/05不属于本批。

## 冻结基线与文件边界

- 仓库：`finnlyu41-tech/nce`。先核对指定 `codex/english-studio-online-20260926` 与 `codex/ielts-map-20260930`；两者本地取得的head均为 `293c4d0dafcf1371eeb449fc2f9e45d468fe9688`，没有以main代替。
- 运行时：`7c1ec8402fdf895fe8e4dcd12344cbadc2cae479`；文档head：`293c4d0dafcf1371eeb449fc2f9e45d468fe9688`。两者只差已有README和CL01发布文档。本批独立worktree从后者建立。
- 独占新文件：`studio/course-loop/batch-02/`，及 `studio/docs/course-loop-batch-02-*`。本批不改已追踪共享文件、旧CL00/CL01文件、教材内容或音频文件。
- 本机可见仓库/祖先与指定head未找到AGENTS；`.agents`被忽略，不据此推断云端工作区没有额外规则。整合方应遵循其实际工作区规则。
- 真正生产 `createCourseLoopModel(content)` 直接接收每课导出的 `lesson/byId/questionsFor/matches`。模型SHA-256：`ca6beb08372e65ff1300f139604480ecf8dd50451f2f470a585e3beeaccb9afd`；测试逐字比较运行时commit中的模型。没有使用旧v30源码替换fixture。

## 有限内容与覆盖

| 课程组 | 目标 | 原创任务 | 输入/选择 | 首答主键不同值 | 原创教学/开放表达 |
|---|---|---:|---:|---:|---:|
| `nce1-7`（教材7–8） | 当前职业询问、本人的职业、第一人称否定短答 | 18 | 14/4 | 14 | 3/1 |
| `nce1-9`（教材9–10） | 询问当前状态、说明自己、报告明确的第三人状态 | 18 | 15/3 | 17 | 3/1 |
| `nce1-11`（教材11–12） | Whose问物主、姓名所有格、所属物品的颜色 | 18 | 16/2 | 18 | 3/1 |

每组有诊断、引导、无提示换情境、订正后再试、延迟A、延迟B六个各3题的固定bank，共54题、9段针对性教学、3个开放表达任务。全部为手写内容，没有题目生成器、教材正文复制或把说明计作练习题。每题明确情境、输出范围、参考、判据、原因、变化点和语义反例（共194条）。来源仍是各组已有课文、原声、漫画；9个片段标签和时间范围只核对了既有LRC及source hash。

这是受限基础表达练习。第7组否定短答有意重复相同结构，以当前/过去/未来、申请/职业、活动/职位、本人/他人等不同明确事实核对含义；它们不是18种不同句式。三组不证明开放迁移、听说掌握或提分。

`coverage.json`与`groups-coverage.csv`是覆盖记录，不能被当作registry。既有总盘点仍为348教材课、276教学组，地图168组、地图外经典108组、NCE1漫画72组。基线生产loop仅1/3/5；本批7/9/11是本地候选；其余270组没有新闭环完成声明。之前26批队列仍是方案，不是Finn确认总量。本次范围跨旧方案CL01的7和CL02的9/11，不能据此宣称旧方案CL01或CL02整批完成；13/15没有在本批编写。

## 发布负责人所需共享接点

以下共享文件只有发布负责人可修改；本批没有改它们：

1. `studio/course-loop/registry.mjs`：显式导入三份新内容，按1、3、5、7、9、11顺序绑定真正factory。只注册这三组，不从覆盖表自动扩展。必须保留各模块导出的`matches`，不在宿主重建或放宽checker。
2. `studio/course-loop/host-contract.d.ts`：`CourseId`加`nce1-7/nce1-9/nce1-11`；`showSource`的lesson/comicKey联合类型同步加入7/9/11与NCE1-7/9/11。没有新的factory接口需求。
3. `studio/app/course-loop-next.ts`：当前`successor`只处理1→3、3→5，所有其他课返回7。整合必须明确扩展为1→3→5→7→9→11→旧13，并保持原高级路线、重置条件链接、锁定课程access-only和待办/到期优先规则。仅加registry会导致7/9/11完成后回到7；不能以本批factory测试替代这个新导航验收。

`studio/app/course-loop-progress.ts`现有选课解析、sidecar验证、read/commit/CAS已接收选课ID；不要求新存储接口。新snapshot/inputs键应由现有registry规则自然生成：`nce-course-loop-v1:${groupId}`及`nce-course-loop-inputs-v1:${groupId}`（groupId分别为`NCE1-7`、`NCE1-9`、`NCE1-11`），不是共享CL00键。各课`version:1`且尚未公开产生记录，无需本批迁移。旧原文必须继续保留；若发布前修改题目答案或规则，应重新做对应最终盲审。

`studio/app/course-loop-ui.tsx`的SourcePanel已动态绑定书、首课、语言SHA及clip.label；Today/summary也按registry选课。没有请求改音频服务、FSRS、基础保存模型或全局归一化。整合方仍需在真实UI检验三课source/assets、选课切换和Today一致性；本批没有运行新课生产UI或真实写盘。

## 已测证据及界限

- 独立AI盲审：54题首答54/54；真实factory探测共1402次（7组825、9组193、11组384）。最终未解决问题0。审阅者只收到无答案题干/情境/选项；自行给首答、等义和反例，probe仅返回所给答案的Boolean。模型中为定位目标题使用的标准前序事件不会向审阅者泄露答案。
- 最初发现问号格式说明与NFKC边界不一致，以及Whose题未明确排除please/one自然扩展。只修相关题干，随后真实factory复测最终规则：7组单题9例、9组六题48例、11组六题72例。please/one现在明确在该受限题范围外，不能称为错误英文。历史问题和原case保留在proof中。
- Node最终62/62，0失败/跳过/取消：本批27项（内容6、真实factory18、真实host边界3）+现有生产host12+原CL00模型23。语义匹配、原答保留、帮助标记、订正原因、重试非fresh、合成24h/7d/1d及两bank耗尽、跨课envelope隔离均通过。
- 真正v32宿主通过既有`batch-01/production-test-binding.mjs`打包实际TS parser/registry/Today/路线代码；不做source replacement。基线仍只注册1/3/5，所有7/9/11 envelope和sidecar均拒绝且raw保留，既有1→3→5→旧7回归通过。没有声称新1→3→5→7→9→11→13已通过宿主验收。
- 最终测试log：`proof/final-tests.log`，SHA-256 `60a99f6a0c74f1624cf1432ea41d851cfdae19c7df1c5d8bdf489ef075404ce8`。完整盲审case、无答案题干和hash随交接包附带，不放入生产目录。

重现：使用生产工程现有Node22依赖与既有语言资产，必要时执行原`studio/map/prepare-curriculum.mjs`生成ignored地图数据；从仓库根运行：

```sh
node --test --test-concurrency=1 studio/course-loop/batch-02/test-content.mjs studio/course-loop/batch-02/test-production-model.mjs studio/course-loop/batch-02/test-production-boundary.mjs studio/course-loop/batch-01/test-production-host.mjs studio/course-loop/test-model.mjs
```

本机只读借用既有node_modules/语言资产软链接，未安装新依赖；它们及生成的地图数据不在交接包中。现有host回归与本批边界测试断言冻结v32的三个已注册课程；发布负责人扩展registry/导航后需相应更新宿主集成测试，不应把冻结基线断言当作新增生产课程的验收。

## 整合验收条件与剩余状态

- **已实现**：三个候选内容模块、新内容专用有限matcher、真实factory探测工具及准确覆盖记录。
- **已测**：上述54首答、最终语义复核、62项Node验证及冻结真实host拒绝未注册候选的边界。
- **待整合**：发布负责人确认其更新后的基线，串行导入新文件，处理上述三个共享接点；确保真实单一路线推进到旧13、多个pending/due与Today一致、每课snapshot/sidecar/普通笔记互不覆盖、CAS失败保留输入、备份恢复保留原始记录。保持CL00/CL01、IELTS和原map/FSRS规则；source mismatch拒绝错课资源。以发布方自己的构建、TypeScript、真实宿主与320/390 CSS viewport QA为准。
- **待真人验证**：自然24h/7d间隔、学习者实际作答与开放表达、教师语言审阅、实体手机和可听音频；没有学习效果或Band提升承诺。

交接包只有本批13个新增文件、增量patch、逐文件SHA manifest及合成验证proof。发布负责人有权按当前生产基线串行整合；作者不自行push/merge/deploy。
