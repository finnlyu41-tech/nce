import {storageKey as DEMO_KEY} from '../public/demos/yesterday/model.mjs';
import {createDemoStore} from '../public/demos/yesterday/demo-store.mjs';
import {byId} from '../public/demos/yesterday/content.mjs';
import {reviewById} from '../public/demos/yesterday/review-content.mjs';
import {STORAGE_KEY as REVIEW_KEY, emptySnapshot, validateSnapshot, buildReviewBackup, validateReviewBackup, mergeReviewBackup} from '../public/demos/yesterday/review-adapter.mjs';

/** Optional `capability` payload for a host's progress-file v2; no global State schema or scheduling lives here.
 *
 * captureCapabilityReviewBackup({storage?, now?}) is synchronous for native picker/share user gestures.
 * validateCapabilityReviewBackup(payload, now?) is pure; it rejects unsupported fields and evidence changes.
 * prepareCapabilityReviewRestore(payload, {storage?, now?}) only reads, validates and creates an opaque preview.
 * executeCapabilityReviewRestore(prepared, {storage?, locks?, now?, apply?, rollback?}) coordinates writes.
 * Ports use a clock function; the pure validator takes a timestamp. Default ports are localStorage/Web Locks.
 *
 * An omitted payload (`undefined`) is a legacy import and never reads, locks, writes or clears either zone.
 * A bundle's null store means no incoming data, preserving that live zone. Newer live receipts are retained;
 * conflicting completion roots, first answers, drafts or receipts are refused before the host apply callback.
 * Preview tokens stay in this module instance and are consumed once execution starts; retry by preparing again.
 *
 * The host provides BOTH apply/rollback callbacks when coordinating IndexedDB and confirms their exact effects.
 * Both existing namespace locks stay held through callbacks, fresh raw comparisons, writes and readbacks;
 * callbacks must not reacquire them. Rollback only replaces bytes still equal to this operation's own write.
 * `rolled-back` confirms the original values. `partial-failure` MUST NOT be shown as success: keep `recovery`
 * (original/attempted/readable current raw values and main rollback status) available for local recovery.
 */
