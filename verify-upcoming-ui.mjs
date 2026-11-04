import assert from "node:assert/strict";
import {chromium} from "playwright-core";
import {spawn} from "node:child_process";
import {mkdir} from "node:fs/promises";
const server=spawn(process.execPath,["server.mjs"],{stdio:"inherit"});
let browser;
const base="http://127.0.0.1:4310";
try {
  let ready=false;
  for(let n=0;n<80;n++){
    try {ready=(await fetch(base,{signal:AbortSignal.timeout(500)})).ok;if(ready)break;}catch{}
    await new Promise(resolve=>setTimeout(resolve,200));
  }
  if(!ready)throw Error("LifeOS local server unavailable");
  browser=await chromium.launch({executablePath:process.env.LIFEOS_BROWSER||"/usr/bin/google-chrome",args:["--no-sandbox","--no-proxy-server"]});
  const page=await browser.newPage({viewport:{width:1365,height:850},serviceWorkers:"block"});
  page.setDefaultTimeout(16000);
  const errors=[];page.on("pageerror",error=>errors.push(error.message));
  await page.goto(base);
  await page.locator("#nav").getByRole("button",{name:"Upcoming",exact:true}).click();
  await page.locator(".upcoming-workspace").waitFor();
  await mkdir("upcoming-screenshots",{recursive:true});
  const today=page.locator('.up-column[data-column-id="today"]');
  const todayInput=today.locator('input[name="title"]');
  assert.equal(await page.locator(".up-column").count(),6);
  assert.equal(await page.locator("#screen .time-board").count(),0);
  for(const name of ["Zulu Board Task","Alpha Board Task","Gamma Board Task"]){
    await todayInput.fill(name);
    await todayInput.press("Enter");
  }
  const tasks=await page.evaluate(()=>JSON.parse(localStorage.getItem("lifeos")).tasks);
  const alpha=tasks.find(t=>t.title==="Alpha Board Task"), zulu=tasks.find(t=>t.title==="Zulu Board Task");
  assert(alpha&&zulu);
  assert.equal(alpha.date,await today.getAttribute("data-plan-value"));
  assert.equal(alpha.time,"");
  await page.locator("#up-sort").selectOption("title");
  const titles=await today.locator(".up-draggable .grow>button").allTextContents();
  assert.deepEqual(titles.slice(0,3),["Alpha Board Task","Gamma Board Task","Zulu Board Task"]);
  await page.screenshot({path:"upcoming-screenshots/01-overview-light.png"});

  await page.locator("#up-sort").selectOption("manual");
  const before=await today.locator(".up-draggable").evaluateAll(els=>els.map(e=>e.dataset.upTask));
  await today.locator(".up-draggable").first().focus();
  await today.locator(".up-draggable").first().press("Alt+ArrowDown");
  const after=await today.locator(".up-draggable").evaluateAll(els=>els.map(e=>e.dataset.upTask));
  assert.equal(after.length,before.length);
  assert.equal(after[0],before[1]);
  assert.equal(after[1],before[0]);

  // Move the focused task to the adjacent period without altering identity or project.
  const movedId=before[0],week=page.locator('.up-column[data-column-id="thisWeek"]');
  await today.locator('.up-draggable[data-up-task="'+movedId+'"]').focus();
  await today.locator('.up-draggable[data-up-task="'+movedId+'"]').press("Alt+ArrowRight");
  let moved=await page.evaluate(id=>JSON.parse(localStorage.getItem("lifeos")).tasks.find(t=>t.id===id),movedId);
  assert.equal(moved.planning.kind,"week");
  assert.equal(moved.date,"");
  assert.equal(moved.time,"");
  assert.equal(await week.locator('.up-draggable[data-up-task="'+movedId+'"]').count(),1);

  // HTML5 drag between neighboring task buckets.
  await week.locator('.up-draggable[data-up-task="'+movedId+'"]').dragTo(page.locator('.up-column[data-column-id="nextWeek"]'));
  moved=await page.evaluate(id=>JSON.parse(localStorage.getItem("lifeos")).tasks.find(t=>t.id===id),movedId);
  assert.equal(moved.planning.kind,"week");
  assert.equal(await page.locator('.up-column[data-column-id="nextWeek"] .up-draggable[data-up-task="'+movedId+'"]').count(),1);

  // Month precision, Someday, capture in any column, no hourly calendar.
  const nextMonth=page.locator('.up-column[data-column-id="nextMonth"]');
  await nextMonth.locator('input[name=title]').fill("Month planning task");
  await nextMonth.locator('input[name=title]').press("Enter");
  const monthly=await page.evaluate(()=>JSON.parse(localStorage.getItem("lifeos")).tasks.find(t=>t.title==="Month planning task"));
  assert.equal(monthly.planning.kind,"month");
  assert.equal(monthly.date,"");assert.equal(monthly.time,"");
  await nextMonth.locator('.up-draggable[data-up-task="'+monthly.id+'"]').locator("select.mini-plan").selectOption("someday");
  const someday=await page.evaluate(id=>JSON.parse(localStorage.getItem("lifeos")).tasks.find(t=>t.id===id),monthly.id);
  assert.equal(someday.planning.kind,"someday");
  await page.screenshot({path:"upcoming-screenshots/02-overview-reordered.png"});

  // Completion does not duplicate tasks; completed tasks are collapsed into a disclosure section.
  const remaining=page.locator('.up-column[data-column-id="today"] .up-draggable').first();
  const doneId=await remaining.getAttribute("data-up-task");
  await remaining.locator('input[data-act="complete"]').check();
  assert.equal(await today.locator(".up-completed").count(),1);
  await today.locator(".up-completed summary").click();
  assert.equal(await today.locator('.up-completed .up-draggable[data-up-task="'+doneId+'"]').count(),1);
  const updated=await page.evaluate(id=>{const s=JSON.parse(localStorage.getItem("lifeos"));return {task:s.tasks.filter(t=>t.id===id),receipt:s.receipts[id]}},doneId);
  assert.equal(updated.task.length,1);assert.equal(updated.task[0].done,true);assert(updated.receipt);

  // Switching modes changes the task board, never mounts an hourly calendar.
  for(const [mode,count] of [["Day",7],["Week",5],["Month",5]]){
    await page.getByRole("button",{name:mode,exact:true}).click();
    assert.equal(await page.locator(".up-column").count(),count);
    assert.equal(await page.locator(".time-board").count(),0);
    await page.screenshot({path:"upcoming-screenshots/03-"+mode.toLowerCase()+".png"});
  }
  await page.getByRole("button",{name:"Month",exact:true}).click();
  const period=page.locator(".up-column").nth(1);
  const monthPeriod=await period.getAttribute("data-plan-value");
  await period.locator('input[name=title]').fill("Future month capture");
  await period.locator('input[name=title]').press("Enter");
  const future=await page.evaluate(()=>JSON.parse(localStorage.getItem("lifeos")).tasks.find(t=>t.title==="Future month capture"));
  assert.equal(future.planning.kind,"month");
  assert.equal(future.date,"");assert.equal(future.planning.value,monthPeriod.slice(0,7));

  // Keyboard change from month 1 to month 2 retains precision and linked project.
  const first=page.locator(".up-column").first();
  await first.locator('input[name=title]').fill("Month keyboard shift");
  await first.locator('input[name=title]').press("Enter");
  const shifting=await first.locator(".up-draggable").filter({hasText:"Month keyboard shift"}).getAttribute("data-up-task");
  await first.locator('.up-draggable[data-up-task="'+shifting+'"]').focus();
  await first.locator('.up-draggable[data-up-task="'+shifting+'"]').press("Alt+ArrowRight");
  const shifted=await page.evaluate(id=>JSON.parse(localStorage.getItem("lifeos")).tasks.find(t=>t.id===id),shifting);
  assert.equal(shifted.planning.value,monthPeriod.slice(0,7));

  // View preferences and task records persist after reload.
  await page.locator("#up-sort").selectOption("duration");
  await page.reload();
  await page.locator("#nav").getByRole("button",{name:"Upcoming",exact:true}).click();
  await page.getByRole("button",{name:"Month",exact:true}).click();
  assert.equal(await page.locator("#up-sort").inputValue(),"duration");
  const afterReload=await page.evaluate(()=>JSON.parse(localStorage.getItem("lifeos")).tasks.filter(t=>t.title==="Future month capture"));
  assert.equal(afterReload.length,1);
  await page.locator("#theme").click();
  await page.locator("html.black").waitFor();
  await page.screenshot({path:"upcoming-screenshots/04-month-dark.png"});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:"upcoming-screenshots/05-month-mobile.png",fullPage:true});
  const layout=await page.evaluate(()=>({body:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,board:document.querySelector(".up-scroller")?.scrollWidth}));
  assert(layout.body<=layout.viewport+4,"Unexpected sideways document overflow: "+JSON.stringify(layout));
  assert(layout.board>layout.viewport,"Upcoming period board should scroll internally");
  assert.deepEqual(errors,[]);
  console.log("PASS Upcoming: Overview/Day/Week/Month, sorting, keyboard/manual order, cross-bucket drag, month/week precision, completion, persistence, dark/mobile");
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
