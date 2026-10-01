import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import ts from 'typescript';

// The explicit preview is only for the first three units while the parallel
// content task is running. The default run must load and validate all eight.
const corePreview=process.argv.includes('--core-preview');
const root=new URL('../app/',import.meta.url),cache=new Map();
async function moduleURL(name){
 if(cache.has(name))return cache.get(name);
 let source=await readFile(new URL(name,root),'utf8');
 // This existing module imports a type without `type`; keep its runtime import.
 if(name==='progress-file.ts')source=source.replace("import {State, validateState} from './model';","import {validateState} from './model';");
 for(const match of [...source.matchAll(/^import (?!type )(.+?) from '(\.\/.+?)';/gm)]){
  const dep=match[2].slice(2);
  if(dep.endsWith('.json')){
   const json=corePreview&&dep==='data/grammar-curriculum/extension-units.json'?'[]':await readFile(new URL(dep,root),'utf8');
   source=source.replace(match[0],`const ${match[1]}=${json};`);
  }else source=source.replaceAll("'"+match[2]+"'",JSON.stringify(await moduleURL(dep+'.ts')));
 }
 const url='data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64');
 cache.set(name,url);return url;
}
const model=await import(await moduleURL('model.ts'));
const textbook=await import(await moduleURL('textbook-grammar.ts'));
const curriculum=await import(await moduleURL('grammar-curriculum.ts'));
const progress=await import(await moduleURL('grammar-curriculum-progress.ts'));
const learning=await import(await moduleURL('learning-plan.ts'));
const files=await import(await moduleURL('progress-file.ts'));
const {grammarUnits:units,grammarStages:stages,grammarPurposes:purposes}=curriculum;
const ids=values=>values.map(value=>value.id).sort();
const nonempty=value=>typeof value==='string'&&value.trim().length>0;
const now=Date.parse('2026-10-01T12:00:00Z'),day=24*60*60*1000;
const pristine=JSON.stringify(model.initial);
// Status/evidence checks use a fixed clock, independent of the machine date.
const delayed=(record,at=now+30*day)=>progress.delayedGrammarEvidence(record,at);
const status=(record,at=now+30*day)=>progress.grammarProgressStatus(record,at);

assert.equal(units.length,corePreview?3:8,'The default suite requires eight complete representative units');
assert.equal(new Set(ids(units)).size,units.length);
assert.deepEqual(stages.map(stage=>stage.id),['foundation','time','meaning','extension']);
const stagedGuides=stages.flatMap(stage=>stage.guideIds);
assert.equal(stagedGuides.length,97,'Count concepts separately from textbook entry reuse');
assert.equal(new Set(stagedGuides).size,97,'Each legacy concept belongs to exactly one stage');
assert.deepEqual([...stagedGuides].sort(),Object.keys(textbook.grammarGuides).sort());
assert.deepEqual(ids(curriculum.searchGrammarConcepts()),Object.keys(textbook.grammarGuides).sort());
for(const stage of stages){
 assert(nonempty(stage.title)&&nonempty(stage.description));
 assert.deepEqual(ids(curriculum.searchGrammarConcepts('',stage.id)),[...stage.guideIds].sort());
}
assert.equal(curriculum.searchGrammarConcepts('definitely-unmapped-term').length,0);
const coverage=curriculum.grammarCoverage();
assert.equal(coverage.textbookEntries,276);
assert.equal(coverage.existingGuides,97);
assert.equal(coverage.completeUnits,units.length);
assert.equal(coverage.deepenedGuides,new Set(units.flatMap(unit=>unit.guideIds)).size);

