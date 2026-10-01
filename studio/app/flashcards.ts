import {createEmptyCard,fsrs,Rating,type Card as FsrsCard,type Grade,type ReviewLog} from 'ts-fsrs';
import {validateState,validNceKey,type State,type Word} from './model';
import type {FlashcardCard,FlashcardFsrs,FlashcardNote,FlashcardQueueEntry,FlashcardRating,FlashcardReview,FlashcardSource,FlashcardStore,FlashcardToken} from './flashcard-types';

const SCHEDULER='ts-fsrs@5.4.2/v1' as const;
const MAX_NOTES=10000,MAX_CARDS=20000,MAX_REVIEWS=50000;
const scheduler=fsrs({request_retention:0.9,enable_fuzz:false,enable_short_term:true,learning_steps:['1m','10m'],relearning_steps:['10m']});
const ratings:FlashcardRating[]=['again','hard','good','easy'];
const grades:Record<FlashcardRating,Grade>={again:Rating.Again,hard:Rating.Hard,good:Rating.Good,easy:Rating.Easy};
const wordKey=(s:string)=>s.normalize('NFKC').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ');
const textKey=(s:string)=>s.normalize('NFKC').trim().replace(/\s+/g,' ');
const noteKey=(word:string,meaning:string)=>JSON.stringify([wordKey(word),textKey(meaning)]);

// A deterministic identifier, with a separate full-content comparison at every
// insertion. Even a hash collision must never replace a note or its schedule.
function hash(value:string){
 let left=0xdeadbeef,right=0x41c6ce57;
 for(let index=0;index<value.length;index++){const ch=value.charCodeAt(index);left=Math.imul(left^ch,2654435761);right=Math.imul(right^ch,1597334677);}
 left=Math.imul(left^(left>>>16),2246822507)^Math.imul(right^(right>>>13),3266489909);
 right=Math.imul(right^(right>>>16),2246822507)^Math.imul(left^(left>>>13),3266489909);
 return (left>>>0).toString(16).padStart(8,'0')+(right>>>0).toString(16).padStart(8,'0');
}
const noteId=(word:string,meaning:string)=>`n-${hash(noteKey(word,meaning))}`;
const cardId=(id:string,direction:FlashcardCard['direction'])=>`c-${hash(JSON.stringify([id,direction]))}`;
const emptyStore=():FlashcardStore=>({version:1,scheduler:SCHEDULER,notes:{},cards:{},reviews:[]});

