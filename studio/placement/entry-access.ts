import type {State} from '../app/model';
import type {Progress} from '../map/model';
import {parseRoute} from '../app/navigation';
import {mapUnitId} from '../app/map-connection';
import {courseAccessHref} from '../app/course-loop-next';
import {placementTrial,placementTasks} from './adapter';

/** Explicitly chosen trial only. The existing map host consumes this narrow
 * access intent after its guarded save; no completion or level is granted. */
export function placementEntryHref(state:State,map:Progress,now=Date.now(),online=true){
 const trial=placementTrial(state,now);if(!trial)return null;
 if(!online)return trial.href.replace(/^\//,'');
 const route=parseRoute(trial.href.replace(/^\//,''));
 const id=route.view==='nce'?mapUnitId(route.book,route.lesson):undefined;
 return id?courseAccessHref(id,map,now):trial.href;
}
export function placementHostTasks(state:State,map:Progress,now=Date.now(),online=true){
 const href=placementEntryHref(state,map,now,online);
 return placementTasks(state,now,online).map(task=>task.id==='placement:trial'&&href?{...task,href}:task);
}
