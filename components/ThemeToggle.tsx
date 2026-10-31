"use client";

import { Moon, Sun } from "lucide-react";
import { useAtharTheme } from "@/components/ThemeProvider";

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useAtharTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      className={compact ? "icon-action theme-toggle theme-toggle-compact" : "theme-toggle"}
      onClick={toggleTheme}
      aria-label={isDark ? "الانتقال إلى الوضع النهاري" : "الانتقال إلى الوضع الليلي"}
      aria-pressed={!isDark}
      title={isDark ? "الوضع النهاري" : "الوضع الليلي"}
    >
      {isDark ? <Sun size={compact ? 18 : 17} /> : <Moon size={compact ? 18 : 17} />}
      {!compact && <span>{isDark ? "نهاري" : "ليلي"}</span>}
    </button>
  );
}
