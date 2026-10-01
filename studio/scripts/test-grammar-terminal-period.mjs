import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import ts from 'typescript';

// Import the registered v21 curriculum and real progress/matching code. No
// isolated answer adapter or substitute matcher can satisfy this regression.
const root=new URL('../app/',import.meta.url),cache=new Map();
async function moduleURL(name){
 if(cache.has(name))return cache.get(name);
 let source=await readFile(new URL(name,root),'utf8');
 if(name==='progress-file.ts')source=source.replace("import {State, validateState} from './model';","import {validateState} from './model';");
 for(const match of [...source.matchAll(/^import (?!type )(.+?) from '(\.\/.+?)';/gm)]){
  const dependency=match[2].slice(2);
  if(dependency.endsWith('.json'))source=source.replace(match[0],`const ${match[1]}=${await readFile(new URL(dependency,root),'utf8')};`);
  else source=source.replaceAll("'"+match[2]+"'",JSON.stringify(await moduleURL(dependency+'.ts')));
 }
 const url='data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64');
 cache.set(name,url);return url;
}
const model=await import(await moduleURL('model.ts'));
const curriculum=await import(await moduleURL('grammar-curriculum.ts'));
const progress=await import(await moduleURL('grammar-curriculum-progress.ts'));
const clauses=await import(await moduleURL('grammar-clause-answer.ts'));
const remaining=await import(await moduleURL('grammar-remaining-answer.ts'));
const learning=await import(await moduleURL('learning-plan.ts'));
const files=await import(await moduleURL('progress-file.ts'));
const units=curriculum.grammarUnits,questions=units.flatMap(unit=>unit.practices);
const byId=new Map(questions.map(question=>[question.id,question]));
const match=(id,value)=>{
 const question=byId.get(id);assert(question,`Actual registered question: ${id}`);
 return progress.grammarAnswerMatches(question,value);
};
const terminal=(value,period)=>value.replace(/[.。](\s*)$/,period+'$1');
const now=Date.parse('2026-10-01T12:00:00Z'),day=24*60*60*1000;
assert.equal(units.length,28);assert.equal(questions.length,168);
assert.equal(questions.flatMap(question=>question.accepted||[]).length,137);
for(const question of questions)for(const value of [question.answer,...(question.accepted||[])]){
 assert(progress.grammarAnswerMatches(question,value),`${question.id}: canonical/explicit accepted answer`);
}
console.log('Baseline gate: 28 registered units; all 168 canonical answers and 137 explicit accepted variants match.');

// The user's exact U1 / second-group / Q3 reproduction must fail before the fix.
assert(match('core-p1',"We're at home."));
console.log(`U1 group 2 Q3 reproduction: ASCII=${match('core-p1',"We're at home.")}; Chinese=${match('core-p1',"We're at home。")}`);
assert(match('core-p1',"We're at home。"),'REGRESSION: a terminal Chinese full stop must match the accepted contraction');
for(const value of ['We are at home。',"  WE’RE   AT HOME。 \n",'We are at home',"We're at home."]){
 assert(match('core-p1',value),'U1 equivalent final punctuation, contraction, case and spaces');
}
assert(!learning.answerMatches("We're at home。",'We are at home.'),'The shared lesson matcher retains its previous contract');

