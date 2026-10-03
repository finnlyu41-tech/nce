// Offline installed Samantha only. No services, recording, download or uploads.
import {spawnSync} from 'node:child_process';
import {writeFile,readFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=new URL('../../',import.meta.url),{batch05Tasks}=await import(new URL('work/mini-batch05/model.mjs',root));
const out=new URL('mini-task/batch-05/audio/',root),tmp=new URL('work/mini-batch05/audio-scripts/',root);await mkdir(tmp,{recursive:true});
for(const task of batch05Tasks.filter(t=>t.skill==='listening'))for(const q of task.items){const name=q.id.replace(':','-')+'.wav',path=fileURLToPath(new URL(name,out)),script=fileURLToPath(new URL(name+'.txt',tmp));await writeFile(script,q.material+'\n');let prior;try{prior=await readFile(path)}catch{}if(prior){if(prior.length<6000)throw Error('Reject empty/truncated existing WAV '+name);console.log('KEEP '+name+' '+createHash('sha256').update(prior).digest('hex'));continue}const r=spawnSync('/usr/bin/say',['-v','Samantha','-r','125','--file-format=WAVE','--data-format=LEI16@22050','-o',path,'-f',script],{encoding:'utf8'});if(r.status!==0)throw Error(r.stderr||'say failed');const generated=await readFile(path);if(generated.length<6000)throw Error('say returned no usable PCM: '+name);console.log('GENERATED '+name)}
