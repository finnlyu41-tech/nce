import type {State} from './model';
import {readSampleProgress, replaceSampleProgress, sampleProgressKey, serializeSampleProgress} from './ielts-sample-progress';
import type {SampleState} from '../ielts-blueprint/sample-sequence-model';
import {sampleMaterials} from '../ielts-blueprint/sample-sequence';
import {tableCompletionLessonsFor, tableCompletionStimulusFor} from '../ielts-blueprint/curriculum/table-completion';
import {projectTableStimulus} from '../ielts-blueprint/structured-table/projection';
import type {TableStimulus} from '../ielts-blueprint/structured-table/types';

export const tableContextKey = 'ielts-table-context-v1';
export const legacyTableContextNotice = '这份旧记录的题面由当前冻结内容补建，不能证明当时的题面版本。';
const MAX_RAW = 2_000_000;
export type TableContextMaterial = {
  id: string; instruction: string; context: string; table: TableStimulus;
  questions: {id: string; prompt: string}[];
  /** Existing attempts preceded this snapshot. This is a current reference, not proof of their original stimulus. */
  legacyReconstructed: boolean;
};
export type TableContext = {version: 1; materials: Record<string, TableContextMaterial>};
export type TableContextRead =
  | {status: 'empty' | 'ready'; raw: string | undefined; value: TableContext}
  | {status: 'blocked'; raw: string; reason: string};
export type TableContextCapture =
  | {ok: true; raw: string | undefined; value: TableContext; addedIds: string[]; legacyReconstructedIds: string[]}
  | {ok: false; raw: string | undefined; reason: string};
const lessons = tableCompletionLessonsFor('academic');
const materials = new Map(lessons.flatMap(sampleMaterials).map(material => [material.id, material]));
const own = (value: object, key: string) => Object.hasOwn(value, key);
const plain = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' &&
  !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
