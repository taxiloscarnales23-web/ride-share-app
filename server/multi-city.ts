/**
 * Multi-City Support Service
 * Manages city-specific configurations, pricing, and regulations
 */

export interface CityConfiguration {
  cityId: string;
  cityName: string;
  country: string;
  timezone: string;
  currency: string;
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  minimumFare: number;
  surgePricingEnabled: boolean;
  maxSurgeMultiplier: number;
  acceptedVehicleTypes: string[];
  requiredDocuments: string[];
  regulations: {
    requiresLicense: boolean;
    requiresInsurance: boolean;
    requiresBackgroundCheck: boolean;
    maxVehicleAge: number;
    minDriverAge: number;
    maxDriverAge?: number;
    requiredLanguages: string[];
  };
  paymentMethods: Array<{
    method: string;
    enabled: boolean;
    fees: number;
  }>;
  operatingHours: {
    startTime: string;
    endTime: string;
    available24Hours: boolean;
  };
  supportedLanguages: string[];
  localTaxes: {
    taxType: string;
    taxRate: number;
    applicableTo: string;
  }[];
  emergencyNumbers: {
    police: string;
    ambulance: string;
    fire: string;
    localSupport: string;
  };
  serviceAreas: Array<{
    areaName: string;
    coordinates: {
      latitude: number;
      longitude: number;
      radius: number; // in km
    };
    enabled: boolean;
  }>;
  localPartners: Array<{
    partnerName: string;
    partnerType: string;
    contactInfo: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CityPricingRule {
  ruleId: string;
  cityId: string;
  ruleName: string;
  ruleType: "time_based" | "location_based" | "demand_based" | "event_based";
  conditions: {
    timeRange?: { startTime: string; endTime: string };
    dayOfWeek?: number[];
    location?: { latitude: number; longitude: number; radius: number };
    demandThreshold?: number;
    eventName?: string;
  };
  priceMultiplier: number;
  maxMultiplier: number;
  minMultiplier: number;
  enabled: boolean;
  startDate: Date;
  endDate?: Date;
}

export interface LocalRegulation {
  regulationId: string;
  cityId: string;
  regulationType:
    | "driver_requirements"
    | "vehicle_requirements"
    | "operational"
    | "safety"
    | "environmental";
  description: string;
  requirements: string[];
  penalties: string[];
  complianceDeadline: Date;
  enforcementLevel: "mandatory" | "recommended" | "optional";
  lastUpdated: Date;
}

/**
 * Multi-City Service
 */
export class MultiCityService {
  private cities: Map<string, CityConfiguration> = new Map();
  private pricingRules: Map<string, CityPricingRule[]> = new Map();
  private regulations: Map<string, LocalRegulation[]> = new Map();
  private activeCity: string = "default";

  /**
   * Register a new city
   */
  registerCity(config: CityConfiguration): void {
    this.cities.set(config.cityId, config);
    this.pricingRules.set(config.cityId, []);
    this.regulations.set(config.cityId, []);
  }

  /**
   * Get city configuration
   */
  getCityConfig(cityId: string): CityConfiguration | undefined {
    return this.cities.get(cityId);
  }

  /**
   * Update city configuration
   */
  updateCityConfig(cityId: string, updates: Partial<CityConfiguration>): CityConfiguration {
    const config = this.cities.get(cityId);
    if (!config) {
      throw new Error("City not found");
    }

    const updated = { ...config, ...updates, updatedAt: new Date() };
    this.cities.set(cityId, updated);
    return updated;
  }

  /**
   * Get all cities
   */
  getAllCities(): CityConfiguration[] {
    return Array.from(this.cities.values());
  }

  /**
   * Set active city
   */
  setActiveCity(cityId: string): void {
    if (!this.cities.has(cityId)) {
      throw new Error("City not found");
    }
    this.activeCity = cityId;
  }

  /**
   * Get active city
   */
  getActiveCity(): CityConfiguration | undefined {
    return this.cities.get(this.activeCity);
  }

  /**
   * Add pricing rule
   */
  addPricingRule(cityId: string, rule: CityPricingRule): void {
    if (!this.pricingRules.has(cityId)) {
      this.pricingRules.set(cityId, []);
    }
    this.pricingRules.get(cityId)!.push(rule);
  }

  /**
   * Get pricing rules for city
   */
  getPricingRules(cityId: string): CityPricingRule[] {
    return this.pricingRules.get(cityId) || [];
  }

  /**
   * Calculate fare for city
   */
  calculateFare(
    cityId: string,
    distanceKm: number,
    durationMinutes: number,
    rideType: string = "standard"
  ): { baseFare: number; distanceFare: number; timeFare: number; totalFare: number } {
    const config = this.cities.get(cityId);
    if (!config) {
      throw new Error("City not found");
    }

    const baseFare = config.baseFare;
    const distanceFare = distanceKm * config.perKmRate;
    const timeFare = durationMinutes * config.perMinuteRate;
    let totalFare = baseFare + distanceFare + timeFare;

    // Apply minimum fare
    totalFare = Math.max(totalFare, config.minimumFare);

    // Apply surge pricing if applicable
    if (config.surgePricingEnabled) {
      const surgeMultiplier = this.calculateSurgeMultiplier(cityId);
      totalFare *= surgeMultiplier;
    }

    return {
      baseFare,
      distanceFare,
      timeFare,
      totalFare: Math.round(totalFare * 100) / 100,
    };
  }

  /**
   * Calculate surge multiplier
   */
  private calculateSurgeMultiplier(cityId: string): number {
    const rules = this.getPricingRules(cityId);
    const activeRules = rules.filter((r) => r.enabled);

    let maxMultiplier = 1.0;
    for (const rule of activeRules) {
      if (this.isRuleActive(rule)) {
        maxMultiplier = Math.max(maxMultiplier, rule.priceMultiplier);
      }
    }

    const config = this.cities.get(cityId);
    if (config) {
      maxMultiplier = Math.min(maxMultiplier, config.maxSurgeMultiplier);
    }

    return maxMultiplier;
  }

  /**
   * Check if pricing rule is currently active
   */
  private isRuleActive(rule: CityPricingRule): boolean {
    if (!rule.enabled) return false;

    const now = new Date();

    if (rule.startDate > now) return false;
    if (rule.endDate && rule.endDate < now) return false;

    // Check time range
    if (rule.conditions.timeRange) {
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const [startHour, startMin] = rule.conditions.timeRange.startTime
        .split(":")
        .map(Number);
      const [endHour, endMin] = rule.conditions.timeRange.endTime.split(":").map(Number);
      const startTime = startHour * 100 + startMin;
      const endTime = endHour * 100 + endMin;

      if (currentTime < startTime || currentTime > endTime) return false;
    }

    // Check day of week
    if (rule.conditions.dayOfWeek) {
      if (!rule.conditions.dayOfWeek.includes(now.getDay())) return false;
    }

    return true;
  }

  /**
   * Add local regulation
   */
  addRegulation(cityId: string, regulation: LocalRegulation): void {
    if (!this.regulations.has(cityId)) {
      this.regulations.set(cityId, []);
    }
    this.regulations.get(cityId)!.push(regulation);
  }

  /**
   * Get regulations for city
   */
  getRegulations(cityId: string): LocalRegulation[] {
    return this.regulations.get(cityId) || [];
  }

  /**
   * Check compliance
   */
  checkCompliance(
    cityId: string,
    userType: "driver" | "rider",
    userData: any
  ): { compliant: boolean; issues: string[] } {
    const regulations = this.getRegulations(cityId);
    const issues: string[] = [];

    for (const regulation of regulations) {
      if (regulation.regulationType === "driver_requirements" && userType === "driver") {
        // Check driver requirements
        for (const requirement of regulation.requirements) {
          if (!userData[requirement]) {
            issues.push(`Missing: ${requirement}`);
          }
        }
      }
    }

    return {
      compliant: issues.length === 0,
      issues,
    };
  }

  /**
   * Get supported payment methods for city
   */
  getPaymentMethods(cityId: string): Array<{ method: string; enabled: boolean; fees: number }> {
    const config = this.cities.get(cityId);
    if (!config) {
      throw new Error("City not found");
    }
    return config.paymentMethods;
  }

  /**
   * Get service areas for city
   */
  getServiceAreas(cityId: string): CityConfiguration["serviceAreas"] {
    const config = this.cities.get(cityId);
    if (!config) {
      throw new Error("City not found");
    }
    return config.serviceAreas.filter((area) => area.enabled);
  }

  /**
   * Check if location is within service area
   */
  isLocationInServiceArea(
    cityId: string,
    latitude: number,
    longitude: number
  ): boolean {
    const areas = this.getServiceAreas(cityId);

    for (const area of areas) {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        area.coordinates.latitude,
        area.coordinates.longitude
      );

      if (distance <= area.coordinates.radius) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate distance between coordinates (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Get local support contact
   */
  getLocalSupport(cityId: string): CityConfiguration["emergencyNumbers"] | undefined {
    const config = this.cities.get(cityId);
    return config?.emergencyNumbers;
  }

  /**
   * Get supported languages for city
   */
  getSupportedLanguages(cityId: string): string[] {
    const config = this.cities.get(cityId);
    return config?.supportedLanguages || ["en"];
  }

  /**
   * Get local partners
   */
  getLocalPartners(cityId: string): CityConfiguration["localPartners"] {
    const config = this.cities.get(cityId);
    return config?.localPartners || [];
  }

  /**
   * Calculate local taxes
   */
  calculateLocalTaxes(cityId: string, amount: number): { taxType: string; amount: number }[] {
    const config = this.cities.get(cityId);
    if (!config) {
      throw new Error("City not found");
    }

    return config.localTaxes.map((tax) => ({
      taxType: tax.taxType,
      amount: (amount * tax.taxRate) / 100,
    }));
  }

  /**
   * Get city statistics
   */
  getCityStats(cityId: string): {
    cityName: string;
    totalCities: number;
    activeServiceAreas: number;
    supportedLanguages: number;
    paymentMethods: number;
  } {
    const config = this.cities.get(cityId);
    if (!config) {
      throw new Error("City not found");
    }

    return {
      cityName: config.cityName,
      totalCities: this.cities.size,
      activeServiceAreas: config.serviceAreas.filter((a) => a.enabled).length,
      supportedLanguages: config.supportedLanguages.length,
      paymentMethods: config.paymentMethods.filter((p) => p.enabled).length,
    };
  }
}

// Export singleton instance
export const multiCityService = new MultiCityService();
