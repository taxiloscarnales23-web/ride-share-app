/**
 * In-App Messaging Service
 * Handles real-time communication between drivers and riders
 */

import { EventEmitter } from "events";

export interface Message {
  id: string;
  rideId: string;
  senderId: string;
  senderType: "rider" | "driver";
  content: string;
  timestamp: Date;
  read: boolean;
  readAt?: Date;
  attachmentUrl?: string;
  attachmentType?: "image" | "location" | "document";
}

export interface Conversation {
  id: string;
  rideId: string;
  riderId: string;
  driverId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: Message;
  unreadCount: number;
}

export interface MessageNotification {
  conversationId: string;
  senderId: string;
  senderType: "rider" | "driver";
  messagePreview: string;
  timestamp: Date;
}

/**
 * Messaging Service using EventEmitter for real-time updates
 */
export class MessagingService extends EventEmitter {
  private conversations: Map<string, Conversation> = new Map();
  private userConnections: Map<string, Set<string>> = new Map(); // userId -> conversationIds

  /**
   * Create or get conversation for a ride
   */
  createConversation(
    rideId: string,
    riderId: string,
    driverId: string
  ): Conversation {
    const conversationId = `conv_${rideId}`;

    if (this.conversations.has(conversationId)) {
      return this.conversations.get(conversationId)!;
    }

    const conversation: Conversation = {
      id: conversationId,
      rideId,
      riderId,
      driverId,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      unreadCount: 0,
    };

    this.conversations.set(conversationId, conversation);

    // Track user connections
    if (!this.userConnections.has(riderId)) {
      this.userConnections.set(riderId, new Set());
    }
    if (!this.userConnections.has(driverId)) {
      this.userConnections.set(driverId, new Set());
    }

    this.userConnections.get(riderId)!.add(conversationId);
    this.userConnections.get(driverId)!.add(conversationId);

    return conversation;
  }

  /**
   * Send a message in a conversation
   */
  sendMessage(
    conversationId: string,
    senderId: string,
    senderType: "rider" | "driver",
    content: string,
    attachmentUrl?: string,
    attachmentType?: "image" | "location" | "document"
  ): Message {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      rideId: conversation.rideId,
      senderId,
      senderType,
      content,
      timestamp: new Date(),
      read: false,
      attachmentUrl,
      attachmentType,
    };

    conversation.messages.push(message);
    conversation.lastMessage = message;
    conversation.updatedAt = new Date();

    // Increment unread count for recipient
    if (senderType === "rider") {
      // Driver hasn't read it yet
      conversation.unreadCount++;
    } else {
      // Rider hasn't read it yet
      conversation.unreadCount++;
    }

    // Emit event for real-time updates
    this.emit("message:new", {
      conversationId,
      message,
      notification: {
        conversationId,
        senderId,
        senderType,
        messagePreview: content.substring(0, 100),
        timestamp: message.timestamp,
      },
    });

