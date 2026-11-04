import { chromium } from "playwright-core";
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
  p.on("pageerror", (e) => errors.push(e.message));
  const click = (t) => p.getByRole("button", { name: t, exact: true }).click();
  const nav = (t) =>
    p.locator("#nav").getByRole("button", { name: t, exact: true }).click();
  await p.goto("http://127.0.0.1:4310");
  await click("＋ New project");
  await p.getByLabel("Project name").fill("Robotic arm");
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
  await p
    .getByLabel("Your project image")
    .setInputFiles({
      name: "arm.png",
      mimeType: "image/png",
      buffer: Buffer.from(png, "base64"),
    });
  await click("Save");
  async function task(title, time, priority, children = "") {
    await click("＋ Add task");
    await p.getByLabel("Title", { exact: true }).fill(title);
    await p.getByLabel("Start time").fill(time);
    await p.getByLabel("Priority", { exact: true }).selectOption(priority);
    await p.getByLabel("Subtasks").fill(children);
    await click("Save");
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
  await p.locator("#range").selectOption("Week");
  await p.locator("#range").selectOption("Month");
  await p.getByRole("button", { name: "›", exact: true }).click();
  await p.getByRole("button", { name: "‹", exact: true }).click();
  await p.locator("[data-act=reset]").click();
  assert.equal(await p.locator("#range").inputValue(), "Day");
  await nav("Habits");
  await click("＋ New habit");
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
  const out = process.env.LIFEOS_SCREENSHOTS || "screenshots";
  await mkdir(out, { recursive: true });
  await p.screenshot({
    path: path.join(out, "LifeOS-Overview.png"),
    fullPage: true,
  });
  await nav("Today");
  await click("◐ Light mode");
  await p.reload();
  await nav("Today");
  assert(await p.locator("html.black").count());
  await p.screenshot({
    path: path.join(out, "LifeOS-Today.png"),
    fullPage: true,
  });
  await p.setViewportSize({ width: 610, height: 820 });
  assert(
    await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  );
  await p.setViewportSize({ width: 1320, height: 960 });
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
  assert.deepEqual(errors, []);
  console.log(
    "PASS: native launch, project upload, task scheduling, subtask persistence, reversible rewards, calendar navigation, habits, diary, both themes, narrow layout, five gym routes and saved workout history.",
  );
} finally {
  await browser?.close();
  if (child.connected) child.send("shutdown");
  await rm(data, { recursive: true, force: true }).catch(() => {});
}
