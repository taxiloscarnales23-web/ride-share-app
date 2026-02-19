/**
 * Surge Pricing Service
 * Implements dynamic pricing based on demand, supply, and time factors
 */

interface SurgePricingParams {
  basePrice: number;
  rideRequests: number;
  availableDrivers: number;
  timeOfDay: number; // 0-23
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  weatherCondition?: "clear" | "rain" | "snow";
  specialEvent?: boolean;
}

interface SurgePricingResult {
  multiplier: number;
  surgePrice: number;
  reason: string;
  components: {
    demandFactor: number;
    timeFactor: number;
    weatherFactor: number;
    eventFactor: number;
  };
}

/**
 * Calculate surge pricing multiplier based on multiple factors
 */
export function calculateSurgePricing(
  params: SurgePricingParams
): SurgePricingResult {
  const components = {
    demandFactor: calculateDemandFactor(
      params.rideRequests,
      params.availableDrivers
    ),
    timeFactor: calculateTimeFactor(params.timeOfDay, params.dayOfWeek),
    weatherFactor: calculateWeatherFactor(params.weatherCondition),
    eventFactor: params.specialEvent ? 1.3 : 1.0,
  };

  // Calculate overall multiplier (max 3x, min 1x)
  let multiplier =
    components.demandFactor *
    components.timeFactor *
    components.weatherFactor *
    components.eventFactor;

  multiplier = Math.max(1.0, Math.min(3.0, multiplier));

  const surgePrice = params.basePrice * multiplier;
  const reason = generateSurgeReason(components, multiplier);

  return {
    multiplier: Math.round(multiplier * 100) / 100,
    surgePrice: Math.round(surgePrice * 100) / 100,
    reason,
    components,
  };
}

/**
 * Calculate demand factor based on supply/demand ratio
 * Higher demand and lower supply = higher multiplier
 */
function calculateDemandFactor(
  rideRequests: number,
  availableDrivers: number
): number {
  if (availableDrivers === 0) return 3.0; // Emergency pricing

  const ratio = rideRequests / availableDrivers;

  if (ratio <= 1) return 1.0; // Balanced supply
  if (ratio <= 2) return 1.2; // Slight shortage
  if (ratio <= 3) return 1.5; // Moderate shortage
  if (ratio <= 5) return 2.0; // High shortage
  return 2.5; // Severe shortage
}

/**
 * Calculate time-based factor
 * Peak hours and weekends have higher multipliers
 */
function calculateTimeFactor(timeOfDay: number, dayOfWeek: number): number {
  // Weekend surge (Friday evening through Sunday)
  const isWeekend = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;
  const weekendMultiplier = isWeekend ? 1.15 : 1.0;

  // Peak hour multipliers
  let peakMultiplier = 1.0;

  if (timeOfDay >= 7 && timeOfDay < 9) {
    // Morning rush (7-9am)
    peakMultiplier = 1.3;
  } else if (timeOfDay >= 12 && timeOfDay < 13) {
    // Lunch rush (12-1pm)
    peakMultiplier = 1.15;
  } else if (timeOfDay >= 17 && timeOfDay < 19) {
    // Evening rush (5-7pm)
    peakMultiplier = 1.4;
  } else if (timeOfDay >= 22 || timeOfDay < 6) {
    // Late night/early morning (10pm-6am)
    peakMultiplier = 1.25;
  }

  return weekendMultiplier * peakMultiplier;
}

/**
 * Calculate weather-based factor
 * Bad weather increases demand and reduces driver availability
 */
function calculateWeatherFactor(
  weatherCondition?: "clear" | "rain" | "snow"
): number {
  switch (weatherCondition) {
    case "clear":
      return 1.0;
    case "rain":
      return 1.2;
    case "snow":
      return 1.4;
    default:
      return 1.0;
  }
}

/**
 * Generate human-readable reason for surge pricing
 */
function generateSurgeReason(
  components: {
    demandFactor: number;
    timeFactor: number;
    weatherFactor: number;
    eventFactor: number;
  },
  multiplier: number
): string {
  const reasons: string[] = [];

  if (components.demandFactor > 1.5) {
    reasons.push("High demand");
  }

  if (components.timeFactor > 1.2) {
    reasons.push("Peak hours");
  }

  if (components.weatherFactor > 1.1) {
    reasons.push("Bad weather");
  }

  if (components.eventFactor > 1.1) {
    reasons.push("Special event");
  }

  if (reasons.length === 0) {
    return "Standard pricing";
  }

  return `Surge pricing: ${reasons.join(", ")}`;
}

