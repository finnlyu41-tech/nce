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
assert(p.answerMatches("  I CAN’T swim! ",'I cannot swim.'));assert(p.answerMatches('I will go.','I will go. / I shall go.'));assert(!p.answerMatches('I can swim.','I cannot swim.'));
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
