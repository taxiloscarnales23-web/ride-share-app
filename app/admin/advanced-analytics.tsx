import { ScrollView, Text, View, Pressable, Dimensions } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";

export default function AdvancedAnalyticsScreen() {
  const colors = useColors();
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week");

  const metrics = {
    totalRides: 1247,
    totalRevenue: 12470,
    activeDrivers: 89,
    activeRiders: 342,
    averageRating: 4.7,
    completionRate: 96.2,
  };

  const dailyData = [
    { day: "Mon", rides: 156, revenue: 1560, rating: 4.6 },
    { day: "Tue", rides: 168, revenue: 1680, rating: 4.7 },
    { day: "Wed", rides: 142, revenue: 1420, rating: 4.5 },
    { day: "Thu", rides: 189, revenue: 1890, rating: 4.8 },
    { day: "Fri", rides: 201, revenue: 2010, rating: 4.9 },
    { day: "Sat", revenue: 2240, rides: 224, rating: 4.8 },
    { day: "Sun", rides: 182, revenue: 1820, rating: 4.7 },
  ];

  const topRoutes = [
    { route: "Downtown → Airport", rides: 234, revenue: 3510 },
    { route: "Airport → Downtown", rides: 198, revenue: 2970 },
    { route: "Downtown → Hospital", rides: 156, revenue: 1560 },
    { route: "Station → Downtown", rides: 142, revenue: 1420 },
    { route: "Mall → Residential", rides: 128, revenue: 1280 },
  ];

  const driverPerformance = [
    { name: "Alex Johnson", rides: 156, rating: 4.9, earnings: 3120 },
    { name: "Maria Garcia", rides: 142, rating: 4.8, earnings: 2840 },
    { name: "James Smith", rides: 128, rating: 4.7, earnings: 2560 },
    { name: "Sarah Williams", rides: 115, rating: 4.6, earnings: 2300 },
  ];

  const peakHours = [
    { hour: "6-7am", rides: 45, revenue: 450 },
    { hour: "7-9am", rides: 128, revenue: 1280 },
    { hour: "12-1pm", rides: 89, revenue: 890 },
    { hour: "5-7pm", rides: 245, revenue: 2450 },
    { hour: "8-10pm", rides: 156, revenue: 1560 },
  ];

  const riderSegmentation = [
    { segment: "Frequent (20+ rides)", count: 45, percentage: 13.2 },
    { segment: "Regular (5-19 rides)", count: 98, percentage: 28.7 },
    { segment: "Occasional (1-4 rides)", count: 156, percentage: 45.6 },
    { segment: "New (<1 month)", count: 43, percentage: 12.6 },
  ];

  const maxRides = Math.max(...dailyData.map((d) => d.rides));
  const maxRevenue = Math.max(...dailyData.map((d) => d.revenue));

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">
              Advanced Analytics
            </Text>
            <Text className="text-sm text-muted">
              Comprehensive platform insights and metrics
            </Text>
          </View>

          {/* Time Range Selector */}
          <View className="flex-row gap-2 bg-surface rounded-lg p-1">
            {(["day", "week", "month"] as const).map((range) => (
              <Pressable
                key={range}
                onPress={() => setTimeRange(range)}
                style={({ pressed }) => [
                  {
                    backgroundColor:
                      timeRange === range ? colors.primary : "transparent",
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                className="flex-1 py-2 px-3 rounded items-center"
              >
                <Text
                  className={`font-semibold text-xs ${
                    timeRange === range ? "text-background" : "text-foreground"
                  }`}
                >
                  {range === "day" ? "Day" : range === "week" ? "Week" : "Month"}
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
              {[
                { label: "Total Rides", value: metrics.totalRides },
                { label: "Revenue", value: `$${metrics.totalRevenue}` },
                { label: "Active Drivers", value: metrics.activeDrivers },
                { label: "Active Riders", value: metrics.activeRiders },
                { label: "Avg Rating", value: metrics.averageRating },
                {
                  label: "Completion Rate",
                  value: `${metrics.completionRate}%`,
                },
              ].map((metric, idx) => (
                <View
                  key={idx}
                  className="bg-surface rounded-lg p-3 border border-border flex-1"
                  style={{ minWidth: "48%" }}
                >
                  <Text className="text-xs text-muted mb-1">{metric.label}</Text>
                  <Text className="text-lg font-bold text-primary">
                    {metric.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Daily Rides Chart */}
          <View className="bg-surface rounded-lg p-4 border border-border gap-3">
            <Text className="font-semibold text-foreground">
              Daily Ride Volume
            </Text>
            <View className="gap-2">
              {dailyData.map((data, idx) => (
                <View key={idx} className="gap-1">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-xs text-muted">{data.day}</Text>
                    <Text className="text-xs font-semibold text-foreground">
                      {data.rides} rides
                    </Text>
                  </View>
                  <View className="bg-background rounded-full h-2 overflow-hidden">
                    <View
                      className="bg-primary rounded-full h-2"
                      style={{
                        width: `${(data.rides / maxRides) * 100}%`,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Revenue Trend */}
          <View className="bg-surface rounded-lg p-4 border border-border gap-3">
            <Text className="font-semibold text-foreground">
              Daily Revenue Trend
            </Text>
            <View className="gap-2">
              {dailyData.map((data, idx) => (
                <View key={idx} className="gap-1">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-xs text-muted">{data.day}</Text>
                    <Text className="text-xs font-semibold text-foreground">
                      ${data.revenue}
                    </Text>
                  </View>
                  <View className="bg-background rounded-full h-2 overflow-hidden">
                    <View
                      className="bg-success rounded-full h-2"
                      style={{
                        width: `${(data.revenue / maxRevenue) * 100}%`,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Top Routes */}
          <View className="bg-surface rounded-lg p-4 border border-border gap-3">
            <Text className="font-semibold text-foreground">Top Routes</Text>
            <View className="gap-2">
              {topRoutes.map((route, idx) => (
                <View
                  key={idx}
                  className="flex-row justify-between items-center pb-2 border-b border-border"
                >
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">
                      {route.route}
                    </Text>
                    <Text className="text-xs text-muted mt-1">
                      {route.rides} rides • ${route.revenue}
                    </Text>
                  </View>
                  <View
                    className="px-2 py-1 rounded"
                    style={{ backgroundColor: colors.primary + "20" }}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: colors.primary }}
                    >
                      #{idx + 1}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Peak Hours */}
          <View className="bg-surface rounded-lg p-4 border border-border gap-3">
            <Text className="font-semibold text-foreground">Peak Hours</Text>
            <View className="gap-2">
              {peakHours.map((hour, idx) => (
                <View key={idx} className="gap-1">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-xs text-muted">{hour.hour}</Text>
                    <Text className="text-xs font-semibold text-foreground">
                      {hour.rides} rides
                    </Text>
                  </View>
                  <View className="bg-background rounded-full h-2 overflow-hidden">
                    <View
                      className="bg-warning rounded-full h-2"
                      style={{
                        width: `${(hour.rides / Math.max(...peakHours.map((h) => h.rides))) * 100}%`,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Driver Performance */}
          <View className="bg-surface rounded-lg p-4 border border-border gap-3">
            <Text className="font-semibold text-foreground">
              Top Drivers by Performance
            </Text>
            <View className="gap-2">
              {driverPerformance.map((driver, idx) => (
                <View
                  key={idx}
                  className="flex-row justify-between items-center pb-2 border-b border-border"
                >
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">
                      {driver.name}
                    </Text>
                    <Text className="text-xs text-muted mt-1">
                      {driver.rides} rides • ⭐ {driver.rating}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-semibold text-success">
                      ${driver.earnings}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Rider Segmentation */}
          <View className="bg-surface rounded-lg p-4 border border-border gap-3">
            <Text className="font-semibold text-foreground">
              Rider Segmentation
            </Text>
            <View className="gap-2">
              {riderSegmentation.map((segment, idx) => (
                <View key={idx} className="gap-1">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-xs text-muted">{segment.segment}</Text>
                    <Text className="text-xs font-semibold text-foreground">
                      {segment.count} users ({segment.percentage}%)
                    </Text>
                  </View>
                  <View className="bg-background rounded-full h-2 overflow-hidden">
                    <View
                      className="bg-primary rounded-full h-2"
                      style={{
                        width: `${segment.percentage}%`,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Export Options */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">
              Export Reports
            </Text>
            <View className="flex-row gap-2">
              {["PDF", "CSV", "Excel"].map((format) => (
                <Pressable
                  key={format}
                  style={({ pressed }) => [
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  className="flex-1 py-2 px-3 rounded border items-center"
                >
                  <Text className="text-sm font-semibold text-foreground">
                    {format}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
