---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Create and customize your character in a running app**
  Becomes usable: Character setup with two bases, both hairstyles, hair/eye colors, expressions, and a dashboard showing the chosen player.
  Why now: Proves the largest risk—fitted character artwork—before the rest of the app depends on it. Bootstrapping is included in this usable step.
  PRD ref: `prd.md > Character Setup`, `prd.md > Screens and Layout`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Character Setup`, `spec.md > Avatar Renderer`, `spec.md > Stack`, `spec.md > File Structure`
  Build: Set up React/TypeScript/Vite and CSS, verify dependency access, copy selected base assets, produce and fit both hair styles and expression/eye changes, implement setup and dashboard. Establish fitted shirt/pants/shoes/hat assets in a development preview so later purchases can produce visible changes. Map Male/Female to their matching body bases; allow either hairstyle. Preserve known deferred silhouette polish. Do not silently drop unsupported options.
  Verify (mechanical): Run TypeScript checks and production build; start the dev server and verify page/asset responses. Check every appearance option and clothing fit using browser automation if available; otherwise provide the exact visual matrix for learner-assisted verification and record that limitation. Check blank-name rejection and correct Male/Female body mapping and either hairstyle.
  Learner check: Open `http://127.0.0.1:5173`, create a character, switch Male/Female and both hairstyles, try colors/expressions, and report fitting or layout problems. Check the development clothing preview on both bodies.
  Commit: `Add character creation and fitted avatar renderer`

- [x] **2. Complete quests to unlock, buy, and wear rewards**
  Becomes usable: The real catalog-to-quest-to-reward loop, including leveling, shopping, and the hanger-accessed wardrobe.
  Why now: Delivers the distinctive purpose immediately after the character risk is resolved, rather than leaving rewards until final polish.
  PRD ref: `prd.md > Quest Catalog`, `prd.md > Daily Quests and Completion`, `prd.md > XP, Levels, and Coins`, `prd.md > Shop`, `prd.md > Wardrobe`
  Spec ref: `spec.md > Quest Catalog`, `spec.md > Daily Quests`, `spec.md > Shop`, `spec.md > Wardrobe`, `spec.md > Player Rules and Save Adapter`, `spec.md > Data Model`
  Build: Add the 15-quest starter catalog with category search, daily quest controls and duplicate errors; implement guarded reward/purchase/equip actions, player summary, feedback, six-item shop, wardrobe and accessible dialogs. Three ordinary completions must fund the level-2 green shirt; purchases do not automatically equip.
  Verify (mechanical): Run focused Node reward/purchase/equip tests and production build. Verify duplicate completion/purchase guards, removal without rewards, re-add, search, level locks, affordability, and visible equipment changes. Check dialog keyboard behavior through an available browser or record learner-assisted evidence.
  Learner check: Add three ordinary quests, check them off, confirm level 2/55 coins, buy the green shirt, equip it from the hanger, and try a duplicate add and deleting an unfinished quest.
  Commit: `Add quests rewards shop and wardrobe`

- [ ] **3. Restore progress and finish the complete experience**
  Becomes usable: Character, tasks, rewards, ownership, and outfit survive reopening; error states and responsive layout are ready for final review.
  Why now: Persistence saves a fully defined player record, and the integrated experience can now be checked against every PRD behavior.
  PRD ref: `prd.md > Same-Device Progress`, `prd.md > States and Boundaries`, `prd.md > The Core Journey`
  Spec ref: `spec.md > Player Rules and Save Adapter`, `spec.md > Important Failure Modes`, `spec.md > Verification Approach`, `spec.md > Where It Runs and How Someone Tries It`
  Build: Add versioned runtime-validated local saves, restoration, save-failure messages and explicit corrupt-save recovery. Finish empty/locked/unaffordable states, narrow-screen layout, missing-layer handling and README run/demo instructions. Use the stable origin and preserve originals.
  Verify (mechanical): Run save round-trip/invalid-data/storage-failure tests, all rule tests, and production build. Run the app and verify the complete core journey, refresh restoration, dialogs and narrow layout using available browser tooling or documented learner-assisted checks.
  Learner check: Keep an unfinished quest and equipped reward, refresh/reopen at the same address, and verify everything returns. Explore freely and report anything broken, confusing, or worth changing.
  Commit: `Persist player progress and finish app states`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 1; learner tried character/wardrobe screens, requested layout and styling changes, and confirmed the revised appearance looks good. Character raster cleanup explicitly deferred.
