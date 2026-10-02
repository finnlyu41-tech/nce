const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export async function connect(url) {
  const socket = new WebSocket(url), pending = new Map(); let id = 0;
  await new Promise((resolve,reject) => {socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  socket.addEventListener('message',event => {
    const message = JSON.parse(String(event.data)), callback = pending.get(message.id);
    if (!callback) return;
    pending.delete(message.id); clearTimeout(callback.timer);
    if (message.error) callback.reject(Error(JSON.stringify(message.error))); else callback.resolve(message.result);
  });
  return {close:()=>socket.close(),send(method,params={}) {
    return new Promise((resolve,reject) => {
      const requestId=++id,timer=setTimeout(()=>{pending.delete(requestId);reject(Error(`CDP timeout: ${method}`));},10_000);
      pending.set(requestId,{resolve,reject,timer});socket.send(JSON.stringify({id:requestId,method,params}));
    });
  }};
}
export async function evaluate(tab, expression) {
  const result=await tab.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
  if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);
  return result.result.value;
}
export async function until(check, message) {
  for(let i=0;i<100;i++){if(await check())return;await delay(30);}
  throw Error(message);
}
