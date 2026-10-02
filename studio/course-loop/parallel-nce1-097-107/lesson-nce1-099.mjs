// Original authored finite tasks; assessment and event history remain in ../model.mjs.
import {author,metadata} from '../parallel-nce1-049-059/authoring.mjs';
import {bindContent} from '../parallel-nce1-025-035/content-contract.mjs';
const data=metadata(99,"41d7de8ed63c30f8067ee413a53a383b9817d04cc8150b7022f231b207e7154d","区分判断、确定与转述","用think表达推测，用be sure保留已确认事实，用says/say转述当前报告，正确连接陈述语序从句。",["已学现在时、can/will及现在完成时的基本形式；99课think/sure/says原文与100课从句句型。题内提供词义与事实。"],[{"target": "think-clause", "title": "think引出判断", "explanation": "I think (that) + 陈述句表达我的判断。that可省略；从句保留自身主语和事实时间，不能用疑问语序。think不自动等于已经确定。", "example": "I think that the shop is open.", "meaning": "我认为商店开着。", "check": "保留推测的think；从句主语和动词按事实确定，that可有可无。"}, {"target": "sure-clause", "title": "be sure引出确定内容", "explanation": "I am sure (that) + 陈述句说明说话者确定的内容。主句需be；从句的肯否、人物和can等内容不能改动。", "example": "I am sure that you can open the box.", "meaning": "我肯定你能打开这个盒子。", "check": "说话者用I am sure；核对确定的肯否和对象，不把确定改成猜测。"}, {"target": "says-clause", "title": "转述当前说法", "explanation": "He/She says (that) ...；They say (that) ...。当前says/say转述时从句用事实本身的现在或未来形式；第一人称随原说话者改为he/she/they。", "example": "She says that she will bring the key.", "meaning": "她说她会带钥匙来。", "check": "先确定原说话者；主句单复数决定says/say，保留消息的时间和人称。"}],[[28.48, 32.54, "原声：I think that…"], [61.83, 66.83, "原声：I am sure that…；最后一句结束窗口"], [56.97, 61.83, "原声：The doctor says that he will…"]],"编写一个生活中尚未确认的判断、一个有依据的确定事实和一位同伴当前的报告，向伙伴说明哪一句只是推测。使用日常事务，不据原文给现实健康建议。");
data.contentStatus='authored-pending-independent-blind-review';
data.source.pairedExercise={"entryId": "NCE1-99", "lessons": [99, 100], "page": 207, "path": "/lesson-pages/9dd05fb085f68e1c690987336df10cd9970e7f32ce376206360bb46b638d3eba.jpg", "sha256": "9dd05fb085f68e1c690987336df10cd9970e7f32ce376206360bb46b638d3eba", "note": "100课原页列He says/thinks/.../is sure that he is/needs/can/will…及She/They标题；此组改为日常消息场景，不照原页医疗词给现实建议。that省略是自然变体并在101–102课继续练习。"};
data.source.comicPages=[{"page": 205, "src": "/lesson-pages/c8c37448a318630d5f1c65725ee4b87dc68fe2eecfeb0998fd352e858372d57d.jpg", "sha256": "c8c37448a318630d5f1c65725ee4b87dc68fe2eecfeb0998fd352e858372d57d"}, {"page": 206, "src": "/lesson-pages/e80eab87cf8c528b8594bff5ea1bf7c1398297d5d83953745359fdc9c3d07f33.jpg", "sha256": "e80eab87cf8c528b8594bff5ea1bf7c1398297d5d83953745359fdc9c3d07f33"}];
data.limits={"finiteMatching": "Only the constrained outputs and listed variants are checked; a mismatch does not establish that free English is wrong.", "ownExpression": "awaiting-human-review", "listening": "unverified", "pronunciation": "unverified", "natural24HourRetention": "unverified", "natural7DayRetention": "unverified", "learningGains": "unverified", "sourceVideo": "unchanged; not reviewed by this text author"};
const rows=[
  [
    "你看到商店灯亮着但还没有问店员。你向朋友说自己的判断：商店目前开着。",
    "用I和think表达判断；从句词汇shop、open、the。",
    "I think that the shop is open.",
    [
      [
        "I am sure that the shop is open.",
        "把推测提升为确定。"
      ],
      [
        "I think that is the shop open.",
        "从句需陈述语序。"
      ],
      [
        "I think that the shop was open.",
        "题中是目前状态。"
      ],
      [
        "I think that the shop is closed.",
        "状态相反。"
      ]
    ],
    "think保留未确认判断，从句the shop is open。",
    [
      "I think the shop is open.",
      "The shop is open, I think.",
      "The shop's open, I think.",
      "I think that the shop's open.",
      "I think the shop's open."
    ]
  ],
  [
    "你刚测试过Nia的钥匙，确定她能够打开那只盒子。你直接对Nia说这件事。",
    "用I、be sure、you、can、open the box写一句确定表达。",
    "I am sure that you can open the box.",
    [
      [
        "I sure that you can open the box.",
        "主句缺be。"
      ],
      [
        "I think that you can open the box.",
        "确定被改为猜测。"
      ],
      [
        "I am sure that I can open the box.",
        "能力主体变成说话者。"
      ],
      [
        "I am sure that you cannot open the box.",
        "能力被否定。"
      ]
    ],
    "I am sure表达确定；直接对Nia说话从句用you。",
    [
      "I am sure you can open the box.",
      "I'm sure that you can open the box.",
      "I'm sure you can open the box."
    ]
  ],
  [
    "男快递员此刻告诉你，他会带一张地图来。你立即对前台转述他的打算，不是你的打算。",
    "用He和say报告，消息词汇bring a map、will；从句用第三人称指快递员。 主句用一般现在时。",
    "He says that he will bring a map.",
    [
      [
        "He say that he will bring a map.",
        "单数主句需says。"
      ],
      [
        "He says that I will bring a map.",
        "把计划改为转述者的。"
      ],
      [
        "He says that he brought a map.",
        "未来变过去。"
      ],
      [
        "He says that he would bring a map.",
        "当前says没有题据要求would。"
      ]
    ],
    "当前says保留未来will；he指同一位快递员。",
    [
      "He says he will bring a map.",
      "He says that he'll bring a map.",
      "He says he'll bring a map."
    ]
  ],
  [
    "航模展示前，你看见一个空座位，猜想他们现在需要一把椅子；并没有直接向他们核实。你向负责人说判断。",
    "用I、think，把they和need a chair连接成一句。",
    "I think that they need a chair.",
    [
      [
        "I am sure that they need a chair.",
        "未确认不应写确定。"
      ],
      [
        "I think that they needs a chair.",
        "they后不用needs。"
      ],
      [
        "I think that we need a chair.",
        "需要者变成我们。"
      ],
      [
        "I think that do they need a chair.",
        "从句不能采用疑问语序。"
      ]
    ],
    "判断属于I，need的主体是they。",
    [
      "I think they need a chair.",
      "They need a chair, I think."
    ]
  ],
  [
    "场馆管理员向你确认这扇门没有上锁。你对朋友说明自己确定：门未上锁。",
    "用I、be sure，door、locked、the写一句；保留否定。",
    "I am sure that the door is not locked.",
    [
      [
        "I sure that the door is not locked.",
        "主句缺am。"
      ],
      [
        "I am sure that the door is locked.",
        "否定事实反转。"
      ],
      [
        "I think that the door is not locked.",
        "题中已确认，不是判断。"
      ],
      [
        "I am sure that the doors are not locked.",
        "单门被改成多门。"
      ]
    ],
    "确定内容为the door is not locked；否定只在从句。",
    [
      "I am sure the door is not locked.",
      "I'm sure that the door is not locked.",
      "I'm sure the door is not locked.",
      "I am sure that the door is unlocked.",
      "I am sure the door is unlocked.",
      "I'm sure that the door is unlocked.",
      "I'm sure the door is unlocked.",
      "I am sure that the door isn't locked.",
      "I am sure the door isn't locked.",
      "I'm sure that the door isn't locked.",
      "I'm sure the door isn't locked."
    ]
  ],
  [
    "一位女售票员现在告诉你，她需要一支笔。你向同事转述她的当前需求。",
    "用She和say报告；消息词汇need a pen，从句人称指女售票员。 主句用一般现在时。",
    "She says that she needs a pen.",
    [
      [
        "She say that she needs a pen.",
        "单数主句需says。"
      ],
      [
        "She says that she need a pen.",
        "she后needs。"
      ],
      [
        "She says that I need a pen.",
        "需求者变为转述者。"
      ],
      [
        "She says that she needed a pen.",
        "目前需求不改过去。"
      ]
    ],
    "主从句两个she均指原说话者，says与needs都取第三人称。",
    [
      "She says she needs a pen."
    ]
  ],
  [
    "你找不到自己的门票，尚未核实放在哪里。你向朋友说：我想我把门票丢了。丢失影响现在。",
    "用I、think和lose my ticket表示现在的判断；消息用现在完成时。",
    "I think that I have lost my ticket.",
    [
      [
        "I am sure that I have lost my ticket.",
        "推测被提升为确定。"
      ],
      [
        "I think that I lose my ticket.",
        "不表达已有的丢失结果。"
      ],
      [
        "I think that I have found my ticket.",
        "结果相反。"
      ],
      [
        "I think that you have lost my ticket.",
        "动作主体改变。"
      ]
    ],
    "think不改变从句的现在完成时；I have lost是已有结果。",
    [
      "I think I have lost my ticket.",
      "I think that I've lost my ticket.",
      "I think I've lost my ticket.",
      "I have lost my ticket, I think.",
      "I've lost my ticket, I think."
    ]
  ],
  [
    "音响测试已通过：远处的两位工作人员明确听到了声音。你向主持人确认他们能听见我们。",
    "用I、be sure、they、can、hear us连接成一句。",
    "I am sure that they can hear us.",
    [
      [
        "I sure that they can hear us.",
        "主句缺am。"
      ],
      [
        "I am sure that they cannot hear us.",
        "能力否定了。"
      ],
      [
        "I am sure that we can hear them.",
        "传声方向反转。"
      ],
      [
        "I think that they can hear us.",
        "确定被降为猜测。"
      ]
    ],
    "听者是they，声音来自us；I am sure保留测试依据。",
    [
      "I am sure they can hear us.",
      "I'm sure that they can hear us.",
      "I'm sure they can hear us."
    ]
  ],
  [
    "两位园艺志愿者此刻共同告诉你，他们能够修好这扇门。你向负责人转述他们的能力。",
    "以They开头，用say报告，消息用can和repair the gate（修门）。 主句用一般现在时。",
    "They say that they can repair the gate.",
    [
      [
        "They says that they can repair the gate.",
        "复数主句say。"
      ],
      [
        "They say that we can repair the gate.",
        "能力主体变成我们。"
      ],
      [
        "They say that they cannot repair the gate.",
        "能力反转。"
      ],
      [
        "They say that they repaired the gate.",
        "能力报告被改成已完成。"
      ]
    ],
    "他们共同说话用say；can表达能力，未声称已经修好。",
    [
      "They say they can repair the gate."
    ]
  ],
  [
    "雨还在下，你估计比赛将明天开始；主办方没有最终确认。你向邻居说自己的判断。",
    "用I、think，消息词汇the match、start、tomorrow、will。",
    "I think that the match will start tomorrow.",
    [
      [
        "I am sure that the match will start tomorrow.",
        "没有确认不能提高确定度。"
      ],
      [
        "I think that the match started tomorrow.",
        "过去与明天不配。"
      ],
      [
        "I think that the match will finish tomorrow.",
        "开始变成结束。"
      ],
      [
        "I think that will the match start tomorrow.",
        "从句不用疑问倒装。"
      ]
    ],
    "think连接未来判断，will start保留开始。",
    [
      "I think the match will start tomorrow.",
      "The match will start tomorrow, I think.",
      "Tomorrow, the match will start, I think.",
      "I think that tomorrow the match will start.",
      "I think tomorrow the match will start.",
      "I think that tomorrow, the match will start.",
      "I think tomorrow, the match will start."
    ]
  ],
  [
    "你拿到了店主已确认的时间表：商店明天营业。你向客人肯定说明此事。",
    "用I、be sure，消息词汇the shop、be open、tomorrow、will。",
    "I am sure that the shop will be open tomorrow.",
    [
      [
        "I sure that the shop will be open tomorrow.",
        "缺am。"
      ],
      [
        "I am sure that the shop will be closed tomorrow.",
        "营业改为关门。"
      ],
      [
        "I think that the shop will be open tomorrow.",
        "已有确认不需改猜测。"
      ],
      [
        "I am sure that the shop was open tomorrow.",
        "未来时间不能写过去。"
      ]
    ],
    "主句确定，未来状态用will be open。",
    [
      "I am sure the shop will be open tomorrow.",
      "I'm sure that the shop will be open tomorrow.",
      "I'm sure the shop will be open tomorrow.",
      "I am sure that tomorrow the shop will be open.",
      "I am sure tomorrow the shop will be open.",
      "I'm sure that tomorrow the shop will be open.",
      "I'm sure tomorrow the shop will be open.",
      "I am sure that tomorrow, the shop will be open.",
      "I am sure tomorrow, the shop will be open.",
      "I'm sure that tomorrow, the shop will be open.",
      "I'm sure tomorrow, the shop will be open."
    ]
  ],
  [
    "男场务刚对你报告他目前拿着钥匙。你立刻告诉导演他的报告；这不是你的钥匙。",
    "用He和say报告；消息用have a key，不用got。 主句用一般现在时。",
    "He says that he has a key.",
    [
      [
        "He say that he has a key.",
        "单数主句says。"
      ],
      [
        "He says that he have a key.",
        "he后has。"
      ],
      [
        "He says that I have a key.",
        "持有者改变。"
      ],
      [
        "He says that he had a key.",
        "目前持有不能无据改过去。"
      ]
    ],
    "两处he都指场务，have变has。",
    [
      "He says he has a key."
    ]
  ],
  [
    "你看见女同事在看地图，猜测她想去公园，但尚未问她。你向另一人表达判断。",
    "用I、think，消息用she和want to go to the park。",
    "I think that she wants to go to the park.",
    [
      [
        "I am sure that she wants to go to the park.",
        "尚未核实的判断变确定。"
      ],
      [
        "I think that she want to go to the park.",
        "she后wants。"
      ],
      [
        "I think that she wants to leave the park.",
        "方向反了。"
      ],
      [
        "I think that I want to go to the park.",
        "愿望主体改为说话者。"
      ]
    ],
    "think表达推测，wants的主体仍是她。",
    [
      "I think she wants to go to the park.",
      "She wants to go to the park, I think."
    ]
  ],
  [
    "对方刚清楚地重复了集合地点，你知道他现在明白计划。你直接对他说自己确定他理解。",
    "用I、be sure、you和understand the plan连接一句。",
    "I am sure that you understand the plan.",
    [
      [
        "I sure that you understand the plan.",
        "缺am。"
      ],
      [
        "I think that you understand the plan.",
        "确定变猜想。"
      ],
      [
        "I am sure that you do not understand the plan.",
        "事实反转。"
      ],
      [
        "I am sure that I understand the plan.",
        "理解者变为说话者。"
      ]
    ],
    "直接对已经理解的对方说you，主句I am sure。",
    [
      "I am sure you understand the plan.",
      "I'm sure that you understand the plan.",
      "I'm sure you understand the plan."
    ]
  ],
  [
    "女演员现在告诉你，她不能留下来。你向制片人转述她的限制，不替她改成愿意。",
    "用She和say报告；消息词汇can、stay，保留否定。 主句用一般现在时。",
    "She says that she cannot stay.",
    [
      [
        "She says that she can stay.",
        "限制反转。"
      ],
      [
        "She say that she cannot stay.",
        "单数主句says。"
      ],
      [
        "She says that I cannot stay.",
        "受限制的人改变。"
      ],
      [
        "She says that she could not stay.",
        "当前can不能无据换过去could。"
      ]
    ],
    "cannot是她当前不能留下的限制；that可省略。",
    [
      "She says she cannot stay.",
      "She says that she can't stay.",
      "She says she can't stay."
    ]
  ],
  [
    "你听到大厅里有欢呼声，猜想他们正在等待获奖者；你没有看见他们。你向同伴说这个判断。",
    "用I、think，消息用they、wait for the winner（获奖者），表述正在进行。",
    "I think that they are waiting for the winner.",
    [
      [
        "I am sure that they are waiting for the winner.",
        "没看到未确认，不应改确定。"
      ],
      [
        "I think that they is waiting for the winner.",
        "they配are。"
      ],
      [
        "I think that they waited for the winner.",
        "正在进行变过去。"
      ],
      [
        "I think that the winner is waiting for them.",
        "等待方向反了。"
      ]
    ],
    "进行中的判断用are waiting，等待者仍是they。",
    [
      "I think they are waiting for the winner.",
      "I think that they're waiting for the winner.",
      "I think they're waiting for the winner.",
      "They are waiting for the winner, I think.",
      "They're waiting for the winner, I think."
    ]
  ],
  [
    "你查看收据确认这两张车票都有效。你向旅伴表达确定事实。",
    "用I、be sure，消息用these tickets、valid（有效）。",
    "I am sure that these tickets are valid.",
    [
      [
        "I sure that these tickets are valid.",
        "缺am。"
      ],
      [
        "I am sure that these tickets is valid.",
        "复数用are。"
      ],
      [
        "I think that these tickets are valid.",
        "确认被改为推测。"
      ],
      [
        "I am sure that these tickets are not valid.",
        "有效事实反转。"
      ]
    ],
    "复数tickets用are；I am sure说明已经确认。",
    [
      "I am sure these tickets are valid.",
      "I'm sure that these tickets are valid.",
      "I'm sure these tickets are valid."
    ]
  ],
  [
    "两位讲解员此刻告诉你，他们会在这里等。你立即向活动负责人转述，位置仍是同一处。",
    "以They开头，用say报告；消息词汇will、wait here。 主句用一般现在时。",
    "They say that they will wait here.",
    [
      [
        "They says that they will wait here.",
        "复数say。"
      ],
      [
        "They say that we will wait here.",
        "等待者改变。"
      ],
      [
        "They say that they waited here.",
        "未来变过去。"
      ],
      [
        "They say that they will wait there.",
        "同一处here变远指there，不合事实。"
      ]
    ],
    "共同发言用say，未来计划仍用will；现场地点不变。",
    [
      "They say they will wait here.",
      "They say that they'll wait here.",
      "They say they'll wait here."
    ]
  ]
];
const authored=author(data,rows);
for(let i=0;i<rows.length;i++) authored.questions[i].accepted=[...new Set([...authored.questions[i].accepted,...rows[i][5]])];
export const {lesson,questions,byId,questionsFor,matches}=bindContent(data,authored.questions);
