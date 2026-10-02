import type {MultiSelectLesson, MultiSelectMaterial} from './types';

/**
 * Original fictional L02 teaching material, shared by both test variants.
 * Each task has a complete answer set and evidence for every listed option.
 * TTS playback and human audio/content QA are separate from this authored data.
 */
const checklist = [
  '先确认本组要选 TWO 还是 THREE，并只从题干给出的字母范围作答。',
  '每个选项分别查是否被支持；提到过、以后计划或属于另一对象，都不能自动算本题答案。',
  '为每项保留支持、反驳或未说明的理由，再检查选择数量。不能多选来碰运气。',
  '首答与订正分开记录；反馈后用新材料复验，提示、重播和旧题重复不能当作无辅助新题表现。',
];
const material = (value: Omit<MultiSelectMaterial, 'seconds' | 'checklist'>): MultiSelectMaterial => ({
  ...value, seconds: 180, checklist: [...checklist],
});

const model = material({
  id: 'ielts-l02-model',
  title: '示范 · Current membership services',
  stimulus: 'Welcome to Willow Community Centre. Your current membership includes borrowing board games and using the study desks. We plan to start a bicycle repair service next month, so it is not available yet. The café sells drinks, but membership does not cover their cost. Staff can give directions to local housing offices; they do not fill in application forms for members. Our evening programme changes each term. Please check the noticeboard for dates and room numbers before booking a class.',
  task: {
    id: 'ielts-l02-model-selection',
    prompt: 'Which TWO services are included with a CURRENT membership at Willow Community Centre? Choose TWO letters, A–E.',
    selectionCount: 2,
    correctOptionIds: ['A', 'C'],
    options: [
      {id: 'A', text: 'Borrowing board games', judgment: 'supported', quotes: ['Your current membership includes borrowing board games and using the study desks.'], reason: 'includes 明确把 borrowing board games 列为当前会员服务；是完整支持，不是只听到 games 一词。'},
      {id: 'B', text: 'Getting free drinks at the café', judgment: 'contradicted', quotes: ['The café sells drinks, but membership does not cover their cost.'], reason: '会员资格不支付饮料费用，与“作为会员服务免费领取饮料”矛盾。听到 café 和 drinks 不能就选。'},
      {id: 'C', text: 'Using the study desks', judgment: 'supported', quotes: ['Your current membership includes borrowing board games and using the study desks.'], reason: 'using the study desks 与 board games 并列，二者各是被明确包括的服务；不是只能在一句里选一个。'},
      {id: 'D', text: 'Getting bicycle repairs now', judgment: 'contradicted', quotes: ['We plan to start a bicycle repair service next month, so it is not available yet.'], reason: '这是下月计划，现在尚不可用；now 与 not available yet 矛盾，不能把未来服务算成当前服务。'},
      {id: 'E', text: 'Accessing online exercise videos', judgment: 'not-stated', quotes: [], reason: '原稿没有说明在线健身视频或相关权限。提到 evening programme 不能推出有视频服务；依据不足，不用“社区中心通常有”来补。'},
    ],
  },
  hint: '对每项都问：是否明确包括、是否现在可用、是否属于会员？先分类证据，再核对要求的选择数量。',
  modelNotes: [
    '题干同时限制 TWO 和 CURRENT。每项要符合“当前会员服务”，不是把录音中提到的两个名词挑出来。',
    'A、C 由同一句 includes 并列支持；一个句子可以提供两个正确项，但两项仍需分别核对含义。',
    'B 被费用说明反驳，D 被时间范围反驳；E 没有信息。反驳与未说明的理由分开，不把它们都叫“没听见”。',
    '示范的完整集合是 A、C。交卷前确认恰好两个不同字母；先保留自己的首答，不能用多写一个字母来覆盖不确定。',
  ],
});

