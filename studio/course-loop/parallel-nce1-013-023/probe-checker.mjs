// Bounded, synthetic factory probe. Only supplied responses and Boolean judgments leave this tool.
import {createCourseLoopModel} from '../model.mjs';
const supported=[13,15,17,19,21,23];
let raw='';for await(const chunk of process.stdin)raw+=chunk;
const cases=JSON.parse(raw);if(!Array.isArray(cases)||cases.length>600)throw Error('Invalid probe size');
const output=[];
for(const row of cases){
 const n=Number(row.courseId?.replace('nce1-',''));if(!supported.includes(n)||typeof row.answer!=='string')throw Error('Unsupported probe');
 const c=await import(`./lesson-nce1-${String(n).padStart(3,'0')}.mjs`);if(!c.byId.has(row.id))throw Error('Unknown task');
 const m=createCourseLoopModel(c);let at=1791028800000,s=m.initialState(at),found=false;
 const send=a=>{const r=m.transition(s,a,++at);if(!r.ok)throw Error(r.message);s=r.state;return r.view};
 for(let step=0;step<100&&!found;step++){
  const v=m.inspect(s,at).view,q=m.currentQuestion(v);
  if(q){send({type:'draft',value:q.id===row.id?row.answer:q.accepted[0]});const v2=send({type:'submit'});if(q.id===row.id){output.push({...row,matched:v2.attempts.at(-1).correct});found=true;}else send({type:'next'});}
  else if(['learn','feedback','review-feedback'].includes(v.phase))send({type:'next'});
  else if(v.phase==='own')send({type:'finish'});
  else if(v.phase==='waiting'){at=v.dueAt;send({type:'review'});}
  else throw Error('Unexpected phase');
 }
 if(!found)throw Error('Task not reached');
}
console.log(JSON.stringify(output));
