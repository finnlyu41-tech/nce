import {placementManifest,type Dimension,type EntryId} from './manifest';
import {placementQuestions,questionById,type PlacementQuestion} from './content';
export const placementKey='placement-text-v1';
export type PlacementAction={type:'start'|'draft'|'help'|'familiar'|'submit'|'skip'|'next'|'correction-draft'|'correct'|'pause'|'resume'|'stop'|'choose'|'unchoose';value?:string};
type Event=PlacementAction&{at:number};
type Envelope={kind:'placement-text';version:1;contentVersion:1;events:Event[]};
export type FirstAnswer={answer:string;at:number;skipped:boolean;matched:boolean;independent:boolean;fresh:boolean};
export type ItemEvidence={id:string;exposedAt:number;draft:string;helpAt:number|null;familiar:boolean;correctionDraft:string;first:FirstAnswer|null;correction:{answer:string;at:number}|null};
export type PlacementRun={pool:'a'|'b';startedAt:number;phase:'active'|'paused'|'complete';index:number;items:ItemEvidence[];stopped:boolean;chosen:EntryId|null};
export type PlacementView={runs:PlacementRun[];run:PlacementRun|null;question:PlacementQuestion|null;lastAt:number};
export type PlacementRead={status:'ready';raw:string|null;value:Envelope;view:PlacementView}|{status:'blocked';raw:string;reason:string};
const MAX_EVENTS=500,MAX_RAW=128*1024;
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
function requireThat(v:unknown,message='诊断记录不支持，原文保留。'):asserts v{if(!v)throw Error(message)}
const normalize=(v:string)=>v.trim().toLowerCase();
export const answerMatches=(q:PlacementQuestion,answer:string)=>q.accepted.some(v=>normalize(v)===normalize(answer));
const dimensions:Dimension[]=['basic','narrative','reading'];
export function dimensionPassed(run:PlacementRun,dimension:Dimension){
 const items=run.items.filter(i=>questionById(i.id)?.dimension===dimension);
 return items.length===2&&items.every(i=>i.first?.matched&&i.first.independent&&i.first.fresh&&!i.first.skipped);
}
export function placementRecommendation(view:PlacementView){
 const run=view.run;
 let level=0;
 if(run)for(const dimension of dimensions){if(dimensionPassed(run,dimension))level++;else break}
 const entry=placementManifest.entries[level];
 const repairs=run?.items.filter(i=>i.first&&(!i.first.matched||!i.first.independent||!i.first.fresh)).map(i=>({...questionById(i.id)!,reason:i.first!.skipped?'这题跳过了，尚无独立证据':i.helpAt!==null?'这题使用过帮助':i.familiar?'这题自报曾见过':'首答还需要核对'}))||[];
 return {entry,repairs,complete:run?.phase==='complete',pending:dimensions.filter(d=>!run||!dimensionPassed(run,d)),limits:placementManifest.limits,calibration:placementManifest.calibration};
}
function replay(events:Event[],now:number):PlacementView{
 const runs:PlacementRun[]=[];let lastAt=0;
 const usedPools=new Set<string>();
 for(const e of events){
  requireThat(object(e)&&Object.keys(e).every(k=>['type','value','at'].includes(k))&&Object.hasOwn(e,'type')&&Object.hasOwn(e,'at'));
  requireThat(Number.isSafeInteger(e.at)&&e.at>0&&e.at<=now&&e.at>=lastAt,'诊断时间异常，原文保留；请核对设备时间。');lastAt=e.at;
  const withValue=['draft','correction-draft','choose'].includes(e.type);
  requireThat(withValue?typeof e.value==='string'&&e.value.length<=500:!Object.hasOwn(e,'value'));
  let run=runs.at(-1);
  if(e.type==='start'){
   requireThat(!run||run.phase==='complete','先保留并结束当前诊断。');
   const pool=placementManifest.pools.find(p=>!usedPools.has(p));
   requireThat(pool,'两个候选题池已使用，暂无新的诊断题。');usedPools.add(pool!);
   run={pool:pool!,startedAt:e.at,phase:'active',index:0,items:[],stopped:false,chosen:null};runs.push(run);
   run.items.push({id:pool+'-1',exposedAt:e.at,draft:'',helpAt:null,familiar:false,correctionDraft:'',first:null,correction:null});continue;
  }
  requireThat(run,'还没有开始诊断。');
  const r=run!;
  if(e.type==='choose'){
   requireThat(r.phase==='complete'&&placementRecommendation({runs,run:r,question:null,lastAt}).entry.id===e.value,'只能选择本轮证据支持的试学入口。');r.chosen=e.value as EntryId;continue;
  }
  if(e.type==='unchoose'){requireThat(r.phase==='complete');r.chosen=null;continue}
  if(e.type==='resume'){requireThat(r.phase==='paused');r.phase='active';continue}
  requireThat(r.phase==='active','当前诊断已暂停或结束。');
  if(e.type==='pause'){r.phase='paused';continue}
  if(e.type==='stop'){r.phase='complete';r.stopped=true;continue}
  const item=r.items[r.index],q=questionById(item.id)!;
  if(e.type==='draft'){requireThat(!item.first);item.draft=e.value!}
  else if(e.type==='help'){requireThat(!item.first);item.helpAt??=e.at}
  else if(e.type==='familiar'){requireThat(!item.first);item.familiar=true}
  else if(e.type==='submit'||e.type==='skip'){
   requireThat(!item.first&& (e.type==='skip'||item.draft.trim().length>0),'请先作答或选择跳过。');
   const skipped=e.type==='skip';
   item.first={answer:skipped?'':item.draft,at:e.at,skipped,matched:!skipped&&answerMatches(q,item.draft),independent:item.helpAt===null,fresh:!item.familiar};
  }else if(e.type==='correction-draft'){
   requireThat(item.first,'首答之后才可订正。');item.correctionDraft=e.value!;
  }else if(e.type==='correct'){
   requireThat(item.first&&item.correctionDraft.trim().length>0,'首答之后才可订正。');item.correction={answer:item.correctionDraft,at:e.at};
  }else if(e.type==='next'){
   requireThat(item.first,'先作答或跳过，再继续。');
   if(r.index===5||r.index%2===1&&!dimensionPassed(r,q.dimension)){r.phase='complete';continue}
   r.index++;r.items.push({id:r.pool+'-'+(r.index+1),exposedAt:e.at,draft:'',helpAt:null,familiar:false,correctionDraft:'',first:null,correction:null});
  }else throw Error('未知诊断操作，原文保留。');
 }
 const run=runs.at(-1)||null;
 return {runs,run,question:run&&run.phase!=='complete'?questionById(run.items[run.index].id)!:null,lastAt};
}
export function readPlacement(raw:string|undefined|null,now=Date.now()):PlacementRead{
 if(raw===undefined||raw===null)return {status:'ready',raw:null,value:{kind:'placement-text',version:1,contentVersion:1,events:[]},view:{runs:[],run:null,question:null,lastAt:0}};
 try{
  requireThat(raw.length<=MAX_RAW&&new TextEncoder().encode(raw).length<=MAX_RAW,'诊断记录超过容量，原文保留。');
  const v:unknown=JSON.parse(raw);
  requireThat(object(v)&&Object.keys(v).length===4&&['kind','version','contentVersion','events'].every(k=>Object.hasOwn(v,k))&&v.kind==='placement-text'&&v.version===1&&v.contentVersion===placementManifest.contentVersion,'诊断版本未知，原文保留；请使用对应版本核对。');
  requireThat(Array.isArray(v.events)&&v.events.length<=MAX_EVENTS,'诊断记录超过操作上限，原文保留。');
  const value=v as unknown as Envelope;return {status:'ready',raw,value,view:replay(value.events,now)};
 }catch(e){return {status:'blocked',raw,reason:e instanceof Error?e.message:'诊断记录无效，原文保留。'}}
}
export function placementTransition(raw:string|undefined|null,action:PlacementAction,at=Date.now()):PlacementRead{
 const current=readPlacement(raw,at);if(current.status==='blocked')return current;
 const next=JSON.stringify({...current.value,events:[...current.value.events,{...action,at}]});
 return readPlacement(next,at);
}
export function freshPoolAvailable(view:PlacementView){return view.runs.length<placementManifest.pools.length}
export function currentEvidence(view:PlacementView){return view.run?.items[view.run.index]||null}
