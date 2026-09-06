"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Bell,
  ChevronRight,
  ListChecks,
  LogOut,
  MapPin,
  ShieldAlert,
  Store,
} from "lucide-react";
import { TopBar } from "@/components/top-bar";
import { useAuth } from "@/lib/auth/auth-context";

function Row({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof ListChecks;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 border-b border-om-border-subtle px-4 py-3.5"
    >
      <Icon size={19} className="text-om-text-secondary" />
      <span className="flex-1 text-sm">{label}</span>
      <ChevronRight size={17} className="text-om-text-disabled" />
    </Link>
  );
}

export default function ProfilePage() {
  const { firebaseUser, appUser, loading, signInWithGoogle, signOut } = useAuth();

  if (loading) return <div className="min-h-dvh" />;

  if (!firebaseUser) {
    return (
      <div className="flex min-h-dvh flex-col">
        <TopBar title="Profile" />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <p className="text-sm text-om-text-secondary">
            Sign in to post listings, save items, and chat with sellers.
          </p>
          <button
            onClick={signInWithGoogle}
            className="rounded-full bg-om-accent-primary px-5 py-2.5 text-sm font-medium text-om-text-inverse"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar title="Profile" right="notifications" />

      <div className="flex items-center gap-3 px-4 py-4">
        {firebaseUser.photoURL ? (
          <Image
            src={firebaseUser.photoURL}
            alt=""
            width={56}
            height={56}
            className="rounded-full"
          />
        ) : (
          <div className="h-14 w-14 rounded-full bg-om-bg-muted" />
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold">{firebaseUser.displayName}</p>
          <p className="truncate text-sm text-om-text-tertiary">{firebaseUser.email}</p>
          {appUser?.preferredArea ? (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-om-text-tertiary">
              <MapPin size={12} /> {appUser.preferredArea.emirate}
            </p>
          ) : null}
        </div>
      </div>

      {!appUser?.shopId ? (
        <Link
          href="/shop/apply"
          className="mx-4 mb-2 flex items-center gap-3 rounded-xl border border-om-accent-verifier/30 bg-om-accent-primary-bg p-4"
        >
          <Store size={22} className="text-om-accent-verifier" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Become a Verified Shop</p>
            <p className="text-xs text-om-text-secondary">
              Unlimited listings, your own shop page, and a cart for buyers.
            </p>
          </div>
          <ChevronRight size={17} className="text-om-text-disabled" />
        </Link>
      ) : (
        <Link
          href="/shop/dashboard"
          className="mx-4 mb-2 flex items-center gap-3 rounded-xl border border-om-border-card bg-om-bg-surface p-4"
        >
          <BadgeCheck size={22} className="text-om-accent-verifier" />
          <span className="flex-1 text-sm font-semibold">Shop dashboard</span>
          <ChevronRight size={17} className="text-om-text-disabled" />
        </Link>
      )}

      <div className="mt-2">
        <Row href="/post" icon={ListChecks} label="Post a listing" />
        <Row href="/profile/listings" icon={ListChecks} label="My listings" />
        <Row href="/saved" icon={ListChecks} label="Saved" />
        <Row href="/notifications" icon={Bell} label="Notifications" />
        <Row href="/account/appeal" icon={ShieldAlert} label="Account & appeals" />
      </div>

      <button
        onClick={signOut}
        className="mx-4 mt-4 flex items-center justify-center gap-2 rounded-full border border-om-border-default py-2.5 text-sm font-medium text-om-text-secondary"
      >
        <LogOut size={16} /> Sign out
      </button>
    </div>
  );
}
