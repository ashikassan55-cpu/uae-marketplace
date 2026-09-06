import type { ReactNode } from "react";
import Link from "next/link";
import { Bell, ChevronLeft } from "lucide-react";

export function TopBar({
  title,
  back,
  right,
}: {
  title: string;
  back?: string;
  right?: "notifications" | ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-om-border-subtle bg-om-bg-app/95 px-4 py-3 backdrop-blur">
      {back ? (
        <Link
          href={back}
          aria-label="Back"
          className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full hover:bg-om-bg-hover"
        >
          <ChevronLeft size={20} />
        </Link>
      ) : null}
      <h1 className="flex-1 truncate text-base font-semibold">{title}</h1>
      {right === "notifications" ? (
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-om-bg-hover"
        >
          <Bell size={20} />
        </Link>
      ) : (
        right ?? null
      )}
    </header>
  );
}
