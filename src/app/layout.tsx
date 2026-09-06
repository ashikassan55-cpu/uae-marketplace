import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/auth/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "UAE Marketplace",
  description:
    "Search secondhand items across the UAE in plain language — the AI concierge finds and explains the best matches for you.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf9f5",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-om-bg-app text-om-text-primary">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
