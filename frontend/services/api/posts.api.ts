import { apiRequest } from "@/services/api/client";
import { Post } from "@/types/domain.type";

export interface GenerateWorkflow1Payload {
  brandId?: string;
  userId?: string;
  userEmail?: string;
  brand_name?: string;
  topic: string;
  tone: string;
  post_details: string;
  context: string;
  image_preference: string;
  image_prompt: string;
  reference_image_url: string;
  platforms?: Array<"linkedin" | "instagram" | "reddit">;
}

export interface CreateAndPublishResponse {
  post: Post;
  workflow1: unknown;
}

export interface Workflow2OutputPayload {
  results?: Array<{
    platform?: string;
    success?: boolean;
    [key: string]: unknown;
  }>;
  platform_posts?: Partial<Record<"linkedin" | "instagram" | "reddit", string | null>>;
  [key: string]: unknown;
}

export interface PublishPostResponse {
  post?: Post;
  workflow2: Workflow2OutputPayload;
}

export interface Workflow1OutputPayload {
  user_id?: string;
  image_url?: string;
  content?: Partial<Record<"linkedin" | "instagram" | "reddit", string>>;
  title?: {
    default?: string;
    reddit?: string;
  };
  tags?: string[];
  platforms?: Array<"linkedin" | "instagram" | "reddit">;
  scheduled_time?: string | null;
}

export interface ImproveWorkflowPayload {
  userId: string;
  userEmail: string;
  brand_name: string;
  post_details: string;
  content: Partial<Record<"linkedin" | "instagram" | "reddit", string>>;
  title: {
    default: string;
    reddit?: string;
  };

  tags: string[];

  platforms: Array<"linkedin" | "instagram" | "reddit">;

  scheduled_time: string | null;

  platforms_to_edit?: Array<"linkedin" | "instagram" | "reddit">;

  human_preference?: string;

  image_preference?: string;

  image_prompt_current?: {
    subject?: string;
    environment?: string;
    lighting?: string;
    style?: string;
  };
}

export const getPosts = async (brandId: string): Promise<Post[]> => {
  const params = new URLSearchParams({ brandId });
  return apiRequest<Post[]>(`/api/posts?${params.toString()}`, {
    method: "GET",
  });
};

export const approvePost = async (postId: string): Promise<Post> => {
  return apiRequest<Post>(`/api/posts/${postId}/approve`, {
    method: "POST",
  });
};

export const generateDraftPost = async (
  payload: GenerateWorkflow1Payload
): Promise<CreateAndPublishResponse> => {
  return apiRequest<CreateAndPublishResponse>("/api/posts/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const publishDraftPost = async (
  postId: string,
  scheduled_time?: string | null,
  workflow1_output?: Workflow1OutputPayload
): Promise<PublishPostResponse> => {
  return apiRequest<PublishPostResponse>(`/api/posts/${postId}/publish`, {
    method: "POST",
    body: JSON.stringify({
      scheduled_time: scheduled_time ?? null,
      ...(workflow1_output ? { workflow1_output } : {}),
    }),
  });
};

export const generateDraft = async (
  payload: GenerateWorkflow1Payload
): Promise<Post> => {
  const response = await generateDraftPost(payload);
  return response.post;
};


export const improveDraftPost = async (
  postId: string,
  payload: ImproveWorkflowPayload
): Promise<Post> => {
  return apiRequest<Post>(`/api/posts/${postId}/improve`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};


export const rejectDraftPost = async (postId: string): Promise<Post> => {
  return apiRequest<Post>(`/api/posts/${postId}/reject`, {
    method: "POST",
  });
};