"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/state/auth.store";

export default function NotFound() {
  const router = useRouter();
  const { user, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    if (isCheckingAuth) return;
    if (!user) {
      router.replace("/login");
    } else {
      router.replace("/dashboard");
    }
  }, [user, isCheckingAuth, router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">
      Redirecting...
    </div>
  );
}
