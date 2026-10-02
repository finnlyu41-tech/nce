'use client';
import {useState} from 'react';
import type {State} from '../app/model';
import {placementManifest} from './manifest';
import {placementKey,readPlacement,placementTransition,placementRecommendation,currentEvidence,freshPoolAvailable,type PlacementAction} from './model';
import {applyPlacement} from './adapter';
import './placement.css';
export type PlacementProps={state:State;update:(fn:(s:State)=>State)=>void;ready?:boolean;error?:string;continueHref:string;trialHref?:string};
/** Host retains ownership of durable save status and navigation. */
export function Placement({state,update,ready=true,error='',continueHref,trialHref}:PlacementProps){
 const raw=state.drafts[placementKey],read=readPlacement(raw);
 const [issue,setIssue]=useState('');
 function act(action:PlacementAction){
  const next=placementTransition(raw,action);
  if(next.status==='blocked'){setIssue(next.reason);return}
  setIssue('');update(s=>applyPlacement(s,raw,action));
 }
 const continuity=<a className="btn secondary" href={continueHref}>继续当前学习进度</a>;
 if(!ready)return <section className="panel placement" role="status">正在读取现有学习记录…{continuity}</section>;
 if(error||read.status==='blocked')return <section className="panel placement"><h1>诊断记录需要核对</h1><p role="alert">{error|| (read.status==='blocked'?read.reason:'')}</p><p>原始记录保留。请从学习记录页备份后核对，当前路线仍可继续。</p>{continuity}</section>;
 const {view}=read,run=view.run,q=view.question,item=currentEvidence(view),result=placementRecommendation(view);
 const start=()=>act({type:'start'});
 return <section className="panel placement" aria-label="短诊断与试学起点">
  <header><span className="eyebrow">找到可以试的一小步</span><h1>先做几题，选一个起点</h1><p>最多 6 题，先从短句开始。遇到困难可看提示、跳过或暂停；按实际情况记录即可。</p><p className="placement-limits">{placementManifest.limits} 题目难度尚待真人验证。</p></header>
  {issue&&<p role="alert">{issue}</p>}
  {!run?<><p>原有学习路线和进度保留。诊断只给一个保守试学建议，可以继续原来的位置。</p><button className="btn" onClick={start}>开始短诊断</button>{continuity}</>:run.phase==='paused'?<><h2>这次诊断已暂停</h2><p>已见题、帮助和输入都在原记录中；继续时不会把它们重新当成未见题。</p><button className="btn" onClick={()=>act({type:'resume'})}>继续已保存的一题</button>{continuity}</>:run.phase==='complete'?<>
   <h2>建议从这里试一小步</h2><h3>{result.entry.label}</h3><p>依据是本轮已核对的局部文字任务。试学时如需帮助，先补相应内容；这个建议不证明你已掌握整册或任何完整技能。</p>
   <ul>{placementManifest.dimensions.map(d=><li key={d.id}>{d.label}：{result.pending.includes(d.id)?'证据不足，仍待核对':'本轮两题独立未见首答符合参考'}</li>)}</ul>
   {result.repairs.length>0&&<><h3>先修补这些地方</h3><ul>{result.repairs.map(r=><li key={r.id}><strong>{r.reason}</strong><p>{r.repair}</p><a href={r.repairHref}>打开相关练习</a></li>)}</ul></>}
   <p>听力、口语、自由写作与完整考试表现仍待独立核对。三、四册为按需选读，不是进入专项训练的必修前置。</p>
   <button className="btn" disabled={!!run.chosen} onClick={()=>act({type:'choose',value:result.entry.id})}>{run.chosen?'已选择此试学起点':'选择这个试学起点'}</button>
   {run.chosen&&<><a className="btn" href={trialHref||result.entry.href}>打开建议的试学</a><button className="btn secondary" onClick={()=>act({type:'unchoose'})}>继续沿原路线推荐</button></>}{continuity}
   {freshPoolAvailable(view)?<button className="btn secondary" onClick={start}>另用一组未见题核对</button>:<p>两个候选题池已使用，暂无新的诊断题。已见题可用于学习，不能再当独立未见证据。</p>}
  </>:q&&item?<>
   <p className="placement-progress" role="status">第 {run.index+1} 题 · 最多 6 题 · {placementManifest.dimensions.find(d=>d.id===q.dimension)!.label}</p>
   <article><p className="placement-context" lang="en">{q.context}</p><h2 id="placement-question">{q.prompt}</h2>
    {!item.first?<>
     {q.options?<fieldset aria-labelledby="placement-question"><legend className="placement-sr">请选择一个答案</legend>{q.options.map(option=><label key={option} className="placement-option"><input type="radio" name={q.id} checked={item.draft===option} onChange={()=>act({type:'draft',value:option})}/>{option}</label>)}</fieldset>:<label className="field">我的答案<input autoComplete="off" value={item.draft} maxLength={500} onChange={e=>act({type:'draft',value:e.target.value})}/></label>}
     <div className="placement-actions"><button className="btn" disabled={!item.draft.trim()} onClick={()=>act({type:'submit'})}>提交首答</button><button className="btn secondary" disabled={item.helpAt!==null} onClick={()=>act({type:'help'})}>看提示</button><button className="btn secondary" onClick={()=>act({type:'skip'})}>太难了，跳过</button></div>
     {item.helpAt!==null&&<p role="status">提示：{q.hint} 本题帮助已记录。</p>}
     <label className="placement-option"><input type="checkbox" checked={item.familiar} disabled={item.familiar} onChange={()=>act({type:'familiar'})}/>我以前见过这道题（不会再作为未见题证据）</label>
    </>:<div className="placement-feedback" role="status">
     <p><strong>{item.first.skipped?'本题已跳过':item.first.matched?'首答符合本题参考':'首答需要核对'}</strong></p><p>首答：{item.first.answer||'未提交'} · {item.first.independent?'无提示':'使用过帮助'} · {item.first.fresh?'未自报曾见':'自报曾见'}</p>
     <p>参考：{q.accepted.join(' / ')}。{q.explanation}</p>
     {(!item.first.matched||!item.first.independent||!item.first.fresh)&&<><p>{q.repair}</p><label className="field">我的订正（另存，首答保留）<input maxLength={500} value={item.correctionDraft} onChange={e=>act({type:'correction-draft',value:e.target.value})}/></label><button className="btn secondary" disabled={!item.correctionDraft.trim()} onClick={()=>act({type:'correct'})}>保存订正</button>{item.correction&&<p>订正已保留：{item.correction.answer}。订正不增加独立未见证据。</p>}</>}
     <button className="btn" onClick={()=>act({type:'next'})}>继续核对</button>
    </div>}
   </article>
   <div className="placement-actions"><button className="btn secondary" onClick={()=>act({type:'pause'})}>暂停并保留</button><button className="btn secondary" onClick={()=>act({type:'stop'})}>结束，查看已有证据</button>{continuity}</div>
  </>:null}
 </section>;
}
/** Optional entry for Today: host inserts explicitly, without changing its current-route card. */
export function PlacementEntry(){return <a className="placement-entry" href="/#/placement"><strong>已有基础？做个短诊断</strong><span>最多 6 题，给一个保守试学起点；原路线保留。</span></a>}
