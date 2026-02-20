/**
 * Advanced Search Filters Service
 * Provides filtering and search capabilities for rides
 */

export interface SearchFilters {
  priceRange?: {
    min: number;
    max: number;
  };
  ratingRange?: {
    min: number;
    max: number;
  };
  rideType?: 'economy' | 'comfort' | 'premium';
  vehicleType?: 'sedan' | 'suv' | 'van' | 'motorcycle';
  accessibility?: {
    wheelchairAccessible: boolean;
    petFriendly: boolean;
    wifiAvailable: boolean;
  };
  driverPreferences?: {
    preferredGender?: 'male' | 'female' | 'any';
    preferredLanguage?: string;
    musicPreference?: 'quiet' | 'soft' | 'upbeat';
  };
  timeRange?: {
    startTime: Date;
    endTime: Date;
  };
  distance?: {
    maxDistance: number; // in km
  };
}

export interface RideOption {
  id: string;
  driverId: string;
  driverName: string;
  driverRating: number;
  vehicleType: string;
  rideType: 'economy' | 'comfort' | 'premium';
  estimatedFare: number;
  estimatedTime: number; // in minutes
  distance: number; // in km
  accessibility: {
    wheelchairAccessible: boolean;
    petFriendly: boolean;
    wifiAvailable: boolean;
  };
  driverPreferences: {
    preferredGender?: string;
    preferredLanguage?: string;
    musicPreference?: string;
  };
}

export class SearchFiltersService {
  /**
   * Apply filters to available rides
   */
  applyFilters(rides: RideOption[], filters: SearchFilters): RideOption[] {
    let filtered = [...rides];

    // Filter by price range
    if (filters.priceRange) {
      filtered = filtered.filter(
        ride =>
          ride.estimatedFare >= filters.priceRange!.min &&
          ride.estimatedFare <= filters.priceRange!.max
      );
    }

    // Filter by driver rating
    if (filters.ratingRange) {
      filtered = filtered.filter(
        ride =>
          ride.driverRating >= filters.ratingRange!.min &&
          ride.driverRating <= filters.ratingRange!.max
      );
    }

    // Filter by ride type
    if (filters.rideType) {
      filtered = filtered.filter(ride => ride.rideType === filters.rideType);
    }

    // Filter by vehicle type
    if (filters.vehicleType) {
      filtered = filtered.filter(ride => ride.vehicleType === filters.vehicleType);
    }

    // Filter by accessibility features
    if (filters.accessibility) {
      filtered = filtered.filter(ride => {
        if (filters.accessibility!.wheelchairAccessible && !ride.accessibility.wheelchairAccessible) {
          return false;
        }
        if (filters.accessibility!.petFriendly && !ride.accessibility.petFriendly) {
          return false;
        }
        if (filters.accessibility!.wifiAvailable && !ride.accessibility.wifiAvailable) {
          return false;
        }
        return true;
      });
    }

    // Filter by distance
    if (filters.distance) {
      filtered = filtered.filter(ride => ride.distance <= filters.distance!.maxDistance);
    }

    // Filter by time range
    if (filters.timeRange) {
      filtered = filtered.filter(ride => {
        const rideTime = new Date();
        return (
          rideTime >= filters.timeRange!.startTime &&
          rideTime <= filters.timeRange!.endTime
        );
      });
    }

    return filtered;
  }

  /**
   * Sort rides by criteria
   */
  sortRides(
    rides: RideOption[],
    sortBy: 'price' | 'rating' | 'time' | 'distance'
  ): RideOption[] {
    const sorted = [...rides];

    switch (sortBy) {
      case 'price':
        sorted.sort((a, b) => a.estimatedFare - b.estimatedFare);
        break;
      case 'rating':
        sorted.sort((a, b) => b.driverRating - a.driverRating);
        break;
      case 'time':
        sorted.sort((a, b) => a.estimatedTime - b.estimatedTime);
        break;
      case 'distance':
        sorted.sort((a, b) => a.distance - b.distance);
        break;
    }

    return sorted;
  }

  /**
   * Get recommended rides based on user preferences
   */
  getRecommendedRides(rides: RideOption[], userPreferences: SearchFilters): RideOption[] {
    let recommended = this.applyFilters(rides, userPreferences);
    recommended = this.sortRides(recommended, 'price');
    return recommended.slice(0, 5); // Return top 5 recommendations
  }

  /**
   * Calculate match score for a ride
   */
  calculateMatchScore(ride: RideOption, preferences: SearchFilters): number {
    let score = 100;

    // Deduct points for not matching preferences
    if (preferences.rideType && ride.rideType !== preferences.rideType) {
      score -= 10;
    }

    if (preferences.vehicleType && ride.vehicleType !== preferences.vehicleType) {
      score -= 10;
    }

    if (preferences.ratingRange) {
      if (ride.driverRating < preferences.ratingRange.min) {
        score -= 20;
      }
    }

    if (preferences.priceRange) {
      if (
        ride.estimatedFare < preferences.priceRange.min ||
        ride.estimatedFare > preferences.priceRange.max
      ) {
        score -= 15;
      }
    }

    if (preferences.accessibility) {
      if (preferences.accessibility.wheelchairAccessible && !ride.accessibility.wheelchairAccessible) {
        score -= 30;
      }
      if (preferences.accessibility.petFriendly && !ride.accessibility.petFriendly) {
        score -= 15;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Get filter options available
   */
  getAvailableFilterOptions(): {
    rideTypes: string[];
    vehicleTypes: string[];
    priceRange: { min: number; max: number };
    ratingRange: { min: number; max: number };
    languages: string[];
    musicPreferences: string[];
  } {
    return {
      rideTypes: ['economy', 'comfort', 'premium'],
      vehicleTypes: ['sedan', 'suv', 'van', 'motorcycle'],
      priceRange: { min: 5, max: 100 },
      ratingRange: { min: 1, max: 5 },
      languages: ['English', 'Spanish', 'French', 'Mandarin', 'Hindi', 'Arabic'],
      musicPreferences: ['quiet', 'soft', 'upbeat']
    };
  }

  /**
   * Search rides by location
   */
  searchByLocation(
    rides: RideOption[],
    pickupLat: number,
    pickupLng: number,
    maxDistance: number
  ): RideOption[] {
    return rides.filter(ride => {
      // In production, calculate actual distance using Haversine formula
      return ride.distance <= maxDistance;
    });
  }

  /**
   * Get popular filters
   */
  getPopularFilters(): SearchFilters[] {
    return [
      {
        rideType: 'economy',
        priceRange: { min: 5, max: 30 }
      },
      {
        rideType: 'comfort',
        ratingRange: { min: 4.5, max: 5 }
      },
      {
        accessibility: {
          wheelchairAccessible: true,
          petFriendly: false,
          wifiAvailable: false
        }
      },
      {
        vehicleType: 'suv',
        accessibility: {
          wheelchairAccessible: false,
          petFriendly: true,
          wifiAvailable: false
        }
      }
    ];
  }

  /**
   * Save filter preset
   */
  saveFilterPreset(name: string, filters: SearchFilters): void {
    // In production, save to database
    console.log(`Saved filter preset: ${name}`, filters);
  }

  /**
   * Get saved filter presets
   */
  getSavedPresets(): Array<{ name: string; filters: SearchFilters }> {
    // In production, retrieve from database
    return [];
  }
}

export const searchFiltersService = new SearchFiltersService();
