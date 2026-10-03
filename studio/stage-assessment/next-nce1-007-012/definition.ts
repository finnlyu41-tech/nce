import {parseWorkspaceNote,hasCurrentWorkspace} from './workspace-notes';
export const nextStageDefinition={
 scope:'NCE1-7-12',draftKey:'stage-assessment-v1:NCE1-7-12',target:'stage-nce1-7-12',
 protocol:'candidate-v1-2026-10-02',packVersion:'nce1-007-012-v1-2026-10-03',
 label:'第7–12课',firstLesson:7,lessons:[7,8,9,10,11,12],loopLessons:[7,9,11],
 title:'问清职业与状态，再交还物品',
 targets:['核实当前职业','第一人称职业介绍','职业肯否短答','询问当前状态','按事实回答状态','询问物主','姓名所有格','说明已确认颜色'],
 validateLearningNote:(note:string)=>{parseWorkspaceNote(note);},
 hasCurrentDraft:hasCurrentWorkspace,
} as const;
