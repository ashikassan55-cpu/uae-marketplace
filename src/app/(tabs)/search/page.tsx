"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { TopBar } from "@/components/top-bar";
import { ListingCard } from "@/components/listing-card";
import { searchListings, type SearchFilters } from "@/lib/data/listings";
import type { Listing } from "@/lib/types";
import { SearchBox } from "./search-box";
import { FiltersSheet } from "./filters-sheet";

function SearchInner() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? undefined;

  const [filters, setFilters] = useState<SearchFilters>({
    category: category as SearchFilters["category"],
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [results, setResults] = useState<Listing[] | null>(null);

  const effectiveFilters = useMemo(
    () => ({ ...filters, category: (category as SearchFilters["category"]) ?? filters.category }),
    [filters, category],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setResults(null);
      const r = await searchListings(q, effectiveFilters);
      if (!cancelled) setResults(r);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, JSON.stringify(effectiveFilters)]);

  return (
    <div className="flex min-h-dvh flex-col gap-4 pb-4">
      <TopBar title="Search" />
      <SearchBox onOpenFilters={() => setFiltersOpen(true)} />

      {results === null ? (
        <p className="px-4 text-sm text-om-text-tertiary">Searching…</p>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-8 py-16 text-center">
          <SearchIcon size={32} className="text-om-text-disabled" />
          <p className="text-sm font-medium">No matches yet for &ldquo;{q}&rdquo;</p>
          <p className="text-sm text-om-text-tertiary">
            Would you like me to look for similar options, or tell me more about what
            you&rsquo;re looking for — purpose, budget, other details?
          </p>
        </div>
      ) : (
        <>
          <p className="px-4 text-xs text-om-text-tertiary">
            {results.length} result{results.length === 1 ? "" : "s"}
            {q ? ` for "${q}"` : ""} · own listings shown first
          </p>
          <div className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-3 md:grid-cols-4">
            {results.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          <div className="mx-4 mt-2 rounded-lg border border-om-border-subtle bg-om-bg-panel p-3 text-sm text-om-text-secondary">
            Not quite right? Tell me more — purpose, budget, or exact model — and
            I&rsquo;ll refine the shortlist.
          </div>
        </>
      )}

      <FiltersSheet
        open={filtersOpen}
        initial={filters}
        onClose={() => setFiltersOpen(false)}
        onApply={(next) => {
          setFilters(next);
          setFiltersOpen(false);
        }}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchInner />
    </Suspense>
  );
}
