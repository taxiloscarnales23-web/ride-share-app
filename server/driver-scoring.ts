/**
 * Driver Performance Scoring System
 * Calculates comprehensive driver scores based on multiple metrics
 */

export interface DriverMetrics {
  driverId: string;
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  averageRating: number;
  totalRatings: number;
  onTimePercentage: number;
  cancellationRate: number;
  acceptanceRate: number;
  vehicleConditionRating: number;
  communicationRating: number;
  safetyIncidents: number;
  documentationStatus: "verified" | "pending" | "rejected";
}

export interface DriverScore {
  driverId: string;
  overallScore: number; // 0-100
  scoreBreakdown: {
    rideQuality: number;
    reliability: number;
    safety: number;
    communication: number;
    documentation: number;
  };
  badge?: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  recommendations: string[];
}

/**
 * Calculate overall driver score
 */
export function calculateDriverScore(metrics: DriverMetrics): DriverScore {
  const scoreBreakdown = {
    rideQuality: calculateRideQualityScore(metrics),
    reliability: calculateReliabilityScore(metrics),
    safety: calculateSafetyScore(metrics),
    communication: calculateCommunicationScore(metrics),
    documentation: calculateDocumentationScore(metrics),
  };

  // Weighted average (all equal weight for now)
  const overallScore =
    (scoreBreakdown.rideQuality +
      scoreBreakdown.reliability +
      scoreBreakdown.safety +
      scoreBreakdown.communication +
      scoreBreakdown.documentation) /
    5;

  const tier = determineTier(overallScore);
  const badge = determineBadge(metrics, scoreBreakdown);
  const recommendations = generateRecommendations(metrics, scoreBreakdown);

  return {
    driverId: metrics.driverId,
    overallScore: Math.round(overallScore * 100) / 100,
    scoreBreakdown: {
      rideQuality: Math.round(scoreBreakdown.rideQuality * 100) / 100,
      reliability: Math.round(scoreBreakdown.reliability * 100) / 100,
      safety: Math.round(scoreBreakdown.safety * 100) / 100,
      communication: Math.round(scoreBreakdown.communication * 100) / 100,
      documentation: Math.round(scoreBreakdown.documentation * 100) / 100,
    },
    badge,
    tier,
    recommendations,
  };
}

/**
 * Calculate ride quality score based on customer ratings
 */
function calculateRideQualityScore(metrics: DriverMetrics): number {
  if (metrics.totalRatings === 0) return 50; // Default for new drivers

  // Scale 1-5 rating to 0-100
  const ratingScore = (metrics.averageRating / 5) * 100;

  // Bonus for high number of ratings (consistency indicator)
  const consistencyBonus =
    Math.min(metrics.totalRatings, 100) > 50 ? 5 : 0;

  return Math.min(100, ratingScore + consistencyBonus);
}

/**
 * Calculate reliability score based on completion and on-time performance
 */
function calculateReliabilityScore(metrics: DriverMetrics): number {
  if (metrics.totalRides === 0) return 50;

  // Completion rate (70% weight)
  const completionRatePercent =
    (metrics.completedRides / metrics.totalRides) * 100;
  const completionScore = (completionRatePercent / 100) * 70;

  // On-time performance (30% weight)
  const onTimeScore = (metrics.onTimePercentage / 100) * 30;

  return Math.min(100, completionScore + onTimeScore);
}

/**
 * Calculate safety score
 */
function calculateSafetyScore(metrics: DriverMetrics): number {
  let safetyScore = 100;

  // Deduct points for safety incidents
  safetyScore -= metrics.safetyIncidents * 15;

  // Bonus for clean record
  if (metrics.safetyIncidents === 0 && metrics.totalRides > 10) {
    safetyScore += 10;
  }

  return Math.max(0, Math.min(100, safetyScore));
}

/**
 * Calculate communication score
 */
function calculateCommunicationScore(metrics: DriverMetrics): number {
  // Base score from communication rating
  const baseScore = (metrics.communicationRating / 5) * 100;

  // Bonus for high acceptance rate (responsiveness)
  const acceptanceBonus =
    (metrics.acceptanceRate / 100) * 20 > 15 ? 15 : 0;

  return Math.min(100, baseScore + acceptanceBonus);
}

/**
 * Calculate documentation score
 */
function calculateDocumentationScore(metrics: DriverMetrics): number {
  switch (metrics.documentationStatus) {
    case "verified":
      return 100;
    case "pending":
      return 50;
    case "rejected":
      return 0;
    default:
      return 50;
  }
}

/**
 * Determine driver tier based on overall score
 */
function determineTier(
  score: number
): "bronze" | "silver" | "gold" | "platinum" {
  if (score >= 90) return "platinum";
  if (score >= 80) return "gold";
  if (score >= 70) return "silver";
  return "bronze";
}

/**
 * Determine special badge if applicable
 */
