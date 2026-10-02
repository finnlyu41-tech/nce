import type {State} from './model';
import {courseLoopKey,parseCourseLoop,loopModel} from './course-loop-progress';
import {continueNode,statusMap,type Progress} from '../map/model';
import {nodeById,type MapNode} from '../map/content';

/** One host selector for Today, the map and course continuation. It grants no
 * completion/unlock and never copies the course interval into map or FSRS. */
export function nextCourse(state:State,map:Progress,now=Date.now()):MapNode {
 const raw=state.drafts[courseLoopKey];
 if(raw!==undefined){
  const parsed=parseCourseLoop(raw,now);
  if(!parsed.ok)return nodeById('nce1-1')!;
  const next=loopModel.recommendation(parsed.view,now);
  if(next.kind!=='continue-route'&&next.kind!=='needs-new-material')return nodeById('nce1-1')!;
  const current=continueNode(map,now);
  // Continue an already advanced route. The pilot is not a permanent pin to
  // lesson 3 and never manufactures lesson 1 completion to unlock a successor.
  const last=map.lastNode?nodeById(map.lastNode):undefined;
  if(last&&last.id!=='nce1-1'&&(last.stage!=='starter')&&last.id!==nodeById('nce1-1')?.parent)return current;
  return nodeById('nce1-3')!;
 }
 return continueNode(map,now);
}
/** A read-only destination. The one-shot access intent is consumed only after
 * the learner clicks through and the existing guarded map save succeeds. */
export function courseAccessHref(id:string,map:Progress,now=Date.now()){
 if(!nodeById(id))throw new RangeError('Course destination does not exist.');
 return `/map/#/learn/${id}${statusMap(map,now)[id]==='locked'?'?access=1':''}`;
}
export function courseDestination(state:State,map:Progress,now=Date.now()){
 const node=nextCourse(state,map,now);
 return {node,href:courseAccessHref(node.id,map,now),needsAccess:statusMap(map,now)[node.id]==='locked'};
}
/** A continuation must not advertise a later course when the shared selector
 * points back to this course after access choices or route conditions change. */
export function courseContinuation(state:State,map:Progress,currentId:string,now=Date.now()){
 const destination=courseDestination(state,map,now),current=destination.node.id===currentId;
 return {...destination,
  href:current?`/map/#/map/${currentId}?conditions=1`:destination.href,
  label:current?'查看当前路线条件':'继续后续课次',
  reason:current?'当前路线仍推荐本课。继续后续课程前，请先查看地图检验与解锁条件。':'可以继续后续课次，到期时再回到本课。',
  currentRoute:current,
 };
}
export function courseLoopTask(state:State,now=Date.now()){
 const raw=state.drafts[courseLoopKey];if(raw===undefined)return null;
 const parsed=parseCourseLoop(raw,now);
 if(!parsed.ok)return {kind:'resume' as const,at:now,reason:'已保存的本课记录需要核对，原文仍保留。'};
 const next=loopModel.recommendation(parsed.view,now);
 if(next.kind==='continue-route'||next.kind==='needs-new-material')return null;
 return {kind:next.kind==='review'?'review' as const:'resume' as const,at:next.dueAt||parsed.view.lastAt,
  reason:next.kind==='review'?'第 1–2 课已到回想时间，换一组未看过的题。':'接着已保存的本题、首答与订正继续。'};
}
