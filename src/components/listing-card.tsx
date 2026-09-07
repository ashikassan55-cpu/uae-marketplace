import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Sparkles } from "lucide-react";
import type { Listing } from "@/lib/types";
import { formatAed, timeAgo } from "@/lib/utils";

export function ListingCard({
  listing,
  reason,
}: {
  listing: Listing;
  /** Optional AI-generated "why this fits" sentence, shown from search results. */
  reason?: string;
}) {
  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-om-border-card bg-om-bg-surface shadow-om-xs transition hover:shadow-om-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-om-bg-muted">
        {listing.images[0] ? (
          <Image
            src={listing.images[0]}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 50vw, 220px"
            className="object-cover transition group-hover:scale-[1.03]"
          />
        ) : null}
        {listing.ownerType === "shop" ? (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-om-bg-surface/90 px-2 py-0.5 text-[11px] font-medium text-om-accent-verifier">
            <BadgeCheck size={13} /> Verified Shop
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 p-2.5">
        <span className="text-sm font-semibold">{formatAed(listing.price)}</span>
        <span className="line-clamp-2 text-sm text-om-text-prose">{listing.title}</span>
        <span className="mt-1 text-xs text-om-text-tertiary">
          {listing.area ? `${listing.area}, ` : ""}
          {listing.emirate} · {timeAgo(listing.createdAt)}
        </span>
        {reason ? (
          <span className="mt-1.5 flex items-start gap-1.5 rounded-[10px] bg-om-accent-primary-bg px-2 py-1.5">
            <Sparkles size={12} className="mt-0.5 flex-shrink-0 text-om-accent-primary" />
            <span className="line-clamp-2 text-xs leading-snug text-om-accent-primary-hover">
              {reason}
            </span>
          </span>
        ) : null}
      </div>
    </Link>
  );
}
