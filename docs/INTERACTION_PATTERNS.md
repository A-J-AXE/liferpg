# Interaction patterns

Existing tasks use a full anchored editor with direct title and description, visible planning chips, and a subtask panel. Field changes commit on selection, Enter or blur. A new task still has an explicit Create action. Project rows separate image, name and navigation. The same artwork picker serves projects, skills and habits.

## Task composition

Click Add task or press C to open a compact panel at the current task list. Type immediately. The date, project, priority and Create action are visible. More opens a named list of properties. Schedule shows time and duration together; Repeat shows its next occurrence and, on an existing task, the scope of the edit. File selection uses a button with a hidden picker. Create or Apply is the transaction boundary. An invalid task stays open with the draft intact. Escape first closes a property picker and then cancels the draft.

## Contextual toolbar and inline editing

In a task row keep completion, title, and identity visible. For the subsequent task-card pilot, reveal secondary actions on hover **and** keyboard focus, with an explicit More trigger on touch. An inline rename should focus the existing title, commit on Enter and restore on Escape. A rename must not issue completion, scheduling, or XP changes. Safe single-property changes such as linking a focus task persist immediately. Draft creation needs one explicit commit.

## Pickers and commands

Reuse the project registry components. A small option set can use named buttons. A long list of projects or tasks uses Command with type-to-filter, arrow keys and Enter. Retain text labels for ambiguous icons. Calendar opens from the date chip; clearing the date should still validate a task that has a start time. Keep priority color separate from project identity.

## Persistent timer

The header owns a single timer surface. Play/pause and the linked task are available directly. Overflow contains mode, duration, reset and expansion. The expanded strip floats in the workspace and uses the same actions. Use the persisted deadline for a running timer and the persisted seconds for a paused timer. Rendering or switching pages never restarts it. Mode or duration changes prepare a new paused interval; linking a task preserves the current interval. Honor reduced motion.

## Project creation after approval

Prototype the project name, color and Create action together. Put folder, skill, uploaded image and stage in one optional disclosure. Specify a valid skill default before exposing quick create; task rewards must retain a skill destination.
