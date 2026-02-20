import { pinnedMessages, messages } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getDb } from "../db";
import type { PinnedMessage, InsertPinnedMessage } from "../../drizzle/schema";

/**
 * Message Pinning Service
 * Handles pinning and unpinning messages in conversations
 */

export async function pinMessage(
  messageId: number,
  conversationId: number,
  pinnedBy: number
): Promise<PinnedMessage> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Check if message exists
    const msg = await db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId));

    if (msg.length === 0) {
      throw new Error("Message not found");
    }

    // Check if already pinned
    const existing = await db
      .select()
      .from(pinnedMessages)
      .where(
        and(eq(pinnedMessages.messageId, messageId), eq(pinnedMessages.isPinned, true))
      );

    if (existing.length > 0) {
      return existing[0];
    }

    // Create pin record
    const result = await db.insert(pinnedMessages).values({
      messageId,
      conversationId,
      pinnedBy,
      isPinned: true,
    });

    return {
      id: result[0].insertId,
      messageId,
      conversationId,
      pinnedBy,
      pinnedAt: new Date(),
      isPinned: true,
    } as PinnedMessage;
  } catch (error) {
    console.error("[PinningService] Failed to pin message:", error);
    throw error;
  }
}

export async function unpinMessage(messageId: number): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(pinnedMessages)
      .set({ isPinned: false, unPinnedAt: new Date() })
      .where(eq(pinnedMessages.messageId, messageId));
  } catch (error) {
    console.error("[PinningService] Failed to unpin message:", error);
    throw error;
  }
}

export async function getPinnedMessages(conversationId: number): Promise<PinnedMessage[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return db
      .select()
      .from(pinnedMessages)
      .where(
        and(
          eq(pinnedMessages.conversationId, conversationId),
          eq(pinnedMessages.isPinned, true)
        )
      );
  } catch (error) {
    console.error("[PinningService] Failed to get pinned messages:", error);
    throw error;
  }
}

export async function getPinnedMessageCount(conversationId: number): Promise<number> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db
      .select()
      .from(pinnedMessages)
      .where(
        and(
          eq(pinnedMessages.conversationId, conversationId),
          eq(pinnedMessages.isPinned, true)
        )
      );

    return result.length;
  } catch (error) {
    console.error("[PinningService] Failed to get pinned count:", error);
    throw error;
  }
}

export async function isPinned(messageId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db
      .select()
      .from(pinnedMessages)
      .where(
        and(eq(pinnedMessages.messageId, messageId), eq(pinnedMessages.isPinned, true))
      );

    return result.length > 0;
  } catch (error) {
    console.error("[PinningService] Failed to check if pinned:", error);
    throw error;
  }
}

export async function getPinningHistory(
  conversationId: number,
  limit: number = 50
): Promise<PinnedMessage[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return db
      .select()
      .from(pinnedMessages)
      .where(eq(pinnedMessages.conversationId, conversationId))
      .limit(limit);
  } catch (error) {
    console.error("[PinningService] Failed to get pinning history:", error);
    throw error;
  }
}

export async function clearOldPins(conversationId: number, maxPins: number = 10): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const pins = await db
      .select()
      .from(pinnedMessages)
      .where(
        and(
          eq(pinnedMessages.conversationId, conversationId),
          eq(pinnedMessages.isPinned, true)
        )
      );

    if (pins.length > maxPins) {
      const toRemove = pins.slice(0, pins.length - maxPins);
      for (const pin of toRemove) {
        await unpinMessage(pin.messageId);
      }
    }
  } catch (error) {
    console.error("[PinningService] Failed to clear old pins:", error);
    throw error;
  }
}
