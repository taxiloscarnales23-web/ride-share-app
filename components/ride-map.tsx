import { View, Text } from "react-native";
import { useColors } from "@/hooks/use-colors";

export interface RideLocation {
  latitude: number;
  longitude: number;
  address: string;
  type: "pickup" | "dropoff" | "driver";
}

export interface RideMapProps {
  pickupLocation: RideLocation;
  dropoffLocation: RideLocation;
  driverLocation?: RideLocation;
  onMapReady?: () => void;
}

/**
 * Location display component - shows pickup/dropoff locations
 * This is a simplified version that works in Expo Go without native module dependencies
 */
export function RideMap({
  pickupLocation,
  dropoffLocation,
  driverLocation,
  onMapReady,
}: RideMapProps) {
  const colors = useColors();

  // Calculate approximate distance (simplified)
  const calculateDistance = () => {
    const lat1 = pickupLocation.latitude;
    const lon1 = pickupLocation.longitude;
    const lat2 = dropoffLocation.latitude;
    const lon2 = dropoffLocation.longitude;

    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const distance = calculateDistance();
  const estimatedTime = Math.ceil(parseFloat(distance) * 2);

  return (
    <View className="flex-1 rounded-2xl overflow-hidden border border-border bg-surface p-4 gap-4">
      {/* Map Icon */}
      <View className="items-center py-4">
        <Text className="text-5xl mb-2">🗺️</Text>
        <Text className="text-sm font-semibold text-foreground">Route Map</Text>
      </View>

      {/* Route Info */}
      <View className="gap-3">
        {/* Pickup */}
        <View className="flex-row items-start gap-3">
          <View className="w-8 h-8 rounded-full bg-success items-center justify-center flex-shrink-0">
            <Text className="text-sm">📍</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-muted mb-1">PICKUP</Text>
            <Text className="text-sm font-semibold text-foreground">{pickupLocation.address}</Text>
          </View>
        </View>

        {/* Distance Line */}
        <View className="flex-row items-center gap-2 px-4">
          <View className="w-px h-8 bg-border" />
          <View className="flex-1 items-center">
            <View className="bg-primary/10 rounded px-2 py-1">
              <Text className="text-xs font-semibold text-primary">{distance} km • {estimatedTime} min</Text>
            </View>
          </View>
        </View>

        {/* Dropoff */}
        <View className="flex-row items-start gap-3">
          <View className="w-8 h-8 rounded-full bg-error items-center justify-center flex-shrink-0">
            <Text className="text-sm">📍</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-muted mb-1">DROPOFF</Text>
            <Text className="text-sm font-semibold text-foreground">{dropoffLocation.address}</Text>
          </View>
        </View>
      </View>

      {/* Driver Location (if available) */}
      {driverLocation && (
        <>
          <View className="h-px bg-border" />
          <View className="flex-row items-start gap-3">
            <View className="w-8 h-8 rounded-full bg-primary items-center justify-center flex-shrink-0">
              <Text className="text-sm">🚗</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-muted mb-1">DRIVER LOCATION</Text>
              <Text className="text-sm font-semibold text-foreground">{driverLocation.address}</Text>
            </View>
          </View>
        </>
      )}

      {/* Coordinates Info */}
      <View className="bg-primary/5 rounded-lg p-3 gap-2">
        <Text className="text-xs text-muted font-semibold">COORDINATES</Text>
        <View className="flex-row justify-between">
          <View>
            <Text className="text-xs text-muted">Pickup</Text>
            <Text className="text-xs font-mono text-foreground">{pickupLocation.latitude.toFixed(4)}, {pickupLocation.longitude.toFixed(4)}</Text>
          </View>
          <View>
            <Text className="text-xs text-muted">Dropoff</Text>
            <Text className="text-xs font-mono text-foreground">{dropoffLocation.latitude.toFixed(4)}, {dropoffLocation.longitude.toFixed(4)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
