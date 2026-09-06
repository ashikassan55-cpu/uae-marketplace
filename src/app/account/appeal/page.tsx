"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { TopBar } from "@/components/top-bar";
import { useAuth } from "@/lib/auth/auth-context";
import { db, firebaseConfigured } from "@/lib/firebase/client";

export default function SubmitAppealPage() {
  const { firebaseUser, appUser } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!firebaseUser || !message.trim()) return;
    if (!firebaseConfigured) {
      setError("Firebase isn't configured yet in this environment — see README.md.");
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "appeals"), {
        uid: firebaseUser.uid,
        suspensionReason: appUser?.suspendedReason ?? "Not specified",
        message: message.trim(),
        submittedAt: serverTimestamp(),
        status: "pending",
      });
      router.push("/account/appeal/pending");
    } catch (err) {
      console.error(err);
      setError("Something went wrong submitting your appeal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar title="Submit an appeal" back="/profile" />
      <div className="flex flex-col gap-4 p-6">
        <p className="text-sm text-om-text-secondary">
          Tell us why you think this decision was a mistake. A reviewer will read this
          and either reactivate your account or explain why the suspension stands.
        </p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder="Explain your situation…"
          className="w-full rounded-lg border border-om-border-default bg-om-bg-surface px-3 py-2.5 text-sm outline-none"
        />
        {error ? <p className="text-sm text-om-accent-error">{error}</p> : null}
        <button
          onClick={submit}
          disabled={submitting || !message.trim()}
          className="rounded-full bg-om-accent-primary py-3 text-sm font-semibold text-om-text-inverse disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit appeal"}
        </button>
      </div>
    </div>
  );
}
