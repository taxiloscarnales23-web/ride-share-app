export interface DriverRanking {
  rank: number;
  driverId: string;
  driverName: string;
  earnings: number;
  acceptanceRate: number;
  rating: number;
  ridesCompleted: number;
  badge?: string;
  bonus?: number;
}

export interface LeaderboardPeriod {
  period: "weekly" | "monthly" | "allTime";
  startDate: Date;
  endDate: Date;
  rankings: DriverRanking[];
}

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  earnedAt?: Date;
}

export class LeaderboardService {
  private badges: AchievementBadge[] = [
    {
      id: "5-star",
      name: "5-Star Rated",
      description: "Maintain 5.0 rating for 10 rides",
      icon: "⭐",
      criteria: "rating >= 5.0 && ridesCompleted >= 10",
    },
    {
      id: "safety-champion",
      name: "Safety Champion",
      description: "Zero safety incidents for 30 days",
      icon: "🛡️",
      criteria: "safetyIncidents == 0 && daysActive >= 30",
    },
    {
      id: "reliability-expert",
      name: "Reliability Expert",
      description: "99%+ acceptance rate",
      icon: "✅",
      criteria: "acceptanceRate >= 99",
    },
    {
      id: "earnings-master",
      name: "Earnings Master",
      description: "Earn $1000+ in a month",
      icon: "💰",
      criteria: "monthlyEarnings >= 1000",
    },
    {
      id: "customer-favorite",
      name: "Customer Favorite",
      description: "Receive 50+ 5-star ratings",
      icon: "❤️",
      criteria: "fiveStarRatings >= 50",
    },
    {
      id: "consistency-king",
      name: "Consistency King",
      description: "Complete 100+ rides",
      icon: "👑",
      criteria: "ridesCompleted >= 100",
    },
    {
      id: "night-owl",
      name: "Night Owl",
      description: "Complete 50+ rides between 10pm-6am",
      icon: "🌙",
      criteria: "nightRides >= 50",
    },
    {
      id: "early-bird",
      name: "Early Bird",
      description: "Complete 50+ rides between 5am-9am",
      icon: "🌅",
      criteria: "earlyRides >= 50",
    },
  ];

  /**
   * Get weekly leaderboard
   */
  async getWeeklyLeaderboard(): Promise<LeaderboardPeriod> {
    const now = new Date();
    const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      period: "weekly",
      startDate,
      endDate: now,
      rankings: this.getMockRankings(),
    };
  }

  /**
   * Get monthly leaderboard
   */
  async getMonthlyLeaderboard(): Promise<LeaderboardPeriod> {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      period: "monthly",
      startDate,
      endDate: now,
      rankings: this.getMockRankings(),
    };
  }

  /**
   * Get all-time leaderboard
   */
  async getAllTimeLeaderboard(): Promise<LeaderboardPeriod> {
    return {
      period: "allTime",
      startDate: new Date("2024-01-01"),
      endDate: new Date(),
      rankings: this.getMockRankings(),
    };
  }

  /**
   * Get driver rank
   */
  async getDriverRank(driverId: string, period: "weekly" | "monthly" | "allTime"): Promise<DriverRanking | null> {
    const leaderboard =
      period === "weekly"
        ? await this.getWeeklyLeaderboard()
        : period === "monthly"
          ? await this.getMonthlyLeaderboard()
          : await this.getAllTimeLeaderboard();

    return leaderboard.rankings.find((r) => r.driverId === driverId) || null;
  }

  /**
   * Get driver badges
   */
  async getDriverBadges(driverId: string): Promise<AchievementBadge[]> {
    // Mock: return earned badges
    return [
      { ...this.badges[0], earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      { ...this.badges[2], earnedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
      { ...this.badges[4], earnedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
    ];
  }

  /**
   * Get available badges
   */
  async getAvailableBadges(): Promise<AchievementBadge[]> {
    return this.badges;
  }

  /**
   * Calculate bonus based on rank
   */
  async calculateBonus(rank: number, earnings: number): Promise<number> {
    if (rank === 1) return earnings * 0.1; // 10% bonus for 1st place
    if (rank <= 5) return earnings * 0.05; // 5% bonus for top 5
    if (rank <= 10) return earnings * 0.02; // 2% bonus for top 10
    return 0;
  }

  /**
   * Get leaderboard statistics
   */
  async getLeaderboardStats(): Promise<{
    totalDrivers: number;
    averageEarnings: number;
    averageRating: number;
    topEarnings: number;
    topRating: number;
  }> {
    return {
      totalDrivers: 1250,
      averageEarnings: 450.75,
      averageRating: 4.65,
      topEarnings: 2850.5,
      topRating: 5.0,
    };
  }

  /**
   * Get driver progress to next badge
   */
  async getNextBadgeProgress(driverId: string): Promise<{
    badge: AchievementBadge;
    progress: number;
    remaining: number;
  } | null> {
    // Mock: next badge is "Earnings Master" at 75% progress
    return {
      badge: this.badges[3],
      progress: 750,
      remaining: 250,
    };
  }

  private getMockRankings(): DriverRanking[] {
    return [
      {
        rank: 1,
        driverId: "driver-001",
        driverName: "Ahmed Hassan",
        earnings: 2850.5,
        acceptanceRate: 99.2,
        rating: 4.98,
        ridesCompleted: 450,
        badge: "⭐",
        bonus: 285.05,
      },
      {
        rank: 2,
        driverId: "driver-002",
        driverName: "Maria Garcia",
        earnings: 2620.75,
        acceptanceRate: 98.5,
        rating: 4.95,
        ridesCompleted: 420,
        badge: "❤️",
        bonus: 131.04,
      },
      {
        rank: 3,
        driverId: "driver-003",
        driverName: "John Smith",
        earnings: 2480.25,
        acceptanceRate: 97.8,
        rating: 4.92,
        ridesCompleted: 395,
        badge: "✅",
        bonus: 49.61,
      },
      {
        rank: 4,
        driverId: "driver-004",
        driverName: "Priya Patel",
        earnings: 2350.0,
        acceptanceRate: 97.2,
        rating: 4.88,
        ridesCompleted: 375,
        badge: "👑",
      },
      {
        rank: 5,
        driverId: "driver-005",
        driverName: "Carlos Rodriguez",
        earnings: 2200.5,
        acceptanceRate: 96.5,
        rating: 4.85,
        ridesCompleted: 350,
        badge: "🌙",
      },
    ];
  }
}

export const leaderboardService = new LeaderboardService();
