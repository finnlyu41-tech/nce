import type {Variant} from '../types';
import type {SampleLesson, SampleMaterial, SampleQuestion} from '../sample-sequence';

/** Original fictional commentaries, not copied test questions or official difficulty calibration. */
type ViewAnswer = 'YES' | 'NO' | 'NOT GIVEN';
type ViewItem = {statement: string; answer: ViewAnswer; why: string};
const options = ['YES', 'NO', 'NOT GIVEN'];
const instruction = "Decide whether each statement agrees with the writer's views. Select YES if it agrees, NO if it contradicts the writer, or NOT GIVEN if the passage does not establish the writer's view on that point. Use only this passage.";

function material(id: string, title: string, context: string, items: ViewItem[], hint: string): SampleMaterial {
  const questions: SampleQuestion[] = items.map((item, index) => ({
    id: `${id}-q${index + 1}`, prompt: item.statement, options: [...options],
    accepted: [item.answer], why: item.why,
  }));
  return {
    id, title, context, instruction, questions, hint, seconds: 150,
    checklist: ['找的是作者自己的观点，不是被引用者的主张。', '核对题干与依据的范围、程度、条件和否定。', '区分相反观点与未说明的观点；不用常识补答案。'],
  };
}

function annotatedModel(value: SampleMaterial): SampleMaterial {
  return {
    ...value,
    model: value.questions!.map((question, index) => `${index + 1}. ${question.accepted[0]}`).join(' / '),
    modelNotes: value.questions!.map((question, index) => `${index + 1}. ${question.prompt} → ${question.accepted[0]}。${question.why}`),
  };
}

