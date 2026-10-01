import type {MultiSelectLesson, MultiSelectMaterial} from './types';

const model: MultiSelectMaterial = {
  id: 'ielts-r02-gt-model',
  title: '示范 · 周末图书馆志愿者',
  stimulus: `Weekend volunteers at Eastfield Library

Thank you for joining our weekend team. During their first month, all new volunteers must attend a short induction with the librarian. Sessions run on either Friday afternoon or Saturday morning, so choose the one that suits you. You will help visitors find the children's activity room and put returned board games on the correct shelf. After each shift, please record the activities you helped with in the shared notebook; this helps us plan future sessions. We supply all craft materials, and volunteers do not pay for them. Changes to the book catalogue are handled by qualified library staff, rather than volunteers. Once you have completed your first month, you may ask to join the storytelling team. That team receives separate training. A coordinator will answer practical questions at the induction.`,
  task: {
    id: 'ielts-r02-gt-model-selection',
    prompt: 'Choose TWO letters, A–E. Which TWO actions are required of all new weekend volunteers during their first month?',
    selectionCount: 2,
    options: [
      {id: 'A', text: 'Attend an introductory session.', judgment: 'supported', quotes: ['all new volunteers must attend a short induction with the librarian.'], reason: 'induction 是入职介绍活动；must 明确规定所有新志愿者都要参加，对应 introductory session。'},
      {id: 'B', text: 'Contribute money towards craft supplies.', judgment: 'contradicted', quotes: ['We supply all craft materials, and volunteers do not pay for them.'], reason: '原文明确由图书馆提供材料，志愿者不付款；选项要求出钱，与原文相反。'},
      {id: 'C', text: 'Make changes to the library catalogue.', judgment: 'different-target', quotes: ['Changes to the book catalogue are handled by qualified library staff, rather than volunteers.'], reason: '修改目录确实被提到，但执行者是合资格的馆员，题目问新志愿者，不能把其他人的职责选入。'},
      {id: 'D', text: 'Keep a written record of their work after each shift.', judgment: 'supported', quotes: ['After each shift, please record the activities you helped with in the shared notebook; this helps us plan future sessions.'], reason: 'record the activities 与 written record of their work 是同义改写；After each shift 也准确保留了记录时间。'},
      {id: 'E', text: 'Provide two references before starting.', judgment: 'not-stated', quotes: [], reason: '原文没有推荐人或推荐信要求；即使某些机构通常要求推荐信，也不能补进这篇通知。'},
    ],
    correctOptionIds: ['A', 'D'],
  },
  hint: '先标出题干中的人数范围和时间范围，再把每项与原文中的执行者、要求程度及时间对齐。只找到同一个名词不够。',
  checklist: ['确认题干要求两个答案。', '核对每项是否适用于所有新志愿者及首月。', '提交完整字母组，并能指出每个所选项的依据。'],
  seconds: 180,
  modelNotes: ['先把 all new volunteers 与 during their first month 当成筛选条件。', '分别核对每个选项；其他岗位的工作与没有写出的规定都不能代替文本支持。'],
};

