import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {stripTypeScriptTypes} from 'node:module';
import ts from 'typescript';

// Source-driven loader: no user profile, generated assets, browser storage or clock.
const root=new URL('../app/',import.meta.url),cache=new Map();
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
const {grammarUnits}=await import(await moduleURL('grammar-curriculum.ts'));
const progress=await import(await moduleURL('grammar-curriculum-progress.ts'));
const {grammarAnswerMatches}=progress;
const practices=grammarUnits.flatMap(unit=>unit.practices),byId=new Map(practices.map(q=>[q.id,q]));
// Frozen ordered [id, reference] digest from c6b9b01. Extensions may add accepted
// forms; none of the original 168 identities or canonical answers may change.
assert.equal(practices.length,168);
const canonicalDigest=createHash('sha256').update(JSON.stringify(practices.map(q=>[q.id,q.answer]))).digest('hex');
assert.equal(canonicalDigest,'0d0a0f94d8a72361e79c6730c88e6fe719da81b03dcaa52ba466ca8ca3d0fedc');
let accepted=0,options=0;
for(const q of practices){
 assert(grammarAnswerMatches(q,q.answer),`${q.id}: original reference`);
 for(const answer of q.accepted||[]){assert(grammarAnswerMatches(q,answer),`${q.id}: accepted reference`);accepted++}
 if(q.options){assert.equal(q.options.filter(value=>grammarAnswerMatches(q,value)).length,1,`${q.id}: exactly one choice`);options+=q.options.length}
 assert(!grammarAnswerMatches(q,''));assert(!grammarAnswerMatches(q,'This is unrelated.'));
}
const positive=[
 ['time-perspective-v0-produce','We have not yet inflated the balloons.'],
 ['time-perspective-v0-produce',"We haven't yet inflated the balloons."],
 ['time-perspective-v0-produce',"We've not yet inflated the balloons."],
 ['time-perspective-v0-produce','We have not inflated the balloons yet.'],
 ['linked-vocabulary-v1-produce','Everyone except the photographer turned up.'],
 ['linked-vocabulary-v1-produce','Everyone except for the photographer turned up.'],
 ['linked-vocabulary-v1-produce','Everyone turned up except for the photographer.'],
 ['giving-directions-v0-produce',"Don't put the tickets in the recycling box."],
 ['giving-directions-v0-produce','Do not put the tickets in the recycling box.'],
 ['giving-directions-v0-produce','Do not put the tickets into the recycling box.'],
 ['linked-vocabulary-v1-produce','Everyone but the photographer turned up.'],
 ['linked-vocabulary-v1-produce','Everyone turned up but the photographer.'],
 ['linked-vocabulary-v1-produce','Everyone other than the photographer turned up.'],
 ['linked-vocabulary-v1-produce','Except for the photographer, everyone turned up.'],
 ['linked-vocabulary-v1-produce','Apart from the photographer, everyone turned up.'],
 ['linked-vocabulary-v1-produce','Everyone turned up apart from the photographer.'],
 ['linked-vocabulary-v1-produce','Everyone had turned up except the photographer.'],
 ['linked-vocabulary-v1-produce','Everyone had turned up except for the photographer.'],
 ['linked-vocabulary-v1-produce','Everyone except the photographer had turned up.'],
 ['linked-vocabulary-v1-produce','Everyone except for the photographer had turned up.'],
 ['giving-directions-v0-produce',"Please don't put the tickets into the recycling box."],
 ['giving-directions-v0-produce',"Please don't put the tickets in the recycling box."],
 ['giving-directions-v0-produce',"Don't put the tickets into the recycling box, please."],
 ['giving-directions-v0-produce',"Don't put the tickets in the recycling box, please."],
];
const negative=[
 ['time-perspective-v0-produce','We have yet inflated the balloons.'],
 ['time-perspective-v0-produce','We did not inflate the balloons yet.'],
 ['time-perspective-v0-produce','We have not yet inflate the balloons.'],
 ['time-perspective-v0-produce','We have not already inflated the balloons.'],
 ['time-perspective-v0-produce','We have not yet inflated the balloons yesterday.'],
 ['linked-vocabulary-v1-produce','Everyone besides the photographer turned up.'],
 ['linked-vocabulary-v1-produce','Everyone except the photographer turns up.'],
 ['linked-vocabulary-v1-produce','Everyone except the photographer did not turn up.'],
 ['linked-vocabulary-v1-produce','No one except the photographer turned up.'],
 ['giving-directions-v0-produce','Put the tickets in the recycling box.'],
 ['giving-directions-v0-produce',"Don't put the tickets on the recycling box."],
 ['giving-directions-v0-produce',"Don't to put the tickets in the recycling box."],
 ['giving-directions-v0-produce',"Don't put the tickets out of the recycling box."],
 ['giving-directions-v0-produce',"You mustn't put the tickets into the recycling box."],
 ['linked-vocabulary-v1-produce','Everyone has turned up except the photographer.'],
 ['linked-vocabulary-v1-produce','Everyone was turning up except the photographer.'],
 ['linked-vocabulary-v1-produce','Everyone turned up including the photographer.'],
 ['time-perspective-v0-produce',"Yet we haven't inflated the balloons."],
 ['time-perspective-v1-produce','When we arrived at the cabin, our host has repaired the roof two days before.'],
 ['time-perspective-v1-produce','When we arrived at the cabin, our host had repaired the roof two days ago.'],
 ['relative-reference-v0-produce','The torch, I borrowed from the ranger, still works.'],
 ['relative-reference-v1-repair','Ethan who works at the repair café knows the owner.'],
 ['relative-reference-v1-produce','Noa, whose sketches are in the foyer, will lead the workshop on Sunday The participants have received their materials, which reassures the organisers.'],
 ['requests-nonfinite-v0-produce','Having counted the tokens Mila sealed the pouch.'],
 ['structure-rewrite-v1-produce','The trolley was too wide for Pavel to wheel through the gate Pavel was asked by the manager not to remove the gate.'],
];
const expectGaps=process.argv.includes('--expect-gaps');
let gaps=0;
for(const [id,value] of positive){
 const matches=grammarAnswerMatches(byId.get(id),value);
 if(expectGaps){if(!matches){gaps++;console.log(`REPRODUCED ${id}: ${value}`)}}
 else assert(matches,`${id}: reasonable equivalent ${value}`);
}
for(const [id,value] of negative)assert(!grammarAnswerMatches(byId.get(id),value),`${id}: reject changed constraint ${value}`);
if(expectGaps)assert.equal(gaps,21,'Baseline reproduces 21 responses across three tasks');
else for(const id of ['time-perspective','linked-vocabulary','giving-directions']){
 const unit=grammarUnits.find(unit=>unit.id===id);
 assert(unit.transfer.prompt.includes('IELTS'));
 assert(unit.transfer.criteria.some(value=>value.includes('人工')&&value.includes('自动')));
}
console.log(JSON.stringify({mode:expectGaps?'baseline-gaps':'revised',units:grammarUnits.length,originalReferences:practices.length,acceptedReferences:accepted,choiceOptions:options,reasonableVariants:positive.length,rejectedBoundaries:negative.length,gaps,canonicalDigest}));

