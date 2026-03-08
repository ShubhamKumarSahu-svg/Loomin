"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenSquare,
  BarChart3,
  Bell,
  Settings,
  Zap,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Control Center", icon: LayoutDashboard },
  { href: "/studio", label: "Creative Studio", icon: PenSquare },
  { href: "/intelligence", label: "Intelligence", icon: BarChart3 },
  { href: "/notifications", label: "Activity Logs", icon: Bell },
  { href: "/settings", label: "System Config", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 border-r border-white/5 bg-[#050505] px-6 py-8 lg:flex flex-col">
      
      <div className="mb-10 group">
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          {/* ICON (UNCHANGED) */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-sky-400 to-indigo-600 shadow-[0_0_20px_-5px_rgba(14,165,233,0.5)]">
           <svg
              xmlns="http://www.w3.org/2000/svg"
              width={20}
              height={20}
              viewBox="0 0 24 24"
              className="text-white"
              fill="currentColor"
            >
              <path d="M7.361 16.596q-.861.721-1.795.646t-1.61-.64t-.913-1.482q-.235-.916.336-1.866l1.952-3.235q-.606-.453-.969-1.155T4 7.346q0-1.4.973-2.373T7.346 4t2.373.973t.973 2.373T9.72 9.72t-2.373.973q-.302 0-.584-.044t-.54-.152L4.24 13.785q-.352.585-.214 1.148t.56.913t1.006.4t1.125-.399l9.942-8.448q.838-.721 1.758-.653q.919.068 1.62.633q.7.564.948 1.482t-.343 1.886L18.669 14q.606.454.969 1.142T20 16.654q0 1.4-.987 2.373T16.64 20t-2.36-.983t-.972-2.363t.977-2.363t2.35-.983q.304 0 .592.054t.546.161l1.989-3.307q.351-.585.222-1.147q-.13-.561-.55-.914t-1.005-.41t-1.125.409zm-.015-6.904q.979 0 1.663-.683q.683-.684.683-1.663T9.01 5.684T7.346 5t-1.662.684T5 7.346t.684 1.663t1.662.683M16.633 19q.976 0 1.672-.684q.695-.683.695-1.662t-.695-1.663t-1.672-.683t-1.651.683t-.674 1.663t.674 1.662t1.65.684m.022-2.346"/>
            </svg>
          </div>

          <div>
            {/* COLOR CHANGED */}
            <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-sky-400">
              LOOMIN AI
            </span>

            <h1 className="text-lg font-serif font-light leading-none text-white">
              Agent <span className="text-gray-500">v1.0</span>
            </h1>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-2">
        <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
          Main Uplinks
        </p>

        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between rounded-2xl px-4 py-3.5 transition-all duration-300 ${
                active
                  ? "bg-white/5 text-white shadow-[inset_0_0_12px_rgba(255,255,255,0.02)]"
                  : "text-gray-500 hover:bg-white/[0.02] hover:text-gray-300"
              }`}
            >
              <div className="flex items-center gap-4">
                <Icon
                  size={18}
                  className={`transition-colors ${
                    active
                      ? "text-sky-400"
                      : "group-hover:text-gray-300"
                  }`}
                />

                <span className="text-sm font-medium tracking-tight">
                  {item.label}
                </span>
              </div>

              {active && (
                <ChevronRight
                  size={14}
                  className="text-sky-400 animate-in slide-in-from-left-2"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
              System Core
            </span>
            <div className="flex h-2 w-2">
              <span className="absolute h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
              <ShieldCheck size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-300">Operational</p>
              <p className="text-[10px] text-gray-600">All bridges stable</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-2">
          <p className="text-[9px] text-center font-medium text-gray-700 uppercase tracking-widest">
            © 2026 Secured Infrastructure
          </p>
        </div>
      </div>
    </aside>
  );
}