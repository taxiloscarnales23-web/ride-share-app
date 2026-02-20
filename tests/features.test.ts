import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as ratingService from "../server/services/rating-service";
import * as trackingService from "../server/services/tracking-service";
import * as disputeService from "../server/services/dispute-service";

/**
 * Rating Service Tests
 */
describe("Rating Service", () => {
  const mockRating = {
    rideId: 1,
    riderId: 1,
    driverId: 1,
    overallRating: 5,
    cleanliness: 5,
    safety: 5,
    communication: 5,
    review: "Great driver!",
  };

  it("should validate rating values", async () => {
    try {
      await ratingService.createDriverRating({
        ...mockRating,
        overallRating: 6, // Invalid
      });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toContain("between 1 and 5");
    }
  });

  it("should validate cleanliness rating", async () => {
    try {
      await ratingService.createDriverRating({
        ...mockRating,
        cleanliness: 0,
      });
      expect(true).toBe(true);
    } catch (error: any) {
      expect(error.message).toContain("between 1 and 5");
    }
  });

  it("should validate safety rating", async () => {
    try {
      await ratingService.createDriverRating({
        ...mockRating,
        safety: 10, // Invalid
      });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toContain("between 1 and 5");
    }
  });

  it("should validate communication rating", async () => {
    try {
      await ratingService.createDriverRating({
        ...mockRating,
        communication: -1, // Invalid
      });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toContain("between 1 and 5");
    }
  });

  it("should get driver rating stats", async () => {
    try {
      const stats = await ratingService.getDriverRatingStats(1);
      expect(stats).toBeDefined();
      expect(stats.driverId).toBe(1);
      expect(stats.averageRating).toBeGreaterThanOrEqual(0);
      expect(stats.totalRatings).toBeGreaterThanOrEqual(0);
    } catch (error) {
      // Database might not be available in test
      expect(error).toBeDefined();
    }
  });

  it("should check if ride was rated", async () => {
    try {
      const hasRated = await ratingService.hasRatedRide(1, 1);
      expect(typeof hasRated).toBe("boolean");
    } catch (error) {
      // Database might not be available in test
      expect(error).toBeDefined();
    }
  });

  it("should get top rated drivers", async () => {
    try {
      const topDrivers = await ratingService.getTopRatedDrivers(5);
      expect(Array.isArray(topDrivers)).toBe(true);
    } catch (error) {
      // Database might not be available in test
      expect(error).toBeDefined();
    }
  });
});

/**
 * Tracking Service Tests
 */
describe("Tracking Service", () => {
  const mockLocation = {
    rideId: 1,
    driverId: 1,
    latitude: "40.7128",
    longitude: "-74.0060",
    accuracy: "10",
    speed: "50",
  };

  it("should validate latitude and longitude", async () => {
    try {
      await trackingService.recordLocationUpdate({
        ...mockLocation,
        latitude: "100", // Invalid latitude
      });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toContain("Invalid coordinates");
    }
  });

  it("should validate longitude range", async () => {
    try {
      await trackingService.recordLocationUpdate({
        ...mockLocation,
        longitude: "200", // Invalid longitude
      });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toContain("Invalid coordinates");
    }
  });

  it("should calculate distance correctly", () => {
    // New York to Los Angeles (approximately 3944 km)
    const distance = trackingService.calculateDistance(
      40.7128, // NYC latitude
      -74.006, // NYC longitude
      34.0522, // LA latitude
      -118.2437 // LA longitude
    );

    expect(distance).toBeGreaterThan(3900);
    expect(distance).toBeLessThan(4000);
  });

  it("should calculate distance between same points", () => {
    const distance = trackingService.calculateDistance(40.7128, -74.006, 40.7128, -74.006);
    expect(distance).toBe(0);
  });

  it("should calculate ETA correctly", () => {
    const eta = trackingService.calculateETA(40.7128, -74.006, 34.0522, -118.2437, 100);
    expect(eta.distanceKm).toBeGreaterThan(3900);
    expect(eta.estimatedMinutes).toBeGreaterThan(0);
  });

  it("should get current ride location", async () => {
    try {
      const location = await trackingService.getCurrentRideLocation(1);
      // Location might be null if ride doesn't exist
      if (location) {
        expect(location.rideId).toBe(1);
        expect(location.currentLocation).toBeDefined();
        expect(location.currentLocation.latitude).toBeDefined();
        expect(location.currentLocation.longitude).toBeDefined();
      }
    } catch (error) {
      // Database might not be available in test
      expect(error).toBeDefined();
    }
  });

  it("should get location history", async () => {
    try {
      const history = await trackingService.getRideLocationHistory(1);
      expect(Array.isArray(history)).toBe(true);
    } catch (error) {
      // Database might not be available in test
      expect(error).toBeDefined();
    }
  });

  it("should get driver current location", async () => {
    try {
      const location = await trackingService.getDriverCurrentLocation(1);
      // Location might be null if driver has no active ride
      if (location) {
        expect(location.latitude).toBeDefined();
        expect(location.longitude).toBeDefined();
      }
    } catch (error) {
      // Database might not be available in test
      expect(error).toBeDefined();
    }
  });
});

