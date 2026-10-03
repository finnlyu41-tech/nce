// Author compares independently returned closed answers after blind review ends.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../../',import.meta.url),{batch02Tasks}=await import(new URL('work/mini-batch02/model.mjs',root)),review=JSON.parse(await readFile(new URL('mini-task/batch-02/blind-review-first3-final.json',root),'utf8'));
assert.equal(review.completedItemCount,15);const results=[];
for(const t of batch02Tasks.slice(0,3))for(const q of t.items){const independent=review.items.find(r=>r.itemId===q.id);assert(independent);const closed=['listening','reading'].includes(t.skill);if(closed)assert(q.accepted.some(a=>a.trim().toLowerCase()===independent.answer.trim().toLowerCase()),q.id);results.push({id:q.id,closed,keyMatchesIndependentAnswer:closed?true:null,openQuality:'ungraded; natural alternatives await human review'})}
await writeFile(new URL('mini-task/batch-02/evidence/blind-author-comparison-first3.json',root),JSON.stringify({reviewWasKeyBlind:true,closedCompared:10,openUngraded:5,results,humanAcousticAudit:false,difficultyCalibrated:false},null,2)+'\n');console.log('PASS first-three blind independent10 closed answers;5 open remain ungraded');
