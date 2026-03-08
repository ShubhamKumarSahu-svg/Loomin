import type { Request, Response } from "express";
import axios from "axios";
import { randomUUID } from "crypto";
import { Post } from "../models/postModel.js";
import { Brand } from "../models/brandModel.js";
import { createNotification } from "../services/notificationService.js";
import { persistImageUrl } from "../lib/cloudinary.js";

type ReviewStatus = "draft" | "awaiting_review" | "published" | "rejected";
type Platform = "linkedin" | "instagram" | "reddit" | "facebook";

interface GenerateBody {
  brandId?: string;
  userId?: string;
  userEmail?: string;
  brand_name?: string;
  topic?: string;
  tone?: string;
  post_details?: string;
  context?: string;
  image_preference?: string;
  image_prompt?: string;
  reference_image_url?: string;
  platforms?: Platform[];
}

interface PublishBody {
  scheduled_time?: string | null;
  workflow1_output?: Workflow1Output;
  workflow1?: Workflow1Output;
}

interface Workflow1Output {
  user_id?: string;
  image_url?: string;
  content?: Partial<Record<Platform, string>>;
  title?: {
    default?: string;
    reddit?: string;
  };
  tags?: string[];
  platforms?: Platform[];
  scheduled_time?: string | null;
}

interface Workflow2PublishPayload {
  user_id: string;
  image_url: string;
  content: Partial<Record<Platform, string>>;
  title: {
    default: string;
    reddit: string;
  };
  tags: string[];
  platforms: Platform[];
  scheduled_time: string | null;
}

interface Workflow2Output {
  user_id?: string | number;
  batch_id?: string;
  image_url?: string;
  content?: Record<string, unknown>;
  results?: Array<Record<string, unknown>>;
  platform_posts?: Partial<Record<Platform, string | null>>;
  status?: "active" | "paused" | "deleted";
  version?: number;
  tracking?: Record<string, unknown>;
  analytics?: Record<string, unknown>;
  old_id?: string;
  ai_response?: Record<string, unknown>;
}

interface Workflow1Input {
  userId: string;
  userEmail: string;
  brand_name: string;
  topic: string;
  tone: string;
  post_details: string;
  context: string;
  image_preference: string;
  image_prompt: string;
  reference_image_url: string;
  platforms?: Platform[];
}

const normalizeWebhookData = <T>(data: unknown): T => {
  if (Array.isArray(data) && data.length > 0) return data[0] as T;
  return data as T;
};

const safeText = (value: unknown): string | undefined => {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
};

const isDataImageUrl = (value: string): boolean => /^data:image\//i.test(value);

const parsePlatforms = (value: unknown): Platform[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const allowed: Platform[] = ["linkedin", "instagram", "reddit", "facebook"];
  const normalized = value.filter((item): item is Platform => {
    return typeof item === "string" && allowed.includes(item as Platform);
  });
  if (normalized.length === 0) return undefined;
  return Array.from(new Set(normalized));
};

const platformsFromContent = (
  content: Partial<Record<Platform, string>> | undefined
): Platform[] => {
  if (!content || typeof content !== "object") return [];
  return (["linkedin", "instagram", "reddit", "facebook"] as const).filter((platform) => {
    const text = content[platform];
    return typeof text === "string" && text.trim().length > 0;
  });
};

const normalizePlatformPosts = (
  value: unknown
): Partial<Record<Platform, string | null>> | undefined => {
  if (!value || typeof value !== "object") return undefined;
  const input = value as Record<string, unknown>;
  const keys: Platform[] = ["linkedin", "instagram", "reddit", "facebook"];
  const output: Partial<Record<Platform, string | null>> = {};

  for (const key of keys) {
    const raw = input[key];
    if (typeof raw === "string" && raw.trim().length > 0) {
      output[key] = raw.trim();
      continue;
    }
    if (raw === null) {
      output[key] = null;
    }
  }

  return Object.keys(output).length > 0 ? output : undefined;
};

const getSuccessfulPlatformsFromWorkflow2 = (
  payload: Workflow2Output | undefined
): Platform[] => {
  const successful = new Set<Platform>();
  const allowed: Platform[] = ["linkedin", "instagram", "reddit", "facebook"];

  if (Array.isArray(payload?.results)) {
    for (const result of payload.results) {
      const platform = result?.platform;
      const success = result?.success;
      if (
        typeof platform === "string" &&
        allowed.includes(platform as Platform) &&
        success === true
      ) {
        successful.add(platform as Platform);
      }
    }
  }

  const normalizedPosts = normalizePlatformPosts(payload?.platform_posts);
  if (normalizedPosts) {
    for (const [platform, postId] of Object.entries(normalizedPosts)) {
      if (
        allowed.includes(platform as Platform) &&
        typeof postId === "string" &&
        postId.trim().length > 0
      ) {
        successful.add(platform as Platform);
      }
    }
  }

  return Array.from(successful);
};

