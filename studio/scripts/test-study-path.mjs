import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
const asModule=text=>'data:text/javascript;base64,'+Buffer.from(text).toString('base64');
const model=asModule(stripTypeScriptTypes(await readFile(new URL('../app/model.ts',import.meta.url),'utf8')));
const structure=asModule(stripTypeScriptTypes(await readFile(new URL('../app/lesson-structure.ts',import.meta.url),'utf8')));
const importApp=async file=>import(asModule(stripTypeScriptTypes((await readFile(new URL('../app/'+file,import.meta.url),'utf8')).replace('{State,validateState','{type State,validateState').replace("'./model'",JSON.stringify(model)).replace("'./lesson-structure'",JSON.stringify(structure)))));
const {initial,validateState}=await import(model);
const {studyUnit,unitTrained,trainedUnits,dueUnits,recommendedStudy,makeReview,saveUnitReview}=await importApp('study-path.ts');
const {parsePack}=await importApp('offline-store.ts');
const now=new Date(2026,8,26,14,30).getTime();
const blank={title:'旧标题',text:'Existing lesson.',notes:'原有笔记',steps:[]};
const old={...initial,nce:{'NCE1-1':{...blank,steps:['listen','words','retell']},'NCE1-2':{...blank,steps:['practice']}},nceLast:{book:'NCE1',lesson:2}};
assert(validateState(old),'Old backups remain valid without review fields');
assert.equal(studyUnit('NCE1',2).key,'NCE1-1');
assert.deepEqual([studyUnit('NCE1',143).last,studyUnit('NCE1',144).next],[144,null]);
assert.equal(studyUnit('NCE2',2).first,2);
assert(unitTrained(old,'NCE1',2),'Odd lesson training and even lesson practice form one unit');
assert.equal(trainedUnits(old),1,'Pairs are counted once');
let state=saveUnitReview(old,'NCE1',2,['meaning','listening','expression'],now);
state={...state,drafts:{...state.drafts,'nce-recall-NCE1-1':JSON.stringify({'NCE1-1-6':'this'})}};
assert(validateState(state));
assert.deepEqual(old.nce['NCE1-1'],{...blank,steps:['listen','words','retell']},'Saving does not mutate prior state');
assert.equal(state.nce['NCE1-1'].notes,'原有笔记');
assert.deepEqual(state.nce['NCE1-2'],old.nce['NCE1-2'],'Even lesson notes and steps stay intact');
assert.equal(state.nce['NCE1-1'].review.dueAt,new Date(2026,8,27).getTime(),'First review is next local day');
assert.equal(recommendedStudy(state,now).first,3,'Finished and self-checked pair can continue at next pair');
const tomorrow=new Date(2026,8,27,10).getTime();
assert.equal(dueUnits(state,tomorrow).length,1);
assert.equal(recommendedStudy(state,tomorrow).first,1,'Due review takes priority over new content');
assert(recommendedStudy(state,tomorrow).review);
const next=saveUnitReview(state,'NCE1',1,['meaning','listening','expression'],tomorrow);
assert.equal(next.nce['NCE1-1'].review.dueAt,new Date(2026,8,30).getTime(),'Successful next-day recall schedules three days later');
assert.equal(makeReview(['meaning'],state.nce['NCE1-1'].review,tomorrow).dueAt,new Date(2026,8,28).getTime(),'Incomplete recall stays on next-day practice');
assert.equal(trainedUnits(saveUnitReview(initial,'NCE1',1,['meaning','listening','expression'],now)),0,'Self-check never marks training complete');
assert.equal(recommendedStudy({...state,nceLast:{book:'NCE1',lesson:144}},now).first,143,'End of book stays in valid pair');
for(const review of [{checks:['unknown'],checkedAt:now,dueAt:tomorrow},{checks:['meaning','meaning'],checkedAt:now,dueAt:tomorrow},{checks:[],checkedAt:now,dueAt:now-1},{checks:[],checkedAt:now,dueAt:Infinity}])assert(!validateState({...initial,nce:{'NCE1-1':{...blank,review}}}),'Invalid imported review is rejected');
const manifest=JSON.stringify({version:1,state,media:[]}),bytes=new TextEncoder().encode(manifest);
const pack=new Blob(['ENGLISH-STUDIO-PACK-1\n',String(bytes.length).padStart(12,'0')+'\n',bytes]);
assert.deepEqual((await parsePack(pack)).state,state,'Full backup preserves self-check, review dates, notes and original progress');
const {lessonRecall,recallAnswer}=await importApp('lesson-practice.ts');
const sample=[{en:'Lesson 1',zh:''},{en:'A new bag',zh:''},{en:'Listen to the tape then answer this question.',zh:''},{en:'Whose bag is it?',zh:''},{en:'This is my bag.',zh:'这是我的包。'},{en:'My bag is blue.',zh:'我的包是蓝色的。'},{en:'That is your coat.',zh:'那是你的外套。'}];
assert.deepEqual(lessonRecall(sample,'sample').map(x=>x.rowIndex),[4,5,6]);
assert.equal(new Set(lessonRecall([...sample,...sample.slice(4)],'sample').map(x=>x.original)).size,3,'Duplicate source lines are not repeated');
if(process.argv.includes('--with-materials')){
for(const book of ['NCE1','NCE2','NCE3','NCE4']){
 const count={NCE1:144,NCE2:96,NCE3:60,NCE4:48}[book],signatures=new Set();
 for(let lesson=1;lesson<=count;lesson+=book==='NCE1'?2:1){
  const data=JSON.parse(await readFile(new URL('../dist-online/language/'+book+'/'+lesson+'.json',import.meta.url),'utf8'));
  const items=lessonRecall(data.rows,book+'-'+lesson);
  assert.equal(items.length,3,book+' '+lesson+' has three sentence recall tasks');
  const signature=items.map(item=>item.prompt).join('|');
  assert(!signatures.has(signature),'Each lesson has its own sentence set');signatures.add(signature);
  for(const item of items){assert.equal(item.prompt.replace('____',item.answer),item.original);assert.equal(data.rows[item.rowIndex].en,item.original);assert(!/^Lesson \d|Listen to the tape/i.test(item.original))}
 }
}
assert.equal(recallAnswer('  Isn’t. '),"isn't");
assert.equal(lessonRecall([], 'empty').length,0);
console.log('All 276 lesson recall sets are distinct within each book and match supplied source sentences.');
}
console.log('Pair boundaries, legacy progress, next-step selection, review dates, validation and full-backup round trip passed.');
