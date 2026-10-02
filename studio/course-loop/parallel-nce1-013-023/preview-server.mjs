import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join,resolve} from 'node:path';
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const prefix='/studio/course-loop/parallel-nce1-013-023/';
export async function startPreview(assetRoot=process.env.NCE_ASSET_ROOT){
 const numbers=[13,15,17,19,21,23];
 const comics=JSON.parse(await readFile(join(repo,'studio/app/data/nce-illustrations.json'))).lessons;
 const files=new Set(['preview.html','preview.mjs','content-contract.mjs',...numbers.map(n=>`lesson-nce1-${String(n).padStart(3,'0')}.mjs`)]);
 const server=createServer(async(req,res)=>{try{
  const url=new URL(req.url,'http://local'),p=url.pathname;let file,type='text/javascript; charset=utf-8';
  if(p==='/')file=join(repo,prefix,'preview.html');
  else if(p.startsWith(prefix)&&files.has(p.slice(prefix.length)))file=join(repo,p);
  else if(['/studio/course-loop/model.mjs','/studio/course-loop/lesson-nce1-001.mjs'].includes(p))file=join(repo,p);
  else {const lang=p.match(/^\/language\/NCE1\/(13|15|17|19|21|23)\.json$/),comic=p.match(/^\/source-comic\/(13|15|17|19|21|23)\.jpg$/);if(!assetRoot||!lang&&!comic){res.writeHead(404).end();return;}
   file=lang?join(resolve(assetRoot),`language/NCE1/${lang[1]}.json`):join(resolve(assetRoot),'lesson-pages',comics['NCE1-'+comic[1]].pageSha256+'.jpg');type=lang?'application/json; charset=utf-8':'image/jpeg';}
  if(file.endsWith('.html'))type='text/html; charset=utf-8';res.setHeader('Content-Type',type);res.setHeader('Cache-Control','no-store');res.end(await readFile(file));
 }catch(error){res.writeHead(500).end('Preview resource unavailable');}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));return {server,origin:`http://127.0.0.1:${server.address().port}`};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const {origin}=await startPreview();console.log(origin+'/studio/course-loop/parallel-nce1-013-023/preview.html?course=nce1-13');}