const guided: MultiSelectMaterial = {
  id: 'ielts-r02-gt-guided',
  title: '引导 · 自行车俱乐部会员权益',
  stimulus: `Riverside Cycle Club: annual membership

Annual membership costs forty pounds and includes several services. Members can take a portable pump from the reception desk without paying a hire fee, provided it is returned that evening. They may also reserve a commuter bike up to two days before they need it; visitors without annual membership can book only on the day. The club runs an evening repair demonstration on the first Thursday of every month. Admission is included in membership, although everyone must reserve a seat because the workshop is small. Helmets are available for a separate rental charge. All borrowed bikes must be back by six o'clock; paying for membership does not extend this deadline. The reception desk closes at six thirty. Annual members receive a monthly email with the timetable and details of any changes to opening hours.`,
  task: {
    id: 'ielts-r02-gt-guided-selection',
    prompt: 'Choose THREE letters, A–F. Which THREE benefits are included in annual membership of Riverside Cycle Club?',
    selectionCount: 3,
    options: [
      {id: 'A', text: 'Use of a helmet at no extra cost.', judgment: 'contradicted', quotes: ['Helmets are available for a separate rental charge.'], reason: '头盔需另付租金，所以不属于年费包含的免费权益。'},
      {id: 'B', text: 'Borrowing a pump without a rental fee.', judgment: 'supported', quotes: ['Members can take a portable pump from the reception desk without paying a hire fee, provided it is returned that evening.'], reason: 'without paying a hire fee 对应 without a rental fee；当天归还的条件仍然适用，但不改变该权益被包含的事实。'},
      {id: 'C', text: 'Returning a borrowed bike later than the usual deadline.', judgment: 'contradicted', quotes: ["All borrowed bikes must be back by six o'clock; paying for membership does not extend this deadline."], reason: '原文明说年费不会延长还车期限；不能从付费会员身份推断可晚还。'},
      {id: 'D', text: 'Booking a commuter bike in advance.', judgment: 'supported', quotes: ['They may also reserve a commuter bike up to two days before they need it; visitors without annual membership can book only on the day.'], reason: 'reserve 与 booking 对应；提前最多两天预约，是年会员与非会员当天预约的差别。'},
      {id: 'E', text: 'Insurance against theft of every borrowed bike.', judgment: 'not-stated', quotes: [], reason: '通知没有写失窃保险或保障范围；会员年费的存在不能证明任何保险被包含。'},
      {id: 'F', text: 'Admission to the monthly evening repair demonstration.', judgment: 'supported', quotes: ['The club runs an evening repair demonstration on the first Thursday of every month.', 'Admission is included in membership, although everyone must reserve a seat because the workshop is small.'], reason: '两句合起来确定活动每月举行，会员费包含入场；预约座位是条件，不是另付入场费。'},
    ],
    correctOptionIds: ['B', 'D', 'F'],
  },
  hint: '给每项权益找独立证据，同时检查费用、预约与截止时间。带条件的权益仍可能符合题干，但不能把条件擅自删去。',
  checklist: ['本组需要三个答案。', '把包含的费用与另付费用区分开。', '核对条件后提交完整字母组。'],
  seconds: 180,
  modelNotes: ['included 问的是年费提供的权益，不代表所有俱乐部服务都免费。', '把预约条件与收费条件分别阅读，避免用一个条件否定另一个明确权益。'],
};

const independent: MultiSelectMaterial = {
  id: 'ielts-r02-gt-independent',
  title: '独立 · 新任组长培训申请',
  stimulus: `Applying for the New Team Leaders course

The course is open to anyone who will lead a team during the next six months, including staff on temporary contracts. Applicants do not need previous experience as a supervisor. To apply, complete the online availability form so that we can place you in a suitable training group. Before sending the form, ask your line manager to approve your attendance; the training office needs that approval with every application. You can choose morning or afternoon classes, but each group follows the same programme. Laptops are provided in the training room, so participants should not buy one for the course. The office will confirm places by email next Friday. If the course is full, applicants will be offered the next start date. Please contact the training office if you need help using the application website.`,
  task: {
    id: 'ielts-r02-gt-independent-selection',
    prompt: 'Choose TWO letters, A–E. Which TWO things are required when applying for the New Team Leaders course?',
    selectionCount: 2,
    options: [
      {id: 'A', text: 'A permanent employment contract.', judgment: 'contradicted', quotes: ['The course is open to anyone who will lead a team during the next six months, including staff on temporary contracts.'], reason: '临时合同员工也可申请，所以永久合同不是必需资格。'},
      {id: 'B', text: 'An online form showing when the applicant is available.', judgment: 'supported', quotes: ['To apply, complete the online availability form so that we can place you in a suitable training group.'], reason: 'online availability form 就是在线说明可参加时间的表格；To apply 明确把它列为申请步骤。'},
      {id: 'C', text: 'Experience of supervising a team in the past.', judgment: 'contradicted', quotes: ['Applicants do not need previous experience as a supervisor.'], reason: '原文明确不要求过去的主管经验；选项把被免除的条件变成要求。'},
      {id: 'D', text: 'A laptop purchased specifically for the course.', judgment: 'contradicted', quotes: ['Laptops are provided in the training room, so participants should not buy one for the course.'], reason: '培训室提供电脑，并明确不应为本课程购置，不能将购买电脑选作申请要求。'},
      {id: 'E', text: 'Permission from the applicant’s line manager.', judgment: 'supported', quotes: ['Before sending the form, ask your line manager to approve your attendance; the training office needs that approval with every application.'], reason: 'approve your attendance 对应 permission；with every application 确认经理同意是每份申请都要包含的要求。'},
    ],
    correctOptionIds: ['B', 'E'],
  },
  hint: '先区分申请要求、可选安排和明确不需要的条件。逐项核对肯定或否定表达，并保留题干所问的申请阶段。',
  checklist: ['需要两个答案，不能只提交其中一个。', '对每项检查 must、need、do not need 等含义。', '不凭培训课程的常见做法补充要求。'],
  seconds: 180,
  modelNotes: ['open to 与 including 可以证明资格范围；do not need 排除了错误门槛。', '申请阶段与开课后提供的设施不同，要按题干筛选。'],
};

