import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {contents,root} from './test-binding.mjs';
const read=async name=>JSON.parse(await readFile(new URL(`docs/parallel-nce1-037-047/${name}`,root),'utf8'));
const original=await read('blind-original-solutions.json'),revised=await read('blind-revised-solutions.json');
const solutions=new Map(original.map(s=>[s.id,s]));for(const s of revised)solutions.set(s.id,s);
test('108 independently written blind solutions match final content (8 revised prompts freshly re-solved)',()=>{assert.equal(solutions.size,108);for(const c of contents)for(const q of c.questions){const s=solutions.get(q.id);assert.ok(s,q.id);assert.ok(c.matches(q,s.answer),q.id+': '+s.answer);for(const a of s.reasonableVariants||[])assert.ok(c.matches(q,a),q.id+': '+a)}});
test('reviewer-discovered natural boundaries stay accepted',()=>{const c37=contents[0],c41=contents[2],c45=contents[4];for(const [c,id,a] of [[c37,'independent-n37-ask-plan',"What's she going to pack?"],[c37,'repair-n37-ask-plan',"What's he going to do?"],[c41,'diagnostic-n41-quantity-unit','one bottle of water'],[c41,'repair-n41-quantity-unit','one loaf of bread'],[c41,'review-b-n41-quantity-unit','one bar of chocolate'],[c45,'guided-n45-can-do','I can pump this tyre up.']])assert.ok(c.matches(c.byId.get(id),a))});
