# LifeOS — master design contract

**Direction:** desktop productivity, compact and task-first; visual references Linear (density/navigation), Akiflow (planning workflow), Raycast (command interactions), restrained Revolut (numeric polish), purposeful LifeRPG rewards. Do not copy proprietary UI source or assets.

**System:** Existing React/shadcn/Radix shell + persisted LifeOS task DOM + native OpenGym. Tokens source in `style.css` and mapping in `ui/theme.css`. Use Segoe UI/system font, 4px rhythm, 32px controls, ~38px task rows, subtle 1px dividers, 6–8px corner radii and 120–180ms motion. Dark and Light parity.

**Rules:** Planner = hourly calendar only. Upcoming = period task boards. Project and Inbox = task lists. One task identity and no fabricated times. Local controls must have real state transitions. Task creation should be title-first with progressive disclosure. Reuse installed shadcn components. Use Radix for accessible menu/dialog interaction. Test actual screens, not JSX alone.

**Workflow:** inspect source → select approved component → implement → browser/keyboard test → screenshots → critique → commit draft PR → record original 27-section acceptance status.

**No:** giant cards, serif hero headers, decorative charts, large empty gutters, gradients, fake controls, duplicate menus, unchecked accessibility or unreviewed external packages.