const timed: MultiSelectMaterial = {
  id: 'ielts-r02-gt-timed',
  title: '限时 · 社区节入口岗位',
  stimulus: `Instructions for entrance stewards

The entrance team will welcome visitors to Saturday's community festival. One steward should keep a running total of people entering, using the counter provided. Another should look at the date on each ticket, as tickets for Friday's concert are not valid on Saturday. Families who arrive with pushchairs should be directed to the marked parking area beside the entrance before they join the main activities. A separate ticket-desk team takes payments from visitors who have not booked. Entrance stewards must not handle cash. Security officers are responsible for bag checks, and stewards should refer any concern to them rather than search a bag themselves. The site manager will bring drinking water to the entrance at regular intervals. At busy times, team members may swap between the three entrance duties after telling their team leader.`,
  task: {
    id: 'ielts-r02-gt-timed-selection',
    prompt: 'Choose THREE letters, A–F. Which THREE duties belong to the entrance stewards at the community festival?',
    selectionCount: 3,
    options: [
      {id: 'A', text: 'Maintain a count of arriving visitors.', judgment: 'supported', quotes: ['One steward should keep a running total of people entering, using the counter provided.'], reason: 'keep a running total 与 maintain a count 同义；该工作明确交给入口志愿者。'},
      {id: 'B', text: 'Collect payment from visitors without advance tickets.', judgment: 'different-target', quotes: ['A separate ticket-desk team takes payments from visitors who have not booked.', 'Entrance stewards must not handle cash.'], reason: '收费属于另一支售票台队伍，入口人员还被明确禁止处理现金；不能因都是节日工作人员就混用职责。'},
      {id: 'C', text: 'Check that tickets are for the correct day.', judgment: 'supported', quotes: ["Another should look at the date on each ticket, as tickets for Friday's concert are not valid on Saturday."], reason: '检查票面日期是为了确认星期六可用，对应 correct day，属于入口团队的职责。'},
      {id: 'D', text: 'Inspect the contents of visitors’ bags.', judgment: 'different-target', quotes: ['Security officers are responsible for bag checks, and stewards should refer any concern to them rather than search a bag themselves.'], reason: '检查包内物品属于保安职责；入口人员发现问题后转交保安，不能自己搜包。'},
      {id: 'E', text: 'Guide families with pushchairs to a designated parking area.', judgment: 'supported', quotes: ['Families who arrive with pushchairs should be directed to the marked parking area beside the entrance before they join the main activities.'], reason: 'directed to the marked parking area 与 guide ... to a designated parking area 同义；该指引写在入口人员说明中。'},
      {id: 'F', text: 'Write a report after the festival has ended.', judgment: 'not-stated', quotes: [], reason: '原文没有节后报告要求。现场计数与节后写报告不是同一件事，不能把前者扩大成后者。'},
    ],
    correctOptionIds: ['A', 'C', 'E'],
  },
  hint: '把每个动作与负责的队伍连起来，再检查选项是否改变了动作。不要只因活动中出现过某项工作就把它归给题干指定的人。',
  checklist: ['本组需选择三个答案。', '核对执行者，区分入口、售票台和保安。', '在180秒本站练习时间内提交完整字母组。'],
  seconds: 180,
  modelNotes: ['同一通知中会出现多组人员，题目只问其中一组。', '同义表达可以保留原动作，但由谁完成是不可忽略的限制。'],
};

