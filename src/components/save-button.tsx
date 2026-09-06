"use client";

import { useEffect, useState } from "react";
import { deleteDoc, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Heart } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { db, firebaseConfigured } from "@/lib/firebase/client";
import { cn } from "@/lib/utils";

export function SaveButton({
  listingId,
  shopId,
}: {
  listingId: string;
  shopId: string | null;
}) {
  const { firebaseUser, signInWithGoogle } = useAuth();
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);

  const saveRef = () => doc(db, "saves", `${firebaseUser!.uid}_${listingId}`);

  useEffect(() => {
    (async () => {
      if (!firebaseUser || !firebaseConfigured) {
        setReady(true);
        return;
      }
      try {
        const snap = await getDoc(saveRef());
        setSaved(snap.exists());
      } finally {
        setReady(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser, listingId]);

  const toggle = async () => {
    if (!firebaseUser) {
      await signInWithGoogle();
      return;
    }
    if (!firebaseConfigured) return;
    if (saved) {
      await deleteDoc(saveRef());
      setSaved(false);
    } else {
      await setDoc(saveRef(), {
        uid: firebaseUser.uid,
        listingId,
        shopId,
        savedAt: serverTimestamp(),
      });
      setSaved(true);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={!ready}
      aria-label={saved ? "Remove from saved" : "Save"}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border",
        saved
          ? "border-om-accent-primary bg-om-accent-primary-bg text-om-accent-primary"
          : "border-om-border-default text-om-text-secondary",
      )}
    >
      <Heart size={18} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