/**
 * Get surge pricing zones for a city
 * Returns areas with different surge multipliers
 */
export interface SurgeZone {
  id: string;
  name: string;
  centerLat: number;
  centerLng: number;
  radius: number; // in km
  multiplier: number;
  reason: string;
}

export function getSurgeZones(
  cityData: Array<{
    areaId: string;
    areaName: string;
    centerLat: number;
    centerLng: number;
    radius: number;
    rideRequests: number;
    availableDrivers: number;
  }>
): SurgeZone[] {
  return cityData.map((area) => {
    const result = calculateSurgePricing({
      basePrice: 10, // Dummy base price for multiplier calculation
      rideRequests: area.rideRequests,
      availableDrivers: area.availableDrivers,
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
    });

    return {
      id: area.areaId,
      name: area.areaName,
      centerLat: area.centerLat,
      centerLng: area.centerLng,
      radius: area.radius,
      multiplier: result.multiplier,
      reason: result.reason,
    };
  });
}

/**
 * Predict surge pricing for next hour
 * Uses historical patterns and current trends
 */
export function predictSurgePricing(
  currentTime: Date,
  historicalData: Array<{
    hour: number;
    avgMultiplier: number;
    avgDemand: number;
  }>
): number {
  const nextHour = (currentTime.getHours() + 1) % 24;

  // Find historical data for this hour
  const historicalEntry = historicalData.find((d) => d.hour === nextHour);

  if (!historicalEntry) {
    return 1.0;
  }

  // Apply trend adjustment (simple linear trend)
  const trendAdjustment = 0.95; // Slight decrease expected
  const predictedMultiplier = historicalEntry.avgMultiplier * trendAdjustment;

  return Math.max(1.0, Math.min(3.0, predictedMultiplier));
}

/**
 * Calculate optimal driver incentive to balance supply
 */
export function calculateDriverIncentive(
  demandFactor: number,
  currentDrivers: number,
  targetDrivers: number
): {
  incentivePercentage: number;
  estimatedDriversNeeded: number;
  recommendedAction: string;
} {
  const driverShortfall = Math.max(0, targetDrivers - currentDrivers);
  const shortfallPercentage = (driverShortfall / targetDrivers) * 100;

  let incentivePercentage = 0;
  let recommendedAction = "No action needed";

  if (shortfallPercentage > 30) {
    incentivePercentage = 25; // 25% bonus
    recommendedAction = "Urgent: Offer 25% bonus to attract drivers";
  } else if (shortfallPercentage > 20) {
    incentivePercentage = 15; // 15% bonus
    recommendedAction = "High priority: Offer 15% bonus";
  } else if (shortfallPercentage > 10) {
    incentivePercentage = 10; // 10% bonus
    recommendedAction = "Medium priority: Offer 10% bonus";
  } else if (shortfallPercentage > 5) {
    incentivePercentage = 5; // 5% bonus
    recommendedAction = "Low priority: Offer 5% bonus";
  }

  return {
    incentivePercentage,
    estimatedDriversNeeded: driverShortfall,
    recommendedAction,
  };
}

/**
 * Calculate impact of surge pricing on rider demand
 * Higher prices may reduce demand elasticity
 */
export function estimateDemandElasticity(
  multiplier: number,
  baselineRides: number
): {
  estimatedRides: number;
  demandReduction: number;
  revenueImpact: number;
} {
  // Elasticity coefficient: -0.5 (for every 10% price increase, demand drops 5%)
  const elasticity = -0.5;
  const priceIncrease = (multiplier - 1) * 100; // in percentage
  const demandReduction = (priceIncrease * elasticity) / 100;
  const estimatedRides = baselineRides * (1 + demandReduction);

  // Revenue impact = (new rides * multiplied price) - (old rides * base price)
  const revenueImpact = estimatedRides * multiplier - baselineRides;

  return {
    estimatedRides: Math.round(estimatedRides),
    demandReduction: Math.round(demandReduction * 100) / 100,
    revenueImpact: Math.round(revenueImpact * 100) / 100,
  };
}
