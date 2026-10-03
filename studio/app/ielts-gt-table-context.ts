import type {State} from './model';
import {readSampleProgress, sampleProgressKey, serializeSampleProgress} from './ielts-sample-progress';
import {extendTableContext, replaceSampleProgressWithTableContext, tableContextKey} from './ielts-table-context';
import type {SampleState} from '../ielts-blueprint/sample-sequence-model';
import {sampleMaterials} from '../ielts-blueprint/sample-sequence';
import {gtTableOptionsLessonsFor, gtTableOptionsStimulusFor} from '../ielts-blueprint/curriculum/gt-table-options';
import {projectTableStimulus} from '../ielts-blueprint/structured-table/projection';
import type {TableStimulus} from '../ielts-blueprint/structured-table/types';

export const gtTableContextKey = 'ielts-gt-table-context-v1';
const MAX_RAW = 2_000_000;
export type GTTableContextMaterial = {
  id: string; instruction: string; context: string; table: TableStimulus;
  options: {letter: string; text: string}[]; questions: {id: string; prompt: string}[];
  /** A current reference cannot prove the original stimulus of an older attempt. */
  legacyReconstructed: boolean;
};
export type GTTableContext = {version: 1; materials: Record<string, GTTableContextMaterial>};
export type GTTableContextRead =
  | {status: 'empty' | 'ready'; raw: string | undefined; value: GTTableContext}
  | {status: 'blocked'; raw: string; reason: string};
export type GTTableContextCapture =
  | {ok: true; raw: string | undefined; value: GTTableContext; addedIds: string[]; legacyReconstructedIds: string[]}
  | {ok: false; raw: string | undefined; reason: string};
const lessons = gtTableOptionsLessonsFor('general-training');
const materials = new Map(lessons.flatMap(sampleMaterials).map(material => [material.id, material]));
const own = (value: object, key: string) => Object.hasOwn(value, key);
const plain = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' &&
  !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
function need(ok: unknown, reason: string): asserts ok {if (!ok) throw Error(reason);}
function exact(value: unknown, keys: string[]): asserts value is Record<string, unknown> {
  need(plain(value) && Reflect.ownKeys(value).length === keys.length &&
    Reflect.ownKeys(value).every(key => typeof key === 'string' && keys.includes(key)) &&
    keys.every(key => own(value, key)), 'GT 表格题面记录字段不完整或包含不支持的字段；原文保留。');
}
function same(left: unknown, right: unknown): boolean {
  if (left === right) return true;
  if (Array.isArray(left) || Array.isArray(right)) return Array.isArray(left) && Array.isArray(right) &&
    left.length === right.length && left.every((value, index) => same(value, right[index]));
  if (!plain(left) || !plain(right)) return false;
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length && keys.every(key => own(right, key) && same(left[key], right[key]));
}
function snapshot(id: string, legacyReconstructed: boolean): GTTableContextMaterial {
  const material = materials.get(id), source = gtTableOptionsStimulusFor(id);
  need(material && material.context && material.questions && source, '找不到该 GT 表格题面的冻结来源；原文保留。');
  const result = projectTableStimulus(source.table, {blankCount: material.questions.length,
    questions: material.questions.map((question, index) => ({id: question.id, questionNumber: index + 1}))});
  need(result.ok, '冻结 GT 表格坐标与题干不一致；原文保留。');
  return {id, instruction: material.instruction, context: material.context, table: result.projection.stimulus,
    options: source.options.map(option => ({letter: option.letter, text: option.text})),
    questions: material.questions.map(question => ({id: question.id, prompt: question.prompt})), legacyReconstructed};
}
function validate(value: unknown): asserts value is GTTableContext {
  exact(value, ['version', 'materials']);
  need(value.version === 1, 'GT 表格题面记录版本暂不支持；请保留原文并使用支持该版本的网站。');
  need(plain(value.materials) && Object.keys(value.materials).length <= materials.size, 'GT 表格题面数量或格式不受支持；原文保留。');
  for (const [id, material] of Object.entries(value.materials)) {
    need(materials.has(id), 'GT 表格题面标识不受支持；原文保留。');
    exact(material, ['id', 'instruction', 'context', 'table', 'options', 'questions', 'legacyReconstructed']);
    need(material.id === id && typeof material.legacyReconstructed === 'boolean', 'GT 表格题面标识或来源说明不完整；原文保留。');
    need(Array.isArray(material.questions) && Array.isArray(material.options), 'GT 表格题干或选项记录不完整；原文保留。');
    for (const question of material.questions) exact(question, ['id', 'prompt']);
    for (const option of material.options) exact(option, ['letter', 'text']);
    need(projectTableStimulus(material.table).ok && same(material, snapshot(id, material.legacyReconstructed)),
      '保存的文章、指令、表格、选项或题干与当前冻结内容不符；原文保留，不能改用当前内容覆盖。');
  }
}
export function readGTTableContext(raw: string | undefined): GTTableContextRead {
  if (raw === undefined) return {status: 'empty', raw, value: {version: 1, materials: {}}};
  try {
    need(typeof raw === 'string' && raw.length <= MAX_RAW, 'GT 表格题面记录超过读取范围；原文保留。');
    const value: unknown = JSON.parse(raw);
    validate(value);
    return {status: 'ready', raw, value};
  } catch (error) {
    return {status: 'blocked', raw, reason: error instanceof SyntaxError ? 'GT 表格题面记录不是完整的 JSON；原文保留。' :
      error instanceof Error ? error.message : 'GT 表格题面记录暂时无法读取；原文保留。'};
  }
}
/** Only exact GT sessions are eligible; activating an unstarted timed task does not reveal it. */
function eligible(value: SampleState): Map<string, boolean> {
  const ids = new Map<string, boolean>();
  for (const [key, session] of Object.entries(value.sessions)) {
    const lesson = lessons.find(item => key === 'general-training:' + item.id);
    if (!lesson) continue;
    for (const material of sampleMaterials(lesson)) {
      const draft = session.drafts[material.id];
      if (!session.exposures.includes(material.id) || !draft) continue;
      const attempted = session.attempts.some(attempt => attempt.promptId === material.id);
      if (material.id === lesson.timed.id && !draft.startedAt && !attempted) continue;
      ids.set(material.id, attempted);
    }
  }
  return ids;
}
/** Capture only opened public material. No scoring keys, models, hints or future review bank. */
export function extendGTTableContext(value: SampleState, raw?: string, now = Date.now()): GTTableContextCapture {
  const read = readGTTableContext(raw);
  if (read.status === 'blocked') return {ok: false, raw, reason: read.reason};
  try {
    serializeSampleProgress(value, now);
    const ids = eligible(value);
    need(Object.keys(read.value.materials).every(id => ids.has(id)), 'GT 表格题面与已打开的材料记录不匹配；原文保留。');
    const next: GTTableContext = {version: 1, materials: {...read.value.materials}}, addedIds: string[] = [];
    for (const [id, alreadyAttempted] of ids) if (!own(next.materials, id)) {
      next.materials[id] = snapshot(id, alreadyAttempted); addedIds.push(id);
    }
    const nextRaw = addedIds.length ? JSON.stringify(next) : raw;
    if (nextRaw !== undefined) need(nextRaw.length <= MAX_RAW, 'GT 表格题面记录已到保存上限；原文保留。');
    return {ok: true, raw: nextRaw, value: next, addedIds,
      legacyReconstructedIds: Object.values(next.materials).filter(item => item.legacyReconstructed).map(item => item.id)};
  } catch (error) {
    return {ok: false, raw, reason: error instanceof Error ? error.message : '这次 GT 表格题面未保存，原文保留。'};
  }
}

