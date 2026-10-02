// Original authored finite tasks; assessment and event history remain in ../model.mjs.
import {author,metadata} from '../parallel-nce1-049-059/authoring.mjs';
import {bindContent} from '../parallel-nce1-025-035/content-contract.mjs';
const data=metadata(97,"f9205b34f0122e25d849e2865af9e4f2934c7012f795f826853cbef3049fdeab","辨认物主、询问归属","在物件已明确时用名词性物主代词，询问未知主人，并用belong to保留归属与否定。",["已学my/your/her/our/their加名词、be单复数和do/does疑问否定；97课原文与98课归属句型。题内提供物件词义。"],[{"target": "possessive-pronoun", "title": "物件明确后用mine等代替重复名词", "explanation": "my/your/her/our/their后接名词；mine/yours/hers/ours/theirs可独立表示归属。说话者决定mine与yours的方向，物件决定is与are。", "example": "These tickets are ours.", "meaning": "这些票是我们的。", "check": "先核对谁说话、谁拥有，再选独立物主代词；其后不再加名词。"}, {"target": "whose-owner", "title": "未知主人用whose询问", "explanation": "不知道物件主人时问Whose is this?或Whose key is this?；复数用Whose are these?或Whose keys are these?。whose问归属，不等于who或where。", "example": "Whose umbrella is this?", "meaning": "这把伞是谁的？", "check": "询问主人而非位置；保留物件或指定代词，be与物件单复数一致。"}, {"target": "belong-to", "title": "belong to与归属方向", "explanation": "belong to后用me/you/her/us/them等宾格。单数现在句用belongs或does not belong，复数用belong或do not belong；询问时does/do后belong用原形。", "example": "This camera does not belong to her.", "meaning": "这台相机不属于她。", "check": "核对单复数、肯否与归属对象；to后不用hers/mine/ours。"}],[[40.41, 45.83, "原声：yours与not mine对照"], [40.41, 43.14, "原声询问归属；whose句型来自98课配套原页"], [80.09, 84.56, "原声：does not belong to me"]],"选三件实际或虚构物件，向同伴说明一件归属、问一件主人，再说明一件不属于谁。不要在不知道归属时编造事实。");
data.contentStatus='authored-pending-independent-blind-review';
data.source.pairedExercise={"entryId": "NCE1-97", "lessons": [97, 98], "page": 203, "path": "/lesson-pages/8c74be4b3d58e7b0f0bb0afa87c81bb026dd4ffefca50b3da7b382944ffad615.jpg", "sha256": "8c74be4b3d58e7b0f0bb0afa87c81bb026dd4ffefca50b3da7b382944ffad615", "note": "原页98课标题Whose is it?/Whose are they?；框中Does/Do ... belong to ...?与Is/Are ... mine/yours/hers/ours/theirs?对照。whose询问与独立物主代词来自配套练习，不虚称97原声有whose。"};
data.source.comicPages=[{"page": 201, "src": "/lesson-pages/f0c970151c08bf5375f65c0d88e1b0bff4d04da6ef8235b901f83d6f27056255.jpg", "sha256": "f0c970151c08bf5375f65c0d88e1b0bff4d04da6ef8235b901f83d6f27056255"}, {"page": 202, "src": "/lesson-pages/2cfa0472e170bdca1736635b69209f4624b056c8c046c8e5f3fb1cdcfcee51f2.jpg", "sha256": "2cfa0472e170bdca1736635b69209f4624b056c8c046c8e5f3fb1cdcfcee51f2"}];
data.limits={"finiteMatching": "Only the constrained outputs and listed variants are checked; a mismatch does not establish that free English is wrong.", "ownExpression": "awaiting-human-review", "listening": "unverified", "pronunciation": "unverified", "natural24HourRetention": "unverified", "natural7DayRetention": "unverified", "learningGains": "unverified", "sourceVideo": "unchanged; not reviewed by this text author"};
const rows=[
  [
    "你向图书馆管理员说明：这本地图册是你个人的，馆藏书不是它。管理员已指着它。",
    "用This atlas（地图册）开头，独立物主代词结尾，写一句说明归属。",
    "This atlas is mine.",
    [
      [
        "This atlas is my.",
        "my后需名词。"
      ],
      [
        "This atlas is yours.",
        "yours指听者，不是说话者。"
      ],
      [
        "This atlas are mine.",
        "单件用is。"
      ],
      [
        "This atlas is mine atlas.",
        "独立物主代词后不再加名词。"
      ]
    ],
    "说话者本人拥有地图册，所以用mine；atlas为单数。",
    []
  ],
  [
    "剧场衣帽间有一把未登记的伞。你向工作人员问它的主人，而非问放在哪里。",
    "用whose、umbrella（伞）、this，写一个归属问句。",
    "Whose umbrella is this?",
    [
      [
        "Who umbrella is this?",
        "who不能直接限定umbrella。"
      ],
      [
        "Where is this umbrella?",
        "问的是位置。"
      ],
      [
        "Whose umbrella are this?",
        "单数不配are。"
      ],
      [
        "Is this umbrella yours?",
        "限制成听者拥有，未开放询问未知主人。"
      ]
    ],
    "whose询问主人，umbrella与this都是单数。",
    [
      "Whose is this umbrella?"
    ]
  ],
  [
    "社区工具架上这把锤子是Jo的。你对同伴明确说明它不属于你。",
    "用This hammer（锤子）开头，使用belong to写否定归属。",
    "This hammer does not belong to me.",
    [
      [
        "This hammer belongs to me.",
        "否定事实被反转。"
      ],
      [
        "This hammer do not belong to me.",
        "单数用does。"
      ],
      [
        "This hammer does not belongs to me.",
        "does后用原形。"
      ],
      [
        "This hammer does not belong to mine.",
        "to后需要宾格me。"
      ]
    ],
    "does not belong否定单件归属，me指说话者。",
    [
      "This hammer doesn't belong to me."
    ]
  ],
  [
    "排练结束，你代表自己和另一位演员告诉道具师：这两张票归你们两人共同拥有。",
    "用These tickets开头，以独立物主代词表达共同归属。",
    "These tickets are ours.",
    [
      [
        "These tickets are our.",
        "our不能独立。"
      ],
      [
        "These tickets are theirs.",
        "theirs排除说话者。"
      ],
      [
        "These tickets is ours.",
        "复数用are。"
      ],
      [
        "These tickets are yours.",
        "变成只指听者的归属。"
      ]
    ],
    "包括说话者的我们用ours，tickets为复数。",
    []
  ],
  [
    "摄影室有两台无标签相机。你问负责人这些相机属于谁，不预设某个人。",
    "用whose、these cameras（相机）写一个问句。",
    "Whose cameras are these?",
    [
      [
        "Whose cameras is these?",
        "复数用are。"
      ],
      [
        "Who are these cameras?",
        "who问人身份。"
      ],
      [
        "Whose camera is this?",
        "两台被改成一台。"
      ],
      [
        "Where are these cameras?",
        "没有询问主人。"
      ]
    ],
    "两台相机用cameras/these/are；whose让主人保持未知。",
    [
      "Whose are these cameras?"
    ]
  ],
  [
    "游戏桌这副卡牌可能是对面那位玩家的，你尚未确认。你正向她本人发问。",
    "以Does开头，用this pack of cards（这副卡牌）、belong to询问归属。",
    "Does this pack of cards belong to you?",
    [
      [
        "Does this pack of cards belongs to you?",
        "does后原形。"
      ],
      [
        "Do this pack of cards belong to you?",
        "核心pack是单数。"
      ],
      [
        "Does this pack of cards belong to yours?",
        "to后用you。"
      ],
      [
        "Does this pack of cards belong to me?",
        "询问对象归属改成说话者。"
      ]
    ],
    "询问听者用you；a pack作为一副用does。",
    []
  ],
  [
    "你给客人分配座位后指着靠窗的椅子，对客人说明该椅子属于他。",
    "以That chair开头，用独立物主代词写归属句。",
    "That chair is yours.",
    [
      [
        "That chair is your.",
        "your后需名词。"
      ],
      [
        "That chair is mine.",
        "误指说话者。"
      ],
      [
        "That chair are yours.",
        "单数用is。"
      ],
      [
        "That chair is you.",
        "you是人，不是物主代词。"
      ]
    ],
    "你对主人本人说话，所以用yours，不因他是男性改用his。",
    []
  ],
  [
    "客人寄存了一只小盒子，标签掉了。你询问工作人员主人是谁；只指着盒子，不重复物件名。",
    "用whose和this写一个简短问句，不写box。",
    "Whose is this?",
    [
      [
        "Who is this?",
        "问人身份，不问物主。"
      ],
      [
        "Whose are this?",
        "this为单数。"
      ],
      [
        "Where is this?",
        "问地点。"
      ],
      [
        "Whose is these?",
        "these与is不配。"
      ]
    ],
    "whose独立询问归属；this需要is。",
    []
  ],
  [
    "美术室这两把画刷属于她，另一位女同学只是借过。你把确定归属告诉管理员。",
    "以These brushes（画刷）开头，用belong to和her说明归属。",
    "These brushes belong to her.",
    [
      [
        "These brushes belongs to her.",
        "复数不加s。"
      ],
      [
        "These brushes belong to hers.",
        "to后宾格her。"
      ],
      [
        "These brushes do not belong to her.",
        "归属事实反转。"
      ],
      [
        "These brushes belong to me.",
        "主人改变。"
      ]
    ],
    "复数brushes配belong，her是归属对象。",
    []
  ],
  [
    "一位女修复师自己的围巾落在椅上。你向另一位访客指着围巾，说明那是修复师的。",
    "用That scarf（围巾）开头，以独立物主代词指那位女修复师。",
    "That scarf is hers.",
    [
      [
        "That scarf is her.",
        "her不能独立表示此归属。"
      ],
      [
        "That scarf is yours.",
        "访客不是主人。"
      ],
      [
        "That scarf are hers.",
        "单数用is。"
      ],
      [
        "That scarf is hers scarf.",
        "hers后不接名词。"
      ]
    ],
    "谈论未在说话位置的女性主人用hers。",
    []
  ],
  [
    "清洁员拾到几把钥匙，你向值班人员询问它们主人。你指着钥匙，不重复名词。",
    "用whose和these写问句，不写keys。",
    "Whose are these?",
    [
      [
        "Whose is these?",
        "these需are。"
      ],
      [
        "Who are these?",
        "问人的身份。"
      ],
      [
        "Whose are this?",
        "this与are不配。"
      ],
      [
        "Where are these?",
        "问位置。"
      ]
    ],
    "复数代词these配are，whose保留未知主人。",
    []
  ],
  [
    "赛艇码头这条小船属于你和妹妹。你向看管员说我们拥有它；不是他拥有。",
    "以This boat开头，用belong to说明我们共同的归属。",
    "This boat belongs to us.",
    [
      [
        "This boat belong to us.",
        "单数肯定句需s。"
      ],
      [
        "This boat belongs to ours.",
        "to后用us。"
      ],
      [
        "This boat belongs to them.",
        "排除了说话者。"
      ],
      [
        "This boat does not belong to us.",
        "肯定变否定。"
      ]
    ],
    "单件belongs，包含说话者的归属对象用us。",
    []
  ],
  [
    "植物交换会里两个陌生参展者带来一些种子。你对志愿者指着这些种子，说明属于那两位参展者。",
    "以These seeds（种子）开头，用独立物主代词指那两位参展者。",
    "These seeds are theirs.",
    [
      [
        "These seeds are their.",
        "their需接名词。"
      ],
      [
        "These seeds are ours.",
        "你不在主人群体内。"
      ],
      [
        "These seeds is theirs.",
        "复数用are。"
      ],
      [
        "These seeds are them.",
        "them不是独立物主代词。"
      ]
    ],
    "theirs指双方正在谈论的主人群体。",
    []
  ],
  [
    "民宿共用书架上有一本词典，老板不知道主人。你替老板向住客询问归属。",
    "用whose、dictionary（词典）、that写问句。",
    "Whose dictionary is that?",
    [
      [
        "Whose dictionary are that?",
        "单数用is。"
      ],
      [
        "Whose dictionaries are those?",
        "题中只有一本。"
      ],
      [
        "Where is that dictionary?",
        "位置不是未知信息。"
      ],
      [
        "Who dictionary is that?",
        "who不能作这个限定词。"
      ]
    ],
    "that与单本dictionary配is；询问主人用whose。",
    [
      "Whose is that dictionary?"
    ]
  ],
  [
    "展览结束，讲解员问这几张照片是否属于场馆。你知道它们不属于那两位摄影师，正向另一位工作人员说明这一点。",
    "用These photographs（照片）开头，belong to否定它们属于them；只写这一事实。",
    "These photographs do not belong to them.",
    [
      [
        "These photographs does not belong to them.",
        "复数用do。"
      ],
      [
        "These photographs do not belongs to them.",
        "do后原形。"
      ],
      [
        "These photographs do not belong to theirs.",
        "to后用them。"
      ],
      [
        "These photographs belong to them.",
        "否定被抹去。"
      ]
    ],
    "them指那两位摄影师；复数否定do not belong。",
    [
      "These photographs don't belong to them."
    ]
  ],
  [
    "午餐盒混在一起，你向同伴指着自己的那个，强调这是你自己的，不是他的。只用代词替代已经指明的午餐盒。",
    "以This开头，用独立物主代词写一句，不再写lunch box。",
    "This is mine.",
    [
      [
        "This is my.",
        "my不能独立。"
      ],
      [
        "This is yours.",
        "主人方向反了。"
      ],
      [
        "This are mine.",
        "this用is。"
      ],
      [
        "This is me.",
        "me不是物主代词。"
      ]
    ],
    "已指明物件，mine可完整表达说话者拥有。",
    []
  ],
  [
    "社区音乐室留下两把小提琴，无人认领。你向房间管理员开放询问主人，而非猜是否他的。",
    "用whose、those violins（小提琴）写归属问句。",
    "Whose violins are those?",
    [
      [
        "Whose violins is those?",
        "复数用are。"
      ],
      [
        "Who are those violins?",
        "问人身份。"
      ],
      [
        "Whose violin is that?",
        "改变数量。"
      ],
      [
        "Are those violins yours?",
        "只问是否听者拥有，没有开放问主人。"
      ]
    ],
    "those violins复数，whose询问任何可能的主人。",
    [
      "Whose are those violins?"
    ]
  ],
  [
    "维修咖啡馆里你发现一台收音机。你向一起服务的志愿者询问是否属于你们共同的工具组，包括自己。",
    "以Does开头，用this radio、belong to，询问是否属于us。",
    "Does this radio belong to us?",
    [
      [
        "Does this radio belongs to us?",
        "does后原形。"
      ],
      [
        "Do this radio belong to us?",
        "单数用does。"
      ],
      [
        "Does this radio belong to ours?",
        "to后用us。"
      ],
      [
        "Does this radio belong to them?",
        "主人群体改变。"
      ]
    ],
    "单件radio用Does，包含说话者的我们用us。",
    []
  ]
];
const authored=author(data,rows);
for(let i=0;i<rows.length;i++) authored.questions[i].accepted=[...new Set([...authored.questions[i].accepted,...rows[i][5]])];
export const {lesson,questions,byId,questionsFor,matches}=bindContent(data,authored.questions);
