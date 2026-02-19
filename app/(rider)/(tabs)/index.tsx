import { ScrollView, Text, View, Pressable, ActivityIndicator, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { RideMap } from "@/components/ride-map";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import * as Haptics from "expo-haptics";

export default function RiderHomeScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [estimatedFare, setEstimatedFare] = useState("$0.00");
  const [isRequesting, setIsRequesting] = useState(false);
  const [activeRide, setActiveRide] = useState<any>(null);

  const riderProfile = trpc.riders.getProfile.useQuery();
  const createRideMutation = trpc.rides.create.useMutation();
  const activeRidesQuery = trpc.rides.getActive.useQuery();

  const mockPickupLocation = {
    latitude: 40.7128,
    longitude: -74.006,
    address: pickupAddress || "123 Main Street, New York, NY",
    type: "pickup" as const,
  };

  const mockDropoffLocation = {
    latitude: 40.758,
    longitude: -73.9855,
    address: dropoffAddress || "456 Times Square, New York, NY",
    type: "dropoff" as const,
  };

  const handleRequestRide = async () => {
    if (!pickupAddress || !dropoffAddress) {
      Alert.alert("Missing Information", "Please enter both pickup and dropoff locations");
      return;
    }

    try {
      setIsRequesting(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await createRideMutation.mutateAsync({
        pickupLatitude: "40.7128",
        pickupLongitude: "-74.0060",
        pickupAddress,
        dropoffLatitude: "40.7580",
        dropoffLongitude: "-73.9855",
        dropoffAddress,
        estimatedFare,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Ride Requested", "Your ride request has been sent to nearby drivers");
      setPickupAddress("");
      setDropoffAddress("");
      setIsRequesting(false);
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to request ride. Please try again.");
      setIsRequesting(false);
    }
  };

  if (riderProfile.isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Request a Ride</Text>
            <Text className="text-sm text-muted">Welcome, {user?.name || "Rider"}</Text>
          </View>

          {/* Map Preview */}
          <View className="h-64 rounded-2xl overflow-hidden border border-border bg-surface">
            <RideMap
              pickupLocation={mockPickupLocation}
              dropoffLocation={mockDropoffLocation}
            />
          </View>

          {/* Pickup Location */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Pickup Location</Text>
            <TextInput
              placeholder="Enter pickup address"
              value={pickupAddress}
              onChangeText={setPickupAddress}
              className="bg-surface border border-border rounded-lg p-3 text-foreground"
              placeholderTextColor={colors.muted}
            />
          </View>

          {/* Dropoff Location */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Dropoff Location</Text>
            <TextInput
              placeholder="Enter dropoff address"
              value={dropoffAddress}
              onChangeText={setDropoffAddress}
              className="bg-surface border border-border rounded-lg p-3 text-foreground"
              placeholderTextColor={colors.muted}
            />
          </View>

          {/* Estimated Fare */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm text-muted">Estimated Fare</Text>
              <Text className="text-2xl font-bold text-primary">{estimatedFare}</Text>
            </View>
            <Text className="text-xs text-muted">💵 Cash Payment Only</Text>
          </View>

          {/* Request Button */}
          <Pressable
            onPress={handleRequestRide}
            disabled={isRequesting}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed && !isRequesting ? 0.97 : 1 }],
                opacity: isRequesting ? 0.6 : pressed ? 0.9 : 1,
              },
            ]}
          >
            <View
              className="bg-primary rounded-full py-4 items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              {isRequesting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Request Ride</Text>
              )}
            </View>
          </Pressable>

          {/* Info */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-xs text-muted text-center">
              Drivers in your area will receive your ride request. You'll be matched with a driver shortly.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
