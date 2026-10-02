/** Proposed interface only. Release owner chooses and implements shared wiring. */
export type SourceKind = 'text' | 'audio' | 'comic';
export type Action =
 | {type:'draft'|'own-draft';value:string}
 | {type:'source';source:SourceKind}
 | {type:'correct';id:string;answer:string;note:string}
 | {type:'help'|'not-yet'|'submit'|'retry'|'next'|'finish'|'review'};
export type Snapshot = {
 kind:'nce-course-loop-proposal'; version:1; lessonId:'nce1-1'; contentVersion:1;
 createdAt:number; events:Array<Action & {at:number}>;
};
export type HostReceipt =
 | {ok:true;confirmedRaw:string}
 | {ok:false;reason:'conflict'|'unavailable'|'invalid'|'unconfirmed';message:string};
export interface CourseLoopHost {
 /** Existing State.drafts only; proposed key nce-course-loop-v1:NCE1-1.
  * Read/validate/replay before any update. Unsupported raw remains recoverable. */
 read(): {raw:string|null;revision:string};
 /** Owner supplies the existing serialized writer. Re-read inside its lock,
  * compare expected raw/revision, write, and read back before returning ok.
  * On failure keep current input, phase and original raw available for retry.
  * Never mirror dueAt into map records, FSRS or yesterday's adapter. */
 commit(input:{expectedRaw:string|null;expectedRevision:string;nextRaw:string}):Promise<HostReceipt>;
 /** Must record source access before showing source while a question is active.
  * These are learning actions, never question audio-proof or test completion. */
 showSource(input:{kind:SourceKind;book:'NCE1';lesson:1;comicKey:'NCE1-1';clip?:{start:number;end:number}}):Promise<{opened:boolean;error?:string}>;
 /** Uses host's one route selector. A click does not grant map completion. */
 continueRoute():void;
}
