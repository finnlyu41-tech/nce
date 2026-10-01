import { academic, both, general, makeRequirement, sourceRef } from './builders';
import type { Requirement, Variant } from './types';

type TypeSeed = { id: string; family: string; title: string; rule: string; demo: string; guided: string; errors: string[]; target: string; prerequisites: string[]; modes?: string[] };
const listeningTypes: TypeSeed[] = [
  { id:'L01', family:'multiple-choice', title:'选择一个答案', rule:'比较整句意思，选最终被支持的信息；听到相同词不等于答案。', demo:'原创预约对话中演示先提到旧安排、随后改口；标出最后确认处，并解释最相近干扰项。', guided:'先为三个选项分类支持/否定/只提到，再用时间戳排除一个。', errors:['keyword_lure','correction_missed','negation'], target:'指出最终答案的音频依据并解释干扰项。', prerequisites:['P4','P6','P10'], modes:['single-choice'] },
  { id:'L02', family:'multiple-choice', title:'选择多个答案', rule:'逐个检验选项，并遵守题干规定的选择数；不能重复选同一项或多选。', demo:'原创select-two例子区分“提过”和“认可”，每个正确项给独立依据。', guided:'用选项证据格分别确认支持内容，提交前检查数量。', errors:['selection_count','duplicate_choice','mention_vs_support'], target:'恰好选出规定数量，各自有音频依据。', prerequisites:['P4','P6','P10'], modes:['multi-select'] },
  { id:'L03', family:'matching', title:'配对', rule:'把人/项目与对应细节或意见关联；是否可重复使用选项按本题说明。', demo:'两人都提及同一课程时，展示如何在换人说话后更新归属。', guided:'填写speaker/entity信息格，再撤去格子配对。', errors:['speaker_tracking','relationship_swap','option_reuse'], target:'重复主题和换轮中仍能正确归属。', prerequisites:['P4','P6','P10'], modes:['matching'] },
  { id:'L04', family:'visual-labelling', title:'平面图标注', rule:'先确认室内起点、参照方向和地标；回答用选项还是词语由指令决定。', demo:'原创楼层平面图，从入口沿路线追踪并解释相对左右。', guided:'画路线和锚点；分别练选项版与符合词数指令的输入版。', errors:['starting_point','left_right_frame','landmark','response_mode'], target:'把口述空间关系迁移到新室内布局。', prerequisites:['P7','P6','P10'], modes:['option-label','word-entry'] },
  { id:'L05', family:'visual-labelling', title:'地图标注', rule:'核对户外方向/地标及修正后的地点；漏掉一处后继续找后续定位。', demo:'原创公园导览先提出一个位置再否定，展示定位更新与恢复。', guided:'追踪转弯/穿过/旁边等线索，停止时说明当前锚点。', errors:['orientation','overshoot','correction_missed','lost_position'], target:'换新地图仍能定位，漏题不带偏整组。', prerequisites:['P7','P6','P10'], modes:['option-label','word-entry'] },
  { id:'L06', family:'visual-labelling', title:'装置示意图标注', rule:'按口述位置/功能找部件，不能凭自己熟悉的装置结构猜。', demo:'原创陌生设备图，用连接位置和功能识别部件，区分整体与部分。', guided:'先找两个锚点部件，再将空间/功能描述指向图示。', errors:['part_whole','attachment_relation','outside_knowledge'], target:'陌生设备也依据实际描述，而非背景知识。', prerequisites:['P7','P3','P6'], modes:['option-label','word-entry'] },
  { id:'L07', family:'structured-completion', title:'表单填空', rule:'先预判字段类型；姓名、数字和改口后的信息须精确，输入遵守词/数字限制。', demo:'原创预约表包含姓名拼读和更正后的房间号；展示字段形式与最终事实。', guided:'分类姓名/日期/金额/数字字段，拼读并核对各项允许形式。', errors:['name_letter','number_discrimination','correction_missed','word_limit','unit_duplication'], target:'填入最终事实与合法形式，不做语义自动改写。', prerequisites:['P1','P2','P3','P10'], modes:['word-entry','option-completion'] },
  { id:'L08', family:'structured-completion', title:'笔记填空', rule:'跟随标题、层级和要点；空格的语法形式必须契合笔记。', demo:'原创讲座片段中，说明标题和细节的关系及同义改写后的定位。', guided:'标记笔记层级和预计词性，边听标当前所在要点。', errors:['lost_position','main_vs_detail','plural_or_inflection','paraphrase'], target:'保持笔记层级，写入被要求的来源措辞。', prerequisites:['P3','P4','P5','P6'], modes:['word-entry','option-completion'] },
  { id:'L09', family:'structured-completion', title:'表格填空', rule:'听前确认行列类别及已提供的单位，防止数字填错单元格。', demo:'原创课程比较表演示费用单位已给出时不重复输入单位。', guided:'预测每格信息类型，按行/列核对两所设施。', errors:['row_column','unit_duplication','comparison'], target:'数值、类别和单位一致。', prerequisites:['P2','P3','P4'], modes:['word-entry','option-completion'] },
  { id:'L10', family:'structured-completion', title:'流程图填空', rule:'沿流程阶段/分支定位，分清下一步与因果关系。', demo:'原创生产说明含一处分支，展示转折/顺序信号对应的阶段。', guided:'先排简单过程，再随音频补不同阶段的来源词。', errors:['sequence','cause_effect','wrong_branch','word_class'], target:'把答案放在正确步骤，不能只认出一个词。', prerequisites:['P3','P5','P6'], modes:['word-entry','option-completion'] },
  { id:'L11', family:'summary-completion', title:'摘要填空', rule:'把改写后的连贯摘要对应到音频，并遵守本题词语来源/选项和词数要求。', demo:'原创摘要句与音频措辞不同，逐步展示指代、含义和语法约束。', guided:'将一句摘要关联到片段，排除意思相近但不被允许的自造同义词。', errors:['paraphrase','reference','invented_synonym','word_limit'], target:'来源答案准确，摘要句连贯且形式符合指令。', prerequisites:['P3','P4','P5'], modes:['word-entry','option-completion'] },
  { id:'L12', family:'sentence-completion', title:'句子填空', rule:'完成整句关系，不能只捕捉孤立名词；数量/词形/否定也影响答案。', demo:'原创因果句示范原因和结果互换如何使听到的词也成错答。', guided:'预测词性和句间关系，再用来源词完成句子。', errors:['cause_effect','negation','word_class','word_limit'], target:'完成句被音频支持、语法适配并在限制内。', prerequisites:['P3','P4','P5'], modes:['word-entry'] },
  { id:'L13', family:'short-answer', title:'简短问答', rule:'识别问的是谁/哪里/何时/什么及需几个答案；只写被要求的信息。', demo:'原创短问对比正确事实与回答了另一问题的事实。', guided:'给问题标注信息类别，再缩短答案到指令允许形式。', errors:['wrong_fact_type','required_answer_count','extra_words','spelling'], target:'给出全部且仅有的所需事实。', prerequisites:['P2','P3','P6','P10'], modes:['word-entry'] },
];

