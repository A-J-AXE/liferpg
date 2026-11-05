# Reward System v3.1 — immutable product contract (PR 00)

**Canonical supplied documents, not rewritten:** `LifeOS_RPG_Reward_System_Design_Specification_v3_1(1)(1).pdf` (56 pages, SHA256 `1f90e82853117bbf4e85768c4c6155fff3ab890ae124dddd10aa44681d64269f`); and `LifeOS_Complete_Onion_Plan_Taste_Skill_Reward_v3_1.pdf` (89 pages, SHA256 `4b7c67735383f8a14c134d7b3353ec7ac71230ec5eec2c49eca62be0b1781fae`). Both were supplied in the conversation; this repository summary is not a substitute for the full PDF appendix. Keep the canonical PDFs available to Codex. Do not fabricate discrepancies, overwrite the full spec or silently simplify its test wording.

**Project rule hierarchy:** Character → Skill → Project → Quest/Task leaves. Habits run parallel beneath Skill. Calendar blocks are views. Goal is a priority level, not a new hierarchy tier. Project required-ness and reward-enabled flag are independent; completed earned awards remain immutable.

## Launch base priorities

| Priority | Base XP | Base coins | Default weight |
|---|---:|---:|---:|
| None | 5 | 1 | 1 |
| Low | 10 | 2 | 2 |
| Medium | 20 | 4 | 4 |
| High | 35 | 7 | 7 |
| Goal | 60 | 12 | 12 |

`required=false` does not exclude a task from rewards. `reward_enabled=false` does not remove required work from the project denominator. Base overrides of 0/0 do not implicitly disable reward eligibility.

## Project shared pool

Default: **20 XP + 4 coins** shared for two or more active, finite, reward-enabled project leaves. With 0 or 1 eligible leaf, pool=0. Paid share is consumed/locked, and only unpaid remaining pool can be deterministically redistributed by separate integer Hamilton/largest-remainder apportionment per XP and coins, stable ID tie-break.

| State | Low | Medium | High | Goal | Sum |
|---|---|---|---|---|---|
| three tasks all unpaid | 13/3 | 26/5 | 46/9 | — | **85 XP / 17 C** |
| Goal added before any paid | 12/2 | 23/5 | 41/8 | 69/14 | **145 XP / 29 C** |
| Low earned *before* Goal | **13/3 locked** | 23/4 | 40/8 | 69/14 | **145 XP / 29 C potential; wallet only 3 C** |

Adding the Goal only reforecasts; does not mint earned money or play reward effects. Undo Low compensates **-13 XP/-3 C** exactly, not the new forecast -12/-2. Earned snapshots never change due to priority edits, deletion, moves, reparenting or later rules.

## Quest, Finish and Wallet invariants

- Paid descendants already own their leaf rewards. Non-Quest parent closing pays 0 extra. At most one explicit branch-owned Quest closure bonus per overlapping branch. High closure 20 XP/4 C; Goal closure 30 XP/6 C. Split existing work preserves original work budget.
- Project Finish requires actual in-scope earned work, all required leaves and required Quests closed, and explicitly disposed unfinished optional tasks. Finish is user-confirmed, not automatic.
- Eligible full Finish posts once: XP `clamp(roundToNearest5HalfUp(20% of earned eligible XP),10,100)`; coins `clamp(roundHalfUp(20% of eligible earned coins),2,20)`. Four tasks 145/29 → +30/6 → **175 XP/35 C**.
- Early administrative Finish / Finish anyway before requirements or quest closure posts **0/0**, and never automatically completes tasks. Reopen reverses **only** the previous Finish bonus snapshot.
- Wallet is the signed ledger total. Compensating Undo may legitimately make balance negative after coins were spent; block further unaffordable purchases rather than disallow Undo.
- Any new work must have intentional canonical identity, scope/lineage/epoch. Reordering/nesting/calendar projections cannot mint new allowances.
- Atomic award: lock canonical scope, validate state/version, compute exact integer allocation, commit immutable payment snapshot + unique idempotency key + status and scope event, then emit a deduped outbox notification. Character XP, attributed Skill XP and coins are derived from the same authoritative ledger.
- Audio/coins/confetti are *presentation only after commit*. No demos treated as earned rewards. Reduced-motion, sound-off, visibility, rapid aggregation and early Undo have dedicated acceptance tests.

## Explicitly deferred by the onion roadmap
PR 00–06: design-only, no reward kernel or real wallet. PR 07–13: deterministic reward model, exact allocation, quest ownership, ledger, Finish and 51 golden acceptance cases. PR 14 onward: connect actual UI events and sensory feedback. OpenGym and Google are integration layers, not excuses to bypass reward accounting.

