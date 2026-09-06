import "server-only";
import { GoogleGenAI } from "@google/genai";
import type { RankCandidate, RankedResult, SearchRanker } from "./types";

/**
 * Gemini-backed implementation of SearchRanker — used for the free-tier
 * investor demo (see GEMINI_API_KEY in .env.local.example). Swap this file
 * out for a Claude implementation later; src/lib/ai/index.ts is the only
 * place that needs to change.
 */

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        properties: {
          listingId: { type: "string" },
          reason: { type: "string" },
        },
        required: ["listingId", "reason"],
      },
    },
  },
  required: ["results"],
} as const;

function buildPrompt(query: string, candidates: RankCandidate[]): string {
  const candidateLines = candidates
    .map((c) =>
      JSON.stringify({
        id: c.id,
        title: c.title,
        description: c.descriptionEn.slice(0, 300),
        category: c.category,
        subcategory: c.subcategory,
        price: c.price,
        condition: c.condition,
        location: [c.area, c.emirate].filter(Boolean).join(", "),
        sellerType: c.ownerType,
      }),
    )
    .join("\n");

  return `You are the search concierge for a secondhand marketplace in the UAE.
A buyer searched for: "${query}"
(the query may be in English, Arabic, Hindi, Urdu, Malayalam, or a mix — understand it
regardless of language, and match by meaning/synonym, not just exact words: e.g. "sofa",
"couch" and "settee" should all match a listing described as any of those.)

Here are the candidate listings, one JSON object per line, already filtered from the
full catalogue (do not consider anything not listed here, and never invent a listing
id that isn't in this list):
${candidateLines}

Pick only the listings that genuinely fit the buyer's query (it's fine to return fewer
than all of them, and fine to return none if nothing really fits). Order them best
match first. For each one, write ONE short sentence — in the same language the buyer
searched in — explaining specifically why it fits (mention price, condition, or location
when that's part of why). Do not use generic filler like "great option" with no reason.`;
}

async function rank(query: string, candidates: RankCandidate[]): Promise<RankedResult[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !candidates.length) return [];

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: buildPrompt(query, candidates),
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) return [];

    const parsed = JSON.parse(text) as { results?: RankedResult[] };
    const validIds = new Set(candidates.map((c) => c.id));
    return (parsed.results ?? []).filter((r) => validIds.has(r.listingId));
  } catch (err) {
    console.error("Gemini search ranking failed, caller should fall back to keyword order", err);
    return [];
  }
}

export const geminiRanker: SearchRanker = {
  providerId: MODEL,
  rank,
};
