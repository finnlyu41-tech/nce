'use client';
import {useEffect,useRef,useState} from 'react';
import {Mic,Square,Volume2,RotateCcw,ExternalLink} from 'lucide-react';
import {PlaybackSpeed,usePlaybackRate} from './playback-speed';
import {ONLINE} from './runtime-mode';
import {assessmentAudio,playableRecording,ASSESSMENT_SECONDS} from './recording-audio';
import {captureRecording,type RecordingCapture} from './recording-session';
import {assessRecording,practiceIssues,retryFeedback,PronunciationResult,PracticeIssue} from './pronunciation';
import {speak} from './speech';
import {playDemo,type DemoStatus} from './demo-audio';
import './recording-feedback.css';

export type SavedTake={id:string;blob:Blob;result?:PronunciationResult};
type Take=SavedTake & {url:string};
type PendingSave={takes:SavedTake[];event:'recorded'|'assessed'};
type DemoState=DemoStatus & {word:string};
type Props={referenceText?:string;onListen?:()=>void;onBeforeRecord?:()=>void;stopSignal?:number;hideReference?:boolean;retentionLabel?:string;initialTakes?:SavedTake[];onTakesChange?:(takes:SavedTake[],event:'recorded'|'assessed')=>Promise<void>;conceal?:boolean;downloadPrefix?:string};
export function Recorder({referenceText,...props}:Props){
 const reference=referenceText?.trim()||'';
 return <RecordingSession key={reference} reference={reference} {...props}/>;
}
function RecordingSession({reference,onListen,onBeforeRecord,stopSignal,hideReference=false,retentionLabel='录音在离开本练习或刷新后清除',initialTakes,onTakesChange,conceal=false,downloadPrefix}:Props & {reference:string}){
 const rate=usePlaybackRate(),[take,setTake]=useState<Take|null>(null),[previous,setPrevious]=useState<Take|null>(null);
 const [recording,setRecording]=useState(false),[busy,setBusy]=useState(false),[finishing,setFinishing]=useState(false),[submitting,setSubmitting]=useState(false),[elapsed,setElapsed]=useState(0);
 const [consent,setConsent]=useState(false),[service,setService]=useState<'loading'|'ready'|'unavailable'|'failed'>('loading'),[serviceAttempt,setServiceAttempt]=useState(0),[error,setError]=useState('');
 const [copyStatus,setCopyStatus]=useState('');
 const [pendingSave,setPendingSave]=useState<PendingSave|null>(null),[saving,setSaving]=useState(false);
 const savePending=useRef<PendingSave|null>(null);
 const cancelled=useRef(false);
 const [demoState,setDemoState]=useState<DemoState|null>(null);
 const capture=useRef<RecordingCapture|null>(null),attempt=useRef(0),mounted=useRef(false),pending=useRef(false);
 const clips=useRef<Take[]>([]),timer=useRef<ReturnType<typeof setInterval>|null>(null),request=useRef<AbortController|null>(null);
 const currentAudio=useRef<HTMLAudioElement>(null),previousAudio=useRef<HTMLAudioElement>(null);
 const demoAudio=useRef<HTMLAudioElement>(null),stopDemo=useRef<(()=>void)|undefined>(undefined);
 const clipEnd=useRef<number|null>(null);
 function pausePlayback(){clipEnd.current=null;currentAudio.current?.pause();previousAudio.current?.pause();stopDemo.current?.();window.speechSynthesis?.cancel();setDemoState(null);onBeforeRecord?.()}
 function listen(){pausePlayback();onListen?.()}
 function demo(word:string){
  if(demoState?.word===word&&demoState.state!=='error'){stopDemo.current?.();window.speechSynthesis?.cancel();setDemoState(null);return;}
  pausePlayback();
  if(ONLINE&&demoAudio.current){
   stopDemo.current=playDemo(demoAudio.current,word,status=>{if(mounted.current)setDemoState({word,...status})},()=>{if(mounted.current)setDemoState(null)});
  }else{
   speak(word,undefined,'en-US');
  }
 }
 function replay(clip:NonNullable<PracticeIssue['clip']>){
  pausePlayback();const audio=currentAudio.current;if(!audio)return;
  const end=Number.isFinite(audio.duration)?Math.min(clip.end,audio.duration):clip.end;
  if(end<=clip.start){setError('这段录音的定位不可用，请使用完整回放。');return;}
  try{audio.currentTime=clip.start;clipEnd.current=end;void audio.play().catch(()=>{clipEnd.current=null;setError('片段未能播放，请点击完整录音回放。')})}
  catch{clipEnd.current=null;setError('片段尚未就绪，请稍后重试或完整回听。')}
 }
 function stopTimer(){if(timer.current){clearInterval(timer.current);timer.current=null}}
 function stop(){
  stopTimer();
  if(capture.current){capture.current.stop();if(mounted.current){setRecording(false);setFinishing(true);setBusy(true)}}
  else if(pending.current){attempt.current++;pending.current=false;if(mounted.current)setBusy(false)}
 }
 useEffect(()=>{mounted.current=true;clips.current=(initialTakes||[]).slice(0,2).map(t=>({...t,url:URL.createObjectURL(t.blob)}));setTake(clips.current[0]||null);setPrevious(clips.current[1]||null);return()=>{mounted.current=false;attempt.current++;stopTimer();capture.current?.dispose();capture.current=null;pending.current=false;currentAudio.current?.pause();previousAudio.current?.pause();stopDemo.current?.();window.speechSynthesis?.cancel();request.current?.abort();clips.current.forEach(c=>URL.revokeObjectURL(c.url))}},[]);
 useEffect(()=>{stop();stopDemo.current?.()},[stopSignal]);
 useEffect(()=>{for(const audio of [currentAudio.current,previousAudio.current])if(audio)audio.playbackRate=Number(rate)},[rate,take?.url,previous?.url]);
 useEffect(()=>{
  if(!reference||!ONLINE){setService('unavailable');return;}
  setService('loading');
  const abort=new AbortController(),timeout=setTimeout(()=>{setService('failed');abort.abort()},6000);
  fetch('/api/pronunciation',{signal:abort.signal,cache:'no-store',credentials:'omit'}).then(async r=>r.ok?await r.json() as {enabled?:boolean}:null)
   .then(data=>{if(!abort.signal.aborted)setService(data?.enabled===true?'ready':data?.enabled===false?'unavailable':'failed')})
   .catch(()=>{if(!abort.signal.aborted)setService('failed')}).finally(()=>clearTimeout(timeout));
  return()=>{clearTimeout(timeout);abort.abort()};
 },[reference,serviceAttempt]);
 async function persist(takes:SavedTake[],event:PendingSave['event']){
  if(!onTakesChange)return;
  const payload={takes,event};savePending.current=payload;setPendingSave(payload);setSaving(true);
  try{await onTakesChange(takes,event);if(mounted.current){savePending.current=null;setPendingSave(null)}}
  finally{if(mounted.current)setSaving(false)}
 }
 async function retrySave(){
  const payload=savePending.current;if(!payload||saving)return;
  setError('');
  try{await persist(payload.takes,payload.event)}
  catch(error){if(mounted.current)setError(error instanceof Error?error.message:'保存失败，请先下载录音保留，再重试。')}
 }
 useEffect(()=>{
  if(!pendingSave)return;
  const warn=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue=''};
  window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);
 },[pendingSave]);
 async function start(){
  if(pending.current||capture.current||submitting||savePending.current)return;
  if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined'){setError('请在支持麦克风的安全网页环境中录音。');return;}
  const id=++attempt.current;
  pending.current=true;setBusy(true);setError('');pausePlayback();
  try{
   const s=await navigator.mediaDevices.getUserMedia({audio:true});
   if(!mounted.current||attempt.current!==id){s.getTracks().forEach(t=>t.stop());return;}
   const session=captureRecording(s);capture.current=session;pending.current=false;
   setBusy(false);setRecording(true);setElapsed(0);const started=Date.now();
   timer.current=setInterval(()=>{const seconds=Math.floor((Date.now()-started)/1000);setElapsed(seconds);if(reference&&seconds>=ASSESSMENT_SECONDS)stop()},200);
   const raw=await session.result;
   if(!mounted.current||attempt.current!==id)return;
   stopTimer();setRecording(false);setBusy(true);setFinishing(true);
   const blob=await playableRecording(raw);
   if(!mounted.current||attempt.current!==id)return;
   const next={id:`take-${crypto.randomUUID()}`,blob,url:URL.createObjectURL(blob)},old=clips.current[0]||null;
   clips.current.slice(1).forEach(c=>URL.revokeObjectURL(c.url));clips.current=[next,...(old?[old]:[])];
   setPrevious(old);setTake(next);
   await persist(clips.current.map(({url,...saved})=>saved),'recorded');
  }catch(error){if(mounted.current&&attempt.current===id)setError(error instanceof Error&&error.name==='Error'?error.message:'无法使用麦克风。请允许录音后重试。');}
  finally{if(attempt.current===id){stopTimer();capture.current=null;pending.current=false;if(mounted.current){setRecording(false);setBusy(false);setFinishing(false)}}}
 }
 async function submit(){
  if(!take||!consent||submitting||savePending.current)return;
  setSubmitting(true);setError('');cancelled.current=false;const abort=new AbortController();request.current=abort;
  const deadline=setTimeout(()=>abort.abort(),45000);
  try{
   const audio=await assessmentAudio(take.blob);if(abort.signal.aborted)throw Error('Aborted');
   const result=await assessRecording(audio,reference,abort.signal);if(!mounted.current)return;
   const updated={...take,result};clips.current[0]=updated;setTake(updated);
   await persist(clips.current.map(({url,...saved})=>saved),'assessed');
  }catch(e){if(mounted.current)setError(abort.signal.aborted?(cancelled.current?'已停止等待结果，录音仍在。请求可能已到达评估服务；本站不会自动重试。':'评估超时，录音仍在，可以稍后重试。'):e instanceof Error?e.message:'评估失败，请稍后再试。');}
  finally{clearTimeout(deadline);if(mounted.current)setSubmitting(false)}
 }
 return <div className="record-box recording-feedback">
  {ONLINE&&<audio ref={demoAudio} hidden style={{display:'none'}} preload="none" aria-label="美音示范播放器"/>}
  {reference&&!conceal&&<div className="record-reference"><div className="row spread"><strong>跟读这一句</strong>{onListen&&<button className="text-btn" disabled={recording||busy} onClick={listen}><Volume2 size={16}/>听原句</button>}</div>{hideReference?<details className="practice-reference"><summary>听后看原句，再跟读</summary><p lang="en">{reference}</p></details>:<p lang="en">{reference}</p>}<span className="muted small">每次最多 30 秒，先听原声，等播放结束再录音。</span></div>}
  <div className="row wrap"><button className={recording?'btn recording':'btn secondary'} disabled={busy||submitting||!!pendingSave} onClick={()=>recording?stop():void start()}>{recording?<Square size={16}/>:take?<RotateCcw size={16}/>:<Mic size={16}/>} {recording?`结束录音 · ${elapsed}秒`:finishing?'正在保存录音…':busy?'连接麦克风…':conceal?'先不看提示，说一遍':take?'再录一遍':'录一遍，听听自己'}</button><span className="muted small">{retentionLabel}</span>{busy&&!finishing&&<button className="text-btn" onClick={stop}>取消麦克风请求</button>}</div>
  {take&&!conceal&&<div className="record-playback"><label>这一次<audio key={take.url} ref={currentAudio} controls src={take.url} aria-label="我的录音回放" onPlay={()=>{if(recording||busy){currentAudio.current?.pause();return;}previousAudio.current?.pause();stopDemo.current?.();window.speechSynthesis?.cancel();onBeforeRecord?.()}} onPause={()=>{if(currentAudio.current?.paused)clipEnd.current=null}} onTimeUpdate={()=>{const audio=currentAudio.current;if(audio&&clipEnd.current!==null&&audio.currentTime>=clipEnd.current){audio.pause();clipEnd.current=null}}} onLoadedMetadata={()=>{if(currentAudio.current)currentAudio.current.playbackRate=Number(rate)}}/></label><PlaybackSpeed label="回放语速" ariaLabel="我的录音回放语速"/>{downloadPrefix&&<a className="text-btn" href={take.url} download={`${downloadPrefix}-current.wav`}>下载这一次录音</a>}</div>}
  {previous&&!conceal&&<details className="record-previous"><summary>与上一遍对比</summary><audio key={previous.url} ref={previousAudio} controls src={previous.url} aria-label="上一遍录音回放" onPlay={()=>{if(recording||busy){previousAudio.current?.pause();return;}currentAudio.current?.pause();stopDemo.current?.();window.speechSynthesis?.cancel();onBeforeRecord?.()}} onLoadedMetadata={()=>{if(previousAudio.current)previousAudio.current.playbackRate=Number(rate)}}/>{downloadPrefix&&<a className="text-btn" href={previous.url} download={`${downloadPrefix}-previous.wav`}>下载上一遍录音</a>}{previous.result&&take?.result&&<p className="small">发音准确度：{Math.round(previous.result.accuracy)} → {Math.round(take.result.accuracy)}；完整度：{Math.round(previous.result.completeness)} → {Math.round(take.result.completeness)}。以实际回听为准。</p>}</details>}
  {reference&&ONLINE&&!conceal&&<div className="record-assessment">
   {service==='loading'?<p className="small muted" role="status">正在检查评估服务…</p>:service==='ready'?<>
    <label className="record-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>点击提交时，将本句英文和这段录音发送到微软 Azure 进行基础发音评估。</span></label>
    <button className="btn full" disabled={!take||recording||busy||submitting||!!pendingSave||!consent||!!take.result} onClick={()=>void submit()}>{submitting?'正在评估…':take?.result?'已评估，试着重录一次':'提交评估'}</button>{submitting&&<button className="text-btn" onClick={()=>{cancelled.current=true;request.current?.abort()}}>停止等待评估</button>}
   </>:service==='failed'?<><p className="notice" role="status">暂时无法连接评估服务，录音和回听仍可使用。</p><button className="text-btn" onClick={()=>setServiceAttempt(value=>value+1)}>重新检查评估服务</button></>:<p className="notice">站内自动评估尚未启用。你仍可回听、对照原声，或使用下面的免费朗读练习。</p>}
   <details className="record-coach"><summary>用免费的 Reading Coach 练这句话</summary><p className="small muted">复制下面的英文，在微软页面选择添加自己的文章并粘贴，再重新朗读。本站录音不会自动传过去。</p><textarea aria-label="用于 Reading Coach 的英文" readOnly value={reference} onFocus={e=>e.currentTarget.select()}/><div className="row wrap"><button className="btn secondary" onClick={()=>{if(!navigator.clipboard){setCopyStatus('请长按选中上方英文进行复制。');return;}void navigator.clipboard.writeText(reference).then(()=>setCopyStatus('已复制英文')).catch(()=>setCopyStatus('复制不可用，请长按选中上方英文。'))}}>复制英文</button><a className="btn secondary" href="https://coach.microsoft.com/" target="_blank" rel="noreferrer noopener">打开 Reading Coach<ExternalLink size={15}/></a></div>{copyStatus&&<p role="status" className="small">{copyStatus}</p>}</details>
  </div>}
  {pendingSave&&!saving&&<div className="record-save-pending"><p role="status">本次录音与反馈尚未确认保存。先下载保留，再重试保存；不用重新录音或提交评估。</p><button className="btn secondary" disabled={busy||submitting} onClick={()=>void retrySave()}>重试保存本次录音与反馈</button></div>}
  {error&&<p className="record-error" role="alert">{error}</p>}
  {take?.result&&!conceal&&<PronunciationFeedback result={take.result} previous={previous?.result} disabled={recording||busy||submitting||!!pendingSave} onListen={onListen?listen:undefined} onDemo={demo} demoState={demoState} onReplay={replay} onRetry={()=>void start()}/>}
 </div>;
}

