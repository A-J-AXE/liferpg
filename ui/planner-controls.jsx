import React from "react";
import { createRoot } from "react-dom/client";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "./components/ui/command";

let palette;
export function searchTasks(items, select, actions = []) {
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
      title="Command palette"
      description="Search by title or project."
      onOpenChange={(open) => {
        if (!open) dismiss();
      }}
    >
      <CommandInput placeholder="Search tasks or projects" />
      <CommandList>
        <CommandEmpty>No matching tasks</CommandEmpty>
        <CommandGroup heading="Actions">
          {actions.map(([label, run]) => (
            <CommandItem
              key={label}
              value={"action:" + label}
              onSelect={() => {
                dismiss();
                requestAnimationFrame(run);
              }}
            >
              {label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Tasks">
          {items.map((t) => (
            <CommandItem
              key={t.id}
              value={t.id}
              keywords={[t.title, t.projectName, t.parentTitle || ""]}
              onSelect={() => {
                dismiss();
                requestAnimationFrame(() => select(t.id));
              }}
            >
              {t.title}
              <small>
                {t.parentTitle ? "↳ " + t.parentTitle : t.projectName}
              </small>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>,
  );
}
