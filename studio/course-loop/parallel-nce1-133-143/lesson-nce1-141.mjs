// Original task data; shared matcher and production event factory stay unchanged.
import {author,metadata} from '../parallel-nce1-049-059/authoring.mjs';
import {bindContent} from '../parallel-nce1-025-035/content-contract.mjs';
const data=metadata(...[141, "cb6b93957730cd54c61dcc9f2304bb1b79dd408220586c7ce0e3e07673899f7a", "现在流程与过去事件的被动表达", "按明确流程或过去日志形成被动句，保留受事、施事、时间，并处理否定和疑问。", ["第139–140课从句语序；is/are、was/were、过去分词及给某人某物的角色；第142课现在规律动作与过去事件为配对扩展。"], [{"target": "passive-present", "title": "当前重复动作的一般现在被动", "explanation": "根据明确的流程证据把受事放到主语位置，用 is/are + 过去分词。每周检查是重复动作，不是仅凭一个状态词推断有人执行动作；本目标来自配对142课的 regularly 练习。", "example": "The filters are changed every month.", "meaning": "过滤器每月被更换。", "check": "重复流程：受事 + is/are + 过去分词；保持单复数与时间。"}, {"target": "passive-past", "title": "日志中的一般过去被动事件", "explanation": "昨天、上周等明确发生过的动作用 was/were + 过去分词。施事若题目要求则用 by 保留，地点用 at，不能把地点或目的地写成施事。受事仍是动作作用的对象。", "example": "The parcels were collected yesterday.", "meaning": "包裹昨天被收走了。", "check": "已完成过去事件：受事 + was/were + 过去分词；角色与地点不交换。"}, {"target": "passive-scope", "title": "被动问句与未发生动作的否定", "explanation": "被动否定在 be 后加 not，问句把 be 放到受事主语前。动作未发生不等于受事没有主动做别的事。给某人某物时，接受者可作被动主语，用 given。", "example": "Were the guests not told about the change?", "meaning": "客人们没有被告知变更吗？", "check": "be 的问句顺序、not 范围与过去分词同时保留；受事不变施事。"}], [[17.91, 26.47, "回听受邀事件（现在流程形式见142课）"], [17.91, 26.47, "听过去受邀事件"], [17.91, 26.47, "回听被动陈述（否定与问句为新情境练习）"]], "根据真实或明确虚构的维护记录，写一条当前重复流程、一条明确过去日期事件和一条否定或问句的被动表达；先标注施事、受事与动作，避免仅凭状态词猜动作。"]);
const rows=[
 [
  "维修记录明确写着：工作人员每周检查这部电梯，是每周重复执行的动作，不是目前状况。",
  "改成被动句，主句使用 The lift 开头（时间状语可前置），使用 check / every week，不写施事。",
  "The lift is checked every week.",
  [
   [
    "The lift checks every week.",
    "电梯是受事，不能变成检查者。"
   ],
   [
    "The lift was checked every week.",
    "改成过去惯例。"
   ],
   [
    "The lift is check every week.",
    "被动要 checked。"
   ],
   [
    "The lift is being checked every week.",
    "本题限定一般现在时重复动作。"
   ]
  ],
  "受事作主语，一般现在被动是 is + checked。"
 ],
 [
  "邮局日志明确：昨天工作人员把这封信送到了医院；不是今天，也不是信件主动送东西。",
  "主句使用 The letter 开头（时间状语可前置），用 deliver / to the hospital / yesterday 写一般过去被动，不写施事。",
  "The letter was delivered to the hospital yesterday.",
  [
   [
    "The letter is delivered to the hospital yesterday.",
    "昨天事件用 was。"
   ],
   [
    "The letter delivered to the hospital yesterday.",
    "缺被动 be。"
   ],
   [
    "The hospital was delivered to the letter yesterday.",
    "受事与目的地交换。"
   ],
   [
    "The letter was delivering to the hospital yesterday.",
    "被动用过去分词。"
   ]
  ],
  "已完成的昨天事件用 was delivered。"
 ],
 [
  "事故日志：昨天工作人员没有通知乘客。明确是通知动作未发生，不是乘客没有通知别人。",
  "主句使用 The passengers 开头（时间状语可前置），用 tell / yesterday 写一般过去被动否定，不写施事。",
  "The passengers were not told yesterday.",
  [
   [
    "The passengers did not tell yesterday.",
    "变成乘客没有告诉别人。"
   ],
   [
    "The passengers were told yesterday.",
    "丢掉未通知的否定。"
   ],
   [
    "The passengers was not told yesterday.",
    "复数配 were。"
   ],
   [
    "The passengers were not tell yesterday.",
    "tell 的过去分词是 told。"
   ]
  ],
  "否定 placed 在被动 were 后，told 保留。"
 ],
 [
  "值班表写明：工作人员每天清洗这些工具。需要写流程，非描述工具状态。",
  "主句使用 The tools 开头（时间状语可前置），使用 wash / every day 的一般现在被动，不写施事。",
  "The tools are washed every day.",
  [
   [
    "The tools is washed every day.",
    "复数 are。"
   ],
   [
    "The tools wash every day.",
    "把工具变成施事。"
   ],
   [
    "The tools are washing every day.",
    "进行主动不是被动。"
   ],
   [
    "The tools were washed every day.",
    "把当前流程改成过去。"
   ]
  ],
  "现在重复流程用 are washed。"
 ],
 [
  "活动签到表确认：上周工作人员邀请了 Nina 参加展览；不知道工作人员的姓名。",
  "主句使用 Nina 开头（时间状语可前置），用 invite / to the exhibition / last week 的一般过去被动，不写施事。",
  "Nina was invited to the exhibition last week.",
  [
   [
    "Nina invited to the exhibition last week.",
    "缺 was。"
   ],
   [
    "Nina is invited to the exhibition last week.",
    "last week 需要过去时。"
   ],
   [
    "Nina was inviting to the exhibition last week.",
    "主动进行不是被动。"
   ],
   [
    "Nina was invited by the exhibition last week.",
    "展览是目标，不是邀请施事。"
   ]
  ],
  "受邀者作主语，to 引出参加的活动。"
 ],
 [
  "现在核查昨天是否有人清点这些票，还不知道结果。需直接向同事发问。",
  "主句使用 Were the tickets 开头（时间状语可前置），使用 count / yesterday，写一般过去被动问句。",
  "Were the tickets counted yesterday?",
  [
   [
    "The tickets were counted yesterday.",
    "未知结果时不应改陈述。"
   ],
   [
    "Did the tickets count yesterday?",
    "票不是清点者。"
   ],
   [
    "Was the tickets counted yesterday?",
    "复数用 Were。"
   ],
   [
    "Were the tickets counting yesterday?",
    "被动用 counted。"
   ]
  ],
  "被动问句将 were 放到主语前，过去分词不变。"
 ],
 [
  "档案室流程：研究员每月扫描纸质记录。选择忠实记录受事与当前重复动作的句子。",
  "只选一整句。",
  "The records are scanned every month.",
  [
   [
    "The records scan every month.",
    "记录成了扫描者。"
   ],
   [
    "The records were scanned last month.",
    "一次过去事件取代当前流程。"
   ],
   [
    "The records are being scanned now.",
    "此刻进行不是每月惯例。"
   ],
   [
    "The researchers are scanned every month.",
    "施事受事交换。"
   ]
  ],
  "从流程证据选择一般现在被动。"
 ],
 [
  "展馆两条日志：昨天工作人员移动了雕像；今天只检查照明。需记录昨天移动雕像这一事件。",
  "主句使用 The statue 开头（时间状语可前置），使用 move / yesterday 的一般过去被动，不写施事。",
  "The statue was moved yesterday.",
  [
   [
    "The statue is moved today.",
    "改变日期和时态。"
   ],
   [
    "The statue moved yesterday.",
    "主动不能保留外部工作人员动作。"
   ],
   [
    "The lighting was checked yesterday.",
    "选错日志事件。"
   ],
   [
    "The statue was moving yesterday.",
    "过去进行主动不是被动事件。"
   ]
  ],
  "从竞争日志选对事件，再保留 was moved。"
 ],
 [
  "医院规则：护士每晚给患者这些药。今天要核实规则是否如此，并非核实今晚某次动作。",
  "写一个一般现在被动直接问句，主句使用 Are the patients 开头（时间状语可前置），用 give / these medicines / every night。",
  "Are the patients given these medicines every night?",
  [
   [
    "Do the patients give these medicines every night?",
    "患者变成给药者。"
   ],
   [
    "Are these medicines given the patients every night?",
    "题目要求患者开头，且给药关系表达错误。"
   ],
   [
    "Were the patients given these medicines last night?",
    "改成过去一次事件。"
   ],
   [
    "Are the patients giving these medicines every night?",
    "主动进行改变角色。"
   ]
  ],
  "给药的接受者作主语，Are + patients + given。"
 ],
 [
  "维修规程明确：技师定期修理这个泵。需要描述重复动作，非目前是否坏了。",
  "主句使用 The pump 开头（时间状语可前置），使用 repair / regularly 的一般现在被动，不写施事。",
  "The pump is repaired regularly.",
  [
   [
    "The pump repairs regularly.",
    "泵不是维修者。"
   ],
   [
    "The pump is repairing regularly.",
    "主动进行不同。"
   ],
   [
    "The pump was repaired regularly.",
    "当前规程不能改过去。"
   ],
   [
    "The pump is repair regularly.",
    "需要 repaired。"
   ]
  ],
  "is repaired regularly 表示有人定期修理。"
 ],
 [
  "遗失物日志：昨天有人在车站找到了两只箱子。不能把找到的地点写成施事。",
  "主句使用 The cases 开头（时间状语可前置），用 find / at the station / yesterday 的一般过去被动，不写施事。",
  "The cases were found at the station yesterday.",
  [
   [
    "The cases was found at the station yesterday.",
    "复数配 were。"
   ],
   [
    "The cases found at the station yesterday.",
    "缺被动 be。"
   ],
   [
    "The cases were found by the station yesterday.",
    "at 是地点，不是 by 施事。"
   ],
   [
    "The cases are found at the station yesterday.",
    "昨天需要过去时。"
   ]
  ],
  "find 的分词 found 与 were 构成过去被动。"
 ],
 [
  "昨天搬运员搬了柜子，但没有搬钢琴。现只记录未发生的钢琴搬运动作。",
  "主句使用 The piano 开头（时间状语可前置），使用 move / yesterday 的一般过去被动否定，不写施事。",
  "The piano was not moved yesterday.",
  [
   [
    "The piano was moved yesterday.",
    "未搬改成已搬。"
   ],
   [
    "The piano did not move yesterday.",
    "描述自身移动不能保留外部搬运的否定。"
   ],
   [
    "The cupboard was not moved yesterday.",
    "选错受事，柜子实际搬了。"
   ],
   [
    "The piano were not moved yesterday.",
    "单数 was。"
   ]
  ],
  "not 否定钢琴被搬这一事件。"
 ],
 [
  "学校流程：每学期老师更换借书证；本学期尚未说明具体更换时间。选择当前重复流程的被动表达。",
  "只选一整句。",
  "The library cards are replaced every term.",
  [
   [
    "The library cards were replaced yesterday.",
    "凭空提供一次过去日期。"
   ],
   [
    "The teachers are replaced every term.",
    "把更换对象变成老师。"
   ],
   [
    "The library cards replace the teachers every term.",
    "角色交换。"
   ],
   [
    "The library cards are replacing every term.",
    "缺被动过去分词。"
   ]
  ],
  "流程描述使用当前一般现在被动，不添加未知日期。"
 ],
 [
  "维修日志写着：A technician repaired the scanner on Monday. 扫描仪是被修对象，日志指出确切施事。",
  "用 The scanner 开头转成一般过去被动，保留 on Monday；可保留或省略 by a technician。",
  "The scanner was repaired on Monday.",
  [
   [
    "The technician was repaired on Monday.",
    "交换被修对象。"
   ],
   [
    "The scanner is repaired on Monday.",
    "本题日志是已完成过去事件。"
   ],
   [
    "The scanner was repair on Monday.",
    "需 repaired。"
   ],
   [
    "The scanner repaired a technician on Monday.",
    "交换角色并变主动。"
   ]
  ],
  "有明确动作与过去日期，可以省略或保留 by a technician。"
 ],
 [
  "快递日志：昨天门卫收了包裹，却没有把包裹交给住户。现在要核实未交付这一动作是否确实没发生。",
  "写一个被动否定问句，主句使用 Was the parcel not 开头（时间状语可前置），使用 give / to the resident / yesterday；也可用 Wasn't 开头。",
  "Was the parcel not given to the resident yesterday?",
  [
   [
    "Was the parcel given to the resident yesterday?",
    "题目要求核实未交付这一否定。"
   ],
   [
    "Did the parcel not give the resident yesterday?",
    "包裹不是施事。"
   ],
   [
    "Was the resident not given to the parcel yesterday?",
    "住户与包裹角色交换。"
   ],
   [
    "Was the parcel not gave to the resident yesterday?",
    "give 的分词是 given。"
   ]
  ],
  "外层疑问将 was 前置，not 仍否定交付。"
 ],
 [
  "维修计划说工作人员每半年检测烟雾报警器，不是描述报警器自己检测别人。",
  "主句使用 The smoke alarms 开头（时间状语可前置），用 test / every six months 的一般现在被动，不写施事。",
  "The smoke alarms are tested every six months.",
  [
   [
    "The smoke alarms test every six months.",
    "报警器不是施事。"
   ],
   [
    "The smoke alarms were tested six months ago.",
    "重复流程改过去单次。"
   ],
   [
    "The smoke alarms are testing every six months.",
    "主动进行不保留受事。"
   ],
   [
    "The smoke alarms is tested every six months.",
    "复数 are。"
   ]
  ],
  "陌生设备仍依动作记录决定被动与时态。"
 ],
 [
  "港口日志确认：风暴昨天损坏了这个码头，工作人员今天仅拍照。现仅写昨天的损坏事件。",
  "主句使用 The pier 开头（时间状语可前置），用 damage / by the storm / yesterday 的一般过去被动，必须保留施事。",
  "The pier was damaged by the storm yesterday.",
  [
   [
    "The pier was damaged by the workers yesterday.",
    "损坏施事是风暴。"
   ],
   [
    "The storm was damaged by the pier yesterday.",
    "角色交换。"
   ],
   [
    "The pier is damaged by the storm yesterday.",
    "本题是昨天动作，不只是当前状况。"
   ],
   [
    "The pier was photographed by the storm yesterday.",
    "选错动作。"
   ]
  ],
  "明确损坏事件与施事，避免把事件被动和状态形容混淆。"
 ],
 [
  "维护报告区分：灯泡昨天更换了，电池昨天没有更换。选择保留电池未更换事件的被动句。",
  "只选一整句。",
  "The batteries were not replaced yesterday.",
  [
   [
    "The batteries were replaced yesterday.",
    "丢失否定。"
   ],
   [
    "The bulbs were not replaced yesterday.",
    "对象错误且与日志矛盾。"
   ],
   [
    "The batteries did not replace the bulbs yesterday.",
    "变成电池主动更换灯泡。"
   ],
   [
    "The batteries are not replaced yesterday.",
    "日期与现在 be 冲突。"
   ]
  ],
  "先识别未发生的事件，再选受事、过去 be 与否定。"
 ]
];
const drafted=author(data,rows);
const scopeExtension="部分题为情境选择，按完整选项作答；构句与选择分别提供证据。自然缩写、时间位置及题目许可的 by 施事形式列入有限答案；被动问句与否定是已有 be 问/否结构的组合扩展，不冒充142原文直授。";
const alternatives=[
 [
  "The lift is checked every week.",
  "Every week, the lift is checked.",
  "Every week the lift is checked.",
  "The lift is checked weekly."
 ],
 [
  "The letter was delivered to the hospital yesterday.",
  "Yesterday, the letter was delivered to the hospital.",
  "Yesterday the letter was delivered to the hospital."
 ],
 [
  "The passengers were not told yesterday.",
  "The passengers weren't told yesterday.",
  "Yesterday, the passengers were not told.",
  "Yesterday, the passengers weren't told.",
  "Yesterday the passengers were not told.",
  "Yesterday the passengers weren't told."
 ],
 [
  "The tools are washed every day.",
  "Every day, the tools are washed.",
  "Every day the tools are washed.",
  "The tools are washed daily."
 ],
 [
  "Nina was invited to the exhibition last week.",
  "Last week, Nina was invited to the exhibition.",
  "Last week Nina was invited to the exhibition."
 ],
 [
  "Were the tickets counted yesterday?",
  "Yesterday, were the tickets counted?",
  "Yesterday were the tickets counted?"
 ],
 [
  "The records are scanned every month."
 ],
 [
  "The statue was moved yesterday.",
  "Yesterday, the statue was moved.",
  "Yesterday the statue was moved."
 ],
 [
  "Are the patients given these medicines every night?",
  "Every night, are the patients given these medicines?",
  "Every night are the patients given these medicines?"
 ],
 [
  "The pump is repaired regularly.",
  "The pump is regularly repaired.",
  "Regularly, the pump is repaired.",
  "Regularly the pump is repaired."
 ],
 [
  "The cases were found at the station yesterday.",
  "Yesterday, the cases were found at the station.",
  "Yesterday the cases were found at the station.",
  "The cases were found yesterday at the station."
 ],
 [
  "The piano was not moved yesterday.",
  "The piano wasn't moved yesterday.",
  "Yesterday, the piano was not moved.",
  "Yesterday, the piano wasn't moved.",
  "Yesterday the piano was not moved.",
  "Yesterday the piano wasn't moved."
 ],
 [
  "The library cards are replaced every term."
 ],
 [
  "The scanner was repaired on Monday.",
  "The scanner was repaired by a technician on Monday.",
  "The scanner was repaired on Monday by a technician.",
  "On Monday, the scanner was repaired.",
  "On Monday the scanner was repaired.",
  "On Monday, the scanner was repaired by a technician.",
  "On Monday the scanner was repaired by a technician."
 ],
 [
  "Was the parcel not given to the resident yesterday?",
  "Wasn't the parcel given to the resident yesterday?",
  "Yesterday, was the parcel not given to the resident?",
  "Yesterday was the parcel not given to the resident?",
  "Yesterday, wasn't the parcel given to the resident?",
  "Yesterday wasn't the parcel given to the resident?"
 ],
 [
  "The smoke alarms are tested every six months.",
  "Every six months, the smoke alarms are tested.",
  "Every six months the smoke alarms are tested."
 ],
 [
  "The pier was damaged by the storm yesterday.",
  "Yesterday, the pier was damaged by the storm.",
  "Yesterday the pier was damaged by the storm.",
  "The pier was damaged yesterday by the storm."
 ],
 [
  "The batteries were not replaced yesterday."
 ]
];
const overrides={"6": {"kind": "choice", "form": "choice", "options": ["The records are scanned every month.", "The records scan every month.", "The records were scanned last month.", "The researchers are scanned every month."], "prompt": "只选一整句。 不改写选项。", "criterion": "只选一整句。"}, "12": {"kind": "choice", "form": "choice", "options": ["The library cards are replaced every term.", "The library cards were replaced yesterday.", "The teachers are replaced every term.", "The library cards replace the teachers every term."], "prompt": "只选一整句。 不改写选项。", "criterion": "只选一整句。"}, "17": {"kind": "choice", "form": "choice", "options": ["The batteries were not replaced yesterday.", "The batteries were replaced yesterday.", "The bulbs were not replaced yesterday.", "The batteries did not replace the bulbs yesterday."], "prompt": "只选一整句。 不改写选项。", "criterion": "只选一整句。"}};
const tasks=drafted.questions.map((q,i)=>({...q,accepted:[...new Set([...alternatives[i],...(overrides[i]?[]:q.accepted)])],...(overrides[i]||{})}));
data.contentStatus='authored-blind-reviewed';
data.scope+=' '+scopeExtension;
export const {lesson,questions,byId,questionsFor,matches}=bindContent(data,tasks);
