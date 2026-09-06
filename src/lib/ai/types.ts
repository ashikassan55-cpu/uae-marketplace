/**
 * Provider-agnostic AI search-ranking contract.
 *
 * Every page in the app talks to `rank()` through src/lib/ai/index.ts and
 * never imports a specific provider directly. To switch providers later
 * (e.g. Gemini free tier during the investor demo -> Claude Haiku once
 * funded), write a new file implementing SearchRanker and change the one
 * export in index.ts — nothing else in the app needs to change.
 */

export interface RankCandidate {
  id: string;
  title: string;
  descriptionEn: string;
  category: string;
  subcategory?: string;
  price: number;
  condition: string;
  emirate: string;
  area?: string;
  ownerType: "individual" | "shop";
}

export interface RankedResult {
  /** Must be one of the ids passed in `candidates` — never invent new ids. */
  listingId: string;
  /** One short sentence, in the same language as the query, on why this fits. */
  reason: string;
}

export interface SearchRanker {
  /** Human-readable id, surfaced in API responses for debugging (e.g. "gemini-2.5-flash"). */
  readonly providerId: string;

  /**
   * Re-rank and explain a small candidate pool (already keyword-filtered —
   * never hand this the full listings table, see keyword-rank.ts).
   * Returns [] on any failure; callers should fall back to the plain
   * keyword order rather than surface an AI error to the user.
   */
  rank(query: string, candidates: RankCandidate[]): Promise<RankedResult[]>;
}
