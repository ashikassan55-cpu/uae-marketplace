import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminConfigured } from "@/lib/firebase/admin";
import { MOCK_LISTINGS } from "@/lib/data/mock";
import { filterAndScoreListings, type SearchFilters } from "@/lib/search/keyword-rank";
import { searchRanker } from "@/lib/ai";
import type { Listing } from "@/lib/types";

// How many keyword-filtered candidates we ever hand to the AI. Keeps the
// prompt small and cheap — never send the whole table (see keyword-rank.ts).
const MAX_AI_CANDIDATES = 20;

async function getActiveListingsServer(): Promise<Listing[]> {
  if (!adminConfigured || !adminDb) return MOCK_LISTINGS;
  try {
    const snap = await adminDb
      .collection("listings")
      .where("status", "==", "active")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();
    if (snap.empty) return MOCK_LISTINGS;
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Listing);
  } catch (err) {
    console.error("getActiveListingsServer failed, falling back to sample data", err);
    return MOCK_LISTINGS;
  }
}

export async function POST(req: NextRequest) {
  let body: { q?: string; filters?: SearchFilters };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const q = (body.q ?? "").trim();
  const filters = body.filters ?? {};

  const pool = await getActiveListingsServer();
  const scored = filterAndScoreListings(pool, q, filters);
  const candidatePool = scored.slice(0, MAX_AI_CANDIDATES).map((s) => s.listing);

  let aiUsed = false;
  let reasonsByListingId = new Map<string, string>();
  let orderedIds: string[] = candidatePool.map((l) => l.id);

  if (q && candidatePool.length && process.env.GEMINI_API_KEY) {
    const ranked = await searchRanker.rank(
      q,
      candidatePool.map((l) => ({
        id: l.id,
        title: l.title,
        descriptionEn: l.descriptionEn,
        category: l.category,
        subcategory: l.subcategory,
        price: l.price,
        condition: l.condition,
        emirate: l.emirate,
        area: l.area,
        ownerType: l.ownerType,
      })),
    );

    if (ranked.length) {
      aiUsed = true;
      orderedIds = ranked.map((r) => r.listingId);
      reasonsByListingId = new Map(ranked.map((r) => [r.listingId, r.reason]));
    }
  }

  const byId = new Map(candidatePool.map((l) => [l.id, l]));
  // Everything past MAX_AI_CANDIDATES (already keyword-scored) is appended
  // after the AI-ranked/explained set, so a thin AI response never hides
  // otherwise-matching results.
  const remainder = scored.slice(MAX_AI_CANDIDATES).map((s) => s.listing);

  const results = [
    ...orderedIds.map((id) => byId.get(id)).filter((l): l is Listing => Boolean(l)),
    ...remainder,
  ];

  return NextResponse.json({
    results: results.map((listing) => ({
      listing,
      reason: reasonsByListingId.get(listing.id) ?? null,
    })),
    aiUsed,
    provider: aiUsed ? searchRanker.providerId : null,
  });
}
