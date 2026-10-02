# R02–05 / R08：有限的能力起点候选

> 后续真实宿主接入已完成，当前交付以 [HOST-INTEGRATION.md](HOST-INTEGRATION.md) 为准。本文下面保留首个有限候选的历史说明；`publisher-integration.patch` 与本文末尾临时接线步骤已被真实宿主提交取代，**不要再应用该旧补丁**。

已实现局部文字诊断、保守试学建议、现有 State adapter 与真实 React 组件。所有已提交变更只在 `studio/placement/**`；共享路由、Today 入口与队列接线作为 `publisher-integration.patch` 单独交唯一 publisher 串行整合。未发布，不把这批算作全部四科分流完成。

## 基线与范围

开始时两个指定远端分支共同 SHA 为 `ce91bebc609c61227538f79dda3c487bcbee4fb5`。冻结前只读重核，两分支都更新到 `424efc1869e98cd7b19afd2c1ab7cab0e8380b4b`，候选以此为实际基线。新增变化是 R34 expression 修复与发布文档，Placement 接口补丁仍可干净 apply。检查了本机仓库和相关祖先路径，没有发现 AGENTS.md / 仓库 SKILL.md。已读取 capture-obsidian-insights；两个已知本机 Obsidian 根规则路径均不可用，未创建替代库、未回写或触及 13 时间档案。

生产现状：14 章节依次 requires，NCE1+2 默认路线共168组；四科路径均 requires chapter-14。NCE3/4 是108组选读，不是必修前置。手动全解锁属于访问设置，不是能力证据。本候选不修改任何 map requires、完成、解锁、课程历史或默认继续项。

## 能力前提与 fallback

`manifest.ts` 定义的是编辑性试学前提，尚待真人验证，不是标定后的能力等级。

| 入口 | 有限前提 | 建议含义 |
| --- | --- | --- |
| 一册1–2 | 无、缺测或基础证据不足 | 可继续原位置，也可从这里补基础 |
| 一册25–26 | 基础两题均独立、未自报曾见、正确首答 | 试学句式，不宣称已掌握前24课 |
| 二册1 | 基础、时间原因两组均满足上述前提 | 试学叙述材料，不证明自由叙述能力 |
| 短阅读样例 | 全6题满足上述前提 | 试一个现有短阅读样例，不证明完整阅读能力 |

逐科前提在 manifest 中列出。听力、口语、发音、自由写作与完整考试表现未测，始终待独立核对；不生成 CEFR、IELTS band 或完整四科准备度。文字任务失败也不能推断听说差。未知/未来版本与异常时间属于记录阻断，保留原文与原路线，不覆盖成空记录。

## 题目与证据

两池共12道原创有限题，每轮最多6题，先短句、再时间原因、最后证据判断；每组两题都满足独立未见正确首答才展示下一组。出现错误、帮助、熟题或跳过，完成当前两题后给保守建议及逐题修补。任意时刻可停测或暂停，未作答不能算失败/成功。

每个新题在 start/next 事件中记录曝光；刷新恢复保留同一题、同一输入、帮助与熟题标记。提交后首答不允许改写，显示答案；订正草稿及已保存订正另存，不提高首答证据。两轮消耗两个不同池，禁止重置/复用作为新的未见证据。自报曾见只能从 false 改为 true。只有本轮结果用于当前建议，旧高结果不会覆盖后来较弱表现。

每池都很小且高度同构；换池不等于校准复验或广泛迁移。难度、区分度、阈值与建议课位全部待真人验证。客户端代码中的题库不是考试级保密题库；“未见”仅指本机曝光记录与诚实自报范围，无法核验外部见题或外部帮助。删除/覆盖本机记录会丢失曝光历史，不能声称跨设备验证。

独立盲审只读 `blind-prompts.json`，首轮指出四道填空题面泄露答案、be 范围歧义和 traffic 措辞。已改为无答案中文情境、明确限定 be 现在时与 heavy traffic，再独立复审。12题均可唯一核对，题面hash及两轮审查在 `blind-review.json`。盲审结束后的独立只读实施复核也已追加：答案键12/12一致、首答/帮助/熟题/订正分离和13类异常记录保护未发现实际阻断。四个填空只测受限词形选择；中文情境明确给语义，不能扩大到自由表达。

