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
import * as parallel37 from './parallel-nce1-037-047/lesson-nce1-037.mjs';
import * as parallel39 from './parallel-nce1-037-047/lesson-nce1-039.mjs';
import * as parallel41 from './parallel-nce1-037-047/lesson-nce1-041.mjs';
import * as parallel43 from './parallel-nce1-037-047/lesson-nce1-043.mjs';
import * as parallel45 from './parallel-nce1-037-047/lesson-nce1-045.mjs';
import * as parallel47 from './parallel-nce1-037-047/lesson-nce1-047.mjs';
import * as parallel49 from './parallel-nce1-049-059/lesson-nce1-049.mjs';
import * as parallel51 from './parallel-nce1-049-059/lesson-nce1-051.mjs';
import * as parallel53 from './parallel-nce1-049-059/lesson-nce1-053.mjs';
import * as parallel55 from './parallel-nce1-049-059/lesson-nce1-055.mjs';
import * as parallel57 from './parallel-nce1-049-059/lesson-nce1-057.mjs';
import * as parallel59 from './parallel-nce1-049-059/lesson-nce1-059.mjs';
import * as parallel61 from './parallel-nce1-061-071/lesson-nce1-061.mjs';
import * as parallel63 from './parallel-nce1-061-071/lesson-nce1-063.mjs';
import * as parallel65 from './parallel-nce1-061-071/lesson-nce1-065.mjs';
import * as parallel67 from './parallel-nce1-061-071/lesson-nce1-067.mjs';
import * as parallel69 from './parallel-nce1-061-071/lesson-nce1-069.mjs';
import * as parallel71 from './parallel-nce1-061-071/lesson-nce1-071.mjs';
import * as parallel73 from './parallel-nce1-073-083/lesson-nce1-073.mjs';
import * as parallel75 from './parallel-nce1-073-083/lesson-nce1-075.mjs';
import * as parallel77 from './parallel-nce1-073-083/lesson-nce1-077.mjs';
import * as parallel79 from './parallel-nce1-073-083/lesson-nce1-079.mjs';
import * as parallel81 from './parallel-nce1-073-083/lesson-nce1-081.mjs';
import * as parallel83 from './parallel-nce1-073-083/lesson-nce1-083.mjs';
import * as parallel85 from './parallel-nce1-085-095/lesson-nce1-085.mjs';
import * as parallel87 from './parallel-nce1-085-095/lesson-nce1-087.mjs';
import * as parallel89 from './parallel-nce1-085-095/lesson-nce1-089.mjs';
import * as parallel91 from './parallel-nce1-085-095/lesson-nce1-091.mjs';
import * as parallel93 from './parallel-nce1-085-095/lesson-nce1-093.mjs';
import * as parallel95 from './parallel-nce1-085-095/lesson-nce1-095.mjs';
import * as parallel97 from './parallel-nce1-097-107/lesson-nce1-097.mjs';
import * as parallel99 from './parallel-nce1-097-107/lesson-nce1-099.mjs';
import * as parallel101 from './parallel-nce1-097-107/lesson-nce1-101.mjs';
import * as parallel103 from './parallel-nce1-097-107/lesson-nce1-103.mjs';
import * as parallel105 from './parallel-nce1-097-107/lesson-nce1-105.mjs';
import * as parallel107 from './parallel-nce1-097-107/lesson-nce1-107.mjs';
import * as parallel109 from './parallel-nce1-109-119/lesson-nce1-109.mjs';
import * as parallel111 from './parallel-nce1-109-119/lesson-nce1-111.mjs';
import * as parallel113 from './parallel-nce1-109-119/lesson-nce1-113.mjs';
import * as parallel115 from './parallel-nce1-109-119/lesson-nce1-115.mjs';
import * as parallel117 from './parallel-nce1-109-119/lesson-nce1-117.mjs';
import * as parallel119 from './parallel-nce1-109-119/lesson-nce1-119.mjs';
import * as parallel121 from './parallel-nce1-121-131/lesson-nce1-121.mjs';
import * as parallel123 from './parallel-nce1-121-131/lesson-nce1-123.mjs';
import * as parallel125 from './parallel-nce1-121-131/lesson-nce1-125.mjs';
import * as parallel127 from './parallel-nce1-121-131/lesson-nce1-127.mjs';
import * as parallel129 from './parallel-nce1-121-131/lesson-nce1-129.mjs';
import * as parallel131 from './parallel-nce1-121-131/lesson-nce1-131.mjs';
import {createCourseLoopModel} from './model.mjs';

// Coverage files are records, never a registration source. Unlisted courses
// continue through the existing textbook/map host.
export const registeredCourses=Object.freeze([pilot,adjacent3,adjacent5,adjacent7,adjacent9,adjacent11,parallel13,parallel15,parallel17,parallel19,parallel21,parallel23,parallel25,parallel27,parallel29,parallel31,parallel33,parallel35,parallel37,parallel39,parallel41,parallel43,parallel45,parallel47,parallel49,parallel51,parallel53,parallel55,parallel57,parallel59,parallel61,parallel63,parallel65,parallel67,parallel69,parallel71,parallel73,parallel75,parallel77,parallel79,parallel81,parallel83,parallel85,parallel87,parallel89,parallel91,parallel93,parallel95,parallel97,parallel99,parallel101,parallel103,parallel105,parallel107,parallel109,parallel111,parallel113,parallel115,parallel117,parallel119,parallel121,parallel123,parallel125,parallel127,parallel129,parallel131].map(content=>Object.freeze({
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
