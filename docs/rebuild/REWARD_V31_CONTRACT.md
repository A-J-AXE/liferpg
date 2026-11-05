# Reward System v3.1 — implementation contract (not yet implemented)

Canonical user PDF: LifeOS_RPG_Reward_System_Design_Specification_v3_1(1)(1).pdf, 56 pages, SHA-256 1f90e82853117bbf4e85768c4c6155fff3ab890ae124dddd10aa44681d64269f.
The PDF is authoritative, this summary is a working index. Nothing in PR 00 claims the 51 tests pass.

## Core rules
- CHARACTER lifetime XP and wallet; SKILL shows attribution of the SAME XP (not a second payout). PROJECT finite task pool and explicit Finish; HABITS occur in parallel, never count in finite scope.
- Priority None=5 XP/1 coin/weight 1; Low=10/2/2; Medium=20/4/4; High=35/7/7; Goal=60/12/12. Goal is a priority, not a nesting layer.
- Shared project allowance default +20 XP/+4 coins when >=2 eligible reward-enabled finite leaf tasks, allocated across unpaid leaves by exact integer largest-remainder/Hamilton with stable-task-ID tie break. Base overrides and required-vs-reward_enabled flags are independent.
- Golden numerical fixture: Low, Medium, High => 85 XP/17 coins. Allocations Low 13/3, Medium 26/5, High 46/9. Add unpaid Goal => 145/29, allocations Low 12/2, Medium 23/5, High 41/8, Goal 69/14. If Low was already paid, keep paid 13/3 and reallocate remaining Medium 23/4, High 40/8, Goal 69/14.
- Scope edits do NOT mint wallet coins or retroactively change paid awards. Completed rewards use immutable snapshots, compensated by explicit auditable Undo. One append-only ledger/event authority; idempotent double-click/retry/offline handling.
- REQUIRED controls project finish gate, REWARD ENABLED controls payout. Required but 0-reward leaves still block Finish. Optional rewarded leaves can earn but do not enter required denominator.
- One Quest closure-bonus owner per overlapping lineage/branch, not each nesting wrapper. Existing-work split cannot 5x its task base; new independent work can be rewarded with a distinct identity.
- Finish is deliberate. Fully eligible project example 145/29 task pool => +30 XP/+6 coins separate 20% capped/rounded Finish bonus, lifetime 175/35. Incomplete Finish anyway posts 0/0, checks no unfinished child. Reopen reverses ONLY exact finish award. Post-finish task addition requires Reopen or Follow-up. Already spent currency may yield an auditable negative wallet on Undo; prohibit unaffordable purchase.
- 80-coin example: 5 Low=10, 8 Medium=32, 2 High=14, 7 Low habit occurrences=14, project shared=4, finish=6. Editable shop prices; actual earned != forecast.
- Shared service for task creation from Overview, Calendar, Planning, Sidebar, Project and Quick Add. Calendar copies do not mint task XP; habits earn per occurrence.
- AUDIOVISUAL FEEDBACK AFTER COMMIT ONLY: one global toast, one local optional coin effect, sound OFF by default, reduced motion override, no old-event replay. No fake gold particles for zero coins.

## Release-blocking 51-test index
01 Medium standalone exactly once and XP single authority.
02 Three-task 85/17 and exact task allocation.
03 Add Goal 145/29, projected reallocation, NO earnings.
04 Low already paid 13/3, locked historical snapshot.
05 Undo Low exact reversal, second undo no-op.
06 Four tasks 145/29, Finish 30/6, final 175/35.
07 Incomplete Finish anyway 0/0, no child autocheck.
08 Post-Finish Reopen & add versus follow-up.
09 Scope mutation, move, override, hierarchy, overallocated pool and historical integrity.
10 Hamilton exact sum, stable ID ties, no fractional coins.
11 Concurrency, retries, stale version, offline replay idempotence.
12 Habits by occurrence, time blocks never double pay.
13 Wallet negative after spent Undo and affordability guard.
14 Synthetic legacy migration preserves old paid history.
15 Parent Quest open blocks project Finish despite completed leaves.
16 Accessibility, keyboard, mobile, one compact reward chip.
17 Property-based full pool and ledger/display reconciliation.
18 Low task once, quiet toast, sound Off no AudioContext.
19 Medium task Soft sound with anchored bounded coin effect.
20 Goal with coins vs Goal 0-coin XP-only presentation.
21 Project finish exact +30/+6 receipt, one bag/toast/sound, Undo.
22 Finish anyway early 0/0, NO fireworks/sound.
23 Reopen reverses exact finish, cancels animation, child pays preserved.
24 Scope +Goal creates no wallet delta, sound or award feedback.
25 Five rapid completions: five transactions, one grouped toast/sound.
26 Hydration/reconnect/multi-tab must not replay audiovisual feedback.
27 Sounds Off/autoplay rejection does not block commit; sound preview no credit.
28 Device reduced motion overrides Expressive; cancel in-flight effects.
29 Hidden/quiet/off-screen suppress presentation, not committed ledger.
30 Character and Skill level-up same event, one coordinated overlay.
31 Undo within 200ms cancels effect, never replays.
32 Required unrewarded open task blocks full finish.
33 Optional rewarded open task does not block required fraction, requires explicit disposition.
34 Required toggle changes denominator; reward toggle changes eligible pool.
35 Nested overlapping Quest wrappers: one closure bonus.
36 Disjoint sibling Quest branches each one unique owner; move safely.
37 Split existing High work into five children retains 35/7 budget (before share).
38 Wrap/duplicate/move paid item never generates new reward identity.
39 In-scope Earned vs Remaining vs Potential vs Historical after paid task moves.
40 Weekly worked example 80 exact earned coins.
41 100-coin purchase unaffordable at 80; exactly one -100 transaction at 100+.
42 Spent-coin Undo creates visible audit debt and blocks unaffordable buys.
43 Six task-creation entry points inherit project, skill, flags and stage.
44 Time blocking a linked task never creates extra reward object.
45 Completed project creation gate offers Reopen or Follow-up on every route.
46 Reward enabled base override 0/0 remains eligible for shared pool.
47 Required Quest parent remains Finish blocker until deliberate close.
48 Zero required leaves + optional work => no automatic 100% finish bonus.
49 Refresh/multi-tab/offline/import: flags, ledger and ownership remain correct.
50 Persisted scope snapshot and concurrent edits produce deterministic order.
51 Keyboard/a11y, compact reward editing, no duplicate toast host across views.

## Implementation gates
PR 01-06: only UI fixture previews. PR 07 schema/tests, PR 08 allocator, PR 09 quest lineage, PR 10 ledger, PR 11 Finish/Reopen, PR 12 projections/wallet, PR 13 transaction/reconciliation release gate, PR 14+ connect frontend and sensory feedback. All 51 tests must ultimately be executable and supported by real changed code/test logs.
