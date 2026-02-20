import { rides } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { getDb } from "../db";

/**
 * Safety Service
 * Handles emergency SOS, trusted contacts, and incident reporting
 */

export interface TrustedContact {
  id: number;
  userId: number;
  name: string;
  phone: string;
  email: string;
  relationship: string;
  createdAt: Date;
}

export interface IncidentReport {
  id: number;
  rideId: number;
  reporterId: number;
  reporterType: "rider" | "driver";
  incidentType: "safety" | "harassment" | "accident" | "damage" | "other";
  description: string;
  location: {
    latitude: number;
    longitude: number;
  };
  evidenceUrls: string[];
  status: "open" | "investigating" | "resolved" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

export interface SOSAlert {
  id: number;
  rideId: number;
  userId: number;
  userType: "rider" | "driver";
  location: {
    latitude: number;
    longitude: number;
  };
  emergencyType: "medical" | "accident" | "threat" | "other";
  status: "active" | "responded" | "resolved";
  createdAt: Date;
}

// In-memory storage for active SOS alerts (in production, use database)
const activeSOSAlerts = new Map<number, SOSAlert>();

/**
 * Add trusted contact
 */
export async function addTrustedContact(
  userId: number,
  name: string,
  phone: string,
  email: string,
  relationship: string
): Promise<TrustedContact> {
  try {
    const contact: TrustedContact = {
      id: Math.random(),
      userId,
      name,
      phone,
      email,
      relationship,
      createdAt: new Date(),
    };

    console.log(`[Safety] Added trusted contact for user ${userId}: ${name}`);

    return contact;
  } catch (error) {
    console.error("[Safety] Failed to add trusted contact:", error);
    throw error;
  }
}

/**
 * Get trusted contacts for a user
 */
export async function getTrustedContacts(userId: number): Promise<TrustedContact[]> {
  try {
    // Mock data - in production, fetch from database
    const contacts: TrustedContact[] = [
      {
        id: 1,
        userId,
        name: "Emergency Contact",
        phone: "+1-555-0100",
        email: "emergency@example.com",
        relationship: "Family",
        createdAt: new Date(),
      },
    ];

    return contacts;
  } catch (error) {
    console.error("[Safety] Failed to get trusted contacts:", error);
    throw error;
  }
}

/**
 * Trigger SOS emergency alert
 */
export async function triggerSOS(
  rideId: number,
  userId: number,
  userType: "rider" | "driver",
  latitude: number,
  longitude: number,
  emergencyType: "medical" | "accident" | "threat" | "other" = "other"
): Promise<SOSAlert> {
  try {
    const sosAlert: SOSAlert = {
      id: Math.random(),
      rideId,
      userId,
      userType,
      location: {
        latitude,
        longitude,
      },
      emergencyType,
      status: "active",
      createdAt: new Date(),
    };

    activeSOSAlerts.set(rideId, sosAlert);

    // In production, send alerts to:
    // 1. Emergency services (911/999)
    // 2. Trusted contacts
    // 3. Platform support team
    // 4. Other party in the ride

    console.log(
      `[Safety] SOS triggered for ride ${rideId} by ${userType} ${userId}: ${emergencyType}`
    );

    return sosAlert;
  } catch (error) {
    console.error("[Safety] Failed to trigger SOS:", error);
    throw error;
  }
}

/**
 * Get active SOS alert for a ride
 */
export async function getActiveSOS(rideId: number): Promise<SOSAlert | null> {
  try {
    return activeSOSAlerts.get(rideId) || null;
  } catch (error) {
    console.error("[Safety] Failed to get active SOS:", error);
    throw error;
  }
}

/**
 * Resolve SOS alert
 */
export async function resolveSOS(
  rideId: number,
  resolution: "emergency_services_called" | "false_alarm" | "resolved"
): Promise<{
  sosId: number;
  status: "resolved";
  resolution: string;
  timestamp: Date;
}> {
  try {
    const sosAlert = activeSOSAlerts.get(rideId);
    if (!sosAlert) {
      throw new Error("No active SOS alert found");
    }

    sosAlert.status = "resolved";
    activeSOSAlerts.delete(rideId);

    console.log(`[Safety] Resolved SOS for ride ${rideId}: ${resolution}`);

    return {
      sosId: sosAlert.id,
      status: "resolved",
      resolution,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("[Safety] Failed to resolve SOS:", error);
    throw error;
  }
}

/**
 * Report an incident
 */
export async function reportIncident(
  rideId: number,
  reporterId: number,
  reporterType: "rider" | "driver",
  incidentType: "safety" | "harassment" | "accident" | "damage" | "other",
  description: string,
  latitude: number,
  longitude: number,
  evidenceUrls: string[] = []
): Promise<IncidentReport> {
  try {
    const report: IncidentReport = {
      id: Math.random(),
      rideId,
      reporterId,
      reporterType,
      incidentType,
      description,
      location: {
        latitude,
        longitude,
      },
      evidenceUrls,
      status: "open",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In production, store in database and notify support team
    console.log(
      `[Safety] Incident reported for ride ${rideId}: ${incidentType} - ${description}`
    );

    return report;
  } catch (error) {
    console.error("[Safety] Failed to report incident:", error);
    throw error;
  }
}

/**
 * Get incident reports for a ride
 */
export async function getIncidentReports(rideId: number): Promise<IncidentReport[]> {
  try {
    // Mock data - in production, fetch from database
    const reports: IncidentReport[] = [];
    return reports;
  } catch (error) {
    console.error("[Safety] Failed to get incident reports:", error);
    throw error;
  }
}

/**
 * Share ride details with trusted contacts
 */
export async function shareRideWithContacts(
  rideId: number,
  userId: number,
  contactIds: number[]
): Promise<{
  success: boolean;
  sharedWith: number;
  shareCode: string;
  expiresAt: Date;
}> {
  try {
    const shareCode = `SHARE-${rideId}-${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // In production:
    // 1. Send SMS/email to contacts with share code
    // 2. Allow them to track ride in real-time
    // 3. Store share record in database

    console.log(
      `[Safety] Shared ride ${rideId} with ${contactIds.length} trusted contacts`
    );

    return {
      success: true,
      sharedWith: contactIds.length,
      shareCode,
      expiresAt,
    };
  } catch (error) {
    console.error("[Safety] Failed to share ride:", error);
    throw error;
  }
}

/**
 * Enable ride safety mode
 */
export async function enableSafetyMode(
  rideId: number,
  userId: number
): Promise<{
  safetyModeEnabled: boolean;
  features: string[];
  timestamp: Date;
}> {
  try {
    const features = [
      "continuous_recording",
      "emergency_alert_ready",
      "trusted_contact_tracking",
      "incident_auto_report",
      "emergency_services_quick_call",
    ];

    console.log(`[Safety] Enabled safety mode for ride ${rideId}`);

    return {
      safetyModeEnabled: true,
      features,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("[Safety] Failed to enable safety mode:", error);
    throw error;
  }
}

/**
 * Get safety score for a user
 */
export async function getUserSafetyScore(userId: number): Promise<{
  safetyScore: number; // 0-100
  incidents: number;
  sosAlerts: number;
  trustedContacts: number;
  safetyModeUsage: number; // percentage
  recommendations: string[];
}> {
  try {
    // Mock calculation - in production, aggregate from incidents and reports
    const safetyScore = 92;
    const incidents = 0;
    const sosAlerts = 0;
    const trustedContacts = 3;
    const safetyModeUsage = 85;

    const recommendations: string[] = [];
    if (trustedContacts < 2) {
      recommendations.push("Add more trusted contacts for emergency situations");
    }
    if (safetyModeUsage < 50) {
      recommendations.push("Enable safety mode more frequently during rides");
    }

    return {
      safetyScore,
      incidents,
      sosAlerts,
      trustedContacts,
      safetyModeUsage,
      recommendations,
    };
  } catch (error) {
    console.error("[Safety] Failed to get safety score:", error);
    throw error;
  }
}

/**
 * Generate safety report for a ride
 */
export async function generateSafetyReport(rideId: number): Promise<{
  rideId: number;
  safetyRating: number; // 0-5
  incidents: IncidentReport[];
  sosAlerts: SOSAlert[];
  recommendations: string[];
  generatedAt: Date;
}> {
  try {
    const incidents = await getIncidentReports(rideId);
    const sosAlerts: SOSAlert[] = [];

    let safetyRating = 5;
    if (incidents.length > 0) safetyRating -= 1;
    if (sosAlerts.length > 0) safetyRating -= 1;

    const recommendations: string[] = [];
    if (incidents.length > 0) {
      recommendations.push("Review incident details and follow up with support");
    }

    return {
      rideId,
      safetyRating: Math.max(0, safetyRating),
      incidents,
      sosAlerts,
      recommendations,
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error("[Safety] Failed to generate safety report:", error);
    throw error;
  }
}
