export const ASSESSMENT_SECONDS = 30;

/** Azure short-audio assessment accepts mono, 16 kHz, 16-bit PCM WAV. */
export function pcmWav(samples: Float32Array): ArrayBuffer {
 const buffer = new ArrayBuffer(44 + samples.length * 2), view = new DataView(buffer);
 const label = (offset:number, value:string) => [...value].forEach((c,i) => view.setUint8(offset+i,c.charCodeAt(0)));
 label(0,'RIFF');view.setUint32(4,36+samples.length*2,true);label(8,'WAVE');label(12,'fmt ');
 view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);
 view.setUint32(24,16000,true);view.setUint32(28,32000,true);view.setUint16(32,2,true);view.setUint16(34,16,true);
 label(36,'data');view.setUint32(40,samples.length*2,true);
 samples.forEach((sample,i)=>{const s=Math.max(-1,Math.min(1,sample));view.setInt16(44+i*2,Math.round(s*(s<0?32768:32767)),true)});
 return buffer;
}

/** A decoded WAV has a definite duration and does not reuse the recorder's container state. */
export async function playableRecording(blob:Blob):Promise<Blob> {
 const context=new AudioContext();
 try{
  let decoded:AudioBuffer;
  try{decoded=await context.decodeAudioData(await blob.arrayBuffer())}
  catch{throw Error('这次录音无法播放，请检查麦克风后再录一遍。')}
  if(!Number.isFinite(decoded.duration)||decoded.duration<.25)throw Error('录音太短，请说完一句再结束。');
  const renderer=new OfflineAudioContext(1,Math.ceil(decoded.duration*16000),16000),source=renderer.createBufferSource();
  source.buffer=decoded;source.connect(renderer.destination);source.start();
  const samples=(await renderer.startRendering()).getChannelData(0);
  if(!samples.some(sample=>Math.abs(sample)>.002))throw Error('没有检测到声音，请检查麦克风或提高音量后再录一遍。');
  return new Blob([pcmWav(samples)],{type:'audio/wav'});
 }finally{await context.close()}
}

export async function assessmentAudio(blob:Blob):Promise<string> {
 const context = new AudioContext();
 try {
  const decoded=await context.decodeAudioData(await blob.arrayBuffer());
  if(decoded.duration<.25)throw Error('录音太短。请完整读一句后再提交。');
  if(decoded.duration>ASSESSMENT_SECONDS+.3)throw Error('逐句评估最多 30 秒，请分句重录。');
  const frames=Math.min(16000*ASSESSMENT_SECONDS,Math.round(decoded.duration*16000));
  const renderer=new OfflineAudioContext(1,frames,16000),source=renderer.createBufferSource();
  source.buffer=decoded;source.connect(renderer.destination);source.start();
  const samples=(await renderer.startRendering()).getChannelData(0);
  if(!samples.some(x=>Math.abs(x)>.002))throw Error('录音中没有检测到足够的声音，请检查麦克风后重录。');
  const bytes=new Uint8Array(pcmWav(samples));let binary='';
  for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
  return btoa(binary);
 } finally { await context.close(); }
}
