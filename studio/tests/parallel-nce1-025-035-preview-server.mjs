import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url));
const source=process.env.NCE_SOURCE_ROOT;
const nums=[25,27,29,31,33,35];
const comics=JSON.parse(await readFile(resolve(root,'app/data/nce-illustrations.json'))).lessons;
const manifest=source?JSON.parse(await readFile(resolve(source,'materials/manifest.json'))):null;
export const server=createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost'),path=url.pathname;
  let raw,type='text/javascript';
  const n=Number(path.split('/').at(-1));
  if(path==='/'){raw=await readFile(resolve(root,'course-loop/parallel-nce1-025-035/preview.html'));type='text/html'}
  else if(/^\/course-loop\/parallel-nce1-025-035\/(preview\.(html|mjs)|content-contract.mjs|lesson-nce1-0(25|27|29|31|33|35).mjs)$/.test(path)){raw=await readFile(resolve(root,'.'+path));type=path.endsWith('html')?'text/html':'text/javascript'}
  else if(['/course-loop/model.mjs','/course-loop/lesson-nce1-001.mjs'].includes(path))raw=await readFile(resolve(root,'.'+path));
  else if(/^\/language\/NCE1\/(25|27|29|31|33|35).json$/.test(path)&&source){raw=await readFile(resolve(source,'.'+path));type='application/json'}
  else if(path.startsWith('/preview-source/comic/')&&source&&nums.includes(n)){raw=await readFile(resolve(source,'lesson-pages',comics[`NCE1-${n}`].pageSha256+'.jpg'));if(createHash('sha256').update(raw).digest('hex')!==comics[`NCE1-${n}`].pageSha256)throw Error('Comic hash mismatch');type='image/jpeg'}
  else if(path.startsWith('/preview-source/audio/')&&manifest&&nums.includes(n)){const item=manifest.files.find(f=>f.book==='NCE1'&&f.lesson===n&&f.type==='audio/mpeg');raw=Buffer.concat(await Promise.all(item.parts.map(p=>readFile(resolve(source,'.'+p.path)))));if(createHash('sha256').update(raw).digest('hex')!==item.sha256)throw Error('Audio hash mismatch');type='audio/mpeg'}
  else {res.writeHead(404);res.end('Not found');return}
  res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});res.end(raw);
 }catch(error){res.writeHead(500);res.end('Resource unavailable');console.error(error.message)}
});
if(process.argv[1]===fileURLToPath(import.meta.url))server.listen(Number(process.env.PORT||4325),'127.0.0.1',()=>console.log(`Isolated in-memory preview http://127.0.0.1:${server.address().port}/course-loop/parallel-nce1-025-035/preview.html`));
