// Original constrained transfer tasks; assessment remains the existing production model.
import {author,metadata} from '../parallel-nce1-049-059/authoring.mjs';
import {bindContent} from '../parallel-nce1-025-035/content-contract.mjs';
const data=metadata(83,'fa135ee47799f0b347484be280cfffb8c721b639cc576e3c1e8c6af04d020169','当前完成与确定过去','使用have/has had报告或询问当前完成状态，区别确定过去日期的had。',[
 '已学81–82课have搭配活动、had与did；熟悉主语与have/has一致。',
 '83课原文与84课配套Have you had练习；只覆盖have的完成结构，不推广所有现在完成时规则。'
],[
 {target:'perfect-completion',title:'到现在已经、刚刚或还没有',explanation:'have/has had使用have作助动词、had作过去分词。already表示已经，just表示刚刚，not…yet表示截至现在尚未完成。第三人称单数用has。',example:'She has not had lunch yet.',meaning:'她到现在还没有吃午饭。',check:'have/has跟主语一致，后接had，already/just/yet保留完成状态。'},
 {target:'perfect-have-question',title:'核实截至当前是否完成',explanation:'Have/Has + 主语 + had…yet?询问到现在是否吃过或做过。前面的Have/Has是助动词，had不能换成have；未知情况不可改成断言。配套84课提供Have you had…练习。',example:'Has he had any fruit yet?',meaning:'他到现在吃过水果了吗？',check:'Have/Has前置、had保留，以yet询问当前完成状态并保留问号。'},
 {target:'past-or-current-completion',title:'确定过去时间与当前完成',explanation:'yesterday、last Monday等确定已结束时间用had；眼下是否需要吃喝、刚完成而不指定过去时间用have/has had。83课原文把already had与at half past twelve的had作对照。',example:'I had lunch yesterday but I have just had some tea.',meaning:'我昨天吃了午饭，但刚刚喝过些茶。',check:'先读时间和当前后果：明确过去日期用had；当前完成用have/has had。'}
],[[33.18,39.98,'83课原声already had对照确定过去时刻had'],[42.93,49.96,'83课原声just had；Have/Has…had疑问见84课配套练习'],[83.46000000000001,88.1,'83课原声already had my holiday；确定过去时刻另见35.97秒原文']],
 '在一个真实或明确虚构的接待情境说出已经完成、刚完成和尚未完成的吃喝或活动，核实同伴到现在是否完成，再报告一项有明确过去日期的经历。');
