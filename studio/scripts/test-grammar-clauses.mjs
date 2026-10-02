import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {stripTypeScriptTypes} from 'node:module';
import ts from 'typescript';

const root=new URL('../app/',import.meta.url);
const readJSON=async name=>JSON.parse(await readFile(new URL(name,root),'utf8'));
const canonical=value=>Array.isArray(value)?'['+value.map(canonical).join(',')+']':value&&typeof value==='object'?'{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+canonical(value[key])).join(',')+'}':JSON.stringify(value);
const digest=value=>createHash('sha256').update(canonical(value)).digest('hex');
const sorted=values=>[...values].sort();
const nonempty=value=>typeof value==='string'&&value.trim().length>0;
const integrated=process.argv.includes('--integrated');
// Fixed semantic fingerprints from 75b1cd7; tests need no .git checkout or
// generated lesson material. Object formatting is irrelevant, array order is not.
const baselineFiles={
 'core-units.json':'7f326dfdf20ad78ab43a0d31f9dbab776d0a4e2fbc142d869eca35d6167c9a03',
 'extension-units.json':'1c685937ddf2a3f3c2d926f8c6f0136e7beaac89c7ec8bba31cd1685341a9e41',
 'depth-b1/complements.json':'c45e3b123ed1d786d8d687dd03019f01bdf16e9405bc5e9a7c6a2c204ba27835',
 'depth-b1/negative.json':'c0b6045df82e3b41f75b5bf455e2c7d679d6071abe9e9d33a0d92393f7ad402e',
 'depth-b1/passive.json':'3a48c52d412aad07d359d2e564c54e984246493578ffd9437916e293b403246f',
 'depth-b1/reported.json':'b3fa135eea7d0430365ee690b6ce345b453a7348098eeb2215e314e7ce1f5b73',
 'depth-b1/timeline.json':'8e838496362b5d2715450de055cbe7785a3118e369e3406917a8a8bac55f52d3',
};
const originals=[];
for(const [file,hash] of Object.entries(baselineFiles)){
 const data=await readJSON('data/grammar-curriculum/'+file);
 assert.equal(digest(data),hash,`${file}: delivered content must remain deeply equal to 75b1cd7`);
 originals.push(...(Array.isArray(data)?data:[data]));
}
originals.sort((a,b)=>a.order-b.order);
assert.equal(originals.length,13);
assert.equal(new Set(originals.flatMap(unit=>unit.guideIds)).size,45);
assert.equal(originals.flatMap(unit=>unit.practices).length,78);
const plan=await readJSON('data/grammar-curriculum/coverage-plan.json');
if(!integrated)assert.equal(digest(plan),'3ad2c5a71409eb26c985dc09798f4dd4b458db50835918f03c396a8e41cfa5eb','The registered coverage ledger remains unchanged');
console.log(`Clauses baseline: 13 delivered units / 45 concepts / 78 practices remain deeply equal to 75b1cd7${integrated?'':'; existing coverage ledger is unchanged'}.`);
if(process.argv.includes('--baseline-only')){console.log('BASELINE ONLY: the default run also requires all five delta units, 19 sidecars, the isolated answer adapter and UI events.');process.exit(0)}

