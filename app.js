import { searchTasks, renderSidebar } from "/shell.js";
import { addDays, addMonths, planOf, applyPlan, upcomingHTML } from "./ui/planning.mjs";
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
    location.pathname === "/design-system" ? "Design system" : "Planner",
  date = now,
  range = "Day",
  upcomingMode = "Overview",
  upcomingAnchor = now;
const project = (k) => state.projects.find((p) => p.id === k);
const image = (p) =>
  p?.image ? '<img class="thumb" alt="" src="' + safe(p.image) + '">' : "";
const earned = () => Object.values(state.receipts);
const total = (field, skill) =>
  earned()
    .filter((r) => !skill || r.skill === skill)
    .reduce((n, r) => n + r[field], 0);
function save() {
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
  render();
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
  $("#form").classList.toggle(
    "task-editor",
    title === "Edit task" || title === "New task",
  );
  $("#modal").showModal();
}
async function picture(file) {
  if (!file?.size) return "";
  const bm = await createImageBitmap(file);
  const c = document.createElement("canvas");
  c.width = c.height = 180;
  const side = Math.min(bm.width, bm.height);
  c.getContext("2d").drawImage(
    bm,
    (bm.width - side) / 2,
    (bm.height - side) / 2,
    side,
    side,
    0,
    0,
    180,
    180,
  );
  bm.close();
  return c.toDataURL("image/png");
}
function projectForm(p) {
  dialog(
    "Project studio",
    field("name", "Project name", "text", p?.name, "required") +
      field("folder", "Sidebar folder", "text", p?.folder) +
      field("color", "Project color", "color", p?.color || "#74669e") +
      select(
        "stage",
        "Stage",
        ["Inbox", "In progress", "Completed"].map((v) => [v, v]),
        p?.stage || "In progress",
      ) +
      field("skill", "Linked skill", "text", p?.skill, "required") +
      field("photo", "Your project image", "file", "", 'accept="image/*"') +
      image(p),
    async (f) => {
      const next = {
        id: p?.id || id(),
        name: f.name.trim(),
        folder: f.folder.trim(),
        color: f.color,
        stage: f.stage,
        skill: f.skill.trim(),
        image: (await picture(f.photo)) || p?.image || "",
      };
      if (!next.name || !next.skill)
        throw Error("Enter a project and skill name");
      if (p) Object.assign(p, next);
      else state.projects.push(next);
      if (!state.skills.includes(next.skill)) state.skills.push(next.skill);
      view = next.id;
    },
  );
}
const priorities = ["None", "Low", "Medium", "High", "Goal"];
function taskForm(t) {
  const p = t?.project ?? (project(view)?.id || "");
  dialog(
    t ? "Edit task" : "New task",
    field("title", "Title", "text", t?.title, "required") +
      image(project(p)) +
      select(
        "project",
        "Project",
        [["", "Personal"], ...state.projects.map((p) => [p.id, p.name])],
        p,
      ) +
      field(
        "date",
        "Planned date",
        "date",
        t?.date ?? (view === "Inbox" ? "" : date),
      ) +
      "<task-date-picker></task-date-picker>" +
      field("time", "Start time", "time", t?.time) +
      field(
        "minutes",
        "Duration (minutes)",
        "number",
        t?.minutes || state.config?.task || 30,
        'min="1" required',
      ) +
      select(
        "priority",
        "Priority",
        priorities.map((x) => [x, x]),
        t?.priority || "None",
      ) +
      '<details class="task-advanced"><summary>More options</summary>' +
      area("notes", "Description", t?.notes) +
      field("tags", "Tags", "text", t?.tags) +
      field("location", "Location", "text", t?.location) +
      extraTaskFields(t) +
      area(
        "children",
        "Subtasks (one per line)",
        t?.children.map((s) => s.title).join("\n"),
      ) + "</details>",
    async (f) => {
      let file = f.removeFile ? null : t?.file;
      if (f.attachment?.size) {
        if (f.attachment.size > 1000000)
          throw Error("Choose a file under 1 MB");
        file = { name: f.attachment.name, data: await readFile(f.attachment) };
      }
      delete f.attachment;
      const next = {
        ...f,
        file,
        id: t?.id || id(),
        done: t?.done || false,
        children: f.children
          .split("\n")
          .map((x) => x.trim())
          .filter(Boolean)
          .map((title) => ({
            title,
            done: t?.children.find((x) => x.title === title)?.done || false,
          })),
      };
      if (next.time && !next.date) throw Error("Choose a date for this time");
      if (next.date) applyPlan(next, next.time ? "exact-time" : "day", next.date, next.time);
      else if (t && !t.date && ["month","week","someday"].includes(planOf(t).kind)) next.planning = {...planOf(t)};
      else applyPlan(next,"unscheduled");
      if (t) {
        if (f.scope === "series") editFollowing(t, next);
        Object.assign(t, next);
        if (t.done !== Boolean(f.completed)) complete(t);
      } else state.tasks.push(next);
    },
  );
}
function complete(t) {
  t.done = !t.done;
  if (t.done)
    state.receipts[t.id] = {
      title: t.title,
      skill: project(t.project)?.skill || "",
      xp: state.config?.xp ?? 25,
      coins: state.config?.coins ?? 4,
    };
  else delete state.receipts[t.id];
  if (t.done) {
    repeatAfter(t);
    feedback();
  }
  save();
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
    button(image(p) + safe(p?.name || "Personal"), "assign", t.id) +
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
          "</span></label>",
      )
      .join("") +
    '</div><select class="mini-plan" aria-label="Plan ' + safe(t.title) + '" data-quick-plan="' + safe(t.id) + '">' +
    '<option value="" selected>⋯</option><option value="today">Today</option><option value="tomorrow">Tomorrow</option>' +
    '<option value="nextWeek">Next week</option><option value="nextMonth">Next month</option>' +
    '<option value="someday">Someday</option><option value="inbox">Inbox</option></select></div>'
  );
}
function agenda() {
  let p = project(view);
  let tasks = state.tasks
    .filter(inList)
    .filter((t) =>
      listFilters.includes(view)
        ? true
        : p
          ? t.project === p.id
          : view === "Tasks"
            ? true
            : view === "Inbox"
              ? planOf(t).kind === "unscheduled"
              : t.date === date,
    );
  return (
    '<div class="card"><div class="bar"><h2>' +
    safe(p?.name || (view === "Inbox" ? "Inbox" : view === "Tasks" ? "Tasks" : "Agenda")) +
    "</h2>" +
    button("＋ Add task", "add") +
    "</div>" +
    (p
      ? image(p) +
        safe(p.stage || "In progress") +
        " · " +
        safe(p.skill) +
        " " +
        button("Edit project", "project", p.id)
      : "") +
    (p || view === "Inbox" || view === "Tasks" ?
      '<form class="up-quick task-quick" data-quick-kind="unscheduled" data-quick-project="' + safe(p?.id || "") +
      '"><label class="sr-only" for="task-quick-title">Task title</label><span aria-hidden="true">＋</span><input id="task-quick-title" name="title" placeholder="Add task…" maxlength="300" autocomplete="off" required></form>' : "") +
    [false, true]
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
      ? "<p>Capture a task and give it a place in your day.</p>"
      : "") +
    "</div>"
  );
}
function shift(n) {
  let d = new Date(date + "T12:00");
  if (range === "Month") {
    d.setDate(1);
    d.setMonth(d.getMonth() + n);
  } else
    d.setDate(d.getDate() + n * (range === "Week" ? 7 : parseInt(range) || 1));
  date = day(d);
  if (view === "Today" || view === "Overview") view = "Agenda";
  render();
}
// Local calendar coordinates: minutes since midnight; one shared scale across days.
function calendar() {
  const first = new Date(date + "T12:00"),
    month = range === "Month",
    count = month
      ? new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
      : range === "Week"
        ? 7
        : parseInt(range) || 1;
  if (month) first.setDate(1);
  const days = Array.from({ length: count }, (_, i) => {
    const d = new Date(first);
    d.setDate(d.getDate() + i);
    return {
      d,
      key: day(d),
      tasks: state.tasks
        .filter((t) => !t.trashed && t.date === day(d) && t.time)
        .sort((a, b) => a.time.localeCompare(b.time)),
    };
  });
  const mins = (t) =>
    Number(t.time.slice(0, 2)) * 60 + Number(t.time.slice(3, 5));
  const all = days.flatMap((d) => d.tasks);
  const start = Math.min(8, ...all.map((t) => Math.floor(mins(t) / 60))),
    end = Math.min(
      24,
      Math.max(
        19,
        ...all.map((t) => Math.ceil((mins(t) + Number(t.minutes)) / 60)),
      ),
    );
  const hours = Array.from({ length: end - start }, (_, i) => start + i);
  const time = (n) =>
    String(Math.floor(n / 60)).padStart(2, "0") +
    ":" +
    String(n % 60).padStart(2, "0");
  function block(t, pos = "") {
    const p = project(t.project),
      color = /^#[0-9a-f]{6}$/i.test(p?.color) ? p.color : "var(--accent)";
    const name =
      t.time +
      " · " +
      t.title +
      " · " +
      t.minutes +
      " min" +
      (p ? " · " + p.name : "");
    return button(
      '<span class="block-title">' +
        image(p) +
        safe(t.title) +
        '</span><span class="block-time">' +
        t.time +
        " · " +
        Number(t.minutes) +
        "m</span>",
      "edit",
      t.id,
      'class="time-block" aria-label="' +
        safe(name) +
        '" title="' +
        safe(name) +
        '" style="--project:' +
        color +
        ";" +
        pos +
        '"',
    );
  }
  // Give simultaneous events their own lanes until the overlap group clears.
  function timed(tasks) {
    let result = "",
      group = [],
      ends = [];
    const flush = () => {
      const width = 100 / ends.length;
      for (const { t, lane, at, duration } of group)
        result += block(
          t,
          "top:calc(" +
            (at - start * 60) / 60 +
            " * var(--hour));height:calc(" +
            duration / 60 +
            " * var(--hour));left:calc(" +
            lane * width +
            "% + 2px);width:calc(" +
            width +
            "% - 4px)",
        );
      group = [];
      ends = [];
    };
    for (const t of tasks) {
      const at = mins(t),
        duration = Math.min(1440 - at, Math.max(1, Number(t.minutes) || 30));
      if (ends.length && Math.max(...ends) <= at) flush();
      let lane = ends.findIndex((x) => x <= at);
      if (lane < 0) lane = ends.length;
      ends[lane] = at + duration;
      group.push({ t, lane, at, duration });
    }
    if (group.length) flush();
    return result;
  }
  const grid = month
    ? '<div class="calendar-scroll"><div class="month-board">' +
      ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        .map((x) => "<b>" + x + "</b>")
        .join("") +
      days
        .map(
          ({ d, key, tasks }, i) =>
            '<div class="slot month-day" data-date="' +
            key +
            '" style="' +
            (!i ? "grid-column:" + (((d.getDay() + 6) % 7) + 1) : "") +
            '"><strong>' +
            d.getDate() +
            "</strong>" +
            tasks.map((t) => block(t)).join("") +
            "</div>",
        )
        .join("") +
      "</div></div>"
    : '<div class="calendar-scroll"><div class="time-board" style="--days:' +
      count +
      '"><div class="time-axis"><div class="date-cap">Local</div>' +
      hours.map((h) => "<time>" + time(h * 60) + "</time>").join("") +
      "</div>" +
      days
        .map(
          ({ key, d, tasks }) =>
            '<div><div class="date-cap">' +
            safe(
              d.toLocaleDateString(undefined, {
                weekday: "short",
                day: "numeric",
              }),
            ) +
            '</div><div class="day-column">' +
            hours
              .map(
                (h) =>
                  '<div class="slot hour" data-hour="' +
                  h +
                  '" data-date="' +
                  key +
                  '"></div>',
              )
              .join("") +
            '<div class="event-layer">' +
            timed(tasks) +
            "</div></div></div>",
        )
        .join("") +
      "</div></div>";
  return (
    '<section class="card calendar-card"><div class="bar calendar-head"><h2>Calendar</h2>' +
    button("‹", "prev") +
    button("Today", "reset") +
    button("›", "next") +
    '<select aria-label="Calendar range" id="range">' +
    ["Day", "2 days", "3 days", "4 days", "5 days", "6 days", "7 days", "Week", "Month"]
      .map(
        (v) =>
          "<option " + (range === v ? "selected" : "") + ">" + v + "</option>",
      )
      .join("") +
    "</select></div>" +
    googleAgenda() +
    grid +
    "</section>"
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
function taskWorkspace() {
  const p=project(view);
  const tasks=state.tasks.filter(t => !t.trashed && (
    p ? t.project===p.id :
    view==="Inbox" ? planOf(t).kind==="unscheduled" : true
  ));
  const open=tasks.filter(t=>!t.done),done=tasks.filter(t=>t.done);
  const completion=tasks.length?Math.round(100*done.length/tasks.length):0;
  const metadata=p
    ? '<div class="project-head"><div class="project-identity">'+image(p)+
      '<span>'+safe(p.stage||"In progress")+' · '+safe(p.skill||"")+'</span></div>'+
      '<div class="project-progress" role="progressbar" aria-label="Project completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+completion+'"><span style="width:'+completion+'%"></span></div>'+
      button("Edit project","project",p.id)+'</div>'
    : "";
  const quick='<form class="up-quick task-quick" data-quick-kind="unscheduled" data-quick-project="'+safe(p?.id||"")+'">'+
    '<label class="sr-only" for="workspace-task-title">New task title</label><span aria-hidden="true">＋</span>'+
    '<input id="workspace-task-title" name="title" placeholder="Add task…" autocomplete="off" required maxlength="300"></form>';
  const duration=(items)=>items.reduce((sum,t)=>sum+Number(t.minutes||0),0);
  const heading=(label,items)=>'<div class="task-section-heading"><span>'+label+'</span><small>'+items.length+' · '+duration(items)+' min</small></div>';
  return '<section class="lifeos-task-page'+(p?' project':'')+'">'+metadata+
    '<div class="task-list-toolbar"><span>'+tasks.length+' task'+(tasks.length===1?'':'s')+'</span>'+ (view==="Tasks"?button("New project","project"):"")+'</div>'+
    quick+heading("To-dos",open)+
    (open.length?open.map(row).join(""):'<p class="task-empty">No open tasks</p>')+
    (done.length?'<details class="done-group"><summary>Completed · '+done.length+'</summary>'+heading("Done",done)+done.map(row).join("")+'</details>':"")+
    '</section>';
}
function plannerQueue() {
  const pending = state.tasks.filter(t => !t.trashed && !t.done && !t.time && planOf(t).kind !== "someday");
  return '<section class="planner-queue" aria-label="Tasks to schedule"><div class="planner-queue-head"><h2>To schedule</h2><span>'+pending.length+'</span></div>' +
    '<form class="up-quick task-quick" data-quick-kind="unscheduled"><label class="sr-only" for="planner-task-title">New task title</label><span aria-hidden="true">＋</span><input id="planner-task-title" name="title" placeholder="Add task…" autocomplete="off" required maxlength="300"></form>' +
    '<div class="planner-queue-items">'+pending.map(row).join("")+'</div></section>';
}
function render() {
  document.documentElement.classList.toggle("black", state.theme === "Black");
  renderSidebar({
    view,
    projects: state.projects,
    count: state.tasks.filter((t) => planOf(t).kind === "unscheduled" && !t.done && !t.trashed).length,
    theme: state.theme,
    onTheme: toggleTheme,
    onProject: () => projectForm(),
    lists: listFilters,
  });
  document.documentElement.dataset.effects = state.config?.effect || "on";
  let body =
    view === "Design system"
      ? "<lifeos-showcase></lifeos-showcase>"
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
  else if (view === "Skills")
    body =
      button("New skill", "newSkill") +
      skills() +
      earned()
        .map(
          (r) =>
            '<div class="row">' +
            safe(r.title) +
            " · " +
            safe(r.skill) +
            " +" +
            r.xp +
            " XP</div>",
        )
        .join("");
  else if (view === "Habits") body = habits();
  else if (view === "Settings")
    body =
      button("Edit profile", "profile") +
      '<p><a href="/design-system">UI showcase</a></p>' +
      settingsPlus() +
      googleSettings() +
      availabilityPanel() +
      mcpPanel();
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
        ? '<div class="lifeos-overview"><div class="agenda-stack">' + agenda() + summary() +
          '</div><section class="review-grid"><div>' + fitnessSummary() +
          '</div><div class="card"><h2>Habits</h2>' + habits() + '</div></section>' + contentHub() + '</div>'
        : view === "Upcoming"
          ? upcomingHTML({tasks:state.tasks,mode:upcomingMode,anchor:upcomingAnchor,today:day(),renderTask:row})
          : view === "Planner" || view === "Today" || view === "Agenda"
            ? '<div class="planner-layout">' + plannerQueue() + calendar() + '</div>'
            : '<div class="task-workspace">' + taskWorkspace() + '</div>';
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
        range = "Day";
      }
      render();
      break;
    case "upMode":
      upcomingMode = k; upcomingAnchor = day(); render(); break;
    case "upToday":
      upcomingAnchor = day(); render(); break;
    case "upPrev":
    case "upNext": {
      const step = b.dataset.act === "upNext" ? 1 : -1;
      upcomingAnchor = upcomingMode === "Month" ? addMonths(upcomingAnchor,step)
        : addDays(upcomingAnchor,step*(upcomingMode === "Week" ? 7 : 1));
      render(); break;
    }
    case "close":
      $("#modal").close();
      break;
    case "project":
      projectForm(project(k));
      break;
    case "edit":
      taskForm(t);
      break;
    case "add":
      taskForm();
      break;
    case "complete":
      complete(t);
      break;
    case "sub":
      t.children[b.dataset.i].done = b.checked;
      save();
      break;
    case "reset":
      view = "Planner";
      date = now;
      range = "Day";
      render();
      break;
    case "prev":
      shift(-1);
      break;
    case "next":
      shift(1);
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
        (f) => state.habits.push({ ...f, id: id() }),
      );
      break;
    case "check": {
      let h = state.habits.find((h) => h.id === k),
        key = k + now;
      if (state.receipts[key]) delete state.receipts[key];
      else
        state.receipts[key] = {
          title: h.title,
          skill: h.skill,
          xp: 10,
          coins: 2,
        };
      save();
      break;
    }
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
        save();
      } else alert("Earn more coins to redeem this reward.");
      break;
    }
  }
});
document.addEventListener("change", (e) => {
  if (e.target.id === "range") {
    range = e.target.value;
    render();
  }
  if (e.target.matches("[data-quick-plan]")) {
    const task = state.tasks.find(t => t.id === e.target.dataset.quickPlan);
    if (!task) return;
    const today = day();
    const tomorrow = addDays(today,1);
    const nextWeek = addDays(today,7);
    const nextMonth = addMonths(today,1);
    const choice = e.target.value;
    if (choice === "today") applyPlan(task,"day",today);
    if (choice === "tomorrow") applyPlan(task,"day",tomorrow);
    if (choice === "nextWeek") applyPlan(task,"week",nextWeek);
    if (choice === "nextMonth") applyPlan(task,"month",nextMonth);
    if (choice === "someday") applyPlan(task,"someday");
    if (choice === "inbox") applyPlan(task,"unscheduled");
    if (choice) save();
  }
});
document.addEventListener("submit", e => {
  const f = e.target.closest("form.up-quick");
  if(!f) return;
  e.preventDefault();
  const title = f.elements.namedItem("title")?.value.trim();
  if(!title) return;
  const task = {id:id(),title,project:f.dataset.quickProject||"",date:"",time:"",priority:"None",notes:"",
    minutes:String(state.config?.task||30),children:[],repeat:"None",done:false};
  applyPlan(task,f.dataset.quickKind||"unscheduled",f.dataset.quickValue||"");
  state.tasks.push(task);save();
});
document.addEventListener("dragstart", (e) => {
  let r = e.target.closest("[data-task]");
  if (r) e.dataTransfer.setData("text/plain", r.dataset.task);
});
document.addEventListener("dragover", (e) => {
  if (e.target.closest(".slot, .up-column")) e.preventDefault();
});
document.addEventListener("drop", (e) => {
  const col = e.target.closest(".up-column");
  if (col) {
    e.preventDefault();
    const moving = state.tasks.find(t=>t.id === e.dataTransfer.getData("text/plain"));
    if (moving) {applyPlan(moving,col.dataset.planKind,col.dataset.planValue);save();}
    return;
  }
  let slot = e.target.closest(".slot");
  if (!slot) return;
  e.preventDefault();
  let t = state.tasks.find(
    (t) => t.id === e.dataTransfer.getData("text/plain"),
  );
  if (t) {
    t.date = slot.dataset.date;
    t.time = slot.dataset.hour
      ? slot.dataset.hour.padStart(2, "0") + ":00"
      : t.time || "09:00";
    applyPlan(t, "exact-time", t.date, t.time);
    save();
  }
});
function toggleTheme() {
  state.theme = state.theme === "Light" ? "Black" : "Light";
  save();
}

