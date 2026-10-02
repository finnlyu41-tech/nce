/** New-content-only contract. No model, registry, state or global normalization changes. */
export const stageIds=Object.freeze(['diagnostic','guided','independent','repair','review-a','review-b']);
const lexical=value=>String(value).normalize('NFKC').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ').replace(/\s*,\s*/g,', ');
export function normalizedResponse(form,value){
 let text=lexical(value);
 if(form==='question'){
  // This task explicitly asks for a written question ending in one question mark.
  if(!text.endsWith('?')||text.slice(0,-1).includes('?'))return null;
  return text.slice(0,-1).trim();
 }
 if(form==='statement'){
  if(text.includes('?'))return null;
  return text.replace(/[.!。！]+$/u,'').trim();
 }
 if(form==='choice')return text;
 throw Error('Unknown response form');
}
export function bindContent(lesson,questions){
 const byId=new Map(questions.map(q=>[q.id,q]));
 if(questions.length!==18||byId.size!==18||lesson.teaching.length!==3)throw Error('Expected eighteen tasks and three targets.');
 for(const stage of stageIds){const bank=questions.filter(q=>q.stage===stage);if(bank.length!==3||new Set(bank.map(q=>q.target)).size!==3)throw Error('Incomplete bank '+stage)}
 for(const q of questions){
  if(!q.id.startsWith(q.stage+'-')||!lesson.teaching.some(t=>t.target===q.target)||!q.context||!q.prompt||!q.criterion||!q.why||!q.novelty||!Array.isArray(q.accepted)||!q.accepted.length||!['question','statement','choice'].includes(q.form))throw Error('Incomplete task '+q.id);
  if(!Array.isArray(q.counterexamples)||q.counterexamples.length<3||q.counterexamples.some(x=>!x.answer||!x.reason))throw Error('Missing meaning boundaries '+q.id);
  if(q.kind==='choice'&&(q.form!=='choice'||!q.options||!q.accepted.every(a=>q.options.includes(a))))throw Error('Choice/key mismatch '+q.id);
  if(q.kind==='input'&&q.form==='choice')throw Error('Input cannot hide a choice task '+q.id);
 }
 const matches=(q,value)=>{const normalized=normalizedResponse(q.form,value);return normalized!==null&&q.accepted.some(answer=>normalizedResponse(q.form,answer)===normalized)};
 for(const q of questions){if(q.accepted.some(a=>!matches(q,a))||q.counterexamples.some(x=>matches(q,x.answer)))throw Error('Answer/boundary conflict '+q.id)}
 return {lesson,questions,byId,questionsFor:stage=>questions.filter(q=>q.stage===stage),matches};
}
