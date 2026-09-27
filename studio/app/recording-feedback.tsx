'use client';
import {useEffect,useRef,useState} from 'react';
import {Mic,Square,Volume2,RotateCcw,ExternalLink} from 'lucide-react';
import {toast} from 'sonner';
import {PlaybackSpeed,usePlaybackRate} from './playback-speed';
import {ONLINE} from './runtime-mode';
import {assessmentAudio,ASSESSMENT_SECONDS} from './recording-audio';
import {assessRecording,getPersonalToken,setPersonalToken,practiceIssues,PronunciationResult} from './pronunciation';
import './recording-feedback.css';

type Take={blob:Blob;url:string;result?:PronunciationResult};
type Props={referenceText?:string;onListen?:()=>void;onBeforeRecord?:()=>void;stopSignal?:number};
export function Recorder({referenceText,onListen,onBeforeRecord,stopSignal}:Props){
 const reference=referenceText?.trim()||'';
 return <RecordingSession key={reference} reference={reference} onListen={onListen} onBeforeRecord={onBeforeRecord} stopSignal={stopSignal}/>;
}
function RecordingSession({reference,onListen,onBeforeRecord,stopSignal}:{reference:string;onListen?:()=>void;onBeforeRecord?:()=>void;stopSignal?:number}){
 const rate=usePlaybackRate(),[take,setTake]=useState<Take|null>(null),[previous,setPrevious]=useState<Take|null>(null);
 const [recording,setRecording]=useState(false),[busy,setBusy]=useState(false),[submitting,setSubmitting]=useState(false),[elapsed,setElapsed]=useState(0);
 const [consent,setConsent]=useState(false),[service,setService]=useState<'loading'|'ready'|'unavailable'>('loading'),[error,setError]=useState('');
 const [token,setToken]=useState(getPersonalToken);
 const recorder=useRef<MediaRecorder|null>(null),stream=useRef<MediaStream|null>(null),mounted=useRef(false),pending=useRef(false);
 const clips=useRef<Take[]>([]),timer=useRef<ReturnType<typeof setInterval>|null>(null),request=useRef<AbortController|null>(null);
 const currentAudio=useRef<HTMLAudioElement>(null),previousAudio=useRef<HTMLAudioElement>(null);
 function stopTimer(){if(timer.current){clearInterval(timer.current);timer.current=null}}
 function stop(){stopTimer();if(recorder.current?.state==='recording')recorder.current.stop();stream.current?.getTracks().forEach(t=>t.stop())}
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;stop();request.current?.abort();clips.current.forEach(c=>URL.revokeObjectURL(c.url))}},[]);
 useEffect(()=>{stop()},[stopSignal]);
 useEffect(()=>{for(const audio of [currentAudio.current,previousAudio.current])if(audio)audio.playbackRate=Number(rate)},[rate,take?.url,previous?.url]);
 useEffect(()=>{
  if(!reference||!ONLINE){setService('unavailable');return;}
  const abort=new AbortController(),timeout=setTimeout(()=>{setService('unavailable');abort.abort()},6000);
  fetch('/api/pronunciation',{signal:abort.signal,cache:'no-store',credentials:'omit'}).then(async r=>r.ok?await r.json() as {enabled?:boolean}:null)
   .then(data=>{if(!abort.signal.aborted)setService(data?.enabled===true?'ready':'unavailable')})
   .catch(()=>{if(!abort.signal.aborted)setService('unavailable')}).finally(()=>clearTimeout(timeout));
  return()=>{clearTimeout(timeout);abort.abort()};
 },[reference]);
 async function start(){
  if(pending.current||recording||submitting)return;
  if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined'){toast.error('请在支持麦克风的安全网页环境中录音。');return;}
  pending.current=true;setBusy(true);setError('');currentAudio.current?.pause();previousAudio.current?.pause();window.speechSynthesis?.cancel();onBeforeRecord?.();
  try{
   const s=await navigator.mediaDevices.getUserMedia({audio:true});
   if(!mounted.current){s.getTracks().forEach(t=>t.stop());return;}stream.current=s;
   const r=new MediaRecorder(s),chunks:BlobPart[]=[];recorder.current=r;
   r.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
   r.onerror=()=>{stop();if(mounted.current){setRecording(false);setError('录音中断，请检查麦克风后重试。')}};
   r.onstop=()=>{
    stopTimer();s.getTracks().forEach(t=>t.stop());
    if(!mounted.current)return;setRecording(false);
    const blob=new Blob(chunks,{type:r.mimeType});if(!blob.size){setError('没有录到声音，请重试。');return;}
    const next={blob,url:URL.createObjectURL(blob)},old=clips.current[0]||null;
    clips.current.slice(1).forEach(c=>URL.revokeObjectURL(c.url));clips.current=[next,...(old?[old]:[])];
    setPrevious(old);setTake(next);
   };
   r.start();setRecording(true);setElapsed(0);const started=Date.now();
   timer.current=setInterval(()=>{const seconds=Math.floor((Date.now()-started)/1000);setElapsed(seconds);if(reference&&seconds>=ASSESSMENT_SECONDS)stop()},200);
  }catch{stream.current?.getTracks().forEach(t=>t.stop());if(mounted.current)setError('无法使用麦克风。请允许录音后重试。');}
  finally{pending.current=false;if(mounted.current)setBusy(false)}
 }
 async function submit(){
  if(!take||!consent||!token.trim()||submitting)return;
  setPersonalToken(token);setSubmitting(true);setError('');const abort=new AbortController();request.current=abort;
  const deadline=setTimeout(()=>abort.abort(),45000);
  try{
   const audio=await assessmentAudio(take.blob);if(abort.signal.aborted)throw Error('Aborted');
   const result=await assessRecording(audio,reference,abort.signal);if(!mounted.current)return;
   const updated={...take,result};clips.current[0]=updated;setTake(updated);
  }catch(e){if(mounted.current)setError(abort.signal.aborted?'评估超时，录音仍在，可以稍后重试。':e instanceof Error?e.message:'评估失败，请稍后再试。');}
  finally{clearTimeout(deadline);if(mounted.current)setSubmitting(false)}
 }
 const issues=take?.result?practiceIssues(take.result):[];
 return <div className="record-box recording-feedback">
  {reference&&<div className="record-reference"><div className="row spread"><strong>跟读这一句</strong>{onListen&&<button className="text-btn" disabled={recording||busy} onClick={onListen}><Volume2 size={16}/>听原句</button>}</div><p lang="en">{reference}</p><span className="muted small">每次最多 30 秒，先听，再读。</span></div>}
  <div className="row wrap"><button className={recording?'btn recording':'btn secondary'} disabled={busy||submitting} onClick={()=>recording?stop():void start()}>{recording?<Square size={16}/>:take?<RotateCcw size={16}/>:<Mic size={16}/>} {recording?`结束录音 · ${elapsed}秒`:busy?'连接麦克风…':take?'再录一遍':'录一遍，听听自己'}</button><span className="muted small">录音在离开本练习或刷新后清除</span></div>
  {take&&<div className="record-playback"><label>这一次<audio ref={currentAudio} controls src={take.url} aria-label="我的录音回放" onLoadedMetadata={()=>{if(currentAudio.current)currentAudio.current.playbackRate=Number(rate)}}/></label><PlaybackSpeed label="回放语速" ariaLabel="我的录音回放语速"/></div>}
  {previous&&<details className="record-previous"><summary>与上一遍对比</summary><audio ref={previousAudio} controls src={previous.url} aria-label="上一遍录音回放" onLoadedMetadata={()=>{if(previousAudio.current)previousAudio.current.playbackRate=Number(rate)}}/>{previous.result&&take?.result&&<p className="small">发音准确度：{Math.round(previous.result.accuracy)} → {Math.round(take.result.accuracy)}；完整度：{Math.round(previous.result.completeness)} → {Math.round(take.result.completeness)}。以实际回听为准。</p>}</details>}
  {reference&&ONLINE&&<div className="record-assessment">
   {service==='loading'?<p className="small muted" role="status">正在检查评估服务…</p>:service==='ready'?<>
    <details className="record-access" open={!token}><summary>个人评估口令</summary><label className="field">仅用于使用这台站点的评估服务<input type="password" autoComplete="off" value={token} onChange={e=>{setToken(e.target.value);setPersonalToken(e.target.value)}} placeholder="输入个人口令"/></label><p className="small muted">只在本次页面记住，刷新后需要重新输入。</p></details>
    <label className="record-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>点击提交时，将本句英文和这段录音发送到微软 Azure 进行基础发音评估。</span></label>
    <button className="btn full" disabled={!take||recording||busy||submitting||!consent||!token.trim()||!!take.result} onClick={()=>void submit()}>{submitting?'正在评估…':take?.result?'已评估，试着重录一次':'提交评估'}</button>
   </>:<p className="notice">站内自动评估尚未启用。你仍可回听、对照原声，或使用下面的免费朗读练习。</p>}
   <details className="record-coach"><summary>用免费的 Reading Coach 练这句话</summary><p className="small muted">复制下面的英文，在微软页面选择添加自己的文章并粘贴，再重新朗读。本站录音不会自动传过去。</p><textarea aria-label="用于 Reading Coach 的英文" readOnly value={reference} onFocus={e=>e.currentTarget.select()}/><div className="row wrap"><button className="btn secondary" onClick={()=>{if(!navigator.clipboard){toast.error('请长按选中上方英文进行复制。');return;}void navigator.clipboard.writeText(reference).then(()=>toast.success('已复制英文')).catch(()=>toast.error('复制不可用，请长按选中上方英文。'))}}>复制英文</button><a className="btn secondary" href="https://coach.microsoft.com/" target="_blank" rel="noreferrer noopener">打开 Reading Coach<ExternalLink size={15}/></a></div></details>
  </div>}
  {error&&<p className="record-error" role="alert">{error}</p>}
  {take?.result&&<section className="record-result" aria-label="本次录音反馈" aria-live="polite"><h3>{issues.length?'这一遍先练这'+(issues.length===1?'一处':'两处'):'这遍没有检出明显的单词问题'}</h3>{issues.length?issues.map((issue,i)=><div className="record-issue" key={i}><strong>{issue.title}</strong><p>{issue.action}</p></div>):<p>再听一遍原声，然后试着不看文字说出来。</p>}<p className="muted small">自动反馈可能受录音和口音影响，请结合原声回听。</p><details><summary>查看本次练习数据</summary><dl className="record-scores"><div><dt>发音准确度</dt><dd>{Math.round(take.result.accuracy)}</dd></div><div><dt>连贯度</dt><dd>{Math.round(take.result.fluency)}</dd></div><div><dt>完整度</dt><dd>{Math.round(take.result.completeness)}</dd></div></dl><p className="muted small">各项满分 100，仅用于本句练习，不代表雅思分数。</p></details></section>}
 </div>;
}
