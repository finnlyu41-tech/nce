# IELTS 第四小批：听力句子与阅读段落信息

本批基于 `53487c8614e24b95096989c25db22576dc0cfc82`；对应 v30 runtime `0f347924d1ed114df83fa1cc6dd98ff5f3ae5d34`。完整官方要求、注册证据和剩余接口见 [100 行覆盖盘点](ielts-content-remaining-v30.md) 与 [机器可查台账](ielts-content-remaining-v30.json)。不重复前三批的 L02/L03/L07/R02/R04/R09。

新增两个题型、三条物理课程：听力 L12 两类别共用，阅读 R05 保留 Academic / General Training 两套材料。共 18 份虚构原创材料、54 项题目，包含示范和引导，不代表 54 道独立考试题。L06 是图示标注，本批没有用文字句子冒充图示。

| 类型 | 原创任务与核验边界 |
| --- | --- |
| L12 sentence completion | 根据录音信息补完整句的因果、目的、条件与归属。本组明示最多两个录音原词且词形不变；这是本组练习约束，不把 L07 的具体说明扩张为通用官方规则。此前直接读取的官方来源沿用；本轮两次有界直接打开超时。 |
| R05 Academic matching information | 四个标记段落中定位具体信息，区分主旨标题匹配；不推断答案按原文顺序。四段、三项、乱序为本组设计。 |
| R05 GT matching information | 独立日常/工作材料，保留具体信息定位与明示复用指令；本轮直接读取 GT 官方说明。不把 Academic 的其他题型规则移植到本题。 |

阅读每项均使用完整 A–D 共同段落选项，指令说明可重复及无需用完所有字母；两类别均包含实际重复。指令也保留在反馈原文中。题干不是完整段落的主旨。听力 script 是唯一发声文本，练习 context 仅含标题与指令，不提前显示录音原文；每题为完整句中的真实空格，无字母选项。普通一/二词练习不覆盖数字、连字符、缩写等专项规则。

材料均为自写虚构场景，不复制官方真题、音轨、答案或题库。官方页面仅作为题型规则来源。本批短篇、每份三项及 180 秒练习预算没有考试难度校准，不覆盖完整 40 题混合卷、多人音轨或正式长文。设备合成语音尚未人工试听；正确数只核对这份原创题，不换算 Band。

## 七阶段与证据

每条课程使用 model / guided / independent / timed / review-a / review-b 六个独立材料 ID；教学解释与答后反馈另有阶段绑定。

| 阶段 | 教学和练习 | 应保留的证据 |
| --- | --- | --- |
| 解释 | 原创方法、整句关系或具体信息定位、输入指令 | 看过说明仅是学习记录。 |
| 示范 | 唯一可见 model/modelNotes，逐题来源与排除关系 | 教练示范不计学员独立首答。 |
| 引导 | 新材料加中性方法提示 | 原答、辅助条件、答后依据。 |
| 独立 | 未曝光新材料先提交 | 原字符串、fresh/hinted；听力完整播放与实际声音确认。 |
| 限时 | 主动启动本地计时的新材料 | startedAt/elapsedMs/withinTrainingTime；超时首答仍保留。 |
| 反馈 | 逐项引用实际来源，整句与干扰信息对照 | 原答和订正分开；不从错误选项自动诊断原因。 |
| 复习 | 按既有间隔依次使用两份新情境 | 到期、原答、提示/曝光/播放条件；材料耗尽不重置成新题。 |

`batch04Coverage` 对应 L12、R05-A、R05-GT 三个要求，七阶段均指向实际材料与期待证据；仍为 `authored-not-expert-reviewed` / `pending-owner-integration`。100 行台账的完整范围缺口不会因本批局部链而消失。完成地图、教材或导航入口不代表完整雅思能力或达到 Band。

## 独立接线接口

`ielts-blueprint/curriculum/batch-04.ts` 导出 `batch04LessonsFor(variant: Variant): SampleLesson[]`、`batch04Coverage`、`batch04AdditionalSources`、`batch04ResponseContract`。缺类别/未知类别拒绝；听力对象共用，阅读 ID 与材料隔离。输入原字符串保留，检查单位为单个原创题，`band: null`。

仅主线统一接入课程、sources、bindings 与既有计数断言。不得重复注册或改旧课程 ID、sampleSequence 版本、State、schema、namespace、路由、评分/复习存储。本批阅读选一个段落字母，接现有单选；不能路由到第二批多答案 checkbox。听力接现有原词输入与完整播放证据。

v30 实际每类别 10 课；接入本批目标每类别 12 课、72 个材料引用，合计 24 个类别/课程会话键、144 引用、102 个唯一材料（共用听力只计一次）。本批测试仅在内存注入真实课程 parser/controller，真实 catalog 文件未改；接线前后避免重复注入。正式路由、Today、主站备份与 UI 由主线集成后验收。

需新接口的剩余题型仍保留在台账：原创可访问视觉刺激、真实表格格位、流程图节点/分支、多人音轨及换轮证据、原口语尝试与音频引用、带人类审阅者及维度证据的追加反馈。未实现图表不能替换成普通文字，未审阅维度不冒充官方测评。本批不实现这些共享接口。

## 有限核验与交付

独立代理先从去键刺激、指令、题干推导答案并冻结；随后才揭键核对 why/提示/示范。原盲审、修订盲审与揭键回执分开保留在交付包。阅读冻结 36 个单字母答案及 53 处短引；三处排除措辞收紧为来源未说明。听力原盲审及修订盲审分开保存；修订仅移除两处不参与正向证据的易歧义来源词，最终 18 空接受 31 个形式，包括 water、boundary markers、description 与 cloth 的本组合理宽泛完成。此判定不泛化为官方标准键或任意删掉中心词。作者自检不代替独立核验；接受形式由完整句意与来源支持决定，不凭作者意图排除合法短答。反馈只排除来源未支持的关系，不增加原文没有的绝对禁止。

运行：`node scripts/test-ielts-curriculum-batch-04.mjs`；有限回归为前三批 source 测试、既有 IELTS 模型测试及 `tsc --noEmit --incremental false`。结果：第四批 6 组通过、339 次真实 parser 往返；前三批各 6 组通过，既有模型 125 项通过，TypeScript 通过。源 hash 与完整输出在交付回执和日志中记录。

本批六组 source 检查覆盖：类型与七阶段、坏数据拒绝、冻结答案及引文、真实 controller 首答/订正/主动计时/声音条件、真实严格 parser 往返、两个新复习/辅助条件/耗尽、接线容量、原共享文件不变、100 行台账及类别/测评分界。每次后续操作使用反序列化所得状态；仅处理 JSON 不表达的既有可选 undefined reviewPromptId。隔天检查使用固定模拟时钟，不等于实际 24 小时。

未验：生产接入、浏览器/320/390、真机/实际声音、真人与多人音轨质量、实际 24 小时保持、专家评分/难度校准。保持 band=null、mastery 未评估。只提交独立源码/数据/文档与证据，未 push、merge 或 deploy。

官方来源：[Listening format](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening)、[Academic Reading format](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-reading)、[GT Reading format](https://ielts.org/take-a-test/test-types/ielts-general-training-test/ielts-general-training-format-reading)、[British Council GT practice overview](https://takeielts.britishcouncil.org/prepare/ielts-free-practice-mock-tests/general-training/reading)。直接读取/超时状态以 source 元数据为准；无本轮听力抓取成功声明。
