"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "om-theme";

function readStoredTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
}

/**
 * Manual light/dark switch. The app defaults to the approved LIGHT theme
 * regardless of the visitor's device setting (see the inline script in
 * src/app/layout.tsx) — this button is for comparing the two palettes
 * side by side, not for following system preference. Initial state is read
 * lazily (not in an effect) from localStorage; suppressHydrationWarning
 * below covers the rare case where that differs from the server's
 * always-"light" render.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(readStoredTheme);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      suppressHydrationWarning
      className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-om-bg-hover"
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
