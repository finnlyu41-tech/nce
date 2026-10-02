import type {SampleLesson, SampleMaterial, SampleQuestion} from '../sample-sequence';

/**
 * L07 micro-course: original fictional form-completion material.
 * Shared by Academic and General Training with the same material IDs.
 * Format source: https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening
 * Content/answer evidence has been checked against these scripts; native TTS audio is not human-reviewed.
 * The time/digit conventions below are explicit local question instructions, not universal IELTS rules.
 */
const field = (id: string, prompt: string, accepted: string[], why: string): SampleQuestion => ({
  id, prompt, accepted, why,
});
const instruction = 'Complete the form. Read the word or number limit beside EACH numbered field. Use information from the recording. Do not repeat units already printed on the form.';
const checklist = [
  '先按栏目辨认姓名、日期、时间、金额或物品，不把相邻字段的信息填错位置。',
  '用最后确认的信息更新被改口的字段；未被更正的字段不跟着改变。',
  '保留录音中的词与拼写；按该题输入限制作答，不添已印出的单位。',
  '核对原答与证据句。日期、金额或拼写错在哪里，要结合原答说明，不能只凭答错就判断错因。',
];
const form = (material: Omit<SampleMaterial, 'instruction' | 'checklist' | 'seconds'>): SampleMaterial => ({
  ...material, instruction, checklist: [...checklist], seconds: 180,
});

const model = form({
  id: 'ielts-l07-model',
  title: '示范 · Repair café booking',
  context: [
    'REPAIR CAFÉ — APPOINTMENT FORM',
    '1. Customer surname: ____________________',
    '2. Appointment day: ____________________',
    '3. Appointment start time (a.m.): ____________________',
    '4. Item to be repaired: ____________________',
  ].join('\n'),
  script: 'Hello, I am checking your booking for the repair café. Your surname is Newton, spelled N, E, W, T, O, N. We originally offered Friday, but the repair team is away then. Your appointment is on Saturday. Please arrive at ten fifteen to sign in. The repair appointment itself starts at ten thirty. You are bringing a lamp, not a laptop. Leave the bulb at home; our volunteer will test the lamp with the centre’s own bulb. There is no booking charge.',
  questions: [
    field('surname', '1. Customer surname — ONE WORD.', ['Newton'], '录音确认“Your surname is Newton, spelled N, E, W, T, O, N.”。Newton 与逐字拼读一致；写 N-E-W-T-O-N 的字母串不是表单要求的姓名拼写，不添加称呼。'),
    field('day', '2. Appointment day — ONE WORD.', ['Saturday'], '“Your appointment is on Saturday.”是最终确认；“We originally offered Friday”只是原计划。只填 Saturday，不填 on Saturday 或 Friday。'),
    field('time', '3. Appointment start time — ONE NUMBER. Use HH:MM digits.', ['10:30'], '“The repair appointment itself starts at ten thirty.”对应10:30；“arrive at ten fifteen to sign in”是签到时间，不是预约开始。本题已印 a.m.，按 HH:MM 输入，不重复单位。'),
    field('item', '4. Item to be repaired — ONE WORD.', ['lamp'], '“You are bringing a lamp, not a laptop.”直接确认 lamp 并否定 laptop；后面 bulb 是中心用于测试的灯泡，不是客户送修物品。保持来源单词，不改写为 light。'),
  ],
  hint: '先读四个栏目：surname 听字母拼读；day 跟到改口后的确认；start time 与 arrive 分开；item 取明确确认的物品，不取测试用品。',
  model: '1 Newton\n2 Saturday\n3 10:30\n4 lamp',
  modelNotes: [
    '听前：四个空分别是一个姓氏、一个星期、一个时间和一个物品词；3题的 a.m. 已在表上。',
    '姓名：用 N, E, W, T, O, N 核对 Newton，不能凭熟悉的姓名猜字母。',
    '改口：Friday 是原计划；Saturday 才是当前预约。只更新 day，不把改口当成所有信息都变了。',
    '时间：10:15 是 arrive / sign in，10:30 是 appointment starts；题干问后者。',
    '物品：lamp 是带来的物品，laptop 被否定，bulb 是中心提供的测试用品。',
    '输入检查：2题写 on Saturday 多一个词；3题只写10:30，不添 a.m.；4题直接取 lamp，不换成意义相近的自造词。',
    '演示答案只在示范与反馈阶段使用。后续新表单先保留自己的首答，再对照证据订正。',
  ],
});

