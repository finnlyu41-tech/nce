import type {State} from './model';
import {courseLoopFor,courseLoopBindings,parseCourseLoop} from './course-loop-progress';
import {continueNode,statusMap,type Progress} from '../map/model';
import {nodeById,type MapNode} from '../map/content';

/** A missing next-course mapping must retain a real destination. Unknown IDs
 * use the supplied current route; selecting it creates no completion evidence. */
export function courseSuccessorNode(id:string,fallback:MapNode):MapNode {
 const successorIds:Record<string,string>={'nce1-1':'nce1-3','nce1-3':'nce1-5','nce1-5':'nce1-7','nce1-7':'nce1-9','nce1-9':'nce1-11','nce1-11':'nce1-13','nce1-13':'nce1-15','nce1-15':'nce1-17','nce1-17':'nce1-19','nce1-19':'nce1-21','nce1-21':'nce1-23','nce1-23':'nce1-25','nce1-25':'nce1-27','nce1-27':'nce1-29','nce1-29':'nce1-31','nce1-31':'nce1-33','nce1-33':'nce1-35','nce1-35':'nce1-37','nce1-37':'nce1-39','nce1-39':'nce1-41','nce1-41':'nce1-43','nce1-43':'nce1-45','nce1-45':'nce1-47','nce1-47':'nce1-49','nce1-49':'nce1-51','nce1-51':'nce1-53','nce1-53':'nce1-55','nce1-55':'nce1-57','nce1-57':'nce1-59','nce1-59':'nce1-61','nce1-61':'nce1-63','nce1-63':'nce1-65','nce1-65':'nce1-67','nce1-67':'nce1-69','nce1-69':'nce1-71','nce1-71':'nce1-73','nce1-73':'nce1-75','nce1-75':'nce1-77','nce1-77':'nce1-79','nce1-79':'nce1-81','nce1-81':'nce1-83','nce1-83':'nce1-85','nce1-85':'nce1-87','nce1-87':'nce1-89','nce1-89':'nce1-91','nce1-91':'nce1-93','nce1-93':'nce1-95','nce1-95':'nce1-97','nce1-97':'nce1-99','nce1-99':'nce1-101','nce1-101':'nce1-103','nce1-103':'nce1-105','nce1-105':'nce1-107','nce1-107':'nce1-109'};
 return nodeById(successorIds[id])||nodeById(id)||fallback;
}

/** One host selector for Today, the map and course continuation. It grants no
 * completion/unlock and never copies the course interval into map or FSRS. */
export function nextCourse(state:State,map:Progress,now=Date.now()):MapNode {
 const saved=courseLoopBindings.flatMap(course=>{
  const raw=state.drafts[course.key];if(raw===undefined)return [];
  const parsed=parseCourseLoop(raw,now,course.id);
  return [{course,parsed,next:parsed.ok?course.model.recommendation(parsed.view,now):null}];
 });
 const unfinished=saved.filter(item=>!item.parsed.ok||item.next?.kind==='resume').sort((a,b)=>(a.parsed.ok?a.parsed.view.lastAt:now)-(b.parsed.ok?b.parsed.view.lastAt:now))[0];
 if(unfinished)return nodeById(unfinished.course.id)||continueNode(map,now);
 const due=saved.filter(item=>item.next?.kind==='review').sort((a,b)=>(a.next?.dueAt||now)-(b.next?.dueAt||now))[0];
 if(due)return nodeById(due.course.id)||continueNode(map,now);
 const finished=saved.filter(item=>item.next?.kind==='continue-route'||item.next?.kind==='needs-new-material');
 if(!finished.length)return continueNode(map,now);
 const current=continueNode(map,now),last=map.lastNode?nodeById(map.lastNode):undefined;
 const successor=(id:string)=>courseSuccessorNode(id,current);
 // Preserve advanced or reset map routes. A completed selected course can
 // move to its successor only when it is still the map's active course.
 if(last&&last.id!=='nce1-1'&&last.stage!=='starter'&&last.id!==nodeById('nce1-1')?.parent){
  const completedLast=finished.find(item=>item.course.id===last.id);
  return completedLast&&current.id===last.id?successor(last.id):current;
 }
 return successor(finished.at(-1)!.course.id);
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
export function courseLoopTask(state:State,now=Date.now(),courseId:string='nce1-1'){
 const {key,lesson,model:loopModel}=courseLoopFor(courseId);
 const raw=state.drafts[key];if(raw===undefined)return null;
 const parsed=parseCourseLoop(raw,now,courseId);
 if(!parsed.ok)return {kind:'resume' as const,at:now,reason:'已保存的本课记录需要核对，原文仍保留。'};
 const next=loopModel.recommendation(parsed.view,now);
 if(next.kind==='continue-route')return null;
 // Keep a finite-pool follow-up visible without inventing another unseen bank.
 // Route continuation remains available independently of this honest task.
 if(next.kind==='needs-new-material')return {kind:'repair' as const,at:next.dueAt||parsed.view.lastAt,
  reason:'本课两组新题已用完；下一次独立检验需要补充材料。返回核对已有首答与订正，开放表达仍待人工核对。'};
 return {kind:next.kind==='review'?'review' as const:'resume' as const,at:next.dueAt||parsed.view.lastAt,
  reason:next.kind==='review'?`第 ${lesson.lessons[0]}–${lesson.lessons[1]} 课已到回想时间，换一组未看过的题。`:'接着已保存的本题、首答与订正继续。'};
}
