import { ScrollView, Text, View, Pressable, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import * as Haptics from "expo-haptics";

interface AnalyticsData {
  label: string;
  value: string;
  change: string;
  icon: string;
}

interface ChartData {
  day: string;
  earnings: string;
  rides: number;
}

export default function AnalyticsScreen() {
  const colors = useColors();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");
  const [analyticsData] = useState<AnalyticsData[]>([
    {
      label: "Total Earnings",
      value: "$1,245",
      change: "+15% vs last week",
      icon: "💰",
    },
    {
      label: "Total Rides",
      value: "87",
      change: "+12 rides",
      icon: "🚗",
    },
    {
      label: "Avg Rating",
      value: "4.9/5",
      change: "+0.1 points",
      icon: "⭐",
    },
    {
      label: "Acceptance Rate",
      value: "94%",
      change: "+3%",
      icon: "✓",
    },
  ]);

  const [chartData] = useState<ChartData[]>([
    { day: "Mon", earnings: "$156", rides: 12 },
    { day: "Tue", earnings: "$189", rides: 15 },
    { day: "Wed", earnings: "$145", rides: 11 },
    { day: "Thu", earnings: "$201", rides: 16 },
    { day: "Fri", earnings: "$234", rides: 19 },
    { day: "Sat", earnings: "$198", rides: 14 },
    { day: "Sun", earnings: "$122", rides: 9 },
  ]);

  const handleExportReport = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Analytics</Text>
            <Text className="text-muted">Your performance metrics</Text>
          </View>

          {/* Time Range Selector */}
          <View className="flex-row gap-2">
            {(["week", "month", "year"] as const).map((range) => (
              <Pressable
                key={range}
                onPress={() => {
                  setTimeRange(range);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <View
                  className={`rounded-lg px-4 py-2 ${
                    timeRange === range
                      ? "bg-primary"
                      : "bg-surface border border-border"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      timeRange === range ? "text-white" : "text-foreground"
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Key Metrics */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Key Metrics</Text>
            <FlatList
              scrollEnabled={false}
              numColumns={2}
              columnWrapperStyle={{ gap: 12 }}
              data={analyticsData}
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

          {/* Earnings Chart */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Weekly Earnings</Text>
            <View className="bg-surface border border-border rounded-lg p-4 gap-4">
              {/* Simple bar chart representation */}
              <View className="gap-3">
                {chartData.map((data, index) => {
                  const maxEarnings = 250;
                  const percentage = (parseInt(data.earnings.replace(/[$,]/g, "")) / maxEarnings) * 100;
                  return (
                    <View key={index} className="gap-1">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-xs font-semibold text-foreground">{data.day}</Text>
                        <View className="flex-row gap-2 items-center">
                          <Text className="text-xs font-bold text-primary">{data.earnings}</Text>
                          <Text className="text-xs text-muted">{data.rides} rides</Text>
                        </View>
                      </View>
                      <View className="h-2 bg-border rounded-full overflow-hidden">
                        <View
                          className="h-full rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: colors.primary,
                          }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Performance Breakdown */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Performance Breakdown</Text>
            <View className="bg-surface border border-border rounded-lg p-4 gap-3">
              <View className="flex-row justify-between items-center pb-3 border-b border-border">
                <Text className="text-sm text-foreground">Peak Hours</Text>
                <Text className="text-sm font-bold text-primary">6-9 PM</Text>
              </View>
              <View className="flex-row justify-between items-center pb-3 border-b border-border">
                <Text className="text-sm text-foreground">Best Day</Text>
                <Text className="text-sm font-bold text-primary">Friday</Text>
              </View>
              <View className="flex-row justify-between items-center pb-3 border-b border-border">
                <Text className="text-sm text-foreground">Avg Trip Duration</Text>
                <Text className="text-sm font-bold text-primary">18 min</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-foreground">Cancellation Rate</Text>
                <Text className="text-sm font-bold text-success">2%</Text>
              </View>
            </View>
          </View>

          {/* Export Report */}
          <Pressable
            onPress={handleExportReport}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <View
              className="rounded-lg py-4 items-center justify-center flex-row gap-2"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-lg">📊</Text>
              <Text className="text-white font-bold">Export Report</Text>
            </View>
          </Pressable>

          {/* Tips */}
          <View className="bg-primary/10 rounded-lg p-4 gap-2">
            <Text className="text-sm font-semibold text-primary">💡 Analytics Tips</Text>
            <Text className="text-xs text-primary">• Peak hours typically 6-9 PM and weekends</Text>
            <Text className="text-xs text-primary">• Maintain high acceptance rate for better matching</Text>
            <Text className="text-xs text-primary">• Focus on high-rated routes for better earnings</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
