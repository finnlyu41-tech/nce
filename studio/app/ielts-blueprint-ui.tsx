'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowRight,ArrowLeft,Check,ChevronDown,ChevronRight,Clock3,ExternalLink,Flag,BookOpen,Headphones,MapPin,Mic,PenLine,RotateCcw,Route,Volume2} from 'lucide-react';
import type {State} from './model';
import {isCorrect} from './model';
import {navigate,type StudioRoute} from './navigation';
import {useRoute} from './use-route';
import {Readiness} from './readiness-ui';
import {readBlueprint,blueprintKey,blueprintResources,blueprintSnapshot,updateBlueprint} from './ielts-blueprint';
import {prepareRoadmapLesson} from './learning-roadmap';
import {journeyStages,journeyMissions,missionById,type JourneyMission,type JourneyStage} from './ielts-journey-content';
import {journeySnapshot,readJourney,updateJourney,updateMission,startMission,submitMission,saveAssignment,missionQuestion,missionEvidence,missionRoute,type MissionRecord} from './ielts-journey';
import {speak} from './learning';
import './ielts-blueprint.css';

type Props={state:State;update:(fn:(s:State)=>State)=>void};
const icons={listening:Headphones,reading:BookOpen,writing:PenLine,speaking:Mic};
const stageTitle=(id:string)=>journeyStages.find(s=>s.id===id)?.title||'完整模考';
const stageMission=(state:State,id:JourneyStage)=>journeyMissions.find(m=>m.stage===id&&!missionEvidence(state,m).done)||journeyMissions.find(m=>m.stage===id)!;
function selectMission(mission:JourneyMission){navigate(missionRoute(mission),{scrollTarget:'journey-session'})}

