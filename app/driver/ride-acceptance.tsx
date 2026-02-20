import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

/**
 * Driver Ride Acceptance Screen
 * Shows ride details and allows driver to accept/decline
 */

export default function RideAcceptanceScreen() {
  const colors = useColors();
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const rideDetails = {
    pickupAddress: "123 Main Street, Downtown",
    dropoffAddress: "456 Oak Avenue, Uptown",
    distance: "3.2 km",
    estimatedDuration: "12 minutes",
    fare: "$12.50",
    riderName: "Sarah Johnson",
    riderRating: 4.9,
    riderPhone: "+1 (555) 123-4567",
  };

  const handleAcceptRide = async () => {
    try {
      setLoading(true);
      // Mock: Accept ride
      console.log("[RideAcceptance] Accepting ride");
      // In production, call API: await api.driver.acceptRide({ rideId })
      setAccepted(true);
    } catch (error) {
      console.error("[RideAcceptance] Failed to accept ride:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineRide = async () => {
    try {
      setLoading(true);
      // Mock: Decline ride
      console.log("[RideAcceptance] Declining ride");
      // In production, call API: await api.driver.declineRide({ rideId })
      // Then navigate back to home
    } catch (error) {
      console.error("[RideAcceptance] Failed to decline ride:", error);
    } finally {
      setLoading(false);
    }
  };

  if (accepted) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 justify-center items-center gap-6">
            {/* Success Icon */}
            <View className="w-20 h-20 bg-success/10 rounded-full items-center justify-center">
              <Text className="text-5xl">✓</Text>
            </View>

            {/* Message */}
            <View className="items-center gap-2">
              <Text className="text-3xl font-bold text-foreground">Ride Accepted!</Text>
              <Text className="text-base text-muted text-center">
                Head to the pickup location to meet your passenger
              </Text>
            </View>

            {/* Rider Info */}
            <View className="w-full bg-surface border border-border rounded-lg p-6 gap-4">
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center">
                  <Text className="text-2xl">👤</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold">{rideDetails.riderName}</Text>
                  <Text className="text-xs text-muted">⭐ {rideDetails.riderRating}</Text>
                </View>
              </View>

              <View className="h-px bg-border" />

              {/* Pickup Location */}
              <View className="gap-2">
                <Text className="text-xs font-semibold text-muted uppercase">Pickup</Text>
                <Text className="text-foreground font-semibold">{rideDetails.pickupAddress}</Text>
              </View>

              {/* Dropoff Location */}
              <View className="gap-2">
                <Text className="text-xs font-semibold text-muted uppercase">Dropoff</Text>
                <Text className="text-foreground font-semibold">{rideDetails.dropoffAddress}</Text>
              </View>

              {/* Ride Stats */}
              <View className="flex-row gap-2">
                <View className="flex-1 bg-primary/5 rounded-lg p-3 items-center">
                  <Text className="text-xs text-muted">Distance</Text>
                  <Text className="text-foreground font-semibold">{rideDetails.distance}</Text>
                </View>
                <View className="flex-1 bg-primary/5 rounded-lg p-3 items-center">
                  <Text className="text-xs text-muted">Duration</Text>
                  <Text className="text-foreground font-semibold">{rideDetails.estimatedDuration}</Text>
                </View>
                <View className="flex-1 bg-primary/5 rounded-lg p-3 items-center">
                  <Text className="text-xs text-muted">Fare</Text>
                  <Text className="text-foreground font-semibold">{rideDetails.fare}</Text>
                </View>
              </View>
            </View>

            {/* Contact Button */}
            <TouchableOpacity className="w-full bg-primary rounded-lg p-4 items-center">
              <Text className="text-background font-semibold">📞 Call Rider</Text>
            </TouchableOpacity>

            {/* Start Ride Button */}
            <TouchableOpacity className="w-full bg-success rounded-lg p-4 items-center">
              <Text className="text-background font-semibold text-lg">Start Ride</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">New Ride Request</Text>
            <Text className="text-base text-muted">Do you want to accept this ride?</Text>
          </View>

          {/* Rider Info Card */}
          <View className="bg-surface border border-border rounded-lg p-6 gap-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-14 h-14 bg-primary/10 rounded-full items-center justify-center">
                  <Text className="text-3xl">👤</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground">{rideDetails.riderName}</Text>
                  <Text className="text-sm text-muted">⭐ {rideDetails.riderRating} rating</Text>
                </View>
              </View>
              <TouchableOpacity className="p-2">
                <Text className="text-2xl">📞</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Pickup Location */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Pickup Location</Text>
            <View className="bg-surface border border-border rounded-lg p-4 gap-2">
              <Text className="text-foreground font-semibold">📍 {rideDetails.pickupAddress}</Text>
            </View>
          </View>

          {/* Dropoff Location */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Dropoff Location</Text>
            <View className="bg-surface border border-border rounded-lg p-4 gap-2">
              <Text className="text-foreground font-semibold">📍 {rideDetails.dropoffAddress}</Text>
            </View>
          </View>

          {/* Ride Summary */}
          <View className="bg-primary/5 border border-primary rounded-lg p-4 gap-3">
            <View className="flex-row justify-between">
              <Text className="text-muted">Distance</Text>
              <Text className="text-foreground font-semibold">{rideDetails.distance}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted">Estimated Duration</Text>
              <Text className="text-foreground font-semibold">{rideDetails.estimatedDuration}</Text>
            </View>
            <View className="h-px bg-primary/20" />
            <View className="flex-row justify-between">
              <Text className="font-semibold text-foreground">Estimated Fare</Text>
              <Text className="text-xl font-bold text-primary">{rideDetails.fare}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mt-auto">
            <TouchableOpacity
              className="flex-1 border border-error rounded-lg p-4 items-center"
              onPress={handleDeclineRide}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.error} />
              ) : (
                <Text className="text-error font-semibold text-lg">Decline</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-success rounded-lg p-4 items-center"
              onPress={handleAcceptRide}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text className="text-background font-semibold text-lg">Accept</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
