// Public study site. Only the explicitly packaged static assets are served.
const headers = {
  'Cache-Control': 'no-cache',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex, nofollow',
  'Content-Security-Policy': "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src blob: data:; font-src data:; connect-src 'self'; frame-src blob:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(self), geolocation=()',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
};
const reply = (body, status, extra = {}) => new Response(body, {status, headers: {...headers, ...extra}});
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) return reply('HTTPS required', 426);
    if (url.pathname === '/api/pronunciation') return pronunciation(request, env);
    if (!env.ASSETS) return reply('Study materials temporarily unavailable.', 503);
    if (!['GET', 'HEAD'].includes(request.method)) return reply('Method not allowed', 405, {Allow: 'GET, HEAD'});
    if (!['/', '/index.html', '/version.json', '/robots.txt', '/materials/manifest.json', '/language/dictionary.json', '/language/index.json', '/lesson-pages/index.json', '/speaking/topics.json'].includes(url.pathname) && !/^\/materials\/[a-f0-9]{64}\/[0-9]{4}\.bin$/.test(url.pathname) && !/^\/lesson-pages\/[a-f0-9]{64}\.jpg$/.test(url.pathname) && !/^\/language\/NCE[1-4]\/[1-9]\d{0,2}\.json$/.test(url.pathname)) return reply('Not found', 404);
    try {
      // Old browsers may still send cached Basic credentials. Never forward them.
      const assetRequest = new Request(request);
      assetRequest.headers.delete('Authorization');
      const response = await env.ASSETS.fetch(assetRequest);
      const result = new Response(response.body, response);
      for (const [key, value] of Object.entries(headers)) result.headers.set(key, value);
      if (/^\/(?:materials\/[a-f0-9]{64}\/|lesson-pages\/[a-f0-9]{64}\.jpg$)/.test(url.pathname) && response.ok) result.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      result.headers.delete('WWW-Authenticate');result.headers.delete('Vary');
      return result;
    } catch { return reply('Materials temporarily unavailable.', 503); }
  },
};

