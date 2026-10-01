# IELTS 第二批：L02 / R02 多选内容与接线边界

本批基于独立树的 `58d83a9`，其共享运行码仍为v21基线 `b46812e`。第一批内容已交唯一owner，未在本树登记。本批仅新增内容、纯投影/校验、有限源测试与文档，不改共享UI、学习引擎、持久化、Today、地图或第一批文件。

**18份原创刺激、18个完整多选组、96个选项**：Listening共用六组，Academic/GT各六组。每个素材含一组，四组TWO/5和两组THREE/6；选择数量是本批作者规格，非官方通用列表长度。42个参考所选项包含示范/引导；不是42道独立测验或42分。听力不能按两类别重复计数。

## 官方要求 → 教学节点 → 练习

| 要求 | 来源定位 | 教学节点 | 原创内容证据 | 当前网站状态 / 本批状态 |
| --- | --- | --- | --- | --- |
| L02 多选 | `listening-format` type1；`listening-multi-sample-order` 的三位置答案组；`scoring` | `listening-multiple-answers`，听说共用类别规则 | `curriculum/multi-select/listening.ts#listeningMultiSelectLesson`：六段80–89词录音文本、32选项 | 此新课程链缺失／内容就绪待接入，TTS未人工核验 |
| R02-A 多选 | `reading-academic` type1；`reading-multi-sample-order` 印刷页25–26；`scoring` | `reading-multiple-answers` / `academic` | `reading-academic.ts#academicMultiSelectLesson`：六篇115–128词一般兴趣短文、32选项 | 此新课程链缺失／内容就绪待接入，不模拟正式篇章长度与难度 |
| R02-GT 多选 | `reading-general-multi-idp` 的GT多选介绍；`reading-general` 的文本语境；`scoring` | `reading-multiple-answers` / `general-training` | `reading-general.ts#generalMultiSelectLesson`：六篇136–141词工作/日常短文、32选项 | 此新课程链缺失／内容就绪待接入，GT正文来源全文请求受阻 |

以上“缺失”指新ID的真实站内课程链。数据编写和纯测试通过不计已上线、全题型实现、Band或长期保持。旧蓝图仅作要求索引；本批不改其历史状态。实际接入与验收由owner按发布源码单列。

三个素材前缀为 `ielts-l02`、`ielts-r02-a`、`ielts-r02-gt`。每组task ID为完整material ID加 `-selection`。机器绑定由 `curriculum/batch-02.ts#batch02Coverage` 导出：

| 阶段 | 素材后缀 / 内容 | 接线后对应证据 |
| --- | --- | --- |
| 解释 | lesson.explanation：选择数、题干对象/时间/条件、逐项依据与输入方式 | 解释不算测评；每项选择必须独立成立 |
| 示范 | `-model`：完整选项与教练步骤、所有正/错项的准确依据 | `modelNotes`投影到question.why，现客观示范UI实际可见；不是只显示字母 |
| 引导 | `-guided`：另一组，中性方法提示，先留自己的完整组 | 错原答可提交并记错，正确订正后再前进；首答不覆盖 |
| 独立 | `-independent`：新主题/关系，答案/依据隐藏 | 原答、曝光、fresh/hinted，听力完整结束及实际声音确认 |
| 限时 | `-timed`：主动开始后的新组，每组180秒本地预算 | startedAt/elapsedMs/withinTrainingTime，超时仍保存；非官方单题时限 |
| 反馈 | 独立/限时的逐项来源与排除理由，限时组订正 | attempts保留；correctionAnswers/correctionNote/correctedAt独立；错因须结合原答，不能自动推断 |
| 复习 | `-review-a`、`-review-b`：沿用现有24小时规则，两组未曝光新刺激 | 原答/曝光/提示/播放；帮助与重复不算无辅助保持，耗尽不能重命名原组 |

每个选项有 `supported/contradicted/not-stated/different-target` 的教学标签、原刺激精确引文和具体理由。这些标签用于解释多选排除，不要求学习者作YNNG或分类题。真实但属于其他角色/时间的信息不能选；部分同义或关键词吻合也不能代替完整命题支持。