## 51 mandatory golden acceptance test cases

These short summaries are traceable to the full canonical source on PDF pp. 51–56 and the roadmap. The exact canonical test wording governs implementation and review.

01. 01 standalone Medium pays +20 XP/+4 coins once; Character and Skill show same transaction, not double-mint
02. 02 Low/Medium/High project allowance rows 13/3,26/5,46/9; sum 85/17
03. 03 add open Goal reforecasts to 12/2,23/5,41/8,69/14; total 145/29 without payout
04. 04 Low already earned at 13/3 locks snapshot; other three reforecast 23/4,40/8,69/14
05. 05 Undo Low reverses exact 13/3 once, not recalculated 12/2
06. 06 full four-task 145/29 earned, Finish 30/6, 175/35 total, single active finish award
07. 07 incomplete 75% Finish anyway 0/0; no automatic task completion
08. 08 Reopen/add reverses exact finish bonus; follow-up never edits prior earned history
09. 09 mutations, split, nested quest, moved scope, skill/global rules do not retrospectively reprice earned
10. 10 Hamilton integer apportionment, stable-ID tie breaks, odd/zero pools, exact conservation
11. 11 rapid multi-device concurrent mutations/idempotent stale-offline retries pay once
12. 12 scheduled habit occurrence pays once, calendar projections never create new reward leaves
13. 13 spend then Undo may create audited negative wallet; block unaffordable buys
14. 14 synthetic legacy import retains historic payouts, never mints retroactive rewards
15. 15 required parent quest closure still blocks Finish after leaves reach 100%
16. 16 keyboard/screen reader/small-screen/reduced-motion/undo accessible and no overlapping badges
17. 17 property-based budget conservation and ledger totals reconciliation
18. 18 Low task quiet toast once, Sounds Off does not construct audio
19. 19 Medium soft-sound clink once, near clicked chip and no screen-wide effect
20. 20 Goal milestone once; 0-coin Goal suppresses fake coin particles
21. 21 eligible project Finish exact 30/6 produces one bag/toast/sound, accessible undo
22. 22 ineligible Finish anyway 0/0, no gold effects
23. 23 Reopen compensates finish award only and cancels in-flight effects
24. 24 adding Goal 85/17→145/29 changes forecast without earned or sensory feedback
25. 25 five quick completions: five ledger postings, at most aggregate toast/one sound
26. 26 reconnect, hydration, multi-tab, Activity replay not re-trigger sensory feedback
27. 27 sound autoplay blocked/off does not interrupt completion or mint money in preview
28. 28 reduced motion overrides expressive; no particles, readable static state
29. 29 quiet mode/hidden tab suppress visual/sound presentation but not ledger
30. 30 Character+Skill level-up shows coordinated event with one payout
31. 31 Undo within 200ms cancels animations and is not replayed after refresh
32. 32 required reward-disabled unfinished leaf blocks Finish despite earned rewarded leaves
33. 33 optional reward-enabled unfinished leaf excluded from required denominator; explicit disposition before Finish
34. 34 toggling required/reward_enabled updates scope denominator/pool without changing earned wallet
35. 35 nested Quest overlapping branch issues one owner bonus only
36. 36 disjoint Quest siblings pay once each; moving leaves cannot duplicate owner
37. 37 splitting existing High into five children preserves 35/7 pre-share budget
38. 38 wrap/rename/move/duplicate cannot mint a new paid work lineage
39. 39 project Earned/Remaining/Potential/Historical separate, moved-out paid task remains historical
40. 40 weekly transparent example total 80 coins without double-counting project allowance
41. 41 100-coin shop purchase blocked at 80; at >=100 posts -100 once; refund +100
42. 42 negative wallet after valid reverse remains audited; no unaffordable purchase
43. 43 six task creation entry points inherit Project/Skill/scope correctly
44. 44 linked calendar event is not second reward; project/skill scope changes intentional
45. 45 completed-project creation always requires Reopen or Follow-up
46. 46 0/0 overrides with reward_enabled=true still eligible for shared pool
47. 47 required Quest still open blocks full Finish; close unique owner only
48. 48 no required leaves shows No required tasks, not fabricated 100%
49. 49 reload, multi-tab, long offline, legacy import do not revalue or replay
50. 50 concurrent required flag changes and earns obey persisted scope/version transaction order
51. 51 accessible reward editing/settings, 320px view, reduced motion, single toast host

**Gate R:** none of these tests may be quietly marked passed based on a frontend screenshot. Golden 01–51 require runnable unit/integration/E2E evidence, plus concurrency and accessibility checks. Each PR must record which tests actually execute.
