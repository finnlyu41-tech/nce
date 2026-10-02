'use client';
import {useId, useRef, type CSSProperties, type FocusEvent} from 'react';
import type {TableAnswers, TableStimulus} from './types';
import {projectTableStimulus} from './projection';
import './table-stimulus.css';

export type TableStimulusViewProps = {
  stimulus: TableStimulus; answers: TableAnswers;
  onAnswer?: (questionId: string, raw: string) => void; readOnly?: boolean; idPrefix?: string;
};

/** A controlled task view. The host alone chooses when answers/references may be supplied. */
export function TableStimulusView({stimulus, answers, onAnswer, readOnly = false, idPrefix}: TableStimulusViewProps) {
  const generatedId = useId(), viewport = useRef<HTMLDivElement>(null);
  const prefix = idPrefix ?? `ielts-table-${generatedId}`;
  const result = projectTableStimulus(stimulus);
  const invalidPrefix = typeof prefix !== 'string' || !prefix || /\s/.test(prefix);
  const invalidAnswers = !answers || typeof answers !== 'object' || Array.isArray(answers) ||
    ![Object.prototype, null].includes(Object.getPrototypeOf(answers)) ||
    Reflect.ownKeys(answers).some(key => typeof key !== 'string' ||
      !Object.prototype.hasOwnProperty.call(Object.getOwnPropertyDescriptor(answers, key)!, 'value') ||
      typeof answers[key] !== 'string' || !result.ok || !Object.prototype.hasOwnProperty.call(result.projection.byQuestionId, key));
  if (!result.ok || invalidPrefix || invalidAnswers) return <div className="ielts-table-stimulus" role="alert">This table cannot be displayed. Its task data needs to be checked.</div>;
  const instructionId = `${prefix}-instruction`, captionId = `${prefix}-caption`;
  const effectiveReadOnly = readOnly || !onAnswer;
  const rowId = (index: number) => `${prefix}-row-${index}`;
  const columnId = (index: number) => `${prefix}-column-${index}`;
  const keepFocusVisible = (event: FocusEvent<HTMLInputElement>) => {
    const scroller = viewport.current;
    if (!scroller) return;
    const bounds = scroller.getBoundingClientRect(), inputBounds = event.currentTarget.getBoundingClientRect();
    const rowHeader = event.currentTarget.closest('tr')?.querySelector<HTMLTableCellElement>('th[scope="row"]');
    const left = bounds.left + (rowHeader?.getBoundingClientRect().width || 0) + 8, right = bounds.right - 8;
    if (inputBounds.left < left) scroller.scrollLeft += inputBounds.left - left;
    else if (inputBounds.right > right) scroller.scrollLeft += inputBounds.right - right;
  };
  const style = {'--ielts-table-data-columns': stimulus.columns.length} as CSSProperties;
  return <section className="ielts-table-stimulus" data-table-id={stimulus.id} aria-labelledby={captionId} style={style}>
    <p id={instructionId} className="ielts-table-stimulus__instruction">{stimulus.instruction}</p>
    <div ref={viewport} className="ielts-table-stimulus__viewport" role="region" aria-labelledby={captionId} aria-describedby={instructionId} tabIndex={0}>
      <table className="ielts-table-stimulus__table" aria-describedby={instructionId}>
        <caption id={captionId}>{stimulus.caption}</caption>
        <thead><tr>
          <th className="ielts-table-stimulus__corner" scope="col" id={`${prefix}-row-heading`}>{stimulus.rowHeaderLabel}</th>
          {stimulus.columns.map((column, index) => <th key={column.id} scope="col" id={columnId(index)}>{column.label}</th>)}
        </tr></thead>
        <tbody>{stimulus.rows.map((row, rowIndex) => <tr key={row.id}>
          <th scope="row" id={rowId(rowIndex)}>{row.label}</th>
          {stimulus.columns.map((column, columnIndex) => {
            const cell = row.cells[column.id];
            if (cell.kind === 'text') return <td key={column.id} headers={`${rowId(rowIndex)} ${columnId(columnIndex)}`}>{cell.text}</td>;
            const blank = result.projection.byQuestionId[cell.questionId], inputId = `${prefix}-answer-${blank.blankIndex}`, numberId = `${inputId}-number`;
            const raw = Object.prototype.hasOwnProperty.call(answers, cell.questionId) ? answers[cell.questionId] : '';
            const beforeId = cell.before !== undefined ? `${inputId}-before` : undefined;
            const afterId = cell.after !== undefined ? `${inputId}-after` : undefined;
            const descriptionIds = [instructionId, beforeId, afterId].filter(id => id !== undefined).join(' ');
            return <td key={column.id} headers={`${rowId(rowIndex)} ${columnId(columnIndex)}`}>
              {cell.before !== undefined && <span id={beforeId} className="ielts-table-stimulus__surrounding">{cell.before}</span>}
              <span id={numberId} className="ielts-table-stimulus__number">Question {cell.questionNumber}</span>
              <input id={inputId} className="ielts-table-stimulus__answer" type="text" value={raw}
                data-question-id={cell.questionId} data-question-number={cell.questionNumber}
                readOnly={effectiveReadOnly} autoComplete="off" autoCapitalize="off" spellCheck={false}
                aria-labelledby={`${numberId} ${rowId(rowIndex)} ${columnId(columnIndex)}`} aria-describedby={descriptionIds}
                onFocus={keepFocusVisible} onChange={event => {if (!effectiveReadOnly) onAnswer?.(cell.questionId, event.currentTarget.value);}}/>
              {cell.after !== undefined && <span id={afterId} className="ielts-table-stimulus__surrounding">{cell.after}</span>}
            </td>;
          })}
        </tr>)}</tbody>
      </table>
    </div>
  </section>;
}
