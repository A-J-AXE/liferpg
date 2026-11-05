# Planning references

The official [task feature guide](https://product.akiflow.com/help/articles/0006630-task-features) shows deadlines at the top of the calendar and treats external locking as a separate action. The [task planning guide](https://product.akiflow.com/articles/8286936-task-planning) puts date-only tasks outside the timed grid. LifeOS shows separate Due and Planned labels in each date heading. Dropping onto a heading retains the date and removes the time. Dropping onto the timeline assigns a time.

The connected REA MCP analyzed the installed Electron main and preload bundles. Its scoped route view returned no candidates and does not establish where the signed-in planner implements these interactions. Evidence: `ev_7edc048d1430d54a0ddbe4e3d9d5eaa23b86fb03d68b41dbd6a4b2e93ab03281`.
The owner’s annotated captures establish a narrow navigation rail, project identity in task rows, editable task metadata, an attached date picker, and a persistent focus strip. The latest master text describes five Upcoming/navigation captures. Its attachment directory contains the text file only. Use the earlier supplied images and the official illustrated [Upcoming guide](https://product.akiflow.com/articles/2292718-upcoming-page) for the available visual evidence.

| Surface | Evidence | LifeOS behavior |
| --- | --- | --- |
| Upcoming | The guide shows six Overview buckets, individual day/week/month columns, drag between periods and direct capture. It distinguishes tasks from external events. | Use horizontal columns, inline capture, a scheduled group, open work, and a completed group. Empty periods retain capture. |
| Planner | User captures show day counts 1–6, Week, Today, date arrows and time blocks. The [planning guide](https://product.akiflow.com/articles/8286936-task-planning) distinguishes time frames from exact scheduling. | Planner alone owns the timeline. Support 1–7 days, 15-minute drops and independent overlapping lanes. |
| Inbox and projects | Captures show a project-selected list and task project labels. [Navigation guide](https://product.akiflow.com/help/articles/7210597-navigating-akiflow) documents moving tasks to projects and time frames. | Inbox is unplanned work. A project shows its tasks across every planning precision. |
| Timer and editing | The two PNGs in [UI reference](UI_REFERENCE.md) show the controls and their arrangement. | Keep the single running timer in the shell and use the anchored task composer. |

REA 6.8 inspected the installed Windows Electron archive under Local Programs/Akiflow/resources/app.asar using only its package manifest. REA evidence ID `ev_8345211d0d3bb86f8950d0ec084a7952cda60cc41751c0ac22630ad57c40c346`. The archive and Electron license are present. This inspection did not observe signed-in navigation, bucket precedence, scroll restoration, resize rules, private tasks or internal component ownership. The references describe user-visible behavior. LifeOS defines its own routing, bucket policy, shortcuts and conflict layout.

REA also observed the public planner URL in an isolated Edge profile. It redirected to the Akiflow Login page. Evidence ID `ev_8ae13ea34fa26f2ea8a748f4e62eb07326687550bd4a44c9c215d55f618db69c`. The installed archive contains Electron main/preload scripts and login wrapper pages. This did not expose signed-in renderer routes.
