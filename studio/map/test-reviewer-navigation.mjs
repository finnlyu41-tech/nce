import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {stripTypeScriptTypes} from 'node:module';
import {fileURLToPath} from 'node:url';

// Pure public-model regression tests. Dependencies below are deliberately
// synthetic; this script never reads browser storage or a learner's backup.
const root = path.dirname(fileURLToPath(import.meta.url));
const dataURL = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const contentURL = dataURL(`
  export const nodes = [
    {id:'chapter-1',kind:'course',chapter:0,requires:[],members:['nce1-1','nce1-3']},
    {id:'writing-task-two',kind:'task',lane:'writing',requires:['chapter-1']},
    {id:'speaking-full',kind:'task',lane:'speaking',requires:['chapter-1']},
    {id:'mock-one',kind:'mock',requires:['writing-task-two','speaking-full']},
    {id:'mock-two',kind:'mock',requires:['mock-one']},
    {id:'finish',kind:'finish',requires:['mock-two']}
  ];
  export const unitNodes = [
    {id:'nce1-1',kind:'unit',parent:'chapter-1',requires:[]},
    {id:'nce1-3',kind:'unit',parent:'chapter-1',requires:['nce1-1']}
  ];
  export const chapters = [['Synthetic fixture chapter','','',6]];
  export const nodeById = id => [...nodes,...unitNodes].find(n=>n.id===id);
  export const questionsFor = (node,round=0) => node.kind==='unit' ? [
    {prompt:round%2?'Recall a different sentence':'Recall the first sentence',answer:round%2?'It is my pen':'This is my book'}
  ] : [];
`);
const curriculumURL = dataURL(`export const unitById = id => ({id});`);
const speakingURL = dataURL(`export function validSpeakingRecord(){throw Error('Speaking records are outside this isolated fixture');}`);
const readinessURL = dataURL(stripTypeScriptTypes(await fs.readFile(path.join(root,'../app/readiness.ts'),'utf8')));
let source = stripTypeScriptTypes(await fs.readFile(path.join(root,'model.ts'),'utf8'));
for (const [specifier,url] of Object.entries({
  './content':contentURL,
  './curriculum':curriculumURL,
  './speaking-model':speakingURL,
  '../app/readiness':readinessURL
})) source=source.replaceAll(`from '${specifier}'`,`from '${url}'`);
const m = await import(dataURL(source));
const c = await import(contentURL);
const at = Date.now()-60_000;
const cases = [];
function test(name, run) { cases.push({name,run}); }
const project = reviewer => ({
  text:'I am a student. This is my book. I use it every day. '.repeat(12),
  recording:'synthetic-work.wav',reviewer,
  feedback:'The reviewer listened to the original and checked specific corrected expressions.',
  criteria:[true,true,true,true],at
});
const evidence = reviewer => ({
  date:m.today(at),material:'Synthetic new task A',
  work:'This is my complete original answer with concrete supporting details. '.repeat(40),
  reviewer,feedback:'Specific feedback identifies a concrete error and records its correction.',
  criteria:[true,true,true,true],unseen:true,timed:true,correct:'30',total:'40',
  dimensions:Array(4).fill('Specific dimension feedback records performance and an actionable correction.'),
  revision:'Synthetic new task B: corrected the same issue; remaining weakness recorded.'
});
const mock = (reviewer,name,date) => ({
  ...evidence(reviewer),date,material:name,scores:['6.5','6.5','6.5','6.5'],
  kind:'academic',reference:'Synthetic answer and band conversion table'
});
const mockState = reviewer => ({
  ...m.emptyProgress(),minimum:'6',records:{
    'mock-one':{...m.emptyRecord(),mock:mock(reviewer,'Synthetic paper A',m.today(at-2*m.reviewDelay))},
    'mock-two':{...m.emptyRecord(),mock:mock(reviewer,'Synthetic paper B',m.today(at))}
  }
});
const rejected = [
  '', '  ', '自评', '自 评', '自己', '自己评阅', '自我评估', '本人',
  'self', 'MYSELF', 'ＳＥＬＦ', 'Self-assessment', 'self assessment',
  'self review', 'self evaluation', 'AI', 'ChatGPT', 'GPT-4',
  'Claude', 'Gemini', 'DeepSeek', '人工智能', 'AI (ChatGPT)', 'ChatGPT 评阅',
  'GPT', 'AI 助手',
  '我自己', '本人自评', '自己评分', '自我评分', 'Self rating',
  '我 自己', '本人（自评）', '自己－评分', '自我：评分',
  'SELF RATING', 'Ｓｅｌｆ　ｒａｔｉｎｇ', 'self-rating'
];
const accepted = [
  '陈老师', 'Alex Chen', 'Dr Self', 'Selfridge Language Centre',
  'Aiden Wu', 'Haidian IELTS Centre', 'Gail Chen', 'Claude Martin'
];
for (const reviewer of rejected) {
  const label=JSON.stringify(reviewer);
  test(`chapter rejects explicit non-external reviewer ${label}`,()=>assert.ok(m.projectErrors(c.nodeById('chapter-1'),project(reviewer),at).length));
  for (const id of ['writing-task-two','speaking-full'])
    test(`${id} rejects explicit non-external reviewer ${label}`,()=>assert.ok(m.evidenceErrors(c.nodeById(id),evidence(reviewer),at).length));
  test(`mock rejects explicit non-external reviewer ${label}`,()=>assert.ok(m.mockErrors(mock(reviewer,'Synthetic paper A',m.today(at)),'6',at).length));
  test(`two 6.5 mocks cannot become ready with reviewer ${label}`,()=>assert.equal(m.isReady(mockState(reviewer),at),false));
}
for (const reviewer of accepted) {
  const label=JSON.stringify(reviewer);
  test(`chapter accepts plausible real reviewer ${label}`,()=>assert.deepEqual(m.projectErrors(c.nodeById('chapter-1'),project(reviewer),at),[]));
  for (const id of ['writing-task-two','speaking-full'])
    test(`${id} accepts plausible real reviewer ${label}`,()=>assert.deepEqual(m.evidenceErrors(c.nodeById(id),evidence(reviewer),at),[]));
  test(`mock accepts plausible real reviewer ${label}`,()=>assert.deepEqual(m.mockErrors(mock(reviewer,'Synthetic paper A',m.today(at)),'6',at),[]));
  test(`two complete external-review mocks reach readiness with ${label}`,()=>assert.equal(m.isReady(mockState(reviewer),at),true));
}

