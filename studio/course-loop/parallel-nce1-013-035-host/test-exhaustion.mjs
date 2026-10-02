/** R15 bounded production-host regression: synthetic fixed clocks and answers.
 * No store, personal records, map achievement, media or FSRS mutations. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {host,exhaustionCase,snapshotFor,DAY,FIXED_NOW} from './prepare-exhaustion.mjs';
import {supportedCourseIds} from '../batch-01/production-test-binding.mjs';
const IDS=Array.from({length:18},(_,i)=>`nce1-${2*i+1}`);
assert.deepEqual(supportedCourseIds,IDS);assert.deepEqual(host.courseLoopBindings.map(c=>c.id),IDS);
const failed=await Promise.all(IDS.map(id=>exhaustionCase(id)));
const passed=await Promise.all(IDS.map(id=>exhaustionCase(id,{mode:'independent'})));
const loopTasks=(s,m,at)=>host.todayPractice(s,m,at).filter(t=>t.id.startsWith('course-loop:'));

// Preserve the original symptom in diagnostic output before the asserted fix.
const baseline=snapshotFor(failed),baselineMap=host.emptyProgress();
console.log('R15 exhaustion host observations: '+JSON.stringify(failed.map(c=>({id:c.id,recommendation:c.model.recommendation(c.view,FIXED_NOW).kind,taskKind:host.courseLoopTask(baseline,FIXED_NOW,c.id)?.kind??null}))));

test('all eighteen actual factories retain distinct failed and helped answers in both finite banks',()=>{
 for(const c of failed){assert.equal(c.view.phase,'waiting');assert.equal(c.view.reviewResults.length,2);assert.equal(c.model.receipt(c.view,FIXED_NOW).unseenBank,null);
  for(const stage of ['review-a','review-b']){const attempts=c.view.attempts.filter(a=>a.stage===stage);assert.equal(attempts.length,3);assert.equal(attempts[0].correct,false);assert.equal(attempts[0].hinted,false);assert.match(attempts[0].answer,/SYNTHETIC wrong answer/);assert.equal(attempts[1].correct,true);assert.equal(attempts[1].hinted,true);assert.equal(attempts[2].correct,true);assert.equal(attempts[2].hinted,false);assert.ok(attempts.every(a=>a.fresh));assert.equal(c.view.reviewResults.find(r=>r.bank===stage).independent,false)}
  assert.equal(new Set(c.view.attempts.filter(a=>a.stage.startsWith('review-')).map(a=>a.id)).size,6);
  assert.equal(c.dueAt-c.view.reviewResults.at(-1).at,DAY);
  assert.equal(c.model.recommendation(c.view,FIXED_NOW).kind,'needs-new-material');
  const again=c.model.transition(c.state,{type:'review'},FIXED_NOW);assert.equal(again.ok,false);assert.deepEqual(again.state,c.state);
 }
});

test('waiting before due has no loop task; first due selects review with same-course href and unchanged raw',()=>{
 for(const c of failed){const state={...structuredClone(host.initial),drafts:{[c.keys.snapshot]:JSON.stringify(c.waiting)}},map=host.emptyProgress(),before=JSON.stringify({state,map});
  assert.equal(host.courseLoopTask(state,c.firstDue-1,c.id),null);
  assert.equal(loopTasks(state,map,c.firstDue-1).length,0);
  const task=host.courseLoopTask(state,c.firstDue,c.id);assert.equal(task.kind,'review');assert.equal(task.at,c.firstDue);
  const today=loopTasks(state,map,c.firstDue);assert.equal(today.length,1);assert.equal(today[0].kind,'review');assert.equal(today[0].href,host.courseAccessHref(c.id,map,c.firstDue));
  assert.equal(host.nextCourse(state,map,c.firstDue).id,c.id);assert.equal(JSON.stringify({state,map}),before);
 }
});

test('exhausted failed/helped cases remain explicit repair tasks on their exact course, not silent Today drops',()=>{
 const state=snapshotFor(failed),map=host.emptyProgress(),before=JSON.stringify({state,map});
 for(const c of failed){const task=host.courseLoopTask(state,FIXED_NOW,c.id);assert.ok(task,`${c.id}: needs-new-material currently drops to null`);assert.equal(task.kind,'repair');assert.equal(task.at,c.dueAt);assert.match(task.reason,/新材料|两组|用完|耗尽/);
  const today=loopTasks(state,map,FIXED_NOW).find(t=>t.id===`course-loop:${c.id}`);assert.ok(today);assert.equal(today.kind,'repair');assert.equal(today.href,host.courseAccessHref(c.id,map,FIXED_NOW));assert.equal(today.priority,1,'existing nonreview Today adapter retains resume priority within bounded selector-only repair');assert.doesNotMatch(today.reason+today.method,/换一组未看过的题|收起教材，独立回答新情境|已经掌握|Band|FSRS|自然24/);
 }
 assert.equal(loopTasks(state,map,FIXED_NOW).length,18);assert.equal(JSON.stringify({state,map}),before);assert.deepEqual(map.records,{});assert.equal(state.flashcards,undefined);
});

test('exhausted independent banks retain their seven-day schedule and distinct completion evidence',()=>{
 for(const c of passed){assert.equal(c.view.reviewResults.length,2);assert.ok(c.view.reviewResults.every(r=>r.independent));assert.ok(c.view.attempts.filter(a=>a.stage.startsWith('review-')).every(a=>a.correct&&!a.hinted&&a.fresh));assert.equal(c.dueAt-c.view.reviewResults.at(-1).at,7*DAY);
  const state=snapshotFor([c]),map=host.emptyProgress(),before=JSON.stringify({state,map});assert.equal(host.courseLoopTask(state,c.dueAt-1,c.id),null);
  assert.equal(c.model.recommendation(c.view,c.dueAt).kind,'needs-new-material');assert.equal(c.model.receipt(c.view,c.dueAt).unseenBank,null);
  // No fresh bank remains even after independent completion; the host must
  // surface the finite-pool boundary instead of inventing a third review.
  const task=host.courseLoopTask(state,c.dueAt,c.id);assert.ok(task,`${c.id}: completed finite pool also currently drops to null`);assert.equal(task.kind,'repair');
  const summary=host.courseLoopSummary(state,map,c.dueAt,c.id);assert.equal(summary.status,'ready');assert.equal(summary.reviewResults,2);assert.equal(summary.mapLabel,'地图检验：尚未达标');
  const receipt=c.model.receipt(c.view,c.dueAt);assert.equal(receipt.mastery,'not-assessed');assert.equal(receipt.band,null);assert.equal(receipt.listening,'not-tested');assert.equal(receipt.pronunciation,'not-tested');assert.equal(JSON.stringify({state,map}),before);
 }
});

test('finite-pool repair allows later course continuation without repeated reviews, map completion or FSRS claims',()=>{
 for(const c of failed){const state=snapshotFor([c]);let map=host.emptyProgress();map=host.startNode(host.unlockNode(map,c.id),c.id,FIXED_NOW-1000);const before=JSON.stringify({state,map}),successor=`nce1-${Number(c.id.slice(5))+2}`;
  assert.equal(host.nextCourse(state,map,FIXED_NOW).id,successor);const next=host.courseContinuation(state,map,c.id,FIXED_NOW);assert.equal(next.node.id,successor);assert.equal(next.currentRoute,false);assert.match(next.href,new RegExp(`/map/#/learn/${successor}`));
  const tasks=host.todayPractice(state,map,FIXED_NOW);assert.ok(tasks.some(t=>t.id===`course-loop:${c.id}`&&t.kind==='repair'));assert.ok(tasks.some(t=>t.id===`course:${successor}`&&t.kind==='course'));
  assert.equal(host.achieved(host.nodeById(c.id),map,FIXED_NOW),false);assert.equal(state.flashcards,undefined);assert.equal(JSON.stringify({state,map}),before);
 }
});

test('native backup round-trip preserves exhausted raw and evidence with no private-record dependency',async()=>{
 const state=snapshotFor([failed[6],passed[12]]),before=JSON.stringify(state);assert.equal(host.validateState(state),true);
 const file=host.makeProgressFile(state,new Date(FIXED_NOW)),restored=await host.readProgressFile(file);assert.deepEqual(restored.state,state);assert.equal(JSON.stringify(state),before);
 for(const c of [failed[6],passed[12]]){const parsed=host.parseCourseLoop(restored.state.drafts[c.keys.snapshot],FIXED_NOW,c.id);assert.ok(parsed.ok);assert.deepEqual(parsed.view.reviewResults,c.view.reviewResults);assert.equal(restored.state.drafts[c.keys.snapshot],c.raw)}
});