export type CapabilityReviewBackup = {
  kind: 'nce-capability-review-bundle'; version: 1; exportedAt: number;
  stores: {'nce-demo-yesterday-v1': Record<string, unknown> | null; 'nce-capability-review:v1': Record<string, unknown> | null};
};
export type CapabilityReviewStorage = {getItem(key: string): string | null; setItem?(key: string, value: string): void; removeItem?(key: string): void};
export type CapabilityReviewLocks = {request<T>(name: string, options: {mode: 'exclusive'}, callback: (lock: {name: string; mode: string} | null) => T | Promise<T>): Promise<T>};
export type CapabilityReviewOptions = {storage?: CapabilityReviewStorage; now?: () => number};
export type CapabilityReviewExecuteOptions = CapabilityReviewOptions & {
  locks?: CapabilityReviewLocks;
  /** These callbacks confirm main IndexedDB apply/rollback. They must not reacquire either review lock. */
  apply?: () => void | Promise<void>; rollback?: () => void | Promise<void>;
};
type RawPair = {demo: string | null; review: string | null};
type Summary = {included: boolean; demo: 'absent' | 'restored' | 'merged' | 'retained'; review: string};
export type PreparedCapabilityReviewRestore = Readonly<{kind: 'nce-capability-review-restore'; version: 1; summary: Readonly<Summary>}>;
export type CapabilityReviewRecovery = {
  original: RawPair | null; attempted: RawPair | null;
  current: {demo?: string | null; review?: string | null} | null;
  main: 'not-applied' | 'rolled-back' | 'rollback-failed'; errors: string[];
};
type Failed = {ok: false; status: string; message: string; recovery?: CapabilityReviewRecovery};
type Success<T> = {ok: true; status: string} & T;
export type CapabilityReviewCaptureResult = Success<{backup: CapabilityReviewBackup}> | Failed;
export type CapabilityReviewValidationResult = CapabilityReviewCaptureResult;
export type CapabilityReviewPrepareResult = Success<{prepared: PreparedCapabilityReviewRestore; summary: Summary}> | Failed;
export type CapabilityReviewRestoreResult = Success<{summary: Summary}> | Failed;
type Attempt = {id: string; choice: number; correct: boolean; hinted: boolean; repeated: boolean; at: number};
type ReviewSession = {version: number; taskId: string; setIndex: number; index: number; createdAt: number; attempts: Attempt[]; hints: string[]; seenIds: string[]; repeatedIds: string[]; finishedAt: number | null};
type Demo = {version: number; step: number; createdAt: number; attempts: Attempt[]; hints: string[]; seenQuestionIds: string[]; previousSeenQuestionIds: string[]; independentCursor: number; correction: {phase: string; target: string | null; currentId: string | null}; draft: string; planSaved: boolean; finishedAt: number | null; reviewSession: ReviewSession | null; reviewSeenIds: string[]};
type RecordValue = Record<string, unknown>;
type PreparedData = {backup: CapabilityReviewBackup | undefined; expected: RawPair | null; active: boolean};
const preparedData = new WeakMap<PreparedCapabilityReviewRestore, PreparedData>();
const MAX_TIME = 8640000000000000;
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const isObject = (value: unknown): value is RecordValue => !!value && typeof value === 'object' && !Array.isArray(value);
// Stored raw strings still compare byte-for-byte; known JSON objects compare by fields, independent of key order.
function same(a: unknown, b: unknown): boolean {
  if(a===b)return true;
  if(Array.isArray(a))return Array.isArray(b)&&a.length===b.length&&a.every((value,index)=>same(value,b[index]));
  if(isObject(a)&&isObject(b)) {
    const keys=Object.keys(a);
    return keys.length===Object.keys(b).length&&keys.every(key=>Object.hasOwn(b,key)&&same(a[key],b[key]));
  }
  return false;
}
const union = <T>(...values: T[][]): T[] => [...new Set(values.flat())];
const fail = (status: string, message: string): Failed => ({ok: false, status, message});
class BackupError extends Error {status: string; constructor(status: string, message: string) {super(message); this.status = status;}}
function reject(status: string, message: string): never {throw new BackupError(status, message);}
function caught(error: unknown): Failed {return error instanceof BackupError ? fail(error.status, error.message) : fail('storage-error', '备份或恢复未能确认，现有记录保留。');}
function time(value: unknown, at: number): value is number {return Number.isSafeInteger(value) && Number(value) > 0 && Number(value) <= Math.min(at, MAX_TIME);}
function clock(now: (() => number) | undefined): number {let at: number;try {at=(now || Date.now)();} catch {reject('invalid-clock', '设备时间无法读取。');}if(!time(at,at))reject('invalid-clock','设备时间异常，未改变记录。');return at;}
function browserStorage(): CapabilityReviewStorage {try {return globalThis.localStorage;} catch {reject('storage-unavailable','浏览器存储不可用。');}}
function readPair(storage: CapabilityReviewStorage): RawPair {
  const raw={demo: storage.getItem(DEMO_KEY), review: storage.getItem(REVIEW_KEY)};
  if([raw.demo,raw.review].some(value=>value!==null&&typeof value!=='string'))reject('invalid-data','存储原文格式异常。');
  return raw;
}
function parse(raw: string): unknown {try {return JSON.parse(raw);} catch {reject('invalid-data','备份或存量 JSON 无法读取。');}}
function exact(value: RecordValue, keys: string[]) {if(Object.keys(value).length!==keys.length||keys.some(key=>!Object.hasOwn(value,key)))reject('invalid-data','备份载荷字段不完整或版本不兼容。');}
function ids(value: unknown, known: Map<string, unknown>, optional = true): void {
  if(value===undefined&&optional)return;
  if(!Array.isArray(value)||value.some(id=>typeof id!=='string'||!known.has(id))||new Set(value).size!==value.length)reject('invalid-demo','题目曝光或帮助记录无法完整保留。');
}
const ATTEMPT_FIELDS = ['id','choice','correct','hinted','repeated','at'];
const DEMO_FIELDS = ['version','step','createdAt','attempts','hints','seenQuestionIds','previousSeenQuestionIds','independentCursor','correction','draft','planSaved','finishedAt','reviewSession','reviewSeenIds'];
const SESSION_FIELDS = ['version','taskId','setIndex','index','createdAt','attempts','hints','seenIds','repeatedIds','finishedAt'];
function supported(value: RecordValue, fields: string[]) {
  if(Object.keys(value).some(key=>!fields.includes(key)))reject('invalid-demo','记录包含尚不支持的字段，未覆盖它。');
}
function faithful(source: RecordValue, restored: RecordValue, fields: string[]) {
  for(const field of fields)if(Object.hasOwn(source,field)&&!same(source[field],restored[field]))reject('invalid-demo','记录会在恢复时被改写，已拒绝。');
}
function attemptValue(value: unknown, known: Map<string, {options: unknown[]; correct: number}>, createdAt: number, at: number, seen: Set<string>) {
  if(!isObject(value)||typeof value.id!=='string'||!known.has(value.id)||seen.has(value.id)||!time(value.at,at)||value.at<createdAt)reject('invalid-demo','首答不能完整保留。');
  supported(value,ATTEMPT_FIELDS);seen.add(value.id);
  const q=known.get(value.id)!;
  if(!Number.isInteger(value.choice)||Number(value.choice)<0||Number(value.choice)>=q.options.length)reject('invalid-demo','首答选项无效。');
  if(value.correct!==undefined&&value.correct!==(value.choice===q.correct))reject('invalid-demo','保存的判题与原答不符。');
  for(const flag of ['hinted','repeated'])if(value[flag]!==undefined&&typeof value[flag]!=='boolean')reject('invalid-demo','首答帮助或重做标记无效。');
}
/** Optional legacy fields may be filled in; every supplied field must survive the UI restorer faithfully. */
function demoValue(value: unknown, at: number): Demo {
  if(!isObject(value)||value.version!==1||!time(value.createdAt,at)||!Array.isArray(value.attempts)||!Array.isArray(value.hints))reject('invalid-demo','体验记录版本或时间无效。');
  supported(value,DEMO_FIELDS);
  for(const field of ['hints','seenQuestionIds','previousSeenQuestionIds'])ids(value[field],byId,field!=='hints');
  ids(value.reviewSeenIds,reviewById);
  if(value.draft!==undefined&&(typeof value.draft!=='string'||value.draft.length>1200))reject('invalid-demo','草稿不能完整保留。');
  if(value.step!==undefined&&(!Number.isInteger(value.step)||Number(value.step)<0||Number(value.step)>4))reject('invalid-demo','体验位置无效。');
  if(value.independentCursor!==undefined&&value.independentCursor!==0&&value.independentCursor!==1)reject('invalid-demo','独立题位置无效。');
  if(value.planSaved!==undefined&&typeof value.planSaved!=='boolean')reject('invalid-demo','旧建议标记无效。');
  if(value.correction!==undefined) {
    if(!isObject(value.correction))reject('invalid-demo','纠错位置无法保留。');
    exact(value.correction,['phase','target','currentId']);
  }
  const seen=new Set<string>();
  for(const a of value.attempts)attemptValue(a,byId,value.createdAt,at,seen);
  if(value.finishedAt!=null&&(!time(value.finishedAt,at)||value.finishedAt<Math.max(value.createdAt,...value.attempts.map(a=>Number((a as RecordValue).at)))))reject('invalid-demo','完成时间无效。');
  if(value.reviewSession!=null) {
    const session=value.reviewSession;
    if(!isObject(session)||session.version!==1||!Array.isArray(session.attempts)||!time(session.createdAt,at))reject('invalid-demo','复习会话不能完整保留。');
    supported(session,SESSION_FIELDS);
    ids(session.hints,reviewById);ids(session.seenIds,reviewById);ids(session.repeatedIds,reviewById);
    const reviewSeen=new Set<string>();
    for(const a of session.attempts)attemptValue(a,reviewById,session.createdAt,at,reviewSeen);
  }
  const raw=JSON.stringify(value),read=createDemoStore({storage:{getItem:()=>raw},locks:null,now:()=>at}).read();
  if(!read.ok||!('state' in read)||!read.state)reject('invalid-demo','体验记录无法安全读取。');
  const state=read.state as Demo;
  if(state.attempts.length!==value.attempts.length)reject('invalid-demo','首答会在恢复时丢失。');
  for(let index=0;index<value.attempts.length;index++)faithful(value.attempts[index],state.attempts[index],ATTEMPT_FIELDS);
  faithful(value,state,DEMO_FIELDS.filter(field=>field!=='attempts'&&field!=='reviewSession'));
  if(value.reviewSession!=null) {
    const session=value.reviewSession as RecordValue;
    if(!state.reviewSession||state.reviewSession.attempts.length!==(session.attempts as unknown[]).length)reject('invalid-demo','复习会话会在恢复时丢失。');
    faithful(session,state.reviewSession,SESSION_FIELDS.filter(field=>field!=='attempts'));
    for(let index=0;index<(session.attempts as unknown[]).length;index++)faithful((session.attempts as RecordValue[])[index],state.reviewSession.attempts[index],ATTEMPT_FIELDS);
  }
  return clone(state);
}

