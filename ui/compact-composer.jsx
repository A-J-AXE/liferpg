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
export function Choices({ items, choose, placeholder }) {
  return (
    <Command>
      <CommandInput aria-label={placeholder} placeholder={placeholder} />
      <CommandList>
        <CommandEmpty>No matches</CommandEmpty>
        <CommandGroup>
          {items.map((item) => (
            <CommandItem
              key={item.id}
              value={item.id || "unassigned"}
              keywords={[item.name]}
              onSelect={() => choose(item.id)}
            >
              {item.image && <img className="thumb" alt="" src={item.image} />}{" "}
              {item.name}
            </CommandItem>
          ))}
        </CommandGroup>
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
}) {
  const [draft, setDraft] = useState(initial),
    [panel, show] = useState(""),
    [error, fail] = useState(""),
    [busy, setBusy] = useState(false);
  const title = useRef(null),
    file = useRef(null),
    submitting = useRef(false);
  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const choose = (key, v) => {
    set(key, v);
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
        {...props}
      />
    </Field>
  );
  return (
    <TooltipProvider>
      <Popover
        open
        onOpenChange={(open) => {
          if (!open && !busy) onClose();
        }}
      >
        <PopoverAnchor virtualRef={{ current: anchor }} />
        <PopoverContent
          className="task-composer"
          aria-label={editing ? "Edit task" : "New task"}
          align="start"
          sideOffset={5}
          collisionPadding={10}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            title.current?.focus();
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
          <form onSubmit={submit}>
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
              <Action
                label={"Priority: " + draft.priority}
                data-priority={draft.priority}
                onClick={() => show(panel === "Priority" ? "" : "Priority")}
              >
                <Flag />
              </Action>
              <Action label="Dismiss composer" onClick={onClose}>
                <X />
              </Action>
            </div>
            <div className="composer-title">
              <Input
                ref={title}
                aria-label="Title"
                placeholder="What needs to be done?"
                value={draft.title}
                onChange={(e) => set("title", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    submit(e);
                  }
                }}
              />
            </div>
            <div className="composer-tools">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                aria-label="Choose project"
                onClick={() => show(panel === "Project" ? "" : "Project")}
              >
                {project?.image ? (
                  <img className="thumb" alt="" src={project.image} />
                ) : (
                  <Folder />
                )}
                <span>{project?.name || "Personal"}</span>
              </Button>
              <Action
                label="More task options"
                onClick={() => show(panel === "More" ? "" : "More")}
              >
                <Ellipsis />
              </Action>
              <Button size="sm" disabled={busy} type="submit">
                {editing ? "Apply" : "Create"}
              </Button>
            </div>
            {panel && (
              <div className="composer-detail">
                {panel === "Date" && (
                  <>
                    <Calendar
                      mode="single"
                      defaultMonth={
                        draft.date ? new Date(draft.date + "T12:00") : undefined
                      }
                      selected={
                        draft.date ? new Date(draft.date + "T12:00") : undefined
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
                            setDraft((d) => ({
                              ...d,
                              date: "",
                              time: "",
                              period: { kind: p.kind, value: p.value },
                            }));
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
                        variant={v === draft.priority ? "secondary" : "ghost"}
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
                    {options.map(([name, Icon]) => (
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
                {options.some(([name]) => name === panel) && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => show("More")}
                    >
                      <ChevronLeft />
                      {panel}
                    </Button>
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
                          <FieldLabel htmlFor="repeat-rule">Repeat</FieldLabel>
                          <NativeSelect
                            id="repeat-rule"
                            value={draft.repeat}
                            onChange={(e) => set("repeat", e.target.value)}
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
                    {panel === "Location" && labelInput("Location", "location")}
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
  root.render(
    <Composer key={++sequence} {...props} onClose={() => root.render(null)} />,
  );
}
