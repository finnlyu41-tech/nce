import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir,readdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

// Local content inventory only. Generated files stay under ignored work/;
// dictionary punctuation and lexical matches never certify a teaching sense.
const root=new URL('../',import.meta.url);
const outputSubdir=process.argv.find(arg=>arg.startsWith('--output-subdir='))?.slice('--output-subdir='.length)||'';
assert(/^[A-Za-z0-9_-]*$/.test(outputSubdir),'Output subdirectory must be a simple name under work/vocabulary-coverage/');
const outputRelative='work/vocabulary-coverage/'+(outputSubdir?outputSubdir+'/':'');
const output=new URL(outputRelative,root);
const read=path=>readFile(new URL(path,root),'utf8');
const hash=text=>createHash('sha256').update(text).digest('hex');
const canonical=value=>JSON.stringify(value,Object.keys(value).sort());
const contentIdentity=example=>hash(JSON.stringify({id:example.id,word:example.word,sense:example.sense,matches:example.matches,en:example.en,zh:example.zh,collocation:example.collocation,origin:example.origin,partOfSpeech:example.partOfSpeech,teachingDefinition:example.teachingDefinition,teachingSources:example.teachingSources,teachingIpa:example.teachingIpa}));
const hasDeclaredContentReview=record=>Array.isArray(record?.reviewed)&&[/target sense/i,/natural sentence|English sentence/i,/Chinese translation/i,/collocation/i].every(pattern=>record.reviewed.some(field=>typeof field==='string'&&pattern.test(field)));
const snapshotLabel=process.argv.find(arg=>arg.startsWith('--snapshot='))?.slice('--snapshot='.length)||'working-tree';
const sourcePath=process.argv.find(arg=>arg.startsWith('--source='))?.slice('--source='.length)||'app/vocabulary-examples.ts';
const protectedFiles=['app/model.ts','app/flashcards.ts','app/flashcard-types.ts','app/progress-save.tsx','pnpm-lock.yaml'];
const inputFiles=[sourcePath,'app/textbook-vocabulary.ts','app/nce-utils.ts','app/ielts-flashcard-examples.ts','dist-online/lesson-pages/index.json','dist-online/language/dictionary.json'];
const hashesBefore=Object.fromEntries(await Promise.all([...inputFiles,...protectedFiles].map(async path=>[path,hash(await read(path))])));
const packages=new URL('node_modules/.pnpm/',root);
const builder=(await readdir(packages)).find(name=>/^esbuild@\d+\.\d+\.\d+$/.test(name));
assert(builder,'Install locked dependencies before auditing vocabulary content');
const {build}=await import(new URL(builder+'/node_modules/esbuild/lib/main.js',packages));
await mkdir(output,{recursive:true});
const bundle=new URL('inventory-bundle.mjs',output);
const compiledInputHashes={},rootPath=fileURLToPath(root);
await build({stdin:{contents:`export * from ${JSON.stringify('./'+sourcePath)};export {buildVocabularyCatalog,vocabularyKey} from './app/textbook-vocabulary';export {vocabularyExample} from './app/nce-utils';export {ieltsFlashcardExamples} from './app/ielts-flashcard-examples';`,resolveDir:rootPath,sourcefile:'vocabulary-inventory.ts',loader:'ts'},bundle:true,platform:'node',format:'esm',target:'node22',packages:'external',logLevel:'silent',outfile:fileURLToPath(bundle),plugins:[{name:'snapshot-content-inputs',setup(builder){builder.onLoad({filter:/\.ts$/},async args=>{const text=await readFile(args.path,'utf8'),path=args.path.startsWith(rootPath)?args.path.slice(rootPath.length):args.path;compiledInputHashes[path]=hash(text);return {contents:text,loader:'ts'}})}}]});
const m=await import(bundle.href+'?snapshot='+Date.now());
const pageIndex=JSON.parse(await read('dist-online/lesson-pages/index.json'));
const dictionary=JSON.parse(await read('dist-online/language/dictionary.json')).words;
const catalog=m.buildVocabularyCatalog(pageIndex),bookOrder=['NCE1','NCE2','NCE3','NCE4'];
const compareSource=(a,b)=>bookOrder.indexOf(a.book)-bookOrder.indexOf(b.book)||a.lesson-b.lesson;
const byKey=new Map(catalog.terms.map(term=>[term.key,term]));
const originals=m.originalVocabularyExamples;
assert.equal(new Set(originals.map(item=>item.id)).size,originals.length,'Original content IDs must be unique');
const reviewed=new Map(),reviewDocuments=[];
const addReviewRecord=entry=>{const records=reviewed.get(entry.id)||[];records.push(entry);reviewed.set(entry.id,records)};
let baseline;
try{baseline=JSON.parse(await read('docs/vocabulary-coverage-baseline-v21.json'));reviewDocuments.push('docs/vocabulary-coverage-baseline-v21.json')}catch(error){if(error.code!=='ENOENT')throw error}
for(const entry of baseline?.reviewedOriginals||[])addReviewRecord(entry);
// New batches can supply hashes. A changed sentence/translation/collocation
// cannot silently inherit a previous review solely because its ID is unchanged.
let reviewIndex;
try{reviewIndex=JSON.parse(await read('docs/vocabulary-examples-review-index.json'))}catch(error){if(error.code!=='ENOENT')throw error}
const registeredLedgers=reviewIndex?.registeredLedgers;
const ledgerPaths=registeredLedgers||(await readdir(new URL('docs/',root))).filter(name=>/^vocabulary-examples-batch.*\.json$/.test(name)).map(name=>'docs/'+name);
for(const path of ledgerPaths){
 const ledger=JSON.parse(await read(path));reviewDocuments.push(path);
 for(const entry of ledger.entries||[]){
  if(entry.contentSha256)addReviewRecord({...entry,reviewEvidence:path});
 }
}
const originalByWord=new Map();
for(const example of originals){
 const key=m.vocabularyKey(example.word),items=originalByWord.get(key)||[];
 items.push(example);originalByWord.set(key,items);
}
const originalInventory=originals.map(example=>{
 const contentSha256=contentIdentity(example),records=reviewed.get(example.id)||[];
 const matchingRecords=records.filter(record=>record.contentSha256===contentSha256&&hasDeclaredContentReview(record));
 const record=matchingRecords.at(-1)||records.at(-1);
 const reviewStatus=record?.contentSha256===contentSha256?hasDeclaredContentReview(record)?'recorded-editorial-review':'review-evidence-incomplete':record?'content-changed-review-required':'not-reviewed';
 return {id:example.id,word:example.word,sense:example.sense,origin:example.origin,contentSha256,reviewStatus,reviewEvidence:record?.reviewEvidence||record?.evidence||null,teachingSources:example.teachingSources||[],partOfSpeech:example.partOfSpeech||null,teachingDefinition:example.teachingDefinition||null,scope:record?.scope||null,reviewedSource:record?.source||record?.recordedSource||null,reviewedSourcePDFPage:record?.sourcePDFPage||null,reviewedSourcePageSha256:record?.sourcePageSha256||record?.sourceSHA||null,matchingContentReviews:matchingRecords.map(record=>({scope:record.scope,source:record.source||record.recordedSource||null,sourcePDFPage:record.sourcePDFPage||null,sourcePageSha256:record.sourcePageSha256||record.sourceSHA||null,evidence:record.reviewEvidence||record.evidence||null}))};
});
const reviewById=new Map(originalInventory.map(item=>[item.id,item]));
const contexts=new Map(),languageHashes={},occurrences=[],terms=[],priorities=[],identifiedTargetSenses=new Map();
const bookStats=Object.fromEntries(bookOrder.map(book=>[book,{occurrences:0,terms:0,bilingualCandidateOccurrences:0,termsWithBilingualCandidate:0,originalHeadwords:0,termsWithoutCandidateOrIndexedOriginal:0,termsWithoutCandidateOrDisplayedOriginal:0,firstSourceAssignedGapTerms:0,occurrencesWithExactTeachingSourceMetadata:0,confirmedSourceTargetSenses:0,confirmedSourceTargetSenseDenominator:null}]));
for(const lesson of [...catalog.lessons].sort(compareSource)){
 for(const [wordIndex,item] of lesson.words.entries()){
  const key=m.vocabularyKey(item.word),contextLesson=lesson.book==='NCE1'&&lesson.lesson%2===0?lesson.lesson-1:lesson.lesson;
  const contextKey=lesson.book+'-'+contextLesson,path=`dist-online/language/${lesson.book}/${contextLesson}.json`;
  if(!contexts.has(contextKey)){
   const text=await read(path);languageHashes[path]=hash(text);contexts.set(contextKey,JSON.parse(text).rows);
  }
  const candidate=m.vocabularyExample(contexts.get(contextKey),item.word,item.forms);
  const bilingual=Boolean(candidate?.en.trim()&&candidate?.zh.trim());
  const meaning=dictionary[key]?.meaning||'',compactMeaning=meaning.split('\n')[0]||'';
  const sourceTeachingMeaning=m.reviewedTeachingDefinition?.(item.word,[{book:lesson.book,lesson:lesson.lesson}])||'';
  const effectiveMeaning=sourceTeachingMeaning||meaning,effectiveCompact=effectiveMeaning.split('\n')[0]||'';
  const matched=m.examplesForMeaning(item.word,meaning),displayed=m.examplesForMeaning(item.word,effectiveCompact);
  // An explicit source label is evidence of scope, not proof that every
  // textbook target sense for this source was identified and reviewed.
  const attached=(originalByWord.get(key)||[]).filter(example=>(example.teachingSources||[]).some(source=>source.book===lesson.book&&source.lesson===lesson.lesson));
  const reviewedAttached=attached.filter(example=>reviewById.get(example.id)?.reviewStatus==='recorded-editorial-review');
  const reviewedTeachingTargets=reviewedAttached.filter(example=>{
   const record=reviewById.get(example.id);
   return record.matchingContentReviews.some(review=>review.scope==='textbook-target'&&review.source?.book===lesson.book&&review.source?.lesson===lesson.lesson&&lesson.pages.some(page=>page.page===review.sourcePDFPage&&page.sha256===review.sourcePageSha256))&&example.teachingDefinition?.trim()&&example.partOfSpeech?.trim();
  });
  for(const example of reviewedTeachingTargets){
   const senseKey=`${lesson.book}-${lesson.lesson}:${key}:${example.partOfSpeech}:${example.teachingDefinition}`;
   const existing=identifiedTargetSenses.get(senseKey);
   if(existing)existing.originalExampleIds.push(example.id);else identifiedTargetSenses.set(senseKey,{id:senseKey,book:lesson.book,lesson:lesson.lesson,word:item.word,partOfSpeech:example.partOfSpeech,teachingDefinition:example.teachingDefinition,originalExampleIds:[example.id],reviewStatus:'recorded-editorial-review',sourceTargetInventoryComplete:false});
  }
  const status=attached.length?'explicit-scope-review-incomplete':bilingual?'candidate-only':'not-reviewed';
  const entry={occurrenceId:`${lesson.book}-${lesson.lesson}:${key}`,book:lesson.book,lesson:lesson.lesson,wordIndex,word:item.word,key,forms:item.forms,pages:lesson.pages.map(page=>page.page),dictionaryMeaning:meaning,compactDictionaryMeaning:compactMeaning,sourceTeachingMeaning,effectiveSourceMeaning:effectiveMeaning,compactDisplayedMeaning:effectiveCompact,targetSenseDenominator:null,targetSenseStatus:reviewedTeachingTargets.length?'reviewed-target-present-completeness-unknown':'not-confirmed',reviewStatus:status,bilingualCandidate:bilingual,candidateSource:bilingual?{book:lesson.book,lesson:contextLesson}:null,candidateSentenceSha256:bilingual?hash(JSON.stringify({en:candidate.en,zh:candidate.zh})):null,originalExampleIds:matched.map(example=>example.id),sourceDisplayedOriginalIds:m.examplesForMeaning(item.word,effectiveMeaning).map(example=>example.id),compactDisplayedOriginalIds:displayed.map(example=>example.id),exactTeachingSourceExampleIds:attached.map(example=>example.id),recordedReviewedTeachingSourceIds:reviewedAttached.map(example=>example.id),recordedReviewedTeachingTargetIds:reviewedTeachingTargets.map(example=>example.id)};
  occurrences.push(entry);
  const stats=bookStats[lesson.book];stats.occurrences++;
  if(bilingual)stats.bilingualCandidateOccurrences++;
  if(attached.length)stats.occurrencesWithExactTeachingSourceMetadata++;
 }
}
// Completeness is declared only after an editor reads the source word list.
// A complete lesson inventory must name every indexed source word, and every
// target must resolve to content with a matching source page and frozen review.
const completeSourceInventories=[];
for(const path of reviewIndex?.sourceTargetInventories||[]){
 const inventory=JSON.parse(await read(path));reviewDocuments.push(path);
 const {book,lesson}=inventory.source||{},sourceOccurrences=occurrences.filter(item=>item.book===book&&item.lesson===lesson);
 assert(sourceOccurrences.length,'Source inventory must refer to an indexed lesson: '+path);
 const sourceLesson=catalog.lessons.find(item=>item.book===book&&item.lesson===lesson);
 assert(sourceLesson.pages.some(page=>page.page===inventory.sourcePDFPage&&page.sha256===inventory.sourcePageSha256),'Source inventory page must match the current material index: '+path);
 const keys=inventory.entries.map(item=>m.vocabularyKey(item.word));
 assert.equal(new Set(keys).size,keys.length,'A source inventory cannot silently repeat a headword');
 if(inventory.completeWordList)assert.deepEqual([...keys].sort(),sourceOccurrences.map(item=>item.key).sort(),'Complete source inventory must include every word-list entry');
 for(const item of inventory.entries){
  const occurrence=sourceOccurrences.find(entry=>entry.key===m.vocabularyKey(item.word));assert(occurrence,'Source inventory headword must occur in that lesson');
  assert(item.targetExampleIds?.length,'Each inventoried word must declare its target examples');
  for(const id of item.targetExampleIds)assert(occurrence.recordedReviewedTeachingTargetIds.includes(id),'Each target needs a current frozen editorial review at this source');
  const targets=[...identifiedTargetSenses.values()].filter(target=>target.book===book&&target.lesson===lesson&&m.vocabularyKey(target.word)===occurrence.key&&target.originalExampleIds.some(id=>item.targetExampleIds.includes(id)));
  assert(targets.length,'A completed source inventory must identify at least one target sense');
  assert(occurrence.recordedReviewedTeachingTargetIds.every(id=>item.targetExampleIds.includes(id)),'The complete inventory must retain all registered target examples');
  for(const target of targets)target.sourceTargetInventoryComplete=true;
  occurrence.targetSenseDenominator=targets.length;
  occurrence.targetSenseStatus='all-enumerated-source-targets-editorially-reviewed';
  occurrence.reviewStatus='recorded-editorial-source-review';
  occurrence.sourceInventoryEvidence=path;
 }
 completeSourceInventories.push({path,source:inventory.source,completeWordList:Boolean(inventory.completeWordList),sourceWords:keys.length,targetSenses:inventory.entries.reduce((sum,item)=>sum+sourceOccurrences.find(entry=>entry.key===m.vocabularyKey(item.word)).targetSenseDenominator,0),humanCertification:false});
}
const byOccurrenceWord=new Map();
for(const occurrence of occurrences){const items=byOccurrenceWord.get(occurrence.key)||[];items.push(occurrence);byOccurrenceWord.set(occurrence.key,items)}
for(const term of catalog.terms){
 const items=byOccurrenceWord.get(term.key)||[],candidate=items.some(item=>item.bilingualCandidate);
 const authored=originalByWord.get(term.key)||[],matched=m.examplesForMeaning(term.word,dictionary[term.key]?.meaning||'');
 const sourceDisplayedOriginalIds=[...new Set(items.flatMap(item=>item.sourceDisplayedOriginalIds))];
 const reviewedAuthored=authored.filter(example=>reviewById.get(example.id)?.reviewStatus==='recorded-editorial-review');
 const sources=[...term.sources].sort(compareSource),first=sources[0];
 const entry={key:term.key,word:term.word,sources:sources.map(source=>({book:source.book,lesson:source.lesson})),hasBilingualCandidate:candidate,originalExampleIds:authored.map(item=>item.id),recordedReviewedOriginalIds:reviewedAuthored.map(item=>item.id),indexedMeaningMatchedOriginalIds:matched.map(item=>item.id),sourceDisplayedOriginalIds,sourceTargetSenseDenominator:null,sourceTargetSenseReviewStatus:'not-confirmed'};
 terms.push(entry);
 for(const book of new Set(sources.map(source=>source.book))){const stats=bookStats[book];stats.terms++;if(candidate&&items.some(item=>item.book===book&&item.bilingualCandidate))stats.termsWithBilingualCandidate++;if(authored.length)stats.originalHeadwords++;if(!candidate&&!matched.length)stats.termsWithoutCandidateOrIndexedOriginal++;if(!candidate&&!sourceDisplayedOriginalIds.length)stats.termsWithoutCandidateOrDisplayedOriginal++}
 if(!candidate&&!sourceDisplayedOriginalIds.length)bookStats[first.book].firstSourceAssignedGapTerms++;
 if(!reviewedAuthored.length){
  const firstOccurrence=items.find(item=>item.book===first.book&&item.lesson===first.lesson);
  priorities.push({word:term.word,key:term.key,firstSource:{book:first.book,lesson:first.lesson,wordIndex:firstOccurrence.wordIndex},sources:entry.sources,priority:!candidate&&!sourceDisplayedOriginalIds.length?'no-bilingual-candidate-or-original':sourceDisplayedOriginalIds.length?'original-present-review-required':'candidate-not-sense-reviewed',dictionaryMeaning:firstOccurrence.dictionaryMeaning,sourceTeachingMeaning:firstOccurrence.sourceTeachingMeaning,compactDisplayedMeaning:firstOccurrence.compactDisplayedMeaning,targetSenseDenominator:null,reviewAction:'Read the source word list and context; identify source target sense(s), then review sentence, translation, collocation and displayed source. Dictionary labels alone do not close this entry.'});
 }
}
priorities.sort((a,b)=>compareSource(a.firstSource,b.firstSource)||a.firstSource.wordIndex-b.firstSource.wordIndex||a.key.localeCompare(b.key));
const ielts=m.ieltsFlashcardExamples.map((item,index)=>{const key=m.vocabularyKey(item.word),term=byKey.get(key);return {id:`ielts-seed-${index+1}:${key}`,word:item.word,key,overlapsTextbook:Boolean(term),textbookSources:term?.sources.map(source=>({book:source.book,lesson:source.lesson}))||[],overlapsOriginalTable:originalByWord.has(key),meaning:item.meaning,origin:'original',contentSha256:hash(JSON.stringify(item)),source:item.sources,reviewStatus:'existing-original-seed-not-a-source-sense-audit'};});
const candidateOnly=terms.filter(term=>term.hasBilingualCandidate&&!term.recordedReviewedOriginalIds.length);
const noOriginal=terms.filter(term=>!term.originalExampleIds.length);
const noEither=terms.filter(term=>!term.hasBilingualCandidate&&!term.indexedMeaningMatchedOriginalIds.length);
const displayUnion=terms.filter(term=>term.hasBilingualCandidate||term.indexedMeaningMatchedOriginalIds.length);
const sourceDisplayUnion=terms.filter(term=>term.hasBilingualCandidate||term.sourceDisplayedOriginalIds.length);
const sourceDisplayMissing=terms.filter(term=>!term.hasBilingualCandidate&&!term.sourceDisplayedOriginalIds.length);
const reviewedOriginals=originalInventory.filter(item=>item.reviewStatus==='recorded-editorial-review');
const overlap=ielts.filter(item=>item.overlapsTextbook),seedKeys=new Set(ielts.map(item=>item.key));
const authoredKeys=new Set([...originalByWord.keys(),...seedKeys]);
for(const sense of identifiedTargetSenses.values())bookStats[sense.book].confirmedSourceTargetSenses++;
const hashesAfter=Object.fromEntries(await Promise.all([...inputFiles,...protectedFiles].map(async path=>[path,hash(await read(path))])));
assert.deepEqual(hashesAfter,hashesBefore,'Inputs changed during this audit; rerun rather than publishing a mixed snapshot');
for(const [path,expected] of Object.entries(compiledInputHashes))assert.equal(hash(await read(path)),expected,'A compiled content input changed during audit: '+path);
const summary={schemaVersion:1,snapshot:snapshotLabel,generatedAt:new Date().toISOString(),scope:'Existing local textbook word index, existing original usage examples and existing IELTS seed aid; no user learning data, network request or scheduler mutation.',sourceCommitClaim:null,inputHashes:hashesBefore,languageResourceCount:contexts.size,languageResourcesSha256:hash(canonical(languageHashes)),counts:{textbookLessons:catalog.lessons.length,textbookTerms:catalog.terms.length,textbookOccurrences:catalog.entries,bilingualCandidateTerms:terms.filter(term=>term.hasBilingualCandidate).length,bilingualCandidateOccurrences:occurrences.filter(item=>item.bilingualCandidate).length,originalHeadwords:originalByWord.size,originalSenseExamples:originals.length,recordedReviewedOriginalHeadwords:new Set(reviewedOriginals.map(item=>m.vocabularyKey(item.word))).size,recordedReviewedOriginalSenseExamples:reviewedOriginals.length,originalsNeedingReview:originalInventory.length-reviewedOriginals.length,textbookTermsWithoutOriginalTableEntry:noOriginal.length,textbookTermsWithAnyAuthoredEntryIncludingIELTS:terms.filter(term=>authoredKeys.has(term.key)).length,textbookTermsWithoutAnyAuthoredEntryIncludingIELTS:terms.filter(term=>!authoredKeys.has(term.key)).length,textbookTermsWithCandidateOrIndexedMeaningMatchedOriginal:displayUnion.length,textbookTermsWithoutCandidateOrIndexedMeaningMatchedOriginal:noEither.length,candidateOnlyWithoutRecordedReviewedOriginal:candidateOnly.length,ieltsSeedEntries:ielts.length,ieltsSeedDistinctHeadwords:seedKeys.size,ieltsTextbookHeadwordOverlap:overlap.length,ieltsOriginalTableOverlap:ielts.filter(item=>item.overlapsOriginalTable).length,authoredHeadwordUnionIncludingIELTS:authoredKeys.size,unionOfTextbookAndIELTSHeadwords:new Set([...byKey.keys(),...seedKeys]).size,sourceOccurrencesWithExactTeachingSourceMetadata:occurrences.filter(item=>item.exactTeachingSourceExampleIds.length).length,recordedReviewedIdentifiedSourceTargetSenses:identifiedTargetSenses.size,confirmedSourceTargetSenseDenominator:null,fullyReviewedSourceOccurrenceDenominator:null,fullyReviewedSourceOccurrences:0},byBook:bookStats,ieltsTextbookOverlap:overlap.map(item=>({word:item.word,sources:item.textbookSources})),denominators:{headwords:{known:catalog.terms.length,unit:'normalized textbook headword; presence is not all-sense coverage'},sourceWords:{known:catalog.entries,unit:'book / lesson / normalized headword'},targetSenses:{known:null,status:'not-confirmed',unit:'book / lesson / headword / confirmed target sense',rule:'An editor must enumerate the source target senses and retain evidence; splitting the global dictionary or finding a lexical form does not establish this denominator.'},dictionarySenses:{known:null,status:'not-enumerated',rule:'The current dictionary contains coarse and separator-based labels; dictionary text is retained as evidence, not converted automatically into individual teaching targets.'}},reviewMeaning:{recordedEditorialReview:'Frozen content hashes and referenced prior editorial records; not a named human teacher certification.',candidateOnly:'A matching surface form has a nonempty bilingual sentence. Sense, part of speech, translation and collocation have not been certified for that source.',notReviewed:'Neither lexical candidate nor recorded review resolves the source target sense.',explicitScopeReviewIncomplete:'An original carries teachingSources, but no claim that the source target sense denominator is complete.'},hundredPercentClaims:{perContent:true,scope:'Only each specifically recorded, unchanged example ID and its reviewed sentence / Chinese translation / collocation. This does not certify every sense of its headword, every repeated lesson source, every dictionary label or every candidate sentence.',allTextbookHeadwords:false,allSourceTargetSenses:false,allDictionarySenses:false},reviewDocuments,protectedModelUnchangedDuringAudit:true,protectedModelMatchesFrozenBaseline:baseline?.inputHashes?protectedFiles.every(path=>baseline.inputHashes[path]===hashesBefore[path]):null,filesWrittenOnlyUnder:'work/vocabulary-coverage/'};
Object.assign(summary.counts,{textbookTermsWithCandidateOrSourceDisplayedOriginal:sourceDisplayUnion.length,textbookTermsWithoutCandidateOrSourceDisplayedOriginal:sourceDisplayMissing.length});
summary.counts.fullyReviewedSourceOccurrenceDenominator=catalog.entries;
summary.counts.fullyReviewedSourceOccurrences=occurrences.filter(item=>item.reviewStatus==='recorded-editorial-source-review').length;
summary.confirmedPartialSourceInventories=completeSourceInventories;
summary.compiledContentInputHashes=compiledInputHashes;
summary.coverageMetrics={rawDictionary:'Candidate OR original matching the unchanged global dictionary. This historical metric can miss corrected brand / proper noun target definitions.',sourceDisplayed:'Candidate OR original matching the explicitly source-scoped teaching definition, falling back to the unchanged dictionary. Content presence still does not certify all senses.'};
await writeFile(new URL('summary.json',output),JSON.stringify(summary,null,2)+'\n');
await writeFile(new URL('original-content-inventory.json',output),JSON.stringify(originalInventory,null,2)+'\n');
await writeFile(new URL('identified-source-target-senses.json',output),JSON.stringify({schemaVersion:1,completeDenominator:null,identifiedTargetSenses:[...identifiedTargetSenses.values()]},null,2)+'\n');
await writeFile(new URL('source-word-ledger.json',output),JSON.stringify({schemaVersion:1,counts:summary.counts,occurrences},null,2)+'\n');
await writeFile(new URL('source-review-priority.json',output),JSON.stringify({schemaVersion:1,completeSourceTargetSenseDenominator:null,sourceWordUnits:occurrences.length,basis:'All source word units remain in this audit queue until an editor explicitly completes the source target-sense inventory. A global reviewed original or lexical candidate is not a complete per-source audit.',entries:occurrences.map(item=>({occurrenceId:item.occurrenceId,book:item.book,lesson:item.lesson,wordIndex:item.wordIndex,word:item.word,pages:item.pages,priority:item.reviewStatus==='recorded-editorial-source-review'?'source-inventory-editorially-complete':item.recordedReviewedTeachingTargetIds.length?'reviewed-target-present-completeness-unknown':item.sourceDisplayedOriginalIds.length?'original-present-source-audit-pending':item.bilingualCandidate?'candidate-only':'no-bilingual-candidate-or-original',dictionaryMeaning:item.dictionaryMeaning,targetSenseDenominator:item.targetSenseDenominator,originalExampleIds:item.originalExampleIds,recordedReviewedTeachingTargetIds:item.recordedReviewedTeachingTargetIds}))},null,2)+'\n');
await writeFile(new URL('textbook-order-priority.json',output),JSON.stringify({schemaVersion:1,remainingWithoutRecordedOriginal:priorities.length,entries:priorities},null,2)+'\n');
await writeFile(new URL('ielts-seed-overlap.json',output),JSON.stringify({schemaVersion:1,entries:ielts},null,2)+'\n');
const csv=value=>'"'+String(value).replaceAll('"','""')+'"';
await writeFile(new URL('priority.csv',output),'word,priority,first_book,first_lesson,sources,compact_dictionary_label,target_sense_denominator\n'+priorities.map(item=>[item.word,item.priority,item.firstSource.book,item.firstSource.lesson,item.sources.map(source=>source.book+'-'+source.lesson).join(' | '),item.compactDisplayedMeaning,'unknown'].map(csv).join(',')).join('\n')+'\n');
console.log(JSON.stringify({snapshot:snapshotLabel,counts:summary.counts,byBook:summary.byBook,ieltsTextbookOverlap:summary.ieltsTextbookOverlap,output:outputRelative,protectedModelUnchangedDuringAudit:true},null,2));
