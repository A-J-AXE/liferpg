# Workspace restructure
The old fallback assembled the task agenda and calendar together for every unmatched destination. Planner now owns its timeline, Upcoming owns horizontal boards, and project detail and Inbox render their own filtered lists. Overview remains the landing workspace. UI state is independent of task persistence.

| Milestone | Implementation and verification |
| --- | --- |
| References | Reviewed the supplied project, task, calendar and timer captures and the official Akiflow help. Installed REA for Codex, listed its tools through a fresh Codex session, and inspected the Windows application archive manifest. Signed-in Akiflow navigation was not exercised. |
| Storage | Existing records are interpreted in place. New period metadata is optional. Project and reward IDs stay stable. An IndexedDB snapshot preserves the initial legacy workspace for local rollback. |
| Workspaces | Explicit routes, browser history, four Upcoming modes, week-start preference, project grouping/filtering, contextual assignment, inline capture and editing, 1–7 day Planner, overlapping lanes, resize and unschedule. |
| Integration | The UI uses the existing openGym, Google OAuth and task reward paths. Selected Google calendars use bounded range queries to expand recurring events and the existing sync-token path remains available. A live Google account and physical iPhone/DGX remain external checks. |
| Reproduce | Run npm run build:ui, npm run typecheck, npm run verify and node verify-sync.mjs. See the latest verification entry in CHECKLIST.md. |
