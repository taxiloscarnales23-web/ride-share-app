import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Riders table - extends users with rider-specific data
export const riders = mysqlTable("riders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  phone: varchar("phone", { length: 20 }).notNull(),
  rating: varchar("rating", { length: 5 }).default("5.0"),
  totalRides: int("totalRides").default(0),
  paymentMethod: varchar("paymentMethod", { length: 50 }).default("cash"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Drivers table - extends users with driver-specific data
export const drivers = mysqlTable("drivers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  phone: varchar("phone", { length: 20 }).notNull(),
  licenseNumber: varchar("licenseNumber", { length: 50 }).notNull().unique(),
  licenseExpiry: timestamp("licenseExpiry"),
  rating: varchar("rating", { length: 5 }).default("5.0"),
  totalRides: int("totalRides").default(0),
  isOnline: boolean("isOnline").default(false),
  currentLatitude: varchar("currentLatitude", { length: 50 }),
  currentLongitude: varchar("currentLongitude", { length: 50 }),
  bankAccount: text("bankAccount"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Vehicles table - driver vehicles
export const vehicles = mysqlTable("vehicles", {
  id: int("id").autoincrement().primaryKey(),
  driverId: int("driverId").notNull(),
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: int("year"),
  color: varchar("color", { length: 50 }),
  licensePlate: varchar("licensePlate", { length: 50 }).notNull().unique(),
  registrationExpiry: timestamp("registrationExpiry"),
  insuranceExpiry: timestamp("insuranceExpiry"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Rides table - ride requests and completions
export const rides = mysqlTable("rides", {
  id: int("id").autoincrement().primaryKey(),
  riderId: int("riderId").notNull(),
  driverId: int("driverId"),
  pickupLatitude: varchar("pickupLatitude", { length: 50 }).notNull(),
  pickupLongitude: varchar("pickupLongitude", { length: 50 }).notNull(),
  pickupAddress: text("pickupAddress"),
  dropoffLatitude: varchar("dropoffLatitude", { length: 50 }).notNull(),
  dropoffLongitude: varchar("dropoffLongitude", { length: 50 }).notNull(),
  dropoffAddress: text("dropoffAddress"),
  estimatedDistance: varchar("estimatedDistance", { length: 50 }),
  estimatedDuration: varchar("estimatedDuration", { length: 50 }),
  estimatedFare: varchar("estimatedFare", { length: 50 }),
  actualFare: varchar("actualFare", { length: 50 }),
  tip: varchar("tip", { length: 50 }).default("0"),
  status: mysqlEnum("status", ["requested", "accepted", "in_progress", "completed", "cancelled"]).default("requested"),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed"]).default("pending"),
  paymentMethod: varchar("paymentMethod", { length: 50 }).default("cash"),
  riderRating: int("riderRating"),
  riderReview: text("riderReview"),
  driverRating: int("driverRating"),
  driverReview: text("driverReview"),
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  acceptedAt: timestamp("acceptedAt"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  cancelledAt: timestamp("cancelledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Payments table - cash payment records
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  rideId: int("rideId").notNull().unique(),
  riderId: int("riderId").notNull(),
  driverId: int("driverId").notNull(),
  amount: varchar("amount", { length: 50 }).notNull(),
  tip: varchar("tip", { length: 50 }).default("0"),
  totalAmount: varchar("totalAmount", { length: 50 }).notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }).default("cash"),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending"),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Chat messages table - in-app messaging between drivers and riders
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  rideId: int("rideId").notNull(),
  senderId: int("senderId").notNull(),
  senderType: mysqlEnum("senderType", ["rider", "driver"]).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Promo codes table - discount codes for riders
export const promoCodes = mysqlTable("promoCodes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discountType: mysqlEnum("discountType", ["percentage", "fixed"]).notNull(),
  discountValue: varchar("discountValue", { length: 50 }).notNull(),
  maxUses: int("maxUses"),
  currentUses: int("currentUses").default(0),
  minRideAmount: varchar("minRideAmount", { length: 50 }).default("0"),
  expiryDate: timestamp("expiryDate"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Promo code usage table - track which riders used which codes
export const promoCodeUsage = mysqlTable("promoCodeUsage", {
  id: int("id").autoincrement().primaryKey(),
  promoCodeId: int("promoCodeId").notNull(),
  riderId: int("riderId").notNull(),
  rideId: int("rideId").notNull(),
  discountAmount: varchar("discountAmount", { length: 50 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Emergency contacts table - trusted contacts for riders
export const emergencyContacts = mysqlTable("emergencyContacts", {
  id: int("id").autoincrement().primaryKey(),
  riderId: int("riderId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  relationship: varchar("relationship", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Incident reports table - safety incidents during rides
export const incidentReports = mysqlTable("incidentReports", {
  id: int("id").autoincrement().primaryKey(),
  rideId: int("rideId").notNull(),
  reportedById: int("reportedById").notNull(),
  reporterType: mysqlEnum("reporterType", ["rider", "driver"]).notNull(),
  incidentType: varchar("incidentType", { length: 100 }).notNull(),
  description: text("description"),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).notNull(),
  status: mysqlEnum("status", ["reported", "investigating", "resolved", "closed"]).default("reported"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Scheduled rides table - future ride bookings
export const scheduledRides = mysqlTable("scheduledRides", {
  id: int("id").autoincrement().primaryKey(),
  riderId: int("riderId").notNull(),
  pickupLatitude: varchar("pickupLatitude", { length: 50 }).notNull(),
  pickupLongitude: varchar("pickupLongitude", { length: 50 }).notNull(),
  pickupAddress: text("pickupAddress"),
  dropoffLatitude: varchar("dropoffLatitude", { length: 50 }).notNull(),
  dropoffLongitude: varchar("dropoffLongitude", { length: 50 }).notNull(),
  dropoffAddress: text("dropoffAddress"),
  scheduledTime: timestamp("scheduledTime").notNull(),
  estimatedFare: varchar("estimatedFare", { length: 50 }),
  status: mysqlEnum("status", ["scheduled", "confirmed", "in_progress", "completed", "cancelled"]).default("scheduled"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Referral program table - track referrals between users
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: int("referrerId").notNull(),
  referredUserId: int("referredUserId"),
  referralCode: varchar("referralCode", { length: 50 }).notNull().unique(),
  referralType: mysqlEnum("referralType", ["rider", "driver", "both"]).notNull(),
  rewardAmount: varchar("rewardAmount", { length: 50 }).notNull(),
  referrerRewardClaimed: boolean("referrerRewardClaimed").default(false),
  referredRewardClaimed: boolean("referredRewardClaimed").default(false),
  status: mysqlEnum("status", ["active", "completed", "expired"]).default("active"),
  expiryDate: timestamp("expiryDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Driver verification documents table
export const driverVerification = mysqlTable("driverVerification", {
  id: int("id").autoincrement().primaryKey(),
  driverId: int("driverId").notNull().unique(),
  licenseDocUrl: text("licenseDocUrl"),
  licenseVerified: boolean("licenseVerified").default(false),
  registrationDocUrl: text("registrationDocUrl"),
  registrationVerified: boolean("registrationVerified").default(false),
  insuranceDocUrl: text("insuranceDocUrl"),
  insuranceVerified: boolean("insuranceVerified").default(false),
  backgroundCheckStatus: mysqlEnum("backgroundCheckStatus", ["pending", "approved", "rejected"]).default("pending"),
  backgroundCheckUrl: text("backgroundCheckUrl"),
  verificationStatus: mysqlEnum("verificationStatus", ["pending", "approved", "rejected"]).default("pending"),
  rejectionReason: text("rejectionReason"),
  submittedAt: timestamp("submittedAt"),
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Surge pricing table - dynamic pricing during peak hours
export const surgePricing = mysqlTable("surgePricing", {
  id: int("id").autoincrement().primaryKey(),
  area: varchar("area", { length: 100 }).notNull(),
  multiplier: varchar("multiplier", { length: 10 }).notNull(),
  reason: varchar("reason", { length: 100 }),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime"),
  status: mysqlEnum("status", ["active", "inactive"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Ride pooling table - shared rides between multiple riders
export const ridePooling = mysqlTable("ridePooling", {
  id: int("id").autoincrement().primaryKey(),
  mainRideId: int("mainRideId").notNull(),
  pooledRideId: int("pooledRideId").notNull(),
  mainRiderId: int("mainRiderId").notNull(),
  pooledRiderId: int("pooledRiderId").notNull(),
  driverId: int("driverId").notNull(),
  pickupOrder: int("pickupOrder"),
  discountPercentage: varchar("discountPercentage", { length: 10 }).default("15"),
  status: mysqlEnum("status", ["matched", "in_progress", "completed", "cancelled"]).default("matched"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Admin audit log table - track admin actions and platform changes
export const adminAuditLog = mysqlTable("adminAuditLog", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 50 }),
  entityId: int("entityId"),
  details: text("details"),
  status: varchar("status", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Export types
export type Rider = typeof riders.$inferSelect;
export type InsertRider = typeof riders.$inferInsert;
export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = typeof drivers.$inferInsert;
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;
export type Ride = typeof rides.$inferSelect;
export type InsertRide = typeof rides.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = typeof promoCodes.$inferInsert;
export type PromoCodeUsage = typeof promoCodeUsage.$inferSelect;
export type InsertPromoCodeUsage = typeof promoCodeUsage.$inferInsert;
export type EmergencyContact = typeof emergencyContacts.$inferSelect;
export type InsertEmergencyContact = typeof emergencyContacts.$inferInsert;
export type IncidentReport = typeof incidentReports.$inferSelect;
export type InsertIncidentReport = typeof incidentReports.$inferInsert;
export type ScheduledRide = typeof scheduledRides.$inferSelect;
export type InsertScheduledRide = typeof scheduledRides.$inferInsert;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;
export type DriverVerification = typeof driverVerification.$inferSelect;
export type InsertDriverVerification = typeof driverVerification.$inferInsert;
export type SurgePricing = typeof surgePricing.$inferSelect;
export type InsertSurgePricing = typeof surgePricing.$inferInsert;
export type RidePooling = typeof ridePooling.$inferSelect;
export type InsertRidePooling = typeof ridePooling.$inferInsert;
export type AdminAuditLog = typeof adminAuditLog.$inferSelect;
export type InsertAdminAuditLog = typeof adminAuditLog.$inferInsert;
