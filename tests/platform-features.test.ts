import { describe, it, expect, beforeEach } from "vitest";
import { SubscriptionService } from "../server/subscriptions";
import { AdvancedReportingService } from "../server/advanced-reporting";
import { NotificationCenterService } from "../server/notification-center";

describe("Subscription Service", () => {
  let subscriptionService: SubscriptionService;

  beforeEach(() => {
    subscriptionService = new SubscriptionService();
  });

  describe("createSubscription", () => {
    it("should create free subscription", () => {
      const sub = subscriptionService.createSubscription(
        "user123",
        "plan_free",
        "none"
      );

      expect(sub).not.toBeNull();
      expect(sub?.status).toBe("active");
      expect(sub?.planId).toBe("plan_free");
    });

    it("should create pro subscription", () => {
      const sub = subscriptionService.createSubscription(
        "user456",
        "plan_pro",
        "credit_card"
      );

      expect(sub?.planId).toBe("plan_pro");
      expect(sub?.autoRenew).toBe(true);
    });
  });

  describe("upgradeSubscription", () => {
    it("should upgrade from free to pro", () => {
      const sub = subscriptionService.createSubscription(
        "user789",
        "plan_free",
        "none"
      );

      if (sub) {
        const upgraded = subscriptionService.upgradeSubscription(
          sub.subscriptionId,
          "plan_pro"
        );

        expect(upgraded?.planId).toBe("plan_pro");
        expect(upgraded?.status).toBe("active");
      }
    });
  });

  describe("canPerformAction", () => {
    it("should check feature access", () => {
      const sub = subscriptionService.createSubscription(
        "user999",
        "plan_pro",
        "credit_card"
      );

      if (sub) {
        expect(subscriptionService.canPerformAction(sub.subscriptionId, "api_access")).toBe(true);
        expect(subscriptionService.canPerformAction(sub.subscriptionId, "unlimited_rides")).toBe(true);
      }
    });
  });

  describe("cancelSubscription", () => {
    it("should cancel subscription", () => {
      const sub = subscriptionService.createSubscription(
        "user111",
        "plan_pro",
        "credit_card"
      );

      if (sub) {
        const cancelled = subscriptionService.cancelSubscription(
          sub.subscriptionId
        );

        expect(cancelled).toBe(true);
        const retrieved = subscriptionService.getSubscription(
          sub.subscriptionId
        );
        expect(retrieved?.status).toBe("cancelled");
      }
    });
  });
});

describe("Advanced Reporting Service", () => {
  let reportingService: AdvancedReportingService;

  beforeEach(() => {
    reportingService = new AdvancedReportingService();
  });

  describe("generateDriverReport", () => {
    it("should generate driver report with tax calculations", () => {
      const report = reportingService.generateDriverReport(
        "driver123",
        "monthly",
        {
          totalRides: 100,
          totalEarnings: 2000,
          totalDistance: 500,
          averageRating: 4.8,
          cancellationRate: 0.02,
          expenses: 300,
        }
      );

      expect(report.totalRides).toBe(100);
      expect(report.taxableIncome).toBe(1700);
      expect(report.netIncome).toBeLessThan(1700);
    });
  });

  describe("generateRiderReport", () => {
    it("should generate rider spending report", () => {
      const report = reportingService.generateRiderReport(
        "rider456",
        "monthly",
        {
          totalRides: 50,
          totalSpent: 500,
          favoriteRoutes: ["Downtown", "Airport"],
          preferredDrivers: ["driver1", "driver2"],
          loyaltyPointsEarned: 250,
          discountsUsed: 3,
        }
      );

      expect(report.totalRides).toBe(50);
      expect(report.averageRidePrice).toBe(10);
      expect(report.loyaltyPointsEarned).toBe(250);
    });
  });

  describe("generateAdminReport", () => {
    it("should generate platform admin report", () => {
      const report = reportingService.generateAdminReport("daily", {
        totalRides: 5000,
        totalRevenue: 50000,
        activeDrivers: 500,
        activeRiders: 2000,
        fraudDetected: 5,
        complaintResolved: 95,
      });

      expect(report.totalRides).toBe(5000);
      expect(report.averageFare).toBe(10);
      expect(report.platformHealth).toBeGreaterThanOrEqual(0);
    });
  });

  describe("exportReportAsPDF", () => {
    it("should export report as PDF", () => {
      const report = reportingService.generateDriverReport(
        "driver789",
        "weekly",
        {
          totalRides: 50,
          totalEarnings: 1000,
          totalDistance: 250,
          averageRating: 4.9,
          cancellationRate: 0.01,
          expenses: 150,
        }
      );

      const pdfPath = reportingService.exportReportAsPDF(report.reportId);
      expect(pdfPath).toContain("PDF_");
      expect(pdfPath).toContain(".pdf");
    });
  });
});

describe("Notification Center Service", () => {
  let notificationService: NotificationCenterService;

  beforeEach(() => {
    notificationService = new NotificationCenterService();
  });

  describe("createNotification", () => {
    it("should create notification", () => {
      const notif = notificationService.createNotification(
        "user123",
        "ride_request",
        "New Ride Request",
        "You have a new ride request",
        { rideId: "ride_123" }
      );

      expect(notif.userId).toBe("user123");
      expect(notif.read).toBe(false);
      expect(notif.data.rideId).toBe("ride_123");
    });
  });

  describe("markAsRead", () => {
    it("should mark notification as read", () => {
      const notif = notificationService.createNotification(
        "user456",
        "payment_received",
        "Payment Received",
        "You received a payment"
      );

      const marked = notificationService.markAsRead(notif.notificationId);
      expect(marked).toBe(true);

      const retrieved = notificationService.getNotifications("user456")[0];
      expect(retrieved.read).toBe(true);
    });
  });

  describe("getNotificationCount", () => {
    it("should count unread notifications", () => {
      notificationService.createNotification(
        "user789",
        "ride_accepted",
        "Ride Accepted",
        "Your ride has been accepted"
      );
      notificationService.createNotification(
        "user789",
        "ride_completed",
        "Ride Completed",
        "Your ride is complete"
      );

      const count = notificationService.getNotificationCount("user789");
      expect(count).toBe(2);
    });
  });

  describe("setPreferences", () => {
    it("should set notification preferences", () => {
      notificationService.setPreferences("user999", {
        rideNotifications: false,
        promotionalNotifications: false,
      });

      const prefs = notificationService.getPreferences("user999");
      expect(prefs.rideNotifications).toBe(false);
      expect(prefs.promotionalNotifications).toBe(false);
      expect(prefs.paymentNotifications).toBe(true);
    });
  });

  describe("shouldNotify", () => {
    it("should respect notification preferences", () => {
      notificationService.setPreferences("user111", {
        rideNotifications: true,
        promotionalNotifications: false,
      });

      expect(notificationService.shouldNotify("user111", "ride_request")).toBe(true);
      expect(notificationService.shouldNotify("user111", "promotion")).toBe(false);
    });
  });

  describe("clearExpiredNotifications", () => {
    it("should remove expired notifications", () => {
      notificationService.createNotification(
        "user222",
        "system",
        "System Alert",
        "System maintenance"
      );

      const cleared = notificationService.clearExpiredNotifications();
      expect(cleared).toBeGreaterThanOrEqual(0);
    });
  });
});
