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
- **Character setup:** Smooth cartoon preview on the left; name, Male/Female and appearance controls on the right.
- **Desktop dashboard:** Three columns: sticky player card on the left, central workspace, and slim sticky catalog/favorites rail on the right. Both desktop side panels use the same 20px sticky top offset to stay aligned during scrolling. The rail stays within the viewport and scrolls internally if favorites are long. Smaller screens stack the layout.
- **Header:** Level Up branding, centered tagline, sound toggle, Edit character, and coin wallet. No dashboard greeting.
- **Central workspace:** Daily quests, Shop and Personal Stats tabs. Edit clothes under the player opens the wardrobe in this same workspace; Confirm/Cancel return to quests. No separate Personal Stats launcher or Outfit Preview badge.
- **Quest Catalog:** The right-rail button opens a larger book dialog over the current view. Closing it returns to that view. The empty daily-list Browse quests button also opens it.
- **Dialogs:** Quest completion, level advancement and purchase each have explicit close controls. Navigation does not discard saved progress.

## Look and Feel
Use the learner's Canva mockup as the character-style reference: a friendly full-body human with a 3D cartoon appearance. This describes the visual appearance, not a requirement for a rotatable character or a particular rendering technology.

Latest visual direction: use the learner's blue/yellow/purple LEVEL UP reference as an arcade/pixel theme for the interface. Bright blue rays, yellow highlights, deep purple hard shadows, square pixel-like panel borders, an original local 5×7 pixel display font for headings/buttons, and readable monospace body text replace the earlier navy RPG theme. Carry the palette through setup controls, daily quests, catalog book, shop, wardrobe, reward dialogs, and level-up banner. Keep the player/clothing raster artwork smooth and retain the existing white grid background around the player. The dashboard player card now uses the same pixel frame, labels and controls as the interface, with a slightly shorter viewport-adaptive character display. Player artwork is unchanged. The catalog remains a book with page/spine/category bookmarks, now styled consistently with the pixel interface.
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
Use an open-book layout in the arcade theme, with category bookmarks for Home improvement, Health and Social positivity. The left page lists quests and XP; the right page shows the selected quest's description, objective, reward, Add quest button, with an outlined purple favorite star in the top-right of the selected quest’s detail page; favorited stars fill purple. Search is case-insensitive within the selected category. Descriptions use playful roast humor while objectives remain clear.

Acceptance criteria:
- The 15 starter quests are divided evenly across the three categories; search/no-results states work.
- Add quest creates one active occurrence. The button becomes disabled **Added ✓**, without separate added-status paragraphs or a dashboard warning banner.
- Active quests move below available quests in the catalog, ordered by their position in the daily list.
- Deleting makes Add quest available again immediately. Completing a Home improvement quest starts its 12-hour cooldown; Health/Social quests can be re-added immediately.
- Favorite/unfavorite updates the right-rail shortcuts without changing active quests or rewards.

### Daily Quests and Completion
Show the full active list without pagination. Reserve at least five row heights even with zero or one quest; grow for longer lists. Each row shows name, XP, checkbox and delete control. Show only XP on the row.

Only the checkbox completes a quest; clicking its name does not. Drag a row above/below another to reorder it. Focused task names also support Alt+Up/Down. Reordering saves the order and earns nothing. A short budoop plays only when the order changes.

A centered quest-completion dialog shows the task name, a task-specific humorous message, XP and coins. It stays open until dismissed. Displayed XP/wallet values wait until Close, then green XP trails flow to the bar and pixel coins fly to the wallet while values count up. The bar carries XP overflow through level rollover. Actual rewards are awarded and saved immediately, independently of animation. Reduced-motion mode skips moving particles and count animation.

Acceptance criteria:
- Completion removes the quest and awards its rewards and one skill XP exactly once.
- Repeated completion cannot duplicate rewards; deletion and reordering award nothing.
- Unfinished quests persist across days and visits; no midnight reset or automatic recurrence.
- Empty state links to the catalog.
- Completion uses honesty, without real-life proof.

### XP, Levels, and Coins
Character XP determines level; coins buy cosmetics without reducing XP. Each 100 character XP gains a level, preserving overflow.

Starter quest rewards are 15 XP/5 coins, 35 XP/10 coins, or 60 XP/20 coins. Each crossed level adds **25 bonus coins**. Three ordinary quests yield 105 XP, level 2 with 5 overflow XP, and **55 coins** (30 quest coins plus 25 level bonus). Emerald tee costs 30 coins and requires level 2; some cosmetics require level 3.

