# PR 00 — Clean rebuild implementation decision and next slice

## Permission and boundaries

The user authorized removing the old frontend and discarding demo/test data. The old remote branches, Git history, self-hosting credentials and external accounts remain untouched. The old frontend code on `feat/lifeos-rpg-home-dashboard` is intentionally retained as a **rollback snapshot**, not as a design constraint.

New branch: `rebuild/onion-pr00-source-lock`, based on `7817527551b56bb135e35fe96eaa845f8a60435e` (RPG home draft PR). Existing draft PRs #1–#7 are not merged, rewritten or deleted.

## PR-by-PR deletion matrix

| Legacy surface | Current file(s) | Decision | Replacement / timing |
|---|---|---|---|
| String-generated app UI | `app.js` | **Delete/replace** | PR 01 React root; remove legacy rendering after shell tests pass |
| Huge mutable global stylesheet | `style.css` + `ui/workspaces.css` + `ui/entities.css` + `ui/rpg-home.css` | **Delete/replace** | PR 01-06 component-scoped styles and one semantic token file; trim each legacy override as its page is replaced |
| Generated JS bundle | `shell.js` | **Regenerate, never hand-edit** | PR 01 from typed React entrypoint |
| Legacy HTML structure | `index.html` | **Replace** | PR 01 new `#root` and controlled app shell |
| Legacy shadcn primitives | `ui/components/ui/` | **Reuse only if upstream-compatible, replace otherwise** | PR 01, preserving required MIT notice |
| Browser/desktop backend | `server.mjs`, `desktop.cjs`, `cloud.mjs`, `google.mjs` | **Isolate/evaluate** | PR 01 shell should run without API dependencies; PR 17+ integration may replace transport and data models |
| Legacy life-rpg XP demo values | Any old demo state | **May discard** | PR 02-06 use `DEMO`-labeled fixture values only; PR 07+ rebuild v3.1 ledger |
| Existing UI tests | `verify.mjs`, `verify-workspace-ui.mjs` where present | **Replace after equivalent coverage** | PR 01 Playwright root navigation, later each screen |
| Docs from old PRs | `docs/` | **Preserve as historical reference** | New authoritative `docs/rebuild/` per PDF; no duplicate design system |

## Onion stages (from the 89-page roadmap)

PR 00 source lock → PR 01 shared React shell → PR 02 illustrated RPG home → PR 03 compact Akiflow task editing → PR 04 Planner/Upcoming visuals → PR 05 skills/Growth/Battle → PR 06 OpenGym shell & visual freeze → PR 07–13 tested v3.1 reward kernel → PR 14–22 wiring/sync/release.

Only run **one PR at a time**. Do not activate purchase/reward/level-up logic in design previews. No new release/deploy and no auto-merges.

## PR 01 acceptance

* Start from this PR 00 commit, on a new stacked branch.
* Port real source layout structures from pinned Shadcn Admin files, without copying its admin analytics dashboard or mock account.
* Replace root HTML, string-generated UI and global legacy styles *within the rebuild branch*; keep Node/Electron as transitional shell only if essential.
* Render actionable sidebar navigation, top toolbar, search, theme and view placeholder; no static mock buttons.
* Test at 1440×900, 1280×800, 1024×768, 390×844; Light/Dark, keyboard and screen reader accessible.
* Commit screenshot evidence and legal provenance. Keep draft until reviewed; then proceed PR 02. **No XP/coin engine yet.**
