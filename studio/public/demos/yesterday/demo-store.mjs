import {storageKey,restoreState} from './model.mjs';
const time = (value,now) => Number.isSafeInteger(value) && value > 0 && value <= now;
const fail = (status,message,extra={}) => ({ok:false,status,message,...extra});
function parse(raw,now) {
  if (!time(now,now)) throw new Error('invalid-clock');
  if (raw === null) return null;
  const value = JSON.parse(raw);
  if (!value || value.version !== 1 || !Array.isArray(value.attempts) || !Array.isArray(value.hints) || !time(value.createdAt,now)) throw new Error('invalid-data');
  if (value.attempts.some(a=>!a || !time(a.at,now)) || (value.finishedAt != null && !time(value.finishedAt,now))) throw new Error('invalid-data');
  const review = value.reviewSession;
  if (review != null && (!time(review.createdAt,now) || !Array.isArray(review.attempts) || review.attempts.some(a=>!a || !time(a.at,now)) || (review.finishedAt != null && !time(review.finishedAt,now)))) throw new Error('invalid-data');
  return restoreState(value,now);
}
/** A second, independent lock protects the existing demo key from stale tab overwrites. */
export function createDemoStore({storage,locks,now=Date.now}) {
  function read() {
    let raw;
    try {raw=storage.getItem(storageKey); const state=parse(raw,now()); return {ok:true,status:'read',raw,state};}
    catch(error) {return fail(error.message === 'invalid-clock' ? 'invalid-clock' : error.message === 'invalid-data' || error instanceof SyntaxError ? 'invalid-data' : 'storage-error','Existing demo data was retained.',{raw});}
  }
  return {read,async save(state,expectedRaw) {
    let captured;
    try {captured=JSON.stringify(state);parse(captured,now());} catch {return fail('invalid-data','The current demo could not be saved.');}
    if (!locks?.request) return fail('locks-unavailable','Reliable cross-tab saving is unavailable.');
    let result;
    try {
      await locks.request(storageKey,{mode:'exclusive'},lock=> {
        if (!lock || lock.name !== storageKey || lock.mode !== 'exclusive') return;
        const live=read();
        if (!live.ok) {result=live;return;}
        if (live.raw !== expectedRaw) {result=fail('tab-conflict','Another tab changed the demo; its data was retained.',{raw:live.raw});return;}
        try {storage.setItem(storageKey,captured);const raw=storage.getItem(storageKey);result=raw===captured?{ok:true,status:'saved',raw}:fail('storage-error','The write could not be confirmed.',{raw});}
        catch {result=fail('storage-error','The write failed; current page input is retained.');}
      });
      return result || fail('locks-unavailable','The exclusive demo lock was not acquired.');
    } catch {return fail('locks-unavailable','The exclusive demo lock could not complete.');}
  }};
}
