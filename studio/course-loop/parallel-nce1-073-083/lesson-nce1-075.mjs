// Original constrained transfer tasks; production assessment remains ../model.mjs.
import {author,metadata} from '../parallel-nce1-049-059/authoring.mjs';
import {bindContent} from '../parallel-nce1-025-035/content-contract.mjs';
const data=metadata(75,"23782f20d41cfaeef29c7d1726e477917877cb3f3d3d3658c1d94903c7b4d0f3","问清过去时间，保留购买事实","用When did问动作时间，区分last与ago，并把buy的过去肯定与did否定分清。",["已学73–74课过去动作与did；75课原文及76课last/ago练习。词义在题内提供。"],[{"target": "past-when", "title": "问动作发生的时间", "explanation": "When did + 主语 + 动词原形…?询问已结束动作的时间，不询问物件或地点。did后不能再用过去式或第三人称s。", "example": "When did Jo return the book?", "meaning": "乔什么时候还的书？", "check": "When问时间；did后动词原形。"}, {"target": "past-time", "title": "last与ago", "explanation": "last week/month/year表示上周/月/年，前面不用in或on。two days ago是两天前，数量+时间单位+ago；不能把two days ago写成last two days。", "example": "We arrived two days ago.", "meaning": "我们两天前到了。", "check": "保留时间含义，last前无介词，数量+单位+ago。"}, {"target": "past-buy", "title": "购买事实的肯否定", "explanation": "肯定用bought；否定用did not buy。did承担过去标记，后面不用bought。这里问某次实际购买，不是想买或拥有。", "example": "She did not buy the coat.", "meaning": "她没有买那件外套。", "check": "肯定bought，否定did not buy，核对购买的是哪件物品。"}],[[37.52, 39.94, "原声Did she buy…；时间问法见76课"], [32.85, 37.52, "原声last month；44.36句含a month ago"], [39.94, 44.36, "原声bought与前句did buy对照"]],"写一次明确过去的购买：时间用last或ago，记录一件买了和一件没有买的物品，问同伴另一动作什么时候发生。");
data.contentStatus='authored-pending-independent-blind-review';
data.source.pairedExercise={entryId:'NCE1-75',lessons:[75,76],note:'Odd lesson original transcript plus verified paired exercise pages; exercise practice has no separate original-audio claim.'};
const rows=[
  [
    "博物馆收到归还物，但日志缺少归还时间；你向管理员询问两位志愿者的归还时间。",
    "用When、they、return the map询问。",
    "When did they return the map?",
    [
      [
        "When did they returned the map?",
        "did后原形。"
      ],
      [
        "When do they return the map?",
        "不是习惯。"
      ],
      [
        "Where did they return the map?",
        "问地点。"
      ],
      [
        "When did she return the map?",
        "主语改变。"
      ]
    ],
    "When did they return只问已知动作的时间。",
    []
  ],
  [
    "包裹记录：我们在两天前寄出了那个盒子。",
    "用We、post the box、two days ago写一句过去陈述。",
    "We posted the box two days ago.",
    [
      [
        "We posted the box last two days.",
        "两天前用two days ago。"
      ],
      [
        "We post the box two days ago.",
        "时态不符。"
      ],
      [
        "We posted the box in two days ago.",
        "ago前不加in。"
      ],
      [
        "We posted the box two weeks ago.",
        "单位改变。"
      ]
    ],
    "posted对应两天前，ago在时间数量后。",
    [
      "Two days ago, we posted the box."
    ]
  ],
  [
    "市场收据明确：我买了那盏灯，没有描述购物愿望。",
    "用I、buy the lamp写一句已发生的肯定陈述。",
    "I bought the lamp.",
    [
      [
        "I buy the lamp.",
        "需过去式。"
      ],
      [
        "I did not buy the lamp.",
        "肯否定反转。"
      ],
      [
        "I bought the desk.",
        "物品改变。"
      ],
      [
        "I wanted the lamp.",
        "愿望不等于购买。"
      ]
    ],
    "buy的过去式是bought。",
    []
  ],
  [
    "门票办公室知道Ada订了座位，但不知道何时。",
    "用When、Ada、book the seat询问时间。",
    "When did Ada book the seat?",
    [
      [
        "When did Ada booked the seat?",
        "did后原形。"
      ],
      [
        "When does Ada book the seat?",
        "不是习惯。"
      ],
      [
        "What did Ada book?",
        "问物件。"
      ],
      [
        "When did Ada buy the seat?",
        "book预约不等于buy。"
      ]
    ],
    "名字主语也用did+book。",
    []
  ],
  [
    "宿舍搬迁已结束：她上个月搬家了。",
    "用She、move、last month写一句。",
    "She moved last month.",
    [
      [
        "She moved in last month.",
        "last前不用in。"
      ],
      [
        "She moves last month.",
        "需过去式。"
      ],
      [
        "She moved a month ago.",
        "一月前与上个月不必相同。"
      ],
      [
        "She moved last year.",
        "时间变了。"
      ]
    ],
    "last month是日历上个月，不替换成a month ago。",
    [
      "Last month, she moved."
    ]
  ],
  [
    "库存核对确认两位朋友没有买那些手套。",
    "用They、not buy the gloves写过去否定。",
    "They did not buy the gloves.",
    [
      [
        "They did not bought the gloves.",
        "did后原形。"
      ],
      [
        "They do not buy the gloves.",
        "不是过去。"
      ],
      [
        "They bought the gloves.",
        "否定丢失。"
      ],
      [
        "They did not buy the scarf.",
        "物品不符。"
      ]
    ],
    "did not buy否定某次购买。",
    []
  ],
  [
    "摄影社知道一位成员画了招贴；你用he问他人的记录。",
    "用When、he、paint the poster询问那一次时间。",
    "When did he paint the poster?",
    [
      [
        "When did he painted the poster?",
        "did后原形。"
      ],
      [
        "When does he paint the poster?",
        "改变为习惯。"
      ],
      [
        "Where did he paint the poster?",
        "问地点。"
      ],
      [
        "When did he paint the wall?",
        "对象变化。"
      ]
    ],
    "did不因he改成does。",
    []
  ],
  [
    "维修台收到一个新的日期事实：我四小时前修好了自行车。",
    "用I、repair the bike、four hours ago写一句。",
    "I repaired the bike four hours ago.",
    [
      [
        "I repaired the bike four hour ago.",
        "四小时单位需复数。"
      ],
      [
        "I repaired the bike ago four hours.",
        "ago位置错误。"
      ],
      [
        "I repair the bike four hours ago.",
        "过去动作。"
      ],
      [
        "I repaired the bike four days ago.",
        "单位改变。"
      ]
    ],
    "四小时前用four hours ago。",
    [
      "Four hours ago, I repaired the bike."
    ]
  ],
  [
    "排练购物清单说Nia实际买了那支笛子，已经完成交易。",
    "用Nia、buy the flute（笛子）写过去肯定。",
    "Nia bought the flute.",
    [
      [
        "Nia buys the flute.",
        "需过去式。"
      ],
      [
        "Nia did not buy the flute.",
        "事实反转。"
      ],
      [
        "Nia buyed the flute.",
        "不是规则-ed。"
      ],
      [
        "Nia bought the drum.",
        "物品改变。"
      ]
    ],
    "不规则buy→bought，名字主语不改变过去式。",
    []
  ],
  [
    "订正后换一份新记录：团队收到了一封信，但你不记得自己何时发信，想请同伴帮你回忆。",
    "用When、I、send the letter询问时间。",
    "When did I send the letter?",
    [
      [
        "When did I sent the letter?",
        "did后send。"
      ],
      [
        "When do I send the letter?",
        "不是习惯。"
      ],
      [
        "Where did I send the letter?",
        "问地点。"
      ],
      [
        "When did I receive the letter?",
        "发送变接收。"
      ]
    ],
    "When问时间，did后send。",
    []
  ],
  [
    "另一份过期登记：他们前年参观了那座城堡。",
    "用They、visit the castle、the year before last写一句。",
    "They visited the castle the year before last.",
    [
      [
        "They visited the castle last year.",
        "前年变去年。"
      ],
      [
        "They visit the castle the year before last.",
        "时态不符。"
      ],
      [
        "They visited the castle in the year before last.",
        "指定时间短语直接作状语。"
      ],
      [
        "They visited the castle two days ago.",
        "时间改变。"
      ]
    ],
    "the year before last与last year区分。",
    [
      "The year before last, they visited the castle."
    ]
  ],
  [
    "修补购买否定时换对象：Ben没有买那只手表，只买了别的东西；不需写别的东西。",
    "用Ben、not buy the watch写一句。",
    "Ben did not buy the watch.",
    [
      [
        "Ben did not bought the watch.",
        "did后buy。"
      ],
      [
        "Ben does not buy the watch.",
        "变成现在。"
      ],
      [
        "Ben bought the watch.",
        "否定遗漏。"
      ],
      [
        "Ben did not buy the clock.",
        "物件改变。"
      ]
    ],
    "单个人过去否定仍是did not buy。",
    []
  ],
  [
    "新到的采访稿说明同伴清洗了设备，缺时间；你直接问对方。",
    "用When、you、clean the camera询问时间。",
    "When did you clean the camera?",
    [
      [
        "When did you cleaned the camera?",
        "did后原形。"
      ],
      [
        "When do you clean the camera?",
        "不是习惯。"
      ],
      [
        "How did you clean the camera?",
        "问方式。"
      ],
      [
        "When did you clean the lens?",
        "camera不是lens。"
      ]
    ],
    "过去时间问句保持When did。",
    []
  ],
  [
    "第二天整理旧旅行日志：我们上周步行穿过了那座桥。",
    "用We、walk across the bridge、last week写一句。",
    "We walked across the bridge last week.",
    [
      [
        "We walked across the bridge on last week.",
        "last前无on。"
      ],
      [
        "We walk across the bridge last week.",
        "时态不符。"
      ],
      [
        "We walked across the bridge a week ago.",
        "一周前不必等于上周。"
      ],
      [
        "We walked to the bridge last week.",
        "去桥边不等于穿过桥。"
      ]
    ],
    "walked across保留路径，last week保留日历周。",
    [
      "Last week, we walked across the bridge."
    ]
  ],
  [
    "新收据说明我们买了那张毯子，记录的是过去一次交易。",
    "用We、buy the blanket写一句。",
    "We bought the blanket.",
    [
      [
        "We buy the blanket.",
        "过去式。"
      ],
      [
        "We buyed the blanket.",
        "buy不规则。"
      ],
      [
        "We did not buy the blanket.",
        "反转事实。"
      ],
      [
        "We bought the cushion.",
        "物品变化。"
      ]
    ],
    "所有人称肯定过去buy都用bought。",
    []
  ],
  [
    "另一场回访：两位学生提交了报告，你要向老师询问他们何时提交。",
    "用When、the students、hand in the report询问。",
    "When did the students hand in the report?",
    [
      [
        "When did the students handed in the report?",
        "did后原形。"
      ],
      [
        "When do the students hand in the report?",
        "不是常规。"
      ],
      [
        "When did the student hand in the report?",
        "人数变化。"
      ],
      [
        "When did the students read the report?",
        "动作变化。"
      ]
    ],
    "hand in是提交，did后保留原形。",
    []
  ],
  [
    "新的救援档案记录：她一小时前给办公室打了电话。",
    "用She、call the office、an hour ago写一句。",
    "She called the office an hour ago.",
    [
      [
        "She called the office a hour ago.",
        "hour元音开头用an。"
      ],
      [
        "She calls the office an hour ago.",
        "时态错。"
      ],
      [
        "She called the office in an hour ago.",
        "不加in。"
      ],
      [
        "She called the office an hour later.",
        "以前变以后。"
      ]
    ],
    "an hour ago是向现在回推一小时。",
    [
      "An hour ago, she called the office."
    ]
  ],
  [
    "后续核账：我没有买那些邮票，照片不能当收据。",
    "用I、not buy the stamps写一句过去否定。",
    "I did not buy the stamps.",
    [
      [
        "I did not bought the stamps.",
        "did后原形。"
      ],
      [
        "I do not buy the stamps.",
        "时态不同。"
      ],
      [
        "I bought the stamps.",
        "否定丢失。"
      ],
      [
        "I did not sell the stamps.",
        "购买变出售。"
      ]
    ],
    "did not buy保留未购买事实。",
    []
  ]
];
const authored=author(data,rows);
for(let i=0;i<rows.length;i++)authored.questions[i].accepted=[...new Set([...authored.questions[i].accepted,...rows[i][5],...authored.questions[i].accepted.filter(a=>a.includes('did not')).map(a=>a.replace('did not',"didn't"))])];
export const {lesson,questions,byId,questionsFor,matches}=bindContent(data,authored.questions);
