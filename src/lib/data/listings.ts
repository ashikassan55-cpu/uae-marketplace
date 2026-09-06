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
import type { Category, Condition, Emirate, Listing } from "@/lib/types";

export interface SearchFilters {
  category?: Category;
  emirate?: Emirate;
  minPrice?: number;
  maxPrice?: number;
  condition?: Condition;
  verifiedShopsOnly?: boolean;
}

/**
 * Keyword prefilter + rank. This is the "normal DB query first" half of the
 * project's cost-control rule — only the results this returns should ever
 * be handed to a Haiku ranking/explanation call, never the whole table.
 *
 * Today this is a simple keyword/field match so the app is fully usable
 * without any AI wiring yet. Swap the ranking step for an embeddings
 * similarity search + Haiku re-rank once ANTHROPIC_API_KEY is configured
 * (see /api/search/route.ts).
 */
export async function searchListings(
  rawQuery: string,
  filters: SearchFilters = {},
): Promise<Listing[]> {
  const pool = await getActiveListings();
  const q = rawQuery.trim().toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);

  return pool
    .filter((listing) => {
      if (filters.category && listing.category !== filters.category) return false;
      if (filters.emirate && listing.emirate !== filters.emirate) return false;
      if (filters.condition && listing.condition !== filters.condition) return false;
      if (filters.minPrice != null && listing.price < filters.minPrice) return false;
      if (filters.maxPrice != null && listing.price > filters.maxPrice) return false;
      if (filters.verifiedShopsOnly && listing.ownerType !== "shop") return false;
      return true;
    })
    .map((listing) => {
      if (!terms.length) return { listing, score: 0 };
      const haystack = [
        listing.title,
        listing.descriptionEn,
        listing.category,
        listing.subcategory ?? "",
        ...listing.searchKeywords,
      ]
        .join(" ")
        .toLowerCase();
      const score = terms.reduce(
        (acc, term) => acc + (haystack.includes(term) ? 1 : 0),
        0,
      );
      return { listing, score };
    })
    .filter((r) => !terms.length || r.score > 0)
    .sort((a, b) => {
      // Own listings first (all of these are "own" — external link-preview
      // results are merged in at the API layer, not here), then by score,
      // then newest first.
      if (b.score !== a.score) return b.score - a.score;
      return b.listing.createdAt - a.listing.createdAt;
    })
    .map((r) => r.listing);
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
