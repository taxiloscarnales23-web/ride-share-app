/**
 * Predictive Analytics Service
 * Forecasts demand and optimizes driver allocation
 */

export interface HistoricalData {
  timestamp: Date;
  hour: number;
  dayOfWeek: number;
  rideRequests: number;
  availableDrivers: number;
  avgRidePrice: number;
  weather: string;
  specialEvent?: boolean;
}

export interface DemandForecast {
  timestamp: Date;
  predictedRideRequests: number;
  confidence: number;
  recommendedDrivers: number;
  suggestedPriceMultiplier: number;
  factors: {
    historicalTrend: number;
    seasonalFactor: number;
    weatherImpact: number;
    eventImpact: number;
  };
}

/**
 * Predict demand for next hour using historical patterns
 */
export function predictDemand(
  historicalData: HistoricalData[],
  targetHour: number,
  targetDayOfWeek: number,
  weather?: string,
  specialEvent?: boolean
): DemandForecast {
  // Filter historical data for same hour and day
  const similarData = historicalData.filter(
    (d) => d.hour === targetHour && d.dayOfWeek === targetDayOfWeek
  );

  if (similarData.length === 0) {
    return generateDefaultForecast(targetHour, targetDayOfWeek);
  }

  // Calculate base demand from historical average
  const avgRideRequests =
    similarData.reduce((sum, d) => sum + d.rideRequests, 0) / similarData.length;
  const avgDrivers =
    similarData.reduce((sum, d) => sum + d.availableDrivers, 0) / similarData.length;

  // Calculate trend (simple linear regression)
  const trend = calculateTrend(similarData);

  // Calculate seasonal factor
  const seasonalFactor = calculateSeasonalFactor(targetHour, targetDayOfWeek);

  // Calculate weather impact
  const weatherImpact = calculateWeatherImpact(weather);

  // Calculate event impact
  const eventImpact = specialEvent ? 1.4 : 1.0;

  // Combine factors
  const predictedRequests = Math.round(
    avgRideRequests * trend * seasonalFactor * weatherImpact * eventImpact
  );

  // Calculate recommended drivers (maintain 1.5:1 driver to request ratio)
  const recommendedDrivers = Math.ceil(predictedRequests * 1.5);

  // Calculate confidence score
  const confidence = calculateConfidence(similarData.length, trend);

  // Suggest price multiplier based on predicted demand
  const suggestedPriceMultiplier = calculatePriceMultiplier(
    predictedRequests,
    recommendedDrivers
  );

  return {
    timestamp: new Date(),
    predictedRideRequests: predictedRequests,
    confidence,
    recommendedDrivers,
    suggestedPriceMultiplier,
    factors: {
      historicalTrend: trend,
      seasonalFactor,
      weatherImpact,
      eventImpact,
    },
  };
}

/**
 * Calculate trend using simple linear regression
 */
function calculateTrend(data: HistoricalData[]): number {
  if (data.length < 2) return 1.0;

  const sorted = [...data].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const n = sorted.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = sorted.map((d) => d.rideRequests);

  const xMean = x.reduce((a, b) => a + b) / n;
  const yMean = y.reduce((a, b) => a + b) / n;

  const numerator = x.reduce((sum, xi, i) => sum + (xi - xMean) * (y[i] - yMean), 0);
  const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - xMean, 2), 0);

  if (denominator === 0) return 1.0;

  const slope = numerator / denominator;
  const lastValue = y[n - 1];
  const expectedValue = lastValue + slope;

  return Math.max(0.8, Math.min(1.2, expectedValue / lastValue));
}

/**
 * Calculate seasonal factor based on time patterns
 */
function calculateSeasonalFactor(hour: number, dayOfWeek: number): number {
  let factor = 1.0;

  // Morning rush (7-9am)
  if (hour >= 7 && hour < 9) factor *= 1.4;
  // Lunch (12-1pm)
  else if (hour >= 12 && hour < 13) factor *= 1.2;
  // Evening rush (5-7pm)
  else if (hour >= 17 && hour < 19) factor *= 1.5;
  // Late night (10pm-6am)
  else if (hour >= 22 || hour < 6) factor *= 1.1;
  // Off-peak
  else factor *= 0.9;

  // Weekend boost
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    factor *= 1.15;
  }

  return factor;
}

/**
 * Calculate weather impact on demand
 */
function calculateWeatherImpact(weather?: string): number {
  switch (weather) {
    case "clear":
      return 1.0;
    case "cloudy":
      return 1.05;
    case "rain":
      return 1.3;
    case "heavy_rain":
      return 1.5;
    case "snow":
      return 1.4;
    case "fog":
      return 1.15;
    default:
      return 1.0;
  }
}

/**
 * Calculate confidence score (0-1)
 */
function calculateConfidence(dataPoints: number, trend: number): number {
  // More data points = higher confidence
  const dataConfidence = Math.min(dataPoints / 30, 1.0);

  // Stable trend = higher confidence
  const trendConfidence = 1 - Math.abs(trend - 1.0) * 0.5;

  return (dataConfidence + trendConfidence) / 2;
}

/**
 * Calculate suggested price multiplier
 */
