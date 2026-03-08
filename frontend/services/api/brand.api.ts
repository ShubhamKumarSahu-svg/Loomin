import { apiRequest, getApiBase } from "@/services/api/client";

export type SocialProvider =
  | "linkedin"
  | "instagram"
  | "twitter"
  | "facebook"
  | "reddit";

export interface BrandRecord {
  _id: string;
  name: string;
  description?: string;
  brandVoice?: string;
  logo?: string;
  brandColors?: string[];
  brandStyle?: string;
  brandText?: string;
  ctaStyle?: string;
  logoUrl?: string;
  logoPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  connectedPlatforms?: SocialProvider[];
}

export interface BrandConnection {
  _id: string;
  platform: SocialProvider;
  expires_at?: string;
  updatedAt?: string;
}

export async function getBrands(): Promise<BrandRecord[]> {
  return apiRequest<BrandRecord[]>("/api/brands", { method: "GET" });
}

export async function createBrand(payload: {
  name: string;
  description?: string;
  brandVoice?: string;
  logo?: string;
  brandColors?: string[];
  brandStyle?: string;
  brandText?: string;
  ctaStyle?: string;
  logoUrl?: string;
  logoPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
}): Promise<BrandRecord> {
  return apiRequest<BrandRecord>("/api/brands", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateBrand(
  brandId: string,
  payload: {
    description?: string;
    brandVoice?: string;
    logo?: string;
    brandColors?: string[];
    brandStyle?: string;
    brandText?: string;
    ctaStyle?: string;
    logoUrl?: string;
    logoPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  }
): Promise<BrandRecord> {
  return apiRequest<BrandRecord>(`/api/brands/${brandId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getBrandConnections(brandId: string): Promise<BrandConnection[]> {
  return apiRequest<BrandConnection[]>(`/api/brands/${brandId}/connections`, {
    method: "GET",
  });
}

export async function disconnectPlatform(brandId: string, provider: SocialProvider): Promise<void> {
  await apiRequest<{ message: string }>(`/api/brands/${brandId}/disconnect/${provider}`, {
    method: "DELETE",
  });
}

export function buildOauthConnectUrl(provider: SocialProvider, brandId: string): string {
  const params = new URLSearchParams({ brandId });
  return `${getApiBase()}/api/oauth/${provider}?${params.toString()}`;
}
