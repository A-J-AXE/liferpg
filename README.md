# LifeOS

Use Node 24. From the repository root run:

    npm ci --prefix fitness/api
    npm ci --prefix fitness/frontend
    npm start

Open http://127.0.0.1:4310 in the same browser profile each time. The planner stores project images, tasks, receipts and diary entries in that profile. The launcher also runs openGym at port 5173 and its API at port 3000. The openGym sidebar opens the native application. Select its guest option or connect your openGym account.

For Google Calendar read access, register a web OAuth client with redirect URI http://127.0.0.1:4310/google/callback and supply GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to the launcher. Sessions live in server memory. In Settings choose Connect account, Load calendars, then enable an overlay.

The complete openGym subtree under fitness is pinned to a75b922181ed266e0e4658016b6d4fc33452eab0. See fitness/LICENSE and fitness/NOTICE.md. Its unmodified exercise media stays inside the native fitness application. LifeOS project artwork is supplied by the user.

See CHECKLIST.md for requirement status. Marked entries are verified; unchecked entries may be partially implemented. Page 17 of the design brief is optional.


## Desktop and personal server

For a fresh checkout, run npm ci in the root as well as in fitness/api and fitness/frontend. Install the Electron binary with node node_modules/electron/install.js and launch with npm run desktop. To verify with Edge, run npm run verify. On other systems set LIFEOS_BROWSER to your Chromium executable.

For DGX Spark Docker deployment, iPhone pairing, planner sync, MCP over SSH, and volume backups, follow [the personal server guide](SELFHOST.md). Run node verify-sync.mjs to check independent device sessions, restart persistence, and conflict detection on the development machine.

## Planner UI

Open Settings → UI showcase or visit http://127.0.0.1:4310/design-system after starting LifeOS. The preview uses the same sidebar, typography and theme as the planner. Its sample task is separate from your records.

Read [the design system](docs/DESIGN_SYSTEM.md) before editing the frontend. Use the official shadcn registry through MCP. From this directory run `npm run typecheck` and `npm run build:ui` after changing a component. Commit the generated assets so the desktop and Docker entry points serve the same version.


## Design system and PR roadmap

The LifeOS design playground is available at `http://127.0.0.1:4310/design-system` when the local server is running. It uses the same shadcn/Radix/Lucide source and semantic tokens as the application, with isolated interactive examples (no user task mutations).

Codex design guidance lives in `.agents/skills/ui-ux-pro-max/` and `.agents/skills/frontend-ui-engineering/`. Use `docs/DESIGN_SYSTEM.md`, `design-system/lifeos/MASTER.md`, and `docs/MASTER_SPEC_TRACKER.md` for the permanent 27-section requirements and acceptance gates. `docs/COMPONENT_SOURCES.md` records upstream provenance and optional 21st.dev setup.

Validation: `npm run typecheck`, `npm run build:ui`, `node verify-planning.mjs`, `LIFEOS_BROWSER=/usr/bin/google-chrome node verify-design-system.mjs`, and `node verify-workspace-ui.mjs`. The design CI uploads light, dark and narrow screenshots as artifacts.


### Advanced Planner (stacked PR #3)

The Planner time grid has 24 local hours and 15-minute snapping, overlapping event lanes, 1–7 visible days, persisted zoom, direct drag/keyboard scheduling, pointer/keyboard duration resizing and session-scoped undo/redo. Task-only Upcoming remains independent. Implementation: `ui/planner-engine.mjs`, `app.js`, `docs/advanced-planner.md`. Validation: `node verify-planner-engine.mjs` and `LIFEOS_BROWSER=/usr/bin/google-chrome node verify-planner-ui.mjs` after `npm run build:ui`.