const readingTypes: TypeSeed[] = [
  { id:'R01', family:'multiple-choice', title:'选择一个答案', rule:'用原文支持完整意思，不能靠关键词或合理常识选答案。', demo:'原创文本有两个相近选项，展示范围词怎样排除一个。', guided:'标出证据句，再解释最接近的错误项。', errors:['keyword_lure','quantifier_scope','outside_knowledge'], target:'找到充分证据并说明最近干扰项为什么不成立。', prerequisites:['P4','P8','P9','P10'], modes:['single-choice'] },
  { id:'R02', family:'multiple-choice', title:'选择多个答案', rule:'每个选择都要有原文支持，并且满足规定选择数。', demo:'原创select-two题分别展示两条依据与仅部分被支持的选项。', guided:'填证据矩阵，检查每项和总选择数。', errors:['selection_count','partial_support','extra_selection'], target:'每个选择分别成立，不靠多选碰碰运气。', prerequisites:['P4','P8','P9','P10'], modes:['multi-select'] },
  { id:'R03', family:'identifying-information', title:'True / False / Not Given', rule:'True有支持，False有矛盾，Not Given缺判断所需信息；不借外部知识补证据。', demo:'原创对比题中的缺失比较信息，展示“矛盾”与“没说”的区别。', guided:'标题干命题及范围，分类支持/矛盾/缺失。', errors:['evidence_absence','outside_knowledge','quantifier_scope'], target:'False指出矛盾词，NG说明缺了哪条命题信息。', prerequisites:['P4','P8','P9'], modes:['true-false-not-given'] },
  { id:'R04', family:'identifying-writer-views', title:'Yes / No / Not Given', rule:'判断被问的作者观点/主张；引用别人的意见不等于作者赞同。', demo:'原创文中作者反驳经理的提议，展示观点归属再判立场。', guided:'给不同声音着色，找作者自己的判断。', errors:['source_attribution','stance','negation','evidence_absence'], target:'依据作者的态度，不能把被引用者的意见算成作者观点。', prerequisites:['P4','P5','P9'], modes:['yes-no-not-given'] },
  { id:'R05', family:'matching-information', title:'匹配段落信息', rule:'找指定细节/原因/例子，区别于概括段落标题；段落重用按指令。', demo:'原创段落里用一个细节完成信息匹配，说明主旨正确仍可能不回答此题。', guided:'给段落功能贴标，再找打乱顺序的指定信息。', errors:['main_vs_detail','premature_keyword_match','option_reuse'], target:'定位确切信息，并合法重用段落。', prerequisites:['P4','P8','P9'], modes:['paragraph-matching'] },
  { id:'R06', family:'matching-headings', title:'匹配标题', rule:'标题概括整段主旨/作用，不能只抓一个例子；同一标题不能反复用于不同段。', demo:'原创段落包含很醒目的例子，解释为什么以例子为标题过窄。', guided:'先用自己的短语概括段落，再选择标题。', errors:['main_vs_detail','scope','lexical_lure'], target:'所选标题覆盖段落统领意思。', prerequisites:['P4','P5','P8'], modes:['heading-matching'] },
  { id:'R07', family:'matching-features', title:'匹配特征', rule:'把理论/事实/时期与人或群体关联，注意代词、相邻名字和重复提及。', demo:'原创材料交替提到两位研究者，沿代词找到正确归属。', guided:'建实体信息格，再处理选项复用指令。', errors:['reference','adjacent_name_lure','source_attribution'], target:'区分同一实体的多次出现和对照的不同观点。', prerequisites:['P4','P8','P9'], modes:['feature-matching'] },
  { id:'R08', family:'matching-sentence-endings', title:'匹配句尾', rule:'拼接后既要语法成立也要原文支持；顺序规则只适用于官方明确说明的题型。', demo:'两个句尾语法都顺，但只有一个因果关系受原文支持。', guided:'比较完整命题，并在原文定位关系。', errors:['grammar_only','cause_effect','unsupported_join'], target:'完成句意思与原文一致。', prerequisites:['P3','P4','P8'], modes:['ending-matching'] },
  { id:'R09', family:'sentence-completion', title:'句子填空', rule:'按指令抽取来源词，检查单复数、搭配及词数，不自行换同义词。', demo:'原创空格以复数语法和两词上限约束来源短语。', guided:'标语法槽位并回到原文提取候选词。', errors:['invented_synonym','plural_or_inflection','word_limit'], target:'准确来源词与语法/长度同时合规。', prerequisites:['P3','P4','P8','P10'], modes:['source-word-entry'] },
  { id:'R10', family:'summary-note-table-flow', title:'摘要填空', rule:'把压缩后的摘要对照相应原文；可能从选项选词或直接抽取，不保证一律顺序出现。', demo:'原创摘要展示词库版与抽取版的不同回答模式。', guided:'逐空建立指代和来源证据，再读完成后的摘要。', errors:['reference','word_class','order_assumption','response_mode'], target:'连贯摘要有来源依据，回答模式正确。', prerequisites:['P3','P4','P5','P8'], modes:['source-word-entry','option-completion'] },
  { id:'R11', family:'summary-note-table-flow', title:'笔记填空', rule:'在缩略笔记中保留层级与类别，先理解小标题再找细节。', demo:'原创笔记同一关键词出现在两层，展示要点归类。', guided:'标笔记层级，并将来源细节放到正确小标题。', errors:['category','main_vs_detail','fragment_meaning'], target:'细节进入正确的笔记结构。', prerequisites:['P3','P5','P8'], modes:['source-word-entry','option-completion'] },
  { id:'R12', family:'summary-note-table-flow', title:'表格填空', rule:'利用列名、行名和单位找具体值，不能混淆比较对象。', demo:'原创两个设施开放时间表，单位已给出且答案应分行输入。', guided:'预测各单元格信息类别，再按行/列核对原文。', errors:['row_column','unit_duplication','comparison'], target:'类别、值和单位对应，不重复已给单位。', prerequisites:['P2','P3','P8'], modes:['source-word-entry','option-completion'] },
  { id:'R13', family:'summary-note-table-flow', title:'流程图填空', rule:'从文本重建阶段/依赖/分支，按箭头找到该步骤的来源词。', demo:'原创过程文本打乱提及顺序，示范如何区分原因与下一步。', guided:'先排流程阶段再填空，解释分支条件。', errors:['sequence','cause_effect','wrong_branch','word_limit'], target:'每个答案与所属阶段相符。', prerequisites:['P3','P5','P8'], modes:['source-word-entry','option-completion'] },
  { id:'R14', family:'diagram-labelling', title:'示意图标注', rule:'把文章描述连接到图上部位；箭头、位置与关系比背景知识可靠，答案不一定按顺序。', demo:'原创物体示意图通过相对位置和功能识别陌生部件。', guided:'在文本与图间追踪两个位置线索。', errors:['diagram_relation','outside_knowledge','order_assumption'], target:'能给出文字描述与部件的对应关系。', prerequisites:['P3','P7','P8'], modes:['source-word-entry'] },
  { id:'R15', family:'short-answer', title:'简短问答', rule:'提取问题实际要求的事实；数字可按本题指令用数词/数字，答案需在长度限制内。', demo:'原创who/when问题展示事实正确却答非所问的情况。', guided:'分类所求事实，再剪掉无关词并核对来源。', errors:['wrong_fact_type','extra_words','numeric_format','source_wording'], target:'给出有证据且简洁合规的回答。', prerequisites:['P2','P3','P8','P10'], modes:['source-word-entry'] },
];

