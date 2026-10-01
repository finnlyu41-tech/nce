/** The optional, independently versioned flashcard namespace in the classic State. */
export type FlashcardSource =
  | {kind:'nce';book:'NCE1'|'NCE2'|'NCE3'|'NCE4';lesson:number}
  | {kind:'ielts';topic:string;use:'speaking'|'writing'|'reading'|'listening'}
  | {kind:'personal'}
  | {kind:'reserve';lesson?:number};

export type FlashcardRating = 'again'|'hard'|'good'|'easy';
export type FlashcardDirection = 'recognition'|'production';
export type FlashcardNote = {
  id:string;
  word:string;
  meaning:string;
  ipa?:string;
  examples:{en:string;zh?:string}[];
  sources:FlashcardSource[];
  /** A legacy word whose definition was unavailable; it cannot be rated. */
  incomplete?:true;
  /** Reserved for local content imports; these are not scheduling identifiers. */
  importGuids?:string[];
};

/** ts-fsrs Card memory state after a real review; due lives on FlashcardCard. */
export type FlashcardFsrs = {
  stability:number;
  difficulty:number;
  elapsed_days:number;
  scheduled_days:number;
  learning_steps:number;
  reps:number;
  lapses:number;
  state:1|2|3;
  last_review:number;
};

export type FlashcardCard = {
  id:string;
  noteId:string;
  direction:FlashcardDirection;
  due:number;
  revision:number;
  legacy?:{key:string;box:number;due:number};
  fsrs?:FlashcardFsrs;
};

export type FlashcardSession = {cardId:string;revision:number;revealed:boolean};
export type FlashcardReview = {
  id:string;
  cardId:string;
  rating:FlashcardRating;
  reviewedAt:number;
  dueBefore:number;
  dueAfter:number;
  revisionBefore:number;
  revisionAfter:number;
  localDate:string;
  timeZone:string;
  /** Date.getTimezoneOffset(): UTC minus local time, in minutes. */
  utcOffsetMinutes:number;
  /** The genuine ts-fsrs log, with Dates serialized as absolute milliseconds. */
  log:{rating:1|2|3|4;state:0|1|2|3;due:number;stability:number;difficulty:number;elapsed_days:number;last_elapsed_days:number;scheduled_days:number;learning_steps:number;review:number};
};

export type FlashcardStore = {
  version:1;
  scheduler:'ts-fsrs@5.4.2/v1';
  notes:Record<string,FlashcardNote>;
  cards:Record<string,FlashcardCard>;
  reviews:FlashcardReview[];
  session?:FlashcardSession;
  undo?:{reviewId:string;cardBefore:FlashcardCard;sessionBefore?:FlashcardSession};
};

export type FlashcardQueueEntry = {card:FlashcardCard;note:FlashcardNote;phase:'new'|'review'|'learning'};
export type FlashcardToken = {cardId:string;revision:number};
