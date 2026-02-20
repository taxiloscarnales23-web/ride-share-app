/**
 * In-App Chat Service
 * Manages real-time messaging between drivers and riders
 */

export interface ChatMessage {
  id: string;
  rideId: string;
  senderId: string;
  senderType: 'driver' | 'rider';
  senderName: string;
  message: string;
  timestamp: Date;
  read: boolean;
  attachmentUrl?: string;
}

export interface ChatConversation {
  id: string;
  rideId: string;
  driverId: string;
  riderId: string;
  driverName: string;
  riderName: string;
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: Date;
  closedAt?: Date;
}

export class ChatService {
  private conversations: Map<string, ChatConversation> = new Map();
  private messageSubscribers: Map<string, Set<Function>> = new Map();

  /**
   * Create or get conversation for a ride
   */
  getOrCreateConversation(
    rideId: string,
    driverId: string,
    driverName: string,
    riderId: string,
    riderName: string
  ): ChatConversation {
    if (!this.conversations.has(rideId)) {
      this.conversations.set(rideId, {
        id: `conv_${rideId}`,
        rideId,
        driverId,
        riderId,
        driverName,
        riderName,
        messages: [],
        unreadCount: 0,
        createdAt: new Date()
      });
    }
    return this.conversations.get(rideId)!;
  }

  /**
   * Send message in conversation
   */
  sendMessage(
    rideId: string,
    senderId: string,
    senderType: 'driver' | 'rider',
    senderName: string,
    message: string,
    attachmentUrl?: string
  ): ChatMessage {
    const conversation = this.conversations.get(rideId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      rideId,
      senderId,
      senderType,
      senderName,
      message,
      timestamp: new Date(),
      read: false,
      attachmentUrl
    };

    conversation.messages.push(chatMessage);
    conversation.lastMessage = chatMessage;

    // Notify subscribers
    this.notifySubscribers(rideId, chatMessage);

    return chatMessage;
  }

  /**
   * Get conversation messages
   */
  getMessages(rideId: string): ChatMessage[] {
    const conversation = this.conversations.get(rideId);
    return conversation ? conversation.messages : [];
  }

  /**
   * Mark message as read
   */
  markAsRead(rideId: string, messageId: string, readerId: string): void {
    const conversation = this.conversations.get(rideId);
    if (conversation) {
      const message = conversation.messages.find(m => m.id === messageId);
      if (message && message.senderId !== readerId) {
        message.read = true;
        conversation.unreadCount = Math.max(0, conversation.unreadCount - 1);
      }
    }
  }

  /**
   * Mark all messages as read
   */
  markAllAsRead(rideId: string, readerId: string): void {
    const conversation = this.conversations.get(rideId);
    if (conversation) {
      conversation.messages.forEach(msg => {
        if (!msg.read && msg.senderId !== readerId) {
          msg.read = true;
        }
      });
      conversation.unreadCount = 0;
    }
  }

  /**
   * Get unread message count
   */
  getUnreadCount(rideId: string, userId: string): number {
    const conversation = this.conversations.get(rideId);
    if (!conversation) return 0;

    return conversation.messages.filter(
      msg => !msg.read && msg.senderId !== userId
    ).length;
  }

  /**
   * Close conversation
   */
  closeConversation(rideId: string): void {
    const conversation = this.conversations.get(rideId);
    if (conversation) {
      conversation.closedAt = new Date();
    }
  }

  /**
   * Subscribe to new messages
   */
  subscribe(rideId: string, callback: (message: ChatMessage) => void): () => void {
    if (!this.messageSubscribers.has(rideId)) {
      this.messageSubscribers.set(rideId, new Set());
    }
    this.messageSubscribers.get(rideId)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.messageSubscribers.get(rideId)?.delete(callback);
    };
  }

  /**
   * Notify all subscribers of new message
   */
  private notifySubscribers(rideId: string, message: ChatMessage): void {
    const subscribers = this.messageSubscribers.get(rideId);
    if (subscribers) {
      subscribers.forEach(callback => callback(message));
    }
  }

  /**
   * Get conversation summary
   */
  getConversationSummary(rideId: string): {
    messageCount: number;
    unreadCount: number;
    lastMessageTime?: Date;
    participants: string[];
  } {
    const conversation = this.conversations.get(rideId);
    if (!conversation) {
      return {
        messageCount: 0,
        unreadCount: 0,
        participants: []
      };
    }

    return {
      messageCount: conversation.messages.length,
      unreadCount: conversation.unreadCount,
      lastMessageTime: conversation.lastMessage?.timestamp,
      participants: [conversation.driverName, conversation.riderName]
    };
  }

  /**
   * Search messages in conversation
   */
  searchMessages(rideId: string, query: string): ChatMessage[] {
    const conversation = this.conversations.get(rideId);
    if (!conversation) return [];

    const lowerQuery = query.toLowerCase();
    return conversation.messages.filter(msg =>
      msg.message.toLowerCase().includes(lowerQuery) ||
      msg.senderName.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get typing indicator status
   */
  setTypingStatus(rideId: string, userId: string, isTyping: boolean): void {
    // In production, this would broadcast via WebSocket
    console.log(`User ${userId} is ${isTyping ? 'typing' : 'not typing'} in ride ${rideId}`);
  }

  /**
   * Delete message
   */
  deleteMessage(rideId: string, messageId: string, userId: string): boolean {
    const conversation = this.conversations.get(rideId);
    if (!conversation) return false;

    const messageIndex = conversation.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return false;

    const message = conversation.messages[messageIndex];
    if (message.senderId !== userId) return false; // Only sender can delete

    conversation.messages.splice(messageIndex, 1);
    return true;
  }

  /**
   * Get all active conversations for user
   */
  getActiveConversations(userId: string): ChatConversation[] {
    return Array.from(this.conversations.values()).filter(
      conv => (conv.driverId === userId || conv.riderId === userId) && !conv.closedAt
    );
  }
}

export const chatService = new ChatService();
