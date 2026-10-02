import {bindContent} from './content-contract.mjs';

export const lesson = {
  "id": "nce1-29",
  "version": 1,
  "book": "NCE1",
  "lessons": [
    29,
    30
  ],
  "title": "第29–30课 · 问清任务并给出动作指令",
  "goal": "用What must…do?问必须完成的任务；用must加原形说明义务；用动词原形给出明确指令。",
  "scope": "练习题使用原创的虚构场景。自动核对仅覆盖题目明确限定的文字句式；题设外的自然表达需人核对。教材课文、原声和漫画可按本组入口查看；文字结果不证明听说能力或掌握程度。",
  "prerequisites": [
    "认识I/you/he/she/it/we/they及be的基本搭配。",
    "先读本题提供的事实和词义；不从姓名或画面推测未说明的信息。"
  ],
  "source": {
    "groupId": "NCE1-29",
    "route": "/#/nce/NCE1/29?tab=listen",
    "mapRoute": "/map/#/learn/nce1-29",
    "languagePath": "/language/NCE1/29.json",
    "languageSha256": "05a9e64329557d12651888eb57a8b64f513e34137bb0f9444ce85abbe231f1d7",
    "comicKey": "NCE1-29",
    "clips": [
      {
        "target": "must-question",
        "label": "听询问必须完成的任务",
        "start": 26.83,
        "end": 30.53
      },
      {
        "target": "must-action",
        "label": "听规定动作，练习用must转述义务",
        "start": 39.69,
        "end": 42.81
      },
      {
        "target": "imperative-action",
        "label": "听两个动作的直接指令",
        "start": 30.53,
        "end": 34.92
      }
    ]
  },
  "glossary": "must 必须（本组按明确规则）；do 做；open 打开；shut 关闭；put 放；sweep 扫；make the bed 铺床；clothes 衣服；then 然后；please 请。",
  "teaching": [
    {
      "target": "must-question",
      "title": "用must询问必须做什么",
      "explanation": "明确任务规则要求必须行动时，用What must +主语+ do?询问任务。must后动词保持原形；问自己用I，问另一人用he/she，问大家用we/they。这里must表示题设规定的义务，不根据情绪替别人决定。",
      "example": "What must we do?",
      "meaning": "我们必须做什么？",
      "check": "What + must +指定主语+ do；不换成正在做什么。",
      "source": "must-question"
    },
    {
      "target": "must-action",
      "title": "用must说明规定的动作",
      "explanation": "说明明确义务，用主语 + must +动词原形+对象。must对I/he/she/we/they形式相同，不加s，不用to。must not表示禁止，和必须做相反。本组肯定义务不接受mustn’t或must not。",
      "example": "He must open the box.",
      "meaning": "他必须打开盒子。",
      "check": "题设是谁必须做，就保留谁；must后保持原形和规定对象。",
      "source": "must-action"
    },
    {
      "target": "imperative-action",
      "title": "直接给出一个动作指令",
      "explanation": "向听话者发出任务指令，以动词原形起句，一般不写you。若题目指定两个动作有先后顺序，用Then或and then保持次序。please可礼貌化；本组受限题会明确是否需要它，开放表达可自然扩展。 在本组相应题目中，close the window也可表示shut the window；Then和句首Please后的逗号、and then前的逗号均可选，不改变动作次序。",
      "example": "Open the box. / Put the books on the shelf.",
      "meaning": "打开盒子。／把书放到架子上。",
      "check": "动作、对象与方向须符合任务；开与关、进与出、先后次序不能混掉。",
      "source": "imperative-action"
    }
  ],
  "own": {
    "id": "own-n29-expression",
    "prompt": "设计一个双方愿意参加的简单整理任务（真实或虚构），先问清必须做什么，再说明任务，并给出两条自然的指令。若有先后要求，写清次序。请伙伴或老师读你的实际话语，确认听话者能照意思执行；练习并不要求真的完成任务。",
    "checks": [
      "must表达的是明确规定的义务，还是正在发生的动作？",
      "must后是否保留动词原形，肯否意思与任务相符吗？",
      "直接指令的动作、对象和先后顺序是否清楚？"
    ],
    "status": "awaiting-human-review",
    "reviewerPrompt": "请老师或伙伴读实际表达，核对对象、语义和语法，允许自然等义说法。开放表达等待人工复核；本站不自动给出听说能力、掌握程度或Band结论。"
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
    "id": "diagnostic-n29-must-question",
    "stage": "diagnostic",
    "target": "must-question",
    "kind": "input",
    "form": "question",
    "context": "排练负责人已宣布你必须做一个准备任务，但没说任务内容。你直接询问自己必须做什么。I 我。",
    "prompt": "用I作主语问“我必须做什么”；只用what、must、I和do。只写一个以英文问号?结尾的直接问句，不加please、其他信息或回答；允许保持相同意思的缩写。",
    "accepted": [
      "What must I do?"
    ],
    "criterion": "按题设对象、时间和事实表达：What must I do?；题设外的自然表达可交由人核对。",
    "why": "必须做什么尚未知，What must…do?询问义务内容，而What…doing?问正在发生的动作。",
    "novelty": "diagnostic：排练负责人已宣布你必须做一个准备任务，但没说任务内容",
    "counterexamples": [
      {
        "answer": "What am I doing?",
        "reason": "改变动作形式、时间、次序或指定句式。"
      },
      {
        "answer": "What must you do?",
        "reason": "改变对象、肯否、位置或必要的先后信息。"
      },
      {
        "answer": "What must I does?",
        "reason": "改变主语、肯否、动作或时间。"
      },
      {
        "answer": "What must I not do?",
        "reason": "把指令/陈述变成疑问，或改变规定动作。"
      }
    ]
  },
  {
    "id": "diagnostic-n29-must-action",
    "stage": "diagnostic",
    "target": "must-action",
    "kind": "input",
    "form": "statement",
    "context": "手工活动规定：你必须打开那个盒子，才能核对材料；本题you指听话者。open 打开；box 盒子。",
    "prompt": "用You作主语说“你必须打开那个盒子”，保留must，对象用the box。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "You must open the box."
    ],
    "criterion": "按题设对象、时间和事实表达：You must open the box.；题设外的自然表达可交由人核对。",
    "why": "这是明确的肯定义务，用must加原形，不能加to、改主语或用not反转要求。",
    "novelty": "diagnostic：手工活动规定：你必须打开那个盒子，才能核对材料；本题you指听话者",
    "counterexamples": [
      {
        "answer": "You must opens the box.",
        "reason": "改变动作形式、时间、次序或指定句式。"
      },
      {
        "answer": "You must not open the box.",
        "reason": "改变对象、肯否、位置或必要的先后信息。"
      },
      {
        "answer": "I must open the box.",
        "reason": "改变主语、肯否、动作或时间。"
      },
      {
        "answer": "You must shut the box.",
        "reason": "把指令/陈述变成疑问，或改变规定动作。"
      }
    ]
  },
  {
    "id": "diagnostic-n29-imperative-action",
    "stage": "diagnostic",
    "target": "imperative-action",
    "kind": "input",
    "form": "imperative",
    "context": "伙伴正在材料桌旁等指令。你直接要求对方打开那个盒子，不是描述他正在开，也不询问。open 打开；box 盒子。",
    "prompt": "以动词原形起句发出“打开那个盒子”的直接指令；只用open the box，不加主语、must或please。只写规定的直接指令。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "Open the box."
    ],
    "criterion": "按题设对象、时间和事实表达：Open the box.；题设外的自然表达可交由人核对。",
    "why": "题目要向对方发出动作指令，不是在报告当前动作；保留规定的对象、方向及顺序。",
    "novelty": "diagnostic：伙伴正在材料桌旁等指令",
    "counterexamples": [
      {
        "answer": "You open the box.",
        "reason": "改变动作形式、时间、次序或指定句式。"
      },
      {
        "answer": "Shut the box.",
        "reason": "改变对象、肯否、位置或必要的先后信息。"
      },
      {
        "answer": "Do not open the box.",
        "reason": "改变主语、肯否、动作或时间。"
      },
      {
        "answer": "Open the box?",
        "reason": "把指令/陈述变成疑问，或改变规定动作。"
      }
    ]
  },
  {
    "id": "guided-n29-must-question",
    "stage": "guided",
    "target": "must-question",
    "kind": "input",
    "form": "question",
    "context": "共同整理活动已规定我们必须完成任务，但内容还没说明。we指你与伙伴这一组。",
    "prompt": "按What + must + we + do问“我们必须做什么”。只写一个以英文问号?结尾的直接问句，不加please、其他信息或回答；允许保持相同意思的缩写。",
    "accepted": [
      "What must we do?"
    ],
    "criterion": "按题设对象、时间和事实表达：What must we do?；题设外的自然表达可交由人核对。",
    "why": "必须做什么尚未知，What must…do?询问义务内容，而What…doing?问正在发生的动作。",
    "novelty": "guided：共同整理活动已规定我们必须完成任务，但内容还没说明",
    "counterexamples": [
      {
        "answer": "What are we doing?",
        "reason": "改变动作形式、时间、次序或指定句式。"
      },
      {
        "answer": "What must they do?",
        "reason": "改变对象、肯否、位置或必要的先后信息。"
      },
      {
        "answer": "What must we to do?",
        "reason": "改变主语、肯否、动作或时间。"
      },
      {
        "answer": "What must we not do?",
        "reason": "把指令/陈述变成疑问，或改变规定动作。"
      }
    ]
  },
  {
    "id": "guided-n29-must-action",
    "stage": "guided",
    "target": "must-action",
    "kind": "input",
    "form": "statement",
    "context": "规则规定男性助手必须关闭那扇窗；he只指助手。shut 关闭；window 窗。",
    "prompt": "按He + must +动词原形+对象说“他必须关闭那扇窗”。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "He must shut the window.",
      "He must close the window."
    ],
    "criterion": "按题设对象、时间和事实表达：He must shut the window. / He must close the window.；题设外的自然表达可交由人核对。",
    "why": "这是明确的肯定义务，用must加原形，不能加to、改主语或用not反转要求。",
    "novelty": "guided：规则规定男性助手必须关闭那扇窗；he只指助手",
    "counterexamples": [
      {
        "answer": "He must shuts the window.",
        "reason": "改变动作形式、时间、次序或指定句式。"
      },
      {
        "answer": "He must not shut the window.",
        "reason": "改变对象、肯否、位置或必要的先后信息。"
      },
      {
        "answer": "She must shut the window.",
        "reason": "改变主语、肯否、动作或时间。"
      },
      {
        "answer": "He must open the window.",
        "reason": "把指令/陈述变成疑问，或改变规定动作。"
      }
    ]
  },
  {
    "id": "guided-n29-imperative-action",
    "stage": "guided",
    "target": "imperative-action",
    "kind": "input",
    "form": "imperative",
    "context": "伙伴准备离开整理区。你要直接要求他把那扇门关上；不是开门。shut 关闭；door 门。",
    "prompt": "按Shut + the door写直接指令；不加主语、must或please。只写规定的直接指令。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "Shut the door."
    ],
    "criterion": "按题设对象、时间和事实表达：Shut the door.；题设外的自然表达可交由人核对。",
    "why": "题目要向对方发出动作指令，不是在报告当前动作；保留规定的对象、方向及顺序。",
    "novelty": "guided：伙伴准备离开整理区",
    "counterexamples": [
      {
        "answer": "You shut the door.",
        "reason": "改变动作形式、时间、次序或指定句式。"
      },
      {
        "answer": "Open the door.",
        "reason": "改变对象、肯否、位置或必要的先后信息。"
      },
      {
        "answer": "Do not shut the door.",
        "reason": "改变主语、肯否、动作或时间。"
      },
      {
        "answer": "Shut the door?",
        "reason": "把指令/陈述变成疑问，或改变规定动作。"
      }
    ]
  },
  {
    "id": "independent-n29-must-question",
    "stage": "independent",
    "target": "must-question",
    "kind": "input",
    "form": "question",
    "context": "负责布展的男性同事已被分配强制任务，但你尚不知道内容；he明确只指这位同事。",
    "prompt": "用he指题设人物，询问这个人物必须做什么。保留must表达明确的义务，问的是任务内容；不询问当前动作，也不猜任务。只写一个以英文问号?结尾的直接问句，不加时间副词、称呼、please、其他信息或回答。",
    "accepted": [
      "What must he do?"
    ],
    "criterion": "按题设对象、时间和事实表达：What must he do?；题设外的自然表达可交由人核对。",
    "why": "必须做什么尚未知，What must…do?询问义务内容，而What…doing?问正在发生的动作。",
    "novelty": "independent：负责布展的男性同事已被分配强制任务，但你尚不知道内容；he明确只指这位同事",
    "counterexamples": [
      {
        "answer": "What is he doing?",
        "reason": "改变动作形式、时间、次序或指定句式。"
      },
      {
        "answer": "What must she do?",
        "reason": "改变对象、肯否、位置或必要的先后信息。"
      },
      {
        "answer": "What must he does?",
        "reason": "改变主语、肯否、动作或时间。"
      },
      {
        "answer": "What must he not do?",
        "reason": "把指令/陈述变成疑问，或改变规定动作。"
      }
    ]
  },
  {
    "id": "independent-n29-must-action",
    "stage": "independent",
    "target": "must-action",
    "kind": "input",
    "form": "statement",
    "context": "你与伙伴这一组被明确要求把那些书放到架子上；we指这一组。put 放；books 书（复数）；on the shelf 架子上。",
    "prompt": "用We作主语说明“我们必须把那些书放到架子上”，保留must，用the books。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "We must put the books on the shelf."
    ],
    "criterion": "按题设对象、时间和事实表达：We must put the books on the shelf.；题设外的自然表达可交由人核对。",
    "why": "这是明确的肯定义务，用must加原形，不能加to、改主语或用not反转要求。",
    "novelty": "independent：你与伙伴这一组被明确要求把那些书放到架子上；we指这一组",
    "counterexamples": [
      {
        "answer": "We must to put the books on the shelf.",
        "reason": "改变动作形式、时间、次序或指定句式。"
      },
      {
        "answer": "We must not put the books on the shelf.",
        "reason": "改变对象、肯否、位置或必要的先后信息。"
      },
      {
        "answer": "They must put the books on the shelf.",
        "reason": "改变主语、肯否、动作或时间。"
      },
      {
        "answer": "We must put the books under the shelf.",
        "reason": "把指令/陈述变成疑问，或改变规定动作。"
      }
    ]
  },
  {
    "id": "independent-n29-imperative-action",
    "stage": "independent",
    "target": "imperative-action",
    "kind": "input",
    "form": "imperative",
    "context": "搭档等你指定下一步：将那些衣服放进橱柜里面。put 放；clothes 衣服（复数）；in the cupboard 橱柜里面。",
    "prompt": "以动词原形起句发出“把那些衣服放进橱柜”的直接指令；用the clothes和in the cupboard，不加主语、must或please。只写规定的直接指令。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "Put the clothes in the cupboard."
    ],
    "criterion": "按题设对象、时间和事实表达：Put the clothes in the cupboard.；题设外的自然表达可交由人核对。",
    "why": "题目要向对方发出动作指令，不是在报告当前动作；保留规定的对象、方向及顺序。",
    "novelty": "independent：搭档等你指定下一步：将那些衣服放进橱柜里面",
    "counterexamples": [
      {
        "answer": "You put the clothes in the cupboard.",
        "reason": "改变动作形式、时间、次序或指定句式。"
      },
      {
        "answer": "Put the clothes on the cupboard.",
        "reason": "改变对象、肯否、位置或必要的先后信息。"
      },
      {
        "answer": "Do not put the clothes in the cupboard.",
        "reason": "改变主语、肯否、动作或时间。"
      },
      {
        "answer": "Put the clothes in the cupboard?",
        "reason": "把指令/陈述变成疑问，或改变规定动作。"
      }
    ]
  },
  {
    "id": "repair-n29-must-question",
    "stage": "repair",
    "target": "must-question",
    "kind": "input",
    "form": "question",
    "context": "两名志愿者必须完成一项任务，但内容尚未通知你；they只指那两名志愿者。",
    "prompt": "用they指题设人物，询问这个人物必须做什么。保留must表达明确的义务，问的是任务内容；不询问当前动作，也不猜任务。只写一个以英文问号?结尾的直接问句，不加时间副词、称呼、please、其他信息或回答。",
    "accepted": [
      "What must they do?"
    ],
    "criterion": "按题设对象、时间和事实表达：What must they do?；题设外的自然表达可交由人核对。",
    "why": "必须做什么尚未知，What must…do?询问义务内容，而What…doing?问正在发生的动作。",
    "novelty": "repair：两名志愿者必须完成一项任务，但内容尚未通知你；they只指那两名志愿者",
    "counterexamples": [
      {
        "answer": "What are they doing?",
        "reason": "改变动作形式、时间、次序或指定句式。"
      },
      {
        "answer": "What must we do?",
        "reason": "改变对象、肯否、位置或必要的先后信息。"
      },
      {
        "answer": "What must they to do?",
        "reason": "改变主语、肯否、动作或时间。"
      },
      {
        "answer": "What must they not do?",
        "reason": "把指令/陈述变成疑问，或改变规定动作。"
      }
    ]
  },
  {
    "id": "repair-n29-must-action",
    "stage": "repair",
    "target": "must-action",
    "kind": "input",
    "form": "statement",
    "context": "女志愿者已被明确要求清扫那片地板；she只指该志愿者。sweep 扫；floor 地板。",
    "prompt": "用She作主语说“她必须扫地板”，保留must，宾语用the floor。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "She must sweep the floor."
    ],
    "criterion": "按题设对象、时间和事实表达：She must sweep the floor.；题设外的自然表达可交由人核对。",
    "why": "这是明确的肯定义务，用must加原形，不能加to、改主语或用not反转要求。",
    "novelty": "repair：女志愿者已被明确要求清扫那片地板；she只指该志愿者",
    "counterexamples": [
      {
        "answer": "She must sweeps the floor.",
        "reason": "改变动作形式、时间、次序或指定句式。"
      },
      {
        "answer": "She must not sweep the floor.",
        "reason": "改变对象、肯否、位置或必要的先后信息。"
      },
      {
        "answer": "He must sweep the floor.",
        "reason": "改变主语、肯否、动作或时间。"
      },
      {
        "answer": "She is sweeping the floor.",
        "reason": "把指令/陈述变成疑问，或改变规定动作。"
      }
    ]
  },
  {
    "id": "repair-n29-imperative-action",
    "stage": "repair",
    "target": "imperative-action",
    "kind": "input",
    "form": "imperative",
    "context": "伙伴刚完成擦桌子。下一步必须扫地板。你直接给出下一步指令，明确保留“然后”。then 然后；sweep 扫；floor 地板。",
    "prompt": "以Then起句发出“然后扫地板”的直接指令；只用Then、sweep和the floor，不加主语、must或please。只写规定的直接指令。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "Then sweep the floor.",
      "Then, sweep the floor."
    ],
    "criterion": "按题设对象、时间和事实表达：Then sweep the floor. / Then, sweep the floor.；题设外的自然表达可交由人核对。",
    "why": "题目要向对方发出动作指令，不是在报告当前动作；保留规定的对象、方向及顺序。",
    "novelty": "repair：伙伴刚完成擦桌子",
    "counterexamples": [
      {
        "answer": "Then sweeps the floor.",
        "reason": "改变动作形式、时间、次序或指定句式。"
      },
      {
        "answer": "Sweep the floor.",
        "reason": "改变对象、肯否、位置或必要的先后信息。"
      },
      {
        "answer": "Then do not sweep the floor.",
        "reason": "改变主语、肯否、动作或时间。"
      },
      {
        "answer": "Then sweep the floor?",
        "reason": "把指令/陈述变成疑问，或改变规定动作。"
      }
    ]
  },
  {
    "id": "review-a-n29-must-question",
    "stage": "review-a",
    "target": "must-question",
    "kind": "input",
    "form": "question",
    "context": "伙伴Nora明确以女性身份介绍，她有必须完成的任务，但你不知道任务是什么；本句she只指Nora。",
    "prompt": "用she指题设人物，询问这个人物必须做什么。保留must表达明确的义务，问的是任务内容；不询问当前动作，也不猜任务。只写一个以英文问号?结尾的直接问句，不加时间副词、称呼、please、其他信息或回答。",
    "accepted": [
      "What must she do?"
    ],
    "criterion": "按题设对象、时间和事实表达：What must she do?；题设外的自然表达可交由人核对。",
    "why": "必须做什么尚未知，What must…do?询问义务内容，而What…doing?问正在发生的动作。",
    "novelty": "review-a：伙伴Nora明确以女性身份介绍，她有必须完成的任务，但你不知道任务是什么；本句she只指Nora",
    "counterexamples": [
      {
        "answer": "What is she doing?",
        "reason": "改变动作形式、时间、次序或指定句式。"
      },
      {
        "answer": "What must he do?",
        "reason": "改变对象、肯否、位置或必要的先后信息。"
      },
      {
        "answer": "What must she does?",
        "reason": "改变主语、肯否、动作或时间。"
      },
      {
        "answer": "What must she not do?",
        "reason": "把指令/陈述变成疑问，或改变规定动作。"
      }
    ]
  },
  {
    "id": "review-a-n29-must-action",
    "stage": "review-a",
    "target": "must-action",
    "kind": "input",
    "form": "statement",
    "context": "这一对工作人员必须把那些空盒子放到桌子下面；they只指两位工作人员。put 放；boxes 盒子（复数）；under the table 桌子下面。",
    "prompt": "用They作主语陈述“他们必须把那些盒子放到桌子下面”，保留must，用the boxes，不加empty。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "They must put the boxes under the table."
    ],
    "criterion": "按题设对象、时间和事实表达：They must put the boxes under the table.；题设外的自然表达可交由人核对。",
    "why": "这是明确的肯定义务，用must加原形，不能加to、改主语或用not反转要求。",
    "novelty": "review-a：这一对工作人员必须把那些空盒子放到桌子下面；they只指两位工作人员",
    "counterexamples": [
      {
        "answer": "They must to put the boxes under the table.",
        "reason": "改变动作形式、时间、次序或指定句式。"
      },
      {
        "answer": "They must not put the boxes under the table.",
        "reason": "改变对象、肯否、位置或必要的先后信息。"
      },
      {
        "answer": "We must put the boxes under the table.",
        "reason": "改变主语、肯否、动作或时间。"
      },
      {
        "answer": "They must put the boxes on the table.",
        "reason": "把指令/陈述变成疑问，或改变规定动作。"
      }
    ]
  },
  {
    "id": "review-a-n29-imperative-action",
    "stage": "review-a",
    "target": "imperative-action",
    "kind": "input",
    "form": "imperative",
    "context": "搬运安排已经确定：先打开那扇门，然后把那些盒子放到桌子上。open 打开；put 放；boxes 盒子（复数）；door 门；table 桌子。",
    "prompt": "用两个动词原形指令，以and then连接，按给定次序写“打开那扇门，然后把那些盒子放到桌子上”。用the door、the boxes、on the table；不加主语、must或please。只写规定的直接指令。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "Open the door and then put the boxes on the table.",
      "Open the door, and then put the boxes on the table."
    ],
    "criterion": "按题设对象、时间和事实表达：Open the door and then put the boxes on the table. / Open the door, and then put the boxes on the table.；题设外的自然表达可交由人核对。",
    "why": "题目要向对方发出动作指令，不是在报告当前动作；保留规定的对象、方向及顺序。",
    "novelty": "review-a：搬运安排已经确定：先打开那扇门，然后把那些盒子放到桌子上",
    "counterexamples": [
      {
        "answer": "Put the boxes on the table and then open the door.",
        "reason": "改变动作形式、时间、次序或指定句式。"
      },
      {
        "answer": "Open the door and then put the boxes under the table.",
        "reason": "改变对象、肯否、位置或必要的先后信息。"
      },
      {
        "answer": "Open the door and then do not put the boxes on the table.",
        "reason": "改变主语、肯否、动作或时间。"
      },
      {
        "answer": "Open the door and then put the boxes on the table?",
        "reason": "把指令/陈述变成疑问，或改变规定动作。"
      }
    ]
  },
  {
    "id": "review-b-n29-must-question",
    "stage": "review-b",
    "target": "must-question",
    "kind": "input",
    "form": "question",
    "context": "你直接向搭档询问对方被规则要求做的任务内容。不是问你自己的任务，也不知道答案。you 你。",
    "prompt": "用you指题设人物，询问这个人物必须做什么。保留must表达明确的义务，问的是任务内容；不询问当前动作，也不猜任务。只写一个以英文问号?结尾的直接问句，不加时间副词、称呼、please、其他信息或回答。",
    "accepted": [
      "What must you do?"
    ],
    "criterion": "按题设对象、时间和事实表达：What must you do?；题设外的自然表达可交由人核对。",
    "why": "必须做什么尚未知，What must…do?询问义务内容，而What…doing?问正在发生的动作。",
    "novelty": "review-b：你直接向搭档询问对方被规则要求做的任务内容",
    "counterexamples": [
      {
        "answer": "What are you doing?",
        "reason": "改变动作形式、时间、次序或指定句式。"
      },
      {
        "answer": "What must I do?",
        "reason": "改变对象、肯否、位置或必要的先后信息。"
      },
      {
        "answer": "What must you to do?",
        "reason": "改变主语、肯否、动作或时间。"
      },
      {
        "answer": "What must you not do?",
        "reason": "把指令/陈述变成疑问，或改变规定动作。"
      }
    ]
  },
  {
    "id": "review-b-n29-must-action",
    "stage": "review-b",
    "target": "must-action",
    "kind": "input",
    "form": "statement",
    "context": "你扮演被分配准备任务的人；规则明确要求你本人必须铺好那张床。make 铺好（床）；bed 床；I 我。",
    "prompt": "用I作主语说“我必须铺床”，保留must，只用make the bed作为动作。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "I must make the bed."
    ],
    "criterion": "按题设对象、时间和事实表达：I must make the bed.；题设外的自然表达可交由人核对。",
    "why": "这是明确的肯定义务，用must加原形，不能加to、改主语或用not反转要求。",
    "novelty": "review-b：你扮演被分配准备任务的人；规则明确要求你本人必须铺好那张床",
    "counterexamples": [
      {
        "answer": "I must makes the bed.",
        "reason": "改变动作形式、时间、次序或指定句式。"
      },
      {
        "answer": "I must not make the bed.",
        "reason": "改变对象、肯否、位置或必要的先后信息。"
      },
      {
        "answer": "You must make the bed.",
        "reason": "改变主语、肯否、动作或时间。"
      },
      {
        "answer": "I am making the bed.",
        "reason": "把指令/陈述变成疑问，或改变规定动作。"
      }
    ]
  },
  {
    "id": "review-b-n29-imperative-action",
    "stage": "review-b",
    "target": "imperative-action",
    "kind": "input",
    "form": "imperative",
    "context": "共享卧室的虚构任务：你直接要求搭档铺好那张床，礼貌表达本题保留please。make 铺好（床）；bed 床。",
    "prompt": "发出“请铺床”的直接指令；用please、make和the bed。please可置句首，或置句尾并在前面保留逗号；不加主语或must。只写规定的直接指令。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "Please make the bed.",
      "Make the bed, please.",
      "Please, make the bed."
    ],
    "criterion": "按题设对象、时间和事实表达：Please make the bed. / Make the bed, please. / Please, make the bed.；题设外的自然表达可交由人核对。",
    "why": "题目要向对方发出动作指令，不是在报告当前动作；保留规定的对象、方向及顺序。",
    "novelty": "review-b：共享卧室的虚构任务：你直接要求搭档铺好那张床，礼貌表达本题保留please",
    "counterexamples": [
      {
        "answer": "You please make the bed.",
        "reason": "改变动作形式、时间、次序或指定句式。"
      },
      {
        "answer": "Please do not make the bed.",
        "reason": "改变对象、肯否、位置或必要的先后信息。"
      },
      {
        "answer": "Please open the bed.",
        "reason": "改变主语、肯否、动作或时间。"
      },
      {
        "answer": "Please make the bed?",
        "reason": "把指令/陈述变成疑问，或改变规定动作。"
      }
    ]
  }
];

export const {byId,questionsFor,matches}=bindContent(lesson,questions);
