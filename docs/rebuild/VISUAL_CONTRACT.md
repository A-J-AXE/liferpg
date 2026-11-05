# LifeOS visual contract and proof gates

This is a TARGET, not a passed visual review. Screenshots referenced by the user are held in the chat/PDFs; upstream GitHub source paths are indexed in SOURCE_LOCK.md. Actual UI screenshots must be captured in later PRs.

## Character-driven LifeRPG home, not an admin dashboard
At 1440x900, recognizable at a glance: left compact CHARACTER profile with editable avatar, Level, one XP progress and wallet; middle image-led destinations Growth, Battle, Skills, Goals, Market, Vault, Energy, Social, Journal, Fitness; right ACTIVITY of real future events. Use actual sourced 3D tile illustrations with clear title labels, differentiated destination treatments and modest spacing. Never create ten identical rectangle cards with numbers. RPG art can be warm/playful; function labels remain concise. A fixed three-column layout is a desktop target, not a mobile requirement.

## Dense Planner is a different layout
Planner alone owns hourly time-grid and unscheduled task queue; 1-7 day views, drag/resize and conflict display. Upcoming owns task-only Overview/Day/Week/Month boards WITHOUT hourly grid. Projects/Inbox are task-first. The task editor opens on ONE click and exposes date, duration, project, priority, repeat, description and subtasks directly without a giant form or hidden More options dependency. Nested subtasks are visibly inset and linked to parent; on the calendar their left edge is offset while right edge aligns with parent, when space permits.

## Image and direct editing language
Click project/skill/folder image to choose actual image, existing icon or uploaded artwork. Click text to rename. Contextual popovers for project assignment, dates, priorities and task rewards. The user should not need to navigate to another settings page for a routine edit. Functional menus are accessible to keyboard/touch.

## Growth, Battle, Skills, OpenGym
Growth positive occurrences and Battle negative avoided/occurred semantics are visually distinct. Skills use concise tiles with actual art, level and progress. OpenGym is a REAL exercise/set/rep/workout experience, not a generic fitness metrics dashboard, and its AGPL license must be respected. One common shell supports all, but no repeated template for all workspaces.

## Preview truth
PR 01-06 use visibly labeled SANDBOX / DEMO FIXTURE amounts; no earned coin claim, no fake sync/purchase. Reward feedback UI previews must not post to wallet. Full Reward System v3.1 engine is built and tested in PR 07-13, then wired in.

## Source/design skill conflicts
LifeOS functional contract beats third-party skills. Taste Skill's website hero, one-section-per-screen, large photographs, shader ground and full-page scrollytelling are banned inside dense app surfaces. Minimalist UI's generic emoji/Lucide prohibitions and 24-40px card padding are NOT universal; actual 3D RPG art and compact accessible controls are required. Art and components come from pinned GitHub sources.

## Visual review matrix
- 1440x900 and 1280x800 desktop screenshots: full view and important popovers.
- 390px and 320px screenshots: no clipping, sideways scroll, unreachable action or overlapping badges.
- Light and dark theme.
- Keyboard: Tab, Shift+Tab, Enter, Escape, cmd/ctrl search; focus return and aria announcements.
- Zoom 200%, reduced motion, sound Off default, user-uploaded image fallback.
- Source-demo side-by-side comparison with explicit differences and corrections.
- Critical flows: open task once, edit title, assign project, image picker, subtask tree, habits, wallet to activity, planner to Upcoming, workout logging.
- No 'passed' label without real screenshots/interaction logs from a running build.
