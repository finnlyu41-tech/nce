// Original finite transfer tasks only; assessment remains the existing production model.
import {author,metadata} from '../parallel-nce1-049-059/authoring.mjs';
import {bindContent} from '../parallel-nce1-025-035/content-contract.mjs';
const data=metadata(129,
"99f00b0416941cc2f611700e749654e99a3e3dbb50e69352b373a28e456eea3f",
"过去的强推测与排除",
"根据回顾线索推测过去状态或身份，并推测过去某时正在进行的动作。",
[
  "已学127–128的must/cannot be现在推测及have been、be + -ing形式。",
  "只覆盖129–130原页的must/cannot have been状态与进行推测，不扩展所有完成情态形式。"
],
[
  {
    "target": "past-strong-state",
    "title": "过去状态的强肯定推测",
    "explanation": "must have been +状态/身份表示很有把握的过去推测。130配套页有tired等状态；不能省have改成must be现在推测。",
    "example": "It must have been quiet.",
    "meaning": "那里当时一定很安静。",
    "check": "过去状态用must + have + been +状态，have保持原形。"
  },
  {
    "target": "past-exclusion",
    "title": "排除过去身份或状态",
    "explanation": "cannot/can’t have been +状态/身份排除过去可能；不是cannot be现在判断。129原文缩略了进行补语，130配套页给出完整状态句。",
    "example": "It cannot have been the small box.",
    "meaning": "它当时不可能是那个小盒子。",
    "check": "过去排除保留cannot/can’t + have + been；不替换成当前能力。"
  },
  {
    "target": "past-ongoing-inference",
    "title": "推测过去正在进行的动作",
    "explanation": "129原文与注释明确must have been driving/dreaming；130配套有can’t have been reading和must have been sleeping。结构是must/cannot + have been + -ing。",
    "example": "They must have been talking.",
    "meaning": "他们当时一定正在交谈。",
    "check": "过去当时进行需have been + -ing，区别现在be doing及只说完成过。"
  }
],
[
  [
    52.83,
    56.01,
    "129原文must have been dreaming；过去状态另见130配套"
  ],
  [
    38.88,
    41.85,
    "129原文can’t have been省略；完整状态排除来自130配套"
  ],
  [
    33.56,
    38.88,
    "129原文must have been driving；过去进行结构"
  ]
],
"自拟一个明确标注虚构的日常场景，写三句话分别使用本组三个目标，说明时间、线索和把握程度；不要把未证实推测说成已核实事实。");
data.source.pairedExercise={
  "entryId": "NCE1-129",
  "pageKey": "NCE1-267",
  "lessons": [
    129,
    130
  ],
  "catalogPages": [
    266,
    267,
    268
  ],
  "printedPages": [
    262,
    263,
    264
  ],
  "note": "来源目录页号与印刷页号相差4；注释、句型和书面页已逐页目视核验，未复制原题作新迁移。"
};
data.source.grammarPages=[
  {
    "pageKey": "NCE1-266",
    "src": "/lesson-pages/d0eba348078ffe25e0a29246e99873cad0bf07b2cae3eb329dbcbb0b2a7da6bb.jpg",
    "sha256": "d0eba348078ffe25e0a29246e99873cad0bf07b2cae3eb329dbcbb0b2a7da6bb"
  },
  {
    "pageKey": "NCE1-267",
    "src": "/lesson-pages/33e940b5154ba96e21e2c34ab2d18202e5ecc94e2b7bf79a8c656e721548934a.jpg",
    "sha256": "33e940b5154ba96e21e2c34ab2d18202e5ecc94e2b7bf79a8c656e721548934a"
  },
  {
    "pageKey": "NCE1-268",
    "src": "/lesson-pages/c90deaf4aef87de5f0a97bc7efd02e22cf7c5ff17b9f955368d8c63c203fa76d.jpg",
    "sha256": "c90deaf4aef87de5f0a97bc7efd02e22cf7c5ff17b9f955368d8c63c203fa76d"
  }
];
data.limitations=['仅覆盖本组三目标，不证明全部情态体系或整章掌握。','所有新任务为原创虚构日常情境；有限文字匹配不评分音频、开放输出或发音。','clip起点与结束边界来自下一原文row时间，未试听核实实际听感或末音。','复习两题库情境不同；自然24小时/7天保持、口语与学习增益仍未验证。'];
const rows=[
  [
    "昨晚的工作坊留下满地纸屑和一箱成品。你根据痕迹很有把握认为昨晚那里很忙碌；你不在现场，还未问参与者。",
    "以It开头，用must、have、been、busy推测昨晚的状态，不另加时间词。",
    "It must have been busy.",
    [
      [
        "It must be busy.",
        "变成现在状态。"
      ],
      [
        "It must had been busy.",
        "must后have用原形。"
      ],
      [
        "It must have be busy.",
        "have后需been。"
      ],
      [
        "It cannot have been busy.",
        "方向反转。"
      ]
    ],
    "must have been +形容词把强推测定位到过去。"
  ],
  [
    "昨天送到社团的包裹标签显示D尺寸，Ben订的是A尺寸。你很有把握认为那不是Ben的包裹，还没问送件人。",
    "以It开头，用cannot或can’t、have、been、Ben’s parcel推测昨天的身份，不另加时间词。",
    "It cannot have been Ben’s parcel.",
    [
      [
        "It cannot be Ben’s parcel.",
        "过去变为现在。"
      ],
      [
        "It cannot had been Ben’s parcel.",
        "情态后have原形。"
      ],
      [
        "It cannot have be Ben’s parcel.",
        "需been。"
      ],
      [
        "It must have been Ben’s parcel.",
        "反转排除。"
      ]
    ],
    "cannot have been排除过去身份，不是现在能力。"
  ],
  [
    "昨天午后录音里有连续的钢琴声，使用表显示她预约了那时段。你很有把握推断她当时正在弹琴，但未看见本人。",
    "以She开头，用must、have、been、play the piano，推测过去当时正在进行的动作。",
    "She must have been playing the piano.",
    [
      [
        "She must be playing the piano.",
        "过去改为現在。"
      ],
      [
        "She must have been play the piano.",
        "进行动作需playing。"
      ],
      [
        "She must have played the piano.",
        "题目要求当时进行，不能只报告完成过。"
      ],
      [
        "She cannot have been playing the piano.",
        "方向反转。"
      ]
    ],
    "must have been + -ing针对过去正在进行的动作。"
  ],
  [
    "昨天的屋外照片显示大片水迹，雨伞全开。你据此很有把握认为外面当时很湿，尚未向摄影者确认。",
    "以It开头，用must、have、been、wet推测过去状态。",
    "It must have been wet.",
    [
      [
        "It must be wet.",
        "现在替代过去。"
      ],
      [
        "It must had been wet.",
        "have需原形。"
      ],
      [
        "It must have be wet.",
        "需been。"
      ],
      [
        "It cannot have been wet.",
        "方向相反。"
      ]
    ],
    "过去的线索与状态用must have been wet。"
  ],
  [
    "昨天装书的盒子照片有红色角标，新盒子的角标都是绿色。你很有把握排除照片里的是新盒子，尚未查编号。",
    "以It开头，用cannot或can’t、have、been、the new box推测过去身份。",
    "It cannot have been the new box.",
    [
      [
        "It cannot be the new box.",
        "改成现在。"
      ],
      [
        "It cannot had been the new box.",
        "情态后have原形。"
      ],
      [
        "It cannot have be the new box.",
        "需been。"
      ],
      [
        "It must have been the new box.",
        "方向相反。"
      ]
    ],
    "cannot have been排除照片所记录的过去身份。"
  ],
  [
    "昨晚你在门外通过无录制或播放设备的现场对话，听到可辨认的他本人持续回答你的新问题，回答与即时问题对应。有人说他那时正在睡觉；你根据本人实时互动很有把握排除这一说法，没进屋观察。",
    "以He开头，用cannot或can’t、have、been、sleep，推测过去当时不可能正在做的动作。",
    "He cannot have been sleeping.",
    [
      [
        "He cannot be sleeping.",
        "现在替代过去。"
      ],
      [
        "He cannot have been sleep.",
        "需sleeping。"
      ],
      [
        "He could not sleep.",
        "不能入睡的能力/状态不等于排除当时正在睡。"
      ],
      [
        "He must have been sleeping.",
        "方向反转。"
      ]
    ],
    "cannot have been sleeping排除过去进行，不表示失眠能力。"
  ],
  [
    "陌生木工展昨天卖的一套工具，每件都有复杂手工雕刻，旁边同类简装套装标价远超你的预算。实际成交价遮住了；你据此很有把握推测那套工具当时很昂贵，还未看账单。",
    "以It开头，用must、have、been、expensive推测过去状态。",
    "It must have been expensive.",
    [
      [
        "It must be expensive.",
        "过去成交情境变成当前状态。"
      ],
      [
        "It must had been expensive.",
        "情态后have需原形。"
      ],
      [
        "It must have be expensive.",
        "需been。"
      ],
      [
        "It cannot have been expensive.",
        "将线索支持的昂贵推测反成排除。"
      ]
    ],
    "昂贵是对当时价格的推测，不把遮住的账单说成已核实。"
  ],
  [
    "陌生团队昨天的语音连线没有播放录音，主持人分别提问，能辨认出Leo与另两名同伴同时从同一房间现场回应。有人说Leo那时独自一人。你据互动很有把握排除，还未亲自看见房间。",
    "以He开头，用cannot或can’t、have、been、alone推测过去状态。",
    "He cannot have been alone.",
    [
      [
        "He cannot be alone.",
        "昨天状态不能换成现在。"
      ],
      [
        "He cannot had been alone.",
        "情态后需have原形。"
      ],
      [
        "He cannot have be alone.",
        "需been。"
      ],
      [
        "He must have been alone.",
        "两名同伴在同一房间的现场回应与独自一人冲突。"
      ]
    ],
    "根据同室多人现场互动排除过去独自一人，保留have been。"
  ],
  [
    "昨天搬物活动的一个连续片段能辨认出她：她始终在干燥的仓库地面上，双脚没有离地，双手抱着箱子缓慢走路；该片段中没有泳池或水。有人说她在这个片段中正在游泳，你据此作很有把握的推测。",
    "以She开头，从must或cannot/can’t中选符合线索的一项，用have、been、swim推测过去片段中正在进行的动作。",
    "She cannot have been swimming.",
    [
      [
        "She must have been swimming.",
        "干燥地面上持续抱箱走路与正在游泳冲突。"
      ],
      [
        "She cannot be swimming.",
        "过去片段改成现在。"
      ],
      [
        "She cannot have been swim.",
        "过去进行需swimming。"
      ],
      [
        "She could not swim.",
        "误成不会游泳的能力判断。"
      ]
    ],
    "排除过去正在游泳用cannot have been swimming，不表示她缺乏游泳能力。"
  ],
  [
    "另一趟活动结束后，照片中Leo频繁打哈欠并靠着椅背。你据此很有把握认为他当时很累，尚未问本人。",
    "以He开头，用must、have、been、tired推测过去状态。",
    "He must have been tired.",
    [
      [
        "He must be tired.",
        "改现在。"
      ],
      [
        "He must had been tired.",
        "情态后have原形。"
      ],
      [
        "He must have be tired.",
        "需been。"
      ],
      [
        "He cannot have been tired.",
        "方向反转。"
      ]
    ],
    "tired是状态，must have been把强推測定位到当时。"
  ],
  [
    "另一张昨晚的送货照片显示厚纸袋，有人把它当成你薄布袋。你根据材料很有把握排除，尚未查标签。",
    "以It开头，用cannot或can’t、have、been、my cloth bag推测过去身份。",
    "It cannot have been my cloth bag.",
    [
      [
        "It cannot be my cloth bag.",
        "改当前判断。"
      ],
      [
        "It cannot had been my cloth bag.",
        "have需原形。"
      ],
      [
        "It cannot have be my cloth bag.",
        "需been。"
      ],
      [
        "It must have been my cloth bag.",
        "方向反转。"
      ]
    ],
    "根据昨晚照片排除身份，保留过去标记have been。"
  ],
  [
    "另一份昨天的庭院声音记录始终有歌声，时段正好是她的练唱预约。你很有把握推断她当时正在唱歌，未看见本人。",
    "以She开头，用must、have、been、sing，推测过去当时正在进行的动作。",
    "She must have been singing.",
    [
      [
        "She must be singing.",
        "过去改为现在。"
      ],
      [
        "She must have been sing.",
        "需singing。"
      ],
      [
        "She must have sung.",
        "缺题目要求的当时进行。"
      ],
      [
        "She cannot have been singing.",
        "方向相反。"
      ]
    ],
    "过去进行推测是must have been singing。"
  ],
  [
    "新徒步队昨天回到终点后的画面显示他们嘴唇干、反复寻找饮水处，很快喝光了各自水瓶。你当时没在现场，据这些痕迹很有把握推测他们那时很渴，还未问本人。",
    "以They开头，用must、have、been、thirsty推测过去状态。",
    "They must have been thirsty.",
    [
      [
        "They must be thirsty.",
        "昨天状态变成当前。"
      ],
      [
        "They must had been thirsty.",
        "情态后have原形。"
      ],
      [
        "They must have be thirsty.",
        "需been。"
      ],
      [
        "They cannot have been thirsty.",
        "寻找饮水及迅速喝水的线索支持口渴，而非排除。"
      ]
    ],
    "过去口渴是对行为的强推测，不宣称已经本人确认。"
  ],
  [
    "新读书会昨天按公告时间准时开场。开场前十五分钟，你与Nora进行无录制的现场视频通话，她已在会场入口完成签到。有人说她到场晚了。你据当时通话线索很有把握排除，但没有亲自查出席表。",
    "以She开头，用cannot或can’t、have、been、late推测过去状态。",
    "She cannot have been late.",
    [
      [
        "She cannot be late.",
        "昨天到场判断变成现在。"
      ],
      [
        "She cannot had been late.",
        "情态后have原形。"
      ],
      [
        "She cannot have be late.",
        "需been。"
      ],
      [
        "She must have been late.",
        "开场前已在会场的线索支持排除迟到。"
      ]
    ],
    "准时开场且提前在场的线索支持cannot have been late；未查出席表。"
  ],
  [
    "新修理社昨晚只安排Leo使用该工作台。随后桌上留下拆开的收音机、刚换下的损坏零件与拧松的螺丝，录音里有持续测试声音。你没有见到工作过程，用这些强线索推测他当时是否正在修收音机。",
    "以He开头，从must或cannot/can’t中选符合线索的一项，用have、been、repair the radio推测过去当时正在进行的动作。",
    "He must have been repairing the radio.",
    [
      [
        "He cannot have been repairing the radio.",
        "拆开设备、更换零件和测试声支持修理，排除方向不符。"
      ],
      [
        "He must be repairing the radio.",
        "昨晚改成当前。"
      ],
      [
        "He must have been repair the radio.",
        "进行动作需repairing。"
      ],
      [
        "He must have repaired the radio.",
        "题目要当时正在做，不只报告完成过。"
      ]
    ],
    "must have been repairing把痕迹作为过去进行的强推测依据，不宣称维修已成功完成。"
  ],
  [
    "另一场昨日的纸艺活动录音虽然隔门，却不断传来很多人说话和裁切机器的响声，你只能听到声音而不在房内。你据此很有把握推测房间当时很吵，还未问参与者。",
    "以It开头，用must、have、been、noisy推测过去状态。",
    "It must have been noisy.",
    [
      [
        "It must be noisy.",
        "昨日改成当前。"
      ],
      [
        "It must had been noisy.",
        "情态后have原形。"
      ],
      [
        "It must have be noisy.",
        "需been。"
      ],
      [
        "It cannot have been noisy.",
        "持续说话和机器响声支持嘈杂，而非排除。"
      ]
    ],
    "noisy是对昨天房内状态的强推测，未扩展到原页之外的新语法。"
  ],
  [
    "另一场昨天的合影采用一台必须由人在相机旁按键的旧相机，没有定时或遥控。拍下这张照片的那一刻，Leo可辨认地坐在远处被拍的人群中。有人说他是拍这张照片的人，你据构造和位置线索很有把握排除，尚未向操作者确认。",
    "以He开头，用cannot或can’t、have、been、the photographer，推测拍下这张照片那一刻的身份。",
    "He cannot have been the photographer.",
    [
      [
        "He cannot be the photographer.",
        "过去拍照身份变成当前。"
      ],
      [
        "He cannot had been the photographer.",
        "情态后have原形。"
      ],
      [
        "He cannot have be the photographer.",
        "需been。"
      ],
      [
        "He must have been the photographer.",
        "无遥控且远在被拍人群中，无法同时在相机旁按键。"
      ]
    ],
    "这里只排除拍下这一张照片时的身份，不声称Leo从不做摄影。"
  ],
  [
    "另一间昨天的画室由他们单独预约。门外听见反复涮画笔的水声，结束后留下刚涂色的湿画、配好的颜料和他们各自沾满同色颜料的工作围裙。你没见过程，用这些强线索推测他们当时是否正在画画。",
    "以They开头，从must或cannot/can’t中选符合线索的一项，用have、been、paint推测过去当时正在进行的动作。",
    "They must have been painting.",
    [
      [
        "They cannot have been painting.",
        "湿画、颜料围裙与涮画笔声支持画画，而非排除。"
      ],
      [
        "They must be painting.",
        "过去改成当前。"
      ],
      [
        "They must have been paint.",
        "过去进行需painting。"
      ],
      [
        "They must have painted.",
        "题目要当时进行，而不是只说明完成过。"
      ]
    ],
    "根据工作痕迹选择must have been painting，不把预约本身当作唯一充分证据。"
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
