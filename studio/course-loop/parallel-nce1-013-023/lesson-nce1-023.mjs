import {bindContent} from './content-contract.mjs';

export const lesson={
 id:'nce1-23',version:1,book:'NCE1',lessons:[23,24],title:'第 23–24 课 · 请求多件物品，问清是哪一组',
 goal:'用Give + 宾格 + some + 复数物品说明给谁多件东西；用Which + 复数物品或Which ones询问；用位置加ones选定一组。',
 scope:'只核对本题限定的复数递物请求、Which复数询问与The ones on…位置选择短语。每个情境明确接收者、物品类别和两组候选的位置。未匹配不代表其他自然英文整体错误；开放表达由伙伴核对，文字匹配不判断听力、发音或水平。',
 prerequisites:['已接触Give后宾格、some与可数名词复数、which one单件询问；本组对话明确多件以及可替代的物品类别。'],
 source:{groupId:'NCE1-23',route:'/#/nce/NCE1/23?tab=listen',mapRoute:'/map/#/learn/nce1-23',languagePath:'/language/NCE1/23.json',languageSha256:'e81c6aee4443fc3580b423bd1d0e5469d59f70ea8e2148baa8f6def654a624c7',languageFileSha256:'0074a4dee0b5ac390322804fd353351a0b1e750830636b8d5d814781d07de5c3',comicKey:'NCE1-23',comicSha256:'9481fd016c92ec6d785cb76cf847e719ea7cce77cf6d103ef1df8c596a634083',comicPageSha256:'ab5c88b22213cec8fd6370aade1c086b83c7f2222f96fc1742d29c570dc14997',grammarPages:[50,51,52],clips:[
  {target:'plural-request',label:'听some加复数的递物请求；扩展宾格见第24课练习',start:17.14,end:21.18,supportNote:'录音示范Give me some glasses；him/her/us/them接收者变换来自第24课句型与书面练习。'},
  {target:'plural-question',label:'听Which加复数物品询问',start:21.18,end:25.83},
  {target:'location-selection',label:'听ones加on位置选择',start:28.58,end:31.4},
 ]},
 glossary:'人物和场景均为原创。him 他；her 她；us 我们；them 他们或她们。cups 杯子；books 书；tickets 票；plates 盘子；boxes 盒子；bottles 瓶子；spoons 勺子；bags 包。shelf 架子；table 桌子；chair 椅子；desk 书桌；tray 托盘；floor 地板。',
 teaching:[
  {target:'plural-request',title:'some后保留可数名词复数',explanation:'给某人多件可数物品，用Give + him/her/us/them + some + 复数名词。接收者的人称与数由事实决定，不由物品数量决定：给一个人多件也可以说Give him some cups。cups/books加s，boxes在box后加es。每题限定Give开头，可在句末加please，please前逗号可有可无。请求可不写末尾标点，或用一个句号、感叹号（含中文样式），不写问号。',example:'Give her some boxes, please.',meaning:'请给她一些盒子。',check:'宾格对应明确接收者；some后用本题要求的复数，不改成a/an或单数。',source:'plural-request'},
  {target:'plural-question',title:'多件选择用Which…?或Which ones?',explanation:'听者已说需要多件同类物品时，Which + 复数物品?询问哪几件。物品类别已在对话里明确，也可用Which ones?，ones替代复数物品。这里没有be，简短追问本身自然完整。不用Which one询问多件，不用Whose把选择问题改为物主问题。问句恰有一个末尾?或？。',example:'Which books? / Which ones?',meaning:'哪几本书？／哪几个？',check:'Which后是明确类别的复数物品或ones；保留多件选择与一个末尾问号。',source:'plural-question'},
  {target:'location-selection',title:'The ones加位置选定一组',explanation:'同类物品有不同组时，用The ones on the + 地点名词说明要表面上的那一组。ones替代前面明确的复数物品，不能写成one。on表示在表面上，不是under下面或in里面。每题限定只写位置选择短语，不重复物品名词；可不写末尾标点，或用一个句号、感叹号（含中文样式），不写问号。',example:'The ones on the table.',meaning:'桌子上的那些。',check:'The ones保留复数，on和指定地点与事实一致，并保留地点前的the。',source:'location-selection'},
 ],
 own:{id:'own-n23-plural-group',prompt:'设定两组同类物品，每组至少两件，分别放在两个明确位置。请求伙伴把一些物品给一位或一组明确的人；互相问“哪几个”，再按位置选定一组。用真实或虚构场景均可，记录原答并保留订正版。',checks:['Give后的宾格是否对应真实接收者，some后的物品是否为复数？','Which问句是否询问多件，ones是否有明确的前文类别？','选择位置是否区分两组，on是否符合实际的表面位置？'],status:'awaiting-human-review',reviewerPrompt:'请伙伴或老师实际读或听表达，核对接收者、物品数量、候选组与位置，接受自然等义表达。本站不自动判定自由表达正确，也不由文字记录推断听说能力。'},
 intervals:{first:86400000,repair:86400000,subsequent:604800000},rights:'original-authored',contentStatus:'authored-independent-ai-blind-reviewed',
};
const task=(stage,target,form,data)=>({id:`${stage}-n23-${target}`,stage,target,kind:'input',form,...data});
export const questions=[
 task('diagnostic','plural-request','statement',{
  context:'Sam明确使用he。他负责布置茶歇，需要一些杯子。你向物品保管伙伴请求把多个杯子递给Sam。',
  prompt:'以Give开头，只请求“给他一些杯子”。接收者用代词，杯子用cups，数量词用some；可加句末please。Give后先写接收者，再写物品，不用to结构。',accepted:['Give him some cups.','Give him some cups please.','Give him some cups, please.'],criterion:'Give + him + some cups；一位接收者与多件杯子。',why:'Sam使用he，接收者位置用him；杯子多件需要cups，不能因杯子多而把接收者改为them。',novelty:'茶歇布置时给一个负责人分多只杯子，分清人和物品的数。',
  counterexamples:[{answer:'Give he some cups.',reason:'Give后的接收者需用him。'},{answer:'Give them some cups.',reason:'them把一位Sam改成一组接收者。'},{answer:'Give him some cup.',reason:'多件杯子需要复数cups。'}],
 }),
 task('diagnostic','plural-question','question',{
  context:'朋友要借几本书。桌上有一组书，架子上有另一组，他还没说明哪一组。书的类别已在对话中明确。',
  prompt:'只追问“哪几本书？”。用Which与books（书），也可用ones代替已经提到的复数书。以一个?或？结束。只写Which与本题指定名词或ones构成的两个词，不添加其他词。',accepted:['Which books?','Which ones?'],criterion:'Which + books或ones + 一个末尾问号。',why:'对方需要多本，books和ones都保留复数选择；one会变成只问一件。',novelty:'借书时在桌上和架子上的两组之间确认多本选择。',
  counterexamples:[{answer:'Which book?',reason:'book单数未保留借几本的任务。'},{answer:'Which one?',reason:'one把多件选择改为单件。'},{answer:'Whose books?',reason:'Whose询问物主，不询问要哪组。'}],
 }),
 task('diagnostic','location-selection','statement',{
  context:'你要取一组空瓶子。伙伴问“Which bottles?”。架子上有三只空瓶，桌上有三只装满水的瓶子；你已选架子上的空瓶。',
  prompt:'只回答“架子上的那些”。用The ones和on，地点用the shelf（架子），不重复bottles。只写The ones、on及本题指定地点短语，不添加其他词。',accepted:['The ones on the shelf.'],criterion:'The ones on the shelf；多件、表面位置与指定架子一致。',why:'ones指前文明确的多只bottles；架子上的那组才是空瓶。',novelty:'按空满用途取瓶子，通过架子位置区分两组。',
  counterexamples:[{answer:'The one on the shelf.',reason:'one只指单件，实际选一组多只。'},{answer:'The ones on the table.',reason:'桌上的组是装满水的瓶子，不是所选空瓶。'},{answer:'The ones under the shelf.',reason:'under改成架子下方，题目明确在架子上。'}],
 }),
 task('guided','plural-request','statement',{
  context:'Ava明确使用she。她在给礼物分类，需要一些盒子。你向负责库存的伙伴请求把多个盒子递给Ava。',
  prompt:'用“Give + 宾格 + some + 复数物品”请求给她一些盒子。she对应her；box（盒子）的复数加es。可加句末please，只写这条请求。Give后先写接收者，再写物品，不用to结构。',accepted:['Give her some boxes.','Give her some boxes please.','Give her some boxes, please.'],criterion:'Give + her + some boxes。',why:'her对应接收者Ava；box的复数是boxes，some后保持多件。',novelty:'礼物分类时同时核对her和box加es的复数。',
  counterexamples:[{answer:'Give she some boxes.',reason:'接收者位置要用her。'},{answer:'Give her some box.',reason:'缺少多件所需的复数。'},{answer:'Give her a boxes.',reason:'a不能与复数boxes搭配。'}],
 }),
 task('guided','plural-question','question',{
  context:'伙伴请你拿几个盘子。柜台上有一组盘子，托盘上另有一组，你不知道需要哪组。对话已经说明物品是盘子。',
  prompt:'用Which（哪几个）追问选择。盘子写复数plates，也可用复数ones代替已明确的plates；只写这个简短问句，以一个?或？结束。只写Which与本题指定名词或ones构成的两个词，不添加其他词。',accepted:['Which plates?','Which ones?'],criterion:'Which + plates或ones，保留复数，末尾一个问号。',why:'询问的是几只盘子的选择，不问单只，也不根据位置自行猜定。',novelty:'用餐准备时在柜台和托盘两组盘子之间确认。',
  counterexamples:[{answer:'Which plate?',reason:'plate单数改变了取几个的数量。'},{answer:'Which one?',reason:'one指单件而不是多件。'},{answer:'Which plates.',reason:'未使用本题所要求的问号。'}],
 }),
 task('guided','location-selection','statement',{
  context:'布置座位时你要拿一组票。伙伴问“Which tickets?”。桌上和椅子上各有一组票，你已经决定拿桌上的那组。',
  prompt:'用“The ones + on + the地点”只回答“桌子上的那些”。table = 桌子；不重复tickets。只写The ones、on及本题指定地点短语，不添加其他词。',accepted:['The ones on the table.'],criterion:'The ones on the table；复数票与桌面位置一致。',why:'ones替代多张tickets；on the table说明桌面上的那组，不能改成椅子上的另一组。',novelty:'座位布置时按桌面位置领取一组票。',
  counterexamples:[{answer:'The one on the table.',reason:'单数one不代表多张票。'},{answer:'The ones on the chair.',reason:'chair选的是另一组票。'},{answer:'The ones in the table.',reason:'in表示桌子内部，题目明确放在桌面。'}],
 }),
 task('independent','plural-request','statement',{
  context:'你和弟弟一起在入口等候。你向售票伙伴请求给你们两人一些票，“我们”明确包含你自己。',
  prompt:'以Give开头，只请求“给我们一些票”。用接收者代词、some与tickets（票），可加句末please。Give后先写接收者，再写物品，不用to结构。',accepted:['Give us some tickets.','Give us some tickets please.','Give us some tickets, please.'],criterion:'Give + us + some tickets；接收组包括说话者。',why:'“我们”在Give后用us；some tickets保留多张，不用单数ticket。',novelty:'入口等候时代表自己与弟弟请求一组票。',
  counterexamples:[{answer:'Give we some tickets.',reason:'接收者需要宾格us。'},{answer:'Give them some tickets.',reason:'them不包括说话者。'},{answer:'Give us some ticket.',reason:'多张票应写tickets。'}],
 }),
 task('independent','plural-question','question',{
  context:'朋友请你帮忙拿几个盒子，书桌上和地板上各放着一组盒子。盒子类别已明确，但他尚未说要拿哪组。',
  prompt:'只追问“哪几个盒子？”。用Which与复数boxes（盒子），也可用ones代替已明确的复数盒子。以一个?或？结束。只写Which与本题指定名词或ones构成的两个词，不添加其他词。',accepted:['Which boxes?','Which ones?'],criterion:'Which + boxes或ones + 一个末尾问号。',why:'多个盒子的选择要保留复数；不额外问物主或自行选定一个位置。',novelty:'帮助朋友搬物品时在书桌和地板两组盒子间确认。',
  counterexamples:[{answer:'Which box?',reason:'box把多个盒子改为单个。'},{answer:'Whose boxes?',reason:'改为询问物主，没有确认所需哪组。'},{answer:'Which boxes??',reason:'问号必须恰有一个。'}],
 }),
 task('independent','location-selection','statement',{
  context:'活动后的包有两组，一组在椅子上，一组在地板上。你已选椅子上的那组。伙伴问“Which bags?”，你说明要取的组。',
  prompt:'只回答“椅子上的那些”。用The ones和on，地点用the chair（椅子），不重复bags。只写The ones、on及本题指定地点短语，不添加其他词。',accepted:['The ones on the chair.'],criterion:'The ones on the chair；所选组在椅面上。',why:'ones指多个bags；on the chair与明确选择一致，不指地上的另一组。',novelty:'活动结束取包时按椅面位置辨认一组物品。',
  counterexamples:[{answer:'The one on the chair.',reason:'one只指单个包。'},{answer:'The ones on the floor.',reason:'floor选择了另一组。'},{answer:'The ones under the chair.',reason:'under改变了椅面上的位置事实。'}],
 }),
 task('repair','plural-request','statement',{
  context:'两个游客在资料台等书，你不是游客组成员。你向资料台伙伴请求把一些书递给这两位游客。',
  prompt:'以Give开头，只请求“给他们一些书”。用接收者代词、some与books（书），可加句末please。Give后先写接收者，再写物品，不用to结构。',accepted:['Give them some books.','Give them some books please.','Give them some books, please.'],criterion:'Give + them + some books；两位第三人接收多本书。',why:'them表示不含说话者的两名游客；books保留明确的多件。',novelty:'资料台分发时给两个第三人游客一组书。',
  counterexamples:[{answer:'Give they some books.',reason:'Give后需要宾格them。'},{answer:'Give us some books.',reason:'us把说话者加入了接收群体。'},{answer:'Give them some book.',reason:'book单数未保留多本的请求。'}],
 }),
 task('repair','plural-question','question',{
  context:'伙伴请你把一些杯子带到茶歇桌。托盘上与架子上各有一组杯子；他尚未说是哪组，杯子类别已在前一句明说。',
  prompt:'只追问“哪几个杯子？”。用Which与cups（杯子），也可用ones替代已明确的复数杯子。以一个?或？结束。只写Which与本题指定名词或ones构成的两个词，不添加其他词。',accepted:['Which cups?','Which ones?'],criterion:'Which + cups或ones + 一个末尾问号。',why:'所取杯子是多件；ones有明确前文，不会变成单个one。',novelty:'送茶歇用品前确认托盘与架子上的两组杯子。',
  counterexamples:[{answer:'Which cup?',reason:'cup改为单件询问。'},{answer:'Which one?',reason:'one没有保留多件。'},{answer:'Which cups!',reason:'感叹号不能替代本题要求的问号。'}],
 }),
 task('repair','location-selection','statement',{
  context:'你要整理一组书。伙伴问“Which books?”。书桌上和架子上各有一组，你已决定先整理书桌上的那组。',
  prompt:'只说“书桌上的那些”。用The ones、on和the desk（书桌），不重复books。只写The ones、on及本题指定地点短语，不添加其他词。',accepted:['The ones on the desk.'],criterion:'The ones on the desk；复数书与书桌表面位置一致。',why:'ones代替已提到的books；要整理的是desk上的那组，不是架子上的。',novelty:'整理书籍时按先后计划选择书桌上的一组。',
  counterexamples:[{answer:'The one on the desk.',reason:'one指单本，与一组书不同。'},{answer:'The ones on the shelf.',reason:'shelf指另一组。'},{answer:'The ones on the desk?',reason:'问号将已确定的选择答复变成询问。'}],
 }),
 task('review-a','plural-request','statement',{
  context:'Mina明确使用she。她在布置餐桌，需要一些盘子。你向厨房伙伴请求把多个盘子给Mina。',
  prompt:'以Give开头，只请求“给她一些盘子”。用接收者代词、some和plates（盘子），可加句末please。Give后先写接收者，再写物品，不用to结构。',accepted:['Give her some plates.','Give her some plates please.','Give her some plates, please.'],criterion:'Give + her + some plates。',why:'明确的接收者Mina使用she，因此用her；多只盘子用plates。',novelty:'餐桌布置时给一名接收者多只盘子。',
  counterexamples:[{answer:'Give she some plates.',reason:'接收者位置需要her。'},{answer:'Give him some plates.',reason:'him改变了明说使用she的接收者。'},{answer:'Give her some plate.',reason:'some后本题要求复数plates。'}],
 }),
 task('review-a','plural-question','question',{
  context:'伙伴要你取几只瓶子。桌上放着一组瓶子，托盘上放着另一组；他还没有说选哪组，瓶子类别已明确。',
  prompt:'只追问“哪几只瓶子？”。用Which与bottles（瓶子），也可用ones代替已明确的多只瓶子。以一个?或？结束。只写Which与本题指定名词或ones构成的两个词，不添加其他词。',accepted:['Which bottles?','Which ones?'],criterion:'Which + bottles或ones，保留多件与一个末尾问号。',why:'Which询问明确候选中的选择，复数bottles或ones对应几只瓶子。',novelty:'取瓶子时在桌上与托盘上的两组之间确认数量与选择。',
  counterexamples:[{answer:'Which bottle?',reason:'bottle改成询问单只。'},{answer:'Whose bottles?',reason:'Whose改问所属。'},{answer:'Which bottles',reason:'缺少本题要求的一个末尾问号。'}],
 }),
 task('review-a','location-selection','statement',{
  context:'准备甜点时，伙伴问“Which spoons?”。托盘上有一组干净勺子，桌上有一组待洗勺子；你已选托盘上的干净组。',
  prompt:'只回答“托盘上的那些”。用The ones和on，地点用the tray（托盘），不重复spoons。只写The ones、on及本题指定地点短语，不添加其他词。',accepted:['The ones on the tray.'],criterion:'The ones on the tray；明确选择托盘表面上的多只勺子。',why:'ones代替多个spoons；位置区分干净与待洗两组，不能换成table。',novelty:'甜点准备中通过托盘位置区分干净与待洗勺子。',
  counterexamples:[{answer:'The one on the tray.',reason:'单数one不表示一组勺子。'},{answer:'The ones on the table.',reason:'桌上的是待洗组，不是明确所选干净组。'},{answer:'The ones under the tray.',reason:'under把托盘表面改为下方。'}],
 }),
 task('review-b','plural-request','statement',{
  context:'你和同事正在装箱，二人都需要空盒子。你代表包括自己的这个两人组，向库存伙伴请求一些盒子。',
  prompt:'以Give开头，只请求“给我们一些盒子”。用接收者代词、some与boxes（盒子），可加句末please。Give后先写接收者，再写物品，不用to结构。',accepted:['Give us some boxes.','Give us some boxes please.','Give us some boxes, please.'],criterion:'Give + us + some boxes；说话者在接收组内。',why:'us表示含你的两人；boxes是多只box，some后不写box。',novelty:'装箱工作时代表自己与同事领多只空盒子。',
  counterexamples:[{answer:'Give we some boxes.',reason:'we是主格，不用于这个接收者位置。'},{answer:'Give them some boxes.',reason:'them不包含正在请求的说话者。'},{answer:'Give us some box.',reason:'box缺少多件所需复数。'}],
 }),
 task('review-b','plural-question','question',{
  context:'伙伴请你把几个包搬到车上。椅子上与地板上各有一组包；他尚未说哪组，包的类别已在请求里明说。',
  prompt:'只追问“哪几个包？”。用Which与bags（包），也可用ones替代已明确的复数包。以一个?或？结束。只写Which与本题指定名词或ones构成的两个词，不添加其他词。',accepted:['Which bags?','Which ones?'],criterion:'Which + bags或ones + 一个末尾问号。',why:'搬运的是多个包，复数bags与ones都保留这个数；无需猜测位置。',novelty:'装车前在椅面和地面上的两组包之间确认。',
  counterexamples:[{answer:'Which bag?',reason:'bag把多个包改成单个。'},{answer:'Which one?',reason:'one指单件，与多个包不同。'},{answer:'Which bags?!',reason:'本题恰有一个末尾问号，不接受追加感叹号。'}],
 }),
 task('review-b','location-selection','statement',{
  context:'清点空盒子时伙伴问“Which boxes?”。地板上有一组空盒，书桌上有一组装好物品的盒子；你已选地板上的空盒组。',
  prompt:'只回答“地板上的那些”。用The ones和on，地点用the floor（地板），不重复boxes。只写The ones、on及本题指定地点短语，不添加其他词。',accepted:['The ones on the floor.'],criterion:'The ones on the floor；复数盒子与地板表面位置一致。',why:'ones代替多个boxes；地板上的才是所选空盒，不能换成书桌上的组。',novelty:'清点空盒时以地板位置区分已装物品的另一组。',
  counterexamples:[{answer:'The one on the floor.',reason:'one只指一个盒子，不是多只空盒。'},{answer:'The ones on the desk.',reason:'desk上的组已装物品，不是所选空盒。'},{answer:'The ones in the floor.',reason:'in改成地板内部，题目明确放在地板表面。'}],
 }),
];
export const {byId,questionsFor,matches}=bindContent(lesson,questions);
