import {bindContent} from './content-contract.mjs';

export const lesson = {
  "id": "nce1-35",
  "version": 1,
  "book": "NCE1",
  "lessons": [
    35,
    36
  ],
  "title": "第35–36课 · 分清在哪里与往哪里移动",
  "goal": "用Where询问单数或复数对象的位置，说明静态相对位置，并区分进入、走出、沿行和横穿的当前移动方向。",
  "scope": "本组只核对题目规定的主语、词汇和输出边界。短句可省略末尾句号或使用一个英文句号；问句必须以一个英文问号结束。大小写和词间空格不改变含义；否定、人称、时态、词序与标点含义需保留。未完成限定题不表示所有其他自然英文错误；自然扩展表达请在自由表达中由伙伴核对。",
  "prerequisites": [
    "已接触be的单复数形式、基本人称代词及对应组之前的词汇；每题仍给出所需词义和明确情境。"
  ],
  "source": {
    "groupId": "NCE1-35",
    "route": "/#/nce/NCE1/35?tab=listen",
    "mapRoute": "/map/#/learn/nce1-35",
    "languagePath": "/language/NCE1/35.json",
    "languageSha256": "aa3692496b220bbdbd909da7b34f2ce687893e949f4426c4c6f4c05ff98588c7",
    "sourceSha256": "aa3692496b220bbdbd909da7b34f2ce687893e949f4426c4c6f4c05ff98588c7",
    "comicKey": "NCE1-35",
    "clips": [
      {
        "target": "location-question",
        "label": "听村庄位置事实；结合第75–76页Where句型练习转换为位置疑问",
        "start": 23.5,
        "end": 30.24
      },
      {
        "target": "static-location",
        "label": "听in与between说明静态位置",
        "start": 23.5,
        "end": 30.24
      },
      {
        "target": "movement-direction",
        "label": "听一组孩子当前从建筑内部向外移动",
        "start": 71.52,
        "end": 75.99
      }
    ]
  },
  "glossary": "museum 博物馆；cafe 咖啡馆；beside 在旁边；station 车站；go 去/走；into 进入；gym 体育馆；library 图书馆；tower 塔；between 在两者之间；hills 小山；walk 走；along 沿着；bank 岸边；kayaks 皮划艇（复数）；exit 出口；windows 窗户；come 来/走；out of 从里面向外；hall 大厅；ticket office 售票处；warehouse 仓库；in 在里面；valley 山谷；across 横穿；square 广场；boxes 箱子；office 办公室；post office 邮局；gallery 展厅；kitchen 厨房；park 公园；school 学校；swim 游泳；lake 湖。场景为原创虚构。",
  "teaching": [
    {
      "target": "location-question",
      "title": "用Where问所在位置",
      "explanation": "Where询问“在哪里”。单个对象用Where is + 主语?，Where is也可写成Where's；多个对象用Where are + 复数主语?，Where are可缩写成Where're。单复数由所问对象决定。问位置不需要doing；What are they doing?是另一个动作问题。",
      "example": "Where is the library? / Where are the kayaks?",
      "meaning": "图书馆在哪里？/这些皮划艇在哪里？",
      "check": "Where问位置；is/are对应对象数量；问句以一个英文问号结束。",
      "source": "location-question"
    },
    {
      "target": "static-location",
      "title": "静态位置用be连接位置短语",
      "explanation": "位置事实可用主语 + is/are + 位置短语。in表示在内部，beside表示在旁边，between two…表示在两个对象之间。这里只描述目前在哪里，不加一个正在移动的动作。单数名词后的is可缩写为's。",
      "example": "The tower is between two hills.",
      "meaning": "这座塔在两座小山之间。",
      "check": "对象与数量准确；in、beside、between等表达实际的相对位置。",
      "source": "static-location"
    },
    {
      "target": "movement-direction",
      "title": "移动方向不能当成静态位置",
      "explanation": "当前移动用主语 + am/is/are + 动词-ing，再保留方向或路径。into指由外进入，out of指由内走出，along指沿着，across指从一侧横穿到另一侧。They are可缩写为They're。in只说明在里面，不能替代going into表达的正在进入。",
      "example": "They are coming out of the hall. / They are walking across the square.",
      "meaning": "他们正在走出大厅。/他们正在横穿广场。",
      "check": "保留当前移动动作；方向和路径与场景一致，不反转内外或横穿方向。",
      "source": "movement-direction"
    }
  ],
  "own": {
    "id": "own-n35-current-scene",
    "prompt": "用一个你熟悉的地方，或明确设定的虚构地图，先问一个设施在哪里，再说明一个确定的静态位置。另描述一组人正在进入、走出、沿行或横穿的画面，讲清移动方向；不知道事实时先确认。自由表达可以使用本组之外的自然句式。保留初答和订正，请伙伴实际听/读并核对位置与方向。",
    "checks": [
      "Where问题是否问位置，be是否与对象数量一致？",
      "位置短语是否与地图或现场事实一致？",
      "当前移动与静态位置是否区分，into/out of及along/across是否清楚？"
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
    "id": "diagnostic-n35-location-question",
    "stage": "diagnostic",
    "target": "location-question",
    "kind": "input",
    "form": "question",
    "context": "你到访一个小镇，需要问一位居民博物馆在哪里。问题只询问位置，不询问里面的活动。",
    "prompt": "询问“博物馆在哪里？”。以Where开头，保留the museum（博物馆），只写一个完整地点问句。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "accepted": [
      "Where is the museum?",
      "Where's the museum?"
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前位置或当前动作的疑问；保留对应be与问句词序。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "why": "museum为单个地点，Where问位置而非动作。",
    "novelty": "首次到访小镇时询问公共地点位置。",
    "counterexamples": [
      {
        "answer": "Where was the museum?",
        "reason": "改成过去时间，不是在问情境中的当前位置或当前动作。"
      },
      {
        "answer": "Where are the museum?",
        "reason": "改变了题目规定的人称或对象数量与be的对应关系。"
      },
      {
        "answer": "Where is the museum.",
        "reason": "句号把任务要求的问句标点改掉了。"
      },
      {
        "answer": "Where is the museum??",
        "reason": "本题要求恰有一个末尾英文问号。"
      }
    ]
  },
  {
    "id": "diagnostic-n35-static-location",
    "stage": "diagnostic",
    "target": "static-location",
    "kind": "input",
    "form": "statement",
    "context": "一份现场图明确显示：咖啡馆位于车站旁边。你向走错路的伙伴说明这条静态位置事实。",
    "prompt": "主语用The cafe（这家咖啡馆），位置用beside the station（车站旁边）。只写一句当前肯定陈述，不加其他信息。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "The cafe is beside the station.",
      "The cafe's beside the station."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "beside说明邻近车站，位置句不需要动作的-ing形式。",
    "novelty": "按现场图给同伴纠正咖啡馆的位置。",
    "counterexamples": [
      {
        "answer": "The cafe was beside the station.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "The cafe is not beside the station.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "The cafe are beside the station.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "The cafe is beside the station?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      },
      {
        "answer": "The cafe is in the station.",
        "reason": "改变了题目地图或现场图明确的静态相对位置。"
      }
    ]
  },
  {
    "id": "diagnostic-n35-movement-direction",
    "stage": "diagnostic",
    "target": "movement-direction",
    "kind": "input",
    "form": "statement",
    "context": "学校活动刚结束，一群孩子此刻正走进体育馆；他们还在门口移动。你用they报告这一方向。",
    "prompt": "主语用They，动词用go（去/走），方向用into the gym（走进体育馆）。只写一句当前肯定陈述。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "They are going into the gym.",
      "They're going into the gym."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "into是从外向内的移动，不能换成静态的in或向外的out of。",
    "novelty": "活动转场时报告孩子正进入体育馆。",
    "counterexamples": [
      {
        "answer": "They were going into the gym.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "They are not going into the gym.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "He are going into the gym.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "They are going into the gym?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      },
      {
        "answer": "They are going out of the gym.",
        "reason": "改变了题目明确的进入、走出、沿行或横穿方向。"
      }
    ]
  },
  {
    "id": "guided-n35-location-question",
    "stage": "guided",
    "target": "location-question",
    "kind": "input",
    "form": "question",
    "context": "你想把一封信交给图书馆前台，但不知道图书馆的位置，向接待员问路。",
    "prompt": "问“图书馆在哪里？”。提示：Where + is + the library（图书馆）；Where is可缩写。只写完整地点问句，句末一个英文问号。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "accepted": [
      "Where is the library?",
      "Where's the library?"
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前位置或当前动作的疑问；保留对应be与问句词序。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "why": "单个图书馆用is，Where后询问的是地点。",
    "novelty": "送信时向接待员询问图书馆所在位置。",
    "counterexamples": [
      {
        "answer": "Where was the library?",
        "reason": "改成过去时间，不是在问情境中的当前位置或当前动作。"
      },
      {
        "answer": "Where are the library?",
        "reason": "改变了题目规定的人称或对象数量与be的对应关系。"
      },
      {
        "answer": "Where is the library.",
        "reason": "句号把任务要求的问句标点改掉了。"
      },
      {
        "answer": "Where is the library??",
        "reason": "本题要求恰有一个末尾英文问号。"
      }
    ]
  },
  {
    "id": "guided-n35-static-location",
    "stage": "guided",
    "target": "static-location",
    "kind": "input",
    "form": "statement",
    "context": "导览图确认：这座塔在两座小山之间。你只描述塔现在的位置。",
    "prompt": "主语用The tower（这座塔），位置用between two hills（两座小山之间）。提示：单数主语 + is + 位置；名词后的is可缩写。只写肯定陈述。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "The tower is between two hills.",
      "The tower's between two hills."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "between明确两座小山之间，two hills保持复数。",
    "novelty": "依据导览图说明塔与两座小山的相对位置。",
    "counterexamples": [
      {
        "answer": "The tower was between two hills.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "The tower is not between two hills.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "The tower are between two hills.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "The tower is between two hills?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      },
      {
        "answer": "The tower is beside two hills.",
        "reason": "改变了题目地图或现场图明确的静态相对位置。"
      }
    ]
  },
  {
    "id": "guided-n35-movement-direction",
    "stage": "guided",
    "target": "movement-direction",
    "kind": "input",
    "form": "statement",
    "context": "一群游客此刻正沿着岸边走，观察员用they指他们。需要说明移动路径，不只报所在位置。",
    "prompt": "主语用They，动词用walk（走），路径用along the bank（沿岸边）。提示：They + are + 动词-ing + 路径；They are可缩写。只写当前肯定陈述。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "They are walking along the bank.",
      "They're walking along the bank."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "along表达顺着岸边的行走路径，不表示横穿水面。",
    "novelty": "岸边游览时报告一组人的移动路径。",
    "counterexamples": [
      {
        "answer": "They were walking along the bank.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "They are not walking along the bank.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "He are walking along the bank.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "They are walking along the bank?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      },
      {
        "answer": "They are walking across the bank.",
        "reason": "改变了题目明确的进入、走出、沿行或横穿方向。"
      }
    ]
  },
  {
    "id": "independent-n35-location-question",
    "stage": "independent",
    "target": "location-question",
    "kind": "input",
    "form": "question",
    "context": "租船柜台说有几艘皮划艇供借用，但你还不知道这些艇在哪里。你向柜台问它们的位置。",
    "prompt": "询问这些皮划艇的位置。以Where开头，保留the kayaks（这些皮划艇），只写一个完整地点问句。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "accepted": [
      "Where are the kayaks?",
      "Where're the kayaks?"
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前位置或当前动作的疑问；保留对应be与问句词序。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "why": "kayaks为复数，所以位置疑问中的be需对应复数。",
    "novelty": "借船时询问多件器材的位置。",
    "counterexamples": [
      {
        "answer": "Where were the kayaks?",
        "reason": "改成过去时间，不是在问情境中的当前位置或当前动作。"
      },
      {
        "answer": "Where is the kayaks?",
        "reason": "改变了题目规定的人称或对象数量与be的对应关系。"
      },
      {
        "answer": "Where are the kayaks.",
        "reason": "句号把任务要求的问句标点改掉了。"
      },
      {
        "answer": "Where are the kayaks??",
        "reason": "本题要求恰有一个末尾英文问号。"
      }
    ]
  },
  {
    "id": "independent-n35-static-location",
    "stage": "independent",
    "target": "static-location",
    "kind": "input",
    "form": "statement",
    "context": "美术馆的平面图显示：出口位于两扇窗户之间。你按图告诉同行者这个位置。",
    "prompt": "主语用The exit（出口），位置用between two windows（两扇窗户之间）。只写一句当前肯定陈述。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "The exit is between two windows.",
      "The exit's between two windows."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "出口为单个，between保留两扇窗户的相对位置。",
    "novelty": "按平面图描述出口位置供同行者辨认。",
    "counterexamples": [
      {
        "answer": "The exit was between two windows.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "The exit is not between two windows.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "The exit are between two windows.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "The exit is between two windows?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      },
      {
        "answer": "The exit is beside two windows.",
        "reason": "改变了题目地图或现场图明确的静态相对位置。"
      }
    ]
  },
  {
    "id": "independent-n35-movement-direction",
    "stage": "independent",
    "target": "movement-direction",
    "kind": "input",
    "form": "statement",
    "context": "运动馆门口，一群队员此刻正走出大厅。你用they告诉等在外面的接应者他们的移动方向。",
    "prompt": "主语用They，动词用come（来/走），方向用out of the hall（走出大厅）。只写一句当前肯定陈述。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "They are coming out of the hall.",
      "They're coming out of the hall."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "out of指从大厅内部向外移动，不能改为into。",
    "novelty": "接应队员时报告正在走出大厅的即时方向。",
    "counterexamples": [
      {
        "answer": "They were coming out of the hall.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "They are not coming out of the hall.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "He are coming out of the hall.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "They are coming out of the hall?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      },
      {
        "answer": "They are coming into the hall.",
        "reason": "改变了题目明确的进入、走出、沿行或横穿方向。"
      }
    ]
  },
  {
    "id": "repair-n35-location-question",
    "stage": "repair",
    "target": "location-question",
    "kind": "input",
    "form": "question",
    "context": "保留上一题原答。新场景中，你带团队进场，却不知道售票处位置，向工作人员询问。",
    "prompt": "另写一个订正后的地点问句。以Where开头，保留the ticket office（售票处），不询问动作，不加称呼。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "accepted": [
      "Where is the ticket office?",
      "Where's the ticket office?"
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前位置或当前动作的疑问；保留对应be与问句词序。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "why": "单个售票处的位置用Where询问，问号须保留。",
    "novelty": "用进场问路场景重新核对静态地点疑问。",
    "counterexamples": [
      {
        "answer": "Where was the ticket office?",
        "reason": "改成过去时间，不是在问情境中的当前位置或当前动作。"
      },
      {
        "answer": "Where are the ticket office?",
        "reason": "改变了题目规定的人称或对象数量与be的对应关系。"
      },
      {
        "answer": "Where is the ticket office.",
        "reason": "句号把任务要求的问句标点改掉了。"
      },
      {
        "answer": "Where is the ticket office??",
        "reason": "本题要求恰有一个末尾英文问号。"
      }
    ]
  },
  {
    "id": "repair-n35-static-location",
    "stage": "repair",
    "target": "static-location",
    "kind": "input",
    "form": "statement",
    "context": "保留上一题原答。新场景的示意图明确显示这座仓库在一条山谷里，你向运输队说明位置。",
    "prompt": "另写一句当前肯定陈述。主语用The warehouse（这座仓库），位置用in a valley（在一条山谷里），不加动作。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "The warehouse is in a valley.",
      "The warehouse's in a valley."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "in a valley描述静态位置，不是进入山谷的动作。",
    "novelty": "根据运输示意图重新区分所在位置与移动方向。",
    "counterexamples": [
      {
        "answer": "The warehouse was in a valley.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "The warehouse is not in a valley.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "The warehouse are in a valley.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "The warehouse is in a valley?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      },
      {
        "answer": "The warehouse is beside a valley.",
        "reason": "改变了题目地图或现场图明确的静态相对位置。"
      }
    ]
  },
  {
    "id": "repair-n35-movement-direction",
    "stage": "repair",
    "target": "movement-direction",
    "kind": "input",
    "form": "statement",
    "context": "保留上一题原答。新画面中，两位游客此刻正走过广场，从一侧向另一侧移动，你用they报告路线。",
    "prompt": "另写一句当前肯定陈述。主语用They，动词用walk（走），路线用across the square（横穿广场），不加其他信息。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "They are walking across the square.",
      "They're walking across the square."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "across指横穿广场，不能替成沿边行走的along。",
    "novelty": "从广场横穿的新画面重新核对路线含义。",
    "counterexamples": [
      {
        "answer": "They were walking across the square.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "They are not walking across the square.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "He are walking across the square.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "They are walking across the square?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      },
      {
        "answer": "They are walking along the square.",
        "reason": "改变了题目明确的进入、走出、沿行或横穿方向。"
      }
    ]
  },
  {
    "id": "review-a-n35-location-question",
    "stage": "review-a",
    "target": "location-question",
    "kind": "input",
    "form": "question",
    "context": "隔一段时间，你需要取活动物资，但还不知道那些箱子放在哪里，向保管员发问。",
    "prompt": "询问那些箱子的位置。以Where开头，保留the boxes（那些箱子），只写一个完整地点问句。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "accepted": [
      "Where are the boxes?",
      "Where're the boxes?"
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前位置或当前动作的疑问；保留对应be与问句词序。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "why": "boxes是复数，Where询问位置，不能变成动作问题。",
    "novelty": "领取活动物资时询问多只箱子的位置。",
    "counterexamples": [
      {
        "answer": "Where were the boxes?",
        "reason": "改成过去时间，不是在问情境中的当前位置或当前动作。"
      },
      {
        "answer": "Where is the boxes?",
        "reason": "改变了题目规定的人称或对象数量与be的对应关系。"
      },
      {
        "answer": "Where are the boxes.",
        "reason": "句号把任务要求的问句标点改掉了。"
      },
      {
        "answer": "Where are the boxes??",
        "reason": "本题要求恰有一个末尾英文问号。"
      }
    ]
  },
  {
    "id": "review-a-n35-static-location",
    "stage": "review-a",
    "target": "static-location",
    "kind": "input",
    "form": "statement",
    "context": "集合点的指示图确认：这间办公室在邮局旁边。你只向伙伴说明办公室的位置。",
    "prompt": "主语用The office（这间办公室），位置用beside the post office（邮局旁边）。只写一句当前肯定陈述。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "The office is beside the post office.",
      "The office's beside the post office."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "beside表示在邮局旁边，不表示在邮局里面。",
    "novelty": "集合问路中依据指示图说明办公室与邮局的关系。",
    "counterexamples": [
      {
        "answer": "The office was beside the post office.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "The office is not beside the post office.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "The office are beside the post office.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "The office is beside the post office?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      },
      {
        "answer": "The office is in the post office.",
        "reason": "改变了题目地图或现场图明确的静态相对位置。"
      }
    ]
  },
  {
    "id": "review-a-n35-movement-direction",
    "stage": "review-a",
    "target": "movement-direction",
    "kind": "input",
    "form": "statement",
    "context": "两位参观者此刻正走进展厅，你已用they指他们，向场馆协调员更新方向。",
    "prompt": "主语用They，动词用go（走），方向用into the gallery（走进展厅）。只写一句当前肯定陈述。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "They are going into the gallery.",
      "They're going into the gallery."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "into是进入，不等同于已经在展厅里的in。",
    "novelty": "场馆协调中报告两人正在进入的方向。",
    "counterexamples": [
      {
        "answer": "They were going into the gallery.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "They are not going into the gallery.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "He are going into the gallery.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "They are going into the gallery?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      },
      {
        "answer": "They are going out of the gallery.",
        "reason": "改变了题目明确的进入、走出、沿行或横穿方向。"
      }
    ]
  },
  {
    "id": "review-b-n35-location-question",
    "stage": "review-b",
    "target": "location-question",
    "kind": "input",
    "form": "question",
    "context": "另一轮检查时，你来到营地，要问管理员厨房在哪里，问题只关心当前位置。",
    "prompt": "询问厨房的位置。以Where开头，保留the kitchen（厨房），只写一个完整地点问句。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "accepted": [
      "Where is the kitchen?",
      "Where's the kitchen?"
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前位置或当前动作的疑问；保留对应be与问句词序。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "why": "kitchen为单个地点，Where is问位置。",
    "novelty": "营地生活中再次询问一个设施位置。",
    "counterexamples": [
      {
        "answer": "Where was the kitchen?",
        "reason": "改成过去时间，不是在问情境中的当前位置或当前动作。"
      },
      {
        "answer": "Where are the kitchen?",
        "reason": "改变了题目规定的人称或对象数量与be的对应关系。"
      },
      {
        "answer": "Where is the kitchen.",
        "reason": "句号把任务要求的问句标点改掉了。"
      },
      {
        "answer": "Where is the kitchen??",
        "reason": "本题要求恰有一个末尾英文问号。"
      }
    ]
  },
  {
    "id": "review-b-n35-static-location",
    "stage": "review-b",
    "target": "static-location",
    "kind": "input",
    "form": "statement",
    "context": "一张经核实的园区图显示：这片公园在学校旁边。你向新同伴说明这一位置事实。",
    "prompt": "主语用The park（这片公园），位置用beside the school（学校旁边）。只写一句当前肯定陈述。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "The park is beside the school.",
      "The park's beside the school."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "旁边是beside；不能从静态图推断正在移动。",
    "novelty": "按园区图说明公园与学校的静态关系。",
    "counterexamples": [
      {
        "answer": "The park was beside the school.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "The park is not beside the school.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "The park are beside the school.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "The park is beside the school?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      },
      {
        "answer": "The park is in the school.",
        "reason": "改变了题目地图或现场图明确的静态相对位置。"
      }
    ]
  },
  {
    "id": "review-b-n35-movement-direction",
    "stage": "review-b",
    "target": "movement-direction",
    "kind": "input",
    "form": "statement",
    "context": "两位泳者此刻正横渡湖面，从一岸向另一岸移动。你用they向岸边伙伴报告路线。",
    "prompt": "主语用They，动词用swim（游泳），路线用across the lake（横渡这片湖）。只写一句当前肯定陈述。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "They are swimming across the lake.",
      "They're swimming across the lake."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "swimming是当前游泳，across说明横渡而不是沿岸。",
    "novelty": "岸边观察中报告两位泳者的横渡路线。",
    "counterexamples": [
      {
        "answer": "They were swimming across the lake.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "They are not swimming across the lake.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "He are swimming across the lake.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "They are swimming across the lake?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      },
      {
        "answer": "They are swimming along the lake.",
        "reason": "改变了题目明确的进入、走出、沿行或横穿方向。"
      }
    ]
  }
];

export const {byId,questionsFor,matches}=bindContent(lesson,questions);