const reviewA: MultiSelectMaterial = {
  id: 'ielts-r02-gt-review-a',
  title: '延迟新材料 A · 公寓维修安排变化',
  stimulus: `Changes to repair requests from this month

Residents of Willow Court have used our online repair form since last spring. Continue to use that form for non-urgent problems. From this month, each request will be given a reference number, allowing residents to follow its progress on the building website. We are also adding a weekly Wednesday phone session from seven to eight in the evening for residents who cannot call during working hours. Daytime office hours remain the same. For emergencies, the twenty-four-hour number printed inside the main entrance is unchanged; do not wait for the Wednesday session. The building manager still chooses the contractor for each job, so residents should not arrange a repair company themselves. A printed copy of the revised contact list is available from reception. Please keep it somewhere accessible at home.`,
  task: {
    id: 'ielts-r02-gt-review-a-selection',
    prompt: 'Choose TWO letters, A–E. Which TWO changes to the repair service are being introduced this month?',
    selectionCount: 2,
    options: [
      {id: 'A', text: 'An online form for reporting non-urgent repairs.', judgment: 'different-target', quotes: ['Residents of Willow Court have used our online repair form since last spring.', 'Continue to use that form for non-urgent problems.'], reason: '网上表格确实存在，但去年春天就已使用，是继续实行的安排，不是本月新变化。'},
      {id: 'B', text: 'An emergency number available at any time of day.', judgment: 'different-target', quotes: ['For emergencies, the twenty-four-hour number printed inside the main entrance is unchanged; do not wait for the Wednesday session.'], reason: '二十四小时紧急号码没有改变；题干只问本月引入的变化，不能把已有服务选入。'},
      {id: 'C', text: 'A way to track a repair request using its reference number.', judgment: 'supported', quotes: ['From this month, each request will be given a reference number, allowing residents to follow its progress on the building website.'], reason: 'From this month 标明新安排；follow its progress 对应 track a repair request，依靠新编号追踪进度。'},
      {id: 'D', text: 'Permission for residents to select their own repair company.', judgment: 'contradicted', quotes: ['The building manager still chooses the contractor for each job, so residents should not arrange a repair company themselves.'], reason: '承包商仍由管理者选择，住户不应自行安排；选项与原文相反。'},
      {id: 'E', text: 'A weekly opportunity to telephone in the evening.', judgment: 'supported', quotes: ['We are also adding a weekly Wednesday phone session from seven to eight in the evening for residents who cannot call during working hours.'], reason: 'adding 说明新增安排；weekly Wednesday 明确每周三，evening 明确晚间，均符合选项。'},
    ],
    correctOptionIds: ['C', 'E'],
  },
  hint: '将文中的时间信号与每项安排一起读。先确认它是新增、持续还是未改变，再判断是否符合题干所问的本月变化。',
  checklist: ['选择两个答案。', '同时核对安排本身与开始时间。', '说明为什么未被选中的真实信息仍可能不符合题干。'],
  seconds: 180,
  modelNotes: ['一项信息在原文中为真，仍可能因时间范围不同而不是答案。', 'from this month、adding、continue 与 unchanged 的作用需要分别核对。'],
};

