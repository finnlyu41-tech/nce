import type {SampleLesson} from '../sample-sequence';
import type {OfficialSource, Variant} from '../types';
import type {CurriculumBinding} from './types';
import {listeningFormLesson} from './listening-form';
import {readingViewsLessonFor} from './reading-views';

/** The shared catalog owner registers these. Importing this file does not register a course. */
export function batch01LessonsFor(variant: Variant): SampleLesson[] {
  if (variant !== 'academic' && variant !== 'general-training') throw new RangeError('Choose Academic or General Training before requesting course materials.');
  return [listeningFormLesson, readingViewsLessonFor(variant)];
}

/** A newly read primary reference. Shared sources.ts remains owned by the integration line. */
export const batch01AdditionalSources: readonly OfficialSource[] = [{
  id: 'reading-judgments-bc', title: 'British Council: T/F/NG (and Y/N/NG) teaching guide',
  url: 'https://takeielts.britishcouncil.org/sites/default/files/2026-06/reading_tfng_.pdf',
  publisher: 'British Council', checkedAt: '2026-10-01', verification: 'direct-open',
  scope: 'Page 2: distinction between information and writer views, explicit opposition versus absent evidence, no outside knowledge, evidence in text order.',
  caveat: 'The URL directory is not treated as a confirmed publication date. Only rules are paraphrased; the supplied practice passage and questions are not copied.',
}];

function stages(lesson: SampleLesson): CurriculumBinding['stages'] {
  return {
    explain: {materialIds: [], activity: '读本课方法、题型命令与易错点。', expectedEvidence: 'lesson.explanation 与明确题型目标；阅读解释不作测评。'},
    model: {materialIds: [lesson.model.id], activity: '对照示范题、原材料与逐题依据。', expectedEvidence: 'model 的英文题干、原材料、accepted 与 why；不是学习者答题证据。'},
    guided: {materialIds: [lesson.guided.id], activity: '带着方法提示留下自己的答案，再根据逐题依据订正。', expectedEvidence: '现有 guided 原始 attempts、方法提示及答后依据；引导作答不计独立迁移。'},
    independent: {materialIds: [lesson.independent.id], activity: '换不同情境，不看答案作答；提示与曝光条件保留。', expectedEvidence: '现有 independent 原答、fresh/hinted 与听力播放记录。'},
    timed: {materialIds: [lesson.timed.id], activity: '主动开始本站训练计时后处理另一份材料。', expectedEvidence: '现有 timed 首答、startedAt/elapsedMs/withinTrainingTime；时长是局部训练建议。'},
    feedback: {materialIds: [lesson.independent.id, lesson.timed.id], activity: '对照独立/限时原答与逐题 why，再保存限时答案和具体订正。', expectedEvidence: '现有 attempts 的原答与 why、correctionAnswers/correctionNote/correctedAt；不推断错因或 Band。'},
    review: {materialIds: lesson.reviews.map(material => material.id), activity: '沿用现有间隔，依次换两份未曝光的新材料复验。', expectedEvidence: '现有 review 原答、曝光/提示/播放条件与到期时间；模拟时间测试不证明真实保持。'},
  };
}

const both: readonly Variant[] = ['academic', 'general-training'];
const binding = (lesson: SampleLesson, details: Pick<CurriculumBinding, 'id' | 'variants' | 'requirementIds' | 'sourceIds' | 'sourceLocator' | 'content' | 'coverageBoundary'>): CurriculumBinding => ({
  ...details, lessonId: lesson.id, stages: stages(lesson), rights: 'original-fictional',
  delivery: lesson.skill === 'listening' ? 'device-tts' : 'text',
  contentStatus: 'authored-not-expert-reviewed', integrationStatus: 'pending-owner-integration',
});

/** Seven-stage content bindings; these do not promote the older blueprint or live map to complete. */
export const batch01Coverage: readonly CurriculumBinding[] = [
  binding(listeningFormLesson, {
    id: 'batch-01-L07', variants: both, requirementIds: ['L07'], sourceIds: ['listening-format'],
    sourceLocator: 'Form/note/table/flow chart/summary completion: form fields, words from the recording, question-specific word/number limits.',
    content: {path: 'ielts-blueprint/curriculum/listening-form.ts', symbol: 'listeningFormLesson'},
    coverageBoundary: '姓名拼读、最终确认、字段与单位/输入限制的表单微目标；六份4题素材共用，不覆盖全部表单模式或四部分40题。设备合成声音、拼读可听性及真实延迟复验待人工/实际使用核验。',
  }),
  binding(readingViewsLessonFor('academic'), {
    id: 'batch-01-R04-A', variants: ['academic'], requirementIds: ['R04-A'], sourceIds: ['reading-academic', 'reading-judgments-bc'],
    sourceLocator: 'IELTS identifying writer’s views/claims: agreement, explicit contradiction, or absent evidence without outside knowledge. BC teaching guide page 2: evidence follows text order.',
    content: {path: 'ielts-blueprint/curriculum/reading-views.ts', symbol: 'readingViewsLessonFor(academic)'},
    coverageBoundary: '六份原创一般兴趣短论述，每份3题，练作者/被引用者、观点范围与缺失信息；不覆盖正式 Academic 长度、全部论述难度、整卷或 Band。',
  }),
  binding(readingViewsLessonFor('general-training'), {
    id: 'batch-01-R04-GT', variants: ['general-training'], requirementIds: ['R04-GT'], sourceIds: ['reading-general-bc', 'reading-judgments-bc'],
    sourceLocator: 'British Council GT inventory includes identifying writer’s views/claims. BC teaching guide page 2 explains YES/NO/NOT GIVEN and text order; materials retain GT workplace/community contexts.',
    content: {path: 'ielts-blueprint/curriculum/reading-views.ts', symbol: 'readingViewsLessonFor(general-training)'},
    coverageBoundary: '六份原创工作/社区意见短文，每份3题；共享判断规则不借用 Academic 素材作 GT 证据。BC GT 本轮重读失败，沿用此前显式 GT 清单来源；不模拟全部三部分或 Band。',
  }),
];

export type {CurriculumBinding, CurriculumStageBinding} from './types';
