/** TEST ONLY. All answers and times below are synthetic QA evidence.
 * Uses the registered production factory and native progress-file serializer;
 * reads no personal storage and never changes a learning record. */
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {productionHost,fixtureForId,supportedCourseIds} from '../batch-01/production-test-binding.mjs';
import {createCourseLoopModel} from '../model.mjs';
export const DAY=86400000, FIXED_NOW=1791028800000;
export const SYNTHETIC_LABEL='SYNTHETIC QA: factory simulations; not personal learning records, not natural delayed evidence.';
export const host=await productionHost();
assert.equal(supportedCourseIds.length,18);
const fixtures=new Map();
async function fixture(id){if(!fixtures.has(id))fixtures.set(id,await fixtureForId(id));return fixtures.get(id)}

export async function exhaustionCase(id,{start=FIXED_NOW-20*DAY,mode='failed-helped',banks=2}={}){
 assert.ok(supportedCourseIds.includes(id));assert.ok(['failed-helped','independent'].includes(mode));assert.ok([0,1,2].includes(banks));
 const f=await fixture(id),model=host.courseLoopFor(id).model;
 let at=start,state=model.initialState(start),view=model.inspect(state,at).view;
 const send=action=>{const r=model.transition(state,action,++at);assert.ok(r.ok,`${id}: ${r.message}`);state=r.state;view=r.view;return r};
 const bank=(stage,review=false)=>{
  assert.equal(view.phase,stage);
  for(const [index,q] of f.content.questionsFor(stage).entries()){
   if(review&&mode==='failed-helped'&&index===1)send({type:'help'});
   const answer=review&&mode==='failed-helped'&&index===0?`SYNTHETIC wrong answer: ${stage}/${id}`:q.accepted[0];
   send({type:'draft',value:answer});send({type:'submit'});send({type:'next'});
  }
 };
 bank('diagnostic');send({type:'next'});bank('guided');bank('independent');send({type:'next'});bank('repair');
 send({type:'own-draft',value:'Synthetic QA expression awaiting an actual human reviewer.'});send({type:'finish'});
 const waiting=structuredClone(state),waitingAt=at,firstDue=view.dueAt;
 const checkpoints=[];
 for(const stage of ['review-a','review-b'].slice(0,banks)){
  at=view.dueAt;send({type:'review'});bank(stage,true);send({type:'next'});
  checkpoints.push({stage,state:structuredClone(state),at,dueAt:view.dueAt});
 }
 const raw=JSON.stringify(state),factory=createCourseLoopModel(f.content),direct=factory.restore(raw,at),parsed=host.parseCourseLoop(raw,at,id);
 assert.ok(direct.ok);assert.deepEqual(parsed,direct);
 return {id,mode,content:f.content,model,keys:f.keys,state,view,raw,at,dueAt:view.dueAt,waiting,waitingAt,firstDue,checkpoints};
}
export function snapshotFor(cases){return {...structuredClone(host.initial),drafts:Object.fromEntries(cases.map(c=>[c.keys.snapshot,c.raw]))}}

export async function prepareExhaustionFixture({now=Date.now(),directory='/tmp/nce-course-exhaustion-qa'}={}){
 // Failed/helped last review waits one day. Independent last review waits seven
 // days. Starts leave both exhausted cases due at the captured runtime clock.
 const failed=await exhaustionCase('nce1-13',{start:now-4*DAY,mode:'failed-helped'});
 const passed=await exhaustionCase('nce1-25',{start:now-17*DAY,mode:'independent'});
 const waiting=await exhaustionCase('nce1-35',{start:now-3600000,mode:'independent',banks:0});
 const cases=[failed,passed,waiting],state=snapshotFor(cases);state.drafts['qa-synthetic-course-exhaustion-label']=SYNTHETIC_LABEL;
 assert.equal(host.validateState(state),true);const file=host.makeProgressFile(state,new Date(now));
 const restored=await host.readProgressFile(file);assert.deepEqual(restored.state,state);
 const before=JSON.stringify(state),map=host.emptyProgress();
 const metadata={label:SYNTHETIC_LABEL,capturedNow:now,capturedISO:new Date(now).toISOString(),cases:cases.map(c=>({id:c.id,mode:c.mode,banks:c.view.reviewResults.length,lastEventAt:c.at,dueAt:c.dueAt,dueISO:new Date(c.dueAt).toISOString(),recommendation:c.model.recommendation(c.view,now),task:host.courseLoopTask(state,now,c.id)})),mapRecords:map.records,personalRecordsRead:false,naturalDelayClaim:false,serializer:'productionHost.makeProgressFile/readProgressFile'};
 assert.equal(JSON.stringify(state),before);await mkdir(directory,{recursive:true});
 const path=directory+'/latest.json',metadataPath=directory+'/latest-timings.json';await writeFile(path,new Uint8Array(await file.arrayBuffer()));await writeFile(metadataPath,JSON.stringify(metadata,null,2)+'\n');
 return {path,metadataPath,bytes:file.size,...metadata};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1])console.log(JSON.stringify(await prepareExhaustionFixture(),null,2));
