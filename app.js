import {
  renderEntityWorkspace,
  openComposer,
  openProjectEditor,
  openProjectPicker,
  workspace,
  plan,
  applyPlan,
  backupLegacy,
  renderFocus,
  searchTasks,
  renderSidebar,
  renderRpg,
} from "/shell.js";
const $ = (s) => document.querySelector(s);
const safe = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const id = () => crypto.randomUUID();
function day(d = new Date()) {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}
const now = day();
const defaults = {
  projects: [],
  tasks: [],
  habits: [],
  receipts: {},
  diary: {},
  shop: [],
  profile: "Explorer",
  theme: "Light",
  skills: ["Gym"],
  timer: { mode: "Focus", left: 1500 },
  spent: 0,
};
let state = JSON.parse(localStorage.getItem("lifeos") || "null") || defaults;
const gymURL = window.lifeosHosted
  ? location.origin + "/gym/"
  : "http://127.0.0.1:5173/";
let view =
    location.pathname === "/design-system" ? "Design system" : "Overview",
  date = now,
  plannerPrefs = {
    date: now,
    anchor: now,
    mode: "Overview",
    days: 1,
    hour: 8,
    ...JSON.parse(localStorage.getItem("lifeos:planner-prefs") || "{}"),
  };
const project = (k) => state.projects.find((p) => p.id === k);
const image = (p) =>
  p?.image ? '<img class="thumb" alt="" src="' + safe(p.image) + '">' : "";
const earned = () => Object.values(state.receipts);
const total = (field, skill) =>
  earned()
    .filter((r) => !skill || r.skill === skill)
    .reduce((n, r) => n + r[field], 0);
