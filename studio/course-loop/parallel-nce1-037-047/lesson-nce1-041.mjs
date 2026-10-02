import {bindContent} from './content-contract.mjs';

export const lesson = {
  "id": "nce1-41",
  "version": 1,
  "book": "NCE1",
  "lessons": [
    41,
    42
  ],
  "title": "第41–42课 · 用量词说明物品并询问有没有",
  "goal": "用单位短语表达不可数物的数量，询问一个可数物或某种不可数物是否存在。",
  "scope": "限定题只判题目指定的主语、词汇、语义和输出形式；不排斥限定范围以外的自然英文。问句须以一个英文问号结束；陈述、命令及数量短语可省略句号或保留一个英文句号。大小写、空格及直/弯撇号不影响含义。自由表达接受自然等义句，待实际人工核对。",
  "prerequisites": [
    "已接触a/an、单数名词、基本位置介词；第42课存在疑问是本组新教学，不当成既知能力。",
    "每题提供所需新词中文义；不根据背景推断未给出的事实。"
  ],
  "source": {
    "groupId": "NCE1-41",
    "route": "/#/nce/NCE1/41?tab=listen",
    "mapRoute": "/map/#/learn/nce1-41",
    "languagePath": "/language/NCE1/41.json",
    "languageSha256": "c33622a6e91ee105a92be30deaa1c16cf7f5f646c2ae9612237c2dc3b29f24d2",
    "sourceSha256": "c33622a6e91ee105a92be30deaa1c16cf7f5f646c2ae9612237c2dc3b29f24d2",
    "comicKey": "NCE1-41",
    "clips": [
      {
        "target": "quantity-unit",
        "label": "听第41课相关片段 · 不可数物借助单位计数",
        "start": 29.27,
        "end": 42.77
      },
      {
        "target": "singular-existence",
        "label": "听第41课相关片段 · 询问有没有一个物品；存在句型另见第42课练习",
        "start": 24.3,
        "end": 29.27
      },
      {
        "target": "mass-existence",
        "label": "听第41课相关片段 · 询问有没有某种物质；存在句型另见第42课练习",
        "start": 40.19,
        "end": 49.17
      }
    ]
  },
  "glossary": "限定题所需词义均在各题提示中；所有新情境为原创虚构，可用于角色练习。",
  "teaching": [
    {
      "target": "quantity-unit",
      "title": "不可数物借助单位计数",
      "explanation": "bread、milk、soap等通常作为不可数物；用a loaf of bread、a bottle of milk、a bar of soap表达一条、一瓶、一块。数量增多时单位复数，如two bottles of milk，物质名词仍不加s。",
      "example": "Two bottles of juice.",
      "meaning": "两瓶果汁。",
      "check": "单位数量正确；保留of及物质名词。",
      "source": "quantity-unit"
    },
    {
      "target": "singular-existence",
      "title": "询问有没有一个物品",
      "explanation": "第42课练习用Is there a/an + 单数名词 + 位置?询问存在。a/an取决于紧随词语的首音；不是问一个已知物品在哪里。第41课原声提供物品词与位置背景，句型依据第42课练习页。",
      "example": "Is there an umbrella in that locker?",
      "meaning": "那个储物柜里有一把伞吗？",
      "check": "is在there之前；单数可数物保留a/an与位置。",
      "source": "singular-existence"
    },
    {
      "target": "mass-existence",
      "title": "询问有没有某种物质",
      "explanation": "第42课练习用Is there any + 不可数名词 + 位置?。如water、rice不因量多而加s；any用于不预设肯定答案的存在询问。原声提供单位物质词，完整疑问句来自第42课练习。",
      "example": "Is there any rice in that bag?",
      "meaning": "那个袋子里有米吗？",
      "check": "is对应不可数物；any后保持物质名词，不误写a rice。",
      "source": "mass-existence"
    }
  ],
  "own": {
    "id": "own-n41-personal-use",
    "prompt": "设定一份自己的物资清单，报告一个单位数量，分别询问一个可数物与某种不可数物有没有，保留具体位置。请伙伴实际查清单或现场并回答；未知存量不编造。保留首答、订正与原因。自由表达可采用自然等义形式。",
    "checks": [
      "单位数量正确；保留of及物质名词。",
      "is在there之前；单数可数物保留a/an与位置。",
      "is对应不可数物；any后保持物质名词，不误写a rice。"
    ],
    "status": "awaiting-human-review",
    "reviewerPrompt": "请伙伴或老师实际听/读并按情境核对意思、对象、时间、肯否定与句型，接受自然合理变体。完成文字题不代表听力或发音已经核验。"
  },
  "intervals": {
    "first": 86400000,
    "repair": 86400000,
    "subsequent": 604800000
  },
  "rights": "original-authored",
  "contentStatus": "authored-blind-reviewed"
};

