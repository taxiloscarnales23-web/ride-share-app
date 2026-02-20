import { describe, it, expect, beforeEach } from "vitest";
import { AuditLoggingService } from "../server/audit-logging";
import { ComplianceService } from "../server/compliance";

describe("Audit Logging Service", () => {
  let auditService: AuditLoggingService;

  beforeEach(() => {
    auditService = new AuditLoggingService();
  });

  describe("logAction", () => {
    it("should create audit log entry", () => {
      const log = auditService.logAction(
        "user123",
        "ride_created",
        "ride",
        "ride_456",
        { pickupLocation: "Downtown", dropoffLocation: "Airport" },
        "192.168.1.1",
        "Mozilla/5.0",
        "success"
      );

      expect(log.userId).toBe("user123");
      expect(log.action).toBe("ride_created");
      expect(log.status).toBe("success");
      expect(log.logId).toContain("audit_");
    });

    it("should log failed actions with error message", () => {
      const log = auditService.logAction(
        "user789",
        "payment_recorded",
        "payment",
        "pay_123",
        {},
        "192.168.1.1",
        "Mozilla/5.0",
        "failure",
        "Insufficient funds"
      );

      expect(log.status).toBe("failure");
      expect(log.errorMessage).toBe("Insufficient funds");
    });

    it("should set retention expiry date", () => {
      const log = auditService.logAction(
        "user456",
        "user_created",
        "user",
        "user_789",
        { email: "test@example.com" },
        "192.168.1.1",
        "Mozilla/5.0"
      );

      const now = new Date();
      const expectedExpiry = new Date(now.getTime() + 2555 * 24 * 60 * 60 * 1000);

      expect(log.retentionExpiry.getTime()).toBeCloseTo(expectedExpiry.getTime(), -5);
    });
  });

  describe("getLogs", () => {
    beforeEach(() => {
      auditService.logAction(
        "user1",
        "ride_created",
        "ride",
        "ride_1",
        {},
        "192.168.1.1",
        "Mozilla"
      );
      auditService.logAction(
        "user2",
        "ride_completed",
        "ride",
        "ride_2",
        {},
        "192.168.1.1",
        "Mozilla"
      );
      auditService.logAction(
        "user1",
        "payment_recorded",
        "payment",
        "pay_1",
        {},
        "192.168.1.1",
        "Mozilla"
      );
    });

    it("should filter logs by userId", () => {
      const logs = auditService.getLogs({ userId: "user1" });
      expect(logs.length).toBe(2);
      expect(logs.every((l) => l.userId === "user1")).toBe(true);
    });

    it("should filter logs by action", () => {
      const logs = auditService.getLogs({ action: "ride_created" });
      expect(logs.length).toBe(1);
      expect(logs[0].action).toBe("ride_created");
    });

    it("should filter logs by resource type", () => {
      const logs = auditService.getLogs({ resourceType: "ride" });
      expect(logs.length).toBe(2);
      expect(logs.every((l) => l.resourceType === "ride")).toBe(true);
    });
  });

  describe("generateComplianceReport", () => {
    beforeEach(() => {
      auditService.logAction(
        "user1",
        "ride_created",
        "ride",
        "ride_1",
        {},
        "192.168.1.1",
        "Mozilla"
      );
      auditService.logAction(
        "user2",
        "ride_completed",
        "ride",
        "ride_2",
        {},
        "192.168.1.1",
        "Mozilla"
      );
    });

    it("should generate compliance report", () => {
      const report = auditService.generateComplianceReport("EU", "daily");

      expect(report.jurisdiction).toBe("EU");
      expect(report.period).toBe("daily");
      expect(report.totalUsers).toBeGreaterThan(0);
      expect(report.status).toBe("compliant");
    });

    it("should count rides in period", () => {
      const report = auditService.generateComplianceReport("EU", "daily");
      expect(report.totalRides).toBe(1); // Only ride_completed counts
    });
  });

  describe("handleGDPRDataRequest", () => {
    it("should create GDPR data request", () => {
      const requestId = auditService.handleGDPRDataRequest("user123");

      expect(requestId).toContain("gdpr_");

      const logs = auditService.getLogs({ userId: "user123", action: "data_export" });
      expect(logs.length).toBe(1);
      expect(logs[0].changes.gdprRequest).toBe(true);
    });
  });

  describe("handleGDPRDeletionRequest", () => {
    it("should process GDPR deletion request", () => {
      const result = auditService.handleGDPRDeletionRequest("user456");

      expect(result).toBe(true);

      const logs = auditService.getLogs({ userId: "user456", action: "account_deleted" });
      expect(logs.length).toBe(1);
      expect(logs[0].changes.gdprDeletion).toBe(true);
    });
  });

  describe("cleanupExpiredLogs", () => {
    it("should remove expired logs", () => {
      auditService.setDataRetentionDays(0); // Expire immediately

      auditService.logAction(
        "user1",
        "ride_created",
        "ride",
        "ride_1",
        {},
        "192.168.1.1",
        "Mozilla"
      );

      const cleaned = auditService.cleanupExpiredLogs();
      expect(cleaned).toBeGreaterThan(0);
    });
  });

  describe("exportAuditTrail", () => {
    it("should export audit trail", () => {
      auditService.logAction(
        "user1",
        "ride_created",
        "ride",
        "ride_1",
        {},
        "192.168.1.1",
        "Mozilla"
      );

      const exportPath = auditService.exportAuditTrail();
      expect(exportPath).toContain("audit_export_");
      expect(exportPath).toContain(".csv");
    });
  });
});

