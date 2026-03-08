import { Notification, type NotificationType } from "../models/notificationModel.js";

interface CreateNotificationInput {
  userId: string;
  brandId: string;
  postId?: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  eventKey?: string;
}

export const createNotification = async (input: CreateNotificationInput): Promise<void> => {
  const payload: Record<string, unknown> = {
    userId: input.userId,
    brandId: input.brandId,
    type: input.type,
    title: input.title,
    message: input.message,
    isRead: false,
  };
  if (input.postId) payload.postId = input.postId;
  if (input.metadata) payload.metadata = input.metadata;
  if (input.eventKey) payload.eventKey = input.eventKey;

  if (input.eventKey) {
    await Notification.updateOne(
      { eventKey: input.eventKey },
      { $setOnInsert: payload },
      { upsert: true }
    );
    return;
  }

  await Notification.create(payload);
};
