/**
 * Driver Performance Dashboard Service
 * Tracks and analyzes driver metrics and performance
 */

export interface DriverMetrics {
  driverId: string;
  totalRides: number;
  averageRating: number;
  completionRate: number; // percentage of accepted rides completed
  cancellationRate: number; // percentage of cancelled rides
  onTimeRate: number; // percentage of on-time arrivals
  totalEarnings: number;
  acceptanceRate: number; // percentage of ride requests accepted
  responseTime: number; // average seconds to accept ride
  totalHours: number; // total driving hours
  vehicleConditionRating: number; // 1-5 scale
  customerSatisfaction: number; // 1-5 scale
}

export interface PerformanceTrend {
  date: Date;
  rating: number;
  ridesCompleted: number;
  earnings: number;
  onTimeRate: number;
}

export interface PerformanceGoal {
  metric: keyof DriverMetrics;
  targetValue: number;
  currentValue: number;
  deadline: Date;
  status: 'on_track' | 'at_risk' | 'completed';
}

export class DriverPerformanceService {
  private driverMetrics: Map<string, DriverMetrics> = new Map();
  private performanceTrends: Map<string, PerformanceTrend[]> = new Map();
  private performanceGoals: Map<string, PerformanceGoal[]> = new Map();

  /**
   * Initialize driver metrics
   */
  initializeMetrics(driverId: string): DriverMetrics {
    const metrics: DriverMetrics = {
      driverId,
      totalRides: 0,
      averageRating: 5.0,
      completionRate: 100,
      cancellationRate: 0,
      onTimeRate: 100,
      totalEarnings: 0,
      acceptanceRate: 100,
      responseTime: 0,
      totalHours: 0,
      vehicleConditionRating: 5,
      customerSatisfaction: 5
    };

    this.driverMetrics.set(driverId, metrics);
    this.performanceTrends.set(driverId, []);
    this.performanceGoals.set(driverId, []);

    return metrics;
  }

  /**
   * Get driver metrics
   */
  getMetrics(driverId: string): DriverMetrics | null {
    return this.driverMetrics.get(driverId) || null;
  }

  /**
   * Update driver metrics after ride completion
   */
  updateMetricsAfterRide(
    driverId: string,
    rideRating: number,
    earnings: number,
    onTime: boolean,
    completed: boolean
  ): void {
    const metrics = this.driverMetrics.get(driverId);
    if (!metrics) return;

    metrics.totalRides += 1;
    metrics.totalEarnings += earnings;

    if (completed) {
      metrics.completionRate = ((metrics.totalRides - 1) / metrics.totalRides) * 100;
    } else {
      metrics.cancellationRate = (1 / metrics.totalRides) * 100;
    }

    if (onTime) {
      metrics.onTimeRate = ((metrics.onTimeRate * (metrics.totalRides - 1) + 100) / metrics.totalRides);
    } else {
      metrics.onTimeRate = ((metrics.onTimeRate * (metrics.totalRides - 1) + 0) / metrics.totalRides);
    }

    // Update average rating
    metrics.averageRating = ((metrics.averageRating * (metrics.totalRides - 1) + rideRating) / metrics.totalRides);

    // Record trend
    this.recordTrend(driverId);
  }

  /**
   * Record performance trend
   */
  private recordTrend(driverId: string): void {
    const metrics = this.driverMetrics.get(driverId);
    if (!metrics) return;

    const trend: PerformanceTrend = {
      date: new Date(),
      rating: metrics.averageRating,
      ridesCompleted: metrics.totalRides,
      earnings: metrics.totalEarnings,
      onTimeRate: metrics.onTimeRate
    };

    const trends = this.performanceTrends.get(driverId) || [];
    trends.push(trend);
    this.performanceTrends.set(driverId, trends);
  }

  /**
   * Get performance trends
   */
  getTrends(driverId: string, days: number = 30): PerformanceTrend[] {
    const trends = this.performanceTrends.get(driverId) || [];
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return trends.filter(trend => trend.date >= cutoffDate);
  }

  /**
   * Get performance rating (1-5 stars)
   */
  getPerformanceRating(driverId: string): number {
    const metrics = this.driverMetrics.get(driverId);
    if (!metrics) return 0;

    // Calculate weighted score
    const ratingWeight = 0.4;
    const completionWeight = 0.3;
    const onTimeWeight = 0.2;
    const satisfactionWeight = 0.1;

    const score =
      (metrics.averageRating / 5) * ratingWeight +
      (metrics.completionRate / 100) * completionWeight +
      (metrics.onTimeRate / 100) * onTimeWeight +
      (metrics.customerSatisfaction / 5) * satisfactionWeight;

    return Math.round(score * 5 * 10) / 10; // Round to 1 decimal
  }