let equivalentChecks=0,distractorChecks=0;
for(const question of questions){
 for(const value of [question.answer,...(question.accepted||[])]){
  for(const variant of [value,'  '+value.toUpperCase()+'  ',terminal(value,'.'),terminal(value,'。')+' \n']){
   assert(progress.grammarAnswerMatches(question,variant),`${question.id}: equivalent final full stop`);equivalentChecks++;
  }
 }
 for(const option of question.options||[]){
  if(option===question.answer)continue;
  for(const variant of [option,terminal(option,'。')]){
   assert(!progress.grammarAnswerMatches(question,variant),`${question.id}: a distractor stays incorrect`);distractorChecks++;
  }
 }
}
// No current question uses slash references. These bounded contract cases
// protect the existing shared matcher's supported per-reference alternative form.
const slashPractice={...byId.get('core-p1'),answer:'We are at home。 / We are at school。',accepted:['We are at work。 / We are at the office。']};
for(const value of ["We're at home。",'We are at school.','We are at work。','We are at the office.'])assert(progress.grammarAnswerMatches(slashPractice,value));
assert(!progress.grammarAnswerMatches(slashPractice,'We are at the park。'));
const internalReference={...byId.get('core-p1'),answer:'We are at home。 We are ready。',accepted:[]};
assert(progress.grammarAnswerMatches(internalReference,'We are at home。 We are ready.'));
assert(!progress.grammarAnswerMatches(internalReference,'We are at home. We are ready.'),'Internal Chinese punctuation is retained');

// One finite answer counterexample per unit, plus U1, negation, key elements,
// ambiguity-free tense errors and terminal/internal-punctuation boundary cases.
const wrongStructures=[
 ['core-p1','We at home.'],['core-p1','We is at home.'],['core-p1','We were at home.'],['core-p1','We are home.'],['core-p1','We are not at home.'],
 ['core-p1','We are at home。。'],['core-p1','We are at home。.'],['core-p1','We are。 at home.'],['core-p1','We are at home。 extra'],['core-p1','We are at home．'],
 ['question-p1','We did visit the gallery yesterday.'],['question-f0','Did Tom bought a ticket?'],
 ['noun-reference-v0-repair','We need three equipments for the lab.'],
 ['present-f0','Ravi cooks dinner now.'],['past-present-perfect-v0-repair','I have sent the booking form yesterday.'],
 ['comparisons-v1-produce','These shoes are big enough for me.'],
 ['modal-choice-v0-produce','You must use a camera in this room.'],
 ['linking-ideas-v0-produce','We took another road although the bridge was closed.'],
 ['plan-timeline-v1-repair','We will begin until the electrician arrives.'],
 ['passive-focus-v0-repair','The spare keys can borrowed.'],
 ['reported-perspective-v0-produce','Could you tell me what time does the shuttle leave?'],
 ['verb-complements-v0-repair','We are looking forward to meet the new neighbours.'],
 ['negative-precision-v0-repair','There are seats available.'],
 ['past-background-v1-repair','By the time the guests arrived, Ema baked the bread.'],
 ['modal-evidence-v0-produce','The technician must replace the battery.'],
 ['relative-reference-v0-repair','The mechanic fitted the lock gave me a receipt.'],
 ['hypothetical-condition-v0-produce','If we had booked a table, we could eat on the terrace last night.'],
 ['information-focus-v1-produce','No sooner the coordinator had sent the agenda than the meeting time changed.'],
 ['reference-ownership-v0-repair','The blue helmet is her.'],
 ['basic-descriptions-v0-repair','Where Rosa comes from?'],
 ['giving-directions-v0-produce','Put the tickets into the recycling box.'],
 ['time-perspective-v0-produce','We have inflated the balloons yet.'],
 ['habit-change-v0-repair',"I'm used to carry fragile boxes."],
 ['linked-vocabulary-v0-repair','Please put off it until next month.'],
 ['extended-timeline-v1-repair','By noon tomorrow, we will sealed the boxes.'],
 ['duration-perspective-v1-repair','By August, she will have coaching the team for a year.'],
 ['requests-nonfinite-v1-produce','The costumes having delivered by the courier, the performers began the rehearsal at noon.'],
 ['structure-rewrite-v0-produce','According to the work schedule, the acoustic panels will installed by the team by Saturday morning.'],
 ['structure-rewrite-v1-produce','The trolley was too wide for Pavel to wheel through the gate. Pavel was asked by the manager to remove the gate.'],
 ['structure-rewrite-v0-produce','The acoustic panels will have been installed by the team by Saturday morning.'],
];
assert.equal(new Set(wrongStructures.map(([id])=>units.find(unit=>unit.practices.some(question=>question.id===id)).id)).size,28);
for(const [id,value] of wrongStructures)for(const variant of [value,terminal(value,'。')])assert(!match(id,variant),`${id}: retained wrong structure/key element/tense/punctuation`);

