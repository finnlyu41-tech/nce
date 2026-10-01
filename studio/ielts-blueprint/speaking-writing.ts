import { academic, both, general, makeRequirement, sourceRef } from './builders';
import type { LearningStage, Requirement, Variant } from './types';

type ProductiveSeed = {
  id: string; title: string; rule: string; teach: string; demo: string; guided: string; output: string; repair: string; transfer: string;
  tags?: string[]; band?: Requirement['bandOrientation']; priority?: Requirement['priority'];
};
const speakingParts: ProductiveSeed[] = [
  {id:'S-P1',title:'Part 1 熟悉话题交流',rule:'熟悉经历/话题交流约4–5分钟，直接回应并自然展开；每题没有官方固定词数/秒数。',teach:'识别问题焦点、时态与实际所求；回答后补理由或真实细节。',demo:'原创有音频的自然展开回答，对照一个无关背稿，标出直接回应和细节。',guided:'回答/原因/例子提示卡逐步撤去，再改变题目时间指向。',output:'陌生熟悉话题采访，保留问题、追问与原始录音；完整Part1用4–5分钟条件。',repair:'定位跑题或表达断裂的一句，重答局部并保留前后音频。',transfer:'换熟悉话题和时态，不能照搬同一稿。',tags:['question_focus','relevance','time_reference']},
  {id:'S-P2',title:'Part 2 准备与个人长答',rule:'1分钟准备、最多2分钟长答及可能追问；整个part约3–4分钟。题卡要点是规划辅助，不另设Task Achievement分。',teach:'提取题卡焦点、只记关键词，组织背景/事件/细节/意义。',demo:'展示一分钟关键词笔记和原创建模录音，解释长答的发展连接。',guided:'排序卡/半张关键词图，逐步撤去完整句架。',output:'新题卡、单独记录60秒准备和最长120秒长答，接简短追问。',repair:'标出缺少发展或中断处，重建关键词并再录，不能只追求讲满2分钟。',transfer:'换陌生题卡、不同描述对象与经历，不复制模型。',tags:['development','keyword_planning','disruptive_pause']},
  {id:'S-P3',title:'Part 3 一般与抽象讨论',rule:'约4–5分钟的相关一般/抽象讨论，需分析、比较、解释与推测，回应实际追问。',teach:'从个人走向一般，讲清因果，适当限定并评价另一种情况。',demo:'原创音频对话中展示观点→原因→例子→限制，标出每次追问如何改变回答。',guided:'分支追问和推理图，撤提示后回答不可预先背好的追问。',output:'新领域的相关抽象讨论与意外追问，保留对话者问题/完整音频。',repair:'指出无支持的主张，补因果机制并回答新的追问。',transfer:'换领域和追问方向，测能否保持真实互动。',tags:['follow_up','cause_effect','qualification']},
];
const speakingCriteria: ProductiveSeed[] = [
  {id:'S-FC',title:'Fluency and Coherence · 流利与连贯',rule:'考察语流、努力程度、内容衔接和发展；文本只能支持部分组织反馈，不能评语速、停顿或自然语流。',teach:'意思块、顺序与连贯，区分有用修正和破坏理解的停顿。',demo:'两个表达相同内容的原创录音，标为什么某次停顿有助或阻碍理解。',guided:'重排意思卡，随后只看关键词说，逐步撤提示。',output:'新题的说明，再嵌入Part2/3；用音频观察断裂位置及实际理解影响。',repair:'回放一处时间戳，分块重练并新录，不把停顿数量直接换Band。',transfer:'新话题使用同一篇章功能，检验撤提示后的发展。',tags:['idea_sequence','disruptive_pause','coherence'],band:{'4':'停顿常打断；衔接短而重复。','5':'可持续但反复修补；复杂内容易中断。','6':'能长答；偶有连贯丢失。','7':'持续连贯展开；犹豫较少影响。','8':'流利相关；停顿多为想内容。'}},
  {id:'S-LR',title:'Lexical Resource · 词汇',rule:'考察词义、恰当搭配、灵活用词与解释改写，识词或堆罕见词不能证明自发使用。',teach:'先保意思，再换表达；用解释绕过暂时不知道的词。',demo:'原创口头解释一个未知词，展示意思保留与错误同义替换的区别。',guided:'禁用目标词描述、搭配选择，然后在新情境口头产出。',output:'新描述/观点，不提供词库；之后嵌入完整parts。',repair:'定位不准短语，解释替代的含义并重新使用。',transfer:'新对象/语境中改写，不能背同一例句。',tags:['word_choice','collocation','paraphrase'],band:{'4':'熟悉词汇为主；改写受限。','5':'灵活度有限；改写效果不稳。','6':'词汇够用；改写通常成立。','7':'词汇较灵活；改写有效。','8':'广泛、准确且灵活。'}},
  {id:'S-GRA',title:'Grammatical Range and Accuracy · 语法',rule:'考察合适结构、准确性和对交流的影响；自然口语意思块不能机械套书面完整句规则。',teach:'可靠句子主干、时间关系、比较、原因、条件和从句按需要使用。',demo:'原创语音对比有意义的组合与强凑复杂句，标出影响理解的错误。',guided:'先合句再撤句架，变时间/假设后自发解释。',output:'新过去经历及假设讨论，保存真实音频与经确认的逐字稿。',repair:'针对反复且影响意思的错误，先改说，再新一轮回答。',transfer:'变话题和时间框架，不奖励复杂句数量。',tags:['agreement','time_reference','meaning_impact'],band:{'4':'基本形式有限；错误频繁。','5':'简单形式较稳；复杂结构不可靠。','6':'结构混合；复杂错误少阻断意思。','7':'准确句较多；结构较灵活。','8':'大多准确；偶有非系统错误。'}},
  {id:'S-P',title:'Pronunciation · 发音',rule:'考察音、重音、节奏、语调、连读、分块及可理解性；纯文本/ASR标点不能评价发音，不要求模仿母语口音。',teach:'听辨/产生意义对立、词重音、句子重点、分块与语调。',demo:'真实可播放的原创录音对照重点/分块，展示意思如何变化；文字加粗不是音频模型。',guided:'听辨→标重音→模仿→换内容；语流评价仍需音频。',output:'新的自发回答而非只朗读背稿，嵌入Part1–3并核验音频可用。',repair:'真人回听时间片段、示范局部发音/韵律修正、重录；ASR不确定转人工。',transfer:'新语句使用同一语音特征，检查听者实际理解和努力。',tags:['word_stress','chunking','intonation','intelligibility'],band:{'4':'音与韵律控制受限；听者费力。','5':'介于4与6的特征。','6':'总体听懂；节奏/重音控制不稳。','7':'符合6，部分达到8。','8':'容易听懂；韵律持续有效。'}},
];

