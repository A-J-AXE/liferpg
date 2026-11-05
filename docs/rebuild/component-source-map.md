# PR 00 — Verified GitHub source lock
Date: 2026-11-05. All SHAs below are commit SHAs read from the live GitHub API, not guessed source paths. **No third-party UI or artwork has been imported in PR 00.** PR 01 imports selected compatible source, PR 02 imports artwork.

## Architecture decision (design-only phase)

* New frontend: React 19, TypeScript, existing Vite/esbuild-compatible shadcn/Radix/cmdk/Lucide foundation; one declarative app root. Do not continue extending the legacy string-rendered `app.js`, multi-layer `style.css` and generated `shell.js`.
* Replace old frontend in PR 01 **on this rebuild stack only**; remove old UI files after new shell compiles, navigation works, and tests pass. The old Git refs and Git history remain intact.
* Keep existing Node/Electron/server only as isolated transitional transport, subject to clean replacement during integration PRs. No demo user data requires migration; do not delete remote infrastructure or real credentials.
* Use separate shell, Akiflow Planner, RPG home, and OpenGym content areas. One consistent interaction vocabulary, **not** the same card layout everywhere.
* Frontend PR 01-06 use conspicuously labeled local demo/preview fixtures; reward XP, wallet, earned status and purchase buttons must not present invented transactions as real.

## Verified component candidates (pinned upstream)

| Area | Repo at commit | Inspected source | License | Selection/constraint |
|---|---|---|---|---|
| Shell | [Shadcn Admin](https://github.com/satnaing/shadcn-admin/tree/e16c87f213a5ba5e45964e9b67c792105ec74d26) | [app-sidebar.tsx](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/components/layout/app-sidebar.tsx), [header.tsx](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/components/layout/header.tsx), `src/components/layout/nav-group.tsx` | MIT | **Selected** source for shell composition, sidebar/collapse, header, navigation. Port only needed files; source depends on upstream layout context. |
| Tasks/project picker | [Circle](https://github.com/ln-dev7/circle/tree/b0ba7ddcc3d0f4c16092236ca6a01b56c0614810) | [issue-line.tsx](https://github.com/ln-dev7/circle/blob/b0ba7ddcc3d0f4c16092236ca6a01b56c0614810/components/common/issues/issue-line.tsx), [issue-details.tsx](https://github.com/ln-dev7/circle/blob/b0ba7ddcc3d0f4c16092236ca6a01b56c0614810/components/common/issues/details/issue-details.tsx), `components/common/issues/details/issue-properties-panel.tsx`, `components/common/issues/issue-context-menu.tsx` | MIT | **Selected** reference and future port. Next.js navigation, mock store and domain data must be adapted; cannot just copy the pages. |
| Planner | [CalendarCN](https://github.com/vmnog/calendarcn/tree/23ce3122f698fc59251ba7b7027701d54e8e0c3b) | [calendar.tsx](https://github.com/vmnog/calendarcn/blob/23ce3122f698fc59251ba7b7027701d54e8e0c3b/src/components/calendar.tsx), `src/components/calendar-provider.tsx`, `src/components/calendar-event-item.tsx`, `src/components/time-grid.tsx` | MIT | **Candidate, not yet imported.** Require 1-7 days, drag, overlap and keyboard checks. Do not install multiple calendar engines. |
| Character/rewards visual | [Life RPG](https://github.com/gxxnja/life-rpg/tree/3e80fd5a4544e397cc843d80cce5ff018b0633a9) | [CharacterSheet.tsx](https://github.com/gxxnja/life-rpg/blob/3e80fd5a4544e397cc843d80cce5ff018b0633a9/src/components/game/CharacterSheet.tsx), `src/components/game/QuestLog.tsx`, `src/components/game/RewardShop.tsx` | MIT | **Reference only for visual PRs.** Reward algorithm v3.1 overrides any example gamification formulas. |
| Motion | [Motion Primitives](https://github.com/ibelick/motion-primitives/tree/120f64f6ca60348e251f929e9c81f11ccbe45eda) | `components/` registry, `cli/README.md` | MIT | Candidate for later small feedback; no reward animations before ledger v3.1 tests. |
| 3D illustrated assets | [Fluent Emoji](https://github.com/microsoft/fluentui-emoji/tree/1ffb34c752ecf5d402f04cfb4b392c77f57c54bc) | See [asset-manifest.md](asset-manifest.md) for exact `assets/{name}/3D/*.png` paths | MIT | **Selected** for authentic downloadable 3D art. Copy genuine PNGs, no generated substitutes. |
| 3Dicons concept | [3dicons website source](https://github.com/realvjy/3dicons/tree/8884d59e68a7bae0e0e2163af5b6c2ad992c01c8) | `src/components/layout.js`, `static/`, README | CC0-1.0 | **Reference only**: this Git repo is primarily website source and does not contain a complete individual-icon asset pack. Do not claim individual assets were imported from it. Official downloads at [3dicons.co](https://3dicons.co/). |
| OpenGym | [DuarteSantos8/openGym](https://github.com/DuarteSantos8/openGym/tree/8fb98b16861a2728652302a7e6e30c50548493a0) | [NOTICE.md](https://github.com/DuarteSantos8/openGym/blob/8fb98b16861a2728652302a7e6e30c50548493a0/NOTICE.md), [docs](https://opengym.ch/docs.html) | AGPL-3.0 code | Future integration only. **Exercise pictures/animations are not generally reusable**: licensed Gym visual media; check permission and separate licenses before import. Consider embedding or contributing rather than mixing AGPL into an incompatible distribution. |

## Legal and scope gates

1. Never reproduce proprietary Akiflow/Notion/Life RPG screenshots or artwork as source assets. User screenshots are private visual references.
2. Always copy license and attribution notices where required. `microsoft/fluentui-emoji` MIT applies to its repository; cite pinned file in each asset manifest entry.
3. Do not silently import OpenGym exercise animation files: see its `NOTICE.md`, with separate Gym visual terms.
4. External 21st.dev MCP was not connected. No source claim is based on it.
5. Every implemented component PR must update an **imported** manifest with exact local paths. Source candidates and visual references are not imported assets.

## PR 01 targets

Port a small subset of the Shadcn Admin sidebar/header architecture to the new React shell (not the entire admin app). Provide real workspace navigation, focus/search controls, Light/Dark modes, and screenshots at 1440x900 / 1280x800 / 390px. Replace the old frontend entrypoint in this rebuild branch only after the new shell works. **No RPG rewards or Planner math in PR 01.**
