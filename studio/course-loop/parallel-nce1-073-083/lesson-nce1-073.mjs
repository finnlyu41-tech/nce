// Original constrained transfer tasks; production assessment remains ../model.mjs.
import {author,metadata} from '../parallel-nce1-049-059/authoring.mjs';
import {bindContent} from '../parallel-nce1-025-035/content-contract.mjs';
const data=metadata(73,"33eeb0811738e72e672cf961bc3cc8f88d02ecad4c22fe152096122b0c171254","过去发生了什么，怎样发生","叙述已结束的动作，保留方式与动作顺序，用What did询问未知动作。",["已学69–72课过去时肯否定；原文73与配套74课动词和副词，词义在题内提供。"],[{"target": "past-event", "title": "过去动作与顺序", "explanation": "已结束动作的肯定句用过去式：go→went，take→took，find→found，give→gave。and可依次连接动作；不把顺序倒过来。", "example": "I found a ticket and gave it to Jo.", "meaning": "我找到一张票并把它给了乔。", "check": "先核事实和先后，再用每个动作的过去式。"}, {"target": "past-manner", "title": "动作怎样发生", "explanation": "副词描述动作方式，常放在动词与宾语之后：opened the box carefully。careful是形容词，carefully是副词；well描述做得好，good通常不能直接修饰动作。", "example": "She carried the bowl carefully.", "meaning": "她小心地端着碗。", "check": "核对动作的过去式，再用副词保留题中方式。"}, {"target": "past-what-question", "title": "询问已结束的动作", "explanation": "问对方过去做了什么：What did you do…?。did表示过去，后面do回原形；未知动作不能先编一个动作替对方回答。", "example": "What did you do after the meeting?", "meaning": "会议后你做了什么？", "check": "What + did + 主语 + do，保留题中时间，句末问号。"}],[[64.17, 76.8, "原声：先put再took out与found"], [76.8, 81.53999999999999, "原声：read slowly的方式"], [18.73, 23.59, "原声过去事件；What did结构见74课配套练习"]],"写一个明确过去的小事件：两项有先后的动作，一项动作的方式，并问同伴那段时间做了什么。");
data.contentStatus='authored-pending-independent-blind-review';
data.source.pairedExercise={entryId:'NCE1-73',lessons:[73,74],note:'Odd lesson original transcript plus verified paired exercise pages; exercise practice has no separate original-audio claim.'};
const rows=[
  [
    "失物处昨天的记录：我找到一把钥匙，随后把它给了Ada。",
    "以I开头，用find a key、and、give it to Ada按顺序写一句。",
    "I found a key and gave it to Ada.",
    [
      [
        "I find a key and give it to Ada.",
        "昨天需过去式。"
      ],
      [
        "I found a key and give it to Ada.",
        "第二动作也已发生。"
      ],
      [
        "I gave a key to Ada and found it.",
        "先后倒置。"
      ],
      [
        "Ada found a key and gave it to me.",
        "人物方向改变。"
      ]
    ],
    "found和gave都对应昨天，it保留同一把钥匙。",
    []
  ],
  [
    "搬运日志：她小心地打开了那只箱子，并没有匆忙打开。",
    "用She、open the box、carefully（小心地）写一句过去陈述。",
    "She opened the box carefully.",
    [
      [
        "She opens the box carefully.",
        "不是习惯动作。"
      ],
      [
        "She opened the box careful.",
        "方式需副词。"
      ],
      [
        "She opened the box hurriedly.",
        "方式反转。"
      ],
      [
        "She carefully opens the box.",
        "现在时不符。"
      ]
    ],
    "过去opened，方式carefully。",
    [
      "She carefully opened the box."
    ]
  ],
  [
    "你正问同事昨天的经历，只知道时间，不知道动作。",
    "用What、you、do、yesterday写一句询问。",
    "What did you do yesterday?",
    [
      [
        "What did you did yesterday?",
        "did后原形。"
      ],
      [
        "What do you do yesterday?",
        "昨天用did。"
      ],
      [
        "What did I do yesterday?",
        "提问对象不同。"
      ],
      [
        "You worked yesterday.",
        "编造动作，未询问。"
      ]
    ],
    "What did you do询问未知过去动作。",
    [
      "Yesterday, what did you do?"
    ]
  ],
  [
    "快递点已结束的记录：Leo拿走了那张便条，随后把它读了。",
    "以Leo开头，用take the note、and、read it写一句。",
    "Leo took the note and read it.",
    [
      [
        "Leo takes the note and reads it.",
        "需过去时。"
      ],
      [
        "Leo took the note and reads it.",
        "第二动作也在过去。"
      ],
      [
        "Leo read the note and took it.",
        "顺序颠倒。"
      ],
      [
        "Leo took the book and read it.",
        "物件不符。"
      ]
    ],
    "took与read都是过去式；read拼写不变，读音需另核。",
    []
  ],
  [
    "实验课已经结束：我们缓慢地移动了那张桌子，避免碰到设备。",
    "用We、move the table、slowly（缓慢地）写过去陈述。",
    "We moved the table slowly.",
    [
      [
        "We move the table slowly.",
        "未标过去。"
      ],
      [
        "We moved the table slow.",
        "副词应为slowly。"
      ],
      [
        "We moved the table quickly.",
        "方式相反。"
      ],
      [
        "We moved slowly.",
        "遗漏桌子。"
      ]
    ],
    "moved the table后用slowly说明方式。",
    [
      "We slowly moved the table."
    ]
  ],
  [
    "午休结束后，你要问两位伙伴休息时做了什么，提问对象是负责记录的老师。",
    "用What、they、do、during the break（休息期间）询问。",
    "What did they do during the break?",
    [
      [
        "What did they did during the break?",
        "did后do。"
      ],
      [
        "What do they do during the break?",
        "本次休息已结束。"
      ],
      [
        "What did she do during the break?",
        "主语改变。"
      ],
      [
        "When did they do during the break?",
        "要问动作不是时间。"
      ]
    ],
    "they也用did，不按复数改动助动词。",
    [
      "During the break, what did they do?"
    ]
  ],
  [
    "雨停后的访客记录：他们去了公园，随后看见了一只狐狸。",
    "用They、go to the park、and、see a fox写过去陈述。",
    "They went to the park and saw a fox.",
    [
      [
        "They go to the park and see a fox.",
        "现在时。"
      ],
      [
        "They went to the park and see a fox.",
        "see需过去式。"
      ],
      [
        "They saw a fox and went to the park.",
        "先后反转。"
      ],
      [
        "They went to the park and saw a dog.",
        "动物变了。"
      ]
    ],
    "went与saw依次记录两个已发生动作。",
    []
  ],
  [
    "社团活动已结束：Omar很流利地说了法语，记录不评价他的英语。",
    "用Omar、speak French、fluently（流利地）写一句过去陈述。",
    "Omar spoke French fluently.",
    [
      [
        "Omar speaks French fluently.",
        "改成现时能力。"
      ],
      [
        "Omar spoke French fluent.",
        "方式需副词。"
      ],
      [
        "Omar spoke English fluently.",
        "语言改变。"
      ],
      [
        "Omar spoke French slowly.",
        "缓慢不等于流利。"
      ]
    ],
    "spoke为过去动作，fluently保留方式。",
    [
      "Omar fluently spoke French."
    ]
  ],
  [
    "活动资料没有记下Nia课后的行动，你正在向别人询问。",
    "用What、Nia、do、after class询问那一次过去行动。",
    "What did Nia do after class?",
    [
      [
        "What did Nia does after class?",
        "did后不加s。"
      ],
      [
        "What does Nia do after class?",
        "习惯不是那一次。"
      ],
      [
        "What did Nia did after class?",
        "重复过去标记。"
      ],
      [
        "Nia went home after class.",
        "未知行动被编造。"
      ]
    ],
    "名字作主语仍用did+do。",
    [
      "After class, what did Nia do?"
    ]
  ],
  [
    "重新核对仓库交接：我把那本书放在桌上，然后离开了房间。",
    "以I开头，用put the book on the table、and、leave the room写一句。",
    "I put the book on the table and left the room.",
    [
      [
        "I puts the book on the table and leaves the room.",
        "是已结束动作。"
      ],
      [
        "I put the book on the table and leave the room.",
        "leave需left。"
      ],
      [
        "I left the room and put the book on the table.",
        "顺序改变。"
      ],
      [
        "I put the book under the table and left the room.",
        "位置改变。"
      ]
    ],
    "put过去式拼写不变，leave变left。",
    []
  ],
  [
    "修补另一种方式：两位队员轻声地关上了那扇门，并非大声关门。",
    "用They、close the door、quietly（轻声地）写一句过去陈述。",
    "They closed the door quietly.",
    [
      [
        "They close the door quietly.",
        "不是现在动作。"
      ],
      [
        "They closed the door quiet.",
        "quietly修饰动作。"
      ],
      [
        "They closed the door loudly.",
        "方式相反。"
      ],
      [
        "They quietly opened the door.",
        "动作改成打开。"
      ]
    ],
    "closed与quietly各保留动作、方式。",
    [
      "They quietly closed the door."
    ]
  ],
  [
    "修补疑问句时换一个对象：你问老师那位男孩昨晚做了什么。",
    "用What、he、do、last night询问。",
    "What did he do last night?",
    [
      [
        "What did he did last night?",
        "did后原形。"
      ],
      [
        "What does he do last night?",
        "时间与助动词不符。"
      ],
      [
        "What did he do tonight?",
        "时间改变。"
      ],
      [
        "What he did last night?",
        "直接问句需did置于主语前。"
      ]
    ],
    "last night指定过去，did不带第三人称s。",
    [
      "Last night, what did he do?"
    ]
  ],
  [
    "下一天收到远足回报：她先喝了水，然后坐下了。",
    "用She、drink some water、and、sit down按顺序写一句。",
    "She drank some water and sat down.",
    [
      [
        "She drinks some water and sits down.",
        "回报过去动作。"
      ],
      [
        "She drank some water and sit down.",
        "sit应为sat。"
      ],
      [
        "She sat down and drank some water.",
        "先后颠倒。"
      ],
      [
        "She drank some milk and sat down.",
        "饮品改变。"
      ]
    ],
    "drank和sat都是不规则过去式。",
    []
  ],
  [
    "新收到昨日泳池练习记录：Mia游得很好，只需记录表现。",
    "用Mia、swim、well写一句过去陈述。",
    "Mia swam well.",
    [
      [
        "Mia swims well.",
        "不是现在习惯。"
      ],
      [
        "Mia swam good.",
        "修饰游泳用well。"
      ],
      [
        "Mia swam badly.",
        "表现反转。"
      ],
      [
        "Mia ran well.",
        "项目改变。"
      ]
    ],
    "swam的表现由well修饰。",
    []
  ],
  [
    "你只知道昨天会议结束了，想问我们会议后做了什么。",
    "用What、we、do、after the meeting发问。",
    "What did we do after the meeting?",
    [
      [
        "What did we did after the meeting?",
        "did后do。"
      ],
      [
        "What do we do after the meeting?",
        "过去事件。"
      ],
      [
        "What did we do before the meeting?",
        "先后关系改变。"
      ],
      [
        "Where did we go after the meeting?",
        "问地点不是问做什么。"
      ]
    ],
    "保持What+did+we+do和after。",
    [
      "After the meeting, what did we do?"
    ]
  ],
  [
    "第二次回访收到的车站记录：Ben先买了一张票，再乘了火车。",
    "用Ben、buy a ticket、and、take the train写一句。",
    "Ben bought a ticket and took the train.",
    [
      [
        "Ben buys a ticket and takes the train.",
        "过去记录。"
      ],
      [
        "Ben bought a ticket and take the train.",
        "take需took。"
      ],
      [
        "Ben took the train and bought a ticket.",
        "顺序反转。"
      ],
      [
        "Ben bought a ticket and took the bus.",
        "交通工具改变。"
      ]
    ],
    "bought与took不能写成规则-ed。",
    []
  ],
  [
    "新音乐节资料说我们热情地欢迎了客人，活动已结束。",
    "用We、greet the guests、warmly（热情地）写一句过去陈述。",
    "We greeted the guests warmly.",
    [
      [
        "We greet the guests warmly.",
        "时态不符。"
      ],
      [
        "We greeted the guests warm.",
        "方式需副词。"
      ],
      [
        "We greeted the guests coldly.",
        "意思相反。"
      ],
      [
        "We greeted the hosts warmly.",
        "对象改变。"
      ]
    ],
    "规则过去式greeted，方式warmly。",
    [
      "We warmly greeted the guests."
    ]
  ],
  [
    "另一份记录缺少两位志愿者今天上午已经结束的行动。",
    "用What、the volunteers、do、this morning询问过去行动。",
    "What did the volunteers do this morning?",
    [
      [
        "What did the volunteers did this morning?",
        "did后do。"
      ],
      [
        "What do the volunteers do this morning?",
        "已结束行动。"
      ],
      [
        "What did the volunteer do this morning?",
        "人数变化。"
      ],
      [
        "What did the volunteers do tomorrow morning?",
        "时间错。"
      ]
    ],
    "this morning在本题已结束，使用did。",
    [
      "This morning, what did the volunteers do?"
    ]
  ]
];
const authored=author(data,rows);
for(let i=0;i<rows.length;i++)authored.questions[i].accepted=[...new Set([...authored.questions[i].accepted,...rows[i][5],...authored.questions[i].accepted.filter(a=>a.includes('did not')).map(a=>a.replace('did not',"didn't"))])];
export const {lesson,questions,byId,questionsFor,matches}=bindContent(data,authored.questions);
