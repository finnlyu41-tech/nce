import {batch02Tasks} from './batch-02/content';
export type Bank = 'guided'|'independent'|'repair'|'delayed-a'|'delayed-b';
export type MiniItem = {id:string;bank:Bank;material:string;prompt:string;hint:string;reference:string;accepted:string[];audio?:string};
export type MiniTask = {id:string;courseId:string;groupId:string;lessons:number[];skill:'listening'|'reading'|'speaking'|'writing';track:'common'|'general-training';title:string;level:string;calibration:'uncalibrated';teaching:string;items:MiniItem[]};
const banks:Bank[]=['guided','independent','repair','delayed-a','delayed-b'];
const make=(base:Omit<MiniTask,'items'|'calibration'|'level'>,rows:Omit<MiniItem,'id'|'bank'>[]):MiniTask=>({...base,level:'NCE1 初学者；编写目标约 pre-A1–A1',calibration:'uncalibrated',items:rows.map((row,i)=>({...row,id:`${base.id}:${banks[i]}`,bank:banks[i]}))});
// Original standalone mini materials. These are preparatory IELTS-like actions,
// not exam items, band estimates or a substitute for full Academic/GT tasks.
export const miniTasks:readonly MiniTask[]=[
 make({id:'mini-n1-01',courseId:'nce1-1',groupId:'NCE1-1',lessons:[1,2],skill:'listening',track:'common',title:'听物品确认，补一格',teaching:'听说话者确认物品。表格已给物主，只填一个物品词。合成语音可重放；打开文字稿会记为帮助。book=书；bag=包；pen=笔。'},[
  {material:'Hello. This is my book.',prompt:'听完后补一格：物主 = 说话者；物品 = ____。只写一个英文词。',hint:'听 my 后面的物品词。',reference:'book',accepted:['book'],audio:new URL('./audio/mini-n1-01-guided.wav',import.meta.url).href},
  {material:'Hello. This is my bag.',prompt:'听完后补一格：物主 = 说话者；物品 = ____。只写一个英文词。',hint:'听 my 后面的物品词。',reference:'bag',accepted:['bag'],audio:new URL('./audio/mini-n1-01-independent.wav',import.meta.url).href},
  {material:'Hello. This is my pen.',prompt:'听完后补一格：物主 = 说话者；物品 = ____。只写一个英文词。',hint:'听 my 后面的物品词。',reference:'pen',accepted:['pen'],audio:new URL('./audio/mini-n1-01-repair.wav',import.meta.url).href},
  {material:'Good morning. Is this your book? Yes, it is.',prompt:'听完确认问答，物品 = ____。只写一个英文词。',hint:'听 your 后面的物品词，不写 Yes。',reference:'book',accepted:['book'],audio:new URL('./audio/mini-n1-01-delayed-a.wav',import.meta.url).href},
  {material:'Excuse me. Is this your pen? Yes, it is.',prompt:'听完确认问答，物品 = ____。只写一个英文词。',hint:'听 your 后面的物品词，不写 Yes。',reference:'pen',accepted:['pen'],audio:new URL('./audio/mini-n1-01-delayed-b.wav',import.meta.url).href},
 ]),
 make({id:'mini-n1-03',courseId:'nce1-3',groupId:'NCE1-3',lessons:[3,4],skill:'reading',track:'common',title:'读失物留言，找物主',teaching:'这是几条原创失物留言。先找是谁说 my，再找物品；不根据持有人猜物主。只提取名字，不写完整句。coat=外套；bag=包；book=书；pen=笔；key=钥匙。'},[
  {material:'Ava: This is my coat. Ben: This is my bag.',prompt:'Who owns the coat?（谁是外套的物主？）只写名字。',hint:'找到 coat 那一句，读冒号前的名字。',reference:'Ava',accepted:['Ava']},
  {material:'Mia: This is not my book. Leo: This is my book.',prompt:'两人指同一本书。Who owns the book?（谁是书的物主？）只写名字。',hint:'not my 表示不是自己的；找肯定句。',reference:'Leo',accepted:['Leo']},
  {material:'Nora: This is my pen. Sam: This is not my pen.',prompt:'两人指同一支笔。Who owns the pen?（谁是笔的物主？）只写名字。',hint:'找 my pen 的肯定句。',reference:'Nora',accepted:['Nora']},
  {material:'Tia: This is not my key. Dan: This is my key.',prompt:'两人指同一把钥匙。Who owns the key?（谁是钥匙的物主？）只写名字。',hint:'not 是否定；找肯定认领的人。',reference:'Dan',accepted:['Dan']},
  {material:'Kim: This is my bag. Jo: This is not my bag.',prompt:'两人指同一个包。Who owns the bag?（谁是包的物主？）只写名字。',hint:'找肯定认领 bag 的人。',reference:'Kim',accepted:['Kim']},
 ]),
 make({id:'mini-n1-05',courseId:'nce1-5',groupId:'NCE1-5',lessons:[5,6],skill:'speaking',track:'common',title:'口头介绍一位朋友',teaching:'按明确给出的名字、代词和国籍，口头说两句：This is + 名字；He/She is + 国籍。先跟例句，再用新人物。录音只供本页回放，不上传；文字备选只记录文字练习。口语质量待外评。'},[
  {material:'你的朋友 Ava 在身边；她明确使用 she；她是 French。',prompt:'口头介绍 Ava，说两句；French=法国的。',hint:'This is Ava. She is French.',reference:'This is Ava. She is French.',accepted:[]},
  {material:'你的朋友 Ken 在身边；他明确使用 he；他是 Japanese。',prompt:'口头介绍 Ken，说两句；Japanese=日本的。',hint:'先 This is，再 He is；国籍词前不加 a。',reference:'This is Ken. He is Japanese.',accepted:[]},
  {material:'你的朋友 Mia 在身边；她明确使用 she；她是 Chinese。',prompt:'换一个人，口头介绍 Mia，说两句；Chinese=中国的。',hint:'先 This is，再 She is；国籍词前不加 a。',reference:'This is Mia. She is Chinese.',accepted:[]},
  {material:'你的朋友 Ben 在身边；他明确使用 he；他是 German。',prompt:'口头介绍 Ben，说两句；German=德国的。',hint:'名字后另起一句 He is + 国籍。',reference:'This is Ben. He is German.',accepted:[]},
  {material:'你的朋友 Kim 在身边；她明确使用 she；她是 Korean。',prompt:'口头介绍 Kim，说两句；Korean=韩国的。',hint:'名字后另起一句 She is + 国籍。',reference:'This is Kim. She is Korean.',accepted:[]},
 ]),
 make({id:'mini-n1-07',courseId:'nce1-7',groupId:'NCE1-7',lessons:[7,8],skill:'writing',track:'general-training',title:'写两句职业询问留言',teaching:'这是 GT 生活通信的起步动作，不是完整 Task 1，也不用于 Academic 图表写作。按角色写两句留言：说明你现在的职业，再问收信人是否做题设职业。可用 I am/I’m。不自动给口写分数。'},[
  {material:'角色：你现在是 nurse；想问收信人现在是否是 teacher。nurse=护士；teacher=教师。',prompt:'写两句：先说明自己的职业，再直接询问对方。',hint:'I am a nurse. Are you a teacher?',reference:'I am a nurse. Are you a teacher?',accepted:[]},
  {material:'角色：你现在是 teacher；想问收信人现在是否是 engineer。engineer=工程师。',prompt:'写两句：先说明自己的职业，再直接询问对方。',hint:'I am + a/an + 职业；Are you + a/an + 职业？engineer 前用 an。',reference:'I am a teacher. Are you an engineer?',accepted:[]},
  {material:'角色：你现在是 engineer；想问收信人现在是否是 nurse。',prompt:'换一个角色，写两句职业留言：先说明自己，再直接询问对方。',hint:'engineer 前用 an，nurse 前用 a。',reference:'I am an engineer. Are you a nurse?',accepted:[]},
  {material:'角色：你现在是 mechanic；想问收信人现在是否是 teacher。mechanic=机械师。',prompt:'写两句职业留言：说明自己，再问对方。',hint:'两个职业前都用 a。',reference:'I am a mechanic. Are you a teacher?',accepted:[]},
  {material:'角色：你现在是 taxi driver；想问收信人现在是否是 mechanic。taxi driver=出租车司机。',prompt:'写两句职业留言：说明自己，再问对方。',hint:'I am a taxi driver. 然后用 Are you 问句。',reference:'I am a taxi driver. Are you a mechanic?',accepted:[]},
 ]),
 make({id:'mini-n1-09',courseId:'nce1-9',groupId:'NCE1-9',lessons:[9,10],skill:'listening',track:'common',title:'听当前状态，补一格',teaching:'听本人直接说出的当前状态。只填一个状态词，不从语气猜情绪。well=身体好；tired=累；cold=冷；hot=热。合成声音，不是考试录音；难度未校准。'},[
  {material:'Hello. I am well.',prompt:'说话者当前状态 = ____。只写听到的一个英文状态词。',hint:'听 I am 后面的状态词。',reference:'well',accepted:['well'],audio:new URL('./audio/mini-n1-09-guided.wav',import.meta.url).href},
  {material:'Good morning. I am tired.',prompt:'说话者当前状态 = ____。只写听到的一个英文状态词。',hint:'听 I am 后面的状态词，不根据语气猜。',reference:'tired',accepted:['tired'],audio:new URL('./audio/mini-n1-09-independent.wav',import.meta.url).href},
  {material:'Hello. I am cold.',prompt:'说话者当前状态 = ____。只写听到的一个英文状态词。',hint:'听 I am 后面的状态词。',reference:'cold',accepted:['cold'],audio:new URL('./audio/mini-n1-09-repair.wav',import.meta.url).href},
  {material:'How are you? I am hot.',prompt:'回答者直接报告的当前状态 = ____。只写听到的一个英文状态词。',hint:'听回答者 I am 后面的词。',reference:'hot',accepted:['hot'],audio:new URL('./audio/mini-n1-09-delayed-a.wav',import.meta.url).href},
  {material:'How are you? I am well, thank you.',prompt:'回答者直接报告的当前状态 = ____。只写听到的一个英文状态词。',hint:'听 I am 后面的词，不写 thank you。',reference:'well',accepted:['well'],audio:new URL('./audio/mini-n1-09-delayed-b.wav',import.meta.url).href},
 ]),
 make({id:'mini-n1-11',courseId:'nce1-11',groupId:'NCE1-11',lessons:[11,12],skill:'reading',track:'common',title:'读物主颜色表，找一条信息',teaching:'读原创失物登记，先找到指定物主与物品，再提取颜色。只能用明确记录，不能根据名字猜。blue=蓝；red=红；green=绿；black=黑；white=白。'},[
  {material:"Ava's bag is blue. Ben's coat is red.",prompt:"What colour is Ava's bag?（Ava 的包是什么颜色？）只写一个颜色词。",hint:'找到 Ava 与 bag 同时出现的一句。',reference:'blue',accepted:['blue']},
  {material:"Mia's coat is green. Leo's bag is black.",prompt:"What colour is Leo's bag?（Leo 的包是什么颜色？）只写一个颜色词。",hint:'找到 Leo 与 bag 同时出现的一句。',reference:'black',accepted:['black']},
  {material:"Nora's pen is red. Sam's key is white.",prompt:"What colour is Nora's pen?（Nora 的笔是什么颜色？）只写一个颜色词。",hint:'找到 Nora 与 pen 同时出现的一句。',reference:'red',accepted:['red']},
  {material:"Dan's coat is blue. Tia's bag is white.",prompt:"What colour is Tia's bag?（Tia 的包是什么颜色？）只写一个颜色词。",hint:'找到 Tia 与 bag 同时出现的一句。',reference:'white',accepted:['white']},
  {material:"Jo's bag is red. Kim's coat is green.",prompt:"What colour is Kim's coat?（Kim 的外套是什么颜色？）只写一个颜色词。",hint:'找到 Kim 与 coat 同时出现的一句。',reference:'green',accepted:['green']},
 ]),
 ...batch02Tasks,
];
export const miniTaskForCourse=(courseId:string)=>miniTasks.find(task=>task.courseId===courseId);
export function getMiniTask(id:string){const task=miniTasks.find(task=>task.id===id);if(!task)throw Error('小任务尚未编写，原记录保留。');return task}
export const miniDraftKey=(id:string)=>`english-mini-task-v1:${getMiniTask(id).groupId}`;
