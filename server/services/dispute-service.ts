import { getDb } from "../db";
import {
  disputes,
  disputeEvidence,
  disputeResolutions,
  rides,
  riders,
  drivers,
  payments,
} from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Dispute Resolution Service
 * Handles dispute creation, evidence management, and resolution
 */

export interface CreateDisputeInput {
  rideId: number;
  riderId: number;
  driverId: number;
  issueType: "wrong_fare" | "unsafe_behavior" | "lost_item" | "vehicle_issue" | "other";
  title: string;
  description: string;
  severity?: "low" | "medium" | "high";
}

export interface AddEvidenceInput {
  disputeId: number;
  evidenceType: "photo" | "video" | "audio" | "document";
  fileUrl: string;
}

export interface ResolveDisputeInput {
  disputeId: number;
  resolutionType: "refund" | "credit" | "compensation" | "no_action";
  amount?: string;
  reason?: string;
  resolvedBy?: number;
}

export interface DisputeDetail {
  dispute: any;
  evidence: any[];
  resolution?: any;
  rideDetails?: any;
  riderInfo?: any;
  driverInfo?: any;
}

/**
 * Create a new dispute
 */
export async function createDispute(input: CreateDisputeInput) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Validate inputs
    if (!input.title || input.title.trim().length === 0) {
      throw new Error("Dispute title is required");
    }

    if (!input.description || input.description.trim().length === 0) {
      throw new Error("Dispute description is required");
    }

    // Create the dispute
    const result = await db.insert(disputes).values({
      rideId: input.rideId,
      riderId: input.riderId,
      driverId: input.driverId,
      issueType: input.issueType,
      title: input.title,
      description: input.description,
      severity: input.severity || "medium",
      status: "open",
    });

    return {
      success: true,
      disputeId: result[0].insertId,
    };
  } catch (error) {
    console.error("[DisputeService] Failed to create dispute:", error);
    throw error;
  }
}

/**
 * Add evidence to a dispute
 */
export async function addDisputeEvidence(input: AddEvidenceInput) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Validate dispute exists
    const disputeData = await db
      .select()
      .from(disputes)
      .where(eq(disputes.id, input.disputeId));

    if (!disputeData.length) {
      throw new Error("Dispute not found");
    }

    // Add evidence
    const result = await db.insert(disputeEvidence).values({
      disputeId: input.disputeId,
      evidenceType: input.evidenceType,
      fileUrl: input.fileUrl,
    });

    return {
      success: true,
      evidenceId: result[0].insertId,
    };
  } catch (error) {
    console.error("[DisputeService] Failed to add evidence:", error);
    throw error;
  }
}

/**
 * Get dispute details with all related information
 */
export async function getDisputeDetail(disputeId: number): Promise<DisputeDetail | null> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get dispute
    const disputeData = await db
      .select()
      .from(disputes)
      .where(eq(disputes.id, disputeId));

    if (!disputeData.length) {
      return null;
    }

    const dispute = disputeData[0];

    // Get evidence
    const evidence = await db
      .select()
      .from(disputeEvidence)
      .where(eq(disputeEvidence.disputeId, disputeId));

    // Get resolution if exists
    const resolutionData = await db
      .select()
      .from(disputeResolutions)
      .where(eq(disputeResolutions.disputeId, disputeId));

    const resolution = resolutionData.length ? resolutionData[0] : null;

    // Get ride details
    const rideData = await db.select().from(rides).where(eq(rides.id, dispute.rideId));
    const rideDetails = rideData.length ? rideData[0] : null;

    // Get rider info
    const riderData = await db
      .select()
      .from(riders)
      .where(eq(riders.id, dispute.riderId));
    const riderInfo = riderData.length ? riderData[0] : null;

    // Get driver info
    const driverData = await db
      .select()
      .from(drivers)
      .where(eq(drivers.id, dispute.driverId));
    const driverInfo = driverData.length ? driverData[0] : null;

    return {
      dispute,
      evidence,
      resolution,
      rideDetails,
      riderInfo,
      driverInfo,
    };
  } catch (error) {
    console.error("[DisputeService] Failed to get dispute detail:", error);
    throw error;
  }
}