const guided = form({
  id: 'ielts-l07-guided',
  title: '引导 · Cycle safety registration',
  context: [
    'CYCLE SAFETY SESSION — REGISTRATION FORM',
    '1. Participant surname: ____________________',
    '2. Session day: ____________________',
    '3. Registration fee: £ ____________________',
    '4. Equipment to bring: ____________________',
  ].join('\n'),
  script: 'I can register you for the cycle safety session now. Your surname is Wells, W, E, L, L, S. The Friday session has been cancelled, so your place is confirmed for Tuesday. An old poster says fifteen pounds, but this month the registration fee is twelve pounds. Please bring a helmet. We lend lights during the session, so you do not need to bring those. Meet the instructor beside the sports hall, rather than at the bike shop. The session is for adults who already ride.',
  questions: [
    field('surname', '1. Participant surname — ONE WORD.', ['Wells'], '“Your surname is Wells, W, E, L, L, S.”给出完整姓氏和双 L；Wels 少一个字母，不符合实际拼读。只写姓，不增加其他文字。'),
    field('day', '2. Session day — ONE WORD.', ['Tuesday'], '“your place is confirmed for Tuesday”确认 Tuesday；“The Friday session has been cancelled”已取消，不能填写 Friday。'),
    field('fee', '3. Registration fee — ONE NUMBER. Use digits only; £ is already printed.', ['12'], '“this month the registration fee is twelve pounds”是当前费用12；“An old poster says fifteen pounds”是过期价格。按本题用数字，不重复已印出的 £ 或加 pounds。'),
    field('equipment', '4. Equipment to bring — ONE WORD.', ['helmet'], '“Please bring a helmet.”明确要求带 helmet；“We lend lights”说明灯由中心外借，不能把 lights 填成需要带的装备。取来源词，不写 protective hat。'),
  ],
  hint: '先把 surname、day、fee、equipment 各圈出来。拼读可能有重复字母；cancelled 与 old poster 表示旧安排／旧费用；表上已印 £，bring 与 lend 的物品归属不同。',
});

const independent = form({
  id: 'ielts-l07-independent',
  title: '独立新题 · Library volunteer induction',
  context: [
    'LIBRARY VOLUNTEER INDUCTION — REGISTRATION FORM',
    '1. Volunteer surname: ____________________',
    '2. Confirmed shift: ____________________',
    '3. Induction room: ____________________',
    '4. First task: ____________________',
  ].join('\n'),
  script: 'Thank you for volunteering at the library. I have your surname as Morris, M, O, R, R, I, S. You asked about an afternoon shift, but that group is full. Your confirmed shift is morning. The induction was listed in room eight. Actually, it is in room six, because the larger room is being cleaned. Your first task is sorting, not shelving. You will sort the donated books before staff decide where they belong. Please report to reception when you arrive; you do not need a membership card.',
  questions: [
    field('surname', '1. Volunteer surname — ONE WORD.', ['Morris'], '“your surname as Morris, M, O, R, R, I, S”确认 Morris 与双 R。不要漏写一个 R，也不添加 first name 或称呼。'),
    field('shift', '2. Confirmed shift — ONE WORD.', ['morning'], '“Your confirmed shift is morning.”确认 morning；“an afternoon shift”是曾询问且已满的班次，不是此次注册。只填来源词，不加 shift。'),
    field('room', '3. Induction room — ONE NUMBER. Use digits only.', ['6'], '“Actually, it is in room six”把先前“room eight”更正为6。表单已有 room 栏目，不填 room 6；本题指定数字形式。'),
    field('task', '4. First task — ONE WORD.', ['sorting'], '“Your first task is sorting, not shelving.”确认 sorting 并否定 shelving；后一句会 sort books 是说明工作内容，不能擅自把已给出的 sorting 改成 sort。'),
  ],
  hint: '按栏目确认信息类型；区分询问过的班次与最终分配，留意地点更新。任务栏保留录音中明确给出的词形，不凭背景知识改词。',
});

