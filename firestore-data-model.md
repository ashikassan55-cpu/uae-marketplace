# Firestore data model — v1

Written against the 42-screen design canvas inventory (`claude/design-handoff.md`) and the two related decision docs (`claude/pro-tier-plan.md`, `claude/shop-verification-flow.md`). Collections are flat/top-level except where noted, favoring queryability over nesting (e.g. `saves` is top-level, not nested under `users`, so a shop can query "who saved my listings" directly).

Every field a client must never set directly (moderation, verification, pro/trial status, ratings) is written ONLY by Cloud Functions using the Admin SDK — Firestore rules block client writes to those fields. See firestore.rules.

## `config/{doc}`

Simple flags, not real feature logic — matches the project's "config flag, not hardcoded branching" instruction for Real Estate / Jobs.

- `config/categoryFlags` — `{ realEstateEnabled: boolean, jobsEnabled: boolean }`

## `users/{uid}`

- `uid, email, displayName, photoUrl`
- `createdAt, lastSeenAt`
- `preferredArea: { emirate, area? }`
- `preferredLanguage` (for on-demand translate default + AI query normalization)
- `role: 'individual' | 'shop'` — `'shop'` once `shopId` is set and approved
- `shopId?` — set once a Verified Shop application is approved
- `rateLimit: { listingsWindowStart: Timestamp, listingsInWindow: number }` — backend-enforced new-account cap (2-3 listings / 24h)
- `suspended: boolean, suspendedReason?, suspendedAt?` — backend-only
- `notificationPrefs: { ... }`

Individual sellers' "Save/Shortlist" is tracked in the top-level `saves` collection below, not a subcollection here, so it can be queried both ways (by buyer for the Saved grid, by shop for Interested Buyers).

## `listings/{listingId}`

- `id, ownerUid, ownerType: 'individual' | 'shop', shopId?`
- `category, subcategory, title`
- `description, descriptionLang` (as submitted) and `descriptionEn` (auto-translated at submission)
- `translations: { [lang]: string }` — cached on-demand translations, keyed by language, per listing+language cost control
- `price, currency: 'AED', condition: 'new'|'like_new'|'good'|'fair'|'for_parts'`
- `emirate, area, location?: GeoPoint`
- `images: string[]` (Storage URLs)
- `status: 'draft' | 'active' | 'sold' | 'suspended' | 'removed'`
- `createdAt, updatedAt, soldAt?`
- `moderation: { status: 'pending'|'approved'|'flagged'|'rejected', reasons: string[], checkedAt }` — backend-only, set by the Claude content-screening function on submit
- `realEstate?: { permitNumber, permitType: 'trakheesi'|'rera', published: false }` — collected but never surfaced while `config/categoryFlags.realEstateEnabled` is false
- `embedding?: number[]` — semantic search vector, backend-only
- `searchKeywords: string[]` — cheap keyword prefilter before handing candidates to Haiku for ranking

Cost-control note (per project instructions): search always filters `listings` with normal Firestore queries (category/emirate/price range/status==active) first; only the resulting candidate subset is ever sent to the Haiku ranking call.

## `shops/{shopId}`

- `id, ownerUid, shopName, subdomain` (unique, lowercase, used for `subdomain.yoursite.ae`)
- `logoUrl?, coverPhotoUrl?, description, categories: string[]`
- `verification: { status: 'submitted'|'ai_review'|'needs_attention'|'pending_human'|'approved'|'rejected', tradeLicenseUrl, emiratesIdFrontUrl, emiratesIdBackUrl, aiCheck?: { extracted: {...}, pass: boolean, reasons: string[], checkedAt }, humanReview?: { reviewerId, decision, notes, decidedAt } }` — backend-only past the initial submission
- `proTrialEndsAt: Timestamp` — set to `approvedAt + 60 days` by the backend the moment verification flips to `approved`; never client-writable
- `pro: boolean` — real paid-Pro flag, unused until billing exists, defaults false
- `rating: { avg: number, count: number }` — backend-only, recomputed from `reviews`
- `createdAt`
- `storiesConfig: { maxConcurrent: number }` — trial/paid tier controls concurrent story count (base stories feature itself is not Pro-gated)

## `shops/{shopId}/stories/{storyId}` (subcollection — always scoped to one shop)

