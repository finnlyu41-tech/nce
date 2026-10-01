# 可立即接入的昨日经历最小演示

独立入口：`public/demos/yesterday/index.html`。线上目标路径 `/demos/yesterday/`。零框架依赖、零远程请求、零音频／评分服务；这是一条过去时阅读与表达小闭环，不是雅思模拟或完整课程。

已由主线串行发布：[正式体验](https://finn-english-studio.pages.dev/demos/yesterday/)，版本 `2026-10-01-yesterday-demo-v12`，发布源码 `c602d8af34ad93c7720645857808a3bbdcb55c60`，独立部署 `20b1f624`。两域名 102 项公开回读通过；正式入口实际打开，脚本 MIME 正确，控制台无错误或警告。

## 接入与发布

主线可只取演示的独立提交；不需要等待或接入 `ielts-blueprint/`。

1. 获取 `public/demos/yesterday/` 的五个文件，以及 `scripts/package-yesterday-demo.mjs`、`scripts/test-yesterday-demo.mjs`。
2. 主线 `pnpm package:online` 已统一复制五个演示文件到 `dist-online/demos/yesterday/`，并将哈希加入 `version.json`。无需额外复制；`scripts/package-yesterday-demo.mjs` 仅供独立预览打包。Worker 仅开放这五个文件与规范入口，其余路径仍受现有白名单限制。
3. 按主线已有发布流程发布；检查 `/demos/yesterday/` 与其四个相对资源返回成功，并在手机打开入口。既有站点访问控制保持由主线管理。
4. 回报实际线上 URL／发布版本／手机运行结果；没有回执前不可称已上线。

本机运行：`python3 -m http.server 4317 --bind 127.0.0.1 --directory public`。

## 体验与边界

默认沿一条路线走，每步只有一个主下一步。回看／跳过在收起的次要菜单里，任何步骤可返回，不设置科目、模式或偏好问卷。

1. 先试 1 道原创结构题，保留第一次作答。
2. 对比 `went / didn’t go / Did…go`，说明过去只标记一次。
3. 撤去讲解，用新人物与地点回答两道独立结构题。
4. 自动选择实际错误对应的补救，说明错因，用新情境再试。重复错误简短说明，再换题；每个目标只备两道小样例，耗尽时明确提示。可选开放草稿仅保存／自查，待核对。
5. 显示首答、提示和不同情境结果；明确未检验听力、真实口语和长期保持。给出明天 2 分钟、一周后 3 分钟的建议，未来复习始终为未进行，不自动排程或提醒。

提示按钮、看到未答题后回看规则都会保留帮助标记。已回答的原题不能覆盖首答；同题重新体验保留曝光历史，不重新计作新题证据。开放回答不打分、不计算 Band 或掌握。原创素材共九道短题，均是样例，未做专家教案验收。页面明确“本演示先体验阅读／表达流程，听力待接”。

唯一存储键：`nce-demo-yesterday-v1`，仅浏览器本机体验状态，不读写主线学习进度、评分、词卡、语法 drafts 或地图状态。草稿不发往服务端；用户在复制按钮上主动操作时复制到自己的剪贴板。

## 验证结果

- `node scripts/test-yesterday-demo.mjs`：28 项行为与边界检查通过。
- `node --check public/demos/yesterday/app.mjs`：通过。
- 浏览器实际走通：首答错误 → 三种形式讲解 → 独立题期间回看（自动帮助标记）→ 错答／另题正确 → 原错因补救 → 同类重复错误 → 换新情境正确 → 开放草稿待核对 → 保存建议 → 刷新恢复；未发生控制台 error／warn。
- 390×844 与 320×700 视口实查没有横向溢出。主动作只有一个，固定在屏内，按钮 49px；320px 下长内容可滚动。
- 最终测试记录显示 4 道不同情境首答、无提示答对 2 道、用帮助 1 道；这是本机测试证据示例，不是学习者成绩。保存建议后仍显示“未来复习尚未进行”。

截图：[390 首屏](verification/yesterday-390-start.jpg)、[320 讲解](verification/yesterday-320-learn.jpg)、[320 换题](verification/yesterday-320-fresh.jpg)、[390 证据页](verification/yesterday-390-evidence-full.jpg)。

线上路径、既有响应头下 `.mjs` 的 MIME 类型与发布回执已由主线核实。真手机浏览器、真实长期学习效果尚未验证，未接音频。最小演示已完成，蓝图与四课样例另存，不是这次发布的前置。
