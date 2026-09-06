"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Heart } from "lucide-react";
import { TopBar } from "@/components/top-bar";
import { ListingCard } from "@/components/listing-card";
import { useAuth } from "@/lib/auth/auth-context";
import { db, firebaseConfigured } from "@/lib/firebase/client";
import { getListing } from "@/lib/data/listings";
import type { Listing } from "@/lib/types";

export default function SavedPage() {
  const { firebaseUser, loading, signInWithGoogle } = useAuth();
  const [listings, setListings] = useState<Listing[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!firebaseUser || !firebaseConfigured) {
        setListings([]);
        return;
      }
      const snap = await getDocs(
        query(collection(db, "saves"), where("uid", "==", firebaseUser.uid)),
      );
      const ids = snap.docs.map((d) => d.data().listingId as string);
      const items = (await Promise.all(ids.map(getListing))).filter(
        (l): l is Listing => Boolean(l),
      );
      if (!cancelled) setListings(items);
    })();
    return () => {
      cancelled = true;
    };
  }, [firebaseUser]);

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar title="Saved" />
      {loading ? null : !firebaseUser ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <Heart size={32} className="text-om-text-disabled" />
          <p className="text-sm text-om-text-secondary">
            Sign in to save listings and find them here later.
          </p>
          <button
            onClick={signInWithGoogle}
            className="rounded-full bg-om-accent-primary px-5 py-2.5 text-sm font-medium text-om-text-inverse"
          >
            Sign in with Google
          </button>
        </div>
      ) : listings === null ? (
        <p className="px-4 py-8 text-center text-sm text-om-text-tertiary">Loading…</p>
      ) : listings.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
          <Heart size={32} className="text-om-text-disabled" />
          <p className="text-sm font-medium">Nothing saved yet</p>
          <p className="text-sm text-om-text-tertiary">
            Tap the heart on any listing to shortlist it here — sold items stay visible,
            dimmed, so you can track what you missed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
