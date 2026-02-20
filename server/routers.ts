import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import * as matching from "./matching";
import * as ratingService from "./services/rating-service";
import * as trackingService from "./services/tracking-service";
import * as disputeService from "./services/dispute-service";
import * as badgesService from "./services/badges-service";
import * as notificationsService from "./services/notifications-service";
import * as analyticsService from "./services/analytics-service";
import * as rideReplayService from "./services/ride-replay-service";
import * as messagingService from "./services/messaging-service";
import * as pinningService from "./services/pinning-service";
import * as forwardingService from "./services/forwarding-service";
import * as reactionsService from "./services/reactions-service";
import * as searchService from "./services/search-service";
import * as archivingService from "./services/archiving-service";
import { webhookService } from "./services/webhook-service";
import { auditService } from "./services/audit-service";
import { twoFAService } from "./services/twofa-service";

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
        let rider = await db.getRiderByUserId(ctx.user.id);
        if (!rider) {
          rider = await db.createRider({
            userId: ctx.user.id,
            phone: "+1 (555) 000-0000",
          });
        }
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

  matching: router({
    findNearbyDrivers: publicProcedure
      .input(z.object({
        pickupLatitude: z.string(),
        pickupLongitude: z.string(),
        maxDistance: z.number().optional(),
      }))
      .query(({ input }) => {
        return matching.findNearbyDrivers(
          input.pickupLatitude,
          input.pickupLongitude,
          input.maxDistance
        );
      }),

    calculateFare: publicProcedure
      .input(z.object({
        distanceKm: z.number(),
      }))
      .query(({ input }) => {
        return {
          fare: matching.calculateFare(input.distanceKm),
        };
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

  // Rating routes
  ratings: router({
    createRating: protectedProcedure
      .input(z.object({
        rideId: z.number(),
        driverId: z.number(),
        overallRating: z.number().min(1).max(5),
        cleanliness: z.number().min(1).max(5).optional(),
        safety: z.number().min(1).max(5).optional(),
        communication: z.number().min(1).max(5).optional(),
        review: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const rider = await db.getRiderByUserId(ctx.user.id);
        if (!rider) throw new Error("Rider profile not found");
        return ratingService.createDriverRating({
          rideId: input.rideId,
          riderId: rider.id,
          driverId: input.driverId,
          overallRating: input.overallRating,
          cleanliness: input.cleanliness,
          safety: input.safety,
          communication: input.communication,
          review: input.review,
        });
      }),

    getDriverRatings: publicProcedure
      .input(z.object({ driverId: z.number(), limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return ratingService.getDriverRatings(input.driverId, input.limit);
      }),

    getDriverStats: publicProcedure
      .input(z.object({ driverId: z.number() }))
      .query(async ({ input }) => {
        return ratingService.getDriverRatingStats(input.driverId);
      }),

    hasRatedRide: protectedProcedure
      .input(z.object({ rideId: z.number() }))
      .query(async ({ ctx, input }) => {
        const rider = await db.getRiderByUserId(ctx.user.id);
        if (!rider) return false;
        return ratingService.hasRatedRide(input.rideId, rider.id);
      }),

    getTopRatedDrivers: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return ratingService.getTopRatedDrivers(input.limit);
      }),
  }),

  // Tracking routes
  tracking: router({
    recordLocation: protectedProcedure
      .input(z.object({
        rideId: z.number(),
        latitude: z.string(),
        longitude: z.string(),
        accuracy: z.string().optional(),
        speed: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const driver = await db.getDriverByUserId(ctx.user.id);
        if (!driver) throw new Error("Driver profile not found");
        return trackingService.recordLocationUpdate({
          rideId: input.rideId,
          driverId: driver.id,
          latitude: input.latitude,
          longitude: input.longitude,
          accuracy: input.accuracy,
          speed: input.speed,
        });
      }),

    getCurrentLocation: publicProcedure
      .input(z.object({ rideId: z.number() }))
      .query(async ({ input }) => {
        return trackingService.getCurrentRideLocation(input.rideId);
      }),

    getLocationHistory: publicProcedure
      .input(z.object({ rideId: z.number() }))
      .query(async ({ input }) => {
        return trackingService.getRideLocationHistory(input.rideId);
      }),

    getDriverLocation: publicProcedure
      .input(z.object({ driverId: z.number() }))
      .query(async ({ input }) => {
        return trackingService.getDriverCurrentLocation(input.driverId);
      }),

    calculateETA: publicProcedure
      .input(z.object({
        currentLat: z.number(),
        currentLon: z.number(),
        destLat: z.number(),
        destLon: z.number(),
        averageSpeed: z.number().default(40),
      }))
      .query(async ({ input }) => {
        return trackingService.calculateETA(
          input.currentLat,
          input.currentLon,
          input.destLat,
          input.destLon,
          input.averageSpeed
        );
      }),
  }),

  // Dispute routes
  disputes: router({
    createDispute: protectedProcedure
      .input(z.object({
        rideId: z.number(),
        driverId: z.number(),
        issueType: z.enum(["wrong_fare", "unsafe_behavior", "lost_item", "vehicle_issue", "other"]),
        title: z.string(),
        description: z.string(),
        severity: z.enum(["low", "medium", "high"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const rider = await db.getRiderByUserId(ctx.user.id);
        if (!rider) throw new Error("Rider profile not found");
        return disputeService.createDispute({
          rideId: input.rideId,
          riderId: rider.id,
          driverId: input.driverId,
          issueType: input.issueType,
          title: input.title,
          description: input.description,
          severity: input.severity,
        });
      }),

    addEvidence: protectedProcedure
      .input(z.object({
        disputeId: z.number(),
        evidenceType: z.enum(["photo", "video", "audio", "document"]),
        fileUrl: z.string(),
      }))
      .mutation(async ({ input }) => {
        return disputeService.addDisputeEvidence(input);
      }),

    getDisputeDetail: publicProcedure
      .input(z.object({ disputeId: z.number() }))
      .query(async ({ input }) => {
        return disputeService.getDisputeDetail(input.disputeId);
      }),

    getRiderDisputes: protectedProcedure
      .query(async ({ ctx }) => {
        const rider = await db.getRiderByUserId(ctx.user.id);
        if (!rider) return [];
        return disputeService.getRiderDisputes(rider.id);
      }),

    getDriverDisputes: protectedProcedure
      .query(async ({ ctx }) => {
        const driver = await db.getDriverByUserId(ctx.user.id);
        if (!driver) return [];
        return disputeService.getDriverDisputes(driver.id);
      }),

    getOpenDisputes: protectedProcedure
      .query(async ({ ctx }) => {
        // Only admins can view all open disputes
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        return disputeService.getOpenDisputes();
      }),

    resolveDispute: protectedProcedure
      .input(z.object({
        disputeId: z.number(),
        resolutionType: z.enum(["refund", "credit", "compensation", "no_action"]),
        amount: z.string().optional(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Only admins can resolve disputes
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        return disputeService.resolveDispute({
          ...input,
          resolvedBy: ctx.user.id,
        });
      }),

    updateDisputeStatus: protectedProcedure
      .input(z.object({
        disputeId: z.number(),
        status: z.enum(["open", "in_review", "resolved", "closed"]),
      }))
      .mutation(async ({ ctx, input }) => {
        // Only admins can update dispute status
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        return disputeService.updateDisputeStatus(input.disputeId, input.status);
      }),

    getDisputeStats: protectedProcedure
      .query(async ({ ctx }) => {
        // Only admins can view dispute stats
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        return disputeService.getDisputeStats();
      }),
  }),

  badges: router({
    getAllBadges: publicProcedure.query(async () => {
      return badgesService.getAllBadges();
    }),
    getDriverBadges: protectedProcedure.query(async ({ ctx }) => {
      const driver = await db.getDriverByUserId(ctx.user.id);
      if (!driver) throw new Error("Driver profile not found");
      return badgesService.getDriverBadges(driver.id);
    }),
    getDriverBadgeProgress: protectedProcedure.query(async ({ ctx }) => {
      const driver = await db.getDriverByUserId(ctx.user.id);
      if (!driver) throw new Error("Driver profile not found");
      return badgesService.getDriverBadgeProgress(driver.id);
    }),
  }),

  notifications: router({
    getUnreadNotifications: protectedProcedure.query(async ({ ctx }) => {
      return notificationsService.getUnreadNotifications(ctx.user.id);
    }),
    getUserNotifications: protectedProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return notificationsService.getUserNotifications(ctx.user.id, input.limit, input.offset);
      }),
    getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
      return notificationsService.getUnreadCount(ctx.user.id);
    }),
  }),

  analytics: router({
    getDashboardMetrics: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      return analyticsService.getDashboardMetrics();
    }),
    getRideAnalytics: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      return analyticsService.getRideAnalytics();
    }),
    getDriverAnalytics: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      return analyticsService.getDriverAnalytics();
    }),
    getRevenueAnalytics: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      return analyticsService.getRevenueAnalytics();
    }),
    getDisputeAnalytics: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      return analyticsService.getDisputeAnalytics();
    }),
    getComprehensiveReport: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      return analyticsService.getComprehensiveReport();
    }),
  }),

  rideReplay: router({
    getRideReplayData: protectedProcedure
      .input(z.object({ rideId: z.number() }))
      .query(async ({ input }) => {
        return rideReplayService.getRideReplayData(input.rideId);
      }),
    getRouteStatistics: protectedProcedure
      .input(z.object({ rideId: z.number() }))
      .query(async ({ input }) => {
        return rideReplayService.getRouteStatistics(input.rideId);
      }),
    detectRouteAnomalies: protectedProcedure
      .input(z.object({ rideId: z.number() }))
      .query(async ({ input }) => {
        return rideReplayService.detectRouteAnomalies(input.rideId);
      }),
  }),
});

