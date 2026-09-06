"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/lib/auth/auth-context";
import { db, firebaseConfigured } from "@/lib/firebase/client";
import { getListing } from "@/lib/data/listings";

function NewChatInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get("listingId");
  const { firebaseUser, loading, signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !listingId) return;
    if (!firebaseUser) return; // wait for sign-in button below

    (async () => {
      if (!firebaseConfigured) {
        setError("Firebase isn't configured yet in this environment — see README.md.");
        return;
      }
      const listing = await getListing(listingId);
      if (!listing) {
        setError("This listing couldn't be found.");
        return;
      }
      if (listing.ownerUid === firebaseUser.uid) {
        setError("You can't start a chat on your own listing.");
        return;
      }
      const uids = [firebaseUser.uid, listing.ownerUid].sort();
      const chatId = `${listingId}_${uids[0]}_${uids[1]}`;
      const chatRef = doc(db, "chats", chatId);
      const snap = await getDoc(chatRef);
      if (!snap.exists()) {
        await setDoc(chatRef, {
          listingId,
          participantUids: uids,
          lastMessage: "Chat started",
          lastMessageAt: serverTimestamp(),
          unreadCount: {},
        });
      }
      router.replace(`/chats/${chatId}`);
    })();
  }, [loading, firebaseUser, listingId, router]);

  if (!listingId) {
    return <p className="p-8 text-center text-sm text-om-text-secondary">Missing listing.</p>;
  }

  if (error) {
    return <p className="p-8 text-center text-sm text-om-accent-error">{error}</p>;
  }

  if (!loading && !firebaseUser) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-8 text-center">
        <p className="text-sm text-om-text-secondary">Sign in to chat with this seller.</p>
        <button
          onClick={signInWithGoogle}
          className="rounded-full bg-om-accent-primary px-5 py-2.5 text-sm font-medium text-om-text-inverse"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return <p className="p-8 text-center text-sm text-om-text-tertiary">Opening chat…</p>;
}

export default function NewChatPage() {
  return (
    <Suspense fallback={null}>
      <NewChatInner />
    </Suspense>
  );
}
