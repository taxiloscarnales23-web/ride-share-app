import { ScrollView, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

export default function RoleSelectScreen() {
  const router = useRouter();
  const colors = useColors();

  const handleRiderPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/(rider)/(tabs)");
  };

  const handleDriverPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/(driver)/(tabs)");
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-center gap-8">
          {/* Header */}
          <View className="items-center gap-2 mb-8">
            <Text className="text-4xl font-bold text-foreground">RideShare</Text>
            <Text className="text-base text-muted text-center">
              Choose how you want to use RideShare
            </Text>
          </View>

          {/* Rider Option */}
          <Pressable
            onPress={handleRiderPress}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <View className="bg-surface rounded-2xl p-6 border border-border shadow-sm">
              <View className="items-center gap-4">
                <View
                  className="w-16 h-16 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-3xl">🚗</Text>
                </View>
                <View className="items-center gap-1">
                  <Text className="text-2xl font-bold text-foreground">Rider</Text>
                  <Text className="text-sm text-muted text-center">
                    Request a ride and get to your destination
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>

          {/* Driver Option */}
          <Pressable
            onPress={handleDriverPress}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <View className="bg-surface rounded-2xl p-6 border border-border shadow-sm">
              <View className="items-center gap-4">
                <View
                  className="w-16 h-16 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.warning }}
                >
                  <Text className="text-3xl">👨‍💼</Text>
                </View>
                <View className="items-center gap-1">
                  <Text className="text-2xl font-bold text-foreground">Driver</Text>
                  <Text className="text-sm text-muted text-center">
                    Earn money by giving rides
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>

          {/* Info Text */}
          <View className="mt-8 p-4 bg-surface rounded-lg border border-border">
            <Text className="text-xs text-muted text-center leading-relaxed">
              You can switch between rider and driver modes anytime from your profile settings.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