/** CAS all three raw drafts while reusing the canonical progress and Academic context writer. */
export function replaceSampleProgressWithGTTableContext(
  state: State, expectedProgress: string | undefined, nextProgress: string,
  expectedAcademicContext: string | undefined, nextAcademicContext: string | undefined,
  expectedGTContext: string | undefined, nextGTContext: string | undefined, now = Date.now(),
): State {
  if (state.drafts[sampleProgressKey] !== expectedProgress ||
      state.drafts[tableContextKey] !== expectedAcademicContext ||
      state.drafts[gtTableContextKey] !== expectedGTContext) return state;
  const before = readSampleProgress(expectedProgress, now), after = readSampleProgress(nextProgress, now);
  const oldContext = readGTTableContext(expectedGTContext), context = readGTTableContext(nextGTContext);
  if (before.status === 'blocked' || after.status !== 'ready' || oldContext.status === 'blocked' || context.status === 'blocked') return state;
  const beforeIds = eligible(before.value), afterIds = eligible(after.value);
  if (!Object.keys(oldContext.value.materials).every(id => beforeIds.has(id)) ||
      !Object.keys(context.value.materials).every(id => afterIds.has(id)) ||
      ![...afterIds.keys()].every(id => own(context.value.materials, id)) ||
      !Object.entries(oldContext.value.materials).every(([id, material]) => same(material, context.value.materials[id]))) return state;
  const next = replaceSampleProgressWithTableContext(state, expectedProgress, nextProgress,
    expectedAcademicContext, nextAcademicContext, now);
  if (next === state) {
    if (nextProgress !== expectedProgress || nextAcademicContext !== expectedAcademicContext || nextGTContext === expectedGTContext) return state;
    // The Academic writer deliberately returns the original state for a valid no-op.
    // Its existing capture validator ensures a GT-only write cannot bypass missing Academic context.
    const academic = extendTableContext(after.value, nextAcademicContext, now);
    if (!academic.ok || academic.raw !== nextAcademicContext) return state;
  }
  return nextGTContext === undefined ? next : {...next, drafts: {...next.drafts, [gtTableContextKey]: nextGTContext}};
}