// Derive associations from the pre-existing textbook teaching map rather than
// the new curriculum link helpers, then test both helpers and search against it.
const sourceLinks=unit=>textbook.grammarEntries.flatMap(entry=>{
 const guideIds=textbook.grammarGuidesFor(entry).map(guide=>guide.id).filter(id=>unit.guideIds.includes(id));
 return guideIds.length?[{book:entry.book,lesson:entry.lesson,lastLesson:entry.lastLesson,guideIds}]:[];
});
const visiting=new Set(),visited=new Set();
function visit(unit){
 assert(!visiting.has(unit.id),`Prerequisite cycle at ${unit.id}`);
 if(visited.has(unit.id))return;
 visiting.add(unit.id);
 for(const id of unit.prerequisites){
  const previous=units.find(other=>other.id===id);
  assert(previous,`${unit.id}: prerequisite ${id} exists`);
  assert(previous.order<unit.order,`${unit.id}: prerequisites come first`);
  visit(previous);
 }
 visiting.delete(unit.id);visited.add(unit.id);
}
const questionIds=new Set();
for(const unit of units){
 for(const field of ['id','title','goal'])assert(nonempty(unit[field]),`${unit.id}: ${field}`);
 assert(stages.some(stage=>stage.id===unit.stageId));
 assert(unit.guideIds.length&&new Set(unit.guideIds).size===unit.guideIds.length);
 assert(unit.purposeIds.length&&new Set(unit.purposeIds).size===unit.purposeIds.length);
 assert(unit.purposeIds.every(id=>purposes.some(purpose=>purpose.id===id)));
 assert(unit.guideIds.every(id=>Object.hasOwn(textbook.grammarGuides,id)));
 assert(unit.explanation.length>=2&&unit.explanation.every(nonempty));
 assert(unit.forms.length&&unit.forms.every(form=>['form','meaning','useWhen'].every(field=>nonempty(form[field]))));
 assert(unit.contrasts.length&&unit.contrasts.every(contrast=>nonempty(contrast.label)&&nonempty(contrast.why)&&['a','b'].every(key=>nonempty(contrast[key].en)&&nonempty(contrast[key].zh))));
 assert(unit.mistakes.length&&unit.mistakes.every(mistake=>nonempty(mistake.wrong)&&nonempty(mistake.correct)&&nonempty(mistake.why)&&mistake.wrong!==mistake.correct));
 assert(nonempty(unit.transfer.prompt)&&unit.transfer.criteria.length>=3&&unit.transfer.criteria.every(nonempty));
 assert(!/TODO|PLACEHOLDER|待补充/.test(JSON.stringify(unit)),`${unit.id}: no empty scaffolding presented as a lesson`);
 visit(unit);
 assert.deepEqual(ids(curriculum.grammarPrerequisites(unit)),[...unit.prerequisites].sort());
 assert.equal(curriculum.grammarUnitFor(unit.id),unit);
 assert.deepEqual(curriculum.lessonsForGrammarUnit(unit),sourceLinks(unit));
 for(const [book,count] of Object.entries(model.bookCounts)){
  assert.deepEqual(curriculum.lessonsForGrammarUnit(unit,book),sourceLinks(unit).filter(link=>link.book===book));
  for(const guideId of unit.guideIds){
   const link=curriculum.grammarPracticeLink(unit,guideId,book);
   const expected=sourceLinks(unit).find(source=>source.book===book&&source.guideIds.includes(guideId));
   assert.deepEqual(link,expected,`${unit.id}/${guideId}/${book}: only link the selected guide's real lesson`);
   if(link){
    assert(link.lesson>=1&&link.lastLesson<=count);
    for(const lesson of [link.lesson,link.lastLesson])assert(textbook.grammarGuidesFor(textbook.grammarEntryFor(book,lesson)).some(guide=>guide.id===guideId),'The onPracticeGuide callback can use either lesson of an NCE1 pair');
   }
  }
 }
 assert.equal(curriculum.grammarPracticeLink(unit,'definitely-unmapped-guide'),undefined);
 assert.equal(unit.practices.length,6,`${unit.id}: two sets of three checks`);
 for(const variant of [0,1]){
  const questions=progress.grammarRoundQuestions(unit,variant);
  assert.equal(questions.length,3);
  assert.deepEqual(questions.map(question=>question.kind).sort(),['produce','recognise','repair']);
  assert.deepEqual(progress.grammarRoundQuestions(unit,variant+2),questions);
  for(const question of questions){
   assert(!questionIds.has(question.id),`Duplicate practice id ${question.id}`);questionIds.add(question.id);
   for(const field of ['id','prompt','answer','explanation'])assert(nonempty(question[field]),`${question.id}: ${field}`);
   assert.equal(question.hints.length,2);assert(question.hints.every(nonempty));
   assert(progress.grammarAnswerMatches(question,question.answer),`${question.id}: reference answer self-matches`);
   assert(progress.grammarAnswerMatches(question,'  '+question.answer.toUpperCase()+'  '),`${question.id}: case and surrounding spaces are harmless`);
   for(const accepted of question.accepted||[])assert(nonempty(accepted)&&progress.grammarAnswerMatches(question,accepted));
   assert(!progress.grammarAnswerMatches(question,''));
   assert(!progress.grammarAnswerMatches(question,'Definitely not the requested answer.'));
   if(question.kind==='recognise'){
    assert(question.options.length>=3);
    assert.equal(new Set(question.options).size,question.options.length);
    assert.equal(question.options.filter(option=>option===question.answer).length,1);
    assert.equal(question.options.filter(option=>progress.grammarAnswerMatches(question,option)).length,1,'Only one option matches the accepted answer');
   }
  }
 }
 for(const kind of ['recognise','repair','produce']){
  const first=unit.practices.find(question=>question.variant===0&&question.kind===kind);
  const second=unit.practices.find(question=>question.variant===1&&question.kind===kind);
  assert.notEqual(first.prompt,second.prompt,`${unit.id}/${kind}: review presents a new item`);
  assert(!progress.grammarAnswerMatches(first,second.answer),`${unit.id}/${kind}: changed labels alone do not create a new answer`);
 }
}
for(const guideId of Object.keys(textbook.grammarGuides)){
 const entries=textbook.grammarEntries.filter(entry=>textbook.grammarGuidesFor(entry).some(guide=>guide.id===guideId));
 assert.deepEqual(curriculum.lessonsForGrammarGuide(guideId),entries);
 for(const entry of entries)assert(curriculum.guideBelongsToEntry(entry,guideId));
}
assert.equal(curriculum.grammarUnitFor('definitely-unmapped-unit'),undefined);
assert(!curriculum.guideBelongsToEntry(textbook.grammarEntries[0],'definitely-unmapped-guide'));

