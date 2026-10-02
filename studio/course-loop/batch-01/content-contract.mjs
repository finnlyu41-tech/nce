/** Finite authored-content binding; no storage, route registration or production model. */
export const stageIds = ['diagnostic','guided','independent','repair','review-a','review-b'];
export const normalizeAnswer = value => String(value).normalize('NFKC').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/[.!?。！？]+$/g,'').replace(/,/g,' ').replace(/\s+/g,' ');
export function bindContent(lesson, questions) {
 const byId = new Map(questions.map(q=>[q.id,q]));
 if(byId.size!==questions.length||questions.length!==18)throw Error('Expected 18 unique authored tasks.');
 for(const stage of stageIds){
  const bank=questions.filter(q=>q.stage===stage);
  if(bank.length!==3||new Set(bank.map(q=>q.target)).size!==3)throw Error(`Incomplete target coverage: ${stage}`);
 }
 for(const q of questions){
  if(!q.id.startsWith(q.stage+'-')||!lesson.teaching.some(t=>t.target===q.target)||!q.context||!q.prompt||!q.why||!q.criterion||!q.novelty||!Array.isArray(q.accepted)||!q.accepted.length)throw Error(`Incomplete task: ${q.id}`);
  if(q.kind==='choice'&&(!q.options||!q.accepted.every(a=>q.options.includes(a))))throw Error(`Choice/key mismatch: ${q.id}`);
 }
 return {lesson,questions,byId,questionsFor:stage=>questions.filter(q=>q.stage===stage),matches:(q,answer)=>q.accepted.some(a=>normalizeAnswer(a)===normalizeAnswer(answer))};
}
