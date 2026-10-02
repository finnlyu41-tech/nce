export type Evidence={id:string;url:string;checkedAt:string;scope:'playlist-label'|'part-page'|'official-player-doc'|'transcript'|'video-content';detail:string};
export type VideoSource={id:string;author:{name:string;url:string};book:'NCE1'|'NCE2'|'NCE3'|'NCE4';lessons:number[];bvid:string;p:number;title:string;sourceUrl:string;mapping:Evidence;embed?:Evidence;summary?:{text:string;evidence:Evidence[]}};
export type VideoManifest={version:1;sources:VideoSource[]};
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const fields=(v:Record<string,unknown>,required:string[],optional:string[]=[])=>required.every(k=>Object.hasOwn(v,k))&&Object.keys(v).every(k=>[...required,...optional].includes(k));
const string=(v:unknown,max=1000):v is string=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
function url(v:unknown,host:string){try{const u=new URL(String(v));return u.protocol==='https:'&&u.hostname===host&&!u.username&&!u.password}catch{return false}}
function evidence(v:unknown):v is Evidence{return object(v)&&fields(v,['id','url','checkedAt','scope','detail'])&&string(v.id,120)&&string(v.url)&&['www.bilibili.com','space.bilibili.com','player.bilibili.com'].some(host=>url(v.url,host))&&typeof v.checkedAt==='string'&&Number.isFinite(Date.parse(v.checkedAt))&&['playlist-label','part-page','official-player-doc','transcript','video-content'].includes(String(v.scope))&&string(v.detail,3000)}
export function parseManifest(raw:unknown):VideoManifest{
 if(!object(raw)||!fields(raw,['version','sources'])||raw.version!==1||!Array.isArray(raw.sources)||raw.sources.length>1000)throw Error('视频来源清单不支持。');
 const ids=new Set<string>(),mappings=new Set<string>();
 for(const v of raw.sources){
  if(!object(v)||!fields(v,['id','author','book','lessons','bvid','p','title','sourceUrl','mapping'],['embed','summary'])||!string(v.id,100)||!/^[a-z0-9-]+$/.test(v.id)||ids.has(v.id)||!object(v.author)||!fields(v.author,['name','url'])||!string(v.author.name,100)||!url(v.author.url,'space.bilibili.com')||!['NCE1','NCE2','NCE3','NCE4'].includes(String(v.book))||!Array.isArray(v.lessons)||v.lessons.length<1||v.lessons.length>2||v.lessons.some(n=>!Number.isInteger(n)||n<1||n>{NCE1:144,NCE2:96,NCE3:60,NCE4:48}[v.book as 'NCE1'])||new Set(v.lessons).size!==v.lessons.length||typeof v.bvid!=='string'||!/^BV[0-9A-Za-z]{10}$/.test(v.bvid)||!Number.isInteger(v.p)||Number(v.p)<1||!string(v.title,300)||!url(v.sourceUrl,'www.bilibili.com')||!evidence(v.mapping)||!['playlist-label','part-page'].includes(v.mapping.scope))throw Error('视频课次或来源未核验。');
  const u=new URL(v.sourceUrl as string);if(u.pathname!==`/video/${v.bvid}/`||u.searchParams.get('p')!==String(v.p)||[...u.searchParams.keys()].some(k=>k!=='p')||u.hash)throw Error('视频地址与分 P 不一致。');
  if(v.embed!==undefined&&(!evidence(v.embed)||v.embed.scope!=='official-player-doc'||v.embed.url!=='https://player.bilibili.com/'))throw Error('站内播放来源未核验。');
  if(v.summary!==undefined&&(!object(v.summary)||!fields(v.summary,['text','evidence'])||!string(v.summary.text,12000)||!Array.isArray(v.summary.evidence)||!v.summary.evidence.length||v.summary.evidence.some(e=>!evidence(e)||!['transcript','video-content'].includes(e.scope)||e.url!==v.sourceUrl)))throw Error('视频总结缺少内容证据。');
  const identity=`${v.book}:${v.lessons.join('-')}:${v.bvid}:${v.p}`;if(mappings.has(identity))throw Error('重复视频映射。');ids.add(v.id);mappings.add(identity);
 }
 return structuredClone(raw) as VideoManifest;
}
export function videosFor(manifest:VideoManifest,book:VideoSource['book'],lessons:readonly number[]){return manifest.sources.filter(v=>v.book===book&&v.lessons.some(n=>lessons.includes(n)))}
export function playerUrl(video:VideoSource){if(!video.embed)return null;return `https://player.bilibili.com/player.html?bvid=${video.bvid}&p=${video.p}&autoplay=0&danmaku=0&refer=0`}
export const learningPhases=new Set(['learn','guided','feedback','repair','own','waiting','review-feedback']);
export const canShowVideo=(phase:string)=>learningPhases.has(phase);
