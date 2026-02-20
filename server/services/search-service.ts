import { conversationSearchIndex, messages, conversations } from "../../drizzle/schema";
import { eq, and, like, gte, lte } from "drizzle-orm";
import { getDb } from "../db";
import type { ConversationSearchIndex } from "../../drizzle/schema";

/**
 * Conversation Search Service
 * Handles full-text search and filtering of conversations and messages
 */

export async function indexMessage(
  messageId: number,
  conversationId: number,
  messageText?: string,
  messageType: string = "text"
): Promise<ConversationSearchIndex> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db.insert(conversationSearchIndex).values({
      conversationId,
      messageId,
      searchText: messageText || "",
      messageType,
    });

    return {
      id: result[0].insertId,
      conversationId,
      messageId,
      searchText: messageText || "",
      messageType,
      createdAt: new Date(),
    } as ConversationSearchIndex;
  } catch (error) {
    console.error("[SearchService] Failed to index message:", error);
    throw error;
  }
}

export async function searchMessages(
  conversationId: number,
  query: string,
  limit: number = 50
): Promise<ConversationSearchIndex[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const searchQuery = `%${query}%`;
    return db
      .select()
      .from(conversationSearchIndex)
      .where(
        and(
          eq(conversationSearchIndex.conversationId, conversationId),
          like(conversationSearchIndex.searchText, searchQuery)
        )
      )
      .limit(limit);
  } catch (error) {
    console.error("[SearchService] Failed to search messages:", error);
    throw error;
  }
}

export async function searchConversations(
  userId: number,
  query: string,
  limit: number = 20
): Promise<any[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const searchQuery = `%${query}%`;

    // Search in conversation search index
    const results = await db
      .select()
      .from(conversationSearchIndex)
      .where(like(conversationSearchIndex.searchText, searchQuery))
      .limit(limit);

    return results;
  } catch (error) {
    console.error("[SearchService] Failed to search conversations:", error);
    throw error;
  }
}

export async function filterByDateRange(
  conversationId: number,
  startDate: Date,
  endDate: Date
): Promise<ConversationSearchIndex[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return db
      .select()
      .from(conversationSearchIndex)
      .where(
        and(
          eq(conversationSearchIndex.conversationId, conversationId),
          gte(conversationSearchIndex.createdAt, startDate),
          lte(conversationSearchIndex.createdAt, endDate)
        )
      );
  } catch (error) {
    console.error("[SearchService] Failed to filter by date:", error);
    throw error;
  }
}

export async function filterByMessageType(
  conversationId: number,
  messageType: string
): Promise<ConversationSearchIndex[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return db
      .select()
      .from(conversationSearchIndex)
      .where(
        and(
          eq(conversationSearchIndex.conversationId, conversationId),
          eq(conversationSearchIndex.messageType, messageType)
        )
      );
  } catch (error) {
    console.error("[SearchService] Failed to filter by type:", error);
    throw error;
  }
}

export async function getSearchStats(conversationId: number): Promise<{
  totalMessages: number;
  textMessages: number;
  imageMessages: number;
  systemMessages: number;
}> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const all = await db
      .select()
      .from(conversationSearchIndex)
      .where(eq(conversationSearchIndex.conversationId, conversationId));

    const stats = {
      totalMessages: all.length,
      textMessages: all.filter((m) => m.messageType === "text").length,
      imageMessages: all.filter((m) => m.messageType === "image").length,
      systemMessages: all.filter((m) => m.messageType === "system").length,
    };

    return stats;
  } catch (error) {
    console.error("[SearchService] Failed to get stats:", error);
    throw error;
  }
}

export async function clearSearchIndex(conversationId: number): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .delete(conversationSearchIndex)
      .where(eq(conversationSearchIndex.conversationId, conversationId));
  } catch (error) {
    console.error("[SearchService] Failed to clear index:", error);
    throw error;
  }
}

export async function rebuildSearchIndex(conversationId: number): Promise<number> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Clear existing index
    await clearSearchIndex(conversationId);

    // Get all messages for conversation
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId));

    // Re-index all messages
    let count = 0;
    for (const msg of msgs) {
      await indexMessage(msg.id, conversationId, msg.messageText || "", msg.messageType);
      count++;
    }

    return count;
  } catch (error) {
    console.error("[SearchService] Failed to rebuild index:", error);
    throw error;
  }
}
