"use client";

import Link from "next/link";
import { CircleUserRound } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Desktop-only top nav bar, ported from the Desktop.dc.html / Tablet.dc.html
 * mockups. Mobile keeps the bottom tab bar (BottomNav) instead, per the
 * approved Main.dc.html / SearchResults.dc.html mockups, which show no top
 * bar at all on the phone-width screens.
 *
 * The mockups' logo reads "souq.ae" — that's the name of a real, still
 * recognizable regional marketplace brand, so it isn't used here. This
 * renders a neutral placeholder wordmark instead; swap `BRAND_NAME` once a
 * real brand/domain is picked.
 */
const BRAND_NAME = "marketplace";
const BRAND_TLD = ".ae";

export function SiteHeader() {
  return (
    <header className="hidden items-center gap-10 border-b border-om-border-default bg-om-bg-surface px-12 py-4 md:flex">
      <Link
        href="/"
        className="text-xl font-extrabold tracking-tight text-om-text-primary"
      >
        {BRAND_NAME}
        <span className="text-om-accent-primary">{BRAND_TLD}</span>
      </Link>

      <nav className="flex items-center gap-7 text-sm font-semibold text-om-text-secondary">
        <Link href="/#near-you" className="hover:text-om-text-primary">
          Categories
        </Link>
        <Link href="/how-it-works" className="hover:text-om-text-primary">
          How it works
        </Link>
        <Link href="/shop/apply" className="hover:text-om-text-primary">
          Verified Shops
        </Link>
      </nav>

      <div className="flex-1" />

      <ThemeToggle />

      <Link
        href="/post"
        className="whitespace-nowrap rounded-[10px] bg-om-accent-primary px-5 py-2.5 text-sm font-bold text-om-text-inverse hover:bg-om-accent-primary-hover"
      >
        + Post an ad
      </Link>

      <Link
        href="/profile"
        aria-label="Profile"
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-om-bg-muted text-om-text-secondary hover:bg-om-bg-hover"
      >
        <CircleUserRound size={19} />
      </Link>
    </header>
  );
}
