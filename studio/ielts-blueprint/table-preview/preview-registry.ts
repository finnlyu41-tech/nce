import type {SampleLesson} from '../sample-sequence';
import type {Variant} from '../types';
import {registeredCurriculumLessonsFor as productionLessonsFor} from '../curriculum/registered';
import {academicTableCompletionLesson} from '../curriculum/table-completion/reading-academic';

export * from '../curriculum/registered';

/** This registry is resolved only for sample-sequence.ts in the standalone preview. */
export function registeredCurriculumLessonsFor(variant: Variant): SampleLesson[] {
  const current = productionLessonsFor(variant);
  if (variant === 'general-training') return current;
  const byId = new Map(current.map(lesson => [lesson.id, lesson]));
  byId.set(academicTableCompletionLesson.id, academicTableCompletionLesson);
  return [...byId.values()];
}
