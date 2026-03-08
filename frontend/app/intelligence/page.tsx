"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { getPosts } from "@/services/api/posts.api";
import { syncAnalyticsNotifications } from "@/services/api/notifications.api";
import PostAnalyticsDashboard from "@/components/PostAnalyticsDashboard";
import { Activity, Brain, Globe, HardDrive, Zap } from "lucide-react";
import { useBrandStore } from "@/state/brand.store";

const hasMeaningfulValue = (value: unknown): boolean => {
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number" || typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.some((item) => hasMeaningfulValue(item));
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some((item) => hasMeaningfulValue(item));
  }
  return false;
};

const hasUsableAiResponse = (value: unknown): boolean => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return hasMeaningfulValue(value);
};

export default function IntelligencePage() {
  const activeBrand = useBrandStore((s) => s.activeBrand);

  const { data: posts = [] } = useQuery({
    queryKey: ["posts", activeBrand?._id],
    queryFn: () => getPosts(activeBrand?._id as string),
    enabled: !!activeBrand?._id,
  });

  useEffect(() => {
    if (!activeBrand?._id) return;
    syncAnalyticsNotifications(activeBrand._id).catch((error) => {
      console.error("Failed to sync analytics notifications:", error);
    });
  }, [activeBrand?._id]);

  const publishedCount = posts.filter((p) => p.overallStatus === "published").length;
  const aiAnalyzedCount = posts.filter((p) => hasUsableAiResponse(p.aiResponse)).length;
  
  const engagementScore = posts.length > 0 
    ? Math.round((publishedCount / posts.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-[#050505] p-8 space-y-10">
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-2 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.8)] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500/80">
              Neural Uplink Active
            </span>
          </div>
          <h1 className="text-4xl font-serif font-light tracking-tight text-white">
            Intelligence <span className="text-gray-600 italic">Center</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500 max-w-md">
            Real-time analysis of cross-channel performance and AI-generated content resonance.
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <Globe size={16} className="text-gray-600" />
          <div className="space-y-0.5">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">Global Registry</p>
            <p className="text-xs font-bold text-gray-300">{activeBrand?.name || "No Brand Selected"}</p>
          </div>
        </div>
      </header>

      
      <section className="grid md:grid-cols-3 gap-6">
        <InsightCard
          title="Neural Engagement"
          value={`${engagementScore}%`}
          icon={Zap}
          description="Content resonance score"
          trend="+12% vs last cycle"
        />
        <InsightCard
          title="Active Transmissions"
          value={publishedCount}
          icon={Activity}
          description="Total published nodes"
        />
        <InsightCard
          title="Cognitive Analysis"
          value={aiAnalyzedCount}
          icon={Brain}
          description="AI-validated datasets"
          status="Optimized"
        />
      </section>

      
      <div className="relative group">
        
        <div className="absolute -top-2 -left-2 h-4 w-4 border-t-2 border-l-2 border-white/10 group-hover:border-sky-500/30 transition-colors" />
        <div className="absolute -bottom-2 -right-2 h-4 w-4 border-b-2 border-r-2 border-white/10 group-hover:border-sky-500/30 transition-colors" />
        
        <div className="rounded-[2.5rem] border border-white/5 bg-[#080808] p-8 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8">
             <HardDrive size={24} className="text-white/5" />
          </div>
          <PostAnalyticsDashboard posts={posts} />
        </div>
      </div>
    </div>
  );
}

function InsightCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  status,
}: {
  title: string;
  value: string | number;
  icon: any;
  description?: string;
  trend?: string;
  status?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-4xl border border-white/5 bg-white/2 p-6 transition-all hover:bg-white/4 hover:border-white/10">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-gray-400 transition-colors group-hover:bg-sky-500/10 group-hover:text-sky-400">
          <Icon size={22} />
        </div>
        {status && (
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-500 border border-emerald-500/20">
            {status}
          </span>
        )}
      </div>

      <div className="mt-6 space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">{title}</p>
        <h2 className="text-4xl font-serif font-light tracking-tighter text-white">{value}</h2>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
        <p className="text-[10px] text-gray-500 font-medium italic">{description}</p>
        {trend && (
          <span className="text-[10px] font-bold text-sky-400">{trend}</span>
        )}
      </div>
      
      
      <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-transparent via-sky-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
