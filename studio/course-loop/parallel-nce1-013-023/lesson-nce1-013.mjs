import {bindContent} from './content-contract.mjs';
export const lesson = {
  "id": "nce1-13",
  "version": 1,
  "book": "NCE1",
  "lessons": [
    13,
    14
  ],
  "title": "第 13–14 课 · 问颜色，分清他的和她的",
  "goal": "询问一件物品的颜色，使用his/her说明明确物主，并以it回答已确认的颜色。",
  "scope": "本课核对有限文字任务；未匹配仅表示未完成本题限定要求。自然自由表达由伙伴核对，不从文字记录推断听力、发音或长期掌握。",
  "prerequisites": [
    "已接触单数与复数、be及人称代词；所需词义和事实在题内给出。"
  ],
  "source": {
    "groupId": "NCE1-13",
    "route": "/#/nce/NCE1/13?tab=listen",
    "mapRoute": "/map/#/learn/nce1-13",
    "languagePath": "/language/NCE1/13.json",
    "languageSha256": "6a7c5c324a0a891c2fb0b7dc430ed2f38a3c99d3cc6ba526adbbc49e780dc0a7",
    "comicKey": "NCE1-13",
    "clips": [
      {
        "target": "colour-question",
        "label": "听单件物品的颜色问句",
        "start": 16.67,
        "end": 20.46
      },
      {
        "target": "possessive-colour",
        "label": "听my说明自己的物品（his/her练习见14课）",
        "start": 36.16,
        "end": 39.22
      },
      {
        "target": "it-colour",
        "label": "听it回答颜色",
        "start": 44.18,
        "end": 47.12
      }
    ],
    "grammarPages": [
      30,
      31,
      32
    ]
  },
  "teaching": [
    {
      "target": "colour-question",
      "title": "问未知颜色",
      "explanation": "What colour is + 单数物品?问颜色。is也可缩为前一个词后的's。也可说What is the colour of the scarf?colour和color两种拼写均可；问号不能改成句号。",
      "example": "What colour is the scarf? / What color is the scarf?",
      "meaning": "那条围巾是什么颜色的？",
      "check": "物品单数用is；颜色尚未确认时发问。",
      "source": "colour-question"
    },
    {
      "target": "possessive-colour",
      "title": "his与her取决于物主",
      "explanation": "his表示明确以he指代的物主的，her表示明确以she指代的物主的。物主事实决定代词，不凭物品猜。一般现在时：His/Her + 单数物品 + is + 颜色，物品后的's也可表示is。",
      "example": "Her bag is grey. / Her bag's gray.",
      "meaning": "她的包是灰色的。",
      "check": "物主、人称与颜色都与已确认事实一致。",
      "source": "possessive-colour"
    },
    {
      "target": "it-colour",
      "title": "同一件物品用it",
      "explanation": "问题中只有一件明确物品时，用It is + 颜色回答，也可缩写为It's。不是人用he/she，也不要因颜色词后省掉名词而改用are。",
      "example": "It is orange. / It's orange.",
      "meaning": "它是橙色的。",
      "check": "It指刚才问的单件物品，is与当前颜色齐全。",
      "source": "it-colour"
    }
  ],
  "own": {
    "id": "own-n13",
    "prompt": "向伙伴问一件实际或明确虚构物品的颜色；听到答复后，用it转述。再说明一位明确物主的物品颜色，用his或her；先确认物主的指代。留下实际表达，未知颜色先问，不猜。",
    "checks": [
      "物品单数用is；颜色尚未确认时发问。",
      "物主、人称与颜色都与已确认事实一致。",
      "It指刚才问的单件物品，is与当前颜色齐全。"
    ],
    "status": "awaiting-human-review",
    "reviewerPrompt": "请伙伴或老师实际读或听表达，核对事实、指代和句式；接受自然等义表达。未确认的信息不要猜测。"
  },
  "intervals": {
    "first": 86400000,
    "repair": 86400000,
    "subsequent": 604800000
  },
  "rights": "original-authored",
  "contentStatus": "authored-independent-ai-blind-reviewed"
};
export const questions = [
  {
    "context": "网购取货时，店员拿出你的一件新外套，颜色还看不清。你问店员自己的新外套是什么颜色。",
    "prompt": "问“我的新外套是什么颜色的？”，coat=外套，new=新的，用my指自己。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "accepted": [
      "What colour is my new coat?",
      "What colour's my new coat?",
      "What color is my new coat?",
      "What color's my new coat?",
      "What is the colour of my new coat?",
      "What's the colour of my new coat?",
      "What is my new coat's colour?",
      "What's my new coat's colour?",
      "What is the color of my new coat?",
      "What's the color of my new coat?",
      "What is my new coat's color?",
      "What's my new coat's color?"
    ],
    "counterexamples": [
      {
        "answer": "What colour are my new coat?",
        "reason": "单数coat要用is。"
      },
      {
        "answer": "What colour is your new coat?",
        "reason": "your改变了物主。"
      },
      {
        "answer": "What colour is my new coat.",
        "reason": "题目要求询问颜色。"
      }
    ],
    "why": "my把提问的物品限定为说话者自己的外套。",
    "form": "question",
    "id": "diagnostic-n13-colour-question",
    "stage": "diagnostic",
    "target": "colour-question",
    "kind": "input",
    "criterion": "问“我的新外套是什么颜色的？”，coat=外套，new=新的，用my指自己。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "novelty": "网购取货时，店员拿出你的一件新外套，颜色还看不清。你问店员自己的新外套是什么颜色。"
  },
  {
    "context": "衣物修补台：Ava明确以she指代。她确认自己的帽子是白色，Leo的帽子是黑色。你只报告Ava帽子的颜色。",
    "prompt": "用her指Ava，说“她的帽子是白色的”，hat=帽子，white=白色的。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "Her hat is white.",
      "Her hat's white."
    ],
    "counterexamples": [
      {
        "answer": "His hat is white.",
        "reason": "his改变了明确物主的指代。"
      },
      {
        "answer": "Her hat is black.",
        "reason": "黑色属于另一人的帽子。"
      },
      {
        "answer": "Her hat was white.",
        "reason": "was把当前事实改为过去。"
      }
    ],
    "why": "her依据Ava明确的she指代，颜色依据她的确认。",
    "form": "statement",
    "id": "diagnostic-n13-possessive-colour",
    "stage": "diagnostic",
    "target": "possessive-colour",
    "kind": "input",
    "criterion": "用her指Ava，说“她的帽子是白色的”，hat=帽子，white=白色的。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "衣物修补台：Ava明确以she指代。她确认自己的帽子是白色，Leo的帽子是黑色。你只报告Ava帽子的颜色。"
  },
  {
    "context": "礼品店只讨论一条丝巾。伙伴问它是什么颜色，你已看清它是黄色。",
    "prompt": "用it作主语回答“它是黄色的”，yellow=黄色的。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "It is yellow.",
      "It's yellow."
    ],
    "counterexamples": [
      {
        "answer": "They are yellow.",
        "reason": "只有一条丝巾。"
      },
      {
        "answer": "It is green.",
        "reason": "颜色与黄色不符。"
      },
      {
        "answer": "It is yellow?",
        "reason": "你在报告已看清的事实。"
      }
    ],
    "why": "it指当前唯一的丝巾；is表示现在的颜色。",
    "form": "statement",
    "id": "diagnostic-n13-it-colour",
    "stage": "diagnostic",
    "target": "it-colour",
    "kind": "input",
    "criterion": "用it作主语回答“它是黄色的”，yellow=黄色的。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "礼品店只讨论一条丝巾。伙伴问它是什么颜色，你已看清它是黄色。"
  },
  {
    "context": "拍摄前，你想核对搭档自己带来的包是什么颜色；包属于听你提问的搭档。",
    "prompt": "向搭档问“你的包是什么颜色的？”，bag=包。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "accepted": [
      "What colour is your bag?",
      "What colour's your bag?",
      "What color is your bag?",
      "What color's your bag?",
      "What is the colour of your bag?",
      "What's the colour of your bag?",
      "What is your bag's colour?",
      "What's your bag's colour?",
      "What is the color of your bag?",
      "What's the color of your bag?",
      "What is your bag's color?",
      "What's your bag's color?"
    ],
    "counterexamples": [
      {
        "answer": "What colour is my bag?",
        "reason": "my会问自己的包。"
      },
      {
        "answer": "What colour was your bag?",
        "reason": "问的是当前颜色。"
      },
      {
        "answer": "Your bag is what colour.",
        "reason": "题目限定一个问句。"
      }
    ],
    "why": "your指听者的包；问未知颜色要保留疑问。",
    "form": "question",
    "id": "guided-n13-colour-question",
    "stage": "guided",
    "target": "colour-question",
    "kind": "input",
    "criterion": "向搭档问“你的包是什么颜色的？”，bag=包。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "novelty": "拍摄前，你想核对搭档自己带来的包是什么颜色；包属于听你提问的搭档。"
  },
  {
    "context": "体育馆收衣服：Noah明确以he指代。他的衬衫是蓝色，Ava的衬衫是红色。现在报告Noah的衬衫。",
    "prompt": "用his说“他的衬衫是蓝色的”，shirt=衬衫，blue=蓝色的。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "His shirt is blue.",
      "His shirt's blue."
    ],
    "counterexamples": [
      {
        "answer": "Her shirt is blue.",
        "reason": "her改变了Noah的指代。"
      },
      {
        "answer": "His shirts are blue.",
        "reason": "题目只有一件衬衫。"
      },
      {
        "answer": "His shirt is not blue.",
        "reason": "否定与已确认的蓝色事实相反。"
      }
    ],
    "why": "his明确属于Noah；单件shirt用is。",
    "form": "statement",
    "id": "guided-n13-possessive-colour",
    "stage": "guided",
    "target": "possessive-colour",
    "kind": "input",
    "criterion": "用his说“他的衬衫是蓝色的”，shirt=衬衫，blue=蓝色的。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "体育馆收衣服：Noah明确以he指代。他的衬衫是蓝色，Ava的衬衫是红色。现在报告Noah的衬衫。"
  },
  {
    "context": "园艺课给一个花盆上色，伙伴问这个花盆的颜色；你确认它当前是红色。",
    "prompt": "用it回答“它是红色的”，red=红色的。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "It is red.",
      "It's red."
    ],
    "counterexamples": [
      {
        "answer": "It red.",
        "reason": "缺少be。"
      },
      {
        "answer": "It was red.",
        "reason": "当前事实不改过去。"
      },
      {
        "answer": "She is red.",
        "reason": "物品用it，不用she。"
      }
    ],
    "why": "It is或It's都可以说明这个单件花盆的颜色。",
    "form": "statement",
    "id": "guided-n13-it-colour",
    "stage": "guided",
    "target": "it-colour",
    "kind": "input",
    "criterion": "用it回答“它是红色的”，red=红色的。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "园艺课给一个花盆上色，伙伴问这个花盆的颜色；你确认它当前是红色。"
  },
  {
    "context": "剧场为你寄存的一条围巾仍在布袋内。你要问自己的围巾颜色，以便核对编号。",
    "prompt": "问“我的围巾是什么颜色的？”，scarf=围巾。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "accepted": [
      "What colour is my scarf?",
      "What colour's my scarf?",
      "What color is my scarf?",
      "What color's my scarf?",
      "What is the colour of my scarf?",
      "What's the colour of my scarf?",
      "What is my scarf's colour?",
      "What's my scarf's colour?",
      "What is the color of my scarf?",
      "What's the color of my scarf?",
      "What is my scarf's color?",
      "What's my scarf's color?"
    ],
    "counterexamples": [
      {
        "answer": "What colour is her scarf?",
        "reason": "her改变了物主。"
      },
      {
        "answer": "What colour are my scarf?",
        "reason": "scarf是单数。"
      },
      {
        "answer": "What colour is my scarf!",
        "reason": "本题要明确发问。"
      }
    ],
    "why": "寄存位置不能说明颜色；my保留自己的物主身份。",
    "form": "question",
    "id": "independent-n13-colour-question",
    "stage": "independent",
    "target": "colour-question",
    "kind": "input",
    "criterion": "问“我的围巾是什么颜色的？”，scarf=围巾。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "novelty": "剧场为你寄存的一条围巾仍在布袋内。你要问自己的围巾颜色，以便核对编号。"
  },
  {
    "context": "旅行集合时，Mia明确以she指代，她的行李箱是棕色，同行者的是灰色。你只报告Mia的箱子。",
    "prompt": "用her说“她的行李箱是棕色的”，case=行李箱，brown=棕色的。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "Her case is brown.",
      "Her case's brown."
    ],
    "counterexamples": [
      {
        "answer": "His case is brown.",
        "reason": "his改变了物主指代。"
      },
      {
        "answer": "Her case is grey.",
        "reason": "灰色属于同行者。"
      },
      {
        "answer": "Is her case brown?",
        "reason": "本题报告事实，不作询问。"
      }
    ],
    "why": "物主和颜色都有明确依据，不能从同行者转移颜色。",
    "form": "statement",
    "id": "independent-n13-possessive-colour",
    "stage": "independent",
    "target": "possessive-colour",
    "kind": "input",
    "criterion": "用her说“她的行李箱是棕色的”，case=行李箱，brown=棕色的。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "旅行集合时，Mia明确以she指代，她的行李箱是棕色，同行者的是灰色。你只报告Mia的箱子。"
  },
  {
    "context": "修车店只谈一辆自行车。师傅问它是什么颜色，你知道它是黑色。",
    "prompt": "用it回答“它是黑色的”，black=黑色的。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "It is black.",
      "It's black."
    ],
    "counterexamples": [
      {
        "answer": "It is white.",
        "reason": "颜色不符。"
      },
      {
        "answer": "It are black.",
        "reason": "it用is。"
      },
      {
        "answer": "It is not black.",
        "reason": "否定改变了事实。"
      }
    ],
    "why": "it指当前自行车；black对应已确认颜色。",
    "form": "statement",
    "id": "independent-n13-it-colour",
    "stage": "independent",
    "target": "it-colour",
    "kind": "input",
    "criterion": "用it回答“它是黑色的”，black=黑色的。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "修车店只谈一辆自行车。师傅问它是什么颜色，你知道它是黑色。"
  },
  {
    "context": "失物管理员拿着听者的一把伞，但颜色被罩子挡住。你向听者问他的伞颜色。",
    "prompt": "问“你的雨伞是什么颜色的？”，umbrella=雨伞。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "accepted": [
      "What colour is your umbrella?",
      "What colour's your umbrella?",
      "What color is your umbrella?",
      "What color's your umbrella?",
      "What is the colour of your umbrella?",
      "What's the colour of your umbrella?",
      "What is your umbrella's colour?",
      "What's your umbrella's colour?",
      "What is the color of your umbrella?",
      "What's the color of your umbrella?",
      "What is your umbrella's color?",
      "What's your umbrella's color?"
    ],
    "counterexamples": [
      {
        "answer": "What colour is my umbrella?",
        "reason": "物主不是说话者。"
      },
      {
        "answer": "What colour is your umbrellas?",
        "reason": "这里是一把伞。"
      },
      {
        "answer": "What colour is your umbrella.",
        "reason": "句号未满足本题发问要求。"
      }
    ],
    "why": "your指对面听者，umbrella是一件物品。",
    "form": "question",
    "id": "repair-n13-colour-question",
    "stage": "repair",
    "target": "colour-question",
    "kind": "input",
    "criterion": "问“你的雨伞是什么颜色的？”，umbrella=雨伞。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "novelty": "失物管理员拿着听者的一把伞，但颜色被罩子挡住。你向听者问他的伞颜色。"
  },
  {
    "context": "校服登记中，Eli明确以he指代。他的领带是绿色，Noah的领带是黄色。你报告Eli的领带。",
    "prompt": "用his说“他的领带是绿色的”，tie=领带，green=绿色的。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "His tie is green.",
      "His tie's green."
    ],
    "counterexamples": [
      {
        "answer": "Her tie is green.",
        "reason": "物主以he指代。"
      },
      {
        "answer": "His tie is yellow.",
        "reason": "黄色属于Noah。"
      },
      {
        "answer": "His tie green.",
        "reason": "缺少is或它的缩写。"
      }
    ],
    "why": "his不能因为名字相近或颜色喜好而变化。",
    "form": "statement",
    "id": "repair-n13-possessive-colour",
    "stage": "repair",
    "target": "possessive-colour",
    "kind": "input",
    "criterion": "用his说“他的领带是绿色的”，tie=领带，green=绿色的。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "校服登记中，Eli明确以he指代。他的领带是绿色，Noah的领带是黄色。你报告Eli的领带。"
  },
  {
    "context": "舞台负责人只问一面旗子的颜色；你已确认这面旗子是蓝色。",
    "prompt": "用it回答“它是蓝色的”，blue=蓝色的。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "It is blue.",
      "It's blue."
    ],
    "counterexamples": [
      {
        "answer": "It is red.",
        "reason": "蓝色不能改红色。"
      },
      {
        "answer": "They are blue.",
        "reason": "只谈一面旗子。"
      },
      {
        "answer": "It is blue??",
        "reason": "陈述不能带疑问。"
      }
    ],
    "why": "it保留单件旗子的指代。",
    "form": "statement",
    "id": "repair-n13-it-colour",
    "stage": "repair",
    "target": "it-colour",
    "kind": "input",
    "criterion": "用it回答“它是蓝色的”，blue=蓝色的。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "舞台负责人只问一面旗子的颜色；你已确认这面旗子是蓝色。"
  },
  {
    "context": "洗衣房中，听者的一件连衣裙装在不透明袋内。你询问颜色以找对应衣架。",
    "prompt": "问“你的连衣裙是什么颜色的？”，dress=连衣裙。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "accepted": [
      "What colour is your dress?",
      "What colour's your dress?",
      "What color is your dress?",
      "What color's your dress?",
      "What is the colour of your dress?",
      "What's the colour of your dress?",
      "What is your dress's colour?",
      "What's your dress's colour?",
      "What is the color of your dress?",
      "What's the color of your dress?",
      "What is your dress's color?",
      "What's your dress's color?"
    ],
    "counterexamples": [
      {
        "answer": "What colour is his dress?",
        "reason": "题目直接询问听者的物品。"
      },
      {
        "answer": "What colour was your dress?",
        "reason": "询问的是当前颜色。"
      },
      {
        "answer": "What colour is your dress?!",
        "reason": "本题只允许一个问号。"
      }
    ],
    "why": "your指定听者，颜色是待确认的信息。",
    "form": "question",
    "id": "review-a-n13-colour-question",
    "stage": "review-a",
    "target": "colour-question",
    "kind": "input",
    "criterion": "问“你的连衣裙是什么颜色的？”，dress=连衣裙。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "novelty": "洗衣房中，听者的一件连衣裙装在不透明袋内。你询问颜色以找对应衣架。"
  },
  {
    "context": "艺术课材料核对：Bea明确以she指代，她自己的围裙是橙色，旁边借来的围裙是蓝色。你说Bea自己的围裙。",
    "prompt": "用her说“她的围裙是橙色的”，apron=围裙，orange=橙色的。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "Her apron is orange.",
      "Her apron's orange."
    ],
    "counterexamples": [
      {
        "answer": "His apron is orange.",
        "reason": "his改变物主指代。"
      },
      {
        "answer": "Her apron is blue.",
        "reason": "蓝色属于借来的另一件。"
      },
      {
        "answer": "Her apron will be orange.",
        "reason": "未来时不是当前事实。"
      }
    ],
    "why": "明确的物主和当前颜色同时保留。",
    "form": "statement",
    "id": "review-a-n13-possessive-colour",
    "stage": "review-a",
    "target": "possessive-colour",
    "kind": "input",
    "criterion": "用her说“她的围裙是橙色的”，apron=围裙，orange=橙色的。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "艺术课材料核对：Bea明确以she指代，她自己的围裙是橙色，旁边借来的围裙是蓝色。你说Bea自己的围裙。"
  },
  {
    "context": "包装台上只核对一个礼盒。对方问颜色；你确认这个盒子是紫色。",
    "prompt": "用it回答“它是紫色的”，purple=紫色的。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "It is purple.",
      "It's purple."
    ],
    "counterexamples": [
      {
        "answer": "It is pink.",
        "reason": "pink与purple不同。"
      },
      {
        "answer": "It am purple.",
        "reason": "it用is。"
      },
      {
        "answer": "Is it purple?",
        "reason": "你在回答颜色，不重新提问。"
      }
    ],
    "why": "回答针对唯一礼盒，It's与It is同义。",
    "form": "statement",
    "id": "review-a-n13-it-colour",
    "stage": "review-a",
    "target": "it-colour",
    "kind": "input",
    "criterion": "用it回答“它是紫色的”，purple=紫色的。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "包装台上只核对一个礼盒。对方问颜色；你确认这个盒子是紫色。"
  },
  {
    "context": "咖啡馆外，听者的新自行车仍罩着车罩。你问听者这辆新自行车的颜色。",
    "prompt": "问“你的新自行车是什么颜色的？”，new=新的，bike=自行车。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "accepted": [
      "What colour is your new bike?",
      "What colour's your new bike?",
      "What color is your new bike?",
      "What color's your new bike?",
      "What is the colour of your new bike?",
      "What's the colour of your new bike?",
      "What is your new bike's colour?",
      "What's your new bike's colour?",
      "What is the color of your new bike?",
      "What's the color of your new bike?",
      "What is your new bike's color?",
      "What's your new bike's color?"
    ],
    "counterexamples": [
      {
        "answer": "What colour is my new bike?",
        "reason": "物主改变了。"
      },
      {
        "answer": "What colour are your new bike?",
        "reason": "一辆自行车用is。"
      },
      {
        "answer": "What colour is your new bike",
        "reason": "题目要求末尾问号。"
      }
    ],
    "why": "问听者物品用your，保留new以识别本题对象。",
    "form": "question",
    "id": "review-b-n13-colour-question",
    "stage": "review-b",
    "target": "colour-question",
    "kind": "input",
    "criterion": "问“你的新自行车是什么颜色的？”，new=新的，bike=自行车。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "novelty": "咖啡馆外，听者的新自行车仍罩着车罩。你问听者这辆新自行车的颜色。"
  },
  {
    "context": "行李标记时，Owen明确以he指代。他的背包是灰色，Mia的背包是绿色。你报告Owen的背包。",
    "prompt": "用his说“他的背包是灰色的”，backpack=背包，grey/gray=灰色的。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "His backpack is grey.",
      "His backpack's grey.",
      "His backpack is gray.",
      "His backpack's gray."
    ],
    "counterexamples": [
      {
        "answer": "Her backpack is grey.",
        "reason": "物主指代改变了。"
      },
      {
        "answer": "His backpack is green.",
        "reason": "绿色属于Mia。"
      },
      {
        "answer": "His backpack is grey?",
        "reason": "已确认事实要求陈述。"
      }
    ],
    "why": "grey和gray是同一颜色的两种拼写。",
    "form": "statement",
    "id": "review-b-n13-possessive-colour",
    "stage": "review-b",
    "target": "possessive-colour",
    "kind": "input",
    "criterion": "用his说“他的背包是灰色的”，backpack=背包，grey/gray=灰色的。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "行李标记时，Owen明确以he指代。他的背包是灰色，Mia的背包是绿色。你报告Owen的背包。"
  },
  {
    "context": "展览布置只谈一张桌布。对方问颜色，你确认它是白色。",
    "prompt": "用it回答“它是白色的”，white=白色的。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "It is white.",
      "It's white."
    ],
    "counterexamples": [
      {
        "answer": "It is black.",
        "reason": "颜色相反。"
      },
      {
        "answer": "We are white.",
        "reason": "we指人群，不能指这张桌布。"
      },
      {
        "answer": "It is not white.",
        "reason": "否定与事实相反。"
      }
    ],
    "why": "it指唯一桌布，不指说话者或听者。",
    "form": "statement",
    "id": "review-b-n13-it-colour",
    "stage": "review-b",
    "target": "it-colour",
    "kind": "input",
    "criterion": "用it回答“它是白色的”，white=白色的。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "展览布置只谈一张桌布。对方问颜色，你确认它是白色。"
  }
];
export const {byId,questionsFor,matches}=bindContent(lesson,questions);
