# PR #3 — Advanced Planner implementation

The Planner is the **only** default hourly timeline. Upcoming remains task-only and Projects/Inbox remain list-first. This PR is stacked on PR #2 without changing production data schemas outside a backward-compatible `state.planner` UI preference object.

## Implemented

- Full **00:00–24:00** local timeline (no implicit business-hours-only limit). The initial scroll opens near 07:00 and scroll position is retained through edits.
- **1–7 visible days**, with legacy Week/Month choices preserved. The day-count choice and zoom scale (Compact/Normal/Large) persist in user state.
- **15-minute precision** on drag/drop, with live target previews and time labels; dragged unscheduled tasks retain project association and receipts.
- A pure engine at `ui/planner-engine.mjs` owns local civil day logic, snapping, end-of-day duration bounds, overlap lane packing, and reversible snapshots. No dependency on external servers.
- Cross-day keyboard movement: ArrowUp/Down shifts 15 minutes; ArrowLeft/Right changes one calendar day. Resize handles support keyboard arrows and pointer drag, capped at midnight.
- **Undo / redo** for schedule, move, unschedule and resize; toolbar buttons and Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z shortcuts when the user is not typing.
- Current-time indicator on today's column, compact toolbar date picker, accessible event labeling, hover unschedule control, overlapping event lanes, reduced-motion CSS.
- All 24 hours remain accessible even in a narrow desktop or mobile window, where the timeline scrolls horizontally inside the Planner.
- Original external Google Calendar section is preserved. Full bidirectional Google OAuth and interactive native Windows checks remain later PRs.

## Validation

Run `node verify-planner-engine.mjs && node verify-planning.mjs && npm run typecheck && npm run build:ui` followed by real browser smoke tests: `node verify-planner-ui.mjs` and `node verify-workspace-ui.mjs`. GitHub Actions publishes Planner screenshot artifacts.

## Limitations / boundaries

- 15-minute granularity is deliberate. Arbitrary minute-by-minute precision, bulk selection and magnetic scheduling are not added.
- Undo/redo is session-scoped and does not replace the persisted task record; reloading clears the stacks.
- Manual Electron/Windows drag behavior is not directly verified by Linux Chrome CI.
- Google Calendar is not yet directly rendered as editable blocks; do not claim live Google sync was tested.
- Workspaces other than Planner should not acquire an hourly timeline.


## Evidence recorded

- `verify-planner-engine.mjs`: 24-hour arithmetic, 15-minute snapping, overlap lane packing, cross-day movement, start/duration bounds and reversible snapshots.
- `verify-planner-ui.mjs`: actual Chrome drag-to-quarter-hour, overlap by dropping on an occupied event, pointer/keyboard resize, date/zoom controls, undo/redo, persistent task identity, seven-day mobile scrolling, light/dark screenshots.
- The original `verify-workspace-ui.mjs` and `verify-design-system.mjs` continue as regression gates.
- Screenshot archive published in the PR #3 GitHub Actions workflow artifacts. No public production deployment was performed.
