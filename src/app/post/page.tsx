"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { TopBar } from "@/components/top-bar";
import { CATEGORIES, COMING_SOON_CATEGORIES, type Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function PostCategoryPage() {
  const router = useRouter();
  const [comingSoon, setComingSoon] = useState<Category | null>(null);

  const choose = (category: Category) => {
    if (COMING_SOON_CATEGORIES.includes(category)) {
      if (category === "Real Estate") {
        // Still worth pre-collecting compliance data even while the
        // category is hidden from buyers — see post/real-estate/page.tsx.
        router.push("/post/real-estate");
        return;
      }
      setComingSoon(category);
      return;
    }
    router.push(`/post/details?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar title="What are you selling?" back="/profile" />
      <div className="grid grid-cols-2 gap-3 p-4">
        {CATEGORIES.map((category) => {
          const soon = COMING_SOON_CATEGORIES.includes(category);
          return (
            <button
              key={category}
              onClick={() => choose(category)}
              className={cn(
                "flex flex-col items-start gap-1 rounded-xl border p-4 text-left",
                soon
                  ? "border-om-border-subtle text-om-text-tertiary"
                  : "border-om-border-card bg-om-bg-surface hover:border-om-accent-primary",
              )}
            >
              <span className="text-sm font-medium">{category}</span>
              {soon ? (
                <span className="flex items-center gap-1 text-xs text-om-accent-warning">
                  <Clock size={12} /> Coming soon
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {comingSoon ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-om-bg-scrim p-6">
          <div className="max-w-xs rounded-xl bg-om-bg-surface p-5 text-center shadow-om-modal">
            <p className="mb-2 text-sm font-semibold">{comingSoon} is coming soon</p>
            <p className="mb-4 text-sm text-om-text-secondary">
              We&rsquo;re completing legal review for this category before it goes live
              on the marketplace.
            </p>
            <button
              onClick={() => setComingSoon(null)}
              className="w-full rounded-full bg-om-accent-primary py-2.5 text-sm font-medium text-om-text-inverse"
            >
              Got it
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
