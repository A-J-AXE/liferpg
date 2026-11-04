# LifeOS Design System — desktop product, not website dashboard

**Status:** approved implementation direction for PR #2 and every downstream PR. This replaces the previous "agenda+calendar everywhere" visual assumption. Functional rules in the original specification and `docs/planner-view-architecture.md` take precedence over decorative references.

## Purpose and hierarchy

LifeOS combines Akiflow-grade task planning, LifeRPG progression, and native OpenGym. Its permanent visual direction is **compact desktop utility**: Linear-like density and navigation, Akiflow-like planning, Raycast-like keyboard actions, restrained Revolut-like hierarchy and numerical feedback. The actual brand remains LifeOS.

One main activity per screen. **Planner** contains the only default hourly time grid. **Upcoming** is a task board (Overview / Day / Week / Month). **Inbox and Project pages** prioritize tasks and capture. Rewards and fitness belong in their own contexts, not large decorative planner cards.

This design uses existing shadcn/ui source under `ui/components/ui/`, Radix, cmdk, React 19, Lucide, and native elements when appropriate. The existing hybrid DOM/React implementation must retain correct behavior until migrated. Do not introduce a parallel UI framework.

## Design tokens and geometry

Keep the existing semantic CSS variables in `style.css`: `--bg`, `--panel`, `--ink`, `--line`, `--muted`, `--rail`, `--accent`, `--tint`, `--grid`, and named priority/XP colors. `ui/theme.css` maps them into Tailwind. Do not hardcode role-specific hex colors in each component.

Shared LifeOS density tokens (exposed as `--lo-*` in CSS):

| Token | Desktop default | Role |
| --- | --- | --- |
| `--lo-unit` | 4px | Base spacing rhythm |
| `--lo-control` | 32px | Default toolbar button / input height |
| `--lo-control-sm` | 28px | Compact icon action |
| `--lo-row` | 38px | Task row target (content can expand) |
| `--lo-sidebar` | 228px | Expanded desktop navigation |
| `--lo-sidebar-mini` | 56px | Collapsed desktop navigation |
| `--lo-radius` | 7px | Surface and popover radius |
| `--lo-font-xs` | 11px | Secondary status / duration |
| `--lo-font-sm` | 12px | Row metadata and compact controls |
| `--lo-font` | 13px | Main task/command text |
| `--lo-title` | 24px | Workspace heading |
| `--lo-motion-fast` | 120ms | Hover and selection |
| `--lo-motion` | 180ms | Menu and panel transitions |

Windows Segoe UI first, then system-ui fallback. Do not add or distribute font files. Heading weight 600–650, list item 500–550, metadata 400–500. Numeric values and times use tabular digits. Main interfaces should not use decorative Georgia-like serif headings. No giant marketing hero sections.

### Visual balance

Use hairline separators before enclosing every element in cards. Avoid nested card backgrounds. Dense content should align to a common left edge; space indicates relatedness, not decoration. Prefer small connected toolbars to scattered pill buttons. Use semantic accent color mainly for current selection, focus, active planning and reward confirmation.

Light: warm off-white canvas with near-white content panels, dark readable text. Black: nearly black canvas, slightly raised neutral surfaces, readable violet accent and visible hairlines. High/Medium/Low and XP remain semantically distinct; never communicate meaning only by color.

## Component interaction contracts

- **Navigation:** 32px compact rows; icon + text; one active item; collapsed items have tooltips; Ctrl/Cmd+K opens search; project folders remain usable. Legacy Today/Tasks aliases must not dominate primary navigation.
- **Task row:** checkbox, title, quiet metadata, one contextual overflow action. Selected and focused states visible; completion/undo reflects persisted state, not a mock visual change. Keep row action targets keyboard reachable; do not require hover.
- **Task creation:** title-first inline capture, additional fields in contextual controls/popover; no large all-fields form by default.
- **Planner:** independently scrollable hourly timeline; 1–7 day selector; draggable/resizable time blocks; compact queue; readable overlap, current-time and selection.
- **Upcoming:** horizontal task-only period columns; inline quick-add and direct movement; week/month planning does not invent a time or duplicate tasks.
- **Focus:** persistent small play/pause + countdown in header; expanded settings only on demand; real state survives navigation.
- **Progress:** XP and coins reflect actual receipts; small, purposeful confirmation animation, respect reduced motion.
- **Feedback:** instant state updates with meaningful undo only if a transaction can truly be reverted.
- **Dialogs/menus:** use installed Radix/shadcn; keyboard escape, focus restore and correct accessible names required.

## Accessibility and responsiveness

All buttons must have a visible accessible label or tooltip and keyboard focus. Do not remove focus rings. Aim for WCAG 2.2 AA contrast and keyboard equivalence. Compact desktop pointer targets can be ~28–32px, but use adequate separation and increase touch targets on mobile; the main navigation and task flows must still be operable without pixel-perfect clicking. Respect `prefers-reduced-motion`.

Check 1440×900 and 1280×800 desktop, approximately 800px narrow desktop, 390px phone and both Light/Black. Horizontal scrolling is intentional for task boards and multi-day timelines, not for unrelated forms or page chrome.

## Design provenance and acceptance

Use `docs/COMPONENT_SOURCES.md` to trace code; use `docs/VISUAL_ACCEPTANCE.md` to compare actual screenshots. Sources such as awesome-claude-design and Mobbin are references, not proof that LifeOS copied their CSS. Use UI UX Pro Max for design intelligence and Frontend UI Engineering for implementation quality. Review the rendered screen with Taste Skill's screenshot critique guidance, not code-only self-assessment.

**No visual completion claims without screenshots + keyboard/interaction tests.**