function tick() {
  let t = state.timer;
  let left = t.end
    ? Math.max(0, Math.ceil((t.end - Date.now()) / 1000))
    : t.left;
  $("#timer").textContent =
    t.mode +
    " · " +
    Math.floor(left / 60) +
    ":" +
    String(left % 60).padStart(2, "0");
}
$("#timer").onclick = () => {
  let t = state.timer;
  dialog(
    "Focus timer",
    select(
      "mode",
      "Mode",
      ["Focus", "Break", "Long break"].map((s) => [s, s]),
      t.mode,
    ) +
      select(
        "task",
        "Link a task",
        [
          ["", "No task"],
          ...state.tasks
            .filter((t) => !t.done && !t.trashed)
            .map((t) => [t.id, t.title]),
        ],
        t.task || "",
      ) +
      select("action", "Timer", [
        [t.end ? "pause" : "start", t.end ? "Pause" : "Start / resume"],
        ["reset", "Reset"],
      ]),
    (f) => {
      let seconds =
        state.config?.durations?.[f.mode] * 60 ||
        { Focus: 1500, Break: 300, "Long break": 900 }[f.mode];
      let left =
        f.mode === t.mode
          ? t.end
            ? Math.max(0, Math.ceil((t.end - Date.now()) / 1000))
            : t.left
          : seconds;
      state.timer = {
        task: f.task,
        mode: f.mode,
        left: f.action === "reset" ? seconds : left,
        end:
          f.action === "start" ? Date.now() + (left || seconds) * 1000 : null,
      };
    },
  );
};
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
        skill: "Gym",
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

