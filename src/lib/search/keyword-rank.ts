import type { Category, Condition, Emirate, Listing } from "@/lib/types";

/**
 * Pure, Firebase-free ranking logic — shared by the client-side
 * `searchListings` (src/lib/data/listings.ts, uses the client SDK) and the
 * server-side `/api/search` route handler (uses the Admin SDK). Keeping this
 * free of any Firestore import is what makes it safe to call from both a
 * "use client" module and a Route Handler without hitting the client-SDK
 * server-import trap documented in README.md.
 */

export interface SearchFilters {
  category?: Category;
  emirate?: Emirate;
  minPrice?: number;
  maxPrice?: number;
  condition?: Condition;
  verifiedShopsOnly?: boolean;
}

export interface ScoredListing {
  listing: Listing;
  score: number;
}

export function filterAndScoreListings(
  pool: Listing[],
  rawQuery: string,
  filters: SearchFilters = {},
): ScoredListing[] {
  const q = rawQuery.trim().toLowerCase();
  const rawTerms = q.split(/\s+/).filter(Boolean);
  // Drop single-character tokens from scoring — e.g. a stray space typed
  // inside "iPhone" ("i phone") otherwise leaves a bare "i" term, which is a
  // substring of almost every listing ("Mountain", "Fabric", ...) and used to
  // drag unrelated results into every search. Still fall back to the raw
  // terms if that's literally all the user typed, so a single-letter search
  // isn't silently turned into a zero-term (match-everything) search.
  const meaningfulTerms = rawTerms.filter((t) => t.length > 1);
  const terms = meaningfulTerms.length ? meaningfulTerms : rawTerms;

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
    });
}
