import {miniTasks} from './content';
export type MiniTaskRoute={view:'mini-task';taskId:string};
/** Publisher can intercept this hash before the existing classic parser.
 * Unknown/unwritten IDs return null, without inventing a task or progress. */
export function parseMiniTaskRoute(hash:string):MiniTaskRoute|null{
 const match=/^#\/mini-task\/([^/?#]+)$/.exec(hash);if(!match)return null;
 try{const taskId=decodeURIComponent(match[1]);return miniTasks.some(t=>t.id===taskId)?{view:'mini-task',taskId}:null}catch{return null}
}
