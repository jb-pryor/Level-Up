---
doc: spec
status: approved
---

# Level Up — Technical Spec

## How This Works, In Plain Language
The app runs in your browser. React draws setup, the character, and a shared right-hand panel for daily quests, shop, wardrobe and Personal Stats, plus a larger quest catalog book popup. Quest rewards and shop items come from small files shipped with the app.

One shared player record holds appearance choices, active quests, earned XP, coins, owned items, equipped clothes, unread purchases, favorites and completion counts. Completing a quest updates that record once; every part of the screen then shows the same result. The browser saves the record locally and restores it on your next visit.

The character is fixed-pose artwork that looks 3D. Fitted image layers and color masks change its appearance. It does not need a live 3D model. Male selects base-a and Female selects base-b, with no separate body-shape control. Both hairstyles are available on either base.

## The Core Journey Through the System
Implements `prd.md > The Core Journey`.
1. Startup reads and validates the browser save. No save shows setup; a valid save restores the dashboard.
2. Setup controls change a temporary appearance record and the live character preview. Finishing creates a level-1 player with zero XP/coins and the white tank top/gray pants.
3. The catalog filters local quest definitions by category and name. Add sends the quest ID to the shared player rules, which reject duplicates or append it to daily quests.
4. Complete sends the active quest's ID. The rules verify it is active, remove it, and award its configured XP/coins in one update. Level and progress are calculated from total XP.
5. Shop purchase verifies level, balance, and ownership; it deducts coins and adds the item ID in one update.
6. Wardrobe equip verifies ownership and category, changes the equipped ID, and the renderer selects that body's fitted artwork or color mask.
7. Each committed player change is saved. Window navigation and search do not alter earned progress.

