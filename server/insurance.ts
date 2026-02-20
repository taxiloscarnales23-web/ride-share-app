/**
 * Insurance Integration Service
 * Manages insurance coverage, claims, and accident reporting
 */

export type CoverageType = "basic" | "premium" | "comprehensive";
export type ClaimStatus = "pending" | "approved" | "rejected" | "paid";
export type AccidentSeverity = "minor" | "moderate" | "severe";

export interface InsurancePlan {
  planId: string;
  type: CoverageType;
  monthlyPremium: number;
  deductible: number;
  coverageLimit: number;
  features: string[];
  description: string;
}

export interface UserInsurance {
  insuranceId: string;
  userId: string;
  planId: string;
  status: "active" | "inactive" | "expired";
  startDate: Date;
  endDate: Date;
  monthlyPremium: number;
  claimsCount: number;
}

export interface InsuranceClaim {
  claimId: string;
  userId: string;
  rideId: string;
  claimStatus: ClaimStatus;
  claimAmount: number;
  description: string;
  accidentDate: Date;
  severity: AccidentSeverity;
  documents: string[];
  createdAt: Date;
  resolvedAt?: Date;
}

export interface AccidentReport {
  reportId: string;
  rideId: string;
  driverId: string;
  riderId: string;
  severity: AccidentSeverity;
  location: { lat: number; lng: number };
  description: string;
  photos: string[];
  witnesses: string[];
  policeReport?: string;
  timestamp: Date;
}

export class InsuranceService {
  private plans: Map<string, InsurancePlan> = new Map();
  private userInsurance: Map<string, UserInsurance> = new Map();
  private claims: Map<string, InsuranceClaim> = new Map();
  private accidentReports: Map<string, AccidentReport> = new Map();

  constructor() {
    this.initializeDefaultPlans();
  }

  /**
   * Initialize default insurance plans
   */
  private initializeDefaultPlans(): void {
    const basicPlan: InsurancePlan = {
      planId: "plan_basic",
      type: "basic",
      monthlyPremium: 9.99,
      deductible: 500,
      coverageLimit: 50000,
      features: ["accident_coverage", "liability", "basic_support"],
      description: "Basic coverage for ride-sharing activities",
    };

    const premiumPlan: InsurancePlan = {
      planId: "plan_premium",
      type: "premium",
      monthlyPremium: 19.99,
      deductible: 250,
      coverageLimit: 100000,
      features: [
        "accident_coverage",
        "liability",
        "medical_payments",
        "priority_support",
      ],
      description: "Premium coverage with enhanced benefits",
    };

    const comprehensivePlan: InsurancePlan = {
      planId: "plan_comprehensive",
      type: "comprehensive",
      monthlyPremium: 34.99,
      deductible: 0,
      coverageLimit: 250000,
      features: [
        "accident_coverage",
        "liability",
        "medical_payments",
        "vehicle_damage",
        "24_7_support",
        "legal_assistance",
      ],
      description: "Comprehensive coverage with full protection",
    };

    this.plans.set(basicPlan.planId, basicPlan);
    this.plans.set(premiumPlan.planId, premiumPlan);
    this.plans.set(comprehensivePlan.planId, comprehensivePlan);
  }

  /**
   * Get available insurance plans
   */
  getAvailablePlans(): InsurancePlan[] {
    return Array.from(this.plans.values());
  }

  /**
   * Get specific plan details
   */
  getPlan(planId: string): InsurancePlan | null {
    return this.plans.get(planId) || null;
  }

  /**
   * Subscribe user to insurance plan
   */
  subscribeToInsurance(
    userId: string,
    planId: string
  ): UserInsurance | null {
    const plan = this.plans.get(planId);
    if (!plan) return null;

    const insuranceId = `ins_${Date.now()}`;
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const userInsurance: UserInsurance = {
      insuranceId,
      userId,
      planId,
      status: "active",
      startDate,
      endDate,
      monthlyPremium: plan.monthlyPremium,
      claimsCount: 0,
    };

    this.userInsurance.set(insuranceId, userInsurance);
    return userInsurance;
  }

  /**
   * Get user's active insurance
   */
  getUserInsurance(userId: string): UserInsurance | null {
    for (const insurance of this.userInsurance.values()) {
      if (
        insurance.userId === userId &&
        insurance.status === "active" &&
        insurance.endDate > new Date()
      ) {
        return insurance;
      }
    }
    return null;
  }

  /**
   * File insurance claim
   */
  fileClaim(
    userId: string,
    rideId: string,
    description: string,
    severity: AccidentSeverity,
    claimAmount: number
  ): InsuranceClaim | null {
    const userInsurance = this.getUserInsurance(userId);
    if (!userInsurance) return null;

    const claimId = `claim_${Date.now()}`;
    const claim: InsuranceClaim = {
      claimId,
      userId,
      rideId,
      claimStatus: "pending",
      claimAmount,
      description,
      accidentDate: new Date(),
      severity,
      documents: [],
      createdAt: new Date(),
    };

    this.claims.set(claimId, claim);
    userInsurance.claimsCount++;

    return claim;
  }

  /**
   * Get user's claims
   */
  getUserClaims(userId: string): InsuranceClaim[] {
    return Array.from(this.claims.values()).filter(
      (claim) => claim.userId === userId
    );
  }

  /**
   * Update claim status
   */
  updateClaimStatus(
    claimId: string,
    status: ClaimStatus,
    amount?: number
  ): InsuranceClaim | null {
    const claim = this.claims.get(claimId);
    if (!claim) return null;

    claim.claimStatus = status;
    if (status === "approved" && amount) {
      claim.claimAmount = amount;
    }
    if (status === "paid" || status === "rejected") {
      claim.resolvedAt = new Date();
    }

    return claim;
  }

  /**
   * Report accident
   */
  reportAccident(
    rideId: string,
    driverId: string,
    riderId: string,
    severity: AccidentSeverity,
    location: { lat: number; lng: number },
    description: string
  ): AccidentReport {
    const reportId = `accident_${Date.now()}`;
    const report: AccidentReport = {
      reportId,
      rideId,
      driverId,
      riderId,
      severity,
      location,
      description,
      photos: [],
      witnesses: [],
      timestamp: new Date(),
    };

    this.accidentReports.set(reportId, report);
    return report;
  }

  /**
   * Get accident reports
   */
  getAccidentReports(rideId: string): AccidentReport[] {
    return Array.from(this.accidentReports.values()).filter(
      (report) => report.rideId === rideId
    );
  }

  /**
   * Add document to claim
   */
  addClaimDocument(claimId: string, documentUrl: string): boolean {
    const claim = this.claims.get(claimId);
    if (!claim) return false;

    claim.documents.push(documentUrl);
    return true;
  }

  /**
   * Calculate claim payout
   */
  calculatePayout(claimId: string): number {
    const claim = this.claims.get(claimId);
    if (!claim || claim.claimStatus !== "approved") return 0;

    const userInsurance = this.userInsurance.get(
      Array.from(this.userInsurance.values()).find(
        (ins) => ins.userId === claim.userId
      )?.insuranceId || ""
    );
    if (!userInsurance) return 0;

    const plan = this.plans.get(userInsurance.planId);
    if (!plan) return 0;

    const claimAmount = Math.min(claim.claimAmount, plan.coverageLimit);
    const payout = Math.max(0, claimAmount - plan.deductible);

    return payout;
  }
}

export const insuranceService = new InsuranceService();
