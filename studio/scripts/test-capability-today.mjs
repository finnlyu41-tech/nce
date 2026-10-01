import assert from 'node:assert/strict';
import {mkdtemp,readFile,readdir,rm} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';

// Run the real schedule/consumer source in Node. The hook harness below is an
// in-memory React lifecycle model, not a browser, DOM, CSS or real-device test.
const root=new URL('../',import.meta.url),rootPath=fileURLToPath(root);
const packages=new URL('node_modules/.pnpm/',root);
const builders=(await readdir(packages)).filter(name=>/^esbuild@\d+\.\d+\.\d+$/.test(name)).sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}));
assert(builders.length,'Install the existing locked dependencies before running this test.');
const {build}=await import(new URL(`${builders[0]}/node_modules/esbuild/lib/main.js`,packages));
const ts=(await import(new URL('node_modules/typescript/lib/typescript.js',root))).default;
const temporary=await mkdtemp('/tmp/english-capability-today-');
const tests=[],test=(name,run)=>tests.push({name,run});
const deepFreeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.freeze(value);for(const child of Object.values(value))deepFreeze(child)}return value};

try{
 const output=path.join(temporary,'production-model.mjs');
 await build({stdin:{contents:`
 export * as capability from './app/capability-review-next';
 export * as review from './public/demos/yesterday/review-adapter.mjs';
 export {todayPractice} from './app/today-practice';
 export {initial} from './app/model';
 export * as map from './map/model';
 export * as content from './map/content';
 `,resolveDir:rootPath,sourcefile:'capability-today-check.ts',loader:'ts'},bundle:true,platform:'node',format:'esm',target:'node22',outfile:output,logLevel:'silent'});
 const production=await import(pathToFileURL(output).href);
 const {capability,review,map,content,initial,todayPractice}=production;
 const START=Date.parse('2026-10-21T12:00:00.000Z'),DUE=START+review.DAY_MS;
 const made=review.ensurePlan(review.emptySnapshot(),{capabilityId:review.CAPABILITY_ID,completionId:'today-test-completion',completedAt:START},START);
 assert.equal(made.ok,true);const plan=deepFreeze(made.snapshot),rawPlan=JSON.stringify(plan);
 const taskId=`${review.PLAN_ID}@${DUE}`,taskHref=`/demos/yesterday/?review=${encodeURIComponent(taskId)}`;
 const state=()=>deepFreeze(structuredClone(initial)),progress=()=>deepFreeze(map.emptyProgress());
 function memory(raw=null,{throwRead=false}={}){
  let value=raw;const stats={gets:0,sets:0,removes:0};
  return {stats,get raw(){return value},external(next){value=next},
   getItem(key){stats.gets++;assert.equal(key,review.STORAGE_KEY);if(throwRead)throw Error('Storage read denied');return value},
   setItem(){stats.sets++;throw Error('The learning home must not write the canonical schedule')},
   removeItem(){stats.removes++;throw Error('The learning home must not remove the canonical schedule')},
  };
 }
 const noWrites=port=>assert.deepEqual({sets:port.stats.sets,removes:port.stats.removes},{sets:0,removes:0});
 async function read(raw,at=DUE){const port=memory(raw),before=port.raw,result=await capability.readCapabilityPractice(at,true,port);noWrites(port);assert.equal(port.raw,before);return result}
 function completed(outcome='passed'){
  const result=review.recordResult(plan,{taskId,resultId:`${taskId}:result`,outcome,at:DUE},DUE);
  assert.equal(result.ok,true);return result.snapshot;
 }
 const nextPlan=completed(),nextDue=nextPlan.plan.dueAt;

 test('absent and canonical empty stores create no plan or task',async()=>{
  for(const raw of [null,JSON.stringify(review.emptySnapshot())])assert.deepEqual(await read(raw),{tasks:[],error:''});
 });
 test('the first task appears at exactly 24 hours with the canonical occurrence and link',async()=>{
  assert.deepEqual(await read(rawPlan,DUE-1),{tasks:[],error:''});
  const {tasks,error}=await read(rawPlan,DUE);assert.equal(error,'');assert.equal(tasks.length,1);
  assert.deepEqual({id:tasks[0].id,href:tasks[0].href,at:tasks[0].at,priority:tasks[0].priority,kind:tasks[0].kind,returnHref:tasks[0].returnHref},
   {id:taskId,href:taskHref,at:DUE,priority:2,kind:'review',returnHref:'/map/'});
  for(const field of ['title','reason','method','evidence'])assert(tasks[0][field].trim());
  assert.match(tasks[0].evidence,/不折算/);
 });
 test('a passed receipt removes its occurrence until the new seven-day occurrence is due',async()=>{
  const raw=JSON.stringify(nextPlan);assert.equal(nextDue,DUE+7*review.DAY_MS);
  for(const at of [DUE,nextDue-1])assert.deepEqual(await read(raw,at),{tasks:[],error:''});
  const {tasks}=await read(raw,nextDue);assert.equal(tasks.length,1);assert.equal(tasks[0].id,`${review.PLAN_ID}@${nextDue}`);
  assert.notEqual(tasks[0].id,taskId);assert.equal(tasks[0].href,`/demos/yesterday/?review=${encodeURIComponent(tasks[0].id)}`);
 });
 test('a needs-practice receipt also removes the old task and waits its real next day',async()=>{
  const next=completed('needs-practice'),at=next.plan.dueAt;assert.equal(at,DUE+review.DAY_MS);
  assert.deepEqual(await read(JSON.stringify(next),at-1),{tasks:[],error:''});
  assert.equal((await read(JSON.stringify(next),at)).tasks[0].id,`${review.PLAN_ID}@${at}`);
 });
 const future=review.ensurePlan(review.emptySnapshot(),{capabilityId:review.CAPABILITY_ID,completionId:'future-completion',completedAt:DUE+1},DUE+1).snapshot;
 const invalidRaws=['','{','null','[]',JSON.stringify({...plan,version:2}),JSON.stringify(future)];
 test('corrupt, future-version and future-dated snapshots report an error without changing raw data',async()=>{
  for(const raw of invalidRaws){const result=await read(raw);assert.deepEqual(result.tasks,[]);assert.match(result.error,/无法读取/);assert.match(result.error,/原记录保留/)}
 });
 test('storage exceptions are explicit and preserve the unreadable original record',async()=>{
  const port=memory(rawPlan,{throwRead:true}),result=await capability.readCapabilityPractice(DUE,true,port);
  assert.deepEqual(result.tasks,[]);assert.match(result.error,/原记录保留/);assert.equal(port.raw,rawPlan);noWrites(port);
 });
 test('offline read exits before touching even an inaccessible storage port',async()=>{
  let touches=0;const port=new Proxy({},{get(){touches++;throw Error('Offline touched storage')}});
  assert.deepEqual(await capability.readCapabilityPractice(DUE,false,port),{tasks:[],error:''});assert.equal(touches,0);
 });
 test('repair and resume from the real model precede the due capability task without mutating inputs',async()=>{
  const first=content.nodeById('first'),letters=content.nodeById('letters');
  const questions=content.questionsFor(first,0),failed={at:DUE-1,round:0,answers:questions.map(()=> 'incorrect'),assisted:false,heard:[]};
  const active=deepFreeze({...map.emptyProgress(),lastNode:letters.id,access:{all:true,nodes:[]},records:{
   [first.id]:{...map.emptyRecord(),attempts:[failed]},
   [letters.id]:{...map.emptyRecord(),phase:'challenge',questionIndex:1,answers:['unfinished']},
  }}),classic=state(),before=JSON.stringify({classic,active});
  const base=deepFreeze(todayPractice(classic,active,DUE,true)),extra=deepFreeze((await read(rawPlan)).tasks);
  const combined=capability.includeCapabilityPractice(base,extra);
  assert.deepEqual(combined.slice(0,3).map(item=>item.kind),['repair','resume','review']);
  assert.equal(combined[2].id,taskId);assert.equal(new Set(combined.map(item=>item.id)).size,combined.length);
  assert.equal(JSON.stringify({classic,active}),before);assert.notEqual(combined,base);
 });
 test('merge deduplicates both inputs, retains the existing task and sorts ties deterministically',async()=>{
  const due=(await read(rawPlan)).tasks[0],repair={...due,title:'Existing correction',priority:0,kind:'repair'};
  const base=deepFreeze([repair,{...due,id:'z',at:DUE+1},{...due,id:'b'},{...due,id:'a'},{...due,id:'b'}]);
  const extras=deepFreeze([due,due,{...due,id:'extra'}, {...due,id:'extra'}]);
  const before=JSON.stringify([base,extras]),merged=capability.includeCapabilityPractice(base,extras);
  assert.equal(merged[0],repair);assert.deepEqual(merged.map(item=>item.id),[taskId,'a','b','extra','z']);
  assert.equal(JSON.stringify([base,extras]),before);assert.equal(new Set(merged.map(item=>item.id)).size,merged.length);
 });

 // The component source is unchanged. Replace only imported rendering primitives
 // and inject its real model functions; execute real effects and JSX handlers.
 let uiSource=await readFile(new URL('app/today-practice-ui.tsx',root),'utf8');
 uiSource=uiSource.replace(/^import .*;$/gm,'');
 const harness=`
 const ArrowRight=()=>null,testFragment='test-fragment';
 let activeRuntime;
 const useState=(value)=>activeRuntime.useState(value);
 const useRef=(value)=>activeRuntime.useRef(value);
 const useMemo=(fn,deps)=>activeRuntime.useMemo(fn,deps);
 const useEffect=(fn,deps)=>activeRuntime.useEffect(fn,deps);
 const todayPractice=(...args)=>activeRuntime.dependencies.todayPractice(...args);
 const readCapabilityPractice=(...args)=>activeRuntime.dependencies.readCapabilityPractice(...args);
 const includeCapabilityPractice=(...args)=>activeRuntime.dependencies.includeCapabilityPractice(...args);
 let capabilityReviewStorageKey;
 function testJSX(type,props,...children){return {type,props:{...props,children:children.flat(Infinity).filter(child=>child!==null&&child!==undefined&&child!==false)}}}
 export function createRenderer(runtime){capabilityReviewStorageKey=runtime.dependencies.capabilityReviewStorageKey;return props=>{activeRuntime=runtime;return runtime.render(TodayPracticeQueue,props)}}
 `;
 const code=ts.transpileModule(uiSource+harness,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.React,jsxFactory:'testJSX',jsxFragmentFactory:'testFragment'}}).outputText;
 const ui=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
 const children=node=>node&&typeof node==='object'?node.props?.children||[]:[];
 const nodes=node=>node&&typeof node==='object'?[node,...children(node).flatMap(nodes)]:[];
 const text=node=>typeof node==='string'||typeof node==='number'?String(node):children(node).map(text).join('');
 const primary=tree=>nodes(tree).find(node=>node.type==='a'&&text(node)==='继续今日学习');
 const button=(tree,label)=>{const found=nodes(tree).find(node=>node.type==='button'&&text(node)===label);assert(found,`Missing button: ${label}`);return found};
 function renderer(dependencies){
  const frames=new Map();let current,dirty=true,pending=[],renderRoot,props,tree,lateUpdates=0,focuses=0;
  const same=(a,b)=>a&&b&&a.length===b.length&&a.every((value,index)=>Object.is(value,b[index]));
  const runtime={dependencies,
   useState(initial){const frame=current,index=frame.index++;if(!frame.slots[index])frame.slots[index]={value:typeof initial==='function'?initial():initial};const slot=frame.slots[index];return [slot.value,change=>{if(!frame.mounted){lateUpdates++;return}const next=typeof change==='function'?change(slot.value):change;if(!Object.is(slot.value,next)){slot.value=next;dirty=true}}]},
   useRef(initial){const frame=current,index=frame.index++;if(!frame.slots[index])frame.slots[index]={value:{current:initial}};return frame.slots[index].value},
   useMemo(fn,deps){const frame=current,index=frame.index++,previous=frame.slots[index];if(!previous||!same(previous.deps,deps))frame.slots[index]={value:fn(),deps};return frame.slots[index].value},
   useEffect(fn,deps){const frame=current,index=frame.index++,previous=frame.slots[index];if(!previous||!same(previous.deps,deps)){const next={deps,cleanup:previous?.cleanup};frame.slots[index]=next;pending.push(()=>{next.cleanup?.();next.cleanup=fn()})}},
   render(Component,value){return component(Component,value,'root')},
  };
  function component(Component,value,key){let frame=frames.get(key);if(!frame||frame.Component!==Component){if(frame)dispose(frame);frame={Component,slots:[],index:0,mounted:true};frames.set(key,frame)}frame.index=0;frame.seen=true;const parent=current;current=frame;const node=Component(value);current=parent;return resolve(node,key)}
  function resolve(node,key){if(!node||typeof node!=='object')return node;if(typeof node.type==='function')return component(node.type,node.props,key+':'+node.type.name);if(node.props?.ref)node.props.ref.current??={focus(){focuses++}};return {...node,props:{...node.props,children:children(node).map((child,index)=>resolve(child,key+'.'+index))}}}
  function dispose(frame){frame.mounted=false;for(const slot of frame.slots)slot?.cleanup?.()}
  function flush(){let guard=0;while(dirty){assert(++guard<30,'Hook harness render loop');dirty=false;pending=[];for(const frame of frames.values())frame.seen=false;tree=renderRoot(props);for(const [key,frame] of frames)if(!frame.seen){dispose(frame);frames.delete(key)}const effects=pending;pending=[];for(const effect of effects)effect()}return tree}
  renderRoot=ui.createRenderer(runtime);
  return {mount(value){props=value;dirty=true;return flush()},update(value){props={...props,...value};dirty=true;return flush()},flush,
   async settle(){for(let i=0;i<8;i++){await Promise.resolve();if(dirty)flush()}return tree},
   get tree(){return tree},get lateUpdates(){return lateUpdates},get focuses(){return focuses},
   unmount(){for(const frame of frames.values())dispose(frame);frames.clear();dirty=false},
  };
 }
 async function environment(port,at,run){
  const saved=new Map(['window','localStorage','setInterval','clearInterval'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)])),savedNow=Date.now;
  let now=at,nextTimer=1,storageAccesses=0;const listeners=new Map(),timers=new Map();
  const window={addEventListener(name,callback){if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(callback)},removeEventListener(name,callback){listeners.get(name)?.delete(callback)}};
  const env={port,get storageAccesses(){return storageAccesses},advance(value){now=value},event(type,key){for(const callback of [...listeners.get(type)||[]])callback({type,key})},tick(){for(const callback of [...timers.values()])callback.fn()},count(type){return listeners.get(type)?.size||0},get intervals(){return [...timers.values()].map(timer=>timer.ms)}};
  Object.defineProperty(globalThis,'window',{configurable:true,value:window});Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){storageAccesses++;if(port instanceof Error)throw port;return port}});
  Object.defineProperty(globalThis,'setInterval',{configurable:true,value:(fn,ms)=>{const id=nextTimer++;timers.set(id,{fn,ms});return id}});
  Object.defineProperty(globalThis,'clearInterval',{configurable:true,value:id=>timers.delete(id)});Date.now=()=>now;
  try{return await run(env)}finally{Date.now=savedNow;for(const [key,descriptor] of saved)descriptor?Object.defineProperty(globalThis,key,descriptor):delete globalThis[key]}
 }
 const dependencies={...capability,todayPractice};
 const props=()=>({state:state(),map:progress(),ready:true,online:true,compact:true});
 test('the real queue waits for its first read, then renders exactly one due primary link without writes',async()=>{
  const port=memory(rawPlan);await environment(port,DUE,async()=>{const view=renderer(dependencies),input=props(),before=JSON.stringify(input);assert.match(text(view.mount(input)),/正在安排/);await view.settle();assert.equal(primary(view.tree)?.props.href,taskHref);assert.equal(nodes(view.tree).filter(node=>node.type==='a'&&text(node)==='继续今日学习').length,1);assert.equal(port.stats.gets,1);assert.equal(JSON.stringify(input),before);noWrites(port);view.unmount()});
 });
 test('the 30-second clock exposes a newly due task without a page reload',async()=>{
  const port=memory(rawPlan);await environment(port,DUE-1,async env=>{const view=renderer(dependencies);view.mount(props());await view.settle();assert.notEqual(primary(view.tree)?.props.href,taskHref);assert.deepEqual(env.intervals,[30000]);env.advance(DUE);env.tick();await view.settle();assert.equal(primary(view.tree)?.props.href,taskHref);assert.equal(port.stats.gets,2);noWrites(port);view.unmount()});
 });
 test('focus, pageshow and matching storage events refresh even when the clock has not advanced',async()=>{
  const port=memory();await environment(port,DUE,async env=>{const view=renderer(dependencies);view.mount(props());await view.settle();assert.notEqual(primary(view.tree)?.props.href,taskHref);
   port.external(rawPlan);env.event('focus');await view.settle();assert.equal(primary(view.tree)?.props.href,taskHref);
   port.external(JSON.stringify(nextPlan));env.event('pageshow');await view.settle();assert.notEqual(primary(view.tree)?.props.href,taskHref);
   let reads=port.stats.gets;env.event('storage','unrelated-key');await view.settle();assert.equal(port.stats.gets,reads);
   port.external(rawPlan);env.event('storage',capability.capabilityReviewStorageKey);await view.settle();assert.equal(primary(view.tree)?.props.href,taskHref);assert.equal(port.stats.gets,++reads);
   port.external(null);env.event('storage',null);await view.settle();assert.notEqual(primary(view.tree)?.props.href,taskHref);assert.equal(port.stats.gets,++reads);noWrites(port);
   view.unmount();for(const event of ['focus','pageshow','storage'])assert.equal(env.count(event),0);assert.deepEqual(env.intervals,[]);env.event('focus');env.tick();await view.settle();assert.equal(port.stats.gets,reads);
  });
 });
 test('an obsolete async read cannot resurrect a task after a newer read has removed it',async()=>{
  const requests=[],port=memory(rawPlan);await environment(port,DUE,async env=>{const view=renderer({...dependencies,readCapabilityPractice:()=>new Promise(resolve=>requests.push(resolve))});view.mount(props());assert.equal(requests.length,1);env.event('focus');view.flush();assert.equal(requests.length,2);
   requests[1]({tasks:[],error:''});await view.settle();assert.notEqual(primary(view.tree)?.props.href,taskHref);
   requests[0](await read(rawPlan));await view.settle();assert.notEqual(primary(view.tree)?.props.href,taskHref);assert.equal(view.lateUpdates,0);view.unmount();noWrites(port);
  });
 });
 test('unmount cancels an in-flight read and removes listeners and timers',async()=>{
  let resolve;const port=memory(rawPlan);await environment(port,DUE,async env=>{const view=renderer({...dependencies,readCapabilityPractice:()=>new Promise(done=>{resolve=done})});view.mount(props());view.unmount();resolve(await read(rawPlan));await view.settle();assert.equal(view.lateUpdates,0);for(const event of ['focus','pageshow','storage'])assert.equal(env.count(event),0);assert.deepEqual(env.intervals,[]);noWrites(port)});
 });
 test('host readiness defers storage reads and an offline consumer never accesses browser storage',async()=>{
  const port=memory(rawPlan);await environment(port,DUE,async()=>{const view=renderer(dependencies);view.mount({...props(),ready:false});await view.settle();assert.match(text(view.tree),/正在安排/);assert.equal(port.stats.gets,0);view.update({ready:true});await view.settle();assert.equal(primary(view.tree)?.props.href,taskHref);view.unmount();noWrites(port)});
  let touches=0;const trap=new Proxy({},{get(){touches++;throw Error('Offline storage access')}});await environment(trap,DUE,async env=>{const view=renderer(dependencies);view.mount({...props(),online:false});await view.settle();env.event('focus');env.event('pageshow');env.tick();await view.settle();assert.equal(touches,0);assert.equal(env.storageAccesses,0,'Offline must not even request the browser storage port');assert.notEqual(primary(view.tree)?.props.href,taskHref);assert.doesNotMatch(text(view.tree),/复习计划暂时无法读取/);view.unmount()});
 });
 test('switching offline cancels a stale online read and hides online recovery messages',async()=>{
  let finish;const port=memory(rawPlan);await environment(port,DUE,async()=>{const view=renderer({...dependencies,readCapabilityPractice:(_now,online)=>online?new Promise(resolve=>{finish=resolve}):Promise.resolve({tasks:[],error:''})});view.mount(props());view.update({online:false});await view.settle();finish({tasks:(await read(rawPlan)).tasks,error:'old online error'});await view.settle();assert.notEqual(primary(view.tree)?.props.href,taskHref);assert.doesNotMatch(text(view.tree),/old online error|检查句子练习的保存状态/);assert.equal(view.lateUpdates,0);view.unmount();noWrites(port)});
 });
 test('real consumer errors stay visible with recovery guidance and never clear the original raw record',async()=>{
  for(const port of [...invalidRaws.map(raw=>memory(raw)),memory(rawPlan,{throwRead:true}),new Error('Browser storage disabled')])await environment(port,DUE,async()=>{
   const before=port.raw,view=renderer(dependencies);view.mount(props());await view.settle();assert(nodes(view.tree).some(node=>node.props.role==='alert'&&/原记录保留/.test(text(node))));assert(nodes(view.tree).some(node=>node.type==='a'&&node.props.href==='/demos/yesterday/'&&text(node)==='检查句子练习的保存状态'));assert(primary(view.tree),'Other safe learning remains available');if(!(port instanceof Error)){assert.equal(port.raw,before);noWrites(port)}view.unmount();
  });
 });
 test('skip and restore run the real TSX handlers but never change due dates, canonical storage or learner state',async()=>{
  const port=memory(rawPlan);await environment(port,DUE,async()=>{const view=renderer(dependencies),input=props(),before=JSON.stringify(input);view.mount(input);await view.settle();const reads=port.stats.gets;assert.equal(primary(view.tree)?.props.href,taskHref);
   button(view.tree,'这项稍后再做').props.onClick();await view.settle();assert.notEqual(primary(view.tree)?.props.href,taskHref);assert.match(text(view.tree),/本次暂缓/);assert.equal(port.raw,rawPlan);assert.equal(JSON.stringify(input),before);assert.equal(port.stats.gets,reads);noWrites(port);
   button(view.tree,'恢复推荐顺序').props.onClick();await view.settle();assert.equal(primary(view.tree)?.props.href,taskHref);assert.equal(port.raw,rawPlan);assert.equal(port.stats.gets,reads);assert(view.focuses>0);view.unmount();
   const reopened=renderer(dependencies);reopened.mount(input);await reopened.settle();assert.equal(primary(reopened.tree)?.props.href,taskHref,'A new mount does not remember a session-only skip');noWrites(port);reopened.unmount();
  });
 });

 let failures=0;
 for(const {name,run} of tests){try{await run();console.log('PASS '+name)}catch(error){failures++;console.error('FAIL '+name+'\n'+error.stack)}}
 console.log(`${tests.length-failures}/${tests.length} capability schedule/consumer checks passed (Node model + real TSX with in-memory hooks; no browser).`);
 if(failures)process.exitCode=1;
}finally{await rm(temporary,{recursive:true,force:true})}
