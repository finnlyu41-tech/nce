# IELTS 第五小批：单答案听力与段落主旨标题

固定当前共享分支基线 `11688d6c3d513e116dc8fe7927b15042aeaed359`，独立分支 `codex/ielts-content-batch05-20261002`。第四批 `1130ee261dbae5eef137710e6a27fafb739229a0` 已交唯一 publisher 排队，本批不修改冻结包、不假定它已注册。100 行完整覆盖台账仍以第四批交付的 v30 快照为基准；本文件仅追加本批具体候选证据，不能将局部链计为全部题型或 Band 能力。

选择 L01 Listening single-answer multiple choice（Academic/GT 共用）与 R06 matching headings（A/GT 独立）。不重复 L02/L03/L07/L12/R02/R04/R05/R09。L01 现有局部题库/小练习不等于专门七阶段链；R06 在当前专门 catalog 中不存在。R06 对整段主旨与支持细节作区分，不是上一批的具体信息定位。

| 类型 | 正确语义与本组缩小设计 |
| --- | --- |
| L01 | 单答案变体三选一，按录音信息理解完整题干。每题 A–C 三项各有完整文本；三题各用自己的选项，不是共享配对或多答案集合。每份原创单人脚本目标 90–110 词。 |
| R06 A | 三个标记段落 A/B/C，五个完整标题 i–v；每项对应整段主旨，标题不得复用，两项未用。一般兴趣原创短篇正文目标 210–270 词。 |
| R06 GT | 同样主旨/不可复用规则，独立生活/工作/一般兴趣三段篇章；不拼接三个不相关通知。材料与 A 隔离，不声称正式 Section 3 难度。 |

本轮三个官方格式页均直接打开成功。官方要求标题多于待配段落、不可复用；段数/五标题/Roman ID/全部三段都测且无预给示例为本组设计。听力单选不套填空的词数或原词复制规则。180 秒均是本地练习预算，不是正式单题时限。所有文字/选项/标题/键均自写虚构，不复制题库、原音轨或官方长文。

## 原创七阶段链

本批三条物理链、18 份材料与54项题目，包含示范/引导，不是54道独立考试题。每链使用 model、guided、independent、timed、review-a、review-b 六个不同情境；解释与反馈另由七阶段绑定指向。

| 阶段 | 实际内容与应保留证据 |
| --- | --- |
| 解释 | 完整关系单选或主旨与细节区别，选项/标题规则；读说明不算掌握。 |
| 示范 | 唯一可见 model/modelNotes，引用原材料核对全部候选；教练示范不是学员首答。 |
| 引导 | 中性方法提示的新材料，原答及辅助条件保留。 |
| 独立 | 未曝光新材料先作答，保留 raw/fresh/hinted；听力完整播放和声音确认。 |
| 限时 | 主动开始180秒预算的新材料；超时首答照存，不模拟正式卷分数。 |
| 反馈 | 整句/整段依据和候选排除；原答与订正分离，不从选项自动诊断错因。 |
| 复习 | 依既有间隔用两份未曝光新材料；辅助条件记录，耗尽不重置为新题。 |

R06 的作者正确键三项互异。现有 select 可以记录学习者的重复错答，模型按各题依据核对并保留原字符串；不会自动清除、静默重新分配或把重复错答当正确完成。看见某词或某个真实细节不足以证明整段的主旨标题。

## 独占文件与主线接口

仅新增 `ielts-blueprint/curriculum/batch-05.ts`、`batch-05/` 三份原创课和纯 validator、`scripts/test-ielts-curriculum-batch-05.mjs` 与本说明。共享 UI、catalog、State/schema、评分/进度/复习存储、路由、Today、打包均不改。

导出 `batch05LessonsFor(variant: Variant)`、`batch05Coverage`、`batch05AdditionalSources`、`batch05ResponseContract`；缺类别/未知类别拒绝。所有绑定为 `authored-not-expert-reviewed` / `pending-owner-integration`，只标内容候选，band=null。源路径、官方要求 L01/R06-A/R06-GT、阶段材料 ID 和期待证据可追踪。纯 validator 检查完整选项/标题映射、不可复用正确键、来源短引、独立材料和七阶段；不自动理解主旨或评分能力。

L01 context 保留完整三题及各题 A–C 文本，q.prompt 保持同一题干，q.options 存字母；script 是唯一发声文本，练习不提前揭原文。R06 context 同时保留标题映射与段落标记/正文，q.options 存 i–v。既有普通 select 存 event.target.value；historyContext 保留原题纸，不能转入第二批多答案 checkbox。现有单声部语音不能证明多人换轮、口音覆盖或真实可听质量。

基线实际每类别10课、20会话键、120材料引用、84唯一材料；只加本批为12课/类别、24键、144引用、102唯一素材。第四批先接入后应从主线真实 catalog 按 lesson.id 去重重算（届时14课/类别、28键、168引用、120唯一素材），不能写死基线总数。新测试只在内存注入课程，真实 parser 和 controller 不改，计数由当前课程与本批去重推导；主线接线后避免二次注入。

## 有限核验与剩余边界

独立审查先从完整去键题纸/录音或段落推导唯一答案、逐一评估全部候选并冻结，再揭键核对反馈/中性提示/教练示范。遇到双标题、宽泛选项或支持不足先修正文/题干/候选并重新盲核影响范围，不能靠作者意图裁剪。原始/修订去键及冻结报告分开保留。听力去键冻结18键且与作者一致，54候选逐一核验；揭键18条反馈的46处短引、36错误候选排除、6提示及4示范步骤均通过，旧报告和题文不变。阅读盲审独立概括36段主旨并核180候选，72处正向短引精确；给定标题集合内未见双合理整段标题，36键与作者一致。阅读揭键核对36条反馈的53处精确短引、144个错误标题排除、12提示及8示范步骤；一处反馈仅将干扰标题描述与原文早期目标分开，不改正文/题干/选项/键，原冻结报告保留。最终差异核验通过，反向替换后的整文件hash与旧源码一致；没有剩余文本阻断。作者自查不是独立盲审，有限代理语义QA不是专家校准。

运行 `node scripts/test-ielts-curriculum-batch-05.mjs`。脚手架涵盖：七阶段和坏内容拒绝、冻结键/全部候选可见/精确引文、重复错答保留、真实模型和 strict parser 往返、主动计时/声音条件、订正分离、两个延迟新题与辅助/耗尽、动态容量和类别隔离/共享身份。后续操作使用反序列化后的真实状态；固定模拟一天不等于实际24小时。有限回归为前三批 source、既有125项模型和TypeScript；当前完整source 6组/347次真实parser往返通过，前三批各6组、既有125项模型和TypeScript通过；最终源hash及输出以交付receipt/log为准，未跑的检查不计为完成。

仍待主线：生产接入、真实浏览器/320/390、真机实际语音和回放时长、实际24小时保持、专家难度/评分校准。六类视觉/表格/流程/多人轨/口语原作品/人工审阅接口缺口保持，不将文本练习冒充这些功能；不上传个人音频、不接第三方服务、不新增费用。无push/merge/deploy，不开启额外批次或网站缺陷任务。

官方规则来源：[Listening 格式](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening)、[Academic Reading 格式](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-reading)、[GT Reading 格式](https://ielts.org/take-a-test/test-types/ielts-general-training-test/ielts-general-training-format-reading)。本批direct-open与第四批历史partial-fetch分开记录。
