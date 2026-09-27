'use client';
import {useEffect,useState} from 'react';
import {ArrowRight,RotateCcw} from 'lucide-react';
import {Checkbox} from '@/components/ui/checkbox';
import {toast} from 'sonner';
import {type State,type NceBookId} from './model';
import {navigate} from './navigation';
import {ONLINE} from './runtime-mode';
import {bookNames,studyUnit,recommendedStudy,reviewChecks,reviewInterval,saveUnitReview} from './study-path';
import {guideFor,readGuide} from './expression-guide';
import {loadLessonLanguage,type LessonLanguage} from './language';
import {splitLesson} from './lesson-structure';

export function StudyRoute(){
 const stages=[
  {title:'一册 · 两课一起学',body:'72 组课文与句型练习。先理解、听清，再用几个简单句说自己的事。',check:'能听懂同难度的新对话，并完成基础表达。',action:'从第一册开始',go:()=>navigate({view:'nce',book:'NCE1'})},
  {title:'二册 · 把语言用起来',body:'练短文听力、复述和段落写作；中后段逐步加入雅思日常话题。',check:'能讲清一段经历，也能写成连贯短文。',action:'进入第二册',go:()=>navigate({view:'nce',book:'NCE2'})},
  {title:'三册选学 · 雅思衔接',body:'按弱项选学三册，更多时间用于雅思听说读写。四册可留到以后。',check:'熟悉题型，知道自己卡在理解、表达还是时间。',action:'开始雅思衔接',go:()=>navigate({view:'ielts',tab:'listening'})},
  {title:'专项训练 · 完整模考',body:'使用未做过的官方材料，按考试时间完成；口语和写作接受专业反馈。',check:'多次完整模考达到自己的总分及单项要求。',action:'查看官方练习',go:null}
 ];
 return <div className="study-route"><p className="muted small">以雅思 6.5 为方向，按实际能力调整进度；下面是学习建议，教材册数和自查勾选不换算成考试分数。</p><div className="ielts-roadmap">{stages.map((stage,i)=><section key={stage.title}><span>0{i+1}</span><h3>{stage.title}</h3><p>{stage.body}</p><p className="stage-check">{stage.check}</p>{stage.go?<button className="text-btn" onClick={stage.go}>{stage.action}<ArrowRight size={15}/></button>:<a className="text-btn" href="https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test" target="_blank" rel="noreferrer">{stage.action}<ArrowRight size={15}/></a>}</section>)}</div></div>
}

export function TodayStudy({state}:{state:State}){
 const next=recommendedStudy(state),draft=readGuide(state.drafts[`expression-${next.book}-${next.first}`]);
 const [language,setLanguage]=useState<LessonLanguage|null>(null);
 useEffect(()=>{let active=true;setLanguage(null);void loadLessonLanguage(next.book,next.first).then(data=>{if(active)setLanguage(data)});return()=>{active=false}},[next.book,next.first]);
 const goal=language?guideFor(splitLesson(language.rows,next.book,true).body,next.book).goal:'听懂本课一句，再换成自己的内容';
 const step=(next.review&&draft.retry.trim())||(draft.saved&&!draft.checkpointAt)?4:draft.step;
 const extra=draft.saved&&draft.checkpointAt>0&&!next.review;
 const tasks=['听懂一句，写下它的意思','替换句型，准备自己的关键词','说两句，留下第一版','检查修改版，再录一次比较','不看句架，完成换情境检验'];
 const task=extra?'做 3 道本课回顾，再打开配套练习':tasks[step];
 return <section className="panel today-course"><div><span className="eyebrow">{next.review?'今天先复习这一小步':'今天先做这一小步'} · 约 {extra?5:step===3?5:3} 分钟</span><h3>{task}</h3><p className="small">{bookNames[next.book]} · {next.label} · {goal}</p><p className="muted small">{next.review?`有 ${next.dueCount} 组到期。保留上次记录，换一个情境重新试。`:extra?'表达记录已保存，接着巩固课文里的词和句型。':'完成这一小步就可以暂停，文字会自动保存。'}</p></div><button className="btn" onClick={()=>navigate({view:'nce',book:next.book,lesson:next.first,tab:extra?'practice':'notes',step:extra?undefined:step})}>{next.review?<RotateCcw size={16}/>:<ArrowRight size={16}/>} {next.review?'开始这次回顾':extra?'进入本课回顾':'开始这一小步'}</button></section>
}

