import type {Variant} from '../types';
import {tableCompletionLessonsFor,tableCompletionCoverage,tableCompletionSources} from './table-completion';
import {batch01LessonsFor,batch01Coverage,batch01AdditionalSources} from './batch-01';
import {batch02LessonsFor,batch02Coverage,batch02AdditionalSources} from './batch-02';
import {batch03LessonsFor,batch03Coverage,batch03AdditionalSources} from './batch-03';
import {batch04LessonsFor,batch04Coverage,batch04AdditionalSources} from './batch-04';
import {batch05LessonsFor,batch05Coverage,batch05AdditionalSources} from './batch-05';

/** Explicit production registration. Authoring coverage remains provenance,
 * never completion evidence and never a source for learner state. */
export const registeredCurriculumBatches=[
 {id:'batch-01',lessonsFor:batch01LessonsFor,bindings:batch01Coverage,sources:batch01AdditionalSources},
 {id:'batch-02',lessonsFor:batch02LessonsFor,bindings:batch02Coverage,sources:batch02AdditionalSources},
 {id:'batch-03',lessonsFor:batch03LessonsFor,bindings:batch03Coverage,sources:batch03AdditionalSources},
 {id:'batch-04',lessonsFor:batch04LessonsFor,bindings:batch04Coverage,sources:batch04AdditionalSources},
 {id:'batch-05',lessonsFor:batch05LessonsFor,bindings:batch05Coverage,sources:batch05AdditionalSources},
 {id:'table-completion',lessonsFor:tableCompletionLessonsFor,bindings:tableCompletionCoverage,sources:tableCompletionSources},
] as const;
export const registeredCurriculumSources=registeredCurriculumBatches.flatMap(batch=>[...batch.sources]);
export const registeredCurriculumBindings=registeredCurriculumBatches.flatMap(batch=>[...batch.bindings]);
export function registeredCurriculumLessonsFor(variant:Variant){
 if(variant!=='academic'&&variant!=='general-training')throw new RangeError('Choose an exam category before requesting course materials.');
 const lessons=registeredCurriculumBatches.flatMap(batch=>batch.lessonsFor(variant));
 if(new Set(lessons.map(lesson=>lesson.id)).size!==lessons.length)throw Error('Duplicate registered lesson ID');
 return lessons;
}
