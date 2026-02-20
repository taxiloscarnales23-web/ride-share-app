/**
 * Loyalty and Rewards Program Service
 * Manages points, tiers, rewards, and redemptions
 */

export type LoyaltyTier = "bronze" | "silver" | "gold" | "platinum";
export type RewardType = "discount" | "free_ride" | "upgrade" | "cash_back";

export interface LoyaltyAccount {
  accountId: string;
  userId: string;
  totalPoints: number;
  currentTier: LoyaltyTier;
  tierPoints: number; // Points towards next tier
  joinDate: Date;
  lastActivityDate: Date;
  rewardsRedeemed: number;
}

export interface LoyaltyTierBenefits {
  tier: LoyaltyTier;
  minPoints: number;
  pointsMultiplier: number;
  benefits: string[];
  monthlyBonusPoints: number;
}

export interface Reward {
  rewardId: string;
  userId: string;
  type: RewardType;
  pointsCost: number;
  value: number; // Dollar value or discount percentage
  description: string;
  expiryDate: Date;
  isRedeemed: boolean;
  redeemedDate?: Date;
}

export interface PointsTransaction {
  transactionId: string;
  userId: string;
  points: number;
  type: "earned" | "redeemed" | "bonus" | "expired";
  description: string;
  rideId?: string;
  timestamp: Date;
}

export interface ReferralBonus {
  bonusId: string;
  referrerId: string;
  refereeId: string;
  referralCode: string;
  bonusPoints: number;
  status: "pending" | "completed" | "expired";
  createdAt: Date;
  completedAt?: Date;
}

export class LoyaltyService {
  private accounts: Map<string, LoyaltyAccount> = new Map();
  private rewards: Map<string, Reward> = new Map();
  private transactions: Map<string, PointsTransaction> = new Map();
  private referrals: Map<string, ReferralBonus> = new Map();

  private tierBenefits: Map<LoyaltyTier, LoyaltyTierBenefits> = new Map([
    [
      "bronze",
      {
        tier: "bronze",
        minPoints: 0,
        pointsMultiplier: 1.0,
        benefits: ["basic_support", "ride_history"],
        monthlyBonusPoints: 0,
      },
    ],
    [
      "silver",
      {
        tier: "silver",
        minPoints: 500,
        pointsMultiplier: 1.25,
        benefits: ["priority_support", "5_percent_discount", "birthday_bonus"],
        monthlyBonusPoints: 50,
      },
    ],
    [
      "gold",
      {
        tier: "gold",
        minPoints: 2000,
        pointsMultiplier: 1.5,
        benefits: ["vip_support", "10_percent_discount", "free_ride_monthly"],
        monthlyBonusPoints: 100,
      },
    ],
    [
      "platinum",
      {
        tier: "platinum",
        minPoints: 5000,
        pointsMultiplier: 2.0,
        benefits: [
          "24_7_vip_support",
          "15_percent_discount",
          "free_ride_weekly",
          "airport_priority",
        ],
        monthlyBonusPoints: 250,
      },
    ],
  ]);

  /**
   * Create loyalty account for user
   */
  createLoyaltyAccount(userId: string): LoyaltyAccount {
    const accountId = `loyalty_${Date.now()}`;
    const account: LoyaltyAccount = {
      accountId,
      userId,
      totalPoints: 0,
      currentTier: "bronze",
      tierPoints: 0,
      joinDate: new Date(),
      lastActivityDate: new Date(),
      rewardsRedeemed: 0,
    };

    this.accounts.set(userId, account);
    return account;
  }

  /**
   * Get loyalty account
   */
  getLoyaltyAccount(userId: string): LoyaltyAccount | null {
    return this.accounts.get(userId) || null;
  }

  /**
   * Add points to account
   */
  addPoints(userId: string, points: number, description: string, rideId?: string): boolean {
    let account = this.accounts.get(userId);
    if (!account) {
      account = this.createLoyaltyAccount(userId);
    }

    // Apply tier multiplier
    const tierBenefits = this.tierBenefits.get(account.currentTier);
    const multiplier = tierBenefits?.pointsMultiplier || 1.0;
    const earnedPoints = Math.floor(points * multiplier);

    account.totalPoints += earnedPoints;
    account.tierPoints += earnedPoints;
    account.lastActivityDate = new Date();

    // Check for tier upgrade
    this.checkTierUpgrade(userId);

    // Record transaction
    const transactionId = `txn_${Date.now()}`;
    const transaction: PointsTransaction = {
      transactionId,
      userId,
      points: earnedPoints,
      type: "earned",
      description,
      rideId,
      timestamp: new Date(),
    };

    this.transactions.set(transactionId, transaction);
    return true;
  }

