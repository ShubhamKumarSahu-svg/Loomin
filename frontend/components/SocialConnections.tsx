"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Linkedin, Instagram, Twitter, Facebook, Link2, Unlink, Loader2, AlertCircle } from "lucide-react";
import type { ComponentType } from "react";

import {
  buildOauthConnectUrl,
  disconnectPlatform,
  getBrandConnections,
  type SocialProvider,
} from "@/services/api/brand.api";

const PROVIDERS: Array<{
  key: SocialProvider;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  color: string;
}> = [
  { key: "linkedin", label: "LinkedIn", icon: Linkedin, color: "text-blue-400" },
  { key: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-400" },
  { key: "twitter", label: "Twitter / X", icon: Twitter, color: "text-sky-300" },
  { key: "facebook", label: "Facebook", icon: Facebook, color: "text-blue-600" },
];

const COMING_SOON_PROVIDERS: SocialProvider[] = ["facebook", "twitter"];

interface Props {
  brandId?: string;
  oauthStatus?: string | null;
  oauthProvider?: string | null;
}

export default function SocialConnections({
  brandId,
  oauthStatus,
  oauthProvider,
}: Props) {
  const queryClient = useQueryClient();
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [comingSoonLine, setComingSoonLine] = useState<string | null>(null);

  useEffect(() => {
    if (!comingSoonLine) return;
    const timeoutId = window.setTimeout(() => setComingSoonLine(null), 5000);
    return () => window.clearTimeout(timeoutId);
  }, [comingSoonLine]);

  const connectionsQuery = useQuery({
    queryKey: ["brand-connections", brandId],
    queryFn: () => getBrandConnections(brandId!),
    enabled: Boolean(brandId),
  });

  const connectedPlatforms = useMemo(
    () => new Set((connectionsQuery.data ?? []).map((item) => item.platform)),
    [connectionsQuery.data]
  );

  const disconnectMutation = useMutation({
    mutationFn: ({ provider }: { provider: SocialProvider }) =>
      disconnectPlatform(brandId!, provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand-connections", brandId] });
    },
  });

  const handleOAuthConnect = (providerKey: SocialProvider) => {
    if (!brandId) return;
    if (COMING_SOON_PROVIDERS.includes(providerKey)) {
      const label = PROVIDERS.find((p) => p.key === providerKey)?.label ?? providerKey;
      setComingSoonLine(`${label} integration is currently in internal testing.`);
      return;
    }

    try {
      setComingSoonLine(null);
      setConnectingProvider(providerKey);
      const url = buildOauthConnectUrl(providerKey, brandId);
      window.location.assign(url);
    } catch (error) {
      console.error(error);
      setConnectingProvider(null);
    }
  };

  if (!brandId) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 italic">
        <AlertCircle size={14} />
        Initialize a brand identity to manage social uplinks.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {oauthStatus && (
        <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-[10px] font-black uppercase tracking-widest ${
          oauthStatus === "connected" || oauthStatus === "true"
            ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
            : "border-amber-500/20 bg-amber-500/5 text-amber-400"
        }`}>
          <div className={`h-1.5 w-1.5 rounded-full ${oauthStatus === "connected" || oauthStatus === "true" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
          System Response: {oauthProvider} Authorization {oauthStatus === "true" ? "successful" : oauthStatus}
        </div>
      )}

      
      {comingSoonLine && (
        <div className="animate-in slide-in-from-left-2 flex items-center gap-3 rounded-2xl border border-sky-500/20 bg-sky-500/5 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-sky-300">
          <Loader2 size={14} className="animate-spin" />
          {comingSoonLine}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {PROVIDERS.map((provider) => {
          const Icon = provider.icon;
          const isConnected = connectedPlatforms.has(provider.key);
          const isConnectingThis = connectingProvider === provider.key;
          const isPending = COMING_SOON_PROVIDERS.includes(provider.key);

          return (
            <article
              key={provider.key}
              className={`group relative overflow-hidden rounded-[2rem] border p-6 transition-all duration-300 ${
                isConnected 
                  ? "border-emerald-500/20 bg-emerald-500/[0.02]" 
                  : "border-white/5 bg-white/[0.01] hover:border-white/10"
              }`}
            >
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ${provider.color}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-widest text-white">{provider.label}</h4>
                      <p className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-500">
                        {isConnected ? "Active Bridge" : isPending ? "In Alpha" : "Disconnected"}
                      </p>
                    </div>
                  </div>

                  <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-gray-800"}`} />
                </div>

                {isConnected ? (
                  <button
                    onClick={() => disconnectMutation.mutate({ provider: provider.key })}
                    disabled={disconnectMutation.isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 transition-all hover:bg-red-500 hover:text-white"
                  >
                    <Unlink size={14} />
                    {disconnectMutation.isPending ? "Severing Link..." : "Sever Connection"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleOAuthConnect(provider.key)}
                    disabled={isConnectingThis || isPending}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                      isPending 
                        ? "cursor-not-allowed border border-white/5 text-gray-600"
                        : "bg-white text-black hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                  >
                    {isConnectingThis ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Link2 size={14} />
                    )}
                    {isConnectingThis ? "Redirecting..." : isPending ? "Coming Soon" : `Authorize ${provider.label}`}
                  </button>
                )}
              </div>
              
              
              <div className={`absolute -bottom-4 -right-4 opacity-[0.03] transition-transform group-hover:scale-110 ${provider.color}`}>
                <Icon size={100} />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
