# LifeOS

Use Node 24. From the repository root run:

    npm ci
    npm ci --prefix fitness/api
    npm ci --prefix fitness/frontend
    npm start

Overview is the landing page. Open Planner for hourly scheduling, Upcoming for period boards, and a project for its tasks. Press C to capture a task or Ctrl/Cmd+K to search tasks and workspace actions. The [workspace guide](docs/planner-view-architecture.md) describes period navigation and keyboard controls.

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
