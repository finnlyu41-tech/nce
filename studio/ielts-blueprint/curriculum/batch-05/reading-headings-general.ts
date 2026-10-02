import type {SampleLesson, SampleMaterial} from '../../sample-sequence';

/** Original fictional General Training texts for matching whole-paragraph headings. */
const headingInstruction = 'Choose the heading that best summarises the main idea of each paragraph, A–C, from the list of headings i–v. Write ONE Roman numeral per paragraph. There are more headings than paragraphs. Use each heading at most once. Two headings will not be used.';
function material(value: Omit<SampleMaterial, 'instruction' | 'checklist' | 'seconds'>): SampleMaterial {
  return {
    ...value,
    instruction: headingInstruction,
    seconds: 180,
    checklist: [
      '每段写一个 i–v 标题编号，同一标题不重复使用。',
      '所选标题覆盖整段主要内容，不止某个例子、物件或相同单词。',
      '先独立选择，再用原文核对标题的对象、范围与关系，并解释近似标题为何不能概括整段。',
    ],
  };
}

export const generalHeadingsLesson: SampleLesson = {
  id: 'reading-headings', skill: 'reading',
  title: 'General Training · 为整段选择标题',
  goal: '概括日常、工作和一般兴趣短文中每段的主旨，区分整段中心与支持细节。',
  explanation: [
    '标题匹配问的是每段的主要意思。先读完整段落，用自己的几个词概括它在解释什么、为什么写这些句子；某条细节准确，仍不一定能代表整段。',
    '首尾句可提供线索，但也要读中间的解释、例子和转折，核对它们共同支持哪个中心。不要把整篇的共同主题当作每段的标题，也不要只凭一个熟悉单词选择。',
    '把概括与全部五个标题比较，核对对象、范围、时间和因果关系。一个标题可能只覆盖局部例子，另一个可能把尚未说明的目标或结果加进去；都应回到原文核验。',
    'A–C 标记段落，i–v 标记标题。本组每段写一个罗马编号，标题多于段落，标题不得重复使用，并有两个不用。先凭整段依据选，再复核三项，不把具体信息题的段落复用规则带到这里。',
    '示范依次演示读指令、概括、比较和复核；后续提示保留方法。先保存原答，再记录订正依据；两轮新情景重新练习主旨判断，提示后的答案与独立表现分开查看。',
  ],
  boundary: '本站原创虚构的 General Training 日常、工作及一般兴趣短文，正文约 210–270 英文词。三段、五标题与 180 秒是本组局部教学设计和建议时间，不代表正式阅读全卷或正式长文难度；篇幅与难度未经专家标定。订正和新材料表现不换算 IELTS Band，仍需专家与学习者核验。',
  model: material({
    id: 'ielts-r06-gt-model', title: "示范 · 街区照明试行计划",
    context: `Choose the heading that best summarises the main idea of each paragraph, A–C, from the list of headings i–v. Write ONE Roman numeral per paragraph. There are more headings than paragraphs. Use each heading at most once. Two headings will not be used.

List of headings
i. Residents’ role in assessing the trial
ii. A programme to replace the neighbourhood’s lamps
iii. Reasons for reviewing the present lighting pattern
iv. Reducing electricity bills as the main test of success
v. A comparison of alternative lighting arrangements

A
The Fernwood lighting team has received different requests about the same streets. Some residents say bright lamps shine into bedrooms, while people returning from evening shifts want clearer views of the pavement. The present settings were chosen before several new homes opened, and they no longer reflect how all the streets are used. The team therefore wants to reconsider the pattern rather than assume that brighter or darker lighting will suit everyone. Existing lamps will be used for the trial.

B
For six weeks, two similar streets will follow different lighting schedules. One will keep its usual brightness, while the other will become slightly dimmer after midnight. The schedules will then be exchanged, allowing each street to experience both arrangements. Staff will measure electricity use and check whether signs and pavement edges remain easy to see. They will also record maintenance needs. Considering these results together should help the team distinguish a useful change from a saving that creates other difficulties.

C
Residents can add information that the technical checks may miss. A short form asks when they travelled, which part of the street they used and what they noticed. Both pleasant and difficult experiences are welcome; a report does not need to propose a solution. Paper copies are available at the neighbourhood office for people who do not use the website. At an open meeting, the team will present the findings and discuss how residents’ accounts contributed to the final recommendation.`,
    questions: [
      {id: 'ielts-r06-gt-model-q1', prompt: "Choose the most suitable heading for paragraph A.", options: ['i', 'ii', 'iii', 'iv', 'v'], accepted: ['iii'], why: "iii 概括重新审视照明设置的原因。原文“The present settings were chosen before several new homes opened, and they no longer reflect how all the streets are used.”连接环境变化与旧设置不足，前文还列出睡眠和晚班出行的不同需求。i 问居民怎样参与评估，本段是既有需求；ii 与“Existing lamps will be used for the trial.”不符；iv 将电费作为主要成功标准，本段未这样设定；v 是比较方案的实施方式，不是本段的原因说明。"},
      {id: 'ielts-r06-gt-model-q2', prompt: "Choose the most suitable heading for paragraph B.", options: ['i', 'ii', 'iii', 'iv', 'v'], accepted: ['v'], why: "v 覆盖两条街轮换方案及综合检查。原文“The schedules will then be exchanged, allowing each street to experience both arrangements.”说明比较设计；“Considering these results together should help the team distinguish a useful change from a saving that creates other difficulties.”说明综合判断。i 的居民参与未展开；ii 的灯具更换不是试验内容；iii 问为何重新审视，而本段讲如何比较；iv 将一项电量记录扩大为主要成功标准，漏掉可见度和维护。"},
      {id: 'ielts-r06-gt-model-q3', prompt: "Choose the most suitable heading for paragraph C.", options: ['i', 'ii', 'iii', 'iv', 'v'], accepted: ['i'], why: "i 概括居民如何提供经验并参与评估。原文“Residents can add information that the technical checks may miss.”统领表格、纸本和会议；末句“At an open meeting, the team will present the findings and discuss how residents’ accounts contributed to the final recommendation.”说明意见用途。ii 的换灯计划未展开；iii 的既有设置问题不是本段中心；iv 的电费成功标准未提出；v 的两种照明对比是技术方案，不能概括居民反馈渠道。"},
    ],
    hint: '先用自己的几个词概括整段中心，再比较标题的对象、范围与写作目的；细节吻合后，还要检查能否覆盖其余句子。',
    model: 'Paragraph A: iii / Paragraph B: v / Paragraph C: i',
    modelNotes: [
      '步骤 1：读共同指令。A–C 是段落，i–v 是标题；每段写一个罗马编号，标题不得复用，有两个标题不用。',
      '步骤 2：读完 A 再概括：旧设置已不适应不同生活需要，所以重新审视。iii 覆盖这些原因；更换灯具或把电费当主要成功标准都改变了原文范围。',
      '步骤 3：读完 B，概括两条街交换设置并综合检查的比较方法，选 v。电量记录是其中一项，iv 不能概括可见度和维护检查。',
      '步骤 4：C 的表格、纸本和会议共同支持居民参与评估，选 i。复核三段的完整依据及标题不重复；保留原答，再解释两个未选标题为何不合整段。',
    ],
  }),
  guided: material({
    id: 'ielts-r06-gt-guided', title: "带着做 · 印刷作坊的新员工带训",
    context: `Choose the heading that best summarises the main idea of each paragraph, A–C, from the list of headings i–v. Write ONE Roman numeral per paragraph. There are more headings than paragraphs. Use each heading at most once. Two headings will not be used.

List of headings
i. Speeding up output during busy periods
ii. Keeping a record that makes training easier to continue
iii. Relying on written instructions for the whole training programme
iv. The limits of learning a workshop job from a handbook
v. A gradual move from observing to doing

A
At Merton Print, new employees receive a handbook describing the workshop’s equipment and common orders. Managers once expected careful reading to prepare people for most jobs. However, recent starters could repeat the instructions while still feeling unsure when paper or machine settings changed. The handbook gives a useful reference, but it cannot show how an experienced worker notices a developing problem. The workshop is therefore adding practical guidance, while keeping written instructions available for checking details afterwards.

B
During the first few shifts, a new employee follows a trained colleague through a complete order. The colleague explains decisions as they happen, rather than simply demonstrating a finished product. Next, the starter completes one part of an order while the colleague watches and offers feedback. More tasks are added as understanding improves. Production targets are adjusted during these sessions so that a starter can ask questions without rushing. The aim is a steady transfer of responsibility, not an immediate increase in output.

C
At the end of each session, the pair briefly note which tasks were attempted, which were completed confidently and which need further practice. Another trainer can use this record if the usual colleague is away, avoiding unnecessary repetition or an unsupported jump to harder work. Starters can also add questions for their next shift. Supervisors review repeated difficulties each month and use them to improve future sessions. The notes support continuity between people, rather than serving as a ranking of new employees.`,
    questions: [
      {id: 'ielts-r06-gt-guided-q1', prompt: "Choose the most suitable heading for paragraph A.", options: ['i', 'ii', 'iii', 'iv', 'v'], accepted: ['iv'], why: "iv 概括手册对实际工作准备的局限。原文“The handbook gives a useful reference, but it cannot show how an experienced worker notices a developing problem.”承接新人能背说明却仍不确定的情况。i 的增产不是本段目标；ii 的带训记录未出现；iii 将书面说明当作完整训练，与补充实践指导的安排不符；v 的分阶段观察和操作尚未在本段展开。"},
      {id: 'ielts-r06-gt-guided-q2', prompt: "Choose the most suitable heading for paragraph B.", options: ['i', 'ii', 'iii', 'iv', 'v'], accepted: ['v'], why: "v 覆盖从旁观到操作、逐步承担更多任务的过程。原文“Next, the starter completes one part of an order while the colleague watches and offers feedback.”给出下一步；“The aim is a steady transfer of responsibility, not an immediate increase in output.”点明目的。i 把目标改成加速产出；ii 的记录延续未展开；iii 忽略现场示范和反馈；iv 问手册的局限，而本段重点是实际带训的进阶。"},
      {id: 'ielts-r06-gt-guided-q3', prompt: "Choose the most suitable heading for paragraph C.", options: ['i', 'ii', 'iii', 'iv', 'v'], accepted: ['ii'], why: "ii 概括记录如何让带训接续。原文“Another trainer can use this record if the usual colleague is away, avoiding unnecessary repetition or an unsupported jump to harder work.”说明接班用途；“The notes support continuity between people, rather than serving as a ranking of new employees.”点明整体作用。i 的增产目标未提出；iii 把笔记扩大为完整训练；iv 的手册局限未论述；v 的技能进阶虽与记录有关，却未覆盖交接、提问及改进课程这些记录用途。"},
    ],
    hint: '先用自己的几个词概括整段中心，再比较标题的对象、范围与写作目的；细节吻合后，还要检查能否覆盖其余句子。',
  }),
  independent: material({
    id: 'ielts-r06-gt-independent', title: "自己试 · 旅舍床品服务的新安排",
    context: `Choose the heading that best summarises the main idea of each paragraph, A–C, from the list of headings i–v. Write ONE Roman numeral per paragraph. There are more headings than paragraphs. Use each heading at most once. Two headings will not be used.

List of headings
i. Helping guests communicate their linen needs
ii. A change prompted by complaints about cleanliness
iii. Organising the staff’s linen workload
iv. Labelling a place for reusable towels
v. Practical reasons for changing the old linen routine

A
At Harbour Guesthouse, a fresh towel used to be delivered to every room each morning, whether the previous one had been used or not. Staff noticed that many clean towels returned to the laundry basket simply because guests did not know where else to put them. Washing these items consumed water and filled the small drying room, delaying other work. The guesthouse is changing this routine to avoid unnecessary handling while continuing to provide clean linen whenever it is needed.

B
Guests now have several simple ways to indicate what they want. A blue label marks the bathroom hook where a towel can be left for further use; towels placed in the basket will be replaced. Guests who need an extra towel can leave the request card outside their door before breakfast. The card also has space to request fresh bed linen. Reception can explain the choices on arrival, so guests do not have to guess whether keeping a towel means missing another service.

C
Behind the scenes, staff collect request cards before starting their rounds and prepare the right quantities for each floor. Laundry is sorted so that full loads can be washed together, while a reserve of clean items remains available for later requests. The housekeeping lead checks the supply at the end of the day and adjusts the next collection if necessary. This coordination helps avoid carrying unwanted items between rooms and the laundry. It also gives staff a clearer view of what must be ready for the following morning.`,
    questions: [
      {id: 'ielts-r06-gt-independent-q1', prompt: "Choose the most suitable heading for paragraph A.", options: ['i', 'ii', 'iii', 'iv', 'v'], accepted: ['v'], why: "v 概括改变原床品流程的实际原因。原文“Washing these items consumed water and filled the small drying room, delaying other work.”把未需清洗的毛巾与资源、空间及工作延误联系起来。i 的客人表达需求办法未展开；ii 未有因清洁投诉促成改变的依据；iii 的新工作协调流程尚未说明；iv 的标签含义不是本段内容。"},
      {id: 'ielts-r06-gt-independent-q2', prompt: "Choose the most suitable heading for paragraph B.", options: ['i', 'ii', 'iii', 'iv', 'v'], accepted: ['i'], why: "i 概括客人怎样表达继续使用或更换床品的需求。原文“Guests now have several simple ways to indicate what they want.”统领挂钩、篮子和申请卡；“The card also has space to request fresh bed linen.”显示范围不止毛巾。ii 的清洁投诉未提出；iii 是员工工作协调，不是客人的选择；iv 是挂钩标签这一处细节，漏掉其他沟通方式；v 问旧流程为何改变，而本段解释新选择怎样使用。"},
      {id: 'ielts-r06-gt-independent-q3', prompt: "Choose the most suitable heading for paragraph C.", options: ['i', 'ii', 'iii', 'iv', 'v'], accepted: ['iii'], why: "iii 概括员工收集需求、配货和安排洗涤的工作。原文“Behind the scenes, staff collect request cards before starting their rounds and prepare the right quantities for each floor.”及“Laundry is sorted so that full loads can be washed together, while a reserve of clean items remains available for later requests.”共同支持组织工作量。i 的客人沟通方式不是段落中心；ii 的投诉原因未说明；iv 的挂钩标签未解释；v 问改变旧流程的起因，本段重在新流程，末句的好处是安排的结果。"},
    ],
    hint: '先用自己的几个词概括整段中心，再比较标题的对象、范围与写作目的；细节吻合后，还要检查能否覆盖其余句子。',
  }),
  timed: material({
    id: 'ielts-r06-gt-timed', title: "训练用限时 · 公司安静工作时段",
    context: `Choose the heading that best summarises the main idea of each paragraph, A–C, from the list of headings i–v. Write ONE Roman numeral per paragraph. There are more headings than paragraphs. Use each heading at most once. Two headings will not be used.

List of headings
i. Combining quiet work with planned team discussion
ii. Different results from a trial of fewer interruptions
iii. Replacing collaboration with independent work
iv. Equal benefits demonstrated by a fall in message numbers
v. Maintaining customer support during quieter working periods

A
A six-week trial at Benton Services asked employees to keep a short diary of interrupted work. The number of internal messages fell, but diaries showed that the effects differed between teams. People preparing long reports often completed a section without restarting, whereas staff coordinating urgent deliveries still needed frequent contact. Some employees also found a long silent period uncomfortable. These findings suggest that fewer messages do not automatically mean the same improvement for every role, even within a single workplace.

B
Customer requests still need a prompt response when a team chooses a quiet period. Each team names a colleague to monitor incoming calls and urgent enquiries, with another person available if the first is already helping someone. Routine questions can wait in the shared queue, but a request affecting that day’s service is passed on immediately. This arrangement protects customers from delays without requiring every employee to watch the same inbox throughout the period. The monitoring role rotates between colleagues.

C
Before starting, a team agrees on a suitable length and puts the period in the shared calendar. Members gather ordinary questions beforehand and decide which tasks they intend to finish. A brief conversation afterwards allows them to exchange updates and resolve matters held back during the session. Teams can begin with a short period and adjust it after discussing their experience. The calendar entry is a tool for planning concentration alongside cooperation, rather than a reason to avoid speaking to colleagues for the rest of the day.`,
    questions: [
      {id: 'ielts-r06-gt-timed-q1', prompt: "Choose the most suitable heading for paragraph A.", options: ['i', 'ii', 'iii', 'iv', 'v'], accepted: ['ii'], why: "ii 概括减少干扰的试行对不同人员产生不同效果。原文“The number of internal messages fell, but diaries showed that the effects differed between teams.”统领报告人员、急件协调人员及不适应者的例子。i 的安静工作与讨论排程未展开；iii 未说用独立工作替代协作；iv 把消息减少推成相同收益，与不同效果不符；v 的客户支持安排不是本段内容，急件岗位是效果差异的例子。"},
      {id: 'ielts-r06-gt-timed-q2', prompt: "Choose the most suitable heading for paragraph B.", options: ['i', 'ii', 'iii', 'iv', 'v'], accepted: ['v'], why: "v 概括安静时段里持续响应客户的安排。原文“This arrangement protects customers from delays without requiring every employee to watch the same inbox throughout the period.”统领监看人员、后备人员及急缓分流。i 的团队讨论排程未展开；ii 的试行效果比较未展开；iii 与轮值和后备协同不合；iv 的消息数量和全员相同收益未论证。"},
      {id: 'ielts-r06-gt-timed-q3', prompt: "Choose the most suitable heading for paragraph C.", options: ['i', 'ii', 'iii', 'iv', 'v'], accepted: ['i'], why: "i 概括安排安静工作并保留团队讨论。原文“A brief conversation afterwards allows them to exchange updates and resolve matters held back during the session.”承接前期准备；“The calendar entry is a tool for planning concentration alongside cooperation, rather than a reason to avoid speaking to colleagues for the rest of the day.”点明组合目的。ii 问试行效果差异，本段是使用安排；iii 与保留合作不符；iv 未有消息下降证明相同收益的依据；v 的客户值守流程不是本段中心。"},
    ],
    hint: '先用自己的几个词概括整段中心，再比较标题的对象、范围与写作目的；细节吻合后，还要检查能否覆盖其余句子。',
  }),
  reviews: [
    material({
      id: 'ielts-r06-gt-review-a', title: "隔天新题 · 街区步行路线手册",
      context: `Choose the heading that best summarises the main idea of each paragraph, A–C, from the list of headings i–v. Write ONE Roman numeral per paragraph. There are more headings than paragraphs. Use each heading at most once. Two headings will not be used.

List of headings
i. Keeping route information current
ii. Discovering local stories along an everyday route
iii. Choosing a route to suit different walkers
iv. Replacing printed maps with a digital service
v. Reaching every stop by the shortest possible path

A
The Stonebridge Loop leaflet invites people to look again at streets they may normally hurry through. Its route passes an old shopfront, a patterned pavement and a small riverside shelter, with a short account beside each stop. Volunteers chose ordinary places whose stories could easily be missed, rather than a list of the town’s best-known attractions. Readers are encouraged to pause and connect what they see with the people who used those places. Completing the walk quickly is less important than noticing something unfamiliar.

B
There is no need to follow every part of the route. The leaflet marks a shorter loop for walkers who want fewer stops and a longer alternative that avoids steps beside the river. The longer path reaches the same shelter by a gentler approach. Benches and public toilets are marked so that people can plan rests. Each version has an approximate walking time, which does not include pauses to read or look around. These choices help walkers match the outing to their energy and access needs.

C
Because streets change, the route is checked every season. Volunteers report closed paths, moved signs and changes to buildings described in the notes. An editor checks each report before adding a dated correction to the website. Printed copies remain available, and new print runs include confirmed changes. Anyone using an older leaflet can check the online correction list before setting out or ask at the information desk. The intention is to keep the walk usable, rather than let a familiar booklet become a misleading guide.`,
      questions: [
        {id: 'ielts-r06-gt-review-a-q1', prompt: "Choose the most suitable heading for paragraph A.", options: ['i', 'ii', 'iii', 'iv', 'v'], accepted: ['ii'], why: "ii 概括沿日常街道发现容易错过的地方故事。原文“Volunteers chose ordinary places whose stories could easily be missed, rather than a list of the town’s best-known attractions.”及“Readers are encouraged to pause and connect what they see with the people who used those places.”覆盖选点和阅读目的。i 的信息维护未展开；iii 的路线适配选项未展开；iv 未说数字服务替代纸图；v 与“Completing the walk quickly is less important than noticing something unfamiliar.”所表达的重点不合。"},
        {id: 'ielts-r06-gt-review-a-q2', prompt: "Choose the most suitable heading for paragraph B.", options: ['i', 'ii', 'iii', 'iv', 'v'], accepted: ['iii'], why: "iii 概括按体力和通行需要选择路线。原文“The leaflet marks a shorter loop for walkers who want fewer stops and a longer alternative that avoids steps beside the river.”给出不同版本；“These choices help walkers match the outing to their energy and access needs.”统领路线、休息设施和时间说明。i 的定期更新未展开；ii 的地方故事不是本段中心；iv 未说弃用纸图；v 不能覆盖为避台阶而走较长路线的选择。"},
        {id: 'ielts-r06-gt-review-a-q3', prompt: "Choose the most suitable heading for paragraph C.", options: ['i', 'ii', 'iii', 'iv', 'v'], accepted: ['i'], why: "i 概括核查并更新路线信息的流程。原文“Because streets change, the route is checked every season.”统领报告、确认和更正；“Printed copies remain available, and new print runs include confirmed changes.”说明纸本也持续更新。ii 的故事发现不是段落中心，建筑在此作为需核查的变化；iii 的路线适配选择未展开；iv 与纸本仍供应不符；v 的最短路径目标未提出。"},
      ],
      hint: '先用自己的几个词概括整段中心，再比较标题的对象、范围与写作目的；细节吻合后，还要检查能否覆盖其余句子。',
    }),
    material({
      id: 'ielts-r06-gt-review-b', title: "下一轮新题 · 影院宽松场次说明",
      context: `Choose the heading that best summarises the main idea of each paragraph, A–C, from the list of headings i–v. Write ONE Roman numeral per paragraph. There are more headings than paragraphs. Use each heading at most once. Two headings will not be used.

List of headings
i. Information for planning a cinema visit
ii. A special range of films made for these screenings
iii. A separate space for taking a break
iv. Adjusting light and sound for a more comfortable screening
v. Flexible support while the film is running

A
At Larch Cinema, relaxed screenings use films from the ordinary programme but present them in a different setting. The lights remain at a low level instead of going completely dark, and sudden changes in sound are reduced where possible. Advertising before the film is shortened, giving the session a more predictable beginning. These adjustments may help people who find a typical screening overwhelming. They are changes to the experience of watching, rather than a new collection of films with simpler stories.

B
Before booking, visitors can read a short guide showing the entrance, ticket desk and auditorium. It explains when doors open and how long the film lasts. A plan also marks the toilets and a nearby room where someone can take a break. People may contact the cinema to discuss seating needs, and groups can ask about arriving together. Having this information beforehand allows visitors to decide what will work for them, rather than discovering each arrangement while an entrance queue is forming.

C
During the film, staff allow for different audience responses. Someone may move, make a sound or leave for a while without being treated as a disturbance simply for doing so. An usher can help a visitor find the nearby room and return when they are ready, but does not insist that everyone take a break. Staff first ask what help is wanted instead of assuming a need. The emphasis is on responding to the person and keeping the visit manageable as the screening continues.`,
      questions: [
        {id: 'ielts-r06-gt-review-b-q1', prompt: "Choose the most suitable heading for paragraph A.", options: ['i', 'ii', 'iii', 'iv', 'v'], accepted: ['iv'], why: "iv 概括为更舒适的观影调整感官环境。原文“The lights remain at a low level instead of going completely dark, and sudden changes in sound are reduced where possible.”配合广告缩短、开场更可预测，覆盖主要调整。i 的到场计划指南未展开；ii 与“relaxed screenings use films from the ordinary programme”不符；iii 的休息空间未介绍；v 的播放中人员支持未展开。"},
        {id: 'ielts-r06-gt-review-b-q2', prompt: "Choose the most suitable heading for paragraph B.", options: ['i', 'ii', 'iii', 'iv', 'v'], accepted: ['i'], why: "i 概括帮助访客提前规划一次观影的信息。原文“Before booking, visitors can read a short guide showing the entrance, ticket desk and auditorium.”与“Having this information beforehand allows visitors to decide what will work for them, rather than discovering each arrangement while an entrance queue is forming.”统领时长、地图、座位和团体到场。ii 的专制影片未说明；iii 是地图中的休息房一项，不能覆盖其他规划信息；iv 的灯光音量调整未展开；v 问播放中的支持，本段重点在来访前。"},
        {id: 'ielts-r06-gt-review-b-q3', prompt: "Choose the most suitable heading for paragraph C.", options: ['i', 'ii', 'iii', 'iv', 'v'], accepted: ['v'], why: "v 概括播放过程中按个人需要灵活提供支持。原文“During the film, staff allow for different audience responses.”统领活动、声音和离场；“The emphasis is on responding to the person and keeping the visit manageable as the screening continues.”点明整体原则。i 的来访前规划不是本段重点；ii 的专制影片未提；iii 是可提供的一种帮助，漏掉其他反应和先询问需求的做法；iv 的灯光音量调整不是本段内容。"},
      ],
      hint: '先用自己的几个词概括整段中心，再比较标题的对象、范围与写作目的；细节吻合后，还要检查能否覆盖其余句子。',
    }),
  ],
};
