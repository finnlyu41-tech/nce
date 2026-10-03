# 第二册1–3首批54题独立盲审

仅读取 `blind-prompts-001-003.json` 的 scope/context/prompt/options；经委派方明确允许，仅另读 courseId/id 做标识对应。未读取 module、accepted、matcher、tests、作者文档或其他文件；未根据实现调整答案。

已交付 `blind-answers-001-003.json`，共54个 `{id, answer, variants, issues}` 对象。answer是独立选定的一句受控解；variants仅列有限自然变体，不重复大小写、空白、直弯撇号或可省略句号等 scope 已允许的机械差异。唯一 options 题严格复制 `Milo sometimes eats outside.`，variants为空。

## 首要发现

1. **Ivo实际数量未被证实**（independent-nce2-003-actual-intended）。context是“计划买三张；收据证明买了卡”，没有说收据证明实际三张。有限词库最合适的解是 `Ivo bought three cards but he did not send a single card.`，但其中three来自prompt/原计划，不能视为核查了实际数量。建议把context改为“收据证明实际买了三张卡”后再用于数量迁移评估。
2. **新情境不总决定答案**。第二课 independent/repair/review-a/review-b 的 question-negative 四题分别固定了习惯问句、此刻not swim、此刻否定have lunch和always习惯问句，全部正确内容字段已在prompt。这些题仍能检验问句/否定/时态构形，但不能单凭正确答案证明读取了新context。第一课和第三课多道diagnostic/guided同样是充分提示的构句任务。逐题issues已区分“context决定事实选择”和“false-transfer”。
3. **有限记录的频率须限定范围**。十次周一早餐、五次周末、十次点名、六次阅读活动等记录支持观察期内always/never；省略观察期的输出可以作为题设受控概括，但不足以推广永久习惯。第二课十次午休的2/10和Milo八次午餐2/8在always/sometimes/never的有限选择中均应选sometimes。
4. **受控词序和自然英语须分开解释**。第一课方式→地点→时间有明确指定，所以其他自然排列不列为受控variants。第三课非指定日期位置的序列题允许日期在第一动作后或句末，并列同主语省略与补出he/she。明确but she/he的题保留该人称，不把自然的同主语省略列入variants。短语动词允许 `turned off the light` / `turned the light off`；双宾语与to结构仅在题目明确允许时并列；apologised/apologized均成立。

## 其他题面边界

- review-b-nce2-001-actor-object的女学生性别在prompt才提供；context只说“学生”，故her不是完全从context独立得出。人数和表扬方向仍由context决定。
- guided-nce2-003-actual-intended中 `did not send them` 在给定context读为零封；自然语言孤立看也可能宽松指未全部寄出。答案必须与明示零封共同解释。
- independent-nce2-002-habit-now将月票写成“证明通常乘公交”。真实凭证本身只证明购买资格；在本题受控设定中可按明示通常习惯作答，不宜把这种凭证关系当作现实世界推断准则。
- repair-nce2-003-dated-sequence第二次the box自然可用it；在严格有限词库审稿中未列该未给词，逐题issues已提示“词库是否固定短语”应写明。review-b同类题明确要求it，所以该题使用it。
- `at weekends`的美式自然表达`on weekends`、`Pia borrowed a key from Owen`等语义近似句，因超出明确词块或报告方向，不列受控variants；不能因此称它们是错误英语。
- repaired与cleaned、演员与导演、访客与保安、计划/草稿与签字版本、现场物品与当前动作等在实际提供竞争字段的题中，context确实影响答案。这些题可支持受控事实选择结论。

## 审核结论与限制

54题均给出可核对的独立受控解；Ivo的实际数量证据缺口需修订。其余已记录范围、指代和自然表达边界。可用于后续作者答案比对，但本盲审没有访问实现，不能报告接受率、matcher覆盖或测试结果，也没有验证真人学习、自然24h/7d保持、口语或听感。题面写有“保留上一轮首答和订正”只是流程要求，此文件不含实际学习者历史，因此没有据此推断修补或保持效果。