// A separate progress module URL applies the pending answer-policy interface
// in memory. All other production modules, including their mutable unit registry,
// remain shared. This does not register or alter any source file on disk.
const answerBody='export function grammarAnswerMatches(practice:GrammarPractice,value:string){return [practice.answer,...(practice.accepted||[])].some(answer=>answerMatches(value,answer))}';
const cache=new Map();
async function moduleURL(name,isolated=false){
 const key=name+(isolated?'#clauses':'');if(cache.has(key))return cache.get(key);
 let source=await readFile(new URL(name,root),'utf8');
 if(name==='progress-file.ts')source=source.replace("import {State, validateState} from './model';","import {validateState} from './model';");
 if(isolated){
  assert.equal(name,'grammar-curriculum-progress.ts');
  assert.equal(source.split(answerBody).length,2,'The isolated adapter replaces exactly the reviewed one-line interface');
  source="import {grammarClauseAnswerMatches} from './grammar-clause-answer';\n"+source.replace(answerBody,'export function grammarAnswerMatches(practice:GrammarPractice,value:string){return grammarClauseAnswerMatches(practice,value)}');
 }
 for(const match of [...source.matchAll(/^import (?!type )(.+?) from '(\.\/.+?)';/gm)]){
  const dep=match[2].slice(2);
  if(dep.endsWith('.json'))source=source.replace(match[0],`const ${match[1]}=${await readFile(new URL(dep,root),'utf8')};`);
  else source=source.replaceAll("'"+match[2]+"'",JSON.stringify(await moduleURL(dep+'.ts')));
 }
 const url='data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64');cache.set(key,url);return url;
}
const model=await import(await moduleURL('model.ts'));
const textbook=await import(await moduleURL('textbook-grammar.ts'));
const curriculum=await import(await moduleURL('grammar-curriculum.ts'));
if(integrated){
 assert.equal(curriculum.grammarUnits.length,28,'INTEGRATION GATE: the current main curriculum must register all 28 units');
 assert.equal(new Set(curriculum.grammarUnits.flatMap(unit=>unit.guideIds)).size,97,'INTEGRATION GATE: the current main curriculum must cover all 97 existing guides');
 assert.equal(curriculum.grammarUnits.flatMap(unit=>unit.practices).length,168,'INTEGRATION GATE: the current main curriculum must contain 168 checks');
}
const baselineProgress=await import(await moduleURL('grammar-curriculum-progress.ts'));
const progress=await import(await moduleURL('grammar-curriculum-progress.ts',!integrated));
const answerPolicy=await import(await moduleURL('grammar-clause-answer.ts'));
const clauses=await import(await moduleURL('grammar-curriculum-clauses.ts'));
const files=await import(await moduleURL('progress-file.ts'));
const learning=await import(await moduleURL('learning-plan.ts'));
const additions=clauses.grammarClauseUnits;
const manifest=await readJSON('data/grammar-curriculum/depth-clauses/batch-manifest.json');
const expectedIds=['past-background','modal-evidence','relative-reference','hypothetical-condition','information-focus'];
const expectedGuides=['past-be','past-continuous','past-perfect','may','deduction-now','deduction-past','past-ability','could-have','relative','relative-omission','non-defining','condition-unreal','condition-past','as-if','formal-it','that-clauses','likely','inversion','reporting-passive'];
if(integrated)assert.deepEqual(curriculum.grammarUnits.filter(unit=>originals.some(old=>old.id===unit.id)),originals,'Integration preserves all 13 previously delivered units');
else assert.deepEqual(curriculum.grammarUnits,originals,'The production entry exports only the previously delivered 13 units');
assert.deepEqual(additions.map(unit=>unit.id),expectedIds);
assert.deepEqual(additions.map(unit=>unit.order),[14,15,16,17,18]);
assert.equal(new Set(additions.map(unit=>unit.id)).size,5);
assert.deepEqual(sorted(additions.flatMap(unit=>unit.guideIds)),sorted(expectedGuides));
assert.equal(new Set(additions.flatMap(unit=>unit.guideIds)).size,19);
assert.equal(additions.flatMap(unit=>unit.practices).length,30);
assert.deepEqual(manifest.counts,{
 newUnits:5,newGuides:19,newPractices:30,
 newForms:additions.flatMap(unit=>unit.forms).length,newContrasts:additions.flatMap(unit=>unit.contrasts).length,newMistakes:additions.flatMap(unit=>unit.mistakes).length,
 localCombinedUnits:18,localCombinedGuides:64,localCombinedPractices:108,remainingGuides:33,
},'All manifest counts reflect actual content');
assert(additions.every(unit=>!originals.some(old=>old.id===unit.id||unit.guideIds.some(id=>old.guideIds.includes(id)))));
assert.equal(manifest.schemaVersion,1);assert.equal(manifest.id,'clauses-20261001');
assert.equal(manifest.baselineCommit,'75b1cd7dbc384d56378e2d2795294410620dbd76');
assert.equal(manifest.registration,'pending-mainline-integration','Local implementation is not main-course registration or publication');
assert.deepEqual(manifest.unitIds,expectedIds);assert.deepEqual(sorted(manifest.guideIds),sorted(expectedGuides));
assert.equal(manifest.concepts.length,19);assert.equal(new Set(manifest.concepts.map(concept=>concept.guideId)).size,19);
assert.deepEqual(sorted(manifest.concepts.map(concept=>concept.guideId)),sorted(expectedGuides));
assert(manifest.concepts.every(concept=>concept.status==='implemented'),'All 19 delta concepts are implemented locally, not merely empty planned entries');
assert.deepEqual(manifest.groups,plan.groups.filter(group=>expectedIds.includes(group.id)),'The pending delta preserves the exact planned grouping and scope');
assert.equal(plan.concepts.filter(concept=>concept.status==='planned').length,integrated?0:52,integrated?'The current integrated ledger has no uncovered existing concepts':'The original plan does not silently claim delta integration');
assert(plan.concepts.filter(concept=>expectedGuides.includes(concept.guideId)).every(concept=>concept.status===(integrated?'implemented':'planned')));
const evidence=[];
for(const unit of additions){
 const disk=await readJSON(`data/grammar-curriculum/depth-clauses/${unit.id}.json`);
 assert(!Array.isArray(disk));assert.deepEqual(disk,unit,'The isolated catalog loads the actual single authored unit');
 const proof=await readJSON(`data/grammar-curriculum/depth-clauses/${unit.id}.coverage.json`);
 assert(Array.isArray(proof));assert.deepEqual(sorted(proof.map(row=>row.guideId)),sorted(unit.guideIds));
 assert(proof.every(row=>row.unitId===unit.id));evidence.push(...proof);
 const group=manifest.groups.find(group=>group.id===unit.id);assert(group);
 for(const field of ['stageId','prerequisites','purposeIds','guideIds'])assert.deepEqual(unit[field],group[field],`${unit.id}: exact planned ${field}`);
}
assert.equal(evidence.length,19);assert.equal(new Set(evidence.map(row=>row.guideId)).size,19);
const sourceEntries=id=>textbook.grammarEntries.flatMap(entry=>textbook.grammarGuidesFor(entry).flatMap((guide,position)=>guide.id===id?[{entryId:entry.id,book:entry.book,lesson:entry.lesson,lastLesson:entry.lastLesson,position}]:[]));
const sortSources=rows=>[...rows].sort((a,b)=>a.entryId.localeCompare(b.entryId)||a.position-b.position);
const stageFor=new Map(curriculum.grammarStages.flatMap(stage=>stage.guideIds.map(id=>[id,stage.id])));
assert.deepEqual(curriculum.grammarStages.map(stage=>stage.id),['foundation','time','meaning','extension']);
assert.equal(curriculum.grammarStages.flatMap(stage=>stage.guideIds).length,97);assert.equal(stageFor.size,97);
assert.deepEqual(sorted(stageFor.keys()),sorted(Object.keys(textbook.grammarGuides)));
for(const concept of manifest.concepts){
 const old=plan.concepts.find(row=>row.guideId===concept.guideId),proof=evidence.find(row=>row.guideId===concept.guideId);
 assert(old&&proof);assert.equal(concept.stageId,stageFor.get(concept.guideId));
 for(const field of ['guideId','title','stageId','batchId','unitId','prerequisites','purposeIds','comparison','sourceEntries'])assert.deepEqual(concept[field],old[field],`${concept.guideId}: preserves exact source ledger ${field}`);
 assert.deepEqual(sortSources(concept.sourceEntries),sortSources(sourceEntries(concept.guideId)),`${concept.guideId}: all real sources and secondary-guide positions`);
 assert.equal(concept.scope,proof.scope);assert.equal(concept.remaining,proof.remaining);assert(nonempty(proof.scope)&&nonempty(proof.remaining));
 const unit=additions.find(unit=>unit.id===proof.unitId);
 for(const [field,collection] of [['formIndices',unit.forms],['contrastIndices',unit.contrasts],['mistakeIndices',unit.mistakes]]){
  assert(Array.isArray(proof[field])&&proof[field].length>0,`${concept.guideId}: nonempty ${field}`);
  assert.equal(new Set(proof[field]).size,proof[field].length);
  for(const index of proof[field]){
   assert(Number.isInteger(index)&&index>=0&&index<collection.length,`${concept.guideId}: valid ${field} index`);
   assert(Object.values(collection[index]).every(value=>typeof value==='object'||nonempty(value)),`${concept.guideId}: evidence points to real teaching content`);
  }
 }
 assert(Array.isArray(proof.practiceIds)&&proof.practiceIds.length>0);assert.equal(new Set(proof.practiceIds).size,proof.practiceIds.length);
 for(const id of proof.practiceIds)assert(unit.practices.some(question=>question.id===id),`${concept.guideId}: real referenced practice ${id}`);
}

