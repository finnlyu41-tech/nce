import {useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {GrammarWorkspace} from '../app/grammar-workspace';
import {grammarUnits} from '../app/grammar-curriculum';
import {grammarClauseUnits} from '../app/grammar-curriculum-clauses';
import {grammarProgressKey,updateGrammarProgress,markGrammarSeen,revisitGrammarTheory} from '../app/grammar-curriculum-progress';
import {initial,validateState,type State} from '../app/model';
import {navigate} from '../app/navigation';
import {useRoute,useRouteScroll} from '../app/use-route';
import '../app/globals.css';
import '../app/textbook-grammar.css';

// Only this entry adds the independent delta to the real shared helpers. The
// registered curriculum entry and the normal site's storage stay untouched.
for(const unit of grammarClauseUnits)if(!grammarUnits.some(existing=>existing.id===unit.id))grammarUnits.push(unit);
const previewKey='english-studio-grammar-clauses-review-v1';
const example:State={...initial,nce:{'NCE1-1':{title:'兼容检查用旧记录样例',text:'',notes:'保留的示例笔记。',steps:['listen']}},drafts:{'expression-NCE1-1':'保留的示例自由表达草稿'}};
function restore(){try{const state=JSON.parse(localStorage.getItem(previewKey)||'null');return validateState(state)?state:example}catch{return example}}
function Preview(){
 const [state,setState]=useState<State>(restore),route=useRoute(),selected=route.unit||'';
 useEffect(()=>{if(!location.hash)navigate({view:'grammar',tab:'path'},{replace:true})},[]);
 useRouteScroll();
 useEffect(()=>{localStorage.setItem(previewKey,JSON.stringify(state))},[state]);
 function select(id:string){
  setState(previous=>{
   const departed=selected?updateGrammarProgress(previous,selected,revisitGrammarTheory):previous;
   return updateGrammarProgress(departed,id,markGrammarSeen);
  });
  navigate({view:'grammar',tab:'path',unit:id});
 }
 const inProgress=grammarClauseUnits.filter(unit=>{try{return JSON.parse(state.drafts[grammarProgressKey(unit.id)]||'null')?.inRound===true}catch{return false}}).length;
 return <main style={{maxWidth:1080,margin:'auto',padding:'24px 16px 64px'}}>
  <header className="panel" style={{marginBottom:24}}>
   <span className="eyebrow">独立本地审阅 · 尚未注册到主课程</span>
   <h1>从句、条件与篇章焦点</h1>
   <p>本批新增 5 个代表单元、19 个此前未深化知识点、30 道分层练习。与原 13 单元合并的本预览共有 18 单元，深化 64 / 97 个知识点；其余 33 项仍在补齐计划中。</p>
   <p className="small muted">这批内容仅供本地审阅，尚未发布。预览进度使用独立保存键；初始旧笔记与草稿为兼容检查样例。自由表达保留待核对状态，不自动判定成绩。</p>
   <nav className="row wrap" aria-label="本批五个新单元">{grammarClauseUnits.map(unit=><button key={unit.id} className="btn secondary" aria-pressed={selected===unit.id&&route.tab!=='practice'} onClick={()=>select(unit.id)}>{unit.order} · {unit.title}</button>)}</nav>
   {inProgress>0&&<p className="small muted" role="status">本批有 {inProgress} 个练习正在进行；重新打开可继续。</p>}
  </header>
  <GrammarWorkspace state={state} update={setState}/>
 </main>;
}
createRoot(document.getElementById('root')!).render(<Preview/>);
