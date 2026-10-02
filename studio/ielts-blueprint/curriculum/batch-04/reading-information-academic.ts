import type {SampleLesson, SampleMaterial, SampleQuestion} from '../../sample-sequence';

/** Original fictional general-interest texts; the four-paragraph format is local practice. */
const instruction = 'Which paragraph contains each piece of information? Choose one letter, A–D, for each statement. You may use any letter more than once. You do not need to use every letter.';

function question(id: string, prompt: string, answer: 'A' | 'B' | 'C' | 'D', why: string): SampleQuestion {
  return {id, prompt, options: ['A', 'B', 'C', 'D'], accepted: [answer], why};
}

function material(value: Omit<SampleMaterial, 'instruction' | 'checklist' | 'seconds'> & {context: string}): SampleMaterial {
  return {
    ...value,
    instruction,
    context: `${instruction}\n\n${value.context}`,
    seconds: 180,
    checklist: [
      '给每项信息找出同一段中支持完整对象与关系的原句。',
      '相同词或相近段落主题不能代替完整信息核验。',
      '每题选一个字母；本组允许复用，不必用完全部段落，也不按题号猜段落顺序。',
    ],
  };
}

export const academicInformationLesson: SampleLesson = {
  id: 'reading-information-matching', skill: 'reading',
  title: 'Academic · 找到包含具体信息的段落',
  goal: '核对信息描述的完整关系，定位支持它的段落，而不是替整段选择标题。',
  explanation: [
    '本课练 Academic 段落信息匹配：四段以 A–D 标记，每项信息选择包含它的一个段落。题干可能要求具体例子、原因、比较或解释，不能只看整段谈什么。',
    '先把信息拆成对象与关系，再扫描候选段并精读。多个段落可能出现相同词，但原因、对象、结果或条件不同；必须核对描述中的完整意思。',
    '本组指令明示可以重复字母，也不必使用每段。同段的两处不同细节可以分别支持两题；题号不作为原文顺序依据，每项都重新核对。',
    '示范显示定位、比较与排除的步骤，引导只提示方法。保留第一遍答案及订正理由，把用提示后的作答与独立、限时和两轮新材料的表现分开看。',
  ],
  boundary: '本站原创、虚构的一般兴趣短文，每份四段正文约 190–245 英文词，配三个信息描述。A–D 与 180 秒均为本课局部安排；不是完整 IELTS Academic 阅读全卷，也不复现官方电脑端交互。篇幅与难度未经专家标定，订正或新材料表现不换算 IELTS Band。',
  model: material({
    id: 'ielts-r05-a-model', title: '示范 · 重建一支旧木笛',
    context: `A
A museum in a fictional coastal town holds a wooden flute recovered from a family attic. Its polished surface led early visitors to imagine an expensive instrument played at formal gatherings. The collection includes a painted image of such a gathering, although no evidence connects the flute to the people shown.

B
The first display label dated the flute from a receipt found in its case. Later study showed that the receipt described the case itself, not the instrument inside. Staff removed the date rather than assign it to the flute. Its polished surface could not settle the dating problem.

C
To investigate its sound, makers produced two replicas with mouthpieces of different widths. They used modern wood, since the original could not safely be played. Both replicas copied the same finger holes. Musicians examined their polished surfaces before the trial, but were not told which version the researchers expected to work better.

D
Musicians found the wider opening less tiring when holding a note. However, the expected difference in pitch did not appear: both versions produced the same pitch under the trial conditions. The museum kept the replicas for demonstrations, noting that modern materials and limited testing prevented confident claims about the original sound.`,
    questions: [
      question('ielts-r05-a-model-q1', 'a finding that contradicted a prediction about the sound produced', 'D', 'D 段“the expected difference in pitch did not appear”及“both versions produced the same pitch”明确给出预测与实际结果不一致；sound produced 的具体比较是音高。C 段也提到 sound、trial 和研究者的预期，但只交代制作与试验准备，没有报告这个反预期结果。'),
      question('ielts-r05-a-model-q2', "an explanation of why a date was removed from an object's description", 'B', 'B 段“the receipt described the case itself, not the instrument inside”说明日期凭据对应盒子而非笛子，随后“Staff removed the date rather than assign it to the flute.”给出处理结果。D 段也有解释声音不确定性的展示说明，但没有移除日期及其原因。'),
      question('ielts-r05-a-model-q3', 'a comparison of the physical effort required by two versions of an object', 'D', 'D 段“Musicians found the wider opening less tiring when holding a note.”以 less tiring 比较两种开口版本持续吹奏时的体力负担。C 段确实比较 different widths 和相同指孔，但那是制作差别，不是演奏所需的身体努力；不能只因出现 two replicas 就选择 C。'),
    ],
    hint: '把每项信息拆成对象和关系；找到相同词后，继续核对限定条件和整句话。',
    model: '1. D / 2. B / 3. D',
    modelNotes: [
      '先读共同指令：每项一个段落字母，允许复用，也不必用完字母。随后区分题干要找的是结果、原因还是具体比较，不先为段落想标题。',
      '第 1 项先扫描 sound 与 trial，再核对完整关系。C 只有试验准备，D 的 expected ... did not appear 才说明预测没有实现，因此选 D。',
      '第 2 项核对 date、description 和 why：B 的凭据对应盒子而非笛子，且明说移除日期；选 B，而不是把任何展示说明都当作原因。',
      '第 3 项找的是 physical effort 的比较。D 的 less tiring 对应这个关系，C 的制作尺寸比较不够。D 可再次使用，A 和 C 在这组三题中不必选；回看原答时记录误选来自哪个不完整关系。',
    ],
  }),
  guided: material({
    id: 'ielts-r05-a-guided', title: '带着做 · 观看一幅长壁画',
    context: `A
At a fictional gallery, two groups viewed the same mural. One walked along it; the other studied a photograph from a fixed seat. Walkers described changes in the scene as a journey, while seated viewers discussed the balanced arrangement of colours. Neither group was asked to choose the better experience.

B
The gallery had once lit the mural evenly from above. During renovation, staff changed the position of the lamps, creating brighter and darker areas. An old photograph documented the earlier display. It did not reproduce the lighting used during the comparison between the two groups, despite showing the same painted wall.

C
A survey initially seemed to favour the brighter areas. Yet many comments praised the explanations beside them rather than the painted sections themselves. Since the darker areas lacked explanations, the survey could not separate responses to lighting from responses to written help. The team withheld a claim that stronger lighting improved appreciation.

D
In the next display, visitors could read an explanation before choosing where to stand. Cards offered several routes through the mural without naming one as correct. Someone seeking an overall view could step back; another visitor could follow a sequence closely. Staff planned to observe these choices rather than require everyone to walk.`,
    questions: [
      question('ielts-r05-a-guided-q1', "a reason why visitors' favourable comments could not prove that stronger lighting helped them", 'C', 'C 段“many comments praised the explanations beside them”及“the survey could not separate responses to lighting from responses to written help”说明反馈混合了两种影响，不能据此证明更强照明的效果。B 段也提到灯光变化和亮暗区域，但只记录布展历史，没有解释评论为何不能支持这项结论。'),
      question('ielts-r05-a-guided-q2', 'different descriptions of the same artwork after two different ways of viewing it', 'A', 'A 段“Walkers described changes in the scene as a journey”与“seated viewers discussed the balanced arrangement of colours”给出两组观看方式产生的不同描述。D 段也提供不同观看选择，但谈的是计划观察这些选择，没有报告两组已经怎样描述作品。'),
      question('ielts-r05-a-guided-q3', 'an arrangement that allows viewers to choose a position after receiving information', 'D', 'D 段“visitors could read an explanation before choosing where to stand”同时包含先获取说明、再自行选站位的顺序与权限。B 段也有 position，却指灯具位置；C 段的说明位置影响调查解读，没有交代观众读后自行选站位的安排。'),
    ],
    hint: '先判断信息描述是在问原因、过程、比较还是具体事例，再回各段核对完整关系。',
  }),
  independent: material({
    id: 'ielts-r05-a-independent', title: '自己试 · 重新编辑一本动物图鉴',
    context: `A
A fictional natural history society is revising an illustrated guide made by an amateur painter. Some members want a modern species list; others value observations written beside the pictures. The editor treats the guide as a record of what its maker noticed, rather than a complete account of wildlife in the region.

B
Where a bird was named incorrectly, the editor retains the original name and adds the current identification. A copied date is instead corrected when the painter's diary proves the transcription wrong. The notes distinguish these actions: one preserves the maker's interpretation, while the other removes an error introduced by someone copying the manuscript.

C
Several pages contain unfinished drawings with blank areas around them. A designer proposed filling those spaces with photographs to make the book look complete. The editor declined, since readers might assume that the photographs formed part of the painter's work. A change in visual balance was considered preferable to that confusion.

D
The society prepared translations for readers unfamiliar with the guide's language. A local name for a marsh bird was followed by a description of where it fed, rather than replaced by a familiar but inaccurate bird name. This made the reference more accessible while keeping the uncertainty about its exact identity visible.`,
    questions: [
      question('ielts-r05-a-independent-q1', "a distinction between keeping the maker's mistaken interpretation and correcting a later copying error", 'B', 'B 段“one preserves the maker\'s interpretation, while the other removes an error introduced by someone copying the manuscript”明确区分两种错误来源和处理方式。C 段也关心哪些内容属于画家作品，但讨论新增照片可能混淆来源，没有比较保留原作者误认与订正抄写错误。'),
      question('ielts-r05-a-independent-q2', 'a way to make a reference easier to understand without presenting its identity as more certain', 'D', 'D 段“a description of where it fed”补充读者可理解的说明，且“keeping the uncertainty about its exact identity visible”保留辨认的不确定性。B 段也有 current identification，但针对已认定的命名错误添加现行辨认结果，不是这里身份仍不确定时提高可理解性的做法。'),
      question('ielts-r05-a-independent-q3', 'an example of a separate document being used to justify changing a copied detail', 'B', 'B 段“A copied date is instead corrected when the painter\'s diary proves the transcription wrong.”用日记这一独立文件证明抄写有误，从而订正日期。A 段说明图鉴的定位，C 段提出照片又被拒绝；都没有文件证据支持改动已抄写的细节。这项具体依据与第 1 项处理区别可位于同段。'),
    ],
    hint: '圈出限定词和所指对象，对候选段逐句核对；同一段仍可继续检查其他信息项。',
  }),
  timed: material({
    id: 'ielts-r05-a-timed', title: '训练用限时 · 展示洞穴中的痕迹',
    context: `A
A display about a fictional cave shows impressions left by animals in soft clay. Moving the original ground would destroy the marks' arrangement, so the exhibition uses casts made on site. Unlike photographs taken from above, these models let visitors examine depth by changing their viewing angle. The originals remain in the cave.

B
The casts preserve shape, but shape does not always identify an animal. A mark may have changed as the clay dried, and several animals can leave similar impressions. Researchers therefore compare groups of marks with the paths they form. They resist giving every isolated impression a confident label.

C
During a trial, visitors were given either a photograph or a cast of the same group of impressions. Those handling the cast described the direction of travel more accurately. They were not better at naming the animal, however. The result separated understanding the marks' arrangement from identifying their maker, two tasks initially treated together.

D
The organisers considered sending a travelling set of casts to schools. Packing strong enough to protect the models would have cost more than making them, leaving little money for teaching visits. They postponed the travelling set and funded visits to the exhibition instead. Photographs were still offered to schools, with limitations stated in accompanying notes.`,
    questions: [
      question('ielts-r05-a-timed-q1', 'a proposal delayed because protecting objects would leave too little funding for another activity', 'D', 'D 段“Packing strong enough to protect the models would have cost more than making them, leaving little money for teaching visits.”连接包装保护成本与教学来访经费，随后“They postponed the travelling set”给出延迟的提案。A 段也解释保护原物的需要，但原因是痕迹排列会损毁，没有预算与另一活动的关系。'),
      question('ielts-r05-a-timed-q2', 'a reason for leaving original evidence in place while exhibiting substitutes', 'A', 'A 段“Moving the original ground would destroy the marks\' arrangement”说明原物不能搬动的原因，“the exhibition uses casts made on site”与“The originals remain in the cave.”给出复制品展出、原物留在现场的安排。D 段的旅行复制品计划虽也涉及展示替代物，却不解释原始痕迹为何留在洞穴。'),
      question('ielts-r05-a-timed-q3', 'a trial in which one aid improved one kind of performance but not another', 'C', 'C 段“Those handling the cast described the direction of travel more accurately.”及“They were not better at naming the animal, however.”比较同一次试验的两项表现：方向解读改善，动物命名未改善。B 段谈辨认的困难，没有两组使用不同辅助物后的实际表现比较。'),
    ],
    hint: '先扫描可能的段落，再精读关系和条件；不要按题号推断段落顺序。',
  }),
  reviews: [
    material({
      id: 'ielts-r05-a-review-a', title: '隔天新题 · 保存一座旧桥的口述记忆',
      context: `A
An archive collected memories of a footbridge in a fictional valley. Residents often credited its construction to a celebrated mayor. A dated engineering drawing showed that the bridge existed before his term began. The archive kept the familiar story as evidence of local memory, separate from the documented construction history.

B
Interviewers invited people to speak freely, then used a map to clarify places mentioned. They did not show the engineering drawing, because it might encourage speakers to adjust their memories to match an official document. The map helped locate an event without being used to decide whether an account was accurate.

C
Before publication, each contributor could remove a passage that revealed a private matter. When accounts disagreed about a public event, the editor displayed the different versions together rather than selecting one as the archive's voice. These were separate decisions: permission governed what could be shared, while comparison allowed readers to see differences that remained unresolved.

D
The collection has gaps: people who had left the valley were difficult to contact, and their experiences may differ from those of long term residents. The archive hopes to record them later. Meanwhile, the display identifies whose memories are present and avoids presenting the collection as the valley's complete history.`,
      questions: [
        question('ielts-r05-a-review-a-q1', 'a right allowing contributors to exclude private information before publication', 'C', 'C 段“each contributor could remove a passage that revealed a private matter”明确赋予提供者删去隐私内容的权利，并限定在出版前。B 段也有 did not show，但那是采访者暂不展示工程图，目的与权利主体不同；D 段联系困难也不是提供者决定撤下私人信息。'),
        question('ielts-r05-a-review-a-q2', "a decision to present conflicting recollections together rather than adopt one as the archive's view", 'C', 'C 段“the editor displayed the different versions together rather than selecting one as the archive\'s voice”完整对应并列展示不同回忆、不选一种作为档案馆立场。A 段区分流传故事与有文献依据的建造史，后者不是另一份冲突回忆；不能把泛泛的不同来源当成这项处理决定。'),
        question('ielts-r05-a-review-a-q3', 'documentary evidence challenging a popular claim about who was responsible for building a structure', 'A', 'A 段先说居民把建桥归功于市长，再以“A dated engineering drawing showed that the bridge existed before his term began.”证明桥早于他的任期，挑战该归功。B 段也提到 engineering drawing，却只解释不向受访者展示它的原因，没有给出这项时间证据及其对建造归属的意义。'),
      ],
      hint: '对照题干改写的完整含义，核对时间、对象和处理方式；不要仅因同词出现就确定字母。',
    }),
    material({
      id: 'ielts-r05-a-review-b', title: '下一轮新题 · 采石场复育与旧景观',
      context: `A
A fictional quarry supplied stone for nearby houses before work ended and water filled its lower hollow. Early proposals described the site as empty land awaiting a new use. Yet old loading platforms and a path still showed how stone had left the quarry. Local historians asked that these traces remain visible.

B
Restoration did not involve draining the hollow. Workers opened a channel to a shallow basin, allowing rising water to spread over a wider area. During heavy rain, water now reaches the basin before approaching the path. This protects that route while preserving the flooded hollow as part of the landscape.

C
Residents reported more birds after the channel opened. Researchers welcomed the reports but noted that observers were also spending longer at the site. More sightings might reflect more watching rather than more birds. Repeated visits of equal length were proposed to distinguish those possibilities, before the change was presented as evidence of recovery.

D
A proposal to plant the whole basin with reeds was revised after residents noted that it would conceal a familiar view of the old platforms. The final plan leaves an open strip beside the viewing area. This reduces planted space, but balances new vegetation with access to a visible part of the site's industrial past.`,
      questions: [
        question('ielts-r05-a-review-b-q1', 'a physical alteration allowing rising water to occupy more space before it reaches a path', 'B', 'B 段“allowing rising water to spread over a wider area”与“water now reaches the basin before approaching the path”说明开渠后水先扩散入盆地再靠近小路的机制。C 段也说 channel opened，但仅讨论鸟类观察次数的解释，没有这项水流空间与先后关系。'),
        question('ielts-r05-a-review-b-q2', 'a planting proposal changed to preserve a view of evidence of earlier land use', 'D', 'D 段说全面种芦苇“would conceal a familiar view of the old platforms”，因此修改方案，且“The final plan leaves an open strip beside the viewing area.”保留观察旧设施的视线。A 段也要求历史痕迹保持可见，但没有种植方案被修改及留空条带的具体决定。'),
        question('ielts-r05-a-review-b-q3', 'two types of surviving feature showing how material had been transported out of a disused site', 'A', 'A 段“old loading platforms and a path still showed how stone had left the quarry”明确用两种遗留设施，即装卸平台和道路，说明石料如何运出。D 段也提到 old platforms 与 industrial past，却只说明平台的景观视线，没有两种设施与材料外运的关系；B 段的小路则是防止涨水接近的对象。'),
      ],
      hint: '每项都找可引用的句子，再比较其他段是否只是提到相关主题；检查允许的段落复用。',
    }),
  ],
};
