// Original task data; scoring and event history remain in the production model.
import {author,metadata} from '../parallel-nce1-049-059/authoring.mjs';
import {bindContent} from '../parallel-nce1-025-035/content-contract.mjs';
const data=metadata(91,'f688eacca781fecca359a7729389ffc2bea06fd709b6350f09c6ed7794aabecb','将来安排与未决询问','用will报告将来安排，用When询问未知时间，用Will核实尚不确定的行动。',[
 '已学一般过去、现在完成的基本形式；能分清已发生与尚未发生。',
 '91课原文和92课配套句型、书面练习；本组只考will的三种限定输出。'
],[
 {target:'future-arrangement',title:'报告将来的行动或否定安排',explanation:'主语后用will加动词原形；will不随人称变化。will not可缩写won’t。today、tomorrow等要结合情境确认行动尚未发生。92课书面练习明确提供will not和will缩写。',example:'She will not leave tomorrow morning.',meaning:'她明天上午不会离开。',check:'读出行动、是否发生及时间；用will/will not加原形，保留原定时间。'},
 {target:'future-when',title:'时间未知时询问When',explanation:'When + will + 主语 + 动词原形…?询问将来何时做某事。91课的新住户搬入时间还未知，不能把问题改成已知日期的陈述。',example:'When will they move into this house?',meaning:'他们什么时候会搬进这所房子？',check:'When置前，will在主语前，原形不变；未知时间不自行填日期。'},
 {target:'future-whether',title:'核实行动是否会发生',explanation:'Will + 主语 + 动词原形…?核实未来某项行动是否会发生。91课Will you see Ian today?是未知情况的询问；When则预期行动并询问时间，两者信息任务不同。',example:'Will you see her today?',meaning:'你今天会见到她吗？',check:'核实是否发生时用Will前置，保留对象及时间，以问号结束。'}
],[[47.83,62.21,'91课原声I’ll/We’ll miss him；否定will not来自92课书面练习'],[62.21,74.22,'91课原声When will…move into及将来时间回应'],[74.22,83.09,'91课原声Will you see Ian today与Yes, I will']],
 '为一个真实或明确虚构的后勤安排报告一项未来行动和一项不会发生的行动，向伙伴询问一项未知的执行时间，再核实另一项行动是否会发生。');
