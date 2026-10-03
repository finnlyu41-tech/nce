import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {mkdir,readFile,readdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const root=new URL('../',import.meta.url),hash=value=>createHash('sha256').update(value).digest('hex');
const read=path=>readFile(new URL(path,root),'utf8');
// Recompute the entire existing local vocabulary catalogue. Never use the
// authored-example subset or an IELTS batch as the textbook sense denominator.
const audit=spawnSync(process.execPath,[fileURLToPath(new URL('scripts/audit-vocabulary-coverage.mjs',root)),'--snapshot=ielts-batch02-current','--output-subdir=ielts-batch02-current'],{cwd:fileURLToPath(root),encoding:'utf8'});
if(audit.status!==0)throw Error(audit.stderr||audit.stdout||'Full catalogue audit failed');
const summary=JSON.parse(await read('work/vocabulary-coverage/ielts-batch02-current/summary.json'));
const packages=new URL('node_modules/.pnpm/',root),builder=(await readdir(packages)).find(s=>/^esbuild@\d+\.\d+\.\d+$/.test(s));
assert(builder,'Install locked dependencies before auditing');
const {build}=await import(new URL(`${builder}/node_modules/esbuild/lib/main.js`,packages));
const output=new URL('work/ielts-vocabulary-batch02/census.mjs',root);
await mkdir(new URL('work/ielts-vocabulary-batch02/',root),{recursive:true});
await build({stdin:{contents:"export * from './app/ielts-flashcard-examples';export * from './app/data/ielts-vocabulary-r20';export * from './app/data/ielts-vocabulary-batch02';export {originalVocabularyExamples} from './app/vocabulary-examples';",resolveDir:fileURLToPath(root),sourcefile:'batch02-census.ts',loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:fileURLToPath(output),logLevel:'silent'});
const m=await import(output.href+'?'+Date.now());
const previous=[...m.ieltsFlashcardSeeds,...m.ieltsVocabularyR20Words],batch=m.ieltsVocabularyBatch02,words=m.ieltsVocabularyBatch02Words;
const key=w=>JSON.stringify([w.word.trim().toLowerCase(),w.meaning]);
assert.equal(previous.length,60);assert.equal(words.length,24);
assert(words.every(w=>!previous.some(old=>key(old)===key(w)||old.word.toLowerCase()===w.word.toLowerCase())),'Second batch repeats a prior IELTS prompt or sense');
assert.deepEqual(m.ieltsFlashcardExamples,[...previous,...words],'New data must be wired into the current collection');
const fields=list=>({entries:list.length,bilingualExamples:list.filter(w=>w.example.trim()&&w.exampleTranslation?.trim()).length,collocations:list.filter(w=>/常用搭配：.+（.+）$/.test(w.meaning)).length,explicitContrasts:list.filter(w=>w.meaning.includes('辨义：')).length,ieltsSourceLabels:list.filter(w=>w.sources?.some(s=>s.kind==='ielts')).length});
const r19=JSON.parse(await read('app/data/source-review-r19.json')),tail=JSON.parse(await read('app/data/source-review-r19-tail.json'));
const counts=summary.counts;
const result={
 schemaVersion:1,baselineSource:'15505c43a1f35b8b7a60830b3bb7cc0e826f1d40',candidateChecked:'d717bad909d889fd305d667bd1d8530883aaf23a',
 method:'Recomputed full existing catalogue with audit-vocabulary-coverage; read already frozen source ledgers, no new PDF/source investigation, user records or network. Literal prompt matches do not establish source-sense completeness.',
 inputHashes:{...summary.inputHashes,'app/data/ielts-vocabulary-batch02.ts':hash(await read('app/data/ielts-vocabulary-batch02.ts')),'app/data/ielts-vocabulary-r20.ts':hash(await read('app/data/ielts-vocabulary-r20.ts')),'app/data/source-review-r19.json':hash(await read('app/data/source-review-r19.json')),'app/data/source-review-r19-tail.json':hash(await read('app/data/source-review-r19-tail.json'))},
 languageResourceCount:summary.languageResourceCount,languageResourcesSha256:summary.languageResourcesSha256,
 denominators:{textbookLessons:counts.textbookLessons,canonicalTextbookHeadwords:counts.textbookTerms,sourceHeadwordOccurrences:counts.textbookOccurrences,fullPrintedTextbookSenseCount:counts.confirmedSourceTargetSenseDenominator,fullIeltsVocabularyCount:null,selectedBatchTargets:batch.length},
 textbook:{counts,byBook:summary.byBook,interpretation:`${counts.originalHeadwords} authored headwords / ${counts.originalSenseExamples} authored examples are a reviewed subset. ${counts.textbookTermsWithoutOriginalTableEntry} headwords lacking that table do not mean textbook examples are absent. Bilingual word-form candidates are not a semantic/source audit. No source completion is earned by this IELTS-only batch.`},
 sourceClarifications:{registeredMainEntries:r19.length,mainKinds:Object.fromEntries([...new Set(r19.map(x=>x.kind))].map(kind=>[kind,r19.filter(x=>x.kind===kind).length])),registeredTailEntries:tail.length,tailFullInterpretationUnconfirmed:tail.filter(x=>!x.fullInterpretationConfirmed).map(x=>x.sourceWordId),tailLiteralCompleteUnknown:tail.filter(x=>x.completePrintedGloss===null).length,closedByThisBatch:0,rawSourceOwnerUnchanged:true},
 ielts:{before:fields(previous),added:fields(words),after:fields(m.ieltsFlashcardExamples),previousPayloadSha256:hash(JSON.stringify(previous)),addedPayloadSha256:hash(JSON.stringify(words)),fullCollectionSha256:hash(JSON.stringify(m.ieltsFlashcardExamples)),byUse:Object.fromEntries(['listening','speaking','reading','writing'].map(use=>[use,batch.filter(x=>x.use===use).length])),uncovered:'The original 12 seeds still have no explicit contrast field. No full IELTS lexicon or all-meanings denominator is defined. This batch adds 24 finite targets; it does not complete R19/R20/R21/R22 or all 61 requirements.'},
 selectedTargets:batch.map(s=>({id:s.id,headword:s.headword,prompt:s.prompt,use:s.use,group:s.group,scenario:s.scenario,origin:'original',hadPriorIeltsPrompt:previous.some(w=>w.word.toLowerCase()===s.prompt.toLowerCase())})),
 claims:{all61Complete:false,allTextbookSensesComplete:false,selectedTargetsHaveContent:true,thirdPartyDeckImported:false,legalSourceGapsInvented:false},
};
await mkdir(new URL('docs/verification/',root),{recursive:true});
const path='docs/verification/ielts-vocabulary-batch02-coverage.json';
await writeFile(new URL(path,root),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({path,denominators:result.denominators,ielts:result.ielts,sourceUnresolved:result.sourceClarifications},null,2));
