"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, LogOut, Shield, Globe, Palette, Mic2, Layout, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";


import { useAuthStore } from "@/state/auth.store";

import { logoutUser } from "@/services/api/auth.api";
import {
  createBrand,
  getBrandConnections,
  getBrands,
  updateBrand,
  type BrandRecord,
} from "@/services/api/brand.api";
import SocialConnections from "@/components/SocialConnections";
import { useBrandStore } from "@/state/brand.store";

type LogoPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const activeBrand = useBrandStore((s) => s.activeBrand);
  const setActiveBrand = useBrandStore((s) => s.setActiveBrand);

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [newBrandName, setNewBrandName] = useState("");
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
  const [isBrandProfileOpen, setIsBrandProfileOpen] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFileName, setLogoFileName] = useState<string | null>(null);
  const [isLogoUploading, setIsLogoUploading] = useState(false);

  const oauthStatus = searchParams.get("status") || searchParams.get("linkedin_connected");
  const oauthProvider = searchParams.get("oauth") || "linkedin";

  const brandsQuery = useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  });

  const connectionsQuery = useQuery({
    queryKey: ["brand-connections", activeBrand?._id],
    queryFn: () => getBrandConnections(activeBrand!._id),
    enabled: Boolean(activeBrand?._id),
  });

  useEffect(() => {
    if (activeBrand || !brandsQuery.data?.length) return;
    const first = brandsQuery.data[0];
    setActiveBrand(first._id );
  }, [activeBrand, brandsQuery.data, setActiveBrand]);

  const selectedBrandRecord =
    activeBrand?._id && brandsQuery.data
      ? brandsQuery.data.find((brand) => brand._id === activeBrand._id) ?? null
      : null;

  useEffect(() => {
    if (!isBrandProfileOpen || !selectedBrandRecord) return;
    setLogoUrl((selectedBrandRecord.logoUrl ?? selectedBrandRecord.logo ?? "").trim());
    setLogoFileName(null);
  }, [isBrandProfileOpen, selectedBrandRecord]);

  const connectedPlatforms = useMemo(
    () => new Set((connectionsQuery.data ?? []).map((item) => item.platform)),
    [connectionsQuery.data]
  );

  const userInitials = useMemo(() => {
    const name = user?.fullName?.trim();
    if (!name) return "U";
    const parts = name.split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
  }, [user?.fullName]);

  const createBrandMutation = useMutation({
    mutationFn: () => createBrand({ name: newBrandName.trim() }),
    onSuccess: (brand: BrandRecord) => {
      setNewBrandName("");
      setIsAddBrandOpen(false);
      setActiveBrand(brand._id);
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });

  const saveProfileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const brandId = activeBrand?._id ?? selectedBrandRecord?._id;
      if (!brandId) throw new Error("No active brand selected");

      const brandColors = String(formData.get("brandColors") ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      return updateBrand(brandId, {
        brandColors,
        brandStyle: String(formData.get("brandStyle") ?? "").trim() || undefined,
        brandText: String(formData.get("brandText") ?? "").trim() || undefined,
        brandVoice: String(formData.get("brandVoice") ?? "").trim() || undefined,
        ctaStyle: String(formData.get("ctaStyle") ?? "").trim() || undefined,
        logoUrl: String(formData.get("logoUrl") ?? "").trim() || undefined,
        logo: String(formData.get("logoUrl") ?? "").trim() || undefined,
        logoPosition: String(formData.get("logoPosition") ?? "top-right") as LogoPosition,
        description: String(formData.get("brandText") ?? "").trim() || undefined,
      });
    },
    onSuccess: () => {
      setProfileSaveError(null);
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setIsBrandProfileOpen(false);
    },
    onError: (error: Error) => {
      setProfileSaveError(error.message || "Failed to save brand profile");
    },
  });

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim();
    if (!cloudName || !uploadPreset) {
      throw new Error(
        "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
      );
    }

    const formData = new FormData();
    formData.set("file", file);
    formData.set("upload_preset", uploadPreset);
    formData.set("folder", "loomin-ai/brand-logos");

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as {
      secure_url?: string;
      url?: string;
      error?: { message?: string };
    };
    if (!response.ok) {
      throw new Error(data.error?.message ?? "Cloudinary upload failed.");
    }

    const uploadedUrl = data.secure_url ?? data.url;
    if (!uploadedUrl || uploadedUrl.trim().length === 0) {
      throw new Error("Cloudinary did not return an image URL.");
    }

    return uploadedUrl.trim();
  };

  const handleLogoUpload = async (file: File | null) => {
    if (!file) return;
    const uploadToastId = toast.loading("Uploading brand logo...");
    setIsLogoUploading(true);
    try {
      const uploadedLogoUrl = await uploadImageToCloudinary(file);
      setLogoUrl(uploadedLogoUrl);
      setLogoFileName(file.name);
      setProfileSaveError(null);
      toast.success("Brand logo uploaded.", { id: uploadToastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload selected logo.", { id: uploadToastId });
    } finally {
      setIsLogoUploading(false);
    }
  };

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSettled: () => {
      logout();
      router.push("/login");
    },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-12 p-8 bg-[#0A0A0A] text-white min-h-screen">
      <header className="space-y-2 border-b border-white/5 pb-8">
        <h1 className="text-4xl font-serif font-light tracking-tight">System Settings</h1>
        <p className="text-gray-500 text-sm">Configure brand identities and platform authorizations.</p>
      </header>

      
      <section className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-[#111] via-[#0A0A0A] to-[#050505] p-8 transition-all hover:border-white/10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-500/5 blur-[100px]" />
        
        <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[2rem] border border-white/10 bg-white/5 text-2xl font-serif text-sky-400">
              {userInitials}
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.3em] text-sky-500 font-black">Authorized Operator</p>
              <h2 className="text-2xl font-serif font-light leading-tight">{user?.fullName ?? "Agent"}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <MetricBox label="Brands" value={brandsQuery.data?.length ?? 0} />
            <MetricBox label="Uplinks" value={connectedPlatforms.size} />
            <div className="hidden lg:block w-px h-12 bg-white/5 mx-2" />
            <button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 transition-all hover:bg-red-500 hover:text-white"
            >
              <LogOut size={14} /> {logoutMutation.isPending ? "Terminating..." : "Logout"}
            </button>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-12 gap-12">
        
        <div className="lg:col-span-4 space-y-10">
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Shield size={16} className="text-sky-500" /> Active Context
              </h3>
            </div>
            
            <div className="flex flex-col gap-2">
              {(brandsQuery.data ?? []).map((brand) => (
                <button
                  key={brand._id}
                  onClick={() => setActiveBrand(brand._id)}
                  className={`group flex items-center justify-between rounded-2xl border px-5 py-4 text-sm transition-all ${
                    activeBrand?._id === brand._id
                      ? "border-sky-500/50 bg-sky-500/10 text-white shadow-[0_0_20px_-10px_rgba(14,165,233,0.3)]"
                      : "border-white/5 bg-white/[0.02] text-gray-500 hover:border-white/10 hover:text-gray-300"
                  }`}
                >
                  <span className="font-medium tracking-tight">{brand.name}</span>
                  {activeBrand?._id === brand._id && <div className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,1)]" />}
                </button>
              ))}
            </div>

            {isAddBrandOpen ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newBrandName.trim()) return;
                  createBrandMutation.mutate();
                }}
                className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2"
              >
                <input
                  autoFocus
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="Brand Identity Name"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-sky-500/50 transition-all"
                />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-white text-black text-[10px] font-black uppercase tracking-widest py-3 rounded-xl">Save</button>
                  <button type="button" onClick={() => setIsAddBrandOpen(false)} className="px-4 bg-white/5 rounded-xl"><X size={16} /></button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAddBrandOpen(true)}
                className="w-full flex items-center justify-center gap-2 border border-dashed border-white/10 rounded-2xl py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:border-sky-500/30 hover:text-sky-500 transition-all"
              >
                <Plus size={14} /> Register New Brand
              </button>
            )}
          </section>
        </div>

        
        <div className="lg:col-span-8 space-y-12">
          
          
          <section className="rounded-[2.5rem] border border-white/5 bg-white/1 p-8 space-y-8">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-serif font-light">Brand Metadata</h3>
                <p className="text-xs text-gray-500">Configure the synthesis engine&aspos; creative constraints.</p>
              </div>
              {activeBrand && (
                <button
                  onClick={() => setIsBrandProfileOpen(!isBrandProfileOpen)}
                  className={`flex items-center gap-2 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                    isBrandProfileOpen ? "bg-white text-black" : "bg-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  <Pencil size={12} /> {isBrandProfileOpen ? "Close Editor" : "Edit Metadata"}
                </button>
              )}
            </div>

            {isBrandProfileOpen && selectedBrandRecord ? (
              <form
                className="grid gap-6 animate-in fade-in duration-500"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isLogoUploading) {
                    setProfileSaveError("Please wait for logo upload to complete.");
                    return;
                  }
                  saveProfileMutation.mutate(new FormData(e.currentTarget));
                }}
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <ConfigInput icon={<Palette size={14}/>} name="brandColors" label="Color Palette" defaultValue={(selectedBrandRecord.brandColors ?? []).join(", ")} />
                  <ConfigInput icon={<Globe size={14}/>} name="brandStyle" label="Visual Style" defaultValue={selectedBrandRecord.brandStyle} />
                  <ConfigInput icon={<Mic2 size={14}/>} name="brandVoice" label="Voice Tone" defaultValue={selectedBrandRecord.brandVoice} />
                  <ConfigInput icon={<Layout size={14}/>} name="ctaStyle" label="CTA Strategy" defaultValue={selectedBrandRecord.ctaStyle} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Brand Narrative</label>
                  <textarea
                    name="brandText"
                    defaultValue={selectedBrandRecord.brandText ?? ""}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-5 text-sm focus:outline-none focus:border-sky-500/50 transition-all"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
                      <Layout size={14}/> Brand Logo URL
                    </label>
                    <input
                      name="logoUrl"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500/50 transition-all"
                      placeholder="https://..."
                    />
                  </div>
                  <label className="space-y-2">
                    <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
                      <Layout size={14}/> Upload Brand Logo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => void handleLogoUpload(e.target.files?.[0] ?? null)}
                      className="w-full cursor-pointer bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-xs file:font-bold file:text-black hover:border-sky-500/30 transition-all"
                    />
                    {logoFileName && <p className="text-xs text-gray-500">Selected: {logoFileName}</p>}
                  </label>
                </div>

                {profileSaveError && (
                  <p className="text-xs text-red-400">{profileSaveError}</p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <p className="text-[10px] text-gray-600 italic">* Changes affect all future draft generations.</p>
                  <button
                    type="submit"
                    disabled={saveProfileMutation.isPending || isLogoUploading}
                    className="bg-sky-500 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-sky-400 transition-all disabled:opacity-50"
                  >
                    {saveProfileMutation.isPending ? "Syncing..." : isLogoUploading ? "Uploading Logo..." : "Commit Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-10 text-center border border-dashed border-white/5 rounded-[2rem]">
                <p className="text-sm text-gray-600 italic">Select Edit Metadata to configure brand-specific AI parameters.</p>
              </div>
            )}
          </section>

          
          <section className="rounded-[2.5rem] border border-white/5 bg-white/[0.01] p-8">
            <div className="mb-8">
              <h3 className="text-xl font-serif font-light">External Uplinks</h3>
              <p className="text-xs text-gray-500 mt-1">Status of authorized social media pipelines.</p>
            </div>
            
            <SocialConnections
              brandId={activeBrand?._id}
              oauthStatus={oauthStatus}
              oauthProvider={oauthProvider}
            />
          </section>
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-2 rounded-2xl bg-white/5 border border-white/5">
      <span className="text-lg font-serif">{value}</span>
      <span className="text-[9px] uppercase tracking-tighter text-gray-500 font-bold">{label}</span>
    </div>
  );
}

function ConfigInput({ icon, name, label, defaultValue }: { icon: ReactNode, name: string, label: string, defaultValue?: string }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
        {icon} {label}
      </label>
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500/50 transition-all"
      />
    </div>
  );
}
