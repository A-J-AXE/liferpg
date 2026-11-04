# UI component sources & provenance

| Source | Role | Integration decision |
| --- | --- | --- |
| https://github.com/shadcn-ui/ui | Primary component source | Existing licensed components under `ui/components/ui/`; preserve `ui/SHADCN-LICENSE.txt`. |
| https://www.radix-ui.com | Accessible interaction primitives | Already installed via `radix-ui`; reuse for menus, popovers and focus behavior. |
| https://github.com/pacocoursey/cmdk | Command palette | Existing dependency and `ui/components/ui/command.tsx`. |
| https://lucide.dev | Consistent icons | Existing `lucide-react` dependency. No emoji substitute for product controls. |
| https://github.com/nextlevelbuilder/ui-ux-pro-max-skill | Design intelligence for Codex | Project-local MIT subset in `.agents/skills/ui-ux-pro-max/`; see its SOURCE.md. |
| https://github.com/addyosmani/agent-skills | Frontend engineering review | Single MIT skill in `.agents/skills/frontend-ui-engineering/`. |
| https://github.com/VoltAgent/awesome-claude-design | Design inspiration index | Reference only. Its repository does not supply all claimed DESIGN.md files as committed ready-to-import code; do not misrepresent them as vendored assets. |
| https://github.com/Leonxlnx/taste-skill | Screenshot critique method | Reference only; not installed, to avoid competing design contracts. |
| https://docs.21st.dev/mcp | Discoverable external React components | **Not connected or authenticated here.** Codex plugin: `codex plugin marketplace add 21st-dev/codex-plugin`; needs 21st account/key. Never commit tokens or claim MCP retrieval without connection evidence. |
| https://github.com/clauderic/dnd-kit | Potential advanced drag interaction | Evaluate in PR #3/#4 if current drag code proves insufficient. Not installed in PR #2. |
| https://motion-primitives.com | Purposeful motion reference | Do not add an animation dependency merely to decorate a page. |
| https://mobbin.com | Product-flow screenshots | External visual reference, not a source of reusable proprietary code. |

## Provenance policy

Before copying a component, record: upstream URL + commit/version, applicable license, original/modified file, dependencies, accessibility assumptions and affected surfaces. Respect third-party notices. Do not import entire component libraries when only one primitive is needed.

## Repo architecture

UI entry is a hybrid of `app.js` (persisted state and DOM interactions), `ui/shell.jsx` (React/shadcn navigation), `ui/showcase.tsx` (design playground), `ui/theme.css` (Tailwind tokens) and `style.css` (semantic runtime tokens). Changes to `ui/shell.jsx` or `ui/showcase.tsx` require `npm run build:ui`. Do not edit only minified `shell.js` and assume future builds will preserve it.
