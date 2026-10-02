/** Blind-review tool: stdin [{courseId,id,answer}], stdout supplied answer + Boolean only.
 * Never returns accepted keys. Synthetic pure factory replay; no storage or UI. */
import {createCourseLoopModel} from '../model.mjs';
const paths={'nce1-7':'./lesson-nce1-007.mjs','nce1-9':'./lesson-nce1-009.mjs','nce1-11':'./lesson-nce1-011.mjs'};
let raw='';for await(const chunk of process.stdin)raw+=chunk;
const cases=JSON.parse(raw),output=[];
if(!Array.isArray(cases)||cases.length>300)throw Error('Expected bounded probe cases.');
for(const row of cases){
 if(!Object.hasOwn(paths,row.courseId)||typeof row.answer!=='string')throw Error('Unsupported probe course or input.');
 const content=await import(paths[row.courseId]);if(!content.byId.has(row.id))throw Error('Unsupported question ID.');
 const model=createCourseLoopModel(content);let at=1791028800000,state=model.initialState(at),found=false;
 const send=action=>{const r=model.transition(state,action,++at);if(!r.ok)throw Error(r.message);state=r.state;return r.view};
 for(let step=0;step<100&&!found;step++){
  const v=model.inspect(state,at).view,q=model.currentQuestion(v);
  if(q){
   send({type:'draft',value:q.id===row.id?row.answer:q.accepted[0]});const answered=send({type:'submit'});
   if(q.id===row.id){output.push({...row,matched:answered.attempts.at(-1).correct});found=true}else send({type:'next'});
  }else if(['learn','feedback','review-feedback'].includes(v.phase))send({type:'next'});
  else if(v.phase==='own')send({type:'finish'});
  else if(v.phase==='waiting'){at=v.dueAt;send({type:'review'})}
  else throw Error('Unexpected probe phase.');
 }
 if(!found)throw Error('Probe did not reach requested task.');
}
console.log(JSON.stringify(output));
