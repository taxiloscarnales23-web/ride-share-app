import { getDb } from "../db";
import {
  rides,
  riders,
  drivers,
  payments,
  driverRatings,
  disputes,
  analyticsEvents,
} from "../../drizzle/schema";
import { eq, gte, lte, and, desc } from "drizzle-orm";

/**
 * Analytics Dashboard Service
 * Provides comprehensive analytics and insights for admin dashboard
 */

export interface DashboardMetrics {
  totalRides: number;
  totalRevenue: string;
  totalUsers: number;
  activeDrivers: number;
  averageRating: number;
  completionRate: number;
}

export interface RideAnalytics {
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  averageRideDistance: number;
  averageRideDuration: number;
  peakHours: { hour: number; count: number }[];
  byStatus: Record<string, number>;
}

export interface DriverAnalytics {
  totalDrivers: number;
  activeDrivers: number;
  averageRating: number;
  topDrivers: any[];
  bottomDrivers: any[];
  earningsDistribution: {
    range: string;
    count: number;
  }[];
}

export interface RiderAnalytics {
  totalRiders: number;
  activeRiders: number;
  averageRating: number;
  topRiders: any[];
  rideFrequency: {
    range: string;
    count: number;
  }[];
}

export interface RevenueAnalytics {
  totalRevenue: string;
  byPaymentMethod: Record<string, string>;
  byStatus: Record<string, string>;
  dailyRevenue: { date: string; amount: string }[];
  weeklyRevenue: { week: number; amount: string }[];
  monthlyRevenue: { month: number; amount: string }[];
}

export interface DisputeAnalytics {
  totalDisputes: number;
  openDisputes: number;
  resolvedDisputes: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  resolutionRate: number;
  averageResolutionTime: number;
}

/**
 * Get main dashboard metrics
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allRides = await db.select().from(rides);
    const allRiders = await db.select().from(riders);
    const allDrivers = await db.select().from(drivers);
    const allPayments = await db.select().from(payments);
    const allRatings = await db.select().from(driverRatings);

    const totalRevenue = allPayments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);

    const completedRides = allRides.filter((r) => r.status === "completed").length;
    const completionRate =
      allRides.length > 0 ? Math.round((completedRides / allRides.length) * 100) : 0;

    const averageRating =
      allRatings.length > 0
        ? Math.round(
            (allRatings.reduce((sum, r) => sum + r.overallRating, 0) / allRatings.length) * 10
          ) / 10
        : 0;

    const activeDrivers = allDrivers.filter((d) => d.isOnline).length;

    return {
      totalRides: allRides.length,
      totalRevenue: totalRevenue.toFixed(2),
      totalUsers: allRiders.length + allDrivers.length,
      activeDrivers,
      averageRating,
      completionRate,
    };
  } catch (error) {
    console.error("[AnalyticsService] Failed to get dashboard metrics:", error);
    throw error;
  }
}

/**
 * Get detailed ride analytics
 */
export async function getRideAnalytics(): Promise<RideAnalytics> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allRides = await db.select().from(rides);

    const completedRides = allRides.filter((r) => r.status === "completed");
    const cancelledRides = allRides.filter((r) => r.status === "cancelled");

    const totalDistance = completedRides.reduce(
      (sum, r) => sum + (typeof r.estimatedDistance === "number" ? r.estimatedDistance : 0),
      0
    );
    const averageRideDistance =
      completedRides.length > 0 ? Math.round((totalDistance / completedRides.length) * 10) / 10 : 0;

    const totalDuration = completedRides.reduce(
      (sum, r) => sum + (typeof r.estimatedDuration === "number" ? r.estimatedDuration : 0),
      0
    );
    const averageRideDuration =
      completedRides.length > 0 ? Math.round(totalDuration / completedRides.length) : 0;

    // Calculate peak hours
    const peakHours: { hour: number; count: number }[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const count = allRides.filter((r) => {
        const rideHour = new Date(r.createdAt).getHours();
        return rideHour === hour;
      }).length;
      if (count > 0) {
        peakHours.push({ hour, count });
      }
    }

    // Count by status
    const byStatus: Record<string, number> = {};
    for (const ride of allRides) {
      const status = ride.status || "unknown";
      byStatus[status] = (byStatus[status] || 0) + 1;
    }

    return {
      totalRides: allRides.length,
      completedRides: completedRides.length,
      cancelledRides: cancelledRides.length,
      averageRideDistance,
      averageRideDuration,
      peakHours: peakHours.sort((a, b) => b.count - a.count).slice(0, 5),
      byStatus,
    };
  } catch (error) {
    console.error("[AnalyticsService] Failed to get ride analytics:", error);
    throw error;
  }
}

