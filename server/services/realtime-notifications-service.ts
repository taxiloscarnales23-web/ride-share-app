export type NotificationType = 
  | "ride_accepted"
  | "driver_arriving"
  | "ride_cancelled"
  | "ride_completed"
  | "payment_received"
  | "driver_rated"
  | "support_response"
  | "promotion";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface NotificationPreferences {
  userId: string;
  rideAcceptance: boolean;
  driverArrival: boolean;
  rideCancellation: boolean;
  rideCompletion: boolean;
  payments: boolean;
  ratings: boolean;
  support: boolean;
  promotions: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export class RealtimeNotificationsService {
  private notifications: Map<string, Notification[]> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();

  constructor() {
    this.initializeDefaultPreferences();
  }

  private initializeDefaultPreferences() {
    const defaultPrefs: NotificationPreferences = {
      userId: "default",
      rideAcceptance: true,
      driverArrival: true,
      rideCancellation: true,
      rideCompletion: true,
      payments: true,
      ratings: true,
      support: true,
      promotions: false,
      soundEnabled: true,
      vibrationEnabled: true,
    };
    this.preferences.set("default", defaultPrefs);
  }

  /**
   * Send notification
   */
  async sendNotification(userId: string, notification: Omit<Notification, "id" | "createdAt">): Promise<Notification> {
    const prefs = this.preferences.get(userId) || this.preferences.get("default")!;

    // Check if notification type is enabled
    const typeKey = notification.type as keyof NotificationPreferences;
    if (!prefs[typeKey]) {
      return { ...notification, id: `notif-${Date.now()}`, createdAt: new Date() };
    }

    const notif: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      createdAt: new Date(),
    };

    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }
    this.notifications.get(userId)!.push(notif);

    console.log(`Notification sent to ${userId}: ${notification.title}`);
    return notif;
  }

  /**
   * Get notifications for user
   */
  async getNotifications(userId: string, limit: number = 20): Promise<Notification[]> {
    const userNotifs = this.notifications.get(userId) || [];
    return userNotifs.slice(-limit).reverse();
  }

  /**
   * Mark notification as read
   */
  async markAsRead(userId: string, notificationId: string): Promise<boolean> {
    const userNotifs = this.notifications.get(userId);
    if (!userNotifs) return false;

    const notif = userNotifs.find((n) => n.id === notificationId);
    if (notif) {
      notif.read = true;
      return true;
    }
    return false;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<number> {
    const userNotifs = this.notifications.get(userId);
    if (!userNotifs) return 0;

    let count = 0;
    userNotifs.forEach((n) => {
      if (!n.read) {
        n.read = true;
        count++;
      }
    });
    return count;
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const userNotifs = this.notifications.get(userId) || [];
    return userNotifs.filter((n) => !n.read).length;
  }

  /**
   * Delete notification
   */
  async deleteNotification(userId: string, notificationId: string): Promise<boolean> {
    const userNotifs = this.notifications.get(userId);
    if (!userNotifs) return false;

    const index = userNotifs.findIndex((n) => n.id === notificationId);
    if (index >= 0) {
      userNotifs.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(userId: string): Promise<number> {
    const userNotifs = this.notifications.get(userId);
    if (!userNotifs) return 0;

    const count = userNotifs.length;
    this.notifications.set(userId, []);
    return count;
  }

  /**
   * Get notification preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    return this.preferences.get(userId) || this.preferences.get("default")!;
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(userId: string, updates: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const current = this.preferences.get(userId) || { ...this.preferences.get("default")!, userId };
    const updated = { ...current, ...updates, userId };
    this.preferences.set(userId, updated);
    return updated;
  }

  /**
   * Send ride acceptance notification
   */
  async notifyRideAccepted(riderId: string, driverId: string, driverName: string, eta: number): Promise<Notification> {
    return this.sendNotification(riderId, {
      userId: riderId,
      type: "ride_accepted",
      title: "Ride Accepted",
      body: `${driverName} accepted your ride. ETA: ${eta} minutes`,
      data: { driverId, driverName, eta, type: "ride_accepted" },
      read: false,
    });
  }

  /**
   * Send driver arriving notification
   */
  async notifyDriverArriving(riderId: string, driverName: string, distance: number): Promise<Notification> {
    return this.sendNotification(riderId, {
      userId: riderId,
      type: "driver_arriving",
      title: "Driver Arriving",
      body: `${driverName} is ${distance}m away`,
      data: { driverName, distance, type: "driver_arriving" },
      read: false,
    });
  }

  /**
   * Send ride cancelled notification
   */
  async notifyRideCancelled(userId: string, reason: string, refundAmount?: number): Promise<Notification> {
    const body = refundAmount ? `Ride cancelled. Refund: $${refundAmount.toFixed(2)}` : "Ride cancelled";
    return this.sendNotification(userId, {
      userId,
      type: "ride_cancelled",
      title: "Ride Cancelled",
      body,
      data: { reason, refundAmount, type: "ride_cancelled" },
      read: false,
    });
  }

  /**
   * Send ride completed notification
   */
  async notifyRideCompleted(userId: string, fare: number, rating?: boolean): Promise<Notification> {
    const body = rating ? `Ride completed. Fare: $${fare.toFixed(2)}. Please rate your driver.` : `Ride completed. Fare: $${fare.toFixed(2)}`;
    return this.sendNotification(userId, {
      userId,
      type: "ride_completed",
      title: "Ride Completed",
      body,
      data: { fare, rating, type: "ride_completed" },
      read: false,
    });
  }

  /**
   * Send payment notification
   */
  async notifyPaymentReceived(userId: string, amount: number, method: string): Promise<Notification> {
    return this.sendNotification(userId, {
      userId,
      type: "payment_received",
      title: "Payment Received",
      body: `$${amount.toFixed(2)} received via ${method}`,
      data: { amount, method, type: "payment_received" },
      read: false,
    });
  }

  /**
   * Get notification statistics
   */
  async getStats(userId: string): Promise<{
    total: number;
    unread: number;
    byType: Record<NotificationType, number>;
  }> {
    const userNotifs = this.notifications.get(userId) || [];
    const byType: Record<NotificationType, number> = {
      ride_accepted: 0,
      driver_arriving: 0,
      ride_cancelled: 0,
      ride_completed: 0,
      payment_received: 0,
      driver_rated: 0,
      support_response: 0,
      promotion: 0,
    };

    userNotifs.forEach((n) => {
      byType[n.type]++;
    });

    return {
      total: userNotifs.length,
      unread: userNotifs.filter((n) => !n.read).length,
      byType,
    };
  }
}

export const realtimeNotificationsService = new RealtimeNotificationsService();
