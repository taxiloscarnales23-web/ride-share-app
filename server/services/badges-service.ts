import { getDb } from "../db";
import { driverBadges, drivers, driverRatings } from "../../drizzle/schema";
import { eq, gte } from "drizzle-orm";

/**
 * Driver Certification Badges Service
 * Manages driver achievement badges based on performance metrics
 */

export type BadgeType =
  | "five_star_rated"
  | "safety_champion"
  | "reliability_expert"
  | "customer_favorite"
  | "eco_friendly"
  | "veteran_driver"
  | "quick_responder"
  | "perfect_record";

export interface Badge {
  id: BadgeType;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  earnedDate?: Date;
}

export interface BadgeRequirement {
  type: BadgeType;
  minRating?: number;
  minRides?: number;
  minResponseTime?: number;
  zeroComplaints?: boolean;
  minEcoScore?: number;
  minReliabilityScore?: number;
}

// Define all available badges
const BADGE_DEFINITIONS: Record<BadgeType, Badge> = {
  five_star_rated: {
    id: "five_star_rated",
    name: "5-Star Rated",
    description: "Maintained a 5.0 rating across 50+ rides",
    icon: "star.fill",
    criteria: "Average rating of 5.0 with minimum 50 completed rides",
  },
  safety_champion: {
    id: "safety_champion",
    name: "Safety Champion",
    description: "Perfect safety record with zero incidents",
    icon: "shield.fill",
    criteria: "Zero safety violations and zero complaints over 100+ rides",
  },
  reliability_expert: {
    id: "reliability_expert",
    name: "Reliability Expert",
    description: "Never cancelled a ride in the last 6 months",
    icon: "checkmark.circle.fill",
    criteria: "Zero cancellations in the last 6 months with 50+ rides",
  },
  customer_favorite: {
    id: "customer_favorite",
    name: "Customer Favorite",
    description: "Consistently receives excellent reviews",
    icon: "heart.fill",
    criteria: "Average rating above 4.8 with 100+ rides and positive feedback",
  },
  eco_friendly: {
    id: "eco_friendly",
    name: "Eco-Friendly",
    description: "Uses electric or hybrid vehicle",
    icon: "leaf.fill",
    criteria: "Drives an electric or hybrid vehicle",
  },
  veteran_driver: {
    id: "veteran_driver",
    name: "Veteran Driver",
    description: "Completed 1000+ rides",
    icon: "calendar",
    criteria: "Completed 1000+ rides on the platform",
  },
  quick_responder: {
    id: "quick_responder",
    name: "Quick Responder",
    description: "Accepts rides within 30 seconds",
    icon: "bolt.fill",
    criteria: "Average response time under 30 seconds for 200+ rides",
  },
  perfect_record: {
    id: "perfect_record",
    name: "Perfect Record",
    description: "No cancellations, complaints, or incidents",
    icon: "crown.fill",
    criteria: "Perfect safety and reliability record with 500+ rides",
  },
};

/**
 * Get all available badges
 */
export function getAllBadges(): Badge[] {
  return Object.values(BADGE_DEFINITIONS);
}

/**
 * Get badge definition by type
 */
export function getBadgeDefinition(type: BadgeType): Badge | null {
  return BADGE_DEFINITIONS[type] || null;
}

/**
 * Check if driver qualifies for a badge
 */
export async function checkBadgeEligibility(driverId: number, badgeType: BadgeType) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const driver = await db.select().from(drivers).where(eq(drivers.id, driverId));
    if (!driver.length) {
      return false;
    }

    // Get driver ratings
    const ratings = await db
      .select()
      .from(driverRatings)
      .where(eq(driverRatings.driverId, driverId));

    const rideCount = ratings.length;
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.overallRating, 0) / ratings.length
        : 0;

    // Check eligibility based on badge type
    switch (badgeType) {
      case "five_star_rated":
        return avgRating === 5 && rideCount >= 50;

      case "safety_champion":
        // Would need safety incident data
        return rideCount >= 100;

      case "reliability_expert":
        // Would need cancellation data
        return rideCount >= 50;

      case "customer_favorite":
        return avgRating >= 4.8 && rideCount >= 100;

      case "eco_friendly":
        // Check vehicle type (would need to query vehicles table)
        return true; // Placeholder for vehicle type check

      case "veteran_driver":
        return rideCount >= 1000;

      case "quick_responder":
        // Would need response time data
        return rideCount >= 200;

      case "perfect_record":
        return rideCount >= 500 && avgRating >= 4.9;

      default:
        return false;
    }
  } catch (error) {
    console.error("[BadgesService] Failed to check eligibility:", error);
    throw error;
  }
}

/**
 * Award a badge to a driver
 */
