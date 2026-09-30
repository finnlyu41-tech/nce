import type {State} from './model';
import type {StudioRoute} from './navigation';
import {readMocks,readiness,validMock,type MockResult} from './readiness';

export const blueprintKey='ielts-blueprint-v1';
export const blueprintIds=['baseline','starter','foundation','listening','reading','writing','speaking','mock','finish'] as const;
export type BlueprintId=typeof blueprintIds[number];
export type BlueprintLink={label:string;route:StudioRoute};
export type BlueprintTask={id:string;title:string;work:string;check:string;course?:BlueprintLink;resources?:string[];repair?:BlueprintLink[]};
export type BlueprintNode={id:BlueprintId;title:string;short:string;goal:string;gate:string;tasks:BlueprintTask[]};
export const blueprintResources:Record<string,{title:string;url:string;use:string}>={
 samples:{title:'IELTS 官方 Academic 样题',url:'https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test',use:'补充题型、音频、答案与考官点评；样题不等于两套完整模考。'},
 practice:{title:'British Council 四项练习',url:'https://takeielts.britishcouncil.org/prepare/ielts-free-practice-mock-tests/academic',use:'按听、读、写、说选择官方练习。完整机考体验需自行计时，口写仍需评阅。'},
 listening:{title:'官方听力题型与完整体验',url:'https://takeielts.britishcouncil.org/prepare/ielts-free-practice-mock-tests/academic/listening',use:'含音频、答案、原文与 40 题完整体验；完整体验本身不计时。'},
 reading:{title:'官方 Academic 阅读题型与完整体验',url:'https://takeielts.britishcouncil.org/prepare/ielts-free-practice-mock-tests/academic/reading',use:'含多种题型、答案和三篇文章的 40 题体验；完整体验需自行计时。'},
 writingTasks:{title:'官方 Academic 写作任务',url:'https://takeielts.britishcouncil.org/prepare/ielts-free-practice-mock-tests/academic/writing',use:'选择 Academic Task 1 与 Task 2，按要求独立完成后再看参考。'},
 speakingTasks:{title:'官方口语三部分练习',url:'https://takeielts.britishcouncil.org/prepare/ielts-free-practice-mock-tests/academic/speaking',use:'用三部分任务模拟交流，再按标准获取评阅。'},
 scoring:{title:'IELTS 官方评分说明',url:'https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail',use:'总分由四项平均后取整至整分或半分；听读换分按试卷说明核对。'},
 writing:{title:'写作评分标准与等级描述',url:'https://ielts.org/cdn/ielts-guides/ielts-writing-band-descriptors.pdf',use:'按任务回应、组织、词汇和语法逐项获得反馈。'},
 speaking:{title:'口语评分标准与等级描述',url:'https://ielts.org/cdn/ielts-guides/ielts-speaking-band-descriptors.pdf',use:'按流利连贯、词汇、语法和发音逐项获得反馈。'},
};
const lesson=(label:string,book:StudioRoute['book'],n:number,goal?:string):BlueprintLink=>({label,route:{view:'nce',book,lesson:n,tab:goal?'grammar':'listen',...(goal?{goal}:{})}});
const skill=(label:string,tab:string,task?:string):BlueprintLink=>({label,route:{view:'ielts',tab,...(task?{task}:{})}});

