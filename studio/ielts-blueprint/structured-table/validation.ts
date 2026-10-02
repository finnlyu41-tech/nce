import type {TableValidationExpectation, TableValidationIssue} from './types';

const own = (value: object, key: PropertyKey) => Object.prototype.hasOwnProperty.call(value, key);
const nonempty = (value: unknown): value is string => typeof value === 'string' && !!value.trim();
const positive = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) > 0;
const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value) &&
  [Object.prototype, null].includes(Object.getPrototypeOf(value));

/** Validate without replacing missing fields, dropping future fields or altering authored strings. */
export function validateTableStimulus(value: unknown, expected?: TableValidationExpectation): TableValidationIssue[] {
  const issues: TableValidationIssue[] = [];
  const fail = (path: string, message: string) => {issues.push({path, message});};
  const dataRecord = (item: unknown, at: string): item is Record<string, unknown> => {
    if (!record(item)) {fail(at, 'Expected a plain data object.'); return false;}
    let safe = true;
    for (const key of Reflect.ownKeys(item)) {
      if (typeof key !== 'string') {fail(at, 'Symbol fields are not supported.'); safe = false; continue;}
      const descriptor = Object.getOwnPropertyDescriptor(item, key)!;
      if (!own(descriptor, 'value')) {fail(`${at}.${key}`, 'Accessor fields are not supported.'); safe = false;}
    }
    return safe;
  };
  const exact = (item: unknown, required: readonly string[], optional: readonly string[], at: string): item is Record<string, unknown> => {
    if (!dataRecord(item, at)) return false;
    let valid = true;
    for (const key of Object.getOwnPropertyNames(item)) if (![...required, ...optional].includes(key)) {
      fail(`${at}.${key}`, 'Unknown field; this data version cannot discard it.'); valid = false;
    }
    for (const key of required) if (!own(item, key)) {fail(`${at}.${key}`, 'Required field is missing.'); valid = false;}
    return valid;
  };
  const array = (item: unknown, at: string): item is unknown[] => {
    if (!Array.isArray(item) || Object.getPrototypeOf(item) !== Array.prototype) {
      fail(at, 'Expected a plain array.'); return false;
    }
    let valid = true;
    for (const key of Reflect.ownKeys(item)) {
      if (key === 'length') continue;
      if (typeof key !== 'string' || !/^(0|[1-9]\d*)$/.test(key) || Number(key) >= item.length) {
        fail(at, 'Unknown array fields are not supported.'); valid = false; continue;
      }
      if (!own(Object.getOwnPropertyDescriptor(item, key)!, 'value')) {
        fail(`${at}[${key}]`, 'Accessor entries are not supported.'); valid = false;
      }
    }
    for (let index = 0; index < item.length; index++) if (!own(item, index)) {
      fail(`${at}[${index}]`, 'Missing array entries are not supported.'); valid = false;
    }
    return valid;
  };
  const requireText = (item: unknown, at: string) => {if (!nonempty(item)) fail(at, 'A nonempty string is required.');};

  if (!exact(value, ['version', 'kind', 'id', 'caption', 'instruction', 'rowHeaderLabel', 'columns', 'rows'], [], 'stimulus')) return issues;
  if (value.version !== 1) fail('stimulus.version', 'Unsupported table version; only version 1 can be read.');
  if (value.kind !== 'table-completion') fail('stimulus.kind', 'Expected table-completion data.');
  for (const key of ['id', 'caption', 'instruction', 'rowHeaderLabel']) requireText(value[key], `stimulus.${key}`);

  const columnIds: string[] = [], columnSet = new Set<string>(), rowIds = new Set<string>();
  const questions = new Map<string, number>(), numbers = new Set<number>();
  const columns = value.columns, rows = value.rows;
  let columnCount = -1, rowCount = -1;
  if (array(columns, 'stimulus.columns')) {
    columnCount = columns.length;
    if (!columns.length) fail('stimulus.columns', 'At least one data column is required.');
    columns.forEach((column, index) => {
      const at = `stimulus.columns[${index}]`;
      if (!exact(column, ['id', 'label'], [], at)) return;
      requireText(column.id, `${at}.id`); requireText(column.label, `${at}.label`);
      if (nonempty(column.id)) {
        if (columnSet.has(column.id)) fail(`${at}.id`, 'Data column IDs must be unique.');
        columnIds.push(column.id); columnSet.add(column.id);
      }
    });
  }
  if (array(rows, 'stimulus.rows')) {
    rowCount = rows.length;
    if (!rows.length) fail('stimulus.rows', 'At least one labelled row is required.');
    rows.forEach((row, rowIndex) => {
      const at = `stimulus.rows[${rowIndex}]`;
      if (!exact(row, ['id', 'label', 'cells'], [], at)) return;
      requireText(row.id, `${at}.id`); requireText(row.label, `${at}.label`);
      if (nonempty(row.id)) {
        if (rowIds.has(row.id)) fail(`${at}.id`, 'Row IDs must be unique.');
        rowIds.add(row.id);
      }
      if (!dataRecord(row.cells, `${at}.cells`)) return;
      for (const key of Object.getOwnPropertyNames(row.cells)) if (!columnSet.has(key)) {
        fail(`${at}.cells.${key}`, 'Cell has no matching data column.');
      }
      for (const columnId of columnIds) {
        const cellAt = `${at}.cells.${columnId}`;
        if (!own(row.cells, columnId)) {fail(cellAt, 'Every row needs an explicit cell for every data column.'); continue;}
        const cell = row.cells[columnId];
        if (!dataRecord(cell, cellAt)) continue;
        if (cell.kind === 'text') {
          if (exact(cell, ['kind', 'text'], [], cellAt) && typeof cell.text !== 'string') fail(`${cellAt}.text`, 'Cell text must be a string.');
        } else if (cell.kind === 'blank') {
          if (!exact(cell, ['kind', 'questionId', 'questionNumber'], ['before', 'after'], cellAt)) continue;
          requireText(cell.questionId, `${cellAt}.questionId`);
          if (!positive(cell.questionNumber)) fail(`${cellAt}.questionNumber`, 'Question numbers must be positive safe integers.');
          for (const key of ['before', 'after']) if (own(cell, key) && typeof cell[key] !== 'string') fail(`${cellAt}.${key}`, 'Supplied surrounding text must be a string.');
          if (nonempty(cell.questionId)) {
            if (questions.has(cell.questionId)) fail(`${cellAt}.questionId`, 'Each question ID must occupy exactly one cell.');
            if (positive(cell.questionNumber)) questions.set(cell.questionId, cell.questionNumber);
          }
          if (positive(cell.questionNumber)) {
            if (numbers.has(cell.questionNumber)) fail(`${cellAt}.questionNumber`, 'Printed question numbers must be unique.');
            numbers.add(cell.questionNumber);
          }
        } else fail(`${cellAt}.kind`, 'Unsupported cell kind; cell data cannot be inferred.');
      }
    });
  }
  if (!questions.size) fail('stimulus.rows', 'At least one explicitly mapped question blank is required.');

  if (expected !== undefined && exact(expected, [], ['rowCount', 'columnCount', 'blankCount', 'questions'], 'expected')) {
    for (const key of ['rowCount', 'columnCount', 'blankCount'] as const) if (own(expected, key)) {
      if (!positive(expected[key])) fail(`expected.${key}`, 'Expected counts must be positive safe integers.');
      else {
        const actual = key === 'rowCount' ? rowCount : key === 'columnCount' ? columnCount : questions.size;
        if (actual !== expected[key]) fail(`stimulus.${key}`, 'Table dimensions or question count do not match the host contract.');
      }
    }
    if (own(expected, 'questions') && array(expected.questions, 'expected.questions')) {
      const expectedIds = new Set<string>(), expectedNumbers = new Set<number>();
      for (const [index, question] of expected.questions.entries()) {
        const at = `expected.questions[${index}]`;
        if (!exact(question, ['id', 'questionNumber'], [], at)) continue;
        if (!nonempty(question.id) || !positive(question.questionNumber)) {fail(at, 'Expected question IDs and numbers must be explicit.'); continue;}
        if (expectedIds.has(question.id) || expectedNumbers.has(question.questionNumber)) fail(at, 'Expected question IDs and numbers must be unique.');
        expectedIds.add(question.id); expectedNumbers.add(question.questionNumber);
        if (questions.get(question.id) !== question.questionNumber) fail(at, 'Question ID and printed number do not map to the expected table cell.');
      }
      if (questions.size !== expectedIds.size || [...questions.keys()].some(id => !expectedIds.has(id))) fail('stimulus.rows', 'Table blanks must match the complete expected question set.');
    }
  }
  return issues;
}
