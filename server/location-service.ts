import { Server as SocketIOServer } from "socket.io";
import * as db from "./db";

export interface LocationUpdate {
  driverId: number;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

export interface NearbyDriver {
  driverId: number;
  latitude: number;
  longitude: number;
  rating: number;
  totalRides: number;
  distance: number;
  eta: number; // in minutes
}

// Store active driver locations in memory
const driverLocations = new Map<number, LocationUpdate>();

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate ETA based on distance (average speed 30 km/h in city)
export function calculateETA(distanceKm: number): number {
  const averageSpeed = 30; // km/h
  return Math.ceil((distanceKm / averageSpeed) * 60); // minutes
}

// Find nearby drivers within specified radius
export function findNearbyDrivers(
  pickupLat: number,
  pickupLng: number,
  radiusKm: number = 5
): NearbyDriver[] {
  const nearbyDrivers: NearbyDriver[] = [];

  driverLocations.forEach((location, driverId) => {
    const distance = calculateDistance(
      pickupLat,
      pickupLng,
      location.latitude,
      location.longitude
    );

    if (distance <= radiusKm) {
      nearbyDrivers.push({
        driverId,
        latitude: location.latitude,
        longitude: location.longitude,
        rating: 4.8, // Mock rating
        totalRides: 150, // Mock total rides
        distance,
        eta: calculateETA(distance),
      });
    }
  });

  // Sort by distance
  return nearbyDrivers.sort((a, b) => a.distance - b.distance);
}

// Update driver location
export function updateDriverLocation(update: LocationUpdate): void {
  driverLocations.set(update.driverId, update);
}

// Get driver location
export function getDriverLocation(driverId: number): LocationUpdate | undefined {
  return driverLocations.get(driverId);
}

// Remove driver location
export function removeDriverLocation(driverId: number): void {
  driverLocations.delete(driverId);
}

// Get all online driver locations
export function getAllDriverLocations(): Map<number, LocationUpdate> {
  return driverLocations;
}

// Initialize WebSocket location service
export function initializeLocationService(io: SocketIOServer) {
  io.on("connection", (socket) => {
    console.log(`[Location Service] Client connected: ${socket.id}`);

    // Driver sends location update
    socket.on("driver:location-update", (data: LocationUpdate) => {
      try {
        updateDriverLocation(data);

        // Broadcast to all connected clients (riders)
        io.emit("driver:location-updated", {
          driverId: data.driverId,
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: data.timestamp,
        });
      } catch (error) {
        console.error("[Location Service] Error updating driver location:", error);
      }
    });

    // Rider requests nearby drivers
    socket.on(
      "rider:find-nearby-drivers",
      (
        data: {
          pickupLat: number;
          pickupLng: number;
          radiusKm?: number;
        },
        callback
      ) => {
        try {
          const nearbyDrivers = findNearbyDrivers(
            data.pickupLat,
            data.pickupLng,
            data.radiusKm || 5
          );
          callback({ success: true, drivers: nearbyDrivers });
        } catch (error) {
          console.error("[Location Service] Error finding nearby drivers:", error);
          callback({ success: false, error: "Failed to find nearby drivers" });
        }
      }
    );

    // Subscribe to driver location updates for a specific ride
    socket.on(
      "rider:subscribe-to-driver",
      (data: { driverId: number }, callback) => {
        try {
          socket.join(`driver:${data.driverId}`);
          const location = getDriverLocation(data.driverId);
          callback({ success: true, location });
        } catch (error) {
          console.error("[Location Service] Error subscribing to driver:", error);
          callback({ success: false, error: "Failed to subscribe" });
        }
      }
    );

    // Unsubscribe from driver location updates
    socket.on("rider:unsubscribe-from-driver", (data: { driverId: number }) => {
      socket.leave(`driver:${data.driverId}`);
    });

    // Get current driver count
    socket.on("admin:get-driver-count", (callback) => {
      try {
        callback({ success: true, count: driverLocations.size });
      } catch (error) {
        callback({ success: false, error: "Failed to get driver count" });
      }
    });

    // Get all driver locations for admin heatmap
    socket.on("admin:get-all-drivers", (callback) => {
      try {
        const drivers = Array.from(driverLocations.entries()).map(([id, location]) => ({
          driverId: id,
          latitude: location.latitude,
          longitude: location.longitude,
        }));
        callback({ success: true, drivers });
      } catch (error) {
        callback({ success: false, error: "Failed to get drivers" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Location Service] Client disconnected: ${socket.id}`);
    });
  });
}

// Broadcast driver location to specific ride room
export function broadcastDriverLocation(
  io: SocketIOServer,
  driverId: number,
  location: LocationUpdate
) {
  io.to(`driver:${driverId}`).emit("driver:location-update", {
    driverId,
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy,
    timestamp: location.timestamp,
  });
}
