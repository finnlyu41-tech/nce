# IELTS 第三小批：共享名单配对与句子填空

本批固定在 v25 `c64e3fa3a031b477a5c1cdf26172df9fd4206fcd`，继续两批已接入内容之后的有限缺口。选 **L03 Listening matching** 与 **R09-A / R09-GT Reading sentence completion**；两种题型共三条素材链，每类六份、每份三项，合计 **18份原创材料、54个作者题目**，含示范和引导，不能全算独立测验。听力跨类别共用，不重复计数。

独占新增 `ielts-blueprint/curriculum/batch-03.ts`、`curriculum/batch-03/`、`scripts/test-ielts-curriculum-batch-03.mjs` 与本文档。共享 catalog / UI / State / 保存 / Today、听力保存冲突及发布均由唯一 newowner 串行持有。本批没有改共享运行文件，没有新增用户音频上传、考官模拟、收费或复习调度，也不 push / merge / deploy。

## 选题与官方证据

| 要求 | 官方规则定位 | 内容 ID / 文件 | 有限覆盖 |
| --- | --- | --- | --- |
| L03 | IELTS Listening type2：编号项配到共用名单，作字母答案；BC第6页f：选项一次或可复用依本组指令 | `listening-matching` / `batch-03/listening-matching.ts#listeningMatchingLesson` | 六段单人说明，信息归属、最终安排、共享选项与真实复用；不覆盖多人换轮辨认 |
| R09-A | IELTS Academic Reading type8：原文取词、随题词数限制、信息题序；BC第4页：词性与完整句语法 | `reading-sentence-completion` / `reading-sentences-academic.ts#academicSentenceLesson` | 六篇一般兴趣短文，题干改写定位、原词形、一/两词短语和合法缩短 |
| R09-GT | IELTS GT专门样题第23–25页：句子填空、原文取词、两词上限与特定可选形式 | 同课ID / `reading-sentences-general.ts#generalSentenceLesson` | 六份工作/日常通知，素材与Academic隔离，不代表GT三部分或Section3长文 |

两题型可忠实沿用逐题答案契约：matching是每编号从**同一完整名单**选一个字母；sentence completion是真正完整句子的空格输入，不伪装成Y/N/NG、整组多选或开放写作。

源引用为已有 `listening-format / reading-academic / reading-general`，新增三个由 `batch03AdditionalSources` 导出：`listening-matching-bc`、`reading-completion-bc`、`reading-general-sentence-sample`。全部 primary 页面或PDF本轮直接读取，只转述规则，不复制官方文章、脚本、题或键；URL目录日期不视为已知出版日期。

**题序边界分开。** Academic sentence completion明确按信息顺序；GT当前官网把sentence列入combined completion组，并说答案可能不按原文顺序。GT样题确认独立题型存在，但不据此推广全部GT题序。本批GT有序只称“本课按证据顺序编排”。

本批词数规则是普通一/两词来源短语；没有数字、连字符或缩约词答案。不用开放作品的 `sampleWordCount` 冒充官方词数检查，也不改词形、拼写或数字来代替原答案。合法短/长形式由逐题语义复核和accepted列举处理，不靠统一截断。

## 原创材料与七阶段位置

Listening材料前缀 `ielts-l03`；两类Reading分别 `ielts-r09-a`、`ielts-r09-gt`。各有 `model / guided / independent / timed / review-a / review-b` 六份，不只是换人名或数字。

