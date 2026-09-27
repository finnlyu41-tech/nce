import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
const root=new URL('../',import.meta.url);
const moduleUrl=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const source=async file=>stripTypeScriptTypes(await readFile(new URL('app/'+file,root),'utf8'));
const {splitLesson}=await import(moduleUrl(await source('lesson-structure.ts')));
const {frames,sentenceFor,guideFor,readGuide,completeGuideStep,guideResume}=await import(moduleUrl(await source('expression-guide.ts')));
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
  assert.equal(guide.excerpt.startTime,guide.source.time,'Original playback starts at the actual source row');
  if(guide.excerpt.endTime!==undefined){
   const selected=parsed.body.filter(r=>r.time>=guide.excerpt.startTime&&r.time<guide.excerpt.endTime);
   assert.equal(selected.map(r=>r.en).join(' '),guide.excerpt.en,'Playback stops after exactly the joined excerpt, not after the whole track');
  }
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
assert(validateState({...initial,drafts}),'Existing state accepts new text records without migration');
assert.deepEqual(readMocks(drafts['ielts-readiness']).results,[mock]);
const savedState={...initial,drafts};

const topics=JSON.parse(await readFile(new URL('dist-online/speaking/topics.json',root),'utf8'));
assert.equal(topics.topics.length,66);assert.equal(topics.topics.reduce((n,t)=>n+t.questions.length,0),238);
for(const topic of topics.topics){for(const q of topic.questions)assert.deepEqual(Object.keys(q).sort(),['en','sourceRow','zh'],'Only bilingual prompts and source row numbers enter the public bank');assert(topic.questions.every(q=>q.en.length>10&&q.zh.length>=4));assert(new Set(topic.questions.map(q=>q.en)).size===topic.questions.length)}
console.log(`${count} lesson boundaries, source-based guides, generated frames, draft compatibility, public question boundaries and readiness conditions passed.`);

// New expression loop: real anchors, conservative feedback, transfer and old record compatibility.
const {transferCheck}=await import(moduleUrl(await source('expression-guide.ts')));
const {expressionFeedback,compareExpression}=await import(moduleUrl(await source('expression-feedback.ts')));
const {queueExpressionReview}=await import(moduleUrl((await source('study-path.ts')).replace("'./model'",JSON.stringify(moduleUrl(await source('model.ts'))))));
for(const [bad,id,example] of [
 ['I can to swim.','modal-to','I can swim'],
 ['She should working today.','modal-base','She should work'],
 ["I didn't went there.",'did-base',"didn't go"],
 ['Did you saw it?','did-base','Did you see'],
 ['I is a teacher.','i-be','I am'],
 ['They is happy.','plural-be','They are'],
 ['She are at home.','singular-be','She is'],
 ['I very like reading.','very-like','I really like'],
 ['There is two books on the desk.','there-number','There are two books'],
 ['He enjoys to swim.','enjoy-ing','enjoys swimming'],
]){
 const issues=expressionFeedback(bad);assert.equal(issues[0].id,id);assert.equal(issues[0].example,example);assert(bad.includes(issues[0].evidence),'Evidence must be an actual substring');
 assert(!expressionFeedback(example).some(i=>i.id===id),'The suggested phrase must remove this rule violation');
}
for(const valid of ['I can swim.','She should work today.',"I didn't go there.",'Did you see it?','I am a teacher.','They are happy.','She is at home.','I really like reading.','There are two books on the desk.','He enjoys swimming.','I use a can to hold pens.','Yesterday I said that I go there every week.'])assert.equal(expressionFeedback(valid).length,0,valid+' must not receive a false grammar correction');
assert.equal(expressionFeedback('I is tired. They is tired. I can to swim.').length,2,'Only one or two actionable issues at a time');
assert.equal(expressionFeedback('Is this your handbag?',{source:'Is this your handbag?'}).at(0).id,'copy');
assert.equal(expressionFeedback('book').at(0).kind,'practice','A short attempt is a task prompt, not a grammar verdict');
assert.equal(compareExpression('I can to swim.','I can swim.').resolved[0].id,'modal-to');
assert.equal(compareExpression('I can to swim.','I can to swim.').changed,false);
assert.equal(compareExpression('I can to swim.','I is happy.').remaining[0].id,'i-be','A repaired issue must not hide a new issue');
assert.equal(expressionFeedback('I can swim.',{target:'ownership'})[0].id,'target','A fluent unrelated answer still needs a task prompt');
assert.equal(expressionFeedback('This is my red coat.',{target:'ownership'}).length,0);
assert.equal(expressionFeedback('Could you help me, please?',{target:'request'}).length,0);
for(const f of frames){
 const variants=new Set();
 for(let round=0;round<3;round++){
  const c=transferCheck(f,1,round);assert.equal(new Set(c.options).size,3);assert(c.options.includes(c.answer));assert(c.prompt.includes('____'));assert(c.translation.length>3);assert(c.explanation.length>10);
  variants.add(c.prompt);assert(!/[{}]/.test(c.prompt));
 }
 assert(variants.size>1,f.id+' needs changed scenarios');
}
let unique=0;
for(const [book,total,step] of [['NCE1',144,2],['NCE2',96,1],['NCE3',60,1],['NCE4',48,1]]){
 const anchors=new Set();
 for(let lesson=1;lesson<=total;lesson+=step){
  const {rows}=JSON.parse(await readFile(new URL(`dist-online/language/${book}/${lesson}.json`,root),'utf8'));
  const body=splitLesson(rows,book,true).body,g=guideFor(body,book);
  assert(g.excerpt.en.startsWith(g.source.en));assert(body.map(r=>r.en).join(' ').includes(g.excerpt.en),'Joined sentence stays contiguous in this lesson');
  assert(g.goal.includes(g.frame.name));assert(transferCheck(g.frame,lesson,0).answer);anchors.add(g.excerpt.en);
 }
 assert(anchors.size>total/step*.7,book+' must not collapse into a shared passage');unique+=anchors.size;
}
const old=readGuide(drafts['expression-NCE1-1']);assert.equal(old.retry,'This is my book.');assert.equal(old.saved,true);assert.equal(old.checkpointAt,0,'An old saved card is not invented checkpoint evidence');
const damaged=readGuide('{"checkpointAt":-4,"checkRound":-9,"checkedRetry":[],"checkMarked":"yes"}');assert.equal(damaged.checkpointAt,0);assert.equal(damaged.checkRound,0);assert.equal(damaged.checkMarked,false);assert.equal(damaged.checkedRetry,'');
const record={...old,checkedAnswer:old.answer,checkedRetry:old.retry,transfer:'This is my coat.',checkedTransfer:'This is my coat.',checkChoice:'Is',checkMarked:true,checkpointAt:Date.now(),checkRound:2,checkpointCorrect:true,form:'Is this your (item)?'};
const expressionState={...savedState,drafts:{...savedState.drafts,'expression-NCE1-1':JSON.stringify(record)}};
assert(validateState(expressionState),'New feedback and checkpoint records remain valid for local storage');
const now=new Date(2026,8,27,16).getTime(),queued=queueExpressionReview({...initial,nce:{'NCE1-1':{title:'Keep me',text:'private text',notes:'keep notes',steps:['listen'],review:{checks:['meaning'],checkedAt:now-100,dueAt:now+100}}}},'NCE1',2,now);
assert.deepEqual(queued.nce['NCE1-1'].steps,['listen']);assert.deepEqual(queued.nce['NCE1-1'].review.checks,['meaning']);assert.equal(queued.nce['NCE1-1'].notes,'keep notes');assert.equal(queued.nce['NCE1-1'].review.checkedAt,now-100);assert.equal(new Date(queued.nce['NCE1-1'].review.dueAt).getDate(),28);assert(!queued.nce['NCE1-2'],'Paired courses keep one review schedule');
console.log(`Expression feedback, ${frames.length} transfer patterns, ${unique} distinct lesson anchors, retry comparison and record/review preservation passed.`);

