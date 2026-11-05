# Visual reference matrix — review checklist, not approved screenshots

Canonical screenshots were supplied in the conversation; the user's source reward PDF includes actual mockups at pages 1, 5-10, 12-20 and 21. These references are not embedded in this Git branch. Do NOT claim the local screenshots exist; capture reference images during PR 01-06 and add paths when verified.

| LifeOS screen | Reference to inspect | Required visual behavior | Common failure | PR |
| --- | --- | --- | --- | --- |
| Desktop shell | Shadcn Admin src/components/layout/app-sidebar.tsx and Circle compact issue navigation | sidebar navigation, immediate primary destinations, compact header, keyboard search | generic admin metrics and oversized cards | 01 |
| RPG home | Original Life RPG user screenshot + v3.1 Character/Skill mockups pages 3,5,20-21 | left character XP/wallet, central illustrated destinations, right real Activity | 10 identical colored cards with fake statistics | 02 |
| Artwork/coins | Actual Fluent Emoji 3D files in ARTWORK_MANIFEST.md | real coherent 3D source PNG, coin amount legible, app-local assets | AI generated emoji, fake paths or unlicensed hotlinks | 02 |
| Task editor | User Akiflow screenshot + Circle issue-details.tsx + reward PDF page 19 | single-click anchored editor, visible date/duration/repeat/priority, project and reward chips | large modal, More options cascade | 03 |
| Project picker | Circle command/menu source + user Akiflow project assignment screenshot | searchable, grouped folders and recent items, keyboard selection, one click | full-page form and Save for basic assignment | 03 |
| Project sidebar / Finish | Reward PDF pp 16-18, Circle navigation | skill > project tree, 2-step explicit Finish, Completed/Reopen | silently complete child items; vanish from history | 03 + 11 |
| Subtask tree | User task hierarchy screenshot (chat) | parent→children visibly linked, smaller/inset subtask bars, right edge aligned in Planner | disconnected flat tasks or children same visual weight | 03-04 |
| Planner | CalendarCN time-grid/week-view and Akiflow screenshot | 1-7 days, drag/resize timeblocks, real time-axis and queue | upcoming shows hourly calendar; visual calendar without interactions | 04 |
| Upcoming | User Akiflow task boards reference | Overview/Day/Week/Month task-only boards; preserve date precision | second Planner cloned with time grid | 04 |
| Growth/Battle | User Life RPG+Notion habit references + v3.1 hierarchy p3 | illustrated positive/negative habits, separate occurrence semantics | merged generic habit checklist | 05 |
| Skills | User Notion-like Skills screenshot + Reward PDF pp 5,21 | image-led compact grid, level + XP progression, direct rename/art click | full-width progress bars on giant cards | 05 |
| OpenGym | Current native fitness/ source and real OpenGym UI | actual workout/exercise/history/program flow in new shell | decorative fitness stats mock | 06 |
| Reward editing | Reward PDF page 19 | one compact trailing XP/coin chip + contextual override popover | permanent extra columns, paid award edit without audit | 14 |
| Activity/toast | Reward PDF pages 20-21 and feedback pp 40-41 | one global toast host from committed event; quiet scope rows; history | duplicate toasts and replayed coin sound after refresh | 14-15 |

## Screenshot evidence folder (later PRs only)
For each UI PR, save actual screenshot evidence: 1440x900, 1280x800, 390x844 and 320x720, both themes where supported, plus open menus. Include links in the PR; do not assert PASS without running a browser. Run focus, keyboard, touch targets, 200% zoom and reduced motion. Each PR must explicitly list unresolved design deltas.
