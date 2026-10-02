# 已完成 IELTS 两批内容：最小串行接入包

本包只交已完成内容、有限文案清理及只读验证证据，不新增题目或课程范围。唯一发布 owner 为线程 `01a0fa39-c2a2-7239-87b4-b0a9c091f0ba`；这是线程 ID，不是提交。owner 在当前 UI 批次完成后串行接入共享文件。此内容线没有修改任何当前共享发布树，也没有 push、merge 或 deploy。

## 精确依赖与预检基线

1. 固定运行基线：`3a6e89cf3faf2534087ef2e001743450f2289153`，包含已交付的恢复 CAS 修复 `f1894125a7efbf32d26e80332ed195d498a88143`。它与较早 `b46812e` 的差异没有改变本包所依赖的课程、计分、保存和 Today 接口。
2. 第一批：`58d83a9137b57d9efb66eed1e8899ff3e3cf8745`，7 个新增文件。
3. 第二批：`842f24c11c1b8244d7fbd6b734ddee6a63a37a37`，9 个新增文件；必须在第一批后接。它使用第一批的 `curriculum/types.ts`，不是独立补丁。
4. 包内第三笔尾随提交只清理既有学员文案，并加入本交接说明。最终 SHA、逐文件哈希及完整 patch 见包的 `manifest.json`、`SHA256SUMS` 和 `patches/`。

独立预检树为 `/tmp/nce-ielts-integration-preflight-20261002`。前两笔依次无冲突 cherry-pick 为 `b743a51d67c51bdd525ebf0d87185734d6822394`、`140082e3eb543177a0f76a5e493a7b542fa2b781`；只有新增内容、脚本和文档，共享运行码仍精确等于 `3a6e89cf`。较早 `9216a4c` 是审查回执，不是代码前置依赖，不在最小补丁中。

**新 UI 批次尚无可取得的固定 SHA。** 当前无冲突结果仅证明固定 `3a6e89cf` 可接两批文件，不能证明在途 UI 已兼容。owner 应在 UI 提交后核对下面的课程登记、容量、路由、题组控件和展示接口；保留其已完成 UI 改动。旧两篇批次文档保留作者当时的 `b46812e` 基线、文件哈希和回执；最终文案文件哈希以本包 manifest 为准。

## 内容目录与七阶段追踪

| 要求 | 新课程 ID | Academic / GT 身份 | 每材料题目 | 本地建议时长 |
| --- | --- | --- | --- | --- |
| L07 表单填空微目标 | `listening-form` | 同课、同材料共用 | 4 个字段 | 180 秒 |
| R04-A / R04-GT 作者观点判断 | `reading-writer-views` | 课程 ID 共用，材料按类别隔离 | 3 个判断 | 150 秒 |
| L02 多选微目标 | `listening-multiple-answers` | 同课、同材料共用 | 1 个完整选择组 | 180 秒 |
| R02-A / R02-GT 多选微目标 | `reading-multiple-answers` | 课程 ID 共用，材料按类别隔离 | 1 个完整选择组 | 180 秒 |

每课均有 `model / guided / independent / timed / review-a / review-b` 六份材料。对应前缀为 `ielts-l07`、`ielts-r04-a`、`ielts-r04-gt`、`ielts-l02`、`ielts-r02-a`、`ielts-r02-gt`。解释不消耗作答材料；反馈引用独立和限时材料。

第一批为 18 份唯一材料、60 个作者题目；第二批为 18 份唯一材料、18 个完整选择组、96 个选项。包括示范和引导，不能全算独立测验。听力材料不能因两个类别重复计数。完整追踪由 `batch01Coverage`、`batch02Coverage` 提供 `requirementIds / sourceIds → lessonId / variants → stages.materialIds`。

保持旧四课后，目标目录为**每类别八课、16 个合法 session key、96 次材料引用、66 个唯一材料 ID**。每个 session 仍只有六材料；同一新增阅读课程两类别的十二份材料，不能当作一个 session 的容量。

这些是局部课程的内容与接口覆盖。导航入口、地图走完、导入成功、NCE 单元或本地短练表现均不能替代真实训练覆盖、全题型掌握、正式 IELTS 成绩或 Band。作者绑定仍为 `authored-not-expert-reviewed / pending-owner-integration`；owner 只有在真实产品路径验收后另记接入状态，不改写历史作者证据。

