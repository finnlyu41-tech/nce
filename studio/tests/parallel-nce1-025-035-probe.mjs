import {readFile} from 'node:fs/promises';
import {createCourseLoopModel} from '../course-loop/model.mjs';
const cases=JSON.parse(await readFile(process.argv[2],'utf8'));
const out=[];
for(const item of cases){
 const n=Number(item.course.split('-').at(-1));
 const c=await import(`../course-loop/parallel-nce1-025-035/lesson-nce1-${String(n).padStart(3,'0')}.mjs`);
 const model=createCourseLoopModel(c);let at=1791028800000,state=model.initialState(at);
 const send=action=>{const r=model.transition(state,action,++at);if(!r.ok)throw Error(r.message);state=r.state;return r.view};
 let found=false;
 for(let guard=0;guard<200;guard++){
  const v=model.inspect(state,at).view,q=model.currentQuestion(v);
  if(q){
   if(q.id===item.id){send({type:'draft',value:item.answer});const r=send({type:'submit'});out.push({...item,correct:r.attempts.at(-1).correct});found=true;break}
   send({type:'draft',value:q.accepted[0]});send({type:'submit'});send({type:'next'});
  }else if(v.phase==='own'){send({type:'own-draft',value:'Fictional expression awaiting human review.'});send({type:'finish'})}
  else if(v.phase==='waiting'){at=v.dueAt;send({type:'review'})}
  else if(['learn','feedback','review-feedback'].includes(v.phase))send({type:'next'});
  else throw Error('Cannot reach '+item.id+' from '+v.phase);
 }
 if(!found)throw Error('Question not reached '+item.id);
}
console.log(JSON.stringify(out,null,2));
