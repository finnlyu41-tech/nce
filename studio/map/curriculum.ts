import data from './curriculum.json';
import {grammarEntryFor, grammarGuidesFor} from '../app/textbook-grammar';
import type {Question, NceBookId} from '../app/model';

export type Clip = {book: NceBookId; lesson: number; start: number; end: number};
export type MapQuestion = Question & {mode?: 'listen' | 'order'; clip?: Clip};
export type StarterBank = 'starter-v2';
type StarterLine = {en:string;zh:string;clip?:Clip};
export type Unit = {id: string; book: 'NCE1' | 'NCE2'; lesson: number; lastLesson: number; title: string; sourceSha256: string; rows: {en: string; zh: string; start: number; end: number}[]};
export const units = data as Unit[];
export const unitById = (id: string) => units.find(u => u.id === id);
export const sourceLabel = (u: Unit) => `新概念${u.book === 'NCE1' ? '一' : '二'}册 · 第 ${u.lesson}${u.lastLesson !== u.lesson ? `–${u.lastLesson}` : ''} 课`;
export const guidesFor = (u: Unit) => grammarGuidesFor(grammarEntryFor(u.book, u.lesson)!);
// A narrow first-chapter bridge into the existing, fuller grammar explanations.
export const firstChapterFocus:Record<number,{idea:string;en:string;zh:string;prompt:string;answer:string}>={
  1:{idea:'先把一句问话记成一个整体。this 是“这个”，your 是“你的”，handbag 是“手提包”。Is 放在前面，表示问“是不是”。',en:'Is this your handbag? — Yes, it is.',zh:'这是你的手提包吗？——是的。',prompt:'把 handbag 换成 book（书），问“这是你的书吗？”',answer:'Is this your book?'},
  3:{idea:'my 是“我的”，your 是“你的”。句子里加 not，就变成“不是”。',en:'This is not my umbrella.',zh:'这不是我的伞。',prompt:'把 umbrella 换成 coat（大衣），说“这不是我的大衣”。',answer:'This is not my coat.'},
  5:{idea:'I 是“我”，he 是“他”，she 是“她”。介绍一个人时可以先用 This is…。',en:'This is Sophie. She is French.',zh:'这是索菲。她是法国人。',prompt:'用给出的名字介绍一位朋友：“这是 Tom。”',answer:'This is Tom.'},
  7:{idea:'说自己用 I am；问对方用 Are you。a teacher 指“一位老师”。',en:'Are you a teacher? — No, I am not.',zh:'你是老师吗？——不是。',prompt:'用 a student（学生）说“我是一名学生”。',answer:'I am a student.'},
  9:{idea:'How are you? 用来问近况。fine 表示“很好”；不要把每个词单独翻译后拼起来。',en:'How are you? — I am fine.',zh:'你好吗？——我很好。',prompt:'用 fine 回答“你好吗？”',answer:'I am fine.'},
  11:{idea:'Whose 表示“谁的”。问归属，再用 my（我的）或 your（你的）回答。',en:'Whose shirt is this? — It is my shirt.',zh:'这是谁的衬衫？——是我的。',prompt:'用 bag（包）问“这是谁的包？”',answer:'Whose bag is this?'},
  13:{idea:'What colour 用来问颜色。先问一种颜色，再用本课学过的颜色词回答。',en:'What colour is your dress? — It is green.',zh:'你的连衣裙是什么颜色？——绿色。',prompt:'用 blue（蓝色）说“它是蓝色的”。',answer:'It is blue.'},
  15:{idea:'复数表示不止一个。说几个人用 they，和 are 搭配；不用 is。',en:'They are tourists.',zh:'他们是游客。',prompt:'用 students（学生们）说“他们是学生”。',answer:'They are students.'},
  17:{idea:'单数 She is 变成复数 They are。职业名词也要跟着变成复数。',en:'They are keyboard operators.',zh:'她们是电脑录入员。',prompt:'用 teachers（老师们）说“他们是老师”。',answer:'They are teachers.'},
  19:{idea:'We 表示“我们”，同样和 are 搭配。tired 是“累的”，thirsty 是“口渴的”。',en:'We are tired and thirsty.',zh:'我们又累又渴。',prompt:'只说“我们很累”。',answer:'We are tired.'},
  21:{idea:'Give me… 是“给我……”。Which one? 问“哪一个”，在多个物品里作选择。',en:'Give me a book, please. — Which one?',zh:'请给我一本书。——哪一本？',prompt:'用 pen（笔）说“请给我一支笔”。',answer:'Give me a pen, please.'},
  23:{idea:'one 指一个，ones 指多个。比较 Which one? 与 Which ones?，把问句数量和物品对应起来。',en:'Give me some glasses, please. — Which ones?',zh:'请给我一些杯子。——哪些？',prompt:'用 books（书，复数）说“请给我一些书”。',answer:'Give me some books, please.'},
};
export const chapters = [
  ['认识人和物', '用简单问答介绍自己、询问物品、颜色和归属。', '介绍你和一位朋友，再用身边三样物品做一段问答。至少 6 句，录音 30–60 秒。', 6],
  ['描述眼前的生活', '描述位置、正在做的事、打算和能力。', '介绍你的房间：有什么、在哪里、你现在在做什么、接下来打算做什么。至少 8 句，录音 45–75 秒。', 8],
  ['说说今天和昨天', '表达日常习惯，区分现在与过去，并完成时间问答。', '比较一个普通工作日和昨天，含一次问答。至少 8 句，录音 60–90 秒。', 8],
  ['经历与下一步', '区分过去事件、已完成的事和将来的安排。', '讲一次出行：何时做了什么、已经完成什么、接下来准备做什么。至少 10 句，录音 60–90 秒。', 10],
  ['比较、转述与叙事', '比较选择、转述消息，说明过去事件的先后。', '比较两个居住或旅行选择，转述一条建议，说明你的理由。至少 10 句，录音 90 秒。', 10],
  ['把复杂意思讲清楚', '用定语从句、条件句、推测和被动语态表达完整意思。', '介绍一件丢失后找回的物品：特征、经过、可能原因和下次如何避免。至少 12 句，录音 90–120 秒。', 12],
  ['讲一件完整的小事', '复习基础时态，用清晰顺序讲一个故事。', '讲一次令你印象深刻的日常经历，包含背景、经过和感受。写 80–100 词，脱稿讲 1 分钟。', 80],
  ['原因、条件与结果', '表达先后、规定、可能性与条件。', '讲一次计划变化：原计划、变化原因、处理方式、下次的条件与安排。写 90–120 词，讲 1–2 分钟。', 90],
  ['丰富叙述的细节', '连接事件，比较过去习惯与现在状态。', '比较你过去和现在的一种生活习惯，给出具体例子。写 100–130 词，讲 2 分钟。', 100],
  ['换一种说法', '用转述、假设和不同句式解释同一件事。', '转述一位朋友遇到的问题，提出两个解决办法并说明选择理由。写 120–150 词，讲 2 分钟。', 120],
  ['观点与例子', '连接复杂句，区分事实、持续过程与判断。', '对“城市是否需要更多公共图书馆”表明立场，用两个理由和一个具体例子展开。写 140–170 词，讲 2 分钟。', 140],
  ['假设与反思', '描述持续经历、过去假设、建议与解决过程。', '回顾一次没能达成的计划，解释原因、可能的不同结果和下一步建议。写 150–180 词，讲 2 分钟。', 150],
  ['整合长篇表达', '综合运用句式、时态和段落衔接。', '比较线上与线下学习的优缺点，解释各自适用的情境和你的选择。写 160–200 词，讲 2 分钟。', 160],
  ['走向陌生材料', '综合理解、转述与论证，准备进入 IELTS 专项。', '选择一篇没学过的短文，先听读，再用自己的话概括、解释观点和举例。写 180–220 词，讲 2–3 分钟；请评阅者追问两个问题。', 180],
] as const;

