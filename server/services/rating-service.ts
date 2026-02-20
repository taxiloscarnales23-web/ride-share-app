import { getDb } from "../db";
import { driverRatings, drivers, rides } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Driver Rating Service
 * Handles creation, retrieval, and aggregation of driver ratings from riders
 */

export interface CreateRatingInput {
  rideId: number;
  riderId: number;
  driverId: number;
  overallRating: number; // 1-5
  cleanliness?: number; // 1-5
  safety?: number; // 1-5
  communication?: number; // 1-5
  review?: string;
}

export interface DriverRatingStats {
  driverId: number;
  averageRating: number;
  totalRatings: number;
  averageCleanliness?: number;
  averageSafety?: number;
  averageCommunication?: number;
  recentRatings: any[];
}

/**
 * Create a new rating for a driver
 */
export async function createDriverRating(input: CreateRatingInput) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Validate rating values
    if (input.overallRating < 1 || input.overallRating > 5) {
      throw new Error("Overall rating must be between 1 and 5");
    }

    if (input.cleanliness && (input.cleanliness < 1 || input.cleanliness > 5)) {
      throw new Error("Cleanliness rating must be between 1 and 5");
    }

    if (input.safety && (input.safety < 1 || input.safety > 5)) {
      throw new Error("Safety rating must be between 1 and 5");
    }

    if (input.communication && (input.communication < 1 || input.communication > 5)) {
      throw new Error("Communication rating must be between 1 and 5");
    }

    // Create the rating
    const result = await db.insert(driverRatings).values({
      rideId: input.rideId,
      riderId: input.riderId,
      driverId: input.driverId,
      overallRating: input.overallRating,
      cleanliness: input.cleanliness,
      safety: input.safety,
      communication: input.communication,
      review: input.review,
    });

    // Update driver's average rating
    await updateDriverAverageRating(input.driverId);

    return { success: true, ratingId: result[0].insertId };
  } catch (error) {
    console.error("[RatingService] Failed to create rating:", error);
    throw error;
  }
}

/**
 * Get all ratings for a specific driver
 */
export async function getDriverRatings(driverId: number, limit = 10) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const ratings = await db
      .select()
      .from(driverRatings)
      .where(eq(driverRatings.driverId, driverId))
      .orderBy(driverRatings.createdAt)
      .limit(limit);

    return ratings;
  } catch (error) {
    console.error("[RatingService] Failed to get driver ratings:", error);
    throw error;
  }
}

/**
 * Get rating statistics for a driver
 */
export async function getDriverRatingStats(driverId: number): Promise<DriverRatingStats> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const ratings = await db
      .select()
      .from(driverRatings)
      .where(eq(driverRatings.driverId, driverId));

    if (ratings.length === 0) {
      return {
        driverId,
        averageRating: 5.0,
        totalRatings: 0,
        recentRatings: [],
      };
    }

    const totalRatings = ratings.length;
    const averageRating =
      ratings.reduce((sum: number, r: any) => sum + r.overallRating, 0) / totalRatings;

    const averageCleanliness = ratings.filter((r: any) => r.cleanliness).length
      ? ratings.reduce((sum: number, r: any) => sum + (r.cleanliness || 0), 0) /
        ratings.filter((r: any) => r.cleanliness).length
      : undefined;

    const averageSafety = ratings.filter((r: any) => r.safety).length
      ? ratings.reduce((sum: number, r: any) => sum + (r.safety || 0), 0) /
        ratings.filter((r: any) => r.safety).length
      : undefined;

    const averageCommunication = ratings.filter((r: any) => r.communication).length
      ? ratings.reduce((sum: number, r: any) => sum + (r.communication || 0), 0) /
        ratings.filter((r: any) => r.communication).length
      : undefined;

    const recentRatings = ratings.slice(-5).reverse();

    return {
      driverId,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings,
      averageCleanliness: averageCleanliness ? Math.round(averageCleanliness * 10) / 10 : undefined,
      averageSafety: averageSafety ? Math.round(averageSafety * 10) / 10 : undefined,
      averageCommunication: averageCommunication
        ? Math.round(averageCommunication * 10) / 10
        : undefined,
      recentRatings,
    };
  } catch (error) {
    console.error("[RatingService] Failed to get rating stats:", error);
    throw error;
  }
}

/**
 * Update driver's average rating in the drivers table
 */
async function updateDriverAverageRating(driverId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const stats = await getDriverRatingStats(driverId);
    await db
      .update(drivers)
      .set({ rating: stats.averageRating.toString() })
      .where(eq(drivers.id, driverId));
  } catch (error) {
    console.error("[RatingService] Failed to update driver average rating:", error);
    // Don't throw - this is a background update
  }
}

/**
 * Get a specific rating
 */
export async function getRating(ratingId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const rating = await db
      .select()
      .from(driverRatings)
      .where(eq(driverRatings.id, ratingId));

    return rating[0] || null;
  } catch (error) {
    console.error("[RatingService] Failed to get rating:", error);
    throw error;
  }
}

/**
 * Check if a rider has already rated a driver for a specific ride
 */
export async function hasRatedRide(rideId: number, riderId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const existing = await db
      .select()
      .from(driverRatings)
      .where(and(eq(driverRatings.rideId, rideId), eq(driverRatings.riderId, riderId)));

    return existing.length > 0;
  } catch (error) {
    console.error("[RatingService] Failed to check if ride was rated:", error);
    throw error;
  }
}

/**
 * Get drivers sorted by rating
 */
export async function getTopRatedDrivers(limit = 10) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allDrivers = await db.select().from(drivers);

    // Get stats for each driver
    const driversWithStats = await Promise.all(
      allDrivers.map(async (driver: any) => {
        const stats = await getDriverRatingStats(driver.id);
        return {
          ...driver,
          stats,
        };
      })
    );

    // Sort by average rating and return top drivers
    return driversWithStats
      .sort((a: any, b: any) => b.stats.averageRating - a.stats.averageRating)
      .slice(0, limit);
  } catch (error) {
    console.error("[RatingService] Failed to get top rated drivers:", error);
    throw error;
  }
}
