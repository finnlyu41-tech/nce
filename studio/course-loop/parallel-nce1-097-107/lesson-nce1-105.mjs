// Original constrained transfer tasks; assessment remains ../model.mjs.
import {author,metadata} from '../parallel-nce1-049-059/authoring.mjs';
import {bindContent} from '../parallel-nce1-025-035/content-contract.mjs';
const data=metadata(105,"a07b1d2d11dd4203d6fcec77df50d3fea95cafffa2ab889f12b1f36dd8356205","谁想做，谁被要求做","区分want to与want someone to，使用正确宾格，把肯定或否定指令通过tell转述给明确对象。",["105原文want to、want her/you to和Tell her to；106配套219页明确肯定与否定want/tell。", "已有一般现在时与代词宾格；使用题内指定动作。"],[{"target": "own-want", "title": "自己想做", "explanation": "主语自己要做动作时用want to加原形。第三人称单数用wants，否定时让do/does承担否定而want回原形。", "example": "I want to read the note.", "meaning": "我自己想读便条。", "check": "先确定动作执行者就是主语，再处理现在时的数和否定。"}, {"target": "want-object", "title": "希望别人做", "explanation": "want后有宾语时，后续动作由该宾语执行：We want him to wait。代词用宾格him/her/us/them。否定want说明不希望发生，不能交换希望者与执行者。", "example": "We want him to wait.", "meaning": "我们希望他等待。", "check": "明确谁希望谁做；宾语用宾格，后续动作用原形。"}, {"target": "tell-object", "title": "转述给谁的指令", "explanation": "tell加宾语再加to和原形，把指令转给那个人。否定动作使用not to：Tell them not to leave。106配套页明确这一扩展。", "example": "Tell them not to leave.", "meaning": "告诉他们不要离开。", "check": "tell后保留接收指令的人；否定指向动作，用not to。"}],[[23.41, 27.38, "原声want to speak：本人动作"], [29.62, 33.42, "原声want her to come：另一个人的动作"], [33.42, 37.22, "原声Tell her to come；not to扩展见106配套页"]],"设计一个真实或明确虚构的两人合作场景：说明你自己想做的动作，你希望伙伴做的动作，再让第三人转告一条指令。写清每次谁说话、对谁说及肯否定。");
data.contentStatus='authored-pending-independent-blind-review';
data.source.pairedExercise={"entryId": "NCE1-105", "lessons": [105, 106], "pages": [219], "note": "Verified paired exercise page extension; no separate original-audio claim. "};
const rows=[
  [
    "此刻我对图书管理员说：我要亲自读那封信，没有要别人替我读。",
    "用I、want、read the letter写一句现在肯定陈述。",
    "I want to read the letter.",
    [
      [
        "I want her to read the letter.",
        "执行者变为她。"
      ],
      [
        "I want read the letter.",
        "缺少不定式连接。"
      ],
      [
        "I wants to read the letter.",
        "I不配wants。"
      ],
      [
        "I do not want to read the letter.",
        "愿望肯否定相反。"
      ]
    ],
    "主语I亲自read，用want to。",
    []
  ],
  [
    "我对助手说：希望那位男同事搬动桌子；那位同事不在场，用代词指他。",
    "用I、want、he、move the table写一句现在肯定陈述，不用姓名。",
    "I want him to move the table.",
    [
      [
        "I want he to move the table.",
        "want后代词应为宾格。"
      ],
      [
        "I want to move the table.",
        "把动作执行者改为我。"
      ],
      [
        "He wants me to move the table.",
        "希望者与执行者反转。"
      ],
      [
        "I do not want him to move the table.",
        "肯否定相反。"
      ]
    ],
    "I希望，him执行move。",
    []
  ],
  [
    "馆长对信使说：请转告那位女志愿者立即关门。女志愿者不在场，指令交给她。",
    "以Tell开头，用she、close the door、at once写一句肯定转述指令；不用please。",
    "Tell her to close the door at once.",
    [
      [
        "Tell she to close the door at once.",
        "tell后宾格。"
      ],
      [
        "Tell her close the door at once.",
        "遗漏to。"
      ],
      [
        "Tell her not to close the door at once.",
        "转为不要关门。"
      ],
      [
        "Close the door at once.",
        "直接命令信使，遗漏给她的转述。"
      ]
    ],
    "信使被要求转告，her才是关门执行者。",
    []
  ],
  [
    "Nora向同事介绍自己的愿望：她想亲自试戴帽子。你现在向店员报告她的愿望，用She指Nora。",
    "用She、want、try on the hat写一句现在肯定陈述。",
    "She wants to try on the hat.",
    [
      [
        "She want to try on the hat.",
        "第三人称单数缺s。"
      ],
      [
        "She wants me to try on the hat.",
        "执行者变成我。"
      ],
      [
        "She wants trying on the hat.",
        "本组指定want to原形结构。"
      ],
      [
        "She does not want to try on the hat.",
        "愿望反转。"
      ]
    ],
    "wants与she一致，试戴者是她自己；try on表示试戴。",
    []
  ],
  [
    "两位组织者想让你保留那张票；他们直接对你说话。用We表达组织者。",
    "用We、want、you、keep the ticket写一句现在肯定陈述。",
    "We want you to keep the ticket.",
    [
      [
        "We want to keep the ticket.",
        "保留票的人变为我们。"
      ],
      [
        "You want us to keep the ticket.",
        "人物方向反转。"
      ],
      [
        "We wants you to keep the ticket.",
        "we不配wants。"
      ],
      [
        "We want you to lose the ticket.",
        "动作由保留变遗失。"
      ]
    ],
    "we希望，you保留票。",
    []
  ],
  [
    "导演对助理说：请转告两位演员不要错过开场。两位演员不在场，用代词指他们。",
    "以Tell开头，用they、miss the opening写一句否定转述指令；不用please。",
    "Tell them not to miss the opening.",
    [
      [
        "Tell them to miss the opening.",
        "指令极性反转。"
      ],
      [
        "Tell they not to miss the opening.",
        "宾格错误。"
      ],
      [
        "Do not tell them to miss the opening.",
        "否定转告行为，未转述不要错过。"
      ],
      [
        "Tell him not to miss the opening.",
        "接收指令的人应为他们，不是他。"
      ]
    ],
    "not否定miss动作，而不是tell行为。",
    []
  ],
  [
    "目前那位男职员明确说自己不想驾驶这辆车。你向同事报告，用He指他。",
    "用He、want、drive the car写一句现在否定陈述，表达他自己的意愿。 将want所在主句写成否定，保留题内动作。",
    "He does not want to drive the car.",
    [
      [
        "He does not wants to drive the car.",
        "does后want回原形。"
      ],
      [
        "He wants to drive the car.",
        "意愿反转。"
      ],
      [
        "He does not want me to drive the car.",
        "执行者变为我。"
      ],
      [
        "He did not want to drive the car.",
        "当前意愿改成过去。"
      ]
    ],
    "does not want to保留他自己现在不想做。",
    []
  ],
  [
    "我向协调员说明自己的意愿：我没有想让那位女编辑改动标题的意愿。女编辑不在场，她不是当前听者。",
    "用I、want、she、change the title写一句现在否定陈述，用代词指女编辑。 将want所在主句写成否定，保留题内动作。",
    "I do not want her to change the title.",
    [
      [
        "I want her to change the title.",
        "意愿反转。"
      ],
      [
        "I do not want she to change the title.",
        "want后宾格。"
      ],
      [
        "I do not want to change the title.",
        "把动作执行者改为I。"
      ],
      [
        "She does not want me to change the title.",
        "希望者与执行者倒置。"
      ]
    ],
    "do not否定我的希望，her执行后续动作。",
    []
  ],
  [
    "老师对班长说：请转告那位男同学完成作业。他不在场，需要班长传话。",
    "以Tell开头，用he、finish the homework写一句肯定转述指令；不用please。",
    "Tell him to finish the homework.",
    [
      [
        "Tell he to finish the homework.",
        "宾格应为him。"
      ],
      [
        "Tell him finishing the homework.",
        "需要to与原形。"
      ],
      [
        "Tell him not to finish the homework.",
        "指令反转。"
      ],
      [
        "Tell her to finish the homework.",
        "接收指令的人错。"
      ]
    ],
    "him是被转告的人，也是完成作业的人。",
    []
  ],
  [
    "在当前录音安排中，我们两人想亲自听这段录音，没有让别人代听。",
    "用We、want、listen to the recording写一句现在肯定陈述。",
    "We want to listen to the recording.",
    [
      [
        "We wants to listen to the recording.",
        "主谓数不符。"
      ],
      [
        "We want him to listen to the recording.",
        "执行者变成他。"
      ],
      [
        "We want listen to the recording.",
        "want后缺to。"
      ],
      [
        "We do not want to listen to the recording.",
        "意愿反转。"
      ]
    ],
    "want to listen：我们是希望者也是听者。",
    []
  ],
  [
    "那位女设计师告诉协调员：她希望两位助手描述那幅画。你向记录员报告，用She指设计师、代词指两位助手。",
    "用She、want、they、describe the picture写一句现在肯定陈述。",
    "She wants them to describe the picture.",
    [
      [
        "She want them to describe the picture.",
        "单数主语缺s。"
      ],
      [
        "She wants they to describe the picture.",
        "宾格应为them。"
      ],
      [
        "She wants to describe the picture.",
        "动作执行者改为她。"
      ],
      [
        "They want her to describe the picture.",
        "人物方向反转。"
      ]
    ],
    "She wants，them describe，保持双方角色。",
    []
  ],
  [
    "仓库经理对信使说：请转告那位男助手不要搬动箱子；助手不在场。",
    "以Tell开头，用he、move the box写一句否定转述指令；不用please。",
    "Tell him not to move the box.",
    [
      [
        "Tell him to move the box.",
        "禁止变命令去做。"
      ],
      [
        "Tell he not to move the box.",
        "宾格错误。"
      ],
      [
        "Do not tell him to move the box.",
        "只禁止转告，未转述禁止搬。"
      ],
      [
        "Tell him not move the box.",
        "缺少to。"
      ]
    ],
    "not to move是转述动作的否定。",
    []
  ],
  [
    "那位女游客目前不想买地图，她说的是自己的动作。你向售货员报告，用She指她。",
    "用She、want、buy a map写一句现在否定陈述。 将want所在主句写成否定，保留题内动作。",
    "She does not want to buy a map.",
    [
      [
        "She does not wants to buy a map.",
        "does后原形。"
      ],
      [
        "She wants to buy a map.",
        "意愿相反。"
      ],
      [
        "She does not want him to buy a map.",
        "执行者变为他。"
      ],
      [
        "She did not want to buy a map.",
        "当前意愿不能改过去。"
      ]
    ],
    "does not want to buy由she亲自执行。",
    []
  ],
  [
    "两位馆员直接对你说明自己的意愿：他们没有想让你弄丢钥匙的意愿。用We表达馆员。",
    "用We、want、you、lose the key写一句现在否定陈述。 将want所在主句写成否定，保留题内动作。",
    "We do not want you to lose the key.",
    [
      [
        "We want you to lose the key.",
        "否定意愿反转。"
      ],
      [
        "We do not want to lose the key.",
        "动作执行者改为我们。"
      ],
      [
        "You do not want us to lose the key.",
        "双方角色倒置。"
      ],
      [
        "We does not want you to lose the key.",
        "we需要do而不是does。"
      ]
    ],
    "we不希望；you是可能遗失钥匙的人。",
    []
  ],
  [
    "母亲对信使说：请转告那位女儿不要弄坏模型；女儿不在场。这是虚构传话练习。",
    "以Tell开头，用she、break the model写一句否定转述指令；不用please。",
    "Tell her not to break the model.",
    [
      [
        "Tell her to break the model.",
        "禁止变为肯定指令。"
      ],
      [
        "Tell she not to break the model.",
        "宾格错。"
      ],
      [
        "Do not tell her to break the model.",
        "否定tell，与转述禁止动作不同。"
      ],
      [
        "Tell her not to breaks the model.",
        "to后原形。"
      ]
    ],
    "not to break否定动作；her保留接收者。",
    []
  ],
  [
    "此刻我对朋友说，我不想亲自搬这个行李箱。我在描述意愿，未判断能否搬动。",
    "用I、want、carry the suitcase写一句现在否定陈述。 将want所在主句写成否定，保留题内动作。",
    "I do not want to carry the suitcase.",
    [
      [
        "I want to carry the suitcase.",
        "意愿反转。"
      ],
      [
        "I cannot carry the suitcase.",
        "能力不是意愿。"
      ],
      [
        "I do not want him to carry the suitcase.",
        "执行者改变。"
      ],
      [
        "I does not want to carry the suitcase.",
        "I不配does。"
      ]
    ],
    "do not want表达自己的否定意愿，而非能力。",
    []
  ],
  [
    "那位男教师希望我们纠正这项错误。你作为其中一人向另一位同学报告；用He指教师。",
    "用He、want、we、correct the mistake写一句现在肯定陈述。",
    "He wants us to correct the mistake.",
    [
      [
        "He want us to correct the mistake.",
        "单数主语需要wants。"
      ],
      [
        "He wants we to correct the mistake.",
        "宾格应为us。"
      ],
      [
        "He wants to correct the mistake.",
        "执行者变为教师。"
      ],
      [
        "We want him to correct the mistake.",
        "人物方向反转。"
      ]
    ],
    "He希望，us纠正错误。",
    []
  ],
  [
    "展览负责人对信使说：请转告两位志愿者保留这些卡片，两人不在场。",
    "以Tell开头，用they、keep the cards写一句肯定转述指令；不用please。",
    "Tell them to keep the cards.",
    [
      [
        "Tell they to keep the cards.",
        "tell后宾格。"
      ],
      [
        "Tell them keep the cards.",
        "缺少to。"
      ],
      [
        "Tell them not to keep the cards.",
        "指令相反。"
      ],
      [
        "Keep the cards.",
        "直接命令信使，遗漏转述对象。"
      ]
    ],
    "them接收指令，keep是他们要做的动作。",
    []
  ]
];
const authored=author(data,rows);
for(let i=0;i<rows.length;i++){
 const q=authored.questions[i];
 const extra=[...rows[i][5]];
 for(const a of q.accepted){if(a.includes('could not'))extra.push(a.replace('could not',"couldn't"));if(a.includes('Tell ')&&a.includes(' not to '))extra.push(a.replace(' not to ',' to not '));}
 q.accepted=[...new Set([...q.accepted,...extra])];
 if(q.accepted[0].startsWith('Tell '))q.form='imperative';
}
export const {lesson,questions,byId,questionsFor,matches}=bindContent(data,authored.questions);
