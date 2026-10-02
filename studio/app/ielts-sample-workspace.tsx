'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import type {State} from './model';
import {IELTSSampleSequence} from '../ielts-blueprint/sample-sequence-ui';
import type {SampleState} from '../ielts-blueprint/sample-sequence-model';
import {readSampleProgress,recoverSamplePlayback,replaceSampleProgress,sampleProgressKey,serializeSampleProgress} from './ielts-sample-progress';
import {sampleTarget} from './ielts-sample-target';

type Pending={expected:string|undefined;raw:string;value:SampleState};
export function IELTSSampleWorkspace({state,update,ready,task,onTargetOpened}:{state:State;update:(change:(current:State)=>State)=>void;ready:boolean;task?:string;onTargetOpened?:()=>void}){
 const raw=state.drafts[sampleProgressKey];
 const [retry,setRetry]=useState(0),[pending,setPending]=useState<Pending>(),[issue,setIssue]=useState('');
 const pendingRef=useRef<Pending|undefined>(undefined),written=useRef<string|undefined>(undefined);
 const read=useMemo(()=>readSampleProgress(raw),[raw,retry,ready]);
 const conflict=!!pending&&raw!==pending.expected&&raw!==pending.raw;
 const restored=useMemo(()=>read.status==='blocked'?undefined:raw!==undefined&&raw===written.current?{value:read.value,interrupted:0}:recoverSamplePlayback(read.value),[read,raw]);
 const target=sampleTarget(task);
 useEffect(()=>{
  if(!target||!ready||read.status==='blocked'||conflict||!restored)return;
  if(restored.value.variant!==target.variant||restored.value.lessonId!==target.lessonId)change({...restored.value,...target});
  onTargetOpened?.();
 },[task,ready,read,conflict]);
 useEffect(()=>{if(pending&&raw===pending.raw&&pendingRef.current?.raw===pending.raw){pendingRef.current=undefined;setPending(undefined)}},[raw,pending]);
 useEffect(()=>{if(!ready){pendingRef.current=undefined;written.current=undefined;setPending(undefined)}},[ready]);
 function reload(){pendingRef.current=undefined;written.current=undefined;setPending(undefined);setIssue('');setRetry(n=>n+1)}
 function change(value:SampleState){
  if(!ready||read.status==='blocked'||conflict)return;
  try{
   const next=serializeSampleProgress(value),expected=pendingRef.current?.raw??raw;
   const request={expected,raw:next,value};pendingRef.current=request;written.current=next;setPending(request);setIssue('');
   update(current=>replaceSampleProgress(current,expected,next));
  }catch(error){setIssue(error instanceof Error?error.message:'这次修改未保存，原记录保留。')}
 }
 if(!ready)return <section className="panel" aria-busy="true"><p role="status">正在读取本机学习记录…</p></section>;
 if(target&&read.status!=='blocked'&&!conflict)return <section className="panel" aria-busy="true"><p role="status">正在回到这次练习…</p></section>;
 return <section aria-label="雅思小任务工作区">
  <a className="text-btn" href="#/today">← 返回今日学习</a>
  {read.status==='blocked'||conflict?<section className="panel" role="alert">
   <h1>先保留这段学习记录</h1>
   <p>{conflict?'这段记录刚被恢复或在另一处更新，本页没有覆盖新记录。':read.status==='blocked'?read.reason:''}</p>
   <p>原始内容仍在学习进度里。请先用顶部“保存进度”备份，再通过“进度备份与恢复”选取此前有效的文件。若是较新版本，请在支持该版本的网站打开备份；不会自动清空或重新开始。</p>
   <button className="btn secondary" onClick={reload}>重新读取已保存记录</button>
  </section>:<>
   {!!restored?.interrupted&&<p className="notice" role="status">上次有 {restored.interrupted} 次播放在离开或刷新时中断，尚未记为完整听到。请重新播放；原来的次数、作答和提示记录仍保留。</p>}
   {issue&&<p className="notice" role="alert">{issue}</p>}
   <IELTSSampleSequence value={pending?.value||restored!.value} onChange={change} guidedFlow persistenceNote="文字作答、学习位置和提示记录随本站学习进度保存，刷新可以继续，也包含在整站备份中。录音仅临时回听，刷新后清除；备份不含录音，也没有语音评分。"/>
  </>}
 </section>;
}
