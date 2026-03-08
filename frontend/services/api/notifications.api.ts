import { apiRequest } from "@/services/api/client";

export type NotificationType =
  | "post_generated"
  | "post_published"
  | "analytics_ready";

export interface NotificationRecord {
  _id: string;
  userId: string;
  brandId: string;
  postId?: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getNotifications(
  brandId?: string,
  limit = 50
): Promise<NotificationRecord[]> {
  const params = new URLSearchParams();
  if (brandId) params.set("brandId", brandId);
  params.set("limit", String(limit));
  return apiRequest<NotificationRecord[]>(`/api/notifications?${params.toString()}`, {
    method: "GET",
  });
}

export async function markNotificationRead(
  notificationId: string
): Promise<NotificationRecord> {
  return apiRequest<NotificationRecord>(`/api/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
}

export async function syncAnalyticsNotifications(brandId: string): Promise<{ createdCount: number }> {
  return apiRequest<{ createdCount: number }>("/api/notifications/sync-analytics", {
    method: "POST",
    body: JSON.stringify({ brandId }),
  });
}
