import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

interface DashboardMetrics {
  totalRides: number;
  totalRevenue: string;
  totalUsers: number;
  activeDrivers: number;
  averageRating: number;
  completionRate: number;
}

interface RideAnalytics {
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  averageRideDistance: number;
  averageRideDuration: number;
  peakHours: { hour: number; count: number }[];
  byStatus: Record<string, number>;
}

interface DriverAnalytics {
  totalDrivers: number;
  activeDrivers: number;
  averageRating: number;
  topDrivers: any[];
  bottomDrivers: any[];
}

interface RevenueAnalytics {
  totalRevenue: string;
  byPaymentMethod: Record<string, string>;
  byStatus: Record<string, string>;
}

interface DisputeAnalytics {
  totalDisputes: number;
  openDisputes: number;
  resolvedDisputes: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  resolutionRate: number;
}

/**
 * Admin Analytics Dashboard
 * Comprehensive analytics panel for platform administrators
 */
export default function AdminDashboard() {
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [rideAnalytics, setRideAnalytics] = useState<RideAnalytics | null>(null);
  const [driverAnalytics, setDriverAnalytics] = useState<DriverAnalytics | null>(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null);
  const [disputeAnalytics, setDisputeAnalytics] = useState<DisputeAnalytics | null>(null);
  const [selectedTab, setSelectedTab] = useState<"overview" | "rides" | "drivers" | "revenue" | "disputes">("overview");

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      // In a real app, this would call the backend API
      // const response = await fetch('/api/admin/analytics');
      // const data = await response.json();

      // Mock data for now
      const mockMetrics: DashboardMetrics = {
        totalRides: 2847,
        totalRevenue: "18,250.50",
        totalUsers: 1523,
        activeDrivers: 87,
        averageRating: 4.7,
        completionRate: 94,
      };

      const mockRideAnalytics: RideAnalytics = {
        totalRides: 2847,
        completedRides: 2677,
        cancelledRides: 170,
        averageRideDistance: 4.2,
        averageRideDuration: 18,
        peakHours: [
          { hour: 8, count: 245 },
          { hour: 12, count: 189 },
          { hour: 18, count: 312 },
          { hour: 20, count: 298 },
        ],
        byStatus: {
          completed: 2677,
          cancelled: 170,
          pending: 0,
        },
      };

      const mockDriverAnalytics: DriverAnalytics = {
        totalDrivers: 342,
        activeDrivers: 87,
        averageRating: 4.7,
        topDrivers: [
          { id: 1, rating: 5.0, rides: 156 },
          { id: 2, rating: 4.95, rides: 142 },
          { id: 3, rating: 4.9, rides: 138 },
        ],
        bottomDrivers: [
          { id: 100, rating: 3.2, rides: 45 },
          { id: 101, rating: 3.5, rides: 38 },
          { id: 102, rating: 3.8, rides: 52 },
        ],
      };

      const mockRevenueAnalytics: RevenueAnalytics = {
        totalRevenue: "18,250.50",
        byPaymentMethod: {
          cash: "15,200.00",
          card: "2,850.50",
          wallet: "200.00",
        },
        byStatus: {
          completed: "18,250.50",
          pending: "0.00",
          failed: "0.00",
        },
      };

      const mockDisputeAnalytics: DisputeAnalytics = {
        totalDisputes: 47,
        openDisputes: 8,
        resolvedDisputes: 39,
        byType: {
          wrong_fare: 12,
          unsafe_behavior: 5,
          lost_item: 18,
          vehicle_issue: 8,
          other: 4,
        },
        bySeverity: {
          low: 28,
          medium: 15,
          high: 4,
        },
        resolutionRate: 83,
      };

      setMetrics(mockMetrics);
      setRideAnalytics(mockRideAnalytics);
      setDriverAnalytics(mockDriverAnalytics);
      setRevenueAnalytics(mockRevenueAnalytics);
      setDisputeAnalytics(mockDisputeAnalytics);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-primary px-6 py-8">
        <Text className="text-3xl font-bold text-background mb-2">Admin Dashboard</Text>
        <Text className="text-background opacity-90">Platform analytics and insights</Text>
      </View>

      {/* Tab Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="border-b border-border"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
      >
        {(["overview", "rides", "drivers", "revenue", "disputes"] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setSelectedTab(tab)}
            className={cn(
              "px-4 py-2 rounded-full",
              selectedTab === tab ? "bg-primary" : "bg-surface border border-border"
            )}
          >
            <Text
              className={cn(
                "text-sm font-semibold capitalize",
                selectedTab === tab ? "text-background" : "text-foreground"
              )}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Content */}
      <View className="px-6 py-6">
        {selectedTab === "overview" && metrics && (
          <OverviewTab metrics={metrics} colors={colors} />
        )}
        {selectedTab === "rides" && rideAnalytics && (
          <RidesTab analytics={rideAnalytics} colors={colors} />
        )}
        {selectedTab === "drivers" && driverAnalytics && (
          <DriversTab analytics={driverAnalytics} colors={colors} />
        )}
        {selectedTab === "revenue" && revenueAnalytics && (
          <RevenueTab analytics={revenueAnalytics} colors={colors} />
        )}
        {selectedTab === "disputes" && disputeAnalytics && (
          <DisputesTab analytics={disputeAnalytics} colors={colors} />
        )}
      </View>
    </ScrollView>
  );
}