- [x] Integrated reward journey explored — learner tested rewards, purchases and clothing, iterated on animation/sound/theme, and confirmed ready to move on.
- [ ] Final kick-the-tires exploration and feedback completed — after slice 3; saving confirmed by learner, UI revisions incorporated, full keyboard/narrow-screen review pending

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — trace one quest completion through UI, player rules, and saved result, connecting precise agent instructions with verifiable outcomes
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: not completed
Route and stops: to be grounded in finished implementation
Edit outcome: not established
Reflection: not offered yet; any personal answer belongs in the ignored learner profile
Activity mode: not established

## Revisions

- First-step learner review completed after wardrobe/layout/theme refinements. TypeScript and production builds pass; browser interaction evidence comes from the learner's hands-on use and screenshots. Slice 1 awaits its required Git checkpoint before its completion box is checked.

- Learner's early feedback: character/clothing artwork needs further cleanup, which they explicitly deferred to later photo-editor work. Renamed the app Level Up and brightened the interface green, with raised buttons, stronger level badges, selected controls, and progress accents. The artwork itself is unchanged. Updated affected scope/PRD/spec wording; visual feedback on the revised interface is pending.

- Dependencies installed from a temporary writable npm cache populated from existing local archives; the chosen stack is unchanged. Exact installed versions are in `package-lock.json`.
- Slice 1 production build and TypeScript checks pass. Server-side rendering checked 144 appearance/outfit combinations and all referenced assets. A composite sheet was inspected; cap/hair overlap was corrected. The session cannot bind a local port (`EPERM`) and no browser connection is available, so actual interactions and final fitting await the learner's early checkpoint. Slice 1 remains unchecked and uncommitted.

- Learner requested removing Nonbinary and the body-shape controls. Male/Female now choose their matching bases; hairstyles remain editable. Updated implementation and affected planning sections.

- Learner changed wardrobe layout: hanger replaces the quest panel with four picture-based clothing tabs, item names/descriptions, a draft outfit preview, Confirm, and Cancel. Updated PRD/spec so later ownership and persistence integrate with this behavior.

- Learner requested a stronger video-game identity and rejected the pale gray/white background and font. Reworked the interface with deep navy/teal surfaces, vibrant green rewards, game-style heading typography, monospace status labels, and subtle grid/glow atmosphere; updated visual requirements.

- Learner requested trying a white background specifically in the dashboard player card while retaining graph lines and the dark surrounding theme. Adjusted that card and its text/XP/edit-button contrast; setup and quest panels retain the RPG palette.

- Extended the white graph-line treatment to the character-creation preview, with dark heading/supporting text; the surrounding interface remains dark.

- Removed the Player One header badge and moved Edit character to the top-right header when a character exists.

- Slice 1 checkpoint verified: `8c5da38 Add character creation and fitted avatar renderer`. The learner made this commit because session filesystem restrictions prevent writing Git metadata.
- Slice 2 implementation is ready for its integrated learner checkpoint. Nine reward/purchase/equipment rule tests, TypeScript checks, production build, and catalog/shop/wardrobe render checks pass. Browser/server restrictions remain; hands-on interactions, dialog focus, and visual review await learner feedback. No slice-2 commit yet.
- Used the Node built-in test runner instead of Vitest because Vitest archives were not present in the offline cache. Verification coverage is preserved without changing product behavior or app architecture.

- Learner requested completion effects: XP particles toward the bar, coin particles toward the wallet, fast balance count-up, and a centered quest-name/reward popup lasting about one second. Added display-only animation and level rollover; reducer remains the immediate source of balances. Reduced-motion mode skips particle/count motion. Animation timing math and reward event tests added; visual animation review remains learner-assisted.

