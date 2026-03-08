"use client";

import { useAuthStore } from "@/state/auth.store";
import { ArrowRight, Lock, Mail, Zap, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const { login, isLoggingIn } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Auth Failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      
      <div className="hidden md:flex w-1/3 flex-col justify-between border-r border-white/5 bg-[#080808] p-12">
        <div className="space-y-12">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-sky-400 to-indigo-600 shadow-[0_0_20px_rgba(14,165,233,0.3)] group-hover:scale-105 transition-transform">
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
            <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Loomin AI</span>
          </Link>

          <div className="space-y-4">
            <h2 className="text-4xl font-serif font-light leading-[1.1] tracking-tight">
              Resume your <br /> <span className="text-sky-500">operations.</span>
            </h2>
            <p className="max-w-70 text-sm leading-relaxed text-gray-500">
              Secure uplink to your brand&aspos; autonomous content infrastructure.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">All Nodes Operational</span>
        </div>
      </div>

      
      <div className="relative flex flex-1 items-center justify-center p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.05),transparent_70%)]" />
        
        <div className="relative w-full max-w-md space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sign In</h1>
            <p className="mt-2 text-sm text-gray-500">Access your workspace via secure credentials.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="group relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-sky-500 transition-colors" size={18} />
              <input
                type="email"
                placeholder="Operator Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-white/5 bg-white/[0.03] py-4 pl-12 pr-4 text-sm focus:border-sky-500/50 focus:outline-none transition-all"
                required
              />
            </div>

            <div className="group relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-sky-500 transition-colors" size={18} />
              <input
                type="password"
                placeholder="Security Key"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-white/5 bg-white/[0.03] py-4 pl-12 pr-4 text-sm focus:border-sky-500/50 focus:outline-none transition-all"
                required
              />
            </div>

            {error && <p className="text-xs text-red-400 px-2">{error}</p>}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 text-xs font-black uppercase tracking-widest text-black hover:bg-sky-50 transition-all disabled:opacity-50"
            >
              {isLoggingIn ? "Authorizing..." : "Initialize Session"}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <p className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-600">
            Unauthorized? <Link href="/signup" className="text-sky-500 hover:text-sky-400">Register New Identity</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
