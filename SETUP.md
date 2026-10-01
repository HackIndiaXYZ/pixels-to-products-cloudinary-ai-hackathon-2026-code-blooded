# Setup — From Absolute Zero

Every external account Pravaha needs, created from scratch, and exactly where each `.env.local` value comes from.

## Prerequisites

- Node.js 20+ (CI pins 20)
- pnpm — `corepack enable && corepack prepare pnpm@9.12.0 --activate`
- Git, and the GitHub CLI (`gh`) for the PR workflow (`docs/GIT_WORKFLOW.md`)

## 1. Clone and Install

```bash
git clone https://github.com/HackIndiaXYZ/pixels-to-products-cloudinary-ai-hackathon-2026-code-blooded.git pravaha
cd pravaha
pnpm install
cp .env.example .env.local
```

## 2. Cloudinary

1. Sign up at `cloudinary.com` (free, no card). **Keep the default data-center region (US).** Cloudinary's video transcription is not available on the Asia-Pacific data center.
2. Console → Dashboard → copy **Cloud name**, **API Key**, **API Secret**:
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<cloud name>
   NEXT_PUBLIC_CLOUDINARY_API_KEY=<api key>
   CLOUDINARY_API_SECRET=<api secret>
   ```
3. Settings → Upload → **Add upload preset**:
   - Name `pravaha_signed`, Signing mode **Signed**, **no folder** (Pravaha's `public_id`s already start with `pravaha/`)
   - Allowed formats `mp4,mov,webm,mkv,m4v`, max file size 500 MB
   - Enable **auto transcription** and **auto chaptering** (AI / add-on section of the preset)
   - Notification URL: `https://<your-vercel-app>/api/webhooks/cloudinary` (update it once Vercel gives you the URL)
   - `CLOUDINARY_UPLOAD_PRESET=pravaha_signed`
4. Check the AI video features (transcription, chaptering) are available on the account; Phase 01 confirms them on a real upload.

## 3. Database — Neon

1. `neon.tech` → New Project (any region close to Vercel's, e.g. US East).
2. Copy the **pooled** connection string → `DATABASE_URL`.
3. Neon SQL Editor → paste and run `migrations/001_init.sql` (created in Phase 03), or `psql "$DATABASE_URL" -f migrations/001_init.sql`.

## 4. Google Gemini

1. aistudio.google.com → **Get API key** → create → `GEMINI_API_KEY`. Optional: `GEMINI_MODELS` overrides the model chain.
2. Settings → Limits → set a **monthly spend limit** (Ask is public; this is the second cost cap after the app's rate limits).

## 5. Organizer Secrets

```bash
openssl rand -base64 24   # → ORGANIZER_PASSCODE (share only with organizers)
openssl rand -base64 32   # → SESSION_SECRET
```
Generate different values for production.

## 6. Run

```bash
pnpm dev
```
Open `http://localhost:3000`. Organizer tools: `/studio`.

Webhooks need a public URL. Rather than tunnelling, Pravaha deploys to Vercel on Day 1 and uploads are tested against the deployed app (step 7). Local `pnpm dev` covers everything except ingest.

## 7. Deploy — Vercel

1. `vercel.com` → Add New Project → import the GitHub repo.
2. Add every variable from `.env.local` (production values), with `APP_URL=https://<your-project>.vercel.app`.
3. Deploy. Every PR gets its own preview deployment automatically.

## A Test Recording

Phase 01 needs a real 5–10 minute recording with clear speech and 2–3 topic shifts — ideally one of our own sessions, since it tests transcription on our speakers' accents.
