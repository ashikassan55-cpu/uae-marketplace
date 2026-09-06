"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { TopBar } from "@/components/top-bar";
import { SaveButton } from "@/components/save-button";
import { getListing } from "@/lib/data/listings";
import { formatAed, timeAgo } from "@/lib/utils";
import type { Listing } from "@/lib/types";

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [listing, setListing] = useState<Listing | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    getListing(id).then((l) => {
      if (!cancelled) setListing(l ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (listing === undefined) {
    return (
      <div className="flex min-h-dvh flex-col">
        <TopBar title="Loading…" back="/search" />
      </div>
    );
  }

  if (listing === null) {
    return (
      <div className="flex min-h-dvh flex-col">
        <TopBar title="Not found" back="/search" />
        <p className="p-6 text-center text-sm text-om-text-secondary">
          This listing isn&rsquo;t available anymore.
        </p>
      </div>
    );
  }

  const isShop = listing.ownerType === "shop";

  return (
    <div className="flex min-h-dvh flex-col pb-24">
      <TopBar title={listing.category} back="/search" />

      <div className="relative aspect-square w-full bg-om-bg-muted">
        {listing.images[0] ? (
          <Image
            src={listing.images[0]}
            alt={listing.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : null}
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xl font-semibold">{formatAed(listing.price)}</p>
            <h1 className="text-base font-medium text-om-text-prose">{listing.title}</h1>
          </div>
          <SaveButton listingId={listing.id} shopId={listing.shopId ?? null} />
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-om-text-tertiary">
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {listing.area ? `${listing.area}, ` : ""}
            {listing.emirate}
          </span>
          <span>·</span>
          <span className="capitalize">{listing.condition.replace("_", " ")}</span>
          <span>·</span>
          <span>{timeAgo(listing.createdAt)}</span>
        </div>

        {isShop ? (
          <div className="flex items-center gap-2 rounded-lg border border-om-border-card bg-om-bg-panel p-3">
            <BadgeCheck size={20} className="shrink-0 text-om-accent-verifier" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">Sold by a Verified Shop</p>
              <p className="text-xs text-om-text-tertiary">
                License and Emirates ID checked by our team.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-om-border-subtle bg-om-bg-panel p-3">
            <ShieldCheck size={20} className="shrink-0 text-om-text-tertiary" />
            <p className="text-sm text-om-text-secondary">
              Individual seller — chat in-app before you meet, and never wire money
              upfront.
            </p>
          </div>
        )}

        <div>
          <h2 className="mb-1 text-sm font-semibold">Description</h2>
          <p className="whitespace-pre-line text-sm text-om-text-prose">
            {listing.descriptionEn || listing.description}
          </p>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-3 border-t border-om-border-default bg-om-bg-surface p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        {isShop ? (
          <Link
            href={`/cart/${listing.shopId}?add=${listing.id}`}
            className="flex-1 rounded-full bg-om-accent-primary py-3 text-center text-sm font-semibold text-om-text-inverse"
          >
            Add to Cart
          </Link>
        ) : (
          <Link
            href={`/chats/new?listingId=${listing.id}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-om-accent-primary py-3 text-center text-sm font-semibold text-om-text-inverse"
          >
            <MessageCircle size={17} /> Chat with seller
          </Link>
        )}
      </div>
    </div>
  );
}
