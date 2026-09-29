import {getPlaybackRate,subscribePlaybackRate} from './playback-rate';

export type DemoStatus={state:'loading'|'playing'|'error';message?:string};

// Use an ordinary media URL and call play() in the tap handler. Fetching a Blob
// first can lose Safari's user activation before playback is requested.
export function playDemo(audio:HTMLAudioElement,word:string,onStatus:(status:DemoStatus)=>void,onEnd:()=>void){
 let finished=false;
 let timeout:ReturnType<typeof setTimeout>|undefined;
 const events=['studio:navigation','hashchange','popstate','pagehide'];
 const unsubscribe=subscribePlaybackRate(()=>{audio.playbackRate=Number(getPlaybackRate())});
 function clear(){
  finished=true;clearTimeout(timeout);unsubscribe();
  audio.onplaying=null;audio.onwaiting=null;audio.onended=null;audio.onerror=null;
  for(const event of events)window.removeEventListener(event,stop);
  document.removeEventListener('play',otherPlayback,true);
  audio.pause();audio.removeAttribute('src');audio.load();
 }
 function stop(){if(finished)return;clear();onEnd()}
 function fail(message:string){if(finished)return;clear();onStatus({state:'error',message})}
 function otherPlayback(event:Event){if(event.target!==audio)stop()}
 function waiting(){
  if(finished)return;
  clearTimeout(timeout);onStatus({state:'loading'});
  timeout=setTimeout(()=>fail('示范加载超时，请再点一次，或听课文原句。'),20000);
 }
 audio.onplaying=()=>{if(!finished){clearTimeout(timeout);onStatus({state:'playing'})}};
 audio.onwaiting=waiting;
 audio.onended=stop;
 audio.onerror=()=>fail('示范音频暂时无法加载，请稍后重试，或听课文原句。');
 for(const event of events)window.addEventListener(event,stop);
 document.addEventListener('play',otherPlayback,true);
 audio.src='/api/demo-audio?word='+encodeURIComponent(word);
 audio.playbackRate=Number(getPlaybackRate());audio.volume=1;audio.muted=false;
 waiting();
 try{void audio.play().catch(error=>fail(error?.name==='NotAllowedError'?'浏览器暂停了声音，请再点一次示范。':'示范音频暂时无法播放，请稍后重试，或听课文原句。'))}
 catch{fail('示范音频无法播放，请稍后重试，或听课文原句。')}
 return stop;
}
