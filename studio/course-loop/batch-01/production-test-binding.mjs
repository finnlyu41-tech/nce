/** TEST ONLY: expose actual production registry and parsers to content tests.
 * No preview reducer or reconstructed matcher enters this path. */
import {getCourseBinding,registeredCourseIds} from '../registry.mjs';
import {mkdir,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
export const supportedCourseIds=registeredCourseIds;
export function draftKeysFor(id){const binding=getCourseBinding(id);return {snapshot:binding.key,inputs:binding.inputsKey}}
export async function fixtureForId(id){
 const binding=getCourseBinding(id);
 const paths={'nce1-1':'../lesson-nce1-001.mjs','nce1-3':'./lesson-nce1-003.mjs','nce1-5':'./lesson-nce1-005.mjs','nce1-7':'../batch-02/lesson-nce1-007.mjs','nce1-9':'../batch-02/lesson-nce1-009.mjs','nce1-11':'../batch-02/lesson-nce1-011.mjs','nce1-13':'../parallel-nce1-013-023/lesson-nce1-013.mjs','nce1-15':'../parallel-nce1-013-023/lesson-nce1-015.mjs','nce1-17':'../parallel-nce1-013-023/lesson-nce1-017.mjs','nce1-19':'../parallel-nce1-013-023/lesson-nce1-019.mjs','nce1-21':'../parallel-nce1-013-023/lesson-nce1-021.mjs','nce1-23':'../parallel-nce1-013-023/lesson-nce1-023.mjs','nce1-25':'../parallel-nce1-025-035/lesson-nce1-025.mjs','nce1-27':'../parallel-nce1-025-035/lesson-nce1-027.mjs','nce1-29':'../parallel-nce1-025-035/lesson-nce1-029.mjs','nce1-31':'../parallel-nce1-025-035/lesson-nce1-031.mjs','nce1-33':'../parallel-nce1-025-035/lesson-nce1-033.mjs','nce1-35':'../parallel-nce1-025-035/lesson-nce1-035.mjs'};
 const content=await import(paths[id]);
 return {model:binding.model,content,keys:draftKeysFor(id),provenance:{binding:'production registry; exported content matcher'}};
}
let parsers;
export async function productionHost(){
 if(!parsers)parsers=(async()=>{
  const root=new URL('../../',import.meta.url),pnpm=new URL('node_modules/.pnpm/',root);
  const versions=(await readdir(pnpm)).filter(n=>/^esbuild@\d+\.\d+\.\d+$/.test(n)).sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}));
  const {build}=await import(new URL(versions[0]+'/node_modules/esbuild/lib/main.js',pnpm));
  const output=new URL(`work/course-loop-production-test/host-${process.pid}.mjs`,root);await mkdir(new URL('.',output),{recursive:true});
  await build({stdin:{contents:`export * from './app/course-loop-progress';export * from './app/course-loop-next';export * from './app/course-loop-summary';export {todayPractice} from './app/today-practice';export {initial,validateState} from './app/model';export {makeProgressFile,readProgressFile,MAX_PROGRESS_BYTES} from './app/progress-file';export {emptyProgress,unlockNode,startNode,achieved} from './map/model';export {nodeById,nodes,unitNodes} from './map/content';export {conditionGoal} from './map/condition-goal';export {lessonIllustration} from './app/sentence-illustration';export {splitLesson} from './app/lesson-structure';`,resolveDir:fileURLToPath(root),loader:'ts'},bundle:true,platform:'node',format:'esm',target:'node22',outfile:fileURLToPath(output),logLevel:'silent'});
  return import(output);
 })();
 return parsers;
}
export async function hostParserFixture(id){
 getCourseBinding(id);const host=await productionHost();
 // Keep the author test's selected-course API while invoking real host code.
 return {parseCourseLoop:(raw,now)=>host.parseCourseLoop(raw,now,id),parseLoopInputs:raw=>host.parseLoopInputs(raw,id)};
}
