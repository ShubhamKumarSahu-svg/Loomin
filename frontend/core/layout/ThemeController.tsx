"use client";

import { useEffect } from "react";

export default function ThemeController() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
  }, []);

  return null;
}
