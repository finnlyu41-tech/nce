import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
import { stripTypeScriptTypes } from 'node:module';
const cache=new Map();
export async function moduleURL(file){
  file=path.resolve(file);
  if(cache.has(file))return cache.get(file);
  let source=file.endsWith('.json')?`export default ${await fs.readFile(file,'utf8')}`:stripTypeScriptTypes(await fs.readFile(file,'utf8'));
  // Preserve source-relative resources while modules execute as data URLs.
  // AST ranges touch only the actual import.meta.url expression, never text.
  const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS),ranges=[];
  const visit=node=>{if(ts.isPropertyAccessExpression(node)&&node.name.text==='url'&&ts.isMetaProperty(node.expression)&&node.expression.keywordToken===ts.SyntaxKind.ImportKeyword&&node.expression.name.text==='meta')ranges.push([node.getStart(ast),node.end]);ts.forEachChild(node,visit)};
  visit(ast);for(const [start,end] of ranges.sort((a,b)=>b[0]-a[0]))source=source.slice(0,start)+JSON.stringify(pathToFileURL(file).href)+source.slice(end);
  for(const match of [...source.matchAll(/from\s+['"]([^'"]+)['"]/g)]){
    if(!match[1].startsWith('.'))continue;
    const child=path.resolve(path.dirname(file),match[1]+(path.extname(match[1])?'':'.ts'));
    source=source.replaceAll(match[0],`from '${await moduleURL(child)}'`);
  }
  const url=`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
  cache.set(file,url);return url;
}
export const loadTypeScript=async file=>import(await moduleURL(file));
