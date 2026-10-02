# 2026-10-02 UTC 最终兼容与工程验收

本记录更新原候选的宿主接入状态；原 README、INTEGRATION、QA 保留最初作者的实现说明和历史边界。以下为本次实际检查结果，不是部署、真实学习效果或人工施测验收。

## 来源与精确增量

- 原作者/owner：任务 `01a0fd72-a558-7650-a761-e89d2f3aa094`。只读冻结其 `task-9/stage-final-worktree`，HEAD `bd5d1f731dc4c2d7e1cf213485c75af903d47fa1`，5 个共享暂存修改、27 个新增 stage 文件；源码、全部 84 个新增文件及三份已有报告前后 SHA 一致。原树未写入，未使用 17:00 旧包。
- 原成果原样封存：`de019c8599471ed07ba893a1a064b8337693e015`。独立 clone 位于 `task-18/stage-compat`；完整来源 SHA 清单在外围 `source-snapshot/manifest.json`，SHA256 `c13ad4225c605ac6d8e2f0461982d4da48fc44d378d09000e0d7acfb53386daa`。
- 本次唯一生产尾项：`6d84755` 将 `prepareStageBackupRestore` 的相同 raw 返回移动到严格校验之后。未来时间、未知 schema/字段不能借相等 raw 绕过拒绝。有效同档仍逐字不变；未改题面、评分、时间模型、writer 或权限。
- 实读快照的导入已经无 `.ts/.tsx` 后缀；本次未再出现 TS5097，未修改任何宿主 tsconfig。保留原作者已完成的兼容成果。
- 原 placement 尾修 `5b3129b85b78b22631dc71f7b0ca6875e02385bc` 在独立 clone 合并为 `e84aebb10f27fdc6463b21a5bb1548801250a2de`，保留原作者和 Git 历史。唯一文本冲突位于 Today 相邻导入；同时保留 `placementHostTasks` 和 `stageTodayTasks`。三个 placement 生产文件与原 5b 逐字一致，mini/map/writer 与 bd5 无差异。
- 必要测试兼容：共享 ProgressSave harness 绑定真实 stage 准备函数；placement 的 TS 测试 loader 提供真实 `fileName`，使 `.ts` 的泛型按 TS 解析，不被默认 TSX 解析吞掉导出。均为测试代码。

## 当前恢复合同

共享 `ProgressSave` 在持久操作前调用 `prepareStageBackupRestore`；StageHost 再调用同一准备函数，已验证幂等。不应对正常同档恢复无条件追加 `invalidateRestoredIntervals()`。

| 输入 | 实际结果 |
| --- | --- |
| 有效同档 roundtrip | 原 raw、首答、草稿、曝光、deadline、T2/T3 原 anchor/due 精确保留 |
| 无 stage 的旧文件或较早完整前缀 | 恢复其他教材字段，同时保留当前 stage 原文 |
| 新来源/有效续接 | 保留原事件、首答、草稿和原 anchor/due；仅追加恢复来源，导入间隔资格待核，不产生自然通过 |
| 未来、分叉、未知 schema/字段（含相同非法 raw） | 两个 ProgressSave 入口均拒绝，不改原 State 或 capability 存储 |
| capability 写入在主 State 提交后失败 | 以原存储快照精确回退 stage、全部 State 及两侧 namespace |
| 预览后另一标签写入无关 draft | 全 State CAS 拒绝，保留较新的无关输入；不只比较 stage key |

Stage 仍沿现有 IDB/legacy writer 保存，确认回读后才公开题目或结果。路由仍按 mini → placement → stage 的 accepted route/guard 组合。真实拒绝的 stage 保存将页面、hash、当前输入保留；未确认输入可原生下载且 `counted:false`。

LearnerPort 仍只给 load/learner/export/restore；生产 examiner 两接口拒绝前端资格 bool。授权外評尚未绑定。实际 learner bundle 可达图无 ExaminerPanel、测试/preview 或 examiner-task-pack；stage 学习者题面没有答案与听力脚本。

## 验证证据

外围 `qa/` 随交付打包，具体 source/asset SHA、浏览器版本、原生文件及截图记录在 JSON 收据中。

| 检查 | 结果 / 证据 |
| --- | --- |
| 原生宿主严格 TypeScript 5.9.3 | exit 0；`qa/types-integrated-receipt.json` |
| 原 classic / map Vite 配置 | 两个 online build 成功；`qa/classic-integrated-build.log`、`qa/map-integrated-build.log` |
| Stage 模型与宿主 | 26/26；`qa/stage-tests-integrated.log` |
| 实际共享 ProgressSave 处理器及 StudyWorkspace callbacks | 37/37；`qa/progress-ui-integrated.log`（内存 hooks/storage，非浏览器） |
| 真实 Chrome 完整宿主 | 38 项；`qa/stage-browser-integrated/receipt.json`，两个恢复入口的 native download/upload、真实 IDB/CAS/rollback、真实 reload、失败留稿及两条离开拦截；0 JS 异常、0 外部请求 |
| 既有真实 Chrome writer | 19/19；`qa/writer-browser.log`，IDB 并发、跨标签、legacy Web Locks、精确回退 |
| Placement 保留的模型/接口 | 25 项模型、5 项接口；`qa/placement-unit-integrated.log`、`qa/placement-interface-integrated.log` |
| Placement 实际试学链接 | 两条原生 map route、失败保留 intent、恢复存储后实际 reload；`qa/placement-entry-integrated-receipt.json` 与三个对应截图 |
| Stage learner bundle | `qa/learner-bundle-audit.json`，实际生产可达模块和 bundle SHA；无 examiner 入口/答案包/人声脚本 |

构建用了原树已有、只读核 SHA 的 ignored `map/curriculum.json` 静态输入；未复制浏览器 profile、真实学习记录或 13 自然档案。初始独立构建缺少此生成输入，补入该原输入后通过。已有大 bundle 提示保留，不属于本次功能范围。

## 未测与未执行

真实自然 ≥24h/≥7d、人声、自由口语、合格人工外评、题包难度/一致性和真实设备施测仍未验；本次所有记录都是明确的工程合成 fixture，未改设备/浏览器钟，不消费 13 条自然档案。仍是第 1–6 课有限目标产品候选，不关闭全局 R06/R13，不授予 IELTS Band、全技能或学习收益结论。

只在独立本机 clone 合并与验证。publisher 树未写入；未 push/deploy，未创建认证、费用、权限或联系他人。当前实际仓库及指定祖先未见 AGENTS/.agents；已读 capture-obsidian-insights，已知本机/连接器 Obsidian AGENTS 不可用，未建立替代库或第二份项目状态。
