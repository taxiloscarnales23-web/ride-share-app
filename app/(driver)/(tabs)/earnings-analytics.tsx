import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function EarningsAnalyticsScreen() {
  const colors = useColors();

  const earningsData = {
    today: {
      rides: 12,
      earnings: "$156.80",
      distance: "45.2 km",
      time: "4h 32m",
    },
    thisWeek: {
      rides: 67,
      earnings: "$892.50",
      distance: "234.8 km",
      time: "22h 15m",
    },
    thisMonth: {
      rides: 287,
      earnings: "$3,842.75",
      distance: "1,024.5 km",
      time: "96h 30m",
    },
  };

  const topEarningDays = [
    { day: "Monday", earnings: "$156.80", rides: 12 },
    { day: "Tuesday", earnings: "$142.50", rides: 11 },
    { day: "Wednesday", earnings: "$168.20", rides: 13 },
    { day: "Thursday", earnings: "$175.40", rides: 14 },
    { day: "Friday", earnings: "$189.60", rides: 15 },
    { day: "Saturday", earnings: "$210.30", rides: 17 },
    { day: "Sunday", earnings: "$192.75", rides: 16 },
  ];

  const averageRating = 4.8;
  const totalRides = 287;
  const acceptanceRate = 94;
  const cancellationRate = 2;

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Earnings</Text>
            <Text className="text-muted">Track your income and performance</Text>
          </View>

          {/* Summary Cards */}
          <View className="gap-3">
            {/* Today */}
            <View className="bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-xs text-muted mb-2">TODAY</Text>
              <View className="flex-row justify-between items-end">
                <View>
                  <Text className="text-3xl font-bold text-primary">{earningsData.today.earnings}</Text>
                  <Text className="text-xs text-muted mt-1">{earningsData.today.rides} rides</Text>
                </View>
                <View className="text-right">
                  <Text className="text-sm text-muted">{earningsData.today.distance}</Text>
                  <Text className="text-sm text-muted">{earningsData.today.time}</Text>
                </View>
              </View>
            </View>

            {/* This Week */}
            <View className="bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-xs text-muted mb-2">THIS WEEK</Text>
              <View className="flex-row justify-between items-end">
                <View>
                  <Text className="text-3xl font-bold text-success">{earningsData.thisWeek.earnings}</Text>
                  <Text className="text-xs text-muted mt-1">{earningsData.thisWeek.rides} rides</Text>
                </View>
                <View className="text-right">
                  <Text className="text-sm text-muted">{earningsData.thisWeek.distance}</Text>
                  <Text className="text-sm text-muted">{earningsData.thisWeek.time}</Text>
                </View>
              </View>
            </View>

            {/* This Month */}
            <View className="bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-xs text-muted mb-2">THIS MONTH</Text>
              <View className="flex-row justify-between items-end">
                <View>
                  <Text className="text-3xl font-bold" style={{ color: colors.primary }}>
                    {earningsData.thisMonth.earnings}
                  </Text>
                  <Text className="text-xs text-muted mt-1">{earningsData.thisMonth.rides} rides</Text>
                </View>
                <View className="text-right">
                  <Text className="text-sm text-muted">{earningsData.thisMonth.distance}</Text>
                  <Text className="text-sm text-muted">{earningsData.thisMonth.time}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Performance Metrics */}
          <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
            <Text className="text-sm font-semibold text-foreground">Performance</Text>

            <View className="flex-row justify-between">
              <View className="flex-1">
                <Text className="text-xs text-muted mb-1">Rating</Text>
                <Text className="text-2xl font-bold text-primary">⭐ {averageRating}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-muted mb-1">Total Rides</Text>
                <Text className="text-2xl font-bold text-primary">{totalRides}</Text>
              </View>
            </View>

            <View className="h-px bg-border" />

            <View className="flex-row justify-between">
              <View className="flex-1">
                <Text className="text-xs text-muted mb-1">Acceptance Rate</Text>
                <Text className="text-lg font-bold text-success">{acceptanceRate}%</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-muted mb-1">Cancellation Rate</Text>
                <Text className="text-lg font-bold text-error">{cancellationRate}%</Text>
              </View>
            </View>
          </View>

          {/* Weekly Breakdown */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Weekly Breakdown</Text>

            {topEarningDays.map((day, index) => (
              <View key={index} className="flex-row items-center justify-between bg-surface rounded-lg p-3 border border-border">
                <View className="flex-1">
                  <Text className="font-semibold text-foreground">{day.day}</Text>
                  <Text className="text-xs text-muted">{day.rides} rides</Text>
                </View>
                <View className="text-right">
                  <Text className="font-bold text-primary">{day.earnings}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Tips */}
          <View className="bg-primary/10 rounded-lg p-4 border border-primary gap-2">
            <Text className="text-sm font-semibold text-primary">💡 Pro Tips</Text>
            <Text className="text-xs text-primary">• Peak hours (7-9 AM, 5-7 PM) have higher demand</Text>
            <Text className="text-xs text-primary">• Maintain high rating to get more ride requests</Text>
            <Text className="text-xs text-primary">• Accept rides quickly to increase earnings</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
