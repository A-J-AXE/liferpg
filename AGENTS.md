# Frontend work in LifeOS

1. Read `docs/DESIGN_SYSTEM.md` and the project skill at `.agents/skills/shadcn/SKILL.md` before frontend changes.
2. Inspect `components.json`, `ui/components/ui/`, and existing compositions first.
3. When a component is needed, search the official `@shadcn` registry using the shadcn MCP server and inspect the relevant item. If the server is unavailable, report that and restore it; do not quietly improvise a replacement.
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
