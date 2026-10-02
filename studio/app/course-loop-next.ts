import type {State} from './model';
import {courseLoopKey,parseCourseLoop,loopModel} from './course-loop-progress';
import {continueNode,type Progress} from '../map/model';
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
export function courseLoopTask(state:State,now=Date.now()){
 const raw=state.drafts[courseLoopKey];if(raw===undefined)return null;
 const parsed=parseCourseLoop(raw,now);
 if(!parsed.ok)return {kind:'resume' as const,at:now,reason:'已保存的本课记录需要核对，原文仍保留。'};
 const next=loopModel.recommendation(parsed.view,now);
 if(next.kind==='continue-route'||next.kind==='needs-new-material')return null;
 return {kind:next.kind==='review'?'review' as const:'resume' as const,at:next.dueAt||parsed.view.lastAt,
  reason:next.kind==='review'?'第 1–2 课已到回想时间，换一组未看过的题。':'接着已保存的本题、首答与订正继续。'};
}
