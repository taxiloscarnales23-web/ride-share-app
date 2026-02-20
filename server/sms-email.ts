/**
 * SMS and Email Notification Service
 * Handles sending SMS alerts and email receipts for ride-sharing platform
 */

export interface NotificationTemplate {
  subject: string;
  body: string;
  smsText: string;
}

export interface RideNotification {
  type: 'ride_accepted' | 'ride_started' | 'ride_completed' | 'payment_received';
  rideId: string;
  recipientPhone?: string;
  recipientEmail?: string;
  driverName?: string;
  riderName?: string;
  amount?: number;
  pickupLocation?: string;
  dropoffLocation?: string;
}

export class SMSEmailService {
  /**
   * Get notification template based on ride event type
   */
  getTemplate(type: RideNotification['type']): NotificationTemplate {
    const templates: Record<RideNotification['type'], NotificationTemplate> = {
      ride_accepted: {
        subject: 'Your Ride Has Been Accepted',
        body: 'Your ride request has been accepted. Driver details will be shared shortly.',
        smsText: 'Your ride has been accepted. Driver is on the way.'
      },
      ride_started: {
        subject: 'Your Ride Has Started',
        body: 'Your driver has started the journey to your destination.',
        smsText: 'Your ride has started. Driver is heading to your destination.'
      },
      ride_completed: {
        subject: 'Ride Completed - Cash Payment',
        body: 'Your ride has been completed. Please pay the driver in cash.',
        smsText: 'Ride completed. Please pay the driver in cash.'
      },
      payment_received: {
        subject: 'Payment Received',
        body: 'Cash payment has been confirmed. Thank you for using our service.',
        smsText: 'Payment confirmed. Thank you!'
      }
    };
    return templates[type];
  }

  /**
   * Send SMS notification
   */
  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      // In production, integrate with Twilio, AWS SNS, or similar
      console.log(`[SMS] To: ${phoneNumber}, Message: ${message}`);
      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  /**
   * Send email notification
   */
  async sendEmail(
    email: string,
    subject: string,
    htmlBody: string
  ): Promise<boolean> {
    try {
      // In production, integrate with SendGrid, AWS SES, or similar
      console.log(`[EMAIL] To: ${email}, Subject: ${subject}`);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send ride notification (SMS + Email)
   */
  async sendRideNotification(notification: RideNotification): Promise<void> {
    const template = this.getTemplate(notification.type);

    // Send SMS if phone number provided
    if (notification.recipientPhone) {
      await this.sendSMS(notification.recipientPhone, template.smsText);
    }

    // Send Email if email provided
    if (notification.recipientEmail) {
      const htmlBody = this.buildEmailHTML(template.body, notification);
      await this.sendEmail(notification.recipientEmail, template.subject, htmlBody);
    }
  }

  /**
   * Build HTML email body with ride details
   */
  private buildEmailHTML(body: string, notification: RideNotification): string {
    let details = '';

    if (notification.driverName) {
      details += `<p><strong>Driver:</strong> ${notification.driverName}</p>`;
    }
    if (notification.amount) {
      details += `<p><strong>Amount:</strong> $${notification.amount.toFixed(2)}</p>`;
    }
    if (notification.pickupLocation) {
      details += `<p><strong>Pickup:</strong> ${notification.pickupLocation}</p>`;
    }
    if (notification.dropoffLocation) {
      details += `<p><strong>Dropoff:</strong> ${notification.dropoffLocation}</p>`;
    }

    return `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>Ride Notification</h2>
          <p>${body}</p>
          ${details}
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Ride ID: ${notification.rideId}
          </p>
        </body>
      </html>
    `;
  }

  /**
   * Send payment receipt via email
   */
  async sendPaymentReceipt(
    email: string,
    rideId: string,
    amount: number,
    paymentMethod: string,
    timestamp: Date
  ): Promise<boolean> {
    const htmlBody = `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>Payment Receipt</h2>
          <p>Thank you for your payment!</p>
          <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Ride ID:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${rideId}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Amount:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">$${amount.toFixed(2)}</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Payment Method:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Date & Time:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${timestamp.toLocaleString()}</td>
            </tr>
          </table>
          <p style="color: #666; font-size: 12px;">
            This is an automated receipt. Please keep it for your records.
          </p>
        </body>
      </html>
    `;

    return this.sendEmail(email, 'Payment Receipt', htmlBody);
  }
}

export const smsEmailService = new SMSEmailService();
