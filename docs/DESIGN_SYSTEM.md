# LifeOS design system

The v5 planner desk is the reference: agenda and calendar first, personal progress second. Keep the same typography, spacing, and selected states in Light and Black. The workout destination stays the upstream application.

| Role | Decision |
| --- | --- |
| Canvas / panel / ink | Use `--bg`, `--panel`, `--ink`; warm paper in Light, black and raised charcoal in Black. |
| Selection / focus | Lavender `--tint` and `--accent`. Use a visible focus ring; never remove it to tidy a screenshot. |
| Projects | User-uploaded images, with a folder fallback. Color identifies a project in the calendar; priority is independent. |
| Task importance | None neutral, Low green, Medium yellow, High red. Only Goal gets a fine multicolor edge. Preserve text names as a second cue. |
| XP | Use installed Progress. Show current / threshold numerically, a shallow inset track, lit fill and restrained segments. Animate gains briefly; respect reduced motion. |
| Type / geometry | System UI (Segoe UI on Windows). Page titles 32-46px, section titles 16-19px, rows 13-15px, metadata 11-12px. Tabular time and XP. Use a 4px spacing rhythm, 32px navigation rows, modest radii and one-pixel dividers. |

**Component source:** `components.json` selects the official shadcn Radix registry. CLI-installed source lives in `ui/components/ui`. LifeOS colors and typography feed Tailwind through `ui/theme.css`; theme values are defined in `style.css`. See the [registry](https://ui.shadcn.com/docs/components) and [MIT notice](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md).

**Exceptions and migration:** The time-blocking grid is a domain interaction (minute placement, overlap lanes and task drops); the registry Calendar is for date selection. Native openGym owns its screens. Existing vanilla planner forms and the native task editor remain until each can be migrated with its save, focus and keyboard behavior verified. They are not templates for new controls.

**Verification:** Run `npm run build:ui`, `npm run typecheck` and `npm run verify`. Start with `npm start` and open `/design-system` to exercise the components. Change themes in the application and revisit the showcase to see the same tokens.
