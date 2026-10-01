import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve,extname} from 'node:path';
const args=process.argv.slice(2),value=flag=>args[args.indexOf(flag)+1];
const modulePath=args.includes('--playwright-module')?value('--playwright-module'):null;
const {chromium}=await import(modulePath?pathToFileURL(resolve(modulePath)).href:'playwright');
const root=resolve(fileURLToPath(new URL('../public/',import.meta.url)));
const proofs=fileURLToPath(new URL('../docs/verification/',import.meta.url));
await mkdir(proofs,{recursive:true});
const start=Date.UTC(2026,9,1,23,59),DAY=86400000,DEMO='nce-demo-yesterday-v1',REVIEW='nce-capability-review:v1';
const server=createServer(async(req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/favicon.ico'){res.statusCode=204;res.end();return;}
  if(pathname==='/demos/yesterday/bootstrap.mjs'){
    res.setHeader('Content-Type','text/javascript');res.end(`import {startYesterdayDemo} from './app.mjs';\nwindow.__clock=Number(new URL(location.href).searchParams.get('clock')) || ${start};\nconst storage={getItem:key=>localStorage.getItem(key),setItem:(key,value)=>{if(window.__failSave)throw new Error('test quota');localStorage.setItem(key,value);}};\nwindow.demo=startYesterdayDemo({now:()=>window.__clock,storage});`);return;
  }
  try{const path=resolve(root,'.'+decodeURIComponent(pathname)+(pathname.endsWith('/')?'index.html':''));if(!path.startsWith(root+'/'))throw new Error();const text=await readFile(path);res.setHeader('Content-Type',extname(path)==='.mjs'?'text/javascript':extname(path)==='.css'?'text/css':'text/html');res.end(text);}catch{res.statusCode=404;res.end('Not found');}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true,...(args.includes('--browser')?{executablePath:value('--browser')}:{})});