Acceptance criteria:
- Level bonuses are awarded once by completion, saved immediately, and never re-awarded by refresh or dialog dismissal.
- When displayed XP crosses a level after quest acknowledgement, retain the character aura/rings/orbiting XP and fanfare, and open an enlarged blue/purple level-up banner centered on screen. It shows level, bonus coins and Close; no duplicate small banner over the player.
- Reduced-motion mode retains understandable static feedback.
- Purchases alter only coins and ownership.

### Shop
Use Shirts, Pants, Hats and Shoes tabs. Six paid starter cosmetics are available: Emerald tee (30 coins/level 2), Blue horizon (45/3), Midnight pants (30/2), Trail pants (45/3), Fresh sneakers (40/2), Quest cap (50/3).

Locked cards are gray and anonymous, showing a mystery/lock symbol and unlock level, without actual art, name, description or price. Unlocked items reveal those details. Unaffordable and owned items remain visible with disabled purchase controls.

Acceptance criteria:
- Successful purchase deducts coins once and adds ownership without automatically equipping.
- It plays cha-ching instead of the regular click and opens an item-picture/name/description dialog with Equip, Wardrobe and Close.
- Equip applies the purchased item to its slot; Wardrobe opens clothing editing; Close leaves it owned but unequipped.
- Each purchased item adds to a yellow new-item counter on wardrobe entry buttons. Equip/Close retain the count; opening the wardrobe clears it.
- Locked, unaffordable and duplicate purchases cannot charge coins.
- No redundant Open wardrobe button below shop cards.

### Wardrobe
The hanger button replaces the daily quest area with clothing editing. Four tabs are ordered Shirts, Pants, Hats, Shoes. Each tab displays clickable item pictures with names below them; selecting an item reveals its description and previews it on the character. Confirm outfit applies the selection and restores quests; Cancel restores the previously equipped outfit. No clothing dropdowns. Equip one owned item per category; changes visibly update the character. Retain the starting white tank top and gray pants as available choices. A no-hat choice and a no-shoes choice preserve the unadorned starting character.

Acceptance criteria:
- Purchased items appear in the correct wardrobe category.
- Equipping changes the corresponding part of the character while keeping other categories unchanged.
- Unearned items cannot be equipped.
- Opening or closing the wardrobe does not alter quests or rewards.
Source: `scope.md > The POC Boundary` and `Inspiration & Identity`.

### Same-Device Progress
Automatically save appearance/name, ordered active quests, total XP, coins, owned items, equipment, unread-item IDs, favorites and per-quest completion counts in the current browser. Level and skill levels are derived.

Acceptance criteria:
- Refresh/reopen at the same address restores progress without setup or replaying rewards.
- No cross-device or concurrent cross-tab synchronization is promised; clearing site data can remove progress.
- Storage failure warns that session changes may be lost and offers Retry saving.
- An unreadable/unsupported save stays untouched until the user chooses Start fresh and creates a replacement character.
- Existing saves without new fields preserve earlier progress and start favorites/skill history empty. Historical completions cannot be reconstructed.
- Sound preference and view/draft/dialog selection are session-only.

## Product Decisions
- Keep the main loop personal; households are not needed to prove it.
- Daily quests persist until completed or deleted, reflecting when a task actually needs doing.
- Show only XP on quest rows for a clean display; reveal both XP and coins after completion.
- Prevent duplicate active quests with a disabled Added button; reducer guards remain.
- Allow deletion without rewards.
- Separate purchase from equip; offer immediate Equip in the purchase dialog as well as the hanger wardrobe.
- Include shirts, pants, shoes, and hats; defer jewelry and layered jackets.
- Aim for the first level-up and affordable cosmetic after roughly three ordinary quests.
- Starter rewards are 15 XP/5 coins, 35 XP/10 coins, and 60 XP/20 coins; each level requires 100 additional XP, and the first cosmetic costs 30 coins at level 2.
- Save on the same device for this version rather than adding accounts.
- Keep the questbook for the next version, as explicitly reconfirmed during this interview.
- Approved the original working title Personal Growth (renamed Level Up during build feedback) and the defaults for name validation, category-scoped search, retained starting clothes, and optional hat/shoes slots during the complete plan review.
- During build feedback, replaced the earlier independent gender/body choices with Male and Female options mapped to their respective bases. Hairstyles remain available for either character. The second base should have a subtly narrower waist and fuller hips, matching the existing cartoon style, with long hair as its initial presentation. Clothing must fit each base separately.