// Oral practice can advance without inventing a written answer or mastery evidence.
let oral=readGuide();
for(let step=0;step<5;step++){
 oral=completeGuideStep(oral,step,now+step);
 assert.equal(oral.step,Math.min(4,step+1));
 assert(oral.practicedSteps.includes(step));
 assert.equal(oral.answer,'');assert.equal(oral.retry,'');assert.equal(oral.transfer,'');
 assert.equal(oral.checkpointAt,0);assert.equal(oral.checkpointCorrect,false);assert.equal(oral.saved,false);
}
assert.deepEqual(readGuide(JSON.stringify(oral)),oral,'Practice and resume survive reload without new storage');
assert(validateState({...initial,drafts:{'expression-NCE1-1':JSON.stringify(oral)}}));
assert.deepEqual(completeGuideStep(oral,2,now).practicedSteps,[0,1,3,4,2],'Repeating a step records the latest practice without inflating progress');
assert.equal(completeGuideStep(oral,-1,now),oral);assert.equal(completeGuideStep(oral,5,now),oral);
const resumed=completeGuideStep(record,2,now);
assert.equal(resumed.retry,record.retry,'An existing revision is never replaced by the first draft');
assert.equal(resumed.checkpointAt,record.checkpointAt,'Practice does not erase earlier written-check evidence');
assert.equal(resumed.checkpointCorrect,record.checkpointCorrect);
const firstRetry=completeGuideStep({...readGuide(),answer:'I is a teacher.'},2,now);
assert.equal(firstRetry.retry,'I is a teacher.');assert.equal(firstRetry.checkedRetry,'','Copying a draft is not checking it');
assert.deepEqual(readGuide('{"practicedSteps":[-1,2,2,5,"3",null],"practicedAt":-1}').practicedSteps,[2]);
assert.equal(readGuide().practicedAt,0);
assert.equal(guideFor([{en:'I am here.',zh:''}],'NCE1').excerpt.startTime,undefined,'Untimed custom text cannot be passed off as a matched recording');
assert.deepEqual(guideResume(completeGuideStep(readGuide(),2,now),true),{step:3,extra:false},'Next-day oral review continues the promised next step rather than skipping the retry');
assert.deepEqual(guideResume(oral,false),{step:4,extra:true});
assert.deepEqual(guideResume(oral,true),{step:4,extra:false},'A finished round returns to transfer practice when due');
assert.deepEqual(guideResume(completeGuideStep(oral,0,now),false),{step:1,extra:false},'Practicing an earlier step resumes from there');
assert.equal(guideResume(old,true).step,4,'Legacy saved cards retain their review entry');
console.log('Oral-only practice, precise excerpt timing, next-step resume and existing draft/checkpoint preservation passed.');