// Rotate source excerpts and response modes; this is textbook recall, not an IELTS score.
export function unitQuestions(unit: Unit, round: number): MapQuestion[] {
  const rows = unit.rows, shift = round % 3 * 2;
  const pick = (i: number) => rows[(i + shift) % rows.length];
  const choices = (answer: string, i: number) => {
    const values = [...new Set([answer, ...rows.filter(r => r.zh !== answer).map(r => r.zh)])].slice(0, 4);
    const offset = (round + i + unit.lesson) % values.length;
    return [...values.slice(offset), ...values.slice(0, offset)];
  };
  const result: MapQuestion[] = [];
  for (let i = 0; i < 2; i++) {
    const row = pick(i);
    result.push({id: `hear-${i}`, type: 'choice', mode: 'listen', prompt: '听原声，选择这句话的意思。', options: choices(row.zh, i), answer: row.zh, explanation: `${row.en} — ${row.zh}`, clip: {book: unit.book, lesson: unit.lesson, start: row.start, end: row.end}});
  }
  for (let i = 2; i < 4; i++) {
    const row = pick(i);
    result.push({id: `read-${i}`, type: 'choice', prompt: `读句子，选择意思：${row.en}`, options: choices(row.zh, i), answer: row.zh, explanation: `${row.en} — ${row.zh}`});
  }
  for (let i = 4; i < 6; i++) {
    const row = pick(i);
    result.push({id: `build-${i}`, type: 'input', mode: 'order', prompt: `按课文语序组成这句话：${row.zh}`, options: row.en.split(/\s+/), answer: row.en, explanation: row.en});
  }
  // The first chapter permits tapping throughout. Subsequent units also check a grammar application.
  if (unit.book !== 'NCE1' || unit.lesson > 23) {
    const guide = guidesFor(unit)[round % guidesFor(unit).length];
    result.push({id: 'use-grammar', type: 'input', prompt: guide.practice.prompt, answer: guide.practice.answer, explanation: guide.practice.explanation});
  }
  return result;
}

