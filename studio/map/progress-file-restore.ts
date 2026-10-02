import {parseProgress, storageKey, type Progress} from './model';

export type MapRestorePreview = Readonly<{progress: Progress; expectedRaw: string | null}>;
export const mapRestoreLock = 'english-studio-map-restore:' + storageKey;

/** Freeze persisted bytes at preview. A storage event must not silently renew
 * the user's confirmation to replace an unseen, newer record. */
export function previewMapRestore(fileText: string): MapRestorePreview {
  const progress = parseProgress(fileText);
  return {progress, expectedRaw: localStorage.getItem(storageKey)};
}

/** Serializes restores. Ordinary map edits keep their synchronous Save
 * contract; this lock does not cover older/noncooperating synchronous writers. */
export async function commitMapRestore(preview: MapRestorePreview): Promise<{progress: Progress; raw: string}> {
  const locks = globalThis.navigator?.locks;
  if (!locks?.request) throw Error('此浏览器无法安全核对恢复，请使用支持 Web Locks 的浏览器。原进度保留。');
  return locks.request(mapRestoreLock, {mode: 'exclusive'}, () => {
    if (localStorage.getItem(storageKey) !== preview.expectedRaw) {
      throw Error('预览后另一页面更新了路线进度。原记录保留，请取消后重新选择文件核对。');
    }
    const raw = JSON.stringify(preview.progress);
    const progress = parseProgress(raw);
    localStorage.setItem(storageKey, raw);
    if (localStorage.getItem(storageKey) !== raw) throw Error('恢复保存未能确认，请保留原备份并重新核对当前记录。');
    return {progress, raw};
  });
}