data.source.pairedExercise={entryId:'NCE1-83',pageKey:'NCE1-175',lessons:[83,84],note:'84课Have you had与食品词来自已核原教材练习页；has、否定yet为教学迁移，不声明每项都在83课原声中。'};
data.limitations=['仅覆盖上述三个目标，不代表整章全部语言现象已覆盖。','开放输出、实际听感、发音与自然24小时/7天复习等待真人验证；即时测试不替代自然等待。'];
const rows=[
 ['你刚到救援站，工作人员递来午餐。你已经吃过午饭，强调眼下无需再吃。','用I、have lunch、already写一句表达当前已完成，不加具体过去时刻。','I have already had lunch.',[
  ['I has already had lunch.','I配have。'],['I have already have lunch.','需分词had。'],['I have not had lunch yet.','完成反转。'],['I had lunch yesterday.','转为题外具体过去时间。']],'have+had报告当前完成状态，already表示已经。',['I have had lunch already.']],
 ['游泳班集合时，你核实他们到现在有没有吃早餐，结果还未知。','用they、have breakfast、yet，询问截至当前是否完成。','Have they had breakfast yet?',[
  ['Has they had breakfast yet?','they配have。'],['Have they have breakfast yet?','完成式用had。'],['They have had breakfast.','未知改为断言。'],['Did they have breakfast yesterday?','问题改为昨天。']],'Have…had…yet询问截至当前的完成情况。',[]],
 ['剪辑员只要昨日活动时间：我昨天吃了晚饭，不是在报告到现在的完成状态。','用I、have dinner、yesterday写过去陈述。','I had dinner yesterday.',[
  ['I have had dinner yesterday.','确定过去时间用had。'],['I have dinner yesterday.','过去式遗漏。'],['I had lunch yesterday.','餐别改变。'],['I had dinner tomorrow.','日期改变。']],'yesterday限定已结束的过去，使用had。',['Yesterday, I had dinner.']],
 ['咖啡讲座现场，她刚喝过一杯茶，现在不再领茶。','用She、have a cup of tea、just写一句表达当前刚完成。','She has just had a cup of tea.',[
  ['She have just had a cup of tea.','she配has。'],['She has just have a cup of tea.','需分词had。'],['She has not had a cup of tea yet.','刚完成改为未完成。'],['She has just had a cup of coffee.','饮品改变。']],'has just had表达刚完成，保留tea。',[]],
 ['徒步接驳站，你向负责人核实Leo截至现在有没有吃午饭。','用Leo、have lunch、yet，询问截至当前是否完成。','Has Leo had lunch yet?',[
  ['Have Leo had lunch yet?','Leo单数用has。'],['Has Leo have lunch yet?','需had。'],['Has Leo had dinner yet?','餐别不同。'],['Leo has already had lunch.','询问变断言。']],'Has位于姓名前，had仍保留。',[]],
 ['航班候机室现在发晚餐券；她已经吃过晚饭，所以不需要。','用She、have dinner、already写一句表达当前已完成，不加过去日期。','She has already had dinner.',[
  ['She had dinner yesterday.','需当前完成情况。'],['She have already had dinner.','she配has。'],['She has already have dinner.','需had。'],['She has not had dinner yet.','完成状态反转。']],'当前需不需要餐券由has already had表达。',['She has had dinner already.']],
 ['陌生的户外电影场正在发饮品：我们到现在还没喝过任何牛奶，等待领取。','用We、have any milk、yet写一句表达截至当前尚未完成的否定。','We have not had any milk yet.',[
  ['We has not had any milk yet.','we配have。'],['We have not have any milk yet.','需had。'],['We have already had some milk.','未完成变完成。'],['We did not have any milk yesterday.','日期与当前状态不同。']],'not…yet表示直到当前尚未完成。',[]],
 ['社区比赛中，你直接询问对方到现在有没有吃过一些水果；any fruit指一些水果。','用you、have any fruit、yet，询问截至当前是否完成。','Have you had any fruit yet?',[
  ['Has you had any fruit yet?','you配have。'],['Have you have any fruit yet?','需had。'],['Have we had any fruit yet?','对象不同。'],['Did you have any fruit yesterday?','询问改为昨日。']],'Have you had从餐食迁移到不可数fruit。',[]],
 ['博物馆值班册只记录上周一的一节课：他们那天上过课。','用They、have a lesson、last Monday写过去陈述。','They had a lesson last Monday.',[
  ['They have had a lesson last Monday.','确定过去日期用had。'],['They have a lesson last Monday.','过去式缺失。'],['They had a holiday last Monday.','事件改变。'],['They had a lesson next Monday.','日期改变。']],'last Monday明确过去，不用当前完成式。',['Last Monday, they had a lesson.']],
 ['修补完成状态时换一个情境：旅行社的她到现在还没有度过自己的假期。','用She、have her holiday、yet写一句表达截至当前尚未完成的否定。','She has not had her holiday yet.',[
  ['She have not had her holiday yet.','she配has。'],['She has not have her holiday yet.','需had。'],['She has already had her holiday.','未完成变已完成。'],['She has not had his holiday yet.','所属对象改变。']],'has not had…yet保留人物、所属和未完成。',[]],
 ['修补另一句未知询问：你问两位朋友到现在有没有喝过茶，向记录员而非朋友发问。','用they、have any tea、yet，询问截至当前是否完成。','Have they had any tea yet?',[
  ['Has they had any tea yet?','they配have。'],['Have they have any tea yet?','需had。'],['Have you had any tea yet?','向记录员问朋友用they。'],['They have already had some tea.','擅自断言。']],'对象由情境决定，they配Have。',[]],
 ['另一项时间判断：他刚游完泳，重点是眼下已完成，不给几点或哪天。','用He、have a swim、just写一句表达当前刚完成。','He has just had a swim.',[
  ['He had a swim yesterday.','改成具体过去记录。'],['He have just had a swim.','he配has。'],['He has just have a swim.','需had。'],['He has not had a swim yet.','状态反转。']],'不指定过去时间、强调刚完成，用has just had。',[]],
 ['隔日舞台排练新记录：他们已经吃过一些橙子，当前点心不再需要橙子。','用They、have some oranges、already写一句表达当前已完成。','They have already had some oranges.',[
  ['They has already had some oranges.','they配have。'],['They have already have some oranges.','需had。'],['They have not had any oranges yet.','状态反转。'],['They have already had some apples.','水果改变。']],'already had说明当前完成，some oranges保留食物。',['They have had some oranges already.']],
 ['另一间休息室，你向同事核实Ada到现在有没有洗过澡。','用Ada、have a bath、yet，询问截至当前是否完成。','Has Ada had a bath yet?',[
  ['Have Ada had a bath yet?','Ada配has。'],['Has Ada have a bath yet?','需had。'],['Has Ada had a swim yet?','活动改变。'],['Ada has already had a bath.','未知被断言。']],'Has…had也可询问活动完成。',[]],
 ['新收到旧赛事报道：我们上周五游过泳，只需记录那个已结束的日期。','用We、have a swim、last Friday写过去陈述。','We had a swim last Friday.',[
  ['We have had a swim last Friday.','确定过去日期不配此完成式。'],['We have a swim last Friday.','过去式遗漏。'],['We had a bath last Friday.','活动改变。'],['We had a swim next Friday.','日期改变。']],'last Friday锚定过去，用had。',['Last Friday, we had a swim.']],
 ['第二次回访新出现当前状态：我刚理完发，重点是刚完成而非日期。','用I、have a haircut、just写一句表达当前刚完成。','I have just had a haircut.',[
  ['I has just had a haircut.','I配have。'],['I have just have a haircut.','需had。'],['I have not had a haircut yet.','状态反转。'],['I have just had a holiday.','活动改变。']],'have just had迁移到理发，had仍为分词。',[]],
 ['另一份工作人员餐食情况尚不明，你向负责人问她到现在有没有吃过一些蔬菜。','用she、have any vegetables、yet，询问截至当前是否完成。','Has she had any vegetables yet?',[
  ['Have she had any vegetables yet?','she配has。'],['Has she have any vegetables yet?','需had。'],['Has he had any vegetables yet?','对象改变。'],['She has already had some vegetables.','擅自判断。']],'Has she had…yet保留未决询问。',[]],
 ['最后一项接待情况：我们已经吃过早餐，现在不用再预留早餐；没有具体过去时间。','用We、have breakfast、already写一句表达当前已完成。','We have already had breakfast.',[
  ['We had breakfast yesterday.','需当前状态。'],['We has already had breakfast.','we配have。'],['We have already have breakfast.','需had。'],['We have not had breakfast yet.','状态反转。']],'当前后果与已完成关联，用have already had。',['We have had breakfast already.']]
];
const authored=author(data,rows);
const contractions=[['have not',"haven't"],['has not',"hasn't"],['I have',"I've"],['We have',"We've"],['They have',"They've"],['You have',"You've"],['She has',"She's"],['He has',"He's"]];
for(let i=0;i<rows.length;i++){
 const values=[...authored.questions[i].accepted,...rows[i][5]];
 for(const [from,to] of contractions)for(const value of [...values])if(value.includes(from))values.push(value.replaceAll(from,to));
 authored.questions[i].accepted=[...new Set(values)];
}
export const {lesson,questions,byId,questionsFor,matches}=bindContent(data,authored.questions);
