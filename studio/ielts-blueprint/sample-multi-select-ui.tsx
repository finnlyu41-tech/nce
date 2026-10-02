import type {MultiSelectTask} from './curriculum/multi-select/types';
import {inspectMultiSelectEntry} from './curriculum/multi-select/projection';

export function SampleMultiSelectInput({task,rawAnswer,onChange}:{task:MultiSelectTask;rawAnswer:string;onChange:(raw:string)=>void}){
 const inspected=inspectMultiSelectEntry(task,rawAnswer);
 const invalid=!!rawAnswer.trim()&&!!inspected.issue&&inspected.issue!=='selection-count';
 const selected=invalid?[]:inspected.selected;
 function toggle(id:string,checked:boolean){
  const next=checked?[...selected,id]:selected.filter(value=>value!==id);
  onChange(next.join(' '));
 }
 return <fieldset className="sample-multi-select"><legend>{task.prompt}</legend>
  <p className="sample-note">选择 {task.selectionCount} 项 · 已选 {selected.length} 项。整组核对，顺序不限。</p>
  {task.options.map(option=><label className="sample-selection" key={option.id}><input type="checkbox" checked={selected.includes(option.id)} disabled={invalid} onChange={event=>toggle(option.id,event.target.checked)}/><span lang="en">{option.id}. {option.text}</span></label>)}
  <label className="sample-field">字母答案（也可直接修改）<input value={rawAnswer} autoComplete="off" autoCapitalize="characters" maxLength={500} onChange={event=>onChange(event.target.value)} aria-invalid={invalid||undefined}/></label>
  {invalid&&<p className="sample-note" role="status">先在字母答案中修正重复或范围外的字母，再点选选项。当前答案仍可提交并保留。</p>}
 </fieldset>;
}
