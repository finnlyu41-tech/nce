import type {CourseLoopHost,CourseId,SourceKind} from '../host-contract.js';
declare const host:CourseLoopHost;
const first:CourseId='nce1-1',last:CourseId='nce1-143',second:CourseId='nce2-6';
const video:SourceKind='video';void [first,last,second,video];
host.showSource({kind:'text',book:'NCE1',lesson:143,comicKey:'NCE1-143'});
host.showSource({kind:'audio',book:'NCE2',lesson:6,comicKey:'NCE2-6'});
// @ts-expect-error book two has single lessons1..6 only
host.showSource({kind:'text',book:'NCE2',lesson:13,comicKey:'NCE2-1'});
// @ts-expect-error book one paired sources retain odd lessons
host.showSource({kind:'text',book:'NCE1',lesson:2,comicKey:'NCE1-1'});
// @ts-expect-error source keys cannot cross books
host.showSource({kind:'comic',book:'NCE1',lesson:1,comicKey:'NCE2-1'});
// @ts-expect-error existing textbook seven has no course-loop binding
const unregistered:CourseId='nce2-7';void unregistered;
