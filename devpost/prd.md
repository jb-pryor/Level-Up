---
doc: prd
status: approved
---

# Level Up — Product Requirements

Approved name: Level Up. A personal gamified to-do list for someone who enjoys games and wants more motivation to do positive everyday activities.
Sources: `scope.md > Who It's For`, `The Unique Kernel`, and `The POC Boundary`.

## The Core Journey
1. On first visit, enter a name and customize a friendly cartoon human wearing a plain white tank top and gray pants.
2. Finish setup and arrive at the dashboard showing the character, name, level, XP progress, daily quests, and navigation.
3. Open the Quest Catalog window, browse categories or search, and add quests to the daily list.
4. Do the tasks in real life, then check them off. Each completed quest leaves the list and awards XP and coins.
5. Level up through XP and accumulate coins. Some shop items become available only at a required level.
6. Buy an available cosmetic, then use the hanger button to equip it from the wardrobe. See the character's appearance change.
7. Close and reopen the app on the same device and browser to resume the saved character and progress.
Sources: `scope.md > The Core Loop` and `What "Working" Looks Like`.

## Screens and Layout
- **Character setup:** Character preview on the left; name, gender, and appearance controls on the right. Changes update the preview before setup is finished.
- **Dashboard:** Character on the left. Name, level, and XP bar at the top center. Daily quests to the right of the character in a checkable to-do list. Coin balance is visible. Clearly organized Quest Catalog and Shop buttons open larger windows. A clothing-hanger button below the character replaces the daily quest panel with the wardrobe. Confirming an outfit returns that panel to quests.
- **Catalog and shop windows:** Open over the dashboard and can be closed to return without losing progress. The wardrobe uses the existing daily quest panel instead of a window. Questbook and personal stats buttons are deferred with their features.
Source: `scope.md > The POC Boundary`.

## Look and Feel
Use the learner's Canva mockup as the character-style reference: a friendly full-body human with a 3D cartoon appearance. This describes the visual appearance, not a requirement for a rotatable character or a particular rendering technology.

Updated interface direction from build feedback: deep navy backgrounds and layered blue/teal panels, vibrant lighter green reward accents, bold game-like headings, and smaller monospace interface labels. Raised buttons, stronger level badges, subtle grid/glow details, and clear contrast make it feel more like an RPG dashboard. The learner explicitly rejected the original white/gray palette and bland typography. The dashboard player card and character-creation preview use a white background with subtle graph/grid lines and dark readable text; the surrounding interface stays navy/teal. The interface palette supports the character and colorful cosmetics rather than competing with them.
Source: `scope.md > Inspiration & Identity`.

## Features and Behavior

### Character Setup
Enter a name and select gender, hairstyle, hair color, eye color, and mouth expression. Gender options are Male and Female, each selecting its matching body; there is no separate body-shape control; expressions include smiling and straight-faced. Keep the selection small. The baseline character has no facial hair, as clarified during the character prototype review. All characters begin at level 1 in a plain white tank top and gray pants, with no earned cosmetics equipped.

Acceptance criteria:
- Appearance changes update the full-body preview.
- Finishing setup shows the chosen name and appearance on the dashboard.
- Initial XP and coins are zero, and level is 1.
- A blank name prevents finishing setup and shows a clear prompt to enter a name.
Source: `scope.md > The POC Boundary`.

### Quest Catalog
Show a small catalog of positive activities with category tabs for home, health, and social positivity, plus search by quest wording. Each row shows a quest name, XP reward, and Add action. Bigger or harder tasks receive larger rewards. Search filters the selected category; clearing it restores that category's list.

Acceptance criteria:
- Changing categories displays the relevant quests.
- Searching for a listed task finds it; no matches shows a clear empty result.
- Adding a quest makes it appear in daily quests with the same name and XP reward.
- Trying to add an existing daily quest displays “Quest already in your daily quests!” without creating a second copy.
- Completing or deleting a quest allows it to be added again.
Source: `scope.md > The Core Loop` and `The POC Boundary`.

### Daily Quests and Completion
Display each quest with its name, XP reward, completion checkbox, and delete button. Show XP alone on quest rows; coins remain part of the reward. A completion message reveals both, for example “+35 XP · +10 coins.”

Acceptance criteria:
- Checking a quest removes it, awards its XP and coins once, and visibly updates XP progress and coin balance.
- Repeated clicks on the same completion cannot award rewards twice.
- Deleting removes a quest without rewards and does not alter existing progress.
- Unfinished quests stay through later days and return visits. Nothing resets at midnight or automatically recurs.
- An empty list invites the player to add a quest from the catalog.
- No real-life proof or verification is requested; completion is based on honesty.
Source: `scope.md > The Core Loop` and `Explicitly Cut`.

### XP, Levels, and Coins
XP advances levels; coins are spent on cosmetics without reducing XP or level. Level requirements and coin prices are separate conditions for purchases. The learner wants approximately three ordinary quests to reach level 2 and afford a first cosmetic. Larger quests may achieve this sooner.

Agreed starter values:
- Small quest: 15 XP and 5 coins; ordinary quest: 35 XP and 10 coins; larger quest: 60 XP and 20 coins.
- Each level requires 100 more XP. The bar displays progress within the current level, preserving overflow.
- A first purchasable cosmetic costs 30 coins and requires level 2. Three ordinary quests yield 105 XP and 30 coins, reaching level 2 with 5 XP toward level 3.
- The shop also contains an item requiring level 3 to demonstrate later unlocks.

