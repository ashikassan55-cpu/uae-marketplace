import type { ReactNode } from "react";
import { BottomNav } from "@/components/bottom-nav";

export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex-1">{children}</div>
      <BottomNav />
    </div>
  );
}
