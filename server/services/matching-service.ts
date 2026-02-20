export interface MatchingCriteria {
  rideId: string;
  pickupLat: number;
  pickupLng: number;
  maxDistance: number;
  minRating: number;
  preferredVehicleType?: string;
}

export interface DriverMatch {
  driverId: string;
  driverName: string;
  rating: number;
  distance: number;
  eta: number;
  acceptanceRate: number;
  cancellationRate: number;
  matchScore: number;
  isOnline: boolean;
  currentPassengers: number;
  maxCapacity: number;
}

export class MatchingService {
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371;
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

  private calculateETA(distance: number): number {
    const averageSpeed = 30;
    return Math.ceil((distance / averageSpeed) * 60);
  }

  private calculateMatchScore(
    distance: number,
    rating: number,
    acceptanceRate: number,
    cancellationRate: number
  ): number {
    const distanceScore = Math.max(0, 30 - distance * 2);
    const ratingScore = Math.max(0, (rating / 5) * 40);
    const reliabilityScore = ((acceptanceRate - cancellationRate) / 100) * 30;
    const totalScore = distanceScore + ratingScore + reliabilityScore;
    return Math.min(100, Math.max(0, totalScore));
  }

  async findMatchingDrivers(criteria: MatchingCriteria): Promise<DriverMatch[]> {
    // Mock drivers for demonstration
    const mockDrivers: DriverMatch[] = [
      {
        driverId: "driver-1",
        driverName: "John Smith",
        rating: 4.9,
        distance: 2.3,
        eta: 8,
        acceptanceRate: 95,
        cancellationRate: 2,
        matchScore: 92,
        isOnline: true,
        currentPassengers: 0,
        maxCapacity: 4,
      },
      {
        driverId: "driver-2",
        driverName: "Sarah Johnson",
        rating: 4.8,
        distance: 3.1,
        eta: 11,
        acceptanceRate: 92,
        cancellationRate: 3,
        matchScore: 88,
        isOnline: true,
        currentPassengers: 1,
        maxCapacity: 4,
      },
      {
        driverId: "driver-3",
        driverName: "Mike Davis",
        rating: 4.7,
        distance: 4.2,
        eta: 14,
        acceptanceRate: 88,
        cancellationRate: 5,
        matchScore: 82,
        isOnline: true,
        currentPassengers: 0,
        maxCapacity: 4,
      },
    ];

    return mockDrivers.filter((d) => d.distance <= criteria.maxDistance && d.rating >= criteria.minRating);
  }

  async assignRideToDriver(rideId: string, driverId: string): Promise<boolean> {
    return true;
  }

  async getMatchingStats(driverId: string): Promise<{
    totalMatches: number;
    acceptedMatches: number;
    acceptanceRate: number;
    averageMatchScore: number;
  }> {
    return {
      totalMatches: 42,
      acceptedMatches: 38,
      acceptanceRate: 90.5,
      averageMatchScore: 82.3,
    };
  }
}

export const matchingService = new MatchingService();
