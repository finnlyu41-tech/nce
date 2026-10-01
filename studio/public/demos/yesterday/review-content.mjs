import {forms} from './content.mjs';
// Original structures: two sets. Later reuse is practice, not fresh transfer.
const q=(id,target,scene,options,correct)=>({id,target,scene,prompt:'选出合适的表达。',options,correct,hint:forms[target].short,explanation:forms[target].note});
export const reviewSets=[
  [q('review-a-sam','affirmative','Sam: Yesterday, I ___ to the shop for milk.',['go','went','did went'],1),q('review-a-nia','negative','Nia: The bus was late yesterday.\nI ___ to class by bus. I walked.',["didn’t went","didn’t go","don’t go"],1),q('review-a-fay','question','你问 Fay：「你昨天去工作了吗？」',['Did you go to work yesterday?','Did you went to work yesterday?','Do you went to work yesterday?'],0)],
  [q('review-b-kit','affirmative','Kit: I was hungry yesterday.\nI ___ to a small restaurant.',['did went','go','went'],2),q('review-b-bo','negative','Bo: It rained yesterday.\nI ___ to the playground. I stayed inside.',["didn’t go","didn’t went","wasn’t go"],0),q('review-b-luz','question','你问 Luz：「你昨天去拜访朋友了吗？」',['Did you went to see your friend yesterday?','Did you go to see your friend yesterday?','Do you went to see your friend yesterday?'],1)],
];
export const reviewById=new Map(reviewSets.flat().map(q=>[q.id,q]));
