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
