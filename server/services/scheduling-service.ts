/**
 * Scheduling Service
 * Handles ride scheduling, advance booking, and recurring rides
 */

export interface ScheduledRide {
  id: number;
  riderId: number;
  pickupAddress: string;
  dropoffAddress: string;
  scheduledTime: Date;
  rideType: "economy" | "premium";
  estimatedFare: number;
  priceGuarantee: boolean;
  guaranteedPrice?: number;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  createdAt: Date;
}

export interface RecurringRide {
  id: number;
  riderId: number;
  pickupAddress: string;
  dropoffAddress: string;
  scheduledTime: string; // HH:mm format
  daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
  rideType: "economy" | "premium";
  priceGuarantee: boolean;
  guaranteedPrice?: number;
  status: "active" | "paused" | "cancelled";
  createdAt: Date;
}

export interface PriceGuarantee {
  id: number;
  rideId: number;
  guaranteedPrice: number;
  expiryTime: Date;
  status: "active" | "expired" | "used";
}

// In-memory storage for scheduled rides (in production, use database)
const scheduledRides = new Map<number, ScheduledRide>();
const recurringRides = new Map<number, RecurringRide>();
const priceGuarantees = new Map<number, PriceGuarantee>();

/**
 * Schedule a ride for future time
 */
export async function scheduleRide(
  riderId: number,
  pickupAddress: string,
  dropoffAddress: string,
  scheduledTime: Date,
  rideType: "economy" | "premium" = "economy",
  priceGuarantee: boolean = false
): Promise<ScheduledRide> {
  try {
    const rideId = Math.floor(Math.random() * 1000000);

    // Calculate estimated fare
    const estimatedFare = rideType === "premium" ? 15.5 : 12.5;

    const ride: ScheduledRide = {
      id: rideId,
      riderId,
      pickupAddress,
      dropoffAddress,
      scheduledTime,
      rideType,
      estimatedFare,
      priceGuarantee,
      guaranteedPrice: priceGuarantee ? estimatedFare : undefined,
      status: "scheduled",
      createdAt: new Date(),
    };

    scheduledRides.set(rideId, ride);

    // Create price guarantee if requested
    if (priceGuarantee) {
      const guarantee: PriceGuarantee = {
        id: Math.floor(Math.random() * 1000000),
        rideId,
        guaranteedPrice: estimatedFare,
        expiryTime: new Date(scheduledTime.getTime() - 30 * 60 * 1000), // 30 mins before ride
        status: "active",
      };
      priceGuarantees.set(guarantee.id, guarantee);
    }

    console.log(
      `[Scheduling] Scheduled ride ${rideId} for ${scheduledTime.toISOString()}`
    );

    return ride;
  } catch (error) {
    console.error("[Scheduling] Failed to schedule ride:", error);
    throw error;
  }
}

/**
 * Get scheduled rides for a rider
 */
export async function getScheduledRides(
  riderId: number,
  includeCompleted: boolean = false
): Promise<ScheduledRide[]> {
  try {
    const rides = Array.from(scheduledRides.values()).filter(
      (ride) => ride.riderId === riderId
    );

    if (!includeCompleted) {
      return rides.filter((ride) => ride.status !== "completed");
    }

    return rides;
  } catch (error) {
    console.error("[Scheduling] Failed to get scheduled rides:", error);
    throw error;
  }
}

/**
 * Cancel scheduled ride
 */
