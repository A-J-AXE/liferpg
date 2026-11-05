# LifeOS rebuild rules — active on rebuild branches

## Authority and scope
1. Canonical functional contract: user's LifeOS Reward System Design Specification v3.1, 56 pages, SHA-256 1f90e82853117bbf4e85768c4c6155fff3ab890ae124dddd10aa44681d64269f; see docs/rebuild/REWARD_V31_CONTRACT.md.
2. Product architecture: user's 27-section LifeOS requirements and the 89-page Onion roadmap (2026-11-05); see docs/rebuild/README.md.
3. User reference screenshots define layout and interaction goals, not source-code copying rights.
4. Pinned, license-checked GitHub sources come from docs/rebuild/SOURCE_LOCK.md.
5. Skills give advice, never override the reward contract or the approved interaction design.

## Clean rebuild permission
No real user data needs migrating. Existing UI code can be replaced/deleted after its replacement is working and reviewed. Keep Git history, remote services, credentials, independent fitness data ownership, and access/security boundaries safe. Never delete remote infrastructure or merge automatically. All changes stay on a rebuild branch until review.

## Frontend workflow for every PR
Read .agents/skills/lifeos-template-first-frontend/SKILL.md and docs/rebuild/VISUAL_CONTRACT.md.
Find and inspect exact source files; lock revision and license. Prefer real sourced components and images, not AI-created 3D artwork, giant dashboard cards, or a copied landing-page layout. Make one coherent screen slice, then browser-test rendered UI at 1440x900, 1280x800, 390px and 320px, light/dark, keyboard and reduced motion. Report real screenshot paths and failing interactions, not aesthetic adjectives. If browser cannot run, report an unverified blocker; never claim visual approval.

## Onion delivery contract
PR 00: source/legal audit and visual/reward acceptance contracts only.
PR 01-06: UI-only screens with visibly labeled local fixtures; do not simulate earned wallets.
PR 07-13: test the v3.1 reward authority and append-only ledger before live integrations.
PR 14+: bind live screens, activity, OpenGym, Google and desktop without duplicate reward credits.
One PR, one review gate; stop for user approval. Do not invent a next-step approval.

## Special caution
The current repo contains a pinned native OpenGym copy in fitness/ under AGPL-3.0; preserve its license and notices. Do not silently replace it with a decorative mock. Never treat scope changes as paid events or simulate earned XP as if committed.
