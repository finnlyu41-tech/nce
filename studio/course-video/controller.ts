import {commitNotes,readNotes,type NotesPort,type NotesRead} from './adapter';
import {addAccess,editNotes,identityFor,type AccessKind,type VideoNotes} from './notes';
import type {VideoSource} from './manifest';
export type NotesStatus={text:string;ready:boolean;busy:boolean;dirty:boolean;error:string};
export class NotesController{
 private read:NotesRead|null=null;private notes:VideoNotes|null=null;private revision=0;private savedRevision=0;private pending:Promise<boolean>|null=null;private accessPending:Promise<boolean>|null=null;private alive=true;private error='';private loading=false;
 constructor(private port:NotesPort,readonly courseId:string,readonly source:VideoSource,private changed:(state:NotesStatus)=>void){}
 snapshot():NotesStatus{return {text:this.notes?.text||'',ready:!!this.read&&!this.loading,busy:!!this.pending||!!this.accessPending||this.loading,dirty:this.revision!==this.savedRevision,error:this.error}}
 private publish(){if(this.alive)this.changed(this.snapshot())}
 async load(){
  if(this.pending||this.snapshot().dirty)throw Error('先保存或备份当前笔记，再读取。');this.loading=true;this.publish();
  try{const read=await readNotes(this.port,identityFor(this.courseId,this.source));if(!this.alive)return;this.read=read;this.notes=read.notes;this.error=''}catch(e){this.error=e instanceof Error?e.message:'笔记暂时无法读取，原文保留。'}finally{this.loading=false;this.publish()}
 }
 edit(text:string){if(!this.notes||this.loading)return;this.notes=editNotes(this.notes,text);this.revision++;this.publish()}
 async refresh(){
  if(this.pending||this.accessPending||this.snapshot().dirty||this.loading)return;
  const revision=this.revision;
  try{const read=await readNotes(this.port,identityFor(this.courseId,this.source));if(this.alive&&revision===this.revision&&!this.pending&&!this.accessPending&&!this.snapshot().dirty){this.read=read;this.notes=read.notes;this.error='';this.publish()}}
  catch(e){if(this.alive&&revision===this.revision){this.error=e instanceof Error?e.message:'笔记重读暂未完成，文本仍保留。';this.publish()}}
 }
 flush():Promise<boolean>{
  return this.accessPending||this.flushEdits();
 }
 private flushEdits():Promise<boolean>{
  if(this.pending)return this.pending;if(!this.read||!this.notes||this.loading||this.error)return Promise.resolve(false);if(this.revision===this.savedRevision)return Promise.resolve(true);
  const task=async()=>{try{
   while(this.alive&&this.savedRevision!==this.revision){const expected=this.read!,notes=this.notes!,revision=this.revision;
    const confirmed=await commitNotes(this.port,expected,notes,()=>this.alive);if(!this.alive)return false;this.read=confirmed;this.savedRevision=revision;
   }return this.alive;
  }catch(e){this.error=e instanceof Error?e.message:'保存未完成，文本仍在本页。';return false}finally{this.pending=null;this.publish()}};
  this.pending=Promise.resolve().then(task);this.publish();return this.pending;
 }
 retry(){this.error='';return this.flush()}
 access(kind:AccessKind,recordHelp:()=>Promise<boolean>){
  if(this.accessPending)return this.accessPending;
  this.accessPending=Promise.resolve().then(async()=>{try{
   if(!await this.flushEdits()||!await recordHelp()||!this.alive||!this.notes||this.error)return false;
   this.notes=addAccess(this.notes,kind,this.source);this.revision++;this.publish();return await this.flushEdits();
  }catch(e){this.error=e instanceof Error?e.message:'视频访问暂未确认，笔记仍保留。';return false}finally{this.accessPending=null;this.publish()}});
  this.publish();return this.accessPending;
 }
 exportPending(){return JSON.stringify({kind:'english-studio-unsaved-video-note',version:1,savedRaw:this.read?.raw??null,pending:this.notes},null,2)}
 async reloadAfterBackup(backup:string){if(backup!==this.exportPending()||this.pending)throw Error('笔记又有改动，请先重新备份。');this.savedRevision=this.revision;await this.load()}
 dispose(){this.alive=false}
}