/**
 * Resolve a dispute with compensation
 */
export async function resolveDispute(input: ResolveDisputeInput) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get dispute
    const disputeData = await db
      .select()
      .from(disputes)
      .where(eq(disputes.id, input.disputeId));

    if (!disputeData.length) {
      throw new Error("Dispute not found");
    }

    const dispute = disputeData[0];

    // Create resolution
    const result = await db.insert(disputeResolutions).values({
      disputeId: input.disputeId,
      resolutionType: input.resolutionType,
      amount: input.amount,
      reason: input.reason,
      resolvedBy: input.resolvedBy,
    });

    // Update dispute status
    await db
      .update(disputes)
      .set({
        status: "resolved",
        resolvedAt: new Date(),
      })
      .where(eq(disputes.id, input.disputeId));

    // Handle compensation if applicable
    if (input.resolutionType === "refund" || input.resolutionType === "compensation") {
      // In a real system, this would trigger a refund/payment
      // For now, we just log it
      console.log(
        `[DisputeService] ${input.resolutionType} of ${input.amount} for dispute ${input.disputeId}`
      );
    }

    return {
      success: true,
      resolutionId: result[0].insertId,
    };
  } catch (error) {
    console.error("[DisputeService] Failed to resolve dispute:", error);
    throw error;
  }
}

/**
 * Get all disputes for a rider
 */
export async function getRiderDisputes(riderId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const riderDisputes = await db
      .select()
      .from(disputes)
      .where(eq(disputes.riderId, riderId))
      .orderBy(desc(disputes.createdAt));

    return riderDisputes;
  } catch (error) {
    console.error("[DisputeService] Failed to get rider disputes:", error);
    throw error;
  }
}

/**
 * Get all disputes for a driver
 */
export async function getDriverDisputes(driverId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const driverDisputes = await db
      .select()
      .from(disputes)
      .where(eq(disputes.driverId, driverId))
      .orderBy(desc(disputes.createdAt));

    return driverDisputes;
  } catch (error) {
    console.error("[DisputeService] Failed to get driver disputes:", error);
    throw error;
  }
}

/**
 * Get all open disputes (for admin)
 */
export async function getOpenDisputes() {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const openDisputes = await db
      .select()
      .from(disputes)
      .where(eq(disputes.status, "open"))
      .orderBy(desc(disputes.createdAt));

    return openDisputes;
  } catch (error) {
    console.error("[DisputeService] Failed to get open disputes:", error);
    throw error;
  }
}

/**
 * Update dispute status
 */
export async function updateDisputeStatus(
  disputeId: number,
  status: "open" | "in_review" | "resolved" | "closed"
) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(disputes)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(disputes.id, disputeId));

    return { success: true };
  } catch (error) {
    console.error("[DisputeService] Failed to update dispute status:", error);
    throw error;
  }
}

/**
 * Get dispute statistics
 */
export async function getDisputeStats() {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allDisputes = await db.select().from(disputes);

    const stats = {
      total: allDisputes.length,
      open: allDisputes.filter((d: any) => d.status === "open").length,
      inReview: allDisputes.filter((d: any) => d.status === "in_review").length,
      resolved: allDisputes.filter((d: any) => d.status === "resolved").length,
      closed: allDisputes.filter((d: any) => d.status === "closed").length,
      byType: {
        wrongFare: allDisputes.filter((d: any) => d.issueType === "wrong_fare").length,
        unsafeBehavior: allDisputes.filter((d: any) => d.issueType === "unsafe_behavior").length,
        lostItem: allDisputes.filter((d: any) => d.issueType === "lost_item").length,
        vehicleIssue: allDisputes.filter((d: any) => d.issueType === "vehicle_issue").length,
        other: allDisputes.filter((d: any) => d.issueType === "other").length,
      },
      bySeverity: {
        low: allDisputes.filter((d: any) => d.severity === "low").length,
        medium: allDisputes.filter((d: any) => d.severity === "medium").length,
        high: allDisputes.filter((d: any) => d.severity === "high").length,
      },
    };

    return stats;
  } catch (error) {
    console.error("[DisputeService] Failed to get dispute stats:", error);
    throw error;
  }
}