function productivePlan(seed: ProductiveSeed, skill: 'speaking'|'writing', timedContext: string): Record<LearningStage,string> {
  return { explain:`${seed.teach} 用理解检查和小产出检查诊断。`, model:seed.demo, guided:seed.guided,
    independent:`${seed.output} 隐藏旧模型/词句提示；保留第一遍，AI改稿标辅助。`, timed:`${timedContext} ${seed.output} 短训练预算属于教学安排。`,
    feedback:`${seed.repair} ${skill==='speaking'?'每个主张关联真实音频时间范围或确认文本；未能评价的维度标不可评。':'每个主张关联原稿文字及原题/图示；缺图不评价数据准确性。'}`,
    review:`课程安排延迟后${seed.transfer} 保存新题、支持情况及与原问题关联；未测过保持未验证。` };
}

function speaking(seed: ProductiveSeed, criterion = false): Requirement {
  return makeRequirement({ id:seed.id, skill:'speaking', kind:criterion?'assessment-criterion':'task-format', taxonomy:criterion?'official-criterion':'official-format',
    title:seed.title, variants:both, family:criterion?'speaking-criteria':'speaking-parts', subforms:[], explanation:seed.rule, diagnostic:`诊断：${seed.tags?.join(' / ')}，只能依据真实表现，不从目录勾选推断。`,
    sources:criterion?[sourceRef('speaking-criteria',seed.title,both,'criterion'),sourceRef('speaking-descriptors','完整等级描述；4–8短释只是导读',both,'criterion'),sourceRef('criterion-weights','四维等权25%',both,'rule')]
      :[sourceRef('speaking-format',seed.title,both),sourceRef('samples-academic','Speaking shared across Academic/GT',both)],
    currentMapNodeIds:criterion?['speaking-part-one','speaking-part-two','speaking-part-three']:[seed.id==='S-P1'?'speaking-part-one':seed.id==='S-P2'?'speaking-part-two':'speaking-part-three'],
    feedbackMode:'human-audio', bandOrientation:seed.band, errorTags:seed.tags||[], prerequisiteConcepts:['P3','P4','P5'],
    plan:productivePlan(seed,'speaking','以完整part/全场条件整合，保留原始录音、实际问题/追问和用时；Part1/3不按单题固定秒数锁定。') });
}

