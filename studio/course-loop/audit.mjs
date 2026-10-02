import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {loadTypeScript} from '../scripts/ielts-blueprint-loader.mjs';
import {registeredCourses} from './registry.mjs';
const root=new URL('../',import.meta.url), read=async path=>JSON.parse(await fs.readFile(new URL(path,root),'utf8'));
const {entries}=await read('app/data/textbook-grammar.json');
const explain=await read('app/data/grammar-explanations.json'),pages=await read('app/data/nce-pages.json'),comics=await read('app/data/nce-illustrations.json');
const original=await read('app/data/lessons.json'),legacyIelts=await read('app/data/ielts.json');
const {sampleLessonsFor,sampleMaterials}=await loadTypeScript(fileURLToPath(new URL('ielts-blueprint/sample-sequence.ts',root)));
const {grammarUnits}=await loadTypeScript(fileURLToPath(new URL('app/grammar-curriculum.ts',root)));
const {blueprintNodes}=await loadTypeScript(fileURLToPath(new URL('app/ielts-blueprint.ts',root)));
const {journeyMissions}=await loadTypeScript(fileURLToPath(new URL('app/ielts-journey-content.ts',root)));
const stages=['diagnostic','guided','independent','repair','review-a','review-b'];
const stageCounts=course=>Object.fromEntries(stages.map(stage=>[stage,[...course.byId.values()].filter(q=>q.stage===stage).length]));
const registeredByGroup=new Map();
for(const course of registeredCourses){
 const groupId=course.lesson.source.groupId;
 if(registeredByGroup.has(groupId))throw Error(`Duplicate registered group: ${groupId}`);
 const entry=entries.find(entry=>entry.id===groupId);
 if(!entry||course.lesson.book!==entry.book||course.lesson.lessons.join('|')!==Array.from({length:entry.lastLesson-entry.lesson+1},(_,i)=>entry.lesson+i).join('|'))throw Error(`Registered course does not match textbook inventory: ${course.id}`);
 registeredByGroup.set(groupId,course);
}
const rows=[],groups=[],support=[];
for(const entry of entries){
 const map=['NCE1','NCE2'].includes(entry.book),intro=entry.book==='NCE1'&&entry.lesson<=23;
 const guideIds=explain.lessons[entry.id]||[];
 const grammarUnitsFor=grammarUnits.filter(u=>u.guideIds.some(id=>guideIds.includes(id))).map(u=>u.id);
 const group={group:entry.id,book:entry.book,first:entry.lesson,last:entry.lastLesson,focus:entry.title,mapUnit:map?entry.id.toLowerCase():'',mapChapter:map?(entry.book==='NCE1'?Math.floor((entry.lesson-1)/24)+1:Math.floor((entry.lesson-1)/12)+7):'',guideIds:guideIds.join('|'),sharedGrammarUnits:grammarUnitsFor.join('|'),
 textbook:'indexed-source-reader',originalAudio:'existing-group-source-player; runtime-not-retested',comic:comics.lessons[entry.id]?`existing-${comics.lessons[entry.id].mode}`:'no-indexed-comic; text/audio-fallback',
 firstTry:'gap: no lesson-specific pre-teaching diagnostic',targetedLearn:intro?'authored-first-chapter-focus + shared-guides; no diagnostic routing':'shared-guides-by-lesson; no diagnostic routing',
 independent:map?'real source-recall quiz + shared guide application; not unseen context':'classic lesson-linked practice from shared guide bank; not audited as bespoke unseen context',
 feedback:map?'real quiz key/skill repair + open draft; no preserved bespoke transfer correction chain':'real classic answer/pitfall check + open draft; no bespoke chain',
 delayed:map?'real >=24h map scheduler; source excerpt/guide rotation, not unseen lesson-specific banks':'real classic per-goal calendar-day dueAt (not minimum 24h); shared variants, not bespoke fresh banks',
 route:map?'in-map; serial textbook chapters before IELTS lanes':'available in classic textbook reader/grammar; absent from required map sequence',
 approvedFiveStepLoop:'not-established-per-lesson',pilot:entry.id==='NCE1-1'?'authored-local-proposal; pending-host-integration':'not-authored-this-batch',
 evidence:'app/data/textbook-grammar.json; app/data/grammar-explanations.json; app/learning-plan.ts; map/curriculum.ts; map/lesson-plan.ts; map/course.tsx; map/model.ts'};
 const registered=registeredByGroup.get(entry.id);
 Object.assign(group,{loopRegistration:registered?'registered':'not-registered',loopCourseId:registered?.id??'',loopQuestionCount:registered?.byId.size??0,loopStageCounts:registered?JSON.stringify(stageCounts(registered)):'',loopLearnerValidation:'not-inferred-from-registration'});
 if(registered)Object.assign(group,{
  firstTry:`registered ${stageCounts(registered).diagnostic} authored diagnostic tasks; learner outcome not inferred`,
  targetedLearn:`registered ${registered.lesson.teaching.length} target-linked teaching items`,
  independent:`registered ${stageCounts(registered).independent} authored independent tasks; learner outcome not inferred`,
  feedback:`registered finite-answer checks + ${stageCounts(registered).repair} repair tasks; open expression awaits human review`,
  delayed:`registered ${stageCounts(registered)['review-a']} + ${stageCounts(registered)['review-b']} review tasks; first gate ${registered.lesson.intervals.first}ms; natural retention not inferred`,
  route:`registered course-loop at ${registered.lesson.source.mapRoute}; existing textbook route retained`,
  pilot:'registered-content; learner acceptance not inferred',
  evidence:group.evidence+'; course-loop/registry.mjs; registered lesson module',
 });
 groups.push(group);
 for(let n=entry.lesson;n<=entry.lastLesson;n++)rows.push({course:`${entry.book}-${n}`,group:entry.id,groupFirst:entry.lesson,groupLast:entry.lastLesson,originalBookPage:pages[entry.book].starts[n],...group,courseRole:n===entry.lesson?'group-reading-source':'paired-exercise; uses odd-lesson reading/audio'});
}
for(const variant of ['academic','general-training'])for(const l of sampleLessonsFor(variant))support.push({kind:'ielts-mini',id:`${variant}:${l.id}`,title:l.title,firstTry:'gap: explain/model precede attempt',learn:'authored model + guided',independent:`authored ${l.independent.id}; hidden help/exposure tracked`,feedback:l.skill==='writing'||l.skill==='speaking'?'original/correction + checklist; human review pending':'key/why + separate correction',delayed:`${l.reviews.length} authored fresh banks; existing 24h gate`,route:'registered IELTS course + Today; not interleaved with NCE map',materials:sampleMaterials(l).map(m=>m.id).join('|'),evidence:'ielts-blueprint/sample-sequence.ts; sample-sequence-model.ts; docs/ielts-release-integration-20261002.md'});
for(const u of grammarUnits)support.push({kind:'grammar-unit',id:u.id,title:u.title,firstTry:'not diagnostic-led course',learn:'authored explanations/forms/contrasts/mistakes',independent:`${u.practices.length} concrete practices; shared across textbook associations`,feedback:'real key/explanation; open transfer awaits review',delayed:'existing grammar progress with alternate bank + interval',route:'grammar route + Today; association is not bespoke NCE coverage',materials:u.practices.map(p=>p.id).join('|'),evidence:'app/grammar-curriculum.ts; app/grammar-curriculum-progress.ts; data/grammar-curriculum'});
for(const l of original)support.push({kind:'backup-original',id:`original-${l.id}`,title:l.title,firstTry:'not diagnostic-led',learn:'authored dialogue/grammar/vocab',independent:`${l.exercises.length} concrete exercises; original lesson material`,feedback:'quiz key; no dedicated corrective new bank',delayed:'no dedicated course-level fresh delayed bank',route:'retained backup materials; not a parallel recommended route',materials:l.exercises.map(q=>q.id).join('|'),evidence:'app/data/lessons.json; app/learning.tsx'});
for(const skill of ['listening','reading','speaking','writing']){
 const tasks=Array.isArray(legacyIelts[skill])?legacyIelts[skill]:[legacyIelts[skill]];
 for(const [i,l] of tasks.entries())support.push({kind:'legacy-ielts-task',id:`legacy-${skill}-${l.id??i}`,title:l.title??l.topic??l.prompt??'',firstTry:'standalone task, not diagnostic course',learn:'task instructions/reference',independent:'concrete standalone task',feedback:['listening','reading'].includes(skill)?'answer-key':'self-check/external review',delayed:'no dedicated fresh delayed bank',route:'classic IELTS task tab; preserved compatibility',materials:'',evidence:'app/data/ielts.json; app/ielts.tsx'});
}
for(const [id,title] of [['first','先听懂一句话'],['letters','认识字母与单词'],['small-exchange','完成第一次小问答']])support.push({kind:'starter',id,title,firstTry:'teaching first',learn:'authored beginner lines',independent:'real starter questions',feedback:'key/repair UI',delayed:'starter-v2 additional source; letters rotate pairs',route:'first 3 map nodes',materials:'',evidence:'map/curriculum.ts; map/model.ts; docs/map-reliability-handoff.md'});
for(let i=1;i<=14;i++)support.push({kind:'chapter-checkpoint',id:`chapter-${i}`,title:`第${i}章作品`,firstTry:'not applicable',learn:'project prompt only',independent:'own text/recording; not a scored fresh test',feedback:'real external-review record/criteria; not independently verified',delayed:'member-unit delayed criterion, no separate project fresh bank',route:'after 12 map groups; reviewed project gates next chapter',materials:'',evidence:'map/curriculum.ts; map/course.tsx; map/model.ts'});
for(const lane of blueprintNodes.filter(n=>['listening','reading','writing','speaking'].includes(n.id)))for(const task of lane.tasks)support.push({kind:'map-external-task',id:`${lane.id}-${task.id}`,title:task.title,firstTry:'instruction/evidence task; not lesson diagnostic',learn:'method text with resource/course links',independent:'external material required; not an authored in-app bank',feedback:'actual evidence/reviewer form; claims entered by learner',delayed:'no authored fresh bank for this node',route:'after chapter-14, one of four IELTS branches',materials:'',evidence:'app/ielts-blueprint.ts; map/content.ts; map/model.ts'});
for(const m of journeyMissions)support.push({kind:'legacy-route-node',id:`journey:${m.id}`,title:m.title,firstTry:'teaching first',learn:m.mini?'authored small worked example':'method/evidence instructions',independent:m.mini?`${m.mini.checks.length} concrete finite checks`:'external assignment/evidence',feedback:m.mini?'answer/why + correction route':'evidence and review form',delayed:'legacy journey model; not this lesson loop',route:'retained classic route/deep link; not recommended as second route',materials:'',evidence:'app/ielts-journey-content.ts; app/ielts-journey.ts'});
for(const id of ['mock-one','mock-two','finish'])support.push({kind:'map-final-evidence',id,title:id,firstTry:'not course',learn:'instructions',independent:'external full tests or official result required',feedback:'score/reviewer evidence; not in-app exam content',delayed:'two distinct external tests; no in-app fresh mock bank',route:'map final evidence nodes',materials:'',evidence:'map/content.ts; map/model.ts'});
support.push({kind:'accepted-demo',id:'yesterday-past',title:'昨天的经历',firstTry:'authored diagnostic',learn:'targeted rules',independent:'2 original independent + corrective followups',feedback:'originals/help/exposure + corrective fresh task',delayed:'2x3 fresh tasks + live adapter; old evidence not natural retention',route:'separate demo + Today; not mapped as a particular NCE lesson',materials:'',evidence:'public/demos/yesterday; docs/yesterday-demo-handoff.md'});
const count=values=>Object.fromEntries([...new Set(values)].map(x=>[x,values.filter(v=>v===x).length]));
const files=['app/data/textbook-grammar.json','app/data/grammar-explanations.json','app/data/nce-pages.json','app/data/nce-illustrations.json','app/learning-plan.ts','app/learning-transfer.ts','map/curriculum.ts','map/content.ts','map/lesson-plan.ts','map/model.ts','map/course.tsx','map/expression.tsx','ielts-blueprint/sample-sequence.ts','ielts-blueprint/sample-sequence-model.ts','app/grammar-curriculum.ts','app/data/lessons.json','app/data/ielts.json','app/study-path.ts','app/ielts-blueprint.ts','app/ielts-journey-content.ts'];
// Hash the actual imported inventory too: top-level hashes alone miss changes
// inside the IELTS/grammar content modules and registered lesson dependencies.
const provenance={};
async function hashSource(path,followImports=false){
 const url=new URL(path,root),relative=fileURLToPath(url).slice(fileURLToPath(root).length);
 if(Object.hasOwn(provenance,relative))return;
 const content=await fs.readFile(url);provenance[relative]=createHash('sha256').update(content).digest('hex');
 if(!followImports||! /\.(?:mjs|ts|tsx)$/.test(relative))return;
 for(const match of content.toString().matchAll(/(?:from\s+|import\s*)['"](\.[^'"]+)['"]/g)){
  const imported=new URL(match[1],url),candidates=/\.[a-z]+$/i.test(imported.pathname)?[imported]:['.ts','.tsx','.mjs','.json'].map(extension=>new URL(imported.href+extension));
  let found;
  for(const candidate of candidates){try{await fs.access(candidate);found=candidate;break}catch(error){if(error.code!=='ENOENT')throw error}}
  if(!found)throw Error(`Missing audit source import: ${match[1]} from ${relative}`);
  await hashSource(found.href,true);
 }
}
for(const path of ['course-loop/registry.mjs','app/grammar-curriculum.ts','ielts-blueprint/sample-sequence.ts','app/ielts-blueprint.ts','app/ielts-journey-content.ts'])await hashSource(path,true);
for(const path of files)await hashSource(path);
const registeredGroups=groups.filter(group=>group.loopRegistration==='registered');
const summary={schema:2,auditedSource:'content-hashed inventory, actual registry and imported content sources listed in sourceFiles',scope:'source-level inventory and actual registration; registration does not establish learner acceptance, retention or learning gain',counts:{textbookCourses:rows.length,textbookCoursesByBook:count(rows.map(r=>r.book)),teachingGroups:groups.length,groupsByBook:count(groups.map(r=>r.book)),mapGroups:groups.filter(g=>g.mapUnit).length,classicSupplementGroups:groups.filter(g=>!g.mapUnit).length,comicGroups:Object.keys(comics.lessons).length,sharedGuides:Object.keys(explain.guides).length,grammarUnits:grammarUnits.length,grammarQuestions:grammarUnits.reduce((n,u)=>n+u.practices.length,0),registeredLoopGroups:registeredGroups.length,unregisteredLoopGroups:groups.length-registeredGroups.length,registeredLoopTextbookCourseNumbers:rows.filter(row=>row.loopRegistration==='registered').length,registeredLoopQuestions:registeredCourses.reduce((n,course)=>n+course.byId.size,0),support:count(support.map(r=>r.kind)),ieltsSessions:support.filter(r=>r.kind==='ielts-mini').length,ieltsUniqueMaterials:new Set(support.filter(r=>r.kind==='ielts-mini').flatMap(r=>r.materials.split('|'))).size},registration:{courseIds:registeredCourses.map(course=>course.id),groupIds:registeredCourses.map(course=>course.lesson.source.groupId),learnerValidation:'not-inferred-from-registration'},sourceFiles:provenance};
const csv=(rows)=>{const columns=[...new Set(rows.flatMap(r=>Object.keys(r)))];const quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';return [columns.map(quote).join(','),...rows.map(r=>columns.map(c=>quote(r[c])).join(','))].join('\n')+'\n'};
const outputs=[...Object.entries({courses:rows,groups,support}).map(([name,data])=>[`docs/course-loop-${name}-coverage.csv`,csv(data)]),['docs/course-loop-audit.json',JSON.stringify(summary,null,2)+'\n']];
for(const [path,content] of outputs){if(process.argv.includes('--check')){if(await fs.readFile(new URL(path,root),'utf8')!==content)throw Error(`Stale audit: ${path}`)}else await fs.writeFile(new URL(path,root),content)}
console.log(JSON.stringify(summary.counts,null,2));
