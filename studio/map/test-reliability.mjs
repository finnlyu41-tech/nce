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
const assessedIdentity=(node,round,bank)=>JSON.stringify(c.questionsFor(node,round,bank).map(q=>JSON.stringify([q.prompt,q.answer,q.clip?.book,q.clip?.lesson,q.clip?.start,q.clip?.end])).sort());
const proof=(round,at,node=unit,bank)=>({round,at,...bank===undefined?{}:{bank},answers:c.questionsFor(node,round,bank).map(q=>q.answer.split(/\s+\/\s+/)[0]),assisted:false,heard:c.questionsFor(node,round,bank).flatMap((q,i)=>q.clip?[i]:[])});
const wrong=(round,at)=>({...proof(round,at),answers:['deliberately incorrect synthetic response']});
const progressFor=(node,attempts,record={})=>({...m.emptyProgress(),access:{all:true,nodes:[]},lastNode:node.id,records:{[node.id]:{...m.emptyRecord(),...record,attempts}}});
const stateFor=(attempts,record={})=>progressFor(unit,attempts,record);
const submit=(state,round,at,node=unit)=>{
    const record=state.records[node.id],p=proof(round,at,node,record?.bank);
    const ready={...state,records:{...state.records,[node.id]:{...record,round:p.round,answers:p.answers,heard:p.heard,assisted:false,phase:'challenge'}}};
    return m.submitQuiz(ready,node.id,at);
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
    const curriculum=await import(await moduleURL(path.join(root,'curriculum.ts')));
    const sourceLesson3=JSON.parse(await fs.readFile(path.join(root,'../dist-online/language/NCE1/3.json'),'utf8'));
    const cases=[],failures=[],routeTraces=[],sourceEvidence=[];
    let bankBounds;
    const legacyStarterRows={
        first:[
            {en:'Excuse me!',zh:'想请别人注意时：请问／劳驾。',clip:{book:'NCE1',lesson:1,start:15.11,end:16.66}},
            {en:'Pardon?',zh:'没听清时：请再说一遍。',clip:{book:'NCE1',lesson:1,start:21.44,end:23.17}},
            {en:'Thank you very much.',zh:'得到帮助后：非常感谢。',clip:{book:'NCE1',lesson:1,start:29.49,end:33}},
        ],
        'small-exchange':[
            {en:'Is this your handbag?',zh:'这是你的手提包吗？Is 放在句首，表示在问。',clip:{book:'NCE1',lesson:1,start:18.26,end:21.44}},
            {en:'Yes, it is.',zh:'是的，是我的。先模仿整句。',clip:{book:'NCE1',lesson:1,start:26.73,end:29.49}},
            {en:'This is not my umbrella.',zh:'这不是我的伞。not 表示否定。',clip:{book:'NCE1',lesson:3,start:33.72,end:37.39}},
        ],
    };
    const legacyQuestions=(id,round)=>{
        const rows=legacyStarterRows[id],offset=round%rows.length;
        return [...rows.slice(offset),...rows.slice(0,offset)].map((row,i)=>({id:`sound-${i}`,type:'choice',mode:'listen',prompt:'听一句原声，选择对应的意思。',clip:row.clip,options:rows.map(x=>x.zh).sort(),answer:row.zh,explanation:`${row.en} — ${row.zh}`}));
    };

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
    for(const id of [unit.id,'letters','first','small-exchange'])test(`Real due-review entry selects genuinely different material across scheduled sessions: ${id}`,()=>{
        const node=c.nodeById(id),first=now-40*day;
        const versioned=['first','small-exchange'].includes(id),dates=versioned?[0,1,8,15,36]:[0,1,8,15];
        const identity=(round,bank)=>assessedIdentity(node,round,bank);
        const trace=[];
        routeTraces.push({id,trace});
        clock=first;
        let s=m.startNode({...m.emptyProgress(),access:{all:true,nodes:[]}},id,clock);
        s=m.changeStudyStep(s,id,0);
        s=m.changeStudyStep(s,id,3);
        let previousIdentity;
        for(const [index,date] of dates.entries()) {
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
            const record=s.records[id],round=record.round,questions=c.questionsFor(node,round,record.bank),signature=identity(round,record.bank);
            if(!versioned&&index<3)assert.equal(round,index,'Ordinary unit and letter entries retain rounds 0, 1, and 2');
            if(versioned&&index)assert.equal(record.bank,'starter-v2','The due entry explicitly migrates to the versioned starter bank');
            assert.ok(!index||round>trace.at(-1).round,'The entry advances the real round counter');
            const ready={...s,records:{...s.records,[id]:{...record,answers:questions.map(q=>q.answer.split(/\s+\/\s+/)[0]),heard:questions.flatMap((q,i)=>q.clip?[i]:[])}}};
            s=m.submitQuiz(ready,id,clock);
            assert.equal(s.records[id].attempts.at(-1).bank,record.bank,'Submission preserves the selected bank marker');
            const allCorrect=m.passedQuiz(node,s.records[id].attempts.at(-1),clock);
            const nextReviewAt=m.nextReviewAt(node,s,clock),sameContentAsPrevious=index?signature===previousIdentity:false;
            trace.push({day:date,round,bank:record.bank||'legacy',allCorrect,due:m.due(node,s,clock),nextReviewDay:(nextReviewAt-first)/day,sameContentAsPrevious,signatureSha256:createHash('sha256').update(signature).digest('hex')});
            assert.equal(allCorrect,true,'Reference answers and required audio evidence pass the actual selected round');
            assert.equal(sameContentAsPrevious,false,'A due entry must select different assessed content from the preceding effective review');
            assert.equal(m.due(node,s,clock),false,'A valid due independent review clears the current due status');
            assert.equal(nextReviewAt,first+[1,8,15,36,57][index]*day,'Actual scheduled sessions retain the 1-day, 7-day, 7-day, 21-day progression');
            previousIdentity=signature;
        }
        assert.equal(s.records[id].attempts.length,dates.length,'Skipped equivalent banks do not create invented attempts');
        const nextDate=versioned?57:36;
        assert.equal(m.due(node,s,first+nextDate*day-1),false);
        assert.equal(m.due(node,s,first+nextDate*day),true);
        const restored=m.parseProgress(m.exportProgress(s));
        assert.deepEqual(restored.records,s.records,'Actual route-selected rounds and their raw evidence survive v2 backup');
    });
    test('An early raw pass does not replace the effective bank used by the next due entry',()=>{
        const first=now-40*day,identity=round=>assessedIdentity(unit,round);
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
    for(const id of ['first','small-exchange']) {
        const node=c.nodeById(id);
        test(`Legacy starter rotations preserve original questions and grades without proving consolidation: ${id}`,()=>{
            for(const round of [0,1,2,3,4,5,99999,100000]) {
                const original=legacyQuestions(id,round),answers=original.map(q=>q.answer);
                assert.deepEqual(c.questionsFor(node,round),original,'All unmarked legacy rounds retain their original question interpretation');
                assert.equal(m.grade(node,answers,round).every(Boolean),true,'Original answers still grade against the original legacy questions');
            }
            assert.equal(assessedIdentity(node,0),assessedIdentity(node,1),'Rotating legacy item order does not supply different material');
            const old=[proof(0,historical,node),proof(1,historical+day,node)];
            const s=progressFor(node,old,{round:1,answers:old[1].answers,heard:old[1].heard,phase:'challenge'});
            assert.equal(old.every(p=>m.passedQuiz(node,p,now)),true);
            assert.equal(m.achieved(node,s,now),true);
            assert.equal(m.stable(node,s,now),false);
            assert.equal(m.due(node,s,now),true);
            const restored=m.parseProgress(m.exportProgress(s));
            assert.deepEqual(restored.records,s.records,'Legacy answers, order, and bank absence survive backup unchanged');
            assert.equal('bank' in restored.records[id],false);
            assert.equal(restored.records[id].attempts.some(p=>'bank' in p),false);
        });
        test(`Mixed legacy and starter-v2 histories retain evidence and actual bank semantics: ${id}`,()=>{
            const old=[proof(0,historical,node),proof(1,historical+day,node)];
            let s=progressFor(node,old,{round:1,answers:old[1].answers,heard:old[1].heard,phase:'challenge'});
            clock=now;
            s=review.prepareDueReview(s,id,clock);
            assert.equal(s.records[id].bank,'starter-v2');
            assert.notEqual(assessedIdentity(node,s.records[id].round,s.records[id].bank),assessedIdentity(node,0),'Changing only the marker cannot substitute for genuinely different material');
            s=submit(s,s.records[id].round,clock,node);
            assert.deepEqual(s.records[id].attempts.slice(0,2),old,'Migration never rewrites old raw proof fields');
            assert.equal(s.records[id].attempts.at(-1).bank,'starter-v2');
            assert.equal(m.stable(node,s,clock),true);
            const restored=m.parseProgress(m.exportProgress(s));
            assert.deepEqual(restored.records,s.records);
            assert.equal(m.stable(node,restored,clock),true);
            for(const p of restored.records[id].attempts)assert.equal(m.grade(node,p.answers,p.round,p.bank).every(Boolean),true);
        });
        test(`Versioned starter early practice leaves the effective review date and bank unchanged: ${id}`,()=>{
            const first=now-40*day;
            clock=first;
            let s=m.startNode({...m.emptyProgress(),access:{all:true,nodes:[]}},id,clock);
            s=m.changeStudyStep(m.changeStudyStep(s,id,0),id,3);
            s=submit(s,s.records[id].round,clock,node);
            clock=first+day;s=review.prepareDueReview(s,id,clock);s=submit(s,s.records[id].round,clock,node);
            const anchor=s.records[id].attempts.at(-1);
            clock=first+2*day;s=m.restartQuiz(s,id,clock);s=submit(s,s.records[id].round,clock,node);
            assert.equal(m.nextReviewAt(node,s,clock),first+8*day,'Early practice does not move a scheduled review date');
            assert.equal(s.records[id].attempts.at(-1).bank,'starter-v2');
            clock=first+8*day;s=review.prepareDueReview(s,id,clock);
            assert.notEqual(assessedIdentity(node,s.records[id].round,s.records[id].bank),assessedIdentity(node,anchor.round,anchor.bank),'A due entry compares against the effective delayed session rather than an early raw pass');
            s=submit(s,s.records[id].round,clock,node);
            assert.equal(m.due(node,s,clock),false);
            assert.equal(m.nextReviewAt(node,s,clock),first+15*day,'Four raw attempts with early practice still count as three effective sessions');
            assert.equal(s.records[id].attempts.length,4);
        });
        test(`Versioned starter failure and reacquisition require new delayed independent material: ${id}`,()=>{
            const first=now-40*day,failureAt=first+8*day,recoveredAt=failureAt+1000,retainedAt=recoveredAt+day;
            clock=first;
            let s=m.startNode({...m.emptyProgress(),access:{all:true,nodes:[]}},id,clock);
            s=m.changeStudyStep(m.changeStudyStep(s,id,0),id,3);
            s=submit(s,s.records[id].round,clock,node);
            clock=first+day;s=review.prepareDueReview(s,id,clock);s=submit(s,s.records[id].round,clock,node);
            clock=failureAt;s=review.prepareDueReview(s,id,clock);
            const r=s.records[id],bad={...r,answers:['deliberately incorrect synthetic response']};
            s=m.submitQuiz({...s,records:{...s.records,[id]:bad}},id,clock);
            assert.equal(s.records[id].attempts.at(-1).bank,'starter-v2');
            assert.equal(m.stable(node,s,clock),false);
            assert.equal(m.due(node,s,clock),true);
            assert.equal(m.achieved(node,s,clock),true,'Historical first learning completion remains intact');
            clock=recoveredAt;s=m.restartQuiz(s,id,clock);s=submit(s,s.records[id].round,clock,node);
            const reacquired=s.records[id].attempts.at(-1);
            assert.equal(m.stable(node,s,clock),false);
            assert.equal(m.nextReviewAt(node,s,clock),retainedAt);
            assert.equal(m.due(node,s,retainedAt-1),false);
            clock=retainedAt;s=review.prepareDueReview(s,id,clock);
            assert.notEqual(assessedIdentity(node,s.records[id].round,s.records[id].bank),assessedIdentity(node,reacquired.round,reacquired.bank));
            s=submit(s,s.records[id].round,clock,node);
            assert.equal(m.stable(node,s,clock),true);
            assert.equal(m.nextReviewAt(node,s,clock),retainedAt+7*day);
            assert.equal(s.records[id].attempts.length,5,'All legacy, new, failed, and recovered proof rows remain present');
            assert.deepEqual(m.parseProgress(m.exportProgress(s)).records,s.records);
        });
        test(`Versioned starter B uses readable source transcript and exact audio boundaries: ${id}`,()=>{
            const expected=id==='first'?[
                ['My coat and my umbrella please.',17.56,22],['Thank you sir.',25.03,26.86],['Sorry sir.',37.39,39.67],
            ]:[
                ['Here is my ticket.',22,25.03],['Is this your umbrella?',39.67,42.56],["No it isn't.",42.56,45.69],
            ];
            const questions=c.questionsFor(node,1,'starter-v2');
            assert.equal(questions.length,3);
            assert.notEqual(assessedIdentity(node,0,'starter-v2'),assessedIdentity(node,1,'starter-v2'),'The two banks use genuinely different material');
            const clips=[];
            for(const [en,start,end] of expected) {
                const index=sourceLesson3.rows.findIndex(row=>row.en===en&&row.time===start),row=sourceLesson3.rows[index];
                assert.ok(row&&row.zh.trim(),'The original English and Chinese transcript row is readable');
                assert.equal(sourceLesson3.rows[index+1].time,end,'The clip ends at the next actual transcript boundary');
                const q=questions.find(q=>q.clip?.book==='NCE1'&&q.clip.lesson===3&&q.clip.start===start&&q.clip.end===end);
                assert.ok(q,`The actual B bank includes ${en} at its real source interval`);
                assert.ok(q.explanation.includes(en),'The displayed explanation identifies the actual spoken source');
                clips.push({en,zh:row.zh,book:'NCE1',lesson:3,start,end});
            }
            sourceEvidence.push({id,bank:'starter-v2',round:1,sourceSha256:sourceLesson3.sourceSha256,clips});
        });
    }
    test('Unknown starter bank markers are rejected in current records and historical proofs',()=>{
        const node=c.nodeById('first');
        for(const bank of ['starter-v3','legacy','',null])for(const target of ['record','proof']) {
            const s=progressFor(node,[proof(0,historical,node)]);
            if(target==='record')s.records.first.bank=bank;else s.records.first.attempts[0].bank=bank;
            assert.throws(()=>m.parseProgress(JSON.stringify(s)),`${target} must reject unknown bank ${bank}`);
        }
    });
    test('The starter-v2 marker is rejected on unrelated unit, letter, and mock records',()=>{
        for(const id of [unit.id,'letters','mock-one'])for(const target of ['record','proof']) {
            const node=c.nodeById(id),attempts=id==='mock-one'?[]:[proof(0,historical,node)],s=progressFor(node,attempts);
            if(target==='record')s.records[id].bank='starter-v2';
            else {if(!s.records[id].attempts.length)s.records[id].attempts=[proof(0,historical,c.nodeById('first'))];s.records[id].attempts[0].bank='starter-v2'}
            assert.throws(()=>m.parseProgress(JSON.stringify(s)),`${target} marker is invalid for ${id}`);
        }
    });
    test('Sorted material identity and explicit bank dispatch satisfy the three-candidate bound',()=>{
        const gcd=(a,b)=>b?gcd(b,a%b):a,failures=[],legacyGroups=[];
        let checkedPairs=0,maximumCandidatesNeeded=0;
        const nodes=[...c.unitNodes,...c.nodes.filter(n=>n.kind==='starter')];
        for(const node of nodes) {
            const u=curriculum.unitById(node.id),versioned=['first','small-exchange'].includes(node.id);
            const grammar=u&&(u.book!=='NCE1'||u.lesson>23)?curriculum.guidesFor(u).length:1;
            const period=u?3*grammar/gcd(3,grammar):node.id==='letters'?2:3;
            const contexts=versioned?[{anchorBank:undefined,anchorPeriod:3,nextBank:'starter-v2',currentPeriod:6},{anchorBank:'starter-v2',anchorPeriod:2,nextBank:'starter-v2',currentPeriod:2}]:[{anchorBank:undefined,anchorPeriod:period,nextBank:undefined,currentPeriod:period}];
            if(versioned) {
                const distinct=new Set(Array.from({length:3},(_,round)=>assessedIdentity(node,round))).size;
                legacyGroups.push({id:node.id,unmarkedDistinctMaterialGroups:distinct,requiresExplicitMigration:true});
                assert.equal(distinct,1,'Legacy rotations remain one material group, not new evidence');
                assert.equal(new Set([0,1].map(round=>assessedIdentity(node,round,'starter-v2'))).size,2);
            }
            for(const context of contexts)for(let current=0;current<context.currentPeriod;current++)for(let anchor=0;anchor<context.anchorPeriod;anchor++) {
                checkedPairs++;
                const previous=assessedIdentity(node,anchor,context.anchorBank);
                const offset=[1,2,3].find(delta=>assessedIdentity(node,current+delta,context.nextBank)!==previous);
                if(offset===undefined)failures.push({id:node.id,current,anchor,...context});else maximumCandidatesNeeded=Math.max(maximumCandidatesNeeded,offset);
            }
        }
        bankBounds={identity:'sorted prompt/answer/book/lesson/start/end; item order and options ignored',bankDispatch:'bank selects source interpretation; changing only a marker does not establish novelty',units:c.unitNodes.length,starters:3,checkedBankPairs:checkedPairs,maximumCandidatesNeeded,candidateLimit:3,legacyGroups,failures};
        assert.deepEqual(failures,[]);
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
    await report({content:'real prepared curriculum',passed:cases.length,failed:failures.length,cases,failures,routeTraces,sourceEvidence,bankBounds});
    await fs.mkdir(path.join(root,'../work'),{recursive:true});
    await fs.writeFile(path.join(root,'../work/map-review-banks-bound.json'),JSON.stringify(bankBounds,null,2)+'\n');
    await fs.writeFile(path.join(root,'../work/starter-v2-source-evidence.json'),JSON.stringify(sourceEvidence,null,2)+'\n');
    if(failures.length)process.exitCode=1;
}
