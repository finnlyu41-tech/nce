import {useCallback,useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {StageHost,useStageHostRoute} from '../host';
import {commitStageDraft,readStageCheckpoint} from '../host-progress';
import {useRoute} from '../../app/use-route';
import {TodayPracticeQueue} from '../../app/today-practice-ui';
import {emptyProgress} from '../../map/model';
const mapInitial=emptyProgress();
import type {State} from '../../app/model';
import '../../app/globals.css';
import '../../app/mobile-layout.css';
// Testing-only local page. Uses the ACTUAL existing State IDB/writer, StageHost,
// ProgressSave and Today queue. No reset, clock override or fabricated grade.
function Fixture(){
 const requested=useRoute(),accepted=useStageHostRoute(requested),fail=useRef(false),[fault,setFault]=useState(false),[aborts,setAborts]=useState(0),[state,setState]=useState<State|null>(null);
 useEffect(()=>{const refresh=()=>{void readStageCheckpoint().then(x=>setState(x.state))};refresh();window.addEventListener('english-studio-progress-saved',refresh);return()=>window.removeEventListener('english-studio-progress-saved',refresh);},[]);
 const write=useCallback((expected:string|undefined,next:string,unchanged:()=>boolean=()=>true)=>{
  let checks=0;
  return commitStageDraft(expected,next,()=>{checks++;if(fail.current&&checks>=2){setAborts(n=>n+1);return false;}return unchanged();});
 },[]);
 return <><aside style={{padding:12,background:'#f5eccf'}}>仅本机隔离工程验收页面：真实既有IDB writer，合成输入，不代表真人或自然延迟。<button onClick={()=>{fail.current=!fail.current;setFault(fail.current)}}>{fault?'恢复正常保存':'模拟事务保存拒绝'}</button><span>实际事务guard拒绝：{aborts}</span></aside>
  {accepted.route.view==='stage-assessment'?<StageHost bind={accepted.bind} beforeLeave={accepted.beforeLeave} notice={accepted.notice} write={write}/>:<main className="workspace"><h1>今日练习 · 工程验收</h1>{state?<TodayPracticeQueue state={state} map={mapInitial} online={false}/>:<p>读取现有State…</p>}</main>}
 </>;
}
createRoot(document.getElementById('root')!).render(<Fixture/>);
