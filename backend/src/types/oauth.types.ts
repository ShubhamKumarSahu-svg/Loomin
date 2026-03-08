export type SupportedProvider = "linkedin" | "instagram" | "twitter";

export interface OauthStatePayload {
  userId: string;
  brandId: string;
  provider: SupportedProvider;
}