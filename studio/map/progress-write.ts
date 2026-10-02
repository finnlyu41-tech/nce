import {emptyProgress, parseProgress, storageKey, type Progress} from './model';

// Kept identical to the first restore patch so mixed upgraded tabs cooperate.
export const mapRestoreLock = 'english-studio-map-restore:' + storageKey;
export type MapCommit = {progress: Progress; raw: string};
export class MapWriteConflict extends Error {
  constructor(public readonly latestRaw: string | null) {
    super('另一页面更新了路线进度，原记录保留。请重新核对后重试。');
  }
}
export type MapWriteOptions = {unchanged?: () => boolean; onCommitted?: (commit: MapCommit) => void};

/** Every upgraded map writer and restore shares this critical section. Compare,
 * compute, native write, readback and page-reference publication happen before
 * releasing the lock. No unlocked fallback is allowed. */
export async function commitMapWrite(expectedRaw: string | null, change: (state: Progress) => Progress, options: MapWriteOptions = {}): Promise<MapCommit> {
  const locks = globalThis.navigator?.locks;
  if (!locks?.request) throw Error('此浏览器无法安全保存路线进度，请使用支持 Web Locks 的浏览器。当前输入保留。');
  return locks.request(mapRestoreLock, {mode: 'exclusive'}, () => {
    const latestRaw = localStorage.getItem(storageKey);
    if (latestRaw !== expectedRaw || options.unchanged && !options.unchanged()) throw new MapWriteConflict(latestRaw);
    const state = latestRaw === null ? emptyProgress() : parseProgress(latestRaw);
    const raw = JSON.stringify(change(state)), progress = parseProgress(raw);
    localStorage.setItem(storageKey, raw);
    if (localStorage.getItem(storageKey) !== raw) throw Error('路线记录保存未能确认，请保留当前输入并重新核对。');
    const committed = {progress, raw};
    options.onCommitted?.(committed);
    return committed;
  });
}
