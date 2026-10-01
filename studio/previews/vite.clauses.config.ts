import {defineConfig,type Plugin} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';

// Pending mainline integration is exercised only in this local preview. The
// exact one-line interface is also checked by test-grammar-clauses.mjs.
const original='export function grammarAnswerMatches(practice:GrammarPractice,value:string){return [practice.answer,...(practice.accepted||[])].some(answer=>answerMatches(value,answer))}';
const isolatedAnswerPolicy:Plugin={
 name:'clauses-isolated-answer-policy',enforce:'pre',
 transform(source,id){
  if(!id.split('?')[0].endsWith('/app/grammar-curriculum-progress.ts'))return null;
  if(source.split(original).length!==2)throw Error('语法进度接口已变化；请先核对本地审阅适配。');
  return {code:"import {grammarClauseAnswerMatches} from './grammar-clause-answer';\n"+source.replace(original,'export function grammarAnswerMatches(practice:GrammarPractice,value:string){return grammarClauseAnswerMatches(practice,value)}'),map:null};
 },
};
export default defineConfig({
 root:fileURLToPath(new URL('../',import.meta.url)),plugins:[isolatedAnswerPolicy,react()],publicDir:false,cacheDir:'work/clauses-vite-cache',
 define:{__STUDIO_ONLINE__:'false'},
 resolve:{alias:{'@':fileURLToPath(new URL('../',import.meta.url))},dedupe:['react','react-dom']},
 server:{host:'127.0.0.1',port:4201,strictPort:true},
 build:{outDir:'work/clauses-review-build',emptyOutDir:true,rollupOptions:{input:'previews/clauses-review.html'}},
});