// A capability blueprint, not a requirement to finish a textbook. Checks below
// are learning recommendations; only full assessed mocks inform the 6.5 gate.
export const blueprintNodes:BlueprintNode[]=[
 {id:'baseline',title:'找到轻松的起点',short:'选一个现在做得到的起点',goal:'目标是 Academic 6.5，今天只需要找到适合自己的第一小步。',gate:'选一个起点就能开始。以后可随时调整；成绩、单项要求和完整模考可以后面再补。',tasks:[]},
 {id:'starter',title:'从第一句话开始',short:'认一句 → 换一个词 → 小问答',goal:'先积累“我也能做到”的体验：听一句、认一句、跟着试一句，不要求一开始就脱稿表达。',gate:'做完第一句话的小练习，再借助示范试一次问答和自我介绍。可以看中文、听慢一点，也可以拆成几次完成。',tasks:[
  {id:'first',title:'第一句话：这是我的笔',work:'认识 This is my pen.，换一个物品，再试着读出来。',check:'能认出这句话的意思，并尝试说一次；这里只记录第一次练习，不判定口语水平。'},
  {id:'question',title:'再问一句，答一句',work:'先听 Is this your pen?（这是你的笔吗？），跟着说，再试 Yes, it is.（是的）。每次只替换一个物品，看到提示也算练习。',check:'先照着示范完成一问一答；熟悉后少看一点提示。卡住时回到刚才的一句，不增加新内容。',course:{label:'跟着示范练一句问答',route:{view:'nce',book:'NCE1',lesson:1,tab:'practice',goal:'be-question',practice:'model'}}},
  {id:'myself',title:'用一句话说说自己',work:'从 I am a student.（我是一名学生。）这样的短句开始。先理解，再把职业或身份换成适合自己的一个词；只说一句就可以结束。',check:'借助句架完成一句介绍，再试着把提示遮住说一次。需要多练时，继续同一句，不必赶下一课。',course:{label:'第一册 7–8 · 一句话介绍',route:{view:'nce',book:'NCE1',lesson:7,tab:'practice',goal:'be',practice:'model'}}},
 ]},
 {id:'foundation',title:'从短句连成一段话',short:'日常 → 经历 → 原因与例子',goal:'在已有短句上，每次只增加一点：多说一个细节，说清时间，再把两句连接起来。',gate:'下面每项都可分几次完成。先跟示范，再减少提示；能换个内容表达，就进入下一小步。已有能力可记录依据并跳过。',tasks:[
  {id:'sound',title:'先听懂一来一回',work:'打开第一册 1–2，只选最短的两句。第一遍看中文和英文听，第二遍跟着读；熟悉后只遮住一句，听出在问什么、怎样回应。一次只增加一句，整篇课文可以分几天完成。',check:'能听懂这段简短问答后，再换相近难度的一小段，抓住问的事情和回答。不要求一次听懂整篇；漏听就回到那一句看提示、听、再试。',course:lesson('第一册 1–2 · 从两句对话开始','NCE1',1),repair:[lesson('熟悉后扩展：第一册 5–6','NCE1',5)]},
  {id:'sentence',title:'给一句介绍增加一个细节',work:'从已经练过的 I am…（我是……）开始，换成自己的身份。下一次只增加一句名字或来自哪里；会陈述后再学一个问句。每次只加一种变化，先跟示范，再逐渐遮住提示。',check:'先完成两三句介绍和一次简短问答，再换人物试试。能表达自己的信息后，才继续练否定、单复数和更多细节；不需要一次学完这些用法。',course:lesson('第一册 7–8 · 从一句介绍接着练','NCE1',7,'be'),repair:[lesson('问句：第一册 1–2','NCE1',1,'be-question'),lesson('需要时补句子顺序：第二册 1','NCE2',1,'word-order'),lesson('需要时补冠词：第二册 6','NCE2',6,'articles')]},
  {id:'time',title:'先说日常，再讲一件过去的事',work:'先用熟悉句子说今天做什么，再跟示范把一个动词改成过去式。一次只讲一件事；熟悉后再补计划或经历。',check:'先借助关键词说两三句，再减少提示。能分清说的是现在还是过去，隔天换一件事试试。',course:lesson('第一册 71–72 · 讲一件过去的事','NCE1',71,'past-simple'),repair:[lesson('日常：第一册 49–50','NCE1',49,'present-simple'),lesson('计划：第一册 37–38','NCE1',37,'going-to'),lesson('需要时再区分过去与完成','NCE2',5,'past-or-perfect')]},
  {id:'connection',title:'两句话之间，加一个连接',work:'先说两句自己会的短句，再只练一个连接。例如 I like reading. It is fun.（我喜欢阅读。它很有趣。）→ I like reading because it is fun.（我喜欢阅读，因为它很有趣。）下一次换一个爱好；熟悉后再加一个具体例子，慢慢连成一小段。',check:'先用提示完成两句和一个理由，再减少提示、换熟悉的话题。能清楚说出观点、原因和例子后，再进入专项的小题练习；遇到长句时只补当前妨碍理解的结构。',course:lesson('句子不顺时：第二册 1 · 句子主干','NCE2',1,'word-order'),repair:[lesson('准备好后扩展：第二册 49 · 连接句子','NCE2',49,'complex-sentences'),lesson('宾语从句：第一册 99–100','NCE1',99,'object-clause'),lesson('关系从句：第一册 121–122','NCE1',121,'relative')]},
 ]},
 {id:'listening',title:'听力',short:'定位信息 → 识别改写',goal:'边听边跟上信息，在干扰中找到答案；最终放到完整四部分中检验。',gate:'新材料中能解释漏听和误选的原因；完整限时成绩与四项目标一起评估。',tasks:[
  {id:'locate',title:'先抓信息，再处理干扰',work:'读题预判词性和信息类型；听一次作答，核对后只精听错题前后。把错误分成听辨、词汇、改写、拼写和注意力问题。',check:'换一组新题，能定位答案依据，减少同类错误；不凭听到的同一个词直接选答案。',course:skill('用站内 8 题练方法','listening'),resources:['listening']},
  {id:'types',title:'补齐没有接触过的题型',work:'用官方样题检查填空、选择、配对和地图／流程。每类先做一次，只继续练不熟或反复出错的类型。',check:'能按字数要求作答，跟上改口、转折与方位；明确每类题自己的一个易错点。',resources:['samples','listening'],repair:[lesson('地点与方向：第二册 33','NCE2',33,'place')]},
  {id:'full',title:'迁移到完整听力',work:'用未做过的完整 40 题，只按试卷要求播放；保留原始答案、正确数和该卷换分依据。',check:'完成全部四部分并复盘；下一次新题检验修正是否有效。短题或反复听的正确率不用于估分。',resources:['listening','scoring']},
 ]},
 {id:'reading',title:'阅读',short:'句子主干 → 段落证据',goal:'在 Academic 文章中找到信息、理解关系，区分原文证据与自己的推测。',gate:'能在新题中指出答案依据，并在完整阅读限时任务中检查速度与准确率。',tasks:[
  {id:'evidence',title:'定位、拆句、识别同义改写',work:'先看段落主旨，再为每个答案标出原文证据；长句只拆妨碍理解的部分，不逐词翻译全文。',check:'能说明题干和原文怎样表达同一意思，也能解释一个错误选项为什么不成立。',course:skill('用站内 8 题练证据定位','reading'),repair:[lesson('关系从句：第一册 121–122','NCE1',121,'relative'),lesson('被动语态：第二册 10','NCE2',10,'passive')]},
  {id:'types',title:'掌握判断、匹配和填空',work:'用官方新题检查 True／False／Not Given、观点判断、标题／信息匹配、选择和填空；只重练易错类型。',check:'区分“与原文矛盾”和“原文没说”；匹配题依靠主旨或证据，填空遵守词数限制。',resources:['reading','samples']},
  {id:'full',title:'完成完整 Academic 阅读',work:'用未做过的三篇文章、40 题，在 60 分钟内完成。先记录用时和失分类型，再决定补词句还是练时间分配。',check:'保留该套答案、正确数及换分依据；用下一套新题检查是否改善。',resources:['reading','scoring']},
 ]},
 {id:'writing',title:'写作',short:'回应任务 → 组织与修改',goal:'同时覆盖 Academic Task 1 和 Task 2；优先修影响理解和任务完成的问题。',gate:'在完整限时写作中完成两篇，并得到按四项标准给出的具体反馈。',tasks:[
  {id:'task-two',title:'Task 2：把观点论证清楚',work:'先审清所有问题，列观点、理由和例子，再写正文。按反馈修改一段，随后换题重写。Task 2 权重更高，先练它，但保留 Task 1。',check:'新题中立场明确、问题回应完整、论点有支持；在约 40 分钟内写至少 250 词。',course:skill('Task 2 · 公共图书馆','writing','ielts-w3'),resources:['writing','samples'],repair:[lesson('因果与转折：第二册 49','NCE2',49,'complex-sentences')]},
  {id:'task-one',title:'Task 1：选重点、做概括',work:'从图表概括主要特征，再选数据比较；用官方材料补地图和流程，避免只会一种图。',check:'新题有整体概括和关键细节，数据与顺序准确；约 20 分钟内写至少 150 词。',course:skill('Academic Task 1 · 数据比较','writing','ielts-w1'),resources:['samples','writing'],repair:[lesson('比较：第二册 8','NCE2',8,'comparison'),lesson('流程的被动表达：第二册 10','NCE2',10,'passive')]},
  {id:'feedback',title:'两篇限时，反馈后换题',work:'60 分钟完成两个新任务，把原稿交给熟悉 IELTS 标准的老师或机构，逐项记录反馈；修改后再做另一组题。',check:'保留原稿、评阅来源、四项反馈和修改版；字数、自查勾选或站内文字提示不能证明写作分数。',resources:['writing','writingTasks']},
 ]},
 {id:'speaking',title:'口语',short:'直接回答 → 展开与讨论',goal:'不背整篇答案，能对陌生问题组织内容，表达清楚并回应追问。',gate:'完成三部分模拟交流，获得流利连贯、词汇、语法、发音四方面反馈。',tasks:[
  {id:'part-one',title:'Part 1：回答、原因、细节',work:'先用熟悉话题练直接回答，再补自然的原因或具体细节。回听只挑一处影响清楚度的问题，修好后换问法。',check:'换日常话题仍能直接回应，不依赖整段稿；能听懂并回应追问。',course:skill('Part 1 · 工作','speaking','bank-1-1-0'),resources:['speaking']},
  {id:'part-two',title:'Part 2：独立组织长答',work:'用 1 分钟记关键词，随后连续讲 1–2 分钟。围绕题卡讲清背景、事情、细节和意义，逐渐撤掉句架。',check:'换一张陌生题卡，覆盖要点并连贯展开；回听能指出并修正一处卡顿或表达问题。',course:skill('Part 2 · 一次旅行','speaking','bank-2-1-0'),resources:['samples','speaking']},
  {id:'part-three',title:'Part 3：讨论与完整评阅',work:'练比较、原因、影响和变化，再模拟完整三部分对话；请熟悉评分标准的人给反馈，换题复验。',check:'观点有理由与例子，能回应未预先准备的追问；留下评阅来源和四项反馈。',course:skill('Part 3 · 习惯与影响','speaking','bank-3-1-0'),resources:['speaking','speakingTasks']},
 ]},
 {id:'mock',title:'完整模考与修补',short:'整体验收 → 只补最大缺口',goal:'把四项能力放进同一次完整考试条件，检验总分 6.5 与单项要求。',gate:'本站准备度参考：最近两次不同的新 Academic 试卷均限时完成，有口写评阅与反馈，达到总分和已确认的单项要求。',tasks:[]},
 {id:'finish',title:'Academic 6.5',short:'达到准备度参考，安排实考',goal:'用稳定的完整表现确认准备度，保留得分能力，按实际申请要求参加考试。',gate:'模考记录是自录证据，不是正式成绩；最终以 IELTS 成绩报告和接收机构要求为准。',tasks:[]},
];

