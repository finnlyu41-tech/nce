import {StageEntry} from '../stage-assessment/host';
import {useEffect,useMemo,useRef,useState} from 'react';
import {ArrowRight} from 'lucide-react';
import {todayPractice,type PracticeTask} from './today-practice';
import {courseDestination} from './course-loop-next';
import {capabilityReviewStorageKey,includeCapabilityPractice,readCapabilityPractice,type CapabilityPractice} from './capability-review-next';
import type {State} from './model';
import type {Progress} from '../map/model';
import './today-practice.css';

export function TodayPracticeQueue({state,map,ready=true,online=true,compact=false,error=''}:{state:State;map:Progress;ready?:boolean;online?:boolean;compact?:boolean;error?:string}){
 const [clock,setClock]=useState(()=>Date.now());
 const [refresh,setRefresh]=useState(0),[capability,setCapability]=useState<CapabilityPractice&{ready:boolean}>({tasks:[],error:'',ready:!online});
 useEffect(()=>{const tick=()=>{setClock(Date.now());setRefresh(value=>value+1)},storage=(event:StorageEvent)=>{if(event.key===null||event.key===capabilityReviewStorageKey)tick()},timer=setInterval(tick,30000);window.addEventListener('focus',tick);window.addEventListener('pageshow',tick);window.addEventListener('storage',storage);window.addEventListener('english-studio-progress-restored',tick);return()=>{clearInterval(timer);window.removeEventListener('focus',tick);window.removeEventListener('pageshow',tick);window.removeEventListener('storage',storage);window.removeEventListener('english-studio-progress-restored',tick)}},[]);
 useEffect(()=>{setClock(Date.now())},[state,map]);
 useEffect(()=>{let active=true;if(!ready)return;void readCapabilityPractice(clock,online).then(value=>{if(active)setCapability({...value,ready:true})});return()=>{active=false}},[clock,refresh,online,ready]);
 const result=useMemo(()=>{try{const tasks=ready?todayPractice(state,map,clock,online):[];return {tasks,courseHref:ready&&online?courseDestination(state,map,clock).href:tasks.find(task=>task.id.startsWith('course:'))?.href,error:''}}catch{return {tasks:[],courseHref:undefined,error:'部分学习记录需要检查，暂时无法推荐下一步；原记录保留。'}}},[state,map,clock,online,ready]);
 return <><TodayPractice tasks={includeCapabilityPractice(result.tasks,online?capability.tasks:[])} ready={ready&&(!online||capability.ready)} compact={compact} courseHref={result.courseHref} catalogueHref={online?'/map/#/courses':'#/library'} error={[error,result.error,online&&capability.error].filter(Boolean).join(' ')}/>{online&&capability.error&&<a href="/demos/yesterday/">检查句子练习的保存状态</a>}<StageEntry/></>;
}

export function TodayPractice({tasks,ready=true,compact=false,error='',catalogueHref='/map/#/courses',courseHref}:{tasks:PracticeTask[];ready?:boolean;compact?:boolean;error?:string;catalogueHref?:string;courseHref?:string}){
 const [skipped,setSkipped]=useState<string[]>([]),heading=useRef<HTMLHeadingElement>(null);
 const task=tasks.find(t=>!skipped.includes(t.id)),others=tasks.filter(t=>t.id!==task?.id),optionalPlacement=task?.id==='placement:offer';
 useEffect(()=>{if(skipped.length)heading.current?.focus({preventScroll:true})},[task?.id,skipped.length]);
 if(!ready)return <p className="today-loading" role="status">正在安排今天的下一步…</p>;
 if(!task)return <section className="today-practice" aria-label="今日推荐学习">{error&&<p className="today-error" role="alert">{error}</p>}<article className="today-next"><h2 ref={heading} tabIndex={-1}>{skipped.length?'本次安排已暂缓':'从课程继续学习'}</h2><p>{skipped.length?'这次先不安排这些练习。完成状态与复习时间不变；需要时可以恢复推荐。':'可以从课程目录继续，已有记录保留。'}</p><a className="today-start" href={courseHref||catalogueHref}>{courseHref?'回到当前课程':'回到课程目录'}<ArrowRight size={18}/></a>{skipped.length>0&&<button className="today-skip" onClick={()=>setSkipped([])}>恢复推荐顺序</button>}</article></section>;
 return <section className={`today-practice${compact?' today-compact':''}`} aria-label="今日推荐学习">
  {!compact&&<header><span className="today-eyebrow">一步一步，把学过的用起来</span><h1>今日练习</h1><p>先完成眼前这一项，下一步会按实际记录调整。</p></header>}
  {error&&<p className="today-error" role="alert">{error}</p>}
  <article className="today-next">
   <span className="today-eyebrow">{optionalPlacement?'可选诊断':task.kind==='repair'?'先修补这一处':task.kind==='resume'?'接着刚才继续':task.kind==='review'?'今天先回想':task.kind==='new'?'把新词记住':'你的下一步'}</span>
   <h2 ref={heading} tabIndex={-1}>{task.title}</h2>
   <p className="today-reason">{task.reason}</p>
   {task.kind!=='resume'&&<p className="today-method">{task.method}</p>}
   <p className="today-evidence">{task.evidence}</p>
   <div className="today-actions">
   <a className="today-start" href={task.href}>{optionalPlacement?'做短诊断（可选）':'继续今日学习'}<ArrowRight size={18}/></a>
   {(task.kind!=='course'||optionalPlacement)&&<button className="today-skip" onClick={()=>setSkipped(s=>[...s,task.id])}>这项稍后再做</button>}
   </div>
  </article>
  {(others.length>0||skipped.length>0)&&<section className="today-plan" aria-label="其他学习安排"><h3>其他安排{others.length?` · ${others.length} 项`:''}</h3>{others.map(item=><a href={item.href} key={item.id}><span><strong>{item.title}</strong><small>{skipped.includes(item.id)?'本次暂缓 · ':''}{item.reason}</small></span><ArrowRight size={16}/></a>)}{skipped.length>0&&<button className="today-skip" onClick={()=>setSkipped([])}>恢复推荐顺序</button>}</section>}
 </section>;
}