const academic: SampleLesson = {
  id: 'reading-writer-views', skill: 'reading', title: 'Academic · 找准作者的观点',
  goal: '在一般兴趣短论述中区分作者认同、作者反对与没有说明的观点。',
  explanation: [
    '这课练 writer views/claims 的 YES / NO / NOT GIVEN，不是通知事实的 TRUE / FALSE / NOT GIVEN。先确认题干问谁的观点。',
    'YES：作者表达了相同意思；NO：作者表达了相反意思；NOT GIVEN：这篇文章没有足够信息确定作者对该具体命题的看法。仅仅没找到同一个词，不足以判定。',
    '作者可能先引用别人再反驳。跟到作者自己的回应，核对 often、all、only 等范围，以及题干的同义改写。',
    '示范展示依据；引导只提示方法。独立、限时和两次延迟练习换论述与命题，保留第一遍答案、提示使用和订正。',
  ],
  boundary: '本站原创、虚构的约 80–150 英文词一般兴趣短论述，每份 3 题。150 秒是局部训练建议，不是正式阅读的 60 分钟全卷；没有完整长文、40 题或难度标定。局部答案核对与隔日新题表现不等于掌握或 IELTS Band，内容尚待专家与学习者核验。',
  model: annotatedModel(material('ielts-r04-a-model', '示范 · 城市树木的选择',
    'A row of trees can make a busy street more pleasant, but choosing them is not simply a matter of appearance. One designer argues that every street should use the same species to create a tidy, uniform city. I disagree. Appearance alone is not a sufficient reason to use one species everywhere. Different streets have different amounts of space, and a tree that suits a wide avenue may be unsuitable beside a narrow pavement. Cities should plan for the care trees will need over many years, rather than treating planting as a finished project. In my view, a useful planting policy combines local conditions with a realistic maintenance plan.', [
      {statement: 'A uniform appearance is a sufficient reason to plant one tree species throughout a city.', answer: 'NO', why: '这是被引用的设计者主张，作者随后反对。原文 “Appearance alone is not a sufficient reason to use one species everywhere.” 与题干正面断言相反。'},
      {statement: 'Long-term maintenance should be considered when cities choose trees.', answer: 'YES', why: '原文 “Cities should plan for the care trees will need over many years” 明确主张考虑多年养护；long-term maintenance 是同义改写。'},
      {statement: 'Schoolchildren should make the final decision about which trees a city plants.', answer: 'NOT GIVEN', why: '文章谈外观、街道条件与养护规划，没有说明学生是否参与，更没有说明最终决策应由谁作出。'},
    ], '先标出设计者的主张与 I disagree 后作者的回应，再逐项比较题干。')),
  guided: material('ielts-r04-a-guided', '带着做 · 博物馆的说明文字',
    'Museum labels help visitors notice details they might otherwise miss. A curator I spoke to would replace original objects with large photographs because photographs allow more space for explanations. I would not take that approach: a photograph cannot fully replace the experience of examining an original object. However, displaying an object without any explanation is not always helpful either. Short labels should offer a starting point, while longer accounts can be available nearby for visitors who want them. Visitors should be free to choose how much explanation they read. A museum should invite close looking and questions, rather than require everyone to follow the same route through a fixed account.', [
      {statement: 'Photographs can fully replace the experience of viewing original museum objects.', answer: 'NO', why: '策展人建议替换原物，但作者说 “a photograph cannot fully replace the experience of examining an original object.”；cannot 与题干 can 相反。'},
      {statement: 'Longer museum explanations should always be available in at least two languages.', answer: 'NOT GIVEN', why: '作者赞成提供长说明，但没有说明应使用多少种语言；附近有长说明不等于应至少提供双语版本。'},
      {statement: 'Visitors should be able to decide how much explanatory material they read.', answer: 'YES', why: '原文 “Visitors should be free to choose how much explanation they read.” 直接表达该观点；explanatory material 对应 explanation。'},
    ], '把被引用者的提议和作者自己的回应分开；对每个题干先标对象，再查肯定或否定。'),
  independent: material('ielts-r04-a-independent', '自己试 · 科学中的修正',
    'A science lesson can give the impression that useful research always confirms an initial prediction. I think that impression is misleading. A result that challenges the first prediction can be valuable because it reveals what the explanation has failed to cover. This does not mean that every surprising result should immediately overturn established knowledge. Researchers should first examine the methods and consider other explanations. A colleague complains that changing an explanation shows weakness. To me, revising it when there is good evidence is a strength. Teaching should help students understand this process, instead of presenting scientific knowledge as a collection of answers that can never be reconsidered.', [
      {statement: 'Research loses its value when a result disagrees with the initial prediction.', answer: 'NO', why: '原文 “A result that challenges the first prediction can be valuable” 明确承认相反结果也能有价值；不能把有用研究限定为验证预测。'},
      {statement: 'Changing an explanation in response to sound evidence can be a positive feature of research.', answer: 'YES', why: '原文 “revising it when there is good evidence is a strength.” 把有证据支持的修正视为优点；sound evidence 对应 good evidence。'},
      {statement: 'Scientific explanations should be taught as open to reconsideration.', answer: 'YES', why: '原文 “Teaching should help students understand this process, instead of presenting scientific knowledge as a collection of answers that can never be reconsidered.”；作者反对把科学知识教成永不可重新考虑的固定答案。'},
    ], '先还原题干的意思，再找作者评价；不要把 colleague 的抱怨当作作者立场。'),
  timed: material('ielts-r04-a-timed', '训练用限时 · 公共交通的便利',
    'A proposal for free bus travel has attracted attention in our city. Its supporters argue that removing fares is enough to persuade all drivers to leave their cars at home. I doubt that. Free travel may help some people, but it cannot make an infrequent service convenient. People still need to reach work or appointments at a useful time. For that reason, I would consider reliability and frequency alongside price when deciding how to improve buses. Passenger numbers alone are also an incomplete measure of success: we should ask whether journeys have become easier for the people using the service. An attractive policy needs to work in everyday life, not merely sound generous.', [
      {statement: 'Removing bus fares is enough to make every driver stop using a car.', answer: 'NO', why: '作者回应支持者时说 “Free travel may help some people, but it cannot make an infrequent service convenient.”；some people 与 every driver 的充分保证不同，作者明确否定仅免票就足够。'},
      {statement: 'New bus stops should be built beside every primary school in the city.', answer: 'NOT GIVEN', why: '文章谈票价、可靠性、频率和评价政策效果，没有谈公交站选址或小学旁设站。'},
      {statement: 'Decisions about bus improvements should take service frequency into account as well as fares.', answer: 'YES', why: '原文 “I would consider reliability and frequency alongside price” 明确要求把服务频率与价格一起考虑。'},
    ], '圈出题干的范围和条件，并与对应的作者主张逐项比较；计时预算不是评分标准。'),
  reviews: [
    material('ielts-r04-a-review-a', '隔天新题 · 在线课程的节奏',
      'An online lesson is not successful simply because every student reaches the last screen. One course designer wants every learner to follow a single viewing schedule, arguing that this makes progress easy to compare. I disagree: students should be able to pause, return to a difficult section and spend different amounts of time on it. A course should make these choices possible rather than discourage them. To judge learning, I would ask students to explain an idea or apply it to a new example. A record of how many videos they have opened is not enough. Technology is useful when it supports thinking, not when it turns learning into a race to finish.', [
        {statement: 'All students should work through an online lesson at the same pace.', answer: 'NO', why: '原文 “students should be able to pause, return to a difficult section and spend different amounts of time on it.” 反对统一节奏；前面的 single viewing schedule 是设计者而非作者的主张。'},
        {statement: 'Using an idea in an unfamiliar example can provide better evidence of learning than counting opened videos alone.', answer: 'YES', why: '原文 “I would ask students to explain an idea or apply it to a new example.”，随后 “A record of how many videos they have opened is not enough.”；作者认可应用表现，否定单独打开数足以证明学习。'},
        {statement: 'Online courses should charge less than classes taught in person.', answer: 'NOT GIVEN', why: '文章只评价学习节奏和学习证据，没有讨论课程费用，也没有与面授价格作比较。'},
      ], '比较题先分别核对两方及比较关系，不用经验补；确认进度规则是谁的观点。'),
    material('ielts-r04-a-review-b', '下一轮新题 · 社区自然观察',
      'Community projects can invite residents to record the plants or birds they notice nearby. A project organiser says that every report should be accepted without checking, so that nobody feels discouraged. I do not agree. Encouragement matters, but records still need enough detail for someone else to examine them. A description of where and when an observation was made can make a report more useful. I also think residents who know a place well can contribute valuable observations that an occasional visitor might miss. A project should explain how to record observations carefully and welcome questions. Treating volunteers seriously means helping them produce trustworthy work, rather than pretending that all reports are equally reliable.', [
        {statement: 'Residents should be allowed to submit their observations anonymously.', answer: 'NOT GIVEN', why: '文章要求记录观察地点和时间，但没有说明应否署名；地点、时间等记录细节不能确定作者对匿名提交的看法。'},
        {statement: 'Professional scientists should review reports before the project uses them.', answer: 'NOT GIVEN', why: '文章要求记录有足够细节供别人检查，但没有指定检查者应具有专业科学家资格，也未说明使用前必须由这类人员审阅。'},
        {statement: 'Familiarity with a local area can help residents make useful observations.', answer: 'YES', why: '原文 “residents who know a place well can contribute valuable observations that an occasional visitor might miss.”；familiarity 对应 know a place well，useful 对应 valuable。'},
      ], '先确认每个判断的说话者，再核对同义表达、范围和条件。'),
  ],
};