Acceptance criteria:
- XP earned across the level threshold increments the level and preserves remaining XP.
- A level-up produces visible feedback and updates eligible shop items.
- Purchases deduct only coins; XP and level remain unchanged.
Source: `scope.md > The Unique Kernel` and `What "Working" Looks Like`.

### Shop
Show a small collection of shirts, pants, shoes, and hats. Each item shows its appearance, category, price, and required level. Buying adds it to the wardrobe rather than automatically equipping it.

Acceptance criteria:
- Items below the player's level requirement visibly state the required level and cannot be bought.
- Items the player cannot afford visibly indicate insufficient coins and cannot be bought.
- A successful purchase deducts the price once and marks the item as owned.
- Owned items cannot be bought again; repeated purchase clicks do not double-charge.
Source: `scope.md > The POC Boundary`.

### Wardrobe
The hanger button replaces the daily quest area with clothing editing. Four tabs are ordered Shirts, Pants, Hats, Shoes. Each tab displays clickable item pictures with names below them; selecting an item reveals its description and previews it on the character. Confirm outfit applies the selection and restores quests; Cancel restores the previously equipped outfit. No clothing dropdowns. Equip one owned item per category; changes visibly update the character. Retain the starting white tank top and gray pants as available choices. A no-hat choice and a no-shoes choice preserve the unadorned starting character.

Acceptance criteria:
- Purchased items appear in the correct wardrobe category.
- Equipping changes the corresponding part of the character while keeping other categories unchanged.
- Unearned items cannot be equipped.
- Opening or closing the wardrobe does not alter quests or rewards.
Source: `scope.md > The POC Boundary` and `Inspiration & Identity`.

### Same-Device Progress
No sign-in is required. Preserve the name, appearance, daily quests, XP, level, coins, owned cosmetics, and equipped outfit in the same browser on the same device.

Acceptance criteria:
- Reloading or reopening in that browser restores the saved state without repeating setup.
- No cross-device access or synchronization is promised.
- Clearing browser data may remove progress; a brief setup note explains the local saving boundary.
- If progress cannot be saved, show a clear warning that current changes may not survive reopening rather than claiming a successful save.
Source: `scope.md > What "Working" Looks Like`.

## Product Decisions
- Keep the main loop personal; households are not needed to prove it.
- Daily quests persist until completed or deleted, reflecting when a task actually needs doing.
- Show only XP on quest rows for a clean display; reveal both XP and coins after completion.
- Block duplicate active quests with the learner's specified message.
- Allow deletion without rewards.
- Separate purchasing from equipping through a hanger-accessed wardrobe.
- Include shirts, pants, shoes, and hats; defer jewelry and layered jackets.
- Aim for the first level-up and affordable cosmetic after roughly three ordinary quests.
- Starter rewards are 15 XP/5 coins, 35 XP/10 coins, and 60 XP/20 coins; each level requires 100 additional XP, and the first cosmetic costs 30 coins at level 2.
- Save on the same device for this version rather than adding accounts.
- Keep the questbook for the next version, as explicitly reconfirmed during this interview.
- Approved the original working title Personal Growth (renamed Level Up during build feedback) and the defaults for name validation, category-scoped search, retained starting clothes, and optional hat/shoes slots during the complete plan review.
- During build feedback, replaced the earlier independent gender/body choices with Male and Female options mapped to their respective bases. Hairstyles remain available for either character. The second base should have a subtly narrower waist and fuller hips, matching the existing cartoon style, with long hair as its initial presentation. Clothing must fit each base separately.

## What We're Building
Character setup, one dashboard, catalog tabs and search, persistent daily quests, XP and coin rewards, levels, a small level-gated shop, a wardrobe with visible outfit changes, and same-device saving. The demo must show adding and completing quests, reaching an unlock, purchasing, equipping, and restoring saved progress.

## Deferred From the POC
Questbook, favorites, detailed personal stats, achievements, random reward chests, large catalogs, households/parties, leaderboards, jewelry, layered jackets, and cross-device accounts. They expand the personal reward loop rather than being required to demonstrate it.

## Possible Later Enhancements
Expand the quest and cosmetic collections. Add milestone reward chests and shared household contribution tracking after the personal experience works.

## Non-Goals
No creature transformations in this version; the learner wants to preserve an appealing human character. No automatic recurrence or daily reset. No verification of real-world task completion. No public deployment requirement or full production account system.

## States and Boundaries
First use shows setup; returning use restores the dashboard. Empty daily quests point to the catalog. Search with no matches explains that nothing matched. Duplicate additions, missing names, locked items, insufficient coins, and save failures produce visible explanations. Completion, level-up, purchase, and equip actions produce visible feedback. Closing a window retains progress.

## Asset Review Updates

The learner requested white tank tops on both bases, replacing the initial gray-shirt direction, and explicitly authorized code-based silhouette cleanup. Cleaned PNGs are in `output/imagegen/clean-bases/`. The fixed-pose appearance is established, but clothing overlays and interchangeable hair must be fitted to these updated bases before the technical spec can claim support.

## Open Questions
- **Before technical spec approval:** Agree on the small appearance-option and cosmetic set, and verify that the desired cartoon character can support those visible changes within the proof-of-concept budget. Exact asset feasibility belongs in the technical plan; it must not silently downgrade the agreed character style.
