/** TEST/PREVIEW ONLY: bind unchanged v30 reducer source in memory.
 * Publisher owns the production factory; this file never writes a model copy. */
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
export const baseRuntime='0f347924d1ed114df83fa1cc6dd98ff5f3ae5d34';
// This historical preview remains frozen after the publisher adds a real factory.
const frozenFile=baseRuntime+':studio/course-loop/model.mjs';
export async function fixtureSource(contentImport){
 let source=execFileSync('git',['show',frozenFile],{encoding:'utf8',cwd:new URL('../../../',import.meta.url)});
 const sourceSha256=createHash('sha256').update(source).digest('hex');
 const replacements=[
  ["from './lesson-nce1-001.mjs'",`from '${contentImport}'`],
  ["id:'diagnostic-ask',kind:'assessment'","id:questionsFor('diagnostic')[0].id,kind:'assessment'"],
  ['id:`nce1-1:${event.source}`','id:`${lesson.id}:${event.source}`'],
 ];
 for(const [before,after] of replacements){if(source.split(before).length!==2)throw Error('Fixture expected exactly one v30 binding: '+before);source=source.replace(before,after)}
 return {source,sourceSha256,transformations:replacements.map(([before,after])=>({before,after}))};
}
export async function bindModelFixture(contentFile){
 const url=contentFile instanceof URL?contentFile:pathToFileURL(contentFile);
 const {source,...provenance}=await fixtureSource(url.href);
 const model=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
 return {model,provenance};
}
export const supportedCourseIds=Object.freeze(['nce1-1','nce1-3','nce1-5']);
const bindings={
 'nce1-1':{content:new URL('../lesson-nce1-001.mjs',import.meta.url),group:'NCE1-1'},
 'nce1-3':{content:new URL('./lesson-nce1-003.mjs',import.meta.url),group:'NCE1-3'},
 'nce1-5':{content:new URL('./lesson-nce1-005.mjs',import.meta.url),group:'NCE1-5'},
};
export function bindingFor(courseId){if(!Object.hasOwn(bindings,courseId))throw new RangeError('Unsupported course ID; no CL00 fallback.');return bindings[courseId]}
export function draftKeysFor(courseId){const {group}=bindingFor(courseId);return {snapshot:`nce-course-loop-v1:${group}`,inputs:`nce-course-loop-inputs-v1:${group}`}}
export async function fixtureForId(courseId){const binding=bindingFor(courseId),content=await import(binding.content.href),fixture=await bindModelFixture(binding.content);return {...fixture,content,keys:draftKeysFor(courseId)}}
export async function hostParserFixture(courseId){
 const {stripTypeScriptTypes}=await import('node:module');
 const {source}=await fixtureSource(bindingFor(courseId).content.href);
 const coreImport=`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
 let host=stripTypeScriptTypes(await readFile(new URL('../../app/course-loop-progress.ts',import.meta.url),'utf8'));
 host=host.replace("from '../course-loop/model.mjs'",`from '${coreImport}'`).replace("from '../course-loop/lesson-nce1-001.mjs'",`from '${bindingFor(courseId).content.href}'`);
 host=host.replace(/^import .* from '\.\/(model|offline-store)';\n/gm,'');
 const keys=draftKeysFor(courseId);
 host=host.replace("export const courseLoopKey='nce-course-loop-v1:NCE1-1';",`export const courseLoopKey='${keys.snapshot}';`).replace("export const courseLoopInputsKey='nce-course-loop-inputs-v1:NCE1-1';",`export const courseLoopInputsKey='${keys.inputs}';`);
 // Only the pure envelope/input parsers are exercised. Persistence functions
 // remain unresolved deliberately and must never be called from this fixture.
 return import(`data:text/javascript;base64,${Buffer.from(host).toString('base64')}`);
}
