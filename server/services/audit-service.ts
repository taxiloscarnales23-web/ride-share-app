export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: Record<string, { before: any; after: any }>;
  ipAddress: string;
  userAgent: string;
  status: "success" | "failure";
  timestamp: Date;
  details?: string;
}

export interface ComplianceReport {
  id: string;
  type: string;
  period: { start: Date; end: Date };
  totalTransactions: number;
  totalAmount: number;
  flaggedTransactions: number;
  suspiciousActivities: Array<{ type: string; count: number }>;
  generatedAt: Date;
}

export class AuditService {
  private logs: AuditLog[] = [];
  private complianceReports: ComplianceReport[] = [];

  /**
   * Log audit event
   */
  async log(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    options?: {
      changes?: Record<string, { before: any; after: any }>;
      ipAddress?: string;
      userAgent?: string;
      status?: "success" | "failure";
      details?: string;
    }
  ): Promise<AuditLog> {
    const auditLog: AuditLog = {
      id: `audit-${Date.now()}`,
      userId,
      action,
      resource,
      resourceId,
      changes: options?.changes,
      ipAddress: options?.ipAddress || "127.0.0.1",
      userAgent: options?.userAgent || "unknown",
      status: options?.status || "success",
      timestamp: new Date(),
      details: options?.details,
    };

    this.logs.push(auditLog);
    console.log(`[Audit] ${action} on ${resource}/${resourceId} by ${userId}`);

    return auditLog;
  }

  /**
   * Get audit logs
   */
  async getLogs(filters?: { userId?: string; action?: string; resource?: string; dateFrom?: Date; dateTo?: Date; limit?: number }): Promise<AuditLog[]> {
    let results = [...this.logs];

    if (filters?.userId) {
      results = results.filter((l) => l.userId === filters.userId);
    }

    if (filters?.action) {
      results = results.filter((l) => l.action === filters.action);
    }

    if (filters?.resource) {
      results = results.filter((l) => l.resource === filters.resource);
    }

    if (filters?.dateFrom) {
      results = results.filter((l) => l.timestamp >= filters.dateFrom!);
    }

    if (filters?.dateTo) {
      results = results.filter((l) => l.timestamp <= filters.dateTo!);
    }

    const limit = filters?.limit || 100;
    return results.slice(-limit).reverse();
  }

  /**
   * Get user activity
   */
  async getUserActivity(userId: string, days: number = 30): Promise<{ totalActions: number; actions: Record<string, number>; lastActivity: Date | null }> {
    const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const userLogs = this.logs.filter((l) => l.userId === userId && l.timestamp >= dateFrom);

    const actions: Record<string, number> = {};
    for (const log of userLogs) {
      actions[log.action] = (actions[log.action] || 0) + 1;
    }

    return {
      totalActions: userLogs.length,
      actions,
      lastActivity: userLogs.length > 0 ? userLogs[userLogs.length - 1].timestamp : null,
    };
  }

  /**
   * Detect suspicious activity
   */
  async detectSuspiciousActivity(): Promise<Array<{ type: string; userId: string; details: string; severity: "low" | "medium" | "high" }>> {
    const suspicious: Array<{ type: string; userId: string; details: string; severity: "low" | "medium" | "high" }> = [];

    // Check for multiple failed login attempts
    const failedLogins = this.logs.filter((l) => l.action === "login" && l.status === "failure");
    const userFailures: Record<string, number> = {};

    for (const log of failedLogins) {
      userFailures[log.userId] = (userFailures[log.userId] || 0) + 1;
    }

    for (const [userId, count] of Object.entries(userFailures)) {
      if (count >= 5) {
        suspicious.push({
          type: "multiple_failed_logins",
          userId,
          details: `${count} failed login attempts`,
          severity: "high",
        });
      }
    }

    // Check for unusual activity patterns
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentLogs = this.logs.filter((l) => l.timestamp >= oneHourAgo);

    const userActions: Record<string, number> = {};
    for (const log of recentLogs) {
      userActions[log.userId] = (userActions[log.userId] || 0) + 1;
    }

    for (const [userId, count] of Object.entries(userActions)) {
      if (count > 100) {
        suspicious.push({
          type: "unusual_activity_volume",
          userId,
          details: `${count} actions in 1 hour`,
          severity: "medium",
        });
      }
    }

    return suspicious;
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(type: string, dateFrom: Date, dateTo: Date): Promise<ComplianceReport> {
    const relevantLogs = this.logs.filter((l) => l.timestamp >= dateFrom && l.timestamp <= dateTo);

    const suspicious = await this.detectSuspiciousActivity();
    const suspiciousActivities: Record<string, number> = {};

    for (const item of suspicious) {
      suspiciousActivities[item.type] = (suspiciousActivities[item.type] || 0) + 1;
    }

    const report: ComplianceReport = {
      id: `report-${Date.now()}`,
      type,
      period: { start: dateFrom, end: dateTo },
      totalTransactions: relevantLogs.length,
      totalAmount: Math.random() * 100000, // Mock amount
      flaggedTransactions: suspicious.length,
      suspiciousActivities: Object.entries(suspiciousActivities).map(([type, count]) => ({ type, count })),
      generatedAt: new Date(),
    };

    this.complianceReports.push(report);
    console.log(`Compliance report generated: ${report.id}`);

    return report;
  }

  /**
   * Get compliance reports
   */
  async getComplianceReports(limit: number = 10): Promise<ComplianceReport[]> {
    return this.complianceReports.slice(-limit).reverse();
  }

  /**
   * Export audit logs
   */
  async exportLogs(format: "csv" | "json", filters?: { userId?: string; dateFrom?: Date; dateTo?: Date }): Promise<string> {
    const logs = await this.getLogs(filters);

    if (format === "json") {
      return JSON.stringify(logs, null, 2);
    }

    // CSV format
    const headers = ["ID", "User ID", "Action", "Resource", "Status", "Timestamp"];
    const rows = logs.map((l) => [l.id, l.userId, l.action, l.resource, l.status, l.timestamp.toISOString()]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    return csv;
  }

  /**
   * Get audit statistics
   */
  async getStats(): Promise<{
    totalLogs: number;
    successfulActions: number;
    failedActions: number;
    uniqueUsers: number;
    actionTypes: Record<string, number>;
  }> {
    const successfulActions = this.logs.filter((l) => l.status === "success").length;
    const failedActions = this.logs.filter((l) => l.status === "failure").length;
    const uniqueUsers = new Set(this.logs.map((l) => l.userId)).size;

    const actionTypes: Record<string, number> = {};
    for (const log of this.logs) {
      actionTypes[log.action] = (actionTypes[log.action] || 0) + 1;
    }

    return {
      totalLogs: this.logs.length,
      successfulActions,
      failedActions,
      uniqueUsers,
      actionTypes,
    };
  }
}

export const auditService = new AuditService();
