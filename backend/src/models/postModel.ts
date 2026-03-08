import { Schema, model } from "mongoose";

export interface IPost {
  _id: string;
  batch_id: string | null;
  user_id: string | number;
  brandId: string;
  content: Partial<Record<"linkedin" | "instagram" | "reddit" | "facebook", string>>;
  platforms?: string[];
  image_url?: string;
  results?: Array<{
    platform?: string;
    success?: boolean;
    post_id?: string | null;
    error?: string | null;
    detailed_error?: string | null;
    [key: string]: unknown;
  }>;
  old_id?: string;

  platform_posts: {
    linkedin?: string;
    instagram?: string;
    reddit?: string;
    facebook?: string | null;
  };

  review_status?: "draft" | "awaiting_review" | "published" | "rejected";
  published_at?: Date;

  tracking: {
    enabled: boolean;
    interval_hours: number;
    next_run_at?: Date;
    expires_at?: Date;
  };

  status: "active" | "paused" | "deleted";
  version: number;

  analytics?: {
    last_checked?: Date;
    history: Array<Record<string, unknown>>;
  };
  ai_response?: Record<string, unknown>;

  created_at: Date;
  updated_at: Date;
}

const postSchema = new Schema<IPost>(
  {
    _id: {
      type: String,
      required: true,
    },

    batch_id: {
      type: String,
      default: null,
    },

    user_id: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },

    brandId: {
      type: String,
      required: true,
      index: true,
    },

    content: {
      type: Schema.Types.Mixed,
      default: {},
    },

    platforms: {
      type: [String],
      default: [],
    },

    image_url: {
      type: String,
    },

    results: [
      {
        platform: { type: String },
        success: { type: Boolean },
        post_id: { type: String, default: null },
        error: { type: String, default: null },
        detailed_error: { type: String, default: null },
      },
    ],

    old_id: {
      type: String,
    },

    platform_posts: {
      linkedin: { type: String },
      instagram: { type: String },
      reddit: { type: String },
      facebook: { type: String, default: null },
    },

    review_status: {
      type: String,
      enum: ["draft", "awaiting_review", "published", "rejected"],
      default: "awaiting_review",
    },

    published_at: {
      type: Date,
    },

    tracking: {
      enabled: {
        type: Boolean,
        default: true,
      },

      interval_hours: {
        type: Number,
        default: 48,
      },

      next_run_at: {
        type: Date,
      },

      expires_at: {
        type: Date,
      },
    },

    status: {
      type: String,
      enum: ["active", "paused", "deleted"],
      default: "active",
    },

    version: {
      type: Number,
      default: 1,
    },

    analytics: {
      last_checked: { type: Date },
      history: {
        type: [Schema.Types.Mixed],
        default: [],
      },
    },

    ai_response: {
      type: Schema.Types.Mixed,
      default: () => ({}),
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    minimize: false,
  }
);

// Indexes for performance
postSchema.index({ brandId: 1, created_at: -1 });
postSchema.index({ batch_id: 1 });
postSchema.index({ "tracking.next_run_at": 1 });

export const Post = model<IPost>("Post", postSchema);
