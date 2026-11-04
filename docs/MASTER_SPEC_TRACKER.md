# MASTER 27-SECTION SPEC — LifeOS requirement tracker

Source: user-provided 27-section master prompt, supplied in the LifeOS conversation. This tracker summarizes that specification; the full original remains controlling. Do not silently replace it with assumptions.

**Status rules:** Not started / Implemented, unverified / Partially validated / Validated / Blocked. A draft PR is not a sign-off. No blanket 'done' for a section with multiple untested requirements.

| § | Requirement / acceptance group | Target PR(s) | Status | Evidence or remaining acceptance |
| --- | --- | --- | --- | --- |
| 1 | Stop calendar everywhere | PR #1 | Partially validated | Planner only has time grid; Projects/Inbox/Upcoming none. |
| 2 | Required workspace navigation | PR #1–2 | Partially validated | Inbox / Planner / Upcoming / Projects / Fitness / Progress discoverable and compact. |
| 3 | Analyze screenshots | PR #2 | Partially validated | Current and Akiflow screenshot references studied, visual deltas documented. |
| 4 | REA Akiflow investigation | PR #2–4 | Blocked | Signed-in desktop app inaccessible here; metadata alone is not behavior. |
| 5 | Proper view architecture | PR #1 | Partially validated | Separate task-only and time-grid workspace render paths. |
| 6 | Upcoming Overview | PR #1, #4 | Partially validated | PR #4: Six buckets, nonduplicating records, sorting, manual order, completed disclosure. Browser and native acceptance pending. |
| 7 | Upcoming Day | PR #1, #4 | Partially validated | PR #4: Seven daily columns, keyboard move, quick add, sorting and period navigation. Browser and native acceptance pending. |
| 8 | Upcoming Week | PR #1, #4 | Partially validated | PR #4: Five rolling week columns, week-level moves without fabricated start time. Browser and native acceptance pending. |
| 9 | Upcoming Month | PR #1, #4 | Partially validated | PR #4: Five rolling month columns, monthly quick add and keyboard period moves. Browser and native acceptance pending. |
| 10 | Planner 1–7 days and time blocking | PR #1, #3 | Partially validated | PR #3: 24-hour grid, 15-min drag/drop, 1–7 day choices, overlap lanes, pointer/keyboard resize, zoom, undo/redo validated in headless Chrome. Windows/Electron and external-calendar overlays still unverified. |
| 11 | Projects task-first | PR #1, #5 | Partially validated | Project tasks/progress, calendar excluded; grouping/filter pending. |
| 12 | Consistent task data model | PR #1, #3–6 | Partially validated | Planning precision, project association, deadline and recurrence integrity. |
| 13 | Action-first task creation | PR #1, #6 | Partially validated | Inline capture works; richer contextual editor pending. |
| 14 | Date picker and navigation | PR #3, #6 | Partially validated | PR #3: native compact date picker and range controls Chrome-tested; advanced task-editor contextual date flows remain PR #6. |
| 15 | Task row design | PR #2, #5 | Implemented, unverified | Shared dense row, contextual actions, keyboard and hover review. |
| 16 | Focus timer | PR #1, #8 | Partially validated | Persistent play/pause + modal; sessions/window pending. |
| 17 | Google Calendar | PR #11 | Not started | Live OAuth, overlay, locking, duplicates, timezones. |
| 18 | Keyboard-first | PR #7 | Partially validated | Cmd+K, capture and resize exist; full shortcuts/undo pending. |
| 19 | No-AI-slop design system | PR #2 | Implemented, unverified | Tokens, UI skills, playground, screenshot gates. |
| 20 | LifeRPG and OpenGym integration | PR #9–10 | Partially validated | Existing modules preserved; completion/regression needs validation. |
| 21 | Responsive desktop | PR #2, #3–5, #13 | Partially validated | PR #3: 390px mobile + desktop Planner screenshots and horizontal grid scrolling validated in Chrome; native Electron and remaining workspaces need checks. |
| 22 | State and persistence | PR #12 | Partially validated | Existing local/server sync retained; full cross-device test needed. |
| 23 | Test scenarios | PR #1–13 | Partially validated | PR #3: pure Planner scheduling tests and Chrome scheduling, overlap, resize, undo, theme/mobile, plus PR #1/2 regression suites; live Google and Windows tests pending. |
| 24 | Docs and permanent Codex rules | PR #2 | Implemented, unverified | AGENTS, design references, progress/acceptance tracker. |
| 25 | Incremental implementation order | PR #1–13 | Implemented, unverified | Stacked PRs, per-feature tests and review. |
| 26 | Final acceptance criteria | PR #13 | Not started | All workflow/visual/integration criteria must be evidenced. |
| 27 | Finish using correct workspace boundaries | PR #13 | Partially validated | No rebuild, preserve OpenGym/parts, complete product validation. |

## Required evidence for every line

- **Code location:** implementation file + meaningful function/component; add links as PRs land.
- **Tests:** unit and browser interactions, not only DOM element presence; record actual verified states.
- **Visual:** rendered Light / Black screenshots at required desktop and narrow widths.
- **Integrations:** authenticated Google, iPhone or native Windows flows must be marked unverified until actually tested.
- **Safety:** do not commit credentials, change cloud/public access, or overwrite stored data to make tests pass.

## Cross-PR release definition

Complete only when every applicable requirement is Validated or has a clearly approved exception. This means actual Planner / Upcoming / Inbox / Projects workflows, LifeRPG receipts, OpenGym, timer, calendar, keyboard, cross-device persistence, responsiveness, accessible controls and screenshot evidence. PR #13 owns final release validation, not blanket assumptions.
