import {bindContent} from './content-contract.mjs';

export const lesson = {
  "id": "nce1-39",
  "version": 1,
  "book": "NCE1",
  "lessons": [
    39,
    40
  ],
  "title": "第39–40课 · 说明物品处置计划并制止错误动作",
  "goal": "询问对物品的处置打算，说明计划中的位置或接收者，用否定祈使制止不合适的动作。",
  "scope": "本组计划限定题指定使用be going to，表示已决定但未开始的打算。will等其他自然未来表达可在开放表达中核对，不作为该限定句型题的参考。限定题只判题目指定的主语、词汇、语义和输出形式；不排斥限定范围以外的自然英文。问句须以一个英文问号结束；陈述、命令及数量短语可省略句号或保留一个英文句号。大小写、空格及直/弯撇号不影响含义。自由表达接受自然等义句，待实际人工核对。",
  "prerequisites": [
    "已接触第37–38课be going to，并学习基本祈使、it/them及位置短语。",
    "每题提供所需新词中文义；不根据背景推断未给出的事实。"
  ],
  "source": {
    "groupId": "NCE1-39",
    "route": "/#/nce/NCE1/39?tab=listen",
    "mapRoute": "/map/#/learn/nce1-39",
    "languagePath": "/language/NCE1/39.json",
    "languageSha256": "7663f4778d846c82e1094926e259d0d589bce091f834a39b488fa5994d8c342b",
    "sourceSha256": "7663f4778d846c82e1094926e259d0d589bce091f834a39b488fa5994d8c342b",
    "comicKey": "NCE1-39",
    "clips": [
      {
        "target": "ask-disposal",
        "label": "听第39课相关片段 · 询问怎样处置",
        "start": 18.55,
        "end": 24.02
      },
      {
        "target": "planned-transfer",
        "label": "听第39课相关片段 · 说明下一步放置或转交",
        "start": 24.02,
        "end": 29.15
      },
      {
        "target": "negative-command",
        "label": "听第39课相关片段 · 制止某个动作",
        "start": 43.03,
        "end": 50.31
      }
    ]
  },
  "glossary": "限定题所需词义均在各题提示中；所有新情境为原创虚构，可用于角色练习。",
  "teaching": [
    {
      "target": "ask-disposal",
      "title": "询问怎样处置",
      "explanation": "What are you going to do with + 物品?询问打算怎样处置它。with说明对象；it指一个已明确物品，them指多个。不要把计划问成正在做。",
      "example": "What are you going to do with those tickets?",
      "meaning": "你准备怎样处置那些票？",
      "check": "保留对象、with及计划疑问语序。",
      "source": "ask-disposal"
    },
    {
      "target": "planned-transfer",
      "title": "说明下一步放置或转交",
      "explanation": "计划用be going to + 原形。put后保留目的位置；give/show/send + it/them + to + 接收者也可写give/show/send + 接收者 + it/them。位置或接收者是计划的重要信息。",
      "example": "I am going to send it to my cousin.",
      "meaning": "我准备把它寄给我表亲。",
      "check": "尚未实施；it/them对应数量，位置或接收者不变。",
      "source": "planned-transfer"
    },
    {
      "target": "negative-command",
      "title": "制止某个动作",
      "explanation": "直接制止用Do not/Don’t + 动词原形。不加主语或be，不写成一个自己不打算做的陈述。put it there与put it here方向不同；代词宾语置于turn it on/off中间。",
      "example": "Do not open that box.",
      "meaning": "不要打开那个箱子。",
      "check": "明确制止对方；保留否定与动作对象。",
      "source": "negative-command"
    }
  ],
  "own": {
    "id": "own-n39-personal-use",
    "prompt": "设定一件或几件自己的物品：询问伙伴准备怎样处置它们，说清你的放置或转交计划，再给出一条合适的否定提醒。说清it/them指谁，未知事实先问。保留首答、订正与原因。自由表达可采用自然等义形式。",
    "checks": [
      "保留对象、with及计划疑问语序。",
      "尚未实施；it/them对应数量，位置或接收者不变。",
      "明确制止对方；保留否定与动作对象。"
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
    "id": "diagnostic-n39-ask-disposal",
    "stage": "diagnostic",
    "target": "ask-disposal",
    "kind": "input",
    "form": "question",
    "context": "仓库伙伴拿着一卷绳子，还未使用。你想问他准备怎样处置那卷绳子。",
    "prompt": "主语you，以What开头，保留with that rope（那卷绳子），问处置打算。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。 本题计划形式指定用be going to。",
    "accepted": [
      "What are you going to do with that rope?"
    ],
    "criterion": "保留对象、with及计划疑问语序。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：保留对象、with及计划疑问语序。 易错边界：改成询问已经在做的动作。",
    "novelty": "仓库伙伴拿着一卷绳子，还未使用。你想问他准备怎样处置那卷绳子。",
    "counterexamples": [
      {
        "answer": "What are you doing with that rope?",
        "reason": "改成询问已经在做的动作。"
      },
      {
        "answer": "What are you going to do with that rope.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "What are you going to do with that rope??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "What is you going to do with that rope?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "diagnostic-n39-planned-transfer",
    "stage": "diagnostic",
    "target": "planned-transfer",
    "kind": "input",
    "form": "statement",
    "context": "你决定稍后把已提过的一块板放在长凳上，现在还未搬。",
    "prompt": "主语I，用it指板，put（放），on the bench（长凳上），报告计划。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。 本题计划形式指定用be going to。",
    "accepted": [
      "I am going to put it on the bench.",
      "I'm going to put it on the bench."
    ],
    "criterion": "尚未实施；it/them对应数量，位置或接收者不变。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：尚未实施；it/them对应数量，位置或接收者不变。 易错边界：目的位置从上面变成下面。",
    "novelty": "你决定稍后把已提过的一块板放在长凳上，现在还未搬。",
    "counterexamples": [
      {
        "answer": "I am going to put it under the bench.",
        "reason": "目的位置从上面变成下面。"
      },
      {
        "answer": "I am going to put it on the bench?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "I am going to put it on the bench..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "I am going put it on the bench.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "diagnostic-n39-negative-command",
    "stage": "diagnostic",
    "target": "negative-command",
    "kind": "input",
    "form": "imperative",
    "context": "档案封套正由伙伴持着，你要立即制止他折叠这份文件。",
    "prompt": "直接说“不要折叠它”，用fold（折叠）、it；只写一句否定命令，不加称呼或please。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "Do not fold it.",
      "Don't fold it."
    ],
    "criterion": "明确制止对方；保留否定与动作对象。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：明确制止对方；保留否定与动作对象。 易错边界：删掉否定会要求相反动作。",
    "novelty": "档案封套正由伙伴持着，你要立即制止他折叠这份文件。",
    "counterexamples": [
      {
        "answer": "Fold it.",
        "reason": "删掉否定会要求相反动作。"
      },
      {
        "answer": "Do not fold it?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "Do not fold it..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "Do not to fold it.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "guided-n39-ask-disposal",
    "stage": "guided",
    "target": "ask-disposal",
    "kind": "input",
    "form": "question",
    "context": "伙伴拿着几张海报，未决定用途，你问他准备怎样处置那些海报。",
    "prompt": "主语you，with those posters（那些海报）。提示：What + are + you + going to do with + 对象?。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。 本题计划形式指定用be going to。",
    "accepted": [
      "What are you going to do with those posters?"
    ],
    "criterion": "保留对象、with及计划疑问语序。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：保留对象、with及计划疑问语序。 易错边界：问成当前动作。",
    "novelty": "伙伴拿着几张海报，未决定用途，你问他准备怎样处置那些海报。",
    "counterexamples": [
      {
        "answer": "What are you doing with those posters?",
        "reason": "问成当前动作。"
      },
      {
        "answer": "What are you going to do with those posters.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "What are you going to do with those posters??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "What is you going to do with those posters?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "guided-n39-planned-transfer",
    "stage": "guided",
    "target": "planned-transfer",
    "kind": "input",
    "form": "statement",
    "context": "你决定稍后把已提过的一份节目单展示给队长，现在还没展示。",
    "prompt": "主语I，show（展示），it，to the captain（给队长）。提示：I am going to + 原形 + it + to接收者，也可用双宾语。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。 本题计划形式指定用be going to。",
    "accepted": [
      "I am going to show it to the captain.",
      "I'm going to show it to the captain.",
      "I am going to show the captain it.",
      "I'm going to show the captain it."
    ],
    "criterion": "尚未实施；it/them对应数量，位置或接收者不变。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：尚未实施；it/them对应数量，位置或接收者不变。 易错边界：把接收者队长改成教练。",
    "novelty": "你决定稍后把已提过的一份节目单展示给队长，现在还没展示。",
    "counterexamples": [
      {
        "answer": "I am going to show it to the coach.",
        "reason": "把接收者队长改成教练。"
      },
      {
        "answer": "I am going to show it to the captain?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "I am going to show it to the captain..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "I am going show it to the captain.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "guided-n39-negative-command",
    "stage": "guided",
    "target": "negative-command",
    "kind": "input",
    "form": "imperative",
    "context": "展板电源现在需要关闭，你制止伙伴打开它。",
    "prompt": "只写“不要打开它”，turn（开关）、it、on。提示：Do not/Don't + turn + it + on。不加please。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "Do not turn it on.",
      "Don't turn it on."
    ],
    "criterion": "明确制止对方；保留否定与动作对象。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：明确制止对方；保留否定与动作对象。 易错边界：制止关闭与制止打开相反。",
    "novelty": "展板电源现在需要关闭，你制止伙伴打开它。",
    "counterexamples": [
      {
        "answer": "Do not turn it off.",
        "reason": "制止关闭与制止打开相反。"
      },
      {
        "answer": "Do not turn it on?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "Do not turn it on..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "Do not to turn it on.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "independent-n39-ask-disposal",
    "stage": "independent",
    "target": "ask-disposal",
    "kind": "input",
    "form": "question",
    "context": "你遇见一位新队员拿着几只空箱子，想问他准备怎样处置那些箱子。",
    "prompt": "主语you，以What开头，with those crates（那些箱子），询问计划。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。 本题计划形式指定用be going to。",
    "accepted": [
      "What are you going to do with those crates?"
    ],
    "criterion": "保留对象、with及计划疑问语序。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：保留对象、with及计划疑问语序。 易错边界：他还未处置，不能问成正在做。",
    "novelty": "你遇见一位新队员拿着几只空箱子，想问他准备怎样处置那些箱子。",
    "counterexamples": [
      {
        "answer": "What are you doing with those crates?",
        "reason": "他还未处置，不能问成正在做。"
      },
      {
        "answer": "What are you going to do with those crates.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "What are you going to do with those crates??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "What is you going to do with those crates?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "independent-n39-planned-transfer",
    "stage": "independent",
    "target": "planned-transfer",
    "kind": "input",
    "form": "statement",
    "context": "你与伙伴决定稍后把已提过的几张卡片寄给表亲，卡片还在你们手中。",
    "prompt": "主语We，send（寄），them，to our cousin（给我们的表亲），只说计划。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。 本题计划形式指定用be going to。",
    "accepted": [
      "We are going to send them to our cousin.",
      "We're going to send them to our cousin.",
      "We are going to send our cousin them.",
      "We're going to send our cousin them."
    ],
    "criterion": "尚未实施；it/them对应数量，位置或接收者不变。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：尚未实施；it/them对应数量，位置或接收者不变。 易错边界：几张卡片不能改为单数it。",
    "novelty": "你与伙伴决定稍后把已提过的几张卡片寄给表亲，卡片还在你们手中。",
    "counterexamples": [
      {
        "answer": "We are going to send it to our cousin.",
        "reason": "几张卡片不能改为单数it。"
      },
      {
        "answer": "We are going to send them to our cousin?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "We are going to send them to our cousin..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "We are going send them to our cousin.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "independent-n39-negative-command",
    "stage": "independent",
    "target": "negative-command",
    "kind": "input",
    "form": "imperative",
    "context": "门后有正在搬运的器材，你要制止伙伴推这扇门。",
    "prompt": "直接写“不要推那扇门”，push（推）、that door（那扇门）；不加please。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "Do not push that door.",
      "Don't push that door."
    ],
    "criterion": "明确制止对方；保留否定与动作对象。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：明确制止对方；保留否定与动作对象。 易错边界：拉与推是不同动作。",
    "novelty": "门后有正在搬运的器材，你要制止伙伴推这扇门。",
    "counterexamples": [
      {
        "answer": "Do not pull that door.",
        "reason": "拉与推是不同动作。"
      },
      {
        "answer": "Do not push that door?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "Do not push that door..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "Do not to push that door.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "repair-n39-ask-disposal",
    "stage": "repair",
    "target": "ask-disposal",
    "kind": "input",
    "form": "question",
    "context": "一位同伴拿着已提过的一件模型，你问他接下来准备怎样处置它。",
    "prompt": "主语you，以What开头，对象用with it，问处置打算。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。 本题计划形式指定用be going to。",
    "accepted": [
      "What are you going to do with it?"
    ],
    "criterion": "保留对象、with及计划疑问语序。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：保留对象、with及计划疑问语序。 易错边界：一个模型不能变成多个对象。",
    "novelty": "一位同伴拿着已提过的一件模型，你问他接下来准备怎样处置它。",
    "counterexamples": [
      {
        "answer": "What are you going to do with them?",
        "reason": "一个模型不能变成多个对象。"
      },
      {
        "answer": "What are you going to do with it.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "What are you going to do with it??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "What is you going to do with it?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "repair-n39-planned-transfer",
    "stage": "repair",
    "target": "planned-transfer",
    "kind": "input",
    "form": "statement",
    "context": "你决定下一步把几件已提过的道具放在储物柜里，现在还未移动。",
    "prompt": "主语I，put（放），them，in the locker（储物柜里），说明计划。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。 本题计划形式指定用be going to。",
    "accepted": [
      "I am going to put them in the locker.",
      "I'm going to put them in the locker."
    ],
    "criterion": "尚未实施；it/them对应数量，位置或接收者不变。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：尚未实施；it/them对应数量，位置或接收者不变。 易错边界：里面与柜子顶上不同。",
    "novelty": "你决定下一步把几件已提过的道具放在储物柜里，现在还未移动。",
    "counterexamples": [
      {
        "answer": "I am going to put them on the locker.",
        "reason": "里面与柜子顶上不同。"
      },
      {
        "answer": "I am going to put them in the locker?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "I am going to put them in the locker..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "I am going put them in the locker.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "repair-n39-negative-command",
    "stage": "repair",
    "target": "negative-command",
    "kind": "input",
    "form": "imperative",
    "context": "实验用的小盒需要保持关闭，你制止同伴打开那个盒子。",
    "prompt": "直接写“不要打开那个盒子”，open（打开）、that box（那个盒子），不加please。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "Do not open that box.",
      "Don't open that box."
    ],
    "criterion": "明确制止对方；保留否定与动作对象。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：明确制止对方；保留否定与动作对象。 易错边界：丢失否定反转要求。",
    "novelty": "实验用的小盒需要保持关闭，你制止同伴打开那个盒子。",
    "counterexamples": [
      {
        "answer": "Open that box.",
        "reason": "丢失否定反转要求。"
      },
      {
        "answer": "Do not open that box?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "Do not open that box..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "Do not to open that box.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "review-a-n39-ask-disposal",
    "stage": "review-a",
    "target": "ask-disposal",
    "kind": "input",
    "form": "question",
    "context": "活动结束后有人提着一个旧头盔，下一步用途不明，你询问处置计划。",
    "prompt": "主语you，以What开头，with that helmet（那个头盔），只问计划。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。 本题计划形式指定用be going to。",
    "accepted": [
      "What are you going to do with that helmet?"
    ],
    "criterion": "保留对象、with及计划疑问语序。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：保留对象、with及计划疑问语序。 易错边界：处置计划不等于正在处置。",
    "novelty": "活动结束后有人提着一个旧头盔，下一步用途不明，你询问处置计划。",
    "counterexamples": [
      {
        "answer": "What are you doing with that helmet?",
        "reason": "处置计划不等于正在处置。"
      },
      {
        "answer": "What are you going to do with that helmet.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "What are you going to do with that helmet??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "What is you going to do with that helmet?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "review-a-n39-planned-transfer",
    "stage": "review-a",
    "target": "planned-transfer",
    "kind": "input",
    "form": "statement",
    "context": "你和同伴决定稍后把已提过的一件礼物送给导师，尚未交出。",
    "prompt": "主语We，give（给），it，to our mentor（给我们的导师），说明打算。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。 本题计划形式指定用be going to。",
    "accepted": [
      "We are going to give it to our mentor.",
      "We're going to give it to our mentor.",
      "We are going to give our mentor it.",
      "We're going to give our mentor it."
    ],
    "criterion": "尚未实施；it/them对应数量，位置或接收者不变。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：尚未实施；it/them对应数量，位置或接收者不变。 易错边界：我们的导师变成了他们的导师。",
    "novelty": "你和同伴决定稍后把已提过的一件礼物送给导师，尚未交出。",
    "counterexamples": [
      {
        "answer": "We are going to give it to their mentor.",
        "reason": "我们的导师变成了他们的导师。"
      },
      {
        "answer": "We are going to give it to our mentor?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "We are going to give it to our mentor..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "We are going give it to our mentor.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "review-a-n39-negative-command",
    "stage": "review-a",
    "target": "negative-command",
    "kind": "input",
    "form": "imperative",
    "context": "伙伴准备移动一枚刚粘好的标签，你要制止他触摸它。",
    "prompt": "只写“不要碰它”，touch（碰）、it，直接否定命令；不加please。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "Do not touch it.",
      "Don't touch it."
    ],
    "criterion": "明确制止对方；保留否定与动作对象。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：明确制止对方；保留否定与动作对象。 易错边界：一个标签被改成多个对象。",
    "novelty": "伙伴准备移动一枚刚粘好的标签，你要制止他触摸它。",
    "counterexamples": [
      {
        "answer": "Do not touch them.",
        "reason": "一个标签被改成多个对象。"
      },
      {
        "answer": "Do not touch it?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "Do not touch it..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "Do not to touch it.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "review-b-n39-ask-disposal",
    "stage": "review-b",
    "target": "ask-disposal",
    "kind": "input",
    "form": "question",
    "context": "两名同伴持着已提过的多张照片，你问他们打算怎样处置这些照片。",
    "prompt": "以What开头，主语you，对象用with them，问下一步打算。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。 本题计划形式指定用be going to。",
    "accepted": [
      "What are you going to do with them?"
    ],
    "criterion": "保留对象、with及计划疑问语序。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：保留对象、with及计划疑问语序。 易错边界：多张照片不能写单数it。",
    "novelty": "两名同伴持着已提过的多张照片，你问他们打算怎样处置这些照片。",
    "counterexamples": [
      {
        "answer": "What are you going to do with it?",
        "reason": "多张照片不能写单数it。"
      },
      {
        "answer": "What are you going to do with them.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "What are you going to do with them??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "What is you going to do with them?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "review-b-n39-planned-transfer",
    "stage": "review-b",
    "target": "planned-transfer",
    "kind": "input",
    "form": "statement",
    "context": "你决定稍后把已提过的地图展示给来访者们，现在还没展示。",
    "prompt": "主语I，show（展示），it，to the visitors（给来访者们），只写计划。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。 本题计划形式指定用be going to。",
    "accepted": [
      "I am going to show it to the visitors.",
      "I'm going to show it to the visitors.",
      "I am going to show the visitors it.",
      "I'm going to show the visitors it."
    ],
    "criterion": "尚未实施；it/them对应数量，位置或接收者不变。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：尚未实施；it/them对应数量，位置或接收者不变。 易错边界：尚未展示，不能报告正在展示。",
    "novelty": "你决定稍后把已提过的地图展示给来访者们，现在还没展示。",
    "counterexamples": [
      {
        "answer": "I am showing it to the visitors.",
        "reason": "尚未展示，不能报告正在展示。"
      },
      {
        "answer": "I am going to show it to the visitors?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "I am going to show it to the visitors..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "I am going show it to the visitors.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "review-b-n39-negative-command",
    "stage": "review-b",
    "target": "negative-command",
    "kind": "input",
    "form": "imperative",
    "context": "一个充电装置需要保持工作，你制止同伴关闭它。",
    "prompt": "直接写“不要关闭它”，turn（开关）、it、off，不加please。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "Do not turn it off.",
      "Don't turn it off."
    ],
    "criterion": "明确制止对方；保留否定与动作对象。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：明确制止对方；保留否定与动作对象。 易错边界：制止打开与制止关闭相反。",
    "novelty": "一个充电装置需要保持工作，你制止同伴关闭它。",
    "counterexamples": [
      {
        "answer": "Do not turn it on.",
        "reason": "制止打开与制止关闭相反。"
      },
      {
        "answer": "Do not turn it off?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "Do not turn it off..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "Do not to turn it off.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  }
];

export const {byId,questionsFor,matches}=bindContent(lesson,questions);
