import assert from 'node:assert/strict';
import {mkdtemp, readdir, readFile, rm} from 'node:fs/promises';
import {fileURLToPath, pathToFileURL} from 'node:url';
import path from 'node:path';
import os from 'node:os';

const root=fileURLToPath(new URL('../',import.meta.url));
const ts=(await import(pathToFileURL(path.join(root,'node_modules/typescript/lib/typescript.js')))).default;
const config=ts.readConfigFile(path.join(root,'tsconfig.json'),ts.sys.readFile);
assert.equal(config.error,undefined);
const parsed=ts.parseJsonConfigFileContent(config.config,ts.sys,root);
assert.equal(parsed.errors.length,0);
const program=ts.createProgram({rootNames:[path.join(root,'ielts-blueprint/curriculum/gt-table-options.ts')],
 // The finite content graph has no worker globals; do not require deployment-only ambient types.
 options:{...parsed.options,types:[],noEmit:true,incremental:false}});
const diagnostics=ts.getPreEmitDiagnostics(program);
assert.equal(diagnostics.length,0,ts.formatDiagnosticsWithColorAndContext(diagnostics,{
 getCanonicalFileName:name=>name,getCurrentDirectory:()=>root,getNewLine:()=> '\n'}));
const packages=path.join(root,'node_modules/.pnpm');
const builder=(await readdir(packages)).filter(n=>/^esbuild@\d+\.\d+\.\d+$/.test(n))
 .sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}))[0];
assert.ok(builder,'Use existing locked dependencies.');
const {build}=await import(pathToFileURL(path.join(packages,builder,'node_modules/esbuild/lib/main.js')));
const temp=await mkdtemp(path.join(os.tmpdir(),'ielts-gt-table-options-'));
const authored=JSON.parse(await readFile(path.join(root,'ielts-blueprint/curriculum/gt-table-options/authored.json'),'utf8'));
const copy=v=>JSON.parse(JSON.stringify(v));
let groups=0;
const check=(name,run)=>{run();groups++;console.log('PASS '+name);};
// Finite author/reviewer key: concrete conditions were matched to their source actions.
const keys={model:['B','F','A'],guided:['B','D','F'],independent:['F','C','A'],
 timed:['A','B','D'],'review-a':['C','A','F'],'review-b':['C','E','F']};
