# 第一册例句第二批

基线 `0bec6cf3cc510191c075eaf62f5b38527eaa335b`（v17 发布记录），首批 PR #3 已合并；没有重做首批接线。在原授权 `task-3/english-flashcards` 路径重建隔离工作树，未写主仓库或发布工作树。分支 `codex/vocabulary-nce1-examples-batch2-20261001`。本批开始时的 v16 基线 `bc365d9` 已快进至 v17，本批涉及文件无主线并发改动。

## 内容与审读范围

本批仅补 12 个已列入缺口清单的第一册词，13 条本站原创双语例句及搭配，未增加依赖、接口、UI、FSRS 或进度迁移。语句使用各自的具体情境，不从通用模板批量填充。英语、中译、词义和搭配经过 Codex 编辑核对，不冒称教师审校或全义项核验。

| 册课 | 词 | 本批审读义项 | 保留的其他义项缺口 |
| --- | --- | --- | --- |
| NCE1 / 8 | air hostess | 空姐（教材称呼） | 不替代其他空乘称呼的独立词条 |
| NCE1 / 8 | hairdresser | 美发师、理发师 | 理发店不作为人物义 |
| NCE1 / 8 | housewife | 家庭主妇 | 不覆盖 home / housework |
| NCE1 / 8 | mechanic | 机械工、修理技工 | 形容词“手工的”未补 |
| NCE1 / 8 | milkman | 送奶工 | 牛奶商、挤奶者未另补 |
| NCE1 / 8 | policeman | 警察，男性称呼 | 词典化学条目未补 |
| NCE1 / 8 | policewoman | 女警察 | 未改变现有词典释义 |
| NCE1 / 8 | postman | 邮递员 | 词典历史法律用法未补 |
| NCE1 / 10 | clean | 清洁、干净 | 清白、简洁未补 |
| NCE1 / 10 | dirty | 脏、不清洁 | 卑鄙义未补 |
| NCE1 / 10 | hot | 温度高；辣（两条分别标义） | 热心、热情、紧迫等未补 |
| NCE1 / 10 | lazy | 懒惰、怠惰 | 缓慢义未补 |

可核验清单见 [batch2 JSON](vocabulary-examples-batch2.json)：稳定内容 ID、词、实际册课、正例释义、排除测试标签和审读项目逐条列出，英文、中译与搭配按 ID 对照 `app/vocabulary-examples.ts`。检查真实教材索引是否包含该册课，以及当前词表简释能否召回该条内容。排除标签包含其他义项和容易混淆的错误输入，不宣称它们都是该词的真实词义。hot 的“热”和“辣”分别召回，“热心的”不自动套入。

## 覆盖与风险

累计本站原创为 **44 词 / 52 个义项例句**。教材 3,347 词中，有教材双语词形候选的仍为 3,047；候选或原创合计从 3,065 增至 **3,077**，两者都没有的从 282 降至 **270**。12 条既有 IELTS 原创种子不计入该教材增量。

3,077 是候选或本批原创的并集，不是 3,077 词全部义项已经审读。最新 [覆盖 JSON](vocabulary-examples-coverage.json) 和 [缺口 CSV](vocabulary-examples-missing.csv) 保留。第一册第 6 课的 Fiat 目前词典为“命令”义，与品牌语境不符；Ford / Mini 等也有普通词与品牌交叉，本批先保留，见 [义项风险单](vocabulary-examples-sense-risks.md)。不能为了减小缺口数给错误释义生成例句。

## 验证和发布边界

类型、例句/义项清单、15 个 FSRS 场景与真实来源组件检查通过；读取补充例句仍保留已有中译、卡片排程、旧 due/box、备份与来源。测试覆盖未翻面隐藏、揭晓显示、文本转义和词条去重。本批不修改任何用户学习记录。

在 v17 基线运行 `pnpm check`、定向 ESLint、`verify:vocabulary-examples`、`verify:flashcards`、`verify:progress`、`verify:vocabulary` 均通过。`package:online`、`verify:online`、`package:static` 也通过；在线资源验证为 1,950 文件、556 份材料。覆盖 JSON 与缺口 CSV 和本轮重新生成的结果一致。构建仍有主线既有大块体积提示，本批没有增加依赖或音视频资源。

可保留的执行摘要见 [验证 JSON](verification/vocabulary-examples-batch2.json)，完整日志在忽略的 `work/vocabulary-examples/*v17-batch2*`。正式站的主线交互复验仍属于待办；静态资源检查、SSR 与本地构建不能当作正式浏览器、手机真机或实际音频验收。本批交唯一发布负责人串行整合，不自行部署。
