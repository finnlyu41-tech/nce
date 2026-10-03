// Original task data; scoring and event history remain in the production model.
import {author,metadata} from '../parallel-nce1-049-059/authoring.mjs';
import {bindContent} from '../parallel-nce1-025-035/content-contract.mjs';
const data=metadata(95,'5146bba81d784bebc115cb2d5449bfba3ddc2afe29fe17e4a72f03f1238225a0','建议、准确钟点与相对时间','按眼前情况用had better提出建议，核实或报告准确钟点，并区分多久以后与多久以前。',[
 '已学will、When和一般过去；能读整点及分钟，并知道go/went、return/returned。',
 '95课原文与96课钟表、ago/in…time表格和had better书面练习。'
],[
 {target:'had-better-advice',title:'根据当前情况给出建议',explanation:'had better表示现在或将来最好做某事，所有人称形式相同，后接动词原形，不加to。可缩写为’d better。95课回车站的建议与96课书面练习提供此结构，不是过去时had。',example:'We had better go back to the station now.',meaning:'我们现在最好回车站。',check:'先判断该做的行动，再用主语+had better/’d better+原形，保留现在或将来条件。'},
 {target:'exact-clock-time',title:'核实钟点并按状态读准时间',explanation:'What time will…?询问未来事件的钟点；at eight nineteen等表示事件时间。当前钟点可用It is…；past是超过整点的分钟，to是距离下一整点的分钟。95课的钟慢十分钟，实际时间需在钟面读数上加十分钟；原创快钟任务为反向迁移。',example:'It is eight twenty-five.',meaning:'现在是八点二十五分。',check:'区分事件时刻与当前钟点；读取分钟；仅当题干说明快慢时才校正，slow加、fast减，可靠时刻表直接读取。'},
 {target:'relative-time',title:'多久以后与多久以前',explanation:'in two hours或in two hours’ time表示从现在起两小时以后，未来事件用will加原形；two hours ago表示相对于现在两小时前，已发生事件用过去式。96课表格列出minute/hour/day/week/month/year及单复数所有格；time可省略而意思不变。',example:'He will return in two days’ time.',meaning:'他两天以后会返回。',check:'以后用in+时段（可加所有格time），以前用时段+ago；动作和时态按事实匹配。'}
],[[60.69,65.8,'95课原声We had better go back…now；其它建议动作见96课练习A'],[23.44,31.52,'95课原声What time will…及十九分钟过八点；钟慢十分钟另见82.24秒原文'],[86.16,88.77,'95课原声When’s the next train问句片段；in…time末句只引用LRC文本，规则及ago对照来自96课表格']],
 '在真实或明确虚构的等候情境中，依据当前条件给出一项had better建议；向伙伴询问事件的准确钟点并核对钟是否快慢，再报告一项多久以后发生的安排和一项多久以前完成的行动。');
