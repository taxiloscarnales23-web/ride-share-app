import { ScrollView, Text, View, Pressable, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useNotifications } from "@/hooks/use-notifications";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import * as Haptics from "expo-haptics";

export default function RideRequestScreen() {
  const colors = useColors();
  const router = useRouter();
  const { sendLocalNotification } = useNotifications();
  const [isAccepting, setIsAccepting] = useState(false);

  // Simulate incoming ride request
  useEffect(() => {
    // Show notification when screen loads
    sendLocalNotification({
      type: "ride_request",
      title: "New Ride Request! 🚗",
      body: "Pickup: 123 Main St → Dropoff: 456 Oak Ave",
      data: {
        rideId: 1,
        pickupAddress: "123 Main St",
        dropoffAddress: "456 Oak Ave",
        fare: "$12.50",
      },
    });
  }, []);

  const handleAcceptRide = async () => {
    try {
      setIsAccepting(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Ride Accepted", "You have accepted the ride. Head to the pickup location.");

      // Send notification to rider
      await sendLocalNotification({
        type: "ride_accepted",
        title: "Driver Accepted Your Ride ✓",
        body: "Your driver is on the way. ETA: 5 minutes",
        data: { rideId: 1 },
      });

      // Navigate to active ride
      router.replace("/(driver)/(tabs)/active-ride");
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to accept ride. Please try again.");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDeclineRide = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Ride Declined", "You have declined this ride request.");
    router.back();
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6 flex-1 justify-center">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">New Ride Request</Text>
            <Text className="text-muted">Accept or decline this ride</Text>
          </View>

          {/* Ride Details Card */}
          <View className="bg-surface rounded-2xl p-6 border-2" style={{ borderColor: colors.primary }}>
            {/* Fare */}
            <View className="mb-4 pb-4 border-b border-border">
              <Text className="text-2xl font-bold text-primary">$12.50</Text>
              <Text className="text-xs text-muted">Estimated fare</Text>
            </View>

            {/* Pickup */}
            <View className="mb-4 pb-4 border-b border-border">
              <Text className="text-xs text-muted mb-1">PICKUP</Text>
              <Text className="text-lg font-semibold text-foreground">123 Main Street</Text>
              <Text className="text-sm text-muted">Downtown area</Text>
            </View>

            {/* Dropoff */}
            <View className="mb-4 pb-4 border-b border-border">
              <Text className="text-xs text-muted mb-1">DROPOFF</Text>
              <Text className="text-lg font-semibold text-foreground">456 Oak Avenue</Text>
              <Text className="text-sm text-muted">Residential area</Text>
            </View>

            {/* Distance & Time */}
            <View className="flex-row justify-between">
              <View>
                <Text className="text-xs text-muted mb-1">DISTANCE</Text>
                <Text className="text-lg font-semibold text-foreground">3.2 km</Text>
              </View>
              <View>
                <Text className="text-xs text-muted mb-1">EST. TIME</Text>
                <Text className="text-lg font-semibold text-foreground">8 min</Text>
              </View>
              <View>
                <Text className="text-xs text-muted mb-1">PASSENGERS</Text>
                <Text className="text-lg font-semibold text-foreground">1</Text>
              </View>
            </View>
          </View>

          {/* Rider Info */}
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center">
                <Text className="text-2xl">👤</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-foreground">Sarah Johnson</Text>
                <Text className="text-sm text-muted">⭐ 4.8 (127 rides)</Text>
              </View>
            </View>
          </View>

          {/* Cash Payment Info */}
          <View className="bg-primary/10 rounded-lg p-3 border border-primary">
            <Text className="text-sm font-semibold text-primary">💵 Cash Payment</Text>
            <Text className="text-xs text-primary">Passenger will pay in cash</Text>
          </View>

          {/* Action Buttons */}
          <View className="gap-3 mt-auto">
            <Pressable
              onPress={handleAcceptRide}
              disabled={isAccepting}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed && !isAccepting ? 0.97 : 1 }],
                  opacity: isAccepting ? 0.6 : pressed ? 0.9 : 1,
                },
              ]}
            >
              <View
                className="rounded-full py-4 items-center justify-center"
                style={{ backgroundColor: colors.success }}
              >
                <Text className="text-white font-bold text-lg">
                  {isAccepting ? "Accepting..." : "Accept Ride"}
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={handleDeclineRide}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <View className="rounded-full py-4 items-center justify-center border-2 border-error">
                <Text className="text-error font-bold text-lg">Decline</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
