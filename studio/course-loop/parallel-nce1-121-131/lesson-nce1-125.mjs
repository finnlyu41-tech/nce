// Original finite authored tasks; use the existing author and assessment model.
import {author,metadata,variants} from '../parallel-nce1-049-059/authoring.mjs';
import {bindContent} from '../parallel-nce1-025-035/content-contract.mjs';
const data=metadata(125,"aec2e709b73cb949cb519696e94340510a685714ecb2c1048639dea3509d6079","现在与过去的义务及不必","根据已给安排区分have/has to、had to和do/does not need to，不把不必改成禁止。",["已学一般现在时、一般过去时、do/does否定、must后用原形；情境提供必要安排。"],[{"target": "present-have-to", "title": "外部安排要求have/has to", "explanation": "用have to转述已明确的外部需要；第三人称单数用has to，后面接动词原形。用Do/Does + 主语 + have to询问；do/does not have to表示不必。配套126书面页有have to否定和has to，问句继承已学do/does。题目只给有限的规则或情境，不凭主观猜测替别人设定义务。", "example": "The driver has to check the tyres.", "meaning": "司机必须检查轮胎。", "check": "核对陈述、询问或不存在义务；Do/Does后have原形，肯定单数has，to后动作原形。"}, {"target": "past-had-to", "title": "过去的必要行动用had to", "explanation": "原文去年夏天每天浇水用had to。一般过去时的必要行动，各主语均用had to加原形，不写musted，也不把had to当成已经完成动作的证明。过去义务问句用Did + 主语 + have to，did后不用had；配套126句型页有Did you have to...?。本批不独立训练will have to或have had to。", "example": "We had to move the chairs yesterday.", "meaning": "昨天我们不得不搬椅子。", "check": "过去肯定用had to，询问用Did加have to；保留必要行动与时间。"}, {"target": "no-need", "title": "不必用do/does not need to", "explanation": "现实需要消失时可说do not need to，第三人称单数用does not need to。这里表示没有必要，仍可选择做；must not表示禁止，不能交换。本批按题干指定need to，不扩展need的所有用法。", "example": "She does not need to bring a chair.", "meaning": "她不必带椅子。", "check": "do/does后need用原形，后接to加动作；不把不必说成禁止。"}],[[25.78, 29.52, "原声：have to问当前必要；has to见配套页"], [44.16, 47.52, "原声：had to说过去义务"], [63.46, 68.8, "原声：do not need to表示不必"]],"写真实或明确虚构的三项安排：目前必须做的事、过去不得不做的事、现在不必做但仍可选择做的事。先确认外部安排，不替他人编造义务；请伙伴核对时间和不必的意思。");
data.contentStatus='authored-pending-independent-blind-review';
data.source.pairedExercise={"entryId": "NCE1-125", "lessons": [125, 126], "page": 259, "path": "/lesson-pages/312108084968ecc4a609d380965994f51e280afa4e0af6f4868ce5aabd290b07.jpg", "sha256": "312108084968ecc4a609d380965994f51e280afa4e0af6f4868ce5aabd290b07", "pages": [258, 259, 260], "printedPages": [254, 255, 256], "note": "page/pages使用现有PDF目录序号；printedPages为实际扫描页脚，目录序号较书上印页码多4。现有素材原样绑定，原创任务不是原句换名。"};
data.source.comicPages=[{"page": 257, "src": "/lesson-pages/4ddd289e326e440f9035c879d90d347529e650093d01467b5bb18e6b92975ff7.jpg", "sha256": "4ddd289e326e440f9035c879d90d347529e650093d01467b5bb18e6b92975ff7"}, {"page": 258, "src": "/lesson-pages/01446f68c56de7b39dda935f4fe3412a90a56d67511d9b544ea7f6dac6665721.jpg", "sha256": "01446f68c56de7b39dda935f4fe3412a90a56d67511d9b544ea7f6dac6665721"}];
data.limits={"finiteMatching": "Only constrained output and listed variants; mismatch does not establish that free English is wrong.", "ownExpression": "awaiting-human-review", "listening": "unverified", "pronunciation": "unverified", "natural24HourRetention": "unverified", "natural7DayRetention": "unverified", "learningGains": "unverified", "sourceVideo": "unchanged; not reviewed by this text author", "clipEnds": "Next LRC row is a bounded link, not a heard acoustic boundary."};
data.scope+=' 本组只独立训练一般现在义务、一般过去义务与need to的一般现在否定；will have to、have had to和need其他结构未独立训练。';
const rows=[
  [
    "图书馆今天的规则要求工作人员给这些箱子贴标签；我们属于工作人员。",
    "以We开头，用have to表达现在的义务，用一般现在时；动作用词根短语label the boxes，today放句末。",
    "We have to label the boxes today.",
    [
      [
        "We had to label the boxes today.",
        "把当前义务变成过去。"
      ],
      [
        "We has to label the boxes today.",
        "have/has与主语不符。"
      ],
      [
        "We have to labels the boxes today.",
        "to后应为动词原形。"
      ],
      [
        "We do not need to label the boxes today.",
        "当前必须被反转为不必。"
      ]
    ],
    "义务或不必由已给事实决定；核对主语、时间、to和动词原形。",
    []
  ],
  [
    "上周停电，工厂规定她必须使用手电筒。现在只转述当时的必要安排。",
    "以She开头，用have to表达过去的义务，用一般过去时；动作用词根短语use a torch，last week放句末。",
    "She had to use a torch last week.",
    [
      [
        "She have to use a torch last week.",
        "过去义务不能换成现在have to。"
      ],
      [
        "She must to use a torch last week.",
        "must后不加to，且没表达此过去义务。"
      ],
      [
        "She had use a torch last week.",
        "had后遗漏to。"
      ],
      [
        "She did not have to use a torch last week.",
        "必须被反转为不必。"
      ]
    ],
    "义务或不必由已给事实决定；核对主语、时间、to和动词原形。",
    []
  ],
  [
    "场馆已提供所有椅子，所以你今天不必带椅子，愿意带也可以。",
    "以You开头，用need to写一般现在时否定，表达不必；动作用词根短语bring a chair，today放句末。",
    "You do not need to bring a chair today.",
    [
      [
        "You must not bring a chair today.",
        "不必并不表示禁止。"
      ],
      [
        "You need to bring a chair today.",
        "不必变成有必要。"
      ],
      [
        "You do not needs to bring a chair today.",
        "do/does后need用原形。"
      ],
      [
        "You do not need bring a chair today.",
        "need在此需to接动作。"
      ]
    ],
    "义务或不必由已给事实决定；核对主语、时间、to和动词原形。",
    [
      "You don't need to bring a chair today."
    ]
  ],
  [
    "博物馆目前的规则要求Mara保留她的票。",
    "以Mara开头，用have to表达现在的义务，用一般现在时；动作用词根短语keep her ticket。",
    "Mara has to keep her ticket.",
    [
      [
        "Mara had to keep her ticket.",
        "把当前义务变成过去。"
      ],
      [
        "Mara have to keep her ticket.",
        "have/has与主语不符。"
      ],
      [
        "Mara has to keeps her ticket.",
        "to后应为动词原形。"
      ],
      [
        "Mara does not need to keep her ticket.",
        "当前必须被反转为不必。"
      ]
    ],
    "义务或不必由已给事实决定；核对主语、时间、to和动词原形。",
    []
  ],
  [
    "昨天总入口关闭，当时我们必须使用侧门。",
    "以We开头，用have to表达过去的义务，用一般过去时；动作用词根短语use the side door，yesterday放句末。",
    "We had to use the side door yesterday.",
    [
      [
        "We have to use the side door yesterday.",
        "过去义务不能换成现在have to。"
      ],
      [
        "We must to use the side door yesterday.",
        "must后不加to，且没表达此过去义务。"
      ],
      [
        "We had use the side door yesterday.",
        "had后遗漏to。"
      ],
      [
        "We did not have to use the side door yesterday.",
        "必须被反转为不必。"
      ]
    ],
    "义务或不必由已给事实决定；核对主语、时间、to和动词原形。",
    []
  ],
  [
    "客服已经找到订单，今天她不必再寄收据；不是禁止寄。",
    "以She开头，用need to写一般现在时否定，表达不必；动作用词根短语send the receipt，today放句末。",
    "She does not need to send the receipt today.",
    [
      [
        "She must not send the receipt today.",
        "不必并不表示禁止。"
      ],
      [
        "She need to send the receipt today.",
        "不必变成有必要。"
      ],
      [
        "She does not needs to send the receipt today.",
        "do/does后need用原形。"
      ],
      [
        "She does not need send the receipt today.",
        "need在此需to接动作。"
      ]
    ],
    "义务或不必由已给事实决定；核对主语、时间、to和动词原形。",
    [
      "She doesn't need to send the receipt today."
    ]
  ],
  [
    "乘船前是否必须检查绳子还没有确认。你替岸上的工作人员询问：他们现在是否必须检查这些绳子？",
    "用they和have to写一般现在时的一般疑问句；动作词根短语check the ropes，now放句末。",
    "Do they have to check the ropes now?",
    [
      [
        "They have to check the ropes now.",
        "未确认的规则不能直接断言。"
      ],
      [
        "Does they have to check the ropes now?",
        "they配do。"
      ],
      [
        "Do they has to check the ropes now?",
        "do后have用原形。"
      ],
      [
        "Do they have check the ropes now?",
        "遗漏to。"
      ]
    ],
    "询问现在义务，用Do they have to加原形；未推断答案。",
    []
  ],
  [
    "昨晚夜间班车是否停开，你不知道；你向同伴询问他当时是否不得不步行回家。",
    "以Did you开头，用have to写一般过去时的一般疑问句；动作词根短语walk home，last night放句末。",
    "Did you have to walk home last night?",
    [
      [
        "Did you had to walk home last night?",
        "did后have用原形。"
      ],
      [
        "Do you have to walk home last night?",
        "明确过去用did。"
      ],
      [
        "You had to walk home last night.",
        "询问未确认的过去需要，不能断言。"
      ],
      [
        "Did you have walk home last night?",
        "遗漏to。"
      ]
    ],
    "过去义务的问句用Did加have to；had to只用于此过去义务的肯定陈述。",
    []
  ],
  [
    "主办方问Do we have to buy a microphone? 设备已经租好，所以不需要购买，但仍允许自愿买。你代表团队回答。",
    "用No开头，再用we和need to写一般现在否定短答，保留完整动作buy a microphone。不用have to替代need to。",
    "No, we do not need to buy a microphone.",
    [
      [
        "No, we must not buy a microphone.",
        "不必不是禁止。"
      ],
      [
        "No, we need to buy a microphone.",
        "必须与No矛盾，且不符已给安排。"
      ],
      [
        "No, we does not need to buy a microphone.",
        "we配do。"
      ],
      [
        "No, we do not need buy a microphone.",
        "need在此后接to。"
      ]
    ],
    "根据已租设备的事实回答不必；need to否定不禁止自愿购买。",
    []
  ],
  [
    "换到酒店接待：当前规定要求这位司机在这里等待。",
    "以The driver开头，用have to表达现在的义务，用一般现在时；动作用词根短语wait here，now放句末。",
    "The driver has to wait here now.",
    [
      [
        "The driver had to wait here now.",
        "把当前义务变成过去。"
      ],
      [
        "The driver have to wait here now.",
        "have/has与主语不符。"
      ],
      [
        "The driver has to waits here now.",
        "to后应为动词原形。"
      ],
      [
        "The driver does not need to wait here now.",
        "当前必须被反转为不必。"
      ]
    ],
    "义务或不必由已给事实决定；核对主语、时间、to和动词原形。",
    []
  ],
  [
    "换到戏院：去年取暖系统坏了，他当时必须穿外套。",
    "以He开头，用have to表达过去的义务，用一般过去时；动作用词根短语wear a coat，last year放句末。",
    "He had to wear a coat last year.",
    [
      [
        "He have to wear a coat last year.",
        "过去义务不能换成现在have to。"
      ],
      [
        "He must to wear a coat last year.",
        "must后不加to，且没表达此过去义务。"
      ],
      [
        "He had wear a coat last year.",
        "had后遗漏to。"
      ],
      [
        "He did not have to wear a coat last year.",
        "必须被反转为不必。"
      ]
    ],
    "义务或不必由已给事实决定；核对主语、时间、to和动词原形。",
    []
  ],
  [
    "换到展厅：Mara有电子通行证，所以今天不必打印这张表格；仍可自愿打印。",
    "以Mara开头，用need to写一般现在时否定，表达不必；动作用词根短语print the form，today放句末。",
    "Mara does not need to print the form today.",
    [
      [
        "Mara must not print the form today.",
        "不必并不表示禁止。"
      ],
      [
        "Mara need to print the form today.",
        "不必变成有必要。"
      ],
      [
        "Mara does not needs to print the form today.",
        "do/does后need用原形。"
      ],
      [
        "Mara does not need print the form today.",
        "need在此需to接动作。"
      ]
    ],
    "义务或不必由已给事实决定；核对主语、时间、to和动词原形。",
    [
      "Mara doesn't need to print the form today."
    ]
  ],
  [
    "新的周末营地已经为每位参与者提供杯子；我不必自带，但可以自愿带。通知要用have to系统表达这项义务不存在。",
    "以I开头，用have to写一般现在时否定陈述；动作用bring my cup。不用need to或must not替代。",
    "I do not have to bring my cup.",
    [
      [
        "I have to bring my cup.",
        "没有必要被反转为必须。"
      ],
      [
        "I must not bring my cup.",
        "不存在义务并不是禁止。"
      ],
      [
        "I does not have to bring my cup.",
        "I配do。"
      ],
      [
        "I do not has to bring my cup.",
        "do后have用原形。"
      ]
    ],
    "do not have to与do not need to都可表达不必；本题指定have to形式，保留自愿选择。",
    []
  ],
  [
    "新的社区记录说明，昨天桥梁检修，他们当时必须乘渡船。",
    "以They开头，用have to表达过去的义务，用一般过去时；动作用词根短语take the ferry，yesterday放句末。",
    "They had to take the ferry yesterday.",
    [
      [
        "They have to take the ferry yesterday.",
        "过去义务不能换成现在have to。"
      ],
      [
        "They must to take the ferry yesterday.",
        "must后不加to，且没表达此过去义务。"
      ],
      [
        "They had take the ferry yesterday.",
        "had后遗漏to。"
      ],
      [
        "They did not have to take the ferry yesterday.",
        "必须被反转为不必。"
      ]
    ],
    "义务或不必由已给事实决定；核对主语、时间、to和动词原形。",
    []
  ],
  [
    "新的音乐课老师问Do they have to bring a guitar today? 乐器已经提供，允许自愿携带。你根据通知作完整否定短答。",
    "用No开头，再用they、need to写一般现在否定；保留bring a guitar，today放句末。不用have to替代need to。",
    "No, they do not need to bring a guitar today.",
    [
      [
        "No, they must not bring a guitar today.",
        "不必不是禁止。"
      ],
      [
        "No, they need to bring a guitar today.",
        "把不必变成有必要。"
      ],
      [
        "No, they does not need to bring a guitar today.",
        "they配do。"
      ],
      [
        "No, they do not need bring a guitar today.",
        "遗漏to。"
      ]
    ],
    "短答必须跟通知中的没有必要一致，No之后保留need to否定。",
    []
  ],
  [
    "新的旅游团尚未确认是否要求向导现在清点游客。你向团队负责人核实这项必要安排，不代替负责人制定规则。",
    "用the guide和have to写一般现在的一般疑问句；动作用count the visitors，now放句末。",
    "Does the guide have to count the visitors now?",
    [
      [
        "Do the guide have to count the visitors now?",
        "单数guide配does。"
      ],
      [
        "Does the guide has to count the visitors now?",
        "does后have原形。"
      ],
      [
        "The guide has to count the visitors now.",
        "未确认必要安排被断言。"
      ],
      [
        "Does the guide have count the visitors now?",
        "遗漏to。"
      ]
    ],
    "第三人称现在义务问句用Does加have to，不写Does加has。",
    []
  ],
  [
    "新的食堂在检查上周的搬运记录，但我们当时是否必须搬这些袋子还没确认。你向当时的管理员核实。",
    "用we和have to写一般过去时的一般疑问句；动作用carry the bags，last week放句末。",
    "Did we have to carry the bags last week?",
    [
      [
        "Did we had to carry the bags last week?",
        "did后have原形。"
      ],
      [
        "Do we have to carry the bags last week?",
        "过去时间用did。"
      ],
      [
        "We had to carry the bags last week.",
        "未确认事实不能断言。"
      ],
      [
        "Did we have carry the bags last week?",
        "遗漏to。"
      ]
    ],
    "过去义务可先用Did we have to询问；不把资料未确认说成已确认。",
    []
  ],
  [
    "新的档案室管理员问Do you have to copy the letter today? 我知道已有复印件，今天无需再复制，仍可以自愿复制。",
    "用No开头，从自己的立场用I和need to写一般现在否定，保留copy the letter，today放句末。不用have to替代need to。",
    "No, I do not need to copy the letter today.",
    [
      [
        "No, you do not need to copy the letter today.",
        "回答应从我自己的立场，不把主语换成听者。"
      ],
      [
        "No, I must not copy the letter today.",
        "不必不是禁止。"
      ],
      [
        "No, I does not need to copy the letter today.",
        "I配do。"
      ],
      [
        "No, I do not need copy the letter today.",
        "遗漏to。"
      ]
    ],
    "回答中的you转成I；按已有副本的事实表达不必。",
    []
  ]
];
const authored=author(data,rows);
for(let i=0;i<rows.length;i++){
 const q=authored.questions[i];
 q.accepted=[...new Set([...q.accepted,...rows[i][5]].flatMap(variants))];
 for(const a of [...q.accepted]){
  for(const [full,short] of [['That is',"That's"],['He is',"He's"],['She is',"She's"],['They are',"They're"]]) if(a.startsWith(full+' '))q.accepted.push(a.replace(full,short));
 }
 q.accepted=[...new Set(q.accepted)];
 if(q.prompt.includes('now放句末'))q.accepted=q.accepted.filter(a=>/ now[.?]$/.test(a));
}
export const {lesson,questions,byId,questionsFor,matches}=bindContent(data,authored.questions);