const writingCriteria: Array<ProductiveSeed & { criterion:'TA-A'|'TA-GT'|'TR'|'CC'|'LR'|'GRA' }> = [
  {id:'W-TA-A',criterion:'TA-A',title:'Academic Task Achievement · 任务完成',rule:'准确选择、概括、比较并报告所给视觉信息；不能添加图中没有的原因。必须见到原图才能评相关准确性。',teach:'读标题/轴/单位/时间，区别主要特征与细节，分组并写概括。',demo:'原创图示附特征选择注解，排除臆测原因；对照一个逐格报数的弱版本。',guided:'选择证据、排除错误计算、组成自己的概括。',output:'新视觉输入的完整Task1，不提供答案句。',repair:'错误断言对应到数据，修概括和关键支持信息。',transfer:'新数据与不同视觉形态但同一分析需求。',tags:['overview','data_accuracy','unsupported_cause'],band:{'4':'关键特征少。','5':'机械细节；覆盖偏弱。','6':'尝试相关概括。','7':'概括清楚；重点分组合理。','8':'选择与说明熟练。'}},
  {id:'W-TA-GT',criterion:'TA-GT',title:'GT Task Achievement · 书信任务完成',rule:'说明目的、覆盖题目三项功能要求并适当展开；语气符合对象/关系，不能只以关键词匹配判断覆盖。',teach:'对象/关系、目的、三项义务、相关细节与一致语气。',demo:'原创书信的目的/要点映射及语气对照。',guided:'半张书信计划逐步撤提示，改对象后重选措辞。',output:'新情境完整信件，无句架。',repair:'定位未覆盖要求或语气漂移，修对应段。',transfer:'同功能改收信人/关系。',tags:['purpose','obligation_coverage','register'],band:{'4':'要点遗漏；目的不清。','5':'要点/目的展开不均。','6':'要点覆盖；偶有语气不一。','7':'目的清楚；语气稳定。','8':'要求展开充分且恰当。'}},
  {id:'W-TR',criterion:'TR',title:'Task Response · Task 2 回应',rule:'回应实际问题的范围与全部命令，立场相关且展开有依据；混合题保留多标签，不靠模板替代审题。',teach:'主题/范围/对象/每个问题，观点→原因→说明或例子。',demo:'原创审题计划与段落注解，显示每段回应哪条义务，不编研究数字。',guided:'义务图和半条推理链，逐步让学习者自己发展。',output:'陌生题目的完整essay，回应全部所求。',repair:'段落映射回题目，修不相关或无支持的主张。',transfer:'混合问法、陌生主题或不同影响对象。',tags:['scope','position','development','omitted_question'],band:{'4':'离题或极少回应。','5':'不完整；展开不足。','6':'相关但支持不均。','7':'立场清楚；有展开。','8':'回应充分；立场支持良好。'}},
  {id:'W-CC',criterion:'CC',title:'Coherence and Cohesion · 组织与衔接',rule:'看逻辑推进、段落作用和准确衔接；连接词数量不等于连贯质量。',teach:'段落目的、顺序、指代、转折与因果的真实关系。',demo:'原创连贯段与连接词堆砌段对照，标读者如何追踪意思。',guided:'排句、修指代，再自己写段落。',output:'新任务自行组织的整篇回答。',repair:'标一处逻辑或指代断裂，修关系而非装饰过渡词。',transfer:'新题/体裁里保持可追踪组织。',tags:['progression','reference','paragraph_role'],band:{'4':'推进不清楚。','5':'推进弱。','6':'总体可跟；衔接偏机械。','7':'逻辑推进清楚。','8':'组织自然，易跟随。'}},
  {id:'W-LR',criterion:'LR',title:'Lexical Resource · 词汇',rule:'看精准恰当的词义、搭配、语体、拼写和构词；罕见词比例不换Band。',teach:'语义先行、自然搭配和不失真的改写。',demo:'原创段落对照准确词与误导同义词，解释含义差别。',guided:'先选择并解释用词，再在新句子实际使用。',output:'新任务不看词库的独立写作。',repair:'定位一个词汇模式，解释影响后局部修订。',transfer:'新情境表达同功能，不背同一句。',tags:['word_choice','collocation','word_formation','spelling'],band:{'4':'词汇不足且重复。','5':'刚够用。','6':'够用但不精确。','7':'较灵活和准确。','8':'广泛、精准。'}},
  {id:'W-GRA',criterion:'GRA',title:'Grammatical Range and Accuracy · 语法',rule:'看有意义的结构变化、准确性与标点；不能以每百词错误数或复杂句数换Band。',teach:'句界、一致、冠词、时态和按逻辑需要的从句。',demo:'同一关系的两种清楚写法，对照强凑复杂句。',guided:'针对性合句/改错，再写自己的新段落。',output:'新任务以意思驱动选结构，保留原稿。',repair:'优先修反复且影响意思的错误，再独立新写。',transfer:'新主题与改变的时间/关系需求。',tags:['sentence_boundary','agreement','time_reference','punctuation'],band:{'4':'结构极有限；错误影响理解。','5':'重复；复杂结构不稳。','6':'结构混合；意思通常仍清楚。','7':'准确句较多。','8':'多数准确且灵活。'}},
];

