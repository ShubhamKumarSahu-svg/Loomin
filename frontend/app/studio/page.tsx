"use client";

import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  CalendarClock, ChevronDown, ChevronUp, Plus, Send, X, 
  Sparkles, Layout, CheckCircle2
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useGlobalStore } from "@/state/global.store";
import { useAuthStore } from "@/state/auth.store";
import ThemedSelect from "@/components/ui/themed-select";
import {
  generateDraftPost,
  getPosts,
  publishDraftPost,
  type GenerateWorkflow1Payload,
  type Workflow1OutputPayload,
  type Workflow2OutputPayload,
} from "@/services/api/posts.api";
import { getBrandConnections } from "@/services/api/brand.api";
import { Post } from "@/types/domain.type";
import { useBrandStore } from "@/state/brand.store";

type PublishPlatform = "linkedin" | "instagram";

interface FormState {
  topic: string;
  tone: string;
  postDetails: string;
  context: string;
  platforms: PublishPlatform[];
  imagePreference: "" | "use_image" | "generate_new" | "use_reference" | "no_image";
  imagePrompt: string;
  referenceImageUrl: string;
  referenceImageFile: File | null;
}

const initialState: FormState = {
  topic: "",
  tone: "",
  postDetails: "",
  context: "",
  platforms: [],
  imagePreference: "",
  imagePrompt: "",
  referenceImageUrl: "",
  referenceImageFile: null,
};

const extractSuccessfulPublishPlatforms = (
  workflow2: Workflow2OutputPayload | undefined
): PublishPlatform[] => {
  const successful = new Set<PublishPlatform>();
  for (const result of workflow2?.results ?? []) {
    if ((result.platform === "linkedin" || result.platform === "instagram") && result.success === true) {
      successful.add(result.platform);
    }
  }
  const platformPosts = workflow2?.platform_posts ?? {};
  for (const platform of ["linkedin", "instagram"] as const) {
    const postId = platformPosts[platform];
    if (typeof postId === "string" && postId.trim().length > 0) {
      successful.add(platform);
    }
  }
  return Array.from(successful);
};

