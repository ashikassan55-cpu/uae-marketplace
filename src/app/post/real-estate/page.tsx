"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { TopBar } from "@/components/top-bar";
import { useAuth } from "@/lib/auth/auth-context";
import { db, firebaseConfigured } from "@/lib/firebase/client";

export default function PostRealEstatePage() {
  const router = useRouter();
  const { firebaseUser, signInWithGoogle } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [permitType, setPermitType] = useState<"trakheesi" | "rera">("trakheesi");
  const [permitNumber, setPermitNumber] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!firebaseUser) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-8 text-center">
        <p className="text-sm text-om-text-secondary">Sign in to continue.</p>
        <button
          onClick={signInWithGoogle}
          className="rounded-full bg-om-accent-primary px-5 py-2.5 text-sm font-medium text-om-text-inverse"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  const submit = async () => {
    if (!title.trim() || !permitNumber.trim()) {
      setError("Title and permit number are required.");
      return;
    }
    if (!firebaseConfigured) {
      setError("Firebase isn't configured yet in this environment — see README.md.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await addDoc(collection(db, "listings"), {
        ownerUid: firebaseUser.uid,
        ownerType: "individual",
        category: "Real Estate",
        title: title.trim(),
        description: description.trim(),
        descriptionLang: "en",
        descriptionEn: description.trim(),
        price: Number(price) || 0,
        currency: "AED",
        condition: "good",
        emirate: "Dubai",
        images: [],
        status: "draft", // never goes live while Real Estate is behind the Coming Soon flag
        realEstate: { permitNumber: permitNumber.trim(), permitType, published: false },
        searchKeywords: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSaved(true);
    } catch (err) {
      console.error(err);
      setError("Something went wrong saving your details. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (saved) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-8 text-center">
        <p className="text-base font-semibold">Details saved</p>
        <p className="text-sm text-om-text-secondary">
          Real Estate listings aren&rsquo;t public yet — we&rsquo;ll notify you the
          moment this category launches, with your listing ready to go.
        </p>
        <button
          onClick={() => router.push("/profile")}
          className="rounded-full bg-om-accent-primary px-5 py-2.5 text-sm font-medium text-om-text-inverse"
        >
          Back to profile
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col pb-24">
      <TopBar title="Real Estate (Coming Soon)" back="/post" />
      <div className="flex flex-col gap-4 p-4">
        <div className="rounded-lg border border-om-accent-warning/30 bg-om-accent-primary-bg p-3 text-sm text-om-text-secondary">
          Real Estate listings aren&rsquo;t published on the marketplace yet — this
          collects your details and permit number now so you&rsquo;re ready the moment
          it launches. Nothing here is shown publicly.
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 2BR Apartment, Marina View"
            className="w-full rounded-lg border border-om-border-default bg-om-bg-surface px-3 py-2.5 text-sm outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-om-border-default bg-om-bg-surface px-3 py-2.5 text-sm outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Price (AED)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border border-om-border-default bg-om-bg-surface px-3 py-2.5 text-sm outline-none"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">Permit type</label>
            <select
              value={permitType}
              onChange={(e) => setPermitType(e.target.value as "trakheesi" | "rera")}
              className="w-full rounded-lg border border-om-border-default bg-om-bg-surface px-3 py-2.5 text-sm outline-none"
            >
              <option value="trakheesi">Trakheesi (Dubai)</option>
              <option value="rera">RERA (other Emirates)</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">Permit number</label>
            <input
              value={permitNumber}
              onChange={(e) => setPermitNumber(e.target.value)}
              className="w-full rounded-lg border border-om-border-default bg-om-bg-surface px-3 py-2.5 text-sm outline-none"
            />
          </div>
        </div>

        {error ? <p className="text-sm text-om-accent-error">{error}</p> : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-om-border-default bg-om-bg-surface p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <button
          onClick={submit}
          disabled={submitting}
          className="w-full rounded-full bg-om-accent-primary py-3 text-sm font-semibold text-om-text-inverse disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save details"}
        </button>
      </div>
    </div>
  );
}