const toReviewStatus = (value: unknown): ReviewStatus => {
  if (value === "published") return "published";
  if (value === "draft") return "draft";
  if (value === "rejected") return "rejected";
  return "awaiting_review";
};

const extractWorkflow1FromBody = (body: PublishBody | undefined): Workflow1Output | undefined => {
  if (!body || typeof body !== "object") return undefined;

  if (body.workflow1_output && typeof body.workflow1_output === "object") {
    return body.workflow1_output;
  }

  if (body.workflow1 && typeof body.workflow1 === "object") {
    return body.workflow1;
  }


  if ("content" in body && typeof (body as { content?: unknown }).content === "object") {
    return body as Workflow1Output;
  }

  return undefined;
};

const mapPostToFrontend = (post: {
  _id: string | { toString(): string };
  brandId: string;
  content: Record<string, unknown> | string;
  image_url?: string;
  platform_posts?: Partial<Record<Platform, string | null>>;
  review_status?: ReviewStatus;
  created_at: Date;
  published_at?: Date;
  ai_response?: Record<string, unknown>;
  analytics?: Record<string, unknown>;
}) => {
  const reviewStatus = toReviewStatus(post.review_status);
  const postId = typeof post._id === "string" ? post._id : post._id.toString();
  const drafts = Object.entries(post.content ?? {})
    .filter(([platform]) => platform === "linkedin" || platform === "instagram" || platform === "reddit")
    .filter(([, text]) => typeof text === "string" && text.trim().length > 0)
    .map(([platform, text]) => ({
      platform: platform as "linkedin" | "instagram" | "reddit",
      content: text as string,
      imageUrl: safeText(post.image_url),
      hashtags: [],
      version: 1,
      status: reviewStatus,
      aiGenerated: true,
      updatedAt: post.created_at.toISOString(),
    }));

  const fallbackContent = (() => {
    if (typeof post.content === "string") return post.content;
    if (!post.content || typeof post.content !== "object") return "Untitled";
    const values = Object.values(post.content).filter((v): v is string => typeof v === "string");
    return values[0] ?? "Untitled";
  })();

  return {
    id: postId,
    brandId: post.brandId,
    masterBrief: {
      topic: fallbackContent.slice(0, 80) || "Untitled",
      goal: "Engagement",
      targetAudience: "General audience",
    },
    platformDrafts:
      drafts.length > 0
        ? drafts
        : [
            {
              platform: "linkedin" as const,
              content: fallbackContent,
              imageUrl: safeText(post.image_url),
              hashtags: [],
              version: 1,
              status: reviewStatus,
              aiGenerated: true,
              updatedAt: post.created_at.toISOString(),
            },
          ],
    overallStatus: reviewStatus,
    imageUrl: safeText(post.image_url),
    createdAt: post.created_at.toISOString(),
    aiResponse: post.ai_response,
    analytics: post.analytics,
    ...(post.published_at ? { publishedAt: post.published_at.toISOString() } : {}),
  };
};

interface ResolvedBrand {
  _id: string;
  brand_name: string;
  brand_colors?: string[];
  brand_style?: string;
  brand_text?: string;
  brand_voice?: string;
  cta_style?: string;
  logo_url?: string;
  logo_position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
}

const getBrandByIdForUser = async (brandId: string, userId: string) => {
  return Brand.findOne({
    _id: brandId,
    userId,
  })
    .select("_id brand_name brand_colors brand_style brand_text brand_voice cta_style logo_url logo_position")
    .lean();
};

const getBrandByNameForUser = async (brandName: string, userId: string) => {
  return Brand.findOne({
    brand_name: brandName,
    userId,
  })
    .select("_id brand_name brand_colors brand_style brand_text brand_voice cta_style logo_url logo_position")
    .lean();
};

