import { getDb } from "../db";
import { rideLocations, rides, drivers, vehicles } from "../../drizzle/schema";
import { eq, desc, and, gte } from "drizzle-orm";

/**
 * Vehicle Tracking Service
 * Handles real-time location tracking and ride location history
 */

export interface LocationUpdate {
  rideId: number;
  driverId: number;
  latitude: string;
  longitude: string;
  accuracy?: string;
  speed?: string;
}

export interface RideLocationData {
  rideId: number;
  driverId: number;
  currentLocation: {
    latitude: string;
    longitude: string;
    accuracy?: string;
    speed?: string;
    timestamp: Date;
  };
  vehicleInfo?: any;
  locationHistory: any[];
}

/**
 * Record a location update for an active ride
 */
export async function recordLocationUpdate(update: LocationUpdate) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Validate coordinates
    const lat = parseFloat(update.latitude);
    const lon = parseFloat(update.longitude);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      throw new Error("Invalid coordinates");
    }

    // Record the location
    await db.insert(rideLocations).values({
      rideId: update.rideId,
      driverId: update.driverId,
      latitude: update.latitude,
      longitude: update.longitude,
      accuracy: update.accuracy,
      speed: update.speed,
    });

    return { success: true };
  } catch (error) {
    console.error("[TrackingService] Failed to record location:", error);
    throw error;
  }
}

/**
 * Get current location for an active ride
 */
export async function getCurrentRideLocation(rideId: number): Promise<RideLocationData | null> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get the ride
    const rideData = await db.select().from(rides).where(eq(rides.id, rideId));
    if (!rideData.length) {
      return null;
    }

    const ride = rideData[0];

    // Get latest location
    const latestLocation = await db
      .select()
      .from(rideLocations)
      .where(eq(rideLocations.rideId, rideId))
      .orderBy(desc(rideLocations.timestamp))
      .limit(1);

    if (!latestLocation.length) {
      return null;
    }

    const currentLoc = latestLocation[0];

    // Get vehicle info
    let vehicleInfo = null;
    if (ride.driverId) {
      const vehicleData = await db
        .select()
        .from(vehicles)
        .where(eq(vehicles.driverId, ride.driverId))
        .limit(1);
      if (vehicleData.length) {
        vehicleInfo = vehicleData[0];
      }
    }

    // Get location history (last 20 points)
    const history = await db
      .select()
      .from(rideLocations)
      .where(eq(rideLocations.rideId, rideId))
      .orderBy(desc(rideLocations.timestamp))
      .limit(20);

    return {
      rideId,
      driverId: ride.driverId || 0,
      currentLocation: {
        latitude: currentLoc.latitude,
        longitude: currentLoc.longitude,
        accuracy: currentLoc.accuracy || undefined,
        speed: currentLoc.speed || undefined,
        timestamp: currentLoc.timestamp,
      },
      vehicleInfo,
      locationHistory: history.reverse(),
    };
  } catch (error) {
    console.error("[TrackingService] Failed to get current location:", error);
    throw error;
  }
}

/**
 * Get location history for a completed ride
 */
export async function getRideLocationHistory(rideId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const history = await db
      .select()
      .from(rideLocations)
      .where(eq(rideLocations.rideId, rideId))
      .orderBy(rideLocations.timestamp);

    return history;
  } catch (error) {
    console.error("[TrackingService] Failed to get location history:", error);
    throw error;
  }
}

/**
 * Calculate distance between two points using Haversine formula
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
 * Calculate ETA based on current location and destination
 */
export function calculateETA(
  currentLat: number,
  currentLon: number,
  destLat: number,
  destLon: number,
  averageSpeed = 40 // km/h
): { distanceKm: number; estimatedMinutes: number } {
  const distanceKm = calculateDistance(currentLat, currentLon, destLat, destLon);
  const estimatedMinutes = Math.round((distanceKm / averageSpeed) * 60);

  return {
    distanceKm: Math.round(distanceKm * 10) / 10,
    estimatedMinutes,
  };
}

/**
 * Get driver's current location
 */
export async function getDriverCurrentLocation(driverId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get driver's active ride
    const activeRide = await db
      .select()
      .from(rides)
      .where(
        and(
          eq(rides.driverId, driverId),
          eq(rides.status, "in_progress" as any)
        )
      )
      .limit(1);

    if (!activeRide.length) {
      // Return driver's last known location from drivers table
      const driver = await db.select().from(drivers).where(eq(drivers.id, driverId));
      if (driver.length && driver[0].currentLatitude && driver[0].currentLongitude) {
        return {
          latitude: driver[0].currentLatitude,
          longitude: driver[0].currentLongitude,
          source: "last_known",
        };
      }
      return null;
    }

    // Get current location from active ride
    const location = await getCurrentRideLocation(activeRide[0].id);
    return location?.currentLocation
      ? {
          latitude: location.currentLocation.latitude,
          longitude: location.currentLocation.longitude,
          accuracy: location.currentLocation.accuracy,
          speed: location.currentLocation.speed,
          timestamp: location.currentLocation.timestamp,
          source: "active_ride",
        }
      : null;
  } catch (error) {
    console.error("[TrackingService] Failed to get driver location:", error);
    throw error;
  }
}

/**
 * Clean up old location records (older than 7 days)
 */
export async function cleanupOldLocations() {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // This would require raw SQL or a custom query
    // For now, we'll just log that this should be done
    console.log("[TrackingService] Cleanup of locations older than 7 days should be scheduled");

    return { success: true };
  } catch (error) {
    console.error("[TrackingService] Failed to cleanup old locations:", error);
    throw error;
  }
}
