'use client';
import {useSyncExternalStore} from 'react';
import {getPlaybackRate, PLAYBACK_RATES, setPlaybackRate, subscribePlaybackRate} from './playback-rate';

export function usePlaybackRate() {
  return useSyncExternalStore(subscribePlaybackRate, getPlaybackRate, () => '1');
}

export function PlaybackSpeed({label = '语速', ariaLabel = '播放语速'}: {label?: string; ariaLabel?: string}) {
  const rate = usePlaybackRate();
  return <label className="playback-speed"><span>{label}</span><select aria-label={ariaLabel} value={rate} onChange={event => setPlaybackRate(event.target.value)}>{PLAYBACK_RATES.map(value => <option key={value} value={value}>{value}×{value === '1' ? ' 正常' : ''}</option>)}</select></label>;
}
