/** Narrow follow-up for the final six prompts; not a full content blind rerun. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import * as c from './lesson-nce1-005.mjs';
import {fixtureForId} from './model-fixture.mjs';
const original='754258c8436e2f403522b31dfe3035ad2a5dd9eb';
// Evaluate frozen content with its original binding module, only in memory.
const frozenSource=execFileSync('git',['show',`${original}:studio/course-loop/batch-01/lesson-nce1-005.mjs`],{encoding:'utf8'}).replace("from './content-contract.mjs'",`from '${new URL('./content-contract.mjs',import.meta.url).href}'`);
const old=await import(`data:text/javascript;base64,${Buffer.from(frozenSource).toString('base64')}`);
const q6=c.questions.filter(q=>q.target==='nationality');
for(const q of q6)test(`${q.id}: present affirmative frame; normal equivalents accepted, question/changed meaning rejected`,()=>{
 assert.match(q.prompt,/一般现在时肯定陈述句/);assert.match(q.prompt,/只用主语、be动词和这个国籍词/);
 const [full,short]=q.accepted,pronoun=full.startsWith('He')?'He':'She',word=full.split(' ')[2].replace('.','');
 for(const value of [full,short,short.replace("'",'’'),full.toUpperCase(),full.toLowerCase(),` \n${full.replaceAll(' ','   ')}\n `,full.replace('.','!'),full.replace('.','！'),full.replace('.','。')])assert.equal(c.matches(q,value),true,value);
 for(const value of [full.replace('.','?'),full.replace('.','？'),full.replace('.','﹖'),short.replace('.','?'),full.replace('.','?!'),full.replace(' is ',' was '),full.replace(' is ',' is not '),full.replace(' is ',' are '),`${pronoun==='He'?'She':'He'} is ${word}.`,`${pronoun} is ${word==='French'?'German':'French'}.`,`${pronoun} is of ${word} nationality.`,`${pronoun} is a ${word} ${pronoun==='He'?'man':'woman'}.`])assert.equal(c.matches(q,value),false,value);
 // Demonstrate the actual frozen bug and the narrow resulting behavior.
 assert.equal(old.matches(old.byId.get(q.id),full.replace('.','?')),true);
 assert.equal(c.matches(q,full.replace('.','?')),false);
});
test('unmodified tasks, answer keys and source references remain identical to frozen 754258c',()=>{
 assert.deepEqual(c.lesson.source,old.lesson.source);assert.deepEqual(c.questions.map(q=>[q.id,q.accepted]),old.questions.map(q=>[q.id,q.accepted]));
 for(const q of c.questions.filter(q=>q.target!=='nationality')){assert.deepEqual(q,old.byId.get(q.id));for(const value of [...q.accepted,'wrong',q.accepted[0]+'?'])assert.equal(c.matches(q,value),old.matches(old.byId.get(q.id),value))}
});
test('reported independent blind answers and common equivalents match the revised six tasks',async()=>{
 const report=JSON.parse(await readFile(new URL('../../docs/course-loop-batch-01-final-nationality-review.json',import.meta.url),'utf8'));
 assert.equal(report.sourceCommit,original);assert.equal(report.independentReview.questions.length,6);
 for(const row of report.independentReview.questions){const q=c.byId.get(row.id);assert.ok(c.matches(q,row.answer));for(const a of row.common_equivalents_within_instructions)assert.ok(c.matches(q,a));for(const row2 of [...row.meaning_changes,...row.valid_english_outside_limited_structure])assert.equal(c.matches(q,row2.example),false)}
});
test('selected-course reducer records a question as nonmatching original and routes to nationality teaching',async()=>{
 const {model}=await fixtureForId('nce1-5');let at=1790940000000,state=model.initialState(at);
 const send=action=>{const r=model.transition(state,action,++at);assert.ok(r.ok,r.message);state=r.state;return r.view};
 for(const q of c.questionsFor('diagnostic').slice(0,2)){send({type:'draft',value:q.accepted[0]});send({type:'submit'});send({type:'next'})}
 send({type:'draft',value:'He is German?'});const view=send({type:'submit'});
 assert.equal(view.attempts.at(-1).answer,'He is German?');assert.equal(view.attempts.at(-1).correct,false);assert.equal(view.attempts.at(-1).hinted,false);
 const learned=send({type:'next'});assert.equal(model.teachingFor(learned)[0].target,'nationality');
});