describe("Compliance Service", () => {
  let complianceService: ComplianceService;

  beforeEach(() => {
    complianceService = new ComplianceService();
  });

  describe("getRequirements", () => {
    it("should get GDPR requirements for EU", () => {
      const requirements = complianceService.getRequirements("EU");

      expect(requirements.length).toBeGreaterThan(0);
      expect(requirements.some((r) => r.requirement === "Right to Access")).toBe(true);
      expect(requirements.some((r) => r.requirement === "Right to be Forgotten")).toBe(true);
    });

    it("should get CCPA requirements for California", () => {
      const requirements = complianceService.getRequirements("US-CA");

      expect(requirements.length).toBeGreaterThan(0);
      expect(requirements.some((r) => r.requirement === "Consumer Privacy Rights")).toBe(true);
    });
  });

  describe("updateRequirementStatus", () => {
    it("should update requirement status", () => {
      const updated = complianceService.updateRequirementStatus(
        "EU",
        "gdpr_001",
        "compliant"
      );

      expect(updated).toBe(true);

      const requirements = complianceService.getRequirements("EU");
      const requirement = requirements.find((r) => r.requirementId === "gdpr_001");
      expect(requirement?.status).toBe("compliant");
    });
  });

  describe("getDataRetentionPolicy", () => {
    it("should get ride data retention policy", () => {
      const policy = complianceService.getDataRetentionPolicy("ride_data");

      expect(policy).toBeDefined();
      expect(policy?.retentionDays).toBe(2555); // 7 years
      expect(policy?.autoDelete).toBe(true);
    });

    it("should get payment records retention policy", () => {
      const policy = complianceService.getDataRetentionPolicy("payment_records");

      expect(policy).toBeDefined();
      expect(policy?.retentionDays).toBe(2555); // 7 years
      expect(policy?.autoDelete).toBe(true);
    });
  });

  describe("updateDataRetentionPolicy", () => {
    it("should update retention policy", () => {
      const updated = complianceService.updateDataRetentionPolicy("drp_001", 1825, true);

      expect(updated).toBe(true);

      const policy = complianceService.getDataRetentionPolicy("ride_data");
      expect(policy?.retentionDays).toBe(1825);
    });
  });

  describe("performComplianceCheck", () => {
    it("should perform compliance check", () => {
      const result = complianceService.performComplianceCheck("EU");

      expect(typeof result).toBe("boolean");
    });
  });

  describe("getAccessibilityRequirements", () => {
    it("should get accessibility requirements", () => {
      const requirements = complianceService.getAccessibilityRequirements();

      expect(requirements.length).toBeGreaterThan(0);
      expect(requirements.some((r) => r.requirement === "WCAG 2.1 AA Compliance")).toBe(true);
      expect(requirements.some((r) => r.requirement === "Screen Reader Support")).toBe(true);
    });
  });

  describe("getSafetyRequirements", () => {
    it("should get safety requirements", () => {
      const requirements = complianceService.getSafetyRequirements();

      expect(requirements.length).toBeGreaterThan(0);
      expect(requirements.some((r) => r.requirement === "Driver Verification")).toBe(true);
      expect(requirements.some((r) => r.requirement === "Emergency Support")).toBe(true);
    });
  });

  describe("generateComplianceCertificate", () => {
    it("should generate compliance certificate", () => {
      const certificate = complianceService.generateComplianceCertificate("EU");

      expect(certificate).toContain("COMPLIANCE CERTIFICATE");
      expect(certificate).toContain("EU");
      expect(certificate).toContain("COMPLIANT");
    });
  });

  describe("exportComplianceReport", () => {
    it("should export compliance report", () => {
      const report = complianceService.exportComplianceReport("EU");

      expect(report).toContain("COMPLIANCE REPORT");
      expect(report).toContain("EU");
      expect(report).toContain("DETAILED REQUIREMENTS");
      expect(report).toContain("DATA RETENTION POLICIES");
    });
  });
});
