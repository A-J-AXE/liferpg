# Frontend work in LifeOS

1. Read `docs/DESIGN_SYSTEM.md` and the project skill at `.agents/skills/shadcn/SKILL.md` before frontend changes.
2. Inspect `components.json`, `ui/components/ui/`, and existing compositions first.
3. When a component is needed, inspect installed shadcn/Radix source and use official shadcn registry/MCP when actually connected. If unavailable, record the gap and use the already installed component implementation or documented native equivalent; never fabricate a tool call or install credentials.
4. Reuse installed components whenever available.
5. Add missing official components from the repository root with `npx shadcn@latest add @shadcn/<name>`. Review changes and retain upstream notices. Never overwrite local adaptations silently.
6. Style through the approved semantic theme tokens. Use the shared primitives in both the product and the showcase.
7. Do not implement a homemade equivalent. Document a justified exception, the registry search, and the affected surfaces in the design system before shipping a custom control.
8. Preserve the design language across screens. Keep the full native openGym experience intact. Build, typecheck, and verify the affected interaction in Light and Black, with keyboard and a narrow viewport.

## Task planning workspaces
- The hourly calendar is only in Planner. Never use a shared agenda+calendar fallback for Projects, Inbox or Upcoming.
- Upcoming has four task-only modes: Overview, Day, Week, Month. Week and month assignments must not fabricate exact times.
- Preserve task identity, project association, receipts and history when moving between planning periods or the hourly calendar.
- Planner supports 1–7 visible days; preserve legacy Week and Month calendar modes for existing users.
- Use compact task rows, inline quick-add and direct manipulation. Avoid decorative dashboard cards.

## Permanent premium desktop rules (PR #2 onward)

- Before any frontend PR, read `docs/DESIGN_SYSTEM.md`, `docs/UX_PRINCIPLES.md`, `docs/INTERACTION_PATTERNS.md`, `docs/COMPONENT_SOURCES.md`, and `docs/VISUAL_ACCEPTANCE.md`.
- Use `.agents/skills/ui-ux-pro-max/SKILL.md` for product-level visual decisions and `.agents/skills/frontend-ui-engineering/SKILL.md` for implementation checks. The former is a curated local subset; available domains and upstream commit are recorded in its SOURCE.md.
- Treat `design-system/lifeos/MASTER.md` as the single product-wide visual contract. Do not introduce a parallel theme or copy proprietary app assets.
- Reuse installed shadcn, Radix, cmdk and Lucide. Inspect upstream source and MIT or other license before importing. 21st.dev is optional and requires an authenticated external connection; no actual MCP access is assumed.
- Build action-first, icon-led, compact UIs. Never add decorative giant cards, inert buttons, oversized forms or redundant calendar panes.
- The `/design-system` showcase is an isolated interactive playground; demonstrations must have real local state transitions but must never modify production data.
- Follow `docs/MASTER_SPEC_TRACKER.md` and `docs/PR_ROADMAP.md` for all 27 requirement groups; an implemented feature is not validated until actual behavior and visual evidence exist.
- Validate every frontend PR in Light and Black at desktop and narrow widths, with keyboard and browser tests, screenshot artifacts, and documented regressions. Keep Windows/Electron-specific claims separate from browser verification.
- Use stacked draft PRs from the current implementation head. Never merge, deploy publicly, rewrite history, store credentials or modify user data without approval.
