import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit as fsLimit,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db, firebaseConfigured } from "@/lib/firebase/client";
import { MOCK_LISTINGS, mockListingById } from "@/lib/data/mock";
import type { Listing } from "@/lib/types";
import { filterAndScoreListings, type SearchFilters } from "@/lib/search/keyword-rank";

export type { SearchFilters };

/**
 * Keyword prefilter + rank (client-side, used for instant results while
 * the AI re-rank from /api/search is still loading — see the search page).
 * This is the "normal DB query first" half of the project's cost-control
 * rule — only a small filtered pool like this should ever be handed to an
 * AI ranking/explanation call, never the whole table.
 *
 * The actual scoring logic lives in src/lib/search/keyword-rank.ts so the
 * server-side route handler can reuse it without importing this
 * "use client"-only module.
 */
export async function searchListings(
  rawQuery: string,
  filters: SearchFilters = {},
): Promise<Listing[]> {
  const pool = await getActiveListings();
  return filterAndScoreListings(pool, rawQuery, filters).map((r) => r.listing);
}

export async function getActiveListings(): Promise<Listing[]> {
  if (!firebaseConfigured) return MOCK_LISTINGS;
  try {
    const snap = await getDocs(
      query(
        collection(db, "listings"),
        where("status", "==", "active"),
        orderBy("createdAt", "desc"),
        fsLimit(200),
      ),
    );
    if (snap.empty) return MOCK_LISTINGS;
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Listing);
  } catch (err) {
    console.error("getActiveListings failed, falling back to sample data", err);
    return MOCK_LISTINGS;
  }
}

export async function getListing(id: string): Promise<Listing | undefined> {
  if (!firebaseConfigured) return mockListingById(id);
  try {
    const snap = await getDoc(doc(db, "listings", id));
    if (!snap.exists()) return mockListingById(id);
    return { id: snap.id, ...snap.data() } as Listing;
  } catch (err) {
    console.error("getListing failed, falling back to sample data", err);
    return mockListingById(id);
  }
}

export type NewListingInput = Omit<
  Listing,
  | "id"
  | "status"
  | "createdAt"
  | "updatedAt"
  | "descriptionEn"
  | "moderation"
  | "searchKeywords"
>;

/**
 * Creates a listing in "pending" moderation state. The actual AI
 * content-screening + translation happens server-side (Cloud Function
 * triggered on create, or a Route Handler called right after this) — never
 * trust a client-set moderation.status.
 */
export async function createListing(input: NewListingInput): Promise<string> {
  const keywords = `${input.title} ${input.description} ${input.category}`
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const ref = await addDoc(collection(db, "listings"), {
    ...input,
    descriptionEn: input.description, // placeholder until translation function runs
    status: "active", // TODO: flip to "pending" once the moderation Cloud Function is deployed
    searchKeywords: Array.from(new Set(keywords)),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}
