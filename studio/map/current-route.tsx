import React from 'react';
import {ArrowRight,Check,Lock,RotateCcw,BookOpen} from 'lucide-react';
import {nodes,nodeById,stages,unitById,type MapNode} from './content';
import {achieved,chapterProgress,due,manuallyUnlocked,stable,statusMap,type Progress} from './model';
import {mapEvidenceLabel} from './learning-label';
import {lessonPlan} from './lesson-plan';

export function CurrentRoute({selected,current,state,open,locate}:{selected:MapNode;current:MapNode;state:Progress;open:(id:string)=>void;locate:()=>void}){
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
  return <section className="current-route" aria-label="当前学习路线">
    <div className="route-section-heading"><div><span className="mini-label">{chapter?`新概念${chapter.stage==='foundation'?'一':'二'}册 · 第 ${chapter.chapter!<6?chapter.chapter!+1:chapter.chapter!-5} 章`:'一步一步，先把眼前这一站学好'}</span><h2>{title}</h2></div><span>{completed} / {items.length} {chapter?'组初次通过':'站完成'}</span></div>
    <div className="chapter-track" role="group" aria-label={chapter?'本章全部课次':'本阶段节点'}>{items.map((n,i)=><button key={n.id} aria-label={`${i+1}. ${n.title}，${mapEvidenceLabel(n,state)}${statuses[n.id]==='locked'?'，待解锁':''}`} aria-current={n.id===active.id?'step':undefined} className={`${statuses[n.id]} ${manuallyUnlocked(n,state)?'manual':''}`} onClick={()=>open(n.id)} title={n.title}>{achieved(n,state)?<Check size={16}/>:i+1}</button>)}</div>
    <div className="route-action"><div><span className="mini-label">{projectNext?'本章下一步':due(active,state)?'这次先巩固':isCurrent?'你的下一步':'正在查看这一段路线'}</span><h3>{goal}</h3><p>{projectNext?'准备自己的口头与书面作品，留下评阅和修订。':active.subtitle}</p><small>{projectNext?`${stats!.stable} / ${stats!.total} 组已巩固 · 作品与隔日检验分别记录`:null}{!projectNext&&<>{manuallyUnlocked(active,state)?'已开放 · ':''}{mapEvidenceLabel(active,state)}</>}</small></div><button className="primary" onClick={()=>open(projectNext?chapter!.id:active.id)}>{projectNext?'准备章节作品':statuses[active.id]==='locked'?'查看与解锁':due(active,state)?'开始巩固':statuses[active.id]==='passed'?'回顾这一站':'继续学习'}<ArrowRight size={17}/></button></div>
    {nearby.length>0&&<ol className="nearby-route" aria-label="接下来的学习节点">{nearby.map(n=><li key={n.id} className={`${statuses[n.id]} ${n.id===active.id?'active':''}`}><button onClick={()=>open(n.id)}><span className="route-marker">{statuses[n.id]==='locked'?<Lock size={17}/>:stable(n,state)?<Check size={17}/>:due(n,state)?<RotateCcw size={17}/>:<BookOpen size={17}/>}</span><span><small>{n.kind==='unit'?n.subtitle:`第 ${items.indexOf(n)+1} 站`}</small><strong>{n.kind==='unit'?lessonPlan(unitById(n.id)!).goal:n.title}</strong><small>{manuallyUnlocked(n,state)?'已开放 · ':''}{mapEvidenceLabel(n,state)}{statuses[n.id]==='locked'?' · 待解锁':''}</small></span><ArrowRight size={17}/></button></li>)}</ol>}
    <div className="route-links">{chapter?<button className="text-button" onClick={()=>open(chapter.id)}>本章全部课次与作品 →</button>:<span>先听懂，再自己试。完成检验后，下一站会开放。</span>}{stats&&<span>{stats.stable} / {stats.total} 组已隔日巩固</span>}{!isCurrent&&<button className="text-button" onClick={locate}>回到我的进度</button>}</div>
  </section>;
}