const reviewB: MultiSelectMaterial = {
  id: 'ielts-r02-gt-review-b',
  title: '延迟新材料 B · 居民园艺废物投放',
  stimulus: `Garden waste at the Northbank Recycling Yard

Local residents may bring garden waste to the yard on weekday afternoons without making an appointment. Show your annual resident pass at the gate; the pass is required even if you visit only once. Leaves and small branches must go into separate marked heaps so that they can be processed differently. Staff can point out the correct heap, but visitors should empty their own bags. Food scraps belong in the household food-waste collection and cannot be left with garden waste here. The resident pass is for waste from your own home. Commercial gardeners must use the business entrance and pay the business rate, even when they hold a resident pass. Please leave large tree trunks at home and ask reception for advice about another disposal site. The yard closes at five o'clock.`,
  task: {
    id: 'ielts-r02-gt-review-b-selection',
    prompt: 'Choose TWO letters, A–E. Which TWO statements about garden waste at Northbank Recycling Yard are correct?',
    selectionCount: 2,
    options: [
      {id: 'A', text: 'Residents need their annual pass when bringing garden waste.', judgment: 'supported', quotes: ['Show your annual resident pass at the gate; the pass is required even if you visit only once.'], reason: '原文明确 pass is required，连只来一次也适用，对应居民投放园艺废物需带年卡。'},
      {id: 'B', text: 'Food scraps may be mixed with garden waste at the yard.', judgment: 'contradicted', quotes: ['Food scraps belong in the household food-waste collection and cannot be left with garden waste here.'], reason: '食物残渣不能与园艺废物放在这里；选项允许混放，与 cannot 相反。'},
      {id: 'C', text: 'Leaves and small branches have different designated places.', judgment: 'supported', quotes: ['Leaves and small branches must go into separate marked heaps so that they can be processed differently.'], reason: 'separate marked heaps 对应 different designated places；两种园艺废物需分别投放。'},
      {id: 'D', text: 'Commercial gardeners can use a resident pass instead of paying the business rate.', judgment: 'contradicted', quotes: ['Commercial gardeners must use the business entrance and pay the business rate, even when they hold a resident pass.'], reason: '商业园丁即使持居民卡仍须付商业费率；选项错误地把持卡变成免缴依据。'},
      {id: 'E', text: 'Pass holders receive free collection of garden waste from home.', judgment: 'not-stated', quotes: [], reason: '本文说明到回收场自行投放的规则，没有说持卡居民享有免费上门收集；不能把到场服务扩展为上门服务。'},
    ],
    correctOptionIds: ['A', 'C'],
  },
  hint: '逐项检查废物种类、到场人员和服务地点。特别留意即使、必须和禁止等限制，不要把一种服务扩展成另一种。',
  checklist: ['需要两个答案。', '为每个所选项找到原文依据。', '不把居民、商业园丁或到场服务混为一谈。'],
  seconds: 180,
  modelNotes: ['限定条件 even when 可阻止把持卡身份理解为对商业规定的豁免。', '废物类别与服务方式是两条不同的范围限制。'],
};

export const generalMultiSelectLesson: MultiSelectLesson = {
  id: 'reading-multiple-answers',
  skill: 'reading',
  title: 'General Training 阅读 · 多选完整答案组',
  goal: '按明确的选择数量逐项核对文本证据，区分同义改写、相反信息、未提及内容与不符合题干范围的信息。',
  explanation: [
    '先读英文题干，确认选择 TWO 还是 THREE，并标明题目所问的人物、职责、条件与时间。多选需要提交完整答案组，不能只挑最有把握的一项。',
    '对每个选项找文本支持。正确选项可能使用同义改写；提到相同词语，或者在生活中常见，都不能单独证明选项正确。',
    '排除时说明依据：与原文相反、原文没有说明，或信息确实存在却属于其他人物、时间或题目对象。这些是本站解释标签，提交时仍只按题干选择字母。',
    '本课用六份原创短材料练习一组完整多选。先看示范，再做引导、独立与本站限时练习，反馈后使用两份不同的延迟材料复习。',
  ],
  boundary: '本站原创短材料使用180秒教学练习时间。现有课程投影以完整字母组文本输入核对一组答案；不把单项选项控件当作多选，不提供官方逐空或部分得分，也不折算 IELTS Band。它不替代完整 General Training 阅读考试、官方测评或人工核验。',
  variants: ['general-training'],
  model,
  guided,
  independent,
  timed,
  reviews: [reviewA, reviewB],
};
