import { describe, it, expect, beforeEach } from "vitest";
import { ApiMarketplaceService } from "../server/api-marketplace";
import { CorporateService } from "../server/corporate";
import { LoyaltyService } from "../server/loyalty";

describe("API Marketplace Service", () => {
  let marketplaceService: ApiMarketplaceService;

  beforeEach(() => {
    marketplaceService = new ApiMarketplaceService();
  });

  describe("registerDeveloper", () => {
    it("should register a new developer", () => {
      const developer = marketplaceService.registerDeveloper(
        "TechCorp",
        "dev@techcorp.com"
      );

      expect(developer?.developerId).toBeDefined();
      expect(developer?.companyName).toBe("TechCorp");
      expect(developer?.apiKey).toBeDefined();
      expect(developer?.apiSecret).toBeDefined();
      expect(developer?.status).toBe("active");
    });
  });

  describe("submitIntegration", () => {
    it("should submit integration for marketplace", () => {
      const developer = marketplaceService.registerDeveloper(
        "PaymentCorp",
        "dev@paymentcorp.com"
      );

      if (developer) {
        const integration = marketplaceService.submitIntegration(
          developer.developerId,
          "Stripe Payment Gateway",
          "Accept payments via Stripe",
          "payment",
          "https://api.stripe.com",
          "https://docs.stripe.com"
        );

        expect(integration?.name).toBe("Stripe Payment Gateway");
        expect(integration?.status).toBe("draft");
        expect(integration?.type).toBe("payment");
      }
    });
  });

  describe("publishIntegration", () => {
    it("should publish integration to marketplace", () => {
      const developer = marketplaceService.registerDeveloper(
        "NavCorp",
        "dev@navcorp.com"
      );

      if (developer) {
        const integration = marketplaceService.submitIntegration(
          developer.developerId,
          "Google Maps Navigation",
          "Turn-by-turn navigation",
          "navigation",
          "https://maps.google.com",
          "https://docs.google.com/maps"
        );

        if (integration) {
          const published = marketplaceService.publishIntegration(
            integration.integrationId
          );
          expect(published).toBe(true);
        }
      }
    });
  });

  describe("calculateEarnings", () => {
    it("should calculate developer earnings", () => {
      const developer = marketplaceService.registerDeveloper(
        "AnalyticsCorp",
        "dev@analytics.com"
      );

      if (developer) {
        marketplaceService.trackUsage(
          "int_123",
          developer.developerId,
          1000,
          150,
          0.01
        );

        const earnings = marketplaceService.calculateEarnings(
          developer.developerId,
          "daily"
        );
        expect(earnings).toBeGreaterThanOrEqual(0);
      }
    });
  });
});

describe("Corporate Service", () => {
  let corporateService: CorporateService;

  beforeEach(() => {
    corporateService = new CorporateService();
  });

  describe("createCorporateAccount", () => {
    it("should create corporate account", () => {
      const account = corporateService.createCorporateAccount(
        "Acme Corp",
        "enterprise",
        "admin@acme.com",
        "12-3456789",
        "billing@acme.com"
      );

      expect(account.companyName).toBe("Acme Corp");
      expect(account.accountType).toBe("enterprise");
      expect(account.discountRate).toBe(0.25);
      expect(account.monthlyBudget).toBe(100000);
    });
  });

  describe("addEmployee", () => {
    it("should add employee to corporate account", () => {
      const account = corporateService.createCorporateAccount(
        "TechCorp",
        "growth",
        "admin@techcorp.com",
        "98-7654321",
        "billing@techcorp.com"
      );

      const employee = corporateService.addEmployee(
        account.accountId,
        "John Doe",
        "john@techcorp.com",
        "driver"
      );

      expect(employee?.name).toBe("John Doe");
      expect(employee?.role).toBe("driver");
      expect(employee?.status).toBe("active");
    });
  });

  describe("recordCorporateRide", () => {
    it("should record corporate ride with discount", () => {
      const account = corporateService.createCorporateAccount(
        "StartupCo",
        "startup",
        "admin@startup.com",
        "11-2233445",
        "billing@startup.com"
      );

      const employee = corporateService.addEmployee(
        account.accountId,
        "Jane Smith",
        "jane@startup.com",
        "manager"
      );

      if (employee) {
        const ride = corporateService.recordCorporateRide(
          account.accountId,
          employee.employeeId,
          "123 Main St",
          "456 Oak Ave",
          100
        );

        expect(ride?.fare).toBe(100);
        expect(ride?.corporateDiscount).toBe(10); // 10% discount
        expect(ride?.finalFare).toBe(90);
      }
    });
  });

  describe("generateMonthlyBilling", () => {
    it("should generate monthly billing", () => {
      const account = corporateService.createCorporateAccount(
        "MidSizeCo",
        "growth",
        "admin@midsize.com",
        "55-6677889",
        "billing@midsize.com"
      );

      const billing = corporateService.generateMonthlyBilling(account.accountId);

      expect(billing?.accountId).toBe(account.accountId);
      expect(billing?.status).toBe("pending");
      expect(billing?.totalRides).toBe(0);
    });
  });
});