/**
 * Overview Tab Component
 */
function OverviewTab({ metrics, colors }: { metrics: DashboardMetrics; colors: any }) {
  return (
    <View className="gap-4 mb-8">
      {/* Key Metrics Grid */}
      <View className="gap-4">
        <MetricCard
          label="Total Rides"
          value={metrics.totalRides.toString()}
          icon="🚗"
          trend="+12%"
        />
        <MetricCard
          label="Total Revenue"
          value={`$${metrics.totalRevenue}`}
          icon="💰"
          trend="+8%"
        />
        <MetricCard
          label="Total Users"
          value={metrics.totalUsers.toString()}
          icon="👥"
          trend="+5%"
        />
        <MetricCard
          label="Active Drivers"
          value={metrics.activeDrivers.toString()}
          icon="🚙"
          trend="+3%"
        />
        <MetricCard
          label="Average Rating"
          value={metrics.averageRating.toFixed(1)}
          icon="⭐"
          trend="Stable"
        />
        <MetricCard
          label="Completion Rate"
          value={`${metrics.completionRate}%`}
          icon="✓"
          trend="+2%"
        />
      </View>

      {/* Export Button */}
      <Pressable className="bg-primary px-6 py-3 rounded-lg items-center mt-4">
        <Text className="text-background font-semibold">📊 Export Report</Text>
      </Pressable>
    </View>
  );
}

/**
 * Rides Tab Component
 */
