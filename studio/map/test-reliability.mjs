// Run after `pnpm prepare:map`: node map/test-reliability.mjs.
// --baseline [revision] reproduces the audited bugs with the same real curriculum.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {stripTypeScriptTypes} from 'node:module';
import {createHash} from 'node:crypto';

const root=path.dirname(fileURLToPath(import.meta.url)),cache=new Map();
const args=process.argv.slice(2),baselineIndex=args.indexOf('--baseline');
const baseline=baselineIndex<0?undefined:args[baselineIndex+1]&&!args[baselineIndex+1].startsWith('--')?args[baselineIndex+1]:'97c85c5';
const baselineModel=baseline?execFileSync('git',['show',`${baseline}:studio/map/model.ts`],{cwd:root,encoding:'utf8'}):undefined;
async function moduleURL(file) {
    if(cache.has(file))return cache.get(file);
    let source=file===path.join(root,'model.ts')&&baselineModel!==undefined?baselineModel:await fs.readFile(file,'utf8');
    source=file.endsWith('.json')?`export default ${source}`:stripTypeScriptTypes(source);
    for(const match of [...source.matchAll(/from\s+['"]([^'"]+)['"]/g)]) {
        const child=path.resolve(path.dirname(file),match[1]+(path.extname(match[1])?'':'.ts'));
        source=source.replaceAll(match[0],`from '${await moduleURL(child)}'`);
    }
    const url=`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
    cache.set(file,url);
    return url;
}
const m=await import(await moduleURL(path.join(root,'model.ts')));
const c=await import(await moduleURL(path.join(root,'content.ts')));
const realNow=Date.now,now=realNow(),day=m.reviewDelay;
let clock=now;
Date.now=()=>clock;
const unit=c.nodeById('nce1-1'),next=c.nodeById('nce1-3'),chapter=c.nodeById('chapter-1');
assert.ok(unit&&next&&chapter,'The real first chapter must be prepared before these tests run');
const proof=(round,at,node=unit)=>({round,at,answers:c.questionsFor(node,round).map(q=>q.answer.split(/\s+\/\s+/)[0]),assisted:false,heard:c.questionsFor(node,round).flatMap((q,i)=>q.clip?[i]:[])});
const wrong=(round,at)=>({...proof(round,at),answers:['deliberately incorrect synthetic response']});
const stateFor=(attempts,record={})=>({...m.emptyProgress(),access:{all:true,nodes:[]},lastNode:unit.id,records:{[unit.id]:{...m.emptyRecord(),...record,attempts}}});
const submit=(state,round,at)=>{
    const p=proof(round,at);
    const ready={...state,records:{...state.records,[unit.id]:{...state.records[unit.id],round:p.round,answers:p.answers,heard:p.heard,assisted:false,phase:'challenge'}}};
    return m.submitQuiz(ready,unit.id,at);
};
const project={text:'I am a student. This is my book. I read it every day. '.repeat(25),recording:'synthetic-original.wav',reviewer:'Synthetic external teacher',feedback:'Specific external feedback identified the tense error and checked the corrected recording.',criteria:[true,true,true,true],at:now};
const evidence={date:m.today(now),material:'Synthetic new paper A',work:'This is my own complete answer with concrete supporting details. '.repeat(45),reviewer:'Synthetic external IELTS teacher',feedback:'Specific feedback checked the original and corrected tense use.',criteria:[true,true,true,true],unseen:true,timed:true,correct:'30',total:'40',dimensions:Array(4).fill('Specific performance evidence and an actionable correction from the external reviewer.'),revision:'Synthetic new paper B retest: the error was corrected and remaining weaknesses recorded.'};
const mock=(material,date,reviewer=evidence.reviewer)=>({...evidence,material,date,reviewer,scores:['6.5','6.5','6.5','6.5'],kind:'academic',reference:'The matching full paper answer and band table'});
const mockState=(reviewer)=>({...m.emptyProgress(),minimum:'6',records:{'mock-one':{...m.emptyRecord(),mock:mock('Synthetic paper A',m.today(now-2*day),reviewer)},'mock-two':{...m.emptyRecord(),mock:mock('Synthetic paper B',m.today(now),reviewer)}}});

async function report(value) {
    console.log(JSON.stringify(value,null,2));
    const index=args.indexOf('--report');
    if(index>=0) {
        assert.ok(args[index+1],'--report requires a file path');
        const file=path.resolve(args[index+1]);
        await fs.mkdir(path.dirname(file),{recursive:true});
        await fs.writeFile(file,JSON.stringify(value,null,2)+'\n');
    }
}

if(baseline) {
    const failure=stateFor([proof(0,now-8*day),wrong(1,now-1000),proof(1,now)]);
    const helped=stateFor([proof(0,now-8*day),{...proof(1,now-1000),assisted:true},proof(1,now)]);
    const repeated=stateFor([proof(0,now-2*day),proof(1,now-day),proof(1,now-2),proof(1,now-1)]);
    const self=mockState('自评'),pending=stateFor([proof(0,now-8*day),wrong(1,now)]);
    const observations={baseline,content:'real prepared curriculum',oldPassFailureThenOneSecondCorrection:{stable:m.stable(unit,failure,now),due:m.due(unit,failure,now)},assistedThenOneSecondCorrection:{stable:m.stable(unit,helped,now),due:m.due(unit,helped,now)},sameDayRawPasses:{stable:m.stable(unit,repeated,now),dueAfterEightDays:m.due(unit,repeated,now+8*day)},twoSelfReviewedMocks:{errors:m.mockErrors(self.records['mock-one'].mock,'6',now),isReady:m.isReady(self,now)},continueAfterLatestFailure:{lastNode:pending.lastNode,due:m.due(unit,pending,now),recommended:m.continueNode(pending).id}};
    assert.equal(observations.oldPassFailureThenOneSecondCorrection.stable,true,'Audited false consolidation must reproduce');
    assert.equal(observations.assistedThenOneSecondCorrection.stable,true,'Assisted reset failure must reproduce');
    assert.equal(observations.sameDayRawPasses.dueAfterEightDays,false,'Raw-count interval inflation must reproduce');
    assert.equal(observations.twoSelfReviewedMocks.isReady,true,'Self-reviewed mock readiness must reproduce');
    assert.equal(observations.continueAfterLatestFailure.recommended,next.id,'Missed latest-failure repair must reproduce');
    await report(observations);
    Date.now=realNow;
} else {
    const review=await import(await moduleURL(path.join(root,'review-route.ts')));
    const cases=[],failures=[],routeTraces=[];
    const test=(name,run)=>{
        clock=now;
        try{run();cases.push(name)}catch(error){failures.push({name,message:error.message});console.error(`FAIL ${name}: ${error.message}`)}
    };
    const historical=now-8*day,resetAt=now-3*day,relearnAt=resetAt+1000,delayedAt=relearnAt+day;
    const beforeReset=[proof(0,historical),proof(1,historical+day)];
    const failureState=stateFor([...beforeReset,wrong(0,resetAt)]);

    test('Historical first pass remains learned when the latest review fails',()=>{
        assert.equal(m.achieved(unit,failureState,resetAt),true);
        assert.equal(m.stable(unit,failureState,resetAt),false);
        assert.equal(m.due(unit,failureState,resetAt),true);
        assert.equal(m.statusMap(failureState,resetAt)[next.id],'available');
    });
    test('A one-second corrected retry starts a fresh 24-hour consolidation cooldown',()=>{
        const s=stateFor([...failureState.records[unit.id].attempts,proof(1,relearnAt)]),raw=structuredClone(s.records);
        assert.equal(m.achieved(unit,s,relearnAt),true);
        assert.equal(m.stable(unit,s,relearnAt),false);
        assert.equal(m.due(unit,s,relearnAt),false);
        assert.equal(m.nextReviewAt(unit,s),delayedAt);
        assert.equal(m.due(unit,s,delayedAt-1),false);
        assert.equal(m.due(unit,s,delayedAt),true);
        assert.deepEqual(s.records,raw,'Computing stricter status must not rewrite raw history');
    });
    test('A different bank cannot consolidate before 24 hours after reacquisition',()=>{
        const s=stateFor([...failureState.records[unit.id].attempts,proof(1,relearnAt),proof(0,delayedAt-1)]);
        assert.equal(m.stable(unit,s,delayedAt-1),false);
        assert.equal(m.nextReviewAt(unit,s),delayedAt);
    });
    test('Reacquisition followed by a truly delayed independent different bank consolidates',()=>{
        const s=stateFor([...failureState.records[unit.id].attempts,proof(1,relearnAt),proof(0,delayedAt)]);
        assert.equal(m.stable(unit,s,delayedAt),true);
        assert.equal(m.due(unit,s,delayedAt),false);
        assert.equal(m.nextReviewAt(unit,s),delayedAt+7*day);
        assert.equal(m.due(unit,s,delayedAt+7*day-1),false);
        assert.equal(m.due(unit,s,delayedAt+7*day),true);
    });
    test('A delayed retry of the same bank cannot replace independent review evidence',()=>{
        const s=stateFor([...failureState.records[unit.id].attempts,proof(1,relearnAt),proof(1,delayedAt)]);
        assert.equal(m.stable(unit,s,delayedAt),false);
        assert.equal(m.due(unit,s,delayedAt),true);
        assert.equal(m.nextReviewAt(unit,s),delayedAt);
    });
    test('An assisted attempt resets consolidation even when its answers are correct',()=>{
        const helped={...proof(0,resetAt),assisted:true},pending=stateFor([...beforeReset,helped]);
        assert.equal(m.stable(unit,pending,resetAt),false);
        assert.equal(m.due(unit,pending,resetAt),true);
        const corrected=stateFor([...pending.records[unit.id].attempts,proof(1,relearnAt)]);
        assert.equal(m.stable(unit,corrected,relearnAt),false);
        assert.equal(m.nextReviewAt(unit,corrected),delayedAt);
        const retained=stateFor([...corrected.records[unit.id].attempts,proof(0,delayedAt)]);
        assert.equal(m.stable(unit,retained,delayedAt),true);
    });
    test('A response without required listening evidence resets independent consolidation',()=>{
        const s=stateFor([...beforeReset,{...proof(0,resetAt),heard:[]},proof(1,relearnAt)]);
        assert.equal(m.passedQuiz(unit,s.records[unit.id].attempts.at(-2),relearnAt),false);
        assert.equal(m.stable(unit,s,relearnAt),false);
        assert.equal(m.nextReviewAt(unit,s),delayedAt);
    });
    test('Returning to help during an unchecked challenge resets status before submission',()=>{
        clock=resetAt;
        const s=stateFor(beforeReset,{round:2,phase:'challenge'});
        const helped=m.changeStudyStep(s,unit.id,0);
        assert.equal(m.stable(unit,helped,resetAt),false);
        assert.equal(m.due(unit,helped,resetAt),true);
        const restarted=m.restartQuiz(helped,unit.id);
        assert.equal(m.stable(unit,restarted,resetAt),false,'An explicit fresh quiz retains the unsubmitted help barrier');
        assert.equal(m.due(unit,restarted,resetAt),true);
        clock=relearnAt;
        const recovered=submit(restarted,3,relearnAt);
        assert.equal(m.stable(unit,recovered,relearnAt),false);
        assert.equal(m.nextReviewAt(unit,recovered),delayedAt);
        clock=now;
        const restored=m.parseProgress(m.exportProgress(recovered));
        assert.deepEqual(restored.records,recovered.records,'The optional help marker must survive v2 backups');
        assert.equal(m.stable(unit,submit(restored,4,delayedAt),delayedAt),true);
    });
    test('Unsubmitted help remains a reset barrier after export and rejects a future marker',()=>{
        clock=resetAt;
        const helped=m.changeStudyStep(stateFor(beforeReset,{round:2,phase:'challenge'}),unit.id,0);
        const saved=m.exportProgress(helped),restored=m.parseProgress(saved);
        assert.deepEqual(restored.records,helped.records);
        assert.equal(m.stable(unit,restored,resetAt),false);
        assert.equal(m.due(unit,restored,resetAt),true);
        clock=resetAt-1;
        assert.throws(()=>m.parseProgress(saved),'A future unsubmitted help marker must be rejected');
    });
    test('Help after an already checked stable round still requires new delayed independent evidence',()=>{
        clock=resetAt;
        const checked=stateFor(beforeReset,{round:1,phase:'challenge'});
        assert.equal(m.stable(unit,checked,resetAt),true);
        const helped=m.changeStudyStep(checked,unit.id,0);
        assert.equal(m.stable(unit,helped,resetAt),false,'Checked answers do not exempt later help exposure');
        assert.equal(m.due(unit,helped,resetAt),true);
        clock=relearnAt;
        const recovered=submit(m.restartQuiz(helped,unit.id),2,relearnAt);
        assert.equal(m.stable(unit,recovered,relearnAt),false);
        assert.equal(m.nextReviewAt(unit,recovered),delayedAt);
        clock=now;
        assert.equal(m.stable(unit,submit(recovered,4,delayedAt),delayedAt),true);
    });
    test('First pass still opens the next unit immediately but never means stable',()=>{
        const s=stateFor([proof(0,relearnAt)]);
        assert.equal(m.achieved(unit,s,relearnAt),true);
        assert.equal(m.stable(unit,s,relearnAt),false);
        assert.equal(m.statusMap(s,relearnAt)[next.id],'available');
        assert.equal(m.nextReviewAt(unit,s),relearnAt+day);
    });
    test('Same-day raw passes neither inflate the review tier nor move its anchor',()=>{
        const anchor=historical+day,s=stateFor([...beforeReset,proof(0,anchor+1000),proof(1,anchor+2000)]);
        assert.equal(m.stable(unit,s,anchor+2000),true);
        assert.equal(m.nextReviewAt(unit,s),anchor+7*day);
        assert.equal(m.due(unit,s,anchor+7*day-1),false);
        assert.equal(m.due(unit,s,anchor+7*day),true);
        assert.equal(m.due(unit,s,anchor+8*day),true,'Four raw passes must not fabricate a 21-day interval');
        assert.equal(s.records[unit.id].attempts.length,4,'All raw same-day submissions remain available');
    });
    test('Early cross-day rehearsal also leaves the effective seven-day schedule unchanged',()=>{
        const anchor=historical+day,s=stateFor([...beforeReset,proof(0,anchor+day),proof(1,anchor+2*day)]);
        assert.equal(m.stable(unit,s,anchor+2*day),true);
        assert.equal(m.nextReviewAt(unit,s),anchor+7*day);
        assert.equal(m.due(unit,s,anchor+7*day-1),false);
        assert.equal(m.due(unit,s,anchor+7*day),true);
        assert.equal(s.records[unit.id].attempts.length,4,'Early practice remains in the raw backup');
    });
    test('Identical assessed source items remain the same bank despite option reordering',()=>{
        const signature=round=>JSON.stringify(c.questionsFor(unit,round).map(q=>[q.prompt,q.answer,q.clip?.start]));
        assert.equal(signature(0),signature(2),'This real unit supplies the unchanged-content fixture');
        const s=stateFor([proof(0,historical),proof(2,historical+day)]);
        assert.equal(m.stable(unit,s,historical+day),false);
        assert.equal(m.due(unit,s,historical+day),true);
    });
    test('Four scheduled independent sessions from real review entries earn the 21-day interval',()=>{
        const first=now-40*day,last=first+15*day;
        clock=first;
        let s=m.startNode({...m.emptyProgress(),access:{all:true,nodes:[]}},unit.id,clock);
        s=m.changeStudyStep(m.changeStudyStep(s,unit.id,0),unit.id,3);
        for(const date of [0,1,8,15]) {
            clock=first+date*day;
            if(date)s=review.prepareDueReview(s,unit.id,clock);
            s=submit(s,s.records[unit.id].round,clock);
        }
        assert.equal(m.stable(unit,s,last),true);
        assert.equal(m.nextReviewAt(unit,s,last),last+21*day);
        assert.equal(m.due(unit,s,last+8*day),false);
        assert.equal(m.due(unit,s,last+21*day-1),false);
        assert.equal(m.due(unit,s,last+21*day),true);
    });
    for(const id of [unit.id,'first','letters'])test(`Real due-review entry selects independent actual content across four sessions: ${id}`,()=>{
        const node=c.nodeById(id),first=now-40*day;
        const identity=round=>JSON.stringify(c.questionsFor(node,round).map(q=>[q.prompt,q.answer,q.clip?.book,q.clip?.lesson,q.clip?.start]));
        const trace=[];
        routeTraces.push({id,trace});
        clock=first;
        let s=m.startNode({...m.emptyProgress(),access:{all:true,nodes:[]}},id,clock);
        s=m.changeStudyStep(s,id,0);
        s=m.changeStudyStep(s,id,3);
        let previousIdentity;
        for(const [index,date] of [0,1,8,15].entries()) {
            clock=first+date*day;
            const existing=structuredClone(s.records[id].attempts);
            if(index) {
                assert.equal(m.due(node,s,clock),true,`${id} must be due before session ${index+1}`);
                s=review.prepareDueReview(s,id,clock);
                assert.deepEqual(s.records[id].attempts,existing,'Opening a due review preserves all prior raw attempts');
                assert.equal(s.records[id].phase,'challenge');
                assert.equal(s.records[id].answers.length,0,'The actual entry opens a fresh independent round');
                const unfinished={...s,records:{...s.records,[id]:{...s.records[id],answers:['answer being entered']}}};
                assert.deepEqual(review.prepareDueReview(unfinished,id,clock),unfinished,'Re-entering an unfinished due check preserves its answer');
            }
            const record=s.records[id],round=record.round,questions=c.questionsFor(node,round),signature=identity(round);
            if(index<3)assert.equal(round,index,'The first three actual scheduled entries use rounds 0, 1, and 2');
            assert.ok(!index||round>trace.at(-1).round,'The entry advances the real round counter');
            const ready={...s,records:{...s.records,[id]:{...record,answers:questions.map(q=>q.answer.split(/\s+\/\s+/)[0]),heard:questions.flatMap((q,i)=>q.clip?[i]:[])}}};
            s=m.submitQuiz(ready,id,clock);
            const allCorrect=m.passedQuiz(node,s.records[id].attempts.at(-1),clock);
            const nextReviewAt=m.nextReviewAt(node,s,clock),sameContentAsPrevious=index?signature===previousIdentity:false;
            trace.push({day:date,round,allCorrect,due:m.due(node,s,clock),nextReviewDay:(nextReviewAt-first)/day,sameContentAsPrevious,signatureSha256:createHash('sha256').update(signature).digest('hex')});
            assert.equal(allCorrect,true,'Reference answers and required audio evidence pass the actual selected round');
            assert.equal(sameContentAsPrevious,false,'A due entry must select different assessed content from the preceding effective review');
            assert.equal(m.due(node,s,clock),false,'A valid due independent review clears the current due status');
            assert.equal(nextReviewAt,first+[1,8,15,36][index]*day,'Actual scheduled sessions retain the 1-day, 7-day, 7-day, 21-day progression');
            previousIdentity=signature;
        }
        assert.equal(s.records[id].attempts.length,4,'Skipped equivalent banks do not create invented attempts');
        assert.equal(m.due(node,s,first+36*day-1),false);
        assert.equal(m.due(node,s,first+36*day),true);
        const restored=m.parseProgress(m.exportProgress(s));
        assert.deepEqual(restored.records,s.records,'Actual route-selected rounds and their raw evidence survive v2 backup');
    });
    test('An early raw pass does not replace the effective bank used by the next due entry',()=>{
        const first=now-40*day,identity=round=>JSON.stringify(c.questionsFor(unit,round).map(q=>[q.prompt,q.answer,q.clip?.book,q.clip?.lesson,q.clip?.start]));
        const trace=[];
        routeTraces.push({id:unit.id,scenario:'early raw repeat before scheduled review',trace});
        clock=first;
        let s=m.startNode({...m.emptyProgress(),access:{all:true,nodes:[]}},unit.id,clock);
        s=m.changeStudyStep(m.changeStudyStep(s,unit.id,0),unit.id,3);
        const finish=event=>{
            const round=s.records[unit.id].round,signature=identity(round);
            s=submit(s,round,clock);
            assert.equal(m.passedQuiz(unit,s.records[unit.id].attempts.at(-1),clock),true);
            trace.push({event,day:(clock-first)/day,round,due:m.due(unit,s,clock),nextReviewDay:(m.nextReviewAt(unit,s,clock)-first)/day,signatureSha256:createHash('sha256').update(signature).digest('hex')});
            return {round,signature};
        };
        finish('first independent pass');
        clock=first+day;
        s=review.prepareDueReview(s,unit.id,clock);
        const effective=finish('first delayed independent review');
        assert.equal(m.nextReviewAt(unit,s,clock),first+8*day);
        clock=first+2*day;
        s=m.restartQuiz(s,unit.id,clock);
        const early=finish('early raw independent repeat');
        assert.equal(m.nextReviewAt(unit,s,clock),first+8*day,'An early pass must not move the effective review anchor');
        assert.equal(m.due(unit,s,clock),false);
        clock=first+8*day;
        s=review.prepareDueReview(s,unit.id,clock);
        assert.ok(s.records[unit.id].round>early.round,'The actual entry advances from the current raw round');
        assert.notEqual(identity(s.records[unit.id].round),effective.signature,'The selected bank must differ from the effective delayed review, regardless of the early raw pass');
        finish('next scheduled independent review');
        assert.equal(m.due(unit,s,clock),false);
        assert.equal(m.nextReviewAt(unit,s,clock),first+15*day,'Four raw passes with an early repeat still represent only three effective scheduled sessions');
        assert.equal(s.records[unit.id].attempts.length,4,'The early practice is retained as original evidence');
    });
    test('Latest failed unit is recommended before its available unlearned successor',()=>{
        assert.equal(m.continueNode(failureState).id,unit.id);
        const skipped=m.startNode(failureState,next.id,now);
        assert.equal(skipped.lastNode,next.id);
        assert.equal(m.continueNode(skipped).id,next.id,'An explicit learner choice remains resumable');
        assert.equal(m.due(unit,skipped,now),true,'Skipping does not falsify the unresolved review');
    });
    test('External-review provenance is consistent for chapter, writing, speaking, and mocks',()=>{
        const tasks=['writing','speaking'].map(lane=>c.nodes.find(n=>n.kind==='task'&&n.lane===lane));
        assert.equal(m.projectErrors(chapter,project,now).length,0);
        for(const task of tasks)assert.equal(m.evidenceErrors(task,evidence,now).length,0);
        assert.equal(m.isReady(mockState(evidence.reviewer),now),true,'Two valid external-reviewed mocks still count');
        for(const reviewer of ['', '自评', '自己', 'self', ' SELF ']) {
            assert.ok(m.projectErrors(chapter,{...project,reviewer},now).length>0,`Chapter rejects ${reviewer}`);
            for(const task of tasks)assert.ok(m.evidenceErrors(task,{...evidence,reviewer},now).length>0,`${task.lane} rejects ${reviewer}`);
            const s=mockState(reviewer);
            assert.ok(m.mockErrors(s.records['mock-one'].mock,'6',now).length>0,`Mock rejects ${reviewer}`);
            assert.equal(m.isReady(s,now),false,`Two mocks with ${reviewer} cannot produce readiness`);
        }
    });
    test('Future proofs cannot consolidate or postpone an already overdue review',()=>{
        const future=proof(1,now+1),s=stateFor([proof(0,historical),future]);
        assert.equal(m.passedQuiz(unit,future,now),false);
        assert.equal(m.stable(unit,s,now),false);
        assert.equal(m.due(unit,s,now),true);
        assert.throws(()=>m.parseProgress(JSON.stringify(s)));
        const onlyFuture=stateFor([future]);
        assert.equal(m.achieved(unit,onlyFuture,now),false);
        assert.equal(m.stable(unit,onlyFuture,now),false);
        assert.equal(m.due(unit,onlyFuture,now),false);
    });
    test('Nonchronological legacy history is conservative and survives unchanged',()=>{
        const attempts=[proof(0,historical),wrong(0,resetAt),proof(1,historical+day)];
        const s=stateFor(attempts),restored=m.parseProgress(m.exportProgress(s));
        assert.deepEqual(restored.records,s.records,'Import must preserve append order and raw evidence');
        assert.equal(m.achieved(unit,restored,now),true);
        assert.equal(m.stable(unit,restored,now),false);
        assert.equal(m.due(unit,restored,now),true);
        const reversed=stateFor([proof(1,historical+day),proof(0,historical)]);
        assert.equal(m.stable(unit,reversed,now),false);
        assert.equal(m.due(unit,reversed,now),true);
    });
    test('Same-timestamp failure and correction cannot reuse an older pass as delayed evidence',()=>{
        const s=stateFor([...beforeReset,wrong(0,resetAt),proof(1,resetAt)]);
        assert.equal(m.stable(unit,s,resetAt),false);
    });
    test('Legacy v2 backups retain all old records while receiving stricter derived status',()=>{
        const legacy=stateFor([proof(0,historical),wrong(0,resetAt),proof(1,relearnAt)],{draft:{note:'The existing learner draft survives unchanged.'},practice:{step:2,guided:'Is this your book?',recall:'Is this your pen?',hinted:true,checked:true}});
        legacy.records['mock-one']={...m.emptyRecord(),mock:mock('Synthetic paper A',m.today(now-2*day),'自评')};
        legacy.records['mock-two']={...m.emptyRecord(),mock:mock('Synthetic paper B',m.today(now),'自评')};
        legacy.minimum='6';
        const restored=m.parseProgress(m.exportProgress(legacy));
        assert.equal(restored.version,2);
        assert.deepEqual(restored.records,legacy.records,'Compatibility must not delete, normalize, or rewrite old user records');
        assert.deepEqual(restored.access,legacy.access);
        assert.equal(restored.lastNode,legacy.lastNode);
        assert.equal(m.achieved(unit,restored,now),true);
        assert.equal(m.stable(unit,restored,now),false);
        assert.equal(m.isReady(restored,now),false);
        assert.throws(()=>m.parseProgress(JSON.stringify({...legacy,version:1})),/旧版/,'Incompatible v1 remains explicit instead of inventing progress');
    });
    test('A legacy unsubmitted assisted challenge cannot retain old consolidation across restart',()=>{
        clock=resetAt;
        const legacy=stateFor(beforeReset,{round:2,phase:'challenge',assisted:true});
        const restored=m.parseProgress(m.exportProgress(legacy));
        assert.deepEqual(restored.records,legacy.records,'Restoring legacy help state must preserve its original fields');
        assert.equal(m.stable(unit,restored,resetAt),false,'An unsubmitted assisted round is not independent evidence');
        assert.equal(m.due(unit,restored,resetAt),true);
        const restarted=m.restartQuiz(restored,unit.id);
        assert.equal(m.stable(unit,restarted,resetAt),false,'Clearing the current assisted flag must not erase its exposure barrier');
        clock=relearnAt;
        const recovered=submit(restarted,3,relearnAt);
        assert.equal(m.stable(unit,recovered,relearnAt),false);
        assert.equal(m.nextReviewAt(unit,recovered),delayedAt);
        clock=now;
        assert.equal(m.stable(unit,submit(recovered,4,delayedAt),delayedAt),true);
    });
    test('More than 12 retries retain the first proof and the failure reset barrier',()=>{
        let s=stateFor([proof(0,historical),wrong(0,resetAt)]);
        for(let index=0;index<18;index++)s=submit(s,1,relearnAt+index*1000);
        const attempts=s.records[unit.id].attempts;
        assert.equal(attempts.length,20,'All original submissions are preserved');
        assert.deepEqual(attempts[0],proof(0,historical));
        assert.deepEqual(attempts[1],wrong(0,resetAt),'History retention must not prune the barrier and resurrect old consolidation');
        assert.equal(m.achieved(unit,s,now),true);
        assert.equal(m.stable(unit,s,relearnAt+17000),false);
        assert.equal(m.nextReviewAt(unit,s),delayedAt,'Same-day retries must not delay the next independent review');
        const restored=m.parseProgress(m.exportProgress(s));
        assert.deepEqual(restored.records,s.records,'Expanded historical records must remain v2 compatible');
        assert.equal(m.stable(unit,restored,now),false);
    });
    Date.now=realNow;
    await report({content:'real prepared curriculum',passed:cases.length,failed:failures.length,cases,failures,routeTraces});
    if(failures.length)process.exitCode=1;
}
