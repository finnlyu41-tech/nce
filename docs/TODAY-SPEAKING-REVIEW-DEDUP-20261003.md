# Today：课程去重保留独立错句复习

独立基线 `6d719ceb074fe43331430f7fba0dbbf1466f3510`；候选树 `/Users/finnlyu/Documents/Codex/2026-10-03/task-2/today-speaking-review`。未改 publisher 正在发布的 F6、前序冻结成果或听说作者文件。未部署、未推送。

## 问题与最小修正

证据原文件实际位置为 `/Users/finnlyu/Documents/Codex/2026-10-03/task-3/qa-v47/review-selector.mjs` 和同目录 `evidence/review-entry-gap.json`，不是 `speaking-current/qa-v47`。

在当前基线重新复现：新有效 `State`/`Progress`，开放 `nce1-1` 访问；真实 `emptySpeaking(unit)` 带 25 小时前的 correction（word `this`、phoneme `ð`）。没有课程草稿时产生一条 `speaking:nce1-1`；加入可解析的真实课程初始草稿后变为零条。实际浏览器 Today 也没有该复习入口。

根因：`loopOwns` 的整节点 `continue` 在独立 `speakingDue` adapter 之前运行，把理解题与独立错句复习一起跳过。

修正只把 CL 去重移到 `map:` 理解练习的生成条件。既有 speaking adapter、到期判断、priority `2`、href `/map/#/learn/nce1-1?speaking=review` 全部原样保留。`add` 的 ID 去重继续保证同课只有一条错句待办。CL 已替代的旧 map resume/repair/review 仍被去重。

生产文件仅 `studio/app/today-practice.ts` 两处条件变更；另有相关测试和本交接文档。未改 `speaking.tsx`、speaking model/audio store、课程模型、mini、视频、共享权限或自然时间档案。

## 验证

- 新回归测试先在基线失败于目标断言 `0 !== 1`；修正后 Today 检查 **51/51** 通过。
- 同时验证唯一任务、真实链接、原到期时间与优先级、CL 未完成项仍先于 due review、map 去重仍生效、未到期不出现、旧来源不复用、新提示延后、无提示回想仅清除错句任务、没有地图课程完成证据。
- TypeScript、在线 standalone/map 与离线 standalone 构建通过；既有大包 warning 保留。两个改动代码文件 scoped ESLint **0 errors / 0 warnings**。
- 在独立空 Chrome profile 中，只放入本任务生成并经 `validateState`/`parseProgress` 检验的合成记录。修正前实际入口为 0；修正后为 1。
- 从真实 Today 链接进入“错句重说”，原句与旧反馈初始收起；用 Chrome 合成音频设备真实执行录音按钮和停止按钮，本地保存非空 WAV（49,964 字节）与 `review=true`、`assisted=false`、`recalledAt`。未提交自动评估。
- 原生刷新新文档后 speaking 记录完全一致。点“回到本课”再点顶栏“学习”返回 Today，错句任务清除，CL 未完成项仍在，地图 quiz attempts 仍为零。
- 共 18 张成功证据：基线 3、最终 15；320/390/1440 × 900 视口无横向溢出、无 Runtime 异常。桌面 Chrome 视口检查，不是 iPhone 真机。

复习 correction 和 CL 开始时间是合成的 25 小时前时间戳，不是自然隔日证据；浏览器当前时钟未改变。录音是合成设备输入，不是个人录音。测试环境未提供评估接口，画面显示服务暂不可连接；本批没有评估提交，也不据此推断生产服务状态。

证据目录 `/Users/finnlyu/Documents/Codex/2026-10-03/task-2/today-speaking-qa/`：`before/`、`after-final/` 原图与 receipt，`after-final/native-save.json` 为保存元数据；`before-test.log`/`after-test.log` 为回归前后结果。证据包不含浏览器 profile、音频文件、个人记录或私有系统截图。
