import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';

// Turn a frozen local audit into a finite, source-bound editorial work queue.
// A queue unit is a book/lesson/headword obligation, not an inferred sense.
const root=new URL('../',import.meta.url),hash=value=>createHash('sha256').update(value).digest('hex');
const arg=(name,fallback)=>process.argv.find(value=>value.startsWith(name+'='))?.slice(name.length+1)||fallback;
const auditName=arg('--audit','gaps94-final'),outputName=arg('--output','gaps94-source-review');
assert(/^[A-Za-z0-9_-]+$/.test(auditName)&&/^[A-Za-z0-9_-]+$/.test(outputName),'Use simple local work subdirectory names');
const input=`work/vocabulary-coverage/${auditName}/`,output=new URL(`work/vocabulary-coverage/${outputName}/`,root);
const inputHashes={};
async function read(path){const text=await readFile(new URL(path,root),'utf8');inputHashes[path]=hash(text);return text}
const summary=JSON.parse(await read(input+'summary.json'));
assert(summary.auditReadHashes?.['docs/vocabulary-examples-review-index.json']&&summary.auditReadHashes?.['app/data/nce-pages.json'],'Rerun the audit with all documents, language resources and source mapping frozen');
for(const [path,expected] of Object.entries({...summary.inputHashes,...summary.compiledContentInputHashes,...summary.auditReadHashes}))assert.equal(hash(await read(path)),expected,'Rerun the audit after changing an input: '+path);
const sourceLedger=JSON.parse(await read(input+'source-word-ledger.json'));
const printedTargets=JSON.parse(await read(input+'identified-source-target-senses.json')).identifiedTargetSenses;
const normalizedTargets=JSON.parse(await read(input+'editorially-normalized-source-targets.json')).targets;
const index=JSON.parse(await read('dist-online/lesson-pages/index.json'));
const originalInventory=JSON.parse(await read(input+'original-content-inventory.json'));
const reviewIndex=JSON.parse(await read('docs/vocabulary-examples-review-index.json'));
const ledgers=await Promise.all(reviewIndex.registeredLedgers.map(async path=>({path,data:JSON.parse(await read(path))})));
const originals=new Map(originalInventory.map(item=>[item.id,item]));
const key=word=>word.trim().toLowerCase().replaceAll('’',"'");
const sourceId=(book,lesson,word)=>`${book}-${lesson}:${key(word)}`;
const allSourceIds=new Set(sourceLedger.occurrences.map(item=>item.occurrenceId));
assert.equal(allSourceIds.size,sourceLedger.occurrences.length,'Every source word occurs exactly once in this review queue');
assert.equal(allSourceIds.size,summary.counts.textbookOccurrences);

const sourceEvidence=new Map();
for(const {path,data} of ledgers)for(const item of data.entries){
 const original=originals.get(item.id);
 if(original?.reviewStatus!=='recorded-editorial-review'||original.contentSha256!==item.contentSha256||!item.source)continue;
 const id=sourceId(item.source.book,item.source.lesson,item.word);assert(allSourceIds.has(id),'Ledger source must occur in the audited catalog: '+id);
 const lesson=index.lessons[`${item.source.book}-${item.source.lesson}`];
 if(!lesson.pages.some(page=>page.page===item.sourcePDFPage&&page.sha256===item.sourcePageSha256))continue;
 // Preserve explicit source transcription as evidence. Teaching definitions
 // are editorial outputs and are never substituted for a printed gloss.
 const printedGloss=item.sourcePrintedGloss??item.sourcePrintedMeaning??item.textbookWordListMeaning??null;
 const printedPOS=item.sourcePrintedPartOfSpeech??item.textbookWordListPartOfSpeech??null;
 const records=sourceEvidence.get(id)||[];
 records.push({ledger:path,exampleId:item.id,contentSha256:item.contentSha256,scope:item.scope,sourcePDFPage:item.sourcePDFPage,sourcePageSha256:item.sourcePageSha256,printedGloss,printedPartOfSpeech:printedPOS,editoriallyInferredPartOfSpeech:item.editoriallyInferredPartOfSpeech??null,semanticNormalization:item.semanticNormalization??null,sourcePrintedGlossStatus:item.sourcePrintedGlossStatus??null,transcriptionRequiresFullEntryReconciliation:true});
 sourceEvidence.set(id,records);
}

