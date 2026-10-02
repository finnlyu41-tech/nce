import type {Variant} from './types';
import {batch01LessonsFor} from './curriculum/batch-01';
import {batch02LessonsFor} from './curriculum/batch-02';

/** Original, fictional teaching material. Times and lengths below are local mini-task suggestions. */
export type SampleQuestion = {id: string; prompt: string; options?: string[]; accepted: string[]; why: string};
export type SampleMaterial = {
  id: string; title: string; instruction: string; context?: string; script?: string;
  questions?: SampleQuestion[]; model?: string; modelNotes?: string[];
  hint: string; checklist: string[]; seconds: number; minimumWords?: number;
};
export type SampleLesson = {
  id: string; skill: 'listening' | 'reading' | 'speaking' | 'writing'; title: string; goal: string;
  explanation: string[]; boundary: string; model: SampleMaterial; guided: SampleMaterial;
  independent: SampleMaterial; timed: SampleMaterial; reviews: SampleMaterial[];
};
const question = (id: string, prompt: string, accepted: string[], why: string, options?: string[]): SampleQuestion => ({id, prompt, accepted, why, ...(options ? {options} : {})});
const listen = (id: string, title: string, script: string, day: string, time: string): SampleMaterial => ({
  id, title, instruction: '听预约信息，填写最终确认的星期和开始时间。星期用英文；时间可用 10:30 这样的格式。', script,
  questions: [question('day', '最终确认在哪一天？', [day], `说话者最后确认 ${day}；之前的信息已被修正。`), question('time', '活动几点开始？', [time, time.replace(':', '.')], `开始时间是 ${time}；提前到达的时间不是开始时间。`)],
  hint: '听 sorry / actually 后修正的信息；区分 arrive（到达）和 starts（开始）。',
  checklist: ['依据最后确认的信息作答。', '区分开始时间与提前到达时间。'], seconds: 75,
});
const listening: SampleLesson = {
  id: 'hub-listening', skill: 'listening', title: '第 1 课 · 听清预约的改动', goal: '听出最终确认的日期和活动时间。',
  explanation: ['主题是虚构的 Willow Learning Hub（社区学习中心）。先读两个问题，预测要听的是日期和时间。', '先出现的数字可能被修正。听到 sorry、actually 后，继续跟到最后确认；不要仅凭同一个词选答案。', '示范可看原文；引导只留方法；独立及限时新材料隐藏原文。重播和提示会保留在记录里。'],
  boundary: '短段合成语音，仅练信息定位；不是正式录音或完整听力。声音质量未经人工核验。没有实际听到声音，不会记录为听过。',
  model: {...listen('hub-l-model', '示范：园艺小组', 'The gardening group meets on Friday—sorry, on Saturday. Please arrive at ten fifteen. The session starts at ten thirty.', 'Saturday', '10:30'), model: 'Saturday / 10:30', modelNotes: ['Friday 被 sorry 后的 Saturday 修正。', '10:15 是到达时间，10:30 才是开始时间。']},
  guided: listen('hub-l-guided', '带着做：阅读小组', 'Our reading group meets on Tuesday—sorry, Wednesday. Please arrive at six fifteen. We begin at six thirty.', 'Wednesday', '6:30'),
  independent: listen('hub-l-independent', '自己试：摄影工作坊', 'The photography workshop was planned for Monday. Actually, it will be on Thursday. Please arrive at nine forty-five. The workshop starts at ten.', 'Thursday', '10:00'),
  timed: listen('hub-l-timed', '训练用限时：修理小组', 'We first suggested Sunday for the repair group. Sorry, the room is only available on Friday. Please arrive at two forty-five. The group starts at three.', 'Friday', '3:00'),
  reviews: [listen('hub-l-review-a', '隔天新题：绘画小组', 'The painting group was going to meet on Wednesday. Actually, it is on Saturday. You can arrive at eleven fifteen. The class starts at eleven thirty.', 'Saturday', '11:30'), listen('hub-l-review-b', '下一轮新题：烹饪小组', 'We planned the cooking group for Thursday—sorry, it is on Monday. Please arrive at four fifteen. We start at four thirty.', 'Monday', '4:30')],
};
const readingMaterial = (id: string, title: string, context: string, questions: SampleQuestion[]): SampleMaterial => ({id, title, context, instruction: '只根据这份通知回答。TRUE 为一致，FALSE 为矛盾，NOT GIVEN 为没有足够信息。', questions, hint: '把题干中具体的信息与通知逐项对应；原文未说的内容，不能用常识补。', checklist: ['能指出原文依据。', '把矛盾与没有信息分开。'], seconds: 90});
const choices = ['TRUE', 'FALSE', 'NOT GIVEN'];
const reading: SampleLesson = {
  id: 'hub-reading', skill: 'reading', title: '第 2 课 · 用通知找到依据', goal: '区分通知说明的事实、相反的信息和未说明的信息。',
  explanation: ['上一课预约好了活动，这一课阅读学习中心的使用通知。每题都要回到原文寻找依据。', 'TRUE：题干信息与原文一致。FALSE：原文明确说明相反情况。NOT GIVEN：原文信息不足；不是凭个人经验作答。', '先看一个有依据的示范，再处理新的短通知。它们只演示判断信息的方法，不能代表所有阅读题型。'],
  boundary: '原创短通知与两题小练习；不模拟完整阅读长度、难度或分数。训练用 90 秒为本站建议。',
  model: {...readingMaterial('hub-r-model', '示范：电脑使用', 'Members can use a computer for one hour without payment. They must reserve a place at the desk.', [question('free', '电脑第一小时免费。', ['TRUE'], 'without payment 与 free 表达同一信息。', choices), question('age', '只有成年人可以预约。', ['NOT GIVEN'], '通知没有年龄限制信息。', choices)]), model: 'TRUE / NOT GIVEN', modelNotes: ['第一题：without payment 是依据。', '第二题：不能从 Members 推断年龄限制。']},
  guided: readingMaterial('hub-r-guided', '带着做：储物柜', 'Lockers are available to members. Using a locker costs two pounds per visit. The lockers close at eight.', [question('free', '会员可以免费使用储物柜。', ['FALSE'], 'costs two pounds 与免费矛盾。', choices), question('close', '储物柜八点关闭。', ['TRUE'], 'close at eight 直接提供依据。', choices)]),
  independent: readingMaterial('hub-r-independent', '自己试：安静阅览区', 'The quiet study area opens at nine. Visitors may bring water, but food is not allowed. Seats cannot be reserved.', [question('food', '访客可以在安静阅览区吃东西。', ['FALSE'], 'food is not allowed 与可以吃东西矛盾。', choices), question('sockets', '每个座位都有电源插座。', ['NOT GIVEN'], '原文没有插座信息。', choices)]),
  timed: readingMaterial('hub-r-timed', '训练用限时：周末工作坊', 'The Saturday workshop begins at two. Members pay five pounds; other visitors pay eight pounds. All materials are included.', [question('cost', '会员支付的费用少于其他访客。', ['TRUE'], 'five pounds 少于 eight pounds。', choices), question('teacher', '这位老师也在当地学校任教。', ['NOT GIVEN'], '通知没有老师工作地点的信息。', choices)]),
  reviews: [readingMaterial('hub-r-review-a', '隔天新题：自行车存放', 'Bicycle parking is free. Bikes must be removed before the centre closes at seven. Staff do not lend locks.', [question('locks', '工作人员可以借出车锁。', ['FALSE'], 'do not lend locks 明确否定借车锁。', choices), question('free', '存放自行车不收费。', ['TRUE'], 'parking is free 是依据。', choices)]), readingMaterial('hub-r-review-b', '下一轮新题：借阅工具', 'Members may borrow a tool for three days. They leave a ten-pound deposit, which is returned when the tool comes back undamaged.', [question('return', '工具无损归还后会退还押金。', ['TRUE'], 'returned ... undamaged 提供依据。', choices), question('delivery', '中心提供免费送货。', ['NOT GIVEN'], '原文没有配送信息。', choices)])],
};
const speakMaterial = (id: string, title: string, instruction: string, model?: string): SampleMaterial => ({id, title, instruction, ...(model ? {model} : {}), hint: '先直接回答；再给一个相关原因；最后加时间、人物或真实例子。不用固定三句。', checklist: ['直接回应了问题。', '原因或细节与回答相关。', '回听一处停顿或不清楚的词，留下待核验问题。'], seconds: 45, minimumWords: 8});
const speaking: SampleLesson = {
  id: 'hub-speaking', skill: 'speaking', title: '第 3 课 · 说清自己的选择', goal: '用直接回答、相关理由和具体细节谈学习活动。',
  explanation: ['知道有哪些活动以后，练习向朋友解释你的选择。这是熟悉话题的组织训练。', '例如先回答“我想参加哪个活动”，再解释为什么，最后补一个具体安排。相关、清楚比硬加连接词重要。', '引导时可以看句架；独立新题收起句架。录音供本次回听，写下的文本只用于自查，不能代表实际声音。'],
  boundary: '45 秒为本地单题建议，不是正式口语每题时限。没有考官交流或四维评阅；文本、自查及录音回听都不能评定发音或 Band。',
  model: {...speakMaterial('hub-s-model', '示范：选择阅读小组', 'Which activity would you like to join at a learning centre? Why?', 'I would like to join a reading group because I enjoy hearing different opinions. I could go on Saturday morning, when I am free.'), modelNotes: ['第一句直接给出活动及原因。', '第二句用具体时间补充，内容与题目相关；不是背诵模板。']},
  guided: speakMaterial('hub-s-guided', '带着做：选一项真实活动', '选你真正想参加的一项活动。先用几个关键词，再说：I would like to ... because ...。补一个具体细节。'),
  independent: speakMaterial('hub-s-independent', '自己试：上一次一起学习', 'Do you prefer learning a new skill alone or with other people? Give a reason and one example from your life.'),
  timed: speakMaterial('hub-s-timed', '训练用限时：换一种活动', 'What new activity would you like your local learning centre to offer? Explain why it would be useful to you.'),
  reviews: [speakMaterial('hub-s-review-a', '隔天新题：邀请朋友', 'Would you invite a friend to a learning activity? Explain your choice and describe one suitable activity.'), speakMaterial('hub-s-review-b', '下一轮新题：学习时间', 'When do you prefer to learn something new? Explain why and give one example.')],
};
const academicMaterial = (id: string, title: string, context: string, model?: string): SampleMaterial => ({id, title, context, instruction: '用 2–3 句概括这份虚构数据：先写一个整体比较，再选一两个准确数字支持。只写已提供的信息。', ...(model ? {model} : {}), hint: '先找最高和最低，再用 compared with / while 表达差别。只有一个月份，不能说增长趋势或编造原因。', checklist: ['整体比较覆盖主要特征。', '数字及单位准确，没有添加原因或趋势。', '句子连贯；自己检查词汇、语法，仍需人工评阅。'], seconds: 180, minimumWords: 15});
const generalMaterial = (id: string, title: string, context: string, instruction: string, model?: string): SampleMaterial => ({id, title, context, instruction, ...(model ? {model} : {}), hint: '先说明写信目的，再具体说明问题，最后提出可回应的请求。语气应符合收件人关系。', checklist: ['写信目的清楚。', '题目中每项要求都有回应。', '对不熟悉的工作人员保持礼貌；语言仍需人工评阅。'], seconds: 180, minimumWords: 20});
function writing(variant: Variant): SampleLesson {
  const academic = variant === 'academic';
  return {
    id: 'hub-writing', skill: 'writing', title: `第 4 课 · ${academic ? '概括活动数据' : '写一封安排请求'}`, goal: academic ? '准确比较主要数据，避免添加未提供的信息。' : '清楚说明目的、情况和请求，使用适合对象的语气。',
    explanation: academic ? ['练一个 Academic Task 1 的小组成部分：主要特征和数据比较。', '下面每份数据只有同一个月份；能比较类别，却不能推断随时间上升或下降。先选重要差别，再用数字支持。', '本课只写 2–3 句，逐渐撤提示；完整 Task 1 还需要更完整的原始图表和至少 150 词的回应。'] : ['练一个 General Training Task 1 的小组成部分：面向不熟悉工作人员的礼貌请求。', '先写目的，再说明对安排的影响，最后提出具体替代办法。请求要让收件人知道怎样回应。', '本课只写信件正文的 3–4 句；完整 Task 1 还需覆盖完整情境、信件格式及至少 150 词。'],
    boundary: '这是 Task 1 mini，建议 3 分钟及短段落长度是教学安排；没有完整 Task 1／Task 2 或四维评分，不换算 Band。',
    model: academic ? {...academicMaterial('hub-wa-model', '示范：四月活动出席人次', 'Willow Learning Hub — April attendance (visits, not unique people): reading 60; gardening 40; repair 20.', 'Reading had the highest attendance, at 60 visits, while repair had the lowest, at 20. Gardening recorded 40 visits, twice the figure for repair.'), modelNotes: ['先概括最高与最低，再用数字支持。', 'visits 是出席人次；不能写成不同居民人数，也不能说增长。']} : {...generalMaterial('hub-wg-model', '示范：调整阅读小组预约', '你已预约周六阅读小组，但那天需要工作。给不熟悉的协调员写信：说明变动、对出席的影响、询问能否改到周三。', '写 3–4 句正文，覆盖目的、变化和请求。', 'I am writing to ask about changing my reading-group booking. I have to work on Saturday, so I cannot attend the session. Could I move my booking to Wednesday, if a place is available?'), modelNotes: ['第一句说明目的；第二句解释情况与影响。', 'Could I ... 与 if a place is available 让请求具体且礼貌。']},
    guided: academic ? academicMaterial('hub-wa-guided', '带着做：五月活动出席人次', 'May attendance (visits): reading 80; gardening 50; repair 20.') : generalMaterial('hub-wg-guided', '带着做：迟到十分钟', '你预约了周一修理小组，但公交安排变化，你会迟到十分钟。写给不熟悉的工作人员。', '用 3–4 句说明来信目的、迟到原因及影响，询问能否仍然参加。'),
    independent: academic ? academicMaterial('hub-wa-independent', '自己试：六月活动出席人次', 'June attendance (visits): photography 45; cooking 75; painting 30.') : generalMaterial('hub-wg-independent', '自己试：需要借用材料', '你已预约绘画小组，但自己的画笔坏了。写给不熟悉的协调员。', '写 3–4 句：说明参加的活动、画笔的问题及影响、询问能否借用画笔。'),
    timed: academic ? academicMaterial('hub-wa-timed', '训练用限时：七月活动出席人次', 'July attendance (visits): coding 90; cycling 30; chess 60.') : generalMaterial('hub-wg-timed', '训练用限时：改换日期', '你已预约周四摄影工作坊，但临时需要照顾家人。写给不熟悉的协调员。', '写 3–4 句：说明来信目的、不能出席的原因、询问能否改到下周的场次。'),
    reviews: academic ? [academicMaterial('hub-wa-review-a', '隔天新题：八月活动出席人次', 'August attendance (visits): music 36; drawing 72; reading 54.'), academicMaterial('hub-wa-review-b', '下一轮新题：九月活动出席人次', 'September attendance (visits): gardening 48; chess 24; cooking 96.')] : [generalMaterial('hub-wg-review-a', '隔天新题：询问无障碍安排', '你想和使用轮椅的朋友参加阅读小组。写给不熟悉的协调员。', '写 3–4 句：说明想参加的活动、朋友的需要、询问入口和座位是否方便。'), generalMaterial('hub-wg-review-b', '下一轮新题：遗失水杯', '你昨天参加烹饪小组，把蓝色水杯留在教室。写给不熟悉的工作人员。', '写 3–4 句：说明何时参加哪个活动、描述物品、询问是否找到及怎样取回。')],
  };
}
export const sampleSequence = {
  id: 'willow-hub-four-lessons', version: 1, title: '雅思小任务',
  rights: 'original-fictional' as const, qa: 'model-and-contract-tested; content-not-expert-reviewed' as const,
  notice: '每课练一个小目标：看示范、自己试、订正，再换新材料回想。短练习不替代完整模考，也不换算雅思分数。',
};
export function sampleLessonsFor(variant: Variant): SampleLesson[]{
  if(variant!=='academic'&&variant!=='general-training')throw new RangeError('Choose an exam category before requesting course materials.');
  return [listening,reading,speaking,writing(variant),...batch01LessonsFor(variant),...batch02LessonsFor(variant)];
}
export const sampleLessonById = (variant: Variant, id: string) => sampleLessonsFor(variant).find(lesson => lesson.id === id);
export const sampleMaterials = (lesson: SampleLesson) => [lesson.model, lesson.guided, lesson.independent, lesson.timed, ...lesson.reviews];
