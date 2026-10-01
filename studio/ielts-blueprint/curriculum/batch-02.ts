import type {SampleLesson} from '../sample-sequence';
import type {OfficialSource, Variant} from '../types';
import type {CurriculumBinding} from './types';
import type {MultiSelectLesson} from './multi-select/types';
import {listeningMultiSelectLesson} from './multi-select/listening';
import {academicMultiSelectLesson} from './multi-select/reading-academic';
import {generalMultiSelectLesson} from './multi-select/reading-general';
import {projectMultiSelectLesson} from './multi-select/projection';

/** Structured native content remains available for the owner to build genuine multi-select controls. */
export function batch02NativeLessonsFor(variant: Variant): MultiSelectLesson[] {
  if (variant !== 'academic' && variant !== 'general-training') throw new RangeError('Choose Academic or General Training before requesting course materials.');
  return [listeningMultiSelectLesson, variant === 'academic' ? academicMultiSelectLesson : generalMultiSelectLesson];
}

/** Complete-set text exercises compatible with SampleLesson; no implicit catalog registration. */
export const batch02LessonsFor = (variant: Variant): SampleLesson[] => batch02NativeLessonsFor(variant).map(projectMultiSelectLesson);

export const batch02ResponseContract = {
  mode: 'complete-letter-set-text', selectionCounts: [2, 3], separator: 'space', order: 'any-local-order',
  checkUnit: 'complete-selection-group', rawAnswer: 'preserved-string',
  singleSelectOptions: 'omitted', nativeCheckboxes: 'not-implemented', officialPerAnswerScoring: 'not-implemented',
  malformedAnswer: 'retained-and-mismatched-not-preflight-rejected',
} as const;

export const batch02AdditionalSources: readonly OfficialSource[] = [
  {
    id: 'reading-general-multi-idp', title: 'IDP: Question types in the General Training Reading test',
    url: 'https://ielts.idp.com/bangladesh/prepare/article-question-types-general-training-reading',
    publisher: 'IDP', checkedAt: '2026-10-01', verification: 'partial-fetch',
    scope: 'Multiple choice section includes more than one answer; official indexed examples include two choices from five and three from seven.',
    caveat: 'Current primary search extract verified; direct page fetch blocked. The global same-title page is also indexed. Examples are not universal option counts; this original batch uses two/five and three/six. No claim of a GT-specific order answer key.',
  },
  {
    id: 'reading-multi-sample-order', title: 'IELTS: Academic Reading sample multiple-answer task and answer key',
    url: 'https://ielts.org/cdn/Sample-tests/ielts-academic-reading-sample-tasks-2023.pdf',
    publisher: 'IELTS', checkedAt: '2026-10-01', verification: 'direct-open',
    scope: 'Printed pages 25–26: choose-two groups have separate numbered answer positions and keys accepting either order.',
    caveat: 'Only response/numbering rules referenced; passage, questions and option text are not copied. This is an Academic example, not a GT-specific order rule.',
  },
  {
    id: 'listening-multi-sample-order', title: 'IELTS: Computer Listening multiple-answer sample answer key',
    url: 'https://ielts.org/cdn/computer-delivered-sample-tests-listening/ielts-listening-computer-delivered-multiple-choice-more-than-one-answer-answer-key.pdf',
    publisher: 'IELTS', checkedAt: '2026-10-01', verification: 'direct-open',
    scope: 'Page 1: three numbered answer positions accepted in any order.',
    caveat: 'The key uses answer wording. Used only as an order/answer-position example, not copied as a question bank or a complete scoring algorithm.',
  },
];