function task(seed: TypeSeed, skill: 'listening'|'reading', variant?: Variant): Requirement {
  const listening = skill === 'listening', applicable = listening ? both : variant === 'academic' ? academic : general;
  const id = listening ? seed.id : `${seed.id}-${variant === 'academic' ? 'A' : 'GT'}`;
  const context = listening ? '新的生活/教育对话或独白，最终覆盖四部分与不同清晰英语口音'
    : variant === 'academic' ? '新的Academic一般兴趣长文；覆盖论述、描述、叙事与图示信息' : '新的GT日常短文件、工作材料或长篇一般兴趣文';
  const sources = listening ? [sourceRef('listening-format', seed.family, applicable)]
    : [sourceRef('reading-academic', `${seed.family}：官方Academic分类`, academic), sourceRef('reading-general-bc', `${seed.family}：GT明确题型并集`, general)].filter(s => s.variants.some(v => applicable.includes(v)));
  if (listening && ['L04','L05','L06','L11'].includes(seed.id)) sources.push(sourceRef('listening-map-idp', seed.id === 'L11' ? 'inventory: summary completion' : 'visual response modes', both));
  if (listening && seed.id === 'L11') sources.push(sourceRef('samples-general','Listening sample inventory: summary',both));
  return makeRequirement({ id, skill, kind:'question-type', taxonomy:'official-family-variant', title:seed.title, family:seed.family,
    subforms:seed.modes||[], variants:applicable, explanation:seed.rule, diagnostic:`检查${seed.target} 错因须结合原作答和简短解释，不能仅由错选项推断。`, sources,
    currentMapNodeIds: listening ? ['listening-locate','listening-types','listening-full'] : variant === 'academic' ? ['reading-evidence','reading-types','reading-full'] : [],
    feedbackMode:'answer-key', prerequisiteConcepts:seed.prerequisites, errorTags:seed.errors,
    plan:{ explain:`讲清${seed.rule} 加一个作答指令理解检查。`, model:seed.demo, guided:seed.guided,
      independent:`在${context}做不同于示范/跟练的首答；撤去提示、中文与参考答案。观察：${seed.target}`,
      timed:listening ? `将本类型放入新混合part，再进入40题四部分；一次播放、不开原文/提示/重播，音频故障使该次证据失效。单独小题限时是课程建议。`
        : `将本类型放入新混合${variant === 'academic' ? 'Academic' : 'GT'}篇章，再进入本类别40题/三部分/60分钟练习；时间含输入答案。短题预算不是官方换分。`,
      feedback:`先打开${listening ? '音频时间戳' : '原文证据段'}和规范答案，解释${seed.errors.join('、')}，订正后做一条新题；合法替代答案有争议则转题目QA。`,
      review:`隔课程安排的间隔，换${listening ? '录音/场景/说话者' : '材料/文本语境'}重测${seed.target}；保持首答与修订分开。` } });
}

