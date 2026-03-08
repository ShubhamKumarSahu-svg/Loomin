"use client";

import AgentPreview from "@/components/AgentPreview";
import Hero from "@/components/Hero";
import { ReviewsMarquee } from "@/components/ReviewsMarquee";
import { Bot, Gauge, LayoutDashboard, Radar, Settings, ShieldCheck, ChevronRight } from "lucide-react";
import Link from "next/link";
import AnalyticsSection from "@/components/AnalyticsSection";
import { useAuthStore } from "@/state/auth.store";
import { LoominLogo } from "@/components/LoominLogo";

const features = [
  {
    title: "Autonomous Research",
    description: "Continuously scans your niche for trends, timing windows, and conversation shifts.",
    icon: Radar,
    gradient: "from-blue-500/20 to-cyan-500/5",
  },
  {
    title: "Voice Matching",
    description: "Learns your tone and structure, then drafts content that still sounds like you.",
    icon: Bot,
    gradient: "from-purple-500/20 to-pink-500/5",
  },
  {
    title: "Execution Engine",
    description: "Schedules and iterates posts automatically using performance feedback loops.",
    icon: Gauge,
    gradient: "from-orange-500/20 to-red-500/5",
  },
  {
    title: "Guardrails",
    description: "Policy checks and approval stages protect your brand before anything is published.",
    icon: ShieldCheck,
    gradient: "from-emerald-500/20 to-teal-500/5",
  },
];

const stats = [
  { label: "Avg lift in engagement", value: "+42%" },
  { label: "Time saved per week", value: "11 hrs" },
  { label: "Agent actions/day", value: "18k+" },
];

export default function LandingPage() {
  const { user } = useAuthStore();

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white selection:bg-sky-500/30">
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-6">
        <div className="absolute top-[-12%] left-[-12%] h-[34%] w-[34%] rounded-full bg-sky-500 blur-[140px]" />
      </div>

      
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/">
            <LoominLogo size="md" />
          </Link>

          <div className="flex items-center gap-8">
            {!user ? (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
                  Login
                </Link>
                <Link href="/signup" className="group flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-black transition-all hover:bg-sky-50 hover:scale-105 active:scale-95">
                  Initialize
                  <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            ) : (
              <div className="group relative">
                <div className="flex items-center gap-3 cursor-pointer p-1 pr-3 rounded-full border border-white/5 bg-white/[0.03] hover:bg-white/10 transition-colors">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/20 to-indigo-500/20 text-[10px] font-black border border-sky-500/30">
                    {user.fullName?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Operator</span>
                </div>
                
                <div className="invisible absolute right-0 top-full mt-3 w-56 origin-top-right rounded-[1.5rem] border border-white/10 bg-[#0A0A0A] p-2 shadow-2xl opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 translate-y-2">
                  <div className="px-4 py-3 border-b border-white/5 mb-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-500">Authorized Personnel</p>
                    <p className="truncate text-xs font-medium text-white mt-0.5">{user.fullName}</p>
                  </div>
                  <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs text-gray-400 hover:bg-white/5 hover:text-white transition-all">
                    <LayoutDashboard size={14} /> Control Center
                  </Link>
                  <Link href="/settings" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs text-gray-400 hover:bg-white/5 hover:text-white transition-all">
                    <Settings size={14} /> System Config
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <Hero />
      
      
      <section className="relative z-10 mx-auto -mt-12 w-full max-w-5xl px-6">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/5 md:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="bg-[#0A0A0A] px-8 py-10 text-center transition-colors hover:bg-white/[0.02]">
              <p className="text-4xl font-serif font-light tracking-tight">{item.value}</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-gray-500">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <AgentPreview />

      
      <section className="mx-auto mt-32 w-full max-w-7xl px-6 pb-20">
        <div className="mb-20 flex flex-col items-center text-center">
          <span className="inline-block rounded-full border border-sky-500/20 bg-sky-500/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-400">
            Capabilities
          </span>
          <h2 className="mt-6 text-4xl md:text-5xl font-serif font-light tracking-tight max-w-2xl">
            Built for full-funnel <span className="italic text-sky-400">content operations</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="group relative overflow-hidden rounded-3xl border border-white/5 bg-[#121212] p-8 transition-all hover:border-white/10"
            >
              
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity group-hover:opacity-100`} />
              
              <div className="relative z-10">
                <div className="mb-6 inline-flex rounded-2xl bg-white/5 p-3 text-white group-hover:scale-110 transition-transform">
                  <feature.icon size={22} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium mb-3">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-gray-400 group-hover:text-gray-300 transition-colors">
                  {feature.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <AnalyticsSection />

      <div className="py-20">
        <ReviewsMarquee />
      </div>

      <footer className="border-t border-white/5 bg-[#080808]">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-20 md:grid-cols-4">
          <div className="md:col-span-2">
            <LoominLogo size="md" />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-gray-500">
              High-performance agentic content operations. Execute faster, publish safer, and scale effortlessly.
            </p>
          </div>

          {[
            { title: "Product", links: ["Dashboard", "Intelligence", "API Docs"] },
            { title: "Legal", links: ["Privacy", "Terms", "Security"] }
          ].map((col) => (
            <div key={col.title}>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-white mb-6">{col.title}</h3>
              <ul className="space-y-4">
                {col.links.map(link => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-gray-500 hover:text-sky-400 transition-colors">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 px-6 py-8 text-center">
          <p className="text-[10px] uppercase tracking-widest text-gray-600">
            &copy; {new Date().getFullYear()} LOOMIN AI. Crafted for the future of content.
          </p>
        </div>
      </footer>
    </main>
  );
}

