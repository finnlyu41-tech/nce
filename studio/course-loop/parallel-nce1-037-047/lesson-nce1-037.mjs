import {bindContent} from './content-contract.mjs';

export const lesson = {
  "id": "nce1-37",
  "version": 1,
  "book": "NCE1",
  "lessons": [
    37,
    38
  ],
  "title": "第37–38课 · 区分正在做与准备做",
  "goal": "把正在发生的动作与尚未开始的计划区分，并询问伙伴下一步的活动、对象、颜色或目的位置。",
  "scope": "本组计划限定题指定使用be going to，表示已决定但未开始的打算。will等其他自然未来表达可在开放表达中核对，不作为该限定句型题的参考。限定题只判题目指定的主语、词汇、语义和输出形式；不排斥限定范围以外的自然英文。问句须以一个英文问号结束；陈述、命令及数量短语可省略句号或保留一个英文句号。大小写、空格及直/弯撇号不影响含义。自由表达接受自然等义句，待实际人工核对。",
  "prerequisites": [
    "已学习第31–36课现在进行时、be人称形式和基本疑问语序。",
    "每题提供所需新词中文义；不根据背景推断未给出的事实。"
  ],
  "source": {
    "groupId": "NCE1-37",
    "route": "/#/nce/NCE1/37?tab=listen",
    "mapRoute": "/map/#/learn/nce1-37",
    "languagePath": "/language/NCE1/37.json",
    "languageSha256": "9c809290e12e66d091ea22cb8886817bdfd56899cefb90376ebb0814913ff281",
    "sourceSha256": "9c809290e12e66d091ea22cb8886817bdfd56899cefb90376ebb0814913ff281",
    "comicKey": "NCE1-37",
    "clips": [
      {
        "target": "current-action",
        "label": "听第37课相关片段 · 现在正在做",
        "start": 20.72,
        "end": 26.81
      },
      {
        "target": "future-intent",
        "label": "听第37课相关片段 · 已经决定但还未开始",
        "start": 43.51,
        "end": 51.12
      },
      {
        "target": "ask-plan",
        "label": "听第37课相关片段 · 询问接下来的计划",
        "start": 43.51,
        "end": 59.5
      }
    ]
  },
  "glossary": "限定题所需词义均在各题提示中；所有新情境为原创虚构，可用于角色练习。",
  "teaching": [
    {
      "target": "current-action",
      "title": "现在正在做",
      "explanation": "已经开始、此刻仍在做的动作用主语 + am/is/are + 动词-ing；be与主语对应。不能把正在做的画面说成尚未开始的计划。",
      "example": "We are packing the bags.",
      "meaning": "我们正在收拾这些包。",
      "check": "核对动作已开始；用对应be和-ing。",
      "source": "current-action"
    },
    {
      "target": "future-intent",
      "title": "已经决定但还未开始",
      "explanation": "已决定、接下来要做的事用主语 + am/is/are going to + 动词原形。going to后的动词不能再变-ing。这里表示打算，不表示正在行走。",
      "example": "She is going to repair the bike.",
      "meaning": "她准备修这辆自行车。",
      "check": "核对尚未开始的意图；be对应主语，to后动词原形。",
      "source": "future-intent"
    },
    {
      "target": "ask-plan",
      "title": "询问接下来的计划",
      "explanation": "询问计划用疑问词 + am/is/are + 主语 + going to + 动词原形?。What…going to do?问下一步活动；What…going to pack?问准备打包的物品；What colour…going to paint…?问计划的颜色；Where…going to put…?问计划目的位置。be移到主语前，不能省略going to把计划误问成当前动作。 现在进行时在其他语境也可表示将来安排；本组计划限定题明确指定be going to，反馈只按这一练习边界核对。",
      "example": "What are they going to do?",
      "meaning": "他们准备做什么？",
      "check": "疑问词对应所缺信息；保留going to及原形，be对应主语。",
      "source": "ask-plan"
    }
  ],
  "own": {
    "id": "own-n37-personal-use",
    "prompt": "选择你真实的一项活动或明确虚构的安排：说一件正在做的事与一件准备但未开始的事，再问伙伴下一步准备做什么。请对方实际回应，核对动作时间，不知道就先确认。保留首答、订正与原因。自由表达可采用自然等义形式。",
    "checks": [
      "核对动作已开始；用对应be和-ing。",
      "核对尚未开始的意图；be对应主语，to后动词原形。",
      "问的是计划；保留going to do和疑问语序。"
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
    "id": "diagnostic-n37-current-action",
    "stage": "diagnostic",
    "target": "current-action",
    "kind": "input",
    "form": "statement",
    "context": "你在志愿者库房通过视频说明现场：你此刻正把一堆标签分类，已经开始。",
    "prompt": "以I为主语，sort（分类），the labels（这些标签），报告眼下动作。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "I am sorting the labels.",
      "I'm sorting the labels."
    ],
    "criterion": "核对动作已开始；用对应be和-ing。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：核对动作已开始；用对应be和-ing。 易错边界：计划尚未开始，和现场已在进行不同。",
    "novelty": "你在志愿者库房通过视频说明现场：你此刻正把一堆标签分类，已经开始。",
    "counterexamples": [
      {
        "answer": "I am going to sort the labels.",
        "reason": "计划尚未开始，和现场已在进行不同。"
      },
      {
        "answer": "I am sorting the labels?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "I am sorting the labels..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "I sorting the labels.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "diagnostic-n37-future-intent",
    "stage": "diagnostic",
    "target": "future-intent",
    "kind": "input",
    "form": "statement",
    "context": "社区花园协调员已经决定稍后修一扇门，工具仍未取出。你报告她的打算。",
    "prompt": "主语She，repair（修），the gate（这扇门），说明尚未开始的计划。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。 本题计划形式指定用be going to。",
    "accepted": [
      "She is going to repair the gate.",
      "She's going to repair the gate."
    ],
    "criterion": "核对尚未开始的意图；be对应主语，to后动词原形。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：核对尚未开始的意图；be对应主语，to后动词原形。 易错边界：把未开始的计划写成眼下动作。 这里的拒绝依据是题目明确指定be going to；其他语境的现在进行时也可表示将来安排。",
    "novelty": "社区花园协调员已经决定稍后修一扇门，工具仍未取出。你报告她的打算。",
    "counterexamples": [
      {
        "answer": "She is repairing the gate.",
        "reason": "把未开始的计划写成眼下动作。 本题明确指定be going to；并非断言现在进行时在所有语境都不能表达将来。"
      },
      {
        "answer": "She is going to repair the gate?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "She is going to repair the gate..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "She is going repair the gate.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "diagnostic-n37-ask-plan",
    "stage": "diagnostic",
    "target": "ask-plan",
    "kind": "input",
    "form": "question",
    "context": "两名伙伴在课程结束后已安排下一项任务，你想问他们准备做什么。",
    "prompt": "用they指这两人，以What询问接下来准备做什么。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。 本题计划形式指定用be going to。",
    "accepted": [
      "What are they going to do?"
    ],
    "criterion": "问的是计划；保留going to do和疑问语序。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：疑问词对应所缺信息；保留going to及原形，be对应主语。 易错边界：问成当前动作，未问下一步打算。 这里的拒绝依据是题目明确指定be going to；其他语境的现在进行时也可表示将来安排。",
    "novelty": "两名伙伴在课程结束后已安排下一项任务，你想问他们准备做什么。",
    "counterexamples": [
      {
        "answer": "What are they doing?",
        "reason": "问成当前动作，未问下一步打算。 本题明确指定be going to；并非断言现在进行时在所有语境都不能表达将来。"
      },
      {
        "answer": "What are they going to do.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "What are they going to do??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "What is they going to do?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "guided-n37-current-action",
    "stage": "guided",
    "target": "current-action",
    "kind": "input",
    "form": "statement",
    "context": "你的露营伙伴问现场进度：你们已开始把行李装好，仍在整理。",
    "prompt": "主语We，pack（收拾），the bags（这些包）。提示：We + are + 动词-ing + 宾语。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "We are packing the bags.",
      "We're packing the bags."
    ],
    "criterion": "核对动作已开始；用对应be和-ing。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：核对动作已开始；用对应be和-ing。 易错边界：已在进行而不是未开始。",
    "novelty": "你的露营伙伴问现场进度：你们已开始把行李装好，仍在整理。",
    "counterexamples": [
      {
        "answer": "We are going to pack the bags.",
        "reason": "已在进行而不是未开始。"
      },
      {
        "answer": "We are packing the bags?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "We are packing the bags..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "We is packing the bags.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "guided-n37-future-intent",
    "stage": "guided",
    "target": "future-intent",
    "kind": "input",
    "form": "statement",
    "context": "一位男队员决定下一步给植物浇水，现在还在拿水壶。",
    "prompt": "主语He，water（浇水），the plants（这些植物）。提示：He + is going to + 原形。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。 本题计划形式指定用be going to。",
    "accepted": [
      "He is going to water the plants.",
      "He's going to water the plants."
    ],
    "criterion": "核对尚未开始的意图；be对应主语，to后动词原形。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：核对尚未开始的意图；be对应主语，to后动词原形。 易错边界：决定稍后做不等于已经正在浇。 这里的拒绝依据是题目明确指定be going to；其他语境的现在进行时也可表示将来安排。",
    "novelty": "一位男队员决定下一步给植物浇水，现在还在拿水壶。",
    "counterexamples": [
      {
        "answer": "He is watering the plants.",
        "reason": "决定稍后做不等于已经正在浇。 本题明确指定be going to；并非断言现在进行时在所有语境都不能表达将来。"
      },
      {
        "answer": "He is going to water the plants?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "He is going to water the plants..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "He is going water the plants.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "guided-n37-ask-plan",
    "stage": "guided",
    "target": "ask-plan",
    "kind": "input",
    "form": "question",
    "context": "你问一位访客结束登记后准备做什么，不问眼下在做什么。",
    "prompt": "主语you，以What问计划。提示：What + are + you + going to do?。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。 本题计划形式指定用be going to。",
    "accepted": [
      "What are you going to do?"
    ],
    "criterion": "问的是计划；保留going to do和疑问语序。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：疑问词对应所缺信息；保留going to及原形，be对应主语。 易错边界：把接下来计划混成此刻动作。 这里的拒绝依据是题目明确指定be going to；其他语境的现在进行时也可表示将来安排。",
    "novelty": "你问一位访客结束登记后准备做什么，不问眼下在做什么。",
    "counterexamples": [
      {
        "answer": "What are you doing?",
        "reason": "把接下来计划混成此刻动作。 本题明确指定be going to；并非断言现在进行时在所有语境都不能表达将来。"
      },
      {
        "answer": "What are you going to do.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "What are you going to do??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "What is you going to do?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "independent-n37-current-action",
    "stage": "independent",
    "target": "current-action",
    "kind": "input",
    "form": "statement",
    "context": "在线协作时你看见两名同伴手里拿着卡片，正核对编号；用they报告。",
    "prompt": "主语They，check（核对），the cards（这些卡片），报告正在进行的动作。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "They are checking the cards.",
      "They're checking the cards."
    ],
    "criterion": "核对动作已开始；用对应be和-ing。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：核对动作已开始；用对应be和-ing。 易错边界：核对已经开始，不能只说打算。",
    "novelty": "在线协作时你看见两名同伴手里拿着卡片，正核对编号；用they报告。",
    "counterexamples": [
      {
        "answer": "They are going to check the cards.",
        "reason": "核对已经开始，不能只说打算。"
      },
      {
        "answer": "They are checking the cards?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "They are checking the cards..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "They is checking the cards.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "independent-n37-future-intent",
    "stage": "independent",
    "target": "future-intent",
    "kind": "input",
    "form": "statement",
    "context": "你已经决定活动结束后清洁帐篷，但现场帐篷还没打开。",
    "prompt": "主语I，clean（清洁），the tent（这个帐篷），说明未开始的计划。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。 本题计划形式指定用be going to。",
    "accepted": [
      "I am going to clean the tent.",
      "I'm going to clean the tent."
    ],
    "criterion": "核对尚未开始的意图；be对应主语，to后动词原形。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：核对尚未开始的意图；be对应主语，to后动词原形。 易错边界：清洁尚未开始。 这里的拒绝依据是题目明确指定be going to；其他语境的现在进行时也可表示将来安排。",
    "novelty": "你已经决定活动结束后清洁帐篷，但现场帐篷还没打开。",
    "counterexamples": [
      {
        "answer": "I am cleaning the tent.",
        "reason": "清洁尚未开始。 本题明确指定be going to；并非断言现在进行时在所有语境都不能表达将来。"
      },
      {
        "answer": "I am going to clean the tent?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "I am going to clean the tent..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "I am going clean the tent.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "independent-n37-ask-plan",
    "stage": "independent",
    "target": "ask-plan",
    "kind": "input",
    "form": "question",
    "context": "活动队友已决定她要打包某样东西，还未开始。你知道是打包计划，只缺具体物品信息，向协调员询问。",
    "prompt": "以What开头，主语she，pack（打包）；只问她准备打包什么，不泛问她准备做什么。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。 本题计划形式指定用be going to。",
    "accepted": [
      "What is she going to pack?",
      "What's she going to pack?"
    ],
    "criterion": "疑问词对应所缺信息；保留going to及原形，be对应主语。 句末一个英文问号。",
    "why": "本题要求：疑问词对应所缺信息；保留going to及原形，be对应主语。 易错边界：问成当前正打包什么，未问未开始的计划。 这里的拒绝依据是题目明确指定be going to；其他语境的现在进行时也可表示将来安排。",
    "novelty": "活动队友已决定她要打包某样东西，还未开始。你知道是打包计划，只缺具体物品信息，向协调员询问。",
    "counterexamples": [
      {
        "answer": "What is she packing?",
        "reason": "问成当前正打包什么，未问未开始的计划。 本题明确指定be going to；并非断言现在进行时在所有语境都不能表达将来。"
      },
      {
        "answer": "What is she going to pack.",
        "reason": "本题要求完整问句的一个英文问号。"
      },
      {
        "answer": "What is she going to pack??",
        "reason": "本题句末只允许一个英文问号。"
      },
      {
        "answer": "What is she going pack?",
        "reason": "计划结构缺少to。"
      }
    ]
  },
  {
    "id": "repair-n37-current-action",
    "stage": "repair",
    "target": "current-action",
    "kind": "input",
    "form": "statement",
    "context": "活动现场一位女志愿者已经开始打印地图，打印机仍在工作。",
    "prompt": "主语She，print（打印），the maps（这些地图），只报告当前动作。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "She is printing the maps.",
      "She's printing the maps."
    ],
    "criterion": "核对动作已开始；用对应be和-ing。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：核对动作已开始；用对应be和-ing。 易错边界：实际在打印，与仅计划打印不同。",
    "novelty": "活动现场一位女志愿者已经开始打印地图，打印机仍在工作。",
    "counterexamples": [
      {
        "answer": "She is going to print the maps.",
        "reason": "实际在打印，与仅计划打印不同。"
      },
      {
        "answer": "She is printing the maps?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "She is printing the maps..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "She are printing the maps.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "repair-n37-future-intent",
    "stage": "repair",
    "target": "future-intent",
    "kind": "input",
    "form": "statement",
    "context": "你和同伴决定下一站采访导游，现在仍未到导游处。",
    "prompt": "主语We，interview（采访），the guide（这位导游），说明计划。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。 本题计划形式指定用be going to。",
    "accepted": [
      "We are going to interview the guide.",
      "We're going to interview the guide."
    ],
    "criterion": "核对尚未开始的意图；be对应主语，to后动词原形。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：核对尚未开始的意图；be对应主语，to后动词原形。 易错边界：未到场，不能说正在采访。 这里的拒绝依据是题目明确指定be going to；其他语境的现在进行时也可表示将来安排。",
    "novelty": "你和同伴决定下一站采访导游，现在仍未到导游处。",
    "counterexamples": [
      {
        "answer": "We are interviewing the guide.",
        "reason": "未到场，不能说正在采访。 本题明确指定be going to；并非断言现在进行时在所有语境都不能表达将来。"
      },
      {
        "answer": "We are going to interview the guide?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "We are going to interview the guide..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "We are going interview the guide.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "repair-n37-ask-plan",
    "stage": "repair",
    "target": "ask-plan",
    "kind": "input",
    "form": "question",
    "context": "你向协调员询问一位男学生接下来准备做什么；你不是直接对这位学生发问。",
    "prompt": "用he指学生，以What问下一步准备做什么。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。 本题计划形式指定用be going to。",
    "accepted": [
      "What is he going to do?",
      "What's he going to do?"
    ],
    "criterion": "问的是计划；保留going to do和疑问语序。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：疑问词对应所缺信息；保留going to及原形，be对应主语。 易错边界：计划与当前动作问句不同。 这里的拒绝依据是题目明确指定be going to；其他语境的现在进行时也可表示将来安排。",
    "novelty": "你向协调员询问一位男学生接下来准备做什么；你不是直接对这位学生发问。",
    "counterexamples": [
      {
        "answer": "What is he doing?",
        "reason": "计划与当前动作问句不同。 本题明确指定be going to；并非断言现在进行时在所有语境都不能表达将来。"
      },
      {
        "answer": "What is he going to do.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "What is he going to do??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "What are he going to do?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "review-a-n37-current-action",
    "stage": "review-a",
    "target": "current-action",
    "kind": "input",
    "form": "statement",
    "context": "展览布置期间你此刻正在给海报编号，已写了几个编号。",
    "prompt": "主语I，number（编号），the posters（这些海报），只报告正在进行的动作。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "I am numbering the posters.",
      "I'm numbering the posters."
    ],
    "criterion": "核对动作已开始；用对应be和-ing。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：核对动作已开始；用对应be和-ing。 易错边界：编号已开始，不是只有打算。",
    "novelty": "展览布置期间你此刻正在给海报编号，已写了几个编号。",
    "counterexamples": [
      {
        "answer": "I am going to number the posters.",
        "reason": "编号已开始，不是只有打算。"
      },
      {
        "answer": "I am numbering the posters?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "I am numbering the posters..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "I numbering the posters.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "review-a-n37-future-intent",
    "stage": "review-a",
    "target": "future-intent",
    "kind": "input",
    "form": "statement",
    "context": "两位伙伴商量好稍后收集钥匙，现在还在听说明。",
    "prompt": "主语They，collect（收集），the keys（这些钥匙），说明未开始的安排。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。 本题计划形式指定用be going to。",
    "accepted": [
      "They are going to collect the keys.",
      "They're going to collect the keys."
    ],
    "criterion": "核对尚未开始的意图；be对应主语，to后动词原形。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：核对尚未开始的意图；be对应主语，to后动词原形。 易错边界：尚未开始的收集不能说正在做。 这里的拒绝依据是题目明确指定be going to；其他语境的现在进行时也可表示将来安排。",
    "novelty": "两位伙伴商量好稍后收集钥匙，现在还在听说明。",
    "counterexamples": [
      {
        "answer": "They are collecting the keys.",
        "reason": "尚未开始的收集不能说正在做。 本题明确指定be going to；并非断言现在进行时在所有语境都不能表达将来。"
      },
      {
        "answer": "They are going to collect the keys?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "They are going to collect the keys..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "They are going collect the keys.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "review-a-n37-ask-plan",
    "stage": "review-a",
    "target": "ask-plan",
    "kind": "input",
    "form": "question",
    "context": "队友已决定之后给围栏刷漆，油漆尚未开罐。你已知活动与对象，只缺计划颜色，直接问队友。",
    "prompt": "主语you，paint（刷漆），the fence（围栏）；以What colour询问准备刷成什么颜色。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。 本题计划形式指定用be going to。",
    "accepted": [
      "What colour are you going to paint the fence?"
    ],
    "criterion": "疑问词对应所缺信息；保留going to及原形，be对应主语。 句末一个英文问号。",
    "why": "本题要求：疑问词对应所缺信息；保留going to及原形，be对应主语。 易错边界：刷漆尚未开始；当前动作问句未表达准备刷成什么颜色。 这里的拒绝依据是题目明确指定be going to；其他语境的现在进行时也可表示将来安排。",
    "novelty": "队友已决定之后给围栏刷漆，油漆尚未开罐。你已知活动与对象，只缺计划颜色，直接问队友。",
    "counterexamples": [
      {
        "answer": "What colour are you painting the fence?",
        "reason": "刷漆尚未开始；当前动作问句未表达准备刷成什么颜色。 本题明确指定be going to；并非断言现在进行时在所有语境都不能表达将来。"
      },
      {
        "answer": "What colour are you going to paint the fence.",
        "reason": "本题要求完整问句的一个英文问号。"
      },
      {
        "answer": "What colour are you going to paint the fence??",
        "reason": "本题句末只允许一个英文问号。"
      },
      {
        "answer": "What colour are you going paint the fence?",
        "reason": "计划结构缺少to。"
      }
    ]
  },
  {
    "id": "review-b-n37-current-action",
    "stage": "review-b",
    "target": "current-action",
    "kind": "input",
    "form": "statement",
    "context": "水边教学中你和伙伴正测量绳子，尺子已铺好且正在读数。",
    "prompt": "主语We，measure（测量），the rope（这条绳），报告当前动作。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "We are measuring the rope.",
      "We're measuring the rope."
    ],
    "criterion": "核对动作已开始；用对应be和-ing。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：核对动作已开始；用对应be和-ing。 易错边界：读数正在进行，计划表达不符。",
    "novelty": "水边教学中你和伙伴正测量绳子，尺子已铺好且正在读数。",
    "counterexamples": [
      {
        "answer": "We are going to measure the rope.",
        "reason": "读数正在进行，计划表达不符。"
      },
      {
        "answer": "We are measuring the rope?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "We are measuring the rope..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "We is measuring the rope.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "review-b-n37-future-intent",
    "stage": "review-b",
    "target": "future-intent",
    "kind": "input",
    "form": "statement",
    "context": "一位女讲解员决定晚些时候翻译通知，现在仍在看资料。",
    "prompt": "主语She，translate（翻译），the notice（这份通知），说明尚未开始的计划。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。 本题计划形式指定用be going to。",
    "accepted": [
      "She is going to translate the notice.",
      "She's going to translate the notice."
    ],
    "criterion": "核对尚未开始的意图；be对应主语，to后动词原形。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：核对尚未开始的意图；be对应主语，to后动词原形。 易错边界：看资料不等于已经翻译。 这里的拒绝依据是题目明确指定be going to；其他语境的现在进行时也可表示将来安排。",
    "novelty": "一位女讲解员决定晚些时候翻译通知，现在仍在看资料。",
    "counterexamples": [
      {
        "answer": "She is translating the notice.",
        "reason": "看资料不等于已经翻译。 本题明确指定be going to；并非断言现在进行时在所有语境都不能表达将来。"
      },
      {
        "answer": "She is going to translate the notice?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "She is going to translate the notice..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "She is going translate the notice.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "review-b-n37-ask-plan",
    "stage": "review-b",
    "target": "ask-plan",
    "kind": "input",
    "form": "question",
    "context": "学生已决定之后把椅子移到某个位置，现在还在听安排。你已知活动和对象，只缺计划目的位置，向老师询问。",
    "prompt": "主语they，put（放），the chairs（这些椅子）；以Where询问准备把椅子放在哪里。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。 本题计划形式指定用be going to。",
    "accepted": [
      "Where are they going to put the chairs?"
    ],
    "criterion": "疑问词对应所缺信息；保留going to及原形，be对应主语。 句末一个英文问号。",
    "why": "本题要求：疑问词对应所缺信息；保留going to及原形，be对应主语。 易错边界：尚未移动，当前动作询问未问出准备放的位置。 这里的拒绝依据是题目明确指定be going to；其他语境的现在进行时也可表示将来安排。",
    "novelty": "学生已决定之后把椅子移到某个位置，现在还在听安排。你已知活动和对象，只缺计划目的位置，向老师询问。",
    "counterexamples": [
      {
        "answer": "Where are they putting the chairs?",
        "reason": "尚未移动，当前动作询问未问出准备放的位置。 本题明确指定be going to；并非断言现在进行时在所有语境都不能表达将来。"
      },
      {
        "answer": "Where are they going to put the chairs.",
        "reason": "本题要求完整问句的一个英文问号。"
      },
      {
        "answer": "Where are they going to put the chairs??",
        "reason": "本题句末只允许一个英文问号。"
      },
      {
        "answer": "Where are they going put the chairs?",
        "reason": "计划结构缺少to。"
      }
    ]
  }
];

export const {byId,questionsFor,matches}=bindContent(lesson,questions);
