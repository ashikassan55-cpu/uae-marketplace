"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";

export function SearchBox({ onOpenFilters }: { onOpenFilters: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set("q", value.trim());
    else params.delete("q");
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-2 px-4">
      <div className="flex flex-1 items-center gap-2 rounded-full border border-om-border-default bg-om-bg-surface px-4 py-2.5">
        <SearchIcon size={17} className="text-om-text-tertiary" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Sofa under 600 AED in Sharjah..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-om-text-tertiary"
        />
      </div>
      <button
        type="button"
        onClick={onOpenFilters}
        aria-label="Filters"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-om-border-default bg-om-bg-surface"
      >
        <SlidersHorizontal size={17} />
      </button>
    </form>
  );
}
