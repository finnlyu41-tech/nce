# R24–26：语法合理变体与 IELTS 迁移小批

基线：`c6b9b0182317fba09d1957b9844d6edc63f51ac4`，2026-10-03 本机实际 fetch 后指定 online 与 IELTS-map 远程分支同 head。工作分支 `codex/r24-26-grammar-variants-20261003`。本批只改三个已注册单元的数据（11 个 guide 关联），不增加单元、题目、存储版本或共享判定规则。

## 已修复的学习缺口

- `time-perspective-v0-produce`：`We have not yet inflated the balloons.` 和两种缩写原来拒绝；补齐 yet 在否定后的位置，讲解保留完成时与否定要求。
- `linked-vocabulary-v1-produce`：排除短语紧跟主语、前置 except for、but / other than / apart from 原来拒绝。题面已有“聚会结束时”的过去参照，`had turned up` 也可回顾此前完成的到场；有限加入常见表达，不把这种合理时态视作错误。添加义 besides、现在完成时和只报告过程的过去进行时仍拒绝。
- `giving-directions-v0-produce`：旧题面承认 put…in 自然，却只收 into。本批明确两种视角都可用，补 in / into 与句首、句末 please；on / out of 和非祈使句仍拒绝。

全批 21 条新增 accepted，只有三个原题的接受集受影响；另明确原有 giving-directions-v1-repair 题允许展开 Don't，与它既有 accepted 保持一致。原 168 个 `[id, answer]` 顺序指纹保持 `0d0a0f94d8a72361e79c6730c88e6fe719da81b03dcaa52ba466ca8ca3d0fedc`。原 137 条 accepted 全保留，现为 158 条；204 个识别选项仍每题只一项匹配。

三个单元的讲解分别加入意义、形式、可变位置与近错边界。迁移任务具体连接活动叙述的 IELTS Speaking Part 2，以及访客指示改成 Task 1 流程陈述的局部训练；均标原创练习、非真题、人工核对，不自动给分或认定掌握。Speaking 的4–6句是搭建细节的练习稿，仍需扩展和连续说约两分钟；两句流程练习不冒充完整 Task 1 报告。官方格式依据：[Speaking](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-speaking)、[Writing](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-writing)。教学连接是本批设计判断，并非官方题目或官方评分。

## 已执行的验证

- `node studio/scripts/test-grammar-variants.mjs`：168 规范答案、158 accepted、204 选项、24 合理变体、25 错误边界通过；147 次生产 TSX 答案事件、49 个完整合成回合、保存后重新判定与隐藏中途反馈通过。
- 同一脚本 `--expect-gaps` 在隔离的原基线源码上复现 21 条合理回复误拒；不是在修改后的数据上模拟“旧行为”。
- `node studio/scripts/test-grammar-depth.mjs`：28 单元、97 guide、168 题、348 来源关联、既有内容指纹通过。
- `node studio/scripts/test-grammar-curriculum.mjs`：全量结构、672 个证据链检查、87 个 TSX 答案/状态检查、合成备份往返通过。
- 两个旧集成套件 `test-grammar-clauses.mjs --integrated` / `test-grammar-remaining.mjs --integrated` 在原基线和本批均因旧按钮文案 `开始三步练习` 失败。它们还假设提交后解释立即出现，而当前 UI 要点“查看参考与解释”。生产代码不需回退。
- 提供独立 `r24-26-test-ui-contract.patch`，仅更新这两脚本三个按钮标签并按真实 UI 展开参考；未直接修改共享测试文件。该补丁的独立副本通过两个完整集成套件：30+60 规范答案事件、句号/逗号边界、62 来源迁移回调、冻结 108 旧题内容及合成备份往返通过。publisher 可在确认共享测试所有权后应用补丁。
- `git diff --check` 通过。

## 盲解和适用边界

独立 reviewer 在未读答案/accepted/实现前盲解四道题，指出 not yet、排除位置/同义短语、礼貌形式及过去参照问题；随后只读复核实际接受集未发现误收或阻断，并指出旧提示限制残留，本批已同步修正 yet/in/into 提示，见 `r24-26-grammar-blind-review.json`。本批没有把每个英文同义表达无限生成；as yet、save、the photographer excepted、强调 don't you 等未覆盖写法仍需人工核对。已有 UI 保留“与参考不同，待核对”，共享接口无需修改。

覆盖核验与合理变体语义审查是两种证据：全量 28/97/168 结构和规范答案回归已做，本批只对三道题的受控变体作深入语义修复，不宣称其他 165 题所有自由答案已穷尽。没有真实学习者、浏览器或 IELTS 人工评分效果证据；本批 TSX 检查是组件事件测试。

## 整合与保护

cherry-pick 主提交即可接入三份现有 JSON 数据，无新增生产共享接口。新测试未改 package.json，运行命令如上。外附共享测试 patch 可以单独审阅应用。未 push 发布分支、merge 或部署；只交唯一 publisher。未读取个人记录、凭据或会话数据库，未改自然时间档案、首页路线或学习存储。Obsidian 两处已知根规则入口均不存在，未创建替代记录。
