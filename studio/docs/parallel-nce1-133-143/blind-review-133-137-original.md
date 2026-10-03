# NCE1 133 / 135 / 137 独立盲解审查

## 范围与结果

只读取 `blind-prompts-133-137.json` 中的 scope / context / prompt，未读取 module、key、matcher、tests、author 文档或其他 docs。主答案由情境和明示输出约束推导。仅写本报告和 `blind-answers-133-137.json`，未提交。

- 54 题全部完成：133、135、137 各 18 题。
- 54 个不重复 id；108 条有限英文变体；51 题含 issues。
- variants 是保守、有语境支持的有限集合，不是所有自然表达的穷举。大小写、空白、直弯撇号及句末句号有无属于 scope 表面容差，未机械枚举。
- 3 题有必要条件与充分条件的严格逻辑风险，采用忠实保留必要条件的 `only if` 主答案，并明确记录普通 `if … can` 所需的补充条件。其余主答案均可直接从题面限定推导。

## 需要处理的实际歧义

以下三题的中文使用“只有……才”或“……后才”，严格保证的是必要条件，即具有许可/可行性 ⇒ 条件满足。普通 `If P, can Q` 则写条件满足 ⇒ 具有许可/可行性。必要性本身并不能推出充分性；两者可以同时成立，但题面没有明确保证。

| id | 忠实于现有情境的主答案 | 若目标必须是普通 if 句，需补足的情境 |
| --- | --- | --- |
| diagnostic-n137-conditional-can | She can enter the lab only if she gets a pass. | 拿到正式通行证即可获准进入实验室。 |
| guided-n137-conditional-can | They can take photos only if the weather is clear. | 天气转晴后游客即可拍山顶照片。 |
| review-a-n137-conditional-can | She can use the instrument only if she completes the training. | 完成安全培训即可获得操作许可。 |

这些 `only if` 答案保留题面指定的 if、主语、词汇、现在时和 can，不作会执行的承诺。前置变体 `Only if … can …` 合乎英文语法，但引入了倒装；若课程范围实际只收普通第一条件句，应修复情境，而不是把必要条件句强行等同于充分条件句。中文日常语境有时隐含“满足后即可”，这种语用理解可能支持原定教学目标，但不能当作已明示的逻辑保证。

`guided-n137-conditional-can` 的“转晴”还有变化义；明示 `be clear` 表达晴朗状态。此次尊重指定词汇，不用 `clear up` 等额外词汇修补。

`repair-n137-condition-negative` 中文说“不能按计划开门”，本可表达能力不足，但 prompt 明确要求未来不做并指定 `will not open`，因此主答案使用 will not。不能把此限定任务的未匹配推广为自然英文中的 cannot 错误。

## that、复合转述和同指

所有单从句转述均给出省略 that 的主答案及保留 that 的变体。复合转述另外保留四种合理配置：两个从句均省略、仅第一项保留、仅第二项保留、两项都保留。加入第二个 that 时，它仍受同一个说话动词管辖，不能把后半句读成转述者新增的事实。

- `repair-n133-report-perspective`：两个 she 均指 Lia；my help 指转述者。tired 为肯定，not want 为否定。
- `review-a-n133-report-perspective`：they / their work 指两位画家；I / mine 指转述者。两个主体不同，不能省略 I。两项均是 had + 过去分词，否定仅在第二项。
- `review-b-n133-report-perspective`：we 指整个队，he 指 Max，us 指队伍。第二个主体不能省略；过去进行时 improving 与过去状态 was proud 同时保留。
- `review-a-n135-reported-future`：her team 不包括 Tara；只有 team 有 have to 的必要性。she 指 Tara，第二项只是 would not wait；不能省略 she 或让 have to 覆盖第二项。
- `review-b-n135-reported-possibility`：两个 he 均指 Ash，map 可能借出，painting 可能不借出；没有一项是禁止或最终决定。
- `review-b-n135-reported-ability`：两个 she 均指 Eve，能演奏与不能读谱必须分别保留。

同主语的自然省略如 `Lia told me she was tired and did not want my help`、`Ash said he might lend the map but might not lend the painting`、`Eve told me she could play the tune but could not read the music` 均符合情境。此次三个 prompt 明列 `and she` / `but he` / `but she`，因此按严格限定输出没有放入 variants。这是范围边界，不是对自然英文语法的否定。若题目不打算要求重复主语，应把明列第二个代词的词汇清单改清楚，再接受省略。

