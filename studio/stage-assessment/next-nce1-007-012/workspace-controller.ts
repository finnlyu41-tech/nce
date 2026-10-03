import type {LearnerPort} from '../adapter';
import type {ReadStage,Skill} from '../types';
import {encodeWorkspaceNote,workspaceDraft,type WorkspaceNote} from './workspace-notes';
export type WorkspaceStatus={ready:boolean;busy:boolean;dirty:boolean;error:string;value:WorkspaceNote};
/** All writes are existing learner learning/practice events, serialized by the
 * existing stage adapter and confirmed by its one full-State host CAS writer. */
export class WorkspaceController{
 private value:WorkspaceNote;private baseline:WorkspaceNote|undefined;private revision=0;private saved=0;private pending:Promise<boolean>|undefined;private ready=false;private error='';private alive=true;private confirmedRaw:string|undefined;
 constructor(private port:LearnerPort,initial:WorkspaceNote,private listener:(s:WorkspaceStatus)=>void,private confirmed:(read:ReadStage)=>void,private practiceSkill:Skill=initial.slot==='correction'?'writing':initial.slot){this.value=structuredClone(initial);}
 setConfirmed(callback:(read:ReadStage)=>void){this.confirmed=callback;}
 snapshot():WorkspaceStatus{return {ready:this.ready,busy:!!this.pending,dirty:this.revision!==this.saved,error:this.error,value:structuredClone(this.value)};}
 private publish(){if(this.alive)this.listener(this.snapshot());}
 async load(){const revision=this.revision;try{const read=await this.port.load();if(read.status==='blocked')throw Error(read.reason);const prior=workspaceDraft(read,this.value.slot,this.value.attemptId);if(!this.alive||revision!==this.revision||this.revision!==this.saved)return;if(prior)this.value=structuredClone(prior);this.baseline=prior&&structuredClone(prior);this.confirmedRaw=read.status==='ready'?JSON.stringify(read.record):undefined;this.ready=true;this.error='';}catch(e){this.error=e instanceof Error?e.message:String(e);}this.publish();}
 async refresh(){if(this.pending||this.revision!==this.saved)return;await this.load();}
 edit(answers:string[],note=this.value.note){this.value={...this.value,answers:[...answers],note};this.revision++;this.publish();}
 flush():Promise<boolean>{
  if(this.pending)return this.pending;
  if(!this.ready){this.error=this.error||'学习稿还没有读完，当前输入保留。';this.publish();return Promise.resolve(false);}
  const task=Promise.resolve().then(async()=>{
   try{while(this.alive&&this.revision!==this.saved){const revision=this.revision,copy=structuredClone(this.value),note=encodeWorkspaceNote(copy);
    const before=JSON.stringify(this.baseline),read=await this.port.learner({type:'learning',skills:[this.practiceSkill],kind:'practice',note},latest=>JSON.stringify(workspaceDraft(latest,copy.slot,copy.attemptId))===before);if(!this.alive)return false;
    const actual=workspaceDraft(read,copy.slot,copy.attemptId);if(JSON.stringify(actual)!==JSON.stringify(copy))throw Error('学习稿回读未确认，当前输入保留。');
    this.baseline=structuredClone(copy);this.confirmedRaw=read.status==='ready'?JSON.stringify(read.record):undefined;this.saved=revision;this.error='';this.confirmed(read);
   }return this.alive&&!this.error;}catch(e){this.error=e instanceof Error?e.message:String(e);return false;}
  });this.pending=task;this.publish();void task.finally(()=>{this.pending=undefined;this.publish();});return task;
 }
 retry(){this.error='';return this.flush();}
 exportPending(){return JSON.stringify({format:'english-studio-unsaved-stage-workspace',version:1,scope:'NCE1-7-12',counted:false,confirmedRaw:this.confirmedRaw??null,pending:this.value},null,2);}
 dispose(){this.alive=false;}
}
