"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { CATEGORIES } from "@/lib/types";
import type { SearchFilters } from "@/lib/data/listings";
import { cn } from "@/lib/utils";

const EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
] as const;

export function FiltersSheet({
  open,
  initial,
  onClose,
  onApply,
}: {
  open: boolean;
  initial: SearchFilters;
  onClose: () => void;
  onApply: (filters: SearchFilters) => void;
}) {
  const [draft, setDraft] = useState<SearchFilters>(initial);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-om-bg-scrim" onClick={onClose}>
      <div
        className="w-full rounded-t-2xl bg-om-bg-surface p-5 shadow-om-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Filters</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1 hover:bg-om-bg-hover">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <p className="mb-2 text-sm font-medium">Emirate</p>
            <div className="flex flex-wrap gap-2">
              {EMIRATES.map((emirate) => (
                <button
                  key={emirate}
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      emirate: d.emirate === emirate ? undefined : emirate,
                    }))
                  }
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm",
                    draft.emirate === emirate
                      ? "border-om-accent-primary bg-om-accent-primary-bg text-om-accent-primary"
                      : "border-om-border-default text-om-text-secondary",
                  )}
                >
                  {emirate}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Price range (AED)</p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="Min"
                value={draft.minPrice ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    minPrice: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                className="w-full rounded-lg border border-om-border-default bg-om-bg-app px-3 py-2 text-sm outline-none"
              />
              <span className="text-om-text-tertiary">–</span>
              <input
                type="number"
                placeholder="Max"
                value={draft.maxPrice ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    maxPrice: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                className="w-full rounded-lg border border-om-border-default bg-om-bg-app px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Category</p>
            <select
              value={draft.category ?? ""}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  category: (e.target.value || undefined) as SearchFilters["category"],
                }))
              }
              className="w-full rounded-lg border border-om-border-default bg-om-bg-app px-3 py-2 text-sm outline-none"
            >
              <option value="">Any category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center justify-between text-sm font-medium">
            Verified Shops only
            <input
              type="checkbox"
              checked={Boolean(draft.verifiedShopsOnly)}
              onChange={(e) =>
                setDraft((d) => ({ ...d, verifiedShopsOnly: e.target.checked }))
              }
              className="h-5 w-5 accent-[var(--om-accent-primary)]"
            />
          </label>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setDraft({});
                onApply({});
              }}
              className="flex-1 rounded-full border border-om-border-default py-2.5 text-sm font-medium"
            >
              Clear all
            </button>
            <button
              onClick={() => onApply(draft)}
              className="flex-1 rounded-full bg-om-accent-primary py-2.5 text-sm font-medium text-om-text-inverse"
            >
              Show results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