assert.deepEqual(ids(curriculum.searchGrammarUnits()),ids(units));
assert(curriculum.searchGrammarUnits({query:'Mia library'}).some(unit=>unit.id==='sentence-core'),'Search includes contrast examples and uses all terms');
assert(curriculum.searchGrammarUnits({query:'  MIA   LIBRARY  '}).some(unit=>unit.id==='sentence-core'));
assert.equal(curriculum.searchGrammarUnits({query:'Mia definitely-unmapped-term'}).length,0,'An extra unmatched term excludes a partial match');
for(const stage of stages)for(const purpose of purposes)for(const book of Object.keys(model.bookCounts)){
 const expected=units.filter(unit=>unit.stageId===stage.id&&unit.purposeIds.includes(purpose.id)&&sourceLinks(unit).some(link=>link.book===book));
 assert.deepEqual(ids(curriculum.searchGrammarUnits({stageId:stage.id,purposeId:purpose.id,book})),ids(expected),'Stage, purpose and book filters intersect');
}
let pairedSearches=0,negativeAssociations=0;
for(const [book,count] of Object.entries(model.bookCounts))for(let lesson=1;lesson<=count;lesson++){
 const expected=units.filter(unit=>sourceLinks(unit).some(link=>link.book===book&&lesson>=link.lesson&&lesson<=link.lastLesson));
 assert.deepEqual(ids(curriculum.searchGrammarUnits({query:`${book} ${lesson}`})),ids(expected),'Book and number must identify the same textbook association');
 assert.deepEqual(ids(curriculum.searchGrammarUnits({book,query:`第 ${lesson} 课`})),ids(expected));
 assert.deepEqual(ids(curriculum.searchGrammarUnits({book,query:`${book.toLowerCase()} ${lesson}`})),ids(expected));
 if(book==='NCE1'&&lesson%2===0){
  assert.deepEqual(ids(curriculum.searchGrammarUnits({query:`${book} ${lesson}`})),ids(curriculum.searchGrammarUnits({query:`${book} ${lesson-1}`})));
  pairedSearches++;
 }
 for(const unit of units)if(!expected.includes(unit)&&sourceLinks(unit).some(link=>lesson>=link.lesson&&lesson<=link.lastLesson))negativeAssociations++;
}
assert.equal(pairedSearches,72);assert(negativeAssociations>0,'The real data exercises false cross-book associations');
assert.equal(curriculum.searchGrammarUnits({query:'NCE1 NCE2 1'}).length,0,'Conflicting books cannot match separate links');
assert.equal(curriculum.searchGrammarUnits({query:'NCE1 1 144'}).length,0,'Numbers must belong to one source range');
assert.equal(curriculum.searchGrammarUnits({book:'NCE1',query:'NCE2 1'}).length,0);
assert.equal(JSON.stringify(model.initial),pristine,'Curriculum browsing is read-only');
console.log(`Grammar content: ${units.length} complete units, 97 singly classified concepts, acyclic prerequisites, ${questionIds.size} checks, AND filters and 348 real lesson associations passed.`);

