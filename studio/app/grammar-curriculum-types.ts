import type {NceBookId} from './model';

export type GrammarStageId='foundation'|'time'|'meaning'|'extension';
export type GrammarPracticeKind='recognise'|'repair'|'produce';
export type GrammarPractice={
 id:string;kind:GrammarPracticeKind;variant:0|1;prompt:string;options?:string[];
 answer:string;accepted?:string[];explanation:string;hints:[string,string];
};
export type GrammarUnit={
 id:string;title:string;stageId:GrammarStageId;order:number;prerequisites:string[];
 goal:string;guideIds:string[];purposeIds:string[];
 explanation:string[];
 forms:{form:string;meaning:string;useWhen:string}[];
 contrasts:{label:string;a:{en:string;zh:string};b:{en:string;zh:string};why:string}[];
 mistakes:{wrong:string;correct:string;why:string}[];
 practices:GrammarPractice[];
 transfer:{prompt:string;criteria:string[]};
};
export type GrammarStage={id:GrammarStageId;title:string;description:string;guideIds:string[]};
export type GrammarPurpose={id:string;title:string;context:string;ieltsUse:string};
export type GrammarLessonLink={book:NceBookId;lesson:number;lastLesson:number;guideIds:string[]};
