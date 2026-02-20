import { forwardedMessages, messages, conversations } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getDb } from "../db";
import type { ForwardedMessage, InsertForwardedMessage, Message } from "../../drizzle/schema";

/**
 * Message Forwarding Service
 * Handles forwarding messages between conversations
 */

export async function forwardMessage(
  originalMessageId: number,
  sourceConversationId: number,
  targetConversationId: number,
  forwardedBy: number,
  forwardNote?: string
): Promise<ForwardedMessage> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get original message
    const originalMsg = await db
      .select()
      .from(messages)
      .where(eq(messages.id, originalMessageId));

    if (originalMsg.length === 0) {
      throw new Error("Original message not found");
    }

    // Verify conversations exist
    const sourceConv = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, sourceConversationId));

    const targetConv = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, targetConversationId));

    if (sourceConv.length === 0 || targetConv.length === 0) {
      throw new Error("Conversation not found");
    }

    // Create forwarded message in target conversation
    const forwardedMsg = await db.insert(messages).values({
      conversationId: targetConversationId,
      senderId: forwardedBy,
      senderType: "driver", // Default to driver, can be parameterized
      messageText: originalMsg[0].messageText,
      imageUrl: originalMsg[0].imageUrl,
      messageType: originalMsg[0].messageType,
    });

    // Record forwarding action
    const result = await db.insert(forwardedMessages).values({
      originalMessageId,
      sourceConversationId,
      targetConversationId,
      forwardedBy,
      forwardNote,
      forwardedMessageId: forwardedMsg[0].insertId,
    });

    return {
      id: result[0].insertId,
      originalMessageId,
      sourceConversationId,
      targetConversationId,
      forwardedBy,
      forwardedAt: new Date(),
      forwardNote,
      forwardedMessageId: forwardedMsg[0].insertId,
    } as ForwardedMessage;
  } catch (error) {
    console.error("[ForwardingService] Failed to forward message:", error);
    throw error;
  }
}

export async function getForwardingHistory(
  conversationId: number,
  limit: number = 50
): Promise<ForwardedMessage[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return db
      .select()
      .from(forwardedMessages)
      .where(eq(forwardedMessages.sourceConversationId, conversationId))
      .limit(limit);
  } catch (error) {
    console.error("[ForwardingService] Failed to get forwarding history:", error);
    throw error;
  }
}

export async function getForwardedTo(
  messageId: number
): Promise<ForwardedMessage[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return db
      .select()
      .from(forwardedMessages)
      .where(eq(forwardedMessages.originalMessageId, messageId));
  } catch (error) {
    console.error("[ForwardingService] Failed to get forwarded to:", error);
    throw error;
  }
}

export async function getForwardingStats(
  conversationId: number
): Promise<{
  totalForwarded: number;
  forwardedFrom: number;
  forwardedTo: number;
  mostForwardedMessage: number | null;
}> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const forwarded = await db
      .select()
      .from(forwardedMessages)
      .where(eq(forwardedMessages.sourceConversationId, conversationId));

    const received = await db
      .select()
      .from(forwardedMessages)
      .where(eq(forwardedMessages.targetConversationId, conversationId));

    // Find most forwarded message
    const allForwarded = await db.select().from(forwardedMessages);
    const forwardCounts = new Map<number, number>();
    for (const f of allForwarded) {
      forwardCounts.set(f.originalMessageId, (forwardCounts.get(f.originalMessageId) || 0) + 1);
    }
    const mostForwarded = Array.from(forwardCounts.entries()).sort((a, b) => b[1] - a[1])[0];

    return {
      totalForwarded: forwarded.length + received.length,
      forwardedFrom: forwarded.length,
      forwardedTo: received.length,
      mostForwardedMessage: mostForwarded ? mostForwarded[0] : null,
    };
  } catch (error) {
    console.error("[ForwardingService] Failed to get forwarding stats:", error);
    throw error;
  }
}

export async function undoForward(forwardId: number): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get the forwarded message record
    const forward = await db
      .select()
      .from(forwardedMessages)
      .where(eq(forwardedMessages.id, forwardId));

    if (forward.length === 0) {
      throw new Error("Forward record not found");
    }

    // Delete the forwarded message
    if (forward[0].forwardedMessageId) {
      await db
        .delete(messages)
        .where(eq(messages.id, forward[0].forwardedMessageId));
    }

    // Delete the forward record
    await db.delete(forwardedMessages).where(eq(forwardedMessages.id, forwardId));
  } catch (error) {
    console.error("[ForwardingService] Failed to undo forward:", error);
    throw error;
  }
}

export async function getForwardingChain(
  messageId: number
): Promise<ForwardedMessage[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const chain: ForwardedMessage[] = [];
    let currentId = messageId;
    const visited = new Set<number>();

    while (!visited.has(currentId)) {
      visited.add(currentId);
      const forwards = await db
        .select()
        .from(forwardedMessages)
        .where(eq(forwardedMessages.originalMessageId, currentId));

      if (forwards.length === 0) break;
      chain.push(...forwards);

      // Continue with first forward
      if (forwards[0].forwardedMessageId) {
        currentId = forwards[0].forwardedMessageId;
      } else {
        break;
      }
    }

    return chain;
  } catch (error) {
    console.error("[ForwardingService] Failed to get forwarding chain:", error);
    throw error;
  }
}
