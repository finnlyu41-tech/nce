# IELTS 首批原创内容：L07 / R04 交接与覆盖

源码基线 `b46812e`（v21）。本批只新增独占内容、来源绑定、纯校验和测试，不改目录、地图、学习引擎、Today、State、保存或备份。`ielts-curriculum-v21-audit.md` 保存四科有限验收与其余缺口；本文件不会把旧 `e2efbd3` 蓝图百分比当作当前覆盖。

本批包含 **18 份不同原创材料、60 道题**：听力六份表单共24题，阅读 Academic / GT 各六篇、各18题。数量包含示范和引导，不能称为60道独立测验。听力跨类别复用同一素材ID，不能重复计数。六材料形状沿用现有 SampleLesson，解释与反馈不是额外新题。

## 官方要求 → 课程 → 素材

| 追踪要求 | 官方依据 | 教学节点 / 类别 | 内容证据 | v21 本课程链状态 | 本补丁状态 |
| --- | --- | --- | --- | --- | --- |
| L07 表单填空 | `listening-format` 的结构化填空、来源词与题目词/数字限制 | `listening-form`；听力共用 | `curriculum/listening-form.ts#listeningFormLesson`，六份英文表单、24字段、六段原稿及逐题依据 | 缺失：新增ID尚未登记 | 内容就绪，待主线接入；仅姓名、数字、最终确认与输入限制微目标 |
| R04-A 作者观点 | `reading-academic`、`reading-judgments-bc` 第2页 | `reading-writer-views` / `academic` | `curriculum/reading-views.ts#readingViewsLessonFor`；六篇一般兴趣短论述，18命题 | 缺失：新增ID尚未登记 | 内容就绪，待主线接入；短文方法训练 |
| R04-GT 作者观点 | `reading-general-bc` 的GT题型清单、`reading-judgments-bc` 第2页 | `reading-writer-views` / `general-training` | 同函数，但六篇工作/社区评论、18命题及素材ID全部独立 | 缺失：新增ID尚未登记 | 内容就绪，待主线接入；共享方法不借用Academic素材 |

“缺失”描述本批新ID的站内七阶段链，不否认原站已有基础说明和旧听读工具。新增蓝图/导航或本测试通过都不能将整题型标为已实现。接线后的实际覆盖应由主线按确切源码和验收回执另行登记；本内容交接快照保持 `pending-owner-integration`。

三个素材前缀分别为 `ielts-l07`、`ielts-r04-a`、`ielts-r04-gt`。以下所有后缀拼到该前缀；完整ID、来源ID和七阶段关系由 `curriculum/batch-01.ts#batch01Coverage` 直接导出，不靠标题猜匹配。

| 阶段 | 素材位置 | 本批内容 | 接线后须保留的证据 |
| --- | --- | --- | --- |
| 解释 | 对应 lesson.explanation | 栏目预测、词/数字政策；作者/他人、认同/反对/未说明、范围与条件 | 阅读解释不算测评，未选择类别不产生完成证据 |
| 示范 | `-model` | 原表单/原文、英文题干、逐题参考与准确引文；模型注解 | 示范不作为学习者独立答案 |
| 引导 | `-guided` | 新情境、方法提示、自己的答案与答后依据 | 原始attempts，错首答订正后继续保留；引导不能计独立迁移 |
| 独立 | `-independent` | 另一份材料；答案和听力原稿隐藏 | 原答、fresh/hinted/曝光；听力播放条件 |
| 限时 | `-timed` | 主动开始后再显示的新材料；L180秒、R150秒 | startedAt/elapsedMs/withinTrainingTime，超时作品仍保留；均非官方单题时限 |
| 反馈 | `-independent`、`-timed` 的 why；限时题订正 | 原答与来源依据逐项对照，具体修正或待核验问题 | attempts 不改写；correctionAnswers/correctionNote/correctedAt 独立保存；不自动诊断错因 |
| 延迟复习 | `-review-a`、`-review-b` | 沿现有24小时间隔换两份未曝光材料 | review 原答、间隔/曝光/提示/播放条件；两份耗尽后不冒充新题 |

表单用 context 展示真实栏目与编号空格，逐题英文prompt解释本题 ONE WORD / ONE NUMBER / HH:MM / digits only 等约束，不宣称所有 IELTS 题都用同一政策。逐字姓名、当前费用与旧价、开始与签到、物品自带与提供等干扰均有原稿依据。六份均82–92词，保留姓名首栏和明确更新的窄任务边界。

阅读各篇107–118词，题干使用英文，说明和反馈为中文。YES/NO可定位依据按原文顺序；NOT GIVEN须检查整个相关命题，不能拿常识补。独立语义复核纠正了六处题序，移除了提示中的具体缺失结论。每类别两套打破“YES/NO/NG各一”的计数模式，不为变化而打乱原文证据。

## 最小接口和所有权

```ts
import {batch01LessonsFor, batch01Coverage, batch01AdditionalSources}
  from '../ielts-blueprint/curriculum/batch-01';
import {validateCurriculumContent}
  from '../ielts-blueprint/curriculum/validation';

batch01LessonsFor(variant: Variant): SampleLesson[];
// 明确选择Academic或GT后返回 L07 + 该类别R04；null/未知值拒绝。
// L07 lesson/material ID共用；R04 lesson ID共用，material ID按类别隔离。

batch01Coverage: readonly CurriculumBinding[];
// requirementIds/sourceIds → lessonId/variants → 七stage materialIds/活动/预期证据。
// contentStatus='authored-not-expert-reviewed'；integrationStatus='pending-owner-integration'。

batch01AdditionalSources: readonly OfficialSource[];
// 新增BC教师指南；传 [...officialSources, ...batch01AdditionalSources] 给校验。

validateCurriculumContent(variant, lessons, bindings, sources, requirements): CurriculumIssue[];
// 纯内容引用与结构校验；不会判断真实语义、保存、评分或调度。
```

