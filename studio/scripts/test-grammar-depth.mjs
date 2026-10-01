import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {stripTypeScriptTypes} from 'node:module';

const root=new URL('../app/',import.meta.url);
const readJSON=async name=>JSON.parse(await readFile(new URL(name,root),'utf8'));
const canonical=value=>Array.isArray(value)?'['+value.map(canonical).join(',')+']':value&&typeof value==='object'?'{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+canonical(value[key])).join(',')+'}':JSON.stringify(value);
const digest=value=>createHash('sha256').update(canonical(value)).digest('hex');
const sorted=values=>[...values].sort();
const nonempty=value=>typeof value==='string'&&value.trim().length>0;
// Immutable content fingerprints from baseline 7a5aa38. Formatting changes are
// harmless; any changed field, answer, prerequisite or item order is detected.
const originalFiles={
 'core-units.json':'7f326dfdf20ad78ab43a0d31f9dbab776d0a4e2fbc142d869eca35d6167c9a03',
 'extension-units.json':'1c685937ddf2a3f3c2d926f8c6f0136e7beaac89c7ec8bba31cd1685341a9e41',
};
const originalUnitIds=['sentence-core','questions-negation','present-time','past-present-perfect','noun-reference','comparisons','modal-choice','linking-ideas'];
const b1Guides=['going-to','will','future-choice','time-clause','passive','passive-forms','passive-double','causative','need-doing','object-clause','reported','indirect-question','reported-commands','gerund','verb-patterns','verb-prepositions','purpose','none','indefinite','negative-scope'];
const b1Names=['timeline','passive','reported','complements','negative'];
const originals=[];
for(const [name,expected] of Object.entries(originalFiles)){
 const data=await readJSON('data/grammar-curriculum/'+name);
 assert.equal(digest(data),expected,`Original content must remain deeply equal to 7a5aa38: ${name}`);
 originals.push(...data);
}
assert.deepEqual(originals.map(unit=>unit.id),originalUnitIds);
const originalGuides=new Set(originals.flatMap(unit=>unit.guideIds));
assert.equal(originalGuides.size,25);assert.equal(originals.flatMap(unit=>unit.practices).length,48);
console.log('Depth baseline: eight original units, 25 concepts and 48 practices remain deeply equal to 7a5aa38 (canonical SHA-256).');
if(process.argv.includes('--baseline-only')){console.log('BASELINE ONLY: default also requires five B1 units, evidence sidecars and the complete coverage plan.');process.exit(0)}

