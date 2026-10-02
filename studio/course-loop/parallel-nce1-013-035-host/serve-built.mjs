/** Read-only localhost preview of built production hosts and shared source assets. */
import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {resolve,join,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
const assets=resolve(process.env.NCE_HOST_ASSET_ROOT||join(root,'dist-online'));
const server=createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file;
  if(path==='/map/'||path==='/map/index.html')file=join(root,'map/dist/index.html');
  else if(path.startsWith('/map/assets/'))file=join(root,'map/dist',path.slice(5));
  else if(path==='/'||path==='/index.html'||path==='/standalone.html')file=join(root,'static-export/standalone.html');
  else if(path.startsWith('/assets/'))file=join(root,'static-export',path.slice(1));
  else if(/^\/(language|materials|illustrations|comics|lesson-pages)\//.test(path)||path==='/favicon.svg')file=join(assets,path.slice(1));
  else throw Error('Unknown preview route');
  const roots=[join(root,'map/dist'),join(root,'static-export'),assets];
  if(!roots.some(base=>resolve(file).startsWith(base+'/')))throw Error('Invalid asset path');
  const entry=await stat(file);
  const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.bin':'application/octet-stream'}[extname(file)]||'application/octet-stream';
  res.writeHead(200,{'Content-Type':mime,'Content-Length':entry.size,'Cache-Control':'no-store'});
  createReadStream(file).pipe(res);
 }catch{res.writeHead(404);res.end('Preview asset unavailable');}
});
server.listen(Number(process.env.NCE_HOST_PORT||0),'127.0.0.1',()=>console.log(`http://127.0.0.1:${server.address().port}`));
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>process.exit()));
