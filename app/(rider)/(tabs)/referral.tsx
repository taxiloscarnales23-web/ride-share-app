import { ScrollView, Text, View, Pressable, Alert, Share } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";

interface ReferralStats {
  totalReferred: number;
  totalEarned: string;
  pendingRewards: string;
  claimedRewards: string;
}

export default function ReferralScreen() {
  const colors = useColors();
  const [referralCode] = useState("RIDER2024XYZ");
  const [stats, setStats] = useState<ReferralStats>({
    totalReferred: 3,
    totalEarned: "$45.00",
    pendingRewards: "$15.00",
    claimedRewards: "$30.00",
  });

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(referralCode);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Copied", "Referral code copied to clipboard!");
  };

  const handleShareCode = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `Join me on RideShare! Use my referral code ${referralCode} to get $10 off your first ride. Download now!`,
        title: "Join RideShare",
      });
    } catch (error) {
      Alert.alert("Error", "Could not share referral code");
    }
  };

  const handleClaimRewards = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Rewards Claimed", "Your pending rewards have been added to your account!");
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Earn with Referrals</Text>
            <Text className="text-muted">Invite friends and earn rewards</Text>
          </View>

          {/* Referral Code Card */}
          <View className="bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary rounded-2xl p-6 gap-4">
            <View>
              <Text className="text-xs font-semibold text-primary mb-2">YOUR REFERRAL CODE</Text>
              <View className="bg-white rounded-lg px-4 py-3 flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-primary font-mono">{referralCode}</Text>
                <Pressable
                  onPress={handleCopyCode}
                  style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                >
                  <Text className="text-xl">📋</Text>
                </Pressable>
              </View>
            </View>

            {/* Share Button */}
            <Pressable
              onPress={handleShareCode}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <View
                className="rounded-lg py-3 items-center justify-center flex-row gap-2"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-lg">🔗</Text>
                <Text className="text-white font-bold">Share Code</Text>
              </View>
            </Pressable>
          </View>

          {/* Stats Grid */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Your Rewards</Text>
            <View className="flex-row gap-3">
              <View className="flex-1 bg-surface border border-border rounded-lg p-4">
                <Text className="text-xs text-muted mb-2">Total Referred</Text>
                <Text className="text-2xl font-bold text-primary">{stats.totalReferred}</Text>
              </View>
              <View className="flex-1 bg-surface border border-border rounded-lg p-4">
                <Text className="text-xs text-muted mb-2">Total Earned</Text>
                <Text className="text-2xl font-bold text-success">{stats.totalEarned}</Text>
              </View>
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1 bg-surface border border-border rounded-lg p-4">
                <Text className="text-xs text-muted mb-2">Pending</Text>
                <Text className="text-2xl font-bold text-warning">{stats.pendingRewards}</Text>
              </View>
              <View className="flex-1 bg-surface border border-border rounded-lg p-4">
                <Text className="text-xs text-muted mb-2">Claimed</Text>
                <Text className="text-2xl font-bold text-primary">{stats.claimedRewards}</Text>
              </View>
            </View>
          </View>

          {/* Claim Rewards Button */}
          {stats.pendingRewards !== "$0.00" && (
            <Pressable
              onPress={handleClaimRewards}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <View
                className="rounded-lg py-4 items-center justify-center"
                style={{ backgroundColor: colors.success }}
              >
                <Text className="text-white font-bold text-lg">Claim {stats.pendingRewards}</Text>
              </View>
            </Pressable>
          )}

          {/* How It Works */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">How It Works</Text>
            <View className="bg-surface rounded-lg p-4 gap-4">
              <View className="flex-row gap-3">
                <View
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-white font-bold">1</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-foreground">Share Your Code</Text>
                  <Text className="text-xs text-muted mt-1">
                    Share your referral code with friends
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <View
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-white font-bold">2</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-foreground">They Sign Up</Text>
                  <Text className="text-xs text-muted mt-1">
                    Friends use your code during registration
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <View
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-white font-bold">3</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-foreground">Earn Rewards</Text>
                  <Text className="text-xs text-muted mt-1">
                    Get $10 for each friend, they get $10 too
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Terms */}
          <View className="bg-primary/5 rounded-lg p-3">
            <Text className="text-xs text-muted text-center">
              Rewards are credited after your referred friend completes their first ride. Maximum 50 referrals per month.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