export function BlueprintHome({state}:{state:State}){
 const s=journeySnapshot(state),next=s.next,stage=s.stages.find(x=>x.id===next?.stage);
 return <section className="journey-home" aria-label="下一步学习">
  <div><span className="journey-kicker">{next?'你的下一小步':'完整表现 · 最后验收'}</span><h2>{next?.title||(s.blueprint.ready?'准备好，把能力带进考场':'把四项放到一起检验')}</h2><p>{next?.mini?next.outcome:'沿着目标前进，按反馈补缺口。'}</p><div className="journey-meta"><span><MapPin size={15}/>{stage?.title||'Academic 6.5'}</span>{next&&<span><Clock3 size={15}/>本轮建议 {next.minutes} 分钟</span>}</div></div>
  <button className="btn" onClick={()=>navigate(next?missionRoute(next):{view:'roadmap',node:'mock'})}>{next?.evidence.record.phase==='recall'?'继续刚才的一题':'开始这一步'}<ArrowRight size={17}/></button>
  <div className="journey-home-footer"><span>一句话 → 日常表达 → 一段话 → 听说读写 → 模考</span><button className="text-btn" onClick={()=>navigate({view:'roadmap',query:'map'})}>查看全局路线<Route size={15}/></button></div>
 </section>;
}
export function BlueprintPosition({state}:{state:State}){
 const route=useRoute(),s=journeySnapshot(state),focus=missionById(s.record.focus),evidence=focus?missionEvidence(state,focus):null;
 if(!['nce','ielts','grammar','words','review','quiz','lesson','materials'].includes(route.view)||route.view==='nce'&&!route.lesson)return null;
 const related=focus&&(route.view==='nce'?focus.course?.book===route.book&&focus.course?.lesson===route.lesson:route.view==='ielts'?focus.stage===route.tab:false);
 const target=related&&evidence?.done?s.next:related?focus:s.next;
 return <div className="journey-position"><span><Route size={16}/>{related?`${stageTitle(focus.stage)} · ${focus.title}`:'按需补漏 · 你的主线仍在这里'}</span><button className="text-btn" onClick={()=>navigate(target?missionRoute(target):{view:'roadmap',node:'mock'})}>{related&&evidence?.done?'这一步已有记录，继续路线':'返回我的路线'}<ArrowRight size={15}/></button></div>;
}
export function JourneyReviews({state}:{state:State}){
 const s=journeySnapshot(state);if(!s.due.length)return null;
 return <section className="journey-review-card"><div><span className="journey-kicker">小步复习 · {s.due.length} 项到期</span><h2>{s.due[0].title}</h2><p>换一道题，试试还能不能想起来。需要时再看提示。</p></div><button className="btn secondary" onClick={()=>selectMission(s.due[0])}>巩固这一小步<RotateCcw size={16}/></button></section>;
}
export function JourneyRecords({state}:{state:State}){
 const s=journeySnapshot(state),recent=s.missions.filter(m=>m.evidence.record.startedAt||m.evidence.recorded).sort((a,b)=>Math.max(b.evidence.record.startedAt,b.evidence.record.savedAt,b.evidence.record.attempts.at(-1)?.at||0)-Math.max(a.evidence.record.startedAt,a.evidence.record.savedAt,a.evidence.record.attempts.at(-1)?.at||0)).slice(0,3);
 return <section className="panel journey-records"><div className="section-top"><div><h2>路线中的小收获</h2><p className="muted small">{s.completed} 个小步已有记录 · {s.due.length} 个到期巩固</p></div><button className="text-btn" onClick={()=>navigate(s.next?missionRoute(s.next):{view:'roadmap',node:'mock'})}>接着走<ArrowRight size={16}/></button></div>{recent.map(m=><button className="journey-record-row" key={m.id} onClick={()=>selectMission(m)}><span><strong>{m.title}</strong><small>{m.evidence.status}</small></span><ChevronRight size={16}/></button>)}<p className="journey-fine">记录保留每次练习；需要再巩固，不会抹掉已经走过的小步。</p></section>;
}
function MaterialLink({mission,state,update}:Props&{mission:JourneyMission}){
 if(!mission.course)return null;
 const c=mission.course,route:StudioRoute={view:'nce',book:c.book,lesson:c.lesson,tab:'grammar',goal:c.goal};
 return <details className="journey-help"><summary><BookOpen size={16}/>需要更完整的讲解？<ChevronDown size={15}/></summary><p>这一步卡住时再取用教材。看完对应讲解，回到这里继续当前小题。</p><button className="text-btn" onClick={()=>{update(s=>prepareRoadmapLesson(updateMission(startMission(s,mission.id),mission.id,r=>({...r,hinted:r.phase==='recall'||r.hinted})),route));navigate(route)}}>打开{c.book==='NCE1'?'第一册':'第二册'}第 {c.lesson} 课的对应讲解<ArrowRight size={15}/></button></details>;
}
function Completion({mission,state,update,onNext}:{mission:JourneyMission;onNext:()=>void}&Props){
 const evidence=missionEvidence(state,mission),s=journeySnapshot(state),next=s.next;
 return <div className="journey-win" role="status"><span className="journey-win-icon"><Check size={26}/></span><span className="journey-kicker">{evidence.status}</span><h2>{evidence.due?'隔一段时间，再试一句。':'这一步，你做到了。'}</h2><p>{mission.outcome}</p>{evidence.record.checked&&<div className="journey-saved-answer"><span>刚才留下的答案</span><strong lang="en">{evidence.record.checked}</strong></div>}<p className="journey-fine">{mission.mini?'这是这一题的练习记录。下一次换题回想，逐渐减少提示。':'这是本次练习的记录，口语与写作分数仍需按标准评阅。'}</p>
  {evidence.due&&mission.mini?<button className="btn" onClick={()=>{navigate(missionRoute(mission),{keepScroll:true});update(s=>startMission(s,mission.id,'review'))}}>开始换题复习<RotateCcw size={16}/></button>:<button className="btn" onClick={onNext}>{next?`下一小步：${next.title}`:'进入完整模考'}<ArrowRight size={16}/></button>}
  <div className="journey-win-foot"><span>{evidence.record.dueAt>Date.now()?`${new Date(evidence.record.dueAt).toLocaleDateString('zh-CN',{month:'long',day:'numeric'})} 再巩固`:s.completed+' 个小步已有记录'} · 已保存</span>{mission.mini&&<button className="text-btn" onClick={()=>{navigate(missionRoute(mission),{keepScroll:true});update(s=>startMission(s,mission.id,'review'))}}>再换一题</button>}</div>
 </div>;
}
function MiniSession({mission,state,update,onNext}:Props&{mission:JourneyMission;onNext:()=>void}){
 const m=mission.mini!,evidence=missionEvidence(state,mission),record=evidence.record,phase=record.phase,question=missionQuestion(mission,record)!;
 const [audioNote,setAudioNote]=useState('');
 const patch=(fn:(r:MissionRecord)=>MissionRecord)=>{navigate(missionRoute(mission),{keepScroll:true});update(s=>updateMission(startMission(s,mission.id),mission.id,fn))};
 if(evidence.done&&phase!=='recall'&&phase!=='guided')return <Completion {...{mission,state,update,onNext}}/>;
 const index=['learn','guided','recall'].indexOf(phase),chosen=!!record.choice,choiceOK=record.choice===m.answer,checked=!!record.answer.trim()&&record.checked===record.answer;
 return <>
  <div className="journey-session-heading"><span className="journey-kicker">{stageTitle(mission.stage)} · 本轮建议 {mission.minutes} 分钟</span><h2>{mission.title}</h2><p>{mission.outcome}</p></div>
  <ol className="journey-session-steps" aria-label="本次练习步骤">{['看一个示范','跟着试一次','自己试一次'].map((label,i)=><li key={label} aria-current={i===index?'step':undefined} className={i<index?'done':''}><span>{i<index?<Check size={12}/>:i+1}</span>{label}</li>)}</ol>
  {phase==='learn'&&<div className="journey-exercise"><span className="journey-kicker">先认懂这一句</span><div className="journey-example"><p lang="en">{m.en}</p><p>{m.zh}</p><button className="text-btn" onClick={()=>{speak(m.en);setAudioNote('示范使用设备语音；无声音时可以先看文字完成练习。')}}><Volume2 size={17}/>听示范</button>{audioNote&&<small role="status">{audioNote}</small>}</div><p className="journey-explain">{m.tip}</p><button className="btn full" onClick={()=>patch(r=>({...r,phase:'guided'}))}>跟着试一次<ArrowRight size={17}/></button><button className="text-btn journey-skip" onClick={()=>{navigate(missionRoute(mission),{keepScroll:true});update(s=>startMission(s,mission.id,'check'))}}>这句我会，直接检验</button></div>}
  {phase==='guided'&&<div className="journey-exercise"><span className="journey-kicker">只做一个小变化</span><h3>{m.prompt}</h3><div className="journey-choices">{m.options.map((answer,i)=><button key={answer} aria-pressed={record.choice===answer} className={record.choice===answer?(choiceOK?'correct':'retry'):''} onClick={()=>patch(r=>({...r,choice:answer}))}><span>{String.fromCharCode(65+i)}</span><b>{answer}</b>{record.choice===answer&&choiceOK&&<Check size={17}/>}</button>)}</div>{chosen&&<div className={`journey-feedback ${choiceOK?'success':''}`} role="status"><strong>{choiceOK?'这个小变化，做对了。':'还差一点，看看这一处。'}</strong><p>{choiceOK?m.why:m.tip}</p></div>}{choiceOK?<button className="btn full" onClick={()=>patch(r=>({...r,phase:'recall',answer:'',checked:'',hinted:false}))}>合上示范，自己试一次<ArrowRight size={17}/></button>:<p className="journey-fine">选错可以再试，不扣分、不清空前面的进度。</p>}<button className="text-btn journey-skip" onClick={()=>patch(r=>({...r,phase:'learn'}))}><ArrowLeft size={14}/>回看示范</button></div>}
  {phase==='recall'&&<form className="journey-exercise" onSubmit={e=>{e.preventDefault();navigate(missionRoute(mission),{keepScroll:true});update(s=>submitMission(startMission(s,mission.id),mission.id))}}><span className="journey-kicker">{record.round?'换一道小题，再试试':'现在，试试自己完成'}</span><h3>{question.prompt}</h3><label className="field">填入你的答案<input autoCapitalize="off" autoComplete="off" spellCheck={false} maxLength={100} value={record.answer} onChange={e=>patch(r=>({...r,answer:e.target.value}))} placeholder="一个词或题目要求的答案"/></label><button className="btn full" type="submit" disabled={!record.answer.trim()||checked}>核对答案<ArrowRight size={17}/></button>{checked&&!isCorrect(question,record.answer)&&<div className="journey-feedback" role="status"><strong>先修这一处，再试一次。</strong><p>{question.explanation}</p></div>}<button type="button" className="text-btn journey-skip" onClick={()=>patch(r=>({...r,hinted:true}))}>卡住了，给我一个提示</button>{record.hinted&&!(checked&&!isCorrect(question,record.answer))&&<aside className="journey-feedback"><strong>先借助提示完成也可以</strong><p>{m.tip}</p><p>{question.explanation}</p><p className="journey-fine">本次会记为借助提示；下次换题再自己试。</p></aside>}</form>}
  <MaterialLink {...{mission,state,update}}/>
 </>;
}
function AssignmentSession({mission,state,update,onNext}:Props&{mission:JourneyMission;onNext:()=>void}){
 const task=mission.assignment!,evidence=missionEvidence(state,mission),record=evidence.record;
 const patch=(fn:(r:MissionRecord)=>MissionRecord)=>{navigate(missionRoute(mission),{keepScroll:true});update(s=>updateMission(startMission(s,mission.id),mission.id,fn))};
 const openCourse=()=>{if(!task.course)return;update(s=>prepareRoadmapLesson(startMission(s,mission.id),task.course!.route));navigate(task.course.route)};
 if(evidence.done)return <><Completion {...{mission,state,update,onNext}}/>{!mission.scoreKey&&<button className="text-btn journey-skip" onClick={()=>{navigate(missionRoute(mission),{keepScroll:true});update(s=>updateMission(startMission(s,mission.id),mission.id,r=>({...r,phase:'learn',savedAt:0,reflection:r.reflection||evidence.legacy?.note||''})))}}>修改记录 / 重新练这一项</button>}{evidence.score!==undefined&&<p className="journey-fine">站内短练习：{evidence.score}% · 用来发现问题，不换算雅思分数。</p>}{evidence.legacy?.note&&<details className="journey-help"><summary>以前留下的记录<ChevronDown size={15}/></summary><p>{evidence.legacy.note}</p></details>}<details className="journey-help"><summary>回到本次材料<ChevronDown size={15}/></summary>{task.course&&<button className="text-btn" onClick={openCourse}>{task.course.label}<ArrowRight size={15}/></button>}{task.resources?.map(id=><a key={id} href={blueprintResources[id].url} target="_blank" rel="noreferrer">{blueprintResources[id].title}<ExternalLink size={14}/></a>)}</details></>;
 return <><div className="journey-session-heading"><span className="journey-kicker">{stageTitle(mission.stage)} · 应用到真实任务</span><h2>{mission.title}</h2></div><p className="journey-assignment-intro">{task.work}</p><div className="journey-assignment-start">{task.course&&<button className="btn full" onClick={openCourse}>{task.course.label}<ArrowRight size={16}/></button>}{task.resources?.map((id,i)=><a className={i===0&&!task.course?'journey-resource primary':'journey-resource'} key={id} href={blueprintResources[id].url} target="_blank" rel="noreferrer" onClick={()=>update(s=>startMission(s,mission.id))}><span>{blueprintResources[id].title}</span><ExternalLink size={15}/></a>)}</div>
 {mission.scoreKey&&<div className="journey-auto-note"><Check size={15}/><span>站内这组练习做完后，结果会自动回到路线。</span></div>}
 {!!evidence.written&&<div className="journey-auto-note"><PenLine size={15}/><span>已找到你的写作草稿 · {evidence.written} 词。继续原稿，按反馈修改。</span></div>}
 <details className="journey-help"><summary>做到什么程度，再继续？<ChevronDown size={15}/></summary><p>{task.check}</p></details>
 {!mission.scoreKey&&<div className="journey-assignment-record"><h3>练完后，只留下这两件事</h3><p className="journey-fine">用于接着练，记录本身不代表达标。外部练习无法自动读取。</p><label className="field">做了哪道题 / 哪份材料？<input maxLength={6000} value={record.artifact} onChange={e=>patch(r=>({...r,artifact:e.target.value,savedAt:0}))} placeholder="具体题目、Test 编号，或作品存放位置"/></label><label className="field">下一次先修哪一个问题？<textarea rows={2} maxLength={3000} value={record.reflection} onChange={e=>patch(r=>({...r,reflection:e.target.value,savedAt:0}))} placeholder="例如：图表没有概括趋势；重写概括句后换题检验"/></label><button className="btn full" disabled={!record.artifact.trim()||!record.reflection.trim()} onClick={()=>update(s=>saveAssignment(s,mission.id))}>保存这次练习，继续下一步<ArrowRight size={16}/></button></div>}
 {!!task.repair?.length&&<details className="journey-help"><summary>卡在词句上，补这一处<ChevronDown size={15}/></summary>{task.repair.map(link=><button className="text-btn" key={link.label} onClick={()=>{update(s=>prepareRoadmapLesson(startMission(s,mission.id),link.route));navigate(link.route)}}>{link.label}<ArrowRight size={14}/></button>)}</details>}
 </>;
}
function MockSession({state,update}:Props){
 const bp=blueprintSnapshot(state),record=readBlueprint(state.drafts[blueprintKey]);
 const selectMinimum=(minimum:string)=>update(s=>{const base=updateBlueprint(s,r=>({...r,minimumConfirmed:minimum!==''}));return minimum===''?base:{...base,drafts:{...base.drafts,'ielts-readiness':JSON.stringify({...blueprintSnapshot(s).mocks,minimum})}}});
 return <><div className="journey-session-heading"><span className="journey-kicker">最后一段 · 从练习走向稳定表现</span><h2>{bp.ready?'完整表现已经达到准备度参考':'用完整模考，决定还要补哪里'}</h2><p>两次不同的新 Academic 完整限时试卷，加上口语、写作评阅。</p></div><div className="journey-mock-steps"><div><span>1</span><strong>留两套没做过的题</strong><p>完整四项，包含听力音频和答案。</p></div><div><span>2</span><strong>限时完成并取得反馈</strong><p>口语、写作按官方标准请人评阅。</p></div><div><span>3</span><strong>只修这次暴露的缺口</strong><p>总分 6.5，并满足接收机构的单项要求。</p></div></div>
 <label className="field" id="journey-requirements">单项最低分要求<select value={record.minimumConfirmed?bp.mocks.minimum:''} onChange={e=>selectMinimum(e.target.value)}><option value="">还没确认</option><option value="0">已确认只要求总分</option><option value="5.5">每项至少 5.5</option><option value="6">每项至少 6.0</option><option value="6.5">每项至少 6.5</option><option value="7">每项至少 7.0</option></select></label>
 <Readiness drafts={state.drafts} saveDraft={(id,text)=>update(s=>({...s,drafts:{...s.drafts,[id]:text}}))} kind="academic" readinessOverride={bp.ready} showMinimum={false}/>
 {!!bp.latest&&<div className="journey-auto-note"><Flag size={16}/><div><b>下一轮优先检查 {stageTitle(bp.priority[0].id)}</b><p>以错因和评阅反馈为准，其他三项继续少量维护。</p><button className="text-btn" onClick={()=>selectMission(stageMission(state,bp.priority[0].id as JourneyStage))}>去修这一项<ArrowRight size={14}/></button></div></div>}
 <p className="journey-fine">模考是自录证据，正式结果以 IELTS 成绩单为准。练习数量不会换算成雅思分数。</p></>;
}
export function IELTSBlueprint({state,update}:Props){
 const route=useRoute(),s=journeySnapshot(state),mock=route.node==='mock'||route.node==='finish'||!route.node&&!route.mission&&!s.next;
 const selected=missionById(route.mission)||(journeyStages.some(x=>x.id===route.node)?stageMission(state,route.node as JourneyStage):undefined)||s.next||journeyMissions[0];
 const evidence=missionEvidence(state,selected),stage=s.stages.find(x=>x.id===selected.stage)!,position=stage.missions.findIndex(m=>m.id===selected.id)+1;
 const sessionRef=useRef<HTMLElement>(null),[mapOpen,setMapOpen]=useState(()=>window.matchMedia('(min-width:1000px)').matches||route.query==='map');
 useEffect(()=>{if(route.query==='map')setMapOpen(true)},[route.query]);
 useEffect(()=>{const query=window.matchMedia('(min-width:1000px)'),change=(event:MediaQueryListEvent)=>setMapOpen(event.matches);query.addEventListener('change',change);return ()=>query.removeEventListener('change',change)},[]);
 useEffect(()=>{if(route.mission)sessionRef.current?.focus({preventScroll:true})},[route.mission]);
 const goNext=()=>{if(s.next){update(st=>startMission(st,s.next!.id));selectMission(s.next)}else navigate({view:'roadmap',node:'mock'},{scrollTarget:'journey-session'})};
 const pick=(id:JourneyStage)=>{const m=stageMission(state,id);if(window.matchMedia('(max-width:999px)').matches)setMapOpen(false);selectMission(m)};
 const actual=s.next||selected;
 const StageNode=({id}:{id:JourneyStage})=>{const st=s.stages.find(x=>x.id===id)!,Icon=id in icons?icons[id as keyof typeof icons]:null;return <button className={`journey-map-node ${s.next?.stage===id?'current':''}`} aria-current={s.next?.stage===id?'step':undefined} aria-pressed={!mock&&selected.stage===id} onClick={()=>pick(id)}><span className="journey-map-marker">{st.done===st.missions.length?<Check size={15}/>:Icon?<Icon size={17}/>:st.level}</span><span><strong>{st.title}</strong><small>{st.outcome}</small></span><span className="journey-map-count">{st.done}/{st.missions.length}</span><ChevronRight size={15}/></button>};
 return <div className="ielts-journey">
  <header className="journey-heading"><div><span className="journey-kicker">IELTS ACADEMIC <span className="journey-target">目标 6.5</span></span><h1>每一小步，都知道为什么。</h1></div><button className="text-btn" onClick={()=>navigate(s.next?missionRoute(s.next):{view:'roadmap',node:'mock'},{scrollTarget:'journey-session'})}><MapPin size={15}/>回到我的位置</button></header>
  <div className="journey-layout">
   <details className="journey-map" open={mapOpen} onToggle={e=>setMapOpen(e.currentTarget.open)}>
    <summary><Route size={19}/><span><b>我的路线</b><small>{s.blueprint.ready?'完整模考达到准备度参考':`当前位置：${stageTitle(actual.stage)} · ${actual.title}`}</small></span><ChevronDown size={17}/></summary>
    <div className="journey-map-body"><p className="journey-map-caption">按能力前进，材料只在需要时取用。</p><div className="journey-map-trunk"><StageNode id="starter"/><StageNode id="foundation"/><StageNode id="bridge"/></div><div className="journey-map-branch-label">四项并行 · 按错因选最需要的一项</div><div className="journey-map-branches">{(['listening','reading','writing','speaking'] as const).map(id=><StageNode key={id} id={id}/>)}</div><button className={`journey-map-finish ${mock?'selected':''}`} aria-pressed={mock} onClick={()=>{if(window.matchMedia('(max-width:999px)').matches)setMapOpen(false);navigate({view:'roadmap',node:'mock'},{scrollTarget:'journey-session'})}}><Flag size={18}/><span><strong>完整模考与修补</strong><small>{s.blueprint.ready?'达到准备度参考':'用真实表现检验 6.5'}</small></span><ChevronRight size={16}/></button><div className="journey-map-legend"><span><i/> 当前阶段</span><span><Check size={13}/> 有练习记录</span></div><p className="journey-fine">这里显示练习进度，不是分数进度。复习与反馈贯穿每一段。</p></div>
   </details>
   <div className="journey-main">
    <div className="journey-location"><span>{mock?'05 · 完整模考':`${stage.level} · ${stage.title}`}</span>{!mock&&<b>第 {position} / {stage.missions.length} 小步</b>}<span className="journey-location-line"/></div>
    {!mock&&s.next&&selected.id!==s.next.id&&!evidence.done&&<div className="journey-browsing">正在查看这一步，可以直接开始。<button className="text-btn" onClick={()=>selectMission(s.next!)}>回到当前任务</button></div>}
    <section className="journey-session" id="journey-session" ref={sessionRef} tabIndex={-1} aria-label={mock?'完整模考验收':'当前小步练习'} key={mock?'mock':selected.id}>
     {mock?<MockSession {...{state,update}}/>:selected.mini?<MiniSession mission={selected} {...{state,update}} onNext={goNext}/>:<AssignmentSession mission={selected} {...{state,update}} onNext={goNext}/>}
    </section>
    {!mock&&<details className="journey-chapter"><summary><span>{stage.title} · 这一段练什么</span><b>{stage.done}/{stage.missions.length}</b><ChevronDown size={16}/></summary><ol>{stage.missions.map((m,i)=><li key={m.id}><button aria-current={m.id===selected.id?'step':undefined} onClick={()=>selectMission(m)}><span className={m.evidence.recorded?'done':''}>{m.evidence.recorded?<Check size={14}/>:String(i+1).padStart(2,'0')}</span><div><strong>{m.title}</strong><small>{m.evidence.status}{m.evidence.due?' · 到期巩固':''}</small></div><ChevronRight size={15}/></button></li>)}</ol></details>}
    {s.due.length>0&&<div className="journey-due"><RotateCcw size={17}/><span>{s.due.length} 个小步到期，先巩固一个也很好。</span><button className="text-btn" onClick={()=>selectMission(s.due[0])}>去巩固</button></div>}
   </div>
  </div>
  <footer className="journey-tools">
   <details><summary>已有基础？调整起点<ChevronDown size={15}/></summary><p>从适合自己的地方开始。以前的记录保留；未练的内容仍可随时补上。</p><div className="journey-start-options">{(['starter','foundation','bridge','listening'] as const).map(id=><button className="btn secondary" key={id} onClick={()=>{const m=stageMission(state,id);update(st=>updateJourney(st,r=>({...r,startAt:id,focus:m.id})));selectMission(m)}}>{id==='listening'?'直接进入雅思专项':stageTitle(id)}<ArrowRight size={14}/></button>)}</div></details>
   <details><summary>教材与补漏材料<ChevronDown size={15}/></summary><p>新概念四册按需选用。当前小步内有对应讲解入口，没必要为了进度刷完全部材料。</p><div className="journey-resource-row"><button className="text-btn" onClick={()=>navigate({view:'roadmap',book:'NCE1'})}>教材知识图<BookOpen size={15}/></button><button className="text-btn" onClick={()=>navigate({view:'grammar'})}>按知识点查讲解</button><button className="text-btn" onClick={()=>navigate({view:'review'})}>到期复习<RotateCcw size={15}/></button></div></details>
   <details><summary>模考前要准备的材料<ChevronDown size={15}/></summary><p>留出至少两套合法取得、没做过的完整 Academic 试卷（含音频、答案与口写任务），安排熟悉 IELTS 标准的人评阅口语与写作。免费样题适合练题型，不能直接当作两套完整验收卷。</p><div className="journey-resource-row">{['samples','practice','writing','speaking'].map(id=><a key={id} href={blueprintResources[id].url} target="_blank" rel="noreferrer">{blueprintResources[id].title}<ExternalLink size={14}/></a>)}</div></details>
   <p className="journey-fine">小步编排是本站学习建议，按实际表现调整；考试与评分依据 <a href={blueprintResources.scoring.url} target="_blank" rel="noreferrer">IELTS 官方说明</a>。进度保存在当前浏览器，可用顶部「保存进度」备份。</p>
  </footer>
 </div>;
}