## 生产接口

- `placementKey = 'placement-text-v1'`，只写现有 `State.drafts[placementKey]` 一个版本化事件信封。没有第二 store、Storage key 或自动上传。
- `readPlacement(raw, now)` 严格验证信封、版本、字段、事件顺序与容量，再重放派生证据。未知原文返回 blocked。
- `applyPlacement(state, expectedRaw, action, now)` 做同键 compare-and-swap；其余 State 原样保留。持久化由现有宿主 `setState` / guarded autosave 完成。保留原有保存错误与备份入口。
- `Placement` 接收 `{state, update, ready, error, continueHref}`。publisher 应传现有真实继续位置，不能传建议入口代替原路线；存储失败时阻止新诊断操作并保留原记录。
- `placementTasks` 只添加已有诊断的恢复项或用户明确选择的试学项；不凭缺记录自动强制诊断。`unchoose` 只取消试学偏好，诊断证据仍保留。
- `placementTrial` 只是可选试学，不授权 map 完成或解锁。

四个共享文件的最小 patch 只涉及 `app/navigation.ts`（允许 placement view）、`app/study-app.tsx`（接现有宿主）、`app/today-practice.ts`（接既有队列）、`app/today-practice-ui.tsx`（可选入口）。没有 map/main/content/current-route、course-loop/registry/host-contract/next、mini-task 或首页源码改动。`'use client'` 指令仍在首行。默认继续课位与课程完成逻辑零变化；建议链接进入已有 classic 练习/短阅读样例，不能视作完成 native map 课程。

## 已完成验收

- `node studio/placement/tests/test-placement.mjs`：25项通过，含困难、帮助、熟题、跳过、停测、首答不可覆盖、订正草稿恢复、池耗尽、异常/未知/超容量、CAS、其他草稿/分数/完成不变与真实路线解析。
- Scoped strict TypeScript check：5个生产 TS/TSX 文件通过。类型引用需要既有生成的 `map/curriculum.json`；此隔离树仅复制已存在的忽略生成文件用于类型检查，没有提交或改源。
- `node studio/placement/tests/test-placement-browser.mjs`：5组真实组件流程通过；临时localhost、全新Chrome档案、合成数据，真实 React 与现有 IDB/guarded autosave。帮助/首答分离，订正输入跨页面reload，两池耗尽，6题建议入口，原分数/完成/其他草稿保存及未知原文保护。截图320/390/1280已逐图检查，无横向溢出。
- `git apply --check studio/placement/docs/publisher-integration.patch` 在424efc基线上通过。patch只在 `/tmp` git archive 整合副本应用；5项真实 parser/redirect/Today 接口检查通过，记录在 `integration-receipt.json`。生产共享文件没有应用此patch；整合副本的真实 StudyApp 已由 esbuild 完整打包编译通过。

浏览器测试需已有项目依赖和已安装 Chrome；会启动临时本机端口，sandbox限制时需本机执行权限。所有写入仅在临时测试浏览器。测试scope是组件与接口，不是已部署整站或真人学习效果。

## 交付后仍待完成

唯一 publisher 审阅并串行接入接口patch，针对最新head做整站保存/导航/Today验收后决定发布。真实学习者难度与试学课位验证尚未做；后续需要独立原声听力、口语和开放写作证据流程，再考虑真正四科分流。此批不能关闭这些剩余能力项，也不能用手动全解锁填补。

## 在自己的临时树复核接线

先确保本机已有项目依赖和生成的 curriculum.json。以下仅在新临时目录应用共享补丁：

```sh
task_integrated=$(mktemp -d /tmp/placement-integration.XXXXXX)
git archive HEAD | tar -x -C "$task_integrated"
ln -s "$PWD/studio/node_modules" "$task_integrated/studio/node_modules"
cp studio/map/curriculum.json "$task_integrated/studio/map/curriculum.json"
git -C "$task_integrated" apply "$PWD/studio/placement/docs/publisher-integration.patch"
node studio/placement/tests/test-publisher-integration.mjs "$task_integrated"
```

若publisher的新head改了这四个共享文件，先核对最小diff再串行适配，不能用本patch覆盖其他作者变更。
