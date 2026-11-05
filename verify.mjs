import { chromium } from "playwright-core";
import { verifyModel, verifyWorkspaces } from "./verify-workspaces.mjs";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
const data = await mkdtemp(path.join(tmpdir(), "lifeos-qa-"));
const child = spawn(process.execPath, ["start.mjs"], {
  env: { ...process.env, LIFEOS_DATA_DIR: data },
  windowsHide: true,
  stdio: ["inherit", "inherit", "inherit", "ipc"],
});
let browser;
try {
  for (let i = 0; i < 60; i++) {
    try {
      if (
        (
          await fetch("http://127.0.0.1:4310", {
            signal: AbortSignal.timeout(700),
          })
        ).ok &&
        (
          await fetch("http://127.0.0.1:5173", {
            signal: AbortSignal.timeout(700),
          })
        ).ok
      )
        break;
    } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  browser = await chromium.launch({
    executablePath:
      process.env.LIFEOS_BROWSER ||
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    args: ["--no-proxy-server"],
  });
  const p = await browser.newPage({
    viewport: { width: 1320, height: 960 },
    serviceWorkers: "block",
  });
  p.setDefaultTimeout(10000);
  const errors = [];
  p.on("pageerror", (e) => {
    console.error(e.stack);
    errors.push(e.message);
  });
  const click = (t) => p.getByRole("button", { name: t, exact: true }).click();
  const nav = (t) =>
    p.locator("#nav").getByRole("button", { name: t, exact: true }).click();
  await p.goto("http://127.0.0.1:4310");
  await p.evaluate(async () => {
    await import("/app.js");
  });
  await click("New project");
  await p.getByLabel("Project name").fill("Robotic arm");
  await p.getByText("More properties", { exact: true }).click();
  await p.getByLabel("Linked skill").fill("Robotics");
  const png = await p.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 100;
    const x = c.getContext("2d");
    x.fillStyle = "#34304b";
    x.fillRect(0, 0, 100, 100);
    x.strokeStyle = "#bfadeb";
    x.lineWidth = 10;
    x.lineCap = "round";
    x.beginPath();
    x.moveTo(22, 77);
    x.lineTo(46, 43);
    x.lineTo(76, 57);
    x.stroke();
    x.fillStyle = "#fff";
    x.beginPath();
    x.arc(46, 43, 7, 0, Math.PI * 2);
    x.fill();
    return c.toDataURL().split(",")[1];
  });
  await p.getByLabel("Your project image").setInputFiles({
    name: "arm.png",
    mimeType: "image/png",
    buffer: Buffer.from(png, "base64"),
  });
  await click("Save");
  const out = process.env.LIFEOS_SCREENSHOTS || "screenshots";
  await mkdir(out, { recursive: true });
  async function task(title, time, priority, children = "") {
    await click("＋ Add task");
    await p.getByLabel("Title", { exact: true }).fill(title);
    const composer = p.locator(".task-composer");
    assert.equal(await composer.getByLabel("Start time").count(), 0);
    await composer.getByRole("button", { name: "Priority: None" }).click();
    await composer.getByRole("button", { name: priority, exact: true }).click();
    if (children)
      await p.screenshot({ path: path.join(out, "LifeOS-Composer-Light.png") });
    await click("More task options");
    await click("Schedule");
    await click("Pick planned date");
    await composer.locator("[data-today=true] button").click();
    await click("More task options");
    await click("Schedule");
    await composer.getByLabel("Start time", { exact: true }).fill(time);
    if (children) {
      await click("More task options");
      await click("Subtasks");
      await p.getByLabel("Subtasks", { exact: true }).fill(children);
    }
    await click("Create");
  }
  await task(
    "Calibrate wrist joint",
    "10:00",
    "Goal",
    "Measure offset\nRecord angle",
  );
  await task("Review joint limits", "13:30", "Medium");
  await task("Run motion simulation", "15:00", "High");
  await nav("Today");
  const done = p.getByRole("checkbox", {
    name: "Complete Calibrate wrist joint",
  });
  await done.check();
  await done.uncheck();
  await done.check();
  await p.reload();
  let st = await p.evaluate(() => JSON.parse(localStorage.lifeos));
  assert.equal(Object.keys(st.receipts).length, 1);
  assert.equal(Object.values(st.receipts)[0].skill, "Robotics");
  assert(st.projects[0].image.startsWith("data:image/png"));
  assert.equal(st.tasks[0].children.length, 2);
  assert.equal(st.tasks[0].time, "10:00");
  await nav("Planner");
  for (const days of [1, 2, 3, 4, 5, 6, 7]) {
    await p.locator("#range").selectOption(String(days));
    await p.waitForFunction(
      (n) => document.querySelectorAll(".ws-day").length === n,
      days,
    );
  }
  await click("Next range");
  await click("Previous range");
  await nav("Today");
  await p.keyboard.press("Control+k");
  await p.getByPlaceholder("Search tasks or projects").fill("Calibrate wrist");
  await p.keyboard.press("Enter");
  await p.getByRole("button", { name: "Pick planned date" }).click();
  await p.getByRole("grid").waitFor();
  await p.keyboard.press("Escape");
  assert.equal(
    await p.getByLabel("Title", { exact: true }).inputValue(),
    "Calibrate wrist joint",
  );
  await click("Dismiss composer");
  // Existing tasks expose routine controls without an Apply step.
  await click("Review joint limits");
  const detail = p.locator(".task-detail");
  await detail
    .getByLabel("Title", { exact: true })
    .fill("Review updated limits");
  await detail.getByLabel("Title", { exact: true }).press("Enter");
  await detail.getByLabel("Title", { exact: true }).fill("Review joint limits");
  await detail.getByLabel("Title", { exact: true }).press("Enter");
  await detail
    .getByLabel("Description", { exact: true })
    .fill("Check the end stop");
  await detail.getByLabel("New subtask").fill("Inspect stop");
  await detail.getByLabel("New subtask").press("Enter");
  await detail.getByLabel("Complete subtask Inspect stop").check();
  await click("Time");
  await detail.getByLabel("Start time").fill("13:30");
  await click("Duration");
  await click("45m");
  await click("Tags");
  await detail
    .getByRole("textbox", { name: "Tags", exact: true })
    .fill("robotics");
  await click("Location");
  await detail
    .getByRole("textbox", { name: "Location", exact: true })
    .fill("Lab");
  await click("Repeat");
  await detail
    .getByRole("combobox", { name: "Repeat", exact: true })
    .selectOption("Weekly");
  await click("Attachment");
  await p.getByLabel("Attach file", { exact: true }).setInputFiles({
    name: "limits.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Fixture attachment"),
  });
  await click("Attachment");
  await p
    .locator(".task-detail")
    .screenshot({ path: path.join(out, "Task-detail.png") });
  await click("Dismiss composer");
  await p.locator(".task-composer").waitFor({ state: "hidden" });
  await p.reload();
  await p.waitForFunction(() =>
    JSON.parse(localStorage.lifeos).tasks.some(
      (t) => t.file?.name === "limits.txt",
    ),
  );
  const edited = await p.evaluate(() =>
    JSON.parse(localStorage.lifeos).tasks.find(
      (t) => t.title === "Review joint limits",
    ),
  );
  assert.equal(edited.tags, "robotics");
  assert.equal(edited.location, "Lab");
  assert.equal(edited.notes, "Check the end stop");
  assert.equal(edited.repeat, "Weekly");
  assert.equal(edited.time, "13:30");
  assert.equal(edited.minutes, "45");
  assert.equal(edited.children[0].done, true);
  await nav("Habits");
  await click("New habit");
  await p.getByLabel("Habit", { exact: true }).fill("Practice control theory");
  await p.getByLabel("Skill", { exact: true }).selectOption("Robotics");
  await click("Save");
  await click("Check in");
  await click("Undo check-in");
  await click("Check in");
  await nav("Diary");
  await p
    .getByLabel("Today’s reflection")
    .fill("The wrist offset is now repeatable.");
  await click("Save entry");
  await nav("Overview");
  assert.equal(
    await p
      .getByRole("progressbar", { name: "Character progress" })
      .getAttribute("aria-valuenow"),
    "35",
  );
  assert(await p.locator("#projects img").isVisible());
  // XP uses a short fill on a gain, and the same numeric change without motion when requested.
  const wrist = p.getByRole("checkbox", {
    name: "Complete Calibrate wrist joint",
  });
  const character = p.getByRole("progressbar", { name: "Character progress" });
  await wrist.uncheck();
  await wrist.check();
  assert(
    await character
      .locator("[data-slot=progress-indicator]")
      .evaluate((el) =>
        el.getAnimations().some((a) => a.effect.getTiming().duration === 360),
      ),
  );
  await p.emulateMedia({ reducedMotion: "reduce" });
  await wrist.uncheck();
  await wrist.check();
  assert.equal(await character.getAttribute("aria-valuenow"), "35");
  assert.equal(
    await character
      .locator("[data-slot=progress-indicator]")
      .evaluate((el) => el.getAnimations().length),
    0,
  );
  await p.emulateMedia({ reducedMotion: "no-preference" });
  await nav("Planner");
  const halfHour = p
    .locator(".ws-block")
    .filter({ hasText: "Review joint limits" })
    .first();
  assert.equal(await halfHour.evaluate((el) => el.offsetTop), 648);
  await nav("Overview");
  await p.screenshot({
    path: path.join(out, "LifeOS-Overview.png"),
    fullPage: true,
  });
  await nav("Today");
  await p.screenshot({ path: path.join(out, "LifeOS-Today-Light.png") });
  await click("◐ Light mode");
  await p.reload();
  await nav("Today");
  assert(await p.locator("html.black").count());
  await p.screenshot({
    path: path.join(out, "LifeOS-Today.png"),
    fullPage: true,
  });
  await p.setViewportSize({ width: 610, height: 820 });
  await p.screenshot({ path: path.join(out, "LifeOS-Narrow.png") });
  await click("Review joint limits");
  const narrowEditor = p.locator(".task-detail");
  await narrowEditor.getByLabel("New subtask").waitFor();
  const editorBounds = await narrowEditor.boundingBox();
  assert(editorBounds.x >= 0 && editorBounds.x + editorBounds.width <= 611);
  await narrowEditor.screenshot({
    path: path.join(out, "Task-detail-narrow.png"),
  });
  await click("Dismiss composer");
  assert(
    await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  );
  await p.getByRole("button", { name: "Toggle navigation" }).click();
  await p.getByRole("button", { name: "Skills", exact: true }).click();
  await p.getByRole("heading", { name: "Skills", exact: true }).waitFor();
  await p.keyboard.press("c");
  await p
    .getByLabel("Title", { exact: true })
    .fill("Inspect gripper clearance");
  await p
    .locator(".task-composer")
    .screenshot({ path: path.join(out, "Composer-narrow.png") });
  await p.getByLabel("Title", { exact: true }).press("Enter");
  await p.getByRole("button", { name: "Toggle navigation" }).click();
  await p.getByRole("button", { name: "Today", exact: true }).click();
  await p
    .getByRole("button", { name: "Inspect gripper clearance", exact: true })
    .waitFor();
  await p.setViewportSize({ width: 1320, height: 960 });
  await nav("Overview");
  await p.screenshot({ path: path.join(out, "LifeOS-Overview-Black.png") });
  await click("Link a task");
  await p.getByPlaceholder("Find a task to focus on").fill("Review joint");
  await p.keyboard.press("Enter");
  await click("Timer options");
  await p.getByLabel("Duration (min)").fill("30");
  await click("Apply duration");
  await click("Start timer");
  const before = await p.evaluate(() => JSON.parse(localStorage.lifeos).timer);
  assert(before.end > Date.now());
  assert(before.task);
  await nav("Today");
  await p.reload();
  await p.getByRole("button", { name: "Pause timer" }).waitFor();
  assert.equal(
    await p.evaluate(() => JSON.parse(localStorage.lifeos).timer.end),
    before.end,
  );
  await click("Expand timer");
  // Wait for a real clock tick and the expansion transition before capturing.
  await p.waitForFunction(
    () => document.querySelector("[role=timer]").textContent !== "30:00",
  );
  const expanded = p.locator(".focus-control.is-expanded");
  assert(
    await expanded
      .getByText("Review joint limits", { exact: true })
      .evaluate((el) => el.getBoundingClientRect().width > 45),
  );
  await expanded.screenshot({ path: path.join(out, "Timer-detail.png") });
  await p.screenshot({ path: path.join(out, "LifeOS-Timer-Black.png") });
  await click("Pause timer");
  await click("Collapse timer");
  await click("Timer options");
  await click("Break");
  assert.equal(await p.getByRole("timer").textContent(), "5:00");
  await click("Link a task");
  await click("Unlink task");
  await click("Timer options");
  await click("Reset");
  assert.equal(
    await p.evaluate(() => JSON.parse(localStorage.lifeos).timer.task),
    "",
  );
  await nav("Today");
  await click("＋ Add task");
  await p.getByLabel("Title", { exact: true }).fill("Review arm trajectory");
  await p.screenshot({ path: path.join(out, "LifeOS-Composer-Black.png") });
  await click("Pick planned date");
  await p
    .locator(".task-composer")
    .getByRole("button", { name: "Inbox", exact: true })
    .click();
  await click("More task options");
  await click("Schedule");
  await p.getByLabel("Start time", { exact: true }).fill("10:45");
  await click("Create");
  await p.getByRole("alert").filter({ hasText: "Choose a date" }).waitFor();
  await p.keyboard.press("Escape");
  await p.keyboard.press("Escape");
  await p.goto("http://127.0.0.1:4310/design-system");
  await click("Edit task");
  await p.getByLabel("Task title").fill("Check arm reach");
  await click("Save task");
  await p.getByText("Check arm reach", { exact: true }).waitFor();
  await click("◐ Black mode");
  await p.getByText("Check arm reach", { exact: true }).waitFor();
  await p.screenshot({ path: path.join(out, "LifeOS-Showcase-Light.png") });
  await click("◐ Light mode");
  await click("Set priority");
  await p.getByRole("menuitem", { name: "High", exact: true }).click();
  await click("Choose date");
  await p.getByRole("grid").first().waitFor();
  await p.keyboard.press("Escape");
  await click("Commands");
  await p.getByPlaceholder("Find a command").fill("Rename");
  await p.keyboard.press("Enter");
  await p.getByLabel("Task title").waitFor();
  await p.keyboard.press("Escape");
  await p.getByRole("tab", { name: "Progress", exact: true }).click();
  await click("Complete sample task");
  assert.equal(
    await p
      .getByRole("progressbar", { name: "Robotics experience" })
      .getAttribute("aria-valuenow"),
    "60",
  );
  await click("Undo completion");
  await p.getByRole("button", { name: "Reward details" }).hover();
  await p.getByRole("tooltip").waitFor();
  await p.screenshot({ path: path.join(out, "LifeOS-Showcase.png") });
  await nav("Overview");
  await p.addInitScript(() => {
    if (location.port !== "5173") return;
    localStorage.setItem("gym_guest", "1");
    if (!localStorage.getItem("gym_state_v1"))
      localStorage.setItem(
        "gym_state_v1",
        JSON.stringify({
          lang: "en",
          routines: [
            {
              id: "qa",
              name: "Arm Practice",
              ex: [{ id: "2269", sets: 1, reps: 6, weight: 10 }],
            },
          ],
        }),
      );
  });
  await nav("openGym");
  await p
    .frameLocator("iframe")
    .getByText("openGym", { exact: true })
    .first()
    .waitFor();
  const gym = p.frames().find((f) => f.url().includes(":5173"));
  await click("Start timer");
  await click("Pause timer");
  assert.equal(
    gym.isDetached(),
    false,
    "Timer actions keep the native workout mounted",
  );
  for (const route of ["plan", "stats", "library", "workout"]) {
    await gym.goto("http://127.0.0.1:5173/#/" + route);
    await gym.locator("h1").first().waitFor();
  }
  const tour = gym.getByRole("button", { name: "Skip", exact: true });
  if (await tour.isVisible()) {
    await gym.getByText("Just training", { exact: true }).click();
    await tour.click();
  }
  await gym.getByText("Arm Practice", { exact: true }).click();
  await gym.waitForTimeout(300);
  const skipWeight = gym.getByText("Start without weighing in", {
    exact: true,
  });
  if (await skipWeight.isVisible()) await skipWeight.click();
  await gym.getByLabel("Set 1 done", { exact: true }).click();
  await gym
    .locator("#modal-root")
    .getByRole("button", { name: "Finish workout", exact: true })
    .click();
  await gym.goto("http://127.0.0.1:5173/#/history");
  await gym.getByText("Arm Practice", { exact: true }).first().waitFor();
  await gym.goto("http://127.0.0.1:5173/#/history");
  await gym.getByText("Arm Practice", { exact: true }).first().waitFor();
  st = await p.evaluate(() => JSON.parse(localStorage.lifeos));
  assert.equal(
    Object.values(st.receipts).filter((r) => r.skill === "Gym").length,
    1,
  );
  assert.equal(
    Object.values(st.receipts).find((r) => r.skill === "Gym").xp,
    25,
  );
  await nav("Overview");
  await p.getByText("Arm Practice", { exact: true }).waitFor();
  verifyModel();
  await verifyWorkspaces(p, out);
  assert.deepEqual(errors, []);
  console.log(
    "PASS: workspace navigation, planning precision, 1–7 day calendars, drag, resize, task reassignment, timer completion, compact composer, advanced fields and attachment, linked focus timer through reload and navigation, native launch, project upload, task scheduling, subtask persistence, reversible rewards, calendar navigation, habits, diary, both themes, narrow layout, five gym routes and saved workout history.",
  );
} finally {
  await browser?.close();
  if (child.connected) child.send("shutdown");
  await rm(data, { recursive: true, force: true }).catch(() => {});
}