// The public site remains anonymous. Only this optional endpoint needs a private
// learner token. Keys/audio are never written to an asset, log or persistent store.
const jsonReply = (body, status = 200) => reply(JSON.stringify(body), status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
const configured = env => env.STUDIO_SPEECH_ENABLED === 'F0' && /^[a-zA-Z0-9][a-zA-Z0-9-]{1,62}$/.test(env.AZURE_SPEECH_RESOURCE || '') && typeof env.AZURE_SPEECH_KEY === 'string' && env.AZURE_SPEECH_KEY.length >= 16 && /^[a-f0-9]{64}$/.test(env.STUDIO_SPEECH_TOKEN_SHA256 || '');
async function pronunciation(request, env) {
 if (request.method === 'GET') return jsonReply({enabled:!!configured(env),maxSeconds:30,mode:'read-aloud',prosody:false});
 if (request.method !== 'POST') return jsonReply({error:'此接口只接受 GET 或 POST。'},405);
 if (request.headers.get('Origin') !== new URL(request.url).origin) return jsonReply({error:'请从本站提交评估。'},403);
 if (!configured(env)) return jsonReply({error:'站内自动评估尚未启用，录音仍可在本页回听。'},503);
 const token=(request.headers.get('Authorization') || '').match(/^Bearer (\S{16,256})$/)?.[1];
 if (!token) return jsonReply({error:'请输入正确的个人评估口令。'},401);
 const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)));
 const expected=env.STUDIO_SPEECH_TOKEN_SHA256.match(/../g).map(x=>parseInt(x,16));
 let difference=0;for(let i=0;i<32;i++)difference|=digest[i]^expected[i];
 if (difference) return jsonReply({error:'个人评估口令不正确，请重新输入。'},401);
 if (!/^application\/json(?:;|$)/i.test(request.headers.get('Content-Type') || '')) return jsonReply({error:'录音提交格式不支持。'},415);
 const limit=1300000;
 if (Number(request.headers.get('Content-Length'))>limit) return jsonReply({error:'录音过大，请分句重录。'},413);
 let payload;
 try {
  if(!request.body)throw Error();
  const reader=request.body.getReader(),chunks=[];let length=0;
  while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>limit){await reader.cancel();return jsonReply({error:'录音过大，请分句重录。'},413)}chunks.push(value)}
  const body=new Uint8Array(length);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.length}
  payload=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(body));
 } catch {return jsonReply({error:'录音提交内容无效，请重试。'},400)}
 if (!payload || payload.consent!==true || typeof payload.reference!=='string' || !/[a-z]/i.test(payload.reference) || payload.reference.length>600 || /[\x00-\x08\x0b-\x1f]/.test(payload.reference)) return jsonReply({error:'请确认发送录音，并选择一句英文（最多 600 字符）。'},400);
 let audio;
 try {
  if(typeof payload.audio!=='string'||payload.audio.length>1280060||payload.audio.length%4||!/^[A-Za-z0-9+/]*={0,2}$/.test(payload.audio))throw Error();
  audio=Uint8Array.from(atob(payload.audio),c=>c.charCodeAt(0));const wav=new DataView(audio.buffer);
  const tag=(offset,text)=>[...text].every((c,i)=>wav.getUint8(offset+i)===c.charCodeAt(0));
  if(audio.length<8044||audio.length>960044||!tag(0,'RIFF')||wav.getUint32(4,true)!==audio.length-8||!tag(8,'WAVE')||!tag(12,'fmt ')||wav.getUint32(16,true)!==16||wav.getUint16(20,true)!==1||wav.getUint16(22,true)!==1||wav.getUint32(24,true)!==16000||wav.getUint32(28,true)!==32000||wav.getUint16(32,true)!==2||wav.getUint16(34,true)!==16||!tag(36,'data')||wav.getUint32(40,true)!==audio.length-44||(audio.length-44)%2)throw Error();
 }catch{return jsonReply({error:'请提交 0.25–30 秒的有效录音。'},400)}
 const config={ReferenceText:payload.reference.trim(),GradingSystem:'HundredMark',Granularity:'Phoneme',PhonemeAlphabet:'IPA',Dimension:'Comprehensive',EnableMiscue:true,EnableProsodyAssessment:false};
 const encoded=btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(config))));
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),25000);
 try {
  const response=await fetch(`https://${env.AZURE_SPEECH_RESOURCE}.cognitiveservices.azure.com/stt/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed`,{
   // Workerd supports manual redirects; reject every non-2xx response below so
   // an upstream redirect can never forward the key or recording elsewhere.
   method:'POST',redirect:'manual',signal:controller.signal,headers:{'Ocp-Apim-Subscription-Key':env.AZURE_SPEECH_KEY,'Content-Type':'audio/wav; codecs=audio/pcm; samplerate=16000','Accept':'application/json','Pronunciation-Assessment':encoded},body:audio});
  if(response.status===429)return jsonReply({error:'当前额度或请求频率已达到限制，请稍后再试；不会自动升级为付费服务。'},429);
  if(!response.ok)return jsonReply({error:'评估服务暂时不可用，录音仍在本页。请稍后再试。'},502);
  const data=await response.json();
  if(data.RecognitionStatus!=='Success')return jsonReply({error:'这次没有识别到清晰的英文，请靠近麦克风、完整读一句后重录。'},422);
  const best=data.NBest?.[0],scores=best?.PronunciationAssessment||best;
  const score=value=>typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=100?value:null;
  const accuracy=score(scores?.AccuracyScore),fluency=score(scores?.FluencyScore),completeness=score(scores?.CompletenessScore);
  if(accuracy===null||fluency===null||completeness===null||!Array.isArray(best?.Words)||!best.Words.length)throw Error('Missing assessment');
  const words=best.Words.slice(0,160).filter(w=>w&&typeof w==='object').map(w=>{
   const p=w.PronunciationAssessment||w;
   const phonemes=(Array.isArray(w.Phonemes)?w.Phonemes:[]).slice(0,40)
    .filter(p=>p&&typeof p.Phoneme==='string'&&/^[a-z\u0250-\u02ff\u0300-\u036fθðʃʒŋæɛɪɑɔəʌʊɹɚɝ]{1,12}$/u.test(p.Phoneme))
    .map(p=>({phoneme:p.Phoneme,accuracy:score((p.PronunciationAssessment||p).AccuracyScore)}));
   return {word:String(w.Word||'').slice(0,100),accuracy:score(p.AccuracyScore),error:['None','Omission','Insertion','Mispronunciation'].includes(p.ErrorType)?p.ErrorType:'None',start:Math.max(0,Math.min(30,Number(w.Offset)/1e7||0)),duration:Math.max(0,Math.min(30,Number(w.Duration)/1e7||0)),phonemes};
  });
  if(!words.length)throw Error('Missing words');
  return jsonReply({text:String(best.Display||data.DisplayText||'').slice(0,1200),accuracy,fluency,completeness,words});
 }catch{return jsonReply({error:controller.signal.aborted?'评估超时，录音仍在本页，请稍后再试。':'评估没有返回完整结果，请稍后再试。'},502)}
 finally{clearTimeout(timer)}
}
