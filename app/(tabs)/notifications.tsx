import { ScrollView, Text, View, Pressable, ActivityIndicator, FlatList } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  title: string;
  body: string;
  type:
    | "ride_request"
    | "ride_accepted"
    | "ride_completed"
    | "rating_received"
    | "dispute_update"
    | "badge_earned"
    | "payment_received"
    | "system_alert";
  read: boolean;
  sentAt: string;
  icon: string;
  color: string;
}

/**
 * Notification Center Screen
 * Displays all notifications with filtering and search
 */
export default function NotificationsScreen() {
  const colors = useColors();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, selectedFilter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // In a real app, this would call the backend API
      // const response = await fetch('/api/notifications');
      // const data = await response.json();

      // Mock data for now
      const mockNotifications: Notification[] = [
        {
          id: 1,
          title: "Badge Earned!",
          body: "Congratulations! You earned the 5-Star Rated badge.",
          type: "badge_earned",
          read: false,
          sentAt: new Date(Date.now() - 5 * 60000).toISOString(),
          icon: "⭐",
          color: "bg-yellow-500",
        },
        {
          id: 2,
          title: "Ride Completed",
          body: "Your ride with John was completed. Rating pending.",
          type: "ride_completed",
          read: false,
          sentAt: new Date(Date.now() - 15 * 60000).toISOString(),
          icon: "✓",
          color: "bg-green-500",
        },
        {
          id: 3,
          title: "Payment Received",
          body: "You received $28.50 for your last ride.",
          type: "payment_received",
          read: true,
          sentAt: new Date(Date.now() - 1 * 3600000).toISOString(),
          icon: "💰",
          color: "bg-green-600",
        },
        {
          id: 4,
          title: "Ride Request",
          body: "New ride request from Sarah - 2.3 km away",
          type: "ride_request",
          read: true,
          sentAt: new Date(Date.now() - 2 * 3600000).toISOString(),
          icon: "🚗",
          color: "bg-blue-500",
        },
        {
          id: 5,
          title: "Rating Received",
          body: "You received a 5-star rating from your last rider.",
          type: "rating_received",
          read: true,
          sentAt: new Date(Date.now() - 4 * 3600000).toISOString(),
          icon: "⭐",
          color: "bg-yellow-400",
        },
        {
          id: 6,
          title: "System Alert",
          body: "Your driver license will expire in 30 days. Please renew.",
          type: "system_alert",
          read: true,
          sentAt: new Date(Date.now() - 1 * 86400000).toISOString(),
          icon: "⚠️",
          color: "bg-red-500",
        },
        {
          id: 7,
          title: "Dispute Update",
          body: "Your dispute has been resolved. Refund of $15 issued.",
          type: "dispute_update",
          read: true,
          sentAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          icon: "🔧",
          color: "bg-orange-500",
        },
      ];

      setNotifications(mockNotifications);
      const unread = mockNotifications.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    if (!selectedFilter) {
      setFilteredNotifications(notifications);
    } else if (selectedFilter === "unread") {
      setFilteredNotifications(notifications.filter((n) => !n.read));
    } else {
      setFilteredNotifications(notifications.filter((n) => n.type === selectedFilter));
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      ride_request: "🚗",
      ride_accepted: "✓",
      ride_completed: "✓",
      rating_received: "⭐",
      dispute_update: "🔧",
      badge_earned: "🏆",
      payment_received: "💰",
      system_alert: "⚠️",
    };
    return icons[type] || "📬";
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      ride_request: "bg-blue-500",
      ride_accepted: "bg-green-500",
      ride_completed: "bg-green-600",
      rating_received: "bg-yellow-400",
      dispute_update: "bg-orange-500",
      badge_earned: "bg-purple-500",
      payment_received: "bg-green-600",
      system_alert: "bg-red-500",
    };
    return colors[type] || "bg-gray-500";
  };

  const filterOptions = [
    { label: "All", value: null },
    { label: `Unread (${unreadCount})`, value: "unread" },
    { label: "Rides", value: "ride_request" },
    { label: "Payments", value: "payment_received" },
    { label: "Ratings", value: "rating_received" },
    { label: "Badges", value: "badge_earned" },
    { label: "Disputes", value: "dispute_update" },
  ];

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-background">
        {/* Header */}
        <View className="bg-primary px-6 py-8 flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-background">Notifications</Text>
            {unreadCount > 0 && (
              <Text className="text-background opacity-90 mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </Text>
            )}
          </View>
          {unreadCount > 0 && (
            <Pressable
              onPress={markAllAsRead}
              className="bg-background bg-opacity-20 px-4 py-2 rounded-full"
            >
              <Text className="text-background text-sm font-semibold">Mark all read</Text>
            </Pressable>
          )}
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="border-b border-border"
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
        >
          {filterOptions.map((option) => (
            <Pressable
              key={option.value || "all"}
              onPress={() => setSelectedFilter(option.value)}
              className={cn(
                "px-4 py-2 rounded-full",
                selectedFilter === option.value
                  ? "bg-primary"
                  : "bg-surface border border-border"
              )}
            >
              <Text
                className={cn(
                  "text-sm font-semibold",
                  selectedFilter === option.value ? "text-background" : "text-foreground"
                )}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <View className="px-4 py-4">
            {filteredNotifications.map((notification) => (
              <Pressable
                key={notification.id}
                onPress={() => markAsRead(notification.id)}
                className={cn(
                  "flex-row gap-4 p-4 rounded-lg mb-3 border",
                  notification.read
                    ? "bg-background border-border"
                    : "bg-primary bg-opacity-5 border-primary"
                )}
              >
                {/* Icon */}
                <View
                  className={cn(
                    "w-12 h-12 rounded-full items-center justify-center flex-shrink-0",
                    getNotificationColor(notification.type)
                  )}
                >
                  <Text className="text-xl">{getNotificationIcon(notification.type)}</Text>
                </View>

                {/* Content */}
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text
                      className={cn(
                        "font-semibold",
                        notification.read ? "text-foreground" : "text-primary"
                      )}
                    >
                      {notification.title}
                    </Text>
                    {!notification.read && (
                      <View className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </View>
                  <Text className="text-sm text-muted mb-2 leading-relaxed">
                    {notification.body}
                  </Text>
                  <Text className="text-xs text-muted">
                    {formatTime(new Date(notification.sentAt))}
                  </Text>
                </View>

                {/* Delete Button */}
                <Pressable
                  onPress={() => deleteNotification(notification.id)}
                  className="justify-center px-2"
                >
                  <Text className="text-muted text-lg">×</Text>
                </Pressable>
              </Pressable>
            ))}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-6xl mb-4">📬</Text>
            <Text className="text-xl font-semibold text-foreground mb-2">
              No notifications
            </Text>
            <Text className="text-muted text-center">
              {selectedFilter
                ? "No notifications match this filter"
                : "You're all caught up!"}
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

/**
 * Format time relative to now
 */
function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