  /**
   * Get performance badge
   */
  getPerformanceBadge(driverId: string): string {
    const rating = this.getPerformanceRating(driverId);

    if (rating >= 4.8) return 'Platinum';
    if (rating >= 4.5) return 'Gold';
    if (rating >= 4.0) return 'Silver';
    if (rating >= 3.5) return 'Bronze';
    return 'Standard';
  }

  /**
   * Set performance goals
   */
  setGoal(
    driverId: string,
    metric: keyof DriverMetrics,
    targetValue: number,
    deadline: Date
  ): void {
    const metrics = this.driverMetrics.get(driverId);
    if (!metrics) return;

    const goals = this.performanceGoals.get(driverId) || [];
    const goal: PerformanceGoal = {
      metric,
      targetValue,
      currentValue: metrics[metric] as number,
      deadline,
      status: 'on_track'
    };

    goals.push(goal);
    this.performanceGoals.set(driverId, goals);
  }

  /**
   * Get performance goals
   */
  getGoals(driverId: string): PerformanceGoal[] {
    return this.performanceGoals.get(driverId) || [];
  }

  /**
   * Check goal progress
   */
  checkGoalProgress(driverId: string): PerformanceGoal[] {
    const goals = this.performanceGoals.get(driverId) || [];
    const metrics = this.driverMetrics.get(driverId);
    if (!metrics) return goals;

    return goals.map(goal => {
      const currentValue = metrics[goal.metric] as number;
      const progress = (currentValue / goal.targetValue) * 100;
      const daysLeft = Math.ceil((goal.deadline.getTime() - Date.now()) / (24 * 60 * 60 * 1000));

      if (currentValue >= goal.targetValue) {
        goal.status = 'completed';
      } else if (daysLeft > 0 && progress >= (100 / daysLeft) * (30 - daysLeft)) {
        goal.status = 'on_track';
      } else {
        goal.status = 'at_risk';
      }

      return goal;
    });
  }

  /**
   * Get earnings breakdown
   */
  getEarningsBreakdown(driverId: string, days: number = 30): {
    totalEarnings: number;
    averagePerRide: number;
    averagePerHour: number;
    bestDay: number;
    worstDay: number;
  } {
    const metrics = this.driverMetrics.get(driverId);
    if (!metrics) {
      return { totalEarnings: 0, averagePerRide: 0, averagePerHour: 0, bestDay: 0, worstDay: 0 };
    }

    const trends = this.getTrends(driverId, days);
    const earnings = trends.map(t => t.earnings);

    return {
      totalEarnings: metrics.totalEarnings,
      averagePerRide: metrics.totalRides > 0 ? metrics.totalEarnings / metrics.totalRides : 0,
      averagePerHour: metrics.totalHours > 0 ? metrics.totalEarnings / metrics.totalHours : 0,
      bestDay: Math.max(...earnings, 0),
      worstDay: Math.min(...earnings, 0)
    };
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(driverId: string): {
    badge: string;
    rating: number;
    completionRate: number;
    onTimeRate: number;
    totalRides: number;
    totalEarnings: number;
    recommendations: string[];
  } {
    const metrics = this.driverMetrics.get(driverId);
    if (!metrics) {
      return {
        badge: 'Standard',
        rating: 0,
        completionRate: 0,
        onTimeRate: 0,
        totalRides: 0,
        totalEarnings: 0,
        recommendations: []
      };
    }

    const recommendations: string[] = [];

    if (metrics.averageRating < 4.5) {
      recommendations.push('Improve customer service to increase ratings');
    }
    if (metrics.completionRate < 95) {
      recommendations.push('Reduce cancellations to improve completion rate');
    }
    if (metrics.onTimeRate < 90) {
      recommendations.push('Focus on punctuality to improve on-time rate');
    }
    if (metrics.totalRides < 100) {
      recommendations.push('Complete more rides to reach higher performance tiers');
    }

    return {
      badge: this.getPerformanceBadge(driverId),
      rating: this.getPerformanceRating(driverId),
      completionRate: metrics.completionRate,
      onTimeRate: metrics.onTimeRate,
      totalRides: metrics.totalRides,
      totalEarnings: metrics.totalEarnings,
      recommendations
    };
  }
}

export const driverPerformanceService = new DriverPerformanceService();
