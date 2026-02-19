import * as db from "./db";

export interface RideMatch {
  driverId: number;
  distance: number;
  estimatedTime: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
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
 * Find nearby drivers for a ride request
 * Returns drivers within 5km radius, sorted by distance
 */
export async function findNearbyDrivers(
  pickupLatitude: string,
  pickupLongitude: string,
  maxDistance: number = 5
): Promise<RideMatch[]> {
  const onlineDrivers = await db.getOnlineDrivers();

  const matches: RideMatch[] = onlineDrivers
    .map((driver) => {
      const driverLat = parseFloat(driver.currentLatitude || "0");
      const driverLon = parseFloat(driver.currentLongitude || "0");
      const pickupLat = parseFloat(pickupLatitude);
      const pickupLon = parseFloat(pickupLongitude);

      const distance = calculateDistance(driverLat, driverLon, pickupLat, pickupLon);

      return {
        driverId: driver.id,
        distance,
        estimatedTime: Math.ceil(distance * 2), // Rough estimate: 2 min per km
      };
    })
    .filter((match) => match.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);

  return matches;
}

/**
 * Calculate fare based on distance and base rate
 */
export function calculateFare(distanceKm: number): string {
  const baseRate = 2.5; // $2.50 base fare
  const perKmRate = 1.5; // $1.50 per km
  const minimumFare = 5.0; // $5.00 minimum

  const fare = baseRate + distanceKm * perKmRate;
  return Math.max(fare, minimumFare).toFixed(2);
}
