import { ScrollView, Text, View, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { useState } from "react";

export default function RiderHomeScreen() {
  const colors = useColors();
  const [rideActive, setRideActive] = useState(false);

  const handleRequestRide = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Implement ride request flow
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
          <Text className="text-muted text-sm mt-2">Location tracking will appear here</Text>
        </View>

        {/* Bottom Sheet - Ride Request */}
        <View className="bg-surface border-t border-border p-6 gap-4">
          {!rideActive ? (
            <>
              {/* Destination Input */}
              <Pressable
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <View className="bg-background rounded-lg p-4 border border-border">
                  <Text className="text-muted text-sm mb-1">Where to?</Text>
                  <Text className="text-foreground font-semibold">Enter destination</Text>
                </View>
              </Pressable>

              {/* Request Ride Button */}
              <Pressable
                onPress={handleRequestRide}
                style={({ pressed }) => [
                  {
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <View
                  className="py-4 rounded-lg items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-white font-bold text-lg">Request Ride</Text>
                </View>
              </Pressable>
            </>
          ) : (
            <>
              {/* Active Ride Info */}
              <View className="bg-background rounded-lg p-4 border border-border">
                <Text className="text-muted text-sm mb-2">Driver Arriving</Text>
                <Text className="text-foreground font-bold text-lg">5 minutes away</Text>
              </View>

              {/* Driver Info Card */}
              <View className="bg-background rounded-lg p-4 border border-border flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-full bg-muted items-center justify-center">
                  <Text className="text-lg">👤</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold">John Driver</Text>
                  <Text className="text-muted text-sm">⭐ 4.8 (245 rides)</Text>
                </View>
              </View>

              {/* Cancel Button */}
              <Pressable
                onPress={() => setRideActive(false)}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <View
                  className="py-4 rounded-lg items-center justify-center border border-error"
                  style={{ backgroundColor: "transparent" }}
                >
                  <Text className="text-error font-bold text-lg">Cancel Ride</Text>
                </View>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
