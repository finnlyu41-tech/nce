# GT 场景原创选项式表格专项

基线：`d717bad909d889fd305d667bd1d8530883aaf23a`；远端 `https://github.com/finnlyu41-tech/nce.git`。独立分支 `codex/ielts-gt-table-options-20261003`。仅本地交付，不推送、不合并、不部署。

## 官方依据与剩余缺口

- [IELTS GT Reading format](https://ielts.org/take-a-test/test-types/ielts-general-training-test/ielts-general-training-format-reading)：Type 6 包含表格；当前说明明确原文取词，题数可变，答案不保证同序。没有直接验证 GT 字母选项式表格。
- [British Council completion 教师资料](https://takeielts.britishcouncil.org/sites/default/files/2026-06/reading_completion_questions_.pdf)：同时介绍 Academic／GT；讨论列表选择与各 completion 形式的共通策略。属于间接教学依据，不是直接 GT selecting-letter table 样题。
- 本课 A–F、每篇最多用一次、三格、180 秒均为原创题面设置。不套用 Academic 来源词限制；不换算 Band。
- 本轮增加局部教学链。GT 来源词表格、正式长度／混合卷／校准难度、人工教学效果和实际隔日保持仍未验证。注册入口和走完地图都不代表这些缺口闭合。

## 覆盖与代码证据

| 环节 | 本轮前 | 本轮局部交付 | 证据 |
|---|---|---|---|
| 解释 | GT 选项表格缺失 | 行、条件、改写、回答形式 | `curriculum/gt-table-options.ts:gtTableOptionsLesson.explanation` |
| 示范 | 缺失 | 三格只读示范、证据及教练步骤 | `gt-table-model`，`GTTableOptionsView` |
| 引导 | 缺失 | 新工作通知；提交后逐选项反馈 | `gt-table-guided`，`gtTableOptionFeedback` |
| 独立 | 缺失 | 新材料首答；提示／新题条件照实记录 | `gt-table-independent`，既有 `transitionSample` |
| 限时 | 缺失 | 主动开始前隐藏；超时照存 | `gt-table-timed`，既有计时与收据 |
| 反馈与订正 | 缺失 | 所选干扰项的条件差异；首答和订正独立 | `references`，`correctionAnswers/correctionNote` |
| 复习 | 缺失 | 两份未曝光新题沿现有间隔 | `gt-table-review-a/b`，既有复验流程 |

六篇原创虚构短文，每篇 108–111 词；18 格含示范／引导；108 条逐选项反馈。盲解 18／18 一致；原文证据、字符位置与反馈引文均核对，三处措辞收紧后冻结。数据与来源可追踪，不复制官方真题。

## 保存接口

`ielts-gt-table-context-v1` 仅存已展示的文章、指令、行列、六项列表及公开题干；没有答案键、解释、提示、未开始限时题或未曝光复验题库。
`readGTTableContext`／`extendGTTableContext` 严格校验；未知或改变的输入保留原文并阻止覆盖。
`replaceSampleProgressWithGTTableContext` 比较作答、Academic 题面及 GT 题面三份期待 raw，复用现有作答与 Academic 写入规则，单次 State 更新协调三份记录。
原答、独立订正、提示和曝光随当前整站 v1／v2 文件层备份；不改全局 State/schema、评分、调度器或保存 UI。

## 有限验收

运行命令见 `scripts/test-ielts-gt-table-options.mjs`、`test-ielts-gt-table-context.mjs`、`test-ielts-gt-table-host-browser.mjs`。
内容六组、46 次 canonical 往返；GT 题面 11 组；既有 Academic 题面 12 组、序列 125 检查、工作区 51 组、源宿主 11 组通过。严格全项目 TypeScript 通过。
真实源码宿主 53 项／4 图通过；真实 IndexedDB、新错误首答反馈、独立订正、刷新字节及 320／390 布局均包含。当前 Today 优先 NCE；实测既有 IELTS 概览入口与课程目录返回保存阶段，未新增 Today 逻辑。
在线／离线构建与打包通过；整包验证通过。源码与打包宿主各 53 项／4 图通过；最终浏览器回执与哈希在交付包中，不把本地浏览器等同已上线、真机或实际 24 小时证据。

打包浏览器仍记录浏览器默认的 `/favicon.ico` 404（现有 Worker 白名单没有此路径，HTML 自带 data SVG 图标）；该请求单独保留，课程文档／脚本／样式／数据请求必须全部成功。不修改发布图标或 Worker。