function assertNow(now:number){if(!Number.isSafeInteger(now)||now<0||now>8640000000000000)throw Error('当前时间无效，闪卡记录未更改。');}
function assertState(state:State){if(!validateState(state))throw Error('学习记录或闪卡版本不受支持，原记录未更改。');}
function readyState(state:State,now:number):State{
 if(state.flashcards!==undefined){
  if(state.flashcards?.version!==1||state.flashcards?.scheduler!==SCHEDULER)throw Error('闪卡版本或调度器不受支持，原记录未更改。');
  return state;
 }
 return migrateFlashcards(state,[],now);
}
function finish(state:State,store:FlashcardStore):State{
 if(Object.keys(store.notes).length>MAX_NOTES||Object.keys(store.cards).length>MAX_CARDS)throw Error('闪卡最多保存 10,000 个义项与 20,000 张卡片，原记录未更改。');
 const next={...state,flashcards:store};assertState(next);return next;
}
function sameFields(value:object,allowed:string[]){return Object.keys(value).every(key=>allowed.includes(key));}
function sourceKey(source:FlashcardSource){
 switch(source.kind){
  case 'nce':return `nce:${source.book}:${source.lesson}`;
  case 'ielts':return `ielts:${wordKey(source.topic)}:${source.use}`;
  case 'reserve':return `reserve:${source.lesson??''}`;
  case 'personal':return 'personal';
 }
}
function mergeSources(...groups:FlashcardSource[][]):FlashcardSource[]{
 const merged=new Map<string,FlashcardSource>();
 for(const group of groups){
  if(!Array.isArray(group))throw Error('词条来源格式无效，原记录未更改。');
  for(const item of group){
   if(!item||typeof item!=='object'||Array.isArray(item))throw Error('词条来源格式无效，原记录未更改。');
   const ok=item.kind==='nce'?sameFields(item,['kind','book','lesson'])&&validNceKey(`${item.book}-${item.lesson}`):
    item.kind==='ielts'?sameFields(item,['kind','topic','use'])&&typeof item.topic==='string'&&item.topic.trim().length>0&&item.topic.length<=100&&['speaking','writing','reading','listening'].includes(item.use):
    item.kind==='personal'?sameFields(item,['kind']):
    item.kind==='reserve'?sameFields(item,['kind','lesson'])&&(item.lesson===undefined||Number.isInteger(item.lesson)&&item.lesson>=1&&item.lesson<=36):false;
   if(!ok)throw Error('词条来源格式无效，原记录未更改。');
   const key=sourceKey(item);if(!merged.has(key))merged.set(key,{...item});
  }
 }
 if(merged.size>512)throw Error('这个义项的来源过多，原记录未更改。');
 return [...merged.values()];
}
function mergeExamples(...groups:FlashcardNote['examples'][]):FlashcardNote['examples']{
 const merged=new Map<string,FlashcardNote['examples'][number]>();
 for(const group of groups)for(const example of group){
  const key=JSON.stringify([textKey(example.en),example.zh===undefined?null:textKey(example.zh)]);
  if(!merged.has(key))merged.set(key,{...example});
 }
 if(merged.size>64)throw Error('这个义项最多保留 64 个例句，原记录未更改。');
 return [...merged.values()];
}
function wordContent(word:Word,sources:FlashcardSource[],allowIncomplete=false):Omit<FlashcardNote,'id'>{
 if(!word||typeof word.word!=='string'||word.word.trim().length===0||word.word.length>100||typeof word.meaning!=='string'||word.meaning.length>300||!allowIncomplete&&word.meaning.trim().length===0||typeof word.example!=='string'||word.example.length>1000||word.ipa!==undefined&&(typeof word.ipa!=='string'||word.ipa.length>100)||word.exampleTranslation!==undefined&&(typeof word.exampleTranslation!=='string'||word.exampleTranslation.length>1000))throw Error('词条格式无效或缺少释义，原记录未更改。');
 const examples:FlashcardNote['examples']=word.example.trim()? [{en:word.example,...(word.exampleTranslation!==undefined?{zh:word.exampleTranslation}:{})}]:[];
 return {word:word.word,meaning:word.meaning,...(word.ipa!==undefined?{ipa:word.ipa}:{}),examples,sources,...(word.meaning.trim()?{}:{incomplete:true as const})};
}
function mergeNote(existing:FlashcardNote,incoming:FlashcardNote):FlashcardNote{
 const importGuids=[...new Set([...(existing.importGuids||[]),...(incoming.importGuids||[])])];
 if(importGuids.length>100)throw Error('这个词条的内容标识过多，原记录未更改。');
 return {...existing,...(existing.ipa===undefined&&incoming.ipa!==undefined?{ipa:incoming.ipa}:{}),sources:mergeSources(existing.sources,incoming.sources),examples:mergeExamples(existing.examples,incoming.examples),...(importGuids.length?{importGuids}:{})};
}
function ensureDirection(store:FlashcardStore,note:FlashcardNote,direction:FlashcardCard['direction'],now:number):FlashcardStore{
 if(Object.values(store.cards).some(card=>card.noteId===note.id&&card.direction===direction))return store;
 const id=cardId(note.id,direction),collision=store.cards[id];
 if(collision)throw Error('闪卡标识冲突，原排程未被覆盖。');
 return {...store,cards:{...store.cards,[id]:{id,noteId:note.id,direction,due:now,revision:0}}};
}
function upsertWord(store:FlashcardStore,word:Word,sources:FlashcardSource[],now:number,allowIncomplete=false):{store:FlashcardStore;note:FlashcardNote}{
 const content=wordContent(word,mergeSources(word.sources||[],sources),allowIncomplete),key=noteKey(content.word,content.meaning),id=noteId(content.word,content.meaning);
 let existing=Object.values(store.notes).find(note=>noteKey(note.word,note.meaning)===key);
 const collision=store.notes[id];
 if(collision&&noteKey(collision.word,collision.meaning)!==key&&!(collision.incomplete&&wordKey(collision.word)===wordKey(content.word)))throw Error('词条标识冲突，原内容未被覆盖。');
 const incomplete=!content.incomplete?Object.values(store.notes).find(note=>note.incomplete&&wordKey(note.word)===wordKey(content.word)):undefined;
 if(existing&&incomplete&&existing.id!==incomplete.id)throw Error('同词的旧缺义卡与现有义项需要核对，原内容与排程未被覆盖。');
 let note:FlashcardNote;
 if(incomplete){
  const prior={...incomplete};delete prior.incomplete;
  note={...prior,word:content.word,meaning:content.meaning,...(prior.ipa===undefined&&content.ipa!==undefined?{ipa:content.ipa}:{}),sources:mergeSources(prior.sources,content.sources),examples:mergeExamples(prior.examples,content.examples)};
  existing=incomplete;
 }else if(existing){note=mergeNote(existing,{...content,id:existing.id});}
 else{if(collision)throw Error('词条标识冲突，原内容未被覆盖。');note={...content,id};}
 const same=existing&&JSON.stringify(existing)===JSON.stringify(note);
 let next=same?store:{...store,notes:{...store.notes,[note.id]:note}};
 next=ensureDirection(next,note,'recognition',now);
 return {store:next,note};
}

