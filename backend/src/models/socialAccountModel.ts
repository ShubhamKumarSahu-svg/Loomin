import { Schema, model } from "mongoose";

export type PlatformType = "linkedin" | "instagram" | "twitter" | "reddit";

export interface ISocialAccount {
  _id: string;
  user_id: string;
  platform: PlatformType;
  access_token: string;
  refresh_token?: string | null;
  expires_at?: Date;
  meta?: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

const socialAccountSchema = new Schema<ISocialAccount>(
  {
    user_id: {
      type: String,
      ref: "User",
      required: true,
      index: true,
    },

    platform: {
      type: String,
      enum: ["linkedin", "instagram", "twitter", "reddit"],
      required: true,
    },

    access_token: {
      type: String,
      required: true,
    },
    refresh_token: {
      type: String,
      default: null,
    },

    expires_at: Date,

    meta: Schema.Types.Mixed,
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    collection: "social_accounts",
  }
);

// Prevent duplicate platform connection per user
socialAccountSchema.index(
  { user_id: 1, platform: 1 },
  { unique: true }
);

export const SocialAccount = model<ISocialAccount>(
  "SocialAccount",
  socialAccountSchema,
  "social_accounts"
);
