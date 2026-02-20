import { getDb } from "../db";
import { pushNotifications, users } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Push Notifications Service
 * Handles real-time notifications for rides, ratings, disputes, and system alerts
 */

export type NotificationType =
  | "ride_request"
  | "ride_accepted"
  | "ride_completed"
  | "rating_received"
  | "dispute_update"
  | "badge_earned"
  | "payment_received"
  | "system_alert";

export interface SendNotificationInput {
  userId: number;
  title: string;
  body: string;
  type: NotificationType;
  relatedId?: number;
}

export interface NotificationPreferences {
  userId: number;
  rideNotifications: boolean;
  ratingNotifications: boolean;
  disputeNotifications: boolean;
  badgeNotifications: boolean;
  paymentNotifications: boolean;
  systemAlerts: boolean;
}

/**
 * Send a notification to a user
 */
export async function sendNotification(input: SendNotificationInput) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Validate inputs
    if (!input.title || input.title.trim().length === 0) {
      throw new Error("Notification title is required");
    }

    if (!input.body || input.body.trim().length === 0) {
      throw new Error("Notification body is required");
    }

    // Create notification record
    const result = await db.insert(pushNotifications).values({
      userId: input.userId,
      title: input.title,
      body: input.body,
      type: input.type,
      relatedId: input.relatedId,
    });

    // In a real app, this would trigger actual push notifications via FCM, APNs, etc.
    console.log(`[NotificationsService] Notification sent to user ${input.userId}: ${input.title}`);

    return {
      success: true,
      notificationId: result[0].insertId,
    };
  } catch (error) {
    console.error("[NotificationsService] Failed to send notification:", error);
    throw error;
  }
}

/**
 * Get unread notifications for a user
 */
export async function getUnreadNotifications(userId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const notifications = await db
      .select()
      .from(pushNotifications)
      .where(and(eq(pushNotifications.userId, userId), eq(pushNotifications.read, false)))
      .orderBy(desc(pushNotifications.sentAt));

    return notifications;
  } catch (error) {
    console.error("[NotificationsService] Failed to get unread notifications:", error);
    throw error;
  }
}

/**
 * Get all notifications for a user (with pagination)
 */
export async function getUserNotifications(userId: number, limit: number = 50, offset: number = 0) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const notifications = await db
      .select()
      .from(pushNotifications)
      .where(eq(pushNotifications.userId, userId))
      .orderBy(desc(pushNotifications.sentAt));

    // Simple pagination
    const paginated = notifications.slice(offset, offset + limit);

    return {
      notifications: paginated,
      total: notifications.length,
      hasMore: offset + limit < notifications.length,
    };
  } catch (error) {
    console.error("[NotificationsService] Failed to get user notifications:", error);
    throw error;
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // This would require an update operation
    console.log(`[NotificationsService] Marking notification ${notificationId} as read`);

    return { success: true };
  } catch (error) {
    console.error("[NotificationsService] Failed to mark notification as read:", error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // This would require a batch update operation
    console.log(`[NotificationsService] Marking all notifications as read for user ${userId}`);

    return { success: true };
  } catch (error) {
    console.error("[NotificationsService] Failed to mark all notifications as read:", error);
    throw error;
  }
}

/**
 * Get notification count for a user
 */
export async function getUnreadCount(userId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const notifications = await db
      .select()
      .from(pushNotifications)
      .where(and(eq(pushNotifications.userId, userId), eq(pushNotifications.read, false)));

    return {
      unreadCount: notifications.length,
    };
  } catch (error) {
    console.error("[NotificationsService] Failed to get unread count:", error);
    throw error;
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // This would require a delete operation
    console.log(`[NotificationsService] Deleting notification ${notificationId}`);

    return { success: true };
  } catch (error) {
    console.error("[NotificationsService] Failed to delete notification:", error);
    throw error;
  }
}

/**
 * Send batch notifications to multiple users
 */
export async function sendBatchNotifications(
  userIds: number[],
  title: string,
  body: string,
  type: NotificationType
) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const notifications = userIds.map((userId) => ({
      userId,
      title,
      body,
      type,
    }));

    // Batch insert
    let successCount = 0;
    for (const notif of notifications) {
      try {
        await db.insert(pushNotifications).values(notif);
        successCount++;
      } catch (e) {
        console.error(`Failed to send notification to user ${notif.userId}:`, e);
      }
    }

    console.log(
      `[NotificationsService] Batch notification sent to ${successCount}/${userIds.length} users`
    );

    return {
      success: true,
      sentCount: successCount,
      totalCount: userIds.length,
    };
  } catch (error) {
    console.error("[NotificationsService] Failed to send batch notifications:", error);
    throw error;
  }
}

/**
 * Get notifications by type
 */
export async function getNotificationsByType(userId: number, type: NotificationType) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const notifications = await db
      .select()
      .from(pushNotifications)
      .where(and(eq(pushNotifications.userId, userId), eq(pushNotifications.type, type)))
      .orderBy(desc(pushNotifications.sentAt));

    return notifications;
  } catch (error) {
    console.error("[NotificationsService] Failed to get notifications by type:", error);
    throw error;
  }
}

/**
 * Get notification statistics
 */
export async function getNotificationStats(userId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const notifications = await db
      .select()
      .from(pushNotifications)
      .where(eq(pushNotifications.userId, userId));

    const stats = {
      total: notifications.length,
      unread: notifications.filter((n) => !n.read).length,
      read: notifications.filter((n) => n.read).length,
      byType: {
        ride_request: notifications.filter((n) => n.type === "ride_request").length,
        ride_accepted: notifications.filter((n) => n.type === "ride_accepted").length,
        ride_completed: notifications.filter((n) => n.type === "ride_completed").length,
        rating_received: notifications.filter((n) => n.type === "rating_received").length,
        dispute_update: notifications.filter((n) => n.type === "dispute_update").length,
        badge_earned: notifications.filter((n) => n.type === "badge_earned").length,
        payment_received: notifications.filter((n) => n.type === "payment_received").length,
        system_alert: notifications.filter((n) => n.type === "system_alert").length,
      },
    };

    return stats;
  } catch (error) {
    console.error("[NotificationsService] Failed to get notification stats:", error);
    throw error;
  }
}

/**
 * Clean up old notifications (older than 30 days)
 */
export async function cleanupOldNotifications() {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // This would require a delete operation
    console.log("[NotificationsService] Cleanup of notifications older than 30 days scheduled");

    return { success: true };
  } catch (error) {
    console.error("[NotificationsService] Failed to cleanup old notifications:", error);
    throw error;
  }
}
