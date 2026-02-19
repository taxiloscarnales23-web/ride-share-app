import { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export interface NotificationData {
  type: "ride_request" | "ride_accepted" | "driver_arriving" | "ride_completed";
  title: string;
  body: string;
  data?: Record<string, any>;
}

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string>("");
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);

  useEffect(() => {
    registerForPushNotifications();

    // Listen for notifications when app is in foreground
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    // Listen for notification responses (when user taps notification)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("[Notifications] User tapped notification:", response.notification.request.content.data);
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  async function registerForPushNotifications() {
    if (Platform.OS === "web") {
      console.log("[Notifications] Web platform - push notifications not available");
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("[Notifications] Failed to get push token for push notification!");
        return;
      }

      // Get the Expo push token
      const token = await Notifications.getExpoPushTokenAsync();

      setExpoPushToken(token.data);
      console.log("[Notifications] Expo push token:", token.data);
    } catch (error) {
      console.error("[Notifications] Error registering for push notifications:", error);
    }
  }

  async function sendLocalNotification(data: NotificationData) {
    try {
      // Send notification immediately using local notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: data.title,
          body: data.body,
          data: data.data || {},
          sound: "default",
          badge: 1,
        },
        trigger: null,
      });
      return notificationId;
    } catch (error) {
      console.error("[Notifications] Error sending notification:", error);
    }
  }

  return {
    expoPushToken,
    notification,
    sendLocalNotification,
  };
}
