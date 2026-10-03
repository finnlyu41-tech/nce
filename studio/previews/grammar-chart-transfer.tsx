import {useState,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {GrammarCurriculum} from '../app/grammar-curriculum-ui';
import {initial,validateState,type State} from '../app/model';
import '../app/globals.css';
const previewKey='english-studio-chart-transfer-preview-v1';
function restore():State{try{const parsed=JSON.parse(localStorage.getItem(previewKey)||'null');return validateState(parsed)?parsed:initial}catch{return initial}}
function Preview(){
 const [state,setState]=useState<State>(restore),[unit,setUnit]=useState('comparisons');
 useEffect(()=>{localStorage.setItem(previewKey,JSON.stringify(state))},[state]);
 return <main style={{maxWidth:1080,margin:'auto',padding:'24px 16px 64px'}}><p className="small muted">独立合成审阅来源 · 当前生产课程组件 · 本预览只保存本来源的合成草稿。</p><a className="btn secondary" href="#grammar-chart-transfer-comparisons">进入图表应用</a><GrammarCurriculum state={state} update={setState} selectedUnit={unit} onSelectUnit={setUnit}/></main>;
}
createRoot(document.getElementById('root')!).render(<Preview/>);
