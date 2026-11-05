# Desktop planner interactions
Use the [design system](DESIGN_SYSTEM.md) and [interaction patterns](INTERACTION_PATTERNS.md). Keep the project image, task title, completion and applicable metadata together. The row menu exposes edits and planning destinations on keyboard, touch and pointer. Inline capture uses Enter. The adjacent more button opens advanced creation in the same project or period. Escape dismisses the open picker first.

LifeOS shortcuts outside text fields: C opens the composer, Ctrl/Cmd+K searches tasks, U opens Upcoming, I opens Inbox and P opens Planner. The native checkbox toggles with Space. A block's resize handle supports Up/Down in 15-minute steps. The date picker supports arrow keys. The focus strip's named controls are keyboard accessible.

The hourly timeline and horizontal period board are application-specific layouts. Reuse the installed shadcn buttons, inputs, menus, calendar and popover for their controls. A month or week assignment in any view must preserve its precision. Use local, low-contrast separators and the same project/priority tokens in both themes.
