# Frontend work in LifeOS

For the RPG Overview, read the project-local UI UX Pro Max and Frontend UI Engineering skills, plus docs/COMPONENT_SOURCES.md and docs/VISUAL_ACCEPTANCE.md. Keep the character, destination grid and journal distinct. Exercise the isolated RPG playground before changing production behavior. Keep reward feedback tied to real receipts and respect reduced motion.

1. Read `docs/DESIGN_SYSTEM.md` and the project skill at `.agents/skills/shadcn/SKILL.md` before frontend changes.
2. Inspect `components.json`, `ui/components/ui/`, and existing compositions first.
3. When a component is needed, search the official `@shadcn` registry using the shadcn MCP server and inspect the relevant item. If the server is unavailable, report that and restore it; do not quietly improvise a replacement.
4. Reuse installed components whenever available.
5. Add missing official components from the repository root with `npx shadcn@latest add @shadcn/<name>`. Review changes and retain upstream notices. Never overwrite local adaptations silently.
6. Style through the approved semantic theme tokens. Use the shared primitives in both the product and the showcase.
7. Do not implement a homemade equivalent. Document a justified exception, the registry search, and the affected surfaces in the design system before shipping a custom control.
8. Preserve the design language across screens. Keep the full native openGym experience intact. Build, typecheck, and verify the affected interaction in Light and Black, with keyboard and a narrow viewport.

For planner interactions, read `docs/INTERACTION_PATTERNS.md`, `docs/UI_REFERENCE.md`, `docs/UI_ACCEPTANCE_CHECKLIST.md` and `.agents/skills/compact-desktop-ui/SKILL.md` before editing. Use the actual reference PNGs. Validate real keyboard, touch and persistence behavior. The approved workspace restructure extends these patterns to Inbox, Upcoming, Planner and project task lists. Read docs/planner-view-architecture.md, docs/task-planning-data-model.md and docs/akiflow-interaction-reference.md. Mount the hourly timeline only in Planner. Use task boards for Upcoming Overview/Day/Week/Month, project-scoped task lists for projects and 1–7 days for Planner. Preserve task identity, planning precision and existing data. Exercise actual navigation, scheduling and cross-view persistence before shipping.
