# Visual acceptance — mandatory for frontend PRs

A passing build is a baseline, not proof of design quality.

## Capture matrix

At minimum capture Planner, Upcoming Overview, Upcoming Month, Inbox, Project and the `/design-system` playground at 1280×850 in Light and Black. Capture one narrow desktop layout and one 390px mobile view per major UI PR. Use reproducible Playwright screenshots and attach via GitHub Actions artifacts.

## Review in this order

1. **Purpose in one glance:** what is the primary user action? No large text preamble.
2. **Desktop structure:** navigation, workspace title, toolbar and content align; no random holes or extra panels.
3. **Density:** task row/title, time/calendar spacing and contextual actions feel like a real desktop productivity tool.
4. **Typography:** one system font, consistent hierarchy, readable small text, tabular times.
5. **Colors:** neutral surfaces with purposeful accent; contrast in both themes; no colorful decoration.
6. **States:** hover/focus/selected/dragged/disabled/empty/error render meaningfully.
7. **Interaction:** create, select, complete, schedule, undo and persist; no inert buttons.
8. **Responsive:** controls remain visible; board/timeline scroll intentionally; no horizontal page overflow.
9. **Accessibility:** tab order, accessible labels, focus visibility, keyboard-equivalent actions.
10. **Motion:** feedback brief and optional under reduced-motion preference.

Compare actual screenshots with the user's Akiflow screenshots when available. Mark differences as observed, inferred or unresolved; do not claim pixel-perfect reproduction without direct measurements.

## PR gates

- Automated build, typecheck and focused unit tests pass.
- Browser smoke tests exercise real interactions and capture evidence.
- A human-accessible draft PR contains screenshots and known limitations.
- Document any untested external integration, Windows-only behavior or missing credential-based validation.

Do not automatically merge PRs.
