export interface OfflineData {
  rideHistory: Array<{
    rideId: string;
    destination: string;
    fare: number;
    date: Date;
  }>;
  userProfile: {
    name: string;
    email: string;
    phone: string;
    rating: number;
  };
  savedLocations: Array<{
    id: string;
    label: string;
    latitude: number;
    longitude: number;
  }>;
  settings: {
    theme: "light" | "dark";
    language: string;
    notifications: boolean;
  };
}

export interface SyncQueue {
  id: string;
  action: "create" | "update" | "delete";
  resource: string;
  data: any;
  timestamp: Date;
  retries: number;
}

export interface SyncConflict {
  id: string;
  resource: string;
  localVersion: any;
  serverVersion: any;
  timestamp: Date;
  resolved: boolean;
  resolution?: "local" | "server";
}

export class OfflineService {
  private offlineData: Map<string, OfflineData> = new Map();
  private syncQueue: Map<string, SyncQueue[]> = new Map();
  private conflicts: Map<string, SyncConflict[]> = new Map();
  private isOnline: boolean = true;

  /**
   * Set online status
   */
  setOnlineStatus(online: boolean): void {
    this.isOnline = online;
    console.log(`Online status: ${online}`);
  }

  /**
   * Get online status
   */
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Save data for offline access
   */
  async saveOfflineData(userId: string, data: OfflineData): Promise<void> {
    this.offlineData.set(userId, data);
    console.log(`Offline data saved for user ${userId}`);
  }

  /**
   * Get offline data
   */
  async getOfflineData(userId: string): Promise<OfflineData | null> {
    return this.offlineData.get(userId) || null;
  }

  /**
   * Queue operation for sync
   */
  async queueOperation(userId: string, action: "create" | "update" | "delete", resource: string, data: any): Promise<SyncQueue> {
    const operation: SyncQueue = {
      id: `sync-${Date.now()}`,
      action,
      resource,
      data,
      timestamp: new Date(),
      retries: 0,
    };

    if (!this.syncQueue.has(userId)) {
      this.syncQueue.set(userId, []);
    }
    this.syncQueue.get(userId)!.push(operation);

    console.log(`Operation queued for user ${userId}: ${action} ${resource}`);
    return operation;
  }

  /**
   * Get sync queue
   */
  async getSyncQueue(userId: string): Promise<SyncQueue[]> {
    return this.syncQueue.get(userId) || [];
  }

  /**
   * Process sync queue
   */
  async processSyncQueue(userId: string): Promise<{
    successful: number;
    failed: number;
    conflicts: number;
  }> {
    const queue = this.syncQueue.get(userId) || [];
    let successful = 0;
    let failed = 0;
    let conflicts = 0;

    for (const operation of queue) {
      try {
        // Simulate sync operation
        if (Math.random() > 0.1) {
          // 90% success rate
          successful++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
      }
    }

    // Clear processed queue
    this.syncQueue.set(userId, []);

    console.log(`Sync completed for user ${userId}: ${successful} successful, ${failed} failed, ${conflicts} conflicts`);
    return { successful, failed, conflicts };
  }

  /**
   * Detect conflicts
   */
  async detectConflicts(userId: string, localData: any, serverData: any): Promise<SyncConflict[]> {
    const detectedConflicts: SyncConflict[] = [];

    // Simple conflict detection: if data differs, it's a conflict
    if (JSON.stringify(localData) !== JSON.stringify(serverData)) {
      const conflict: SyncConflict = {
        id: `conflict-${Date.now()}`,
        resource: "ride_data",
        localVersion: localData,
        serverVersion: serverData,
        timestamp: new Date(),
        resolved: false,
      };
      detectedConflicts.push(conflict);
    }

    if (!this.conflicts.has(userId)) {
      this.conflicts.set(userId, []);
    }
    this.conflicts.get(userId)!.push(...detectedConflicts);

    return detectedConflicts;
  }

  /**
   * Resolve conflict
   */
  async resolveConflict(userId: string, conflictId: string, resolution: "local" | "server"): Promise<boolean> {
    const userConflicts = this.conflicts.get(userId);
    if (!userConflicts) return false;

    const conflict = userConflicts.find((c) => c.id === conflictId);
    if (conflict) {
      conflict.resolved = true;
      conflict.resolution = resolution;
      console.log(`Conflict ${conflictId} resolved with ${resolution} version`);
      return true;
    }
    return false;
  }

  /**
   * Get unresolved conflicts
   */
  async getUnresolvedConflicts(userId: string): Promise<SyncConflict[]> {
    const userConflicts = this.conflicts.get(userId) || [];
    return userConflicts.filter((c) => !c.resolved);
  }

  /**
   * Clear offline data
   */
  async clearOfflineData(userId: string): Promise<void> {
    this.offlineData.delete(userId);
    this.syncQueue.delete(userId);
    this.conflicts.delete(userId);
    console.log(`Offline data cleared for user ${userId}`);
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(userId: string): Promise<{
    queuedOperations: number;
    unresolvedConflicts: number;
    lastSyncTime?: Date;
    dataSize: number;
  }> {
    const queue = this.syncQueue.get(userId) || [];
    const userConflicts = this.conflicts.get(userId) || [];
    const offlineData = this.offlineData.get(userId);

    return {
      queuedOperations: queue.length,
      unresolvedConflicts: userConflicts.filter((c) => !c.resolved).length,
      lastSyncTime: new Date(),
      dataSize: offlineData ? JSON.stringify(offlineData).length : 0,
    };
  }

  /**
   * Enable offline mode
   */
  async enableOfflineMode(userId: string, data: OfflineData): Promise<void> {
    await this.saveOfflineData(userId, data);
    console.log(`Offline mode enabled for user ${userId}`);
  }

  /**
   * Disable offline mode
   */
  async disableOfflineMode(userId: string): Promise<void> {
    await this.clearOfflineData(userId);
    console.log(`Offline mode disabled for user ${userId}`);
  }
}

export const offlineService = new OfflineService();
