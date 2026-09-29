import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
const load=async file=>import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(await readFile(new URL('../app/'+file,import.meta.url),'utf8'))).toString('base64'));
const {captureRecording}=await load('recording-session.ts');
const {playableRecording}=await load('recording-audio.ts');

const instances=[];
class FakeRecorder {
 static isTypeSupported(type){return type==='audio/webm;codecs=opus'}
 constructor(stream,options){this.stream=stream;this.mimeType=options?.mimeType||'audio/webm';this.state='inactive';instances.push(this)}
 start(timeslice){this.timeslice=timeslice;this.state='recording'}
 stop(){assert.notEqual(this.state,'inactive');this.state='inactive'}
 data(value){this.ondataavailable?.({data:new Blob([value],{type:this.mimeType})})}
 finish(){this.state='inactive';this.onstop?.()}
}
globalThis.MediaRecorder=FakeRecorder;
const stream=()=>{
 const track={readyState:'live',stops:0,stop(){this.stops++;this.readyState='ended'}};
 return {getTracks:()=>[track],track};
};

let previous;
for(let i=0;i<3;i++){
 const mic=stream(),capture=captureRecording(mic),recorder=instances.at(-1);
 assert.equal(recorder.timeslice,250);
 recorder.data(`take-${i}-first;`);
 capture.stop();capture.stop();
 assert.equal(mic.track.readyState,'live','Stopping must wait for the final recorder event before releasing this microphone');
 let done=false;void capture.result.then(()=>{done=true});await Promise.resolve();assert.equal(done,false);
 previous?.stop();previous?.dispose();
 assert.equal(mic.track.stops,0,'An older take cannot release the new microphone');
 recorder.data(`take-${i}-last`);recorder.finish();
 assert.equal(await (await capture.result).text(),`take-${i}-first;take-${i}-last`);
 assert.equal(mic.track.stops,1);
 assert.equal(recorder.ondataavailable,null);
 previous=capture;
}

{
 const mic=stream(),capture=captureRecording(mic),recorder=instances.at(-1);
 const rejected=assert.rejects(capture.result,/没有录到声音/);
 capture.stop();recorder.finish();await rejected;assert.equal(mic.track.stops,1);
}
{
 const mic=stream(),capture=captureRecording(mic),recorder=instances.at(-1);
 const rejected=assert.rejects(capture.result,/录音中断/);
 recorder.data('partial');recorder.onerror();
 assert.equal(mic.track.readyState,'live');recorder.finish();await rejected;assert.equal(mic.track.stops,1);
}
{
 const mic=stream(),capture=captureRecording(mic),recorder=instances.at(-1);
 const rejected=assert.rejects(capture.result,/录音已取消/);
 capture.dispose();capture.dispose();recorder.data('late');recorder.finish();await rejected;
 assert.equal(mic.track.stops,1);assert.equal(recorder.state,'inactive');
}
{
 const mic=stream();globalThis.MediaRecorder=class extends FakeRecorder{start(){throw Error('start failed')}};
 const capture=captureRecording(mic);await assert.rejects(capture.result,/无法开始录音/);assert.equal(mic.track.stops,1);
}
{
 const mic=stream();globalThis.MediaRecorder=class extends FakeRecorder{constructor(){throw Error('unsupported')}};
 assert.throws(()=>captureRecording(mic),/unsupported/);assert.equal(mic.track.stops,1);
}
{
 globalThis.MediaRecorder=FakeRecorder;
 const realTimeout=globalThis.setTimeout,realClear=globalThis.clearTimeout;let expire;
 globalThis.setTimeout=callback=>{expire=callback;return 1};globalThis.clearTimeout=()=>{};
 try{
  const mic=stream(),capture=captureRecording(mic);const rejected=assert.rejects(capture.result,/未能保存/);
  capture.stop();expire();await rejected;assert.equal(mic.track.stops,1);
 }finally{globalThis.setTimeout=realTimeout;globalThis.clearTimeout=realClear}
}

let duration=1,amplitude=.1,corrupt=false,closed=0;
globalThis.AudioContext=class {
 async decodeAudioData(){if(corrupt)throw Error('invalid container');return {duration}}
 async close(){closed++}
};
globalThis.OfflineAudioContext=class {
 constructor(channels,frames,rate){assert.equal(channels,1);assert.equal(rate,16000);this.frames=frames}
 createBufferSource(){return {connect(){},start(){}}}
 async startRendering(){return {getChannelData:()=>new Float32Array(this.frames).fill(amplitude)}}
};
const valid=await playableRecording(new Blob(['encoded take'])),wav=new DataView(await valid.arrayBuffer());
assert.equal(valid.type,'audio/wav');assert.equal(wav.getUint32(24,true),16000);assert.equal(wav.getUint32(40,true),32000);
assert(wav.getInt16(44,true)>0);
duration=.1;await assert.rejects(playableRecording(new Blob(['header only'])),/录音太短/);
duration=1;amplitude=0;await assert.rejects(playableRecording(new Blob(['silence'])),/没有检测到声音/);
corrupt=true;await assert.rejects(playableRecording(new Blob(['broken container'])),/无法播放/);
assert.equal(closed,4,'Every decoder is closed, including rejected recordings');
console.log('Repeated captures, final-data flushing, isolated cleanup, cancellation, recorder failures, stop timeout, WAV duration and invalid/silent audio rejection passed. No microphone or network access.');
