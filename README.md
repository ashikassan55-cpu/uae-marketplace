# UAE Marketplace

AI-powered secondhand marketplace for the UAE. See the project's saved docs for full context:
`claude/design-handoff.md` (screen inventory), `claude/pro-tier-plan.md`, `claude/shop-verification-flow.md`,
and `firestore-data-model.md` (the schema this app is built against).

## What's actually working right now

Run `npm run dev` and you'll get a fully clickable app with **sample data**, even before any
Firebase project exists:

- Home, Search (with filters + keyword ranking), and listing detail pages
- Google Sign-In (once Firebase is configured — see below)
- Posting a listing (with photo upload to Storage), including the Real Estate
  "coming soon" compliance-data-collection variant and the Jobs coming-soon dialog
- Saving/unsaving listings, a real-time chat thread once a chat exists, marking a listing sold
- Firestore security rules, indexes, and Storage rules, matched to the schema
- A Cloud Function that runs every new listing through Claude for content moderation, and a
  callable for shop-lead outreach with an atomic once-per-buyer-per-item rate limit

Everything else in the screen inventory (shop verification, shop dashboard stats, Pro tier
reports/leads, stories) has a **real route** you can navigate to, with a placeholder screen
that states exactly what data it reads/writes once built — see each page's "Not built yet" box.
That's deliberate: the core loop (auth → post → search → chat) came first, per the project's own
suggested build order.

## 1. Create the Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
2. **Build → Firestore Database** → Create database → **production mode** → pick a region close
   to the UAE (e.g. `europe-west1` or `asia-south1` — Firebase has no UAE region yet).
3. **Build → Authentication** → Sign-in method → enable **Google**.
4. **Build → App Check** → Apps → register your web app → provider **reCAPTCHA v3** → copy the
   site key.
5. **Build → Storage** → Get started (production mode).
6. Project settings (gear icon) → **General** → scroll to "Your apps" → **Add app → Web** → copy
   the config object.
7. Project settings → **Service accounts** → **Generate new private key** → save the JSON
   somewhere safe (never commit it).

## 2. Configure this app

```bash
cp .env.local.example .env.local
```

Fill in the `NEXT_PUBLIC_FIREBASE_*` values and `NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY` from step 1.
For `FIREBASE_SERVICE_ACCOUNT_KEY`, paste the entire downloaded JSON file as a single line.
For `ANTHROPIC_API_KEY`, get a key from [console.anthropic.com](https://console.anthropic.com).

```bash
npm install
npm run dev
```

Open http://localhost:3000 — Google Sign-In, real listings, and Storage uploads now work against
your real Firebase project. Until you fill in `.env.local`, the app runs fine against the built-in
sample data (see `src/lib/data/mock.ts`) so you can preview it immediately.

## 3. Deploy Firestore/Storage rules and indexes

```bash
npm install -g firebase-tools   # if you don't have it
firebase login
firebase use --add               # pick the project you created
firebase deploy --only firestore:rules,firestore:indexes,storage
```

## 4. Deploy the Cloud Functions

The moderation function needs your Anthropic key as a **secret** (not a plain env var) so it's
never exposed:

```bash
cd functions
npm install
firebase functions:secrets:set ANTHROPIC_API_KEY
npm run deploy
cd ..
```

## 5. Push this to GitHub

This workspace has git initialized but no GitHub CLI access, so push it yourself:

```bash
git add -A
git commit -m "Initial scaffold"
gh repo create uae-marketplace --private --source=. --push   # if you have gh installed, or:
git remote add origin https://github.com/<you>/uae-marketplace.git
git push -u origin main
```

## 6. Deploy to Vercel

1. [vercel.com/new](https://vercel.com/new) → import the GitHub repo you just pushed.
2. Add every variable from `.env.local` to the Vercel project's **Environment Variables**
   (Settings → Environment Variables). For `FIREBASE_SERVICE_ACCOUNT_KEY`, Vercel supports
   multi-line values — paste the JSON as-is.
3. Deploy. Vercel auto-redeploys on every push to `main`.

## Notable design decisions baked into the code (don't undo these)

- **All Firestore reads happen client-side**, using the Firebase JS SDK from Client Components
  (`"use client"`), never from Server Components. Earlier in scaffolding, importing the client SDK
  into a Server Component silently produced a broken Firestore instance under Turbopack's RSC
  module boundaries — not a crash, just wrong behavior (always falling back to sample data even
  with a real project configured). If you want real SSR/SEO for listing pages later, add a
  parallel server-side data layer using `src/lib/firebase/admin.ts` (Admin SDK) rather than
  importing `src/lib/firebase/client.ts` into a Server Component.
- **Moderation status is backend-only.** `src/lib/data/listings.ts` currently writes
  `status: "active"` directly as a placeholder. Once `functions/src/index.ts`'s
  `onListingCreated` is deployed, change that back to `status: "pending"` so nothing goes live
  before the Claude content check runs.
- **Real Estate / Jobs are config flags**, not hardcoded branches — see `COMING_SOON_CATEGORIES`
  in `src/lib/types.ts` and `config/categoryFlags` in Firestore. Flipping Real Estate on later is
  a data change, not a code change (the listings collected via `/post/real-estate` are already
  sitting in Firestore with `status: "draft"`, ready to publish).
- **Shop subdomains** (`shopname.yoursite.ae`) aren't wired up yet — `/shop/[subdomain]` currently
  serves shop pages at a normal path. Real subdomain routing needs Next.js middleware that rewrites
  based on the `Host` header plus a wildcard DNS/TLS setup on whatever domain you buy; worth doing
  once there are real shops to give pages to.

## Suggested order for what's next

Matches the priority order already agreed in `claude/design-handoff.md`:

1. **Shop verification** (`/shop/apply` → `/shop/pending` → dashboard unlock) — wire up the
   two-stage AI+human flow from `claude/shop-verification-flow.md`. The Storage rules and
   `shops.verification` schema are already in place; you mainly need the upload UI and the
   `onShopVerificationSubmitted` Cloud Function (stubbed as a TODO in `functions/src/index.ts`).
2. **Shop dashboard stats + public shop page + cart** — straightforward Firestore queries against
   the existing schema.
3. **Moderation → notifications** — connect `onListingCreated`'s rejection path to
   `/post/blocked` and a real notifications feed.
4. **Pro tier** (Interested Buyers, Reports) — `sendShopOffer` is already deployed; build the UI
   against it, plus the daily-visitor-counter Cloud Function described in `pro-tier-plan.md`.
5. **Translation** — on-demand listing/message translation callables, cached per
   `firestore-data-model.md`'s `translations` / `textTranslations` fields.
6. **Embeddings-based semantic search** to replace the current keyword-match ranking in
   `src/lib/data/listings.ts` — the "own listings first, hand only the filtered candidate set to
   Haiku" cost-control shape is already there; swap the scoring function.