function completeRound(unit,record,at,{hint=false,theory=false,wrong=false}={}){
 let next=progress.beginGrammarRound(record);
 const questions=progress.grammarRoundQuestions(unit,next.round);
 if(theory)next=progress.revisitGrammarTheory(next);
 if(hint)next=progress.showGrammarHint(next,unit,questions[0].id);
 for(const [index,question] of questions.entries()){
  next=progress.setGrammarAnswer(next,unit,question.id,wrong&&index===0?'Wrong answer.':question.answer);
  next=progress.checkGrammarResponse(next,unit,question.id);
 }
 return progress.finishGrammarRound(next,unit,at);
}
for(const unit of units){
 const empty=progress.emptyGrammarProgress(),questions=progress.grammarRoundQuestions(unit,0),first=questions[0];
 assert(!delayed(empty));
 assert.equal(status(empty),'未开始');
 const seen=progress.markGrammarSeen(empty,now);
 assert.equal(seen.seenAt,now);assert.equal(seen.attempts.length,0);
 assert.equal(status(seen),'已看过 · 尚未检验');assert(!delayed(seen));
 assert.equal(progress.markGrammarSeen(seen,now+1),seen,'Reading again does not overwrite first-seen evidence');
 assert.equal(progress.revisitGrammarTheory(seen),seen,'Reading outside a practice does not invent practice');
 assert.equal(progress.setGrammarAnswer(seen,unit,first.id,first.answer),seen);
 assert.equal(progress.showGrammarHint(seen,unit,first.id),seen);
 assert.equal(progress.checkGrammarResponse(seen,unit,first.id),seen);
 assert.equal(progress.finishGrammarRound(seen,unit,now),seen);
 let round=progress.beginGrammarRound(seen);
 assert.equal(round.round,0);assert(round.inRound);assert.equal(status(round),'练习进行中');
 assert.equal(progress.beginGrammarRound(round),round,'Repeated start preserves the active attempt');
 assert.equal(progress.finishGrammarRound(round,unit,now),round,'Unfilled practice cannot be completed');
 assert.equal(progress.setGrammarAnswer(round,unit,'unknown',first.answer),round);
 assert.equal(progress.showGrammarHint(round,unit,'unknown'),round);
 assert.equal(progress.checkGrammarResponse(round,unit,'unknown'),round);
 round=progress.setGrammarAnswer(round,unit,first.id,'  ');
 assert.equal(progress.checkGrammarResponse(round,unit,first.id),round,'Blank answers cannot be checked');
 for(const question of questions)round=progress.setGrammarAnswer(round,unit,question.id,question.answer);
 assert.equal(progress.finishGrammarRound(round,unit,now),round,'Filled but unchecked answers cannot pass');
 for(const question of questions)round=progress.checkGrammarResponse(round,unit,question.id);
 assert.equal(progress.finishGrammarRound(round,unit,-1),round,'Invalid evidence time cannot be recorded');
 const checked=round;
 round=progress.setGrammarAnswer(round,unit,first.id,'Wrong answer.');
 assert.equal(round.responses[first.id].checkedValue,null);assert.equal(round.responses[first.id].matched,false);
 assert.equal(progress.finishGrammarRound(round,unit,now),round,'Editing an answer cancels its earlier check');
 const finished=progress.finishGrammarRound(checked,unit,now);
 assert.equal(finished.attempts.length,1);assert(finished.attempts[0].passed&&finished.attempts[0].independent);
 assert.equal(status(finished),'本轮独立检验通过');assert(!delayed(finished));
 assert.equal(progress.finishGrammarRound(finished,unit,now+1),finished,'Repeated finish cannot inflate history');
 const next=progress.beginGrammarRound(finished);
 assert.equal(next.round,1);assert.deepEqual(next.responses,{});assert.deepEqual(next.attempts,finished.attempts);assert.equal(next.seenAt,seen.seenAt);
 let hinted=progress.beginGrammarRound(empty);
 for(let i=0;i<5;i++)hinted=progress.showGrammarHint(hinted,unit,first.id);
 assert.equal(hinted.responses[first.id].hintLevel,2);assert(hinted.assisted);
 hinted=progress.readGrammarProgress(JSON.stringify(hinted),unit);
 assert.equal(hinted.responses[first.id].hintLevel,2);assert(hinted.assisted,'Hint use survives reload');
 const hintPass=completeRound(unit,hinted,now);
 assert(hintPass.attempts[0].passed&&!hintPass.attempts[0].independent);
 assert.equal(status(hintPass),'已跟练 · 使用过提示');
 let theory=progress.revisitGrammarTheory(progress.beginGrammarRound(empty));
 theory=progress.readGrammarProgress(JSON.stringify(theory),unit);
 assert(theory.assisted,'Reopening theory remains assisted after reload');
 assert(!completeRound(unit,theory,now).attempts[0].independent);
 const short=completeRound(unit,finished,now+day-1);
 assert(!delayed(short),'Different questions before 24 hours cannot establish delayed evidence');
 const spaced=completeRound(unit,finished,now+day);
 assert(delayed(spaced),'24 hours, a different set and two independent passes establish delayed evidence');
 assert.equal(status(spaced),'延迟异题检验通过');
 assert(!delayed(spaced,now+day-1),'Future second attempts cannot grant delayed evidence early');
 assert.equal(status(spaced,now+day-1),'练习时间待核对');
 assert(!delayed(finished,now-1));assert.equal(status(finished,now-1),'练习时间待核对','A future first attempt cannot grant an independent-pass status');
 const futureReload=progress.readGrammarProgress(JSON.stringify(spaced),unit);
 assert.deepEqual(futureReload.attempts,spaced.attempts,'Future times remain in the draft for correction');
 assert(!delayed(futureReload,now));assert.equal(status(futureReload,now),'练习时间待核对');
 assert(delayed(futureReload,now+day),'Valid evidence becomes available only when its time arrives');
 const midnight=completeRound(unit,empty,Date.parse('2026-10-01T23:59:00Z'));
 assert(!delayed(completeRound(unit,midnight,Date.parse('2026-10-02T00:01:00Z'))),'Calendar rollover alone is not a delay');
 const middle=completeRound(unit,finished,now+100,{wrong:true});
 const same=completeRound(unit,middle,now+2*day);
 assert.equal(same.attempts.at(-1).variant,finished.attempts[0].variant);
 assert(!delayed(same),'Repeating the original set is insufficient');
 assert(!delayed(completeRound(unit,finished,now+day,{hint:true})));
 assert(!delayed(completeRound(unit,finished,now+day,{theory:true})));
 const failed=completeRound(unit,spaced,now+2*day,{wrong:true});
 assert(!delayed(failed),'A latest failed check supersedes earlier passes');
 assert.equal(status(failed),'已练习 · 有题待核对');
 let bounded=progress.emptyGrammarProgress();
 for(let i=0;i<15;i++)bounded=completeRound(unit,bounded,now+i*day);
 assert.equal(bounded.attempts.length,12);
 assert.equal(bounded.attempts[0].round,3);assert.equal(bounded.attempts.at(-1).round,14);
 assert.equal(progress.emptyGrammarProgress().attempts.length,0,'Independent progress values do not share history');
}
console.log('Grammar practice: viewing, bounded progressive hints, theory assistance/reload, checked-answer invalidation, redo/history, duplicate finish, 24-hour boundary, distinct questions and latest failure passed.');

