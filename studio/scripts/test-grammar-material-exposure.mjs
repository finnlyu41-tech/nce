import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {stripTypeScriptTypes} from 'node:module';
import ts from 'typescript';

// Source-driven loader: no user profile, generated assets, browser storage or clock.
const root=new URL('../app/',import.meta.url),cache=new Map();
async function moduleURL(name){
 if(cache.has(name))return cache.get(name);
 let source=await readFile(new URL(name,root),'utf8');
 for(const match of [...source.matchAll(/^import (?!type )(.+?) from '(\.\/.+?)';/gm)]){
  const dep=match[2].slice(2);
  if(dep.endsWith('.json'))source=source.replace(match[0],`const ${match[1]}=${await readFile(new URL(dep,root),'utf8')};`);
  else source=source.replaceAll("'"+match[2]+"'",JSON.stringify(await moduleURL(dep+'.ts')));
 }
 const url='data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64');cache.set(name,url);return url;
}
const {grammarUnits}=await import(await moduleURL('grammar-curriculum.ts'));
const progress=await import(await moduleURL('grammar-curriculum-progress.ts'));
const now=Date.parse('2026-10-01T12:00:00Z'),day=86400000;
function complete(unit,p,at,{wrong=false,hint=false,theory=false}={}){
 let n=progress.beginGrammarRound(p,unit);
 const qs=progress.grammarRoundQuestions(unit,n.round);
 if(hint)n=progress.showGrammarHint(n,unit,qs[0].id);
 if(theory)n=progress.revisitGrammarTheory(n);
 for(const [i,q] of qs.entries()){
  n=progress.setGrammarAnswer(n,unit,q.id,wrong&&i===0?'Wrong answer.':q.answer);
  n=progress.checkGrammarResponse(n,unit,q.id);
 }
 return progress.finishGrammarRound(n,unit,at);
}
const reload=(p,u)=>progress.readGrammarProgress(JSON.stringify(p),u);
let checks=0;
const verify=(p,result,message,at=now+40*day)=>{assert.equal(progress.delayedGrammarEvidence(p,at),result,message);checks++};
for(const unit of grammarUnits){
 const empty=progress.emptyGrammarProgress();
 assert(!progress.readGrammarProgress('',unit).materials.complete);
 assert(!progress.readGrammarProgress(JSON.stringify({...empty,materials:{complete:true,firstShown:[]}}),unit).materials.complete);
 const a=complete(unit,empty,now),b=complete(unit,a,now+day);
 verify(b,true,'First independent A then previously unseen B after real duration');
 assert.equal(progress.grammarProgressStatus(b,now+day),'延迟未见材料检验通过');
 verify(complete(unit,a,now+day-1),false,'24h minus 1ms');
 verify(b,false,'Future attempt cannot grant evidence',now+day-1);
 for(const help of [{hint:true},{theory:true}])verify(complete(unit,a,now+day,help),false,'Help cannot establish independent evidence');
 const failed=complete(unit,empty,now,{wrong:true});
 const freshB=complete(unit,failed,now+1000);
 const repeatedA=complete(unit,freshB,now+day+1000);
 verify(repeatedA,false,'Observed A failure -> B -> A is familiar review');
 assert.equal(progress.grammarProgressStatus(repeatedA,now+day+1000),'熟悉材料复习通过 · 待新材料');
 assert(progress.grammarMaterialNotice(repeatedA,unit).includes('待新材料'));
 assert.deepEqual(repeatedA.attempts.slice(0,2),freshB.attempts,'Original failures/grades/times survive');
 const missingAnchor={...a,attempts:a.attempts.map(({material,...attempt})=>attempt)};
 verify(complete(unit,missingAnchor,now+day),false,'Missing earlier material identity cannot anchor new evidence even before normalization');
 const old={...b};delete old.materials;old.attempts=old.attempts.map(({material,...a})=>a);
 const oldRaw=JSON.stringify(old),unknown=progress.readGrammarProgress(oldRaw,unit);
 verify(unknown,false,'Legacy history never implies unseen materials');
 assert.equal(JSON.stringify(old),oldRaw,'Reading does not rewrite old source');
 assert.deepEqual(unknown.attempts,old.attempts);
 assert(progress.grammarProgressStatus(unknown,now+day).includes('历史待核对'));
 verify(complete(unit,unknown,now+2*day),false,'Unknown history stays unknown after future rounds');
 assert(progress.grammarMaterialNotice(unknown,unit).includes('仍可继续'));
 let active=progress.beginGrammarRound(a,unit),q=progress.grammarRoundQuestions(unit,active.round)[0];
 active=progress.setGrammarAnswer(active,unit,q.id,q.answer);
 const restored=reload(active,unit);
 assert.deepEqual(restored,active,'Round, draft, grades and material history survive refresh');
 assert.equal(progress.beginGrammarRound(restored,unit),restored,'Resume does not reclassify material');
 verify(complete(unit,restored,now+day),true,'Resuming first presentation remains first presentation');
 const assisted=progress.showGrammarHint(restored,unit,q.id);
 const helped=complete(unit,reload(assisted,unit),now+day);
 verify(helped,false,'Help survives refresh');assert(!helped.attempts.at(-1).independent);
 let tail=repeatedA;
 for(let i=3;i<20;i++)tail=complete(unit,reload(tail,unit),now+i*day);
 assert.equal(tail.attempts.length,12);assert.equal(Object.keys(tail.materials.firstShown).length,6);
 verify(tail,false,'First exposure ledger survives 12-attempt truncation');
 assert.equal(progress.grammarMaterialNovelty(tail,unit),'familiar');
 const overlap={...unit,practices:unit.practices.map(q=>q.variant===1&&q.kind==='recognise'?{...unit.practices.find(q=>q.variant===0&&q.kind==='recognise'),variant:1}:q)};
 verify(complete(overlap,complete(overlap,empty,now),now+day),false,'One reused question makes alternate set familiar');
 const invalid={...empty,round:1,materials:{complete:true,firstShown:{}},attempts:[{at:0,round:0,variant:0,passed:false,independent:true}]};
 assert(!reload(invalid,unit).materials.complete,'Filtering malformed attempts cannot create unseen history');
 assert(!reload({...empty,round:1},unit).materials.complete,'Missing past rounds are unknown');
 const relabel={...overlap,practices:overlap.practices.map(q=>q.variant===1?{...q,id:q.id+'-renamed'}:q)};
 verify(complete(relabel,complete(relabel,empty,now),now+day),false,'Renaming reused material cannot make it unseen');
 const invented={...repeatedA,materials:{complete:true,firstShown:Object.fromEntries(Object.entries(repeatedA.materials.firstShown).map(([key])=>[key,2]))}};
 assert(!reload(invented,unit).materials.complete,'Fixed A/B material first shown in a later round is not complete history');
 const corrupt={...a,materials:{complete:true,firstShown:{bad:-1}}};
 verify(reload(corrupt,unit),false,'Corrupt/partial ledger is unknown');
 for(const q of unit.practices){assert(progress.grammarAnswerMatches(q,q.answer));for(const value of q.accepted||[])assert(progress.grammarAnswerMatches(q,value));}
}
const canonical=createHash('sha256').update(JSON.stringify(grammarUnits.flatMap(u=>u.practices.map(q=>[q.id,q.answer])))).digest('hex');
assert.equal(canonical,'0d0a0f94d8a72361e79c6730c88e6fe719da81b03dcaa52ba466ca8ca3d0fedc');
console.log(`Material exposure: ${grammarUnits.length} units, ${checks} boundary checks, 168 canonical and all accepted answers passed. Synthetic times only; no natural 24h claim.`);
