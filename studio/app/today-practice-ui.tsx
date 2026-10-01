import {useEffect,useMemo,useRef,useState} from 'react';
import {ArrowRight} from 'lucide-react';
import {todayPractice,type PracticeTask} from './today-practice';
import type {State} from './model';
import type {Progress} from '../map/model';
import './today-practice.css';

export function TodayPracticeQueue({state,map,ready=true,online=true,compact=false,error=''}:{state:State;map:Progress;ready?:boolean;online?:boolean;compact?:boolean;error?:string}){
 const [clock,setClock]=useState(()=>Date.now());
 useEffect(()=>{const tick=()=>setClock(Date.now()),timer=setInterval(tick,30000);window.addEventListener('focus',tick);return()=>{clearInterval(timer);window.removeEventListener('focus',tick)}},[]);
 useEffect(()=>{setClock(Date.now())},[state,map]);
 const result=useMemo(()=>{try{return {tasks:ready?todayPractice(state,map,clock,online):[],error:''}}catch{return {tasks:[],error:'部分学习记录需要检查，暂时无法推荐下一步；原记录保留。'}}},[state,map,clock,online,ready]);
 return <TodayPractice tasks={result.tasks} ready={ready} compact={compact} catalogueHref={online?'/map/#/courses':'#/library'} error={[error,result.error].filter(Boolean).join(' ')}/>;
}

export function TodayPractice({tasks,ready=true,compact=false,error='',catalogueHref='/map/#/courses'}:{tasks:PracticeTask[];ready?:boolean;compact?:boolean;error?:string;catalogueHref?:string}){
 const [skipped,setSkipped]=useState<string[]>([]),heading=useRef<HTMLHeadingElement>(null);
 const task=tasks.find(t=>!skipped.includes(t.id)),others=tasks.filter(t=>t.id!==task?.id);
 useEffect(()=>{if(skipped.length)heading.current?.focus({preventScroll:true})},[task?.id,skipped.length]);
 if(!ready)return <p className="today-loading" role="status">正在安排今天的下一步…</p>;
 if(!task)return <section className="today-practice" aria-label="今日推荐学习">{error&&<p className="today-error" role="alert">{error}</p>}<article className="today-next"><h2 ref={heading} tabIndex={-1}>{skipped.length?'本次安排已暂缓':'从课程继续学习'}</h2><p>{skipped.length?'原有完成状态与复习时间保留。需要时可以重新安排，或回到课程目录。':'可以从课程目录继续，已有记录保留。'}</p><a className="today-start" href={catalogueHref}>回到课程目录<ArrowRight size={18}/></a>{skipped.length>0&&<button className="today-skip" onClick={()=>setSkipped([])}>恢复推荐顺序</button>}</article></section>;
 return <section className={`today-practice${compact?' today-compact':''}`} aria-label="今日推荐学习">
  {!compact&&<header><span className="today-eyebrow">一步一步，把学过的用起来</span><h1>今日练习</h1><p>先完成眼前这一项，下一步会按实际记录调整。</p></header>}
  {error&&<p className="today-error" role="alert">{error}</p>}
  <article className="today-next">
   <span className="today-eyebrow">{task.kind==='repair'?'先修补这一处':task.kind==='resume'?'接着刚才继续':task.kind==='review'?'今天先回想':task.kind==='new'?'把新词记住':'你的下一步'}</span>
   <h2 ref={heading} tabIndex={-1}>{task.title}</h2>
   <p className="today-reason">{task.reason}</p>
   <p>{task.method}</p>
   <a className="today-start" href={task.href}>继续今日学习<ArrowRight size={18}/></a>
   {task.kind!=='course'&&<button className="today-skip" onClick={()=>setSkipped(s=>[...s,task.id])}>这项稍后再做</button>}
   <details className="today-evidence"><summary>这一步会留下什么记录</summary><p>{task.evidence}</p><p>这是按当前记录给出的建议；打开或跳过都不会增加完成数量。</p></details>
  </article>
  {(others.length>0||skipped.length>0)&&<details className="today-plan"><summary>查看其余安排{others.length?` · ${others.length} 项`:''}</summary><p>默认先补薄弱处，再回想到期内容，最后继续课程。也可以直接调整这一次要做的内容。</p>{others.map(item=><a href={item.href} key={item.id}><span><strong>{item.title}</strong><small>{skipped.includes(item.id)?'本次暂缓 · ':''}{item.reason}</small></span><ArrowRight size={16}/></a>)}{skipped.length>0&&<button className="today-skip" onClick={()=>setSkipped([])}>恢复推荐顺序</button>}</details>}
 </section>;
}
