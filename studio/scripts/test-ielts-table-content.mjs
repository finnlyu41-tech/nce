import assert from 'node:assert/strict';
import path from 'node:path';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {stripTypeScriptTypes} from 'node:module';
import {loadTypeScript,moduleURL} from './ielts-blueprint-loader.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),file=name=>path.join(root,name);
const [batch,content,structure,projection,catalog,author]=await Promise.all([
 loadTypeScript(file('ielts-blueprint/curriculum/table-completion.ts')),
 loadTypeScript(file('ielts-blueprint/curriculum/table-completion/validation.ts')),
 loadTypeScript(file('ielts-blueprint/structured-table/validation.ts')),
 loadTypeScript(file('ielts-blueprint/structured-table/projection.ts')),
 loadTypeScript(file('ielts-blueprint/sample-sequence.ts')),
 loadTypeScript(file('ielts-blueprint/curriculum/table-completion/stimuli.ts')),
]);
const lesson=batch.tableCompletionLessonsFor('academic')[0],stimuli=author.academicTableStimuli;
const materials=[lesson.model,lesson.guided,lesson.independent,lesson.timed,...lesson.reviews];
// Inserted only after the independent reviewer freezes source-word answer sets.
const independentGoldens = {
  "ielts-r12-a-model-q1": [
    "glare"
  ],
  "ielts-r12-a-model-q2": [
    "bamboo"
  ],
  "ielts-r12-a-model-q3": [
    "silt"
  ],
  "ielts-r12-a-guided-q1": [
    "wax"
  ],
  "ielts-r12-a-guided-q2": [
    "linen"
  ],
  "ielts-r12-a-guided-q3": [
    "shade"
  ],
  "ielts-r12-a-independent-q1": [
    "shallow"
  ],
  "ielts-r12-a-independent-q2": [
    "dry"
  ],
  "ielts-r12-a-independent-q3": [
    "in pairs"
  ],
  "ielts-r12-a-timed-q1": [
    "leather"
  ],
  "ielts-r12-a-timed-q2": [
    "light"
  ],
  "ielts-r12-a-timed-q3": [
    "soap"
  ],
  "ielts-r12-a-review-a-q1": [
    "felt"
  ],
  "ielts-r12-a-review-a-q2": [
    "pauses"
  ],
  "ielts-r12-a-review-a-q3": [
    "pencil"
  ],
  "ielts-r12-a-review-b-q1": [
    "dust"
  ],
  "ielts-r12-a-review-b-q2": [
    "by hand"
  ],
  "ielts-r12-a-review-b-q3": [
    "scratches"
  ]
};
let groups=0;
function group(name,fn){fn();groups++;console.log('PASS '+name)}
const normal=value=>value.trim().replace(/\s+/g,' ').toLowerCase();
function mutate(value,fn){const changed=structuredClone(value);fn(changed);return changed}
function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value)}return value}
const sourceBefore=await readFile(file('ielts-blueprint/sample-sequence.ts'),'utf8');
const catalogCounts=['academic','general-training'].map(variant=>catalog.sampleLessonsFor(variant).length);
group('1. The finite source-word chain has real row/column tables, exact evidence and complete seven-stage bindings',()=>{
 assert.deepEqual(content.validateTableCompletionContent(lesson,stimuli),[]);
 assert.equal(materials.length,6);assert.equal(materials.reduce((n,m)=>n+m.questions.length,0),18);
 assert.equal(new Set(materials.map(m=>m.context)).size,6);
 for(const stimulus of stimuli){
  const m=materials.find(m=>m.id===stimulus.id),expected={rowCount:3,columnCount:2,blankCount:3,questions:m.questions.map((q,i)=>({id:q.id,questionNumber:i+1}))};
  const before=JSON.stringify(stimulus);assert.deepEqual(structure.validateTableStimulus(freeze(stimulus),expected),[]);
  const result=projection.projectTableStimulus(stimulus,expected);assert.equal(result.ok,true);assert.equal(result.projection.blanks.length,3);
  assert.deepEqual(JSON.parse(JSON.stringify(result.projection.stimulus)),JSON.parse(before));
  const first=result.projection.blanks[0];assert.strictEqual(first.cell,result.projection.stimulus.rows[first.rowIndex].cells[first.columnId]);
  result.projection.stimulus.rows[0].label='only the detached projection changes';
  assert.equal(JSON.stringify(stimulus),before);assert.strictEqual(batch.tableCompletionStimulusFor(m.id),stimulus);
 }
 const binding=batch.tableCompletionCoverage[0];assert.deepEqual(binding.requirementIds,['R12-A']);assert.deepEqual(binding.variants,['academic']);
 assert.deepEqual(Object.keys(binding.stages),['explain','model','guided','independent','timed','feedback','review']);
 for(const stage of Object.values(binding.stages)){assert(stage.expectedEvidence.trim());assert(stage.materialIds.every(id=>materials.some(m=>m.id===id)));}
});
group('2. Unsupported versions, hidden answer fields, duplicate/missing coordinates and broken links are rejected intact',()=>{
 const table=stimuli[0],first=projection.projectTableStimulus(table).projection.blanks[0];
 const bad=[mutate(table,t=>t.version=2),mutate(table,t=>t.accepted=['private']),mutate(table,t=>t.rows[0].future='lost'),mutate(table,t=>t.columns[1].id=t.columns[0].id),mutate(table,t=>delete t.rows[0].cells[t.columns[0].id]),mutate(table,t=>t.rows[0].cells.foreign={kind:'text',text:'x'}),mutate(table,t=>{const blanks=projection.projectTableStimulus(t).projection.blanks;t.rows.find(r=>r.id===blanks[1].rowId).cells[blanks[1].columnId].questionId=first.cell.questionId})];
 for(const t of bad){const before=JSON.stringify(t);assert(structure.validateTableStimulus(t).length);assert.equal(projection.projectTableStimulus(t).ok,false);assert.equal(JSON.stringify(t),before)}
 const noTable=stimuli.slice(1);assert(content.validateTableCompletionContent(lesson,noTable).length);
 const futureContext=mutate(lesson,l=>delete l.independent.context);assert(content.validateTableCompletionContent(futureContext,stimuli).length);
 const brokenKey=mutate(lesson,l=>l.guided.questions[0].accepted=['extra invented words']);assert(content.validateTableCompletionContent(brokenKey,stimuli).length);
});
group('3. Accepted source phrases match independently frozen complete cell-answer sets, never author intent alone',()=>{
 assert.equal(Object.keys(independentGoldens).length,18,'Freeze the independent keyless review before accepting this batch.');
 for(const m of materials)for(const q of m.questions){
  assert.deepEqual(q.accepted.map(normal).sort(),independentGoldens[q.id].map(normal).sort(),q.id);
  assert(q.accepted.every(answer=>answer.trim().split(/\s+/).length<=2));
 }
});
group('4. The pure table-to-controller adapter retains exact raw values and refuses lossy/foreign actions',()=>{
 const table=stimuli[1],qid=projection.projectTableStimulus(table).projection.blanks[0].cell.questionId;
 for(const type of ['answer','correction-answer'])for(const value of ['  Raw  mixed Case  ','', 'x'.repeat(500)]){
  const input=freeze({type,questionId:qid,value}),result=projection.adaptTableAnswerAction(table,input);
  assert.equal(result.ok,true);assert.deepEqual(result.action,input);assert.equal(result.action.value,value);
 }
 for(const action of [{type:'answer',questionId:qid,value:'x'.repeat(501)},{type:'answer',questionId:'foreign',value:'raw'},{type:'answer',questionId:qid,value:'raw',future:true},{type:'submit',questionId:qid,value:'raw'},{type:'answer',questionId:qid,value:2}]){
  const before=JSON.stringify(action);assert.equal(projection.adaptTableAnswerAction(table,action).ok,false);assert.equal(JSON.stringify(action),before);
 }
});
// Real unchanged engine/parser modules are registered only in this in-memory graph.
const asURL=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const injected=asURL(`
 import {sampleLessonsFor as existing,sampleSequence,sampleMaterials} from '${await moduleURL(file('ielts-blueprint/sample-sequence.ts'))}';
 import {tableCompletionLessonsFor} from '${await moduleURL(file('ielts-blueprint/curriculum/table-completion.ts'))}';
 export {sampleSequence,sampleMaterials};
 export const sampleLessonsFor=variant=>{const current=existing(variant);return [...current,...tableCompletionLessonsFor(variant).filter(l=>!current.some(old=>old.id===l.id))]};
 export const sampleLessonById=(variant,id)=>sampleLessonsFor(variant).find(l=>l.id===id);
`);
async function instrument(name,replacements){let source=stripTypeScriptTypes(await readFile(file(name),'utf8'));for(const match of [...source.matchAll(/from\s+['"]([^'"]+)['"]/g)]){if(!match[1].startsWith('.'))continue;const url=replacements[match[1]]||await moduleURL(path.resolve(path.dirname(file(name)),match[1]+'.ts'));source=source.replaceAll(match[0],`from '${url}'`)}return asURL(source)}
const engineURL=await instrument('ielts-blueprint/sample-sequence-model.ts',{'./sample-sequence':injected});
const engine=await import(engineURL),progress=await import(await instrument('app/ielts-sample-progress.ts',{'../ielts-blueprint/sample-sequence':injected,'../ielts-blueprint/sample-sequence-model':engineURL}));
let clock=Date.UTC(2026,9,2,12),roundTrips=0,state=engine.emptySampleState();
function roundTrip(value){const raw=progress.serializeSampleProgress(value,clock),read=progress.readSampleProgress(raw,clock),expected=structuredClone(value);for(const s of Object.values(expected.sessions))if(s.reviewPromptId===undefined)delete s.reviewPromptId;assert.equal(read.status,'ready',read.reason);assert.deepEqual(read.value,expected);assert.equal(read.raw,raw);roundTrips++;return read.value}
function act(action,at=clock+100){clock=Math.max(clock,at);const result=engine.transitionSample(state,action,at);assert.equal(result.issue,undefined,action.type+': '+result.issue);state=roundTrip(result.state);return state}
function deny(action,at=clock+100){clock=Math.max(clock,at);const result=engine.transitionSample(state,action,at);assert(result.issue);assert.strictEqual(result.state,state)}
function answerMaterial(wrong=false){const m=engine.activeSampleMaterial(state),table=batch.tableCompletionStimulusFor(m.id);for(const q of m.questions){const raw=wrong&&q===m.questions[0]?'  wrong extra words  ':`  ${independentGoldens[q.id][0].toUpperCase()}  `;const a=projection.adaptTableAnswerAction(table,{type:'answer',questionId:q.id,value:raw});assert.equal(a.ok,true);act(a.action)}}
group('5. Real canonical save/restore retains cell drafts, original errors, separate correction, timing and finite fresh reviews',()=>{
 act({type:'select-variant',variant:'academic'});act({type:'open-lesson',lessonId:lesson.id});act({type:'next'});act({type:'next'});
 answerMaterial();act({type:'submit'});act({type:'next'});act({type:'confirm-unseen',value:true});answerMaterial(true);act({type:'submit'});
 const original=structuredClone(engine.sampleSession(state).attempts.at(-1));assert.equal(original.correct,2);assert.equal(Object.values(original.answers)[0],'  wrong extra words  ');
 act({type:'next'});deny({type:'submit'});act({type:'start-timed'});act({type:'confirm-unseen',value:true});answerMaterial(true);clock+=180_001;act({type:'submit'},clock);
 assert.equal(engine.sampleSession(state).attempts.at(-1).withinTrainingTime,false);act({type:'next'});deny({type:'save-correction'});
 const timedOriginal=structuredClone(engine.sampleSession(state).attempts.at(-1));
 for(const q of lesson.timed.questions){const a=projection.adaptTableAnswerAction(batch.tableCompletionStimulusFor(lesson.timed.id),{type:'correction-answer',questionId:q.id,value:independentGoldens[q.id][0]});assert.equal(a.ok,true);act(a.action)}
 act({type:'correction-note',value:'核对行列后依据原文改正，首答继续保留。'});act({type:'save-correction'});
 assert.deepEqual(engine.sampleSession(state).attempts[1],original);assert.deepEqual(engine.sampleSession(state).attempts[2],timedOriginal);
 deny({type:'start-review'});clock+=24*60*60*1000;act({type:'start-review'},clock);act({type:'confirm-unseen',value:true});answerMaterial();act({type:'submit'});
 const firstReview=engine.sampleSession(state).attempts.at(-1);assert.equal(firstReview.fresh,true);assert.equal(firstReview.hinted,false);assert.equal(firstReview.audioUsable,false);
 deny({type:'start-review'});clock+=24*60*60*1000;act({type:'start-review'},clock);act({type:'hint'});answerMaterial();act({type:'submit'});assert.equal(engine.sampleSession(state).attempts.at(-1).hinted,true);
 clock+=24*60*60*1000;deny({type:'start-review'},clock);
 const receipt=engine.sampleLessonReceipt(state,clock);assert.equal(receipt.band,null);assert.equal(receipt.mastery,'not-assessed');assert.equal(receipt.freshReviewAvailable,false);
 const saved=progress.serializeSampleProgress(state,clock);
 for(const changed of [mutate(JSON.parse(saved),v=>v.version=2),mutate(JSON.parse(saved),v=>v.value.sessions['academic:'+lesson.id].drafts[lesson.guided.id].answers.foreign='raw')]){const raw=JSON.stringify(changed),blocked=progress.readSampleProgress(raw,clock);assert.equal(blocked.status,'blocked');assert.equal(blocked.raw,raw)}
});
const unregisteredProgress=await loadTypeScript(file('app/ielts-sample-progress.ts'));
const futureRecord=progress.serializeSampleProgress(state,clock),unregistered=unregisteredProgress.readSampleProgress(futureRecord,clock);
if(!catalog.sampleLessonsFor('academic').some(l=>l.id===lesson.id)){assert.equal(unregistered.status,'blocked');assert.equal(unregistered.raw,futureRecord)}
group('6. Academic-only content and dynamic capacity do not mutate production registration or manufacture assessment',()=>{
 assert.deepEqual(batch.tableCompletionLessonsFor('general-training'),[]);assert.throws(()=>batch.tableCompletionLessonsFor(null));assert.throws(()=>batch.tableCompletionLessonsFor('future'));
 assert.equal(batch.tableCompletionResponseContract.band,null);assert.equal(batch.tableCompletionCoverage[0].integrationStatus,'pending-owner-integration');assert.equal(batch.tableCompletionCoverage[0].contentStatus,'authored-not-expert-reviewed');
 assert.deepEqual(['academic','general-training'].map(v=>catalog.sampleLessonsFor(v).length),catalogCounts);assert.equal(batch.tableCompletionStimulusFor('foreign'),undefined);
 for(const source of batch.tableCompletionSources)assert.equal(source.verification,'direct-open');
});
assert.equal(await readFile(file('ielts-blueprint/sample-sequence.ts'),'utf8'),sourceBefore);
console.log(`IELTS table: ${groups} groups passed; 6 original materials / 18 authored cells; ${roundTrips} real parser round trips with in-memory registration. Reading audio is not applicable; production integration, real 24h and expert calibration remain unverified.`);