// Use the established recursive TypeScript/JSON loader; no generated materials
// or runtime .git access are needed by this standalone regression.
const cache=new Map();
async function moduleURL(name){
 if(cache.has(name))return cache.get(name);
 let source=await readFile(new URL(name,root),'utf8');
 for(const match of [...source.matchAll(/^import (?!type )(.+?) from '(\.\/.+?)';/gm)]){
  const dep=match[2].slice(2);
  if(dep.endsWith('.json'))source=source.replace(match[0],`const ${match[1]}=${await readFile(new URL(dep,root),'utf8')};`);
  else source=source.replaceAll("'"+match[2]+"'",JSON.stringify(await moduleURL(dep+'.ts')));
 }
 const url='data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64');cache.set(name,url);return url;
}
const model=await import(await moduleURL('model.ts'));
const textbook=await import(await moduleURL('textbook-grammar.ts'));
const curriculum=await import(await moduleURL('grammar-curriculum.ts'));
const progress=await import(await moduleURL('grammar-curriculum-progress.ts'));
const {grammarUnits:units,grammarStages:stages}=curriculum;
const plan=await readJSON('data/grammar-curriculum/coverage-plan.json');
const additions=[],evidence=[];
for(const name of b1Names){
 const raw=await readJSON(`data/grammar-curriculum/depth-b1/${name}.json`),rows=Array.isArray(raw)?raw:[raw];
 assert.equal(rows.length,1,`${name}: one delivered unit`);additions.push(...rows);
 const proof=await readJSON(`data/grammar-curriculum/depth-b1/${name}.coverage.json`);
 assert(Array.isArray(proof));assert.deepEqual(sorted(proof.map(row=>row.guideId)),sorted(rows[0].guideIds),`${name}: every concept has evidence`);
 assert(proof.every(row=>row.unitId===rows[0].id));evidence.push(...proof);
}
assert.equal(curriculum.grammarCurriculumVersion,1,'Adding units does not invalidate original exercise evidence');
assert.equal(progress.emptyGrammarProgress().version,1);
for(const unit of originals)assert.equal(progress.grammarProgressKey(unit.id),`grammar-curriculum-v1-${unit.id}`,'Storage namespace is preserved');
assert.equal(units.length,28);assert.equal(new Set(units.map(unit=>unit.id)).size,28);
assert.equal(additions.length,5);assert.equal(new Set(additions.map(unit=>unit.id)).size,5);
assert(additions.every(unit=>!originalUnitIds.includes(unit.id)));
const clauseUnitIds=['past-background','modal-evidence','relative-reference','hypothetical-condition','information-focus'];
const remainingUnitIds=['reference-ownership','basic-descriptions','giving-directions','time-perspective','habit-change','linked-vocabulary','extended-timeline','duration-perspective','requests-nonfinite','structure-rewrite'];
assert.deepEqual(sorted(units.map(unit=>unit.id)),sorted([...originalUnitIds,...additions.map(unit=>unit.id),...clauseUnitIds,...remainingUnitIds]));
for(const unit of [...originals,...additions])assert.deepEqual(curriculum.grammarUnitFor(unit.id),unit,'Catalog registers the actual authored unit');
assert.equal(additions.flatMap(unit=>unit.guideIds).length,20);
assert.deepEqual(sorted(additions.flatMap(unit=>unit.guideIds)),sorted(b1Guides));
assert(b1Guides.every(id=>!originalGuides.has(id)),'B1 addresses previously undelivered concepts');
const currentGuides=new Set(units.flatMap(unit=>unit.guideIds));
assert.equal(currentGuides.size,97);assert.equal(units.flatMap(unit=>unit.practices).length,168);
assert.deepEqual(curriculum.grammarCoverage(),{textbookEntries:276,existingGuides:97,completeUnits:28,deepenedGuides:97});
assert.deepEqual(stages.map(stage=>stage.id),['foundation','time','meaning','extension']);
const stageFor=new Map(stages.flatMap(stage=>stage.guideIds.map(guideId=>[guideId,stage.id])));
assert.equal(stages.flatMap(stage=>stage.guideIds).length,97);assert.equal(stageFor.size,97);
assert.deepEqual(sorted(stageFor.keys()),sorted(Object.keys(textbook.grammarGuides)));

