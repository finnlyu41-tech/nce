# 备份预览后主 State 并发保存保护

固定基线：`b46812edff731dabe9c302d2147698c34f132621`。独立分支
`codex/progress-restore-cas-20261001`，工作树 `/tmp/nce-progress-restore-cas-20261001`。
本补丁没有推送、合并或部署；IELTS 内容工作树及双区 adapter 运行码没有修改。

## 问题与结果

v21 的 C3b/C3c 浏览器证据表明：A 选择旧文件并停在预览，B 在同课保存新笔记，
A 确认后会把 B 的 IndexedDB 笔记覆盖成文件内容，并显示恢复成功。页面引用检查
无法看到 B 已落盘的变化。原始证据来自 `task-7/backup-matrix-v21`；其归档 SHA256：
`f7ded89d842bf28ea2f33f007b0f82bd5e618ae8ec7ba7c9c747f2f2c2ee006c`。

先在基线添加两项失败测试，结果为 **14/16**；两项失败分别是 v1、v2 的主 State
预览冲突。修复后，确认在同一 IndexedDB `readwrite` 事务内执行 `get → 比较 → put`；
晚写导致事务中止、零恢复写入，保留新笔记并要求重新核对。

## 接口与失败边界

- `ProgressSave.captureRestore()` 在预览阶段冻结 `ProgressRestoreCheckpoint`。
  `expected` 是本页 State 引用；`persisted` 是实际存储位置及 raw 快照；`state` 是
  回退/撤销用的已持久 State。损坏的存储仍保留原 raw，页面安全 State 可供预览。
- `restore(incoming, {expected, persisted, onCommitted})` 同时检查页面和持久快照。
  `writeState` 仅在事务 `oncomplete` 后返回；`onCommitted` 立即记录提交 receipt，
  然后再检查等待期间的本页编辑并更新 UI。
- 主提交尚未完成时，executor 的 rollback 回调不写入。已提交时，rollback 必须再次
  CAS 比较本次提交值，并通过 `rollbackTo` 恢复真正原值，包括缺键或损坏记录。
  新写入使回退被拒时，保留新值，显示 partial-failure 并提供恢复资料；资料包含主 raw。
- 恢复产生的已持久 State 不再触发第二次 autosave。普通新编辑仍自动保存。
- 有效文件仍可修复损坏的本机记录。若双区操作失败并回退到损坏原值，重新置
  `storageError/storageBlocked`，避免 autosave 改写原值。
- legacy localStorage 的本版本保存和恢复共用
  `english-studio-progress:english-studio-v1` Web Lock。guarded restore 在缺少 Web Locks
  时拒绝执行。此协议只约束参与共同锁的标签页；旧版本无锁写入不具备 IDB 的事务保证。

原 v1/plain 文件不触碰 demo/review namespaces；v2 的 canonical 合并、共同双区锁、
新结果优先与冲突拒绝仍由原 adapter 执行。文件层 v1/v2 序列化 API 没有改变。

## 已执行的有限验证

| 验证 | 结果与范围 |
| --- | --- |
| `test-progress-capability-ui.mjs` | **26/26**；真实 ProgressSave TSX、宿主 capture/restore/autosave AST 和 canonical adapters，内存 hooks/storage/locks |
| `test-progress-store-browser.mjs` | **9/9**；Chrome 154.0.8037.59、两个新 localhost 标签，真实 IDB 事务与 Web Locks，合成数据 |
| 本地编译版原生 UI | **6/6**；v1/v2 正常恢复、C3b/C3c、取消、损坏文件；原生输入和文件选择，Runtime 异常 0 |
| 原 `test-capability-review-backup.mjs` | **20/20** |
| 原 `test-progress-save.mjs` | 完整/旧档往返、文件保存与拒绝路径通过 |
| TypeScript / diff | `tsc --noEmit --incremental false`、`git diff --check` 通过 |
| Vite | online 和 offline 客户端构建通过；既有大 bundle 提示仍在 |

26 项源码检查涵盖预览后同页/跨页编辑、重新预览及真实撤销前值、未提交失败无写回退、
双区失败期间晚写、等待期间编辑的提交 receipt、损坏存储修复/精确回退与旧档闪卡兼容。
9 项实际存储检查包括排队 writer 后的新鲜读取、同 token 两次并发只提交一次、
缺键/损坏原值精确回退，以及 legacy 无锁拒绝。

本地原生 UI 使用完整 online 编译包，真实路由 `#/nce/NCE1/1?tab=notes`。v1/v2
各自确认时保留三存储、无恢复成功回执、无新增 success toast，出现“重新核对当前记录”。
旧成功 toast 可能仍在淡出；未把它误判为本次操作成功。

这些是**本地**证据。没有复跑已部署站点的 C2/C3a，不把源码回归当成那些浏览器案例；
正式版本/唯一部署地址的 C3b/C3c 仍需发布 owner 接入后复跑。真机、320/390、真实音频、
实际 24 小时以及 OS 文件面板不属于本批验收。

## 复跑与本地证据

在 `studio` 中运行既有 `verify:progress` 可复跑文件、20 adapter 和 26 源码检查。
实际 Chrome 存储检查单独运行：

```sh
node scripts/test-progress-store-browser.mjs
```

使用本机已安装 Chrome/Chromium，可用 `CHROME_BIN` 指定路径；脚本自行创建并清理临时
localhost/profile，不读取个人浏览器记录。设置 `KEEP_PROGRESS_BROWSER_EVIDENCE=1` 可保留 receipt。

- 失败/通过源码日志：`/tmp/nce-progress-restore-cas-red.log`、`/tmp/nce-progress-restore-cas-green.log`。
- 最终存储 receipt：`/var/folders/kl/jttnxn9s05ndr0zt9kjrfgn00000gn/T/english-progress-store-browser-JEIIDp/receipt.json`。
- 最终本地 UI receipt/截图：`/tmp/nce-progress-cas-ui-Vm9eh3/receipt.json`、该目录下 `evidence/`。
- UI 驱动：`/tmp/nce-progress-cas-ui-check/run.mjs`，复用原失败证据的 CDP helper，并换成全新 profile/local origin。
- online JS：`standalone-G4Z5YbVy.js`，SHA256 `fda5b3ff3a41a49bb94129439834019b04d1a8750b440f0b8193e8812e4dee6e`。
- offline JS：`standalone-Y34MoIfM.js`，SHA256 `fb30f224e5b8ad6adc5bbc09b10a66d1d68389ab415e4c9459e94b885591f74b`。

构建使用 `--configLoader runner`，避免向只读共用 node_modules 写 config 缓存。
忽略的 `map/curriculum.json` 复用基线已准备产物，和原树 SHA256 同为
`edca10b797e8f5c80771bc9ac0e9bafdd896f2d24553956475cc5d0f158976ac`；没有提交生成资源。
临时证据不公开、不装入产品发布资源。