function save(refresh = render) {
  try {
    localStorage.setItem("lifeos", JSON.stringify(state));
    syncBlocks();
    if (window.lifeosHosted) queueCloud();
    if (state.mcp && !window.lifeosHosted)
      sharePlanner(true).catch(console.error);
  } catch {
    alert("Storage is full. The last edit could not be saved.");
    state = JSON.parse(localStorage.getItem("lifeos")) || defaults;
  }
  refresh();
}
function button(t, a, k = "", extra = "") {
  return (
    '<button data-act="' +
    a +
    '" data-key="' +
    safe(k) +
    '" ' +
    extra +
    ">" +
    t +
    "</button>"
  );
}
function field(n, label, type, value = "", extra = "") {
  return (
    "<label>" +
    label +
    '<input name="' +
    n +
    '" type="' +
    type +
    '" value="' +
    safe(value) +
    '" ' +
    extra +
    "></label>"
  );
}
function area(n, label, value = "") {
  return (
    "<label>" +
    label +
    '<textarea name="' +
    n +
    '">' +
    safe(value) +
    "</textarea></label>"
  );
}
function select(n, label, opts, value) {
  return (
    "<label>" +
    label +
    '<select aria-label="' +
    safe(label) +
    '" name="' +
    n +
    '">' +
    opts
      .map(
        ([v, t]) =>
          '<option value="' +
          safe(v) +
          '" ' +
          (v === value ? "selected" : "") +
          ">" +
          safe(t) +
          "</option>",
      )
      .join("") +
    "</select></label>"
  );
}
function dialog(title, html, submit) {
  $("#form").innerHTML =
    "<h2>" +
    title +
    "</h2>" +
    html +
    '<div class="bar"><button type="button" data-act="switchTheme">◐ Theme</button><button type="button" data-act="close">Cancel</button><button>Save</button></div>';
  $("#form").onsubmit = async (e) => {
    e.preventDefault();
    try {
      await submit(Object.fromEntries(new FormData(e.target)));
      $("#modal").close();
      save();
    } catch (err) {
      alert(err.message);
    }
  };
  $("#modal").setAttribute("aria-labelledby", "editor-title");
  $("#form h2").id = "editor-title";
  $("#modal").showModal();
}
async function picture(file) {
  if (!file?.size) return "";
  if (
    file.size > 5000000 ||
    !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)
  )
    throw Error("Choose a PNG, JPEG, WebP, or GIF under 5 MB");
  const bm = await createImageBitmap(file);
  const c = document.createElement("canvas");
  const scale = Math.min(1, 180 / Math.max(bm.width, bm.height));
  c.width = Math.max(1, Math.round(bm.width * scale));
  c.height = Math.max(1, Math.round(bm.height * scale));
  c.getContext("2d").drawImage(bm, 0, 0, c.width, c.height);
  bm.close();
  return c.toDataURL("image/png");
}
function projectFolders() {
  return [...new Set(state.projects.map((p) => p.folder).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({
      name,
      art: Object.hasOwn(state.folderArt || {}, name)
        ? state.folderArt[name]
        : null,
    }));
}
function updateProject(project, changes) {
  Object.assign(project, changes);
  if (project.skill && !state.skills.includes(project.skill))
    state.skills.push(project.skill);
  save();
}
function projectForm(p) {
  openProjectEditor({
    initial: p || {
      name: "",
      folder: "",
      color: "#74669e",
      stage: "Inbox",
      skill: "",
      image: "",
    },
    folders: projectFolders(),
    skills: state.skills,
    read: picture,
    save(draft) {
      const next = p || { id: id() };
      if (!p) state.projects.push(next);
      view = next.id;
      updateProject(next, draft);
    },
  });
}
const priorities = ["None", "Low", "Medium", "High", "Goal"];
function projectChoices() {
  return state.projects.map((p) => ({
    ...p,
    uses: state.tasks.filter((t) => t.project === p.id).length,
  }));
}
function assignProject(t, anchor) {
  openProjectPicker({
    anchor,
    projects: projectChoices(),
    selected: t.project,
    choose(id) {
      t.project = id;
      if (project(id)) project(id).lastUsed = Date.now();
      save();
    },
  });
}
function taskForm(t, trigger, period, focusChild) {
  const anchor =
    trigger ||
    document.querySelector('[data-act="add"]') ||
    document.querySelector("main header");
  const initial = {
    title: t?.title || "",
    childRows: t?.children || [],
    link: t?.link || "",
    lockOverride: t?.lockOverride,
    project: t?.project ?? project(view)?.id ?? "",
    date:
      t?.date ??
      (period
        ? period.kind === "day"
          ? period.value
          : ""
        : ["Planner", "Upcoming", "Inbox"].includes(view) || project(view)
          ? ""
          : date),
    period: t?.period || period || null,
    deadline: t?.deadline || "",
    time: t?.time || "",
    minutes: t?.minutes || state.config?.task || 30,
    priority: t?.priority || "None",
    repeat: t?.repeat || "None",
    scope: "one",
    notes: t?.notes || "",
    tags: t?.tags || "",
    location: t?.location || "",
    children: t?.children.map((s) => s.title).join("\n") || "",
    completed: !!t?.done,
    trashed: !!t?.trashed,
    file: t?.file,
  };
  openComposer({
    anchor,
    projects: projectChoices(),
    editing: !!t,
    canLock: !!state.config?.lockCalendar,
    taskId: t?.id,
    onDuplicate() {
      if (!t) return;
      const copy = structuredClone(t);
      Object.assign(copy, {
        id: id(),
        done: false,
        trashed: false,
        locked: false,
        title: t.title + " (copy)",
      });
      delete copy.previous;
      delete copy.series;
      copy.children = copy.children.map((c) => ({
        ...c,
        id: id(),
        done: false,
      }));
      state.tasks.push(copy);
      save(tick);
    },
    initial,
    focusChild,
    weekStart: plannerPrefs.weekStart,
    advance: advanceDate,
    onRefresh: t ? render : undefined,
    onTrash() {
      if (t) {
        t.trashed = !t.trashed;
        save();
      }
    },
    async onCommit(f) {
      if (!f.title.trim()) throw Error("Enter a task title");
      if (f.time && !f.date) throw Error("Choose a date for this time");
      if (!Number.isFinite(+f.minutes) || +f.minutes < 1)
        throw Error("Enter a positive duration");
      let file = f.removeFile ? null : t?.file;
      if (f.attachment?.size) {
        if (f.attachment.size > 1000000)
          throw Error("Choose a file under 1 MB");
        file = { name: f.attachment.name, data: await readFile(f.attachment) };
      }
      const {
        attachment,
        removeFile,
        trashed,
        completed,
        period: periodToKeep,
        childRows,
        ...fields
      } = f;
      const next = {
        ...fields,
        title: f.title.trim(),
        minutes: String(f.minutes),
        file,
        id: t?.id || id(),
        done: t?.done || false,
        children:
          (t && childRows) ||
          f.children
            .split("\n")
            .map((x) => x.trim())
            .filter(Boolean)
            .map((title) => ({
              title,
              done: t?.children.find((x) => x.title === title)?.done || false,
            })),
      };

      if (
        !next.date &&
        ["week", "month", "someday"].includes(periodToKeep?.kind)
      )
        applyPlan(next, periodToKeep);
      if (t) {
        if (next.date || !next.period) delete t.period;
        if (f.scope === "series") editFollowing(t, next);
        if (t.project !== next.project && project(next.project))
          project(next.project).lastUsed = Date.now();
        Object.assign(t, next);
        if (t.done !== Boolean(completed)) {
          complete(t, tick);
          return;
        }
      } else state.tasks.push(next);
      save(t ? tick : render);
    },
  });
}
function complete(t, refresh = render) {
  t.done = !t.done;
  if (t.done)
    state.receipts[t.id] = {
      title: t.title,
      kind: "Task",
      at: new Date().toISOString(),
      skill: project(t.project)?.skill || "",
      xp: state.config?.xp ?? 25,
      coins: state.config?.coins ?? 4,
    };
  else delete state.receipts[t.id];
  if (t.done) {
    repeatAfter(t);
    feedback();
  }
  save(refresh);
}
function row(t) {
  const p = project(t.project);
  return (
    '<div data-priority="' +
    safe(t.priority) +
    '" class="row ' +
    (t.priority === "Goal" ? "goal" : "") +
    '" draggable="true" data-task="' +
    t.id +
    '"><input aria-label="Complete ' +
    safe(t.title) +
    '" type="checkbox" data-act="complete" data-key="' +
    t.id +
    '" ' +
    (t.done ? "checked" : "") +
    '><div class="grow">' +
    button(safe(t.title), "edit", t.id) +
    '<div class="pill">' +
    button(
      image(p) || safe(p?.art?.kind === "emoji" ? p.art.value : "◈"),
      "assign",
      t.id,
      'class="ws-project-chip" title="' +
        safe(p?.name || "Personal") +
        '" aria-label="Assign project"',
    ) +
    " · " +
    safe(t.priority) +
    " · " +
    t.minutes +
    "m" +
    (t.children.length
      ? " · " +
        t.children.filter((s) => s.done).length +
        "/" +
        t.children.length +
        " subtasks"
      : "") +
    "</div>" +
    (t.children.length
      ? '<details class="legacy-subtree" open><summary>Subtasks</summary>'
      : "") +
    t.children
      .map(
        (s, i) =>
          '<label><span><input type="checkbox" data-act="sub" data-key="' +
          t.id +
          '" data-i="' +
          i +
          '" ' +
          (s.done ? "checked" : "") +
          "> " +
          safe(s.title) +
          "</span></label>" +
          button(
            "↳ " + safe(t.title),
            "edit",
            t.id,
            'class="legacy-parent-ref"',
          ),
      )
      .join("") +
    (t.children.length ? "</details>" : "") +
    "</div></div>"
  );
}
function agenda() {
  let p = project(view);
  let tasks = state.tasks
    .filter(inList)
    .filter((t) =>
      listFilters.includes(view) || view === "Completed tasks"
        ? true
        : p
          ? t.project === p.id
          : view === "Tasks"
            ? true
            : view === "Inbox"
              ? !t.date
              : t.date === date,
    );
  return (
    '<div class="card"><div class="bar"><h2>' +
    safe(p?.name || "Agenda") +
    "</h2>" +
    (["Done", "Completed tasks"].includes(view)
      ? ""
      : button("＋ Add task", "add")) +
    "</div>" +
    (p
      ? image(p) +
        safe(p.stage || "In progress") +
        " · " +
        safe(p.skill) +
        " " +
        button("Edit project", "project", p.id)
      : "") +
    (["Done", "Completed tasks"].includes(view) ? [true] : [false])
      .map((done) => {
        let group = tasks.filter((t) => t.done === done);
        return (
          "<h4>" +
          (done ? "DONE" : "TO-DOS") +
          " · " +
          group.length +
          " / " +
          group.reduce((n, t) => n + Number(t.minutes), 0) +
          " MIN</h4>" +
          group.map(row).join("")
        );
      })
      .join("") +
    (!tasks.length
      ? ["Done", "Completed tasks"].includes(view)
        ? "<p>Completed tasks will appear here.</p>"
        : "<p>Capture a task and give it a place in your day.</p>"
      : "") +
    "</div>"
  );
}
function meter(label, xp, limit) {
  const value = xp % limit;
  return (
    '<xp-meter data-label="' +
    safe(label) +
    '" data-total="' +
    xp +
    '" data-value="' +
    value +
    '" data-max="' +
    limit +
    '"></xp-meter><div class="meter-scale"><span>' +
    value +
    " / " +
    limit +
    " XP</span><span>Next level</span></div>"
  );
}
function skills() {
  const limit = state.config?.threshold || 100;
  return state.skills
    .map((s) => {
      const xp = total("xp", s);
      return (
        '<div class="skill-meter"><div class="meter-head">' +
        button(safe(s), "nav", "Skill / " + s) +
        "<span>Lv " +
        (1 + Math.floor(xp / limit)) +
        "</span></div>" +
        meter(s, xp, limit) +
        "</div>"
      );
    })
    .join("");
}
function summary() {
  const limit = state.config?.threshold || 100,
    xp = total("xp"),
    hp = Math.max(
      0,
      100 - (state.battles || []).reduce((n, b) => n + b.log.length, 0),
    );
  return (
    '<section class="summary"><div class="card character"><h4>Character</h4><h2>' +
    button(
      image({ image: state.config?.portrait }) + safe(state.profile),
      "nav",
      "Profile",
    ) +
    "</h2>" +
    (state.config?.objective
      ? "<p>" + safe(state.config.objective) + "</p>"
      : "") +
    '<div class="meter-head"><strong>Level ' +
    (1 + Math.floor(xp / limit)) +
    "</strong><span>" +
    xp +
    " total XP</span></div>" +
    meter("Character progress", xp, limit) +
    '<div class="vitals"><span>' +
    (total("coins") - state.spent) +
    " coins</span><span>" +
    hp +
    ' / 100 HP</span></div></div><div class="card"><h2>Skills</h2>' +
    skills() +
    '</div><div class="card"><h2>Daily check-in</h2>' +
    button(
      state.diary[now] ? "Read today’s entry" : "Write a reflection",
      "nav",
      "Diary",
    ) +
    "</div></section>"
  );
}
function habits() {
  return (
    button("＋ New habit", "habit") +
    state.habits
      .map(
        (h) =>
          '<div class="card"><h2>' +
          safe(h.title) +
          "</h2>" +
          safe(h.skill) +
          " · " +
          streak(h) +
          " day streak · 10 XP · 2 coins " +
          button(
            state.receipts[h.id + now] ? "Undo check-in" : "Check in",
            "check",
            h.id,
          ) +
          "</div>",
      )
      .join("")
  );
}
let previousView;
const viewFromUrl = () => {
  try {
    return decodeURIComponent(location.hash.slice(1));
  } catch {
    return "";
  }
};
if (viewFromUrl()) view = viewFromUrl();
window.addEventListener("popstate", () => {
  view = viewFromUrl() || "Overview";
  previousView = view;
  render();
});
function entityContext() {
  const limit = state.config?.threshold || 100;
  return {
    limit,
    readPicture: picture,
    skills: state.skills.map((name) => ({
      name,
      xp: total("xp", name),
      art: state.skillArt?.[name],
    })),
    habits: state.habits.map((h) => ({
      ...h,
      streak: streak(h),
      checked: !!state.receipts[h.id + now],
      checkedOn: (date) => Boolean(state.receipts[h.id + date]),
    })),
    battles: (state.battles || []).map((h) => ({
      ...h,
      status:
        h.daily?.[now] ||
        ((h.log || []).some((v) => day(new Date(v)) === now) ? "occurred" : ""),
    })),
    skillArt(name, art) {
      (state.skillArt ||= {})[name] = art;
      save();
    },
    skillRename(from, to) {
      if (
        state.skills.some(
          (name) => name.toLowerCase() === to.toLowerCase() && name !== from,
        )
      )
        throw Error("A skill with this name exists");
      state.skills = state.skills.map((name) => (name === from ? to : name));
      if ((state.gymSkill || "Gym") === from) state.gymSkill = to;
      if (state.skillArt && Object.hasOwn(state.skillArt, from)) {
        Object.defineProperty(state.skillArt, to, {
          value: state.skillArt[from],
          enumerable: true,
          writable: true,
          configurable: true,
        });
        delete state.skillArt[from];
      }
      for (const item of [
        ...state.projects,
        ...state.habits,
        ...Object.values(state.receipts),
      ])
        if (item.skill === from) item.skill = to;
      save();
    },
    habitPatch(h, patch) {
      const target = [...state.habits, ...(state.battles || [])].find(
        (x) => x.id === h.id,
      );
      if (target) {
        Object.assign(target, patch);
        save();
      }
    },
    battleStatus(h, outcome) {
      const target = state.battles.find((x) => x.id === h.id);
      if (!target) return;
      const daily = (target.daily ||= {});
      // Keep legacy lapse history. Only replace the timestamp created by this editor.
      const entries = (target.dailyLog ||= {});
      if (entries[now])
        target.log = target.log.filter((x) => x !== entries[now]);
      delete entries[now];
      if (outcome) {
        daily[now] = outcome;
        if (
          outcome === "occurred" &&
          !target.log.some((v) => day(new Date(v)) === now)
        ) {
          const at = new Date().toISOString();
          entries[now] = at;
          target.log.push(at);
        }
      } else delete daily[now];
      save();
    },
  };
}
const playground = {
  name: "Trailkeeper",
  xp: 85,
  coins: 24,
  hp: 98,
  limit: 100,
  objective: "Finish the trail journal",
  skills: [
    { name: "Exploration", xp: 85 },
    { name: "Training", xp: 30 },
  ],
  habits: [{ id: "demo", title: "Walk outside", checked: false }],
  battles: [{ id: "demo-b", name: "Late scrolling" }],
  events: [],
};
function homeData(ctx) {
  const habitsByKey = new Map(state.habits.map((h) => [h.id + now, h]));
  const events = Object.entries(state.receipts).map(([id, r]) => ({
    ...r,
    id,
    at: r.at || r.date,
    kind:
      r.kind ||
      (id.startsWith("gym:")
        ? "Workout"
        : habitsByKey.has(id)
          ? "Growth"
          : "Reward"),
    route: id.startsWith("gym:") ? "openGym" : undefined,
  }));
  for (const r of state.rewardHistory || [])
    events.push({
      ...r,
      id: "spent:" + r.id,
      coins: 0,
      kind: "Redeemed · " + r.coins + " coins",
      route: "Market",
    });
  for (const b of state.battles || [])
    for (const [date, outcome] of Object.entries(b.daily || {}))
      events.push({
        id: "battle:" + b.id + date,
        title: b.name,
        at: date,
        kind: outcome === "avoided" ? "Battle · Avoided" : "Battle · Occurred",
        route: "Battle",
      });
  for (const date of Object.keys(state.diary))
    events.push({
      id: "diary:" + date,
      title: "Reflection saved",
      at: date,
      kind: "Journal",
      route: "Diary",
    });
  return {
    ...ctx,
    name: state.profile,
    avatar:
      state.config?.avatarArt ||
      (state.config?.portrait
        ? { kind: "image", value: state.config.portrait }
        : null),
    xp: total("xp"),
    coins: total("coins") - state.spent,
    hp: Math.max(
      0,
      100 - (state.battles || []).reduce((n, b) => n + (b.log?.length || 0), 0),
    ),
    objective: state.config?.objective,
    events: events
      .sort((a, b) => (Date.parse(b.at) || 0) - (Date.parse(a.at) || 0))
      .slice(0, 16),
  };
}
function home() {
  const screen = $("#screen"),
    demo = view === "Dashboard playground",
    ctx = entityContext();
  if (!screen.querySelector("#rpg-root"))
    screen.innerHTML =
      '<div class="hero rpg-hero"><small>PERSONAL WORKSPACE</small><h1></h1></div><div id="rpg-root"></div>';
  screen.querySelector("h1").textContent = demo
    ? "Dashboard playground"
    : "Overview";
  const go = (target, icon) => {
    if (demo) return;
    if (target === "Focus") {
      const btn = document.querySelector("#timer button");
      btn?.focus();
      return;
    }
    view =
      target === "habits" ? (icon === "Battle" ? "Battle" : "Habits") : target;
    render();
    if (icon === "Battle")
      requestAnimationFrame(() =>
        Array.from(document.querySelectorAll("#entity-workspace h2"))
          .find((e) => e.textContent === "Battle")
          ?.scrollIntoView({ block: "nearest" }),
      );
  };
  const act = demo
    ? {
        go,
        read: picture,
        name(name) {
          playground.name = name;
          home();
        },
        avatar(avatar) {
          playground.avatar = avatar;
          home();
        },
        check() {
          const h = playground.habits[0];
          h.checked = !h.checked;
          playground.xp += h.checked ? 15 : -15;
          playground.coins += h.checked ? 2 : -2;
          playground.events = h.checked
            ? [
                {
                  id: "demo-event",
                  title: h.title,
                  kind: "Growth",
                  xp: 15,
                  coins: 2,
                  at: new Date().toISOString(),
                },
              ]
            : [];
          home();
        },
        battle(h, status) {
          h.status = status;
          home();
        },
      }
    : {
        go,
        read: picture,
        name(name) {
          state.profile = name;
          save();
        },
        avatar(art) {
          const config = (state.config ||= {});
          config.avatarArt = art;
          config.portrait = art?.kind === "image" ? art.value : "";
          save();
        },
        check(id) {
          checkGrowth(id);
        },
        battle: ctx.battleStatus,
      };
  renderRpg($("#rpg-root"), demo ? { ...playground } : homeData(ctx), act);
  tick();
}
function checkGrowth(id) {
  const h = state.habits.find((h) => h.id === id);
  if (!h) return;
  const key = id + now;
  if (state.receipts[key]) delete state.receipts[key];
  else {
    state.receipts[key] = {
      title: h.title,
      skill: h.skill,
      kind: "Growth",
      at: new Date().toISOString(),
      xp: 10,
      coins: 2,
    };
    feedback();
  }
  save();
}
function render() {
  if (view !== previousView) {
    if (previousView && viewFromUrl() !== view)
      history.pushState(null, "", "#" + encodeURIComponent(view));
    previousView = view;
  }
  document.documentElement.classList.toggle("black", state.theme === "Black");
  renderSidebar({
    view,
    projects: state.projects,
    count: state.tasks.filter(
      (t) => plan(t).kind === "unscheduled" && !t.done && !t.trashed,
    ).length,
    theme: state.theme,
    onTheme: toggleTheme,
    onProject: () => projectForm(),
    folders: state.folderArt,
    folderChange(folder, { name, art }) {
      const artwork = (state.folderArt ||= Object.create(null));
      if (name !== undefined && name !== folder) {
        if (name && state.projects.some((p) => p.folder === name))
          throw Error("A folder with this name already exists");
        for (const p of state.projects)
          if (p.folder === folder) p.folder = name;
        if (name && Object.hasOwn(artwork, folder))
          Object.defineProperty(artwork, name, {
            value: artwork[folder],
            writable: true,
            configurable: true,
            enumerable: true,
          });
        delete artwork[folder];
      } else if (art !== undefined)
        Object.defineProperty(artwork, folder, {
          value: art,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      save();
    },
    projectChange: (p, changes) => {
      Object.assign(p, changes);
      save();
    },
    readPicture: picture,
    lists: listFilters,
  });
  document.documentElement.dataset.effects = state.config?.effect || "on";
  if (["Overview", "Dashboard playground"].includes(view)) {
    home();
    return;
  }
  if (["Skills", "Habits", "Battle"].includes(view)) {
    const screen = $("#screen");
    if (!screen.querySelector("#entity-workspace"))
      screen.innerHTML =
        '<div class="hero"><h1></h1></div><div id="entity-workspace"></div>';
    screen.querySelector("h1").textContent =
      view === "Battle" ? "Habits" : view;
    renderEntityWorkspace($("#entity-workspace"), view, entityContext());
    tick();
    return;
  }
  const specialized =
    ["Planner", "Upcoming", "Inbox"].includes(view) || !!project(view);
  const screen = $("#screen");
  if (specialized) {
    if (!screen.querySelector("#workspace"))
      screen.innerHTML =
        '<div class="hero ws-hero"><h1></h1></div><div id="workspace"></div>';
    screen.querySelector("h1").textContent = project(view)?.name || view;
    workspace($("#workspace"), {
      view,
      prefs: plannerPrefs,
      tasks: state.tasks,
      projects: state.projects,
      events: visibleEvents(),
      edit(t, anchor, period) {
        taskForm(t?.parent || t, anchor, period, t?.parent ? t.title : null);
      },
      childComplete(child) {
        child.record.done = !child.record.done;
        save();
      },
      childPatch(child, changes) {
        Object.assign(child.record, changes);
        save();
      },
      childMove(child, period, time) {
        if (period.kind === "exact-time") child.record.minutes ||= 15;
        applyPlan(child.record, period, time);
        save();
      },
      assign: assignProject,
      complete,
      projectChange: updateProject,
      folders: projectFolders(),
      readPicture: picture,
      skills: state.skills,
      pref(changes) {
        Object.assign(plannerPrefs, changes);
        if ((changes.date || changes.days) && Object.keys(overlayPrefs).length)
          void refreshOverlays();
        localStorage.setItem(
          "lifeos:planner-prefs",
          JSON.stringify(plannerPrefs),
        );
        render();
      },
      quick(title, period, projectId) {
        const t = {
          id: id(),
          title,
          project: projectId || "",
          priority: "None",
          minutes: String(state.config?.task || 30),
          repeat: "None",
          done: false,
          children: [],
        };
        applyPlan(t, period);
        state.tasks.push(t);
        save();
      },
      patch(t, changes) {
        Object.assign(t, changes);
        save();
      },
      move(t, period, time) {
        const before = plan(t),
          previousTime = t.time;
        applyPlan(t, period, time);
        save();
        document.getElementById("plan-undo")?.remove();
        const undo = document.createElement("button");
        undo.id = "plan-undo";
        undo.textContent = "Task moved · Undo";
        undo.onclick = () => {
          const record = state.tasks.find((x) => x.id === t.id);
          if (record) {
            applyPlan(record, before, previousTime);
            save();
          }
          undo.remove();
        };
        document.body.append(undo);
        setTimeout(() => undo.remove(), 6000);
      },
      schedule(t) {
        view = "Planner";
        plannerPrefs.date = t.date || now;
        render();
        taskForm(t, document.querySelector(".ws-hero"));
      },
      calendars() {
        view = "Calendar accounts";
        render();
        document.querySelector("[data-act=google]")?.click();
      },
    });
    tick();
    return;
  }
  let body =
    view === "Design system"
      ? "<lifeos-showcase></lifeos-showcase>"
      : view === "Calendar accounts"
        ? googleSettings() + button("Back to Planner", "nav", "Planner")
        : extendedPage();
  if (body !== null) {
  } else if (view === "openGym")
    body =
      '<p><a target="_blank" rel="noopener" href="' +
      safe(gymURL) +
      '">Open standalone openGym</a></p><iframe title="Native openGym" src="' +
      safe(gymURL) +
      '" style="width:100%;height:78vh;border:0"></iframe>';
  else if (view === "Diary")
    body =
      area("entry", "Today’s reflection", state.diary[now]) +
      button("Save entry", "diary") +
      field("diaryFilter", "Search saved entries", "search", "") +
      Object.entries(state.diary)
        .reverse()
        .map(
          ([d, v]) =>
            '<article data-entry class="card"><small>' +
            d +
            "</small><p>" +
            safe(v) +
            "</p></article>",
        )
        .join("");
  else if (view === "Settings")
    body =
      button("Edit profile", "profile") +
      '<p><a href="/design-system">UI showcase</a> · <a href="/#Dashboard%20playground">RPG playground</a></p>' +
      settingsPlus() +
      googleSettings() +
      availabilityPanel() +
      mcpPanel();
  else if (view === "Vault")
    body =
      '<div class="card"><h2>' +
      (total("coins") - state.spent) +
      " coins available</h2><p>" +
      total("coins") +
      " earned · " +
      state.spent +
      " spent</p>" +
      button("Open Marketplace", "nav", "Market") +
      button("Activity journal", "nav", "Journal") +
      (state.rewardHistory || [])
        .slice()
        .reverse()
        .map(
          (r) => "<p>" + safe(r.title) + " · " + safe(r.coins) + " coins</p>",
        )
        .join("") +
      "</div>";
  else if (view === "Market")
    body =
      button("Create reward", "reward") +
      state.shop
        .map(
          (r) =>
            "<p>" +
            safe(r.title) +
            " " +
            button("Redeem · " + r.cost + " coins", "redeem", r.id) +
            "</p>",
        )
        .join("");
  else
    body =
      view === "Overview"
        ? '<div class="grid desk"><div class="agenda-stack">' +
          agenda() +
          "</div><div>" +
          summary() +
          button("Open Planner", "nav", "Planner") +
          "</div>" +
          '</div><section class="review-grid"><div>' +
          fitnessSummary() +
          '</div><div class="card"><h2>Habits</h2>' +
          habits() +
          "</div></section>" +
          contentHub()
        : agenda();
  if (view === "Design system" && $("#screen lifeos-showcase")) {
    tick();
    return;
  }
  $("#screen").innerHTML =
    '<div class="hero"><small>' +
    new Date(date + "T12:00")
      .toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
      .toUpperCase() +
    "</small><h1>" +
    safe(project(view)?.name || view) +
    "</h1></div>" +
    body;
  tick();
}
document.addEventListener("click", (e) => {
  let b = e.target.closest("[data-act]");
  if (!b) return;
  let k = b.dataset.key,
    t = state.tasks.find((x) => x.id === k);
  switch (b.dataset.act) {
    case "nav":
      view = k;
      if (k === "Today") {
        date = now;
      }
      render();
      break;
    case "close":
      $("#modal").close();
      break;
    case "project":
      projectForm(project(k));
      break;
    case "edit":
      taskForm(t, b);
      break;
    case "add":
      taskForm(undefined, b);
      break;
    case "complete":
      complete(t);
      break;
    case "sub":
      t.children[b.dataset.i].done = b.checked;
      save();
      break;
    case "diary":
      state.diary[now] = $("[name=entry]").value;
      save();
      break;
    case "profile":
      dialog(
        "Profile",
        field("name", "Display name", "text", state.profile, "required"),
        (f) => (state.profile = f.name),
      );
      break;
    case "habit":
      dialog(
        "Create habit",
        field("title", "Habit", "text", "", "required") +
          select(
            "skill",
            "Skill",
            state.skills.map((s) => [s, s]),
          ),
        (f) => state.habits.push({ ...f, id: id(), createdOn: now }),
      );
      break;
    case "check":
      checkGrowth(k);
      break;
    case "reward":
      dialog(
        "Personal reward",
        field("title", "Reward", "text", "", "required") +
          field("cost", "Coin price", "number", 10, 'min="1" required'),
        (f) => state.shop.push({ ...f, id: id() }),
      );
      break;
    case "redeem": {
      let r = state.shop.find((r) => r.id === k);
      if (total("coins") - state.spent >= r.cost) {
        state.spent += Number(r.cost);
        (state.rewardHistory ||= []).push({
          id: id(),
          title: r.title,
          coins: Number(r.cost),
          at: new Date().toISOString(),
        });
        save();
      } else alert("Earn more coins to redeem this reward.");
      break;
    }
  }
});
function toggleTheme() {
  state.theme = state.theme === "Light" ? "Black" : "Light";
  save();
}

const defaultFocusMinutes = { Focus: 25, Break: 5, "Long break": 15 };
function focusMinutes(mode) {
  return (
    Number(state.config?.durations?.[mode]) || defaultFocusMinutes[mode] || 25
  );
}
function remaining(t) {
  return t.end
    ? Math.max(0, Math.ceil((t.end - Date.now()) / 1000))
    : Math.max(0, t.left);
}
function timerAction(action, value) {
  const timer = state.timer;
  const seconds = remaining(timer);
  if (action === "toggle") {
    if (timer.end && seconds > 0) {
      timer.end = null;
      timer.left = seconds;
    } else {
      timer.left = seconds || focusMinutes(timer.mode) * 60;
      timer.end = Date.now() + timer.left * 1000;
    }
  } else if (action === "link") {
    timer.task = value;
  } else {
    if (action === "mode") timer.mode = value;
    if (action === "duration") {
      state.config ??= {};
      state.config.durations = {
        ...state.config.durations,
        [timer.mode]: value,
      };
    }
    timer.left = focusMinutes(timer.mode) * 60;
    timer.end = null;
  }
  save(tick);
}
function tick() {
  if (state.timer.end && remaining(state.timer) === 0) {
    state.timer.end = null;
    state.timer.left = 0;
    const message = state.timer.mode + " complete";
    let notice = document.getElementById("timer-notice");
    if (!notice) {
      notice = document.createElement("div");
      notice.id = "timer-notice";
      notice.setAttribute("role", "status");
      document.body.append(notice);
    }
    notice.textContent = message;
    setTimeout(() => notice.remove(), 6500);
    if (window.Notification?.permission === "granted")
      new Notification(message);
    save(tick);
    return;
  }
  renderFocus({
    timer: state.timer,
    remaining: remaining(state.timer),
    minutes: focusMinutes(state.timer.mode),
    tasks: state.tasks,
    act: timerAction,
  });
}
window.addEventListener("focus", tick);
window.addEventListener("pageshow", tick);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) tick();
});
document.addEventListener("keydown", (e) => {
  if (
    e.key.toLowerCase() === "c" &&
    !e.ctrlKey &&
    !e.metaKey &&
    !document.querySelector('[role="dialog"][data-state="open"]') &&
    !$("#modal").open &&
    !e.target.matches("input,textarea,select")
  ) {
    e.preventDefault();
    taskForm();
  }
});
let overlays = {};
let overlayPrefs = JSON.parse(localStorage.getItem("lifeos:calendars") || "{}");