const targets=new Map();
const grammarNormalizedTargets=[];
for(const item of originalInventory){
 if(item.reviewStatus!=='recorded-editorial-review')continue;
 for(const review of item.matchingContentReviews||[]){
  if(review.scope!=='textbook-target-grammar-normalized'||!review.source)continue;
  const lesson=index.lessons[`${review.source.book}-${review.source.lesson}`];
  if(!lesson?.pages.some(page=>page.page===review.sourcePDFPage&&page.sha256===review.sourcePageSha256))continue;
  grammarNormalizedTargets.push({id:item.id,book:review.source.book,lesson:review.source.lesson,word:item.word,partOfSpeech:item.partOfSpeech,teachingDefinition:item.teachingDefinition,originalExampleIds:[item.id],scope:review.scope,printedTargetCompleteness:false});
 }
}
for(const item of [...printedTargets,...normalizedTargets,...grammarNormalizedTargets]){
 const id=sourceId(item.book,item.lesson,item.word);assert(allSourceIds.has(id));
 const entries=targets.get(id)||[];
 entries.push({...item,classification:item.scope?.includes('normalized')?item.scope:'recorded-printed-target'});
 targets.set(id,entries);
}
const queue=sourceLedger.occurrences.map(item=>{
 const lesson=index.lessons[`${item.book}-${item.lesson}`];
 const pages=lesson.pages.filter(page=>lesson.vocabulary.pages.includes(page.page)).map(page=>({pdfPage:page.page,sha256:page.sha256,src:page.src}));
 assert(pages.length&&pages.every(page=>page.sha256&&page.src));
 const complete=item.reviewStatus==='recorded-editorial-source-review';
 const knownTargets=targets.get(item.occurrenceId)||[];
 const reviewedIds=[...new Set([...item.recordedReviewedTeachingTargetIds,...(item.recordedEditoriallyNormalizedTargetIds||[]),...knownTargets.filter(target=>target.scope==='textbook-target-grammar-normalized').flatMap(target=>target.originalExampleIds)])];
 return {id:item.occurrenceId,book:item.book,lesson:item.lesson,word:item.word,key:item.key,indexOrder:item.wordIndex,sourceBookSha256:index.sources[item.book],pages,enumerationStatus:complete?'all-enumerated-source-targets-reviewed':'source-enumeration-pending',completeInventoryEvidence:item.sourceInventoryEvidence||null,confirmedPrintedTargetCount:complete?item.targetSenseDenominator:null,printedSourceEvidence:sourceEvidence.get(item.occurrenceId)||[],knownReviewedTargets:knownTargets,reviewedTargetExampleIds:reviewedIds,lexicalCandidate:{present:item.bilingualCandidate,source:item.candidateSource,sentenceSha256:item.candidateSentenceSha256,senseReviewComplete:false},contentStatus:complete?'source-target-inventory-complete':reviewedIds.length?'target-content-present-source-inventory-pending':item.bilingualCandidate?'candidate-only':'source-and-content-review-pending',remainingObligations:complete?[]:['Reconcile the entire printed headword entry and its explicit gloss/POS groups on the source page.','Name any form, alias, unreadable text or editorial normalization separately.','Review each enumerated target sentence, Chinese translation, collocation and actual enrollment callback.']};
});