const timed = form({
  id: 'ielts-l07-timed',
  title: '训练用限时 · Community kitchen booking',
  context: [
    'COMMUNITY KITCHEN — INTRODUCTORY SESSION FORM',
    '1. Participant surname: ____________________',
    '2. Session start time (24-hour clock): ____________________',
    '3. Booked meal option: ____________________',
    '4. Clothing to bring: ____________________',
  ].join('\n'),
  script: 'Here are the details for your community kitchen booking. Your surname is Sutton, spelled S, U, T, T, O, N. We planned to begin at two, but the ovens need an extra check. The session will now start at two twenty in the afternoon. The vegetarian meal is booked for you, not the fish meal. Please bring an apron. We provide gloves, so there is no need to pack any. All ingredients are included in your booking. The café next door opens at one, but our kitchen is closed until the session.',
  questions: [
    field('surname', '1. Participant surname — ONE WORD.', ['Sutton'], '“Your surname is Sutton, spelled S, U, T, T, O, N.”给出 Sutton 与双 T；只写完整姓氏，不漏字母。'),
    field('time', '2. Session start time — ONE NUMBER. Use 24-hour HH:MM digits.', ['14:20'], '“The session will now start at two twenty in the afternoon.”确认下午2:20，按表单24小时格式写14:20；“begin at two”是原计划。13:00 是隔壁咖啡馆开门，非本活动开始。'),
    field('meal', '3. Booked meal option — ONE WORD.', ['vegetarian'], '“The vegetarian meal is booked for you, not the fish meal.”确认 vegetarian；fish 已被否定。表单已有 meal option，不加 meal，也不用未出现的 vegan 替换。'),
    field('clothing', '4. Clothing to bring — ONE WORD.', ['apron'], '“Please bring an apron.”是要自带的衣物；“We provide gloves”说明手套由厨房提供。只取 apron，不把 gloves 填进 bring 栏。'),
  ],
  hint: '先读栏目和输入政策，尤其24小时制；更正开始时间不等于更改其他字段。区分 booked、bring 与 provide 所指的信息。',
});

const reviewA = form({
  id: 'ielts-l07-review-a',
  title: '延迟新题 A · Swimming lesson registration',
  context: [
    'SPORTS CENTRE — SWIMMING LESSON FORM',
    '1. Learner surname: ____________________',
    '2. Lesson category: ____________________',
    '3. Entrance to use: ____________________ gate',
    '4. Current lesson fee: £ ____________________',
  ].join('\n'),
  script: 'I am confirming your first swimming lesson at the sports centre. Your surname is Reed, R, E, E, D. You mentioned the family lesson, but you are now registered for the adult lesson. The main gate is closed while work is taking place. Please use the west gate, beside the small car park. The old leaflet gives a price of eight pounds. Our current lesson fee is six pounds, which includes the locker. Towels are not provided, so bring your own. You can pay at reception before the lesson.',
  questions: [
    field('surname', '1. Learner surname — ONE WORD.', ['Reed'], '“Your surname is Reed, R, E, E, D.”确认 Reed 与两个 E；不能按熟悉的近音姓名写成 Reid。'),
    field('category', '2. Lesson category — ONE WORD.', ['adult'], '“you are now registered for the adult lesson”确认 adult；family 是先前提到的课程。表单只要类别，不能再加 lesson。'),
    field('entrance', '3. Entrance to use — ONE WORD. The word gate is already printed.', ['west'], '“Please use the west gate”确认 west；“The main gate is closed”排除 main。gate 已印在空格后，填写 west gate 超出本题一词并重复栏目单位。'),
    field('fee', '4. Current lesson fee — ONE NUMBER. Use digits only; £ is already printed.', ['6'], '“Our current lesson fee is six pounds”是当前费用6；“The old leaflet gives a price of eight pounds.”是旧信息。只填6，不加 £ / pounds，不能从 includes the locker 推出其他费用。'),
  ],
  hint: '先预测栏目类型，再跟到最终注册和当前费用。注意近音姓名的拼读；表单空格后已给出的词不能重复写入。',
});

