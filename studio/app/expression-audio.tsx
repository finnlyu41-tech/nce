'use client';
import {useEffect,useRef,useState} from 'react';
import {Square,Volume2} from 'lucide-react';
import type {NceBookId} from './model';
import {loadSiteMaterial,pairedMaterials,readMaterialManifest} from './site-material-utils';
import {PlaybackSpeed,usePlaybackRate} from './playback-speed';
import {speak} from './speech';
import {ONLINE} from './runtime-mode';

type Props={book:NceBookId;lesson:number;sourceSha256?:string;text:string;start?:number;end?:number;stopSignal:number};
export function ExpressionAudio({book,lesson,sourceSha256,text,start,end,stopSignal}:Props){
 const player=useRef<HTMLAudioElement>(null),controller=useRef<AbortController|null>(null),url=useRef('');
 const [busy,setBusy]=useState(false),[playing,setPlaying]=useState(false),[error,setError]=useState('');
 const rate=usePlaybackRate(),rateRef=useRef(rate);rateRef.current=rate;
 const original=ONLINE&&!!sourceSha256&&start!==undefined&&Number.isFinite(start)&&start>=0;
 function stop(){controller.current?.abort();controller.current=null;player.current?.pause();window.speechSynthesis?.cancel();setBusy(false);setPlaying(false)}
 useEffect(()=>{stop()},[stopSignal]);
 useEffect(()=>{const audio=player.current;return()=>{controller.current?.abort();audio?.pause();window.speechSynthesis?.cancel();if(url.current)URL.revokeObjectURL(url.current)}},[]);
 useEffect(()=>{if(player.current)player.current.playbackRate=Number(rate)},[rate]);
 async function play(){
  if(busy||playing){stop();return}
  setError('');window.speechSynthesis?.cancel();
  if(!original){setPlaying(true);speak(text,()=>setPlaying(false));return}
  const abort=new AbortController();controller.current=abort;
  try{
   if(!url.current){
    setBusy(true);
    const {files}=await readMaterialManifest(abort.signal);
    const transcript=files.find(f=>f.book===book&&f.lesson===lesson&&f.type==='text/plain'&&f.sha256===sourceSha256);
    const recording=transcript&&pairedMaterials(files,transcript).find(f=>f.type.startsWith('audio/'));
    if(!recording)throw Error('这句原声暂时没有找到，可以先听本机示范。');
    const blob=await loadSiteMaterial(recording,abort.signal);
    if(abort.signal.aborted)return;
    url.current=URL.createObjectURL(blob);
   }
   const audio=player.current;if(!audio||abort.signal.aborted)return;
   if(audio.src!==url.current)audio.src=url.current;
   audio.currentTime=start!;audio.playbackRate=Number(rateRef.current);
   await audio.play();
  }catch(e){if(!abort.signal.aborted)setError(url.current?'音频已就绪，请再点一次播放。':e instanceof Error?e.message:'原声暂时无法播放，请重试。')}
  finally{if(controller.current===abort){controller.current=null;setBusy(false)}}
 }
 return <div className="expression-audio">
  <div className="row wrap"><button className="btn secondary" onClick={()=>void play()} aria-label={busy?'取消载入原声':playing?'停止这句播放':original?'听这句原声':'听本机示范'}>{busy||playing?<Square size={17}/>:<Volume2 size={17}/>} {busy?'正在载入 · 取消':playing?'停止播放':original?'听这句原声':'听本机示范'}</button><PlaybackSpeed ariaLabel="表达原句语速"/></div>
  <audio ref={player} aria-label="表达原句音频" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)} onTimeUpdate={()=>{const audio=player.current;if(audio&&end!==undefined&&audio.currentTime>=end)audio.pause()}} onError={()=>{setPlaying(false);setError('这份音频暂时无法播放，可以重试或听本机示范。')}}/>
  {error&&<p className="small" role="status">{error}<button className="text-btn" onClick={()=>{stop();speak(text)}}>听本机示范</button></p>}
 </div>;
}
