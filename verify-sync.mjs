import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";
import { chromium } from "playwright-core";
const dir = await mkdtemp(path.join(tmpdir(), "lifeos-sync-"));
const url = "http://127.0.0.1:4310",
  password = randomUUID();
let server, browser;
async function boot() {
  server = spawn(process.execPath, ["server.mjs"], {
    env: {
      ...process.env,
      PUBLIC_ORIGIN: url,
      PLANNER_PASSWORD: password,
      LIFEOS_WORKSPACE_DIR: pathToFileURL(dir + "/").href,
    },
    stdio: ["ignore", "pipe", "inherit"],
    windowsHide: true,
  });
  await new Promise((res, rej) => {
    server.stdout.once("data", res);
    server.once("exit", () => rej(Error("Server failed to start")));
  });
}
async function stop() {
  if (server?.exitCode === null) {
    const ended = new Promise((r) => server.once("exit", r));
    server.kill();
    await ended;
  }
}
try {
  await boot();
  assert.equal((await fetch(url + "/workspace")).status, 401);
  browser = await chromium.launch({
    executablePath:
      process.env.LIFEOS_BROWSER ||
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    args: ["--no-proxy-server"],
  });
  const session = () =>
    browser.newContext({ httpCredentials: { username: "owner", password } });
  const pc = await (await session()).newPage(),
    phone = await (await session()).newPage();
  await pc.goto(url);
  await phone.goto(url);
  await pc.getByRole("button", { name: "New project", exact: true }).click();
  await pc.getByLabel("Project name").fill("Shared project");
  await pc.getByRole("button", { name: "Linked skill", exact: true }).click();
  const skillInput = pc.getByRole("textbox", {
    name: "Skill name",
    exact: true,
  });
  await skillInput.fill("Robotics");
  await skillInput.press("Enter");
  await pc.getByRole("button", { name: "Create project", exact: true }).click();
  await phone
    .locator("#projects")
    .getByRole("button", { name: "Shared project", exact: true })
    .last()
    .waitFor({ timeout: 12000 });
  await phone
    .locator("#projects")
    .getByRole("button", { name: "Shared project", exact: true })
    .last()
    .click();
  await phone.getByRole("button", { name: "＋ Add task", exact: true }).click();
  await phone.getByLabel("Title", { exact: true }).fill("Phone task");
  await phone.getByRole("button", { name: "Create", exact: true }).click();
  await pc
    .getByRole("button", { name: "Phone task", exact: true })
    .waitFor({ timeout: 12000 });
  await stop();
  await boot();
  await pc.reload();
  await pc.getByRole("button", { name: "Phone task", exact: true }).waitFor();
  const headers = {
    authorization:
      "Basic " + Buffer.from("owner:" + password).toString("base64"),
    origin: url,
  };
  const state = await (await fetch(url + "/workspace", { headers })).json();
  const put = () =>
    fetch(url + "/workspace", {
      method: "PUT",
      headers,
      body: JSON.stringify(state),
    });
  const responses = await Promise.all([put(), put()]);
  assert.deepEqual(responses.map((r) => r.status).sort(), [200, 409]);
  console.log(
    "PASS: owner authentication, project PC -> phone, task phone -> PC, durable server restart, stale edit rejected.",
  );
} finally {
  await browser?.close();
  await stop();
  await rm(dir, { recursive: true, force: true });
}
