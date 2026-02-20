export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export interface SMSTemplate {
  id: string;
  name: string;
  body: string;
  variables: string[];
}

export interface NotificationLog {
  id: string;
  userId: string;
  type: "email" | "sms";
  templateId: string;
  recipient: string;
  status: "sent" | "failed" | "pending";
  sentAt?: Date;
  error?: string;
}

export class CommunicationsService {
  private emailTemplates: Map<string, EmailTemplate> = new Map();
  private smsTemplates: Map<string, SMSTemplate> = new Map();
  private notificationLogs: NotificationLog[] = [];

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    // Email templates
    this.emailTemplates.set("ride_confirmation", {
      id: "ride_confirmation",
      name: "Ride Confirmation",
      subject: "Your ride with {{driver_name}} is confirmed",
      body: "Hi {{user_name}},\n\nYour ride has been confirmed.\nDriver: {{driver_name}}\nPickup: {{pickup_location}}\nDestination: {{destination}}\nFare: ${{fare}}\n\nThank you for using our service!",
      variables: ["user_name", "driver_name", "pickup_location", "destination", "fare"],
    });

    this.emailTemplates.set("payment_receipt", {
      id: "payment_receipt",
      name: "Payment Receipt",
      subject: "Payment receipt for your ride",
      body: "Hi {{user_name}},\n\nThank you for your payment.\nAmount: ${{amount}}\nDate: {{date}}\nMethod: {{method}}\nRide ID: {{ride_id}}\n\nThank you!",
      variables: ["user_name", "amount", "date", "method", "ride_id"],
    });

    this.emailTemplates.set("support_response", {
      id: "support_response",
      name: "Support Response",
      subject: "Response to your support ticket",
      body: "Hi {{user_name}},\n\nThank you for contacting us.\n\n{{response}}\n\nBest regards,\nSupport Team",
      variables: ["user_name", "response"],
    });

    // SMS templates
    this.smsTemplates.set("ride_accepted", {
      id: "ride_accepted",
      name: "Ride Accepted",
      body: "Your ride with {{driver_name}} is confirmed. ETA: {{eta}} minutes. Track: {{tracking_link}}",
      variables: ["driver_name", "eta", "tracking_link"],
    });

    this.smsTemplates.set("driver_arriving", {
      id: "driver_arriving",
      name: "Driver Arriving",
      body: "{{driver_name}} is {{distance}}m away. Plate: {{plate_number}}",
      variables: ["driver_name", "distance", "plate_number"],
    });

    this.smsTemplates.set("ride_completed", {
      id: "ride_completed",
      name: "Ride Completed",
      body: "Ride completed! Fare: ${{fare}}. Rate your driver: {{rating_link}}",
      variables: ["fare", "rating_link"],
    });
  }

  /**
   * Send email
   */
  async sendEmail(userId: string, email: string, templateId: string, variables: Record<string, any>): Promise<NotificationLog> {
    const template = this.emailTemplates.get(templateId);
    if (!template) {
      throw new Error(`Email template ${templateId} not found`);
    }

    let subject = template.subject;
    let body = template.body;

    // Replace variables
    for (const [key, value] of Object.entries(variables)) {
      subject = subject.replace(`{{${key}}}`, String(value));
      body = body.replace(`{{${key}}}`, String(value));
    }

    const log: NotificationLog = {
      id: `email-${Date.now()}`,
      userId,
      type: "email",
      templateId,
      recipient: email,
      status: Math.random() > 0.05 ? "sent" : "failed", // 95% success rate
      sentAt: new Date(),
    };

    this.notificationLogs.push(log);
    console.log(`Email sent to ${email}: ${subject}`);

    return log;
  }

  /**
   * Send SMS
   */
  async sendSMS(userId: string, phone: string, templateId: string, variables: Record<string, any>): Promise<NotificationLog> {
    const template = this.smsTemplates.get(templateId);
    if (!template) {
      throw new Error(`SMS template ${templateId} not found`);
    }

    let body = template.body;

    // Replace variables
    for (const [key, value] of Object.entries(variables)) {
      body = body.replace(`{{${key}}}`, String(value));
    }

    const log: NotificationLog = {
      id: `sms-${Date.now()}`,
      userId,
      type: "sms",
      templateId,
      recipient: phone,
      status: Math.random() > 0.08 ? "sent" : "failed", // 92% success rate
      sentAt: new Date(),
    };

    this.notificationLogs.push(log);
    console.log(`SMS sent to ${phone}: ${body.substring(0, 50)}...`);

    return log;
  }

  /**
   * Send bulk email
   */
  async sendBulkEmail(userIds: string[], emails: string[], templateId: string, variables: Record<string, any>): Promise<NotificationLog[]> {
    const logs: NotificationLog[] = [];

    for (let i = 0; i < userIds.length; i++) {
      const log = await this.sendEmail(userIds[i], emails[i], templateId, variables);
      logs.push(log);
    }

    return logs;
  }

  /**
   * Get email templates
   */
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return Array.from(this.emailTemplates.values());
  }

  /**
   * Get SMS templates
   */
  async getSMSTemplates(): Promise<SMSTemplate[]> {
    return Array.from(this.smsTemplates.values());
  }

  /**
   * Get notification logs
   */
  async getNotificationLogs(userId?: string, limit: number = 100): Promise<NotificationLog[]> {
    let logs = this.notificationLogs;

    if (userId) {
      logs = logs.filter((l) => l.userId === userId);
    }

    return logs.slice(-limit).reverse();
  }

  /**
   * Get delivery statistics
   */
  async getDeliveryStats(): Promise<{
    totalSent: number;
    emailsSent: number;
    smsSent: number;
    successRate: number;
    failureRate: number;
  }> {
    const total = this.notificationLogs.length;
    const emails = this.notificationLogs.filter((l) => l.type === "email").length;
    const sms = this.notificationLogs.filter((l) => l.type === "sms").length;
    const successful = this.notificationLogs.filter((l) => l.status === "sent").length;

    return {
      totalSent: total,
      emailsSent: emails,
      smsSent: sms,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      failureRate: total > 0 ? ((total - successful) / total) * 100 : 0,
    };
  }

  /**
   * Retry failed notifications
   */
  async retryFailed(): Promise<number> {
    const failed = this.notificationLogs.filter((l) => l.status === "failed");
    let retried = 0;

    for (const log of failed) {
      if (Math.random() > 0.1) {
        // 90% success on retry
        log.status = "sent";
        retried++;
      }
    }

    console.log(`Retried ${retried} failed notifications`);
    return retried;
  }
}

export const communicationsService = new CommunicationsService();
