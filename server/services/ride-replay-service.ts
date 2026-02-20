import { getDb } from "../db";
import { rideLocations, rides } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Ride Replay Service
 * Handles route visualization and replay data for completed rides
 */

export interface RoutePoint {
  latitude: string;
  longitude: string;
  timestamp: Date;
  accuracy?: string;
  speed?: string;
  sequence: number;
}

export interface RideReplayData {
  rideId: number;
  startTime: Date;
  endTime: Date;
  totalDistance: number;
  totalDuration: number;
  averageSpeed: number;
  maxSpeed: number;
  routePoints: RoutePoint[];
  startLocation: { latitude: string; longitude: string };
  endLocation: { latitude: string; longitude: string };
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
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
 * Get complete ride replay data with route visualization
 */
export async function getRideReplayData(rideId: number): Promise<RideReplayData | null> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get ride details
    const rideData = await db.select().from(rides).where(eq(rides.id, rideId));
    if (!rideData.length) {
      return null;
    }

    const ride = rideData[0];

    // Get all location points for the ride
    const locations = await db
      .select()
      .from(rideLocations)
      .where(eq(rideLocations.rideId, rideId));

    if (!locations.length) {
      return null;
    }

    // Sort by timestamp
    const sortedLocations = locations.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Build route points with sequence
    const routePoints: RoutePoint[] = sortedLocations.map((loc, index) => ({
      latitude: loc.latitude,
      longitude: loc.longitude,
      timestamp: loc.timestamp,
      accuracy: loc.accuracy || undefined,
      speed: loc.speed || undefined,
      sequence: index,
    }));

    // Calculate total distance
    let totalDistance = 0;
    for (let i = 1; i < sortedLocations.length; i++) {
      const lat1 = parseFloat(sortedLocations[i - 1].latitude);
      const lon1 = parseFloat(sortedLocations[i - 1].longitude);
      const lat2 = parseFloat(sortedLocations[i].latitude);
      const lon2 = parseFloat(sortedLocations[i].longitude);

      totalDistance += calculateDistance(lat1, lon1, lat2, lon2);
    }

    // Calculate time duration
    const startTime = new Date(sortedLocations[0].timestamp);
    const endTime = new Date(sortedLocations[sortedLocations.length - 1].timestamp);
    const totalDuration = (endTime.getTime() - startTime.getTime()) / 1000 / 60; // in minutes

    // Calculate average and max speed
    const speeds = sortedLocations
      .filter((loc) => loc.speed)
      .map((loc) => parseFloat(loc.speed!));
    const averageSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;
    const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;

    // Get start and end locations
    const startLocation = {
      latitude: sortedLocations[0].latitude,
      longitude: sortedLocations[0].longitude,
    };
    const endLocation = {
      latitude: sortedLocations[sortedLocations.length - 1].latitude,
      longitude: sortedLocations[sortedLocations.length - 1].longitude,
    };

    return {
      rideId,
      startTime,
      endTime,
      totalDistance: Math.round(totalDistance * 10) / 10,
      totalDuration: Math.round(totalDuration),
      averageSpeed: Math.round(averageSpeed * 10) / 10,
      maxSpeed: Math.round(maxSpeed * 10) / 10,
      routePoints,
      startLocation,
      endLocation,
    };
  } catch (error) {
    console.error("[RideReplayService] Failed to get replay data:", error);
    throw error;
  }
}

/**
 * Get simplified route (every nth point for performance)
 */
export async function getSimplifiedRoute(
  rideId: number,
  pointInterval: number = 5
): Promise<RoutePoint[] | null> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const locations = await db
      .select()
      .from(rideLocations)
      .where(eq(rideLocations.rideId, rideId));

    if (!locations.length) {
      return null;
    }

    const sortedLocations = locations.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Return every nth point
    const simplified = sortedLocations
      .filter((_, index) => index % pointInterval === 0)
      .map((loc, index) => ({
        latitude: loc.latitude,
        longitude: loc.longitude,
        timestamp: loc.timestamp,
        accuracy: loc.accuracy || undefined,
        speed: loc.speed || undefined,
        sequence: index,
      }));

    return simplified;
  } catch (error) {
    console.error("[RideReplayService] Failed to get simplified route:", error);
    throw error;
  }
}

/**
 * Get route statistics for a ride
 */
