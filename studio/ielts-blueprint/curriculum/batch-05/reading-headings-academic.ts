import type {SampleLesson, SampleMaterial, SampleQuestion} from '../../sample-sequence';

/** Original fictional general-interest texts; three paragraphs and five headings are local practice. */
const instruction = 'Choose the heading that best summarises the main idea of each paragraph, A–C, from the list of headings i–v. Use each heading at most once. Two headings will not be used.';

function question(id: string, paragraph: 'A' | 'B' | 'C', answer: 'i' | 'ii' | 'iii' | 'iv' | 'v', why: string): SampleQuestion {
  return {id, prompt: `Paragraph ${paragraph}: choose its main heading.`, options: ['i', 'ii', 'iii', 'iv', 'v'], accepted: [answer], why};
}

function material(value: Omit<SampleMaterial, 'instruction' | 'checklist' | 'seconds'> & {context: string}): SampleMaterial {
  return {
    ...value, instruction, context: `${instruction}\n\n${value.context}`, seconds: 180,
    checklist: [
      '读完整段，用一句话概括贯穿多句的主题和展开方向。',
      '核对全部五个标题：它概括整段，还是只对应一个例子、细节或早期做法？',
      '每段选一个标题编号，三个编号互异；本组有两个未用标题。',
      '保留原答和订正理由，说明误选标题的范围、时间或关系为何不合。',
    ],
  };
}

