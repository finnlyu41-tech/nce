export const PLAYBACK_RATES = ['0.5', '0.7', '0.85', '1', '1.25', '1.5', '2'] as const;
const KEY = 'english-studio-playback-rate';
const EVENT = 'english-studio-playback-rate-changed';
let fallback = '1';
let storageBlocked = false;

export function getPlaybackRate(): string {
  if (typeof window === 'undefined') return '1';
  if (storageBlocked) return fallback;
  try {
    const stored = window.localStorage.getItem(KEY);
    return PLAYBACK_RATES.some(rate => rate === stored) ? stored! : fallback;
  } catch { return fallback; }
}

export function setPlaybackRate(rate: string) {
  if (!PLAYBACK_RATES.some(value => value === rate)) return;
  fallback = rate;
  try { window.localStorage.setItem(KEY, rate);storageBlocked = false; } catch { storageBlocked = true; }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribePlaybackRate(listener: () => void) {
  const onStorage = (event: StorageEvent) => { if (event.key === KEY || event.key === null) listener(); };
  window.addEventListener(EVENT, listener);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener('storage', onStorage);
  };
}
