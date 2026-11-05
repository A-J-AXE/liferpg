---
name: lifeos-template-first-frontend
description: Use for every LifeOS frontend slice. Enforces pinned GitHub source reuse, coherent RPG/planner design, reward-safe preview state and screenshot acceptance.
---

# LifeOS source-first frontend implementation skill

This skill applies to a dense desktop planner + RPG progression + native fitness application, NOT a marketing website. Read AGENTS.md, docs/rebuild/README.md, docs/rebuild/SOURCE_LOCK.md, docs/rebuild/VISUAL_CONTRACT.md and docs/rebuild/REWARD_V31_CONTRACT.md before making UI changes.

## Required sequence
1. Pick exactly one view and a narrow acceptance checklist for this PR.
2. Inspect the REAL pinned upstream source file and its license. Only import eligible components/assets. Record source path, SHA, license, dependencies, destination, modifications. Nothing merely inspired by a screenshot may be claimed as imported source.
3. Design with the approved LifeOS density; icon-led contextual controls, short labels, semantic surfaces and direct editing. Do not wrap every feature in identical cards. Never substitute a website hero, huge whitespace or decorative shader for a planner.
4. Build the smallest coherent, runnable vertical preview using visibly labeled sandbox fixtures. Do not fabricate committed rewards, paid wallet entries or real synchronization.
5. Exercise keyboard, pointer, focus, narrow sizes, 200% zoom, dark/light and prefers-reduced-motion. Capture real screenshots. Compare side-by-side against source demo and user references.
6. Produce a PR summary listing changed files, source path provenance, verified screenshots, behavior tests, known gaps and any deviations. Stop after the gate; no auto-merge.

## Approved advisor sequence
- Template-first skill: source, permission, constraints and QA checklist (this file).
- UI UX Pro Max: optional style design reasoning only; NOT source/art authority.
- Minimalist UI: opt-in for task rows, editor, planner and compact controls; reject its blanket Lucide/emoji/padding bans when contrary to LifeOS.
- Taste Skill: selectively review RPG character/art composition and browser consistency; do NOT import its landing-page starter, one-section-per-screen, hero, photo, shader or scroll-scene rules.
- Frontend UI Engineering: engineering implementation and accessibility.
- Playwright CLI: real browser operation and screenshot evidence. Running a checker designed for landing pages is NOT an acceptance test for the Planner.

## Stop conditions
No real imported source path; license unverified; fake earned rewards; two wallets/XP authorities; untested visuals described as approved; hidden primary controls; destructive remote/data operations. Escalate blockers in PR notes.
