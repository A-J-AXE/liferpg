import React from "react";
import { createRoot } from "react-dom/client";
import { Button } from "./components/ui/button";
import { Calendar } from "./components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "./components/ui/popover";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "./components/ui/command";
import { CalendarDays } from "lucide-react";

let palette;
export function searchTasks(items, select) {
  if (!palette) {
    const host = document.createElement("div");
    document.body.append(host);
    palette = createRoot(host);
  }
  function dismiss() {
    palette.render(null);
  }
  palette.render(
    <CommandDialog
      open
      title="Find a task"
      description="Search by title or project."
      onOpenChange={(open) => {
        if (!open) dismiss();
      }}
    >
      <CommandInput placeholder="Search tasks or projects" />
      <CommandList>
        <CommandEmpty>No matching tasks</CommandEmpty>
        <CommandGroup heading="Tasks">
          {items.map((t) => (
            <CommandItem
              key={t.id}
              value={t.id}
              keywords={[t.title, t.projectName]}
              onSelect={() => {
                dismiss();
                requestAnimationFrame(() => select(t.id));
              }}
            >
              {t.title}
              <small>{t.projectName}</small>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>,
  );
}
function DatePicker({ host }) {
  const [open, setOpen] = React.useState(false);
  const input = host.closest("form").elements.namedItem("date");
  const selected = input.value ? new Date(input.value + "T12:00") : undefined;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-label="Pick planned date"
        >
          <CalendarDays /> Pick date
        </Button>
      </PopoverTrigger>
      <PopoverContent container={host.closest("dialog")} className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(d) => {
            input.value = d
              ? [
                  d.getFullYear(),
                  String(d.getMonth() + 1).padStart(2, "0"),
                  String(d.getDate()).padStart(2, "0"),
                ].join("-")
              : "";
            input.dispatchEvent(new Event("input", { bubbles: true }));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
class TaskDate extends HTMLElement {
  connectedCallback() {
    this.root = createRoot(this);
    this.root.render(<DatePicker host={this} />);
  }
  disconnectedCallback() {
    this.root?.unmount();
  }
}
customElements.define("task-date-picker", TaskDate);
