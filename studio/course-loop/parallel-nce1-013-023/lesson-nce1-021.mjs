import {bindContent} from './content-contract.mjs';

export const lesson={
 id:'nce1-21',version:1,book:'NCE1',lessons:[21,22],title:'第 21–22 课 · 说明物主，选对单件物品',
 goal:'依据明确事实用his、her、our、their说明物主；请求给自己一件物品；用Which询问并用颜色加one选定单件物品。',
 scope:'只核对本题限定的物主陈述、Give me单件请求、Which单件询问与The + 颜色 + one选择答复。物主、数与选择范围均明说，不从名字或衣物猜性别。未匹配不代表其他自然表达整体错误；开放表达由伙伴核对，文字匹配不判断听说能力或水平。',
 prerequisites:['已接触This is、These are、a/an与颜色词；题目明确说话者、物主的人称以及物品单复数。'],
 source:{groupId:'NCE1-21',route:'/#/nce/NCE1/21?tab=listen',mapRoute:'/map/#/learn/nce1-21',languagePath:'/language/NCE1/21.json',languageSha256:'3f47339168baa47c8c88641e5476a72978b534aa8c35c7c14b65584ce16729ca',languageFileSha256:'016629990c2f51ec0d1291fd9cf82eb2299fa26c13bac20d77ff24de1c76c4d8',comicKey:'NCE1-21',comicSha256:'9481fd016c92ec6d785cb76cf847e719ea7cce77cf6d103ef1df8c596a634083',comicPageSha256:'980c4279acdf859479aa1c1e0a483c5e9a49dd17554e5dde53de57bbd5c3f2ad',grammarPages:[46,47,48],clips:[
  {target:'possessive-owner',label:'听单件物品的指示语境；物主限定词见第22课练习',start:21.83,end:24.33,supportNote:'片段示范指向单件物品，不示范his/her/our/their；这些物主限定词对应第22课句型与书面练习。'},
  {target:'single-request',label:'听Give me的单件请求',start:16.7,end:20.22},
  {target:'item-selection',label:'听Which询问与颜色加one选择',start:20.22,end:29.44},
 ]},
 glossary:'人物和场景均为原创。his 他的；her 她的；our 我们的；their 他们的或她们的。book 书；bag 包；ticket 票；umbrella 雨伞；coat 外套；cup 杯子；apple 苹果；cap 有檐帽；orange 橙子；egg 鸡蛋。blue 蓝色的；green 绿色的；black 黑色的；yellow 黄色的。',
 teaching:[
  {target:'possessive-owner',title:'物主限定词放在物品前',explanation:'已知物品属于使用he的人，用his；属于使用she的人，用her；属于包含说话者的一组人，用our；属于不包含说话者的一组人，用their。his/her/our/their后接物品名词，不用him/she/us/them代替，也不用独立形式hers/ours/theirs。单件用This is + 物主 + 单数物品；眼前多件用These are + 物主 + 复数物品。物品的数量不决定物主代词，物主事实才决定它。',example:'This is her bag. / These are our tickets.',meaning:'这是她的包。／这些是我们的票。',check:'根据物主事实选限定词，This/is与These/are及物品单复数一致。',source:'possessive-owner'},
  {target:'single-request',title:'给自己一件物品：Give me a/an…',explanation:'Give me表示请求把东西给说话者自己。单件可数物品前用a或an，依据后面词的起始音：a cup，an apple，an umbrella。每题限定Give me + 单件物品短语，可在句末加please，please前逗号可有可无。陈述或请求可不写末尾标点，或用一个句号、感叹号（含中文样式），不写问号。',example:'Give me an apple, please.',meaning:'请给我一个苹果。',check:'Give后是me；a/an符合单件物品的起始音；不换接收者或数量。',source:'single-request'},
  {target:'item-selection',title:'Which问哪件，one避免重复单数物品',explanation:'已经有若干同类物品可选时，Which + 单数物品?问“哪一件？”。物品类别在对话中已明确，也可问Which one?。选定一种颜色的单件时，用The + 颜色 + one回答，例如The blue one。one代替已经明确的单数物品，不用复数ones。本组选择答复只写这个短语；问句恰有一个末尾?或？。选择短语可不写末尾标点，或用一个句号、感叹号（含中文样式）。',example:'Which cup? — The blue one.',meaning:'哪个杯子？——蓝色的那个。',check:'Which用于既有选择范围；单数one与单件选择一致；颜色符合事实。',source:'item-selection'},
 ],
 own:{id:'own-n21-owner-and-selection',prompt:'设定一组同类单件物品，例如两个颜色不同的杯子。明确其中一种物品的物主，说明所属；请求伙伴给自己一件，再互相询问并按颜色选定哪一件。可使用真实或虚构物品，先记录原答，再保留自己的订正版。',checks:['his/her/our/their是否有明确物主依据，物品数量是否清楚？','请求是否给说话者自己，单件a/an是否合适？','Which问句和颜色加one是否在同一选择范围内？'],status:'awaiting-human-review',reviewerPrompt:'请伙伴或老师实际读或听表达，核对物主、数量、请求对象和所选物品，接受自然等义表达。本站不自动判定自由表达正确，也不由文字记录推断听说能力。'},
 intervals:{first:86400000,repair:86400000,subsequent:604800000},rights:'original-authored',contentStatus:'authored-independent-ai-blind-reviewed',
};
const task=(stage,target,form,data)=>({id:`${stage}-n21-${target}`,stage,target,kind:'input',form,...data});
export const questions=[
 task('diagnostic','possessive-owner','statement',{
  context:'你向图书管理员介绍手里这本书。Noah明确使用he，这本书只属于Noah，不属于你。',
  prompt:'只说“这是他的书”。以完整This is开头，物品写book（书），用物主限定词代替Noah的名字。',accepted:['This is his book.'],criterion:'This is + his + 单数book。',why:'已明确物主使用he，用his放在book前；him表示宾格，不能说明书的所属。',novelty:'图书归还时根据明说的人称指向第三人的单本书。',
  counterexamples:[{answer:'This is him book.',reason:'him不能在book前充当物主限定词。'},{answer:'This is her book.',reason:'her与物主明确使用he的事实不符。'},{answer:'This is my book.',reason:'my把物主换成说话者。'}],
 }),
 task('diagnostic','single-request','statement',{
  context:'你来到饮水桌，自己还没有杯子。你向负责分杯子的伙伴请求拿一个杯子给你。',
  prompt:'以Give开头，只请求“给我一个杯子”。cup = 杯子，单件用a或an；可加句末please。Give后先写接收者，再写物品，不用to结构。',accepted:['Give me a cup.','Give me a cup please.','Give me a cup, please.'],criterion:'Give + me + a cup。',why:'东西给说话者自己，用me；cup以辅音音素开头，单件用a。',novelty:'饮水桌请求为说话者补一个杯子。',
  counterexamples:[{answer:'Give I a cup.',reason:'Give后的接收者要用me。'},{answer:'Give me an cup.',reason:'cup前应用a。'},{answer:'Give me some cups.',reason:'some cups请求多件，与一个杯子不同。'}],
 }),
 task('diagnostic','item-selection','question',{
  context:'伙伴说想借一个包。眼前只有两个包，一个蓝色一个绿色；你还不知道伙伴想借哪一个。包的类别已在对话里明确。',
  prompt:'只追问“哪一个包？”。用Which（哪一个）和bag（包）写简短问句；类别已明确时也可用one代替bag。以一个?或？结束。只写Which与本题指定名词或one构成的两个词，不添加其他词。',accepted:['Which bag?','Which one?'],criterion:'Which + 单数bag或one + 一个末尾问号。',why:'两个包构成明确选择范围；Which问具体哪一个，one指前面已说的单个包。',novelty:'借包时根据明确的两件候选追问选择，而非猜颜色。',
  counterexamples:[{answer:'Which bags?',reason:'bags改为询问多件，伙伴只想借一个。'},{answer:'Whose bag?',reason:'Whose改为问物主，没有问所选哪一个。'},{answer:'Which bag.',reason:'缺少本题要求的问号。'}],
 }),
 task('guided','possessive-owner','statement',{
  context:'摄影活动开始前，Mira明确使用she，她确认桌上这个包属于她。你拿起这个包向登记伙伴说明物主。',
  prompt:'用“This is + 物主限定词 + bag”说“这是她的包”。she对应的物主限定词是her；只说明这条事实。',accepted:['This is her bag.'],criterion:'This is + her + bag。',why:'her在这里放在bag前表示所属；hers不能直接放在名词前。',novelty:'摄影登记时从本人确认转述单件包的物主。',
  counterexamples:[{answer:'This is she bag.',reason:'she是主格，不能表示bag的所属。'},{answer:'This is hers bag.',reason:'hers是独立形式，不能直接放在bag前。'},{answer:'This is his bag.',reason:'his改变了明确使用she的物主。'}],
 }),
 task('guided','single-request','statement',{
  context:'你在水果桌挑选午餐水果。你向同伴请求给你一个苹果，不替其他人领取。',
  prompt:'用“Give me + a/an + 物品”请求一个apple（苹果）。apple以元音音素开头；只写给我一个苹果，可加句末please。Give后先写接收者，再写物品，不用to结构。',accepted:['Give me an apple.','Give me an apple please.','Give me an apple, please.'],criterion:'Give me + an apple。',why:'苹果是单件，apple前用an；me保持接收者为说话者。',novelty:'为自己的午餐领单个水果，核对an而不代领。',
  counterexamples:[{answer:'Give me a apple.',reason:'apple前应用an。'},{answer:'Give him an apple.',reason:'him把接收者换成第三人。'},{answer:'Give me apple.',reason:'单件可数apple缺少a/an。'}],
 }),
 task('guided','item-selection','statement',{
  context:'柜台有一个绿色杯子和一个蓝色杯子。你已决定买绿色杯子。售货伙伴问“Which cup?”，你只说明所选哪一个。',
  prompt:'用“The + 颜色 + one”只回答“绿色的那个”。green = 绿色的，one代替已经提到的单个杯子；不写完整新句。',accepted:['The green one.'],criterion:'The + green + 单数one。',why:'one代替已知的cup；要选的是green，不是另一个blue。',novelty:'柜台购买中根据已决定的颜色完成单件选择答复。',
  counterexamples:[{answer:'The blue one.',reason:'blue选择了另一个杯子。'},{answer:'The green ones.',reason:'ones表示多件，实际选一个杯子。'},{answer:'A green one.',reason:'本题指定用The指选择范围里已确定的那个。'}],
 }),
 task('independent','possessive-owner','statement',{
  context:'你和一位朋友共同买了两张展览票。两张票分别供你们两人使用，你拿着眼前这两张票向入口伙伴说明所属。',
  prompt:'只说“这些是我们的票”。以完整These are开头，物品写tickets（票），用物主限定词，不写人名。',accepted:['These are our tickets.'],criterion:'These are + our + 复数tickets；物主含说话者。',why:'our包括你和朋友；tickets为两张票，配These are。',novelty:'入口交验时说明自己与朋友共同购买的两张票。',
  counterexamples:[{answer:'These are us tickets.',reason:'us不能在tickets前表示所属。'},{answer:'These are their tickets.',reason:'their把说话者排除在物主群体中。'},{answer:'This is our tickets.',reason:'This is与两张tickets的数量不一致。'}],
 }),
 task('independent','single-request','statement',{
  context:'雨天你准备离开借物柜台，自己需要一把雨伞。你直接向柜台伙伴请求把一把伞递给你。',
  prompt:'以Give开头，只请求“给我一把雨伞”。umbrella = 雨伞；使用a或an表示单件，可加句末please。Give后先写接收者，再写物品，不用to结构。',accepted:['Give me an umbrella.','Give me an umbrella please.','Give me an umbrella, please.'],criterion:'Give me + an umbrella。',why:'umbrella以元音音素开头，单件用an；物品给你，用me。',novelty:'雨天离开借物柜台前，为自己借单件遮雨物品。',
  counterexamples:[{answer:'Give me a umbrella.',reason:'umbrella前应为an。'},{answer:'Give us an umbrella.',reason:'us把接收范围扩大到一组人。'},{answer:'Give me some umbrellas.',reason:'some umbrellas请求多把伞，不是单件。'}],
 }),
 task('independent','item-selection','question',{
  context:'朋友让你从伞架拿一把雨伞给他。伞架有一把黑色伞和一把黄色伞，他还没有指定哪一把。你要向他确认选择，物品类别已明说。',
  prompt:'只追问“哪一把雨伞？”。用Which与单数umbrella（雨伞），也可用one指已经提到的单把雨伞。以一个?或？结束。只写Which与本题指定名词或one构成的两个词，不添加其他词。',accepted:['Which umbrella?','Which one?'],criterion:'Which + umbrella或单数one + 一个末尾问号。',why:'未知的是从两把伞中选哪一把，Which符合问题；物主不是这次需要确认的事实。',novelty:'朋友委托取伞时先确认两把候选中的选择。',
  counterexamples:[{answer:'Which umbrellas?',reason:'复数umbrellas没有问单把选择。'},{answer:'Which ones?',reason:'ones表示多件，改变了单件请求。'},{answer:'Whose umbrella?',reason:'改成询问物主，未确认要哪把。'}],
 }),
 task('repair','possessive-owner','statement',{
  context:'两名游客已确认靠近你的这两把雨伞分别是他们的。你不在这个游客组里，正向保管伙伴说明眼前两把伞的所属。',
  prompt:'只说“这些是他们的雨伞”。以完整These are开头，物品写umbrellas，用物主限定词。',accepted:['These are their umbrellas.'],criterion:'These are + their + 复数umbrellas；物主不含说话者。',why:'their说明第三人群体的所属；them是宾格，不放在umbrellas前。两把伞需要复数。',novelty:'保管交接时说明两名游客各自雨伞的共同归属范围。',
  counterexamples:[{answer:'These are them umbrellas.',reason:'them不能作名词前的物主限定词。'},{answer:'These are our umbrellas.',reason:'our错误地把说话者包括在物主中。'},{answer:'These are their umbrella.',reason:'umbrella单数与眼前两把伞不一致。'}],
 }),
 task('repair','single-request','statement',{
  context:'活动结束后，你在衣物柜台等着外出。你需要柜台伙伴给自己一件外套。',
  prompt:'以Give开头，只请求“给我一件外套”。coat = 外套，单件用a或an；可加句末please。Give后先写接收者，再写物品，不用to结构。',accepted:['Give me a coat.','Give me a coat please.','Give me a coat, please.'],criterion:'Give me + a coat。',why:'coat以辅音音素开头，单件用a；me明确物品给说话者自己。',novelty:'活动散场时在柜台为自己领单件外套。',
  counterexamples:[{answer:'Give me an coat.',reason:'coat前应使用a。'},{answer:'Give I a coat.',reason:'Give后需要宾格me。'},{answer:'Give me a coats.',reason:'a与复数coats不一致。'}],
 }),
 task('repair','item-selection','statement',{
  context:'衣架有一件黑色外套与一件绿色外套。你已选黑色的那件。伙伴问“Which coat?”，你需按颜色说明选择。',
  prompt:'只回答“黑色的那件”。用The、black（黑色的）和单数one，不添加其他词。',accepted:['The black one.'],criterion:'The black one；选择已确定的单件黑色外套。',why:'one指已提到的单件coat；black与明确选择一致，不用复数ones。',novelty:'领外套时以颜色选择短语更正单件对象。',
  counterexamples:[{answer:'The green one.',reason:'green选中了另一件外套。'},{answer:'The black ones.',reason:'ones将单件变为多件。'},{answer:'The black one?',reason:'本题要求说明已决定的选择，不再用问号询问。'}],
 }),
 task('review-a','possessive-owner','statement',{
  context:'Ava明确使用she。她的画笔都装在眼前这个包里，并确认这个包只属于她。你向画室伙伴说明包的所属。',
  prompt:'只说“这是她的包”。以完整This is开头，用bag（包）和物主限定词，不写姓名或包内物品。',accepted:['This is her bag.'],criterion:'This is + her + bag；所有人是明说使用she的Ava。',why:'包内有多支画笔，不会把单个bag变成复数；her由物主事实决定。',novelty:'画室用品清点时区分容器数量与包内物品数量。',
  counterexamples:[{answer:'These are her bag.',reason:'眼前只有一个包，These are不合数量。'},{answer:'This is hers bag.',reason:'hers不能直接修饰bag。'},{answer:'This is his bag.',reason:'his与已明确使用she的物主不符。'}],
 }),
 task('review-a','single-request','statement',{
  context:'早餐桌的伙伴负责分水果。你自己想吃一个橙子，直接请求伙伴把一个橙子递给你。',
  prompt:'以Give开头，只请求“给我一个橙子”。orange = 橙子，单件用a或an；可加句末please。Give后先写接收者，再写物品，不用to结构。',accepted:['Give me an orange.','Give me an orange please.','Give me an orange, please.'],criterion:'Give me + an orange。',why:'orange以元音音素开头，单件用an，接收者是me。',novelty:'早餐分水果时以新的单件名词检验an与me。',
  counterexamples:[{answer:'Give me a orange.',reason:'orange前应用an。'},{answer:'Give her an orange.',reason:'her将接收者换成第三人。'},{answer:'Give me oranges.',reason:'oranges没有保留请求一个的数量。'}],
 }),
 task('review-a','item-selection','question',{
  context:'更衣室伙伴说要借一件外套。衣架上只有一件蓝色外套和一件黑色外套；对方尚未说选哪件，外套类别已在前一句明确。',
  prompt:'只追问“哪件外套？”。用Which与coat（外套），也可用one代替已明确的单件外套。以一个?或？结束。只写Which与本题指定名词或one构成的两个词，不添加其他词。',accepted:['Which coat?','Which one?'],criterion:'Which + 单数coat或one + 一个末尾问号。',why:'Which询问两件候选中的哪一件；one可代替已经明确的coat。',novelty:'更衣室借用衣物时确认两件候选中的单件。',
  counterexamples:[{answer:'Which coats?',reason:'coats改为询问多件。'},{answer:'Which ones?',reason:'ones与单件借用任务不符。'},{answer:'Which coat??',reason:'问号数量超过本题要求的一个。'}],
 }),
 task('review-b','possessive-owner','statement',{
  context:'你和室友共同买了眼前这几本书供二人使用。你拿着这些书向搬家伙伴说明它们的物主，物主组包括你。',
  prompt:'只说“这些是我们的书”。以完整These are开头，用books（书）和物主限定词，不添加其他信息。',accepted:['These are our books.'],criterion:'These are + our + books；物主组含说话者，物品为多本。',why:'our表示包含说话者的群体所属；多本书用books与These are。',novelty:'搬家装箱时说明自己和室友共同买下的多本书。',
  counterexamples:[{answer:'These are ours books.',reason:'ours是独立形式，不能直接放在books前。'},{answer:'These are their books.',reason:'their将说话者排除出物主群体。'},{answer:'These are our book.',reason:'book单数没有保留多本的事实。'}],
 }),
 task('review-b','single-request','statement',{
  context:'你帮助家人准备午餐，正向负责备料的伙伴请求把一个鸡蛋递给你。你是接收鸡蛋的人。',
  prompt:'以Give开头，只请求“给我一个鸡蛋”。egg = 鸡蛋，单件用a或an；可加句末please。Give后先写接收者，再写物品，不用to结构。',accepted:['Give me an egg.','Give me an egg please.','Give me an egg, please.'],criterion:'Give me + an egg。',why:'egg以元音音素开头，单件用an；协助备料不改变接收者是你自己。',novelty:'午餐备料时领取一个鸡蛋，而非水果或外套。',
  counterexamples:[{answer:'Give me a egg.',reason:'egg前应使用an。'},{answer:'Give us an egg.',reason:'us扩大了本题明确的接收对象。'},{answer:'Give me some eggs.',reason:'some eggs请求多枚，不是一个。'}],
 }),
 task('review-b','item-selection','statement',{
  context:'帽架有一顶黄色有檐帽和一顶蓝色有檐帽。你决定戴黄色的那顶。伙伴问“Which cap?”，你要简短说明已作出的选择。',
  prompt:'只回答“黄色的那个”。用The、yellow（黄色的）和单数one，不添加其他词。',accepted:['The yellow one.'],criterion:'The yellow one；单件帽子选择短语。',why:'yellow是明确选择的颜色；one指前句的单顶cap，不表示多顶。',novelty:'出门选帽时在两顶候选中说明确定的单件颜色。',
  counterexamples:[{answer:'The blue one.',reason:'blue选择了另一顶帽子。'},{answer:'The yellow ones.',reason:'ones改变为多顶选择。'},{answer:'The yellow one?',reason:'问号将明确答复改为确认式询问。'}],
 }),
];
export const {byId,questionsFor,matches}=bindContent(lesson,questions);