export const questions = [
  {
    "id": "diagnostic-n41-quantity-unit",
    "stage": "diagnostic",
    "target": "quantity-unit",
    "kind": "input",
    "form": "statement",
    "context": "救援包清单规定只装一瓶清水，你向打包者报这一物品数量。",
    "prompt": "只写一个数量名词短语：bottle（瓶）、water（水），表达“一瓶水”，不用完整句。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "A bottle of water.",
      "One bottle of water."
    ],
    "criterion": "单位数量正确；保留of及物质名词。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：单位数量正确；保留of及物质名词。 易错边界：一瓶不能改成两瓶。",
    "novelty": "救援包清单规定只装一瓶清水，你向打包者报这一物品数量。",
    "counterexamples": [
      {
        "answer": "Two bottles of water.",
        "reason": "一瓶不能改成两瓶。"
      },
      {
        "answer": "A bottle of water?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "A bottle of water..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "A bottle water.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "diagnostic-n41-singular-existence",
    "stage": "diagnostic",
    "target": "singular-existence",
    "kind": "input",
    "form": "question",
    "context": "你在手工活动找胶刷，不知道那个盒子里是否有一把刷子。",
    "prompt": "以Is there开头，brush（刷子）、in that box（那个盒子里），问有没有一把刷子。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Is there a brush in that box?"
    ],
    "criterion": "is在there之前；单数可数物保留a/an与位置。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：is在there之前；单数可数物保留a/an与位置。 易错边界：盒内与盒上不同。",
    "novelty": "你在手工活动找胶刷，不知道那个盒子里是否有一把刷子。",
    "counterexamples": [
      {
        "answer": "Is there a brush on that box?",
        "reason": "盒内与盒上不同。"
      },
      {
        "answer": "Is there a brush in that box.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Is there a brush in that box??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "There is a brush in that box?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "diagnostic-n41-mass-existence",
    "stage": "diagnostic",
    "target": "mass-existence",
    "kind": "input",
    "form": "question",
    "context": "炊事伙伴准备做饭，你不知那个袋子里有没有米。",
    "prompt": "以Is there开头，any rice（米）、in that bag（那个袋子里），作中性存在询问。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Is there any rice in that bag?"
    ],
    "criterion": "is对应不可数物；any后保持物质名词，不误写a rice。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：is对应不可数物；any后保持物质名词，不误写a rice。 易错边界：米是不可数物，不能用are。",
    "novelty": "炊事伙伴准备做饭，你不知那个袋子里有没有米。",
    "counterexamples": [
      {
        "answer": "Are there any rice in that bag?",
        "reason": "米是不可数物，不能用are。"
      },
      {
        "answer": "Is there any rice in that bag.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Is there any rice in that bag??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "There is any rice in that bag?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "guided-n41-quantity-unit",
    "stage": "guided",
    "target": "quantity-unit",
    "kind": "input",
    "form": "statement",
    "context": "清洁用品清单列明两块肥皂，你报给后勤员。",
    "prompt": "只写数量短语“two + bars + of + soap”，soap（肥皂），不用完整句。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "Two bars of soap."
    ],
    "criterion": "单位数量正确；保留of及物质名词。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：单位数量正确；保留of及物质名词。 易错边界：两个单位要求bar复数。",
    "novelty": "清洁用品清单列明两块肥皂，你报给后勤员。",
    "counterexamples": [
      {
        "answer": "Two bar of soap.",
        "reason": "两个单位要求bar复数。"
      },
      {
        "answer": "Two bars of soap?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "Two bars of soap..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "Two bars soap.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "guided-n41-singular-existence",
    "stage": "guided",
    "target": "singular-existence",
    "kind": "input",
    "form": "question",
    "context": "旅客想确认那个储物柜里有没有一把伞，还不知答案。",
    "prompt": "umbrella（伞）、in that locker（那个储物柜里）。提示：Is there + an + 单数名词 + 位置?。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Is there an umbrella in that locker?"
    ],
    "criterion": "is在there之前；单数可数物保留a/an与位置。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：is在there之前；单数可数物保留a/an与位置。 易错边界：umbrella以元音音素开头，用an。",
    "novelty": "旅客想确认那个储物柜里有没有一把伞，还不知答案。",
    "counterexamples": [
      {
        "answer": "Is there a umbrella in that locker?",
        "reason": "umbrella以元音音素开头，用an。"
      },
      {
        "answer": "Is there an umbrella in that locker.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Is there an umbrella in that locker??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "There is an umbrella in that locker?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "guided-n41-mass-existence",
    "stage": "guided",
    "target": "mass-existence",
    "kind": "input",
    "form": "question",
    "context": "午餐前你不知那个碗里有没有汤。",
    "prompt": "any soup（汤）、in that bowl（那个碗里）。提示：Is there + any + 不可数名词 + 位置?。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Is there any soup in that bowl?"
    ],
    "criterion": "is对应不可数物；any后保持物质名词，不误写a rice。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：is对应不可数物；any后保持物质名词，不误写a rice。 易错边界：此处未指一份汤，需保留不可数物的any。",
    "novelty": "午餐前你不知那个碗里有没有汤。",
    "counterexamples": [
      {
        "answer": "Is there a soup in that bowl?",
        "reason": "此处未指一份汤，需保留不可数物的any。"
      },
      {
        "answer": "Is there any soup in that bowl.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Is there any soup in that bowl??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "There is any soup in that bowl?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "independent-n41-quantity-unit",
    "stage": "independent",
    "target": "quantity-unit",
    "kind": "input",
    "form": "statement",
    "context": "一份水上活动物资单写明三瓶果汁，你向领取者报数量。",
    "prompt": "只写数量名词短语：three（三）、bottle（瓶）、juice（果汁），不用完整句。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "Three bottles of juice."
    ],
    "criterion": "单位数量正确；保留of及物质名词。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：单位数量正确；保留of及物质名词。 易错边界：物质juice在本题不按多个种类计数，不加s。",
    "novelty": "一份水上活动物资单写明三瓶果汁，你向领取者报数量。",
    "counterexamples": [
      {
        "answer": "Three bottles of juices.",
        "reason": "物质juice在本题不按多个种类计数，不加s。"
      },
      {
        "answer": "Three bottles of juice?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "Three bottles of juice..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "Three bottles juice.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "independent-n41-singular-existence",
    "stage": "independent",
    "target": "singular-existence",
    "kind": "input",
    "form": "question",
    "context": "你的修理伙伴需要扳手，你不知那个抽屉里是否有一把。",
    "prompt": "以Is there开头，wrench（扳手）、in that drawer（那个抽屉里），问有没有一把。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Is there a wrench in that drawer?"
    ],
    "criterion": "is在there之前；单数可数物保留a/an与位置。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：is在there之前；单数可数物保留a/an与位置。 易错边界：题目询问一个扳手，不是复数存量，且复数不配is。",
    "novelty": "你的修理伙伴需要扳手，你不知那个抽屉里是否有一把。",
    "counterexamples": [
      {
        "answer": "Is there any wrenches in that drawer?",
        "reason": "题目询问一个扳手，不是复数存量，且复数不配is。"
      },
      {
        "answer": "Is there a wrench in that drawer.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Is there a wrench in that drawer??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "There is a wrench in that drawer?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "independent-n41-mass-existence",
    "stage": "independent",
    "target": "mass-existence",
    "kind": "input",
    "form": "question",
    "context": "摄影准备时你想确认那个罐里有没有胶水，未预设答案。",
    "prompt": "以Is there开头，any glue（胶水）、in that jar（那个罐里），只问存在。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Is there any glue in that jar?"
    ],
    "criterion": "is对应不可数物；any后保持物质名词，不误写a rice。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：is对应不可数物；any后保持物质名词，不误写a rice。 易错边界：罐内与罐上改变位置。",
    "novelty": "摄影准备时你想确认那个罐里有没有胶水，未预设答案。",
    "counterexamples": [
      {
        "answer": "Is there any glue on that jar?",
        "reason": "罐内与罐上改变位置。"
      },
      {
        "answer": "Is there any glue in that jar.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Is there any glue in that jar??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "There is any glue in that jar?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "repair-n41-quantity-unit",
    "stage": "repair",
    "target": "quantity-unit",
    "kind": "input",
    "form": "statement",
    "context": "读书会点心只需一条面包，你为购物者报数量。",
    "prompt": "只写数量短语“一条面包”，loaf（条）、bread（面包），不用完整句。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "A loaf of bread.",
      "One loaf of bread."
    ],
    "criterion": "单位数量正确；保留of及物质名词。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：单位数量正确；保留of及物质名词。 易错边界：量词与物质顺序反转。",
    "novelty": "读书会点心只需一条面包，你为购物者报数量。",
    "counterexamples": [
      {
        "answer": "A bread of loaf.",
        "reason": "量词与物质顺序反转。"
      },
      {
        "answer": "A loaf of bread?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "A loaf of bread..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "A loaf bread.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "repair-n41-singular-existence",
    "stage": "repair",
    "target": "singular-existence",
    "kind": "input",
    "form": "question",
    "context": "你要找一只空杯，不知道那张桌上有没有一只杯子。",
    "prompt": "以Is there开头，cup（杯）、on that table（那张桌上），询问单个物品。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Is there a cup on that table?"
    ],
    "criterion": "is在there之前；单数可数物保留a/an与位置。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：is在there之前；单数可数物保留a/an与位置。 易错边界：桌上与桌下不同。",
    "novelty": "你要找一只空杯，不知道那张桌上有没有一只杯子。",
    "counterexamples": [
      {
        "answer": "Is there a cup under that table?",
        "reason": "桌上与桌下不同。"
      },
      {
        "answer": "Is there a cup on that table.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Is there a cup on that table??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "There is a cup on that table?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "repair-n41-mass-existence",
    "stage": "repair",
    "target": "mass-existence",
    "kind": "input",
    "form": "question",
    "context": "写字用的墨水可能已用完，你询问那个瓶里有没有墨水。",
    "prompt": "以Is there开头，any ink（墨水）、in that bottle（那个瓶里），作中性存在询问。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Is there any ink in that bottle?"
    ],
    "criterion": "is对应不可数物；any后保持物质名词，不误写a rice。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：is对应不可数物；any后保持物质名词，不误写a rice。 易错边界：墨水按物质不可数，不能改成an ink。",
    "novelty": "写字用的墨水可能已用完，你询问那个瓶里有没有墨水。",
    "counterexamples": [
      {
        "answer": "Is there an ink in that bottle?",
        "reason": "墨水按物质不可数，不能改成an ink。"
      },
      {
        "answer": "Is there any ink in that bottle.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Is there any ink in that bottle??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "There is any ink in that bottle?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "review-a-n41-quantity-unit",
    "stage": "review-a",
    "target": "quantity-unit",
    "kind": "input",
    "form": "statement",
    "context": "游园小组物资单要求两瓶牛奶，你报这一数量。",
    "prompt": "只写数量短语“两瓶牛奶”，two、bottle（瓶）、milk（牛奶），不用完整句。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "Two bottles of milk."
    ],
    "criterion": "单位数量正确；保留of及物质名词。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：单位数量正确；保留of及物质名词。 易错边界：漏掉单位与物质之间的of。",
    "novelty": "游园小组物资单要求两瓶牛奶，你报这一数量。",
    "counterexamples": [
      {
        "answer": "Two bottles milk.",
        "reason": "漏掉单位与物质之间的of。"
      },
      {
        "answer": "Two bottles of milk?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "Two bottles of milk..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "Two bottles milk.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "review-a-n41-singular-existence",
    "stage": "review-a",
    "target": "singular-existence",
    "kind": "input",
    "form": "question",
    "context": "剪纸活动开场时你不知道那把椅子上是否有一个信封。",
    "prompt": "以Is there开头，envelope（信封）、on that chair（那把椅子上），问单个物品存在。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Is there an envelope on that chair?"
    ],
    "criterion": "is在there之前；单数可数物保留a/an与位置。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：is在there之前；单数可数物保留a/an与位置。 易错边界：envelope以元音音素开头需an。",
    "novelty": "剪纸活动开场时你不知道那把椅子上是否有一个信封。",
    "counterexamples": [
      {
        "answer": "Is there a envelope on that chair?",
        "reason": "envelope以元音音素开头需an。"
      },
      {
        "answer": "Is there an envelope on that chair.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Is there an envelope on that chair??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "There is an envelope on that chair?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "review-a-n41-mass-existence",
    "stage": "review-a",
    "target": "mass-existence",
    "kind": "input",
    "form": "question",
    "context": "午饭准备时你不知道那个盘子上有没有奶酪。",
    "prompt": "以Is there开头，any cheese（奶酪）、on that plate（那个盘子上），作中性询问。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Is there any cheese on that plate?"
    ],
    "criterion": "is对应不可数物；any后保持物质名词，不误写a rice。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：is对应不可数物；any后保持物质名词，不误写a rice。 易错边界：本题奶酪按不可数物，用is。",
    "novelty": "午饭准备时你不知道那个盘子上有没有奶酪。",
    "counterexamples": [
      {
        "answer": "Are there any cheese on that plate?",
        "reason": "本题奶酪按不可数物，用is。"
      },
      {
        "answer": "Is there any cheese on that plate.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Is there any cheese on that plate??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "There is any cheese on that plate?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "review-b-n41-quantity-unit",
    "stage": "review-b",
    "target": "quantity-unit",
    "kind": "input",
    "form": "statement",
    "context": "厨房采购单只列一块巧克力，你给采购员报数量。",
    "prompt": "只写数量短语“一块巧克力”，bar（块）、chocolate（巧克力），不用完整句。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "A bar of chocolate.",
      "One bar of chocolate."
    ],
    "criterion": "单位数量正确；保留of及物质名词。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：单位数量正确；保留of及物质名词。 易错边界：题目明确一块，不是一瓶。",
    "novelty": "厨房采购单只列一块巧克力，你给采购员报数量。",
    "counterexamples": [
      {
        "answer": "A bottle of chocolate.",
        "reason": "题目明确一块，不是一瓶。"
      },
      {
        "answer": "A bar of chocolate?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "A bar of chocolate..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "A bar chocolate.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "review-b-n41-singular-existence",
    "stage": "review-b",
    "target": "singular-existence",
    "kind": "input",
    "form": "question",
    "context": "你在营地准备把吊床固定在一棵树旁，想避免打扰鸟类。你不知道那棵树上是否有一只鸟，先向同伴确认。",
    "prompt": "以Is there开头，bird（鸟）、in that tree（那棵树上），问单个物品存在。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Is there a bird in that tree?"
    ],
    "criterion": "is在there之前；单数可数物保留a/an与位置。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：is在there之前；单数可数物保留a/an与位置。 易错边界：树上与树下不是同一个位置。",
    "novelty": "你在营地准备把吊床固定在一棵树旁，想避免打扰鸟类。你不知道那棵树上是否有一只鸟，先向同伴确认。",
    "counterexamples": [
      {
        "answer": "Is there a bird under that tree?",
        "reason": "树上与树下不是同一个位置。"
      },
      {
        "answer": "Is there a bird in that tree.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Is there a bird in that tree??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "There is a bird in that tree?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "review-b-n41-mass-existence",
    "stage": "review-b",
    "target": "mass-existence",
    "kind": "input",
    "form": "question",
    "context": "你想做烘焙，尚未核对那个罐子是否有糖。",
    "prompt": "以Is there开头，any sugar（糖）、in that tin（那个罐子里），作中性询问。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Is there any sugar in that tin?"
    ],
    "criterion": "is对应不可数物；any后保持物质名词，不误写a rice。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：is对应不可数物；any后保持物质名词，不误写a rice。 易错边界：糖按物质不可数，不是一个可数物。",
    "novelty": "你想做烘焙，尚未核对那个罐子是否有糖。",
    "counterexamples": [
      {
        "answer": "Is there a sugar in that tin?",
        "reason": "糖按物质不可数，不是一个可数物。"
      },
      {
        "answer": "Is there any sugar in that tin.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Is there any sugar in that tin??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "There is any sugar in that tin?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  }
];

export const {byId,questionsFor,matches}=bindContent(lesson,questions);
