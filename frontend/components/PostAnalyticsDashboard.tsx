"use client";

import { useMemo, useState } from "react";
import type { Post } from "@/types/domain.type";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { Activity, TrendingUp, Sparkles, Hash, Zap, Brain, Target, BarChart3 } from "lucide-react";
import ThemedSelect from "@/components/ui/themed-select";

interface Props {
  posts: Post[];
}

type PlatformScores = Record<string, number>;

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
};

const asNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return 0;
};

const asString = (value: unknown, fallback = "N/A"): string => {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
};

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
};

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

export default function PostAnalyticsDashboard({ posts }: Props) {
  const postsWithAi = useMemo(
    () => posts.filter((post) => hasUsableAiResponse(post.aiResponse)),
    [posts]
  );
  const [selectedPostId, setSelectedPostId] = useState<string>("");

  if (!postsWithAi.length) {
    return (
      <section className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-gray-600">
          <Brain size={24} />
        </div>
        <h2 className="text-xl font-serif font-light text-white">Intelligence Pending</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500 leading-relaxed">
          The AI engine requires a 48-hour tracking cycle post-deployment to synthesize performance analytics.
        </p>
      </section>
    );
  }

  const selectedPost = postsWithAi.find((post) => post.id === selectedPostId) ?? postsWithAi[0];
  const aiResponse = asRecord(selectedPost.aiResponse) ?? {};
  const summary = asRecord(aiResponse.summary) ?? {};
  const graphData = asRecord(aiResponse.graph_data) ?? {};
  const platformScores =
    (asRecord(aiResponse.platform_scores) as PlatformScores | null) ??
    (asRecord(aiResponse.platform_scores_raw) as PlatformScores | null) ??
    {};

  const timestamps = Array.isArray(graphData.timestamps) ? graphData.timestamps : [];
  const linkedinLikes = Array.isArray(graphData.linkedin_likes) ? graphData.linkedin_likes : [];
  const linkedinComments = Array.isArray(graphData.linkedin_comments) ? graphData.linkedin_comments : [];
  const instagramReach = Array.isArray(graphData.instagram_reach) ? graphData.instagram_reach : [];
  const redditUpvotes = Array.isArray(graphData.reddit_upvotes) ? graphData.reddit_upvotes : [];

  const trendSeries = Array.from(
    { length: Math.max(timestamps.length, linkedinLikes.length, linkedinComments.length, instagramReach.length, redditUpvotes.length) },
    (_, idx) => ({
      label:
        typeof timestamps[idx] === "string" && timestamps[idx]
          ? new Date(timestamps[idx] as string).toLocaleDateString()
          : `T${idx + 1}`,
      linkedinLikes: asNumber(linkedinLikes[idx]),
      linkedinComments: asNumber(linkedinComments[idx]),
      instagramReach: asNumber(instagramReach[idx]),
      redditUpvotes: asNumber(redditUpvotes[idx]),
    })
  );

  const radarData = Object.entries(platformScores).map(([platform, score]) => ({
    platform: platform.charAt(0).toUpperCase() + platform.slice(1),
    score: asNumber(score),
    fullMark: 100,
  }));

  const recommendations = asStringArray(aiResponse.recommendations);
  const insights = asStringArray(aiResponse.insights);
  const hashtags = asStringArray(aiResponse.recommended_hashtags);
  const prediction = asString(aiResponse.prediction);
  const overallPerformance = asString(summary.overall_performance);
  const bestPlatform = asString(summary.best_platform);
  const growthDirection = asString(summary.growth_direction);
  const confidence =
    asNumber(summary.confidence_score) ||
    asNumber(aiResponse.confidence_score) ||
    asNumber(aiResponse.confidence);

  return (
    <section className="space-y-8 animate-in fade-in duration-700">
      
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-white/5 pb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <BarChart3 size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-light text-white tracking-tight">Post Intelligence</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Neural Analysis Engine</p>
          </div>
        </div>
        
        <div className="relative min-w-[320px]">
          <label className="absolute -top-2.5 left-4 bg-[#0A0A0A] px-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 z-10">
            Select Subject
          </label>
          <ThemedSelect
            value={selectedPost.id}
            onChange={(nextPostId) => setSelectedPostId(nextPostId)}
            options={postsWithAi.map((post) => ({
              value: post.id,
              label: `${post.masterBrief.topic} - ${new Date(post.createdAt).toLocaleDateString()}`,
            }))}
            buttonClassName="rounded-2xl border-white/10 bg-white/5 px-5 py-4 text-white"
          />
        </div>
      </div>

      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Performance" value={overallPerformance.replaceAll("_", " ")} icon={<Activity size={16} />} />
        <StatCard title="Optimal Path" value={bestPlatform} icon={<Target size={16} />} />
        <StatCard title="Trajectory" value={growthDirection.replaceAll("_", " ")} icon={<TrendingUp size={16} />} />
        <StatCard title="Model Confidence" value={`${confidence}%`} icon={<Zap size={16} />} />
      </div>

      
      <div className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-4xl border border-white/5 bg-white/2 p-8 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Cross-Platform Trend</h3>
            <div className="flex gap-4">
               <div className="flex items-center gap-1.5 text-[10px] text-sky-400"><span className="h-1.5 w-1.5 rounded-full bg-sky-400"/> LinkedIn</div>
               <div className="flex items-center gap-1.5 text-[10px] text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/> Instagram</div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#4b5563", fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4b5563", fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#121212", border: "1px solid #ffffff10", borderRadius: 16, fontSize: '12px' }}
                  itemStyle={{ padding: '2px 0' }}
                />
                <Line type="monotone" dataKey="linkedinLikes" stroke="#38bdf8" strokeWidth={3} dot={false} animationDuration={1500} />
                <Line type="monotone" dataKey="instagramReach" stroke="#34d399" strokeWidth={3} dot={false} animationDuration={1500} />
                <Line type="monotone" dataKey="redditUpvotes" stroke="#f59e0b" strokeWidth={3} dot={false} animationDuration={1500} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-4xl border border-white/5 bg-white/2 p-8">
          <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-gray-400">Platform Saturation</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#ffffff05" />
                <PolarAngleAxis dataKey="platform" tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} />
                <Radar dataKey="score" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.15} animationDuration={1500} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      
      <div className="grid gap-6 md:grid-cols-2">
        <article className="group rounded-4xl border border-white/5 bg-white/2 p-8 transition-colors hover:bg-white/4">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles size={18} className="text-sky-400" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Strategic Recommendations</h3>
          </div>
          <ul className="space-y-4">
            {recommendations.length ? (
              recommendations.map((item, idx) => (
                <li key={`${item}-${idx}`} className="flex gap-4 items-start group/li">
                  <span className="text-[10px] font-black text-white/10 mt-1">0{idx + 1}</span>
                  <p className="text-sm text-gray-400 leading-relaxed group-hover/li:text-gray-200 transition-colors">{item}</p>
                </li>
              ))
            ) : (
              <li className="text-sm italic text-gray-600">Pending data collection...</li>
            )}
          </ul>
        </article>

        <article className="rounded-[2rem] border border-white/5 bg-white/2 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Brain size={18} className="text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Neural Insights</h3>
          </div>
          <p className="text-md font-serif text-gray-200 leading-relaxed border-l-2 border-emerald-500/30 pl-4 mb-6">
            {prediction}
          </p>
          <div className="space-y-3">
             {insights.slice(0, 3).map((item, idx) => (
               <div key={idx} className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="h-1 w-1 rounded-full bg-emerald-500" />
                  {item}
               </div>
             ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-2 pt-6 border-t border-white/5">
            {hashtags.slice(0, 6).map((tag) => (
              <span key={tag} className="flex items-center gap-1 rounded-full border border-white/5 bg-white/2 px-4 py-1.5 text-[10px] font-bold text-sky-400 uppercase tracking-widest hover:bg-sky-500/10 transition-colors">
                <Hash size={10} /> {tag.replace(/^#/, "")}
              </span>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="rounded-3xl border border-white/5 bg-white/2 p-6 transition-all hover:border-white/10 group">
      <div className="mb-4 inline-flex rounded-xl bg-white/5 p-2 text-gray-500 group-hover:text-sky-400 transition-colors">{icon}</div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">{title}</p>
      <p className="mt-1 text-lg font-serif font-light text-white capitalize group-hover:translate-x-1 transition-transform">{value}</p>
    </article>
  );
}

