import {answerMatches} from './learning-plan';
import type {GrammarPractice} from './grammar-curriculum-types';

// Only the new relative-clause checks assess comma placement. All existing
// exercises keep their established matching and progress interpretation.
export const grammarClauseCommaSensitiveIds=[
 'relative-reference-v0-recognise','relative-reference-v0-repair','relative-reference-v0-produce',
 'relative-reference-v1-recognise','relative-reference-v1-repair','relative-reference-v1-produce',
] as const;
export const grammarClauseSentenceSensitiveIds=['relative-reference-v1-produce'] as const;
const commaSensitive=new Set<string>(grammarClauseCommaSensitiveIds);
const sentenceSensitive=new Set<string>(grammarClauseSentenceSensitiveIds);
const compatiblePunctuation=(value:string)=>value.normalize('NFKC').replace(/。/g,'.');
const sentenceParts=(value:string)=>value.trim().replace(/\.$/,'').split('.');
const commaPartsMatch=(value:string,answer:string)=>{
 const segments=value.split(','),expected=answer.split(',');
 return segments.length===expected.length&&segments.every((segment,index)=>answerMatches(segment,expected[index]));
};

export function grammarClauseAnswerMatches(practice:GrammarPractice,value:string){
 const candidates=[practice.answer,...(practice.accepted||[])];
 if(!commaSensitive.has(practice.id))return candidates.some(answer=>answerMatches(value,answer));
 // Matching each comma-delimited segment preserves the exact semantic boundary
 // while reusing the existing case, whitespace and contraction handling. A
 // missing, extra or moved comma changes the segments and cannot silently pass.
 const response=compatiblePunctuation(value);
 return candidates.some(reference=>compatiblePunctuation(reference).split(/\s+\/\s+/).some(answer=>{
  if(!sentenceSensitive.has(practice.id))return commaPartsMatch(response,answer);
  // This one prompt explicitly requires two complete sentences. Preserve their
  // internal full stop as well; otherwise legacy normalization would accept a
  // run-on sentence. A final full stop remains optional, as for older checks.
  const sentences=sentenceParts(response),expected=sentenceParts(answer);
  return sentences.length===expected.length&&sentences.every((sentence,index)=>commaPartsMatch(sentence,expected[index]));
 }));
}
