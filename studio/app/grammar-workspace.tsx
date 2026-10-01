import {useEffect} from 'react';
import type {NceBookId,State} from './model';
import {GrammarCurriculum} from './grammar-curriculum-ui';
import {grammarUnitFor,guideBelongsToEntry} from './grammar-curriculum';
import {grammarEntryFor} from './textbook-grammar';
import {TextbookGrammar} from './textbook-grammar-ui';
import {LearningPractice} from './learning-plan-ui';
import {useRoute} from './use-route';
import {navigate} from './navigation';
import {ONLINE} from './runtime-mode';
import {mapUnitId} from './map-connection';
import {updateGrammarProgress,revisitGrammarTheory,beginGrammarRound} from './grammar-curriculum-progress';

export function GrammarWorkspace({state,update}:{state:State;update:(change:(s:State)=>State)=>void}) {
  const route=useRoute(),tab=route.tab||(route.book?'book':'path'),curriculum=tab==='path'||tab==='practice';
  const unit=route.unit?grammarUnitFor(route.unit):undefined;
  useEffect(()=>{if(!route.check)return;if(unit)update(s=>updateGrammarProgress(s,unit.id,beginGrammarRound));navigate({...route,check:undefined},{replace:true,keepScroll:true})},[route.check,unit?.id]);
  const entry=route.book&&route.lesson?grammarEntryFor(route.book,route.lesson):undefined;
  const validPractice=!!entry&&!!route.goal&&guideBelongsToEntry(entry,route.goal)&&(!route.unit||!!unit&&unit.guideIds.includes(route.goal));
  const leaveUnit=()=>{if(unit)update(s=>updateGrammarProgress(s,unit.id,revisitGrammarTheory))};
  const openLesson=(book:NceBookId,lesson:number)=>{const id=ONLINE&&mapUnitId(book,lesson);if(id)location.href=`/map/#/learn/${id}`;else navigate({view:'nce',book,lesson,tab:'listen'})};
  if(route.check)return <p role="status">正在准备这一组检验…</p>;
  return <>
    <nav className="vocabulary-tabs" aria-label="句型语法学习方式">
      <button aria-current={curriculum?'page':undefined} className={curriculum?'active':''} onClick={()=>{leaveUnit();navigate({view:'grammar',tab:'path'})}}>按能力学习</button>
      <button aria-current={!curriculum?'page':undefined} className={!curriculum?'active':''} onClick={()=>{leaveUnit();navigate({view:'grammar',book:route.book||'NCE1',lesson:route.lesson,tab:'book'})}}>按教材查阅</button>
    </nav>
    {tab==='practice'?<>
      <button className="text-btn" onClick={()=>navigate({view:'grammar',tab:'path',unit:route.unit})}>← 回到{unit?.title||'语法主线'}</button>
      {validPractice?<LearningPractice key={`${route.book}-${route.lesson}-${route.goal}-${route.unit||''}`} book={route.book!} lesson={route.lesson!} state={state} update={update} context={{unitId:unit?.id,task:unit?.transfer}}/>:<p role="alert">这项练习与教材知识点不匹配，请回到主线重新选择。</p>}
    </>:curriculum?<GrammarCurriculum state={state} update={update} selectedUnit={route.unit||''} onSelectUnit={id=>navigate({view:'grammar',tab:'path',unit:id||undefined})} onOpenLesson={openLesson} onPracticeGuide={(book,lesson,goal,task)=>navigate({view:'grammar',tab:'practice',book,lesson,goal,practice:task?'transfer':'model',unit:task?.unitId})}/>:<TextbookGrammar/>}
  </>;
}