function writingCriterion(seed: typeof writingCriteria[number], variant: Variant): Requirement {
  const a=variant==='academic', applicable=a?academic:general;
  const id=seed.criterion==='TA-A'?'W-TA-A':seed.criterion==='TA-GT'?'W-TA-GT':`${seed.id}-${a?'A':'GT'}`;
  return makeRequirement({id,skill:'writing',kind:'assessment-criterion',taxonomy:'official-criterion',title:seed.title,variants:applicable,family:'writing-criteria',subforms:seed.criterion.startsWith('TA')?['Task1']:seed.criterion==='TR'?['Task2']:['Task1','Task2'],
    explanation:seed.rule,diagnostic:`依据原题/图示和首稿检查${seed.tags?.join(' / ')}；自查不能作为考官分。`,sources:[sourceRef('writing-criteria',seed.title,applicable,'criterion'),sourceRef('writing-descriptors','完整描述；4–8短释仅导读',applicable,'criterion'),sourceRef('criterion-weights','各task内四维等权；Task2两倍',applicable,'rule')],
    currentMapNodeIds:a?(seed.criterion==='TA-A'?['writing-task-one']:seed.criterion==='TR'?['writing-task-two']:['writing-task-one','writing-task-two','writing-feedback']):[],feedbackMode:'human-text',bandOrientation:seed.band,prerequisiteConcepts:['P3','P4','P5'],errorTags:seed.tags||[],
    plan:productivePlan(seed,'writing',`在${a?'Academic图示+essay':'GT书信+essay'}的60分钟完整两任务中应用；20/40分钟只作分配建议，不是独立强制锁定。`) });
}

