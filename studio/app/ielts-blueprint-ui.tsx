'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowRight,Check,ChevronRight,ExternalLink,Flag,GitBranch,LocateFixed,MapPin,RotateCcw,Volume2} from 'lucide-react';
import type {State} from './model';
import {navigate,type StudioRoute} from './navigation';
import {useRoute} from './use-route';
import {Readiness} from './readiness-ui';
import {overallBand} from './readiness';
import {dueLearningGoals} from './learning-plan';
import {blueprintKey,blueprintNodes,blueprintResources,blueprintSnapshot,blueprintRouteNode,readBlueprint,updateBlueprint,saveBlueprintEvidence,evidencePassed,starterLessons,type BlueprintId,type BlueprintTask,type BlueprintLink} from './ielts-blueprint';
import {prepareRoadmapLesson} from './learning-roadmap';
import {speak} from './learning';
import './ielts-blueprint.css';

type Props={state:State;update:(fn:(s:State)=>State)=>void};
export function BlueprintHome({state}:{state:State}){
 const snapshot=blueprintSnapshot(state),next=blueprintNodes.find(n=>n.id===snapshot.current)!;
 return <section className="panel blueprint-home" aria-label="Academic 6.5 学习路线">
  <div className="blueprint-home-title"><div><span className="eyebrow">IELTS ACADEMIC · YOUR BLUEPRINT</span><h2>一条通向 <em>6.5</em> 的路线。</h2><p>先检验，再补必要的能力。已会的跳过，薄弱的才多练。</p></div><span className="blueprint-home-target" aria-hidden="true">6.5</span></div>
  <div className="blueprint-mini" aria-label="路线概览">{['一句话','一段话','听说读写','完整模考','6.5'].map((label,i)=><span key={label}>{i>0&&<ChevronRight size={15}/>}<b>{label}</b></span>)}</div>
  <div className="blueprint-home-next"><span><MapPin size={16}/>当前关卡：{next.title}</span><button className="btn" onClick={()=>navigate({view:'roadmap',node:snapshot.current})}>打开我的路线<ArrowRight size={16}/></button></div>
 </section>;
}
export function BlueprintPosition({state}:{state:State}){
 const route=useRoute(),node=blueprintRouteNode(route,state),item=blueprintNodes.find(n=>n.id===node)!;
 if(!['nce','ielts','grammar','words','review','quiz','lesson','materials'].includes(route.view)||route.view==='nce'&&!route.lesson)return null;
 return <div className="blueprint-position"><button className="text-btn" onClick={()=>navigate({view:'roadmap',node})}><GitBranch size={15}/>6.5 路线<ChevronRight size={13}/>{item.title}</button><span>{route.view==='ielts'?'专项训练':route.view==='review'?'复习后回到当前关卡':'按需补漏'} · 完成后回到路线验收</span></div>;
}
function Resources({ids,onStart}:{ids:string[];onStart:()=>void}){
 return <div className="blueprint-resource-links">{ids.map(id=>{const resource=blueprintResources[id];return <a key={id} href={resource.url} target="_blank" rel="noreferrer" onClick={onStart}><span>{resource.title}<small>{resource.use}</small></span><ExternalLink size={14}/></a>})}</div>;
}
function FirstSentence({state,update,onNext}:{onNext:()=>void}&Props){
 const record=readBlueprint(state.drafts[blueprintKey]);
 const [lessonId,setLessonId]=useState(()=>starterLessons.find(l=>!evidencePassed(record.tasks[`starter.${l.id}`]))?.id||'first');
 const lesson=starterLessons.find(l=>l.id===lessonId)!,step=record.warmups?.[lessonId]||0,[message,setMessage]=useState('');
 const example=step<2?lesson.steps[step]:lesson.say;
 function advance(next:number){
  setMessage('');update(s=>{
   const base=updateBlueprint(s,r=>({...r,focus:'starter',entry:r.entry||'new',warmups:{...r.warmups,[lessonId]:next}}));
   return next===3?saveBlueprintEvidence(base,`starter.${lessonId}`,'完成词义识别与替换练习；使用者确认尝试说过一句。这里只记录练习，不评价发音或口语分数。','passed'):base;
  });
 }
 const choose=(correct:boolean)=>correct?advance(step+1):setMessage('没关系。'+lesson.steps[Math.min(step,1)].help);
 const nextLesson=starterLessons.find(l=>l.id!==lessonId&&!evidencePassed(record.tasks[`starter.${l.id}`]));
 return <section className="blueprint-first" aria-label="第一句话小练习">
  <nav className="blueprint-starter-lessons" aria-label="起步小任务">{starterLessons.map((item,i)=><button key={item.id} aria-pressed={item.id===lessonId} onClick={()=>{setLessonId(item.id);setMessage('')}}>{evidencePassed(record.tasks[`starter.${item.id}`])?<Check size={12}/>:i+1}<span>{item.title}</span></button>)}</nav>
  <div className="blueprint-first-top"><span>每次只练一句 · 随时可以停下</span><span>{Math.min(step,3)} / 3</span></div>
  <div className="blueprint-first-progress" aria-label="小练习进度">{['认懂','跟着选','试着说'].map((label,i)=><span className={step>i?'is-done':''} key={label}>{step>i?<Check size={12}/>:i+1} {label}</span>)}</div>
  {step<3?<>
   <h3>{step<2?lesson.steps[step].title:'看着句子，试着说一次。'}</h3>
   <p className="blueprint-first-english" lang="en">{example.en}</p><p>{example.zh}</p>
   <button className="text-btn" onClick={()=>{speak('spoken' in example?example.spoken:example.en);setMessage('如果没有听到声音，也可以先看句子和中文完成这一小步。')}}><Volume2 size={16}/>听一句示范 · 设备朗读</button>
   {step<2?<div className="blueprint-first-choice"><p>{lesson.steps[step].question}</p>{lesson.steps[step].options.map((label,i)=><button className="btn secondary" key={label} onClick={()=>choose(i===lesson.steps[step].answer)}>{label}</button>)}</div>:<div className="blueprint-first-choice"><p>先照着说，分开说也可以。不需要录音或评分；熟悉后再试着少看提示。</p><button className="btn" onClick={()=>advance(3)}>我试着说过一次了<Check size={15}/></button></div>}
   <p role="status" className="blueprint-first-message">{message||(step===1?'第一步做到了，继续试一个小变化。':step===2?'两个选择都完成了，只剩试着说一句。':'选错可以再试，提示一直都在。')}</p>
  </>:<div className="blueprint-first-win"><Check size={24}/><h3>又完成一个小任务。</h3><p>{lesson.win} 今天停在这里也可以，下次接着来。</p><button className="btn" onClick={()=>{if(nextLesson){setLessonId(nextLesson.id);setMessage('')}else onNext()}}>{nextLesson?`下一小步：${nextLesson.title}`:'接下来：把短句连起来'}<ArrowRight size={14}/></button><button className="text-btn" onClick={()=>advance(0)}>再练一次</button></div>}
 </section>;
}
function Task({node,task,state,update,first}:{node:BlueprintId;task:BlueprintTask;first:boolean}&Props){
 const id=`${node}.${task.id}`,record=readBlueprint(state.drafts[blueprintKey]),evidence=record.tasks[id],note=evidence?.note||'',passed=evidencePassed(evidence);
 const focus=()=>update(s=>updateBlueprint(s,r=>({...r,focus:node})));
 const start=(link:BlueprintLink)=>{update(s=>prepareRoadmapLesson(updateBlueprint(s,r=>({...r,focus:node})),link.route));navigate(link.route)};
 return <details className="blueprint-task" open={first}>
  <summary><span className={`blueprint-check ${passed?'is-passed':''}`}>{passed?<Check size={13}/>:<span/>}</span><strong>{task.title}</strong><small>{passed?node==='starter'?'已练一小步':evidence?.decision==='skip'?'已验证 · 跳过课程':'自查通过':evidence?.decision==='repair'?'再试一次':node==='starter'?'下一小步':'待检验'}</small><ChevronRight size={15}/></summary>
  <div className="blueprint-task-body"><p>{task.work}</p><div className="blueprint-accept"><span>{node==='foundation'?'逐步做到这些，就能继续':'用新任务验收'}</span><p>{task.check}</p></div>
   {task.course&&<button className="btn secondary" onClick={()=>start(task.course!)}>{task.course.label}<ArrowRight size={15}/></button>}
   {task.resources&&<Resources ids={task.resources} onStart={focus}/>}
   {!!task.repair?.length&&<details className="blueprint-repair"><summary>卡在语言上，再取这些材料</summary><div>{task.repair.map(link=><button key={link.label} className="text-btn" onClick={()=>start(link)}>{link.label}<ArrowRight size={14}/></button>)}</div></details>}
   {node==='starter'?<div className="blueprint-evidence"><button className="btn secondary" onClick={()=>update(s=>saveBlueprintEvidence(s,id,'使用者确认照着示范试过一次；这是带提示的练习记录，不代表独立掌握。','passed'))}>{passed?'已记录这次尝试':'我照着示范试过一次了'}<Check size={14}/></button><p className="blueprint-small">试过就记一小步。以后还会回来练，不用现在就说得完美。</p>{passed&&<button className="text-btn" onClick={()=>update(s=>saveBlueprintEvidence(s,id,note,'todo'))}>还想再练这一小步</button>}</div>:<div className="blueprint-evidence"><label className="field">这次检验的依据<textarea rows={2} maxLength={3000} value={note} onChange={e=>update(s=>saveBlueprintEvidence(s,id,e.target.value,'todo'))} placeholder="记下材料 / 题目、表现，以及反馈或仍然卡住的地方。"/></label>
    <div className="blueprint-evidence-actions"><button className="btn secondary" disabled={!note.trim()} onClick={()=>update(s=>saveBlueprintEvidence(s,id,note,'passed'))}>自查通过</button>{node==='foundation'&&<button className="text-btn" disabled={!note.trim()} onClick={()=>update(s=>saveBlueprintEvidence(s,id,note,'skip'))}>已有能力，跳过课程</button>}<button className="text-btn" disabled={!note.trim()} onClick={()=>update(s=>saveBlueprintEvidence(s,id,note,'repair'))}>需要补练</button>{passed&&<button className="text-btn" onClick={()=>update(s=>saveBlueprintEvidence(s,id,note,'todo'))}>撤回通过</button>}</div>
    <p className="blueprint-small" aria-live="polite">{passed?'已保存自查依据；这不是雅思评分。':evidence?.decision==='repair'?'已记录需要补练，修正后用新题再检验。':'记录自动保存；先留下依据，再确认自查结果。'}</p>
   </div>}
  </div>
 </details>;
}
export function IELTSBlueprint({state,update}:Props){
 const route=useRoute(),snapshot=blueprintSnapshot(state),{record,nodes,next,current,mocks,latest,assessed,ready}=snapshot;
 const selected=nodes.find(n=>n.id===(route.node||current))||nodes[0];
 const detailRef=useRef<HTMLElement>(null),focusSelection=useRef(false);
 useEffect(()=>{if(focusSelection.current){focusSelection.current=false;detailRef.current?.focus({preventScroll:true})}},[selected.id]);
 const select=(node:BlueprintId)=>{focusSelection.current=node!==selected.id;navigate({view:'roadmap',node},{keepScroll:true,scrollTarget:window.matchMedia('(max-width:900px)').matches?'blueprint-detail':undefined})};
 const saveDraft=(id:string,text:string)=>update(s=>({...s,drafts:{...s.drafts,[id]:text}}));
 const focus=()=>update(s=>updateBlueprint(s,r=>({...r,focus:selected.id})));
 const selectMinimum=(minimum:string)=>update(s=>{
  const base=updateBlueprint(s,r=>({...r,minimumConfirmed:minimum!==''}));
  return minimum===''?base:{...base,drafts:{...base.drafts,'ielts-readiness':JSON.stringify({...blueprintSnapshot(s).mocks,minimum})}};
 });
 const chooseStart=(entry:'new'|'rusty'|'exam',node:BlueprintId)=>{update(s=>updateBlueprint(s,r=>({...r,entry,focus:node})));select(node)};
 const nextNode=nodes.find(n=>n.id===next)!;
 function MapNode({id}:{id:BlueprintId}){
  const node=nodes.find(n=>n.id===id)!,active=current===id;
  return <button className={`blueprint-node node-${id} ${active?'is-next':''}`} aria-pressed={selected.id===id} aria-current={active?'step':undefined} aria-controls="blueprint-detail" onClick={()=>select(id)}>
   <span className="blueprint-node-top"><strong>{node.title}</strong>{active?<span className="blueprint-here"><MapPin size={11}/>你在这里</span>:node.done?<Check size={15}/>:<ChevronRight size={13}/>}</span><span>{node.short}</span><small>{node.done?(id==='mock'||id==='finish'?'自录模考达到参考':id==='baseline'?'起点已选':id==='starter'?'小步练习完成':'自查通过'):node.tasks.length?`${node.passed} / ${node.tasks.length} ${id==='starter'?'小步已练':'项已自查'}`:id==='finish'?'以完整表现验收':'待验收'}</small>
  </button>;
 }
 const due=dueLearningGoals(state).length+Object.values(state.cards).filter(c=>c.due<=Date.now()).length;
 return <div className="ielts-blueprint">
  <header className="blueprint-heading"><div><span className="eyebrow">IELTS ACADEMIC · LEARNING BLUEPRINT</span><h1>通向 <em>6.5</em> 的学习路线</h1><p>从一句话开始，小步快跑。已会的跳过，需要的拆小再练。</p></div><button className="btn secondary" onClick={()=>select(current)}><LocateFixed size={16}/>回到我的位置</button></header>
  <div className="blueprint-goal-strip"><span><Flag size={16}/><b>Academic · 总分 6.5</b></span><span>{record.minimumConfirmed?(mocks.minimum==='0'?'单项：仅检查总分':`单项：至少 ${Number(mocks.minimum).toFixed(1)}`):'单项要求待确认'}</span><span>教材按需选用 · 不按学完几册算进度</span></div>
  <div className="blueprint-layout">
   <section className="blueprint-map" id="blueprint-map" aria-label="通向雅思 6.5 的完整路线">
    <div className="blueprint-map-title"><GitBranch size={17}/><h2>你的施工图</h2><span>点节点展开</span></div>
    <div className="blueprint-trunk"><MapNode id="baseline"/><span className="blueprint-connector" aria-hidden="true"/><MapNode id="starter"/><span className="blueprint-connector" aria-hidden="true"/><MapNode id="foundation"/><div className="blueprint-junction"><span>四项并行 · 优先修最弱的一项</span></div><div className="blueprint-skill-branches">{(['listening','reading','writing','speaking'] as const).map(id=><MapNode id={id} key={id}/>)}</div><div className="blueprint-junction bottom"><span>合到一起，检验真实表现</span></div><MapNode id="mock"/><span className="blueprint-connector" aria-hidden="true"/><MapNode id="finish"/></div>
    <div className="blueprint-loop"><RotateCcw size={16}/><div><b>复习、反馈、修补贯穿全程</b><span>没通过 → 回对应节点 → 换新题再验收</span></div><button className="text-btn" onClick={()=>navigate({view:'review'})}>复习{due>0?` · ${due}`:''}</button></div>
   </section>
   <section id="blueprint-detail" className="blueprint-detail" aria-label="路线节点详情" key={selected.id} ref={detailRef} tabIndex={-1}>
    <button className="text-btn blueprint-back-map" onClick={()=>navigate({view:'roadmap',node:selected.id},{keepScroll:true,scrollTarget:'blueprint-map'})}><GitBranch size={15}/>返回路线总览</button>
    <div className="blueprint-detail-heading"><span className="eyebrow">{selected.id===current?'当前关卡 · 从这里行动':'查看节点 · 可直接开始'}</span><h2>{selected.title}</h2><p>{selected.goal}</p></div>
    <div className="blueprint-gate"><Flag size={17}/><div><strong>这一关怎样算完成</strong><p>{selected.gate}</p></div></div>
    {selected.id==='baseline'&&<>
     <div className="blueprint-start-choices" aria-label="选择学习起点"><button onClick={()=>chooseStart('new','starter')}><span className="blueprint-start-icon">01</span><span><strong>从第一句话开始</strong><small>零基础也可以。先认一句、换一个词，完成一个小任务。</small></span><ArrowRight size={17}/></button><button onClick={()=>chooseStart('rusty','foundation')}><span className="blueprint-start-icon">02</span><span><strong>会一些词，从短句接着学</strong><small>先试熟悉的表达，再练两三句连起来；已会的可以跳过。</small></span><ArrowRight size={17}/></button><button onClick={()=>chooseStart('exam',snapshot.priority.find(n=>!n.done)?.id||'mock')}><span className="blueprint-start-icon">03</span><span><strong>已有基础，直接练雅思</strong><small>从一个小题或一个回答开始，有成绩再用成绩定位弱项。</small></span><ArrowRight size={17}/></button></div>
     <p className="blueprint-small">选错起点也没关系，可以随时回来换。第一次不需要做整套考试，也不用先准备成绩。</p>
     <details className="blueprint-repair" id="blueprint-requirements" open={route.query==='requirements'}><summary>考试要求：以后确认也可以</summary><label className="field blueprint-minimum">申请要求的单项最低分<select value={record.minimumConfirmed?mocks.minimum:''} onChange={e=>selectMinimum(e.target.value)}><option value="">尚未确认</option><option value="0">已确认只要求总分</option><option value="5.5">每项至少 5.5</option><option value="6">每项至少 6.0</option><option value="6.5">每项至少 6.5</option><option value="7">每项至少 7.0</option></select></label><p className="blueprint-small">不影响现在开始；完整模考验收前再核实接收机构的要求。</p></details>
     {record.entry==='exam'&&<details className="blueprint-repair"><summary>已有备考经验，怎样做四项诊断</summary><p>用没做过的 Academic 材料完成四项，记录题目、时间、错因和口写评阅。已有记录就直接填，不重复做。基础题也很吃力时，随时回到短句节点。</p><Resources ids={['practice','samples','scoring']} onStart={focus}/></details>}
    </>}
    {selected.tasks.length>0&&<>
     {selected.id==='starter'?<FirstSentence state={state} update={update} onNext={()=>select('foundation')}/>:<p className="blueprint-small">一次只做下面一个小任务。先看示范或练一题，感觉顺了再换题自查；卡住可以回去看提示。</p>}
     <div className="blueprint-tasks">{selected.tasks.filter(()=>selected.id!=='starter').map(task=><Task key={task.id} node={selected.id} task={task} state={state} update={update} first={task.id===selected.tasks.find(t=>!evidencePassed(record.tasks[`${selected.id}.${t.id}`]))?.id}/>)}</div>
    </>}
    {selected.id==='mock'&&<>
     {!record.minimumConfirmed&&<div className="blueprint-gate"><div><strong>验收前，确认单项要求</strong><p>它不会阻止你练习。判断是否达到目标时，需要按真实申请要求检查。</p><button className="text-btn" onClick={()=>navigate({view:'roadmap',node:'baseline',query:'requirements'},{scrollTarget:'blueprint-requirements'})}>填写单项要求<ArrowRight size={14}/></button></div></div>}
     <ol className="blueprint-instructions"><li><strong>留下新题，留给验收</strong><p>准备不同的完整 Academic 试卷，包含听力音频与答案、三篇阅读、两个写作任务和三部分口语。练习题与验收卷分开，不用熟题估分。</p></li><li><strong>模拟真实限制</strong><p>按所选考试形式的官方时间完成；不查词、不重播、不看范文。外部机考体验若不计时，自己计时；口语安排模拟对话。</p></li><li><strong>只修影响结果的缺口</strong><p>未达标时，一次挑最主要的问题回专项或语言节点修正。换新题检验，再记录下一次完整模考；保持其他三项的练习。</p></li></ol>
     <Resources ids={['practice','scoring','writing','speaking']} onStart={focus}/>
     {assessed&&<div className="blueprint-priority"><strong>按最近一次自录成绩，优先检查</strong><div>{snapshot.priority.map(node=><button className="text-btn" key={node.id} onClick={()=>select(node.id)}>{node.title}<ArrowRight size={13}/></button>)}</div><p className="blueprint-small">低分优先只是排查顺序，实际练习仍看错因、评分反馈与单项要求。</p></div>}
    </>}
    {selected.id==='finish'&&<div className="blueprint-finish"><span className="blueprint-finish-number">6.5</span><h3>{ready?'最近两次自录模考达到准备度参考':'终点明确，按表现验收'}</h3><p>{ready?'保留完整记录与评阅反馈，按实际申请要求安排正式考试。后续以维持能力和小范围修补为主。':'完成课程或勾选任务不会点亮这个终点。只有符合条件的 Academic 模考记录和已确认的单项要求，才会更新准备度。'}</p><button className="btn" onClick={()=>select(ready?'mock':next)}>查看{ready?'模考依据':nextNode.title}<ArrowRight size={15}/></button></div>}
    {(selected.id==='mock'||selected.id==='baseline'&&(record.entry==='exam'||!!latest))&&<>
     {latest&&<div className="blueprint-latest"><strong>最近一次 Academic 自录成绩 · {latest.date}</strong><p>听 {latest.scores[0]} · 读 {latest.scores[1]} · 写 {latest.scores[2]} · 说 {latest.scores[3]} · 总分 {overallBand(latest.scores.map(Number))??'待核对'}</p><span className="blueprint-small">{assessed?'有完整限时与口写评阅信息':'完整限时、新题或口写评阅信息尚未齐全'}</span></div>}
     <details className="blueprint-mock-records"><summary>已有四项成绩时，再录入或查看<ChevronRight size={16}/></summary><Readiness drafts={state.drafts} saveDraft={saveDraft} kind="academic" readinessOverride={ready} showMinimum={false}/></details>
    </>}
    <div className="blueprint-node-footer"><span>{selected.done?selected.id==='starter'?'起步小任务完成了，可以继续练短句。':'这一组已留下练习依据，可以继续下一步。':'这次完成一小步就可以，下次从这里继续。'}</span>{selected.id!==next&&<button className="text-btn" onClick={()=>select(next)}>回到{nextNode.title}<ArrowRight size={14}/></button>}{selected.done&&selected.id===next&&next==='finish'&&<Check size={16}/>}</div>
   </section>
  </div>
  <details className="blueprint-support"><summary><RotateCcw size={16}/>怎样少学重复内容，把时间用在缺口上<ChevronRight size={16}/></summary><div className="blueprint-support-body"><p><b>一轮只解决一个问题：</b>做新任务 → 找一个主要错误 → 取对应材料 → 修改 → 换新题验收。教材不要求整册刷完，题型检查通过后不继续堆同类练习。</p><p><b>日常保持小循环：</b>先处理到期复习，再做当前薄弱项的一个输出；从错题、阅读和表达中收集少量词块，隔天尝试主动回想。四项轮换维护，避免只练喜欢的一项。</p><p><b>定期检查迁移：</b>专项稳定后做完整限时任务；结果决定是否继续补练。实际用时取决于起点和反馈，本站不把教材数量、勾选或自查换算为雅思分数。</p></div></details>
  <details className="blueprint-support" id="blueprint-materials"><summary><GitBranch size={16}/>补漏材料与当前缺口<ChevronRight size={16}/></summary><div className="blueprint-support-body blueprint-materials"><div><h3>已经接到路线</h3><p>地基与词句补漏复用新概念；专项使用站内起步练习，并连接官方样题、音频、答案与评分标准。新概念第三、四册保留为按需强化。</p><div className="row wrap"><button className="text-btn" onClick={()=>navigate({view:'roadmap',book:'NCE1'})}>打开教材知识图<ArrowRight size={14}/></button><button className="text-btn" onClick={()=>navigate({view:'grammar'})}>按知识点找补课</button></div></div><div><h3>验收前还需要</h3><p><b>新的完整试卷：</b>官方免费样题与机考体验已找到，但不能据此认定有两套独立、完整且未做过的四项试卷。请留出至少两套合法取得的 Academic 验收卷，含音频、答案与口写任务；已有材料可直接提供具体书名、版本和 Test 编号。</p><p><b>口写评阅：</b>需要熟悉 IELTS 标准的老师或机构，给分项反馈并记录来源。本站自查和文字提示不能代替这一步。</p><p><b>单项要求：</b>向接收机构核实后在起点填写；总分 6.5 不自动代表每项都符合要求。</p></div></div></details>
  <p className="blueprint-source-note">课程编排与自查关卡是本站学习建议；考试与评分依据 <a href={blueprintResources.scoring.url} target="_blank" rel="noreferrer">IELTS 官方说明</a>。外部材料入口于 2026-09-30 核对，需要联网；进度保存在当前浏览器，可用顶部「保存进度」备份。</p>
 </div>;
}
