import {firstStageDefinition,stageDefinition} from './protocol';
export const stageHash='#/stage-assessment';
export function stageHashForTarget(target?:string){if(target===undefined||target===firstStageDefinition.target)return stageHash;return stageDefinition(target)?stageHash+'?task='+encodeURIComponent(target):null;}
export function parseStageRoute(hash:string){
 const [path,query='']=hash.split('?');if(!/^#\/?stage-assessment$/.test(path))return null;
 if(!query)return {view:'stage-assessment' as const};
 const params=new URLSearchParams(query),task=params.get('task');
 if(!task||[...params.keys()].length!==1||!stageDefinition(task))return null;
 return {view:'stage-assessment' as const,task};
}
