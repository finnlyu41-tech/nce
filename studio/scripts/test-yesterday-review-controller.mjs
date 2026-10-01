import assert from 'node:assert/strict';

// Control the exact microtask interleaving that previously lost the last save notification.
import {createReviewController} from '../public/demos/yesterday/review-controller.mjs';
import {initialState,submit,finishDemo} from '../public/demos/yesterday/model.mjs';
import {STORAGE_KEY} from '../public/demos/yesterday/review-adapter.mjs';
const nodes=new Map();
globalThis.document={hidden:false,getElementById(id){if(!nodes.has(id))nodes.set(id,{innerHTML:''});return nodes.get(id);},addEventListener(){},removeEventListener(){}};
globalThis.window={location:{search:'',pathname:'/demos/yesterday/'},history:{replaceState(){}},addEventListener(){},removeEventListener(){},setInterval(){return 0;}};
const clock=1700000001000;
const storage={values:new Map(),getItem(k){return this.values.get(k)??null;},setItem(k,v){this.values.set(k,String(v));}};
const locks={async request(name,options,callback){return callback({name,mode:options.mode});}};
let state=initialState(clock-1000);
state=submit(state,'new-omar',1,clock-500);
state=submit(state,'new-may',2,clock-400);
state=finishDemo(state,'',clock-100);
let saved=false,scheduled=false,controller;
const host={
  getState:()=>state,
  isSaved:()=>saved,
  persist:async()=>{},
  replaceState:next=>{state=next;},
  change:next=>{state=next;},
  render(){
    if(!saved&&!scheduled){
      scheduled=true;
      // Demo save settles after refresh's isSaved check, before its finally.
      queueMicrotask(()=>{saved=true;controller.onDemoSaved();});
    }
  },
};
controller=createReviewController(host,{storage,locks,now:()=>clock});
try{
  await controller.refresh();
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(saved,true);
  assert.notEqual(storage.getItem(STORAGE_KEY),null,'The last onDemoSaved event must cause automatic seeding without a later focus/timer/manual refresh.');
  const first=storage.getItem(STORAGE_KEY);
  await controller.refresh();
  assert.equal(storage.getItem(STORAGE_KEY),first,'A repeated refresh must preserve the first plan.');
  console.log('Controller audit: save-completion/refresh interleaving passed.');
}finally{controller.dispose();}
