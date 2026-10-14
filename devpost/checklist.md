---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [ ] **1. Create and customize your character in a running app**
  Becomes usable: Character setup with two bases, both hairstyles, hair/eye colors, expressions, and a dashboard showing the chosen player.
  Why now: Proves the largest risk—fitted character artwork—before the rest of the app depends on it. Bootstrapping is included in this usable step.
  PRD ref: `prd.md > Character Setup`, `prd.md > Screens and Layout`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Character Setup`, `spec.md > Avatar Renderer`, `spec.md > Stack`, `spec.md > File Structure`
  Build: Set up React/TypeScript/Vite and CSS, verify dependency access, copy selected base assets, produce and fit both hair styles and expression/eye changes, implement setup and dashboard. Establish fitted shirt/pants/shoes/hat assets in a development preview so later purchases can produce visible changes. Map Male/Female to their matching body bases; allow either hairstyle. Preserve known deferred silhouette polish. Do not silently drop unsupported options.
  Verify (mechanical): Run TypeScript checks and production build; start the dev server and verify page/asset responses. Check every appearance option and clothing fit using browser automation if available; otherwise provide the exact visual matrix for learner-assisted verification and record that limitation. Check blank-name rejection and correct Male/Female body mapping and either hairstyle.
  Learner check: Open `http://127.0.0.1:5173`, create a character, switch Male/Female and both hairstyles, try colors/expressions, and report fitting or layout problems. Check the development clothing preview on both bodies.
  Commit: `Add character creation and fitted avatar renderer`

- [ ] **2. Complete quests to unlock, buy, and wear rewards**
  Becomes usable: The real catalog-to-quest-to-reward loop, including leveling, shopping, and the hanger-accessed wardrobe.
  Why now: Delivers the distinctive purpose immediately after the character risk is resolved, rather than leaving rewards until final polish.
  PRD ref: `prd.md > Quest Catalog`, `prd.md > Daily Quests and Completion`, `prd.md > XP, Levels, and Coins`, `prd.md > Shop`, `prd.md > Wardrobe`
  Spec ref: `spec.md > Quest Catalog`, `spec.md > Daily Quests`, `spec.md > Shop`, `spec.md > Wardrobe`, `spec.md > Player Rules and Save Adapter`, `spec.md > Data Model`
  Build: Add the 15-quest starter catalog with category search, daily quest controls and duplicate errors; implement guarded reward/purchase/equip actions, player summary, feedback, six-item shop, wardrobe and accessible dialogs. Three ordinary completions must fund the level-2 green shirt; purchases do not automatically equip.
  Verify (mechanical): Run focused Vitest reward/purchase/equip tests and production build. Verify duplicate completion/purchase guards, removal without rewards, re-add, search, level locks, affordability, and visible equipment changes. Check dialog keyboard behavior through an available browser or record learner-assisted evidence.
  Learner check: Add three ordinary quests, check them off, confirm level 2/30 coins, buy the green shirt, equip it from the hanger, and try a duplicate add and deleting an unfinished quest.
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
- [ ] Integrated reward journey explored — after slice 2, check that earning and equipping feels right
- [ ] Final kick-the-tires exploration and feedback completed — after slice 3

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
