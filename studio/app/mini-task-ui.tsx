/* eslint-disable @next/next/no-html-link-for-pages -- Static map/classic app uses its existing hash router. */
import {useEffect,useRef,useState} from 'react';
import {getMiniTask} from '../mini-task/content';
import {initialMini,itemFor,restoreMini,transitionMini,type MiniAction,type MiniSnapshot,type MiniView} from '../mini-task/model';
import {readMiniTask,commitMiniTask,miniPrerequisite,type MiniRead} from '../mini-task/adapter';
import './mini-task.css';
const labels={teaching:'1 · 先学方法',guided:'2 · 有提示练习',independent:'3 · 收起示范，独立尝试',repair:'4 · 换材料修补',feedback:'保留首答与核对',waiting:'5 · 等到期再换题','delayed-a':'5 · 延迟新题 A','delayed-b':'5 · 延迟新题 B',exhausted:'有限新题已用完'};
export type MiniTaskWorkspaceProps={taskId:string;onLeaveGuard?:(guard:(()=>Promise<boolean>)|null)=>void;onContinue?:(read:MiniRead)=>void};
/** Mount with key=taskId. All writes serialize through the existing CAS host;
 * feedback and next material appear only after confirmed read-back. */
export function MiniTaskWorkspace({taskId,onLeaveGuard,onContinue}:MiniTaskWorkspaceProps){
 const task=getMiniTask(taskId);
 const [view,setView]=useState<MiniView|null>(null),[draft,setDraft]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[blocked,setBlocked]=useState(false),[eligible,setEligible]=useState(false),[clock,setClock]=useState(()=>Date.now()),[correction,setCorrection]=useState(''),[note,setNote]=useState(''),[clip,setClip]=useState<{url:string;name:string}|null>(null),[mediaError,setMediaError]=useState(''),[exported,setExported]=useState(false);
 const read=useRef<MiniRead|null>(null),snapshot=useRef<MiniSnapshot|null>(null),queue=useRef<MiniAction[]>([]),working=useRef(false),failed=useRef(false),alive=useRef(true),generation=useRef(0),clipRef=useRef<string|null>(null),audio=useRef<HTMLAudioElement|null>(null),flush=useRef<()=>Promise<boolean>>(async()=>false),localDraft=useRef('');
 const identity=`${view?.phase}:${view?.bank}`;
 async function load(){
  const current=++generation.current;setBusy(true);
  try{
   const fresh=await readMiniTask(taskId);if(!alive.current||current!==generation.current)return;
   const raw=fresh.raw,s=raw===null?initialMini(taskId):null,p=restoreMini(raw??JSON.stringify(s),Date.now(),taskId);
   if(!p.ok){setBlocked(true);throw Error(p.message)}
   read.current=fresh;snapshot.current=p.snapshot;setView(p.view);setCorrection(p.view.correctionDraft);setNote(p.view.correctionNote);setDraft(p.view.draft);localDraft.current=p.view.draft;
   setEligible(raw!==null||miniPrerequisite(fresh.state,task.courseId).eligible);setBlocked(false);setError('');failed.current=false;
  }catch(cause){if(alive.current)setError(cause instanceof Error?cause.message:'读取失败，原文保留。')}
  finally{if(alive.current)setBusy(false)}
 }
 async function drain(){
  if(working.current||failed.current||!read.current||!snapshot.current)return;
  working.current=true;setBusy(true);
  try{
   while(queue.current.length){
    const expected=read.current,s=snapshot.current,a=queue.current[0],epoch=generation.current;
    const result=transitionMini(s,a,Date.now());if(!result.ok)throw Error(result.message);
    const confirmed=await commitMiniTask(expected,result.snapshot,()=>alive.current&&generation.current===epoch);
    if(!alive.current)return;
    read.current=confirmed;snapshot.current=result.snapshot;queue.current.shift();setView(result.view);
    if(!queue.current.some(x=>x.type==='draft')){setDraft(result.view.draft);localDraft.current=result.view.draft}
    if(a.type==='next'||a.type==='review'){
     setCorrection('');setNote('');setMediaError('');audio.current?.pause();
     if(clipRef.current)URL.revokeObjectURL(clipRef.current);clipRef.current=null;setClip(null);
    }
   }
  }catch(cause){failed.current=true;setError(cause instanceof Error?cause.message:'保存未确认，当前输入保留。')}
  finally{working.current=false;if(alive.current)setBusy(false)}
 }
 function send(a:MiniAction){queue.current.push(a);void drain()}
 useEffect(()=>{
  alive.current=true;queueMicrotask(()=>void load());
  flush.current=async()=>{await drain();while(working.current)await new Promise(resolve=>setTimeout(resolve,20));return !failed.current&&!queue.current.length};
  onLeaveGuard?.(()=>flush.current());
  const unload=(e:BeforeUnloadEvent)=>{if(working.current||queue.current.length||clipRef.current){e.preventDefault();e.returnValue=''}};
  const tick=setInterval(()=>setClock(Date.now()),30_000);window.addEventListener('beforeunload',unload);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Counter invalidates in-flight work; it is not a DOM ref.
  return()=>{alive.current=false;generation.current++;clearInterval(tick);onLeaveGuard?.(null);window.removeEventListener('beforeunload',unload);if(clipRef.current)URL.revokeObjectURL(clipRef.current)};
 // The queue and read-back controller have exactly one keyed task lifetime.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 function exportPending(){
  const value={kind:'english-mini-task-unsaved-input',taskId,savedRaw:read.current?.raw??null,draft:localDraft.current,correction,note,queued:queue.current,localAudio:'not included; original file stays on your device'};
  const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='English-Studio-mini-task-pending.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setExported(true);
 }
 async function selectSpeech(file:File|undefined){
  if(!file)return;if(file.size<128||file.size>20*1024*1024){setMediaError('请选择小于20MB且有效的本机音频。');return}
  const epoch=generation.current,bank=view?.bank,url=URL.createObjectURL(file),player=new Audio(url);
  try{
   const duration=await new Promise<number>((resolve,reject)=>{player.onloadedmetadata=()=>resolve(player.duration);player.onerror=()=>reject(Error('音频不能播放，请选择另一份本机录音。'));player.preload='metadata';player.load()});
   if(!alive.current||epoch!==generation.current||!snapshot.current||(()=>{const p=restoreMini(JSON.stringify(snapshot.current),Date.now(),taskId);return !p.ok||p.view.bank!==bank||p.view.phase!==bank})()){URL.revokeObjectURL(url);return}
   if(!Number.isFinite(duration)||duration<.5||duration>120)throw Error('本任务接受0.5–120秒的口语录音。');
   if(clipRef.current)URL.revokeObjectURL(clipRef.current);clipRef.current=url;setClip({url,name:file.name});setMediaError('');
   send({type:'speech-captured',durationMs:Math.round(duration*1000),bytes:file.size});
  }catch(cause){URL.revokeObjectURL(url);setMediaError(cause instanceof Error?cause.message:'音频未确认。')}
 }
 const q=view?itemFor(taskId,view):null,active=!!q&&view?.phase===view?.bank,last=view?.attempts.at(-1),disabled=busy||!!error||blocked;
 const needsSpeech=active&&task.skill==='speaking'&&!view?.textMode;
 const canSubmit=!!view&&(!needsSpeech||!!clip&&view.bytes>0)&&(task.skill!=='listening'||view.textMode||view.audioPlays>0)&&(needsSpeech||!!draft.trim());
 return <section className="mini-task" aria-label="适级雅思式小任务" data-task={taskId} data-phase={view?.phase||'loading'}>
  <header><p>{task.lessons.map(n=>`第${n}课`).join(' / ')} · {task.skill} · {task.track==='common'?'Academic / GT 共有基础技能':'仅 GT 通信起步'}</p><h1>{task.title}</h1><p>初学者小任务；难度未校准。不是完整 IELTS 试题，不换算 Band 或课程达标。</p></header>
  <p role="status">{busy?'正在确认保存…':error?'保存未确认，输入保留':view?'本页记录已读取；操作后确认保存':'正在读取原记录…'}</p>
  {error&&<aside role="alert"><p>{error}</p><button onClick={exportPending}>保存未提交文字</button>{!blocked&&<button disabled={busy} onClick={()=>{failed.current=false;setError('');void drain()}}>重试保存</button>}<button disabled={busy||!exported&&!blocked} onClick={()=>{queue.current=[];void load()}}>读取最新记录</button></aside>}
  {view&&!eligible?<p>先完成本组教学、提示练习和独立尝试。<a href={`/map/#/learn/${task.courseId}`}>回到本组课程</a></p>:view&&<>
   <h2 tabIndex={-1}>{labels[view.phase]}</h2>
   {view.phase==='teaching'&&<><p>{task.teaching}</p><button disabled={disabled} onClick={()=>send({type:'next'})}>开始有提示练习</button></>}
   {active&&q&&<article key={identity}>
    {task.skill==='listening'?<>
     {!view.textMode&&<><p>原创离线合成语音，可重放；完整播放后才能作为听力提交。播放完成只表示接触材料。</p><audio ref={audio} controls preload="none" src={q.audio} onEnded={()=>send({type:'audio-ended'})} onError={()=>setMediaError('声音暂不可用，可重试播放或选择受限文字练习。')}/></>}
     {view.transcript&&<p lang="en" aria-label="帮助文字稿">{q.material}</p>}
     {!view.transcript&&<button disabled={disabled} onClick={()=>send({type:'transcript'})}>看文字稿（记帮助）</button>}
     {!view.textMode&&<button disabled={disabled} onClick={()=>{audio.current?.pause();send({type:'text-mode'})}}>改为受限文字练习</button>}
    </>:<p lang={task.skill==='reading'?'en':undefined}>{q.material}</p>}
    <h3>{q.prompt}</h3>
    {(view.helped||view.bank==='guided')&&<p className="mini-help">提示：{q.hint}</p>}
    {needsSpeech&&<><label>选择本机口语录音（仅本页回放，不上传）<input type="file" accept="audio/*" disabled={disabled} onChange={e=>void selectSpeech(e.target.files?.[0])}/></label>{clip?<><p>{clip.name} · 离开或刷新后需重新选择原文件。</p><audio controls src={clip.url}/></>:view.bytes>0?<p>此前录制元数据已恢复；要提交本题，请重新选择原录音。</p>:null}<button disabled={disabled} onClick={()=>send({type:'text-mode'})}>改用文字备选（不记口语）</button></>}
    {!needsSpeech&&<label>{view.textMode?'受限文字原答':'你的原答'}<textarea value={draft} maxLength={2000} disabled={blocked||!!error} onChange={e=>{localDraft.current=e.target.value;setDraft(e.target.value);send({type:'draft',value:e.target.value})}}/></label>}
    {mediaError&&<p role="alert">{mediaError}</p>}
    {!view.helped&&<button disabled={disabled} onClick={()=>send({type:'help'})}>需要提示（记帮助）</button>}
    <button disabled={disabled||!canSubmit} onClick={()=>send({type:'submit'})}>保留首答，提交本题</button>
   </article>}
   {view.phase==='feedback'&&q&&last&&<article><p>首答：{last.modality==='speaking'?`本机口语录制元数据 ${last.durationMs}ms / ${last.bytes} bytes；不持久保存音频`:last.answer}</p><p>{last.status==='awaiting-external-review'?'开放口写已留存，质量待外评，无自动分数。':last.matched?'本题受限答案匹配；不代表掌握。':'本题受限答案未匹配，需要核对。'} · {last.independent?'本次未用帮助，首次材料':'使用帮助或文字备选；不计独立技能证据'}</p><p>参考：<span lang="en">{q.reference}</span></p><label>修订（首答保留）<textarea maxLength={2000} value={correction} onChange={e=>{setCorrection(e.target.value);send({type:'correction-draft',value:e.target.value,note})}}/></label><label>改动原因<textarea maxLength={2000} value={note} onChange={e=>{setNote(e.target.value);send({type:'correction-draft',value:correction,note:e.target.value})}}/></label><button disabled={disabled||!correction.trim()||!note.trim()||view.corrections.some(c=>c.itemId===q.id)} onClick={()=>send({type:'correct',value:correction,note})}>另存修订与原因</button><button disabled={disabled} onClick={()=>send({type:'next'})}>{last.bank==='guided'?'收起示范，换新材料':last.bank==='independent'?'换材料修补':last.bank==='repair'?'保留本次记录，安排延迟检验':'保留本轮记录'}</button></article>}
   {view.phase==='waiting'&&<><p>下一次新题：{new Date(view.dueAt!).toLocaleString('zh-CN')}。自然延迟尚未发生的证据不会虚构。</p>{clock>=view.dueAt!&&<button disabled={disabled} onClick={()=>send({type:'review'})}>开始到期的新题</button>}</>}
   {view.phase==='exhausted'&&<p>两组延迟新材料已用完；需要补充新材料。不会把旧题重复当成新的迁移或达标证明。</p>}
   {['waiting','exhausted'].includes(view.phase)&&onContinue&&<button disabled={disabled} onClick={()=>void flush.current().then(ok=>{if(ok&&read.current)onContinue(read.current)})}>回到课程路线</button>}
   <details><summary>回看本任务原答、帮助和修订</summary>{view.attempts.map(a=><div key={a.itemId}><p>{a.bank} · {a.modality} · {a.helped?'帮助':'未用帮助'} · {a.status}</p><p>{a.answer||'仅口语录制元数据；音频未上传/持久保存'}</p>{view.corrections.filter(c=>c.itemId===a.itemId).map(c=><p key={c.itemId}>修订：{c.value}；原因：{c.note}</p>)}</div>)}</details>
  </>}
  <footer><p>任务记录独立于课程首答、地图检验和词卡排程；本任务不能授予它们完成状态。</p><a href="/#/progress">打开现有学习记录与备份</a></footer>
 </section>;
}
