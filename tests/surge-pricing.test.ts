import { describe, it, expect } from "vitest";
import {
  calculateSurgePricing,
  getSurgeZones,
  predictSurgePricing,
  calculateDriverIncentive,
  estimateDemandElasticity,
} from "../server/surge-pricing";

describe("Surge Pricing System", () => {
  describe("calculateSurgePricing", () => {
    it("should return 1x multiplier during normal conditions", () => {
      const result = calculateSurgePricing({
        basePrice: 10,
        rideRequests: 10,
        availableDrivers: 10,
        timeOfDay: 14, // 2pm
        dayOfWeek: 3, // Wednesday
      });

      expect(result.multiplier).toBe(1.0);
      expect(result.surgePrice).toBe(10);
    });

    it("should apply demand factor for high demand", () => {
      const result = calculateSurgePricing({
        basePrice: 10,
        rideRequests: 30,
        availableDrivers: 10,
        timeOfDay: 14,
        dayOfWeek: 3,
      });

      expect(result.multiplier).toBeGreaterThan(1.0);
      expect(result.surgePrice).toBeGreaterThan(10);
    });

    it("should apply peak hour multiplier for morning rush", () => {
      const result = calculateSurgePricing({
        basePrice: 10,
        rideRequests: 10,
        availableDrivers: 10,
        timeOfDay: 8, // 8am (morning rush)
        dayOfWeek: 3,
      });

      expect(result.multiplier).toBeGreaterThan(1.0);
    });

    it("should apply peak hour multiplier for evening rush", () => {
      const result = calculateSurgePricing({
        basePrice: 10,
        rideRequests: 10,
        availableDrivers: 10,
        timeOfDay: 18, // 6pm (evening rush)
        dayOfWeek: 3,
      });

      expect(result.multiplier).toBeGreaterThan(1.0);
    });

    it("should apply weekend multiplier", () => {
      const weekdayResult = calculateSurgePricing({
        basePrice: 10,
        rideRequests: 10,
        availableDrivers: 10,
        timeOfDay: 14,
        dayOfWeek: 3, // Wednesday
      });

      const weekendResult = calculateSurgePricing({
        basePrice: 10,
        rideRequests: 10,
        availableDrivers: 10,
        timeOfDay: 14,
        dayOfWeek: 6, // Saturday
      });

      expect(weekendResult.multiplier).toBeGreaterThan(weekdayResult.multiplier);
    });

    it("should apply weather factor for rain", () => {
      const clearResult = calculateSurgePricing({
        basePrice: 10,
        rideRequests: 10,
        availableDrivers: 10,
        timeOfDay: 14,
        dayOfWeek: 3,
        weatherCondition: "clear",
      });

      const rainResult = calculateSurgePricing({
        basePrice: 10,
        rideRequests: 10,
        availableDrivers: 10,
        timeOfDay: 14,
        dayOfWeek: 3,
        weatherCondition: "rain",
      });

      expect(rainResult.multiplier).toBeGreaterThan(clearResult.multiplier);
    });

    it("should apply weather factor for snow", () => {
      const rainResult = calculateSurgePricing({
        basePrice: 10,
        rideRequests: 10,
        availableDrivers: 10,
        timeOfDay: 14,
        dayOfWeek: 3,
        weatherCondition: "rain",
      });

      const snowResult = calculateSurgePricing({
        basePrice: 10,
        rideRequests: 10,
        availableDrivers: 10,
        timeOfDay: 14,
        dayOfWeek: 3,
        weatherCondition: "snow",
      });

      expect(snowResult.multiplier).toBeGreaterThan(rainResult.multiplier);
    });

    it("should apply special event factor", () => {
      const normalResult = calculateSurgePricing({
        basePrice: 10,
        rideRequests: 10,
        availableDrivers: 10,
        timeOfDay: 14,
        dayOfWeek: 3,
        specialEvent: false,
      });

      const eventResult = calculateSurgePricing({
        basePrice: 10,
        rideRequests: 10,
        availableDrivers: 10,
        timeOfDay: 14,
        dayOfWeek: 3,
        specialEvent: true,
      });

      expect(eventResult.multiplier).toBeGreaterThan(normalResult.multiplier);
    });

    it("should cap multiplier at 3x maximum", () => {
      const result = calculateSurgePricing({
        basePrice: 10,
        rideRequests: 1000,
        availableDrivers: 1,
        timeOfDay: 18,
        dayOfWeek: 6,
        weatherCondition: "snow",
        specialEvent: true,
      });

      expect(result.multiplier).toBeLessThanOrEqual(3.0);
    });

    it("should maintain minimum 1x multiplier", () => {
      const result = calculateSurgePricing({
        basePrice: 10,
        rideRequests: 1,
        availableDrivers: 100,
        timeOfDay: 3, // 3am (low demand)
        dayOfWeek: 3,
        weatherCondition: "clear",
      });

      expect(result.multiplier).toBeGreaterThanOrEqual(1.0);
    });
  });

  describe("getSurgeZones", () => {
    it("should return surge zones with multipliers", () => {
      const cityData = [
        {
          areaId: "downtown",
          areaName: "Downtown",
          centerLat: 40.7128,
          centerLng: -74.006,
          radius: 2,
          rideRequests: 100,
          availableDrivers: 20,
        },
        {
          areaId: "airport",
          areaName: "Airport",
          centerLat: 40.6413,
          centerLng: -73.7781,
          radius: 3,
          rideRequests: 50,
          availableDrivers: 30,
        },
      ];

      const zones = getSurgeZones(cityData);

      expect(zones).toHaveLength(2);
      expect(zones[0].id).toBe("downtown");
      expect(zones[0].multiplier).toBeGreaterThan(0);
    });

    it("should identify high-surge zones", () => {
      const cityData = [
        {
          areaId: "downtown",
          areaName: "Downtown",
          centerLat: 40.7128,
          centerLng: -74.006,
          radius: 2,
          rideRequests: 200,
          availableDrivers: 5,
        },
      ];

      const zones = getSurgeZones(cityData);

      expect(zones[0].multiplier).toBeGreaterThan(1.5);
    });
  });

  describe("predictSurgePricing", () => {
    it("should predict surge pricing for next hour", () => {
      const currentTime = new Date();
      const historicalData = [
        { hour: 0, avgMultiplier: 1.2, avgDemand: 50 },
        { hour: 1, avgMultiplier: 1.1, avgDemand: 40 },
        { hour: 8, avgMultiplier: 1.4, avgDemand: 150 },
        { hour: 18, avgMultiplier: 1.6, avgDemand: 200 },
      ];

      const predicted = predictSurgePricing(currentTime, historicalData);

      expect(predicted).toBeGreaterThanOrEqual(1.0);
      expect(predicted).toBeLessThanOrEqual(3.0);
    });

    it("should return 1.0 if no historical data available", () => {
      const currentTime = new Date();
      const historicalData: Array<{
        hour: number;
        avgMultiplier: number;
        avgDemand: number;
      }> = [];

      const predicted = predictSurgePricing(currentTime, historicalData);

      expect(predicted).toBe(1.0);
    });
  });

  describe("calculateDriverIncentive", () => {
    it("should recommend no action when supply is balanced", () => {
      const result = calculateDriverIncentive(1.0, 50, 50);

      expect(result.incentivePercentage).toBe(0);
      expect(result.recommendedAction).toBe("No action needed");
    });

    it("should recommend low incentive for 5-10% shortage", () => {
      const result = calculateDriverIncentive(1.2, 45, 50);

      expect(result.incentivePercentage).toBe(5);
      expect(result.recommendedAction).toContain("5% bonus");
    });

    it("should recommend medium incentive for 10-20% shortage", () => {
      const result = calculateDriverIncentive(1.5, 40, 50);

      expect(result.incentivePercentage).toBe(10);
      expect(result.recommendedAction).toContain("10% bonus");
    });

    it("should recommend high incentive for 20-30% shortage", () => {
      const result = calculateDriverIncentive(2.0, 35, 50);

      expect(result.incentivePercentage).toBe(15);
      expect(result.recommendedAction).toContain("15% bonus");
    });

    it("should recommend urgent action for >30% shortage", () => {
      const result = calculateDriverIncentive(2.5, 30, 50);

      expect(result.incentivePercentage).toBe(25);
      expect(result.recommendedAction).toContain("Urgent");
    });
  });

  describe("estimateDemandElasticity", () => {
    it("should estimate demand reduction with price increase", () => {
      const result = estimateDemandElasticity(1.5, 100); // 50% price increase

      expect(result.estimatedRides).toBeLessThan(100);
      expect(result.demandReduction).toBeLessThan(0);
    });

    it("should calculate revenue impact", () => {
      const result = estimateDemandElasticity(1.5, 100);

      expect(result.revenueImpact).toBeGreaterThan(0); // Revenue increases despite lower demand
    });

    it("should show minimal impact with 1x multiplier", () => {
      const result = estimateDemandElasticity(1.0, 100);

      expect(result.estimatedRides).toBe(100);
      expect(result.demandReduction).toBeCloseTo(0, 1);
      expect(result.revenueImpact).toBeCloseTo(0, 1);
    });

    it("should show higher impact with 3x multiplier", () => {
      const result1x = estimateDemandElasticity(1.5, 100);
      const result3x = estimateDemandElasticity(3.0, 100);

      expect(Math.abs(result3x.demandReduction)).toBeGreaterThan(
        Math.abs(result1x.demandReduction)
      );
    });
  });

  describe("Surge Pricing Scenarios", () => {
    it("should handle Friday evening rush with rain", () => {
      const result = calculateSurgePricing({
        basePrice: 10,
        rideRequests: 150,
        availableDrivers: 40,
        timeOfDay: 18,
        dayOfWeek: 5, // Friday
        weatherCondition: "rain",
      });

      expect(result.multiplier).toBeGreaterThan(1.5);
      expect(result.reason).toContain("Surge pricing");
    });

    it("should handle concert event with high demand", () => {
      const result = calculateSurgePricing({
        basePrice: 10,
        rideRequests: 300,
        availableDrivers: 50,
        timeOfDay: 22,
        dayOfWeek: 6,
        specialEvent: true,
      });

      expect(result.multiplier).toBeGreaterThan(2.0);
    });

    it("should handle late night low demand", () => {
      const result = calculateSurgePricing({
        basePrice: 10,
        rideRequests: 5,
        availableDrivers: 20,
        timeOfDay: 3,
        dayOfWeek: 3,
      });

      expect(result.multiplier).toBeLessThanOrEqual(1.3);
    });

    it("should handle emergency shortage", () => {
      const result = calculateSurgePricing({
        basePrice: 10,
        rideRequests: 200,
        availableDrivers: 0,
        timeOfDay: 18,
        dayOfWeek: 5,
      });

      expect(result.multiplier).toBe(3.0); // Maximum surge
    });
  });
});
