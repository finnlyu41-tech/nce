'use client';
import {useEffect, useRef, useState} from 'react';
import {ChevronDown, Cloud, Download, FolderOpen} from 'lucide-react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {toast} from 'sonner';
import {State} from './model';
import {downloadProgress, makeProgressFile, readProgressFile, saveProgressToFiles, ProgressSnapshot} from './progress-file';
import './progress-save.css';
import {ONLINE} from './runtime-mode';

type Props = {state: State; ready: boolean; status: string; restore: (state: State) => Promise<void>};
const message = (error: unknown) => error instanceof Error ? error.message : '操作未完成，请重试。';

export function ProgressSave({state, ready, status, restore}: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<ProgressSnapshot | null>(null);
  const [previous, setPrevious] = useState<State | null>(null);
  const [receipt, setReceipt] = useState('');
  const [standalone, setStandalone] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const working = useRef(false);
  useEffect(() => {
    setStandalone(window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & {standalone?: boolean}).standalone === true);
  }, []);

  async function save(toFiles = false) {
    if (!ready || working.current) return;
    working.current = true;
    setBusy(true);
    setReceipt('');
    try {
      const file = makeProgressFile(state);
      const result = toFiles || standalone ? await saveProgressToFiles(file) : downloadProgress(file);
      if (result === 'cancelled') return;
      const text = result === 'written' ? '进度文件已写入所选位置。iCloud 上传状态请在「文件」或 Finder 中确认。'
        : result === 'shared' ? '系统面板已关闭，请在「文件」中确认进度文件已保存。'
        : toFiles || standalone ? '已发起文件下载，请确认文件已保存；可将它移到 iCloud Drive。' : '已发起进度文件下载，请在浏览器下载列表确认。';
      setReceipt(text);
      toast(text);
    } catch (error) { toast.error(`保存未完成。${message(error)}`); }
    finally { working.current = false; setBusy(false); }
  }

  async function choose(file?: File) {
    if (!file || working.current) return;
    working.current = true;
    setBusy(true);
    try { setPending(await readProgressFile(file)); setReceipt(''); }
    catch (error) { toast.error(message(error)); }
    finally {
      if (input.current) input.current.value = '';
      working.current = false;
      setBusy(false);
    }
  }

  async function apply() {
    if (!pending || working.current) return;
    working.current = true;
    setBusy(true);
    try {
      const before = state;
      await restore(pending.state);
      setPrevious(before);
      setPending(null);
      setReceipt('进度已恢复并保存到当前浏览器。');
      toast.success('进度已恢复并保存到当前浏览器');
    } catch (error) { toast.error(`恢复未完成，当前进度保留。${message(error)}`); }
    finally { working.current = false; setBusy(false); }
  }

  return <>
    <div className="progress-save-actions">
      <button className="btn secondary small progress-save-button" disabled={!ready || busy} onClick={() => save()} title="将当前学习进度保存为文件">
        <Download size={16}/><span>{busy ? '处理中…' : '保存进度'}</span>
      </button>
      <button className="icon-btn progress-save-more" disabled={!ready || busy} onClick={() => setOpen(true)} aria-label="进度备份与恢复" aria-haspopup="dialog" aria-expanded={open} title="进度备份与恢复">
        <ChevronDown size={16}/>
      </button>
    </div>
    <Dialog open={open} onOpenChange={value => { if (!busy) { setOpen(value); if (!value) setPending(null); } }}>
      <DialogContent className="progress-save-dialog">
        <DialogHeader><DialogTitle>{pending ? '恢复这份学习进度？' : '保存与恢复进度'}</DialogTitle>
          <DialogDescription>{pending ? !pending.state.flashcards&&state.flashcards ? '课程、笔记和草稿将按文件恢复；当前闪卡记录会保留，并补入旧备份中缺失的词卡。请先保存当前进度，以便回退。' : '确认后，当前浏览器的学习记录会被这份文件替换。请先保存当前进度，以便随时回退。' : '随时留一份进度文件，换设备也能继续学。'}</DialogDescription>
        </DialogHeader>
        {pending ? <>
          <div className="progress-file-summary">
            <strong>{pending.savedAt ? `保存于 ${new Date(pending.savedAt).toLocaleString('zh-CN')}` : '这份备份未记录保存时间'}</strong>
            <p>{Object.keys(pending.state.nce || {}).length} 个课次记录 · {Object.keys(pending.state.flashcards?.cards||pending.state.cards).length} 张复习卡 · {Object.keys(pending.state.drafts).length} 份练习草稿</p>
            <p>恢复包含笔记、生词、学习记录和文字草稿；不会替换本机教材音频。</p>
            {!pending.state.flashcards&&state.flashcards&&<p className="notice">这是旧版备份，不含新的闪卡记录。恢复会保留当前闪卡排程和评分，并补入旧备份中的缺失词卡。</p>}
            {pending.state.flashcards&&<p>文件包含闪卡排程、来源、评分和半途翻面状态，将按文件完整恢复。</p>}
          </div>
          <button className="btn secondary" disabled={busy} onClick={() => save()}><Download size={17}/>先保存当前进度</button>
          <div className="row progress-restore-confirm">
            <button className="btn secondary" disabled={busy} onClick={() => setPending(null)}>取消恢复</button>
            <button className="btn" disabled={busy} onClick={apply}>{busy ? '正在恢复…' : '确认替换并恢复'}</button>
          </div>
        </> : <>
          {ONLINE && (standalone ? <p className="home-screen-status">正在以主屏幕 App 使用。进度保存在这个 App 内，和 Safari 分开；可在下方从文件恢复。</p> :
            <details className="home-screen-help">
              <summary>添加到 iPhone 主屏幕</summary>
              <ol>
                <li>用 iPhone 的 Safari 打开本站。</li>
                <li>点「分享」→「添加到主屏幕」。部分版本先点页面菜单，再点「分享」。</li>
                <li>如果出现「作为 Web App 打开」，保持开启，再点「添加」。</li>
              </ol>
              <p>以后点主屏幕的「句句有进步」图标即可打开。学习时需要联网。</p>
              <p>已有学习记录不会自动带过去。安装前用下方「选择文件保存位置」保留进度；从主屏幕打开后，点顶部保存按钮旁的箭头，再选「从文件恢复进度」。</p>
            </details>)}
          <p className="muted small">浏览器状态：{status}。进度文件包含学习记录、笔记、生词、练习草稿和自备文字，不含教材音频或练习录音。</p>
          <button className="btn" disabled={busy} onClick={() => save()}><Download size={17}/>保存进度到本地</button>
          <section className="progress-cloud-help" aria-label="iCloud Drive 文件备份">
            <h3><Cloud size={18}/>iCloud Drive 文件备份</h3>
            <p>在系统面板选择「存储到文件」→「iCloud Drive」，或在保存位置中选择 iCloud Drive。</p>
            <button className="btn secondary" disabled={busy} onClick={() => save(true)}><FolderOpen size={17}/>选择文件保存位置</button>
            <p className="muted small">若浏览器仅支持下载，请下载后移到 iCloud Drive。另一台设备打开本站，点下方「从文件恢复进度」选择这份文件。每次接续需手动保存和恢复，不会自动合并两台设备的进度。</p>
          </section>
          <button className="btn secondary" disabled={busy} onClick={() => input.current?.click()}><FolderOpen size={17}/>从文件恢复进度</button>
          {previous && <button className="text-btn" disabled={busy} onClick={() => { setPending({state: previous, savedAt: null}); setReceipt(''); }}>恢复到上一次替换前的进度</button>}
          {previous && <p className="muted small">上一次替换前的进度仅在本页保留，刷新后清除。</p>}
        </>}
        {receipt && <p className="progress-save-receipt" role="status">{receipt}</p>}
        <input hidden type="file" accept=".json,application/json" ref={input} onChange={event => choose(event.target.files?.[0])}/>
      </DialogContent>
    </Dialog>
  </>;
}
