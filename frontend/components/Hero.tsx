import { Sparkles, Play } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-24 px-6 text-center overflow-hidden">
      
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[260px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/4 blur-[120px]" />

      <div className="relative z-10">
        <div className="mx-auto mb-10 flex max-w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 backdrop-blur-sm">
          <Sparkles size={12} className="text-sky-400" />
          The Agentic Social Era is Here
        </div>

        <h1 className="mb-8 text-6xl md:text-8xl font-serif font-light tracking-tight leading-[1.1] text-white">
          Stop Scheduling. <br />
          <span className="italic bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            Start Operating.
          </span>
        </h1>

        <p className="mx-auto mb-12 max-w-xl text-base md:text-lg text-gray-400 leading-relaxed font-light">
          Loomin AI agents don&apos;t just post content. They research trends, 
          mimic your unique brand voice, and engage with your niche autonomously.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          <Link
            href="/signup"
            className="group relative inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-sm font-bold text-black transition-all hover:scale-105 active:scale-95"
          >
            Deploy Your Agent
          </Link>
          
          <button className="flex items-center gap-2 text-sm font-bold text-white hover:text-sky-400 transition-colors group">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors group-hover:border-sky-500/50">
              <Play size={14} fill="currentColor" className="ml-0.5" />
            </div>
            Watch Demo
          </button>
        </div>
      </div>
    </section>
  );
}

