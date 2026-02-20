import { rides } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getDb } from "../db";

/**
 * Payment Service
 * Handles fare calculation, payment processing, and receipt generation
 */

/**
 * Calculate ride fare based on distance and time
 */
export async function calculateFare(
  distanceKm: number,
  durationMinutes: number,
  rideType: "economy" | "premium" = "economy"
): Promise<{
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeMultiplier: number;
  totalFare: number;
}> {
  try {
    // Base fare
    const baseFare = rideType === "premium" ? 5.0 : 2.5;

    // Distance fare: $1.50 per km for economy, $2.00 for premium
    const distanceRate = rideType === "premium" ? 2.0 : 1.5;
    const distanceFare = distanceKm * distanceRate;

    // Time fare: $0.35 per minute for economy, $0.50 for premium
    const timeRate = rideType === "premium" ? 0.5 : 0.35;
    const timeFare = durationMinutes * timeRate;

    // Surge multiplier (1.0 = no surge, 1.5 = 50% surge)
    const surgeMultiplier = 1.0; // In production, calculate based on demand

    // Calculate total
    const subtotal = baseFare + distanceFare + timeFare;
    const totalFare = Math.round((subtotal * surgeMultiplier) * 100) / 100;

    return {
      baseFare,
      distanceFare: Math.round(distanceFare * 100) / 100,
      timeFare: Math.round(timeFare * 100) / 100,
      surgeMultiplier,
      totalFare,
    };
  } catch (error) {
    console.error("[Payment] Failed to calculate fare:", error);
    throw error;
  }
}

/**
 * Process payment for a ride
 */
export async function processPayment(
  rideId: number,
  amount: number,
  paymentMethod: "cash" | "card" | "wallet" = "cash",
  tip?: number
): Promise<{
  transactionId: string;
  amount: number;
  tip: number;
  total: number;
  status: "completed" | "pending" | "failed";
  timestamp: Date;
}> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get ride details
    const rideResult = await db.select().from(rides).where(eq(rides.id, rideId));
    if (rideResult.length === 0) {
      throw new Error("Ride not found");
    }

    const ride = rideResult[0];
    const tipAmount = tip || 0;
    const totalAmount = amount + tipAmount;

    // Generate transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create transaction record (in production, store in transactions table)
    const now = new Date();
    // Mock: Would insert into transactions table
    // await db.insert(transactions).values({ ... });

    // Update ride payment status
    await db
      .update(rides)
      .set({
        paymentStatus: "completed",
        actualFare: amount.toString(),
      })
      .where(eq(rides.id, rideId));

    console.log(`[Payment] Processed payment for ride ${rideId}: ${totalAmount}`);

    return {
      transactionId,
      amount,
      tip: tipAmount,
      total: totalAmount,
      status: "completed",
      timestamp: now,
    };
  } catch (error) {
    console.error("[Payment] Failed to process payment:", error);
    throw error;
  }
}

/**
 * Generate receipt for a ride
 */
export async function generateReceipt(
  rideId: number
): Promise<{
  receiptId: string;
  rideId: number;
  driverName: string;
  pickupAddress: string;
  dropoffAddress: string;
  distance: string;
  duration: string;
  fare: number;
  tip: number;
  total: number;
  paymentMethod: string;
  timestamp: Date;
  receiptUrl?: string;
}> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get ride and transaction details
    const rideResult = await db.select().from(rides).where(eq(rides.id, rideId));
    if (rideResult.length === 0) {
      throw new Error("Ride not found");
    }

    const ride = rideResult[0];

    // Get transaction (in production, fetch from transactions table)
    const transaction = {
      amount: ride.actualFare || "0",
      tip: "0",
      total: ride.actualFare || "0",
      paymentMethod: "cash",
    };

    // Generate receipt ID
    const receiptId = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const receipt = {
      receiptId,
      rideId,
      driverName: "Driver Name", // Would come from driver profile
      pickupAddress: ride.pickupAddress || "",
      dropoffAddress: ride.dropoffAddress || "",
      distance: "2.3 km",
      duration: "12 minutes",
      fare: parseFloat(transaction?.amount || "0"),
      tip: parseFloat(transaction?.tip || "0"),
      total: parseFloat(transaction?.total || "0"),
      paymentMethod: (transaction?.paymentMethod as string) || "cash",
      timestamp: ride.completedAt || new Date(),
    }

    console.log(`[Payment] Generated receipt ${receiptId} for ride ${rideId}`);

    return receipt;
  } catch (error) {
    console.error("[Payment] Failed to generate receipt:", error);
    throw error;
  }
}

/**
 * Get transaction history for a rider
 */
export async function getTransactionHistory(
  riderId: number,
  limit: number = 10
): Promise<
  Array<{
    transactionId: string;
    rideId: number;
    amount: number;
    tip: number;
    total: number;
    paymentMethod: string;
    status: string;
    timestamp: Date;
  }>
> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get rides for this rider (in production, join with transactions table)
    const results = await db
      .select()
      .from(rides)
      .where(eq(rides.riderId, riderId))
      .limit(limit);

    return results.map((r) => ({
      transactionId: `TXN-${r.id}`,
      rideId: r.id,
      amount: parseFloat(r.actualFare || "0"),
      tip: 0,
      total: parseFloat(r.actualFare || "0"),
      paymentMethod: "cash",
      status: "completed",
      timestamp: r.completedAt || new Date(),
    }));
  } catch (error) {
    console.error("[Payment] Failed to get transaction history:", error);
    throw error;
  }
}

/**
 * Refund a payment
 */
export async function refundPayment(
  transactionId: string,
  reason: string
): Promise<{
  refundId: string;
  originalTransactionId: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  reason: string;
  timestamp: Date;
}> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Find original transaction (in production, fetch from transactions table)
    // Mock: Assume transaction exists
    const originalTxn = {
      total: "100.00",
    };
    const refundId = `RFD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Update transaction status (in production, update transactions table)
    // await db.update(transactions).set({ status: "refunded" }).where(...);

    console.log(`[Payment] Refunded transaction ${transactionId}: ${refundId}`);

    return {
      refundId,
      originalTransactionId: transactionId,
      amount: parseFloat(originalTxn.total),
      status: "completed",
      reason,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("[Payment] Failed to refund payment:", error);
    throw error;
  }
}

/**
 * Calculate driver earnings for a ride
 */
export async function calculateDriverEarnings(
  rideId: number
): Promise<{
  grossFare: number;
  platformFee: number;
  driverEarnings: number;
}> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const rideResult = await db.select().from(rides).where(eq(rides.id, rideId));
    if (rideResult.length === 0) {
      throw new Error("Ride not found");
    }

    const ride = rideResult[0];
    const grossFare = parseFloat(ride.actualFare || "0");

    // Platform takes 20% commission
    const platformFee = Math.round((grossFare * 0.2) * 100) / 100;
    const driverEarnings = Math.round((grossFare - platformFee) * 100) / 100;

    return {
      grossFare,
      platformFee,
      driverEarnings,
    };
  } catch (error) {
    console.error("[Payment] Failed to calculate driver earnings:", error);
    throw error;
  }
}