if(!expectGaps){
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

 const model=await import(await moduleURL('model.ts'));
 let responseEvents=0;
 for(const [expected,cases] of [[true,positive],[false,negative]])for(const [id,value] of cases){
  const target=byId.get(id),unit=grammarUnits.find(unit=>unit.practices.some(q=>q.id===id));
  ui.resetHooks();
  let state=progress.updateGrammarProgress(structuredClone(model.initial),unit.id,record=>({...record,round:target.variant,inRound:true}));
  const props={get state(){return state},update:change=>{state=change(state)}};
  for(const [index,q] of progress.grammarRoundQuestions(unit,target.variant).entries()){
   let tree=ui.renderUnit(unit,props),exercise=section(tree,'grammar-progressive-practice');
   assert(exercise);assert(!textOf(exercise).includes(q.explanation));
   if(q.kind==='recognise'){
    const label=children(exercise).find(node=>node?.type==='label'&&textOf(node)===q.answer);
    children(label).find(node=>node?.type==='input').props.onChange();
   }else children(exercise).find(node=>node?.type==='textarea').props.onChange({target:{value:q.id===id?value:q.answer}});
   tree=ui.renderUnit(unit,props);button(tree,index===2?'提交本轮，核对三题':'记录这一题，下一步').props.onClick();responseEvents++;
  }
  const record=progress.grammarProgressFor(state,unit);
  assert.equal(record.attempts.at(-1).passed,expected,`${id}: real TSX round`);
  assert.equal(record.responses[id].matched,expected);
  assert.equal(record.responses[id].checkedValue,value);
  const result=section(ui.renderUnit(unit,props),'grammar-round-result');
  assert(result);assert(textOf(result).includes(expected?'与参考一致':'与参考不同，待核对'));
  const reloaded=progress.readGrammarProgress(JSON.stringify(record),unit);
  assert.equal(reloaded.responses[id].matched,expected,`${id}: reload recomputes equivalent form`);
  assert(!progress.delayedGrammarEvidence(record),'A single synthetic round cannot claim delayed learning');
 }
 console.log(`Grammar variants UI: ${responseEvents} production TSX answer events / ${positive.length+negative.length} complete synthetic rounds, private feedback, exact stored responses and reload recomputation passed (component harness; no browser or real learner claim).`);
}