const pageTasks=new Map(),emptyLessons=[];
for(const [lessonId,lesson] of Object.entries(index.lessons)){
 const match=lessonId.match(/^(NCE[1-4])-(\d+)$/);assert(match);
 const book=match[1],lessonNumber=Number(match[2]);
 for(const pageNumber of lesson.vocabulary.pages){
  const page=lesson.pages.find(page=>page.page===pageNumber);assert(page);
  const id=`${book}:${pageNumber}`,task=pageTasks.get(id)||{id,book,pdfPage:pageNumber,sha256:page.sha256,src:page.src,lessonIds:[],reconciliationStatus:'whole-page-enumeration-pending'};
  assert.equal(task.sha256,page.sha256);task.lessonIds.push(lessonId);pageTasks.set(id,task);
 }
 if(!lesson.vocabulary.words.length)emptyLessons.push({id:lessonId,book,lesson:lessonNumber,pages:lesson.vocabulary.pages,indexState:'recorded-empty',reviewStatus:'confirm-whole-page-before-claiming-no-printed-targets'});
}
const completed=queue.filter(item=>item.enumerationStatus==='all-enumerated-source-targets-reviewed');
const counts={lessonBoundary:Object.keys(index.lessons).length,sourceWordReviewUnits:queue.length,sourceWordsWithCompleteTargetInventory:completed.length,sourceWordEnumerationPending:queue.length-completed.length,sourceWordsWithRegisteredTargets:queue.filter(item=>item.reviewedTargetExampleIds.length).length,candidateOnlySourceWords:queue.filter(item=>item.contentStatus==='candidate-only').length,sourcePagesToReconcile:pageTasks.size,recordedEmptyLessonsToConfirm:emptyLessons.length,knownReviewedPrintedTargets:printedTargets.length,knownEditoriallyNormalizedTargets:normalizedTargets.length,knownGrammarNormalizedTargets:grammarNormalizedTargets.length,confirmedWholeTextbookPrintedTargetDenominator:null};
assert.equal(counts.sourceWordsWithCompleteTargetInventory+counts.sourceWordEnumerationPending,counts.sourceWordReviewUnits);
for(const item of queue){assert(!item.lexicalCandidate.senseReviewComplete);if(item.enumerationStatus==='source-enumeration-pending')assert.equal(item.confirmedPrintedTargetCount,null)}
await mkdir(output,{recursive:true});
const outputs={
 'source-word-review-queue.json':{schemaVersion:1,unit:'book / lesson / normalized headword review obligation',finiteDenominator:queue.length,printedTargetSenseDenominatorIsSeparate:true,entries:queue},
 'source-page-reconciliation.json':{schemaVersion:1,unit:'book / PDF page',entries:[...pageTasks.values()],recordedEmptyLessons:emptyLessons},
 'pending-source-word-ids.json':{schemaVersion:1,count:counts.sourceWordEnumerationPending,ids:queue.filter(item=>item.enumerationStatus==='source-enumeration-pending').map(item=>item.id)},
};
const outputHashes={};
for(const [name,value] of Object.entries(outputs)){const text=JSON.stringify(value,null,2)+'\n';await writeFile(new URL(name,output),text);outputHashes[name]=hash(text)}
for(const [path,expected] of Object.entries(inputHashes))assert.equal(hash(await readFile(new URL(path,root),'utf8')),expected,'Input changed during queue generation: '+path);
const result={schemaVersion:1,auditSnapshot:summary.snapshot,generatedAt:new Date().toISOString(),counts,finiteReviewBoundary:{sourceWords:queue.length,sourcePages:pageTasks.size,lessons:Object.keys(index.lessons).length},inputHashes,outputHashes,globalTargetCompletion:false,percentageClaim:null,reason:'The finite source review queue covers every indexed textbook target obligation; whole printed target groups still require page reconciliation. Lexical candidates and reviewed example hashes do not certify a complete source entry.',filesWrittenOnlyUnder:'work/vocabulary-coverage/',networkUsed:false,learningRecordsRead:false,schedulerChanged:false};
await writeFile(new URL('manifest.json',output),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({counts,output:output.href,globalTargetCompletion:false,percentageClaim:null},null,2));
