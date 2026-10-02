import React from 'react';
import {ArrowRight,Check,Lock,RotateCcw,BookOpen,ChevronRight} from 'lucide-react';
import {nodes,nodeById,stages,unitById,sourceLabel,type MapNode} from './content';
import {achieved,chapterProgress,due,manuallyUnlocked,stable,statusMap,type Progress} from './model';
import {mapEvidenceLabel} from './learning-label';
import {lessonPlan} from './lesson-plan';

export function CurrentRoute({selected,current,state,open,locate,compact=false}:{selected:MapNode;current:MapNode;state:Progress;open:(id:string)=>void;locate:()=>void;compact?:boolean}){
  const chapter=selected.parent?nodeById(selected.parent):selected.kind==='course'?selected:undefined;
  const items=chapter?(chapter.members||[]).map(id=>nodeById(id)!):nodes.filter(n=>n.stage===selected.stage&&(!selected.lane||n.lane===selected.lane));
  const statuses=statusMap(state),stats=chapter?chapterProgress(chapter,state):undefined;
  const active=items.find(n=>n.id===current.id)||items.find(n=>due(n,state)&&statuses[n.id]!=='locked')||items.find(n=>statuses[n.id]==='available')||items[0];
  const completed=items.filter(n=>achieved(n,state)).length;
  const projectNext=!!chapter&&completed===items.length&&!achieved(chapter,state)&&!items.some(n=>due(n,state));
  const position=items.indexOf(active);
  // The active task leads into two upcoming nodes; previous lessons remain in the chapter track.
  const nearby=projectNext?[]:items.slice(position+1,position+3);
  const title=chapter?.title||stages.find(s=>s.id===selected.stage)!.title;
  const goal=projectNext?'把这一章连成自己的话':active.kind==='unit'?lessonPlan(unitById(active.id)!).goal:active.title;
  const isCurrent=items.some(n=>n.id===current.id)||chapter?.id===current.id;
  if(compact)return <section className="current-route route-summary" aria-label="当前位置与后续路线"><div className="route-section-heading"><div><span className="mini-label">当前位置 · {chapter?`新概念${chapter.stage==='foundation'?'一':'二'}册 · 第 ${chapter.chapter!<6?chapter.chapter!+1:chapter.chapter!-5} 章`:stages.find(s=>s.id===current.stage)?.title}</span><h2>{title}</h2></div><span>{completed} / {items.length} {chapter?'组初次通过':'站完成'}</span></div><p><strong>{current.kind==='unit'?`${sourceLabel(unitById(current.id)!)} · ${lessonPlan(unitById(current.id)!).goal}`:current.title}</strong><small>{mapEvidenceLabel(current,state)}</small></p>{nearby.length>0&&<p className="route-summary-next">接下来：{nearby.map(n=>n.kind==='unit'?`${sourceLabel(unitById(n.id)!)} · ${lessonPlan(unitById(n.id)!).goal}`:n.title).join('；')}</p>}<button className="text-button" onClick={()=>open(chapter?.id||current.id)}>{chapter?`查看本章 ${items.length} 组课程与作品`:'查看当前路线'}<ArrowRight size={16}/></button></section>;
  return <section className="current-route" aria-label="当前学习路线">
    <div className="route-section-heading"><div><span className="mini-label">{chapter?`新概念${chapter.stage==='foundation'?'一':'二'}册 · 第 ${chapter.chapter!<6?chapter.chapter!+1:chapter.chapter!-5} 章`:'一步一步，先把眼前这一站学好'}</span><h2>{title}</h2></div><span>{completed} / {items.length} {chapter?'组初次通过':'站完成'}</span></div>
    <ol className="chapter-track" aria-label={chapter?'本章全部课次':'本阶段节点'}>{items.map((n,i)=>{const unit=n.kind==='unit'?unitById(n.id):undefined;return <li key={n.id}><button data-route-node={n.id} aria-current={n.id===current.id?'step':undefined} aria-pressed={n.id===selected.id} className={`${statuses[n.id]} ${manuallyUnlocked(n,state)?'manual':''}`} onClick={()=>open(n.id)}><span className="chapter-node-number" aria-hidden="true">{achieved(n,state)?<Check size={16}/>:i+1}</span><span className="chapter-node-copy"><small>{unit?sourceLabel(unit):`第 ${i+1} 站`}</small><strong>{unit?lessonPlan(unit).goal:n.title}</strong>{unit&&<small lang="en">{n.title}</small>}<small className="chapter-node-status">{n.id===current.id?'当前位置 · ':n.id===active.id?'本章下一步 · ':''}{manuallyUnlocked(n,state)?'手动开放 · ':''}{mapEvidenceLabel(n,state)}{statuses[n.id]==='locked'?' · 待解锁，点此查看开放条件':''}</small></span><ChevronRight size={16}/></button></li>})}</ol>
    <div className="route-action"><div><span className="mini-label">{projectNext?'本章下一步':due(active,state)?'这次先巩固':isCurrent?'你的下一步':'正在查看这一段路线'}</span><h3>{goal}</h3><p>{projectNext?'准备自己的口头与书面作品，留下评阅和修订。':active.subtitle}</p><small>{projectNext?`${stats!.stable} / ${stats!.total} 组已巩固 · 作品与隔日检验分别记录`:null}{!projectNext&&<>{manuallyUnlocked(active,state)?'已开放 · ':''}{mapEvidenceLabel(active,state)}</>}</small></div><button className="primary" onClick={()=>open(projectNext?chapter!.id:active.id)}>{projectNext?'准备章节作品':statuses[active.id]==='locked'?'查看与解锁':due(active,state)?'开始巩固':statuses[active.id]==='passed'?'回顾这一站':'继续学习'}<ArrowRight size={17}/></button></div>
    {nearby.length>0&&<ol className="nearby-route" aria-label="接下来的学习节点">{nearby.map(n=><li key={n.id} className={`${statuses[n.id]} ${n.id===active.id?'active':''}`}><button onClick={()=>open(n.id)}><span className="route-marker">{statuses[n.id]==='locked'?<Lock size={17}/>:stable(n,state)?<Check size={17}/>:due(n,state)?<RotateCcw size={17}/>:<BookOpen size={17}/>}</span><span><small>{n.kind==='unit'?n.subtitle:`第 ${items.indexOf(n)+1} 站`}</small><strong>{n.kind==='unit'?lessonPlan(unitById(n.id)!).goal:n.title}</strong><small>{manuallyUnlocked(n,state)?'已开放 · ':''}{mapEvidenceLabel(n,state)}{statuses[n.id]==='locked'?' · 待解锁':''}</small></span><ArrowRight size={17}/></button></li>)}</ol>}
    <div className="route-links">{chapter?<button className="text-button" onClick={()=>open(chapter.id)}>本章全部课次与作品 →</button>:<span>先听懂，再自己试。完成检验后，下一站会开放。</span>}{stats&&<span>{stats.stable} / {stats.total} 组已隔日巩固</span>}{!isCurrent&&<button className="text-button" onClick={locate}>回到我的进度</button>}</div>
  </section>;
}
