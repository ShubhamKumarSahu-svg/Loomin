import type { Request, Response } from "express";
import { Brand } from "../models/brandModel.js";
import { Notification } from "../models/notificationModel.js";
import { Post } from "../models/postModel.js";
import { createNotification } from "../services/notificationService.js";

interface ListNotificationsQuery {
  brandId?: string;
  limit?: string;
}

interface SyncAnalyticsBody {
  brandId?: string;
}

const toInt = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed;
};

export const getNotifications = async (
  req: Request<{}, {}, {}, ListNotificationsQuery>,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const brandId = req.query.brandId;
    const limit = Math.min(Math.max(toInt(req.query.limit, 50), 1), 200);

    const query: Record<string, unknown> = { userId };
    if (brandId) query.brandId = brandId;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.status(200).json(notifications);
  } catch (error) {
    console.error("getNotifications error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markNotificationRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const notificationId =
      typeof req.params.notificationId === "string"
        ? req.params.notificationId
        : undefined;

    if (!notificationId) {
      res.status(400).json({ message: "notificationId is required" });
      return;
    }

    const updated = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { isRead: true } },
      { new: true }
    ).lean();

    if (!updated) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("markNotificationRead error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const syncAnalyticsNotifications = async (
  req: Request<{}, {}, SyncAnalyticsBody>,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const brandId = req.body.brandId;

    if (!brandId) {
      res.status(400).json({ message: "brandId is required" });
      return;
    }

    const brand = await Brand.findOne({ _id: brandId, userId })
      .select("_id brand_name")
      .lean<{ _id: string; brand_name: string } | null>();

    if (!brand) {
      res.status(404).json({ message: "Brand not found" });
      return;
    }

    const posts = await Post.find({
      user_id: userId,
      brandId,
      review_status: "published",
      status: { $ne: "deleted" },
    })
      .select("_id topic")
      .lean<Array<{ _id: string; topic?: string }>>();

    let createdCount = 0;
    for (const post of posts) {
      const eventKey = `analytics_ready:${userId}:${brandId}:${post._id}`;

      const existing = await Notification.findOne({ eventKey })
        .select("_id")
        .lean();
      if (existing) continue;

      await createNotification({
        userId,
        brandId,
        postId: post._id,
        type: "analytics_ready",
        title: "Analytics ready",
        message: `Analytics for post "${post.topic ?? "Untitled"}" in brand "${brand.brand_name}" is ready.`,
        metadata: { source: "intelligence-sync" },
        eventKey,
      });
      createdCount += 1;
    }

    res.status(200).json({ createdCount });
  } catch (error) {
    console.error("syncAnalyticsNotifications error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
