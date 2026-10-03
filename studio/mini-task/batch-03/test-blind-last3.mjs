// Author compares independently returned closed answers after blind review ends.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../../',import.meta.url),{batch03Tasks}=await import(new URL('work/mini-batch03/model.mjs',root)),review=JSON.parse(await readFile(new URL('mini-task/batch-03/blind-review-last3.json',root),'utf8'));
assert.equal(review.inputSha256,createHash('sha256').update(await readFile(new URL('mini-task/batch-03/blind-packet-last3.json',root))).digest('hex'));assert.equal(review.completedItemCount,15);const results=[];
for(const t of batch03Tasks.slice(3))for(const q of t.items){const independent=review.items.find(r=>r.itemId===q.id);assert(independent);const closed=['listening','reading'].includes(t.skill);if(closed)assert(q.accepted.some(a=>a.trim().toLowerCase()===independent.answer.trim().toLowerCase()),q.id);results.push({id:q.id,closed,keyMatchesIndependentAnswer:closed?true:null,openQuality:'ungraded; natural alternatives await human review'})}
await writeFile(new URL('mini-task/batch-03/evidence/blind-author-comparison-last3.json',root),JSON.stringify({reviewWasKeyBlind:true,closedCompared:10,openUngraded:5,results,humanAcousticAudit:false,difficultyCalibrated:false},null,2)+'\n');console.log('PASS last-three blind independent10 closed answers;5 open remain ungraded');
