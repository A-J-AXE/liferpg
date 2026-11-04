# LifeOS UX Principles

1. **Action before explanation.** A visible control should help do the task, not describe how tasks work.
2. **Predictable workspace purpose.** Planner is time-blocking; Upcoming is task periods; Projects and Inbox are task lists.
3. **One task record.** Rescheduling never clones a task, changes its project association accidentally, or awards rewards.
4. **Progressive disclosure.** The task title is primary; priority, deadlines, notes and recurrence stay contextual.
5. **Keyboard parity.** Hover reveals affordances; tab/focus and shortcuts provide the same actions.
6. **Low noise, high precision.** Text first, quiet icons, minimal color, narrow dividers, consistent interactive targets.
7. **Actual feedback.** Loading, error, sync, reward and undo states must reflect real operations.
8. **Strong defaults.** Creation context supplies the project or planning period without inventing exact times.
9. **Consistency over novelty.** Reuse the same primitive, spacing and gesture across views.
10. **Respect stored state.** Schema changes are migration-safe, and no UI refactor deletes data or history.

## Decision tree for new UI

Can an existing LifeOS/shadcn/Radix component handle it? Use it. Otherwise consult the approved registry and check its accessibility and license. If no suitable component exists, write a focused custom domain component with tests, provenance and a documented exception.

A beautiful screenshot is necessary but insufficient. Test task creation, completion, dragging, persistence, responsive behavior, keyboard navigation and focus.
