import { ScrollView, Text, View, Pressable, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

export default function RiderProfileScreen() {
  const colors = useColors();
  const { user, logout } = useAuth();
  const router = useRouter();
  const riderProfile = trpc.riders.getProfile.useQuery();

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Logout",
        onPress: async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          logout();
          router.replace("/role-select");
        },
      },
    ]);
  };

  const handleSwitchRole = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/role-select");
  };

  if (riderProfile.isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const profile = riderProfile.data;

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Profile</Text>
            <Text className="text-sm text-muted">Manage your rider account</Text>
          </View>

          {/* Profile Card */}
          <View className="bg-surface rounded-lg p-6 border border-border">
            <View className="items-center gap-4 mb-4">
              <View
                className="w-20 h-20 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-4xl">👤</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-foreground">{user?.name || "Rider"}</Text>
                <Text className="text-sm text-muted">{user?.email}</Text>
              </View>
            </View>

            <View className="border-t border-border pt-4">
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-sm text-muted">Rating</Text>
                <Text className="text-lg font-bold text-primary">⭐ {profile?.rating || "5.0"}</Text>
              </View>
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-sm text-muted">Total Rides</Text>
                <Text className="text-lg font-bold text-foreground">{profile?.totalRides || 0}</Text>
              </View>
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-sm text-muted">Payment Method</Text>
                <Text className="text-lg font-bold text-foreground">💵 Cash</Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View className="grid grid-cols-2 gap-3">
            <View className="bg-surface rounded-lg p-4 border border-border items-center">
              <Text className="text-2xl font-bold text-primary">4.9</Text>
              <Text className="text-xs text-muted text-center mt-1">Avg Rating</Text>
            </View>
            <View className="bg-surface rounded-lg p-4 border border-border items-center">
              <Text className="text-2xl font-bold text-success">0</Text>
              <Text className="text-xs text-muted text-center mt-1">Cancellations</Text>
            </View>
          </View>

          {/* Actions */}
          <View className="gap-3 mt-4">
            <Pressable
              onPress={handleSwitchRole}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <View className="bg-surface rounded-lg p-4 border border-border items-center">
                <Text className="text-base font-semibold text-primary">Switch to Driver Mode</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <View className="bg-error rounded-lg p-4 items-center">
                <Text className="text-base font-semibold text-white">Logout</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
