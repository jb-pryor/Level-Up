# Level Up

A gamified daily quest log where real-life activities develop a personalized cartoon character.

## Run locally

Requires Node.js compatible with the locked Vite version (currently Node 22.13.1 works for the production build).

```bash
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Open http://127.0.0.1:5173. Keep the same hostname and port once local saving is implemented.

```bash
npm run build
```

## Current build step

Character setup and a dashboard preview are implemented. Quest completion, purchases, and browser saving are planned in the following slices; the visible development clothing controls are explicitly a fitting preview, not earned items. Refresh currently starts setup again.

Create a character, try Male/Female and both hairstyles, hair/eye colors and expressions, then open **Edit clothes** on the dashboard. Use the four image-card tabs, preview selections, and Confirm outfit to return to quests. Cancel restores the previous outfit. Known base silhouette edge artifacts are deferred by the learner; other fitting or interaction problems should be reported.

## Assets

Character raster artwork was generated with the built-in image-generation tool, then cut and fitted with learner-authorized code-based cleanup. Selected runtime images live in `public/avatars/`. Original generation outputs, prompt records and preparation scripts are retained under `output/imagegen/`. Male/Female selects the corresponding body; either hairstyle remains available.

## Planning and progress

Canonical scope, PRD, technical spec and build checklist are in `devpost/`. Personal learner context and local credential files are ignored. A demo video and public GitHub repository are required for the hackathon; publishing is a later step.
