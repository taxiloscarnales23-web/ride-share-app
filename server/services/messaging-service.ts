import { conversations, messages, messageReadReceipts, typingIndicators } from "../../drizzle/schema";
import { eq, and, like, desc, lt } from "drizzle-orm";
import { getDb } from "../db";
import type {
  Conversation,
  InsertConversation,
  Message,
  InsertMessage,
  MessageReadReceipt,
  InsertMessageReadReceipt,
  TypingIndicator,
  InsertTypingIndicator,
} from "../../drizzle/schema";

/**
 * Messaging Service
 * Handles in-app messaging between riders and drivers
 */

export async function createConversation(data: InsertConversation): Promise<Conversation> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const existing = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.rideId, data.rideId),
          eq(conversations.riderId, data.riderId),
          eq(conversations.driverId, data.driverId)
        )
      );

    if (existing.length > 0) {
      return existing[0];
    }

    const result = await db.insert(conversations).values(data);
    return { ...data, id: result[0].insertId, createdAt: new Date(), updatedAt: new Date() } as Conversation;
  } catch (error) {
    console.error("[MessagingService] Failed to create conversation:", error);
    throw error;
  }
}

export async function getConversation(conversationId: number): Promise<Conversation | null> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId));
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[MessagingService] Failed to get conversation:", error);
    throw error;
  }
}

export async function getConversationsByUser(userId: number, userType: "rider" | "driver"): Promise<Conversation[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const field = userType === "rider" ? conversations.riderId : conversations.driverId;
    return db
      .select()
      .from(conversations)
      .where(eq(field, userId))
      .orderBy(desc(conversations.updatedAt));
  } catch (error) {
    console.error("[MessagingService] Failed to get conversations:", error);
    throw error;
  }
}

export async function sendMessage(data: InsertMessage): Promise<Message> {
  try {
    if (!data.messageText && !data.imageUrl) {
      throw new Error("Message text or image is required");
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(messages).values(data);
    return { ...data, id: result[0].insertId, createdAt: new Date() } as Message;
  } catch (error) {
    console.error("[MessagingService] Failed to send message:", error);
    throw error;
  }
}

export async function getConversationMessages(conversationId: number, limit: number = 50, offset: number = 0): Promise<Message[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset);
  } catch (error) {
    console.error("[MessagingService] Failed to get messages:", error);
    throw error;
  }
}

export async function markMessageAsRead(messageId: number, userId: number): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const msg = await db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId));

    if (msg.length === 0) {
      throw new Error("Message not found");
    }

    await db.update(messages).set({ isRead: true, readAt: new Date() }).where(eq(messages.id, messageId));

    await db.insert(messageReadReceipts).values({
      messageId,
      userId,
      readAt: new Date(),
    });
  } catch (error) {
    console.error("[MessagingService] Failed to mark message as read:", error);
    throw error;
  }
}

export async function markConversationAsRead(conversationId: number, userId: number): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const msgs = await db
      .select()
      .from(messages)
      .where(and(eq(messages.conversationId, conversationId), eq(messages.isRead, false)));

    for (const msg of msgs) {
      await markMessageAsRead(msg.id, userId);
    }
  } catch (error) {
    console.error("[MessagingService] Failed to mark conversation as read:", error);
    throw error;
  }
}

export async function getUnreadMessageCount(conversationId: number): Promise<number> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const msgs = await db
      .select()
      .from(messages)
      .where(and(eq(messages.conversationId, conversationId), eq(messages.isRead, false)));
    return msgs.length;
  } catch (error) {
    console.error("[MessagingService] Failed to get unread count:", error);
    throw error;
  }
}

export async function setTypingIndicator(conversationId: number, userId: number, isTyping: boolean): Promise<TypingIndicator> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const existing = await db
      .select()
      .from(typingIndicators)
      .where(and(eq(typingIndicators.conversationId, conversationId), eq(typingIndicators.userId, userId)));

    if (existing.length > 0) {
      await db
        .update(typingIndicators)
        .set({ isTyping, updatedAt: new Date() })
        .where(and(eq(typingIndicators.conversationId, conversationId), eq(typingIndicators.userId, userId)));
      return { ...existing[0], isTyping, updatedAt: new Date() };
    }

    const result = await db.insert(typingIndicators).values({
      conversationId,
      userId,
      isTyping,
    });
    return { id: result[0].insertId, conversationId, userId, isTyping, updatedAt: new Date() } as TypingIndicator;
  } catch (error) {
    console.error("[MessagingService] Failed to set typing indicator:", error);
    throw error;
  }
}

export async function getTypingUsers(conversationId: number): Promise<number[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const indicators = await db
      .select()
      .from(typingIndicators)
      .where(and(eq(typingIndicators.conversationId, conversationId), eq(typingIndicators.isTyping, true)));
    return indicators.map((i: TypingIndicator) => i.userId);
  } catch (error) {
    console.error("[MessagingService] Failed to get typing users:", error);
    throw error;
  }
}

export async function deleteMessage(messageId: number): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(messages).where(eq(messages.id, messageId));
  } catch (error) {
    console.error("[MessagingService] Failed to delete message:", error);
    throw error;
  }
}

export async function searchMessages(conversationId: number, query: string): Promise<Message[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return db
      .select()
      .from(messages)
      .where(and(eq(messages.conversationId, conversationId), like(messages.messageText, `%${query}%`)))
      .orderBy(desc(messages.createdAt));
  } catch (error) {
    console.error("[MessagingService] Failed to search messages:", error);
    throw error;
  }
}

export async function getMessageStatistics(conversationId: number): Promise<{
  totalMessages: number;
  unreadMessages: number;
  imageMessages: number;
  lastMessageTime: Date | null;
}> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId));

    return {
      totalMessages: msgs.length,
      unreadMessages: msgs.filter((m: Message) => !m.isRead).length,
      imageMessages: msgs.filter((m: Message) => m.messageType === "image").length,
      lastMessageTime: msgs.length > 0 ? msgs[msgs.length - 1].createdAt : null,
    };
  } catch (error) {
    console.error("[MessagingService] Failed to get message statistics:", error);
    throw error;
  }
}

export async function cleanupOldTypingIndicators(): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    await db.delete(typingIndicators).where(lt(typingIndicators.updatedAt, fiveMinutesAgo));
  } catch (error) {
    console.error("[MessagingService] Failed to cleanup typing indicators:", error);
    throw error;
  }
}
