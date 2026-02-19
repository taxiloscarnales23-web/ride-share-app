import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Rider routes
  riders: router({
    createProfile: protectedProcedure
      .input(z.object({
        phone: z.string().min(10),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createRider({
          userId: ctx.user.id,
          phone: input.phone,
        });
      }),

    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return db.getRiderByUserId(ctx.user.id);
    }),

    updateProfile: protectedProcedure
      .input(z.object({
        phone: z.string().optional(),
        rating: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const rider = await db.getRiderByUserId(ctx.user.id);
        if (!rider) throw new Error("Rider profile not found");
        return db.updateRider(rider.id, input);
      }),

    getRideHistory: protectedProcedure.query(async ({ ctx }) => {
      const rider = await db.getRiderByUserId(ctx.user.id);
      if (!rider) return [];
      return db.getRidesByRiderId(rider.id);
    }),
  }),

  // Driver routes
  drivers: router({
    createProfile: protectedProcedure
      .input(z.object({
        phone: z.string().min(10),
        licenseNumber: z.string().min(5),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createDriver({
          userId: ctx.user.id,
          phone: input.phone,
          licenseNumber: input.licenseNumber,
        });
      }),

    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return db.getDriverByUserId(ctx.user.id);
    }),

    updateProfile: protectedProcedure
      .input(z.object({
        phone: z.string().optional(),
        isOnline: z.boolean().optional(),
        currentLatitude: z.string().optional(),
        currentLongitude: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const driver = await db.getDriverByUserId(ctx.user.id);
        if (!driver) throw new Error("Driver profile not found");
        return db.updateDriver(driver.id, input);
      }),

    getRideHistory: protectedProcedure.query(async ({ ctx }) => {
      const driver = await db.getDriverByUserId(ctx.user.id);
      if (!driver) return [];
      return db.getRidesByDriverId(driver.id);
    }),

    getOnlineDrivers: publicProcedure.query(() => {
      return db.getOnlineDrivers();
    }),
  }),

  // Vehicle routes
  vehicles: router({
    create: protectedProcedure
      .input(z.object({
        make: z.string(),
        model: z.string(),
        year: z.number().optional(),
        color: z.string().optional(),
        licensePlate: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const driver = await db.getDriverByUserId(ctx.user.id);
        if (!driver) throw new Error("Driver profile not found");
        return db.createVehicle({
          driverId: driver.id,
          ...input,
        });
      }),

    getByDriver: protectedProcedure.query(async ({ ctx }) => {
      const driver = await db.getDriverByUserId(ctx.user.id);
      if (!driver) return [];
      return db.getVehiclesByDriverId(driver.id);
    }),
  }),

  // Ride routes
  rides: router({
    create: protectedProcedure
      .input(z.object({
        pickupLatitude: z.string(),
        pickupLongitude: z.string(),
        pickupAddress: z.string().optional(),
        dropoffLatitude: z.string(),
        dropoffLongitude: z.string(),
        dropoffAddress: z.string().optional(),
        estimatedDistance: z.string().optional(),
        estimatedFare: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const rider = await db.getRiderByUserId(ctx.user.id);
        if (!rider) throw new Error("Rider profile not found");
        return db.createRide({
          riderId: rider.id,
          ...input,
        });
      }),

    getActive: publicProcedure.query(() => {
      return db.getActiveRides();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => {
        return db.getRideById(input.id);
      }),

    accept: protectedProcedure
      .input(z.object({ rideId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const driver = await db.getDriverByUserId(ctx.user.id);
        if (!driver) throw new Error("Driver profile not found");
        return db.updateRide(input.rideId, {
          driverId: driver.id,
          status: "accepted",
          acceptedAt: new Date(),
        });
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        rideId: z.number(),
        status: z.enum(["in_progress", "completed", "cancelled"]),
      }))
      .mutation(({ input }) => {
        if (input.status === "in_progress") {
          return db.updateRide(input.rideId, { status: "in_progress", startedAt: new Date() });
        } else if (input.status === "completed") {
          return db.updateRide(input.rideId, { status: "completed", completedAt: new Date() });
        } else {
          return db.updateRide(input.rideId, { status: "cancelled", cancelledAt: new Date() });
        }
      }),
  }),

  // Payment routes
  payments: router({
    create: protectedProcedure
      .input(z.object({
        rideId: z.number(),
        amount: z.string(),
        tip: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const ride = await db.getRideById(input.rideId);
        if (!ride) throw new Error("Ride not found");
        const driver = await db.getDriverByUserId(ctx.user.id);
        if (!driver) throw new Error("Driver profile not found");
        
        const totalAmount = (parseFloat(input.amount) + parseFloat(input.tip || "0")).toString();
        return db.createPayment({
          rideId: input.rideId,
          riderId: ride.riderId,
          driverId: driver.id,
          amount: input.amount,
          tip: input.tip || "0",
          totalAmount,
        });
      }),

    confirmPayment: protectedProcedure
      .input(z.object({ rideId: z.number() }))
      .mutation(async ({ input }) => {
        const payment = await db.getPaymentByRideId(input.rideId);
        if (!payment) throw new Error("Payment not found");
        return db.updatePayment(payment.id, {
          status: "completed" as const,
          paidAt: new Date(),
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;
