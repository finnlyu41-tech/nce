import {useRef,useState} from 'react';
import type {Pack} from '../types';
import {listeningAudio} from './audio-assets';
/** Synthetic audio is a learning aid, never human delivery evidence or a score.
 * The player is exposed only after reference help is confirmed by the writer. */
export function StageListeningAudio({pack,beforeUse}:{pack:Pack;beforeUse:()=>Promise<boolean>}){
 const audio=useRef<HTMLAudioElement|null>(null),[ready,setReady]=useState(false),[busy,setBusy]=useState(false),[issue,setIssue]=useState('');
 async function playAudio(){setBusy(true);setIssue('');try{if(!await beforeUse())throw Error('练习来源尚未确认保存，输入保留。');setReady(true);if(audio.current){audio.current.src=listeningAudio[pack];try{await audio.current.play()}catch{setIssue('已准备合成练习音频，请再点播放器播放。')}}}catch(e){setIssue(e instanceof Error?e.message:String(e));}finally{setBusy(false);}}
 return <aside className="stage-audio-boundary"><p>本卷另有离线合成练习声音。使用它会如实记录参考帮助，不能充作协议要求的人声施测、实际听见或独立通过。真人施测仍须由真实已授权入口另行完成；此页不能创建该权限。</p><button disabled={busy||ready} data-stage-audio onClick={()=>void playAudio()}>使用本卷合成音频练习（不计独立）</button><audio ref={audio} controls={ready} preload="none" aria-label="本卷离线合成音频" style={{display:ready?'block':'none',width:'100%'}}/>{issue&&<p role="status">{issue}</p>}</aside>;
}
