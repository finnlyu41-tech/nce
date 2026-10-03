// Original task data; shared matcher and production event factory stay unchanged.
import {author,metadata} from '../parallel-nce1-049-059/authoring.mjs';
import {bindContent} from '../parallel-nce1-025-035/content-contract.mjs';
const data=metadata(...[143, "24e4e92d0154d1c7f99825b55a560b631f6babbe073d29eb339273ae508f8f09", "已完成、尚未与将来被动安排", "从真实进度区分已经完成、截至现在尚未与未来承诺，使用相应被动形式并保留否定范围。", ["第141–142课被动受事、be 与分词；has/have 的现在完成和 will 原形；第144课 already/not yet/will be 是本组配对扩展。"], [{"target": "passive-perfect", "title": "截至现在已完成的被动动作", "explanation": "没有指定过去日期而确认截至现在完成，用 has/have been + 过去分词。already 的位置可自然变化；疑问将 has/have 提到主语前，不丢 been。", "example": "The forms have already been checked.", "meaning": "表格已经被检查过了。", "check": "has/have + been + 过去分词；already 表示完成，保留受事。"}, {"target": "passive-not-yet", "title": "截至现在尚未发生与从未发生", "explanation": "has/have not been + 过去分词 + yet 表示到现在还未完成，never 表示从开始至今从未发生。两者都不是未来不做的承诺；明确无人获救时不能弱化成只是未全部获救。配对144课提供 not yet 形式。", "example": "The machine has not been tested yet.", "meaning": "机器到现在还没有被测试。", "check": "not/never 的时间与数量范围；保持 been 与分词，不改未来否定。"}, {"target": "passive-future", "title": "按承诺记录将来被动", "explanation": "明确未来安排用 will be + 过去分词，否定用 will not be。已完成、尚未完成与未来安排须从记录中选择。143末行文字及配对144支持此形式；末行无下一 LRC 时间，不提供该句的定界音频。", "example": "The equipment will be delivered on Friday.", "meaning": "设备将于星期五被送到。", "check": "未来安排：受事 + will (not) be + 过去分词；不把完成结果与承诺交换。"}], [[49.55, 58.99, "听已放置的现在完成被动"], [42.5, 49.55, "听完成被动肯定（尚未形式见144课）"], [42.5, 49.55, "回听完成被动对照（将来形式仅末行文字及144课支持）"]], "设计真实或明确虚构的工作进度，写一项已完成、一项截至现在未完成和一项将来承诺的被动表达；标注时间证据与否定范围，伙伴核对后才能判断自由表达。"]);
const rows=[
 [
  "清洁进度没有写具体过去日期，只确认到现在已经把这些窗户擦好了。",
  "主句使用 The windows 开头（时间状语可前置），使用 clean / already，写现在完成被动，不写施事。",
  "The windows have already been cleaned.",
  [
   [
    "The windows have already cleaned.",
    "缺 been，窗户变主动。"
   ],
   [
    "The windows had already been cleaned.",
    "无过去参照点，不改过去完成。"
   ],
   [
    "The windows will already be cleaned.",
    "已完成变未来。"
   ],
   [
    "The windows has already been cleaned.",
    "复数 have。"
   ]
  ],
  "have been cleaned 表示截至现在完成的外部动作。"
 ],
 [
  "餐厅确认：客人到现在还没有得到服务。仅描述现状，不加入将来承诺。",
  "主句使用 The guest 开头（时间状语可前置），使用 serve / yet，写现在完成被动否定。",
  "The guest has not been served yet.",
  [
   [
    "The guest has not served yet.",
    "变成客人没有服务别人。"
   ],
   [
    "The guest has been served yet.",
    "丢失否定且 yet 不合这里的肯定。"
   ],
   [
    "The guest will not be served yet.",
    "把到现在未服务改未来。"
   ],
   [
    "The guest has not been serving yet.",
    "进行主动不是完成被动。"
   ]
  ],
  "has not been served 否定截至现在服务动作，yet 保留。"
 ],
 [
  "维修安排明确承诺明天有人修这个门。目前尚未修，但本题只记录明天安排。",
  "主句使用 The door 开头（时间状语可前置），用 repair / tomorrow，写 will 的将来被动，不写施事。",
  "The door will be repaired tomorrow.",
  [
   [
    "The door will repair tomorrow.",
    "门不是维修者。"
   ],
   [
    "The door has been repaired tomorrow.",
    "明天与已经完成冲突。"
   ],
   [
    "The door will been repaired tomorrow.",
    "will 后 be 用原形。"
   ],
   [
    "The door will be repairing tomorrow.",
    "主动进行不是被动。"
   ]
  ],
  "将来受事动作是 will be repaired。"
 ],
 [
  "档案进度现在确认：这些照片已经被扫描，未提供具体过去日期。",
  "主句使用 The photographs 开头（时间状语可前置），用 scan / already 的现在完成被动，不写施事。",
  "The photographs have already been scanned.",
  [
   [
    "The photographs have already scanned.",
    "缺 been。"
   ],
   [
    "The photographs has already been scanned.",
    "复数 have。"
   ],
   [
    "The photographs will be scanned already.",
    "已完成改未来。"
   ],
   [
    "The photographs have already been scanning.",
    "扫描受事不能变主动进行。"
   ]
  ],
  "复数受事配 have + been + scanned。"
 ],
 [
  "捕捉记录：小狗现在仍失踪，直到现在还没被找到。不提供将来预测。",
  "主句使用 The dog 开头（时间状语可前置），用 find / yet，写现在完成被动否定。",
  "The dog has not been found yet.",
  [
   [
    "The dog has not found yet.",
    "变成小狗没有找到东西。"
   ],
   [
    "The dog has been found already.",
    "与仍失踪矛盾。"
   ],
   [
    "The dog was not found yesterday.",
    "仅昨天未找到不能表达直到现在。"
   ],
   [
    "The dog has not been find yet.",
    "find 的分词 found。"
   ]
  ],
  "未完成的找回动作保留 has not been found yet。"
 ],
 [
  "发送安排：工作人员明晚将把报告发给董事。只需说明报告将被发送，不谈已经做了什么。",
  "主句使用 The report 开头（时间状语可前置），用 send / to the directors / tomorrow evening，写 will 将来被动。",
  "The report will be sent to the directors tomorrow evening.",
  [
   [
    "The report will send to the directors tomorrow evening.",
    "报告不是发送者。"
   ],
   [
    "The report will be send to the directors tomorrow evening.",
    "分词 sent。"
   ],
   [
    "The directors will be sent to the report tomorrow evening.",
    "角色交换。"
   ],
   [
    "The report has been sent to the directors tomorrow evening.",
    "未来安排不是完成事实。"
   ]
  ],
  "will be sent 保留报告与收件人的关系。"
 ],
 [
  "仓库记录两种进度：箱子已经打包，但标签到现在尚未打印。选择忠实表达已完成打包的一句。",
  "只选一整句。",
  "The boxes have already been packed.",
  [
   [
    "The boxes will be packed tomorrow.",
    "完成事实改未来。"
   ],
   [
    "The labels have already been printed.",
    "标签尚未打印。"
   ],
   [
    "The boxes have already packed the labels.",
    "角色交换并添加不存在动作。"
   ],
   [
    "The boxes had already been packed.",
    "无过去参照点不改过去完成。"
   ]
  ],
  "从混合进度中提取已完成受事事件。"
 ],
 [
  "展览准备表：画已经挂好；展览说明到现在还没翻译。现仅记录说明的未完成情况。",
  "主句使用 The exhibition notes 开头（时间状语可前置），用 translate / yet，写现在完成被动否定。",
  "The exhibition notes have not been translated yet.",
  [
   [
    "The exhibition notes have already been translated.",
    "与未完成矛盾。"
   ],
   [
    "The paintings have not been hung yet.",
    "画实际已经挂好。"
   ],
   [
    "The exhibition notes have not translated yet.",
    "说明不是翻译者。"
   ],
   [
    "The exhibition notes will not be translated tomorrow.",
    "凭空改未来否定。"
   ]
  ],
  "have not been translated yet 表达直到现在尚未完成。"
 ],
 [
  "回收计划明确：旧电脑下周会被收走；旧显示器已经收走。只记录电脑的未来动作。",
  "主句使用 The old computers 开头（时间状语可前置），用 collect / next week，写 will 将来被动。",
  "The old computers will be collected next week.",
  [
   [
    "The old computers have been collected already.",
    "电脑尚待下周收走。"
   ],
   [
    "The old monitors will be collected next week.",
    "选错物品与进度。"
   ],
   [
    "The old computers will collect next week.",
    "电脑不是收集者。"
   ],
   [
    "The old computers will been collected next week.",
    "will 后 be。"
   ]
  ],
  "分清同一记录中已完成与待执行动作。"
 ],
 [
  "门店进度只确认：这台收银机到现在已修好，不写具体过去日期。",
  "主句使用 The till 开头（时间状语可前置），用 repair / already 的现在完成被动，不写施事。",
  "The till has already been repaired.",
  [
   [
    "The till has already repaired.",
    "缺 been。"
   ],
   [
    "The till have already been repaired.",
    "单数 has。"
   ],
   [
    "The till will be repaired already.",
    "已完成变未来。"
   ],
   [
    "The till has already been repair.",
    "过去分词 repaired。"
   ]
  ],
  "has been repaired 记录完成结果。"
 ],
 [
  "售票核对：票到现在还没送出。只描述截至现在的否定，不承诺将来。",
  "主句使用 The tickets 开头（时间状语可前置），使用 send / yet 的现在完成被动否定。",
  "The tickets have not been sent yet.",
  [
   [
    "The tickets has not been sent yet.",
    "复数 have。"
   ],
   [
    "The tickets have not sent yet.",
    "缺 been，票变施事。"
   ],
   [
    "The tickets have already been sent.",
    "否定改肯定。"
   ],
   [
    "The tickets will not be sent tomorrow.",
    "仅将来不发送不等于到现在未发。"
   ]
  ],
  "have not been sent 与 yet 共同限定未完成进度。"
 ],
 [
  "旅行安排：导游承诺明早有人来接游客；本题不要表达截至现在是否接过。",
  "主句使用 The visitors 开头（时间状语可前置），使用 meet / tomorrow morning 的 will 将来被动，不写施事。",
  "The visitors will be met tomorrow morning.",
  [
   [
    "The visitors will meet tomorrow morning.",
    "游客变成相会的施事。"
   ],
   [
    "The visitors will be meet tomorrow morning.",
    "meet 分词 met。"
   ],
   [
    "The visitors have been met tomorrow morning.",
    "未来与完成时冲突。"
   ],
   [
    "The visitors will been met tomorrow morning.",
    "be 用原形。"
   ]
  ],
  "将来接待事件使用 will be met。"
 ],
 [
  "订单页面确认付款已经收到，但商品还未发货。现在核实截至目前付款是否已经被收到。",
  "主句使用 Has the payment 开头（时间状语可前置），用 receive / already，写现在完成被动问句。",
  "Has the payment already been received?",
  [
   [
    "Has the payment already received?",
    "缺 been，付款不能收东西。"
   ],
   [
    "Will the payment be received tomorrow?",
    "改成未来安排。"
   ],
   [
    "Has the parcel already been sent?",
    "选错事件，商品未发。"
   ],
   [
    "Have the payment already been received?",
    "payment 单数 has。"
   ]
  ],
  "疑问把 has 前置，been received 保留。"
 ],
 [
  "救援更新：到现在没有任何登山者获救。确定尚无人获救，不是只有部分未救，也不添加未来计划。",
  "主句使用 No climbers 开头，用 rescue / yet 写现在完成被动；No 明确表示零人，不添加另一处否定。",
  "No climbers have been rescued yet.",
  [
   [
    "The climbers have already been rescued.",
    "未获救改已获救。"
   ],
   [
    "No climbers have not been rescued yet.",
    "No 和 not 形成双重否定，不能表示零人获救。"
   ],
   [
    "The climbers have not rescued anyone yet.",
    "登山者变成救人者。"
   ],
   [
    "The climbers will not be rescued tomorrow.",
    "未来否定并无记录支持。"
   ]
  ],
  "明确尚无人获救避免 not all 的部分否定歧义。"
 ],
 [
  "两份处理单：护照已经寄出，签证申请明天才检查。选择忠实记录签证申请未来检查的一句。",
  "只选一整句。",
  "The visa applications will be checked tomorrow.",
  [
   [
    "The visa applications have already been checked.",
    "待明天检查改已经检查。"
   ],
   [
    "The passports will be sent tomorrow.",
    "护照已经寄出。"
   ],
   [
    "The visa applications will check tomorrow.",
    "申请不是检查者。"
   ],
   [
    "The visa applications will been checked tomorrow.",
    "will 后须 be。"
   ]
  ],
  "按证据选未来受事动作，不混合另一条进度。"
 ],
 [
  "编辑记录写着：A translator has already translated the article. 截至现在完成，译者明确，但姓名没有提供。",
  "主句使用 The article 开头（时间状语可前置）写现在完成被动，保留 already；可省略或保留 by a translator。",
  "The article has already been translated.",
  [
   [
    "The translator has already been translated.",
    "交换受事。"
   ],
   [
    "The article has already translated a translator.",
    "交换角色并主动。"
   ],
   [
    "The article had already been translated.",
    "当前完成不改过去完成。"
   ],
   [
    "The article will be translated soon.",
    "完成结果改未来。"
   ]
  ],
  "by a translator 可省略，也可忠实保留。"
 ],
 [
  "监测记录：到现在这台传感器从未被校准。不是校准后故障，也不预测未来；never 否定从开始至今的动作。",
  "主句使用 The sensor 开头（时间状语可前置），用 never / calibrate 写现在完成被动。",
  "The sensor has never been calibrated.",
  [
   [
    "The sensor has been calibrated already.",
    "从未改成已完成。"
   ],
   [
    "The sensor has never calibrated.",
    "缺 been。"
   ],
   [
    "The sensor will never be calibrated.",
    "把过去至现在改无限未来。"
   ],
   [
    "The sensor was not calibrated yesterday.",
    "仅昨天未校准不足以表达从未。"
   ]
  ],
  "never 的范围是截至现在全部校准经历。"
 ],
 [
  "工作人员有明确承诺：明天不会销毁原件，只销毁复印件。现在仅记录原件的未来否定。",
  "主句使用 The originals 开头（时间状语可前置），用 destroy / tomorrow 写 will 将来被动否定。",
  "The originals will not be destroyed tomorrow.",
  [
   [
    "The originals will be destroyed tomorrow.",
    "删除否定。"
   ],
   [
    "The copies will not be destroyed tomorrow.",
    "副本恰好将销毁，受事错。"
   ],
   [
    "The originals have not been destroyed yet.",
    "截至现在进度不表达明天承诺。"
   ],
   [
    "The originals will not destroy tomorrow.",
    "变成原件主动毁东西。"
   ]
  ],
  "will not be destroyed 只否定明天对原件的销毁动作。"
 ]
];
const drafted=author(data,rows);
const scopeExtension="部分题为情境选择，按完整选项作答；构句与选择分别提供证据。自然缩写、already/yet位置及题目许可的 by 施事形式列入有限答案；never、问句与未来否定是已有否定、疑问结构的组合扩展，不冒充144原文直授。";
const alternatives=[
 [
  "The windows have already been cleaned.",
  "The windows have been cleaned already.",
  "Already, the windows have been cleaned.",
  "Already the windows have been cleaned."
 ],
 [
  "The guest has not been served yet.",
  "The guest hasn't been served yet.",
  "The guest's not been served yet.",
  "The guest'sn't been served yet.",
  "The guest has not yet been served.",
  "The guest hasn't yet been served.",
  "The guest's not yet been served.",
  "The guest'sn't yet been served."
 ],
 [
  "The door will be repaired tomorrow.",
  "Tomorrow, the door will be repaired.",
  "Tomorrow the door will be repaired."
 ],
 [
  "The photographs have already been scanned.",
  "The photographs have been scanned already.",
  "Already, the photographs have been scanned.",
  "Already the photographs have been scanned."
 ],
 [
  "The dog has not been found yet.",
  "The dog hasn't been found yet.",
  "The dog's not been found yet.",
  "The dog'sn't been found yet.",
  "The dog has not yet been found.",
  "The dog hasn't yet been found.",
  "The dog's not yet been found.",
  "The dog'sn't yet been found."
 ],
 [
  "The report will be sent to the directors tomorrow evening.",
  "Tomorrow evening, the report will be sent to the directors.",
  "Tomorrow evening, the report'll be sent to the directors.",
  "Tomorrow evening the report will be sent to the directors.",
  "Tomorrow evening the report'll be sent to the directors."
 ],
 [
  "The boxes have already been packed."
 ],
 [
  "The exhibition notes have not been translated yet.",
  "The exhibition notes haven't been translated yet.",
  "The exhibition notes have not yet been translated.",
  "The exhibition notes haven't yet been translated."
 ],
 [
  "The old computers will be collected next week.",
  "Next week, the old computers will be collected.",
  "Next week the old computers will be collected."
 ],
 [
  "The till has already been repaired.",
  "The till's already been repaired.",
  "The till has been repaired already.",
  "The till's been repaired already.",
  "Already, the till has been repaired.",
  "Already the till has been repaired."
 ],
 [
  "The tickets have not been sent yet.",
  "The tickets haven't been sent yet.",
  "The tickets have not yet been sent.",
  "The tickets haven't yet been sent."
 ],
 [
  "The visitors will be met tomorrow morning.",
  "Tomorrow morning, the visitors will be met.",
  "Tomorrow morning the visitors will be met."
 ],
 [
  "Has the payment already been received?",
  "Has the payment been received already?"
 ],
 [
  "No climbers have been rescued yet.",
  "No climbers have yet been rescued."
 ],
 [
  "The visa applications will be checked tomorrow."
 ],
 [
  "The article has already been translated.",
  "The article's already been translated.",
  "The article has been translated already.",
  "The article's been translated already.",
  "The article has already been translated by a translator.",
  "The article's already been translated by a translator.",
  "The article has been translated by a translator already.",
  "The article's been translated by a translator already.",
  "The article has been translated already by a translator.",
  "The article's been translated already by a translator."
 ],
 [
  "The sensor has never been calibrated.",
  "The sensor's never been calibrated."
 ],
 [
  "The originals will not be destroyed tomorrow.",
  "The originals won't be destroyed tomorrow.",
  "Tomorrow, the originals will not be destroyed.",
  "Tomorrow, the originals won't be destroyed.",
  "Tomorrow the originals will not be destroyed.",
  "Tomorrow the originals won't be destroyed."
 ]
];
const overrides={"6": {"kind": "choice", "form": "choice", "options": ["The boxes have already been packed.", "The boxes will be packed tomorrow.", "The labels have already been printed.", "The boxes have already packed the labels."], "prompt": "只选一整句。 不改写选项。", "criterion": "只选一整句。"}, "14": {"kind": "choice", "form": "choice", "options": ["The visa applications will be checked tomorrow.", "The visa applications have already been checked.", "The passports will be sent tomorrow.", "The visa applications will check tomorrow."], "prompt": "只选一整句。 不改写选项。", "criterion": "只选一整句。"}};
const tasks=drafted.questions.map((q,i)=>({...q,accepted:[...new Set([...alternatives[i],...(overrides[i]?[]:q.accepted)])],...(overrides[i]||{})}));
const reviewedFiniteVariants={"diagnostic-n143-passive-future": ["The door'll be repaired tomorrow.", "Tomorrow, the door'll be repaired.", "Tomorrow the door'll be repaired."], "guided-n143-passive-future": ["The report will be sent tomorrow evening to the directors.", "The report'll be sent to the directors tomorrow evening.", "The report'll be sent tomorrow evening to the directors."], "repair-n143-passive-perfect": ["Already, the till's been repaired.", "Already the till's been repaired."], "review-a-n143-passive-perfect": ["Already, has the payment been received?", "Already has the payment been received?"], "review-b-n143-passive-perfect": ["Already, the article has been translated.", "Already, the article has been translated by a translator.", "Already the article has been translated.", "Already the article has been translated by a translator.", "Already, the article's been translated.", "Already, the article's been translated by a translator."], "review-b-n143-passive-not-yet": ["Never has the sensor been calibrated."]};
for(const q of tasks)q.accepted=[...new Set([...q.accepted,...(reviewedFiniteVariants[q.id]||[])])];
data.contentStatus='authored-blind-reviewed';
data.scope+=' '+scopeExtension;
export const {lesson,questions,byId,questionsFor,matches}=bindContent(data,tasks);
