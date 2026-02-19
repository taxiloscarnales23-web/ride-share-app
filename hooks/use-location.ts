import { useEffect, useState, useCallback } from "react";
import * as Location from "expo-location";
import { Platform } from "react-native";

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const startTracking = useCallback(async (): Promise<(() => void) | undefined> => {
    if (Platform.OS === "web") {
      console.log("[Location] Web platform - location tracking not available");
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied");
        return;
      }

      setIsTracking(true);
      setError(null);

      // Get initial location
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: initialLocation.coords.latitude,
        longitude: initialLocation.coords.longitude,
        accuracy: initialLocation.coords.accuracy,
        timestamp: initialLocation.timestamp,
      });

      // Subscribe to location updates every 10 seconds
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 10,
        },
        (newLocation: Location.LocationObject) => {
          setLocation({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            accuracy: newLocation.coords.accuracy,
            timestamp: newLocation.timestamp,
          });
        }
      );

      return (): void => {
        subscription.remove();
        setIsTracking(false);
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setIsTracking(false);
    }
  }, []);

  const stopTracking = useCallback((): void => {
    setIsTracking(false);
    setLocation(null);
  }, []);

  return {
    location,
    error,
    isTracking,
    startTracking,
    stopTracking,
  };
}
