import {answerMatches} from './learning-plan';
import {grammarClauseAnswerMatches} from './grammar-clause-answer';
import type {GrammarPractice} from './grammar-curriculum-types';

export const grammarRemainingCommaSensitiveIds=[
 'requests-nonfinite-v0-repair','requests-nonfinite-v0-produce',
 'requests-nonfinite-v1-repair','requests-nonfinite-v1-produce',
] as const;
export const grammarRemainingSentenceSensitiveIds=['structure-rewrite-v1-produce'] as const;
const commaSensitive=new Set<string>(grammarRemainingCommaSensitiveIds);
const sentenceSensitive=new Set<string>(grammarRemainingSentenceSensitiveIds);
const punctuation=(value:string)=>value.normalize('NFKC').replace(/。/g,'.');
const sentences=(value:string)=>value.trim().replace(/\.$/,'').split('.');
const commaPartsMatch=(value:string,answer:string)=>{
 const actual=value.split(','),expected=answer.split(',');
 return actual.length===expected.length&&actual.every((segment,index)=>answerMatches(segment,expected[index]));
};

export function grammarRemainingAnswerMatches(practice:GrammarPractice,value:string){
 if(!commaSensitive.has(practice.id)&&!sentenceSensitive.has(practice.id))return grammarClauseAnswerMatches(practice,value);
 const response=punctuation(value),partMatch=commaSensitive.has(practice.id)?commaPartsMatch:answerMatches;
 return [practice.answer,...(practice.accepted||[])].some(reference=>punctuation(reference).split(/\s+\/\s+/).some(answer=>{
  if(!sentenceSensitive.has(practice.id))return partMatch(response,answer);
  // This one prompt explicitly asks for two sentences, so their internal full
  // stop is required. The final full stop remains optional, as for older tasks.
  const actual=sentences(response),expected=sentences(answer);
  return actual.length===expected.length&&actual.every((sentence,index)=>partMatch(sentence,expected[index]));
 }));
}
