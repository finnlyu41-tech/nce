import {bindContent} from './content-contract.mjs';

export const lesson = {
  "id": "nce1-31",
  "version": 1,
  "book": "NCE1",
  "lessons": [
    31,
    32
  ],
  "title": "第31–32课 · 问清并说明一个人或动物正在做什么",
  "goal": "在当前观察情境中询问单个人的动作，并用单数主语说明一个人或动物正在进行的动作。",
  "scope": "本组只核对题目规定的主语、词汇和输出边界。短句可省略末尾句号或使用一个英文句号；问句必须以一个英文问号结束。大小写和词间空格不改变含义；否定、人称、时态、词序与标点含义需保留。未完成限定题不表示所有其他自然英文错误；自然扩展表达请在自由表达中由伙伴核对。",
  "prerequisites": [
    "已接触be的单复数形式、基本人称代词及对应组之前的词汇；每题仍给出所需词义和明确情境。"
  ],
  "source": {
    "groupId": "NCE1-31",
    "route": "/#/nce/NCE1/31?tab=listen",
    "mapRoute": "/map/#/learn/nce1-31",
    "languagePath": "/language/NCE1/31.json",
    "languageSha256": "1a44ac02f60db4f351853f247b96c5262634fa0fdda1c2d51ff50496d27eb4f8",
    "sourceSha256": "1a44ac02f60db4f351853f247b96c5262634fa0fdda1c2d51ff50496d27eb4f8",
    "comicKey": "NCE1-31",
    "clips": [
      {
        "target": "action-question",
        "label": "听单数What动作疑问",
        "start": 21.45,
        "end": 23.47
      },
      {
        "target": "person-action",
        "label": "听单个人的坐与攀爬动作",
        "start": 23.47,
        "end": 34.68
      },
      {
        "target": "animal-action",
        "label": "听单只动物当前动作和横穿路线",
        "start": 46.89,
        "end": 50.02
      }
    ]
  },
  "glossary": "wait 等候；chase 追逐；cut 剪；paper 纸；sleep 睡觉；draw 画；map 地图；swim 游泳；across 横穿；river 河；open 打开；box 盒子；jump 跳；over 越过；wash 清洗；cup 杯子；climb 爬；wall 墙；read 读；book 书；eat 吃；leaf 叶子。人物和场景为原创虚构。",
  "teaching": [
    {
      "target": "action-question",
      "title": "询问单个人此刻的动作",
      "explanation": "动作未知时问What is he/she doing?。What问“做什么”，Where问“在哪里”。What is可写成What's；he和she根据情境中的指代选用。此处只问当前动作，不猜具体行为。问句以一个英文问号结束。",
      "example": "What is she doing? / What's she doing?",
      "meaning": "她正在做什么？",
      "check": "What询问当前动作；单数主语搭配is；保留doing与问号。",
      "source": "action-question"
    },
    {
      "target": "person-action",
      "title": "报告一个人正在进行的动作",
      "explanation": "用He/She + is + 动词-ing描述此刻观察到的动作。He is、She is可缩写成He's、She's。大多数动词加-ing；以不发音e结尾的动词通常去e再加-ing；cut变cutting。不能用过去时报告当前画面，也不能把正在发生的动作改成否定。",
      "example": "She is cutting paper. / She's cutting paper.",
      "meaning": "她正在剪纸。",
      "check": "人称指代和当前动作一致；保留is或其缩写及正确动词形式。",
      "source": "person-action"
    },
    {
      "target": "animal-action",
      "title": "用it报告一只动物的动作与路线",
      "explanation": "指代一只动物可用It + is + 动词-ing，It is可写成It's。chase变chasing，swim变swimming。宾语和路线是动作含义的一部分：across是横穿，over是越过；不能只因为主语和动词相同就换掉对象或路径。",
      "example": "It is jumping over a box. / It's jumping over a box.",
      "meaning": "它正在跳过一个盒子。",
      "check": "it指题中单只动物；动作、对象和路线与事实一致。",
      "source": "animal-action"
    }
  ],
  "own": {
    "id": "own-n31-current-scene",
    "prompt": "选择一个你现在能观察到的人或动物，或明确设定一个虚构的当前画面。先向伙伴问那个人正在做什么，再描述一个人的动作和一只动物的动作；看不清时先确认，不猜。保留你最初说/写的内容和后来订正的内容。可以用自然词汇表达，不限于本组短句。请伙伴核对实际含义。",
    "checks": [
      "问句是否询问动作，人称是否对应观察对象？",
      "陈述是否说明当前动作，并保留动作对象或路径？",
      "订正是否保留原答供比较；伙伴是否实际听/读过表达？"
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
    "id": "diagnostic-n31-action-question",
    "stage": "diagnostic",
    "target": "action-question",
    "kind": "input",
    "form": "question",
    "context": "画室直播暂停了声音。屏幕里一位女子正在做事，你看不清她手上的东西，问能看清的同伴。",
    "prompt": "询问“她正在做什么？”。用What发问，主语用she，不猜具体动作；只写一个完整问句。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "accepted": [
      "What is she doing?",
      "What's she doing?"
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前位置或当前动作的疑问；保留对应be与问句词序。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "why": "动作未知，What问动作；she指屏幕里的女子。",
    "novelty": "无声画室直播中向能看清的人补问动作。",
    "counterexamples": [
      {
        "answer": "What was she doing?",
        "reason": "改成过去时间，不是在问情境中的当前位置或当前动作。"
      },
      {
        "answer": "What is he doing?",
        "reason": "改变了题目规定的人称或对象数量与be的对应关系。"
      },
      {
        "answer": "What is she doing.",
        "reason": "句号把任务要求的问句标点改掉了。"
      },
      {
        "answer": "What is she doing??",
        "reason": "本题要求恰有一个末尾英文问号。"
      }
    ]
  },
  {
    "id": "diagnostic-n31-person-action",
    "stage": "diagnostic",
    "target": "person-action",
    "kind": "input",
    "form": "statement",
    "context": "快递员刚按门铃。你从监控中看到一位男子此刻在门旁等候，向室友说明他目前的动作。",
    "prompt": "用He作主语、wait（等候）作动词，写一句当前的肯定陈述；不加地点或时间词。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "He is waiting.",
      "He's waiting."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "He对应一位男子，正在等候需要现在进行时。",
    "novelty": "从门口监控说明快递员当前行为。",
    "counterexamples": [
      {
        "answer": "He was waiting.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "He is not waiting.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "She is waiting.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "He is waiting?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      }
    ]
  },
  {
    "id": "diagnostic-n31-animal-action",
    "stage": "diagnostic",
    "target": "animal-action",
    "kind": "input",
    "form": "statement",
    "context": "宠物摄像头里，小狗正追逐一个球。你已用it指这只狗；朋友问它现在干什么。",
    "prompt": "主语用It，动词用chase（追逐），宾语用a ball（一个球）。只写一句当前肯定陈述，不加其他信息。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "It is chasing a ball.",
      "It's chasing a ball."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "it指一只动物；chase变成chasing，宾语保留球。",
    "novelty": "远程宠物画面中核对狗的玩耍对象。",
    "counterexamples": [
      {
        "answer": "It was chasing a ball.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "It is not chasing a ball.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "They is chasing a ball.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "It is chasing a ball?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      }
    ]
  },
  {
    "id": "guided-n31-action-question",
    "stage": "guided",
    "target": "action-question",
    "kind": "input",
    "form": "question",
    "context": "海报制作现场，一位男子背对你工作。你要问负责协调的人他的当前动作。",
    "prompt": "问“他正在做什么？”。提示：What + is + he + doing；也可缩写What is。只写完整问句，句末一个英文问号。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "accepted": [
      "What is he doing?",
      "What's he doing?"
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前位置或当前动作的疑问；保留对应be与问句词序。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "why": "单数he搭配is，What询问动作而不是地点。",
    "novelty": "制作海报时向协调者问背向自己的工作人员。",
    "counterexamples": [
      {
        "answer": "What was he doing?",
        "reason": "改成过去时间，不是在问情境中的当前位置或当前动作。"
      },
      {
        "answer": "What is she doing?",
        "reason": "改变了题目规定的人称或对象数量与be的对应关系。"
      },
      {
        "answer": "What is he doing.",
        "reason": "句号把任务要求的问句标点改掉了。"
      },
      {
        "answer": "What is he doing??",
        "reason": "本题要求恰有一个末尾英文问号。"
      }
    ]
  },
  {
    "id": "guided-n31-person-action",
    "stage": "guided",
    "target": "person-action",
    "kind": "input",
    "form": "statement",
    "context": "线上手工课中，一位女子此刻正在剪纸，老师请你描述这个画面。",
    "prompt": "主语用She，动词用cut（剪），宾语用paper（纸）。提示：单数主语 + is + 动词-ing；cut需双写t。只写当前肯定陈述。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "She is cutting paper.",
      "She's cutting paper."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "cut的进行形式是cutting；paper这里是不可数材料，不加a。",
    "novelty": "手工课中描述正在进行的纸艺步骤。",
    "counterexamples": [
      {
        "answer": "She was cutting paper.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "She is not cutting paper.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "He is cutting paper.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "She is cutting paper?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      }
    ]
  },
  {
    "id": "guided-n31-animal-action",
    "stage": "guided",
    "target": "animal-action",
    "kind": "input",
    "form": "statement",
    "context": "护理员观察一只猫。猫此刻躺在垫子上睡觉，护理员只要你报它的动作，不要位置。",
    "prompt": "主语用It，动词用sleep（睡觉）。提示：It + is + 动词-ing；It is可缩写。只写当前肯定陈述，不写位置。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "It is sleeping.",
      "It's sleeping."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "这只猫此刻睡觉，用is sleeping；垫子位置不属于本题输出。",
    "novelty": "动物护理时按要求只报告当前状态中的动作。",
    "counterexamples": [
      {
        "answer": "It was sleeping.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "It is not sleeping.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "They is sleeping.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "It is sleeping?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      }
    ]
  },
  {
    "id": "independent-n31-action-question",
    "stage": "independent",
    "target": "action-question",
    "kind": "input",
    "form": "question",
    "context": "舞台灯光遮住一位女子的手部动作。你向站在另一侧的搭档询问她此刻干什么，以决定是否上台。",
    "prompt": "问她当前在做什么，主语用she，以What开头。只写一个动作问句，不加称呼或具体动作。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "accepted": [
      "What is she doing?",
      "What's she doing?"
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前位置或当前动作的疑问；保留对应be与问句词序。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "why": "询问动作，不能把What换成询问地点的Where。",
    "novelty": "舞台侧翼根据他人视角获取动作信息。",
    "counterexamples": [
      {
        "answer": "What was she doing?",
        "reason": "改成过去时间，不是在问情境中的当前位置或当前动作。"
      },
      {
        "answer": "What is he doing?",
        "reason": "改变了题目规定的人称或对象数量与be的对应关系。"
      },
      {
        "answer": "What is she doing.",
        "reason": "句号把任务要求的问句标点改掉了。"
      },
      {
        "answer": "What is she doing??",
        "reason": "本题要求恰有一个末尾英文问号。"
      }
    ]
  },
  {
    "id": "independent-n31-person-action",
    "stage": "independent",
    "target": "person-action",
    "kind": "input",
    "form": "statement",
    "context": "寻路小组中，一位女子正给大家画一张地图。你向刚到的人说明她当前做的事。",
    "prompt": "主语用She，动词用draw（画），宾语用a map（一张地图）。只写一句当前肯定陈述，不加其他信息。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "She is drawing a map.",
      "She's drawing a map."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "当前画图的主体是一位女子；a map保留单个地图。",
    "novelty": "寻路活动中给新来的成员说明正在进行的准备。",
    "counterexamples": [
      {
        "answer": "She was drawing a map.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "She is not drawing a map.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "He is drawing a map.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "She is drawing a map?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      }
    ]
  },
  {
    "id": "independent-n31-animal-action",
    "stage": "independent",
    "target": "animal-action",
    "kind": "input",
    "form": "statement",
    "context": "河岸摄像头记录一只鸭子正横穿河面。观察员已把它称为it；你只报告它的动作和路线。",
    "prompt": "主语用It，动词用swim（游泳），路线用across the river（横穿这条河）。只写一句当前肯定陈述。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "It is swimming across the river.",
      "It's swimming across the river."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "swim需双写m，across说明从河的一侧到另一侧。",
    "novelty": "自然观察中依据当前画面报告单只动物的移动路线。",
    "counterexamples": [
      {
        "answer": "It was swimming across the river.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "It is not swimming across the river.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "They is swimming across the river.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "It is swimming across the river?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      }
    ]
  },
  {
    "id": "repair-n31-action-question",
    "stage": "repair",
    "target": "action-question",
    "kind": "input",
    "form": "question",
    "context": "保留你上一题的原答供比较。新的场景是厨房里一位男子挡住了台面，你向旁边同伴询问他此刻做什么。",
    "prompt": "另写一个订正后的动作问句。主语用he，以What开头，不猜具体动作，不加称呼。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "accepted": [
      "What is he doing?",
      "What's he doing?"
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前位置或当前动作的疑问；保留对应be与问句词序。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "why": "What问动作，he对应新的男性人物，问句需要问号。",
    "novelty": "用厨房的新观察角度重新检查动作疑问，原答留作对照。",
    "counterexamples": [
      {
        "answer": "What was he doing?",
        "reason": "改成过去时间，不是在问情境中的当前位置或当前动作。"
      },
      {
        "answer": "What is she doing?",
        "reason": "改变了题目规定的人称或对象数量与be的对应关系。"
      },
      {
        "answer": "What is he doing.",
        "reason": "句号把任务要求的问句标点改掉了。"
      },
      {
        "answer": "What is he doing??",
        "reason": "本题要求恰有一个末尾英文问号。"
      }
    ]
  },
  {
    "id": "repair-n31-person-action",
    "stage": "repair",
    "target": "person-action",
    "kind": "input",
    "form": "statement",
    "context": "保留上一题原答。新场景中，一位男子正打开一个盒子，摄影师要你用一句话记录这一刻。",
    "prompt": "另写一句当前肯定陈述。主语用He，动词用open（打开），宾语用a box（一个盒子），不加其他信息。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "He is opening a box.",
      "He's opening a box."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "动作此刻发生，不是过去已打开；主体和单个盒子均需保留。",
    "novelty": "摄影现场记录开箱的一刻，重新核对人称与当前时间。",
    "counterexamples": [
      {
        "answer": "He was opening a box.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "He is not opening a box.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "She is opening a box.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "He is opening a box?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      }
    ]
  },
  {
    "id": "repair-n31-animal-action",
    "stage": "repair",
    "target": "animal-action",
    "kind": "input",
    "form": "statement",
    "context": "保留上一题原答。新场景中，小猫正跳过一个盒子，你在一份观察记录里继续用it指它。",
    "prompt": "另写一句当前肯定陈述。主语用It，动词用jump（跳），路线用over a box（越过一个盒子），不加其他信息。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "It is jumping over a box.",
      "It's jumping over a box."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "over说明越过盒子，与跳入盒子不同；it指单只小猫。",
    "novelty": "以小猫越过障碍的新事件订正当前动作表达。",
    "counterexamples": [
      {
        "answer": "It was jumping over a box.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "It is not jumping over a box.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "They is jumping over a box.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "It is jumping over a box?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      }
    ]
  },
  {
    "id": "review-a-n31-action-question",
    "stage": "review-a",
    "target": "action-question",
    "kind": "input",
    "form": "question",
    "context": "隔一段时间再看救援队训练画面：一位男子在远处操作工具，你看不清操作内容，向近处教练询问。",
    "prompt": "询问他当前在做什么；主语用he，以What开头，只写一个完整动作问句。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "accepted": [
      "What is he doing?",
      "What's he doing?"
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前位置或当前动作的疑问；保留对应be与问句词序。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "why": "询问当前未知动作；he不能被替成描述其他人的she。",
    "novelty": "训练观察中在新距离与人物下再次询问动作。",
    "counterexamples": [
      {
        "answer": "What was he doing?",
        "reason": "改成过去时间，不是在问情境中的当前位置或当前动作。"
      },
      {
        "answer": "What is she doing?",
        "reason": "改变了题目规定的人称或对象数量与be的对应关系。"
      },
      {
        "answer": "What is he doing.",
        "reason": "句号把任务要求的问句标点改掉了。"
      },
      {
        "answer": "What is he doing??",
        "reason": "本题要求恰有一个末尾英文问号。"
      }
    ]
  },
  {
    "id": "review-a-n31-person-action",
    "stage": "review-a",
    "target": "person-action",
    "kind": "input",
    "form": "statement",
    "context": "咖啡店打烊前，一位女子此刻正在清洗一个杯子。你向值班同伴说这个动作。",
    "prompt": "主语用She，动词用wash（清洗），宾语用a cup（一个杯子）。只写一句当前肯定陈述。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "She is washing a cup.",
      "She's washing a cup."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "此刻正在洗杯子，不能说成习惯性每天洗杯子。",
    "novelty": "打烊收尾时描述正在清洗的具体单件物品。",
    "counterexamples": [
      {
        "answer": "She was washing a cup.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "She is not washing a cup.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "He is washing a cup.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "She is washing a cup?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      }
    ]
  },
  {
    "id": "review-a-n31-animal-action",
    "stage": "review-a",
    "target": "animal-action",
    "kind": "input",
    "form": "statement",
    "context": "仓库探头里，一只猫正爬上一堵墙。你用it继续描述它，提醒管理员看这一刻。",
    "prompt": "主语用It，动词用climb（爬），宾语用a wall（一堵墙）。只写一句当前肯定陈述，不加其他信息。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "It is climbing a wall.",
      "It's climbing a wall."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "climbing说明当前爬墙动作，不是已经处于墙上的位置。",
    "novelty": "仓库监控中报告动物攀爬的即时动作。",
    "counterexamples": [
      {
        "answer": "It was climbing a wall.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "It is not climbing a wall.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "They is climbing a wall.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "It is climbing a wall?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      }
    ]
  },
  {
    "id": "review-b-n31-action-question",
    "stage": "review-b",
    "target": "action-question",
    "kind": "input",
    "form": "question",
    "context": "另一轮检查时，展厅里一位女子低头忙碌，你想从同事那里得知她此刻的动作。",
    "prompt": "询问她当前在做什么；主语用she，以What开头，只写一个完整动作问句。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "accepted": [
      "What is she doing?",
      "What's she doing?"
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前位置或当前动作的疑问；保留对应be与问句词序。 句末只用一个英文问号?；允许词内缩写撇号，不加其他标点。",
    "why": "动作未知时问What，不预先编造动作。",
    "novelty": "展厅协作中再次从他人处询问当前动作。",
    "counterexamples": [
      {
        "answer": "What was she doing?",
        "reason": "改成过去时间，不是在问情境中的当前位置或当前动作。"
      },
      {
        "answer": "What is he doing?",
        "reason": "改变了题目规定的人称或对象数量与be的对应关系。"
      },
      {
        "answer": "What is she doing.",
        "reason": "句号把任务要求的问句标点改掉了。"
      },
      {
        "answer": "What is she doing??",
        "reason": "本题要求恰有一个末尾英文问号。"
      }
    ]
  },
  {
    "id": "review-b-n31-person-action",
    "stage": "review-b",
    "target": "person-action",
    "kind": "input",
    "form": "statement",
    "context": "公交候车区，一位男子正读一本书，你向看不到他手部的朋友说明这件事。",
    "prompt": "主语用He，动词用read（读），宾语用a book（一本书）。只写一句当前肯定陈述。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "He is reading a book.",
      "He's reading a book."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "read在此刻发生的动作中用reading，并保留a book。",
    "novelty": "候车时向视线受阻的朋友报告读书动作。",
    "counterexamples": [
      {
        "answer": "He was reading a book.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "He is not reading a book.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "She is reading a book.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "He is reading a book?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      }
    ]
  },
  {
    "id": "review-b-n31-animal-action",
    "stage": "review-b",
    "target": "animal-action",
    "kind": "input",
    "form": "statement",
    "context": "水族馆里，一只海龟正吃一片叶子。记录员用it指它，请你把这个当前动作写下来。",
    "prompt": "主语用It，动词用eat（吃），宾语用a leaf（一片叶子）。只写一句当前肯定陈述。 不加时间副词、称呼或其他修饰；只用题目规定的词汇和完成基本问句或陈述所需的成分。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "accepted": [
      "It is eating a leaf.",
      "It's eating a leaf."
    ],
    "criterion": "按本题规定的主语和词汇完整表达当前肯定事实；be与主语一致，动作对象、位置或路径不变。 可省略末尾标点或用一个英文句号结束，不用问号或感叹号。",
    "why": "it指单只海龟；当前吃叶子与已经吃完不同。",
    "novelty": "水族馆记录一只动物的当前进食对象。",
    "counterexamples": [
      {
        "answer": "It was eating a leaf.",
        "reason": "改成过去时，未表达题中当前事实。"
      },
      {
        "answer": "It is not eating a leaf.",
        "reason": "否定了题中明确的肯定事实。"
      },
      {
        "answer": "They is eating a leaf.",
        "reason": "改变了指定主语，或使be与主语数量不一致。"
      },
      {
        "answer": "It is eating a leaf?",
        "reason": "问号使肯定陈述变成确认式询问，未完成本题陈述任务。"
      }
    ]
  }
];

export const {byId,questionsFor,matches}=bindContent(lesson,questions);