export async function getRouteStatistics(rideId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const locations = await db
      .select()
      .from(rideLocations)
      .where(eq(rideLocations.rideId, rideId));

    if (!locations.length) {
      return null;
    }

    const sortedLocations = locations.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Calculate statistics
    const speeds = sortedLocations
      .filter((loc) => loc.speed)
      .map((loc) => parseFloat(loc.speed!));

    const accuracies = sortedLocations
      .filter((loc) => loc.accuracy)
      .map((loc) => parseFloat(loc.accuracy!));

    const stats = {
      totalPoints: sortedLocations.length,
      speedStats: {
        min: speeds.length > 0 ? Math.min(...speeds) : 0,
        max: speeds.length > 0 ? Math.max(...speeds) : 0,
        average: speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0,
        median:
          speeds.length > 0
            ? speeds.sort((a, b) => a - b)[Math.floor(speeds.length / 2)]
            : 0,
      },
      accuracyStats: {
        min: accuracies.length > 0 ? Math.min(...accuracies) : 0,
        max: accuracies.length > 0 ? Math.max(...accuracies) : 0,
        average:
          accuracies.length > 0
            ? accuracies.reduce((a, b) => a + b, 0) / accuracies.length
            : 0,
      },
      timeSpan: {
        start: sortedLocations[0].timestamp,
        end: sortedLocations[sortedLocations.length - 1].timestamp,
        durationMinutes:
          (new Date(sortedLocations[sortedLocations.length - 1].timestamp).getTime() -
            new Date(sortedLocations[0].timestamp).getTime()) /
          1000 /
          60,
      },
    };

    return stats;
  } catch (error) {
    console.error("[RideReplayService] Failed to get route statistics:", error);
    throw error;
  }
}

/**
 * Get route segments (breaks in the route due to GPS gaps)
 */
export async function getRouteSegments(rideId: number, gapThresholdSeconds: number = 60) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const locations = await db
      .select()
      .from(rideLocations)
      .where(eq(rideLocations.rideId, rideId));

    if (!locations.length) {
      return [];
    }

    const sortedLocations = locations.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const segments: RoutePoint[][] = [];
    let currentSegment: RoutePoint[] = [];

    for (let i = 0; i < sortedLocations.length; i++) {
      const loc = sortedLocations[i];

      if (i === 0) {
        currentSegment.push({
          latitude: loc.latitude,
          longitude: loc.longitude,
          timestamp: loc.timestamp,
          accuracy: loc.accuracy || undefined,
          speed: loc.speed || undefined,
          sequence: 0,
        });
      } else {
        const prevLoc = sortedLocations[i - 1];
        const timeDiff =
          (new Date(loc.timestamp).getTime() - new Date(prevLoc.timestamp).getTime()) / 1000;

        if (timeDiff > gapThresholdSeconds) {
          // Gap detected, start new segment
          segments.push(currentSegment);
          currentSegment = [];
        }

        currentSegment.push({
          latitude: loc.latitude,
          longitude: loc.longitude,
          timestamp: loc.timestamp,
          accuracy: loc.accuracy || undefined,
          speed: loc.speed || undefined,
          sequence: currentSegment.length,
        });
      }
    }

    // Add final segment
    if (currentSegment.length > 0) {
      segments.push(currentSegment);
    }

    return segments;
  } catch (error) {
    console.error("[RideReplayService] Failed to get route segments:", error);
    throw error;
  }
}

/**
 * Detect anomalies in the route (sudden speed changes, GPS jumps)
 */
export async function detectRouteAnomalies(rideId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const locations = await db
      .select()
      .from(rideLocations)
      .where(eq(rideLocations.rideId, rideId));

    if (locations.length < 2) {
      return [];
    }

    const sortedLocations = locations.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const anomalies: any[] = [];
    const speeds: number[] = [];

    // Calculate speeds
    for (let i = 1; i < sortedLocations.length; i++) {
      const lat1 = parseFloat(sortedLocations[i - 1].latitude);
      const lon1 = parseFloat(sortedLocations[i - 1].longitude);
      const lat2 = parseFloat(sortedLocations[i].latitude);
      const lon2 = parseFloat(sortedLocations[i].longitude);

      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      const timeDiff =
        (new Date(sortedLocations[i].timestamp).getTime() -
          new Date(sortedLocations[i - 1].timestamp).getTime()) /
        1000 /
        3600; // hours

      const speed = distance / timeDiff;
      speeds.push(speed);
    }

    // Calculate average and standard deviation
    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const variance =
      speeds.reduce((sum, speed) => sum + Math.pow(speed - avgSpeed, 2), 0) / speeds.length;
    const stdDev = Math.sqrt(variance);

    // Detect anomalies (speeds > 2 standard deviations from mean)
    for (let i = 0; i < speeds.length; i++) {
      if (Math.abs(speeds[i] - avgSpeed) > 2 * stdDev) {
        anomalies.push({
          pointIndex: i + 1,
          timestamp: sortedLocations[i + 1].timestamp,
          speed: Math.round(speeds[i] * 10) / 10,
          type: speeds[i] > avgSpeed ? "speed_spike" : "speed_drop",
          severity: Math.abs(speeds[i] - avgSpeed) / stdDev,
        });
      }
    }

    return anomalies;
  } catch (error) {
    console.error("[RideReplayService] Failed to detect anomalies:", error);
    throw error;
  }
}
