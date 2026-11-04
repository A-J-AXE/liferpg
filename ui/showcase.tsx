import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3,
  Command as CommandIcon, Focus, Keyboard, MoreHorizontal, Pause,
  Play, Plus, RotateCcw, Search, SlidersHorizontal, Sparkles, X,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Calendar } from "./components/ui/calendar";
import { Input } from "./components/ui/input";
import { TooltipProvider } from "./components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "./components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./components/ui/dialog";
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "./components/ui/command";
import { Tabs, TabsList, TabsTrigger } from "./components/ui/tabs";
import { IconAction, LifeOSTaskRow, ExperienceMeter, PaneHeading, ShortcutKey, type LifeOSTask, type LifeOSPriority } from "./lifeos-primitives";

const initial: LifeOSTask[] = [
  { id: "sample-a", title: "Calibrate wrist joint", project: "Robotics", minutes: 30, priority: "High", done: false },
  { id: "sample-b", title: "Review landing sequence", project: "Drone landing", minutes: 45, priority: "Medium", done: false },
  { id: "sample-c", title: "Write test notes", project: "Research", minutes: 20, priority: "None", done: false },
];
const iso = (date: Date) =>
  [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
const plusDays = (date: Date, offset: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + offset);
  return next;
};

function Showcase() {
  const [tasks, setTasks] = React.useState<LifeOSTask[]>(initial);
  const [newTitle, setNewTitle] = React.useState("");
  const [mode, setMode] = React.useState("Planner");
  const [visibleDays, setVisibleDays] = React.useState(3);
  const [anchor, setAnchor] = React.useState(new Date());
  const [calendarOpen, openCalendar] = React.useState(false);
  const [target, setTarget] = React.useState<string | null>(null);
  const [commands, setCommands] = React.useState(false);
  const [editing, setEditing] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");
  const [notification, notify] = React.useState("Click a row, menu, or checkbox to inspect a real state change.");
  const [timerMode, setTimerMode] = React.useState<"Focus" | "Break">("Focus");
  const [left, setLeft] = React.useState(1500);
  const [end, setEnd] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!end) return;
    const update = () => setLeft(Math.max(0, Math.ceil((end - Date.now()) / 1000)));
    update();
    const tick = window.setInterval(update, 500);
    return () => window.clearInterval(tick);
  }, [end]);

  React.useEffect(() => {
    if (left === 0 && end) {
      setEnd(null);
      notify(timerMode + " session completed.");
    }
  }, [end, left, timerMode]);

  const current = tasks.find((task) => task.id === editing);
  const completed = tasks.filter((task) => task.done).length;
  const xp = 35 + completed * 25;
  const coins = 12 + completed * 4;
  const first = iso(anchor);
  const endDate = iso(plusDays(anchor, visibleDays - 1));
  const clock = (seconds: number) =>
    String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");

  function toggle(id: string) {
    const task = tasks.find((entry) => entry.id === id);
    setTasks((items) => items.map((entry) => entry.id === id ? { ...entry, done: !entry.done } : entry));
    notify(task?.done ? "Completion undone · -25 XP / -4 coins" : "Task completed · +25 XP / +4 coins");
  }
  function edit(id: string) {
    const task = tasks.find((entry) => entry.id === id);
    if (!task) return;
    setEditing(id);
    setDraft(task.title);
  }
  function schedule(id: string) {
    setTarget(id);
    openCalendar(true);
  }
  function setPriority(id: string, priority: LifeOSPriority) {
    setTasks((items) => items.map((entry) => entry.id === id ? { ...entry, priority } : entry));
    notify("Priority updated to " + priority);
  }
  function remove(id: string) {
    setTasks((items) => items.filter((entry) => entry.id !== id));
    notify("Sample task removed.");
  }
  function pickDate(selected?: Date) {
    if (selected && target) {
      setTasks((items) => items.map((entry) => entry.id === target ? { ...entry, date: iso(selected) } : entry));
      notify("Task scheduled for " + selected.toLocaleDateString());
    } else if (selected) {
      setAnchor(selected);
      notify("Calendar moved to " + selected.toLocaleDateString());
    }
    openCalendar(false);
    setTarget(null);
  }
  function addTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setTasks((items) => [...items, {
      id: crypto.randomUUID(), title, project: "Personal", minutes: 30, priority: "None", done: false,
    }]);
    setNewTitle("");
    notify("Task captured in the design playground.");
  }
  function toggleFocus() {
    if (end) {
      setLeft(Math.max(0, Math.ceil((end - Date.now()) / 1000)));
      setEnd(null);
      notify("Focus session paused.");
    } else {
      const seconds = left > 0 ? left : timerMode === "Focus" ? 1500 : 300;
      setLeft(seconds);
      setEnd(Date.now() + seconds * 1000);
      notify("Focus session started.");
    }
  }
  function changeTimer(mode: "Focus" | "Break") {
    setTimerMode(mode);
    setEnd(null);
    setLeft(mode === "Focus" ? 1500 : 300);
    notify(mode + " timer ready.");
  }
  function moveTask(id: string, date: string) {
    setTasks((items) => items.map((entry) => entry.id === id ? { ...entry, date } : entry));
    notify("Task moved to " + date);
  }
  const selected = initial.find((entry) => entry.id === target) || tasks.find((entry) => entry.id === target);
  return (
    <TooltipProvider delayDuration={180}>
      <div className="lo-showcase">
        <div className="lo-lab-head">
          <div>
            <span className="lo-eyebrow">LIFEOS · INTERACTION LAB</span>
            <h1>Desktop design system</h1>
            <p>Compact controls, real local interactions and one shared visual language.</p>
          </div>
          <div className="lo-lab-tools">
            <Button variant="outline" size="sm" onClick={() => setCommands(true)}>
              <Search size={14} aria-hidden /> Commands <ShortcutKey>Ctrl K</ShortcutKey>
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              setTasks(initial);setLeft(1500);setEnd(null);setTimerMode("Focus");
              notify("Playground state reset.");
            }}>
              <RotateCcw size={14} aria-hidden /> Reset demo
            </Button>
          </div>
        </div>

        <div className="lo-lab-cols">
          <section className="lo-demo-pane" aria-label="Planning component examples">
            <PaneHeading title="Planning desk" subtitle="Keyboard-first · compact tasks" actions={
              <>
                <IconAction label="Previous day" icon={ChevronLeft} onClick={() => setAnchor((date) => plusDays(date, -1))} />
                <Popover open={calendarOpen} onOpenChange={(open) => { openCalendar(open); if (!open) setTarget(null); }}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="lo-date-button">
                      <CalendarDays size={14} aria-hidden /> {first}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={anchor} onSelect={(day) => pickDate(day)} />
                    {target && <p className="lo-popover-note">Schedule {selected?.title || "task"}</p>}
                  </PopoverContent>
                </Popover>
                <IconAction label="Next day" icon={ChevronRight} onClick={() => setAnchor((date) => plusDays(date, 1))} />
              </>
            } />

            <div className="lo-demo-controls">
              <Tabs value={mode} onValueChange={setMode}>
                <TabsList aria-label="Sample workspace">
                  <TabsTrigger value="Planner">Planner</TabsTrigger>
                  <TabsTrigger value="Upcoming">Upcoming</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="lo-view-tools">
                <label className="lo-day-select-label" htmlFor="demo-days">Days</label>
                <select id="demo-days" value={visibleDays} onChange={(event) => setVisibleDays(Number(event.target.value))}>
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => <option key={day} value={day}>{day}</option>)}
                </select>
                <IconAction label="Reset to today" icon={RotateCcw} onClick={() => setAnchor(new Date())} />
              </div>
            </div>

            <div className="lo-queue-head">
              <span>TO SCHEDULE</span><span>{tasks.filter((task) => !task.done).length} open</span>
            </div>
            <form className="lo-quick-capture" onSubmit={addTask}>
              <Plus size={16} aria-hidden />
              <label className="sr-only" htmlFor="design-quick-add">New task</label>
              <Input id="design-quick-add" value={newTitle} onChange={(event) => setNewTitle(event.target.value)}
                placeholder="Add task… press Enter" maxLength={300} />
              <ShortcutKey>↵</ShortcutKey>
            </form>
            <div className="lo-task-list">
              {tasks.length ? tasks.map((task) => (
                <div key={task.id} draggable
                  onDragStart={(event) => event.dataTransfer.setData("text/plain", task.id)}>
                  <LifeOSTaskRow task={task} onToggle={toggle} onEdit={edit} onSchedule={schedule}
                    onPriority={setPriority} onRemove={remove} />
                </div>
              )) : <p className="lo-blank">No tasks. Capture one above.</p>}
            </div>

            <div className="lo-queue-head lo-lanes-label">
              <span>{mode === "Planner" ? "DAY PLANNING PREVIEW" : "UPCOMING TASK BUCKETS"}</span>
              <span>Drag a task into a column</span>
            </div>
            <div className="lo-lane-scroll">
              <div className="lo-lanes" style={{ "--lo-days": visibleDays } as React.CSSProperties}>
                {Array.from({ length: visibleDays }, (_, index) => {
                  const slot = iso(plusDays(anchor, index));
                  const scheduled = tasks.filter((task) => task.date === slot);
                  return (
                    <div className="lo-lane" key={slot} data-date={slot}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        const id = event.dataTransfer.getData("text/plain");
                        if (tasks.some((task) => task.id === id)) moveTask(id, slot);
                      }}>
                      <div className="lo-lane-cap">
                        <strong>{plusDays(anchor, index).toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}</strong>
                        <span>{scheduled.length}</span>
                      </div>
                      {scheduled.map((task) => (
                        <button key={task.id} type="button" className="lo-mini-block"
                          title={"Edit " + task.title} onClick={() => edit(task.id)}>
                          <span>{task.title}</span><small>{task.minutes}m</small>
                        </button>
                      ))}
                      {!scheduled.length && <div className="lo-drop-hint">Drop here</div>}
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="lo-lab-caption">Isolated component preview. Production tasks and rewards are not modified.</p>
          </section>

          <div className="lo-demo-side" role="complementary" aria-label="Focus and progression components">
            <section className="lo-focus-preview">
              <PaneHeading title="Focus" actions={<IconAction label="Reset demo focus session" icon={RotateCcw}
                onClick={() => {setEnd(null);setLeft(timerMode === "Focus" ? 1500 : 300);notify("Timer reset.");}} />} />
              <div className="lo-focus-mode" role="group" aria-label="Focus mode">
                <Button size="xs" variant={timerMode === "Focus" ? "secondary" : "ghost"} onClick={() => changeTimer("Focus")}>Focus</Button>
                <Button size="xs" variant={timerMode === "Break" ? "secondary" : "ghost"} onClick={() => changeTimer("Break")}>Break</Button>
              </div>
              <div className="lo-focus-time" aria-live="off">{clock(left)}</div>
              <div className="lo-focus-actions">
                <Button onClick={toggleFocus} className="lo-focus-primary">
                  {end ? <Pause size={15} aria-hidden /> : <Play size={15} aria-hidden />}
                  {end ? "Pause" : "Start"}
                </Button>
                <span><Clock3 size={13} aria-hidden /> {timerMode === "Focus" ? "25 min session" : "5 min break"}</span>
              </div>
            </section>
            <section className="lo-rewards-preview">
              <PaneHeading title="Progress" subtitle="Live preview values" actions={<Sparkles size={15} aria-hidden />} />
              <div className="lo-reward-numbers">
                <div><span>XP earned</span><strong key={"xp-" + xp} className="lo-gain">{xp}</strong></div>
                <div><span>Coins</span><strong key={"coin-" + coins} className="lo-gain">{coins}</strong></div>
                <div><span>Completed</span><strong>{completed} / {tasks.length}</strong></div>
              </div>
              <ExperienceMeter label="Robotics level" value={xp} goal={100} />
              <p className="lo-reward-help">Completing a demo task grants +25 XP and +4 coins. Undo subtracts both.</p>
            </section>
            <section className="lo-system-preview">
              <PaneHeading title="System states" subtitle="Tokens and keyboard affordances" />
              <div className="lo-token-list">
                <span><i className="lo-token-dot" data-kind="accent" /> Accent</span>
                <span><i className="lo-token-dot" data-kind="neutral" /> Neutral</span>
                <span><i className="lo-token-dot" data-kind="high" /> Priority</span>
                <span><i className="lo-token-dot" data-kind="xp" /> XP</span>
              </div>
              <div className="lo-keyboard-line">
                <Keyboard size={14} aria-hidden /><span>Command search</span><ShortcutKey>Ctrl K</ShortcutKey>
              </div>
              <Button variant="outline" size="sm" className="lo-secondary-action" onClick={() => setCommands(true)}>
                <CommandIcon size={14} aria-hidden /> Try command palette
              </Button>
            </section>
          </div>
        </div>

        <div className="lo-lab-toast" role="status" aria-live="polite"><CheckCircle2 size={14} aria-hidden /> {notification}</div>

        <Dialog open={Boolean(editing)} onOpenChange={(open) => { if (!open) setEditing(null); }}>
          <DialogContent className="lo-edit-dialog">
            <DialogHeader>
              <DialogTitle>Edit sample task</DialogTitle>
              <DialogDescription>Change the local preview only.</DialogDescription>
            </DialogHeader>
            <form onSubmit={(event) => {
              event.preventDefault();
              if (editing && draft.trim()) {
                setTasks((items) => items.map((task) => task.id === editing ? { ...task, title: draft.trim() } : task));
                setEditing(null);
                notify("Sample task updated.");
              }
            }}>
              <label className="lo-form-label" htmlFor="lo-edit-name">Task name</label>
              <Input id="lo-edit-name" value={draft} onChange={(event) => setDraft(event.target.value)} required maxLength={300} autoFocus />
              <DialogFooter className="lo-dialog-actions">
                <Button variant="ghost" type="button" onClick={() => setEditing(null)}><X size={14} aria-hidden /> Cancel</Button>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <CommandDialog open={commands} onOpenChange={setCommands} title="LifeOS design lab commands"
          description="Search actions for this interactive component preview.">
          <CommandInput placeholder="Search commands" />
          <CommandList>
            <CommandEmpty>No matching commands</CommandEmpty>
            <CommandGroup heading="Workspaces">
              {(["Planner", "Upcoming"] as const).map((next) => (
                <CommandItem key={next} value={"Open " + next} onSelect={() => {setMode(next);setCommands(false);}}>
                  <Focus size={14} aria-hidden /> Open {next}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Actions">
              <CommandItem value="Add a task" onSelect={() => {
                setCommands(false);
                requestAnimationFrame(() => document.getElementById("design-quick-add")?.focus());
              }}><Plus size={14} aria-hidden /> Add a task</CommandItem>
              <CommandItem value="Start or pause focus" onSelect={() => {toggleFocus();setCommands(false);}}>
                <Play size={14} aria-hidden /> {end ? "Pause focus" : "Start focus"}
              </CommandItem>
              <CommandItem value="Reset demo" onSelect={() => {
                setTasks(initial);setCommands(false);notify("Playground state reset.");
              }}><RotateCcw size={14} aria-hidden /> Reset task examples</CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
    </TooltipProvider>
  );
}

class ShowcaseElement extends HTMLElement {
  root?: Root;
  connectedCallback() {
    this.root = createRoot(this);
    this.root.render(<Showcase />);
  }
  disconnectedCallback() {
    this.root?.unmount();
  }
}
if (!customElements.get("lifeos-showcase")) customElements.define("lifeos-showcase", ShowcaseElement);
