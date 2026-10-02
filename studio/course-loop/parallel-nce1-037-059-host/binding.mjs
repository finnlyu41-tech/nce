/** Test-only fixture discovery; every model and parser is the real production host. */
import {getCourseBinding,registeredCourseIds} from '../registry.mjs';
import {fixtureForId as existingFixture,productionHost} from '../batch-01/production-test-binding.mjs';
export {productionHost};
export const supportedCourseIds=registeredCourseIds;
export async function fixtureForId(id){
 const binding=getCourseBinding(id),n=Number(id.slice(5));
 if(n<=35)return existingFixture(id);
 const paths={'nce1-37':'../parallel-nce1-037-047/lesson-nce1-037.mjs','nce1-39':'../parallel-nce1-037-047/lesson-nce1-039.mjs','nce1-41':'../parallel-nce1-037-047/lesson-nce1-041.mjs','nce1-43':'../parallel-nce1-037-047/lesson-nce1-043.mjs','nce1-45':'../parallel-nce1-037-047/lesson-nce1-045.mjs','nce1-47':'../parallel-nce1-037-047/lesson-nce1-047.mjs','nce1-49':'../parallel-nce1-049-059/lesson-nce1-049.mjs','nce1-51':'../parallel-nce1-049-059/lesson-nce1-051.mjs','nce1-53':'../parallel-nce1-049-059/lesson-nce1-053.mjs','nce1-55':'../parallel-nce1-049-059/lesson-nce1-055.mjs','nce1-57':'../parallel-nce1-049-059/lesson-nce1-057.mjs','nce1-59':'../parallel-nce1-049-059/lesson-nce1-059.mjs'};
 if(!paths[id])throw Error('No fixture for this registered course.');
 const content=await import(paths[id]);
 return {model:binding.model,content,keys:{snapshot:binding.key,inputs:binding.inputsKey},provenance:{binding:'actual production registry and local matcher'}};
}
