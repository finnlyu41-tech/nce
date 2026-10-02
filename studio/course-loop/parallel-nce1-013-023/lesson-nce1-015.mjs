import {bindContent} from './content-contract.mjs';
export const lesson = {
  "id": "nce1-15",
  "version": 1,
  "book": "NCE1",
  "lessons": [
    15,
    16
  ],
  "title": "第 15–16 课 · 从一个人到一群人",
  "goal": "区分a/an单数职业名词、复数Are问句，按说话者身份以we/they回答，并用our说明一组人共同的物品。",
  "scope": "本课核对有限文字任务；未匹配仅表示未完成本题限定要求。自然自由表达由伙伴核对，不从文字记录推断听力、发音或长期掌握。",
  "prerequisites": [
    "已接触单数与复数、be及人称代词；所需词义和事实在题内给出。"
  ],
  "source": {
    "groupId": "NCE1-15",
    "route": "/#/nce/NCE1/15?tab=listen",
    "mapRoute": "/map/#/learn/nce1-15",
    "languagePath": "/language/NCE1/15.json",
    "languageSha256": "79644833a41795f8673516bd65dfdb8cb5094809c94ab711d6040bcfc7e23323",
    "comicKey": "NCE1-15",
    "clips": [
      {
        "target": "singular-article",
        "label": "听复数游客职业（单数a/an练习见16课）",
        "start": 56.09,
        "end": 58.86
      },
      {
        "target": "plural-question",
        "label": "听Are you询问两人的国籍",
        "start": 18.83,
        "end": 21.4
      },
      {
        "target": "plural-response",
        "label": "听they否定短答与our说明共同物品",
        "start": 43.15,
        "end": 53.07
      }
    ],
    "grammarPages": [
      34,
      35,
      36
    ]
  },
  "teaching": [
    {
      "target": "singular-article",
      "title": "一个职业名词前的a/an",
      "explanation": "介绍一个人当前职业，用主语+is+a/an+单数职业。冠词按下一个词的发音选择：an artist，a teacher；国籍形容词前不用a/an。",
      "example": "She is an artist. / She's an artist.",
      "meaning": "她是一位艺术家。",
      "check": "一个职业名词前有合适的a/an；不要把国籍形容词变成职业名词。",
      "source": "singular-article"
    },
    {
      "target": "plural-question",
      "title": "问多人用Are",
      "explanation": "向两人直接提问用Are you…?；问已指明的另一群人用Are they…?。国籍形容词不加复数s；职业名词用于多人时变复数。本课Written exercises还练单数职业的a/an。",
      "example": "Are they Canadian? / Are you teachers?",
      "meaning": "他们是加拿大人吗？/你们是教师吗？",
      "check": "Are在主语前；you/they符合问的是谁，职业为复数。",
      "source": "plural-question"
    },
    {
      "target": "plural-response",
      "title": "回答的人决定we/they",
      "explanation": "代表自己所在的一群人用we，报告另一群人用they。肯定短答Yes, we/they are不能把句末are缩成're；否定可用are not、aren't或we're/they're not。 our表示“我们的”，修饰所属物品，不作主语：Our cases are brown说明我们的多个箱子是棕色的。",
      "example": "No, we are not. / No, we aren't. / No, we're not.",
      "meaning": "不，我们不是。",
      "check": "事实决定Yes/No，说话者是否包含在群体中决定we/they。 说明共同物品时，our后接物品名词，复数物品用are。",
      "source": "plural-response"
    }
  ],
  "own": {
    "id": "own-n15",
    "prompt": "设计一个明确虚构的双人来访情境。先分别介绍一人的职业，核对a/an；再向两人问一个职业或国籍问题，并明确由谁回答。回答者若包含自己用we，否则用they。记录自然问答，请伙伴核对。",
    "checks": [
      "一个职业名词前有合适的a/an；不要把国籍形容词变成职业名词。",
      "Are在主语前；you/they符合问的是谁，职业为复数。",
      "事实决定Yes/No，说话者是否包含在群体中决定we/they。"
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
    "context": "职业介绍卡中，Mira明确以she指代，目前是一位工程师。她不是学生。",
    "prompt": "用she说明“她是一位工程师”，engineer=工程师；写出单数职业及所需冠词。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "She is an engineer.",
      "She's an engineer."
    ],
    "counterexamples": [
      {
        "answer": "She is a engineer.",
        "reason": "engineer以元音音素起头，需an。"
      },
      {
        "answer": "She is engineer.",
        "reason": "单数职业名词前缺冠词。"
      },
      {
        "answer": "She was an engineer.",
        "reason": "当前职业不改过去。"
      }
    ],
    "why": "an依engineer的发音选择，不依she。",
    "form": "statement",
    "id": "diagnostic-n15-singular-article",
    "stage": "diagnostic",
    "target": "singular-article",
    "kind": "input",
    "criterion": "用she说明“她是一位工程师”，engineer=工程师；写出单数职业及所需冠词。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "职业介绍卡中，Mira明确以she指代，目前是一位工程师。她不是学生。"
  },
  {
    "context": "接待处有两位访客站在你面前；你不确定他们是否是法国人，直接问他们。",
    "prompt": "向这两人问“你们是法国人吗？”，French=法国的/法国人（国籍形容词）。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "accepted": [
      "Are you French?"
    ],
    "counterexamples": [
      {
        "answer": "Is you French?",
        "reason": "you用are。"
      },
      {
        "answer": "Are they French?",
        "reason": "they没有直接向面前两人提问。"
      },
      {
        "answer": "Are you French.",
        "reason": "问号不能省成句号。"
      }
    ],
    "why": "直接提问听者用you，人数为两人仍用are。",
    "form": "question",
    "id": "diagnostic-n15-plural-question",
    "stage": "diagnostic",
    "target": "plural-question",
    "kind": "input",
    "criterion": "向这两人问“你们是法国人吗？”，French=法国的/法国人（国籍形容词）。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "novelty": "接待处有两位访客站在你面前；你不确定他们是否是法国人，直接问他们。"
  },
  {
    "context": "你与同伴是居民而不是游客。有人向你们问Are you tourists?你代表两人作简短否定回答。",
    "prompt": "只写No加we和be的否定短答，不重复tourists。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "No, we are not.",
      "No, we aren't.",
      "No, we're not.",
      "No we are not.",
      "No we aren't.",
      "No we're not."
    ],
    "counterexamples": [
      {
        "answer": "Yes, we are.",
        "reason": "事实不是游客。"
      },
      {
        "answer": "No, they aren't.",
        "reason": "回答代表自己与同伴。"
      },
      {
        "answer": "No, we not.",
        "reason": "缺少are。"
      }
    ],
    "why": "回答包括说话者的群体，因此用we。",
    "form": "statement",
    "id": "diagnostic-n15-plural-response",
    "stage": "diagnostic",
    "target": "plural-response",
    "kind": "input",
    "criterion": "只写No加we和be的否定短答，不重复tourists。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "你与同伴是居民而不是游客。有人向你们问Are you tourists?你代表两人作简短否定回答。"
  },
  {
    "context": "同伴介绍Eli，明确以he指代。Eli现在是一位大学生；题目只要求职业/身份名词，不加学校信息。",
    "prompt": "用he说“他是一位大学生”，university student=大学生；写所需冠词。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "He is a university student.",
      "He's a university student."
    ],
    "counterexamples": [
      {
        "answer": "He is an university student.",
        "reason": "university起头发音为/j/，用a。"
      },
      {
        "answer": "He is university student.",
        "reason": "单数名词前缺冠词。"
      },
      {
        "answer": "He are a university student.",
        "reason": "he用is。"
      }
    ],
    "why": "冠词依发音；university不是因为首字母u就用an。",
    "form": "statement",
    "id": "guided-n15-singular-article",
    "stage": "guided",
    "target": "singular-article",
    "kind": "input",
    "criterion": "用he说“他是一位大学生”，university student=大学生；写所需冠词。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "同伴介绍Eli，明确以he指代。Eli现在是一位大学生；题目只要求职业/身份名词，不加学校信息。"
  },
  {
    "context": "你看着远处两位工作人员，询问身旁的经理他们当前是否是司机；你不向工作人员本人发问。",
    "prompt": "问经理“他们是司机吗？”，driver=司机；用they指两位工作人员。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "accepted": [
      "Are they drivers?"
    ],
    "counterexamples": [
      {
        "answer": "Are you drivers?",
        "reason": "you会问经理本人。"
      },
      {
        "answer": "Are they a driver?",
        "reason": "两人要用复数drivers。"
      },
      {
        "answer": "They are drivers?",
        "reason": "本题限定Are开头的一般疑问句。"
      }
    ],
    "why": "两人职业名词用复数，Are放到they前。",
    "form": "question",
    "id": "guided-n15-plural-question",
    "stage": "guided",
    "target": "plural-question",
    "kind": "input",
    "criterion": "问经理“他们是司机吗？”，driver=司机；用they指两位工作人员。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "novelty": "你看着远处两位工作人员，询问身旁的经理他们当前是否是司机；你不向工作人员本人发问。"
  },
  {
    "context": "两位邻居本人确认自己是加拿大人。你不是他们之一，伙伴问Are they Canadian?你报告肯定事实。",
    "prompt": "只写Yes加they和be的肯定短答，不重复Canadian。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "Yes, they are.",
      "Yes they are."
    ],
    "counterexamples": [
      {
        "answer": "Yes, we are.",
        "reason": "说话者不包含在这两人中。"
      },
      {
        "answer": "No, they are not.",
        "reason": "与已确认国籍相反。"
      },
      {
        "answer": "Yes, they're.",
        "reason": "句末肯定短答的are不能这样缩写。"
      }
    ],
    "why": "they报告另外两人；句末are保留完整形式。",
    "form": "statement",
    "id": "guided-n15-plural-response",
    "stage": "guided",
    "target": "plural-response",
    "kind": "input",
    "criterion": "只写Yes加they和be的肯定短答，不重复Canadian。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "两位邻居本人确认自己是加拿大人。你不是他们之一，伙伴问Are they Canadian?你报告肯定事实。"
  },
  {
    "context": "志愿者登记表：Ava明确以she指代，她现在是一位护士，你要按表介绍她。",
    "prompt": "用she说“她是一位护士”，nurse=护士；写所需冠词。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "She is a nurse.",
      "She's a nurse."
    ],
    "counterexamples": [
      {
        "answer": "She is an nurse.",
        "reason": "nurse发音以辅音开头。"
      },
      {
        "answer": "She is nurses.",
        "reason": "一人职业用单数和冠词。"
      },
      {
        "answer": "She is not a nurse.",
        "reason": "否定与登记事实相反。"
      }
    ],
    "why": "nurse单数前用a，不能把单个人变成复数职业。",
    "form": "statement",
    "id": "independent-n15-singular-article",
    "stage": "independent",
    "target": "singular-article",
    "kind": "input",
    "criterion": "用she说“她是一位护士”，nurse=护士；写所需冠词。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "志愿者登记表：Ava明确以she指代，她现在是一位护士，你要按表介绍她。"
  },
  {
    "context": "两位参加绘画课的人坐在你对面，职业尚未确认；你直接问他们是否都是艺术家。",
    "prompt": "问这两人“你们是艺术家吗？”，artist=艺术家。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "accepted": [
      "Are you artists?"
    ],
    "counterexamples": [
      {
        "answer": "Are you an artist?",
        "reason": "题目明确两人，要复数artists。"
      },
      {
        "answer": "Are they artists?",
        "reason": "题目直接问听者。"
      },
      {
        "answer": "Were you artists?",
        "reason": "题目询问当前职业。"
      }
    ],
    "why": "多人artist变artists，不用单数an artist。",
    "form": "question",
    "id": "independent-n15-plural-question",
    "stage": "independent",
    "target": "plural-question",
    "kind": "input",
    "criterion": "问这两人“你们是艺术家吗？”，artist=艺术家。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "novelty": "两位参加绘画课的人坐在你对面，职业尚未确认；你直接问他们是否都是艺术家。"
  },
  {
    "context": "你不参加远处那两人的活动。他们确认自己在当地工作、不是游客。伙伴问Are they tourists?你回答。",
    "prompt": "只写No加they和be的否定短答，不重复tourists。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "No, they are not.",
      "No, they aren't.",
      "No, they're not.",
      "No they are not.",
      "No they aren't.",
      "No they're not."
    ],
    "counterexamples": [
      {
        "answer": "No, we aren't.",
        "reason": "你不属于该群体。"
      },
      {
        "answer": "Yes, they are.",
        "reason": "事实不是游客。"
      },
      {
        "answer": "No, they were not.",
        "reason": "问的是当前身份。"
      }
    ],
    "why": "they保留被问到的另一群体；否定依明确事实。",
    "form": "statement",
    "id": "independent-n15-plural-response",
    "stage": "independent",
    "target": "plural-response",
    "kind": "input",
    "criterion": "只写No加they和be的否定短答，不重复tourists。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "你不参加远处那两人的活动。他们确认自己在当地工作、不是游客。伙伴问Are they tourists?你回答。"
  },
  {
    "context": "来访者Leo明确以he指代，目前是一位演员；你给活动主持人介绍他的职业。",
    "prompt": "用he说“他是一位演员”，actor=演员；写所需冠词。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "He is an actor.",
      "He's an actor."
    ],
    "counterexamples": [
      {
        "answer": "He is a actor.",
        "reason": "actor发音以元音开头。"
      },
      {
        "answer": "He is actor.",
        "reason": "单数职业需冠词。"
      },
      {
        "answer": "She is an actor.",
        "reason": "人称改变了。"
      }
    ],
    "why": "an actor依据发音和单数职业名词选择。",
    "form": "statement",
    "id": "repair-n15-singular-article",
    "stage": "repair",
    "target": "singular-article",
    "kind": "input",
    "criterion": "用he说“他是一位演员”，actor=演员；写所需冠词。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "来访者Leo明确以he指代，目前是一位演员；你给活动主持人介绍他的职业。"
  },
  {
    "context": "远处两位维修人员没有与你交谈。你问身旁负责人他们现在是否是机械师。",
    "prompt": "问负责人“他们是机械师吗？”，mechanic=机械师；用they指维修人员。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "accepted": [
      "Are they mechanics?"
    ],
    "counterexamples": [
      {
        "answer": "Is they mechanics?",
        "reason": "they用are。"
      },
      {
        "answer": "Are they mechanic?",
        "reason": "两人职业名词需复数。"
      },
      {
        "answer": "Are they not mechanics?",
        "reason": "原题没有否定询问。"
      }
    ],
    "why": "Are they mechanics?不把职业数量或疑问极性改变。",
    "form": "question",
    "id": "repair-n15-plural-question",
    "stage": "repair",
    "target": "plural-question",
    "kind": "input",
    "criterion": "问负责人“他们是机械师吗？”，mechanic=机械师；用they指维修人员。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "novelty": "远处两位维修人员没有与你交谈。你问身旁负责人他们现在是否是机械师。"
  },
  {
    "context": "你与同伴本人都确认是瑞典人。接待员问你们Are you Swedish?你代表两人回答。",
    "prompt": "只写Yes加we和be的肯定短答，不重复Swedish。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "Yes, we are.",
      "Yes we are."
    ],
    "counterexamples": [
      {
        "answer": "Yes, they are.",
        "reason": "你代表包含自己的两人。"
      },
      {
        "answer": "Yes, we're.",
        "reason": "肯定短答句末are不缩写。"
      },
      {
        "answer": "No, we are not.",
        "reason": "事实已确认是瑞典人。"
      }
    ],
    "why": "问you，自己代表两人回答就转为we。",
    "form": "statement",
    "id": "repair-n15-plural-response",
    "stage": "repair",
    "target": "plural-response",
    "kind": "input",
    "criterion": "只写Yes加we和be的肯定短答，不重复Swedish。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "你与同伴本人都确认是瑞典人。接待员问你们Are you Swedish?你代表两人回答。"
  },
  {
    "context": "简历介绍：Noah明确以he指代，他是一位诚实的教师。这里honest读音的h不发音。",
    "prompt": "用he说“他是一位诚实的教师”，honest teacher=诚实的教师；保留honest并写所需冠词。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "He is an honest teacher.",
      "He's an honest teacher."
    ],
    "counterexamples": [
      {
        "answer": "He is a honest teacher.",
        "reason": "honest起头是元音音素。"
      },
      {
        "answer": "He is an teacher.",
        "reason": "遗漏honest且teacher前应a。"
      },
      {
        "answer": "He was an honest teacher.",
        "reason": "改成了过去。"
      }
    ],
    "why": "a/an按紧跟词honest的音素选择，h不发音。",
    "form": "statement",
    "id": "review-a-n15-singular-article",
    "stage": "review-a",
    "target": "singular-article",
    "kind": "input",
    "criterion": "用he说“他是一位诚实的教师”，honest teacher=诚实的教师；保留honest并写所需冠词。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "简历介绍：Noah明确以he指代，他是一位诚实的教师。这里honest读音的h不发音。"
  },
  {
    "context": "你问伙伴关于另外两位新邻居的国籍；他们不在对话中，国籍尚未知。",
    "prompt": "问“他们是日本人吗？”，Japanese=日本的/日本人（国籍形容词）；用they。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "accepted": [
      "Are they Japanese?"
    ],
    "counterexamples": [
      {
        "answer": "Are they Japaneses?",
        "reason": "国籍形容词不加复数s。"
      },
      {
        "answer": "Are you Japanese?",
        "reason": "you改变被问群体。"
      },
      {
        "answer": "They are Japanese.",
        "reason": "陈述不能完成询问任务。"
      }
    ],
    "why": "Japanese用于多人时仍保持形容词形式。",
    "form": "question",
    "id": "review-a-n15-plural-question",
    "stage": "review-a",
    "target": "plural-question",
    "kind": "input",
    "criterion": "问“他们是日本人吗？”，Japanese=日本的/日本人（国籍形容词）；用they。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "novelty": "你问伙伴关于另外两位新邻居的国籍；他们不在对话中，国籍尚未知。"
  },
  {
    "context": "行李转盘旁，你与同伴已共同确认自己一方的多个行李箱是棕色，旁边别人的箱子是黑色。你向工作人员说明自己一方的箱子颜色。",
    "prompt": "用our说“我们的行李箱是棕色的”。case=行李箱，brown=棕色的；保留复数物品。以Our cases起句，用be连接状态词。使用本题指定的英文词，不另换同义词；使用be的一般现在时。只写这一句肯定事实，可省略末尾标点或使用一个句号、感叹号（中英文均可），不用问号。",
    "accepted": [
      "Our cases are brown."
    ],
    "counterexamples": [
      {
        "answer": "We cases are brown.",
        "reason": "修饰物品要用our，不用主语we。"
      },
      {
        "answer": "Our case is brown.",
        "reason": "单件没有保留题目多个箱子。"
      },
      {
        "answer": "Their cases are brown.",
        "reason": "their把物主改成别人一方。"
      },
      {
        "answer": "Our cases are black.",
        "reason": "black是别人的箱子颜色。"
      }
    ],
    "why": "our是“我们的”，修饰复数cases；物品作为主语用are，brown对应己方已确认的颜色。",
    "form": "statement",
    "id": "review-a-n15-plural-response",
    "stage": "review-a",
    "target": "plural-response",
    "kind": "input",
    "criterion": "Our + cases + are + brown，明确共同所属的复数物品。",
    "novelty": "在行李转盘以共同所属和颜色区分己方多个箱子与别人的箱子。"
  },
  {
    "context": "项目会议：Mia明确以she指代，现在是一位办公室助理。你只介绍这一职业。",
    "prompt": "用she说“她是一位办公室助理”，office assistant=办公室助理；保留这两个词并写冠词。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "She is an office assistant.",
      "She's an office assistant."
    ],
    "counterexamples": [
      {
        "answer": "She is a office assistant.",
        "reason": "office以元音音素开头。"
      },
      {
        "answer": "She is an office assistants.",
        "reason": "一个人的职业名词需单数。"
      },
      {
        "answer": "She is office assistant.",
        "reason": "缺少冠词。"
      }
    ],
    "why": "冠词由office发音决定，assistant仍为单数。",
    "form": "statement",
    "id": "review-b-n15-singular-article",
    "stage": "review-b",
    "target": "singular-article",
    "kind": "input",
    "criterion": "用she说“她是一位办公室助理”，office assistant=办公室助理；保留这两个词并写冠词。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "项目会议：Mia明确以she指代，现在是一位办公室助理。你只介绍这一职业。"
  },
  {
    "context": "读书会来了两位你尚不了解职业的参加者。你面对两人直接询问他们是不是教师。",
    "prompt": "问这两人“你们是教师吗？”，teacher=教师。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "accepted": [
      "Are you teachers?"
    ],
    "counterexamples": [
      {
        "answer": "Are you a teacher?",
        "reason": "两人要求复数teachers。"
      },
      {
        "answer": "Is you teachers?",
        "reason": "you用are。"
      },
      {
        "answer": "Are you teachers!",
        "reason": "本题发问使用问号。"
      }
    ],
    "why": "面对两个听者时you不变，但职业用复数teachers。",
    "form": "question",
    "id": "review-b-n15-plural-question",
    "stage": "review-b",
    "target": "plural-question",
    "kind": "input",
    "criterion": "问这两人“你们是教师吗？”，teacher=教师。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "novelty": "读书会来了两位你尚不了解职业的参加者。你面对两人直接询问他们是不是教师。"
  },
  {
    "context": "两位同伴本人确认目前都是学生。你不是他们之一，负责人问Are they students?你报告肯定事实。",
    "prompt": "只写Yes加they和be的肯定短答，不重复students。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "Yes, they are.",
      "Yes they are."
    ],
    "counterexamples": [
      {
        "answer": "Yes, we are.",
        "reason": "说话者不是该群体成员。"
      },
      {
        "answer": "Yes, they're.",
        "reason": "句末are不能缩写。"
      },
      {
        "answer": "Yes, they were.",
        "reason": "改为过去，不回答当前身份。"
      }
    ],
    "why": "they和are分别保留第三人复数及现在时。",
    "form": "statement",
    "id": "review-b-n15-plural-response",
    "stage": "review-b",
    "target": "plural-response",
    "kind": "input",
    "criterion": "只写Yes加they和be的肯定短答，不重复students。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "两位同伴本人确认目前都是学生。你不是他们之一，负责人问Are they students?你报告肯定事实。"
  }
];
export const {byId,questionsFor,matches}=bindContent(lesson,questions);
