/**
 * Reminders Service
 * Handles ride scheduling reminders and notifications
 */

export interface RideReminder {
  id: number;
  rideId: number;
  userId: number;
  reminderTime: Date; // When reminder should be sent (30 min before ride)
  notificationSent: boolean;
  sentAt?: Date;
  createdAt: Date;
}

export interface ReminderNotification {
  id: number;
  reminderId: number;
  userId: number;
  title: string;
  body: string;
  driverName: string;
  driverRating: number;
  vehicleInfo: string;
  pickupLocation: string;
  pickupTime: Date;
  rescheduleOption: boolean;
  cancelOption: boolean;
  sentAt: Date;
}

// In-memory storage for reminders
const reminders = new Map<number, RideReminder>();
const notifications = new Map<number, ReminderNotification>();
let reminderIdCounter = 1;
let notificationIdCounter = 1;

/**
 * Create a reminder for a scheduled ride
 */
export async function createRideReminder(
  rideId: number,
  userId: number,
  scheduledTime: Date
): Promise<RideReminder> {
  try {
    // Calculate reminder time (30 minutes before ride)
    const reminderTime = new Date(scheduledTime.getTime() - 30 * 60 * 1000);

    const reminder: RideReminder = {
      id: reminderIdCounter++,
      rideId,
      userId,
      reminderTime,
      notificationSent: false,
      createdAt: new Date(),
    };

    reminders.set(reminder.id, reminder);

    console.log(
      `[Reminders] Created reminder for ride ${rideId} at ${reminderTime.toISOString()}`
    );

    return reminder;
  } catch (error) {
    console.error("[Reminders] Failed to create reminder:", error);
    throw error;
  }
}

/**
 * Get pending reminders that need to be sent
 */
export async function getPendingReminders(): Promise<RideReminder[]> {
  try {
    const now = new Date();
    const pending: RideReminder[] = [];

    for (const reminder of reminders.values()) {
      if (
        !reminder.notificationSent &&
        reminder.reminderTime <= now
      ) {
        pending.push(reminder);
      }
    }

    console.log(`[Reminders] Found ${pending.length} pending reminders`);

    return pending;
  } catch (error) {
    console.error("[Reminders] Failed to get pending reminders:", error);
    throw error;
  }
}

/**
 * Send reminder notification
 */
export async function sendReminderNotification(
  reminderId: number,
  driverName: string,
  driverRating: number,
  vehicleInfo: string,
  pickupLocation: string,
  pickupTime: Date
): Promise<ReminderNotification> {
  try {
    const reminder = reminders.get(reminderId);
    if (!reminder) {
      throw new Error(`Reminder ${reminderId} not found`);
    }

    const notification: ReminderNotification = {
      id: notificationIdCounter++,
      reminderId,
      userId: reminder.userId,
      title: "Your Ride is Coming Soon!",
      body: `Your ride with ${driverName} (${driverRating}⭐) is arriving in 30 minutes`,
      driverName,
      driverRating,
      vehicleInfo,
      pickupLocation,
      pickupTime,
      rescheduleOption: true,
      cancelOption: true,
      sentAt: new Date(),
    };

    notifications.set(notification.id, notification);

    // Mark reminder as sent
    reminder.notificationSent = true;
    reminder.sentAt = new Date();
    reminders.set(reminderId, reminder);

    console.log(
      `[Reminders] Sent notification for reminder ${reminderId} to user ${reminder.userId}`
    );

    return notification;
  } catch (error) {
    console.error("[Reminders] Failed to send notification:", error);
    throw error;
  }
}

/**
 * Get reminder by ID
 */
export async function getReminder(reminderId: number): Promise<RideReminder | null> {
  try {
    return reminders.get(reminderId) || null;
  } catch (error) {
    console.error("[Reminders] Failed to get reminder:", error);
    throw error;
  }
}

/**
 * Get all reminders for a user
 */
export async function getUserReminders(userId: number): Promise<RideReminder[]> {
  try {
    const userReminders: RideReminder[] = [];

    for (const reminder of reminders.values()) {
      if (reminder.userId === userId) {
        userReminders.push(reminder);
      }
    }

    return userReminders;
  } catch (error) {
    console.error("[Reminders] Failed to get user reminders:", error);
    throw error;
  }
}

/**
 * Cancel a reminder
 */
export async function cancelReminder(reminderId: number): Promise<boolean> {
  try {
    const reminder = reminders.get(reminderId);
    if (!reminder) {
      return false;
    }

    reminders.delete(reminderId);

    console.log(`[Reminders] Cancelled reminder ${reminderId}`);

    return true;
  } catch (error) {
    console.error("[Reminders] Failed to cancel reminder:", error);
    throw error;
  }
}

/**
 * Get notification by ID
 */
export async function getNotification(
  notificationId: number
): Promise<ReminderNotification | null> {
  try {
    return notifications.get(notificationId) || null;
  } catch (error) {
    console.error("[Reminders] Failed to get notification:", error);
    throw error;
  }
}

/**
 * Get all notifications for a user
 */
export async function getUserNotifications(userId: number): Promise<ReminderNotification[]> {
  try {
    const userNotifications: ReminderNotification[] = [];

    for (const notification of notifications.values()) {
      if (notification.userId === userId) {
        userNotifications.push(notification);
      }
    }

    return userNotifications.sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
  } catch (error) {
    console.error("[Reminders] Failed to get user notifications:", error);
    throw error;
  }
}

/**
 * Get reminder statistics
 */
export async function getReminderStatistics(): Promise<{
  totalReminders: number;
  sentReminders: number;
  pendingReminders: number;
  sentRate: number;
}> {
  try {
    const totalReminders = reminders.size;
    const sentReminders = Array.from(reminders.values()).filter(
      (r) => r.notificationSent
    ).length;
    const pendingReminders = totalReminders - sentReminders;
    const sentRate = totalReminders > 0 ? (sentReminders / totalReminders) * 100 : 0;

    return {
      totalReminders,
      sentReminders,
      pendingReminders,
      sentRate: Math.round(sentRate * 100) / 100,
    };
  } catch (error) {
    console.error("[Reminders] Failed to get statistics:", error);
    throw error;
  }
}
