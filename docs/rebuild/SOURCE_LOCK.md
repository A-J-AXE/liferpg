# Verified source lock — 2026-11-05

All entries below were checked against the actual public GitHub repository tree and repository license metadata. STATUS = selected CANDIDATE; files are NOT imported into LifeOS by PR 00. The exact upstream file and license must be inspected again immediately before code is copied.

| Role | Repo / pinned commit | Actual upstream path(s) | Declared repo license |
| --- | --- | --- | --- |
| App shell/sidebar | satnaing/shadcn-admin @ e16c87f213a5ba5e45964e9b67c792105ec74d26 | src/components/layout/app-sidebar.tsx; src/components/layout/header.tsx; src/components/layout/authenticated-layout.tsx; src/components/command-menu.tsx | MIT |
| Compact issue row and menus | ln-dev7/circle @ b0ba7ddcc3d0f4c16092236ca6a01b56c0614810 | components/common/issues/issue-line.tsx; components/common/issues/issue-context-menu.tsx; components/common/issues/details/issue-details.tsx; components/common/issues/details/issue-properties-panel.tsx | MIT |
| Calendar day/week source | vmnog/calendarcn @ 23ce3122f698fc59251ba7b7027701d54e8e0c3b | src/components/time-grid.tsx; src/components/week-view-grid.tsx; src/components/calendar-provider.tsx; src/components/calendar-event-item.tsx | MIT |
| RPG code reference | gxxnja/life-rpg @ 3e80fd5a4544e397cc843d80cce5ff018b0633a9 | src/components/game/CharacterSheet.tsx; src/components/game/QuestLog.tsx; src/components/game/BossBattle.tsx; src/components/game/RewardShop.tsx | MIT |
| Animation primitives | ibelick/motion-primitives @ 120f64f6ca60348e251f929e9c81f11ccbe45eda | components/ (component selection and dependency review deferred to PR 02) | MIT |
| 3Dicons homepage repo | realvjy/3dicons @ 8884d59e68a7bae0e0e2163af5b6c2ad992c01c8 | static/notebook-dynamic-00.png and static/heart.png VERIFIED, but full individual downloadable icon pack NOT found in this repo tree | CC0-1.0 |
| Real tile artwork | microsoft/fluentui-emoji @ 1ffb34c752ecf5d402f04cfb4b392c77f57c54bc | see ARTWORK_MANIFEST.md for exact assets/.../3D/*.png paths | MIT repo; verify per-asset notices |
| RPG symbols fallback | game-icons/icons @ 82d948812bfe3f269ef8f731dcdb07b08160edc4 | individual author folders, e.g. andymeneely/riposte.svg; license/attribution must be checked per icon | NOASSERTION; not cleared |
| Avatars | dicebear/dicebear @ 4db7af08605ecbf1c142b710ad1819473c096895 | style packages; exact style/license selection deferred | MIT engine; styles vary |
| Design guidelines | Leonxlnx/taste-skill @ 9b4bf937a1f69348126959c15d2f99a73e65699b | skills/taste-skill/SKILL.md | MIT |
| Compact UI guidelines | Leonxlnx/taste-skill-classics @ 5e08c9383dc4ad7fc0df70e1ac8cfa09ec356305 | skills/minimalist-skill/SKILL.md | MIT |
| UI engineering skill | addyosmani/agent-skills @ 301b02b12bff98e4688e6984af6556802322bbde | skills/frontend-ui-engineering/SKILL.md | MIT |
| Visual design advisor | nextlevelbuilder/ui-ux-pro-max-skill @ b7d5353e0130feb8c5574ef1251f8a1db1873ccb | .claude/skills/ui-ux-pro-max/SKILL.md | MIT |

Upstream file link template:
https://github.com/OWNER/REPO/blob/COMMIT/EXACT_PATH

## Review decisions
- Select SHADCN ADMIN for navigation behavior only. Its business-dashboard cards are NOT the LifeOS visual identity.
- Select CIRCLE for compact desktop task interactions. Check Next.js-specific dependencies before porting to an Electron/Vite-ready React shell.
- CALENDARCN is first calendar candidate. Do not install multiple competing calendar state providers. Evaluate whether exactly 1-7 visible days is supported before code selection.
- Prefer actual MICROSOFT FLUENT EMOJI 3D PNGs for RPG navigation where each file is present in the Git tree. The realvjy/3dicons repo is predominantly the gallery website; DO NOT invent asset paths or claim the full icon pack was imported.
- Native OpenGym is already vendored in fitness/, pinned in the existing README to a75b922181ed266e0e4658016b6d4fc33452eab0. Its root/fitness license is AGPL-3.0; verify full dependencies, license notices and deployment restrictions before changing distribution.
- Screenshots of Akiflow and the original Life RPG are behavioral/visual references only, not a license to copy proprietary code.

## Required import record per PR
State upstream repo, exact SHA, source file, license, dependencies, local destination, modifications, status: inspected/imported/blocked. Never claim imported if the source wasn't actually copied or installed.