data.source.pairedExercise={entryId:'NCE1-95',pageKeys:['NCE1-198','NCE1-199','NCE1-200'],lessons:[95,96],note:'95课注释提供had better及’d better和in five hours’ time；96课钟表、ago/in…time单复数所有格表与书面练习A/B已逐页核读。快钟计算是原创反向迁移，非原声事实。'};
data.limitations=['仅覆盖三个目标；票务省略句、let’s和现在完成的just missed不计作本组已通过教学。','自由表达、实际听感、发音及自然24小时/7天复习需真人核验。'];
data.contentStatus='authored-blind-reviewed';
const rows=[
 ['我们还在饮品店，发车时间临近。你给同行者提出现在返回车站的建议。','用We、had better、go back to the station、now写一句建议。','We had better go back to the station now.',[
  ['We had better to go back to the station now.','had better后直接接go。'],['We had better went back to the station now.','不是过去式，需go原形。'],['We had better stay at the bar now.','与需要返回车站的行动相反。'],['They had better go back to the station now.','建议涉及包含说话人在内的we。']],'眼前发车风险需要返回建议，had better加go。',[]],
 ['出行公告只确认下一班火车今天发车，没有公布钟点。你向柜台补问准确钟点，好安排去车站的接送。','用What time、will、the next train、leave询问钟点。','What time will the next train leave?',[
  ['What time the next train will leave?','直接问句will需在主语前。'],['What time will the next train leaves?','will后用leave。'],['What time did the next train leave?','待发生不能问过去。'],['Which platform will the next train leave from?','站台不是需要补足的钟点。']],'What time will询问将来事件的精确钟点。',[]],
 ['轮班联络记录：他会从现在起两天以后返回，今天还未返回。','用He、will、return、两天以后写一句未来安排。','He will return in two days’ time.',[
  ['He returned two days ago.','两天以前与两天以后相反。'],['He will returned in two days’ time.','will后用return。'],['He will return in two hours’ time.','两天变成两小时。'],['He will return at two days’ time.','多久以后使用in，不用at。']],'in two days（’ time）是从现在起的间隔。',['He will return in two days.']],
 ['她要去取登记表，你须守住已经领到的钥匙。你向她解释自己现在最好待在这里。','用I、had better、stay here、now写一句建议。','I had better stay here now.',[
  ['I had better to stay here now.','had better后不加to。'],['I had better stayed here now.','需stay原形。'],['I had better leave now.','守钥匙要求留在这里。'],['She had better stay here now.','建议对象是说话人I。']],'当前任务要求I留在这里，had better不是过去时。',[]],
 ['校车负责人已确认这趟列车会在09:17离开，需把时间转述给不看数字时刻表的同伴。','用The train、will leave、at和英文时间词，报告九点十七分发车。','The train will leave at nine seventeen.',[
  ['The train will leave at seventeen minutes to nine.','to nine是八点四十三分。'],['The train will leaves at nine seventeen.','will后用leave。'],['The train left at nine seventeen.','未来安排被改为过去。'],['The train will leave at nine seventy.','分钟读法和数值错误。']],'09:17可以读nine seventeen或seventeen minutes past nine。',['The train will leave at seventeen minutes past nine.','The train will leave at seventeen past nine.']],
 ['材料运输过去由同事处理，但我自己的下一次出行是从现在起一个月以后去悉尼。','用I、will、go to Sydney、一个月以后，只报告我的未来安排。','I will go to Sydney in a month’s time.',[
  ['I went to Sydney a month ago.','题目是我的未来行程。'],['I will went to Sydney in a month’s time.','will后用go。'],['I will go to Sydney in a week’s time.','一个月变成一周。'],['I will go from Sydney in a month’s time.','目的地变成出发地。']],'in a month（’s time）保留从现在起的一个月，to Sydney保留方向。',['I will go to Sydney in a month.','I will go to Sydney in one month.','I will go to Sydney in one month’s time.']],
 ['陌生露营点有人身体不适，你根据需要帮助的当前情况向同伴建议呼叫医生。','用You、had better、call a doctor、now写一句建议。','You had better call a doctor now.',[
  ['You had better to call a doctor now.','不加to。'],['You had better called a doctor now.','需call原形。'],['You had better call a taxi now.','当前建议需要医生。'],['He had better call a doctor now.','向同伴建议用you。']],'依眼前情况给You的行动建议，call a doctor保留对象。',[]],
 ['陌生接待厅的钟显示08:15，但工作人员确认它慢十分钟。你向赶时间的同伴报告实际当前钟点。','用It is和英文时间词，写实际时间，不报告钟面错误读数。','It is eight twenty-five.',[
  ['It is eight fifteen.','慢钟读数不是实际时间。'],['It is eight five.','慢十分钟应加十分钟，不是减。'],['It is twenty-five minutes to eight.','to eight是七点三十五分。'],['It is nine twenty-five.','额外多加了一小时。']],'08:15慢十分钟意味着实际08:25；保留past方向。',['It is twenty-five minutes past eight.','It is twenty-five past eight.','It is eight twenty five.','It is twenty five minutes past eight.','It is twenty five past eight.']],
 ['货物是否赶得上仍需比较等待时长：下一班公交车从现在起二十分钟以后离开。','用The next bus、will leave、二十分钟以后报告未来安排。','The next bus will leave in twenty minutes’ time.',[
  ['The next bus left twenty minutes ago.','未来等待变成过去。'],['The next bus will left in twenty minutes’ time.','will后用leave。'],['The next bus will leave in twenty hours’ time.','分钟变成小时。'],['The next bus will leave at twenty minutes’ time.','间隔时间需in。']],'in twenty minutes表示需等多久，不是钟面几点。',['The next bus will leave in twenty minutes.']],
 ['另一场活动的最后一轮登记快结束了，她还没到登记桌。你向旁人提出她现在最好赶快的建议。','用She、had better、hurry、now写一句。','She had better hurry now.',[
  ['She has better hurry now.','固定结构是had better。'],['She had better to hurry now.','不加to。'],['She had better hurried now.','需hurry原形。'],['She had better wait now.','等候与快结束时需赶快相反。']],'第三人称仍是had better，hurry保持原形。',[]],
 ['另一间设备房的可靠钟显示11:40，需向没有看到钟的人报告当前时间。','用It is和英文时间词，表达十一点四十分。','It is eleven forty.',[
  ['It is forty minutes to eleven.','这是十点二十分。'],['It is twenty minutes past twelve.','这是十二点二十分。'],['It is twelve forty.','小时错一位。'],['It is eleven fourteen.','四十分被改成十四分。']],'11:40也是距十二点二十分钟，所以twenty to twelve可接受。',['It is twenty minutes to twelve.','It is twenty to twelve.','It is forty minutes past eleven.','It is forty past eleven.']],
 ['另一份档案是已发生的访问：他们两小时前去了柏林；现在不要写将来计划。','用They、go to Berlin、两小时以前报告过去记录。','They went to Berlin two hours ago.',[
  ['They will go to Berlin in two hours’ time.','两小时前被改成两小时以后。'],['They go to Berlin two hours ago.','过去需went。'],['They went to Berlin two days ago.','小时变成天。'],['They went from Berlin two hours ago.','前往方向变成离开方向。']],'ago用于从现在往回计算，配went记录已发生行程。',[]],
 ['隔日新任务：地板刚打蜡，行走的人应当小心；你直接提醒对方现在最好小心。','用You、had better、be careful、now写一句建议。','You had better be careful now.',[
  ['You had better to be careful now.','had better后不加to。'],['You had better are careful now.','需be原形。'],['You had better be careless now.','小心被反转为粗心。'],['They had better be careful now.','题目是直接向you建议。']],'状态形容词前也用原形be：had better be careful。',[]],
 ['另一位医生今天会到来，接待人只知道日期，不知道准确钟点，需安排谁在门口等。','用What time、will、the doctor、arrive询问到达钟点。','What time will the doctor arrive?',[
  ['What time the doctor will arrive?','will需在主语前。'],['What time will the doctor arrived?','will后用arrive。'],['What time did the doctor arrive?','待到达不能询问过去。'],['Where will the doctor arrive?','地点不是缺失钟点。']],'已知今天却未知几点，What time will补足等待安排需要。',[]],
 ['隔日新得到的出行安排：我们从现在起两周以后会飞往首尔，不能把别人两周前的经历算作我们的计划。','用We、will、fly to Seoul、两周以后报告计划。','We will fly to Seoul in two weeks’ time.',[
  ['We flew to Seoul two weeks ago.','我们的未来计划被改成过去。'],['We will flew to Seoul in two weeks’ time.','will后用fly。'],['We will fly to Seoul in two months’ time.','两周变成两个月。'],['We will fly from Seoul in two weeks’ time.','飞往变成来自。']],'in two weeks（’ time）锚定当前以后的安排。',['We will fly to Seoul in two weeks.']],
 ['一周后新任务：他还在领证窗口，大家需要等他一起出发；你说明我们现在最好等他。','用We、had better、wait for him、now写一句建议。','We had better wait for him now.',[
  ['We had better to wait for him now.','不加to。'],['We had better waited for him now.','需wait原形。'],['We had better leave without him now.','共同出发要求等待他。'],['We had better wait for her now.','等候对象是him。']],'共同出发的关系要求wait for him，建议使用had better。',[]],
 ['一周后新的器材间时钟显示07:20，但它快五分钟；你只报告实际的当前钟点。','用It is和英文时间词，写实际时间。','It is seven fifteen.',[
  ['It is seven twenty.','快钟读数不能直接当实际时间。'],['It is seven twenty-five.','快五分钟应减五分钟。'],['It is a quarter to seven.','这是六点四十五分。'],['It is eight fifteen.','小时多了一。']],'07:20快五分钟，实际是07:15，也可读a quarter past seven。',['It is fifteen minutes past seven.','It is fifteen past seven.','It is a quarter past seven.','It is quarter past seven.']],
 ['一周后新查到的返程收据：她一周前已经返回东京。只补过去记录，不要改成未来。','用She、return to Tokyo、一周以前报告已发生归程。','She returned to Tokyo a week ago.',[
  ['She will return to Tokyo in a week’s time.','过去一周前变成未来一周后。'],['She return to Tokyo a week ago.','过去需returned。'],['She returned to Tokyo a month ago.','一周变成一月。'],['She returned from Tokyo a week ago.','返回东京变成从东京返回。']],'a week ago与returned共同说明已发生归程。',['She returned to Tokyo one week ago.']]
];
const authored=author(data,rows);
const contractions=[['had better',"'d better"],['will not',"won't"],['I will',"I'll"],['You will',"You'll"],['He will',"He'll"],['She will',"She'll"],['It will',"It'll"],['We will',"We'll"],['They will',"They'll"],['It is',"It's"]];
for(let i=0;i<rows.length;i++){
 const values=[...authored.questions[i].accepted,...rows[i][5]];
 for(const value of [...values]){
  if(value.startsWith('What time will '))values.push(value.replace('What time will ','At what time will '));
  if(value.endsWith(' now.')&&value.includes('had better '))values.push(value.replace('had better ','had better now ').replace(/ now\.$/,'.'));
  const future=value.match(/^(.*?) in (two days|a month|one month|twenty minutes|two weeks)(?:[’']s? time)?\.$/);
  if(future)values.push(future[1]+' '+future[2]+' from now.');
  for(const [word,digit] of [['two','2'],['twenty','20'],['one','1']])if(value.includes(word+' '))values.push(value.replaceAll(word+' ',digit+' '));
 }
 for(const value of [...values]){
  const m=value.match(/^(.*?) (in (?:two days|2 days|a month|one month|1 month|twenty minutes|20 minutes|two weeks|2 weeks)(?:[’']s? time)?|(?:two days|a month|one month|twenty minutes|two weeks) from now|two hours ago|2 hours ago|a week ago|one week ago|1 week ago)\.$/);
  if(m)values.push(m[2][0].toUpperCase()+m[2].slice(1)+', '+m[1].replace(/^(She|He|It|They|We)\b/,s=>s.toLowerCase())+'.');
 }
 for(const [from,to] of contractions)for(const value of [...values]){
  if(from==='had better')values.push(value.replace(/\b(I|You|He|She|It|We|They|you|he|she|it|we|they) had better\b/g,'$1'+to));
  else {values.push(value.replaceAll(from,to));values.push(value.replaceAll(from.toLowerCase(),to[0].toLowerCase()+to.slice(1)));}
 }
 authored.questions[i].accepted=[...new Set(values.flatMap(v=>[v,v.replaceAll(',','')]))];
}
// Independently proposed bounded variants reviewed for the same facts and lexical constraints.
const independentlyReviewedVariants={"diagnostic-n95-had-better-advice": ["We had better go back to the station now.", "Now, we had better go back to the station.", "We'd better go back to the station now.", "Now, we'd better go back to the station."], "diagnostic-n95-exact-clock-time": ["What time will the next train leave?"], "diagnostic-n95-relative-time": ["He will return in two days.", "In two days, he will return.", "He will return in two days' time.", "In two days' time, he will return.", "He'll return in two days.", "In two days, he'll return.", "He'll return in two days' time.", "In two days' time, he'll return."], "guided-n95-had-better-advice": ["I had better stay here now.", "Now, i had better stay here.", "I'd better stay here now."], "guided-n95-exact-clock-time": ["The train will leave at nine seventeen.", "The train will leave at seventeen past nine.", "The train will leave at seventeen minutes past nine.", "The train will leave at nine seventeen in the morning.", "At nine seventeen, the train will leave."], "guided-n95-relative-time": ["I will go to Sydney in a month.", "In a month, I will go to Sydney.", "I will go to Sydney in one month.", "I will go to Sydney in a month's time.", "In a month's time, I will go to Sydney.", "I'll go to Sydney in a month.", "In a month, I'll go to Sydney.", "I'll go to Sydney in one month.", "I'll go to Sydney in a month's time.", "In a month's time, I'll go to Sydney."], "independent-n95-had-better-advice": ["You had better call a doctor now.", "Now, you had better call a doctor.", "You'd better call a doctor now.", "Now, you'd better call a doctor."], "independent-n95-exact-clock-time": ["It is eight twenty-five.", "It is twenty-five past eight.", "It is twenty-five minutes past eight.", "It is eight twenty-five in the morning.", "It's eight twenty-five.", "It's twenty-five past eight.", "It's twenty-five minutes past eight.", "It's eight twenty-five in the morning."], "independent-n95-relative-time": ["The next bus will leave in twenty minutes.", "In twenty minutes, the next bus will leave.", "The next bus will leave in twenty minutes' time.", "In twenty minutes' time, the next bus will leave."], "repair-n95-had-better-advice": ["She had better hurry now.", "Now, she had better hurry.", "She'd better hurry now.", "Now, she'd better hurry."], "repair-n95-exact-clock-time": ["It is eleven forty.", "It is twenty to twelve.", "It is twenty minutes to twelve.", "It's eleven forty.", "It's twenty to twelve.", "It's twenty minutes to twelve."], "repair-n95-relative-time": ["They went to Berlin two hours ago.", "Two hours ago, they went to Berlin."], "review-a-n95-had-better-advice": ["You had better be careful now.", "Now, you had better be careful.", "You'd better be careful now.", "Now, you'd better be careful."], "review-a-n95-exact-clock-time": ["What time will the doctor arrive?"], "review-a-n95-relative-time": ["We will fly to Seoul in two weeks.", "In two weeks, we will fly to Seoul.", "We will fly to Seoul in two weeks' time.", "In two weeks' time, we will fly to Seoul.", "We'll fly to Seoul in two weeks.", "In two weeks, we'll fly to Seoul.", "We'll fly to Seoul in two weeks' time.", "In two weeks' time, we'll fly to Seoul."], "review-b-n95-had-better-advice": ["We had better wait for him now.", "Now, we had better wait for him.", "We'd better wait for him now.", "Now, we'd better wait for him."], "review-b-n95-exact-clock-time": ["It is seven fifteen.", "It is a quarter past seven.", "It is quarter past seven.", "It is fifteen past seven.", "It is fifteen minutes past seven.", "It is seven fifteen in the morning.", "It's seven fifteen.", "It's a quarter past seven.", "It's quarter past seven.", "It's fifteen past seven.", "It's fifteen minutes past seven.", "It's seven fifteen in the morning."], "review-b-n95-relative-time": ["She returned to Tokyo a week ago.", "A week ago, she returned to Tokyo."]};
for(const q of authored.questions)q.accepted=[...new Set([...q.accepted,...(independentlyReviewedVariants[q.id]||[])])];
export const {lesson,questions,byId,questionsFor,matches}=bindContent(data,authored.questions);
