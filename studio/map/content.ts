import { journeyMissions, type JourneyMission } from '../app/ielts-journey-content';
import { blueprintResources } from '../app/ielts-blueprint';
import type { Question } from '../app/model';
declare const __STUDIO_CLASSIC_URL__: string;
export const originalSite = typeof __STUDIO_CLASSIC_URL__ === 'string' ? __STUDIO_CLASSIC_URL__ : '/';
export const resources = blueprintResources;
export type Stage = 'starter' | 'foundation' | 'bridge' | 'skills' | 'summit';
export type MapNode = {
    id: string;
    title: string;
    subtitle: string;
    kind: 'lesson' | 'checkpoint' | 'task' | 'mock' | 'finish';
    stage: Stage;
    lane?: string;
    requires: string[];
    mission?: JourneyMission;
    members?: string[];
    minutes: number;
};
export const stages: {
    id: Stage;
    title: string;
    description: string;
    eyebrow: string;
}[] = [
    { id: 'starter', title: '从第一句话开始', description: '认物品，介绍自己，完成简单问答。', eyebrow: '01 · FIRST WORDS' },
    { id: 'foundation', title: '把日常说清楚', description: '把动作放进现在、过去和未来。', eyebrow: '02 · EVERYDAY ENGLISH' },
    { id: 'bridge', title: '从句子，到一段话', description: '用顺序、原因和对比，连接自己的想法。', eyebrow: '03 · CONNECT IDEAS' },
    { id: 'skills', title: '四条路，同一个目标', description: '听、读、写、说分别推进；四条分支通过后汇合。', eyebrow: '04 · BUILD YOUR SKILLS' },
    { id: 'summit', title: '让完整表现，抵达 6.5', description: '用两套新试卷验证准备度，再记录正式成绩。', eyebrow: '05 · THE SUMMIT' },
];
export const lanes = [{ id: 'listening', title: '听力', en: 'LISTENING', color: '#27857e' }, { id: 'reading', title: '阅读', en: 'READING', color: '#597cc3' }, { id: 'writing', title: '写作', en: 'WRITING', color: '#b47c46' }, { id: 'speaking', title: '口语', en: 'SPEAKING', color: '#916da8' }];
export const nodes: MapNode[] = [];
let previous: string[] = [];
for (const stage of ['starter', 'foundation', 'bridge'] as const) {
    const missions = journeyMissions.filter(m => m.stage === stage);
    for (const m of missions) {
        nodes.push({ id: m.id, title: m.title, subtitle: m.outcome, kind: 'lesson', stage, requires: previous, mission: m, minutes: m.minutes });
        previous = [m.id];
    }
    const id = `gate-${stage}`;
    nodes.push({ id, title: stage === 'starter' ? '第一句话 · 小关卡' : stage === 'foundation' ? '日常表达 · 小关卡' : '连接想法 · 小关卡', subtitle: '换一组题，独立检验这一段路。', kind: 'checkpoint', stage, requires: previous, members: missions.map(m => m.id), minutes: 8 });
    previous = [id];
}
const exits: string[] = [];
for (const lane of lanes) {
    let requires = previous;
    for (const m of journeyMissions.filter(m => m.stage === lane.id)) {
        nodes.push({ id: m.id, title: m.title, subtitle: m.outcome, kind: m.mini ? 'lesson' : 'task', stage: 'skills', lane: lane.id, requires, mission: m, minutes: m.minutes });
        requires = [m.id];
    }
    exits.push(...requires);
}
nodes.push({ id: 'mock-one', title: '第一套完整模考', subtitle: '四项放到一起，找到仍需修补的地方。', kind: 'mock', stage: 'summit', requires: exits, minutes: 180 }, { id: 'mock-two', title: '第二套新题复验', subtitle: '另一套没做过的 Academic 完整试卷。', kind: 'mock', stage: 'summit', requires: ['mock-one'], minutes: 180 }, { id: 'finish', title: 'IELTS 6.5', subtitle: '准备就绪，再用正式成绩确认抵达。', kind: 'finish', stage: 'summit', requires: ['mock-two'], minutes: 0 });
export const nodeById = (id: string) => nodes.find(n => n.id === id);
const q = (prompt: string, answer: string, explanation: string): Question => ({ id: prompt, type: 'input', prompt, answer, explanation });
// A second set prevents the correction from becoming the very next test answer.
const alternate: Record<string, [
    string,
    string,
    string
][]> = {
    first: [['补全“这是我的书”：This is my ____.', 'book', 'book 是书。'], ['补全“这是我的笔”：This is my ____.', 'pen', 'pen 是笔。'], ['补全“这是我的包”：This is my ____.', 'bag', 'bag 是包。']],
    question: [['把 This is your pen. 变成问句，填句首：____ this your pen?', 'Is', 'Is 提到句首。'], ['肯定回答：Is this your bag? Yes, it ____.', 'is', 'Yes, it is.'], ['否定回答：Is this your book? ____, it is not.', 'No', 'No, it is not.']],
    myself: [['介绍自己：I ____ a teacher.', 'am', 'I 与 am 搭配。'], ['说两个人：They ____ students.', 'are', 'They 与 are 搭配。'], ['介绍一个人：He ____ a student.', 'is', 'He 与 is 搭配。']],
    whose: [['对朋友说“这是你的书”：This is ____ book.', 'your', 'your 是你的。'], ['说自己的笔：This is ____ pen.', 'my', 'my 是我的。'], ['问对方“这是你的包吗”：Is this ____ bag?', 'your', '提问对象是对方，用 your。']],
    'more-than-one': [['book 变复数：four ____.', 'books', '规则复数加 s。'], ['bag 变复数：two ____.', 'bags', '规则复数加 s。'], ['pen 变复数：five ____.', 'pens', '规则复数加 s。']],
    where: [['包在书桌表面上：The bag is ____ the desk.', 'on', '表面上用 on。'], ['书在包内部：The book is ____ the bag.', 'in', '内部用 in。'], ['笔在椅子表面上：The pen is ____ the chair.', 'on', '表面上用 on。']],
    daily: [['用 read 完成：He ____ every morning.', 'reads', '第三人称单数一般现在时用 reads。'], ['用 work 完成：They ____ every day.', 'work', 'They 后用 work。'], ['用 walk 完成：She ____ to work every day.', 'walks', 'She 后用 walks。']],
    'daily-question': [['____ she read every day?', 'Does', 'She 的一般现在时问句用 Does。'], ['____ they work here?', 'Do', 'They 用 Do。'], ['用 work 完成：Does he ____ here?', 'work', 'Does 后用原形。']],
    not: [['He ____ not like coffee.', 'does', 'He 用 does not。'], ['They ____ not work here.', 'do', 'They 用 do not。'], ['把“是”改成“不是”：She is ____ a teacher.', 'not', 'is 后加 not。']],
    can: [['用 walk 完成：He can ____ to work.', 'walk', 'can 后用原形。'], ['把句子变成问句：____ she read?', 'Can', 'Can 提到句首。'], ['用 work 完成：They can ____ here.', 'work', 'can 后用原形。']],
    now: [['用 work 完成：They are ____ now.', 'working', '现在进行时用 working。'], ['He ____ reading now.', 'is', 'He 与 is 搭配。'], ['We ____ working now.', 'are', 'We 与 are 搭配。']],
    yesterday: [['用 work 完成：We ____ yesterday.', 'worked', '明确过去时间，用 worked。'], ['用 visit 完成：He ____ the park last week.', 'visited', '规则过去式 visited。'], ['用 walk 完成：She ____ home yesterday.', 'walked', 'walk 的过去式是 walked。']],
    tomorrow: [['They ____ going to read tomorrow.', 'are', 'They 与 are 搭配。'], ['用 visit 完成：I am going to ____ the park.', 'visit', 'going to 后用原形。'], ['He ____ going to work tomorrow.', 'is', 'He 与 is 搭配。']],
    experience: [['用 visit 完成：We have ____ London.', 'visited', 'have 后用过去分词。'], ['He ____ visited the park.', 'has', 'He 与 has 搭配。'], ['用 visit 完成：She ____ London last year.', 'visited', '明确过去时间用过去式。']],
    compare: [['用 small 完成：My bag is ____ than yours.', 'smaller', 'small 的比较级是 smaller。'], ['用 large 完成：That room is ____ than this one.', 'larger', 'large 的比较级是 larger。'], ['This pen is smaller ____ that one.', 'than', 'than 连接比较对象。']],
    reason: [['因为房间大，所以我喜欢它：I like the room ____ it is large.', 'because', 'because 引出原因。'], ['因为下雨，他留在家里：He stays home ____ it is raining.', 'because', 'because 连接原因。'], ['因为有趣，我们阅读：We read ____ it is fun.', 'because', 'because 后说为什么。']],
    sequence: [['先打开包，然后拿书：____, I opened the bag. Then, I took out the book.', 'First', 'First 是首先。'], ['先步行，然后休息：First, we walked. ____, we rested.', 'Then', 'Then 是然后。'], ['先读书，然后做饭：First, I read. ____, I cooked.', 'Then', 'Then 引出下一件事。']],
    contrast: [['房间很大，但是很吵：The room is large, ____ it is noisy.', 'but', 'but 引出不同角度。'], ['她喜欢茶，但是不喜欢咖啡：She likes tea, ____ she does not like coffee.', 'but', 'but 表示转折。'], ['包很旧，但是很结实：The bag is old, ____ it is strong.', 'but', 'but 连接对照。']],
    'long-sentence': [['The house that they bought is old. 房子怎样？只写英文形容词。', 'old', '主干是 The house is old.'], ['The book that he reads is interesting. 书怎样？只写英文形容词。', 'interesting', '主干是 The book is interesting.'], ['The bag that I use is blue. 包是什么颜色？', 'blue', '主干是 The bag is blue.']],
    paragraph: [['Amy goes to school by train. It takes thirty minutes. 她用哪种交通工具？', 'train', '证据是 by train。'], ['Sam reads for fifteen minutes every evening. 他读多久？只填英文数字词。', 'fifteen', '证据是 fifteen minutes。'], ['The park is small. I like it because it is peaceful. 我喜欢它的什么特点？只填英文形容词。', 'peaceful', 'because 后是原因。']],
    'hear-correction': [['“Monday—sorry, Friday.” 最后确认哪天？', 'Friday', 'sorry 之后修正为 Friday。'], ['“Room 30? No, room 13.” 最终房间号？', '13', 'No 后面才是最终号码。'], ['“At eight—actually, at eleven.” 最后几点？填英文数字词。', 'eleven', 'actually 后修正为 eleven。']],
    'read-evidence': [['原文：The train leaves at ten. 题干：The train leaves at nine. 填 True / False / Not Given。', 'False', '时间与原文矛盾。'], ['原文：The shop opens on Sunday. 题干：The shop sells books. 填 True / False / Not Given。', 'Not Given', '没有提到商品。'], ['原文：The bus is red. 题干：The bus is red. 填 True / False / Not Given。', 'True', '与原文一致。']],
    'write-reason': [['把观点与原因相连：Libraries help students ____ they offer a quiet place to study.', 'because', 'because 引出相关的原因。'], ['引出例子：For ____, students can read reference books there.', 'example', 'For example 引出例子。'], ['把阅读与益处相连：Reading is useful ____ we can learn new things.', 'because', '理由要支持前面的观点。']],
    'write-overview': [['Visitors dropped from 200 to 100. 填 rose 或 fell。', 'fell', '数量下降。'], ['A increased. B stayed the same. B changed or remained unchanged? 填 changed 或 unchanged。', 'unchanged', 'B 保持不变。'], ['A fell, ____ B rose. 用一个词表示对比。', 'while', 'while 连接相反趋势。']],
    'speak-detail': [['Do you enjoy reading? 想表达肯定，先填一个词：____, I do.', 'Yes', '先直接回答。'], ['I like walking ____ it helps me relax. 填表示原因的词。', 'because', 'because 补充理由。'], ['“我晚饭后阅读”：I read ____ dinner.', 'after', 'after dinner 交代时间。']],
};
export function questionsFor(node: MapNode, round = 0): Question[] {
    if (node.kind === 'checkpoint')
        return (node.members || []).filter((_, i) => i % 2 === round % 2).flatMap(id => { const n = nodeById(id)!; return questionsFor(n, round).slice(0, 2); });
    const mini = node.mission?.mini;
    if (!mini)
        return [];
    const bank = alternate[node.id];
    if (round % 2 && bank)
        return bank.map(x => q(...x));
    if (node.id === 'first')
        return [q('这是我的包：This is my ____.', 'bag', 'bag 是包。'), q('这是我的书：This is my ____.', 'book', 'book 是书。'), q('这是我的笔：This is my ____.', 'pen', 'pen 是笔。')];
    return mini.checks;
}
export function courseUrl(node: MapNode) {
    const c = node.mission?.course;
    if (c)
        return `${originalSite}#/nce/${c.book}/${c.lesson}?tab=grammar&goal=${c.goal}`;
    const c2 = node.mission?.assignment?.course?.route;
    if (c2)
        return `${originalSite}#/${c2.view}${c2.book ? `/${c2.book}/${c2.lesson || 1}` : ''}?${new URLSearchParams(Object.entries({ tab: c2.tab, task: c2.task }).filter(([, v]) => v) as [
            string,
            string
        ][]).toString()}`;
    return `${originalSite}#/nce/NCE1/1?tab=listen`;
}
