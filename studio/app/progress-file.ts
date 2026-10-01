import {State, validateState} from './model';
import type {StateStorageSnapshot} from './offline-store';

export const MAX_PROGRESS_BYTES = 25 * 1024 * 1024;
const FORMAT = 'english-studio-progress';
// Capability payloads are transported intact here. Their owner validates them
// before a restore preview or write; this file layer does not own a scheduler.
export type ProgressSnapshot = {state: State; savedAt: string | null; capability?: unknown};
export type ProgressRestoreCheckpoint = {state: State; expected: State; persisted: StateStorageSnapshot};
export type ProgressRestoreOptions = {
  exact?: boolean; expected?: State; persisted?: StateStorageSnapshot;
  rollbackTo?: StateStorageSnapshot;
  /** Runs immediately after persistence commits, before publishing page State. */
  onCommitted?: (state: State) => void;
};
const hasCapabilityPayload = (value: unknown) => !!value && typeof value === 'object' && !Array.isArray(value);

export function makeProgressFile(state: State, now = new Date(), capability?: unknown): File {
  if (!validateState(state)) throw Error('当前进度格式异常，未生成文件。');
  if (capability !== undefined && !hasCapabilityPayload(capability)) throw Error('小练习备份格式异常，未生成文件。');
  const savedAt = now.toISOString();
  const file = new File(
    [JSON.stringify({format: FORMAT, version: capability === undefined ? 1 : 2, savedAt, state, ...(capability === undefined ? {} : {capability})})],
    `English-Studio-progress-${savedAt.replace(/[:.]/g, '-')}.json`,
    {type: 'application/json'},
  );
  if (file.size > MAX_PROGRESS_BYTES) throw Error('进度文件超过 25 MB，无法快速保存。');
  return file;
}

export async function readProgressFile(file: Blob): Promise<ProgressSnapshot> {
  if (file.size > MAX_PROGRESS_BYTES) throw Error('请选择小于 25 MB 的进度文件。');
  let data: unknown;
  try { data = JSON.parse(await file.text()); }
  catch { throw Error('文件无法读取，请选择 English Studio 保存的进度文件。'); }
  const value = data as Record<string, unknown> | null;
  if (value?.format === FORMAT) {
    if (value.version !== 1 && value.version !== 2) throw Error('此进度文件版本暂不支持，请使用更新的网站。');
    if ((value.version === 2 && !hasCapabilityPayload(value.capability)) || (value.version === 1 && Object.hasOwn(value, 'capability'))) throw Error('小练习备份载荷缺失或文件版本不匹配，当前记录未改变。');
    if (typeof value.savedAt !== 'string' || !Number.isFinite(Date.parse(value.savedAt))) {
      throw Error('进度文件的保存时间无效。');
    }
    try {
      if (validateState(value.state)) return {state: value.state, savedAt: value.savedAt, ...(value.version === 2 ? {capability: value.capability} : {})};
    } catch { /* A malformed nested record is invalid too. */ }
  } else if (value && !Object.hasOwn(value, 'format')) {
    // Keep previously saved plain JSON progress readable after the old transfer UI is removed.
    try { if (validateState(data)) return {state: data, savedAt: null}; } catch { /* invalid */ }
  }
  throw Error('进度内容无效，当前学习记录未改变。');
}

export type FileSaveResult = 'downloaded' | 'written' | 'shared' | 'cancelled';
type SaveWindow = Window & {
  showSaveFilePicker?: (options: {
    suggestedName: string;
    types: {description: string; accept: Record<string, string[]>}[];
  }) => Promise<{createWritable: () => Promise<{
    write: (file: Blob) => Promise<void>;
    close: () => Promise<void>;
    abort: () => Promise<void>;
  }>} >;
};

export function downloadProgress(file: File): FileSaveResult {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  // A download request does not prove that the user saved the file.
  return 'downloaded';
}

export async function saveProgressToFiles(file: File): Promise<FileSaveResult> {
  try {
    // Call the native surface before awaiting anything: both APIs require a user gesture.
    const picker = (window as SaveWindow).showSaveFilePicker;
    if (picker) {
      const handle = await picker.call(window, {
        suggestedName: file.name,
        types: [{description: 'English Studio 学习进度', accept: {'application/json': ['.json']}}],
      });
      const writable = await handle.createWritable();
      try { await writable.write(file); await writable.close(); }
      catch (error) { await writable.abort().catch(() => {}); throw error; }
      return 'written';
    }
    if (navigator.canShare?.({files: [file]}) && navigator.share) {
      await navigator.share({files: [file]});
      return 'shared';
    }
    return downloadProgress(file);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return 'cancelled';
    throw error;
  }
}