const visuals: ProductiveSeed[] = [
  {id:'WA-LINE',title:'线图',rule:'教时间趋势/区间/极值/交叉；这是视觉教学标签，仍使用同一Task1四维评分。',teach:'总体与区间、水平与变化量、时间对应时态。',demo:'原创多条线，追踪变化并解释为何选这些比较。',guided:'先选3–4条有用观察再组文。',output:'新单位/尺度且有波动的线图。',repair:'核对最终值与变化量，不编趋势。',transfer:'时间序列改成别的图型。'},
  {id:'WA-BAR',title:'柱图',rule:'分类排名/分组，区分静态类别与多年份；不能把静态高低说成上升下降。',teach:'共同分母、排名、类别分组与时间维度。',demo:'原创静态柱图与按年份柱图对照。',guided:'按意义分组，再完成比较段。',output:'新分组或重复年份图。',repair:'核对排名和比较对象。',transfer:'静态与动态互换。'},
  {id:'WA-PIE',title:'饼图',rule:'分清比例与绝对量，份额更大不一定人数更多。',teach:'整体、分母、比例与百分点。',demo:'原创两个总量不同的饼图说明不能从份额直接比人数。',guided:'排比例、写概括，再核对分母。',output:'新年份/群体/总量图。',repair:'指出不合法的比例推论。',transfer:'换总量与新分布。'},
  {id:'WA-TABLE',title:'表格',rule:'选择模式与关键比较，而不是逐格抄数；混合单位和缺失值不能臆补。',teach:'行/列/单位、极值、分组与选择性概括。',demo:'原创表格高亮少量证据并解释选取。',guided:'分组行列、形成概括和一个比较。',output:'新表格，含不同单位或缺失标注。',repair:'每个数值/比较回到对应单元格。',transfer:'更宽的表格或改变单位。'},
  {id:'WA-MIXED',title:'组合视觉',rule:'多个图都需涉及；保留单位，不把相关关系当因果。',teach:'跨视觉证据和合法比较。',demo:'原创组合图建立关系图，指出无法比较的单位。',guided:'配对观察后组成综合概括。',output:'新视觉对，关系不明显。',repair:'查遗漏输入与无依据因果。',transfer:'改组合和关系。'},
  {id:'WA-PROCESS',title:'自然/制造流程',rule:'按所给阶段、转换与循环报告，不能加外部知识步骤。',teach:'输入/输出/阶段/循环；有需要时用被动，非固定语法配额。',demo:'原创过程沿箭头追踪并标关键转化。',guided:'排阶段后用自己的句子连接。',output:'新线性或循环过程。',repair:'校验顺序与缺失阶段。',transfer:'自然↔制造、线性↔循环。'},
  {id:'WA-MAP',title:'地图/平面图变化',rule:'区分移除/新增/保留、空间关系与过去/现在/规划；不能把计划说成已发生。',teach:'方向、相对位置、功能/布局变化。',demo:'原创前后图按空间分组描述变化。',guided:'追踪转换并写自己的变化句。',output:'新户外图或室内计划图。',repair:'对照位置和完成状态。',transfer:'已完成改建变未来规划。'},
  {id:'WA-OBJECT',title:'物体/装置示意',priority:'P1',rule:'按图中部件、功能和关系描述；这是扩展教学标签，不是独立官方评分维度。',teach:'部件/位置/功能关联，限制外部推测。',demo:'原创装置从标注到功能示范。',guided:'先搭关系骨架再描述。',output:'新装置/事件示意。',repair:'每项描述对应输入。',transfer:'换陌生物体。'},
];
const registers: ProductiveSeed[] = [
  {id:'WG-PERSONAL',title:'个人书信语体',rule:'熟悉关系可用较自然个人语体，但仍完整回应题目要求。',teach:'收信人/关系/目的共同决定语体。',demo:'原创给朋友的信与生硬机构信对照。',guided:'同一请求改对象，解释语气选择。',output:'新朋友情境书信。',repair:'定位语气漂移或遗漏义务。',transfer:'变关系和目的。'},
  {id:'WG-SEMI',title:'半正式书信语体',rule:'根据关系和情境选择礼貌而自然的语气，不能只按“投诉/请求”标签定语体。',teach:'已认识但具有角色关系的对象与分寸。',demo:'原创给熟悉管理者的信，注解礼貌和关系。',guided:'为措辞选择解释接收效果。',output:'新半正式收信人情境。',repair:'修过于疏远/随意的一段。',transfer:'变角色与关系。'},
  {id:'WG-FORMAL',title:'正式书信语体',rule:'给不熟悉个人/机构的信需目的清楚、礼貌可操作；无需地址。',teach:'目的、正式语气和三项义务。',demo:'原创正式请求信，标每项请求与相关细节。',guided:'把含糊要求改成清楚礼貌请求。',output:'新机构或服务情境。',repair:'修要求不清或过度命令。',transfer:'改为朋友收信，并重新选语气。'},
];
const letterPurposes: Array<[string,string,string,string]> = [
  ['REQUEST','请求','说明需求、相关背景和具体行动。','给朋友/机构的同功能请求'],
  ['INFORM','告知/解释','选择相关事实、顺序和实际影响。','改变接收者及信息需求'],
  ['COMPLAIN','投诉','事实、影响与所求补救；不凭空夸大指责。','改变服务与关系'],
  ['APOLOGISE','道歉','承认问题、简短说明并提出补救。','改变对象与后果'],
  ['INVITE','邀请/回应邀请','说明活动和必要细节，按要求邀请/接受/婉拒。','改变正式程度及活动'],
  ['ADVISE','建议','建议符合对象需求，并给理由和实际细节。','对象需要发生变化'],
  ['THANK','感谢','具体感谢及影响，避免程式化夸张。','改变关系与感谢原因'],
  ['APPLY','申请/询问','说明相关兴趣/经验及题目要求的安排，不编必须信息。','新岗位或询问情境'],
];
const essayDemands: Array<[string,string,string,string]> = [
  ['OPINION','观点/程度','就准确命题形成并论证立场，可按理由限定程度。','同主题改变命题'],
  ['DISCUSS','双边讨论','解释双方为何有道理；要求时还要给自己的评价。','两边依据不对称的新题'],
  ['ADVDIS','利弊','展开题目要求的两侧，并识别是否另需判断。','改变利益主体'],
  ['OUTWEIGH','权衡利弊','比较影响的范围/持久性/严重程度而不是数论点。','少而重的弊端情境'],
  ['POSNEG','评价正负发展','从影响和受影响群体形成有理由的整体评价。','各群体效果不同'],
  ['CAUSE','原因','解释机制并区分原因和后果；只问原因时不要只写办法。','原因题改变为原因加影响'],
  ['PROBLEM-SOLUTION','问题/原因与解决','按实际问题配行动者、措施与作用机制；题目要原因才写原因。','causes+solutions与problems+solutions互换'],
  ['MULTIPART','多问题/混合命令','逐项回应全部问题和对象，组织成连贯整体。','why+个人/社会影响的混合问法'],
  ['EVALUATE','替代/责任/选择评价','建立判断依据并说明替代/责任分配，避免强迫二元立场。','共享责任与限定选项'],
];