// Execute the real TSX component with an in-memory hook/element harness. There
// is no browser or CSS dependency; event handlers, branches and progress writes
// remain the production code. Only React's rendering primitives and unused
// icon/legacy-explanation components are replaced. Production files stay intact.
let uiSource=await readFile(new URL('grammar-curriculum-ui.tsx',root),'utf8');
uiSource=uiSource.replace("import {useEffect,useRef,useState} from 'react';",'')
 .replace("import {ArrowLeft,ArrowRight,BookOpen,Search} from 'lucide-react';",'const ArrowLeft=()=>null,ArrowRight=()=>null,BookOpen=()=>null,Search=()=>null;')
 .replace("import {GrammarExplanation} from './grammar-explanation-ui';",'const GrammarExplanation=()=>null;')
 .replace("import './grammar-curriculum.css';",'');
for(const match of [...uiSource.matchAll(/^import (?!type )(.+?) from '(\.\/.+?)';/gm)])uiSource=uiSource.replaceAll("'"+match[2]+"'",JSON.stringify(await moduleURL(match[2].slice(2)+'.ts')));
const hookHarness=`
 let hookValues=[],hookIndex=0;
 function useState(initial){const index=hookIndex++;if(!(index in hookValues))hookValues[index]=typeof initial==='function'?initial():initial;return [hookValues[index],value=>{hookValues[index]=typeof value==='function'?value(hookValues[index]):value}];}
 function useEffect(){}
 function useRef(){return {current:null}}
 const testFragment=Symbol.for('grammar-test-fragment');
 function testJSX(type,props,...children){return {type,props:{...props,children}}}
 export function renderUnit(unit,props){hookIndex=0;return GrammarUnitLesson({unit,props,select:()=>{}})}
 export function resetHooks(){hookValues=[];hookIndex=0}
`;
const transpiled=ts.transpileModule(uiSource+hookHarness,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.React,jsxFactory:'testJSX',jsxFragmentFactory:'testFragment',verbatimModuleSyntax:false}}).outputText;
const ui=await import('data:text/javascript;base64,'+Buffer.from(transpiled).toString('base64'));
const children=node=>[node,...(node&&typeof node==='object'?(node.props?.children||[]).flat(Infinity).flatMap(children):[])];
const textOf=node=>children(node).filter(child=>typeof child==='string'||typeof child==='number').join(' ');
const section=(tree,className)=>children(tree).find(node=>node?.props?.className===className);
const button=(tree,text)=>children(tree).find(node=>node?.type==='button'&&textOf(node).includes(text));
let uiChecks=0;
for(const unit of units){
 ui.resetHooks();let state=structuredClone(model.initial),routes=[];
 const props={get state(){return state},update:change=>{state=change(state)},onPracticeGuide:(book,lesson,guideId)=>routes.push({book,lesson,guideId})};
 let tree=ui.renderUnit(unit,props);
 assert(section(tree,'grammar-unit-explanation'));assert.equal(progress.grammarProgressFor(state,unit).attempts.length,0);
 button(tree,'开始三步练习').props.onClick();
 for(const [index,question] of progress.grammarRoundQuestions(unit,0).entries()){
  tree=ui.renderUnit(unit,props);const practice=section(tree,'grammar-progressive-practice');
  assert(practice);assert(!section(tree,'grammar-round-result'));
  assert(textOf(practice).includes(question.prompt));
  assert(!textOf(practice).includes(question.explanation),'Active practice does not display the reference explanation');
  assert(!textOf(practice).includes('与参考一致')&&!textOf(practice).includes('查看参考与解释'),'Mid-round checking remains private');
  if(question.kind==='recognise'){
   const label=children(practice).find(node=>node?.type==='label'&&textOf(node)===question.answer);
   children(label).find(node=>node?.type==='input').props.onChange();
  }else{
   assert(!textOf(practice).includes(question.answer),'The reference sentence is hidden before submission');
   children(practice).find(node=>node?.type==='textarea').props.onChange({target:{value:question.answer}});
  }
  tree=ui.renderUnit(unit,props);
  button(tree,index===2?'提交本轮':'记录这一题').props.onClick();
  const record=progress.grammarProgressFor(state,unit);
  assert.equal(record.responses[question.id].checkedValue,question.answer);
  assert.equal(record.attempts.length,index===2?1:0,'Intermediate answer recording cannot count a completed round');
  uiChecks++;
 }
 tree=ui.renderUnit(unit,props);const result=section(tree,'grammar-round-result');
 assert(result);assert(!section(tree,'grammar-progressive-practice'));
 for(const question of progress.grammarRoundQuestions(unit,0))assert(textOf(result).includes(question.answer)&&textOf(result).includes(question.explanation),'Feedback appears after the complete three-item submission');
 assert(progress.grammarProgressFor(state,unit).attempts[0].independent);
 const transfer=section(tree,'grammar-transfer-links');
 for(const guideId of unit.guideIds){
  button(transfer,textbook.grammarGuides[guideId].title).props.onClick();
  const route=routes.at(-1);
  assert.equal(route.guideId,guideId);
  assert(textbook.grammarGuidesFor(textbook.grammarEntryFor(route.book,route.lesson)).some(guide=>guide.id===guideId),'Every transfer button opens its selected guide in a real associated lesson');
 }
 button(result,'换一组题重做').props.onClick();
 tree=ui.renderUnit(unit,props);const repeated=progress.grammarProgressFor(state,unit);
 assert.equal(repeated.round,1);assert.equal(repeated.attempts.length,1);assert.deepEqual(repeated.responses,{});
 assert(!section(tree,'grammar-round-result'));assert(textOf(section(tree,'grammar-progressive-practice')).includes(progress.grammarRoundQuestions(unit,1)[0].prompt));
 button(tree,'先给一点提示').props.onClick();tree=ui.renderUnit(unit,props);
 button(tree,'再给一点帮助').props.onClick();tree=ui.renderUnit(unit,props);
 assert(button(tree,'再给一点帮助').props.disabled,'The second progressive hint is the maximum');
 button(tree,'回看讲解（本轮记为跟练）').props.onClick();tree=ui.renderUnit(unit,props);
 assert(section(tree,'grammar-unit-explanation'));
 ui.resetHooks();tree=ui.renderUnit(unit,props);
 assert(section(tree,'grammar-progressive-practice'),'Reload resumes the active round');
 assert(progress.grammarProgressFor(state,unit).assisted);
 assert.equal(progress.grammarProgressFor(state,unit).responses[progress.grammarRoundQuestions(unit,1)[0].id].hintLevel,2,'Hint assistance survives the rendered reload');
}
console.log(`Grammar UI: ${uiChecks} real answer events, no mid-round feedback leak, complete-round results, alternate-set redo, hint ceiling/reload and selected-guide transfer callbacks passed.`);

