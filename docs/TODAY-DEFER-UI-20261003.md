# Today 全部“稍后”：本地候选

冻结基线 `d717bad909d889fd305d667bd1d8530883aaf23a`。独立工作树 `/Users/finnlyu/Documents/Codex/2026-10-03/task-2/today-defer-ui`。旧 `790a103` 及前序成果保持冻结；本候选未部署、未推送，只交唯一 publisher 集成。

## 实际卡点与修正

空测试 profile 从首页真实按钮完成听读热身，主继续按钮直接进入第 1–2 课。输入课程草稿并实际刷新恢复，再点“学习”返回 Today。

基线：课程未完成项可以“稍后”，随后可选短诊断成为唯一主推荐，仍写“继续今日学习”，且没有“稍后”。不是首页默认主路线问题；是诊断 offer 的 `kind=course` 使通用呈现隐藏了暂缓按钮。

修正：仅 `placement:offer` 显示“可选诊断”与“做短诊断（可选）”，并提供“这项稍后再做”。实际课程入口仍是一直可用的学习退路。

全部推荐事项暂缓后，使用既有只读 `courseDestination` 的真实课程链接，主按钮为“回到当前课程”；没有安全目的地时仍回课程目录。“恢复推荐顺序”继续按原优先级恢复，不标记完成、不改复习时间。

暂缓仍只影响本次页面安排。离开、重进或刷新后，未完成项和到期项按真实保存记录重新出现，避免长期隐去待复习或待修补内容。

## 精确触点

- `studio/app/today-practice-ui.tsx`：可选诊断识别、暂缓按钮、主按钮文案、全暂缓后的课程退路。
- `studio/scripts/test-today-practice.mjs`：更新两个相关呈现检查，验证可选诊断能暂缓、全暂缓后返回课程、恢复顺序、课程退路保留。
- 本交接文档。

没有修改 Today 任务优先级选择器、mini 内容、课程模型、保存事务、视频、`map/main.tsx`、布局样式、共享权限或自然时间档案。没有读取个人学习记录；所有 browser profile 都是本任务自建的合成测试记录。

## 验证

- `node scripts/test-today-practice.mjs`：50/50 通过，覆盖失败修补、到期复习、未完成项、只读记录及新呈现语义。单元检查包含受控模型时间戳；没有为历史 fixture 回退产品。
- TypeScript、在线 standalone/map 构建、离线 standalone 构建通过；既有大包 warning 仍在。
- Today UI ESLint 仅原有 1 个 `set-state-in-effect` error，rule/message/severity 与 d717 一致；没有新增。
- 原生 UI：课程新草稿刷新恢复 → 稍后 → 可选诊断 → 全部稍后 → 回原课程草稿 → 返回重进恢复原优先级；进入但不开始诊断可返回原课程；开始诊断选择答案后暂停 → 回课程 → 刷新队列 → 全部暂缓 → 回课程。
- 再启动同一个任务合成 profile：暂停状态恢复，点“继续已保存的一题”后已选 radio 答案恢复，返回课程草稿仍保留。
- 成功证据共 72 张：基线 21、修改后 45、重启回读 6；320/390/1440 宽 × 900 高，均无横向溢出、Runtime 异常。桌面 Chrome 视口验证，不是 iPhone 真机；浏览器未提前时钟、未注入进度。

证据 `/Users/finnlyu/Documents/Codex/2026-10-03/task-2/today-defer-qa/`：`before/`、`after-r3/`、`readback-final/`，各有原始 PNG 与 receipt。只把这三个成功运行打包，不包含测试 profile。

关键对照：`before/deferred-to-placement-390.png` 与 `after-r3/deferred-to-placement-390.png`；新终态 `after-r3/all-pending-deferred-390.png`。暂停答案恢复见 `readback-final/saved-choice-restored-390.png`。
