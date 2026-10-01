import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { stripTypeScriptTypes } from 'node:module';
const root = path.dirname(fileURLToPath(import.meta.url)), cache = new Map();
async function moduleURL(file) {
    if (cache.has(file))
        return cache.get(file);
    let source = file.endsWith('.json') ? `export default ${await fs.readFile(file, 'utf8')}` : stripTypeScriptTypes(await fs.readFile(file, 'utf8'));
    if(file.endsWith('.json')){const url=`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;cache.set(file,url);return url;}
    for (const match of [...source.matchAll(/from\s+['"]([^'"]+)['"]/g)]) {
        const child = path.resolve(path.dirname(file), match[1] + (path.extname(match[1]) ? '' : '.ts'));
        const resolved = await moduleURL(child);
        source = source.replaceAll(match[0], `from '${resolved}'`);
    }
    const url = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
    cache.set(file, url);
    return url;
}
const m = await import(await moduleURL(path.join(root, 'model.ts')));
const c = await import(await moduleURL(path.join(root, 'content.ts')));
if(process.argv.includes('--validate')){const file=process.argv[process.argv.indexOf('--validate')+1];const state=m.parseProgress(await fs.readFile(file,'utf8'));console.log(JSON.stringify({version:state.version,records:Object.keys(state.records),chapter1:m.chapterProgress(c.nodeById('chapter-1'),state),firstUnit:m.statusMap(state)['nce1-1']}));process.exit(0)}
let count=0;
const check=(value,message)=>{assert.ok(value,message);count++};
const nav=await import(await moduleURL(path.join(root,'navigation.ts')));
for(const group of nav.catalogueGroups){
 const route=nav.parseLearningRoute(nav.catalogueHash(group.id,'介绍 / bag?'), 'nce2-7');
 check(route.id==='nce2-7'&&route.catalogue===group.id&&route.query==='介绍 / bag?'&&!route.learn,'Catalogue deep links preserve context and encoded search');
}
check(nav.catalogueItems('NCE1','').length===72&&nav.catalogueItems('NCE2','').length===96,'Catalogue uses the same 168 learning units');
check(nav.catalogueItems('starter','').length===3&&nav.catalogueItems('ielts','').length===15,'Starter and IELTS nodes stay reachable');
check(nav.catalogueItems('NCE1','第 2 课')[0]?.id==='nce1-1','Paired even lesson finds the shared unit');
check(nav.catalogueItems('all','1').length===2,'Exact lesson search avoids lesson 11 or 101');
check(nav.catalogueItems('NCE1','介绍一位朋友').length>0,'Ability goals are searchable');
check(nav.catalogueItems('NCE1','Excuse me!')[0]?.id==='nce1-1','Original English title is searchable');
check(nav.catalogueItems('NCE1','不存在的课程').length===0,'Unmatched search does not display unrelated courses');
for(const hash of ['', '#', '#/', '#/today'])check(nav.parseLearningRoute(hash).home===true,'Home remains the daily recommendation when restored progress changes the current node');
check(!nav.parseLearningRoute('#/map/letters').home,'An explicit inspected node remains a separate detail view');
for(const hash of ['#/map/letters','#/learn/nce2-96'])check(nav.parseLearningRoute(hash).id===hash.split('/')[2],'Existing node deep links remain valid');
check(nav.parseLearningRoute('#/learn/unknown','letters').learn===false,'Invalid lesson links never start the fallback node');
check(nav.parseLearningRoute('#/courses/__proto__','letters').id==='letters','Malformed catalogue URL keeps a safe location');
check(nav.parseLearningRoute('#/courses/constructor').catalogue==='all','Unknown catalogue group defaults safely');
const now=Date.now(),yesterday=now-2*m.reviewDelay;
const proof=(node,round,at)=>({round,at,answers:c.questionsFor(node,round).map(q=>q.answer.split(/\s+\/\s+/)[0]),assisted:false,heard:c.questionsFor(node,round).flatMap((q,i)=>q.clip?[i]:[])});
check(c.nodes.length===32,'32 navigable overview stations');
check(c.unitNodes.length===168,'All 72 paired first-book and 96 second-book units');
check(new Set([...c.nodes,...c.unitNodes].map(n=>n.id)).size===200,'All IDs unique');
const seen=new Set();
for(const node of c.nodes){check(node.requires.every(id=>seen.has(id)),'Topological overview');seen.add(node.id)}
for(const unit of c.units){
 const node=c.nodeById(unit.id);
 check(unit.book!=='NCE1'||unit.lastLesson===unit.lesson+1&&unit.lesson%2===1,'Book 1 paired odd audio/even exercises');
 const raw=JSON.parse(await fs.readFile(path.join(root,`../dist-online/language/${unit.book}/${unit.lesson}.json`),'utf8'));
 check(raw.sourceSha256===unit.sourceSha256,'Exact packaged transcript hash');
 for(const row of unit.rows){check(raw.rows.some(r=>r.en===row.en&&r.zh===row.zh&&r.time===row.start),'Assessment excerpts preserve source/timing');check(row.end>row.start,'Positive audio interval');check(!/^lesson \d+|listen to the/i.test(row.en),'Instructions excluded from assessed speech')}
 for(let round=0;round<3;round++){
  const qs=c.questionsFor(node,round),p=proof(node,round,now);
  check(qs.length>=6,'At least six multimodal items');
  check(qs.filter(q=>q.clip).length===2,'Actual audio comprehension required');
  check(m.passedQuiz(node,p,now),'Reference response passes');
  check(!m.passedQuiz(node,{...p,heard:[]},now),'Cannot pass listening without playing source');
  check(!m.passedQuiz(node,{...p,assisted:true},now),'Help cannot count as independence');
  check(!m.passedQuiz(node,{...p,at:now+1},now),'Future proof rejected');
  check(!m.grade(node,qs.map(()=>''),round).some(Boolean),'No blank answers pass');
  for(const q of qs.filter(q=>q.type==='choice'))check(q.options.includes(q.answer)&&new Set(q.options).size===q.options.length&&q.options.length>=2,'Choice has unique options and correct answer');
 }
 check(JSON.stringify(c.questionsFor(node,0))!==JSON.stringify(c.questionsFor(node,1)),'Different review bank');
}
let state=m.emptyProgress();
check(Object.values(m.statusMap(state,now)).filter(s=>s==='available').length===1,'One actionable beginner entry');
check(m.submitQuiz(state,'nce2-96',now)===state,'Direct hash/import cannot bypass course dependencies');
for(const n of c.nodes.filter(n=>n.kind==='starter')){
 state.records[n.id]={...m.emptyRecord(),...proof(n,0,now),attempts:[]};
 const saved=m.submitQuiz(state,n.id,now);check(saved!==state,'Starter reachable');state=saved;
}
check(m.statusMap(state,now)['chapter-1']==='available','First chapter opens after beginner preparation');
check(m.statusMap(state,now)['nce1-1']==='available'&&m.statusMap(state,now)['nce1-3']==='locked','Hierarchical unit dependency');
const first=c.nodeById('nce1-1');
state.records[first.id]={...m.emptyRecord(),attempts:[proof(first,0,yesterday)]};
check(m.statusMap(state,now)['nce1-3']==='available','First pass opens next unit same day');
check(!m.stable(first,state,now),'First pass is not stable');
check(m.due(first,state,now),'First pass becomes due after 24 hours');
state.records[first.id].attempts.push(proof(first,1,yesterday+1));
check(!m.stable(first,state,now),'Immediate retry does not prove retention');
state.records[first.id].attempts=[proof(first,0,yesterday),proof(first,0,now)];
check(!m.stable(first,state,now),'Same bank across days is insufficient');
state.records[first.id].attempts=[proof(first,0,yesterday),proof(first,2,now)];
check(!m.stable(first,state,now),'Reordered options around identical source items are not new review evidence');
state.records[first.id].attempts=[proof(first,0,yesterday),proof(first,1,now)];
check(m.stable(first,state,now),'Different-bank independent delayed response is stable');
check(!m.due(first,state,now),'No immediate due after valid spaced review');
check(m.due(first,state,now+8*m.reviewDelay),'Continued review after a week');
state.records[first.id].attempts.push({...proof(first,2,now),answers:['wrong']});
check(!m.stable(first,state,now)&&m.due(first,state,now),'Failed review surfaces repair instead of hiding latest evidence');
check(m.statusMap(state,now)['nce1-3']==='available','Review failure preserves first-pass progression inside chapter');
const project={text:'I am a student. This is my book. It is a good book. I read every day. '.repeat(20),recording:'my-original-recording.wav',reviewer:'Synthetic test reviewer',feedback:'The reviewer heard the full recording, identified tense errors and checked the corrected version.',criteria:[true,true,true,true],at:now};
for(const n of c.nodes.filter(n=>n.kind==='course')){
 check(m.statusMap(state,now)[n.id]==='available',`${n.id} reachable`);
 for(const id of n.members){const u=c.nodeById(id);state.records[id]={...m.emptyRecord(),attempts:[proof(u,0,yesterday),proof(u,1,now)]}}
 check(!m.achieved(n,state,now),'Quizzes alone do not close a chapter');
 state.records[n.id]={...m.emptyRecord(),project};
 check(m.achieved(n,state,now),'Chapter requires all spaced units and reviewed work');
 check(m.projectErrors(n,{...project,reviewer:'自评'},now).length>0,'Self tick cannot substitute reviewer');
 check(m.projectErrors(n,{...project,text:'Yes.'},now).length>0,'Brief placeholder cannot satisfy project');
}
const evidence={date:m.today(now),material:'Synthetic new paper A',work:'This is my own complete answer with concrete supporting details. '.repeat(40),reviewer:'Synthetic IELTS reviewer',feedback:'The original was revised with specific evidence and corrected tense use.',criteria:[true,true,true,true],unseen:true,timed:true,correct:'30',total:'40',dimensions:Array(4).fill('Specific performance evidence and an actionable correction from the reviewer.'),revision:'Synthetic new paper B retest: fixed the same error, remaining weakness recorded.'};
for(const n of c.nodes.filter(n=>n.kind==='task')){
 check(m.statusMap(state,now)[n.id]==='available',`${n.id} reachable in branch`);
 check(!m.evidenceErrors(n,evidence,now).length,'Complete task evidence accepted');
 check(m.evidenceErrors(n,{...evidence,revision:''},now).length,'Retest record required');
 check(m.evidenceErrors(n,{...evidence,unseen:false},now).length,'Repeated familiar sample insufficient');
 if(['writing','speaking'].includes(n.lane))check(m.evidenceErrors(n,{...evidence,dimensions:[]},now).length,'Four rubric notes required');
 if(n.lane==='writing')check(m.evidenceErrors(n,{...evidence,work:'See my file'},now).length,'Writing requires actual work, not only a reference');
 if(['listening','reading'].includes(n.lane))check(m.evidenceErrors(n,{...evidence,correct:'20'},now).length,'Low raw performance blocks local training gate');
 state.records[n.id]={...m.emptyRecord(),evidence};
}
check(m.statusMap(state,now)['mock-one']==='available','All four skill branches merge');
const mock=(name,date)=>({...evidence,material:name,date,scores:['6.5','6.5','6.5','6.5'],kind:'academic',reference:'Corresponding full paper answer and band table'});
check(m.mockErrors(mock('A',m.today()),'unconfirmed').length,'Institution target must be confirmed');
state.minimum='6';state.records['mock-one']={...m.emptyRecord(),mock:mock('Paper A',m.today(yesterday))};
check(m.statusMap(state,now)['mock-two']==='available','Second full paper available');
state.records['mock-two']={...m.emptyRecord(),mock:mock('Paper A',m.today())};
check(m.statusMap(state,now).finish==='locked','Repeated paper blocked');
state.records['mock-two'].mock=mock('Paper B',m.today(yesterday));
check(m.statusMap(state,now).finish==='locked','Same-day mocks insufficient');
state.records['mock-two'].mock=mock('Paper B',m.today());
check(m.statusMap(state,now).finish==='passed','Two valid full mocks reach preparation goal');
check(!m.officialReached(state),'Preparation never becomes official score');
check(m.mockErrors({...state.records['mock-two'].mock,scores:['6.5','6.5','5.5','6.5']},'6').length,'Single-section institution gate');
check(m.mockErrors({...state.records['mock-two'].mock,scores:['7','7','7','6.2']},'6').length,'No invented decimal bands');
const roundtrip=m.parseProgress(m.exportProgress(state));
check(JSON.stringify(roundtrip.records)===JSON.stringify(state.records),'Entire course, work and evidence export/import roundtrip');
for(const invalid of ['{}','null','[]',JSON.stringify({...state,version:1}),JSON.stringify({...state,records:{constructor:m.emptyRecord()}}),JSON.stringify({...state,records:{first:{...m.emptyRecord(),heard:['oops']}}}),JSON.stringify({...state,records:{first:{...m.emptyRecord(),attempts:[proof(first,0,now+999999)]}}})]){assert.throws(()=>m.parseProgress(invalid));count++}
for(const draft of [{text:false},{criteria:'yes'},{at:'yesterday'},{text:'ok',other:'unexpected'}]){assert.throws(()=>m.parseProgress(JSON.stringify({...m.emptyProgress(),records:{'chapter-1':{...m.emptyRecord(),draft}}})));count++}
let draftState={...m.emptyProgress(),records:{'chapter-1':{...m.emptyRecord(),draft:{text:'new writing entered while recording'}}}};
draftState=m.updateDraft(draftState,'chapter-1',{recording:'finished.wav'},{text:'old text at recording start'});
check(draftState.records['chapter-1'].draft.text==='new writing entered while recording','Late recording callback preserves newly typed writing');
check(draftState.records['chapter-1'].draft.recording==='finished.wav','Late callback also saves recording reference');
const history={...m.emptyProgress(),records:{first:{...m.emptyRecord(),...proof(c.nodeById('first'),0,yesterday),attempts:[proof(c.nodeById('first'),0,yesterday)]}}};
let repeat=history;for(let i=0;i<15;i++)repeat=m.submitQuiz(repeat,'first',now);
check(repeat.records.first.attempts.length===12&&repeat.records.first.attempts[0].at===yesterday,'Bounded history preserves earliest independent proof');
check(m.storageKey!==m.legacyStorageKey,'Old map records never silently repurposed');
// Manual access never creates assessment evidence or completes prerequisite nodes.
const blank=m.emptyProgress(),late=c.nodeById('nce2-96'),chapter=c.nodeById('chapter-14');
let opened=m.unlockNode(blank,late.id);
check(m.statusMap(opened,now)[late.id]==='available','Individual late unit can be opened without prerequisites');
check(m.statusMap(opened,now)['nce2-95']==='locked','Individual unlock does not mark prior units complete');
check(c.nodes.every(n=>!m.achieved(n,opened,now))&&c.unitNodes.every(n=>!m.achieved(n,opened,now)),'Manual unlock leaves every completion false');
check(m.learningLabel(late,opened)==='尚未学习','Unlocked is distinct from started');
opened=m.startNode(opened,late.id,now);
check(m.learningLabel(late,opened)==='学习中 · 尚未完成','Opening learning creates only a started marker');
check(m.continueNode(opened).id===late.id,'Return resumes manually chosen lesson');
check(m.startNode(blank,late.id,now)===blank,'Starting locked content cannot bypass access');
check(m.unlockNode(blank,'constructor')===blank,'Invalid manual target rejected');
const chapterOpen=m.unlockNode(blank,chapter.id);
check(chapter.members.every(id=>m.statusMap(chapterOpen,now)[id]==='available'),'Chapter unlock opens its full member list');
check(m.statusMap(chapterOpen,now)['chapter-13']==='locked','Other chapters remain gated');
const allOpen={...opened,access:{all:true,nodes:[]}};
check(Object.values(m.statusMap(allOpen,now)).every(x=>x==='available'),'All content opens without false pass flags');
check(!m.isReady(allOpen,now)&&!m.officialReached(allOpen,now),'Open finish does not imply mock or official target reached');
check(m.parseProgress(m.exportProgress(allOpen)).records[late.id].startedAt===now,'Access and started records round trip');
check(m.parseProgress(m.exportProgress(allOpen)).access.all&&m.parseProgress(m.exportProgress(opened)).lastNode===late.id,'Access and resume choice survive backup');
opened.records[late.id]={...opened.records[late.id],round:0,...proof(late,0,now),attempts:[]};
opened=m.submitQuiz(opened,late.id,now);
check(m.achieved(late,opened,now)&&!m.achieved(chapter,opened,now),'Real independent completion is separate from chapter completion');
const gated={...opened,access:{all:false,nodes:[]}};
check(m.achieved(late,gated,now)&&m.statusMap(gated,now)[late.id]==='passed','Restoring gates preserves completion and review access');
const completedLetter={...m.unlockNode(blank,'letters'),lastNode:'letters',records:{letters:{...m.emptyRecord(),attempts:[proof(c.nodeById('letters'),0,now)]}}};
check(m.continueNode(completedLetter).id==='small-exchange','After a skipped-ahead lesson passes, continue follows its next node');
for(const access of [{all:'yes',nodes:[]},{all:false,nodes:['unknown']},{all:false,nodes:['first','first']},{all:true,nodes:['__proto__']}]){
 let rejected=false;try{m.parseProgress(JSON.stringify({...blank,access}))}catch{rejected=true}check(rejected,'Malformed access settings rejected');
}
let futureRejected=false;try{m.parseProgress(JSON.stringify({...blank,records:{first:{...m.emptyRecord(),startedAt:now+100000}}}))}catch{futureRejected=true}check(futureRejected,'Future start timestamp rejected');

let focused=m.unlockNode(m.emptyProgress(),'nce1-1');
focused=m.changeStudyStep(focused,'nce1-1',2);
check(focused.records['nce1-1'].studyStep===2&&focused.records['nce1-1'].phase==='learn','Only current learning position changes');
check(!m.achieved(first,focused),'Moving through teaching never grants completion');
focused=m.changeStudyStep(focused,'nce1-1',3);
focused.records['nce1-1'].answers=['saved answer'];
focused.records['nce1-1'].questionIndex=1;
focused=m.changeStudyStep(focused,'nce1-1',1);
check(focused.records['nce1-1'].assisted,'Returning to teaching during a quiz marks assistance');
focused=m.changeStudyStep(focused,'nce1-1',3);
check(focused.records['nce1-1'].answers[0]==='saved answer'&&focused.records['nce1-1'].questionIndex===1,'Step changes preserve in-progress answers and position');
let restored=m.parseProgress(m.exportProgress(focused));
check(restored.records['nce1-1'].questionIndex===1&&restored.records['nce1-1'].studyStep===1,'Focused progress survives backup restoration');
focused=m.restartQuiz(restored,'nce1-1');
check(focused.records['nce1-1'].round===1&&!focused.records['nce1-1'].assisted&&focused.records['nce1-1'].answers.length===0&&focused.records['nce1-1'].questionIndex===0,'Explicit retry resets only current quiz');
check(m.changeStudyStep(focused,'nce1-1',4)===focused,'Invalid teaching step cannot be saved');
check(m.changeStudyStep(focused,'nce1-3',1)===focused,'Locked nodes cannot create learning evidence');
for(const field of ['studyStep','questionIndex','exampleIndex']){const malformed=structuredClone(focused);malformed.records['nce1-1'][field]=100;assert.throws(()=>m.parseProgress(JSON.stringify(malformed)));count++;}
const plans=await import(await moduleURL(path.join(root,'lesson-plan.ts')));
for(const unit of c.units){
 const plan=plans.lessonPlan(unit);
 check(!!plan.goal&&!!plan.own&&!!plan.recall.answer,'Every unit has a concrete expression goal and task');
 check(plan.guided.options.join(' ')===plan.guided.answer,'Guided word tiles reconstruct their reference without dropping repeated words');
 check(plan.goal.length<=30&&plan.goal!=='undefined','Goal is readable and derived from a mapped teaching task');
 if(unit.book==='NCE1'&&unit.lesson<=23)check(plan.guided.answer!==plan.recall.answer||unit.lesson===9,'Beginner recall changes the example rather than copying it');
}
const expressionState=m.unlockNode(m.emptyProgress(),'nce1-1');
expressionState.records['nce1-1']={...m.emptyRecord(),practice:{step:2,guided:'Is this your book?',recall:'Is this your pen?',hinted:true,checked:true},draft:{note:'Is this your bag?'}};
const expressionCopy=m.parseProgress(m.exportProgress(expressionState));
check(JSON.stringify(expressionCopy.records)===JSON.stringify(expressionState.records),'Expression steps, hint use, recall and own draft survive export/restore');
check(!m.achieved(first,expressionCopy)&&!m.stable(first,expressionCopy),'Completing assisted expression practice never counts as quiz mastery');
check(m.restartQuiz(expressionCopy,first.id).records[first.id].practice.recall==='Is this your pen?','A fresh quiz preserves expression work');
for(const change of [{step:3},{step:-1},{step:0.5},{guided:'x'.repeat(1001)},{recall:4},{hinted:'yes'},{checked:1}]){
 const invalid=structuredClone(expressionState);Object.assign(invalid.records[first.id].practice,change);assert.throws(()=>m.parseProgress(JSON.stringify(invalid)));count++;
}
const wrongKind=structuredClone(expressionState);wrongKind.records.first=wrongKind.records[first.id];delete wrongKind.records[first.id];assert.throws(()=>m.parseProgress(JSON.stringify(wrongKind)));count++;
const modality=plans.questionSkills(c.questionsFor(first,0),[false,true,true,true,true,true]);
check(modality.length===3&&modality[0].correct===1&&modality[0].total===2&&modality[0].step===0,'Listening-only errors recommend source listening, not unrelated writing');
check(modality.slice(1).every(x=>x.correct===2),'Correct reading and word order remain visible in the receipt');
const mixed=plans.questionSkills(c.questionsFor(c.nodeById('nce2-1'),0),[true,true,true,true,true,true,false]);
check(mixed.at(-1).id==='grammar'&&mixed.at(-1).correct===0&&mixed.at(-1).step===1,'Grammar application gets a separate repair target');
const speech=await import(await moduleURL(path.join(root,'speaking-model.ts')));
const speechAudio=await import(await moduleURL(path.join(root,'speech-recordings.ts')));
const one=c.units.find(u=>u.id==='nce1-1');
const assessed={text:'Is this your handbag?',accuracy:58,fluency:80,completeness:100,words:[{word:'this',accuracy:40,error:'Mispronunciation',start:0.2,duration:0.4,phonemes:[{phoneme:'ð',accuracy:35}]}]};
const improved={...assessed,accuracy:88,words:[{...assessed.words[0],accuracy:88,error:'None',phonemes:[{phoneme:'ð',accuracy:88}]}]};
let spoken=speech.emptySpeaking(one);
check(!speech.speakingDue(spoken,now),'A recording without actual feedback does not invent a problem');
spoken=speech.recordedSpeaking(spoken,'take-first',false,true,yesterday);
spoken=speech.assessedSpeaking(spoken,assessed,undefined,yesterday);
check(spoken.correction.issues[0].phoneme==='ð'&&spoken.correction.issues[0].action.length>10,'Actual low phoneme produces a specific correction');
check(!speech.speakingDue(spoken,yesterday+speech.speakingDelay-1)&&speech.speakingDue(spoken,yesterday+speech.speakingDelay),'Sentence recall waits a full 24 hours');
check(!speech.recordedSpeaking(spoken,'take-early',true,false,yesterday+1).recalledAt,'Early recall cannot close the next-day task');
check(!speech.recordedSpeaking(spoken,'take-help',true,true,now).recalledAt,'Assisted retry cannot close an independent recall');
const helped={...spoken,hintAt:now};
check(!speech.speakingDue(helped,now)&&speech.speakingReviewAt(helped)===now+speech.speakingDelay,'Looking at the original resets the independent wait');
const recalled=speech.recordedSpeaking(spoken,'take-recalled',true,false,now);
check(recalled.recalledAt===now&&!speech.speakingDue(recalled,now),'Due unassisted recording logs recall without grading pronunciation');
const compared=speech.assessedSpeaking(recalled,improved,assessed,now);
check(compared.comparison[0].includes('匹配度提高')&&compared.correction.at===yesterday,'Retry improvement is retained without inventing a new error');
const relapse=speech.assessedSpeaking(recalled,assessed,improved,now);
check(speech.speakingReviewAt(relapse)===now+speech.speakingDelay,'New concrete error schedules another recall');
const speechState=m.unlockNode(m.emptyProgress(),one.id);
speechState.records[one.id]={...m.emptyRecord(),speaking:compared};
const restoredSpeech=m.parseProgress(m.exportProgress(speechState));
check(JSON.stringify(restoredSpeech.records[one.id].speaking)===JSON.stringify(compared),'Feedback, two take IDs and comparison survive JSON backup');
check(!m.achieved(first,restoredSpeech)&&!m.stable(first,restoredSpeech),'Pronunciation practice never awards course mastery');
check(m.parseProgress(m.exportProgress(m.emptyProgress())).version===2,'Older progress without speaking fields remains valid');
for(const patch of [{row:-1},{row:999},{source:'wrong'},{takes:[...recalled.takes,...recalled.takes]},{takes:[{...recalled.takes[0],assisted:'yes'}]},{hintAt:now+100000},{comparison:['x'.repeat(501)]},{correction:{at:now,issues:[{title:'test',action:'test',clip:{start:3,end:2}}]}}]){
 const invalid=structuredClone(speechState);Object.assign(invalid.records[one.id].speaking,patch);assert.throws(()=>m.parseProgress(JSON.stringify(invalid)));count++;
}
for(const mode of ['practice','review'])check(nav.parseLearningRoute(`#/learn/${one.id}?speaking=${mode}`).speaking===mode,'Sentence practice has a focused deep link');
for(const hash of ['#/map/nce1-1?speaking=review','#/learn/letters?speaking=review','#/learn/nce1-1?speaking=unknown'])check(!nav.parseLearningRoute(hash).speaking,'Unsupported speech routes cannot bypass the course');
for(const unit of c.units)check(unit.rows[speech.speakingRow(unit)]?.en.length>0,'Every unit has an original source sentence');
const audioPair={revision:'r1',takes:[{id:'take-first',blob:new Blob(['test']),result:assessed}]};
check(speechAudio.validSpeechAudio(audioPair),'Valid saved audio and phoneme assessment accepted');
for(const bad of [{...audioPair,takes:[...audioPair.takes,...audioPair.takes]},{...audioPair,takes:[{...audioPair.takes[0],blob:{}}]},{...audioPair,takes:[{...audioPair.takes[0],result:{...assessed,words:null}}]},{...audioPair,takes:[{...audioPair.takes[0],result:{...assessed,accuracy:NaN}}]}])check(!speechAudio.validSpeechAudio(bad),'Malformed saved assessment cannot render as valid feedback');
console.log(`${count} checks passed: 168 source-bound units, audio evidence, source pairing, gates, spaced review, projects, four skills, mocks and progress safety.`);
if(process.argv.includes('--fixtures')){
 const dir=path.join(root,'../work/map-verification');await fs.mkdir(dir,{recursive:true});
 const courseFixture=m.emptyProgress();for(const n of c.nodes.filter(n=>n.kind==='starter'))courseFixture.records[n.id]={...m.emptyRecord(),attempts:[proof(n,0,now)]};
 await fs.writeFile(path.join(dir,'v2-first-course.json'),m.exportProgress(courseFixture));
 await fs.writeFile(path.join(dir,'v2-all-progress.json'),m.exportProgress(state));
 await fs.writeFile(path.join(dir,'v2-blank.json'),m.exportProgress(m.emptyProgress()));
 console.log('Synthetic fixtures saved only under ignored work/map-verification.');
}
