import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
const root=new URL('../app/',import.meta.url),cache=new Map();
async function moduleURL(name){
 if(cache.has(name))return cache.get(name);
 let source=await readFile(new URL(name,root),'utf8');
 for(const match of [...source.matchAll(/^import (?!type )(.+?) from '(\.\/.+?)';/gm)]){
  const dep=match[2].slice(2);
  if(dep.endsWith('.json'))source=source.replace(match[0],`const ${match[1]}=${await readFile(new URL(dep,root),'utf8')};`);
  else source=source.replaceAll("'"+match[2]+"'",JSON.stringify(await moduleURL(dep+'.ts')));
 }
 const url='data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64');cache.set(name,url);return url;
}
const model=await import(await moduleURL('model.ts'));
const g=await import(await moduleURL('textbook-grammar.ts'));
const p=await import(await moduleURL('learning-plan.ts'));
const {transferPrompts}=await import(await moduleURL('learning-transfer.ts'));
assert.deepEqual(Object.keys(transferPrompts).sort(),Object.keys(g.grammarGuides).sort(),'Every mapped grammar goal has a contextual transfer task');
let lessons=0;
for(const [book,count] of Object.entries(model.bookCounts))for(let lesson=1;lesson<=count;lesson++){
 const goals=p.lessonGoals(book,lesson);assert(goals.length>0&&goals.length<=4);
 for(const guide of goals){
  assert(transferPrompts[guide.id].length>=10);
  const questions=[0,1,2].map(v=>p.goalQuestion(guide,v));
  assert.equal(new Set(questions.map(q=>q.answer)).size,3,'Different checks use different reference answers');
  for(const q of questions){assert(q.prompt&&q.explanation);assert(p.answerMatches(q.answer.split(' / ')[0],q.answer));assert(!p.answerMatches('I do not know.',q.answer))}
 }
 lessons++;
}
assert.equal(lessons,348);
assert.equal(p.lessonGoals('NCE1',99)[0].id,'object-clause','The primary goal comes from textbook mapping, not a generic request keyword');
assert.equal(p.learningKey('NCE1',99),p.learningKey('NCE1',100));
assert.notEqual(p.learningKey('NCE2',1),p.learningKey('NCE2',2));
const now=new Date(2026,8,29,14).getTime(),tomorrow=new Date(2026,8,30,15).getTime();
const attempt=(variant,at=now,matched=true,hinted=false)=>({at,variant,matched,hinted});
let goal=p.recordCheck(p.emptyGoal(),attempt(0));
assert.equal(goal.dueAt,new Date(2026,8,30).getTime());assert(!p.stableEvidence(goal));
assert.equal(p.goalStatus(goal,now),'独立练习已通过');
assert.equal(p.goalStatus(goal,tomorrow),'到期巩固');
let repeated=p.recordCheck(goal,attempt(1,now+100));assert(!p.stableEvidence(repeated),'Same-day checks cannot establish spaced evidence');assert.equal(repeated.dueAt,goal.dueAt);
repeated=p.recordCheck(goal,attempt(0,tomorrow));assert(!p.stableEvidence(repeated),'The same item on different days is insufficient');
repeated=p.recordCheck(goal,attempt(1,tomorrow,true,true));assert(!p.stableEvidence(repeated),'Hint-assisted answers are not independent');assert.equal(repeated.dueAt,new Date(2026,9,1).getTime(),'Calendar rollover preserves next-day scheduling');
repeated=p.recordCheck(goal,attempt(1,tomorrow));assert(p.stableEvidence(repeated));assert.equal(repeated.dueAt,new Date(2026,9,7).getTime());
assert(!p.stableEvidence(p.recordCheck(repeated,attempt(2,tomorrow+100,false))),'A latest unsuccessful check cannot hide behind earlier successes');
assert.equal(p.recordCheck(p.emptyGoal(),attempt(0,now,false)).dueAt,new Date(2026,8,30).getTime());
assert.equal(p.nextReviewRound({...goal,checked:'saved',answer:'saved',hinted:true}).hinted,false);
assert.equal(p.nextReviewRound({...goal,checked:'saved',answer:'saved'}).answer,'');
assert(p.answerMatches("  I CAN’T swim! ",'I cannot swim.'));assert(p.answerMatches('I will go.','I will go. / I shall go.'));assert(!p.answerMatches('I can swim.','I cannot swim.'));assert(p.answerMatches('Are they ready? No, they are not.', 'Are they ready? — No, they are not.'));
const legacy={...model.initial,drafts:{'expression-NCE1-99':'legacy expression','ielts-writing':'essay'},nce:{'NCE1-99':{title:'My title',text:'Saved text',notes:'Keep notes',steps:['listen']},'NCE1-100':{title:'Exercise',text:'',notes:'Keep exercise notes',steps:['practice']}}};
let state=p.updateGoal(legacy,'NCE1',100,'object-clause',()=>({...goal,worked:true,answer:'One draft',transfer:'Another draft',checkedTransfer:'Another draft'}));
assert.equal(state.drafts['expression-NCE1-99'],'legacy expression');assert.deepEqual(state.nce,legacy.nce);assert.equal(legacy.drafts[p.learningKey('NCE1',99)],undefined,'Updates do not mutate the previous state');assert(model.validateState(state),'Existing backups accept the new optional draft without migration');
assert.equal(p.learningFor(state,'NCE1',99).goals['object-clause'].answer,'One draft');
assert.deepEqual(p.learningFor(JSON.parse(JSON.stringify(state)),'NCE1',100),p.learningFor(state,'NCE1',99),'Paired record survives backup roundtrip');
assert.equal(p.updateGoal(state,'NCE1',99,'past-simple',()=>goal),state,'An unrelated goal cannot be written into this lesson');
assert.equal(p.dueLearningGoals(state,now).length,0);assert.equal(p.dueLearningGoals(state,tomorrow).length,1,'The paired lesson has one review queue item');
assert.equal(p.nextLearning(state,tomorrow).practice,'review');
assert(!p.learningSummary(state,'NCE1',99).practiced,'Text attempts do not substitute for listening practice');
state=p.updateLearning(state,'NCE1',99,r=>({...r,listened:true}));
assert(p.learningSummary(state,'NCE1',99).practiced);
assert.equal(p.nextLearning({...state,nceLast:{book:'NCE1',lesson:100}},now).lesson,101,'Completed pair advances to next pair');
const changed=p.updateGoal(state,'NCE1',99,'object-clause',v=>({...v,transfer:'An unchecked revision'}));assert(!p.learningSummary(changed,'NCE1',99).practiced);
for(const raw of ['{bad','null','[]','{"version":2}',JSON.stringify({version:1,phase:'bad',goals:{'constructor':{},'x':{attempts:[{at:Infinity}],dueAt:-1,round:Infinity}}})]){
 const record=p.readLearning(raw);assert.equal(record.phase,'model');assert.equal(record.goals.constructor,Object.prototype.constructor);assert(!record.goals.x?.attempts.length);
}
const nav=await import(await moduleURL('navigation.ts'));
for(const route of [{view:'library'},{view:'review'},{view:'nce',book:'NCE1',lesson:99,tab:'practice',goal:'object-clause',practice:'review'}])assert.deepEqual(nav.parseRoute(nav.routeHash(route)),route);
assert.equal(nav.parseRoute('#/nce/NCE1/99?tab=listen&goal=object-clause&practice=review').goal,undefined);
assert.equal(nav.parseRoute('#/nce/NCE1/99?tab=practice&goal=constructor&practice=wrong').goal,undefined);
console.log(`${lessons} lessons / ${Object.keys(transferPrompts).length} goals: mapped tasks, distinct review questions, hint isolation, date boundaries, next steps, backup compatibility and scoped navigation passed.`);

