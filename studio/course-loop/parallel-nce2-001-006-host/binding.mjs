/** Actual production registry/model, full frozen namespaces. */
import {getCourseBinding,registeredCourseIds} from '../registry.mjs';
import {fixtureForId as existingFixture,productionHost} from '../parallel-nce1-133-143-host/binding.mjs';
import * as c1 from '../parallel-nce2-001-006/lesson-nce2-001.mjs';
import * as c2 from '../parallel-nce2-001-006/lesson-nce2-002.mjs';
import * as c3 from '../parallel-nce2-001-006/lesson-nce2-003.mjs';
import * as c4 from '../parallel-nce2-001-006/lesson-nce2-004.mjs';
import * as c5 from '../parallel-nce2-001-006/lesson-nce2-005.mjs';
import * as c6 from '../parallel-nce2-001-006/lesson-nce2-006.mjs';
export {productionHost};export const supportedCourseIds=registeredCourseIds;
export const baseIds=Object.freeze(Array.from({length:72},(_,i)=>'nce1-'+(i*2+1)));
const arrived=[c1,c2,c3,c4,c5,c6];export const newIds=Object.freeze(arrived.map(c=>c.lesson.id));
const contents=new Map(arrived.map(c=>[c.lesson.id,c]));
export async function fixtureForId(id){const b=getCourseBinding(id);if(baseIds.includes(id))return existingFixture(id);const content=contents.get(id);if(!content)throw Error('Missing full frozen content '+id);return {model:b.model,content,keys:{snapshot:b.key,inputs:b.inputsKey},provenance:{binding:'actual registry namespace and local matches'}};}