export function PronunciationFeedback({result,previous,disabled,onListen,onDemo,demoState,onReplay,onRetry}:{result:PronunciationResult;previous?:PronunciationResult;disabled:boolean;onListen?:()=>void;onDemo:(word:string)=>void;demoState?:DemoState|null;onReplay:(clip:NonNullable<PracticeIssue['clip']>)=>void;onRetry:()=>void}){
 const panel=useRef<HTMLElement>(null);
 useEffect(()=>{panel.current?.scrollIntoView({behavior:'smooth',block:'start'});panel.current?.focus({preventScroll:true})},[result]);
 const issues=practiceIssues(result),comparison=previous?retryFeedback(previous,result):[];
 return <section ref={panel} tabIndex={-1} className="record-result" aria-label="本次录音反馈" aria-live="polite">
  <h3>{issues.length?'这一遍先练这'+(issues.length===1?'一处':'两处'):'这遍没有检出明显的发音问题'}</h3>
  {issues.length?issues.map((issue,i)=><div className="record-issue" key={i}>
   <strong>{issue.title}</strong>
   {issue.phoneme&&<p className="small muted">/{issue.phoneme}/ 是需要留意的音。系统认为它与参考发音的匹配偏低，请先回听确认。</p>}
   <p>{issue.action}</p>
   {issue.example&&<p className="small">参考：<span lang="en">{issue.example}</span> 中的 /{issue.phoneme}/ 音。</p>}
   <div className="record-issue-actions">
    {issue.clip&&<button className="btn secondary" disabled={disabled} onClick={()=>onReplay(issue.clip!)}><Volume2 size={16}/>听我读的 {issue.word}</button>}
    {issue.word&&<button className="btn secondary" disabled={disabled} onClick={()=>onDemo(issue.word!)}><Volume2 size={16}/>{demoState?.word===issue.word&&demoState.state!=='error'?`${demoState.state==='loading'?'准备中':'停止示范'} · ${issue.word}`:`听 ${issue.word} 示范`}</button>}
    {issue.example&&issue.example!==issue.word?.toLowerCase()&&<button className="text-btn" disabled={disabled} onClick={()=>onDemo(issue.example!)}>{demoState?.word===issue.example&&demoState.state!=='error'?`${demoState.state==='loading'?'准备中':'停止示范'} · ${issue.example}`:`听例词 ${issue.example}`}</button>}
   </div>
   {demoState&&(demoState.word===issue.word||demoState.word===issue.example)&&<p className={demoState.state==='error'?'record-error':'small muted'} role={demoState.state==='error'?'alert':'status'}>{demoState.state==='error'?demoState.message:demoState.state==='loading'?'正在加载美音示范，点同一按钮可取消。':'正在播放美音示范。'}</p>}
  </div>):<p>再听一遍原声，留意声音和停顿，再用舒适的速度完整读一遍。</p>}
  {!!comparison.length&&<div className="record-comparison"><strong>上次练的地方，这次怎样？</strong><ul>{comparison.map((text,i)=><li key={i}>{text}</li>)}</ul></div>}
  <div className="record-issue-actions">{onListen&&<button className="btn secondary" disabled={disabled} onClick={onListen}><Volume2 size={16}/>再听课文原句</button>}<button className="btn" disabled={disabled} onClick={onRetry}><RotateCcw size={16}/>重录这句，看看改善</button></div>
  <p className="muted small">按美式英语参考评估；{ONLINE?'单词示范由 Azure 提供，无需安装手机语音包。':'单词示范使用本机美音。'}噪音、口音和连读可能影响结果，发音要点是练习提示。片段定位可能带上相邻声音。</p>
  <details><summary>查看本次练习数据</summary><dl className="record-scores"><div><dt>发音准确度</dt><dd>{Math.round(result.accuracy)}</dd></div><div><dt>连贯度</dt><dd>{Math.round(result.fluency)}</dd></div><div><dt>完整度</dt><dd>{Math.round(result.completeness)}</dd></div></dl><p className="muted small">各项满分 100，仅用于本句练习，不代表雅思分数。</p></details>
 </section>;
}
