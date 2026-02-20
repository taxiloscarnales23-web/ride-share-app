import { archivedConversations, conversations } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getDb } from "../db";
import type { ArchivedConversation, InsertArchivedConversation } from "../../drizzle/schema";

/**
 * Conversation Archiving Service
 * Handles archiving and restoring conversations
 */

export async function archiveConversation(
  conversationId: number,
  archivedBy: number,
  reason?: string
): Promise<ArchivedConversation> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Check if conversation exists
    const conv = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId));

    if (conv.length === 0) {
      throw new Error("Conversation not found");
    }

    // Check if already archived
    const existing = await db
      .select()
      .from(archivedConversations)
      .where(
        and(
          eq(archivedConversations.conversationId, conversationId),
          eq(archivedConversations.isArchived, true)
        )
      );

    if (existing.length > 0) {
      return existing[0];
    }

    // Archive conversation
    const result = await db.insert(archivedConversations).values({
      conversationId,
      archivedBy,
      isArchived: true,
      archiveReason: reason,
    });

    return {
      id: result[0].insertId,
      conversationId,
      archivedBy,
      archivedAt: new Date(),
      isArchived: true,
      archiveReason: reason,
    } as ArchivedConversation;
  } catch (error) {
    console.error("[ArchivingService] Failed to archive conversation:", error);
    throw error;
  }
}

export async function restoreConversation(conversationId: number): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(archivedConversations)
      .set({ isArchived: false, restoredAt: new Date() })
      .where(eq(archivedConversations.conversationId, conversationId));
  } catch (error) {
    console.error("[ArchivingService] Failed to restore conversation:", error);
    throw error;
  }
}

export async function isConversationArchived(conversationId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db
      .select()
      .from(archivedConversations)
      .where(
        and(
          eq(archivedConversations.conversationId, conversationId),
          eq(archivedConversations.isArchived, true)
        )
      );

    return result.length > 0;
  } catch (error) {
    console.error("[ArchivingService] Failed to check archive status:", error);
    throw error;
  }
}

export async function getArchivedConversations(userId: number): Promise<ArchivedConversation[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return db
      .select()
      .from(archivedConversations)
      .where(
        and(
          eq(archivedConversations.archivedBy, userId),
          eq(archivedConversations.isArchived, true)
        )
      );
  } catch (error) {
    console.error("[ArchivingService] Failed to get archived conversations:", error);
    throw error;
  }
}

export async function getArchiveHistory(conversationId: number): Promise<ArchivedConversation[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return db
      .select()
      .from(archivedConversations)
      .where(eq(archivedConversations.conversationId, conversationId));
  } catch (error) {
    console.error("[ArchivingService] Failed to get archive history:", error);
    throw error;
  }
}

export async function getArchiveStats(userId: number): Promise<{
  totalArchived: number;
  archivedThisMonth: number;
  archivedThisWeek: number;
}> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const all = await db
      .select()
      .from(archivedConversations)
      .where(
        and(
          eq(archivedConversations.archivedBy, userId),
          eq(archivedConversations.isArchived, true)
        )
      );

    const thisMonth = all.filter((a) => a.archivedAt >= monthAgo).length;
    const thisWeek = all.filter((a) => a.archivedAt >= weekAgo).length;

    return {
      totalArchived: all.length,
      archivedThisMonth: thisMonth,
      archivedThisWeek: thisWeek,
    };
  } catch (error) {
    console.error("[ArchivingService] Failed to get stats:", error);
    throw error;
  }
}

export async function bulkArchiveConversations(
  conversationIds: number[],
  archivedBy: number
): Promise<number> {
  try {
    let count = 0;
    for (const convId of conversationIds) {
      await archiveConversation(convId, archivedBy);
      count++;
    }
    return count;
  } catch (error) {
    console.error("[ArchivingService] Failed to bulk archive:", error);
    throw error;
  }
}

export async function bulkRestoreConversations(conversationIds: number[]): Promise<number> {
  try {
    let count = 0;
    for (const convId of conversationIds) {
      await restoreConversation(convId);
      count++;
    }
    return count;
  } catch (error) {
    console.error("[ArchivingService] Failed to bulk restore:", error);
    throw error;
  }
}

export async function permanentlyDeleteArchived(conversationId: number): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .delete(archivedConversations)
      .where(eq(archivedConversations.conversationId, conversationId));
  } catch (error) {
    console.error("[ArchivingService] Failed to delete archived record:", error);
    throw error;
  }
}
