import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  riders,
  drivers,
  vehicles,
  rides,
  payments,
  type InsertRider,
  type InsertDriver,
  type InsertVehicle,
  type InsertRide,
  type InsertPayment,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============= RIDER FUNCTIONS =============

export async function createRider(data: InsertRider) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(riders).values(data);
  return true;
}

export async function getRiderByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(riders).where(eq(riders.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateRider(riderId: number, data: Partial<InsertRider>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(riders).set(data).where(eq(riders.id, riderId));
}

// ============= DRIVER FUNCTIONS =============

export async function createDriver(data: InsertDriver) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(drivers).values(data);
  return true;
}

export async function getDriverByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(drivers).where(eq(drivers.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateDriver(driverId: number, data: Partial<InsertDriver>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(drivers).set(data).where(eq(drivers.id, driverId));
}

export async function getOnlineDrivers() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(drivers).where(eq(drivers.isOnline, true));
}

// ============= VEHICLE FUNCTIONS =============

export async function createVehicle(data: InsertVehicle) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(vehicles).values(data);
  return true;
}

export async function getVehiclesByDriverId(driverId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(vehicles).where(eq(vehicles.driverId, driverId));
}

export async function updateVehicle(vehicleId: number, data: Partial<InsertVehicle>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(vehicles).set(data).where(eq(vehicles.id, vehicleId));
}

// ============= RIDE FUNCTIONS =============

export async function createRide(data: InsertRide) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(rides).values(data);
  return true;
}

export async function getRideById(rideId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(rides).where(eq(rides.id, rideId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getRidesByRiderId(riderId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(rides).where(eq(rides.riderId, riderId));
}

export async function getRidesByDriverId(driverId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(rides).where(eq(rides.driverId, driverId));
}

export async function getActiveRides() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(rides).where(eq(rides.status, "requested"));
}

export async function updateRide(rideId: number, data: Partial<InsertRide>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(rides).set(data).where(eq(rides.id, rideId));
}

// ============= PAYMENT FUNCTIONS =============

export async function createPayment(data: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(payments).values(data);
  return true;
}

export async function getPaymentByRideId(rideId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(payments).where(eq(payments.rideId, rideId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePayment(paymentId: number, data: Partial<InsertPayment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(payments).set(data).where(eq(payments.id, paymentId));
}
