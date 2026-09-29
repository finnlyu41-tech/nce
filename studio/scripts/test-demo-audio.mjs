import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire,stripTypeScriptTypes} from 'node:module';
import worker from './pages-access.js';

const env={STUDIO_SPEECH_ENABLED:'F0',AZURE_SPEECH_RESOURCE:'test-resource',AZURE_SPEECH_KEY:'test-only-cloud-key'};
const base='https://example.test/api/demo-audio?word=';
const mp3=Uint8Array.from([0x49,0x44,0x33,...new Array(97).fill(0)]);
const originalFetch=globalThis.fetch,originalCaches=globalThis.caches;
const entries=new Map();let calls=0,status=200,body=mp3,contentType='audio/mpeg';
globalThis.caches={default:{match:async key=>entries.get(key.url)?.clone(),put:async(key,response)=>entries.set(key.url,response)}};
globalThis.fetch=async(url,options)=>{
 calls++;
 assert.equal(url,'https://test-resource.cognitiveservices.azure.com/tts/cognitiveservices/v1');
 assert.equal(options.method,'POST');assert.equal(options.redirect,'manual');
 assert.equal(options.headers['Ocp-Apim-Subscription-Key'],env.AZURE_SPEECH_KEY);
 assert.equal(options.headers['X-Microsoft-OutputFormat'],'audio-24khz-48kbitrate-mono-mp3');
 assert.equal(new Headers(options.headers).get('Authorization'),null);
 assert.match(options.body,/<voice name="en-US-JennyNeural">[a-z '-]+<\/voice>/);
 return new Response(body,{status,headers:{'Content-Type':contentType,Location:'https://untrusted.test/'}});
};
const request=(word='Sunday',headers={},settings=env,method='GET')=>worker.fetch(new Request(base+encodeURIComponent(word),{method,headers:{'Sec-Fetch-Site':'same-origin',...headers}}),settings);
try{
 for(const word of ['', 'a'.repeat(61),'<audio src="https://untrusted.test"/>','你好','one two three four five'])assert.equal((await request(word)).status,400);
 assert.equal((await request('was',{},{})).status,503);
 assert.equal((await request('was',{}, {...env,STUDIO_SPEECH_ENABLED:'S0'})).status,503);
 assert.equal((await request('was',{Origin:'https://other.test'})).status,403);
 assert.equal((await request('was',{'Sec-Fetch-Site':'cross-site'})).status,403);
 assert.equal((await request('was',{'Sec-Fetch-Site':'same-site'})).status,403);
 assert.equal((await request('was',{Range:'bytes=0-1,3-4'})).status,416);
 assert.equal((await request('was',{},env,'POST')).status,405);
 assert.equal(calls,0,'Rejected requests never call Azure');
 let response=await request();assert.equal(response.status,200);assert.deepEqual(new Uint8Array(await response.arrayBuffer()),mp3);
 assert.equal(response.headers.get('Content-Type'),'audio/mpeg');assert.equal(response.headers.get('Content-Length'),'100');
 assert.equal(response.headers.get('Cross-Origin-Resource-Policy'),'same-origin');assert.equal(response.headers.get('Accept-Ranges'),'bytes');
 assert(![...response.headers].flat().join(' ').includes(env.AZURE_SPEECH_KEY));
 response=await request(' sunday ',{Range:'bytes=0-1'});assert.equal(response.status,206);assert.equal(response.headers.get('Content-Range'),'bytes 0-1/100');assert.equal((await response.arrayBuffer()).byteLength,2);
 response=await request('SUNDAY',{Range:'bytes=2-'});assert.equal(response.status,206);assert.equal((await response.arrayBuffer()).byteLength,98);
 response=await request('Sunday',{Range:'bytes=-8'});assert.equal(response.headers.get('Content-Range'),'bytes 92-99/100');
 response=await request('Sunday',{},env,'HEAD');assert.equal(response.status,200);assert.equal((await response.arrayBuffer()).byteLength,0);
 for(const range of ['bytes=100-','bytes=5-2','bytes=-0','bytes=999999999999999999999999-'])assert.equal((await request('Sunday',{Range:range})).status,416);
 assert.equal(calls,1,'Safari ranges and repeat taps reuse the complete cached MP3');
 await request("isn’t");assert.equal(calls,2,'Contractions are valid demo words');
 for(const next of [301,302,307,308,401,500,429]){
  entries.clear();status=next;response=await request('was');assert.equal(response.status,next===429?429:502);assert.equal(entries.size,0);
 }
 status=200;contentType='text/html';assert.equal((await request('was')).status,502);
 contentType='audio/mpeg';body=new Uint8Array(512001);assert.equal((await request('was')).status,502);
 body=new Uint8Array(100);assert.equal((await request('was')).status,502);assert.equal(entries.size,0);
 body=mp3;
 globalThis.caches={default:{match:async()=>{throw Error('Cache unavailable')},put:async()=>{throw Error('Cache unavailable')}}};
 assert.equal((await request('was')).status,200,'Cache failure does not turn valid speech into silence');
}finally{globalThis.fetch=originalFetch;globalThis.caches=originalCaches}

// Exercise the deployed Worker runtime, including the Range probe used by Safari.
const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=wranglerRequire('miniflare');let runtimeStatus=200,runtimeCalls=0;
const runtime=new Miniflare({modules:true,compatibilityDate:'2026-05-22',bindings:env,
 script:await readFile(new URL('./pages-access.js',import.meta.url),'utf8'),
 outboundService:async request=>{runtimeCalls++;assert.equal(request.headers.get('Ocp-Apim-Subscription-Key'),env.AZURE_SPEECH_KEY);return new Response(mp3,{status:runtimeStatus,headers:{'Content-Type':'audio/mpeg',Location:'https://untrusted.test/'}})},
});
try{
 let response=await runtime.dispatchFetch(base+'was',{headers:{Range:'bytes=0-1'}});assert.equal(response.status,206);assert.equal((await response.arrayBuffer()).byteLength,2);
 response=await runtime.dispatchFetch(base+'was');assert.equal(response.status,200);assert.equal((await response.arrayBuffer()).byteLength,100);assert.equal(runtimeCalls,1);
 const words=['a','b','c','d'];for(const [i,code] of [301,302,307,308].entries()){runtimeStatus=code;assert.equal((await runtime.dispatchFetch(base+words[i])).status,502)}
 assert.equal(runtimeCalls,5,'Redirects never forward secrets to another host');
}finally{await runtime.dispose()}

const dataUrl=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const rateUrl=dataUrl(stripTypeScriptTypes(await readFile(new URL('../app/playback-rate.ts',import.meta.url),'utf8')));
globalThis.window=Object.assign(new EventTarget(),{localStorage:{getItem:()=>null,setItem:()=>{}}});
globalThis.document=new EventTarget();
const {setPlaybackRate}=await import(rateUrl);
const {playDemo}=await import(dataUrl(stripTypeScriptTypes((await readFile(new URL('../app/demo-audio.ts',import.meta.url),'utf8')).replace("'./playback-rate'",JSON.stringify(rateUrl)))));
const realSetTimeout=globalThis.setTimeout,realClearTimeout=globalThis.clearTimeout;
const timers=new Map();let timer=0;
globalThis.setTimeout=callback=>{timers.set(++timer,callback);return timer};globalThis.clearTimeout=id=>timers.delete(id);
let plays=0,rejectPlay;
const audio={src:'',paused:true,playbackRate:1,volume:0,muted:true,
 play(){plays++;this.paused=false;return new Promise((_,reject)=>{rejectPlay=reject})},
 pause(){this.paused=true},removeAttribute(name){if(name==='src')this.src=''},load(){},
};
try{
 const states=[],ends=[];
 let stop=playDemo(audio,'Sunday',state=>states.push(state),()=>ends.push(true));
 assert.equal(plays,1,'play() happens synchronously within the tap, without awaiting network or voice discovery');
 assert.equal(audio.src,'/api/demo-audio?word=Sunday');assert.equal(audio.muted,false);assert.equal(audio.volume,1);
 assert.equal(window.speechSynthesis,undefined,'No installed browser voice is required');
 assert.equal(states.at(-1).state,'loading');audio.onplaying();assert.equal(states.at(-1).state,'playing');
 setPlaybackRate('0.5');assert.equal(audio.playbackRate,.5);audio.onended();assert.deepEqual(ends,[true]);assert.equal(timers.size,0);assert.equal(audio.src,'');
 stop();assert.equal(ends.length,1);
 stop=playDemo(audio,'was',state=>states.push(state),()=>ends.push(true));const lateReject=rejectPlay;stop();
 playDemo(audio,'zoo',state=>states.push(state),()=>ends.push(true));lateReject(Error('canceled'));await Promise.resolve();assert.equal(audio.src,'/api/demo-audio?word=zoo');assert.equal(states.at(-1).state,'loading');
 window.dispatchEvent(new Event('studio:navigation'));assert.equal(audio.src,'');assert.equal(timers.size,0);
 for(const event of ['hashchange','popstate','pagehide']){playDemo(audio,'was',()=>{},()=>{});window.dispatchEvent(new Event(event));assert.equal(audio.src,'')}
 playDemo(audio,'was',()=>{},()=>{});document.dispatchEvent(new Event('play'));assert.equal(audio.src,'','Starting another media player stops the demo');
 playDemo(audio,'was',state=>states.push(state),()=>{});rejectPlay(Object.assign(Error(),{name:'NotAllowedError'}));await Promise.resolve();assert.match(states.at(-1).message,/再点一次/);assert.equal(timers.size,0);
 playDemo(audio,'was',state=>states.push(state),()=>{});audio.onerror();assert.equal(states.at(-1).state,'error');assert.equal(audio.src,'');
 playDemo(audio,'was',state=>states.push(state),()=>{});[...timers.values()][0]();assert.match(states.at(-1).message,/超时/);assert.equal(timers.size,0);
}finally{globalThis.setTimeout=realSetTimeout;globalThis.clearTimeout=realClearTimeout}
console.log('Azure word demos: F0 guard, bounded text/audio, same-origin requests, MP3 cache, Safari ranges, redirect isolation, no-voice playback, speed, cancellation, stale errors and timeouts passed. No live Azure calls.');
