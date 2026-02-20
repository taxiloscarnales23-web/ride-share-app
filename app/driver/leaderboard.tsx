import { ScrollView, Text, View, Pressable, FlatList, Dimensions } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";

interface DriverRanking {
  rank: number;
  driverId: string;
  driverName: string;
  earnings: number;
  acceptanceRate: number;
  rating: number;
  ridesCompleted: number;
  badge?: string;
  bonus?: number;
}

const mockRankings: DriverRanking[] = [
  {
    rank: 1,
    driverId: "driver-001",
    driverName: "Ahmed Hassan",
    earnings: 2850.5,
    acceptanceRate: 99.2,
    rating: 4.98,
    ridesCompleted: 450,
    badge: "⭐",
    bonus: 285.05,
  },
  {
    rank: 2,
    driverId: "driver-002",
    driverName: "Maria Garcia",
    earnings: 2620.75,
    acceptanceRate: 98.5,
    rating: 4.95,
    ridesCompleted: 420,
    badge: "❤️",
    bonus: 131.04,
  },
  {
    rank: 3,
    driverId: "driver-003",
    driverName: "John Smith",
    earnings: 2480.25,
    acceptanceRate: 97.8,
    rating: 4.92,
    ridesCompleted: 395,
    badge: "✅",
    bonus: 49.61,
  },
  {
    rank: 4,
    driverId: "driver-004",
    driverName: "Priya Patel",
    earnings: 2350.0,
    acceptanceRate: 97.2,
    rating: 4.88,
    ridesCompleted: 375,
    badge: "👑",
  },
  {
    rank: 5,
    driverId: "driver-005",
    driverName: "Carlos Rodriguez",
    earnings: 2200.5,
    acceptanceRate: 96.5,
    rating: 4.85,
    ridesCompleted: 350,
    badge: "🌙",
  },
];

const badges = [
  { id: "5-star", name: "5-Star Rated", icon: "⭐", earned: true },
  { id: "safety", name: "Safety Champion", icon: "🛡️", earned: true },
  { id: "reliability", name: "Reliability Expert", icon: "✅", earned: false },
  { id: "earnings", name: "Earnings Master", icon: "💰", earned: false },
  { id: "favorite", name: "Customer Favorite", icon: "❤️", earned: true },
  { id: "consistency", name: "Consistency King", icon: "👑", earned: false },
  { id: "night", name: "Night Owl", icon: "🌙", earned: true },
  { id: "early", name: "Early Bird", icon: "🌅", earned: false },
];

export default function LeaderboardScreen() {
  const colors = useColors();
  const [period, setPeriod] = useState<"weekly" | "monthly" | "allTime">("weekly");
  const [userRank] = useState<DriverRanking>(mockRankings[2]); // Current user is rank 3

  const renderRankingItem = ({ item }: { item: DriverRanking }) => {
    const isCurrentUser = item.driverId === userRank.driverId;
    const medalColor = item.rank === 1 ? "#FFD700" : item.rank === 2 ? "#C0C0C0" : item.rank === 3 ? "#CD7F32" : colors.muted;

    return (
      <Pressable
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.7 : 1,
            marginBottom: 12,
            borderRadius: 12,
            backgroundColor: isCurrentUser ? colors.primary + "20" : colors.surface,
            borderWidth: isCurrentUser ? 2 : 1,
            borderColor: isCurrentUser ? colors.primary : colors.border,
            padding: 16,
          },
        ]}
      >
        <View className="gap-3">
          {/* Header with rank and driver info */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: medalColor }}
              >
                <Text className="text-lg font-bold text-background">{item.rank}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">{item.driverName}</Text>
                <Text className="text-xs text-muted">{item.ridesCompleted} rides</Text>
              </View>
            </View>
            {item.badge && <Text className="text-2xl">{item.badge}</Text>}
          </View>

          {/* Stats row */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs text-muted mb-1">Earnings</Text>
              <Text className="text-lg font-bold text-foreground">${item.earnings.toFixed(2)}</Text>
              {item.bonus && (
                <Text className="text-xs text-success">+${item.bonus.toFixed(2)} bonus</Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-xs text-muted mb-1">Rating</Text>
              <Text className="text-lg font-bold text-foreground">{item.rating.toFixed(2)}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-muted mb-1">Acceptance</Text>
              <Text className="text-lg font-bold text-foreground">{item.acceptanceRate.toFixed(1)}%</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderBadge = ({ item }: { item: (typeof badges)[0] }) => (
    <Pressable
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 : 1,
          width: Dimensions.get("window").width / 4 - 16,
          aspectRatio: 1,
          marginBottom: 12,
          marginRight: 12,
          borderRadius: 12,
          backgroundColor: item.earned ? colors.primary + "20" : colors.surface,
          borderWidth: 1,
          borderColor: item.earned ? colors.primary : colors.border,
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        },
      ]}
    >
      <Text className="text-3xl">{item.icon}</Text>
      <Text
        className="text-xs font-semibold text-center"
        style={{ color: item.earned ? colors.foreground : colors.muted }}
      >
        {item.name}
      </Text>
    </Pressable>
  );

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Leaderboard</Text>
            <Text className="text-base text-muted">Compete and earn rewards</Text>
          </View>

          {/* Period Selector */}
          <View className="flex-row gap-2">
            {(["weekly", "monthly", "allTime"] as const).map((p) => (
              <Pressable
                key={p}
                onPress={() => setPeriod(p)}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    backgroundColor: period === p ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: period === p ? colors.primary : colors.border,
                    alignItems: "center",
                  },
                ]}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: period === p ? colors.background : colors.foreground }}
                >
                  {p === "allTime" ? "All Time" : p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Your Rank Card */}
          <View
            className="rounded-lg p-4 gap-3 border-2"
            style={{ backgroundColor: colors.primary + "10", borderColor: colors.primary }}
          >
            <Text className="text-sm font-semibold text-muted uppercase">Your Position</Text>
            <View className="flex-row items-center justify-between">
              <View className="gap-2">
                <Text className="text-2xl font-bold text-foreground">#{userRank.rank}</Text>
                <Text className="text-base text-muted">${userRank.earnings.toFixed(2)} earned</Text>
              </View>
              <View className="items-center gap-1">
                <Text className="text-3xl">{userRank.badge}</Text>
                <Text className="text-xs text-muted">+${userRank.bonus?.toFixed(2) || "0"} bonus</Text>
              </View>
            </View>
          </View>

          {/* Top Drivers */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Top Drivers</Text>
            <FlatList
              data={mockRankings}
              renderItem={renderRankingItem}
              keyExtractor={(item) => item.driverId}
              scrollEnabled={false}
            />
          </View>

          {/* Badges Section */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">Achievements</Text>
              <Text className="text-sm text-muted">3 of 8 earned</Text>
            </View>
            <View className="flex-row flex-wrap">
              <FlatList
                data={badges}
                renderItem={renderBadge}
                keyExtractor={(item) => item.id}
                numColumns={4}
                scrollEnabled={false}
                columnWrapperStyle={{ gap: 12 }}
              />
            </View>
          </View>

          {/* Info Box */}
          <View
            className="rounded-lg p-4 gap-2"
            style={{ backgroundColor: colors.primary + "15" }}
          >
            <Text className="text-sm font-semibold text-foreground">💡 How to Climb</Text>
            <Text className="text-sm text-muted leading-relaxed">
              Complete more rides, maintain high ratings, and improve your acceptance rate to earn bonuses and climb the leaderboard.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
