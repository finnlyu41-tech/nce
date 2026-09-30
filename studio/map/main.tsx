import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, Check, Lock, Flag, Clock3, BookOpen, Download, Upload, RotateCcw, ChevronRight, X, Milestone, Unlock, Settings2 } from 'lucide-react';
import { nodes, nodeById, stages, originalSite, questionsFor, type MapNode } from './content';
import { achieved, continueNode, learningLabel, manuallyUnlocked, unlockNode, chapterProgress, legacyStorageKey, emptyProgress, parseProgress, storageKey, statusMap, due, officialReached, exportProgress, type Progress } from './model';
import { LearningGraph, type GraphHandle, skillIcon } from './graph';
import { LearningRoom, type Save } from './learning';
import './style.css';
import { StudioHeader } from '../app/study-mode';
const parseRoute = (fallback = 'first') => { const match = location.hash.match(/^#\/(map|learn)\/([a-z0-9-]+)$/); return { id: match && nodeById(match[2]) ? match[2] : fallback, learn: !!match && match[1] === 'learn' }; };
function App() {
    const raw = useRef<string | null>(null);
    const [message, setMessage] = useState('');
    const [storageError, setStorageError] = useState('');
    const [state, setState] = useState<Progress>(() => { try {
        raw.current = localStorage.getItem(storageKey);
        return raw.current ? parseProgress(raw.current) : emptyProgress();
    }
    catch {
        return emptyProgress();
    } });
    const stateRef = useRef(state);
    stateRef.current = state;
    const [route, setRoute] = useState(() => parseRoute(continueNode(state).id));
    const [mobile, setMobile] = useState(window.innerWidth < 760);
    const graph = useRef<GraphHandle>(null);
    const importInput = useRef<HTMLInputElement>(null);
    const [restore, setRestore] = useState<Progress | null>(null);
    const restoreDialog = useRef<HTMLDialogElement>(null);
    useEffect(() => { try {
        const current = localStorage.getItem(storageKey);
        if (current)
            parseProgress(current);
    }
    catch {
        setStorageError('学习记录暂时无法读取。原始记录仍保留，请先导出原始记录或检查浏览器存储。');
    } }, []);
    useEffect(() => { const hash = () => setRoute(parseRoute()), resize = () => setMobile(window.innerWidth < 760); window.addEventListener('hashchange', hash); window.addEventListener('resize', resize); return () => { window.removeEventListener('hashchange', hash); window.removeEventListener('resize', resize); }; }, []);
    const save: Save = useCallback(change => { const next = { ...change(stateRef.current), updatedAt: Date.now() }; try {
        const latest = localStorage.getItem(storageKey);
        if (latest !== raw.current) {
            const incoming = latest ? parseProgress(latest) : emptyProgress();
            raw.current = latest;
            setState(incoming);
            setMessage('另一页面更新了进度，已加载最新记录。请重试刚才的操作。');
            return;
        }
        if (latest)
            parseProgress(latest);
        const encoded = JSON.stringify(next);
        localStorage.setItem(storageKey, encoded);
        raw.current = encoded;
        stateRef.current = next;
        setState(next);
        setStorageError('');
    }
    catch (e) {
        stateRef.current = next;
        setState(next);
        setStorageError(`尚未存入浏览器：${e instanceof Error ? e.message : '存储不可用'}。输入仅暂存在当前页面，请先导出进度，刷新会丢失未保存部分。`);
    } }, []);
    useEffect(() => { const storage = (event: StorageEvent) => { if (event.key === storageKey) {
        try {
            const incoming = event.newValue ? parseProgress(event.newValue) : emptyProgress();
            raw.current = event.newValue;
            setState(incoming);
            setMessage('已同步本浏览器其他页面的进度。');
        }
        catch {
            setStorageError('另一个页面写入了无法读取的记录，已暂停保存。');
        }
    } }; window.addEventListener('storage', storage); return () => window.removeEventListener('storage', storage); }, []);
    useEffect(() => { if (restore)
        restoreDialog.current?.showModal(); }, [restore]);
    const selected = nodeById(route.id)!;
    const graphSelected = selected.parent ? nodeById(selected.parent)! : selected;
    const [legacy, setLegacy] = useState(()=>{try{return localStorage.getItem(legacyStorageKey)}catch{return null}});
    const statuses = statusMap(state);
    const passed = nodes.filter(n => achieved(n,state)).length;
    const review = nodes.filter(n => due(n, state));
    const current = continueNode(state).id;
    const navigate = (id: string, learn = false) => { const next = `#/${learn ? 'learn' : 'map'}/${id}`; if (location.hash === next)
        setRoute({ id, learn });
    else
        location.hash = next; };
    const focus = (id: string) => {const n=nodeById(id)!;navigate(id,!!n.parent); graph.current?.focus(n.parent||id); };
    function download(content: string, name: string) { const url = URL.createObjectURL(new Blob([content], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
    async function readFile(file?: File) { if (!file)
        return; try {
        if (file.size > 6000000)
            throw new Error('文件超过 6 MB。');
        setRestore(parseProgress(await file.text()));
    }
    catch (e) {
        setMessage(`无法恢复：${e instanceof Error ? e.message : '格式不正确'}`);
    }
    finally {
        if (importInput.current)
            importInput.current.value = '';
    } }
    return <><StudioHeader active="map" classicRoot={originalSite} mapUrl={`#/map/${route.id}`} actions={<details className="map-settings"><summary><Settings2 size={17}/><span>学习设置</span></summary><div><strong>解锁方式</strong><p>解锁允许直接进入，完成状态仍由实际学习记录决定。</p>{state.access?.all?<p className="manual-note">全部节点已手动解锁</p>:<button onClick={()=>save(s=>({...s,access:{all:true,nodes:s.access?.nodes||[]}}))}><Unlock size={16}/>直接解锁全部节点</button>}{(state.access?.all||!!state.access?.nodes.length)&&<button onClick={()=>save(s=>({...s,access:{all:false,nodes:[]}}))}>恢复按路线解锁</button>}<small>恢复路线规则会保留所有学习记录。</small><hr/><strong>地图进度备份</strong><button onClick={()=>download(exportProgress(state),`wayfinder-progress-${new Date().toISOString().slice(0,10)}.json`)}><Download size={16}/>导出地图进度</button><button onClick={()=>importInput.current?.click()}><Upload size={16}/>恢复地图进度</button><small>教材笔记、生词的备份在「记录」页。录音需单独下载。</small></div></details>}/>

  <main className="app-main"><section className="page-heading"><div><h1>学习地图</h1><p>从零基础走向 IELTS 6.5。按路线学习，也能直接解锁想学的内容。</p></div><div className="heading-next"><span>{passed} / {nodes.length} 站完成学习</span><button className="primary" onClick={()=>navigate(current,true)}>继续学习<ArrowRight size={17}/></button><small>{nodeById(current)!.title}</small></div></section>
   <nav className="stage-nav" aria-label="路线阶段">{stages.map((s, i) => <button className={selected.stage === s.id ? 'active' : ''} key={s.id} onClick={() => { const first = nodes.find(n => n.stage === s.id)!; navigate(first.id); graph.current?.stage(s.id); }}><span>{String(i + 1).padStart(2, '0')}</span>{['零基础', '新概念一册', '新概念二册', '听说读写', '6.5 终点'][i]}{i < 4 && <ChevronRight size={13}/>}</button>)}</nav>
   {storageError && <div role="alert" className="storage-error">{storageError}<button onClick={() => download(raw.current || '{}', 'wayfinder-original-record.json')}>导出原始记录</button></div>}
   {legacy&&<div className="legacy-notice"><span>旧版地图记录已保留。新版从零基础连续课程开始，旧的小测通过不自动换算成新课程掌握。</span><button onClick={()=>download(legacy,'wayfinder-v1-preserved.json')}>导出旧版记录</button><button aria-label="收起旧版记录提醒" onClick={()=>setLegacy(null)}><X size={15}/></button></div>}
   <div className="workspace"><LearningGraph state={state} selected={graphSelected.id} select={id => navigate(id, mobile)} mobile={mobile} current={current} ref={graph}/><aside className="node-panel" aria-label="选中节点详情"><NodeDetails node={graphSelected} status={statuses[graphSelected.id]} state={state} focus={focus} start={() => navigate(graphSelected.id, true)} current={current} unlock={()=>{save(s=>unlockNode(s,graphSelected.id));navigate(graphSelected.id,true)}}/><div className="panel-bottom"><div className="next-review"><RotateCcw size={16}/><div><strong>{review.length ? `${review.length} 个节点待巩固` : '小步前进，也记得回头看看'}</strong><p>{review.length ? '换题回想，让学过的内容留下来。' : '通过检验的内容，第二天再回想一次。'}</p></div>{review.length > 0 && <button aria-label="打开待复习节点" onClick={() => focus(review[0].id)}><ArrowRight size={17}/></button>}</div><div className="save-tools"><span><i className="live-dot"/>进度保存在此浏览器</span><button aria-label="导出学习地图进度" title="导出进度" onClick={() => download(exportProgress(state), `wayfinder-progress-${new Date().toISOString().slice(0, 10)}.json`)}><Download size={16}/></button><button aria-label="恢复学习地图进度" title="恢复进度" onClick={() => importInput.current?.click()}><Upload size={16}/></button><input type="file" hidden ref={importInput} accept="application/json,.json" onChange={e => readFile(e.target.files?.[0])}/></div></div></aside></div>
   <footer className="site-footer"><span>一张地图，一步一个目标。</span><span>Academic 6.5 <i /> 学习解锁规则为本站练习安排</span></footer>
  </main>
  {message && <div className="toast" role="status">{message}<button aria-label="关闭提示" onClick={() => setMessage('')}><X size={16}/></button></div>}
  {route.learn && <LearningRoom key={selected.id} node={selected} state={state} save={save} close={() => navigate(selected.id)} select={id => navigate(id, true)}/>}
  {restore && <dialog className="restore-dialog" ref={restoreDialog} onCancel={() => setRestore(null)} aria-labelledby="restore-title"><h2 id="restore-title">恢复地图进度</h2><p>备份中有 {Object.keys(restore.records).length} 个节点记录。确认后替换本地图进度；教材笔记、生词等原有记录会保留。</p><p>当前进度会先下载为一份回退备份。</p><div><button className="secondary" onClick={() => setRestore(null)}>取消</button><button className="primary" onClick={() => { download(raw.current || exportProgress(state), 'wayfinder-before-restore.json'); try {
        const encoded = JSON.stringify(restore);
        localStorage.setItem(storageKey, encoded);
        raw.current = encoded;
        stateRef.current = restore;
        setState(restore);
        setStorageError('');
        setMessage('已恢复并重新核验节点解锁条件。');
        setRestore(null);
    }
    catch {
        setStorageError('恢复失败：浏览器无法保存数据，原进度未替换。');
    } }}>备份当前进度并恢复</button></div></dialog>}
 </>;
}
function NodeDetails({ node, status, state, focus, start, current, unlock }: {
    node: MapNode;
    status: string;
    state: Progress;
    focus: (id: string) => void;
    start: () => void;
    current: string;
    unlock: () => void;
}) {
    const Icon = node.kind === 'finish' ? Flag : node.kind === 'checkpoint' ? Milestone : skillIcon(node.lane);
    const index = nodes.indexOf(node) + 1;
    const required = node.requires.filter(id => statusMap(state)[id] !== 'passed');
    const goal = node.kind === 'course' ? '完成本章 12 组学习、隔至少 24 小时换题巩固，并提交自己的口头与书面作品及评阅反馈。' : node.kind === 'starter' ? '先听懂和认形，通过点击作答完成起步检验。这里不要求先会打英文。' : node.kind === 'lesson' ? `在不看提示的情况下，独立完成 ${questionsFor(node).length} 道知识点检验。` : node.kind === 'checkpoint' ? '换一组混合题，全部独立答对，解锁下一段路线。' : node.kind === 'task' ? node.mission?.assignment?.check : node.kind === 'mock' ? '完成整套 Academic 新题，总分至少 6.5，并满足已确认的单项要求。' : '两套模考达到准备度参考；正式成绩单确认最终结果。';
    return <div className="node-details"><div className="selection-label"><span>{node.id === current ? '你的下一步' : '正在查看'}</span><span>站点 {String(index).padStart(2, '0')}</span></div><div className={`detail-icon ${status}`}><Icon size={28}/></div><div className={`status-badge ${status}`}>{status === 'locked' ? <Lock size={12}/> : status === 'passed' ? <Check size={12}/> : <span className="live-dot"/>}{status === 'locked' ? '等待解锁' : status === 'passed' ? node.kind === 'finish' ? officialReached(state) ? '正式成绩已登记' : '模考准备度已达标' : '已通过' : '已解锁 · 可以开始'}</div><h2>{node.title}</h2><p className="completion-label">{manuallyUnlocked(node,state)&&<span>手动解锁 · </span>}{learningLabel(node,state)}</p><p className="detail-description">{node.subtitle}</p><div className="detail-meta">{node.minutes > 0 && <span><Clock3 size={14}/>{node.minutes} 分钟 / 本轮</span>}<span><BookOpen size={14}/>{node.kind === 'task' ? '实践 + 评阅' : node.kind === 'mock' ? '完整模考' : node.kind === 'finish' ? '终点' : '讲解 + 检验'}</span></div>
  {node.kind==='course'&&<div className="detail-course-progress"><span>{chapterProgress(node,state).learned} / 12 初次通过</span><span>{chapterProgress(node,state).stable} / 12 隔日巩固</span><small>{node.stage==='foundation'?`新概念一册 · 第 ${node.chapter!*24+1}–${(node.chapter!+1)*24} 课`:`新概念二册 · 第 ${(node.chapter!-6)*12+1}–${(node.chapter!-5)*12} 课`}</small></div>}
  <div className="unlock-goal"><div><Flag size={15}/><strong>这一站的目标</strong></div><p>{goal}</p></div>
  {status === 'locked' ? <div className="prerequisites"><button className="primary full" onClick={unlock}><Unlock size={17}/>直接解锁并学习</button><p className="panel-hint">只开放这一站，不会标记已完成。解锁章节也会开放其中的课次。</p><strong>或按推荐路线完成</strong>{required.map(id => <button key={id} onClick={() => focus(id)}><Lock size={13}/><span>{nodeById(id)!.title}</span><ArrowRight size={14}/></button>)}<button className="secondary full" onClick={() => focus(current)}>回到我能开始的地方<ArrowRight size={16}/></button></div> : <><button className="primary full start-learning" onClick={start}>{status === 'passed' ? node.kind === 'finish' ? '查看终点记录' : '再练一次 / 查看记录' : '进入这一站'}<ArrowRight size={17}/></button><p className="panel-hint">{node.kind === 'finish' ? '成绩以 IELTS 成绩单及接收机构要求为准。' : node.kind === 'task' || node.kind === 'mock' ? '满足本节点的检验条件，后续路线自动解锁。' : '先理解，再自己试。通过后，下一站会点亮。'}</p></>}
 </div>;
}
createRoot(document.getElementById('root')!).render(<App />);