const commaIds=[...clauses.grammarClauseCommaSensitiveIds,...remaining.grammarRemainingCommaSensitiveIds];
const sentenceIds=[...clauses.grammarClauseSentenceSensitiveIds,...remaining.grammarRemainingSentenceSensitiveIds];
assert.equal(commaIds.length,10);assert.equal(sentenceIds.length,2);
const boundaryErrors=[];
for(const id of commaIds){
 const answer=byId.get(id).answer;
 const missing=answer.includes(',')?answer.replaceAll(',',''):answer.replace(/ /,', ');
 const moved=answer.replace(',','').replace(/(\S+\s+\S+) /,'$1, ');
 for(const value of [missing,moved,answer+',',answer.replaceAll(',',';')]){
  if(value===answer)continue;
  assert(!match(id,value)&&!match(id,terminal(value,'。')),`${id}: required comma boundary remains strict`);
  boundaryErrors.push([id,terminal(value,'。')]);
 }
 assert(match(id,answer.replaceAll(',','，').replaceAll('.','。')),`${id}: existing Chinese equivalent punctuation`);
}
for(const id of sentenceIds){
 const answer=byId.get(id).answer;
 for(const value of [answer.replace('. ',' '),answer.replace('. ','; '),answer.replace('.','').replace(/^(\S+) /,'$1. ')]){
  assert(!match(id,value)&&!match(id,terminal(value,'。')),`${id}: missing/replaced/moved internal sentence boundary`);
  boundaryErrors.push([id,terminal(value,'。')]);
 }
 assert(match(id,answer.replaceAll('.','。')));assert(match(id,answer.replace(/\.$/,'')));
}
function checkedRound(unit,round,targetId,value){
 let record={...progress.emptyGrammarProgress(),round,inRound:true};
 for(const question of progress.grammarRoundQuestions(unit,round)){
  record=progress.setGrammarAnswer(record,unit,question.id,question.id===targetId?value:question.answer);
  record=progress.checkGrammarResponse(record,unit,question.id);
 }
 return record;
}
for(const [id,value] of [...wrongStructures,...boundaryErrors]){
 const unit=units.find(unit=>unit.practices.some(question=>question.id===id)),question=byId.get(id);
 let record=checkedRound(unit,question.variant,id,terminal(value,'。'));
 assert(!record.responses[id].matched);
 record=progress.readGrammarProgress(JSON.stringify({...record,responses:{...record.responses,[id]:{...record.responses[id],matched:true}}}),unit);
 assert(!record.responses[id].matched,'Reload rechecks the answer instead of trusting a saved boolean');
 assert(!progress.finishGrammarRound(record,unit,now).attempts.at(-1).passed,'An incorrect structure or required boundary cannot pass a round');
}
console.log(`Matcher matrix: ${equivalentChecks} equivalence assertions (305 actual references x 4); ${distractorChecks} distractor checks; ${wrongStructures.length} bounded answer/key-element counterexamples spanning all 28 units; ${boundaryErrors.length} strict boundary cases passed.`);

