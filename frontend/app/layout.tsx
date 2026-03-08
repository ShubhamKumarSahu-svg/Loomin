import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/core/providers/query-provider";
import ToastProvider from "@/core/providers/toast-provider";
import ThemeController from "@/core/layout/ThemeController";
import AppShell from "@/core/layout/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LOOMIN AI",
  description: "AI-native SaaS workspace for content operations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <ThemeController />
          <ToastProvider />
          <AppShell>{children}</AppShell>
        </QueryProvider>
      </body>
    </html>
  );
}
