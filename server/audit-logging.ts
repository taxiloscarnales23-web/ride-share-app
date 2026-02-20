/**
 * Audit Logging Service
 * Comprehensive audit trails for compliance and regulatory requirements
 */

export type AuditAction =
  | "user_created"
  | "user_updated"
  | "user_deleted"
  | "ride_created"
  | "ride_accepted"
  | "ride_completed"
  | "payment_recorded"
  | "driver_verified"
  | "driver_suspended"
  | "dispute_filed"
  | "dispute_resolved"
  | "admin_action"
  | "data_export"
  | "account_deleted";

export interface AuditLog {
  logId: string;
  timestamp: Date;
  userId: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  changes: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  status: "success" | "failure";
  errorMessage?: string;
  retentionExpiry: Date;
}

export interface ComplianceReport {
  reportId: string;
  generatedDate: Date;
  jurisdiction: string;
  period: "daily" | "weekly" | "monthly" | "yearly";
  totalUsers: number;
  totalRides: number;
  dataBreaches: number;
  complianceViolations: number;
  gdprRequests: number;
  dataExports: number;
  accountDeletions: number;
  status: "compliant" | "non_compliant" | "pending_review";
}

export class AuditLoggingService {
  private auditLogs: AuditLog[] = [];
  private complianceReports: ComplianceReport[] = [];
  private dataRetentionDays = 2555; // 7 years default
  private gdprRequests: Map<string, { userId: string; requestDate: Date; status: string }> = new Map();

  logAction(
    userId: string,
    action: AuditAction,
    resourceType: string,
    resourceId: string,
    changes: Record<string, any>,
    ipAddress: string,
    userAgent: string,
    status: "success" | "failure" = "success",
    errorMessage?: string
  ): AuditLog {
    const now = new Date();
    const retentionExpiry = new Date(now.getTime() + this.dataRetentionDays * 24 * 60 * 60 * 1000);

    const log: AuditLog = {
      logId: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: now,
      userId,
      action,
      resourceType,
      resourceId,
      changes,
      ipAddress,
      userAgent,
      status,
      errorMessage,
      retentionExpiry,
    };

    this.auditLogs.push(log);
    return log;
  }

  getLogs(
    filters?: {
      userId?: string;
      action?: AuditAction;
      resourceType?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): AuditLog[] {
    let results = [...this.auditLogs];

    if (filters?.userId) {
      results = results.filter((log) => log.userId === filters.userId);
    }
    if (filters?.action) {
      results = results.filter((log) => log.action === filters.action);
    }
    if (filters?.resourceType) {
      results = results.filter((log) => log.resourceType === filters.resourceType);
    }
    if (filters?.startDate) {
      results = results.filter((log) => log.timestamp >= filters.startDate!);
    }
    if (filters?.endDate) {
      results = results.filter((log) => log.timestamp <= filters.endDate!);
    }

    return results;
  }

  generateComplianceReport(
    jurisdiction: string,
    period: "daily" | "weekly" | "monthly" | "yearly"
  ): ComplianceReport {
    const now = new Date();
    const startDate = this.getPeriodStartDate(now, period);

    const logsInPeriod = this.getLogs({
      startDate,
      endDate: now,
    });

    const violations = logsInPeriod.filter((log) => log.status === "failure").length;
    const gdprRequestsCount = Array.from(this.gdprRequests.values()).filter(
      (req) => req.requestDate >= startDate && req.requestDate <= now
    ).length;

    const report: ComplianceReport = {
      reportId: `comp_${Date.now()}`,
      generatedDate: now,
      jurisdiction,
      period,
      totalUsers: new Set(logsInPeriod.map((log) => log.userId)).size,
      totalRides: logsInPeriod.filter((log) => log.action === "ride_completed").length,
      dataBreaches: 0,
      complianceViolations: violations,
      gdprRequests: gdprRequestsCount,
      dataExports: logsInPeriod.filter((log) => log.action === "data_export").length,
      accountDeletions: logsInPeriod.filter((log) => log.action === "account_deleted").length,
      status: violations === 0 ? "compliant" : "non_compliant",
    };

    this.complianceReports.push(report);
    return report;
  }

  handleGDPRDataRequest(userId: string): string {
    const requestId = `gdpr_${Date.now()}`;
    this.gdprRequests.set(requestId, {
      userId,
      requestDate: new Date(),
      status: "pending",
    });

    this.logAction(
      userId,
      "data_export",
      "user",
      userId,
      { gdprRequest: true },
      "0.0.0.0",
      "GDPR Request",
      "success"
    );

    return requestId;
  }

  handleGDPRDeletionRequest(userId: string): boolean {
    this.logAction(
      userId,
      "account_deleted",
      "user",
      userId,
      { gdprDeletion: true },
      "0.0.0.0",
      "GDPR Deletion Request",
      "success"
    );

    return true;
  }

  exportAuditTrail(
    filters?: {
      userId?: string;
      action?: AuditAction;
      startDate?: Date;
      endDate?: Date;
    }
  ): string {
    const logs = this.getLogs(filters);
    const csv = this.convertLogsToCSV(logs);
    return `audit_export_${Date.now()}.csv`;
  }

  private convertLogsToCSV(logs: AuditLog[]): string {
    const headers = [
      "Log ID",
      "Timestamp",
      "User ID",
      "Action",
      "Resource Type",
      "Resource ID",
      "Status",
      "IP Address",
    ];

    const rows = logs.map((log) => [
      log.logId,
      log.timestamp.toISOString(),
      log.userId,
      log.action,
      log.resourceType,
      log.resourceId,
      log.status,
      log.ipAddress,
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }

  cleanupExpiredLogs(): number {
    const now = new Date();
    const beforeLength = this.auditLogs.length;

    this.auditLogs = this.auditLogs.filter((log) => log.retentionExpiry > now);

    return beforeLength - this.auditLogs.length;
  }

  setDataRetentionDays(days: number): void {
    this.dataRetentionDays = days;
  }

  getComplianceReports(
    filters?: {
      jurisdiction?: string;
      period?: string;
      status?: string;
    }
  ): ComplianceReport[] {
    let results = [...this.complianceReports];

    if (filters?.jurisdiction) {
      results = results.filter((r) => r.jurisdiction === filters.jurisdiction);
    }
    if (filters?.period) {
      results = results.filter((r) => r.period === filters.period);
    }
    if (filters?.status) {
      results = results.filter((r) => r.status === filters.status);
    }

    return results;
  }

  private getPeriodStartDate(date: Date, period: string): Date {
    const newDate = new Date(date);

    switch (period) {
      case "daily":
        newDate.setHours(0, 0, 0, 0);
        break;
      case "weekly":
        newDate.setDate(newDate.getDate() - newDate.getDay());
        newDate.setHours(0, 0, 0, 0);
        break;
      case "monthly":
        newDate.setDate(1);
        newDate.setHours(0, 0, 0, 0);
        break;
      case "yearly":
        newDate.setMonth(0, 1);
        newDate.setHours(0, 0, 0, 0);
        break;
    }

    return newDate;
  }
}
