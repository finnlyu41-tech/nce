import type {TableStimulus} from '../../structured-table/types';

const instruction = 'Complete the table below. Choose NO MORE THAN TWO WORDS from the text for each answer.';

export const academicTableStimuli: readonly TableStimulus[] = [
  {
    version: 1, kind: 'table-completion', id: 'ielts-r12-a-model',
    caption: 'Aids used in a tidal-pool study', instruction, rowHeaderLabel: 'Aid',
    columns: [{id: 'purpose', label: 'Purpose'}, {id: 'detail', label: 'Design detail'}],
    rows: [
      {id: 'viewing-hood', label: 'Viewing hood', cells: {
        purpose: {kind: 'blank', questionId: 'ielts-r12-a-model-q1', questionNumber: 1, before: 'Reduces ', after: ' on the water'},
        detail: {kind: 'text', text: 'Open at the bottom'},
      }},
      {id: 'marker-hoop', label: 'Marker hoop', cells: {
        purpose: {kind: 'text', text: 'Marks the same observation area'},
        detail: {kind: 'blank', questionId: 'ielts-r12-a-model-q2', questionNumber: 2, before: 'Made from '},
      }},
      {id: 'sample-paddle', label: 'Sample paddle', cells: {
        purpose: {kind: 'blank', questionId: 'ielts-r12-a-model-q3', questionNumber: 3, before: 'Collects ', after: ' from the pool floor'},
        detail: {kind: 'text', text: 'A broad, shallow tip'},
      }},
    ],
  },
  {
    version: 1, kind: 'table-completion', id: 'ielts-r12-a-guided',
    caption: 'Objects in a plant-dye demonstration', instruction, rowHeaderLabel: 'Object',
    columns: [{id: 'role', label: 'Role'}, {id: 'detail', label: 'Practical detail'}],
    rows: [
      {id: 'demonstration-bowl', label: 'Demonstration bowl', cells: {
        role: {kind: 'text', text: 'Holds small batches of dye'},
        detail: {kind: 'blank', questionId: 'ielts-r12-a-guided-q1', questionNumber: 1, before: 'Lined with '},
      }},
      {id: 'drying-frame', label: 'Drying frame', cells: {
        role: {kind: 'blank', questionId: 'ielts-r12-a-guided-q2', questionNumber: 2, before: 'Holds samples made from '},
        detail: {kind: 'text', text: 'Beside an open window'},
      }},
      {id: 'reference-card', label: 'Reference card', cells: {
        role: {kind: 'text', text: 'Shows colour after drying'},
        detail: {kind: 'blank', questionId: 'ielts-r12-a-guided-q3', questionNumber: 3, before: 'Kept in '},
      }},
    ],
  },
  {
    version: 1, kind: 'table-completion', id: 'ielts-r12-a-independent',
    caption: 'Aids for documenting a stone inscription', instruction, rowHeaderLabel: 'Aid',
    columns: [{id: 'information', label: 'Information recorded'}, {id: 'condition', label: 'Use condition'}],
    rows: [
      {id: 'mirror-stand', label: 'Mirror stand', cells: {
        information: {kind: 'blank', questionId: 'ielts-r12-a-independent-q1', questionNumber: 1, before: 'Grooves are ', after: ' in depth'},
        condition: {kind: 'text', text: 'Light directed from the side'},
      }},
      {id: 'tracing-sheet', label: 'Tracing sheet', cells: {
        information: {kind: 'text', text: 'Outline of visible characters'},
        condition: {kind: 'blank', questionId: 'ielts-r12-a-independent-q2', questionNumber: 2, before: 'Applied only to a ', after: ' surface'},
      }},
      {id: 'comparison-prints', label: 'Comparison prints', cells: {
        information: {kind: 'text', text: 'Differences under contrasting light'},
        condition: {kind: 'blank', questionId: 'ielts-r12-a-independent-q3', questionNumber: 3, before: 'Laid '},
      }},
    ],
  },
  {
    version: 1, kind: 'table-completion', id: 'ielts-r12-a-timed',
    caption: 'Parts of a shadow-theatre display', instruction, rowHeaderLabel: 'Part',
    columns: [{id: 'role', label: 'Role'}, {id: 'construction', label: 'Construction or treatment'}],
    rows: [
      {id: 'cut-figure', label: 'Cut figure', cells: {
        role: {kind: 'text', text: 'Produces the moving silhouette'},
        construction: {kind: 'blank', questionId: 'ielts-r12-a-timed-q1', questionNumber: 1, before: 'Cut from '},
      }},
      {id: 'screen-panel', label: 'Screen panel', cells: {
        role: {kind: 'blank', questionId: 'ielts-r12-a-timed-q2', questionNumber: 2, before: 'Softens the ', after: ' from the lamp'},
        construction: {kind: 'text', text: 'Between lamp and audience'},
      }},
      {id: 'support-rail', label: 'Support rail', cells: {
        role: {kind: 'text', text: 'Guides the movement of the figure'},
        construction: {kind: 'blank', questionId: 'ielts-r12-a-timed-q3', questionNumber: 3, before: 'Rubbed with '},
      }},
    ],
  },
  {
    version: 1, kind: 'table-completion', id: 'ielts-r12-a-review-a',
    caption: 'Objects prepared for a bird-call exhibition', instruction, rowHeaderLabel: 'Object',
    columns: [{id: 'purpose', label: 'Purpose'}, {id: 'format', label: 'Storage or format'}],
    rows: [
      {id: 'field-reel', label: 'Field reel', cells: {
        purpose: {kind: 'text', text: 'Preserves the original recording'},
        format: {kind: 'blank', questionId: 'ielts-r12-a-review-a-q1', questionNumber: 1, before: 'Wrapped in '},
      }},
      {id: 'listening-copy', label: 'Listening copy', cells: {
        purpose: {kind: 'blank', questionId: 'ielts-r12-a-review-a-q2', questionNumber: 2, before: 'Clarifies the ', after: ' between calls'},
        format: {kind: 'text', text: 'A version prepared for visitors'},
      }},
      {id: 'index-card', label: 'Index card', cells: {
        purpose: {kind: 'text', text: 'Links the recording and its prepared version'},
        format: {kind: 'blank', questionId: 'ielts-r12-a-review-a-q3', questionNumber: 3, before: 'Written in '},
      }},
    ],
  },
  {
    version: 1, kind: 'table-completion', id: 'ielts-r12-a-review-b',
    caption: 'Preparing rock samples for a travelling exhibition', instruction, rowHeaderLabel: 'Stage',
    columns: [{id: 'task', label: 'Main task'}, {id: 'method', label: 'Handling method'}],
    rows: [
      {id: 'receiving-tray', label: 'Receiving tray', cells: {
        task: {kind: 'blank', questionId: 'ielts-r12-a-review-b-q1', questionNumber: 1, before: 'Removes ', after: ' carried with samples'},
        method: {kind: 'text', text: 'Gentle brushing'},
      }},
      {id: 'sorting-mat', label: 'Sorting mat', cells: {
        task: {kind: 'text', text: 'Separates pieces according to surface appearance'},
        method: {kind: 'blank', questionId: 'ielts-r12-a-review-b-q2', questionNumber: 2, before: 'Grouped '},
      }},
      {id: 'display-sleeve', label: 'Display sleeve', cells: {
        task: {kind: 'blank', questionId: 'ielts-r12-a-review-b-q3', questionNumber: 3, before: 'Prevents ', after: ' during transport'},
        method: {kind: 'text', text: 'A separate sleeve for each sample'},
      }},
    ],
  },
];
