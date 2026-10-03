/** Arrived frozen candidates only. This is not production registration. */
import * as c109 from '../parallel-nce1-109-119/lesson-nce1-109.mjs';
import * as c111 from '../parallel-nce1-109-119/lesson-nce1-111.mjs';
import * as c113 from '../parallel-nce1-109-119/lesson-nce1-113.mjs';
import * as c115 from '../parallel-nce1-109-119/lesson-nce1-115.mjs';
import * as c117 from '../parallel-nce1-109-119/lesson-nce1-117.mjs';
import * as c119 from '../parallel-nce1-109-119/lesson-nce1-119.mjs';
import * as c121 from '../parallel-nce1-121-131/lesson-nce1-121.mjs';
import * as c123 from '../parallel-nce1-121-131/lesson-nce1-123.mjs';
import * as c125 from '../parallel-nce1-121-131/lesson-nce1-125.mjs';
import * as c127 from '../parallel-nce1-121-131/lesson-nce1-127.mjs';
import * as c129 from '../parallel-nce1-121-131/lesson-nce1-129.mjs';
import * as c131 from '../parallel-nce1-121-131/lesson-nce1-131.mjs';
export const arrived=Object.freeze([c109,c111,c113,c115,c117,c119,c121,c123,c125,c127,c129,c131]);
export const arrivedIds=Object.freeze(arrived.map(c=>c.lesson.id));
export const baseIds=Object.freeze(Array.from({length:54},(_,i)=>'nce1-'+(2*i+1)));
export const pendingIds=Object.freeze([]);
export {productionHost} from '../parallel-nce1-061-083-host/binding.mjs';