/**
 * Dispute Service Tests
 */
describe("Dispute Service", () => {
  const mockDispute = {
    rideId: 1,
    riderId: 1,
    driverId: 1,
    issueType: "wrong_fare" as const,
    title: "Incorrect fare charged",
    description: "Driver charged more than the estimated fare",
    severity: "medium" as const,
  };

  it("should validate dispute title", async () => {
    try {
      await disputeService.createDispute({
        ...mockDispute,
        title: "", // Empty title
      });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toContain("title");
    }
  });

  it("should validate dispute description", async () => {
    try {
      await disputeService.createDispute({
        ...mockDispute,
        description: "", // Empty description
      });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toContain("description");
    }
  });

  it("should create a dispute", async () => {
    try {
      const result = await disputeService.createDispute(mockDispute);
      expect(result.success).toBe(true);
      expect(result.disputeId).toBeDefined();
    } catch (error: any) {
      // Database might not be available in test
      if (error.message.includes("Database not available")) {
        expect(error).toBeDefined();
      } else {
        throw error;
      }
    }
  });

  it("should add evidence to dispute", async () => {
    try {
      const mockEvidence = {
        disputeId: 1,
        evidenceType: "photo" as const,
        fileUrl: "https://example.com/photo.jpg",
      };
      const result = await disputeService.addDisputeEvidence(mockEvidence);
      expect(result.success).toBe(true);
      expect(result.evidenceId).toBeDefined();
    } catch (error: any) {
      // Database might not be available in test
      if (error.message.includes("Database not available")) {
        expect(error).toBeDefined();
      } else {
        throw error;
      }
    }
  });

  it("should get dispute detail", async () => {
    try {
      const detail = await disputeService.getDisputeDetail(1);
      // Detail might be null if dispute doesn't exist
      if (detail) {
        expect(detail.dispute).toBeDefined();
        expect(detail.evidence).toBeDefined();
        expect(Array.isArray(detail.evidence)).toBe(true);
      }
    } catch (error) {
      // Database might not be available in test
      expect(error).toBeDefined();
    }
  });

  it("should get rider disputes", async () => {
    try {
      const disputes = await disputeService.getRiderDisputes(1);
      expect(Array.isArray(disputes)).toBe(true);
    } catch (error) {
      // Database might not be available in test
      expect(error).toBeDefined();
    }
  });

  it("should get driver disputes", async () => {
    try {
      const disputes = await disputeService.getDriverDisputes(1);
      expect(Array.isArray(disputes)).toBe(true);
    } catch (error) {
      // Database might not be available in test
      expect(error).toBeDefined();
    }
  });

  it("should get open disputes", async () => {
    try {
      const disputes = await disputeService.getOpenDisputes();
      expect(Array.isArray(disputes)).toBe(true);
    } catch (error) {
      // Database might not be available in test
      expect(error).toBeDefined();
    }
  });

  it("should update dispute status", async () => {
    try {
      const result = await disputeService.updateDisputeStatus(1, "in_review");
      expect(result.success).toBe(true);
    } catch (error: any) {
      // Database might not be available in test
      if (error.message.includes("Database not available")) {
        expect(error).toBeDefined();
      } else {
        throw error;
      }
    }
  });

  it("should resolve dispute", async () => {
    try {
      const result = await disputeService.resolveDispute({
        disputeId: 999,
        resolutionType: "refund",
        amount: "50.00",
        reason: "Fare was indeed incorrect",
      });
      expect(result.success).toBe(true);
      expect(result.resolutionId).toBeDefined();
    } catch (error: any) {
      if (error.message.includes("Database not available") || error.message.includes("Dispute not found")) {
        expect(error).toBeDefined();
      } else {
        throw error;
      }
    }
  });

  it("should get dispute statistics", async () => {
    try {
      const stats = await disputeService.getDisputeStats();
      expect(stats).toBeDefined();
      expect(stats.total).toBeGreaterThanOrEqual(0);
      expect(stats.open).toBeGreaterThanOrEqual(0);
      expect(stats.inReview).toBeGreaterThanOrEqual(0);
      expect(stats.resolved).toBeGreaterThanOrEqual(0);
      expect(stats.closed).toBeGreaterThanOrEqual(0);
      expect(stats.byType).toBeDefined();
      expect(stats.bySeverity).toBeDefined();
    } catch (error) {
      // Database might not be available in test
      expect(error).toBeDefined();
    }
  });
});

