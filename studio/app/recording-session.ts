export type RecordingCapture={result:Promise<Blob>;stop:()=>void;dispose:()=>void};

/** Keep each microphone alive until its own recorder has flushed the final data. */
export function captureRecording(stream:MediaStream):RecordingCapture {
 const release=()=>stream.getTracks().forEach(track=>track.stop());
 let recorder:MediaRecorder;
 try{
  const mimeType=['audio/webm;codecs=opus','audio/mp4'].find(type=>MediaRecorder.isTypeSupported(type));
  recorder=new MediaRecorder(stream,mimeType?{mimeType}:undefined);
 }catch(error){release();throw error}
 const chunks:Blob[]=[];
 let settled=false,failure:Error|undefined,deadline:ReturnType<typeof setTimeout>|undefined;
 let resolve!:(blob:Blob)=>void,reject!:(error:Error)=>void;
 const result=new Promise<Blob>((yes,no)=>{resolve=yes;reject=no});
 function finish(error?:Error){
  if(settled)return;settled=true;clearTimeout(deadline);
  recorder.ondataavailable=null;recorder.onstop=null;recorder.onerror=null;
  release();
  if(error){reject(error);return}
  const blob=new Blob(chunks,{type:recorder.mimeType||chunks[0]?.type});
  if(!blob.size){reject(Error('没有录到声音，请检查麦克风后再录一遍。'));return}
  resolve(blob);
 }
 function stop(){
  if(settled||deadline)return;
  deadline=setTimeout(()=>finish(Error('录音未能保存，请再录一遍。')),10000);
  try{if(recorder.state!=='inactive')recorder.stop()}catch{finish(Error('录音中断，请检查麦克风后重试。'))}
 }
 recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data)};
 recorder.onerror=()=>{failure=Error('录音中断，请检查麦克风后重试。');stop()};
 recorder.onstop=()=>finish(failure);
 try{recorder.start(250)}catch{finish(Error('无法开始录音，请检查麦克风后重试。'))}
 return {result,stop,dispose:()=>{
  if(settled)return;
  finish(Error('录音已取消。'));
  try{if(recorder.state!=='inactive')recorder.stop()}catch{/* Capture is already discarded. */}
 }};
}
