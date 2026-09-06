"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { TopBar } from "@/components/top-bar";
import { ListingCard } from "@/components/listing-card";
import { useAuth } from "@/lib/auth/auth-context";
import { db, firebaseConfigured } from "@/lib/firebase/client";
import type { Listing } from "@/lib/types";

export default function MyListingsPage() {
  const { firebaseUser } = useAuth();
  const [listings, setListings] = useState<Listing[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!firebaseUser || !firebaseConfigured) {
        setListings([]);
        return;
      }
      const snap = await getDocs(
        query(
          collection(db, "listings"),
          where("ownerUid", "==", firebaseUser.uid),
          orderBy("createdAt", "desc"),
        ),
      );
      if (!cancelled) {
        setListings(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Listing));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [firebaseUser]);

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar title="My listings" back="/profile" />
      {listings === null ? (
        <p className="p-6 text-center text-sm text-om-text-tertiary">Loading…</p>
      ) : listings.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <p className="text-sm text-om-text-secondary">You haven&rsquo;t posted anything yet.</p>
          <Link
            href="/post"
            className="rounded-full bg-om-accent-primary px-5 py-2.5 text-sm font-medium text-om-text-inverse"
          >
            Post a listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
