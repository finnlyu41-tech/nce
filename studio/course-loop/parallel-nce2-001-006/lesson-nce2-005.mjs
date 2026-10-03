import {metadata,content} from './authoring.mjs';
const data=metadata(5,'26b0b571d7f6158888130d13f1e3023adde25bd51f7a67fd6b612dbb7a728794','按记录选择过去时或完成时','辨别封闭的过去记录与截至现在的累计/结果，并为一句或两段记录选择有证据的时态。',['第3课一般过去时及did + 原形；第4课have/has + 过去分词、just/already/yet和持续至今。'],[
 {target:'closed-past',title:'封闭过去的记录',explanation:'yesterday、last month、明确已结束的上午或某个过去时间把事件放在封闭过去，用一般过去时。when询问某个已发生事件的具体过去时间用did + 主语 + 原形。原页69–70将last month、ago、yesterday和完成时对照。当前仍有影响也不能把带yesterday的限定记录改成完成时。',example:'The courier delivered the parcel yesterday.',meaning:'快递员昨天送达了包裹。',check:'核对是否报告一个已封闭的过去事件；肯定用过去式，did问句用原形。'},
 {target:'up-to-now',title:'截至现在的累计与当前结果',explanation:'原文以Up to now引出has sent，把仍开放的累计记录与Yesterday的单次投递分开。just、already、not yet及当前结果也支持本课完成式；判断须读记录范围，不能将昨天一件事当成截至现在的全部，也不能把计划算为完成。',example:'Up to now, we have checked four rooms.',meaning:'截至现在，我们已经检查了四个房间。',check:'确定累计截至现在还是旧账期已关；have/has + 过去分词，数量必须来自已完成记录。'},
 {target:'time-ledger',title:'同一档案中的两种时间边界',explanation:'一份记录可以先叙述过去的一次行动，再报告现在累计或结果。原页68–69中的yesterday carried与up to now has sent属于不同记录范围。先列出每条证据的时间边界，再配时态；所给选择识别和有限构句均不等于开放迁移。',example:'We repaired one bike yesterday, and we have repaired three bikes so far.',meaning:'昨天修了一辆，截至现在累计修了三辆。',check:'逐分句核对人物、动作、已结束事件与到现在的累计；不把部分数量当总数，不把未完成项入账。'}
],[[38.96,45.61,'LRC原行：Yesterday carried'],[50.86,56.05,'LRC原行：has sent；up to now在49.3的前行'],[45.61,49.3,'LRC原行：covered；与原页68–69截至现在记录作文字比较']], '写一个本人或明确虚构的活动台账：一件在明确过去时间完成的事、一项截至现在的累计结果，再解释两条为什么采用不同时间边界；请伙伴核对事实、计数范围和时态。');
const rows=[
 ['昨天闭馆前，管理员把门锁上了；现在只登记昨天那次动作。','用The manager、lock、the door、yesterday写一句。','The manager locked the door yesterday.',[['The manager has locked the door yesterday.','yesterday限定封闭过去，用一般过去时。'],['The manager locks the door yesterday.','现在式与昨天不符。'],['The manager did locked the door yesterday.','did后不能再用过去式。'],['The manager opened the door yesterday.','动作方向反转。']],'记录昨天动作，用locked。',['The manager locked the door yesterday.','Yesterday, the manager locked the door.']],
 ['今天的核对任务仍进行；截至现在有四个房间已检查，其余未完成。','用Up to now、we、check、four rooms写累计已完成数。','Up to now, we have checked four rooms.',[['Up to now, we checked four rooms.','本题要求仍开放的截至现在累计完成式。'],['Up to now, we have checked all the rooms.','记录只完成四间，不能说全部。'],['Up to now, we have check four rooms.','需过去分词checked。'],['Up to now, we has checked four rooms.','we对应have。']],'未结束的当前核对台账采用完成式。',['Up to now, we have checked four rooms.',"Up to now, we've checked four rooms.",'We have checked four rooms up to now.']],
 ['昨天活动记录有两次投递；活动开始至现在累计三次，包含昨天两次。','用We、make、two deliveries yesterday、and、three deliveries so far写一句，两个分句都保留we。','We made two deliveries yesterday, and we have made three deliveries so far.',[['We have made two deliveries yesterday, and we made three deliveries so far.','两个时间边界的时态对调。'],['We made three deliveries yesterday, and we have made two deliveries so far.','昨日数量和包含昨日的累计数量对调。'],['We made two deliveries yesterday, and we have made five deliveries so far.','三次累计已含昨日两次，不能再次相加。'],['We make two deliveries yesterday, and we have made three deliveries so far.','yesterday用过去式made。']],'一次过去与截至现在累计各自配时态和数量。',['We made two deliveries yesterday, and we have made three deliveries so far.',"We made two deliveries yesterday, and we've made three deliveries so far."]],
 ['档案显示Sara上周寄出邀请函；你要问她具体何时寄出，不问是否曾寄过。','用When、you、send、the invitation向Sara问具体时间。','When did you send the invitation?',[['When have you sent the invitation?','问档案中已发生事件的具体过去时间，用did。'],['When did you sent the invitation?','did后send原形。'],['Have you sent the invitation?','改问是否完成，未问具体时间。'],['When did she send the invitation?','当面问Sara，用you。']],'when把查询定位于具体过去事件。',['When did you send the invitation?']],
 ['货架收货状态刚更新：所有箱子均已到达，现在可以开始整理；不报告某个日期。','用All the boxes、just、arrive写当前结果。','All the boxes have just arrived.',[['All the boxes have not arrived yet.','所有箱子都已到达。'],['All the boxes has just arrived.','复数boxes用have。'],['All the boxes have just arrive.','需过去分词arrived。'],['All the boxes will arrive tomorrow.','把已到达变成未来。']],'刚更新的当前结果用have just arrived。',['All the boxes have just arrived.']],
 ['昨晚关门前Leo卖出一幅画；自展览开幕到现在共卖出三幅，包含昨晚那幅。','用Leo、sell、one painting last night、and、he、three paintings up to now写一句。','Leo sold one painting last night, and he has sold three paintings up to now.',[['Leo has sold one painting last night, and he sold three paintings up to now.','昨晚单次与到现在累计时态错置。'],['Leo sold one painting last night, and he has sold four paintings up to now.','累计三幅已经含昨晚一幅，不能再加。'],['Leo sold three paintings last night, and he has sold one painting up to now.','数量边界对调。'],['Leo sell one painting last night, and he has sold three paintings up to now.','last night需过去式sold。']],'在同一句中保持两个账目范围。',['Leo sold one painting last night, and he has sold three paintings up to now.',"Leo sold one painting last night, and he's sold three paintings up to now."]],
 ['现在是下午。保安只问已经结束的今天上午发生什么：十点Nina把钥匙交给前台，之后没有其他交钥匙记录。','用Nina作主语，从give the key to reception/receive the key from reception、this morning/this afternoon选符合封闭班次的信息，自行选时态写一句。','Nina gave the key to reception this morning.',[['Nina has given the key to reception this morning.','此题已明确上午结束并按该封闭时段登记。'],['Nina gives the key to reception this morning.','描述过去交接不能用一般现在式。'],['Nina gave the key to reception this afternoon.','交接发生在上午，不是下午。'],['Nina received the key from reception this morning.','交出变成收回，方向错误。']],'this morning是否封闭由下午查询情境确定，不机械当成开放今天。',['Nina gave the key to reception this morning.','This morning, Nina gave the key to reception.']],
 ['维修台账截至现在：红车和蓝车各修好一辆；绿车仍拆着，未完成。主管需要当前已修好数量，不能把在修项计入。','用We作首分句主语，从repair、two bikes/three bikes、yesterday/so far选台账支持的记录；用but连接the green bike的ready/not ready状态，分别自行选时态写一句。','We have repaired two bikes so far, but the green bike is not ready.',[['We have repaired three bikes so far, but the green bike is not ready.','绿车未好，不能记成第三辆完成。'],['We repaired two bikes yesterday, but the green bike is not ready.','台账没有把两辆限定在昨天。'],['We have repaired two bikes so far, but the green bike is ready.','理由反转且无法支持未入账。'],['We has repaired two bikes so far, but the green bike is not ready.','We需have。']],'从三个状态筛出已完成项，用but对照尚未入账的项目；未完项不是已修数量的原因。',['We have repaired two bikes so far, but the green bike is not ready.',"We've repaired two bikes so far, but the green bike isn't ready."]],
 ['图书馆去年借阅活动已结项，共购书八本；今年新活动仍开放，截至现在购书五本。只选同时正确区分两个账期的一句。','选择符合两个活动时间边界和数量的记录。','We bought eight books last year, and we have bought five books so far this year.',[['We have bought eight books last year, and we bought five books so far this year.','去年封闭与今年截至现在的时态反转。'],['We bought five books last year, and we have bought eight books so far this year.','两个账期数量对调。'],['We bought eight books last year, and we have bought thirteen books so far this year.','把旧账八本误并入今年五本。'],['We will buy eight books last year, and we have bought five books so far this year.','已结束的去年不可能是未来计划。']],'识别任务要求拆开旧活动和当前活动，再分别用过去时/完成时。',['We bought eight books last year, and we have bought five books so far this year.'],{options:['We bought five books last year, and we have bought eight books so far this year.','We bought eight books last year, and we have bought five books so far this year.','We have bought eight books last year, and we bought five books so far this year.','We bought eight books last year, and we have bought thirteen books so far this year.']}],
 ['事故档案：Ivo上个月丢失了证件，今天虽仍没找到，这一条只登记丢失的过去日期。','以Ivo开头，从lose/find、his card、last month/next month选事故档案的事件信息，按该栏时间边界选时态写一句。','Ivo lost his card last month.',[['Ivo has lost his card last month.','现在仍有影响不取消last month的封闭边界。'],['Ivo loses his card last month.','过去事件不能用现在式。'],['Ivo found his card last month.','丢失变为找到。'],['Ivo lost his card next month.','next month是未来，档案不是未来事件。']],'先确定该栏要记丢失日期，避免只看到当前结果就套完成式。',['Ivo lost his card last month.','Last month, Ivo lost his card.']],
 ['工具借出清单仍开放：锤子已归还，钻机尚未归还；当前要报告钻机，不能复制锤子的结果。','以借用者We为主语，从return/not return、the drill/the hammer、already/yet选当前清单支持的信息，自行选时态写一句。','We have not returned the drill yet.',[['We have already returned the drill.','钻机尚未还。'],['We have not returned the hammer yet.','锤子已经还了，不能换对象。'],['We did not returned the drill yet.','did后不得returned，且本题是截至现在状态。'],['We has not returned the drill yet.','We用have。']],'根据当前清单修补对象与否定完成式。',['We have not returned the drill yet.',"We haven't returned the drill yet."]],
 ['清洁记录：上周五只清理了楼下两间；这个仍进行的周期到现在清理了五间，包含楼下两间。你要给接班人比较单日与累计。','以We开头，词库clean、two/five/seven rooms、last Friday/up to now；先报告单日再报告当前周期累计，用and连接，自行配时态和数量。','We cleaned two rooms last Friday, and we have cleaned five rooms up to now.',[['We have cleaned two rooms last Friday, and we cleaned five rooms up to now.','封闭单日与开放累计时态对调。'],['We cleaned two rooms last Friday, and we have cleaned seven rooms up to now.','五间累计已含两间，不能重复加。'],['We cleaned five rooms last Friday, and we have cleaned two rooms up to now.','账目范围与数量交换。'],['We cleaned two rooms last Friday, and we will clean five rooms up to now.','已完成累计不能变成未来计划。']],'新记录要求同时修补时间、计数和已完成状态。',['We cleaned two rooms last Friday, and we have cleaned five rooms up to now.',"We cleaned two rooms last Friday, and we've cleaned five rooms up to now."]],
 ['会议纪要记录：昨天主持人取消了会议；今日查询的是取消发生在何时，取消的当前影响另作记录。','用The host作主语，从cancel/hold、the meeting、yesterday/tomorrow选纪要支持的信息，自行选时态写一句。','The host cancelled the meeting yesterday.',[['The host has cancelled the meeting yesterday.','yesterday须封闭过去式。'],['The host will cancel the meeting yesterday.','昨天事件不能变未来。'],['The host held the meeting yesterday.','取消不是召开。'],['The host cancel the meeting yesterday.','cancel缺少过去式。']],'从纪要栏提取已发生事件，当前影响不改变该栏时间。',['The host cancelled the meeting yesterday.','The host canceled the meeting yesterday.','Yesterday, the host cancelled the meeting.','Yesterday, the host canceled the meeting.']],
 ['提交系统显示：两份申请已成功送达，一份仅存草稿；当前申报期未结束。要报告截至现在真正提交的数量。','以I开头，词库submit、two/three applications、last year/so far；先报告真正送达的累计数，再以but连接the third one的still a draft/complete状态，自行选时态写一句。','I have submitted two applications so far, but the third one is still a draft.',[['I have submitted three applications so far, but the third one is still a draft.','草稿未提交不能计入成功数量。'],['I submitted two applications last year, but the third one is still a draft.','本题是当前申报期，没有去年事实。'],['I has submitted two applications so far, but the third one is still a draft.','I用have。'],['I have submitted two applications so far, but the third one is complete.','第三份实际仍为草稿。']],'延迟题要排除草稿，不能按屏幕上三条记录全数入账。',['I have submitted two applications so far, but the third one is still a draft.',"I've submitted two applications so far, but the third one is still a draft."]],
 ['筹款旧账：去年已经结束的义卖筹到四百元；本次募款还在进行，到现在筹到二百元，旧账不并入。','选择两份账目同时正确的整句。','We raised four hundred yuan last year, and we have raised two hundred yuan up to now.',[['We have raised four hundred yuan last year, and we raised two hundred yuan up to now.','封闭去年与开放到现在时态反转。'],['We raised two hundred yuan last year, and we have raised four hundred yuan up to now.','新旧账数额对调。'],['We raised four hundred yuan last year, and we have raised six hundred yuan up to now.','旧账不在本次募款中，不能合计六百。'],['We raised four hundred yuan last year, and we will raise two hundred yuan up to now.','截至现在已有收入，不能说未来才筹。']],'从两份账的范围识别句子，属于识别而非自由写作。',['We raised four hundred yuan last year, and we have raised two hundred yuan up to now.'],{options:['We raised four hundred yuan last year, and we have raised six hundred yuan up to now.','We have raised four hundred yuan last year, and we raised two hundred yuan up to now.','We raised four hundred yuan last year, and we have raised two hundred yuan up to now.','We raised two hundred yuan last year, and we have raised four hundred yuan up to now.']}],
 ['上午的交货班次已在中午结束，现在下午三点；Ben在上午送达了药品。只填这次班次的已发生事件。','用Ben作主语，从deliver/collect、the medicine、this morning/this evening选已关闭交货班次的信息，自行选时态写一句。','Ben delivered the medicine this morning.',[['Ben has delivered the medicine this morning.','已结束的上午班次是本题封闭记录范围。'],['Ben delivers the medicine this morning.','事件已发生，不能用一般现在式。'],['Ben delivered the medicine this evening.','把上午改成还未到的晚上。'],['Ben collected the medicine this morning.','送达变成取走。']],'时间边界由已关班次确定，不能看到today就一律用完成式。',['Ben delivered the medicine this morning.','This morning, Ben delivered the medicine.']],
 ['运行看板：所有测试刚通过，现在可以发布；昨晚那一轮失败。主管问当前最新结果，不是昨晚报告。','以All the tests开头，从just/last night、pass/fail选择最新记录，自行选时态；再用so连接we can/cannot release the update的正确结论。','All the tests have just passed, so we can release the update.',[['All the tests failed last night, so we cannot release the update.','只报告旧失败，没有反映当前刚通过。'],['All the tests has just passed, so we can release the update.','复数tests用have。'],['All the tests have just pass, so we can release the update.','需过去分词passed。'],['All the tests have just passed, so we cannot release the update.','在所给只有测试门槛的情境中，结论反转。']],'从最新结果决定下一步，不把旧失败代作当前结果。',['All the tests have just passed, so we can release the update.']],
 ['培训档案：上个月的结项班毕业六人；当前另一班仍在学习，仅两人已毕业，其他人尚未毕业。两班人数分开报告。','词库two/six/eight students、graduate、last month/so far in this class；先报告旧班再报告当前班，用and连接，自行匹配两班人数、时间与时态。','Six students graduated last month, and two students have graduated so far in this class.',[['Six students have graduated last month, and two students graduated so far in this class.','封闭旧班与开放新班时态相反。'],['Two students graduated last month, and six students have graduated so far in this class.','人数对调。'],['Six students graduated last month, and eight students have graduated so far in this class.','旧班六人不能并入当前班。'],['Six students graduated last month, and two students will graduate so far in this class.','当前两人已毕业，不是将来才毕业。']],'不同班级和记录周期都要核对，不能机械合并数量。',['Six students graduated last month, and two students have graduated so far in this class.','Six students graduated last month and two students have graduated so far in this class.']]
];