| 环节 | 实际内容 / 位置 | 接线后的记录与边界 |
| --- | --- | --- |
| 了解方法 | lesson.explanation：关系、输入与词数/复用规则 | 阅读解释不记掌握 |
| 示范 | model：完整刺激、共同名单或句子空、modelNotes和why | 教练步骤、依据显示一次；不当作学员首答 |
| 引导 | 不同材料，保留中性方法hint | 错原答可记；正确订正后前进，首答不覆盖 |
| 独立 | 不同情境，不展示模型/依据 | 原答、曝光、确认未见及提示/播放条件 |
| 限时 | 主动开始后才展示不同材料；180秒本地建议 | 实际起止/超时原答，不是正式单题时限 |
| 反馈订正 | independent/timed逐题why，原刺激与名单，限时订正 | 原答与correctionAnswers/具体订正分开 |
| 延迟新题 | 原有24小时条件与两份未曝光材料 | 提示、重播、重复不是无辅助保持；材料耗尽明确告知 |

`batch03Coverage` 提供官方ID/来源→lesson/variant→七阶段materialIds、活动和预期证据。其 `expectedEvidence / coverageBoundary` 是维护证据，不作为学员正文渲染。状态仍为 `authored-not-expert-reviewed / pending-owner-integration`，不因文件导入提升全L03/R09或其他题型状态。

所有材料为虚构原创。学员正文使用学习动作、题目指令、来源依据与局部边界，没有编号、schema、namespace、抓取或未登记工程备注。既有新UI的步骤常显、必要内容展开、可选帮助按钮保持；没有新增空页面或三角折叠。

## 输入、反馈与保存契约

```ts
import {batch03LessonsFor, batch03Coverage,
  batch03AdditionalSources, batch03ResponseContract}
  from '../ielts-blueprint/curriculum/batch-03';

batch03LessonsFor(variant: Variant): SampleLesson[];
// 明确Academic/GT后返回共用L03 + 对应R09；null/未知值拒绝。
```

Matching的三个questions使用同一 `options:['A','B',…]`，各自accepted为一个字母。名单连同关系题干、单字母要求和复用指令保留在context，答后仍可回看。三个题分别核对，实际复用同字母可以三项全对；没有全局去重、IN ANY ORDER或整组多选转换。四组允许复用，其中三组实际重复；两组一次使用，键均不同。这是本批设计，不是官方固定选项数量。

Reading不设options；题干是有空格的完整英文句子，原文在context。接受表列完整合理来源短语，保留合适的短形式。既有matcher只在比较时处理大小写/首尾/连续空白，raw string不改写；错词形、自拟同义词、添词或超本题长度都能作为错误首答保留。

三项的 `correct/total` 是本地作者答案核对，不据短练推算正式整卷、难度或Band。首答、再次作答、限时订正、曝光/辅助条件与来源材料身份仍沿现有规则。没有新State字段、数组答题存档、namespace或排程。

## owner 的最小串行接线

1. 当前UI批和听力保存冲突修复由owner先处理，内容线不重复写。然后在 `sample-sequence.ts` 追加 `...batch03LessonsFor(variant)`；保留全部旧课、题目/键/ID、sequence与存档版本。
2. v25的 `ielts-sample-progress.ts` 已按实际目录动态派生合法session集合，追加后目标为每类别 **10课/60材料引用，总20session、120引用、84唯一材料**。每session六材料、2M字符/200attempts/100playbacks上限与严格恢复/CAS不变；没有必要重写全站备份。
3. v25真实lesson ID路由/Today沿目录核验，新课可沿同一接口接。核验canonical目标，继续保留旧skill别名；Today仍只读，不改复验时间。
4. 现普通questions UI已经支持共同context、逐题单选/短input、示范教练步骤、逐题why及限时订正。新L03不能误走batch02 native完整多选控件。当前记录历史未显示共同名单/原instruction，owner可在对应回看补上只读原指令和完整context；不改答案结构。
5. 将本批测试串入现验证入口；更新 `test-ielts-sample-sequence.mjs:63` 的8课目录断言、workspace:135目录文案及:548–553的目录/材料/session数量。workspace:220四个hub×两类别的8session是旧行为用例，保留。
6. 真实登记→作答/刷新→整站保存与恢复→Today直达→不同延迟新题通过后，另记这三个局部目标的产品状态。内容文件就绪不是已上线或教学效果证据。

