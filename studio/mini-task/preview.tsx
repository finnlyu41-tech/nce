import {createRoot} from 'react-dom/client';
import {MiniTaskWorkspace} from '../app/mini-task-ui';
import {miniTasks} from './content';
const selected=new URLSearchParams(location.search).get('task')||miniTasks[0].id;
createRoot(document.getElementById('root')!).render(<><nav aria-label="验收任务选择" style={{padding:12}}>{miniTasks.map(t=><a style={{marginRight:12}} key={t.id} href={`?task=${t.id}`}>{t.title}</a>)}</nav><MiniTaskWorkspace key={selected} taskId={selected}/></>);