const productionSource=await readFile(new URL('grammar-curriculum-progress.ts',root),'utf8');
const registrySnapshot=canonical(curriculum.grammarUnits);
if(!integrated)curriculum.grammarUnits.push(...additions);
try{
 const units=curriculum.grammarUnits,nodeFor=new Map(units.map(unit=>[unit.id,unit])),visiting=new Set(),visited=new Set();
 assert.equal(curriculum.grammarCurriculumVersion,1);assert.equal(progress.emptyGrammarProgress().version,1);
 assert.deepEqual(curriculum.grammarCoverage(),{textbookEntries:276,existingGuides:97,completeUnits:integrated?28:18,deepenedGuides:integrated?97:64});
 const unregistered=Object.keys(textbook.grammarGuides).filter(id=>!units.some(unit=>unit.guideIds.includes(id)));
 assert.equal(unregistered.length,integrated?0:33,'Later registered content reconciles the historical remainder');
 // Keep checking the clauses manifest as its original delivery snapshot.
 const clauseSnapshot=[...originals,...additions];
 const remainder=Object.keys(textbook.grammarGuides).filter(id=>!clauseSnapshot.some(unit=>unit.guideIds.includes(id)));
 assert.equal(remainder.length,33);
 const laterRows=plan.concepts.filter(concept=>remainder.includes(concept.guideId));
 assert.deepEqual(sorted(remainder),sorted(laterRows.map(concept=>concept.guideId)));
 assert(laterRows.every(concept=>concept.status===(integrated?'implemented':'planned')));
 assert.equal(manifest.remainingOwnership.guideCount,33);assert.deepEqual(sorted(manifest.remainingOwnership.guideIds),sorted(remainder));
 assert.equal(manifest.remainingOwnership.status,'planned-not-delivered');assert(nonempty(manifest.remainingOwnership.owner));
 const remainingGroups=plan.groups.filter(group=>group.guideIds.some(id=>remainder.includes(id)));
 assert.equal(remainingGroups.length,10);assert.deepEqual(sorted(manifest.remainingOwnership.groupIds),sorted(remainingGroups.map(group=>group.id)));
 assert.deepEqual(sorted(remainingGroups.flatMap(group=>group.guideIds)),sorted(remainder),'Remaining ownership has no duplicate or omitted concept');
 function visit(unit){
  assert(!visiting.has(unit.id),`Prerequisite cycle at ${unit.id}`);if(visited.has(unit.id))return;
  visiting.add(unit.id);
  for(const id of unit.prerequisites){assert(nodeFor.has(id));assert(nodeFor.get(id).order<unit.order,`${unit.id}: ${id} really comes first`);visit(nodeFor.get(id))}
  visiting.delete(unit.id);visited.add(unit.id);
 }
 for(const unit of units)visit(unit);
 const demonstrated=unit=>[...unit.contrasts.flatMap(pair=>[pair.a.en,pair.b.en]),...unit.mistakes.map(mistake=>mistake.correct)];
 const oldSentences=originals.flatMap(unit=>[...demonstrated(unit),...unit.practices.flatMap(q=>[q.answer,...(q.accepted||[])])]);
 const questionIds=new Set();
 for(const unit of additions){
  assert.deepEqual(curriculum.grammarUnitFor(unit.id),unit);assert.deepEqual(curriculum.grammarPrerequisites(unit).map(previous=>previous.id),unit.prerequisites);
  for(const field of ['id','title','goal'])assert(nonempty(unit[field]));
  assert(unit.explanation.length>=2&&unit.explanation.every(nonempty));assert(unit.forms.length&&unit.contrasts.length&&unit.mistakes.length);
  for(const [rows,key] of [[unit.forms,'form'],[unit.contrasts,'label'],[unit.mistakes,'wrong']])assert.equal(new Set(rows.map(row=>row[key])).size,rows.length,`${unit.id}: unique React key ${key}`);
  for(const form of unit.forms)assert([form.form,form.meaning,form.useWhen].every(nonempty));
  for(const pair of unit.contrasts)assert([pair.label,pair.a.en,pair.a.zh,pair.b.en,pair.b.zh,pair.why].every(nonempty));
  for(const mistake of unit.mistakes)assert([mistake.wrong,mistake.correct,mistake.why].every(nonempty)&&mistake.wrong!==mistake.correct);
  assert(nonempty(unit.transfer.prompt)&&unit.transfer.criteria.length>=2&&unit.transfer.criteria.every(nonempty));
  for(const variant of [0,1]){
   const questions=progress.grammarRoundQuestions(unit,variant);
   assert.deepEqual(questions.map(q=>q.kind),['recognise','repair','produce']);
   for(const q of questions){
    assert(!questionIds.has(q.id));questionIds.add(q.id);
    for(const field of ['id','prompt','answer','explanation'])assert(nonempty(q[field]),`${q.id}: ${field}`);
    assert.equal(q.variant,variant);assert.equal(q.hints.length,2);assert(q.hints.every(nonempty));assert.notEqual(q.hints[0],q.hints[1]);
    assert(!q.hints.some(hint=>hint.includes(q.answer)),`${q.id}: progressive hints do not print the complete reference sentence`);
    assert(progress.grammarAnswerMatches(q,q.answer),`${q.id}: canonical self-match`);
    for(const answer of q.accepted||[])assert(nonempty(answer)&&progress.grammarAnswerMatches(q,answer),`${q.id}: accepted self-match`);
    assert(!progress.grammarAnswerMatches(q,'')&&!progress.grammarAnswerMatches(q,'This is an unrelated answer.'));
    if(q.kind==='recognise'){
     assert(q.options.length>=3);assert.equal(new Set(q.options).size,q.options.length);
     assert.equal(q.options.filter(option=>option===q.answer).length,1);assert.equal(q.options.filter(option=>progress.grammarAnswerMatches(q,option)).length,1);
    }else assert.equal(q.options,undefined);
    if(q.kind==='produce'){
     for(const example of [...demonstrated(unit),...oldSentences])assert(!progress.grammarAnswerMatches(q,example),`${q.id}: output uses a new situation, not an already displayed/reference sentence`);
     for(const answer of [q.answer,...(q.accepted||[])])for(const theory of unit.explanation)assert(!model.normal(theory).includes(model.normal(answer)),`${q.id}: no verbatim theory answer`);
    }
   }
  }
  for(const kind of ['recognise','repair','produce']){
   const [a,b]=[0,1].map(variant=>unit.practices.find(q=>q.variant===variant&&q.kind===kind));assert.notEqual(a.prompt,b.prompt);assert(!progress.grammarAnswerMatches(a,b.answer));
  }
 }
 assert.equal(questionIds.size,30);
 const linksFor=unit=>textbook.grammarEntries.flatMap(entry=>{
  const guideIds=textbook.grammarGuidesFor(entry).map(guide=>guide.id).filter(id=>unit.guideIds.includes(id));
  return guideIds.length?[{book:entry.book,lesson:entry.lesson,lastLesson:entry.lastLesson,guideIds}]:[];
 });
 let exactSearches=0;
 for(const [book,count] of Object.entries(model.bookCounts))for(let lesson=1;lesson<=count;lesson++){
  const expected=units.filter(unit=>linksFor(unit).some(link=>link.book===book&&lesson>=link.lesson&&lesson<=link.lastLesson));
  assert.deepEqual(sorted(curriculum.searchGrammarUnits({book,query:`${book} 第${lesson}课`}).map(unit=>unit.id)),sorted(expected.map(unit=>unit.id)));exactSearches++;
 }
 for(const unit of additions){
  assert.deepEqual(curriculum.lessonsForGrammarUnit(unit),linksFor(unit));
  assert(curriculum.searchGrammarUnits({query:unit.title,stageId:unit.stageId,purposeId:unit.purposeIds[0]}).some(found=>found.id===unit.id));
  assert.equal(curriculum.searchGrammarUnits({query:unit.title+' definitely-unmapped-token'}).length,0);
  const differentStage=curriculum.grammarStages.find(stage=>stage.id!==unit.stageId).id;
  assert(!curriculum.searchGrammarUnits({query:unit.title,stageId:differentStage}).some(found=>found.id===unit.id));
  for(const guideId of unit.guideIds){
   assert(curriculum.searchGrammarConcepts().find(concept=>concept.id===guideId)?.deepened);
   assert.deepEqual(curriculum.lessonsForGrammarGuide(guideId).map(entry=>entry.id),sourceEntries(guideId).map(entry=>entry.entryId));
   for(const book of Object.keys(model.bookCounts)){
    const expected=linksFor(unit).find(link=>link.book===book&&link.guideIds.includes(guideId));assert.deepEqual(curriculum.grammarPracticeLink(unit,guideId,book),expected);
   }
  }
  assert.equal(curriculum.grammarPracticeLink(unit,'not-a-guide'),undefined);
 }
 assert.equal(curriculum.searchGrammarUnits({query:'NCE1 NCE2 1'}).length,0);assert.equal(curriculum.searchGrammarUnits({book:'NCE1',query:'NCE2 1'}).length,0);
 const secondary=manifest.concepts.flatMap(concept=>concept.sourceEntries.filter(source=>source.book==='NCE2'&&source.position>0).map(source=>({guideId:concept.guideId,...source})));
 const actualSecondary=expectedGuides.flatMap(guideId=>sourceEntries(guideId).filter(source=>source.book==='NCE2'&&source.position>0).map(source=>({guideId,...source})));
 assert(secondary.length>0);assert.deepEqual(secondary,actualSecondary);

 const now=Date.parse('2026-10-01T12:00:00Z'),day=24*60*60*1000;
 function complete(unit,record,at,{wrong=false,hint=false}={}){
  let next=progress.beginGrammarRound(record,unit);const questions=progress.grammarRoundQuestions(unit,next.round);
  if(hint)next=progress.showGrammarHint(next,unit,questions[0].id);
  for(const [index,q] of questions.entries()){next=progress.setGrammarAnswer(next,unit,q.id,wrong&&index===0?'Wrong answer.':q.answer);next=progress.checkGrammarResponse(next,unit,q.id)}
  return progress.finishGrammarRound(next,unit,at);
 }
 const previousMatch=(q,value)=>[q.answer,...(q.accepted||[])].some(answer=>learning.answerMatches(value,answer));
 for(const unit of originals)for(const q of unit.practices)for(const answer of [q.answer,...(q.accepted||[]),q.answer.replaceAll(',','')])assert.equal(progress.grammarAnswerMatches(q,answer),previousMatch(q,answer),`${q.id}: unchanged prior matcher behavior`);
 const expectedStrictIds=[0,1].flatMap(variant=>['recognise','repair','produce'].map(kind=>`relative-reference-v${variant}-${kind}`));
 assert.deepEqual(sorted(answerPolicy.grammarClauseCommaSensitiveIds),sorted(expectedStrictIds),'The reviewed policy targets all six new relative-clause tasks and no old exercise');
 const strictQuestions=additions.flatMap(unit=>unit.practices).filter(q=>answerPolicy.grammarClauseCommaSensitiveIds.includes(q.id));
 assert.equal(strictQuestions.length,6);
 assert.deepEqual(answerPolicy.grammarClauseSentenceSensitiveIds,['relative-reference-v1-produce']);
 assert.deepEqual(manifest.answerPolicy.commaSensitiveQuestionIds,answerPolicy.grammarClauseCommaSensitiveIds);
 assert.deepEqual(manifest.answerPolicy.sentenceSensitiveQuestionIds,answerPolicy.grammarClauseSentenceSensitiveIds);
 assert.equal(manifest.answerPolicy.integration,'required-before-mainline-registration');assert.equal(manifest.answerPolicy.existingQuestionBehaviour,'unchanged');
 for(const q of strictQuestions){
  // Mutate English punctuation only. Chinese option reasons keep their original
  // punctuation, which the older matcher does not normalize with NFKC.
  const unit=additions.find(unit=>unit.practices.includes(q)),ascii=q.answer,hasComma=ascii.includes(','),noComma=ascii.replaceAll(',',''),wrongBoundary=hasComma?noComma:ascii.replace(/ /,', '),moved=ascii.replace(',','').replace(/(\S+\s+\S+) /,'$1, ');
  assert.notEqual(wrongBoundary,q.answer);assert(previousMatch(q,wrongBoundary));assert(!progress.grammarAnswerMatches(q,wrongBoundary));assert(!progress.grammarAnswerMatches(q,moved),`${q.id}: extra or misplaced comma`);
  if(hasComma)assert.equal(moved.split(',').length,ascii.split(',').length,`${q.id}: moved-comma regression keeps the original count`);
  assert(!progress.grammarAnswerMatches(q,ascii+','),`${q.id}: extra punctuation segment`);
  assert(progress.grammarAnswerMatches(q,q.answer.replaceAll(',','，')));assert(progress.grammarAnswerMatches(q,q.answer.replaceAll(', ', ' ,  ')));
  assert(progress.grammarAnswerMatches(q,q.answer.replaceAll('.','。')),`${q.id}: Chinese period remains compatible`);
  const fullwidth=q.answer.replace(/[!-~]/g,char=>String.fromCharCode(char.charCodeAt(0)+0xfee0));assert(progress.grammarAnswerMatches(q,fullwidth),`${q.id}: NFKC normalization`);
  let record={...progress.emptyGrammarProgress(),round:q.variant,inRound:true};
  for(const task of progress.grammarRoundQuestions(unit,q.variant)){record=progress.setGrammarAnswer(record,unit,task.id,task.id===q.id?wrongBoundary:task.answer);record=progress.checkGrammarResponse(record,unit,task.id)}
  assert(!record.responses[q.id].matched);record=progress.readGrammarProgress(JSON.stringify({...record,responses:{...record.responses,[q.id]:{...record.responses[q.id],matched:true}}}),unit);
  assert(!record.responses[q.id].matched,'Reload recomputes the strict answer instead of trusting a persisted boolean');
  assert(!progress.finishGrammarRound(record,unit,now).attempts.at(-1).passed,'Wrong punctuation boundaries cannot earn a passed attempt');
 }
 const sentenceUnit=additions.find(unit=>unit.id==='relative-reference'),sentenceQuestion=sentenceUnit.practices.find(q=>q.id==='relative-reference-v1-produce');
 const sentenceErrors=[sentenceQuestion.answer.replace('. ',' '),sentenceQuestion.answer.replace('. ','; '),sentenceQuestion.answer.replace('.','').replace(/^(\S+) /,'$1. ')];
 for(const answer of sentenceErrors){
  assert.notEqual(answer,sentenceQuestion.answer);assert(previousMatch(sentenceQuestion,answer),'The regression reproduces a weakness of the original punctuation-insensitive matcher');
  assert(!progress.grammarAnswerMatches(sentenceQuestion,answer),'The explicit two-sentence task rejects a run-on, semicolon replacement or moved full stop');
  let record={...progress.emptyGrammarProgress(),round:1,inRound:true};
  for(const q of progress.grammarRoundQuestions(sentenceUnit,1)){record=progress.setGrammarAnswer(record,sentenceUnit,q.id,q===sentenceQuestion?answer:q.answer);record=progress.checkGrammarResponse(record,sentenceUnit,q.id)}
  assert(!record.responses[sentenceQuestion.id].matched);assert(!progress.readGrammarProgress(JSON.stringify(record),sentenceUnit).responses[sentenceQuestion.id].matched);
  assert(!progress.finishGrammarRound(record,sentenceUnit,now).attempts.at(-1).passed);
 }
 assert(progress.grammarAnswerMatches(sentenceQuestion,sentenceQuestion.answer.replace(/\.$/,'')),'Only the final sentence terminator remains optional');
 let legacy={...structuredClone(model.initial),nce:{'NCE1-99':{title:'Original lesson',text:'Old text',notes:'Original notes',steps:['listen']}},drafts:{'expression-NCE1-99':'Original unchecked expression','ielts-writing':'Original essay'}};
 legacy=learning.updateGoal(legacy,'NCE1',49,'present-simple',()=>({...learning.emptyGoal(),worked:true,answer:'I work.',transfer:'My original paragraph.'}));
 for(const unit of originals)legacy=baselineProgress.updateGrammarProgress(legacy,unit.id,record=>baselineProgress.markGrammarSeen(record,now));
 const legacySnapshot=structuredClone(legacy);
 let state=legacy;
 for(const unit of additions){
  const empty=progress.grammarProgressFor(legacy,unit);assert.deepEqual(empty,progress.emptyGrammarProgress());assert(!progress.delayedGrammarEvidence(empty,now+day));
  for(const raw of [undefined,'{bad','null','[]','42','{"version":0}'])assert.deepEqual(progress.readGrammarProgress(raw,unit),{...progress.emptyGrammarProgress(),materials:{complete:raw===undefined,firstShown:{}}});
  const seen=progress.markGrammarSeen(empty,now);assert.equal(seen.attempts.length,0);assert.equal(progress.grammarProgressStatus(seen,now),'已看过 · 尚未检验');
  let round=progress.beginGrammarRound(seen,unit);assert.equal(progress.finishGrammarRound(round,unit,now),round);
  for(const q of progress.grammarRoundQuestions(unit,round.round))round=progress.setGrammarAnswer(round,unit,q.id,q.answer);
  assert.equal(progress.finishGrammarRound(round,unit,now),round,'Unconfirmed answers are not finished');
  for(const q of progress.grammarRoundQuestions(unit,round.round))round=progress.checkGrammarResponse(round,unit,q.id);
  const q=unit.practices[0],edited=progress.setGrammarAnswer(round,unit,q.id,'Wrong answer.');assert.equal(edited.responses[q.id].checkedValue,null);assert.equal(progress.finishGrammarRound(edited,unit,now),edited);
  const finished=progress.finishGrammarRound(round,unit,now);assert(finished.attempts[0].passed&&finished.attempts[0].independent);assert.equal(progress.finishGrammarRound(finished,unit,now+1),finished);
  const redo=progress.beginGrammarRound(finished,unit);assert.equal(redo.round,1);assert.deepEqual(redo.responses,{});assert.deepEqual(redo.attempts,finished.attempts);
  assert(!progress.delayedGrammarEvidence(complete(unit,finished,now+day-1),now+day));
  const delayed=complete(unit,finished,now+day);assert(progress.delayedGrammarEvidence(delayed,now+day));assert(!progress.delayedGrammarEvidence(delayed,now));
  assert(!progress.delayedGrammarEvidence(complete(unit,finished,now+day,{hint:true}),now+day));assert(!progress.delayedGrammarEvidence(complete(unit,delayed,now+2*day,{wrong:true}),now+2*day));
  assert(!progress.delayedGrammarEvidence(complete(unit,complete(unit,empty,Date.parse('2026-10-01T23:59:00Z')),Date.parse('2026-10-02T00:01:00Z')),now+day));
  const oldContent=JSON.stringify({...finished,contentVersion:0});const migrated=progress.readGrammarProgress(oldContent,unit);assert.equal(migrated.seenAt,now);assert.deepEqual(migrated.attempts,[]);
  for(const future of [{version:2,opaque:'Future schema'},{version:1,contentVersion:2,opaque:'Future content'}]){
   const key=progress.grammarProgressKey(unit.id),futureState={...legacy,drafts:{...legacy.drafts,[key]:JSON.stringify(future)}};
   assert(progress.grammarProgressNeedsNewerVersion(futureState.drafts[key]));assert.equal(progress.updateGrammarProgress(futureState,unit.id,progress.beginGrammarRound),futureState);
   assert.equal((await files.readProgressFile(files.makeProgressFile(futureState,new Date(now)))).state.drafts[key],futureState.drafts[key]);
  }
  state=progress.updateGrammarProgress(state,unit.id,record=>complete(unit,complete(unit,record,now),now+day));
  assert(state.drafts[progress.grammarProgressKey(unit.id)].length<6500);
 }
 assert.deepEqual(legacy,legacySnapshot);
 for(const [field,value] of Object.entries(legacy))if(field!=='drafts')assert.deepEqual(state[field],value);
 for(const [key,value] of Object.entries(legacy.drafts))assert.equal(state.drafts[key],value,'Existing learning, free expressions and original 13 unit records remain byte-for-byte unchanged');
 assert(model.validateState(state));const file=files.makeProgressFile(state,new Date(now));assert(file.size<128*1024);
 assert.deepEqual((await files.readProgressFile(file)).state,state);assert.deepEqual((await files.readProgressFile(new Blob([JSON.stringify(state)]))).state,state);

 // Execute real TSX handlers. Only React rendering primitives, icons and the
 // unused legacy explanation are stubbed; progress and callbacks stay real.
 let uiSource=await readFile(new URL('grammar-curriculum-ui.tsx',root),'utf8');
 uiSource=uiSource.replace("import {useEffect,useRef,useState} from 'react';",'').replace("import {ArrowLeft,ArrowRight,BookOpen,Search} from 'lucide-react';",'const ArrowLeft=()=>null,ArrowRight=()=>null,BookOpen=()=>null,Search=()=>null;').replace("import {GrammarExplanation} from './grammar-explanation-ui';",'const GrammarExplanation=()=>null;').replace("import './grammar-curriculum.css';",'');
 for(const match of [...uiSource.matchAll(/^import (?!type )(.+?) from '(\.\/.+?)';/gm)]){const dep=match[2].slice(2)+'.ts';uiSource=uiSource.replaceAll("'"+match[2]+"'",JSON.stringify(await moduleURL(dep,dep==='grammar-curriculum-progress.ts'&&!integrated)))}
 const harness=`
  let values=[],index=0;
  function useState(initial){const slot=index++;if(!(slot in values))values[slot]=typeof initial==='function'?initial():initial;return [values[slot],value=>{values[slot]=typeof value==='function'?value(values[slot]):value}];}
  function useEffect(){} function useRef(){return {current:null}}
  const testFragment=Symbol.for('grammar-clauses-test-fragment');
  function testJSX(type,props,...children){return {type,props:{...props,children}}}
  export function renderUnit(unit,props,preferredBook){index=0;return GrammarUnitLesson({unit,props,select:()=>{},preferredBook})}
  export function resetHooks(){values=[];index=0}
 `;
 const transpiled=ts.transpileModule(uiSource+harness,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.React,jsxFactory:'testJSX',jsxFragmentFactory:'testFragment',verbatimModuleSyntax:false}}).outputText;
 const ui=await import('data:text/javascript;base64,'+Buffer.from(transpiled).toString('base64'));
 const children=node=>[node,...(node&&typeof node==='object'?(node.props?.children||[]).flat(Infinity).flatMap(children):[])];
 const textOf=node=>children(node).filter(child=>typeof child==='string'||typeof child==='number').join(' ');
 const section=(tree,className)=>children(tree).find(node=>node?.props?.className===className);
 const button=(tree,text)=>children(tree).find(node=>node?.type==='button'&&textOf(node).includes(text));
 let uiEvents=0,routeEvents=0;
 for(const unit of additions){
  ui.resetHooks();let saved=structuredClone(legacy),routes=[];
  const props={get state(){return saved},update:change=>{saved=change(saved)},onPracticeGuide:(book,lesson,guideId,task)=>routes.push({book,lesson,guideId,task})};
  let tree=ui.renderUnit(unit,props,'NCE2');assert(section(tree,'grammar-unit-explanation'));assert.equal(progress.grammarProgressFor(saved,unit).attempts.length,0);
  const transfer=section(tree,'grammar-transfer-links');
  for(const guideId of unit.guideIds){
   const link=curriculum.grammarPracticeLink(unit,guideId,'NCE2'),target=button(transfer,textbook.grammarGuides[guideId].title);
   if(!link){assert(!target);continue}
   assert(target);target.props.onClick();const route=routes.at(-1);assert.deepEqual(route,{book:link.book,lesson:link.lesson,guideId,task:{unitId:unit.id,...unit.transfer}});routeEvents++;
  }
  button(tree,'开始练习').props.onClick();
  for(const variant of [0,1]){
   if(variant){tree=ui.renderUnit(unit,props,'NCE2');button(section(tree,'grammar-round-result'),'换一组题重做').props.onClick();tree=ui.renderUnit(unit,props,'NCE2');assert.deepEqual(progress.grammarProgressFor(saved,unit).responses,{});assert.equal(progress.grammarProgressFor(saved,unit).attempts.length,1);
    button(tree,'先给一点提示').props.onClick();tree=ui.renderUnit(unit,props,'NCE2');button(tree,'再给一点帮助').props.onClick();tree=ui.renderUnit(unit,props,'NCE2');assert(button(tree,'再给一点帮助').props.disabled);
    button(tree,'回看讲解（本轮记为跟练）').props.onClick();ui.resetHooks();tree=ui.renderUnit(unit,props,'NCE2');assert(section(tree,'grammar-progressive-practice'));const resumed=progress.grammarProgressFor(saved,unit);assert(resumed.assisted);assert.equal(resumed.responses[progress.grammarRoundQuestions(unit,1)[0].id].hintLevel,2);
   }
   for(const [position,q] of progress.grammarRoundQuestions(unit,variant).entries()){
    tree=ui.renderUnit(unit,props,'NCE2');const exercise=section(tree,'grammar-progressive-practice');assert(exercise);assert(!section(tree,'grammar-round-result'));assert(textOf(exercise).includes(q.prompt));assert(!textOf(exercise).includes(q.explanation));assert(!textOf(exercise).includes('与参考一致')&&!textOf(exercise).includes('查看参考与解释'));
    assert(button(exercise,position===2?'提交本轮，核对三题':'记录这一题，下一步').props.disabled,'An empty current answer cannot be submitted');
    if(q.kind==='recognise'){const label=children(exercise).find(node=>node?.type==='label'&&textOf(node)===q.answer);assert(label);children(label).find(node=>node?.type==='input').props.onChange()}
    else{assert(!textOf(exercise).includes(q.answer));children(exercise).find(node=>node?.type==='textarea').props.onChange({target:{value:q.answer}})}
    tree=ui.renderUnit(unit,props,'NCE2');button(tree,position===2?'提交本轮，核对三题':'记录这一题，下一步').props.onClick();const record=progress.grammarProgressFor(saved,unit);assert.equal(record.responses[q.id].checkedValue,q.answer);assert.equal(record.attempts.length,variant+(position===2?1:0));uiEvents++;
   }
   tree=ui.renderUnit(unit,props,'NCE2');let result=section(tree,'grammar-round-result');assert(result);
   for(const q of progress.grammarRoundQuestions(unit,variant)){
    const item=children(result).find(node=>node?.type==='li'&&textOf(node).includes(q.prompt));
    button(item,'查看参考与解释').props.onClick();tree=ui.renderUnit(unit,props,'NCE2');result=section(tree,'grammar-round-result');
    assert(textOf(result).includes(q.answer)&&textOf(result).includes(q.explanation));
   }assert(progress.grammarProgressFor(saved,unit).attempts.at(-1).passed);assert.equal(progress.grammarProgressFor(saved,unit).attempts.at(-1).independent,variant===0);
  }
  for(const [key,value] of Object.entries(legacy.drafts))assert.equal(saved.drafts[key],value);
  const key=progress.grammarProgressKey(unit.id),futureRaw='{"version":2,"opaque":"Do not overwrite"}';saved={...saved,drafts:{...saved.drafts,[key]:futureRaw}};ui.resetHooks();tree=ui.renderUnit(unit,props,'NCE2');assert(button(tree,'开始练习').props.disabled);assert.equal(saved.drafts[key],futureRaw);
 }
 assert.equal(uiEvents,30);assert(routeEvents>0);
 // Real component submission of the reported run-on counterexample must end
 // in a failed record, even though all three commas remain in the right place.
 ui.resetHooks();let failedState=progress.updateGrammarProgress(legacy,sentenceUnit.id,record=>({...record,round:1,inRound:true}));
 const failureProps={get state(){return failedState},update:change=>{failedState=change(failedState)}};
 for(const [position,q] of progress.grammarRoundQuestions(sentenceUnit,1).entries()){
  let tree=ui.renderUnit(sentenceUnit,failureProps),exercise=section(tree,'grammar-progressive-practice');
  if(q.kind==='recognise'){const label=children(exercise).find(node=>node?.type==='label'&&textOf(node)===q.answer);children(label).find(node=>node?.type==='input').props.onChange()}
  else children(exercise).find(node=>node?.type==='textarea').props.onChange({target:{value:q===sentenceQuestion?sentenceErrors[0]:q.answer}});
  tree=ui.renderUnit(sentenceUnit,failureProps);button(tree,position===2?'提交本轮，核对三题':'记录这一题，下一步').props.onClick();
 }
 const failedResult=section(ui.renderUnit(sentenceUnit,failureProps),'grammar-round-result');assert(failedResult&&textOf(failedResult).includes('与参考不同，待核对'));
 const failedRecord=progress.grammarProgressFor(failedState,sentenceUnit);assert.equal(failedRecord.attempts.length,1);assert(!failedRecord.attempts[0].passed);assert(!failedRecord.responses[sentenceQuestion.id].matched);
 const failedImported=(await files.readProgressFile(files.makeProgressFile(failedState,new Date(now)))).state;assert(!progress.grammarProgressFor(failedImported,sentenceUnit).attempts[0].passed);assert(!progress.grammarProgressFor(failedImported,sentenceUnit).responses[sentenceQuestion.id].matched);
 assert(!progress.delayedGrammarEvidence(progress.grammarProgressFor(failedImported,sentenceUnit),now+day));
 console.log(`Clauses ${integrated?'INTEGRATION GATE (real mainline registration)':'LOCAL DELTA (isolated in-memory preview)'}: 5 units / 19 previously undelivered guides / 30 questions; original batch totals 18/64/108, current ${units.length}/${new Set(units.flatMap(unit=>unit.guideIds)).size}/${units.flatMap(unit=>unit.practices).length}, ${unregistered.length} unregistered concepts, evidence/DAG/unique keys/fresh scenes and ${exactSearches} exact source searches passed; ${secondary.length} NCE2 secondary-guide associations.`);
 console.log(`Clauses answer/UI: ${strictQuestions.length} comma-sensitive tasks and explicit sentence boundary, prior 13 matcher compatibility, 30 reference + 3 failure TSX answer events, ${routeEvents} exact NCE2 transfer callbacks, private mid-round feedback, alternate-set redo, two-stage hints and reload passed.`);
 console.log(`Clauses persistence: actual makeProgressFile/readProgressFile roundtrip (${file.size} bytes), future/malformed/version handling and untouched original records passed.`);
}finally{
 if(!integrated)curriculum.grammarUnits.splice(originals.length);
 assert.equal(canonical(curriculum.grammarUnits),registrySnapshot,'In-memory preview registration is cleaned up');
 assert.equal(await readFile(new URL('grammar-curriculum-progress.ts',root),'utf8'),productionSource,'The answer adapter never rewrites production progress source');
}
