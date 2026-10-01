import {nodeById} from './content';
import {due,passedQuiz,restartQuiz,statusMap,type Progress} from './model';

/** Open an actually due completed check. Never discard an unfinished round. */
export function prepareDueReview(state:Progress,id:string,now=Date.now()):Progress {
 const node=nodeById(id),record=state.records[id],last=record?.attempts.at(-1);
 if(!node||!['unit','starter','lesson','checkpoint'].includes(node.kind)||!last||
   statusMap(state,now)[id]==='locked'||last.round!==record.round||
   !passedQuiz(node,last,now)||!due(node,state,now))return state;
 return restartQuiz(state,id,now);
}
