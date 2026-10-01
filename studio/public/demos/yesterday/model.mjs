import {byId, questions, independentIds} from './content.mjs';
export const storageKey = 'nce-demo-yesterday-v1';
export function initialState(now = Date.now()) {
  return {version: 1, step: 0, createdAt: now, attempts: [], hints: [], seenQuestionIds: [], previousSeenQuestionIds: [], independentCursor: 0, correction: {phase: 'intro', target: null, currentId: null}, draft: '', planSaved: false};
}
export function restart(state, now = Date.now()) {
  return {...initialState(now), previousSeenQuestionIds:[...new Set([...state.previousSeenQuestionIds,...state.seenQuestionIds,...state.attempts.map(a=>a.id)])]};
}
export function goTo(state, step) {
  return Number.isInteger(step) && step >= 0 && step < 5 ? {...state, step} : state;
}
export function useHint(state, id) {
  if (!byId.has(id) || state.attempts.some(a => a.id === id) || state.hints.includes(id)) return state;
  return {...state, hints: [...state.hints, id]};
}
export function showQuestion(state, id) {
  return !byId.has(id) || state.seenQuestionIds.includes(id) ? state : {...state, seenQuestionIds:[...state.seenQuestionIds,id]};
}
export function showRules(state, target = null) {
  let next = state;
  for (const id of state.seenQuestionIds) if (!target || byId.get(id)?.target === target) next = useHint(next,id);
  return next;
}
export function submit(state, id, choice, now = Date.now()) {
  const q = byId.get(id);
  if (!q || !Number.isInteger(choice) || choice < 0 || choice >= q.options.length || state.attempts.some(a => a.id === id)) return state;
  const attempt = {id, choice, correct: choice === q.correct, hinted: state.hints.includes(id), repeated:state.previousSeenQuestionIds.includes(id), at: now};
  return {...state, attempts: [...state.attempts, attempt]};
}
export function independentQuestion(state) {return byId.get(independentIds[state.independentCursor]);}
export function advanceIndependent(state) {
  const q = independentQuestion(state);
  if (!q || !state.attempts.some(a => a.id === q.id)) return state;
  return state.independentCursor === 0 ? {...state, independentCursor: 1} : {...state, step: 3};
}
export function correctionTarget(state) {
  const wrong = state.attempts.find(a => byId.get(a.id)?.kind === 'independent' && !a.correct)
    || state.attempts.find(a => !a.correct);
  return wrong ? byId.get(wrong.id).target : 'affirmative';
}
export function nextFresh(state) {
  const target = state.correction.target || correctionTarget(state);
  const q = questions.find(q => q.kind === 'followup' && q.target === target && !state.attempts.some(a => a.id === q.id) && !state.previousSeenQuestionIds.includes(q.id));
  return {...state, correction: {target, phase: q ? 'challenge' : 'exhausted', currentId: q?.id || null}};
}
export function writeDraft(state) {return {...state, correction: {...state.correction, phase: 'draft'}};}
export function saveDraft(state, draft) {return {...state, draft: String(draft).slice(0, 1200)};}
export function evidence(state) {
  const objective = state.attempts.filter(a => byId.has(a.id));
  const newAttempts = objective.filter(a => byId.get(a.id).kind !== 'diagnostic' && !a.repeated);
  const unassisted = newAttempts.filter(a => a.correct && !a.hinted);
  return {
    first: objective.find(a => byId.get(a.id).kind === 'diagnostic') || null,
    newAttempts, unassisted,
    hintedCount: objective.filter(a => a.hinted).length, repeatedCount:objective.filter(a=>a.repeated).length,
    wrongCount: objective.filter(a => !a.correct).length,
    correctedTargets: [...new Set(unassisted.filter(a => byId.get(a.id).kind === 'followup').map(a => byId.get(a.id).target))],
    draftStatus: state.draft.trim() ? 'awaiting-check' : 'not-recorded',
    listening: 'not-tested', spontaneousSpeech: 'not-tested', mastery: 'not-assessed', band: null,
    reviews: {tomorrow: 'suggested-not-done', nextWeek: 'suggested-not-done'},
  };
}
export function reviewDates(now = new Date()) {
  const date = days => {const d = new Date(now); d.setDate(d.getDate() + days); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  return {tomorrow: date(1), nextWeek: date(7)};
}
export function restoreState(value, now = Date.now()) {
  const base = initialState(now);
  if (!value || value.version !== 1 || !Array.isArray(value.attempts) || !Array.isArray(value.hints)) return base;
  const knownIds = ids => [...new Set(ids.filter(id=>byId.has(id)))];
  let restored = {...base, hints:knownIds([...value.hints,...value.attempts.filter(a=>a?.hinted===true).map(a=>a.id)]), seenQuestionIds:knownIds(Array.isArray(value.seenQuestionIds) ? value.seenQuestionIds : []), previousSeenQuestionIds:knownIds([...(Array.isArray(value.previousSeenQuestionIds) ? value.previousSeenQuestionIds : []),...value.attempts.filter(a=>a?.repeated===true).map(a=>a.id)])};
  for (const a of value.attempts) if (a && Number.isFinite(a.at) && a.at > 0 && a.at <= now) restored = submit(restored, a.id, a.choice, a.at);
  const phases = ['intro', 'challenge', 'exhausted', 'draft'];
  const saved = value.correction;
  const validCurrent = saved && byId.get(saved.currentId)?.kind === 'followup' && byId.get(saved.currentId)?.target === saved.target;
  const validPhase = saved && phases.includes(saved.phase) && (saved.phase !== 'challenge' || validCurrent);
  const target = ['affirmative', 'negative', 'question'].includes(saved?.target) ? saved.target : null;
  return {...restored, step: Number.isInteger(value.step) && value.step >= 0 && value.step < 5 ? value.step : 0,
    createdAt: Number.isFinite(value.createdAt) && value.createdAt > 0 && value.createdAt <= now ? value.createdAt : now,
    independentCursor: value.independentCursor === 1 && restored.attempts.some(a => a.id === independentIds[0]) ? 1 : 0,
    correction: validPhase ? {phase: saved.phase, target, currentId: validCurrent ? saved.currentId : null} : base.correction,
    draft: typeof value.draft === 'string' ? value.draft.slice(0,1200) : '', planSaved: value.planSaved === true};
}
