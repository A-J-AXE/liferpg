# PR 01 — independent React shell candidate

**Status:** Implementation branch only. Do not merge or promote to default route until
Gate B has actual screenshot review. Baseline planner remains at `/`; new shell
is available at `/rebuild` only after building assets. No user data was deleted.

## Why staged instead of a root cutover

PR 01's job is the shell, not feature parity for Planner, task CRUD or rewards.
An immediate root cutover would hide existing functioning workflows behind
unimplemented pages. The new shell is **not layered over the old one**: it has
a separate HTML root, React renderer and scoped CSS. Only the OpenGym view
points to the existing native workout app; future domain pages will replace
empty states one PR at a time. Promote the route after those screens pass
their review gates.

## Develop and inspect

```bash
npm ci
npm run build:rebuild
node server.mjs
# open http://127.0.0.1:4310/rebuild
```

For the real browser test run `npm run verify:rebuild` after the build.
Set `LIFEOS_BROWSER` to a Chromium/Edge executable if not detected.
Screenshots must show 1440x900, 1280x800, 390x844, 320x720
in **both themes**, plus keyboard focus and search. CI uploads PNGs as
`lifeos-pr01-screenshots`. A successful build does not equal visual approval.

## Source provenance — inspected 2026-11-05

| Upstream | Commit and inspected source | Local destination | Use / alteration |
| --- | --- | --- | --- |
| satnaing/shadcn-admin (MIT) | e16c87f213a5ba5e45964e9b67c792105ec74d26 / src/components/layout/app-sidebar.tsx | ui/rebuild/app.jsx | Same SidebarHeader/Content/Footer + grouped navigation composition; LifeOS route taxonomy and brand; removes tanstack/layout provider |
| satnaing/shadcn-admin (MIT) | same / src/components/layout/header.tsx | ui/rebuild/app.jsx | Compact header and sidebar trigger; sticky header, search and theme actions |
| satnaing/shadcn-admin (MIT) | same / src/components/command-menu.tsx | ui/rebuild/app.jsx | Grouped cmdk command dialog with run-and-close; removes tanstack router |
| shadcn components already vendored in LifeOS | ui/components/ui/sidebar.tsx, command.tsx, button.tsx | imported, not recopied | Actual sidebar/cmdk/shadcn primitives |
| ln-dev7/circle (MIT) | b0ba7ddcc3d0f4c16092236ca6a01b56c0614810 / components/common/issues/issue-line.tsx | not imported in PR 01 | Inspected; issue row belongs in task-editor PR 03 |

MIT notice from shadcn-admin is retained in `ui/rebuild/UPSTREAM-LICENSE.txt`.
Root/fitness AGPL-3.0 obligations remain unchanged.
No artwork imported in PR 01; 3D illustrations start PR 02.

## Shell interactions

- Actual responsive shadcn sidebar / mobile sheet, collapse/expand via controls.
- Home, Inbox, Planner, Upcoming, Projects, Skills, Growth, Battle, Market, OpenGym
  and Settings navigation; hash URLs allow direct-link/reload.
- Cmd/Ctrl+K command palette with grouped destinations, Escape close,
  theme switch and focusable controls.
- Theme switch scoped to `lifeos:rebuild-theme`, never mutating old theme.
- OpenGym embeds the native app at the same local or hosted URL contract
  as the legacy shell, and offers a separate link.

## Non-goals and unresolved gates

- Empty states are clearly labeled as future phases; no fake wallet, XP, tasks,
  fitness history or sync receipts.
- Browser screenshots and real OpenGym startup must be reviewed.
- Existing Electron continues to load legacy root `/`. Preview is accessible
  via its browser or by opening `/rebuild`; a dedicated Electron cutover is
  deliberately deferred until new workspaces exist.
- No baseline code deletion, no reward math changes, no design approval claimed.
