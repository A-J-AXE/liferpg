# LifeOS acceptance checklist

- [x] A01 **Calendar range** Offer Day, Week and Month. The reference also offers 2-6 days. Keep the selected date in view when switching ranges.
- [x] A02 **Quick add** Place Add new task above the list. C opens a focused title field. Enter saves the task and makes it visible in the current list.
- [ ] A03 **Inbox count** Display a live count beside Inbox. Open Inbox to triage unassigned captures. Update the count when a task enters or leaves.
- [x] A04 **Today list** Open Today to see tasks planned for today, with separate To-dos and Done groups. Show count and known duration for each group.
- [x] A05 **Planned date** Give the task its own date picker. Changing the date updates which daily list contains it.
- [x] A06 **Start time** Offer an optional time picker. A dated task can stay unscheduled until a time is chosen.
- [x] A07 **Duration** Edit the time estimate independently. Use the duration for the calendar block and list totals.
- [ ] A08 **Repeat** Offer a recurrence rule and show its next occurrence before saving. Distinguish edits to this occurrence from edits to the series.
- [ ] A09 **Tags** Add, edit and remove tags independently of project membership.
- [ ] A10 **Location** Attach an optional location in task detail and reopen it later.
- [ ] A11 **File attachment** Attach a file, show its name, and let the user reopen or remove it.
- [x] A12 **Custom project identity** Upload your own image for each project. Reuse that asset across the sidebar, editor, task lists and calendar.
- [ ] A13 **Project bar** Show a compact, tinted project badge with icon and name. Click it to assign or change the owning project.
- [x] A14 **Subtasks** Add an editable checklist beneath the parent. Show completed / total in the parent row.
- [x] A15 **Per-project view** Open a project to see just its tasks, including subtasks and parent context. Adding here preselects that project. Show its custom image beside the name.
- [ ] A16 **Completion control** Provide a keyboard-accessible checkbox in the row and editor. Both update the same completion state.
- [ ] A17 **Editable title** Edit the title inline. Reflect the saved title wherever that task is shown.
- [ ] A18 **Description** Keep longer notes in a separate description field, available when reopening the task.
- [x] A19 **Importance selector** Offer exactly five labeled choices: None, Low, Medium, High and Goal. Expose the selected label to keyboard and screen-reader users.
- [ ] A20 **Goal color** Use a fine multicolor accent for Goal, visible on the row and completion control.
- [ ] A21 **Goal outline** Run the gradient around the row perimeter, with a violet-to-warm transition and a quiet interior. Keep title text legible.
- [ ] A22 **High** Use red for the High priority indicator.
- [ ] A23 **Medium** Use yellow for Medium, with sufficient contrast on the light canvas.
- [ ] A24 **Low** Use green for Low.
- [ ] A25 **None** Use a neutral checkbox with no priority color.
- [x] A26 **Today reset** One Today action returns to the current date, the one-day calendar and today's task list.
- [x] A27 **Previous** The left arrow moves one day back in Day view. In Week and Month, move by the visible period.
- [x] A28 **Next** The right arrow moves one day forward in Day view. Preserve the selected range when stepping through periods.
- [ ] A29 **Google calendars** Connect a Google account, list its calendars and toggle each overlay independently. Hiding an overlay keeps its events on Google.
- [ ] A30 **Pomodoro timer** Keep a compact timer in the app header while switching views. Offer start, pause and resume.
- [ ] A31 **Focus** Select Focus, set a duration and optionally associate the session with a task.
- [ ] A32 **Break** Select a short Break with its own duration.
- [ ] A33 **Long break** Select Long break separately and show the active mode alongside remaining time.
- [ ] A34 **Rituals** Configure daily planning, daily shutdown, weekly planning and weekly shutdown. Choose the days, time and automatic or manual trigger.
- [ ] A35 **Calendar defaults** Set destination calendar, conferencing, durations for events/tasks/slots and whether to lock blocks externally. Include unlock-on-completion and privacy settings.
- [ ] A36 **Share availability** Configure a booking link, destination calendar, event duration/location, guest questions, busy calendars, reminders, buffers and advance notice.
- [ ] A37 **Sounds and animations** Set separate reminders for events, tasks and slots. Assign or import an MP3 per reward cue, including coin and XP/firework sounds. Choose a matching animation, preview, set volume or mute.
- [ ] A38 **MCP integration** Design a settings page for connecting an AI client through Model Context Protocol. Show available actions, authorization and disconnect. Begin with reading the planner; scope any future write access separately.
- [ ] A39 **Character card** Show portrait, name, level, coin balance, HP, objectives and progress. Open the profile to edit identity and view strengths and areas for improvement.
- [x] A40 **Skill levels** List skills with icon, name, level, current XP and XP needed to advance.
- [x] A41 **Hierarchy** Support Skill > Project > Task > Subtask. A project page shows the parent skill; a skill page shows contributing projects and activities.
- [x] A42 **Habit rewards** Link each habit to a skill and show the XP and coin value of its check-in. Record the occurrence so checking in twice cannot pay twice.
- [ ] A43 **Growth, Battle and Goals tiles** Use original illustrated entry points to good habits, bad habits and objectives. Each opens the relevant list and today's available actions.
- [ ] A44 **Projects, Market and Journal tiles** Open project stages, the personal reward shop and activity history from compact tiles. Surface Settings and Profile / Vision Board alongside them.
- [ ] A45 **Dimensional level bar** Use a shallow inset track, a lit edge and a brief fill animation when XP lands. Keep numeric progress visible and support reduced motion.
- [x] A46 **Skill points** Give every skill its own points total and progress meter. Show the source and amount of each gain. Review separately whether points can be spent.
- [x] A47 **Skills on Overview** Show a compact, scannable skill list on the main dashboard. Open a skill to see its projects, habits and recent XP.
- [x] A48 **Character on Overview** Display a compact version of the same character profile on the dashboard; keep identity, level and balance consistent across views.
- [x] A49 **Daily diary** Write and save dated check-ins. Expose today's entry on Overview and a searchable history through Diary in the sidebar.
- [ ] A50 **Profile and economy settings** Edit identity, skill definitions, level thresholds, growth XP, coin award amounts and the balance. Record manual adjustments in history with a reason.
- [ ] A51 **Battle cards** Use a card per bad habit with a quick action to log a lapse, its date and any configured game consequence. Expose a correction action.
- [ ] A52 **Growth and streaks** Show each good habit's streak and daily check-in. Use green plus a check for done, red plus a label for missed, and a distinct pending state while today is still open.
- [x] A53 **Skill point summary** On the dashboard show each skill's earned points, level and next threshold. Selecting a row explains which activities contributed.


## Verification and remaining work

The normal Electron launch showed Overview and Today. npm run verify exercises a task with uploaded artwork and subtasks, edit/undo rewards, calendar ranges, habit check-ins, diary, themes, narrow layout and a real workout saved from a guest routine. The workout appeared in native History and earned one Gym receipt. node verify-sync.mjs checks that two independent hosted clients see each other’s changes, data survives a server restart, and simultaneous stale saves cannot overwrite newer data.

The upstream baseline on this Windows host was 7,811 frontend tests passed / 21 failed, and 769 API tests passed / 31 failed. Examples include POSIX permission and launcher assumptions, generated file comparisons, and UI assertions. These failures were observed on the initial unchanged import. Real Google OAuth, calendar lock/release, notification delivery, deployed booking links, DGX containers, and pairing an actual iPhone still require live verification. Review unchecked annotations individually; working controls alone do not establish all their acceptance criteria.
