import type {FlashcardSource,FlashcardStore} from './flashcard-types';
export type Question={id:string,type:'choice'|'input',prompt:string,options?:string[],answer:string,accepted?:string[],explanation:string};
export type Word={word:string,ipa?:string,meaning:string,example:string,exampleTranslation?:string,sources?:FlashcardSource[]};
export type Lesson={id:number,title:string,subtitle:string,level:string,theme:string,goal:string,dialogue:{speaker:string,en:string,zh:string}[],vocab:Word[],grammar:{title:string,rule:string,formula:string,examples:{en:string,zh:string}[],pitfall:string},patterns:{en:string,zh:string}[],exercises:Question[]};
export type NceBookId="NCE1"|"NCE2"|"NCE3"|"NCE4";
export type NceReview={checks:string[],checkedAt:number,dueAt:number};
export type NceEntry={title:string,text:string,notes:string,steps:string[],review?:NceReview};
export const bookCounts:Record<NceBookId,number>={NCE1:144,NCE2:96,NCE3:60,NCE4:48};
export const nceSteps=["listen","words","retell","practice"];
export function validNceKey(k:string){const [book,no]=k.split("-");return Object.hasOwn(bookCounts,book)&&/^[1-9]\d*$/.test(no||"")&&Number(no)<=(bookCounts as Record<string,number>)[book]&&k===`${book}-${Number(no)}`;}
export type State={nce?:Record<string,NceEntry>,nceLast?:{book:NceBookId,lesson:number},nceEdition?:"standard"|"85",personalWords?:Word[],flashcards?:FlashcardStore,version:1,lastLesson:number,completed:number[],scores:Record<string,number>,mistakes:Record<string,Question>,cards:Record<string,{box:number,due:number}>,days:string[],attempts:number,correct:number,drafts:Record<string,string>,custom:{id:string,title:string,text:string}[]};
export const initial:State={version:1,lastLesson:1,completed:[],scores:{},mistakes:{},cards:{},days:[],attempts:0,correct:0,drafts:{},custom:[]};
export const normal=(s:string)=>s.toLowerCase().trim().replace(/[’‘]/g,"'").replace(/[.,!?;:]/g,'').replace(/\s+/g,' ');
export const isCorrect=(q:Question,a:string)=>[q.answer,...(q.accepted||[])].some(x=>normal(x)===normal(a));
export const day=()=>new Date().toLocaleDateString('en-CA');
export const wordCount=(s:string)=>(s.match(/(?:[A-Za-z]+(?:['’-][A-Za-z]+)*|\d+(?:[.,]\d+)*(?:%|[A-Za-z]+)?)/g)||[]).length;
export function validateState(v:any):v is State {
 try {
 const record=(x:any)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).length<10000&&!Object.keys(x).some(k=>['__proto__','constructor','prototype'].includes(k));
 // Kept here so the classic backup validator stays usable without a runtime
 // module/dependency import. An unknown namespace must never be downgraded.
 const plain=(x:any,limit=10000)=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&[Object.prototype,null].includes(Object.getPrototypeOf(x))&&Object.keys(x).length<=limit&&!Object.keys(x).some(k=>['__proto__','constructor','prototype'].includes(k));
 const fields=(x:any,keys:string[])=>plain(x)&&Object.keys(x).every(k=>keys.includes(k));
 const text=(x:any,max:number,nonempty=false)=>typeof x==='string'&&x.length<=max&&(!nonempty||x.trim().length>0);
 const time=(x:any)=>typeof x==='number'&&Number.isFinite(x)&&Math.abs(x)<=8640000000000000;
 const integer=(x:any,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(x)&&x>=0&&x<=max;
 const numeric=(x:any,max=Number.MAX_SAFE_INTEGER)=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=max;
 const identity=(word:string,meaning:string)=>JSON.stringify([word.normalize('NFKC').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' '),meaning.normalize('NFKC').trim().replace(/\s+/g,' ')]);
 const id=(x:any)=>typeof x==='string'&&/^[A-Za-z0-9][A-Za-z0-9:_-]{0,127}$/.test(x)&&!['__proto__','constructor','prototype'].includes(x);
 const sourceKey=(s:any)=>s.kind==='nce'?`nce:${s.book}:${s.lesson}`:s.kind==='ielts'?`ielts:${s.topic.normalize('NFKC').trim().toLowerCase()}:${s.use}`:s.kind==='reserve'?`reserve:${s.lesson??''}`:'personal';
 const source=(s:any)=>plain(s)&&(
  s.kind==='nce'&&fields(s,['kind','book','lesson'])&&validNceKey(`${s.book}-${s.lesson}`)||
  s.kind==='ielts'&&fields(s,['kind','topic','use'])&&text(s.topic,100,true)&&['speaking','writing','reading','listening'].includes(s.use)||
  s.kind==='personal'&&fields(s,['kind'])||
  s.kind==='reserve'&&fields(s,['kind','lesson'])&&(s.lesson===undefined||Number.isInteger(s.lesson)&&s.lesson>=1&&s.lesson<=36)
 );
 const sources=(s:any)=>Array.isArray(s)&&s.length<=512&&s.every(source)&&new Set(s.map(sourceKey)).size===s.length;
 const legacy=(x:any)=>x===undefined||(fields(x,['key','box','due'])&&text(x.key,100,true)&&integer(x.box,5)&&time(x.due));
 const memory=(x:any)=>x===undefined||(fields(x,['stability','difficulty','elapsed_days','scheduled_days','learning_steps','reps','lapses','state','last_review'])&&numeric(x.stability)&&x.stability>0&&numeric(x.difficulty,10)&&x.difficulty>=1&&numeric(x.elapsed_days)&&integer(x.scheduled_days,36500)&&integer(x.learning_steps,2)&&integer(x.reps)&&x.reps>=1&&integer(x.lapses,x.reps)&&[1,2,3].includes(x.state)&&time(x.last_review)&&Number.isSafeInteger(x.last_review)&&x.last_review>=0);
 const card=(x:any)=>fields(x,['id','noteId','direction','due','revision','legacy','fsrs'])&&id(x.id)&&id(x.noteId)&&['recognition','production'].includes(x.direction)&&time(x.due)&&integer(x.revision)&&legacy(x.legacy)&&memory(x.fsrs)&&(x.fsrs===undefined||x.due>x.fsrs.last_review);
 const session=(x:any,store:any)=>x===undefined||(fields(x,['cardId','revision','revealed'])&&id(x.cardId)&&integer(x.revision)&&typeof x.revealed==='boolean'&&store.cards[x.cardId]?.revision===x.revision);
 const log=(x:any)=>fields(x,['rating','state','due','stability','difficulty','elapsed_days','last_elapsed_days','scheduled_days','learning_steps','review'])&&[1,2,3,4].includes(x.rating)&&[0,1,2,3].includes(x.state)&&time(x.due)&&numeric(x.stability)&&numeric(x.difficulty,10)&&numeric(x.elapsed_days)&&numeric(x.last_elapsed_days)&&integer(x.scheduled_days,36500)&&integer(x.learning_steps,2)&&time(x.review)&&Number.isSafeInteger(x.review)&&x.review>=0;
 const namespace=(store:any)=>{
  if(!fields(store,['version','scheduler','notes','cards','reviews','session','undo'])||store.version!==1||store.scheduler!=='ts-fsrs@5.4.2/v1'||!plain(store.notes)||!plain(store.cards,20000)||!Array.isArray(store.reviews)||store.reviews.length>50000)return false;
  const noteIdentities=new Set<string>(),directions=new Set<string>();
  for(const [key,n] of Object.entries(store.notes) as [string,any][]){
   if(!fields(n,['id','word','meaning','ipa','examples','sources','incomplete','importGuids'])||key!==n.id||!id(key)||!text(n.word,100,true)||!text(n.meaning,300)||![undefined,true].includes(n.incomplete)||(n.incomplete===true?n.meaning.trim().length!==0:n.meaning.trim().length===0)||(n.ipa!==undefined&&!text(n.ipa,100))||!sources(n.sources)||!Array.isArray(n.examples)||n.examples.length>64||!n.examples.every((e:any)=>fields(e,['en','zh'])&&text(e.en,1000,true)&&(e.zh===undefined||text(e.zh,1000)))||(n.importGuids!==undefined&&(!Array.isArray(n.importGuids)||n.importGuids.length>100||!n.importGuids.every((g:any)=>text(g,128,true))||new Set(n.importGuids).size!==n.importGuids.length)))return false;
   const canonical=identity(n.word,n.meaning);if(noteIdentities.has(canonical))return false;noteIdentities.add(canonical);
  }
  for(const [key,c] of Object.entries(store.cards) as [string,any][]){
   if(key!==c?.id||!card(c)||!Object.hasOwn(store.notes,c.noteId)||store.notes[c.noteId].incomplete&&c.fsrs!==undefined)return false;
   const canonical=`${c.noteId}:${c.direction}`;if(directions.has(canonical))return false;directions.add(canonical);
  }
  const seenReviews=new Set<string>(),lastByCard=new Map<string,any>(),previousByCard=new Map<string,any>(),counts=new Map<string,number>();let previousTime=-Infinity;
  const ratingNumbers={again:1,hard:2,good:3,easy:4} as Record<string,number>;
  for(const r of store.reviews){
   if(!fields(r,['id','cardId','rating','reviewedAt','dueBefore','dueAfter','revisionBefore','revisionAfter','localDate','timeZone','utcOffsetMinutes','log'])||!id(r.id)||seenReviews.has(r.id)||!Object.hasOwn(store.cards,r.cardId)||!Object.hasOwn(ratingNumbers,r.rating)||!time(r.reviewedAt)||!Number.isSafeInteger(r.reviewedAt)||r.reviewedAt<0||r.reviewedAt<previousTime||!time(r.dueBefore)||!time(r.dueAfter)||r.dueBefore>r.reviewedAt||r.dueAfter<=r.reviewedAt||!integer(r.revisionBefore)||r.revisionAfter!==r.revisionBefore+1||!text(r.localDate,10)||!/^\d{4}-\d{2}-\d{2}$/.test(r.localDate)||!text(r.timeZone,100,true)||!Number.isInteger(r.utcOffsetMinutes)||Math.abs(r.utcOffsetMinutes)>840||!log(r.log)||r.log.review!==r.reviewedAt||r.log.rating!==ratingNumbers[r.rating])return false;
   const previous=lastByCard.get(r.cardId);if(previous&&r.revisionBefore<previous.revisionAfter)return false;
   if(previous)previousByCard.set(r.cardId,previous);
   seenReviews.add(r.id);lastByCard.set(r.cardId,r);counts.set(r.cardId,(counts.get(r.cardId)||0)+1);previousTime=r.reviewedAt;
  }
  for(const c of Object.values(store.cards) as any[]){const last=lastByCard.get(c.id);if(c.fsrs!==undefined?(!last||c.fsrs.reps!==counts.get(c.id)||c.fsrs.last_review!==last.reviewedAt||c.due!==last.dueAfter||c.revision<last.revisionAfter):!!last)return false;}
  if(!session(store.session,store))return false;
  if(store.undo!==undefined){
   const u=store.undo,last=store.reviews[store.reviews.length-1],before=u?.cardBefore;
   if(!fields(u,['reviewId','cardBefore','sessionBefore'])||!last||u.reviewId!==last.id||!card(before)||before.id!==last.cardId||before.noteId!==store.cards[last.cardId].noteId||before.direction!==store.cards[last.cardId].direction||before.due!==last.dueBefore||before.revision!==last.revisionBefore||store.cards[last.cardId].revision!==last.revisionAfter||(before.fsrs?.last_review??-Infinity)>=last.reviewedAt)return false;
   const previous=previousByCard.get(last.cardId),priorCount=(counts.get(last.cardId)||1)-1;
   if(previous?(!before.fsrs||before.fsrs.reps!==priorCount||before.fsrs.last_review!==previous.reviewedAt||before.due!==previous.dueAfter):before.fsrs!==undefined)return false;
   if(u.sessionBefore!==undefined&&(!fields(u.sessionBefore,['cardId','revision','revealed'])||u.sessionBefore.cardId!==before.id||u.sessionBefore.revision!==before.revision||u.sessionBefore.revealed!==true))return false;
  }
  return true;
 };
 const flashcardsOk=v?.flashcards===undefined||namespace(v.flashcards);
 const reviewOk=(r:any)=>r===undefined||(record(r)&&Array.isArray(r.checks)&&r.checks.length<=3&&new Set(r.checks).size===r.checks.length&&r.checks.every((c:any)=>['meaning','listening','expression'].includes(c))&&Number.isSafeInteger(r.checkedAt)&&r.checkedAt>0&&Number.isSafeInteger(r.dueAt)&&r.dueAt>r.checkedAt&&r.dueAt<=8640000000000000);
 const nceOk=v?.nce===undefined||(record(v.nce)&&Object.keys(v.nce).length<=348&&Object.entries(v.nce).every(([k,e]:any)=>validNceKey(k)&&e&&typeof e.title==='string'&&e.title.length<=120&&typeof e.text==='string'&&e.text.length<=50000&&typeof e.notes==='string'&&e.notes.length<=12000&&Array.isArray(e.steps)&&e.steps.length<=4&&new Set(e.steps).size===e.steps.length&&e.steps.every((s:any)=>nceSteps.includes(s))&&reviewOk(e.review)));
 const lastOk=v?.nceLast===undefined||(v.nceLast&&Number.isInteger(v.nceLast.lesson)&&validNceKey(`${v.nceLast.book}-${v.nceLast.lesson}`));
 const wordsOk=v?.personalWords===undefined||(Array.isArray(v.personalWords)&&v.personalWords.length<=2000&&v.personalWords.every((w:any)=>w&&typeof w.word==='string'&&w.word.trim().length>0&&w.word.length<=100&&typeof w.meaning==='string'&&w.meaning.length<=300&&typeof w.example==='string'&&w.example.length<=1000&&(w.ipa===undefined||typeof w.ipa==='string'&&w.ipa.length<=100)&&(w.exampleTranslation===undefined||text(w.exampleTranslation,1000))&&(w.sources===undefined||sources(w.sources))));
 return flashcardsOk&&nceOk&&lastOk&&wordsOk&&[undefined,'standard','85'].includes(v?.nceEdition)&&v?.version===1&&Number.isInteger(v.lastLesson)&&v.lastLesson>=1&&v.lastLesson<=36&&Array.isArray(v.completed)&&v.completed.length<=36&&v.completed.every((x:any)=>Number.isInteger(x)&&x>=1&&x<=36)&&record(v.scores)&&Object.values(v.scores).every(x=>typeof x==='number'&&x>=0&&x<=100)&&record(v.mistakes)&&Object.entries(v.mistakes).every(([k,q]:any)=>q?.id===k&&typeof q.prompt==='string'&&typeof q.answer==='string'&&typeof q.explanation==='string'&&['choice','input'].includes(q.type)&&(q.type!=='choice'||Array.isArray(q.options)&&q.options.every((s:any)=>typeof s==='string'))&&(!q.accepted||Array.isArray(q.accepted)&&q.accepted.every((s:any)=>typeof s==='string')))&&record(v.cards)&&Object.values(v.cards).every((x:any)=>x&&Number.isInteger(x.box)&&x.box>=0&&x.box<=5&&Number.isFinite(x.due))&&Array.isArray(v.days)&&v.days.every((x:any)=>typeof x==='string')&&Number.isInteger(v.attempts)&&v.attempts>=0&&Number.isInteger(v.correct)&&v.correct>=0&&v.correct<=v.attempts&&record(v.drafts)&&Object.values(v.drafts).every(x=>typeof x==='string')&&Array.isArray(v.custom)&&v.custom.length<=100&&v.custom.every((x:any)=>x&&typeof x.id==='string'&&typeof x.title==='string'&&typeof x.text==='string'&&x.text.length<=50000);
 } catch {return false;}
}