function fitnessSummary() {
  const latest = Object.entries(state.receipts)
    .filter(([k]) => k.startsWith("gym:"))
    .map(([, v]) => v)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
  return (
    '<div class="card"><h2>Training</h2><p>' +
    safe(latest?.title || "Open your workout plan") +
    "</p>" +
    button("Open training", "nav", "openGym") +
    "</div>"
  );
}
window.addEventListener("message", (event) => {
  if (
    window.lifeosHosted ||
    event.origin !== new URL(gymURL).origin ||
    event.source !== document.querySelector("iframe")?.contentWindow ||
    event.data?.type !== "lifeos-sessions" ||
    !Array.isArray(event.data.sessions)
  )
    return;
  const receipts = Object.fromEntries(
    Object.entries(state.receipts).filter(([k]) => !k.startsWith("gym:")),
  );
  for (const w of event.data.sessions)
    if (typeof w.id === "string")
      receipts["gym:" + w.id] = {
        title: w.name,
        date: w.date,
        skill: state.gymSkill || "Gym",
        xp: 25,
        coins: 4,
      };
  if (JSON.stringify(state.receipts) !== JSON.stringify(receipts)) {
    state.receipts = receipts;
    localStorage.setItem("lifeos", JSON.stringify(state));
    if (window.lifeosHosted) queueCloud();
  }
});