## 纯内容登记接口

```ts
import {batch01LessonsFor, batch01Coverage, batch01AdditionalSources}
  from './curriculum/batch-01';
import {batch02LessonsFor, batch02NativeLessonsFor,
  batch02Coverage, batch02AdditionalSources, batch02ResponseContract}
  from './curriculum/batch-02';

// 两个 LessonsFor 都返回 SampleLesson[]；native 返回 MultiSelectLesson[]。
// 必须先明确选择 'academic' 或 'general-training'，null/未知值拒绝。
// 目录：旧 variant 四课 + batch01LessonsFor(variant) + batch02LessonsFor(variant)。
// 不隐式注册，不读用户记录，不新增 namespace 或复习调度器。
```

`sample-sequence.ts:75` 当前只登记四个 `hub-*`。由 owner 追加内容并保留旧课、原题、accepted、why 和身份；空类别入口仍要求学员选择类别。新内容对 `SampleLesson` 的反向依赖均为 `import type`，不会反向读取运行目录。

来源去重合并为 `officialSources + batch01AdditionalSources + batch02AdditionalSources`；新增四个 ID 是 `reading-judgments-bc`、`reading-general-multi-idp`、`reading-multi-sample-order`、`listening-multi-sample-order`。相同 ID 不应静默覆盖不同证据。原有 URL、核验日期和 `partial-fetch` 访问边界保持，勿把元数据中的抓取过程显示给学员。

`validateCurriculumContent` 是第一批专用校验，对其 reading 强制 YES / NO / NOT GIVEN，**不能**将旧八课联合目录或第二批多选传入。第二批 native 用 `validateMultiSelectLesson`。产品存档继续用 `readSampleProgress` 的严格校验，不将作者诊断函数当提交拦截。

## 保存容量、旧档与恢复

`app/ielts-sample-progress.ts:66` 的固定 `sessions ≤ 8` 在第九个合法 session 时会拒绝，活动课也只查 Academic 目录。owner 应从两个类别实际注册目录推导合法 `${variant}:${lessonId}` 集合及容量（本包目标 16），按当前类别核验活动课。`:71` 逐 session 查类别、`:74` 的每课六材料与题键白名单继续保持；未知 key、材料、字段或多余冒号仍拒绝。

保持以下机器标识及既有规则：

- `sampleProgressKey = 'ielts-sample-sequence-v1'`、`sampleSequence.id = 'willow-hub-four-lessons'`、序列与保存 envelope 版本 `1`；显示标题可以中性化，不能用改机器版本使旧档失效。
- scalar `Record<string,string>` 原答、attempt 字段、首答与订正分离、原曝光 ID、悬挂播放恢复和 `expectedRaw` CAS。
- 2,000,000 **JS 字符**的 namespace 原文上限、每 session 200 attempts、每 draft 100 playbacks；没有依据自动扩这些上限。全站文件 25 MiB 上限及 v1 / v2 / plain 兼容不变。
- absent / ready / blocked 区分、blocked 保留 raw；恢复与计分使用同一完整组 matcher。不裁剪、去重或重新推断历史原答。
- `isStoredSampleResponse` 的旧开放作品兼容、24 小时条件、两份新复验材料和跨类别共用听力曝光规则。
- 主站恢复预览后的持久化 CAS、提交回执和精确回退保护，以及 v2 双区备份；本包不要求改全局 State、主备份或自动复习适配器。

新课草稿仍放在同一 namespace 内，由现有整站文件原样运输。新增课程登记后，必须验证刷新、旧档、16 session 完整往返、未知数据拒绝和并发 CAS；此内容包的内存模型测试不等于这些实际保存路径通过。

## Today 与路由双入口

当前 `app/ielts-sample-next.ts:30` 用 `lesson.skill` 生成链接，`:9` 再解成 `hub-*`；新表单、多选或观点课程会指回旧课。`app/navigation.ts:28` 也只允许旧 skill 别名，只改前者仍会在 `parseRoute` 丢失真实 ID。

由 owner 同时更新链接、目标解析和导航白名单：

