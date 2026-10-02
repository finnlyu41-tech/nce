import {loadTs} from './load-ts.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
const {emptyRecord,append,project,readRecord,openReason,result,interval,availablePack,skillResults,DAY}=loadTs(new URL('../model.ts',import.meta.url).pathname);
const {forms}=loadTs(new URL('../learner-pack.ts',import.meta.url).pathname);
import {readFileSync} from 'node:fs';
// Explicit synthetic unit fixtures. Never written into host State or natural archives.
const T=1_700_000_000_000;
const review=(skill,extra={})=>({reviewer:{role:'teacher',qualified:true,calibrated:true,external:true,basis:'fixture-calibration-one'},targetElicited:true,disputed:false,secondReview:false,basis:'synthetic test semantic/rubric judgments',...(skill==='reading'||skill==='listening'?{judgments:Array(6).fill('correct'),criticalReversed:false}:{dimensions:[2,2,2,2],purposes:Array(skill==='speaking'?5:4).fill(true)}),...(['speaking','listening'].includes(skill)?{actualHeard:true}:{}),...extra});
function fixture(prior=false){let r=emptyRecord('fixture-course',prior),at=T,count=0;return {get r(){return r},get v(){return project(r)},get now(){return at},advance(ms){at+=ms},send(command){r=append(r,{id:'fixture-'+(++count),at,command},at);at++;return r},last(){return project(r).attempts.at(-1)}};}
function complete(f,skill,phase='T1',extra={}){f.send({type:'open',skill,phase,unseen:true});const id=f.last().id;f.send({type:'draft',id,answers:Array(skill==='reading'||skill==='listening'?6:1).fill('原始作答')});if(skill==='listening')f.send({type:'delivery',id,delivery:{mode:'live-reader',heard:true,singlePresentation:true,humanChecked:false,note:'synthetic live-reader fixture'}});f.send({type:'submit',id});f.send({type:'review',id,review:review(skill,extra)});return id;}
function learning(f,kind='complete',selected=['listening','reading','speaking','writing']){f.send({type:'learning',skills:selected,kind,note:'synthetic learning fixture'});}
test('six forms cover 6 listening, 6 reading questions; no examiner key or script enters learner module',()=>{
 for(const form of Object.values(forms)){assert.equal(form.listening.length,6);assert.equal(form.reading.questions.length,6);assert.equal(form.reading.passages.length,2);assert.equal(form.reading.critical.length,3);assert.ok(form.speaking&&form.writing);}
 const source=readFileSync(new URL('../learner-pack.ts',import.meta.url),'utf8');assert.doesNotMatch(source,/答案：|可能答案|达意例|验收员脚本|甲：|乙：|L1 甲/);
});
test('baseline before learning; prior/learning/host-unknown context cannot manufacture baseline',()=>{
 const f=fixture();complete(f,'reading','T0');assert.equal(f.last().pack,'A');learning(f);assert.match(openReason(f.v,'listening','T0',f.now),/基线/);assert.match(openReason(fixture(true).v,'reading','T0',T),/基线/);
});
test('T1 retains original failures, help and revisions; per-skill scores never average',()=>{
 const f=fixture(true);learning(f);const id=complete(f,'reading','T1',{judgments:['wrong','correct','correct','correct','correct','correct'],criticalReversed:true});assert.equal(result(f.last()).status,'failed');
 const first=[...f.last().first];f.send({type:'revise',id,answers:Array(6).fill('订正'),note:'fix'});assert.deepEqual(f.last().first,first);assert.equal(f.last().revisions.length,1);
 assert.throws(()=>f.send({type:'submit',id}),/重复/);assert.throws(()=>f.send({type:'draft',id,answers:first}),/锁定/);
 complete(f,'writing');assert.equal(result(f.last()).status,'candidate');assert.equal(skillResults(f.v,'reading',f.now)[1].result.status,'failed');
});
test('speaking waits for actual qualified listener, transcript cannot be pronunciation evidence',()=>{
 const f=fixture(true);learning(f);f.send({type:'open',skill:'speaking',phase:'T1',unseen:true});const id=f.last().id;f.send({type:'submit',id});assert.equal(result(f.last()).status,'pending');
 assert.throws(()=>f.send({type:'review',id,review:review('speaking',{reviewer:{role:'teacher',qualified:true,calibrated:true,external:false,basis:'self'}})}),/外部/);
 f.send({type:'review',id,review:review('speaking',{actualHeard:false})});assert.equal(result(f.last()).status,'insufficient');
});
test('zero rubric dimension or any missing purpose fails even high total',()=>{
 const f=fixture(true);learning(f);complete(f,'writing','T1',{dimensions:[2,2,2,0]});assert.equal(result(f.last()).score,6);assert.equal(result(f.last()).status,'failed');
 complete(f,'speaking','T1',{purposes:[true,true,true,true,false]});assert.equal(result(f.last()).status,'failed');
});
test('timing requires actual >=24h then >=7d from latest assessment/repair; no UI clock override',()=>{
 const f=fixture(true);learning(f);complete(f,'reading');let i=interval(f.v,'reading','T2',f.now);assert.equal(openReason(f.v,'reading','T2',i.dueAt-1)?.includes('到期'),true);assert.equal(openReason(f.v,'reading','T2',i.dueAt),null);
 f.advance(DAY);complete(f,'reading','T2');i=interval(f.v,'reading','T3',f.now);assert.equal(i.ready,false);assert.ok(i.dueAt>=f.last().submittedAt+7*DAY);
 f.advance(7*DAY);const id=complete(f,'reading','T3');assert.equal(f.last().pack,'D');assert.equal(result(f.last()).status,'provisional');
 assert.throws(()=>f.send({type:'review',id,review:review('reading',{secondReview:true})}),/独立/);
 f.send({type:'review',id,review:review('reading',{secondReview:true,reviewer:{...review('reading').reviewer,basis:'fixture-calibration-two'}})});assert.equal(result(f.last()).status,'candidate');
 learning(f,'practice',['reading']);assert.equal(skillResults(f.v,'reading',f.now)[3].result.status,'pending');assert.ok(interval(f.v,'reading','T3',f.now).dueAt>=f.v.learning.at(-1).at+7*DAY);
});
test('repair never replaces failed first test, resets interval, consumes unseen E/F only',()=>{
 const f=fixture(true);learning(f);complete(f,'reading','T1',{judgments:Array(6).fill('wrong')});const original=f.last();assert.match(openReason(f.v,'reading','repair',f.now),/修补/);
 learning(f,'repair',['reading']);complete(f,'reading','repair');assert.equal(f.last().pack,'E');assert.equal(result(original).status,'failed');assert.ok(interval(f.v,'reading','T2',f.now).dueAt>=f.last().submittedAt+DAY);
 f.send({type:'expose',pack:'C'});f.send({type:'expose',pack:'F'});assert.equal(availablePack(f.v,'reading','T2'),undefined);assert.equal(f.v.attempts[0].first[0],'原始作答');
});
test('global pack exposure prevents unseen reuse; prompted and neutral-repeat controls',()=>{
 const f=fixture(true);learning(f);f.send({type:'expose',pack:'B'});f.send({type:'open',skill:'speaking',phase:'T1',unseen:true});assert.equal(f.last().pack,'E');const id=f.last().id;f.send({type:'help',id,help:'neutral-repeat'});f.send({type:'help',id,help:'english-prompt'});f.send({type:'submit',id});f.send({type:'review',id,review:review('speaking')});assert.equal(result(f.last()).status,'invalid');
});
test('listening without actual sound is invalid, interruption not zero, expired draft rejected',()=>{
 const f=fixture(true);learning(f);f.send({type:'open',skill:'listening',phase:'T1',unseen:true});let id=f.last().id;f.send({type:'submit',id});assert.equal(result(f.last()).status,'invalid');
 f.send({type:'open',skill:'reading',phase:'T1',unseen:true});id=f.last().id;f.advance(4*60_000+1);assert.throws(()=>f.send({type:'draft',id,answers:Array(6).fill('late')}),/限时/);f.send({type:'interrupt',id,reason:'设备失败'});assert.equal(result(f.last()).status,'invalid');assert.equal(result(f.last()).score,undefined);assert.match(openReason(f.v,'reading','T1',f.now)||'ready',/ready/);assert.equal(availablePack(f.v,'reading','T1'),'E');
});
test('unknown interval blocks due, prospective interval starts now; imported history invalidates due',()=>{
 const f=fixture(true);learning(f);complete(f,'reading');learning(f,'unknown',['reading']);f.advance(20*DAY);assert.equal(interval(f.v,'reading','T2',f.now).dueAt,0);
 learning(f,'interval-start',['reading']);assert.ok(interval(f.v,'reading','T2',f.now).dueAt>f.now);f.advance(DAY);assert.equal(interval(f.v,'reading','T2',f.now).ready,true);
 const original=interval(f.v,'reading','T2',f.now);f.send({type:'restore'});const restored=interval(f.v,'reading','T2',f.now);assert.equal(restored.dueAt,original.dueAt);assert.equal(restored.anchor,original.anchor);assert.equal(restored.ready,false);assert.equal(restored.verification,'restored-time-unverified');
});
test('missing, duplicate, future, malformed and unsupported fields block without resetting raw',()=>{
 const f=fixture(true);learning(f);complete(f,'reading');const raw=JSON.stringify(f.r);assert.equal(readRecord(raw,f.now).status,'ready');
 const mutate=fn=>{const r=JSON.parse(raw);fn(r);assert.equal(readRecord(JSON.stringify(r),f.now).status,'blocked');};
 mutate(r=>delete r.packVersion);mutate(r=>r.events.push(r.events[0]));mutate(r=>r.events[0].at=f.now+DAY);mutate(r=>r.events[0].command.extra='unexpected');mutate(r=>r.version=2);mutate(r=>delete r.events.at(-1).command.review.reviewer);mutate(r=>r.events.at(-1).command.review.dimensions=[2,2,2,2]);
 assert.equal(readRecord('{',f.now).status,'blocked');assert.equal(readRecord('',f.now).status,'blocked');assert.equal(readRecord(undefined,f.now).status,'empty');assert.equal(JSON.stringify(f.r),raw);
});
test('learning during an active baseline contaminates it and cannot be hidden by later external score',()=>{
 const f=fixture();f.send({type:'open',skill:'reading',phase:'T0',unseen:true});const id=f.last().id;learning(f);f.send({type:'submit',id});f.send({type:'review',id,review:review('reading')});assert.equal(result(f.last()).status,'invalid');assert.match(openReason(f.v,'reading','T0',f.now),/基线/);
});
test('a later failed T2 withdraws its previous success as the prerequisite for T3',()=>{
 const f=fixture(true);learning(f);complete(f,'reading');f.advance(DAY);complete(f,'reading','T2');learning(f,'practice',['reading']);f.advance(DAY);complete(f,'reading','T2',{judgments:Array(6).fill('wrong')});f.advance(7*DAY);assert.equal(interval(f.v,'reading','T3',f.now).dueAt,0);assert.match(openReason(f.v,'reading','T3',f.now),/有效24小时/);
});
test('failed baseline cannot skip normal learning via repair and failed T1 cannot be overwritten by T1 retry',()=>{
 const f=fixture();complete(f,'reading','T0',{judgments:Array(6).fill('wrong')});assert.match(openReason(f.v,'reading','repair',f.now),/基线之后/);learning(f);complete(f,'reading','T1',{judgments:Array(6).fill('wrong')});assert.match(openReason(f.v,'reading','T1',f.now),/首测失败/);
});
test('later disclosure of earlier pack exposure withdraws a previously passing observation',()=>{
 const f=fixture(true);learning(f);complete(f,'reading');assert.equal(result(f.last()).status,'candidate');f.send({type:'expose',pack:'B'});assert.equal(result(f.last()).status,'invalid');assert.equal(f.last().first[0],'原始作答');
});
