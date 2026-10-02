import type {
  TableAnswerAction, TableAnswerActionResult, TableBlankCoordinate, TableCellCoordinate,
  TableCell, TableProjectionResult, TableStimulus, TableValidationExpectation, TableValidationIssue,
} from './types';
import {validateTableStimulus} from './validation';

/** Existing host save capacity, not an official answer word limit. Never silently truncate. */
export const TABLE_ANSWER_MAX_LENGTH = 500;

/** Preserve declared row/column order and every authored string. No state or DOM is involved. */
export function projectTableStimulus(value: unknown, expected?: TableValidationExpectation): TableProjectionResult {
  const issues = validateTableStimulus(value, expected);
  if (issues.length) return {ok: false, issues};
  const original = value as TableStimulus;
  const copyCell = (cell: TableCell): TableCell => cell.kind === 'text' ? {kind: 'text', text: cell.text} : {
    kind: 'blank', questionId: cell.questionId, questionNumber: cell.questionNumber,
    ...(Object.prototype.hasOwnProperty.call(cell, 'before') ? {before: cell.before} : {}),
    ...(Object.prototype.hasOwnProperty.call(cell, 'after') ? {after: cell.after} : {}),
  };
  const stimulus: TableStimulus = {
    version: original.version, kind: original.kind, id: original.id, caption: original.caption,
    instruction: original.instruction, rowHeaderLabel: original.rowHeaderLabel,
    columns: original.columns.map(column => ({id: column.id, label: column.label})),
    rows: original.rows.map(row => ({id: row.id, label: row.label,
      cells: Object.fromEntries(original.columns.map(column => [column.id, copyCell(row.cells[column.id])])),
    })),
  };
  const coordinates: TableCellCoordinate[] = [], blanks: TableBlankCoordinate[] = [];
  const byQuestionId: Record<string, TableBlankCoordinate> = Object.create(null);
  stimulus.rows.forEach((row, rowIndex) => stimulus.columns.forEach((column, columnIndex) => {
    const cell = row.cells[column.id];
    const coordinate: TableCellCoordinate = {rowIndex, columnIndex, rowId: row.id, columnId: column.id, rowLabel: row.label, columnLabel: column.label, cell};
    coordinates.push(coordinate);
    if (cell.kind === 'blank') {
      const blank: TableBlankCoordinate = {...coordinate, cell, blankIndex: blanks.length};
      blanks.push(blank); byQuestionId[cell.questionId] = blank;
    }
  }));
  return {ok: true, projection: {stimulus, coordinates, blanks, byQuestionId}};
}

/** Adapt only the existing answer/correction actions after checking this table's ownership. */
export function adaptTableAnswerAction(stimulus: unknown, value: unknown): TableAnswerActionResult {
  const projected = projectTableStimulus(stimulus);
  const fail = (issues: TableValidationIssue[]): TableAnswerActionResult => ({ok: false, issues, reason: issues[0].message});
  if (!projected.ok) return fail(projected.issues);
  if (!value || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) {
    return fail([{path: 'action', message: 'A plain answer action is required.'}]);
  }
  const descriptors = Object.getOwnPropertyDescriptors(value), keys = Reflect.ownKeys(value);
  if (keys.length !== 3 || keys.some(key => typeof key !== 'string' || !['type', 'questionId', 'value'].includes(key)) ||
      ['type', 'questionId', 'value'].some(key => !Object.prototype.hasOwnProperty.call(descriptors, key) || !Object.prototype.hasOwnProperty.call(descriptors[key], 'value'))) {
    return fail([{path: 'action', message: 'Answer actions require exactly type, questionId and raw value; future fields cannot be discarded.'}]);
  }
  const action = value as Record<string, unknown>;
  if (action.type !== 'answer' && action.type !== 'correction-answer') return fail([{path: 'action.type', message: 'This table accepts only answer or correction-answer actions.'}]);
  if (typeof action.questionId !== 'string' || !Object.prototype.hasOwnProperty.call(projected.projection.byQuestionId, action.questionId)) {
    return fail([{path: 'action.questionId', message: 'This question ID does not belong to a blank in this table.'}]);
  }
  if (typeof action.value !== 'string') return fail([{path: 'action.value', message: 'A raw string answer is required; values are not converted.'}]);
  if (action.value.length > TABLE_ANSWER_MAX_LENGTH) return fail([{path: 'action.value', message: 'This answer exceeds the existing 500-character save limit. Keep the unchanged answer; it has not been saved.'}]);
  const accepted: TableAnswerAction = {type: action.type, questionId: action.questionId, value: action.value};
  return {ok: true, action: accepted};
}
