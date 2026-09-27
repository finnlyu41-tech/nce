import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire,stripTypeScriptTypes} from 'node:module';
import worker from './pages-access.js';
const ts=async name=>import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(await readFile(new URL('../app/'+name,import.meta.url),'utf8'))).toString('base64'));
const {pcmWav}=await ts('recording-audio.ts'),{assessRecording,practiceIssues,retryFeedback,recordingWordClip}=await ts('pronunciation.ts');
const samples=new Float32Array(16000).fill(.15),wav=pcmWav(samples),audio=Buffer.from(wav).toString('base64');
assert.equal(new DataView(wav).getUint32(24,true),16000);assert.equal(new DataView(wav).getUint16(22,true),1);
const extremes=new DataView(pcmWav(new Float32Array([-2,0,2])));
assert.equal(extremes.getInt16(44,true),-32768);assert.equal(extremes.getInt16(46,true),0);assert.equal(extremes.getInt16(48,true),32767);
const env={STUDIO_SPEECH_ENABLED:'F0',AZURE_SPEECH_RESOURCE:'test-resource',AZURE_SPEECH_KEY:'test-only-cloud-key'};
const url='https://example.test/api/pronunciation';let calls=0,nextStatus=200;
const fixture={RecognitionStatus:'Success',NBest:[{Display:'Excuse me.',AccuracyScore:73,FluencyScore:60,CompletenessScore:80,Words:[
 {Word:'excuse',AccuracyScore:43,ErrorType:'Mispronunciation',Offset:0,Duration:5000000,Phonemes:[{Phoneme:'ɪ',AccuracyScore:38},{Phoneme:'k',AccuracyScore:92},{Phoneme:'s',AccuracyScore:80},{Phoneme:'j',AccuracyScore:90},{Phoneme:'u',AccuracyScore:90},{Phoneme:'z',AccuracyScore:85}]},
 {Word:'me',AccuracyScore:0,ErrorType:'Omission',Offset:5000000,Duration:3000000},
]}]};let nextBody=fixture;
const realFetch=globalThis.fetch;
globalThis.fetch=async (endpoint,options)=>{
 calls++;assert.equal(endpoint,'https://test-resource.cognitiveservices.azure.com/stt/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed');
 assert.equal(options.headers['Ocp-Apim-Subscription-Key'],env.AZURE_SPEECH_KEY);
 assert.equal(new Headers(options.headers).get('Authorization'),null,'Browser credentials never reach Azure');
 assert.equal(options.redirect,'manual');assert.equal(options.headers['Content-Type'],'audio/wav; codecs=audio/pcm; samplerate=16000');
 const config=JSON.parse(Buffer.from(options.headers['Pronunciation-Assessment'],'base64').toString());
 assert.equal(config.ReferenceText,'Excuse me.');assert.equal(config.EnableMiscue,true);assert.equal(config.EnableProsodyAssessment,false);
 assert.equal(config.PhonemeAlphabet,'IPA');assert.equal(config.Granularity,'Phoneme');
 return new Response(JSON.stringify(nextBody),{status:nextStatus,headers:{'Content-Type':'application/json'}});
};
const send=(body={audio,reference:'Excuse me.',consent:true},headers={},settings=env)=>worker.fetch(new Request(url,{method:'POST',headers:{Origin:'https://example.test','Content-Type':'application/json',...headers},body:typeof body==='string'?body:JSON.stringify(body)}),settings);
try{
 let response=await worker.fetch(new Request(url),{});assert.deepEqual(await response.json(),{enabled:false,maxSeconds:30,mode:'read-aloud',prosody:false});
 assert.equal(response.headers.get('Cache-Control'),'no-store');
 assert.equal((await (await worker.fetch(new Request(url),env)).json()).enabled,true,'Free assessment does not need a learner token secret');
 assert.equal((await send(undefined,{},{})).status,503);
 assert.equal((await send(undefined,{}, {...env,STUDIO_SPEECH_ENABLED:'S0'})).status,503,'Paid flag must not enable this feature');
 assert.equal((await send(undefined,{Origin:'https://other.test'})).status,403);
 assert.equal((await send(undefined,{Origin:''})).status,403);
 assert.equal((await send(undefined,{'Content-Type':'text/plain'})).status,415);
 assert.equal((await send({audio,reference:'Excuse me.',consent:false})).status,400);
 assert.equal((await send({audio,reference:'a'.repeat(601),consent:true})).status,400);
 assert.equal((await send('{broken')).status,400);
 assert.equal((await send({audio:'AAAA',reference:'Excuse me.',consent:true})).status,400);
 assert.equal((await send(' '.repeat(1300001))).status,413);
 const invalidWav=Buffer.from(wav);invalidWav.writeUInt32LE(48000,24);
 assert.equal((await send({audio:invalidWav.toString('base64'),reference:'Excuse me.',consent:true})).status,400);
 const long=Buffer.from(pcmWav(new Float32Array(16000*31))).toString('base64');
 assert.equal((await send({audio:long,reference:'Excuse me.',consent:true})).status,413);
 assert.equal(calls,0,'No rejected request may call Azure');
 response=await send();assert.equal(response.status,200,'A consented recording works without credentials');const result=await response.json();
 assert.equal((await send(undefined,{Authorization:'Bearer obsolete-test-token'})).status,200,'Stale browser credentials are ignored');
 assert.equal(result.accuracy,73);assert.equal(result.words[0].duration,.5);assert.equal(result.words[1].error,'Omission');
 assert(!JSON.stringify(result).includes(env.AZURE_SPEECH_KEY));
 const issues=practiceIssues(result);assert.equal(issues.length,2);assert.equal(issues[0].word,'me');assert.equal(issues[1].word,'excuse');
 assert.equal(issues[0].phoneme,undefined);assert.equal(issues[0].clip,undefined,'Never replay an omission as if spoken');
 assert.equal(issues[1].phoneme,'ɪ');assert.equal(issues[1].example,'it');assert.match(issues[1].action,/舌头/);
 assert.equal(issues[1].clip.start,0);assert(Math.abs(issues[1].clip.end-.68)<1e-8);
 assert.deepEqual(result.words[0].phonemes[0],{phoneme:'ɪ',accuracy:38});
 const goodWord={word:'this',accuracy:90,error:'None',start:.7,duration:.3,phonemes:[{phoneme:'ð',accuracy:35},{phoneme:'ɪ',accuracy:95},{phoneme:'s',accuracy:94}]};
 const detailed={...result,fluency:99,words:[goodWord]};
 assert.equal(practiceIssues(detailed)[0].phoneme,'ð','A weak sound can matter even when word score is high');
 assert.equal(practiceIssues({...detailed,words:[{...goodWord,phonemes:undefined}]}).length,0,'Old responses without phonemes still work');
 assert.equal(practiceIssues({...detailed,words:[{...goodWord,phonemes:[{phoneme:'ð',accuracy:null},{phoneme:'s',accuracy:NaN}]}]}).length,0,'Missing scores are not errors');
 assert.equal(practiceIssues({...detailed,words:[{...goodWord,phonemes:[{phoneme:'ɹ',accuracy:40}]}]})[0].example,undefined,'Uncovered sounds fall back without inventing a mouth instruction');
 assert.equal(practiceIssues({...detailed,words:[goodWord,goodWord,goodWord]}).length,1,'Repeated word cards are deduplicated');
 assert.equal(recordingWordClip({...goodWord,start:-1}),undefined);assert.equal(recordingWordClip({...goodWord,duration:0}),undefined);
 assert.equal(recordingWordClip({...goodWord,start:30}),undefined);assert.equal(recordingWordClip({...goodWord,start:29.8,duration:1}).end,30);
 const improved={...detailed,words:[{...goodWord,phonemes:[{phoneme:'ð',accuracy:85}]}]};
 assert.match(retryFeedback(detailed,improved)[0],/匹配度提高/);
 assert.match(retryFeedback(detailed,{...improved,words:[]})[0],/未能可靠对齐/);
 assert.match(retryFeedback(detailed,{...improved,words:[{...goodWord,phonemes:undefined}]})[0],/数据不足/);
 assert.match(retryFeedback(detailed,{...improved,words:[goodWord,goodWord]})[0],/未能可靠对齐/);
 assert.match(retryFeedback(detailed,{...improved,words:[{...goodWord,error:'Omission'}]})[0],/漏读或多读/);
 assert.equal(practiceIssues({...result,fluency:99,words:[]}).length,0);
 assert.equal(practiceIssues({...result,words:[]}).length,1);
 nextBody={RecognitionStatus:'Success',NBest:[{Display:'Excuse me.',Words:[]} ]};
 assert.equal((await send()).status,502,'Transcription without scores is not an assessment');
 nextBody={RecognitionStatus:'NoMatch'};assert.equal((await send()).status,422);
 nextStatus=429;assert.equal((await send()).status,429);
 nextStatus=401;response=await send();assert.equal(response.status,502);assert(!(await response.text()).includes(env.AZURE_SPEECH_KEY));
 nextStatus=200;nextBody={RecognitionStatus:'Success',NBest:[{Display:'Excuse me.',PronunciationAssessment:{AccuracyScore:90,FluencyScore:80,CompletenessScore:100},Words:[{Word:'excuse',PronunciationAssessment:{AccuracyScore:90,ErrorType:'None'},Offset:0,Duration:2000000}]}]};
 assert.equal((await send()).status,200,'Support nested SDK-style assessment responses too');
 nextBody.NBest[0].Words[0].Phonemes=[{Phoneme:'ɪ',PronunciationAssessment:{AccuracyScore:42}},{Phoneme:'s',AccuracyScore:-1},{Phoneme:'<script>',AccuracyScore:20},null];
 const nested=await (await send()).json();assert.deepEqual(nested.words[0].phonemes,[{phoneme:'ɪ',accuracy:42},{phoneme:'s',accuracy:null}]);
 const maximum=Buffer.from(pcmWav(new Float32Array(16000*30))).toString('base64');
 assert.equal((await send({audio:maximum,reference:'Excuse me.',consent:true})).status,200,'30 second boundary is accepted');
 const assetEnv={ASSETS:{fetch:async request=>{assert.equal(request.headers.get('Authorization'),null);return new Response('asset')} }};
 assert.equal((await worker.fetch(new Request('https://example.test/',{headers:{Authorization:'Basic old'}}),assetEnv)).status,200);
 assert.equal((await worker.fetch(new Request('https://example.test/',{method:'POST'}),assetEnv)).status,405);
 assert.equal((await worker.fetch(new Request('https://example.test/.env'),assetEnv)).status,404);
 assert.equal((await worker.fetch(new Request(url,{method:'DELETE'}),env)).status,405);
 console.log('Recording WAV format, anonymous access, upload consent, size/duration limits, disabled/paid configuration, Azure request mapping, feedback and public static boundaries passed. No live Azure calls.');
}finally{globalThis.fetch=realFetch}

