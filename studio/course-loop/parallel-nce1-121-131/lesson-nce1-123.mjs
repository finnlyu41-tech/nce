// Original finite authored tasks; use the existing author and assessment model.
import {author,metadata,variants} from '../parallel-nce1-049-059/authoring.mjs';
import {bindContent} from '../parallel-nce1-025-035/content-contract.mjs';
const data=metadata(123,"7d6eda686ef36c254947dca74b6661496ecfeeb7350ea9a3f9ab2b9c485e8979","宾语关系词省略与介词保留","在新人物、物件和介词搭配中省略或保留宾语关系词，保留主语、时态与动作方向。",["第121–122课限定关系从句的主宾区别；一般过去时和常见介词搭配。"],[{"target": "omit-person-object", "title": "人的宾语关系词可以省略", "explanation": "在the person I called一类从句中，I是主语，person是called的宾语，因此who/whom/that可省略。不能因为看到人名词就删除作主语的who。配套页也展示who/that + be + -ing整体约化为名词后-ing；那不是单删who而留下be。本组不独立考查约化。限定从句也可修饰其他主句的宾语，或用于辨认短答；主句问句/否定不改变从句主宾关系。", "example": "She is the dancer we helped.", "meaning": "她是我们帮助过的那位舞者。", "check": "从句已有明确主语时再检查先行词是不是宾语；不重复her/him。"}, {"target": "omit-thing-object", "title": "物件宾语关系词可省略", "explanation": "在the bag I packed中，I执行动作，bag是宾语。which/that可保留或省略；无论哪种写法，都保留从句的时态和陈述语序。物件作主语时不能按此法只删which。", "example": "This is the parcel I sent.", "meaning": "这是我寄出的包裹。", "check": "找到从句主语和动作宾语；省略关系词不等于省略主语或过去式。"}, {"target": "stranded-preposition", "title": "省略宾语关系词时保留介词", "explanation": "原文ship we travelled on与man I told you about保留on/about；先行词也可以是介词的宾语。可写关系词加陈述语序，也可省略宾语关系词，把介词留在从句末尾。本批按题干限定不练介词前置。", "example": "That is the bench we sat on.", "meaning": "那就是我们坐过的长凳。", "check": "保留所需on/to/about等介词；不要重复it/him，不把从句倒装。"}],[[35.04, 39.49, "原声：people I met省略宾语关系词"], [19.99, 26.64, "原声：photograph I took省略宾语关系词"], [39.49, 42.39, "原声：ship we travelled on保留on"]],"用真实或明确虚构的活动写三句：辨认你见过的一个人、使用过的一个物件，以及曾坐过或谈论过的东西。至少一次省略宾语关系词，一次保留必要介词。请伙伴核对不能省略的主语。");
data.contentStatus='authored-pending-independent-blind-review';
data.source.pairedExercise={"entryId": "NCE1-123", "lessons": [123, 124], "page": 255, "path": "/lesson-pages/2d2b5578e6ece6ba5493f516c3c779d4606d5944bc1cdacf72be0155dd234deb.jpg", "sha256": "2d2b5578e6ece6ba5493f516c3c779d4606d5944bc1cdacf72be0155dd234deb", "pages": [254, 255, 256], "printedPages": [250, 251, 252], "note": "page/pages使用现有PDF目录序号；printedPages为实际扫描页脚，目录序号较书上印页码多4。现有素材原样绑定，原创任务不是原句换名。"};
data.source.comicPages=[{"page": 253, "src": "/lesson-pages/0e12fc4792c8edf1c67e7ad378dca00c143315ba913bb6cb84cdc9144e788a65.jpg", "sha256": "0e12fc4792c8edf1c67e7ad378dca00c143315ba913bb6cb84cdc9144e788a65"}, {"page": 254, "src": "/lesson-pages/47fd6d52a03cc2e9933608f5d41fe1f6b7b9b32903c931f91ba39e6966c96bd7.jpg", "sha256": "47fd6d52a03cc2e9933608f5d41fe1f6b7b9b32903c931f91ba39e6966c96bd7"}];
data.limits={"finiteMatching": "Only constrained output and listed variants; mismatch does not establish that free English is wrong.", "ownExpression": "awaiting-human-review", "listening": "unverified", "pronunciation": "unverified", "natural24HourRetention": "unverified", "natural7DayRetention": "unverified", "learningGains": "unverified", "sourceVideo": "unchanged; not reviewed by this text author", "clipEnds": "Next LRC row is a bounded link, not a heard acoustic boundary."};
data.scope+=' 限定关系从句可按题干保留或省略宾语关系词；需要保留从句主语、指定时态和介词。题干指定开头、句末及时间位置，只匹配这些位置。';
const rows=[
  [
    "社区合唱团来访，墙上的照片指着我昨天打电话给的那位歌手。",
    "以That is the singer开头，用限定关系从句保留题中关系；从句主语用I，动作词根和内容为call（打电话给），用一般过去时。yesterday只放在从句末尾。宾语关系词可省略或保留；不重复原来的宾语代词。",
    "That is the singer I called yesterday.",
    [
      [
        "That is the singer who I called yesterday him.",
        "关系词或省略位置已经代表宾语，不能再补同指代词。"
      ],
      [
        "That is the singer who called I yesterday.",
        "关系从句用陈述语序，不倒装。"
      ],
      [
        "That is the singer which I called yesterday.",
        "人用who/whom/that或省略，不用which。"
      ],
      [
        "That is the singer who I call yesterday.",
        "从句过去动作需过去式，不能直接用词根。"
      ]
    ],
    "先行词是从句宾语，可保留合适关系词或省略；主语、过去时和介词不能一起丢失。",
    [
      "That is the singer that I called yesterday.",
      "That is the singer I called yesterday.",
      "That is the singer whom I called yesterday.",
      "That is the singer who I called yesterday."
    ]
  ],
  [
    "邮政柜台里有几个包裹；这个就是我上周寄出的包裹。",
    "以This is the parcel开头，用限定关系从句保留题中关系；从句主语用I，动作词根和内容为send（寄出），用一般过去时。last week只放在从句末尾。宾语关系词可省略或保留；不重复原来的宾语代词。",
    "This is the parcel I sent last week.",
    [
      [
        "This is the parcel which I sent last week it.",
        "关系词或省略位置已经代表宾语，不能再补同指代词。"
      ],
      [
        "This is the parcel which sent I last week.",
        "关系从句用陈述语序，不倒装。"
      ],
      [
        "This is the parcel whom I sent last week.",
        "人/物关系词不符或whom错误用于物件。"
      ],
      [
        "This is the parcel which I send last week.",
        "从句过去动作需过去式，不能直接用词根。"
      ]
    ],
    "先行词是从句宾语，可保留合适关系词或省略；主语、过去时和介词不能一起丢失。",
    [
      "This is the parcel that I sent last week.",
      "This is the parcel I sent last week.",
      "This is the parcel which I sent last week."
    ]
  ],
  [
    "公园撤去旧座位，你指着我们昨天坐过的长凳。",
    "以That is the bench开头，用限定关系从句保留题中关系；从句主语用we，动作词根和内容为sit（坐），用一般过去时。yesterday只放在从句末尾。把on放在动作之后、时间词之前，不前置介词。宾语关系词可省略或保留；不重复原来的宾语代词。",
    "That is the bench we sat on yesterday.",
    [
      [
        "That is the bench which we sat on yesterday it.",
        "关系词或省略位置已经代表宾语，不能再补同指代词。"
      ],
      [
        "That is the bench which sat we on yesterday.",
        "关系从句用陈述语序，不倒装。"
      ],
      [
        "That is the bench whom we sat on yesterday.",
        "人/物关系词不符或whom错误用于物件。"
      ],
      [
        "That is the bench which we sit on yesterday.",
        "从句过去动作需过去式，不能直接用词根。"
      ]
    ],
    "先行词是从句宾语，可保留合适关系词或省略；主语、过去时和介词不能一起丢失。",
    [
      "That is the bench that we sat on yesterday.",
      "That is the bench we sat on yesterday.",
      "That is the bench which we sat on yesterday."
    ]
  ],
  [
    "义卖活动中，我辨认出昨天我们感谢过的那位老师；她就在眼前。",
    "以She is the teacher开头，用限定关系从句保留题中关系；从句主语用we，动作词根和内容为thank（感谢），用一般过去时。yesterday只放在从句末尾。宾语关系词可省略或保留；不重复原来的宾语代词。",
    "She is the teacher we thanked yesterday.",
    [
      [
        "She is the teacher who we thanked yesterday him.",
        "关系词或省略位置已经代表宾语，不能再补同指代词。"
      ],
      [
        "She is the teacher who thanked we yesterday.",
        "关系从句用陈述语序，不倒装。"
      ],
      [
        "She is the teacher which we thanked yesterday.",
        "人用who/whom/that或省略，不用which。"
      ],
      [
        "She is the teacher who we thank yesterday.",
        "从句过去动作需过去式，不能直接用词根。"
      ]
    ],
    "先行词是从句宾语，可保留合适关系词或省略；主语、过去时和介词不能一起丢失。",
    [
      "She is the teacher that we thanked yesterday.",
      "She is the teacher we thanked yesterday.",
      "She is the teacher whom we thanked yesterday.",
      "She is the teacher who we thanked yesterday."
    ]
  ],
  [
    "工具柜前，你向同伴说明这些是我昨天借走的工具。",
    "以These are the tools开头，用限定关系从句保留题中关系；从句主语用I，动作词根和内容为borrow（借），用一般过去时。yesterday只放在从句末尾。宾语关系词可省略或保留；不重复原来的宾语代词。",
    "These are the tools I borrowed yesterday.",
    [
      [
        "These are the tools which I borrowed yesterday it.",
        "关系词或省略位置已经代表宾语，不能再补同指代词。"
      ],
      [
        "These are the tools which borrowed I yesterday.",
        "关系从句用陈述语序，不倒装。"
      ],
      [
        "These are the tools whom I borrowed yesterday.",
        "人/物关系词不符或whom错误用于物件。"
      ],
      [
        "These are the tools which I borrow yesterday.",
        "从句过去动作需过去式，不能直接用词根。"
      ]
    ],
    "先行词是从句宾语，可保留合适关系词或省略；主语、过去时和介词不能一起丢失。",
    [
      "These are the tools that I borrowed yesterday.",
      "These are the tools I borrowed yesterday.",
      "These are the tools which I borrowed yesterday."
    ]
  ],
  [
    "电台主持人介绍那位昨天我向你提起的舞者。",
    "以That is the dancer开头，用限定关系从句保留题中关系；从句主语用I，动作词根和内容为tell you（告诉你），用一般过去时。yesterday只放在从句末尾。把about放在动作之后、时间词之前，不前置介词。宾语关系词可省略或保留；不重复原来的宾语代词。",
    "That is the dancer I told you about yesterday.",
    [
      [
        "That is the dancer who I told you about yesterday him.",
        "关系词或省略位置已经代表宾语，不能再补同指代词。"
      ],
      [
        "That is the dancer who told you I about yesterday.",
        "关系从句用陈述语序，不倒装。"
      ],
      [
        "That is the dancer which I told you about yesterday.",
        "人用who/whom/that或省略，不用which。"
      ],
      [
        "That is the dancer who I tell about yesterday.",
        "从句过去动作需过去式，不能直接用词根。"
      ]
    ],
    "先行词是从句宾语，可保留合适关系词或省略；主语、过去时和介词不能一起丢失。",
    [
      "That is the dancer that I told you about yesterday.",
      "That is the dancer I told you about yesterday.",
      "That is the dancer whom I told you about yesterday.",
      "That is the dancer who I told you about yesterday."
    ]
  ],
  [
    "社区辩论结束，我们感谢了那些邻居。为区别来访者，说明感谢的是上周我们亲自邀请的邻居们。",
    "以We thanked the neighbours开头，补一个限定关系从句；从句主语we，动作词根invite，一般过去时，last week放句末。宾语关系词可省略或保留，不重复them。",
    "We thanked the neighbours we invited last week.",
    [
      [
        "We thanked the neighbours who invited us last week.",
        "邀请的施受方向变成邻居邀请我们。"
      ],
      [
        "We thanked the neighbours we invited them last week.",
        "them重复从句宾语。"
      ],
      [
        "We thanked the neighbours which we invited last week.",
        "人不用which。"
      ],
      [
        "We thanked the neighbours we invite last week.",
        "上周动作需过去式。"
      ]
    ],
    "主句是感谢行为；从句限定其宾语neighbours，we仍是邀请动作的主语。",
    [
      "We thanked the neighbours who we invited last week.",
      "We thanked the neighbours whom we invited last week.",
      "We thanked the neighbours that we invited last week."
    ]
  ],
  [
    "戏院失物柜有几只手提包，管理员问她找的是哪一只。她指认昨晚丢失的那一只，不新增物件位置。",
    "只写以The bag开头的限定名词短语；从句主语she，动作词根lose，一般过去时，last night放句末。宾语关系词可省略或保留，不重复it。",
    "The bag she lost last night.",
    [
      [
        "The bag she lost it last night.",
        "it重复宾语。"
      ],
      [
        "The bag whom she lost last night.",
        "物件不用whom。"
      ],
      [
        "The bag lost she last night.",
        "从句陈述语序she lost。"
      ],
      [
        "The bag she lose last night.",
        "昨晚动作需lost。"
      ]
    ],
    "bag是lost的宾语；短答辨认物件，无需再写This is。",
    [
      "The bag which she lost last night.",
      "The bag that she lost last night."
    ]
  ],
  [
    "体育中心来了几位教练。你昨天与一位教练交谈过，现在要向工作人员核实指着的这一位是否就是他。",
    "写以Is that the coach开头的身份问句；从句主语I，动作词根speak，一般过去时。把to放在动作后、yesterday之前，yesterday放句末；宾语关系词可省略或保留。",
    "Is that the coach I spoke to yesterday?",
    [
      [
        "Is that the coach I spoke yesterday?",
        "遗漏交谈对象所需to。"
      ],
      [
        "Is that the coach I spoke to him yesterday?",
        "him重复介词宾语。"
      ],
      [
        "That is the coach I spoke to yesterday.",
        "未核实的身份改成断言。"
      ],
      [
        "Is that the coach spoke to I yesterday?",
        "从句需要I作主语和陈述语序。"
      ]
    ],
    "主句询问身份，从句保留I作主语与spoke to搭配，介词不前置。",
    [
      "Is that the coach who I spoke to yesterday?",
      "Is that the coach whom I spoke to yesterday?",
      "Is that the coach that I spoke to yesterday?"
    ]
  ],
  [
    "换到植物园名单，照片上这位是我上周帮助的园丁。",
    "以This is the gardener开头，用限定关系从句保留题中关系；从句主语用I，动作词根和内容为help（帮助），用一般过去时。last week只放在从句末尾。宾语关系词可省略或保留；不重复原来的宾语代词。",
    "This is the gardener I helped last week.",
    [
      [
        "This is the gardener who I helped last week him.",
        "关系词或省略位置已经代表宾语，不能再补同指代词。"
      ],
      [
        "This is the gardener who helped I last week.",
        "关系从句用陈述语序，不倒装。"
      ],
      [
        "This is the gardener which I helped last week.",
        "人用who/whom/that或省略，不用which。"
      ],
      [
        "This is the gardener who I help last week.",
        "从句过去动作需过去式，不能直接用词根。"
      ]
    ],
    "先行词是从句宾语，可保留合适关系词或省略；主语、过去时和介词不能一起丢失。",
    [
      "This is the gardener that I helped last week.",
      "This is the gardener I helped last week.",
      "This is the gardener whom I helped last week.",
      "This is the gardener who I helped last week."
    ]
  ],
  [
    "换到收藏品展览，那些就是我们昨天发现的硬币。",
    "以Those are the coins开头，用限定关系从句保留题中关系；从句主语用we，动作词根和内容为find（发现），用一般过去时。yesterday只放在从句末尾。宾语关系词可省略或保留；不重复原来的宾语代词。",
    "Those are the coins we found yesterday.",
    [
      [
        "Those are the coins which we found yesterday it.",
        "关系词或省略位置已经代表宾语，不能再补同指代词。"
      ],
      [
        "Those are the coins which found we yesterday.",
        "关系从句用陈述语序，不倒装。"
      ],
      [
        "Those are the coins whom we found yesterday.",
        "人/物关系词不符或whom错误用于物件。"
      ],
      [
        "Those are the coins which we find yesterday.",
        "从句过去动作需过去式，不能直接用词根。"
      ]
    ],
    "先行词是从句宾语，可保留合适关系词或省略；主语、过去时和介词不能一起丢失。",
    [
      "Those are the coins that we found yesterday.",
      "Those are the coins we found yesterday.",
      "Those are the coins which we found yesterday."
    ]
  ],
  [
    "换到学校搬迁说明，那栋就是我们去年居住的房子。",
    "以That is the house开头，用限定关系从句保留题中关系；从句主语用we，动作词根和内容为live（居住），用一般过去时。last year只放在从句末尾。把in放在动作之后、时间词之前，不前置介词。宾语关系词可省略或保留；不重复原来的宾语代词。",
    "That is the house we lived in last year.",
    [
      [
        "That is the house which we lived in last year it.",
        "关系词或省略位置已经代表宾语，不能再补同指代词。"
      ],
      [
        "That is the house which lived we in last year.",
        "关系从句用陈述语序，不倒装。"
      ],
      [
        "That is the house whom we lived in last year.",
        "人/物关系词不符或whom错误用于物件。"
      ],
      [
        "That is the house which we live in last year.",
        "从句过去动作需过去式，不能直接用词根。"
      ]
    ],
    "先行词是从句宾语，可保留合适关系词或省略；主语、过去时和介词不能一起丢失。",
    [
      "That is the house that we lived in last year.",
      "That is the house we lived in last year.",
      "That is the house which we lived in last year."
    ]
  ],
  [
    "新的读书会上，她昨天见过一位作家，问你是否记得此人。你确实记得，说明所指的是她见过的那位。",
    "以I remember the writer开头；从句主语she，动作词根meet，一般过去时，yesterday放句末。宾语关系词可省略或保留，不补姓名。",
    "I remember the writer she met yesterday.",
    [
      [
        "I remember the writer who met her yesterday.",
        "把限定的施受方向换了。"
      ],
      [
        "I remember the writer she met him yesterday.",
        "him重复宾语。"
      ],
      [
        "I remember the writer which she met yesterday.",
        "人不用which。"
      ],
      [
        "I remember the writer she meet yesterday.",
        "昨天动作需met。"
      ]
    ],
    "remember的宾语被关系从句限定；she是met的主语而非可删除关系词。",
    [
      "I remember the writer who she met yesterday.",
      "I remember the writer whom she met yesterday.",
      "I remember the writer that she met yesterday."
    ]
  ],
  [
    "新的手工作坊里放着几个篮子，你不知道眼前这个是否是他们上周制作的，要核实作品来源。",
    "写以Is this the basket开头的身份问句；从句主语they，动作词根make，一般过去时，last week放句末。宾语关系词可省略或保留，不重复it。",
    "Is this the basket they made last week?",
    [
      [
        "This is the basket they made last week.",
        "未知信息被断言。"
      ],
      [
        "Is this the basket they made it last week?",
        "it重复宾语。"
      ],
      [
        "Is this the basket whom they made last week?",
        "物件不用whom。"
      ],
      [
        "Is this the basket they make last week?",
        "上周动作需made。"
      ]
    ],
    "主句询问作品来源；basket是从句made的宾语，可以省略关系词。",
    [
      "Is this the basket which they made last week?",
      "Is this the basket that they made last week?"
    ]
  ],
  [
    "新的剧团有几个计划，团员问哪个需今天签字，通知明确说是昨天我们谈论过的那个。",
    "只写以The plan开头的限定名词短语；从句主语we，动作词根talk，用一般过去时，about放动作后、yesterday之前，yesterday放句末。宾语关系词可省略或保留。",
    "The plan we talked about yesterday.",
    [
      [
        "The plan we talked yesterday.",
        "遗漏talk about的介词。"
      ],
      [
        "The plan we talked about it yesterday.",
        "it重复介词宾语。"
      ],
      [
        "The plan whom we talked about yesterday.",
        "物件不用whom。"
      ],
      [
        "The plan talked we about yesterday.",
        "从句陈述语序we talked。"
      ]
    ],
    "plan是about的宾语，省略关系词仍保留about；短答不重复主句。",
    [
      "The plan which we talked about yesterday.",
      "The plan that we talked about yesterday."
    ]
  ],
  [
    "新的志愿者培训中有新旧两批助手，负责人问哪些可直接参加下一班工作，记录说是昨天由我培训的那一批。",
    "只写以The assistants开头的限定名词短语；从句主语I，动作词根train，一般过去时，yesterday放句末。宾语关系词可省略或保留，不重复them。",
    "The assistants I trained yesterday.",
    [
      [
        "The assistants who trained me yesterday.",
        "培训者和受训者方向颠倒。"
      ],
      [
        "The assistants I trained them yesterday.",
        "them重复宾语。"
      ],
      [
        "The assistants which I trained yesterday.",
        "人不用which。"
      ],
      [
        "The assistants I train yesterday.",
        "昨天动作需trained。"
      ]
    ],
    "assistants是trained的宾语；辨认短答保留I执行培训的方向。",
    [
      "The assistants who I trained yesterday.",
      "The assistants whom I trained yesterday.",
      "The assistants that I trained yesterday."
    ]
  ],
  [
    "新的影片讨论中，同伴误指一张封面，说那就是我们上周看过的纪录片；实际封面不是那一部。",
    "以That is not the documentary开头；关系从句主语we，动作词根watch，一般过去时，last week放句末。宾语关系词可省略或保留。",
    "That is not the documentary we watched last week.",
    [
      [
        "That is the documentary we watched last week.",
        "否定身份反转。"
      ],
      [
        "That is not the documentary we watched it last week.",
        "it重复宾语。"
      ],
      [
        "That is not the documentary whom we watched last week.",
        "物件不用whom。"
      ],
      [
        "That is not the documentary watched we last week.",
        "从句陈述语序we watched。"
      ]
    ],
    "否定是主句的身份判断；关系从句仍限定曾观看的documentary。",
    [
      "That is not the documentary which we watched last week.",
      "That is not the documentary that we watched last week."
    ]
  ],
  [
    "新的招聘项目中有两家公司。我们已经选择了其中一家合作，说明选的是她去年为之工作的那一家。",
    "以We chose the company开头；关系从句主语she，动作词根work，一般过去时，for放动作后、last year之前，last year放句末。宾语关系词可省略或保留。",
    "We chose the company she worked for last year.",
    [
      [
        "We chose the company she worked last year.",
        "缺for，未表达为该公司工作。"
      ],
      [
        "We chose the company she worked for it last year.",
        "it重复介词宾语。"
      ],
      [
        "We chose the company whom she worked for last year.",
        "公司在本题作为物件名称，不用whom。"
      ],
      [
        "We chose the company worked she for last year.",
        "从句需she worked陈述语序。"
      ]
    ],
    "主句表达已选的公司，关系从句限定company作为for的宾语；保留for和过去时间。",
    [
      "We chose the company which she worked for last year.",
      "We chose the company that she worked for last year."
    ]
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
