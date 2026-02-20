export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  secret: string;
  createdAt: Date;
  lastTriggeredAt?: Date;
  failureCount: number;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, any>;
  timestamp: Date;
  deliveryStatus: "pending" | "delivered" | "failed";
  retryCount: number;
}

export class WebhookService {
  private endpoints: Map<string, WebhookEndpoint> = new Map();
  private events: WebhookEvent[] = [];
  private deliveryLog: Array<{ eventId: string; endpointId: string; status: string; timestamp: Date }> = [];

  constructor() {
    this.initializeDefaults();
  }

  private initializeDefaults(): void {
    // Default webhook events
  }

  /**
   * Register webhook endpoint
   */
  async registerEndpoint(url: string, events: string[]): Promise<WebhookEndpoint> {
    const endpoint: WebhookEndpoint = {
      id: `webhook-${Date.now()}`,
      url,
      events,
      active: true,
      secret: this.generateSecret(),
      createdAt: new Date(),
      failureCount: 0,
    };

    this.endpoints.set(endpoint.id, endpoint);
    console.log(`Webhook registered: ${endpoint.id} -> ${url}`);

    return endpoint;
  }

  /**
   * Trigger webhook event
   */
  async triggerEvent(type: string, data: Record<string, any>): Promise<WebhookEvent> {
    const event: WebhookEvent = {
      id: `event-${Date.now()}`,
      type,
      data,
      timestamp: new Date(),
      deliveryStatus: "pending",
      retryCount: 0,
    };

    this.events.push(event);

    // Deliver to matching endpoints
    for (const endpoint of this.endpoints.values()) {
      if (endpoint.active && endpoint.events.includes(type)) {
        await this.deliverEvent(event, endpoint);
      }
    }

    return event;
  }

  /**
   * Deliver event to endpoint
   */
  private async deliverEvent(event: WebhookEvent, endpoint: WebhookEndpoint): Promise<void> {
    try {
      // Simulate HTTP delivery
      const success = Math.random() > 0.1; // 90% success rate

      if (success) {
        event.deliveryStatus = "delivered";
        endpoint.lastTriggeredAt = new Date();
        endpoint.failureCount = 0;

        this.deliveryLog.push({
          eventId: event.id,
          endpointId: endpoint.id,
          status: "success",
          timestamp: new Date(),
        });

        console.log(`Webhook delivered: ${event.type} -> ${endpoint.url}`);
      } else {
        throw new Error("Delivery failed");
      }
    } catch (error) {
      event.deliveryStatus = "failed";
      endpoint.failureCount++;

      this.deliveryLog.push({
        eventId: event.id,
        endpointId: endpoint.id,
        status: "failed",
        timestamp: new Date(),
      });

      // Disable endpoint after 5 failures
      if (endpoint.failureCount >= 5) {
        endpoint.active = false;
        console.log(`Webhook disabled due to failures: ${endpoint.id}`);
      }

      console.log(`Webhook delivery failed: ${event.type} -> ${endpoint.url}`);
    }
  }

  /**
   * Get endpoint
   */
  async getEndpoint(endpointId: string): Promise<WebhookEndpoint | null> {
    return this.endpoints.get(endpointId) || null;
  }

  /**
   * List endpoints
   */
  async listEndpoints(): Promise<WebhookEndpoint[]> {
    return Array.from(this.endpoints.values());
  }

  /**
   * Update endpoint
   */
  async updateEndpoint(endpointId: string, updates: Partial<WebhookEndpoint>): Promise<WebhookEndpoint | null> {
    const endpoint = this.endpoints.get(endpointId);
    if (!endpoint) return null;

    Object.assign(endpoint, updates);
    return endpoint;
  }

  /**
   * Delete endpoint
   */
  async deleteEndpoint(endpointId: string): Promise<boolean> {
    return this.endpoints.delete(endpointId);
  }

  /**
   * Get delivery history
   */
  async getDeliveryHistory(endpointId?: string, limit: number = 100): Promise<Array<{ eventId: string; endpointId: string; status: string; timestamp: Date }>> {
    let history = this.deliveryLog;

    if (endpointId) {
      history = history.filter((h) => h.endpointId === endpointId);
    }

    return history.slice(-limit).reverse();
  }

  /**
   * Get webhook statistics
   */
  async getStats(): Promise<{
    totalEndpoints: number;
    activeEndpoints: number;
    totalEvents: number;
    deliveredEvents: number;
    failedEvents: number;
    successRate: number;
  }> {
    const totalEndpoints = this.endpoints.size;
    const activeEndpoints = Array.from(this.endpoints.values()).filter((e) => e.active).length;
    const totalEvents = this.events.length;
    const deliveredEvents = this.events.filter((e) => e.deliveryStatus === "delivered").length;
    const failedEvents = this.events.filter((e) => e.deliveryStatus === "failed").length;
    const successRate = totalEvents > 0 ? (deliveredEvents / totalEvents) * 100 : 0;

    return {
      totalEndpoints,
      activeEndpoints,
      totalEvents,
      deliveredEvents,
      failedEvents,
      successRate,
    };
  }

  /**
   * Retry failed events
   */
  async retryFailedEvents(): Promise<number> {
    const failed = this.events.filter((e) => e.deliveryStatus === "failed" && e.retryCount < 3);
    let retried = 0;

    for (const event of failed) {
      event.retryCount++;

      for (const endpoint of this.endpoints.values()) {
        if (endpoint.active && endpoint.events.includes(event.type)) {
          await this.deliverEvent(event, endpoint);
          retried++;
        }
      }
    }

    return retried;
  }

  /**
   * Test webhook
   */
  async testWebhook(endpointId: string): Promise<{ success: boolean; message: string }> {
    const endpoint = this.endpoints.get(endpointId);
    if (!endpoint) {
      return { success: false, message: "Endpoint not found" };
    }

    try {
      const testEvent = await this.triggerEvent("webhook.test", { timestamp: new Date() });
      return { success: testEvent.deliveryStatus === "delivered", message: "Test event sent" };
    } catch (error) {
      return { success: false, message: String(error) };
    }
  }

  /**
   * Generate secret for webhook
   */
  private generateSecret(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

export const webhookService = new WebhookService();