describe("Loyalty Service", () => {
  let loyaltyService: LoyaltyService;

  beforeEach(() => {
    loyaltyService = new LoyaltyService();
  });

  describe("createLoyaltyAccount", () => {
    it("should create loyalty account", () => {
      const account = loyaltyService.createLoyaltyAccount("user123");

      expect(account.userId).toBe("user123");
      expect(account.totalPoints).toBe(0);
      expect(account.currentTier).toBe("bronze");
    });
  });

  describe("addPoints", () => {
    it("should add points to loyalty account", () => {
      loyaltyService.createLoyaltyAccount("user456");
      const result = loyaltyService.addPoints(
        "user456",
        100,
        "Ride completion"
      );

      expect(result).toBe(true);

      const account = loyaltyService.getLoyaltyAccount("user456");
      expect(account?.totalPoints).toBe(100);
    });
  });

  describe("createReward", () => {
    it("should create reward offer", () => {
      const reward = loyaltyService.createReward(
        "user789",
        "discount",
        500,
        10,
        "10% off next ride",
        30
      );

      expect(reward.type).toBe("discount");
      expect(reward.pointsCost).toBe(500);
      expect(reward.value).toBe(10);
      expect(reward.isRedeemed).toBe(false);
    });
  });

  describe("redeemReward", () => {
    it("should redeem reward successfully", () => {
      loyaltyService.createLoyaltyAccount("user999");
      loyaltyService.addPoints("user999", 600, "Ride completion");

      const reward = loyaltyService.createReward(
        "user999",
        "free_ride",
        500,
        15,
        "Free ride up to $15",
        30
      );

      const redeemed = loyaltyService.redeemReward("user999", reward.rewardId);
      expect(redeemed).toBe(true);

      const account = loyaltyService.getLoyaltyAccount("user999");
      expect(account?.totalPoints).toBe(100);
      expect(account?.rewardsRedeemed).toBe(1);
    });
  });

  describe("createReferralBonus", () => {
    it("should create referral bonus", () => {
      const bonus = loyaltyService.createReferralBonus("referrer123");

      expect(bonus.referrerId).toBe("referrer123");
      expect(bonus.referralCode).toBeDefined();
      expect(bonus.status).toBe("pending");
      expect(bonus.bonusPoints).toBe(500);
    });
  });

  describe("completeReferral", () => {
    it("should complete referral and award points", () => {
      loyaltyService.createLoyaltyAccount("referrer456");
      loyaltyService.createLoyaltyAccount("referee456");

      const bonus = loyaltyService.createReferralBonus("referrer456");
      const completed = loyaltyService.completeReferral(
        bonus.bonusId,
        "referee456"
      );

      expect(completed).toBe(true);

      const referrerAccount = loyaltyService.getLoyaltyAccount("referrer456");
      const refereeAccount = loyaltyService.getLoyaltyAccount("referee456");

      expect(referrerAccount?.totalPoints).toBe(500);
      expect(refereeAccount?.totalPoints).toBe(500);
    });
  });
});