/** Migrate only enrolled legacy cards/personal words; boxes are never review history. */
export function migrateFlashcards(state:State,reserveWords:Word[]=[],now=Date.now()):State{
 assertNow(now);assertState(state);if(state.flashcards!==undefined)return state;
 let store=emptyStore();
 for(const word of state.personalWords||[]){const sources=word.sources?.length?[]:[{kind:'personal'} as FlashcardSource];store=upsertWord(store,word,sources,now,true).store;}
 for(const [key,legacy] of Object.entries(state.cards)){
  const personal=(state.personalWords||[]).filter(word=>wordKey(word.word)===wordKey(key));
  const reserve=personal.length?[]:reserveWords.filter(word=>wordKey(word.word)===wordKey(key));
  const word=personal[personal.length-1]||reserve[reserve.length-1]||{word:key,meaning:'',example:''};
  const sources=word.sources?.length?[]:personal.length?[{kind:'personal'} as FlashcardSource]:reserve.length?[{kind:'reserve'} as FlashcardSource]:[];
  const enrolled=upsertWord(store,word,sources,now,true);store=enrolled.store;
  const card=Object.values(store.cards).find(item=>item.noteId===enrolled.note.id&&item.direction==='recognition')!;
  if(card.legacy&&(card.legacy.box!==legacy.box||card.legacy.due!==legacy.due))throw Error('旧版同词含有冲突排程，原记录未被覆盖。');
  if(!card.legacy)store={...store,cards:{...store.cards,[card.id]:{...card,due:legacy.due,legacy:{key,box:legacy.box,due:legacy.due}}}};
 }
 return finish(state,store);
}

/** Enroll content without changing the historic personalWords/cards fields. */
export function enrollFlashcard(state:State,word:Word,sources:FlashcardSource[]=[],now=Date.now()):State{
 assertNow(now);const current=readyState(state,now),store=current.flashcards!;
 const requested=word.sources?.length||sources.length?sources:[{kind:'personal'} as FlashcardSource];
 const enrolled=upsertWord(store,word,requested,now);
 return enrolled.store===store?current:finish(current,enrolled.store);
}