const unit=units[0],key=progress.grammarProgressKey(unit.id),value="We're at home。";
const oldRecord={...checkedRound(unit,1,'core-p1',value),seenAt:now-day,assisted:true,attempts:[{at:now-day,round:0,variant:0,passed:false,independent:true}]};
oldRecord.responses['core-p1']={...oldRecord.responses['core-p1'],matched:false,hintLevel:2};
const raw=JSON.stringify(oldRecord),reloaded=progress.readGrammarProgress(raw,unit);
assert(reloaded.responses['core-p1'].matched);
assert.equal(reloaded.responses['core-p1'].value,value);assert.equal(reloaded.responses['core-p1'].checkedValue,value);
assert.equal(reloaded.responses['core-p1'].hintLevel,2);assert(reloaded.assisted);
assert.deepEqual(reloaded.attempts,oldRecord.attempts,'Historical failed attempts are not promoted by a punctuation fix');
assert(!progress.delayedGrammarEvidence(reloaded,now+day));
const historical=progress.readGrammarProgress(JSON.stringify({...oldRecord,inRound:false,attempts:[{at:now,round:1,variant:1,passed:false,independent:true}]}),unit);
assert.equal(progress.grammarProgressStatus(historical,now),'已练习 · 有题待核对');
const legacy={...structuredClone(model.initial),nce:{'NCE1-1':{title:'Old lesson',text:'Old text',notes:'Original note',steps:['listen']}},cards:{original:{box:2,due:now}},drafts:{[key]:raw,'expression-NCE1-1':'Original unchecked expression','ielts-writing':'Original essay'}};
const snapshot=structuredClone(legacy);
const updated=progress.updateGrammarProgress(legacy,unit.id,record=>record);
assert.deepEqual(legacy,snapshot,'Reading/updating progress does not mutate the input state');
const unrelated=state=>({...state,drafts:Object.fromEntries(Object.entries(state.drafts).filter(([id])=>id!==key))});
assert.deepEqual(unrelated(updated),unrelated(snapshot));
assert.equal(JSON.parse(updated.drafts[key]).responses['core-p1'].value,value);
assert.deepEqual((await files.readProgressFile(files.makeProgressFile(updated,new Date(now)))).state,updated);
assert.deepEqual((await files.readProgressFile(new Blob([JSON.stringify(snapshot)]))).state,snapshot);
const capability={version:1,unchanged:'opaque backup namespace'};
const exported=await files.readProgressFile(files.makeProgressFile(updated,new Date(now),capability));
assert.deepEqual(exported.state,updated);assert.deepEqual(exported.capability,capability);
const older=progress.readGrammarProgress(JSON.stringify({...oldRecord,contentVersion:0}),unit);
assert.equal(older.seenAt,oldRecord.seenAt);assert.deepEqual(older.attempts,[]);assert.deepEqual(older.responses,{});
const newer={...legacy,drafts:{...legacy.drafts,[key]:JSON.stringify({...oldRecord,version:2})}};
assert.equal(progress.updateGrammarProgress(newer,unit.id,record=>record),newer,'Unsupported newer progress is kept intact');
const seen=progress.markGrammarSeen(progress.emptyGrammarProgress(),now);
assert.equal(progress.grammarProgressStatus(seen,now),'已看过 · 尚未检验');assert(!progress.delayedGrammarEvidence(seen,now+day));
const completed=progress.finishGrammarRound(checkedRound(unit,1,'core-p1',value),unit,now);
assert(completed.attempts.at(-1).passed&&completed.attempts.at(-1).independent);assert(!progress.delayedGrammarEvidence(completed,now+day));
const assisted=progress.finishGrammarRound(reloaded,unit,now);assert(assisted.attempts.at(-1).passed&&!assisted.attempts.at(-1).independent);
const redo=progress.beginGrammarRound(completed);assert.equal(redo.round,2);assert.deepEqual(redo.responses,{});assert.deepEqual(redo.attempts,completed.attempts);
console.log('Progress: raw Chinese answer, hints, old attempts, unrelated drafts/cards/notes, v1/v2 backup payloads, older/newer records and redo are preserved; viewing is not mastery.');

