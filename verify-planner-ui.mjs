import assert from "node:assert/strict";
import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";

const server=spawn(process.execPath,["server.mjs"],{stdio:"inherit"});
const base="http://127.0.0.1:4310";
let browser;
try {
  let ready=false;
  for(let i=0;i<80;i++){
    try{ready=(await fetch(base,{signal:AbortSignal.timeout(500)})).ok;if(ready)break;}catch{}
    await new Promise(resolve=>setTimeout(resolve,200));
  }
  if(!ready)throw Error("LifeOS local server did not start");
  browser=await chromium.launch({
    executablePath:process.env.LIFEOS_BROWSER||"/usr/bin/google-chrome",
    headless:true,args:["--no-sandbox","--no-proxy-server"]
  });
  const page=await browser.newPage({viewport:{width:1365,height:900},serviceWorkers:"block"});
  page.setDefaultTimeout(15000);
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto(base);
  await page.locator(".planner-layout .time-board").waitFor();
  await mkdir("planner-screenshots",{recursive:true});

  for(const n of [1,2,3,4,5,6,7]){
    await page.locator("#range").selectOption(n===1?"Day":n+" days");
    assert.equal(await page.locator(".time-day").count(),n,"Visible-day count "+n);
    assert.equal(await page.locator(".slot.hour").count(),n*24);
  }
  await page.locator("#range").selectOption("3 days");
  await page.locator("#planner-zoom").selectOption("72");
  assert.equal(await page.locator(".time-board").evaluate(el=>Math.round(parseFloat(getComputedStyle(el).getPropertyValue("--hour")))),72);
  await page.locator("#planner-zoom").selectOption("56");
  await page.screenshot({path:"planner-screenshots/01-planner-light.png"});

  const add=page.locator(".planner-queue form.task-quick input[name=title]");
  await add.fill("Precise Planner task");
  await add.press("Enter");
  const queueTask=page.locator(".planner-queue [data-task]").filter({hasText:"Precise Planner task"}).first();
  const slot=page.locator(".time-day").first().locator(".slot[data-hour='10']");
  const currentDay=await slot.getAttribute("data-date");
  const slotBounds=await slot.boundingBox();
  assert(slotBounds && slotBounds.height>45);
  await queueTask.dragTo(slot,{targetPosition:{x:12,y:slotBounds.height*.85}});
  let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem("lifeos")).tasks.find(t=>t.title==="Precise Planner task"));
  assert.equal(saved.date,currentDay);
  assert.equal(saved.time,"10:45");
  assert.equal(saved.planning.kind,"exact-time");
  assert.equal(saved.minutes,"30");
  const originalId=saved.id, originalProject=saved.project;

  let block=page.locator('.time-block[data-task="'+originalId+'"]');
  await block.focus();
  await block.press("ArrowUp");
  saved=await page.evaluate(()=>JSON.parse(localStorage.getItem("lifeos")).tasks.find(t=>t.id===arguments[0]),originalId).catch(async()=>
    page.evaluate(id=>JSON.parse(localStorage.getItem("lifeos")).tasks.find(t=>t.id===id),originalId)
  );
  assert.equal(saved.time,"10:30");
  await page.getByRole("button",{name:"Undo-planner-change"}).click();
  saved=await page.evaluate(id=>JSON.parse(localStorage.getItem("lifeos")).tasks.find(t=>t.id===id),originalId);
  assert.equal(saved.time,"10:45");
  await page.getByRole("button",{name:"Redo-planner-change"}).click();
  saved=await page.evaluate(id=>JSON.parse(localStorage.getItem("lifeos")).tasks.find(t=>t.id===id),originalId);
  assert.equal(saved.time,"10:30");

  block=page.locator('.time-block[data-task="'+originalId+'"]');
  await block.focus();
  await block.press("ArrowRight");
  saved=await page.evaluate(id=>JSON.parse(localStorage.getItem("lifeos")).tasks.find(t=>t.id===id),originalId);
  assert.notEqual(saved.date,currentDay);
  assert.equal(saved.time,"10:30");
  await page.getByRole("button",{name:"Undo-planner-change"}).click();
  saved=await page.evaluate(id=>JSON.parse(localStorage.getItem("lifeos")).tasks.find(t=>t.id===id),originalId);
  assert.equal(saved.date,currentDay);
  assert.equal(saved.project,originalProject);

  // Add a second task at the same start to test real overlapping lane widths.
  await add.fill("Overlapping task");
  await add.press("Enter");
  const other=page.locator(".planner-queue [data-task]").filter({hasText:"Overlapping task"}).first();
  const at1030=page.locator(".time-day").first().locator(".slot[data-hour='10']");
  const rect=await at1030.boundingBox();
  await other.dragTo(at1030,{targetPosition:{x:12,y:rect.height*.6}});
  const overlapping=page.locator(".time-day").first().locator('.time-block[data-task]');
  assert.equal(await overlapping.count(),2);
  const widths=await overlapping.evaluateAll(elements=>elements.map(el=>el.getBoundingClientRect().width));
  assert(widths.every(w=>w>30), "Overlapping blocks have visible lanes");
  await page.screenshot({path:"planner-screenshots/02-overlapping-blocks.png"});

  block=page.locator('.time-block[data-task="'+originalId+'"]');
  const grip=block.locator(".resize-grip");
  await grip.focus();await grip.press("ArrowDown");
  let resized=await page.evaluate(id=>JSON.parse(localStorage.getItem("lifeos")).tasks.find(t=>t.id===id),originalId);
  assert.equal(Number(resized.minutes),45);
  const handle=page.locator('.time-block[data-task="'+originalId+'"] .resize-grip');
  const handleBox=await handle.boundingBox();
  assert(handleBox);
  await page.mouse.move(handleBox.x+handleBox.width*.5,handleBox.y+handleBox.height*.5);
  await page.mouse.down();
  await page.mouse.move(handleBox.x+handleBox.width*.5,handleBox.y+handleBox.height*.5+17,{steps:8});
  await page.mouse.up();
  resized=await page.evaluate(id=>JSON.parse(localStorage.getItem("lifeos")).tasks.find(t=>t.id===id),originalId);
  assert.equal(Number(resized.minutes),60,"Pointer resize adds 15 minutes");

  // Date selection changes the visible days, not any stored task date.
  const chosen="2026-12-08";
  await page.locator("#planner-date").fill(chosen);
  assert.equal(await page.locator(".time-day").first().getAttribute("data-day"),chosen);
  await page.locator("#planner-date").fill(currentDay);
  await page.screenshot({path:"planner-screenshots/03-planner-compact.png"});

  // Undo history must never clone a task or change project/reward records.
  const state=await page.evaluate(()=>JSON.parse(localStorage.getItem("lifeos")));
  assert.equal(state.tasks.filter(t=>t.id===originalId).length,1);
  const item=state.tasks.find(t=>t.id===originalId);
  assert.equal(item.project,originalProject);
  assert.equal(item.planning.kind,"exact-time");

  // Use the real theme control and verify the grid still works in Black.
  await page.locator("#theme").click();
  await page.locator("html.black").waitFor();
  await page.screenshot({path:"planner-screenshots/04-planner-dark.png"});

  // 7-day narrow screen: intentional horizontal grid scrolling, no sideways page overflow.
  await page.setViewportSize({width:390,height:844});
  await page.locator("#range").selectOption("7 days");
  assert.equal(await page.locator(".time-day").count(),7);
  await page.screenshot({path:"planner-screenshots/05-planner-mobile.png",fullPage:true});
  const layout=await page.evaluate(()=>({page:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,
    board:document.querySelector(".calendar-scroll")?.scrollWidth}));
  assert(layout.page<=layout.client+3,"Unexpected horizontal page overflow: "+JSON.stringify(layout));
  assert(layout.board>layout.client,"7-day planner should scroll inside the time grid");
  assert.deepEqual(errors,[]);
  console.log("PASS advanced planner: 1–7 days, 24h, zoom, 15-minute drop, overlaps, keyboard move, undo/redo, pointer resize, date navigation, dark/mobile");
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