新内容文件只用 `import type` 引用 SampleLesson；共享 catalog 导入本批时不会因内容反向读取 catalog 形成循环。校验不读用户数据，不增加 namespace，也不再建复习引擎。

唯一主线接入的最小工作仍为：

1. 在 `sample-sequence.ts` 的目录合并新课，沿用旧四课ID、原素材、`sampleSequence.id/version` 和保存namespace。不要重写旧题或原答解释。
2. `app/ielts-sample-progress.ts` 目前最多8个session；六门课×两类别需要12个合法session，建议从注册目录导出上限与白名单。活动课程按当前类别核验，逐题键和每课六材料仍保持既有严格规则。旧记录仍需完整可读、可恢复。
3. `app/ielts-sample-next.ts` 原任务只按skill还原 `hub-*`，新任务必须携带真实lesson ID。保留旧别名，拒绝未知类别/课ID；Today不能将新表单或观点课指回旧课。
4. 目录与UI的“四课”“这两题”“两个答案”等文案按实际目录或中性题数更新。客观题模型不限2题，但内容线不改共享UI/model。原模型测试的 `lessons.length === 4` 是v21固定目录断言，主线需随六课目录调整，继续保留旧四课的实际行为回归；新增本批脚本纳入主线验证命令。
5. 主线验证真实登记→作答/刷新→保存与恢复→Today直达→新题复习，再记录该局部目标的实现状态。地图关联只指向真实课程，不能自动提升整个L07/R04、别的类型、Band或掌握状态。

内容线独占 `ielts-blueprint/curriculum/`、本批脚本和文档。主线独占catalog/map/UI、State/save/Today、公共验证命令与发布；本轮无push/merge/deploy，也无用户数据读取。

## 有限验证回执

```sh
node studio/scripts/test-ielts-curriculum-batch-01.mjs
node studio/scripts/test-ielts-sample-sequence.mjs
node /Users/finnlyu/Projects/english-studio/studio/node_modules/typescript/bin/tsc \
  --noEmit --strict --module esnext --moduleResolution bundler --target es2022 \
  --lib es2023,dom studio/ielts-blueprint/curriculum/batch-01.ts \
  studio/ielts-blueprint/curriculum/validation.ts
git diff --check
```

本树没有node_modules；借用本机已有编译器只读检查，未安装依赖。测试loader使用Node22.23.2内置类型擦除，会输出实验功能提示。

首批脚本 **6组通过**：

- 内容、官方追踪ID与七阶段绑定；非法类别、缺来源、错类别要求和重复素材引用拒绝。
- 24听力字段的冻结答案、输入政策、原稿准确引文和相邻干扰项。
- 36阅读冻结判断、准确原文引文、可定位依据顺序和计数模式多样性。
- 18唯一材料、听力跨类别曝光身份、两类阅读素材隔离和答案模型隐藏字段。
- 将新目录**仅在内存注入**当前真实 `sample-sequence-model.ts` 的目录import，四组variant/course链跑解释→示范→错引导首答→订正→独立→限时错答→反馈订正→两轮新复习。证明模型数据兼容，未改模型、未冒充生产注册。无声/失败/ended未确认均拒提交，失败播放记录保留；首答保留、24小时提前拒绝、提示状态、跨类别共用曝光、两份耗尽与 `band=null` / `mastery=not-assessed` 均核验。
- 旧四课身份保留，内容交接仍待接入与专家审阅，不产生学习者成果。

原模型回归 **125项通过**；strict TypeScript与diff空白校验通过。源码QA独立复核24听力字段与36阅读命题；阅读审查已见作者keys，因此仅标独立语义复核，**不标严格盲审或专家审阅**。

冻结作者源码 SHA256：

| 文件 | SHA256 |
| --- | --- |
| `listening-form.ts` | `5a673a89073f87d6591c98cfa1f6a13869e2887348062fe0d2a1f6ef423dfe60` |
| `reading-views.ts` | `c4edba4f17a4b9766ccef8dc86309a5b157368442c8b3635a6d36b2826ccb33d` |

尚未验收：主线真实catalog/save/Today路径、该批浏览器与手机、实际音频/字母拼读、离线voice可用性、专家内容审阅和真实24小时学习保持。音频通过旧设备TTS入口；voice未强制localService，60秒看守是否适合设备不能由脚本词数证明。模型模拟音频事件和时间仅验证条件规则，不证明声音或记忆效果。没有完整卷、难度标定或正式成绩结论。

## 官方来源访问边界

- [IELTS Listening format](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening)：本轮直读，表单与作答限制规则；本批材料为原创，不复制样题。
- [IELTS Academic Reading format](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-reading)：本轮直读，作者观点三类判断的定义。
- [British Council GT Reading inventory](https://takeielts.britishcouncil.org/prepare/ielts-free-practice-mock-tests/general-training/reading?language=en)：已有核实来源，本轮重新打开失败，不声称复读全文；保留显式GT题型并集。
- [British Council 教师指南](https://takeielts.britishcouncil.org/sites/default/files/2026-06/reading_tfng_.pdf)：本轮成功直读第2页，分别解释TFNG/YNNG、外部知识边界与随原文的题序。不从URL日期推定出版日期，不复制该文件的练习题或文章。