- Revised completion effects per learner feedback: reward dialog now waits for Close; XP/coin display stays paused until dismissal. Closing releases stronger XP trails, more particles, varied arcs, impact rings, and bar/wallet pulses. Reward balances remain awarded exactly once in the reducer; animation is presentation only.

- Added learner-requested character-centered level-up celebration, triggered when animated XP actually crosses a level after closing the reward dialog. Includes hovering XP sparks, orbiting particles, expanding rings, aura and new-level banner; reduced-motion mode retains a static message. Tests/build pass; learner visual review remains required.

- Restyled the quest catalog as a non-pixelated open book following the learner reference: left-page quest list/search, right-page details/objective/XP/add action, and right-edge home/heart/people category bookmarks. Added narrow-screen stacking and keyboard category navigation. Existing catalog/reward rules remain intact; book markup, tests and build pass.

- Learner replaced the navy RPG design with a blue/yellow/purple pixel-arcade reference. Applied consistent theme overrides to all interfaces, including quest book and reward dialogs; kept player art, clothing, and existing white grid player boxes smooth. Created a local original 5×7 display font with reproducible source, checksum verified. All 12 tests and production build pass; visual feedback/font loading remain learner-assisted.

- Learner requested removing the global duplicate warning and replacing catalog/shop popups with inline content. Moved Daily quests/Quest catalog/Shop controls directly above the right-hand panel; all four views including wardrobe share it. Added contextual catalog add feedback and shop purchase feedback, with no global banner. Completion reward dialog remains. Tests/build pass; new panel layout awaits learner feedback.

- Added Shirts/Pants/Hats/Shoes shop tabs and anonymous grayed-out level-locked cards per learner request. Actual item images/names/descriptions/prices render only after the required level; unlocked but unaffordable items stay visible. Verified level-1 concealment and level-2/3 progressive reveal in rendered markup; 12 tests and build pass.

- Moved the animated wallet to the top-right header beside Edit character, removed the dashboard greeting/eyebrow, and reduced top spacing. Player display height now adapts to viewport height to keep the workspace more visible. Reward coin particles target the relocated wallet. Production build passes.

- Centered the header tagline independently of side content, shortened the dashboard player card, and applied the pixel frame/name/level/edit-button style to it at learner request. Preserved smooth player artwork and white graph lines; place the tagline in its own centered row on narrower screens to prevent collisions.

- Learner moved Quest Catalog back to a larger popup for the book layout. Kept Daily quests, Shop and wardrobe inline, with catalog close/Escape returning to the previously visible panel. Updated affected PRD/spec behavior.

- Added requested original synthesized click, quest-completion, reward-transfer “dup” ticks and level-up fanfare. A header toggle mutes and stops scheduled effects. One browser AudioContext activates from user interaction; audio failures never block game actions. Added activation/scheduling/mute test; all 13 tests and build pass. Actual sound preference and volume need learner listening feedback.

- Learner approved the quest/transfer/level sounds and requested a louder, drier tick for clicking. Shortened the click decay and strengthened its sharp transient; other sounds unchanged. Audio tests and build pass.

- Purchase feedback revision: register cha-ching replaces the buy click; item popup offers Equip/Wardrobe/Close; yellow new-item counters accumulate until wardrobe opens. Reducer tests cover duplicate purchases, count retention and clearing without changing balances or ownership.

- Removed redundant shop wardrobe button; retained player hanger and purchase-dialog Wardrobe access. Added playful quest-specific roast descriptions and completion messages for all 15 quests, plus level-up flavor; objectives and rewards stay unchanged.

- Learner approved the current experience and requested proceeding to persistence. Slice 2 verification passes (14 tests and production build); its required Git checkpoint is pending because this session cannot write Git metadata.

- Slice 2 checkpoint verified: `34b1db2 Add quests rewards shop and wardrobe`. Proceeding to same-device saving in slice 3.

