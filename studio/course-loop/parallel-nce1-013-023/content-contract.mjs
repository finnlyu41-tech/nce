export const stageIds=Object.freeze(['diagnostic','guided','independent','repair','review-a','review-b']);
// Local lexical formatting only. No removal of words, negation, tense or internal punctuation.
export function normalizedResponse(form,value){
 if(typeof value!=='string')return null;
 let text=value.trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ').replace(/\s*,\s*/g,', ').replace(/？/g,'?');
 if(form==='question'){if(!text.endsWith('?')||/[?!.。！]/u.test(text.slice(0,-1)))return null;return text;}
 if(form==='statement'){if(/[?]/u.test(text))return null;return text.replace(/[.!。！]$/u,'').trim();}
 if(form==='choice')return text;
 throw Error('Unknown response form');
}
export function bindContent(lesson,questions){
 const byId=new Map(questions.map(q=>[q.id,q]));
 if(byId.size!==questions.length||lesson.teaching.length!==3)throw Error('Invalid content');
 for(const stage of stageIds){const bank=questions.filter(q=>q.stage===stage);if(bank.length!==3||new Set(bank.map(q=>q.target)).size!==3)throw Error('Incomplete bank '+stage);}
 const matches=(q,value)=>{if(byId.get(q?.id)!==q)return false;const n=normalizedResponse(q.form,value);return n!==null&&q.accepted.some(a=>normalizedResponse(q.form,a)===n);};
 for(const q of questions){if(!q.id.startsWith(q.stage+'-')||!q.context||!q.prompt||!q.why||!q.criterion||!q.novelty||!q.counterexamples?.length||q.accepted.some(a=>!matches(q,a))||q.counterexamples.some(x=>matches(q,x.answer)))throw Error('Invalid task '+q.id);}
 return {lesson,questions,byId,questionsFor:stage=>questions.filter(q=>q.stage===stage),matches};
}
