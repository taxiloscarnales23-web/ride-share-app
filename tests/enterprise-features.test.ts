import { describe, it, expect, beforeEach } from "vitest";
import { WhiteLabelService } from "../server/white-label";
import { InsuranceService } from "../server/insurance";
import { TrainingService } from "../server/training";

describe("White-Label Service", () => {
  let whiteLabelService: WhiteLabelService;

  beforeEach(() => {
    whiteLabelService = new WhiteLabelService();
  });

  describe("registerPartner", () => {
    it("should register a new white-label partner", () => {
      const partner = whiteLabelService.registerPartner({
        partnerName: "TechRides",
        logo: "https://example.com/logo.png",
        primaryColor: "#FF6B6B",
        secondaryColor: "#4ECDC4",
        customDomain: "techrides.com",
        supportEmail: "support@techrides.com",
        supportPhone: "+1-800-TECH-RIDE",
      });

      expect(partner.partnerId).toBeDefined();
      expect(partner.partnerName).toBe("TechRides");
      expect(partner.apiKey).toBeDefined();
      expect(partner.apiSecret).toBeDefined();
      expect(partner.isActive).toBe(true);
    });
  });

  describe("getPartnerBranding", () => {
    it("should retrieve partner branding configuration", () => {
      const partner = whiteLabelService.registerPartner({
        partnerName: "CityRides",
        logo: "https://example.com/logo.png",
        primaryColor: "#FF6B6B",
        secondaryColor: "#4ECDC4",
        customDomain: "cityrides.com",
        supportEmail: "support@cityrides.com",
        supportPhone: "+1-800-CITY-RIDE",
      });

      const branding = whiteLabelService.getPartnerBranding(partner.partnerId);
      expect(branding?.partnerName).toBe("CityRides");
      expect(branding?.primaryColor).toBe("#FF6B6B");
    });
  });

  describe("validateApiCredentials", () => {
    it("should validate partner API credentials", () => {
      const partner = whiteLabelService.registerPartner({
        partnerName: "QuickRides",
        logo: "https://example.com/logo.png",
        primaryColor: "#FF6B6B",
        secondaryColor: "#4ECDC4",
        customDomain: "quickrides.com",
        supportEmail: "support@quickrides.com",
        supportPhone: "+1-800-QUICK-RIDE",
      });

      const validatedPartnerId = whiteLabelService.validateApiCredentials(
        partner.apiKey,
        partner.apiSecret
      );
      expect(validatedPartnerId).toBe(partner.partnerId);
    });
  });
});

describe("Insurance Service", () => {
  let insuranceService: InsuranceService;

  beforeEach(() => {
    insuranceService = new InsuranceService();
  });

  describe("getAvailablePlans", () => {
    it("should return all available insurance plans", () => {
      const plans = insuranceService.getAvailablePlans();
      expect(plans.length).toBe(3);
      expect(plans.some((p) => p.type === "basic")).toBe(true);
      expect(plans.some((p) => p.type === "premium")).toBe(true);
      expect(plans.some((p) => p.type === "comprehensive")).toBe(true);
    });
  });

  describe("subscribeToInsurance", () => {
    it("should subscribe user to insurance plan", () => {
      const subscription = insuranceService.subscribeToInsurance(
        "user123",
        "plan_basic"
      );
      expect(subscription?.userId).toBe("user123");
      expect(subscription?.status).toBe("active");
      expect(subscription?.monthlyPremium).toBe(9.99);
    });
  });

  describe("fileClaim", () => {
    it("should file an insurance claim", () => {
      insuranceService.subscribeToInsurance("user123", "plan_premium");
      const claim = insuranceService.fileClaim(
        "user123",
        "ride123",
        "Minor accident",
        "minor",
        500
      );

      expect(claim?.claimStatus).toBe("pending");
      expect(claim?.claimAmount).toBe(500);
      expect(claim?.severity).toBe("minor");
    });
  });

  describe("calculatePayout", () => {
    it("should calculate insurance payout correctly", () => {
      const subscription = insuranceService.subscribeToInsurance(
        "user123",
        "plan_premium"
      );
      const claim = insuranceService.fileClaim(
        "user123",
        "ride123",
        "Accident",
        "moderate",
        1000
      );

      if (claim) {
        insuranceService.updateClaimStatus(claim.claimId, "approved", 1000);
        const payout = insuranceService.calculatePayout(claim.claimId);
        expect(payout).toBeGreaterThan(0);
        expect(payout).toBeLessThanOrEqual(1000);
      }
    });
  });
});

describe("Training Service", () => {
  let trainingService: TrainingService;

  beforeEach(() => {
    trainingService = new TrainingService();
  });

  describe("getAvailableCourses", () => {
    it("should return all available training courses", () => {
      const courses = trainingService.getAvailableCourses();
      expect(courses.length).toBeGreaterThan(0);
      expect(courses.some((c) => c.level === "basic")).toBe(true);
      expect(courses.some((c) => c.level === "advanced")).toBe(true);
    });
  });

  describe("enrollDriver", () => {
    it("should enroll driver in training course", () => {
      const cert = trainingService.enrollDriver("driver123", "course_basic");
      expect(cert?.driverId).toBe("driver123");
      expect(cert?.status).toBe("in_progress");
    });
  });

  describe("completeModule", () => {
    it("should mark module as completed", () => {
      const course = trainingService.getCourse("course_basic");
      if (course && course.modules.length > 0) {
        trainingService.enrollDriver("driver123", "course_basic");
        const result = trainingService.completeModule(
          "driver123",
          "course_basic",
          course.modules[0].moduleId,
          95
        );
        expect(result).toBe(true);
      }
    });
  });

  describe("completeCourse", () => {
    it("should complete course and generate certificate", () => {
      trainingService.enrollDriver("driver123", "course_basic");
      const course = trainingService.getCourse("course_basic");

      if (course) {
        // Mark all modules as completed
        for (const module of course.modules) {
          trainingService.completeModule(
            "driver123",
            "course_basic",
            module.moduleId,
            90
          );
        }

        const cert = trainingService.completeCourse(
          "driver123",
          "course_basic",
          85
        );
        expect(cert?.status).toBe("completed");
        expect(cert?.score).toBe(85);
        expect(cert?.certificateUrl).toBeDefined();
      }
    });
  });

  describe("getComplianceStatus", () => {
    it("should return driver compliance status", () => {
      const status = trainingService.getComplianceStatus("driver123");
      expect(["compliant", "non_compliant", "warning"]).toContain(status);
    });
  });
});
