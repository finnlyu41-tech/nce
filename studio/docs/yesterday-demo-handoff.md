# 昨日经历演示与自动复习交接

入口是 `/demos/yesterday/`。在已接受的五步演示上，完成后现在自动保存约 24 小时后的能力复习计划；刷新恢复，到期提供继续入口，实际作答后自动安排下一次。用户无需复制计划。课文、原音频、漫画及主站已有进度没有改动。

这是独立阅读／结构表达流程样例，不是雅思模拟、完整课程或官方评分。初始九道原创题继续保留；新增两组三道原创复习题。做过的题保留曝光历史，新题用尽后标为同题复做。开放草稿仍未评分、待核对；不推断掌握或 Band。

此前五步演示已随 v12 发布到 [正式入口](https://finn-english-studio.pages.dev/demos/yesterday/)，发布源码 `c602d8af34ad93c7720645857808a3bbdcb55c60`，独立部署 `20b1f624`。当时两域名 102 项资源回读及入口浏览器检查通过；该历史验收不涵盖本轮自动复习。

本轮已由主线随 v17 发布：源码 `9292efc378716d9a207d1ddefa1cc8a105644152`，独立部署 [06758b8c](https://06758b8c.finn-english-studio.pages.dev/)。两域名 114 项资源/哈希回读通过，11 个演示资源完整，模块返回 application/javascript。后续既有独立云端 QA 已回报 v17 原稿、纠正和提示可回看，未开放内容不泄露；自动复习在刷新与演示／Today 往返后保留日期和草稿，未到期不误列为到期。发布者已读回补充报告、抽看 3 张对应截图，并核对 ZIP SHA-256、CRC 及全部 16 个清单文件哈希。数字／直弯撇号缩写、缺订正说明时全文保留并刷新恢复也有同一 v17 实测；320/390、真实到期与音频仍未测。证据只保存在忽略的 `work/map-verification/v17-cloud-qa/`，不公开上传。

备份整合已随 v19 发布：源码 `7f48b41fd821af7909b37f6692868c336d7310a3`，独立部署 [4813d8d1](https://4813d8d1.finn-english-studio.pages.dev/)。两域名 114 项 HTTP／哈希／MIME 及 1,950 文件检查通过。主线 20 项适配器、14 项真实 TSX／宿主恢复、13 个独立内存场景和 19 项 Today 通过，既有 81 项演示检查、类型与双构建通过。后补测试及 API 注释不改变已发布运行逻辑；`pnpm verify:progress` 统一执行文件、适配器和界面检查。v19 浏览器／窄屏／真音频仍未验收。

## 给统一主发布线

来源分支 `codex/yesterday-review-20261001`。只取本轮自动复习提交即可，不需要接入 `ielts-blueprint/`。独立分支基于 `a1741e0a385495d22b98b1fc89afa4170f0128b9`；复查主工作树 HEAD `191f7ecab82e46033660c93326891703041d3f90` 时，演示目录和复制脚本仍与本轮修改前的版本一致。

本轮文件仅限 `public/demos/yesterday/`、演示复制／验证脚本与交接／验证文档。未修改主 `map/model`、评分、进度门槛、全局导航、FSRS、grammar drafts、教材或主站打包输出。来源分支当时未独立发布；现已由主线串行集成，发布仍由主英语线程 `01a0f10c-ff5c-7aa1-8a42-8ee650bbb2f5` 串行处理。

1. 取完整 `public/demos/yesterday/` 的 **11 个文件**，保留 `scripts/package-yesterday-demo.mjs`。新增入口为 `bootstrap.mjs`，不要漏掉模块依赖。
2. 主线 `pnpm package:online` 统一复制 11 个演示文件并登记版本哈希，Worker 与上传校验同步精确白名单。`package-yesterday-demo.mjs` 仅供独立预览，无需额外覆盖正常发布产物。
3. 主线今日练习只读同一适配器，通过 `getDueTasks` 和 `openPractice` 展示到期事项；不写入计划、不复制排程。返回、focus、pageshow、跨标签 storage 与 30 秒时钟刷新。异常保留原记录并明确显示；离线版不读取或链接此在线体验。演示的记录页和复习过程只保留一个主要复习操作。
4. 主线 `ProgressSave` 已随 v19 接入两个原有 namespace。文件 v2 在 `capability` 内保存体验原答、提示、曝光、草稿及同一适配器的计划备份；不改全局 State，也不另建排程。同步读取与校验后再打开原生保存面板；旧 v1／纯 State 文件保持可读，并且不触碰两区。恢复预览只读，确认时取得两把既有锁、新鲜比较原文、按既有计划规则合并；较新结果保留，冲突停止。失败会回退并回读，无法确认时提供恢复资料而不报成功。同页恢复会触发 Today 重新只读查询。地图进度和音频仍按原有独立范围保存。
5. 发布后回读实际 HTTPS 地址的 11 个资源、`.mjs` MIME、Web Locks 可用性、刷新恢复与真实手机行为。仅在回读确认后称已上线；本机测试地址不作为交付 URL。

## 自动保存与练习行为

- 旧 `planSaved` 只是建议标记，不生成计划。必须实际回答 `new-omar` 和 `new-may` 两道独立题、进入记录页并确认保存。未作答跳过、草稿或点击均不足。
- 新完成使用真实结束时间；符合条件的旧记录使用最后实际作答时间，不重新起算。重复渲染、刷新、重新体验不能重置已有计划。
- 初次到期是实际完成后 24 小时，时间保存在 UTC epoch milliseconds，页面按当前浏览器时区显示。跨日、时区或夏令时不改变间隔；迟到只保留一项真实到期任务，不补造过去的完成。
- 到期做肯定、否定、问句各一道。三题均正确且未用提示，下一次在实际结果后七天；有错题或帮助，一天后再练。这是演示教学安排，不是官方测评阈值。
- 进入／看题不产生结果。每道题保留首答、帮助、曝光与时间；看过未答复习题后回看规则，也记帮助。刷新或关闭后重开恢复当前复习题。
- 两组材料共享持久曝光；耗尽时明确标为同题复做，不计陌生迁移。重复作答可以安排练习间隔，不证明长期迁移或自由表达。
- 页面打开时在初始化、焦点恢复、storage 事件及每分钟检查到期；关闭网站后不发通知，没有后台权限、推送或通知申请。

## 存储与主线接口

原体验 key `nce-demo-yesterday-v1` 保留向后兼容的 version 1，新增可选 `finishedAt/reviewSession/reviewSeenIds`。它独立使用同名 Web Lock、新鲜读取及预期 raw 比较：其他标签改了内容时拒绝覆盖，当前输入仍留在本页。

计划／真实结果在新 key `nce-capability-review:v1`，与词卡 FSRS 分开。详见 [适配器 API、schema 与备份规则](yesterday-review-adapter.md)。最小调用：

```js
const store = createReviewStore({storage: localStorage, locks: navigator.locks, now: Date.now});
const current = await store.read();
const due = current.ok ? getDueTasks(current.snapshot, Date.now()) : [];
const href = due[0] ? openPractice(due[0]) : null;
// 只有练习确实完成后才能调用，resultId 必须规范化且幂等。
await store.recordResult({taskId, resultId: `${taskId}:result`, outcome, at});
```

所有写操作在共享 exclusive Web Lock 内重新读取再写，确认原文回读才显示已保存。锁缺失、quota、损坏／未来数据、未确认写入不会隐藏重置。保存失败保留本页输入，主按钮提供重试；重复点击、同结果重试只有一个 receipt。不同标签抢同次任务时第一份真实结果与排期保留，页面说明冲突。时间异常不升级为成功。

Web Locks 是同 origin 内协作的序列化机制，代码绕过适配器仍可篡改 localStorage；没有安全证明或跨浏览器兼容性承诺。规范参考：[W3C Web Locks](https://www.w3.org/TR/web-locks/)。本演示在安全上下文使用该 API；主站接入需实际检验。

## 验证与证据

在 studio 执行：

```sh
node scripts/test-yesterday-demo.mjs
node scripts/test-yesterday-review.mjs
node scripts/test-yesterday-review-flow.mjs
node scripts/test-yesterday-review-controller.mjs
node scripts/test-yesterday-review-save.mjs
node scripts/test-yesterday-review-browser.mjs --playwright-module /path/to/playwright/index.mjs --browser /path/to/chrome
node scripts/package-yesterday-demo.mjs --out-root work/yesterday-preview
```

28 原演示检查、30 适配器场景、19 练习／旧数据／demo 保存检查、1 刷新与保存交错复现、3 控制器保存集成检查、12 真实浏览器场景，共 **93 项通过**。浏览器为隔离的 headless Chrome 154.0.8037.59，注入时钟和 quota 故障；未使用学习者或线上状态。CUA 连接在本轮失效，改用本机 Playwright 启动独立浏览器验证。没有把模拟时钟或故障开关发布到产品。

真实浏览器验证了：自动创建、刷新／退出重进、到期入口、当前题恢复、七天／一天排期、有限新题耗尽、回看帮助、时区变化、quota 后重试、多标签保留首份记录及零运行错误。390×844 与 320×700 已检查；320 下无横向溢出。

证据：[测试 JSON](verification/yesterday-review-browser.json)、[自动保存](verification/yesterday-review-saved.png)、[到期入口](verification/yesterday-review-due.png)、[320 复习通过](verification/yesterday-review-passed-320.png)、[320 需要再练](verification/yesterday-review-needs-practice-320.png)、[同题复做](verification/yesterday-review-repeat-320.png)、[保存失败保留输入](verification/yesterday-review-save-failure.png)。JSON 内本机端口仅是已关闭的测试服务；不是线上地址。

当前主线已接入今日入口、完整打包和既有进度文件的两区备份；v19 已完成正式发布与 HTTPS 回读，浏览器交互仍保留独立验收边界。界面在「其他操作」链接到学习记录页的保存与恢复入口，明确换设备仍需手动保存和恢复，不声明自动同步。真实长期学习效果、听力、自由口语和开放表达评分仍未验证。