// Root semantic review: finite natural variants independently proposed from no-key stems.
const reviewedVariants={
  "0": [
    "Yesterday, the manager locked the door.",
    "Yesterday the manager locked the door."
  ],
  "1": [
    "Up to now we have checked four rooms.",
    "Up to now, we've checked four rooms.",
    "Up to now we've checked four rooms.",
    "We have checked four rooms up to now.",
    "We've checked four rooms up to now."
  ],
  "2": [
    "We made two deliveries yesterday and we have made three deliveries so far.",
    "We made two deliveries yesterday, and we've made three deliveries so far.",
    "We made two deliveries yesterday and we've made three deliveries so far."
  ],
  "4": [],
  "5": [
    "Leo sold one painting last night and he has sold three paintings up to now.",
    "Leo sold one painting last night, and he's sold three paintings up to now.",
    "Leo sold one painting last night and he's sold three paintings up to now."
  ],
  "7": [
    "We have repaired two bikes so far but the green bike is not ready.",
    "We've repaired two bikes so far, but the green bike is not ready.",
    "We have repaired two bikes so far, but the green bike isn't ready.",
    "We have repaired two bikes so far, but the green bike's not ready.",
    "We've repaired two bikes so far, but the green bike isn't ready.",
    "We've repaired two bikes so far, but the green bike's not ready.",
    "We've repaired two bikes so far but the green bike isn't ready.",
    "We've repaired two bikes so far but the green bike's not ready."
  ],
  "10": [
    "We haven't returned the drill yet.",
    "We've not returned the drill yet."
  ],
  "11": [
    "We cleaned two rooms last Friday and we have cleaned five rooms up to now.",
    "We cleaned two rooms last Friday, and we've cleaned five rooms up to now.",
    "We cleaned two rooms last Friday and we've cleaned five rooms up to now.",
    "We cleaned two rooms last Friday and have cleaned five rooms up to now."
  ],
  "12": [
    "The host canceled the meeting yesterday.",
    "Yesterday, the host cancelled the meeting.",
    "Yesterday the host canceled the meeting."
  ],
  "13": [
    "I have submitted two applications so far but the third one is still a draft.",
    "I've submitted two applications so far, but the third one is still a draft.",
    "I have submitted two applications so far, but the third one's still a draft.",
    "I've submitted two applications so far, but the third one's still a draft.",
    "I've submitted two applications so far but the third one's still a draft."
  ],
  "16": [
    "All the tests have just passed so we can release the update."
  ],
  "17": [
    "Six students graduated last month and two students have graduated so far in this class.",
    "Six students graduated last month, and two students have so far graduated in this class."
  ]
};
for(const [i,values] of Object.entries(reviewedVariants))rows[Number(i)][5]=[...new Set([...(rows[Number(i)][5]||[rows[Number(i)][2]]),...values])];
// This question explicitly begins Ivo; do not override that bounded word-order instruction.
rows[9][5]=rows[9][5].filter(v=>v.startsWith('Ivo '));
data.contentStatus='independent-blind-reviewed-bounded';
export const {lesson,questions,byId,questionsFor,matches}=content(data,rows);
