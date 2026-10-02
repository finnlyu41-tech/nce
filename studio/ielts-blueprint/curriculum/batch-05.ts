import type {SampleLesson} from '../sample-sequence';
import type {OfficialSource, Variant} from '../types';
import type {CurriculumBinding} from './types';
import {listeningSingleChoiceLesson} from './batch-05/listening-single-choice';
import {academicHeadingsLesson} from './batch-05/reading-headings-academic';
import {generalHeadingsLesson} from './batch-05/reading-headings-general';

/** Candidate content only. Shared registration, UI and stores belong to the sole publisher. */
export function batch05LessonsFor(variant: Variant): SampleLesson[] {
  if (variant !== 'academic' && variant !== 'general-training') throw new RangeError('Choose Academic or General Training before requesting course materials.');
  return [listeningSingleChoiceLesson, variant === 'academic' ? academicHeadingsLesson : generalHeadingsLesson];
}

export const batch05ResponseContract = {
  listeningSingleChoice: 'one-letter-per-question-with-its-own-three-complete-options',
  readingHeadings: 'one-roman-heading-id-per-paragraph-from-the-complete-shared-list',
  headingReuse: 'not-permitted', headingAssignment: 'main-idea-not-isolated-detail',
  rawAnswer: 'preserved-string', checkUnit: 'individual-authored-item', band: null,
  officialWholePaperScore: 'not-implemented', learnerDuplicateHeading: 'retained-wrong-attempt-not-auto-cleared',
} as const;

export const batch05AdditionalSources: readonly OfficialSource[] = [
  {id: 'listening-single-choice-b05', title: 'IELTS Listening: single-answer multiple choice',
    url: 'https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening', publisher: 'IELTS',
    checkedAt: '2026-10-02', verification: 'direct-open',
    scope: 'The single-answer subtype offers three possible answers or endings; choose one correct answer. Recording information order and detailed or general understanding matter.',
    caveat: 'Three items per short single-speaker stimulus and A–C option-bank formatting are this original batch design. No multiple-answer scoring, copied-source-word constraint or formal Band conversion is added. No official questions or audio copied.'},
  {id: 'reading-headings-academic-b05', title: 'IELTS Academic Reading: matching headings',
    url: 'https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-reading', publisher: 'IELTS',
    checkedAt: '2026-10-02', verification: 'direct-open',
    scope: 'Headings represent paragraph or section main ideas; more headings than paragraphs are provided and a heading cannot be used more than once.',
    caveat: 'Three paragraphs, five roman-labelled headings, no supplied example and two unused headings are this batch design. Main-idea matching is distinct from specific-information matching. No official text, heading or key copied.'},
  {id: 'reading-headings-general-b05', title: 'IELTS General Training Reading: matching headings',
    url: 'https://ielts.org/take-a-test/test-types/ielts-general-training-test/ielts-general-training-format-reading', publisher: 'IELTS',
    checkedAt: '2026-10-02', verification: 'direct-open',
    scope: 'GT explicitly includes matching headings: find the paragraph main idea, use the larger heading list, and do not reuse a heading.',
    caveat: 'Short original three-paragraph materials are local practice, not calibrated GT Section 3 or a complete paper. Roman labels and item count are local choices. No answer-order guarantee is imported from other tasks.'},
];

const stages = (lesson: SampleLesson): CurriculumBinding['stages'] => ({
  explain: {materialIds: [], activity: '读单答案选择或标题主旨匹配的方法，确认本组输入指令。', expectedEvidence: 'lesson.explanation、完整逐题选项/标题列表及复用规则和目标；阅读方法不计掌握。'},
  model: {materialIds: [lesson.model.id], activity: '跟教练步骤看原材料、完整题干和每题依据。', expectedEvidence: 'modelNotes 与 accepted/why 实际展示；示范不是学员首答。'},
  guided: {materialIds: [lesson.guided.id], activity: '带着中性方法做另一份材料，保留首答后订正。', expectedEvidence: 'guided attempts 及答后依据；引导作品不作独立保持证据。'},
  independent: {materialIds: [lesson.independent.id], activity: '换情境，先不看提示和参考答案处理三项。', expectedEvidence: '原始三项答案、曝光/fresh/hinted；听力完整播放与实际声音确认。'},
  timed: {materialIds: [lesson.timed.id], activity: '主动开始本站计时后做另一份新材料。', expectedEvidence: 'startedAt、elapsedMs、withinTrainingTime；180秒是本地预算，超时原答仍保留。'},
  feedback: {materialIds: [lesson.independent.id, lesson.timed.id], activity: '把每项首答与原材料证据对照，分别保留订正。', expectedEvidence: 'attempts、逐题why、correctionAnswers/correctionNote/correctedAt；不自动诊断错因或Band。'},
  review: {materialIds: lesson.reviews.map(material => material.id), activity: '沿既有间隔依次换两份未曝光的不同材料。', expectedEvidence: 'review原答、到期与辅助/曝光/播放条件；模拟时钟不证明真实24小时保持。'},
});
const binding = (lesson: SampleLesson, details: Pick<CurriculumBinding, 'id' | 'variants' | 'requirementIds' | 'sourceIds' | 'sourceLocator' | 'content' | 'coverageBoundary'>): CurriculumBinding => ({
  ...details, lessonId: lesson.id, stages: stages(lesson), rights: 'original-fictional',
  delivery: lesson.skill === 'listening' ? 'device-tts' : 'text', contentStatus: 'authored-not-expert-reviewed', integrationStatus: 'pending-owner-integration',
});

export const batch05Coverage: readonly CurriculumBinding[] = [
  binding(listeningSingleChoiceLesson, {
    id: 'batch-05-L01', variants: ['academic', 'general-training'], requirementIds: ['L01'],
    sourceIds: ['listening-format', 'listening-single-choice-b05'],
    sourceLocator: 'Listening question type 1, single-answer subtype: each question has three possible answers and one correct answer supported by recording information.',
    content: {path: 'ielts-blueprint/curriculum/batch-05/listening-single-choice.ts', symbol: 'listeningSingleChoiceLesson'},
    coverageBoundary: '六段原创单人说明、18单选题（含示范/引导），各题完整三选项可见；不覆盖多人音轨、所有口音、完整40题或真实声音质量；不换算Band。',
  }),
  binding(academicHeadingsLesson, {
    id: 'batch-05-R06-A', variants: ['academic'], requirementIds: ['R06-A'],
    sourceIds: ['reading-academic', 'reading-headings-academic-b05'],
    sourceLocator: 'Academic matching headings: distinguish the whole paragraph main idea from supporting details, use the complete larger heading list, and use each heading at most once.',
    content: {path: 'ielts-blueprint/curriculum/batch-05/reading-headings-academic.ts', symbol: 'academicHeadingsLesson'},
    coverageBoundary: '六份原创一般兴趣三段短文、18段主旨匹配，共享五标题且每题唯一；不代表正式长文、全部题型、完整卷或难度校准。',
  }),
  binding(generalHeadingsLesson, {
    id: 'batch-05-R06-GT', variants: ['general-training'], requirementIds: ['R06-GT'],
    sourceIds: ['reading-general-bc', 'reading-headings-general-b05'],
    sourceLocator: 'GT matching headings: a heading summarises a paragraph main idea; provide more headings than paragraphs and do not reuse headings.',
    content: {path: 'ielts-blueprint/curriculum/batch-05/reading-headings-general.ts', symbol: 'generalHeadingsLesson'},
    coverageBoundary: '六份原创日常/工作三段短文、18段主旨匹配，Academic材料隔离；不代表正式GT三部分、长文难度或Band。',
  }),
];
