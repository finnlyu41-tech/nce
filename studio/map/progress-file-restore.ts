import {parseProgress, storageKey, type Progress} from './model';
import {commitMapWrite, type MapWriteOptions} from './progress-write';

export type MapRestorePreview = Readonly<{progress: Progress; expectedRaw: string | null}>;
export {mapRestoreLock} from './progress-write';

/** Freeze persisted bytes at preview. A storage event must not silently renew
 * the user's confirmation to replace an unseen, newer record. */
export function previewMapRestore(fileText: string): MapRestorePreview {
  const progress = parseProgress(fileText);
  return {progress, expectedRaw: localStorage.getItem(storageKey)};
}

/** Uses exactly the same critical section as all ordinary map writes. */
export async function commitMapRestore(preview: MapRestorePreview, options: MapWriteOptions = {}): Promise<{progress: Progress; raw: string}> {
  return commitMapWrite(preview.expectedRaw, () => preview.progress, options);
}
