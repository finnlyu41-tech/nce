import fs from 'node:fs/promises';
import path from 'node:path';
import { stripTypeScriptTypes } from 'node:module';
const cache=new Map();
export async function moduleURL(file){
  file=path.resolve(file);
  if(cache.has(file))return cache.get(file);
  let source=file.endsWith('.json')?`export default ${await fs.readFile(file,'utf8')}`:stripTypeScriptTypes(await fs.readFile(file,'utf8'));
  for(const match of [...source.matchAll(/from\s+['"]([^'"]+)['"]/g)]){
    if(!match[1].startsWith('.'))continue;
    const child=path.resolve(path.dirname(file),match[1]+(path.extname(match[1])?'':'.ts'));
    source=source.replaceAll(match[0],`from '${await moduleURL(child)}'`);
  }
  const url=`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
  cache.set(file,url);return url;
}
export const loadTypeScript=async file=>import(await moduleURL(file));