export const academicHeadingsLesson: SampleLesson = {
  id: 'reading-headings', skill: 'reading', title: 'Academic · 概括段落的中心',
  goal: '从多句的展开判断段落主旨，排除只覆盖细节或关系不符的标题。',
  explanation: [
    '这课练 Academic 主旨标题匹配。读完整段，把例子、解释、转折和结论连起来，找主要话题与展开方向；第一句或相同关键词未必覆盖整段。',
    '本组有 A–C 三段和 i–v 五个标题，每段选择一个标题编号。每个标题最多使用一次，两个标题不用；段落字母与标题编号是不同标记。',
    '相似标题可能只适合某个例子、早期做法或较窄范围。先独立核对每段与全部标题，再检查编号是否重复；不要因某编号已给另一段就把不合适的标题硬塞进来。',
    '示范讲解整体概括和候选比较，引导只留方法。保留第一遍答案、提示情况与订正理由，再用独立、限时和两轮新材料检查能否重新概括主旨。',
  ],
  boundary: '本站原创、虚构的一般兴趣文本，每份三个完整段落，正文约 210–270 英文词，另配五个标题。段数、标题编号与 180 秒是局部练习安排，不是完整 IELTS Academic 阅读全卷或考场单篇时限。内容和难度未经专家标定，原答订正及新材料表现不换算 IELTS Band。',
  model: material({
    id: 'ielts-r06-a-model', title: '示范 · 一座岛上的共同雨情记录',
    context: `List of headings
i. A quick way to identify missing entries
ii. Making varied records comparable
iii. The notebooks kept before the project
iv. Finding a hidden imbalance in the evidence
v. Using a shared record to support further questions

A
Residents of a fictional island had long kept notes about rain in their own notebooks. Some described an entire day, while others wrote only when a storm interrupted work. A local project brought these records together, but simply copying them into one book left those differences unresolved. The organisers agreed on a common observation period and a short description of what each entry should include. The aim was to turn separate impressions into records that could be compared, while retaining the older notebooks as background material.

B
The shared book soon contained many entries, and its size appeared reassuring. A closer check showed that most reports came from the sheltered eastern shore, where the organisers lived. Conditions on the exposed western coast were scarcely represented. Asking the same people for more entries would have enlarged the collection without correcting this imbalance. The next stage therefore invited observers from other parts of the island, making the coverage of places as important as the quantity of reports.

C
Visitors could read the completed records in a small exhibition. A chart made blank periods easy to spot, but staff did not present the pattern as proof of a single cause. They placed questions beside it, asking what another season or an unrecorded location might reveal. Contributors were invited to suggest explanations and say what further evidence would test them. The record became a starting point for inquiry, rather than a final answer that visitors were expected to accept.`,
    questions: [
      question('ielts-r06-a-model-q1', 'A', 'ii', '全段从记录方式不同、合并仍有差异，推进到统一观察期与条目要求；“turn separate impressions into records that could be compared”概括中心，故选 ii。i 是图表找缺项的局部功能；iii 只覆盖旧笔记背景，不能概括统一方法。iv 聚焦 B 段地点覆盖失衡，v 聚焦 C 段展示后的继续探问，都不是本段的主要关系。'),
      question('ielts-r06-a-model-q2', 'B', 'iv', '本段先用大量条目制造可靠的印象，再发现“most reports came from the sheltered eastern shore”，增加同一来源的记录仍不能纠偏，最后扩大地点覆盖；iv 概括这条证据失衡的发现与应对。i 只谈缺项查读，ii 谈统一记录方式而非来源覆盖；iii 是项目之前的笔记背景，v 是公开记录后提出解释问题，均不覆盖本段的发展。'),
      question('ielts-r06-a-model-q3', 'C', 'v', '展览、问题、解释与检验共同指向“a starting point for inquiry, rather than a final answer”，因此 v 概括整段如何使用记录。i 对应“A chart made blank periods easy to spot”，但只是辅助细节；ii 是记录可比性，iii 是旧笔记背景。iv 侧重纠正地点失衡，本段的未记录地点则是引发新问题的一例，整体重心是继续探究。'),
    ],
    hint: '先读完整段落，找贯穿多句的解释链，再逐个比较标题覆盖的范围。',
    model: 'Paragraph A: ii / Paragraph B: iv / Paragraph C: v',
    modelNotes: [
      '第 1 步：读指令并区分标记。A–C 是段落，i–v 是标题编号；每个标题最多一次，本组有两个多余标题。',
      '第 2 步：读完 A 再概括。旧笔记是背景，统一观察期和内容要求才解释怎样使记录可比；选择 ii，不能只因第一句谈笔记就选 iii。',
      '第 3 步：对 B、C 逐项核对全部候选。B 从数量充足转向地点失衡，选 iv；C 从展示推进到提问和检验解释，选 v。C 的图表查缺项只是 i 所概括的局部细节。',
      '第 4 步：回查三个主旨与多句证据，确认 ii、iv、v 各只用一次，i、iii 未用。保留原答；订正时说明误选标题漏掉了哪条贯穿整段的关系。',
    ],
  }),
  guided: material({
    id: 'ielts-r06-a-guided', title: '带着做 · 合唱团如何学习新曲',
    context: `List of headings
i. A change from imitation to active interpretation
ii. Speed as the central measure of success
iii. Keeping a written record of practice
iv. Different routes towards a common musical goal
v. Assessing progress through decisions rather than speed

A
A fictional chamber choir began learning unfamiliar songs by listening to a recorded performance. Singers soon matched its pauses and emphasis, but struggled when the conductor asked why those choices suited the words. The recording had supplied an example without requiring anyone to interpret it. Rehearsals changed: the group compared contrasting performances, discussed the text and tried its own versions. Listening remained useful, but it now opened a discussion rather than providing a pattern everyone was expected to reproduce.

B
Once the group could explain its choices, members still needed different kinds of practice. Some worked on difficult entries alone; others found it easier to begin with a partner. The conductor set a shared aim for the next rehearsal but allowed singers to choose how they prepared for it. A simple record noted what had been tried, not how many minutes each person had spent. Equal preparation therefore meant working towards the same result, rather than following an identical routine.

C
At first, the choir judged progress by how quickly it could sing through a new piece. That measure favoured familiar passages and concealed weaknesses in the group's understanding. The conductor instead introduced an unfamiliar section and asked singers to explain and demonstrate possible phrasing. Their reasons and adjustments showed whether they could use what rehearsals had taught them. Completing the section still mattered, but an informed response to a new musical problem became a more useful sign of progress than speed alone.`,
    questions: [
      question('ielts-r06-a-guided-q1', 'A', 'i', '从照着录音模仿到比较、讨论并尝试自己的版本，末句“opened a discussion rather than providing a pattern everyone was expected to reproduce”概括角色变化，i 最合整段。ii 与 v 都围绕评价速度，不是这里录音使用方式的变化；iii 是 B 段的记录细节。iv 要概括同一目标下不同准备路线，本段则是全组从模仿转向解释。'),
      question('ielts-r06-a-guided-q2', 'B', 'iv', '独练、结伴和共同目标共同展开“working towards the same result, rather than following an identical routine”，iv 覆盖本段允许不同准备路径的中心。i 是前段录音角色的变化；ii 把速度放在评价中心，v 比较评价依据，都不概括准备方式。iii 只对应简单练习记录，范围过窄，漏掉不同需要与共同目标的关系。'),
      question('ielts-r06-a-guided-q3', 'C', 'v', '本段由旧速度指标的弱点转向陌生片段中的解释与调整，明确说“a more useful sign of progress than speed alone”，v 概括评价标准的改变。ii 只保留被调整的初始标准。i 聚焦模仿到解释的练习方式，iii 聚焦练习记录，iv 聚焦准备路径；这些标题均不能覆盖此处用新任务表现评价学习的展开。'),
    ],
    hint: '用自己的话概括段落如何从开头发展到结尾，再检查标题是否只抓住中间的一条信息。',
  }),
  independent: material({
    id: 'ielts-r06-a-independent', title: '自己试 · 重新开放一座旧影院',
    context: `List of headings
i. Planning care beyond the reopening
ii. Recording a manager's memories
iii. Preserving features for the history they reveal
iv. Returning every part to its earliest form
v. Bringing several experiences into the story of a place

A
A fictional town restored a picture house that had been closed for years. Early proposals focused on the oldest surviving fittings, assuming that age alone made an object worth keeping. During research, however, a newer ticket window proved important because it had served the town's first afternoon performances for children. The team preserved that feature while replacing damaged seating with little historical significance. Their choices depended on what features revealed about the building's use, rather than simply on which materials were oldest.

B
The display inside the building also changed during the project. A former manager's account initially supplied its central story, but interviews with cleaners, projectionists and audience members revealed other experiences of the same place. Some memories disagreed, and the team presented those differences instead of smoothing them into one official version. The display became an account of how various people had used the picture house, rather than an institution speaking through one familiar voice.

C
Opening the doors again was a visible success, yet it did not end the work. The restored roof and equipment required regular checks, and the people running events needed a way to report small faults before they became larger ones. A care plan assigned responsibilities and set aside time between activities for inspection. Restoration was therefore treated as an ongoing relationship with the building, not a single achievement completed when the first visitors returned.`,
    questions: [
      question('ielts-r06-a-independent-q1', 'A', 'iii', '从只看年代到保留有重要使用史的新票窗并更换意义较小的座椅，末句“what features revealed about the building\'s use”说明保存选择的标准，iii 覆盖整段。iv 概括的是每部分回到最早形式，不能概括实际取舍；i 是重新开放后的照护。ii 聚焦经理回忆，v 聚焦多方经历，均不同于本段对物理设施历史价值的选择。'),
      question('ielts-r06-a-independent-q2', 'B', 'v', '经理叙述被更多工作人员与观众经历补充，分歧被保留，结尾“rather than an institution speaking through one familiar voice”归结为多种经历共同讲述地点，故选 v。ii 只覆盖被扩展的初始单一来源；iii 是设施保存标准，iv 是物理形态复原，范围不同。i 聚焦开放后的持续维护，也不能概括展示叙事由单一转为多方的过程。'),
      question('ielts-r06-a-independent-q3', 'C', 'i', '从开门不是终点，到检查、报修、分工，结尾“an ongoing relationship with the building”与“not a single achievement completed”强调持续照护，i 最合。iii 与 iv 聚焦修复时的设施选择或原貌，不覆盖开放后的管理；ii 与 v 聚焦过去的经历叙事。这里的人员分工服务未来维护，不是收集不同人的历史记忆。'),
    ],
    hint: '比较每个标题的对象、时间范围和核心关系；只有覆盖多个展开句的标题才保留为主旨候选。',
  }),
  timed: material({
    id: 'ielts-r06-a-timed', title: '训练用限时 · 用影像研究河流',
    context: `List of headings
i. The appeal of dramatic clips
ii. Linking visible events with evidence beyond the frame
iii. How selection can make rare events seem ordinary
iv. Revealing a process rather than comparing isolated views
v. Moving the camera to a higher position

A
A fictional river study began with photographs taken from the same bank. These views showed where foam gathered, but a comparison between them could not reveal how it reached those places. The team then filmed a stretch of water for an uninterrupted period. Patterns that had looked like separate patches became stages in a visible sequence of movement. The change in medium shifted the investigation from identifying locations to understanding a process, while the photographs remained useful records of particular moments.

B
Preparing a short version of the film created a different problem. Fast swirls and sudden splashes attracted attention, so an early edit gave them much more space than their share of the original recording. Quiet intervals almost disappeared. A viewer could therefore mistake an unusual event for the river's normal behaviour. The team restored some uneventful sections and labelled the time covered by each extract. Selecting material was necessary for display, but its effect on the apparent balance of events had to remain visible.

C
Moving the camera to a higher position gave researchers a wider view of the river. Yet they also noted rainfall upstream and changes in water arriving from a side channel, matching these observations to the times shown in the film. A visible change could then be considered alongside conditions that the lens could not capture. Instead of expecting a wider image to explain itself, the team used several records together to investigate why the movement varied.`,
    questions: [
      question('ielts-r06-a-timed-q1', 'A', 'iv', '照片只显地点，连续影像显运动阶段，末句“from identifying locations to understanding a process”概括记录方式带来的认识变化，iv 覆盖整段。i 与 iii 聚焦后续剪辑中片段的吸引力或频率失真；ii 聚焦结合画外证据解释变化。v 只是拍摄位置调整，不能概括静态记录与连续过程之间的比较。'),
      question('ielts-r06-a-timed-q2', 'B', 'iii', '剪辑放大显眼片段、删去平静时段，使“A viewer could therefore mistake an unusual event for the river\'s normal behaviour”，再补回普通片段与时间标记；iii 概括选择如何造成频率印象失真及修正。i 只说戏剧片段的吸引力，是问题原因之一；ii 是整合其他证据，iv 是从孤立视图认识过程，v 是抬高相机，都不覆盖这条剪辑代表性的主线。'),
      question('ielts-r06-a-timed-q3', 'C', 'ii', '抬高机位只是开头，随后把雨情与支流变化同影像时间对应，结尾“used several records together to investigate why the movement varied”点明多源证据共同解释，ii 概括整段。v 只抓住首句的辅助动作；i 与 iii 聚焦片段选择的吸引力和失真。iv 聚焦影像显示连续过程，此段则在已经可见的过程之外加入条件记录，以解释变化。'),
    ],
    hint: '读完再归纳；特别核对后面的转折和解释是否改变了首句看起来要谈的重点。',
  }),
  reviews: [
    material({
      id: 'ielts-r06-a-review-a', title: '隔天新题 · 翻译一个幽默场景',
      context: `List of headings
i. Matching every word as closely as possible
ii. Identifying what makes a joke work
iii. Making sense of contrasting audience reactions
iv. Providing different kinds of support for different readers
v. A history of the joke's original setting

A
A fictional translator began with a short comic scene in which a guest answers a polite question too literally. Her first draft followed the original words closely, yet the exchange no longer seemed funny. Studying the scene showed that the humour depended on the contrast between expected politeness and the guest's unexpected precision. She changed the wording to preserve that contrast in the new language. The task was therefore to recover the mechanism of the joke, not to reproduce each expression in isolation.

B
Readers did not respond to the revised scene in the same way. Some laughed immediately; others understood it only after discussion. The translator first suspected that unfamiliar vocabulary explained the difference. Interviews showed that several hesitant readers knew all the words but expected a different response to the polite question. Their reactions reflected social expectations as well as language knowledge. Feedback could not be interpreted as a simple vote on whether the translation had succeeded; the reasons behind the reactions mattered.

C
The published scene appeared in two formats. A classroom edition included a note on the setting and questions that encouraged discussion before readers tried the dialogue aloud. A performance edition kept explanatory material apart from the spoken lines so that an audience could follow the exchange without interruptions. Neither format was treated as the universally better translation. They offered different levels and kinds of assistance because reading for discussion and listening to a performance placed different demands on the same scene.`,
      questions: [
        question('ielts-r06-a-review-a-q1', 'A', 'ii', '从逐字译文失去趣味，转向礼貌预期与意外精确回答的反差，末句“recover the mechanism of the joke”说明翻译要保留的中心，ii 概括整段。i 只保留已失败的初稿方法；iii 聚焦不同读者反应的解释，iv 聚焦版本援助差别。v 是背景历史，不能概括此处辨认幽默机制并调整措辞的关系。'),
        question('ielts-r06-a-review-a-q2', 'B', 'iii', '不同笑声反应先被归因于词汇，访谈再揭示“social expectations as well as language knowledge”，最后要求追问反应原因；iii 覆盖这种反馈解释。i 是逐词翻译做法，ii 是场景产生幽默的机制，均不同于本段解释同一修订稿为何带来不同反应。iv 是提供帮助的版本设计，v 是原场景背景历史，不覆盖读者差异的因果分析。'),
        question('ielts-r06-a-review-a-q3', 'C', 'iv', '课堂版让读者停下讨论，演出版把解释与台词分开，理由是两种使用方式“placed different demands on the same scene”；iv 概括不同需求对应不同帮助。v 只抓课堂版的 setting note，并把一条背景支持扩大为历史主题；i 与 ii 聚焦词语对应或幽默机制，iii 聚焦反馈原因，均不能概括这里两种格式的目的与取舍。'),
      ],
      hint: '先概括多个例子共同支持的意思，再检查相似标题是否只覆盖其中一例或一个早期阶段。',
    }),
    material({
      id: 'ielts-r06-a-review-b', title: '下一轮新题 · 海岸沙丘的修复目标',
      context: `List of headings
i. Deciding success by the number of surviving plants
ii. Stating achievable aims without guaranteeing a fixed coast
iii. Rebuilding a fence along an earlier boundary
iv. Working with movement instead of restoring one outline
v. Revising a small experiment before a wider commitment

A
A fictional coastal village once measured the condition of its dunes by comparing their outline with an old photograph. When a ridge changed shape, residents asked for a fence to be rebuilt along its former edge. Observations later showed that sand moved through the area even when the beach looked undisturbed. The restoration team began protecting space for that movement instead of trying to recreate a fixed outline. An older shape could document the past without serving as the permanent target for a living landscape.

B
The team tested a different planting pattern on one short section. Workers counted surviving plants, but also watched where sand accumulated and whether nearby paths remained usable. Some results were encouraging, while others changed after a windy period. Rather than extend the same pattern immediately along the entire beach, they adjusted the trial and continued observing it. A limited experiment offered a way to learn about interactions and revise a method before making a much wider commitment.

C
Public meetings initially focused on whether the project would prevent every future loss of sand. The team could not offer that assurance, and a failed promise would have made later changes look like excuses. Instead, they described what the work was intended to improve and how its effects would be checked. Residents could see which paths and areas were priorities, as well as where uncertainty remained. The project was presented as a practical reduction of particular problems, rather than a guarantee that the coast would stop changing.`,
      questions: [
        question('ielts-r06-a-review-b-q1', 'A', 'iv', '旧照与旧篱笆边界的固定目标，被对沙运动的观察改变；“protecting space for that movement instead of trying to recreate a fixed outline”概括整段方向，故选 iv。iii 只抓居民早先的请求，漏掉目标的修正；i 聚焦植株计数，v 聚焦小规模试验后扩展。ii 聚焦向公众说明可实现的承诺，不是本段修复策略由固定形状转为保留运动空间。'),
        question('ielts-r06-a-review-b-q2', 'B', 'v', '多项观察与风后不同结果，引向“they adjusted the trial and continued observing it”，再说明宽范围投入前先学习、修订方法；v 概括整段试验逻辑。i 仅抓计数一项，还把它扩大为成功标准；iii 是旧边界请求，iv 是动态地形的修复目标。ii 是公开说明目标与不确定性，这些标题都不能覆盖此段小试、反馈、修订再扩大承诺的展开。'),
        question('ielts-r06-a-review-b-q3', 'C', 'ii', '段落先解释不能承诺完全阻止沙流失，再说明改进目标、检查效果和剩余不确定性；“a practical reduction of particular problems, rather than a guarantee”概括现实目标的沟通，ii 最合。i 是局部植物测量，iii 是旧篱笆请求。iv 聚焦保护运动空间的策略，v 聚焦扩大前的试验修订；本段重心是如何让公众理解能改善什么以及承诺的边界。'),
      ],
      hint: '核对标题概括的是整段的展开方向，还是一个动作；先完成逐段比较，再检查本组分配规则。',
    }),
  ],
};
