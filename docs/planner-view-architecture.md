# Planner workspaces
The shell owns navigation, search and a single focus timer. The current hash selects the workspace and participates in browser Back and Forward. Overview opens on a fresh launch and links into Planner.

| Destination | Local responsibilities |
| --- | --- |
| Inbox | Compact capture and processing of unscheduled tasks. |
| Project detail | Project identity, status, completed count and all associated tasks. Group by completion, priority or plan date. Filter open/completed and sort by title, priority or plan. |
| Upcoming | Independent Overview, Day, Week and Month boards built from period keys. Horizontal scrolling, quick capture, move menu and drag between columns. |
| Planner | Unscheduled task pool, calendar selection, date jump, external events and editable timed blocks. Previous/next advances by the chosen 1–7 days. The full local day scrolls from a configurable initial hour. |
| Today / Overview | Daily task agenda and, on Overview, secondary progress and fitness summaries. |
| openGym / Progress | Existing native workout entry and RPG workspaces. |

The React workspace root receives the shared task store and mutation callbacks. Moving or resizing changes the existing task. Scheduling from a project opens its task editor inside Planner. The timer stays mounted outside the active view. Preferences for filters are view-local. Mode, anchor, day count, first day of week and initial scroll hour persist on the device.
