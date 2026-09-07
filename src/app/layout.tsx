import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { AuthProvider } from "@/lib/auth/auth-context";
import "./globals.css";

// The approved mockups load Manrope directly and use it as the page font
// (see the design canvas artboards) — this is the real typeface, not the
// system-font fallback the app shipped with before.
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "UAE Marketplace",
  description:
    "Search secondhand items across the UAE in plain language — the AI concierge finds and explains the best matches for you.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fcfcfc",
};

// Runs before first paint so the page always renders the approved LIGHT
// theme by default, regardless of the visitor's device/browser dark-mode
// setting — a dark-mode visitor no longer silently sees an unreviewed
// palette. Reads the user's own toggle choice (theme-toggle.tsx) if they've
// made one; otherwise forces "light".
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('om-theme');document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full antialiased ${manrope.variable}`}>
      <body className="min-h-full flex flex-col bg-om-bg-app text-om-text-primary font-sans">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
