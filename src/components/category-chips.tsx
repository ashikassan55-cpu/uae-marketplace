"use client";

import Link from "next/link";
import { CATEGORIES, COMING_SOON_CATEGORIES } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryChips({ activeCategory }: { activeCategory?: string }) {
  return (
    <div className="om-scrollbar flex gap-2 overflow-x-auto px-4 pb-1">
      {CATEGORIES.map((category) => {
        const comingSoon = COMING_SOON_CATEGORIES.includes(category);
        const chip = (
          <span
            className={cn(
              "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm",
              comingSoon
                ? "cursor-not-allowed border-om-border-subtle text-om-text-disabled"
                : activeCategory === category
                  ? "border-om-accent-primary bg-om-accent-primary-bg text-om-accent-primary"
                  : "border-om-border-default text-om-text-secondary hover:bg-om-bg-hover",
            )}
          >
            {category}
            {comingSoon ? " · Soon" : ""}
          </span>
        );
        if (comingSoon) {
          return <span key={category}>{chip}</span>;
        }
        return (
          <Link key={category} href={`/search?category=${encodeURIComponent(category)}`}>
            {chip}
          </Link>
        );
      })}
    </div>
  );
}
