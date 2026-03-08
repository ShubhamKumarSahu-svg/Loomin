"use client";

import { useAuthStore } from "@/state/auth.store";
import { UserPlus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoominLogo } from "@/components/LoominLogo";

export default function SignUp() {
  const router = useRouter();
  const { signup, isSigningUp } = useAuthStore();
   const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup({
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
      });
      router.push("/dashboard");

    } catch (err: any) {
      setError(err.message || "Auth Failed");
    }
  };
  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      
      <div className="hidden md:flex w-1/3 flex-col justify-between border-r border-white/5 bg-[#080808] p-12">
        <div className="space-y-12">
          <Link href="/">
            <LoominLogo  />
          </Link>
          <div className="space-y-4">
            <h2 className="text-4xl font-serif font-light leading-[1.1] tracking-tight text-balance">
              Deploy your <br /> <span className="text-sky-500">AI Workforce.</span>
            </h2>
            <p className="max-w-70 text-sm leading-relaxed text-gray-500">
              Join the network of brands using autonomous agents to dominate social reach.
            </p>
          </div>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-700">
          Encrypted Registration v.26
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-8 lg:p-20">
        <div className="mx-auto max-w-xl space-y-10">
          <header>
            <h1 className="text-3xl font-bold tracking-tight">New Identity Registry</h1>
            <p className="text-sm text-gray-500 mt-2 text-balance">
              Configure your operator credentials to initialize the neural link.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <input
              name="firstName"
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="col-span-1 rounded-2xl border border-white/5 bg-white/5 p-4 text-sm focus:border-sky-500/50 focus:outline-none transition-all placeholder:text-gray-600"
              required
            />
            <input
              name="lastName"
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="col-span-1 rounded-2xl border border-white/5 bg-white/5 p-4 text-sm focus:border-sky-500/50 focus:outline-none transition-all placeholder:text-gray-600"
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Work Email"
              value={formData.email}
              onChange={handleChange}
              className="col-span-2 rounded-2xl border border-white/5 bg-white/5 p-4 text-sm focus:border-sky-500/50 focus:outline-none transition-all placeholder:text-gray-600"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Access Key"
              value={formData.password}
              onChange={handleChange}
              className="col-span-2 rounded-2xl border border-white/5 bg-white/5 p-4 text-sm focus:border-sky-500/50 focus:outline-none transition-all placeholder:text-gray-600"
              required
            />
            {error && <p className="text-xs text-red-400 px-2">{error}</p>}
            <button
              type="submit"
              disabled={isSigningUp}
              className="col-span-2 mt-4 bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-sky-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningUp ? (
                <>
                  Initializing... <Loader2 size={16} className="animate-spin" />
                </>
              ) : (
                <>
                  Initialize Operator <UserPlus size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-600">
            Existing Identity?{" "}
            <Link href="/login" className="text-sky-500 hover:text-sky-400 transition-colors">
              Access Uplink
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}