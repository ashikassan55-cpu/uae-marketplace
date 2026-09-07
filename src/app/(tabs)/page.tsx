"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUp, Bell, MapPin, Search as SearchIcon } from "lucide-react";
import { CategoryChips } from "@/components/category-chips";
import { ListingCard } from "@/components/listing-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { getActiveListings } from "@/lib/data/listings";
import type { Listing } from "@/lib/types";

const HERO_SLIDES = [
  {
    className: "om-hero-slide-1 from-om-accent-primary to-sky-900",
    heading: "Chat safely, in your language — real-time translation built in",
  },
  {
    className: "om-hero-slide-2 from-orange-500 to-red-700",
    heading: "List it in 2 minutes. Sell it today.",
  },
  {
    className: "om-hero-slide-3 from-emerald-600 to-teal-800",
    heading: "Become a Verified Shop — unlock unlimited listings",
  },
];

const TICKER_TEXT =
  "Find pre-loved items you can trust  ·  Discover treasures your neighbours are letting go  ·  ";

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
    <div className="flex flex-col gap-4 pb-4 md:gap-0 md:pb-0">
      {/* Mobile header — desktop uses SiteHeader (tabs layout) instead */}
      <header className="flex items-center gap-3 px-4 pt-4 md:hidden">
        <div className="flex flex-1 items-center gap-1.5 text-sm text-om-text-secondary">
          <MapPin size={15} />
          <span>Dubai, UAE</span>
        </div>
        <ThemeToggle />
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-om-bg-hover"
        >
          <Bell size={20} />
        </Link>
      </header>

      <div className="px-4 md:hidden">
        <Link
          href="/search"
          className="flex items-center gap-2 rounded-full border border-om-border-default bg-om-bg-surface px-4 py-3 text-sm text-om-text-tertiary shadow-om-xs"
        >
          <SearchIcon size={17} />
          Try &ldquo;sofa under 600 AED in Sharjah&rdquo;
        </Link>
      </div>

      {/* Desktop-only: search bar, hero carousel, ticker — ported from
          Desktop.dc.html / Tablet.dc.html */}
      <div className="hidden md:block md:px-12 md:pt-6">
        <div className="flex justify-center">
          <Link
            href="/search"
            className="flex w-full max-w-2xl items-center gap-2.5 rounded-2xl border border-om-border-default bg-om-bg-panel px-4 py-3 shadow-om-sm"
          >
            <SearchIcon size={17} className="text-om-text-tertiary" />
            <span className="flex-1 text-sm text-om-text-secondary">
              &ldquo;Sofa under 600 AED in Sharjah&rdquo;
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-om-accent-primary text-om-text-inverse">
              <ArrowUp size={15} />
            </span>
          </Link>
        </div>

        <div className="relative mt-8 h-[280px] overflow-hidden rounded-[20px] lg:h-[340px]">
          {HERO_SLIDES.map((slide) => (
            <div
              key={slide.heading}
              className={`absolute inset-0 flex flex-col justify-center bg-gradient-to-br px-14 ${slide.className}`}
            >
              <span className="mb-2 text-xs font-bold uppercase tracking-wider text-white/85">
                Sponsored
              </span>
              <span className="max-w-xl text-2xl font-extrabold leading-snug text-white lg:text-3xl">
                {slide.heading}
              </span>
            </div>
          ))}
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
            {HERO_SLIDES.map((slide) => (
              <span key={slide.heading} className="h-1.5 w-1.5 rounded-full bg-white/60" />
            ))}
          </div>
        </div>

        <div className="mt-4 h-10 overflow-hidden rounded-[10px] bg-om-accent-primary-bg">
          <div className="om-ticker-track flex whitespace-nowrap will-change-transform">
            <span className="px-8 py-2.5 text-sm font-semibold text-om-accent-primary-hover">
              {TICKER_TEXT}
            </span>
            <span className="px-8 py-2.5 text-sm font-semibold text-om-accent-primary-hover">
              {TICKER_TEXT}
            </span>
          </div>
        </div>
      </div>

      <div className="md:px-12">
        <div className="md:pt-6">
          <CategoryChips />
        </div>

        <section id="near-you" className="flex flex-col gap-2 px-4 pt-4 md:px-0 md:pt-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-om-text-primary md:text-xl md:font-bold">
              Near you
            </h2>
            <Link
              href="/search"
              className="text-xs font-semibold text-om-accent-primary md:text-sm"
            >
              View all →
            </Link>
          </div>
          {listings === null ? (
            <p className="py-8 text-center text-sm text-om-text-tertiary">Loading…</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-5 md:pb-14">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