    return message;
  }

  /**
   * Mark message as read
   */
  markAsRead(conversationId: string, messageId: string, userId: string): void {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const message = conversation.messages.find((m) => m.id === messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    if (!message.read) {
      message.read = true;
      message.readAt = new Date();
      conversation.unreadCount = Math.max(0, conversation.unreadCount - 1);

      this.emit("message:read", {
        conversationId,
        messageId,
        userId,
        readAt: message.readAt,
      });
    }
  }

  /**
   * Mark all messages as read
   */
  markAllAsRead(conversationId: string, userId: string): void {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    conversation.messages.forEach((message) => {
      if (!message.read) {
        message.read = true;
        message.readAt = new Date();
      }
    });

    conversation.unreadCount = 0;

    this.emit("conversation:read", {
      conversationId,
      userId,
    });
  }

  /**
   * Get conversation
   */
  getConversation(conversationId: string): Conversation | undefined {
    return this.conversations.get(conversationId);
  }

  /**
   * Get all conversations for a user
   */
  getUserConversations(userId: string): Conversation[] {
    const conversationIds = this.userConnections.get(userId) || new Set();
    return Array.from(conversationIds)
      .map((id) => this.conversations.get(id))
      .filter((c): c is Conversation => c !== undefined);
  }

  /**
   * Get unread message count for user
   */
  getUnreadCount(userId: string): number {
    const conversations = this.getUserConversations(userId);
    return conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
  }

  /**
   * Delete message (soft delete)
   */
  deleteMessage(conversationId: string, messageId: string): void {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const messageIndex = conversation.messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) {
      throw new Error("Message not found");
    }

    // Soft delete - replace content
    conversation.messages[messageIndex].content = "[Message deleted]";

    this.emit("message:deleted", {
      conversationId,
      messageId,
    });
  }

  /**
   * Search messages in conversation
   */
  searchMessages(conversationId: string, query: string): Message[] {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    return conversation.messages.filter((m) =>
      m.content.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get message statistics
   */
  getMessageStats(conversationId: string): {
    totalMessages: number;
    unreadMessages: number;
    riderMessages: number;
    driverMessages: number;
    averageResponseTime: number; // in seconds
  } {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return {
        totalMessages: 0,
        unreadMessages: 0,
        riderMessages: 0,
        driverMessages: 0,
        averageResponseTime: 0,
      };
    }

    const messages = conversation.messages;
    const unreadMessages = messages.filter((m) => !m.read).length;
    const riderMessages = messages.filter((m) => m.senderType === "rider").length;
    const driverMessages = messages.filter((m) => m.senderType === "driver").length;

    // Calculate average response time
    let totalResponseTime = 0;
    let responseCount = 0;

    for (let i = 1; i < messages.length; i++) {
      if (messages[i].senderType !== messages[i - 1].senderType) {
        const responseTime =
          (messages[i].timestamp.getTime() -
            messages[i - 1].timestamp.getTime()) /
          1000; // in seconds
        totalResponseTime += responseTime;
        responseCount++;
      }
    }

    const averageResponseTime =
      responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0;

    return {
      totalMessages: messages.length,
      unreadMessages,
      riderMessages,
      driverMessages,
      averageResponseTime,
    };
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(
    conversationId: string,
    userId: string,
    isTyping: boolean
  ): void {
    this.emit("typing:indicator", {
      conversationId,
      userId,
      isTyping,
      timestamp: new Date(),
    });
  }

  /**
   * Send location share
   */
  sendLocation(
    conversationId: string,
    senderId: string,
    senderType: "rider" | "driver",
    latitude: number,
    longitude: number,
    accuracy: number
  ): Message {
    const locationContent = `📍 Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;

    return this.sendMessage(
      conversationId,
      senderId,
      senderType,
      locationContent,
      locationUrl,
      "location"
    );
  }

  /**
   * Send quick reply (preset messages)
   */
  getQuickReplies(userType: "rider" | "driver"): string[] {
    if (userType === "rider") {
      return [
        "I'm on my way",
        "I'm here",
        "Thank you!",
        "Where are you?",
        "Can you hurry?",
        "Wrong location",
      ];
    } else {
      return [
        "I'm on my way",
        "I'm here",
        "Traffic ahead",
        "Where are you?",
        "I see you",
        "Thank you!",
      ];
    }
  }

  /**
   * Block user from conversation
   */
  blockUser(conversationId: string, userId: string, blockedUserId: string): void {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    this.emit("user:blocked", {
      conversationId,
      userId,
      blockedUserId,
      timestamp: new Date(),
    });
  }

  /**
   * Report message
   */
  reportMessage(
    conversationId: string,
    messageId: string,
    reporterId: string,
    reason: string
  ): void {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const message = conversation.messages.find((m) => m.id === messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    this.emit("message:reported", {
      conversationId,
      messageId,
      reporterId,
      reason,
      reportedUserId: message.senderId,
      timestamp: new Date(),
    });
  }

  /**
   * Clear conversation history
   */
  clearHistory(conversationId: string): void {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    conversation.messages = [];
    conversation.unreadCount = 0;

    this.emit("conversation:cleared", {
      conversationId,
      timestamp: new Date(),
    });
  }
}

// Export singleton instance
export const messagingService = new MessagingService();
