import {targets,type StageScope,type ReadStage} from './types';
import {nextStageDefinition} from './next-nce1-007-012/definition';
export type StageDefinition={scope:StageScope;draftKey:string;target:string;protocol:string;packVersion:string;label:string;firstLesson:number;lessons:readonly number[];loopLessons:readonly number[];title:string;targets:readonly string[];validateLearningNote?:(note:string)=>void;hasCurrentDraft?:(read:ReadStage)=>boolean};
export const firstStageDefinition:StageDefinition={scope:'NCE1-1-6',draftKey:'stage-assessment-v1:NCE1-1-6',target:'stage-nce1-1-6',protocol:'candidate-v1-2026-10-02',packVersion:'candidate-v1-2026-10-02',label:'第1–6课',firstLesson:1,lessons:[1,2,3,4,5,6],loopLessons:[1,3,5],title:'换个情境，再试一次',targets};
export const stageDefinitions:readonly StageDefinition[]=[firstStageDefinition,nextStageDefinition];
export function stageDefinition(target:string){return stageDefinitions.find(s=>s.target===target);}
