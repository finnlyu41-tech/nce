import {bindContent} from './content-contract.mjs';

export const lesson = {
  "id": "nce1-43",
  "version": 1,
  "book": "NCE1",
  "lessons": [
    43,
    44
  ],
  "title": "第43–44课 · 核对复数及不可数物的存量",
  "goal": "用there be询问复数或不可数物的存量，区分肯定some与零存量的否定any。",
  "scope": "限定题只判题目指定的主语、词汇、语义和输出形式；不排斥限定范围以外的自然英文。问句须以一个英文问号结束；陈述、命令及数量短语可省略句号或保留一个英文句号。大小写、空格及直/弯撇号不影响含义。自由表达接受自然等义句，待实际人工核对。",
  "prerequisites": [
    "已完成第41–42课单数及不可数存在询问，接触名词复数、be否定与位置表达。",
    "每题提供所需新词中文义；不根据背景推断未给出的事实。"
  ],
  "source": {
    "groupId": "NCE1-43",
    "route": "/#/nce/NCE1/43?tab=listen",
    "mapRoute": "/map/#/learn/nce1-43",
    "languagePath": "/language/NCE1/43.json",
    "languageSha256": "cee661fac2f21ef8c9ae9e19b81be3c3b207e48fdc2e082801eaeffe2da6c27a",
    "sourceSha256": "cee661fac2f21ef8c9ae9e19b81be3c3b207e48fdc2e082801eaeffe2da6c27a",
    "comicKey": "NCE1-43",
    "clips": [
      {
        "target": "stock-question",
        "label": "听第43课相关片段 · 中性存量询问",
        "start": 27.3,
        "end": 33.61
      },
      {
        "target": "positive-stock",
        "label": "听第43课相关片段 · 确认存在一些",
        "start": 58.79,
        "end": 64.1
      },
      {
        "target": "zero-stock",
        "label": "听第43课相关片段 · 确认没有任何；否定转换见本组讲解",
        "start": 27.3,
        "end": 33.61
      }
    ]
  },
  "glossary": "限定题所需词义均在各题提示中；所有新情境为原创虚构，可用于角色练习。",
  "teaching": [
    {
      "target": "stock-question",
      "title": "中性存量询问",
      "explanation": "Are there any + 复数名词 + 位置?；Is there any + 不可数名词 + 位置?。any用于不预设答案的中性询问，不把位置问句与存在问句混淆。",
      "example": "Are there any towels in the cupboard?",
      "meaning": "橱柜里有毛巾吗？",
      "check": "先按名词的可数性选is/are，再核对any及位置。",
      "source": "stock-question"
    },
    {
      "target": "positive-stock",
      "title": "确认存在一些",
      "explanation": "肯定存量用There are some + 复数名词或There is some + 不可数名词。There is可缩写There’s。some表达有一些，不能把数量改成零。",
      "example": "There is some flour in the bowl.",
      "meaning": "碗里有一些面粉。",
      "check": "名词与be匹配；保留肯定some和已确认的位置。",
      "source": "positive-stock"
    },
    {
      "target": "zero-stock",
      "title": "确认没有任何",
      "explanation": "零存量可用There are not any + 复数名词或There is not any + 不可数名词；not any也可表达为no。are not可写aren’t，is not可写isn’t。",
      "example": "There are no plates in the crate.",
      "meaning": "箱子里没有盘子。",
      "check": "保留零存量；any与not同时出现或使用no。",
      "source": "zero-stock"
    }
  ],
  "own": {
    "id": "own-n43-personal-use",
    "prompt": "选一个真实或明确虚构的物资场景：询问存量，说一条确认有一些的事实与一条确认零存量的事实，覆盖复数与不可数物。由伙伴实际核对；不知道先查。保留首答、订正与原因。自由表达可采用自然等义形式。",
    "checks": [
      "先按名词的可数性选is/are，再核对any及位置。",
      "名词与be匹配；保留肯定some和已确认的位置。",
      "保留零存量；any与not同时出现或使用no。"
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
    "id": "diagnostic-n43-stock-question",
    "stage": "diagnostic",
    "target": "stock-question",
    "kind": "input",
    "form": "question",
    "context": "借物柜尚未检查，你不知柜里有没有毛巾，向管理员问存量。",
    "prompt": "以there be存在问句询问；any towels（毛巾）、in the cupboard（橱柜里）。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Are there any towels in the cupboard?"
    ],
    "criterion": "先按名词的可数性选is/are，再核对any及位置。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：先按名词的可数性选is/are，再核对any及位置。 易错边界：复数towels与is不对应。",
    "novelty": "借物柜尚未检查，你不知柜里有没有毛巾，向管理员问存量。",
    "counterexamples": [
      {
        "answer": "Is there any towels in the cupboard?",
        "reason": "复数towels与is不对应。"
      },
      {
        "answer": "Are there any towels in the cupboard.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Are there any towels in the cupboard??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "There are any towels in the cupboard?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "diagnostic-n43-positive-stock",
    "stage": "diagnostic",
    "target": "positive-stock",
    "kind": "input",
    "form": "statement",
    "context": "烹饪伙伴已核实碗里有一些面粉，你只报告这条存量事实。",
    "prompt": "用there be肯定陈述；some flour（一些面粉）、in the bowl（碗里）。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "There is some flour in the bowl.",
      "There's some flour in the bowl."
    ],
    "criterion": "名词与be匹配；保留肯定some和已确认的位置。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：名词与be匹配；保留肯定some和已确认的位置。 易错边界：flour在此不可数，用is。",
    "novelty": "烹饪伙伴已核实碗里有一些面粉，你只报告这条存量事实。",
    "counterexamples": [
      {
        "answer": "There are some flour in the bowl.",
        "reason": "flour在此不可数，用is。"
      },
      {
        "answer": "There is some flour in the bowl?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "There is some flour in the bowl..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "There are some flour in the bowl.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "diagnostic-n43-zero-stock",
    "stage": "diagnostic",
    "target": "zero-stock",
    "kind": "input",
    "form": "statement",
    "context": "运输负责人确认那个箱子里一只盘子也没有，你报告零存量。",
    "prompt": "用there be否定陈述；plates（盘子）、in the crate（箱子里）；可用not any或no。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "There are not any plates in the crate.",
      "There aren't any plates in the crate.",
      "There are no plates in the crate."
    ],
    "criterion": "保留零存量；any与not同时出现或使用no。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：保留零存量；any与not同时出现或使用no。 易错边界：有一些与零存量相反。",
    "novelty": "运输负责人确认那个箱子里一只盘子也没有，你报告零存量。",
    "counterexamples": [
      {
        "answer": "There are some plates in the crate.",
        "reason": "有一些与零存量相反。"
      },
      {
        "answer": "There are not any plates in the crate?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "There are not any plates in the crate..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "There is not any plates in the crate.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "guided-n43-stock-question",
    "stage": "guided",
    "target": "stock-question",
    "kind": "input",
    "form": "question",
    "context": "维修员未查袋子，想问里面有没有螺丝。",
    "prompt": "any screws（螺丝）、in the bag（袋子里）。提示：Are + there + any + 复数名词 + 位置?。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Are there any screws in the bag?"
    ],
    "criterion": "先按名词的可数性选is/are，再核对any及位置。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：先按名词的可数性选is/are，再核对any及位置。 易错边界：本题限定中性any询问，未预设有一些。",
    "novelty": "维修员未查袋子，想问里面有没有螺丝。",
    "counterexamples": [
      {
        "answer": "Are there some screws in the bag?",
        "reason": "本题限定中性any询问，未预设有一些。"
      },
      {
        "answer": "Are there any screws in the bag.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Are there any screws in the bag??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "There are any screws in the bag?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "guided-n43-positive-stock",
    "stage": "guided",
    "target": "positive-stock",
    "kind": "input",
    "form": "statement",
    "context": "急救站已核实冰桶里有一些水，你报当前存量。",
    "prompt": "some water（一些水）、in the bucket（桶里）。提示：There is + some + 不可数物 + 位置。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "There is some water in the bucket.",
      "There's some water in the bucket."
    ],
    "criterion": "名词与be匹配；保留肯定some和已确认的位置。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：名词与be匹配；保留肯定some和已确认的位置。 易错边界：否定会反转已核实的存量。",
    "novelty": "急救站已核实冰桶里有一些水，你报当前存量。",
    "counterexamples": [
      {
        "answer": "There is not any water in the bucket.",
        "reason": "否定会反转已核实的存量。"
      },
      {
        "answer": "There is some water in the bucket?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "There is some water in the bucket..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "There are some water in the bucket.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "guided-n43-zero-stock",
    "stage": "guided",
    "target": "zero-stock",
    "kind": "input",
    "form": "statement",
    "context": "清点表确认盒里没有电池，你告知收货者。",
    "prompt": "batteries（电池）、in the box（盒里）。提示：There are not any…或There are no…；只写陈述。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "There are not any batteries in the box.",
      "There aren't any batteries in the box.",
      "There are no batteries in the box."
    ],
    "criterion": "保留零存量；any与not同时出现或使用no。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：保留零存量；any与not同时出现或使用no。 易错边界：复数batteries用are。",
    "novelty": "清点表确认盒里没有电池，你告知收货者。",
    "counterexamples": [
      {
        "answer": "There is no batteries in the box.",
        "reason": "复数batteries用are。"
      },
      {
        "answer": "There are not any batteries in the box?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "There are not any batteries in the box..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "There is not any batteries in the box.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "independent-n43-stock-question",
    "stage": "independent",
    "target": "stock-question",
    "kind": "input",
    "form": "question",
    "context": "郊游时你还没打开背包，不知里面是否有苹果，问伙伴。",
    "prompt": "用there be中性存在问句；any apples（苹果）、in the backpack（背包里）。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Are there any apples in the backpack?"
    ],
    "criterion": "先按名词的可数性选is/are，再核对any及位置。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：先按名词的可数性选is/are，再核对any及位置。 易错边界：包内与包上不同。",
    "novelty": "郊游时你还没打开背包，不知里面是否有苹果，问伙伴。",
    "counterexamples": [
      {
        "answer": "Are there any apples on the backpack?",
        "reason": "包内与包上不同。"
      },
      {
        "answer": "Are there any apples in the backpack.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Are there any apples in the backpack??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "There are any apples in the backpack?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "independent-n43-positive-stock",
    "stage": "independent",
    "target": "positive-stock",
    "kind": "input",
    "form": "statement",
    "context": "救助站工作人员已核实篮子里有一些毯子，你报告存量。",
    "prompt": "用there be肯定句；some blankets（一些毯子）、in the basket（篮子里）。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "There are some blankets in the basket."
    ],
    "criterion": "名词与be匹配；保留肯定some和已确认的位置。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：名词与be匹配；保留肯定some和已确认的位置。 易错边界：复数blankets要求are。",
    "novelty": "救助站工作人员已核实篮子里有一些毯子，你报告存量。",
    "counterexamples": [
      {
        "answer": "There is some blankets in the basket.",
        "reason": "复数blankets要求are。"
      },
      {
        "answer": "There are some blankets in the basket?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "There are some blankets in the basket..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "There is some blankets in the basket.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "independent-n43-zero-stock",
    "stage": "independent",
    "target": "zero-stock",
    "kind": "input",
    "form": "statement",
    "context": "烘焙前检查发现罐里一点蜂蜜也没有，你报告。",
    "prompt": "用there be否定句；honey（蜂蜜）、in the jar（罐里）；允许not any或no。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "There is not any honey in the jar.",
      "There isn't any honey in the jar.",
      "There's not any honey in the jar.",
      "There is no honey in the jar.",
      "There's no honey in the jar."
    ],
    "criterion": "保留零存量；any与not同时出现或使用no。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：保留零存量；any与not同时出现或使用no。 易错边界：honey作为不可数物用is。",
    "novelty": "烘焙前检查发现罐里一点蜂蜜也没有，你报告。",
    "counterexamples": [
      {
        "answer": "There are no honey in the jar.",
        "reason": "honey作为不可数物用is。"
      },
      {
        "answer": "There is not any honey in the jar?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "There is not any honey in the jar..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "There are not any honey in the jar.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "repair-n43-stock-question",
    "stage": "repair",
    "target": "stock-question",
    "kind": "input",
    "form": "question",
    "context": "冲洗工具前你不知那个水箱里是否有水，询问伙伴。",
    "prompt": "用there be中性问句；any water（水）、in the tank（水箱里）。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Is there any water in the tank?"
    ],
    "criterion": "先按名词的可数性选is/are，再核对any及位置。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：先按名词的可数性选is/are，再核对any及位置。 易错边界：不可数物water用is。",
    "novelty": "冲洗工具前你不知那个水箱里是否有水，询问伙伴。",
    "counterexamples": [
      {
        "answer": "Are there any water in the tank?",
        "reason": "不可数物water用is。"
      },
      {
        "answer": "Is there any water in the tank.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Is there any water in the tank??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "There is any water in the tank?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "repair-n43-positive-stock",
    "stage": "repair",
    "target": "positive-stock",
    "kind": "input",
    "form": "statement",
    "context": "文具柜已检查，抽屉里有一些铅笔，你向学生报存量。",
    "prompt": "用there be肯定句；some pencils（一些铅笔）、in the drawer（抽屉里）。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "There are some pencils in the drawer."
    ],
    "criterion": "名词与be匹配；保留肯定some和已确认的位置。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：名词与be匹配；保留肯定some和已确认的位置。 易错边界：零存量与有一些相反。",
    "novelty": "文具柜已检查，抽屉里有一些铅笔，你向学生报存量。",
    "counterexamples": [
      {
        "answer": "There are no pencils in the drawer.",
        "reason": "零存量与有一些相反。"
      },
      {
        "answer": "There are some pencils in the drawer?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "There are some pencils in the drawer..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "There is some pencils in the drawer.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "repair-n43-zero-stock",
    "stage": "repair",
    "target": "zero-stock",
    "kind": "input",
    "form": "statement",
    "context": "修理桌上连一颗钉子也没有，已完成清点。",
    "prompt": "用there be否定句；nails（钉子）、on the bench（长凳上），允许not any或no。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "There are not any nails on the bench.",
      "There aren't any nails on the bench.",
      "There are no nails on the bench."
    ],
    "criterion": "保留零存量；any与not同时出现或使用no。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：保留零存量；any与not同时出现或使用no。 易错边界：上面与下面改变检查位置。",
    "novelty": "修理桌上连一颗钉子也没有，已完成清点。",
    "counterexamples": [
      {
        "answer": "There are no nails under the bench.",
        "reason": "上面与下面改变检查位置。"
      },
      {
        "answer": "There are not any nails on the bench?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "There are not any nails on the bench..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "There is not any nails on the bench.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "review-a-n43-stock-question",
    "stage": "review-a",
    "target": "stock-question",
    "kind": "input",
    "form": "question",
    "context": "写信前你不知架子上是否有信封，问接待员。",
    "prompt": "用there be中性问句；any envelopes（信封）、on the shelf（架子上）。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Are there any envelopes on the shelf?"
    ],
    "criterion": "先按名词的可数性选is/are，再核对any及位置。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：先按名词的可数性选is/are，再核对any及位置。 易错边界：复数存量需保留envelopes。",
    "novelty": "写信前你不知架子上是否有信封，问接待员。",
    "counterexamples": [
      {
        "answer": "Are there any envelope on the shelf?",
        "reason": "复数存量需保留envelopes。"
      },
      {
        "answer": "Are there any envelopes on the shelf.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Are there any envelopes on the shelf??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "There are any envelopes on the shelf?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "review-a-n43-positive-stock",
    "stage": "review-a",
    "target": "positive-stock",
    "kind": "input",
    "form": "statement",
    "context": "照料植物前你已确认瓶里有一些清水，向同伴报告。",
    "prompt": "用there be肯定句；some water（一些水）、in the bottle（瓶里）。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "There is some water in the bottle.",
      "There's some water in the bottle."
    ],
    "criterion": "名词与be匹配；保留肯定some和已确认的位置。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：名词与be匹配；保留肯定some和已确认的位置。 易错边界：本题要求普通肯定存量some，不能只换any。",
    "novelty": "照料植物前你已确认瓶里有一些清水，向同伴报告。",
    "counterexamples": [
      {
        "answer": "There is any water in the bottle.",
        "reason": "本题要求普通肯定存量some，不能只换any。"
      },
      {
        "answer": "There is some water in the bottle?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "There is some water in the bottle..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "There are some water in the bottle.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "review-a-n43-zero-stock",
    "stage": "review-a",
    "target": "zero-stock",
    "kind": "input",
    "form": "statement",
    "context": "衣物借用点已确认柜里一双袜子也没有，你报告。",
    "prompt": "用there be否定句；socks（袜子）、in the cupboard（橱柜里）；允许not any或no。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "There are not any socks in the cupboard.",
      "There aren't any socks in the cupboard.",
      "There are no socks in the cupboard."
    ],
    "criterion": "保留零存量；any与not同时出现或使用no。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：保留零存量；any与not同时出现或使用no。 易错边界：有一些反转了零存量。",
    "novelty": "衣物借用点已确认柜里一双袜子也没有，你报告。",
    "counterexamples": [
      {
        "answer": "There are some socks in the cupboard.",
        "reason": "有一些反转了零存量。"
      },
      {
        "answer": "There are not any socks in the cupboard?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "There are not any socks in the cupboard..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "There is not any socks in the cupboard.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "review-b-n43-stock-question",
    "stage": "review-b",
    "target": "stock-question",
    "kind": "input",
    "form": "question",
    "context": "野餐打包时你没检查盒子，不知里面是否有黄油，问伙伴。",
    "prompt": "用there be中性问句；any butter（黄油）、in the box（盒里）。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。只写一个完整问句，以一个英文问号结束。",
    "accepted": [
      "Is there any butter in the box?"
    ],
    "criterion": "先按名词的可数性选is/are，再核对any及位置。 只写一个完整问句，以一个英文问号结束。",
    "why": "本题要求：先按名词的可数性选is/are，再核对any及位置。 易错边界：butter按不可数物，题目指定any。",
    "novelty": "野餐打包时你没检查盒子，不知里面是否有黄油，问伙伴。",
    "counterexamples": [
      {
        "answer": "Is there a butter in the box?",
        "reason": "butter按不可数物，题目指定any。"
      },
      {
        "answer": "Is there any butter in the box.",
        "reason": "本题要求一个英文问号结束的完整问句。"
      },
      {
        "answer": "Is there any butter in the box??",
        "reason": "本题限定句末恰有一个问号。"
      },
      {
        "answer": "There is any butter in the box?",
        "reason": "疑问结构、主谓对应或动词形式不符合本题。"
      }
    ]
  },
  {
    "id": "review-b-n43-positive-stock",
    "stage": "review-b",
    "target": "positive-stock",
    "kind": "input",
    "form": "statement",
    "context": "桌游场地清点已确认袋里有一些代币，你报存量。",
    "prompt": "用there be肯定句；some tokens（一些代币）、in the bag（袋里）。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "There are some tokens in the bag."
    ],
    "criterion": "名词与be匹配；保留肯定some和已确认的位置。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：名词与be匹配；保留肯定some和已确认的位置。 易错边界：改成过去，未报当前存量。",
    "novelty": "桌游场地清点已确认袋里有一些代币，你报存量。",
    "counterexamples": [
      {
        "answer": "There were some tokens in the bag.",
        "reason": "改成过去，未报当前存量。"
      },
      {
        "answer": "There are some tokens in the bag?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "There are some tokens in the bag..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "There is some tokens in the bag.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  },
  {
    "id": "review-b-n43-zero-stock",
    "stage": "review-b",
    "target": "zero-stock",
    "kind": "input",
    "form": "statement",
    "context": "写字时核实那个瓶里一滴墨水也没有，你告知老师。",
    "prompt": "用there be否定句；ink（墨水）、in that bottle（那个瓶里）；允许not any或no。 不加称呼、时间副词或题目未给的修饰；保留指定词汇与完成基本结构所需成分。可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "accepted": [
      "There is not any ink in that bottle.",
      "There isn't any ink in that bottle.",
      "There's not any ink in that bottle.",
      "There is no ink in that bottle.",
      "There's no ink in that bottle."
    ],
    "criterion": "保留零存量；any与not同时出现或使用no。 可省略末尾标点或用一个英文句号；不用问号或感叹号。",
    "why": "本题要求：保留零存量；any与not同时出现或使用no。 易错边界：一些墨水与一滴没有相反。",
    "novelty": "写字时核实那个瓶里一滴墨水也没有，你告知老师。",
    "counterexamples": [
      {
        "answer": "There is some ink in that bottle.",
        "reason": "一些墨水与一滴没有相反。"
      },
      {
        "answer": "There is not any ink in that bottle?",
        "reason": "本题要求陈述或数量短语或命令，问号改变输出任务。"
      },
      {
        "answer": "There is not any ink in that bottle..",
        "reason": "本题至多允许一个末尾英文句号。"
      },
      {
        "answer": "There are not any ink in that bottle.",
        "reason": "未保持所练句型的基本成分、单位结构或主谓对应。"
      }
    ]
  }
];

export const {byId,questionsFor,matches}=bindContent(lesson,questions);
