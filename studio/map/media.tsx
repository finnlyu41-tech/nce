import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
import {Volume2, Square, Mic, Download} from 'lucide-react';
import {loadSiteMaterial, readMaterialManifest} from '../app/site-material-utils';
import {captureRecording, type RecordingCapture} from '../app/recording-session';
import {playableRecording} from '../app/recording-audio';
import {unitById, type Clip} from './curriculum';

type Player = {play:(clip:Clip,done?:()=>void)=>void; stop:()=>void; label:string; active:string};
const PlayerContext=createContext<Player>({play:()=>{},stop:()=>{},label:'',active:''});
const clipKey=(c:Clip)=>`${c.book}-${c.lesson}-${c.start}-${c.end}`;
export function AudioSpace({children,controls=true}:{children:React.ReactNode;controls?:boolean}) {
  const element=useRef<HTMLAudioElement>(null),urls=useRef(new Map<string,string>()),request=useRef<AbortController|null>(null);
  const segment=useRef<{clip:Clip;done?:()=>void}|null>(null),alive=useRef(true),sequence=useRef(0);
  const [label,setLabel]=useState(''),[active,setActive]=useState(''),[speed,setSpeed]=useState('0.85');
  function stop(){sequence.current++;request.current?.abort();element.current?.pause();segment.current=null;setActive('');setLabel('已停止');}
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;sequence.current++;request.current?.abort();element.current?.pause();for(const url of urls.current.values())URL.revokeObjectURL(url)}},[]);
  function finish(){const item=segment.current;if(!item)return;element.current?.pause();segment.current=null;setActive('');setLabel('这一句播放完成');item.done?.();}
  async function play(clip:Clip,done?:()=>void){
    const token=++sequence.current;request.current?.abort();element.current?.pause();segment.current=null;setActive(clipKey(clip));
    const key=`${clip.book}-${clip.lesson}`,controller=new AbortController();request.current=controller;
    try{
      let url=urls.current.get(key);
      if(!url){
        setLabel('正在读取原声目录…');
        const manifest=await readMaterialManifest(controller.signal);
        const source=unitById(key.toLowerCase());
        const text=manifest.files.find(f=>f.type==='text/plain'&&f.book===clip.book&&f.lesson===clip.lesson&&f.sha256===source?.sourceSha256);
        const audio=manifest.files.find(f=>f.type.startsWith('audio/')&&f.pairId===text?.pairId&&f.book===clip.book&&f.lesson===clip.lesson);
        if(!text||!audio)throw Error('原声与课文版本不一致，请回经典模式核对教材。');
        const blob=await loadSiteMaterial(audio,controller.signal,n=>{if(alive.current&&token===sequence.current)setLabel(`正在加载原声 ${Math.round(n)}%`)});
        if(!alive.current||token!==sequence.current)return;
        url=URL.createObjectURL(blob);urls.current.set(key,url);
      }
      if(!alive.current||token!==sequence.current)return;
      const audio=element.current!;
      if(audio.src!==url){audio.src=url;audio.load();}
      const launch=()=>{if(token!==sequence.current)return;audio.currentTime=clip.start;audio.playbackRate=Number(speed);segment.current={clip,done};setLabel('正在播放原声');audio.play().catch(()=>{if(token===sequence.current){setLabel('浏览器暂停了播放，请再点一次喇叭。');setActive('');segment.current=null;}})};
      if(audio.readyState>=1)launch();else audio.onloadedmetadata=()=>{audio.onloadedmetadata=null;launch()};
    }catch(error){if(alive.current&&token===sequence.current){setActive('');setLabel(error instanceof Error?error.message:'原声加载失败，请重试。')}}
  }
  return <PlayerContext.Provider value={{play,stop,label,active}}>{children}{controls&&<div className="audio-dock"><Volume2 size={16}/><span role="status">{label||'点喇叭播放教材原声'}</span><label>语速<select aria-label="原声播放速度" value={speed} onChange={e=>{setSpeed(e.target.value);if(element.current)element.current.playbackRate=Number(e.target.value)}}><option value="0.7">0.7×</option><option value="0.85">0.85×</option><option value="1">1×</option></select></label><button type="button" onClick={stop} aria-label="停止或取消原声"><Square size={15}/></button></div>}<audio ref={element} preload="none" onTimeUpdate={()=>{const s=segment.current;if(s&&element.current!.currentTime>=s.clip.end-.08)finish()}} onEnded={finish} onError={()=>{segment.current=null;setActive('');setLabel('原声暂时无法播放，请重新点击加载。')}}/></PlayerContext.Provider>;
}
export function ClipButton({clip,done,label='听原声'}:{clip:Clip;done?:()=>void;label?:string}){
  const audio=useContext(PlayerContext);
  return <button type="button" className={`clip-button ${audio.active===clipKey(clip)?'playing':''}`} onClick={()=>audio.play(clip,done)}><Volume2 size={16}/>{audio.active===clipKey(clip)?'播放中…':label}</button>;
}
export function StopAudio(){const audio=useContext(PlayerContext);useEffect(()=>{audio.stop()},[]);return null;}