export type AppRouter = typeof appRouter;

// Messaging routes - in-app chat functionality
export const messagingRouter = router({
  createConversation: protectedProcedure
    .input(z.object({ rideId: z.number(), riderId: z.number(), driverId: z.number() }))
    .mutation(async ({ input }) => {
      return messagingService.createConversation(input);
    }),
  getConversation: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input }) => {
      return messagingService.getConversation(input.conversationId);
    }),
  getConversationsByUser: protectedProcedure
    .input(z.object({ userType: z.enum(["rider", "driver"]) }))
    .query(async ({ ctx, input }) => {
      return messagingService.getConversationsByUser(ctx.user.id, input.userType);
    }),
  sendMessage: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      senderId: z.number(),
      senderType: z.enum(["rider", "driver"]),
      messageText: z.string().optional(),
      imageUrl: z.string().optional(),
      messageType: z.enum(["text", "image", "system"]).default("text"),
    }))
    .mutation(async ({ input }) => {
      return messagingService.sendMessage(input);
    }),
  getConversationMessages: protectedProcedure
    .input(z.object({ conversationId: z.number(), limit: z.number().optional(), offset: z.number().optional() }))
    .query(async ({ input }) => {
      return messagingService.getConversationMessages(input.conversationId, input.limit, input.offset);
    }),
  markMessageAsRead: protectedProcedure
    .input(z.object({ messageId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return messagingService.markMessageAsRead(input.messageId, ctx.user.id);
    }),
  markConversationAsRead: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return messagingService.markConversationAsRead(input.conversationId, ctx.user.id);
    }),
  getUnreadMessageCount: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input }) => {
      return messagingService.getUnreadMessageCount(input.conversationId);
    }),
  setTypingIndicator: protectedProcedure
    .input(z.object({ conversationId: z.number(), isTyping: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return messagingService.setTypingIndicator(input.conversationId, ctx.user.id, input.isTyping);
    }),
  getTypingUsers: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input }) => {
      return messagingService.getTypingUsers(input.conversationId);
    }),
  getMessageStatistics: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input }) => {
      return messagingService.getMessageStatistics(input.conversationId);
    }),
});

