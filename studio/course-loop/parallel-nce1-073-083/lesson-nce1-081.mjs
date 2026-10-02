// Original constrained transfer tasks; assessment remains the existing production model.
import {author,metadata} from '../parallel-nce1-049-059/authoring.mjs';
import {bindContent} from '../parallel-nce1-025-035/content-contract.mjs';
const data=metadata(81,'b82797b2d7868f294a997a229363cb8ce5a2fe860541a79d8dc5efcfb47b02bb','过去经历与眼下或将来','报告吃喝与活动的过去，询问或否定过去，并区别当前进行和将来计划。',[
 '已学一般过去时had与did后原形、am/is/are doing和going to的基本形式。',
 '81课原文与82课配套活动词组；本组不覆盖所有邀请与用餐表达。'
],[
 {target:'past-have-event',title:'过去吃过或做过',explanation:'have的不规则过去式是had。have a meal/a bath/a lesson等可指吃喝或活动经历；已结束日期配had。',example:'We had a lesson yesterday.',meaning:'我们昨天上过一节课。',check:'已结束事件用had，保留活动名词、人物与日期。'},
 {target:'did-have',title:'过去have的询问与否定',explanation:'Did + 主语 + have…?询问过去。主语+did not have…否定过去；did携带过去标记，后面不是had。did not可缩写didn’t。',example:'Did you have a swim yesterday?',meaning:'你昨天游过泳吗？',check:'did后have回原形，分清未知询问与已知否定。'},
 {target:'have-time-contrast',title:'已发生、正在做与打算做',explanation:'had报告过去；am/is/are having表示正在吃喝或进行活动；am/is/are going to have表示将来打算。逐条按情境的时间选形式，不能只根据名词套时态。',example:'She had lunch yesterday but she is having tea now.',meaning:'她昨天吃过午饭，但现在正在喝茶。',check:'过去用had，当前进行用having，将来计划用going to have，各自时间不能互换。'}
],[[54.8,58.63,'81课原声had lunch；82课配套扩展活动搭配'],[61.3,63.42,'81课原声What did you have；did否定由过去式规则迁移'],[22.39,24.6,'81课原声正在having a bath；将来going to have另见71.05秒原文']],
 '描述一项已结束的吃喝或活动，问伙伴是否做过另一项活动，再说明自己此刻正在做什么和明天打算做什么。');
