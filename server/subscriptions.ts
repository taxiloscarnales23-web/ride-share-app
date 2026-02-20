/**
 * Subscription Management Service
 * Handles tiered subscription plans, billing, and feature access
 */

export interface SubscriptionPlan {
  planId: string;
  name: string;
  tier: "free" | "pro" | "enterprise";
  monthlyPrice: number;
  features: string[];
  rideLimit: number;
  maxDrivers: number;
  prioritySupport: boolean;
  customBranding: boolean;
  apiAccess: boolean;
  analyticsAccess: boolean;
}

export interface UserSubscription {
  subscriptionId: string;
  userId: string;
  planId: string;
  status: "active" | "cancelled" | "expired";
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentMethod: string;
  nextBillingDate: Date;
}

export class SubscriptionService {
  private plans: Map<string, SubscriptionPlan> = new Map();
  private subscriptions: Map<string, UserSubscription> = new Map();
  private billingHistory: Array<{
    subscriptionId: string;
    amount: number;
    date: Date;
    status: string;
  }> = [];

  constructor() {
    this.initializeDefaultPlans();
  }

  private initializeDefaultPlans() {
    const freePlan: SubscriptionPlan = {
      planId: "plan_free",
      name: "Free",
      tier: "free",
      monthlyPrice: 0,
      features: ["Basic rides", "Standard support"],
      rideLimit: 10,
      maxDrivers: 1,
      prioritySupport: false,
      customBranding: false,
      apiAccess: false,
      analyticsAccess: false,
    };

    const proPlan: SubscriptionPlan = {
      planId: "plan_pro",
      name: "Pro",
      tier: "pro",
      monthlyPrice: 29.99,
      features: [
        "Unlimited rides",
        "Priority support",
        "Analytics dashboard",
        "Custom branding",
      ],
      rideLimit: -1,
      maxDrivers: 5,
      prioritySupport: true,
      customBranding: true,
      apiAccess: true,
      analyticsAccess: true,
    };

    const enterprisePlan: SubscriptionPlan = {
      planId: "plan_enterprise",
      name: "Enterprise",
      tier: "enterprise",
      monthlyPrice: 99.99,
      features: [
        "Unlimited everything",
        "24/7 support",
        "Dedicated account manager",
        "Custom integrations",
      ],
      rideLimit: -1,
      maxDrivers: -1,
      prioritySupport: true,
      customBranding: true,
      apiAccess: true,
      analyticsAccess: true,
    };

    this.plans.set(freePlan.planId, freePlan);
    this.plans.set(proPlan.planId, proPlan);
    this.plans.set(enterprisePlan.planId, enterprisePlan);
  }

  createSubscription(
    userId: string,
    planId: string,
    paymentMethod: string
  ): UserSubscription | null {
    const plan = this.plans.get(planId);
    if (!plan) return null;

    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const subscription: UserSubscription = {
      subscriptionId: `sub_${Date.now()}`,
      userId,
      planId,
      status: "active",
      startDate: now,
      endDate,
      autoRenew: true,
      paymentMethod,
      nextBillingDate: endDate,
    };

    this.subscriptions.set(subscription.subscriptionId, subscription);

    if (plan.monthlyPrice > 0) {
      this.billingHistory.push({
        subscriptionId: subscription.subscriptionId,
        amount: plan.monthlyPrice,
        date: now,
        status: "completed",
      });
    }

    return subscription;
  }

  upgradeSubscription(
    subscriptionId: string,
    newPlanId: string
  ): UserSubscription | null {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return null;

    const newPlan = this.plans.get(newPlanId);
    if (!newPlan) return null;

    const oldPlan = this.plans.get(subscription.planId);
    if (!oldPlan) return null;

    const now = new Date();
    const daysRemaining = Math.ceil(
      (subscription.endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
    );

    const prorateFactor = daysRemaining / 30;
    const prorateCredit = oldPlan.monthlyPrice * prorateFactor;
    const upgradeCost = newPlan.monthlyPrice * prorateFactor - prorateCredit;

    subscription.planId = newPlanId;

    this.billingHistory.push({
      subscriptionId,
      amount: upgradeCost,
      date: now,
      status: "completed",
    });

    return subscription;
  }

  cancelSubscription(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return false;

    subscription.status = "cancelled";
    subscription.autoRenew = false;

    return true;
  }

  renewSubscription(subscriptionId: string): UserSubscription | null {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return null;

    const plan = this.plans.get(subscription.planId);
    if (!plan) return null;

    const now = new Date();
    subscription.startDate = now;
    subscription.endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    subscription.status = "active";
    subscription.nextBillingDate = subscription.endDate;

    if (plan.monthlyPrice > 0) {
      this.billingHistory.push({
        subscriptionId,
        amount: plan.monthlyPrice,
        date: now,
        status: "completed",
      });
    }

    return subscription;
  }

  getSubscription(subscriptionId: string): UserSubscription | null {
    return this.subscriptions.get(subscriptionId) || null;
  }

  getPlan(planId: string): SubscriptionPlan | null {
    return this.plans.get(planId) || null;
  }

  getAllPlans(): SubscriptionPlan[] {
    return Array.from(this.plans.values());
  }

  getBillingHistory(subscriptionId: string) {
    return this.billingHistory.filter((b) => b.subscriptionId === subscriptionId);
  }

  hasFeatureAccess(subscriptionId: string, feature: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription || subscription.status !== "active") return false;

    const plan = this.plans.get(subscription.planId);
    if (!plan) return false;

    return plan.features.includes(feature);
  }

  canPerformAction(subscriptionId: string, action: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription || subscription.status !== "active") return false;

    const plan = this.plans.get(subscription.planId);
    if (!plan) return false;

    switch (action) {
      case "unlimited_rides":
        return plan.rideLimit === -1;
      case "multiple_drivers":
        return plan.maxDrivers > 1;
      case "api_access":
        return plan.apiAccess;
      case "analytics":
        return plan.analyticsAccess;
      case "priority_support":
        return plan.prioritySupport;
      case "custom_branding":
        return plan.customBranding;
      default:
        return false;
    }
  }
}
