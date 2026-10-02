import {bindContent} from './content-contract.mjs';

export const lesson = {
  "id": "nce1-45",
  "version": 1,
  "book": "NCE1",
  "lessons": [
    45,
    46
  ],
  "title": "第45–46课 · 询问并说明具体能力边界",
  "goal": "用can询问具体能力，表达已确认的能与不能，避免把能力说成愿望、计划或正在发生的动作。",
  "scope": "限定题只判题目指定的主语、词汇、语义和输出形式；不排斥限定范围以外的自然英文。问句须以一个英文问号结束；陈述、命令及数量短语可省略句号或保留一个英文句号。大小写、空格及直/弯撇号不影响含义。自由表达接受自然等义句，待实际人工核对。",
  "prerequisites": [
    "已接触be疑问及人称代词，第43课can为初步接触；本组明确教学can后原形及肯否定能力。",
    "每题提供所需新词中文义；不根据背景推断未给出的事实。"
  ],
  "source": {
    "groupId": "NCE1-45",
    "route": "/#/nce/NCE1/45?tab=listen",
    "mapRoute": "/map/#/learn/nce1-45",
    "languagePath": "/language/NCE1/45.json",
    "languageSha256": "64d424a548d931919ed83acb12cc346aba778056f026036727eae4276e17aabd",
    "sourceSha256": "64d424a548d931919ed83acb12cc346aba778056f026036727eae4276e17aabd",
    "comicKey": "NCE1-45",
    "clips": [
      {
        "target": "ability-question",
        "label": "听第45课相关片段 · can能力询问",
        "start": 31.48,
        "end": 35.19
      },
      {
        "target": "can-do",
        "label": "听第45课相关片段 · 肯定能力",
        "start": 39.31,
        "end": 47.75
      },
      {
        "target": "cannot-do",
        "label": "听第45课相关片段 · 否定能力边界",
        "start": 56.11,
        "end": 61.59
      }
    ]
  },
  "glossary": "限定题所需词义均在各题提示中；所有新情境为原创虚构，可用于角色练习。",
  "teaching": [
    {
      "target": "ability-question",
      "title": "can能力询问",
      "explanation": "Can + 主语 + 动词原形 + 对象?询问能否完成具体动作。can不随人称加s，也不借助do；原课也用can提出请求，本组限定题明确询问能力。",
      "example": "Can she carry this bag?",
      "meaning": "她能提这个包吗？",
      "check": "can在主语前，后面动词原形，对象不变。",
      "source": "ability-question"
    },
    {
      "target": "can-do",
      "title": "肯定能力",
      "explanation": "主语 + can + 动词原形表达已知能力，不能用is doing替代。若回答别人Can you…?，答复者用I；Can she…?的短答才沿用she。",
      "example": "They can repair this lamp.",
      "meaning": "他们能修这盏灯。",
      "check": "主语与能力事实正确，can后用原形。",
      "source": "can-do"
    },
    {
      "target": "cannot-do",
      "title": "否定能力边界",
      "explanation": "主语 + cannot/can not/can’t + 动词原形。cannot常合写，完整can not也可接受。不能因为会某种活动就推断所有对象都能完成；题目必须有已知不能的事实。",
      "example": "I cannot read that sign.",
      "meaning": "我看不清那个标志。",
      "check": "保留否定、主语及特定对象；不是不愿意或未来不做。",
      "source": "cannot-do"
    }
  ],
  "own": {
    "id": "own-n45-personal-use",
    "prompt": "与伙伴讨论一项实际任务：问能否完成某个动作，说清一件你确定能做与一件确定不能做的事。能力未知先询问或试做，不能仅凭愿望推断。保留首答、订正与原因。自由表达可采用自然等义形式。",
    "checks": [
      "can在主语前，后面动词原形，对象不变。",
      "主语与能力事实正确，can后用原形。",
      "保留否定、主语及特定对象；不是不愿意或未来不做。"
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
    "id": "diagnostic-n45-ability-question",
    "stage": "diagnostic",
    "target": "ability-question",
    "kind": "input",
    "form": "question",
    "context": "志愿者分工时你不知道一位女队员是否能搬这个箱子，询问她的能力。",
    "prompt": "主语she，carry（搬）、this crate（这个箱子），用can问能力。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Can she carry this crate?"
    ],
    "criterion": "can在主语前，后面动词原形，对象不变。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：can在主语前，后面动词原形，对象不变。 易错边界：一般现在时行为问句不是能力问句。",
    "novelty": "志愿者分工时你不知道一位女队员是否能搬这个箱子，询问她的能力。",
    "counterexamples": [
      {
        "answer": "Does she carry this crate?",
        "reason": "一般现在时行为问句不是能力问句。"
      },
      {
        "answer": "Can she carry this crate.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Can she carry this crate??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "Can to she carry this crate?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "diagnostic-n45-can-do",
    "stage": "diagnostic",
    "target": "can-do",
    "kind": "input",
    "form": "statement",
    "context": "修理组已经确认两名成员能修这盏灯，你报告他们的能力。",
    "prompt": "主语They，can，repair（修）、this lamp（这盏灯），只写肯定能力句。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "They can repair this lamp."
    ],
    "criterion": "主语与能力事实正确，can后用原形。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：主语与能力事实正确，can后用原形。 易错边界：正在修不能表达已确认的能力。",
    "novelty": "修理组已经确认两名成员能修这盏灯，你报告他们的能力。",
    "counterexamples": [
      {
        "answer": "They are repairing this lamp.",
        "reason": "正在修不能表达已确认的能力。"
      },
      {
        "answer": "They can repair this lamp?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "They can repair this lamp..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "They can to repair this lamp.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "diagnostic-n45-cannot-do",
    "stage": "diagnostic",
    "target": "cannot-do",
    "kind": "input",
    "form": "statement",
    "context": "你确认自己看不清那个远处标志，需要说明具体限制。",
    "prompt": "主语I，can的否定，read（读）、that sign（那个标志），只写否定能力句。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "I cannot read that sign.",
      "I can't read that sign.",
      "I can not read that sign."
    ],
    "criterion": "保留否定、主语及特定对象；不是不愿意或未来不做。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：保留否定、主语及特定对象；不是不愿意或未来不做。 易错边界：肯定反转了不能读的事实。",
    "novelty": "你确认自己看不清那个远处标志，需要说明具体限制。",
    "counterexamples": [
      {
        "answer": "I can read that sign.",
        "reason": "肯定反转了不能读的事实。"
      },
      {
        "answer": "I cannot read that sign?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "I cannot read that sign..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "I not can read that sign.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "guided-n45-ability-question",
    "stage": "guided",
    "target": "ability-question",
    "kind": "input",
    "form": "question",
    "context": "教练想核实一位男队员是否能游泳，不问今天是否愿意。",
    "prompt": "主语he，swim（游泳）。提示：Can + he + 动词原形?。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Can he swim?"
    ],
    "criterion": "can在主语前，后面动词原形，对象不变。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：can在主语前，后面动词原形，对象不变。 易错边界：can后动词不加s。",
    "novelty": "教练想核实一位男队员是否能游泳，不问今天是否愿意。",
    "counterexamples": [
      {
        "answer": "Can he swims?",
        "reason": "can后动词不加s。"
      },
      {
        "answer": "Can he swim.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Can he swim??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "Can to he swim?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "guided-n45-can-do",
    "stage": "guided",
    "target": "can-do",
    "kind": "input",
    "form": "statement",
    "context": "伙伴核实过你会给轮胎充气，你说明自己的能力。",
    "prompt": "主语I，pump up（充气）、this tyre（这个轮胎）。提示：I + can + 动词原形 + 对象。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "I can pump up this tyre.",
      "I can pump this tyre up."
    ],
    "criterion": "主语与能力事实正确，can后用原形。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：主语与能力事实正确，can后用原形。 易错边界：打算做不等于会做。",
    "novelty": "伙伴核实过你会给轮胎充气，你说明自己的能力。",
    "counterexamples": [
      {
        "answer": "I am going to pump up this tyre.",
        "reason": "打算做不等于会做。"
      },
      {
        "answer": "I can pump up this tyre?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "I can pump up this tyre..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "I can to pump up this tyre.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "guided-n45-cannot-do",
    "stage": "guided",
    "target": "cannot-do",
    "kind": "input",
    "form": "statement",
    "context": "一位女队员确实提不动那个行李箱，你说明她的能力限制。",
    "prompt": "主语She，lift（提起）、that suitcase（那个行李箱）。提示：She + cannot/can't + 原形。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "She cannot lift that suitcase.",
      "She can't lift that suitcase.",
      "She can not lift that suitcase."
    ],
    "criterion": "保留否定、主语及特定对象；不是不愿意或未来不做。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：保留否定、主语及特定对象；不是不愿意或未来不做。 易错边界：否定丢失使事实相反。",
    "novelty": "一位女队员确实提不动那个行李箱，你说明她的能力限制。",
    "counterexamples": [
      {
        "answer": "She can lift that suitcase.",
        "reason": "否定丢失使事实相反。"
      },
      {
        "answer": "She cannot lift that suitcase?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "She cannot lift that suitcase..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "She not can lift that suitcase.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "independent-n45-ability-question",
    "stage": "independent",
    "target": "ability-question",
    "kind": "input",
    "form": "question",
    "context": "展览讲解员想核实一位新志愿者是否能翻译这份通知，你直接问他。",
    "prompt": "主语you，translate（翻译）、this notice（这份通知），只问can能力。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Can you translate this notice?"
    ],
    "criterion": "can在主语前，后面动词原形，对象不变。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：can在主语前，后面动词原形，对象不变。 易错边界：愿不愿意不等于能否翻译。",
    "novelty": "展览讲解员想核实一位新志愿者是否能翻译这份通知，你直接问他。",
    "counterexamples": [
      {
        "answer": "Do you want to translate this notice?",
        "reason": "愿不愿意不等于能否翻译。"
      },
      {
        "answer": "Can you translate this notice.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Can you translate this notice??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "Can to you translate this notice?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "independent-n45-can-do",
    "stage": "independent",
    "target": "can-do",
    "kind": "input",
    "form": "statement",
    "context": "两名音乐社成员实际会调这把吉他，你报告已核实能力。",
    "prompt": "主语They，can，tune（调音）、this guitar（这把吉他），只写肯定句。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "They can tune this guitar."
    ],
    "criterion": "主语与能力事实正确，can后用原形。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：主语与能力事实正确，can后用原形。 易错边界：can后需要原形tune。",
    "novelty": "两名音乐社成员实际会调这把吉他，你报告已核实能力。",
    "counterexamples": [
      {
        "answer": "They can tuning this guitar.",
        "reason": "can后需要原形tune。"
      },
      {
        "answer": "They can tune this guitar?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "They can tune this guitar..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "They can to tune this guitar.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "independent-n45-cannot-do",
    "stage": "independent",
    "target": "cannot-do",
    "kind": "input",
    "form": "statement",
    "context": "手工教室一位男学生确实打不开这个罐，你报告限制。",
    "prompt": "主语He，can的否定，open（打开）、this jar（这个罐），只写否定能力句。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "He cannot open this jar.",
      "He can't open this jar.",
      "He can not open this jar."
    ],
    "criterion": "保留否定、主语及特定对象；不是不愿意或未来不做。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：保留否定、主语及特定对象；不是不愿意或未来不做。 易错边界：this与that改变特定对象。",
    "novelty": "手工教室一位男学生确实打不开这个罐，你报告限制。",
    "counterexamples": [
      {
        "answer": "He cannot open that jar.",
        "reason": "this与that改变特定对象。"
      },
      {
        "answer": "He cannot open this jar?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "He cannot open this jar..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "He not can open this jar.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "repair-n45-ability-question",
    "stage": "repair",
    "target": "ability-question",
    "kind": "input",
    "form": "question",
    "context": "后勤组不确定两名新成员是否能装这顶帐篷，向协调者询问。",
    "prompt": "主语they，assemble（组装）、this tent（这顶帐篷），用can问能力。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Can they assemble this tent?"
    ],
    "criterion": "can在主语前，后面动词原形，对象不变。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：can在主语前，后面动词原形，对象不变。 易错边界：正在装与能否装不是同一问题。",
    "novelty": "后勤组不确定两名新成员是否能装这顶帐篷，向协调者询问。",
    "counterexamples": [
      {
        "answer": "Are they assembling this tent?",
        "reason": "正在装与能否装不是同一问题。"
      },
      {
        "answer": "Can they assemble this tent.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Can they assemble this tent??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "Can to they assemble this tent?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "repair-n45-can-do",
    "stage": "repair",
    "target": "can-do",
    "kind": "input",
    "form": "statement",
    "context": "你已确认自己能辨认这张地图上的线路，说明能力。",
    "prompt": "主语I，can，read（读）、this map（这张地图），只写肯定句。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "I can read this map."
    ],
    "criterion": "主语与能力事实正确，can后用原形。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：主语与能力事实正确，can后用原形。 易错边界：否定与已知能读相反。",
    "novelty": "你已确认自己能辨认这张地图上的线路，说明能力。",
    "counterexamples": [
      {
        "answer": "I cannot read this map.",
        "reason": "否定与已知能读相反。"
      },
      {
        "answer": "I can read this map?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "I can read this map..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "I can to read this map.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "repair-n45-cannot-do",
    "stage": "repair",
    "target": "cannot-do",
    "kind": "input",
    "form": "statement",
    "context": "语言活动中两位同伴确实不能拼那个词，你报告具体限制。",
    "prompt": "主语They，can的否定，spell（拼写）、that word（那个词），只写否定能力句。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "They cannot spell that word.",
      "They can't spell that word.",
      "They can not spell that word."
    ],
    "criterion": "保留否定、主语及特定对象；不是不愿意或未来不做。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：保留否定、主语及特定对象；不是不愿意或未来不做。 易错边界：一个特定词不能换成多个词。",
    "novelty": "语言活动中两位同伴确实不能拼那个词，你报告具体限制。",
    "counterexamples": [
      {
        "answer": "They cannot spell those words.",
        "reason": "一个特定词不能换成多个词。"
      },
      {
        "answer": "They cannot spell that word?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "They cannot spell that word..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "They not can spell that word.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "review-a-n45-ability-question",
    "stage": "review-a",
    "target": "ability-question",
    "kind": "input",
    "form": "question",
    "context": "清点活动需要扫码，你不知一位女队员是否能扫描这个编号。",
    "prompt": "主语she，scan（扫描）、this code（这个编号），用can问能力。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Can she scan this code?"
    ],
    "criterion": "can在主语前，后面动词原形，对象不变。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：can在主语前，后面动词原形，对象不变。 易错边界：can后不加第三人称s。",
    "novelty": "清点活动需要扫码，你不知一位女队员是否能扫描这个编号。",
    "counterexamples": [
      {
        "answer": "Can she scans this code?",
        "reason": "can后不加第三人称s。"
      },
      {
        "answer": "Can she scan this code.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Can she scan this code??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "Can to she scan this code?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "review-a-n45-can-do",
    "stage": "review-a",
    "target": "can-do",
    "kind": "input",
    "form": "statement",
    "context": "你和同伴已经验证能修这个拉链，向领队报告你们的能力。",
    "prompt": "主语We，can，repair（修）、this zip（这个拉链），只写肯定句。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "We can repair this zip."
    ],
    "criterion": "主语与能力事实正确，can后用原形。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：主语与能力事实正确，can后用原形。 易错边界：正在修与能修不同。",
    "novelty": "你和同伴已经验证能修这个拉链，向领队报告你们的能力。",
    "counterexamples": [
      {
        "answer": "We are repairing this zip.",
        "reason": "正在修与能修不同。"
      },
      {
        "answer": "We can repair this zip?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "We can repair this zip..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "We can to repair this zip.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "review-a-n45-cannot-do",
    "stage": "review-a",
    "target": "cannot-do",
    "kind": "input",
    "form": "statement",
    "context": "你已核实自己打不开那把锁，说明这个具体限制。",
    "prompt": "主语I，can的否定，open（打开）、that lock（那把锁），只写否定能力句。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "I cannot open that lock.",
      "I can't open that lock.",
      "I can not open that lock."
    ],
    "criterion": "保留否定、主语及特定对象；不是不愿意或未来不做。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：保留否定、主语及特定对象；不是不愿意或未来不做。 易错边界：平时不打开不是能力限制。",
    "novelty": "你已核实自己打不开那把锁，说明这个具体限制。",
    "counterexamples": [
      {
        "answer": "I do not open that lock.",
        "reason": "平时不打开不是能力限制。"
      },
      {
        "answer": "I cannot open that lock?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "I cannot open that lock..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "I not can open that lock.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "review-b-n45-ability-question",
    "stage": "review-b",
    "target": "ability-question",
    "kind": "input",
    "form": "question",
    "context": "你在现场需要核实男队员是否能提这只桶，向搭档询问其能力。",
    "prompt": "主语he，lift（提起）、this bucket（这只桶），只问can能力。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Can he lift this bucket?"
    ],
    "criterion": "can在主语前，后面动词原形，对象不变。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：can在主语前，后面动词原形，对象不变。 易错边界：can后不能用-ing。",
    "novelty": "你在现场需要核实男队员是否能提这只桶，向搭档询问其能力。",
    "counterexamples": [
      {
        "answer": "Can he lifting this bucket?",
        "reason": "can后不能用-ing。"
      },
      {
        "answer": "Can he lift this bucket.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Can he lift this bucket??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "Can to he lift this bucket?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "review-b-n45-can-do",
    "stage": "review-b",
    "target": "can-do",
    "kind": "input",
    "form": "statement",
    "context": "一位女讲解员已展示能认出这只鸟，你报告她的能力。",
    "prompt": "主语She，can，identify（辨认）、this bird（这只鸟），只写肯定能力句。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "She can identify this bird."
    ],
    "criterion": "主语与能力事实正确，can后用原形。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：主语与能力事实正确，can后用原形。 易错边界：this与that改变指定对象。",
    "novelty": "一位女讲解员已展示能认出这只鸟，你报告她的能力。",
    "counterexamples": [
      {
        "answer": "She can identify that bird.",
        "reason": "this与that改变指定对象。"
      },
      {
        "answer": "She can identify this bird?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "She can identify this bird..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "She can to identify this bird.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "review-b-n45-cannot-do",
    "stage": "review-b",
    "target": "cannot-do",
    "kind": "input",
    "form": "statement",
    "context": "两位新学员确实修不了那辆车，你报告已核实的限制。",
    "prompt": "主语They，can的否定，repair（修）、that car（那辆车），只写否定能力句。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "They cannot repair that car.",
      "They can't repair that car.",
      "They can not repair that car."
    ],
    "criterion": "保留否定、主语及特定对象；不是不愿意或未来不做。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：保留否定、主语及特定对象；不是不愿意或未来不做。 易错边界：现在没有在修不等于不会修。",
    "novelty": "两位新学员确实修不了那辆车，你报告已核实的限制。",
    "counterexamples": [
      {
        "answer": "They are not repairing that car.",
        "reason": "现在没有在修不等于不会修。"
      },
      {
        "answer": "They cannot repair that car?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "They cannot repair that car..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "They not can repair that car.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  }
];

export const {byId,questionsFor,matches}=bindContent(lesson,questions);
