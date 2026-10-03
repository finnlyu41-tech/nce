// Original finite authored tasks; use the existing author and assessment model.
import {author,metadata,variants} from '../parallel-nce1-049-059/authoring.mjs';
import {bindContent} from '../parallel-nce1-025-035/content-contract.mjs';
const data=metadata(121,"9a3874ac0e4f6911d0197bd546cfab2b17a0fdf9f7be5c291564fbe207100dc2","辨认关系从句的主语与宾语","用限定关系从句辨认人和物，区别作主语与作宾语的关系词并保留施受关系。",["已学一般过去时、现在进行时、单复数和陈述语序；本课题内提供词义和指定词根。"],[{"target": "human-subject", "title": "关系词在从句中作人的主语", "explanation": "限定一个人或一群人时可用who或that；若关系词本身执行从句动作，不能只删who而保留后面的谓语。过去动作仍用过去式。原文用限定名词短语回答谁/哪些，亦有Is this the man that you served?；本组迁移到辨认短答、主句身份或属性问句和否定，关系从句保持陈述语序。", "example": "The cook who opened the kitchen is our neighbour.", "meaning": "打开厨房的厨师是我们的邻居。", "check": "先找从句动作是谁做的；who/that作主语时要保留，不加重复he/she。"}, {"target": "thing-subject", "title": "物件作从句主语用which或that", "explanation": "物件作从句主语时用which/that，单复数决定is/are。描述正在发生的动作时保留be加-ing。这里不训练非限定从句，也不将who教成物件的通用关系词。", "example": "The bell which is ringing is new.", "meaning": "正在响的铃是新的。", "check": "核对物件单复数与正在发生的动作；which/that后不再加it/they。"}, {"target": "object-relative", "title": "关系词作宾语时保留动作施受方向", "explanation": "先行词是从句动作的宾语时，人可用who/whom/that，物可用which/that；宾语关系词也可省略。保留从句主语与陈述语序，不再重复him/her/it。省略在123–124组继续训练。", "example": "This is the painter whom we invited.", "meaning": "这就是我们邀请的画家。", "check": "先找谁做动作、动作指向谁；保留从句主语，不重复宾语。"}],[[33.51, 37.82, "原声：who作人的从句主语"], [41.15, 44.96, "原声：which作物件从句主语"], [57.5, 62.54, "原声：who作从句宾语；whom/that见配套页"]],"选真实或明确虚构的人和物，写三句：用动作辨认一个人；用正在发生的动作辨认一个物件；说明你曾帮助谁或用过什么。请伙伴核对关系词的主宾作用。");
data.contentStatus='authored-pending-independent-blind-review';
data.source.pairedExercise={"entryId": "NCE1-121", "lessons": [121, 122], "page": 251, "path": "/lesson-pages/7a373ed9a12c43174c0cb53c0e75f72739c8811aeca483c5baa2eb3f8c996818.jpg", "sha256": "7a373ed9a12c43174c0cb53c0e75f72739c8811aeca483c5baa2eb3f8c996818", "pages": [250, 251, 252], "printedPages": [246, 247, 248], "note": "page/pages使用现有PDF目录序号；printedPages为实际扫描页脚，目录序号较书上印页码多4。现有素材原样绑定，原创任务不是原句换名。"};
data.source.comicPages=[{"page": 249, "src": "/lesson-pages/5a0dbac27b13045625acfffb51d445cef758e7b9fe6b1463acead1917458f1cc.jpg", "sha256": "5a0dbac27b13045625acfffb51d445cef758e7b9fe6b1463acead1917458f1cc"}, {"page": 250, "src": "/lesson-pages/e773ba824158f7e4dfd369d6eaf14f3c495daa0383cff468451ad3fec5de94c0.jpg", "sha256": "e773ba824158f7e4dfd369d6eaf14f3c495daa0383cff468451ad3fec5de94c0"}];
data.limits={"finiteMatching": "Only constrained output and listed variants; mismatch does not establish that free English is wrong.", "ownExpression": "awaiting-human-review", "listening": "unverified", "pronunciation": "unverified", "natural24HourRetention": "unverified", "natural7DayRetention": "unverified", "learningGains": "unverified", "sourceVideo": "unchanged; not reviewed by this text author", "clipEnds": "Next LRC row is a bounded link, not a heard acoustic boundary."};
data.scope+=' 限定关系从句可按题干保留或省略宾语关系词；需要保留从句主语、指定时态和介词。题干指定开头、句末及时间位置，只匹配这些位置。';
const rows=[
  [
    "活动签到台有多位志愿者。昨天搬运箱子的那一位是我们的向导。",
    "以The volunteer开头，用限定关系从句说明此人，再以is our guide结束。从句用一般过去时；动作词根和内容为carry the boxes（搬箱子）；yesterday只放在从句末尾。",
    "The volunteer who carried the boxes yesterday is our guide.",
    [
      [
        "The volunteer which carried the boxes yesterday is our guide.",
        "先行词是人，不用which。"
      ],
      [
        "The volunteer carried the boxes yesterday is our guide.",
        "此处关系词作从句主语，不能单独删掉。"
      ],
      [
        "The volunteer whom carried the boxes yesterday is our guide.",
        "whom不能作该从句的主语。"
      ],
      [
        "The volunteer who carried the boxes yesterday he is our guide.",
        "从句后多出的he重复主句主语。"
      ]
    ],
    "关系词作动作的主语；保留指定时间、动作与主句判断。",
    [
      "The volunteer that carried the boxes yesterday is our guide."
    ]
  ],
  [
    "维修间有两台机器。此刻正在打印标签的那台坏了。",
    "以The machine开头，用限定关系从句描述物件目前正在发生的动作，再以is broken结束。从句用现在进行时；词根和内容为print labels（打印标签）。",
    "The machine which is printing labels is broken.",
    [
      [
        "The machine whom is printing labels is broken.",
        "物件不能用whom。"
      ],
      [
        "The machine is printing labels is broken.",
        "保留be时不能单独删掉作主语的which。"
      ],
      [
        "The machine that it is printing labels is broken.",
        "that已经作主语，不再重复it。"
      ],
      [
        "The machine which are printing labels is broken.",
        "从句be与先行词单复数不符。"
      ]
    ],
    "物件作从句动作的主语，用which或that；现在进行时和单复数同时保留。",
    [
      "The machine that is printing labels is broken."
    ]
  ],
  [
    "展览入口有多位艺术家。我们上周邀请的那位女性画家现在在这里。",
    "以The painter开头，用限定关系从句保留题中关系；从句主语用we，动作词根和内容为invite（邀请），用一般过去时。last week只放在从句末尾。最后以is here结束。宾语关系词可省略或保留；不重复原来的宾语代词。",
    "The painter who we invited last week is here.",
    [
      [
        "The painter who we invited last week is here him.",
        "关系词或省略位置已经代表宾语，不能再补同指代词。"
      ],
      [
        "The painter who invited we last week is here.",
        "关系从句用陈述语序，不倒装。"
      ],
      [
        "The painter which we invited last week is here.",
        "人/物关系词不符或whom错误用于物件。"
      ],
      [
        "The painter who we invite last week is here.",
        "从句过去动作需过去式，不能直接用词根。"
      ]
    ],
    "先行词是从句宾语，可保留合适关系词或省略；主语、过去时和介词不能一起丢失。",
    [
      "The painter that we invited last week is here.",
      "The painter we invited last week is here.",
      "The painter whom we invited last week is here."
    ]
  ],
  [
    "消防演练中，上周打开这扇门的那名工人是我们的邻居。",
    "以The worker开头，用限定关系从句说明此人，再以is our neighbour结束。从句用一般过去时；动作词根和内容为open the door（开门）；last week只放在从句末尾。",
    "The worker who opened the door last week is our neighbour.",
    [
      [
        "The worker which opened the door last week is our neighbour.",
        "先行词是人，不用which。"
      ],
      [
        "The worker opened the door last week is our neighbour.",
        "此处关系词作从句主语，不能单独删掉。"
      ],
      [
        "The worker whom opened the door last week is our neighbour.",
        "whom不能作该从句的主语。"
      ],
      [
        "The worker who opened the door last week he is our neighbour.",
        "从句后多出的he重复主句主语。"
      ]
    ],
    "关系词作动作的主语；保留指定时间、动作与主句判断。",
    [
      "The worker that opened the door last week is our neighbour."
    ]
  ],
  [
    "平台上有几面旗。此刻在风中飘动的那些旗是红色的。",
    "以The flags开头，用限定关系从句描述物件目前正在发生的动作，再以are red结束。从句用现在进行时；词根和内容为move in the wind（在风中飘动）。",
    "The flags which are moving in the wind are red.",
    [
      [
        "The flags whom are moving in the wind are red.",
        "物件不能用whom。"
      ],
      [
        "The flags are moving in the wind are red.",
        "保留be时不能单独删掉作主语的which。"
      ],
      [
        "The flags that it are moving in the wind are red.",
        "that已经作主语，不再重复it。"
      ],
      [
        "The flags which is moving in the wind are red.",
        "从句be与先行词单复数不符。"
      ]
    ],
    "物件作从句动作的主语，用which或that；现在进行时和单复数同时保留。",
    [
      "The flags that are moving in the wind are red."
    ]
  ],
  [
    "修鞋柜台有两位女顾客。昨天下午我帮助的那一位很耐心。",
    "以The customer开头，用限定关系从句保留题中关系；从句主语用I，动作词根和内容为help（帮助），用一般过去时。yesterday只放在从句末尾。最后以is patient结束。宾语关系词可省略或保留；不重复原来的宾语代词。",
    "The customer who I helped yesterday is patient.",
    [
      [
        "The customer who I helped yesterday is patient him.",
        "关系词或省略位置已经代表宾语，不能再补同指代词。"
      ],
      [
        "The customer who helped I yesterday is patient.",
        "关系从句用陈述语序，不倒装。"
      ],
      [
        "The customer which I helped yesterday is patient.",
        "人/物关系词不符或whom错误用于物件。"
      ],
      [
        "The customer who I help yesterday is patient.",
        "从句过去动作需过去式，不能直接用词根。"
      ]
    ],
    "先行词是从句宾语，可保留合适关系词或省略；主语、过去时和介词不能一起丢失。",
    [
      "The customer that I helped yesterday is patient.",
      "The customer I helped yesterday is patient.",
      "The customer whom I helped yesterday is patient."
    ]
  ],
  [
    "仓库有人问昨晚是谁带来了药品。根据记录，是那位司机；只辨认人，不补充亲属关系。",
    "只写一个以The driver开头的限定名词短语，包含关系从句；动作词根bring the medicine（带来药品），用一般过去时，last night放在短语末尾。",
    "The driver who brought the medicine last night.",
    [
      [
        "The driver which brought the medicine last night.",
        "司机是人，不用which。"
      ],
      [
        "The driver brought the medicine last night.",
        "删掉who后变成完整陈述句，不是要求的限定名词短语。"
      ],
      [
        "The driver whom brought the medicine last night.",
        "whom不能作brought的主语。"
      ],
      [
        "The driver who bring the medicine last night.",
        "昨晚动作需brought。"
      ]
    ],
    "who/that作从句主语，回答辨认身份的限定名词短语不必另加主句。",
    [
      "The driver that brought the medicine last night."
    ]
  ],
  [
    "河边有新旧两座桥。你能看到一座正在晃动，但不知道它是否很旧；要向管理员核实这座桥的年代。",
    "写一个以Is the bridge开头的问句；限定关系从句用现在进行时描述正在晃动（shake），主句用old询问是否很旧。",
    "Is the bridge which is shaking old?",
    [
      [
        "Is the bridge which are shaking old?",
        "单数bridge的从句用is。"
      ],
      [
        "Is the bridge shaking old?",
        "只删which而保留谓语造成结构错误。"
      ],
      [
        "The bridge which is shaking is old.",
        "题目要询问未知信息，不能断言。"
      ],
      [
        "Is the bridge which is shaking new?",
        "询问内容从old换成new。"
      ]
    ],
    "主句用一般疑问语序，从句which/that is shaking仍用陈述语序。",
    [
      "Is the bridge that is shaking old?"
    ]
  ],
  [
    "图书展上工作人员指错了地图：昨天我们选中的那张其实不清楚；另一张才清楚。请纠正说法。",
    "以The map开头，用限定关系从句说明我们昨天选中的那张；从句主语we，动作词根choose，一般过去时，yesterday放从句末尾。主句用clear写一般现在否定。",
    "The map which we chose yesterday is not clear.",
    [
      [
        "The map which we chose yesterday is clear.",
        "否定事实反转。"
      ],
      [
        "The map whom we chose yesterday is not clear.",
        "物件不能用whom。"
      ],
      [
        "The map which chose we yesterday is not clear.",
        "从句需陈述语序we chose。"
      ],
      [
        "The map which we chose it yesterday is not clear.",
        "it重复从句宾语。"
      ]
    ],
    "map作从句宾语；which/that可省略，主句的否定不能丢失。",
    [
      "The map that we chose yesterday is not clear.",
      "The map we chose yesterday is not clear."
    ]
  ],
  [
    "换到电台资料室：昨天写那份报告的那位学生是我们的客人。",
    "以The student开头，用限定关系从句说明此人，再以is our guest结束。从句用一般过去时；动作词根和内容为write the report（写报告）；yesterday只放在从句末尾。",
    "The student who wrote the report yesterday is our guest.",
    [
      [
        "The student which wrote the report yesterday is our guest.",
        "先行词是人，不用which。"
      ],
      [
        "The student wrote the report yesterday is our guest.",
        "此处关系词作从句主语，不能单独删掉。"
      ],
      [
        "The student whom wrote the report yesterday is our guest.",
        "whom不能作该从句的主语。"
      ],
      [
        "The student who wrote the report yesterday he is our guest.",
        "从句后多出的he重复主句主语。"
      ]
    ],
    "关系词作动作的主语；保留指定时间、动作与主句判断。",
    [
      "The student that wrote the report yesterday is our guest."
    ]
  ],
  [
    "换到礼堂，很多灯还亮着；此刻正在闪烁的那盏灯很小。",
    "以The lamp开头，用限定关系从句描述物件目前正在发生的动作，再以is small结束。从句用现在进行时；词根和内容为flash（闪烁）。",
    "The lamp which is flashing is small.",
    [
      [
        "The lamp whom is flashing is small.",
        "物件不能用whom。"
      ],
      [
        "The lamp is flashing is small.",
        "保留be时不能单独删掉作主语的which。"
      ],
      [
        "The lamp that it is flashing is small.",
        "that已经作主语，不再重复it。"
      ],
      [
        "The lamp which are flashing is small.",
        "从句be与先行词单复数不符。"
      ]
    ],
    "物件作从句动作的主语，用which或that；现在进行时和单复数同时保留。",
    [
      "The lamp that is flashing is small."
    ]
  ],
  [
    "换到乐器室，几把小提琴中，去年她修理的那一把是我的。",
    "以The violin开头，用限定关系从句保留题中关系；从句主语用she，动作词根和内容为repair（修理），用一般过去时。last year只放在从句末尾。最后以is mine结束。宾语关系词可省略或保留；不重复原来的宾语代词。",
    "The violin which she repaired last year is mine.",
    [
      [
        "The violin which she repaired last year is mine it.",
        "关系词或省略位置已经代表宾语，不能再补同指代词。"
      ],
      [
        "The violin which repaired she last year is mine.",
        "关系从句用陈述语序，不倒装。"
      ],
      [
        "The violin whom she repaired last year is mine.",
        "人/物关系词不符或whom错误用于物件。"
      ],
      [
        "The violin which she repair last year is mine.",
        "从句过去动作需过去式，不能直接用词根。"
      ]
    ],
    "先行词是从句宾语，可保留合适关系词或省略；主语、过去时和介词不能一起丢失。",
    [
      "The violin that she repaired last year is mine.",
      "The violin she repaired last year is mine."
    ]
  ],
  [
    "新的运动会中你知道哪些女孩昨天赢得赛跑，但还不知道她们是否都很高，要向教练核实。",
    "写以Are the girls开头的问句；用限定关系从句说明昨天赢得赛跑的女孩，词根win the race，一般过去时，yesterday放从句末尾；主句询问tall。",
    "Are the girls who won the race yesterday tall?",
    [
      [
        "Are the girls whom won the race yesterday tall?",
        "whom不能作动作主语。"
      ],
      [
        "Are the girls won the race yesterday tall?",
        "作主语的who不能单删。"
      ],
      [
        "Is the girls who won the race yesterday tall?",
        "主句girls复数用are。"
      ],
      [
        "The girls who won the race yesterday are tall.",
        "问未知身高，不能作肯定断言。"
      ]
    ],
    "关系词作从句主语；主句询问身高，不能把从句也倒装。",
    [
      "Are the girls that won the race yesterday tall?"
    ]
  ],
  [
    "新的露营地有干湿毛毯。工作人员问哪几条需要先收起来，规则是收起此刻正在滴水的那些。",
    "只写以The blankets开头的限定名词短语，关系从句用现在进行时说明滴水；动词词根drip。不添加归属或其他判断。",
    "The blankets which are dripping.",
    [
      [
        "The blankets which is dripping.",
        "复数blankets配are。"
      ],
      [
        "The blankets are dripping.",
        "这是独立陈述句，未写要求的限定名词短语。"
      ],
      [
        "The blankets which they are dripping.",
        "关系词已作主语，不重复they。"
      ],
      [
        "The blankets which are dry.",
        "没有表达规则指定的滴水动作。"
      ]
    ],
    "which/that作物件从句主语，复数配are；短答用于挑出规则对应的物件。",
    [
      "The blankets that are dripping."
    ]
  ],
  [
    "新的合唱团面试后，同伴昨天听见一位歌手但不知道其姓名；你认识那位歌手。说明你认识的是同伴听过的那一位。",
    "以I know the singer开头；限定关系从句主语用you，动作词根hear，一般过去时，yesterday放句末。只表达认识此人，不补姓名。",
    "I know the singer who you heard yesterday.",
    [
      [
        "I know the singer who I heard yesterday.",
        "把同伴听见改成我听见。"
      ],
      [
        "I know the singer who heard you yesterday.",
        "动作施受方向颠倒。"
      ],
      [
        "I know the singer which you heard yesterday.",
        "人不用which。"
      ],
      [
        "I know the singer who you heard him yesterday.",
        "him重复宾语。"
      ]
    ],
    "singer作从句宾语；保留you执行听见的方向，主句表达I know。",
    [
      "I know the singer that you heard yesterday.",
      "I know the singer whom you heard yesterday.",
      "I know the singer you heard yesterday."
    ]
  ],
  [
    "新的食品集市里，同伴猜制作蛋糕的那位面包师是你的朋友；实际你与那人并不是朋友。",
    "以The baker开头，用限定关系从句说明昨天制作蛋糕的人；词根make the cakes，一般过去时，yesterday放从句末尾。主句用my friend写一般现在否定。",
    "The baker who made the cakes yesterday is not my friend.",
    [
      [
        "The baker who made the cakes yesterday is my friend.",
        "朋友关系的否定反转。"
      ],
      [
        "The baker whom made the cakes yesterday is not my friend.",
        "whom不能作made的主语。"
      ],
      [
        "The baker made the cakes yesterday is not my friend.",
        "此处不能单删作主语的who。"
      ],
      [
        "The baker who make the cakes yesterday is not my friend.",
        "昨天动作需made。"
      ]
    ],
    "关系词在从句作主语，主句是否定关系判断；两个作用都保留。",
    [
      "The baker that made the cakes yesterday is not my friend."
    ]
  ],
  [
    "新的水族馆有多个水箱。管理员问哪个需要维修，记录明确是此刻漏水的那一个；不说明它是否空。",
    "只写一个以The tank开头的限定名词短语；用现在进行时描述漏水，词根leak，不加主句判断。",
    "The tank which is leaking.",
    [
      [
        "The tank which are leaking.",
        "单数tank配is。"
      ],
      [
        "The tank is leaking.",
        "这是独立陈述句，不是限定名词短语短答。"
      ],
      [
        "The tank which it is leaking.",
        "it重复从句主语。"
      ],
      [
        "The tank which is empty.",
        "empty不是漏水动作，也没有资料证明水箱空。"
      ]
    ],
    "which/that作从句主语，短答只辨认需维修的物件，不虚构是否空。",
    [
      "The tank that is leaking."
    ]
  ],
  [
    "新的戏剧档案讨论中，你与同伴上周看过一部戏，但尚不知道同伴觉得它是否有趣。",
    "写以Is the play开头的问句；关系从句主语we，动作词根watch，一般过去时，last week放在从句末尾；主句询问interesting。",
    "Is the play which we watched last week interesting?",
    [
      [
        "The play which we watched last week is interesting.",
        "把未知评价作肯定断言。"
      ],
      [
        "Is the play whom we watched last week interesting?",
        "物件不用whom。"
      ],
      [
        "Is the play which watched we last week interesting?",
        "从句陈述语序we watched。"
      ],
      [
        "Is the play which we watched it last week interesting?",
        "it重复宾语。"
      ]
    ],
    "play作从句宾语，which/that可省略；主句是问句，从句不倒装。",
    [
      "Is the play that we watched last week interesting?",
      "Is the play we watched last week interesting?"
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
 for(const a of [...q.accepted])if(a.includes(' that is '))q.accepted.push(a.replace(' that is '," that's "));
 q.accepted=[...new Set(q.accepted)];
 if(q.prompt.includes('now放句末'))q.accepted=q.accepted.filter(a=>/ now[.?]$/.test(a));
}
export const {lesson,questions,byId,questionsFor,matches}=bindContent(data,authored.questions);
