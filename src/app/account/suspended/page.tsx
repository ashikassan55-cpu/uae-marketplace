import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function AccountSuspendedPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-8 text-center">
      <ShieldAlert size={36} className="text-om-accent-error" />
      <p className="text-base font-semibold">Your account is suspended</p>
      <p className="max-w-xs text-sm text-om-text-secondary">
        Our automated checks flagged unusual activity on this account. Listings are
        hidden and you can&rsquo;t post while this is under review.
      </p>
      <Link
        href="/account/appeal"
        className="rounded-full bg-om-accent-primary px-6 py-2.5 text-sm font-semibold text-om-text-inverse"
      >
        Submit an appeal
      </Link>
    </div>
  );
}