const clip = (lesson: number, start: number, end: number): Clip => ({book: 'NCE1', lesson, start, end});
export const starters = [
  {id: 'first', title: '先听懂一句话', subtitle: '不用打英文。先把声音和意思连起来。', lines: [
    {en: 'Excuse me!', zh: '想请别人注意时：请问／劳驾。', clip: clip(1, 15.11, 16.66)},
    {en: 'Pardon?', zh: '没听清时：请再说一遍。', clip: clip(1, 21.44, 23.17)},
    {en: 'Thank you very much.', zh: '得到帮助后：非常感谢。', clip: clip(1, 29.49, 33)},
  ], tip: '点喇叭，听一句，跟着说一句。没听懂就重放，不需要先认识所有字母。', question: '你没听清对方的话，选哪一句？', answer: 'Pardon?', options: ['Pardon?', 'Thank you very much.', 'Excuse me!']},
  {id: 'letters', title: '认识字母与单词', subtitle: '分清字母、单词、句子；大小写也能配对。', lines: [
    {en: 'Aa · Bb · Cc · Dd · Ee · Ff · Gg', zh: '每组是同一个字母的大写与小写。'},
    {en: 'Hh · Ii · Jj · Kk · Ll · Mm · Nn', zh: '字母拼成单词；I 表示“我”时总是大写。'},
    {en: 'Oo · Pp · Qq · Rr · Ss · Tt', zh: '看形状，找到大小写对应关系，不必一次背完。'},
    {en: 'Uu · Vv · Ww · Xx · Yy · Zz', zh: '字母名称和它在单词里的发音不总相同，发音跟着原声学。'},
    {en: 'Yes, it is.', zh: '空格分开单词，句末的点表示一句结束。听完整短句，不拼读汉字谐音。', clip: clip(1, 26.73, 29.49)},
  ], tip: '这里先认形和读法的区别。进入课文后逐个听词、模仿、回听；字母配对通过不代表发音已经达标。', question: '大写 A 对应哪个小写字母？', answer: 'a', options: ['a', 'b', 'e']},
  {id: 'small-exchange', title: '完成第一次小问答', subtitle: '听懂“这是你的吗”，会确认，也会请求重说。', lines: [
    {en: 'Is this your handbag?', zh: '这是你的手提包吗？Is 放在句首，表示在问。', clip: clip(1, 18.26, 21.44)},
    {en: 'Yes, it is.', zh: '是的，是我的。先模仿整句。', clip: clip(1, 26.73, 29.49)},
    {en: 'This is not my umbrella.', zh: '这不是我的伞。not 表示否定。', clip: clip(3, 33.72, 37.39)},
  ], tip: 'handbag 是手提包，umbrella 是雨伞；my 是“我的”，your 是“你的”。先听懂，再跟读，然后选意思。', question: '对方问你的包，你要肯定回答，选哪一句？', answer: 'Yes, it is.', options: ['Yes, it is.', 'Pardon?', 'Thank you very much.']},
] as const;

