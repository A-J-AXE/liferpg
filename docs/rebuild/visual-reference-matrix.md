# PR 00 — LifeOS Visual Reference Matrix / Source-backed brief

## Product art direction
**Soft-dimensional game world + dense professional controls.** RPG Overview resembles original Life RPG screenshots (character left, illustrated destinations in the middle, journal/activity right), with a coherent licensed Fluent Emoji 3D art family. The Planner must look like an actual compact scheduling app, not the same soft 3D RPG tiles. The connector between both worlds is typography, subtle surfaces, small action sizes and direct manipulation.

**Source hierarchy:** original 56-page Reward v3.1 PDF > latest no-data-preservation authorization > original 27-section feature contract > user screenshots > licensed GitHub source implementations > design skills. The 3D art must come from verified assets. Any preview values are explicitly labeled `DEMO / NOT EARNED`.

## Exact user screenshots (not imported to public repo)

| Surface | Current screenshot | Target screenshot | Structure and behavior required | Source candidate | Gate |
|---|---|---|---|---|---|
| RPG Home | `image(20261105-092344).png` | `image(20261105-092212).png`, `image(20261105-092732).png` | Left character + skills, 3D illustrated center destinations, slim activity journal right; no random stat cards | MIT Life RPG CharacterSheet + Fluent 3D PNG family | PR 02 |
| Character & skills | `image(20261105-090940).png` | `image(20261105-092512).png`, `image(20261105-091025).png` | Character portrait uploaded/replaceable, level/HP/coin/XP, compact segmented skill grid; no full-width bars | Life RPG CharacterSheet + Fluent 3D | PR 02/05 |
| Growth/Battle | `image(20261105-092344).png` | `image(20261105-092523).png`, `image(20261105-091116).png` | Separate GOOD/BAD habit states, recognizable icons, one-action check-in; negative occurrence ≠ positive completion | user refs + future habit source | PR 05 |
| Task editor | `image(20261105-090446).png`, `image(20261105-090551).png` | `image(20261105-090450).png`, `image(20261105-090724).png` | One-click complete editor; top date/time/duration/repeat chips, direct title/description, bottom project/tags/link actions, subtask sidecar | Circle issue detail / Radix | PR 03 |
| Project selector | `image(20261105-091325).png` | `image(20261105-091357).png` | Searchable anchored project menu with images and groups; click/Enter saves, no modal or second Save | Circle project badge / cmdk | PR 03 |
| Project Studio and identity | `image(20261105-091228).png` | `image(20261105-090808).png` + Akiflow task chip visual | Click avatar to change/remove image; click name to rename inline; contextual chips for settings | Shadcn Admin navigation + Circle UI | PR 03/05 |
| Planner | current app reference screenshots, `image(20261104-153515).png` | Akiflow screenshot set | Time grid 1–7 days, queue, drag, resize, overlap and functional keyboard actions. Never inject hourly grid into Inbox/Projects. | CalendarCN core as candidate | PR 04 |
| Upcoming | current app screenshots | Akiflow Overview/Day/Week/Month | Task boards with date/week/month precision; no hour assignment when only a month is chosen | Circle compact lists + planner model | PR 04 |
| OpenGym | current app and opengym.ch | actual OpenGym | Real exercise/workout flows and history, not 4 empty fitness cards | DuarteSantos8/openGym (AGPL code; media is separately licensed) | PR 06 |

## Formal quality acceptance before reward logic
- Desktop at 1440×900, 1280×800, 1024×768 and 390×844; Light/Dark and reduced motion.
- Actual browser screenshots compared with both **target and upstream demo**, not only to generated mockups.
- Navigation rows, typography, image affordances, focus, popovers and action feedback look intentional.
- No more cloned generic white rounded cards, marketing heroes, empty expanses or decorative statistics.
- Every visible icon has a real action or accessible label. Keyboard Tab/Enter/Escape work, no mouse-only editing.
- Use genuine GitHub art originals; no local generated gradients, ornamental SVGs or fake 3D artwork.
- Production screen preview controls may update only local `DEMO` fixtures before Reward v3.1 ledger is implemented.

## Recommended design tokens for PR 01 (subject to visual approval)
`font: Segoe UI / system-ui`; controls ~30–34px; dense row ~36–40px; grid rhythm 4px; muted line separators; corner radii 7–10px. Warm ivory and charcoal foundations; color mostly appears in **actual 3D icons** and reward state chips, never arbitrary dashboard backgrounds. Slight shadows on destination art tiles, not on every task row.

**Source limitation:** These are user-supplied screenshots with proprietary third-party views. They establish an interaction and layout goal, not ownership/license to use the depicted art.