## What We're Building
Character setup, one dashboard, catalog tabs and search, persistent daily quests, XP and coin rewards, levels, a small level-gated shop, a wardrobe with visible outfit changes, saved favorites, per-quest skill stats, and same-device saving. The demo must show adding and completing quests, reaching an unlock, purchasing, equipping, and restoring saved progress.

## Deferred From the POC
Questbook, multi-attribute personal stats beyond per-quest skills, milestone achievements, random reward chests, large catalogs, households/parties, leaderboards, jewelry, layered jackets, and cross-device accounts. They expand the personal reward loop rather than being required to demonstrate it.

## Possible Later Enhancements
Expand the quest and cosmetic collections. Add milestone reward chests and shared household contribution tracking after the personal experience works.

## Non-Goals
No creature transformations in this version; the learner wants to preserve an appealing human character. No automatic recurrence or daily reset. No verification of real-world task completion. No public deployment requirement or full production account system.

## Sound Feedback
Original locally synthesized cues include regular button ticks, a two-note Add quest ding, task-reorder budoop, quest-completion chime, reward-transfer dup ticks, purchase cha-ching and level-up fanfare. A header toggle mutes all effects. No sound autoplays before user interaction, and unavailable audio must not block gameplay.

## States and Boundaries
First use shows setup; a valid save restores the dashboard. Empty daily quests invite catalog browsing. Search has a no-results state. Added quests, missing names, locked/unaffordable/owned items and storage errors have clear states. Reward dialogs acknowledge successful actions. Favorites persist after completion and can be re-added; skill XP advances independently of character XP.

## Asset Review Updates
Fixed-pose smooth cartoon artwork and fitted appearance/clothing layers are implemented. The learner deferred character cutout/overlay alignment polish for later photo-editor work. Keep original assets, preserve both body bases, and verify fit before expanding clothing.

## Open Questions
No unresolved product decision blocks the current proof of concept. Final responsive/keyboard/drag review, asset polish, code walkthrough/app map and shipping preparation remain. Expanding catalogs and mystery boxes are later decisions.

## Personal Stats
Each quest has its own skill name, level and progress bar, shown only after its first recorded completion. If no skills are unlocked, invite the player to complete a quest. Every completion earns one skill XP; five completions gain a skill level. Level is 1 + floor(completions / 5), with progress completions % 5. Hover or keyboard focus shows lifetime completion count in a pixel tooltip. Access through the Personal Stats workspace tab. Skills grant no additional coins or character XP. Old saves start counts at zero without inventing history.

## Favorite Quest Shortcuts
The right rail contains Quest Catalog and all saved favorite quests. Each shortcut shows task name, XP, remove-favorite control and Add quest. Active favorites show disabled Added; deleting re-enables Add quest; completion re-enables it after the home cooldown, or immediately for Health/Social. Adding uses the same quest sound and duplicate guard as the catalog. Unfavoriting never removes active tasks or progress.

## Reset Player
A red Reset player button below Edit clothes opens a confirmation dialog: “Are you sure you want to delete your player? This cannot be undone.” Reset deletes this app’s saved player and returns to character creation, clearing all progression, quests, cosmetics, favorites and skills. Cancel, Escape or dismissal preserve progress. If deleting storage fails, keep the existing player and show an error.

Favorite limit: allow at most two favorite quests. Attempting a third shows a temporary “Limit of 2 favorites” message beside the detail-page star. Removing favorites is always allowed. Earlier saves retain their first two favorites; active quests and other progress are preserved.

## Background Music
An original mellow chiptune loop plays only after enabling the fixed bottom-right Music on/off button. It uses a separate mixer from sound effects, starts off on each visit, and loops quietly beneath gameplay. No external song samples or network requests are required.

## Home Quest Cooldowns
The five current Home improvement quests start an individual 12-hour cooldown only when completed. Active tasks show Added; completed home tasks show a live HH:MM:SS countdown in the catalog Add button and favorite shortcut. Re-add is disabled and guarded until the saved deadline expires, then returns to Add quest. Time away/refresh does not restart or pause the cooldown. Deletion starts no cooldown. No automatic re-add or midnight reset. Health and Social quests remain repeatable immediately. Older saves initialize empty cooldowns without applying them retroactively.

