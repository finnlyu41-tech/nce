import past from './data/grammar-curriculum/depth-clauses/past-background.json';
import modals from './data/grammar-curriculum/depth-clauses/modal-evidence.json';
import relative from './data/grammar-curriculum/depth-clauses/relative-reference.json';
import conditions from './data/grammar-curriculum/depth-clauses/hypothetical-condition.json';
import focus from './data/grammar-curriculum/depth-clauses/information-focus.json';
import type {GrammarUnit} from './grammar-curriculum-types';

// Independent content package. The production catalog remains unchanged until
// the release owner registers this batch after reviewing the integration notes.
export const grammarClauseUnits=[past,modals,relative,conditions,focus] as GrammarUnit[];