const map=await import(await moduleURL('learning-roadmap.ts'));
const pristine=JSON.stringify(model.initial),snapshot=map.roadmapSnapshot(model.initial,now);
assert.deepEqual(snapshot.map(b=>b.entries.length),[72,96,60,48]);
assert.equal(new Set(snapshot.flatMap(b=>b.entries.map(u=>u.unit.key))).size,276);
for(const book of snapshot){
 assert.equal(book.practiced,0);assert.equal(book.started,0);assert.equal(book.due,0);
 assert.equal(book.topics.flatMap(t=>t.entries).length,book.entries.length,'Every group belongs to a visible knowledge branch');
 for(const unit of book.entries){
  assert.equal(unit.status,'new');
  for(const guide of unit.summary.goals){
   const steps=map.roadmapGoalSteps(model.initial,book.id,unit.unit.first,guide.id,now);
   assert.equal(steps.length,6);
   for(const step of steps)assert.deepEqual(nav.parseRoute(nav.routeHash(step.route)),step.route,'All roadmap steps open real, roundtrippable course routes');
  }
 }
}
assert.equal(JSON.stringify(model.initial),pristine,'Browsing the knowledge framework does not write learning progress');
assert.equal(map.roadmapCurrent(model.initial,now).step,'listen');
assert.equal(map.roadmapUnit(legacy,'NCE1',100,now).status,'legacy','Old self-reports remain distinct from new evidence');
let mapped=p.updateLearning(model.initial,'NCE1',99,r=>({...r,listened:true,goal:'object-clause',phase:'independent'}));
mapped={...mapped,nceLast:{book:'NCE1',lesson:100}};
mapped=p.updateGoal(mapped,'NCE1',99,'object-clause',()=>({...p.emptyGoal(),worked:true}));
assert.equal(map.roadmapCurrent(mapped,now).lesson,99,'Paired lessons locate the same map node');
assert.equal(map.roadmapCurrent(mapped,now).step,'independent');
assert.equal(map.roadmapUnit(mapped,'NCE1',100,now).status,'active');
let proof={...p.recordCheck(p.emptyGoal(),attempt(0)),worked:true,transfer:'My own sentence.',checkedTransfer:'My own sentence.'};
mapped=p.updateGoal(mapped,'NCE1',100,'object-clause',()=>proof);
assert.equal(map.roadmapSnapshot(mapped,now)[0].practiced,1,'One pair counts once');
assert.equal(map.roadmapUnit(mapped,'NCE1',99,now).status,'practiced');
assert.equal(map.roadmapUnit(mapped,'NCE1',99,tomorrow).status,'due');
assert.equal(map.roadmapCurrent(mapped,tomorrow).step,'review');
proof=p.recordCheck(proof,attempt(1,tomorrow));mapped=p.updateGoal(mapped,'NCE1',99,'object-clause',()=>proof);
assert.equal(map.roadmapUnit(mapped,'NCE1',99,tomorrow).status,'stable');
let nodes=map.roadmapGoalSteps(mapped,'NCE1',100,'object-clause',tomorrow);
assert(nodes.find(s=>s.id==='review').done);assert(!nodes.find(s=>s.id==='grammar').done,'Reading the explanation is not automatically certified');
assert.match(nodes.find(s=>s.id==='transfer').detail,/待核对/);
mapped=p.updateGoal(mapped,'NCE1',99,'object-clause',v=>p.recordCheck(v,attempt(2,tomorrow+100,false)));
assert(!map.roadmapGoalSteps(mapped,'NCE1',99,'object-clause',tomorrow).find(s=>s.id==='independent').done,'A failed latest attempt is visible');
mapped=p.updateGoal(mapped,'NCE1',99,'object-clause',v=>p.recordCheck(v,attempt(2,tomorrow+200,true,true)));
assert(!map.roadmapGoalSteps(mapped,'NCE1',99,'object-clause',tomorrow).find(s=>s.id==='review').done,'Hint-assisted checks do not keep a stale passed marker');
for(const route of [{view:'roadmap'},{view:'roadmap',book:'NCE1',lesson:100,category:'clause',goal:'object-clause',query:'宾语'},{view:'roadmap',book:'NCE4'}])assert.deepEqual(nav.parseRoute(nav.routeHash(route)),route);
assert.equal(nav.parseRoute('#/roadmap/NCE1/145?goal=constructor').lesson,undefined);
assert.equal(nav.parseRoute('#/roadmap/NCE1/99?goal=constructor').goal,undefined);
assert.equal(map.roadmapActiveStep({view:'nce',book:'NCE1',lesson:99,tab:'grammar'},mapped),'grammar');
assert.equal(map.roadmapActiveStep({view:'nce',book:'NCE1',lesson:99,tab:'practice',practice:'review'},mapped),'review');

