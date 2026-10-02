# 067–071 独立盲答审阅

仅阅读指定题干 `blind-prompts-067-071.json`，未读取 content、matcher、accepted、其他答案，也未调用 checker。根据最终更新题干再次核对；以下结论来自语义与语法判断，不代表真实 factory 接纳结果。

交付 `blind-answers-067-071.json`：54 条，每条含 `id`、首选 `answer`、应接纳的合理 `variants`、语义/自然性/歧义 `issues`。67、69、71 各 18 条，ID 顺序与最终题干一致。只改动这两个交付文件，未 commit 或向外通知。

## 主要结论

- 过去 be：I/he/she/it 与单数用 was；you/we/they 及复数用 were。一般疑问句倒装；短答按事实及答话人称选择，Were you…? 在单人答话情境中答 Yes, I was。
- 地点：上课用途 at school、在家 at home、礼拜用途 at church；已知办公室 at the office；乡下 in the country。星期用 on；月份、年份、国家用 in；yesterday、last night/week/year 不加 on。
- 商店省略：She was at the baker’s yesterday 与补出 baker’s shop 都符合题干，直弯撇号均属格式变体。
- 存在句：a table/a bridge/some water 用 There was；three bicycles/four chairs/two trees 用 There were。不可数 water 不因 some 而变为复数。
- 时间问题：题意只缺时间，使用 When；已知地点保留，不改为 Where，也不凭空补日期。the team 在最终题干已明确允许整体 was 和成员 were，二者均列入交付。
- 过去动作：肯定句使用 cleaned/enjoyed/arrived/played/telephoned/phoned/opened；did 问句及 did not/ didn’t 否定后用原形。What did she do yesterday afternoon 与 When did the driver arrive 分别对应未知动作、未知时间。
- 最新电话题明确允许 phone：肯定过去式 phoned 与 telephoned 都应接纳；Did…telephone…? 与 Did…phone…? 都应接纳。

## 合理变体与限定题的边界

题干仅要求“用”给定词语，未要求时间状语只能放句末。自然的句首时间，如 Yesterday, the guide was busy、On Tuesday, she was at school、Yesterday, were you ready? 均保留原有内容，建议接纳。存在句中的地点前置及时间/地点次序变化也可成立；JSON 提供代表性变体，不穷举所有语序。

否定全写与缩写均列入变体。大小写、空白、直弯撇号和陈述句句号省略属于 scope 已声明的格式归一化，不逐条重复穷举。问句答案及所有问句变体均保留一个英文问号。

school/church 的冠词解释须谨慎：at school/at church 最贴合本题指定用途；但 at the school/at the church 并不必然表示参观建筑，也能定位在那里上课或礼拜的人。本题可按限定目标要求零冠词，反馈应说明限定短语目标，避免将带 the 断言为普遍语义或语法错误。

She enjoyed the lunch 在特定活动午餐情境中自然。中文“享用了”有时只表示吃了，而英文 enjoyed 明确包含喜欢/享受；若要语义最精确，可写“她很喜欢昨天那顿午餐”。这是轻微措辞建议，不妨碍答题。

Did the printer work? 对应“没有正常工作”支持 No, it didn’t；如果实际是部分运转但异常，现实对话可能需限定说明。本题明确只答否定短答，可按设定作答。

## 核对范围与后续

已核对 JSON 可解析、54 个唯一 ID、与最终题干逐项对齐及答案末尾标点；未测试接纳率，未接触真实答案或实现。下一步由 root 使用真实 factory 验证独立首答和合理变体，并做源文件/UI核对。无阻塞。

最终题干 SHA-256：`67a6784a3c9ca6d3b012830a8303dfede93217893aa6d38fe48483e3cfe83fb3`
