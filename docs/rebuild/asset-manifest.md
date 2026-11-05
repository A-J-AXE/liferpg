# PR 00 — Original sourced visual asset inventory

Status: **source-locked only**. No files imported into LifeOS yet. PR 02 copies the selected original binary PNGs into `public/assets/rpg/` and records actual checksums. Do not create hand-drawn replacements or claim imported files before copying them.

Upstream [microsoft/fluentui-emoji](https://github.com/microsoft/fluentui-emoji/tree/1ffb34c752ecf5d402f04cfb4b392c77f57c54bc), commit `1ffb34c752ecf5d402f04cfb4b392c77f57c54bc`, MIT [LICENSE](https://github.com/microsoft/fluentui-emoji/blob/1ffb34c752ecf5d402f04cfb4b392c77f57c54bc/LICENSE). All the paths below were **verified in the repository tree**. Destination filenames are plans, not claims of existence.

| Role | Exact GitHub image file | Future local destination | Palette |
|---|---|---|---|
| Growth | [`assets/Potted plant/3D/potted_plant_3d.png`](https://github.com/microsoft/fluentui-emoji/blob/1ffb34c752ecf5d402f04cfb4b392c77f57c54bc/assets/Potted%20plant/3D/potted_plant_3d.png) | `public/assets/rpg/growth.png` | sage |
| Battle | [`assets/Crossed swords/3D/crossed_swords_3d.png`](https://github.com/microsoft/fluentui-emoji/blob/1ffb34c752ecf5d402f04cfb4b392c77f57c54bc/assets/Crossed%20swords/3D/crossed_swords_3d.png) | `public/assets/rpg/battle.png` | coral |
| Boss fights / Goals | [`assets/Trophy/3D/trophy_3d.png`](https://github.com/microsoft/fluentui-emoji/blob/1ffb34c752ecf5d402f04cfb4b392c77f57c54bc/assets/Trophy/3D/trophy_3d.png) | `public/assets/rpg/goals.png` | amber |
| Skills | [`assets/Books/3D/books_3d.png`](https://github.com/microsoft/fluentui-emoji/blob/1ffb34c752ecf5d402f04cfb4b392c77f57c54bc/assets/Books/3D/books_3d.png) | `public/assets/rpg/skills.png` | lavender |
| Market | [`assets/Money bag/3D/money_bag_3d.png`](https://github.com/microsoft/fluentui-emoji/blob/1ffb34c752ecf5d402f04cfb4b392c77f57c54bc/assets/Money%20bag/3D/money_bag_3d.png) | `public/assets/rpg/market.png` | ochre |
| Vault / coins | [`assets/Coin/3D/coin_3d.png`](https://github.com/microsoft/fluentui-emoji/blob/1ffb34c752ecf5d402f04cfb4b392c77f57c54bc/assets/Coin/3D/coin_3d.png) | `public/assets/rpg/vault.png` | gold |
| Energy/recovery | [`assets/Sleeping face/3D/sleeping_face_3d.png`](https://github.com/microsoft/fluentui-emoji/blob/1ffb34c752ecf5d402f04cfb4b392c77f57c54bc/assets/Sleeping%20face/3D/sleeping_face_3d.png) | `public/assets/rpg/energy.png` | blue |
| Social | [`assets/Speech balloon/3D/speech_balloon_3d.png`](https://github.com/microsoft/fluentui-emoji/blob/1ffb34c752ecf5d402f04cfb4b392c77f57c54bc/assets/Speech%20balloon/3D/speech_balloon_3d.png) | `public/assets/rpg/social.png` | sky |
| Diary/Journal | [`assets/Notebook/3D/notebook_3d.png`](https://github.com/microsoft/fluentui-emoji/blob/1ffb34c752ecf5d402f04cfb4b392c77f57c54bc/assets/Notebook/3D/notebook_3d.png) | `public/assets/rpg/journal.png` | cream |
| OpenGym / Fitness | [`assets/Sports medal/3D/sports_medal_3d.png`](https://github.com/microsoft/fluentui-emoji/blob/1ffb34c752ecf5d402f04cfb4b392c77f57c54bc/assets/Sports%20medal/3D/sports_medal_3d.png) | `public/assets/rpg/fitness.png` | mint |
| Overview | [`assets/House/3D/house_3d.png`](https://github.com/microsoft/fluentui-emoji/blob/1ffb34c752ecf5d402f04cfb4b392c77f57c54bc/assets/House/3D/house_3d.png) | `public/assets/rpg/overview.png` | sand |
| Achievements | [`assets/Star/3D/star_3d.png`](https://github.com/microsoft/fluentui-emoji/blob/1ffb34c752ecf5d402f04cfb4b392c77f57c54bc/assets/Star/3D/star_3d.png) | `public/assets/rpg/achievements.png` | amber |
| Planner | [`assets/Calendar/3D/calendar_3d.png`](https://github.com/microsoft/fluentui-emoji/blob/1ffb34c752ecf5d402f04cfb4b392c77f57c54bc/assets/Calendar/3D/calendar_3d.png) | `public/assets/rpg/calendar.png` | blue |

## Rules
- Use an entire coherent family (same Fluent 3D art style). No AI generated SVGs, paintings or replacements.
- Preserve original PNGs; optimize losslessly if needed and record SHA256 before/after.
- Do not use 3dicons' website screenshots as replacements for missing individual PNGs.
- Character portrait is a user-uploaded avatar or documented licensed original; never use a screenshot photo.
- Control icons may remain Lucide where they are UI affordances. Large navigation illustrations must use genuinely sourced 3D image files.
- **PR 02 gate:** visually validate all 13 actual imported assets in Chrome, not just correct file paths in code.
