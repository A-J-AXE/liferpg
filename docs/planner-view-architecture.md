# LifeOS workspace architecture (implementation phase 1)

## Scope

This branch starts from `feat/lifeos` and deliberately does not depend on changes from an interrupted local session. The original LifeOS database and native OpenGym integration are preserved.

## Workspaces

| Workspace | Default content | Hourly calendar |
| --- | --- | --- |
| Planner | Unscheduled queue + timeline, 1–7 visible days | Yes |
| Upcoming | Overview/Day/Week/Month horizontal task columns | No |
| Inbox | Unscheduled captures and quick add | No |
| Project | Tasks belonging to selected project, quick add | No |
| Overview | LifeRPG progress and summaries | No |

Today and Agenda are kept as legacy aliases for the Planner until navigation and existing usage can be migrated safely.

## Planning model

`ui/planning.mjs` defines `planning.kind` as `unscheduled`, `someday`, `month`, `week`, `day`, or `exact-time`. Project membership is not changed by `applyPlan`; `date` and `time` are populated only for day and exact-time planning as appropriate. Month and week plans do not invent a specific scheduled day/time. Legacy tasks without `planning` are interpreted using their existing date/time.

Upcoming Overview uses a nonduplicating precedence policy: Today, This Week, Next Week, This Month, Next Month, Someday. Tasks outside those horizons appear in the corresponding rolling Day/Week/Month boards when navigating. Week and Month boards can also display more precisely scheduled tasks within those periods; there are no duplicate records.

## Implemented in this branch

- Mount calendar only in Planner and its legacy aliases.
- Dedicated Upcoming task board, four modes, horizontal scrolling, previous/next navigation on period-specific boards.
- Inline task capture in Inbox, projects, Planner queue and each Upcoming column.
- Drag tasks into Upcoming buckets and onto the Planner time grid.
- Compact native task planning selector for Today, Tomorrow, Next Week, Next Month, Someday, and Inbox.
- Task edits and recurring occurrences retain consistent planning metadata; receipts and project association remain on the same task.
- Compact Planner layout, toolbar and task rows. Advanced task-editor fields are collapsed by default.
- New module served by LifeOS's explicit static asset allowlist.

## Verification and limitations

`node verify-planning.mjs` checks planning precision, bucket placement, nonduplication and rendering. Run `npm ci && npm run typecheck && npm run build:ui && node verify-planning.mjs`, then launch `npm start` for real interaction validation.

The planning model and application syntax were checked outside a browser, but an end-to-end browser/Electron run has **not yet been completed in this environment**. GitHub Actions status may also be unavailable if Actions is disabled. Scheduled-block dragging and keyboard resizing are implemented and now covered by browser smoke tests; pointer resizing is implemented but still needs manual precision checks. The header focus timer now supports direct start/pause and persistence across navigation, with browser coverage. Live Google Calendar OAuth, mobile usability, full cross-device synchronization, and independent visual comparison still need separate verification. Do not claim full functional or visual acceptance on the basis of these changes alone.

Do not merge this branch without an interactive browser smoke test, data-reload test, and cross-device synchronization check.