function googleSettings() {
  return (
    '<section class="card"><h2>Google Calendar</h2><a href="/google/connect">Connect account</a> ' +
    button("Load calendars", "google") +
    ' <a href="/google/connect?write">Authorize time blocking</a> ' +
    button("Time blocking", "lockSettings") +
    '<p id="syncState"></p>' +
    '<div id="accounts"></div></section>'
  );
}

function visibleEvents() {
  return Object.entries(overlays).flatMap(([calendar, events]) =>
    events
      .filter(
        (e) => !e.lifeosId || !state.tasks.some((t) => t.id === e.lifeosId),
      )
      .map((e) => ({
        ...e,
        uid: calendar + ":" + e.id,
        color: overlayPrefs[calendar]?.color,
      })),
  );
}
document.addEventListener("click", async (e) => {
  if (e.target.dataset.act !== "google") return;
  const box = $("#accounts");
  try {
    const data = await (await fetch("/google/calendars")).json();
    if (!data.connected) {
      box.textContent = data.error || "Connect a Google account first.";
      return;
    }
    box.innerHTML = data.list
      .map(
        (c) =>
          '<label><span><input type="checkbox" data-overlay="' +
          safe(c.id) +
          '" data-color="' +
          safe(c.color) +
          '" ' +
          (overlays[c.id] ? "checked" : "") +
          "> " +
          safe(c.name) +
          "</span></label>",
      )
      .join("");
  } catch {
    box.textContent = "Calendar service unavailable.";
  }
});
document.addEventListener("change", async (e) => {
  const key = e.target.dataset.overlay;
  if (!key) return;
  if (!e.target.checked) {
    delete overlays[key];
    delete overlayPrefs[key];
    localStorage.setItem("lifeos:calendars", JSON.stringify(overlayPrefs));
    return;
  }
  try {
    const data = await (await fetch(overlayURL(key))).json();
    if (!data.events) throw Error(data.error || "Reconnect your account");
    if (e.target.checked) {
      overlays[key] = data.events;
      overlayPrefs[key] = { color: e.target.dataset.color };
      localStorage.setItem("lifeos:calendars", JSON.stringify(overlayPrefs));
      if (view === "Planner") render();
    }
  } catch (err) {
    e.target.checked = false;
    alert(err.message);
  }
});

