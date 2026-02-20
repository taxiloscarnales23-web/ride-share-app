import { ScrollView, Text, View, Pressable, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";

interface EarningsData {
  period: "week" | "month";
  totalEarnings: number;
  totalRides: number;
  averageRating: number;
  acceptanceRate: number;
  cancellationRate: number;
  bonusEarnings: number;
  incentives: Array<{
    name: string;
    amount: number;
    condition: string;
  }>;
  dailyBreakdown: Array<{
    date: string;
    earnings: number;
    rides: number;
  }>;
}

export default function EarningsDashboardScreen() {
  const colors = useColors();
  const [period, setPeriod] = useState<"week" | "month">("week");

  const earningsData: Record<"week" | "month", EarningsData> = {
    week: {
      period: "week",
      totalEarnings: 487.5,
      totalRides: 32,
      averageRating: 4.85,
      acceptanceRate: 94,
      cancellationRate: 2,
      bonusEarnings: 50,
      incentives: [
        {
          name: "Acceptance Bonus",
          amount: 25,
          condition: "95% acceptance rate",
        },
        {
          name: "Rating Bonus",
          amount: 15,
          condition: "4.8+ rating",
        },
        {
          name: "Peak Hours Bonus",
          amount: 10,
          condition: "10 rides during peak hours",
        },
      ],
      dailyBreakdown: [
        { date: "Mon", earnings: 65, rides: 5 },
        { date: "Tue", earnings: 72, rides: 6 },
        { date: "Wed", earnings: 68, rides: 5 },
        { date: "Thu", earnings: 78, rides: 6 },
        { date: "Fri", earnings: 85, rides: 7 },
        { date: "Sat", earnings: 92, rides: 8 },
        { date: "Sun", earnings: 27.5, rides: 2 },
      ],
    },
    month: {
      period: "month",
      totalEarnings: 2156.75,
      totalRides: 148,
      averageRating: 4.82,
      acceptanceRate: 92,
      cancellationRate: 3,
      bonusEarnings: 220,
      incentives: [
        {
          name: "Monthly Acceptance Bonus",
          amount: 100,
          condition: "90%+ acceptance rate",
        },
        {
          name: "Monthly Rating Bonus",
          amount: 75,
          condition: "4.8+ average rating",
        },
        {
          name: "Referral Bonus",
          amount: 45,
          condition: "2 successful referrals",
        },
      ],
      dailyBreakdown: [
        { date: "Week 1", earnings: 487.5, rides: 32 },
        { date: "Week 2", earnings: 512.25, rides: 35 },
        { date: "Week 3", earnings: 498.5, rides: 33 },
        { date: "Week 4", earnings: 658.5, rides: 48 },
      ],
    },
  };

  const data = earningsData[period];

  const renderIncentive = ({ item }: { item: (typeof data.incentives)[0] }) => (
    <View
      className="rounded-lg p-3 mb-2 flex-row items-center justify-between border border-border"
      style={{ backgroundColor: colors.surface }}
    >
      <View className="flex-1 gap-1">
        <Text className="text-sm font-semibold text-foreground">{item.name}</Text>
        <Text className="text-xs text-muted">{item.condition}</Text>
      </View>
      <Text className="text-base font-bold text-success">+${item.amount}</Text>
    </View>
  );

  const renderDailyBreakdown = ({ item }: { item: (typeof data.dailyBreakdown)[0] }) => (
    <View className="items-center gap-2 flex-1">
      <View
        className="w-12 rounded-lg items-center justify-center"
        style={{
          height: Math.max(40, (item.earnings / Math.max(...data.dailyBreakdown.map((d) => d.earnings))) * 100),
          backgroundColor: colors.primary,
        }}
      />
      <Text className="text-xs font-semibold text-foreground">{item.date}</Text>
      <Text className="text-xs text-muted">${item.earnings}</Text>
    </View>
  );

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Earnings</Text>
            <Text className="text-base text-muted">Track your income and bonuses</Text>
          </View>

          {/* Period Toggle */}
          <View className="flex-row gap-2">
            {(["week", "month"] as const).map((p) => (
              <Pressable
                key={p}
                onPress={() => setPeriod(p)}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    opacity: pressed ? 0.7 : 1,
                    backgroundColor: period === p ? colors.primary : colors.surface,
                    borderColor: period === p ? colors.primary : colors.border,
                  },
                  {
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    borderWidth: 1,
                    alignItems: "center",
                  },
                ]}
              >
                <Text
                  className="font-semibold capitalize"
                  style={{
                    color: period === p ? colors.background : colors.foreground,
                  }}
                >
                  This {p}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Total Earnings Card */}
          <View
            className="rounded-xl p-6 gap-4"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-sm font-semibold text-background opacity-80">
              Total Earnings
            </Text>
            <Text className="text-4xl font-bold text-background">
              ${data.totalEarnings.toFixed(2)}
            </Text>
            <View className="flex-row gap-6">
              <View>
                <Text className="text-xs text-background opacity-70">Rides</Text>
                <Text className="text-lg font-bold text-background">{data.totalRides}</Text>
              </View>
              <View>
                <Text className="text-xs text-background opacity-70">Avg Rating</Text>
                <Text className="text-lg font-bold text-background">⭐ {data.averageRating}</Text>
              </View>
            </View>
          </View>

          {/* Performance Metrics */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-muted uppercase">Performance</Text>
            <View className="flex-row gap-3">
              <View
                className="flex-1 rounded-lg p-4 gap-2"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-xs text-muted">Acceptance Rate</Text>
                <Text className="text-2xl font-bold text-foreground">
                  {data.acceptanceRate}%
                </Text>
              </View>
              <View
                className="flex-1 rounded-lg p-4 gap-2"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-xs text-muted">Cancellation Rate</Text>
                <Text className="text-2xl font-bold text-error">
                  {data.cancellationRate}%
                </Text>
              </View>
            </View>
          </View>

          {/* Bonus Earnings */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-muted uppercase">Bonuses</Text>
              <Text className="text-lg font-bold text-success">
                +${data.bonusEarnings}
              </Text>
            </View>
            <FlatList
              data={data.incentives}
              renderItem={renderIncentive}
              keyExtractor={(_, i) => i.toString()}
              scrollEnabled={false}
            />
          </View>

          {/* Daily Breakdown Chart */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-muted uppercase">
              {period === "week" ? "Daily" : "Weekly"} Breakdown
            </Text>
            <View
              className="rounded-lg p-4 gap-4 flex-row items-flex-end"
              style={{ backgroundColor: colors.surface, height: 200 }}
            >
              <FlatList
                data={data.dailyBreakdown}
                renderItem={renderDailyBreakdown}
                keyExtractor={(_, i) => i.toString()}
                scrollEnabled={false}
                numColumns={data.dailyBreakdown.length}
              />
            </View>
          </View>

          {/* Export Button */}
          <Pressable
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.8 : 1,
                backgroundColor: colors.primary,
              },
              {
                paddingVertical: 16,
                paddingHorizontal: 16,
                borderRadius: 12,
                alignItems: "center",
              },
            ]}
          >
            <Text className="text-base font-semibold text-background">
              📄 Export as PDF
            </Text>
          </Pressable>

          {/* Tax Info */}
          <View
            className="rounded-lg p-4 gap-2"
            style={{ backgroundColor: colors.warning + "15" }}
          >
            <Text className="text-sm font-semibold text-foreground">
              💼 Tax Information
            </Text>
            <Text className="text-sm text-muted leading-relaxed">
              Your earnings are tracked for tax purposes. Download your earnings report
              for tax filing.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