- Slice 3 implementation: versioned localStorage save/load validates appearance, safe balances, quest/ownership/unread IDs and matching owned equipment. Storage failures show a retry warning; unreadable saves stay untouched until explicit fresh-start recovery. Save round-trip, invalid-data and failure tests pass; all 18 tests and production build pass. Browser refresh, responsive layout and final interaction verification remain learner-assisted; final review and slice-3 commit pending.

- Learner confirmed refresh restoration works. Catalog refinement removes add-status paragraphs, keeps a fixed Added/disabled button state, and sorts active quests below available quests in addition order within category/search results. Final visual review continues.

- Added daily-quest pagination at five quests per page, with previous/next controls and page count. Removing/completing the last quest on a page clamps to the last remaining page. Total active count and saved quest ordering are preserved.

- Daily quest panel reserves five fixed row slots, including shorter pages and the empty state. Hidden row spacers prevent panel shrinking; pagination reserves the same height with or without arrows. Production build passes.

- Added requested centered level-up acknowledgement dialog with 25 bonus coins per gained level, while retaining character orbit effects and existing fanfare. Bonus is awarded once in quest completion rules and saved immediately; reopening a save grants no extra bonus. Three ordinary quests now yield 55 coins (30 quest coins plus 25 level bonus). Mystery boxes remain deferred. All 18 tests/build pass.

- Level advancement popup now enlarges the original blue/purple arcade banner with yellow heading, level, coin reward and Close. Removed duplicate small banner over player; retained orbit/aura effects and fanfare.

- Learner expanded scope with simple per-quest skill stats: saved completion counts, 1 skill XP per completion, level every five completions, bars and hover/focus counts. Added animated left-edge launcher and right-hand stats tab; active quest badge is green. Older saves migrate with empty stats while keeping existing progress. Stats/counter/migration tests and build pass; learner visual review pending.

- Replaced daily quest pagination per learner request: all active quests appear in one growing list. List and empty state reserve at least five row heights, so zero/one quest never shrinks the panel below the five-quest size. Removed page controls/state and invisible placeholder rows.

- Desktop player card now sticks at a vertically centered scroll position using its measured height; ResizeObserver tracks responsive size changes. Stacked mobile layout stays in normal flow. Build passes; learner scroll verification pending.

- Added learner-requested three-column desktop layout and sticky catalog/favorites rail. Favorites persist independently of active quests; catalog toggle adds/removes shortcuts, and shortcuts change Added back to Add quest after completion. Older saves migrate with empty favorites. Build and favorite/re-add/save tests pass; visual layout review remains learner-assisted.

- Created original 16-grid gold pixel coin SVG with purple outline and yellow highlights, reused through CoinIcon in wallet, shop/prices/purchase controls, quest rewards, level bonuses and animated coin particles. Build passes.

- Daily quests complete only through the checkbox; task text no longer labels/toggles it. Added drag/drop reordering with destination highlighting and Alt+Up/Down keyboard movement. Reducer validates both active IDs; reordering preserves rewards/counts and persists through the existing save. All 24 tests/build pass. Desktop drag interaction awaits learner review.

- Planning cleanup consolidated current behavior into PRD/scope/spec: three-column sticky layout, saved favorites, simple skill stats, checkbox-only completion/reordering, five-row minimum without pagination, 25-coin level bonuses, purchase dialog/new-item counter, pixel coin and distinct sounds. Corrected obsolete component/file references and old reward totals. Persistence and refinements await Git checkpoint; final review/app map remain incomplete.

- Fixed broken-image coin placeholders reported in shop wallet/prices. Shared CoinIcon now draws the same gold pixel artwork inline as SVG, removing image-request dependence for every coin instance. Production build passes.

- Replaced full-width Favorite Quest action with a separate purple outline/fill star button at the top-right of each catalog row. Favorite and row-selection buttons are siblings to avoid nested controls. Build passes.

