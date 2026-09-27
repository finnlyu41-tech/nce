import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
const root=new URL('../',import.meta.url);
const load=async file=>import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(await readFile(new URL('app/'+file,root),'utf8'))).toString('base64'));
const {chineseRecallPrompts}=await load('chinese-recall.ts');
const {splitLesson}=await load('lesson-structure.ts');
assert.deepEqual(chineseRecallPrompts([]),[]);
const fragments=[{en:'When I got home,',zh:'我到家时，',time:1},{en:'it was raining.',zh:'正在下雨。',time:3},{en:'Hello!',zh:'你好！',time:6}];
assert.deepEqual(chineseRecallPrompts(fragments),[
 {en:'When I got home, it was raining.',zh:'我到家时， 正在下雨。',first:0,last:1},
 {en:'Hello!',zh:'你好！',first:2,last:2},
]);
assert.equal(chineseRecallPrompts(fragments.map((r,i)=>({...r,zh:i===1?'':r.zh})))[0].zh,'','Incomplete translations never become misleading partial prompts');
assert.equal(chineseRecallPrompts([{en:'Good morning',zh:'早上好'},{en:'Welcome',zh:'欢迎'}]).length,2,'Untimed custom text keeps its line boundaries');
assert.equal(chineseRecallPrompts([{en:"'Yes!'",zh:'是的！',time:1},{en:'I left.',zh:'我离开了。',time:3}]).length,2,'Quoted sentences keep their boundary');
let lessons=0,total=0,missing=0,maxRows=0;
for(const [book,count,step] of [['NCE1',144,2],['NCE2',96,1],['NCE3',60,1],['NCE4',48,1]]){
 for(let lesson=1;lesson<=count;lesson+=step){
  const {rows}=JSON.parse(await readFile(new URL(`dist-online/language/${book}/${lesson}.json`,root),'utf8'));
  const body=splitLesson(rows,book,true).body,prompts=chineseRecallPrompts(body);
  assert.equal(prompts[0].first,0);assert.equal(prompts.at(-1).last,body.length-1);
  for(const [i,p] of prompts.entries()){
   assert.equal(p.first,i?prompts[i-1].last+1:0,'No row is repeated or lost');
   const source=body.slice(p.first,p.last+1);
   assert.equal(p.en,source.map(r=>r.en.trim()).join(' '));
   assert.equal(p.zh,source.every(r=>r.zh.trim())?source.map(r=>r.zh.trim()).join(' '):'');
   assert(body[p.first].time<=body[p.last].time,'Audio span keeps original timestamps');
   if(body[p.last+1])assert(body[p.last+1].time>body[p.last].time,'Audio ends before the next prompt');
   if(!p.zh)missing++;
   maxRows=Math.max(maxRows,source.length);
  }
  total+=prompts.length;lessons++;
 }
}
console.log(`${lessons} lessons, ${total} Chinese prompts, ${missing} missing translations; source and audio-span checks passed (max ${maxRows} subtitle fragments per prompt).`);
