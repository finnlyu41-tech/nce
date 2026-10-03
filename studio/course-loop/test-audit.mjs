import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {registeredCourses,registeredCourseIds} from './registry.mjs';
import {loadTypeScript} from '../scripts/ielts-blueprint-loader.mjs';
const root=new URL('../',import.meta.url),read=async p=>JSON.parse(await readFile(new URL(p,root),'utf8'));
async function readCSV(path){
 const text=await readFile(new URL(path,root),'utf8'),records=[];let record=[],field='',quoted=false;
 for(let i=0;i<text.length;i++){
  const char=text[i];
  if(char==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++}else quoted=!quoted}
  else if(!quoted&&(char===','||char==='\n')){record.push(field);field='';if(char==='\n'){records.push(record);record=[]}}
  else field+=char;
 }
 assert.equal(quoted,false,'CSV quote must close');
 if(field||record.length){record.push(field);records.push(record)}
 const [columns,...rows]=records;return rows.map(row=>{assert.equal(row.length,columns.length);return Object.fromEntries(columns.map((column,i)=>[column,row[i]]))});
}
test('coverage ledger is reproducible against hashed source files',()=>{execFileSync(process.execPath,[new URL('./audit.mjs',import.meta.url).pathname,'--check'],{stdio:'pipe'})});
test('all 348 course numbers map exactly once to 276 real groups; 168 maps and 108 accessible supplements remain distinct',async()=>{
 const {entries}=await read('app/data/textbook-grammar.json'),pages=await read('app/data/nce-pages.json');const all=[];
 for(const e of entries){assert.ok(e.lastLesson>=e.lesson);for(let n=e.lesson;n<=e.lastLesson;n++){assert.ok(pages[e.book].starts[n]);all.push(`${e.book}-${n}`)}}
 assert.equal(entries.length,276);assert.equal(all.length,348);assert.equal(new Set(all).size,348);
 for(const [book,count] of Object.entries({NCE1:144,NCE2:96,NCE3:60,NCE4:48}))for(let n=1;n<=count;n++)assert.ok(all.includes(`${book}-${n}`));
 assert.equal(entries.filter(e=>e.book==='NCE1'||e.book==='NCE2').length,168);assert.equal(entries.filter(e=>e.book==='NCE3'||e.book==='NCE4').length,108);
});
test('pilot media locators match existing first-lesson source binding without copying or changing media',async()=>{
 const {lesson}=await import('./lesson-nce1-001.mjs'),comics=await read('app/data/nce-illustrations.json');assert.equal(comics.lessons[lesson.source.comicKey].sourceSha256,lesson.source.languageSha256);
 const curriculum=await readFile(new URL('map/curriculum.ts',root),'utf8');for(const c of lesson.source.clips)assert.ok(curriculum.includes(`clip(1, ${c.start}, ${c.end})`));
});
test('grammar association is shared content, never falsely counted as 276 bespoke loops',async()=>{const a=await read('docs/course-loop-audit.json');assert.equal(a.counts.sharedGuides,97);assert.equal(a.counts.grammarUnits,28);assert.equal(a.counts.grammarQuestions,168);const csv=await readFile(new URL('docs/course-loop-groups-coverage.csv',root),'utf8');assert.equal(csv.split('not-established-per-lesson').length-1,276)});
test('actual registry derives registered inventory while original 42/54/66/72 bindings and 276 unaccepted loops remain distinct',async()=>{
 const original42=['nce1-1','nce1-3','nce1-5','nce1-7','nce1-9','nce1-11','nce1-13','nce1-15','nce1-17','nce1-19','nce1-21','nce1-23','nce1-25','nce1-27','nce1-29','nce1-31','nce1-33','nce1-35','nce1-37','nce1-39','nce1-41','nce1-43','nce1-45','nce1-47','nce1-49','nce1-51','nce1-53','nce1-55','nce1-57','nce1-59','nce1-61','nce1-63','nce1-65','nce1-67','nce1-69','nce1-71','nce1-73','nce1-75','nce1-77','nce1-79','nce1-81','nce1-83'];
 const original54=[...original42,'nce1-85','nce1-87','nce1-89','nce1-91','nce1-93','nce1-95','nce1-97','nce1-99','nce1-101','nce1-103','nce1-105','nce1-107'];
 const original66=[...original54,'nce1-109','nce1-111','nce1-113','nce1-115','nce1-117','nce1-119','nce1-121','nce1-123','nce1-125','nce1-127','nce1-129','nce1-131'];
 const original72=[...original66,'nce1-133','nce1-135','nce1-137','nce1-139','nce1-141','nce1-143'];
 const expected=[...registeredCourseIds],sourceCourseNumbers=registeredCourses.reduce((n,course)=>n+course.lesson.lessons.length,0);
 assert.deepEqual(expected.slice(0,original42.length),original42);assert.equal(new Set(expected).size,expected.length);
 for(const id of expected){assert.match(id,/^nce[12]-[1-9]\d*$/);if(id.startsWith('nce1-'))assert.equal(Number(id.slice(5))%2,1)}
 assert.equal(registeredCourses.slice(0,original42.length).reduce((n,course)=>n+course.byId.size,0),756);
 assert.equal(registeredCourses.slice(0,original42.length).reduce((n,course)=>n+course.lesson.lessons.length,0),84);
 assert.deepEqual(expected.slice(0,original54.length),original54);
 assert.equal(registeredCourses.slice(0,original54.length).reduce((n,course)=>n+course.byId.size,0),972);
 assert.equal(registeredCourses.slice(0,original54.length).reduce((n,course)=>n+course.lesson.lessons.length,0),108);
 for(const [index,id] of original54.entries()){
  const binding=registeredCourses[index],groupId=`NCE1-${id.slice(5)}`;
  assert.equal(binding.id,id);assert.equal(binding.lesson.source.groupId,groupId);
  assert.equal(binding.key,`nce-course-loop-v1:${groupId}`);assert.equal(binding.inputsKey,`nce-course-loop-inputs-v1:${groupId}`);
 }
 assert.equal(new Set(registeredCourses.slice(0,original54.length).flatMap(binding=>[binding.key,binding.inputsKey])).size,108);
 assert.deepEqual(expected.slice(0,original66.length),original66);
 assert.equal(registeredCourses.slice(0,original66.length).reduce((n,course)=>n+course.byId.size,0),1188);
 assert.equal(registeredCourses.slice(0,original66.length).reduce((n,course)=>n+course.lesson.lessons.length,0),132);
 for(const [index,id] of original66.entries()){
  const binding=registeredCourses[index],groupId=`NCE1-${id.slice(5)}`;
  assert.equal(binding.id,id);assert.equal(binding.lesson.source.groupId,groupId);
  assert.equal(binding.key,`nce-course-loop-v1:${groupId}`);assert.equal(binding.inputsKey,`nce-course-loop-inputs-v1:${groupId}`);
 }
 assert.equal(new Set(registeredCourses.slice(0,original66.length).flatMap(binding=>[binding.key,binding.inputsKey])).size,132);
 assert.deepEqual(expected.slice(0,original72.length),original72);
 assert.equal(registeredCourses.slice(0,original72.length).reduce((n,course)=>n+course.byId.size,0),1296);
 assert.equal(registeredCourses.slice(0,original72.length).reduce((n,course)=>n+course.lesson.lessons.length,0),144);
 for(const [index,id] of original72.entries()){
  const binding=registeredCourses[index],groupId=`NCE1-${id.slice(5)}`;
  assert.equal(binding.id,id);assert.equal(binding.lesson.source.groupId,groupId);
  assert.equal(binding.key,`nce-course-loop-v1:${groupId}`);assert.equal(binding.inputsKey,`nce-course-loop-inputs-v1:${groupId}`);
 }
 assert.equal(new Set(registeredCourses.slice(0,original72.length).flatMap(binding=>[binding.key,binding.inputsKey])).size,144);
 for(const binding of registeredCourses.filter(binding=>binding.lesson.book==='NCE2')){
  const lesson=Number(binding.id.slice(5));assert.ok(lesson>=1&&lesson<=96);
  assert.deepEqual(binding.lesson.lessons,[lesson]);assert.equal(binding.lesson.source.groupId,`NCE2-${lesson}`);
  assert.equal(binding.key,`nce-course-loop-v1:NCE2-${lesson}`);assert.equal(binding.inputsKey,`nce-course-loop-inputs-v1:NCE2-${lesson}`);
 }
 const audit=await read('docs/course-loop-audit.json'),groups=await readCSV('docs/course-loop-groups-coverage.csv'),courses=await readCSV('docs/course-loop-courses-coverage.csv');
 assert.equal(audit.schema,2);assert.deepEqual(audit.registration.courseIds,expected);
 assert.equal(audit.counts.registeredLoopGroups,expected.length);assert.equal(audit.counts.unregisteredLoopGroups,276-expected.length);assert.equal(audit.counts.registeredLoopTextbookCourseNumbers,sourceCourseNumbers);
 assert.equal(groups.filter(row=>row.loopRegistration==='registered').length,expected.length);assert.equal(courses.filter(row=>row.loopRegistration==='registered').length,sourceCourseNumbers);
 const byGroup=new Map(groups.map(row=>[row.group,row]));assert.equal(byGroup.size,276);
 for(const course of registeredCourses){
  const group=byGroup.get(course.lesson.source.groupId);assert.ok(group);assert.equal(group.loopCourseId,course.id);assert.equal(Number(group.loopQuestionCount),course.byId.size);
  const counts=JSON.parse(group.loopStageCounts);
  for(const stage of ['diagnostic','guided','independent','repair','review-a','review-b'])assert.equal(counts[stage],[...course.byId.values()].filter(question=>question.stage===stage).length);
  assert.ok(group.firstTry.startsWith('registered '));assert.ok(group.route.includes(course.lesson.source.mapRoute));
  for(const lesson of course.lesson.lessons){const row=courses.find(row=>row.course===`${course.lesson.book}-${lesson}`);assert.ok(row);assert.equal(row.loopCourseId,course.id)}
 }
 for(const group of groups){assert.equal(group.approvedFiveStepLoop,'not-established-per-lesson');assert.equal(group.loopLearnerValidation,'not-inferred-from-registration');if(group.loopRegistration==='not-registered'){assert.equal(group.loopCourseId,'');assert.equal(group.loopQuestionCount,'0');assert.ok(group.firstTry.startsWith('gap: '))}}
 assert.equal(audit.counts.registeredLoopQuestions,registeredCourses.reduce((n,course)=>n+course.byId.size,0));
 assert.equal(audit.registration.learnerValidation,'not-inferred-from-registration');
});
test('IELTS support ledger enumerates current sample inventory and distinct materials rather than stale 20-session totals',async()=>{
 const {sampleLessonsFor,sampleMaterials}=await loadTypeScript(fileURLToPath(new URL('ielts-blueprint/sample-sequence.ts',root)));
 const expected=['academic','general-training'].flatMap(variant=>sampleLessonsFor(variant).map(lesson=>({id:`${variant}:${lesson.id}`,materials:sampleMaterials(lesson).map(material=>material.id).join('|')})));
 const support=(await readCSV('docs/course-loop-support-coverage.csv')).filter(row=>row.kind==='ielts-mini'),audit=await read('docs/course-loop-audit.json');
 assert.equal(expected.length,29);assert.deepEqual(support.map(row=>({id:row.id,materials:row.materials})),expected);assert.equal(new Set(support.map(row=>row.id)).size,expected.length);
 assert.equal(audit.counts.ieltsSessions,expected.length);assert.equal(audit.counts.support['ielts-mini'],expected.length);
 const materials=new Set(expected.flatMap(row=>row.materials.split('|')));assert.equal(materials.size,126);assert.equal(audit.counts.ieltsUniqueMaterials,materials.size);
});
test('source provenance includes real registry, each frozen lesson import and transitive inventory content',async()=>{
 const audit=await read('docs/course-loop-audit.json');
 for(const [path,sha256] of Object.entries(audit.sourceFiles))assert.equal(sha256,createHash('sha256').update(await readFile(new URL(path,root))).digest('hex'),path);
 assert.ok(audit.sourceFiles['course-loop/registry.mjs']);assert.ok(audit.sourceFiles['course-loop/model.mjs']);
 for(const path of ['course-loop/registry.mjs','ielts-blueprint/sample-sequence.ts','app/grammar-curriculum.ts']){
  const source=await readFile(new URL(path,root),'utf8');
  for(const match of source.matchAll(/from\s+['"](\.[^'"]+)['"]/g)){
   const imported=new URL(match[1]+(/\.[a-z]+$/i.test(match[1])?'':'.ts'),new URL(path,root)),relative=fileURLToPath(imported).slice(fileURLToPath(root).length);
   assert.ok(audit.sourceFiles[relative],`Missing imported source hash: ${relative}`);
  }
 }
});
