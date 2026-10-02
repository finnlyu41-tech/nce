import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as c3 from './lesson-nce1-003.mjs';
import * as c5 from './lesson-nce1-005.mjs';
import {stageIds} from './content-contract.mjs';
const all=[c3,c5],read=async path=>JSON.parse(await readFile(new URL(path,import.meta.url),'utf8'));
test('two explicitly authored groups have six complete three-target banks and objective criteria',()=>{
 assert.deepEqual(all.map(c=>c.lesson.id),['nce1-3','nce1-5']);
 for(const c of all){assert.equal(c.questions.length,18);assert.equal(c.byId.size,18);assert.equal(c.lesson.rights,'original-authored');assert.equal(c.lesson.own.status,'awaiting-human-review');for(const stage of stageIds){const bank=c.questionsFor(stage);assert.equal(bank.length,3);assert.deepEqual(new Set(bank.map(q=>q.target)),new Set(c.lesson.teaching.map(t=>t.target)))}for(const q of c.questions){assert.ok(q.context&&q.prompt&&q.why&&q.criterion&&q.novelty);for(const key of q.accepted)assert.ok(c.matches(q,key));}}
});
test('new stimuli and IDs are distinct across stages; no same-material choice permutation passed off as fresh',()=>{
 for(const c of all){assert.equal(new Set(c.questions.map(q=>q.context)).size,18);assert.equal(new Set(c.questions.map(q=>q.novelty)).size,18);for(const stage of ['independent','repair','review-a','review-b'])for(const q of c.questionsFor(stage)){assert.ok(!c.questions.filter(x=>x.stage!==stage).some(x=>x.context===q.context));assert.ok(q.id.startsWith(stage+'-'));}assert.ok(c.questionsFor('review-a').every(q=>!c.questionsFor('review-b').some(x=>x.id===q.id||x.context===q.context)))}}
);
test('lesson3 speaker ownership has one intended semantic answer; holding/location never inferred as ownership',()=>{
 const expected={diagnostic:'your',guided:'my',independent:'your',repair:'my','review-a':'my','review-b':'your'};
 for(const [stage,key] of Object.entries(expected)){const q=c3.questionsFor(stage).find(q=>q.target==='ownership');assert.equal(c3.matches(q,key),true);assert.equal(c3.matches(q,key==='my'?'your':'my'),false);assert.match(q.context,/你本人/)}
});
test('lesson3 negation: full and contracted forms accepted; missing be, wrong owner and wrong short-answer subject rejected',()=>{
 const q=c3.byId.get('independent-reject');for(const x of ['This is not my phone.',"This isn’t my phone！",' THIS IS NOT MY PHONE '])assert.ok(c3.matches(q,x));for(const x of ['This not my phone.','This is my phone.','This is not your phone.','This are not my phone.','This is not my phones.'])assert.equal(c3.matches(q,x),false);
 const response=c3.byId.get('review-a-response');for(const x of ['No, it is not.',"No, it isn't.","No, it’s not！"])assert.ok(c3.matches(response,x));for(const x of ['No, I am not.','No, it is.','Yes, it is.',"No, it's.",'No, they are not.'])assert.equal(c3.matches(response,x),false)
});
test('lesson5 introduction is a bounded This-is task, and exact addressee facts are explicit',()=>{
 const q=c5.byId.get('independent-introduce');assert.ok(c5.matches(q,'This is Mina.'));for(const x of ['This Mina.','I am Mina.','This is Maya.','This are Mina.'])assert.equal(c5.matches(q,x),false);for(const stage of stageIds){const r=c5.questionsFor(stage).find(q=>q.target==='reference');assert.match(r.context,/明确/);assert.ok(r.options.includes(r.accepted[0]));assert.equal(c5.matches(r,r.accepted[0]==='He'?'She':'He'),false);assert.equal(c5.matches(r,r.accepted[0]==='He'?'Him':'Her'),false)}
});
test('lesson5 nationality is given as a fact and word gloss; does not require guessing names or outside geography',()=>{
 for(const stage of stageIds){const q=c5.questionsFor(stage).find(q=>q.target==='nationality');assert.match(q.context,/告诉|说明|亲口/);assert.match(q.prompt,/（.*人）/);const standard=q.accepted[0];assert.ok(c5.matches(q,standard));assert.ok(c5.matches(q,q.accepted[1].replace("'",'’')));const wrong=standard.replace(' is ',' is a ');assert.equal(c5.matches(q,wrong),false);assert.equal(c5.matches(q,standard.replace(' is ',' are ')),false);assert.equal(c5.matches(q,standard.replace(' is ', ' ')),false)}
});
test('media references reuse exact existing comic/LRC source identities and source-bound time ranges',async()=>{
 const comics=await read('../../app/data/nce-illustrations.json');
 for(const c of all){const source=c.lesson.source;assert.equal(comics.lessons[source.groupId].sourceSha256,source.languageSha256);assert.equal(source.comicKey,source.groupId);assert.equal(source.languagePath,`/language/NCE1/${c.lesson.lessons[0]}.json`);assert.equal(source.clips.length,3);for(const clip of source.clips){assert.ok(clip.start<clip.end&&clip.label&&c.lesson.teaching.some(t=>t.target===clip.target))}}
});
test('new groups contain no copied textbook body, audio blobs, storage access or fake score',async()=>{
 for(const name of ['lesson-nce1-003.mjs','lesson-nce1-005.mjs']){const source=await readFile(new URL(name,import.meta.url),'utf8');assert.doesNotMatch(source,/localStorage|indexedDB|fetch\(|data:audio|score:|band:\s*\d/);assert.doesNotMatch(source,/My coat and my umbrella please|Sophie is a new student|Number five\./)}
});
test('all independent blind answers and reported natural variants fit final finite matching',async()=>{
 const review=await read('../../docs/course-loop-batch-01-blind-review.json');
 assert.equal(review.independentAnswers.length,36);assert.equal(review.issues.length,3);assert.ok(review.issues.every(x=>x.recheck.startsWith('resolved')));
 for(const r of review.independentAnswers){const c=all.find(c=>c.lesson.id===r.courseId),q=c.byId.get(r.id);assert.ok(c.matches(q,r.answer),r.id);for(const alternative of r.alternatives)assert.ok(c.matches(q,alternative),alternative)}
 for(const r of review.introductionRecheck.answers){const q=c5.byId.get(r.id);for(const alternative of r.alternatives)assert.ok(c5.matches(q,alternative),alternative);assert.ok(c5.matches(q,`Everyone, ${r.answer.charAt(0).toLowerCase()+r.answer.slice(1)}`))}
});
test('short nationality structure is explicit before submission, not a hidden grading rule',()=>{
 for(const q of c5.questions.filter(q=>q.target==='nationality')){assert.match(q.prompt,/国籍形容词/);assert.match(q.prompt,/只用主语、be动词和这个国籍词/)}
 assert.match(c5.lesson.teaching.find(t=>t.target==='introduce').explanation,/不把未匹配说成整句英文错误/);
});
test('coverage overlay counts only CL00 runtime plus two local groups; registry stays finite',async()=>{
 const coverage=await read('../../docs/course-loop-batch-01-coverage.json');
 assert.deepEqual(coverage.finiteRegistryProposal,['nce1-1','nce1-3','nce1-5']);assert.equal(coverage.counts.textbookLessons,348);assert.equal(coverage.counts.teachingGroups,276);assert.equal(coverage.counts.newLocallyAuthoredGroups,2);assert.equal(coverage.counts.remainingGroupsWithoutNewLoopClaim,273);assert.equal(coverage.counts.inMap+coverage.counts.classicOutsideMap,276);assert.equal(coverage.queueStatus.notUserConfirmedTotal,true);
});
