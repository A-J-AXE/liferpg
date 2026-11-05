// PR 01 browser smoke + screenshot evidence. Does not mark visual approval.
import { chromium } from "playwright-core";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import path from "node:path";

const browserPath = process.env.LIFEOS_BROWSER || [
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find(existsSync);
if (!browserPath) throw new Error("Set LIFEOS_BROWSER to Chromium or Edge.");
const output = path.resolve("artifacts/rebuild-pr01");
await mkdir(output, { recursive: true });
const server = spawn(process.execPath, ["server.mjs"], { stdio: "inherit" });
let browser;
try {
  let ready = false;
  for (let n = 0; n < 60; n++) {
    try {
      const r = await fetch("http://127.0.0.1:4310/rebuild");
      if (r.ok) { ready = true; break; }
    } catch {}
    await sleep(250);
  }
  assert.ok(ready, "Rebuild HTML never became available");
  const js = await fetch("http://127.0.0.1:4310/rebuild.js");
  const css = await fetch("http://127.0.0.1:4310/rebuild.css");
  assert.equal(js.status, 200, "Build rebuild.js before browser checks");
  assert.equal(css.status, 200, "Build rebuild.css before browser checks");
  browser = await chromium.launch({
    executablePath: browserPath, headless: true,
    args: ["--no-sandbox", "--no-proxy-server"]
  });
  for (const [width,height] of [[1440,900],[1280,800],[390,844],[320,720]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: "reduce" });
    const failures = [];
    page.on("pageerror", (err) => failures.push(err.message));
    await page.goto("http://127.0.0.1:4310/rebuild", { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: "Make room for progress." }).waitFor();
    assert.equal(await page.getByRole("main").count(), 1);
    const size = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      windowWidth: window.innerWidth
    }));
    assert.ok(size.scrollWidth <= size.windowWidth + 1,
      "Horizontal overflow at "+width+": "+JSON.stringify(size));
    const prefix = width + "x" + height;
    await page.screenshot({ path: path.join(output, prefix+"-light.png"), fullPage: true });

    if (width >= 768) {
      await page.getByRole("button", { name: "Collapse sidebar" }).click();
      assert.equal(await page.locator('[data-slot="sidebar"][data-state="collapsed"]').count(), 1,
        "Collapse should alter the actual sidebar");
      await page.getByRole("button", { name: "Expand sidebar" }).click();
    } else {
      await page.getByRole("button", { name: "Toggle navigation" }).click();
      await page.getByRole("button", { name: "Planner" }).click();
      assert.equal(new URL(page.url()).hash, "#/planner");
      await page.goto("http://127.0.0.1:4310/rebuild");
      await page.getByRole("heading", { name: "Make room for progress." }).waitFor();
    }

    await page.keyboard.press("Control+k");
    await page.getByRole("dialog").waitFor();
    const search = page.locator('[data-slot="command-input"]');
    await search.fill("Skills");
    await page.getByRole("option", { name: "Skills" }).click();
    assert.equal(new URL(page.url()).hash, "#/skills");
    await page.goto("http://127.0.0.1:4310/rebuild");
    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    assert.equal(await page.locator("html.dark").count(), 1);
    await page.screenshot({ path: path.join(output, prefix+"-dark.png"), fullPage: true });

    await page.goto("http://127.0.0.1:4310/rebuild#/fitness");
    const gym = page.getByTitle("Native OpenGym");
    assert.ok((await gym.getAttribute("src")).includes("5173") ||
      (await gym.getAttribute("src")).includes("/gym/"));
    assert.deepEqual(failures, [], "Unexpected browser exceptions at " + width);
    await page.close();
    console.log("PASS",prefix,"light/dark, nav, search, OpenGym target, no overflow");
  }
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