export function UnitReview({book,lesson,state,update,open}:{book:NceBookId,lesson:number,state:State,update:(fn:(state:State)=>State)=>void,open:(lesson:number,tab?:string)=>void}){
 const unit=studyUnit(book,lesson),review=state.nce?.[unit.key]?.review;
 const [checks,setChecks]=useState<string[]>(review?.checks||[]),[saved,setSaved]=useState(false);
 useEffect(()=>{setChecks(review?.checks||[])},[review]);
 const prompts=[
  '我能说清这组内容的意思，关键的词和句子也理解。',
  book==='NCE1'?'隐藏原文后，我能听懂配对课文的主要内容。':'隐藏原文后，我能听懂主要内容和关键细节。',
  book==='NCE1'?'换成人物、物品或自己的情况，我能说出几句。':'减少提示后，我能用自己的话复述，并补充自己的经历或观点。'
 ];
 const days=reviewInterval(checks,review),all=reviewChecks.every(check=>checks.includes(check));
 function save(){update(s=>saveUnitReview(s,book,lesson,checks));setSaved(true);toast.success(`自查已保存，${days===1?'明天':'3 天后'}会在今日学习中显示复习入口`)}
 return <section className="panel unit-review section-space"><div className="section-top"><div><span className="eyebrow">{unit.label} · 学后与隔天回顾</span><h3>听懂了吗？能自己表达吗？</h3></div><RotateCcw size={20}/></div><p className="muted small">先实际试一遍，再勾选能做到的项。这里记录你的自查，完成训练的勾选会另外保留。</p><div className="review-evidence"><p className="small">先实际做一道换情境题，再记录下方的理解、听辨与表达自查。</p><button className="btn secondary" onClick={()=>navigate({view:'nce',book,lesson:unit.first,tab:'notes',step:4})}>去做换情境小检验 <ArrowRight size={16}/></button></div><div className="checklist">{reviewChecks.map((check,i)=><label key={check}><Checkbox checked={checks.includes(check)} onCheckedChange={value=>{setChecks(old=>value?[...old,check]:old.filter(x=>x!==check));setSaved(false)}}/><span>{prompts[i]}</span></label>)}</div><div className="row wrap"><button className="btn" disabled={saved} onClick={save}>{saved?'已保存本次自查':`保存自查 · ${days===1?'明天':'3 天后'}复习`}</button>{unit.next&&<button className="btn secondary" onClick={()=>open(unit.next!)}>进入{book==='NCE1'?'下一组':'下一课'}<ArrowRight size={16}/></button>}</div>{review&&<p className="muted small">已保存 {review.checks.length} / 3 项自查 · 下次复习：{new Date(review.dueAt).toLocaleDateString('zh-CN')}。{review.dueAt<=Date.now()?'现在可以重新试一遍。':'到时会显示在站内今日学习中。'}</p>}{saved&&!all&&<div className="review-help"><strong>下一次先练没勾选的部分</strong><div className="row wrap">{!checks.includes('meaning')&&<button className="text-btn" onClick={()=>open(unit.first,'words')}>回到词句，弄懂关键表达<ArrowRight size={14}/></button>}{!checks.includes('listening')&&<button className="text-btn" onClick={()=>open(unit.first,ONLINE?'materials':'listen')}>回到课文，分句听再关掉提示<ArrowRight size={14}/></button>}{!checks.includes('expression')&&<span className="small">先看关键词说一句，再替换成自己的情况。</span>}</div></div>}</section>
}
