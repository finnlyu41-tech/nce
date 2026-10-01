import type {Variant} from '../../types';

/** Native authoring data. Each task requires a complete set, never one choice from a list. */
export type MultiSelectOption = {
  id: string;
  text: string;
  judgment: 'supported' | 'contradicted' | 'not-stated' | 'different-target';
  /** Exact original stimulus excerpts; missing information may have no quote. */
  quotes: string[];
  reason: string;
};
export type MultiSelectTask = {
  id: string;
  prompt: string;
  /** This authored batch covers two/three choices, not every possible exam instruction. */
  selectionCount: 2 | 3;
  options: MultiSelectOption[];
  correctOptionIds: string[];
};
export type MultiSelectMaterial = {
  id: string;
  title: string;
  stimulus: string;
  task: MultiSelectTask;
  hint: string;
  checklist: string[];
  seconds: number;
  modelNotes?: string[];
};
export type MultiSelectLesson = {
  id: string;
  skill: 'listening' | 'reading';
  title: string;
  goal: string;
  explanation: string[];
  boundary: string;
  variants: Variant[];
  model: MultiSelectMaterial;
  guided: MultiSelectMaterial;
  independent: MultiSelectMaterial;
  timed: MultiSelectMaterial;
  reviews: MultiSelectMaterial[];
};
