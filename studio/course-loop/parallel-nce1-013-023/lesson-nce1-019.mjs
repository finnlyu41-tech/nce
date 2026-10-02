import {bindContent} from './content-contract.mjs';

export const lesson={
 id:'nce1-19',version:1,book:'NCE1',lessons:[19,20],title:'第 19–20 课 · 说明状态，把东西交给谁',
 goal:'用am/is/are说明当前状态；用him、her、us、them说明递物对象；询问当前状态并按事实作简短答复。',
 scope:'只核对本题限定的现在状态陈述、Give请求和be一般疑问句或简短答复。人称、状态与递物对象均由情境明说。短句题只写要求的信息；未匹配不代表其他自然表达整体错误。开放表达需伙伴核对，文字匹配不判断听力、发音或水平。',
 prerequisites:['已接触I/you/she/we/they与am/is/are；题目明说说话者、听者和第三人，避免根据名字猜人称。'],
 source:{groupId:'NCE1-19',route:'/#/nce/NCE1/19?tab=listen',mapRoute:'/map/#/learn/nce1-19',languagePath:'/language/NCE1/19.json',languageSha256:'253d96dfc107ca2447b8aa7e912f8b7f3869bcbd546f82883da1b8518f6abfe4',languageFileSha256:'4c78cafba77dabde17207843c0636dcb572c1a9d3a1ff69287dd7dc4a5c24ae8',comicKey:'NCE1-19',comicSha256:'9481fd016c92ec6d785cb76cf847e719ea7cce77cf6d103ef1df8c596a634083',comicPageSha256:'6f010f9ee53d667fd140a0411f9a7d74e71e82c7f9ae52403dc74ccb99b3d63d',grammarPages:[42,43,44],clips:[
  {target:'current-state',label:'听we are的状态陈述与缩写',start:20.85,end:25.26},
  {target:'recipient-request',label:'听递物情境；宾格请求见第20课练习',start:36.94,end:43.66,supportNote:'此片段只提供递物语境；Give him/her/us/them来自第20课句型和书面练习，不宣称课文录音直接示范四个宾格。'},
  {target:'status-exchange',label:'听状态问句与否定简答',start:27.82,end:32.52},
 ]},
 glossary:'人物和场景均为原创。tired 累的；thirsty 渴的；hungry 饿的；cold 冷的；hot 热的；all right 状态良好。cup 杯子；apple 苹果；coat 外套；umbrella 雨伞；tickets 票；books 书。him 他；her 她；us 我们；them 他们或她们。',
 teaching:[
  {target:'current-state',title:'主语决定am、is或are',explanation:'说明现在的状态，I用am，he/she/it用is，we和they用are。I am可缩写为I\'m；we are为we\'re；they are为they\'re；she is为she\'s。we包括说话者，they不包括说话者。本组限定肯定状态陈述，只写给定主语和状态；可不写末尾标点，或用一个句号、感叹号（含中文样式），不写问号。',example:'I am cold. / We\'re hungry. / They are tired.',meaning:'我冷。／我们饿了。／他们累了。',check:'依据明确人物范围选I/she/we/they，并保留am/is/are和当前状态。',source:'current-state'},
  {target:'recipient-request',title:'Give后用宾格说明接收者',explanation:'Give him/her/us/them说明把东西给他、她、我们、他们或她们，不用he/she/we/they作这个位置的接收者。单件可数物品用a或an：a cup，an apple。复数请求可用some tickets。每题限定Give + 指定宾格 + 指定物品短语；可加句末please，please前的逗号可有可无。请求末尾可不写标点，或用一个句号、感叹号（含中文样式）。',example:'Give her an apple, please. / Give us some tickets.',meaning:'请给她一个苹果。／给我们一些票。',check:'接收者与事实一致；单件a/an、复数some和物品数一致。',source:'recipient-request'},
  {target:'status-exchange',title:'先问状态，再按事实简答',explanation:'问当前状态时把be放在主语前：Are you tired? 这里的you可以是一个人或一组人。回答时，个人用Yes, I am或No, I am not/No, I\'m not；一组人由其中一人代表回答，用Yes, we are或No, we are not/No, we aren\'t/No, we\'re not。肯定简答末尾的am/are不缩写。问句必须恰有一个末尾?或？；简答可省略逗号，可不写末尾标点，或用一个句号、感叹号（含中文样式）。',example:'Are you thirsty? — No, we aren\'t.',meaning:'你们渴吗？——不，我们不渴。',check:'疑问语序、人称和事实的肯否均一致；不省掉be，不把肯定简答缩为Yes, we\'re。',source:'status-exchange'},
 ],
 own:{id:'own-n19-state-and-recipient',prompt:'设定一次休息或分发物品的真实或虚构情境。说明自己或一组人的当前状态，问伙伴一个状态问题，按得到的事实回应；再请求把一种物品交给明确的人。记录你原来的表达和后来改写的表达，保留两版。',checks:['I/we/they是否对应实际人物范围，am/are是否匹配？','Give后是否说明正确接收者，物品的单复数是否清楚？','状态问句与简答是否保留当前事实、正确人称和肯否？'],status:'awaiting-human-review',reviewerPrompt:'请伙伴或老师实际读或听表达，核对人称、状态和递物对象，接受自然等义表达并指出需要确认的事实。本站不自动判定自由表达正确，也不由文字记录推断听说能力。'},
 intervals:{first:86400000,repair:86400000,subsequent:604800000},rights:'original-authored',contentStatus:'authored-independent-ai-blind-reviewed',
};
const task=(stage,target,form,data)=>({id:`${stage}-n19-${target}`,stage,target,kind:'input',form,...data});
export const questions=[
 task('diagnostic','current-state','statement',{
  context:'你独自从车站步行到旅馆。接待员问你感觉如何；你现在很累，同行朋友还没到。',
  prompt:'只说“我累了”，用一个现在时肯定句，主语写I，状态词用tired（累的）。不添加其他信息。使用be的一般现在时或其缩写，不使用feel等其他动词。',accepted:['I am tired.',"I'm tired."],criterion:'I + am或\'m + tired；陈述当前个人状态。',why:'现在说的是你自己的感受，I后用am；朋友没有到，不把主语改为we。',novelty:'旅馆接待时说明独自步行后的个人感受。',
  counterexamples:[{answer:'I are tired.',reason:'I后不能用are。'},{answer:'We are tired.',reason:'we把尚未到场的朋友加入了当前状态陈述。'},{answer:'I am not tired.',reason:'not否定了题目明确的疲倦状态。'}],
 }),
 task('diagnostic','recipient-request','statement',{
  context:'茶歇时你对负责递杯子的伙伴说话。Ben用he指代，他需要一个杯子；你自己已有杯子。',
  prompt:'以Give开头，请伙伴给Ben一个杯子。用宾格代词代替Ben，物品写a cup（一个杯子）。只写接收者和物品，可在句末加please。Give后先写接收者，再写物品，不用to结构。',accepted:['Give him a cup.','Give him a cup please.','Give him a cup, please.'],criterion:'Give + him + a cup；please可有可无。',why:'Ben是接收物品的人，he在Give后换为him。a cup说明单件，不说成给自己。',novelty:'茶歇给已明确使用he的第三人分杯子。',
  counterexamples:[{answer:'Give he a cup.',reason:'接收者位置需要宾格him。'},{answer:'Give me a cup.',reason:'me把接收者换成了说话者。'},{answer:'Give him cup.',reason:'单件可数cup缺少a。'}],
 }),
 task('diagnostic','status-exchange','question',{
  context:'你带两位伙伴走到休息点。你不知道他们是否渴，要直接向这两位伙伴询问他们现在的感受。',
  prompt:'只问“你们渴吗？”，用you指听者，状态词用thirsty（渴的）。写一个现在时一般疑问句，以一个?或？结束。使用be的一般现在时，把be放在主语前，不使用feel等其他动词。',accepted:['Are you thirsty?'],criterion:'Are + you + thirsty + 单个末尾问号。',why:'询问听者现在的状态，are移到you前；不能用they向别人转问。',novelty:'到休息点后直接向两名听者询问喝水需求。',
  counterexamples:[{answer:'You are thirsty?',reason:'本题要求be在主语前的一般疑问句。'},{answer:'Are they thirsty?',reason:'they改为向别人询问第三人，与直接问两名听者不同。'},{answer:'Were you thirsty?',reason:'were询问过去，题目问现在。'}],
 }),
 task('guided','current-state','statement',{
  context:'你和同事在露天服务台值班。你们两人现在都冷；你代表两人向负责人说明现状。',
  prompt:'用“We + are + 状态词”说明“我们冷”。cold = 冷的。可把We are缩写为We\'re；只写这一条肯定信息。使用be的一般现在时或其缩写，不使用feel等其他动词。',accepted:['We are cold.',"We're cold."],criterion:'We + are或\'re + cold。',why:'we包括说话者和同事；复数主语we用are，不用am。',novelty:'露天值班时代表自己和同事汇报共同的当前状态。',
  counterexamples:[{answer:'We am cold.',reason:'we不能配am。'},{answer:'They are cold.',reason:'they把说话者排除在共同状态之外。'},{answer:'We are hot.',reason:'hot（热的）与cold相反。'}],
 }),
 task('guided','recipient-request','statement',{
  context:'野餐前你向拿着水果篮的伙伴请求递水果。Ava用she指代，她想要一个苹果。',
  prompt:'用“Give + 宾格 + 单件物品”请伙伴给Ava一个苹果。she作接收者用her；苹果用apple，选择a或an。可加句末please，不补其他信息。Give后先写接收者，再写物品，不用to结构。',accepted:['Give her an apple.','Give her an apple please.','Give her an apple, please.'],criterion:'Give + her + an apple。',why:'her表示已明确的女性接收者；apple以元音音素开头，单件用an。',novelty:'野餐分水果时同时核对her与an。',
  counterexamples:[{answer:'Give she an apple.',reason:'Give后需要宾格her。'},{answer:'Give her a apple.',reason:'apple前应用an。'},{answer:'Give him an apple.',reason:'him把接收者改为使用he的人。'}],
 }),
 task('guided','status-exchange','statement',{
  context:'伙伴直接问你“Are you hungry?”。你个人现在确实饿了，旁边的其他人没有回答。',
  prompt:'只用“Yes + I + be”的现在时简短肯定答复；可以省略Yes后的逗号。hungry = 饿的。不添加原因。',accepted:['Yes, I am.','Yes I am.'],criterion:'Yes + I + am；肯定简答不缩写末尾am。',why:'你回答自己的状态，you转为I。简短肯定答复的am保留完整形式。',novelty:'伙伴问到个人是否需要吃东西时作明确肯定简答。',
  counterexamples:[{answer:"Yes, I'm.",reason:'肯定简答末尾am不能这样缩写。'},{answer:'Yes, we are.',reason:'we未经事实确认加入了其他人。'},{answer:'No, I am not.',reason:'No否定了当前已明确的饥饿状态。'}],
 }),
 task('independent','current-state','statement',{
  context:'摄影队刚到山顶，你留在车里并没有参加攀登。摄影队两人亲口说现在渴；你向司机转述他们的状态。',
  prompt:'只说“他们渴了”。主语写They，状态词用thirsty（渴的），写一个现在时肯定句。使用be的一般现在时或其缩写，不使用feel等其他动词。',accepted:['They are thirsty.',"They're thirsty."],criterion:'They + are或\'re + thirsty；不包括说话者。',why:'转述的是不含你的摄影队，they符合人物范围；当前状态用are。',novelty:'留在车里的转述者报告刚到山顶的摄影队状态。',
  counterexamples:[{answer:'We are thirsty.',reason:'we把未攀登的说话者加入了状态。'},{answer:'They is thirsty.',reason:'they要求are。'},{answer:'They were thirsty.',reason:'were把当前状态改为过去。'}],
 }),
 task('independent','recipient-request','statement',{
  context:'你和姐姐准备进入展馆。你向售票伙伴请求给自己与姐姐一些票，二人都包含在你说的“我们”中。',
  prompt:'以Give开头，只请求“给我们一些票”。tickets = 票，物品短语用some tickets；接收者用代词。可加句末please。Give后先写接收者，再写物品，不用to结构。',accepted:['Give us some tickets.','Give us some tickets please.','Give us some tickets, please.'],criterion:'Give + us + some tickets；宾格含说话者与姐姐。',why:'Give后的“我们”用us，不是we；some tickets明确请求复数票。',novelty:'展馆入口由一人代表自己和姐姐领票。',
  counterexamples:[{answer:'Give we some tickets.',reason:'接收者位置应用us。'},{answer:'Give them some tickets.',reason:'them不含说话者，改变了接收群体。'},{answer:'Give us some ticket.',reason:'some后本题请求的是复数tickets。'}],
 }),
 task('independent','status-exchange','question',{
  context:'你打电话给刚跑完步的伙伴。你不知道对方现在累不累，直接询问对方的当前感受。',
  prompt:'只问“你累吗？”。用you和tired（累的），写现在时一般疑问句，以一个?或？结束。使用be的一般现在时，把be放在主语前，不使用feel等其他动词。',accepted:['Are you tired?'],criterion:'Are you tired?；直接询问听者当前状态。',why:'跑步结束不等于一定累，需问当前状态。现在的you与are搭配。',novelty:'电话里确认刚跑完步的伙伴当前感受而不先作推断。',
  counterexamples:[{answer:'Am you tired?',reason:'you不与am搭配。'},{answer:'Are you not tired?',reason:'加入not改变了中性询问的方向。'},{answer:'Are you tired.',reason:'陈述句号没有完成要求的问句标点。'}],
 }),
 task('repair','current-state','statement',{
  context:'你在厨房烤面包，打开窗前先向同住者说自己的感受。你现在热；同住者仍觉得冷。',
  prompt:'只说明“我热了”。主语写I，状态词用hot（热的），用现在时肯定句。使用be的一般现在时或其缩写，不使用feel等其他动词。',accepted:['I am hot.',"I'm hot."],criterion:'I + am或\'m + hot；保持个人当前事实。',why:'你的hot与同住者的cold不同；不能替换状态或把两个人合成we。',novelty:'烘焙后的开窗协商里区分两个人的不同感受。',
  counterexamples:[{answer:'I am cold.',reason:'cold是同住者的状态。'},{answer:'I is hot.',reason:'I后需要am。'},{answer:'I am hot?',reason:'本题要告知事实的肯定陈述。'}],
 }),
 task('repair','recipient-request','statement',{
  context:'你请柜台伙伴给两个在门外等候的游客一些书。这两位游客都不包括你，也不是正在与你说话的柜台伙伴。',
  prompt:'以Give开头，只请求“给他们一些书”。用接收者代词和some books（一些书），可加句末please。Give后先写接收者，再写物品，不用to结构。',accepted:['Give them some books.','Give them some books please.','Give them some books, please.'],criterion:'Give + them + some books；对象是两位第三人。',why:'them表示门外两位游客；they是主格，不放在这个接收者位置。',novelty:'柜台分发书籍时把第三人游客与柜台听者分开。',
  counterexamples:[{answer:'Give they some books.',reason:'接收者应为宾格them。'},{answer:'Give us some books.',reason:'us把说话者包括在接收群体中。'},{answer:'Give them a books.',reason:'a与复数books不一致。'}],
 }),
 task('repair','status-exchange','statement',{
  context:'负责人直接问你和同伴“Are you cold?”。你们两人都不冷，你作为其中一人代表两人回答。',
  prompt:'写一个简短否定答复，意思是“不，我们不冷”。只写No、we与否定be，不重复cold；可用缩写，可省略No后的逗号。',accepted:['No, we are not.','No we are not.',"No, we aren't.","No we aren't.","No, we're not.","No we're not."],criterion:'No + we + are not/aren\'t/\'re not。',why:'你代表包括自己的两人回答，用we；不冷需要否定be，不能只写No, we are。',novelty:'共同值守期间代表两人否认寒冷，检验完整与两种自然否定缩写。',
  counterexamples:[{answer:'No, we are.',reason:'No后却接肯定are，缺少not。'},{answer:'No, they are not.',reason:'they把说话者排除，未代表两人回答。'},{answer:'Yes, we are.',reason:'肯定回答与都不冷的事实相反。'}],
 }),
 task('review-a','current-state','statement',{
  context:'你与弟弟错过了午餐，现在两人都饿。你代表你们向准备晚餐的伙伴说明现状。',
  prompt:'只说“我们饿了”。主语写We，状态词用hungry（饿的），写一个现在时肯定句。使用be的一般现在时或其缩写，不使用feel等其他动词。',accepted:['We are hungry.',"We're hungry."],criterion:'We + are或\'re + hungry；含说话者和弟弟。',why:'we涵盖明确的两个人；hungry说明此刻饥饿，不是其他状态。',novelty:'错过午餐后代表自己与弟弟说明吃晚餐的需求。',
  counterexamples:[{answer:'They are hungry.',reason:'they没有把说话者包含在两人中。'},{answer:'We is hungry.',reason:'we要求are。'},{answer:'We are not hungry.',reason:'not否定了两人明确的饥饿状态。'}],
 }),
 task('review-a','recipient-request','statement',{
  context:'雨刚开始。Mina明确使用she，她在门口等伞；你向保管物品的伙伴请求给她一把伞。',
  prompt:'以Give开头，只请求“给她一把雨伞”。用接收者代词，物品写umbrella（雨伞），单件用a或an。可加句末please。Give后先写接收者，再写物品，不用to结构。',accepted:['Give her an umbrella.','Give her an umbrella please.','Give her an umbrella, please.'],criterion:'Give + her + an umbrella；单件伞与已明确接收者一致。',why:'her对应she；umbrella以元音音素开头，单件用an。',novelty:'突然下雨时给门口等候者取单件雨伞。',
  counterexamples:[{answer:'Give she an umbrella.',reason:'she不能用在本题接收者位置。'},{answer:'Give her a umbrella.',reason:'单件umbrella前用an。'},{answer:'Give him an umbrella.',reason:'him改变了已明说使用she的接收者。'}],
 }),
 task('review-a','status-exchange','question',{
  context:'你直接向从冷库出来的一位同事询问现在是否冷。你不知道对方的感受，不根据地点猜答案。',
  prompt:'只问“你冷吗？”。用you与cold（冷的），写一个现在时一般疑问句，以一个?或？结束。使用be的一般现在时，把be放在主语前，不使用feel等其他动词。',accepted:['Are you cold?'],criterion:'Are + you + cold + 一个末尾问号。',why:'这是当前状态的中性询问，不含否定，也不报告过去。',novelty:'冷库门口询问同事当下感受，避免用环境替代确认。',
  counterexamples:[{answer:'You are cold.',reason:'陈述句没有完成询问任务。'},{answer:'Were you cold?',reason:'改问过去的状态。'},{answer:'Are you cold??',reason:'问句要求恰有一个末尾问号。'}],
 }),
 task('review-b','current-state','statement',{
  context:'Ava明确使用she。休息之后她亲口确认自己现在状态良好；你并非Ava，向负责人转述她的当前状态。',
  prompt:'用she说“她现在状态良好”。状态词用all right（状态良好），只写这一句肯定事实。使用be的一般现在时或其缩写，不使用feel等其他动词。只写she、is或其缩写和all right，不添加now等其他词。',accepted:['She is all right.',"She's all right."],criterion:'She + is或缩写 + all right，保留第三人单数当前状态。',why:'she指本人已明确的Ava；第三人单数现在时用is，不把说话者加入，也不改成过去。',novelty:'休息后由第三人转述Ava本人确认的恢复状态。',
  counterexamples:[{answer:'She are all right.',reason:'she为单数，不能用are。'},{answer:'We are all right.',reason:'we加入了说话者并改变人数。'},{answer:'She is not all right.',reason:'否定改变了她本人确认的良好状态。'},{answer:'She was all right.',reason:'was改成过去，未转述当前状态。'}],
 }),
 task('review-b','recipient-request','statement',{
  context:'Leo明确使用he。他准备去室外，想要一件外套；你向衣物保管伙伴请求把单件外套递给Leo。',
  prompt:'以Give开头，只请求“给他一件外套”。用接收者代词与a coat（一件外套），可加句末please。Give后先写接收者，再写物品，不用to结构。',accepted:['Give him a coat.','Give him a coat please.','Give him a coat, please.'],criterion:'Give + him + a coat。',why:'Leo是接收者，he在这个位置用him；单件coat用a。',novelty:'出门前向衣物保管者请求给已明确的第三人一件外套。',
  counterexamples:[{answer:'Give he a coat.',reason:'Give后应用宾格him。'},{answer:'Give her a coat.',reason:'her改变了明确使用he的接收者。'},{answer:'Give him an coat.',reason:'coat以辅音音素开头，单件用a。'}],
 }),
 task('review-b','status-exchange','statement',{
  context:'伙伴直接问你“Are you thirsty?”。你现在不渴；这次只代表你自己回答。',
  prompt:'只写简短否定答复，意思是“不，我不渴”。用No、I和否定be，不重复thirsty；可用缩写，可省略No后的逗号。',accepted:['No, I am not.','No I am not.',"No, I'm not.","No I'm not."],criterion:'No + I + am not或\'m not。',why:'个人答复用I；否定状态保留not，I不用aren\'t。',novelty:'饮水前个人否定简答，区别于代表两人的we答复。',
  counterexamples:[{answer:"No, I aren't.",reason:'I不能使用aren\'t。'},{answer:'No, I am.',reason:'缺少not，未否定当前状态。'},{answer:'Yes, I am.',reason:'肯定答复与不渴的事实相反。'}],
 }),
];
export const {byId,questionsFor,matches}=bindContent(lesson,questions);
