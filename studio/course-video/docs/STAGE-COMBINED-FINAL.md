# Stage + video 最后组合验收

本增量以 `cccefc12c3f40f322bcbbd991d829f0ad17d6082` 为唯一 base。经典宿主组合顺序为 mini → placement → stage → video；StudyWorkspace 和 NceStudio 均消费最后 accepted route。未改 stage、placement、mini、IDB writer、ProgressSave、tsconfig 或 Library v1；不含发布、部署或外部权限变更。

## 保全和归属

- task12 独占视频源码 `ac3c81ea3285090350c1d6e1135d2f232c355319` 与文档尾提交 `e965900be2a24356e6ef7125460e469435033ea1` 带原作者 cherry-pick 为 `eb2591bdccf501c6b4286bb8b824f179e7c3135f`、`cfdbdb7d2a107b9185425fc043efc54fa27e1d46`。
- 跳过旧 424 宿主提交 `5a0bcdf5d7db4384c1c5b868d868ff7c57861599`。
- `9dc6b9cbb513579e26a8da17e422a19762f3e807` 独立保全原视频 owner 尚未提交的链接准备 UI，以及 task17 的三个相关测试修改、新原生 link 测试、6 过 0 失败报告和键盘驱动诊断。均与 task17 双读快照逐字节一致。原作者归属保留于提交正文；这些成果不是本轮新增功能。
- 双读快照 manifest SHA256：`593fff85da14ad1f405730fc70f6ea0153e282dfc55943256e22103bc1b762bf`。原 source 和冻结 stage 树在验收结束仍无变化。
- `5c629bbaf4588b8c5e5829c7c7725c63f7dcff28` 仅接入六个共享文件，43 行增加、21 行删除；除 StudyApp 保留 stage 并在其后接 video，其余接入来自原 bd5 参考 patch。

以下原源码 SHA256 保持精确：

| 文件 | SHA256 |
| --- | --- |
| ui.tsx | `807b7d86de36287f93fb28bfc1056814a11122033824e6ffe1364765f65316e8` |
| controller.ts | `8d219663f490d4df315a01a5631000b1bc783f4f16a826cfe5bff13efc19b4f1` |
| sources.json | `12c318c867e20cf61f7e6c2beb89f75be1047c6d744611c4b6dcb6100a9f5ef4` |

## 本轮实际验收

Chrome `154.0.8037.59`，全新合成 profile、本机完整 classic/map 构建、原生 IndexedDB/Web Locks、原生字段输入、下载与文件选择。未改设备或浏览器时钟；没有复制用户 profile、真实学习记录或自然留存档案。

`tests/stage-combined-browser.mjs` 13 过 0 失败，页面异常 0、外部请求 0：

1. 正常旧 NCE notes 入口原笔记可见，原生编辑确认保存。
2. 注入真实 IDB put 失败后，原稿保留，mini、placement、stage 三个请求均恢复 accepted NCE hash，模块不提前卸载。
3. 恢复 writer 后原生「重试保存笔记」确认同一稿；来源准备完成后才出现原链接，保留首答与 attempts，仅标当前 pending answer 为 hinted，并记录精确来源。
4. 从 NCE 进入 mini、placement、stage 并返回旧 notes/讲解，notes、learning raw 和 stage raw/anchor/due 精确保留。
5. 原生刷新恢复已确认笔记及同一 stage 时序。
6. NCE 同页 ProgressSave 原生导出保留个人 notes、视频 notes、原学习首答、计数、其他 draft 和 exact stage raw。
7. 同页原生选择备份文件恢复，恢复通知刷新视频笔记，exact stage raw/anchor/due 与原学习、notes 保留。
8. 正常 course diagnostic 与 independent 隐藏视频、笔记、播放器和视频链接。
9. 正常学习来源写入 `source: video`，不追加 `source: text`、不增加测试计数或通过资格。
10. 703 课内分段覆盖 287 课，全部 summary null，来源文件字节未变。

类型检查 exit 0；classic/map 原配置 online 构建 exit 0。相关回归：19 视频组、8 course-loop host 组、14 autosave 组通过；37 个实际 ProgressSave TSX/canonical adapter 检查通过。后者使用内存 hooks/storage/locks；原生同页备份和恢复的证据来自上述 Chrome 组合测试。

任务17的 6 组公开原生链接测试报告原样保留，本轮没有重复开发或重跑左键/中键/Enter 全矩阵。组合驱动首轮点击了 notes 已选中的 practice tab，第二轮遇到 Radix 关闭后的焦点返回；只修测试驱动的页签顺序、关闭等待与原生焦点重试，最终 13 组通过。中断记录随证据包保留。

最终生产 bundle 图核实 stage ExaminerPanel、examiner pack、测试与 preview 不可达，learner-pack 不含答案/听力脚本；新增 video tests/qa/docs 与合成 fixture API 不进入生产 bundle。

## 发布者接入

使用最终交付 manifest 指定的完整 `video-final-on-cccefc12.patch` 或 incremental bundle，base 必须精确为 cccefc12。该完整增量包含上述保全提交、六文件最小共享接入及本轮测试/说明。不要再套 `online424-shared.patch`，也不要并行覆盖宿主文件。交付时已用独立 Git index 验证 patch 应用后的 tree 与最终 commit 精确一致。

独立 clone 通过只读 node_modules 链接使用现有依赖；构建用 curriculum.json 为既有静态输入，SHA256 `edca10b797e8f5c80771bc9ac0e9bafdd896f2d24553956475cc5d0f158976ac`。本机浏览器测试只读既有公开教材资产，具体请求字节 SHA 随报告保留。

## 未测边界

原生右键菜单未测；B站网络受阻下只核对来源链接，没有完整实际播放/人声证据。真实自然 24h/7d 留存、人工外评、实体手机、学习增益和视频内容摘要均未验。模型中的旧时间与 reviewer 是明确合成 fixture，不构成这些真实证据。未推送、部署或写 publisher；未更新 Library v1。