const reviewB = form({
  id: 'ielts-l07-review-b',
  title: '延迟新题 B · Garden tool loan',
  context: [
    'NEIGHBOURHOOD GARDEN — TOOL LOAN FORM',
    '1. Borrower surname: ____________________',
    '2. Collection day: ____________________',
    '3. Tool reserved: ____________________',
    '4. Maximum loan length: ____________________ days',
  ].join('\n'),
  script: 'I can complete your tool loan form for the neighbourhood garden. Your surname is Patel, P, A, T, E, L. We first suggested Saturday for collection, but the shed lock is being repaired that day. You can collect your tool on Sunday. A spade is reserved for you. The forks are all in use, so none are available. The leaflet says tools may be borrowed for three days. That policy has changed: the maximum loan is now two days. Please clean the tool before returning it to the shed.',
  questions: [
    field('surname', '1. Borrower surname — ONE WORD.', ['Patel'], '“Your surname is Patel, P, A, T, E, L.”确认 Patel；按拼读保留一个 L，不按姓名印象添加字母。'),
    field('day', '2. Collection day — ONE WORD.', ['Sunday'], '“You can collect your tool on Sunday.”确认 Sunday；“first suggested Saturday”已因修锁而更改。只填星期，不加 on。'),
    field('tool', '3. Tool reserved — ONE WORD.', ['spade'], '“A spade is reserved for you.”直接确认 spade；“The forks are all in use”说明叉子不可借。不要改成意思较宽的 tool 或未出现的 shovel。'),
    field('length', '4. Maximum loan length — ONE NUMBER. Use digits only; days is already printed.', ['2'], '“the maximum loan is now two days”给出当前期限2；“The leaflet says tools may be borrowed for three days.”是旧政策。days 已在表上，不能写2 days；本题指定数字。'),
  ],
  hint: '对照 collection、reserved、maximum 各自所问内容；早先建议和旧手册可能被更新。保留物品的来源单词，不用自己熟悉的同义词替代。',
});

export const listeningFormLesson: SampleLesson = {
  id: 'listening-form',
  skill: 'listening',
  title: 'Listening · Complete a booking form',
  goal: '根据最终确认的信息填写姓名、时间、数字和物品字段，遵守每题英文输入限制。',
  explanation: [
    '表单填空把听到的事实放进对应栏目，不是逐句翻译。先看空格旁的 surname、time、fee、item，预判信息类别。',
    '每题先读词数／数字限制。本课的 ONE WORD、ONE NUMBER、HH:MM 和 digits only 是该题明确要求，不代表所有 IELTS 表单都只有同一限制。',
    '姓名靠拼读核对，重复字母也要保留。数字要分清预约开始与签到、当前价格与旧价格；更正后更新对应字段。',
    '答案保留录音中的词，别自行换同义词或词形。空格附近已有 £、gate、days 等内容时，只补缺失部分。',
    '示范展示原文和逐栏依据；引导保留方法。独立、限时和延迟新题使用不同表单，原文与答案默认不展示；查看提示／原文或重播会保留条件记录，不能再当作无辅助首答。',
    '先保留首答，再找证据订正；正确率只是这几项字段的局部表现。延迟复验需满足课程的时间和新材料条件，原题重做不能证明陌生迁移。',
  ],
  boundary: '六份虚构原创表单，每份4题，练习姓名拼写、数字、最终确认和每题输入限制。音频由设备合成，字母拼读与声音质量未经人工核验，不是官方录音或四部分40题完整听力。每份180秒仅为本站训练建议，不是正式考试单题时限；无声或播放失败不能算听过，提示与重播须保留。两份新复验材料用完后，重复原题可以巩固，但不能作为陌生新题的表现。此课不估算 Band，也不足以证明掌握整项题型或长期保持。',
  model,
  guided,
  independent,
  timed,
  reviews: [reviewA, reviewB],
};