这两个有限子任务无需新UI接口。若要补多人换轮辨认，最低需要可核验的音轨/说话人轮次绑定与逐轮转录/证据，不能只让单声部文本写出名字来计完成；该共享音频接口由owner另行持有。本批不实现或声称覆盖它。

## 验证方式与证据边界

```sh
node studio/scripts/test-ielts-curriculum-batch-03.mjs
node studio/scripts/test-ielts-curriculum-batch-01.mjs
node studio/scripts/test-ielts-curriculum-batch-02.mjs
node studio/scripts/test-ielts-sample-sequence.mjs
cd studio
node node_modules/typescript/bin/tsc --noEmit --incremental false
```

本批源脚本检查官方追踪/七阶段、腐坏引用、冻结答案与精确引文、格式/曝光身份、原答保留、错引导不能前进、计时前拒答、超时保留、错误订正不能复验、两份新题与辅助条件、独立计算的模拟24小时门槛以及20个合法session的真实parser往返。每步后续动作直接使用 `read.value`；只忽略现有订正动作清空的可选 `reviewPromptId: undefined` 属性，因为JSON没有undefined值，其余字段精确相等。新目录仅内存注入真实不改盘的model/parser；按lesson ID去重，owner正式登记后也不重复追加。测试前后实际目录字节与数量相同，不能据此称真实注册或听力执行通过。

独立复核先给不含 accepted / why / hint / model / modelNotes 的刺激+指令+题干冻结答案，再揭键核对依据。听力18项先冻结后全吻合，50处准确短引文闭合。阅读初轮明确指出三处宽泛答案及五组边缘表达，根据信息对象和完整句语法只收紧七份既有材料；保留17空合理的短/长形式，没有将两词答案一律截断或一律强制。修订轮又发现 `shared` 可作被动谓语的合法读法，最后仅调整一题并重新盲复核，最终36空的53种合理来源形式与作者键精确吻合。揭键复核核对36条完整关系、37处短引、提示和示范，并把原文没有的“只有演出传单”收紧为“提供演出传单”。三个阶段的去键输入及冻结报告都保留原文件，不用后轮结果覆盖前轮问题。作者自查、独立代理语义复核、纯程序测试分别标记，不称专家或难度校准。

本批6组源测试通过，完成331次真实parser往返；v25既有125项模型检查、前两批各6组内容回归及TypeScript通过。最终文件hash、有限揭键回执与补丁应用结果见交付包的manifest/evidence；不把各项检查相加成新题量。共享路径diff为空，变更限于七个独占新增文件。本地依赖只读借用，没有安装。

仍未验：真实生产登记/刷新/备份/Today、听力保存冲突修复后真实播放与可听性、浏览器/手机、离线voice、多人音轨、专家内容审阅和实际24小时保持。180秒、文字词数与模拟audio事件不能证明声音质量或教学效果；走完课程/地图不等于Band或整题型已掌握。

## Primary 来源

- [IELTS Listening type2](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening)、[BC配对教案第6页](https://takeielts.britishcouncil.org/sites/default/files/2026-06/listening_part_3_matching-classifying_questions_.pdf#page=6)：匹配、字母输入、答案信息顺序及依指令的选项复用。
- [IELTS Academic Reading type8](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-reading)、[BC填空教案第4页](https://takeielts.britishcouncil.org/sites/default/files/2026-06/reading_completion_questions_.pdf#page=4)：来源词、限制、定位和完整句语法。
- [IELTS GT Reading combined completion组](https://ielts.org/take-a-test/test-types/ielts-general-training-test/ielts-general-training-format-reading)、[GT官方样题第23–25页](https://ielts.org/cdn/Sample-tests/ielts-general-reading-sample-tasks-2023.pdf#page=23)：显式sentence任务、特定指令和可选答案形式；GT顺序边界不借Academic推定。