// Pinning routes - manage pinned messages
export const pinningRouter = router({
  pinMessage: protectedProcedure
    .input(z.object({ messageId: z.number(), conversationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return pinningService.pinMessage(input.messageId, input.conversationId, ctx.user.id);
    }),
  unpinMessage: protectedProcedure
    .input(z.object({ messageId: z.number() }))
    .mutation(async ({ input }) => {
      return pinningService.unpinMessage(input.messageId);
    }),
  getPinnedMessages: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input }) => {
      return pinningService.getPinnedMessages(input.conversationId);
    }),
  getPinnedMessageCount: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input }) => {
      return pinningService.getPinnedMessageCount(input.conversationId);
    }),
  isPinned: protectedProcedure
    .input(z.object({ messageId: z.number() }))
    .query(async ({ input }) => {
      return pinningService.isPinned(input.messageId);
    }),
  getPinningHistory: protectedProcedure
    .input(z.object({ conversationId: z.number(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      return pinningService.getPinningHistory(input.conversationId, input.limit);
    }),
});

// Forwarding routes - forward messages between conversations
export const forwardingRouter = router({
  forwardMessage: protectedProcedure
    .input(z.object({
      originalMessageId: z.number(),
      sourceConversationId: z.number(),
      targetConversationId: z.number(),
      forwardNote: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return forwardingService.forwardMessage(
        input.originalMessageId,
        input.sourceConversationId,
        input.targetConversationId,
        ctx.user.id,
        input.forwardNote
      );
    }),
  getForwardingHistory: protectedProcedure
    .input(z.object({ conversationId: z.number(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      return forwardingService.getForwardingHistory(input.conversationId, input.limit);
    }),
  getForwardedTo: protectedProcedure
    .input(z.object({ messageId: z.number() }))
    .query(async ({ input }) => {
      return forwardingService.getForwardedTo(input.messageId);
    }),
  getForwardingStats: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input }) => {
      return forwardingService.getForwardingStats(input.conversationId);
    }),
  undoForward: protectedProcedure
    .input(z.object({ forwardId: z.number() }))
    .mutation(async ({ input }) => {
      return forwardingService.undoForward(input.forwardId);
    }),
  getForwardingChain: protectedProcedure
    .input(z.object({ messageId: z.number() }))
    .query(async ({ input }) => {
      return forwardingService.getForwardingChain(input.messageId);
    }),
});


