/** Public task data only. Answers, references and teaching models belong to the host. */
export type TableTextCell = {kind: 'text'; text: string};
export type TableBlankCell = {
  kind: 'blank'; questionId: string; questionNumber: number; before?: string; after?: string;
};
export type TableCell = TableTextCell | TableBlankCell;
export type TableColumn = {id: string; label: string};
export type TableRow = {id: string; label: string; cells: Readonly<Record<string, TableCell>>};
export type TableStimulus = {
  version: 1; kind: 'table-completion'; id: string; caption: string; instruction: string;
  rowHeaderLabel: string; columns: readonly TableColumn[]; rows: readonly TableRow[];
};
export type TableAnswers = Readonly<Record<string, string>>;
export type TableValidationIssue = {path: string; message: string};
export type TableValidationExpectation = {
  rowCount?: number;
  /** Data columns only; rendering adds a separate row-header column. */
  columnCount?: number;
  blankCount?: number;
  questions?: readonly {id: string; questionNumber: number}[];
};
export type TableCellCoordinate = {
  rowIndex: number; columnIndex: number; rowId: string; columnId: string;
  rowLabel: string; columnLabel: string; cell: TableCell;
};
export type TableBlankCoordinate = Omit<TableCellCoordinate, 'cell'> & {
  cell: TableBlankCell; blankIndex: number;
};
export type TableProjection = {
  stimulus: TableStimulus;
  coordinates: readonly TableCellCoordinate[]; blanks: readonly TableBlankCoordinate[];
  byQuestionId: Readonly<Record<string, TableBlankCoordinate>>;
};
export type TableProjectionResult =
  | {ok: true; projection: TableProjection}
  | {ok: false; issues: TableValidationIssue[]};
/** These are the host's existing actions, not a new persistence format. */
export type TableAnswerAction =
  | {type: 'answer'; questionId: string; value: string}
  | {type: 'correction-answer'; questionId: string; value: string};
export type TableAnswerActionResult =
  | {ok: true; action: TableAnswerAction}
  | {ok: false; issues: TableValidationIssue[]; reason: string};
