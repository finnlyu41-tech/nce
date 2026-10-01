import {useEffect,useState} from 'react';
import {ArrowRight,Map,RotateCcw} from 'lucide-react';
import {nodes,unitNodes,nodeById,unitById} from '../map/content';
import {lessonPlan} from '../map/lesson-plan';
import {emptyProgress,parseProgress,storageKey,statusMap,achieved,continueNode,learningLabel,manuallyUnlocked,due,type Progress} from '../map/model';
import type {NceBookId} from './model';

export function mapUnitId(book?:NceBookId,lesson?:number) {
  if(!lesson||!book||!['NCE1','NCE2'].includes(book))return undefined;
  const id=`${book.toLowerCase()}-${book==='NCE1'?lesson-(lesson%2===0?1:0):lesson}`;
  return nodeById(id)?id:undefined;
}
export function useMapProgress(enabled=true) {
  const [state,setState]=useState<Progress>(emptyProgress),[error,setError]=useState('');
  useEffect(()=>{if(!enabled)return;const read=()=>{try{const raw=localStorage.getItem(storageKey);setState(raw?parseProgress(raw):emptyProgress());setError('')}catch{setError('地图记录暂时无法读取，原始记录仍保留。')}};read();const sync=(e:StorageEvent)=>{if(e.key===storageKey||e.key===null)read()};window.addEventListener('storage',sync);window.addEventListener('focus',read);return()=>{window.removeEventListener('storage',sync);window.removeEventListener('focus',read)}},[enabled]);
  return {state,error};
}
export function mapHref(state:Progress,book?:NceBookId,lesson?:number,learn=false) {
  const id=mapUnitId(book,lesson)||continueNode(state).id;
  return `/map/#/${learn?'learn':'map'}/${id}`;
}
export function MapConnection({view,book,lesson}:{view:'home'|'course'|'review'|'records';book?:NceBookId;lesson?:number}) {
  const {state,error}=useMapProgress(),unit=mapUnitId(book,lesson),node=nodeById(unit||continueNode(state).id)!;
  const title=node.kind==='unit'?lessonPlan(unitById(node.id)!).goal:node.title;
  const passed=nodes.filter(n=>achieved(n,state)).length,learned=unitNodes.filter(n=>achieved(n,state)).length;
  const reviews=[...nodes.filter(n=>n.kind!=='course'),...unitNodes].filter(n=>due(n,state));
  const recorded=[...nodes,...unitNodes].filter(n=>state.records[n.id]||manuallyUnlocked(n,state));
  const list=view==='review'?reviews:recorded;
  return <section className={`map-connection map-connection-${view}`} aria-label={view==='course'?'本课在学习地图中的状态':view==='review'?'地图到期复习':'学习地图进度'}>
    <div className="map-connection-head"><div><small>{view==='course'?'本课资料与笔记':'学习路线'}</small><h2>{view==='course'?title:view==='review'?`${reviews.length} 个学习单元待巩固`:view==='records'?`${passed} / ${nodes.length} 站完成学习`:title}</h2><p>{view==='course'?`${manuallyUnlocked(node,state)?'手动解锁 · ':statusMap(state)[node.id]==='locked'?'可直接解锁 · ':''}${learningLabel(node,state)}`:view==='home'?`${learningLabel(node,state)} · 已学 ${learned} / 168 个教材单元`:`已学 ${learned} / 168 个教材单元；解锁不计入完成数量。`}</p></div><a href={mapHref(state,book,lesson,view==='home'||view==='course')}><Map size={17}/>{view==='course'?'继续本课学习':view==='home'?'继续学习':'回到学习'}<ArrowRight size={16}/></a></div>
    {error&&<p role="alert">{error}</p>}
    {view==='course'&&<p>这里保留以前的笔记和练习。继续学习会回到本课当前步骤。</p>}
    {(view==='review'||view==='records')&&<>{list.length>0?<div className="map-record-list">{list.map(n=><a key={n.id} href={`/map/#/learn/${n.id}`}><strong>{n.parent?`${n.id.startsWith('nce1')?'一册':'二册'} · `:''}{n.title}</strong><span>{manuallyUnlocked(n,state)?'手动解锁 · ':''}{learningLabel(n,state)}{due(n,state)&&' · 待复习'}<ArrowRight size={14}/></span></a>)}</div>:<p>{view==='review'?'暂无到期内容，学过的内容会在这里提醒复习。':'尚未开始。手动解锁和实际完成会在这里分别显示。'}</p>}{view==='records'&&<a href={mapHref(state)}><RotateCcw size={15}/>地图进度备份与解锁设置</a>}</>}
  </section>;
}