const stageBindings = (lesson: SampleLesson): CurriculumBinding['stages'] => ({
  explain: {materialIds: [], activity: '确认选择数量和题干范围，为所有选项分别找依据。', expectedEvidence: 'lesson.explanation 明确选择完整集合与本站文本输入/整组核对边界；不计掌握。'},
  model: {materialIds: [lesson.model.id], activity: '看完整选项、逐项教练步骤和原材料依据。', expectedEvidence: '示范question.why包含modelNotes及每个选项的来源/排除理由，不只显示正确字母。'},
  guided: {materialIds: [lesson.guided.id], activity: '用中性方法提示提交完整所选字母组，答后订正。', expectedEvidence: '原始scalar答案完整保留；少选/多选/重复均可留下为错误首答，订正不覆盖。'},
  independent: {materialIds: [lesson.independent.id], activity: '换情境，撤掉依据和参考答案，核对每个选项。', expectedEvidence: 'independent原答、曝光/fresh/hinted及听力请求/失败/可听确认。'},
  timed: {materialIds: [lesson.timed.id], activity: '开始本站训练计时后处理另一份完整多选组。', expectedEvidence: 'startedAt/elapsedMs/withinTrainingTime和原答；每组180秒是本地建议。'},
  feedback: {materialIds: [lesson.independent.id, lesson.timed.id], activity: '对照全组首答与逐项依据，记录限时组订正和具体问题。', expectedEvidence: '现有attempts、correctionAnswers/correctionNote/correctedAt；correct/total按组，非官方答案槽分。'},
  review: {materialIds: lesson.reviews.map(material => material.id), activity: '沿现有24小时条件依次换两组未曝光材料。', expectedEvidence: '新刺激与原答/曝光/提示/播放条件；帮助和重复不算独立保持，模拟时间不证明学习效果。'},
});
const binding = (lesson: SampleLesson, details: Pick<CurriculumBinding, 'id' | 'variants' | 'requirementIds' | 'sourceIds' | 'sourceLocator' | 'content' | 'coverageBoundary'>): CurriculumBinding => ({
  ...details, lessonId: lesson.id, stages: stageBindings(lesson), rights: 'original-fictional',
  delivery: lesson.skill === 'listening' ? 'device-tts' : 'text', contentStatus: 'authored-not-expert-reviewed', integrationStatus: 'pending-owner-integration',
});

export const batch02Coverage: readonly CurriculumBinding[] = [
  binding(projectMultiSelectLesson(listeningMultiSelectLesson), {
    id: 'batch-02-L02', variants: ['academic', 'general-training'], requirementIds: ['L02'],
    sourceIds: ['listening-format', 'listening-multi-sample-order', 'scoring'],
    sourceLocator: 'IELTS Listening question type 1: choose the number required by the question; sample key demonstrates unordered multiple answers and distinct answer positions.',
    content: {path: 'ielts-blueprint/curriculum/multi-select/listening.ts', symbol: 'listeningMultiSelectLesson'},
    coverageBoundary: '六段原创短录音文本、六个完整多选组，练数量/角色/时态/条件与每项证据。TTS声音尚未人工核验；字母组文本及每组0/1是本站适配，不是原生多选控件、官方逐题分或全听力。',
  }),
  binding(projectMultiSelectLesson(academicMultiSelectLesson), {
    id: 'batch-02-R02-A', variants: ['academic'], requirementIds: ['R02-A'],
    sourceIds: ['reading-academic', 'reading-multi-sample-order', 'scoring'],
    sourceLocator: 'IELTS Academic Reading question type 1: multiple answers require the stated count; sample pages 25–26 demonstrate numbered answer positions/either-order keys.',
    content: {path: 'ielts-blueprint/curriculum/multi-select/reading-academic.ts', symbol: 'academicMultiSelectLesson'},
    coverageBoundary: '六篇原创一般兴趣短文、六组多选；不模拟正式长文/40题或校准难度。整组核对不模拟逐答案分，所有排列仅实现完整集合匹配。',
  }),
  binding(projectMultiSelectLesson(generalMultiSelectLesson), {
    id: 'batch-02-R02-GT', variants: ['general-training'], requirementIds: ['R02-GT'],
    sourceIds: ['reading-general-multi-idp', 'reading-general', 'scoring'],
    sourceLocator: 'IDP explicitly identifies GT Reading multiple-answer questions in current primary search extract; GT-format source supplies day-to-day/work contexts. Any-order input is this original batch rule.',
    content: {path: 'ielts-blueprint/curriculum/multi-select/reading-general.ts', symbol: 'generalMultiSelectLesson'},
    coverageBoundary: '六篇原创工作/日常短文、六组完整多选，与Academic素材隔离。GT多选IDP正文未完整取得，未获得GT独立顺序答案表；本批任意顺序/整组核对为产品规则，非官方部分得分算法。',
  }),
];

export type {MultiSelectLesson, MultiSelectMaterial, MultiSelectOption, MultiSelectTask} from './multi-select/types';