function advanceDate(ds, rule) {
  const d = new Date(ds + "T12:00");
  d.setDate(d.getDate() + (rule === "Weekly" ? 7 : 1));
  if (rule === "Weekdays")
    while ([0, 6].includes(d.getDay())) d.setDate(d.getDate() + 1);
  if (rule === "Monthly") {
    const original = new Date(ds + "T12:00");
    const end = new Date(original.getFullYear(), original.getMonth() + 2, 0);
    end.setDate(Math.min(original.getDate(), end.getDate()));
    return day(end);
  }
  return day(d);
}
function editFollowing(t, next) {
  for (const later of state.tasks.filter(
    (x) =>
      x.id !== t.id &&
      !x.done &&
      (x.series || x.id) === (t.series || t.id) &&
      x.date >= t.date,
  )) {
    for (const k of [
      "title",
      "repeat",
      "time",
      "project",
      "notes",
      "minutes",
      "priority",
    ])
      later[k] = next[k];
  }
}
function repeatAfter(t) {
  if (!t.repeat || t.repeat === "None" || !t.date) return;
  const next = advanceDate(t.date, t.repeat);
  if (state.tasks.some((x) => x.previous === t.id)) return;
  state.tasks.push({
    ...t,
    id: id(),
    previous: t.id,
    series: t.series || t.id,
    date: next,
    done: false,
    children: t.children.map((s) => ({ ...s, done: false })),
  });
}
function readFile(file) {
  return new Promise((resolve, reject) => {
    const f = new FileReader();
    f.onload = () => resolve(f.result);
    f.onerror = () => reject(Error("File could not be opened"));
    f.readAsDataURL(file);
  });
}
function contentHub() {
  return (
    '<section class="card hub"><h2>Progress</h2><div class="bar">' +
    [
      "Habits",
      "Battle",
      "Goals",
      "Projects",
      "Market",
      "Journal",
      "Profile",
      "Settings",
    ]
      .map((v) => button(safe(v), "nav", v))
      .join("") +
    "</div></section>"
  );
}
function extendedPage() {
  if (view.startsWith("Skill / ")) {
    const skill = view.slice(8);
    return (
      "<h2>Projects</h2>" +
      state.projects
        .filter((p) => p.skill === skill)
        .map((p) => button(image(p) + safe(p.name), "nav", p.id))
        .join("") +
      "<h2>Activity</h2>" +
      earned()
        .filter((r) => r.skill === skill)
        .map((r) => "<p>" + safe(r.title) + " · " + r.xp + " XP</p>")
        .join("")
    );
  }
  if (view === "Projects")
    return (
      button("New project", "project", "") +
      state.projects
        .map(
          (p) =>
            '<div class="row">' +
            button(image(p) + safe(p.name), "nav", p.id) +
            " · " +
            safe(p.skill) +
            "</div>",
        )
        .join("")
    );
  if (view === "Journal")
    return (
      earned()
        .map(
          (r) =>
            '<div class="row">' +
            safe(r.title) +
            " · " +
            safe(r.skill) +
            " · " +
            r.xp +
            " XP</div>",
        )
        .join("") || "<p>No activity yet.</p>"
    );
  if (view === "Profile")
    return (
      summary() +
      ["objective", "strength", "growth"]
        .map(
          (k) =>
            "<p>" + safe(k) + " · " + safe(state.config?.[k] || "—") + "</p>",
        )
        .join("") +
      button("Edit identity", "identity")
    );
  if (view === "Goals")
    return (
      button("New objective", "newGoal") +
      (state.goals || [])
        .map(
          (g) =>
            '<div class="card">' +
            safe(g.name) +
            " " +
            button(g.done ? "Reopen" : "Complete", "goal", g.id) +
            "</div>",
        )
        .join("")
    );
  return null;
}
function settingsPlus() {
  return (
    '<section class="card"><h2>Preferences</h2><div class="bar">' +
    ["Identity", "Rewards", "Focus", "Rituals", "Sounds", "Calendar defaults"]
      .map((s) => button(s, "prefs", s))
      .join("") +
    "</div></section>"
  );
}
function prefs(k) {
  const cfg = (state.config ||= {});
  if (k === "Identity") {
    dialog(
      "Character profile",
      field("name", "Name", "text", state.profile, "required") +
        field("portrait", "Portrait", "file", "", 'accept="image/*"') +
        area("objective", "Objective", cfg.objective) +
        area("strength", "Strengths", cfg.strength) +
        area("growth", "Areas to develop", cfg.growth),
      async (f) => {
        state.profile = f.name;
        Object.assign(cfg, {
          portrait: (await picture(f.portrait)) || cfg.portrait,
          objective: f.objective,
          strength: f.strength,
          growth: f.growth,
        });
      },
    );
    return;
  }
  if (k === "Rewards") {
    dialog(
      "Reward settings",
      field("xp", "Task XP", "number", cfg.xp ?? 25, 'min="0" required') +
        field(
          "coins",
          "Task coins",
          "number",
          cfg.coins ?? 4,
          'min="0" required',
        ) +
        field(
          "threshold",
          "XP per level",
          "number",
          cfg.threshold ?? 100,
          'min="1" required',
        ) +
        field("adjust", "Adjust coin balance", "number", 0) +
        field("reason", "Reason for adjustment", "text", ""),
      (f) => {
        if (+f.adjust && !f.reason.trim())
          throw Error("Give a reason for the balance adjustment");
        Object.assign(cfg, {
          xp: +f.xp,
          coins: +f.coins,
          threshold: +f.threshold,
        });
        if (+f.adjust)
          state.receipts[id()] = {
            title: f.reason,
            coins: +f.adjust,
            xp: 0,
            skill: "",
          };
      },
    );
    return;
  }
  if (k === "Focus") {
    dialog(
      "Focus durations",
      ["Focus", "Break", "Long break"]
        .map((v, i) =>
          field(
            "d" + i,
            v + " minutes",
            "number",
            cfg.durations?.[v] || [25, 5, 15][i],
            'min="1" required',
          ),
        )
        .join(""),
      (f) =>
        (cfg.durations = { Focus: +f.d0, Break: +f.d1, "Long break": +f.d2 }),
    );
    return;
  }
  if (k === "Rituals") {
    let names = [
      "Daily planning",
      "Daily shutdown",
      "Weekly planning",
      "Weekly shutdown",
    ];
    dialog(
      "Planning rituals",
      names
        .map(
          (n, i) =>
            field("t" + i, n, "time", cfg.rituals?.[i]?.time) +
            field(
              "days" + i,
              "Days (0 Sunday – 6 Saturday)",
              "text",
              cfg.rituals?.[i]?.days || "1,2,3,4,5",
            ) +
            select(
              "auto" + i,
              "Trigger",
              [
                ["manual", "Manual"],
                ["auto", "Automatic"],
              ],
              cfg.rituals?.[i]?.trigger,
            ),
        )
        .join(""),
      (f) =>
        (cfg.rituals = names.map((name, i) => ({
          name,
          time: f["t" + i],
          days: f["days" + i],
          trigger: f["auto" + i],
        }))),
    );
    return;
  }
  if (k === "Sounds") {
    dialog(
      "Completion cues",
      field("coin", "Coin sound", "file", "", 'accept="audio/mpeg"') +
        field("xp", "XP fireworks sound", "file", "", 'accept="audio/mpeg"') +
        field(
          "volume",
          "Volume",
          "range",
          cfg.volume ?? 50,
          'min="0" max="100"',
        ) +
        select(
          "effect",
          "Animation",
          [
            ["pulse", "Pulse"],
            ["spark", "Spark"],
            ["off", "Off"],
          ],
          cfg.effect,
        ),
      async (f) => {
        for (const key of ["xp", "coin"])
          if (f[key].size) {
            if (f[key].size > 600000)
              throw Error("Use a short clip under 600 KB");
            cfg[key + "Sound"] = await readFile(f[key]);
          }
        cfg.volume = +f.volume;
        cfg.effect = f.effect;
      },
    );
    return;
  }
  dialog(
    "Calendar defaults",
    field(
      "task",
      "Task duration",
      "number",
      cfg.task || 30,
      'min="1" required',
    ) +
      field(
        "event",
        "Event duration",
        "number",
        cfg.event || 30,
        'min="1" required',
      ) +
      field(
        "slot",
        "Time slot duration",
        "number",
        cfg.slot || 60,
        'min="1" required',
      ),
    (f) => Object.assign(cfg, f),
  );
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-act]");
  if (!b) return;
  const k = b.dataset.key;
  if (b.dataset.act === "prefs") prefs(k);
  if (b.dataset.act === "identity") prefs("Identity");
  if (["newBattle", "newGoal"].includes(b.dataset.act)) {
    const key = b.dataset.act === "newBattle" ? "battles" : "goals";
    dialog(
      key === "goals" ? "Objective" : "Battle",
      field("name", "Name", "text", "", "required"),
      (f) => (state[key] ||= []).push({ id: id(), name: f.name, log: [] }),
    );
  }
  if (["lapse", "undoLapse"].includes(b.dataset.act)) {
    const battle = state.battles.find((x) => x.id === k);
    if (b.dataset.act === "lapse") battle.log.push(new Date().toISOString());
    else battle.log.pop();
    save();
  }
  if (b.dataset.act === "goal") {
    const g = state.goals.find((x) => x.id === k);
    g.done = !g.done;
    save();
  }
});
function feedback() {
  const c = state.config || {};
  for (const sound of [c.coinSound, c.xpSound])
    if (sound && c.volume) {
      const a = new Audio(sound);
      a.volume = c.volume / 100;
      a.play().catch(() => {});
    }
  if (
    c.effect !== "off" &&
    !matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    $("#screen").animate([{ opacity: 0.75 }, { opacity: 1 }], 220);
}
function streak(h) {
  let d = new Date();
  if (!state.receipts[h.id + day(d)]) d.setDate(d.getDate() - 1);
  let n = 0;
  while (state.receipts[h.id + day(d)]) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

let pendingShare = Promise.resolve();
function sharePlanner(enabled) {
  const tasks = state.tasks.map((t) => ({
    title: t.title,
    date: t.date,
    time: t.time,
    done: t.done,
    project: project(t.project)?.name,
  }));
  const body = JSON.stringify({ enabled, tasks });
  pendingShare = pendingShare
    .catch(() => {})
    .then(async () => {
      const r = await fetch("/mcp/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (!r.ok) throw Error("Could not update planner sharing");
    });
  return pendingShare;
}
function mcpPanel() {
  return (
    '<section class="card"><h2>AI planner access</h2><p>Share project names, task titles, schedule and completion status with a local MCP client. Run node mcp.mjs from this checkout.</p>' +
    button(state.mcp ? "Disconnect read access" : "Enable read access", "mcp") +
    "</section>"
  );
}
document.addEventListener("click", async (e) => {
  if (e.target.closest('[data-act="mcp"]')) {
    try {
      const next = !state.mcp;
      if (!window.lifeosHosted) await sharePlanner(next);
      state.mcp = next;
      save();
    } catch (err) {
      alert(err.message);
    }
  }
});
function watchRituals() {
  if ($("#modal").open) return;
  const d = new Date();
  const stamp = day(d);
  for (const r of state.config?.rituals || []) {
    const key = r.name + stamp;
    if (
      r.trigger !== "auto" ||
      !r.days
        .split(",")
        .map((v) => v.trim())
        .includes(String(d.getDay())) ||
      r.time !== d.toTimeString().slice(0, 5) ||
      state.lastRitual === key
    )
      continue;
    state.lastRitual = key;
    dialog(
      r.name,
      area("reflection", "What will you carry forward?"),
      (f) =>
        (state.diary[stamp] = [
          state.diary[stamp],
          r.name + " · " + f.reflection,
        ]
          .filter(Boolean)
          .join("\n")),
    );
    break;
  }
}
setInterval(watchRituals, 15000);

const listFilters = [
  "Upcoming",
  "Tomorrow",
  "Next 7 Days",
  "This Week",
  "This Month",
  "Someday",
  "Done",
  "Trashed",
];
function inList(t) {
  const tomorrow = new Date(now + "T12:00");
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (view === "Trashed") return !!t.trashed;
  if (t.trashed) return false;
  if (view === "Tomorrow") return t.date === day(tomorrow);
  if (view === "Upcoming") return t.date > now;
  if (view === "Someday") return plan(t).kind === "someday" && !t.done;
  if (view === "Done" || view === "Completed tasks") return t.done;
  if (t.done) return false;
  if (view === "This Month")
    return plan(t).value?.slice(0, 7) === now.slice(0, 7);
  if (view === "This Week" || view === "Next 7 Days") {
    const first = new Date(now + "T12:00");
    if (view === "This Week")
      first.setDate(first.getDate() - ((first.getDay() + 6) % 7));
    const last = new Date(first);
    last.setDate(first.getDate() + 6);
    const v = plan(t).value;
    return v >= day(first) && v <= day(last);
  }
  return true;
}
function findTask() {
  searchTasks(
    state.tasks
      .filter((t) => !t.trashed)
      .flatMap((t) => {
        const projectName = project(t.project)?.name || "Personal";
        return [
          { id: t.id, title: t.title, projectName },
          ...t.children.map((child, index) => ({
            id: t.id + "/sub/" + index,
            title: child.title,
            projectName,
            parentTitle: t.title,
          })),
        ];
      }),
    (id) => {
      const [parent, index] = id.split("/sub/");
      const t = state.tasks.find((t) => t.id === parent);
      if (t) taskForm(t, undefined, undefined, t.children[index]?.title);
    },
    [
      ["Create task", () => taskForm()],
      ["Play / pause focus timer", () => timerAction("toggle")],
      ...["Planner", "Upcoming", "Inbox", "Today", "Projects", "openGym"].map(
        (name) => [
          "Open " + name,
          () => {
            view = name;
            render();
          },
        ],
      ),
    ],
  );
}
document.addEventListener("keydown", (e) => {
  if (
    (e.ctrlKey || e.metaKey) &&
    e.key.toLowerCase() === "k" &&
    !document.querySelector('[role="dialog"][data-state="open"]') &&
    !$("#modal").open
  ) {
    e.preventDefault();
    findTask();
  }
});
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-act]");
  if (!b) return;
  if (b.dataset.act === "found") {
    const t = state.tasks.find((x) => x.id === b.dataset.key);
    $("#modal").close();
    taskForm(t);
  }
  if (b.dataset.act === "search") findTask();
  if (b.dataset.act === "trash") {
    const t = state.tasks.find((x) => x.id === b.dataset.key);
    t.trashed = !t.trashed;
    $("#modal").close();
    save();
  }
});

