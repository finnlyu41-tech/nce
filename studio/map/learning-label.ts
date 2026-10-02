import type {MapNode} from './content';
import {learningLabel,type Progress} from './model';

// Map evidence and a separate CL training round can advance independently.
export function mapEvidenceLabel(node:MapNode,state:Progress):string{
 const label=learningLabel(node,state);
 return '地图检验：'+(label==='尚未学习'?'尚未开始':label==='学习中 · 尚未完成'?'进行中 · 尚未达标':label);
}
