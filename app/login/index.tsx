import { ScrollView, Text, View, Pressable, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useEffect } from "react";

export default function LoginScreen() {
  const colors = useColors();
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace("/role-select");
    }
  }, [isAuthenticated, user]);

  const handleLogin = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Redirect to OAuth login - the server will handle the OAuth flow
      router.push("/oauth/callback");
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Login Error", "Failed to initiate login. Please try again.");
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-center gap-8">
          {/* Hero Section */}
          <View className="items-center gap-4">
            <View
              className="w-24 h-24 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-5xl">🚗</Text>
            </View>
            <View className="items-center gap-2">
              <Text className="text-4xl font-bold text-foreground">RideShare</Text>
              <Text className="text-base text-muted text-center">
                Your ride, your way. Anytime, anywhere.
              </Text>
            </View>
          </View>

          {/* Features */}
          <View className="gap-3">
            <View className="flex-row gap-3 items-start">
              <Text className="text-2xl">🚗</Text>
              <View className="flex-1">
                <Text className="font-semibold text-foreground">Request a Ride</Text>
                <Text className="text-sm text-muted">Get to your destination safely</Text>
              </View>
            </View>
            <View className="flex-row gap-3 items-start">
              <Text className="text-2xl">💵</Text>
              <View className="flex-1">
                <Text className="font-semibold text-foreground">Cash Payments</Text>
                <Text className="text-sm text-muted">Pay with cash, no cards needed</Text>
              </View>
            </View>
            <View className="flex-row gap-3 items-start">
              <Text className="text-2xl">💰</Text>
              <View className="flex-1">
                <Text className="font-semibold text-foreground">Earn Money</Text>
                <Text className="text-sm text-muted">Drive and earn on your schedule</Text>
              </View>
            </View>
          </View>

          {/* Login Button */}
          <Pressable
            onPress={handleLogin}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <View
              className="rounded-full py-4 items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white font-bold text-lg">Login with Manus</Text>
            </View>
          </Pressable>

          {/* Info */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-xs text-muted text-center">
              By logging in, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
