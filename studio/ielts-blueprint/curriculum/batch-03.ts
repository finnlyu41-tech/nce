import type {SampleLesson} from '../sample-sequence';
import type {OfficialSource, Variant} from '../types';
import type {CurriculumBinding} from './types';
import {listeningMatchingLesson} from './batch-03/listening-matching';
import {academicSentenceLesson} from './batch-03/reading-sentences-academic';
import {generalSentenceLesson} from './batch-03/reading-sentences-general';

/** Content only. Registration and all shared product files belong to the sole integration owner. */
export function batch03LessonsFor(variant: Variant): SampleLesson[] {
  if (variant !== 'academic' && variant !== 'general-training') throw new RangeError('Choose Academic or General Training before requesting course materials.');
  return [listeningMatchingLesson, variant === 'academic' ? academicSentenceLesson : generalSentenceLesson];
}

export const batch03ResponseContract = {
  matching: 'one-letter-per-numbered-item', matchingChoices: 'shared-list', reuse: 'question-specific-instruction',
  sentenceCompletion: 'words-from-authored-passage', sentenceMaxWords: 2, rawAnswer: 'preserved-string',
  checkUnit: 'individual-authored-item', band: null, officialWholePaperScore: 'not-implemented',
} as const;

export const batch03AdditionalSources: readonly OfficialSource[] = [
  {
    id: 'listening-matching-bc', title: 'British Council: Listening Part 3 matching/classifying teaching guide',
    url: 'https://takeielts.britishcouncil.org/sites/default/files/2026-06/listening_part_3_matching-classifying_questions_.pdf',
    publisher: 'British Council', checkedAt: '2026-10-02', verification: 'direct-open',
    scope: 'Page 6 strategy f: read whether an option is used once or may be used more than once. Matching links numbered items with a shared list; answers follow recording information order.',
    caveat: 'Only task rules are paraphrased. No supplied scripts, questions or answer keys are copied; URL directory is not treated as publication date.',
  },
  {
    id: 'reading-completion-bc', title: 'British Council: Reading completion questions teaching guide',
    url: 'https://takeielts.britishcouncil.org/sites/default/files/2026-06/reading_completion_questions_.pdf',
    publisher: 'British Council', checkedAt: '2026-10-02', verification: 'direct-open',
    scope: 'Page 4: use the gap context and word class, locate relevant text, check grammar and instructed word limit.',
    caveat: 'No practice passage or question copied. This batch uses ordinary one/two-word source phrases; it does not implement universal number or hyphen normalization.',
  },
  {
    id: 'reading-general-sentence-sample', title: 'IELTS: General Training Reading sentence-completion sample task',
    url: 'https://ielts.org/cdn/Sample-tests/ielts-general-reading-sample-tasks-2023.pdf',
    publisher: 'IELTS', checkedAt: '2026-10-02', verification: 'direct-open',
    scope: 'Pages 23–25: a dedicated sentence-completion task with source-word answers and a two-word limit; its answer key allows task-specific short/long forms.',
    caveat: 'The sample is cited only to verify the distinct task and answer instructions; passage, questions and keys are not copied. No Academic order rule is generalized to GT.',
  },
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

export const batch03Coverage: readonly CurriculumBinding[] = [
  binding(listeningMatchingLesson, {
    id: 'batch-03-L03', variants: ['academic', 'general-training'], requirementIds: ['L03'],
    sourceIds: ['listening-format', 'listening-matching-bc'],
    sourceLocator: 'IELTS Listening type 2: associate numbered items with a shared option list and choose letters. BC page 6f: option reuse depends on this task instruction.',
    content: {path: 'ielts-blueprint/curriculum/batch-03/listening-matching.ts', symbol: 'listeningMatchingLesson'},
    coverageBoundary: '六段原创单人说明、18配对项（含示范/引导）；共用名单与每题一个字母，不是整组多选。不覆盖多人换轮辨认；合成声音/真实可听性待人工核验，正式四部分难度、完整卷和长期保持未验。',
  }),
  binding(academicSentenceLesson, {
    id: 'batch-03-R09-A', variants: ['academic'], requirementIds: ['R09-A'],
    sourceIds: ['reading-academic', 'reading-completion-bc'],
    sourceLocator: 'IELTS Academic type 8: source words fit a sentence gap within its instruction limit; answers follow text information order. BC page 4: check word class, grammar and word count.',
    content: {path: 'ielts-blueprint/curriculum/batch-03/reading-sentences-academic.ts', symbol: 'academicSentenceLesson'},
    coverageBoundary: '六份原创一般兴趣短文、18空，练一/两词来源短语、语法槽位与定位改写；未覆盖正式长文、混合40题、完整词数/数字特例或难度标定。',
  }),
  binding(generalSentenceLesson, {
    id: 'batch-03-R09-GT', variants: ['general-training'], requirementIds: ['R09-GT'],
    sourceIds: ['reading-general', 'reading-general-sentence-sample', 'reading-completion-bc'],
    sourceLocator: 'GT official sample pages 23–25 independently confirms sentence completion and source-word/two-word instructions. GT format groups sentence with other completion tasks and allows non-text-order answers.',
    content: {path: 'ielts-blueprint/curriculum/batch-03/reading-sentences-general.ts', symbol: 'generalSentenceLesson'},
    coverageBoundary: '六份原创日常/工作短文、18空，素材与Academic隔离；本课题序是作者安排，不推广全部GT顺序规则。不覆盖Section3长文、三部分全卷或正式Band。',
  }),
];