## Stack
- **React + React DOM:** interactive components; built-in `useReducer` keeps player actions together. [React](https://react.dev/), [useReducer](https://react.dev/reference/react/useReducer).
- **TypeScript:** typed player records, quests, cosmetics, and actions. [Documentation](https://www.typescriptlang.org/docs/).
- **Vite with the React TypeScript template:** local development and static production build. [Guide](https://vite.dev/guide/).
- **Regular CSS:** palette, layout, responsive sizing, and feedback; no UI framework required.
- **Browser localStorage:** small versioned JSON save; no database or login. [Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
- **SVG image layers, clipping, and color filters:** render the raster character assets at fixed coordinates. [Clipping](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/clipPath), [color matrix](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feColorMatrix).
- **Node built-in test runner, development only:** focused reward/purchase/save-validation tests; Node 22.13.1 runs the TypeScript modules with `--experimental-strip-types`. This replaces the planned Vitest runner because the needed package archives were unavailable in the offline cache. [Documentation](https://nodejs.org/api/test.html).

React/TypeScript/Vite/CSS/local saving were accepted by the learner. Reducer organization and the test runner are implementation details derived from that choice. Dependencies are installed and exact versions recorded in `package-lock.json`. Local Node is 22.13.1 and npm is 10.9.2. Use the lockfile and a compatible Node version; do not upgrade the machine silently.

## Where It Runs and How Someone Tries It
Local browser app for the initial demo; no deployment selected, no API keys. Network is needed initially for dependency installation and any asset generation, not for routine quests or purchases. Serve through Vite rather than opening the application's HTML via `file://`.

Run commands:
```bash
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```
Open `http://127.0.0.1:5173`. Always use this origin for the demo: changing host, protocol, or port produces a separate browser save. On later installations use `npm ci` with the committed lockfile.

Checks: `npm test`, `npm run build` (TypeScript checking plus Vite build). Production preview: `npm run preview -- --host 127.0.0.1 --port 4173 --strictPort`; this origin has its own save.

Record creating a character, adding three ordinary quests, completing them, reaching level 2, buying and equipping the first item, then refreshing to show saved progress. Real-life completion remains based on honesty. Submission requires a short demo video and public GitHub repository; deployment is optional. README will explain these commands and local-save limitations.

## Look and Feel
Implements `prd.md > Look and Feel` and `Screens and Layout`.
The latest learner reference establishes an arcade/pixel UI: bright blue background (`#35BAF0`/`#52C9F3` rays), yellow highlights (`#FFEB39`), deep purple outlines (`#30219A`), pale readable panel surfaces, square borders, and offset hard shadows. `src/pixel-theme.css` loads after the base styles and consistently themes setup, quests, shop, wardrobe, catalog book, completion dialogs, and level-up banner. It preserves the player's white grid background and all smooth raster character/clothing art. The dashboard player card uses a pixel frame, labels and controls with a compact height. The header tagline is absolutely centered independently of brand and wallet widths, and moves to its own centered header row below 1100px to avoid overlap. `public/fonts/level-up-pixel.ttf` is an original, locally generated 5×7 display font built by `scripts/build_pixel_font.py`, used for headings and controls with monospace body text. No external font request is needed. Check display font loading and small-screen readability in the learner's visual review. Keep XP rewards on quest rows and coin balance visible in the dashboard.

Shop, quests, and wardrobe share the right-hand panel. Quest Catalog opens a larger book dialog from the sticky right-hand catalog/favorites rail; closing it restores the underlying view. Catalog and completion reward dialogs provide headings, close controls, Escape handling and managed focus. Use actual buttons and labeled controls. Reward messages use a polite live region; avoid motion essential to understanding progress.

## Components

### App Shell
`App.tsx` connects the player record, setup/dashboard switch, right-hand panel selection, draft outfit, and contextual feedback. `App.tsx` uses useReducer directly, initializes from loadBrowserPlayer, and saves committed player changes in an effect. No router needed for this single-dashboard app.
Implements `prd.md > Screens and Layout` and `Same-Device Progress`.

### Character Setup
`CharacterSetup.tsx` collects a trimmed, nonblank name, Male/Female choice, hair style/color, eye color, and expression. The gender control selects the matching body and default hairstyle; hair controls remain editable. Show the preview beside controls. Both bases are bald/clean-shaven beneath separate hair layers and begin in white tank tops/gray pants.
Implements `prd.md > Character Setup`.

### Avatar Renderer
`Avatar.tsx` renders a consistent `1024 × 1536` viewBox with body-specific layer mappings from `avatarPresets.ts`. Use unique SVG mask/filter IDs per instance to avoid collisions between preview, dashboard, and shop thumbnails.

Layer order: back hair, base body/face, expression and eye masks, pants/shirt variations, shoes, front hair, hat. Each base has its own geometry and item placement. Recolor only the intended area; never recolor an entire character image. Earned shirts cover the starter tank top without leaving tank edges exposed. Hat placement must be tested with both hairstyles.

Agreed starter options:
- Two body bases, selected by Male/Female.
- Two hairstyles: short swept and long; both available on either body.
- Three hair colors: proposed initial swatches brown, black, and blonde.
- Three eye colors: proposed initial swatches brown, blue, and green.
- Smiling and neutral expressions.

Colors are initial content choices that can be tuned without architectural changes. Hair requires front/back cutouts where it overlaps shoulders. Expressions require fitted face-region artwork, not a dropdown that leaves the character unchanged.

Current assets: `output/imagegen/clean-bases/guy-white-tank.png` and `girl-bald-white-tank.png`. The earlier short-hair/shirt-color prototype is in `output/imagegen/layer-test/fitted-preview.html`. It was visually checked by the learner, but predates the new tank-top bases. New bases have known outline artifacts at face/hands/feet. The learner chose to defer that polish; do not call them final approved cutouts or repeat the opacity-forcing cleanup as a general solution.

**Asset expansion check:** preserve the implemented separate hair layers, shirt coverage, and body-specific fitting when expanding inventory. Check both bodies and both hairstyles on light/dark backgrounds; validate eye and expression changes and at least one shirt, pants, shoes, and hat fit. Verify new combinations rather than assuming an existing layer will fit. If the asset pipeline cannot deliver the approved options, explain the exact problem and seek a product decision; do not silently reduce features or replace the style with a generic vector avatar.
Implements `prd.md > Character Setup`, `Shop`, and `Wardrobe`.

### Dashboard and Player Summary
`App.tsx` arranges the three-column dashboard and derives level/XP summary from total XP. The player card and desktop favorites rail use the same 20px sticky top offset; the right rail is sticky with a viewport-bounded internal scroll area. Both adapt to stacked smaller layouts. CoinIcon reuses public/icons/pixel-coin.svg for wallet, prices, rewards and flying particles. Completion feedback uses a centered modal with quest name, both rewards, and a Close button. It remains open until dismissed; Close/Escape release the transfer. Display-only numeric animation is paused while the reward modal is pending. RewardEffects uses captured popup/bar/wallet viewport coordinates for fixed-position XP/coin particles with trails, varied arcs, impact rings and target pulses. useAnimatedNumber uses requestAnimationFrame to interpolate display-only XP and wallet values, canceling/restarting cleanly for rapid updates. Player balances are awarded immediately and never depend on animation completion. rewardAnimation fills and briefly holds the old XP bar before level rollover. LevelUpCelebration observes the displayed level crossing and plays a 2.4-second character-centered aura/ring/orbit-spark effect plus an enlarged centered blue level banner dialog, including hover XP text; it does not trigger merely from opening the reward dialog or editing the character. Respect prefers-reduced-motion; cancel timers/frames on unmount. Non-completion messages keep ordinary feedback.
Implements `prd.md > Screens and Layout` and `XP, Levels, and Coins`.

### Quest Catalog
`QuestCatalog.tsx` renders a two-page quest journal using CSS cover, parchment pages and spine, smooth SVG category icons on right-edge bookmark tabs, a searchable left-page quest list, and selected details/XP/add action on the right. Selection falls back to the first filtered quest, with a no-results state if none match. On narrow phones the pages stack while category bookmarks remain available. The catalog renders in a larger popup using the book cover/page treatment; its size is not constrained to the daily-quest panel. The Add button becomes disabled Added, without separate status paragraphs. Favorite toggles update saved shortcuts. Active quests sort below available quests. Search remains case-insensitive within the selected category. Start with 15 curated quests: five each for home, health, and social positivity, covering all reward sizes. This is real starter content, not a simulated live catalog. Rows show name and XP; no-match feedback explains the empty result. Duplicate active additions remain guarded in the reducer.
Implements `prd.md > Quest Catalog`.

### Daily Quests
`DailyQuests.tsx` resolves active IDs against the catalog and provides checkbox-only completion, delete, and native desktop drag/drop reordering. Text clicks never complete. Alt+Up/Down provides keyboard reordering. All active quests render in one list without pagination; CSS reserves a minimum of five rows and grows for longer lists. A validated reorder action moves one active ID relative to another, with no reward changes. Empty state links to the catalog. Do not reset by date or auto-repeat quests. Completion feedback is generated only for a successful transition.
Implements `prd.md > Daily Quests and Completion`.

### Shop
`Shop.tsx` has Shirts/Pants/Hats/Shoes category tabs, styled consistently with wardrobe tabs. Below the level requirement, render a separate grayed-out generic locked card without ItemPicture, actual item name, description or price, including in accessibility labels. Reveal the real preview and details when level is sufficient. Unlocked unaffordable/owned items retain their real details and corresponding purchase state. Starter paid inventory: two shirt colors, two pants colors, one pair of shoes, one hat. Starter tank/pants are free wardrobe options, not paid shop entries.

Current content: green shirt 30 coins/level 2, blue shirt 45/level 3, dark pants 30/level 2, olive pants 45/level 3, sneakers 40/level 2, cap 50/level 3. Prices and requirements are defined in cosmetics.ts; the PRD lists the current six items.
Implements `prd.md > Shop`.

### Wardrobe
`Wardrobe.tsx` replaces the daily quest panel during editing, with Shirts/Pants/Hats/Shoes tabs and image cards, names, and selected-item descriptions. A draft outfit drives the character preview; Confirm commits it and returns to quests, while Cancel discards it. The wardrobe is not a dialog and uses no clothing dropdowns. It groups owned choices into the four clothing slots. Starter tank/pants can always be selected; shoes/hat allow none. Equip switches only one slot and never deducts coins. Use the same renderer/asset mappings as the dashboard.
Implements `prd.md > Wardrobe`.

### Sound Effects
`game/soundEffects.ts` synthesizes original short click, quest chime, reward-transfer tick sequence, and ascending level-up fanfare using one lazily created Web Audio AudioContext. Initialize/resume from user interaction; never autoplay on load. A captured click listener handles enabled buttons and quest checkboxes, including tab/dialog actions. RewardEffects plays the quest cue on acknowledgement opening and transfer cue on Close; LevelUpCelebration plays its fanfare only when the displayed level advances. A header sound toggle sets master gain and stops scheduled oscillators immediately when muted. Disconnect nodes after playback. Audio failures do not block player actions. No external samples, keys, or new packages. [AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext), [audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices). Sound preference is session-only. Add quest and purchase controls skip the generic capture-listener click to play their own ding/cha-ching. Reordering plays budoop only when order changes.

### Player Rules and Save Adapter
`gameReducer.ts` owns create/edit, add/delete/complete, favorite, reorder, purchase, wardrobe-open and equip transitions. Invalid transitions leave the player unchanged and return an explanatory result for feedback. Components cannot directly increment XP or deduct coins.

`save.ts` loads/writes one versioned JSON document under `level-up:save:v1`, catches browser storage errors, and validates runtime data against catalog and appearance IDs. Do not persist asset bytes or SVG markup. Never silently erase an unreadable save: show recovery feedback and allow an explicit fresh start, without overwriting the old value until chosen.
Implements `prd.md > States and Boundaries` and `Same-Device Progress`.

## Data Model
```ts
type PlayerSave = {
  schemaVersion: 1;
  player: {
    name: string;
    gender: 'male' | 'female';
    bodyId: 'base-a' | 'base-b';
    hairStyleId: 'short-swept' | 'long';
    hairColorId: string;
    eyeColorId: string;
    expressionId: 'smile' | 'neutral';
    totalXp: number;
    coins: number;
    activeQuestIds: string[];
    ownedItemIds: string[];
    newItemIds: string[];
    questCompletions: Record<string, number>;
    questCooldowns: Record<string, number>; // Home quest ID -> unlock timestamp (ms)
    favoriteQuestIds: string[];
    equipped: { shirt: string; pants: string; shoes: string | null; hat: string | null };
  };
};
type Quest = { id: string; name: string; category: 'home' | 'health' | 'social'; xp: number; coins: number };
type Cosmetic = { id: string; name: string; slot: 'shirt' | 'pants' | 'shoes' | 'hat'; price: number; requiredLevel: number; description: string };
```
Static definitions live in `src/data/`; player state lives in the reducer and localStorage. Search text, selected tabs, dialogs, and temporary notifications are session-only UI state. Setup draft is committed only when finished.

Derived level is `1 + Math.floor(totalXp / 100)`; bar progress is `totalXp % 100`. Rewards are 15/5, 35/10, and 60/20 XP/coins. Spending coins never alters XP. Complete checks active membership before awarding; a second completion is a no-op. Re-add after removal creates a legitimate new occurrence. Purchase checks ownership before charging; equip checks both category and ownership.

Validate nonnegative safe-integer XP/coins, allowed appearance IDs, unique quest/item IDs, and legal slot assignments. Browsers can modify local saves; this is not an authoritative anti-cheat economy. No cross-tab concurrent editing guarantee in this proof of concept.

## File Structure
```text
project/
├── index.html                         # Vite entry
├── package.json / package-lock.json    # Scripts and exact dependency versions
├── tsconfig*.json / vite.config.ts     # Type checking, React build, test settings
├── README.md                          # Run, demo, save limits, asset notes
├── public/icons/pixel-coin.svg        # Shared original pixel coin
├── public/fonts/level-up-pixel.ttf     # Local original display font
├── scripts/build_pixel_font.py        # Reproducible font source
├── public/avatars/
│   ├── base-a.png / base-b.png         # Selected base artwork
│   ├── hair/                          # Fitted front/back hair layers
│   └── base-*-mouth/shirt/shoes/hat.png # Body-specific appearance layers
├── src/
│   ├── main.tsx / App.tsx              # Startup and application shell
│   ├── styles.css                     # Layout, dialogs, feedback
│   ├── pixel-theme.css                # Latest arcade theme overrides
│   ├── types.ts                       # Domain types
│   ├── data/
│   │   ├── quests.ts / cosmetics.ts    # Curated starter collections
│   │   └── avatarPresets.ts            # Geometry, colors, layer mappings
│   ├── game/
│   │   ├── gameReducer.ts             # Validated player actions
│   │   ├── progression.ts / save.ts    # Derived levels and versioned persistence
│   │   ├── gameReducer.test.mjs         # Reward and purchase integrity
│   │   └── save.test.mjs                # Save round trips and invalid data
│   └── components/
│       ├── CharacterSetup.tsx / Avatar.tsx
│       ├── PersonalStats.tsx / FavoriteQuests.tsx
│       ├── QuestCatalog.tsx / DailyQuests.tsx
│       └── Shop.tsx / Wardrobe.tsx / Modal.tsx / CoinIcon.tsx
├── devpost/                           # Canonical planning docs; learner profile ignored
└── output/imagegen/                   # Preserved generation experiments and prompts
```
Only selected assets are copied to `public/avatars/`; prototypes are not runtime dependencies. Do not overwrite originals or user-refined final files.

## External Services and Dependencies
No runtime API endpoints, authentication, database, cloud storage, payment service, or keys. Image generation is a development-time asset tool; the app does not call it. Generated assets ship locally. Public hosting is undecided and optional. Dependency installation requires registry access; restricted network access already prevented a separate Python-package installation during asset work, so verify npm access early instead of promising installation will succeed.

## Important Failure Modes
- **Unavailable/corrupt browser save:** show an explanation; preserve the stored value until explicit recovery. Write failures keep current session progress but visibly warn it may not survive closing.
- **Missing/misaligned character layer:** retain a visible base and report the missing asset. Do not award an apparently equipped item whose appearance cannot be rendered. Fitting is an early build check, not concealed behind placeholder controls.
- **Repeated or invalid actions:** reducer rejects duplicate quests, repeated completions, duplicate purchases, unaffordable/locked purchases, and unowned equips without changing balances.

## Verification Approach
- Focused rule tests: three ordinary quests produce 105 XP, level 2, 5 XP into the next level, and 55 coins including the 25-coin level bonus; repeated completion cannot double-award; deletion awards nothing; re-add works; gated/duplicate purchases cannot charge; equipping unowned items fails.
- Save tests: round trip preserves progress and appearance; invalid or unsupported saves are recognized; storage errors produce a warning.
- Browser/manual walkthrough: setup, catalog tabs/search/no matches, Added button/favorites, deletion/reordering, completion feedback, shop lock/affordability/ownership states, wardrobe changes, refresh restoration, and dialog closing/focus.
- Avatar visual check: both bodies with both hairstyles, colors, expressions, and each clothing slot; check light/dark backgrounds, tank coverage, mask alignment, and thumbnail/dashboard consistency. Known edge polish can remain deferred, as the learner chose, but nonfunctional appearance choices cannot.
- Run type checks and production build. Browser automation was unavailable during asset previews; if it remains unavailable, report that and use a concrete learner-assisted walkthrough rather than claim automated visual verification.

## What Was Simplified and Why
Single browser save, small local catalogs, one dashboard with an inline right-hand workspace and a reward acknowledgement dialog, and fixed-pose artwork keep the personal reward loop demonstrable. Accounts, households, large inventories, multi-attribute stats beyond per-quest skills, reward chests, live 3D movement, and recurrence remain outside this build. White tank-top underlayers replace gray starting shirts by learner request.

## Decisions and Open Issues
- Learner accepted the stack, fixed-pose 3D-looking artwork, Male/Female choices mapped to body bases, independent hairstyles, and the starter appearance/shop counts.
- Genuine uncertainty: whether image generation could produce interchangeable parts. The initial generator changed placement and retained haze. A fixed-template shirt-color/hair preview was adjusted using learner screenshots and visually accepted. That proves a limited renderer technique, not every new asset combination.
- Learner explicitly authorized code-based cleanup, then observed opaque edge artifacts introduced by traced mattes. They chose to defer edge perfection. Preserve that risk; do not describe those assets as flawless.
- Appearance layers and six cosmetic variants are implemented; learner-approved fitting technique retains known deferred edge/alignment polish. Further clothing additions need fitting verification on both bodies.
- Build and focused tests pass. Local server/browser interaction checks remain learner-assisted due session tooling restrictions.
- Build uses the learner-selected fast mode. Optional public deployment remains for shipping.

Successful purchases emit a purchase event, play a synthesized register cha-ching instead of the button tick, and open an item dialog with picture, name, description, Equip, Wardrobe and Close. Equip uses the existing ownership/category guard. New item IDs accumulate independently of equipment and clear together only on opening the wardrobe; yellow counters appear on wardrobe entry buttons. Rejected purchases never emit a purchase event or add unread items.

Level advancement awards 25 bonus coins per crossed level in the completion reducer, independently of dialog dismissal. The displayed XP rollover opens a centered advancement dialog showing the reached level and bonus. Existing character effects and fanfare are retained. Restoring progress initializes the displayed level without replaying or awarding advancement.

### Personal Stats revision
At the learner’s request, simple per-quest skills are now included. Each real quest completion increments that quest’s saved count by one, worth one skill XP. Skill level is 1 + floor(count / 5), and progress toward the next level is count % 5. Counts stay separate from character XP and coins. Hover or keyboard focus reveals lifetime completion count. Personal Stats is accessed through the central workspace tab; its earlier player-side launcher was removed. Older saves lack historical completion records, so they retain all existing progress and begin skill counts at zero. Detailed multi-attribute stats and mystery boxes remain deferred.

### Favorite quest shortcuts
The desktop dashboard uses player, central workspace, and slim right rail columns. The rail contains the Quest Catalog dialog trigger and saved favorite quests; the catalog trigger is removed from workspace tabs. Each catalog quest has a favorite toggle. Rail Add quest buttons use the same duplicate guard and quest chime, display disabled Added while active, and become available again after completion/removal. Unfavoriting never removes an active quest or progress. Rail sticks within the viewport and scrolls internally when its favorite list is long; smaller screens stack the rail. Older saves initialize favorites as empty without losing progress.

Completion awards 25 bonus coins per crossed character level and increments questCompletions for that quest once. Skill level is 1 + floor(count / 5); progress is count % 5. Save validation checks known, unique favorite IDs and known nonnegative safe-integer completion counts. Missing favorite/history fields in older version-1 saves migrate to empty values without changing prior progress.

Home cooldown implementation: questCooldown.ts defines 12 hours and countdown formatting. Complete records now + 12h for home quests in the same player update as rewards; add rejects attempts before expiry. Catalog/FavoriteQuests share cooldown calculations and a once-per-second display clock, plus focus refresh. Only the deadline is saved; ticking writes no player data. Save validation accepts known home IDs and nonnegative safe-integer deadlines; older version-1 saves migrate to empty cooldowns.

Male shirt assets: scripts/fit_male_shirts.py reads each source alpha bounding box and resamples into a shared shirt envelope on a 1024×1536 canvas, writing public/avatars/shirts/fitted/<color>.png without altering sources. maleShirts.ts maps stable item IDs to these fitted files. Avatar uses fitted shirt SVG overlays above the direct male base; ItemPicture uses the same images. Wardrobe shirt choices derive from cosmetics.ts. maleOnly cosmetics are filtered by Shop/Wardrobe and guarded on purchase/equip/save; changing body clears an incompatible equipped shirt but retains ownership.

MaleHair.tsx uses public/avatars/hair/newHair/fitted/<color>.png on a 1024×1800 layer, translated y=-120 in aligned male coordinates to account for the reference canvas. scripts/fit_male_hair.py preserves the black reference verbatim and fits Brown/Blonde/Gray alpha bounds to its 424×294 region at (308,78), using premultiplied resampling. All colors share one placement; originals are not overwritten. Gray hair is accepted in saved appearance; female controls remain limited to the original three colors.

Male sneakers: scripts/fit_male_shoes.py adapts the supplied 1040×2000 source into public/avatars/shoes/male-sneakers-fitted.png on a 1024×1536 canvas. maleShoes.ts shares the path between Avatar and ItemPicture. Inspected a composited ankle/toe close-up; original source remains intact. Purchase/equip use existing sneakers ID and ownership rules.

Male shoe variants are mapped by stable IDs in maleShoes.ts. fit_male_shoes.py now normalizes the five new *-shoes.png sources to the existing reference envelope (244,1370; 540×166) in fitted/ subfolder, preserving originals and the first fitted green/white pair. Source canvases already match 1024×1536; corrections were only 1–2px. Inspected six-pair composites on all three complexions. Wardrobe shoe choices derive from cosmetics; buy/equip/save enforce maleOnly.

MalePants.tsx draws male-default-fitted.png above the male base and below shirt/shoes. scripts/fit_male_pants.py adapts the supplied 1040×2000 source to 1024×1536, widens upper hips by 6.5%, and tapers width toward cuffs. Renderer and ItemPicture share this asset and existing dark/olive filters. Outfit IDs and saves remain unchanged.

## Household Backend Expansion
Supabase SDK 2.118.0 is pinned. src/lib/supabase.ts reads ignored VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY without logging them. No service-role credentials are shipped to the browser. Learner applied migration 001, confirmed readiness, and showed a real signed-in account.

Migration 001 creates unique lowercase username profiles, one-household membership, expiring invite codes, and immutable completion snapshots. RLS restricts reads to self/same-household; authenticated RPCs handle writes through private implementations with fixed search paths and auth.uid checks. Emails/passwords stay in Supabase Auth. SQL rollback tests in supabase/tests/households.sql cover membership isolation and duplicate guards, but remain unexecuted here because PostgreSQL shared memory is blocked. No new migration is needed for the UI slice.

## Email Authentication Implementation
Registration uses username/email/password and required signup metadata; sign-in uses email/password. App-level useAccount observes restored sessions, sign-out and PASSWORD_RECOVERY. Recovery opens a new-password form even without a local player. HouseholdSetup handles real SDK calls, busy/error states, email confirmation instructions and local-session sign-out. Redirects use current origin/path and require dashboard Site URL/allowlist configuration. Passwords never enter application saves. Notification emails remain deferred.

## Household UI and Completion Synchronization
src/household/useHousehold.ts owns household state independently of the popup. It reads membership, household, member profiles, invite and activity under RLS. HouseholdPanel renders Create/Join, invite copy/renew, Activity/Members tabs, confirmation-based leave/delete, refresh and older activity. Profile writes contain only display name, derived level and whitelisted head appearance. CSS crops the existing Avatar component for member/activity portraits.

App validates successful completion through the same pure reducer before queuing one event and dispatching the reward. Per-render repeat-click protection prevents duplicate queued events. Events contain stable UUID, account ID, original household ID, timestamp and minimal profile snapshot; separate per-account local storage preserves pending retries. One writer syncs event profile snapshots before the record RPC, then restores the latest profile. RPC authorization headers bind writes to the checked account token. Failed writes retain their event ID so server ON CONFLICT deduplicates retries. Pending events must sync before voluntarily leaving; corrupt queues remain untouched. Local game rewards proceed regardless of network outcome. Events older than 30 days or for households no longer available require manual resolution; those server rejections remain visible. Concurrent game tabs are not an established supported sync scenario; cross-device personal progress is implemented in the account-save expansion below.

Refresh runs every 30 seconds while visible, on reconnect, on dialog opening and after sending activity. Activity queries retain the visible history length and load 30 older entries per request. Late read results are guarded against account changes. Head data is validated before rendering to prevent invalid paths/IDs. Members see head appearance only, with clothing sharing deferred.

Verification: production build and 47 Node tests pass, including profile privacy, retry-ID/account/household retention, invalid queue rejection and remote head validation. No browser-control tool is available; cross-account live RLS/create/join/activity checks remain learner-assisted, as does the rollback SQL script.

## Account Player Save Architecture
Migration 002 adds public.player_saves (user_id PK, schema_version 1, full player JSON or null, revision, mutation_id and timestamp). RLS permits SELECT only for the owning auth.uid; other household members have no access. Direct client writes are revoked. The authenticated save_account_player invoker wrapper calls a private fixed-search-path implementation which derives the caller, serializes on their profile row, checks expected revision and deduplicates the most recent mutation UUID. JSON is bounded to 256KB; frontend runtime validation enforces the known player shape. Rewards remain honesty-based/client-driven; this is not a competitive server-authoritative game.

App gates authentication resolution first, then keys PlayerSession by authenticated user ID (or guest). usePlayerSave loads/validates that account's cloud data before GameApp mounts. Account-specific caches use level-up:account-save:v1:<uid>; guest writes use a separate guest key. The original legacy save is preserved, with a legacy-owner marker preventing it from reappearing after linking. First-time cloud save initialization offers a concrete Link/Create choice. No data is automatically copied between accounts. Household signup/sign-out screens remain accessible without a player or when loading fails.

Changed players are synchronously cached pending before a 250ms debounced RPC. One writer drains newer changes, advances acknowledged revision and preserves dirty state if further changes arrived in flight. Retry uses mutation UUIDs; lost acknowledgements are idempotent. Fixed Authorization headers bind each request to the checked account token. Session switching unmounts old gameplay immediately; save responses remain scoped to the original cache. Automatic retries run every 15 seconds and on reconnect; clean caches never overwrite cloud data. Fresh boot requires a successful cloud fetch. Existing open sessions continue during transient network failure. Pending saves prevent normal sign-out and trigger beforeunload warning.

A conflicting server revision pauses further writes. The conflict screen offers JSON export and explicit latest-cloud loading, archiving pending local data before replacement. Unsynced data is not merged. Account Reset waits for pending saves then commits a null tombstone at the expected revision before the reducer clears the player; subsequent logins show setup, not a resurrected legacy player. Reset controls are disabled while in flight.

Verification: 52 Node tests plus production build pass. New tests cover account cache isolation, cloud validation, revision reconciliation, lost-ack detection, null resets and legacy/guest separation. Rollback SQL suite supabase/tests/account_player_saves.sql covers own-user and same-household access, anon/direct-write denial, RPC idempotency, conflict and reset. SQL/live browser checks remain pending because the coding session cannot access the configured database/admin dashboard or browser UI.
