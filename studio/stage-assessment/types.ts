export const skills = ['listening','reading','speaking','writing'] as const;
export type Skill = typeof skills[number];
export const phases = ['T0','T1','T2','T3','repair'] as const;
export type Phase = typeof phases[number];
export type Pack = 'A'|'B'|'C'|'D'|'E'|'F';
export const minutes: Record<Skill,number> = {listening:3,reading:4,speaking:4,writing:7};
export const labels: Record<Skill,string> = {listening:'听力',reading:'阅读',speaking:'口语',writing:'写作'};
export const phaseLabels: Record<Phase,string> = {T0:'学习前基线',T1:'学后未见题',T2:'至少24小时复验',T3:'至少7天迁移',repair:'修补后新题'};
export const targets = ['问归属','肯定短答','请求重说','my/your视角','否定归属','否定短答','介绍在场者','he/she指代','be+国籍'] as const;
export type Help = 'neutral-repeat'|'english-prompt'|'reference'|'answer-seen'|'translator';
export type Delivery = {mode:'live-reader'|'human-checked-audio';heard:boolean;singlePresentation:boolean;humanChecked:boolean;note:string};
export type Reviewer = {role:'teacher'|'calibrated-reviewer';qualified:true;calibrated:true;external:true;basis:string};
export type Review = {reviewer:Reviewer;judgments?:('correct'|'wrong'|'unfinished')[];criticalReversed?:boolean;dimensions?:number[];purposes?:boolean[];actualHeard?:boolean;targetElicited:boolean;disputed:boolean;secondReview:boolean;basis:string};
export type Attempt = {id:string;skill:Skill;phase:Phase;pack:Pack;openedAt:number;openOrder:number;deadline:number;unseen:boolean;answers:string[];help:Help[];observedInterval?:{known:boolean;anchor:number;dueAt:number;hours:number;ready:boolean};delivery?:Delivery;submittedAt?:number;submittedOrder?:number;first?:string[];revisions:{at:number;answers:string[];note:string}[];interruption?:string;reviews:{at:number;value:Review}[]};
export type Learning = {at:number;order:number;skills:Skill[];kind:'complete'|'practice'|'repair'|'interval-start'|'unknown';note:string};
export type StageScope='NCE1-1-6'|'NCE1-7-12';
export type RecordState = {version:1;scope:StageScope;protocol:string;courseVersion:string;packVersion:string;priorLearning:boolean;events:Event[]};
export type View = {sequence:number;priorLearning:boolean;attempts:Attempt[];learning:Learning[];exposed:Pack[];restorations:{at:number;order:number}[]};
export type Command =
 | {type:'restore'}
 | {type:'prior-learning'}
 | {type:'learning';skills:Skill[];kind:Learning['kind'];note:string}
 | {type:'expose';pack:Pack}
 | {type:'open';skill:Skill;phase:Phase;unseen:boolean}
 | {type:'draft';id:string;answers:string[]}
 | {type:'help';id:string;help:Help}
 | {type:'delivery';id:string;delivery:Delivery}
 | {type:'submit';id:string}
 | {type:'interrupt';id:string;reason:string}
 | {type:'revise';id:string;answers:string[];note:string}
 | {type:'review';id:string;review:Review};
export type Event = {id:string;at:number;command:Command};
export type ReadStage={status:"empty"}|{status:"ready";record:RecordState;view:View}|{status:"blocked";reason:string};
export type Result = {status:'pending'|'invalid'|'insufficient'|'failed'|'provisional'|'candidate';reason:string;score?:number;max?:number;dimensions?:number[]};