export type TaskEvidence={note:string;decision:'todo'|'repair'|'passed'|'skip';at:number};
export const starterLessons=[
 {id:'first',title:'认一句，换个物品',
  steps:[{title:'先认识一句话。',en:'This is my pen.',zh:'这是我的笔。',question:'pen 是哪一样？',options:['笔','书','包'],answer:0,help:'pen 就是“笔”。再选一次就好。'},
   {title:'换一个词，就有新句子。',en:'This is my ____.',spoken:'This is my bag.',zh:'这是我的包。bag 就是“包”。',question:'把哪个词放进空格？',options:['pen','bag','book'],answer:1,help:'bag 是“包”，把它放在句子最后再试试。'}],
  say:{en:'This is my bag.',zh:'这是我的包。'},win:'你认出了 pen，换出了 bag，也尝试说了一句。'},
 {id:'question',title:'再问一句，答一句',
  steps:[{title:'在刚才的句子上，试着问一句。',en:'Is this your bag?',zh:'这是你的包吗？',question:'这里的 your 是谁的？',options:['我的','你的'],answer:1,help:'my 是“我的”，your 是“你的”。看着提示再选一次。'},
   {title:'只要一句，就能回答。',en:'Yes, it is.',zh:'是的。',question:'对方问“这是你的包吗？”，哪句表示“是的”？',options:['Yes, it is.','No, it is not.'],answer:0,help:'Yes 表示“是的”。跟着上面的示范选一次。'}],
  say:{en:'Is this your bag? — Yes, it is.',zh:'这是你的包吗？——是的。'},win:'你试过了一问一答。换成 pen，就能再练一个熟悉的物品。'},
 {id:'myself',title:'用一句话介绍身份',
  steps:[{title:'认识介绍自己的开头。',en:'I am a student.',zh:'我是一名学生。',question:'句子里的 I 是谁？',options:['我','你'],answer:0,help:'I 就是“我”。先认出这一个词就很好。'},
   {title:'只换身份，其他部分先保留。',en:'I am a ____.',spoken:'I am a teacher.',zh:'我是一名老师。teacher 是“老师”。',question:'模仿介绍一位老师，空格里放哪个词？',options:['student','teacher'],answer:1,help:'student 是“学生”，teacher 是“老师”。试着选 teacher。'}],
  say:{en:'I am a teacher.',zh:'我是一名老师。这里先模仿角色说一句，以后再换成自己的身份。'},win:'你又完成了一句介绍。物品、问答、身份，第一组小步都练过了。'},
] as const;
export type BlueprintRecord={version:1;focus?:BlueprintId;entry?:'new'|'rusty'|'exam';warmups?:Record<string,number>;minimumConfirmed:boolean;tasks:Record<string,TaskEvidence>};
const taskIds=new Set(blueprintNodes.flatMap(n=>n.tasks.map(t=>`${n.id}.${t.id}`)));
export function readBlueprint(raw?:string):BlueprintRecord{
 const result:BlueprintRecord={version:1,minimumConfirmed:false,tasks:{}};
 try{
  const data=JSON.parse(raw||'{}');if(!data||data.version!==1)return result;
  if(blueprintIds.includes(data.focus))result.focus=data.focus;
  if(['new','rusty','exam'].includes(data.entry))result.entry=data.entry;
  result.warmups={};
  for(const lesson of starterLessons){const step=data.warmups?.[lesson.id];if(Number.isInteger(step)&&step>=0&&step<=3)result.warmups[lesson.id]=step}
  if(Number.isInteger(data.warmup)&&data.warmup>=0&&data.warmup<=3&&!result.warmups.first)result.warmups.first=data.warmup;
  result.minimumConfirmed=data.minimumConfirmed===true;
  for(const [id,value] of Object.entries(data.tasks||{})){
   const item=value as Partial<TaskEvidence>;
   if(!taskIds.has(id)||!item||typeof item.note!=='string')continue;
   const note=item.note.slice(0,3000),decision=['repair','passed','skip'].includes(item.decision||'')?item.decision!:'todo';
   result.tasks[id]={note,decision:note.trim()?decision:'todo',at:Number.isFinite(item.at)?item.at!:0};
  }
 }catch{/* Old or incomplete backups remain usable. */}
 return result;
}
export function updateBlueprint(state:State,change:(record:BlueprintRecord)=>BlueprintRecord):State{
 const next=change(readBlueprint(state.drafts[blueprintKey]));
 return {...state,drafts:{...state.drafts,[blueprintKey]:JSON.stringify(next)}};
}
export function saveBlueprintEvidence(state:State,id:string,note:string,decision:TaskEvidence['decision'],now=Date.now()){
 if(!taskIds.has(id))return state;
 return updateBlueprint(state,r=>({...r,focus:id.split('.')[0] as BlueprintId,tasks:{...r.tasks,[id]:{note:note.slice(0,3000),decision:note.trim()?decision:'todo',at:now}}}));
}
export const evidencePassed=(e?:TaskEvidence)=>!!e?.note.trim()&&(e.decision==='passed'||e.decision==='skip');
const completeAcademic=(r:MockResult,today:string)=>r.kind==='academic'&&validMock(r)&&r.date<=today&&r.unseen&&r.timed&&!!r.reviewer.trim()&&!!r.feedback.trim();
export function blueprintSnapshot(state:State,now=Date.now()){
 const record=readBlueprint(state.drafts[blueprintKey]),mocks=readMocks(state.drafts['ielts-readiness']);
 const results=mocks.results.filter(r=>r.kind==='academic').sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id));
 const today=new Date(now).toLocaleDateString('en-CA'),latest=results[0];
 const assessed=!!latest&&completeAcademic(latest,today);
 const ready=record.minimumConfirmed&&results.slice(0,2).length===2&&results.slice(0,2).every(r=>completeAcademic(r,today))&&readiness(results,Number(mocks.minimum));
 const nodes=blueprintNodes.map(node=>{
  const passed=node.tasks.filter(t=>evidencePassed(record.tasks[`${node.id}.${t.id}`])).length;
  const done=node.id==='baseline'?!!record.entry||assessed:node.id==='mock'||node.id==='finish'?ready:passed===node.tasks.length;
  return {...node,passed,done};
 });
 const skills=nodes.filter(n=>['listening','reading','writing','speaking'].includes(n.id));
 const order=['listening','reading','writing','speaking'];
 const priority=assessed?[...skills].sort((a,b)=>Number(latest.scores[order.indexOf(a.id)])-Number(latest.scores[order.indexOf(b.id)])):skills;
 const done=(id:BlueprintId)=>nodes.find(n=>n.id===id)!.done;
 const next=ready?'finish':!done('baseline')?'baseline':record.entry==='new'&&!done('starter')?'starter':record.entry!=='exam'&&!assessed&&!done('foundation')?'foundation':priority.find(n=>!n.done)?.id||'mock';
 const current:BlueprintId=ready?'finish':record.focus&&!nodes.find(n=>n.id===record.focus)?.done?record.focus:next;
 return {record,mocks,results,latest,assessed,ready,nodes,next:next as BlueprintId,current,priority};
}
export function blueprintRouteNode(route:StudioRoute,state:State):BlueprintId{
 if(route.view==='ielts'&&['listening','reading','writing','speaking'].includes(route.tab||''))return route.tab as BlueprintId;
 if(route.view==='ielts')return 'mock';
 return readBlueprint(state.drafts[blueprintKey]).focus||blueprintSnapshot(state).next;
}
