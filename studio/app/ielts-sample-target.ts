import {sampleLessonById} from '../ielts-blueprint/sample-sequence';
import type {Variant} from '../ielts-blueprint/types';

export function sampleTarget(task?:string):{variant:Variant;lessonId:string}|undefined{
 const match=task?.match(/^sample-(academic|general-training)-([a-z]+(?:-[a-z]+)*)$/);
 if(!match||match[0]!==task)return;
 const variant=match[1] as Variant,requested=match[2];
 const lessonId=['listening','reading','speaking','writing'].includes(requested)?'hub-'+requested:requested;
 return sampleLessonById(variant,lessonId)?{variant,lessonId}:undefined;
}