- `imageUrl, tiedListingId, createdAt, expiresAt` (24h), `soldOut: boolean`

## `carts/{uid}_{shopId}`

Request-bundler, not checkout — one cart per buyer per shop (no mixed-shop carts, mirrors the food-delivery single-restaurant-cart pattern).

- `uid, shopId, items: [{ listingId, addedAt }], updatedAt`

## `saves/{uid}_{listingId}` (doc id is the composite key — dedupes automatically)

- `uid, listingId, shopId: string | null` (denormalized from the listing at save time, null for individual-seller listings)
- `savedAt`

Queries: `where uid == X` → buyer's Saved grid. `where shopId == Y order by savedAt desc` → that shop's Interested Buyers (Pro). Never exposes buyer PII to the shop — only the fact and timing of the save, per pro-tier-plan.md.

## `chats/{chatId}` (doc id: sorted `${listingId}_${uidA}_${uidB}` so a re-open finds the same thread)

- `listingId, participantUids: [buyerUid, sellerUid]`
- `lastMessage, lastMessageAt, unreadCount: { [uid]: number }`
- `shopOutreach?: { shopId, offerId }` — present only for shop-initiated cold outreach, drives the transparency banner

### `chats/{chatId}/messages/{messageId}`

- `senderUid, type: 'text'|'catalogue_attach'|'address_card'`
- `text, textTranslations: { [lang]: string }` (translated on demand, cached per message+lang)
- `attachment?: { listingIds?: string[], address?: {...} }`
- `createdAt`

## `offers/{shopId}_{buyerUid}_{listingId}` (doc id enforces the once-per-buyer-per-item rate limit directly)

- `shopId, buyerUid, listingId, chatId, message, sentAt`
- Existence of this doc == "Offer already sent" in the UI; the backend function that sends an offer checks-then-creates in a transaction.

## `transactions/{transactionId}`

Gates reviews to confirmed completed deals rather than open-to-anyone.

- `listingId, sellerUid, buyerUid?`
- `markedSoldBy, markedSoldAt`
- `buyerConfirmedAt?`
- `status: 'sold_unconfirmed' | 'confirmed'`
- `reviewId?`

## `reviews/{reviewId}`

- `transactionId, listingId, sellerUid, buyerUid, rating: 1-5, comment, createdAt`

## `reports/{reportId}` (user-submitted reports, feeds abuse-pattern detection)

- `reporterUid, targetType: 'listing'|'user', targetId, reason, createdAt, status: 'open'|'reviewed'`

## `appeals/{appealId}`

- `uid, suspensionReason, message, submittedAt`
- `status: 'pending'|'reactivated'|'upheld', decidedAt?, decidedBy?, decisionNote?`

## `analytics/shopVisits/{shopId}/days/{yyyy-mm-dd}`

- `uniqueVisitors: number` — one aggregated counter per shop per day, incremented at most once per unique visitor per day (per pro-tier-plan.md — never a raw per-view write, never inflated). Implementation: a Cloud Function checks a short-lived per-visitor-per-shop-per-day marker (e.g. a doc in `analytics/shopVisits/{shopId}/seen/{dayHash_visitorHash}` with a TTL policy) before incrementing.

## `searchCache/{cacheKey}` (`cacheKey` = hash of normalized query + filters)

- `resultListingIds: string[], createdAt` — TTL ~1 hour via a Firestore TTL policy on `createdAt`, per the project's cost-control instruction (duplicate searches within the window skip a new AI call).

## `verificationLog/{id}` / `moderationLog/{id}`

Audit trail (per shop-verification-flow.md): every automated AI decision, extracted fields, and pass/fail reason, written by the backend function, never the client. Read-only for admins.

---

### Backend-only fields, summarized (Firestore rules must block client writes to all of these)

`listings.moderation`, `listings.embedding`, `shops.verification` (past initial submission), `shops.proTrialEndsAt`, `shops.pro`, `shops.rating`, `users.suspended*`, `users.rateLimit`, `users.role`/`shopId`, `analytics.*`, `searchCache.*`, `verificationLog.*`, `moderationLog.*`, `offers.*` (created by a callable function, not a raw client write, so the rate-limit check is atomic).
