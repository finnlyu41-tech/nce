import assert from 'node:assert/strict';
import {createReviewController} from '../public/demos/yesterday/review-controller.mjs';
import {createReviewStore,STORAGE_KEY,DAY_MS} from '../public/demos/yesterday/review-adapter.mjs';
import {initialState,submit,finishDemo} from '../public/demos/yesterday/model.mjs';
import {currentReviewQuestion} from '../public/demos/yesterday/review-model.mjs';

// Standalone controller integration audit. No browser, network or project writes.
const START=Date.UTC(2026,9,1,12);
class MemoryStorage {
  values=new Map();
  failReview=false;
  getItem(key){return this.values.get(key)??null;}
  setItem(key,value){
    if(this.failReview&&key===STORAGE_KEY)throw new Error('quota');
    this.values.set(key,String(value));
  }
}
class SerialLocks {
  tail=Promise.resolve();
  async request(name,options,callback){
    const previous=this.tail;
    let release;
    this.tail=new Promise(resolve=>{release=resolve;});
    await previous;
    try{return await callback({name,mode:options.mode});}
    finally{release();}
  }
}
function createHarness(){
  const nodes=new Map();
  globalThis.document={
    hidden:false,
    getElementById(id){
      if(!nodes.has(id))nodes.set(id,{innerHTML:''});
      return nodes.get(id);
    },
    addEventListener(){},removeEventListener(){},
  };
  globalThis.window={
    location:{href:'http://example.test/demos/yesterday/',search:''},
    history:{replaceState(_state,_title,value){
      window.location.href=String(value);
      window.location.search=new URL(value).search;
    }},
    addEventListener(){},removeEventListener(){},setInterval(){return 0;},
  };
  let time=START,state=initialState(START-1000),saved=true,view=null,controller;
  state=submit(state,'new-omar',1,START-500);
  state=submit(state,'new-may',2,START-400);
  state=finishDemo(state,'Retain my original draft.',START-100);
  const storage=new MemoryStorage(),locks=new SerialLocks();
  const host={
    getState:()=>state,isSaved:()=>saved,persist:async()=>{},
    replaceState(next){state=next;},
    change(next){state=next;host.render();},
    render(){view=controller.render();},
  };
  controller=createReviewController(host,{storage,locks,now:()=>time});
  return {
    controller,storage,locks,
    get state(){return state;},get view(){return view;},
    get time(){return time;},set time(value){time=value;},
    set saved(value){saved=value;},
    step(){time++;},
    snapshot(){return JSON.parse(storage.getItem(STORAGE_KEY));},
  };
}
const action=(h,name)=>h.controller.handle({dataset:{action:name}});
async function makeDue(h){
  await h.controller.init();
  assert.equal(h.snapshot().plan.receipts.length,0);
  h.time+=DAY_MS;
  await h.controller.refresh();
}
async function answerThree(h){
  await action(h,'review-open');
  assert.equal(h.state.reviewSession.attempts.length,0);
  assert.equal(h.snapshot().plan.receipts.length,0,'Opening or exposing a question is not a recorded result.');
  for(let index=0;index<3;index++){
    const choice=currentReviewQuestion(h.state.reviewSession).correct;
    await h.controller.handle({dataset:{reviewChoice:String(choice)}});
    h.step();await action(h,'review-submit');
    h.step();await action(h,'review-next');
  }
}
let checks=0;
async function check(name,body){
  const h=createHarness();
  try{await body(h);checks++;console.log(`✓ ${name}`);}
  finally{h.controller.dispose();}
}

await check('Review write failure retains answers; confirmed retry records once without resetting time or interval',async h=>{
  await makeDue(h);
  const originalPlan=h.storage.getItem(STORAGE_KEY);
  h.storage.failReview=true;
  await answerThree(h);
  const retainedAnswers=JSON.stringify(h.state.reviewSession.attempts);
  assert.equal(h.state.reviewSession.attempts.length,3);
  assert.equal(h.state.draft,'Retain my original draft.');
  assert.equal(h.storage.getItem(STORAGE_KEY),originalPlan,'A failed review write must retain the existing plan.');
  assert.equal(h.snapshot().plan.receipts.length,0);
  assert.match(h.view.html,/保存未能确认/);
  assert.doesNotMatch(h.view.html,/结果与排期已自动保存/);
  assert.match(h.view.actions,/review-save/);
  h.storage.failReview=false;
  await action(h,'review-save');
  assert.equal(JSON.stringify(h.state.reviewSession.attempts),retainedAnswers,'Retry must not replace the first answers.');
  assert.equal(h.snapshot().plan.receipts.length,1);
  assert.equal(h.snapshot().plan.receipts[0].outcome,'passed');
  assert.match(h.view.html,/结果与排期已自动保存/);
  const canonicalRaw=h.storage.getItem(STORAGE_KEY);
  h.time+=60000;
  await action(h,'review-save');
  assert.equal(h.storage.getItem(STORAGE_KEY),canonicalRaw,'A late duplicate retry must preserve the original receipt timestamp and schedule.');
});

await check('Unconfirmed demo answers cannot produce a review receipt; confirmation followed by retry can',async h=>{
  await makeDue(h);
  h.saved=false;
  await answerThree(h);
  const retainedAnswers=JSON.stringify(h.state.reviewSession.attempts);
  assert.equal(h.state.reviewSession.attempts.length,3);
  assert.equal(h.snapshot().plan.receipts.length,0);
  assert.match(h.view.html,/保存未能确认/);
  assert.doesNotMatch(h.view.html,/结果与排期已自动保存/);
  h.saved=true;
  await action(h,'review-save');
  assert.equal(JSON.stringify(h.state.reviewSession.attempts),retainedAnswers);
  assert.equal(h.snapshot().plan.receipts.length,1);
  assert.match(h.view.html,/结果与排期已自动保存/);
});

await check('First conflicting receipt and schedule win; refresh retains the conflict explanation and local answers',async h=>{
  await makeDue(h);
  h.saved=false;
  await answerThree(h);
  const retainedAnswers=JSON.stringify(h.state.reviewSession.attempts);
  assert.equal(h.snapshot().plan.receipts.length,0);
  const external=createReviewStore({storage:h.storage,locks:h.locks,now:()=>h.time});
  const taskId=h.state.reviewSession.taskId;
  const result=await external.recordResult({taskId,resultId:`${taskId}:result`,outcome:'needs-practice',at:h.time});
  assert.equal(result.ok,true);
  await h.controller.refresh();
  assert.match(h.view.html,/另一个标签已经提交/);
  assert.match(h.view.html,/已按需要再练结果安排/);
  assert.equal(h.snapshot().plan.receipts[0].nextDueAt,h.time+DAY_MS);
  const canonicalRaw=h.storage.getItem(STORAGE_KEY);
  h.saved=true;
  await action(h,'review-save');
  assert.equal(h.storage.getItem(STORAGE_KEY),canonicalRaw,'The local passed result must not overwrite the first needs-practice receipt.');
  await h.controller.refresh();
  assert.equal(h.storage.getItem(STORAGE_KEY),canonicalRaw);
  assert.equal(JSON.stringify(h.state.reviewSession.attempts),retainedAnswers);
  assert.match(h.view.html,/另一个标签已经提交/,'A successful refresh must not erase the outcome conflict explanation.');
  assert.match(h.view.html,/已按需要再练结果安排/);
  assert.equal(h.snapshot().plan.receipts.length,1);
  assert.equal(h.snapshot().plan.receipts[0].outcome,'needs-practice');
});
console.log(`Controller save audit: ${checks} integration checks passed.`);
