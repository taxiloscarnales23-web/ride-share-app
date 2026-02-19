import { ScrollView, Text, View, FlatList, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

export default function RiderHistoryScreen() {
  const colors = useColors();
  const rideHistory = trpc.riders.getRideHistory.useQuery();

  const renderRideItem = ({ item }: any) => (
    <View className="bg-surface rounded-lg p-4 mb-3 border border-border">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-sm font-semibold text-foreground">{item.pickupAddress}</Text>
          <Text className="text-xs text-muted mt-1">→ {item.dropoffAddress}</Text>
        </View>
        <Text className="text-lg font-bold text-primary">${item.actualFare || item.estimatedFare}</Text>
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
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const rides = rideHistory.data || [];

  return (
    <ScreenContainer className="p-4">
      <View className="gap-4">
        <View>
          <Text className="text-3xl font-bold text-foreground">Ride History</Text>
          <Text className="text-sm text-muted mt-1">{rides.length} rides completed</Text>
        </View>

        {rides.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            <Text className="text-lg text-muted text-center">No rides yet</Text>
            <Text className="text-sm text-muted text-center mt-2">Your completed rides will appear here</Text>
          </View>
        ) : (
          <FlatList
            data={rides}
            renderItem={renderRideItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        )}
      </View>
    </ScreenContainer>
  );
}
