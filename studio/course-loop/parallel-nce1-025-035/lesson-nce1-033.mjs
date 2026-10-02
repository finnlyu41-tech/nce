import {bindContent} from './content-contract.mjs';

export const lesson = {
  "id": "nce1-33",
  "version": 1,
  "book": "NCE1",
  "lessons": [
    33,
    34
  ],
  "title": "第33–34课 · 问清并说明多人正在做什么",
  "goal": "询问复数主体当前动作，用They或明确复数名词、并列姓名说明正在进行的活动及其对象和路线。",
  "scope": "本组只核对题目规定的主语、词汇和输出边界。短句可省略末尾句号或使用一个英文句号；问句必须以一个英文问号结束。大小写和词间空格不改变含义；否定、人称、时态、词序与标点含义需保留。未完成限定题不表示所有其他自然英文错误；自然扩展表达请在自由表达中由伙伴核对。",
  "prerequisites": [
    "已接触be的单复数形式、基本人称代词及对应组之前的词汇；每题仍给出所需词义和明确情境。"
  ],
  "source": {
    "groupId": "NCE1-33",
    "route": "/#/nce/NCE1/33?tab=listen",
    "mapRoute": "/map/#/learn/nce1-33",
    "languagePath": "/language/NCE1/33.json",
    "languageSha256": "4764d3bb0438a7000f453ac07e23e9eb4ff4a2cc37c1cced984cf738cb6d17c3",
    "sourceSha256": "4764d3bb0438a7000f453ac07e23e9eb4ff4a2cc37c1cced984cf738cb6d17c3",
    "comicKey": "NCE1-33",
    "clips": [
      {
        "target": "plural-question",
        "label": "听复数当前动作陈述；结合第71–72页迁移为What动作疑问",
        "start": 31.78,
        "end": 35.83
      },
      {
        "target": "they-action",
        "label": "听They are说明一组人的当前行走动作",
        "start": 31.78,
        "end": 35.83
      },
      {
        "target": "named-plural-action",
        "label": "听and连接的两个人作当前动作主语",
        "start": 39.86,
        "end": 45.73
      }
    ]
  },
  "glossary": "carry 搬运；box 盒子；students 学生；draw 画画；sit 坐；dogs 狗；chase 追逐；ball 球；ride 骑行；through 穿过内部；park 公园；check 检查；map 地图；wait 等候；nurses 护士；open 打开；boxes 盒子（复数）；hang 悬挂；picture 画；drones 无人机；fly 飞；over 上空；field 田地；look at 看着；ferry 渡轮；walk 走；along 沿着；path 小路。人物和场景为原创虚构。",
  "teaching": [
    {
      "target": "plural-question",
      "title": "询问他们此刻在做什么",
      "explanation": "对两人或更多人的当前活动，用What are they doing?询问。they是复数，因此用are，不用is。What询问活动内容；Where询问位置，不能互换。What are也可缩写成What're。此组限定以they指题中已说明的人或物，问句以一个英文问号结束。",
      "example": "What are they doing?",
      "meaning": "他们正在做什么？",
      "check": "What问动作，they与are一致，doing及问号齐全。",
      "source": "plural-question"
    },
    {
      "target": "they-action",
      "title": "用they承接复数主体的当前动作",
      "explanation": "前文已明确一组人或物时，用They are + 动词-ing描述当前动作；They are可缩写为They're。carry变carrying，sit变sitting，ride变riding。主体复数并不决定宾语也必须复数：两人可共同搬一个盒子。",
      "example": "They are carrying a box. / They're carrying a box.",
      "meaning": "他们正在搬一个盒子。",
      "check": "they所指明确；are与当前动作齐全；对象和路径不改变。",
      "source": "they-action"
    },
    {
      "target": "named-plural-action",
      "title": "复数名词与并列姓名也用are",
      "explanation": "The students、The dogs等复数名词，或Mia and Leo等由and连接的两个人，作主语时都用are + 动词-ing。需要保留题目要求的姓名或名词，不能把明确主体改成另一组人。along是沿着路径，over在飞行场景中表示上空。",
      "example": "Mia and Leo are checking a map.",
      "meaning": "Mia和Leo正在检查一张地图。",
      "check": "明确复数主语与are搭配；当前动作、对象及路线完整。",
      "source": "named-plural-action"
    }
  ],
  "own": {
    "id": "own-n33-current-scene",
    "prompt": "观察或设定一组两人以上的当前活动。先问伙伴他们正在做什么，再用they说明一项活动，并用具体复数名词或两人的姓名说明另一项活动。需要时补充真实的对象或路线，不因主体复数就把对象也改成复数。留下初答与订正，请伙伴实际核对自由表达。",
    "checks": [
      "they或复数名词究竟指哪些人或物？",
      "是否用are表示复数主体当前动作，对象数量是否符合事实？",
      "动作、路线和时间是否清楚；伙伴是否实际核对过？"
    ],
    "status": "awaiting-human-review",
    "reviewerPrompt": "请伙伴或老师实际听/读表达，按情境核对主语、时间、动作、位置和方向，并接受自然等义表达。文字短句完成不代表听力或发音已核验。"
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
    "id": "diagnostic-n33-plural-question",
    "stage": "diagnostic",
    "target": "plural-question",
    "kind": "input",
    "form": "question",
    "context": "排练室里三位演员背对窗户忙着准备，你看不清他们的动作，问排练助理。",
    "prompt": "询问“他们正在做什么？”。主语用they，以What开头，只写一个完整动作问句。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "accepted": [
      "What are they doing?",
      "What're they doing?"
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前位置或当前动作的疑问；保留对应be与问句词序。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "why": "复数they的当前动作疑问用are。",
    "novelty": "排练前从助理处询问三位演员的未知动作。",
    "counterexamples": [
      {
        "answer": "What were they doing?",
        "reason": "改成过去时间，不是在问情境中的当前位置或当前动作。"
      },
      {
        "answer": "What are he doing?",
        "reason": "改变了题目规定的人称或对象数量与be的对应关系。"
      },
      {
        "answer": "What are they doing.",
        "reason": "句号把任务要求的问句标点改掉了。"
      },
      {
        "answer": "What are they doing??",
        "reason": "本题要求恰有一个末尾英文问号。"
      }
    ]
  },
  {
    "id": "diagnostic-n33-they-action",
    "stage": "diagnostic",
    "target": "they-action",
    "kind": "input",
    "form": "statement",
    "context": "你观察两位志愿者，此刻他们正搬运一个长盒子。你用they继续向负责人说明他们的动作。",
    "prompt": "主语用They，动词用carry（搬运），宾语用a box（一个盒子）。只写一句当前肯定陈述。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "They are carrying a box.",
      "They're carrying a box."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "两人共同搬一个盒子，主语复数但宾语仍为单数。",
    "novelty": "活动搬运中区分多人主体和共同搬的一件物品。",
    "counterexamples": [
      {
        "answer": "They were carrying a box.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "They are not carrying a box.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "He are carrying a box.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "They are carrying a box?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      }
    ]
  },
  {
    "id": "diagnostic-n33-named-plural-action",
    "stage": "diagnostic",
    "target": "named-plural-action",
    "kind": "input",
    "form": "statement",
    "context": "学校中两名学生此刻正在画画。你要把他们作为一个复数组写入观察笔记。",
    "prompt": "主语用The students（这些学生），动词用draw（画画）。只写一句当前肯定陈述，不加宾语或地点。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "The students are drawing."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "复数students搭配are，drawing表示此刻的活动。",
    "novelty": "课堂观察中明确用复数名词主语报告活动。",
    "counterexamples": [
      {
        "answer": "The students were drawing.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "The students are not drawing.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "The students is drawing.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "The students are drawing?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      }
    ]
  },
  {
    "id": "guided-n33-plural-question",
    "stage": "guided",
    "target": "plural-question",
    "kind": "input",
    "form": "question",
    "context": "码头上两位摄影师背向你工作，你想问同伴他们此刻做什么。",
    "prompt": "问“他们正在做什么？”。提示：What + are + they + doing。只写一个完整问句，句末一个英文问号。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "accepted": [
      "What are they doing?",
      "What're they doing?"
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前位置或当前动作的疑问；保留对应be与问句词序。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "why": "复数they用are，What询问未知动作。",
    "novelty": "码头拍摄时询问两位摄影师的当前任务。",
    "counterexamples": [
      {
        "answer": "What were they doing?",
        "reason": "改成过去时间，不是在问情境中的当前位置或当前动作。"
      },
      {
        "answer": "What are he doing?",
        "reason": "改变了题目规定的人称或对象数量与be的对应关系。"
      },
      {
        "answer": "What are they doing.",
        "reason": "句号把任务要求的问句标点改掉了。"
      },
      {
        "answer": "What are they doing??",
        "reason": "本题要求恰有一个末尾英文问号。"
      }
    ]
  },
  {
    "id": "guided-n33-they-action",
    "stage": "guided",
    "target": "they-action",
    "kind": "input",
    "form": "statement",
    "context": "你与同事观察两个演员，他们此刻正坐在舞台上。只描述动作，不写地点。",
    "prompt": "主语用They，动词用sit（坐）。提示：They + are + 动词-ing；sit需双写t，They are可缩写。只写当前肯定陈述。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "They are sitting.",
      "They're sitting."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "sitting保留坐的动作，are与复数they搭配。",
    "novelty": "排练中只记录演员当前坐着的动作。",
    "counterexamples": [
      {
        "answer": "They were sitting.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "They are not sitting.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "He are sitting.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "They are sitting?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      }
    ]
  },
  {
    "id": "guided-n33-named-plural-action",
    "stage": "guided",
    "target": "named-plural-action",
    "kind": "input",
    "form": "statement",
    "context": "两只狗在训练场此刻追逐同一个球，你用明确的复数名词描述它们。",
    "prompt": "主语用The dogs（这些狗），动词用chase（追逐），宾语用a ball（一个球）。提示：复数主语 + are + 动词-ing；chase去末尾e。只写当前肯定陈述。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "The dogs are chasing a ball."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "复数dogs用are；两只狗追同一个球，宾语a ball不变。",
    "novelty": "动物训练中报告复数动物共同追逐的单个对象。",
    "counterexamples": [
      {
        "answer": "The dogs were chasing a ball.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "The dogs are not chasing a ball.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "The dogs is chasing a ball.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "The dogs are chasing a ball?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      }
    ]
  },
  {
    "id": "independent-n33-plural-question",
    "stage": "independent",
    "target": "plural-question",
    "kind": "input",
    "form": "question",
    "context": "花店里几位员工围在桌旁，你不知道他们正在做什么，向能看清的店长询问。",
    "prompt": "询问他们当前的动作；主语用they，以What开头，不猜具体活动，只写一个完整问句。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "accepted": [
      "What are they doing?",
      "What're they doing?"
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前位置或当前动作的疑问；保留对应be与问句词序。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "why": "they对应几位员工，动作未知时使用What。",
    "novelty": "花店桌边工作中依靠另一人的观察补足信息。",
    "counterexamples": [
      {
        "answer": "What were they doing?",
        "reason": "改成过去时间，不是在问情境中的当前位置或当前动作。"
      },
      {
        "answer": "What are he doing?",
        "reason": "改变了题目规定的人称或对象数量与be的对应关系。"
      },
      {
        "answer": "What are they doing.",
        "reason": "句号把任务要求的问句标点改掉了。"
      },
      {
        "answer": "What are they doing??",
        "reason": "本题要求恰有一个末尾英文问号。"
      }
    ]
  },
  {
    "id": "independent-n33-they-action",
    "stage": "independent",
    "target": "they-action",
    "kind": "input",
    "form": "statement",
    "context": "两位骑手正穿过一个公园。你刚提过他们，现在用they向接应者更新目前动作和路线。",
    "prompt": "主语用They，动词用ride（骑行），路线用through the park（穿过这个公园）。只写一句当前肯定陈述。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "They are riding through the park.",
      "They're riding through the park."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "ride变为riding；through强调穿行公园内部。",
    "novelty": "接应骑手时报告二人目前穿行公园的路线。",
    "counterexamples": [
      {
        "answer": "They were riding through the park.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "They are not riding through the park.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "He are riding through the park.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "They are riding through the park?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      }
    ]
  },
  {
    "id": "independent-n33-named-plural-action",
    "stage": "independent",
    "target": "named-plural-action",
    "kind": "input",
    "form": "statement",
    "context": "Mia和Leo此刻正检查一张地图，以决定下一段路线。你把两人姓名都写在队伍动态里。",
    "prompt": "主语用Mia and Leo，动词用check（检查），宾语用a map（一张地图）。只写一句当前肯定陈述，不加其他信息。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "Mia and Leo are checking a map."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "and连接两个人，整体作复数主语，不能用is。",
    "novelty": "徒步路线选择中点名两位共同检查地图的人。",
    "counterexamples": [
      {
        "answer": "Mia and Leo were checking a map.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "Mia and Leo are not checking a map.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "Mia and Leo is checking a map.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "Mia and Leo are checking a map?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      }
    ]
  },
  {
    "id": "repair-n33-plural-question",
    "stage": "repair",
    "target": "plural-question",
    "kind": "input",
    "form": "question",
    "context": "保留上一题原答。新的场景中，几个维修员在车后忙碌，你向旁边领班问他们此刻在做什么。",
    "prompt": "另写一个订正后的动作问句。主语用they，以What开头，不猜动作，不加称呼。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "accepted": [
      "What are they doing?",
      "What're they doing?"
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前位置或当前动作的疑问；保留对应be与问句词序。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "why": "复数they需要are；问句不能用陈述句号结束。",
    "novelty": "以维修现场的新未知动作检查复数疑问。",
    "counterexamples": [
      {
        "answer": "What were they doing?",
        "reason": "改成过去时间，不是在问情境中的当前位置或当前动作。"
      },
      {
        "answer": "What are he doing?",
        "reason": "改变了题目规定的人称或对象数量与be的对应关系。"
      },
      {
        "answer": "What are they doing.",
        "reason": "句号把任务要求的问句标点改掉了。"
      },
      {
        "answer": "What are they doing??",
        "reason": "本题要求恰有一个末尾英文问号。"
      }
    ]
  },
  {
    "id": "repair-n33-they-action",
    "stage": "repair",
    "target": "they-action",
    "kind": "input",
    "form": "statement",
    "context": "保留上一题原答。新场景中，两位乘客正等候，你已用they指他们。现在只报告动作。",
    "prompt": "另写一句当前肯定陈述。主语用They，动词用wait（等候），不加地点或时间词。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "They are waiting.",
      "They're waiting."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "此刻等候需要当前动作表达，they表示两位乘客。",
    "novelty": "乘客等待的新事件用于比较原答与订正。",
    "counterexamples": [
      {
        "answer": "They were waiting.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "They are not waiting.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "He are waiting.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "They are waiting?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      }
    ]
  },
  {
    "id": "repair-n33-named-plural-action",
    "stage": "repair",
    "target": "named-plural-action",
    "kind": "input",
    "form": "statement",
    "context": "保留上一题原答。新场景中，几名护士正打开若干盒子；你需同时说清复数主体和复数物品。",
    "prompt": "另写一句当前肯定陈述。主语用The nurses（这些护士），动词用open（打开），宾语用boxes（一些盒子，不加限定词）。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "The nurses are opening boxes."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "nurses用are，boxes保留多个盒子而不是一个。",
    "novelty": "医疗物资整理时重新核对主语和宾语的复数。",
    "counterexamples": [
      {
        "answer": "The nurses were opening boxes.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "The nurses are not opening boxes.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "The nurses is opening boxes.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "The nurses are opening boxes?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      }
    ]
  },
  {
    "id": "review-a-n33-plural-question",
    "stage": "review-a",
    "target": "plural-question",
    "kind": "input",
    "form": "question",
    "context": "隔一段时间，天文营几位学员站在设备旁忙碌，你想从带队老师那里确认他们当前的动作。",
    "prompt": "询问他们当前在做什么；主语用they，以What开头，只写一个完整动作问句。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "accepted": [
      "What are they doing?",
      "What're they doing?"
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前位置或当前动作的疑问；保留对应be与问句词序。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "why": "询问几位学员的未知动作，不能变成地点问题。",
    "novelty": "天文营中在另一种设备活动下检验复数动作疑问。",
    "counterexamples": [
      {
        "answer": "What were they doing?",
        "reason": "改成过去时间，不是在问情境中的当前位置或当前动作。"
      },
      {
        "answer": "What are he doing?",
        "reason": "改变了题目规定的人称或对象数量与be的对应关系。"
      },
      {
        "answer": "What are they doing.",
        "reason": "句号把任务要求的问句标点改掉了。"
      },
      {
        "answer": "What are they doing??",
        "reason": "本题要求恰有一个末尾英文问号。"
      }
    ]
  },
  {
    "id": "review-a-n33-they-action",
    "stage": "review-a",
    "target": "they-action",
    "kind": "input",
    "form": "statement",
    "context": "两位画廊工作人员正悬挂一幅画。你已提过他们，接下来用they汇报当前进度。",
    "prompt": "主语用They，动词用hang（悬挂），宾语用a picture（一幅画）。只写一句当前肯定陈述。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "They are hanging a picture.",
      "They're hanging a picture."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "他们正挂一幅画，复数主体不能把宾语也改成多幅。",
    "novelty": "布展时汇报两人共同处理的单幅作品。",
    "counterexamples": [
      {
        "answer": "They were hanging a picture.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "They are not hanging a picture.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "He are hanging a picture.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "They are hanging a picture?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      }
    ]
  },
  {
    "id": "review-a-n33-named-plural-action",
    "stage": "review-a",
    "target": "named-plural-action",
    "kind": "input",
    "form": "statement",
    "context": "窗外两架无人机此刻从田地上空飞过。观察记录需明确提到无人机，不用代词。",
    "prompt": "主语用The drones（这些无人机），动词用fly（飞），路线用over the field（这片田地上空）。只写一句当前肯定陈述。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "The drones are flying over the field."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "drones为复数，over说明上空路线，不是田地内部。",
    "novelty": "农田观察中记录两架无人机的即时飞行路线。",
    "counterexamples": [
      {
        "answer": "The drones were flying over the field.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "The drones are not flying over the field.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "The drones is flying over the field.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "The drones are flying over the field?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      }
    ]
  },
  {
    "id": "review-b-n33-plural-question",
    "stage": "review-b",
    "target": "plural-question",
    "kind": "input",
    "form": "question",
    "context": "另一轮检查时，几位厨师聚在工作台旁，你看不到他们手里的东西，问站在近处的同事。",
    "prompt": "询问他们当前在做什么；主语用they，以What开头，只写一个完整动作问句。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "accepted": [
      "What are they doing?",
      "What're they doing?"
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前位置或当前动作的疑问；保留对应be与问句词序。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "why": "What询问动作，they指几位厨师，are不能省略。",
    "novelty": "厨房协作中用新的遮挡场景核对复数疑问。",
    "counterexamples": [
      {
        "answer": "What were they doing?",
        "reason": "改成过去时间，不是在问情境中的当前位置或当前动作。"
      },
      {
        "answer": "What are he doing?",
        "reason": "改变了题目规定的人称或对象数量与be的对应关系。"
      },
      {
        "answer": "What are they doing.",
        "reason": "句号把任务要求的问句标点改掉了。"
      },
      {
        "answer": "What are they doing??",
        "reason": "本题要求恰有一个末尾英文问号。"
      }
    ]
  },
  {
    "id": "review-b-n33-they-action",
    "stage": "review-b",
    "target": "they-action",
    "kind": "input",
    "form": "statement",
    "context": "两位观众此刻正看着一艘渡轮。你已用they指他们，继续说明动作和注视对象。",
    "prompt": "主语用They，动词用look（看），对象用at a ferry（一艘渡轮）。只写一句当前肯定陈述。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "They are looking at a ferry.",
      "They're looking at a ferry."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "look at保留注视的对象；复数they用are。",
    "novelty": "港口观众观察中区分看着对象与乘坐渡轮。",
    "counterexamples": [
      {
        "answer": "They were looking at a ferry.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "They are not looking at a ferry.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "He are looking at a ferry.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "They are looking at a ferry?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      }
    ]
  },
  {
    "id": "review-b-n33-named-plural-action",
    "stage": "review-b",
    "target": "named-plural-action",
    "kind": "input",
    "form": "statement",
    "context": "Ava和Noah此刻正沿一条小路走，你在安全记录中用两人姓名报告当前路线。",
    "prompt": "主语用Ava and Noah，动词用walk（走），路线用along a path（沿一条小路）。只写一句当前肯定陈述。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "Ava and Noah are walking along a path."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "两人姓名构成复数主语，along说明沿路线行走。",
    "novelty": "户外安全记录中点名两人的当前路径。",
    "counterexamples": [
      {
        "answer": "Ava and Noah were walking along a path.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "Ava and Noah are not walking along a path.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "Ava and Noah is walking along a path.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "Ava and Noah are walking along a path?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      }
    ]
  }
];

export const {byId,questionsFor,matches}=bindContent(lesson,questions);