function writingTag(seed: ProductiveSeed, group:'visual'|'register'|'letter-purpose'|'essay-demand'): Requirement {
  const v=group==='visual'?academic:group==='essay-demand'?both:general;
  const source=group==='visual'?'writing-visuals-idp':group==='essay-demand'?'writing-demands':'writing-general';
  return makeRequirement({id:seed.id,skill:'writing',kind:group==='register'?'task-format':'teaching-tag',taxonomy:group==='register'?'official-format':'product-teaching-tag',title:seed.title,variants:v,family:group,subforms:[],priority:seed.priority,
    explanation:seed.rule,diagnostic:`检查实际任务义务与${seed.teach}；同标签能共存，标签数量不证明掌握。`,sources:[sourceRef(source,seed.title,v,group==='register'?'format':'teaching-context'),sourceRef(group==='visual'?'writing-academic':group==='essay-demand'?'writing-demands':'writing-general','实际任务与评分边界',v,'rule')],
    currentMapNodeIds:group==='visual'?['writing-task-one']:group==='essay-demand'?['writing-task-two']:[],feedbackMode:'human-text',errorTags:['task_coverage','relevance','register_or_data'],prerequisiteConcepts:['P3','P4','P5'],
    plan:productivePlan(seed,'writing',`${group==='essay-demand'?'至少250词，约40分钟essay训练':'至少150词，约20分钟Task1训练'}，然后合并两任务60分钟；分配时间只是建议。`) });
}

