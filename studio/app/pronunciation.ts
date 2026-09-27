export type AssessedPhoneme={phoneme:string;accuracy:number|null};
export type AssessedWord={word:string;accuracy:number|null;error:'None'|'Omission'|'Insertion'|'Mispronunciation';start:number;duration:number;phonemes?:AssessedPhoneme[]};
export type PronunciationResult={text:string;accuracy:number;fluency:number;completeness:number;words:AssessedWord[]};
export type PracticeIssue={word?:string;title:string;action:string;phoneme?:string;example?:string;clip?:{start:number;end:number}};

// Brief practice cues, not a diagnosis of the learner's tongue or mouth position.
// Articulation references: University of Groningen, An Introduction to American
// English Phonetics, chapters on fricatives and the front vowels.
const soundCues:Record<string,{action:string;example:string}>={
 'θ':{action:'舌尖轻靠上门牙边缘，让气流从缝隙通过，喉咙不振动。先试一遍，再放回单词。',example:'think'},
 'ð':{action:'舌尖轻靠上门牙边缘，让气流通过，同时发出声音；手放喉咙能感觉到振动。',example:'this'},
 'f':{action:'上门牙轻碰下唇，让气流从缝隙通过，喉咙不振动。',example:'five'},
 'v':{action:'上门牙轻碰下唇，让气流通过，同时让喉咙振动。',example:'very'},
 's':{action:'舌尖靠近上齿龈但不堵住气流，送出细长的气流，喉咙不振动。',example:'see'},
 'z':{action:'保持像 /s/ 一样的细小气流，同时让喉咙振动。',example:'zoo'},
 'ʃ':{action:'双唇略向前，舌头靠近上齿龈后方，让气流通过，喉咙不振动。',example:'she'},
 'ʒ':{action:'口形接近 /ʃ/，让气流通过，同时让喉咙振动。',example:'vision'},
 'ɪ':{action:'舌头靠前，位置比 /i/ 略低，嘴唇放松。听 it 的元音，再放回这个词。',example:'it'},
 'i':{action:'舌头靠前抬高，嘴唇向两侧展开；注意音质，别只把声音拉长。',example:'see'},
 'ɛ':{action:'舌头靠前，嘴张开一些，保持单一元音，不滑向 /ɪ/。',example:'bed'},
 'æ':{action:'下巴再放低一点，舌头靠前、舌尖靠近下门牙，嘴唇不收圆。',example:'cat'},
};
const validScore=(n:number|null|undefined):n is number=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=100;
function weakSound(word:AssessedWord){
 if(word.error==='Omission'||word.error==='Insertion')return;
 return word.phonemes?.filter(p=>p.phoneme&&validScore(p.accuracy)&&p.accuracy<60).sort((a,b)=>a.accuracy!-b.accuracy!)[0];
}
export function recordingWordClip(word:AssessedWord):PracticeIssue['clip']{
 if(word.error==='Omission'||!Number.isFinite(word.start)||!Number.isFinite(word.duration)||word.start<0||word.start>=30||word.duration<=0)return;
 return {start:Math.max(0,word.start-.12),end:Math.min(30,word.start+word.duration+.18)};
}

export function practiceIssues(result:PronunciationResult):PracticeIssue[]{
 const priority=(word:AssessedWord)=>Math.min(validScore(word.accuracy)?word.accuracy:100,weakSound(word)?.accuracy??100);
 const priorities=result.words.filter(w=>w.word.trim()&&(w.error!=='None'||priority(w)<60))
  .sort((a,b)=>(a.error==='Omission'?0:1)-(b.error==='Omission'?0:1)||priority(a)-priority(b));
 const seen=new Set<string>(),issues:PracticeIssue[]=[];
 for(const w of priorities){
  if(seen.has(w.word.toLowerCase()))continue;seen.add(w.word.toLowerCase());
  const phoneme=weakSound(w)?.phoneme,cue=phoneme?soundCues[phoneme]:undefined;
  issues.push({word:w.word,phoneme,example:cue?.example,clip:recordingWordClip(w),
   title:w.error==='Omission'?`可能漏读了 ${w.word}`:w.error==='Insertion'?`可能多读了 ${w.word}`:phoneme?`${w.word}：留意 /${phoneme}/`:`再听听 ${w.word} 的发音`,
   action:w.error==='Omission'?'听原句时找到这个词，再把前后几个词一起读出来。':w.error==='Insertion'?'对照原句，确认是否重复或多读，再完整读一遍。':cue?.action||'先听单词示范，再回听自己读的片段，把这个词和前后词连起来重读。'});
  if(issues.length===2)break;
 }
 if(issues.length<2&&result.fluency<70)issues.push({title:'再练一遍整句的连贯度',action:'听原声在哪里停顿，先慢速跟读，再用舒适的速度完整说一遍。'});
 return issues;
}

export function retryFeedback(before:PronunciationResult,after:PronunciationResult):string[]{
 return practiceIssues(before).filter(issue=>issue.word).map(issue=>{
  const previous=before.words.filter(w=>w.word.toLowerCase()===issue.word!.toLowerCase());
  const current=after.words.filter(w=>w.word.toLowerCase()===issue.word!.toLowerCase());
  // Repeated/unaligned words and omissions don't prove the old problem is fixed.
  if(previous.length!==1||current.length!==1)return `${issue.word}：这次未能可靠对齐，请回听确认。`;
  const a=previous[0],b=current[0];
  if(b.error==='Omission'||b.error==='Insertion')return `${issue.word}：仍有漏读或多读提示，先对照原句。`;
  if(a.error==='Omission')return `${issue.word}：本次已识别到这个词，再听是否读清楚。`;
  if(issue.phoneme){
   const oldSounds=a.phonemes?.filter(p=>p.phoneme===issue.phoneme)||[],newSounds=b.phonemes?.filter(p=>p.phoneme===issue.phoneme)||[];
   if(oldSounds.length!==1||newSounds.length!==1||!validScore(oldSounds[0].accuracy)||!validScore(newSounds[0].accuracy))return `${issue.word} /${issue.phoneme}/：本次数据不足，请回听比较。`;
   const delta=newSounds[0].accuracy-oldSounds[0].accuracy;
   return `${issue.word} /${issue.phoneme}/：${delta>=10?'本次匹配度提高了':delta<=-10?'本次匹配度降低了':'两次匹配度接近'}，请回听比较。`;
  }
  return `${issue.word}：${b.error==='None'&&validScore(b.accuracy)&&b.accuracy>=60?'本次没有同样的词级提示':'仍值得再练一次'}。`;
 });
}

export async function assessRecording(audio:string,reference:string,signal:AbortSignal):Promise<PronunciationResult>{
 const response=await fetch('/api/pronunciation',{method:'POST',signal,cache:'no-store',credentials:'omit',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({audio,reference,consent:true})});
 const data=await response.json() as {error?:unknown}&PronunciationResult;
 if(!response.ok)throw Error(typeof data.error==='string'?data.error:'评估暂时不可用，请保留录音稍后再试。');
 return data as PronunciationResult;
}
