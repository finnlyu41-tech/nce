'use client';
import {useId} from 'react';
import {projectTableStimulus} from './structured-table/projection';
import type {TableStimulusViewProps} from './structured-table/table-stimulus';
import type {GTTableOption} from './curriculum/gt-table-options/types';
import './gt-table-options.css';

/** Public table and list only; answers and feedback are supplied solely by the existing host. */
export function GTTableOptionsView({stimulus,options,answers,onAnswer,readOnly=false,idPrefix}:TableStimulusViewProps & {options:readonly GTTableOption[]}){
 const generated=useId(),prefix=idPrefix||'gt-table-'+generated,result=projectTableStimulus(stimulus);
 const readonly=readOnly||!onAnswer;
 if(!result.ok||options.length!==6||new Set(options.map(o=>o.letter)).size!==6)return <p role="alert">此表格选项需要核对，原答保留。</p>;
 const instruction=prefix+'-instruction',caption=prefix+'-caption',list=prefix+'-options';
 return <section className="gt-table-options" data-gt-table-id={stimulus.id} aria-labelledby={caption}>
  <p id={instruction}>{stimulus.instruction}</p>
  <ol id={list} className="gt-table-options__list" aria-label="本题完整选项" type="A">
   {options.map(o=><li key={o.letter} lang="en"><strong>{o.letter}</strong> — {o.text}</li>)}
  </ol>
  <div className="gt-table-options__viewport" role="region" aria-labelledby={caption} tabIndex={0}>
   <table aria-describedby={instruction+' '+list}><caption id={caption}>{stimulus.caption}</caption>
    <thead><tr><th scope="col">{stimulus.rowHeaderLabel}</th>{stimulus.columns.map((c,i)=><th key={c.id} scope="col" id={prefix+'-col-'+i}>{c.label}</th>)}</tr></thead>
    <tbody>{stimulus.rows.map((r,ri)=><tr key={r.id}><th scope="row" id={prefix+'-row-'+ri}>{r.label}</th>
     {stimulus.columns.map((c,ci)=>{
      const cell=r.cells[c.id],headers=prefix+'-row-'+ri+' '+prefix+'-col-'+ci;
      if(cell.kind==='text')return <td key={c.id} headers={headers} lang="en">{cell.text}</td>;
      const raw=answers[cell.questionId]||'',id=prefix+'-q-'+cell.questionNumber,known=options.find(o=>o.letter===raw);
      return <td key={c.id} headers={headers}><label id={id+'-label'}>Question {cell.questionNumber}</label>
       {readonly?<><input aria-labelledby={id+'-label '+headers} aria-describedby={instruction+' '+list} data-question-id={cell.questionId} readOnly value={raw}/><span lang="en">{known?.text||(!raw?'未填写':'保留原答')}</span></>:
        <select value={raw} data-question-id={cell.questionId} aria-labelledby={id+'-label '+headers} aria-describedby={instruction+' '+list}
         onChange={e=>onAnswer?.(cell.questionId,e.currentTarget.value)}>
         <option value="">请选择字母</option>{raw&&!known&&<option value={raw}>原答：{raw}</option>}
         {options.map(o=><option key={o.letter} value={o.letter}>{o.letter} — {o.text}</option>)}
        </select>}
      </td>;
     })}
    </tr>)}</tbody>
   </table>
  </div>
 </section>;
}
