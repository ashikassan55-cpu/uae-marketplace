"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, MapPin, Search as SearchIcon } from "lucide-react";
import { CategoryChips } from "@/components/category-chips";
import { ListingCard } from "@/components/listing-card";
import { getActiveListings } from "@/lib/data/listings";
import type { Listing } from "@/lib/types";

export default function HomePage() {
  const [listings, setListings] = useState<Listing[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getActiveListings().then((r) => {
      if (!cancelled) setListings(r);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 pb-4">
      <header className="flex items-center gap-3 px-4 pt-4">
        <div className="flex flex-1 items-center gap-1.5 text-sm text-om-text-secondary">
          <MapPin size={15} />
          <span>Dubai, UAE</span>
        </div>
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-om-bg-hover"
        >
          <Bell size={20} />
        </Link>
      </header>

      <div className="px-4">
        <Link
          href="/search"
          className="flex items-center gap-2 rounded-full border border-om-border-default bg-om-bg-surface px-4 py-3 text-sm text-om-text-tertiary shadow-om-xs"
        >
          <SearchIcon size={17} />
          Try &ldquo;sofa under 600 AED in Sharjah&rdquo;
        </Link>
      </div>

      <CategoryChips />

      <section className="flex flex-col gap-2 px-4">
        <h2 className="text-sm font-semibold text-om-text-primary">Near you</h2>
        {listings === null ? (
          <p className="py-8 text-center text-sm text-om-text-tertiary">Loading…</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