function calculatePriceMultiplier(
  predictedRequests: number,
  recommendedDrivers: number
): number {
  const ratio = predictedRequests / recommendedDrivers;

  if (ratio <= 0.8) return 0.9; // Lower prices
  if (ratio <= 1.0) return 1.0; // Standard pricing
  if (ratio <= 1.5) return 1.2; // Slight increase
  if (ratio <= 2.0) return 1.5; // Moderate increase
  if (ratio <= 3.0) return 2.0; // High increase
  return 2.5; // Maximum increase
}

/**
 * Generate default forecast when no historical data available
 */
function generateDefaultForecast(
  hour: number,
  dayOfWeek: number
): DemandForecast {
  // Use seasonal factor as base estimate
  const seasonalFactor = calculateSeasonalFactor(hour, dayOfWeek);
  const baseRequests = 50; // Default base
  const predictedRequests = Math.round(baseRequests * seasonalFactor);

  return {
    timestamp: new Date(),
    predictedRideRequests: predictedRequests,
    confidence: 0.3, // Low confidence without data
    recommendedDrivers: Math.ceil(predictedRequests * 1.5),
    suggestedPriceMultiplier: calculatePriceMultiplier(
      predictedRequests,
      Math.ceil(predictedRequests * 1.5)
    ),
    factors: {
      historicalTrend: 1.0,
      seasonalFactor,
      weatherImpact: 1.0,
      eventImpact: 1.0,
    },
  };
}

/**
 * Predict demand for entire week
 */
export function predictWeekDemand(
  historicalData: HistoricalData[]
): DemandForecast[] {
  const forecasts: DemandForecast[] = [];
  const now = new Date();

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + day);
      targetDate.setHours(hour, 0, 0, 0);

      const forecast = predictDemand(
        historicalData,
        hour,
        targetDate.getDay()
      );
      forecast.timestamp = targetDate;
      forecasts.push(forecast);
    }
  }

  return forecasts;
}

/**
 * Identify peak demand periods
 */
export function identifyPeakPeriods(
  forecasts: DemandForecast[]
): DemandForecast[] {
  const avgDemand =
    forecasts.reduce((sum, f) => sum + f.predictedRideRequests, 0) /
    forecasts.length;

  return forecasts.filter(
    (f) => f.predictedRideRequests > avgDemand * 1.3
  );
}

/**
 * Calculate optimal driver allocation
 */
export function calculateOptimalAllocation(
  forecasts: DemandForecast[],
  totalDrivers: number
): Map<string, number> {
  const allocation = new Map<string, number>();
  const totalDemand = forecasts.reduce(
    (sum, f) => sum + f.predictedRideRequests,
    0
  );

  forecasts.forEach((forecast) => {
    const timeSlot = `${forecast.timestamp.getHours()}:00`;
    const demandShare = forecast.predictedRideRequests / totalDemand;
    const allocatedDrivers = Math.round(totalDrivers * demandShare);

    allocation.set(timeSlot, allocatedDrivers);
  });

  return allocation;
}

/**
 * Predict revenue based on demand forecast
 */
export function predictRevenue(
  forecasts: DemandForecast[],
  avgRidePrice: number
): {
  totalRevenue: number;
  avgRevenuePerHour: number;
  peakHourRevenue: number;
  offPeakRevenue: number;
} {
  let totalRevenue = 0;
  let peakHourRevenue = 0;
  let offPeakRevenue = 0;

  forecasts.forEach((forecast) => {
    const revenue =
      forecast.predictedRideRequests *
      avgRidePrice *
      forecast.suggestedPriceMultiplier;
    totalRevenue += revenue;

    if (forecast.suggestedPriceMultiplier > 1.2) {
      peakHourRevenue += revenue;
    } else {
      offPeakRevenue += revenue;
    }
  });

  return {
    totalRevenue: Math.round(totalRevenue),
    avgRevenuePerHour: Math.round(totalRevenue / forecasts.length),
    peakHourRevenue: Math.round(peakHourRevenue),
    offPeakRevenue: Math.round(offPeakRevenue),
  };
}

/**
 * Recommend driver incentives based on forecast
 */
export function recommendIncentives(
  forecasts: DemandForecast[]
): Array<{
  timeSlot: string;
  incentivePercentage: number;
  reason: string;
}> {
  const incentives: Array<{
    timeSlot: string;
    incentivePercentage: number;
    reason: string;
  }> = [];

  forecasts.forEach((forecast) => {
    const timeSlot = `${forecast.timestamp.getHours()}:00`;
    let incentivePercentage = 0;
    let reason = "No incentive needed";

    if (forecast.suggestedPriceMultiplier > 2.0) {
      incentivePercentage = 20;
      reason = "Critical shortage predicted";
    } else if (forecast.suggestedPriceMultiplier > 1.5) {
      incentivePercentage = 15;
      reason = "High demand predicted";
    } else if (forecast.suggestedPriceMultiplier > 1.2) {
      incentivePercentage = 10;
      reason = "Moderate demand predicted";
    }

    if (incentivePercentage > 0) {
      incentives.push({
        timeSlot,
        incentivePercentage,
        reason,
      });
    }
  });

  return incentives;
}