## Male PNG Base Test
The learner supplied six aligned male PNGs: three complexion IDs, each with smile/neutral. The current files are in public/avatars/new-male-bases/Aligned-Avatars/. Male creation/editing now offers complexion and expression, loading the matching complete PNG directly without old hair, eye filters, expression patches or clothing overlays. Existing outfit/appearance data is preserved for future fitted layers. Female customization retains the prior renderer. Complexion is saved; older saves default to complexion 1. All six aligned assets use a 1024×1536 transparent canvas. Older saved complexion 4 maps to complexion 1 while retaining progression.

## Male Shirt Playtest Inventory
All eleven supplied shirt colors are fitted to the aligned male bases: green, blue, black, gray, navy, orange, pink, purple, red, white and yellow. Green/blue keep their previous IDs, prices and unlocks; nine new male-only tees cost 30 coins at level 2. Shop previews, purchase-dialog Equip and wardrobe preview/Confirm use the same fitted PNGs. Starter tank removes the shirt overlay. Female retains the original green/blue variants; new colors stay hidden and cannot be equipped on that body. Switching to Female while wearing a male-only tee equips the starter tank and retains ownership. Pants/hat/shoe male overlays remain pending.

## Male Swoosh Hair
Male character creation/editing now offers Black, Gray, Brown and Blonde swoosh hair using the supplied PNGs. Three new colors are fitted to the black reference’s alpha bounds and 1024×1800 canvas; the shared renderer places it on the aligned 1024×1536 male head. Original files remain intact. Hair color persists, and female retains its existing styles and three colors. Pending male hats remain unapplied until fitted.

## Setup Layout and Hair Selection Refinement
Character settings expand naturally down the page without their own scrollbar. On desktop the left character preview sticks 20px below the viewport top, sized to fit the screen, while the document scrolls; narrow screens stack normally. Male hairstyle cards show picture previews for Bald and Swoosh, with a reusable grid for later styles. Bald hides the hair layer without discarding the remembered color. Hair color and hairstyle selections persist. Female retains its existing hairstyle controls.

## Male Sneaker Asset Update
Fresh sneakers retains its existing item ID, 40-coin price and level-2 requirement. Male shop thumbnails, purchase popup, wardrobe and equipped avatar now use the learner’s supplied shoes, fitted to the aligned male base. Existing sneaker owners automatically see the updated asset. Barefoot removes the layer. Female retains its previous body-specific sneaker artwork.

## Additional Male Shoe Styles
Five supplied variants join the original Fresh sneakers: Ember (black/red), Monochrome (black/white), Blue streak (blue/white), Trail (brown), and High score (green/yellow). All cost 40 coins at level 2 and use the existing buy/equip/wardrobe flow. New variants are male-only; female retains its previous sneakers. Switching to Female clears incompatible equipped shoes while retaining ownership.

## Male Default Pants Asset Update
The supplied pants-default.png becomes the male starter pants via a fitted overlay, visible during setup and on the dashboard. Fitting widens upper hips slightly and tapers to existing cuff placement on all three complexion bases. Starter gray stays free; existing Midnight and Trail pants use the same fitted silhouette with their established color filters. Wardrobe/shop thumbnails share this layer. Female pants remain unchanged; original source is preserved.

## Household Expansion
A separate right-rail Household box opens a regular dialog, not the quest book. Favorites are capped at two to reserve space. Register with a unique account username, email and password; sign in using email/password. Player display names remain independently editable and non-unique. Password recovery uses email; task reminders are deferred.

Signed-in users create a named household or join using an invite code; each account can belong to one household. Any member can copy the household code; the owner can replace it. Codes expire after seven days. Members shows the member count, avatar heads, display names, usernames and levels. Activity shows newest completions first, with avatar head, display name, level, quest and local date/time. Older activity loads in batches of 30. Data refreshes every 30 seconds while visible, and manually.

Only successful quests completed while signed in with a loaded household membership are shared; previous local history is not uploaded. Personal coins, clothing ownership and tasks stay local. Pending activity is saved separately per account, retries with stable event IDs, and retains its original household and appearance snapshot. Household errors must not block personal rewards. Members can leave; a lone owner can delete the household after confirmation, removing shared activity. An owner cannot delete while other members remain.

Learner confirmed a signed-in account screenshot. Create/join/member/activity flows and password-recovery delivery still need live learner verification. Avatar heads use appearance layers; shared clothing is deferred because it is not part of the current profile snapshot.
