---
name: compact-desktop-ui
description: Implement or review LifeOS planner interactions, including task composition, inline edits, option pickers, and the shared focus timer. Use when changing how a user acts on a planner object or controls a running session.
---

# Compact desktop interactions

Read [interaction patterns](../../../docs/INTERACTION_PATTERNS.md), [visual references](../../../docs/UI_REFERENCE.md), and [acceptance checklist](../../../docs/UI_ACCEPTANCE_CHECKLIST.md). Compare the actual task and timer PNGs in the reference document before changing their surfaces.

- For a new task, start at the initiating row. Use the composer in `ui/compact-composer.jsx`. Place the title and Create within reach; show one chosen property panel at a time. Preserve an existing task's IDs, completion, attachment and recurrence scope on edit.
- Compose icon tools from the installed Button and Tooltip. Every action must work without hover. For future inline edits keep one editable value at a time, commit reversible changes on Enter or blur, cancel on Escape, and restore focus to the caller.
- Use Popover around a local decision and Command for a searchable collection. Keep a text value on the trigger when it identifies the current project, linked task or date. Separate text-entry Enter from option-selection Enter.
- For a persistent control, use `ui/compact-timer.jsx`. Expansion changes presentation; read the same deadline after navigation, reload and wake. Start, pause, reset, mode and link actions go through the one timer owner.
- Before rollout, test the real flow against the two references in Light, Black and a narrow window. Extend these patterns to task rows, projects or other screens only within the user's approved scope.
