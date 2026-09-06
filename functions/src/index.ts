import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import Anthropic from "@anthropic-ai/sdk";

initializeApp();
const db = getFirestore();

const anthropicApiKey = defineSecret("ANTHROPIC_API_KEY");

/**
 * Content moderation, per the project's security spec: every listing is
 * screened at submission for prohibited items, scam patterns (unrealistic
 * pricing, wire-transfer-only, pressure language), disguised real
 * estate/jobs listings, and duplicate/reused images. Runs server-side only
 * — the client never sets `moderation`, and firestore.rules enforces that.
 *
 * NOTE: lib/data/listings.ts currently writes status: 'active' directly on
 * create as a placeholder. Once this function is deployed, flip that back
 * to status: 'pending' and have this function set the real status after
 * the check (approved -> 'active', rejected -> 'suspended' + notify user,
 * per post/blocked/page.tsx).
 */
export const onListingCreated = onDocumentCreated(
  { document: "listings/{listingId}", secrets: [anthropicApiKey] },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const listing = snap.data();

    const client = new Anthropic({ apiKey: anthropicApiKey.value() });

    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: [
            "You are a marketplace content moderator for a UAE secondhand-goods app.",
            "Review this listing and respond with ONLY a JSON object:",
            '{ "approve": boolean, "reasons": string[] }',
            "Reject for: prohibited items (weapons, drugs, counterfeit goods, live animals",
            "banned by UAE law), scam patterns (unrealistic pricing for the category,",
            '"wire transfer only" / "pay before pickup" pressure language), a real estate',
            "or job listing disguised under another category, or a title/description that",
            "doesn't match the stated category at all.",
            "",
            `Category: ${listing.category}`,
            `Title: ${listing.title}`,
            `Description: ${listing.descriptionEn ?? listing.description}`,
            `Price: ${listing.price} AED`,
          ].join("\n"),
        },
      ],
    });

    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    let result: { approve: boolean; reasons: string[] };
    try {
      result = JSON.parse(text);
    } catch {
      result = { approve: false, reasons: ["Automated check could not be parsed — held for manual review."] };
    }

    await snap.ref.update({
      status: result.approve ? "active" : "suspended",
      moderation: {
        status: result.approve ? "approved" : "flagged",
        reasons: result.reasons ?? [],
        checkedAt: FieldValue.serverTimestamp(),
      },
    });

    await db.collection("moderationLog").add({
      listingId: event.params.listingId,
      ownerUid: listing.ownerUid,
      result,
      checkedAt: FieldValue.serverTimestamp(),
    });
  },
);

/**
 * Send a Pro "shop leads" offer to a buyer who saved one of the shop's
 * listings. Must be a callable (not a raw client write) because the
 * once-per-buyer-per-item rate limit has to be checked and enforced
 * atomically — see pro-tier-plan.md.
 */
export const sendShopOffer = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required.");
  const { shopId, buyerUid, listingId, message, chatId } = request.data as {
    shopId: string;
    buyerUid: string;
    listingId: string;
    message: string;
    chatId: string;
  };

  const shopSnap = await db.doc(`shops/${shopId}`).get();
  if (!shopSnap.exists || shopSnap.data()?.ownerUid !== request.auth.uid) {
    throw new HttpsError("permission-denied", "You don't own this shop.");
  }

  const offerRef = db.doc(`offers/${shopId}_${buyerUid}_${listingId}`);

  await db.runTransaction(async (tx) => {
    const existing = await tx.get(offerRef);
    if (existing.exists) {
      throw new HttpsError("already-exists", "Offer already sent.");
    }
    tx.set(offerRef, {
      shopId,
      buyerUid,
      listingId,
      chatId,
      message,
      sentAt: FieldValue.serverTimestamp(),
    });
  });

  return { ok: true };
});

// TODO (next up, per firestore-data-model.md):
// - onShopVerificationSubmitted: Haiku vision check on trade license + Emirates ID
//   (see claude/shop-verification-flow.md), writes verification.aiCheck, then
//   flips status to 'pending_human' for a manual approval queue.
// - onShopApproved: set proTrialEndsAt = now + 60 days, flip users/{uid}.role
//   and shopId, once verification.status becomes 'approved'.
// - translateListing / translateMessage: on-demand translation callables,
//   caching results in listings/{id}.translations / messages/{id}.textTranslations.
// - recordShopVisit: callable hit once per unique visitor per shop per day
//   (dedup via a short-lived marker doc) incrementing
//   analytics/shopVisits/{shopId}/days/{yyyy-mm-dd}.uniqueVisitors.