function reviewValue(raw: string | null, at: number) {
  const value=raw===null?emptySnapshot():parse(raw),valid=validateSnapshot(value,at);
  if(!valid.ok)reject('invalid-review','已有计划或结果无法安全读取，原值保留。');
  return value;
}

/** Pure form, useful for tests or a host's own synchronous snapshot transport. */
export function buildCapabilityReviewBackup(raw: RawPair, at = Date.now()): CapabilityReviewCaptureResult {
  try {
    if(!time(at,at))reject('invalid-clock','设备时间异常。');
    const demo=raw.demo===null?null:demoValue(parse(raw.demo),at);
    let review: RecordValue|null=null;
    if(raw.review!==null) {const built=buildReviewBackup(reviewValue(raw.review,at),at);if(!built.ok||!('backup' in built))reject('invalid-review','复习计划无法导出。');review=built.backup;}
    return {ok:true,status:'captured',backup:{kind:'nce-capability-review-bundle',version:1,exportedAt:at,stores:{[DEMO_KEY]:demo,[REVIEW_KEY]:review}}};
  } catch(error) {return caught(error);}
}
/** Synchronous stable reads preserve the native file picker/share user gesture; they are not a cross-store transaction. */
export function captureCapabilityReviewBackup(options: CapabilityReviewOptions = {}): CapabilityReviewCaptureResult {
  try {const storage=options.storage||browserStorage(),first=readPair(storage),second=readPair(storage);if(!same(first,second))reject('capture-conflict','其他页面正在更新记录，请重新保存备份。');return buildCapabilityReviewBackup(first,clock(options.now));}
  catch(error) {return caught(error);}
}
export function validateCapabilityReviewBackup(payload: unknown, at = Date.now()): CapabilityReviewValidationResult {
  try {
    if(!time(at,at))reject('invalid-clock','设备时间异常。');
    const value=clone(payload);
    if(!isObject(value))reject('invalid-data','双区备份格式无效。');exact(value,['kind','version','exportedAt','stores']);
    if(value.kind!=='nce-capability-review-bundle'||value.version!==1||!time(value.exportedAt,at)||!isObject(value.stores))reject('invalid-data','双区备份版本或时间无效。');
    exact(value.stores,[DEMO_KEY,REVIEW_KEY]);
    const demo=value.stores[DEMO_KEY]===null?null:demoValue(value.stores[DEMO_KEY],value.exportedAt);
    let review: RecordValue|null=null;
    if(value.stores[REVIEW_KEY]!==null) {const valid=validateReviewBackup(value.stores[REVIEW_KEY],value.exportedAt);if(!valid.ok||!('backup' in valid))reject('invalid-review','计划备份无法安全读取。');review=valid.backup;}
    return {ok:true,status:'valid',backup:{kind:'nce-capability-review-bundle',version:1,exportedAt:value.exportedAt,stores:{[DEMO_KEY]:demo,[REVIEW_KEY]:review}}};
  } catch(error) {return caught(error);}
}
function entries<T extends {id: string}>(live: T[], incoming: T[]): T[] {
  const next=clone(live);
  for(const entry of incoming) {const old=next.find(a=>a.id===entry.id);if(old&&!same(old,entry))reject('demo-conflict','同一道题的首答互相冲突，已保留本机记录。');if(!old)next.push(clone(entry));}
  return next;
}
function receipted(snapshot: unknown, taskId: string): boolean {
  return isObject(snapshot)&&isObject(snapshot.plan)&&Array.isArray(snapshot.plan.receipts)&&snapshot.plan.receipts.some(receipt=>isObject(receipt)&&receipt.taskId===taskId);
}
function mergeSession(live: ReviewSession|null, incoming: ReviewSession|null, liveReview: unknown, incomingReview: unknown): ReviewSession|null {
  if(!incoming)return live;if(!live)return incoming;
  const oldAt=Number(live.taskId.split('@')[1]),newAt=Number(incoming.taskId.split('@')[1]);
  if(live.taskId!==incoming.taskId) {
    if(newAt<oldAt) {if(!incoming.finishedAt||!receipted(incomingReview,incoming.taskId))reject('demo-conflict','备份含尚未确认结果的另一份复习会话。');return live;}
    if(!live.finishedAt||!receipted(liveReview,live.taskId))reject('demo-conflict','已有尚未确认结果的复习会话，不能被另一份会话替换。');
    return incoming;
  }
  if(live.setIndex!==incoming.setIndex)reject('demo-conflict','同一次复习选用不同题组，不能静默替换。');
  const attempts=entries(live.attempts,incoming.attempts);
  return {...live,createdAt:Math.min(live.createdAt,incoming.createdAt),attempts,hints:union(live.hints,incoming.hints),seenIds:union(live.seenIds,incoming.seenIds),repeatedIds:union(live.repeatedIds,incoming.repeatedIds),index:Math.max(live.index,incoming.index),finishedAt:Math.max(live.finishedAt||0,incoming.finishedAt||0)||null};
}
function mergeDemo(live: Demo|null, incoming: Demo|null, at: number, liveReview: unknown, incomingReview: unknown): Demo|null {
  if(!incoming)return live;if(!live)return incoming;
  if(live.draft&&incoming.draft&&live.draft!==incoming.draft)reject('demo-conflict','两份草稿不同，已保留本机草稿。');
  const pristine=!live.attempts.length&&!live.hints.length&&!live.seenQuestionIds.length&&!live.draft&&!live.previousSeenQuestionIds.length&&!live.reviewSession&&!live.reviewSeenIds.length&&!live.finishedAt;
  let next: Demo;
  if(live.createdAt!==incoming.createdAt&&!pristine) {
    if(incoming.createdAt>live.createdAt)reject('demo-conflict','已有另一轮体验首答，不能静默替换。');
    next={...live,previousSeenQuestionIds:union(live.previousSeenQuestionIds,incoming.previousSeenQuestionIds,incoming.seenQuestionIds,incoming.attempts.map(a=>a.id)).filter(id=>!live.attempts.some(a=>a.id===id&&!a.repeated))};
  } else {
    const attempts=pristine?incoming.attempts:entries(live.attempts,incoming.attempts);
    const advances=pristine||incoming.attempts.length>live.attempts.length;
    next={...(advances?incoming:live),attempts,draft:live.draft||incoming.draft,hints:union(live.hints,incoming.hints),seenQuestionIds:union(live.seenQuestionIds,incoming.seenQuestionIds),previousSeenQuestionIds:union(live.previousSeenQuestionIds,incoming.previousSeenQuestionIds),finishedAt:Math.max(live.finishedAt||0,incoming.finishedAt||0)||null};
  }
  next.reviewSession=mergeSession(live.reviewSession,incoming.reviewSession,liveReview,incomingReview);
  next.reviewSeenIds=union(live.reviewSeenIds,incoming.reviewSeenIds,live.reviewSession?.seenIds||[],incoming.reviewSession?.seenIds||[]);
  let verified: Demo;try {verified=demoValue(next,at);}catch {reject('demo-conflict','合并会改写首答、帮助或曝光记录，已拒绝。');}
  for(const a of live.attempts) {const kept=verified.attempts.find(b=>b.id===a.id);if(!pristine&&(!kept||!same(kept,a)))reject('demo-conflict','合并会改写已有首答或帮助标记，已拒绝。');}
  const session=verified.reviewSession;
  if(live.reviewSession&&session?.taskId===live.reviewSession.taskId)for(const a of live.reviewSession.attempts)if(!same(session.attempts.find(b=>b.id===a.id),a))reject('demo-conflict','合并会改写复习首答，已拒绝。');
  return verified;
}
function calculate(backup: CapabilityReviewBackup, raw: RawPair, at: number): {next: RawPair; summary: Summary} {
  const liveDemo=raw.demo===null?null:demoValue(parse(raw.demo),at),liveReview=reviewValue(raw.review,at);
  const incoming=backup.stores[DEMO_KEY]===null?null:demoValue(backup.stores[DEMO_KEY],at);
  const review=backup.stores[REVIEW_KEY]===null?{ok:true,changed:false,status:'backup-absent',snapshot:liveReview}:mergeReviewBackup(liveReview,backup.stores[REVIEW_KEY],at);
  if(!review.ok||!('changed' in review)||!('snapshot' in review))reject('review-conflict','计划或结果互相冲突，已保留本机记录。');
  const incomingReview=backup.stores[REVIEW_KEY]?.snapshot;
  const merged=mergeDemo(liveDemo,incoming,at,liveReview,incomingReview);
  const demoChanged=!same(liveDemo,merged);
  return {next:{demo:demoChanged?JSON.stringify(merged):raw.demo,review:review.changed?JSON.stringify(review.snapshot):raw.review},summary:{included:true,demo:incoming===null?'absent':!demoChanged?'retained':liveDemo?'merged':'restored',review:review.status}};
}
/** Readonly preparation; undefined legacy payload never reads or touches either namespace. */
export function prepareCapabilityReviewRestore(payload: unknown, options: CapabilityReviewOptions = {}): CapabilityReviewPrepareResult {
  try {
    let backup: CapabilityReviewBackup|undefined,expected: RawPair|null=null,summary: Summary={included:false,demo:'absent',review:'backup-absent'};
    if(payload!==undefined) {
      const at=clock(options.now),valid=validateCapabilityReviewBackup(payload,at);if(!valid.ok)return valid;
      backup=valid.backup;const storage=options.storage||browserStorage();expected=readPair(storage);
      if(!same(expected,readPair(storage)))reject('prepare-conflict','其他页面正在更新记录，请重新预检。');
      summary=calculate(backup,expected,at).summary;
    }
    const prepared=Object.freeze({kind:'nce-capability-review-restore' as const,version:1 as const,summary:Object.freeze({...summary})});
    preparedData.set(prepared,{backup:backup?clone(backup):undefined,expected:expected?{...expected}:null,active:false});
    return {ok:true,status:payload===undefined?'legacy-preserved':'prepared',prepared,summary};
  } catch(error) {return caught(error);}
}
async function exclusive<T>(locks: CapabilityReviewLocks, names: string[], operation: () => Promise<T>): Promise<T> {
  let completed=false,result: T;
  const acquire=async(index: number): Promise<T>=> {
    if(index===names.length) {result=await operation();completed=true;return result;}
    return locks.request(names[index],{mode:'exclusive'},lock=> {
      if(!lock||lock.name!==names[index]||lock.mode!=='exclusive')reject('locks-unavailable','未取得共同恢复锁。');
      return acquire(index+1);
    });
  };
  await acquire(0);
  if(!completed)reject('locks-unavailable','共同恢复锁没有执行恢复操作。');
  return result!;
}
/** Fresh comparison and canonical merge happen while both existing locks are held. No unlocked fallback.
 * Once execution starts, its opaque preview token is consumed; retries must prepare against fresh raw values.
 * `partial-failure` exposes both original raws, attempted raws and readable current raws for local recovery.
 */
