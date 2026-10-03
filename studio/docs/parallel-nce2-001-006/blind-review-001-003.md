# 第二册1–3首批54题最终独立盲审

本次对最新 `blind-prompts-001-003.json` 的54题重新独立校验，仅读取获准的 courseId/id/scope/context/prompt/options。未读取实现、module、accepted、matcher、tests、作者资料或新增initial档案；未根据接受规则调整答案。最终还单独重读了周末工作题的最新修订。

交付 `blind-answers-001-003.json`：54个 `{id, answer, variants, issues}` 对象，54个独立受控首选解，139个有限自然变体。对应ID逐项与允许题面核对。唯一options题严格复制给定完整选项 `Milo sometimes eats outside.`，不改写、不列变体。

## 最终结果

54题均有可复核的独立受控解。以下证据问题已在最终允许题面修复：

- **Ivo实际三张**：context现在明确收据记载“实际买了三张卡”，输出three无需从原计划补入；实际购买与零寄件可独立核查。
- **Tessa通常通勤**：context改为本月完整二十次通勤全部乘公交；已不依赖月票推断。当前骑车另有视频证据。
- **女学生指代**：context明确两位评委、一位女学生，`The judges praised her.`的人数与性别均有情境依据。
- **零工作与零加班**：guided-nce2-002-frequency最终明确五次周末一次也没工作，而不仅是没有加班。`We never work at weekends.`的work事实已有依据；先前的语义差距已消除。
- **后四问否题**：Lena需补问晚间电视习惯；Max需报告此刻游泳项目未进行；I需报告此刻在家午饭项目未发生；they需向知情者核实每次是否开车。每题的目标项目、时段/状态或频率由context决定，已不能只从prompt的正确字段直接抄出答案。首选解分别为 `Do you watch TV in the evening?`、`Max is not swimming now.`、`I am not having lunch at home now.`、`Do they always go to work by car?`。

## 剩余边界

**问句类型仍有提示，中性极性是受控解释。** Lena和they题的prompt要求问号，已提示询问形式；Max和I题允许句号，已偏向报告。context仍决定要询问或报告哪个项目、哪个时段与何种状态，因而有实际内容选择，但不能宣称询问/报告形式完全无提示。对未知习惯采用无偏向的Do you/Do they问句是合适受控解；自然对话中的Don't you/Don't they也可能询问同一未知命题，不过带预期或惊讶。未知事实本身不逻辑排除这类带偏向问句，故未将其列为中性等价变体。若要问句极性绝对唯一，题面可明确要求“中性询问”。

**频率只覆盖给定观察期。** 十次周一早餐、五次周末、全月十次点名、六次阅读活动等完整记录支持题设域内always/never；句子未显示观察期时，只能连同context理解。不能由此推广永久习惯，也不能将周一早餐规律推广其他餐次。Tessa二十次通勤支持本月惯常方式，未保证永远乘公交。十次午休2/10与Milo午餐2/8，在always/sometimes/never有限候选中对应sometimes。

**正确词块充分提示的基线/跟练仍是构句证据。** 多道diagnostic/guided已给全部正确词块或正确事件次序，适合检验语序、人称、时态、否定与介词。不应把这类成功解释为自主读取竞争字段的迁移。逐题issues区分充分提示的构句任务与必须结合context取舍的受控事实选择。修改后的后四问否题不再沿用初审“全部正确字段已在prompt”的结论，但仍保留上述形式提示边界。

**自然近似句和受控解须分开。** 第一课明确方式→地点→时间，所以quietly前置、时间置首等自然排列未列受控变体。指定but she/he的题保留人称，不以同主语省略替换。`on weekends`是自然美式表达，但不替换指定`at weekends`；`Pia borrowed a key from Owen`自然描述同一借贷事实，却超出from词汇和借出方向任务。`Max is sitting on the bank now.`虽真实但没有回答游泳项目；`I do not have lunch at home now.`可能表达如今习惯改变，不能等同题设保留的惯例下此刻否定。

**复数否定的语用范围。** Rae题的`did not send them`在context明确零封时成立；脱离context，自然语言有时可宽松指未全部寄出，不如否定a single letter精确。这是解释边界，不能凭孤立句子证明零封。

## 变体原则与核对范围

variants按最终可见题面独立枚举：英美`apologised/apologized`；名词宾语在`turned off the light/turned the light off`两位置；be/did not的正常缩写；未限定的合理now位置；Rita/Pia明确允许的is后或句末now；第三课日期允许位置、and then第二分句同主语省略/补出he或she、Luca明确允许的第二the box/it。双宾语与to结构仅在题目明确允许时并列；人放物前或物置动词后的限制均遵守。

有限标点变体包括but或and then前可有或省略逗号、句首时间短语后可有或省略逗号。仅列语义和句法成立的完整句子。大小写、空白、直弯撇号、可省略句号等scope已明确允许的机械差异不重复枚举；直接问句保留问号。枚举是有限自然解集，不声称穷尽所有自然英语或与任何实现接受集一致。

这里核对的是独立答案数量、唯一ID及选择题是否逐字取自允许options，不是实施测试。没有访问实现，无法报告matcher接受率或测试覆盖；没有实际学习者首答/订正历史，也没有验证真人学习、自然24h/7d保持、口语或听感。题面“保留上一轮首答和订正”是流程要求，不是已发生学习效果的证据。

最终没有发现阻止54题提供受控解的事实缺口；剩余范围与语用边界须伴随后续结论保留。