const sourceEntries=guideId=>textbook.grammarEntries.flatMap(entry=>textbook.grammarGuidesFor(entry).flatMap((guide,position)=>guide.id===guideId?[{entryId:entry.id,book:entry.book,lesson:entry.lesson,lastLesson:entry.lastLesson,position}]:[]));
const sortSources=rows=>[...rows].sort((a,b)=>a.entryId.localeCompare(b.entryId)||a.position-b.position);
const linksFor=unit=>textbook.grammarEntries.flatMap(entry=>{
 const guideIds=textbook.grammarGuidesFor(entry).map(guide=>guide.id).filter(id=>unit.guideIds.includes(id));
 return guideIds.length?[{book:entry.book,lesson:entry.lesson,lastLesson:entry.lastLesson,guideIds}]:[];
});
const initialRemaining=Object.keys(textbook.grammarGuides).filter(id=>!originalGuides.has(id));
assert.equal(initialRemaining.length,72);
assert.equal(plan.schemaVersion,1);assert.equal(plan.baseline.commit,'7a5aa38d7c8f5f0e20357b31502d4389d682b864');assert.equal(plan.baseline.version,'2026-10-01-yesterday-demo-v12');
assert.deepEqual(sorted(plan.baseline.originalUnitIds),sorted(originalUnitIds));assert.deepEqual(sorted(plan.baseline.originalGuideIds),sorted(originalGuides));
assert.equal(plan.concepts.length,72);assert.equal(new Set(plan.concepts.map(concept=>concept.guideId)).size,72);
assert.deepEqual(sorted(plan.concepts.map(concept=>concept.guideId)),sorted(initialRemaining),'Ledger is exactly the original 72-guide remainder');
assert.equal(plan.batches.length,4);assert.deepEqual(sorted(plan.batches.map(batch=>batch.id.toLowerCase())),['b1','b2','b3','b4']);
const batches=new Map(plan.batches.map(batch=>[batch.id,batch])),groups=new Map(plan.groups.map(group=>[group.id,group]));
assert.equal(groups.size,plan.groups.length);assert(plan.groups.every(group=>!originalUnitIds.includes(group.id)));
for(const [batchIndex,count] of [20,23,17,12].entries()){
 const batch=plan.batches.find(row=>row.id.toLowerCase()===`b${batchIndex+1}`);assert(nonempty(batch.title));
 assert.equal(new Set(batch.unitIds).size,batch.unitIds.length);
 assert.deepEqual(sorted(batch.unitIds),sorted(plan.groups.filter(group=>group.batchId===batch.id).map(group=>group.id)));
 assert.equal(plan.concepts.filter(concept=>concept.batchId===batch.id).length,count);
}
const b1=plan.batches.find(batch=>batch.id.toLowerCase()==='b1');
assert.deepEqual(sorted(b1.unitIds),sorted(additions.map(unit=>unit.id)));
assert.deepEqual(sorted(plan.groups.flatMap(group=>group.guideIds)),sorted(initialRemaining),'Batches have no gaps or duplicate concept ownership');
const allNodes=new Map([...originals,...plan.groups].map(node=>[node.id,node])),visiting=new Set(),visited=new Set();
function visit(node){
 assert(!visiting.has(node.id),`Prerequisite cycle at ${node.id}`);if(visited.has(node.id))return;
 visiting.add(node.id);
 for(const id of node.prerequisites){assert(allNodes.has(id),`${node.id}: prerequisite ${id} exists`);visit(allNodes.get(id))}
 visiting.delete(node.id);visited.add(node.id);
}
const priorTo=(id,group)=>originalUnitIds.includes(id)||groups.has(id)&&plan.groups.indexOf(groups.get(id))<plan.groups.indexOf(group);
for(const group of plan.groups){
 assert(batches.has(group.batchId)&&nonempty(group.title)&&nonempty(group.comparison));
 assert(stages.some(stage=>stage.id===group.stageId));assert(group.guideIds.length&&new Set(group.guideIds).size===group.guideIds.length);
 assert(group.purposeIds.length&&group.purposeIds.every(id=>curriculum.grammarPurposes.some(purpose=>purpose.id===id)));
 for(const id of group.prerequisites)assert(priorTo(id,group),`${group.id}: prerequisite is delivered or earlier in the plan`);
 visit(group);
 if(group.batchId===b1.id){
  const unit=curriculum.grammarUnitFor(group.id);assert(unit);
  assert.deepEqual(sorted(group.guideIds),sorted(unit.guideIds));assert.equal(group.stageId,unit.stageId);
  assert.deepEqual(sorted(group.prerequisites),sorted(unit.prerequisites));assert.deepEqual(sorted(group.purposeIds),sorted(unit.purposeIds));
 }
}
for(const concept of plan.concepts){
 assert(Object.hasOwn(textbook.grammarGuides,concept.guideId));assert.equal(concept.title,textbook.grammarGuides[concept.guideId].title);
 assert.equal(concept.stageId,stageFor.get(concept.guideId),'Combined units retain original concept stages');
 const group=groups.get(concept.unitId);assert(group&&group.guideIds.includes(concept.guideId));assert.equal(concept.batchId,group.batchId);
 for(const id of concept.prerequisites)assert(priorTo(id,group));assert(concept.purposeIds.length&&concept.purposeIds.every(id=>group.purposeIds.includes(id)));
 assert(nonempty(concept.comparison)&&nonempty(concept.scope)&&nonempty(concept.remaining));
 assert.deepEqual(sortSources(concept.sourceEntries),sortSources(sourceEntries(concept.guideId)),`${concept.guideId}: all source entries and 0-based positions are truthful`);
 assert.equal(concept.status,'implemented');assert(currentGuides.has(concept.guideId));
 assert(curriculum.grammarUnitFor(concept.unitId)?.guideIds.includes(concept.guideId),'Every covered guide has a real registered unit');
}
assert.equal(plan.concepts.filter(concept=>concept.status==='implemented').length,72);assert.equal(plan.concepts.filter(concept=>concept.status==='planned').length,0);
assert.equal(evidence.length,20);assert.equal(new Set(evidence.map(row=>row.guideId)).size,20);
for(const row of evidence){
 const unit=curriculum.grammarUnitFor(row.unitId);assert(unit&&unit.guideIds.includes(row.guideId));
 for(const [key,collection] of [['formIndices','forms'],['contrastIndices','contrasts'],['mistakeIndices','mistakes']]){
  assert(Array.isArray(row[key])&&row[key].length,`${row.guideId}: ${key} is nonempty`);assert.equal(new Set(row[key]).size,row[key].length);
  for(const index of row[key]){
   assert(Number.isInteger(index)&&index>=0&&index<unit[collection].length,`${row.guideId}: ${key}[${index}] is a real item`);
   const item=unit[collection][index];
   if(collection==='forms')assert(nonempty(item.form)&&nonempty(item.meaning)&&nonempty(item.useWhen));
   if(collection==='contrasts')assert(nonempty(item.label)&&nonempty(item.why)&&nonempty(item.a.en)&&nonempty(item.a.zh)&&nonempty(item.b.en)&&nonempty(item.b.zh));
   if(collection==='mistakes')assert(nonempty(item.wrong)&&nonempty(item.correct)&&nonempty(item.why)&&item.wrong!==item.correct);
  }
 }
 assert(row.practiceIds.length&&new Set(row.practiceIds).size===row.practiceIds.length);
 for(const id of row.practiceIds)assert(unit.practices.some(practice=>practice.id===id),`${row.guideId}: cited practice belongs to the delivered unit`);
 assert(nonempty(row.scope)&&nonempty(row.remaining),'Evidence describes covered scope and remaining limits');
 const concept=plan.concepts.find(item=>item.guideId===row.guideId);
 assert.equal(concept.unitId,row.unitId);assert(concept.scope.includes(row.scope)&&concept.remaining.includes(row.remaining),`${row.guideId}: implemented ledger retains the cited evidence scope and remaining limits`);
}

