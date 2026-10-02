import {bindContent} from './content-contract.mjs';

export const lesson = {
  "id": "nce1-47",
  "version": 1,
  "book": "NCE1",
  "lessons": [
    47,
    48
  ],
  "title": "第47–48课 · 区分喜好与这次想要",
  "goal": "用Do you like询问通常喜好，用Do you want询问这次需求，并准确说明自己的肯定或否定喜好。",
  "scope": "限定题只判题目指定的主语、词汇、语义和输出形式；不排斥限定范围以外的自然英文。问句须以一个英文问号结束；陈述、命令及数量短语可省略句号或保留一个英文句号。大小写、空格及直/弯撇号不影响含义。自由表达接受自然等义句，待实际人工核对。",
  "prerequisites": [
    "已接触基本疑问、人称与单复数；do辅助的一般现在时问句为本组教学，不要求第三人称does。",
    "每题提供所需新词中文义；不根据背景推断未给出的事实。"
  ],
  "source": {
    "groupId": "NCE1-47",
    "route": "/#/nce/NCE1/47?tab=listen",
    "mapRoute": "/map/#/learn/nce1-47",
    "languagePath": "/language/NCE1/47.json",
    "languageSha256": "46817aa3ce7a008fe5960750ab061a6f56ffff2245c961fc259873df3f47d3da",
    "sourceSha256": "46817aa3ce7a008fe5960750ab061a6f56ffff2245c961fc259873df3f47d3da",
    "comicKey": "NCE1-47",
    "clips": [
      {
        "target": "ask-preference",
        "label": "听第47课相关片段 · 询问通常喜好",
        "start": 17.15,
        "end": 23.43
      },
      {
        "target": "ask-want",
        "label": "听第47课相关片段 · 询问当前想要",
        "start": 23.43,
        "end": 39.18
      },
      {
        "target": "state-preference",
        "label": "听第47课相关片段 · 说明自己的喜好",
        "start": 40.92,
        "end": 48.41
      }
    ]
  },
  "glossary": "限定题所需词义均在各题提示中；所有新情境为原创虚构，可用于角色练习。",
  "teaching": [
    {
      "target": "ask-preference",
      "title": "询问通常喜好",
      "explanation": "Do you like + 食物/活动?询问喜好；like后的不可数物或泛指复数通常不加a。问句用do，不用are；Do you want…?问这次需求。",
      "example": "Do you like oranges?",
      "meaning": "你喜欢橙子吗？",
      "check": "问的是长期喜好；do引出问句，like后对象不变。",
      "source": "ask-preference"
    },
    {
      "target": "ask-want",
      "title": "询问当前想要",
      "explanation": "Do you want + 物品?询问这次是否想要；一份可数物保留a/an，如a sandwich。不预设肯定答案的物质询问可用any。本组练中性询问；实际礼貌提供中some也可能自然，按题目的限定词作答。",
      "example": "Do you want a sandwich?",
      "meaning": "你想要一个三明治吗？",
      "check": "当前需求与通常喜好分开；保留份数和限定词。",
      "source": "ask-want"
    },
    {
      "target": "state-preference",
      "title": "说明自己的喜好",
      "explanation": "I like…表达通常喜欢；I do not/don’t like…表达不喜欢。不要用am not like或can’t like替代。喜欢某样东西不表示此刻一定想要。",
      "example": "I do not like cold soup.",
      "meaning": "我不喜欢冷汤。",
      "check": "根据真实设定保留肯定或否定；like用原形。",
      "source": "state-preference"
    }
  ],
  "own": {
    "id": "own-n47-personal-use",
    "prompt": "与伙伴谈你真实或明确虚构的食物喜好：询问通常喜欢什么，再问这次想不想要一份具体食物，说清自己的喜欢与不喜欢。让伙伴实际回答，不从喜好推断当前需求。保留首答、订正与原因。自由表达可采用自然等义形式。",
    "checks": [
      "问的是长期喜好；do引出问句，like后对象不变。",
      "当前需求与通常喜好分开；保留份数和限定词。",
      "根据真实设定保留肯定或否定；like用原形。"
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
    "id": "diagnostic-n47-ask-preference",
    "stage": "diagnostic",
    "target": "ask-preference",
    "kind": "input",
    "form": "question",
    "context": "设计午餐单前你想了解朋友通常是否喜欢酸奶，不问这次要不要。",
    "prompt": "主语you，like（喜欢）、yogurt（酸奶），只写通常喜好问句。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Do you like yogurt?"
    ],
    "criterion": "问的是长期喜好；do引出问句，like后对象不变。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：问的是长期喜好；do引出问句，like后对象不变。 易错边界：想要与通常喜欢不同。",
    "novelty": "设计午餐单前你想了解朋友通常是否喜欢酸奶，不问这次要不要。",
    "counterexamples": [
      {
        "answer": "Do you want yogurt?",
        "reason": "想要与通常喜欢不同。"
      },
      {
        "answer": "Do you like yogurt.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Do you like yogurt??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "Do you to like yogurt?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "diagnostic-n47-ask-want",
    "stage": "diagnostic",
    "target": "ask-want",
    "kind": "input",
    "form": "question",
    "context": "野餐时你正在分餐，想问朋友这一次是否想要一个三明治。",
    "prompt": "主语you，want（想要）、a sandwich（一个三明治），只写当前需求问句。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Do you want a sandwich?"
    ],
    "criterion": "当前需求与通常喜好分开；保留份数和限定词。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：当前需求与通常喜好分开；保留份数和限定词。 易错边界：通常喜好不能代替当前需求。",
    "novelty": "野餐时你正在分餐，想问朋友这一次是否想要一个三明治。",
    "counterexamples": [
      {
        "answer": "Do you like a sandwich?",
        "reason": "通常喜好不能代替当前需求。"
      },
      {
        "answer": "Do you want a sandwich.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Do you want a sandwich??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "Do you to want a sandwich?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "diagnostic-n47-state-preference",
    "stage": "diagnostic",
    "target": "state-preference",
    "kind": "input",
    "form": "statement",
    "context": "你通常不喜欢冷汤，向活动厨师说明真实设定的喜好。",
    "prompt": "主语I，like（喜欢）、cold soup（冷汤），只写否定喜好陈述。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "I do not like cold soup.",
      "I don't like cold soup."
    ],
    "criterion": "根据真实设定保留肯定或否定；like用原形。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：根据真实设定保留肯定或否定；like用原形。 易错边界：此刻不想要不能说明通常不喜欢。",
    "novelty": "你通常不喜欢冷汤，向活动厨师说明真实设定的喜好。",
    "counterexamples": [
      {
        "answer": "I do not want cold soup.",
        "reason": "此刻不想要不能说明通常不喜欢。"
      },
      {
        "answer": "I do not like cold soup?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "I do not like cold soup..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "I not like cold soup.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "guided-n47-ask-preference",
    "stage": "guided",
    "target": "ask-preference",
    "kind": "input",
    "form": "question",
    "context": "活动报名时你询问朋友一般是否喜欢胡萝卜，不问这次想要。",
    "prompt": "carrots（胡萝卜，复数）。提示：Do + you + like + 对象?。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Do you like carrots?"
    ],
    "criterion": "问的是长期喜好；do引出问句，like后对象不变。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：问的是长期喜好；do引出问句，like后对象不变。 易错边界：like为动词，用do而非are。",
    "novelty": "活动报名时你询问朋友一般是否喜欢胡萝卜，不问这次想要。",
    "counterexamples": [
      {
        "answer": "Are you like carrots?",
        "reason": "like为动词，用do而非are。"
      },
      {
        "answer": "Do you like carrots.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Do you like carrots??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "Do you to like carrots?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "guided-n47-ask-want",
    "stage": "guided",
    "target": "ask-want",
    "kind": "input",
    "form": "question",
    "context": "旅馆早餐时你问伙伴是否想要一枚鸡蛋。",
    "prompt": "an egg（一枚鸡蛋）。提示：Do + you + want + 对象?。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Do you want an egg?"
    ],
    "criterion": "当前需求与通常喜好分开；保留份数和限定词。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：当前需求与通常喜好分开；保留份数和限定词。 易错边界：egg前用an。",
    "novelty": "旅馆早餐时你问伙伴是否想要一枚鸡蛋。",
    "counterexamples": [
      {
        "answer": "Do you want a egg?",
        "reason": "egg前用an。"
      },
      {
        "answer": "Do you want an egg.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Do you want an egg??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "Do you to want an egg?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "guided-n47-state-preference",
    "stage": "guided",
    "target": "state-preference",
    "kind": "input",
    "form": "statement",
    "context": "你的设定是通常喜欢热茶，向同伴说明。",
    "prompt": "主语I，hot tea（热茶）。提示：I + like + 对象。只写肯定陈述。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "I like hot tea."
    ],
    "criterion": "根据真实设定保留肯定或否定；like用原形。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：根据真实设定保留肯定或否定；like用原形。 易错边界：否定会反转喜好。",
    "novelty": "你的设定是通常喜欢热茶，向同伴说明。",
    "counterexamples": [
      {
        "answer": "I do not like hot tea.",
        "reason": "否定会反转喜好。"
      },
      {
        "answer": "I like hot tea?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "I like hot tea..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "I likes hot tea.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "independent-n47-ask-preference",
    "stage": "independent",
    "target": "ask-preference",
    "kind": "input",
    "form": "question",
    "context": "你为朋友选活动点心，想了解他通常是否喜欢梨，未提出分餐。",
    "prompt": "主语you，like（喜欢）、pears（梨，复数），只问通常喜好。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Do you like pears?"
    ],
    "criterion": "问的是长期喜好；do引出问句，like后对象不变。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：问的是长期喜好；do引出问句，like后对象不变。 易错边界：本题问通常喜欢，不是当前要不要。",
    "novelty": "你为朋友选活动点心，想了解他通常是否喜欢梨，未提出分餐。",
    "counterexamples": [
      {
        "answer": "Do you want pears?",
        "reason": "本题问通常喜欢，不是当前要不要。"
      },
      {
        "answer": "Do you like pears.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Do you like pears??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "Do you to like pears?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "independent-n47-ask-want",
    "stage": "independent",
    "target": "ask-want",
    "kind": "input",
    "form": "question",
    "context": "工作坊休息时你端来一杯水，问伙伴这次是否想要一杯水。",
    "prompt": "主语you，want（想要）、a glass of water（一杯水），只问当前需求。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Do you want a glass of water?"
    ],
    "criterion": "当前需求与通常喜好分开；保留份数和限定词。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：当前需求与通常喜好分开；保留份数和限定词。 易错边界：不能用一般喜好替代这次需求。",
    "novelty": "工作坊休息时你端来一杯水，问伙伴这次是否想要一杯水。",
    "counterexamples": [
      {
        "answer": "Do you like a glass of water?",
        "reason": "不能用一般喜好替代这次需求。"
      },
      {
        "answer": "Do you want a glass of water.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Do you want a glass of water??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "Do you to want a glass of water?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "independent-n47-state-preference",
    "stage": "independent",
    "target": "state-preference",
    "kind": "input",
    "form": "statement",
    "context": "你设定通常不喜欢煮熟的洋葱，向食堂人员说明喜好。",
    "prompt": "主语I，like（喜欢）、cooked onions（煮熟的洋葱），只写否定陈述。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "I do not like cooked onions.",
      "I don't like cooked onions."
    ],
    "criterion": "根据真实设定保留肯定或否定；like用原形。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：根据真实设定保留肯定或否定；like用原形。 易错边界：动词like的否定用do not，不用am not。",
    "novelty": "你设定通常不喜欢煮熟的洋葱，向食堂人员说明喜好。",
    "counterexamples": [
      {
        "answer": "I am not like cooked onions.",
        "reason": "动词like的否定用do not，不用am not。"
      },
      {
        "answer": "I do not like cooked onions?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "I do not like cooked onions..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "I not like cooked onions.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "repair-n47-ask-preference",
    "stage": "repair",
    "target": "ask-preference",
    "kind": "input",
    "form": "question",
    "context": "你在筹备点心偏好调查，想了解朋友通常是否喜欢蜂蜜；这次不询问是否当场要一份。",
    "prompt": "主语you，like（喜欢）、honey（蜂蜜），只写喜好问句。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Do you like honey?"
    ],
    "criterion": "问的是长期喜好；do引出问句，like后对象不变。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：问的是长期喜好；do引出问句，like后对象不变。 易错边界：honey在本题按物质不可数。",
    "novelty": "你在筹备点心偏好调查，想了解朋友通常是否喜欢蜂蜜；这次不询问是否当场要一份。",
    "counterexamples": [
      {
        "answer": "Do you like a honey?",
        "reason": "honey在本题按物质不可数。"
      },
      {
        "answer": "Do you like honey.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Do you like honey??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "Do you to like honey?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "repair-n47-ask-want",
    "stage": "repair",
    "target": "ask-want",
    "kind": "input",
    "form": "question",
    "context": "会面时你拿来一只苹果，询问伙伴这一次是否想要一个苹果。",
    "prompt": "主语you，want（想要）、an apple（一个苹果），只写需求问句。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Do you want an apple?"
    ],
    "criterion": "当前需求与通常喜好分开；保留份数和限定词。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：当前需求与通常喜好分开；保留份数和限定词。 易错边界：一只苹果被换成复数，改变份数。",
    "novelty": "会面时你拿来一只苹果，询问伙伴这一次是否想要一个苹果。",
    "counterexamples": [
      {
        "answer": "Do you want apples?",
        "reason": "一只苹果被换成复数，改变份数。"
      },
      {
        "answer": "Do you want an apple.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Do you want an apple??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "Do you to want an apple?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "repair-n47-state-preference",
    "stage": "repair",
    "target": "state-preference",
    "kind": "input",
    "form": "statement",
    "context": "你的设定是通常喜欢脆面包，向新朋友说明。",
    "prompt": "主语I，like（喜欢）、crusty bread（脆面包），只写肯定陈述。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "I like crusty bread."
    ],
    "criterion": "根据真实设定保留肯定或否定；like用原形。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：根据真实设定保留肯定或否定；like用原形。 易错边界：想要不等于通常喜欢。",
    "novelty": "你的设定是通常喜欢脆面包，向新朋友说明。",
    "counterexamples": [
      {
        "answer": "I want crusty bread.",
        "reason": "想要不等于通常喜欢。"
      },
      {
        "answer": "I like crusty bread?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "I like crusty bread..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "I likes crusty bread.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "review-a-n47-ask-preference",
    "stage": "review-a",
    "target": "ask-preference",
    "kind": "input",
    "form": "question",
    "context": "点心调查想知道访客通常是否喜欢桃子，不询问当场领取。",
    "prompt": "主语you，like（喜欢）、peaches（桃子，复数），只写喜好问句。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Do you like peaches?"
    ],
    "criterion": "问的是长期喜好；do引出问句，like后对象不变。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：问的是长期喜好；do引出问句，like后对象不变。 易错边界：当前需求与喜好不同。",
    "novelty": "点心调查想知道访客通常是否喜欢桃子，不询问当场领取。",
    "counterexamples": [
      {
        "answer": "Do you want peaches?",
        "reason": "当前需求与喜好不同。"
      },
      {
        "answer": "Do you like peaches.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Do you like peaches??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "Do you to like peaches?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "review-a-n47-ask-want",
    "stage": "review-a",
    "target": "ask-want",
    "kind": "input",
    "form": "question",
    "context": "茶点登记表要核对这一轮饮品需求。你询问朋友现在是否想要一些果汁，不预设对方会要；不是在礼貌劝他接受一杯。",
    "prompt": "主语you，want（想要）、any juice（一些果汁）；本题规定中性询问的any。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Do you want any juice?"
    ],
    "criterion": "当前需求与通常喜好分开；保留份数和限定词。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：当前需求与通常喜好分开；保留份数和限定词。 易错边界：本题按物质并指定any，不指一份果汁。",
    "novelty": "茶点登记表要核对这一轮饮品需求。你询问朋友现在是否想要一些果汁，不预设对方会要；不是在礼貌劝他接受一杯。",
    "counterexamples": [
      {
        "answer": "Do you want a juice?",
        "reason": "本题按物质并指定any，不指一份果汁。"
      },
      {
        "answer": "Do you want any juice.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Do you want any juice??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "Do you to want any juice?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "review-a-n47-state-preference",
    "stage": "review-a",
    "target": "state-preference",
    "kind": "input",
    "form": "statement",
    "context": "你通常不喜欢咸黄油，在这次讨论中说明喜好设定。",
    "prompt": "主语I，like（喜欢）、salted butter（咸黄油），只写否定喜好句。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "I do not like salted butter.",
      "I don't like salted butter."
    ],
    "criterion": "根据真实设定保留肯定或否定；like用原形。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：根据真实设定保留肯定或否定；like用原形。 易错边界：能力或不可能不是一般喜好否定。",
    "novelty": "你通常不喜欢咸黄油，在这次讨论中说明喜好设定。",
    "counterexamples": [
      {
        "answer": "I cannot like salted butter.",
        "reason": "能力或不可能不是一般喜好否定。"
      },
      {
        "answer": "I do not like salted butter?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "I do not like salted butter..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "I not like salted butter.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "review-b-n47-ask-preference",
    "stage": "review-b",
    "target": "ask-preference",
    "kind": "input",
    "form": "question",
    "context": "你设计一份早餐问卷，询问访客通常是否喜欢燕麦粥。",
    "prompt": "主语you，like（喜欢）、porridge（燕麦粥），只写喜好问句。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Do you like porridge?"
    ],
    "criterion": "问的是长期喜好；do引出问句，like后对象不变。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：问的是长期喜好；do引出问句，like后对象不变。 易错边界：改成过去，未问通常喜好。",
    "novelty": "你设计一份早餐问卷，询问访客通常是否喜欢燕麦粥。",
    "counterexamples": [
      {
        "answer": "Did you like porridge?",
        "reason": "改成过去，未问通常喜好。"
      },
      {
        "answer": "Do you like porridge.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Do you like porridge??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "Do you to like porridge?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "review-b-n47-ask-want",
    "stage": "review-b",
    "target": "ask-want",
    "kind": "input",
    "form": "question",
    "context": "晚间读书会你递出一个面包卷，问伙伴这次是否想要一只。",
    "prompt": "主语you，want（想要）、a bread roll（一个面包卷），只写需求问句。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Do you want a bread roll?"
    ],
    "criterion": "当前需求与通常喜好分开；保留份数和限定词。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：当前需求与通常喜好分开；保留份数和限定词。 易错边界：喜好问题不是这次需求。",
    "novelty": "晚间读书会你递出一个面包卷，问伙伴这次是否想要一只。",
    "counterexamples": [
      {
        "answer": "Do you like a bread roll?",
        "reason": "喜好问题不是这次需求。"
      },
      {
        "answer": "Do you want a bread roll.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Do you want a bread roll??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "Do you to want a bread roll?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "review-b-n47-state-preference",
    "stage": "review-b",
    "target": "state-preference",
    "kind": "input",
    "form": "statement",
    "context": "你的设定是通常喜欢新鲜水果，向接待员说明。",
    "prompt": "主语I，like（喜欢）、fresh fruit（新鲜水果），只写肯定喜好句。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "I like fresh fruit."
    ],
    "criterion": "根据真实设定保留肯定或否定；like用原形。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：根据真实设定保留肯定或否定；like用原形。 易错边界：此处通常喜好不用进行时。",
    "novelty": "你的设定是通常喜欢新鲜水果，向接待员说明。",
    "counterexamples": [
      {
        "answer": "I am liking fresh fruit.",
        "reason": "此处通常喜好不用进行时。"
      },
      {
        "answer": "I like fresh fruit?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "I like fresh fruit..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "I likes fresh fruit.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  }
];

export const {byId,questionsFor,matches}=bindContent(lesson,questions);