const general: SampleLesson = {
  id: 'reading-writer-views', skill: 'reading', title: 'General Training · 看清工作与社区评论的立场',
  goal: '在工作和社区短评论中区分作者意见、他人建议与未表达的观点。',
  explanation: [
    '这课的工作与社区材料是观点评论，不是公告事实题。使用 YES / NO / NOT GIVEN 判断题干与作者 views/claims 的关系。',
    'YES 要有作者认同该意思的依据；NO 要有相反立场的依据；NOT GIVEN 表示作者对这个具体命题的看法没有充分说明，不等于否定。',
    '先标明 manager、neighbour 等他人的声音，再找作者自己的回应。检查所有人、总是、仅凭等范围，以及同义改写是否保留条件。',
    '引导逐步撤去；独立、限时及延迟题都换具体论述。答案与提示历史保留，订正后再用未见材料检查局部目标。',
  ],
  boundary: '本站原创、虚构的约 80–150 英文词工作／社区短评论，每份 3 题。材料不是完整 GT 阅读三部分或 40 题，也没有官方难度标定。150 秒是局部训练建议，不是全卷 60 分钟。局部核对、走完课程与隔日表现都不能换算 IELTS Band；内容尚待专家与学习者核验。',
  model: annotatedModel(material('ielts-r04-gt-model', '示范 · 共享办公桌',
    'Our office is considering shared desks. The manager believes identical desk arrangements will suit everyone, because staff can sit anywhere without making changes. I do not support that assumption. People do different work, and some need equipment or a quieter position that others do not. I would ask employees about their needs before deciding how shared desks should operate. A small trial could reveal difficulties that a tidy floor plan does not show. Keeping the room neat is useful, but it should not take priority over making the workplace usable. In my view, a successful arrangement respects different needs instead of requiring every person to adapt to the same setup.', [
      {statement: 'Identical desk arrangements will meet the needs of every employee.', answer: 'NO', why: '这是经理的假设；作者说 “I do not support that assumption.”，并说明 “some need equipment or a quieter position that others do not.”，明确反对所有人都适用。'},
      {statement: 'Employees should be consulted before rules for shared desks are decided.', answer: 'YES', why: '原文 “I would ask employees about their needs before deciding how shared desks should operate.”；be consulted 是 ask employees 的同义改写。'},
      {statement: 'Staff who clear their desks early should receive additional pay.', answer: 'NOT GIVEN', why: '文中谈工作需要、征询员工和试行共享桌，没有讨论清桌时间、奖金或额外工资。'},
    ], '先标出经理的假设；继续读作者是否支持，再逐项核对题干的对象和范围。')),
  guided: material('ielts-r04-gt-guided', '带着做 · 社区花园',
    'Neighbours have suggested adding a decorative pond to our community garden. It could look attractive, but I would improve the paths before spending money on decoration. A garden should be easy to enter and move around, including for residents who cannot walk far. One neighbour wants to reserve all planting spaces for experienced gardeners, saying beginners slow everyone down. I think that would defeat an important purpose of the garden. Beginners should have a place to learn alongside more experienced residents. We need clear arrangements for sharing spaces, not a rule that excludes people who are still learning. A beautiful garden is of little value if many neighbours cannot use or join it.', [
      {statement: 'Making the garden accessible should take priority over decorative additions.', answer: 'YES', why: '原文 “I would improve the paths before spending money on decoration.”，接着强调能够进入与移动；作者主张先改善使用条件再装饰。'},
      {statement: 'Residents should vote every year on the design of the garden.', answer: 'NOT GIVEN', why: '文章提出步道优先和初学者参与，但没有说明花园设计是否应投票决定，也未提出每年投票。'},
      {statement: 'Only residents with gardening experience should have access to planting spaces.', answer: 'NO', why: '仅限有经验居民是邻居的提议；作者说 “Beginners should have a place to learn alongside more experienced residents.”，与 only residents with gardening experience 相反。'},
    ], '对每项安排分别找作者立场，核对频率和参与对象。'),
  independent: material('ielts-r04-gt-independent', '自己试 · 新员工培训',
    'A colleague suggests giving new staff a manual and leaving them to learn every task alone. Manuals are useful for checking a familiar procedure, but I do not think they are enough for every situation. Some troubleshooting should be practised with a colleague who can explain how a decision is made. Straightforward steps may need only a short demonstration and a written reminder. It is a mistake to teach every task in the same way, regardless of what it involves. New staff should also be able to ask questions without feeling that they are wasting someone\'s time. Good training helps people make sensible decisions; it is more than handing over a set of instructions.', [
      {statement: 'Some problem-solving tasks should be practised with help from another member of staff.', answer: 'YES', why: '原文 “Some troubleshooting should be practised with a colleague” 明确支持共同练习；problem-solving tasks 对应 troubleshooting。'},
      {statement: 'The same teaching method should be used for every workplace task.', answer: 'NO', why: '原文 “It is a mistake to teach every task in the same way, regardless of what it involves.” 直接否定不分任务使用同一方法。'},
      {statement: 'Effective training should develop sound decision-making rather than merely supply instructions.', answer: 'YES', why: '原文 “Good training helps people make sensible decisions; it is more than handing over a set of instructions.”；sound decision-making 对应 make sensible decisions，merely supply instructions 对应只交付说明。'},
    ], '还原题干中的 some 和 every；找作者如何区分任务，不把有用等同于处处足够。'),
  timed: material('ielts-r04-gt-timed', '训练用限时 · 图书馆晚间开放',
    'Some residents want our neighbourhood library to open later. I support trying this, provided the hours suit the people likely to use them and there is enough staff support. Longer hours should not depend on asking regular volunteers to stay longer without their agreement. A councillor says the latest possible closing time is always the best choice, but I would start with a limited trial and listen to users afterwards. An extra hour that people can actually use may be more helpful than a very late closing time with little support. The aim should be a useful and sustainable service, rather than winning attention with an impressive timetable.', [
      {statement: 'A trial of later opening should consider both users\' needs and available staff support.', answer: 'YES', why: '原文 “provided the hours suit the people likely to use them and there is enough staff support.” 为试行附上两个条件，不能只保留延长时间的主张。'},
      {statement: 'Introducing longer opening hours justifies extending volunteers\' shifts without their agreement.', answer: 'NO', why: '原文 “Longer hours should not depend on asking regular volunteers to stay longer without their agreement.” 明确反对未经同意延长志愿者工作时间。'},
      {statement: 'A second library should be built before any opening hours are changed.', answer: 'NOT GIVEN', why: '评论讨论现有图书馆延长开放时间的条件和试行办法，没有提出新建第二座图书馆或建设先后顺序。'},
    ], '比较作者有条件的支持与他人的主张；逐项核对题干涉及的条件与对象。'),
  reviews: [
    material('ielts-r04-gt-review-a', '隔天新题 · 社区修理活动',
      'At our repair cafe, volunteers help neighbours examine broken household items. One volunteer wants visitors to wait outside while the work is done, arguing that this lets repairs finish faster. I prefer an approach that includes visitors. Watching the checks and asking questions can help people understand their possessions and notice problems sooner. In my view, explaining the checks is more valuable than finishing every repair as quickly as possible. Volunteers should be honest when an item cannot be repaired safely, rather than promise a result just to satisfy a visitor. The cafe should build understanding as well as offer practical help; completing the largest number of repairs is not its only worthwhile aim.', [
        {statement: 'The cafe should offer a separate repair session for children.', answer: 'NOT GIVEN', why: '评论支持访客观看与提问，没有区分访客年龄，也未说明是否应为儿童单独安排活动。'},
        {statement: 'Visitors should be excluded while volunteers work on their items.', answer: 'NO', why: '把访客留在外面是志愿者的主张；作者说 “I prefer an approach that includes visitors.”，并肯定观看与提问的作用。'},
        {statement: 'Helping visitors understand the checks matters more than making every repair as fast as possible.', answer: 'YES', why: '原文 “explaining the checks is more valuable than finishing every repair as quickly as possible.”；understand the checks 保留了作者重视解释的意思。'},
      ], '分别找出作者对速度、理解和活动方式的观点，再核对题干；不要凭经验补充。'),
    material('ielts-r04-gt-review-b', '下一轮新题 · 社区公交站选址',
      'Choosing a new bus stop affects more people than those who attend a public meeting. I believe the council should seek views from residents who cannot attend, as well as listen to the people in the room. A neighbour argues that the lowest installation cost should settle the choice. I disagree. Saving a small amount on installation is not a good reason to make the service harder to reach. A slightly more expensive site may be better if it gives more residents practical access. Clear information about the alternatives would help people explain their preferences. A fair decision considers how the stop will be used, rather than treating the loudest voices or the cheapest proposal as automatically decisive.', [
        {statement: 'Residents unable to attend the meeting should have an opportunity to contribute their views.', answer: 'YES', why: '原文 “the council should seek views from residents who cannot attend” 明确支持征询无法到会的居民。'},
        {statement: 'The council should compare the long-term maintenance costs of the proposed sites.', answer: 'NOT GIVEN', why: '评论讨论安装成本与可达性，没有讨论长期维护成本或明确主张比较这类成本；提及安装成本不能推出这项额外观点。'},
        {statement: 'The council should hold a second public meeting before making its final choice.', answer: 'NOT GIVEN', why: '作者要求征询无法到会者的意见并提供方案信息，但没有指定征询方式，也没有说明应再次开会；征询意见不等于承诺第二次会议。'},
      ], '不要把某位邻居的成本主张算到作者名下；核对同义改写和题干新增的政策。'),
  ],
};

/** Both variants share R04 rules; their authored passages, prompts and material IDs are separate. */
export function readingViewsLessonFor(variant: Variant): SampleLesson {
  if (variant === 'academic') return academic;
  if (variant === 'general-training') return general;
  throw new Error('Unknown IELTS variant');
}