data.source.pairedExercise={entryId:'NCE1-91',pageKeys:['NCE1-191','NCE1-192'],lessons:[91,92],note:'92课表格的this/tomorrow/the day after tomorrow时间、活动词与will缩写、will not来自已核教材页。原创情境和否定安排是迁移，未声称出现在91课原声。'};
data.limitations=['仅覆盖三个目标，不能代表91–92课所有语言现象通过。','自由输出、实际听感、发音和自然24小时/7天复习等待真人核验。'];
data.contentStatus='authored-blind-reviewed';
const rows=[
 ['社区礼堂今晚停水，但粉刷安排在明天下午，仍会照常进行；你转述她的安排。','用She、will、paint this room、tomorrow afternoon写一个肯定安排。','She will paint this room tomorrow afternoon.',[
  ['She will paints this room tomorrow afternoon.','will后用paint原形。'],['She will not paint this room tomorrow afternoon.','否定了照常进行的安排。'],['She painted this room yesterday afternoon.','已发生与将来不同。'],['She will paint this room tomorrow morning.','下午被改为上午。']],'will加paint报告尚未进行的粉刷，时间是明天下午。',[]],
 ['你为活动安排车位，知道他们将来会到达，但不知道具体何时。','用When、they、will、arrive写一个询问到达时间的问题，不加猜测日期。','When will they arrive?',[
  ['When they will arrive?','直接问句需要will置于they前。'],['When will they arrived?','will后用arrive。'],['Will they arrive?','变成询问会不会到达。'],['When did they arrive?','改成已发生的到达。']],'到达是预期事件，缺的是时间，因此用When will。',[]],
 ['送货窗口需要确认你是否今天会见到维修员，记录还空着；你直接向对方问。','用Will、you、see the mechanic、today核实是否会见面。','Will you see the mechanic today?',[
  ['Will you saw the mechanic today?','will后用see。'],['You will see the mechanic today.','未知情况不能断言。'],['When will you see the mechanic?','题目要核实今天是否见面。'],['Did you see the mechanic today?','变成询问已经发生的事。']],'Will前置核实未决未来行动，保留today与the mechanic。',[]],
 ['轮班表刚取消她今晚来值班的安排，不是推迟到更晚；你通知管理员。','用She、will not、come、this evening写一句否定安排。','She will not come this evening.',[
  ['She will not comes this evening.','will后用come原形。'],['She will come this evening.','取消被改为照常来。'],['She did not come yesterday evening.','不是在报告昨日缺席。'],['She will not come tomorrow evening.','取消的是今晚。']],'will not否定未发生安排，this evening保持今晚。',[]],
 ['一位临时讲师确定会完成工作，设备管理员还不知道何时能关机。','用When、he、will、finish work问完成工作的时间。','When will he finish work?',[
  ['When he will finish work?','will要在he前。'],['When will he finishes work?','will后不用三单形式。'],['Will he finish work?','题目缺的是时间，不是会不会完成。'],['When did he finish work?','过去询问与待完成工作不同。']],'When will he finish work补足未知的执行时间。',[]],
 ['青年旅社还未确定他们明天是否会开车回家，你向领队核实交通安排。','用Will、they、drive home、tomorrow问是否会这样安排。','Will they drive home tomorrow?',[
  ['Will they drove home tomorrow?','will后用drive。'],['They will drive home tomorrow.','尚未确定，不可断言。'],['Will they drive home today?','日期提前一天。'],['When will they drive home?','没有核实明天的安排。']],'未知交通方式和日期一起通过Will核实。',[]],
 ['档案库明天不开放，因此我们后天上午才会扫地。记录只要扫地的肯定安排。','用We、will、sweep the floor报告后天上午的安排；时间短语可自然表达。','We will sweep the floor on the morning of the day after tomorrow.',[
  ['We will swept the floor the day after tomorrow in the morning.','will后用sweep。'],['We will sweep the floor tomorrow morning.','后天被改成明天。'],['We will not sweep the floor the day after tomorrow in the morning.','否定了已有安排。'],['We swept the floor yesterday morning.','未来安排被改为过去记录。']],'封闭与开放日提供不同时间条件，后天上午配will sweep。',['We will sweep the floor in the morning the day after tomorrow.']],
 ['房屋管理员知道新租户（the new people）会搬进这所房子，钥匙发放日期尚未知。','用When、the new people、will、move into this house问时间。','When will the new people move into this house?',[
  ['When the new people will move into this house?','直接疑问需倒装will。'],['When will the new people moved into this house?','will后用move。'],['Will the new people move into this house?','变成询问是否会搬入。'],['When will the new people move out of this house?','搬入变成搬出。']],'未知的是搬入时间，into保留方向。',[]],
 ['陌生的舞台团队还未把行李时间写入记录，你向协调员问他今晚是否会收拾自己的包。','用Will、he、pack his bags、tonight核实安排。','Will he pack his bags tonight?',[
  ['Will he packs his bags tonight?','will后用pack。'],['He will pack his bags tonight.','未决安排被断言。'],['Will he pack her bags tonight?','不是他自己的包。'],['Will he pack his bags tomorrow night?','今晚变成明晚。']],'Will询问未决安排，his bags与tonight维持人物和时间关系。',[]],
 ['另一份气象通知：天气台预测今晚会下雪，场务需按此未来预测做准备。','用It、will、snow、tonight报告肯定预测。','It will snow tonight.',[
  ['It will snows tonight.','will后用snow。'],['It will not snow tonight.','反转肯定预测。'],['It snowed last night.','过去记录不能代替今晚预测。'],['It will rain tonight.','降雪被改为降雨。']],'同一未来结构迁移到天气预测，事件仍是snow。',[]],
 ['另一情境的修车联系人说肯定会修我的车，却没有告诉我时间。','用When、you、will、repair my car直接向联系人问时间。','When will you repair my car?',[
  ['When you will repair my car?','will需置于you前。'],['When will you repaired my car?','will后用repair。'],['Will you repair my car?','已经承诺维修，缺的是时间。'],['When will you repair your car?','需要修的是我的车。']],'对象关系变为直接询问you、my car，信息缺口仍是时间。',[]],
 ['小型演出当天有人只负责预约，不一定理发；你向前台核实她明天是否会理发。','用Will、she、have a haircut、tomorrow问是否发生。','Will she have a haircut tomorrow?',[
  ['Will she has a haircut tomorrow?','will后用have。'],['She will have a haircut tomorrow.','未确认不能断言。'],['Will she make an appointment tomorrow?','预约不是本题核实的理发。'],['Will she have a haircut today?','日期改变。']],'预约与实际理发不同，Will核实后者。',[]],
 ['隔日重新安排：他明天上午会到达，但我们暂时不知道具体钟点。只报告已知安排。','用He、will、arrive、tomorrow morning写一句肯定陈述。','He will arrive tomorrow morning.',[
  ['He will arrives tomorrow morning.','will后用arrive。'],['He will not arrive tomorrow morning.','反转已知安排。'],['He arrived yesterday morning.','已发生与待发生不同。'],['He will arrive tomorrow evening.','上午变成晚上。']],'时间范围已知，肯定陈述无需臆造具体钟点。',[]],
 ['一项新的通信任务：她会给我打电话，但接线员不知道何时，应先询问时间。','用When、she、will、telephone me问时间。','When will she telephone me?',[
  ['When she will telephone me?','will要在主语前。'],['When will she telephoned me?','will后用telephone。'],['Will she telephone me?','没有询问缺失时间。'],['When will she telephone him?','接电话的人被改为him。']],'已预期的通信行动需要When问时间，me保持收话人。',[]],
 ['实验室明天部分关闭，假期计划尚未核实。你向负责人问我们明天是否会休假。','用Will、we、have a holiday、tomorrow写一个核实问题。','Will we have a holiday tomorrow?',[
  ['Will we had a holiday tomorrow?','will后用have。'],['We will have a holiday tomorrow.','未知安排被断言。'],['Will they have a holiday tomorrow?','问的是包含说话人在内的we。'],['Did we have a holiday yesterday?','不是回顾过去。']],'部分关闭不自动等于休假；Will we核实两者关系。',[]],
 ['一周后复访的全新安排：他们后天晚上不会离开，场地方可保留房间。','用They、will not、leave报告后天晚上不会离开的安排；时间短语可自然表达。','They will not leave on the evening of the day after tomorrow.',[
  ['They will not left the day after tomorrow in the evening.','will后用leave。'],['They will leave the day after tomorrow in the evening.','否定安排被反转。'],['They will not leave tomorrow evening.','后天被改为明天。'],['They did not leave yesterday evening.','不在报告已过去的离开。']],'will not说明房间为何需要保留，后天晚上不可提前。',['They will not leave in the evening the day after tomorrow.']],
 ['异地画室会重新粉刷这间房，开课时间需等粉刷完成后再定，先向执行人问时间。','用When、you、will、paint this room直接询问。','When will you paint this room?',[
  ['When you will paint this room?','直接问句将will前置。'],['When will you painted this room?','will后用paint。'],['Will you paint this room?','题目需询问时间。'],['When will you paint that room?','this room被改成另一间。']],'粉刷时间是开课安排的缺口，用When will。',[]],
 ['新的远程登记任务需要确认联系方式：回拨时间还没有约定，你直接问对方今晚是否会给我打电话。','用Will、you、telephone me、tonight核实回拨安排。','Will you telephone me tonight?',[
  ['Will you telephoned me tonight?','will后用telephone。'],['You will telephone me tonight.','未约定不能断言。'],['Will you telephone him tonight?','需要给我回拨，不是him。'],['Will you telephone me tomorrow night?','今晚被改为明晚。']],'联系方式与回拨日期均未约定，Will核实今晚的电话行动。',[]]
];
const authored=author(data,rows);
const contractions=[['will not',"won't"],['I will',"I'll"],['You will',"You'll"],['He will',"He'll"],['She will',"She'll"],['It will',"It'll"],['We will',"We'll"],['They will',"They'll"]];
for(let i=0;i<rows.length;i++){
 const values=[...authored.questions[i].accepted,...rows[i][5]];
 for(const value of [...values]){
  if(value.includes('the day after tomorrow in the morning'))values.push(value.replace('the day after tomorrow in the morning','on the morning of the day after tomorrow'));
  if(value.includes('in the morning the day after tomorrow'))values.push(value.replace('in the morning the day after tomorrow','on the morning of the day after tomorrow'));
  if(value.includes('the day after tomorrow in the evening'))values.push(value.replace('the day after tomorrow in the evening','on the evening of the day after tomorrow'));
  if(value.includes('in the evening the day after tomorrow'))values.push(value.replace('in the evening the day after tomorrow','on the evening of the day after tomorrow'));
 }
 for(const value of [...values])for(const part of ['morning','evening'])if(value.includes('on the '+part+' of the day after tomorrow')){
  values.push(value.replace('on the '+part+' of the day after tomorrow','in the '+part+' of the day after tomorrow'));
  values.push(value.replace('on the '+part+' of the day after tomorrow','the '+part+' of the day after tomorrow'));
 }
 for(const value of [...values]){
  const m=value.match(/^(.*?) (tomorrow morning|tomorrow afternoon|tomorrow evening|tomorrow night|this evening|today|tonight|tomorrow|the day after tomorrow in the morning|the day after tomorrow in the evening|(?:on |in )?the morning of the day after tomorrow|(?:on |in )?the evening of the day after tomorrow)\.$/);
  if(m)values.push(m[2][0].toUpperCase()+m[2].slice(1)+', '+m[1].replace(/^(She|He|It|They|We)\b/,s=>s.toLowerCase())+'.');
  const question=value.match(/^(Will.*?) (today|tomorrow|tonight)\?$/);
  if(question)values.push(question[2][0].toUpperCase()+question[2].slice(1)+', '+question[1][0].toLowerCase()+question[1].slice(1)+'?');
 }
 for(const [from,to] of contractions)for(const value of [...values]){
  values.push(value.replaceAll(from,to));
  values.push(value.replaceAll(from.toLowerCase(),to[0].toLowerCase()+to.slice(1)));
 }
 authored.questions[i].accepted=[...new Set(values.flatMap(v=>[v,v.replaceAll(',','')]))];
}
// Independently proposed bounded variants reviewed for the same facts and lexical constraints.
const independentlyReviewedVariants={"diagnostic-n91-future-arrangement": ["She will paint this room tomorrow afternoon.", "Tomorrow afternoon, she will paint this room.", "She'll paint this room tomorrow afternoon.", "Tomorrow afternoon, she'll paint this room."], "diagnostic-n91-future-when": ["When will they arrive?"], "diagnostic-n91-future-whether": ["Will you see the mechanic today?"], "guided-n91-future-arrangement": ["She will not come this evening.", "This evening, she will not come.", "She won't come this evening.", "This evening, she won't come."], "guided-n91-future-when": ["When will he finish work?"], "guided-n91-future-whether": ["Will they drive home tomorrow?"], "independent-n91-future-arrangement": ["We will sweep the floor in the morning the day after tomorrow.", "We will sweep the floor the day after tomorrow in the morning.", "We will sweep the floor on the morning of the day after tomorrow.", "We will sweep the floor the morning after tomorrow.", "In the morning the day after tomorrow, we will sweep the floor.", "The morning after tomorrow, we will sweep the floor.", "We'll sweep the floor in the morning the day after tomorrow.", "We'll sweep the floor the day after tomorrow in the morning.", "We'll sweep the floor on the morning of the day after tomorrow.", "We'll sweep the floor the morning after tomorrow.", "In the morning the day after tomorrow, we'll sweep the floor.", "The morning after tomorrow, we'll sweep the floor."], "independent-n91-future-when": ["When will the new people move into this house?"], "independent-n91-future-whether": ["Will he pack his bags tonight?"], "repair-n91-future-arrangement": ["It will snow tonight.", "Tonight, it will snow.", "It'll snow tonight.", "Tonight, it'll snow."], "repair-n91-future-when": ["When will you repair my car?"], "repair-n91-future-whether": ["Will she have a haircut tomorrow?"], "review-a-n91-future-arrangement": ["He will arrive tomorrow morning.", "Tomorrow morning, he will arrive.", "He'll arrive tomorrow morning.", "Tomorrow morning, he'll arrive."], "review-a-n91-future-when": ["When will she telephone me?"], "review-a-n91-future-whether": ["Will we have a holiday tomorrow?"], "review-b-n91-future-arrangement": ["They will not leave in the evening the day after tomorrow.", "They will not leave the day after tomorrow in the evening.", "They will not leave on the evening of the day after tomorrow.", "They will not leave the evening after tomorrow.", "In the evening the day after tomorrow, they will not leave.", "The evening after tomorrow, they will not leave.", "They won't leave in the evening the day after tomorrow.", "They won't leave the day after tomorrow in the evening.", "They won't leave on the evening of the day after tomorrow.", "They won't leave the evening after tomorrow.", "In the evening the day after tomorrow, they won't leave.", "The evening after tomorrow, they won't leave."], "review-b-n91-future-when": ["When will you paint this room?"], "review-b-n91-future-whether": ["Will you telephone me tonight?"]};
for(const q of authored.questions)q.accepted=[...new Set([...q.accepted,...(independentlyReviewedVariants[q.id]||[])])];
export const {lesson,questions,byId,questionsFor,matches}=bindContent(data,authored.questions);