  /**
   * Redeem points for reward
   */
  redeemReward(userId: string, rewardId: string): boolean {
    const account = this.accounts.get(userId);
    const reward = this.rewards.get(rewardId);

    if (!account || !reward || reward.userId !== userId) return false;
    if (account.totalPoints < reward.pointsCost) return false;
    if (reward.isRedeemed || reward.expiryDate < new Date()) return false;

    account.totalPoints -= reward.pointsCost;
    reward.isRedeemed = true;
    reward.redeemedDate = new Date();
    account.rewardsRedeemed++;

    // Record transaction
    const transactionId = `txn_${Date.now()}`;
    const transaction: PointsTransaction = {
      transactionId,
      userId,
      points: -reward.pointsCost,
      type: "redeemed",
      description: `Redeemed ${reward.type}: ${reward.description}`,
      timestamp: new Date(),
    };

    this.transactions.set(transactionId, transaction);
    return true;
  }

  /**
   * Check and upgrade tier
   */
  private checkTierUpgrade(userId: string): void {
    const account = this.accounts.get(userId);
    if (!account) return;

    const tiers: LoyaltyTier[] = ["bronze", "silver", "gold", "platinum"];
    for (const tier of tiers.reverse()) {
      const benefits = this.tierBenefits.get(tier);
      if (benefits && account.totalPoints >= benefits.minPoints) {
        account.currentTier = tier;
        account.tierPoints = account.totalPoints - benefits.minPoints;
        break;
      }
    }
  }

  /**
   * Create reward offer
   */
  createReward(
    userId: string,
    type: RewardType,
    pointsCost: number,
    value: number,
    description: string,
    daysValid: number = 30
  ): Reward {
    const rewardId = `reward_${Date.now()}`;
    const expiryDate = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000);

    const reward: Reward = {
      rewardId,
      userId,
      type,
      pointsCost,
      value,
      description,
      expiryDate,
      isRedeemed: false,
    };

    this.rewards.set(rewardId, reward);
    return reward;
  }

  /**
   * Get available rewards for user
   */
  getAvailableRewards(userId: string): Reward[] {
    return Array.from(this.rewards.values()).filter(
      (reward) =>
        reward.userId === userId &&
        !reward.isRedeemed &&
        reward.expiryDate > new Date()
    );
  }

  /**
   * Create referral bonus
   */
  createReferralBonus(referrerId: string): ReferralBonus {
    const bonusId = `ref_${Date.now()}`;
    const referralCode = `REF${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    const bonus: ReferralBonus = {
      bonusId,
      referrerId,
      refereeId: "",
      referralCode,
      bonusPoints: 500, // 500 points for successful referral
      status: "pending",
      createdAt: new Date(),
    };

    this.referrals.set(bonusId, bonus);
    return bonus;
  }

  /**
   * Complete referral
   */
  completeReferral(bonusId: string, refereeId: string): boolean {
    const bonus = this.referrals.get(bonusId);
    if (!bonus || bonus.status !== "pending") return false;

    bonus.refereeId = refereeId;
    bonus.status = "completed";
    bonus.completedAt = new Date();

    // Award points to both referrer and referee
    this.addPoints(bonus.referrerId, bonus.bonusPoints, "Referral bonus");
    this.addPoints(refereeId, bonus.bonusPoints, "Referral bonus");

    return true;
  }

  /**
   * Get user points history
   */
  getUserPointsHistory(userId: string): PointsTransaction[] {
    return Array.from(this.transactions.values())
      .filter((txn) => txn.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get tier benefits
   */
  getTierBenefits(tier: LoyaltyTier): LoyaltyTierBenefits | null {
    return this.tierBenefits.get(tier) || null;
  }

  /**
   * Award monthly bonus points
   */
  awardMonthlyBonus(userId: string): boolean {
    const account = this.accounts.get(userId);
    if (!account) return false;

    const benefits = this.tierBenefits.get(account.currentTier);
    if (!benefits || benefits.monthlyBonusPoints === 0) return false;

    return this.addPoints(userId, benefits.monthlyBonusPoints, "Monthly tier bonus");
  }
}

export const loyaltyService = new LoyaltyService();
