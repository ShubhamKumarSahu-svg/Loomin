"use client";

import { useEffect } from "react";
import { useGlobalStore } from "@/state/global.store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useGlobalStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }
  }, [theme]);

  return <>{children}</>;
}