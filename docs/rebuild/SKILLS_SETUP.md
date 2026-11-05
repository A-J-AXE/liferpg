# Codex skill setup — verify, install once, invoke by phase

Current feat/lifeos baseline contains only .agents/skills/compact-desktop-ui and .agents/skills/shadcn. Other skills may exist on previous UNMERGED PR branches; don't assume they are installed on this rebuild branch.

## Design and engineering
- LifeOS-specific: .agents/skills/lifeos-template-first-frontend/SKILL.md is INCLUDED in PR 00; read on every frontend slice.
- UI UX Pro Max (https://github.com/nextlevelbuilder/ui-ux-pro-max-skill): only install if absent: npx ui-ux-pro-max-cli init --ai codex. Read installed SKILL.md before a new screen. Do not overwrite a curated project version blindly.
- Frontend UI Engineering (https://github.com/addyosmani/agent-skills): inspect the pinned skills/frontend-ui-engineering/SKILL.md and install/copy it with its MIT license if absent. Engineering review before PR.
- Taste Skill (https://github.com/Leonxlnx/taste-skill): npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend" OR from Codex: codex plugin marketplace add Leonxlnx/taste-skill; codex plugin add taste-skill@taste-skill. Start new Codex session. Requires Node 22+ and Chromium/Chrome/Edge for its browser checker. Use its design critique only for product surfaces; do not use its marketing page starter or page checker as a substitute for app E2E tests.
- Minimalist UI (https://github.com/Leonxlnx/taste-skill-classics): npx skills add https://github.com/Leonxlnx/taste-skill-classics --skill "minimalist-ui". Opt in with $minimalist-ui for compact daily planning UI; do not apply its total no-emoji/Lucide or generous bento-card rules to RPG artwork.
- Playwright CLI (https://github.com/microsoft/playwright-cli): npm install -g @playwright/cli@latest; playwright-cli install --skills=agents. Test actual pages/screens. On systems without a browser, report blocker; no invented screenshots.

## Phase routing
PR 00: Template-first SOURCE inspection, UI UX Pro Max visual brief, Minimalist for planner constraints, Taste for RPG critique; NO live UI claim.
PR 01: Template-first -> UI UX Pro Max -> Frontend UI Engineering -> Playwright shell screenshots.
PR 02: Template-first for actual artwork -> Taste review (selectively) -> Engineering -> Playwright real character/navigation screenshots.
PR 03-04: Template-first -> Minimalist for dense controls -> Engineering -> Playwright interactions/screenshot.
PR 05-06: Template-first -> suitable design advisor -> Engineering -> Playwright.
PR 07-13: Reward System v3.1 contract and domain tests FIRST; design skills must not alter reward mathematics.
PR 14+: Engineering + Playwright for honest committed feedback, a11y and source licensing.

## Critical limitations
A chat-hosted GitHub connector cannot install skills on the user's Windows computer, run local Codex sessions or inspect a signed-in desktop program. The commands above are instructions for Codex/local setup, NOT claims that this PR installed those external tools. Project-local lifeos-template-first skill is committed to the repo.