/**
 * Get driver analytics
 */
export async function getDriverAnalytics(): Promise<DriverAnalytics> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allDrivers = await db.select().from(drivers);
    const allRatings = await db.select().from(driverRatings);

    const activeDrivers = allDrivers.filter((d) => d.isOnline).length;

    const averageRating =
      allRatings.length > 0
        ? Math.round(
            (allRatings.reduce((sum, r) => sum + r.overallRating, 0) / allRatings.length) * 10
          ) / 10
        : 0;

    // Get top drivers by rating
    const driverRatingMap: Record<number, { count: number; total: number }> = {};
    for (const rating of allRatings) {
      if (!driverRatingMap[rating.driverId]) {
        driverRatingMap[rating.driverId] = { count: 0, total: 0 };
      }
      driverRatingMap[rating.driverId].count++;
      driverRatingMap[rating.driverId].total += rating.overallRating;
    }

    const topDrivers = allDrivers
      .map((d) => {
        const stats = driverRatingMap[d.id];
        return {
          id: d.id,
          rating: stats ? stats.total / stats.count : 0,
          rides: stats ? stats.count : 0,
        };
      })
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);

    const bottomDrivers = allDrivers
      .map((d) => {
        const stats = driverRatingMap[d.id];
        return {
          id: d.id,
          rating: stats ? stats.total / stats.count : 0,
          rides: stats ? stats.count : 0,
        };
      })
      .sort((a, b) => a.rating - b.rating)
      .slice(0, 10);

    return {
      totalDrivers: allDrivers.length,
      activeDrivers,
      averageRating,
      topDrivers,
      bottomDrivers,
      earningsDistribution: [], // Would need payment data
    };
  } catch (error) {
    console.error("[AnalyticsService] Failed to get driver analytics:", error);
    throw error;
  }
}

/**
 * Get rider analytics
 */
export async function getRiderAnalytics(): Promise<RiderAnalytics> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allRiders = await db.select().from(riders);
    const allRides = await db.select().from(rides);

    // Calculate active riders (those with rides in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeRiders = new Set(
      allRides
        .filter((r) => new Date(r.createdAt) > thirtyDaysAgo)
        .map((r) => r.riderId)
    ).size;

    const averageRating =
      allRiders.length > 0
        ? Math.round(
            (allRiders.reduce((sum, r) => sum + parseFloat(r.rating || "0"), 0) / allRiders.length) *
              10
          ) / 10
        : 0;

    // Get top riders by ride count
    const rideCountMap: Record<number, number> = {};
    for (const ride of allRides) {
      rideCountMap[ride.riderId] = (rideCountMap[ride.riderId] || 0) + 1;
    }

    const topRiders = allRiders
      .map((r) => ({
        id: r.id,
        rideCount: rideCountMap[r.id] || 0,
        rating: parseFloat(r.rating || "0"),
      }))
      .sort((a, b) => b.rideCount - a.rideCount)
      .slice(0, 10);

    return {
      totalRiders: allRiders.length,
      activeRiders,
      averageRating,
      topRiders,
      rideFrequency: [], // Would need more detailed analysis
    };
  } catch (error) {
    console.error("[AnalyticsService] Failed to get rider analytics:", error);
    throw error;
  }
}

/**
 * Get revenue analytics
 */