function fullFormat(skill:'speaking'|'writing',variant?:Variant): Requirement {
  const speaking=skill==='speaking', v=speaking?both:variant==='academic'?academic:general;
  const id=speaking?'S-FULL':`W-FORMAT-${variant==='academic'?'A':'GT'}`;
  const text=speaking?'三部分合计11–14分钟，整场按四维评价，每维25%；没有三part分数等权公式。':'60分钟两任务都要完成；Task1至少150词，Task2至少250词且两倍权重。20/40分配是建议，不独立强制锁时；字数不足不编固定扣Band。';
  return makeRequirement({id,skill,kind:'test-rule',taxonomy:'official-format',title:speaking?'完整口语条件与评价边界':`${variant==='academic'?'Academic':'GT'} 完整写作条件与权重`,variants:v,family:'integrated-performance',subforms:[],explanation:text,diagnostic:'能否保留完整输入与原表现，并指出哪些评分维度尚无可评证据。',
    sources:[sourceRef(speaking?'speaking-format':variant==='academic'?'writing-academic':'writing-general','完整条件',v,'rule'),sourceRef('criterion-weights','维度与任务权重',v,'rule')],currentMapNodeIds:speaking?['speaking-part-three']:variant==='academic'?['writing-feedback']:[],feedbackMode:speaking?'human-audio':'human-text',prerequisiteConcepts:['P10'],errorTags:['assistance','missing_context','missing_criterion'],
    plan:{explain:text,model:'用合法或原创完整表现示范各维度的证据位置；官方样例只链接，不复制题库或宣称自造考官分。',guided:'先做一次有支持的整合练习，明确哪些支持使用过、哪些条件需要补。',independent:'新的完整题目/两任务或三部分；保留首稿/原音频及相应输入。',timed:speaking?'新完整三部分11–14分钟模拟，录下所有问题/追问；不显示旧模型。':'新两任务60分钟，保留本类别Task1、essay、原视觉/情境和实际用时。',feedback:'熟悉标准的人工评阅，逐维定位证据与局部修复；不可评项保留不可评，不补造合成分。',review:'针对修复之后，另一次新完整表现及延迟迁移；不是同卷重做，也不保证正式Band。'} });
}

export const speakingWritingRequirements: readonly Requirement[] = [
  ...speakingParts.map(s=>speaking(s)),...speakingCriteria.map(s=>speaking(s,true)),fullFormat('speaking'),
  ...writingCriteria.flatMap(s=>s.criterion==='TA-A'?[writingCriterion(s,'academic')]:s.criterion==='TA-GT'?[writingCriterion(s,'general-training')]:[writingCriterion(s,'academic'),writingCriterion(s,'general-training')]),
  ...visuals.map(s=>writingTag(s,'visual')),...registers.map(s=>writingTag(s,'register')),
  ...letterPurposes.map(([tag,title,focus,transfer])=>writingTag({id:`WG-${tag}`,title:`书信功能 · ${title}`,rule:'这是可重叠的产品教学功能标签，实际三项义务/对象决定内容和语体；不是新的官方题型或评分维度。',teach:focus,demo:`原创${title}信片段附目的/义务/语气注解。`,guided:`先修一段含糊或不相关片段，再自行补计划；${focus}`,output:`新的${title}情境完整书信。`,repair:`将缺失义务或语气问题定位到原稿，修一段后换题。`,transfer,priority:['THANK','APPLY'].includes(tag)?'P1':'P0'},'letter-purpose')),
  ...essayDemands.map(([tag,title,focus,transfer])=>writingTag({id:`WT-${tag}`,title:`Task2命令 · ${title}`,rule:'教学命令标签可多选/重叠，不是固定穷尽的官方“五类作文”；以每个原问题/命令/范围为准。',teach:focus,demo:'原创计划/段落带义务映射及弱替代对照，不复制范文。',guided:`题目着色标义务，按${focus}生成自己的推理链。`,output:'新题essay，保持原问题并核对每一项义务。',repair:'用段落→义务映射找到遗漏/不相关/无发展处，局部修复后新写。',transfer,priority:tag==='EVALUATE'?'P1':'P0'},'essay-demand')),
  fullFormat('writing','academic'),fullFormat('writing','general-training'),
];
