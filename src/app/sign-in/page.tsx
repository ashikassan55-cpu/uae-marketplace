"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@/lib/auth/auth-context";

function SignInInner() {
  const { firebaseUser, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  useEffect(() => {
    if (!loading && firebaseUser) router.replace(next);
  }, [loading, firebaseUser, next, router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-8 text-center">
      <div>
        <h1 className="text-2xl font-semibold">UAE Marketplace</h1>
        <p className="mt-2 text-sm text-om-text-secondary">
          Search secondhand items across the UAE in plain language — the AI concierge
          finds and explains what fits.
        </p>
      </div>
      <button
        onClick={async () => {
          await signInWithGoogle();
          router.replace(next);
        }}
        className="flex items-center gap-2 rounded-full bg-om-accent-black px-6 py-3 text-sm font-medium text-om-text-inverse"
      >
        Continue with Google
      </button>
      <p className="max-w-xs text-xs text-om-text-tertiary">
        By continuing, you agree this account may be automatically suspended if our
        systems detect spam or fraud, with a right to appeal.
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInInner />
    </Suspense>
  );
}
