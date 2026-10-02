// Exports stems only. A separate reviewer must not read modules or answer keys.
import {writeFile} from 'node:fs/promises';
const range=process.argv[2];
const sets={'085-089':[85,87,89],'091-095':[91,93,95]};
if(!sets[range])throw Error('Choose one complete three-course range.');
const groups=[];
for(const n of sets[range]){
 const c=await import(`./lesson-nce1-${String(n).padStart(3,'0')}.mjs`);
 if(c.questions.length!==18)throw Error('Incomplete source content.');
 groups.push({courseId:c.lesson.id,scope:c.lesson.scope,questions:c.questions.map(({id,context,prompt})=>({id,context,prompt}))});
}
await writeFile(new URL(`../../docs/parallel-nce1-085-095/blind-prompts-${range}.json`,import.meta.url),JSON.stringify(groups,null,2)+'\n');