// Exercise the real TSX event handlers for the exact U1 group 2 Q3 sequence.
let source=await readFile(new URL('grammar-curriculum-ui.tsx',root),'utf8');
source=source.replace("import {useEffect,useRef,useState} from 'react';",'')
 .replace("import {ArrowLeft,ArrowRight,BookOpen,Search} from 'lucide-react';",'const ArrowLeft=()=>null,ArrowRight=()=>null,BookOpen=()=>null,Search=()=>null;')
 .replace("import {GrammarExplanation} from './grammar-explanation-ui';",'const GrammarExplanation=()=>null;')
 .replace("import './grammar-curriculum.css';",'');
for(const imported of [...source.matchAll(/^import (?!type )(.+?) from '(\.\/.+?)';/gm)])source=source.replaceAll("'"+imported[2]+"'",JSON.stringify(await moduleURL(imported[2].slice(2)+'.ts')));
const harness=`
 let hooks=[],index=0;
 function useState(initial){const slot=index++;if(!(slot in hooks))hooks[slot]=typeof initial==='function'?initial():initial;return [hooks[slot],value=>{hooks[slot]=typeof value==='function'?value(hooks[slot]):value}];}
 function useEffect(){} function useRef(){return {current:null}}
 const testFragment=Symbol.for('grammar-terminal-period-test');
 function testJSX(type,props,...children){return {type,props:{...props,children}}}
 export function render(unit,props){index=0;return GrammarUnitLesson({unit,props,select:()=>{}})}
 export function reset(){hooks=[];index=0}
`;
const js=ts.transpileModule(source+harness,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.React,jsxFactory:'testJSX',jsxFragmentFactory:'testFragment',verbatimModuleSyntax:false}}).outputText;
const ui=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const nodes=node=>[node,...(node&&typeof node==='object'?(node.props?.children||[]).flat(Infinity).flatMap(nodes):[])];
const textOf=node=>nodes(node).filter(child=>typeof child==='string'||typeof child==='number').join(' ');
const section=(tree,name)=>nodes(tree).find(node=>node?.props?.className===name);
const button=(tree,label)=>nodes(tree).find(node=>node?.type==='button'&&textOf(node).includes(label));
let state=progress.updateGrammarProgress(model.initial,unit.id,record=>({...record,round:1,inRound:true}));
const props={get state(){return state},update:change=>{state=change(state)}};
for(const [position,question] of progress.grammarRoundQuestions(unit,1).entries()){
 let tree=ui.render(unit,props);const practice=section(tree,'grammar-progressive-practice');assert(practice);
 assert(!textOf(practice).includes('与参考一致')&&!section(tree,'grammar-round-result'));
 if(question.options){
  const label=nodes(practice).find(node=>node?.type==='label'&&textOf(node)===question.answer);
  nodes(label).find(node=>node?.type==='input').props.onChange();
 }else nodes(practice).find(node=>node?.type==='textarea').props.onChange({target:{value:question.id==='core-p1'?value:question.answer}});
 tree=ui.render(unit,props);button(tree,position===2?'提交本轮':'记录这一题').props.onClick();
}
let result=section(ui.render(unit,props),'grammar-round-result');assert(result);
const production=nodes(result).find(node=>node?.type==='li'&&textOf(node).includes(byId.get('core-p1').prompt));assert(production);
assert(textOf(production).includes('与参考一致')&&!textOf(production).includes('待核对'));
assert(textOf(production).includes(value));
ui.reset();const reloadedTree=ui.render(unit,props);
assert.equal(textOf(section(reloadedTree,'grammar-status')),'本轮独立检验通过');
assert.equal(progress.grammarProgressFor(state,unit).responses['core-p1'].checkedValue,value,'Reload keeps the raw answer and corrected check');
button(reloadedTree,'换一组题再练').props.onClick();assert(section(ui.render(unit,props),'grammar-progressive-practice'));
assert.deepEqual(progress.grammarProgressFor(state,unit).responses,{});
console.log('Production TSX regression: U1 second-group Q3 submits the exact Chinese-period contraction, shows 与参考一致, reloads and starts a new group successfully.');