test('external reviewer does not weaken single-band requirement',()=>assert.ok(m.mockErrors({...mock('Alex Chen','Synthetic paper A',m.today(at)),scores:['6.5','6.5','5.5','6.5']},'6',at).length));
test('external reviewer does not weaken distinct-paper requirement',()=>{
  const state=mockState('Alex Chen');state.records['mock-two'].mock.material=state.records['mock-one'].mock.material;
  assert.equal(m.isReady(state,at),false);
});
test('external reviewer does not weaken separate-date requirement',()=>{
  const state=mockState('Alex Chen');state.records['mock-two'].mock.date=state.records['mock-one'].mock.date;
  assert.equal(m.isReady(state,at),false);
});
test('old v2 backups retain self-review records without awarding readiness',()=>{
  const old=mockState('自评');
  old.records['chapter-1']={...m.emptyRecord(),project:project('self-assessment')};
  old.records['writing-task-two']={...m.emptyRecord(),evidence:evidence('ChatGPT')};
  const before=structuredClone(old.records),restored=m.parseProgress(m.exportProgress(old));
  assert.deepEqual(restored.records,before);
  assert.deepEqual(old.records,before);
  assert.equal(m.isReady(restored,at),false);
});

const proof = (node,round,time) => ({
  round,at:time,answers:c.questionsFor(node,round).map(q=>q.answer),assisted:false,heard:[]
});
function failedReviewState() {
  const a=c.nodeById('nce1-1'),pass=proof(a,0,at-8*m.reviewDelay);
  return {...m.emptyProgress(),lastNode:a.id,access:{all:true,nodes:[]},records:{
    [a.id]:{...m.emptyRecord(),round:1,phase:'challenge',attempts:[pass,{...proof(a,1,at),answers:['wrong']}]}
  }};
}
test('recent failed review stays ahead of the newly opened next unit',()=>{
  const state=failedReviewState(),a=c.nodeById('nce1-1');
  assert.equal(m.achieved(a,state,at),true,'historical first pass still exists');
  assert.equal(m.due(a,state,at),true,'latest failure remains due');
  assert.equal(m.statusMap(state,at)['nce1-3'],'available','learner can choose next unit');
  assert.equal(m.continueNode(state,at).id,a.id);
});
test('latest assisted review also resumes repair before a new unit',()=>{
  const state=failedReviewState(),a=c.nodeById('nce1-1');
  state.records[a.id].attempts[1]={...proof(a,1,at),assisted:true};
  assert.equal(m.continueNode(state,at).id,a.id);
});
test('opening next unit explicitly preserves the learner choice',()=>{
  const state=failedReviewState(),a=c.nodeById('nce1-1');
  const selected=m.startNode(state,'nce1-3',at);
  assert.equal(selected.lastNode,'nce1-3');
  assert.equal(m.continueNode(selected,at).id,'nce1-3');
  assert.equal(m.due(a,selected,at),true,'skipping does not erase the repair');
  assert.deepEqual(selected.records[a.id],state.records[a.id]);
});
test('learner choice and outstanding repair survive a backup round trip',()=>{
  const selected=m.startNode(failedReviewState(),'nce1-3',at);
  const restored=m.parseProgress(m.exportProgress(selected));
  assert.equal(restored.lastNode,'nce1-3');
  assert.equal(m.continueNode(restored,at).id,'nce1-3');
  assert.equal(m.due(c.nodeById('nce1-1'),restored,at),true);
});
test('opening a locked unit is still blocked',()=>{
  const state=m.emptyProgress();
  assert.equal(m.statusMap(state,at)['nce1-3'],'locked');
  assert.equal(m.startNode(state,'nce1-3',at),state);
});
test('first completed unit can still continue to the next newly open unit',()=>{
  const a=c.nodeById('nce1-1'),state={...m.emptyProgress(),lastNode:a.id,access:{all:true,nodes:[]},records:{
    [a.id]:{...m.emptyRecord(),attempts:[proof(a,0,at)]}
  }};
  assert.equal(m.due(a,state,at),false);
  assert.equal(m.continueNode(state,at).id,'nce1-3');
});

