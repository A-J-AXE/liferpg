# Reusable LifeOS interaction patterns

| Surface | Primary visible action | Contextual actions | Keyboard | Persistent effect |
| --- | --- | --- | --- | --- |
| Navigation | Choose workspace | Collapse, project manage | Tab, Enter, Ctrl/Cmd+K | Selected workspace, no task mutations |
| Task row | Complete/open | Edit, schedule, project, delete | Space/Enter, menu arrow keys | Same task ID, receipt integrity |
| Upcoming period | Quick-add, move | More task options | Tab, Enter, keyboard-accessible scheduling | Changes planning precision only |
| Hourly Planner | Create, drag to time | Resize, edit, unschedule | Keyboard resize, day controls | Exact local date/time, project unchanged |
| Focus | Play/pause | Mode, durations, link task | Space/Enter | Deadline-based countdown, no duplicate timer |
| Reward | Inspect XP/coins | View history | Tab, Enter | Only actual completion receipts |
| Command palette | Search/type | Select action | Ctrl/Cmd+K, arrows, Enter, Esc | Route to real task/workspace |

### Interaction states to implement and test

Default, hovered, focus-visible, selected, active, disabled, empty, pending, saving, error and success/undo. All high-impact operations require confirmation or an actual reversible undo where appropriate. Every color status needs a text or icon cue.

### Common mistakes prohibited

- Adding static SVG icons that don't perform an action.
- Decorative task cards that cannot be selected or reordered.
- Triggering keyboard shortcuts inside inputs or dialogs.
- Assigning a month-planned task a fake date or time.
- Duplication of completion receipts when reloading or moving tasks.
- Hidden functionality available only by hover.
- Claiming sync success without an acknowledged server response.

### Testing

Unit test planning precision and reward transitions. Browser-test real navigation, capture, task rows, dialog focus restore, menu choices, timer persistence and screen sizes. Avoid brittle tests dependent on exact decorative copy.
