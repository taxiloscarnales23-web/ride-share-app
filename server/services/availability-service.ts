export interface DaySchedule {
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  isAvailable: boolean;
  startTime: string; // "HH:mm" format
  endTime: string; // "HH:mm" format
}

export interface TimeOff {
  id: string;
  driverId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  isApproved: boolean;
}

export interface AvailabilitySchedule {
  driverId: string;
  weeklySchedule: DaySchedule[];
  timeOffs: TimeOff[];
  isAutomatic: boolean;
  updatedAt: Date;
}

export interface AvailabilityStatus {
  driverId: string;
  isAvailable: boolean;
  nextAvailableTime?: Date;
  reason?: string;
}

export class AvailabilityService {
  private defaultSchedule: DaySchedule[] = [
    { day: "monday", isAvailable: true, startTime: "08:00", endTime: "22:00" },
    { day: "tuesday", isAvailable: true, startTime: "08:00", endTime: "22:00" },
    { day: "wednesday", isAvailable: true, startTime: "08:00", endTime: "22:00" },
    { day: "thursday", isAvailable: true, startTime: "08:00", endTime: "22:00" },
    { day: "friday", isAvailable: true, startTime: "08:00", endTime: "23:00" },
    { day: "saturday", isAvailable: true, startTime: "09:00", endTime: "23:00" },
    { day: "sunday", isAvailable: false, startTime: "00:00", endTime: "00:00" },
  ];

  /**
   * Get driver's availability schedule
   */
  async getSchedule(driverId: string): Promise<AvailabilitySchedule> {
    return {
      driverId,
      weeklySchedule: this.defaultSchedule,
      timeOffs: [],
      isAutomatic: true,
      updatedAt: new Date(),
    };
  }

  /**
   * Update weekly schedule
   */
  async updateWeeklySchedule(
    driverId: string,
    schedule: DaySchedule[]
  ): Promise<boolean> {
    console.log(`Updated schedule for driver ${driverId}`);
    return true;
  }

  /**
   * Block time off
   */
  async blockTimeOff(
    driverId: string,
    startDate: Date,
    endDate: Date,
    reason: string
  ): Promise<TimeOff> {
    const timeOff: TimeOff = {
      id: `timeoff-${Date.now()}`,
      driverId,
      startDate,
      endDate,
      reason,
      isApproved: false,
    };
    console.log(`Time off blocked for driver ${driverId}: ${reason}`);
    return timeOff;
  }

  /**
   * Cancel time off
   */
  async cancelTimeOff(timeOffId: string): Promise<boolean> {
    console.log(`Cancelled time off: ${timeOffId}`);
    return true;
  }

  /**
   * Get current availability status
   */
  async getAvailabilityStatus(driverId: string): Promise<AvailabilityStatus> {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const dayNames: Array<"sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday"> = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const currentDay = dayNames[dayOfWeek];

    const todaySchedule = this.defaultSchedule.find((s) => s.day === currentDay);

    if (!todaySchedule || !todaySchedule.isAvailable) {
      return {
        driverId,
        isAvailable: false,
        reason: "Not available today",
      };
    }

    const [startHour, startMin] = todaySchedule.startTime.split(":").map(Number);
    const [endHour, endMin] = todaySchedule.endTime.split(":").map(Number);

    const startTime = new Date();
    startTime.setHours(startHour, startMin, 0);

    const endTime = new Date();
    endTime.setHours(endHour, endMin, 0);

    const isCurrentlyAvailable = now >= startTime && now <= endTime;

    return {
      driverId,
      isAvailable: isCurrentlyAvailable,
      nextAvailableTime: isCurrentlyAvailable ? undefined : startTime,
      reason: isCurrentlyAvailable ? undefined : "Outside working hours",
    };
  }

  /**
   * Check if driver is available at specific time
   */
  async isAvailableAt(driverId: string, dateTime: Date): Promise<boolean> {
    const dayOfWeek = dateTime.getDay();
    const dayNames: Array<"sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday"> = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const day = dayNames[dayOfWeek];

    const schedule = this.defaultSchedule.find((s) => s.day === day);
    if (!schedule || !schedule.isAvailable) {
      return false;
    }

    const [startHour, startMin] = schedule.startTime.split(":").map(Number);
    const [endHour, endMin] = schedule.endTime.split(":").map(Number);

    const startTime = new Date(dateTime);
    startTime.setHours(startHour, startMin, 0);

    const endTime = new Date(dateTime);
    endTime.setHours(endHour, endMin, 0);

    return dateTime >= startTime && dateTime <= endTime;
  }

  /**
   * Get upcoming time offs
   */
  async getUpcomingTimeOffs(driverId: string, days: number = 30): Promise<TimeOff[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    // Mock data
    return [
      {
        id: "timeoff-1",
        driverId,
        startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000),
        reason: "Personal time",
        isApproved: true,
      },
      {
        id: "timeoff-2",
        driverId,
        startDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000),
        reason: "Family vacation",
        isApproved: false,
      },
    ].filter((t) => t.startDate <= futureDate);
  }

  /**
   * Get availability analytics
   */
  async getAvailabilityAnalytics(driverId: string): Promise<{
    totalHoursAvailable: number;
    totalHoursBlocked: number;
    availabilityPercentage: number;
    averageHoursPerDay: number;
  }> {
    const totalHours = 7 * 14; // 7 days * 14 hours average
    const blockedHours = 16; // 2 days blocked

    return {
      totalHoursAvailable: totalHours - blockedHours,
      totalHoursBlocked: blockedHours,
      availabilityPercentage: ((totalHours - blockedHours) / totalHours) * 100,
      averageHoursPerDay: (totalHours - blockedHours) / 7,
    };
  }

  /**
   * Auto-update driver status based on schedule
   */
  async autoUpdateStatus(driverId: string): Promise<void> {
    const status = await this.getAvailabilityStatus(driverId);
    console.log(`Auto-updated status for driver ${driverId}: ${status.isAvailable ? "online" : "offline"}`);
  }
}

export const availabilityService = new AvailabilityService();
