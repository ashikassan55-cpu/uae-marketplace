import Link from "next/link";
import { BarChart3, ChevronRight, Store, Users } from "lucide-react";
import { TopBar } from "@/components/top-bar";

export default function ShopDashboardPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar title="Shop dashboard" back="/profile" />

      <div className="grid grid-cols-2 gap-3 p-4">
        <div className="rounded-xl border border-om-border-card bg-om-bg-surface p-4">
          <p className="text-xs text-om-text-tertiary">Active listings</p>
          <p className="text-xl font-semibold">0</p>
        </div>
        <div className="rounded-xl border border-om-border-card bg-om-bg-surface p-4">
          <p className="text-xs text-om-text-tertiary">Completed sales</p>
          <p className="text-xl font-semibold">0</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 px-4">
        <Link
          href="/post"
          className="rounded-full bg-om-accent-primary py-2.5 text-center text-sm font-semibold text-om-text-inverse"
        >
          Add listing
        </Link>
      </div>

      <div className="mt-4 px-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-om-text-tertiary">
          Pro tools · Free trial
        </p>
      </div>
      <Link
        href="/shop/dashboard/leads"
        className="mx-4 mb-2 flex items-center gap-3 rounded-xl border border-om-accent-pro/30 bg-om-accent-pro-bg p-4"
      >
        <Users size={20} className="text-om-accent-pro" />
        <span className="flex-1 text-sm font-medium">Interested buyers</span>
        <ChevronRight size={16} className="text-om-text-disabled" />
      </Link>
      <Link
        href="/shop/dashboard/reports"
        className="mx-4 mb-2 flex items-center gap-3 rounded-xl border border-om-accent-pro/30 bg-om-accent-pro-bg p-4"
      >
        <BarChart3 size={20} className="text-om-accent-pro" />
        <span className="flex-1 text-sm font-medium">Reports</span>
        <ChevronRight size={16} className="text-om-text-disabled" />
      </Link>
      <Link
        href="/shop/your-shop"
        className="mx-4 flex items-center gap-3 rounded-xl border border-om-border-card bg-om-bg-surface p-4"
      >
        <Store size={20} className="text-om-text-secondary" />
        <span className="flex-1 text-sm font-medium">View public shop page</span>
        <ChevronRight size={16} className="text-om-text-disabled" />
      </Link>

      <p className="px-4 pt-6 text-xs text-om-text-tertiary">
        Stats, editing the shop page, and posting stories still need wiring to real
        Firestore aggregates — see firestore-data-model.md (shops, analytics).
      </p>
    </div>
  );
}