## 当前契约能表达什么

现 `SampleQuestion.options` 只渲染单选 `<select>`；每题 `answers[id]` 是一个string，`accepted[]`表示可接受答案之间的OR。把两个正确字母分成 `accepted:['A','C']` 会错把单选A判成完整多选；把两个答案槽分别允许A/C会误收A/A。本批均不用这些方案。

本批保留结构化native数据，再忠实投影为**完整字母组文本输入**：

- context展示全部稳定字母选项；Listening原稿保留在script并按旧UI隐藏，Reading原文可见。
- `question.options`明确省略，实际输入仍可选并写多个字母，没有单选下拉框或“选择字母组合”的伪选项。
- 一个输入框容纳整个集合，明示用空格隔开。两选项的2种排列、三选项的6种排列全部列为完整 `accepted` 字符串；每个字符串内部包含全部正项。
- 原引擎仅处理既有大小写/首尾及连续空白，保留raw字符串。逗号、连写、额外文本、未知字母、重复、少选或多选均不会自动抽取/去重后变成正确；非空错误仍可提交并留下首答。
- `correct/total`为每完整组0或1 /1，只有本站完整集合核对。官方多选样题有多个编号答案位置；本批没有官方逐位置或部分得分算法，不换算Band。示范不提交为学习者成果。

### 串行接口

`curriculum/batch-02.ts`：

| 导出 | 用途 |
| --- | --- |
| `batch02NativeLessonsFor(variant): MultiSelectLesson[]` | 返回共用听力及该类别阅读的结构化刺激、selectionCount、完整选项/键/依据 |
| `batch02LessonsFor(variant): SampleLesson[]` | 返回可在原引擎作答的完整字母组文本投影；不隐式注册 |
| `batch02Coverage` | 3个官方要求→课程→7阶段实际素材绑定，保持pending-owner-integration / authored-not-expert-reviewed |
| `batch02AdditionalSources` | 新GT IDP介绍和两个顺序/答案位置primary参考，访问方式显式 |
| `batch02ResponseContract` | 输入、核对单位、错误原答保存和未实现的原生UI/官方计分边界 |

`multi-select/projection.ts`导出 `completeSetAnswers`、`inspectMultiSelectEntry`、`projectMultiSelectLesson`；诊断函数纯读，不改变原始字符串，也不被暗接到提交拦截。`multi-select/validation.ts#validateMultiSelectLesson` 校验结构、唯一刺激、正集/数量、准确引文和投影完整性，不能自动判断语义或测学习效果。

`MultiSelectLesson`只复用现有七阶段/六材料拓扑，添加native task内容结构；其type imports不会反向读取共享catalog。没有新namespace、新调度器或State字段。

## owner持有的最小接线

1. 合并 `batch02LessonsFor` 进现目录，继续保留旧四课与第一批全部ID/原答/素材、sequence和保存版本。未选类别拒绝；听力material IDs共用，Reading两类独立。
2. 保存白名单/session上限由实际注册目录推导。若两批都注册，是每类别8课、总16个合法session，不沿用v21固定8；每课仍六材料、现scalar raw答案和严格恢复规则保持。
3. Today直达实际lesson ID，保留旧skill别名。地图只指真实课程；首批已交的目录/保存/Today串行修改继续由同一owner持有。
4. 中性化共享“两个答案/这两题/四课”等文案；本批每material是一个多选组。将新源测试纳入验证命令，随实际目录调整旧测试的四课数量断言，旧课行为继续回归。
5. 真实注册/刷新/保存/恢复/Today流程通过后，才能登记这个局部课程已可用。原生复选框不是文本投影的阻断条件，但不能宣传已提供。

原生控件的最小后续接口可为独立 `selection:{options:[{id,label}],selectionCount,response:'letter-set'}`，以fieldset/checkbox显示，仍序列化完整字母组到已有scalar answer。控件必须保留旧raw不明格式的可回看证据。**不要**把native选项塞入旧 `options`。若需官方逐答案分，须另定义answer-slot/计分单位及已核实规则，同步模型、保存校验和反馈；本批没有实施，也不凭记忆补规则。