function need(ok: unknown, reason: string): asserts ok {if (!ok) throw Error(reason);}
function exact(value: unknown, keys: string[]): asserts value is Record<string, unknown> {
  need(plain(value) && Reflect.ownKeys(value).length === keys.length &&
    Reflect.ownKeys(value).every(key => typeof key === 'string' && keys.includes(key)) &&
    keys.every(key => own(value, key)), '表格题面记录字段不完整或包含不支持的字段；原文保留。');
}
function same(left: unknown, right: unknown): boolean {
  if (left === right) return true;
  if (Array.isArray(left) || Array.isArray(right)) return Array.isArray(left) && Array.isArray(right) &&
    left.length === right.length && left.every((value, index) => same(value, right[index]));
  if (!plain(left) || !plain(right)) return false;
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length && keys.every(key => own(right, key) && same(left[key], right[key]));
}
function snapshot(id: string, legacyReconstructed: boolean): TableContextMaterial {
  const material = materials.get(id), table = tableCompletionStimulusFor(id);
  need(material && material.context && material.questions && table, '找不到该表格题面的冻结来源；原文保留。');
  const result = projectTableStimulus(table, {rowCount: 3, columnCount: 2, blankCount: 3,
    questions: material.questions.map((question, index) => ({id: question.id, questionNumber: index + 1}))});
  need(result.ok, '冻结表格坐标与题干不一致；原文保留。');
  return {id, instruction: material.instruction, context: material.context, table: result.projection.stimulus,
    questions: material.questions.map(question => ({id: question.id, prompt: question.prompt})), legacyReconstructed};
}
function validate(value: unknown): asserts value is TableContext {
  exact(value, ['version', 'materials']);
  need(value.version === 1, '表格题面记录版本暂不支持；请保留原文并使用支持该版本的网站。');
  need(plain(value.materials) && Object.keys(value.materials).length <= materials.size, '表格题面数量或格式不受支持；原文保留。');
  for (const [id, material] of Object.entries(value.materials)) {
    need(materials.has(id), '表格题面标识不受支持；原文保留。');
    exact(material, ['id', 'instruction', 'context', 'table', 'questions', 'legacyReconstructed']);
    need(material.id === id && typeof material.legacyReconstructed === 'boolean', '表格题面标识或来源说明不完整；原文保留。');
    need(Array.isArray(material.questions), '表格题干记录不完整；原文保留。');
    for (const question of material.questions) exact(question, ['id', 'prompt']);
    need(projectTableStimulus(material.table).ok && same(material, snapshot(id, material.legacyReconstructed)),
      '保存的文章、指令、表格或题干与当前冻结内容不符；原文保留，不能改用当前内容覆盖。');
  }
}
export function readTableContext(raw: string | undefined): TableContextRead {
  if (raw === undefined) return {status: 'empty', raw, value: {version: 1, materials: {}}};
  try {
    need(typeof raw === 'string' && raw.length <= MAX_RAW, '表格题面记录超过读取范围；原文保留。');
    const value: unknown = JSON.parse(raw);
    validate(value);
    return {status: 'ready', raw, value};
  } catch (error) {
    return {status: 'blocked', raw, reason: error instanceof SyntaxError ? '表格题面记录不是完整的 JSON；原文保留。' :
      error instanceof Error ? error.message : '表格题面记录暂时无法读取；原文保留。'};
  }
}
/** Caller supplies canonical validated progress. An activated but unstarted timed task is still hidden. */
function eligible(value: SampleState): Map<string, boolean> {
  const ids = new Map<string, boolean>();
  for (const [key, session] of Object.entries(value.sessions)) {
    const lesson = lessons.find(item => key === 'academic:' + item.id);
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
/** Adds only public, actually opened table tasks. Existing snapshots and raw text are never silently repaired. */
export function extendTableContext(value: SampleState, raw?: string, now = Date.now()): TableContextCapture {
  const read = readTableContext(raw);
  if (read.status === 'blocked') return {ok: false, raw, reason: read.reason};
  try {
    serializeSampleProgress(value, now);
    const ids = eligible(value);
    need(Object.keys(read.value.materials).every(id => ids.has(id)),
      '表格题面与已打开的材料记录不匹配；原文保留。');
    const next: TableContext = {version: 1, materials: {...read.value.materials}}, addedIds: string[] = [];
    for (const [id, alreadyAttempted] of ids) if (!own(next.materials, id)) {
      next.materials[id] = snapshot(id, alreadyAttempted);
      addedIds.push(id);
    }
    const nextRaw = addedIds.length ? JSON.stringify(next) : raw;
    if (nextRaw !== undefined) need(nextRaw.length <= MAX_RAW, '表格题面记录已到保存上限；原文保留。');
    return {ok: true, raw: nextRaw, value: next, addedIds,
      legacyReconstructedIds: Object.values(next.materials).filter(item => item.legacyReconstructed).map(item => item.id)};
  } catch (error) {
    return {ok: false, raw, reason: error instanceof Error ? error.message : '这次表格题面未保存，原文保留。'};
  }
}
export const captureTableContext = extendTableContext;

/** One functional State update guards both draft entries. Scoring, host persistence and its schema remain canonical. */
export function replaceSampleProgressWithTableContext(
  state: State, expectedProgress: string | undefined, nextProgress: string,
  expectedContext: string | undefined, nextContext: string | undefined, now = Date.now(),
): State {
  if (state.drafts[sampleProgressKey] !== expectedProgress || state.drafts[tableContextKey] !== expectedContext) return state;
  const before = readSampleProgress(expectedProgress, now), after = readSampleProgress(nextProgress, now);
  const oldContext = readTableContext(expectedContext), context = readTableContext(nextContext);
  if (before.status === 'blocked' || after.status !== 'ready' || oldContext.status === 'blocked' || context.status === 'blocked') return state;
  const beforeIds = eligible(before.value), afterIds = eligible(after.value);
  if (!Object.keys(oldContext.value.materials).every(id => beforeIds.has(id)) ||
      !Object.keys(context.value.materials).every(id => afterIds.has(id)) ||
      ![...afterIds.keys()].every(id => own(context.value.materials, id)) ||
      !Object.entries(oldContext.value.materials).every(([id, material]) => same(material, context.value.materials[id]))) return state;
  if (nextProgress === expectedProgress && nextContext === expectedContext) return state;
  const next = replaceSampleProgress(state, expectedProgress, nextProgress, now);
  if (next === state) return state;
  return nextContext === undefined ? next : {...next, drafts: {...next.drafts, [tableContextKey]: nextContext}};
}
