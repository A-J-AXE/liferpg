import { Identity, Artwork, InlineName } from "./entity-controls";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  MoreHorizontal,
  Plus,
  Repeat2,
  Folder,
  CalendarClock,
} from "lucide-react";
import { NativeSelect } from "./components/ui/native-select";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Calendar } from "./components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "./components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./components/ui/dropdown-menu";
import {
  key,
  civil,
  offset,
  month,
  week,
  localeWeek,
  columns,
  bucket,
  plan,
  minute,
  clock,
  lanes,
} from "./planning.mjs";

const empty = { kind: "unscheduled", value: "" };
function Btn({ label, children, ...props }) {
  return (
    <Button
      size="sm"
      variant="ghost"
      title={label}
      aria-label={label}
      {...props}
    >
      {children}
    </Button>
  );
}
function DateJump({ value, set }) {
  const [open, toggle] = useState(false);
  return (
    <Popover open={open} onOpenChange={toggle}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" aria-label="Jump to date">
          <CalendarDays />
          {civil(value).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          defaultMonth={civil(value)}
          selected={civil(value)}
          onSelect={(d) => {
            if (d) {
              set(key(d));
              toggle(false);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
function Quick({ ctx, period, project }) {
  const [title, set] = useState("");
  return (
    <form
      className="ws-quick"
      onSubmit={(e) => {
        e.preventDefault();
        if (title.trim()) {
          ctx.quick(title.trim(), period, project);
          set("");
        }
      }}
    >
      <Plus size={14} />
      <Input
        aria-label="Quick add task"
        placeholder="Add task…"
        value={title}
        onChange={(e) => set(e.target.value)}
      />
      <Btn
        label="＋ Add task"
        type="button"
        onClick={(e) => ctx.edit(null, e.currentTarget, period)}
      >
        •••
      </Btn>
    </form>
  );
}
function Task({ t, ctx }) {
  const p = ctx.projects.find((x) => x.id === t.project),
    [rename, setRename] = useState(false),
    [title, setTitle] = useState(t.title);
  return (
    <div
      className="ws-task"
      data-task={t.id}
      data-priority={t.priority}
      draggable={!rename}
      onDragStart={(e) => e.dataTransfer.setData("text/plain", t.id)}
      onClick={(e) => {
        if (!e.target.closest("button,input,textarea,[role=menuitem]"))
          ctx.edit(t, e.currentTarget);
      }}
    >
      <input
        type="checkbox"
        aria-label={"Complete " + t.title}
        checked={t.done}
        onChange={() => ctx.complete(t)}
      />
      <div className="ws-task-name">
        {rename ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (title.trim()) ctx.patch(t, { title: title.trim() });
              setRename(false);
            }}
          >
            <Input
              autoFocus
              aria-label="Rename task"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setRename(false);
              }}
            />
          </form>
        ) : (
          <button title={t.title} onClick={(e) => ctx.edit(t, e.currentTarget)}>
            {t.title}
          </button>
        )}
        <small>
          <button
            type="button"
            className="ws-project-chip"
            aria-label={"Assign project for " + t.title}
            onClick={(e) => ctx.assign(t, e.currentTarget)}
          >
            <Identity entity={p} />
            {p?.name || "Personal"}
          </button>
          {t.time && <span>{t.time}</span>}
          <span>{t.minutes}m</span>
          {t.repeat && t.repeat !== "None" && (
            <Repeat2 aria-label={t.repeat} size={12} />
          )}{" "}
          {t.children?.length > 0 && (
            <span>
              {t.children.filter((x) => x.done).length}/{t.children.length}
            </span>
          )}
          {t.priority !== "None" && <span>{t.priority}</span>}
        </small>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Btn label={"Actions for " + t.title}>
            <MoreHorizontal size={15} />
          </Btn>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() => {
              setTitle(t.title);
              setRename(true);
            }}
          >
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              ctx.edit(
                t,
                document.querySelector(
                  '[data-task="' + CSS.escape(t.id) + '"] button',
                ),
              )
            }
          >
            Edit properties
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => ctx.schedule(t)}>
            Schedule in Planner
          </DropdownMenuItem>
          {[
            ["Tomorrow", { kind: "day", value: offset(key(), 1) }],
            [
              "Next week",
              { kind: "week", value: offset(week(key(), ctx.start), 7) },
            ],
            ["Next month", { kind: "month", value: month(key(), 1) }],
            ["Someday", { kind: "someday", value: "" }],
            ["Inbox", empty],
          ].map(([name, p]) => (
            <DropdownMenuItem key={name} onSelect={() => ctx.move(t, p)}>
              Move to {name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
function drop(e, ctx, action) {
  e.preventDefault();
  const t = ctx.tasks.find(
    (t) => t.id === e.dataTransfer.getData("text/plain"),
  );
  if (t) action(t);
}
function Upcoming({ ctx }) {
  const { mode, anchor } = ctx.prefs,
    set = ctx.pref,
    cols = columns(mode, mode === "Overview" ? key() : anchor, ctx.start);
  const scroll = useRef(null);
  useLayoutEffect(() => {
    if (scroll.current) scroll.current.scrollLeft = 0;
  }, [mode, anchor]);
  function advance(n) {
    set({
      anchor:
        mode === "Month"
          ? month(anchor, n) + "-01"
          : offset(anchor, n * (mode === "Week" ? 7 : 1)),
    });
  }
  return (
    <section className="ws">
      <div className="ws-toolbar">
        <div className="ws-tabs">
          {["Overview", "Day", "Week", "Month"].map((v) => (
            <Button
              key={v}
              variant={mode === v ? "secondary" : "ghost"}
              size="sm"
              aria-pressed={mode === v}
              onClick={() =>
                set({ mode: v, ...(v === mode ? { anchor: key() } : {}) })
              }
            >
              {v}
            </Button>
          ))}
        </div>
        {mode !== "Overview" && (
          <>
            <Btn label="Previous period" onClick={() => advance(-1)}>
              <ChevronLeft />
            </Btn>
            <DateJump value={anchor} set={(v) => set({ anchor: v })} />
            <Btn label="Next period" onClick={() => advance(1)}>
              <ChevronRight />
            </Btn>
            <Btn label="Jump to today" onClick={() => set({ anchor: key() })}>
              Today
            </Btn>
          </>
        )}
      </div>
      <div
        className="ws-board"
        ref={scroll}
        onDragOver={(e) => {
          const el = e.currentTarget,
            r = el.getBoundingClientRect();
          if (e.clientX > r.right - 40) el.scrollLeft += 20;
          else if (e.clientX < r.left + 40) el.scrollLeft -= 20;
        }}
      >
        {cols.map((c, i) => {
          const tasks = ctx.tasks.filter(
            (t) => !t.trashed && bucket(t, cols) === i,
          );
          return (
            <section
              className="ws-bucket"
              key={c.kind + c.value}
              data-period={c.kind + ":" + c.value}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => drop(e, ctx, (t) => ctx.move(t, c))}
            >
              <header>
                <h2>{c.title}</h2>
                <small>
                  {c.detail} · {tasks.length}
                </small>
              </header>
              <Quick ctx={ctx} period={c} />
              {[
                ["Scheduled", (t) => !!t.time && !t.done],
                ["To do", (t) => !t.time && !t.done],
                ["Done", (t) => t.done],
              ].map(
                ([name, match]) =>
                  tasks.some(match) && (
                    <section key={name}>
                      <h4>{name}</h4>
                      {tasks
                        .filter(match)
                        .sort((a, b) =>
                          (a.time || a.date || "").localeCompare(
                            b.time || b.date || "",
                          ),
                        )
                        .map((t) => (
                          <Task key={t.id} t={t} ctx={ctx} />
                        ))}
                    </section>
                  ),
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}
const priorities = ["Goal", "High", "Medium", "Low", "None"];
function List({ ctx, project }) {
  const [group, groupBy] = useState("Status"),
    [filter, filterBy] = useState("All"),
    [sort, sortBy] = useState("Planned date");
  const all = ctx.tasks.filter(
    (t) =>
      !t.trashed &&
      (project ? t.project === project.id : plan(t).kind === "unscheduled"),
  );
  const tasks = all
    .filter((t) => filter === "All" || (filter === "Done") === !!t.done)
    .sort((a, b) =>
      sort === "Title"
        ? a.title.localeCompare(b.title)
        : sort === "Priority"
          ? priorities.indexOf(a.priority) - priorities.indexOf(b.priority)
          : (plan(a).value || "~").localeCompare(plan(b).value || "~"),
    );
  const groups = Object.groupBy(tasks, (t) =>
    group === "Priority"
      ? t.priority
      : group === "Planned date"
        ? plan(t).value || plan(t).kind
        : t.done
          ? "Done"
          : "To do",
  );
  return (
    <section className="ws ws-list">
      {project && (
        <header className="ws-project">
          <div className="entity-identity">
            <Artwork
              entity={project}
              read={ctx.readPicture}
              change={(art) =>
                ctx.projectChange(project, {
                  art,
                  image: art?.kind === "image" ? art.value : "",
                })
              }
            />
            <InlineName
              value={project.name}
              label="Rename project"
              change={(name) => ctx.projectChange(project, { name })}
            />
          </div>
          <div className="project-property-row">
            <Popover>
              <PopoverTrigger asChild>
                <Btn label="Project folder">{project.folder || "Folder"}</Btn>
              </PopoverTrigger>
              <PopoverContent>
                <Input
                  aria-label="Folder name"
                  defaultValue={project.folder}
                  onBlur={(e) => {
                    if (e.target.value !== project.folder)
                      ctx.projectChange(project, {
                        folder: e.target.value.trim(),
                      });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Btn label="Project color">Color</Btn>
              </PopoverTrigger>
              <PopoverContent>
                <Input
                  aria-label="Choose project color"
                  type="color"
                  value={project.color || "#74669e"}
                  onChange={(e) =>
                    ctx.projectChange(project, { color: e.target.value })
                  }
                />
              </PopoverContent>
            </Popover>
            {[
              ["Stage", "stage", ["Inbox", "In progress", "Completed"]],
              ["Linked skill", "skill", ["", ...ctx.skills]],
            ].map(([label, field, options]) => (
              <DropdownMenu key={field}>
                <DropdownMenuTrigger asChild>
                  <Btn label={label}>{project[field] || label}</Btn>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {options.map((value) => (
                    <DropdownMenuItem
                      key={value}
                      onSelect={() =>
                        ctx.projectChange(project, { [field]: value })
                      }
                    >
                      {value || "No linked skill"}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
          </div>
          <span>
            {all.filter((t) => t.done).length} of {all.length} done
          </span>
        </header>
      )}
      <div className="ws-toolbar">
        {[
          ["Group", group, groupBy, ["Status", "Priority", "Planned date"]],
          ["Filter", filter, filterBy, ["All", "Open", "Done"]],
          ["Sort", sort, sortBy, ["Planned date", "Priority", "Title"]],
        ].map(([name, v, fn, opts]) => (
          <label key={name}>
            {name}{" "}
            <NativeSelect
              size="sm"
              aria-label={name}
              value={v}
              onChange={(e) => fn(e.target.value)}
            >
              {opts.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </NativeSelect>
          </label>
        ))}
      </div>
      <Quick ctx={ctx} period={empty} project={project?.id} />
      {Object.entries(groups).map(([g, ts]) => (
        <section key={g}>
          <h4>
            {g} · {ts.length}
          </h4>
          {ts.map((t) => (
            <Task key={t.id} t={t} ctx={ctx} />
          ))}
        </section>
      ))}
    </section>
  );
}
function externalFor(events, date) {
  const d = civil(date);
  d.setHours(0, 0, 0, 0);
  const next = new Date(d);
  next.setDate(d.getDate() + 1);
  const result = [];
  for (const e of events) {
    if (!e.start || !e.end) continue;
    if (e.start.length === 10) {
      if (e.start <= date && date < e.end) result.push({ ...e, allDay: true });
      continue;
    }
    const a = new Date(e.start),
      b = new Date(e.end);
    if (a >= next || b <= d) continue;
    const at = a < d ? 0 : a.getHours() * 60 + a.getMinutes(),
      until = b >= next ? 1440 : b.getHours() * 60 + b.getMinutes();
    result.push({ ...e, at, until: Math.max(at + 1, until) });
  }
  return result;
}
function Planner({ ctx }) {
  const [wallClock, tick] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => tick(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);
  const { date, days, hour } = ctx.prefs,
    scroll = useRef(null),
    [settings, showSettings] = useState(false);
  useLayoutEffect(() => {
    if (scroll.current) scroll.current.scrollTop = hour * 48;
  }, [hour]);
  const dates = Array.from({ length: days }, (_, i) => offset(date, i)),
    waiting = ctx.tasks.filter((t) => !t.done && !t.trashed && !t.time);
  function setDate(v) {
    ctx.pref({ date: v });
  }
  return (
    <section className="ws ws-planner">
      <div
        className="ws-pool"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => drop(e, ctx, (t) => ctx.move(t, empty))}
      >
        <h2>To schedule</h2>
        <Quick ctx={ctx} period={empty} />
        {waiting.map((t) => (
          <Task key={t.id} t={t} ctx={ctx} />
        ))}
        <small>Drop here to unschedule</small>
      </div>
      <section className="ws-timeline">
        <div className="ws-toolbar">
          <Btn
            label="Previous range"
            onClick={() => setDate(offset(date, -days))}
          >
            <ChevronLeft />
          </Btn>
          <DateJump value={date} set={setDate} />
          <Btn label="Next range" onClick={() => setDate(offset(date, days))}>
            <ChevronRight />
          </Btn>
          <Btn label="Today" onClick={() => setDate(key())}>
            Today
          </Btn>
          <NativeSelect
            size="sm"
            id="range"
            aria-label="Calendar range"
            value={days}
            onChange={(e) => ctx.pref({ days: Number(e.target.value) })}
          >
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "day" : "days"}
              </option>
            ))}
          </NativeSelect>
          <Popover open={settings} onOpenChange={showSettings}>
            <PopoverTrigger asChild>
              <Btn label="Calendar settings">
                <CalendarClock />
              </Btn>
            </PopoverTrigger>
            <PopoverContent>
              <label>
                Initial scroll hour{" "}
                <input
                  aria-label="Initial scroll hour"
                  type="number"
                  min="0"
                  max="23"
                  value={hour}
                  onChange={(e) =>
                    ctx.pref({
                      hour: Math.min(23, Math.max(0, Number(e.target.value))),
                    })
                  }
                />
              </label>
              <label>
                Week starts{" "}
                <NativeSelect
                  size="sm"
                  value={ctx.start}
                  onChange={(e) =>
                    ctx.pref({ weekStart: Number(e.target.value) })
                  }
                >
                  {[
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ].map((s, i) => (
                    <option key={s} value={i}>
                      {s}
                    </option>
                  ))}
                </NativeSelect>
              </label>
              <Btn label="Google calendars" onClick={ctx.calendars}>
                Google calendars
              </Btn>
            </PopoverContent>
          </Popover>
        </div>
        <div className="ws-scroll" ref={scroll}>
          <div className="ws-time-grid" style={{ "--days": days }}>
            <header>Local</header>
            {dates.map((d) => (
              <header
                key={d}
                data-date={d}
                className="ws-date-heading"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) =>
                  drop(e, ctx, (t) => ctx.move(t, { kind: "day", value: d }))
                }
              >
                {civil(d).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
                <div className="ws-date-items">
                  {ctx.tasks
                    .filter((t) => !t.trashed && !t.done && t.deadline === d)
                    .map((t) => (
                      <button
                        className="ws-date-chip"
                        key={"due:" + t.id}
                        title={"Deadline · " + t.title}
                        onClick={(e) => ctx.edit(t, e.currentTarget)}
                      >
                        Due · {t.title}
                      </button>
                    ))}
                  {ctx.tasks
                    .filter(
                      (t) => !t.trashed && !t.done && t.date === d && !t.time,
                    )
                    .map((t) => (
                      <button
                        className="ws-date-chip"
                        key={t.id}
                        data-task={t.id}
                        draggable
                        onDragStart={(e) =>
                          e.dataTransfer.setData("text/plain", t.id)
                        }
                        title={t.title}
                        onClick={(e) => ctx.edit(t, e.currentTarget)}
                      >
                        Planned · {t.title}
                      </button>
                    ))}
                </div>
                {externalFor(ctx.events, d)
                  .filter((e) => e.allDay)
                  .map((e) => (
                    <small key={e.uid}>{e.title}</small>
                  ))}
              </header>
            ))}
            <div className="ws-axis">
              {Array.from({ length: 24 }, (_, i) => (
                <time key={i}>{clock(i * 60)}</time>
              ))}
            </div>
            {dates.map((d) => {
              const ext = externalFor(ctx.events, d).filter((e) => !e.allDay);
              const items = ctx.tasks
                .filter((t) => t.date === d && t.time && !t.trashed)
                .map((t) => ({
                  t,
                  at: minute(t.time),
                  until: Math.min(1440, minute(t.time) + Number(t.minutes)),
                }));
              const now = wallClock;
              return (
                <div
                  className="ws-day"
                  key={d}
                  data-date={d}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const y =
                      e.clientY - e.currentTarget.getBoundingClientRect().top;
                    drop(e, ctx, (t) =>
                      ctx.move(
                        t,
                        { kind: "exact-time", value: d },
                        clock(
                          Math.min(1439, Math.max(0, Math.floor(y / 12) * 15)),
                        ),
                      ),
                    );
                  }}
                >
                  {d === key() && (
                    <div
                      className="ws-now"
                      style={{
                        top: (now.getHours() + now.getMinutes() / 60) * 48,
                      }}
                    />
                  )}
                  {lanes([...items, ...ext]).map(
                    ({ t, at, until, lane, width, ...ev }) => (
                      <div
                        key={t?.id || ev.uid}
                        data-task={t?.id}
                        draggable={!!t}
                        onDragStart={(e) =>
                          t && e.dataTransfer.setData("text/plain", t.id)
                        }
                        className={
                          "ws-block " + (t ? "time-block-task" : "external")
                        }
                        style={{
                          top: at * 0.8,
                          height: Math.max(12, (until - at) * 0.8),
                          left: (lane / width) * 100 + "%",
                          width: 100 / width + "%",
                          "--block-color":
                            (t
                              ? ctx.projects.find((p) => p.id === t.project)
                                  ?.color
                              : ev.color) || "var(--accent)",
                        }}
                        title={
                          (width > 1 ? "Overlaps · " : "") +
                          (t?.title || ev.title)
                        }
                      >
                        <button
                          disabled={!t}
                          onClick={(e) => ctx.edit(t, e.currentTarget)}
                        >
                          {t?.title || ev.title}
                          <small>
                            {clock(at)}
                            {width > 1 ? " · Overlap" : ""}
                          </small>
                        </button>
                        {t && (
                          <span
                            role="slider"
                            aria-label={"Resize " + t.title}
                            aria-valuemin={1}
                            aria-valuemax={1440 - at}
                            aria-valuenow={Number(t.minutes)}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (["ArrowUp", "ArrowDown"].includes(e.key)) {
                                e.preventDefault();
                                ctx.patch(t, {
                                  minutes: String(
                                    Math.max(
                                      1,
                                      Math.min(
                                        1440 - at,
                                        Number(t.minutes) +
                                          (e.key === "ArrowUp" ? -15 : 15),
                                      ),
                                    ),
                                  ),
                                });
                              }
                            }}
                            onPointerDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const handle = e.currentTarget,
                                y = e.clientY;
                              handle.setPointerCapture(e.pointerId);
                              const block = handle.parentElement;
                              const duration = (end) =>
                                Math.min(
                                  1440 - at,
                                  Math.max(
                                    1,
                                    Number(t.minutes) +
                                      Math.round((end - y) / 12) * 15,
                                  ),
                                );
                              handle.onpointermove = (ev) => {
                                block.style.height =
                                  duration(ev.clientY) * 0.8 + "px";
                              };
                              const clear = () => {
                                handle.onpointermove =
                                  handle.onpointerup =
                                  handle.onpointercancel =
                                    null;
                              };
                              handle.onpointercancel = () => {
                                clear();
                                block.style.height = (until - at) * 0.8 + "px";
                              };
                              handle.onpointerup = (ev) => {
                                clear();
                                ctx.patch(t, {
                                  minutes: String(duration(ev.clientY)),
                                });
                              };
                            }}
                          />
                        )}
                      </div>
                    ),
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </section>
  );
}
let root, host;
export function workspace(el, ctx) {
  if (host !== el) {
    root?.unmount();
    host = el;
    root = createRoot(el);
  }
  ctx.start = ctx.prefs.weekStart ?? localeWeek();
  root.render(
    ctx.view === "Planner" ? (
      <Planner ctx={ctx} />
    ) : ctx.view === "Upcoming" ? (
      <Upcoming ctx={ctx} />
    ) : (
      <List
        key={ctx.view}
        ctx={ctx}
        project={ctx.projects.find((p) => p.id === ctx.view)}
      />
    ),
  );
}