function rule(id: string, skill: 'listening'|'reading', title: string, explanation: string, sourceIds: string[], variants: readonly Variant[], mapIds: string[], focus: string): Requirement {
  return makeRequirement({ id, skill, kind:'test-rule', taxonomy:'official-format', title, family:'test-conditions-and-marking', subforms:[], variants, explanation,
    diagnostic:`能否说明并在新任务实际应用：${focus}`, sources:sourceIds.map(s=>sourceRef(s,title,variants,'rule')), currentMapNodeIds:mapIds, feedbackMode:'conditions-check', prerequisiteConcepts:['P10'], errorTags:['response_mode','word_limit','time_management'],
    plan:{ explain:`用短卡解释${explanation}，作指令理解检查。`, model:`用原创合规/违规两份作答演示${focus}；解释练习信号与正式分数的边界。`,
      guided:`让学习者辨认并修正${focus}相关的条件或输入问题。`, independent:`换新的题目指令或考试条件，自主判断${focus}并说明依据。`,
      timed:`在正确模式的完整${skill==='listening'?'四部分40题听力':'三部分40题阅读'}中应用；记录模式、支持、素材和实际用时。`,
      feedback:`把条件/输入错误与语言理解分开；展示原证据及修正，不将自定准确率当Band。`, review:`延迟后换指令/模式情境复验，未测过显示未验证；旧纸笔条件需实际市场/日期依据。` } });
}

