/** Pure curriculum metadata. It does not read, grade, migrate, or save learner state. */
export const skills = ['listening', 'reading', 'speaking', 'writing'] as const;
export type Skill = typeof skills[number];
export const variants = ['academic', 'general-training'] as const;
export type Variant = typeof variants[number];
export type VariantSelection = Variant | null;
export const learningStages = ['explain', 'model', 'guided', 'independent', 'timed', 'feedback', 'review'] as const;
export type LearningStage = typeof learningStages[number];
export type CoverageStatus = 'implemented' | 'partial' | 'missing';
export type RequirementKind = 'question-type' | 'task-format' | 'assessment-criterion' | 'test-rule' | 'teaching-tag';
export type SourceRef = { sourceId: string; locator: string; variants: readonly Variant[]; claim: 'format' | 'criterion' | 'rule' | 'teaching-context' };
export type OfficialSource = {
  id: string;
  title: string;
  url: string;
  publisher: 'IELTS' | 'British Council' | 'IDP';
  checkedAt: string;
  scope: string;
  verification: 'direct-open' | 'delegated-primary-research' | 'partial-fetch';
  publicationDate?: string;
  caveat?: string;
};
export type CodeEvidence = {
  id: string;
  path: string;
  symbol: string;
  anchor: string;
  scope: 'local-practice' | 'external-handoff' | 'foundation' | 'navigation';
  stages: readonly LearningStage[];
  variants: readonly Variant[];
  supports: readonly string[];
  limitation: string;
  artifactIds?: readonly string[];
  runtimeRefs?: readonly string[];
  rights: 'original-declared' | 'learner-provided-unverified' | 'link-only' | 'not-a-content-bank';
};
export type MaterialInventory = {
  /** IDs may overlap between rows/stages; never add these totals as unique content. */
  assetIds: readonly string[];
  unit: 'items' | 'prompts' | 'models' | 'explanations' | 'workflows';
  authoredCount: number;
  qaVerifiedCount: number | null;
  distinctSets: number | null;
  verifiedPerformanceAudioModels: number;
  note: string;
};
export type CoverageSlot = {
  status: CoverageStatus;
  plannedNodeId: string;
  activity: string;
  expectedEvidence: string;
  codeEvidenceIds: readonly string[];
  gap: string;
  materials: MaterialInventory;
  /** Local authoring recommendation, not an IELTS regulation or a mastery threshold. */
  plannedMinimum: number;
  variantCoverage: Partial<Record<Variant, { status: CoverageStatus; codeEvidenceIds: readonly string[]; gap: string; materials: MaterialInventory }>>;
};
export type Requirement = {
  id: string;
  skill: Skill;
  kind: RequirementKind;
  title: string;
  variants: readonly Variant[];
  family: string;
  /** Subforms are teaching coverage targets, never a promise of frequency in a test. */
  subforms: readonly string[];
  taxonomy: 'official-family-variant' | 'official-criterion' | 'official-format' | 'product-teaching-tag';
  prerequisiteConcepts: readonly string[];
  errorTags: readonly string[];
  explanation: string;
  diagnostic: string;
  sources: readonly SourceRef[];
  currentMapNodeIds: readonly string[];
  feedbackMode: 'answer-key' | 'human-text' | 'human-audio' | 'conditions-check';
  priority: 'P0' | 'P1';
  bandOrientation?: Readonly<Record<'4' | '5' | '6' | '7' | '8', string>>;
  stages: Record<LearningStage, CoverageSlot>;
};
export type Blueprint = {
  version: 1;
  auditedCommit: string;
  auditedAt: string;
  sources: readonly OfficialSource[];
  evidence: readonly CodeEvidence[];
  requirements: readonly Requirement[];
};
/** Future adapter contract only; this module has no storage key or persistence. */
export type PracticeEvidence = {
  requirementId: string;
  variant: Variant;
  stage: LearningStage;
  materialId: string;
  promptId: string;
  at: number;
  assistance: 'none' | 'hint' | 'model';
  response: { kind: 'answers' | 'text' | 'audio' | 'external-artifact'; reference: string };
  conditions?: { timed: boolean; unseen: boolean; delivery: 'computer' | 'computer-writing-on-paper' | 'legacy-paper'; market?: string; testDate?: string; bookingReference?: string };
  feedback?: { author: 'answer-key' | 'self' | 'teacher' | 'examiner'; reference: string; correction: string };
  previous?: { promptId: string; at: number };
  outcome: 'unreviewed' | 'needs-repair' | 'target-observed';
  materialContextPresent: boolean;
  audioUsable?: boolean;
  promptVisualPresent?: boolean;
};
