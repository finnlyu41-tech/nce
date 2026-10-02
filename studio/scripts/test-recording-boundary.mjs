import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
const source=stripTypeScriptTypes(await readFile(new URL('../app/pronunciation.ts',import.meta.url),'utf8'));
const {validPronunciationResult,assessRecording}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const good={text:'Is this your handbag?',accuracy:88,fluency:82,completeness:100,words:[{word:'this',accuracy:80,error:'None',start:.2,duration:.3,phonemes:[{phoneme:'ð',accuracy:70}]}]};
assert(validPronunciationResult(good));
const bad=[{text:good.text},{...good,words:undefined},{...good,accuracy:NaN},{...good,accuracy:-1},{...good,fluency:101},{...good,words:[{...good.words[0],error:'unknown'}]},{...good,words:[{...good.words[0],start:-1}]},{...good,words:[{...good.words[0],duration:Infinity}]},{...good,words:[{...good.words[0],phonemes:[{phoneme:'ð',accuracy:101}]}]}];
for(const value of bad)assert(!validPronunciationResult(value));
const realFetch=globalThis.fetch;let body=good,status=200,calls=0;
globalThis.fetch=async(url,options)=>{calls++;assert.equal(url,'/api/pronunciation');assert.equal(options.credentials,'omit');assert.deepEqual(JSON.parse(options.body),{audio:'synthetic-test-only',reference:good.text,consent:true});return new Response(typeof body==='string'?body:JSON.stringify(body),{status})};
try{
 assert.deepEqual(await assessRecording('synthetic-test-only',good.text,new AbortController().signal),good);
 for(const value of bad){body=value;await assert.rejects(assessRecording('synthetic-test-only',good.text,new AbortController().signal),/结果不完整/)}
 body='not JSON';await assert.rejects(assessRecording('synthetic-test-only',good.text,new AbortController().signal),/结果无法读取/);
 body={error:'Synthetic unavailable'};status=503;await assert.rejects(assessRecording('synthetic-test-only',good.text,new AbortController().signal),/Synthetic unavailable/);
 assert.equal(calls,12,'One request per explicit call; no hidden retry');
}finally{globalThis.fetch=realFetch}
console.log('Assessment boundary accepts complete scored feedback, rejects transcript-only/malformed/out-of-range data and keeps explicit retry. No external requests.');
