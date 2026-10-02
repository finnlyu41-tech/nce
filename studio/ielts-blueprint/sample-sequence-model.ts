import type {LearningStage, Variant} from './types';
import {sampleLessonById, type SampleLesson, type SampleMaterial} from './sample-sequence';

export const SAMPLE_REVIEW_DELAY = 24 * 60 * 60 * 1000;
export type Playback = {id: string; requestedAt: number; startedAt: number; endedAt: number; status: 'requested' | 'playing' | 'ended' | 'failed'; audible: boolean; failure: string};
export type SampleDraft = {openedAt: number; freshAtOpen: boolean; unseenConfirmed: boolean; answers: Record<string, string>; response: string; hinted: boolean; startedAt: number; submittedAt: number; playbacks: Playback[]};
export type SampleAttempt = {
  promptId: string; materialId: string; lessonId: string; variant: Variant; stage: LearningStage; at: number;
  answers: Record<string, string>; response: string; matched: boolean | null; correct: number | null; total: number | null;
  fresh: boolean; hinted: boolean; audioUsable: boolean; playbackCount: number; playbackFailures: number;
  startedAt: number; elapsedMs: number | null; withinTrainingTime: boolean | null;
  feedback: 'answer-key' | 'self-review-awaiting-human';
};
export type SampleSession = {stage: LearningStage; exposures: string[]; drafts: Record<string, SampleDraft>; attempts: SampleAttempt[]; correctionAnswers: Record<string, string>; correctionResponse: string; correctionNote: string; correctedAt: number; reviewPromptId?: string};
export type SampleState = {version: 1; variant: Variant | null; lessonId: string; sessions: Record<string, SampleSession>};
export const emptySampleState = (): SampleState => ({version: 1, variant: null, lessonId: 'hub-listening', sessions: {}});
const emptySession = (): SampleSession => ({stage: 'explain', exposures: [], drafts: {}, attempts: [], correctionAnswers: {}, correctionResponse: '', correctionNote: '', correctedAt: 0});
const key = (variant: Variant, lessonId: string) => `${variant}:${lessonId}`;
const normal = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase();
const sampleTextTokens = (s: string) => s.match(/\b[a-z](?:\.[a-z])+\b\.?|\b[a-z]+(?:['’-][a-z]+)*|\b\d+(?:[.,:/]\d+)*(?:%|[a-z]+)?/gi) || [];
/** Display reference only: numbers and common dotted abbreviations each count once. */
export const sampleWordCount = (s: string) => sampleTextTokens(s).length;
/** A finite original-text check, not sentence, relevance, language quality or Band grading. */
export function sampleResponseIssue(response: string): string | undefined {
  if (!response.trim()) return '目前只有空白。请留下自己的英文原稿；原稿保留，可修改后直接再提交。';
  const tokens = sampleTextTokens(response).map(token => token.toLowerCase().replace(/\.$/, '').replace(/’/g, "'"));
  if (!tokens.some(token => /^[a-z]/.test(token))) return '目前没有英文文字。请按题目留下英文原稿；只有数字或标点不能作为作品，原稿保留。';
  for (let length = 1; length <= tokens.length / 2; length++) {
    if (tokens.length % length === 0 && tokens.every((token, index) => token === tokens[index % length])) return '整篇内容只是在重复同一个词或片段。请留下自己的英文回答，无需重复凑词；原稿保留，可修改后直接再提交。';
  }
  return undefined;
}
/** Preserve previously accepted records even when the display count or checks change. */
export function isStoredSampleResponse(response: string, legacyMinimum = 1): boolean {
  const legacyCount = (response.match(/[a-z]+(?:['’-][a-z]+)*/gi) || []).length;
  return !sampleResponseIssue(response) || legacyCount >= legacyMinimum;
}
export const sampleSession = (state: SampleState) => state.variant ? state.sessions[key(state.variant, state.lessonId)] || emptySession() : emptySession();
export const selectedSampleLesson = (state: SampleState) => state.variant ? sampleLessonById(state.variant, state.lessonId) : undefined;
export function activeSampleMaterial(state: SampleState): SampleMaterial | undefined {
  const lesson = selectedSampleLesson(state), session = sampleSession(state);
  if (!lesson) return;
  if (session.stage === 'review') return lesson.reviews.find(m => m.id === session.reviewPromptId);
  if (session.stage === 'explain' || session.stage === 'feedback') return;
  return lesson[session.stage];
}
export const activeSampleDraft = (state: SampleState) => {const material = activeSampleMaterial(state); return material ? sampleSession(state).drafts[material.id] : undefined;};
const answersMatch = (material: SampleMaterial, answers: Record<string, string>) => !!material.questions?.length && material.questions.every(q => q.accepted.some(a => normal(a) === normal(answers[q.id] || '')));
export const usableSampleAudio = (draft?: SampleDraft) => !!draft?.playbacks.some(p => p.status === 'ended' && p.startedAt > 0 && p.endedAt >= p.startedAt && p.audible);
const allExposures = (state: SampleState) => Object.values(state.sessions).flatMap(session => session.exposures);
function activate(session: SampleSession, material: SampleMaterial, at: number, seen: readonly string[]) {
  if (!session.drafts[material.id]) session.drafts[material.id] = {openedAt: at, freshAtOpen: !seen.includes(material.id), unseenConfirmed: false, answers: {}, response: '', hinted: false, startedAt: 0, submittedAt: 0, playbacks: []};
  if (!session.exposures.includes(material.id)) session.exposures.push(material.id);
}
export function sampleReviewDueAt(session: SampleSession): number {
  if (!session.correctedAt) return 0;
  const latest = session.attempts.filter(a => a.stage === 'review').at(-1);
  return Math.max(session.correctedAt, latest?.at || 0) + SAMPLE_REVIEW_DELAY;
}
export function sampleLessonReceipt(state: SampleState, now = Date.now()) {
  const session = sampleSession(state), lesson = selectedSampleLesson(state), latest = session.attempts.filter(a => a.stage === 'review' && a.at <= now).at(-1);
  const baseDue = session.correctedAt ? session.correctedAt + SAMPLE_REVIEW_DELAY : 0;
  let delayed: 'not-scheduled' | 'not-due' | 'awaiting-new-task' | 'needs-repair' | 'assisted' | 'awaiting-human-review' | 'local-target-observed' = !baseDue ? 'not-scheduled' : now < baseDue ? 'not-due' : 'awaiting-new-task';
  if (latest) {
    const previous = session.attempts.filter(a => a.stage === 'review' && a.at < latest.at).at(-1);
    const eligibleAt = Math.max(session.correctedAt, previous?.at || 0) + SAMPLE_REVIEW_DELAY;
    delayed = latest.at < eligibleAt ? 'not-due' : !latest.fresh || latest.hinted || (lesson?.skill === 'listening' && (!latest.audioUsable || latest.playbackCount !== 1)) ? 'assisted' : latest.matched === null ? 'awaiting-human-review' : latest.matched ? 'local-target-observed' : 'needs-repair';
  }
  return {practiceCount: session.attempts.length, delayed, reviewDueAt: sampleReviewDueAt(session), freshReviewAvailable: !!lesson?.reviews.some(m => !allExposures(state).includes(m.id)), band: null, mastery: 'not-assessed' as const};
}

export type SampleAction =
  | {type: 'select-variant'; variant: Variant}
  | {type: 'open-lesson'; lessonId: string}
  | {type: 'next'}
  | {type: 'answer'; questionId: string; value: string}
  | {type: 'response'; value: string}
  | {type: 'confirm-unseen'; value: boolean}
  | {type: 'hint'}
  | {type: 'start-timed'}
  | {type: 'audio-request'; playbackId: string; promptId: string}
  | {type: 'audio-start' | 'audio-end' | 'audio-confirm'; playbackId: string; promptId: string}
  | {type: 'audio-fail'; playbackId: string; promptId: string; reason: string}
  | {type: 'submit'}
  | {type: 'correction-answer'; questionId: string; value: string}
  | {type: 'correction-response' | 'correction-note'; value: string}
  | {type: 'save-correction'}
  | {type: 'start-review'};
export type SampleTransition = {state: SampleState; issue?: string};

/** No storage, external service, Band conversion, or mastery mutation. */
export function transitionSample(state: SampleState, action: SampleAction, at = Date.now()): SampleTransition {
  const reject = (issue: string): SampleTransition => ({state, issue});
  if (!Number.isSafeInteger(at) || at <= 0) return reject('练习时间无效。');
  if (action.type === 'select-variant') {
    if (!['academic', 'general-training'].includes(action.variant)) return reject('请明确选择 Academic 或 General Training。');
    return {state: {...state, variant: action.variant}};
  }
  if (!state.variant) return reject('先选择考试类别；听说共用方法，写作保留类别差异。');
  if (action.type === 'open-lesson') {
    if (!sampleLessonById(state.variant, action.lessonId)) return reject('这份样例没有该课程。');
    return {state: {...state, lessonId: action.lessonId}};
  }
  const lesson = selectedSampleLesson(state);
  if (!lesson) return reject('找不到当前课程。');
  const next = structuredClone(state), sessionKey = key(state.variant, state.lessonId);
  const session = next.sessions[sessionKey] ||= emptySession();
  const material = activeSampleMaterial(next);
  if (material) activate(session, material, at, allExposures(next));
  const draft = material ? session.drafts[material.id] : undefined;
  if (draft && at < draft.openedAt) return reject('提交时间不能早于材料打开时间。');
  if (draft?.startedAt && at < draft.startedAt) return reject('作答时间不能早于训练计时开始。');
  const result = (): SampleTransition => ({state: next});
  if (action.type === 'next') {
    const target = {explain: 'model', model: 'guided', guided: 'independent', independent: 'timed', timed: 'feedback'}[session.stage as 'explain' | 'model' | 'guided' | 'independent' | 'timed'];
    if (!target) return reject('先保存订正，再等待新题复验。');
    if (['guided', 'independent', 'timed'].includes(session.stage) && !draft?.submittedAt) return reject('先留下这次真实作答。');
    if (session.stage === 'guided' && material?.questions && !answersMatch(material, draft!.answers)) return reject('先按示范订正当前答案，再撤掉提示。');
    session.stage = target as LearningStage;
    const targetMaterial = activeSampleMaterial(next); if (targetMaterial) activate(session, targetMaterial, at, allExposures(next));
    return result();
  }
  if (action.type === 'start-review') {
    if (!session.correctedAt || at < sampleReviewDueAt(session)) return reject('至少隔 24 小时再用新材料复验；这是本样例的复习间隔。');
    const fresh = lesson.reviews.find(m => !allExposures(next).includes(m.id));
    if (!fresh) return reject('两份复验新材料已接触过，需要补充不同材料；原题重做不能记为新题复验。');
    session.stage = 'review'; session.reviewPromptId = fresh.id; activate(session, fresh, at, allExposures(next)); return result();
  }
  if (action.type === 'correction-answer' || action.type === 'correction-response' || action.type === 'correction-note' || action.type === 'save-correction') {
    if (session.stage !== 'feedback' || !session.attempts.some(a => a.stage === 'timed')) return reject('先完成新题训练，才能保存本轮反馈订正。');
    if (action.type === 'correction-answer') {
      if (!lesson.timed.questions?.some(q => q.id === action.questionId)) return reject('订正题号不存在。');
      session.correctionAnswers[action.questionId] = action.value.slice(0, 500); session.correctedAt = 0; return result();
    }
    if (action.type !== 'save-correction') {
      session[action.type === 'correction-response' ? 'correctionResponse' : 'correctionNote'] = action.value.slice(0, 4000); session.correctedAt = 0; return result();
    }
    if (session.correctionNote.trim().length < 8) return reject('留下具体的一处修正或待核验问题（至少 8 字）。');
    if (lesson.timed.questions) {
      if (!answersMatch(lesson.timed, session.correctionAnswers)) return reject('先留下订正答案或修改后的短段落。长度只用于确认有作品，不用于评分。');
    } else {
      const issue = sampleResponseIssue(session.correctionResponse); if (issue) return reject(issue);
    }
    const latest = session.attempts.at(-1); if (latest && at < latest.at) return reject('订正时间不能早于作答。');
    session.correctedAt = at; session.stage = 'review'; session.reviewPromptId = undefined; return result();
  }
  if (!material || !draft) return reject('当前步骤没有作答材料。');
  if (action.type === 'audio-request' || action.type === 'audio-start' || action.type === 'audio-end' || action.type === 'audio-confirm' || action.type === 'audio-fail') {
    if (!material.script || action.promptId !== material.id || draft.submittedAt) return reject('音频事件与当前未提交的听力材料不匹配。');
    if (session.stage === 'timed' && !draft.startedAt) return reject('先开始训练计时，再播放这份新音频。');
    if (action.type === 'audio-request') {
      if (!action.playbackId.trim() || action.playbackId.length > 100 || draft.playbacks.some(p => p.id === action.playbackId)) return reject('播放请求无效或重复。');
      if (draft.playbacks.some(p => p.status === 'requested' || p.status === 'playing')) return reject('先结束当前播放。');
      draft.playbacks.push({id: action.playbackId, requestedAt: at, startedAt: 0, endedAt: 0, status: 'requested', audible: false, failure: ''}); return result();
    }
    const playback = draft.playbacks.at(-1); if (!playback || playback.id !== action.playbackId || at < playback.requestedAt) return reject('忽略过期或不匹配的音频回调。');
    if (action.type === 'audio-fail') {playback.status = 'failed'; playback.audible = false; playback.failure = action.reason.slice(0, 500); return result();}
    if (action.type === 'audio-start' && playback.status === 'requested') {playback.status = 'playing'; playback.startedAt = at; return result();}
    if (action.type === 'audio-end' && playback.status === 'playing' && at >= playback.startedAt) {playback.status = 'ended'; playback.endedAt = at; return result();}
    if (action.type === 'audio-confirm' && playback.status === 'ended') {playback.audible = true; return result();}
    return reject('这次播放未完整结束，不能确认已听到。');
  }
  if (action.type === 'hint') {draft.hinted = true; return result();}
  if (action.type === 'confirm-unseen') {draft.unseenConfirmed = action.value === true; return result();}
  if (action.type === 'start-timed') {
    if (session.stage !== 'timed' || draft.startedAt || draft.submittedAt) return reject('当前限时训练已开始或不在限时步骤。');
    draft.startedAt = at; return result();
  }
  if (session.stage === 'model') return reject('示范只供学习，不作为测评作答。');
  if (session.stage === 'timed' && !draft.startedAt) return reject('先主动开始训练计时，再查看和作答新题。');
  if (action.type === 'answer' || action.type === 'response') {
    if (action.type === 'answer') {
      if (!material.questions?.some(q => q.id === action.questionId)) return reject('题号不属于当前材料。');
      draft.answers[action.questionId] = action.value.slice(0, 500);
    } else draft.response = action.value.slice(0, 4000);
    draft.submittedAt = 0; return result();
  }
  if (action.type === 'submit') {
    if (draft.submittedAt) return reject('本版作答已记录；修改答案会保留原始记录并另记一次。');
    if (material.questions) {
      if (material.questions.some(q => !draft.answers[q.id]?.trim())) return reject('先填写每一道题的答案，再记录作答。');
    } else {
      const issue = sampleResponseIssue(draft.response); if (issue) return reject(issue);
    }
    const audioUsable = usableSampleAudio(draft);
    if (lesson.skill === 'listening' && !audioUsable) return reject('先完整播放并确认实际听到声音。播放失败或无声音不能算听过。');
    if (session.attempts.some(a => a.at > at)) return reject('作答时间不能早于已有记录。');
    const correct = material.questions ? material.questions.filter(q => q.accepted.some(a => normal(a) === normal(draft.answers[q.id]))).length : null;
    const matched = material.questions ? correct === material.questions.length : null;
    const fresh = draft.freshAtOpen && draft.unseenConfirmed && !Object.values(next.sessions).some(s => s.attempts.some(a => a.promptId === material.id));
    const elapsedMs = draft.startedAt ? at - draft.startedAt : null;
    session.attempts.push({promptId: material.id, materialId: material.id, lessonId: lesson.id, variant: state.variant, stage: session.stage, at, answers: {...draft.answers}, response: draft.response, matched, correct, total: material.questions?.length ?? null, fresh, hinted: draft.hinted, audioUsable, playbackCount: draft.playbacks.length, playbackFailures: draft.playbacks.filter(p => p.status === 'failed').length, startedAt: draft.startedAt, elapsedMs, withinTrainingTime: session.stage === 'timed' ? elapsedMs !== null && elapsedMs <= material.seconds * 1000 : null, feedback: matched === null ? 'self-review-awaiting-human' : 'answer-key'});
    draft.submittedAt = at; return result();
  }
  return reject('无法执行该步骤。');
}