export const listeningReadingRequirements: readonly Requirement[] = [
  ...listeningTypes.map(s=>task(s,'listening')),
  ...readingTypes.flatMap(s=>[task(s,'reading','academic'),task(s,'reading','general-training')]),
  rule('L-FORMAT','listening','四部分、一遍播放与交付条件','听说共用；听力四部分各10题，约30分钟录音，一遍播放；电脑结束检查按报考中心核实。Writing on Paper不把听读改成纸笔。',['listening-format','test-types','delivery-2026','listening-computer'],both,['listening-full'],'分清四部分语境、学习重播与有效一遍播放证据'),
  rule('L-MARKING','listening','原始分与Band参照','40个评分槽，每正确答案1分，错答不倒扣；平均锚点随卷变化，不是固定阈值，不换算8题或未校准原创卷。',['scoring','listening-bc'],both,['listening-full'],'区分练习正确率、官方平均参照与正式成绩'),
  rule('L-RESPONSE','listening','选择数、词数、拼写与输入','严格按每题词/数字政策和选择数；超限失分，连字符词按一个词，相关抽取任务不考缩略词；来源词须正确拼写/词形，规范英美拼写和大小写变体可接受。',['listening-format','spelling-bc','capitals-bc'],both,['listening-types'],'验证本题回答形式而非宽松语义匹配'),
  ...(['academic','general-training'] as const).flatMap(v=>{
    const vs=v==='academic'?academic:general, suffix=v==='academic'?'A':'GT', nodes=v==='academic'?['reading-full']:[];
    return [
      rule(`R-FORMAT-${suffix}`,'reading',`${v==='academic'?'Academic':'GT'} 三部分/60分钟`,v==='academic'?'Academic三部分40题/60分钟，当前官方文本量2150–2750词；覆盖非专业论述、描述、叙事，不把短篇长度当完整训练。':'GT三部分40题/60分钟，当前页面2150–2375词；日常短文件→工作材料→长篇一般兴趣文。文本量只作格式教学，不规定所有微课长度。',[v==='academic'?'reading-academic':'reading-general','reading-entry-idp'],vs,nodes,'本类别的文本语境、作答时间与无额外抄答案时间'),
      rule(`R-MARKING-${suffix}`,'reading',`${v==='academic'?'Academic':'GT'} 原始分参照`,'每正确答案1分，错答不倒扣；Academic/GT同一Band对应不同平均原始分参照。不能在两类间套表，也不能插值缺失半分。',['scoring','reading-bc'],vs,nodes,'明确类别、题数、卷来源与有效换分依据'),
      rule(`R-RESPONSE-${suffix}`,'reading','原文抽取、作答限制与题序','抽取来源词、长度和词形按本题指令；规范英美拼写/全大写可接受。阅读并非所有题型按序：匹配、摘要与图示需自己的定位策略；选项复用按类型与指令。',[v==='academic'?'reading-academic':'reading-general','reading-general-bc','spelling-bc','capitals-bc'],vs,v==='academic'?['reading-types']:[],'逐题确认选择数/词数/来源措辞及对应题序规则'),
    ];
  }),
];

/** Proposed foundation concepts. No uninspected NCE unit is claimed as a verified binding. */
export const prerequisiteConcepts = [
  {id:'P1',title:'语音到词语识别',bindingStatus:'not-audited'}, {id:'P2',title:'数字、日期、时间、单位和姓名',bindingStatus:'not-audited'},
  {id:'P3',title:'空格词性、单复数、短语结构',bindingStatus:'not-audited'}, {id:'P4',title:'同义改写与指代',bindingStatus:'not-audited'},
  {id:'P5',title:'主旨/细节、比较、顺序、因果与转折',bindingStatus:'not-audited'}, {id:'P6',title:'听力跟踪、改口、否定和漏听恢复',bindingStatus:'not-audited'},
  {id:'P7',title:'空间、方位与部件关系',bindingStatus:'not-audited'}, {id:'P8',title:'略读、扫读、定位后细读',bindingStatus:'not-audited'},
  {id:'P9',title:'证据、范围、作者/引述者归属',bindingStatus:'not-audited'}, {id:'P10',title:'指令、输入、选择数、计时与界面',bindingStatus:'not-audited'},
] as const;
