# LifeOS clean frontend rebuild — governing instructions

The current implementation is an authorized clean rebuild. **All old frontend components and styles are replaceable/deleteable.** No demo/test data must survive. Preserve the Git history and do not delete remote branches, hosted accounts, infrastructure or credentials. Never merge or deploy publicly without explicit user authorization.

## Start here
1. `docs/rebuild/REBUILD-DECISIONS.md` — staged deletions and milestones
2. `docs/rebuild/component-source-map.md` — pinned, inspected GitHub source and licenses
3. `docs/rebuild/asset-manifest.md` — exact genuine 3D art paths; imports are still pending
4. `docs/rebuild/visual-reference-matrix.md` — screenshot-based acceptance
5. `docs/rebuild/reward-v3.1-contract.md` — **most important functional contract**, 51 tests
6. `docs/rebuild/INSTALLATION.md` — Codex skills and conflicts
7. `.agents/skills/lifeos-template-first-frontend/SKILL.md` — project-specific sourcing process

## Scope
- Current PR 00: source lock only. Don't modify app code in this PR. Next PR 01 deletes and replaces old string-generated frontend once the new React shell has actual screenshot/test evidence.
- PR 01–06: frontend/UI-only with clearly labeled DEMO fixtures, not earned money or promises of real sync.
- PR 07–13: v3.1 economy, quests, deterministic allocation, ledger, Finish, Undo and all golden tests.
- PR 14–22: connect live transactions, OpenGym, Google Calendar, desktop/browser sync and release QA.

## Hard constraints
- Use real licensed GitHub source/art, with pinned SHA/exact path/provenance. No AI-generated 3D icons, fabricated SVG art or unattributed source.
- Compact, keyboard-accessible real product UI. RPG home uses character / destinations / activity; Planner is dense with an hourly timeline; Upcoming uses task boards; OpenGym retains full workout flows.
- Taste Skill is critique guidance, not a landing-page architecture. Minimalist UI may not forbid small Lucide actions required by LifeOS.
- No duplicate currency creation. Exact v3.1 reward snapshots and ledger are sole authorities once wired; visual animations can never award coins.
- Work on only one draft stacked PR at a time, run verification, capture screenshots, record deviations and stop.
