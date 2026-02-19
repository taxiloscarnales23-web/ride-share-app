import { ScrollView, Text, View, Pressable, FlatList, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import * as Haptics from "expo-haptics";

interface AdminMetric {
  label: string;
  value: string;
  change: string;
  icon: string;
  color: string;
}

interface RecentActivity {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  status: "success" | "warning" | "error";
}

export default function AdminDashboard() {
  const colors = useColors();
  const [metrics] = useState<AdminMetric[]>([
    {
      label: "Total Users",
      value: "2,847",
      change: "+12% this week",
      icon: "👥",
      color: "primary",
    },
    {
      label: "Active Rides",
      value: "156",
      change: "+8 this hour",
      icon: "🚗",
      color: "success",
    },
    {
      label: "Revenue",
      value: "$12,450",
      change: "+5% this week",
      icon: "💰",
      color: "warning",
    },
    {
      label: "Avg Rating",
      value: "4.8/5",
      change: "+0.2 this month",
      icon: "⭐",
      color: "primary",
    },
  ]);

  const [recentActivities] = useState<RecentActivity[]>([
    {
      id: 1,
      action: "User suspended",
      user: "john_doe@email.com",
      timestamp: "2 min ago",
      status: "warning",
    },
    {
      id: 2,
      action: "Driver verified",
      user: "jane_smith@email.com",
      timestamp: "15 min ago",
      status: "success",
    },
    {
      id: 3,
      action: "Dispute resolved",
      user: "Ride #45821",
      timestamp: "1 hour ago",
      status: "success",
    },
    {
      id: 4,
      action: "Payment issue",
      user: "alex_jones@email.com",
      timestamp: "2 hours ago",
      status: "error",
    },
  ]);

  const handleAction = async (action: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(action, `Confirm ${action.toLowerCase()}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert("Success", `${action} completed`);
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-success";
      case "warning":
        return "text-warning";
      case "error":
        return "text-error";
      default:
        return "text-muted";
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Admin Dashboard</Text>
            <Text className="text-muted">Platform management and analytics</Text>
          </View>

          {/* Key Metrics */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Key Metrics</Text>
            <FlatList
              scrollEnabled={false}
              numColumns={2}
              columnWrapperStyle={{ gap: 12 }}
              data={metrics}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => (
                <View className="flex-1 bg-surface border border-border rounded-lg p-4 gap-2">
                  <View className="flex-row justify-between items-start">
                    <Text className="text-2xl">{item.icon}</Text>
                    <Text className="text-xs text-success font-semibold">{item.change}</Text>
                  </View>
                  <Text className="text-xs text-muted">{item.label}</Text>
                  <Text className="text-2xl font-bold text-foreground">{item.value}</Text>
                </View>
              )}
            />
          </View>

          {/* Quick Actions */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Quick Actions</Text>
            <View className="gap-2">
              <Pressable
                onPress={() => handleAction("View Disputes")}
                style={({ pressed }) => [
                  {
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <View className="bg-error/10 border border-error rounded-lg p-4 flex-row justify-between items-center">
                  <View className="flex-row gap-3 items-center flex-1">
                    <Text className="text-2xl">⚠️</Text>
                    <View>
                      <Text className="text-sm font-semibold text-foreground">Active Disputes</Text>
                      <Text className="text-xs text-muted">12 pending</Text>
                    </View>
                  </View>
                  <Text className="text-lg">→</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => handleAction("Review Verifications")}
                style={({ pressed }) => [
                  {
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <View className="bg-warning/10 border border-warning rounded-lg p-4 flex-row justify-between items-center">
                  <View className="flex-row gap-3 items-center flex-1">
                    <Text className="text-2xl">📋</Text>
                    <View>
                      <Text className="text-sm font-semibold text-foreground">Driver Verifications</Text>
                      <Text className="text-xs text-muted">8 pending review</Text>
                    </View>
                  </View>
                  <Text className="text-lg">→</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => handleAction("Manage Users")}
                style={({ pressed }) => [
                  {
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <View className="bg-primary/10 border border-primary rounded-lg p-4 flex-row justify-between items-center">
                  <View className="flex-row gap-3 items-center flex-1">
                    <Text className="text-2xl">👥</Text>
                    <View>
                      <Text className="text-sm font-semibold text-foreground">User Management</Text>
                      <Text className="text-xs text-muted">View all users</Text>
                    </View>
                  </View>
                  <Text className="text-lg">→</Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Recent Activity */}
          <View className="gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-semibold text-foreground">Recent Activity</Text>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text className="text-xs text-primary font-semibold">View All</Text>
              </Pressable>
            </View>

            <FlatList
              scrollEnabled={false}
              data={recentActivities}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View className="bg-surface border border-border rounded-lg p-4 gap-2 mb-2 flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">{item.action}</Text>
                    <View className="flex-row justify-between items-center mt-1">
                      <Text className="text-xs text-muted">{item.user}</Text>
                      <Text className={`text-xs font-semibold ${getStatusColor(item.status)}`}>
                        {item.timestamp}
                      </Text>
                    </View>
                  </View>
                  <View className="w-2 h-2 rounded-full bg-primary ml-2" />
                </View>
              )}
            />
          </View>

          {/* System Health */}
          <View className="bg-success/10 border border-success rounded-lg p-4 gap-3">
            <Text className="text-sm font-semibold text-success">✓ System Health</Text>
            <View className="gap-2">
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-success">Server Status</Text>
                <Text className="text-xs font-bold text-success">Operational</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-success">Database</Text>
                <Text className="text-xs font-bold text-success">Healthy</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-success">API Response</Text>
                <Text className="text-xs font-bold text-success">45ms avg</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
