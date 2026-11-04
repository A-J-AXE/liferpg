import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";

const base = "http://127.0.0.1:4310";
const server = spawn(process.execPath, ["server.mjs"], { stdio: "inherit" });
let browser;
try {
  let ready = false;
  for (let i = 0; i < 80; i++) {
    try {
      ready = (await fetch(base, { signal: AbortSignal.timeout(500) })).ok;
      if (ready) break;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  if (!ready) throw Error("LifeOS server unavailable for design-system test");
  browser = await chromium.launch({
    executablePath: process.env.LIFEOS_BROWSER || "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox", "--no-proxy-server"],
  });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 850 },
    serviceWorkers: "block",
  });
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base + "/design-system");
  await page.getByRole("heading", { name: "Desktop design system" }).waitFor();
  await mkdir("workspace-screenshots", { recursive: true });

  assert.equal(await page.locator(".lo-task-row").count(), 3);
  assert.equal(await page.locator(".lo-lane").count(), 3);
  await page.screenshot({ path: "workspace-screenshots/design-system-light.png", fullPage: true });

  // Real isolated demo state: capture, complete, undo, edit and priority.
  await page.getByRole("textbox", { name: "New task" }).fill("Test keyboard and menus");
  await page.getByRole("textbox", { name: "New task" }).press("Enter");
  assert.equal(await page.locator(".lo-task-row").count(), 4);
  const checkbox = page.getByRole("checkbox", { name: "Complete Test keyboard and menus" });
  await checkbox.check();
  assert.equal(await page.locator(".lo-reward-numbers strong").first().textContent(), "60");
  await checkbox.uncheck();
  assert.equal(await page.locator(".lo-reward-numbers strong").first().textContent(), "35");

  await page.getByRole("button", { name: "Test keyboard and menus", exact: true }).click();
  await page.getByRole("textbox", { name: "Task name" }).fill("Renamed sample task");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.getByRole("button", { name: "Renamed sample task", exact: true }).waitFor();
  await page.getByRole("button", { name: "More actions for Renamed sample task" }).click();
  await page.getByRole("menuitem", { name: "High", exact: true }).click();
  assert.equal(
    await page.locator('.lo-task-row[aria-label="Task: Renamed sample task"]').getAttribute("data-priority"),
    "High"
  );

  await page.getByRole("tab", { name: "Upcoming" }).click();
  await page.getByText("UPCOMING TASK BUCKETS").waitFor();
  await page.getByLabel("Days").selectOption("5");
  assert.equal(await page.locator(".lo-lane").count(), 5);

  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.getByRole("button", { name: "Pause", exact: true }).waitFor();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "Start", exact: true }).waitFor();

  await page.getByRole("button", { name: /Commands/ }).first().click();
  await page.getByRole("option", { name: "Open Planner" }).click();
  await page.getByText("DAY PLANNING PREVIEW").waitFor();

  // Dark theme uses production semantic tokens.
  await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem("lifeos") || "{}");
    state.theme = "Black";
    localStorage.setItem("lifeos", JSON.stringify(state));
  });
  await page.reload();
  await page.locator("html.black").waitFor();
  await page.getByRole("heading", { name: "Desktop design system" }).waitFor();
  await page.screenshot({ path: "workspace-screenshots/design-system-dark.png", fullPage: true });

  // Narrow layout must not accidentally create horizontal page overflow.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "workspace-screenshots/design-system-mobile.png", fullPage: true });
  const bounds = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  assert(bounds.page <= bounds.viewport + 2, "Unexpected horizontal page overflow: " + JSON.stringify(bounds));
  assert.equal(errors.length, 0, "Browser errors: " + errors.join("; "));
  console.log("PASS: Design playground renders, captures, edits, menus, tabs, timer, XP/undo, themes and narrow layout.");
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
