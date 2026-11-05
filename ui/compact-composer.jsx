import { Identity } from "./entity-controls";
import React, { useRef, useState } from "react";
import { columns, key, localeWeek } from "./planning.mjs";
import { createRoot } from "react-dom/client";
import {
  CalendarDays,
  Folder,
  Flag,
  Ellipsis,
  Paperclip,
  Clock3,
  Repeat2,
  ListTodo,
  Text,
  Tags,
  MapPin,
  Link2,
  X,
  Check,
  Trash2,
  ChevronLeft,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import {
  NativeSelect,
  NativeSelectOption,
} from "./components/ui/native-select";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "./components/ui/popover";
import { Calendar } from "./components/ui/calendar";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "./components/ui/command";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "./components/ui/tooltip";
import { Field, FieldLabel } from "./components/ui/field";

export function Action({ label, children, ...props }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          {...props}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
export function Choices({
  items,
  choose,
  placeholder,
  selected,
  rank = false,
}) {
  const [query, setQuery] = useState("");
  const folders = Array.from(new Set(items.map((p) => p.folder || "")));
  const ordered = [...items]
    .filter((p) => p.id && p.uses)
    .sort((a, b) => b.uses - a.uses)
    .slice(0, 4);
  const recent = [...items]
    .filter((p) => p.id && p.lastUsed)
    .sort((a, b) => b.lastUsed - a.lastUsed)
    .slice(0, 4);
  const item = (p, group) => (
    <CommandItem
      key={p.id || "personal"}
      value={group + ":" + (p.id || "personal")}
      keywords={[p.name, p.folder || ""]}
      onSelect={() => choose(p.id)}
    >
      <Identity entity={p} />
      <span>{p.name}</span>
      {selected === p.id && <Check aria-label="Assigned" />}
    </CommandItem>
  );
  return (
    <Command>
      <CommandInput
        autoFocus
        aria-label={placeholder}
        placeholder={placeholder}
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No matches</CommandEmpty>
        {rank && !query && ordered.length > 0 && (
          <CommandGroup heading="Most used">
            {ordered.map((p) => item(p, "used"))}
          </CommandGroup>
        )}
        {rank && !query && recent.length > 0 && (
          <CommandGroup heading="Recent">
            {recent.map((p) => item(p, "recent"))}
          </CommandGroup>
        )}
        {folders.map((f) => (
          <CommandGroup key={f} heading={f || undefined}>
            {items
              .filter((p) => (p.folder || "") === f)
              .map((p) => item(p, "folder:" + f))}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  );
}
const options = [
  ["Schedule", Clock3],
  ["Deadline", CalendarDays],
  ["Repeat", Repeat2],
  ["Subtasks", ListTodo],
  ["Description", Text],
  ["Tags", Tags],
  ["Location", MapPin],
  ["Attachment", Paperclip],
];
function Composer({
  initial,
  weekStart,
  projects,
  anchor,
  editing,
  onCommit,
  onTrash,
  onClose,
  advance,
  onRefresh,
  canLock,
  taskId,
  focusChild,
  onDuplicate,
}) {
  const [draft, setDraft] = useState(initial),
    [panel, show] = useState(""),
    [error, fail] = useState(""),
    [busy, setBusy] = useState(false);
  const title = useRef(null),
    file = useRef(null),
    submitting = useRef(false);
  const latest = useRef(initial),
    dirty = useRef(false),
    queue = useRef(Promise.resolve());
  const update = (patch) => {
    latest.current = { ...latest.current, ...patch };
    dirty.current = true;
    setDraft(latest.current);
  };
  const set = (key, value) => update({ [key]: value });
  const persist = () => {
    if (!editing || !dirty.current) return queue.current;
    const snapshot = latest.current;
    if (
      !snapshot.title.trim() ||
      !Number.isFinite(+snapshot.minutes) ||
      +snapshot.minutes < 1 ||
      (snapshot.time && !snapshot.date)
    ) {
      fail("Use a title, positive duration, and a date for any start time.");
      return Promise.resolve(false);
    }
    dirty.current = false;
    queue.current = queue.current
      .catch(() => {})
      .then(() => onCommit(snapshot))
      .then(
        () => {
          fail("");
          return true;
        },
        (err) => {
          dirty.current = true;
          fail(err.message);
          return false;
        },
      );
    return queue.current;
  };
  const close = async () => {
    if ((await persist()) === false) return;
    onClose();
    onRefresh?.();
  };
  const [subTitle, setSubTitle] = useState("");
  const children = draft.childRows || [];
  const setChildren = (rows) => {
    update({ childRows: rows });
    void persist();
  };
  const addSubtask = () => {
    if (subTitle.trim()) {
      setChildren([
        ...children,
        { id: crypto.randomUUID(), title: subTitle.trim(), done: false },
      ]);
      setSubTitle("");
    }
  };
  const togglePanel = (name) => {
    if (name === "Lock") {
      set("lockOverride", draft.lockOverride === false);
      void persist();
      return;
    }
    show(panel === name ? "" : name);
  };
  const choose = (key, v) => {
    set(key, v);
    void persist();
    show("");
    title.current?.focus();
  };
  const project = projects.find((p) => p.id === draft.project);
  async function submit(e) {
    e.preventDefault();
    if (submitting.current) return;
    if (!draft.title.trim()) {
      fail("Enter a task title.");
      title.current?.focus();
      return;
    }
    submitting.current = true;
    setBusy(true);
    try {
      await onCommit(draft);
      onClose();
    } catch (err) {
      fail(err.message);
      setBusy(false);
      submitting.current = false;
    }
  }
  const labelInput = (name, key, props = {}) => (
    <Field>
      <FieldLabel htmlFor={"task-" + key}>{name}</FieldLabel>
      <Input
        id={"task-" + key}
        value={draft[key]}
        onChange={(e) => set(key, e.target.value)}
        onBlur={persist}
        {...props}
      />
    </Field>
  );
  return (
    <TooltipProvider>
      <Popover
        open
        onOpenChange={(open) => {
          if (!open && !busy) void close();
        }}
      >
        <PopoverAnchor virtualRef={{ current: anchor }} />
        <PopoverContent
          className={"task-composer" + (editing ? " task-detail" : "")}
          aria-label={editing ? "Edit task" : "New task"}
          align="start"
          sideOffset={5}
          collisionPadding={10}
          onKeyDown={(event) => {
            if (
              !editing ||
              event.target.closest(
                "input,textarea,select,[contenteditable=true]",
              )
            )
              return;
            const field =
              event.key === "#"
                ? "Project"
                : event.key === "<"
                  ? "Deadline"
                  : (event.ctrlKey || event.metaKey) && event.key === "="
                    ? "Duration"
                    : "";
            if (field) {
              event.preventDefault();
              show(field);
            }
          }}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            const fields = Array.from(
              document.querySelectorAll(".task-subtask input"),
            );
            (focusChild
              ? fields.find(
                  (el) =>
                    el.getAttribute("aria-label") ===
                    "Rename subtask " + focusChild,
                ) || title.current
              : title.current
            )?.focus();
          }}
          onEscapeKeyDown={(e) => {
            if (panel) {
              e.preventDefault();
              show("");
              title.current?.focus();
            }
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            const keyed = anchor.dataset?.act && anchor.dataset?.key;
            const replacement = keyed
              ? document.querySelector(
                  `[data-act="${CSS.escape(anchor.dataset.act)}"][data-key="${CSS.escape(keyed)}"]`,
                )
              : null;
            (anchor.isConnected
              ? anchor
              : replacement || document.querySelector('[data-act="add"]')
            )?.focus?.({ preventScroll: true });
          }}
        >
          <form
            onSubmit={
              editing
                ? (e) => {
                    e.preventDefault();
                    void persist();
                  }
                : submit
            }
          >
            <div className="composer-top">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                aria-label="Pick planned date"
                onClick={() => show(panel === "Date" ? "" : "Date")}
              >
                <CalendarDays />
                {draft.date
                  ? new Date(draft.date + "T12:00").toLocaleDateString(
                      undefined,
                      { month: "short", day: "numeric" },
                    )
                  : draft.period?.kind === "someday"
                    ? "Someday"
                    : draft.period?.kind === "week"
                      ? "Week of " + draft.period.value
                      : draft.period?.kind === "month"
                        ? draft.period.value
                        : "No date"}
              </Button>
              {editing &&
                [
                  ["Time", draft.time || "Time"],
                  ["Duration", draft.minutes + "m"],
                  ["Repeat", draft.repeat === "None" ? "Repeat" : draft.repeat],
                  ["Deadline", "Deadline"],
                  ...(canLock
                    ? [
                        [
                          "Lock",
                          draft.lockOverride === false ? "Unlocked" : "Lock",
                        ],
                      ]
                    : []),
                ].map(([name, label]) => (
                  <Button
                    key={name}
                    type="button"
                    size="sm"
                    variant="secondary"
                    aria-label={name}
                    onClick={() => togglePanel(name)}
                  >
                    {label}
                  </Button>
                ))}
              <Action
                label={"Priority: " + draft.priority}
                data-priority={draft.priority}
                onClick={() => show(panel === "Priority" ? "" : "Priority")}
              >
                <Flag />
              </Action>
              <Action label="Dismiss composer" onClick={close}>
                <X />
              </Action>
            </div>
            <div className="task-detail-body">
              <section className="task-detail-main">
                <div className="composer-title">
                  {editing && (
                    <input
                      type="checkbox"
                      aria-label="Complete task"
                      checked={draft.completed}
                      onChange={(e) => {
                        set("completed", e.target.checked);
                        void persist();
                      }}
                    />
                  )}
                  <Input
                    ref={title}
                    aria-label="Title"
                    placeholder="What needs to be done?"
                    value={draft.title}
                    onChange={(e) => set("title", e.target.value)}
                    onBlur={persist}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                        e.preventDefault();
                        if (editing) void persist();
                        else submit(e);
                      }
                    }}
                  />
                </div>
                {editing && (
                  <Textarea
                    className="task-description"
                    aria-label="Description"
                    placeholder="Add a description"
                    value={draft.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    onBlur={persist}
                  />
                )}
                <div className="composer-tools">
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    aria-label="Choose project"
                    onClick={() => show(panel === "Project" ? "" : "Project")}
                  >
                    <Identity entity={project} />
                    <span>{project?.name || "Personal"}</span>
                  </Button>
                  {editing &&
                    [
                      ["Tags", Tags],
                      ["Links", Link2],
                      ["Attachment", Paperclip],
                      ["Location", MapPin],
                    ].map(([name, Icon]) => (
                      <Action
                        key={name}
                        label={name}
                        onClick={() => togglePanel(name)}
                      >
                        <Icon />
                      </Action>
                    ))}
                  <Action
                    label="More task options"
                    onClick={() => show(panel === "More" ? "" : "More")}
                  >
                    <Ellipsis />
                  </Action>
                  {!editing && (
                    <Button size="sm" disabled={busy} type="submit">
                      Create
                    </Button>
                  )}
                </div>
                {panel && (
                  <div className="composer-detail">
                    {panel === "Date" && (
                      <>
                        <Calendar
                          mode="single"
                          defaultMonth={
                            draft.date
                              ? new Date(draft.date + "T12:00")
                              : undefined
                          }
                          selected={
                            draft.date
                              ? new Date(draft.date + "T12:00")
                              : undefined
                          }
                          onSelect={(d) =>
                            choose(
                              "date",
                              d
                                ? [
                                    d.getFullYear(),
                                    String(d.getMonth() + 1).padStart(2, "0"),
                                    String(d.getDate()).padStart(2, "0"),
                                  ].join("-")
                                : "",
                            )
                          }
                        />
                        <div className="compact-choices">
                          {[
                            ...columns(
                              "Overview",
                              key(),
                              weekStart ?? localeWeek(),
                            ).filter((p) => p.kind !== "day"),
                            { kind: "unscheduled", title: "Inbox", value: "" },
                          ].map((p) => (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              key={p.title}
                              onClick={() => {
                                update({
                                  date: "",
                                  time: "",
                                  period: { kind: p.kind, value: p.value },
                                });
                                void persist();
                                show("");
                                title.current?.focus();
                              }}
                            >
                              {p.title}
                            </Button>
                          ))}
                        </div>
                      </>
                    )}
                    {panel === "Project" && (
                      <Choices
                        placeholder="Find project"
                        rank
                        selected={draft.project}
                        items={[{ id: "", name: "Personal" }, ...projects]}
                        choose={(id) => choose("project", id)}
                      />
                    )}
                    {panel === "Priority" && (
                      <div className="compact-choices">
                        {["None", "Low", "Medium", "High", "Goal"].map((v) => (
                          <Button
                            type="button"
                            size="sm"
                            variant={
                              v === draft.priority ? "secondary" : "ghost"
                            }
                            key={v}
                            data-priority={v}
                            onClick={() => choose("priority", v)}
                          >
                            <Flag />
                            {v}
                          </Button>
                        ))}
                      </div>
                    )}
                    {panel === "More" && (
                      <div className="option-grid">
                        {(editing ? [] : options).map(([name, Icon]) => (
                          <Button
                            key={name}
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => show(name)}
                          >
                            <Icon />
                            {name}
                          </Button>
                        ))}
                        {editing && (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                if ((await persist()) !== false) {
                                  onDuplicate();
                                  onClose();
                                  onRefresh?.();
                                }
                              }}
                            >
                              Duplicate task
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(taskId);
                                  show("");
                                } catch {
                                  fail("Clipboard is unavailable");
                                }
                              }}
                            >
                              Copy task ID
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              aria-pressed={!!draft.completed}
                              onClick={() => set("completed", !draft.completed)}
                            >
                              <Check />
                              {draft.completed ? "Completed" : "Mark complete"}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                onTrash();
                                onClose();
                              }}
                            >
                              <Trash2 />
                              {initial.trashed ? "Restore" : "Trash"}
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                    {(options.some(([name]) => name === panel) ||
                      ["Time", "Duration", "Links"].includes(panel)) && (
                      <>
                        {!editing && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => show("More")}
                          >
                            <ChevronLeft />
                            {panel}
                          </Button>
                        )}
                        {panel === "Time" &&
                          labelInput("Start time", "time", { type: "time" })}
                        {panel === "Duration" && (
                          <>
                            {[15, 25, 30, 45, 60, 90].map((n) => (
                              <Button
                                key={n}
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => choose("minutes", String(n))}
                              >
                                {n}m
                              </Button>
                            ))}
                            {labelInput("Duration (minutes)", "minutes", {
                              type: "number",
                              min: 1,
                            })}
                          </>
                        )}
                        {panel === "Links" &&
                          labelInput("Link", "link", { type: "url" })}
                        {panel === "Schedule" && (
                          <div className="compact-pair">
                            {labelInput("Start time", "time", { type: "time" })}
                            {labelInput("Duration (minutes)", "minutes", {
                              type: "number",
                              min: 1,
                              step: "1",
                            })}
                          </div>
                        )}
                        {panel === "Repeat" && (
                          <>
                            <Field>
                              <FieldLabel htmlFor="repeat-rule">
                                Repeat
                              </FieldLabel>
                              <NativeSelect
                                id="repeat-rule"
                                value={draft.repeat}
                                onChange={(e) => {
                                  set("repeat", e.target.value);
                                  void persist();
                                }}
                              >
                                {[
                                  "None",
                                  "Daily",
                                  "Weekdays",
                                  "Weekly",
                                  "Monthly",
                                ].map((v) => (
                                  <NativeSelectOption key={v}>
                                    {v}
                                  </NativeSelectOption>
                                ))}
                              </NativeSelect>
                            </Field>
                            {editing && (
                              <Field>
                                <FieldLabel htmlFor="edit-scope">
                                  Apply edits to
                                </FieldLabel>
                                <NativeSelect
                                  id="edit-scope"
                                  value={draft.scope}
                                  onChange={(e) => set("scope", e.target.value)}
                                >
                                  <NativeSelectOption value="one">
                                    This occurrence
                                  </NativeSelectOption>
                                  <NativeSelectOption value="series">
                                    This and following occurrences
                                  </NativeSelectOption>
                                </NativeSelect>
                              </Field>
                            )}
                            {draft.date && draft.repeat !== "None" && (
                              <small>
                                Next occurrence ·{" "}
                                {advance(draft.date, draft.repeat)}
                              </small>
                            )}
                          </>
                        )}
                        {["Subtasks", "Description"].includes(panel) && (
                          <Textarea
                            aria-label={panel}
                            placeholder={
                              panel === "Subtasks"
                                ? "One subtask per line"
                                : "Add a description"
                            }
                            value={
                              draft[panel === "Subtasks" ? "children" : "notes"]
                            }
                            onChange={(e) =>
                              set(
                                panel === "Subtasks" ? "children" : "notes",
                                e.target.value,
                              )
                            }
                          />
                        )}
                        {panel === "Deadline" &&
                          labelInput("Deadline", "deadline", { type: "date" })}
                        {panel === "Tags" && labelInput("Tags", "tags")}
                        {panel === "Location" &&
                          labelInput("Location", "location")}
                        {panel === "Attachment" && (
                          <div className="file-tools">
                            <input
                              ref={file}
                              type="file"
                              aria-label="Attach file"
                              hidden
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f?.size > 1000000) {
                                  fail("Choose a file under 1 MB");
                                  e.target.value = "";
                                  return;
                                }
                                fail("");
                                set("attachment", f);
                                set("removeFile", false);
                                void persist();
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => file.current.click()}
                            >
                              <Paperclip />
                              Choose file
                            </Button>
                            {draft.attachment?.name ||
                              (!draft.removeFile && initial.file && (
                                <a
                                  download={initial.file.name}
                                  href={initial.file.data}
                                >
                                  {initial.file.name}
                                </a>
                              ))}
                            {(draft.attachment ||
                              (!draft.removeFile && initial.file)) && (
                              <Action
                                label="Remove attachment"
                                onClick={() => {
                                  set("attachment", undefined);
                                  set("removeFile", true);
                                  void persist();
                                }}
                              >
                                <X />
                              </Action>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                {error && <p role="alert">{error}</p>}
              </section>
              {editing && (
                <aside className="task-subtasks">
                  <header>
                    <strong>Subtasks</strong>
                    <small>
                      {children.filter((c) => c.done).length}/{children.length}
                    </small>
                  </header>
                  <div className="task-subtask">
                    <Input
                      aria-label="New subtask"
                      placeholder="Add subtask"
                      value={subTitle}
                      onChange={(e) => setSubTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSubtask();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={addSubtask}
                    >
                      Add
                    </Button>
                  </div>
                  {children.map((child, i) => (
                    <div className="task-subtask" key={child.id || i}>
                      <input
                        type="checkbox"
                        aria-label={"Complete subtask " + child.title}
                        checked={child.done}
                        onChange={(e) =>
                          setChildren(
                            children.map((c, k) =>
                              k === i ? { ...c, done: e.target.checked } : c,
                            ),
                          )
                        }
                      />
                      <Input
                        key={child.title}
                        defaultValue={child.title}
                        aria-label={"Rename subtask " + child.title}
                        onBlur={(e) => {
                          if (
                            e.target.value.trim() &&
                            e.target.value.trim() !== child.title
                          )
                            setChildren(
                              children.map((c, k) =>
                                k === i
                                  ? { ...c, title: e.target.value.trim() }
                                  : c,
                              ),
                            );
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.currentTarget.blur();
                          }
                          if (e.key === "Escape") {
                            e.stopPropagation();
                            e.currentTarget.value = child.title;
                            e.currentTarget.blur();
                          }
                        }}
                      />
                      <Action
                        label={"Remove subtask " + child.title}
                        onClick={() =>
                          setChildren(children.filter((_, k) => i !== k))
                        }
                      >
                        <X />
                      </Action>
                    </div>
                  ))}
                </aside>
              )}
            </div>
          </form>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
let root,
  sequence = 0;
export function openComposer(props) {
  if (!root) {
    const el = document.createElement("div");
    document.body.append(el);
    root = createRoot(el);
  }
  const current = ++sequence;
  root.render(
    <Composer
      key={current}
      {...props}
      onClose={() => {
        if (current === sequence) root.render(null);
      }}
    />,
  );
}

export function openProjectPicker({ anchor, projects, selected, choose }) {
  ++sequence;
  if (!root) {
    const el = document.createElement("div");
    document.body.append(el);
    root = createRoot(el);
  }
  const close = () => root.render(null);
  root.render(
    <Popover
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <PopoverAnchor virtualRef={{ current: anchor }} />
      <PopoverContent
        className="entity-picker"
        align="start"
        aria-label="Assign project"
      >
        <Choices
          rank
          placeholder="Find project"
          items={[{ id: "", name: "Personal" }, ...projects]}
          selected={selected}
          choose={(id) => {
            close();
            choose(id);
          }}
        />
      </PopoverContent>
    </Popover>,
  );
}
