import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile, readdir, mkdtemp, rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceFiles = ['ielts-blueprint/curriculum/registered.ts', 'ielts-blueprint/sample-sequence-ui.tsx'];
const digest = async file => createHash('sha256').update(await readFile(path.join(root, file))).digest('hex');
const before = Object.fromEntries(await Promise.all(sourceFiles.map(async file => [file, await digest(file)])));
const pnpm = path.join(root, 'node_modules/.pnpm');
const builders = (await readdir(pnpm)).filter(name => /^esbuild@\d+\.\d+\.\d+$/.test(name))
  .sort((a, b) => b.localeCompare(a, undefined, {numeric: true}));
assert.ok(builders.length, 'Use the existing project dependencies; this test installs nothing.');
const {build} = await import(pathToFileURL(path.join(pnpm, builders[0], 'node_modules/esbuild/lib/main.js')));
const temp = await mkdtemp(path.join(os.tmpdir(), 'ielts-table-host-source-'));

// Only React's hook scheduling is replaced for synchronous source-controller
// probes. JSX, React SSR, table view, model, parser, catalog and CAS are real.
// These probes do not simulate DOM focus, speech output or durable disk writes.
const hookSource = String.raw`
import * as real from 'react';
let active;
const equal = (a,b) => !!a && !!b && a.length===b.length && a.every((v,i)=>Object.is(v,b[i]));
export function useState(initial) {
 if(!active)return real.useState(initial);
 const owner=active,index=owner.cursor++;
 if(!owner.slots[index])owner.slots[index]={value:typeof initial==='function'?initial():initial};
 const slot=owner.slots[index];
 return [slot.value,next=>{const value=typeof next==='function'?next(slot.value):next;
  if(!Object.is(value,slot.value)){slot.value=value;owner.dirty=true;}}];
}
export function useRef(initial) {
 if(!active)return real.useRef(initial);
 const owner=active,index=owner.cursor++;
 return (owner.slots[index] ||= {value:{current:initial}}).value;
}
export function useMemo(factory,deps) {
 if(!active)return real.useMemo(factory,deps);
 const owner=active,index=owner.cursor++,slot=owner.slots[index];
 if(!slot||!equal(slot.deps,deps))owner.slots[index]={value:factory(),deps};
 return owner.slots[index].value;
}
function effect(callback,deps,layout) {
 if(!active)return layout?real.useLayoutEffect(callback,deps):real.useEffect(callback,deps);
 const owner=active,index=owner.cursor++,old=owner.slots[index];
 if(!old||!equal(old.deps,deps)){
  const slot={deps,cleanup:old?.cleanup};owner.slots[index]=slot;
  (layout?owner.layouts:owner.effects).push(()=>{slot.cleanup?.();slot.cleanup=callback();});
 }
}
export const useEffect=(callback,deps)=>effect(callback,deps,false);
export const useLayoutEffect=(callback,deps)=>effect(callback,deps,true);
export function createController(Component,initialProps) {
 const owner={slots:[],cursor:0,layouts:[],effects:[],dirty:true,props:initialProps,tree:null};
 return {
  get tree(){return owner.tree},
  get values(){return owner.slots.map(slot=>slot?.value)},
  render(props=owner.props){
   owner.props=props;
   for(let pass=0;pass<20;pass++){
    owner.dirty=false;owner.cursor=0;owner.layouts=[];owner.effects=[];
    const previous=active;active=owner;
    try{owner.tree=Component(owner.props)}finally{active=previous}
    for(const run of [...owner.layouts,...owner.effects])run();
    if(!owner.dirty)return owner.tree;
   }
   throw Error('Source controller did not settle');
  },
  close(){for(const slot of owner.slots)slot?.cleanup?.();}
 };
}
`;
let savedGlobals;
try {
  const output = path.join(temp, 'host.cjs');
  await build({
    stdin: {contents: `
      import * as c from './ielts-blueprint/sample-sequence';
      import * as m from './ielts-blueprint/sample-sequence-model';
      import * as p from './app/ielts-sample-progress';
      import * as classic from './app/model';
      import * as tables from './ielts-blueprint/curriculum/table-completion';
      import * as registry from './ielts-blueprint/curriculum/registered';
      import * as multi from './ielts-blueprint/curriculum/batch-02';
      import {IELTSSampleWorkspace as Workspace} from './app/ielts-sample-workspace';
      import {IELTSSampleSequence as Sequence} from './ielts-blueprint/sample-sequence-ui';
      import {TableStimulusView as Table} from './ielts-blueprint/structured-table/table-stimulus';
      import * as hooks from 'table-host-source-hooks';
      import React from 'react';
      import {renderToStaticMarkup as render} from 'react-dom/server';
      export {c,m,p,classic,tables,registry,multi,Workspace,Sequence,Table,hooks,React,render};
    `, resolveDir:root,sourcefile:'table-host-source-entry.ts',loader:'ts'},
    plugins:[{
      name:'bounded-host-source-controller',
      setup(builder){
        builder.onResolve({filter:/^table-host-source-hooks$/},()=>({path:'hooks',namespace:'source-hooks'}));
        builder.onResolve({filter:/^react$/},args=>{
          if([path.join(root,'app/ielts-sample-workspace.tsx'),path.join(root,'ielts-blueprint/sample-sequence-ui.tsx')].includes(args.importer))
            return {path:'hooks',namespace:'source-hooks'};
        });
        builder.onLoad({filter:/.*/,namespace:'source-hooks'},()=>({contents:hookSource,loader:'js',resolveDir:root}));
        builder.onResolve({filter:/^\./},args=>{
          if(path.resolve(args.resolveDir,args.path)===path.join(root,'app/recording-feedback'))
            return {path:'Recorder',namespace:'source-recorder'};
        });
        builder.onLoad({filter:/.*/,namespace:'source-recorder'},()=>({contents:'export function Recorder(){return null}',loader:'js'}));
      }
    }],
    bundle:true,platform:'node',format:'cjs',target:'node22',jsx:'automatic',
    loader:{'.css':'empty'},outfile:output,logLevel:'silent'
  });
  const {c,m,p,classic,tables,registry,multi,Workspace,Sequence,Table,hooks,React,render} =
    (await import(pathToFileURL(output))).default;
  const NOW=Date.now(),originalNow=Date.now;
  savedGlobals={now:originalNow,window:globalThis.window,setInterval:globalThis.setInterval,clearInterval:globalThis.clearInterval};
  Date.now=()=>NOW;
  globalThis.window={speechSynthesis:{cancel(){}}};
  globalThis.setInterval=()=>0;globalThis.clearInterval=()=>{};
  let clock=NOW-100000,checks=0,roundTrips=0;
  const variants=['academic','general-training'];
  function act(state,action){
    const result=m.transitionSample(state,action,++clock);
    assert.equal(result.issue,undefined,result.issue);return result.state;
  }
  function roundTrip(state){
    const raw=p.serializeSampleProgress(state,NOW),read=p.readSampleProgress(raw,NOW);
    assert.equal(read.status,'ready',read.reason);assert.deepEqual(read.value,JSON.parse(JSON.stringify(state)));
    roundTrips++;return {raw,value:read.value};
  }
  function guided(variant,id){
    let value=act(m.emptySampleState(),{type:'select-variant',variant});
    value=act(value,{type:'open-lesson',lessonId:id});
    return act(act(value,{type:'next'}),{type:'next'});
  }
  function heard(value){
    const material=m.activeSampleMaterial(value);
    if(!material.script)return value;
    const playbackId='source-audio-'+clock,promptId=material.id;
    for(const type of ['audio-request','audio-start','audio-end','audio-confirm'])
      value=act(value,{type,promptId,playbackId});
    return value;
  }
  function submitRaw(value,prefix='ORIGINAL'){
    for(const q of m.activeSampleMaterial(value).questions)
      value=act(value,{type:'answer',questionId:q.id,value:prefix+' '+q.id});
    return act(heard(value),{type:'submit'});
  }
  function independent(variant,id){
    // A parser-valid imported practice fixture with an incorrect guided attempt.
    // It does not assert that the engine allowed skipping guided correction.
    let value=structuredClone(submitRaw(guided(variant,id)));
    const lesson=m.selectedSampleLesson(value),session=m.sampleSession(value),material=lesson.independent;
    session.stage='independent';session.exposures.push(material.id);
    session.drafts[material.id]={openedAt:++clock,freshAtOpen:true,unseenConfirmed:false,answers:{},response:'',
      hinted:false,startedAt:0,submittedAt:0,playbacks:[]};
    return roundTrip(value).value;
  }
  function timed(variant,id){return act(submitRaw(independent(variant,id)),{type:'next'});}
  function feedback(variant,id){return act(submitRaw(act(timed(variant,id),{type:'start-timed'})),{type:'next'});}
  function allNodes(value,out=[]){
    if(Array.isArray(value)){for(const item of value)allNodes(item,out);}
    else if(React.isValidElement(value)){out.push(value);allNodes(value.props.children,out);}
    return out;
  }
  function plain(value){
    if(Array.isArray(value))return value.map(plain).join('');
    if(React.isValidElement(value))return plain(value.props.children);
    return typeof value==='string'||typeof value==='number'?String(value):'';
  }
  const elements=(tree,type)=>allNodes(tree).filter(node=>node.type===type);
  function table(controller,id){const node=elements(controller.tree,Table).find(node=>node.props.stimulus.id===id);assert.ok(node,'Expected the actual table view');return node;}
  function click(controller,label){
    const node=elements(controller.tree,'button').find(node=>plain(node)===label);
    assert.ok(node,'Expected button: '+label);assert.ok(!node.props.disabled);node.props.onClick();
  }
  function controlled(value,onChange=()=>{}){
    const controller=hooks.createController(Sequence,{value,onChange,guidedFlow:true});
    controller.render();return controller;
  }
  function workspace(value,write=true){
    let host={...structuredClone(classic.initial),drafts:{other:'unchanged',[p.sampleProgressKey]:roundTrip(value).raw}},writes=0;
    const update=change=>{writes++;if(write)host=change(host)};
    const controller=hooks.createController(Workspace,{state:host,ready:true,update});
    const flush=()=>{controller.render({state:host,ready:true,update});return elements(controller.tree,Sequence)[0]};
    flush();
    return {controller,flush,get state(){return host},get writes(){return writes},replace(next){host=next}};
  }
  async function test(name,run){await run();checks++;console.log('PASS '+name);}
  const tableIds=new Set(variants.flatMap(variant=>tables.tableCompletionLessonsFor(variant).map(lesson=>lesson.id)));
  const reading={academic:tables.tableCompletionLessonsFor('academic').find(lesson=>lesson.skill==='reading'),
    'general-training':c.sampleLessonsFor('general-training').find(lesson=>lesson.skill==='reading')};
  await test('production registers table lessons once and retains the prior 14 lessons per variant',()=>{
    assert.equal(registry.registeredCurriculumBatches.filter(batch=>batch.id==='table-completion').length,1);
    const refs=[];
    for(const variant of variants){
      const lessons=c.sampleLessonsFor(variant),added=variant==='academic'?1:0;
      assert.equal(lessons.length,14+added);assert.equal(new Set(lessons.map(lesson=>lesson.id)).size,14+added);
      assert.equal(tables.tableCompletionLessonsFor(variant).length,added);
      assert.equal(lessons.filter(lesson=>!tableIds.has(lesson.id)).length,14);
      assert.equal(lessons.filter(lesson=>tableIds.has(lesson.id)).length,added);
      for(const lesson of lessons){const materials=c.sampleMaterials(lesson);assert.equal(materials.length,6);refs.push(...materials.map(material=>material.id));}
    }
    assert.equal(refs.length,174);assert.equal(new Set(refs).size,126);
  });
  await test('all prior 28 lesson scopes still pass the real parser and actual React SSR',()=>{
    for(const variant of variants)for(const lesson of c.sampleLessonsFor(variant).filter(lesson=>!tableIds.has(lesson.id))){
      const value=roundTrip(guided(variant,lesson.id)).value;
      const html=render(React.createElement(Sequence,{value,guidedFlow:true}));
      assert.ok(html.includes(lesson.title.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#x27;")));assert.ok(!html.includes('data-table-id='));
    }
    for(const variant of variants)assert.equal(multi.batch02NativeLessonsFor(variant).length,2);
  });
  await test('the Academic table scope renders semantic tables through the production sequence',()=>{
    for(const variant of variants)for(const lesson of tables.tableCompletionLessonsFor(variant)){
      const value=roundTrip(guided(variant,lesson.id)).value,stimulus=tables.tableCompletionStimulusFor(lesson.guided.id);
      const html=render(React.createElement(Sequence,{value}));
      assert.ok(html.includes('<table'));assert.ok(html.includes('<caption'));assert.ok(html.includes('scope="row"'));assert.ok(html.includes('scope="col"'));
      assert.ok(html.includes('data-table-id="'+stimulus.id+'"'));assert.equal((html.match(/data-question-id=/g)||[]).length,3);
    }
  });
  await test('controlled non-echo preserves exact raw, blocks continuation, and releases only after parent echo',()=>{
    let value=independent('academic',reading.academic.id),received;
    const stimulus=tables.tableCompletionStimulusFor(m.activeSampleMaterial(value).id),qid=m.activeSampleMaterial(value).questions[0].id;
    const controller=controlled(value,next=>{received=next}),raw='  MiXeD raw\tanswer  ';
    table(controller,stimulus.id).props.onAnswer(qid,raw);controller.render();
    assert.equal(table(controller,stimulus.id).props.answers[qid],raw);
    assert.equal(m.activeSampleDraft(value).answers[qid],undefined);assert.equal(m.activeSampleDraft(received).answers[qid],raw);
    click(controller,'记录原始作答');controller.render();assert.match(plain(controller.tree),/尚未保存/);
    value=roundTrip(received).value;controller.render({value,onChange:next=>{received=next},guidedFlow:true});
    click(controller,'需要一个提示（本次记为借助提示）');controller.render();
    assert.equal(m.activeSampleDraft(received).hinted,true,'Exact parent echo must release the pending guard');
    controller.close();
  });
  await test('501 characters stay complete and unsubmitted; a shorter exact raw can be handed off',()=>{
    let value=independent('academic',reading.academic.id),writes=0;
    const stimulus=tables.tableCompletionStimulusFor(m.activeSampleMaterial(value).id),qid=m.activeSampleMaterial(value).questions[0].id;
    const onChange=next=>{writes++;value=next},controller=controlled(value,onChange),tooLong='x'.repeat(501);
    table(controller,stimulus.id).props.onAnswer(qid,tooLong);controller.render();
    assert.equal(writes,0);assert.equal(table(controller,stimulus.id).props.answers[qid],tooLong);
    assert.match(plain(controller.tree),/尚未交给工作区/);
    const shortened=' '+ 'x'.repeat(498)+' ';
    table(controller,stimulus.id).props.onAnswer(qid,shortened);controller.render({value,onChange,guidedFlow:true});
    assert.equal(writes,1);assert.equal(m.activeSampleDraft(roundTrip(value).value).answers[qid],shortened);
    controller.close();
  });
  await test('the real UI safely switches an Academic-only lesson to GT and rejects stale callbacks',()=>{
    const first=independent('academic',reading.academic.id);
    const stimulus=tables.tableCompletionStimulusFor(m.activeSampleMaterial(first).id),qid=m.activeSampleMaterial(first).questions[0].id;
    let writes=0,value=first;const onChange=next=>{writes++;value=roundTrip(next).value};
    const controller=controlled(value,onChange),stale=table(controller,stimulus.id).props.onAnswer;
    click(controller,'切换考试类别');controller.render();
    click(controller,'General Training');controller.render({value,onChange,guidedFlow:true});
    assert.equal(writes,1);assert.equal(value.variant,'general-training');
    assert.ok(m.selectedSampleLesson(value));assert.ok(!tableIds.has(value.lessonId));
    assert.deepEqual(value.sessions,first.sessions,'Switching category must retain every prior session');
    stale(qid,'old scope raw');controller.render();
    assert.equal(writes,1);assert.equal(elements(controller.tree,Table).length,0);
    controller.render({value:first,onChange,guidedFlow:true});assert.equal(table(controller,stimulus.id).props.answers[qid],'old scope raw');
    controller.close();
  });
  await test('timed public table stays hidden until the existing timer starts',()=>{
    let value=timed('academic',reading.academic.id);
    const stimulus=tables.tableCompletionStimulusFor(m.selectedSampleLesson(value).timed.id);
    const html=render(React.createElement(Sequence,{value}));
    assert.ok(!html.includes('data-table-id="'+stimulus.id+'"'));
    const onChange=next=>{value=next},controller=controlled(value,onChange);
    click(controller,'开始训练计时');controller.render({value,onChange,guidedFlow:true});
    assert.equal(table(controller,stimulus.id).props.readOnly,false);
    assert.equal(m.activeSampleDraft(roundTrip(value).value).startedAt,NOW);controller.close();
  });
  await test('submitted table keeps the first original read-only and history keeps each original raw',()=>{
    let value=submitRaw(independent('academic',reading.academic.id),'FIRST ORIGINAL');
    const material=m.activeSampleMaterial(value),first={...m.activeSampleDraft(value).answers};
    value=submitRaw(value,'SECOND ORIGINAL');value=roundTrip(value).value;
    const stimulus=tables.tableCompletionStimulusFor(material.id),controller=controlled(value);
    const current=elements(controller.tree,Table).find(node=>node.props.idPrefix===material.id+'-answer');
    assert.ok(current.props.readOnly);assert.deepEqual(current.props.answers,first);
    const history=elements(controller.tree,Table).filter(node=>node.props.stimulus.id===stimulus.id&&node.props.idPrefix.includes('-history-'));
    assert.equal(history.length,2);assert.ok(history.every(node=>node.props.readOnly));
    assert.deepEqual(history[0].props.answers,first);
    assert.deepEqual(history[1].props.answers,m.sampleSession(value).attempts.at(-1).answers);
    const html=render(React.createElement(Sequence,{value})),ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);
    assert.equal(ids.length,new Set(ids).size,'Repeated historical tables need distinct DOM IDs');
    controller.close();
  });
  await test('feedback edits correction raw while preserving the timed original and timer evidence',()=>{
    let value=feedback('academic',reading.academic.id),original=structuredClone(m.sampleSession(value).attempts.at(-1));
    const material=m.selectedSampleLesson(value).timed,stimulus=tables.tableCompletionStimulusFor(material.id),qid=material.questions[0].id;
    const onChange=next=>{value=next},controller=controlled(value,onChange),raw='  correction raw  ';
    const correction=elements(controller.tree,Table).find(node=>node.props.idPrefix===material.id+'-correction-answer');
    assert.ok(!correction.props.readOnly);correction.props.onAnswer(qid,raw);controller.render({value,onChange,guidedFlow:true});
    const restored=roundTrip(value).value;
    assert.equal(m.sampleSession(restored).correctionAnswers[qid],raw);
    assert.deepEqual(m.sampleSession(restored).attempts.at(-1),original);
    assert.ok(elements(controller.tree,Table).some(node=>node.props.stimulus.id===stimulus.id&&node.props.readOnly));
    controller.close();
  });
  await test('real workspace stages raw before a host no-op and normal CAS changes only the sample namespace',()=>{
    for(const write of [false,true]){
      const value=independent('academic',reading.academic.id),host=workspace(value,write),entry=host.flush();
      const controller=controlled(entry.props.value,entry.props.onChange),material=m.activeSampleMaterial(value),stimulus=tables.tableCompletionStimulusFor(material.id),qid=material.questions[0].id;
      const raw='  workspace exact raw  ';table(controller,stimulus.id).props.onAnswer(qid,raw);
      const echoed=host.flush();assert.ok(echoed);assert.equal(m.activeSampleDraft(echoed.props.value).answers[qid],raw);
      controller.render(echoed.props);assert.equal(table(controller,stimulus.id).props.answers[qid],raw);
      assert.equal(host.state.drafts.other,'unchanged');assert.equal(host.writes,1);
      const saved=p.readSampleProgress(host.state.drafts[p.sampleProgressKey],NOW);assert.equal(saved.status,'ready');
      assert.equal(m.activeSampleDraft(saved.value).answers[qid],write?raw:undefined);
      controller.close();host.controller.close();
    }
  });
  function nearSaveLimit(){
    let first=independent('academic',reading.academic.id),second=guided('general-training',reading['general-training'].id);
    function heavy(value){
      for(const q of m.activeSampleMaterial(value).questions)value=act(value,{type:'answer',questionId:q.id,value:'P'.repeat(500)});
      value=act(value,{type:'response',value:'R'.repeat(4000)});value=act(heard(value),{type:'submit'});
      return value;
    }
    // Fill authentic-shaped incorrect histories, never reading author keys.
    const firstSession=m.sampleSession(first),guidedMaterial=m.selectedSampleLesson(first).guided;
    const source=firstSession.drafts[guidedMaterial.id],attempt=firstSession.attempts[0];
    source.response='R'.repeat(4000);attempt.response=source.response;
    for(const q of guidedMaterial.questions)source.answers[q.id]=attempt.answers[q.id]='P'.repeat(500);
    // Actual matching results are calculated by one real engine submission.
    let recalculated=structuredClone(first);m.sampleSession(recalculated).stage='guided';
    m.sampleSession(recalculated).drafts[guidedMaterial.id].submittedAt=0;
    recalculated=act(heard(recalculated),{type:'submit'});
    const heavyAttempt=m.sampleSession(recalculated).attempts.at(-1);
    firstSession.attempts=Array.from({length:200},()=>structuredClone(heavyAttempt));
    source.submittedAt=heavyAttempt.at;
    second=heavy(second);const secondSession=m.sampleSession(second),last=secondSession.attempts.at(-1);
    first.sessions[second.variant+':'+second.lessonId]=secondSession;
    const measure=()=>JSON.stringify({version:1,contentVersion:c.sampleSequence.version,sequenceId:c.sampleSequence.id,value:first}).length;
    while(secondSession.attempts.length<200){
      secondSession.attempts.push(structuredClone(last));
      if(measure()>1999990){secondSession.attempts.pop();break;}
    }
    let gap=1999990-measure();
    for(const session of [firstSession,secondSession]){
      const added=Math.min(4000,gap);session.correctionNote='N'.repeat(added);gap-=added;
    }
    assert.equal(gap,0,'Fixture must reach the real raw size boundary');
    const restored=roundTrip(first);assert.equal(restored.raw.length,1999990);
    return restored.value;
  }
  await test('real serializer refusal retains the local 500-character raw without falsely treating engine success as acceptance',()=>{
    const value=nearSaveLimit(),host=workspace(value),entry=host.flush(),old=host.state.drafts[p.sampleProgressKey];
    const controller=controlled(entry.props.value,entry.props.onChange),material=m.activeSampleMaterial(value),stimulus=tables.tableCompletionStimulusFor(material.id),qid=material.questions[0].id,raw='z'.repeat(500);
    table(controller,stimulus.id).props.onAnswer(qid,raw);const returned=host.flush();controller.render(returned.props);
    assert.equal(host.writes,0);assert.equal(host.state.drafts[p.sampleProgressKey],old);
    assert.equal(table(controller,stimulus.id).props.answers[qid],raw);
    assert.match(plain(host.controller.tree),/保存上限/);
    controller.close();host.controller.close();
  });
  console.log('PASS '+checks+' bounded source/SSR groups; '+roundTrips+' real-parser round trips. Browser and disk durability are checked elsewhere.');
} finally {
  if(savedGlobals){
    Date.now=savedGlobals.now;
    if(savedGlobals.window===undefined)delete globalThis.window;else globalThis.window=savedGlobals.window;
    globalThis.setInterval=savedGlobals.setInterval;globalThis.clearInterval=savedGlobals.clearInterval;
  }
  await rm(temp,{recursive:true,force:true});
}
for(const file of sourceFiles)assert.equal(await digest(file),before[file],'The source changed during this read-only test: '+file);
console.log('PASS source bytes unchanged '+JSON.stringify(before));
