import { rides } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { getDb } from "../db";

/**
 * Verification Service
 * Handles driver verification, background checks, and document management
 */

export interface VerificationDocument {
  id: number;
  driverId: number;
  documentType: "license" | "insurance" | "registration" | "background_check" | "other";
  documentUrl: string;
  expiryDate?: Date;
  status: "pending" | "approved" | "rejected" | "expired";
  uploadedAt: Date;
  verifiedAt?: Date;
  rejectionReason?: string;
}

export interface DriverVerification {
  driverId: number;
  licenseStatus: "pending" | "approved" | "rejected" | "expired";
  insuranceStatus: "pending" | "approved" | "rejected" | "expired";
  backgroundCheckStatus: "pending" | "approved" | "rejected";
  overallStatus: "unverified" | "pending" | "verified" | "rejected";
  verificationScore: number; // 0-100
  documents: VerificationDocument[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BackgroundCheckResult {
  driverId: number;
  status: "approved" | "rejected" | "pending";
  criminalRecord: boolean;
  drivingViolations: number;
  insuranceClaims: number;
  riskScore: number; // 0-100 (higher = riskier)
  checkDate: Date;
  expiryDate: Date;
}

// In-memory storage for verification records (in production, use database)
const verificationRecords = new Map<number, DriverVerification>();

/**
 * Upload driver document for verification
 */
export async function uploadDocument(
  driverId: number,
  documentType: "license" | "insurance" | "registration" | "background_check" | "other",
  documentUrl: string,
  expiryDate?: Date
): Promise<VerificationDocument> {
  try {
    const document: VerificationDocument = {
      id: Math.random(),
      driverId,
      documentType,
      documentUrl,
      expiryDate,
      status: "pending",
      uploadedAt: new Date(),
    };

    console.log(`[Verification] Uploaded ${documentType} for driver ${driverId}`);

    return document;
  } catch (error) {
    console.error("[Verification] Failed to upload document:", error);
    throw error;
  }
}

/**
 * Verify driver document
 */
export async function verifyDocument(
  documentId: number,
  approved: boolean,
  rejectionReason?: string
): Promise<VerificationDocument> {
  try {
    const document: VerificationDocument = {
      id: documentId,
      driverId: 0,
      documentType: "license",
      documentUrl: "",
      status: approved ? "approved" : "rejected",
      uploadedAt: new Date(),
      verifiedAt: new Date(),
      rejectionReason,
    };

    console.log(
      `[Verification] Document ${documentId} ${approved ? "approved" : "rejected"}`
    );

    return document;
  } catch (error) {
    console.error("[Verification] Failed to verify document:", error);
    throw error;
  }
}

/**
 * Run background check for driver
 */
export async function runBackgroundCheck(
  driverId: number,
  licenseNumber: string,
  dateOfBirth: Date
): Promise<BackgroundCheckResult> {
  try {
    // Mock background check - in production, integrate with third-party service
    const riskScore = Math.floor(Math.random() * 30); // 0-30 (low risk)
    const criminalRecord = riskScore > 20;
    const drivingViolations = Math.floor(Math.random() * 2);
    const insuranceClaims = Math.floor(Math.random() * 1);

    const result: BackgroundCheckResult = {
      driverId,
      status: riskScore < 25 ? "approved" : "rejected",
      criminalRecord,
      drivingViolations,
      insuranceClaims,
      riskScore,
      checkDate: new Date(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    };

    console.log(
      `[Verification] Background check completed for driver ${driverId}: ${result.status}`
    );

    return result;
  } catch (error) {
    console.error("[Verification] Failed to run background check:", error);
    throw error;
  }
}

/**
 * Get driver verification status
 */
export async function getDriverVerification(
  driverId: number
): Promise<DriverVerification> {
  try {
    const verification = verificationRecords.get(driverId);
    if (verification) {
      return verification;
    }

    // Create new verification record
    const newVerification: DriverVerification = {
      driverId,
      licenseStatus: "pending",
      insuranceStatus: "pending",
      backgroundCheckStatus: "pending",
      overallStatus: "unverified",
      verificationScore: 0,
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    verificationRecords.set(driverId, newVerification);
    return newVerification;
  } catch (error) {
    console.error("[Verification] Failed to get driver verification:", error);
    throw error;
  }
}

/**
 * Update driver verification status
 */
export async function updateVerificationStatus(
  driverId: number,
  licenseStatus?: string,
  insuranceStatus?: string,
  backgroundCheckStatus?: string
): Promise<DriverVerification> {
  try {
    const verification = await getDriverVerification(driverId);

    if (licenseStatus) verification.licenseStatus = licenseStatus as any;
    if (insuranceStatus) verification.insuranceStatus = insuranceStatus as any;
    if (backgroundCheckStatus)
      verification.backgroundCheckStatus = backgroundCheckStatus as any;

    // Calculate overall status
    const allApproved =
      verification.licenseStatus === "approved" &&
      verification.insuranceStatus === "approved" &&
      verification.backgroundCheckStatus === "approved";

    const anyRejected =
      verification.licenseStatus === "rejected" ||
      verification.insuranceStatus === "rejected" ||
      verification.backgroundCheckStatus === "rejected";

    if (allApproved) {
      verification.overallStatus = "verified";
      verification.verificationScore = 100;
    } else if (anyRejected) {
      verification.overallStatus = "rejected";
      verification.verificationScore = 0;
    } else if (
      verification.licenseStatus === "pending" ||
      verification.insuranceStatus === "pending" ||
      verification.backgroundCheckStatus === "pending"
    ) {
      verification.overallStatus = "pending";
      verification.verificationScore = 50;
    }

    verification.updatedAt = new Date();
    verificationRecords.set(driverId, verification);

    console.log(
      `[Verification] Updated verification status for driver ${driverId}: ${verification.overallStatus}`
    );

    return verification;
  } catch (error) {
    console.error("[Verification] Failed to update verification status:", error);
    throw error;
  }
}

/**
 * Get verification badge for driver
 */
export async function getVerificationBadge(
  driverId: number
): Promise<{
  badge: string;
  color: string;
  label: string;
  description: string;
}> {
  try {
    const verification = await getDriverVerification(driverId);

    const badges: Record<
      string,
      { badge: string; color: string; label: string; description: string }
    > = {
      verified: {
        badge: "✓",
        color: "success",
        label: "Verified",
        description: "All documents verified and background check passed",
      },
      pending: {
        badge: "⏳",
        color: "warning",
        label: "Pending",
        description: "Verification in progress",
      },
      rejected: {
        badge: "✗",
        color: "error",
        label: "Rejected",
        description: "Verification failed",
      },
      unverified: {
        badge: "?",
        color: "muted",
        label: "Unverified",
        description: "Not yet verified",
      },
    };

    return badges[verification.overallStatus] || badges.unverified;
  } catch (error) {
    console.error("[Verification] Failed to get verification badge:", error);
    throw error;
  }
}

/**
 * Check if driver is verified
 */
export async function isDriverVerified(driverId: number): Promise<boolean> {
  try {
    const verification = await getDriverVerification(driverId);
    return verification.overallStatus === "verified";
  } catch (error) {
    console.error("[Verification] Failed to check driver verification:", error);
    throw error;
  }
}

/**
 * Get verification expiry date
 */
export async function getVerificationExpiryDate(
  driverId: number
): Promise<Date | null> {
  try {
    const verification = await getDriverVerification(driverId);

    if (verification.documents.length === 0) {
      return null;
    }

    // Find the earliest expiry date
    const expiryDates = verification.documents
      .filter((doc) => doc.expiryDate)
      .map((doc) => doc.expiryDate as Date);

    if (expiryDates.length === 0) {
      return null;
    }

    return new Date(Math.min(...expiryDates.map((d) => d.getTime())));
  } catch (error) {
    console.error("[Verification] Failed to get verification expiry date:", error);
    throw error;
  }
}

/**
 * Renew driver verification
 */
export async function renewVerification(driverId: number): Promise<{
  renewalId: string;
  status: "initiated";
  expiryDate: Date;
}> {
  try {
    const renewalId = `RNW-${driverId}-${Date.now()}`;
    const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

    console.log(`[Verification] Initiated renewal for driver ${driverId}`);

    return {
      renewalId,
      status: "initiated",
      expiryDate,
    };
  } catch (error) {
    console.error("[Verification] Failed to renew verification:", error);
    throw error;
  }
}