- Added red Reset player control below Edit clothes with explicit Reset/Cancel confirmation. Removes only this app save before resetting session state; storage deletion failure preserves player and shows an error. Tests use mock storage and do not touch learner progress. All 26 tests and production build pass.

- Compacted desktop character setup into remaining viewport height below the header: smaller form spacing, flexible full-body preview, matching-height panels and no setup footer. Short/narrow screens retain scrolling; form has overflow fallback for zoom/errors. Corrected obsolete local-save note. Build passes; visual fit awaits learner review.

- Aligned desktop side panels using the same 20px sticky top offset. Removed player vertical-centering measurement, which previously caused mismatched gaps relative to the favorites rail. Build passes.

- Capped new favorites at four in UI and reducer. A fifth attempt displays a temporary Limit of 4 favorites tooltip beside the star; unfavoriting always works. Existing favorites are not silently removed.

- Added original mellow eight-bar chiptune loop with separate bottom-right Music on/off control. Independent Web Audio mixer, opt-in/session-only playback, bounded lookahead scheduling and rapid-toggle cleanup. Audio scheduling test and build pass; musical preference/volume await learner listening feedback.

- Added learner-requested 12-hour home-only re-add cooldown. Starts on successful completion, not add/delete; saved timestamp drives live catalog/favorite countdowns and reducer guard. Other categories remain immediately repeatable. Old saves preserve progress with empty deadlines. Updated repeated-home tests to advance past cooldown; boundary/delete/other-category/save migration tests pass. All 32 tests and production build pass; visual timer review pending.

- Personal Stats now lists only quests with at least one recorded completion. New players see an invitation to complete their first quest; existing skill counts and progression are unchanged. Build passes.

- Integrated eight learner-edited male base PNGs into direct-image renderer with four complexion choices and two expressions. Male overlays/unsupported controls paused for explicit base test; female keeps existing customization. Checked alpha and dimensions (1019–1024 wide, 1536–1543 high); observed colored edge artifacts and left originals untouched. Complexion save/migration tested; learner alignment review pending.

- Added 320ms male PNG crossfade with subtle scale transformation for complexion/expression changes. Replacement decodes before display, stale requests/timers cancel on rapid changes/unmount, and reduced-motion users get an immediate swap. Original PNGs untouched; production build passes.

- Refined male PNG transformation to a quick 160ms swap with one soft blue-white lightning flash and quiet blup/zip cue. No input lock; replacement still decodes before display, rapid sounds are throttled, initial render is silent, and reduced-motion hides the flash. All 33 tests/build pass; visual/audio preference awaits learner review.

- Switched male avatar and complexion previews to six Aligned-Avatars PNGs; all verified 1024×1536 with alpha. Removed fourth complexion option, changed selector to three columns, and migrate old complexion 4 to 1 without resetting progress. Source images untouched. Tests/build pass.

- Replaced male transformation aura/rings/sparks with a 300ms fade-out, blue alpha-contour outline, and fade-in. SVG morphology traces the actual PNG silhouette; reduced-motion swaps immediately. Electric zip remains. Production build passes.

- Integrated learner eye PNGs as fitted iris overlays on aligned male bases, with Brown/Blue/Green/Gray/Red choices. Scaled/positioned source pairs in SVG with per-eye clipping; original eye/base PNGs unchanged. Inspected a composed blue-eye face preview. Female keeps prior three color options. Eye layer follows base transition; save validation supports five colors.

- Added all eleven user-supplied male shirt colors with shared fitted 1024×1536 canvas and common collar/sleeve/hem envelope. Inspected composites of all eleven on aligned male base; no exposed tank edges. Shop/purchase Equip/wardrobe share fitted assets; originals preserved and generation script included. Nine new male-only tees at 30 coins/level 2; original green/blue keep IDs/prices/unlocks and female behavior. All 36 tests and build pass; learner multi-complexion playtest pending.

- Tightened all eleven fitted male shirts by about 3% in width/height (553×451 envelope), preserving common center and collar position. Regenerated from originals and inspected orange-shirt composite for neckline, sleeves and hem coverage. Build passes.
