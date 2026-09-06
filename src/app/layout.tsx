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

// Runs before first paint so the page always renders the approved LIGHT
// theme by default, regardless of the visitor's device/browser dark-mode
// setting — a dark-mode visitor no longer silently sees an unreviewed
// palette. Reads the user's own toggle choice (theme-toggle.tsx) if they've
// made one; otherwise forces "light".
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('om-theme');document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-om-bg-app text-om-text-primary">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