const guided = material({
  id: 'ielts-l02-guided',
  title: '引导 · Volunteer responsibilities',
  stimulus: 'Before Saturday’s river cleanup, I want to explain the volunteers’ jobs. Each volunteer should wear sturdy shoes, record how many filled bags their team collects, and carry those bags to the marked collection point. Council staff will drive the truck; volunteers must not drive it. The organisers will provide drinks; volunteers are not responsible for refreshments. Staff will also give teams their collection routes when they arrive. The safety briefing starts at nine, and everyone should attend before going onto the river path.',
  task: {
    id: 'ielts-l02-guided-selection',
    prompt: 'What THREE things are VOLUNTEERS asked to do during the river cleanup? Choose THREE letters, A–F.',
    selectionCount: 3,
    correctOptionIds: ['B', 'D', 'F'],
    options: [
      {id: 'A', text: 'Give each team its collection route', judgment: 'different-target', quotes: ['Staff will also give teams their collection routes when they arrive.'], reason: '分发路线确实会做，但主语是 Staff；题干问 VOLUNTEERS 的职责。不能把工作人员的任务换成志愿者任务。'},
      {id: 'B', text: 'Wear sturdy shoes', judgment: 'supported', quotes: ['Each volunteer should wear sturdy shoes, record how many filled bags their team collects, and carry those bags to the marked collection point.'], reason: 'Each volunteer should 的第一个职责是穿 sturdy shoes，直接适用志愿者。'},
      {id: 'C', text: 'Drive the collection truck', judgment: 'contradicted', quotes: ['Council staff will drive the truck; volunteers must not drive it.'], reason: 'volunteers must not drive it 明确禁止志愿者开车；不能因为录音提到 drive the truck 就判断为他们的任务。'},
      {id: 'D', text: 'Record the number of filled bags their team collects', judgment: 'supported', quotes: ['Each volunteer should wear sturdy shoes, record how many filled bags their team collects, and carry those bags to the marked collection point.'], reason: 'record how many filled bags 与选项中的 record the number 表达同一计数记录职责；对象是他们自己团队收集的装满的袋子。'},
      {id: 'E', text: 'Provide refreshments for the team', judgment: 'contradicted', quotes: ['The organisers will provide drinks; volunteers are not responsible for refreshments.'], reason: '明确说明志愿者不负责 refreshments；组织者会提供饮料。不能把团队要用到的物品都当作志愿者应提供。'},
      {id: 'F', text: 'Carry the filled bags to the collection point', judgment: 'supported', quotes: ['Each volunteer should wear sturdy shoes, record how many filled bags their team collects, and carry those bags to the marked collection point.'], reason: 'carry those bags to the marked collection point 是志愿者职责；those bags 回指已装满的收集袋，不是驾驶卡车运输。'},
    ],
  },
  hint: '把 volunteer、staff、organiser 的责任分开。逐项检查“谁做什么”，再数自己有充分依据的选项；不要只圈到录音里的动作词。',
});

const independent = material({
  id: 'ielts-l02-independent',
  title: '独立新题 · What to bring on a photography walk',
  stimulus: 'For tomorrow’s garden photography walk, please bring your own camera and a waterproof coat. The centre supplies tripods at the meeting point, so leave yours at home. Lunch is provided; do not bring a packed lunch. We recommend comfortable shoes, but special boots are not needed. You will photograph flowers as well as wider views of the garden. Beginners can ask questions throughout the walk. We expect to finish before the afternoon visitor group arrives, and staff will collect the borrowed tripods.',
  task: {
    id: 'ielts-l02-independent-selection',
    prompt: 'Which TWO items are participants asked to BRING themselves for the photography walk? Choose TWO letters, A–E.',
    selectionCount: 2,
    correctOptionIds: ['B', 'E'],
    options: [
      {id: 'A', text: 'A tripod', judgment: 'contradicted', quotes: ['The centre supplies tripods at the meeting point, so leave yours at home.'], reason: 'tripods 由中心提供，并明确要求 leave yours at home；不属于要自带的两件物品。'},
      {id: 'B', text: 'Their own camera', judgment: 'supported', quotes: ['For tomorrow’s garden photography walk, please bring your own camera and a waterproof coat.'], reason: 'please bring your own camera 直接要求参与者自带相机；与后面的 coat 一同受 bring 支配。'},
      {id: 'C', text: 'A packed lunch', judgment: 'contradicted', quotes: ['Lunch is provided; do not bring a packed lunch.'], reason: 'do not bring a packed lunch 明确反驳自带午餐；provided 的物品不能填进 BRING themselves 的集合。'},
      {id: 'D', text: 'Spare camera batteries', judgment: 'not-stated', quotes: [], reason: '原稿没有提出备用电池要求。自带相机不等于必须自带 spare batteries；不能用摄影常识补一条未给出的指令。'},
      {id: 'E', text: 'A waterproof coat', judgment: 'supported', quotes: ['For tomorrow’s garden photography walk, please bring your own camera and a waterproof coat.'], reason: 'a waterproof coat 是 bring 的另一个宾语，明确要求自带；不把建议的 comfortable shoes 或未要求的特殊靴子混进这两项。'},
    ],
  },
  hint: '区分请你带与现场提供；每项找明确依据，不用经验补。',
});

