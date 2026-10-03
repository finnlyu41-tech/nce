// Exports stems only. A separate reviewer must not read modules or answer keys.
import {writeFile} from 'node:fs/promises';
const range=process.argv[2];
const sets={'109-113':[109,111,113],'115-119':[115,117,119]};
if(!sets[range])throw Error('Choose one complete three-course range.');
const groups=[];
for(const n of sets[range]){
 const c=await import(`./lesson-nce1-${String(n).padStart(3,'0')}.mjs`);
 if(c.questions.length!==18)throw Error('Incomplete source content.');
 groups.push({courseId:c.lesson.id,scope:c.lesson.scope,questions:c.questions.map(({id,context,prompt})=>({id,context,prompt}))});
}
await writeFile(new URL(`../../docs/parallel-nce1-109-119/blind-prompts-${range}.json`,import.meta.url),JSON.stringify(groups,null,2)+'\n');