// Reactions routes - emoji reactions to messages
export const reactionsRouter = router({
  addReaction: protectedProcedure
    .input(z.object({ messageId: z.number(), emoji: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return reactionsService.addReaction(input.messageId, ctx.user.id, input.emoji);
    }),
  removeReaction: protectedProcedure
    .input(z.object({ messageId: z.number(), emoji: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return reactionsService.removeReaction(input.messageId, ctx.user.id, input.emoji);
    }),
  getMessageReactions: protectedProcedure
    .input(z.object({ messageId: z.number() }))
    .query(async ({ input }) => {
      return reactionsService.getMessageReactions(input.messageId);
    }),
  getReactionSummary: protectedProcedure
    .input(z.object({ messageId: z.number() }))
    .query(async ({ input }) => {
      return reactionsService.getReactionSummary(input.messageId);
    }),
  getUsersWhoReacted: protectedProcedure
    .input(z.object({ messageId: z.number(), emoji: z.string() }))
    .query(async ({ input }) => {
      return reactionsService.getUsersWhoReacted(input.messageId, input.emoji);
    }),
  getAllowedEmojis: publicProcedure.query(async () => {
    return reactionsService.getAllowedEmojis();
  }),
  getTopReactions: protectedProcedure
    .input(z.object({ conversationId: z.number(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      return reactionsService.getTopReactions(input.conversationId, input.limit);
    }),
});

// Search routes - full-text search and filtering
export const searchRouter = router({
  searchMessages: protectedProcedure
    .input(z.object({ conversationId: z.number(), query: z.string(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      return searchService.searchMessages(input.conversationId, input.query, input.limit);
    }),
  searchConversations: protectedProcedure
    .input(z.object({ query: z.string(), limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      return searchService.searchConversations(ctx.user.id, input.query, input.limit);
    }),
  filterByDateRange: protectedProcedure
    .input(z.object({ conversationId: z.number(), startDate: z.date(), endDate: z.date() }))
    .query(async ({ input }) => {
      return searchService.filterByDateRange(input.conversationId, input.startDate, input.endDate);
    }),
  filterByMessageType: protectedProcedure
    .input(z.object({ conversationId: z.number(), messageType: z.string() }))
    .query(async ({ input }) => {
      return searchService.filterByMessageType(input.conversationId, input.messageType);
    }),
  getSearchStats: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input }) => {
      return searchService.getSearchStats(input.conversationId);
    }),
  rebuildSearchIndex: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ input }) => {
      return searchService.rebuildSearchIndex(input.conversationId);
    }),
});

// Archiving routes - archive and restore conversations
export const archivingRouter = router({
  archiveConversation: protectedProcedure
    .input(z.object({ conversationId: z.number(), reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      return archivingService.archiveConversation(input.conversationId, ctx.user.id, input.reason);
    }),
  restoreConversation: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ input }) => {
      return archivingService.restoreConversation(input.conversationId);
    }),
  isConversationArchived: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input }) => {
      return archivingService.isConversationArchived(input.conversationId);
    }),
  getArchivedConversations: protectedProcedure.query(async ({ ctx }) => {
    return archivingService.getArchivedConversations(ctx.user.id);
  }),
  getArchiveHistory: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input }) => {
      return archivingService.getArchiveHistory(input.conversationId);
    }),
  getArchiveStats: protectedProcedure.query(async ({ ctx }) => {
    return archivingService.getArchiveStats(ctx.user.id);
  }),
  bulkArchiveConversations: protectedProcedure
    .input(z.object({ conversationIds: z.array(z.number()) }))
    .mutation(async ({ ctx, input }) => {
      return archivingService.bulkArchiveConversations(input.conversationIds, ctx.user.id);
    }),
  bulkRestoreConversations: protectedProcedure
    .input(z.object({ conversationIds: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      return archivingService.bulkRestoreConversations(input.conversationIds);
    }),

  // Webhook routes
  webhooks: router({
    register: protectedProcedure
      .input(z.object({
        url: z.string().url(),
        events: z.array(z.string()),
      }))
      .mutation(async ({ input }) => {
        return webhookService.registerEndpoint(input.url, input.events);
      }),

    list: protectedProcedure.query(async () => {
      return webhookService.listEndpoints();
    }),

    get: protectedProcedure
      .input(z.object({ endpointId: z.string() }))
      .query(async ({ input }) => {
        return webhookService.getEndpoint(input.endpointId);
      }),

    update: protectedProcedure
      .input(z.object({
        endpointId: z.string(),
        url: z.string().url().optional(),
        events: z.array(z.string()).optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { endpointId, ...updates } = input;
        return webhookService.updateEndpoint(endpointId, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ endpointId: z.string() }))
      .mutation(async ({ input }) => {
        return webhookService.deleteEndpoint(input.endpointId);
      }),

    test: protectedProcedure
      .input(z.object({ endpointId: z.string() }))
      .mutation(async ({ input }) => {
        return webhookService.testWebhook(input.endpointId);
      }),

    getStats: protectedProcedure.query(async () => {
      return webhookService.getStats();
    }),

    getDeliveryHistory: protectedProcedure
      .input(z.object({
        endpointId: z.string().optional(),
        limit: z.number().default(100),
      }))
      .query(async ({ input }) => {
        return webhookService.getDeliveryHistory(input.endpointId, input.limit);
      }),
  }),

  // Audit routes
  audit: router({
    getLogs: protectedProcedure
      .input(z.object({
        userId: z.string().optional(),
        action: z.string().optional(),
        resource: z.string().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
        limit: z.number().default(100),
      }))
      .query(async ({ input }) => {
        return auditService.getLogs(input);
      }),

    getUserActivity: protectedProcedure
      .input(z.object({
        userId: z.string(),
        days: z.number().default(30),
      }))
      .query(async ({ input }) => {
        return auditService.getUserActivity(input.userId, input.days);
      }),

    detectSuspicious: protectedProcedure.query(async () => {
      return auditService.detectSuspiciousActivity();
    }),

    generateReport: protectedProcedure
      .input(z.object({
        type: z.string(),
        dateFrom: z.date(),
        dateTo: z.date(),
      }))
      .mutation(async ({ input }) => {
        return auditService.generateComplianceReport(input.type, input.dateFrom, input.dateTo);
      }),

    getReports: protectedProcedure.query(async () => {
      return auditService.getComplianceReports();
    }),

    exportLogs: protectedProcedure
      .input(z.object({
        format: z.enum(["csv", "json"]),
        userId: z.string().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      }))
      .query(async ({ input }) => {
        return auditService.exportLogs(input.format, input);
      }),

    getStats: protectedProcedure.query(async () => {
      return auditService.getStats();
    }),
  }),

  // Two-Factor Authentication routes
  twofa: router({
    enable: protectedProcedure
      .input(z.object({
        method: z.enum(["totp", "sms", "both"]),
        phoneNumber: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return twoFAService.enable(String(ctx.user.id), input.method, input.phoneNumber);
      }),

    disable: protectedProcedure.mutation(async ({ ctx }) => {
      return twoFAService.disable(String(ctx.user.id));
    }),

    getConfig: protectedProcedure.query(async ({ ctx }) => {
      return twoFAService.getConfig(String(ctx.user.id));
    }),

    createChallenge: protectedProcedure
      .input(z.object({ method: z.enum(["totp", "sms"]) }))
      .mutation(async ({ ctx, input }) => {
        return twoFAService.createChallenge(String(ctx.user.id), input.method);
      }),

    verifyCode: protectedProcedure
      .input(z.object({
        challengeId: z.string(),
        code: z.string(),
      }))
      .mutation(async ({ input }) => {
        return twoFAService.verifyCode(input.challengeId, input.code);
      }),

    verifyBackupCode: protectedProcedure
      .input(z.object({ code: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return twoFAService.verifyBackupCode(String(ctx.user.id), input.code);
      }),

    getBackupCodes: protectedProcedure.query(async ({ ctx }) => {
      return twoFAService.getBackupCodes(String(ctx.user.id));
    }),

    regenerateBackupCodes: protectedProcedure.mutation(async ({ ctx }) => {
      return twoFAService.regenerateBackupCodes(String(ctx.user.id));
    }),

    getStats: protectedProcedure.query(async () => {
      return twoFAService.getStats();
    }),
  }),
});
