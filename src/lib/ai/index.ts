import "server-only";
import { geminiRanker } from "./gemini-ranker";
import type { SearchRanker } from "./types";

export type { RankCandidate, RankedResult, SearchRanker } from "./types";

/**
 * The one line to change when switching AI providers (e.g. Gemini free
 * tier -> Claude Haiku once funded). Write a claude-ranker.ts implementing
 * SearchRanker the same way gemini-ranker.ts does, then swap the import
 * and this assignment — nothing outside this file needs to know.
 */
export const searchRanker: SearchRanker = geminiRanker;