const timed = material({
  id: 'ielts-l02-timed',
  title: '训练用限时 · Benefits of extended library hours',
  stimulus: 'We extended the library’s weekday opening hours after speaking to residents. People who finish work at six can now borrow books later in the evening. Students can stay in a quiet study space until eight instead of leaving at six. The extra hours do not include weekends, and we have not added more computers. A café was suggested, but it has not been approved. Staff start later on these days, so their total working hours remain the same. We will review attendance at the end of the term.',
  task: {
    id: 'ielts-l02-timed-selection',
    prompt: 'Which TWO benefits for library USERS does the speaker link to the extended weekday hours? Choose TWO letters, A–E.',
    selectionCount: 2,
    correctOptionIds: ['A', 'D'],
    options: [
      {id: 'A', text: 'Borrowing books after finishing work at six', judgment: 'supported', quotes: ['People who finish work at six can now borrow books later in the evening.'], reason: '原稿把延长开放与六点下班后仍能借书联系起来；符合 USERS 和 extended weekday hours 的范围。'},
      {id: 'B', text: 'Having extra opening hours at weekends', judgment: 'contradicted', quotes: ['The extra hours do not include weekends, and we have not added more computers.'], reason: 'do not include weekends 明确反驳周末延长；不能把 weekday 的变化推广到所有日子。'},
      {id: 'C', text: 'Using additional public computers', judgment: 'contradicted', quotes: ['The extra hours do not include weekends, and we have not added more computers.'], reason: 'have not added more computers 说明没有增加设备数量；使用时间延长不等于设备数量增加。'},
      {id: 'D', text: 'Staying longer in the quiet study space', judgment: 'supported', quotes: ['Students can stay in a quiet study space until eight instead of leaving at six.'], reason: 'until eight instead of leaving at six 是明确的延长比较；学生作为图书馆用户有更多安静自习时间。'},
      {id: 'E', text: 'Starting work later on the extended days', judgment: 'different-target', quotes: ['Staff start later on these days, so their total working hours remain the same.'], reason: '这是 Staff 的排班变化，不是 USERS 的使用收益。该事实本身是真的，但对象不符合题干。'},
    ],
  },
  hint: '同时核对收益的对象、时间范围和具体变化；“时间增加”不能自动变成“设备增加”。确认每个选择都回答 USERS 的问题。',
});

const reviewA = material({
  id: 'ielts-l02-review-a',
  title: '延迟新题 A · Skills in tonight’s digital workshop',
  stimulus: 'Tonight’s digital workshop is about everyday computer tasks. We will practise attaching a document to an email, creating folders to organise files, and checking whether a message is a scam. The website design course runs next month; it is not part of tonight’s session. Staff, rather than learners, will install any software we use. We do not teach computer repairs in this workshop. You may work at your own pace and ask for help. Please save your practice files before leaving, because the classroom computers are cleared every evening.',
  task: {
    id: 'ielts-l02-review-a-selection',
    prompt: 'Which THREE skills will LEARNERS practise in TONIGHT’S digital workshop? Choose THREE letters, A–F.',
    selectionCount: 3,
    correctOptionIds: ['A', 'C', 'F'],
    options: [
      {id: 'A', text: 'Attaching a document to an email', judgment: 'supported', quotes: ['We will practise attaching a document to an email, creating folders to organise files, and checking whether a message is a scam.'], reason: 'practise attaching a document to an email 明确属于今晚学员练习的技能；不是泛泛提到 email。'},
      {id: 'B', text: 'Designing a website during the session', judgment: 'contradicted', quotes: ['The website design course runs next month; it is not part of tonight’s session.'], reason: 'website design 在下月另一课程，not part of tonight’s session 直接排除本次；只听到 website design 不足以选择。'},
      {id: 'C', text: 'Creating folders to organise files', judgment: 'supported', quotes: ['We will practise attaching a document to an email, creating folders to organise files, and checking whether a message is a scam.'], reason: 'creating folders to organise files 是 practise 后并列的技能，有明确学习安排，不是让电脑自动整理所有文件。'},
      {id: 'D', text: 'Installing the software used in class', judgment: 'different-target', quotes: ['Staff, rather than learners, will install any software we use.'], reason: '安装软件是 Staff 的准备工作，rather than learners 明确区分对象；不是学员今晚练习的技能。'},
      {id: 'E', text: 'Repairing computers', judgment: 'contradicted', quotes: ['We do not teach computer repairs in this workshop.'], reason: 'do not teach computer repairs 明确否定该教学内容；日常电脑任务不等于硬件维修。'},
      {id: 'F', text: 'Checking a message for signs of a scam', judgment: 'supported', quotes: ['We will practise attaching a document to an email, creating folders to organise files, and checking whether a message is a scam.'], reason: 'checking whether a message is a scam 对应检查诈骗迹象；题目是练习检查方法，不能扩大成保证识别所有诈骗。'},
    ],
  },
  hint: '题干同时限定学员、今晚、练习的技能。分别核对不同课程的时间、谁负责动作、是否真是教学内容，再检查选择数。',
});

