import {bindContent} from './content-contract.mjs';

export const lesson = {
  "id": "nce1-25",
  "version": 1,
  "book": "NCE1",
  "lessons": [
    25,
    26
  ],
  "title": "第25–26课 · 介绍单件物品与询问位置",
  "goal": "首次用a/an介绍一件物品，再用the或it问及说明其位置。",
  "scope": "练习题使用原创的虚构场景。自动核对仅覆盖题目明确限定的文字句式；题设外的自然表达需人核对。教材课文、原声和漫画可按本组入口查看；文字结果不证明听说能力或掌握程度。",
  "prerequisites": [
    "认识I/you/he/she/it/we/they及be的基本搭配。",
    "先读本题提供的事实和词义；不从姓名或画面推测未说明的信息。"
  ],
  "source": {
    "groupId": "NCE1-25",
    "route": "/#/nce/NCE1/25?tab=listen",
    "mapRoute": "/map/#/learn/nce1-25",
    "languagePath": "/language/NCE1/25.json",
    "languageSha256": "3976b9a46adf6923ea7ab87ff6ab22506180e5f285f1ea63294783a608515091",
    "comicKey": "NCE1-25",
    "clips": [
      {
        "target": "introduce-item",
        "label": "听首次介绍一件厨房物品",
        "start": 23.12,
        "end": 27.71
      },
      {
        "target": "ask-location",
        "label": "听已确定物品的位置，为位置问答提供情境",
        "start": 31.62,
        "end": 35.03
      },
      {
        "target": "singular-location",
        "label": "听房间中间的位置陈述",
        "start": 46.22,
        "end": 51.54
      }
    ]
  },
  "glossary": "camera 相机；lamp 灯；box 盒子；empty 空的；armchair 扶手椅；shelf 架子；knife 小刀；cup 杯子；desk 书桌；table 桌子；room 房间；cupboard 橱柜；in 在内部；on 在表面；under 在下方；near 在附近。",
  "teaching": [
    {
      "target": "introduce-item",
      "title": "先介绍一件物品，再谈这件物品",
      "explanation": "第一次向对方介绍场景中有一件单数物品，用There is a/an +名词+位置；后文再指已确定的同一件物品，改用the或it。a/an由后面读音决定，an empty box中的empty开头是元音。There’s可缩写There is，不把There写成It。",
      "example": "There is an empty box in the room.",
      "meaning": "房间里有一个空盒子。",
      "check": "首次引入用a/an；there is表示有，the指已确定的那一个。",
      "source": "introduce-item"
    },
    {
      "target": "ask-location",
      "title": "先问位置，不替对方断言",
      "explanation": "问已确定的一件物品在哪里，用Where is the +名词?。Where’s可缩写Where is。指代已明确且题目要求it时，用Where is it?。问位置与问是什么、有没有不同。",
      "example": "Where is the camera? / Where’s it?",
      "meaning": "那台相机在哪里？／它在哪里？",
      "check": "单件物品用is；Where问位置，句末一个英文?。",
      "source": "ask-location"
    },
    {
      "target": "singular-location",
      "title": "说明同一件物品的位置",
      "explanation": "描述已确认的物品位置，用The +名词+ is +位置，或在题目要求it时用It is / It’s +位置。in表示在范围内部，on表示接触表面，under在下方；on the left/right和in the middle of均作为完整位置短语。 单数明确名词后的is也可缩写为’s。本组部分位置题接受on top of、beneath、below、by或center/centre等同义位置表达；以题目具体范围为准。",
      "example": "The lamp is on the desk. / It’s on the right.",
      "meaning": "那盏灯在书桌上。／它在右边。",
      "check": "先确认被问的同一物品，再按事实保留位置介词。",
      "source": "singular-location"
    }
  ],
  "own": {
    "id": "own-n25-expression",
    "prompt": "选择一个真实或明确虚构的工作角，向伙伴首次介绍一件物品，再问答它的位置。记录你实际写或说的句子；可以用自然表达，不必局限练习题的词汇。若伙伴未确认位置，先问清。",
    "checks": [
      "首次介绍与后续同一物品的a/an、the或it是否清楚？",
      "Where询问的是位置吗？",
      "in/on/under/near是否与实际布置相符？"
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
    "id": "diagnostic-n25-introduce-item",
    "stage": "diagnostic",
    "target": "introduce-item",
    "kind": "input",
    "form": "statement",
    "context": "临时摄影间刚布置好，你向尚未见过房间的伙伴首次介绍：房间内有一台相机。camera 相机；room 房间。",
    "prompt": "说“房间里有一台相机”，用There起句，提到a/an与in the room。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "There is a camera in the room.",
      "There's a camera in the room."
    ],
    "criterion": "按题设对象、时间和事实表达：There is a camera in the room. / There's a camera in the room.；题设外的自然表达可交由人核对。",
    "why": "首次介绍存在的一件物品，使用There is与a/an；不能直接用the指尚未介绍的对象。",
    "novelty": "diagnostic：临时摄影间刚布置好，你向尚未见过房间的伙伴首次介绍：房间内有一台相机",
    "counterexamples": [
      {
        "answer": "There are a camera in the room.",
        "reason": "主语、be或指定句式不符。"
      },
      {
        "answer": "There is the camera in the room.",
        "reason": "冠词、问题含义或位置改变了题设。"
      },
      {
        "answer": "There is a camera on the room.",
        "reason": "改变指定对象、位置或时间。"
      },
      {
        "answer": "There is not a camera in the room.",
        "reason": "改变肯否、时间或题目要求的书面句式。"
      }
    ]
  },
  {
    "id": "diagnostic-n25-ask-location",
    "stage": "diagnostic",
    "target": "ask-location",
    "kind": "input",
    "form": "question",
    "context": "借用的那台相机已确定是哪一台，但你不知道现在放在哪里。直接向保管员询问。camera 相机。",
    "prompt": "问“那台相机在哪里”，用the camera指该物。只写一个以英文问号?结尾的直接问句，不加please、其他信息或回答；允许保持相同意思的缩写。",
    "accepted": [
      "Where is the camera?",
      "Where's the camera?"
    ],
    "criterion": "按题设对象、时间和事实表达：Where is the camera? / Where's the camera?；题设外的自然表达可交由人核对。",
    "why": "所问的是已确定单件物品的位置，Where与is保留了未知位置的询问含义。",
    "novelty": "diagnostic：借用的那台相机已确定是哪一台，但你不知道现在放在哪里",
    "counterexamples": [
      {
        "answer": "Where are the camera?",
        "reason": "主语、be或指定句式不符。"
      },
      {
        "answer": "What is the camera?",
        "reason": "冠词、问题含义或位置改变了题设。"
      },
      {
        "answer": "The camera is on the table?",
        "reason": "改变指定对象、位置或时间。"
      },
      {
        "answer": "Where is a camera?",
        "reason": "改变肯否、时间或题目要求的书面句式。"
      }
    ]
  },
  {
    "id": "diagnostic-n25-singular-location",
    "stage": "diagnostic",
    "target": "singular-location",
    "kind": "input",
    "form": "statement",
    "context": "那台相机已放好并由保管员确认：在桌子表面上。用the camera指这台相机。camera 相机；table 桌子。",
    "prompt": "说“那台相机在桌子上”，用the camera作主语。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "The camera is on the table.",
      "The camera's on the table.",
      "The camera is on top of the table.",
      "The camera's on top of the table."
    ],
    "criterion": "按题设对象、时间和事实表达：The camera is on the table. / The camera's on the table. / The camera is on top of the table. / The camera's on top of the table.；题设外的自然表达可交由人核对。",
    "why": "这是已确认同一物品的当前位置，保留题设主语与介词，不把陈述变成猜问。",
    "novelty": "diagnostic：那台相机已放好并由保管员确认：在桌子表面上",
    "counterexamples": [
      {
        "answer": "The camera are on the table.",
        "reason": "主语、be或指定句式不符。"
      },
      {
        "answer": "The camera is under the table.",
        "reason": "冠词、问题含义或位置改变了题设。"
      },
      {
        "answer": "A camera is on the table.",
        "reason": "改变指定对象、位置或时间。"
      },
      {
        "answer": "The camera was on the table.",
        "reason": "改变肯否、时间或题目要求的书面句式。"
      }
    ]
  },
  {
    "id": "guided-n25-introduce-item",
    "stage": "guided",
    "target": "introduce-item",
    "kind": "input",
    "form": "statement",
    "context": "合租书房里只有一盏灯。伙伴还没进书房，你首次说明桌面上有这盏灯。lamp 灯；desk 书桌；on 在表面上。",
    "prompt": "按There is + a/an +物品+位置写“书桌上有一盏灯”。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "There is a lamp on the desk.",
      "There's a lamp on the desk."
    ],
    "criterion": "按题设对象、时间和事实表达：There is a lamp on the desk. / There's a lamp on the desk.；题设外的自然表达可交由人核对。",
    "why": "首次介绍存在的一件物品，使用There is与a/an；不能直接用the指尚未介绍的对象。",
    "novelty": "guided：合租书房里只有一盏灯",
    "counterexamples": [
      {
        "answer": "It is a lamp on the desk.",
        "reason": "主语、be或指定句式不符。"
      },
      {
        "answer": "There is the lamp on the desk.",
        "reason": "冠词、问题含义或位置改变了题设。"
      },
      {
        "answer": "There is a lamp under the desk.",
        "reason": "改变指定对象、位置或时间。"
      },
      {
        "answer": "There was a lamp on the desk.",
        "reason": "改变肯否、时间或题目要求的书面句式。"
      }
    ]
  },
  {
    "id": "guided-n25-ask-location",
    "stage": "guided",
    "target": "ask-location",
    "kind": "input",
    "form": "question",
    "context": "你和伙伴都知道正在找同一盏灯。你尚不知位置，在这一句用it指这盏灯。it 它。",
    "prompt": "按Where + is + it询问“它在哪里”。只写一个以英文问号?结尾的直接问句，不加please、其他信息或回答；允许保持相同意思的缩写。",
    "accepted": [
      "Where is it?",
      "Where's it?"
    ],
    "criterion": "按题设对象、时间和事实表达：Where is it? / Where's it?；题设外的自然表达可交由人核对。",
    "why": "所问的是已确定单件物品的位置，Where与is保留了未知位置的询问含义。",
    "novelty": "guided：你和伙伴都知道正在找同一盏灯",
    "counterexamples": [
      {
        "answer": "Where are it?",
        "reason": "主语、be或指定句式不符。"
      },
      {
        "answer": "What is it?",
        "reason": "冠词、问题含义或位置改变了题设。"
      },
      {
        "answer": "It is on the desk?",
        "reason": "改变指定对象、位置或时间。"
      },
      {
        "answer": "Where was it?",
        "reason": "改变肯否、时间或题目要求的书面句式。"
      }
    ]
  },
  {
    "id": "guided-n25-singular-location",
    "stage": "guided",
    "target": "singular-location",
    "kind": "input",
    "form": "statement",
    "context": "刚提到的灯已确认在房间右边，本句用it指这盏灯。on the right 在右边。",
    "prompt": "按It is +位置说明“它在右边”。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "It is on the right.",
      "It's on the right."
    ],
    "criterion": "按题设对象、时间和事实表达：It is on the right. / It's on the right.；题设外的自然表达可交由人核对。",
    "why": "这是已确认同一物品的当前位置，保留题设主语与介词，不把陈述变成猜问。",
    "novelty": "guided：刚提到的灯已确认在房间右边，本句用it指这盏灯",
    "counterexamples": [
      {
        "answer": "It are on the right.",
        "reason": "主语、be或指定句式不符。"
      },
      {
        "answer": "It is on the left.",
        "reason": "冠词、问题含义或位置改变了题设。"
      },
      {
        "answer": "There is on the right.",
        "reason": "改变指定对象、位置或时间。"
      },
      {
        "answer": "It is not on the right.",
        "reason": "改变肯否、时间或题目要求的书面句式。"
      }
    ]
  },
  {
    "id": "independent-n25-introduce-item",
    "stage": "independent",
    "target": "introduce-item",
    "kind": "input",
    "form": "statement",
    "context": "道具管理员问储物间是否还有容器。你刚检查：房间里有一个空盒子，之前对方不知道这个盒子。empty 空的；box 盒子；room 房间。",
    "prompt": "首次向对方介绍“房间里有一个空盒子”，以There起句；用empty描述box，位置用in the room。写一个现在时肯定陈述，不加其他信息；可用缩写。句末可无标点或只有一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "There is an empty box in the room.",
      "There's an empty box in the room."
    ],
    "criterion": "按题设对象、时间和事实表达：There is an empty box in the room. / There's an empty box in the room.；题设外的自然表达可交由人核对。",
    "why": "首次介绍存在的一件物品，使用There is与a/an；不能直接用the指尚未介绍的对象。",
    "novelty": "independent：道具管理员问储物间是否还有容器",
    "counterexamples": [
      {
        "answer": "There is a empty box in the room.",
        "reason": "主语、be或指定句式不符。"
      },
      {
        "answer": "There is the empty box in the room.",
        "reason": "冠词、问题含义或位置改变了题设。"
      },
      {
        "answer": "There are an empty box in the room.",
        "reason": "改变指定对象、位置或时间。"
      },
      {
        "answer": "There is an empty box in the room?",
        "reason": "改变肯否、时间或题目要求的书面句式。"
      }
    ]
  },
  {
    "id": "independent-n25-ask-location",
    "stage": "independent",
    "target": "ask-location",
    "kind": "input",
    "form": "question",
    "context": "活动室只有一把双方已知道的扶手椅；你从走廊直接问伙伴它现在的位置，不猜答案。armchair 扶手椅。",
    "prompt": "询问“那把扶手椅在哪里”，用the armchair指该物。只写一个以英文问号?结尾的直接问句，不加please、其他信息或回答；允许保持相同意思的缩写。",
    "accepted": [
      "Where is the armchair?",
      "Where's the armchair?"
    ],
    "criterion": "按题设对象、时间和事实表达：Where is the armchair? / Where's the armchair?；题设外的自然表达可交由人核对。",
    "why": "所问的是已确定单件物品的位置，Where与is保留了未知位置的询问含义。",
    "novelty": "independent：活动室只有一把双方已知道的扶手椅；你从走廊直接问伙伴它现在的位置，不猜答案",
    "counterexamples": [
      {
        "answer": "Where are the armchair?",
        "reason": "主语、be或指定句式不符。"
      },
      {
        "answer": "What is the armchair?",
        "reason": "冠词、问题含义或位置改变了题设。"
      },
      {
        "answer": "Where was the armchair?",
        "reason": "改变指定对象、位置或时间。"
      },
      {
        "answer": "Where is an armchair?",
        "reason": "改变肯否、时间或题目要求的书面句式。"
      }
    ]
  },
  {
    "id": "independent-n25-singular-location",
    "stage": "independent",
    "target": "singular-location",
    "kind": "input",
    "form": "statement",
    "context": "刚介绍过的空盒子现在被放在书桌下方，不接触桌面；用the box指同一个盒子。box 盒子；desk 书桌；under 在下方。",
    "prompt": "说“那个盒子在书桌下面”，用the box作主语。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "The box is under the desk.",
      "The box's under the desk.",
      "The box is beneath the desk.",
      "The box is below the desk.",
      "The box's beneath the desk.",
      "The box's below the desk."
    ],
    "criterion": "按题设对象、时间和事实表达：The box is under the desk. / The box's under the desk. / The box is beneath the desk. / The box is below the desk. / The box's beneath the desk. / The box's below the desk.；题设外的自然表达可交由人核对。",
    "why": "这是已确认同一物品的当前位置，保留题设主语与介词，不把陈述变成猜问。",
    "novelty": "independent：刚介绍过的空盒子现在被放在书桌下方，不接触桌面；用the box指同一个盒子",
    "counterexamples": [
      {
        "answer": "The box are under the desk.",
        "reason": "主语、be或指定句式不符。"
      },
      {
        "answer": "The box is on the desk.",
        "reason": "冠词、问题含义或位置改变了题设。"
      },
      {
        "answer": "A box is under the desk.",
        "reason": "改变指定对象、位置或时间。"
      },
      {
        "answer": "The box is under the desk?",
        "reason": "改变肯否、时间或题目要求的书面句式。"
      }
    ]
  },
  {
    "id": "repair-n25-introduce-item",
    "stage": "repair",
    "target": "introduce-item",
    "kind": "input",
    "form": "statement",
    "context": "展览小组首次向访客说明新的休息角：窗边有一把扶手椅。armchair 扶手椅；near the window 窗边。",
    "prompt": "用There起句介绍“窗边有一把扶手椅”，不增加数量词或其他位置。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "There is an armchair near the window.",
      "There's an armchair near the window.",
      "There is an armchair by the window.",
      "There's an armchair by the window."
    ],
    "criterion": "按题设对象、时间和事实表达：There is an armchair near the window. / There's an armchair near the window. / There is an armchair by the window. / There's an armchair by the window.；题设外的自然表达可交由人核对。",
    "why": "首次介绍存在的一件物品，使用There is与a/an；不能直接用the指尚未介绍的对象。",
    "novelty": "repair：展览小组首次向访客说明新的休息角：窗边有一把扶手椅",
    "counterexamples": [
      {
        "answer": "There is a armchair near the window.",
        "reason": "主语、be或指定句式不符。"
      },
      {
        "answer": "There is the armchair near the window.",
        "reason": "冠词、问题含义或位置改变了题设。"
      },
      {
        "answer": "There is an armchair near the door.",
        "reason": "改变指定对象、位置或时间。"
      },
      {
        "answer": "There was an armchair near the window.",
        "reason": "改变肯否、时间或题目要求的书面句式。"
      }
    ]
  },
  {
    "id": "repair-n25-ask-location",
    "stage": "repair",
    "target": "ask-location",
    "kind": "input",
    "form": "question",
    "context": "录音间的那个架子已由双方指定；你要问现在在哪里，因为房间重新布置过。shelf 架子。",
    "prompt": "问“那个架子在哪里”，用the shelf指双方已指定的架子。只写一个以英文问号?结尾的直接问句，不加please、其他信息或回答；允许保持相同意思的缩写。",
    "accepted": [
      "Where is the shelf?",
      "Where's the shelf?"
    ],
    "criterion": "按题设对象、时间和事实表达：Where is the shelf? / Where's the shelf?；题设外的自然表达可交由人核对。",
    "why": "所问的是已确定单件物品的位置，Where与is保留了未知位置的询问含义。",
    "novelty": "repair：录音间的那个架子已由双方指定；你要问现在在哪里，因为房间重新布置过",
    "counterexamples": [
      {
        "answer": "Where are the shelf?",
        "reason": "主语、be或指定句式不符。"
      },
      {
        "answer": "What is the shelf?",
        "reason": "冠词、问题含义或位置改变了题设。"
      },
      {
        "answer": "Where is a shelf?",
        "reason": "改变指定对象、位置或时间。"
      },
      {
        "answer": "The shelf is near the door?",
        "reason": "改变肯否、时间或题目要求的书面句式。"
      }
    ]
  },
  {
    "id": "repair-n25-singular-location",
    "stage": "repair",
    "target": "singular-location",
    "kind": "input",
    "form": "statement",
    "context": "双方已确认的扶手椅就在窗边，没在门边；本句用it指这把椅子。near the window 窗边；near the door 门边。",
    "prompt": "用It作主语说明“它在窗边”。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "It is near the window.",
      "It's near the window.",
      "It is by the window.",
      "It's by the window."
    ],
    "criterion": "按题设对象、时间和事实表达：It is near the window. / It's near the window. / It is by the window. / It's by the window.；题设外的自然表达可交由人核对。",
    "why": "这是已确认同一物品的当前位置，保留题设主语与介词，不把陈述变成猜问。",
    "novelty": "repair：双方已确认的扶手椅就在窗边，没在门边；本句用it指这把椅子",
    "counterexamples": [
      {
        "answer": "It are near the window.",
        "reason": "主语、be或指定句式不符。"
      },
      {
        "answer": "It is near the door.",
        "reason": "冠词、问题含义或位置改变了题设。"
      },
      {
        "answer": "It was near the window.",
        "reason": "改变指定对象、位置或时间。"
      },
      {
        "answer": "It is not near the window.",
        "reason": "改变肯否、时间或题目要求的书面句式。"
      }
    ]
  },
  {
    "id": "review-a-n25-introduce-item",
    "stage": "review-a",
    "target": "introduce-item",
    "kind": "input",
    "form": "statement",
    "context": "维修接待间里新增了一个架子，伙伴尚不知道这项布置。你首次说明门边有一个架子。shelf 架子；near the door 门边。",
    "prompt": "用There起句说“门边有一个架子”，只介绍这一件新物品。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "There is a shelf near the door.",
      "There's a shelf near the door.",
      "There is a shelf by the door.",
      "There's a shelf by the door."
    ],
    "criterion": "按题设对象、时间和事实表达：There is a shelf near the door. / There's a shelf near the door. / There is a shelf by the door. / There's a shelf by the door.；题设外的自然表达可交由人核对。",
    "why": "首次介绍存在的一件物品，使用There is与a/an；不能直接用the指尚未介绍的对象。",
    "novelty": "review-a：维修接待间里新增了一个架子，伙伴尚不知道这项布置",
    "counterexamples": [
      {
        "answer": "There are a shelf near the door.",
        "reason": "主语、be或指定句式不符。"
      },
      {
        "answer": "There is the shelf near the door.",
        "reason": "冠词、问题含义或位置改变了题设。"
      },
      {
        "answer": "There is a shelf in the door.",
        "reason": "改变指定对象、位置或时间。"
      },
      {
        "answer": "There is no shelf near the door.",
        "reason": "改变肯否、时间或题目要求的书面句式。"
      }
    ]
  },
  {
    "id": "review-a-n25-ask-location",
    "stage": "review-a",
    "target": "ask-location",
    "kind": "input",
    "form": "question",
    "context": "你和搭档正在找已确认的唯一一个瓶子。现在不知道位置，在本句只用it指瓶子，不写名词。",
    "prompt": "直接问“它在哪里”，只用Where、be和it。只写一个以英文问号?结尾的直接问句，不加please、其他信息或回答；允许保持相同意思的缩写。",
    "accepted": [
      "Where is it?",
      "Where's it?"
    ],
    "criterion": "按题设对象、时间和事实表达：Where is it? / Where's it?；题设外的自然表达可交由人核对。",
    "why": "所问的是已确定单件物品的位置，Where与is保留了未知位置的询问含义。",
    "novelty": "review-a：你和搭档正在找已确认的唯一一个瓶子",
    "counterexamples": [
      {
        "answer": "Where are it?",
        "reason": "主语、be或指定句式不符。"
      },
      {
        "answer": "Where was it?",
        "reason": "冠词、问题含义或位置改变了题设。"
      },
      {
        "answer": "Is it on the table?",
        "reason": "改变指定对象、位置或时间。"
      },
      {
        "answer": "It is here?",
        "reason": "改变肯否、时间或题目要求的书面句式。"
      }
    ]
  },
  {
    "id": "review-a-n25-singular-location",
    "stage": "review-a",
    "target": "singular-location",
    "kind": "input",
    "form": "statement",
    "context": "你刚摆好那张桌子并确认它在房间正中间，不在左边或右边。table 桌子；in the middle of the room 在房间中间。",
    "prompt": "用the table作主语说明“那张桌子在房间中间”。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "The table is in the middle of the room.",
      "The table's in the middle of the room.",
      "The table is in the center of the room.",
      "The table is in the centre of the room.",
      "The table's in the center of the room.",
      "The table's in the centre of the room."
    ],
    "criterion": "按题设对象、时间和事实表达：The table is in the middle of the room. / The table's in the middle of the room. / The table is in the center of the room. / The table is in the centre of the room. / The table's in the center of the room. / The table's in the centre of the room.；题设外的自然表达可交由人核对。",
    "why": "这是已确认同一物品的当前位置，保留题设主语与介词，不把陈述变成猜问。",
    "novelty": "review-a：你刚摆好那张桌子并确认它在房间正中间，不在左边或右边",
    "counterexamples": [
      {
        "answer": "The table are in the middle of the room.",
        "reason": "主语、be或指定句式不符。"
      },
      {
        "answer": "The table is on the middle of the room.",
        "reason": "冠词、问题含义或位置改变了题设。"
      },
      {
        "answer": "The table is on the left.",
        "reason": "改变指定对象、位置或时间。"
      },
      {
        "answer": "The table was in the middle of the room.",
        "reason": "改变肯否、时间或题目要求的书面句式。"
      }
    ]
  },
  {
    "id": "review-b-n25-introduce-item",
    "stage": "review-b",
    "target": "introduce-item",
    "kind": "input",
    "form": "statement",
    "context": "收拾手工材料时，你第一次向搭档提到桌面上有一把小刀。knife 小刀；table 桌子；on 在表面上。本题只陈述布置，不要求使用小刀。",
    "prompt": "用There起句首次说明“桌子上有一把小刀”。只用knife和on the table。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "There is a knife on the table.",
      "There's a knife on the table."
    ],
    "criterion": "按题设对象、时间和事实表达：There is a knife on the table. / There's a knife on the table.；题设外的自然表达可交由人核对。",
    "why": "首次介绍存在的一件物品，使用There is与a/an；不能直接用the指尚未介绍的对象。",
    "novelty": "review-b：收拾手工材料时，你第一次向搭档提到桌面上有一把小刀",
    "counterexamples": [
      {
        "answer": "There are a knife on the table.",
        "reason": "主语、be或指定句式不符。"
      },
      {
        "answer": "There is the knife on the table.",
        "reason": "冠词、问题含义或位置改变了题设。"
      },
      {
        "answer": "There is a knife under the table.",
        "reason": "改变指定对象、位置或时间。"
      },
      {
        "answer": "There is not a knife on the table.",
        "reason": "改变肯否、时间或题目要求的书面句式。"
      }
    ]
  },
  {
    "id": "review-b-n25-ask-location",
    "stage": "review-b",
    "target": "ask-location",
    "kind": "input",
    "form": "question",
    "context": "比赛用的那只杯子已经贴好专属编号，双方知道是哪只。你问志愿者现在放在哪里。cup 杯子。",
    "prompt": "询问“那只杯子在哪里”，明确用the cup，不补其他信息。只写一个以英文问号?结尾的直接问句，不加please、其他信息或回答；允许保持相同意思的缩写。",
    "accepted": [
      "Where is the cup?",
      "Where's the cup?"
    ],
    "criterion": "按题设对象、时间和事实表达：Where is the cup? / Where's the cup?；题设外的自然表达可交由人核对。",
    "why": "所问的是已确定单件物品的位置，Where与is保留了未知位置的询问含义。",
    "novelty": "review-b：比赛用的那只杯子已经贴好专属编号，双方知道是哪只",
    "counterexamples": [
      {
        "answer": "Where are the cup?",
        "reason": "主语、be或指定句式不符。"
      },
      {
        "answer": "What is the cup?",
        "reason": "冠词、问题含义或位置改变了题设。"
      },
      {
        "answer": "Where is a cup?",
        "reason": "改变指定对象、位置或时间。"
      },
      {
        "answer": "Where is the cup.",
        "reason": "改变肯否、时间或题目要求的书面句式。"
      }
    ]
  },
  {
    "id": "review-b-n25-singular-location",
    "stage": "review-b",
    "target": "singular-location",
    "kind": "input",
    "form": "statement",
    "context": "已编号的那个杯子在橱柜内部的储物格中；本句it只指该杯子。in the cupboard表示在橱柜里面。",
    "prompt": "用It作主语说明“它在橱柜里面”，只用in the cupboard作位置。写一个现在时肯定陈述；不补其他信息，可用明确对应的缩写。句末可不写标点或只写一个英文句号.，不用问号或感叹号。",
    "accepted": [
      "It is in the cupboard.",
      "It's in the cupboard."
    ],
    "criterion": "按题设对象、时间和事实表达：It is in the cupboard. / It's in the cupboard.；题设外的自然表达可交由人核对。",
    "why": "这是已确认同一物品的当前位置，保留题设主语与介词，不把陈述变成猜问。",
    "novelty": "review-b：已编号的那个杯子在架子内部的储物格中",
    "counterexamples": [
      {
        "answer": "It are in the cupboard.",
        "reason": "主语、be或指定句式不符。"
      },
      {
        "answer": "It is on the cupboard.",
        "reason": "冠词、问题含义或位置改变了题设。"
      },
      {
        "answer": "It was in the cupboard.",
        "reason": "改变指定对象、位置或时间。"
      },
      {
        "answer": "It is not in the cupboard.",
        "reason": "改变肯否、时间或题目要求的书面句式。"
      }
    ]
  }
];

export const {byId,questionsFor,matches}=bindContent(lesson,questions);
