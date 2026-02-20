import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Switch, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

/**
 * Driver Home Screen
 * Shows online status and available rides
 */

export default function DriverHomeScreen() {
  const colors = useColors();
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalRides: 1247,
    rating: 4.8,
    earnings: 2450.5,
    acceptanceRate: 98,
  });

  const handleToggleOnline = async () => {
    try {
      setLoading(true);
      // Mock: Toggle online status
      console.log("[DriverHome] Toggling online status:", !isOnline);
      // In production, call API: await api.driver.setOnlineStatus(!isOnline)
      setIsOnline(!isOnline);
    } catch (error) {
      console.error("[DriverHome] Failed to toggle online:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-3xl font-bold text-foreground">Welcome, Driver</Text>
              <Text className="text-base text-muted">Ready to earn?</Text>
            </View>
            <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center">
              <Text className="text-2xl">👤</Text>
            </View>
          </View>

          {/* Online Status Card */}
          <View className="bg-surface border border-border rounded-lg p-6 gap-4">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-sm font-semibold text-muted uppercase">Online Status</Text>
                <Text className="text-2xl font-bold text-foreground mt-2">
                  {isOnline ? "🟢 Online" : "🔴 Offline"}
                </Text>
              </View>
              <Switch
                value={isOnline}
                onValueChange={handleToggleOnline}
                disabled={loading}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>

            {isOnline && (
              <Text className="text-xs text-success">
                You're accepting rides. Requests will appear below.
              </Text>
            )}
          </View>

          {/* Stats Grid */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Today's Stats</Text>
            <View className="flex-row gap-3">
              <View className="flex-1 bg-surface border border-border rounded-lg p-4 gap-2">
                <Text className="text-xs text-muted">Earnings</Text>
                <Text className="text-xl font-bold text-primary">${stats.earnings}</Text>
              </View>
              <View className="flex-1 bg-surface border border-border rounded-lg p-4 gap-2">
                <Text className="text-xs text-muted">Rating</Text>
                <Text className="text-xl font-bold text-foreground">⭐ {stats.rating}</Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 bg-surface border border-border rounded-lg p-4 gap-2">
                <Text className="text-xs text-muted">Total Rides</Text>
                <Text className="text-xl font-bold text-foreground">{stats.totalRides}</Text>
              </View>
              <View className="flex-1 bg-surface border border-border rounded-lg p-4 gap-2">
                <Text className="text-xs text-muted">Acceptance</Text>
                <Text className="text-xl font-bold text-foreground">{stats.acceptanceRate}%</Text>
              </View>
            </View>
          </View>

          {/* Available Rides */}
          {isOnline && (
            <View className="gap-3">
              <Text className="text-sm font-semibold text-foreground">Available Rides</Text>

              {/* Ride Request Card */}
              <TouchableOpacity className="bg-primary/10 border border-primary rounded-lg p-4 gap-3 active:bg-primary/20">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-foreground font-semibold">Pickup Request</Text>
                    <Text className="text-xs text-muted mt-1">📍 123 Main St</Text>
                    <Text className="text-xs text-muted">📍 456 Oak Ave</Text>
                  </View>
                  <View className="items-end gap-1">
                    <Text className="text-lg font-bold text-primary">$12.50</Text>
                    <Text className="text-xs text-muted">~3.2 km</Text>
                  </View>
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity className="flex-1 bg-error/10 rounded-lg p-3 items-center">
                    <Text className="text-error font-semibold text-sm">Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 bg-success/10 rounded-lg p-3 items-center">
                    <Text className="text-success font-semibold text-sm">Accept</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {!isOnline && (
            <View className="bg-surface border border-border rounded-lg p-6 items-center gap-3 mt-auto">
              <Text className="text-2xl">😴</Text>
              <Text className="text-foreground font-semibold">Go Online to Start</Text>
              <Text className="text-sm text-muted text-center">
                Turn on your online status above to start receiving ride requests
              </Text>
            </View>
          )}

          {/* Quick Actions */}
          <View className="gap-2 mt-auto">
            <TouchableOpacity className="border border-border rounded-lg p-4 items-center">
              <Text className="text-foreground font-semibold">View Earnings</Text>
            </TouchableOpacity>
            <TouchableOpacity className="border border-border rounded-lg p-4 items-center">
              <Text className="text-foreground font-semibold">Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
