// Original authored finite tasks; assessment and event history remain in ../model.mjs.
import {author,metadata} from '../parallel-nce1-049-059/authoring.mjs';
import {bindContent} from '../parallel-nce1-025-035/content-contract.mjs';
const data=metadata(101,"ffd4549443446e47b6c72ddf9f4e4e15276378c7e57398411e363150cf3b5c4b","即时转述并调整人称","转述当前状态、刚完成的结果与将来计划；根据原说话者和转述听者调整I/we/you及物主，that可省略。",["已学99–100课says/say引出陈述从句，现在进行时、have/has just及will。此组只做现在报告，不引入过去报告的时态后移。"],[{"target": "report-present", "title": "转述当前状态并核对人称", "explanation": "当前消息由He/She says或They say报告；I变he/she，原说话者群体的we变they。若原you指现在的转述者，可变I/we；当前状态时态不变。that可省略。", "example": "She says she is staying with her aunt.", "meaning": "她说她正住在她姑妈家。", "check": "画清原说话者、原听者、转述者；当前be或进行时保留，物主也随人物改变。"}, {"target": "report-just", "title": "转述刚完成的结果", "explanation": "原消息have just + 过去分词，单数he/she转述后用has just，复数they用have just；保持just和现在完成结果，不机械换为had。that可有可无。", "example": "He says that he has just finished the model.", "meaning": "他说他刚完成模型。", "check": "谁刚完成、完成什么不改变；have/has按转述从句主语确定。"}, {"target": "report-plan", "title": "转述将来计划或许诺", "explanation": "原说话者用will表达未来计划，当前says/say转述仍用will；根据指代换人称和物主。that可省略，he will可缩为he’ll；will不是would。", "example": "They say they will bring their tickets.", "meaning": "他们说他们会带他们的票来。", "check": "保留未来will、时间与动作；核对谁行动及谁拥有物件。"}],[[44.04, 49.41, "原声：He says he is staying…"], [38.97, 44.04, "原声：He says he has just arrived…"], [84.2, 88.45, "原声：He says he will write…"]],"请一位同伴提供当前状态、刚完成的一件事与一项未来计划，向第三人转述。记录原话与转述，核对代词、物主和时间；that可写可省略。");
data.contentStatus='authored-pending-independent-blind-review';
data.source.pairedExercise={"entryId": "NCE1-101", "lessons": [101, 102], "page": 211, "path": "/lesson-pages/d5c64b3bc8f72f3ffe44229b54849ea79d66ee2aeba4e321c30ef0077d166217.jpg", "sha256": "d5c64b3bc8f72f3ffe44229b54849ea79d66ee2aeba4e321c30ef0077d166217", "note": "102课原页He says he…/She says she…/They say they…及hope/is sure/can/will框体现that可省略；101原文另外展示has just、is staying与will的当前报告。不教没有来源依据的过去报告后移。"};
data.source.comicPages=[{"page": 209, "src": "/lesson-pages/19fdb7a17bb5d43fb859b820d48d1becdd4c774ed79723bfcc3eef9c85cf0f42.jpg", "sha256": "19fdb7a17bb5d43fb859b820d48d1becdd4c774ed79723bfcc3eef9c85cf0f42"}, {"page": 210, "src": "/lesson-pages/e8fb6155a3b21d82e47ca61c1a58888943a43c1eb364117a513a15720b91dc4b.jpg", "sha256": "e8fb6155a3b21d82e47ca61c1a58888943a43c1eb364117a513a15720b91dc4b"}];
data.limits={"finiteMatching": "Only the constrained outputs and listed variants are checked; a mismatch does not establish that free English is wrong.", "ownExpression": "awaiting-human-review", "listening": "unverified", "pronunciation": "unverified", "natural24HourRetention": "unverified", "natural7DayRetention": "unverified", "learningGains": "unverified", "sourceVideo": "unchanged; not reviewed by this text author"};
const rows=[
  [
    "男摄影师当前给你发来消息：他现在正住在河边的一家旅馆。你立刻向编辑报告他的消息。",
    "用He和say转述，消息词汇stay at a hotel、by the river（河边）；保留正在进行。 主句用一般现在时。",
    "He says that he is staying at a hotel by the river.",
    [
      [
        "He says that I am staying at a hotel by the river.",
        "转述者被当成住客。"
      ],
      [
        "He says that he was staying at a hotel by the river.",
        "当前状态无据变过去。"
      ],
      [
        "He say that he is staying at a hotel by the river.",
        "单数主句says。"
      ],
      [
        "He says that he is leaving a hotel by the river.",
        "住在改为离开。"
      ]
    ],
    "原I指摄影师，转述后he；目前住着用is staying。",
    [
      "He says he is staying at a hotel by the river.",
      "He says that he's staying at a hotel by the river.",
      "He says he's staying at a hotel by the river."
    ]
  ],
  [
    "一位女模型制作者现在告诉你：她刚完成那座桥的模型。你马上向评委报告她这件事。",
    "用She和say转述；消息词汇just、finish the model bridge（桥模型），用现在完成时。 主句用一般现在时。",
    "She says that she has just finished the model bridge.",
    [
      [
        "She says that I have just finished the model bridge.",
        "完成人变为转述者。"
      ],
      [
        "She says that she have just finished the model bridge.",
        "单数she配has。"
      ],
      [
        "She says that she had just finished the model bridge.",
        "当前says不要求过去完成时。"
      ],
      [
        "She says that she will finish the model bridge.",
        "刚完成变未完成计划。"
      ]
    ],
    "原话完成结果保留has just finished；she指制作者。",
    [
      "She says she has just finished the model bridge.",
      "She says that she's just finished the model bridge.",
      "She says she's just finished the model bridge."
    ]
  ],
  [
    "两名志愿者此刻共同告诉你：他们会明天带他们自己的地图来。你向协调员转述此计划。",
    "以They开头，用say报告；消息词汇bring、their maps、tomorrow、will。 主句用一般现在时。",
    "They say that they will bring their maps tomorrow.",
    [
      [
        "They says that they will bring their maps tomorrow.",
        "复数主句say。"
      ],
      [
        "They say that we will bring our maps tomorrow.",
        "行动者与物主变成我们。"
      ],
      [
        "They say that they would bring their maps tomorrow.",
        "现在报告保留will。"
      ],
      [
        "They say that they have brought their maps tomorrow.",
        "未来计划与完成表达冲突。"
      ]
    ],
    "原we和our属于志愿者，转述为they/their；未来will不变。",
    [
      "They say they will bring their maps tomorrow.",
      "They say that they'll bring their maps tomorrow.",
      "They say they'll bring their maps tomorrow.",
      "They say that tomorrow they will bring their maps.",
      "They say tomorrow they will bring their maps.",
      "They say that tomorrow they'll bring their maps.",
      "They say tomorrow they'll bring their maps.",
      "They say that tomorrow, they will bring their maps.",
      "They say tomorrow, they will bring their maps.",
      "They say that tomorrow, they'll bring their maps.",
      "They say tomorrow, they'll bring their maps."
    ]
  ],
  [
    "女店长此刻对你说明：她正与她姐姐待在一起。你向同事转述她的情况。",
    "用She和say报告；消息词汇stay with、her sister；保留进行时。 主句用一般现在时。",
    "She says that she is staying with her sister.",
    [
      [
        "She says that I am staying with my sister.",
        "人物和物主改变。"
      ],
      [
        "She says that she was staying with her sister.",
        "现在状态变过去。"
      ],
      [
        "She say that she is staying with her sister.",
        "主句需says。"
      ],
      [
        "She says that she is staying with my sister.",
        "姐姐归属变成转述者的。"
      ]
    ],
    "原I/my指店长，转述为she/her；that可省略。",
    [
      "She says she is staying with her sister.",
      "She says that she's staying with her sister.",
      "She says she's staying with her sister."
    ]
  ],
  [
    "两位旅行者刚到车站，立即共同给你消息。你向接站员报告他们刚抵达这里。你和接站员就在该车站。",
    "以They开头，用say转述；消息词汇just、arrive here，用现在完成时。 主句用一般现在时。",
    "They say that they have just arrived here.",
    [
      [
        "They says that they have just arrived here.",
        "复数主句say。"
      ],
      [
        "They say that they has just arrived here.",
        "复数从句have。"
      ],
      [
        "They say that we have just arrived here.",
        "到达者改变。"
      ],
      [
        "They say that they will arrive here.",
        "已抵达变计划。"
      ]
    ],
    "原we变they；他们到你所在处，因此here保持同一地点。",
    [
      "They say they have just arrived here.",
      "They say that they've just arrived here.",
      "They say they've just arrived here."
    ]
  ],
  [
    "男技术员此刻告诉你：他会今晚给你打电话。你现在正向经理转述他的许诺；接电话者是你本人。",
    "用He和say转述，消息词汇phone、tonight、will；用代词指接电话的你本人。 主句用一般现在时。",
    "He says that he will phone me tonight.",
    [
      [
        "He says that he will phone you tonight.",
        "现在听者经理不是原接电话者。"
      ],
      [
        "He says that I will phone him tonight.",
        "电话方向反转。"
      ],
      [
        "He says that he would phone me tonight.",
        "当前报告无据改would。"
      ],
      [
        "He says that he phoned me tonight.",
        "许诺被改为已发生。"
      ]
    ],
    "原话的I是技术员变he，原you是转述者变me。",
    [
      "He says he will phone me tonight.",
      "He says that he'll phone me tonight.",
      "He says he'll phone me tonight.",
      "He says that tonight he will phone me.",
      "He says tonight he will phone me.",
      "He says that tonight he'll phone me.",
      "He says tonight he'll phone me.",
      "He says that tonight, he will phone me.",
      "He says tonight, he will phone me.",
      "He says that tonight, he'll phone me.",
      "He says tonight, he'll phone me."
    ]
  ],
  [
    "两位徒步者此刻共同告诉你，他们现在正在山脚等候。你立即向领队转述，不包括你自己。",
    "以They开头，用say报告；消息词汇wait、at the foot of the hill（山脚），用进行时。 主句用一般现在时。",
    "They say that they are waiting at the foot of the hill.",
    [
      [
        "They says that they are waiting at the foot of the hill.",
        "复数主句say。"
      ],
      [
        "They say that we are waiting at the foot of the hill.",
        "转述者被加入等待者。"
      ],
      [
        "They say that they were waiting at the foot of the hill.",
        "当前等待无据换过去。"
      ],
      [
        "They say that they are waiting at the top of the hill.",
        "地点从山脚变山顶。"
      ]
    ],
    "原we指徒步者，转述为they；正在等待用are waiting。",
    [
      "They say they are waiting at the foot of the hill.",
      "They say that they're waiting at the foot of the hill.",
      "They say they're waiting at the foot of the hill."
    ]
  ],
  [
    "男书店店员此刻告诉你：他刚找到你的书。你现在向另一人转述，书属于你这个转述者。",
    "用He和say报告；消息词汇just、find、my book，用现在完成时。 主句用一般现在时。",
    "He says that he has just found my book.",
    [
      [
        "He says that he have just found my book.",
        "he需has。"
      ],
      [
        "He says that he has just found his book.",
        "书属转述者，不属店员。"
      ],
      [
        "He says that I have just found my book.",
        "找到者改变。"
      ],
      [
        "He says that he had just found my book.",
        "当前报告不改had。"
      ]
    ],
    "店员的I变he；店员对你说your book，转述时为my book。",
    [
      "He says he has just found my book.",
      "He says that he's just found my book.",
      "He says he's just found my book."
    ]
  ],
  [
    "女策展人此刻告诉你：她会很快寄出她自己的照片。你向编辑转述这一计划。",
    "用She和say报告；消息词汇send、her photographs、soon、will。 主句用一般现在时。",
    "She says that she will send her photographs soon.",
    [
      [
        "She says that I will send my photographs soon.",
        "行动者和物主改变。"
      ],
      [
        "She says that she would send her photographs soon.",
        "当前报告保留will。"
      ],
      [
        "She says that she has sent her photographs.",
        "未来变已完成。"
      ],
      [
        "She says that she will send my photographs soon.",
        "照片主人改变。"
      ]
    ],
    "原I/my指策展人，变she/her；soon保留未来时间。",
    [
      "She says she will send her photographs soon.",
      "She says that she'll send her photographs soon.",
      "She says she'll send her photographs soon.",
      "She says that she will soon send her photographs.",
      "She says she will soon send her photographs.",
      "She says that she'll soon send her photographs.",
      "She says she'll soon send her photographs."
    ]
  ],
  [
    "女导演此刻对你和另一位演员说明：你们现在需要一张地图。你代表两位演员向道具师转述导演的话。",
    "用She和say报告；从句用we和need a map，表述现在需求。 主句用一般现在时。",
    "She says that we need a map.",
    [
      [
        "She says that they need a map.",
        "你代表原听者，需包括你自己的we。"
      ],
      [
        "She says that she needs a map.",
        "把需求者变成导演。"
      ],
      [
        "She says that we needed a map.",
        "当前需求无据改过去。"
      ],
      [
        "She says that we do not need a map.",
        "需求被否定。"
      ]
    ],
    "原you指转述者与另一演员，所以变we；说话者仍是she。",
    [
      "She says we need a map."
    ]
  ],
  [
    "女陶艺师此刻告诉你：她刚把她的碗放在架子上。你向买家转述已完成的摆放。",
    "用She和say报告；消息词汇just、put、her bowl、on the shelf，使用现在完成时。 主句用一般现在时。",
    "She says that she has just put her bowl on the shelf.",
    [
      [
        "She says that she have just put her bowl on the shelf.",
        "she需has。"
      ],
      [
        "She says that she has just put my bowl on the shelf.",
        "碗主人改变。"
      ],
      [
        "She says that she will put her bowl on the shelf.",
        "刚完成变计划。"
      ],
      [
        "She says that she has just put her bowl under the shelf.",
        "位置改为架下。"
      ]
    ],
    "put过去分词拼写不变，has just put保留完成结果；my随陶艺师变her。",
    [
      "She says she has just put her bowl on the shelf.",
      "She says that she's just put her bowl on the shelf.",
      "She says she's just put her bowl on the shelf."
    ]
  ],
  [
    "两名组织者现在对你和你的搭档许诺：他们会带你们两位的箱子。你代表自己和搭档向老师转述。",
    "以They开头，用say报告；消息词汇carry、our boxes、will，不添加时间。 主句用一般现在时。",
    "They say that they will carry our boxes.",
    [
      [
        "They says that they will carry our boxes.",
        "复数主句say。"
      ],
      [
        "They say that we will carry their boxes.",
        "搬运者与物主互换。"
      ],
      [
        "They say that they will carry their boxes.",
        "原your指转述者二人，应为our。"
      ],
      [
        "They say that they carried our boxes.",
        "未来许诺变过去。"
      ]
    ],
    "原we是组织者，转述为they；原your指转述者二人，变our。",
    [
      "They say they will carry our boxes.",
      "They say that they'll carry our boxes.",
      "They say they'll carry our boxes."
    ]
  ],
  [
    "男门卫此刻告诉你：他现在看不见你的车。你立即向同行朋友转述；车是你自己的。",
    "用He和say报告；消息词汇see、my car、can，保留否定。 主句用一般现在时。",
    "He says that he cannot see my car.",
    [
      [
        "He says that he can see my car.",
        "否定反转。"
      ],
      [
        "He says that I cannot see his car.",
        "看见者与物主方向改变。"
      ],
      [
        "He says that he could not see my car.",
        "当前能力限制无据改过去。"
      ],
      [
        "He says that he cannot see his car.",
        "车属于转述者，不是门卫。"
      ]
    ],
    "原I指门卫变he；原your car指你自己的车变my car。",
    [
      "He says he cannot see my car.",
      "He says that he can't see my car.",
      "He says he can't see my car."
    ]
  ],
  [
    "两名学生此刻一起告诉你：他们刚读完那张便条。你立即向老师转述，不把你自己包含进去。",
    "以They开头，用say报告；消息词汇just、read the note，用现在完成时。 主句用一般现在时。",
    "They say that they have just read the note.",
    [
      [
        "They says that they have just read the note.",
        "复数主句say。"
      ],
      [
        "They say that they has just read the note.",
        "复数从句have。"
      ],
      [
        "They say that we have just read the note.",
        "你被加入读者。"
      ],
      [
        "They say that they will read the note.",
        "刚读完变未读计划。"
      ]
    ],
    "原we变they；read过去分词拼写不变，读音需人核。",
    [
      "They say they have just read the note.",
      "They say that they've just read the note.",
      "They say they've just read the note."
    ]
  ],
  [
    "男厨师现在告诉你：他会明天修好那扇门。你立刻向餐厅负责人转述他的计划。",
    "用He和say报告；消息词汇repair the door、tomorrow、will。 主句用一般现在时。",
    "He says that he will repair the door tomorrow.",
    [
      [
        "He say that he will repair the door tomorrow.",
        "单数主句says。"
      ],
      [
        "He says that I will repair the door tomorrow.",
        "行动者改为转述者。"
      ],
      [
        "He says that he would repair the door tomorrow.",
        "当前报告无据改would。"
      ],
      [
        "He says that he has repaired the door tomorrow.",
        "未来计划与完成时冲突。"
      ]
    ],
    "says当前报告保留will，he指原厨师。",
    [
      "He says he will repair the door tomorrow.",
      "He says that he'll repair the door tomorrow.",
      "He says he'll repair the door tomorrow.",
      "He says that tomorrow he will repair the door.",
      "He says tomorrow he will repair the door.",
      "He says that tomorrow he'll repair the door.",
      "He says tomorrow he'll repair the door.",
      "He says that tomorrow, he will repair the door.",
      "He says tomorrow, he will repair the door.",
      "He says that tomorrow, he'll repair the door.",
      "He says tomorrow, he'll repair the door."
    ]
  ],
  [
    "两位画师共同在语音消息中告诉你：他们现在很忙。你立刻向访客转述他们当前状态。",
    "以They开头，用say转述，消息词汇busy（忙），不用进行时动作。 主句用一般现在时。",
    "They say that they are busy.",
    [
      [
        "They says that they are busy.",
        "复数主句say。"
      ],
      [
        "They say that we are busy.",
        "转述者不在画师群体内。"
      ],
      [
        "They say that they were busy.",
        "当前状态变过去。"
      ],
      [
        "They say that they are free.",
        "忙变空闲。"
      ]
    ],
    "原we指画师变they，当前状态are busy不后移。",
    [
      "They say they are busy.",
      "They say that they're busy.",
      "They say they're busy."
    ]
  ],
  [
    "男邮局职员此刻告诉你：他刚打开那只盒子。你向主管马上报告这条结果。",
    "用He和say报告；消息词汇just、open the box，用现在完成时。 主句用一般现在时。",
    "He says that he has just opened the box.",
    [
      [
        "He says that he have just opened the box.",
        "单数从句has。"
      ],
      [
        "He says that I have just opened the box.",
        "动作主体改变。"
      ],
      [
        "He says that he had just opened the box.",
        "当前报告无据改had。"
      ],
      [
        "He says that he has just closed the box.",
        "动作相反。"
      ]
    ],
    "原I变he，完成结果用has just opened。",
    [
      "He says he has just opened the box.",
      "He says that he's just opened the box.",
      "He says he's just opened the box."
    ]
  ],
  [
    "女领队现在对你承诺：她会很快给你寄一封信。你立刻向另一人转述；收信人是你本人。",
    "用She和say报告；消息词汇send、a letter、to me、soon、will。 主句用一般现在时。",
    "She says that she will send a letter to me soon.",
    [
      [
        "She says that she will send a letter to you soon.",
        "现在听者不是原收信人。"
      ],
      [
        "She says that I will send a letter to her soon.",
        "寄信方向反了。"
      ],
      [
        "She says that she would send a letter to me soon.",
        "当前报告保留will。"
      ],
      [
        "She says that she has sent a letter to me.",
        "许诺变已完成。"
      ]
    ],
    "原I指领队变she，原you指转述者变me；未来计划保持will。",
    [
      "She says she will send a letter to me soon.",
      "She says that she'll send a letter to me soon.",
      "She says she'll send a letter to me soon.",
      "She says that she will send me a letter soon.",
      "She says she will send me a letter soon.",
      "She says that she'll send me a letter soon.",
      "She says she'll send me a letter soon.",
      "She says that she will soon send a letter to me.",
      "She says she will soon send a letter to me.",
      "She says that she'll soon send a letter to me.",
      "She says she'll soon send a letter to me.",
      "She says that she will soon send me a letter.",
      "She says she will soon send me a letter.",
      "She says that she'll soon send me a letter.",
      "She says she'll soon send me a letter."
    ]
  ]
];
const authored=author(data,rows);
for(let i=0;i<rows.length;i++) authored.questions[i].accepted=[...new Set([...authored.questions[i].accepted,...rows[i][5]])];
export const {lesson,questions,byId,questionsFor,matches}=bindContent(data,authored.questions);
