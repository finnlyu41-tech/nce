// Original finite transfer tasks only; assessment remains the existing production model.
import {author,metadata} from '../parallel-nce1-049-059/authoring.mjs';
import {bindContent} from '../parallel-nce1-025-035/content-contract.mjs';
const data=metadata(127,
"1ba27adb6d9e6fa5bca327fe101f5661837834e7474647f1f810cf1e71b1aff0",
"现在的强推测与排除",
"根据当前线索表达强肯定、强否定与正在进行动作的推测，区别推测、事实与能力。",
[
  "已学情态动词后接原形be、be + -ing及can/cannot的能力含义。",
  "本组只覆盖127–128原页的现在推测，不训练过去推测与完整情态体系。"
],
[
  {
    "target": "present-strong-state",
    "title": "现在状态的强肯定推测",
    "explanation": "根据很强线索判断现在状态用must be。它表达推测者很有把握，不是已核实的事实，也不是这里要求某人必须做事。",
    "example": "It must be quiet.",
    "meaning": "那里现在一定很安静。",
    "check": "现在状态：must + be +状态/身份；保留推测而不改成事实。"
  },
  {
    "target": "present-exclusion",
    "title": "现在身份或状态的排除",
    "explanation": "cannot be/can’t be根据线索排除现在身份或状态。这里不是must not的禁止含义，也不是cannot read等能力不足。",
    "example": "It cannot be the small box.",
    "meaning": "它不可能是那个小盒子。",
    "check": "当前排除用cannot/can’t + be；别换成must not、过去或能力判断。"
  },
  {
    "target": "present-ongoing-inference",
    "title": "推测现在正在做的动作",
    "explanation": "128配套页有must be sleeping与can’t be reading。正在进行动作需must/cannot + be + -ing；去掉be与-ing可能变成义务或能力。",
    "example": "They must be talking.",
    "meaning": "他们现在一定正在交谈。",
    "check": "现在进行推测用must/cannot + be + -ing；cannot do能力与cannot be doing排除不同。"
  }
],
[
  [
    28.27,
    33.29,
    "127原文must be身份推测；状态迁移见128配套"
  ],
  [
    45.91,
    47.84,
    "127原文can’t be排除；能力对照见原注释"
  ],
  [
    58.91,
    63.89,
    "127原文must be；现在进行推测另来自128配套，未在此clip展示"
  ]
],
"自拟一个明确标注虚构的日常场景，写三句话分别使用本组三个目标，说明时间、线索和把握程度；不要把未证实推测说成已核实事实。");
data.source.pairedExercise={
  "entryId": "NCE1-127",
  "pageKey": "NCE1-263",
  "lessons": [
    127,
    128
  ],
  "catalogPages": [
    262,
    263,
    264
  ],
  "printedPages": [
    258,
    259,
    260
  ],
  "note": "来源目录页号与印刷页号相差4；注释、句型和书面页已逐页目视核验，未复制原题作新迁移。"
};
data.source.grammarPages=[
  {
    "pageKey": "NCE1-262",
    "src": "/lesson-pages/f18f00c4392541f49cfa8ae2027c99d197c52d0b451c779b52a4d7d9bf39178e.jpg",
    "sha256": "f18f00c4392541f49cfa8ae2027c99d197c52d0b451c779b52a4d7d9bf39178e"
  },
  {
    "pageKey": "NCE1-263",
    "src": "/lesson-pages/50d4005280dbf5a347d3bcaf0b1018cede5ab7a528929fff27439488d5c920b5.jpg",
    "sha256": "50d4005280dbf5a347d3bcaf0b1018cede5ab7a528929fff27439488d5c920b5"
  },
  {
    "pageKey": "NCE1-264",
    "src": "/lesson-pages/1ce40cc69533f461b0fd615c955eabf7fcb7a5fead2a6d3c3de8a4631353862f.jpg",
    "sha256": "1ce40cc69533f461b0fd615c955eabf7fcb7a5fead2a6d3c3de8a4631353862f"
  }
];
data.limitations=['仅覆盖本组三目标，不证明全部情态体系或整章掌握。','所有新任务为原创虚构日常情境；有限文字匹配不评分音频、开放输出或发音。','clip起点与结束边界来自下一原文row时间，未试听核实实际听感或末音。','复习两题库情境不同；自然24小时/7天保持、口语与学习增益仍未验证。'];
const rows=[
  [
    "排练刚结束，Leo连续打哈欠，走得很慢。你把这些当作很强线索，推断他现在很累，但没有向他确认。",
    "以He开头，用must、be、tired表达强肯定推测。",
    "He must be tired.",
    [
      [
        "He is tired.",
        "直接断言，丢失根据线索推测的语气。"
      ],
      [
        "He must tired.",
        "must后需要原形be。"
      ],
      [
        "He must have been tired.",
        "题目推测现在，不是过去。"
      ],
      [
        "He cannot be tired.",
        "把肯定推测反成排除。"
      ]
    ],
    "must be表达有很强把握的现在状态推测，不等于已证实事实。"
  ],
  [
    "你找蓝色钥匙袋，却看见一个红色袋子；蓝色袋子没有红面。你有很强把握排除眼前这只，但还没查袋内。",
    "以It开头，用cannot或can’t、be、my blue bag表达现在的否定推测。",
    "It cannot be my blue bag.",
    [
      [
        "It must be my blue bag.",
        "排除反成肯定。"
      ],
      [
        "It must not be my blue bag.",
        "本题规定用cannot/can’t表达排除，不是must not禁令。"
      ],
      [
        "It cannot my blue bag.",
        "缺少be。"
      ],
      [
        "It cannot have been my blue bag.",
        "把当前物品判断换成过去。"
      ]
    ],
    "cannot be在这里排除身份，不表示某人缺少能力。"
  ],
  [
    "练琴房门关着，里面传出连续的钢琴声。你把这当作很强线索，推断她此刻正在弹琴；没有看见本人。",
    "以She开头，用must、be、play the piano，表达现在正在进行的强肯定推测。",
    "She must be playing the piano.",
    [
      [
        "She must play the piano.",
        "变成必须弹琴的义务，未表达当前进行。"
      ],
      [
        "She must be play the piano.",
        "be后进行动作需-ing。"
      ],
      [
        "She must have been playing the piano.",
        "换成过去进行推测。"
      ],
      [
        "She cannot be playing the piano.",
        "反转推测方向。"
      ]
    ],
    "对正在进行的动作推测用must be + -ing。"
  ],
  [
    "烘焙摊刚出炉一盘面包，包装上还凝着水汽。你根据热气很有把握认为面包现在很热，还未触碰。",
    "以It开头，用must、be、hot表达强肯定推测。",
    "It must be hot.",
    [
      [
        "It is hot.",
        "丢失推测语气。"
      ],
      [
        "It must hot.",
        "缺be。"
      ],
      [
        "It must have been hot.",
        "改成过去。"
      ],
      [
        "It cannot be hot.",
        "肯定反成排除。"
      ]
    ],
    "热气是判断线索；must be保留推断而非实测的身份。"
  ],
  [
    "社团把门口的人认成新成员Ben，但你正与Ben视频通话，他在远处家中。你据此很有把握排除门口的人，未向那人查证姓名。",
    "以He开头，用cannot或can’t、be、Ben表达现在的否定推测。",
    "He cannot be Ben.",
    [
      [
        "He must be Ben.",
        "身份排除反成肯定。"
      ],
      [
        "He cannot Ben.",
        "缺be。"
      ],
      [
        "He cannot have been Ben.",
        "当前身份被换成过去。"
      ],
      [
        "Ben cannot be him.",
        "题目指定He作主语和Ben作身份补语。"
      ]
    ],
    "强线索排除当前身份用cannot be，不涉及能力。"
  ],
  [
    "手工教室里的人双手正在揉面，旁边没有书。你很有把握排除他此刻在读书，但没有走近确认。",
    "以He开头，用cannot或can’t、be、read，表达对现在正在进行动作的否定推测。",
    "He cannot be reading.",
    [
      [
        "He cannot read.",
        "变成不会阅读的能力判断。"
      ],
      [
        "He cannot be read.",
        "当前进行需reading。"
      ],
      [
        "He must be reading.",
        "反转为肯定推测。"
      ],
      [
        "He cannot have been reading.",
        "改成过去进行。"
      ]
    ],
    "cannot be reading排除眼下动作；cannot read通常表示能力不足。"
  ],
  [
    "陌生展厅中，工作人员已挂出关门牌并锁上入口。你从走廊推断展厅现在已经关闭，很有把握，尚未核对营业记录。",
    "以It开头，用must、be、closed表达强肯定推测。",
    "It must be closed.",
    [
      [
        "It is closed.",
        "省去推测语气。"
      ],
      [
        "It must closed.",
        "缺be。"
      ],
      [
        "It must have been closed.",
        "时间变成过去。"
      ],
      [
        "It cannot be closed.",
        "方向反转。"
      ]
    ],
    "closed描述当前状态，must be保留强推测。"
  ],
  [
    "新快递盒上印着你未订购的咖啡机型号，你只订了书。你根据标签很有把握判断这不是自己的包裹，但还未询问送件人。",
    "以It开头，用cannot或can’t、be、my parcel表达现在的否定推测。",
    "It cannot be my parcel.",
    [
      [
        "It must be my parcel.",
        "反转排除判断。"
      ],
      [
        "It cannot my parcel.",
        "缺be。"
      ],
      [
        "It cannot have been my parcel.",
        "当前物品判断变成过去。"
      ],
      [
        "It cannot be your parcel.",
        "所有者从my改为your。"
      ]
    ],
    "标签支撑排除；答案仍是推测，不要求把标签当作绝对真相。"
  ],
  [
    "陌生售票处还没开始服务。窗外可以看到他们手持号码牌，站在队尾很久没有离开，也没有在办其他事。你用这些作为强线索，推测他们现在是否正在等候；还未走近询问。",
    "以They开头，从must或cannot/can’t中选符合线索的一项，用be、wait推测现在正在进行的动作。",
    "They must be waiting.",
    [
      [
        "They cannot be waiting.",
        "号码牌和未开始服务的队列支持等候，排除方向不符。"
      ],
      [
        "They must wait.",
        "变成义务而非现在进行推测。"
      ],
      [
        "They must be wait.",
        "进行动作需waiting。"
      ],
      [
        "They must have been waiting.",
        "题目是当前线索，不能改为过去。"
      ]
    ],
    "线索支持等候这一当前动作；选must后接be waiting，仍保留推测语气。"
  ],
  [
    "另一张木桌上有独特的学校标签与磨痕。你据此很有把握认为它现在很旧，尚未查购买日期。",
    "以It开头，用must、be、old表达强肯定推测。",
    "It must be old.",
    [
      [
        "It is old.",
        "直接断言，缺推测。"
      ],
      [
        "It must old.",
        "缺be。"
      ],
      [
        "It must have been old.",
        "过去替代现在。"
      ],
      [
        "It cannot be old.",
        "反转方向。"
      ]
    ],
    "must be用于现在性质判断，线索不是购买日期的直接证据。"
  ],
  [
    "另一场寻物中，有人把黑色雨伞当作你的新伞；你的新伞是透明的。你据此外观很有把握排除它，尚未打开标签。",
    "以It开头，用cannot或can’t、be、my new umbrella表达现在的否定推测。",
    "It cannot be my new umbrella.",
    [
      [
        "It must be my new umbrella.",
        "方向反转。"
      ],
      [
        "It cannot my new umbrella.",
        "缺be。"
      ],
      [
        "It cannot have been my new umbrella.",
        "现在判断改成过去。"
      ],
      [
        "It cannot be my old umbrella.",
        "new被改成old。"
      ]
    ],
    "cannot be否定当前身份；没有要求推断另一把伞属于谁。"
  ],
  [
    "另一间录音室不断传出歌声。你很有把握认为她此刻正在唱歌，尚未打开门确认。",
    "以She开头，用must、be、sing，表达现在正在进行的强肯定推测。",
    "She must be singing.",
    [
      [
        "She must sing.",
        "变成义务。"
      ],
      [
        "She must be sing.",
        "be后需singing。"
      ],
      [
        "She must have been singing.",
        "现在改成过去。"
      ],
      [
        "She cannot be singing.",
        "肯定改成排除。"
      ]
    ],
    "must be singing保留进行意义与推测强度。"
  ],
  [
    "陌生校园的停车棚有大片水迹，窗外还能看见落雨。你据此很有把握认为外面现在很湿，尚未走出去。",
    "以It开头，用must、be、wet表达强肯定推测。",
    "It must be wet.",
    [
      [
        "It is wet.",
        "缺推测语气。"
      ],
      [
        "It must wet.",
        "缺be。"
      ],
      [
        "It must have been wet.",
        "过去替代现在。"
      ],
      [
        "It cannot be wet.",
        "方向反转。"
      ]
    ],
    "wet是当前状态，must表示根据线索的强判断。"
  ],
  [
    "新图书车有三角形不可拆卸钢架，生产说明确认该型号钢架不能替换或折叠；旧车型号全部是不可拆卸矩形钢架。有人说这就是旧车，你据固定构造很有把握排除，尚未查资产编号。",
    "以It开头，用cannot或can’t、be、the old cart表达现在的否定推测。",
    "It cannot be the old cart.",
    [
      [
        "It must be the old cart.",
        "排除反转。"
      ],
      [
        "It cannot the old cart.",
        "缺be。"
      ],
      [
        "It cannot have been the old cart.",
        "当前身份改成过去。"
      ],
      [
        "It cannot be the new cart.",
        "old改成new。"
      ]
    ],
    "排除旧车身份与不会使用车的能力不同。"
  ],
  [
    "陌生音乐厅的实时直播能辨认出他；整段画面中，他双手各握一根鼓槌持续击鼓，面前只有鼓，没有键盘、手机或其他输入设备。有人说他此刻正在打字，你根据这些现场线索作很有把握的推测。",
    "以He开头，从must或cannot/can’t中选符合线索的一项，用be、type推测现在正在进行的动作。",
    "He cannot be typing.",
    [
      [
        "He must be typing.",
        "双手持续击鼓且没有输入设备的线索排除正在打字。"
      ],
      [
        "He cannot type.",
        "误成没有打字能力；本题只排除正在做的动作。"
      ],
      [
        "He cannot be type.",
        "当前进行需typing。"
      ],
      [
        "He cannot have been typing.",
        "当前实时画面不能换成过去。"
      ]
    ],
    "现场动作线索支持cannot be typing；没有声称他不会打字。127原注释也明确区分cannot be的推测与cannot type的能力含义。"
  ],
  [
    "新的社区会场外全是脚印，里面传出很多交谈声。你很有把握认为会场现在很忙碌，但没看入场统计。",
    "以It开头，用must、be、busy表达强肯定推测。",
    "It must be busy.",
    [
      [
        "It is busy.",
        "缺推测。"
      ],
      [
        "It must busy.",
        "缺be。"
      ],
      [
        "It must have been busy.",
        "换成过去。"
      ],
      [
        "It cannot be busy.",
        "方向反转。"
      ]
    ],
    "must be busy是根据当前线索的强推测。"
  ],
  [
    "另一个失物台的小柜内放着一只完整的小背包；柜门正常关着。你的大背包有不可折叠的硬框，尺寸比该柜的内宽和内高都大，不能装入。你据此很有把握排除柜内这只背包是自己的大背包，还未查名牌。",
    "以It开头，用cannot或can’t、be、my large backpack表达现在的否定推测。",
    "It cannot be my large backpack.",
    [
      [
        "It must be my large backpack.",
        "反转排除。"
      ],
      [
        "It cannot my large backpack.",
        "缺be。"
      ],
      [
        "It cannot have been my large backpack.",
        "改为过去。"
      ],
      [
        "It cannot be my small backpack.",
        "large换成small。"
      ]
    ],
    "现在身份排除用cannot be；大小线索支撑推测，不声称完成认领。"
  ],
  [
    "陌生社区寄送室的窗户有雾，只能看见他们不断把礼品放进打开的纸盒、折盒盖，并贴封条。桌上有已封好的包裹。你根据这些强线索推测他们此刻是否正在打包，没向本人确认。",
    "以They开头，从must或cannot/can’t中选符合线索的一项，用be、pack推测现在正在进行的动作。",
    "They must be packing.",
    [
      [
        "They cannot be packing.",
        "放入物品、折盖和封条的线索支持打包。"
      ],
      [
        "They must pack.",
        "变成义务而非正在进行的推测。"
      ],
      [
        "They must be pack.",
        "进行式需packing。"
      ],
      [
        "They must have been packing.",
        "当前动作不是过去。"
      ]
    ],
    "从连续的装盒封箱线索选择must be packing；仍是未向本人核验的推测。"
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
