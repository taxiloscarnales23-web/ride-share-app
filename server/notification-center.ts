/**
 * Notification Center Service
 * Manages real-time notifications with preferences and history
 */

export interface Notification {
  notificationId: string;
  userId: string;
  type:
    | "ride_request"
    | "ride_accepted"
    | "ride_completed"
    | "payment_received"
    | "promotion"
    | "system";
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  createdAt: Date;
  expiresAt: Date;
}

export interface NotificationPreference {
  userId: string;
  rideNotifications: boolean;
  paymentNotifications: boolean;
  promotionalNotifications: boolean;
  systemNotifications: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export class NotificationCenterService {
  private notifications: Map<string, Notification[]> = new Map();
  private preferences: Map<string, NotificationPreference> = new Map();
  private notificationHistory: Notification[] = [];

  createNotification(
    userId: string,
    type: Notification["type"],
    title: string,
    message: string,
    data: Record<string, any> = {}
  ): Notification {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const notification: Notification = {
      notificationId: `notif_${Date.now()}`,
      userId,
      type,
      title,
      message,
      data,
      read: false,
      createdAt: now,
      expiresAt,
    };

    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }
    this.notifications.get(userId)!.push(notification);
    this.notificationHistory.push(notification);

    return notification;
  }

  markAsRead(notificationId: string): boolean {
    for (const userNotifications of this.notifications.values()) {
      const notification = userNotifications.find(
        (n) => n.notificationId === notificationId
      );
      if (notification) {
        notification.read = true;
        return true;
      }
    }
    return false;
  }

  markAllAsRead(userId: string): number {
    const userNotifications = this.notifications.get(userId) || [];
    let count = 0;
    for (const notification of userNotifications) {
      if (!notification.read) {
        notification.read = true;
        count++;
      }
    }
    return count;
  }

  deleteNotification(notificationId: string): boolean {
    for (const [userId, userNotifications] of this.notifications.entries()) {
      const index = userNotifications.findIndex(
        (n) => n.notificationId === notificationId
      );
      if (index !== -1) {
        userNotifications.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  getNotifications(userId: string, unreadOnly: boolean = false): Notification[] {
    const userNotifications = this.notifications.get(userId) || [];
    if (unreadOnly) {
      return userNotifications.filter((n) => !n.read);
    }
    return userNotifications;
  }

  getNotificationCount(userId: string): number {
    return this.getNotifications(userId, true).length;
  }

  setPreferences(userId: string, preferences: Partial<NotificationPreference>) {
    const existing = this.preferences.get(userId) || {
      userId,
      rideNotifications: true,
      paymentNotifications: true,
      promotionalNotifications: true,
      systemNotifications: true,
      quietHoursStart: "22:00",
      quietHoursEnd: "08:00",
      emailNotifications: true,
      pushNotifications: true,
    };

    this.preferences.set(userId, { ...existing, ...preferences });
  }

  getPreferences(userId: string): NotificationPreference {
    return (
      this.preferences.get(userId) || {
        userId,
        rideNotifications: true,
        paymentNotifications: true,
        promotionalNotifications: true,
        systemNotifications: true,
        quietHoursStart: "22:00",
        quietHoursEnd: "08:00",
        emailNotifications: true,
        pushNotifications: true,
      }
    );
  }

  shouldNotify(userId: string, type: Notification["type"]): boolean {
    const preferences = this.getPreferences(userId);

    switch (type) {
      case "ride_request":
      case "ride_accepted":
      case "ride_completed":
        return preferences.rideNotifications;
      case "payment_received":
        return preferences.paymentNotifications;
      case "promotion":
        return preferences.promotionalNotifications;
      case "system":
        return preferences.systemNotifications;
      default:
        return true;
    }
  }

  isInQuietHours(userId: string): boolean {
    const preferences = this.getPreferences(userId);
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const start = preferences.quietHoursStart;
    const end = preferences.quietHoursEnd;

    if (start < end) {
      return currentTime >= start && currentTime < end;
    } else {
      return currentTime >= start || currentTime < end;
    }
  }

  getNotificationHistory(
    userId: string,
    limit: number = 50
  ): Notification[] {
    return this.notificationHistory
      .filter((n) => n.userId === userId)
      .slice(-limit);
  }

  clearExpiredNotifications(): number {
    let cleared = 0;
    const now = new Date();

    for (const [userId, userNotifications] of this.notifications.entries()) {
      const filtered = userNotifications.filter((n) => n.expiresAt > now);
      if (filtered.length < userNotifications.length) {
        cleared += userNotifications.length - filtered.length;
        this.notifications.set(userId, filtered);
      }
    }

    return cleared;
  }
}