const errors=[],evidence=[];let checks=0;
async function check(name,fn){await fn();checks++;console.log(`✓ ${name}`);}
async function pageIn(context,clock=start){const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});await page.goto(`${origin}/demos/yesterday/?clock=${clock}`);await page.waitForFunction(()=>window.demo);await page.evaluate(()=>window.demo.ready);return page;}
const snapshot=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),REVIEW);
const saved=page=>page.waitForFunction(()=>!document.getElementById('storage-note').textContent.includes('正在保存'));
async function click(page,action){await page.locator(`[data-action="${action}"]`).first().click();await saved(page);if(action==='review-open')await page.locator('[data-review-choice]').first().waitFor();}
async function choose(page,index,review=false){await page.locator(`[data-${review?'review-':''}choice="${index}"]`).click();await click(page,review?'review-submit':'submit');}
async function finishLesson(page,draft='I went to the garden yesterday.'){await choose(page,0);await click(page,'learn');await click(page,'independent');await choose(page,1);await click(page,'next-independent');await choose(page,2);await click(page,'next-independent');await click(page,'fresh');await choose(page,1);await click(page,'draft');await page.locator('#draft').fill(draft);await saved(page);await click(page,'finish');await page.waitForFunction(key=>localStorage.getItem(key)!==null,REVIEW);}
async function clock(page,at){await page.evaluate(async at=>{window.__clock=at;const url=new URL(location.href);url.searchParams.set('clock',at);history.replaceState(null,'',url);await window.demo.refresh();},at);}
async function shoot(page,name){const file=resolve(proofs,`yesterday-review-${name}.png`);await page.screenshot({path:file,fullPage:true});evidence.push({name,file:`docs/verification/yesterday-review-${name}.png`,viewport:page.viewportSize()});}
async function reviewAnswers(page,indexes){for(let i=0;i<3;i++){await choose(page,indexes[i],true);await click(page,'review-next');}}
try{
 const context=await browser.newContext({viewport:{width:390,height:844}});let page=await pageIn(context);
 await check('complete demo automatically saves actual completion and 24-hour plan',async()=>{await finishLesson(page);const s=await snapshot(page);assert.equal(s.revision,1);assert.equal(s.plan.completedAt,start);assert.equal(s.plan.dueAt,start+DAY);assert.match(await page.locator('#screen').innerText(),/复习安排已自动保存/);assert.equal(await page.locator('[data-action="save-plan"]').count(),0);await shoot(page,'saved');});
 await check('refresh and exit-reentry preserve schedule and draft without duplicate creation',async()=>{const before=await snapshot(page);await page.reload();await page.evaluate(()=>window.demo.ready);assert.deepEqual(await snapshot(page),before);await page.close();page=await pageIn(context);assert.deepEqual(await snapshot(page),before);assert.match(await page.locator('#screen').innerText(),/草稿：已保存/);});
 await check('controlled next-day clock creates a visible due entrance',async()=>{await clock(page,start+DAY);assert.match(await page.locator('#review-reminder').innerText(),/到期复习/);await shoot(page,'due');await click(page,'review-open');assert.match(await page.locator('#screen').innerText(),/到期复习 · 1 \/ 3/);});
 await check('reload resumes the next unanswered review question and prior answer',async()=>{await choose(page,1,true);await click(page,'review-next');await page.reload();await page.evaluate(()=>window.demo.ready);assert.match(await page.locator('#screen').innerText(),/到期复习 · 2 \/ 3/);const s=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).reviewSession,DEMO);assert.equal(s.attempts.length,1);});
 await check('all three unassisted answers save one receipt and seven-day next due',async()=>{await choose(page,1,true);await click(page,'review-next');await choose(page,0,true);await click(page,'review-next');await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).plan.receipts.length===1,REVIEW);const s=await snapshot(page);assert.equal(s.plan.receipts[0].outcome,'passed');assert.equal(s.plan.dueAt,start+8*DAY);assert.match(await page.locator('#screen').innerText(),/结果与排期已自动保存/);await page.setViewportSize({width:320,height:700});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await shoot(page,'passed-320');await page.reload();await page.evaluate(()=>window.demo.ready);assert.equal((await snapshot(page)).plan.receipts.length,1);});
 await check('new due occurrence uses second material set; wrong answer schedules one day',async()=>{await clock(page,start+8*DAY);await click(page,'review-open');assert.match(await page.locator('#screen').innerText(),/Kit/);await reviewAnswers(page,[0,0,1]);await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).plan.receipts.length===2,REVIEW);const s=await snapshot(page);assert.equal(s.plan.receipts.length,2);assert.equal(s.plan.receipts[1].outcome,'needs-practice');assert.equal(s.plan.dueAt,start+9*DAY);await shoot(page,'needs-practice-320');});
 await check('exhausted finite bank labels repeated material across refresh',async()=>{await clock(page,start+9*DAY);await click(page,'review-open');assert.match(await page.locator('#screen').innerText(),/同题复做/);await page.reload();await page.evaluate(()=>window.demo.ready);assert.match(await page.locator('#screen').innerText(),/同题复做/);await shoot(page,'repeat-320');});
 await check('visiting rules during unanswered review records assistance permanently',async()=>{await page.locator('.revisit summary').click();await page.locator('[data-step="1"]').click();await saved(page);await click(page,'review-open');await reviewAnswers(page,[1,1,0]);await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).plan.receipts.length===3,REVIEW);const s=await snapshot(page);assert.equal(s.plan.receipts.at(-1).outcome,'needs-practice');assert.equal(s.plan.receipts.at(-1).nextDueAt,start+10*DAY);const draft=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),DEMO);assert.equal(draft.reviewSession.attempts[0].hinted,true);});
 const savedContext=await context.storageState(),beforeZone=await snapshot(page);
 const zoneContext=await browser.newContext({viewport:{width:390,height:844},timezoneId:'America/New_York',storageState:savedContext});
 await check('timezone change on reopening preserves UTC schedule and applied receipts',async()=>{const zonePage=await pageIn(zoneContext,start+10*DAY);assert.deepEqual(await snapshot(zonePage),beforeZone);});
 await zoneContext.close();await context.close();
 const failing=await browser.newContext({viewport:{width:390,height:844}});const failed=await pageIn(failing);
 await check('quota failure retains input, reports unsaved and offers explicit retry',async()=>{await choose(failed,0);await click(failed,'learn');await click(failed,'independent');await choose(failed,1);await click(failed,'next-independent');await choose(failed,2);await click(failed,'next-independent');await click(failed,'fresh');await choose(failed,1);await click(failed,'draft');const before=await failed.evaluate(key=>localStorage.getItem(key),DEMO);await failed.evaluate(()=>window.__failSave=true);await failed.locator('#draft').fill('My input must stay here <script>alert(1)</script>');await saved(failed);await click(failed,'finish');assert.match(await failed.locator('#storage-note').innerText(),/保存未能确认/);assert.match(await failed.locator('#screen').innerText(),/保存尚未确认/);assert.equal(await failed.evaluate(key=>localStorage.getItem(key),DEMO),before);assert.equal(await snapshot(failed),null);await shoot(failed,'save-failure');await failed.evaluate(()=>window.__failSave=false);await click(failed,'review-retry-plan');await failed.waitForFunction(key=>localStorage.getItem(key)!==null,REVIEW);assert.match(await failed.locator('#screen').innerText(),/复习安排已自动保存/);assert.equal(await failed.locator('#screen script').count(),0);});
 await failing.close();
 const tabs=await browser.newContext({viewport:{width:390,height:844}});const tabA=await pageIn(tabs);await finishLesson(tabA);const tabB=await pageIn(tabs);await tabA.locator('.restart-menu summary').click();await click(tabA,'restart');
 await check('another tab cannot silently overwrite newer demo data',async()=>{await tabB.waitForFunction(()=>document.getElementById('storage-note').textContent.includes('另一个标签'));const before=await tabB.evaluate(key=>localStorage.getItem(key),DEMO);await tabB.locator('.restart-menu summary').click();await click(tabB,'restart');assert.equal(await tabB.evaluate(key=>localStorage.getItem(key),DEMO),before);assert.match(await tabB.locator('#storage-note').innerText(),/本页输入保留/);});
 await tabs.close();
 await check('no browser runtime errors during completed flows',()=>assert.deepEqual(errors,[]));
 await writeFile(resolve(proofs,'yesterday-review-browser.json'),JSON.stringify({checks,start,origin,browserVersion:browser.version(),errors,screenshots:evidence,scope:'Dedicated headless browser; injected clock/storage failure, no production state or publication'},null,2)+'\n');
 console.log(`Yesterday review browser: ${checks} checks passed.`);
}finally{await browser.close();await new Promise(r=>server.close(r));}
