# NCE1 115 / 117 / 119 刷新题干后的独立盲审

本轮唯一读取来源为刷新后的`blind-prompts-115-119.json`；没有读取原始/canonical答案、其他docs、module、key、matcher或tests。逐题重新以当前scope/context/prompt推导54条答案，写入新文件`blind-answers-115-119-final.json`。没有改写原始或canonical文件。

## 结论与原问题状态

54题均可独立作答，每课18题，id完整且唯一，无时间线冲突或无法选择正确角色/活动的题。

1. `diagnostic-n115-person-thing`已解决原来的工作人员/有人范围不一致。当前情境直接问是否有人，`Is there anyone in the reception room?`完整满足情境和题干，不需要询问staff。anybody、someone、somebody是当前115 scope明确容许的有限变体。
2. `review-b-n115-everyone-agreement`已解决原来的否定范围及答案边界问题。当前题干明确要求部分否定把not放句首，并排除可能歧义的后置not。两人等车、一人不等，答案为`Not everybody is waiting for the bus.`，同义变体仅列scope允许的`Not everyone is waiting for the bus.`。`Everybody is not...`或`Everybody isn’t...`不属于当前指定输出，即使在另一个自然语境可能具有部分否定读法，也不加入本题variants。`Nobody is waiting...`还与事实冲突。
3. `repair-n117-event-background`题干未变，仍需核对主动/被动的合理变体边界。中文为门被打开，`the door was opened`忠实自然；题干给open且未规定语态，`the door opened`也自然。JSON主要答案采用被动，并列有限主动变体和从句位置变化。这不是无法作答的矛盾，而是整合者应检查的表达接受点；本轮没有读取系统，不能断言实际匹配是否已解决。

JSON中只有第3项对应的1题issues非空；前两项修正后的题目issues为空，解决情况记录在本报告。

## 答案与近错边界

### 115：对象、范围与单数一致

人用anyone/anybody或someone/somebody；物用anything或something。未知存在问句的some变体来自本课明示scope，不扩大为任意人/物词都能互换。抽屉和托盘为空可用nothing或not anything，房间无人可用no one/nobody或not anyone/not anybody；这些有限变体保留目标对象和地点，没有双重否定。

Room A有棋盘和椅子，`There is nothing in room A`错误；桌椅存在不能推成有人。门边与hall A的发现是身份未知的人，不猜姓名或职业。托盘内容用on the tray，抽屉内容用in the drawer。

Everyone/Everybody按scope同义互换并配单数。此刻活动用is practising/drawing/reading；愿望用wants。英美practising/practicing均列为有限变体。最后一题的部分否定必须句首Not，且只能概括指定三人组，不能借用另一组的全体状态。

### 117：持续背景、短事件、并行角色

参考时刻的单一活动用was/were + -ing，选覆盖参考点且属于指定人物的过程，不选尚未开始、早已结束或其他队的活动。when句中短事件用一般过去时，持续背景用过去进行时；从句位置或主从句选择可变，但人物、事件和过程的时间角色不能颠倒。while连接两项重叠的过去进行过程，不能改成先后完成，也不能互换活动的执行者。

`label the boxes`的正常进行形式有BrE labelling和AmE labeling。虽然117 scope没有单独列英美拼写，二者仍是同一指定动词的正常形式，没有换词、换任务或增加信息，因此列为范围内有限变体。

门被打开一题保留被动和不及物主动；试帽子仍在进行，搬箱子已结束，不能将carry boxes当任意可选正确词。所有when/while变体只调整句法位置，不附加时间、原因或结果。

### 119：过去参考点、完成状态与经验

题干明确要求had + 过去分词。already题选择参考点之前完成的动作，不选择随后才寄出、关窗、入柜或打印地址等动作。after/before题较早完成动作保留had，后续动作保留过去式；允许从句前置，不能让词序变化反转实际先后。Nora的第二次指称可自然用she，也保留重复Nora的有限指定表达。

未完成的桥/模型用had not finished，未印好的票用had not printed；not不等于never。首次使用相机/首次冲洗照片之前的经验用had never ... before，曾拍照不推出曾冲洗。第二块牌在检查前已涂完，答案肯定且题干明确不加already，不能机械补already。

普通英语有时用两个一般过去时加after/before也能表达先后，但这不满足本课明确练习had的限定任务；不加入variants，也不声称该表达在普通英语中错误。

## 迁移质量

仍不是单纯模板换数字。三课都改变地点、人称、动作和宾语，独立练习/复习加上别房间、别组、错人物、已结束/尚未开始的任务和乱序记录。115最后一题检验部分否定；119从完成状态扩展到首次经历，具有真实的语义选择。

结构重复仍较强：115主要直接映射到Is there/There is/Everyone，117大多靠明确起止时段选择指定when/while，119每题提前点名had及after/before。新题干的句首not限制解决了公平接受边界，同时也提供了更多形式提示；它不新增独立选择否定句式的证据。本组能检验限定句型下的证据选择与角色判断，尚不能单独证明自由交流中的时态/连接词迁移。

后续若要测自由迁移，可另设没有时态/连接词提示的复述任务，或用照片与未完工序提供时间证据；这属于后续教学建议，不扩大当前题的答案范围。

## 统计与剩余核对

54条答案，每课18条；86个有限variants；54个唯一id；1题issues非空；0缺题；0无法作答。检查是在内存中对当前唯一源的id顺序、数量、字段及变体唯一性进行，没有读取任何原始或canonical输出。

两项115题干问题已经由当前文字解决。剩余表达接受点为117门事件的主动/被动、正常英美拼写、when/while与after/before的从句位置，以及119 Nora的同指代词；整合者需对照实际系统确认，本盲审未读取匹配器且没有系统测试结果可报告。
