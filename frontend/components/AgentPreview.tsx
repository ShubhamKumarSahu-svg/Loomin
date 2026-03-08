"use client";

import {
  AnimatedSpan,
  Terminal as MagicTerminal,
  TypingAnimation,
} from "@/components/ui/terminal";

import { Terminal } from "lucide-react";

export default function AgentPreview() {
  return (
    <div className="mx-auto mt-12 max-w-4xl rounded-2xl bg-gradient-to-b from-sky-500/35 to-transparent p-1">
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-[var(--muted)]">
            <Terminal size={12} /> loomin_ai_core_v1.0.0
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)]">
                Active Intelligence
              </h4>

              <MagicTerminal className="h-[160px] overflow-hidden bg-transparent border-none shadow-none">
                <TypingAnimation delay={0}>
                  $ scanning_linkedin --topic &quot;SaaS Growth&quot;
                </TypingAnimation>

                <AnimatedSpan delay={900} className="text-blue-500">
                  {"-> Detecting high-performing hooks..."}
                </AnimatedSpan>

                <TypingAnimation delay={1800}>$ trend_analysis</TypingAnimation>

                <AnimatedSpan delay={2600} className="text-yellow-500">
                  {'-> Trend detected: "Agentic Workflows"'}
                </AnimatedSpan>

                <TypingAnimation delay={3400}>
                  $ optimize_post --platform linkedin
                </TypingAnimation>

                <AnimatedSpan delay={4300} className="text-green-500">
                  + Scheduled for 2:15 PM EST (Peak Resonance)
                </AnimatedSpan>
              </MagicTerminal>
            </div>

            <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-elevated)] p-4">
              <p className="mb-2 text-xs italic text-[var(--muted)]">Agent Draft Preview:</p>

              <p className="font-medium leading-relaxed text-[var(--foreground)]">
                &quot;The biggest shift in 2026 is not AI writing your posts, it is AI choosing
                what to write based on real-time market sentiment.&quot;
              </p>

              <div className="mt-4 flex gap-2">
                <button className="rounded-md border border-green-500/20 bg-green-500/10 px-3 py-1 text-[10px] text-green-600">
                  Approve
                </button>

                <button className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-1 text-[10px] text-red-600">
                  Discard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
