import { Schema, model } from "mongoose";

export interface IPostBatch {
  _id: string;
  user_id: string;
  brandId: string;
  posts: string[];
  status: "active" | "paused" | "completed";
  created_at: Date;
}

const postBatchSchema = new Schema<IPostBatch>(
  {
    _id: {
      type: String,
      required: true,
    },

    user_id: {
      type: String,
      required: true,
      index: true,
    },

    brandId: {
      type: String,
      required: true,
      index: true,
    },

    posts: [
      {
        type: String,
      },
    ],

    status: {
      type: String,
      enum: ["active", "paused", "completed"],
      default: "active",
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
  }
);

postBatchSchema.index({ user_id: 1 });
postBatchSchema.index({ brandId: 1 });
postBatchSchema.index({ created_at: -1 });

export const PostBatch = model<IPostBatch>("PostBatch", postBatchSchema);