export default function StudioPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const activeBrand = useBrandStore((s) => s.activeBrand);
  const addNotification = useGlobalStore((s) => s.addNotification);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialState);
  const [scheduleByPost, setScheduleByPost] = useState<Record<string, string>>({});
  const [selectedPlatformsByPost, setSelectedPlatformsByPost] = useState<Record<string, PublishPlatform[]>>({});
  const [expandedByPost, setExpandedByPost] = useState<Record<string, boolean>>({});
  const [editedContentByPost, setEditedContentByPost] = useState<Record<string, Record<string, string>>>({});
  const generatingToastIdRef = useRef<string | number | null>(null);
  const publishingToastIdRef = useRef<string | number | null>(null);

  const resetDialogForm = () => setForm(initialState);
  const openDialog = () => {
    if (!activeBrand?._id) {
      toast.error("Please select a brand first.");
      return;
    }
    resetDialogForm();
    setOpen(true);
  };
  const closeDialog = () => {
    setOpen(false);
    resetDialogForm();
  };

  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: ["posts", activeBrand?._id],
    queryFn: () => getPosts(activeBrand?._id as string),
    enabled: !!activeBrand?._id,
  });

  const { data: connections = [] } = useQuery({
    queryKey: ["brand-connections", activeBrand?._id],
    queryFn: () => getBrandConnections(activeBrand!._id),
    enabled: Boolean(activeBrand?._id),
  });

  const connectedPublishPlatforms = useMemo(() => {
    const connectedSet = new Set(connections.map((connection) => connection.platform));
    const platforms: PublishPlatform[] = [];
    if (connectedSet.has("linkedin")) platforms.push("linkedin");
    if (connectedSet.has("instagram")) platforms.push("instagram");
    return platforms;
  }, [connections]);

  const draftPosts = useMemo(
    () => posts.filter((post) => post.overallStatus !== "published"),
    [posts]
  );

  const getAvailablePlatformsForPost = (post: Post): PublishPlatform[] => {
    const inDraft = new Set(post.platformDrafts.map((draft) => draft.platform));
    return connectedPublishPlatforms.filter((platform) => inDraft.has(platform));
  };

  const getSelectedPlatformsForPost = (post: Post): PublishPlatform[] => {
    const available = getAvailablePlatformsForPost(post);
    if (available.length === 0) return [];
    const existing = selectedPlatformsByPost[post.id] ?? available;
    const filtered = existing.filter((platform) => available.includes(platform));
    return filtered.length > 0 ? filtered : available;
  };

  const canSubmit =
    !!user?._id &&
    !!user?.email &&
    form.topic.trim().length > 0 &&
    form.tone.trim().length > 0 &&
    form.context.trim().length > 0 &&
    form.platforms.length > 0;

  const generateMutation = useMutation({
    mutationFn: async (payload: GenerateWorkflow1Payload) => generateDraftPost(payload),
    onMutate: () => {
      closeDialog();
      generatingToastIdRef.current = toast.loading("AI is crafting your draft...");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setForm(initialState);
      toast.success("Draft generated successfully.", { id: generatingToastIdRef.current ?? undefined });
      generatingToastIdRef.current = null;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate draft.", { id: generatingToastIdRef.current ?? undefined });
      generatingToastIdRef.current = null;
    },
  });

  const uploadReferenceImageToCloudinary = async (file: File): Promise<string> => {
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
    formData.set("folder", "loomin-ai/reference-images");

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

  const handleGenerateDraft = async () => {
    if (!activeBrand) {
      toast.error("Please select a brand first.");
      return;
    }
    if (!user?._id || !user?.email) {
      toast.error("Please log in again to generate drafts.");
      return;
    }
    let referenceImage = form.referenceImageUrl.trim();
    if (form.referenceImageFile) {
      const uploadToastId = toast.loading("Uploading reference image...");
      try {
        referenceImage = await uploadReferenceImageToCloudinary(form.referenceImageFile);
        toast.success("Reference image uploaded.", { id: uploadToastId });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not upload selected image file.", { id: uploadToastId });
        return;
      }
    }
    const payload: GenerateWorkflow1Payload = {
      brandId: activeBrand._id,
      userId: user._id,
      userEmail: user.email,
      brand_name: activeBrand.name?.trim() ?? "",
      topic: form.topic.trim(),
      tone: form.tone.trim(),
      post_details: form.postDetails.trim(),
      context: form.context.trim(),
      platforms: form.platforms,
      image_preference: form.imagePreference,
      image_prompt: form.imagePrompt.trim(),
      reference_image_url: referenceImage,
    };
    generateMutation.mutate(payload);
  };

  const publishMutation = useMutation({
    mutationFn: async ({ postId, scheduledAt, workflow1Output }: { postId: string; scheduledAt?: string; workflow1Output?: Workflow1OutputPayload; }) => {
      const scheduledIso = scheduledAt ? new Date(scheduledAt).toISOString() : null;
      return publishDraftPost(postId, scheduledIso, workflow1Output);
    },
    onMutate: () => { publishingToastIdRef.current = toast.loading("Publishing post..."); },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", activeBrand?._id] });
      const successfulPlatforms = extractSuccessfulPublishPlatforms(response.workflow2);
      if (successfulPlatforms.length > 0) {
        const prettyPlatforms = successfulPlatforms.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(", ");
        const message = `Post published on ${prettyPlatforms}.`;
        toast.success(message, { id: publishingToastIdRef.current ?? undefined });
        addNotification({ id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${variables.postId}`, message, type: "success" });
        publishingToastIdRef.current = null;
        return;
      }
      toast.success("Publish request completed.", { id: publishingToastIdRef.current ?? undefined });
      publishingToastIdRef.current = null;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to publish post.", { id: publishingToastIdRef.current ?? undefined });
      publishingToastIdRef.current = null;
    },
  });

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-10 bg-[#0A0A0A] text-white min-h-screen">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sky-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            <Sparkles size={14} /> Agent Workspace
          </div>
          <h1 className="text-4xl font-serif font-light tracking-tight">Content Studio</h1>
          <p className="text-gray-500 text-sm max-w-md leading-relaxed">
            Synthesize new content and orchestrate your social calendar.
          </p>
        </div>
        <button
          onClick={openDialog}
          className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={18} /> Generate Draft
        </button>
      </div>

      
      <div className="inline-flex flex-wrap items-center gap-6 rounded-2xl border border-white/5 bg-white/5 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3 border-r border-white/10 pr-6">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Brand</span>
          <span className="text-sm font-medium">{activeBrand?.name ?? "None"}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Operator</span>
          <span className="text-sm font-medium text-gray-300">{user?.email ?? "N/A"}</span>
        </div>
      </div>

      
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4">
          <Layout size={18} className="text-gray-500" />
          <h2 className="text-lg font-medium tracking-tight">Draft Queue</h2>
        </div>
        
        {draftPosts.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-white/10 py-24 text-center">
            <p className="text-gray-500 text-sm font-light italic">No pending drafts in the synthesis engine.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {draftPosts.map((post) => {
              const availablePlatforms = getAvailablePlatformsForPost(post);
              const selectedPlatforms = getSelectedPlatformsForPost(post);
              const isExpanded = Boolean(expandedByPost[post.id]);
              return (
                <div
                  key={post.id}
                  className={`group overflow-hidden rounded-[1.5rem] border transition-all duration-300 ${
                    isExpanded ? "border-white/20 bg-[#121212]" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-medium text-white">{post.masterBrief.topic}</p>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Status: {post.overallStatus}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="hidden md:block text-[10px] text-gray-500 uppercase tracking-widest">
                          {post.platformDrafts.map((d) => d.platform).join(" â€¢ ")}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedByPost((prev) => {
                              const next = !prev[post.id];

                              if (next && !editedContentByPost[post.id]) {
                                setEditedContentByPost((prevContent) => ({
                                  ...prevContent,
                                  [post.id]: post.platformDrafts.reduce<Record<string, string>>((acc, draft) => {
                                    acc[draft.platform] = draft.content;
                                    return acc;
                                  }, {}),
                                }));
                              }

                              return { ...prev, [post.id]: next };
                            });
                          }}
                          className="flex items-center gap-1 rounded-full border border-white/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:bg-white hover:text-black transition-all"
                        >
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          {isExpanded ? "Close" : "Review"}
                        </button>
                      </div>
                    </div>

                    {!isExpanded && (
                      <p className="mt-4 text-sm text-gray-500 line-clamp-1 italic font-light">
                        {post.platformDrafts[0]?.content}
                      </p>
                    )}

                    {isExpanded && (
                      <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-top-2">
                        {post.imageUrl && (
                          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
                            <Image src={post.imageUrl} alt="Draft Preview" fill unoptimized className="object-contain" />
                          </div>
                        )}

                        <div className="space-y-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Synthesized Content</p>
                          <div className="grid gap-4">
                            {post.platformDrafts.map((draft) => (
                              <article key={`${post.id}-${draft.platform}`} className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
                                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-sky-500">{draft.platform}</p>
                                <textarea
                                  value={editedContentByPost[post.id]?.[draft.platform] ?? draft.content}
                                  onChange={(e) =>
                                    setEditedContentByPost((prev) => ({
                                      ...prev,
                                      [post.id]: {
                                        ...(prev[post.id] ?? {}),
                                        [draft.platform]: e.target.value,
                                      },
                                    }))
                                  }
                                  className="w-full bg-transparent resize-none outline-none whitespace-pre-wrap text-sm leading-relaxed text-gray-300 font-light"
                                />
                              </article>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-end gap-8 pt-8 border-t border-white/5">
                          <div className="flex-1 space-y-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Publishing To</p>
                            {availablePlatforms.length === 0 ? (
                              <p className="text-xs text-amber-500/80 italic">Connect accounts in settings to publish.</p>
                            ) : (
                              <div className="flex flex-wrap gap-6">
                                {availablePlatforms.map((platform) => (
                                  <label key={platform} className="flex items-center gap-3 cursor-pointer group/label">
                                    <div className="relative">
                                      <input
                                        type="checkbox"
                                        className="peer hidden"
                                        checked={selectedPlatforms.includes(platform)}
                                        onChange={(e) => {
                                          setSelectedPlatformsByPost((prev) => {
                                            const current = prev[post.id] ?? [];
                                            if (e.target.checked) return { ...prev, [post.id]: Array.from(new Set([...current, platform])) };
                                            return { ...prev, [post.id]: current.filter((item) => item !== platform) };
                                          });
                                        }}
                                      />
                                      <div className="h-5 w-5 rounded-md border border-white/10 transition-all peer-checked:bg-sky-500 peer-checked:border-sky-500 flex items-center justify-center">
                                        {selectedPlatforms.includes(platform) && <CheckCircle2 size={12} className="text-white" />}
                                      </div>
                                    </div>
                                    <span className="text-sm text-gray-400 capitalize group-hover/label:text-white">{platform}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Schedule Time (Optional)</p>
                            <div className="relative">
                              <CalendarClock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                              <input
                                type="datetime-local"
                                value={scheduleByPost[post.id] ?? ""}
                                onChange={(e) => setScheduleByPost((prev) => ({ ...prev, [post.id]: e.target.value }))}
                                className="bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-sm focus:outline-none focus:border-sky-500/50 transition-colors"
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const selectedContent = post.platformDrafts
                                .filter((draft) => selectedPlatforms.includes(draft.platform as PublishPlatform))
                                .reduce<NonNullable<Workflow1OutputPayload["content"]>>((acc, draft) => {
                                  acc[draft.platform] =
                                    editedContentByPost[post.id]?.[draft.platform] ?? draft.content;
                                  return acc;
                                }, {});
                              publishMutation.mutate({
                                postId: post.id,
                                scheduledAt: scheduleByPost[post.id],
                                workflow1Output: { content: selectedContent, platforms: selectedPlatforms },
                              });
                            }}
                            disabled={publishMutation.isPending || selectedPlatforms.length === 0}
                            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:grayscale px-10 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2"
                          >
                            <Send size={16} /> Deploy Post
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60">
          <div className="w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#121212] shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/5 px-8 py-6">
              <div>
                <h3 className="text-2xl font-serif">Workflow Configuration</h3>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">Stage 1: Synthesis Engine</p>
              </div>
              <button onClick={closeDialog} className="rounded-full bg-white/5 p-2 text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-8 py-8 space-y-6 custom-scrollbar">
              <label className="block space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Core Topic</span>
                <input
                  value={form.topic}
                  onChange={(e) => setForm((prev) => ({ ...prev, topic: e.target.value }))}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-sky-500/30 transition-all placeholder:text-gray-700"
                  placeholder="e.g. AI-driven growth for startups"
                />
              </label>

              <div className="grid gap-6 md:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Brand Voice</span>
                  <input
                    value={form.tone}
                    onChange={(e) => setForm((prev) => ({ ...prev, tone: e.target.value }))}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-sky-500/30 transition-all placeholder:text-gray-700"
                    placeholder="e.g. Provocative, Casual"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Visual Preference</span>
                  <ThemedSelect
                    value={form.imagePreference}
                    onChange={(nextValue) =>
                      setForm((prev) => ({
                        ...prev,
                        imagePreference: nextValue as FormState["imagePreference"],
                      }))
                    }
                    options={IMAGE_PREFERENCE_OPTIONS}
                    placeholder="Select preference"
                    buttonClassName="w-full rounded-2xl border-white/10 bg-white/5 px-5 py-4 text-white"
                  />
                </label>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Target Platforms</span>
                <div className="flex flex-wrap gap-6">
                  {(["linkedin", "instagram"] as const).map((platform) => (
                    <label key={platform} className="flex items-center gap-3 cursor-pointer group/label">
                      <input
                        type="checkbox"
                        className="hidden peer"
                        checked={form.platforms.includes(platform)}
                        onChange={(e) => setForm((prev) => {
                          if (e.target.checked) return { ...prev, platforms: Array.from(new Set([...prev.platforms, platform])) };
                          return { ...prev, platforms: prev.platforms.filter((item) => item !== platform) };
                        })}
                      />
                      <div className="h-5 w-5 rounded-md border border-white/10 transition-all peer-checked:bg-sky-500 peer-checked:border-sky-500 flex items-center justify-center">
                        {form.platforms.includes(platform) && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <span className="text-sm text-gray-400 capitalize group-hover/label:text-white transition-colors">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="block space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Post Details</span>
                <textarea
                  value={form.postDetails}
                  onChange={(e) => setForm((prev) => ({ ...prev, postDetails: e.target.value }))}
                  rows={3}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-sky-500/30 transition-all resize-none placeholder:text-gray-700"
                  placeholder="Drafting instructions..."
                />
              </label>

              <label className="block space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Strategic Context</span>
                <textarea
                  value={form.context}
                  onChange={(e) => setForm((prev) => ({ ...prev, context: e.target.value }))}
                  rows={3}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-sky-500/30 transition-all resize-none placeholder:text-gray-700"
                  placeholder="Context for the AI operator..."
                />
              </label>

              <div className="grid gap-6 md:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Image Prompt</span>
                  <input
                    value={form.imagePrompt}
                    onChange={(e) => setForm((prev) => ({ ...prev, imagePrompt: e.target.value }))}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-sky-500/30 transition-all"
                    placeholder="Nice Technical..."
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Reference URL</span>
                  <input
                    value={form.referenceImageUrl}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, referenceImageUrl: e.target.value, referenceImageFile: null }))
                    }
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-sky-500/30 transition-all"
                    placeholder="https://..."
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Or Upload Reference Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const nextFile = e.target.files?.[0] ?? null;
                    setForm((prev) => ({
                      ...prev,
                      referenceImageFile: nextFile,
                      referenceImageUrl: nextFile ? "" : prev.referenceImageUrl,
                    }));
                  }}
                  className="w-full cursor-pointer bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm text-gray-300 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-xs file:font-bold file:text-black hover:border-sky-500/30 transition-all"
                />
                {form.referenceImageFile && (
                  <p className="text-xs text-gray-400">
                    Selected: {form.referenceImageFile.name}
                  </p>
                )}
              </label>
            </div>

            <div className="flex items-center justify-end gap-6 border-t border-white/5 px-8 py-6 bg-white/[0.01]">
              <button onClick={closeDialog} className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateDraft}
                disabled={!canSubmit || generateMutation.isPending}
                className="bg-white text-black px-10 py-3 rounded-full text-sm font-bold transition-transform hover:scale-105 active:scale-95 disabled:opacity-30"
              >
                {generateMutation.isPending ? "Generating..." : "Synthesize Draft"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const IMAGE_PREFERENCE_OPTIONS: Array<{
  label: string;
  value: FormState["imagePreference"];
}> = [
  { label: "Use provided image", value: "use_image" },
  { label: "Generate new image", value: "generate_new" },
  { label: "Use reference image", value: "use_reference" },
  { label: "No image", value: "no_image" },
];