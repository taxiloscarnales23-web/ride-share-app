import { ScrollView, Text, View, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useLocation } from "@/hooks/use-location";
import { useEffect, useRef } from "react";
import * as Haptics from "expo-haptics";

export default function ActiveRideScreen() {
  const colors = useColors();
  const { location, isTracking, startTracking, stopTracking } = useLocation();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    startTracking().then((unsub) => {
      unsubscribe = unsub;
    });
    return () => {
      stopTracking();
      if (unsubscribe) unsubscribe();
    };
  }, [startTracking, stopTracking]);

  const handleEndRide = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Active Ride</Text>
            <Text className="text-muted">Passenger: John Doe</Text>
          </View>

          <View
            className="w-full h-64 rounded-2xl items-center justify-center border-2"
            style={{ borderColor: colors.border, backgroundColor: colors.surface }}
          >
            <Text className="text-muted">📍 Map View</Text>
            {location && (
              <Text className="text-xs text-muted mt-2">
                Lat: {location.latitude.toFixed(4)}, Lon: {location.longitude.toFixed(4)}
              </Text>
            )}
          </View>

          <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-muted">Pickup</Text>
              <Text className="font-semibold text-foreground">123 Main St</Text>
            </View>
            <View className="h-px bg-border" />
            <View className="flex-row justify-between items-center">
              <Text className="text-muted">Dropoff</Text>
              <Text className="font-semibold text-foreground">456 Oak Ave</Text>
            </View>
            <View className="h-px bg-border" />
            <View className="flex-row justify-between items-center">
              <Text className="text-muted">Distance</Text>
              <Text className="font-semibold text-foreground">3.2 km</Text>
            </View>
            <View className="h-px bg-border" />
            <View className="flex-row justify-between items-center">
              <Text className="text-muted">Estimated Fare</Text>
              <Text className="font-semibold text-foreground">$12.50</Text>
            </View>
          </View>

          {isTracking && location && (
            <View className="bg-success/10 rounded-lg p-3 border border-success">
              <Text className="text-xs text-success font-semibold">
                ✓ Location tracking active
              </Text>
            </View>
          )}

          <Pressable
            onPress={handleEndRide}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <View
              className="rounded-full py-4 items-center justify-center"
              style={{ backgroundColor: colors.error }}
            >
              <Text className="text-white font-bold text-lg">End Ride</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