function RidesTab({ analytics, colors }: { analytics: RideAnalytics; colors: any }) {
  return (
    <View className="gap-4 mb-8">
      <MetricCard
        label="Total Rides"
        value={analytics.totalRides.toString()}
        icon="🚗"
      />
      <MetricCard
        label="Completed"
        value={analytics.completedRides.toString()}
        icon="✓"
      />
      <MetricCard
        label="Cancelled"
        value={analytics.cancelledRides.toString()}
        icon="✗"
      />
      <MetricCard
        label="Avg Distance"
        value={`${analytics.averageRideDistance} km`}
        icon="📍"
      />
      <MetricCard
        label="Avg Duration"
        value={`${analytics.averageRideDuration} min`}
        icon="⏱️"
      />

      {/* Peak Hours */}
      <View className="bg-surface rounded-lg p-4 border border-border mt-4">
        <Text className="font-bold text-foreground mb-4">Peak Hours</Text>
        {analytics.peakHours.map((hour) => (
          <View key={hour.hour} className="flex-row items-center gap-3 mb-3">
            <Text className="w-12 text-sm text-muted">{hour.hour}:00</Text>
            <View className="flex-1 h-6 bg-border rounded-full overflow-hidden">
              <View
                className="h-full bg-primary rounded-full"
                style={{ width: `${(hour.count / 312) * 100}%` }}
              />
            </View>
            <Text className="w-12 text-right text-sm text-foreground">{hour.count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * Drivers Tab Component
 */
function DriversTab({ analytics, colors }: { analytics: DriverAnalytics; colors: any }) {
  return (
    <View className="gap-4 mb-8">
      <MetricCard
        label="Total Drivers"
        value={analytics.totalDrivers.toString()}
        icon="🚙"
      />
      <MetricCard
        label="Active Drivers"
        value={analytics.activeDrivers.toString()}
        icon="✓"
      />
      <MetricCard
        label="Average Rating"
        value={analytics.averageRating.toFixed(1)}
        icon="⭐"
      />

      {/* Top Drivers */}
      <View className="bg-surface rounded-lg p-4 border border-border mt-4">
        <Text className="font-bold text-foreground mb-4">Top Drivers</Text>
        {analytics.topDrivers.map((driver, idx) => (
          <View key={driver.id} className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
                <Text className="text-background font-bold text-sm">#{idx + 1}</Text>
              </View>
              <Text className="text-foreground font-semibold">Driver {driver.id}</Text>
            </View>
            <View className="items-end">
              <Text className="text-foreground font-semibold">{driver.rating}⭐</Text>
              <Text className="text-xs text-muted">{driver.rides} rides</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * Revenue Tab Component
 */
function RevenueTab({ analytics, colors }: { analytics: RevenueAnalytics; colors: any }) {
  return (
    <View className="gap-4 mb-8">
      <MetricCard
        label="Total Revenue"
        value={`$${analytics.totalRevenue}`}
        icon="💰"
      />

      {/* By Payment Method */}
      <View className="bg-surface rounded-lg p-4 border border-border">
        <Text className="font-bold text-foreground mb-4">By Payment Method</Text>
        {Object.entries(analytics.byPaymentMethod).map(([method, amount]) => (
          <View key={method} className="flex-row items-center justify-between mb-3">
            <Text className="text-foreground capitalize">{method}</Text>
            <Text className="text-foreground font-semibold">${amount}</Text>
          </View>
        ))}
      </View>

      {/* By Status */}
      <View className="bg-surface rounded-lg p-4 border border-border">
        <Text className="font-bold text-foreground mb-4">By Status</Text>
        {Object.entries(analytics.byStatus).map(([status, amount]) => (
          <View key={status} className="flex-row items-center justify-between mb-3">
            <Text className="text-foreground capitalize">{status}</Text>
            <Text className="text-foreground font-semibold">${amount}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * Disputes Tab Component
 */
function DisputesTab({ analytics, colors }: { analytics: DisputeAnalytics; colors: any }) {
  return (
    <View className="gap-4 mb-8">
      <MetricCard
        label="Total Disputes"
        value={analytics.totalDisputes.toString()}
        icon="🔧"
      />
      <MetricCard
        label="Open Disputes"
        value={analytics.openDisputes.toString()}
        icon="📋"
      />
      <MetricCard
        label="Resolved"
        value={analytics.resolvedDisputes.toString()}
        icon="✓"
      />
      <MetricCard
        label="Resolution Rate"
        value={`${analytics.resolutionRate}%`}
        icon="📊"
      />

      {/* By Type */}
      <View className="bg-surface rounded-lg p-4 border border-border">
        <Text className="font-bold text-foreground mb-4">By Type</Text>
        {Object.entries(analytics.byType).map(([type, count]) => (
          <View key={type} className="flex-row items-center justify-between mb-3">
            <Text className="text-foreground capitalize">{type.replace(/_/g, " ")}</Text>
            <Text className="text-foreground font-semibold">{count}</Text>
          </View>
        ))}
      </View>

      {/* By Severity */}
      <View className="bg-surface rounded-lg p-4 border border-border">
        <Text className="font-bold text-foreground mb-4">By Severity</Text>
        {Object.entries(analytics.bySeverity).map(([severity, count]) => (
          <View key={severity} className="flex-row items-center justify-between mb-3">
            <Text className="text-foreground capitalize">{severity}</Text>
            <Text className="text-foreground font-semibold">{count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * Metric Card Component
 */
function MetricCard({
  label,
  value,
  icon,
  trend,
}: {
  label: string;
  value: string;
  icon: string;
  trend?: string;
}) {
  return (
    <View className="bg-surface rounded-lg p-4 border border-border flex-row items-center justify-between">
      <View className="flex-1">
        <Text className="text-sm text-muted mb-1">{label}</Text>
        <View className="flex-row items-center gap-2">
          <Text className="text-2xl font-bold text-foreground">{value}</Text>
          {trend && (
            <Text className={cn("text-xs font-semibold", trend.includes("+") ? "text-success" : "text-muted")}>
              {trend}
            </Text>
          )}
        </View>
      </View>
      <Text className="text-3xl">{icon}</Text>
    </View>
  );
}
