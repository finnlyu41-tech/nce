import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {stripTypeScriptTypes} from 'node:module';
import ts from 'typescript';
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
const m=await import(await moduleURL('grammar-chart-transfer.ts'));
const {initial,validateState}=await import(await moduleURL('model.ts'));
const {grammarUnits}=await import(await moduleURL('grammar-curriculum.ts'));
const progress=await import(await moduleURL('grammar-curriculum-progress.ts'));
const lesson=m.grammarChartTransfer;
assert.equal(lesson.unitId,'comparisons');assert.equal(lesson.exercises.length,3);assert.equal(lesson.tables.length,3);
assert(lesson.dataNote.includes('各年样本人数未提供'));
assert(lesson.independent.criteria.some(c=>c.includes('Other是合计')));
assert.equal(lesson.lesson.length,4);
const q=lesson.exercises;
assert.deepEqual(q.map(x=>x.kind),['recognise','repair','apply']);
assert.equal(q[0].options.filter(option=>m.chartAnswerFeedback(q[0],option).kind==='reference').length,1);
assert.equal((50-40)/40*100,25);assert.equal(60/30,2);assert.equal((60-30)/30*100,100);
let positives=0,negatives=0;
for(const exercise of q){
 for(const value of [exercise.answer,...exercise.accepted]){assert.equal(m.chartAnswerFeedback(exercise,value).kind,'reference');positives++}
 for(const wrong of exercise.nearErrors){const f=m.chartAnswerFeedback(exercise,wrong.value);assert.equal(f.kind,'error');assert.equal(f.text,wrong.feedback);negatives++}
 assert.equal(m.chartAnswerFeedback(exercise,exercise.answer.toLowerCase().replace(/\.$/,'')).kind,'reference');
}
assert.equal(m.chartAnswerFeedback(q[2],'Trams attracted twice the commuter share of buses.').kind,'manual','Unlisted valid expression remains pending, never automatically wrong');
assert.equal(m.chartAnswerFeedback(q[2],'The tram share was 30 percent higher than the bus share.').kind,'manual','Unlisted near-error is honestly unchecked; finite checker is not semantic AI');
let p=m.emptyChartDraft();assert.equal(m.checkChartAnswer(p,'scale'),p);assert.equal(m.moveChartStep(p,1),p,'Empty unchecked task cannot create a false completed transition');
p=m.setChartAnswer(p,'compare',q[2].nearErrors[0].value);p=m.checkChartAnswer(p,'compare');
const first=p.responses.compare.firstChecked;
p=m.setChartAnswer(p,'compare',q[2].answer);assert.equal(p.responses.compare.checked,null);p=m.checkChartAnswer(p,'compare');
assert.equal(p.responses.compare.firstChecked,first);assert.equal(p.responses.compare.checked,q[2].answer);
assert.deepEqual(m.readChartDraft(JSON.stringify(p)),p,'Original error and corrected response survive reload');
let hinted=m.showChartHelp(m.emptyChartDraft(),'from-to');hinted=m.setChartAnswer(hinted,'from-to',q[1].answer);hinted=m.checkChartAnswer(hinted,'from-to');
assert(hinted.responses['from-to'].firstAssisted);assert.equal(m.readChartDraft(JSON.stringify(hinted)).responses['from-to'].hintLevel,1);
assert.equal(m.setChartAnswer(p,'unknown','answer'),p);
const legacy={...initial,drafts:{...initial.drafts,'synthetic-unrelated':'原草稿保持','grammar-curriculum-v1-comparisons':'synthetic ledger sentinel'},nce:{...initial.nce,'NCE1-1':{title:'合成旧笔记',text:'',notes:'合成保留内容',steps:[]}}};
const frozen=structuredClone(legacy),next=m.updateChartDraft(legacy,()=>p);
assert(validateState(next));assert.deepEqual(legacy,frozen);
for(const [field,value] of Object.entries(legacy))if(field!=='drafts')assert.deepEqual(next[field],value);
for(const [key,value] of Object.entries(legacy.drafts))assert.equal(next.drafts[key],value);
const future={...legacy,drafts:{...legacy.drafts,[m.grammarChartTransferKey]:'{"version":2,"future":"preserve"}'}};
assert.equal(m.updateChartDraft(future,()=>p),future);
let open=m.saveChartParagraph(p,lesson.independent.reference);open=m.checkChartParagraph(open);
assert.equal(open.checkedParagraph,lesson.independent.reference);assert.deepEqual(m.readChartDraft(JSON.stringify(open)),open);
assert.equal(m.saveChartParagraph(open,'edited').checkedParagraph,null);
const bounded=m.readChartDraft(JSON.stringify({version:1,responses:{compare:{value:'x'.repeat(2000),checked:'y'.repeat(2000),firstChecked:'z'.repeat(2000),hintLevel:100}},paragraph:'p'.repeat(5000),checkedParagraph:'q'.repeat(5000)}));
assert.equal(bounded.responses.compare.value.length,1000);assert.equal(bounded.responses.compare.firstChecked.length,1000);assert.equal(bounded.paragraph.length,4000);
const practices=grammarUnits.flatMap(u=>u.practices);
assert.equal(practices.length,168);assert.equal(createHash('sha256').update(JSON.stringify(practices.map(x=>[x.id,x.answer]))).digest('hex'),'0d0a0f94d8a72361e79c6730c88e6fe719da81b03dcaa52ba466ca8ca3d0fedc');
let oldAccepted=0;for(const x of practices){assert(progress.grammarAnswerMatches(x,x.answer));for(const v of x.accepted||[]){assert(progress.grammarAnswerMatches(x,v));oldAccepted++}}
// Execute the actual new production component with synthetic in-memory React hooks.
// This verifies handlers/branches and persistence, not browser layout.
let uiSource=await readFile(new URL('grammar-chart-transfer-ui.tsx',root),'utf8');
uiSource=uiSource.replace("import {useState} from 'react';",'').replace("import './grammar-chart-transfer.css';",'');
for(const match of [...uiSource.matchAll(/^import (?!type )(.+?) from '(\.\/.+?)';/gm)])uiSource=uiSource.replaceAll("'"+match[2]+"'",JSON.stringify(await moduleURL(match[2].slice(2)+'.ts')));
const harness=`
let hooks=[],index=0;
function useState(initial){const n=index++;if(!(n in hooks))hooks[n]=initial;return [hooks[n],v=>{hooks[n]=typeof v==='function'?v(hooks[n]):v}]}
const Fragment=Symbol.for('chart-fragment');
function JSX(type,props,...children){return {type,props:{...props,children}}}
export function render(props){index=0;return GrammarChartTransfer(props)}
export function reset(){hooks=[];index=0}
`;
const js=ts.transpileModule(uiSource+harness,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.React,jsxFactory:'JSX',jsxFragmentFactory:'Fragment'}}).outputText;
const ui=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const nodes=node=>!node||typeof node!=='object'?[]:[node,...(node.props?.children||[]).flat(Infinity).flatMap(nodes)];
const text=node=>node==null||typeof node==='boolean'?'':typeof node==='object'?(node.props?.children||[]).flat(Infinity).map(text).join(''):String(node);
const button=(tree,label)=>nodes(tree).find(n=>n.type==='button'&&text(n)===label);
const area=(tree,label)=>nodes(tree).find(n=>n.type==='article'&&n.props['aria-label']===label);
let state=legacy,events=0;
const props={unitId:lesson.unitId,get state(){return state},update:change=>{state=change(state);events++}};
let tree=ui.render(props);
assert(!text(tree).includes(lesson.independent.reference),'Open reference is hidden before own draft');
assert(button(tree,'核对图表练习 1').props.disabled);
let firstArea=area(tree,'图表练习 1');assert(!area(tree,'图表练习 2'),'One next step, not simultaneous exercise forms');
const wrongLabel=nodes(firstArea).find(n=>n.type==='label'&&text(n)===q[0].options[0]);nodes(wrongLabel).find(n=>n.type==='input').props.onChange();
tree=ui.render(props);button(tree,'核对图表练习 1').props.onClick();tree=ui.render(props);
assert(text(firstArea=area(tree,'图表练习 1')).includes('数据或关系有误，需修正'));assert(text(firstArea).includes(q[0].nearErrors[0].feedback));assert.equal(button(tree,'核对图表练习 1').props.className,'btn','Known error directs the primary action back to correction');assert.equal(button(tree,'稍后修正，继续下一项').props.className,'btn secondary');
for(const [i,exercise] of q.entries()){
 tree=ui.render(props);
 if(i>0){const incorrect=exercise.nearErrors[0].value;nodes(area(tree,`图表练习 ${i+1}`)).find(n=>n.type==='textarea').props.onChange({target:{value:incorrect}});tree=ui.render(props);button(tree,`核对图表练习 ${i+1}`).props.onClick();tree=ui.render(props);assert(text(area(tree,`图表练习 ${i+1}`)).includes('数据或关系有误，需修正'));}
 const a=area(tree,`图表练习 ${i+1}`);
 if(exercise.options){const label=nodes(a).find(n=>n.type==='label'&&text(n)===exercise.answer);nodes(label).find(n=>n.type==='input').props.onChange()}
 else nodes(a).find(n=>n.type==='textarea').props.onChange({target:{value:exercise.answer}});
 ui.reset();tree=ui.render(props);const restored=area(tree,`图表练习 ${i+1}`);if(!exercise.options)assert.equal(nodes(restored).find(n=>n.type==='textarea').props.value,exercise.answer);
 button(tree,`核对图表练习 ${i+1}`).props.onClick();tree=ui.render(props);assert(text(area(tree,`图表练习 ${i+1}`)).includes('有限参考一致'));
 if(i<2){button(tree,'继续图表下一项').props.onClick();ui.reset();tree=ui.render(props);assert(area(tree,`图表练习 ${i+2}`),'Current step survives refresh');}
}
assert.equal(m.readChartDraft(state.drafts[m.grammarChartTransferKey]).responses.scale.firstChecked,q[0].options[0]);
// The component must show a pending, rather than wrong, unlisted natural answer.
tree=ui.render(props);nodes(area(tree,'图表练习 3')).find(n=>n.type==='textarea').props.onChange({target:{value:'Trams attracted twice the commuter share of buses.'}});tree=ui.render(props);button(tree,'核对图表练习 3').props.onClick();tree=ui.render(props);
assert(text(area(tree,'图表练习 3')).includes('待人工核对'));assert(!text(area(tree,'图表练习 3')).includes('数据或关系有误'));
button(tree,'提示图表练习 3').props.onClick();ui.reset();tree=ui.render(props);assert.equal(m.readChartDraft(state.drafts[m.grammarChartTransferKey]).responses.compare.hintLevel,1);
button(tree,'换表格，写自己的段落').props.onClick();ui.reset();tree=ui.render(props);
const paragraph=nodes(area(tree,'独立图表段落')).find(n=>n.type==='textarea');paragraph.props.onChange({target:{value:lesson.independent.reference}});ui.reset();tree=ui.render(props);assert.equal(nodes(area(tree,'独立图表段落')).find(n=>n.type==='textarea').props.value,lesson.independent.reference);
button(tree,'保存段落，进入自查').props.onClick();tree=ui.render(props);assert(text(tree).includes('开放表达待人工核对'));assert(!text(tree).includes('7.0'));
button(tree,'对照一种段落写法').props.onClick();tree=ui.render(props);assert(text(tree).includes(lesson.independent.referenceNote));
assert.equal(ui.render({...props,unitId:'other-unit'}),null);
assert.equal(state.drafts['grammar-curriculum-v1-comparisons'],legacy.drafts['grammar-curriculum-v1-comparisons'],'Exposure ledger namespace is untouched');
const report={newFiniteReferences:positives,explicitNearErrors:negatives,oldCanonical:168,oldAccepted,productionComponentEvents:events,browser:'not claimed by this component harness',masteryOrScoreGranted:false};
console.log(JSON.stringify(report));
if(process.argv.includes('--report'))await writeFile(new URL('../work/grammar-transfer/component-report.json',import.meta.url),JSON.stringify(report,null,2));