## 有限源验证与证据边界

```sh
node studio/scripts/test-ielts-curriculum-batch-02.mjs
node studio/scripts/test-ielts-curriculum-batch-01.mjs
node studio/scripts/test-ielts-sample-sequence.mjs
node /Users/finnlyu/Projects/english-studio/studio/node_modules/typescript/bin/tsc \
  --noEmit --strict --module esnext --moduleResolution bundler --target es2022 \
  --lib es2023,dom studio/ielts-blueprint/curriculum/batch-02.ts \
  studio/ielts-blueprint/curriculum/multi-select/validation.ts
git diff --cached --check
```

第二批**6组通过**：native与官方引用/七阶段；18个冻结正集/96项来源；完整投影与可见示范；全部练习/复习排列及错误输入的真实匹配；四条variant/course完整流程；曝光与注册/评分边界。测试仅在内存替换真实旧模型的catalog import。匹配矩阵的每份状态都沿实际流程取得checkpoint，没有修改模型或接受表；示范只作数据检查，不提交。错误原答、错引导不能前进、错误订正不能开复验、24小时门槛、两份耗尽、共用听力跨类别曝光、提示及 `band=null/mastery=not-assessed` 全部核验。

首批6组、旧模型125项、strict TypeScript与diff检查通过。本树无依赖安装，只读借用已有编译器。Node22内置类型擦除有实验提示。独立QA先仅呈现stimulus/prompt/options/selectionCount固定goldens，再揭键；18组全部一致、96选项及91处存储引文引用闭合，不把它称专家校准。独立契约探针另检查5610个候选无错误集合被误收；不与六组源测试累计为新题量。

| 冻结作者文件 | SHA256 |
| --- | --- |
| `listening.ts` | `deb3026c3011f528a63bc2cf4a127a9a34c8765df84f902199483f7e746757b9` |
| `reading-academic.ts` | `88f1e370add6de74d54bd44fe0f0cde9683edfef9657d05d43f57baa48523bf6` |
| `reading-general.ts` | `8b738412b9e35ad153303b69d71758b77973a87236f2fbc51b5f77e58dcf4adc` |

未验：正式注册/存取/Today、该批浏览器与手机、设备实际TTS与离线voice、专家内容审阅、真实24小时保持。模拟时间和音频事件只证明条件规则；80–89词不能证明60秒TTS看守够用。走完地图/课程不能计Band或全部多选难度已覆盖。本轮不push/merge/deploy。

## primary来源

- [IELTS Listening format](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening) 与 [Academic Reading format](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-reading)：本轮直读，多选数量依实际指令。
- [IDP GT Reading question types](https://ielts.idp.com/bangladesh/prepare/article-question-types-general-training-reading)（[同名global页](https://ielts.idp.com/prepare/article-question-types-general-training-reading)）：本轮官方搜索摘录明确2/5、3/7；direct fetch失败，访问标partial-fetch，不声明全文已读。这些示例不是官方固定池长度。
- [Academic官方样题](https://ielts.org/cdn/Sample-tests/ielts-academic-reading-sample-tasks-2023.pdf) 印刷页25–26、[听力电脑样题答案表](https://ielts.org/cdn/computer-delivered-sample-tests-listening/ielts-listening-computer-delivered-multiple-choice-more-than-one-answer-answer-key.pdf) 第1页：直读确认多个编号位置/样例允许顺序变化；不复制练习文章/问题/选项。
- [评分说明](https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail)：官方每正确答案1分；未找到完整的部分选对/过选/重复算法，不推定。GT独立顺序答案表本轮未取得，本批任意顺序是原创规则。
- BC GT页面的多选栏目误嵌Listening任务，不用那段任务证明GT Reading结构。地区页或旧特殊安排的播放/计时条件不推广到当前普通考场。