export async function cancelScheduledRide(
  rideId: number,
  reason: string
): Promise<{
  rideId: number;
  status: "cancelled";
  refundAmount: number;
  reason: string;
  timestamp: Date;
}> {
  try {
    const ride = scheduledRides.get(rideId);
    if (!ride) {
      throw new Error("Scheduled ride not found");
    }

    const refundAmount =
      ride.status === "scheduled" ? ride.estimatedFare : 0;

    ride.status = "cancelled";
    scheduledRides.set(rideId, ride);

    console.log(
      `[Scheduling] Cancelled scheduled ride ${rideId}: ${reason}`
    );

    return {
      rideId,
      status: "cancelled",
      refundAmount,
      reason,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("[Scheduling] Failed to cancel scheduled ride:", error);
    throw error;
  }
}

/**
 * Create recurring ride
 */
export async function createRecurringRide(
  riderId: number,
  pickupAddress: string,
  dropoffAddress: string,
  scheduledTime: string, // HH:mm format
  daysOfWeek: number[], // 0-6 (Sunday-Saturday)
  rideType: "economy" | "premium" = "economy",
  priceGuarantee: boolean = false
): Promise<RecurringRide> {
  try {
    const recurringId = Math.floor(Math.random() * 1000000);

    // Calculate estimated fare
    const estimatedFare = rideType === "premium" ? 15.5 : 12.5;

    const recurring: RecurringRide = {
      id: recurringId,
      riderId,
      pickupAddress,
      dropoffAddress,
      scheduledTime,
      daysOfWeek,
      rideType,
      priceGuarantee,
      guaranteedPrice: priceGuarantee ? estimatedFare : undefined,
      status: "active",
      createdAt: new Date(),
    };

    recurringRides.set(recurringId, recurring);

    console.log(
      `[Scheduling] Created recurring ride ${recurringId} for ${daysOfWeek.length} days/week`
    );

    return recurring;
  } catch (error) {
    console.error("[Scheduling] Failed to create recurring ride:", error);
    throw error;
  }
}

/**
 * Get recurring rides for a rider
 */
export async function getRecurringRides(riderId: number): Promise<RecurringRide[]> {
  try {
    return Array.from(recurringRides.values()).filter(
      (ride) => ride.riderId === riderId
    );
  } catch (error) {
    console.error("[Scheduling] Failed to get recurring rides:", error);
    throw error;
  }
}

/**
 * Pause recurring ride
 */
export async function pauseRecurringRide(
  recurringId: number
): Promise<{
  recurringId: number;
  status: "paused";
  timestamp: Date;
}> {
  try {
    const recurring = recurringRides.get(recurringId);
    if (!recurring) {
      throw new Error("Recurring ride not found");
    }

    recurring.status = "paused";
    recurringRides.set(recurringId, recurring);

    console.log(`[Scheduling] Paused recurring ride ${recurringId}`);

    return {
      recurringId,
      status: "paused",
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("[Scheduling] Failed to pause recurring ride:", error);
    throw error;
  }
}

/**
 * Resume recurring ride
 */
export async function resumeRecurringRide(
  recurringId: number
): Promise<{
  recurringId: number;
  status: "active";
  timestamp: Date;
}> {
  try {
    const recurring = recurringRides.get(recurringId);
    if (!recurring) {
      throw new Error("Recurring ride not found");
    }

    recurring.status = "active";
    recurringRides.set(recurringId, recurring);

    console.log(`[Scheduling] Resumed recurring ride ${recurringId}`);

    return {
      recurringId,
      status: "active",
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("[Scheduling] Failed to resume recurring ride:", error);
    throw error;
  }
}

/**
 * Delete recurring ride
 */
export async function deleteRecurringRide(
  recurringId: number
): Promise<{
  recurringId: number;
  status: "deleted";
  timestamp: Date;
}> {
  try {
    recurringRides.delete(recurringId);

    console.log(`[Scheduling] Deleted recurring ride ${recurringId}`);

    return {
      recurringId,
      status: "deleted",
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("[Scheduling] Failed to delete recurring ride:", error);
    throw error;
  }
}

/**
 * Get price guarantee for a ride
 */
export async function getPriceGuarantee(
  rideId: number
): Promise<PriceGuarantee | null> {
  try {
    const guarantees = Array.from(priceGuarantees.values()).filter(
      (g) => g.rideId === rideId
    );

    if (guarantees.length === 0) {
      return null;
    }

    const guarantee = guarantees[0];

    // Check if expired
    if (guarantee.expiryTime < new Date()) {
      guarantee.status = "expired";
      priceGuarantees.set(guarantee.id, guarantee);
      return null;
    }

    return guarantee;
  } catch (error) {
    console.error("[Scheduling] Failed to get price guarantee:", error);
    throw error;
  }
}

/**
 * Get estimated fare for scheduled ride
 */
export async function getEstimatedFare(
  pickupAddress: string,
  dropoffAddress: string,
  rideType: "economy" | "premium" = "economy",
  scheduledTime?: Date
): Promise<{
  baseFare: number;
  estimatedFare: number;
  priceGuaranteeAvailable: boolean;
  surgeMultiplier: number;
}> {
  try {
    // Mock fare calculation
    const baseFare = rideType === "premium" ? 5.0 : 2.5;
    const distanceFare = rideType === "premium" ? 8.0 : 6.0;
    const timeFare = rideType === "premium" ? 2.5 : 2.0;

    const surgeMultiplier = scheduledTime ? 1.0 : 1.2; // No surge for scheduled rides
    const estimatedFare = Math.round(
      (baseFare + distanceFare + timeFare) * surgeMultiplier * 100
    ) / 100;

    return {
      baseFare,
      estimatedFare,
      priceGuaranteeAvailable: true,
      surgeMultiplier,
    };
  } catch (error) {
    console.error("[Scheduling] Failed to get estimated fare:", error);
    throw error;
  }
}
