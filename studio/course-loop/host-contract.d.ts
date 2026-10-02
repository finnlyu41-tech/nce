/** Proposed interface only. Release owner chooses and implements shared wiring. */
export type CourseId = 'nce1-1' | 'nce1-3' | 'nce1-5' | 'nce1-7' | 'nce1-9' | 'nce1-11' | 'nce1-13' | 'nce1-15' | 'nce1-17' | 'nce1-19' | 'nce1-21' | 'nce1-23' | 'nce1-25' | 'nce1-27' | 'nce1-29' | 'nce1-31' | 'nce1-33' | 'nce1-35' | 'nce1-37' | 'nce1-39' | 'nce1-41' | 'nce1-43' | 'nce1-45' | 'nce1-47' | 'nce1-49' | 'nce1-51' | 'nce1-53' | 'nce1-55' | 'nce1-57' | 'nce1-59' | 'nce1-61' | 'nce1-63' | 'nce1-65' | 'nce1-67' | 'nce1-69' | 'nce1-71' | 'nce1-73' | 'nce1-75' | 'nce1-77' | 'nce1-79' | 'nce1-81' | 'nce1-83';
export type SourceKind = 'text' | 'audio' | 'comic';
export type Action =
 | {type:'draft'|'own-draft';value:string}
 | {type:'source';source:SourceKind}
 | {type:'correct';id:string;answer:string;note:string}
 | {type:'help'|'not-yet'|'submit'|'retry'|'next'|'finish'|'review'};
export type Snapshot = {
 kind:'nce-course-loop-proposal'; version:1; lessonId:CourseId; contentVersion:1;
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
 showSource(input:{kind:SourceKind;book:'NCE1';lesson:1|3|5|7|9|11|13|15|17|19|21|23|25|27|29|31|33|35|37|39|41|43|45|47|49|51|53|55|57|59|61|63|65|67|69|71|73|75|77|79|81|83;comicKey:'NCE1-1'|'NCE1-3'|'NCE1-5'|'NCE1-7'|'NCE1-9'|'NCE1-11'|'NCE1-13'|'NCE1-15'|'NCE1-17'|'NCE1-19'|'NCE1-21'|'NCE1-23'|'NCE1-25'|'NCE1-27'|'NCE1-29'|'NCE1-31'|'NCE1-33'|'NCE1-35'|'NCE1-37'|'NCE1-39'|'NCE1-41'|'NCE1-43'|'NCE1-45'|'NCE1-47'|'NCE1-49'|'NCE1-51'|'NCE1-53'|'NCE1-55'|'NCE1-57'|'NCE1-59'|'NCE1-61'|'NCE1-63'|'NCE1-65'|'NCE1-67'|'NCE1-69'|'NCE1-71'|'NCE1-73'|'NCE1-75'|'NCE1-77'|'NCE1-79'|'NCE1-81'|'NCE1-83';clip?:{start:number;end:number}}):Promise<{opened:boolean;error?:string}>;
 /** Uses host's one route selector. A click does not grant map completion. */
 continueRoute():void;
}
