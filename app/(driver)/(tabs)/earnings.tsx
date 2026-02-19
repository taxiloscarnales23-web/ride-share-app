import { ScrollView, Text, View, FlatList, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

export default function DriverEarningsScreen() {
  const colors = useColors();
  const rideHistory = trpc.drivers.getRideHistory.useQuery();

  const calculateTotalEarnings = () => {
    const rides = rideHistory.data || [];
    return rides.reduce((total, ride) => {
      const fare = parseFloat(ride.actualFare || ride.estimatedFare || "0");
      const tip = parseFloat(ride.tip || "0");
      return total + fare + tip;
    }, 0);
  };

  const renderEarningItem = ({ item }: any) => (
    <View className="bg-surface rounded-lg p-4 mb-3 border border-border">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-sm font-semibold text-foreground">{item.pickupAddress}</Text>
          <Text className="text-xs text-muted mt-1">→ {item.dropoffAddress}</Text>
        </View>
        <View className="items-end">
          <Text className="text-lg font-bold text-success">${item.actualFare || item.estimatedFare}</Text>
          {item.tip && <Text className="text-xs text-warning">+${item.tip} tip</Text>}
        </View>
      </View>
      <View className="flex-row justify-between items-center pt-2 border-t border-border">
        <Text className="text-xs text-muted">
          {new Date(item.completedAt || item.requestedAt).toLocaleDateString()}
        </Text>
        <View
          className="px-2 py-1 rounded"
          style={{ backgroundColor: item.status === "completed" ? colors.success : colors.warning }}
        >
          <Text className="text-xs font-semibold text-white capitalize">{item.status}</Text>
        </View>
      </View>
    </View>
  );

  if (rideHistory.isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.warning} />
      </ScreenContainer>
    );
  }

  const rides = rideHistory.data || [];
  const totalEarnings = calculateTotalEarnings();
  const completedRides = rides.filter((r) => r.status === "completed").length;

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Earnings</Text>
            <Text className="text-sm text-muted">Track your income</Text>
          </View>

          {/* Total Earnings Card */}
          <View className="bg-gradient-to-r rounded-lg p-6 border border-border" style={{ backgroundColor: colors.primary }}>
            <Text className="text-sm text-white opacity-80 mb-2">Total Earnings (This Month)</Text>
            <Text className="text-4xl font-bold text-white">${totalEarnings.toFixed(2)}</Text>
            <View className="flex-row gap-4 mt-4">
              <View>
                <Text className="text-xs text-white opacity-80">Completed Rides</Text>
                <Text className="text-2xl font-bold text-white">{completedRides}</Text>
              </View>
              <View>
                <Text className="text-xs text-white opacity-80">Average per Ride</Text>
                <Text className="text-2xl font-bold text-white">
                  ${completedRides > 0 ? (totalEarnings / completedRides).toFixed(2) : "0.00"}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border items-center">
              <Text className="text-2xl font-bold text-success">💵</Text>
              <Text className="text-xs text-muted text-center mt-2">Cash Payments</Text>
            </View>
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border items-center">
              <Text className="text-2xl font-bold text-warning">⭐</Text>
              <Text className="text-xs text-muted text-center mt-2">4.9 Rating</Text>
            </View>
          </View>

          {/* Earnings History */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-3">Recent Earnings</Text>
            {rides.length === 0 ? (
              <View className="bg-surface rounded-lg p-6 border border-border items-center">
                <Text className="text-sm text-muted text-center">No completed rides yet</Text>
              </View>
            ) : (
              <FlatList
                data={rides}
                renderItem={renderEarningItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