// Mapping occurrences, unique concepts and unique entries are different counts.
const secondary=textbook.grammarEntries.filter(entry=>entry.book==='NCE2').flatMap(entry=>textbook.grammarGuidesFor(entry).slice(1).map((guide,index)=>({entryId:entry.id,guideId:guide.id,position:index+1})));
const countRows=rows=>({occurrences:rows.length,concepts:new Set(rows.map(row=>row.guideId)).size,entries:new Set(rows.map(row=>row.entryId)).size});
assert.equal(textbook.grammarEntries.filter(entry=>entry.book==='NCE2').flatMap(textbook.grammarGuidesFor).length,173);
assert.deepEqual(countRows(secondary),{occurrences:77,concepts:45,entries:53});
assert.deepEqual(countRows(secondary.filter(row=>originalGuides.has(row.guideId))),{occurrences:22,concepts:13,entries:19});
assert.deepEqual(countRows(secondary.filter(row=>b1Guides.includes(row.guideId))),{occurrences:28,concepts:13,entries:25});
assert.deepEqual(countRows(secondary.filter(row=>originalGuides.has(row.guideId)||b1Guides.includes(row.guideId))),{occurrences:50,concepts:26,entries:37});
assert.deepEqual(countRows(secondary.filter(row=>currentGuides.has(row.guideId))),{occurrences:77,concepts:45,entries:53});
assert.deepEqual(countRows(secondary.filter(row=>!currentGuides.has(row.guideId))),{occurrences:0,concepts:0,entries:0});
console.log('Depth ledger: exact 72-guide remainder; B1 20, clauses 19 and remaining 33 implemented, zero planned, four stages and acyclic prerequisites passed.');
console.log('NCE2 secondary: 77 occurrences / 45 concepts / 53 entries; original + B1 remains 50 / 26 / 37; all registered coverage is 77 / 45 / 53, with 0 / 0 / 0 remaining.');