export async function getRevenueAnalytics(): Promise<RevenueAnalytics> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allPayments = await db.select().from(payments);
    const completedPayments = allPayments.filter((p) => p.status === "completed");

    const totalRevenue = completedPayments.reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);

    // By payment method
    const byPaymentMethod: Record<string, number> = {};
    for (const payment of completedPayments) {
      const method = payment.paymentMethod || "unknown";
      byPaymentMethod[method] = (byPaymentMethod[method] || 0) + parseFloat(payment.amount || "0");
    }

    // By status
    const byStatusNum: Record<string, number> = {};
    for (const payment of allPayments) {
      const status = payment.status || "unknown";
      byStatusNum[status] = (byStatusNum[status] || 0) + parseFloat(payment.amount || "0");
    }
    const byStatus: Record<string, string> = {};
    for (const [key, value] of Object.entries(byStatusNum)) {
      byStatus[key] = value.toFixed(2);
    }

    // Convert to strings with 2 decimals
    const byPaymentMethodStr: Record<string, string> = {};
    for (const [key, value] of Object.entries(byPaymentMethod)) {
      byPaymentMethodStr[key] = (typeof value === "number" ? value : parseFloat(value)).toFixed(2);
    }

    const byStatusStr: Record<string, string> = {};
    for (const [key, value] of Object.entries(byStatus)) {
      byStatusStr[key] = value;
    }

    return {
      totalRevenue: totalRevenue.toFixed(2),
      byPaymentMethod: byPaymentMethodStr,
      byStatus: byStatusStr,
      dailyRevenue: [],
      weeklyRevenue: [],
      monthlyRevenue: [],
    };
  } catch (error) {
    console.error("[AnalyticsService] Failed to get revenue analytics:", error);
    throw error;
  }
}

/**
 * Get dispute analytics
 */
export async function getDisputeAnalytics(): Promise<DisputeAnalytics> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allDisputes = await db.select().from(disputes);

    const openDisputes = allDisputes.filter((d) => d.status === "open").length;
    const resolvedDisputes = allDisputes.filter((d) => d.status === "resolved").length;

    // By type
    const byType: Record<string, number> = {};
    for (const dispute of allDisputes) {
      const issueType = dispute.issueType || "unknown";
      byType[issueType] = (byType[issueType] || 0) + 1;
    }

    // By severity
    const bySeverity: Record<string, number> = {};
    for (const dispute of allDisputes) {
      bySeverity[dispute.severity || "medium"] = (bySeverity[dispute.severity || "medium"] || 0) + 1;
    }

    const resolutionRate =
      allDisputes.length > 0 ? Math.round((resolvedDisputes / allDisputes.length) * 100) : 0;

    return {
      totalDisputes: allDisputes.length,
      openDisputes,
      resolvedDisputes,
      byType,
      bySeverity,
      resolutionRate,
      averageResolutionTime: 0, // Would need timestamp analysis
    };
  } catch (error) {
    console.error("[AnalyticsService] Failed to get dispute analytics:", error);
    throw error;
  }
}

/**
 * Track an analytics event
 */
export async function trackEvent(userId: number | undefined, eventType: string, eventData?: any) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.insert(analyticsEvents).values({
      userId: userId || undefined,
      eventType,
      eventData: eventData ? JSON.stringify(eventData) : undefined,
    });

    return { success: true };
  } catch (error) {
    console.error("[AnalyticsService] Failed to track event:", error);
    throw error;
  }
}

/**
 * Get event analytics
 */
export async function getEventAnalytics(eventType?: string) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allEvents = await db.select().from(analyticsEvents);

    const filtered = eventType ? allEvents.filter((e) => e.eventType === eventType) : allEvents;

    const eventCounts: Record<string, number> = {};
    for (const event of filtered) {
      eventCounts[event.eventType] = (eventCounts[event.eventType] || 0) + 1;
    }

    return {
      totalEvents: filtered.length,
      eventCounts,
      events: filtered.slice(0, 100), // Return last 100
    };
  } catch (error) {
    console.error("[AnalyticsService] Failed to get event analytics:", error);
    throw error;
  }
}

/**
 * Get comprehensive analytics report
 */
export async function getComprehensiveReport() {
  try {
    const [dashboard, rides, drivers, riders, revenue, disputes] = await Promise.all([
      getDashboardMetrics(),
      getRideAnalytics(),
      getDriverAnalytics(),
      getRiderAnalytics(),
      getRevenueAnalytics(),
      getDisputeAnalytics(),
    ]);

    return {
      generatedAt: new Date(),
      dashboard,
      rides,
      drivers,
      riders,
      revenue,
      disputes,
    };
  } catch (error) {
    console.error("[AnalyticsService] Failed to get comprehensive report:", error);
    throw error;
  }
}
