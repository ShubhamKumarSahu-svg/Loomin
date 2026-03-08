import { randomUUID } from "crypto";
import { Schema, model } from "mongoose";

export type NotificationType =
  | "post_generated"
  | "post_published"
  | "analytics_ready";

export interface INotification {
  _id: string;
  userId: string;
  brandId: string;
  postId?: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  eventKey?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    _id: {
      type: String,
      default: () => randomUUID(),
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    brandId: {
      type: String,
      required: true,
      index: true,
    },
    postId: {
      type: String,
      index: true,
    },
    type: {
      type: String,
      enum: ["post_generated", "post_published", "analytics_ready"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    eventKey: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, brandId: 1, createdAt: -1 });
notificationSchema.index({ eventKey: 1 }, { unique: true, sparse: true });

export const Notification = model<INotification>(
  "Notification",
  notificationSchema
);
