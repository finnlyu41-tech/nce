import reference from './data/grammar-curriculum/depth-remaining/reference-ownership.json';
import descriptions from './data/grammar-curriculum/depth-remaining/basic-descriptions.json';
import directions from './data/grammar-curriculum/depth-remaining/giving-directions.json';
import perspective from './data/grammar-curriculum/depth-remaining/time-perspective.json';
import habits from './data/grammar-curriculum/depth-remaining/habit-change.json';
import vocabulary from './data/grammar-curriculum/depth-remaining/linked-vocabulary.json';
import future from './data/grammar-curriculum/depth-remaining/extended-timeline.json';
import duration from './data/grammar-curriculum/depth-remaining/duration-perspective.json';
import nonfinite from './data/grammar-curriculum/depth-remaining/requests-nonfinite.json';
import rewrite from './data/grammar-curriculum/depth-remaining/structure-rewrite.json';
import type {GrammarUnit} from './grammar-curriculum-types';

// Independent authored delta. Only the release owner registers these units in
// the production curriculum after the complete integration gate passes.
export const grammarRemainingUnits=[reference,descriptions,directions,perspective,habits,vocabulary,future,duration,nonfinite,rewrite] as GrammarUnit[];
