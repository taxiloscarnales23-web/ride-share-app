/**
 * Ride Scheduling Service
 * Manages scheduled rides and reminders
 */

export interface ScheduledRide {
  id: string;
  riderId: string;
  pickupLocation: string;
  dropoffLocation: string;
  scheduledTime: Date;
  estimatedFare: number;
  estimatedDuration: number;
  preferredDriverId?: string;
  preferredVehicleType?: string;
  specialRequests?: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  driverId?: string;
  driverName?: string;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RideReminder {
  id: string;
  scheduledRideId: string;
  reminderTime: Date;
  reminderType: 'sms' | 'email' | 'push';
  sent: boolean;
  sentAt?: Date;
}

export class RideSchedulingService {
  private scheduledRides: Map<string, ScheduledRide> = new Map();
  private reminders: Map<string, RideReminder[]> = new Map();
  private upcomingRideSubscribers: Set<Function> = new Set();

  /**
   * Schedule a new ride
   */
  scheduleRide(
    riderId: string,
    pickupLocation: string,
    dropoffLocation: string,
    scheduledTime: Date,
    estimatedFare: number,
    estimatedDuration: number,
    specialRequests?: string,
    preferredDriverId?: string,
    preferredVehicleType?: string
  ): ScheduledRide {
    const rideId = `scheduled_${Date.now()}_${Math.random()}`;
    const ride: ScheduledRide = {
      id: rideId,
      riderId,
      pickupLocation,
      dropoffLocation,
      scheduledTime,
      estimatedFare,
      estimatedDuration,
      preferredDriverId,
      preferredVehicleType,
      specialRequests,
      status: 'scheduled',
      reminderSent: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.scheduledRides.set(rideId, ride);

    // Create automatic reminders (15 min and 1 hour before)
    this.createReminders(rideId, scheduledTime);

    return ride;
  }

  /**
   * Create automatic reminders for scheduled ride
   */
  private createReminders(rideId: string, scheduledTime: Date): void {
    const reminders: RideReminder[] = [];

    // 1 hour before
    const oneHourBefore = new Date(scheduledTime.getTime() - 60 * 60 * 1000);
    reminders.push({
      id: `reminder_${rideId}_1h`,
      scheduledRideId: rideId,
      reminderTime: oneHourBefore,
      reminderType: 'push',
      sent: false
    });

    // 15 minutes before
    const fifteenMinBefore = new Date(scheduledTime.getTime() - 15 * 60 * 1000);
    reminders.push({
      id: `reminder_${rideId}_15m`,
      scheduledRideId: rideId,
      reminderTime: fifteenMinBefore,
      reminderType: 'sms',
      sent: false
    });

    this.reminders.set(rideId, reminders);
  }

  /**
   * Get scheduled ride
   */
  getScheduledRide(rideId: string): ScheduledRide | null {
    return this.scheduledRides.get(rideId) || null;
  }

  /**
   * Get rider's scheduled rides
   */
  getRiderScheduledRides(riderId: string): ScheduledRide[] {
    return Array.from(this.scheduledRides.values()).filter(
      ride => ride.riderId === riderId && ride.status !== 'cancelled'
    );
  }

  /**
   * Get upcoming rides (next 7 days)
   */
  getUpcomingRides(riderId: string): ScheduledRide[] {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return this.getRiderScheduledRides(riderId)
      .filter(ride => ride.scheduledTime >= now && ride.scheduledTime <= sevenDaysLater)
      .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
  }

  /**
   * Confirm scheduled ride (assign driver)
   */
  confirmScheduledRide(rideId: string, driverId: string, driverName: string): ScheduledRide | null {
    const ride = this.scheduledRides.get(rideId);
    if (!ride) return null;

    ride.status = 'confirmed';
    ride.driverId = driverId;
    ride.driverName = driverName;
    ride.updatedAt = new Date();

    // Notify subscribers
    this.notifyUpcomingRide(ride);

    return ride;
  }

  /**
   * Cancel scheduled ride
   */
  cancelScheduledRide(rideId: string, reason?: string): ScheduledRide | null {
    const ride = this.scheduledRides.get(rideId);
    if (!ride) return null;

    ride.status = 'cancelled';
    ride.updatedAt = new Date();

    return ride;
  }

  /**
   * Complete scheduled ride
   */
  completeScheduledRide(rideId: string): ScheduledRide | null {
    const ride = this.scheduledRides.get(rideId);
    if (!ride) return null;

    ride.status = 'completed';
    ride.updatedAt = new Date();

    return ride;
  }

  /**
   * Reschedule ride
   */
  rescheduleRide(rideId: string, newScheduledTime: Date): ScheduledRide | null {
    const ride = this.scheduledRides.get(rideId);
    if (!ride) return null;

    ride.scheduledTime = newScheduledTime;
    ride.updatedAt = new Date();

    // Update reminders
    this.reminders.delete(rideId);
    this.createReminders(rideId, newScheduledTime);

    return ride;
  }

  /**
   * Get pending reminders
   */
  getPendingReminders(): RideReminder[] {
    const now = new Date();
    const pending: RideReminder[] = [];

    this.reminders.forEach(reminders => {
      reminders.forEach(reminder => {
        if (!reminder.sent && reminder.reminderTime <= now) {
          pending.push(reminder);
        }
      });
    });

    return pending;
  }

  /**
   * Mark reminder as sent
   */
  markReminderAsSent(reminderId: string): void {
    this.reminders.forEach(reminders => {
      const reminder = reminders.find(r => r.id === reminderId);
      if (reminder) {
        reminder.sent = true;
        reminder.sentAt = new Date();
      }
    });
  }

  /**
   * Get ride reminders
   */
  getRideReminders(rideId: string): RideReminder[] {
    return this.reminders.get(rideId) || [];
  }

  /**
   * Subscribe to upcoming rides
   */
  subscribeToUpcomingRides(callback: (ride: ScheduledRide) => void): () => void {
    this.upcomingRideSubscribers.add(callback);

    return () => {
      this.upcomingRideSubscribers.delete(callback);
    };
  }

  /**
   * Notify subscribers of upcoming ride
   */
  private notifyUpcomingRide(ride: ScheduledRide): void {
    this.upcomingRideSubscribers.forEach(callback => callback(ride));
  }

  /**
   * Get scheduling statistics
   */
  getSchedulingStats(riderId: string): {
    totalScheduled: number;
    upcomingRides: number;
    completedRides: number;
    cancelledRides: number;
    averageLeadTime: number; // in hours
  } {
    const rides = this.getRiderScheduledRides(riderId);
    const now = new Date();

    const upcoming = rides.filter(r => r.scheduledTime > now && r.status === 'scheduled').length;
    const completed = rides.filter(r => r.status === 'completed').length;
    const cancelled = rides.filter(r => r.status === 'cancelled').length;

    const leadTimes = rides
      .filter(r => r.status === 'completed')
      .map(r => (r.scheduledTime.getTime() - r.createdAt.getTime()) / (1000 * 60 * 60));

    const averageLeadTime = leadTimes.length > 0 ? leadTimes.reduce((a, b) => a + b) / leadTimes.length : 0;

    return {
      totalScheduled: rides.length,
      upcomingRides: upcoming,
      completedRides: completed,
      cancelledRides: cancelled,
      averageLeadTime: Math.round(averageLeadTime * 10) / 10
    };
  }

  /**
   * Get popular scheduled times
   */
  getPopularScheduledTimes(): Array<{ time: string; count: number }> {
    const timeCounts: Map<string, number> = new Map();

    this.scheduledRides.forEach(ride => {
      const hour = ride.scheduledTime.getHours();
      const timeSlot = `${hour}:00`;
      timeCounts.set(timeSlot, (timeCounts.get(timeSlot) || 0) + 1);
    });

    return Array.from(timeCounts.entries())
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
}

export const rideSchedulingService = new RideSchedulingService();
