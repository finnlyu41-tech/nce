import assert from 'node:assert/strict';
import {moduleURL} from './ielts-blueprint-loader.mjs';
const root=new URL('../ielts-blueprint/',import.meta.url),m=await import(await moduleURL(new URL('sample-sequence-model.ts',root).pathname));
let tick=Date.UTC(2026,9,2,8),state=m.emptySampleState();
const act=action=>{const result=m.transitionSample(state,action,++tick);assert.equal(result.issue,undefined,result.issue);state=result.state};
const reject=(message)=>{const before=JSON.stringify(state),result=m.transitionSample(state,{type:'save-correction'},++tick);assert.equal(result.state,state);assert.match(result.issue,message);assert.equal(JSON.stringify(state),before);return result.issue};
act({type:'select-variant',variant:'general-training'});act({type:'open-lesson',lessonId:'reading-sentence-completion'});act({type:'next'});act({type:'next'});
for(const stage of ['guided','independent','timed']){
 assert.equal(m.sampleSession(state).stage,stage);if(stage==='timed')act({type:'start-timed'});if(stage!=='guided')act({type:'confirm-unseen',value:true});
 for(const q of m.activeSampleMaterial(state).questions)act({type:'answer',questionId:q.id,value:q.accepted[0]});act({type:'submit'});act({type:'next'});
}
assert.equal(m.sampleSession(state).stage,'feedback');const lesson=m.selectedSampleLesson(state),originals=JSON.stringify(m.sampleSession(state).attempts);
reject(/还没有订正答案/);
for(const q of lesson.timed.questions)act({type:'correction-answer',questionId:q.id,value:q.accepted[0]});
reject(/至少 8 字/);
act({type:'correction-note',value:'我对照本轮原文重新核对领取人、地点及每题的词数要求。'});
const last=lesson.timed.questions.at(-1);act({type:'correction-answer',questionId:last.id,value:'friend'});const message=reject(/第 3 题的订正与本轮材料不符/);
assert(!message.includes(last.accepted[0]));assert(!message.includes('长度'));assert.equal(m.sampleSession(state).correctedAt,0);assert.equal(m.sampleLessonReceipt(state,tick).delayed,'not-scheduled');
act({type:'correction-answer',questionId:last.id,value:last.accepted[0]});act({type:'save-correction'});
assert.equal(m.sampleSession(state).stage,'review');assert.equal(m.sampleLessonReceipt(state,tick).delayed,'not-due');assert.equal(JSON.stringify(m.sampleSession(state).attempts),originals);
console.log('PASS 5 actual-sequence correction feedback groups: empty answers, missing explanation, complete wrong answer identifies item without key leak, rejection preserves originals/gate, correct single-answer revision schedules +24h.');
