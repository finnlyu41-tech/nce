/** Scope: only the six unpublished content modules in this directory. */
export const stages=Object.freeze(['diagnostic','guided','independent','repair','review-a','review-b']);
export function normalizedResponse(form,value){
 if(typeof value!=='string')return null;
 let s=value.normalize('NFC').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ');
 if(form==='choice')return s;
 if(form==='question'){
  if(!s.endsWith('?')||/[?!.。？！]/u.test(s.slice(0,-1)))return null;
  return s.slice(0,-1).trim();
 }
 if(form==='statement'||form==='imperative'){
  if(s.endsWith('.'))s=s.slice(0,-1).trim();
  if(/[?!.。？！]/u.test(s))return null;
  return s;
 }
 throw Error('Unknown response form');
}
export function bindContent(lesson,questions){
 const byId=new Map(questions.map(q=>[q.id,q]));
 if(questions.length!==18||byId.size!==18||lesson.teaching.length!==3)throw Error('Expected eighteen tasks and three targets');
 for(const stage of stages){const bank=questions.filter(q=>q.stage===stage);if(bank.length!==3||new Set(bank.map(q=>q.target)).size!==3)throw Error('Incomplete bank '+stage)}
 for(const q of questions){
  if(!q.id.startsWith(q.stage+'-')||!lesson.teaching.some(t=>t.target===q.target)||!q.context||!q.prompt||!q.criterion||!q.why||!q.novelty||!Array.isArray(q.accepted)||!q.accepted.length||!['question','statement','imperative','choice'].includes(q.form))throw Error('Incomplete task '+q.id);
  if(!Array.isArray(q.counterexamples)||q.counterexamples.length<4||q.counterexamples.some(x=>!x.answer||!x.reason))throw Error('Missing semantic boundaries '+q.id);
  if(q.kind==='choice'&&(q.form!=='choice'||!q.options||!q.accepted.every(a=>q.options.includes(a))))throw Error('Choice/key mismatch '+q.id);
 }
 const matches=(q,value)=>{const n=normalizedResponse(q.form,value);return n!==null&&q.accepted.some(a=>normalizedResponse(q.form,a)===n)};
 for(const q of questions)if(q.accepted.some(a=>!matches(q,a))||q.counterexamples.some(x=>matches(q,x.answer)))throw Error('Conflicting boundary '+q.id);
 return {lesson,questions,byId,questionsFor:stage=>questions.filter(q=>q.stage===stage),matches};
}
