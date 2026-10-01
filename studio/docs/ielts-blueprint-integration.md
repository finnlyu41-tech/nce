# IELTS 四科覆盖蓝图与接线边界

基线：`e2efbd3296365bbf5e3a110b4178c19fb215b19d`，2026-10-01 核对 GitHub 远端 `codex/ielts-map-20260930` 与 `codex/english-studio-online-20260926` 均为该提交。当前独立工作树 `english-ielts-blueprint`，branch `codex/ielts-blueprint-20261001`。

本轮持有 `studio/ielts-blueprint/`、独立覆盖校验/测试脚本及交接文档。已有 `studio/app/ielts-blueprint.ts` 是旧学习路径，保持原样；`globalnav`、`map/model.ts`、`app/model.ts`、入口组件、评分和进度存储交主线统一接线。其他工作树脏改动不计入基线已实现覆盖。后续用户要求优先可玩的最小演示，已单独提交 `65e3fb32db4c8b735a436cbb584d642724e77dac`，仅新增 `public/demos/yesterday/`、自己的本机状态与演示打包/测试/说明；不需要接入这份蓝图。主英语线程统一串行发布，本工作树没有合并或部署。

## 先交的现状

| 现有模块 | 实际行为 | 覆盖判断与证据 |
| --- | --- | --- |
| 地图四科 12 个节点 | 每科 3 个 assignment；说明、外部资源、作答/反馈/复验登记 | `map/content.ts` 的 `blueprintNodes` 展开与 `questionsFor`；四科 task 的 `questionsFor` 返回空数组。入口/登记不能算内嵌题型教学完成。 |
| 站内听力 | 一个可重播的合成语音对话，8 道单选，有答案解释 | `app/ielts.tsx` Listening；`app/data/ielts.json` listening。仅部分选择题训练；没有真实四部分一遍播放控制、各题型题组或完整测评。 |
| 站内阅读 | 单篇，4 道单选及 4 道 True/False/Not Given，有计时器/解释 | `app/ielts.tsx` Reading；`app/data/ielts.json` reading。短题与计时工具不能证明完整 40 题训练；多选、观点判断、各匹配和填空仍需补。 |
| 站内写作 | 原创 Academic 表格 Task 1、General 正式信 Task 1、双边讨论及观点 Task 2；计时/草稿/自查/范文 | `app/ielts.tsx` Writing；`app/data/ielts.json` `ielts-w1/w2/w3`。GT 信存在，但旧地图只接 Academic Task 1。缺按评分维度的引导、外部评阅闭环与新题延迟复验。 |
| 站内口语 | Part 1/2/3 内容组织、结构示范、撤提示表达、限时、录音与文字修订 | `app/speaking-bank.tsx` `SpeakingCoach`；文字反馈不能评发音。只单题计时，尚无完整陌生追问模拟与四维人工反馈/延迟复习证据。 |
| NCE168 单元 | 教材听读、词句练习、表达与隔日异题复习 | `map/curriculum.ts`、`map/model.ts` `stable`。是可调用的基础能力资源，不能代替 IELTS 特定题型、全卷和评分覆盖。 |

地图目前明确限定 Academic：`map/model.ts` 的 `Mock.kind`、`mockErrors`，旧蓝图 `baseline` 与四科说明。新数据不默认考试类别；Listening/Speaking 共用要求，Reading/Writing 保留 variant 与各来源对应关系。主线采用新蓝图时必须先处理类别选择，不复用旧 Academic gate 来判定 General。

## 不冲突的最小接口

`studio/ielts-blueprint/types.ts` 定义官方来源、要求、代码证据、七阶段覆盖位及未来作答证据形状。已导出只读 `ieltsBlueprint`、`requirementsFor(variant)`、`coverageFor(requirementId, variant)`、`coverageSummary(variant)`，`validation.ts` 导出 `validateBlueprint()`。`variant=null` 返回两类分组和共享项，不静默选择 Academic；覆盖查询必须传实际 variant，不能让 Academic 的外部交接泄漏成 GT 的本地训练。规划位 ID 形如 `ielts-plan.<requirementId>.<stage>`，不是可导航的已实现页面。

每项官方题型/评分要求分配：解释 → 示范 → 引导练习 → 独立练习 → 限时训练 → 反馈修正 → 延迟复习。覆盖状态 `implemented/partial/missing` 描述产品实现，和用户是否学过、是否掌握、Band 成绩分开。代码证据必须是已提交基线文件中的实际行为；只有链接、导航或基础课不得把状态提升为 implemented。

## 如何服务学习闭环

1. 诊断短板：记录具体错误及原材料/题号，将其关联到题型或评分维度；“没练过”和“练过仍错”分别处理。
2. 针对训练：定位该要求的解释、带证据示范及小步引导；基础词句课程只是需要时的修补入口。
3. 反馈修正：听读保留答案依据、错误原因及订正；说写保留原稿/录音、按维度的人工反馈与修改版。文字提示仅支持语言组织，不能评发音或冒充考官评分。
4. 无提示迁移：换新材料/题目，隐藏原答案与模型，记录是否借提示；不能把重复已知题的正确率作为新题能力。
5. 延迟复习：在课程约定的间隔后换同能力新题验证修正；间隔属于教学选择，不能说成 IELTS 官方规则。卡片、目录或节点数量不代表效果。

