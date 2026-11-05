# LifeOS clean rebuild — Source Lock / PR 00

Status: SOURCE AUDIT AND CONTRACT ONLY. Not a new UI, not a working reward engine, not user-approved visual design.
Date: 2026-11-05.
Rebuild branch: rebuild/lifeos-v31-source-lock, branched from feat/lifeos at bf2227c58a32fc578b8976d1844b2022e924bc94.

## Why rebuild
Baseline shows index.html mounting an aside/main/dialog and app.js, compiled shell.js and components.css plus a separate JSX shell and workspace views. Layering theme overrides onto this mixed structure has not delivered a consistent desktop product. The new design should replace rather than perpetuate the legacy frontend. Keep useful implementation only when demonstrably better than a fresh coherent implementation.

## Scope and recovery
The user explicitly permits full frontend replacement and discarding demo/test data. Work only on rebuild branches. Existing feat/lifeos and stacked draft PRs remain available in Git history; PR 00 removes no production code. Don't delete fitness/, remote infrastructure, secrets, cloud volumes, accounts, or unrelated service resources. Note that root LICENSE and fitness/LICENSE are AGPL-3.0; source reuse must preserve obligations.

## Eight layers — design first, economics next
0. PR 00 — repo audit, pinned GitHub source map, asset license and location check, visual and reward contracts; approval Gate A.
1. PR 01 — actual React desktop shell with compact sidebar/topbar, real sourced navigation components and screenshot checks; Gate B.
2. PR 02 — character + illustrated RPG home, XP/coin display clearly flagged as preview; Gate B.
3. PR 03 — Akiflow-density task editor, inline project/image picker and subtask parent/child hierarchy; Gate B.
4. PR 04 — Planner/Upcoming visuals from one calendar engine and task-only boards; Gate B.
5. PR 05 — Skills, Growth and Battle; PR 06 — OpenGym UI frame/design freeze; Gate D.
6. PR 07-13 — schemas, exact economy, Hamilton allocator, branch ownership, immutable ledger, Finish/Reopen, wallet/skill projections; Gate R.
7. PR 14-22 — reward UI, activity, feedback/sound, app flows, native OpenGym, Google, sync/Electron and final test; Gates I/Release.

No PR can call demo balances real money or represent a cosmetic checkbox as a committed reward.

## PR 00 files
- SOURCE_LOCK.md: specific pinned GitHub sources, exact paths and licensing.
- ARTWORK_MANIFEST.md: individually verified downloadable artwork candidates.
- VISUAL_CONTRACT.md: precise view layouts, UX and acceptance gates.
- REWARD_V31_CONTRACT.md: economy contract and all 51 test IDs grouped.
- SKILLS_SETUP.md: how Codex installs/uses design and visual-QA skills.
- PR01_HANDOFF.md: next small code change and stop condition.
- .agents/skills/lifeos-template-first-frontend/SKILL.md: persistent workflow.
- AGENTS.md: top-level rules for future Codex sessions.

## Canonical source materials
LifeOS RPG Reward System Design Specification v3.1 (56 pages), SHA-256 1f90e82853117bbf4e85768c4c6155fff3ab890ae124dddd10aa44681d64269f.
LifeOS Complete Onion Plan + Taste Skill + Reward v3.1 (89 pages), SHA-256 4b7c67735383f8a14c134d7b3353ec7ac71230ec5eec2c49eca62be0b1781fae.
Original files were user-provided in chat and are not yet checked into Git; do not claim the source PDF is present in the repository.
