import { ScrollView, Text, View, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";

export default function AdminAnalyticsDashboard() {
  const colors = useColors();
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");

  // Mock analytics data
  const analyticsData = {
    totalRides: 1247,
    totalRevenue: 12470,
    activeDrivers: 89,
    activeRiders: 342,
    averageRating: 4.7,
    completionRate: 96.2,
    peakHour: "18:00-19:00",
    averageFare: 9.99,
  };

  const topRoutes = [
    { route: "Downtown → Airport", rides: 156, revenue: 2340 },
    { route: "Station → Downtown", rides: 143, revenue: 1859 },
    { route: "Downtown → Hospital", rides: 128, revenue: 1664 },
    { route: "Airport → Downtown", rides: 112, revenue: 1680 },
    { route: "Station → Hospital", rides: 98, revenue: 1274 },
  ];

  const systemHealth = {
    uptime: "99.8%",
    avgResponseTime: "145ms",
    errorRate: "0.2%",
    activeConnections: 234,
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">
              Analytics Dashboard
            </Text>
            <Text className="text-sm text-muted">
              Platform metrics and performance overview
            </Text>
          </View>

          {/* Time Range Selector */}
          <View className="flex-row gap-2">
            {(["24h", "7d", "30d"] as const).map((range) => (
              <Pressable
                key={range}
                onPress={() => setTimeRange(range)}
                style={({ pressed }) => [
                  {
                    backgroundColor:
                      timeRange === range ? colors.primary : colors.surface,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                className="flex-1 py-2 px-3 rounded-lg items-center"
              >
                <Text
                  className={`font-semibold ${
                    timeRange === range ? "text-background" : "text-foreground"
                  }`}
                >
                  {range}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Key Metrics Grid */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Key Metrics
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <View
                className="flex-1 min-w-[45%] bg-surface rounded-lg p-4"
                style={{ minHeight: 100 }}
              >
                <Text className="text-xs text-muted mb-1">Total Rides</Text>
                <Text className="text-2xl font-bold text-primary">
                  {analyticsData.totalRides.toLocaleString()}
                </Text>
                <Text className="text-xs text-success mt-2">+12.5% vs last period</Text>
              </View>

              <View
                className="flex-1 min-w-[45%] bg-surface rounded-lg p-4"
                style={{ minHeight: 100 }}
              >
                <Text className="text-xs text-muted mb-1">Total Revenue</Text>
                <Text className="text-2xl font-bold text-primary">
                  ${analyticsData.totalRevenue.toLocaleString()}
                </Text>
                <Text className="text-xs text-success mt-2">+8.3% vs last period</Text>
              </View>

              <View
                className="flex-1 min-w-[45%] bg-surface rounded-lg p-4"
                style={{ minHeight: 100 }}
              >
                <Text className="text-xs text-muted mb-1">Active Drivers</Text>
                <Text className="text-2xl font-bold text-primary">
                  {analyticsData.activeDrivers}
                </Text>
                <Text className="text-xs text-success mt-2">+5 new drivers</Text>
              </View>

              <View
                className="flex-1 min-w-[45%] bg-surface rounded-lg p-4"
                style={{ minHeight: 100 }}
              >
                <Text className="text-xs text-muted mb-1">Active Riders</Text>
                <Text className="text-2xl font-bold text-primary">
                  {analyticsData.activeRiders}
                </Text>
                <Text className="text-xs text-success mt-2">+42 new riders</Text>
              </View>

              <View
                className="flex-1 min-w-[45%] bg-surface rounded-lg p-4"
                style={{ minHeight: 100 }}
              >
                <Text className="text-xs text-muted mb-1">Avg Rating</Text>
                <Text className="text-2xl font-bold text-primary">
                  {analyticsData.averageRating}★
                </Text>
                <Text className="text-xs text-success mt-2">Excellent</Text>
              </View>

              <View
                className="flex-1 min-w-[45%] bg-surface rounded-lg p-4"
                style={{ minHeight: 100 }}
              >
                <Text className="text-xs text-muted mb-1">Completion Rate</Text>
                <Text className="text-2xl font-bold text-primary">
                  {analyticsData.completionRate}%
                </Text>
                <Text className="text-xs text-success mt-2">+1.2% vs last period</Text>
              </View>
            </View>
          </View>

          {/* Top Routes */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Top Routes
            </Text>
            <View className="bg-surface rounded-lg overflow-hidden">
              {topRoutes.map((route, index) => (
                <View
                  key={index}
                  className={`p-4 flex-row justify-between items-center ${
                    index !== topRoutes.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">
                      {route.route}
                    </Text>
                    <Text className="text-xs text-muted mt-1">
                      {route.rides} rides • ${route.revenue.toLocaleString()}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-bold text-primary">
                      #{index + 1}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* System Health */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              System Health
            </Text>
            <View className="bg-surface rounded-lg p-4 gap-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted">Uptime</Text>
                <Text className="text-sm font-semibold text-success">
                  {systemHealth.uptime}
                </Text>
              </View>
              <View className="flex-row justify-between items-center border-t border-border pt-3">
                <Text className="text-sm text-muted">Avg Response Time</Text>
                <Text className="text-sm font-semibold text-success">
                  {systemHealth.avgResponseTime}
                </Text>
              </View>
              <View className="flex-row justify-between items-center border-t border-border pt-3">
                <Text className="text-sm text-muted">Error Rate</Text>
                <Text className="text-sm font-semibold text-success">
                  {systemHealth.errorRate}
                </Text>
              </View>
              <View className="flex-row justify-between items-center border-t border-border pt-3">
                <Text className="text-sm text-muted">Active Connections</Text>
                <Text className="text-sm font-semibold text-primary">
                  {systemHealth.activeConnections}
                </Text>
              </View>
            </View>
          </View>

          {/* Additional Stats */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Additional Stats
            </Text>
            <View className="bg-surface rounded-lg p-4 gap-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted">Peak Hour</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {analyticsData.peakHour}
                </Text>
              </View>
              <View className="flex-row justify-between items-center border-t border-border pt-3">
                <Text className="text-sm text-muted">Average Fare</Text>
                <Text className="text-sm font-semibold text-foreground">
                  ${analyticsData.averageFare}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-2">
            <Pressable
              style={({ pressed }) => [
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              className="py-3 px-4 rounded-lg items-center"
            >
              <Text className="text-background font-semibold">
                Export Report
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                {
                  backgroundColor: colors.surface,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              className="py-3 px-4 rounded-lg items-center border border-border"
            >
              <Text className="text-foreground font-semibold">
                View Detailed Analytics
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
