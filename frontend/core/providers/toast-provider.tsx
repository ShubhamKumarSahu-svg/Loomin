"use client";

import { Toaster } from "sonner";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={4000}
      expand
      toastOptions={{
        className: "loomin-toast",
        style: {
          background: "color-mix(in srgb, var(--surface-elevated) 88%, #0ea5e9 12%)",
          border: "1px solid var(--border)",
          color: "var(--foreground)",
          borderRadius: "14px",
          boxShadow: "0 14px 34px rgba(2,8,20,0.45)",
        },
      }}
    />
  );
}
