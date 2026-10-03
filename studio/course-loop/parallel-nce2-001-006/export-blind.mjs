// Exports stems only. A separate reviewer must not read modules or answer keys.
import {writeFile} from 'node:fs/promises';
const range=process.argv[2];
const sets={'001-003':[1,2,3],'004-006':[4,5,6]};
if(!sets[range])throw Error('Choose one complete three-course range.');
const groups=[];
for(const n of sets[range]){
 const c=await import(`./lesson-nce2-${String(n).padStart(3,'0')}.mjs`);
 if(c.questions.length!==18)throw Error('Incomplete source content.');
 groups.push({courseId:c.lesson.id,scope:c.lesson.scope,questions:c.questions.map(({id,context,prompt,options})=>({id,context,prompt,...(options?{options}: {})}))});
}
await writeFile(new URL(`../../docs/parallel-nce2-001-006/blind-prompts-${range}.json`,import.meta.url),JSON.stringify(groups,null,2)+'\n');
