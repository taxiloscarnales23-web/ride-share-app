import { ScrollView, Text, View, Pressable, TextInput, FlatList, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import * as Haptics from "expo-haptics";

interface RideOption {
  id: number;
  type: string;
  price: string;
  eta: string;
  rating: string;
  available: number;
  icon: string;
}

export default function SearchScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<"all" | "budget" | "comfort" | "premium">("all");
  const [minRating, setMinRating] = useState<"all" | "4.5" | "4.7" | "4.9">("all");
  const [accessibility, setAccessibility] = useState(false);

  const [rideOptions] = useState<RideOption[]>([
    {
      id: 1,
      type: "Budget",
      price: "$8-12",
      eta: "3 min",
      rating: "4.6",
      available: 12,
      icon: "🚗",
    },
    {
      id: 2,
      type: "Comfort",
      price: "$12-18",
      eta: "5 min",
      rating: "4.8",
      available: 8,
      icon: "🚙",
    },
    {
      id: 3,
      type: "Premium",
      price: "$18-28",
      eta: "7 min",
      rating: "4.9",
      available: 5,
      icon: "🚘",
    },
  ]);

  const handleSearch = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (searchQuery.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleSelectRide = async (type: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      `Select ${type}`,
      `Confirm booking a ${type.toLowerCase()} ride?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Book",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Success", `${type} ride booked!`);
          },
        },
      ]
    );
  };

  const filteredRides = rideOptions.filter((ride) => {
    if (priceRange === "budget" && !ride.price.includes("8-12")) return false;
    if (priceRange === "comfort" && !ride.price.includes("12-18")) return false;
    if (priceRange === "premium" && !ride.price.includes("18-28")) return false;
    if (minRating === "4.5" && parseFloat(ride.rating) < 4.5) return false;
    if (minRating === "4.7" && parseFloat(ride.rating) < 4.7) return false;
    if (minRating === "4.9" && parseFloat(ride.rating) < 4.9) return false;
    return true;
  });

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Search Rides</Text>
            <Text className="text-muted">Find the perfect ride</Text>
          </View>

          {/* Search Bar */}
          <View className="flex-row gap-2 items-center bg-surface border border-border rounded-lg px-4 py-3">
            <Text className="text-lg">🔍</Text>
            <TextInput
              placeholder="Search location or destination"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 text-foreground"
              style={{ fontSize: 14 }}
            />
            <Pressable onPress={handleSearch} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
              <Text className="text-lg">→</Text>
            </Pressable>
          </View>

          {/* Filters */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Filters</Text>

            {/* Price Range */}
            <View className="gap-2">
              <Text className="text-xs text-muted">Price Range</Text>
              <View className="flex-row gap-2">
                {(["all", "budget", "comfort", "premium"] as const).map((range) => (
                  <Pressable
                    key={range}
                    onPress={() => {
                      setPriceRange(range);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  >
                    <View
                      className={`rounded-lg px-3 py-2 ${
                        priceRange === range
                          ? "bg-primary"
                          : "bg-surface border border-border"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          priceRange === range ? "text-white" : "text-foreground"
                        }`}
                      >
                        {range.charAt(0).toUpperCase() + range.slice(1)}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Minimum Rating */}
            <View className="gap-2">
              <Text className="text-xs text-muted">Minimum Rating</Text>
              <View className="flex-row gap-2">
                {(["all", "4.5", "4.7", "4.9"] as const).map((rating) => (
                  <Pressable
                    key={rating}
                    onPress={() => {
                      setMinRating(rating);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  >
                    <View
                      className={`rounded-lg px-3 py-2 ${
                        minRating === rating
                          ? "bg-primary"
                          : "bg-surface border border-border"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          minRating === rating ? "text-white" : "text-foreground"
                        }`}
                      >
                        {rating === "all" ? "Any" : `${rating}⭐`}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Accessibility */}
            <Pressable
              onPress={() => {
                setAccessibility(!accessibility);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <View
                className={`rounded-lg p-3 flex-row items-center gap-3 ${
                  accessibility
                    ? "bg-primary/20 border border-primary"
                    : "bg-surface border border-border"
                }`}
              >
                <Text className="text-lg">{accessibility ? "✓" : "○"}</Text>
                <Text className="text-sm font-semibold text-foreground">Wheelchair Accessible</Text>
              </View>
            </Pressable>
          </View>

          {/* Available Rides */}
          <View className="gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-semibold text-foreground">
                Available Rides ({filteredRides.length})
              </Text>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text className="text-xs text-primary font-semibold">Reset</Text>
              </Pressable>
            </View>

            {filteredRides.length === 0 ? (
              <View className="bg-surface rounded-lg p-6 items-center">
                <Text className="text-3xl mb-2">🔍</Text>
                <Text className="text-foreground font-semibold">No rides found</Text>
                <Text className="text-muted text-center text-sm mt-2">
                  Try adjusting your filters
                </Text>
              </View>
            ) : (
              <FlatList
                scrollEnabled={false}
                data={filteredRides}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleSelectRide(item.type)}
                    style={({ pressed }) => [
                      {
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                        opacity: pressed ? 0.9 : 1,
                      },
                    ]}
                  >
                    <View className="bg-surface border border-border rounded-lg p-4 gap-3 mb-2">
                      <View className="flex-row justify-between items-start">
                        <View className="flex-row gap-3 flex-1">
                          <Text className="text-3xl">{item.icon}</Text>
                          <View className="flex-1">
                            <Text className="text-sm font-bold text-foreground">{item.type}</Text>
                            <View className="flex-row gap-2 mt-1">
                              <Text className="text-xs text-muted">⭐ {item.rating}</Text>
                              <Text className="text-xs text-muted">•</Text>
                              <Text className="text-xs text-muted">{item.available} available</Text>
                            </View>
                          </View>
                        </View>
                        <View className="items-end">
                          <Text className="text-lg font-bold text-primary">{item.price}</Text>
                          <Text className="text-xs text-muted mt-1">{item.eta}</Text>
                        </View>
                      </View>

                      <View className="h-px bg-border" />

                      <View className="flex-row justify-between items-center">
                        <Text className="text-xs text-muted">Estimated time</Text>
                        <Text className="text-sm font-semibold text-foreground">{item.eta}</Text>
                      </View>
                    </View>
                  </Pressable>
                )}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
