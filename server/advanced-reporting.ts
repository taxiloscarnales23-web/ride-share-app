/**
 * Advanced Reporting Service
 * Generates detailed reports for drivers, riders, and admins
 */

export interface DriverReport {
  reportId: string;
  driverId: string;
  period: "daily" | "weekly" | "monthly" | "yearly";
  totalRides: number;
  totalEarnings: number;
  totalDistance: number;
  averageRating: number;
  cancellationRate: number;
  taxableIncome: number;
  expenses: number;
  netIncome: number;
  generatedDate: Date;
}

export interface RiderReport {
  reportId: string;
  riderId: string;
  period: "daily" | "weekly" | "monthly" | "yearly";
  totalRides: number;
  totalSpent: number;
  averageRidePrice: number;
  favoriteRoutes: string[];
  preferredDrivers: string[];
  loyaltyPointsEarned: number;
  discountsUsed: number;
  generatedDate: Date;
}

export interface AdminReport {
  reportId: string;
  period: "daily" | "weekly" | "monthly" | "yearly";
  totalRides: number;
  totalRevenue: number;
  activeDrivers: number;
  activeRiders: number;
  averageFare: number;
  fraudDetected: number;
  complaintResolved: number;
  platformHealth: number;
  generatedDate: Date;
}

export class AdvancedReportingService {
  private driverReports: Map<string, DriverReport[]> = new Map();
  private riderReports: Map<string, RiderReport[]> = new Map();
  private adminReports: AdminReport[] = [];

  generateDriverReport(
    driverId: string,
    period: "daily" | "weekly" | "monthly" | "yearly",
    data: {
      totalRides: number;
      totalEarnings: number;
      totalDistance: number;
      averageRating: number;
      cancellationRate: number;
      expenses: number;
    }
  ): DriverReport {
    const taxRate = 0.15;
    const taxableIncome = data.totalEarnings - data.expenses;
    const taxes = taxableIncome * taxRate;

    const report: DriverReport = {
      reportId: `drpt_${Date.now()}`,
      driverId,
      period,
      totalRides: data.totalRides,
      totalEarnings: data.totalEarnings,
      totalDistance: data.totalDistance,
      averageRating: data.averageRating,
      cancellationRate: data.cancellationRate,
      taxableIncome,
      expenses: data.expenses,
      netIncome: taxableIncome - taxes,
      generatedDate: new Date(),
    };

    if (!this.driverReports.has(driverId)) {
      this.driverReports.set(driverId, []);
    }
    this.driverReports.get(driverId)!.push(report);

    return report;
  }

  generateRiderReport(
    riderId: string,
    period: "daily" | "weekly" | "monthly" | "yearly",
    data: {
      totalRides: number;
      totalSpent: number;
      favoriteRoutes: string[];
      preferredDrivers: string[];
      loyaltyPointsEarned: number;
      discountsUsed: number;
    }
  ): RiderReport {
    const report: RiderReport = {
      reportId: `rrpt_${Date.now()}`,
      riderId,
      period,
      totalRides: data.totalRides,
      totalSpent: data.totalSpent,
      averageRidePrice:
        data.totalRides > 0 ? data.totalSpent / data.totalRides : 0,
      favoriteRoutes: data.favoriteRoutes,
      preferredDrivers: data.preferredDrivers,
      loyaltyPointsEarned: data.loyaltyPointsEarned,
      discountsUsed: data.discountsUsed,
      generatedDate: new Date(),
    };

    if (!this.riderReports.has(riderId)) {
      this.riderReports.set(riderId, []);
    }
    this.riderReports.get(riderId)!.push(report);

    return report;
  }

  generateAdminReport(
    period: "daily" | "weekly" | "monthly" | "yearly",
    data: {
      totalRides: number;
      totalRevenue: number;
      activeDrivers: number;
      activeRiders: number;
      fraudDetected: number;
      complaintResolved: number;
    }
  ): AdminReport {
    const report: AdminReport = {
      reportId: `arpt_${Date.now()}`,
      period,
      totalRides: data.totalRides,
      totalRevenue: data.totalRevenue,
      activeDrivers: data.activeDrivers,
      activeRiders: data.activeRiders,
      averageFare:
        data.totalRides > 0 ? data.totalRevenue / data.totalRides : 0,
      fraudDetected: data.fraudDetected,
      complaintResolved: data.complaintResolved,
      platformHealth: Math.max(
        0,
        100 - (data.fraudDetected + (data.totalRides - data.complaintResolved)) * 0.5
      ),
      generatedDate: new Date(),
    };

    this.adminReports.push(report);
    return report;
  }

  exportReportAsPDF(reportId: string): string {
    return `PDF_${reportId}_${Date.now()}.pdf`;
  }

  emailReport(reportId: string, email: string): boolean {
    return true;
  }

  getDriverReports(driverId: string): DriverReport[] {
    return this.driverReports.get(driverId) || [];
  }

  getRiderReports(riderId: string): RiderReport[] {
    return this.riderReports.get(riderId) || [];
  }

  getAdminReports(period?: string): AdminReport[] {
    return period
      ? this.adminReports.filter((r) => r.period === period)
      : this.adminReports;
  }
}
