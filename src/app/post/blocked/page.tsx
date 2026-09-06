"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { TopBar } from "@/components/top-bar";

function BlockedInner() {
  const searchParams = useSearchParams();
  const reason =
    searchParams.get("reason") ??
    "This listing was flagged by our automated content check.";

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar title="Listing blocked" back="/post" />
      <div className="flex flex-1 flex-col items-center gap-4 px-8 pt-16 text-center">
        <ShieldAlert size={36} className="text-om-accent-error" />
        <p className="text-base font-semibold">We couldn&rsquo;t publish this listing</p>
        <p className="text-sm text-om-text-secondary">{reason}</p>
        <p className="text-sm text-om-text-tertiary">
          You can edit and resubmit, or contact support if you think this is a mistake.
        </p>
        <div className="mt-2 flex w-full max-w-xs flex-col gap-2">
          <Link
            href="/post"
            className="rounded-full bg-om-accent-primary py-2.5 text-sm font-semibold text-om-text-inverse"
          >
            Edit and resubmit
          </Link>
          <Link
            href="/account/appeal"
            className="rounded-full border border-om-border-default py-2.5 text-sm font-medium"
          >
            Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ListingBlockedPage() {
  return (
    <Suspense fallback={null}>
      <BlockedInner />
    </Suspense>
  );
}