data.source.pairedExercise={entryId:'NCE1-81',pageKey:'NCE1-171',lessons:[81,82],note:'82课活动搭配来自已核原教材练习页；did not与时间对照为规则迁移，不声明每项都在选取的原声clip内。'};
data.limitations=['仅覆盖上述三个目标，不代表整章全部语言现象已覆盖。','开放输出、实际听感、发音与自然24小时/7天复习等待真人验证；即时测试不替代自然等待。'];
const rows=[
 ['昨天社团日报：我在培训之后吃了一顿饭；a meal指一顿饭。','以I开头，用have a meal、after the training写过去陈述。','I had a meal after the training.',[
  ['I have a meal after the training.','本次是昨天。'],['I haved a meal after the training.','过去式had。'],['I had a meal before the training.','先后改变。'],['I had a lesson after the training.','活动改变。']],'had既可指吃饭也可指经历活动。',['After the training, I had a meal.']],
 ['操场日志只记了日期，你问对方昨天有没有游过泳。','用you、have a swim、yesterday，询问那项已结束的活动是否发生。','Did you have a swim yesterday?',[
  ['Did you had a swim yesterday?','did后have。'],['Do you have a swim yesterday?','过去需did。'],['Did he have a swim yesterday?','对象不同。'],['You had a swim yesterday.','未知被断言。']],'Did携带过去标记，have回原形。',['Yesterday, did you have a swim?']],
 ['直播字幕：她现在正在吃午饭；并未描述今晚安排。','用She、have lunch、now写一句表达此刻正在进行的动作。','She is having lunch now.',[
  ['She had lunch now.','当前动作不是过去。'],['She is going to have lunch now.','计划不等于正在进行。'],['She is have lunch now.','需having。'],['She is having dinner now.','餐别改变。']],'is having表示此刻正在吃。',[]],
 ['海边活动昨天已结束：我们昨天上午洗过澡。','用We、have a bath、yesterday morning写过去陈述。','We had a bath yesterday morning.',[
  ['We have a bath yesterday morning.','昨天需had。'],['We did had a bath yesterday morning.','肯定句不重复过去。'],['We had a swim yesterday morning.','活动不同。'],['We had a bath tomorrow morning.','时间改变。']],'have a bath整体用had表达过去。',['Yesterday morning, we had a bath.']],
 ['录音棚的记录显示昨晚他没有办派对；不是没有度假。','用He、have a party、last night写一句否定过去陈述。','He did not have a party last night.',[
  ['He did not had a party last night.','did后原形。'],['He does not have a party last night.','昨晚需did。'],['He had a party last night.','否定反转。'],['He did not have a holiday last night.','活动被换。']],'did not否定已结束事件，have不变过去式。',['Last night, he did not have a party.']],
 ['新开业理发店的预约簿：我打算明天理发，还未开始。','用I、have a haircut、tomorrow写一句表达明确的将来打算。','I am going to have a haircut tomorrow.',[
  ['I am having a haircut now.','计划改为此刻。'],['I had a haircut tomorrow.','过去与明天冲突。'],['I am going to had a haircut tomorrow.','to后have。'],['I am going to have a bath tomorrow.','活动改变。']],'going to have表示明确将来计划。',['Tomorrow, I am going to have a haircut.']],
 ['陌生骑行队的活动记录：Nora上周过了一个假期。','用Nora、have a holiday、last week写过去陈述。','Nora had a holiday last week.',[
  ['Nora has a holiday last week.','过去需had。'],['Nora haved a holiday last week.','错误过去式。'],['Nora had a party last week.','活动改变。'],['Nora had a holiday next week.','时间改变。']],'名字作主语过去仍是had。',['Last week, Nora had a holiday.']],
 ['培训教室出勤信息缺失，你向记录员问他们上周一有没有上一节课。','用they、have a lesson、last Monday，询问那项已结束的活动是否发生。','Did they have a lesson last Monday?',[
  ['Did they had a lesson last Monday?','did后have。'],['Do they have a lesson last Monday?','日期已过去。'],['Did we have a lesson last Monday?','对象改变。'],['They did not have a lesson last Monday.','擅自否定未知事实。']],'Did…have结构也可询问活动。',['Last Monday, did they have a lesson?']],
 ['旅行日志区分时间：我们昨天吃过晚饭，现在正在喝茶。','以We开头，用have dinner、yesterday、but、we、have tea、now连接一句，按每项时间选择动词形式。','We had dinner yesterday but we are having tea now.',[
  ['We have dinner yesterday but we are having tea now.','昨天需had。'],['We had dinner yesterday but we had tea now.','now需当前进行。'],['We had dinner yesterday but we are going to have tea now.','正在做改成计划。'],['We had tea yesterday but we are having dinner now.','活动互换。']],'had记录已结束事件，are having记录当下动作。',[]],
 ['修补另一份场馆报告：他昨天理了发，时间并非明天。','用He、have a haircut、yesterday写过去陈述。','He had a haircut yesterday.',[
  ['He has a haircut yesterday.','现在式不符。'],['He did had a haircut yesterday.','重复过去标记。'],['He had a haircut tomorrow.','时间改变。'],['She had a haircut yesterday.','人物改变。']],'have的不规则过去式为had。',['Yesterday, he had a haircut.']],
 ['核对另一份早餐记录：我们昨天没有吃早餐。','用We、have breakfast、yesterday写一句否定过去陈述。','We did not have breakfast yesterday.',[
  ['We did not had breakfast yesterday.','did后原形。'],['We do not have breakfast yesterday.','过去用did。'],['We had breakfast yesterday.','否定消失。'],['We did not have lunch yesterday.','餐别改变。']],'did not have保留否定过去事实。',['Yesterday, we did not have breakfast.']],
 ['这次修补时间判断：Leo现在正在洗澡，昨天他游过泳。','以Leo开头，用have a bath、now、but、he、have a swim、yesterday连接一句，按每项时间选择动词形式。','Leo is having a bath now but he had a swim yesterday.',[
  ['Leo had a bath now but he had a swim yesterday.','当前不能用had。'],['Leo is having a bath now but he has a swim yesterday.','昨天不能用has。'],['Leo is going to have a bath now but he had a swim yesterday.','实际进行改为计划。'],['Leo is having a swim now but he had a bath yesterday.','活动对应颠倒。']],'每条事实的时态跟自己的时间配对。',[]],
 ['隔日博物馆志愿者回报：她昨天吃过午饭。','用She、have lunch、yesterday写过去陈述。','She had lunch yesterday.',[
  ['She has lunch yesterday.','过去用had。'],['She haved lunch yesterday.','错误过去式。'],['She had dinner yesterday.','餐别不同。'],['She had lunch tomorrow.','时间不同。']],'had lunch的过去含义不受she影响。',['Yesterday, she had lunch.']],
 ['另一份夏令营安排已经结束，你问她昨天有没有举办过派对；直接向她提问。','用you、have a party、yesterday，询问那项已结束的活动是否发生。','Did you have a party yesterday?',[
  ['Did you had a party yesterday?','原形have。'],['Do you have a party yesterday?','过去需did。'],['Did she have a party yesterday?','直接提问用you。'],['Did you have a holiday yesterday?','活动改变。']],'直接问听者用you，不因中文她误换对象。',['Yesterday, did you have a party?']],
 ['两队对照安排：他们昨天上过课，但明天打算度假。','以They开头，用have a lesson、yesterday、but、they、have a holiday、tomorrow连接一句，表达已经发生与明确打算。','They had a lesson yesterday but they are going to have a holiday tomorrow.',[
  ['They have a lesson yesterday but they are going to have a holiday tomorrow.','昨天需had。'],['They had a lesson yesterday but they had a holiday tomorrow.','明天是计划。'],['They had a holiday yesterday but they are going to have a lesson tomorrow.','活动对应反转。'],['They had a lesson yesterday but they are going to had a holiday tomorrow.','to后have。']],'过去与将来在同一句各用对应形式。',[]],
 ['新一周读书会发来上周五记录：他们举行过一场派对。','用They、have a party、last Friday写过去陈述。','They had a party last Friday.',[
  ['They have a party last Friday.','过去需had。'],['They haved a party last Friday.','错误过去式。'],['They had a lesson last Friday.','事件改变。'],['They had a party next Friday.','日期改变。']],'have a party整体用had报告已结束事件。',['Last Friday, they had a party.']],
 ['另一条课后回报明确写着她上周没有度假。','用She、have a holiday、last week写一句否定过去陈述。','She did not have a holiday last week.',[
  ['She did not had a holiday last week.','did后have。'],['She does not have a holiday last week.','过去用did。'],['She had a holiday last week.','有无反转。'],['She did not have a haircut last week.','活动改变。']],'第三人称的过去否定仍是did not have。',['Last week, she did not have a holiday.']],
 ['另一场音乐节直播：我现在正在吃晚饭，但明天打算游泳。','以I开头，用have dinner、now、but、I、have a swim、tomorrow连接一句，表达正在进行与明确打算。','I am having dinner now but I am going to have a swim tomorrow.',[
  ['I had dinner now but I am going to have a swim tomorrow.','眼下需进行式。'],['I am having dinner now but I had a swim tomorrow.','计划不能用过去。'],['I am going to have dinner now but I am having a swim tomorrow.','时间意义改变。'],['I am having lunch now but I am going to have a swim tomorrow.','餐别改变。']],'am having与am going to have区分正在做和将来计划。',[]]
];
const authored=author(data,rows);
const contractions=[['did not',"didn't"],['I am',"I'm"],['She is',"She's"],['We are',"We're"],['They are',"They're"],['we are',"we're"],['they are',"they're"],['Leo is',"Leo's"]];
for(let i=0;i<rows.length;i++){
 const values=[...authored.questions[i].accepted,...rows[i][5]];
 for(const [from,to] of contractions)for(const value of [...values])if(value.includes(from))values.push(value.replaceAll(from,to));
 authored.questions[i].accepted=[...new Set(values)];
}
export const {lesson,questions,byId,questionsFor,matches}=bindContent(data,authored.questions);
