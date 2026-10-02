import {useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {initial,type State} from '../../app/model';
import {createStageAdapter,stateWithStageDraft} from '../adapter';
import {StageAssessment} from '../StageAssessment';
// In-memory host fixture only: no localStorage, IndexedDB, synthetic learner,
// evaluator scores, recorder or clock override. Reload intentionally resets it.
function Preview(){
 const [state,setState]=useState<State>(structuredClone(initial));
 const [adapter]=useState(()=>{
  let current=structuredClone(initial);
  return createStageAdapter({courseVersion:'fb34b97c855c2c048faffe42cab3cf5cf94890c7',read:()=>current,commit:async(expected,next)=>{current=stateWithStageDraft(current,expected,next);setState(current);return true;}});
 });
 const learner=useMemo(()=>({load:adapter.load,learner:adapter.learner,exportEvidence:adapter.exportEvidence,restoreEvidence:adapter.restoreEvidence}),[adapter]);
 return <><aside style={{padding:'12px 20px',background:'#efe5c7',textAlign:'center'}}>独立工程预览 · 仅内存宿主，刷新即清空，请下载证据演示恢复 · 没有外评权限，所有成绩待人工</aside><StageAssessment port={learner}/><p style={{textAlign:'center',fontSize:12}}>宿主已有 drafts：{Object.keys(state.drafts).length} · 不写 map、FSRS 或分数</p></>;
}
createRoot(document.getElementById('root')!).render(<Preview/>);
