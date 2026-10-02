// Navigation presentation only; this session snapshot is separate from learning progress.
export type CatalogueReturn={hash:string;nodeId:string;chapterId?:string;scrollY:number};
const key='english-studio-catalogue-return-v1';

export function readCatalogueReturn():CatalogueReturn|null{
 try{
  const value=JSON.parse(sessionStorage.getItem(key)||'null');
  if(!value||typeof value.hash!=='string'||!/^#\/courses(?:\/[^?#]+)?(?:\?[^#]*)?$/.test(value.hash)||typeof value.nodeId!=='string'||!Number.isFinite(value.scrollY)||value.scrollY<0)return null;
  return {hash:value.hash,nodeId:value.nodeId,scrollY:value.scrollY,...(typeof value.chapterId==='string'?{chapterId:value.chapterId}:{})};
 }catch{return null}
}
export function rememberCatalogueReturn(hash:string,nodeId:string,chapterId?:string):CatalogueReturn{
 const visit={hash,nodeId,chapterId,scrollY:window.scrollY};
 try{sessionStorage.setItem(key,JSON.stringify(visit))}catch{/* Returning in this page still works when session storage is unavailable. */}
 return visit;
}
export function forgetCatalogueReturn(){
 try{sessionStorage.removeItem(key)}catch{/* Navigation does not depend on storage access. */}
}
export function restoreCatalogueReturn(visit:CatalogueReturn){
 const frame=requestAnimationFrame(()=>{
  window.scrollTo({top:visit.scrollY,behavior:'instant'});
  const trigger=document.querySelector<HTMLButtonElement>(`[data-catalogue-node="${CSS.escape(visit.nodeId)}"]`);
  if(trigger){trigger.focus({preventScroll:true});const rect=trigger.getBoundingClientRect();if(rect.top<0||rect.bottom>innerHeight)trigger.scrollIntoView({block:'nearest',behavior:'instant'})}
  else document.querySelector<HTMLHeadingElement>('.page-heading h1')?.focus({preventScroll:true});
 });
 return ()=>cancelAnimationFrame(frame);
}