## 官方边界

2026 年考试交付正在按市场调整：听读默认以电脑条件规划，额外抄答案时间必须结合市场、日期和实际考试模式确认，不能沿用无条件“额外 10 分钟”。[IELTS 2026-03-05 公告](https://ielts.org/news-and-insights/updates-to-ielts-test-delivery)

Reading 使用带来源/variant 的题型并集。GT 短清单和 British Council GT 练习页分类不完全一致，不能由短清单删掉观点判断或句尾匹配。[British Council GT Reading](https://takeielts.britishcouncil.org/prepare/ielts-free-practice-mock-tests/general-training/reading?language=en)

题目材料仅使用原创或合法获得的素材；不复制真题库。本蓝图不生成大量题或空页面，不保存进度、不自动估 Band、不修改现有官方成绩/模考逻辑。正式分数仍以 IELTS 成绩报告为准，说写高阶评价保留人工核验。Obsidian 已知根不可用，沿用仓库内本交接文件，不创建替代库。

## 已完成的交付与验证

26 个官方来源条目、100 个追踪要求、25 个基线代码证据已保存。100 行包括教学细分／重叠标签，不是 100 种官方题型。CSV 展开为 931 个 variant × 七阶段覆盖位，带活动规格、素材数量／QA状态、真实代码和来源、缺口说明。

| 类别 | 要求 | 七阶段位 | 完整实现 | 部分 | 缺失 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Academic | 65 | 455 | 0 | 139 | 316 |
| General Training | 68 | 476 | 0 | 124 | 352 |

零完整实现表示本地证据尚不能证明任一阶段达到蓝图定义的完整交付；不等于站内没有可用短练习。原有导航、NCE168、历史题库声明、自查和短题都没有被提升为官方能力或 Band 证据。生成的 [覆盖表](ielts-blueprint-coverage.md) 与 [CSV](ielts-blueprint-coverage.csv) 可直接审阅，矩阵仍绑定基线，新增样例没有偷偷改覆盖结论。

- `node scripts/check-ielts-blueprint.mjs`：数据关系、基线代码锚点／实际题目 ID／旧地图 ID全部通过，`valid=true`，`issues=[]`。
- `node scripts/check-ielts-blueprint.mjs --require-complete`：预期 exit 2，因为真实覆盖尚未完整；不能把结构校验通过称为内容完整。
- `node scripts/test-ielts-blueprint.mjs`：117 项边界检查通过。包含不可信数据／前序链、跨类别已见材料、旧素材重复、零间隔、无音频发音、无图 Task 1、ASR或自查冒充人工、未评独立答案、异常日期等反例。
- `node scripts/test-ielts-sample-sequence.mjs`：125 项四课小样例测试通过；严格 TypeScript 检查通过。
- `node node_modules/typescript/bin/tsc -p ielts-blueprint/tsconfig.check.json --noEmit`：严格类型检查通过。
- 独立预览生产构建通过，命令见下。真实设备音频与四课样例移动布局仍待验收；最小昨日经历演示已另行完成 390／320 手机布局和真实点击流程。

## 未来学习证据接口

`inspectPracticeEvidence(record, requirement, prior?, {now, reviewDelayMs?, history?})` 只检查传入证据，不读写存储。请传完整跨类别／跨要求 `history`；仅传当前类别的记录不能可靠排除旧材料。`learningEvidenceSummary(allRecords, requirement, variant, now)` 自动在类别过滤前查询全部已知曝光。异常输入安全返回未验证，不抛异常或猜测分数。

独立／限时／延迟证据必须是无辅助的陌生材料首答，具备原材料／实际作品引用；观察到目标需要恰当答案依据或人工评阅。复习逐段核验真实前序链、正间隔及不同材料；文本不能成为可评发音的音频，也不能由 self／ASR 转成 teacher。`recorded-needs-verification` 是供内容和评阅者核实的记录，`mastery='not-inferred'`，`band=null`。核心默认 2 天、四课样例 24 小时都是教学提案，绝非 IELTS 官方间隔。

## 四课原创样例与隔离预览

[四课说明](ielts-sample-sequence.md) 对应社区学习中心主题的听、读、说、写小任务。几课合计四科，每课只练一项；第四课保留 Academic／GT Task 1。组件 `IELTSSampleSequence` 接收可选 `value / initialValue / onChange`，不新增存储键；主线决定如何保存及接线。解释、示范、引导、独立、限时、反馈修正、有限新材料延迟复验均有实际样例。没有正式全卷模拟或人工评分；完整模拟只保留真实交接要求。

隔离预览文件在 `ielts-blueprint/preview/`，不改主入口。运行：

```sh
node node_modules/vite/bin/vite.js --config ielts-blueprint/preview/vite.config.ts --configLoader runner
node node_modules/vite/bin/vite.js build --config ielts-blueprint/preview/vite.config.ts --configLoader runner
```

临时缓存／构建输出在 `/tmp`；`runner` 避免向共享 `node_modules/.vite-temp` 写入。主线有自己的依赖即可运行，勿提交或复制本工作树本地依赖链接。
