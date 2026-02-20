import { rides } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { getDb } from "../db";

/**
 * Location Service
 * Handles real-time GPS tracking and location sharing
 */

export interface LocationUpdate {
  rideId: number;
  userId: number;
  userType: "rider" | "driver";
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number;
  speed: number;
  timestamp: Date;
}

export interface LocationHistory {
  id: number;
  rideId: number;
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number;
  speed: number;
  timestamp: Date;
}

// In-memory storage for active location subscriptions (in production, use Redis)
const activeSubscriptions = new Map<
  number,
  {
    rideId: number;
    riderId: number;
    driverId: number;
    lastUpdate: Date;
    locations: LocationUpdate[];
  }
>();

/**
 * Start tracking a ride
 */
export async function startTracking(
  rideId: number,
  riderId: number,
  driverId: number
): Promise<{ trackingId: string; status: "active" }> {
  try {
    const trackingId = `TRK-${rideId}-${Date.now()}`;

    activeSubscriptions.set(rideId, {
      rideId,
      riderId,
      driverId,
      lastUpdate: new Date(),
      locations: [],
    });

    console.log(`[Location] Started tracking ride ${rideId}`);

    return {
      trackingId,
      status: "active",
    };
  } catch (error) {
    console.error("[Location] Failed to start tracking:", error);
    throw error;
  }
}

/**
 * Update location during active ride
 */
export async function updateLocation(update: LocationUpdate): Promise<{
  success: boolean;
  timestamp: Date;
  distanceFromLastUpdate: number;
}> {
  try {
    const subscription = activeSubscriptions.get(update.rideId);
    if (!subscription) {
      throw new Error("Ride tracking not active");
    }

    // Calculate distance from last location (Haversine formula)
    let distanceFromLastUpdate = 0;
    if (subscription.locations.length > 0) {
      const lastLoc = subscription.locations[subscription.locations.length - 1];
      distanceFromLastUpdate = calculateDistance(
        lastLoc.latitude,
        lastLoc.longitude,
        update.latitude,
        update.longitude
      );
    }

    // Store location update
    subscription.locations.push(update);
    subscription.lastUpdate = new Date();

    // Keep only last 100 locations in memory
    if (subscription.locations.length > 100) {
      subscription.locations.shift();
    }

    console.log(
      `[Location] Updated location for ride ${update.rideId}: ${update.latitude}, ${update.longitude}`
    );

    return {
      success: true,
      timestamp: update.timestamp,
      distanceFromLastUpdate,
    };
  } catch (error) {
    console.error("[Location] Failed to update location:", error);
    throw error;
  }
}

/**
 * Get current location for a ride
 */
export async function getCurrentLocation(
  rideId: number
): Promise<LocationUpdate | null> {
  try {
    const subscription = activeSubscriptions.get(rideId);
    if (!subscription || subscription.locations.length === 0) {
      return null;
    }

    return subscription.locations[subscription.locations.length - 1];
  } catch (error) {
    console.error("[Location] Failed to get current location:", error);
    throw error;
  }
}

/**
 * Get location history for a ride
 */
export async function getLocationHistory(
  rideId: number,
  limit: number = 50
): Promise<LocationUpdate[]> {
  try {
    const subscription = activeSubscriptions.get(rideId);
    if (!subscription) {
      return [];
    }

    return subscription.locations.slice(-limit);
  } catch (error) {
    console.error("[Location] Failed to get location history:", error);
    throw error;
  }
}

/**
 * Calculate distance between two coordinates (in km)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
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
  return R * c;
}

/**
 * Stop tracking a ride
 */
export async function stopTracking(rideId: number): Promise<{
  trackingId: string;
  status: "stopped";
  totalDistance: number;
  locationCount: number;
}> {
  try {
    const subscription = activeSubscriptions.get(rideId);
    if (!subscription) {
      throw new Error("Ride tracking not found");
    }

    // Calculate total distance traveled
    let totalDistance = 0;
    for (let i = 1; i < subscription.locations.length; i++) {
      const prev = subscription.locations[i - 1];
      const curr = subscription.locations[i];
      totalDistance += calculateDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
    }

    const trackingId = `TRK-${rideId}-${Date.now()}`;
    const locationCount = subscription.locations.length;

    activeSubscriptions.delete(rideId);

    console.log(`[Location] Stopped tracking ride ${rideId}: ${totalDistance.toFixed(2)} km`);

    return {
      trackingId,
      status: "stopped",
      totalDistance: Math.round(totalDistance * 100) / 100,
      locationCount,
    };
  } catch (error) {
    console.error("[Location] Failed to stop tracking:", error);
    throw error;
  }
}

/**
 * Get estimated arrival time (ETA)
 */
export async function calculateETA(
  rideId: number,
  destinationLat: number,
  destinationLon: number
): Promise<{
  eta: number; // in minutes
  distance: number; // in km
  averageSpeed: number; // in km/h
}> {
  try {
    const currentLocation = await getCurrentLocation(rideId);
    if (!currentLocation) {
      throw new Error("Current location not found");
    }

    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      destinationLat,
      destinationLon
    );

    // Assume average speed of 30 km/h in urban areas
    const averageSpeed = 30;
    const eta = Math.ceil((distance / averageSpeed) * 60); // in minutes

    return {
      eta,
      distance: Math.round(distance * 100) / 100,
      averageSpeed,
    };
  } catch (error) {
    console.error("[Location] Failed to calculate ETA:", error);
    throw error;
  }
}

/**
 * Get ride route summary
 */
export async function getRouteSummary(
  rideId: number
): Promise<{
  startLocation: LocationUpdate | null;
  endLocation: LocationUpdate | null;
  totalDistance: number;
  totalDuration: number;
  maxSpeed: number;
  averageSpeed: number;
}> {
  try {
    const subscription = activeSubscriptions.get(rideId);
    if (!subscription || subscription.locations.length === 0) {
      throw new Error("No location history found");
    }

    const locations = subscription.locations;
    const startLocation = locations[0];
    const endLocation = locations[locations.length - 1];

    // Calculate total distance
    let totalDistance = 0;
    for (let i = 1; i < locations.length; i++) {
      const prev = locations[i - 1];
      const curr = locations[i];
      totalDistance += calculateDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
    }

    // Calculate total duration
    const totalDuration = Math.round(
      (endLocation.timestamp.getTime() - startLocation.timestamp.getTime()) / 60000
    ); // in minutes

    // Calculate max and average speed
    const speeds = locations.map((loc) => loc.speed);
    const maxSpeed = Math.max(...speeds);
    const averageSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;

    return {
      startLocation,
      endLocation,
      totalDistance: Math.round(totalDistance * 100) / 100,
      totalDuration,
      maxSpeed,
      averageSpeed: Math.round(averageSpeed * 100) / 100,
    };
  } catch (error) {
    console.error("[Location] Failed to get route summary:", error);
    throw error;
  }
}
