// Exercise the unchanged production Today scheduler with real CL states.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../../',import.meta.url),m=await import(new URL('work/mini-batch04/model.mjs',root)),f=JSON.parse(await readFile(new URL('work/mini-batch04/fixtures.json',root),'utf8')),now=Date.now(),base=m.courseLoopBindings.find(b=>b.id==='nce1-1'),next=m.courseLoopBindings.find(b=>b.id==='nce1-37'),cases=[];
for(const kind of ['repair','resume','review']){
 const s=structuredClone(m.initial),ready=next.model.transition(f.loops[next.id],{type:'finish'},now-1000);assert(ready.ok);s.drafts[next.key]=JSON.stringify(ready.state);let saved;
 if(kind==='repair'){const g=m.grammarProof,u=m.grammarCurriculum.grammarUnits[0],p={...g.emptyGrammarProgress(),attempts:[{at:now-1000,round:0,variant:0,passed:false,independent:true}]};s.drafts[g.grammarProgressKey(u.id)]=JSON.stringify(p)}
 else if(kind==='review'){const r=base.model.transition(f.loops[base.id],{type:'finish'},now-2*m.DAY);assert(r.ok);saved=r.state}
 else saved=base.model.initialState(now-1000);
 if(saved)s.drafts[base.key]=JSON.stringify(saved);const map=m.emptyProgress(),before=JSON.stringify({s,map}),out=m.todayPractice(s,map,now,true),mini=out.find(t=>t.id==='mini-task:NCE1-37'),original=out.find(t=>t.id===(kind==='repair'?'grammar:'+m.grammarCurriculum.grammarUnits[0].id:'course-loop:nce1-1'));assert(original&&mini);assert.equal(original.kind,kind);assert(original.priority<mini.priority);assert(out.indexOf(original)<out.indexOf(mini));assert.equal(mini.priority,3.5);assert.equal(out.filter(t=>t.href===mini.href).length,1);assert(out.filter(t=>t.kind==='course').every(t=>out.indexOf(t)>out.indexOf(mini)));assert.equal(JSON.stringify({s,map}),before);cases.push({kind,originalPriority:original.priority,miniPriority:mini.priority,uniqueMini:true,readOnly:true})
}
await writeFile(new URL('work/mini-batch04/today-mini-priority.json',root),JSON.stringify({unchangedPublishedScheduler:true,cases},null,2)+'\n');console.log('PASS actual Today: repair/resume/due ahead of new mini; unique group identity, course fallback after, no mutations');
