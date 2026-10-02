export const stageHash='#/stage-assessment';
export function parseStageRoute(hash:string){return /^#\/?stage-assessment$/.test(hash)?{view:'stage-assessment' as const}:null;}
