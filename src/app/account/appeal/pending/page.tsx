import Link from "next/link";
import { Clock } from "lucide-react";

export default function AppealPendingPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-8 text-center">
      <Clock size={36} className="text-om-accent-warning" />
      <p className="text-base font-semibold">Appeal submitted</p>
      <p className="max-w-xs text-sm text-om-text-secondary">
        We&rsquo;ll notify you once a reviewer has made a decision. This usually
        doesn&rsquo;t take long.
      </p>
      <Link href="/profile" className="text-sm font-medium text-om-accent-primary">
        Back to profile
      </Link>
    </div>
  );
}