const evidence={
 'model-1':'If your membership card is cracked, hand it to the staff member at the welcome desk.',
 'model-2':'If a printing job is held because money is owed, pay the balance at the self-service terminal beside the printer.',
 'model-3':"Members who need a computer for Saturday's digital workshop should choose a workstation on our website before Friday; places cannot be reserved at the door.",
 'guided-1':'If chilled food arrives without a purchase number, do not accept it: the driver must take it away.',
 'guided-2':'A box with a crushed corner may be accepted if the seal is intact; send an image of the damage to your supervisor by text.',
 'guided-3':'Empty delivery trolleys blocking the hallway belong in the loading area.',
 'independent-1':"New swimmers wanting an evening beginners' class should select an appropriate session through the pool website; the cashier handles payments, not class reservations.",
 'independent-2':'If you cannot use a single-entry ticket bought at the pool, give it to the duty manager before its printed date to receive a credit.',
 'independent-3':'For a payment that has appeared twice on your account, bring your original paper receipt to the cashier.',
 'timed-1':'Before claiming train fares, upload a clear photograph of each ticket to the expenses portal; the accounts team cannot process claims from bank statements alone.',
 'timed-2':'If a hotel room has the wrong bed type, speak directly to the hotel rather than the studio travel desk.',
 'timed-3':'Send requests for a travel advance to payroll at least five working days before departure.',
 'review-a-1':'If an appliance no longer starts, photograph its model label and attach the image to your booking request so we can allocate a suitable volunteer.',
 'review-a-2':'Owners of a torn fabric bag should bring a matching piece of cloth; our sewing team supplies thread.',
 'review-a-3':'Large items which cannot fit through our entrance should remain at home; request a video consultation instead.',
 'review-b-1':'If a locker key is missing, show your membership details to the desk team, who will issue a spare.',
 'review-b-2':'Members who require a quiet room for a call should select an empty booth on the booking screen beside reception.',
 'review-b-3':'Members leaving after eight in the evening must tap their access card at the exit reader so the system records their departure.',
};
try {
 const output=path.join(temp,'model.mjs');
 await build({stdin:{contents:[
  "export * as b from './ielts-blueprint/curriculum/gt-table-options';",
  "export * as c from './ielts-blueprint/sample-sequence';",
  "export * as r from './ielts-blueprint/curriculum/registered';",
  "export * as m from './ielts-blueprint/sample-sequence-model';",
  "export * as p from './app/ielts-sample-progress';",
  "export * as h from './app/ielts-gt-table-context';",
  "export * as t from './ielts-blueprint/structured-table/projection';",
 ].join('\n'),resolveDir:root,loader:'ts'},bundle:true,platform:'node',format:'esm',
 target:'node22',outfile:output,logLevel:'silent'});
 const {b,c,r,m,p,h,t}=await import(pathToFileURL(output));
 const lesson=b.gtTableOptionsLesson,materials=c.sampleMaterials(lesson);
 check('six original GT texts: 18 frozen letters, exact evidence and 108 targeted feedback entries',()=>{
  assert.equal(authored.rights,'original-fictional');
  assert.equal(authored.officialSubtypeVerified,false);
  assert.equal(authored.label,'GT场景原创专项练习');
  assert.equal(authored.scoring.bandClaims,false);
  assert.equal(authored.timing.seconds,180);
  assert.equal(authored.sections.length,6);assert.equal(materials.length,6);
  assert.equal(new Set(materials.map(x=>x.context)).size,6);
  let count=0,feedbackCount=0;
  for(const section of authored.sections){
   const material=materials.find(x=>x.id==='gt-table-'+section.id);
   assert.ok(material);assert.equal(material.context,section.sourceText);
   const words=section.sourceText.trim().split(/\s+/).length;
   assert.ok(words>=90&&words<=140);assert.equal(words,section.wordCount);
   assert.equal(section.rows.length,3);
   assert.deepEqual(section.options.map(o=>o.letter),['A','B','C','D','E','F']);
   assert.equal(new Set(section.rows.map(q=>q.answer)).size,3);
   assert.ok(section.instruction.includes('Use each letter no more than once in this exercise.'));
   for(const option of section.options){
    assert.ok(option.text.trim());assert.ok(!section.sourceText.toLowerCase().includes(option.text.toLowerCase()),
     section.id+' '+option.letter+' must paraphrase, not copy a source gap');
   }
   section.rows.forEach((row,i)=>{
    const q=material.questions[i];assert.equal(q.id,section.id+'-'+(i+1));
    assert.equal(row.answer,keys[section.id][i]);assert.deepEqual(q.accepted,[row.answer]);
    assert.equal(row.evidence,evidence[q.id]);assert.ok(section.sourceText.includes(row.evidence));
    assert.equal(section.sourceText.slice(row.evidenceStart,row.evidenceEnd),row.evidence);
    assert.ok(q.why.includes(row.evidence));assert.ok(/[\u3400-\u9fff]/.test(row.explanation));
    assert.ok(row.hint.trim());assert.ok(!row.hint.includes('答案是'));
    assert.deepEqual(Object.keys(row.feedback),['A','B','C','D','E','F']);
    assert.equal(new Set(Object.values(row.feedback)).size,6);
    for(const option of section.options){
     const feedback=row.feedback[option.letter];assert.ok(/[\u3400-\u9fff]/.test(feedback));
     assert.equal(b.gtTableOptionFeedback(material.id,q.id,' '+option.letter.toLowerCase()+' '),feedback);
     if(option.letter===row.answer){assert.ok(feedback.startsWith('正确。'));assert.ok(feedback.includes(row.evidence));}
     else {assert.ok(feedback.startsWith('不正确。'));assert.ok(feedback.includes(option.text));
      assert.ok(feedback.includes('本行处理的是'));assert.ok(feedback.includes('原文依据'));}
     feedbackCount++;
    }
    for(const invalid of ['','AA','G','A B','the answer A'])
     assert.ok(b.gtTableOptionFeedback(material.id,q.id,invalid).includes('一个字母'));
    count++;
   });
  }
  assert.equal(count,18);assert.equal(feedbackCount,108);
 });
 check('real table projection: service row headers, two data columns and three owned blanks',()=>{
  for(const material of materials){
   const stimulus=b.gtTableOptionsStimulusFor(material.id);
   const before=JSON.stringify(stimulus);
   assert.equal(stimulus.table.rowHeaderLabel,'Service');
   assert.deepEqual(stimulus.table.columns.map(x=>x.label),['Condition','Action']);
   const result=t.projectTableStimulus(stimulus.table,{rowCount:3,columnCount:2,blankCount:3,
    questions:material.questions.map((q,i)=>({id:q.id,questionNumber:i+1}))});
   assert.equal(result.ok,true);assert.equal(result.projection.coordinates.length,6);
   assert.deepEqual(result.projection.blanks.map(x=>x.cell.questionId),material.questions.map(x=>x.id));
   assert.ok(result.projection.blanks.every(x=>x.columnId==='action'));
   assert.equal(JSON.stringify(stimulus),before);
  }
 });
 check('real registration is GT only, appears once and binds all seven canonical stages',()=>{
  assert.deepEqual(b.gtTableOptionsLessonsFor('academic'),[]);
  for(const catalog of [r.registeredCurriculumLessonsFor,c.sampleLessonsFor]){
   assert.equal(catalog('general-training').filter(x=>x.id===lesson.id).length,1);
   assert.equal(catalog('academic').filter(x=>x.id===lesson.id).length,0);
  }
  assert.equal(r.registeredCurriculumBatches.filter(x=>x.id==='gt-table-options').length,1);
  const binding=b.gtTableOptionsCoverage[0];
  assert.deepEqual(binding.variants,['general-training']);assert.deepEqual(binding.requirementIds,['R12-GT']);
  assert.deepEqual(Object.keys(binding.stages),['explain','model','guided','independent','timed','feedback','review']);
 });
 let clock=Date.UTC(2026,9,3,12),state=m.emptySampleState(),roundTrips=0,contextRaw;
 const stages=[];
 const stage=()=>m.sampleSession(state).stage;
 const act=(action,at=clock+10)=>{
  clock=at;const result=m.transitionSample(state,action,clock);
  assert.equal(result.issue,undefined,action.type+': '+result.issue);state=result.state;
  const raw=p.serializeSampleProgress(state,clock),read=p.readSampleProgress(raw,clock);
  assert.equal(read.status,'ready',read.reason);assert.equal(read.raw,raw);
  assert.deepEqual(copy(read.value),copy(state));state=read.value;roundTrips++;
  if(stages.at(-1)!==stage())stages.push(stage());
 };
 const deny=action=>{
  const before=JSON.stringify(state),result=m.transitionSample(state,action,clock+1);
  assert.ok(result.issue);assert.equal(result.state,state);assert.equal(JSON.stringify(state),before);
 };
 const answer=(material,wrong=false)=>{
  for(const [i,q] of material.questions.entries()){
   const raw=wrong&&i===0?'  '+(['A','B','C','D','E','F'].find(x=>x!==q.accepted[0]))+'  ':'  '+q.accepted[0].toLowerCase()+'  ';
   act({type:'answer',questionId:q.id,value:raw});
  }
 };
 const capture=()=>{
  const result=h.extendGTTableContext(state,contextRaw,clock);
  assert.equal(result.ok,true,result.reason);contextRaw=result.raw;return result.value;
 };
 check('actual engine preserves wrong letters and raw originals, then corrects the guided gate independently',()=>{
  act({type:'select-variant',variant:'general-training'});act({type:'open-lesson',lessonId:lesson.id});
  assert.equal(stage(),'explain');act({type:'next'});capture();deny({type:'submit'});
  act({type:'next'});capture();answer(lesson.guided,true);act({type:'submit'});
  const original=copy(m.sampleSession(state).attempts.at(-1));
  assert.equal(original.correct,2);assert.equal(original.matched,false);
  assert.ok(Object.values(original.answers).every(x=>x.startsWith('  ')&&x.endsWith('  ')));
  deny({type:'next'});answer(lesson.guided);act({type:'submit'});
  assert.deepEqual(copy(m.sampleSession(state).attempts[0]),original);
  assert.equal(m.sampleSession(state).attempts.at(-1).correct,3);
  act({type:'next'});capture();act({type:'confirm-unseen',value:true});
  answer(lesson.independent,true);act({type:'submit'});
  assert.equal(m.sampleSession(state).attempts.at(-1).correct,2);
  assert.equal(m.sampleSession(state).attempts.at(-1).fresh,true);
 });
 check('timed article/table/options stay out of public snapshots until start; raw errors survive separate correction',()=>{
  act({type:'next'});const unstarted=capture();
  assert.equal(stage(),'timed');assert.equal(m.activeSampleDraft(state).startedAt,0);
  assert.ok(!Object.hasOwn(unstarted.materials,lesson.timed.id));
  assert.ok(!contextRaw.includes(lesson.timed.context));
  for(const review of lesson.reviews)assert.ok(!Object.hasOwn(unstarted.materials,review.id));
  deny({type:'answer',questionId:lesson.timed.questions[0].id,value:'A'});deny({type:'submit'});
  act({type:'start-timed'});const started=capture();
  assert.equal(started.materials[lesson.timed.id].context,lesson.timed.context);
  assert.deepEqual(copy(started.materials[lesson.timed.id].options),copy(b.gtTableOptionsStimulusFor(lesson.timed.id).options));
  act({type:'confirm-unseen',value:true});answer(lesson.timed,true);
  act({type:'submit'},m.activeSampleDraft(state).startedAt+180001);
  const timedOriginal=copy(m.sampleSession(state).attempts.at(-1));
  const independentOriginal=copy(m.sampleSession(state).attempts.find(x=>x.stage==='independent'));
  assert.equal(timedOriginal.correct,2);assert.equal(timedOriginal.elapsedMs,180001);
  assert.equal(timedOriginal.withinTrainingTime,false);
  act({type:'next'});deny({type:'save-correction'});
  act({type:'correction-note',value:'按条件核对原文后分别改正字母，首答保留。'});
  for(const q of lesson.timed.questions)act({type:'correction-answer',questionId:q.id,value:'A'});
  deny({type:'save-correction'});
  for(const q of lesson.timed.questions)act({type:'correction-answer',questionId:q.id,value:' '+q.accepted[0].toLowerCase()+' '});
  act({type:'save-correction'});
  assert.deepEqual(copy(m.sampleSession(state).attempts.at(-1)),timedOriginal);
  assert.deepEqual(copy(m.sampleSession(state).attempts.find(x=>x.stage==='independent')),independentOriginal);
  assert.equal(stage(),'review');assert.equal(m.activeSampleMaterial(state),undefined);
 });
 check('explicit simulated clock gates two fresh review texts; receipts never assert Band or mastery',()=>{
  deny({type:'start-review'});
  for(const review of lesson.reviews){
   const due=m.sampleReviewDueAt(m.sampleSession(state));
   const blocked=m.transitionSample(state,{type:'start-review'},due-1);
   assert.ok(blocked.issue);assert.equal(blocked.state,state);
   act({type:'start-review'},due);
   assert.equal(m.activeSampleMaterial(state).id,review.id);capture();
   act({type:'confirm-unseen',value:true});answer(review);act({type:'submit'});
   const latest=m.sampleSession(state).attempts.at(-1);
   assert.equal(latest.fresh,true);assert.equal(latest.correct,3);
   const receipt=m.sampleLessonReceipt(state,clock);
   assert.equal(receipt.band,null);assert.equal(receipt.mastery,'not-assessed');
   assert.equal(receipt.delayed,'local-target-observed');
  }
  clock=m.sampleReviewDueAt(m.sampleSession(state));deny({type:'start-review'});
  assert.deepEqual(stages,['explain','model','guided','independent','timed','feedback','review']);
 });
 console.log(JSON.stringify({groups,questions:18,feedbackEntries:108,canonicalRoundTrips:roundTrips,
  actualRegistration:true,simulatedClock:true,natural24HourEvidence:false,browserQa:false,band:null}));
} finally {await rm(temp,{recursive:true,force:true});}
