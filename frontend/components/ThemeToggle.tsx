"use client";

import { Sun, Moon } from "lucide-react";
import { useGlobalStore } from "@/state/global.store";

export function ThemeToggle() {
  const theme = useGlobalStore((state) => state.theme);
  const setTheme = useGlobalStore((state) => state.setTheme);

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="focus-ring inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:border-[var(--border-strong)]"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      <span>{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}

