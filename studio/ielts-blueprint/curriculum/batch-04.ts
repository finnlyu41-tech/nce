import type {SampleLesson} from '../sample-sequence';
import type {OfficialSource, Variant} from '../types';
import type {CurriculumBinding} from './types';
import {listeningSentenceLesson} from './batch-04/listening-sentences';
import {academicInformationLesson} from './batch-04/reading-information-academic';
import {generalInformationLesson} from './batch-04/reading-information-general';

/** Content only. Registration and all shared product files belong to the sole integration owner. */
export function batch04LessonsFor(variant: Variant): SampleLesson[] {
  if (variant !== 'academic' && variant !== 'general-training') throw new RangeError('Choose Academic or General Training before requesting course materials.');
  return [listeningSentenceLesson, variant === 'academic' ? academicInformationLesson : generalInformationLesson];
}

export const batch04ResponseContract = {
  listeningSentenceCompletion: 'words-from-authored-recording', sentenceMaxWords: 2,
  readingInformationMatching: 'one-paragraph-letter-per-information-item', matchingChoices: 'shared-labelled-paragraphs',
  reuse: 'question-specific-instruction', rawAnswer: 'preserved-string',
  checkUnit: 'individual-authored-item', band: null, officialWholePaperScore: 'not-implemented',
} as const;

export const batch04AdditionalSources: readonly OfficialSource[] = [
  {id: 'listening-sentences-b04', title: 'IELTS Listening format: sentence completion, bounded recheck',
    url: 'https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening', publisher: 'IELTS',
    checkedAt: '2026-10-02', verification: 'partial-fetch',
    scope: 'Sentence completion uses recording information to fill sentence gaps under the task word limit. Existing direct-open source is carried forward; this round two bounded direct opens timed out.',
    caveat: 'The unchanged one/two-word recorded-phrase restriction is an explicit authored instruction in this batch, not a borrowed universal rule from form completion. No new live fetch success claimed; no official scripts or questions copied.'},
  {id: 'reading-information-academic-b04', title: 'IELTS Academic Reading: matching information',
    url: 'https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-reading', publisher: 'IELTS',
    checkedAt: '2026-10-02', verification: 'direct-open',
    scope: 'Match specific information, rather than a paragraph main idea; not every paragraph is needed, and permitted reuse is stated in instructions.',
    caveat: 'Four labelled paragraphs and three shuffled information items are this batch design. The task section gives no guarantee of text-order answers. No official passage, question or key copied.'},
  {id: 'reading-information-general-b04', title: 'IELTS General Training Reading: matching information',
    url: 'https://ielts.org/take-a-test/test-types/ielts-general-training-test/ielts-general-training-format-reading', publisher: 'IELTS',
    checkedAt: '2026-10-02', verification: 'direct-open',
    scope: 'Specific information is matched to labelled paragraphs; letters may be unused or reused when the instruction permits it.',
    caveat: 'GT directly verified this round. A–D, item count and actual repeats are authored choices, not a fixed official count. No Academic ordering rule is promoted to this task.'},
];

const stages = (lesson: SampleLesson): CurriculumBinding['stages'] => ({
  explain: {materialIds: [], activity: '读配对或句子填空的方法，确认本组的输入指令。', expectedEvidence: 'lesson.explanation、共同选项/词数规则和目标；阅读方法不计掌握。'},
  model: {materialIds: [lesson.model.id], activity: '跟教练步骤看原材料、完整题干和每题依据。', expectedEvidence: 'modelNotes 与 accepted/why 实际展示；示范不是学员首答。'},
  guided: {materialIds: [lesson.guided.id], activity: '带着中性方法做另一份材料，保留首答后订正。', expectedEvidence: 'guided attempts 及答后依据；引导作品不作独立保持证据。'},
  independent: {materialIds: [lesson.independent.id], activity: '换情境，先不看提示和参考答案处理三项。', expectedEvidence: '原始三项答案、曝光/fresh/hinted；听力完整播放与实际声音确认。'},
  timed: {materialIds: [lesson.timed.id], activity: '主动开始本站计时后做另一份新材料。', expectedEvidence: 'startedAt、elapsedMs、withinTrainingTime；180秒是本地预算，超时原答仍保留。'},
  feedback: {materialIds: [lesson.independent.id, lesson.timed.id], activity: '把每项首答与原材料证据对照，分别保留订正。', expectedEvidence: 'attempts、逐题why、correctionAnswers/correctionNote/correctedAt；不自动诊断错因或Band。'},
  review: {materialIds: lesson.reviews.map(material => material.id), activity: '沿现有间隔依次换两份未曝光的不同材料。', expectedEvidence: 'review原答、到期与辅助/曝光/播放条件；模拟时钟不证明真实24小时保持。'},
});
const binding = (lesson: SampleLesson, details: Pick<CurriculumBinding, 'id' | 'variants' | 'requirementIds' | 'sourceIds' | 'sourceLocator' | 'content' | 'coverageBoundary'>): CurriculumBinding => ({
  ...details, lessonId: lesson.id, stages: stages(lesson), rights: 'original-fictional',
  delivery: lesson.skill === 'listening' ? 'device-tts' : 'text', contentStatus: 'authored-not-expert-reviewed', integrationStatus: 'pending-owner-integration',
});

export const batch04Coverage: readonly CurriculumBinding[] = [
  binding(listeningSentenceLesson, {
    id: 'batch-04-L12', variants: ['academic', 'general-training'], requirementIds: ['L12'],
    sourceIds: ['listening-format', 'listening-sentences-b04'],
    sourceLocator: 'IELTS Listening sentence completion: recording information supports complete sentence relations; the instructed word limit applies. This batch explicitly requires ordinary unchanged one/two-word source phrases.',
    content: {path: 'ielts-blueprint/curriculum/batch-04/listening-sentences.ts', symbol: 'listeningSentenceLesson'},
    coverageBoundary: '六段原创单人说明、18句子空（含示范/引导），练关系、改写与语法槽位；不覆盖多人换轮、数字特例、完整四部分混合卷或真实声音质量；不换算Band。',
  }),
  binding(academicInformationLesson, {
    id: 'batch-04-R05-A', variants: ['academic'], requirementIds: ['R05-A'],
    sourceIds: ['reading-academic', 'reading-information-academic-b04'],
    sourceLocator: 'IELTS Academic matching information: select the paragraph containing the specified detail, reason, description, comparison or example; distinguish headings, respect instructed paragraph reuse, and do not infer text order.',
    content: {path: 'ielts-blueprint/curriculum/batch-04/reading-information-academic.ts', symbol: 'academicInformationLesson'},
    coverageBoundary: '六份四段原创一般兴趣短文、18项具体信息匹配，共享段落选项；不代表正式长文、40题混合卷、难度校准或整个题型掌握。',
  }),
  binding(generalInformationLesson, {
    id: 'batch-04-R05-GT', variants: ['general-training'], requirementIds: ['R05-GT'],
    sourceIds: ['reading-general', 'reading-information-general-b04'],
    sourceLocator: 'IELTS GT matching information: specific information belongs to labelled paragraphs; not every paragraph is required and reuse depends on the instruction. No answer-order guarantee is stated in this task section.',
    content: {path: 'ielts-blueprint/curriculum/batch-04/reading-information-general.ts', symbol: 'generalInformationLesson'},
    coverageBoundary: '六份原创工作/日常四段短文、18项具体信息匹配；与Academic隔离，不等同GT三部分/长文完整卷或正式Band。',
  }),
];