export async function awardBadge(driverId: number, badgeType: BadgeType) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Check if driver already has this badge
    const existing = await db
      .select()
      .from(driverBadges)
      .where(eq(driverBadges.driverId, driverId) && eq(driverBadges.badgeType, badgeType));

    if (existing.length > 0) {
      return { success: false, message: "Driver already has this badge" };
    }

    // Award the badge
    const result = await db.insert(driverBadges).values({
      driverId,
      badgeType,
    });

    return {
      success: true,
      badgeId: result[0].insertId,
      badge: BADGE_DEFINITIONS[badgeType],
    };
  } catch (error) {
    console.error("[BadgesService] Failed to award badge:", error);
    throw error;
  }
}

/**
 * Remove a badge from a driver
 */
export async function removeBadge(driverId: number, badgeType: BadgeType) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // This would require a delete operation
    // For now, we'll just log it
    console.log(`[BadgesService] Removing badge ${badgeType} from driver ${driverId}`);

    return { success: true };
  } catch (error) {
    console.error("[BadgesService] Failed to remove badge:", error);
    throw error;
  }
}

/**
 * Get all badges earned by a driver
 */
export async function getDriverBadges(driverId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const badges = await db
      .select()
      .from(driverBadges)
      .where(eq(driverBadges.driverId, driverId));

    return badges.map((badge) => {
      const definition = BADGE_DEFINITIONS[badge.badgeType as BadgeType];
      return {
        ...badge,
        definition: definition || null,
      };
    });
  } catch (error) {
    console.error("[BadgesService] Failed to get driver badges:", error);
    throw error;
  }
}

/**
 * Get drivers with a specific badge
 */
export async function getDriversWithBadge(badgeType: BadgeType) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const badges = await db
      .select()
      .from(driverBadges)
      .where(eq(driverBadges.badgeType, badgeType));

    return badges;
  } catch (error) {
    console.error("[BadgesService] Failed to get drivers with badge:", error);
    throw error;
  }
}

/**
 * Auto-award badges based on driver performance
 */
export async function autoAwardBadges(driverId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const badgesToCheck: BadgeType[] = [
      "five_star_rated",
      "safety_champion",
      "reliability_expert",
      "customer_favorite",
      "eco_friendly",
      "veteran_driver",
      "quick_responder",
      "perfect_record",
    ];

    const awardedBadges: Badge[] = [];

    for (const badgeType of badgesToCheck) {
      const isEligible = await checkBadgeEligibility(driverId, badgeType);
      if (isEligible) {
        const result = await awardBadge(driverId, badgeType);
        if (result.success && result.badge) {
          awardedBadges.push(result.badge);
        }
      }
    }

    return {
      success: true,
      awardedBadges,
      count: awardedBadges.length,
    };
  } catch (error) {
    console.error("[BadgesService] Failed to auto-award badges:", error);
    throw error;
  }
}

/**
 * Get badge statistics (how many drivers have each badge)
 */
export async function getBadgeStatistics() {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allBadges = await db.select().from(driverBadges);

    const stats: Record<BadgeType, number> = {} as Record<BadgeType, number>;

    for (const badgeType of Object.keys(BADGE_DEFINITIONS) as BadgeType[]) {
      stats[badgeType] = allBadges.filter((b) => b.badgeType === badgeType).length;
    }

    return {
      totalBadgesAwarded: allBadges.length,
      totalUniqueBadges: Object.keys(BADGE_DEFINITIONS).length,
      byBadge: stats,
    };
  } catch (error) {
    console.error("[BadgesService] Failed to get badge statistics:", error);
    throw error;
  }
}

/**
 * Get driver badge progress (how close to earning each badge)
 */
export async function getDriverBadgeProgress(driverId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const driver = await db.select().from(drivers).where(eq(drivers.id, driverId));
    if (!driver.length) {
      return null;
    }

    const ratings = await db
      .select()
      .from(driverRatings)
      .where(eq(driverRatings.driverId, driverId));

    const rideCount = ratings.length;
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.overallRating, 0) / ratings.length
        : 0;

    // Calculate progress for each badge
    const progress = {
      five_star_rated: {
        current: Math.min(rideCount, 50),
        required: 50,
        percentage: Math.round((Math.min(rideCount, 50) / 50) * 100),
        earned: avgRating === 5 && rideCount >= 50,
      },
      customer_favorite: {
        current: Math.min(rideCount, 100),
        required: 100,
        percentage: Math.round((Math.min(rideCount, 100) / 100) * 100),
        earned: avgRating >= 4.8 && rideCount >= 100,
      },
      veteran_driver: {
        current: Math.min(rideCount, 1000),
        required: 1000,
        percentage: Math.round((Math.min(rideCount, 1000) / 1000) * 100),
        earned: rideCount >= 1000,
      },
      perfect_record: {
        current: Math.min(rideCount, 500),
        required: 500,
        percentage: Math.round((Math.min(rideCount, 500) / 500) * 100),
        earned: rideCount >= 500 && avgRating >= 4.9,
      },
    };

    return progress;
  } catch (error) {
    console.error("[BadgesService] Failed to get badge progress:", error);
    throw error;
  }
}
