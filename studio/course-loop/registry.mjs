import * as pilot from './lesson-nce1-001.mjs';
import * as adjacent3 from './batch-01/lesson-nce1-003.mjs';
import * as adjacent5 from './batch-01/lesson-nce1-005.mjs';
import * as adjacent7 from './batch-02/lesson-nce1-007.mjs';
import * as adjacent9 from './batch-02/lesson-nce1-009.mjs';
import * as adjacent11 from './batch-02/lesson-nce1-011.mjs';
import * as parallel13 from './parallel-nce1-013-023/lesson-nce1-013.mjs';
import * as parallel15 from './parallel-nce1-013-023/lesson-nce1-015.mjs';
import * as parallel17 from './parallel-nce1-013-023/lesson-nce1-017.mjs';
import * as parallel19 from './parallel-nce1-013-023/lesson-nce1-019.mjs';
import * as parallel21 from './parallel-nce1-013-023/lesson-nce1-021.mjs';
import * as parallel23 from './parallel-nce1-013-023/lesson-nce1-023.mjs';
import * as parallel25 from './parallel-nce1-025-035/lesson-nce1-025.mjs';
import * as parallel27 from './parallel-nce1-025-035/lesson-nce1-027.mjs';
import * as parallel29 from './parallel-nce1-025-035/lesson-nce1-029.mjs';
import * as parallel31 from './parallel-nce1-025-035/lesson-nce1-031.mjs';
import * as parallel33 from './parallel-nce1-025-035/lesson-nce1-033.mjs';
import * as parallel35 from './parallel-nce1-025-035/lesson-nce1-035.mjs';
import {createCourseLoopModel} from './model.mjs';

// Coverage files are records, never a registration source. Unlisted courses
// continue through the existing textbook/map host.
export const registeredCourses=Object.freeze([pilot,adjacent3,adjacent5,adjacent7,adjacent9,adjacent11,parallel13,parallel15,parallel17,parallel19,parallel21,parallel23,parallel25,parallel27,parallel29,parallel31,parallel33,parallel35].map(content=>Object.freeze({
 id:content.lesson.id,lesson:content.lesson,byId:content.byId,
 key:'nce-course-loop-v1:'+content.lesson.source.groupId,
 inputsKey:'nce-course-loop-inputs-v1:'+content.lesson.source.groupId,
 model:createCourseLoopModel(content),
})));
export const registeredCourseIds=Object.freeze(registeredCourses.map(course=>course.id));
const byCourse=new Map(registeredCourses.map(course=>[course.id,course]));
export function isRegisteredCourse(id){return byCourse.has(id)}
export function getCourseBinding(id='nce1-1'){
 const binding=byCourse.get(id);
 if(!binding)throw Error('课程尚未注册；原始记录保留，请先在记录页备份核对。');
 return binding;
}
