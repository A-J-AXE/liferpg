# LifeOS PR #4 — Upcoming task boards

Upcoming is a horizontal, task-only planning surface based on Akiflow's documented organization and the user's visual references, not a second hourly calendar.

## Four modes

- **Overview:** Today, This Week, Next Week, This Month, Next Month, Someday. Exactly one bucket per applicable task; completed tasks collapse in each period.
- **Day:** Seven rolling day columns, with capture and direct task movement, day-level precision without time.
- **Week:** Five Monday-based week columns; moving between weeks does not invent a specific calendar day.
- **Month:** Five rolling month columns; moving between months does not invent a start time or the first of the month.

## Direct actions

Manual task ordering is persisted as per-column ranks on the existing task record. Priority, title and duration sorting are alternatives. Dropping one task above another reorders the board. Dropping into a different period changes planning precision only; task identity, project association and reward receipts survive. Alt+Up/Down reorders and Alt+Left/Right moves to adjacent periods. An accessible native planning selector reaches off-screen buckets.

## Architecture

- ui/planning.mjs: pure column, sorting, rank, membership and movement helpers; board rendering.
- app.js: delegated drag, sort and keyboard events; per-mode preferences in state.upcoming.sort.
- style.css: compact responsive board, affordances, collapsed completion and scrolling.
- Recurring future occurrences preserve their own date when their shared time is edited; planning precision is updated accordingly.

## Validation and limitations

Unit checks: node verify-upcoming.mjs. Browser: node verify-upcoming-ui.mjs, plus PR #1–3 regressions. GitHub Actions saves light, dark, month/day/week and mobile screenshots.

Manual Windows/Electron and iPhone touch interactions remain unverified. This does not claim direct access to signed-in Akiflow. Full recurring-series editing remains PR #6; recurrence for unscheduled week/month buckets is not fabricated.