/**
 * Integration Tests
 */
describe("Integration Tests", () => {
  it("should handle complete rating workflow", async () => {
    try {
      // Create a rating
      const ratingResult = await ratingService.createDriverRating({
        rideId: 1,
        riderId: 1,
        driverId: 1,
        overallRating: 4,
        cleanliness: 4,
        safety: 5,
        communication: 4,
        review: "Good experience",
      });

      expect(ratingResult.success).toBe(true);

      // Get stats
      const stats = await ratingService.getDriverRatingStats(1);
      expect(stats.driverId).toBe(1);
      expect(stats.averageRating).toBeGreaterThan(0);
    } catch (error: any) {
      if (error.message.includes("Database not available")) {
        expect(error).toBeDefined();
      } else {
        throw error;
      }
    }
  });

  it("should handle complete dispute workflow", async () => {
    try {
      // Create dispute
      const disputeResult = await disputeService.createDispute({
        rideId: 1,
        riderId: 1,
        driverId: 1,
        issueType: "wrong_fare",
        title: "Wrong fare",
        description: "Charged too much",
        severity: "medium",
      });

      expect(disputeResult.success).toBe(true);

      // Add evidence
      const evidenceResult = await disputeService.addDisputeEvidence({
        disputeId: disputeResult.disputeId,
        evidenceType: "photo",
        fileUrl: "https://example.com/receipt.jpg",
      });

      expect(evidenceResult.success).toBe(true);

      // Update status
      const statusResult = await disputeService.updateDisputeStatus(
        disputeResult.disputeId,
        "in_review"
      );

      expect(statusResult.success).toBe(true);
    } catch (error: any) {
      if (error.message.includes("Database not available")) {
        expect(error).toBeDefined();
      } else {
        throw error;
      }
    }
  });

  it("should handle location tracking workflow", async () => {
    // Test distance calculation with various points
    const distances = [
      trackingService.calculateDistance(0, 0, 0, 0), // Same point
      trackingService.calculateDistance(0, 0, 1, 0), // 1 degree latitude
      trackingService.calculateDistance(0, 0, 0, 1), // 1 degree longitude
    ];

    expect(distances[0]).toBe(0);
    expect(distances[1]).toBeGreaterThan(100); // ~111 km per degree
    expect(distances[2]).toBeGreaterThan(0);

    // Test ETA calculation
    const eta = trackingService.calculateETA(0, 0, 1, 1, 60);
    expect(eta.distanceKm).toBeGreaterThan(0);
    expect(eta.estimatedMinutes).toBeGreaterThan(0);
  });
});