// Run the actual Worker through Workerd too: Node's Request implementation
// accepts redirect modes that the deployed runtime can reject before fetching.
const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=wranglerRequire('miniflare');
let runtimeStatus=200,runtimeCalls=0;
const runtime=new Miniflare({modules:true,compatibilityDate:'2026-05-22',bindings:env,
 script:await readFile(new URL('./pages-access.js',import.meta.url),'utf8'),
 outboundService:async request=>{
  runtimeCalls++;
  assert.equal(new URL(request.url).hostname,'test-resource.cognitiveservices.azure.com');
  assert.equal(request.headers.get('Ocp-Apim-Subscription-Key'),env.AZURE_SPEECH_KEY);
  return new Response(JSON.stringify(fixture),{status:runtimeStatus,headers:{'Content-Type':'application/json',Location:'https://unexpected.test/redirect'}});
 }});
try{
 for(const status of [200,301,302,307,308]){
  runtimeStatus=status;const previousCalls=runtimeCalls;
  const response=await runtime.dispatchFetch(url,{method:'POST',headers:{Origin:'https://example.test','Content-Type':'application/json'},body:JSON.stringify({audio,reference:'Excuse me.',consent:true})});
  assert.equal(response.status,status===200?200:502,'The deployed runtime must assess audio and reject redirects');
  assert.equal(runtimeCalls,previousCalls+1,'No redirect may trigger a second request');
  const body=await response.json();if(status===200)assert.equal(body.accuracy,73);
  assert(!JSON.stringify(body).includes(env.AZURE_SPEECH_KEY));
 }
 console.log('Workerd assessment and redirect isolation passed. No live Azure calls.');
}finally{await runtime.dispose()}

// Exercise the browser client through the Worker with only the Origin header
// a browser adds automatically. No page token, cookie or Authorization is used.
globalThis.fetch=async(endpoint,options)=>{
 if(endpoint==='/api/pronunciation'){
  assert.equal(options.credentials,'omit');
  assert.equal(new Headers(options.headers).get('Authorization'),null);
  return send(JSON.parse(options.body));
 }
 assert.equal(new URL(endpoint).hostname,'test-resource.cognitiveservices.azure.com');
 return new Response(JSON.stringify(fixture),{headers:{'Content-Type':'application/json'}});
};
try{
 const result=await assessRecording(audio,'Excuse me.',new AbortController().signal);
 assert.equal(result.accuracy,73);
 console.log('Browser assessment client and anonymous Worker integration passed. No live Azure calls.');
}finally{globalThis.fetch=realFetch}
