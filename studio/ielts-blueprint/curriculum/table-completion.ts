import type {CurriculumBinding} from './types';
import type {OfficialSource, Variant} from '../types';
import type {SampleLesson} from '../sample-sequence';
import type {TableStimulus} from '../structured-table/types';
import {academicTableCompletionLesson} from './table-completion/reading-academic';
import {academicTableStimuli} from './table-completion/stimuli';

/** One finite Academic source-word chain; no inferred category or GT substitution. */
export function tableCompletionLessonsFor(variant: Variant): SampleLesson[] {
  if (variant !== 'academic' && variant !== 'general-training') throw new RangeError('Choose Academic or General Training before requesting materials.');
  return variant === 'academic' ? [academicTableCompletionLesson] : [];
}
export function tableCompletionStimulusFor(materialId: string): TableStimulus | undefined {
  return academicTableStimuli.find(stimulus => stimulus.id === materialId);
}
export const tableCompletionResponseContract = {
  requirement: 'R12-A', responseMode: 'source-word-entry', stimulus: 'semantic-row-and-column-table',
  policy: 'NO MORE THAN TWO WORDS from the text for each answer',
  rawAnswer: 'preserved-string', checkUnit: 'individual-original-cell', band: null,
  dataVersion: 1, storeSchemaChange: false, recording: 'not-applicable-reading',
  contentStatus: 'authored-not-expert-reviewed', integrationStatus: 'pending-owner-integration',
} as const;
export const tableCompletionSources: readonly OfficialSource[] = [{
  id: 'reading-table-academic-original', title: 'IELTS Academic Reading: summary/note/table/flow chart completion',
  url: 'https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-reading',
  publisher: 'IELTS', checkedAt: '2026-10-02', verification: 'direct-open',
  scope: 'Type 9 includes a table with incomplete cells. The source-word variant takes words from the text under the printed word limit; answers need not follow text order and usually concern one part of the text.',
  caveat: 'Six original three-row mini tables and a two-word-only limit are local authoring choices. This chain does not cover the word-list variant, GT, Listening, a whole paper or calibrated difficulty. No official question or passage copied.',
}];
const lesson = academicTableCompletionLesson;
export const tableCompletionCoverage: readonly CurriculumBinding[] = [{
  id: 'table-completion-R12-A', lessonId: lesson.id, variants: ['academic'], requirementIds: ['R12-A'],
  sourceIds: ['reading-academic', 'reading-table-academic-original'],
  sourceLocator: 'Academic Reading question type 9, table form, first variation: select words from the source text to complete empty cells under the printed word limit.',
  content: {path: 'ielts-blueprint/curriculum/table-completion/reading-academic.ts', symbol: 'academicTableCompletionLesson'},
  rights: 'original-fictional', delivery: 'text', contentStatus: 'authored-not-expert-reviewed', integrationStatus: 'pending-owner-integration',
  stages: {
    explain: {materialIds: [], activity: '先读行标题、列标题和空格要求，分清比较对象与信息类别。', expectedEvidence: 'lesson.explanation；知道来源词/两词限制，阅读说明不计掌握。'},
    model: {materialIds: [lesson.model.id], activity: '在真实表格中示范按行和列取来源短语，再解释词数与关系。', expectedEvidence: '表格坐标、教练步骤和精确来源依据；示范不是学员首答。'},
    guided: {materialIds: [lesson.guided.id], activity: '带方法填写另一篇文章的三格。', expectedEvidence: '原始逐格答案和辅助条件；不将引导题计作独立保持。'},
    independent: {materialIds: [lesson.independent.id], activity: '未曝光新表格先独立作答。', expectedEvidence: 'qid/行列坐标、raw/fresh/hinted与原文；没有音频标记。'},
    timed: {materialIds: [lesson.timed.id], activity: '主动开始本站预算后显示新表格并填写。', expectedEvidence: 'startedAt、elapsedMs、withinTrainingTime；超时原答照存，180秒不代表正式单题时限。'},
    feedback: {materialIds: [lesson.independent.id, lesson.timed.id], activity: '保留原答表格，按证据分别订正限时答案。', expectedEvidence: '原始attempts和独立correctionAnswers/correctionNote，不把订正覆盖为首答。'},
    review: {materialIds: lesson.reviews.map(material => material.id), activity: '沿既有间隔依次用两篇未曝光的原创表格复验。', expectedEvidence: '到期、fresh/hinted、原始表格答案；模拟时钟不证明实际24小时保持。'},
  },
  coverageBoundary: '一条来源词表格链，六篇原创短文、18个空格含示范与引导。真实表格组件与独立预览有有限源码/浏览器回执，正式宿主接线待publisher审阅，不覆盖GT/L/词库版/正式长文及评分，也不换算Band。',
}];
