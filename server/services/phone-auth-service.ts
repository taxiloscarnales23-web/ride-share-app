import { users, riders, drivers } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { getDb } from "../db";

/**
 * Phone Authentication Service
 * Handles phone number verification with OTP
 */

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map<
  string,
  { code: string; expiresAt: number; attempts: number; verified: boolean }
>();

const OTP_LENGTH = 6;
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 3;

/**
 * Generate a random OTP code
 */
function generateOTP(): string {
  return Math.floor(Math.random() * Math.pow(10, OTP_LENGTH))
    .toString()
    .padStart(OTP_LENGTH, "0");
}

/**
 * Send OTP to phone number (mock implementation)
 * In production, integrate with SMS provider (Twilio, AWS SNS, etc.)
 */
export async function sendOTP(phoneNumber: string): Promise<{ success: boolean; message: string }> {
  try {
    // Validate phone number format
    if (!phoneNumber.match(/^\+?[1-9]\d{1,14}$/)) {
      throw new Error("Invalid phone number format");
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + OTP_EXPIRY_MS;

    // Store OTP
    otpStore.set(phoneNumber, {
      code: otp,
      expiresAt,
      attempts: 0,
      verified: false,
    });

    // Mock: Log OTP (in production, send via SMS)
    console.log(`[PhoneAuth] OTP for ${phoneNumber}: ${otp}`);

    return {
      success: true,
      message: `OTP sent to ${phoneNumber}. Valid for 10 minutes.`,
    };
  } catch (error) {
    console.error("[PhoneAuth] Failed to send OTP:", error);
    throw error;
  }
}

/**
 * Verify OTP code
 */
export async function verifyOTP(
  phoneNumber: string,
  code: string
): Promise<{ success: boolean; message: string }> {
  try {
    const otpData = otpStore.get(phoneNumber);

    if (!otpData) {
      throw new Error("No OTP found for this phone number. Please request a new one.");
    }

    // Check if OTP has expired
    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(phoneNumber);
      throw new Error("OTP has expired. Please request a new one.");
    }

    // Check attempt limit
    if (otpData.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(phoneNumber);
      throw new Error("Maximum OTP attempts exceeded. Please request a new one.");
    }

    // Verify code
    if (otpData.code !== code) {
      otpData.attempts++;
      throw new Error(
        `Invalid OTP. ${MAX_ATTEMPTS - otpData.attempts} attempts remaining.`
      );
    }

    // Mark as verified
    otpData.verified = true;

    return {
      success: true,
      message: "OTP verified successfully",
    };
  } catch (error) {
    console.error("[PhoneAuth] Failed to verify OTP:", error);
    throw error;
  }
}

/**
 * Check if phone number is verified
 */
export function isPhoneVerified(phoneNumber: string): boolean {
  const otpData = otpStore.get(phoneNumber);
  return otpData?.verified ?? false;
}

/**
 * Clear OTP for phone number
 */
export function clearOTP(phoneNumber: string): void {
  otpStore.delete(phoneNumber);
}

/**
 * Resend OTP
 */
export async function resendOTP(phoneNumber: string): Promise<{ success: boolean; message: string }> {
  try {
    // Clear previous OTP
    clearOTP(phoneNumber);

    // Send new OTP
    return sendOTP(phoneNumber);
  } catch (error) {
    console.error("[PhoneAuth] Failed to resend OTP:", error);
    throw error;
  }
}

/**
 * Create or update user after phone verification
 */
export async function createOrUpdateUserByPhone(
  phoneNumber: string,
  userData: {
    name?: string;
    email?: string;
    role?: "rider" | "driver";
    licenseNumber?: string;
  }
): Promise<any> {
  try {
    if (!isPhoneVerified(phoneNumber)) {
      throw new Error("Phone number not verified");
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create base user
    const userResult = await db.insert(users).values({
      openId: `phone_${phoneNumber}_${Date.now()}`,
      name: userData.name || "",
      email: userData.email || "",
      loginMethod: "phone",
      role: "user",
    });

    const userId = userResult[0].insertId;

    // Create rider or driver profile
    if (userData.role === "driver") {
      if (!userData.licenseNumber) {
        throw new Error("License number required for driver registration");
      }
      await db.insert(drivers).values({
        userId,
        phone: phoneNumber,
        licenseNumber: userData.licenseNumber,
      });
    } else {
      await db.insert(riders).values({
        userId,
        phone: phoneNumber,
      });
    }

    return {
      id: userId,
      phoneNumber,
      name: userData.name || "",
      email: userData.email || "",
      role: userData.role || "rider",
      isNewUser: true,
    };
  } catch (error) {
    console.error("[PhoneAuth] Failed to create/update user:", error);
    throw error;
  }
}

/**
 * Get user by phone number
 */
export async function getUserByPhone(phoneNumber: string): Promise<any> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Check riders table
    const riderResult = await db.select().from(riders).where(eq(riders.phone, phoneNumber));

    if (riderResult.length > 0) {
      const rider = riderResult[0];
      const user = await db.select().from(users).where(eq(users.id, rider.userId));
      return user.length > 0 ? { ...user[0], role: "rider", riderId: rider.id } : null;
    }

    // Check drivers table
    const driverResult = await db.select().from(drivers).where(eq(drivers.phone, phoneNumber));

    if (driverResult.length > 0) {
      const driver = driverResult[0];
      const user = await db.select().from(users).where(eq(users.id, driver.userId));
      return user.length > 0 ? { ...user[0], role: "driver", driverId: driver.id } : null;
    }

    return null;
  } catch (error) {
    console.error("[PhoneAuth] Failed to get user:", error);
    throw error;
  }
}

/**
 * Get OTP status
 */
export function getOTPStatus(phoneNumber: string): {
  exists: boolean;
  verified: boolean;
  expiresIn: number;
  attemptsRemaining: number;
} {
  const otpData = otpStore.get(phoneNumber);

  if (!otpData) {
    return {
      exists: false,
      verified: false,
      expiresIn: 0,
      attemptsRemaining: 0,
    };
  }

  const expiresIn = Math.max(0, otpData.expiresAt - Date.now());
  const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - otpData.attempts);

  return {
    exists: true,
    verified: otpData.verified,
    expiresIn,
    attemptsRemaining,
  };
}