export const generatePostDraft = async (
  req: Request<{}, {}, GenerateBody>,
  res: Response
): Promise<void> => {
  try {
    console.log("generatePostDraft request body:", req.body);
    const workflow1Url = process.env.N8N_WORKFLOW_1_URL;
    if (!workflow1Url) {
      res.status(500).json({ message: "N8N_WORKFLOW_1_URL is not configured" });
      return;
    }

    const requestedBrandId = safeText(req.body.brandId);
    const requestedBrandName = safeText(req.body.brand_name);
    const authUserId = req.user!._id.toString();

    let brand: ResolvedBrand | null = null;
    if (requestedBrandId) {
      brand = (await getBrandByIdForUser(requestedBrandId, authUserId)) as ResolvedBrand | null;
    } else if (requestedBrandName) {
      brand = (await getBrandByNameForUser(requestedBrandName, authUserId)) as ResolvedBrand | null;
    } else {
      res.status(400).json({ message: "brand_name is required when brandId is not provided" });
      return;
    }

    if (!brand) {
      res.status(404).json({ message: "Brand not found" });
      return;
    }
    
    const requestedPlatforms = parsePlatforms(req.body.platforms);
    const incomingReferenceImage = safeText(req.body.reference_image_url) ?? "";
    const persistedReferenceImageUrl = isDataImageUrl(incomingReferenceImage)
      ? (await persistImageUrl(incomingReferenceImage, {
          folder: "loomin-ai/reference-images",
        })) ?? incomingReferenceImage
      : incomingReferenceImage;

    const workflow1Payload: Workflow1Input = {
      userId: safeText(req.body.userId) ?? authUserId,
      userEmail: safeText(req.body.userEmail) ?? req.user!.email,
      brand_name: safeText(req.body.brand_name) ?? safeText(brand.brand_name) ?? "",
      topic: safeText(req.body.topic) ?? "",
      tone: safeText(req.body.tone) ?? "",
      post_details: safeText(req.body.post_details) ?? "",
      context: safeText(req.body.context) ?? "",
      image_preference: safeText(req.body.image_preference) ?? "",
      image_prompt: safeText(req.body.image_prompt) ?? "",
      reference_image_url: persistedReferenceImageUrl,
      ...(requestedPlatforms ? { platforms: requestedPlatforms } : {}),
    };

    if (
      !workflow1Payload.userId ||
      !workflow1Payload.userEmail ||
      !workflow1Payload.brand_name ||
      !workflow1Payload.topic ||
      !workflow1Payload.tone ||
      !workflow1Payload.context
    ) {
      res.status(400).json({
        message:
          "Required fields: userId, userEmail, brand_name, topic, tone, context",
      });
      return;
    }

    const workflow1Res = await axios.post(workflow1Url, workflow1Payload, { timeout: 120000 });
    const workflow1Data = normalizeWebhookData<Workflow1Output>(workflow1Res.data);
    console.log("Workflow 1 output:", workflow1Data);
    if (!workflow1Data || typeof workflow1Data !== "object" || !workflow1Data.content) {
      res.status(502).json({ message: "Workflow 1 returned invalid payload" });
      return;
    }

    const resolvedPlatforms =
      workflow1Data.platforms && workflow1Data.platforms.length > 0
        ? workflow1Data.platforms
        : requestedPlatforms ?? [];

    const persistedImageUrl = await persistImageUrl(
      safeText(workflow1Data.image_url) ?? persistedReferenceImageUrl,
      {
      folder: "loomin-ai/drafts",
      }
    );

    const createPayload: Record<string, unknown> = {
      _id: randomUUID(),
      batch_id: randomUUID(),
      user_id: authUserId,
      brandId: brand._id,
      content: workflow1Data.content ?? {},
      image_url: persistedImageUrl,
      platforms: resolvedPlatforms,
      platform_posts: {},
      results: [],
      old_id: `post_${Date.now()}`,
      review_status: "draft",
      ai_response: {},
      tracking: {
        enabled: true,
        interval_hours: 48,
      },
      status: "active",
      version: 1,
    };

    const postDoc = (await Post.create(createPayload)) as { _id: string | { toString(): string } };
    const createdPost = await Post.findById(postDoc._id).lean();
    if (!createdPost) {
      res.status(500).json({ message: "Draft saved but could not be loaded" });
      return;
    }

    await createNotification({
      userId: authUserId,
      brandId: brand._id,
      postId: createdPost._id,
      type: "post_generated",
      title: "Post generated",
      message: `A new post draft for brand "${brand.brand_name}" is ready for review.`,
      metadata: {
        topic: workflow1Payload.topic,
      },
      eventKey: `post_generated:${authUserId}:${createdPost._id}`,
    });

    res.status(201).json({
      post: mapPostToFrontend(createdPost),
      workflow1: workflow1Data,
    });
  } catch (error) {
    console.error("generatePostDraft error:", error);
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ??
        error.message ??
        "Workflow 1 failed";
      res.status(502).json({ message });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const publishDraftPost = async (
  req: Request<{ postId: string }, {}, PublishBody>,
  res: Response
): Promise<void> => {
  try {
    const workflow2Url = process.env.N8N_WORKFLOW_2_URL;
    if (!workflow2Url) {
      res.status(500).json({ message: "N8N_WORKFLOW_2_URL is not configured" });
      return;
    }

    const { postId } = req.params;
    if (!postId) {
      res.status(400).json({ message: "postId is required" });
      return;
    }

    const workflow1FromBody = extractWorkflow1FromBody(req.body);

    const post = await Post.findOne({
      _id: postId,
      user_id: req.user!._id.toString(),
      status: { $ne: "deleted" },
    }).lean();

    if (!post && !workflow1FromBody) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const workflow1Raw =
      workflow1FromBody ??
      ({
        content: post?.content,
        platforms: Array.isArray(post?.platforms)
          ? post?.platforms.filter(
              (platform): platform is Platform =>
                platform === "linkedin" || platform === "instagram" || platform === "reddit"
            )
          : undefined,
        image_url: safeText(post?.image_url),
      } as Workflow1Output);
    const workflow1Data = (workflow1Raw ?? {}) as Workflow1Output;
    if (!workflow1Data.content) {
      res.status(400).json({
        message: "workflow1_output with content is required in body or stored on the draft",
      });
      return;
    }

    const requestedSchedule = req.body?.scheduled_time ? new Date(req.body.scheduled_time) : null;
    if (req.body?.scheduled_time && Number.isNaN(requestedSchedule?.getTime())) {
      res.status(400).json({ message: "scheduled_time must be a valid ISO datetime" });
      return;
    }

    const resolvedContent: Partial<Record<Platform, string>> =
      workflow1Data.content && typeof workflow1Data.content === "object"
        ? workflow1Data.content
        : {};

    const resolvedPlatforms =
      parsePlatforms(workflow1Data.platforms) ??
      parsePlatforms(post?.platforms) ??
      platformsFromContent(resolvedContent);

    const resolvedTags = Array.isArray(workflow1Data.tags)
      ? workflow1Data.tags.filter(
          (tag): tag is string => typeof tag === "string" && tag.trim().length > 0
        )
      : [];

    const resolvedDefaultTitle =
      safeText(workflow1Data.title?.default) ??
      Object.values(resolvedContent).find(
        (value): value is string => typeof value === "string" && value.trim().length > 0
      )?.slice(0, 80) ??
      "Untitled";
    const resolvedRedditTitle =
      safeText(workflow1Data.title?.reddit) ?? resolvedDefaultTitle;

    const persistedImageUrl =
      (await persistImageUrl(safeText(workflow1Data.image_url) ?? safeText(post?.image_url), {
        folder: "loomin-ai/publish",
      })) ?? "";

    const publishPayload: Workflow2PublishPayload = {
      user_id: safeText(workflow1Data.user_id) ?? req.user!._id.toString(),
      image_url: persistedImageUrl,
      content: resolvedContent,
      title: {
        default: resolvedDefaultTitle,
        reddit: resolvedRedditTitle,
      },
      tags: resolvedTags,
      platforms: resolvedPlatforms,
      scheduled_time: requestedSchedule
        ? requestedSchedule.toISOString()
        : workflow1Data.scheduled_time ?? null,
    };
    console.log("Publish payload:", publishPayload);

    let workflow2Data: Workflow2Output;
    try {
      const workflow2Res = await axios.post(workflow2Url, publishPayload, { timeout: 120000 });
      workflow2Data = normalizeWebhookData<Workflow2Output>(workflow2Res.data);
    } catch (publishError) {
      if (!axios.isAxiosError(publishError)) {
        throw publishError;
      }

      const fallbackData = normalizeWebhookData<Workflow2Output>(
        publishError.response?.data
      );
      const successfulPlatforms = getSuccessfulPlatformsFromWorkflow2(fallbackData);

      if (successfulPlatforms.length === 0) {
        throw publishError;
      }

      // Some n8n executions return HTTP 400 even when one or more platforms publish successfully.
      workflow2Data = fallbackData;
    }
    console.log("Workflow 2 output:", workflow2Data);

    if (!post) {
      res.status(200).json({
        workflow2: workflow2Data,
      });
      return;
    }

    const now = new Date();
    const successfulPlatforms = getSuccessfulPlatformsFromWorkflow2(workflow2Data);
    const hasSuccessfulPublish = successfulPlatforms.length > 0;
    const persistedWorkflow2Image = await persistImageUrl(workflow2Data?.image_url, {
      folder: "loomin-ai/publish",
    });

    const updated = await Post.findOneAndUpdate(
      { _id: postId, user_id: req.user!._id.toString() },
      {
        $set: {
          ...(workflow2Data?.batch_id ? { batch_id: workflow2Data.batch_id } : {}),
          ...(persistedWorkflow2Image ? { image_url: persistedWorkflow2Image } : {}),
          ...(workflow2Data?.content ? { content: workflow2Data.content } : {}),
          ...(Array.isArray(workflow2Data?.results) ? { results: workflow2Data.results } : {}),
          ...(normalizePlatformPosts(workflow2Data?.platform_posts)
            ? { platform_posts: normalizePlatformPosts(workflow2Data?.platform_posts) }
            : {}),
          ...(workflow2Data?.status ? { status: workflow2Data.status } : {}),
          ...(typeof workflow2Data?.version === "number"
            ? { version: workflow2Data.version }
            : {}),
          ...(workflow2Data?.tracking ? { tracking: workflow2Data.tracking } : {}),
          ...(workflow2Data?.analytics ? { analytics: workflow2Data.analytics } : {}),
          ...(workflow2Data?.old_id ? { old_id: workflow2Data.old_id } : {}),
          ...(workflow2Data?.ai_response ? { ai_response: workflow2Data.ai_response } : {}),
          ...(hasSuccessfulPublish
            ? {
                review_status: "published",
                published_at: now,
              }
            : {}),
        },
      },
      { new: true }
    ).lean();

    if (!updated) {
      res.status(404).json({ message: "Post not found after publishing" });
      return;
    }

    const authUserId = req.user!._id.toString();
    if (hasSuccessfulPublish) {
      const displayPlatforms = successfulPlatforms
        .map((platform) => platform.charAt(0).toUpperCase() + platform.slice(1))
        .join(", ");
      await createNotification({
        userId: authUserId,
        brandId: updated.brandId,
        postId: updated._id,
        type: "post_published",
        title: "Post published",
        message: `Published successfully on ${displayPlatforms}.`,
        metadata: {
          publishedAt: updated.published_at?.toISOString(),
          successfulPlatforms,
          results: workflow2Data?.results,
        },
        eventKey: `post_published:${authUserId}:${updated._id}`,
      });
    }

    res.status(200).json({
      post: mapPostToFrontend(updated),
      workflow2: workflow2Data,
    });
  } catch (error) {
    console.error("publishDraftPost error:", error);
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ??
        error.message ??
        "Workflow 2 failed";
      res.status(502).json({ message });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPosts = async (
  req: Request<{}, {}, {}, { brandId?: string }>,
  res: Response
): Promise<void> => {
  try {
    const brandId = req.query.brandId;
    if (!brandId) {
      res.status(400).json({ message: "brandId query param is required" });
      return;
    }

    const posts = await Post.find({
      brandId,
      user_id: req.user!._id.toString(),
      status: { $ne: "deleted" },
    })
      .sort({ created_at: -1 })
      .lean();

    res.status(200).json(posts.map((post) => mapPostToFrontend(post)));
  } catch (error) {
    console.error("getPosts error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const approvePost = async (
  req: Request<{ postId: string }>,
  res: Response
): Promise<void> => {
  try {
    const { postId } = req.params;
    if (!postId) {
      res.status(400).json({ message: "postId is required" });
      return;
    }

    const post = await Post.findOneAndUpdate(
      {
        _id: postId,
        user_id: req.user!._id.toString(),
        status: { $ne: "deleted" },
      },
      {
        $set: {
          review_status: "published",
          published_at: new Date(),
        },
      },
      { new: true }
    ).lean();

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const authUserId = req.user!._id.toString();
    await createNotification({
      userId: authUserId,
      brandId: post.brandId,
      postId: post._id,
      type: "post_published",
      title: "Post published",
      message: `A post for brand "${post.brandId}" was approved and published.`,
      metadata: {
        publishedAt: post.published_at?.toISOString(),
      },
      eventKey: `post_published:${authUserId}:${post._id}`,
    });

    res.status(200).json(mapPostToFrontend(post));
  } catch (error) {
    console.error("approvePost error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
