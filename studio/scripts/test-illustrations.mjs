import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {stripTypeScriptTypes} from 'node:module';

const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
const json=async path=>JSON.parse(await read(path));
const data=await json('app/data/nce-illustrations.json');
const pages=await json('app/data/nce-pages.json');
const index=await json('dist-online/lesson-pages/index.json');
const url=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const source=(await read('app/sentence-illustration.ts'))
 .replace("import illustrationData from './data/nce-illustrations.json';",`const illustrationData=${JSON.stringify(data)};`)
 .replace("import pageData from './data/nce-pages.json';",`const pageData=${JSON.stringify(pages)};`);
const {lessonIllustration,illustrationPanel,sentenceAtTime,sentenceEnd}=await import(url(stripTypeScriptTypes(source)));
const {splitLesson}=await import(url(stripTypeScriptTypes(await read('app/lesson-structure.ts'))));
assert.equal(data.version,1);
assert.equal(Object.keys(data.lessons).length,72);
assert.equal(data.sources.NCE1,pages.NCE1.sourceSha256);
let lines=0,pictures=0;
for(let lesson=1;lesson<=143;lesson+=2){
 const key=`NCE1-${lesson}`,entry=data.lessons[key];
 const lang=await json(`dist-online/language/NCE1/${lesson}.json`);
 const rows=splitLesson(lang.rows,'NCE1',true).body;
 assert.equal(entry.sourceSha256,lang.sourceSha256,`${key}: transcript edition`);
 assert.equal(entry.pageSha256,index.lessons[key].pages[0].sha256,`${key}: page edition`);
 const bytes=await readFile(new URL(`dist-online/lesson-pages/${entry.pageSha256}.jpg`,root));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.pageSha256,`${key}: actual image`);
 assert.deepEqual(lessonIllustration('NCE1',lesson,lang.sourceSha256,rows.length),entry);
 assert.equal(lessonIllustration('NCE1',lesson,'different transcript',rows.length),null);
 assert.equal(lessonIllustration('NCE1',lesson,lang.sourceSha256,rows.length+1),null);
 assert(['panels','lesson'].includes(entry.mode));
 assert(entry.size.length===2&&entry.size.every(n=>Number.isInteger(n)&&n>0));
 assert.equal(entry.linePanels.length,rows.length);
 assert.deepEqual([...new Set(entry.linePanels)],entry.boxes.map((_,i)=>i),`${key}: ordered and complete groups`);
 for(const [x,y,w,h] of entry.boxes){
  assert([x,y,w,h].every(Number.isFinite)&&x>=0&&y>=0&&w>0&&h>0&&x+w<=1.00001&&y+h<=1.00001,`${key}: crop bounds`);
 }
 for(let line=0;line<rows.length;line++){
  const time=rows[line].time;
  assert.equal(sentenceAtTime(rows,time),line,`${key}: timestamp ${line}`);
  assert(illustrationPanel(entry,line)?.box);
  const end=sentenceEnd(rows,line);
  if(end!==null){assert.equal(end,rows[line+1].time);assert.equal(sentenceAtTime(rows,end-.001),line);assert.equal(sentenceAtTime(rows,end),line+1);}
 }
 assert.equal(illustrationPanel(entry,-1),null);
 assert.equal(illustrationPanel(entry,rows.length),null);
 assert.equal(illustrationPanel(entry,1.5),null);
 assert.equal(sentenceAtTime(rows,rows[0].time-.01),-1,'Intro does not select a later panel');
 assert.equal(sentenceAtTime(rows,NaN),-1);
 assert.equal(sentenceEnd(rows,rows.length-1),null,'Final sentence can run to the recording end');
 lines+=rows.length;pictures+=entry.boxes.length;
}
assert.equal(lessonIllustration('NCE1',2,undefined,10),null,'No odd-lesson image for an even exercise lesson');
assert.equal(lessonIllustration('NCE2',1,undefined,10),null,'Other books retain the original page viewer');
assert.deepEqual(data.lessons['NCE1-1'].linePanels,[0,1,2,3,4,5,6]);
assert.deepEqual(data.lessons['NCE1-3'].linePanels,[0,1,2,2,3,4,4,5,5,6,6,6],'A two-sentence exchange stays on one panel');
assert.equal(data.lessons['NCE1-41'].boxes.length,10,'Small object illustrations must not disappear');
assert.equal(data.lessons['NCE1-55'].boxes.length,8,'Adjacent panels must stay separate');
assert.equal(data.lessons['NCE1-71'].linePanels[7],2,'End of a split quote stays on its picture');
assert.equal(data.lessons['NCE1-97'].linePanels[12],4,'Continued address stays on the address panel');
assert.equal(data.lessons['NCE1-97'].linePanels[15],5,'Thank you stays on the payment panel');
assert.equal(data.lessons['NCE1-81'].linePanels[12],2,'OK and thanks stay with the drinks scene');
assert.equal(data.lessons['NCE1-111'].linePanels[3],0,'The price quote stays with the first model');
assert.equal(data.lessons['NCE1-143'].boxes.length,1,'A single original illustration is not divided artificially');
console.log(`Verified ${lines} sentence cues, ${pictures} original illustration regions and 72 exact transcript/page bindings; timing, continuation, edition and fallback cases passed.`);
