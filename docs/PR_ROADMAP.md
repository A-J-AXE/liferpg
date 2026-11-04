# LifeOS stacked pull-request plan

| PR | Package | Primary acceptance |
| --- | --- | --- |
| #1 | Workspace architecture (draft) | Planning precision, Planner-only time grid, Upcoming boards, task identity. |
| #2 | Design system and interaction playground | Approved Codex skills, design tokens, actual working showcase, screenshot QA. |
| #3 | Advanced Planner (draft, Chrome-validated) | Full-day 15-minute time grid, 1–7 days, overlaps, dragging, pointer/keyboard resizing, date/zoom, undo/redo. See docs/advanced-planner.md. |
| #4 | Upcoming boards | Overview/Day/Week/Month sorting, recurrence, keyboard moves, nonduplicating records. |
| #5 | Projects and Inbox | Task-first grouping, filtering, triage, contextual actions and bulk changes. |
| #6 | Compact task editor | Progressive popovers, recurrence, attachments, notes, deadlines. |
| #7 | Command palette & shortcuts | Fast navigation, actions, undo/redo, focus correctness. |
| #8 | Pomodoro and floating focus | Real timer state, sessions, notifications, optional Electron window. |
| #9 | LifeRPG | XP, coins, skills, streaks, rewards, sounds, animation and auditability. |
| #10 | OpenGym | Full native training flows, history, integration and rewards. |
| #11 | Google Calendar | OAuth, event overlays/locking, conflict and timezone behavior. |
| #12 | Persistent sync | Server/device/restart/offline conflicts, no data loss. |
| #13 | Release validation | Browser/Electron regressions, mobile, accessibility, screenshots, deployment safety. |

PRs should be stacked from the current PR #1 implementation head until explicitly merged. Each implementation PR requires tests, reproducible screenshots, license/provenance notes where relevant, and an unmerged draft for review. Additional PRs are allowed when scope is too large. Do not confuse PR count with percentage complete.
