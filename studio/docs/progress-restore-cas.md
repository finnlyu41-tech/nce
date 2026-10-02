# 备份预览后主 State 并发保存保护

固定基线：`b46812edff731dabe9c302d2147698c34f132621`。独立分支
`codex/progress-restore-cas-20261001`，工作树 `/tmp/nce-progress-restore-cas-20261001`。
原作者交付时尚未推送、合并或部署；2026-10-02 已由新负责人串行发布并复验，见文末。IELTS 内容工作树及双区 adapter 运行码没有修改。

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

## 2026-10-02 接管与生产验收

新唯一发布负责人从干净的 `b46812edff731dabe9c302d2147698c34f132621` 接管，
使用独立 Git 数据库 `/var/folders/kl/jttnxn9s05ndr0zt9kjrfgn00000gn/T/english-studio-release-takeover-20261002-5dk823t6`；原主仓库、原发布工作树、原作者树和所有 dirty 工作均未改动。
没有依赖旧对话恢复，没有读取凭据或内部会话库，没有变更认证、网络、权限或收费。
RDC 已核实并使用同一 Finns-MacBook-Pro 的文件与命令能力；它未暴露独立桌面点选工具。

先单独将 P0 `f1894125a7efbf32d26e80332ed195d498a88143` 原子快进两个既有发布分支，
发布为 `2026-10-02-progress-restore-cas-v22`，不可变生产部署
[35b6cd64](https://35b6cd64.finn-english-studio.pages.dev/)，正式域名同步更新。
新负责人复跑文件、26/26 TSX/宿主、20/20 adapter、9/9 真实 Chrome 存储事务、TypeScript、
在线/离线构建；在线/离线 JS 哈希与作者相同。1950 个发布文件完整白名单/哈希通过。
两域 44 项实际资源哈希一致；**两域各 16 个原生产品 UI 案例通过，运行异常 0**。
C3b/C3c 均为 A 预览后 B 原生输入新笔记并确认实际 IDB 落盘，再由 A 原生确认；
拒绝旧预览、无新成功回执、三存储完整保留。实际重新核对、回退到 B 的数据、取消、
坏文件与有效重试、恢复后普通自动保存、C3a 双区晚写拒绝和 C2 较新结果保留也通过。

随后无冲突接入原句号补丁 `a9dd53670b1e1b3db8f1c6c82fac20644f12b7fe`，
集成运行源码 **`3a6e89cf3faf2534087ef2e001743450f2289153`**。生产修改仅为普通语法末尾中文句号兼容；
P0 四个生产文件逐字不变。发布为 `2026-10-02-grammar-terminal-period-v23`，
不可变生产部署 [486c9ea6](https://486c9ea6.finn-english-studio.pages.dev/)，
[正式站](https://finn-english-studio.pages.dev/)与该部署 44 项资源精确哈希一致。
最终不可变版本重新通过真实原生 v2 正常恢复和 v1/v2 C3b/C3c，运行异常 0。

句号源码门禁复跑通过：28/97/168、168 规范和 137 accepted；1220 个等价断言、296 个
干扰项检查、40 个有限反例和 43 个严格标点检查；课程/剩余批次/备份/26 与 20 项进度
回归、TypeScript、限定 lint、在线/离线构建均通过。正式站用全新合成 Chrome 档案，
不注入存储或 UI 状态，按真实轮次完成 **72 次原生作答中的 12 个目标案例**：
U1 ASCII/中文末尾句号/弯引号正例，以及否定/时态/缺 be 反例；U16/U27/U28
必要标点各一个正反对照。刷新后原答与 attempt 判断保留；未声称刷新后重新打开详细结果面板。
1280×900 与一个 390×844 案例无横向溢出；这只是浏览器视口，不是真机。

全部本轮回执、源版本、截图、驱动、构建日志、两次发布与远端回读在
`/Users/finnlyu/Documents/Codex/2026-10-02/task/release-takeover-20261002`。仅本机/私有仓库记录，不加入发布白名单。
原 P0 的两个驱动中断完整保留：一次覆盖观测缺失，一次文件控件点击未等动画；
最终不可变 16 项回执写完后的 CDP 进程清理滞留单独记录为 SIGTERM，非断言失败；
正式域名最终 16 项驱动正常退出 0。句号首次驱动因路由聚焦改变滚动位置中断，
新档案 final2 的 12 项全部通过且退出 0；这些不算额外通过次数或产品失败。

证据边界保持：真实系统配额/权限失败没有在完整 UI 人工制造，失败回退按组件与存储
事务证据记账；legacy 共同锁只约束参与本版本协议的标签。自然 24h、真实麦克风/音频、
真机和全站所有场景没有新增通过声明；13 个真实时间档案未打开或重置。
词汇、IELTS 和学习正文内部备注清理均未混入这两个独立修复批次，等待各自审查交付。

构建复现先沿现有脚本生成 `dist-online`，再将生成的 `version.json.version` 标记为
该批 v22/v23，`runtime_sha` 标记为实际运行源码；这是输出元数据，不改题库或持久化 schema。
后续文档提交只同步这份验收记录，不重新部署或改变上述运行源码。

## 2026-10-02 学员界面独立批

已在 P0 与句号批各自验收后，串行发布 `2026-10-02-learner-ui-v24`。运行源码为
`d8eafef117889d2425415ab778cd5896113d5d68`，不可变部署
[ f7ece0c2 ](https://f7ece0c2.finn-english-studio.pages.dev/)，正式站同步。
两条既有发布分支均原子快进，未 force；Cloudflare 回读确认为 Production / main。

核验并读取了 Finn 指定 Library 审计包：1467404 bytes，SHA256
`5316e308ed8c5aee5d20525206a1fc0c7939a587985b4589fc026dc0408d7e41`，ZIP CRC 全通过。
按实际截图删除制作覆盖率、深化标签和映射话术；知识点进入单独详情、焦点移到标题，
返回保留首项/末项的位置与键盘焦点；详情只讲所选知识点，避免重复标题或同课切换误导。
练习按钮移到目标后；起步课突出“听这一句”，下一句仍可直接使用。
语法参考改为明确文字入口，必要教学指引常显，提交前/重做后参考不显示。
原著归属、开放表达与评分限制、隐私保存和录音边界保留。

独立本地、不可变和正式站各 19 项真实产品 UI 检查全部通过，运行异常 0。
1280/390/320 CSS 视口覆盖目录、知识点、返回和首屏入口；原生 Tab / Enter、
提示、首答刷新、未匹配反馈、参考显隐、起步课播放状态与下一句刷新续学通过。
原答/状态只读取核对，未注入存储。不是手机或软键盘实测，也不声称音频听感合格。
在线、地图、离线构建、TypeScript、87 项语法 UI 与 672 证据链、进度回归通过；
6 个已有 lint 错误和 6 个警告与基线逐项相同，本批无新增。
1950 个发布文件完整白名单/哈希通过；两域 44 项实际资源精确哈希一致。
最终正式站另通过 P0 原生 v2 恢复及 v1/v2 C3b/C3c 3 项，及句号 12 个有限案例
（72 次原生提交）；P0、matcher、进度模型与音频执行代码逐字保持 v23。

中断驱动全部保留，不累计为通过：键盘首次缺 Enter 字符事件；一次未等返回焦点
完成；一次测试代码使用被 CSP 拒绝的 eval，已改为宿主读取比较，未更改 CSP；
最终 P0 初次未复制合成备份夹具，final2 重新准备现有真实下载夹具后通过。
没有将这些驱动错误记为产品失败，也没有读取或重置真实时间档案。

证据目录为 `/Users/finnlyu/Documents/Codex/2026-10-02/task/release-takeover-20261002`。其审计报告、截图、日志及维护说明
均未加入发布白名单或渲染给学员。后续 IELTS 已完成内容包另批接线，词汇冻结链
保持排队；本次验收不代表它们已在产品中可练。


## Accepted v25 production checkpoint, 2026-10-02

Runtime c64e3fa3a031b477a5c1cdf26172df9fd4206fcd, version 2026-10-02-ielts-completed-batches-v25. Immutable https://a62c9ce1.finn-english-studio.pages.dev/ and existing production https://finn-english-studio.pages.dev/ both match the tested package. Both existing remote release branches equal this runtime. Cloudflare Production/main source and 44 public hashes agree.

Native IELTS acceptance: 35 local, 35 immutable and 35 production groups, zero Runtime exceptions. Eight courses per category, sixteen actual saved sessions, 96 material references and 66 unique materials. Native Today links/legacy alias, writer views, multiple selection, raw wrong originals, timing concealment, feedback/correction and real downloaded sixteen-session backup/restore/undo passed. Audio playback requests and the unconfirmed-audibility gate were tested; actual audibility was never fabricated. All seventeen authored files remain unchanged. Long new-course scope notes are available through a named help button; scoring limits remain beside feedback.

Final same-source production P0: normal v2 restore plus v1/v2 preview races, 3/3 passed, zero exceptions. P0, grammar matcher/progress and map audio execution files equal their previously accepted versions. Online, map and offline builds, 1950-file whitelist and TypeScript passed. Model-only added-course evidence has five integration groups and 654 additional transition round trips; it does not prove natural time or audible audio.

Evidence: /Users/finnlyu/Documents/Codex/2026-10-02/task/release-takeover-20261002/{ielts-ui-local-accepted,ielts-ui-immutable,ielts-ui-production,ielts-final-p0}/receipt.json; ielts-deploy-receipt.json; ielts-public-hashes.json.

The UI-only independent audit endpoint is still https://f7ece0c2.finn-english-studio.pages.dev/, runtime d8eafef117889d2425415ab778cd5896113d5d68. Its 19 native groups on each origin, plus final 3 P0 and 12 grammar cases/72 submissions, remain in ui-production/receipt.json, ui-final-p0-final2/receipt.json and ui-final-grammar/receipt.json. Current production has moved to v25, so pin this immutable URL for the UI-only audit.

Remaining: the exact frozen vocabulary handoff/commit order has not been received by this owner; no vocabulary changes were included. Other IELTS requirements, expert/learner review, actual audibility, microphone, real phone and natural 24-hour evidence retain their separate status. Original trees and thirteen sealed real-time profiles remain untouched. No deployment tool is waiting; every deployment and final browser driver exited 0.
