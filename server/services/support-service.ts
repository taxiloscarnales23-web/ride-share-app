export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  category: "payment" | "ride" | "driver" | "technical" | "other";
  status: "open" | "in-progress" | "resolved" | "escalated";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: Date;
  updatedAt: Date;
  assignedAgent?: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: "user" | "agent";
  message: string;
  attachments?: string[];
  timestamp: Date;
}

export interface CannedResponse {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
}

export class SupportService {
  private cannedResponses: CannedResponse[] = [
    {
      id: "resp-1",
      category: "payment",
      title: "Payment Failed",
      content:
        "I understand you're having payment issues. Please try the following:\n1. Check your payment method is valid\n2. Ensure sufficient balance\n3. Try again in a few moments\n\nIf the issue persists, please let me know and I'll escalate this.",
      tags: ["payment", "error", "troubleshooting"],
    },
    {
      id: "resp-2",
      category: "ride",
      title: "Ride Cancellation Policy",
      content:
        "Our cancellation policy:\n- Free cancellation within 5 minutes\n- $2.50 fee after 5 minutes\n- Full refund if driver cancels\n\nWould you like to proceed with cancellation?",
      tags: ["cancellation", "policy", "refund"],
    },
    {
      id: "resp-3",
      category: "driver",
      title: "Driver Behavior Issue",
      content:
        "I'm sorry to hear about your experience. We take driver conduct seriously. Please provide:\n1. Ride date and time\n2. Driver name\n3. Specific incident details\n\nI'll investigate immediately and take appropriate action.",
      tags: ["driver", "complaint", "escalation"],
    },
    {
      id: "resp-4",
      category: "technical",
      title: "App Crash",
      content:
        "Sorry for the inconvenience. To help resolve this:\n1. Try restarting the app\n2. Clear app cache\n3. Reinstall if needed\n\nIf the issue continues, I'll escalate to our technical team.",
      tags: ["technical", "crash", "troubleshooting"],
    },
  ];

  /**
   * Create a new support ticket
   */
  async createTicket(
    userId: string,
    subject: string,
    category: SupportTicket["category"],
    priority: SupportTicket["priority"] = "medium"
  ): Promise<SupportTicket> {
    const ticket: SupportTicket = {
      id: `ticket-${Date.now()}`,
      userId,
      subject,
      category,
      status: "open",
      priority,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return ticket;
  }

  /**
   * Add message to ticket
   */
  async addMessage(
    ticketId: string,
    senderId: string,
    senderType: "user" | "agent",
    message: string
  ): Promise<SupportMessage> {
    const supportMessage: SupportMessage = {
      id: `msg-${Date.now()}`,
      ticketId,
      senderId,
      senderType,
      message,
      timestamp: new Date(),
    };

    return supportMessage;
  }

  /**
   * Get canned responses for category
   */
  getCannedResponses(category: string): CannedResponse[] {
    return this.cannedResponses.filter(
      (r) => r.category === category || r.tags.includes(category)
    );
  }

  /**
   * Search canned responses
   */
  searchCannedResponses(query: string): CannedResponse[] {
    const lowerQuery = query.toLowerCase();
    return this.cannedResponses.filter(
      (r) =>
        r.title.toLowerCase().includes(lowerQuery) ||
        r.content.toLowerCase().includes(lowerQuery) ||
        r.tags.some((t) => t.includes(lowerQuery))
    );
  }

  /**
   * Escalate ticket to human agent
   */
  async escalateTicket(ticketId: string, reason: string): Promise<boolean> {
    // Simplified escalation logic
    console.log(`Escalating ticket ${ticketId}: ${reason}`);
    return true;
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(
    ticketId: string,
    status: SupportTicket["status"]
  ): Promise<boolean> {
    console.log(`Updating ticket ${ticketId} status to ${status}`);
    return true;
  }

  /**
   * Assign ticket to agent
   */
  async assignToAgent(ticketId: string, agentId: string): Promise<boolean> {
    console.log(`Assigning ticket ${ticketId} to agent ${agentId}`);
    return true;
  }

  /**
   * Get ticket history
   */
  async getTicketHistory(ticketId: string): Promise<SupportMessage[]> {
    // Mock history
    return [
      {
        id: "msg-1",
        ticketId,
        senderId: "user-1",
        senderType: "user",
        message: "I have an issue with my last ride payment",
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
      },
      {
        id: "msg-2",
        ticketId,
        senderId: "agent-1",
        senderType: "agent",
        message:
          "I understand you're having payment issues. Please try the following:\n1. Check your payment method is valid\n2. Ensure sufficient balance\n3. Try again in a few moments",
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
      },
    ];
  }

  /**
   * Get user tickets
   */
  async getUserTickets(userId: string): Promise<SupportTicket[]> {
    // Mock tickets
    return [
      {
        id: "ticket-1",
        userId,
        subject: "Payment issue on last ride",
        category: "payment",
        status: "resolved",
        priority: "high",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        assignedAgent: "agent-1",
      },
      {
        id: "ticket-2",
        userId,
        subject: "Driver behavior complaint",
        category: "driver",
        status: "in-progress",
        priority: "urgent",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        assignedAgent: "agent-2",
      },
    ];
  }
}

export const supportService = new SupportService();
