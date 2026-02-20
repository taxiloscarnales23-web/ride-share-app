import { messageReactions, messages } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getDb } from "../db";
import type { MessageReaction, InsertMessageReaction } from "../../drizzle/schema";

/**
 * Message Reactions Service
 * Handles emoji reactions to messages
 */

const ALLOWED_EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

export async function addReaction(
  messageId: number,
  userId: number,
  emoji: string
): Promise<MessageReaction> {
  try {
    if (!ALLOWED_EMOJIS.includes(emoji)) {
      throw new Error(`Emoji not allowed. Allowed: ${ALLOWED_EMOJIS.join(", ")}`);
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Check if message exists
    const msg = await db.select().from(messages).where(eq(messages.id, messageId));
    if (msg.length === 0) {
      throw new Error("Message not found");
    }

    // Check if reaction already exists
    const existing = await db
      .select()
      .from(messageReactions)
      .where(
        and(
          eq(messageReactions.messageId, messageId),
          eq(messageReactions.userId, userId),
          eq(messageReactions.emoji, emoji)
        )
      );

    if (existing.length > 0) {
      return existing[0];
    }

    // Add reaction
    const result = await db.insert(messageReactions).values({
      messageId,
      userId,
      emoji,
    });

    return {
      id: result[0].insertId,
      messageId,
      userId,
      emoji,
      createdAt: new Date(),
    } as MessageReaction;
  } catch (error) {
    console.error("[ReactionsService] Failed to add reaction:", error);
    throw error;
  }
}

export async function removeReaction(
  messageId: number,
  userId: number,
  emoji: string
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .delete(messageReactions)
      .where(
        and(
          eq(messageReactions.messageId, messageId),
          eq(messageReactions.userId, userId),
          eq(messageReactions.emoji, emoji)
        )
      );
  } catch (error) {
    console.error("[ReactionsService] Failed to remove reaction:", error);
    throw error;
  }
}

export async function getMessageReactions(messageId: number): Promise<MessageReaction[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return db.select().from(messageReactions).where(eq(messageReactions.messageId, messageId));
  } catch (error) {
    console.error("[ReactionsService] Failed to get reactions:", error);
    throw error;
  }
}

export async function getReactionSummary(messageId: number): Promise<Record<string, number>> {
  try {
    const reactions = await getMessageReactions(messageId);
    const summary: Record<string, number> = {};

    for (const reaction of reactions) {
      summary[reaction.emoji] = (summary[reaction.emoji] || 0) + 1;
    }

    return summary;
  } catch (error) {
    console.error("[ReactionsService] Failed to get reaction summary:", error);
    throw error;
  }
}

export async function getUsersWhoReacted(
  messageId: number,
  emoji: string
): Promise<MessageReaction[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return db
      .select()
      .from(messageReactions)
      .where(and(eq(messageReactions.messageId, messageId), eq(messageReactions.emoji, emoji)));
  } catch (error) {
    console.error("[ReactionsService] Failed to get users:", error);
    throw error;
  }
}

export async function hasUserReacted(
  messageId: number,
  userId: number,
  emoji: string
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db
      .select()
      .from(messageReactions)
      .where(
        and(
          eq(messageReactions.messageId, messageId),
          eq(messageReactions.userId, userId),
          eq(messageReactions.emoji, emoji)
        )
      );

    return result.length > 0;
  } catch (error) {
    console.error("[ReactionsService] Failed to check reaction:", error);
    throw error;
  }
}

export async function getTopReactions(conversationId: number, limit: number = 10) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get all reactions for messages in this conversation
    const reactions = await db
      .select()
      .from(messageReactions)
      .innerJoin(messages, eq(messageReactions.messageId, messages.id))
      .where(eq(messages.conversationId, conversationId));

    const summary: Record<string, number> = {};
    for (const r of reactions) {
      summary[r.messageReactions.emoji] = (summary[r.messageReactions.emoji] || 0) + 1;
    }

    return Object.entries(summary)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([emoji, count]) => ({ emoji, count }));
  } catch (error) {
    console.error("[ReactionsService] Failed to get top reactions:", error);
    throw error;
  }
}

export function getAllowedEmojis(): string[] {
  return ALLOWED_EMOJIS;
}