function establishedReviewState() {
  const a=c.nodeById('nce1-1');
  return {...m.emptyProgress(),lastNode:a.id,access:{all:true,nodes:[]},records:{
    [a.id]:{...m.emptyRecord(),round:1,phase:'challenge',attempts:[
      proof(a,0,at-8*m.reviewDelay),proof(a,1,at-6*m.reviewDelay)
    ]}
  }};
}
test('old v2 delayed evidence remains usable without the optional help field',()=>{
  const state=establishedReviewState(),restored=m.parseProgress(m.exportProgress(state));
  assert.equal(Object.hasOwn(restored.records['nce1-1'],'quizHelpAt'),false);
  assert.deepEqual(restored.records,state.records);
  assert.equal(m.stable(c.nodeById('nce1-1'),restored,at),true);
});
function legacyUnsubmittedHelpState() {
  const state=establishedReviewState();
  Object.assign(state.records['nce1-1'],{round:2,phase:'challenge',assisted:true});
  return state;
}
test('old v2 unsubmitted assistance cannot preserve historical consolidation',()=>{
  const old=legacyUnsubmittedHelpState(),restored=m.parseProgress(m.exportProgress(old));
  assert.deepEqual(restored.records,old.records,'restoration does not rewrite the legacy evidence');
  assert.equal(m.stable(c.nodeById('nce1-1'),restored,at),false);
});
test('restarting a legacy assisted round cannot erase its exposure barrier',()=>{
  const old=legacyUnsubmittedHelpState(),restarted=m.restartQuiz(old,'nce1-1');
  assert.deepEqual(restarted.records['nce1-1'].attempts,old.records['nce1-1'].attempts);
  assert.equal(m.stable(c.nodeById('nce1-1'),restarted,Date.now()),false);
  const restored=m.parseProgress(m.exportProgress(restarted));
  assert.equal(m.stable(c.nodeById('nce1-1'),restored,Date.now()),false);
});
test('unsubmitted hint exposure invalidates old consolidation without deleting history',()=>{
  const a=c.nodeById('nce1-1'),state=establishedReviewState(),before=structuredClone(state);
  const helped=m.noteQuizHelp(state,a.id,at-2*m.reviewDelay);
  assert.deepEqual(state,before);
  assert.deepEqual(helped.records[a.id].attempts,state.records[a.id].attempts);
  assert.equal(m.stable(a,helped,at),false);
  assert.equal(m.due(a,helped,at),true);
  const restored=m.parseProgress(m.exportProgress(helped));
  assert.equal(restored.records[a.id].quizHelpAt,at-2*m.reviewDelay);
  assert.deepEqual(restored.records,helped.records);
});
test('hint then relearning requires a new independently delayed response for consolidation',()=>{
  const a=c.nodeById('nce1-1'),helped=m.noteQuizHelp(establishedReviewState(),a.id,at-2*m.reviewDelay);
  const relearnAt=at-2*m.reviewDelay+1000;
  const relearned=structuredClone(helped);
  relearned.records[a.id].attempts.push(proof(a,2,relearnAt));
  assert.equal(m.stable(a,relearned,at),false);
  assert.equal(m.nextReviewAt(a,relearned,at),relearnAt+m.reviewDelay);
  const early=structuredClone(relearned);
  early.records[a.id].attempts.push(proof(a,3,relearnAt+1000));
  assert.equal(m.stable(a,early,at),false);
  assert.equal(m.nextReviewAt(a,early,at),relearnAt+m.reviewDelay);
  early.records[a.id].attempts.push(proof(a,3,at));
  assert.equal(m.stable(a,early,at),true);
  assert.equal(m.nextReviewAt(a,early,at),at+7*m.reviewDelay);
  const restored=m.parseProgress(m.exportProgress(early));
  assert.deepEqual(restored.records,early.records);
  assert.equal(m.stable(a,restored,at),true);
});
test('restart retains the latest hint barrier and the original raw evidence',()=>{
  const a=c.nodeById('nce1-1'),helped=m.noteQuizHelp(establishedReviewState(),a.id,at);
  const restarted=m.restartQuiz(helped,a.id);
  assert.equal(restarted.records[a.id].quizHelpAt,at);
  assert.deepEqual(restarted.records[a.id].attempts,helped.records[a.id].attempts);
  assert.equal(m.stable(a,restarted,at),false);
});
test('returning to teaching records exposure even after checking a completed round',()=>{
  const state=establishedReviewState(),changed=m.changeStudyStep(state,'nce1-1',0,at);
  assert.equal(changed.records['nce1-1'].quizHelpAt,at);
  assert.equal(m.stable(c.nodeById('nce1-1'),changed,at),false);
});
for (const value of [0,-1,null,'1000',Date.now()+m.reviewDelay]) {
  test(`malformed optional help timestamp ${JSON.stringify(value)} is rejected on restore`,()=>{
    const invalid=establishedReviewState();invalid.records['nce1-1'].quizHelpAt=value;
    assert.throws(()=>m.parseProgress(JSON.stringify(invalid)));
  });
}

const failures=[];
for (const {name,run} of cases) {
  try { run(); } catch(error) { failures.push({name,message:error.message}); }
}
console.log(JSON.stringify({suite:'reviewer-navigation',total:cases.length,passed:cases.length-failures.length,failed:failures.length,failures},null,2));
if(failures.length)process.exitCode=1;
