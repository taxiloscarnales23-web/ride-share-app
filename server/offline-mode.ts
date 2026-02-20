/**
 * Offline Mode Service
 * Manages app functionality when offline with automatic sync when connection returns
 */

export interface OfflineData {
  rideHistory: Array<{
    id: string;
    pickupLocation: string;
    dropoffLocation: string;
    fare: number;
    date: Date;
    driverName: string;
    rating: number;
  }>;
  userProfile: {
    name: string;
    email: string;
    phone: string;
    rating: number;
    totalRides: number;
  };
  supportTickets: Array<{
    id: string;
    subject: string;
    status: 'open' | 'closed';
    createdAt: Date;
  }>;
  savedLocations: Array<{
    label: string;
    latitude: number;
    longitude: number;
  }>;
}

export interface SyncQueue {
  pendingActions: Array<{
    type: 'ride_request' | 'payment_confirmation' | 'rating' | 'support_ticket';
    data: unknown;
    timestamp: Date;
  }>;
}

export class OfflineModeService {
  private offlineData: Map<string, OfflineData> = new Map();
  private syncQueue: Map<string, SyncQueue> = new Map();

  /**
   * Initialize offline mode for user
   */
  initializeOfflineMode(userId: string): void {
    this.offlineData.set(userId, {
      rideHistory: [],
      userProfile: {
        name: '',
        email: '',
        phone: '',
        rating: 0,
        totalRides: 0
      },
      supportTickets: [],
      savedLocations: []
    });

    this.syncQueue.set(userId, {
      pendingActions: []
    });
  }

  /**
   * Cache user data for offline access
   */
  cacheUserData(userId: string, data: OfflineData): void {
    this.offlineData.set(userId, data);
  }

  /**
   * Get cached user data
   */
  getCachedData(userId: string): OfflineData | null {
    return this.offlineData.get(userId) || null;
  }

  /**
   * Queue action for sync when online
   */
  queueAction(
    userId: string,
    type: SyncQueue['pendingActions'][0]['type'],
    data: unknown
  ): void {
    const queue = this.syncQueue.get(userId);
    if (!queue) {
      this.initializeOfflineMode(userId);
    }

    const syncQueue = this.syncQueue.get(userId);
    if (syncQueue) {
      syncQueue.pendingActions.push({
        type,
        data,
        timestamp: new Date()
      });
    }
  }

  /**
   * Get pending actions for sync
   */
  getPendingActions(userId: string): SyncQueue['pendingActions'] {
    const queue = this.syncQueue.get(userId);
    return queue ? queue.pendingActions : [];
  }

  /**
   * Clear sync queue after successful sync
   */
  clearSyncQueue(userId: string): void {
    const queue = this.syncQueue.get(userId);
    if (queue) {
      queue.pendingActions = [];
    }
  }

  /**
   * Check if data is stale (older than 24 hours)
   */
  isDataStale(lastSyncTime: Date): boolean {
    const oneDayMs = 24 * 60 * 60 * 1000;
    return Date.now() - lastSyncTime.getTime() > oneDayMs;
  }

  /**
   * Get available offline features
   */
  getAvailableOfflineFeatures(): string[] {
    return [
      'View ride history',
      'View user profile',
      'View support tickets',
      'View saved locations',
      'Contact support (queued)',
      'View ratings and feedback'
    ];
  }

  /**
   * Get unavailable features when offline
   */
  getUnavailableFeatures(): string[] {
    return [
      'Request new ride',
      'Accept ride requests (driver)',
      'Real-time location tracking',
      'Live chat with driver',
      'Payment processing',
      'Surge pricing updates'
    ];
  }

  /**
   * Estimate sync time based on pending actions
   */
  estimateSyncTime(userId: string): number {
    const queue = this.syncQueue.get(userId);
    if (!queue) return 0;

    // Estimate 500ms per action
    return queue.pendingActions.length * 500;
  }

  /**
   * Get offline mode status
   */
  getOfflineModeStatus(userId: string): {
    isOffline: boolean;
    pendingActions: number;
    estimatedSyncTime: number;
    lastSyncTime?: Date;
  } {
    const queue = this.syncQueue.get(userId);
    const pendingCount = queue ? queue.pendingActions.length : 0;

    return {
      isOffline: true,
      pendingActions: pendingCount,
      estimatedSyncTime: this.estimateSyncTime(userId),
      lastSyncTime: new Date()
    };
  }

  /**
   * Add saved location for offline access
   */
  addSavedLocation(
    userId: string,
    label: string,
    latitude: number,
    longitude: number
  ): void {
    const data = this.offlineData.get(userId);
    if (data) {
      data.savedLocations.push({ label, latitude, longitude });
    }
  }

  /**
   * Get saved locations (available offline)
   */
  getSavedLocations(userId: string): Array<{
    label: string;
    latitude: number;
    longitude: number;
  }> {
    const data = this.offlineData.get(userId);
    return data ? data.savedLocations : [];
  }

  /**
   * Prepare data for offline sync
   */
  prepareForOfflineSync(userId: string): {
    cachedData: OfflineData | null;
    pendingActions: SyncQueue['pendingActions'];
    status: string;
  } {
    return {
      cachedData: this.getCachedData(userId),
      pendingActions: this.getPendingActions(userId),
      status: 'ready_for_sync'
    };
  }
}

export const offlineModeService = new OfflineModeService();