export function isFlashcardEnrolled(state:State,word:Word|string):boolean{
 const current=readyState(state,Date.now()),store=current.flashcards!;
 const enrolled=new Set(Object.values(store.cards).map(card=>card.noteId));
 return Object.values(store.notes).some(item=>enrolled.has(item.id)&&(typeof word==='string'?wordKey(item.word)===wordKey(word):noteKey(item.word,item.meaning)===noteKey(word.word,word.meaning)));
}
function phase(card:FlashcardCard):FlashcardQueueEntry['phase']{return card.fsrs?card.fsrs.state===2?'review':'learning':card.legacy?'review':'new';}
export function getFlashcardQueue(state:State,now=Date.now(),filter:'all'|'nce'|'ielts'='all'):FlashcardQueueEntry[]{
 assertNow(now);const store=readyState(state,now).flashcards!;
 const rank={learning:0,review:1,new:2};
 return Object.values(store.cards).filter(card=>card.due<=now).map(card=>({card,note:store.notes[card.noteId],phase:phase(card)})).filter(item=>filter==='all'||item.note.sources.some(source=>source.kind===filter)).sort((a,b)=>rank[a.phase]-rank[b.phase]||a.card.due-b.card.due||a.card.id.localeCompare(b.card.id));
}
/** Phase counts describe cards that are due now, including unresolved legacy cards. */
export function flashcardSummary(state:State,now=Date.now()):{due:number;new:number;review:number;learning:number;total:number}{
 const current=readyState(state,now),queue=getFlashcardQueue(current,now);
 return {due:queue.length,new:queue.filter(item=>item.phase==='new').length,review:queue.filter(item=>item.phase==='review').length,learning:queue.filter(item=>item.phase==='learning').length,total:Object.keys(current.flashcards!.cards).length};
}
export function selectFlashcard(state:State,id:string):State{
 const current=readyState(state,Date.now()),store=current.flashcards!,card=store.cards[id];
 if(!card)throw Error('这张闪卡不存在，排程未更改。');
 if(store.session?.cardId===id&&store.session.revision===card.revision)return current;
 return finish(current,{...store,session:{cardId:id,revision:card.revision,revealed:false}});
}
export function revealFlashcard(state:State,token:FlashcardToken):State{
 const current=readyState(state,Date.now()),store=current.flashcards!,card=store.cards[token.cardId];
 if(!card||card.revision!==token.revision||store.session&& (store.session.cardId!==token.cardId||store.session.revision!==token.revision))return current;
 if(store.session?.revealed)return current;
 return finish(current,{...store,session:{...token,revealed:true}});
}
function schedulerCard(card:FlashcardCard,now:number):FsrsCard{
 if(card.fsrs)return {...card.fsrs,due:new Date(card.due),last_review:new Date(card.fsrs.last_review)};
 // Only a real first answer initializes memory; no box-to-repetition conversion.
 return {...createEmptyCard(new Date(now)),due:new Date(card.due)};
}
function assertClock(card:FlashcardCard,now:number,lastReview?:number){
 assertNow(now);if(now<Math.max(card.fsrs?.last_review??-Infinity,lastReview??-Infinity))throw Error('本机时钟早于上次复习时间，请校准时间后再评分；原排程未更改。');
}
export function previewFlashcard(card:FlashcardCard,now=Date.now()):{rating:FlashcardRating;due:number}[]{
 assertClock(card,now);const preview=scheduler.repeat(schedulerCard(card,now),new Date(now));
 return ratings.map(rating=>({rating,due:preview[grades[rating]].card.due.getTime()}));
}
function memory(card:FsrsCard):FlashcardFsrs{
 if(card.state===0||!card.last_review)throw Error('调度结果无效，原排程未更改。');
 return {stability:card.stability,difficulty:card.difficulty,elapsed_days:card.elapsed_days,scheduled_days:card.scheduled_days,learning_steps:card.learning_steps,reps:card.reps,lapses:card.lapses,state:card.state,last_review:card.last_review.getTime()};
}
function serializeLog(log:ReviewLog):FlashcardReview['log']{
 return {rating:log.rating as 1|2|3|4,state:log.state,due:log.due.getTime(),stability:log.stability,difficulty:log.difficulty,elapsed_days:log.elapsed_days,last_elapsed_days:log.last_elapsed_days,scheduled_days:log.scheduled_days,learning_steps:log.learning_steps,review:log.review.getTime()};
}
export function rateFlashcard(state:State,token:FlashcardToken,rating:FlashcardRating,now=Date.now()):State{
 if(!ratings.includes(rating))throw Error('评分只能是 Again、Hard、Good 或 Easy，原记录未更改。');
 assertNow(now);const current=readyState(state,now),store=current.flashcards!,card=store.cards[token.cardId];
 if(!card||card.revision!==token.revision||store.session?.cardId!==token.cardId||store.session.revision!==token.revision||!store.session.revealed)return current;
 assertClock(card,now,store.reviews[store.reviews.length-1]?.reviewedAt);
 if(store.notes[card.noteId].incomplete)throw Error('这个旧词卡还缺释义，请从本课补全后再复习。');
 if(card.due>now)return current;
 if(store.reviews.length>=MAX_REVIEWS)throw Error('已保存 50,000 次真实复习，请先保留完整备份；本次评分未写入。');
 const result=scheduler.next(schedulerCard(card,now),new Date(now),grades[rating]);
 const nextCard:FlashcardCard={...card,due:result.card.due.getTime(),revision:card.revision+1,fsrs:memory(result.card)};
 const date=new Date(now),localDate=`${String(date.getFullYear()).padStart(4,'0')}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
 const id=`r-${card.id}-${nextCard.revision}`;
 if(store.reviews.some(review=>review.id===id))throw Error('复习标识冲突，原记录未更改。');
 const review:FlashcardReview={id,cardId:card.id,rating,reviewedAt:now,dueBefore:card.due,dueAfter:nextCard.due,revisionBefore:card.revision,revisionAfter:nextCard.revision,localDate,timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC',utcOffsetMinutes:date.getTimezoneOffset(),log:serializeLog(result.log)};
 const prior={...store};delete prior.session;delete prior.undo;
 return finish(current,{...prior,cards:{...store.cards,[card.id]:nextCard},reviews:[...store.reviews,review],undo:{reviewId:review.id,cardBefore:card,sessionBefore:store.session}});
}
export function undoFlashcardReview(state:State):State{
 const current=readyState(state,Date.now()),store=current.flashcards!,undo=store.undo;
 if(!undo)return current;
 const last=store.reviews[store.reviews.length-1],card=store.cards[undo.cardBefore.id];
 if(!last||last.id!==undo.reviewId||last.cardId!==card?.id||card.revision!==last.revisionAfter)throw Error('最后一次评分已经变化，未撤销其它记录。');
 // Keep revision monotonic: an old click token cannot become valid after undo.
 const restored={...undo.cardBefore,revision:card.revision+1};
 const prior={...store};delete prior.undo;delete prior.session;
 return finish(current,{...prior,cards:{...store.cards,[restored.id]:restored},reviews:store.reviews.slice(0,-1),session:{cardId:restored.id,revision:restored.revision,revealed:undo.sessionBefore?.revealed??false}});
}
export function addReverseCard(state:State,id:string,now=Date.now()):State{
 assertNow(now);const current=readyState(state,now),store=current.flashcards!,note=store.notes[id];
 if(!note)throw Error('这个词条不存在，排程未更改。');
 if(note.incomplete)throw Error('请先补全旧词条的释义，再加入反向卡。');
 const next=ensureDirection(store,note,'production',now);return next===store?current:finish(current,next);
}

/**
 * Complete new backups are authoritative. An old backup replaces its classic
 * fields while preserving the live namespace and adding missing old content.
 */
export function prepareFlashcardRestore(current:State,incoming:State,reserveWords:Word[]=[],now=Date.now()):State{
 assertNow(now);assertState(incoming);assertState(current);
 if(incoming.flashcards!==undefined)return incoming;
 const legacy=migrateFlashcards(incoming,reserveWords,now);
 if(current.flashcards===undefined)return legacy;
 const live=current.flashcards,old=legacy.flashcards!;
 const liveWithoutUndo={...live};delete liveWithoutUndo.undo;
 const store:FlashcardStore={...liveWithoutUndo,notes:{...live.notes},cards:{...live.cards},reviews:[...live.reviews]};
 const noteIds=new Map<string,string>();
 for(const incomingNote of Object.values(old.notes)){
  const key=noteKey(incomingNote.word,incomingNote.meaning);
  const match=Object.values(store.notes).find(note=>noteKey(note.word,note.meaning)===key);
  const incomplete=!incomingNote.incomplete?Object.values(store.notes).find(note=>note.incomplete&&wordKey(note.word)===wordKey(incomingNote.word)):undefined;
  if(match&&incomplete&&match.id!==incomplete.id)throw Error('备份与现有同词的缺义卡需要核对，原内容与排程未被覆盖。');
  let merged:FlashcardNote;
  if(incomplete){const prior={...incomplete};delete prior.incomplete;merged=mergeNote({...prior,word:incomingNote.word,meaning:incomingNote.meaning},{...incomingNote,id:prior.id});}
  else if(match)merged=mergeNote(match,incomingNote);
  else{
   if(store.notes[incomingNote.id])throw Error('备份词条标识冲突，原记录未更改。');
   merged={...incomingNote,sources:mergeSources(incomingNote.sources),examples:mergeExamples(incomingNote.examples)};
  }
  store.notes[merged.id]=merged;noteIds.set(incomingNote.id,merged.id);
 }
 for(const incomingCard of Object.values(old.cards)){
  const mappedId=noteIds.get(incomingCard.noteId)!;
  if(Object.values(store.cards).some(card=>card.noteId===mappedId&&card.direction===incomingCard.direction))continue;
  if(store.cards[incomingCard.id])throw Error('备份闪卡标识冲突，原排程未更改。');
  store.cards[incomingCard.id]={...incomingCard,noteId:mappedId};
 }
 return finish(incoming,store);
}
