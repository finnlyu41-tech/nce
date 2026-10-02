import {bindContent} from './content-contract.mjs';

export const lesson = {
  "id": "nce1-27",
  "version": 1,
  "book": "NCE1",
  "lessons": [
    27,
    28
  ],
  "title": "第27–28课 · 几件物品在哪里",
  "goal": "用There are some首次介绍几件物品；用Where are询问已知复数组，并用the/they说明位置。",
  "scope": "练习题使用原创的虚构场景。自动核对仅覆盖题目明确限定的文字句式；题设外的自然表达需人核对。教材课文、原声和漫画可按本组入口查看；文字结果不证明听说能力或掌握程度。",
  "prerequisites": [
    "认识I/you/he/she/it/we/they及be的基本搭配。",
    "先读本题提供的事实和词义；不从姓名或画面推测未说明的信息。"
  ],
  "source": {
    "groupId": "NCE1-27",
    "route": "/#/nce/NCE1/27?tab=listen",
    "mapRoute": "/map/#/learn/nce1-27",
    "languagePath": "/language/NCE1/27.json",
    "languageSha256": "2410876d2bc4142c898548e9252f7faa0f66e2d8b86e966838e4e3f372f41e15",
    "comicKey": "NCE1-27",
    "clips": [
      {
        "target": "plural-existence",
        "label": "听首次介绍若干杂志",
        "start": 31.28,
        "end": 36.45
      },
      {
        "target": "plural-question",
        "label": "听询问书的位置",
        "start": 12.77,
        "end": 16.76
      },
      {
        "target": "plural-location",
        "label": "听复数物品的位置陈述",
        "start": 49.27,
        "end": 53.31
      }
    ]
  },
  "glossary": "cups 杯子；maps 地图；boxes 盒子；tools 工具；bottles 瓶子；chairs 椅子（以上均为复数）；shelf 架子；wall 墙；cupboard 橱柜；door 门；window 窗；some 一些；they 它们。",
  "teaching": [
    {
      "target": "plural-existence",
      "title": "首次介绍几件物品",
      "explanation": "几件尚未介绍的物品用There are some +复数名词+位置。some表示有若干，不说明精确数量；不用于本题已指定的一套物品。There is只配单数，不能与books这样的复数混用。",
      "example": "There are some cups on the shelf.",
      "meaning": "架子上有一些杯子。",
      "check": "There are + some +复数名词；按题目首次介绍的位置。",
      "source": "plural-existence"
    },
    {
      "target": "plural-question",
      "title": "询问已知的几件物品在哪里",
      "explanation": "已确定的一组物品用Where are the +复数名词?；指代已明确且题目要求they时，用Where are they?。本组书面问句不缩写Where are，练习清楚保留完整的are；口语Where’re保留are，但在这些限定完整形式的题目中不使用。",
      "example": "Where are the maps? / Where are they?",
      "meaning": "那些地图在哪里？／它们在哪里？",
      "check": "复数组用are；Where问位置，不问数量或物品种类。",
      "source": "plural-question"
    },
    {
      "target": "plural-location",
      "title": "用they或明确名词说明位置",
      "explanation": "说明已知几件物品的位置用The +复数名词+ are +位置，或They are / They’re +位置。they在题设只指已说清的一组物品，不能换成it；near不是in，on不是under。 by the door/window可表示门边/窗边；on top of可说明架子表面上。",
      "example": "The maps are on the wall. / They’re near the door.",
      "meaning": "那些地图在墙上。／它们在门边。",
      "check": "保持复数名词或they、are和题设位置，不能改数量或介词。",
      "source": "plural-location"
    }
  ],
  "own": {
    "id": "own-n27-expression",
    "prompt": "设计一处真实或虚构的收纳区，首次介绍一组物品，再与伙伴问答该组物品的位置。至少区分一次新引入的some与后续的the/they。可画草图辅助说明；记录实际句子，交人核对。",
    "checks": [
      "是否清楚说明了同一组物品？",
      "复数物品配are，物品名词用复数吗？",
      "位置与实际或声明的布置一致吗？"
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
    "id": "diagnostic-n27-plural-existence",
    "stage": "diagnostic",
    "target": "plural-existence",
    "kind": "input",
    "form": "statement",
    "context": "社区画室新开了收纳区，你首次向来帮忙的人说明架子表面上有一些杯子。cups 杯子（复数）；shelf 架子。",
    "prompt": "用There起句，首次说“架子上有一些杯子”，用some，不写数量。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "There are some cups on the shelf.",
      "There're some cups on the shelf."
    ],
    "criterion": "按题设对象、时间和事实表达：There are some cups on the shelf. / There're some cups on the shelf.；题设外的自然表达可交由人核对。",
    "why": "首次介绍若干物品用There are some和复数名词，不用the冒充已确定的一组。",
    "novelty": "diagnostic：社区画室新开了收纳区，你首次向来帮忙的人说明架子表面上有一些杯子",
    "counterexamples": [
      {
        "answer": "There is some cups on the shelf.",
        "reason": "复数与be或指代不匹配。"
      },
      {
        "answer": "There are the cups on the shelf.",
        "reason": "改变首次引入方式、询问含义或位置。"
      },
      {
        "answer": "There are some cups under the shelf.",
        "reason": "改变指代对象、数量、时间或位置。"
      },
      {
        "answer": "There are no cups on the shelf.",
        "reason": "改变时间、肯否、名词复数或指定句式。"
      }
    ]
  },
  {
    "id": "diagnostic-n27-plural-question",
    "stage": "diagnostic",
    "target": "plural-question",
    "kind": "input",
    "form": "question",
    "context": "那套杯子已归活动组所有，双方都知道是哪套；你不知道当前放在哪儿。cups 杯子（复数）。",
    "prompt": "用the cups指题设已确定的这组物品，询问它们现在在哪里；以Where开头。只写一个以英文问号?结尾的直接位置问句，不加please、时间副词、称呼、其他信息或回答；本题be写完整形式，不使用缩写。",
    "accepted": [
      "Where are the cups?"
    ],
    "criterion": "按题设对象、时间和事实表达：Where are the cups?；题设外的自然表达可交由人核对。",
    "why": "未知的是已确定物品的位置，用Where are，不把询问改成断言或问物品种类。",
    "novelty": "diagnostic：那套杯子已归活动组所有，双方都知道是哪套；你不知道当前放在哪儿",
    "counterexamples": [
      {
        "answer": "Where is the cups?",
        "reason": "复数与be或指代不匹配。"
      },
      {
        "answer": "What are the cups?",
        "reason": "改变首次引入方式、询问含义或位置。"
      },
      {
        "answer": "Where were the cups?",
        "reason": "改变指代对象、数量、时间或位置。"
      },
      {
        "answer": "Where are some cups?",
        "reason": "改变时间、肯否、名词复数或指定句式。"
      }
    ]
  },
  {
    "id": "diagnostic-n27-plural-location",
    "stage": "diagnostic",
    "target": "plural-location",
    "kind": "input",
    "form": "statement",
    "context": "已指定的那套杯子确实在架子表面上；不要说桌子。cups 杯子（复数）；on the shelf 在架子上。",
    "prompt": "用the cups作主语说“那些杯子在架子上”。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "The cups are on the shelf.",
      "The cups are on top of the shelf."
    ],
    "criterion": "按题设对象、时间和事实表达：The cups are on the shelf. / The cups are on top of the shelf.；题设外的自然表达可交由人核对。",
    "why": "位置已得到确认，用are保留复数，并保持同一组物品与指定介词。",
    "novelty": "diagnostic：已指定的那套杯子确实在架子表面上；不要说桌子",
    "counterexamples": [
      {
        "answer": "The cups is on the shelf.",
        "reason": "复数与be或指代不匹配。"
      },
      {
        "answer": "The cups are under the shelf.",
        "reason": "改变首次引入方式、询问含义或位置。"
      },
      {
        "answer": "Some cups are on the shelf.",
        "reason": "改变指代对象、数量、时间或位置。"
      },
      {
        "answer": "The cups were on the shelf.",
        "reason": "改变时间、肯否、名词复数或指定句式。"
      }
    ]
  },
  {
    "id": "guided-n27-plural-existence",
    "stage": "guided",
    "target": "plural-existence",
    "kind": "input",
    "form": "statement",
    "context": "旅行策划室里新增几幅地图，伙伴尚不知道。墙面上有一些地图。maps 地图（复数）；wall 墙。",
    "prompt": "按There are + some +复数物品+位置，首次说明“墙上有一些地图”。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "There are some maps on the wall.",
      "There're some maps on the wall."
    ],
    "criterion": "按题设对象、时间和事实表达：There are some maps on the wall. / There're some maps on the wall.；题设外的自然表达可交由人核对。",
    "why": "首次介绍若干物品用There are some和复数名词，不用the冒充已确定的一组。",
    "novelty": "guided：旅行策划室里新增几幅地图，伙伴尚不知道",
    "counterexamples": [
      {
        "answer": "There is some maps on the wall.",
        "reason": "复数与be或指代不匹配。"
      },
      {
        "answer": "There are the maps on the wall.",
        "reason": "改变首次引入方式、询问含义或位置。"
      },
      {
        "answer": "There are some maps near the door.",
        "reason": "改变指代对象、数量、时间或位置。"
      },
      {
        "answer": "There were some maps on the wall.",
        "reason": "改变时间、肯否、名词复数或指定句式。"
      }
    ]
  },
  {
    "id": "guided-n27-plural-question",
    "stage": "guided",
    "target": "plural-question",
    "kind": "input",
    "form": "question",
    "context": "已确认的一套地图刚被重新收好。你不知道位置，用they指这些地图。",
    "prompt": "用they指题设已确定的这组物品，询问它们现在在哪里；以Where开头。提示：Where + are + they。只写一个以英文问号?结尾的直接位置问句，不加please、时间副词、称呼、其他信息或回答；本题be写完整形式，不使用缩写。",
    "accepted": [
      "Where are they?"
    ],
    "criterion": "按题设对象、时间和事实表达：Where are they?；题设外的自然表达可交由人核对。",
    "why": "未知的是已确定物品的位置，用Where are，不把询问改成断言或问物品种类。",
    "novelty": "guided：已确认的一套地图刚被重新收好",
    "counterexamples": [
      {
        "answer": "Where is they?",
        "reason": "复数与be或指代不匹配。"
      },
      {
        "answer": "What are they?",
        "reason": "改变首次引入方式、询问含义或位置。"
      },
      {
        "answer": "They are here?",
        "reason": "改变指代对象、数量、时间或位置。"
      },
      {
        "answer": "Where were they?",
        "reason": "改变时间、肯否、名词复数或指定句式。"
      }
    ]
  },
  {
    "id": "guided-n27-plural-location",
    "stage": "guided",
    "target": "plural-location",
    "kind": "input",
    "form": "statement",
    "context": "已知的那套地图确认在墙上，本句they只指这些地图。on the wall 在墙上。",
    "prompt": "按They are +位置说明“它们在墙上”。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "They are on the wall.",
      "They're on the wall."
    ],
    "criterion": "按题设对象、时间和事实表达：They are on the wall. / They're on the wall.；题设外的自然表达可交由人核对。",
    "why": "位置已得到确认，用are保留复数，并保持同一组物品与指定介词。",
    "novelty": "guided：已知的那套地图确认在墙上，本句they只指这些地图",
    "counterexamples": [
      {
        "answer": "They is on the wall.",
        "reason": "复数与be或指代不匹配。"
      },
      {
        "answer": "They are near the door.",
        "reason": "改变首次引入方式、询问含义或位置。"
      },
      {
        "answer": "It is on the wall.",
        "reason": "改变指代对象、数量、时间或位置。"
      },
      {
        "answer": "They are not on the wall.",
        "reason": "改变时间、肯否、名词复数或指定句式。"
      }
    ]
  },
  {
    "id": "independent-n27-plural-existence",
    "stage": "independent",
    "target": "plural-existence",
    "kind": "input",
    "form": "statement",
    "context": "手工课前你首次报告桌子下面有一些空盒子。boxes 盒子（复数）；table 桌子；under 在下面。",
    "prompt": "用There起句首次介绍“桌子下面有一些盒子”，只用some boxes，不加empty。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "There are some boxes under the table.",
      "There're some boxes under the table."
    ],
    "criterion": "按题设对象、时间和事实表达：There are some boxes under the table. / There're some boxes under the table.；题设外的自然表达可交由人核对。",
    "why": "首次介绍若干物品用There are some和复数名词，不用the冒充已确定的一组。",
    "novelty": "independent：手工课前你首次报告桌子下面有一些空盒子",
    "counterexamples": [
      {
        "answer": "There is some boxes under the table.",
        "reason": "复数与be或指代不匹配。"
      },
      {
        "answer": "There are the boxes under the table.",
        "reason": "改变首次引入方式、询问含义或位置。"
      },
      {
        "answer": "There are some boxes on the table.",
        "reason": "改变指代对象、数量、时间或位置。"
      },
      {
        "answer": "There are some box under the table.",
        "reason": "改变时间、肯否、名词复数或指定句式。"
      }
    ]
  },
  {
    "id": "independent-n27-plural-question",
    "stage": "independent",
    "target": "plural-question",
    "kind": "input",
    "form": "question",
    "context": "双方知道是哪批工具；你在电话里向负责人问这批工具现在放在哪里。tools 工具（复数）。",
    "prompt": "用the tools指题设已确定的这组物品，询问它们现在在哪里；以Where开头。只写一个以英文问号?结尾的直接位置问句，不加please、时间副词、称呼、其他信息或回答；本题be写完整形式，不使用缩写。",
    "accepted": [
      "Where are the tools?"
    ],
    "criterion": "按题设对象、时间和事实表达：Where are the tools?；题设外的自然表达可交由人核对。",
    "why": "未知的是已确定物品的位置，用Where are，不把询问改成断言或问物品种类。",
    "novelty": "independent：双方知道是哪批工具；你在电话里向负责人问这批工具现在放在哪里",
    "counterexamples": [
      {
        "answer": "Where is the tools?",
        "reason": "复数与be或指代不匹配。"
      },
      {
        "answer": "What are the tools?",
        "reason": "改变首次引入方式、询问含义或位置。"
      },
      {
        "answer": "Where are some tools?",
        "reason": "改变指代对象、数量、时间或位置。"
      },
      {
        "answer": "The tools are near the door?",
        "reason": "改变时间、肯否、名词复数或指定句式。"
      }
    ]
  },
  {
    "id": "independent-n27-plural-location",
    "stage": "independent",
    "target": "plural-location",
    "kind": "input",
    "form": "statement",
    "context": "维修小组刚确认那批工具在门边，本句the tools指这批工具。near the door 门边。",
    "prompt": "用the tools作主语说明“那些工具在门边”。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "The tools are near the door.",
      "The tools are by the door."
    ],
    "criterion": "按题设对象、时间和事实表达：The tools are near the door. / The tools are by the door.；题设外的自然表达可交由人核对。",
    "why": "位置已得到确认，用are保留复数，并保持同一组物品与指定介词。",
    "novelty": "independent：维修小组刚确认那批工具在门边，本句the tools指这批工具",
    "counterexamples": [
      {
        "answer": "The tools is near the door.",
        "reason": "复数与be或指代不匹配。"
      },
      {
        "answer": "The tools are near the window.",
        "reason": "改变首次引入方式、询问含义或位置。"
      },
      {
        "answer": "Some tools are near the door.",
        "reason": "改变指代对象、数量、时间或位置。"
      },
      {
        "answer": "The tools are near the door?",
        "reason": "改变时间、肯否、名词复数或指定句式。"
      }
    ]
  },
  {
    "id": "repair-n27-plural-existence",
    "stage": "repair",
    "target": "plural-existence",
    "kind": "input",
    "form": "statement",
    "context": "小组第一次参观修复工作室，你介绍门边有一些工具。tools 工具（复数）；near the door 门边。",
    "prompt": "用There起句首次说明“门边有一些工具”，只用some tools。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "There are some tools near the door.",
      "There're some tools near the door.",
      "There are some tools by the door.",
      "There're some tools by the door."
    ],
    "criterion": "按题设对象、时间和事实表达：There are some tools near the door. / There're some tools near the door. / There are some tools by the door. / There're some tools by the door.；题设外的自然表达可交由人核对。",
    "why": "首次介绍若干物品用There are some和复数名词，不用the冒充已确定的一组。",
    "novelty": "repair：小组第一次参观修复工作室，你介绍门边有一些工具",
    "counterexamples": [
      {
        "answer": "There is some tools near the door.",
        "reason": "复数与be或指代不匹配。"
      },
      {
        "answer": "There are the tools near the door.",
        "reason": "改变首次引入方式、询问含义或位置。"
      },
      {
        "answer": "There are some tools near the window.",
        "reason": "改变指代对象、数量、时间或位置。"
      },
      {
        "answer": "There were some tools near the door.",
        "reason": "改变时间、肯否、名词复数或指定句式。"
      }
    ]
  },
  {
    "id": "repair-n27-plural-question",
    "stage": "repair",
    "target": "plural-question",
    "kind": "input",
    "form": "question",
    "context": "那批空盒子都已编号，但你还没见到放置位置。boxes 盒子（复数）。",
    "prompt": "用the boxes指题设已确定的这组物品，询问它们现在在哪里；以Where开头。只写一个以英文问号?结尾的直接位置问句，不加please、时间副词、称呼、其他信息或回答；本题be写完整形式，不使用缩写。",
    "accepted": [
      "Where are the boxes?"
    ],
    "criterion": "按题设对象、时间和事实表达：Where are the boxes?；题设外的自然表达可交由人核对。",
    "why": "未知的是已确定物品的位置，用Where are，不把询问改成断言或问物品种类。",
    "novelty": "repair：那批空盒子都已编号，但你还没见到放置位置",
    "counterexamples": [
      {
        "answer": "Where is the boxes?",
        "reason": "复数与be或指代不匹配。"
      },
      {
        "answer": "Where are a box?",
        "reason": "改变首次引入方式、询问含义或位置。"
      },
      {
        "answer": "Where were the boxes?",
        "reason": "改变指代对象、数量、时间或位置。"
      },
      {
        "answer": "What are the boxes?",
        "reason": "改变时间、肯否、名词复数或指定句式。"
      }
    ]
  },
  {
    "id": "repair-n27-plural-location",
    "stage": "repair",
    "target": "plural-location",
    "kind": "input",
    "form": "statement",
    "context": "已编号的那批盒子在桌子下面。用they指这些盒子。under the table 桌子下面。",
    "prompt": "用They作主语说明“它们在桌子下面”。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "They are under the table.",
      "They're under the table."
    ],
    "criterion": "按题设对象、时间和事实表达：They are under the table. / They're under the table.；题设外的自然表达可交由人核对。",
    "why": "位置已得到确认，用are保留复数，并保持同一组物品与指定介词。",
    "novelty": "repair：已编号的那批盒子在桌子下面",
    "counterexamples": [
      {
        "answer": "They is under the table.",
        "reason": "复数与be或指代不匹配。"
      },
      {
        "answer": "They are on the table.",
        "reason": "改变首次引入方式、询问含义或位置。"
      },
      {
        "answer": "It is under the table.",
        "reason": "改变指代对象、数量、时间或位置。"
      },
      {
        "answer": "They were under the table.",
        "reason": "改变时间、肯否、名词复数或指定句式。"
      }
    ]
  },
  {
    "id": "review-a-n27-plural-existence",
    "stage": "review-a",
    "target": "plural-existence",
    "kind": "input",
    "form": "statement",
    "context": "你刚收到志愿活动的布置清单，首次向同事介绍橱柜里面有一些瓶子。bottles 瓶子（复数）；in the cupboard 橱柜里面。",
    "prompt": "用There起句首次说“橱柜里面有一些瓶子”，只用some bottles。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "There are some bottles in the cupboard.",
      "There're some bottles in the cupboard."
    ],
    "criterion": "按题设对象、时间和事实表达：There are some bottles in the cupboard. / There're some bottles in the cupboard.；题设外的自然表达可交由人核对。",
    "why": "首次介绍若干物品用There are some和复数名词，不用the冒充已确定的一组。",
    "novelty": "review-a：你刚收到志愿活动的布置清单，首次向同事介绍橱柜里面有一些瓶子",
    "counterexamples": [
      {
        "answer": "There is some bottles in the cupboard.",
        "reason": "复数与be或指代不匹配。"
      },
      {
        "answer": "There are the bottles in the cupboard.",
        "reason": "改变首次引入方式、询问含义或位置。"
      },
      {
        "answer": "There are some bottles on the cupboard.",
        "reason": "改变指代对象、数量、时间或位置。"
      },
      {
        "answer": "There are not any bottles in the cupboard.",
        "reason": "改变时间、肯否、名词复数或指定句式。"
      }
    ]
  },
  {
    "id": "review-a-n27-plural-question",
    "stage": "review-a",
    "target": "plural-question",
    "kind": "input",
    "form": "question",
    "context": "归还的那几把椅子已经指定；你问新值班的伙伴位置，当前不知道答案。本句they只指这些椅子。",
    "prompt": "用they指题设已确定的这组物品，询问它们现在在哪里；以Where开头。只写一个以英文问号?结尾的直接位置问句，不加please、时间副词、称呼、其他信息或回答；本题be写完整形式，不使用缩写。",
    "accepted": [
      "Where are they?"
    ],
    "criterion": "按题设对象、时间和事实表达：Where are they?；题设外的自然表达可交由人核对。",
    "why": "未知的是已确定物品的位置，用Where are，不把询问改成断言或问物品种类。",
    "novelty": "review-a：归还的那几把椅子已经指定；你问新值班的伙伴位置，当前不知道答案",
    "counterexamples": [
      {
        "answer": "Where is they?",
        "reason": "复数与be或指代不匹配。"
      },
      {
        "answer": "Where are it?",
        "reason": "改变首次引入方式、询问含义或位置。"
      },
      {
        "answer": "Are they near the window?",
        "reason": "改变指代对象、数量、时间或位置。"
      },
      {
        "answer": "Where are they.",
        "reason": "改变时间、肯否、名词复数或指定句式。"
      }
    ]
  },
  {
    "id": "review-a-n27-plural-location",
    "stage": "review-a",
    "target": "plural-location",
    "kind": "input",
    "form": "statement",
    "context": "那套椅子确认在窗边，用the chairs指该套椅子。near the window 窗边。",
    "prompt": "用the chairs作主语说明“那些椅子在窗边”。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "The chairs are near the window.",
      "The chairs are by the window."
    ],
    "criterion": "按题设对象、时间和事实表达：The chairs are near the window. / The chairs are by the window.；题设外的自然表达可交由人核对。",
    "why": "位置已得到确认，用are保留复数，并保持同一组物品与指定介词。",
    "novelty": "review-a：那套椅子确认在窗边，用the chairs指该套椅子",
    "counterexamples": [
      {
        "answer": "The chairs is near the window.",
        "reason": "复数与be或指代不匹配。"
      },
      {
        "answer": "The chairs are near the door.",
        "reason": "改变首次引入方式、询问含义或位置。"
      },
      {
        "answer": "Some chairs are near the window.",
        "reason": "改变指代对象、数量、时间或位置。"
      },
      {
        "answer": "The chairs are not near the window.",
        "reason": "改变时间、肯否、名词复数或指定句式。"
      }
    ]
  },
  {
    "id": "review-b-n27-plural-existence",
    "stage": "review-b",
    "target": "plural-existence",
    "kind": "input",
    "form": "statement",
    "context": "新借用的休息室里，窗边放有几把椅子。你向未看过房间的搭档首次介绍。chairs 椅子（复数）；near the window 窗边。",
    "prompt": "用There起句首次说明“窗边有一些椅子”，不写具体数量，只用some chairs。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "There are some chairs near the window.",
      "There're some chairs near the window.",
      "There are some chairs by the window.",
      "There're some chairs by the window."
    ],
    "criterion": "按题设对象、时间和事实表达：There are some chairs near the window. / There're some chairs near the window. / There are some chairs by the window. / There're some chairs by the window.；题设外的自然表达可交由人核对。",
    "why": "首次介绍若干物品用There are some和复数名词，不用the冒充已确定的一组。",
    "novelty": "review-b：新借用的休息室里，窗边放有几把椅子",
    "counterexamples": [
      {
        "answer": "There is some chairs near the window.",
        "reason": "复数与be或指代不匹配。"
      },
      {
        "answer": "There are the chairs near the window.",
        "reason": "改变首次引入方式、询问含义或位置。"
      },
      {
        "answer": "There are some chairs in the window.",
        "reason": "改变指代对象、数量、时间或位置。"
      },
      {
        "answer": "There are some chairs near the window?",
        "reason": "改变时间、肯否、名词复数或指定句式。"
      }
    ]
  },
  {
    "id": "review-b-n27-plural-question",
    "stage": "review-b",
    "target": "plural-question",
    "kind": "input",
    "form": "question",
    "context": "你和伙伴说的是同一套编号瓶子，需知道现在存放的地方。bottles 瓶子（复数）。",
    "prompt": "用the bottles指题设已确定的这组物品，询问它们现在在哪里；以Where开头。只写一个以英文问号?结尾的直接位置问句，不加please、时间副词、称呼、其他信息或回答；本题be写完整形式，不使用缩写。",
    "accepted": [
      "Where are the bottles?"
    ],
    "criterion": "按题设对象、时间和事实表达：Where are the bottles?；题设外的自然表达可交由人核对。",
    "why": "未知的是已确定物品的位置，用Where are，不把询问改成断言或问物品种类。",
    "novelty": "review-b：你和伙伴说的是同一套编号瓶子，需知道现在存放的地方",
    "counterexamples": [
      {
        "answer": "Where is the bottles?",
        "reason": "复数与be或指代不匹配。"
      },
      {
        "answer": "What are the bottles?",
        "reason": "改变首次引入方式、询问含义或位置。"
      },
      {
        "answer": "Where are some bottles?",
        "reason": "改变指代对象、数量、时间或位置。"
      },
      {
        "answer": "Where were the bottles?",
        "reason": "改变时间、肯否、名词复数或指定句式。"
      }
    ]
  },
  {
    "id": "review-b-n27-plural-location",
    "stage": "review-b",
    "target": "plural-location",
    "kind": "input",
    "form": "statement",
    "context": "伙伴确认那组瓶子全在橱柜里面；本句they指这些瓶子。in the cupboard 橱柜里面。",
    "prompt": "用They作主语说明“它们在橱柜里面”。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "They are in the cupboard.",
      "They're in the cupboard."
    ],
    "criterion": "按题设对象、时间和事实表达：They are in the cupboard. / They're in the cupboard.；题设外的自然表达可交由人核对。",
    "why": "位置已得到确认，用are保留复数，并保持同一组物品与指定介词。",
    "novelty": "review-b：伙伴确认那组瓶子全在橱柜里面；本句they指这些瓶子",
    "counterexamples": [
      {
        "answer": "They is in the cupboard.",
        "reason": "复数与be或指代不匹配。"
      },
      {
        "answer": "They are on the cupboard.",
        "reason": "改变首次引入方式、询问含义或位置。"
      },
      {
        "answer": "It is in the cupboard.",
        "reason": "改变指代对象、数量、时间或位置。"
      },
      {
        "answer": "They were in the cupboard.",
        "reason": "改变时间、肯否、名词复数或指定句式。"
      }
    ]
  }
];

export const {byId,questionsFor,matches}=bindContent(lesson,questions);
