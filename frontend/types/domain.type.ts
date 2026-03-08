export type PostStatus =
  | "draft"
  | "awaiting_review"
  | "published"
  | "rejected";

export type Platform = "linkedin" | "instagram" | "reddit";

export interface Draft {
  platform: Platform;
  content: string;
  imageUrl?: string;
  hashtags: string[];
  version: number;
  status: PostStatus;
  aiGenerated: boolean;
  updatedAt: string;
}

export interface Post {
  id: string;
  brandId: string;
  imageUrl?: string;
  masterBrief: {
    topic: string;
    goal: string;
    targetAudience: string;
  };
  platformDrafts: Draft[];
  overallStatus: PostStatus;
  createdAt: string;
  publishedAt?: string;
  aiResponse?: Record<string, unknown>;
  analytics?: Record<string, unknown>;
}

export interface Brand {
  id: string;
  name: string;
  description: string;
  tone: string;
}

export interface AnalyticsSnapshot {
  postId: string;
  platform: Platform;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  snapshotAt: string;
}