// Keep every unmarked legacy round's questions intact. New rounds opt into
// different source excerpts; merely reordering the old three is not new material.
// NCE1 lesson 3, language sourceSha256:
// 83b94c8bdb3bc463856aa465fc3510c43461ea343318e57586ca98759373f8a1
const starterReviewLines:Record<string,StarterLine[]> = {
  first:[
    {en:'My coat and my umbrella please.',zh:'请把我的大衣和雨伞给我。',clip:clip(3,17.56,22)},
    {en:'Thank you sir.',zh:'谢谢您，先生。',clip:clip(3,25.03,26.86)},
    {en:'Sorry sir.',zh:'对不起，先生。',clip:clip(3,37.39,39.67)},
  ],
  'small-exchange':[
    {en:'Here is my ticket.',zh:'这是我的票。',clip:clip(3,22,25.03)},
    {en:'Is this your umbrella?',zh:'这是您的伞吗？',clip:clip(3,39.67,42.56)},
    {en:"No it isn't.",zh:'不，它不是。',clip:clip(3,42.56,45.69)},
  ],
};
export function starterStudyLines(id:string,bank?:StarterBank):StarterLine[] {
  const lines=starters.find(s=>s.id===id)?.lines||[];
  return bank==='starter-v2'?[...lines,...(starterReviewLines[id]||[])]:[...lines];
}

export function starterQuestions(id: string, round: number, bank?:StarterBank): MapQuestion[] {
  const s = starters.find(s => s.id === id)!;
  if (id === 'letters') {
    const pairs = round % 2 ? [['M', 'm'], ['R', 'r'], ['T', 't'], ['Y', 'y']] : [['A', 'a'], ['B', 'b'], ['E', 'e'], ['G', 'g']];
    return pairs.map(([upper, lower], i) => ({id: `letter-${i}`, type: 'choice', prompt: `为 ${upper} 找到对应的小写字母。`, options: [lower, i % 2 ? 'a' : 'z', i % 2 ? 'n' : 'v'].sort(), answer: lower, explanation: `${upper} — ${lower}`}));
  }
  const lines:StarterLine[] = bank==='starter-v2'&&round%2&&starterReviewLines[id]?[...starterReviewLines[id]]:[...s.lines];
  const offset = round % lines.length;
  return [...lines.slice(offset), ...lines.slice(0, offset)].map((row, i) => ({id: `sound-${i}`, type: 'choice', mode: 'listen', prompt: '听一句原声，选择对应的意思。', clip: 'clip' in row ? row.clip : undefined, options: lines.map(x => x.zh).sort(), answer: row.zh, explanation: `${row.en} — ${row.zh}`}));
}