```ts
// 新 canonical task 携带完整 lesson.id：
task = `sample-${variant}-${lesson.id}`;
// sampleTarget 返回 {variant: Variant, lessonId: string} | undefined；
// 按实际 variant 目录验证完整 ID，拒绝未知/附加字符。
// 八个旧 sample-<variant>-<listening|reading|speaking|writing>
// 别名继续映射各自 hub-*，旧链接保持原义。
```

两个例子是 `sample-academic-listening-form` 和 `sample-general-training-reading-multiple-answers`；实际链接由现有 `routeHash({view:'ielts',tab:'course',task})` 生成。`samplePracticeTasks` 的 `sample:${variant}:${lessonId}` 任务身份已经携带真实课 ID，应保留。Today 继续只读消费现有恢复、订正和到期结果，不建立调度、不因导航写完成。

若抽共用路由 helper，放在独立无导航副作用的模块；不要让 navigation 反向 import `ielts-sample-next`（后者已 import navigation），避免循环。UI 新批完成后须实测 `parseRoute → sampleTarget → workspace` 和 Today 往返，不能只查生成 URL。

## 多选 UI 与计分契约

本包已实现**完整字母组文本输入**，尚未实现原生 checkbox 或官方逐答案位置评分。native 的 `task` 保留稳定 `id`、`selectionCount`、`options:{id,text,judgment,quotes,reason}[]`、`correctOptionIds`；原刺激、提示、依据皆为原创虚构，不复制官方真题库。

一个 `SampleQuestion` 对应一个完整选择组；两选的 2 个排列、三选的 6 个排列各为一个完整 `accepted` 字符串。OR 只发生在完整排列之间，每个排列内部要求全体正项。现模型按整组 **0 或 1 / 1**；不能说官方逐编号答案分、部分分或换算 Band。禁止改成 `accepted:['A','C']`，也不拆成各接受 A/C 的槽，避免误收单项或 A/A。

当前 `SampleQuestion.options` 在 `sample-sequence-ui.tsx:70–73` 是单选，投影有意省略。若 owner 的 UI 批选择新增 checkbox，最小控件接口可为：

```ts
type SelectionInputProps = {
  selectionCount: 2 | 3;
  options: readonly {id: string; text: string}[];
  rawAnswer: string;
  onChange(rawAnswer: string): void;
};
// 通过 material.id + task.id 找到 native 内容；
// 仍 dispatch 现有 answer / correction-answer，保存完整 scalar 字符串。
```

不要将 native options 塞进旧单选字段；不要给存档加数组或 attempt 新字段。解析仅作诊断，挂载或恢复不能把 `A A C` 经 Set 去重写成 `A C`。未知/重复/格式错误 raw 必须可见、可文本编辑，只有学员实际修改才更新草稿，历史 attempts 保留。少选、多选和其他非空错误仍可提交为错误首答，不把 `inspectMultiSelectEntry` 接成提交拦截。

如果使用 checkbox，owner 应同步调整现投影的“一个输入框、空格分隔”学员说明；这项决定尚未实施。保存与恢复必须维持旧字符串、同一 matcher 和历史错误证据。官方逐答案分是另一个未实现接口，不能因 checkbox 上线自称已经提供。

## 学员文案与七阶段 UI 兼容点

尾随文案修订只去掉五处工程说明：投影的参考字符串/原生控件/字段名、GT 的课程投影、Listening 的未登记状态及内部 L02 / L07 编号。输入规则、合成声音、原答与订正、原创声明、局部训练边界和 Band 边界保留；所有材料正文、题干、选项、答案键、引文和练习拓扑保持。

`batch01Coverage` / `batch02Coverage` 的 `expectedEvidence`、`coverageBoundary`、namespace、来源抓取状态和 pending-owner-integration 为维护元数据，不能直接渲染成学员说明。与教材有关的 digital / library catalogue 是原文内容，保持不动。

Finn 要求少三角折叠：步骤导航和当前必要内容常显，核心反馈直接展开。答案和未来材料仍按阶段控制曝光：

| 阶段 | 常显的必要内容 | 保持的条件 |
| --- | --- | --- |
| 理解方法 | 目标、输入规则、方法 | 阅读说明不算掌握 |
| 示范 | 原材料、完整题干、教练步骤和逐项依据 | 说明完整显示一次 |
| 引导 | 新材料、提示和输入区 | 先保留首答，提交后显示答案 |
| 独立 | 题干、阅读原文或听力播放 | 点提示或看原稿须留辅助记录 |
| 限时 | 开始按钮和本站建议时长 | 开始后才曝光材料；超时仍留答 |
| 反馈订正 | 原答、原材料、全选项、参考与依据、订正区 | 原答不被订正覆盖 |
| 延迟新题 | 到期、新材料状态和当前行动 | 沿现有时间条件换两份新材料 |

