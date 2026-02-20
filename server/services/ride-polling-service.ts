import { rides } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { getDb } from "../db";

/**
 * Ride Polling Service
 * Handles real-time ride status updates and polling
 */

// In-memory polling subscriptions
const pollSubscriptions = new Map<
  string,
  {
    rideId: number;
    userId: number;
    userRole: "rider" | "driver";
    callback: (status: any) => void;
    interval: ReturnType<typeof setInterval>;
  }
>();

const POLL_INTERVAL_MS = 2000; // Poll every 2 seconds

/**
 * Get current ride status
 */
export async function getRideStatus(rideId: number): Promise<any> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db.select().from(rides).where(eq(rides.id, rideId));

    if (result.length === 0) {
      throw new Error("Ride not found");
    }

    const ride = result[0];

    return {
      id: ride.id,
      status: ride.status,
      driverId: ride.driverId,
      riderId: ride.riderId,
      pickupAddress: ride.pickupAddress,
      dropoffAddress: ride.dropoffAddress,
      estimatedFare: ride.estimatedFare,
      actualFare: ride.actualFare,
      requestedAt: ride.requestedAt,
      acceptedAt: ride.acceptedAt,
      startedAt: ride.startedAt,
      completedAt: ride.completedAt,
      paymentStatus: ride.paymentStatus,
    };
  } catch (error) {
    console.error("[RidePolling] Failed to get ride status:", error);
    throw error;
  }
}

/**
 * Subscribe to ride status updates
 */
export function subscribeToRideUpdates(
  subscriptionId: string,
  rideId: number,
  userId: number,
  userRole: "rider" | "driver",
  callback: (status: any) => void
): void {
  try {
    // Clear existing subscription if any
    if (pollSubscriptions.has(subscriptionId)) {
      unsubscribeFromRideUpdates(subscriptionId);
    }

    // Start polling
    const interval = setInterval(async () => {
      try {
        const status = await getRideStatus(rideId);
        callback(status);
      } catch (error) {
        console.error("[RidePolling] Error polling ride status:", error);
      }
    }, POLL_INTERVAL_MS);

    // Store subscription
    pollSubscriptions.set(subscriptionId, {
      rideId,
      userId,
      userRole,
      callback,
      interval,
    });

    console.log(`[RidePolling] Subscribed to ride ${rideId} for user ${userId}`);
  } catch (error) {
    console.error("[RidePolling] Failed to subscribe:", error);
    throw error;
  }
}

/**
 * Unsubscribe from ride status updates
 */
export function unsubscribeFromRideUpdates(subscriptionId: string): void {
  try {
    const subscription = pollSubscriptions.get(subscriptionId);

    if (!subscription) {
      console.warn(`[RidePolling] Subscription ${subscriptionId} not found`);
      return;
    }

    // Clear interval
    clearInterval(subscription.interval);

    // Remove subscription
    pollSubscriptions.delete(subscriptionId);

    console.log(`[RidePolling] Unsubscribed from ride ${subscription.rideId}`);
  } catch (error) {
    console.error("[RidePolling] Failed to unsubscribe:", error);
    throw error;
  }
}

/**
 * Update ride status
 */
export async function updateRideStatus(
  rideId: number,
  newStatus: "requested" | "accepted" | "in_progress" | "completed" | "cancelled"
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const updateData: any = { status: newStatus };

    // Set timestamps based on status
    if (newStatus === "accepted") {
      updateData.acceptedAt = new Date();
    } else if (newStatus === "in_progress") {
      updateData.startedAt = new Date();
    } else if (newStatus === "completed") {
      updateData.completedAt = new Date();
      updateData.paymentStatus = "completed";
    } else if (newStatus === "cancelled") {
      updateData.cancelledAt = new Date();
    }

    await db.update(rides).set(updateData).where(eq(rides.id, rideId));

    console.log(`[RidePolling] Updated ride ${rideId} status to ${newStatus}`);
  } catch (error) {
    console.error("[RidePolling] Failed to update ride status:", error);
    throw error;
  }
}

/**
 * Get all active subscriptions
 */
export function getActiveSubscriptions(): Array<{
  subscriptionId: string;
  rideId: number;
  userId: number;
  userRole: "rider" | "driver";
}> {
  const subscriptions: Array<{
    subscriptionId: string;
    rideId: number;
    userId: number;
    userRole: "rider" | "driver";
  }> = [];

  pollSubscriptions.forEach((subscription, subscriptionId) => {
    subscriptions.push({
      subscriptionId,
      rideId: subscription.rideId,
      userId: subscription.userId,
      userRole: subscription.userRole,
    });
  });

  return subscriptions;
}

/**
 * Get subscription count
 */
export function getSubscriptionCount(): number {
  return pollSubscriptions.size;
}

/**
 * Clear all subscriptions (for cleanup)
 */
export function clearAllSubscriptions(): void {
  try {
    pollSubscriptions.forEach((subscription) => {
      clearInterval(subscription.interval);
    });

    pollSubscriptions.clear();

    console.log("[RidePolling] Cleared all subscriptions");
  } catch (error) {
    console.error("[RidePolling] Failed to clear subscriptions:", error);
    throw error;
  }
}

/**
 * Get ride location updates (mock for now)
 */
export async function getRideLocationUpdates(rideId: number): Promise<{
  driverLatitude?: string;
  driverLongitude?: string;
  pickupLatitude: string;
  pickupLongitude: string;
  dropoffLatitude: string;
  dropoffLongitude: string;
}> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db.select().from(rides).where(eq(rides.id, rideId));

    if (result.length === 0) {
      throw new Error("Ride not found");
    }

    const ride = result[0];

    return {
      driverLatitude: undefined, // Would come from driver location service
      driverLongitude: undefined,
      pickupLatitude: ride.pickupLatitude,
      pickupLongitude: ride.pickupLongitude,
      dropoffLatitude: ride.dropoffLatitude,
      dropoffLongitude: ride.dropoffLongitude,
    };
  } catch (error) {
    console.error("[RidePolling] Failed to get location updates:", error);
    throw error;
  }
}
