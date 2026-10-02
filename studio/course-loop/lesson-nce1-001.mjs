/** Original micro-lesson; textbook media remain in their existing host. */
export const lesson = {
  id: 'nce1-1', version: 1, book: 'NCE1', lessons: [1, 2],
  title: '第 1–2 课 · 问清物品是不是对方的',
  goal: '问一件近处物品是不是对方的，听到询问后确认；没听清时请求重说。',
  scope: '本包自动核对的是短句文字理解与受限表达。原声用于学习；听力、发音和自由交流未评分。',
  source: {
    groupId: 'NCE1-1', route: '/#/nce/NCE1/1?tab=listen', mapRoute: '/map/#/learn/nce1-1',
    languagePath: '/language/NCE1/1.json',
    languageSha256: '6a07bc9eb1a5f030a63536970daefbc79c2bf7e6696fe0f383b4579d2291762a',
    comicKey: 'NCE1-1',
    // Locators from existing curriculum.ts; no copied textbook or audio assets.
    clips: [{target:'ask',start:18.26,end:21.44},{target:'repeat',start:21.44,end:23.17},{target:'confirm',start:26.73,end:29.49}],
  },
  glossary: 'book 书 · pen 笔 · bag 包 · cup 杯子 · coat 大衣 · ticket 票 · key 钥匙 · map 地图 · phone 手机。题目会给物品词义，不考未教词汇。',
  teaching: [
    {target:'ask', title:'问“是不是”，把 Is 放在前面', explanation:'this 指近处的一件东西；your 指对方的。先用 Is this your ...? 问归属。不要用陈述语序 This is ... 代替这次问句。', example:'Is this your book?', meaning:'这是你的书吗？', check:'Is + this + your + 一件物品？', source:'ask'},
    {target:'confirm', title:'对方问“这是你的吗”，用 it 回指物品', explanation:'物品确实是你的，可以答 Yes, it is. 这里 it 指这件东西；I 指人，不能用 Yes, I am. 回答这个物品问题。', example:'Is this your pen? — Yes, it is.', meaning:'这是你的笔吗？——是的。', check:'确认的是物品，所以用 it is。', source:'confirm'},
    {target:'repeat', title:'没听清，先请对方重说', explanation:'Pardon? 可以表示“请再说一遍”。Thank you. 用于感谢；Excuse me. 常用来引起注意。看清交流目的，再选要说的话。', example:'Pardon?', meaning:'请再说一遍？', check:'没听清 → 请求重说；得到帮助 → 感谢。', source:'repeat'},
  ],
  own: {id:'own-exchange', prompt:'选一件身边的物品，写两句问答：先问是不是对方的，再写物主的肯定回答。也可以先口头说，留下你实际说出的文字。不要复制参考句。', checks:['问句是否问物品归属？','回答中的 it 是否指同一物品？','如果没听清，能否先请求重说？'], status:'awaiting-human-review', reviewerPrompt:'请老师或伙伴实际听/读问答，记录意思是否清楚、需要改哪里；本站不自动确认开放表达。'},
  intervals: {first:86400000, repair:86400000, subsequent:604800000},
};
const input=(id,stage,target,context,prompt,accepted,why)=>({id,stage,target,context,prompt,kind:'input',accepted,why});
const choice=(id,stage,context)=>({id,stage,target:'repeat',context,prompt:'你没有听清对方的话。选择合适的回应。',kind:'choice',options:['Thank you.','Pardon?','Yes, it is.'],accepted:['Pardon?'],why:'当前需要对方重说，Pardon? 符合目的。感谢或直接确认都不能解决没听清的问题。'});
const makeSet=(stage,askContext,askNoun,confirmContext,confirmNoun,repeatContext)=>[
 input(`${stage}-ask`,stage,'ask',askContext,`用英文问“这是你的${askNoun[1]}吗？”（${askNoun[0]} = ${askNoun[1]}）`,[`Is this your ${askNoun[0]}?`],'问是不是：Is 放句首，this 指这件物品，your 指对方的。'),
 input(`${stage}-confirm`,stage,'confirm',confirmContext,`对方问：Is this your ${confirmNoun}? 物品确实是你的，请写出完整的肯定回答。`,['Yes, it is.'],'肯定的是物品，用 Yes, it is.，不能把指物的 it 换成 I。'),
 choice(`${stage}-repeat`,stage,repeatContext),
];
export const questions = [
 ...makeSet('diagnostic','散场后桌上有一本书，你想向旁边的人确认归属。',['book','书'],'同伴把一支笔递给你；这是你刚才掉的笔。（pen = 笔）','pen','门口很吵，你只听到对方句子的末尾。'),
 ...makeSet('guided','出门时发现椅子上有一个包，先问旁边的人。',['bag','包'],'朋友拿来一个杯子问你；杯子是你的。（cup = 杯子）','cup','店员轻声说话，你没听完整，想请他重说。'),
 ...makeSet('independent','你在衣帽间值班。有人来取物，你拿起一件大衣，核对是不是他的。',['coat','大衣'],'检票人员举起地上的票问你。你确认是刚掉的那张。（ticket = 票）','ticket','电话接通了，但第一句话被杂音盖住。你需要对方再说一遍。'),
 ...makeSet('repair','你整理共享桌面，拿起一把钥匙，向身边的人确认。',['key','钥匙'],'同伴举起一张地图；你认出这是自己的。（map = 地图）','map','对方刚说话时你正在关门，没有听清他的意思。'),
 ...makeSet('review-a','你帮忙整理活动室，把找到的手机拿给正在寻找东西的人，先核对归属。',['phone','手机'],'工作人员在归还物品前举起一个包；包确实是你的。（bag = 包）','bag','广播盖住了对方的问话，你想请他重说。'),
 ...makeSet('review-b','你在工作坊分发物品，拿起一个杯子，问面前的人是不是他的。',['cup','杯子'],'同学拿起课桌上的一本书问你；你确认是自己的。（book = 书）','book','车站里对方说得很轻，你没有听清完整句子。'),
];
export const byId = new Map(questions.map(q=>[q.id,q]));
export const questionsFor = stage => questions.filter(q=>q.stage===stage);
export const norm = text => String(text).normalize('NFKC').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/[.!?。！？]+$/g,'').replace(/,/g,' ').replace(/\s+/g,' ');
export const matches = (q, answer) => q.accepted.some(a=>norm(a)===norm(answer));
