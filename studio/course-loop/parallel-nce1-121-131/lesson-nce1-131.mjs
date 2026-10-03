// Original finite transfer tasks only; assessment remains the existing production model.
import {author,metadata} from '../parallel-nce1-049-059/authoring.mjs';
import {bindContent} from '../parallel-nce1-025-035/content-contract.mjs';
const data=metadata(131,
"9d75ee3900aac150440f843aeaedd2e3692621567377c4c883f37a7edd3f8abe",
"现在、将来与过去的可能性",
"用may/might报告未定的将来可能、当前状态或动作可能，以及132配套页覆盖的过去状态和进行可能。",
[
  "已学must/cannot推测、情态后动词原形、be + -ing与have been。",
  "131原文给现在/将来可能及might not；132配套实际覆盖may have been状态与进行。"
],
[
  {
    "target": "future-possibility",
    "title": "将来可能发生或不发生",
    "explanation": "may/might +动词原形表达现在考虑中的将来可能；may/might not表示可能不发生。它们不等于确定will，也不等于cannot排除。这里may不是许可。",
    "example": "We might stay tomorrow.",
    "meaning": "我们明天可能会留下。",
    "check": "未决定将来用may/might +原形，可能不发生把not放在情态后。"
  },
  {
    "target": "present-possibility",
    "title": "当前状态与当前进行的可能",
    "explanation": "may/might be +状态或be + -ing表示一种可能。线索不足时不能把may改成must强判断；131有may be cheaper，132有may be reading。",
    "example": "She may be waiting.",
    "meaning": "她现在可能正在等。",
    "check": "状态接be +状态；正在进行接be + -ing，不把一种可能当作事实。"
  },
  {
    "target": "past-possibility",
    "title": "过去状态与过去进行的可能",
    "explanation": "132配套与书面页实际有may have been busy/reading。may/might have been +状态或-ing表达过去的一种可能，不等于must have been强推测；过去覆盖来自配套页，131原声未讲该形式。",
    "example": "He may have been waiting.",
    "meaning": "他当时可能正在等。",
    "check": "过去可能保留may/might + have been，状态与-ing按题意选择。"
  }
],
[
  [
    25.84,
    28.6,
    "131原文may go；否定might not另见62.35秒"
  ],
  [
    51.76,
    57.18,
    "131原文may be cheaper；当前进行另见132配套"
  ],
  [
    62.35,
    65.11,
    "131原文might not；本目标过去可能仅来自132配套，不声称clip含have been"
  ]
],
"自拟一个明确标注虚构的日常场景，写三句话分别使用本组三个目标，说明时间、线索和把握程度；不要把未证实推测说成已核实事实。");
data.source.pairedExercise={
  "entryId": "NCE1-131",
  "pageKey": "NCE1-271",
  "lessons": [
    131,
    132
  ],
  "catalogPages": [
    270,
    271,
    272
  ],
  "printedPages": [
    266,
    267,
    268
  ],
  "note": "来源目录页号与印刷页号相差4；注释、句型和书面页已逐页目视核验，未复制原题作新迁移。"
};
data.source.grammarPages=[
  {
    "pageKey": "NCE1-270",
    "src": "/lesson-pages/eeff94ba64c6a254d97fcc4f366427aa23e0221a812019b85876e2d5a5854290.jpg",
    "sha256": "eeff94ba64c6a254d97fcc4f366427aa23e0221a812019b85876e2d5a5854290"
  },
  {
    "pageKey": "NCE1-271",
    "src": "/lesson-pages/ad9780347c327ae593b6e663f962ad779ece9dc8a11781665b63fea672d79b21.jpg",
    "sha256": "ad9780347c327ae593b6e663f962ad779ece9dc8a11781665b63fea672d79b21"
  },
  {
    "pageKey": "NCE1-272",
    "src": "/lesson-pages/5a5fc111a96a3440b2d7c143cf03d3d3b1785be37dbdb0d7d51d82046c244b89.jpg",
    "sha256": "5a5fc111a96a3440b2d7c143cf03d3d3b1785be37dbdb0d7d51d82046c244b89"
  }
];
data.limitations=['仅覆盖本组三目标，不证明全部情态体系或整章掌握。','所有新任务为原创虚构日常情境；有限文字匹配不评分音频、开放输出或发音。','clip起点与结束边界来自下一原文row时间，未试听核实实际听感或末音。','复习两题库情境不同；自然24小时/7天保持、口语与学习增益仍未验证。'];
const rows=[
  [
    "社团考虑明天去博物馆，尚未决定，去或不去都可能。只报告去博物馆这一种可能。",
    "以We开头，用may或might、visit the museum、tomorrow，表达未决定的将来可能性。",
    "We may visit the museum tomorrow.",
    [
      [
        "We must visit the museum tomorrow.",
        "强制/强判断替代较弱可能性。"
      ],
      [
        "We will visit the museum tomorrow.",
        "未定计划改成确定将来。"
      ],
      [
        "We may visited the museum tomorrow.",
        "情态后需动词原形。"
      ],
      [
        "We may not visit the museum tomorrow.",
        "题目要求报告去的可能，否定方向不同。"
      ]
    ],
    "may/might后visit原形，保留未决定的可能。"
  ],
  [
    "现在联系不到志愿者，她可能很忙，也可能只是没看手机；你没有把握。只报告很忙这一种可能。",
    "以She开头，用may或might、be、busy表达现在状态的一种可能。",
    "She may be busy.",
    [
      [
        "She must be busy.",
        "线索有限，不能改成强推测。"
      ],
      [
        "She is busy.",
        "可能改成事实。"
      ],
      [
        "She may busy.",
        "缺be。"
      ],
      [
        "She may have been busy.",
        "现在改成过去。"
      ]
    ],
    "may be busy不把未回复当作忙碌的确定证据。"
  ],
  [
    "昨天工作坊没收到他回复，他可能当时很忙，也可能手机没电；没有现场记录。只报告忙这一种可能。",
    "以He开头，用may或might、have、been、busy表达过去状态的一种可能。",
    "He may have been busy.",
    [
      [
        "He may be busy.",
        "过去改现在。"
      ],
      [
        "He must have been busy.",
        "弱可能改为强推测。"
      ],
      [
        "He may had been busy.",
        "情态后have原形。"
      ],
      [
        "He may have be busy.",
        "需been。"
      ]
    ],
    "may/might have been +状态来自132配套页；不是131原声新增语句。"
  ],
  [
    "明天室外画展可能因天气取消，但还没有通知，举办和不举办都可能。只报告我们可能不参加这一种情况。",
    "以We开头，用may或might、not、attend the exhibition、tomorrow表达将来不发生的可能。",
    "We may not attend the exhibition tomorrow.",
    [
      [
        "We may attend the exhibition tomorrow.",
        "漏not，方向相反。"
      ],
      [
        "We cannot attend the exhibition tomorrow.",
        "可能不参加变成不可能/不能参加。"
      ],
      [
        "We will not attend the exhibition tomorrow.",
        "改成确定不参加。"
      ],
      [
        "We may not attended the exhibition tomorrow.",
        "情态后attend原形。"
      ]
    ],
    "may/might not表示可能不发生；不等于cannot排除参加。"
  ],
  [
    "图书馆门关着，你听见翻页声，但声音也可能来自别人。她也许现在正在读书，你不确定。",
    "以She开头，用may或might、be、read，表达现在正在进行的一种可能。",
    "She may be reading.",
    [
      [
        "She must be reading.",
        "弱线索改成强推测。"
      ],
      [
        "She may read.",
        "未表达题目指定的当前进行。"
      ],
      [
        "She may be read.",
        "进行需reading。"
      ],
      [
        "She may have been reading.",
        "现在改成过去。"
      ]
    ],
    "may be + -ing表示可能正在进行，声音不证明是谁。"
  ],
  [
    "昨天的排练记录只留下很轻的旋律，不知是谁发出的。她可能当时正在唱歌，也可能在放录音。只报告唱歌这一种可能。",
    "以She开头，用may或might、have、been、sing，表达过去当时正在进行的一种可能。",
    "She may have been singing.",
    [
      [
        "She may be singing.",
        "过去改成现在。"
      ],
      [
        "She must have been singing.",
        "不确定改成强推测。"
      ],
      [
        "She may have been sing.",
        "需singing。"
      ],
      [
        "She may have sung.",
        "题目指定当时进行，不能只写完成过。"
      ]
    ],
    "132配套的may have been + -ing可迁移到唱歌，不声称在131原声中。"
  ],
  [
    "陌生手工社团在讨论下周做一张海报，尚未选定活动。只报告做海报这一种可能。",
    "以They开头，用may或might、make a poster、next week表达将来可能。",
    "They may make a poster next week.",
    [
      [
        "They must make a poster next week.",
        "改成强制/强判断。"
      ],
      [
        "They will make a poster next week.",
        "未定改确定。"
      ],
      [
        "They may made a poster next week.",
        "需make原形。"
      ],
      [
        "They may not make a poster next week.",
        "题目只报告做的可能。"
      ]
    ],
    "may/might +原形不等于已确定的安排。"
  ],
  [
    "陌生社区的访客现在只看到他们家的窗帘关着、门口无人，没人回复门铃；他们可能外出了，也可能在家里没听见。你没有把握，不知道他们现在的位置。只报告他们可能不在家这一种情况。",
    "以They开头，用may或might、not、be、at home，表达当前状态的一种可能。",
    "They may not be at home.",
    [
      [
        "They may be at home.",
        "只报告不在家这一种可能，not不能漏掉。"
      ],
      [
        "They cannot be at home.",
        "线索不能排除他们在家，只表示可能不在家。"
      ],
      [
        "They are not at home.",
        "未知位置不能说成已证实事实。"
      ],
      [
        "They may not have been at home.",
        "当前位置不能换成过去。"
      ]
    ],
    "may/might not be at home保留在家和外出两个解释，并只报告否定可能。"
  ],
  [
    "陌生社团昨天的报名网页迟迟没回复，组织者可能当时不在场，也可能在忙其他事。只报告不在场这一种可能。",
    "以She开头，用may或might、have、been、absent表达过去状态的一种可能。",
    "She may have been absent.",
    [
      [
        "She may be absent.",
        "过去改现在。"
      ],
      [
        "She must have been absent.",
        "有限线索改强推测。"
      ],
      [
        "She may had been absent.",
        "情态后have原形。"
      ],
      [
        "She may have be absent.",
        "需been。"
      ]
    ],
    "absent放在may have been后，表示过去可能的状态。"
  ],
  [
    "另一场周末野餐尚未确认，预算可能不够，但还没算完。只报告我们明天可能不去公园这一种情况。",
    "以We开头，用may或might、not、go to the park、tomorrow表达将来不发生的可能。",
    "We may not go to the park tomorrow.",
    [
      [
        "We may go to the park tomorrow.",
        "not丢失。"
      ],
      [
        "We cannot go to the park tomorrow.",
        "较弱可能变成不能/不可能。"
      ],
      [
        "We will not go to the park tomorrow.",
        "变成确定取消。"
      ],
      [
        "We may not went to the park tomorrow.",
        "情态后go原形。"
      ]
    ],
    "否定落在may/might后面，只说不去可能发生。"
  ],
  [
    "另一间厨房传来锅盖声，但有时空锅也会响。他可能现在正在做饭，你没有确认。",
    "以He开头，用may或might、be、cook，表达现在正在进行的一种可能。",
    "He may be cooking.",
    [
      [
        "He must be cooking.",
        "线索不强，不能改成强推测。"
      ],
      [
        "He may cook.",
        "缺题目指定的当前进行。"
      ],
      [
        "He may be cook.",
        "需cooking。"
      ],
      [
        "He may have been cooking.",
        "现在改过去。"
      ]
    ],
    "may be cooking不把厨房声响当作已确认动作。"
  ],
  [
    "昨天你打电话给女志愿者Nora，她没有接。她那时可能正在睡觉，也可能出门了；你没有位置记录，不知道她当时在哪里。只报告她当时正在睡觉这一种未证实可能。",
    "以She开头，用may或might、have、been、sleep，表达过去当时正在进行的一种可能。",
    "She may have been sleeping.",
    [
      [
        "She may be sleeping.",
        "过去改现在。"
      ],
      [
        "She must have been sleeping.",
        "没有位置或状态证据，不能说成强推测。"
      ],
      [
        "She may have been sleep.",
        "进行式需sleeping。"
      ],
      [
        "She may have slept.",
        "题目要求当时正在进行。"
      ]
    ],
    "没接电话仅容许睡觉作为一种可能；没有预设她当时在门内或在家。"
  ],
  [
    "新社区正在选择周五集会的活动，唱歌只是候选，还未定。只报告他们可能唱歌这一种情况。",
    "以They开头，用may或might、sing、on Friday表达将来可能。",
    "They may sing on Friday.",
    [
      [
        "They must sing on Friday.",
        "改成必须。"
      ],
      [
        "They will sing on Friday.",
        "改确定将来。"
      ],
      [
        "They may sang on Friday.",
        "需sing原形。"
      ],
      [
        "They may not sing on Friday.",
        "方向与要求不同。"
      ]
    ],
    "may/might sing报告候选，不保证活动发生。"
  ],
  [
    "新仓库现在的门外能听见微弱交谈，但也可能来自隔壁。仓库也许很忙，也可能没人。只报告忙这一种可能。",
    "以It开头，用may或might、be、busy表达现在状态的一种可能。",
    "It may be busy.",
    [
      [
        "It must be busy.",
        "证据有限，不能改强推测。"
      ],
      [
        "It is busy.",
        "可能改事实。"
      ],
      [
        "It may busy.",
        "缺be。"
      ],
      [
        "It may have been busy.",
        "现在改过去。"
      ]
    ],
    "may be busy容许其他解释仍然存在。"
  ],
  [
    "新小组昨天约了咨询，桌边只有一张没写完的登记纸，没人看见他们什么时候来；他们可能当时正在等候，也可能纸是前一天留下的。你不确定。只报告当时正在等候这一种可能。",
    "以They开头，用may或might、have、been、wait，表达过去当时正在进行的一种可能。",
    "They may have been waiting.",
    [
      [
        "They may be waiting.",
        "昨天换成当前。"
      ],
      [
        "They must have been waiting.",
        "登记纸来源不明，不能改成强推测。"
      ],
      [
        "They may have been wait.",
        "进行需waiting。"
      ],
      [
        "They may have waited.",
        "题目指定当时进行。"
      ]
    ],
    "may have been waiting保留来源不明的线索，不能把纸张当作他们到场的确证。"
  ],
  [
    "另一个读书小组考虑明天开会，几个人可能没空，尚无决定。只报告他们可能不开会这一种情况。",
    "以They开头，用may或might、not、meet、tomorrow表达将来不发生的可能。",
    "They may not meet tomorrow.",
    [
      [
        "They may meet tomorrow.",
        "not消失。"
      ],
      [
        "They cannot meet tomorrow.",
        "可能不发生改成不能/不可能。"
      ],
      [
        "They will not meet tomorrow.",
        "改确定取消。"
      ],
      [
        "They may not met tomorrow.",
        "情态后meet原形。"
      ]
    ],
    "may/might not meet表示未决定的否定可能。"
  ],
  [
    "另一个共享办公室里，他的屏幕关着，桌面也没有打开的文件；但他也可能在思考工作，或在别处用手机。你不知道他此刻的活动。只报告他现在可能没在工作这一种未证实情况。",
    "以He开头，用may或might、not、be、work，表达现在正在进行动作的否定可能。",
    "He may not be working.",
    [
      [
        "He may be working.",
        "题目只报告没在工作这一种可能，not不可漏。"
      ],
      [
        "He cannot be working.",
        "屏幕关闭不能强力排除思考或手机工作。"
      ],
      [
        "He is not working.",
        "未确认活动不能直接断言事实。"
      ],
      [
        "He may not have been working.",
        "当前活动换成过去。"
      ]
    ],
    "may/might not be working表示可能没有在进行，不能用cannot从弱线索强排除。"
  ],
  [
    "另一场昨天的活动只留下翻页声的模糊录音，也可能是别人。她可能那时正在读书，尚未向她核对。",
    "以She开头，用may或might、have、been、read，表达过去当时正在进行的一种可能。",
    "She may have been reading.",
    [
      [
        "She may be reading.",
        "过去改现在。"
      ],
      [
        "She must have been reading.",
        "可能变强推测。"
      ],
      [
        "She may have been read.",
        "需reading。"
      ],
      [
        "She may have read.",
        "题目要求当时进行。"
      ]
    ],
    "132原页同时包含may have been busy与reading；本题沿用已核范围。"
  ]
];
const authored=author(data,rows);
for(const q of authored.questions){
 const values=new Set(q.accepted);
 for(let pass=0;pass<4;pass++)for(const value of [...values]){
  for(const [from,to] of [['cannot','can not'],['must have',"must've"],['may ','might '],['might not',"mightn't"],['might have',"might've"]]){
   if(value.includes(from))values.add(value.replace(from,to));
  }
  const time=value.match(/^(.*) (tomorrow|next week|on Friday)\.$/);
  if(time){
   values.add(time[2][0].toUpperCase()+time[2].slice(1)+', '+time[1][0].toLowerCase()+time[1].slice(1)+'.');
   const modal=time[1].match(/^(We|They) (may|might|mightn't) (.*)$/);
   if(modal){
    values.add(modal[1]+' '+modal[2]+' '+time[2]+' '+modal[3]+'.');
    if(modal[3].startsWith('not '))values.add(modal[1]+' '+modal[2]+' not '+time[2]+' '+modal[3].slice(4)+'.');
   }
  }
  if(value.includes(','))values.add(value.replaceAll(',',''));
 }
 q.accepted=[...values];
}
export const {lesson,questions,byId,questionsFor,matches}=bindContent(data,authored.questions);
