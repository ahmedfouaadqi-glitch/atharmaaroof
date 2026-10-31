"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type AtharTheme = "dark" | "light";

type ThemeContextValue = {
  theme: AtharTheme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<AtharTheme>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("athar-maaroof-theme");
      if (saved === "light" || saved === "dark") {
        setTheme(saved);
      } else if (window.matchMedia?.("(prefers-color-scheme: light)").matches) {
        setTheme("light");
      }
    } catch {
      // Storage may be unavailable; keep the dark default.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try {
      window.localStorage.setItem("athar-maaroof-theme", theme);
    } catch {
      // The selected theme still applies for this session.
    }
  }, [ready, theme]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    toggleTheme: () => setTheme((current) => current === "dark" ? "light" : "dark")
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAtharTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useAtharTheme must be used inside ThemeProvider");
  return context;
}
