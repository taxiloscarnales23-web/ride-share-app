import { ScrollView, Text, View, Pressable, Switch } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { useState } from "react";

const MOCK_RIDES = [
  {
    id: "1",
    pickup: "123 Main St",
    destination: "456 Oak Ave",
    distance: "2.3 km",
    passenger: "Jane Smith",
    rating: 4.9,
  },
  {
    id: "2",
    pickup: "789 Pine Rd",
    destination: "321 Elm St",
    distance: "1.8 km",
    passenger: "Bob Johnson",
    rating: 4.7,
  },
];

export default function DriverHomeScreen() {
  const colors = useColors();
  const [isOnline, setIsOnline] = useState(false);
  const [rideActive, setRideActive] = useState(false);

  const handleToggleOnline = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsOnline(!isOnline);
  };

  const handleAcceptRide = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRideActive(true);
  };

  return (
    <ScreenContainer className="p-0">
      <View className="flex-1">
        {/* Map Area - Placeholder */}
        <View
          className="flex-1 bg-muted items-center justify-center"
          style={{ backgroundColor: colors.muted }}
        >
          <Text className="text-muted text-lg">📍 Map View</Text>
          <Text className="text-muted text-sm mt-2">Your location will appear here</Text>
        </View>

        {/* Bottom Sheet - Status & Rides */}
        <View className="bg-surface border-t border-border p-6 gap-4">
          {/* Online Toggle */}
          <View className="flex-row items-center justify-between bg-background rounded-lg p-4 border border-border">
            <View>
              <Text className="text-foreground font-semibold">Status</Text>
              <Text className="text-muted text-sm mt-1">
                {isOnline ? "🟢 Online" : "🔴 Offline"}
              </Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={handleToggleOnline}
              trackColor={{ false: colors.border, true: colors.success }}
              thumbColor={isOnline ? colors.success : colors.muted}
            />
          </View>

          {!rideActive && isOnline ? (
            <>
              {/* Available Rides */}
              <View>
                <Text className="text-foreground font-semibold mb-3">Available Rides</Text>
                {MOCK_RIDES.map((ride) => (
                  <Pressable
                    key={ride.id}
                    onPress={handleAcceptRide}
                    style={({ pressed }) => [
                      {
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <View className="bg-background rounded-lg p-4 mb-3 border border-border">
                      <View className="flex-row justify-between items-start mb-3">
                        <View className="flex-1">
                          <Text className="text-foreground font-semibold mb-1">{ride.passenger}</Text>
                          <Text className="text-muted text-sm">⭐ {ride.rating}</Text>
                        </View>
                        <Text className="text-success font-bold">{ride.distance}</Text>
                      </View>

                      <View className="border-t border-border pt-3">
                        <View className="flex-row items-center gap-2 mb-2">
                          <Text className="text-muted">📍</Text>
                          <Text className="text-muted text-sm flex-1">{ride.pickup}</Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                          <Text className="text-muted">📍</Text>
                          <Text className="text-muted text-sm flex-1">{ride.destination}</Text>
                        </View>
                      </View>

                      <Pressable
                        onPress={handleAcceptRide}
                        style={({ pressed }) => [
                          {
                            transform: [{ scale: pressed ? 0.97 : 1 }],
                            opacity: pressed ? 0.9 : 1,
                          },
                        ]}
                      >
                        <View
                          className="py-3 rounded-lg items-center justify-center mt-3"
                          style={{ backgroundColor: colors.primary }}
                        >
                          <Text className="text-white font-bold">Accept Ride</Text>
                        </View>
                      </Pressable>
                    </View>
                  </Pressable>
                ))}
              </View>
            </>
          ) : rideActive ? (
            <>
              {/* Active Ride Info */}
              <View className="bg-background rounded-lg p-4 border border-border">
                <Text className="text-muted text-sm mb-2">Current Ride</Text>
                <Text className="text-foreground font-bold text-lg">Heading to pickup</Text>
              </View>

              {/* Passenger Info */}
              <View className="bg-background rounded-lg p-4 border border-border flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-full bg-muted items-center justify-center">
                  <Text className="text-lg">👤</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold">Jane Smith</Text>
                  <Text className="text-muted text-sm">⭐ 4.9 (145 rides)</Text>
                </View>
              </View>

              {/* Complete Ride Button */}
              <Pressable
                onPress={() => setRideActive(false)}
                style={({ pressed }) => [
                  {
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <View
                  className="py-4 rounded-lg items-center justify-center"
                  style={{ backgroundColor: colors.success }}
                >
                  <Text className="text-white font-bold text-lg">Complete Ride</Text>
                </View>
              </Pressable>
            </>
          ) : (
            <View className="items-center py-4">
              <Text className="text-muted text-lg">Go online to see available rides</Text>
            </View>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
