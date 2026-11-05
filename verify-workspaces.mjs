import assert from "node:assert/strict";
import path from "node:path";
import {
  key,
  offset,
  week,
  plan,
  applyPlan,
  columns,
  bucket,
  lanes,
} from "./ui/planning.mjs";
export async function verifyWorkspaces(p, out) {
  const nav = async (s) => {
    await p
      .locator("#nav")
      .getByRole("button", { name: s, exact: true })
      .click();
  };
  const taskTitle = "Workspace acceptance";
  const state = () => p.evaluate(() => JSON.parse(localStorage.lifeos));
  const target = async () =>
    (await state()).tasks.find((t) => t.title === taskTitle);
  const none = async () =>
    assert.equal(await p.locator(".ws-time-grid,.time-board").count(), 0);
  await nav("Inbox");
  await none();
  await nav("Upcoming");
  const mode = async (m) =>
    p.locator(".ws-tabs").getByRole("button", { name: m, exact: true }).click();
  await mode("Overview");
  await p.locator(".ws-bucket").first().waitFor();
  assert.equal(await p.locator(".ws-bucket").count(), 6);
  const first = p.locator(".ws-bucket").first().getByLabel("Quick add task");
  await first.fill(taskTitle);
  await first.press("Enter");
  const id = (await target()).id;
  const row = () => p.locator('[data-task="' + id + '"]');
  await mode("Day");
  assert.equal(await p.locator(".ws-bucket").count(), 7);
  await row().dragTo(p.locator(".ws-bucket header").nth(1));
  assert.equal((await target()).date, offset(key(), 1));
  await mode("Overview");
  for (const [column, kind] of [
    [2, "week"],
    [4, "month"],
    [5, "someday"],
  ]) {
    if (kind === "week")
      await row().dragTo(p.locator(".ws-bucket header").nth(column));
    else {
      await row()
        .getByLabel("Actions for " + taskTitle)
        .click();
      await p
        .getByRole("menuitem", {
          name: kind === "month" ? "Move to Next month" : "Move to Someday",
          exact: true,
        })
        .click();
    }
    await p.waitForFunction(
      ({ id, kind }) =>
        JSON.parse(localStorage.lifeos).tasks.find((t) => t.id === id)?.period
          ?.kind === kind,
      { id, kind },
    );
    const t = await target();
    assert.equal(t.period.kind, kind);
    assert.equal(t.date, "");
    assert.equal(t.time, "");
    assert.equal(await row().count(), 1);
    assert.equal((await state()).tasks.filter((t) => t.id === id).length, 1);
  }
  await p.reload();
  await row().waitFor();
  assert.equal((await target()).period.kind, "someday");
  for (const m of ["Week", "Month"]) {
    await mode(m);
    await none();
    const col = p.locator(".ws-bucket").nth(1);
    const quick = col.getByLabel("Quick add task");
    await quick.fill("Coarse " + m);
    await quick.press("Enter");
    const t = (await state()).tasks.find((t) => t.title === "Coarse " + m);
    assert.equal(t.period.kind, m.toLowerCase());
    assert.equal(t.date, "");
  }
  await mode("Overview");
  await p.screenshot({ path: path.join(out, "Upcoming.png") });
  await nav("Planner");
  await p.locator("#range").selectOption("3");
  const current = await p.locator(".ws-day").first().getAttribute("data-date");
  await p.getByLabel("Next range", { exact: true }).click();
  assert.equal(
    await p.locator(".ws-day").first().getAttribute("data-date"),
    offset(current, 3),
  );
  await p.getByLabel("Previous range", { exact: true }).click();
  await p.reload();
  assert.equal(await p.locator("#range").inputValue(), "3");
  const day = p.locator(".ws-day").nth(1);
  await row().dragTo(day, { targetPosition: { x: 20, y: 606 } });
  const scheduled = await target();
  assert.equal(scheduled.date, offset(current, 1));
  assert.equal(scheduled.time, "12:30");
  await p
    .getByRole("slider", { name: "Resize " + taskTitle })
    .press("ArrowDown");
  assert.equal(
    Number((await target()).minutes),
    Number(scheduled.minutes) + 15,
  );
  await row().dragTo(p.locator(".ws-day").first(), {
    targetPosition: { x: 25, y: 654 },
  });
  assert.equal((await target()).time, "13:30");
  await row().getByRole("button").click();
  await p.getByRole("button", { name: "Deadline", exact: true }).click();
  await p.locator("#task-deadline").fill(current);
  await p
    .getByRole("button", { name: "Dismiss composer", exact: true })
    .click();
  await p
    .getByRole("button", { name: "Due · " + taskTitle, exact: true })
    .waitFor();
  await p.screenshot({ path: path.join(out, "Planner.png") });
  await row().dragTo(p.locator(".ws-date-heading").nth(1));
  const planned = p.getByRole("button", {
    name: "Planned · " + taskTitle,
    exact: true,
  });
  await planned.waitFor();
  assert.equal((await target()).date, offset(current, 1));
  assert.equal((await target()).time, "");
  await planned.dragTo(p.locator(".ws-pool h2"));
  assert.equal((await target()).time, "");
  assert.equal((await target()).date, "");
  assert.equal((await target()).deadline, current);
  await nav("Inbox");
  await row().waitFor();
  await none();
  const project = (await state()).projects[0];
  await p
    .locator("#projects")
    .getByRole("button", { name: project.name, exact: true })
    .click();
  await p.locator(".ws-project").waitFor();
  await none();
  await p.screenshot({ path: path.join(out, "Project.png") });
  assert.equal(await row().count(), 0);
  // Return to the existing project's scheduled record and move it between projects.
  await p
    .getByRole("button", { name: "New project", exact: true })
    .first()
    .click();
  await p.getByLabel("Project name").fill("Second project");
  await p.getByText("More properties", { exact: true }).click();
  await p
    .getByRole("textbox", { name: "Linked skill", exact: true })
    .fill("Robotics");
  await p.getByRole("button", { name: "Save", exact: true }).click();
  const second = (await state()).projects.find(
    (x) => x.name === "Second project",
  );
  await p
    .locator("#projects")
    .getByRole("button", { name: project.name, exact: true })
    .click();
  await p
    .getByRole("button", { name: "Review joint limits", exact: true })
    .click();
  await p
    .locator(".task-composer")
    .getByRole("button", { name: /Choose project/ })
    .click();
  const projectSearch = p.getByPlaceholder("Find project");
  await projectSearch.fill("Second");
  await p
    .locator(".task-detail")
    .screenshot({ path: path.join(out, "Project-picker.png") });
  await projectSearch.press("Enter");
  await p
    .getByRole("button", { name: "Dismiss composer", exact: true })
    .click();
  await p
    .locator("#projects")
    .getByRole("button", { name: "Second project", exact: true })
    .click();
  const occurrence = (await state()).tasks.find(
    (t) => t.title === "Review joint limits",
  );
  const completed = p
    .locator("[data-task=" + JSON.stringify(occurrence.id) + "]")
    .getByRole("checkbox");
  await completed.check();
  assert.equal(
    (await state()).tasks.find((t) => t.title === "Review joint limits")
      .project,
    second.id,
  );
  await p.getByText("1 of 2 done", { exact: true }).waitFor();
  await p.setViewportSize({ width: 650, height: 810 });
  assert(
    await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  );
  await p.locator("h1").click();
  await p.keyboard.press("p");
  await p.locator(".ws-scroll").waitFor();
  assert(
    await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  );
  await p.screenshot({ path: path.join(out, "Planner-narrow.png") });
  await p.setViewportSize({ width: 1320, height: 960 });
  // Two read-only events from a selected calendar share the timeline with a task.
  const date = key();
  await p.route("**/google/events?**", (route) =>
    route.fulfill({
      json: {
        events: ["a", "b"].map((id) => ({
          id,
          title: "External " + id,
          start: date + "T13:20:00",
          end: date + "T13:55:00",
        })),
      },
    }),
  );
  await p.evaluate(() =>
    localStorage.setItem(
      "lifeos:calendars",
      JSON.stringify({ fixture: { color: "#398081" } }),
    ),
  );
  await nav("Planner");
  await p.reload();
  await p.getByRole("button", { name: /External a/ }).waitFor();
  assert(await p.getByRole("button", { name: /External a/ }).isDisabled());
  assert.equal(await p.locator(".external").count(), 2);
  assert.equal(
    await p
      .locator(".external")
      .first()
      .evaluate((el) => el.offsetWidth < el.parentElement.clientWidth / 2),
    true,
  );
  await p.evaluate(() => {
    const data = JSON.parse(localStorage.lifeos);
    data.timer.end = Date.now() + 1000;
    data.timer.left = 1;
    localStorage.lifeos = JSON.stringify(data);
  });
  await p.reload();
  await p.locator("#timer-notice").waitFor();
  assert.equal((await state()).timer.end, null);
  await p.reload();
  assert.equal(await p.locator("#timer-notice").count(), 0);
  const snapshot = await p.evaluate(async () => {
    return new Promise((res, rej) => {
      const req = indexedDB.open("lifeos-recovery");
      req.onsuccess = () => {
        const read = req.result
          .transaction("snapshots")
          .objectStore("snapshots")
          .get("before-periods");
        read.onsuccess = () => res(JSON.parse(read.result));
        read.onerror = rej;
      };
    });
  });
  assert(snapshot.projects.some((x) => x.id === project.id));
  await nav("Skills");
  const skill = p.locator(".entity-tile").filter({ hasText: "Robotics" });
  const skillXP = await skill
    .getByRole("progressbar")
    .getAttribute("aria-valuenow");
  await skill
    .getByRole("button", { name: "Rename Robotics", exact: true })
    .click();
  const rename = p.getByRole("textbox", { name: "Rename skill", exact: true });
  await rename.fill("Control systems");
  await rename.press("Enter");
  const renamed = p
    .locator(".entity-tile")
    .filter({ hasText: "Control systems" });
  assert.equal(
    await renamed.getByRole("progressbar").getAttribute("aria-valuenow"),
    skillXP,
  );
  await renamed
    .getByRole("button", { name: "Change image", exact: true })
    .click();
  await p.getByRole("button", { name: "Choose icon", exact: true }).click();
  await p.getByPlaceholder("Search icons").fill("Code");
  await p.getByRole("option", { name: "Code", exact: true }).click();
  await p.reload();
  assert.equal((await state()).skillArt["Control systems"].value, "Code");
  await p.screenshot({ path: path.join(out, "Skills.png") });
  const projectRow = p
    .locator(".sidebar-project")
    .filter({ hasText: project.name });
  await projectRow
    .getByRole("button", { name: "Change image", exact: true })
    .click();
  await p.getByRole("button", { name: "Remove image", exact: true }).click();
  assert.equal(
    (await state()).projects.find((x) => x.id === project.id).image,
    "",
  );
  await projectRow
    .getByRole("button", { name: "Rename " + project.name, exact: true })
    .first()
    .click();
  const renameProject = p.getByRole("textbox", {
    name: "Rename project",
    exact: true,
  });
  await renameProject.fill("Robot workshop");
  await renameProject.press("Enter");
  await p.locator('#projects [data-key="' + project.id + '"]').click();
  await p
    .getByRole("heading", { name: "Robot workshop", exact: true })
    .waitFor();
  await nav("Habits");
  await p.getByRole("heading", { name: "Growth", exact: true }).waitFor();
  await p.getByRole("heading", { name: "Battle", exact: true }).waitFor();
  await p.getByRole("button", { name: "Add bad habit", exact: true }).click();
  await p
    .getByRole("textbox", { name: "Name", exact: true })
    .fill("Late scrolling");
  await p.getByRole("button", { name: "Save", exact: true }).click();
  const beforeBattle = Object.keys((await state()).receipts).length;
  const battleTile = p
    .locator(".entity-tile")
    .filter({ hasText: "Late scrolling" });
  await battleTile
    .getByRole("button", { name: "Change image", exact: true })
    .click();
  await p.getByRole("button", { name: "Choose emoji", exact: true }).click();
  await p.getByRole("button", { name: "🎯", exact: true }).click();
  assert.equal((await state()).battles[0].art.value, "🎯");
  await p.getByRole("button", { name: "Occurred", exact: true }).click();
  await p.getByRole("button", { name: "Occurred", exact: true }).click();
  assert.equal((await state()).battles[0].log.length, 1);
  assert.equal(Object.keys((await state()).receipts).length, beforeBattle);
  await p.getByRole("button", { name: "Avoided", exact: true }).click();
  assert.equal((await state()).battles[0].log.length, 0);
  await p.reload();
  await p.getByText(/Avoided today/).waitFor();
  await p.screenshot({ path: path.join(out, "Habits.png") });
  await nav("Overview");
  await none();
}
export function verifyModel() {
  const legacy = {
    id: "a",
    date: "2026-10-25",
    time: "03:30",
    project: "b",
    done: true,
    repeat: "Weekly",
  };
  const backup = JSON.stringify(legacy);
  assert.equal(plan(legacy).kind, "exact-time");
  assert.equal(JSON.stringify(legacy), backup);
  for (const kind of [
    "week",
    "month",
    "someday",
    "unscheduled",
    "day",
    "exact-time",
  ]) {
    applyPlan(legacy, { kind, value: "2026-11-04" }, "10:30");
    assert.equal(plan(legacy).kind, kind);
    assert.equal(legacy.project, "b");
    assert.equal(legacy.done, true);
    assert.equal(legacy.repeat, "Weekly");
  }
  assert.equal(plan(JSON.parse(backup)).kind, "exact-time");
  assert.equal(offset("2026-03-28", 2), "2026-03-30");
  assert.equal(week("2026-01-01", 1), "2025-12-29");
  const cols = columns("Overview", "2026-11-04", 1);
  assert.equal(bucket({ date: "2026-11-04" }, cols), 0);
  assert.equal(bucket({ date: "2026-11-05" }, cols), 1);
  assert.deepEqual(
    lanes([
      { at: 60, until: 120 },
      { at: 90, until: 110 },
      { at: 120, until: 140 },
    ]).map((x) => [x.lane, x.width]),
    [
      [0, 2],
      [1, 2],
      [0, 1],
    ],
  );
}
