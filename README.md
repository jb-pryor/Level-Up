# Level Up

Level Up is a gamified task tracker with customizable cartoon avatars and shared households. Complete real-life quests to earn XP and coins, unlock clothing, and track activity with the people you live with.

**[Try Level Up](https://leveluptodo.xyz)** · **[Watch the video walkthrough](https://www.youtube.com/watch?v=pMXMZ4k6vko)**

## Features

- **Quest catalog:** searchable tasks across Home, Health, Social, Education, and Exploration, with favorites and a personal daily quest list.
- **Character progression:** increasing XP requirements, level-up celebrations, personal stats, and one loot box for every level gained.
- **Avatar customization:** male and female bases, complexions, eye colors, hairstyles, and an owned-item wardrobe with outfit previews and confirmation.
- **Clothing rewards:** Common, Rare, Epic, and Legendary items, with equipped clothing bonuses to quest XP and coins. Bonuses round up to whole numbers and appear separately on completion.
- **Two shops:** a permanent basic collection and a Daily Shop unlocked at level 3. Every 12 hours, the Daily Shop selects four distinct items: three shirts or pants, plus a fourth with a 50% chance of shoes and a 50% chance of another shirt or pair of pants.
- **Loot boxes:** a random Daily Shop cosmetic plus 15, 20, 25, 30, or 35 coins. The current clothing drop odds are 60% Rare, 25% Epic, and 15% Legendary, with equal chances within each rarity. The pool includes the full active Daily Shop collection, not just the four displayed items. Duplicates can be quicksold for 50–75% of their item's value, rounded up.
- **Shared households:** account-based membership, invite codes, completed-quest activity, full-body member avatars, levels, shared XP progress, and recent activity indicators.
- **Saved progress:** browser saves for guests and private Supabase-backed saves for signed-in accounts, with account-specific local caching and sync feedback.
- **Arcade presentation:** pixel-style interface, original synthesized sound effects, and optional chiptune music.

## Try the core flow

1. Create a character and open the quest catalog.
2. Search for a task, add it to your list, and mark it complete after doing it in real life.
3. Watch your XP and coins increase. Complete more quests to level up and earn a loot box.
4. Buy clothing in the shop, open the wardrobe, and confirm an outfit. Hover over equipped clothing to inspect its bonuses.
5. Register or sign in to save your character to an account. Create a household and invite another account to see shared activity and member avatars.

Home quests have a 12-hour cooldown after completion. Purchases add items to your wardrobe; they do not automatically change your outfit. Daily Shop stock stays fixed until the UTC midnight/noon reset, including when the page is refreshed or an item is purchased.

## Technology

| Area | Implementation |
| --- | --- |
| Interface | React 19, TypeScript, Vite |
| Game state | React reducer and typed quest/cosmetic catalogs |
| Avatar rendering | Layered PNG artwork with SVG positioning, clipping, and filters |
| Accounts and database | Supabase Auth, Postgres, Row Level Security, and database functions |
| Local persistence | Versioned browser `localStorage` saves and account caches |
| Audio | Web Audio API; music and effects are synthesized locally |
| Tests | Node.js test runner with experimental TypeScript stripping |
| Deployment | Static Vite build; compatible with Vercel |

## Run locally

The project has been tested with **Node.js 22.13.1** and npm. Use the committed lockfile to install dependencies.

```bash
npm ci
npm run dev
```

Open **http://127.0.0.1:5173**. The development server uses that host and port by default.

Guest play works without Supabase configuration. To enable accounts, cloud saves, and households, complete the setup below.

### Configure Supabase

1. Create or use an existing Supabase project.
2. Copy the environment template:

   ```bash
   cp .env.example .env.local
   ```

3. In the Supabase project's **Connect** panel, find the project URL and publishable key. Add them to `.env.local`:

   ```dotenv
   VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
   ```

   These are browser-facing configuration values. Never put a database password, secret key, or `service_role` key in a `VITE_` variable. `.env.local` is ignored by Git.

4. For a new database, run the SQL files in [supabase/migrations](supabase/migrations) in numeric order, **001 through 010**, using the Supabase SQL Editor. For an existing installation, apply only the migrations that have not already been applied. Migration 010 registers the latest quests for household activity.
5. In Supabase **Authentication → URL Configuration**, add `http://127.0.0.1:5173/` as an allowed redirect URL. Configure the Site URL for the environment you are using.
6. Restart the development server after changing environment variables.

See [the backend setup guide](supabase/README.md) for database details and account/household checks. For public registration, configure production SMTP and test email confirmation and password recovery.

### Saves and account behavior

- Guest progress belongs to the current browser and origin. Changing host or port creates a separate local storage context; clearing site data removes guest saves.
- Signing in loads that account's character and progress. Existing guest progress can be linked through the app's explicit account-linking flow.
- Signed-in progress syncs to Supabase. Check sync feedback before switching devices, particularly after playing without a connection.
- Household members see shared character information and completed activity. They do not receive another member's private coins, inventory, or unfinished quest list.
- Presence reflects recent app activity; it is not an exact real-time online guarantee.

## Checks and production build

```bash
npm test
npm run build
npm run preview -- --host 127.0.0.1
```

The test suite covers progression, quest rewards and cooldowns, clothing boosts, purchase/equipment rules, save compatibility, household payloads, loot odds, and shop rotation. The last verified run passed **125 tests** and the production build.

`npm run build` writes the static website to `dist/`. The preview command serves that build locally; it does not deploy the app. Live email delivery, cross-device account flows, and visual behavior should also be checked manually on the deployed site.

## Deploy with Vercel

1. Push the source code and runtime assets to your GitHub repository.
2. Import the repository into Vercel with the **Vite** framework preset.
3. Use **`npm run build`** as the build command and **`dist`** as the output directory.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the project's environment variables before building. Redeploy after changing them.
5. Deploy, then set the live HTTPS address as the Supabase Auth Site URL and add it to allowed redirect URLs. Keep local development redirects if still needed.
6. Test registration, recovery links, account saves, household invites, and asset loading at the live address.

Vercel serves the frontend and static assets. Supabase continues to host authentication and the database; no separate application server is required for the current architecture. A custom website domain is optional.

## Project structure

```text
src/
  components/      Avatar layers, quest catalog, shops, wardrobe, and dialogs
  data/            Quests, cosmetics, humor, and asset metadata
  game/            Progression, rewards, saves, loot, rotation, audio, and tests
  account/         Account-save synchronization
  auth/            Authentication state
  household/       Household membership and shared activity
  lib/             Supabase client configuration
public/avatars/    Runtime character and clothing images
supabase/          Database migrations, SQL tests, and setup documentation
devpost/           Project planning, implementation notes, and asset notes
scripts/           Asset preparation and font-generation utilities
```

## Artwork and audio

Avatar and clothing artwork combines AI-generated images with manually resized and positioned assets. Clothing is fitted for each avatar through shared rendering components and body-specific metadata. Runtime images live in `public/avatars/`; generation records and preparation material are retained under `output/imagegen/` and [asset notes](devpost/asset-notes).

The local pixel display font is generated by `scripts/build_pixel_font.py`. Sound effects and music are original Web Audio compositions in `src/game/soundEffects.ts` and `src/game/music.ts`; neither requires an external audio service.

## Current limits and future work

- Task completion is self-reported. Parent approval and parental household controls are planned ideas, not implemented features.
- XP, currency, purchases, and loot are calculated in the browser. Account saves are private, but the economy is not server-authoritative and is not intended for paid rewards, trading, or competitive rankings.
- Daily Shop rotation follows the device clock and a shared seeded 12-hour schedule. Loot drops are generated independently from the complete daily catalog.
- Some artwork may need further fitting refinement. Runtime images are currently PNGs; image optimization and removing unused public reference assets are useful next steps for mobile loading.