function availabilityPanel() {
  return (
    '<section class="card"><h2>Share availability</h2>' +
    button("Booking settings", "availability") +
    (state.bookingPath
      ? ' <a target="_blank" href="' +
        safe(state.bookingPath) +
        '">Open booking link</a>'
      : "") +
    "</section>"
  );
}
document.addEventListener("click", async (e) => {
  if (e.target.closest('[data-act="availability"]')) {
    try {
      const cfg = (await (await fetch("/availability")).json()).config || {};
      dialog(
        "Booking availability",
        field(
          "title",
          "Meeting title",
          "text",
          cfg.title || "Working session",
          "required",
        ) +
          field("location", "Location", "text", cfg.location) +
          field(
            "question",
            "Guest question",
            "text",
            cfg.question || "What would you like to discuss?",
          ) +
          field(
            "days",
            "Available weekdays (0 Sunday – 6 Saturday)",
            "text",
            (cfg.days || ["1", "2", "3", "4", "5"]).join(","),
          ) +
          field(
            "hour",
            "Start hour",
            "number",
            cfg.hour ?? 9,
            'min="0" max="23" required',
          ) +
          field(
            "hours",
            "Window in hours",
            "number",
            cfg.hours || 8,
            'min="1" max="24" required',
          ) +
          field(
            "duration",
            "Meeting minutes",
            "number",
            cfg.duration || 30,
            'min="5" max="480" required',
          ) +
          field(
            "buffer",
            "Buffer minutes",
            "number",
            cfg.buffer ?? 10,
            'min="0" required',
          ) +
          field(
            "notice",
            "Minimum notice in hours",
            "number",
            cfg.notice ?? 24,
            'min="0" required',
          ),
        async (f) => {
          const busy = state.tasks
            .filter((t) => !t.trashed && t.date && t.time)
            .map((t) => {
              const start = new Date(t.date + "T" + t.time).getTime();
              return { start, end: start + Number(t.minutes) * 60000 };
            });
          for (const e of Object.values(overlays).flat())
            busy.push({ start: Date.parse(e.start), end: Date.parse(e.end) });
          const config = {
            ...f,
            days: f.days.split(",").map((v) => v.trim()),
            hour: +f.hour,
            hours: +f.hours,
            duration: +f.duration,
            buffer: +f.buffer,
            notice: +f.notice,
            busy,
          };
          const r = await fetch("/availability", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(config),
          });
          if (!r.ok) throw Error("Could not save availability");
          state.bookingPath = (await r.json()).path;
        },
      );
    } catch {
      alert("Booking service unavailable.");
    }
  }
});

