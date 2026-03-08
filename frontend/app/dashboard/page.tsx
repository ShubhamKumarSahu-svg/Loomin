"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPosts } from "@/services/api/posts.api";
import { getBrandConnections } from "@/services/api/brand.api";
import { useBrandStore } from "@/state/brand.store";
import { Post } from "@/types/domain.type";
import {
  Rocket,
  LayoutGrid,
  Plus,
  X,
  ShieldCheck,
  Zap,
  Activity,
  CalendarDays,
  TrendingUp,
  Network,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import CreateBrandForm from "@/components/CreateBrandForm";
import SocialConnections from "@/components/SocialConnections";

export default function DashboardPage() {
  const { activeBrand, brands, fetchBrands } = useBrandStore();
  const [showCreateBrand, setShowCreateBrand] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: ["posts", activeBrand?._id],
    queryFn: () => getPosts(activeBrand?._id as string),
    enabled: !!activeBrand?._id,
  });

  const { data: connections = [] } = useQuery({
    queryKey: ["brand-connections", activeBrand?._id],
    queryFn: () => getBrandConnections(activeBrand?._id as string),
    enabled: !!activeBrand?._id,
  });

  const publishedPosts = useMemo(
    () => posts.filter((post) => post.overallStatus === "published"),
    [posts]
  );

  const publishRate = posts.length > 0 ? Math.round((publishedPosts.length / posts.length) * 100) : 0;

  const avgChannelsPerPublished = useMemo(() => {
    if (publishedPosts.length === 0) return "0.0";
    const totalChannels = publishedPosts.reduce(
      (sum, post) => sum + new Set(post.platformDrafts.map((draft) => draft.platform)).size,
      0
    );
    return (totalChannels / publishedPosts.length).toFixed(1);
  }, [publishedPosts]);

  const platformMix = useMemo(() => {
    const counts: Record<string, number> = { linkedin: 0, instagram: 0};
    for (const post of publishedPosts) {
      const platforms = new Set(post.platformDrafts.map((draft) => draft.platform));
      for (const platform of platforms) {
        counts[platform] = (counts[platform] ?? 0) + 1;
      }
    }
    return Object.entries(counts).map(([platform, count]) => ({ platform, count }));
  }, [publishedPosts]);

  const weeklyPulse = useMemo(() => {
    const formatKey = (date: Date) => date.toISOString().slice(0, 10);
    const days: Array<{ key: string; label: string; count: number }> = [];
    const now = new Date();
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      days.push({
        key: formatKey(date),
        label: date.toLocaleDateString(undefined, { weekday: "short" }),
        count: 0,
      });
    }

    const dayMap = new Map(days.map((item) => [item.key, item]));
    for (const post of publishedPosts) {
      const stamp = post.publishedAt ?? post.createdAt;
      const key = formatKey(new Date(stamp));
      const day = dayMap.get(key);
      if (day) day.count += 1;
    }
    return days;
  }, [publishedPosts]);

  const recentPublished = useMemo(
    () =>
      [...publishedPosts]
        .sort(
          (a, b) =>
            new Date(b.publishedAt ?? b.createdAt).getTime() -
            new Date(a.publishedAt ?? a.createdAt).getTime()
        )
        .slice(0, 6),
    [publishedPosts]
  );

  if (!activeBrand && brands.length === 0 && !showCreateBrand) {
    return (
      <div className="mx-auto min-h-[80vh] max-w-2xl flex flex-col justify-center py-12 px-6">
        <div className="text-center space-y-6">
          <div className="inline-flex p-5 rounded-4xl bg-white/5 border border-white/10 text-sky-400">
            <LayoutGrid size={40} strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-serif font-light tracking-tight text-white">No active brands</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
              Your command center is offline. Initialize your first brand to unlock the synthesis engine.
            </p>
          </div>
        </div>

        <section className="mt-12 rounded-[2.5rem] border border-white/5 bg-white/2 p-8 backdrop-blur-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-500 mb-6">Initialization Protocol</p>
          <ul className="space-y-6">
            {[
              { id: "01", text: "Create your primary brand identity." },
              { id: "02", text: "Establish social uplink (LinkedIn/Instagram)." },
              { id: "03", text: "Navigate to Studio to deploy content." },
            ].map((step) => (
              <li key={step.id} className="flex gap-4 items-start">
                <span className="text-[10px] font-black text-white/20 mt-1">{step.id}</span>
                <span className="text-sm text-gray-400">{step.text}</span>
              </li>
            ))}
          </ul>
        </section>

        <button
          onClick={() => setShowCreateBrand(true)}
          className="mt-10 w-full rounded-full bg-white px-6 py-4 text-sm font-bold text-black transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Create Brand
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 bg-[#0A0A0A] text-white min-h-screen">
      
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sky-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            <Activity size={14} /> System Status: Operational
          </div>
          <h1 className="text-4xl font-serif font-light tracking-tight">Agent Command</h1>
          <p className="text-gray-500 text-sm max-w-md leading-relaxed">
            Overseeing performance and fleet status for <span className="text-white font-medium">{activeBrand?.name || "Active Session"}</span>.
          </p>
        </div>

        <button
          onClick={() => setShowCreateBrand(!showCreateBrand)}
          className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all hover:scale-105 active:scale-95 ${
            showCreateBrand ? "bg-white/10 text-white" : "bg-white text-black"
          }`}
        >
          {showCreateBrand ? <X size={18} /> : <Plus size={18} />}
          {showCreateBrand ? "Close" : "New Brand"}
        </button>
      </div>

      {showCreateBrand && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 backdrop-blur-xl bg-black/60">
          <div className="w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#121212] shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/5 px-8 py-6">
              <h3 className="text-xl font-serif">Brand Registration</h3>
              <button 
                onClick={() => setShowCreateBrand(false)} 
                className="rounded-full bg-white/5 p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8">
              <CreateBrandForm onSuccess={() => setShowCreateBrand(false)} onCancel={() => setShowCreateBrand(false)} />
            </div>
          </div>
        </div>
      )}

  
      {activeBrand && (
        <div className="space-y-12 animate-in fade-in duration-500">
          
      
          {connections.length === 0 && (
            <div className="rounded-[2.5rem] border border-white/10 bg-linear-to-br from-white/3 to-transparent p-8 md:p-10">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-widest">
                    <Zap size={12} /> Action Required
                  </div>
                  <h2 className="text-2xl font-serif font-light">Link Social Uplinks</h2>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Connect your brand to LinkedIn or Instagram to enable the synthesis-to-deploy pipeline.
                  </p>
                  <div className="flex gap-4 pt-2">
                     <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20">L</div>
                     <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20">I</div>
                     <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20">X</div>
                  </div>
                </div>
                <div className="bg-black/40 rounded-3xl p-6 border border-white/5">
                  <SocialConnections brandId={activeBrand._id} />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricCard
              title="Content Fleet"
              value={posts.length}
              icon={Rocket}
              color="text-sky-400"
              subtitle="Total generated drafts"
            />
            <MetricCard
              title="Active Deploys"
              value={publishedPosts.length}
              icon={ShieldCheck}
              color="text-emerald-400"
              subtitle="Successfully published posts"
            />
          </div>

          
          <div className="space-y-6 pt-6 border-t border-white/5">
            <div className="flex items-center gap-3">
              <TrendingUp size={18} className="text-sky-400" />
              <h2 className="text-lg font-medium tracking-tight">Publishing Intelligence</h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <section className="rounded-4xl border border-white/10 bg-white/2 p-6 lg:col-span-2">
                <div className="mb-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                  <CalendarDays size={14} className="text-sky-400" />
                  7-Day Launch Pulse
                </div>
                <div className="grid grid-cols-7 gap-3">
                  {weeklyPulse.map((day) => {
                    const height = Math.max(day.count * 18, day.count > 0 ? 12 : 4);
                    return (
                      <div key={day.key} className="flex flex-col items-center gap-2">
                        <div className="relative flex h-32 w-full items-end justify-center rounded-xl border border-white/5 bg-black/20 p-2">
                          <div
                            className="w-full rounded-md bg-linear-to-t from-sky-600 to-cyan-400"
                            style={{ height: `${height}px` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500">{day.label}</span>
                        <span className="text-xs text-white">{day.count}</span>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-4xl border border-white/10 bg-white/2 p-6 space-y-5">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                  <Network size={14} className="text-sky-400" />
                  Platform Mix
                </div>
                {platformMix.map((entry) => {
                  const ratio = publishedPosts.length > 0 ? Math.round((entry.count / publishedPosts.length) * 100) : 0;
                  return (
                    <div key={entry.platform} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="capitalize text-gray-300">{entry.platform}</span>
                        <span className="text-gray-500">{entry.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5">
                        <div
                          className="h-2 rounded-full bg-linear-to-r from-sky-500 to-cyan-400"
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="pt-3 border-t border-white/5 text-xs text-gray-400 space-y-1">
                  <p>Publish rate: <span className="text-white">{publishRate}%</span></p>
                  <p>Avg channels/post: <span className="text-white">{avgChannelsPerPublished}</span></p>
                </div>
              </section>
            </div>

            <div className="rounded-4xl border border-white/10 bg-white/2 p-6">
              <div className="mb-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                <Activity size={14} className="text-sky-400" />
                Recent Published Missions
              </div>
              {recentPublished.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No published posts yet. Publish from Studio and your mission feed will appear here.
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {recentPublished.map((post) => (
                    <article key={post.id} className="rounded-xl border border-white/5 bg-black/20 p-4">
                      <p className="line-clamp-1 text-sm font-medium text-white">{post.masterBrief.topic}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(post.publishedAt ?? post.createdAt).toLocaleString()}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {Array.from(new Set(post.platformDrafts.map((draft) => draft.platform))).map((platform) => (
                          <span
                            key={`${post.id}-${platform}`}
                            className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[10px] uppercase tracking-widest text-sky-300"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  subtitle: string;
}) {
  return (
    <div className="group p-8 rounded-4xl border border-white/5 bg-white/2 transition-all hover:bg-white/5 hover:border-white/10">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            {title}
          </p>
          <h3 className="text-5xl font-serif font-light text-white">
            {value}
          </h3>
          <p className="text-[10px] text-gray-600 font-medium uppercase mt-2">{subtitle}</p>
        </div>

        <div className={`p-4 rounded-2xl bg-white/5 border border-white/5 transition-transform group-hover:scale-110 ${color}`}>
          <Icon size={24} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}

