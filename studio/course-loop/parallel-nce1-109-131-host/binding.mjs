/** Actual integration registry and factory only; old54 fixtures are retained. */
import {getCourseBinding,registeredCourseIds} from '../registry.mjs';
import {fixtureForId as existingFixture,productionHost} from '../parallel-nce1-085-107-host/binding.mjs';
import {arrived,baseIds} from './preflight-binding.mjs';
export {productionHost,baseIds};export const supportedCourseIds=registeredCourseIds;
export const newIds=Object.freeze(arrived.map(c=>c.lesson.id));
const contents=new Map(arrived.map(c=>[c.lesson.id,c]));
export async function fixtureForId(id){const b=getCourseBinding(id);if(baseIds.includes(id))return existingFixture(id);const content=contents.get(id);if(!content)throw Error('Missing full frozen content fixture '+id);return {model:b.model,content,keys:{snapshot:b.key,inputs:b.inputsKey},provenance:{binding:'actual registry with complete content namespace and local matches'}};}
