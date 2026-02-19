import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateDriverScore,
  calculateDriverRanking,
  identifyAtRiskDrivers,
  calculateIncentiveEligibility,
} from "../server/driver-scoring";
import {
  predictDemand,
  predictWeekDemand,
  identifyPeakPeriods,
  calculateOptimalAllocation,
  predictRevenue,
  recommendIncentives,
} from "../server/predictive-analytics";
import { MessagingService } from "../server/messaging";

describe("Driver Scoring System", () => {
  describe("calculateDriverScore", () => {
    it("should calculate score for excellent driver", () => {
      const metrics = {
        driverId: "driver1",
        totalRides: 100,
        completedRides: 99,
        cancelledRides: 1,
        averageRating: 4.9,
        totalRatings: 95,
        onTimePercentage: 98,
        cancellationRate: 0.01,
        acceptanceRate: 0.95,
        vehicleConditionRating: 4.8,
        communicationRating: 4.9,
        safetyIncidents: 0,
        documentationStatus: "verified" as const,
      };

      const score = calculateDriverScore(metrics);

      expect(score.overallScore).toBeGreaterThan(85);
      expect(score.tier).toBe("platinum");
      expect(score.recommendations.length).toBeGreaterThan(0);
    });

    it("should calculate score for new driver", () => {
      const metrics = {
        driverId: "driver2",
        totalRides: 5,
        completedRides: 5,
        cancelledRides: 0,
        averageRating: 4.5,
        totalRatings: 5,
        onTimePercentage: 90,
        cancellationRate: 0,
        acceptanceRate: 1.0,
        vehicleConditionRating: 4.0,
        communicationRating: 4.5,
        safetyIncidents: 0,
        documentationStatus: "verified" as const,
      };

      const score = calculateDriverScore(metrics);

      expect(score.overallScore).toBeGreaterThan(50);
      expect(score.badge).toContain("Rising");
    });

    it("should identify at-risk driver", () => {
      const metrics = {
        driverId: "driver3",
        totalRides: 50,
        completedRides: 35,
        cancelledRides: 15,
        averageRating: 2.5,
        totalRatings: 40,
        onTimePercentage: 60,
        cancellationRate: 0.3,
        acceptanceRate: 0.5,
        vehicleConditionRating: 2.0,
        communicationRating: 2.5,
        safetyIncidents: 2,
        documentationStatus: "verified" as const,
      };

      const score = calculateDriverScore(metrics);

      expect(score.overallScore).toBeLessThan(75);
      expect(score.tier).toBe("bronze");
      expect(score.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe("calculateDriverRanking", () => {
    it("should rank drivers correctly", () => {
      const scores = [
        {
          driverId: "driver1",
          overallScore: 95,
          scoreBreakdown: {
            rideQuality: 95,
            reliability: 95,
            safety: 95,
            communication: 95,
            documentation: 100,
          },
          tier: "platinum" as const,
          recommendations: [],
        },
        {
          driverId: "driver2",
          overallScore: 75,
          scoreBreakdown: {
            rideQuality: 75,
            reliability: 75,
            safety: 75,
            communication: 75,
            documentation: 75,
          },
          tier: "silver" as const,
          recommendations: [],
        },
        {
          driverId: "driver3",
          overallScore: 85,
          scoreBreakdown: {
            rideQuality: 85,
            reliability: 85,
            safety: 85,
            communication: 85,
            documentation: 85,
          },
          tier: "gold" as const,
          recommendations: [],
        },
      ];

      const ranking1 = calculateDriverRanking(scores, "driver1");
      const ranking2 = calculateDriverRanking(scores, "driver2");
      const ranking3 = calculateDriverRanking(scores, "driver3");

      expect(ranking1.rank).toBe(1);
      expect(ranking3.rank).toBe(2);
      expect(ranking2.rank).toBe(3);
    });
  });

  describe("identifyAtRiskDrivers", () => {
    it("should identify drivers needing intervention", () => {
      const scores = [
        {
          driverId: "driver1",
          overallScore: 95,
          scoreBreakdown: {
            rideQuality: 95,
            reliability: 95,
            safety: 95,
            communication: 95,
            documentation: 100,
          },
          tier: "platinum" as const,
          recommendations: [],
        },
        {
          driverId: "driver2",
          overallScore: 45,
          scoreBreakdown: {
            rideQuality: 45,
            reliability: 45,
            safety: 40,
            communication: 45,
            documentation: 50,
          },
          tier: "bronze" as const,
          recommendations: [],
        },
      ];

      const atRisk = identifyAtRiskDrivers(scores);

      expect(atRisk.length).toBe(1);
      expect(atRisk[0].driverId).toBe("driver2");
    });
  });
});

describe("Predictive Analytics", () => {
  describe("predictDemand", () => {
    it("should predict demand for peak hour", () => {
      const historicalData = [
        {
          timestamp: new Date("2026-02-10 08:00"),
          hour: 8,
          dayOfWeek: 3,
          rideRequests: 150,
          availableDrivers: 50,
          avgRidePrice: 15,
          weather: "clear",
        },
        {
          timestamp: new Date("2026-02-11 08:00"),
          hour: 8,
          dayOfWeek: 3,
          rideRequests: 160,
          availableDrivers: 55,
          avgRidePrice: 15,
          weather: "clear",
        },
      ];

      const forecast = predictDemand(
        historicalData as any,
        8,
        3,
        "clear",
        false
      );

      expect(forecast.predictedRideRequests).toBeGreaterThanOrEqual(50);
      expect(forecast.suggestedPriceMultiplier).toBeGreaterThanOrEqual(0.9);
    });

    it("should apply weather impact", () => {
      const historicalData = [
        {
          timestamp: new Date("2026-02-10 14:00"),
          hour: 14,
          dayOfWeek: 3,
          rideRequests: 100,
          availableDrivers: 60,
          avgRidePrice: 15,
          weather: "clear",
        },
      ];

      const clearForecast = predictDemand(
        historicalData as any,
        14,
        3,
        "clear",
        false
      );
      const rainForecast = predictDemand(
        historicalData as any,
        14,
        3,
        "rain",
        false
      );

      expect(rainForecast.predictedRideRequests).toBeGreaterThanOrEqual(
        clearForecast.predictedRideRequests
      );
    });

    it("should apply special event impact", () => {
      const historicalData = [
        {
          timestamp: new Date("2026-02-10 20:00"),
          hour: 20,
          dayOfWeek: 6,
          rideRequests: 200,
          availableDrivers: 80,
          avgRidePrice: 15,
          weather: "clear",
        },
      ];

      const normalForecast = predictDemand(
        historicalData as any,
        20,
        6,
        "clear",
        false
      );
      const eventForecast = predictDemand(
        historicalData as any,
        20,
        6,
        "clear",
        true
      );

      expect(eventForecast.predictedRideRequests).toBeGreaterThanOrEqual(
        normalForecast.predictedRideRequests
      );
    });
  });

  describe("identifyPeakPeriods", () => {
    it("should identify peak demand periods", () => {
      const forecasts = [
        {
          timestamp: new Date(),
          predictedRideRequests: 100,
          confidence: 0.8,
          recommendedDrivers: 150,
          suggestedPriceMultiplier: 1.0,
          factors: {
            historicalTrend: 1.0,
            seasonalFactor: 1.0,
            weatherImpact: 1.0,
            eventImpact: 1.0,
          },
        },
        {
          timestamp: new Date(),
          predictedRideRequests: 200,
          confidence: 0.8,
          recommendedDrivers: 300,
          suggestedPriceMultiplier: 1.5,
          factors: {
            historicalTrend: 1.0,
            seasonalFactor: 1.5,
            weatherImpact: 1.0,
            eventImpact: 1.0,
          },
        },
      ];

      const peaks = identifyPeakPeriods(forecasts);

      expect(peaks.length).toBe(1);
      expect(peaks[0].predictedRideRequests).toBe(200);
    });
  });

  describe("calculateOptimalAllocation", () => {
    it("should allocate drivers based on demand", () => {
      const forecasts = [
        {
          timestamp: new Date("2026-02-19 08:00"),
          predictedRideRequests: 200,
          confidence: 0.8,
          recommendedDrivers: 300,
          suggestedPriceMultiplier: 1.5,
          factors: {
            historicalTrend: 1.0,
            seasonalFactor: 1.5,
            weatherImpact: 1.0,
            eventImpact: 1.0,
          },
        },
        {
          timestamp: new Date("2026-02-19 14:00"),
          predictedRideRequests: 100,
          confidence: 0.8,
          recommendedDrivers: 150,
          suggestedPriceMultiplier: 1.0,
          factors: {
            historicalTrend: 1.0,
            seasonalFactor: 1.0,
            weatherImpact: 1.0,
            eventImpact: 1.0,
          },
        },
      ];

      const allocation = calculateOptimalAllocation(forecasts, 300);

      expect(allocation.size).toBeGreaterThan(0);
      expect(allocation.get("8:00")).toBeGreaterThan(allocation.get("14:00")!);
    });
  });

  describe("predictRevenue", () => {
    it("should predict total revenue", () => {
      const forecasts = [
        {
          timestamp: new Date(),
          predictedRideRequests: 100,
          confidence: 0.8,
          recommendedDrivers: 150,
          suggestedPriceMultiplier: 1.5,
          factors: {
            historicalTrend: 1.0,
            seasonalFactor: 1.0,
            weatherImpact: 1.0,
            eventImpact: 1.0,
          },
        },
      ];

      const revenue = predictRevenue(forecasts, 15);

      expect(revenue.totalRevenue).toBeGreaterThan(0);
      expect(revenue.avgRevenuePerHour).toBeGreaterThan(0);
    });
  });

  describe("recommendIncentives", () => {
    it("should recommend incentives for high demand", () => {
      const forecasts = [
        {
          timestamp: new Date("2026-02-19 18:00"),
          predictedRideRequests: 300,
          confidence: 0.8,
          recommendedDrivers: 150,
          suggestedPriceMultiplier: 2.5,
          factors: {
            historicalTrend: 1.0,
            seasonalFactor: 1.5,
            weatherImpact: 1.0,
            eventImpact: 1.0,
          },
        },
      ];

      const incentives = recommendIncentives(forecasts);

      expect(incentives.length).toBeGreaterThan(0);
      expect(incentives[0].incentivePercentage).toBeGreaterThan(0);
    });
  });
});

describe("Messaging Service", () => {
  let messagingService: MessagingService;

  beforeEach(() => {
    messagingService = new MessagingService();
  });

  describe("createConversation", () => {
    it("should create conversation", () => {
      const conversation = messagingService.createConversation(
        "ride1",
        "rider1",
        "driver1"
      );

      expect(conversation.rideId).toBe("ride1");
      expect(conversation.riderId).toBe("rider1");
      expect(conversation.driverId).toBe("driver1");
      expect(conversation.messages.length).toBe(0);
    });
  });

  describe("sendMessage", () => {
    it("should send message", () => {
      const conversation = messagingService.createConversation(
        "ride1",
        "rider1",
        "driver1"
      );

      const message = messagingService.sendMessage(
        conversation.id,
        "rider1",
        "rider",
        "I'm ready"
      );

      expect(message.content).toBe("I'm ready");
      expect(message.senderType).toBe("rider");
      expect(message.read).toBe(false);
    });
  });

  describe("markAsRead", () => {
    it("should mark message as read", () => {
      const conversation = messagingService.createConversation(
        "ride1",
        "rider1",
        "driver1"
      );

      const message = messagingService.sendMessage(
        conversation.id,
        "rider1",
        "rider",
        "I'm ready"
      );

      messagingService.markAsRead(conversation.id, message.id, "driver1");

      const updated = messagingService.getConversation(conversation.id);
      expect(updated?.messages[0].read).toBe(true);
    });
  });

  describe("getMessageStats", () => {
    it("should calculate message statistics", () => {
      const conversation = messagingService.createConversation(
        "ride1",
        "rider1",
        "driver1"
      );

      messagingService.sendMessage(
        conversation.id,
        "rider1",
        "rider",
        "I'm ready"
      );
      messagingService.sendMessage(
        conversation.id,
        "driver1",
        "driver",
        "I'm here"
      );

      const stats = messagingService.getMessageStats(conversation.id);

      expect(stats.totalMessages).toBe(2);
      expect(stats.riderMessages).toBe(1);
      expect(stats.driverMessages).toBe(1);
    });
  });

  describe("sendLocation", () => {
    it("should send location message", () => {
      const conversation = messagingService.createConversation(
        "ride1",
        "rider1",
        "driver1"
      );

      const message = messagingService.sendLocation(
        conversation.id,
        "driver1",
        "driver",
        40.7128,
        -74.006,
        10
      );

      expect(message.attachmentType).toBe("location");
      expect(message.content).toContain("📍");
    });
  });

  describe("getQuickReplies", () => {
    it("should return rider quick replies", () => {
      const replies = messagingService.getQuickReplies("rider");

      expect(replies.length).toBeGreaterThan(0);
      expect(replies).toContain("I'm on my way");
    });

    it("should return driver quick replies", () => {
      const replies = messagingService.getQuickReplies("driver");

      expect(replies.length).toBeGreaterThan(0);
      expect(replies).toContain("I see you");
    });
  });
});