export async function executeCapabilityReviewRestore(prepared: PreparedCapabilityReviewRestore, options: CapabilityReviewExecuteOptions = {}): Promise<CapabilityReviewRestoreResult> {
  const token=preparedData.get(prepared);
  if(!token)return fail('invalid-prepared','恢复预检已失效，请重新选择文件。');
  if(token.active)return fail('restore-in-progress','本次恢复正在执行。');
  if(options.apply&&!options.rollback)return fail('invalid-hooks','协调主进度恢复需要配套回滚回调。');
  token.active=true;
  try {
    if(!token.backup) {
      try {await options.apply?.();return {ok:true,status:'legacy-preserved',summary:{...prepared.summary}};}
      catch(error) {let rolled=true;try{if(options.apply)await options.rollback?.();}catch{rolled=false;}return {...fail(rolled?'rolled-back':'partial-failure','主进度恢复失败，双区未触碰。'),recovery:{original:null,attempted:null,current:null,main:options.apply?(rolled?'rolled-back':'rollback-failed'):'not-applied',errors:[String(error)]}};}
    }
    const storage=options.storage||browserStorage(),locks=options.locks||globalThis.navigator?.locks;
    if(!locks?.request)return fail('locks-unavailable','浏览器无法可靠地协调双区恢复。');
    return await exclusive(locks as CapabilityReviewLocks,[REVIEW_KEY,DEMO_KEY].sort(),async()=> {
      const at=clock(options.now),valid=validateCapabilityReviewBackup(token.backup,at);if(!valid.ok)return valid;
      const original=readPair(storage);if(!same(original,token.expected))return fail('stale-prepared','预览后其他页面已更新记录，请重新预检。');
      const {next,summary}=calculate(valid.backup,original,at);
      const changed=(['demo','review'] as const).filter(field=>next[field]!==original[field]);
      if(changed.length&&(!storage.setItem||!storage.removeItem))return fail('storage-unavailable','存储缺少可确认写入／回滚接口。');
      let mainStarted=false;const attempted=new Set<'demo'|'review'>();
      try {
        if(options.apply){mainStarted=true;await options.apply();}
        if(!same(readPair(storage),original))reject('live-conflict','主进度恢复期间双区被其他代码更新，已停止覆盖。');
        const afterApply=clock(options.now),rechecked=validateCapabilityReviewBackup(token.backup,afterApply);
        if(!rechecked.ok)reject(rechecked.status,rechecked.message);
        calculate(rechecked.backup,original,afterApply);
        for(const field of changed) {const key=field==='demo'?DEMO_KEY:REVIEW_KEY;attempted.add(field);if(next[field]===null)reject('invalid-data','恢复不能删除现有区。');storage.setItem!(key,next[field]!);if(storage.getItem(key)!==next[field])reject('readback-error','恢复写入无法确认。');}
        if(!same(readPair(storage),next))reject('readback-error','恢复最终回读无法确认。');
        const finalAt=clock(options.now),confirmed=validateCapabilityReviewBackup(token.backup,finalAt);
        if(!confirmed.ok)reject(confirmed.status,confirmed.message);
        if(next.demo!==null)demoValue(parse(next.demo),finalAt);
        reviewValue(next.review,finalAt);
        return {ok:true,status:changed.length?'restored':'retained',summary};
      } catch(error) {
        const errors=[String(error)],current: CapabilityReviewRecovery['current']={};let complete=true;
        // Only revert a value still equal to our attempted write. Preserve any unrelated writer's update.
        for(const field of [...attempted].reverse()) {
          const key=field==='demo'?DEMO_KEY:REVIEW_KEY;
          try {
            const value=storage.getItem(key);
            if(value!==original[field]) {if(value!==next[field])reject('rollback-conflict','另一个写入已更新该区，未回滚覆盖。');try{if(original[field]===null)storage.removeItem!(key);else storage.setItem!(key,original[field]!);}catch(rollbackError){errors.push(String(rollbackError));}}
            if(storage.getItem(key)!==original[field])reject('rollback-unconfirmed','原值回读无法确认。');
          } catch(rollbackError) {complete=false;errors.push(String(rollbackError));}
        }
        let main: CapabilityReviewRecovery['main']='not-applied';
        if(mainStarted) {try {await options.rollback!();main='rolled-back';} catch(rollbackError) {main='rollback-failed';complete=false;errors.push(String(rollbackError));}}
        for(const field of ['demo','review'] as const) {try {current![field]=storage.getItem(field==='demo'?DEMO_KEY:REVIEW_KEY);if(current![field]!==original[field])complete=false;}catch(readError){complete=false;errors.push(String(readError));}}
        return {...fail(complete?'rolled-back':'partial-failure',complete?'恢复失败，原双区值和主进度已回滚确认。':'恢复未能完整确认，请保留恢复信息，不要当作成功。'),recovery:{original,attempted:next,current,main,errors}};
      }
    });
  } catch(error) {return caught(error);} finally {token.active=false;preparedData.delete(prepared);}
}