let lockPending = Promise.resolve();
const lockCache = new Map();
function syncBlocks() {
  if (!state.config?.lockCalendar) return;
  for (const t of state.tasks) {
    const payload = {
      id: t.id,
      title: t.title,
      calendar: state.config.lockCalendar,
      private: state.config.privateBlocks,
      remove:
        t.lockOverride === false ||
        !t.time ||
        !t.date ||
        t.trashed ||
        (t.done && state.config.unlockDone),
    };
    if (payload.remove && !lockCache.has(t.id) && !t.locked) continue;
    if (!payload.remove) {
      payload.start = new Date(t.date + "T" + t.time).getTime();
      payload.end = payload.start + Number(t.minutes) * 60000;
    }
    const sig = JSON.stringify(payload);
    if (lockCache.get(t.id) === sig) continue;
    lockCache.set(t.id, sig);
    lockPending = lockPending
      .then(async () => {
        const r = await fetch("/google/lock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: sig,
        });
        const b = await r.json();
        if (!b.ok) throw Error(b.error || "Reconnect Google Calendar");
        t.locked = !payload.remove;
        localStorage.setItem("lifeos", JSON.stringify(state));
        $("#syncState")?.replaceChildren("Synced");
      })
      .catch((err) => {
        lockCache.delete(t.id);
        if ($("#syncState")) $("#syncState").textContent = err.message;
      });
  }
}
document.addEventListener("click", (e) => {
  if (e.target.closest('[data-act="lockSettings"]'))
    dialog(
      "Time blocking on Google",
      field(
        "calendar",
        "Destination calendar ID",
        "text",
        state.config?.lockCalendar || "",
      ) +
        select(
          "privacy",
          "Visibility",
          [
            ["private", "Private"],
            ["default", "Calendar default"],
          ],
          state.config?.privateBlocks ? "private" : "default",
        ) +
        select(
          "unlock",
          "On completion",
          [
            ["yes", "Release time"],
            ["no", "Keep reserved"],
          ],
          state.config?.unlockDone ? "yes" : "no",
        ),
      (f) => {
        const c = (state.config ||= {});
        c.lockCalendar = f.calendar.trim();
        c.privateBlocks = f.privacy === "private";
        c.unlockDone = f.unlock === "yes";
      },
    );
});

