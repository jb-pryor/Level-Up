# Household backend setup

Current state: real email accounts and household creation/joining, invites, member profiles and shared completion activity are implemented. Personal progress remains local. Learner confirmed readiness and sign-in; cross-account household testing is pending.

1. Create a Supabase project, then copy `.env.example` to `.env.local` in the repository root. Supply the project URL and **publishable** key from Connect. Do not add database passwords, service-role or secret keys to Vite variables.
2. Install dependencies with `npm install` (or `npm ci` after the lockfile is committed). Supabase client version is recorded in package-lock.json.
3. In Supabase Dashboard > SQL Editor > New query, paste the full contents of `migrations/001_households.sql` and run once. It creates new tables/functions atomically. Do not run against an unrelated project. If already applied, don't rerun it; later schema changes need a new migration.
4. Restart Vite after creating/changing `.env.local`. Open Household and register or sign in. The readiness probe is also available as household_ready in SQL.
5. Run `tests/households.sql` in a separate SQL Editor query to exercise membership isolation and guards. It creates temporary test users/data inside a transaction and rolls back; expect success. These tests have not been executed in the restricted coding session.

The schema includes unique lowercase usernames (3–24 letters/numbers/underscores), non-unique display names, one household per account, owner-created households, 7-day shareable invite codes, and deduplicated completion activity with display-name/level/avatar snapshots. Any member can read/share the code; only the owner can replace it. An owner cannot leave while others remain. Live sign-in/recovery and cross-account household behavior still need learner review.

All application tables have Row Level Security. Anonymous callers cannot read them or call mutation functions. Authenticated clients have read grants constrained by membership; writes happen through narrowly scoped authenticated RPCs. Privileged functions reside in a private schema, fix the search path and derive the actor from auth.uid(). Auth passwords and private emails belong to Supabase Auth; application profiles contain neither. Public household_ready only returns a boolean, with no account data.

Only authenticated future completions should be shared after joining; historical local completions must not be uploaded retroactively. Username is supplied as `options.data.username` during registration; display name uses `options.data.display_name`. The registration trigger atomically enforces uniqueness. Missing/invalid metadata rejects signup.

Official references:
- https://supabase.com/docs/guides/auth/quickstarts/react
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/database/functions

## Email account screens

The Household dialog now supports registration (unique username + email + password), email/password sign-in, sign-out, and password-reset email/new-password forms. Registration sends the required `username` and independent player `display_name` metadata to the existing database trigger. Passwords go to Supabase Auth and are never written into the player save. Personal progress still stays in this browser. The signed-in screen provides household creation/joining and Activity/Members tabs.

In Supabase **Authentication → URL Configuration**, set Site URL to the app address you use and add that exact address to Redirect URLs (for local development, e.g. `http://localhost:5173/` or `http://127.0.0.1:5173/`; use the same host consistently). Add the deployed HTTPS address before publication. Keep email confirmation enabled under the Email provider. The app uses its current origin/path for confirmation and recovery links. Set up production SMTP before inviting a wider audience; default email delivery has testing restrictions and rate limits.

Try registration with a new username and your own email, follow the confirmation link, then sign in. Close/reopen the dialog, refresh, sign out, sign in again, and verify local coins/clothes/tasks are unchanged. Test a duplicate username with a second email, wrong password, mismatched confirmation passwords, and Forgot password. Open the recovery link in the same browser, set a new password, then sign out and sign in with it. No task reminders are sent, and there is no marketing opt-in implied by registration.

## Try the household slice

No additional migration is needed if 001 was already applied. Refresh Vite, sign in and create a household. Open **Invite your party** and copy its code. In a second browser/profile, create another local player/account, verify its email, sign in, and paste the code into **Join household**. Both accounts should appear under Members, with independent player names, head portraits and levels. Complete a quest in either browser and open Activity in the other; Refresh shows it immediately, or wait up to 30 seconds. Close the popup and complete another quest to verify background sharing. Refresh the page to verify membership restoration. Try an invalid code and duplicate join; neither should change membership. A nonmember must not be able to see another household’s profiles or activity.

Disconnect after membership has loaded, complete one quest, reconnect and Retry household sync. Expect one activity row, not duplicates, and the same local reward total. Pending activity uses account-specific local storage and stable UUIDs; personal progress is separate. Test one active game tab per browser during this proof of concept. Activity captures head appearance, display name and level at completion; shared outfit layers are not included. Nothing shares old local completion history. Readiness/login success is not proof that the SQL isolation tests have passed: run tests/households.sql in the SQL Editor as documented above.

## Account-owned player progress (migration 002)

Run **migrations/002_account_player_saves.sql** once in SQL Editor after 001. It adds a private player_saves table and save_account_player RPC. Never rerun 001 to install this update. Each account can read only its own progress, even when another account belongs to the same household. Household profiles/activity remain separate and share only the existing minimal snapshot.

Refresh, sign in and choose **Link this player** for the intended existing browser player. The original legacy save remains stored as a backup but no longer appears as the signed-out guest. Each browser's existing accounts must be linked from the browser that currently has the intended player. If an account already has cloud progress, it loads that progress without importing a guest. A new device can sign in to the same account after the first device finishes saving. Signed-out users can still create a separate guest player and later link it to a new account.

All player fields are included: appearance, XP, coins, active task order, owned/equipped/unread clothes, favorites, skill counts and absolute cooldown deadlines. Account progress uses per-user browser backup keys. Changed progress is marked pending before an asynchronous save, with automatic retries and visible status. Sign-out waits for pending saves; closing the tab while pending triggers the browser's unsaved-changes warning. A failed cloud load blocks account gameplay rather than showing another user's local player. Fresh offline sign-in/loading is not supported; an already-open session can keep playing and retry its queued save.

Saves use expected revisions and mutation UUIDs. A stale device is blocked from overwriting newer cloud progress. The conflict screen offers a JSON backup download, then explicit loading of the latest cloud save (archiving pending local progress); it does not merge coins or reward history. Reset writes a versioned empty player to the account before removing it from view. Login credentials and household membership are retained.

Run **tests/account_player_saves.sql** in SQL Editor to exercise own-user reads, same-household privacy, anonymous denial, duplicate-request idempotency, stale-revision rejection and reset tombstones. It rolls back its temporary data. These SQL tests have not been executed by the coding session.

Live check: link each intended existing player; wait for **Saved to your account**; sign out and back in; check appearance, balances, wardrobe, task order, favorites, cooldown and stats. In a separate browser, sign in to that same account and confirm its player loads. Switch to a different account and confirm it loads its own player. Complete a quest with the connection interrupted, reconnect and Sync now; check one reward and correct saved progress after reopening. Open two copies, change/save one, then change the older copy; expect conflict handling rather than overwrite. Use only a disposable account to test Reset and verify it stays reset after sign-in elsewhere.