const reviewB = material({
  id: 'ielts-l02-review-b',
  title: '延迟新题 B · Online evening-tour bookings',
  stimulus: 'For this month’s museum evening tours, two changes affect visitors who book online. You can now change your chosen date without paying a fee, provided you contact us a day ahead. You will also receive a digital map before the tour. Admission itself still costs ten pounds; booking online does not make it free. The printed guidebook is sold separately at the desk. A discount for large groups is being discussed, but it has not been introduced. Our guides attend extra training this month, which is a staff arrangement.',
  task: {
    id: 'ielts-l02-review-b-selection',
    prompt: 'Which TWO benefits are available to visitors who book a museum evening tour ONLINE this month? Choose TWO letters, A–E.',
    selectionCount: 2,
    correctOptionIds: ['B', 'D'],
    options: [
      {id: 'A', text: 'Entering the museum free of charge', judgment: 'contradicted', quotes: ['Admission itself still costs ten pounds; booking online does not make it free.'], reason: '网上预约并不免门票，still costs ten pounds 与 free of charge 矛盾。免费更改日期不等于免费入馆。'},
      {id: 'B', text: 'Changing the tour date free of charge with a day’s notice', judgment: 'supported', quotes: ['You can now change your chosen date without paying a fee, provided you contact us a day ahead.'], reason: 'without paying a fee 支持免费更改日期，但 provided 要求提前一天联系；选项保留该条件，没有扩大成随时无条件改期。'},
      {id: 'C', text: 'Receiving a printed guidebook as part of the booking', judgment: 'contradicted', quotes: ['The printed guidebook is sold separately at the desk.'], reason: 'printed guidebook 要另外购买，不是预约所含；不能把 digital map 的权益换成印刷手册。'},
      {id: 'D', text: 'Receiving a digital map before the tour', judgment: 'supported', quotes: ['You will also receive a digital map before the tour.'], reason: 'receive a digital map before the tour 直接支持该权益；载体是 digital map，时间是导览前。'},
      {id: 'E', text: 'Getting a large-group discount that is already available', judgment: 'contradicted', quotes: ['A discount for large groups is being discussed, but it has not been introduced.'], reason: '仍在讨论，has not been introduced 明确排除已经可用；不能把提议当作当前网上预约的权益。'},
    ],
  },
  hint: '分别核对权益的对象、是否当前可用，以及是否带条件。不要把一项免费的服务推广成所有项目免费；保留原话限定范围。',
});

export const listeningMultiSelectLesson: MultiSelectLesson = {
  id: 'listening-multiple-answers',
  skill: 'listening',
  title: 'Listening · Choose the complete answer set',
  goal: '逐项寻找听觉依据，恰好选出题干要求的两个或三个答案，并说明干扰项为何不成立。',
  variants: ['academic', 'general-training'],
  explanation: [
    '真实多选是一组题选 TWO 或 THREE，不是五个选项里只选一个。先读题干的选择数量、字母范围和问题对象。',
    '每项分别判断：被支持、被反驳、没有说明，还是事实属于另一个对象。相同词出现过，不足以支持整个选项。',
    '同一句可以支持多个正确项；多个地方也可能共同限定一个选项。要核对当前／将来、参与者／工作人员、自带／提供，以及条件和范围。',
    '先看逐项示范，再带着方法做不同情境；独立与限时新组先保留完整首答。查看提示、脚本或重播后的作答要保留辅助条件。',
    '对照证据订正时，说明具体选项漏了哪项限定或误归给谁；未说明的内容不能靠个人常识补成事实。',
    '限时只按本课程建议练习。延迟复验用新材料和新选项集合；原题重做、只记住字母组合或点击完成都不证明掌握。',
  ],
  boundary: '六份虚构原创短听力材料，每份从5或6个选项中选2或3项，练习选择数量、逐项依据和部分干扰类型。语音由设备合成，听感与音质尚待人工核验；播放后请确认实际听到声音。180秒为本站练习建议，不是正式考试单题时限。结果按完整答案组核对，不计算正式考试逐答案位置或部分得分，不代表完整四部分40题听力，也不换算 Band。复习只有两份新材料；提示、原文和重播情况会随作答保留，重复原题不能作为新题复验。完成这些练习仍不足以证明长期保持。',
  model,
  guided,
  independent,
  timed,
  reviews: [reviewA, reviewB],
};
