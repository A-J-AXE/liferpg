# PR 00 — Codex skills setup, real capabilities and conflict policy

These are **installation commands for the user's Codex machine**. GitHub-only edits cannot run local Windows Codex plugins, access the user's signed-in Akiflow window or authenticate third-party MCP services. PR 00 verifies the upstream sources; it does **not** claim those tools were executed on Windows.

## Project-local skills already present at the baseline
- `.agents/skills/shadcn/SKILL.md` — inspect actual components, avoid fake library imports.
- `.agents/skills/compact-desktop-ui/SKILL.md` — desktop interaction guidance.
- The earlier `feat/lifeos-premium-design-system` branch also contains curated `ui-ux-pro-max` and `frontend-ui-engineering` skills. They are not present in this PR 00 baseline; port/reinstall before PR 01 only after reviewing diffs.

## Install / discover on Windows PowerShell (choose one route per skill)

```powershell
# Official UI UX Pro Max Codex setup; skip if project-local version is already present.
npx ui-ux-pro-max-cli init --ai codex

# Optional Taste Skill Codex plugin: *not* a source of Planner layouts.
codex plugin marketplace add Leonxlnx/taste-skill
codex plugin add taste-skill@taste-skill

# Optional standalone version, instead of installing plugin:
# npx skills add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend

# Minimalist UI (opt-in for dense desktop/task surfaces):
npx skills add https://github.com/Leonxlnx/taste-skill-classics --skill minimalist-ui

# Playwright CLI browser QA + Codex agent skill:
npm install -g @playwright/cli@latest
playwright-cli install --skills=agents
```

Restart Codex, list/discover skills (via `/skills` or `$` selector where supported) and confirm the actual skill name in its `SKILL.md`. Node 22+ and Chrome/Edge/Chromium are needed for Taste Skill checker. Use a project-local installation and review files for conflicting changes.

## Exact responsibilities

| Step | Use | Must produce |
|---|---|---|
| Source first | `lifeos-template-first-frontend` (project-local skill) | Exact inspected repo SHA/path, license, source-to-target component map |
| Layout decision | `ui-ux-pro-max` | Single design language, density and accessibility rules |
| Task/Planner | `minimalist-ui` explicitly | Compact interaction critique; ignore any rule conflicting with LifeOS functional controls |
| RPG art/home | `design-taste-frontend` (Taste) selectively | Screenshot critique, art proportions, spacing, polish |
| Code | `frontend-ui-engineering` or shadcn skill | Typed components, accessible state, tests |
| Proof | `playwright-cli` | Light/Dark screenshots and real keyboard/click flow |

### Mandatory conflict resolution

**Reward v3.1 > user screenshots and LifeOS workflow > verified source/license > LifeOS design tokens > external skill suggestions.**
Taste Skill is oriented toward landing pages and has rules such as "one section per screen" and large hero composition. Those must **not** govern Planner or dense task lists. Minimalist UI prohibits Lucide icons and has editorial whitespace rules; LifeOS intentionally retains Lucide for small action controls. Do not apply those prohibitions literally. Neither skill may alter the reward math, buttons' accessibility or the OpenGym data model.

## Verified skill source revisions
- [Taste Skill](https://github.com/Leonxlnx/taste-skill/tree/9b4bf937a1f69348126959c15d2f99a73e65699b/skills/taste-skill) — SKILL metadata name `design-taste-frontend`; MIT.
- [Minimalist](https://github.com/Leonxlnx/taste-skill-classics/blob/5e08c9383dc4ad7fc0df70e1ac8cfa09ec356305/skills/minimalist-skill/SKILL.md) — metadata name `minimalist-ui`, opt-in `disable-model-invocation: true`; MIT.
- [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) — use existing project-local version or official installer.
- [Frontend UI Engineering](https://github.com/addyosmani/agent-skills/tree/main/skills/frontend-ui-engineering) — existing earlier PR #2 version usable as source.