async function recordingStore(key:string,blob?:Blob):Promise<Blob|undefined>{
  return new Promise((resolve,reject)=>{
    const open=indexedDB.open('wayfinder-recordings-v2',1);
    open.onupgradeneeded=()=>open.result.createObjectStore('recordings');
    open.onerror=()=>reject(Error('录音存储暂不可用，请下载后保留。'));
    open.onsuccess=()=>{const db=open.result,tx=db.transaction('recordings',blob?'readwrite':'readonly'),store=tx.objectStore('recordings'),req=blob?store.put(blob,key):store.get(key);let result:Blob|undefined;
      req.onsuccess=()=>{result=blob||req.result};tx.oncomplete=()=>{db.close();resolve(result)};tx.onerror=()=>{db.close();reject(Error('录音保存失败，请下载后保留。'))};};
  });
}
export function Recorder({id,onSaved}:{id:string;onSaved?:(name:string)=>void}){
  const player=useContext(PlayerContext);
  const [blob,setBlob]=useState<Blob>(),[url,setUrl]=useState(''),[status,setStatus]=useState(''),[phase,setPhase]=useState('idle'),[seconds,setSeconds]=useState(0);
  const session=useRef<RecordingCapture|null>(null),generation=useRef(0),alive=useRef(true),timer=useRef<ReturnType<typeof setInterval>|undefined>(undefined);
  useEffect(()=>{alive.current=true;recordingStore(id).then(b=>{if(alive.current&&b)setBlob(b)}).catch(()=>{if(alive.current)setStatus('旧录音暂时无法读取，可用另存的文件继续。')});return()=>{alive.current=false;generation.current++;clearInterval(timer.current);session.current?.dispose()}},[id]);
  useEffect(()=>{if(!blob)return;const u=URL.createObjectURL(blob);setUrl(u);return()=>URL.revokeObjectURL(u)},[blob]);
  async function start(){
    player.stop();
    const token=++generation.current;setPhase('requesting');setStatus('等待麦克风权限…');setSeconds(0);
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      if(!alive.current||token!==generation.current){stream.getTracks().forEach(t=>t.stop());return;}
      const capture=captureRecording(stream);session.current=capture;setPhase('recording');setStatus('正在录音；结束后可回听、下载。');const start=Date.now();
      timer.current=setInterval(()=>{const sec=Math.floor((Date.now()-start)/1000);setSeconds(sec);if(sec>=180){capture.stop();setPhase('saving');clearInterval(timer.current)}},500);
      const recorded=await capture.result;clearInterval(timer.current);setPhase('saving');setStatus('正在检查并保存录音…');
      const playable=await playableRecording(recorded);
      if(!alive.current||token!==generation.current)return;
      setBlob(playable);
      await recordingStore(id,playable);
      if(!alive.current||token!==generation.current)return;
      onSaved?.(`wayfinder-${id}.wav（此浏览器，已另存备份后可跨设备）`);setStatus('录音已保存在此浏览器，请回听并下载留底。');
    }catch(error){if(alive.current&&token===generation.current)setStatus(error instanceof Error?error.message:'录音失败，请检查麦克风权限。')}
    finally{if(alive.current&&token===generation.current){setPhase('idle');session.current=null;clearInterval(timer.current)}}
  }
  const stop=()=>{if(phase==='requesting'){generation.current++;setPhase('idle');setStatus('已取消麦克风请求。')}else{session.current?.stop();setPhase('saving');setStatus('正在保存最后一段声音…');clearInterval(timer.current)}};
  return <section className="map-recorder"><div><Mic size={18}/><strong>录下自己的表达</strong><span>{seconds?`${seconds} 秒`:''}</span></div><p>跟读后盖住课文再说。回听时检查是否听得清、是否漏掉意思。录音仅留在本浏览器，不自动上传或打 IELTS 分数。</p><div className="recorder-actions">{phase==='idle'?<button type="button" className="secondary" onClick={start}>{blob?'重新录一遍':'开始录音'}</button>:<button type="button" className="secondary" disabled={phase==='saving'} onClick={stop}>{phase==='requesting'?'取消请求':phase==='saving'?'正在保存…':'结束录音'}</button>}{url&&<a href={url} download={`wayfinder-${id}.wav`}><Download size={15}/>下载录音</a>}</div>{url&&<audio controls src={url} preload="metadata"/>}<p role="status">{status}</p><small>每段最多 3 分钟；进度 JSON 不包含音频，换设备前请单独下载。</small></section>;
}