## 时态、否定和接近正确的边界

- 133 过去记录明确规定本课倒移：was/were、was/were + -ing、had + 过去分词依情境区分。Eve 的 felt sick 不能沿用前题的进行时；发言前完成的 checked/lost/finished 不能机械改成一般过去。
- 135 may → might，can/cannot → could/could not，will → would。保留模态意义，比只检查助动词更重要。Ben / Ash 的 might not 是“可能不做”，不等于禁止；Leo / Max 的 could not 是能力否定，不是 would not 的安排或拒绝。
- Ada 的 would have to close、Tara team 的 would have to wait 不能漏掉 have to。Owen 的 his assistant would not let him use 中，assistant 是不允许的人，him 指 Owen，use 为原形，不能插入 to。
- Zoe / Noel 的 the next day 相对于原发言日期；our machine / my notes 的所有权分别固定。不能用转述日的 tomorrow，也不能交换 my / our / his 等所有者。
- 137 未实现的普通未来事件条件使用现在时；主句依题意用 will 或 can。有条件许可/可行性不等于执行承诺，can 不能随意改成 will。
- 否定条件与否定结果需逐项保留：not finish early ⇒ will not join；power does not return ⇒ exhibition will not open；not save ⇒ will not send。题面不允许反推相反分支会发生。
- 新电池不工作 ⇒ 不用旧收音机虽然不符合常见备用方案直觉，但规则明确；不得依常识反转结果。
- `review-b-n137-future-condition` 必须选 alarm rings，lamp flashes 的后果是呼叫管理员，不是检查房间。
- 条件后置的主句开头版本保留同一普通 if 逻辑，故纳入其余条件题的有限 variants。没有擅自加入 unless、when、自由同义动词、另一条规则或其他人物。

## 假迁移与实际增加的任务要求

人物、数字和对象替换可以用于复现练习，但不能单独证明学习者将语法迁移到新问题。题目阶段名本身也不是迁移证据。

- 133 frame 六题都基本是 said/told + 当时状态从句。guided、repair、review-a 等主要替换人物、听话者、场所/状态；independent 和 review-a 的干扰记录增加选择来源的负担，但没有改变转述结构。
- 133 time 不全是假替换：完成、进行、一般状态之间切换需要重新判断时态；perspective 的两个主体、所有权和复合肯否定提供了新的实际判断负担。
- 135 possibility 的 Nora / Ria / Nia 正向题共享 `said … might + 动作`；repair-Nia 只换姓名/动作宾语。Uma 换成非人物主语，Ben / Ash 加入否定范围或复合分句，判断要求才有所增加。
- 135 ability 的 Leo / repair-They / Max 共享 `told me … could not + 动作`，复数主语不会改变 could 形式；词汇与人数替换不足以证明新结构迁移。Eve 的双技能肯否定提高了复合核对要求。
- 135 future 的 Zoe / Noel 都要求 would + 动作 + 重新定位所有权 + the next day。周一到周三与周二到周五只是不同日期实例；没有新增时间转换规则。Ada 的必要性、Owen 的 let 关系与 Tara 的两个不同主体才有实质结构差异。
- 137 repair-future 的 ten people 是复数，join 不加 s；只是人数/教师替换仍不能单独证明条件逻辑迁移。can 休息题与已有 can 条件练习基本同构。
- 137 多个否定题共享 `if … do/does not …, … will not …`，其人物对象替换不产生新的条件方向。供电恢复是否开仍待另议明确阻止反推，能检验逻辑范围。
- 137 review-b-future 需要从两条不同触发规则选对 alarm；review-b-can 要区分村庄可达性与港口确定行程，增加了来源选择和模态判别，不能归为纯姓名/对象换皮。

## 可交付状态

JSON 包含全部 54 题的英文主答案、有限变体和逐题 issues，生成时校验了条目数及 id 唯一性。未访问答案或实现来校准独立判断，因此本报告只评价题面支持的答案、歧义和边界；不声称已检测 matcher 的实际接受/拒绝行为。
