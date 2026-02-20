import { ScrollView, Text, View, Pressable, FlatList, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState, useMemo } from "react";

interface RideRecord {
  id: string;
  driverName: string;
  driverRating: number;
  date: Date;
  pickupLocation: string;
  dropoffLocation: string;
  fare: number;
  distance: number;
  duration: number;
  status: "completed" | "cancelled" | "no-show";
  paymentMethod: string;
}

type FilterStatus = "all" | "completed" | "cancelled" | "no-show";
type SortBy = "recent" | "oldest" | "highest-fare" | "lowest-fare";

export default function RideHistoryScreen() {
  const colors = useColors();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock ride history data
  const [rideHistory] = useState<RideRecord[]>([
    {
      id: "ride-1",
      driverName: "John Smith",
      driverRating: 4.9,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      pickupLocation: "123 Main St",
      dropoffLocation: "456 Oak Ave",
      fare: 15.5,
      distance: 5.2,
      duration: 18,
      status: "completed",
      paymentMethod: "Cash",
    },
    {
      id: "ride-2",
      driverName: "Sarah Johnson",
      driverRating: 4.8,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      pickupLocation: "789 Elm St",
      dropoffLocation: "321 Pine Rd",
      fare: 22.0,
      distance: 8.5,
      duration: 25,
      status: "completed",
      paymentMethod: "Card",
    },
    {
      id: "ride-3",
      driverName: "Mike Davis",
      driverRating: 4.7,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      pickupLocation: "555 Maple Dr",
      dropoffLocation: "999 Cedar Ln",
      fare: 18.75,
      distance: 6.3,
      duration: 22,
      status: "cancelled",
      paymentMethod: "Wallet",
    },
    {
      id: "ride-4",
      driverName: "Emma Wilson",
      driverRating: 5.0,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      pickupLocation: "111 Birch St",
      dropoffLocation: "222 Spruce Ave",
      fare: 12.0,
      distance: 4.1,
      duration: 15,
      status: "completed",
      paymentMethod: "Cash",
    },
  ]);

  // Filter and sort rides
  const filteredRides = useMemo(() => {
    let filtered = rideHistory;

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((ride) => ride.status === filterStatus);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ride) =>
          ride.driverName.toLowerCase().includes(query) ||
          ride.pickupLocation.toLowerCase().includes(query) ||
          ride.dropoffLocation.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    const sorted = [...filtered];
    switch (sortBy) {
      case "oldest":
        sorted.sort((a, b) => a.date.getTime() - b.date.getTime());
        break;
      case "highest-fare":
        sorted.sort((a, b) => b.fare - a.fare);
        break;
      case "lowest-fare":
        sorted.sort((a, b) => a.fare - b.fare);
        break;
      case "recent":
      default:
        sorted.sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    return sorted;
  }, [rideHistory, filterStatus, sortBy, searchQuery]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return colors.success;
      case "cancelled":
        return colors.warning;
      case "no-show":
        return colors.error;
      default:
        return colors.muted;
    }
  };

  const renderRideCard = ({ item }: { item: RideRecord }) => (
    <Pressable
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View
        className="rounded-xl p-4 mb-3 border border-border gap-3"
        style={{ backgroundColor: colors.surface }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1 gap-1">
            <Text className="text-base font-semibold text-foreground">
              {item.driverName}
            </Text>
            <Text className="text-sm text-muted">
              ⭐ {item.driverRating} • {item.distance} km • {item.duration} min
            </Text>
          </View>
          <View className="items-end gap-1">
            <Text className="text-lg font-bold text-foreground">${item.fare.toFixed(2)}</Text>
            <View
              className="px-2 py-1 rounded-full"
              style={{ backgroundColor: getStatusColor(item.status) + "20" }}
            >
              <Text
                className="text-xs font-semibold capitalize"
                style={{ color: getStatusColor(item.status) }}
              >
                {item.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Route */}
        <View className="gap-2 py-2 border-t border-b border-border">
          <View className="flex-row gap-2">
            <Text className="text-lg">📍</Text>
            <Text className="flex-1 text-sm text-muted">{item.pickupLocation}</Text>
          </View>
          <View className="flex-row gap-2">
            <Text className="text-lg">📍</Text>
            <Text className="flex-1 text-sm text-muted">{item.dropoffLocation}</Text>
          </View>
        </View>

        {/* Footer */}
        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-muted">{formatDate(item.date)}</Text>
          <Text className="text-xs text-muted">{item.paymentMethod}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Ride History</Text>
            <Text className="text-base text-muted">
              {filteredRides.length} ride{filteredRides.length !== 1 ? "s" : ""}
            </Text>
          </View>

          {/* Search */}
          <TextInput
            placeholder="Search driver or location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.muted}
            className="rounded-lg px-4 py-3 border border-border text-foreground"
            style={{ backgroundColor: colors.surface }}
          />

          {/* Filters */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-muted uppercase">Status</Text>
            <View className="flex-row gap-2 flex-wrap">
              {(["all", "completed", "cancelled", "no-show"] as FilterStatus[]).map(
                (status) => (
                  <Pressable
                    key={status}
                    onPress={() => setFilterStatus(status)}
                    style={({ pressed }) => [
                      {
                        opacity: pressed ? 0.7 : 1,
                        backgroundColor:
                          filterStatus === status ? colors.primary : colors.surface,
                        borderColor:
                          filterStatus === status ? colors.primary : colors.border,
                      },
                      {
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 20,
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <Text
                      className="text-sm font-semibold capitalize"
                      style={{
                        color: filterStatus === status ? colors.background : colors.foreground,
                      }}
                    >
                      {status}
                    </Text>
                  </Pressable>
                )
              )}
            </View>
          </View>

          {/* Sort */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-muted uppercase">Sort By</Text>
            <View className="flex-row gap-2 flex-wrap">
              {(["recent", "oldest", "highest-fare", "lowest-fare"] as SortBy[]).map(
                (sort) => (
                  <Pressable
                    key={sort}
                    onPress={() => setSortBy(sort)}
                    style={({ pressed }) => [
                      {
                        opacity: pressed ? 0.7 : 1,
                        backgroundColor:
                          sortBy === sort ? colors.primary : colors.surface,
                        borderColor: sortBy === sort ? colors.primary : colors.border,
                      },
                      {
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 20,
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{
                        color: sortBy === sort ? colors.background : colors.foreground,
                      }}
                    >
                      {sort.replace("-", " ")}
                    </Text>
                  </Pressable>
                )
              )}
            </View>
          </View>

          {/* Rides List */}
          {filteredRides.length > 0 ? (
            <FlatList
              data={filteredRides}
              renderItem={renderRideCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View className="items-center justify-center py-12 gap-2">
              <Text className="text-4xl">🚗</Text>
              <Text className="text-base font-semibold text-foreground">No rides found</Text>
              <Text className="text-sm text-muted">Try adjusting your filters</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
