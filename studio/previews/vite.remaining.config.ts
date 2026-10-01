import {defineConfig,type Plugin} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';

// Pending mainline integration is exercised only in this local preview. The
// exact one-line interface is also checked by test-grammar-remaining.mjs.
const original='export function grammarAnswerMatches(practice:GrammarPractice,value:string){return [practice.answer,...(practice.accepted||[])].some(answer=>answerMatches(value,answer))}';
const isolatedAnswerPolicy:Plugin={
 name:'remaining-isolated-answer-policy',enforce:'pre',
 transform(source,id){
  if(!id.split('?')[0].endsWith('/app/grammar-curriculum-progress.ts'))return null;
  // Preserve the integrated matcher, including the earlier relative-clause rules.
  if(source.includes("import {grammarRemainingAnswerMatches} from './grammar-remaining-answer';")&&source.includes('export function grammarAnswerMatches(practice:GrammarPractice,value:string){return grammarRemainingAnswerMatches(practice,value)}'))return null;
  if(source.split(original).length!==2)throw Error('语法进度接口已变化；请先核对本地审阅适配。');
  return {code:"import {grammarRemainingAnswerMatches} from './grammar-remaining-answer';\n"+source.replace(original,'export function grammarAnswerMatches(practice:GrammarPractice,value:string){return grammarRemainingAnswerMatches(practice,value)}'),map:null};
 },
};
export default defineConfig({
 root:fileURLToPath(new URL('../',import.meta.url)),plugins:[isolatedAnswerPolicy,react()],publicDir:false,cacheDir:'work/remaining-vite-cache',
 define:{__STUDIO_ONLINE__:'false'},
 resolve:{alias:{'@':fileURLToPath(new URL('../',import.meta.url))},dedupe:['react','react-dom']},
 server:{host:'127.0.0.1',port:4203,strictPort:true},
 build:{outDir:'work/remaining-review-build',emptyOutDir:true,rollupOptions:{input:'previews/remaining-review.html'}},
});
