"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { TopBar } from "@/components/top-bar";
import { useAuth } from "@/lib/auth/auth-context";
import { db, firebaseConfigured } from "@/lib/firebase/client";

export default function MarkAsSoldPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: listingId } = use(params);
  const { firebaseUser } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    if (!firebaseUser) return;
    if (!firebaseConfigured) {
      setError("Firebase isn't configured yet in this environment — see README.md.");
      return;
    }
    setSubmitting(true);
    try {
      await updateDoc(doc(db, "listings", listingId), {
        status: "sold",
        soldAt: serverTimestamp(),
      });
      await addDoc(collection(db, "transactions"), {
        listingId,
        sellerUid: firebaseUser.uid,
        markedSoldBy: firebaseUser.uid,
        markedSoldAt: serverTimestamp(),
        status: "sold_unconfirmed",
      });
      router.push(`/listing/${listingId}`);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar title="Mark as sold" back={`/listing/${listingId}`} />
      <div className="flex flex-col gap-4 p-6">
        <p className="text-sm text-om-text-secondary">
          Once you mark this as sold, it moves out of active search results. If the
          buyer confirms the transaction, they&rsquo;ll be able to leave you a review.
        </p>
        {error ? <p className="text-sm text-om-accent-error">{error}</p> : null}
        <button
          onClick={confirm}
          disabled={submitting}
          className="rounded-full bg-om-accent-primary py-3 text-sm font-semibold text-om-text-inverse disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Confirm sold"}
        </button>
      </div>
    </div>
  );
}
