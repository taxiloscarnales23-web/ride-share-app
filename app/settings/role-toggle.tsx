import { ScrollView, Text, View, Pressable, Switch } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

type UserRole = "rider" | "driver";

export default function RoleToggleScreen() {
  const colors = useColors();
  const router = useRouter();
  const [currentRole, setCurrentRole] = useState<UserRole>("rider");
  const [isLoading, setIsLoading] = useState(true);

  // Load current role from storage
  useEffect(() => {
    const loadRole = async () => {
      try {
        const savedRole = await AsyncStorage.getItem("userRole");
        if (savedRole) {
          setCurrentRole(savedRole as UserRole);
        }
      } catch (error) {
        console.error("Failed to load role:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRole();
  }, []);

  // Toggle role
  const toggleRole = async () => {
    try {
      const newRole: UserRole = currentRole === "rider" ? "driver" : "rider";
      await AsyncStorage.setItem("userRole", newRole);
      setCurrentRole(newRole);

      // Navigate to appropriate home screen
      if (newRole === "rider") {
        router.replace("/rider/home");
      } else {
        router.replace("/driver/home");
      }
    } catch (error) {
      console.error("Failed to toggle role:", error);
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-foreground">Loading...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Role Settings</Text>
            <Text className="text-base text-muted">
              Switch between rider and driver modes for testing
            </Text>
          </View>

          {/* Current Role Card */}
          <View
            className="bg-surface rounded-2xl p-6 border border-border gap-4"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-sm font-semibold text-muted uppercase tracking-wide">
              Current Role
            </Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-foreground capitalize">
                {currentRole}
              </Text>
              <View
                className="px-4 py-2 rounded-full"
                style={{
                  backgroundColor:
                    currentRole === "rider"
                      ? colors.primary + "20"
                      : colors.success + "20",
                }}
              >
                <Text
                  className="font-semibold text-sm"
                  style={{
                    color: currentRole === "rider" ? colors.primary : colors.success,
                  }}
                >
                  {currentRole === "rider" ? "🚗 Rider" : "🚕 Driver"}
                </Text>
              </View>
            </View>
          </View>

          {/* Role Description */}
          <View className="gap-4">
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Rider Mode</Text>
              <Text className="text-sm text-muted leading-relaxed">
                Book rides, track drivers, make payments, and rate drivers. Perfect for
                testing the rider experience.
              </Text>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Driver Mode</Text>
              <Text className="text-sm text-muted leading-relaxed">
                Accept ride requests, navigate to pickups, complete rides, and earn money.
                Perfect for testing the driver experience.
              </Text>
            </View>
          </View>

          {/* Toggle Switch */}
          <View
            className="bg-surface rounded-2xl p-6 border border-border flex-row items-center justify-between"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-1 gap-1">
              <Text className="text-base font-semibold text-foreground">
                Switch to {currentRole === "rider" ? "Driver" : "Rider"} Mode
              </Text>
              <Text className="text-sm text-muted">
                This will reload the app with the new role
              </Text>
            </View>
            <Switch
              value={currentRole === "driver"}
              onValueChange={toggleRole}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>

          {/* Quick Action Buttons */}
          <View className="gap-3">
            <Pressable
              onPress={() => router.push("/rider/home")}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: colors.primary,
                },
                {
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                },
              ]}
            >
              <Text className="text-center font-semibold text-background">
                Go to Rider Home
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/driver/home")}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: colors.success,
                },
                {
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                },
              ]}
            >
              <Text className="text-center font-semibold text-background">
                Go to Driver Home
              </Text>
            </Pressable>
          </View>

          {/* Info Box */}
          <View
            className="rounded-xl p-4 gap-2"
            style={{ backgroundColor: colors.primary + "10" }}
          >
            <Text className="text-sm font-semibold text-foreground">💡 Testing Tip</Text>
            <Text className="text-sm text-muted leading-relaxed">
              Use this role toggle to quickly switch between rider and driver flows without
              restarting the app. Your preference is saved locally.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
