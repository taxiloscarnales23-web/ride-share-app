/**
 * API Marketplace Service
 * Manages third-party integrations, API access, and revenue sharing
 */

export type IntegrationType =
  | "payment"
  | "navigation"
  | "analytics"
  | "communication"
  | "insurance"
  | "other";
export type IntegrationStatus = "draft" | "published" | "suspended" | "deprecated";

export interface ApiIntegration {
  integrationId: string;
  developerId: string;
  name: string;
  description: string;
  type: IntegrationType;
  status: IntegrationStatus;
  apiEndpoint: string;
  webhookUrl?: string;
  documentation: string;
  version: string;
  rating: number;
  downloads: number;
  revenueShare: number; // percentage
  createdAt: Date;
  updatedAt: Date;
}

export interface DeveloperAccount {
  developerId: string;
  companyName: string;
  email: string;
  apiKey: string;
  apiSecret: string;
  integrations: string[];
  totalEarnings: number;
  status: "active" | "suspended" | "inactive";
  createdAt: Date;
}

export interface ApiUsage {
  usageId: string;
  integrationId: string;
  developerId: string;
  requestCount: number;
  responseTime: number;
  errorRate: number;
  date: Date;
}

export interface SandboxEnvironment {
  sandboxId: string;
  developerId: string;
  integrationId: string;
  testApiKey: string;
  testApiSecret: string;
  createdAt: Date;
  expiresAt: Date;
}

export class ApiMarketplaceService {
  private integrations: Map<string, ApiIntegration> = new Map();
  private developers: Map<string, DeveloperAccount> = new Map();
  private usage: Map<string, ApiUsage> = new Map();
  private sandboxes: Map<string, SandboxEnvironment> = new Map();

  /**
   * Register a new developer
   */
  registerDeveloper(
    companyName: string,
    email: string
  ): DeveloperAccount | null {
    const developerId = `dev_${Date.now()}`;
    const apiKey = this.generateApiKey();
    const apiSecret = this.generateApiSecret();

    const developer: DeveloperAccount = {
      developerId,
      companyName,
      email,
      apiKey,
      apiSecret,
      integrations: [],
      totalEarnings: 0,
      status: "active",
      createdAt: new Date(),
    };

    this.developers.set(developerId, developer);
    return developer;
  }

  /**
   * Submit integration for marketplace
   */
  submitIntegration(
    developerId: string,
    name: string,
    description: string,
    type: IntegrationType,
    apiEndpoint: string,
    documentation: string
  ): ApiIntegration | null {
    const developer = this.developers.get(developerId);
    if (!developer) return null;

    const integrationId = `int_${Date.now()}`;
    const integration: ApiIntegration = {
      integrationId,
      developerId,
      name,
      description,
      type,
      status: "draft",
      apiEndpoint,
      documentation,
      version: "1.0.0",
      rating: 0,
      downloads: 0,
      revenueShare: 0.3, // 30% default
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.integrations.set(integrationId, integration);
    developer.integrations.push(integrationId);

    return integration;
  }

  /**
   * Publish integration to marketplace
   */
  publishIntegration(integrationId: string): boolean {
    const integration = this.integrations.get(integrationId);
    if (!integration || integration.status !== "draft") return false;

    integration.status = "published";
    integration.updatedAt = new Date();
    return true;
  }

  /**
   * Get marketplace integrations
   */
  getMarketplaceIntegrations(type?: IntegrationType): ApiIntegration[] {
    return Array.from(this.integrations.values()).filter((int) => {
      if (int.status !== "published") return false;
      if (type && int.type !== type) return false;
      return true;
    });
  }

  /**
   * Rate integration
   */
  rateIntegration(integrationId: string, rating: number): boolean {
    const integration = this.integrations.get(integrationId);
    if (!integration || rating < 1 || rating > 5) return false;

    // Simple average rating calculation
    integration.rating = (integration.rating + rating) / 2;
    return true;
  }

  /**
   * Create sandbox environment
   */
  createSandbox(
    developerId: string,
    integrationId: string
  ): SandboxEnvironment | null {
    const developer = this.developers.get(developerId);
    const integration = this.integrations.get(integrationId);

    if (!developer || !integration) return null;

    const sandboxId = `sandbox_${Date.now()}`;
    const testApiKey = `test_${this.generateApiKey()}`;
    const testApiSecret = `test_${this.generateApiSecret()}`;

    const sandbox: SandboxEnvironment = {
      sandboxId,
      developerId,
      integrationId,
      testApiKey,
      testApiSecret,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    };

    this.sandboxes.set(sandboxId, sandbox);
    return sandbox;
  }

  /**
   * Track API usage
   */
  trackUsage(
    integrationId: string,
    developerId: string,
    requestCount: number,
    responseTime: number,
    errorRate: number
  ): ApiUsage {
    const usageId = `usage_${Date.now()}`;
    const usage: ApiUsage = {
      usageId,
      integrationId,
      developerId,
      requestCount,
      responseTime,
      errorRate,
      date: new Date(),
    };

    this.usage.set(usageId, usage);
    return usage;
  }

  /**
   * Calculate developer earnings
   */
  calculateEarnings(
    developerId: string,
    period: "daily" | "weekly" | "monthly"
  ): number {
    const developer = this.developers.get(developerId);
    if (!developer) return 0;

    const now = new Date();
    let startDate = new Date();

    if (period === "daily") {
      startDate.setDate(now.getDate() - 1);
    } else if (period === "weekly") {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setMonth(now.getMonth() - 1);
    }

    let earnings = 0;
    for (const usage of this.usage.values()) {
      if (
        usage.developerId === developerId &&
        usage.date >= startDate &&
        usage.date <= now
      ) {
        const integration = this.integrations.get(usage.integrationId);
        if (integration) {
          // Simple calculation: requests * revenue share
          earnings += usage.requestCount * integration.revenueShare * 0.01;
        }
      }
    }

    return earnings;
  }

  /**
   * Get developer account
   */
  getDeveloper(developerId: string): DeveloperAccount | null {
    return this.developers.get(developerId) || null;
  }

  /**
   * Get developer integrations
   */
  getDeveloperIntegrations(developerId: string): ApiIntegration[] {
    return Array.from(this.integrations.values()).filter(
      (int) => int.developerId === developerId
    );
  }

  /**
   * Suspend integration
   */
  suspendIntegration(integrationId: string, reason: string): boolean {
    const integration = this.integrations.get(integrationId);
    if (!integration) return false;

    integration.status = "suspended";
    integration.updatedAt = new Date();
    return true;
  }

  /**
   * Generate unique API key
   */
  private generateApiKey(): string {
    return Math.random().toString(36).substr(2, 32);
  }

  /**
   * Generate unique API secret
   */
  private generateApiSecret(): string {
    return Math.random().toString(36).substr(2, 32);
  }
}

export const apiMarketplaceService = new ApiMarketplaceService();