function determineBadge(
  metrics: DriverMetrics,
  scoreBreakdown: {
    rideQuality: number;
    reliability: number;
    safety: number;
    communication: number;
    documentation: number;
  }
): string | undefined {
  // Perfect rating badge
  if (metrics.averageRating === 5 && metrics.totalRatings >= 20) {
    return "Perfect Rating";
  }

  // Safety champion badge
  if (
    scoreBreakdown.safety === 100 &&
    metrics.totalRides >= 100 &&
    metrics.safetyIncidents === 0
  ) {
    return "Safety Champion";
  }

  // Reliability badge
  const completionRate = metrics.completedRides / metrics.totalRides;
  if (
    metrics.onTimePercentage >= 98 &&
    completionRate >= 0.98 &&
    metrics.totalRides >= 50
  ) {
    return "Reliable Driver";
  }

  // Communication excellence
  if (metrics.communicationRating >= 4.8 && metrics.totalRatings >= 30) {
    return "Communication Expert";
  }

  // New driver badge
  if (metrics.totalRides < 10 && metrics.averageRating >= 4.5) {
    return "Rising Star";
  }

  return undefined;
}

/**
 * Generate recommendations for driver improvement
 */
function generateRecommendations(
  metrics: DriverMetrics,
  scoreBreakdown: {
    rideQuality: number;
    reliability: number;
    safety: number;
    communication: number;
    documentation: number;
  }
): string[] {
  const recommendations: string[] = [];

  // Ride quality recommendations
  if (scoreBreakdown.rideQuality < 70) {
    recommendations.push(
      "Focus on improving customer experience - consider vehicle maintenance or route optimization"
    );
  }

  // Reliability recommendations
  if (scoreBreakdown.reliability < 70) {
    recommendations.push(
      "Improve on-time arrivals and reduce cancellations to build rider trust"
    );
  }

  // Safety recommendations
  if (scoreBreakdown.safety < 80) {
    recommendations.push(
      "Review safety protocols and consider defensive driving training"
    );
  }

  // Communication recommendations
  if (scoreBreakdown.communication < 70) {
    recommendations.push(
      "Enhance communication with riders - respond promptly to messages and calls"
    );
  }

  // Documentation recommendations
  if (metrics.documentationStatus === "pending") {
    recommendations.push("Complete pending document verification for full access");
  } else if (metrics.documentationStatus === "rejected") {
    recommendations.push("Contact support to resolve documentation issues");
  }

  // Positive reinforcement
  if (metrics.averageRating >= 4.8) {
    recommendations.push("Excellent work! Keep maintaining these high standards");
  }

  if (recommendations.length === 0) {
    recommendations.push("You're doing great! Continue providing excellent service");
  }

  return recommendations;
}

/**
 * Calculate driver ranking within a city
 */
export function calculateDriverRanking(
  drivers: DriverScore[],
  driverId: string
): {
  rank: number;
  totalDrivers: number;
  percentile: number;
} {
  const sorted = [...drivers].sort((a, b) => b.overallScore - a.overallScore);
  const rank = sorted.findIndex((d) => d.driverId === driverId) + 1;
  const percentile = ((sorted.length - rank + 1) / sorted.length) * 100;

  return {
    rank,
    totalDrivers: sorted.length,
    percentile: Math.round(percentile),
  };
}

/**
 * Identify drivers needing intervention
 */
export function identifyAtRiskDrivers(drivers: DriverScore[]): DriverScore[] {
  return drivers.filter(
    (driver) =>
      driver.overallScore < 60 ||
      driver.scoreBreakdown.safety < 50 ||
      driver.scoreBreakdown.reliability < 50
  );
}

/**
 * Calculate incentive eligibility
 */
export function calculateIncentiveEligibility(
  score: DriverScore,
  metrics: DriverMetrics
): {
  eligible: boolean;
  incentiveLevel: "none" | "bronze" | "silver" | "gold" | "platinum";
  bonusPercentage: number;
  reason: string;
} {
  // Minimum requirements
  if (metrics.totalRides < 10) {
    return {
      eligible: false,
      incentiveLevel: "none",
      bonusPercentage: 0,
      reason: "Minimum 10 completed rides required",
    };
  }

  if (metrics.documentationStatus !== "verified") {
    return {
      eligible: false,
      incentiveLevel: "none",
      bonusPercentage: 0,
      reason: "Documentation verification required",
    };
  }

  // Determine incentive level based on tier
  let incentiveLevel: "none" | "bronze" | "silver" | "gold" | "platinum" =
    "none";
  let bonusPercentage = 0;

  switch (score.tier) {
    case "platinum":
      incentiveLevel = "platinum";
      bonusPercentage = 15;
      break;
    case "gold":
      incentiveLevel = "gold";
      bonusPercentage = 10;
      break;
    case "silver":
      incentiveLevel = "silver";
      bonusPercentage = 5;
      break;
    case "bronze":
      incentiveLevel = "bronze";
      bonusPercentage = 0;
      break;
  }

  return {
    eligible: bonusPercentage > 0,
    incentiveLevel,
    bonusPercentage,
    reason: `${score.tier.toUpperCase()} tier driver - ${bonusPercentage}% bonus eligible`,
  };
}
