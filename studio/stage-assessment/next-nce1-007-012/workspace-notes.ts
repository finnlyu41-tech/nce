import type {ReadStage,Skill} from '../types';
export const workspacePrefix='stage-workspace-007-012:v1:';
export type WorkspaceNote={version:1;slot:Skill|'correction';attemptId?:string;answers:string[];note:string};
const slots=['listening','reading','speaking','writing','correction'];
export function parseWorkspaceNote(text:string):WorkspaceNote|undefined{
 if(!text.startsWith('stage-workspace-007-012:'))return;
 if(!text.startsWith(workspacePrefix))throw Error('学习稿版本未知，原稿保留；请下载阶段原始证据核对。');
 const v=JSON.parse(text.slice(workspacePrefix.length));
 if(!v||Object.getPrototypeOf(v)!==Object.prototype||Object.keys(v).some(k=>!['version','slot','attemptId','answers','note'].includes(k))||v.version!==1||!slots.includes(v.slot)||!Array.isArray(v.answers)||v.answers.length<1||v.answers.length>6||v.answers.some((x:unknown)=>typeof x!=='string'||x.length>1800)||typeof v.note!=='string'||v.note.length>600||v.slot==='correction'&&(typeof v.attemptId!=='string'||!v.attemptId||v.attemptId.length>128)||v.slot!=='correction'&&v.attemptId!==undefined)throw Error('学习稿字段无效，原稿保留；不能重置或降级。');
 return v;
}
export function encodeWorkspaceNote(value:WorkspaceNote){const text=workspacePrefix+JSON.stringify(value);if(text.length>3900)throw Error('当前稿过长，请缩短后保存，输入仍保留。');parseWorkspaceNote(text);return text;}
export function workspaceDraft(read:ReadStage,slot:WorkspaceNote['slot'],attemptId?:string):WorkspaceNote|undefined{
 if(read.status==='blocked')throw Error(read.reason);
 if(read.status==='empty')return;
 let latest:WorkspaceNote|undefined;
 for(const event of read.record.events)if(event.command.type==='learning'){
  const value=parseWorkspaceNote(event.command.note);if(value?.slot===slot&&value.attemptId===attemptId)latest=value;
 }
 return latest;
}
export function hasCurrentWorkspace(read:ReadStage){
 if(read.status!=='ready')return false;
 return (['listening','reading','speaking','writing'] as const).some(slot=>workspaceDraft(read,slot)?.answers.some(a=>!!a.trim()))||read.view.attempts.some(attempt=>{const note=workspaceDraft(read,'correction',attempt.id),last=attempt.revisions.at(-1);return !!note?.answers.some(a=>!!a.trim())&&(!last||JSON.stringify(last.answers)!==JSON.stringify(note.answers)||last.note!==note.note);});
}
