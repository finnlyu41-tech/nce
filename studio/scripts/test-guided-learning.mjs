import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
const root=new URL('../',import.meta.url);
const moduleUrl=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const source=async file=>stripTypeScriptTypes(await readFile(new URL('app/'+file,root),'utf8'));
const {splitLesson}=await import(moduleUrl(await source('lesson-structure.ts')));
const {frames,sentenceFor,guideFor,readGuide}=await import(moduleUrl(await source('expression-guide.ts')));
const {initial,validateState}=await import(moduleUrl(await source('model.ts')));
const {overallBand,readMocks,meetsTarget,readiness}=await import(moduleUrl(await source('readiness.ts')));
let count=0;
for(const [book,total,step] of [['NCE1',144,2],['NCE2',96,1],['NCE3',60,1],['NCE4',48,1]]){
 for(let lesson=1;lesson<=total;lesson+=step){
  const {rows}=JSON.parse(await readFile(new URL(`dist-online/language/${book}/${lesson}.json`,root),'utf8'));
  const parsed=splitLesson(rows,book,true);
  const expected=book==='NCE1'?4:book==='NCE2'?([8,37].includes(lesson)?2:1):book==='NCE3'&&lesson===35?4:3;
  assert.equal(parsed.bodyStart,expected,book+' '+lesson+' front matter boundary');
  assert(parsed.question.length>0&&parsed.body.length>2);
  assert.deepEqual([...parsed.intro,...parsed.body],rows,'No original rows or timestamps are removed or rewritten');
  assert(parsed.body[0].time>parsed.question.at(-1).time);
  const guide=guideFor(parsed.body,book);assert(parsed.body.includes(guide.source),'Every lesson anchors its guide to a real body sentence');
  count++;
 }
}
const custom=[{en:'Where do you live?',zh:'你住哪里？'},{en:'I live here.',zh:'我住这里。'}];
assert.deepEqual(splitLesson(custom,'NCE2',false).body,custom,'A custom dialogue opening question is retained');
assert.equal(splitLesson([]).body.length,0);
for(const frame of frames)for(const n of [0,1,2]){
 const selected=frame.slots.map(()=>n);
 assert(!/[{}]/.test(sentenceFor(frame,selected)));assert(!/[{}]/.test(sentenceFor(frame,selected,true)));
}
assert.equal(guideFor([{en:'Is this your handbag?',zh:''}],'NCE1').frame.id,'ownership');
assert.equal(readGuide('{bad').step,0);assert.deepEqual(readGuide('{"selected":[-1,999,"x"],"step":999}').selected,[0,0,0]);
const mock={id:'1',date:'2026-09-25',paper:'Practice A',kind:'academic',scores:['6.5','6.5','6','7'],unseen:true,timed:true,reviewer:'Teacher feedback',feedback:'Improve paragraph examples.'};
assert.equal(overallBand([6.5,6.5,5,7]),6.5);assert.equal(overallBand([6.5,6.5,5.5,6]),6);
assert(meetsTarget(mock,6));assert(!meetsTarget({...mock,date:'2026-02-30'},6),'Nonexistent calendar dates cannot meet readiness');assert(!meetsTarget({...mock,scores:['6.5','6.5','','7']},0),'Missing scores are not zero');
assert(!meetsTarget({...mock,reviewer:''},6));assert(!meetsTarget({...mock,feedback:''},6));
assert(!meetsTarget({...mock,unseen:false},6));assert(!meetsTarget({...mock,timed:false},6));
assert(!readiness([mock],6),'One result is not repeated evidence');
assert(!readiness([mock,{...mock,id:'2'}],6),'Repeating the same paper does not meet the criterion');
assert(!readiness([mock,{...mock,id:'2',paper:'Practice B',kind:'general'}],6),'Exam types are not mixed');
assert(readiness([mock,{...mock,id:'2',paper:'Practice B',date:'2026-09-26'}],6));
assert(!readiness([mock,{...mock,id:'2',paper:'Practice B',date:'2026-09-26'},{...mock,id:'3',paper:'Practice C',date:'2026-09-27',scores:['5','5','5','5']}],6),'Latest setback is not hidden by older results');
const drafts={'expression-NCE1-1':JSON.stringify({...readGuide(),meaning:'归属',keywords:'pen',answer:'This is my pen.',repair:'transfer',retry:'This is my book.',saved:true,category:'物品与归属'}),'speaking-plan-bank-1-1-0':JSON.stringify({answer:'I teach English.',points:['teacher']}),'ielts-readiness':JSON.stringify({minimum:'6',results:[mock]})};
assert(validateState({...initial,drafts}),'Existing backups accept new text records without migration');
assert.deepEqual(readMocks(drafts['ielts-readiness']).results,[mock]);
const store=(await source('offline-store.ts')).replace('{State,validateState','{validateState');
const {parsePack}=await import(moduleUrl(store.replace("'./model'",JSON.stringify(moduleUrl(await source('model.ts'))))));
const savedState={...initial,drafts};
const manifest=new TextEncoder().encode(JSON.stringify({version:1,state:savedState,media:[]}));
const pack=new Blob(['ENGLISH-STUDIO-PACK-1\n',String(manifest.length).padStart(12,'0')+'\n',manifest]);
assert.deepEqual((await parsePack(pack)).state.drafts,drafts,'Full backup round trip preserves expression, speaking and mock records');

const topics=JSON.parse(await readFile(new URL('dist-online/speaking/topics.json',root),'utf8'));
assert.equal(topics.topics.length,66);assert.equal(topics.topics.reduce((n,t)=>n+t.questions.length,0),238);
for(const topic of topics.topics){for(const q of topic.questions)assert.deepEqual(Object.keys(q).sort(),['en','sourceRow','zh'],'Only bilingual prompts and source row numbers enter the public bank');assert(topic.questions.every(q=>q.en.length>10&&q.zh.length>=4));assert(new Set(topic.questions.map(q=>q.en)).size===topic.questions.length)}
console.log(`${count} lesson boundaries, source-based guides, generated frames, draft compatibility, public question boundaries and readiness conditions passed.`);
