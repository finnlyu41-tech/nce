import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {loadTypeScript} from './ielts-blueprint-loader.mjs';
const dir=await mkdtemp(join(tmpdir(),'r12-loader-'));
try{
 const resource=join(dir,'resource.ts');await writeFile(resource,`export const relative=new URL('./audio.wav',import.meta.url).href;export const absolute=new URL('/absolute/audio.wav',import.meta.url).href;export const origin=import.meta.url;export const literal='import.meta.url';/* import.meta.url */`);
 const r=await loadTypeScript(resource),origin=pathToFileURL(resource).href;
 assert.equal(r.origin,origin);assert.equal(r.relative,new URL('./audio.wav',origin).href);assert.equal(r.absolute,new URL('/absolute/audio.wav',origin).href);assert.equal(r.literal,'import.meta.url');
 const plain=join(dir,'plain.ts');await writeFile(plain,`export const answer:number=42;export const text='no resource';`);assert.equal((await loadTypeScript(plain)).answer,42);
 const parent=join(dir,'parent.ts');await writeFile(parent,`export {relative,origin,literal} from './resource';`);assert.deepEqual({...await loadTypeScript(parent)},{relative:r.relative,origin:r.origin,literal:r.literal});
 console.log('PASS loader relative/absolute/source URL/string/plain/import regression');
}finally{await rm(dir,{recursive:true,force:true})}
