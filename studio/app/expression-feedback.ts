// Deliberately small, local checks. A clean result is not a grammar or IELTS grade.
export type ExpressionIssue={id:string;kind:'language'|'practice';title:string;evidence:string;action:string;example?:string};
export type ExpressionContext={source?:string;minimum?:number;extend?:boolean;target?:string};
const words=(text:string)=>text.match(/[a-z]+(?:['’][a-z]+)*/gi)||[];
export const comparable=(text:string)=>words(text).join(' ').toLowerCase().replace(/’/g,"'");

function allExpressionIssues(text:string,context:ExpressionContext={}):ExpressionIssue[]{
 const input=text.slice(0,6000).replace(/[’‘]/g,"'"),issues:ExpressionIssue[]=[];
 const add=(id:string,pattern:RegExp,title:string,action:string,replace:(match:RegExpMatchArray)=>string)=>{
  const match=input.match(pattern);
  if(match)issues.push({id,kind:'language',title,evidence:match[0],action,example:replace(match)});
 };
 // Match bounded phrases only; do not infer the tense of an entire free answer.
 add('modal-to',/\b(I|you|he|she|it|we|they)\s+(can|could|will|would|should|must)\s+to\s+([a-z]+)\b/i,'情态动词后直接接动作','can / could / will / should / must 后接动词原形，去掉这里的 to。',m=>`${m[1]} ${m[2]} ${m[3]}`);
 const bare:Record<string,string>={swimming:'swim',cooking:'cook',reading:'read',playing:'play',going:'go',working:'work',swims:'swim',cooks:'cook',reads:'read',plays:'play',goes:'go',works:'work'};
 add('modal-base',/\b(I|you|he|she|it|we|they)\s+(can|could|will|would|should|must)\s+(swimming|cooking|reading|playing|going|working|swims|cooks|reads|plays|goes|works)\b/i,'这里的动作要用原形','情态动词后不加 -s 或 -ing，先把这个小片段读顺。',m=>`${m[1]} ${m[2]} ${bare[m[3].toLowerCase()]}`);
 const base:Record<string,string>={went:'go',saw:'see',ate:'eat',bought:'buy',came:'come',took:'take',made:'make',had:'have',did:'do',visited:'visit',worked:'work',played:'play',liked:'like'};
 add('did-base',/\b(did not|didn't|did (?:you|he|she|they|we|I))\s+(went|saw|ate|bought|came|took|made|had|did|visited|worked|played|liked)\b/i,'did 后面的动作还原','过去时间已经由 did 表达，后面的动词用原形。',m=>`${m[1]} ${base[m[2].toLowerCase()]}`);
 add('i-be',/\bI\s+(?:is|are)\b/i,'I 和 am 配对','先检查主语。I 用 am；其他主语需要分别检查。',()=>'I am');
 add('plural-be',/\b(you|we|they)\s+is\b/i,'这个主语通常用 are','you / we / they 后面用 are。这里只检查这一处搭配。',m=>`${m[1]} are`);
 add('singular-be',/\b(he|she|it)\s+are\b/i,'这个主语通常用 is','he / she / it 后面用 is。',m=>`${m[1]} is`);
 add('very-like',/\b(I|you|we|they|he|she)\s+very\s+(like|likes)\b/i,'“很喜欢”可以用 really like','very 不能这样直接修饰 like；把这里改为 really like。',m=>`${m[1]} really ${m[2]}`);
 add('there-number',/\bthere\s+is\s+(two|three|four|five|many|several)\s+([a-z]+s)\b/i,'复数物品用 there are','这里说的是多个物品，把 is 改成 are。',m=>m[0].replace(/\bis\b/i,'are'));
 const ing:Record<string,string>={read:'reading',swim:'swimming',cook:'cooking',play:'playing',walk:'walking',learn:'learning',watch:'watching',work:'working'};
 add('enjoy-ing',/\benjoy(?:s)?\s+to\s+(read|swim|cook|play|walk|learn|watch|work)\b/i,'enjoy 后的动作使用 -ing','把这个动作改成 -ing 形式，连同 enjoy 一起练。',m=>m[0].replace(/to\s+[a-z]+$/i,ing[m[1].toLowerCase()]));
 if(issues.length)return issues;
 const count=words(input).length;
 if(count<(context.minimum??3))return [{id:'short',kind:'practice',title:'先补成一个能听懂的句子',evidence:input.trim(),action:'先说清谁或什么，再补动作或状态。可以先用中文想好，再写一句英语。'}];
 if(context.source&&comparable(input)===comparable(context.source))return [{id:'copy',kind:'practice',title:'这还是原句，再换一个内容',evidence:input.trim(),action:'保留有用的句型，换成人物、物品、时间或自己的情况。不要只改标点。'}];
 const targets:Record<string,[RegExp,string]>={
  ownership:[/\b(my|your|his|her|their|our|mine|yours|belongs?)\b/i,'说清物品属于谁，例如用 my / your 或 belongs to。'],
  request:[/\b(please|could|would|can|mind)\b/i,'对别人提出一个请求。先用 Could you…? 或 Please… 开始。'],
  place:[/\b(there|near|in|at|beside|opposite|next to|close to)\b/i,'说出一个地方以及它在哪里，再补充你在那里做什么。'],
  identity:[/\b(am|is|are|work|study|live|'m|'s|'re)\b/i,'先介绍一个人的身份或现状，再补一个生活细节。'],
  feeling:[/\b(feel|felt|am|is|are|'m|'s|'re)\b/i,'说出一种状态或感受，再说需要什么。'],
  ability:[/\b(can|cannot|can't|could|able|manage|know how)\b/i,'说清会做什么，或还不会做什么。先用 I can… 起步。'],
  future:[/\b(will|going to|plan|intend|tomorrow|next)\b/i,'说出一个未来计划，再补时间或同行的人。'],
  past:[/\b(yesterday|last|ago|was|were|went|did|had|felt|took|saw|\w+ed)\b/i,'讲一件过去的事，先点明时间，再检查动作形式。'],
  preference:[/\b(like|love|enjoy|prefer|favourite|favorite)\b/i,'说清一个喜好，并补上你的原因。'],
  habit:[/\b(usually|often|always|sometimes|every|daily|weekly|once|twice)\b/i,'讲一个日常习惯，并告诉别人多久做一次。'],
  progressive:[/\b(am|is|are|'m|'s|'re)\s+\w+ing\b/i,'这轮练“正在发生”：用 am / is / are + 动作 -ing。'],
  perfect:[/\b(have|has|'ve|'s)\s+(?:just |already |never )?\w+/i,'说一件已经完成的事，并连接现在的情况；试着使用 have / has + 过去分词。'],
  conditional:[/\b(if|unless|provided|as long as)\b/i,'说明一个条件，以及在这个条件下你会怎样做。'],
  reason:[/\b(because|since|as|so|therefore|reason|why|due to)\b/i,'把选择和原因连起来。初次练可以使用 because。'],
  contrast:[/\b(although|though|however|but|yet|despite|nevertheless)\b/i,'这次要讲清两面：先说困难，再说实际发生的事。'],
  comparison:[/\b(than|more|less|better|worse|prefer|compared)\b/i,'明确比较两样东西，再说自己选择哪个、为什么。'],
  passive:[/\b(is|are|was|were)\s+(?:\w+ly\s+)?\w+/i,'从事物出发介绍它的来历，可以使用 was built / was repaired。'],
  relative:[/\b(who|which|that|whose|where)\b/i,'先说人或物，再用 who / which / that 补充一个特点。'],
 };
 const target=context.target&&targets[context.target];
 if(target&&!target[0].test(input))return [{id:'target',kind:'practice',title:'再检查有没有练到这次的用途',evidence:input.trim(),action:target[1]+' 这是练习提示；其他正确表达也可能未被识别。'}];
 if(context.extend&&count<12)return [{id:'detail',kind:'practice',title:'再补一个具体细节',evidence:input.trim(),action:'先保留这句话，再补什么时候、在哪里或为什么中的一项。这是展开练习，不是在判语法错误。'}];
 return [];
}

export function expressionFeedback(text:string,context:ExpressionContext={}):ExpressionIssue[]{
 return allExpressionIssues(text,context).slice(0,2);
}

export function compareExpression(before:string,after:string,context:ExpressionContext={}){
 const previous=expressionFeedback(before,context),current=expressionFeedback(after,context);
 return {changed:comparable(before)!==comparable(after),resolved:previous.filter(p=>!allExpressionIssues(after,context).some(c=>c.id===p.id)),remaining:current};
}
