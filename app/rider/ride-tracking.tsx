import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

/**
 * Rider Tracking Screen
 * Shows live map with driver location, route, and ETA
 */

export default function RiderTrackingScreen() {
  const colors = useColors();
  const [rideStatus] = useState({
    driverName: "John Smith",
    driverRating: 4.8,
    vehicleInfo: "Toyota Prius - ABC123",
    pickupAddress: "123 Main St, Downtown",
    dropoffAddress: "456 Oak Ave, Uptown",
    eta: "8 minutes",
    distance: "2.3 km",
    fare: "$12.50",
    status: "in_progress",
  });

  const [driverLocation] = useState({
    latitude: 40.7128,
    longitude: -74.006,
    heading: 45,
  });

  const screenWidth = Dimensions.get("window").width;
  const mapHeight = 300;

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1">
          {/* Map Container */}
          <View
            className="bg-surface border-b border-border items-center justify-center"
            style={{ height: mapHeight, width: screenWidth }}
          >
            {/* Mock Map Display */}
            <View className="w-full h-full bg-gradient-to-b from-blue-100 to-blue-50 items-center justify-center gap-4">
              <Text className="text-6xl">🗺️</Text>
              <View className="items-center gap-1">
                <Text className="text-foreground font-semibold">Live Map View</Text>
                <Text className="text-xs text-muted">Driver location updates in real-time</Text>
              </View>

              {/* Map Markers */}
              <View className="absolute top-4 right-4 bg-background rounded-lg p-2 shadow-sm">
                <Text className="text-xs text-muted">📍 Driver</Text>
              </View>

              <View className="absolute bottom-4 left-4 bg-background rounded-lg p-2 shadow-sm">
                <Text className="text-xs text-muted">🚩 Destination</Text>
              </View>
            </View>
          </View>

          {/* Driver Info Card */}
          <View className="p-6 gap-4">
            {/* Driver Details */}
            <View className="bg-surface border border-border rounded-lg p-4 gap-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="w-14 h-14 bg-primary/10 rounded-full items-center justify-center">
                    <Text className="text-2xl">👤</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-foreground">{rideStatus.driverName}</Text>
                    <Text className="text-sm text-muted">⭐ {rideStatus.driverRating}</Text>
                  </View>
                </View>
                <TouchableOpacity className="p-2">
                  <Text className="text-2xl">📞</Text>
                </TouchableOpacity>
              </View>

              {/* Vehicle Info */}
              <View className="bg-primary/5 rounded-lg p-3">
                <Text className="text-sm text-muted">Vehicle</Text>
                <Text className="text-foreground font-semibold">{rideStatus.vehicleInfo}</Text>
              </View>
            </View>

            {/* Route Info */}
            <View className="gap-3">
              <Text className="text-sm font-semibold text-foreground">Route Details</Text>

              {/* Pickup */}
              <View className="flex-row gap-3">
                <View className="items-center gap-2">
                  <View className="w-8 h-8 bg-success/10 rounded-full items-center justify-center">
                    <Text className="text-lg">📍</Text>
                  </View>
                  <View className="w-1 h-8 bg-border" />
                </View>
                <View className="flex-1 pt-1">
                  <Text className="text-xs text-muted uppercase font-semibold">Pickup</Text>
                  <Text className="text-foreground font-semibold">{rideStatus.pickupAddress}</Text>
                </View>
              </View>

              {/* Dropoff */}
              <View className="flex-row gap-3">
                <View className="items-center gap-2">
                  <View className="w-8 h-8 bg-error/10 rounded-full items-center justify-center">
                    <Text className="text-lg">🚩</Text>
                  </View>
                </View>
                <View className="flex-1 pt-1">
                  <Text className="text-xs text-muted uppercase font-semibold">Dropoff</Text>
                  <Text className="text-foreground font-semibold">{rideStatus.dropoffAddress}</Text>
                </View>
              </View>
            </View>

            {/* ETA and Distance */}
            <View className="flex-row gap-3">
              <View className="flex-1 bg-primary/5 rounded-lg p-4 items-center gap-1">
                <Text className="text-xs text-muted">ETA</Text>
                <Text className="text-2xl font-bold text-primary">{rideStatus.eta}</Text>
              </View>
              <View className="flex-1 bg-primary/5 rounded-lg p-4 items-center gap-1">
                <Text className="text-xs text-muted">Distance</Text>
                <Text className="text-2xl font-bold text-primary">{rideStatus.distance}</Text>
              </View>
            </View>

            {/* Fare Info */}
            <View className="bg-surface border border-border rounded-lg p-4 gap-2">
              <View className="flex-row justify-between items-center">
                <Text className="text-muted">Estimated Fare</Text>
                <Text className="text-2xl font-bold text-primary">{rideStatus.fare}</Text>
              </View>
              <Text className="text-xs text-muted">Final fare may vary based on actual route</Text>
            </View>

            {/* Action Buttons */}
            <View className="gap-2 mt-4">
              <TouchableOpacity className="bg-primary rounded-lg p-4 items-center">
                <Text className="text-background font-semibold">📞 Call Driver</Text>
              </TouchableOpacity>

              <TouchableOpacity className="border border-error rounded-lg p-4 items-center">
                <Text className="text-error font-semibold">Cancel Ride</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
