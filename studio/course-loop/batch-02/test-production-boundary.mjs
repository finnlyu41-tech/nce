/** Compiles the unchanged real v32 host. No parser or registry replacement. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {productionHost} from '../batch-01/production-test-binding.mjs';
import {createCourseLoopModel} from '../model.mjs';
import * as c7 from './lesson-nce1-007.mjs';
import * as c9 from './lesson-nce1-009.mjs';
import * as c11 from './lesson-nce1-011.mjs';
const host=await productionHost(),NOW=1791028800000;
test('production registry still exposes only deployed 1/3/5; local candidates are never silently registered',()=>{assert.deepEqual(host.courseLoopBindings.map(c=>c.id),['nce1-1','nce1-3','nce1-5']);for(const c of [c7,c9,c11])assert.throws(()=>host.courseLoopFor(c.lesson.id))});
test('real host rejects every unregistered candidate envelope and sidecar and retains exact raw',()=>{for(const c of [c7,c9,c11]){const state=createCourseLoopModel(c).initialState(NOW),raw=JSON.stringify(state);for(const id of ['nce1-1','nce1-3','nce1-5',c.lesson.id]){const result=host.parseCourseLoop(raw,NOW,id);assert.equal(result.ok,false);assert.equal(result.raw,raw)}const q=c.questionsFor('independent')[0],inputs=JSON.stringify({version:1,corrections:{[q.id]:{answer:'pending original',note:'pending note'}}});for(const id of ['nce1-1','nce1-3','nce1-5',c.lesson.id])assert.throws(()=>host.parseLoopInputs(inputs,id))}});
test('old production parser, keys and recommendations remain the existing v32 interfaces',()=>{const before=JSON.stringify(host.initial);assert.equal(host.courseLoopKey,'nce-course-loop-v1:NCE1-1');assert.equal(host.courseLoopInputsKey,'nce-course-loop-inputs-v1:NCE1-1');const raw=JSON.stringify(host.courseLoopFor().model.initialState(NOW));assert.ok(host.parseCourseLoop(raw,NOW).ok);assert.equal(host.nextCourse(host.initial,host.emptyProgress(),NOW).id,'first');assert.equal(JSON.stringify(host.initial),before)});
