// Bound network waits, including response bodies. Large downloads reset the
// inactivity timer whenever a chunk arrives, so a slow transfer can finish.
export async function withNetworkTimeout<T>(read:(signal:AbortSignal,activity:()=>void)=>Promise<T>,signal?:AbortSignal,timeoutMs=20000):Promise<T>{
 if(signal?.aborted)throw signal.reason||new DOMException('Aborted','AbortError');
 const controller=new AbortController();
 let timer:ReturnType<typeof setTimeout>|undefined;
 let rejectWait:(reason:unknown)=>void=()=>{};
 const stopped=new Promise<never>((_,reject)=>{rejectWait=reject});
 const stop=(reason:unknown)=>{controller.abort(reason);rejectWait(reason)};
 const cancelled=()=>stop(signal?.reason||new DOMException('Aborted','AbortError'));
 const activity=()=>{if(controller.signal.aborted)return;clearTimeout(timer);timer=setTimeout(()=>stop(new Error('网络等待过久，请检查连接后重试。')),timeoutMs)};
 signal?.addEventListener('abort',cancelled,{once:true});
 activity();
 try{return await Promise.race([read(controller.signal,activity),stopped])}
 finally{clearTimeout(timer);signal?.removeEventListener('abort',cancelled)}
}

export function readJsonResource<T>(path:string):Promise<T>{
 return withNetworkTimeout(async signal=>{
  const response=await fetch(path,{signal,credentials:'same-origin',redirect:'error'});
  if(!response.ok)throw Error(`暂时无法读取资料（${response.status}），请重试。`);
  return response.json() as Promise<T>;
 });
}
