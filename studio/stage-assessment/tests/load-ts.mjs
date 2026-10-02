import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import ts from '../../node_modules/typescript/lib/typescript.js';
const cache=new Map();
// Test-only loader for the existing extensionless host imports. No browser UI.
export function loadTs(file){
 file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 const native=createRequire(file),module={exports:{}};cache.set(file,module);
 const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const local=name=>{if(!name.startsWith('.'))return native(name);const base=path.resolve(path.dirname(file),name),candidate=[base,base+'.ts',base+'.tsx',base+'.json'].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());return /\.(ts|tsx|json)$/.test(candidate||'')?loadTs(candidate):native(name);};
 new Function('require','module','exports',source)(local,module,module.exports);return module.exports;
}
