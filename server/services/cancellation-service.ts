export interface CancellationPolicy {
  gracePeriodMinutes: number;
  cancellationFeePercentage: number;
  refundPercentage: number;
  maxCancellationsPerMonth: number;
}

export interface CancellationRequest {
  rideId: string;
  userId: string;
  userType: "rider" | "driver";
  reason: string;
  timestamp: Date;
}

export interface CancellationResult {
  rideId: string;
  status: "approved" | "rejected" | "disputed";
  refundAmount: number;
  cancellationFee: number;
  reason: string;
  timestamp: Date;
}

export class CancellationService {
  private defaultPolicy: CancellationPolicy = {
    gracePeriodMinutes: 5,
    cancellationFeePercentage: 50,
    refundPercentage: 50,
    maxCancellationsPerMonth: 3,
  };

  /**
   * Get cancellation policy
   */
  async getPolicy(): Promise<CancellationPolicy> {
    return this.defaultPolicy;
  }

  /**
   * Check if cancellation is within grace period
   */
  async isWithinGracePeriod(rideId: string, currentTime: Date): Promise<boolean> {
    // Mock: assume ride was created 2 minutes ago
    const rideCreatedTime = new Date(currentTime.getTime() - 2 * 60 * 1000);
    const timeDiffMinutes = (currentTime.getTime() - rideCreatedTime.getTime()) / (1000 * 60);
    return timeDiffMinutes <= this.defaultPolicy.gracePeriodMinutes;
  }

  /**
   * Process cancellation request
   */
  async processCancellation(request: CancellationRequest, rideAmount: number): Promise<CancellationResult> {
    const isWithinGracePeriod = await this.isWithinGracePeriod(request.rideId, request.timestamp);

    if (isWithinGracePeriod) {
      // Full refund within grace period
      return {
        rideId: request.rideId,
        status: "approved",
        refundAmount: rideAmount,
        cancellationFee: 0,
        reason: "Cancelled within grace period",
        timestamp: request.timestamp,
      };
    }

    // Partial refund after grace period
    const cancellationFee = (rideAmount * this.defaultPolicy.cancellationFeePercentage) / 100;
    const refundAmount = rideAmount - cancellationFee;

    return {
      rideId: request.rideId,
      status: "approved",
      refundAmount,
      cancellationFee,
      reason: "Cancelled after grace period",
      timestamp: request.timestamp,
    };
  }

  /**
   * Check user cancellation limit
   */
  async checkCancellationLimit(userId: string): Promise<{
    currentMonth: number;
    limit: number;
    canCancel: boolean;
  }> {
    // Mock: assume user has cancelled 2 times this month
    const currentMonth = 2;
    const limit = this.defaultPolicy.maxCancellationsPerMonth;

    return {
      currentMonth,
      limit,
      canCancel: currentMonth < limit,
    };
  }

  /**
   * Process refund
   */
  async processRefund(rideId: string, refundAmount: number, reason: string): Promise<boolean> {
    console.log(`Refund processed for ride ${rideId}: $${refundAmount.toFixed(2)} - ${reason}`);
    return true;
  }

  /**
   * Get cancellation history
   */
  async getCancellationHistory(userId: string, limit: number = 10): Promise<CancellationResult[]> {
    // Mock data
    return [
      {
        rideId: "ride-001",
        status: "approved",
        refundAmount: 12.5,
        cancellationFee: 0,
        reason: "Cancelled within grace period",
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        rideId: "ride-002",
        status: "approved",
        refundAmount: 8.75,
        cancellationFee: 2.5,
        reason: "Cancelled after grace period",
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
    ];
  }

  /**
   * File dispute for cancellation
   */
  async fileDispute(rideId: string, userId: string, reason: string): Promise<{
    disputeId: string;
    status: string;
    createdAt: Date;
  }> {
    return {
      disputeId: `dispute-${Date.now()}`,
      status: "pending",
      createdAt: new Date(),
    };
  }

  /**
   * Get cancellation statistics
   */
  async getCancellationStats(userId: string): Promise<{
    totalCancellations: number;
    thisMonth: number;
    cancellationRate: number;
    totalRefunded: number;
    totalFees: number;
  }> {
    return {
      totalCancellations: 5,
      thisMonth: 2,
      cancellationRate: 8.5, // percentage
      totalRefunded: 45.25,
      totalFees: 7.5,
    };
  }
}

export const cancellationService = new CancellationService();
