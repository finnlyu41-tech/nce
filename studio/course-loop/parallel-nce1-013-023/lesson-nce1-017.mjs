import {bindContent} from './content-contract.mjs';
export const lesson = {
  "id": "nce1-17",
  "version": 1,
  "book": "NCE1",
  "lessons": [
    17,
    18
  ],
  "title": "第 17–18 课 · 问职业，说明多人的角色",
  "goal": "询问已指明两人的职业，用they are加复数职业回答，并按已确认事实描述一群人的当前状态。",
  "scope": "本课核对有限文字任务；未匹配仅表示未完成本题限定要求。自然自由表达由伙伴核对，不从文字记录推断听力、发音或长期掌握。",
  "prerequisites": [
    "已接触单数与复数、be及人称代词；所需词义和事实在题内给出。"
  ],
  "source": {
    "groupId": "NCE1-17",
    "route": "/#/nce/NCE1/17?tab=listen",
    "mapRoute": "/map/#/learn/nce1-17",
    "languagePath": "/language/NCE1/17.json",
    "languageSha256": "c8a555bfd99eb9a4b382b8a79d6d27d5cf8fce22164ae77bb95bff4a29c42a87",
    "comicKey": "NCE1-17",
    "clips": [
      {
        "target": "jobs-question",
        "label": "听their jobs询问多人的职业",
        "start": 43.18,
        "end": 46.6
      },
      {
        "target": "plural-occupation",
        "label": "听they are和复数职业",
        "start": 46.6,
        "end": 50.9
      },
      {
        "target": "group-description",
        "label": "听they否定当前状态",
        "start": 60.67,
        "end": 63.8
      }
    ],
    "grammarPages": [
      38,
      39,
      40
    ]
  },
  "teaching": [
    {
      "target": "jobs-question",
      "title": "两人的职业用their jobs",
      "explanation": "What are their jobs?问一群人的职业。their表示这群人的，jobs用复数；are在What后也可缩写。What are they?在职业情境也可成立，但本包要求保留jobs以明确询问内容。",
      "example": "What are their jobs?",
      "meaning": "他们的职业是什么？",
      "check": "What、are、their、jobs齐全；their不写成there或they're。",
      "source": "jobs-question"
    },
    {
      "target": "plural-occupation",
      "title": "多人职业不用a/an",
      "explanation": "They are + 复数职业，或They're + 复数职业。a/an只用于一个可数名词，不能放在复数职业前。两人的职业必须由题目事实确认。",
      "example": "They are engineers. / They're engineers.",
      "meaning": "他们是工程师。",
      "check": "they指明确两人；are与职业复数一致，不加a/an。",
      "source": "plural-occupation"
    },
    {
      "target": "group-description",
      "title": "复数状态与否定",
      "explanation": "描述两人或更多人用they/these/those + are + 状态。否定用are not或aren't；they are可缩为they're，those are不能缩成those're。this/that指单个对象。",
      "example": "Those women are busy. / They aren't tired.",
      "meaning": "那些女士很忙。/他们不累。",
      "check": "代词或指示词符合已给事实；are、状态和否定与题意一致。",
      "source": "group-description"
    }
  ],
  "own": {
    "id": "own-n17",
    "prompt": "设计一对明确虚构人物：先向伙伴问他们的职业，再根据伙伴明确给出的资料报告两人的职业和一种当前状态。若两人不同职业，可自然分别说明；自由表达由伙伴核对，不必照抄受限题结构。",
    "checks": [
      "What、are、their、jobs齐全；their不写成there或they're。",
      "they指明确两人；are与职业复数一致，不加a/an。",
      "代词或指示词符合已给事实；are、状态和否定与题意一致。"
    ],
    "status": "awaiting-human-review",
    "reviewerPrompt": "请伙伴或老师实际读或听表达，核对事实、指代和句式；接受自然等义表达。未确认的信息不要猜测。"
  },
  "intervals": {
    "first": 86400000,
    "repair": 86400000,
    "subsequent": 604800000
  },
  "rights": "original-authored",
  "contentStatus": "authored-independent-ai-blind-reviewed"
};
export const questions = [
  {
    "context": "介绍会中，远处的Ava和Mia两人是你与主持人唯一正在讨论的对象，你不知道她们的职业。",
    "prompt": "用their指这两人，问“她们的职业是什么？”，保留jobs（职业，复数）。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "accepted": [
      "What are their jobs?",
      "What're their jobs?"
    ],
    "counterexamples": [
      {
        "answer": "What is their jobs?",
        "reason": "复数jobs要are。"
      },
      {
        "answer": "What are your jobs?",
        "reason": "不是向这两人本人提问。"
      },
      {
        "answer": "What are there jobs?",
        "reason": "there不是物主their。"
      }
    ],
    "why": "their jobs指明确的两人职业；What are构成询问。",
    "form": "question",
    "id": "diagnostic-n17-jobs-question",
    "stage": "diagnostic",
    "target": "jobs-question",
    "kind": "input",
    "criterion": "用their指这两人，问“她们的职业是什么？”，保留jobs（职业，复数）。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "novelty": "介绍会中，远处的Ava和Mia两人是你与主持人唯一正在讨论的对象，你不知道她们的职业。"
  },
  {
    "context": "Owen与Eli两人的登记资料都确认他们当前是工程师。你向来访者说明两人的职业。",
    "prompt": "用they说“他们是工程师”，engineer=工程师，按两人写复数。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "They are engineers.",
      "They're engineers."
    ],
    "counterexamples": [
      {
        "answer": "They are an engineer.",
        "reason": "两人不能用单数职业。"
      },
      {
        "answer": "They is engineers.",
        "reason": "they用are。"
      },
      {
        "answer": "They are not engineers.",
        "reason": "否定与登记事实相反。"
      }
    ],
    "why": "engineers与两个人匹配，不用an。",
    "form": "statement",
    "id": "diagnostic-n17-plural-occupation",
    "stage": "diagnostic",
    "target": "plural-occupation",
    "kind": "input",
    "criterion": "用they说“他们是工程师”，engineer=工程师，按两人写复数。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "Owen与Eli两人的登记资料都确认他们当前是工程师。你向来访者说明两人的职业。"
  },
  {
    "context": "几米外有两位女士正在处理一批订单。事实确认她们现在很忙，你指向她们给同伴说明。",
    "prompt": "以Those women起句，说“那些女士很忙”，busy=忙的；不添加very。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "Those women are busy."
    ],
    "counterexamples": [
      {
        "answer": "This woman is busy.",
        "reason": "改为近处单个人。"
      },
      {
        "answer": "Those women is busy.",
        "reason": "women复数用are。"
      },
      {
        "answer": "Those women are not busy.",
        "reason": "否定改变了事实。"
      }
    ],
    "why": "those配远处复数women，busy描述已确认状态。",
    "form": "statement",
    "id": "diagnostic-n17-group-description",
    "stage": "diagnostic",
    "target": "group-description",
    "kind": "input",
    "criterion": "以Those women起句，说“那些女士很忙”，busy=忙的；不添加very。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "几米外有两位女士正在处理一批订单。事实确认她们现在很忙，你指向她们给同伴说明。"
  },
  {
    "context": "实习参观中，负责人与你正讨论两名新职员。你不知道他们的职业，要向负责人问清。",
    "prompt": "用their问“他们的职业是什么？”，保留jobs。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "accepted": [
      "What are their jobs?",
      "What're their jobs?"
    ],
    "counterexamples": [
      {
        "answer": "What are they jobs?",
        "reason": "they不是物主限定词。"
      },
      {
        "answer": "What were their jobs?",
        "reason": "问现在不是过去。"
      },
      {
        "answer": "What are their jobs.",
        "reason": "问句要求问号。"
      }
    ],
    "why": "问题依群体用their和复数jobs。",
    "form": "question",
    "id": "guided-n17-jobs-question",
    "stage": "guided",
    "target": "jobs-question",
    "kind": "input",
    "criterion": "用their问“他们的职业是什么？”，保留jobs。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "novelty": "实习参观中，负责人与你正讨论两名新职员。你不知道他们的职业，要向负责人问清。"
  },
  {
    "context": "摄影活动中，Bea与Mira都已确认自己是护士。你向主持人说明两人的当前职业。",
    "prompt": "用they说“她们是护士”，nurse=护士，按两人写复数。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "They are nurses.",
      "They're nurses."
    ],
    "counterexamples": [
      {
        "answer": "They are a nurse.",
        "reason": "两个人职业要复数。"
      },
      {
        "answer": "She is a nurse.",
        "reason": "只说明一人，遗漏另一人。"
      },
      {
        "answer": "They were nurses.",
        "reason": "当前职业不能换过去。"
      }
    ],
    "why": "职业事实来自两人确认，nurses保留两人数量。",
    "form": "statement",
    "id": "guided-n17-plural-occupation",
    "stage": "guided",
    "target": "plural-occupation",
    "kind": "input",
    "criterion": "用they说“她们是护士”，nurse=护士，按两人写复数。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "摄影活动中，Bea与Mira都已确认自己是护士。你向主持人说明两人的当前职业。"
  },
  {
    "context": "你和伙伴已确认另外两人休息充分，目前不累。伙伴仍担心，你说明这两人的状态。",
    "prompt": "用they说“他们不累”，tired=累的；保留否定。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "They are not tired.",
      "They aren't tired.",
      "They're not tired."
    ],
    "counterexamples": [
      {
        "answer": "They are tired.",
        "reason": "漏掉否定改变事实。"
      },
      {
        "answer": "We aren't tired.",
        "reason": "we把说话者包括进去。"
      },
      {
        "answer": "They wasn't tired.",
        "reason": "人称和时态都不符。"
      }
    ],
    "why": "are not、aren't及they're not都保留同一否定。",
    "form": "statement",
    "id": "guided-n17-group-description",
    "stage": "guided",
    "target": "group-description",
    "kind": "input",
    "criterion": "用they说“他们不累”，tired=累的；保留否定。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "你和伙伴已确认另外两人休息充分，目前不累。伙伴仍担心，你说明这两人的状态。"
  },
  {
    "context": "社区活动邀请了两位新邻居。你只知道姓名，不知道职业。你与活动伙伴已明确只讨论这两人。",
    "prompt": "用their问“他们的职业是什么？”，保留jobs。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "accepted": [
      "What are their jobs?",
      "What're their jobs?"
    ],
    "counterexamples": [
      {
        "answer": "What are their job?",
        "reason": "两人的职业本题用复数jobs。"
      },
      {
        "answer": "What are they're jobs?",
        "reason": "they're是they are，不是所属限定词。"
      },
      {
        "answer": "Their jobs are what.",
        "reason": "未完成本题的问句形式。"
      }
    ],
    "why": "姓名不等于职业证据，先问清their jobs。",
    "form": "question",
    "id": "independent-n17-jobs-question",
    "stage": "independent",
    "target": "jobs-question",
    "kind": "input",
    "criterion": "用their问“他们的职业是什么？”，保留jobs。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "novelty": "社区活动邀请了两位新邻居。你只知道姓名，不知道职业。你与活动伙伴已明确只讨论这两人。"
  },
  {
    "context": "机场接送安排中，Leo与Noah均登记为司机。你向同伴转述两人的职业。",
    "prompt": "用they说“他们是司机”，driver=司机，按两人写复数。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "They are drivers.",
      "They're drivers."
    ],
    "counterexamples": [
      {
        "answer": "They are a driver.",
        "reason": "多人职业不用单数a driver。"
      },
      {
        "answer": "They are nurses.",
        "reason": "职业事实不符。"
      },
      {
        "answer": "Are they drivers?",
        "reason": "本题要转述而不是询问。"
      }
    ],
    "why": "drivers保留两人的已确认职业事实。",
    "form": "statement",
    "id": "independent-n17-plural-occupation",
    "stage": "independent",
    "target": "plural-occupation",
    "kind": "input",
    "criterion": "用they说“他们是司机”，driver=司机，按两人写复数。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "机场接送安排中，Leo与Noah均登记为司机。你向同伴转述两人的职业。"
  },
  {
    "context": "你手边站着两位男士，两人都明确说现在很冷；你指向近处的两人说明。",
    "prompt": "以These men起句，说“这些男士很冷”，cold=冷的，不添加very。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "These men are cold."
    ],
    "counterexamples": [
      {
        "answer": "Those men are cold.",
        "reason": "题目指定近处。"
      },
      {
        "answer": "These man are cold.",
        "reason": "两人用不规则复数men。"
      },
      {
        "answer": "These men are hot.",
        "reason": "hot与cold事实不同。"
      }
    ],
    "why": "these指近处多人；man的复数是men。",
    "form": "statement",
    "id": "independent-n17-group-description",
    "stage": "independent",
    "target": "group-description",
    "kind": "input",
    "criterion": "以These men起句，说“这些男士很冷”，cold=冷的，不添加very。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "你手边站着两位男士，两人都明确说现在很冷；你指向近处的两人说明。"
  },
  {
    "context": "维修站中，你与管理员指向同一对新员工，只知道他们名字，不清楚工作岗位。",
    "prompt": "用their问“他们的职业是什么？”，保留jobs。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "accepted": [
      "What are their jobs?",
      "What're their jobs?"
    ],
    "counterexamples": [
      {
        "answer": "What is their job?",
        "reason": "本题指定两人和复数jobs。"
      },
      {
        "answer": "What are our jobs?",
        "reason": "our把群体改成自己一方。"
      },
      {
        "answer": "What are their jobs!",
        "reason": "本题发问要求问号。"
      }
    ],
    "why": "未知岗位不能从维修站地点猜机械师。",
    "form": "question",
    "id": "repair-n17-jobs-question",
    "stage": "repair",
    "target": "jobs-question",
    "kind": "input",
    "criterion": "用their问“他们的职业是什么？”，保留jobs。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "novelty": "维修站中，你与管理员指向同一对新员工，只知道他们名字，不清楚工作岗位。"
  },
  {
    "context": "参观工厂时，管理员确认远处两位工作人员都为机械师。你向队友说明。",
    "prompt": "用they说“他们是机械师”，mechanic=机械师，按两人写复数。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "They are mechanics.",
      "They're mechanics."
    ],
    "counterexamples": [
      {
        "answer": "They are an mechanics.",
        "reason": "an不能用在复数职业前。"
      },
      {
        "answer": "They are mechanic.",
        "reason": "职业名词缺少复数。"
      },
      {
        "answer": "They will be mechanics.",
        "reason": "未来计划不同于当前岗位。"
      }
    ],
    "why": "确认当前两人职业用are和mechanics。",
    "form": "statement",
    "id": "repair-n17-plural-occupation",
    "stage": "repair",
    "target": "plural-occupation",
    "kind": "input",
    "criterion": "用they说“他们是机械师”，mechanic=机械师，按两人写复数。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "参观工厂时，管理员确认远处两位工作人员都为机械师。你向队友说明。"
  },
  {
    "context": "两位远处的女士都已确认现在很暖和；你指向她们告诉同伴。",
    "prompt": "以Those women起句，说“那些女士很暖和”，warm=暖和的，不添加very。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "Those women are warm."
    ],
    "counterexamples": [
      {
        "answer": "Those woman are warm.",
        "reason": "women是复数。"
      },
      {
        "answer": "Those women are not warm.",
        "reason": "漏保肯定事实。"
      },
      {
        "answer": "These women are warm.",
        "reason": "these不符合指定远处。"
      }
    ],
    "why": "指示距离与复数事实都要保留。",
    "form": "statement",
    "id": "repair-n17-group-description",
    "stage": "repair",
    "target": "group-description",
    "kind": "input",
    "criterion": "以Those women起句，说“那些女士很暖和”，warm=暖和的，不添加very。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "两位远处的女士都已确认现在很暖和；你指向她们告诉同伴。"
  },
  {
    "context": "博物馆接待时，两名客人刚介绍完姓名。你与导览员唯一讨论的是这两人，你要问他们的职业。",
    "prompt": "用their问“他们的职业是什么？”，保留jobs。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "accepted": [
      "What are their jobs?",
      "What're their jobs?"
    ],
    "counterexamples": [
      {
        "answer": "What are your jobs?",
        "reason": "不直接问客人本人。"
      },
      {
        "answer": "What were their jobs?",
        "reason": "时态改为过去。"
      },
      {
        "answer": "What are their jobs??",
        "reason": "只允许一个问号。"
      }
    ],
    "why": "问题仍针对第三人两位客人，不能改为you。",
    "form": "question",
    "id": "review-a-n17-jobs-question",
    "stage": "review-a",
    "target": "jobs-question",
    "kind": "input",
    "criterion": "用their问“他们的职业是什么？”，保留jobs。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "novelty": "博物馆接待时，两名客人刚介绍完姓名。你与导览员唯一讨论的是这两人，你要问他们的职业。"
  },
  {
    "context": "阅读项目中，Ava与Eli本人都确认现在是教师。你向负责分组的人说明两人职业。",
    "prompt": "用they说“他们是教师”，teacher=教师，按两人写复数。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "They are teachers.",
      "They're teachers."
    ],
    "counterexamples": [
      {
        "answer": "They are a teachers.",
        "reason": "a不用于复数。"
      },
      {
        "answer": "They is teachers.",
        "reason": "they用are。"
      },
      {
        "answer": "They are teachers?",
        "reason": "报告事实要求陈述。"
      }
    ],
    "why": "共同职业教师用teachers，而不是a teachers。",
    "form": "statement",
    "id": "review-a-n17-plural-occupation",
    "stage": "review-a",
    "target": "plural-occupation",
    "kind": "input",
    "criterion": "用they说“他们是教师”，teacher=教师，按两人写复数。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "阅读项目中，Ava与Eli本人都确认现在是教师。你向负责分组的人说明两人职业。"
  },
  {
    "context": "两位同伴说明自己现在不饿。你不是他们之一，向接待员转述他们的状态。",
    "prompt": "用they说“他们不饿”，hungry=饿的。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "They are not hungry.",
      "They aren't hungry.",
      "They're not hungry."
    ],
    "counterexamples": [
      {
        "answer": "They are hungry.",
        "reason": "否定不能消失。"
      },
      {
        "answer": "I am not hungry.",
        "reason": "改变了被描述的人。"
      },
      {
        "answer": "They were not hungry.",
        "reason": "当前状态不能改过去。"
      }
    ],
    "why": "they指另外两人，not决定是否需要安排食物。",
    "form": "statement",
    "id": "review-a-n17-group-description",
    "stage": "review-a",
    "target": "group-description",
    "kind": "input",
    "criterion": "用they说“他们不饿”，hungry=饿的。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "两位同伴说明自己现在不饿。你不是他们之一，向接待员转述他们的状态。"
  },
  {
    "context": "演出结束，主持人与您正谈论两位新成员；他们的职业没有介绍。你想向主持人核对。",
    "prompt": "用their问“他们的职业是什么？”，保留jobs。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "accepted": [
      "What are their jobs?",
      "What're their jobs?"
    ],
    "counterexamples": [
      {
        "answer": "What are his jobs?",
        "reason": "his没有保留两人的指代。"
      },
      {
        "answer": "What are their jobs",
        "reason": "本题问句须有问号。"
      },
      {
        "answer": "What are their jobs?!",
        "reason": "限定一个问号，不加感叹号。"
      }
    ],
    "why": "不能从参加演出推断两人的职业。",
    "form": "question",
    "id": "review-b-n17-jobs-question",
    "stage": "review-b",
    "target": "jobs-question",
    "kind": "input",
    "criterion": "用their问“他们的职业是什么？”，保留jobs。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一个一般现在时问句，不添加称呼或please，以一个问号（?或？）结束。",
    "novelty": "演出结束，主持人与您正谈论两位新成员；他们的职业没有介绍。你想向主持人核对。"
  },
  {
    "context": "展会名单中，Mia与Owen两人都确认当前是办公室助理。你向现场负责人报告。",
    "prompt": "用they说“他们是办公室助理”，office assistant=办公室助理，按两人写复数。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "They are office assistants.",
      "They're office assistants."
    ],
    "counterexamples": [
      {
        "answer": "They are an office assistant.",
        "reason": "单数职业不能描述两个人。"
      },
      {
        "answer": "They are offices assistants.",
        "reason": "这里office作名词修饰语，复数加在assistant。"
      },
      {
        "answer": "They are office assistants?",
        "reason": "事实报告不变询问。"
      }
    ],
    "why": "office保持修饰形式；assistants保留多人角色。",
    "form": "statement",
    "id": "review-b-n17-plural-occupation",
    "stage": "review-b",
    "target": "plural-occupation",
    "kind": "input",
    "criterion": "用they说“他们是办公室助理”，office assistant=办公室助理，按两人写复数。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "展会名单中，Mia与Owen两人都确认当前是办公室助理。你向现场负责人报告。"
  },
  {
    "context": "读书会入场处，你指向身边两位男士。他们均确认现在很热，你向空调管理员说明。",
    "prompt": "以These men起句，说“这些男士很热”，hot=热的，不添加very。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "accepted": [
      "These men are hot."
    ],
    "counterexamples": [
      {
        "answer": "This man is hot.",
        "reason": "题目要求两位男士。"
      },
      {
        "answer": "These men is hot.",
        "reason": "men复数用are。"
      },
      {
        "answer": "These men are cold.",
        "reason": "cold改变了当前状态。"
      }
    ],
    "why": "these对应身边的两人；are与men一致。",
    "form": "statement",
    "id": "review-b-n17-group-description",
    "stage": "review-b",
    "target": "group-description",
    "kind": "input",
    "criterion": "以These men起句，说“这些男士很热”，hot=热的，不添加very。使用本题指定的英文词，不另换同义词；使用be的一般现在时或其缩写。只写所要求的一句当前事实，不添加其他信息。可省略末尾标点或使用一个句号、感叹号（中英文均可）；不用问号。",
    "novelty": "读书会入场处，你指向身边两位男士。他们均确认现在很热，你向空调管理员说明。"
  }
];
export const {byId,questionsFor,matches}=bindContent(lesson,questions);
