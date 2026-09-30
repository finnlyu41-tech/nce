'use client';
import {useEffect,useMemo,useRef} from 'react';
import {ArrowRight,Check,ChevronRight,GitBranch,MapPin} from 'lucide-react';
import type {NceBookId,State} from './model';
import {navigate,type StudioRoute} from './navigation';
import {useRoute} from './use-route';
import {bookNames,studyUnit} from './study-path';
import {emptyGoal,goalStatus} from './learning-plan';
import {grammarCategories} from './textbook-grammar';
import {prepareRoadmapLesson,roadmapActiveStep,roadmapCurrent,roadmapGoalSteps,roadmapSnapshot,roadmapStatusLabels,roadmapSteps,roadmapUnit,type RoadmapStatus} from './learning-roadmap';
import './learning-roadmap.css';
import {BlueprintHome,IELTSBlueprint} from './ielts-blueprint-ui';

type Props={state:State;update:(fn:(s:State)=>State)=>void};
function Status({status}:{status:RoadmapStatus}){return <span className={`roadmap-status is-${status}`}><i aria-hidden="true"/>{roadmapStatusLabels[status]}</span>}
// Looking at a solution through the map has the same hint boundary as practice's
// own “back to model” button. Navigation never writes a completion record.
function openStep(route:StudioRoute,update:Props['update'],from?:StudioRoute){
 update(state=>prepareRoadmapLesson(state,route,from));navigate(route);
}
function BookBranches({state,selected,onSelect,compact=false}:{state:State;selected?:NceBookId;onSelect:(book:NceBookId)=>void;compact?:boolean}){
 const day=new Date().toDateString(),books=useMemo(()=>roadmapSnapshot(state),[state,day]),current=roadmapCurrent(state);
 return <div className={`roadmap-books ${compact?'is-compact':''}`} aria-label="四册学习阶段">{books.map((book,i)=><button key={book.id} className={`roadmap-book book-${i+1}`} aria-pressed={selected===book.id} onClick={()=>onSelect(book.id)}>
  <span className="roadmap-book-head"><span>{String(i+1).padStart(2,'0')} · {bookNames[book.id]}{i>=2?' · 选学':''}</span>{current.book===book.id&&<span className="roadmap-you"><MapPin size={12}/>当前</span>}</span>
  <strong>{book.title}</strong><span className="roadmap-book-description">{book.description}</span>
  <span className="roadmap-meter" role="progressbar" aria-label={`${bookNames[book.id]}本轮练习记录`} aria-valuemin={0} aria-valuemax={book.entries.length} aria-valuenow={book.practiced}><span style={{width:`${book.practiced/book.entries.length*100}%`}}/></span>
  <span className="roadmap-book-foot">{book.practiced} / {book.entries.length} 组本轮已练{!compact&&book.due>0&&<span> · {book.due} 待复习</span>}<ChevronRight size={14}/></span>
 </button>)}</div>;
}
export function RoadmapHome({state}:{state:State}){return <BlueprintHome state={state}/>}
export function RoadmapPlan(){return <div className="blueprint-plan-link"><p>Academic 6.5：从一句话起步，逐步练短文和听说读写，再用完整表现验收。课程按缺口选用，已会的可以跳过。</p><button className="text-btn" onClick={()=>navigate({view:'roadmap'})}>打开统一学习路线<ArrowRight size={16}/></button></div>}
export function LearningRoadmap(props:Props){const route=useRoute();return route.book?<LearningMaterialsMap {...props}/>:<IELTSBlueprint {...props}/>}
export function LessonPosition({state,update,book,lesson}:{book:NceBookId;lesson:number}&Props){
 const route=useRoute(),active=roadmapActiveStep(route,state),unit=roadmapUnit(state,book,lesson);
 const steps=roadmapGoalSteps(state,book,lesson,route.goal),category=grammarCategories.find(c=>c.id===unit.entry.category);
 return <section className="lesson-position" aria-label="当前学习位置">
  <div className="lesson-position-heading"><button className="text-btn" onClick={()=>navigate({view:'roadmap',book,lesson})}><GitBranch size={16}/>教材知识图<ChevronRight size={14}/></button><span>{bookNames[book]} · {unit.unit.label}<span className="lesson-position-topic"> · {category?.title}</span></span></div>
  <nav className="roadmap-step-rail" aria-label="本课学习路线">{steps.map((step,i)=><button key={step.id} aria-current={active===step.id?'step':undefined} onClick={()=>openStep(step.route,update,route)} title={step.detail}><span className={'roadmap-step-dot '+(step.done?'is-done':'')}>{step.done?<Check size={13}/>:i+1}</span><span>{step.label}</span></button>)}</nav>
  <p className="lesson-position-now" aria-live="polite"><MapPin size={13}/>你在这里：{roadmapSteps.find(s=>s.id===active)?.label}<span> · {steps.find(s=>s.id===active)?.detail}</span></p>
 </section>;
}
function LearningMaterialsMap({state,update}:Props){
 const route=useRoute(),current=roadmapCurrent(state),day=new Date().toDateString(),books=useMemo(()=>roadmapSnapshot(state),[state,day]);
 const book=books.find(b=>b.id===(route.book||current.book))!,bookId=book.id;
 const selected=roadmapUnit(state,bookId,route.lesson||(bookId===current.book?current.lesson:1));
 const topic=book.topics.find(t=>t.id===(route.category||selected.entry.category))||book.topics[0];
 const query=(route.query||'').trim().toLowerCase();
 const shown=query?book.entries.filter(u=>`${u.entry.lesson} ${u.entry.lastLesson} ${u.entry.title} ${u.summary.goals.map(g=>`${g.title} ${g.idea}`).join(' ')}`.toLowerCase().includes(query)):topic.entries;
 const goals=selected.summary.goals,guide=goals.find(g=>g.id===(route.goal||selected.summary.record.goal))||goals[0],goal=selected.summary.record.goals[guide.id]||emptyGoal();
 const currentUnit=studyUnit(current.book,current.lesson),isCurrent=selected.unit.key===currentUnit.key;
 const steps=roadmapGoalSteps(state,bookId,selected.unit.first,guide.id),currentStep=isCurrent?current.step:undefined;
 const detailRef=useRef<HTMLDivElement>(null),nodeRef=useRef<HTMLButtonElement>(null),focusSelection=useRef(false);
 useEffect(()=>{const node=nodeRef.current,container=node?.parentElement;if(node&&container)container.scrollTop+=node.getBoundingClientRect().top-container.getBoundingClientRect().top},[bookId,topic.id,selected.unit.key]);
 useEffect(()=>{if(focusSelection.current){focusSelection.current=false;detailRef.current?.focus({preventScroll:true});detailRef.current?.scrollIntoView({block:'nearest',behavior:'instant'})}},[selected.unit.key]);
 function selectLesson(lesson:number){focusSelection.current=true;navigate({view:'roadmap',book:bookId,lesson,query:route.query},{keepScroll:true})}
 const started=books.reduce((sum,b)=>sum+b.started,0),practiced=books.reduce((sum,b)=>sum+b.practiced,0);
 return <div className="learning-roadmap">
  <div className="page-heading"><div><span className="eyebrow">SUPPORTING MATERIALS</span><h1>教材补漏知识图</h1><p>遇到具体问题时来取材，课程数量不计入雅思 6.5 的主线进度。</p></div><button className="btn secondary" onClick={()=>navigate({view:'roadmap'})}><GitBranch size={17}/>返回 6.5 路线</button></div>
  <section className="panel roadmap-canvas" aria-label="可展开的知识地图">
   <div className="roadmap-root"><GitBranch size={24}/><div><strong>按需检索四册材料</strong><span>{started} 组留下记录 · {practiced} / 276 组本轮已练</span></div></div>
   <BookBranches state={state} selected={bookId} onSelect={book=>navigate({view:'roadmap',book},{keepScroll:true})}/>
   <div className="roadmap-branch" id="roadmap-branch">
    <div className="roadmap-branch-heading"><div><span className="eyebrow">{bookNames[bookId]} · {book.entries.length} 组课程</span><h2>{book.title}</h2><p>{book.outcome}</p></div><button className="text-btn" onClick={()=>navigate({view:'nce',book:bookId})}>按课号顺序学<ArrowRight size={15}/></button></div>
    <p className="roadmap-caption">下面按教材的主要知识主题分支；同一用法会在不同课反复练习。</p>
    <div className="roadmap-topics" aria-label={`${bookNames[bookId]}的知识分支`}>{book.topics.map(t=><button key={t.id} aria-pressed={!query&&topic.id===t.id} aria-controls="roadmap-lessons" onClick={()=>navigate({view:'roadmap',book:bookId,lesson:t.entries.find(u=>u.unit.key===currentUnit.key)?.unit.first||t.entries[0].unit.first,category:t.id},{keepScroll:true})}><span>{t.title}</span><small>{t.entries.length} 组{t.entries.some(u=>u.status==='due')?' · 待复习':''}</small></button>)}</div>
    <div className="roadmap-explorer">
     <section className="roadmap-lesson-list" id="roadmap-lessons" aria-label="分支课次">
      <label className="roadmap-search"><span>查找本册课号或知识点</span><input value={route.query||''} placeholder="例如：99、宾语从句" onChange={e=>navigate({...route,view:'roadmap',book:bookId,query:e.target.value},{replace:true,keepScroll:true})}/></label>
      <div className="roadmap-list-heading"><strong>{query?'搜索结果':topic.title}</strong><span>{shown.length} 组</span></div>
      <div className="roadmap-lesson-scroll">{shown.map(u=><button key={u.unit.key} ref={u.unit.key===selected.unit.key?nodeRef:undefined} className="roadmap-lesson-node" aria-pressed={u.unit.key===selected.unit.key} onClick={()=>selectLesson(u.unit.first)}><span className="roadmap-node-top"><b>{u.unit.label}</b>{u.unit.key===currentUnit.key&&<span className="roadmap-you"><MapPin size={12}/>你在这里</span>}</span><strong>{u.entry.title}</strong><Status status={u.status}/></button>)}{!shown.length&&<p className="roadmap-empty">没有找到相关内容。试试课号，或换一个知识点名称。</p>}</div>
     </section>
     <div className="roadmap-lesson-detail" ref={detailRef} tabIndex={-1} aria-label={`${selected.unit.label}的学习步骤`}>
      <div className="roadmap-detail-heading"><span className="eyebrow">{bookNames[bookId]} · {selected.unit.label}</span><Status status={selected.status}/></div><h2>{selected.entry.title}</h2>
      <p className="roadmap-caption">{selected.unit.book==='NCE1'?'课文与配套句型共用一组记录。':'每课一组，沿教材学习。'}选一个用法，查看要走的步骤。</p>
      <div className="roadmap-goals" aria-label="本课用法">{goals.map(g=><button key={g.id} aria-pressed={g.id===guide.id} onClick={()=>navigate({...route,view:'roadmap',book:bookId,lesson:selected.unit.first,goal:g.id},{keepScroll:true})}>{g.title}</button>)}</div>
      <p className="roadmap-goal-status">这个用法：{goalStatus(goal)}</p>
      <ol className="roadmap-detail-steps">{steps.map((step,i)=><li key={step.id}><button aria-current={currentStep===step.id&&current.goal===guide.id?'step':undefined} onClick={()=>openStep(step.route,update)}><span className={'roadmap-step-dot '+(step.done?'is-done':'')}>{step.done?<Check size={15}/>:i+1}</span><span><strong>{step.label}</strong><small>{step.detail}</small></span><ChevronRight size={16}/></button></li>)}</ol>
      <p className="roadmap-evidence-note">浏览节点不会完成任务。看懂需自己判断；自由表达仍待核对；间隔检验需不同日期、不同题目独立核对通过。</p>
     </div>
    </div>
   </div>
  </section>
  <p className="roadmap-caption">进度来自当前浏览器，可用顶部「保存进度」备份与接续。旧的完成勾选保留为旧记录，不换算成独立核对或掌握。</p>
 </div>;
}