基线 `sample-sequence-ui.tsx:89` 对有 questions 的示范只显示 why：第一批表单的 modelNotes 会漏，第二批则已融入 why。新 UI 应完整显示教练步骤且仅一次；不能直接将 GT 非示范 modelNotes 或 native 正集/依据提前展示。`:110` 反馈只在有 script 时展示 context，阅读反馈缺原文和全选项；`:113` 订正也只有 prompt 和输入框。owner 须结合新 UI 修正这些展示入口。多选题干在 instruction/context/prompt 有重复，展示一次完整英文命令即可，保留选择数与字母范围。

共享“四课”“两个答案”“这两题”和 Today 恢复理由改用实际数量或中性说法；机器 ID 不改。类别须学员明确选择，两类阅读材料隔离。学员结果用“整组匹配／未匹配”，真实音频、人工评阅和长期保持仍有待核验，不能通过地图或测试推算。

## 共享文件由 owner 串行持有

需要接线：`ielts-blueprint/sample-sequence.ts`、`sample-sequence-ui.tsx`、`app/ielts-sample-progress.ts`、`ielts-sample-next.ts`、`ielts-sample-workspace.tsx`、`navigation.ts`。目录文案/地图/来源可涉及 `app/ielts.tsx`、`ielts-blueprint/types.ts`、`sources.ts`、`blueprint.ts`、`map/content.ts`。若 UI 使用新 helper，也由 owner 持有。

保持而不需重写：`sample-sequence-model.ts`、`app/model.ts`、`today-practice.ts`、`progress-file.ts`、`progress-save.tsx`、`study-app.tsx`、`offline-store.ts` 及复习适配器。任何必要接线修改都由 owner 在其当前 UI 上串行审阅。

验证入口：`package.json`、`test-ielts-sample-sequence.mjs`、`test-ielts-sample-workspace.mjs`、`test-navigation.mjs`、`test-today-practice.mjs` 和既有保存/CAS 脚本。老模型测试的自制 loader 固定在蓝图根解析子 import，目录导入 curriculum 后会错误寻找根 `listening-form.ts`；可复用已有 `ielts-blueprint-loader.mjs` 的逐父文件相对解析。navigation 测试目前仅替换 model import，新增 helper/import 后也须同步 loader。更新旧四课计数、八 session 断言及“canonical hub 路由非法”的断言，同时保留旧四课行为和 skill 别名回归。

## 有限验证和未验收边界

在独立树文案修订后运行：

```sh
node studio/scripts/test-ielts-curriculum-batch-01.mjs
node studio/scripts/test-ielts-curriculum-batch-02.mjs
node studio/scripts/test-ielts-sample-sequence.mjs
cd studio
node node_modules/typescript/bin/tsc --noEmit --incremental false
```

第一批 6 组、第二批 6 组、固定运行目录旧模型 125 项通过；严格 TypeScript 和 git diff 空白检查记录在包的 `evidence/`。编译器和依赖只读借用已有本机 node_modules，没有安装。新课测试仅在内存注入目录，不是生产登记。另三条并行只读审查核对容量、路由、多选与学生文案；有限探针确认错误 raw 往返及第九 session 的实际拒绝，这些发现不累计为新题量。

包的纯结构清单枚举目标八课/16 session/六材料/66 唯一 ID，并比较最终与作者材料的题干、正文、选项、键和来源依据。完整 patch 还应在固定基线独立快照 `git apply --check`；结果和共享文件未改的证据附包，不能代替 owner 的真实运行接线验收。

仍未验：在途新 UI 固定源码、真实注册/刷新/整站保存恢复/Today 直达、该批浏览器和 320/390 手机、实际合成声音及离线 voice、专家审阅与真实 24 小时保持。模型的模拟时钟和音频事件只检验条件规则，不能证明声音或学习效果。此包不发布、不扩内容，也不把此前版本部署或截图当作新批验收。
