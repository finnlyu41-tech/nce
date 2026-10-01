import type {LearningStage, Variant} from '../types';

/** Content provenance only. No learner state, score, storage key or scheduler. */
export type CurriculumStageBinding = {
  materialIds: readonly string[];
  activity: string;
  expectedEvidence: string;
};
export type CurriculumBinding = {
  id: string;
  lessonId: string;
  variants: readonly Variant[];
  requirementIds: readonly string[];
  sourceIds: readonly string[];
  sourceLocator: string;
  content: {path: string; symbol: string};
  stages: Record<LearningStage, CurriculumStageBinding>;
  rights: 'original-fictional';
  delivery: 'device-tts' | 'text';
  contentStatus: 'authored-not-expert-reviewed';
  integrationStatus: 'pending-owner-integration';
  coverageBoundary: string;
};
