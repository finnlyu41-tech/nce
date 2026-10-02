import assert from 'node:assert/strict';
import {mkdir,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url),pnpm=new URL('node_modules/.pnpm/',root);
const versions=(await readdir(pnpm)).filter(n=>/^esbuild@\d+\.\d+\.\d+$/.test(n)).sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}));
const {build}=await import(new URL(versions[0]+'/node_modules/esbuild/lib/main.js',pnpm));
const output=new URL('work/course-loop-ux/model.mjs',root);await mkdir(new URL('.',output),{recursive:true});
await build({stdin:{contents:`export * from './app/course-loop-summary';export * from './app/course-loop-summary-ui';export * from './app/course-loop-next';export * from './app/course-loop-progress';export {initial} from './app/model';export {emptyProgress,unlockNode,startNode,achieved} from './map/model';export {todayPractice} from './app/today-practice';export {parseLearningRoute} from './map/navigation';export {questionsFor} from './course-loop/lesson-nce1-001.mjs';export {nodeById} from './map/content';export {createElement} from 'react';export {renderToStaticMarkup} from 'react-dom/server';`,resolveDir:fileURLToPath(root),loader:'tsx'},bundle:true,platform:'node',format:'esm',target:'node22',loader:{'.css':'empty'},external:['react','react-dom/server','react/jsx-runtime'],outfile:fileURLToPath(output),logLevel:'silent'});
const m=await import(output),now=Date.now();let tick=now-10000,s=m.loopModel.initialState(tick);
const state=()=>({...structuredClone(m.initial),drafts:{[m.courseLoopKey]:JSON.stringify(s)}}),map=m.emptyProgress();
const send=action=>{const result=m.loopModel.transition(s,action,++tick);assert(result.ok,result.message);s=result.state;return result.view};
const summary=()=>m.courseLoopSummary(state(),map,now);
assert.equal(m.courseLoopSummary(m.initial,map,now).status,'none');
const unknown={...structuredClone(m.initial),drafts:{[m.courseLoopKey]:'{"version":999}'}};const before=JSON.stringify(unknown);
assert.equal(m.courseLoopSummary(unknown,map,now).status,'blocked');assert.equal(JSON.stringify(unknown),before);
assert(m.todayPractice(state(),map,now).some(task=>task.href==='/map/#/learn/nce1-1?access=1'));
assert.equal(summary().label,'本轮训练进行中');assert.equal(summary().currentHelp,false);assert.equal(summary().mapLabel,'地图检验：尚未达标');
send({type:'help'});assert.equal(summary().currentHelp,true);assert.equal(summary().attempts,0);
for(const stage of ['diagnostic','guided','independent']){
 if(stage==='guided')send({type:'next'});
 for(const q of m.questionsFor(stage)){send({type:'draft',value:q.accepted[0]});send({type:'submit'});send({type:'next'})}
}
assert.equal(summary().helped,4);assert.equal(summary().independent,3);assert.equal(summary().independentMatched,3);
send({type:'next'});for(const q of m.questionsFor('repair')){send({type:'draft',value:q.accepted[0]});send({type:'submit'});send({type:'next'})}
send({type:'own-draft',value:'Is this your phone? Yes, it is.'});send({type:'finish'});
assert(m.todayPractice(state(),map,summary().dueAt).some(task=>task.href==='/map/#/learn/nce1-1?access=1'));
const full=state(),frozen=JSON.stringify({full,map}),view=summary();assert.equal(view.label,'本轮训练已完成 · 待复验');assert.equal(view.reviewResults,0);assert.equal(view.ownStatus,'awaiting-human-review');assert.equal(view.mapLabel,'地图检验：尚未达标');
const destination=m.courseDestination(full,map,now);assert.equal(destination.node.id,'nce1-3');assert.equal(destination.href,'/map/#/learn/nce1-3?access=1');assert.equal(destination.needsAccess,true);
assert(m.todayPractice(full,map,now).some(task=>task.href===destination.href));assert.equal(JSON.stringify({full,map}),frozen);
const entered=m.unlockNode(map,destination.node.id);assert.deepEqual(entered.records,map.records);assert.deepEqual(entered.access.nodes,['nce1-3']);assert.equal(m.courseAccessHref(destination.node.id,entered,now),'/map/#/learn/nce1-3');
const started=m.startNode(entered,destination.node.id,now);assert(!started.records[destination.node.id].attempts.length);assert.equal(m.achieved(m.nodeById(destination.node.id),started,now),false);assert.equal(full.attempts,0);assert.equal(full.flashcards,undefined);
assert.equal(m.parseLearningRoute('#/learn/nce1-3?access=1').manualAccess,true);
for(const route of ['#/learn/unknown?access=1','#/map/nce1-3?access=1','#/courses?access=1','#/learn/nce1-3?access=1&review=1','#/learn/nce1-3?access=1&speaking=practice'])assert.equal(m.parseLearningRoute(route).manualAccess,undefined,route);
const heading=m.renderToStaticMarkup(m.createElement(m.CourseLoopHeadingSummary,{state:full,map})),records=m.renderToStaticMarkup(m.createElement(m.CourseLoopRecords,{state:full,map}));
assert(heading.includes('本轮训练已完成 · 待复验'));assert(heading.includes('地图检验：尚未达标'));assert(records.includes('原始作答 12 次'));assert(records.includes('复验已记录 0 轮'));assert(records.includes('待人工核对'));
assert.equal(JSON.stringify({full,map}),frozen);
const aged=structuredClone(s);aged.createdAt-=2*86400000;for(const event of aged.events)event.at-=2*86400000;
const reviewed=m.loopModel.transition(aged,{type:'review'},now);assert(reviewed.ok,reviewed.message);const reviewing={...full,drafts:{...full.drafts,[m.courseLoopKey]:JSON.stringify(reviewed.state)}};
assert.equal(m.courseLoopSummary(reviewing,map,now).label,'到期复验进行中');
const reviewingText=m.renderToStaticMarkup(m.createElement(m.CourseLoopRecords,{state:reviewing,map}));assert(reviewingText.includes('本次复验已开始，接着未提交题继续'));assert(!reviewingText.includes('到期前可以继续后续课次'));assert.equal(full.drafts[m.courseLoopKey],JSON.stringify(s));
console.log('PASS 7 saved-summary states, blocked-record preservation, shared next access intent, readonly Today, explicit access-only map change, scoped route parsing, and separate CL/map/FSRS SSR groups (synthetic model timestamps).');