const firstUnit=units[0],firstQuestion=progress.grammarRoundQuestions(firstUnit,0)[0];
for(const raw of [undefined,'{bad','null','[]','42','"draft"','{"version":0}','{"version":2}'])assert.deepEqual(progress.readGrammarProgress(raw,firstUnit),progress.emptyGrammarProgress(),'Malformed or unsupported optional records safely show an empty practice');
const invalidRaw=JSON.stringify({version:1,contentVersion:curriculum.grammarCurriculumVersion,seenAt:-1,round:-1,inRound:'yes',assisted:1,
 responses:{[firstQuestion.id]:{value:'x'.repeat(2000),checkedValue:firstQuestion.answer,matched:false,hintLevel:99},unknown:{value:'kept?'}},
 attempts:[null,{at:-1,round:0,variant:0,passed:true,independent:true},{at:now,round:1,variant:1,passed:true,independent:true},{at:now,round:0,variant:1,passed:true,independent:true},{at:now,round:0,variant:0,passed:'yes',independent:true}],});
const invalid=progress.readGrammarProgress(invalidRaw,firstUnit);
assert.equal(invalid.seenAt,0);assert.equal(invalid.round,0);assert(!invalid.inRound&&!invalid.assisted);
assert.equal(invalid.responses[firstQuestion.id].value.length,1000);assert.equal(invalid.responses[firstQuestion.id].hintLevel,2);
assert.equal(invalid.responses[firstQuestion.id].matched,true,'Correctness is recomputed from the actual checked answer');
assert.equal(invalid.responses.unknown,undefined);assert.deepEqual(invalid.attempts,[]);
const forged=progress.readGrammarProgress(JSON.stringify({...progress.emptyGrammarProgress(),inRound:true,responses:{[firstQuestion.id]:{value:'Wrong answer.',checkedValue:'Wrong answer.',hintLevel:-99,matched:true}}}),firstUnit);
assert(!forged.responses[firstQuestion.id].matched,'A persisted boolean cannot pass a wrong answer');
assert.equal(forged.responses[firstQuestion.id].hintLevel,0);
const oldContent=JSON.stringify({...completeRound(firstUnit,progress.emptyGrammarProgress(),now),contentVersion:curriculum.grammarCurriculumVersion-1,seenAt:now});
const migrated=progress.readGrammarProgress(oldContent,firstUnit);
assert.equal(migrated.seenAt,now);assert.equal(migrated.contentVersion,curriculum.grammarCurriculumVersion);
assert.deepEqual(migrated.attempts,[]);assert.deepEqual(migrated.responses,{});assert(!migrated.inRound);
assert(!delayed(migrated),'An earlier content version retains reading history without certifying the revised exercises');