function googleAgenda() {
  const entries = Object.values(overlays)
    .flat()
    .filter(
      (e) =>
        (e.start?.length === 10 ? e.start : day(new Date(e.start))) === date,
    );
  return entries
    .map(
      (e) =>
        '<p class="pill">Calendar · ' +
        safe(e.title) +
        " · " +
        safe(e.start) +
        "</p>",
    )
    .join("");
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
    return;
  }
  try {
    const data = await (
      await fetch("/google/events?id=" + encodeURIComponent(key))
    ).json();
    if (!data.events) throw Error(data.error || "Reconnect your account");
    if (e.target.checked) overlays[key] = data.events;
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
    planning: {kind: t.time ? "exact-time" : "day", value: next},
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
function extraTaskFields(t) {
  return (
    (t
      ? button(
          t.trashed ? "Restore task" : "Move to Trash",
          "trash",
          t.id,
          'type="button"',
        )
      : "") +
    select(
      "repeat",
      "Repeat",
      ["None", "Daily", "Weekdays", "Weekly", "Monthly"].map((v) => [v, v]),
      t?.repeat || "None",
    ) +
    (t
      ? select(
          "scope",
          "Apply edits to",
          [
            ["one", "This occurrence"],
            ["series", "This and following occurrences"],
          ],
          "one",
        )
      : "") +
    '<output id="nextRepeat"></output>' +
    field("attachment", "Attach a file", "file", "") +
    (t?.file
      ? '<a download="' +
        safe(t.file.name) +
        '" href="' +
        safe(t.file.data) +
        '">Download ' +
        safe(t.file.name) +
        '</a><label><span><input name="removeFile" type="checkbox"> Remove attachment</span></label>'
      : "") +
    (t
      ? '<label><span><input name="completed" type="checkbox" ' +
        (t.done ? "checked" : "") +
        "> Completed</span></label>"
      : "")
  );
}
document.addEventListener("input", () => {
  const out = $("#nextRepeat");
  if (!out) return;
  const f = $("#form");
  out.textContent =
    f.repeat.value !== "None" && f.date.value
      ? "Next occurrence · " + advanceDate(f.date.value, f.repeat.value)
      : "";
});

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
  if (view === "Battle")
    return (
      button("Add bad habit", "newBattle") +
      (state.battles || [])
        .map(
          (b) =>
            '<div class="card">' +
            safe(b.name) +
            " · " +
            (b.log || []).length +
            " lapses " +
            button("Log lapse", "lapse", b.id) +
            button("Undo last", "undoLapse", b.id) +
            "</div>",
        )
        .join("")
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
  if (view === "Someday") return planOf(t).kind === "someday" && !t.done;
  if (view === "Done") return t.done;
  if (view === "This Month") return t.date?.slice(0, 7) === now.slice(0, 7);
  if (view === "This Week" || view === "Next 7 Days") {
    const first = new Date(now + "T12:00");
    if (view === "This Week")
      first.setDate(first.getDate() - ((first.getDay() + 6) % 7));
    const last = new Date(first);
    last.setDate(first.getDate() + 6);
    return t.date >= day(first) && t.date <= day(last);
  }
  return true;
}
function findTask() {
  searchTasks(
    state.tasks
      .filter((t) => !t.trashed)
      .map((t) => ({
        id: t.id,
        title: t.title,
        projectName: project(t.project)?.name || "Personal",
      })),
    (id) => {
      const t = state.tasks.find((t) => t.id === id);
      if (t) taskForm(t);
    },
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
        !t.time || !t.date || t.trashed || (t.done && state.config.unlockDone),
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
          skill: "Gym",
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
render();
setInterval(tick, 1000);

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-act]");
  if (!b) return;
  if (b.dataset.act === "switchTheme") toggleTheme();
  if (b.dataset.act === "assign") {
    const t = state.tasks.find((t) => t.id === b.dataset.key);
    dialog(
      "Assign project",
      select(
        "project",
        "Project",
        [["", "Personal"], ...state.projects.map((p) => [p.id, p.name])],
        t.project,
      ),
      (f) => (t.project = f.project),
    );
  }
});
