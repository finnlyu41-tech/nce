// Original task data; shared matcher and production event factory stay unchanged.
import {author,metadata} from '../parallel-nce1-049-059/authoring.mjs';
import {bindContent} from '../parallel-nce1-025-035/content-contract.mjs';
const data=metadata(...[139, "e3a665e4890dc56ec728e91bb13dcf3d6860ca1ed1d37777ae86eaacd3a2701e", "当前间接疑问句与未知信息", "从情境判断是否、内容、原因和时间，保留当前转述与从句陈述语序，并区分外层直接问句。", ["第133–138课报道与当前事实区别；一般现在、过去、进行、完成与 will；第140课 if/why/what/when 为本组配对练习。"], [{"target": "indirect-whether", "title": "是否问题保留未知与当前时态", "explanation": "wants to know 后用 if 或 whether 引出是否，再用主语加谓语。去掉疑问 do/does 后恢复动词变化。主句现在时不强制把从句改过去；原问的否定范围也不能移动。", "example": "The clerk wants to know whether the package has arrived.", "meaning": "办事员想知道包裹是否已到。", "check": "if/whether + 主语 + 谓语；保留当前报道和原命题。"}, {"target": "indirect-content", "title": "未知的是内容、原因还是主语", "explanation": "what 问内容或未知主语，why 问原因。转述不把已知动作改成是否问题；what 自己是主语时后面直接接谓语，不能把受事移成施事。", "example": "The teacher wants to know what the class is making.", "meaning": "老师想知道全班正在制作什么。", "check": "保留未知种类；从句用陈述语序，what 作主语时不再添主语。"}, {"target": "indirect-time", "title": "时间从句与外层直接问句分开", "explanation": "时间问题用 when + 主语 + 谓语；现在不知道未来时间可保留 will。Does someone know when…? 的倒装只在外层，内层仍是陈述顺序。否定 know 不等于否定将发生的动作。", "example": "Does the pilot know when the fog will clear?", "meaning": "飞行员知道雾何时会散吗？", "check": "区分 wants to know 陈述与 Does…know 问句；内层不倒装。"}], [[58.11, 66.16, "听是否从句"], [66.16, 70.67, "听 what 内容从句"], [54.72, 58.11, "听未知未来时间"]], "选择一次真实或明确虚构的查询，写三条现在的 wants to know 陈述，分别问是否、内容或原因、时间；再写一条 Does…know 直接问句。标清谁对谁说话和已知与未知，不强制时态回移。"]);
const rows=[
 [
  "现在客服正在记录客户尚未得到答案的问题：Is the line working? 客户想知道是否正常，不是在问原因。",
  "以 The customer wants to know 开头转述，保留现在时。",
  "The customer wants to know if the line is working.",
  [
   [
    "The customer wants to know if is the line working.",
    "从句不可沿用倒装。"
   ],
   [
    "The customer wants to know why the line is working.",
    "是否与原因不同。"
   ],
   [
    "The customer wants to know if the line was working.",
    "当前询问无需改过去时。"
   ],
   [
    "The customer wants to know the line is working.",
    "是否的连接词不能省略。"
   ]
  ],
  "whether 与 if 都可引出是否，后接陈述语序。"
 ],
 [
  "编辑现在问 What are the children drawing? 同时明确知道他们在画画；只缺作品的内容。",
  "以 The editor wants to know 开头转述，保留 the children。",
  "The editor wants to know what the children are drawing.",
  [
   [
    "The editor wants to know what are the children drawing.",
    "从句不能倒装。"
   ],
   [
    "The editor wants to know if the children are drawing.",
    "已知是否画画，问的是内容。"
   ],
   [
    "The editor wants to know why the children are drawing.",
    "未询问原因。"
   ],
   [
    "The editor wants to know what the children were drawing.",
    "现在的活动不能任意改过去。"
   ]
  ],
  "what 保留未知的内容，are 回到主语之后。"
 ],
 [
  "调度员现在知道船今天将出发，但时间未定。他的问题是 When will the boat leave?",
  "以 The dispatcher wants to know 开头转述，保留 will。",
  "The dispatcher wants to know when the boat will leave.",
  [
   [
    "The dispatcher wants to know when will the boat leave.",
    "when 从句用陈述语序。"
   ],
   [
    "The dispatcher wants to know if the boat will leave.",
    "是否出发已确定，缺的是时间。"
   ],
   [
    "The dispatcher wants to know when the boat would leave.",
    "当前报道不强制过去移位。"
   ],
   [
    "The dispatcher wants to know when the boat leaves yesterday.",
    "yesterday 与今天将出发冲突。"
   ]
  ],
  "主句现在时，未来时间保留 will。"
 ],
 [
  "接待员现在问 Does the visitor need a ticket? 没有确认答案。",
  "用 The receptionist wants to know 转述，不改时态。",
  "The receptionist wants to know if the visitor needs a ticket.",
  [
   [
    "The receptionist wants to know if does the visitor need a ticket.",
    "去掉疑问辅助 does。"
   ],
   [
    "The receptionist wants to know if the visitor need a ticket.",
    "第三人称 needs。"
   ],
   [
    "The receptionist wants to know that the visitor needs a ticket.",
    "that 陈述事实，不保留是否。"
   ],
   [
    "The receptionist wants to know if the visitor needed a ticket.",
    "当前问题不强制回移。"
   ]
  ],
  "去掉 does 后，实义动词恢复 needs。"
 ],
 [
  "经理现在知道工人正在停工，问 Why are the workers waiting? 是原因问题。",
  "用 The manager wants to know 转述，保留 the workers。",
  "The manager wants to know why the workers are waiting.",
  [
   [
    "The manager wants to know why are the workers waiting.",
    "从句不能倒装。"
   ],
   [
    "The manager wants to know if the workers are waiting.",
    "问原因而不是是否。"
   ],
   [
    "The manager wants to know what the workers are waiting.",
    "what 不能代替 why。"
   ],
   [
    "The manager wants to know why the workers were waiting.",
    "当前等待保留现在进行时。"
   ]
  ],
  "why 与 what 的未知信息不同，均须保留原问题。"
 ],
 [
  "现在问朋友是否知道开场时间：Does Leo know when the show will start? 你直接向另一人发问，而不是转述 Leo 的愿望。",
  "写这一个直接问句，使用题中全部词语。",
  "Does Leo know when the show will start?",
  [
   [
    "Leo wants to know when the show will start.",
    "把直接询问知不知道改成愿望陈述。"
   ],
   [
    "Does Leo know when will the show start?",
    "只有外层直接问句倒装。"
   ],
   [
    "Does Leo knows when the show will start?",
    "does 后 know 用原形。"
   ],
   [
    "Does Leo know if the show will start?",
    "把时间改成是否。"
   ]
  ],
  "外层 Does Leo know 倒装，内层 when the show will start 不倒装。"
 ],
 [
  "药房记录：顾客现在问 Is this medicine safe for children? 没有在问安全的原因。选择准确转述。",
  "只选一整句。",
  "The customer wants to know whether this medicine is safe for children.",
  [
   [
    "The customer wants to know why this medicine is safe for children.",
    "原因与是否不同。"
   ],
   [
    "The customer wants to know whether is this medicine safe for children.",
    "从句倒装。"
   ],
   [
    "The customer wants to know whether this medicine was safe for children.",
    "当前询问不改过去。"
   ],
   [
    "The customer knows this medicine is safe for children.",
    "问题尚无答案，不能宣称知道事实。"
   ]
  ],
  "记录未知是否，而非提供安全结论。"
 ],
 [
  "你正在跟 Maya 交谈。你知道她在写东西，但看不清内容。用 I want to know 表达你的问题；you 只指 Maya。",
  "写一个含 what 的陈述句，使用 you / write 的现在进行时。",
  "I want to know what you are writing.",
  [
   [
    "I want to know if you are writing.",
    "写东西已知，缺内容。"
   ],
   [
    "I want to know what are you writing.",
    "内层倒装。"
   ],
   [
    "I want to know what she is writing.",
    "正在对 Maya 说话，题目要求 you。"
   ],
   [
    "I do not want to know what you are writing.",
    "否定了想知道的意愿。"
   ]
  ],
  "受话人未改变，you 保留；I want to know 是陈述。"
 ],
 [
  "报告者现在不知道救援队何时会到，但确定他们会到。",
  "以 The reporter does not know 开头，使用 when / the rescue team / will arrive。",
  "The reporter does not know when the rescue team will arrive.",
  [
   [
    "The reporter knows when the rescue team will not arrive.",
    "否定落在到达而非知道上。"
   ],
   [
    "The reporter does not know when will the rescue team arrive.",
    "内层倒装。"
   ],
   [
    "The reporter does not know if the rescue team will arrive.",
    "到达确定，缺时间。"
   ],
   [
    "The reporter did not know when the rescue team would arrive.",
    "改成过去报道。"
   ]
  ],
  "does not 否定掌握时间，不否定未来到达。"
 ],
 [
  "售票员现在问 Are the seats free? 是核实座位是否免费，不问为什么。",
  "以 The clerk wants to know 开头转述。",
  "The clerk wants to know if the seats are free.",
  [
   [
    "The clerk wants to know if are the seats free.",
    "从句不倒装。"
   ],
   [
    "The clerk wants to know why the seats are free.",
    "原因不是原问。"
   ],
   [
    "The clerk wants to know if the seats is free.",
    "复数 seats 配 are。"
   ],
   [
    "The clerk wants to know the seats are free.",
    "丢失是否。"
   ]
  ],
  "if/whether 后保留复数主语与 are。"
 ],
 [
  "维修员现在问 What has damaged the cable? what 本身是未知的施事；不是询问是否损坏。",
  "用 The engineer wants to know 转述，保留现在完成时。",
  "The engineer wants to know what has damaged the cable.",
  [
   [
    "The engineer wants to know what has the cable damaged.",
    "将电缆变成施事。"
   ],
   [
    "The engineer wants to know if something has damaged the cable.",
    "丢失对具体施事的询问。"
   ],
   [
    "The engineer wants to know what had damaged the cable.",
    "当前问题不改过去完成时。"
   ],
   [
    "The engineer wants to know why the cable has damaged.",
    "改原因且缺被动结构。"
   ]
  ],
  "原句 what 作主语，转换后仍然是 what has damaged。"
 ],
 [
  "现在你直接问 Ella 是否知道提交时间，不是替 Ella 转述。时间是报告未来完成的时间。",
  "使用 Does Ella know / when / the report / will be ready 写一个直接问句。",
  "Does Ella know when the report will be ready?",
  [
   [
    "Ella wants to know when the report will be ready.",
    "愿望陈述不是直接询问。"
   ],
   [
    "Does Ella know when will the report be ready?",
    "从句不倒装。"
   ],
   [
    "Does Ella knows when the report will be ready?",
    "does 后用 know。"
   ],
   [
    "Does Ella know why the report will be ready?",
    "问的是时间不是原因。"
   ]
  ],
  "问号属于外层询问；内层将来时保持主语后 will。"
 ],
 [
  "调查记录区分两种未知：我们确定灯坏了，但不确定车门是否锁上。现仅转述后一个问题：Is the door locked?",
  "以 We want to know 开头，不谈灯或原因。",
  "We want to know if the door is locked.",
  [
   [
    "We want to know why the door is locked.",
    "门是否锁上仍未知，未问原因。"
   ],
   [
    "We want to know if is the door locked.",
    "从句倒装。"
   ],
   [
    "We know that the door is locked.",
    "无答案时不能断言知道。"
   ],
   [
    "We want to know if the door is not locked.",
    "原问没有否定，改变命题。"
   ]
  ],
  "是否可用 if/whether；不把未知改成已知。"
 ],
 [
  "库房记录：管理员知道箱子已经送达，现在问里面是什么，不问它在哪。选择记录未知内容的一句。",
  "只选一整句。",
  "The manager wants to know what is in the box.",
  [
   [
    "The manager wants to know where the box is.",
    "地点与箱内物品不同。"
   ],
   [
    "The manager wants to know if the box has arrived.",
    "送达已知。"
   ],
   [
    "The manager wants to know what in the box is.",
    "what 作主语时后接 is。"
   ],
   [
    "The manager knows what is in the box.",
    "尚未得到内容答案。"
   ]
  ],
  "what 作内层主语时 what is in the box 已是陈述顺序。"
 ],
 [
  "Rosa 已得到离开的确认，她知道客人已经离开，却不知道昨天离开的时间；她现在向你表达这点。",
  "以 I do not know 开头，使用 when / the guests / left yesterday。",
  "I do not know when the guests left yesterday.",
  [
   [
    "I do not know when did the guests leave yesterday.",
    "从句去掉 did 并恢复 left。"
   ],
   [
    "I do not know if the guests left yesterday.",
    "离开已知，未知时间。"
   ],
   [
    "I did not know when the guests had left yesterday.",
    "改变现在不知道这一主句。"
   ],
   [
    "I know when the guests did not leave yesterday.",
    "否定错误且不是离开时间。"
   ]
  ],
  "主句现在时与事实的过去时可共存，不是统一改成过去。"
 ],
 [
  "夜班护士并未收到化验是否完成的结果。她的问题是 Have the lab assistants completed the tests? 现在由第三人称记录。",
  "用 The nurse wants to know 转述，保留现在完成主动。",
  "The nurse wants to know if the lab assistants have completed the tests.",
  [
   [
    "The nurse wants to know if have the lab assistants completed the tests.",
    "内层不能倒装。"
   ],
   [
    "The nurse wants to know when the lab assistants have completed the tests.",
    "是否完成与完成时间不同。"
   ],
   [
    "The nurse knows the lab assistants have completed the tests.",
    "结果尚未知。"
   ],
   [
    "The nurse wants to know if the lab assistants had completed the tests.",
    "当前问题不强制过去完成时。"
   ]
  ],
  "当前完成问题保留 have completed 在明确施事 lab assistants 后，不预先要求后续被动形式。"
 ],
 [
  "同事听到噪声，已知道机器在响，现在问原因 Why is the machine making that noise?",
  "用 My colleague wants to know 转述，不改 machine 或时态。",
  "My colleague wants to know why the machine is making that noise.",
  [
   [
    "My colleague wants to know if the machine is making that noise.",
    "响声已知，未知原因。"
   ],
   [
    "My colleague wants to know why is the machine making that noise.",
    "从句倒装。"
   ],
   [
    "My colleague wants to know what the machine is making that noise.",
    "不能用 what 代替原因 why。"
   ],
   [
    "My colleague does not want to know why the machine is making that noise.",
    "否定愿望与原情境冲突。"
   ]
  ],
  "当前原因问题保留 why 与现在进行时。"
 ],
 [
  "延期通知里写着：Jules 知道会议今天不会开始，但还不知道改期后何时开始。现在问 Jules 知不知道新时间。",
  "使用 Does Jules know when the meeting will start 写一个直接问句，不添加 today。",
  "Does Jules know when the meeting will start?",
  [
   [
    "Jules wants to know when the meeting will start.",
    "记录愿望不是直接询问知不知道。"
   ],
   [
    "Does Jules know when will the meeting start?",
    "内层倒装。"
   ],
   [
    "Does Jules know when the meeting will not start?",
    "未知的是实际开始时间，不是不开始时间。"
   ],
   [
    "Does Jules know if the meeting will start today?",
    "今天不开已确定，问的是改期时间。"
   ]
  ],
  "外层直接问句与内层未知时间分开处理。"
 ]
];
const drafted=author(data,rows);
const scopeExtension="部分题为情境选择，按完整选项作答；构句与选择分别提供证据。if/whether、自然缩写列入有限答案；what 作主语是已有主语疑问结构与间接问句的组合扩展，不冒充139–140原文直授。";
const alternatives=[
 [
  "The customer wants to know if the line is working.",
  "The customer wants to know whether the line is working."
 ],
 [
  "The editor wants to know what the children are drawing."
 ],
 [
  "The dispatcher wants to know when the boat will leave.",
  "The dispatcher wants to know when the boat'll leave."
 ],
 [
  "The receptionist wants to know if the visitor needs a ticket.",
  "The receptionist wants to know whether the visitor needs a ticket."
 ],
 [
  "The manager wants to know why the workers are waiting."
 ],
 [
  "Does Leo know when the show will start?",
  "Does Leo know when the show'll start?"
 ],
 [
  "The customer wants to know whether this medicine is safe for children."
 ],
 [
  "I want to know what you are writing.",
  "I want to know what you're writing."
 ],
 [
  "The reporter does not know when the rescue team will arrive.",
  "The reporter doesn't know when the rescue team will arrive.",
  "The reporter does not know when the rescue team'll arrive.",
  "The reporter doesn't know when the rescue team'll arrive."
 ],
 [
  "The clerk wants to know if the seats are free.",
  "The clerk wants to know whether the seats are free."
 ],
 [
  "The engineer wants to know what has damaged the cable."
 ],
 [
  "Does Ella know when the report will be ready?",
  "Does Ella know when the report'll be ready?"
 ],
 [
  "We want to know if the door is locked.",
  "We want to know whether the door is locked."
 ],
 [
  "The manager wants to know what is in the box."
 ],
 [
  "I do not know when the guests left yesterday.",
  "I don't know when the guests left yesterday.",
  "I do not know when yesterday the guests left.",
  "I don't know when yesterday the guests left."
 ],
 [
  "The nurse wants to know if the lab assistants have completed the tests.",
  "The nurse wants to know whether the lab assistants have completed the tests."
 ],
 [
  "My colleague wants to know why the machine is making that noise."
 ],
 [
  "Does Jules know when the meeting will start?",
  "Does Jules know when the meeting'll start?"
 ]
];
const overrides={"6": {"kind": "choice", "form": "choice", "options": ["The customer wants to know whether this medicine is safe for children.", "The customer wants to know why this medicine is safe for children.", "The customer wants to know whether is this medicine safe for children.", "The customer knows this medicine is safe for children."], "prompt": "只选一整句。 不改写选项。", "criterion": "只选一整句。"}, "13": {"kind": "choice", "form": "choice", "options": ["The manager wants to know what is in the box.", "The manager wants to know where the box is.", "The manager wants to know if the box has arrived.", "The manager knows what is in the box."], "prompt": "只选一整句。 不改写选项。", "criterion": "只选一整句。"}};
const tasks=drafted.questions.map((q,i)=>({...q,accepted:[...new Set([...alternatives[i],...(overrides[i]?[]:q.accepted)])],...(overrides[i]||{})}));
const reviewedFiniteVariants={"repair-n139-indirect-content": ["The engineer wants to know what's damaged the cable."], "review-b-n139-indirect-content": ["My colleague wants to know why the machine's making that noise."]};
for(const q of tasks)q.accepted=[...new Set([...q.accepted,...(reviewedFiniteVariants[q.id]||[])])];
data.contentStatus='authored-blind-reviewed';
data.scope+=' '+scopeExtension;
export const {lesson,questions,byId,questionsFor,matches}=bindContent(data,tasks);