console.log('Roadmap: 276 unique groups, all goal/step destinations, paired and old records, due/spaced/hinted evidence, six-step positions, non-mutating browsing and material routes passed.');

const bp=await import(await moduleURL('ielts-blueprint.ts'));
const initialBlueprint=bp.blueprintSnapshot(model.initial,now);
assert.equal(initialBlueprint.next,'baseline');assert.equal(initialBlueprint.ready,false);
assert.equal(JSON.stringify(model.initial),pristine,'Blueprint browsing is read-only');
for(const raw of ['null','[]','{bad','{"version":2}','{"version":1,"tasks":{"constructor":{"note":"x","decision":"passed"}}}'])assert.equal(Object.keys(bp.readBlueprint(raw).tasks).length,0);
for(const node of bp.blueprintNodes){
 assert(node.goal&&node.gate);
 const route={view:'roadmap',node:node.id};assert.deepEqual(nav.parseRoute(nav.routeHash(route)),route);
 for(const task of node.tasks){
  assert(task.work&&task.check);
  for(const id of task.resources||[])assert(bp.blueprintResources[id]?.url.startsWith('https://'));
  for(const link of [task.course,...task.repair||[]].filter(Boolean)){
   assert.deepEqual(nav.parseRoute(nav.routeHash(link.route)),link.route);
   if(link.route.goal)assert(p.lessonGoals(link.route.book,link.route.lesson).some(g=>g.id===link.route.goal),'Selected repair lesson must teach that exact use');
   assert.notEqual(link.route.task,'ielts-w2','The Academic blueprint never sends a main task to GT writing');
  }
 }
}
assert.equal(nav.parseRoute('#/roadmap?node=constructor').node,undefined);
assert.equal(nav.parseRoute('#/ielts?node=foundation').node,undefined);
let plan=bp.saveBlueprintEvidence(legacy,'foundation.sound','','passed',now);
assert(!bp.evidencePassed(bp.readBlueprint(plan.drafts[bp.blueprintKey]).tasks['foundation.sound']),'No evidence means no pass');
plan=bp.saveBlueprintEvidence(plan,'foundation.sound','A new dialogue; checked the main facts.','skip',now);
assert.equal(bp.blueprintSnapshot(plan,now).nodes.find(n=>n.id==='foundation').passed,1);
assert.equal(bp.blueprintSnapshot(plan,now).current,'foundation','Work and evidence remember the current capability');
assert.equal(bp.saveBlueprintEvidence(plan,'constructor','x','passed'),plan);
assert.equal(plan.drafts['expression-NCE1-99'],legacy.drafts['expression-NCE1-99']);
assert.deepEqual(plan.nce,legacy.nce);assert(model.validateState(plan));
assert.deepEqual(bp.readBlueprint(JSON.parse(JSON.stringify(plan)).drafts[bp.blueprintKey]),bp.readBlueprint(plan.drafts[bp.blueprintKey]));
plan=bp.saveBlueprintEvidence(plan,'foundation.sound','An edited, not yet checked note','todo',now);
assert.equal(bp.blueprintSnapshot(plan,now).nodes.find(n=>n.id==='foundation').passed,0);
const mockA={id:'a',date:'2026-09-27',paper:'Unseen A',kind:'academic',scores:['7','6.5','6','6.5'],unseen:true,timed:true,reviewer:'Qualified teacher',feedback:'Improve support for the second argument.'};
const mockB={...mockA,id:'b',date:'2026-09-28',paper:'Unseen B'};
const mockState=(results,minimum='6',confirmed=true)=>bp.updateBlueprint({...model.initial,drafts:{'ielts-readiness':JSON.stringify({minimum,results})}},r=>({...r,minimumConfirmed:confirmed}));
assert(!bp.blueprintSnapshot(mockState([mockA]),now).ready,'One result cannot finish the route');
assert(!bp.blueprintSnapshot(mockState([mockA,mockB],'6',false),now).ready,'Unconfirmed application requirements cannot finish the route');
assert(bp.blueprintSnapshot(mockState([mockA,mockB]),now).ready);
assert.equal(bp.blueprintSnapshot(mockState([mockA,mockB]),now).next,'finish','Full evidence can bypass unnecessary course checklists');
assert(!bp.blueprintSnapshot(mockState([mockA,mockB],'6.5'),now).ready,'A higher individual requirement is enforced');
assert(!bp.blueprintSnapshot(mockState([mockA,{...mockB,paper:' unseen a '}]),now).ready);
assert(!bp.blueprintSnapshot(mockState([mockA,{...mockB,reviewer:''}]),now).ready);
assert(!bp.blueprintSnapshot(mockState([mockA,{...mockB,timed:false}]),now).ready);
assert(!bp.blueprintSnapshot(mockState([mockA,{...mockB,date:'2099-09-28'}]),now).ready);
assert(!bp.blueprintSnapshot(mockState([{...mockA,kind:'general'},{...mockB,kind:'general'}]),now).ready,'GT results cannot meet an Academic gate');
assert(!bp.blueprintSnapshot(mockState([mockA,mockB,{...mockB,id:'c',date:'2026-09-29',paper:'Unseen C',scores:['5','5','5','5']}]),now).ready,'Latest setback is not hidden');
let diagnosed=mockState([{...mockA,scores:['7','5.5','6','6']}]);
for(const task of bp.blueprintNodes.find(n=>n.id==='foundation').tasks)diagnosed=bp.saveBlueprintEvidence(diagnosed,`foundation.${task.id}`,'New-material check passed; no extra lesson needed.','skip',now);
assert.equal(bp.blueprintSnapshot(diagnosed,now).next,'reading','The lowest assessed skill is checked first');
let allSelf=model.initial;
for(const node of bp.blueprintNodes)for(const task of node.tasks)allSelf=bp.saveBlueprintEvidence(allSelf,`${node.id}.${task.id}`,'Completed a new task with self-review.','passed',now);
assert(!bp.blueprintSnapshot(allSelf,now).ready,'Completing every self-check cannot manufacture an IELTS result');
let hintState=p.updateLearning(p.updateGoal(model.initial,'NCE2',1,'word-order',g=>({...g,answer:'An unfinished answer'})),'NCE2',1,r=>({...r,phase:'independent'}));
hintState=map.prepareRoadmapLesson(hintState,{view:'nce',book:'NCE2',lesson:1,tab:'grammar',goal:'word-order'});
assert(p.learningFor(hintState,'NCE2',1).goals['word-order'].hinted,'Blueprint repairs preserve the independent-attempt hint boundary');
console.log('Academic blueprint: concrete course mappings, optional course skipping, evidence/backup compatibility, current position, weakness priority, assessed Academic-only finish and no false 6.5 from self-checks passed.');
let beginner=bp.updateBlueprint(model.initial,r=>({...r,entry:'new',focus:'starter'}));
assert.equal(bp.blueprintSnapshot(beginner,now).next,'starter','Zero-basis users do not need a full mock or score first');
assert.equal(bp.blueprintSnapshot(beginner,now).record.minimumConfirmed,false);
for(const lesson of bp.starterLessons){
 assert.equal(lesson.steps.length,2);for(const step of lesson.steps){assert(step.en&&step.zh&&step.help);assert(step.options[step.answer]);}
 beginner=bp.updateBlueprint(beginner,r=>({...r,warmups:{...r.warmups,[lesson.id]:2}}));
 assert.equal(bp.readBlueprint(JSON.parse(JSON.stringify(beginner)).drafts[bp.blueprintKey]).warmups[lesson.id],2,'Every small task resumes after backup roundtrip');
 beginner=bp.saveBlueprintEvidence(beginner,`starter.${lesson.id}`,'Two guided choices and learner-confirmed speaking attempt.','passed',now);
}
assert.equal(bp.blueprintSnapshot(beginner,now).next,'foundation');
assert(!bp.blueprintSnapshot(beginner,now).ready,'Encouraging starter feedback never implies an IELTS score');
assert.equal(bp.blueprintSnapshot(bp.updateBlueprint(model.initial,r=>({...r,entry:'exam'})),now).next,'listening','Experienced users can start with a small IELTS task');
console.log('Beginner path: no exam prerequisite, three tiny scaffolded lessons, independent checkpoints, next-stage progression and no score inflation passed.');
