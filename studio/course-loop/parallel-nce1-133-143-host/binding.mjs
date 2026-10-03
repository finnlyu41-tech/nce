/** Actual registry and unchanged production factory; prior66 fixtures retained. */
import {getCourseBinding,registeredCourseIds} from '../registry.mjs';
import {fixtureForId as existingFixture,productionHost} from '../parallel-nce1-109-131-host/binding.mjs';
import * as c133 from '../parallel-nce1-133-143/lesson-nce1-133.mjs';
import * as c135 from '../parallel-nce1-133-143/lesson-nce1-135.mjs';
import * as c137 from '../parallel-nce1-133-143/lesson-nce1-137.mjs';
import * as c139 from '../parallel-nce1-133-143/lesson-nce1-139.mjs';
import * as c141 from '../parallel-nce1-133-143/lesson-nce1-141.mjs';
import * as c143 from '../parallel-nce1-133-143/lesson-nce1-143.mjs';
export {productionHost};
export const supportedCourseIds=registeredCourseIds;
export const baseIds=Object.freeze(Array.from({length:66},(_,i)=>'nce1-'+(i*2+1)));
const arrived=[c133,c135,c137,c139,c141,c143];
export const newIds=Object.freeze(arrived.map(c=>c.lesson.id));
const contents=new Map(arrived.map(c=>[c.lesson.id,c]));
export async function fixtureForId(id){const b=getCourseBinding(id);if(baseIds.includes(id))return existingFixture(id);const content=contents.get(id);if(!content)throw Error('Missing frozen content '+id);return {model:b.model,content,keys:{snapshot:b.key,inputs:b.inputsKey},provenance:{binding:'actual registry, complete content namespace and local matches'}};}