let legacy=structuredClone(model.initial);
legacy={...legacy,completed:[1,3],lastLesson:3,nce:{'NCE1-99':{title:'User title',text:'User text',notes:'Original notes',steps:['listen'],review:{checks:['meaning'],checkedAt:now,dueAt:now+day}}},nceLast:{book:'NCE1',lesson:99},nceEdition:'85',
 personalWords:[{word:'library',meaning:'图书馆',example:'We met at the library.'}],cards:{library:{box:2,due:now}},scores:{'unit-1':75},mistakes:{q1:{id:'q1',type:'input',prompt:'I … ready.',answer:'am',explanation:'I am ready.'}},days:['2026-10-01'],attempts:3,correct:2,
 drafts:{'expression-NCE1-99':'Original free-expression draft','nce-guide-NCE1-99':'{"step":3,"own":"My own unchecked sentence."}','ielts-writing':'Original essay'},custom:[{id:'mine',title:'User material',text:'An original custom text.'}]};
const oldGoal={...learning.emptyGoal(),worked:true,answer:'I work.',transfer:'My original paragraph.',checkedTransfer:'My original paragraph.',attempts:[{at:now,variant:0,matched:true,hinted:false},{at:now+day,variant:1,matched:true,hinted:false}]};
legacy=learning.updateGoal(legacy,'NCE1',49,'present-simple',()=>oldGoal);
assert(learning.stableEvidence(learning.learningFor(legacy,'NCE1',49).goals['present-simple']),'Fixture contains established legacy course evidence');
const legacySnapshot=structuredClone(legacy);
for(const unit of units){
 const read=progress.grammarProgressFor(legacy,unit);
 assert.deepEqual(read,progress.emptyGrammarProgress());assert(!delayed(read),'Existing learning and expression records are not promoted to new unit mastery');
}
assert.deepEqual(legacy,legacySnapshot,'Reading legacy evidence cannot mutate user records');
assert.equal(progress.updateGrammarProgress(legacy,'unknown',record=>record),legacy);
const key=progress.grammarProgressKey(firstUnit.id);
for(const future of [{version:2,opaque:'Future grammar data'},{version:1,contentVersion:curriculum.grammarCurriculumVersion+1,opaque:'Future content data'}]){
 const state={...legacy,drafts:{...legacy.drafts,[key]:JSON.stringify(future)}};
 assert(progress.grammarProgressNeedsNewerVersion(state.drafts[key]),'The UI can explain why a newer record is read-only');
 assert.equal(progress.updateGrammarProgress(state,firstUnit.id,progress.beginGrammarRound),state,'Updates preserve unsupported future records verbatim');
 const imported=await files.readProgressFile(files.makeProgressFile(state,new Date(now)));
 assert.equal(imported.state.drafts[key],state.drafts[key]);
}
assert(!progress.grammarProgressNeedsNewerVersion(undefined));assert(!progress.grammarProgressNeedsNewerVersion('{bad'));
let state=legacy;
for(const unit of units){
 state=progress.updateGrammarProgress(state,unit.id,record=>progress.markGrammarSeen(record,now));
 state=progress.updateGrammarProgress(state,unit.id,record=>completeRound(unit,record,now));
 state=progress.updateGrammarProgress(state,unit.id,record=>completeRound(unit,record,now+day));
 assert(delayed(progress.grammarProgressFor(state,unit)));
 assert(state.drafts[progress.grammarProgressKey(unit.id)].length<6500,'One bounded unit record fits comfortably in the existing draft namespace');
}
assert.deepEqual(legacy,legacySnapshot,'Writing new progress never mutates the previous State');
for(const [field,value] of Object.entries(legacy))if(field!=='drafts')assert.deepEqual(state[field],value,`Unrelated State.${field} is preserved`);
for(const [draft,value] of Object.entries(legacy.drafts))assert.equal(state.drafts[draft],value,'Old text and LearningRecord drafts remain byte-for-byte unchanged');
assert(model.validateState(state));
const file=files.makeProgressFile(state,new Date(now));
assert(file.size<128*1024,'All eight grammar units plus legacy fixtures stay far below the 25 MB backup limit');
const imported=await files.readProgressFile(file);
assert.deepEqual(imported.state,state);assert.equal(imported.savedAt,new Date(now).toISOString());
for(const unit of units)assert.deepEqual(progress.grammarProgressFor(imported.state,unit),progress.grammarProgressFor(state,unit));
assert.deepEqual((await files.readProgressFile(new Blob([JSON.stringify(state)]))).state,state,'Plain legacy export is still readable');
const retry=progress.updateGrammarProgress(imported.state,firstUnit.id,progress.beginGrammarRound);
assert.deepEqual(progress.grammarProgressFor(retry,firstUnit).responses,{});
assert.equal(progress.grammarProgressFor(retry,firstUnit).attempts.length,2);
for(const [draft,value] of Object.entries(legacy.drafts))assert.equal(retry.drafts[draft],value,'Redo preserves old expression drafts and course history');
const malformed={...legacy,drafts:{...legacy.drafts,[key]:'{bad'}};
const repaired=progress.updateGrammarProgress(malformed,firstUnit.id,record=>progress.markGrammarSeen(record,now));
assert.equal(progress.grammarProgressFor(repaired,firstUnit).seenAt,now);assert.equal(malformed.drafts[key],'{bad');
const upgraded=progress.updateGrammarProgress({...legacy,drafts:{...legacy.drafts,[key]:oldContent}},firstUnit.id,progress.beginGrammarRound);
assert(!delayed(progress.grammarProgressFor(upgraded,firstUnit)));
assert.equal(progress.grammarProgressFor(upgraded,firstUnit).seenAt,now);
const futureTime=progress.updateGrammarProgress(legacy,firstUnit.id,record=>completeRound(firstUnit,completeRound(firstUnit,record,now+day),now+2*day));
const futureTimeImport=(await files.readProgressFile(files.makeProgressFile(futureTime,new Date(now)))).state;
assert.deepEqual(progress.grammarProgressFor(futureTimeImport,firstUnit).attempts,progress.grammarProgressFor(futureTime,firstUnit).attempts,'Clock-skewed timestamps survive the real progress export');
assert(!delayed(progress.grammarProgressFor(futureTimeImport,firstUnit),now));
assert.equal(status(progress.grammarProgressFor(futureTimeImport,firstUnit),now),'练习时间待核对');
const longAnswers=progress.updateGrammarProgress(legacy,firstUnit.id,record=>{
 let next=progress.beginGrammarRound(record);
 for(const question of progress.grammarRoundQuestions(firstUnit,next.round))next=progress.setGrammarAnswer(next,firstUnit,question.id,'练'.repeat(2000));
 return next;
});
const longImport=(await files.readProgressFile(files.makeProgressFile(longAnswers,new Date(now)))).state;
for(const response of Object.values(progress.grammarProgressFor(longImport,firstUnit).responses))assert.equal(response.value.length,1000);
assert.equal(JSON.stringify(model.initial),pristine);
console.log(`Grammar persistence: malformed/future/content-version compatibility, no legacy mastery migration, preserved State and drafts, bounded history/answers, real makeProgressFile/readProgressFile roundtrip (${file.size} bytes) passed.`);
if(corePreview)console.log('CORE PREVIEW ONLY: run again without --core-preview before delivery to require the full eight-unit curriculum.');