const allQuestionIds=units.flatMap(unit=>unit.practices.map(practice=>practice.id)),newQuestionIds=new Set();
assert.equal(new Set(allQuestionIds).size,168,'New practice ids cannot overwrite existing response identities');
for(const unit of additions){
 assert(nonempty(unit.title)&&nonempty(unit.goal)&&unit.explanation.length>=2&&unit.explanation.every(nonempty));
 assert(nonempty(unit.transfer.prompt)&&unit.transfer.criteria.length>=3&&unit.transfer.criteria.every(nonempty));
 for(const [collection,key] of [['forms','form'],['contrasts','label'],['mistakes','wrong']])assert.equal(new Set(unit[collection].map(item=>item[key])).size,unit[collection].length,`${unit.id}: ${collection}.${key} values are unique React list keys`);
 assert.equal(unit.practices.length,6);assert.deepEqual(curriculum.lessonsForGrammarUnit(unit),linksFor(unit));
 for(const id of unit.prerequisites){const prerequisite=curriculum.grammarUnitFor(id);assert(prerequisite&&prerequisite.order<unit.order)}
 assert.deepEqual(sorted(curriculum.grammarPrerequisites(unit).map(row=>row.id)),sorted(unit.prerequisites));
 for(const guideId of unit.guideIds)for(const book of Object.keys(model.bookCounts)){
  const expected=linksFor(unit).find(link=>link.book===book&&link.guideIds.includes(guideId)),link=curriculum.grammarPracticeLink(unit,guideId,book);assert.deepEqual(link,expected);
  if(link)assert(textbook.grammarGuidesFor(textbook.grammarEntryFor(book,link.lesson)).some(guide=>guide.id===guideId),'Selected-guide callbacks use a real association, including a non-primary guide');
 }
 for(const variant of [0,1]){
  const questions=progress.grammarRoundQuestions(unit,variant);assert.equal(questions.length,3);assert.deepEqual(sorted(questions.map(question=>question.kind)),['produce','recognise','repair']);
  for(const question of questions){
   newQuestionIds.add(question.id);for(const field of ['id','prompt','answer','explanation'])assert(nonempty(question[field]),`${question.id}: ${field}`);
   assert.equal(question.hints.length,2);assert(question.hints.every(nonempty));assert.notEqual(question.hints[0],question.hints[1]);
   assert(!question.hints.some(hint=>hint.includes(question.answer)),'Hints do not print the complete reference sentence');
   assert(progress.grammarAnswerMatches(question,question.answer));for(const accepted of question.accepted||[])assert(nonempty(accepted)&&progress.grammarAnswerMatches(question,accepted));
   assert(!progress.grammarAnswerMatches(question,''));assert(!progress.grammarAnswerMatches(question,'This is an unrelated answer.'));
   if(question.kind==='produce'){
    const demonstrated=[...unit.contrasts.flatMap(contrast=>[contrast.a.en,contrast.b.en]),...unit.mistakes.map(mistake=>mistake.correct)];
    for(const reference of demonstrated)assert(!progress.grammarAnswerMatches(question,reference),`${question.id}: production/accepted answers cannot repeat a demonstrated or corrected sentence`);
    for(const answer of [question.answer,...(question.accepted||[])])for(const explanation of unit.explanation)assert(!model.normal(explanation).includes(model.normal(answer)),`${question.id}: production does not copy theory verbatim`);
   }
   if(question.kind==='recognise'){
    assert(question.options.length>=3);assert.equal(new Set(question.options).size,question.options.length);
    assert.equal(question.options.filter(option=>option===question.answer).length,1);assert.equal(question.options.filter(option=>progress.grammarAnswerMatches(question,option)).length,1);
   }
  }
 }
 for(const kind of ['recognise','repair','produce']){
  const [a,b]=[0,1].map(variant=>unit.practices.find(practice=>practice.variant===variant&&practice.kind===kind));
  assert.notEqual(a.prompt,b.prompt);assert(!progress.grammarAnswerMatches(a,b.answer),'Variants change the task, not merely its id');
 }
}
assert.equal(newQuestionIds.size,30);
// The existing behavior suite covers the shared progress mechanism. Extend its
// independent source-driven search check to all newly registered associations.
for(const [book,count] of Object.entries(model.bookCounts))for(let lesson=1;lesson<=count;lesson++){
 const expected=units.filter(unit=>linksFor(unit).some(link=>link.book===book&&lesson>=link.lesson&&lesson<=link.lastLesson));
 assert.deepEqual(sorted(curriculum.searchGrammarUnits({book,query:`${book} 第${lesson}课`}).map(unit=>unit.id)),sorted(expected.map(unit=>unit.id)));
}
for(const unit of additions){
 assert(curriculum.searchGrammarUnits({query:unit.title,stageId:unit.stageId,purposeId:unit.purposeIds[0]}).some(result=>result.id===unit.id));
 assert.equal(curriculum.searchGrammarUnits({query:unit.title+' definitely-unmapped-token'}).length,0);
 for(const guideId of unit.guideIds)assert(curriculum.searchGrammarConcepts().find(concept=>concept.id===guideId)?.deepened);
}
assert.equal(curriculum.searchGrammarUnits({query:'NCE1 NCE2 1'}).length,0);assert.equal(curriculum.searchGrammarUnits({book:'NCE1',query:'NCE2 1'}).length,0);
const untouched=JSON.stringify(model.initial);for(const unit of units)progress.grammarProgressFor(model.initial,unit);assert.equal(JSON.stringify(model.initial),untouched);
console.log('Depth curriculum: 28 units / 97 concepts / 168 practices, 30 B1 answer/hint/production contracts, unique React keys, selected-guide callbacks and 348 exact source searches passed.');
