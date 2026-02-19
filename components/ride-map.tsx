import { View, Text, Pressable } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useColors } from "@/hooks/use-colors";
import { useEffect, useRef, useState } from "react";

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

export function RideMap({
  pickupLocation,
  dropoffLocation,
  driverLocation,
  onMapReady,
}: RideMapProps) {
  const colors = useColors();
  const mapRef = useRef<MapView>(null);
  const [showRoute, setShowRoute] = useState(true);

  useEffect(() => {
    if (mapRef.current) {
      // Fit map to show all markers
      const coordinates = [pickupLocation, dropoffLocation];
      if (driverLocation) {
        coordinates.push(driverLocation);
      }

      mapRef.current.fitToCoordinates(
        coordinates.map((loc) => ({
          latitude: loc.latitude,
          longitude: loc.longitude,
        })),
        {
          edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
          animated: true,
        }
      );
    }
  }, [pickupLocation, dropoffLocation, driverLocation]);

  return (
    <View className="flex-1 rounded-2xl overflow-hidden border border-border">
      <MapView
        ref={mapRef}
        className="flex-1"
        initialRegion={{
          latitude: pickupLocation.latitude,
          longitude: pickupLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onMapReady={onMapReady}
      >
        {/* Pickup Marker */}
        <Marker
          coordinate={{
            latitude: pickupLocation.latitude,
            longitude: pickupLocation.longitude,
          }}
          title="Pickup Location"
          description={pickupLocation.address}
          pinColor="green"
        >
          <View className="w-10 h-10 rounded-full bg-success items-center justify-center border-2 border-white">
            <Text className="text-lg">📍</Text>
          </View>
        </Marker>

        {/* Dropoff Marker */}
        <Marker
          coordinate={{
            latitude: dropoffLocation.latitude,
            longitude: dropoffLocation.longitude,
          }}
          title="Dropoff Location"
          description={dropoffLocation.address}
          pinColor="red"
        >
          <View className="w-10 h-10 rounded-full bg-error items-center justify-center border-2 border-white">
            <Text className="text-lg">📍</Text>
          </View>
        </Marker>

        {/* Driver Marker */}
        {driverLocation && (
          <Marker
            coordinate={{
              latitude: driverLocation.latitude,
              longitude: driverLocation.longitude,
            }}
            title="Your Driver"
            description="Current location"
          >
            <View className="w-10 h-10 rounded-full bg-primary items-center justify-center border-2 border-white">
              <Text className="text-lg">🚗</Text>
            </View>
          </Marker>
        )}

        {/* Route Line */}
        {showRoute && (
          <Polyline
            coordinates={[
              {
                latitude: pickupLocation.latitude,
                longitude: pickupLocation.longitude,
              },
              {
                latitude: dropoffLocation.latitude,
                longitude: dropoffLocation.longitude,
              },
            ]}
            strokeColor={colors.primary}
            strokeWidth={3}
            lineDashPattern={[10, 5]}
          />
        )}
      </MapView>

      {/* Route Toggle Button */}
      <Pressable
        onPress={() => setShowRoute(!showRoute)}
        className="absolute bottom-4 right-4 bg-white rounded-full p-3 shadow-lg"
        style={{ backgroundColor: colors.surface }}
      >
        <Text className="text-xl">{showRoute ? "🗺️" : "🛣️"}</Text>
      </Pressable>

      {/* Location Info */}
      <View className="absolute top-4 left-4 right-4 bg-white rounded-lg p-3 shadow-lg" style={{ backgroundColor: colors.surface }}>
        <Text className="text-xs text-muted mb-1">PICKUP</Text>
        <Text className="text-sm font-semibold text-foreground">{pickupLocation.address}</Text>
        <View className="h-px bg-border my-2" />
        <Text className="text-xs text-muted mb-1">DROPOFF</Text>
        <Text className="text-sm font-semibold text-foreground">{dropoffLocation.address}</Text>
      </View>
    </View>
  );
}
