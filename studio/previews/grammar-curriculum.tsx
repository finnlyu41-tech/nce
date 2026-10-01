import {useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {GrammarCurriculum,type GrammarCurriculumProps} from '../app/grammar-curriculum-ui';
import {LearningPractice} from '../app/learning-plan-ui';
import {GrammarExplanation} from '../app/grammar-explanation-ui';
import {grammarEntryFor,grammarGuidesFor} from '../app/textbook-grammar';
import {initial,validateState,type NceBookId,type State} from '../app/model';
import {navigate} from '../app/navigation';
import '../app/globals.css';
import '../app/textbook-grammar.css';

const previewKey='english-studio-grammar-preview-v1';
const legacy:State={...initial,nce:{'NCE1-1':{title:'保留的旧记录',text:'',notes:'原笔记不会因语法练习改变。',steps:['listen']}},drafts:{'expression-NCE1-1':'旧表达草稿'}};
function restore(){try{const state=JSON.parse(localStorage.getItem(previewKey)||'null');return validateState(state)?state:legacy}catch{return legacy}}
type Task=Parameters<NonNullable<GrammarCurriculumProps['onPracticeGuide']>>[3];
function Preview(){
 const [state,setState]=useState<State>(restore),[target,setTarget]=useState<{book:NceBookId;lesson:number;guideId?:string;task?:Task}|null>(null);
 useEffect(()=>{localStorage.setItem(previewKey,JSON.stringify(state))},[state]);
 const entry=target?grammarEntryFor(target.book,target.lesson):undefined;
 function practice(book:NceBookId,lesson:number,guideId:string,task?:Task){
  const entry=grammarEntryFor(book,lesson);if(!entry||!grammarGuidesFor(entry).some(g=>g.id===guideId))return;
  navigate({view:'nce',book,lesson,tab:'practice',goal:guideId,practice:'transfer'});
  setTarget({book,lesson,guideId,task});window.scrollTo(0,0);
 }
 return <main style={{maxWidth:1080,margin:'auto',padding:'24px 16px 64px'}}>
  <p className="small muted">本地审阅预览 · 学习记录保存在这个独立来源。旧笔记、旧草稿与新单元进度一起保留。</p>
  {entry&&target?<><button className="btn secondary" onClick={()=>setTarget(null)}>← 返回语法主线</button>{target.task&&<section className="panel section-space"><h2>这次换到新情境</h2><p>{target.task.prompt}</p><ul>{target.task.criteria.map(c=><li key={c}>{c}</li>)}</ul><p className="small muted">以下复用已有表达练习与草稿；新情境和自查标准由语法主线传入，不自动判断表达准确性。</p></section>}{target.guideId?<LearningPractice key={`${entry.id}-${target.guideId}`} book={target.book} lesson={target.lesson} state={state} update={setState}/>:<GrammarExplanation entry={entry} onPractice={id=>practice(target.book,target.lesson,id)}/>}</>:<GrammarCurriculum state={state} update={setState} onOpenLesson={(book,lesson)=>{setTarget({book,lesson});window.scrollTo(0,0)}} onPracticeGuide={practice}/>}
 </main>;
}
createRoot(document.getElementById('root')!).render(<Preview/>);