let cloudRevision = 0,
  dirty = false,
  pushing = false,
  conflict = false;
function cloudNotice(message) {
  let el = $("#cloudNotice");
  if (!el) {
    el = document.createElement("section");
    el.id = "cloudNotice";
    el.setAttribute("role", "status");
    $("main").prepend(el);
  }
  el.textContent = message;
  if (conflict) {
    const download = document.createElement("button");
    download.textContent = "Export this device’s edits";
    download.onclick = () => {
      const a = document.createElement("a");
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(state, null, 2)], {
          type: "application/json",
        }),
      );
      a.href = url;
      a.download = "lifeos-device-edits.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    el.append(download);
    const reload = document.createElement("button");
    reload.textContent = "Use server version";
    reload.onclick = () => {
      if (
        confirm("Replace this device’s pending edits with the server version?")
      ) {
        localStorage.removeItem("cloudPending");
        location.reload();
      }
    };
    el.append(reload);
  }
}
function queueCloud() {
  dirty = true;
  localStorage.setItem("cloudPending", String(cloudRevision));
  void flushCloud();
}
async function flushCloud() {
  if (!dirty || pushing || conflict) return;
  pushing = true;
  try {
    while (dirty) {
      dirty = false;
      const r = await fetch("/workspace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revision: cloudRevision, data: state }),
      });
      if (r.status === 409) {
        conflict = true;
        cloudNotice(
          "Another device saved first. Your edits are kept on this device. ",
        );
        return;
      }
      if (!r.ok) throw Error("save failed");
      cloudRevision = (await r.json()).revision;
      if (dirty) localStorage.setItem("cloudPending", String(cloudRevision));
      else localStorage.removeItem("cloudPending");
      cloudNotice("Saved to your server");
    }
  } catch {
    dirty = true;
    cloudNotice(
      "Offline or server unavailable. Your edits are saved on this device.",
    );
  } finally {
    pushing = false;
  }
}
async function pullCloud(initial = false) {
  if (conflict || pushing) return;
  if (dirty) return flushCloud();
  if (
    !initial &&
    ($("#modal").open ||
      view === "openGym" ||
      document.activeElement?.matches("input,textarea,select"))
  )
    return;
  const before = cloudRevision;
  try {
    const r = await fetch("/workspace", { cache: "no-store" });
    if (!r.ok) throw Error();
    const remote = await r.json();
    if (dirty || pushing || before !== cloudRevision) return;
    const pending = localStorage.getItem("cloudPending");
    if (initial && pending !== null) {
      cloudRevision = Number(pending);
      if (cloudRevision !== remote.revision) {
        conflict = true;
        cloudNotice("Your unsent edits overlap a newer server version. ");
        return;
      }
      queueCloud();
      return;
    }
    if (initial || cloudRevision !== remote.revision) {
      cloudRevision = remote.revision;
      if (remote.data) {
        state = { ...defaults, ...remote.data };
        localStorage.setItem("lifeos", JSON.stringify(state));
        render();
      }
      cloudNotice("Connected to your server");
    }
  } catch {
    cloudNotice("Server unavailable. Showing this device’s saved workspace.");
  }
}
document.addEventListener("input", (e) => {
  if (e.target.name === "diaryFilter")
    for (const row of document.querySelectorAll("[data-entry]"))
      row.hidden = !row.textContent
        .toLowerCase()
        .includes(e.target.value.toLowerCase());
});
document.addEventListener("click", (e) => {
  if (e.target.closest('[data-act="newSkill"]'))
    dialog("New skill", field("name", "Name", "text", "", "required"), (f) => {
      const s = f.name.trim();
      if (s && !state.skills.includes(s)) state.skills.push(s);
    });
});
async function refreshTraining() {
  if (conflict || dirty || pushing || document.hidden) return;
  try {
    const response = await fetch("/gym/api/data", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    if (!Array.isArray(data.state?.workouts)) return;
    const receipts = Object.fromEntries(
      Object.entries(state.receipts).filter(([key]) => !key.startsWith("gym:")),
    );
    for (const w of data.state.workouts)
      if (w.id)
        receipts["gym:" + w.id] = {
          title: w.name || "Workout",
          date: w.d,
          skill: state.gymSkill || "Gym",
          xp: 25,
          coins: 4,
        };
    if (JSON.stringify(receipts) !== JSON.stringify(state.receipts)) {
      state.receipts = receipts;
      localStorage.setItem("lifeos", JSON.stringify(state));
      queueCloud();
      if (view === "Overview") render();
    }
  } catch {}
}
if (window.lifeosHosted) {
  await pullCloud(true);
  setInterval(pullCloud, 5000);
  void refreshTraining();
  setInterval(refreshTraining, 30000);
}
try {
  await backupLegacy(localStorage.getItem("lifeos"));
} catch (err) {
  console.warn("Could not save the pre-upgrade recovery snapshot", err);
}
function overlayURL(id) {
  const first = new Date(plannerPrefs.date + "T00:00:00"),
    end = new Date(first);
  end.setDate(first.getDate() + plannerPrefs.days);
  return (
    "/google/events?" +
    new URLSearchParams({
      id,
      from: first.toISOString(),
      to: end.toISOString(),
    })
  );
}
async function refreshOverlays() {
  await Promise.all(
    Object.keys(overlayPrefs).map(async (k) => {
      try {
        const url = overlayURL(k);
        const r = await fetch(url);
        const data = await r.json();
        if (r.ok && data.events && overlayPrefs[k] && overlayURL(k) === url)
          overlays[k] = data.events;
      } catch {}
    }),
  );
  if (view === "Planner") render();
}
render();
if (Object.keys(overlayPrefs).length) void refreshOverlays();
setInterval(() => {
  if (view === "Planner" && Object.keys(overlayPrefs).length)
    void refreshOverlays();
}, 60000);
setInterval(tick, 1000);

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-act]");
  if (!b) return;
  if (b.dataset.act === "switchTheme") toggleTheme();
  if (b.dataset.act === "assign") {
    const t = state.tasks.find((t) => t.id === b.dataset.key);
    if (t) assignProject(t, b);
  }
});

document.addEventListener("keydown", (e) => {
  if (
    e.ctrlKey ||
    e.altKey ||
    e.metaKey ||
    e.target.closest(
      "input,textarea,select,[contenteditable=true],[role=dialog],dialog",
    ) ||
    document.querySelector("[role=dialog][data-state=open]")
  )
    return;
  const target = { u: "Upcoming", p: "Planner", i: "Inbox" }[
    e.key.toLowerCase()
  ];
  if (target) {
    e.preventDefault();
    view = target;
    render();
  }
});
